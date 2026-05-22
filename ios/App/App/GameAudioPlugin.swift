import Capacitor

@objc(GameAudioPlugin)
public class GameAudioPlugin: CAPPlugin {
    @objc func start(_ call: CAPPluginCall) {
        if let volume = call.getFloat("bgmVolume") {
            GameAudioManager.shared.setBgmVolume(volume)
        }
        GameAudioManager.shared.startBgm { started in
            call.resolve(["started": started])
        }
    }

    @objc func pauseBgm(_ call: CAPPluginCall) {
        GameAudioManager.shared.pauseBgm()
        call.resolve()
    }

    @objc func prepareForRecording(_ call: CAPPluginCall) {
        let resumeBgm = call.getBool("resumeBgm") ?? true
        let keepBgm = call.getBool("keepBgm") ?? false
        let webManaged = call.getBool("webManaged") ?? false
        GameAudioManager.shared.prepareForRecording(resumeBgm: resumeBgm, keepBgm: keepBgm, webManaged: webManaged)
        call.resolve()
    }

    @objc func finishRecording(_ call: CAPPluginCall) {
        let resumeBgm = call.getBool("resumeBgm") ?? true
        let keepBgm = call.getBool("keepBgm") ?? false
        let webManaged = call.getBool("webManaged") ?? false
        GameAudioManager.shared.finishRecording(resumeBgm: resumeBgm, keepBgm: keepBgm, webManaged: webManaged)
        call.resolve()
    }

    @objc func setBgmVolume(_ call: CAPPluginCall) {
        let volume = call.getFloat("volume") ?? 0.3
        GameAudioManager.shared.setBgmVolume(volume)
        call.resolve()
    }

    @objc func playSfx(_ call: CAPPluginCall) {
        guard let assetId = call.getString("assetId"), let fileName = call.getString("fileName") else {
            call.reject("Missing assetId or fileName")
            return
        }

        let volume = call.getFloat("volume") ?? 1
        GameAudioManager.shared.playSfx(assetId: assetId, fileName: fileName, volume: volume)
        call.resolve()
    }

    @objc func playBundleAudio(_ call: CAPPluginCall) {
        guard let relativePath = call.getString("relativePath") else {
            call.reject("Missing relativePath")
            return
        }

        let volume = call.getFloat("volume") ?? 1
        GameAudioManager.shared.playBundleAudio(relativePath: relativePath, volume: volume) { played in
            call.resolve(["played": played])
        }
    }

    @objc func playRemoteAudio(_ call: CAPPluginCall) {
        guard let url = call.getString("url") else {
            call.reject("Missing url")
            return
        }

        let volume = call.getFloat("volume") ?? 1
        GameAudioManager.shared.playRemoteAudio(urlString: url, volume: volume) { played in
            call.resolve(["played": played])
        }
    }

    @objc func preloadRemoteAudio(_ call: CAPPluginCall) {
        guard let url = call.getString("url") else {
            call.reject("Missing url")
            return
        }

        GameAudioManager.shared.preloadRemoteAudio(urlString: url) { preloaded in
            call.resolve(["preloaded": preloaded])
        }
    }

    @objc func stopBundleAudio(_ call: CAPPluginCall) {
        GameAudioManager.shared.stopBundleAudio()
        call.resolve()
    }

    @objc func stopRemoteAudio(_ call: CAPPluginCall) {
        GameAudioManager.shared.stopRemoteAudio()
        call.resolve()
    }

    @objc func startSpeechCapture(_ call: CAPPluginCall) {
        let maxDurationMs = call.getInt("maxDurationMs") ?? 10000
        let noVoiceTimeoutMs = call.getInt("noVoiceTimeoutMs") ?? 5000
        let minVoiceWindowMs = call.getInt("minVoiceWindowMs") ?? 2200
        let silenceMs = call.getInt("silenceMs") ?? 1000
        let tailBufferMs = call.getInt("tailBufferMs") ?? 450
        let resumeBgm = call.getBool("resumeBgm") ?? true

        GameAudioManager.shared.startSpeechCapture(
            maxDurationMs: maxDurationMs,
            noVoiceTimeoutMs: noVoiceTimeoutMs,
            minVoiceWindowMs: minVoiceWindowMs,
            silenceMs: silenceMs,
            tailBufferMs: tailBufferMs,
            resumeBgm: resumeBgm,
            onLevel: { [weak self] payload in
                self?.notifyListeners("speechCaptureLevel", data: payload)
            }
        ) { result in
            switch result {
            case .success(let payload):
                call.resolve(payload)
            case .failure(let error):
                call.reject(error.localizedDescription, nil, error)
            }
        }
    }

    @objc func stopSpeechCapture(_ call: CAPPluginCall) {
        let reason = call.getString("reason") ?? "manual"
        GameAudioManager.shared.stopSpeechCapture(reason: reason)
        call.resolve(["stopping": true])
    }

    @objc func preloadSfx(_ call: CAPPluginCall) {
        guard let assetId = call.getString("assetId"), let fileName = call.getString("fileName") else {
            call.reject("Missing assetId or fileName")
            return
        }

        let volume = call.getFloat("volume") ?? 1
        GameAudioManager.shared.preloadSfx(assetId: assetId, fileName: fileName, volume: volume) { preloaded in
            call.resolve(["preloaded": preloaded])
        }
    }
}
