import AVFoundation
import Darwin

final class GameAudioManager: NSObject, AVAudioPlayerDelegate {
    static let shared = GameAudioManager()

    private enum BoostedAudioKind {
        case bundle
        case remote
    }

    private var bgmPlayer: AVAudioPlayer?
    private var bgmVolume: Float = 0.3
    private var sfxPools: [String: [AVAudioPlayer]] = [:]
    private var sfxIndexes: [String: Int] = [:]
    private var bundleAudioPlayer: AVAudioPlayer?
    private var bundleAudioCompletion: ((Bool) -> Void)?
    private var remoteAudioPlayer: AVAudioPlayer?
    private var remoteAudioCompletion: ((Bool) -> Void)?
    private var boostedAudioEngine: AVAudioEngine?
    private var boostedAudioPlayerNode: AVAudioPlayerNode?
    private var boostedAudioFile: AVAudioFile?
    private var boostedAudioKind: BoostedAudioKind?
    private var boostedAudioCompletion: ((Bool) -> Void)?
    private var boostedAudioStopWorkItem: DispatchWorkItem?
    private let remoteAudioDataCache = NSCache<NSString, NSData>()
    private var recordingSessionActive = false
    private var webManagedRecordingSession = false
    private var allowBgmDuringRecording = false
    private var shouldResumeBgmAfterRecording = true
    private var sessionConfigured = false
    private var speechRecorder: AVAudioRecorder?
    private var speechCaptureURL: URL?
    private var speechCaptureCompletion: ((Result<[String: Any], Error>) -> Void)?
    private var speechCaptureTimer: Timer?
    private var speechCaptureStopWorkItem: DispatchWorkItem?
    private var speechCaptureStartedAt = Date()
    private var speechCaptureVoiceStartedAt: Date?
    private var speechCaptureLastVoiceAt: Date?
    private var speechCaptureMaxDurationMs = 10000
    private var speechCaptureNoVoiceTimeoutMs = 5000
    private var speechCaptureMinVoiceWindowMs = 2200
    private var speechCaptureSilenceMs = 1000
    private var speechCaptureTailBufferMs = 450
    private var speechCaptureMeterFrames = 0
    private var speechCaptureActiveFrames = 0
    private var speechCaptureLevelTotal: Double = 0
    private var speechCapturePeakLevel: Double = 0
    private var speechCaptureDetectedVoice = false
    private var speechCaptureLevelHandler: (([String: Any]) -> Void)?

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
        if webManagedRecordingSession {
            return
        }

