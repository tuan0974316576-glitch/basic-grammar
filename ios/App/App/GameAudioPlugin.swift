import Capacitor

@objc(GameAudioPlugin)
public class GameAudioPlugin: CAPPlugin {
    @objc func start(_ call: CAPPluginCall) {
        if let volume = call.getFloat("bgmVolume") {
            GameAudioManager.shared.setBgmVolume(volume)
        }
        GameAudioManager.shared.startBgm()
        call.resolve()
    }

    @objc func pauseBgm(_ call: CAPPluginCall) {
        GameAudioManager.shared.pauseBgm()
        call.resolve()
    }

    @objc func prepareForRecording(_ call: CAPPluginCall) {
        let resumeBgm = call.getBool("resumeBgm") ?? true
        GameAudioManager.shared.prepareForRecording(resumeBgm: resumeBgm)
        call.resolve()
    }

    @objc func finishRecording(_ call: CAPPluginCall) {
        let resumeBgm = call.getBool("resumeBgm") ?? true
        GameAudioManager.shared.finishRecording(resumeBgm: resumeBgm)
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
