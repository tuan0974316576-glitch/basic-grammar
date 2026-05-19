import AVFoundation

final class GameAudioManager: NSObject, AVAudioPlayerDelegate {
    static let shared = GameAudioManager()

    private var bgmPlayer: AVAudioPlayer?
    private var bgmVolume: Float = 0.3
    private var sfxPools: [String: [AVAudioPlayer]] = [:]
    private var sfxIndexes: [String: Int] = [:]
    private var bundleAudioPlayer: AVAudioPlayer?
    private var bundleAudioCompletion: ((Bool) -> Void)?
    private var remoteAudioPlayer: AVAudioPlayer?
    private var remoteAudioCompletion: ((Bool) -> Void)?
    private let remoteAudioDataCache = NSCache<NSString, NSData>()
    private var recordingSessionActive = false
    private var shouldResumeBgmAfterRecording = true
    private var sessionConfigured = false

    private override init() {
        super.init()
        remoteAudioDataCache.countLimit = 96
        remoteAudioDataCache.totalCostLimit = 24 * 1024 * 1024
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAudioSessionInterruption(_:)),
            name: AVAudioSession.interruptionNotification,
            object: AVAudioSession.sharedInstance()
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAudioRouteChange(_:)),
            name: AVAudioSession.routeChangeNotification,
            object: AVAudioSession.sharedInstance()
        )
    }

    private func performOnMainSync(_ work: () -> Void) {
        if Thread.isMainThread {
            work()
        } else {
            DispatchQueue.main.sync(execute: work)
        }
    }

    func configureSession() {
        do {
            let session = AVAudioSession.sharedInstance()
            if recordingSessionActive {
                try session.setCategory(.playAndRecord, mode: .measurement, options: [.defaultToSpeaker])
            } else {
                try session.setCategory(.playback, mode: .default, options: [])
            }
            try session.setActive(true)
            sessionConfigured = true
        } catch {
            sessionConfigured = false
            print("[GameAudio] session failed: \(error)")
        }
    }

    func prepareForRecording(resumeBgm: Bool) {
        performOnMainSync {
            self.recordingSessionActive = true
            self.shouldResumeBgmAfterRecording = resumeBgm
            self.bgmPlayer?.pause()
            self.configureSession()
        }
    }

    func finishRecording(resumeBgm: Bool) {
        performOnMainSync {
            self.recordingSessionActive = false
            let shouldResume = self.shouldResumeBgmAfterRecording && resumeBgm
            self.shouldResumeBgmAfterRecording = true
            self.configureSession()
            if shouldResume {
                self.startBgm()
            }
        }
    }

    func startBgm() {
        DispatchQueue.main.async {
            guard !self.recordingSessionActive else { return }
            self.configureSession()
            if self.bgmPlayer == nil {
                guard let url = Bundle.main.url(forResource: "bgm_native", withExtension: "m4a", subdirectory: "sounds") else {
                    print("[GameAudio] BGM file not found")
                    return
                }

                do {
                    let player = try AVAudioPlayer(contentsOf: url)
                    player.numberOfLoops = -1
                    player.volume = self.bgmVolume
                    player.prepareToPlay()
                    self.bgmPlayer = player
                } catch {
                    print("[GameAudio] BGM load failed: \(error)")
                    return
                }
            }

            self.bgmPlayer?.volume = self.bgmVolume
            self.bgmPlayer?.play()
            print("[GameAudio] BGM playing")
        }
    }

    func pauseBgm() {
        DispatchQueue.main.async {
            self.bgmPlayer?.pause()
        }
    }

    func setBgmVolume(_ volume: Float) {
        DispatchQueue.main.async {
            self.bgmVolume = min(1, max(0, volume))
            self.bgmPlayer?.volume = self.bgmVolume
        }
    }

    func playSfx(assetId: String, fileName: String, volume: Float) {
        DispatchQueue.main.async {
            guard !self.recordingSessionActive else { return }
            if !self.sessionConfigured {
                self.configureSession()
            }
            do {
                let pool = try self.pool(for: assetId, fileName: fileName)
                guard !pool.isEmpty else { return }

                let index = self.sfxIndexes[assetId, default: 0] % pool.count
                let player = pool[index]
                if player.isPlaying {
                    player.stop()
                }
                player.currentTime = 0
                player.volume = min(1, max(0, volume))
                player.play()
                self.sfxIndexes[assetId] = (index + 1) % pool.count
            } catch {
                print("[GameAudio] SFX failed \(assetId): \(error)")
            }
        }
    }

    func playBundleAudio(relativePath: String, volume: Float, completion: @escaping (Bool) -> Void) {
        let safePath = relativePath
            .split(separator: "/")
            .map(String.init)
            .filter { !$0.isEmpty && $0 != "." && $0 != ".." }
            .joined(separator: "/")

        guard !safePath.isEmpty else {
            completion(false)
            return
        }

        DispatchQueue.global(qos: .userInitiated).async {
            let bundleRoot = Bundle.main.bundleURL
            let url = bundleRoot.appendingPathComponent(safePath, isDirectory: false)
            guard FileManager.default.fileExists(atPath: url.path) else {
                print("[GameAudio] bundled audio missing: \(safePath)")
                DispatchQueue.main.async { completion(false) }
                return
            }

            do {
                let player = try AVAudioPlayer(contentsOf: url)
                player.prepareToPlay()

                DispatchQueue.main.async {
                    guard !self.recordingSessionActive else {
                        completion(false)
                        return
                    }

                    if !self.sessionConfigured {
                        self.configureSession()
                    }

                    self.stopBundleAudioLocked(completed: false)
                    self.stopRemoteAudioLocked(completed: false)
                    player.delegate = self
                    player.volume = min(1, max(0, volume))
                    self.bundleAudioPlayer = player
                    self.bundleAudioCompletion = completion

                    if !player.play() {
                        self.stopBundleAudioLocked(completed: false)
                    }
                }
            } catch {
                print("[GameAudio] bundled audio failed \(safePath): \(error)")
                DispatchQueue.main.async { completion(false) }
            }
        }
    }

    func playRemoteAudio(urlString: String, volume: Float, completion: @escaping (Bool) -> Void) {
        guard let url = URL(string: urlString), ["http", "https"].contains(url.scheme?.lowercased() ?? "") else {
            completion(false)
            return
        }

        preloadRemoteAudio(urlString: urlString) { [weak self] loaded in
            guard loaded, let self = self else {
                completion(false)
                return
            }
            guard let data = self.remoteAudioDataCache.object(forKey: urlString as NSString) as Data? else {
                completion(false)
                return
            }
            self.playRemoteAudioData(data, cacheKey: urlString, volume: volume, completion: completion)
        }
    }

    func preloadRemoteAudio(urlString: String, completion: @escaping (Bool) -> Void) {
        guard let url = URL(string: urlString), ["http", "https"].contains(url.scheme?.lowercased() ?? "") else {
            completion(false)
            return
        }

        if remoteAudioDataCache.object(forKey: urlString as NSString) != nil {
            completion(true)
            return
        }

        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            if let error {
                print("[GameAudio] remote audio download failed: \(error)")
                DispatchQueue.main.async { completion(false) }
                return
            }

            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode >= 400 {
                print("[GameAudio] remote audio HTTP \(httpResponse.statusCode): \(urlString)")
                DispatchQueue.main.async { completion(false) }
                return
            }

            guard let data, !data.isEmpty else {
                print("[GameAudio] remote audio empty: \(urlString)")
                DispatchQueue.main.async { completion(false) }
                return
            }

            self?.remoteAudioDataCache.setObject(data as NSData, forKey: urlString as NSString, cost: data.count)
            DispatchQueue.main.async { completion(true) }
        }.resume()
    }

    private func playRemoteAudioData(_ data: Data, cacheKey: String, volume: Float, completion: @escaping (Bool) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let player = try AVAudioPlayer(data: data)
                player.prepareToPlay()

                DispatchQueue.main.async {
                    guard !self.recordingSessionActive else {
                        completion(false)
                        return
                    }

                    if !self.sessionConfigured {
                        self.configureSession()
                    }

                    self.stopBundleAudioLocked(completed: false)
                    self.stopRemoteAudioLocked(completed: false)
                    player.delegate = self
                    player.volume = min(1, max(0, volume))
                    self.remoteAudioPlayer = player
                    self.remoteAudioCompletion = completion

                    if !player.play() {
                        self.stopRemoteAudioLocked(completed: false)
                    }
                }
            } catch {
                print("[GameAudio] remote audio decode failed \(cacheKey): \(error)")
                DispatchQueue.main.async { completion(false) }
            }
        }
    }

    func stopBundleAudio() {
        DispatchQueue.main.async {
            self.stopBundleAudioLocked(completed: false)
            self.stopRemoteAudioLocked(completed: false)
        }
    }

    private func stopBundleAudioLocked(completed: Bool) {
        let completion = bundleAudioCompletion
        bundleAudioCompletion = nil
        if let player = bundleAudioPlayer {
            player.stop()
            player.delegate = nil
        }
        bundleAudioPlayer = nil
        completion?(completed)
    }

    func stopRemoteAudio() {
        DispatchQueue.main.async {
            self.stopRemoteAudioLocked(completed: false)
        }
    }

    private func stopRemoteAudioLocked(completed: Bool) {
        let completion = remoteAudioCompletion
        remoteAudioCompletion = nil
        if let player = remoteAudioPlayer {
            player.stop()
            player.delegate = nil
        }
        remoteAudioPlayer = nil
        completion?(completed)
    }

    func preloadSfx(assetId: String, fileName: String, volume: Float = 1, completion: ((Bool) -> Void)? = nil) {
        DispatchQueue.main.async {
            guard !self.recordingSessionActive else {
                completion?(false)
                return
            }
            if !self.sessionConfigured {
                self.configureSession()
            }
            do {
                _ = try self.pool(for: assetId, fileName: fileName)
                completion?(true)
            } catch {
                print("[GameAudio] SFX preload failed \(assetId): \(error)")
                completion?(false)
            }
        }
    }

    private func pool(for assetId: String, fileName: String) throws -> [AVAudioPlayer] {
        if let pool = sfxPools[assetId] {
            return pool
        }

        let parts = splitFileName(fileName)
        guard let url = Bundle.main.url(forResource: parts.name, withExtension: parts.ext, subdirectory: "sounds") else {
            throw NSError(domain: "GameAudio", code: 1, userInfo: [NSLocalizedDescriptionKey: "Missing \(fileName)"])
        }

        var pool: [AVAudioPlayer] = []
        for _ in 0..<4 {
            let player = try AVAudioPlayer(contentsOf: url)
            player.delegate = self
            player.prepareToPlay()
            pool.append(player)
        }

        sfxPools[assetId] = pool
        sfxIndexes[assetId] = 0
        return pool
    }

    private func splitFileName(_ fileName: String) -> (name: String, ext: String) {
        let url = URL(fileURLWithPath: fileName)
        return (url.deletingPathExtension().lastPathComponent, url.pathExtension)
    }

    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        if player === bundleAudioPlayer {
            stopBundleAudioLocked(completed: flag)
        } else if player === remoteAudioPlayer {
            stopRemoteAudioLocked(completed: flag)
        }
    }

    func audioPlayerDecodeErrorDidOccur(_ player: AVAudioPlayer, error: Error?) {
        if player === bundleAudioPlayer {
            if let error {
                print("[GameAudio] bundled audio decode failed: \(error)")
            }
            stopBundleAudioLocked(completed: false)
        } else if player === remoteAudioPlayer {
            if let error {
                print("[GameAudio] remote audio decode failed: \(error)")
            }
            stopRemoteAudioLocked(completed: false)
        }
    }

    @objc private func handleAudioSessionInterruption(_ notification: Notification) {
        guard
            let info = notification.userInfo,
            let rawType = info[AVAudioSessionInterruptionTypeKey] as? UInt,
            let type = AVAudioSession.InterruptionType(rawValue: rawType)
        else {
            return
        }

        if recordingSessionActive {
            if type == .ended {
                configureSession()
            }
            return
        }

        if type == .ended {
            configureSession()
            startBgm()
        }
    }

    @objc private func handleAudioRouteChange(_ notification: Notification) {
        if recordingSessionActive {
            configureSession()
            return
        }

        configureSession()
        if bgmPlayer?.isPlaying != true {
            startBgm()
        }
    }
}