        do {
            let session = AVAudioSession.sharedInstance()
            if recordingSessionActive {
                try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
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

    func prepareForRecording(resumeBgm: Bool, keepBgm: Bool = false, webManaged: Bool = false) {
        performOnMainSync {
            self.recordingSessionActive = true
            self.webManagedRecordingSession = webManaged
            self.allowBgmDuringRecording = keepBgm
            self.shouldResumeBgmAfterRecording = resumeBgm
            if !keepBgm {
                self.bgmPlayer?.pause()
            }
            self.stopBundleAudioLocked(completed: false)
            self.stopRemoteAudioLocked(completed: false)
            self.stopBoostedAudioLocked(completed: false)
            if webManaged {
                return
            }
            self.configureSession()
            if keepBgm && resumeBgm {
                self.startBgm()
            }
        }
    }

    func finishRecording(resumeBgm: Bool, keepBgm: Bool = false, webManaged: Bool = false) {
        performOnMainSync {
            let wasWebManaged = self.webManagedRecordingSession || webManaged
            self.recordingSessionActive = false
            let shouldResume = self.shouldResumeBgmAfterRecording && resumeBgm
            self.webManagedRecordingSession = false
            self.allowBgmDuringRecording = false
            self.shouldResumeBgmAfterRecording = true

            if wasWebManaged {
                if shouldResume {
                    self.startBgm()
                } else if !keepBgm {
                    self.bgmPlayer?.pause()
                }
                return
            }

            self.configureSession()
            if shouldResume {
                self.startBgm()
            } else if !keepBgm {
                self.bgmPlayer?.pause()
            }
        }
    }

    func startSpeechCapture(
        maxDurationMs: Int,
        noVoiceTimeoutMs: Int,
        minVoiceWindowMs: Int,
        silenceMs: Int,
        tailBufferMs: Int,
        resumeBgm: Bool,
        onLevel: (([String: Any]) -> Void)? = nil,
        completion: @escaping (Result<[String: Any], Error>) -> Void
    ) {
        DispatchQueue.main.async {
            guard self.speechRecorder == nil else {
                completion(.failure(self.makeError("Speech capture is already active.")))
                return
            }

            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                DispatchQueue.main.async {
                    guard granted else {
                        completion(.failure(self.makeError("Microphone permission was denied.")))
                        return
                    }

                    self.beginSpeechCapture(
                        maxDurationMs: maxDurationMs,
                        noVoiceTimeoutMs: noVoiceTimeoutMs,
                        minVoiceWindowMs: minVoiceWindowMs,
                        silenceMs: silenceMs,
                        tailBufferMs: tailBufferMs,
                        resumeBgm: resumeBgm,
                        onLevel: onLevel,
                        completion: completion
                    )
                }
            }
        }
    }

    func stopSpeechCapture(reason: String = "manual") {
        DispatchQueue.main.async {
            self.finishSpeechCapture(reason: reason)
        }
    }

    private func beginSpeechCapture(
        maxDurationMs: Int,
        noVoiceTimeoutMs: Int,
        minVoiceWindowMs: Int,
        silenceMs: Int,
        tailBufferMs: Int,
        resumeBgm: Bool,
        onLevel: (([String: Any]) -> Void)?,
        completion: @escaping (Result<[String: Any], Error>) -> Void
    ) {
        speechCaptureMaxDurationMs = max(1200, maxDurationMs)
        speechCaptureNoVoiceTimeoutMs = max(1200, noVoiceTimeoutMs)
        speechCaptureMinVoiceWindowMs = max(500, minVoiceWindowMs)
        speechCaptureSilenceMs = max(350, silenceMs)
        speechCaptureTailBufferMs = max(120, tailBufferMs)
        speechCaptureCompletion = completion
        speechCaptureStartedAt = Date()
        speechCaptureVoiceStartedAt = nil
        speechCaptureLastVoiceAt = nil
        speechCaptureMeterFrames = 0
        speechCaptureActiveFrames = 0
        speechCaptureLevelTotal = 0
        speechCapturePeakLevel = 0
        speechCaptureDetectedVoice = false
        speechCaptureLevelHandler = onLevel
        speechCaptureStopWorkItem?.cancel()
        speechCaptureStopWorkItem = nil

        recordingSessionActive = true
        webManagedRecordingSession = false
        allowBgmDuringRecording = true
        shouldResumeBgmAfterRecording = resumeBgm
        stopBundleAudioLocked(completed: false)
        stopRemoteAudioLocked(completed: false)
        stopBoostedAudioLocked(completed: false)
        configureSession()

        let fileName = "speech-capture-\(UUID().uuidString).wav"
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)
        speechCaptureURL = url

        let settings: [String: Any] = [
            AVFormatIDKey: kAudioFormatLinearPCM,
            AVSampleRateKey: 16000,
            AVNumberOfChannelsKey: 1,
            AVLinearPCMBitDepthKey: 16,
            AVLinearPCMIsFloatKey: false,
            AVLinearPCMIsBigEndianKey: false
        ]

        do {
            let recorder = try AVAudioRecorder(url: url, settings: settings)
            recorder.isMeteringEnabled = true
            recorder.prepareToRecord()
            guard recorder.record() else {
                throw makeError("Unable to start microphone recording.")
            }
            speechRecorder = recorder
            speechCaptureTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
                self?.pollSpeechCapture()
            }
        } catch {
            cleanupSpeechCaptureSession()
            completion(.failure(error))
        }
    }

    private func pollSpeechCapture() {
        guard let recorder = speechRecorder else { return }
        recorder.updateMeters()

        let averagePower = recorder.averagePower(forChannel: 0)
        let peakPower = recorder.peakPower(forChannel: 0)
        let level = max(0.0, min(1.0, pow(10.0, Double(averagePower) / 20.0)))
        let peakLevel = max(0.0, min(1.0, pow(10.0, Double(peakPower) / 20.0)))
        let averageCurve = max(0.0, min(1.0, (Double(averagePower) + 54.0) / 36.0))
        let peakCurve = max(0.0, min(1.0, (Double(peakPower) + 48.0) / 34.0))
        let meterLevel = max(averageCurve, peakCurve * 0.9)
        let now = Date()
        let elapsedMs = Int(now.timeIntervalSince(speechCaptureStartedAt) * 1000)

        speechCaptureMeterFrames += 1
        speechCaptureLevelTotal += level
        speechCapturePeakLevel = max(speechCapturePeakLevel, peakLevel)

        let voiceDetectedThisFrame = averagePower > -42 || peakPower > -34 || peakLevel > 0.018
        speechCaptureLevelHandler?([
            "level": meterLevel,
            "rawLevel": level,
            "peak": peakLevel,
            "averagePower": averagePower,
            "peakPower": peakPower,
            "elapsedMs": elapsedMs
        ])
        if voiceDetectedThisFrame {
            speechCaptureDetectedVoice = true
            speechCaptureActiveFrames += 1
            if speechCaptureVoiceStartedAt == nil {
                speechCaptureVoiceStartedAt = now
            }
            speechCaptureLastVoiceAt = now
            speechCaptureStopWorkItem?.cancel()
            speechCaptureStopWorkItem = nil
        }

        if !speechCaptureDetectedVoice && elapsedMs >= speechCaptureNoVoiceTimeoutMs {
            finishSpeechCapture(reason: "noVoice")
            return
        }

        if elapsedMs >= speechCaptureMaxDurationMs {
            finishSpeechCapture(reason: "maxDuration")
            return
        }

        guard
            speechCaptureDetectedVoice,
            let voiceStartedAt = speechCaptureVoiceStartedAt,
            let lastVoiceAt = speechCaptureLastVoiceAt
        else {
            return
        }

        let voiceWindowMs = Int(now.timeIntervalSince(voiceStartedAt) * 1000)
        let silenceMs = Int(now.timeIntervalSince(lastVoiceAt) * 1000)
        if voiceWindowMs >= speechCaptureMinVoiceWindowMs && silenceMs >= speechCaptureSilenceMs && speechCaptureStopWorkItem == nil {
            let stopWorkItem = DispatchWorkItem { [weak self] in
                self?.finishSpeechCapture(reason: "silence")
            }
            speechCaptureStopWorkItem = stopWorkItem
            DispatchQueue.main.asyncAfter(
                deadline: .now() + Double(speechCaptureTailBufferMs) / 1000.0,
                execute: stopWorkItem
            )
        }
    }

    private func finishSpeechCapture(reason: String) {
        guard let recorder = speechRecorder else { return }
        let completion = speechCaptureCompletion
        speechCaptureCompletion = nil
        speechCaptureTimer?.invalidate()
        speechCaptureTimer = nil
        speechCaptureStopWorkItem?.cancel()
        speechCaptureStopWorkItem = nil

        let durationMs = max(0, Int(recorder.currentTime * 1000))
        let url = speechCaptureURL
        recorder.stop()
        speechRecorder = nil

        let payload: [String: Any]
        do {
            let audioData = try url.map { try Data(contentsOf: $0) } ?? Data()
            payload = [
                "ok": true,
                "reason": reason,
                "mimeType": "audio/wav",
                "audioBase64": reason == "noVoice" ? "" : audioData.base64EncodedString(),
                "metrics": buildSpeechCaptureMetrics(durationMs: durationMs)
            ]
        } catch {
            cleanupSpeechCaptureSession()
            completion?(.failure(error))
            return
        }

        cleanupSpeechCaptureSession()
        completion?(.success(payload))
    }

    private func buildSpeechCaptureMetrics(durationMs: Int) -> [String: Any] {
        let frames = max(1, speechCaptureMeterFrames)
        let rms = speechCaptureLevelTotal / Double(frames)
        let activeRatio = Double(speechCaptureActiveFrames) / Double(frames)
        let volumeScore = min(100.0, max(0.0, rms / 0.055 * 100.0))
        let activityScore = min(100.0, max(0.0, activeRatio * 180.0))
        let hasVoice = speechCaptureDetectedVoice && durationMs >= 350
        let quality = hasVoice
            ? min(96, max(25, Int(round((volumeScore * 0.45) + (activityScore * 0.35) + 20.0))))
            : 0

        return [
            "sampleRate": 16000,
            "durationMs": durationMs,
            "rms": rms,
            "peak": speechCapturePeakLevel,
            "activeRatio": activeRatio,
            "hasVoice": hasVoice,
            "quality": quality
        ]
    }

    private func cleanupSpeechCaptureSession() {
        speechCaptureTimer?.invalidate()
        speechCaptureTimer = nil
        speechCaptureStopWorkItem?.cancel()
        speechCaptureStopWorkItem = nil
        if let recorder = speechRecorder {
            recorder.stop()
        }
        speechRecorder = nil
        speechCaptureCompletion = nil
        speechCaptureLevelHandler = nil

        if let url = speechCaptureURL {
            try? FileManager.default.removeItem(at: url)
        }
        speechCaptureURL = nil

        recordingSessionActive = false
        webManagedRecordingSession = false
        allowBgmDuringRecording = false
        let shouldResume = shouldResumeBgmAfterRecording
        shouldResumeBgmAfterRecording = true
        configureSession()
        if shouldResume {
            startBgm()
        } else {
            bgmPlayer?.pause()
        }
    }

    private func makeError(_ message: String) -> NSError {
        NSError(domain: "GameAudio", code: 2, userInfo: [NSLocalizedDescriptionKey: message])
    }

    func startBgm(completion: ((Bool) -> Void)? = nil) {
        DispatchQueue.main.async {
            guard !self.recordingSessionActive || self.allowBgmDuringRecording else {
                completion?(false)
                return
            }
            self.configureSession()
            if self.bgmPlayer == nil {
                guard let url = Bundle.main.url(forResource: "bgm_native", withExtension: "m4a", subdirectory: "sounds") else {
                    print("[GameAudio] BGM file not found")
                    completion?(false)
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
                    completion?(false)
                    return
                }
            }

            self.bgmPlayer?.volume = self.bgmVolume
            let started = self.bgmPlayer?.play() ?? false
            print(started ? "[GameAudio] BGM playing" : "[GameAudio] BGM play returned false")
            completion?(started)
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
            guard !self.recordingSessionActive || self.webManagedRecordingSession || self.allowBgmDuringRecording else { return }
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
                if volume > 1 {
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
                        self.startBoostedAudioLocked(url: url, volume: volume, kind: .bundle, completion: completion)
                    }
                    return
                }

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
                if volume > 1 {
                    let tempUrl = try self.writeRemoteAudioTempFile(data, cacheKey: cacheKey)
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
                        self.startBoostedAudioLocked(url: tempUrl, volume: volume, kind: .remote, completion: completion)
                    }
                    return
                }

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

    private func writeRemoteAudioTempFile(_ data: Data, cacheKey: String) throws -> URL {
        let pathExtension = URL(string: cacheKey)?.pathExtension ?? ""
        let ext = pathExtension.isEmpty ? "mp3" : pathExtension
        let fileName = "game-audio-\(String(cacheKey.hashValue, radix: 16)).\(ext)"
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)
        if !FileManager.default.fileExists(atPath: url.path) {
            try data.write(to: url, options: [.atomic])
        }
        return url
    }

    private func boostedGainDecibels(for volume: Float) -> Float {
        let safeVolume = min(3.0, max(1.0, volume))
        return min(9.5, max(0.0, 20.0 * Float(log10(Double(safeVolume)))))
    }

    private func startBoostedAudioLocked(
        url: URL,
        volume: Float,
        kind: BoostedAudioKind,
        completion: @escaping (Bool) -> Void
    ) {
        do {
            let file = try AVAudioFile(forReading: url)
            let engine = AVAudioEngine()
            let playerNode = AVAudioPlayerNode()
            let eq = AVAudioUnitEQ(numberOfBands: 1)
            eq.globalGain = boostedGainDecibels(for: volume)

            engine.attach(playerNode)
            engine.attach(eq)
            engine.connect(playerNode, to: eq, format: file.processingFormat)
            engine.connect(eq, to: engine.mainMixerNode, format: file.processingFormat)

            boostedAudioEngine = engine
            boostedAudioPlayerNode = playerNode
            boostedAudioFile = file
            boostedAudioKind = kind
            boostedAudioCompletion = completion
            boostedAudioStopWorkItem?.cancel()
            boostedAudioStopWorkItem = nil

            try engine.start()
            playerNode.scheduleFile(file, at: nil, completionHandler: nil)
            playerNode.play()

            let sampleRate = file.processingFormat.sampleRate
            let duration = sampleRate > 0 ? Double(file.length) / sampleRate : 0
            let stopDelay = max(0.35, duration + 0.35)
            let stopWorkItem = DispatchWorkItem { [weak self] in
                guard let self else { return }
                if self.boostedAudioKind == kind {
                    self.stopBoostedAudioLocked(kind: kind, completed: true)
                }
            }
            boostedAudioStopWorkItem = stopWorkItem
            DispatchQueue.main.asyncAfter(deadline: .now() + stopDelay, execute: stopWorkItem)
        } catch {
            print("[GameAudio] boosted audio failed: \(error)")
            if boostedAudioCompletion != nil && boostedAudioKind == kind {
                stopBoostedAudioLocked(kind: kind, completed: false)
            } else {
                completion(false)
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
        stopBoostedAudioLocked(kind: .bundle, completed: completed)
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
        stopBoostedAudioLocked(kind: .remote, completed: completed)
        completion?(completed)
    }

    private func stopBoostedAudioLocked(kind: BoostedAudioKind? = nil, completed: Bool) {
        guard let activeKind = boostedAudioKind, kind == nil || activeKind == kind else {
            return
        }

        let completion = boostedAudioCompletion
        boostedAudioCompletion = nil
        boostedAudioKind = nil
        boostedAudioStopWorkItem?.cancel()
        boostedAudioStopWorkItem = nil

        boostedAudioPlayerNode?.stop()
        boostedAudioEngine?.stop()
        boostedAudioPlayerNode = nil
        boostedAudioEngine = nil
        boostedAudioFile = nil

        completion?(completed)
    }

    func preloadSfx(assetId: String, fileName: String, volume: Float = 1, completion: ((Bool) -> Void)? = nil) {
        DispatchQueue.main.async {
            guard !self.recordingSessionActive || self.webManagedRecordingSession || self.allowBgmDuringRecording else {
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
                if !webManagedRecordingSession {
                    configureSession()
                }
            }
            return
        }

        if type == .ended {
            configureSession()
            startBgm()
        }
    }

    @objc private func handleAudioRouteChange(_ notification: Notification) {
        if webManagedRecordingSession {
            return
        }

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
