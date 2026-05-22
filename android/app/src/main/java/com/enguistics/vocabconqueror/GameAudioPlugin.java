package com.enguistics.vocabconqueror;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "GameAudio")
public class GameAudioPlugin extends Plugin {
    @PluginMethod
    public void start(PluginCall call) {
        double volume = call.getDouble("bgmVolume", 0.3);
        boolean started = GameAudioManager.getInstance().startBgm(getContext(), (float) volume);
        call.resolve(new JSObject().put("started", started));
    }

    @PluginMethod
    public void pauseBgm(PluginCall call) {
        GameAudioManager.getInstance().pauseBgm();
        call.resolve();
    }

    @PluginMethod
    public void prepareForRecording(PluginCall call) {
        boolean resumeBgm = call.getBoolean("resumeBgm", true);
        GameAudioManager.getInstance().prepareForRecording(resumeBgm);
        call.resolve();
    }

    @PluginMethod
    public void finishRecording(PluginCall call) {
        boolean resumeBgm = call.getBoolean("resumeBgm", true);
        GameAudioManager.getInstance().finishRecording(getContext(), resumeBgm);
        call.resolve();
    }

    @PluginMethod
    public void setBgmVolume(PluginCall call) {
        double volume = call.getDouble("volume", 0.3);
        GameAudioManager.getInstance().setBgmVolume((float) volume);
        call.resolve();
    }

    @PluginMethod
    public void playBundleAudio(PluginCall call) {
        String relativePath = call.getString("relativePath", "");
        double volume = call.getDouble("volume", 1.0);
        if (relativePath.isEmpty()) {
            call.reject("Missing relativePath");
            return;
        }

        GameAudioManager.getInstance().playBundleAudio(getContext(), relativePath, (float) volume, played -> {
            JSObject result = new JSObject();
            result.put("played", played);
            call.resolve(result);
        });
    }

    @PluginMethod
    public void playRemoteAudio(PluginCall call) {
        String url = call.getString("url", "");
        double volume = call.getDouble("volume", 1.0);
        if (url.isEmpty()) {
            call.reject("Missing url");
            return;
        }

        GameAudioManager.getInstance().playRemoteAudio(getContext(), url, (float) volume, played -> {
            JSObject result = new JSObject();
            result.put("played", played);
            call.resolve(result);
        });
    }

    @PluginMethod
    public void preloadRemoteAudio(PluginCall call) {
        String url = call.getString("url", "");
        if (url.isEmpty()) {
            call.reject("Missing url");
            return;
        }

        GameAudioManager.getInstance().preloadRemoteAudio(getContext(), url, preloaded -> {
            JSObject result = new JSObject();
            result.put("preloaded", preloaded);
            call.resolve(result);
        });
    }

    @PluginMethod
    public void stopBundleAudio(PluginCall call) {
        GameAudioManager.getInstance().stopBundleAudio();
        call.resolve();
    }

    @PluginMethod
    public void stopRemoteAudio(PluginCall call) {
        GameAudioManager.getInstance().stopRemoteAudio();
        call.resolve();
    }

    @PluginMethod
    public void playSfx(PluginCall call) {
        String fileName = call.getString("fileName", "");
        double volume = call.getDouble("volume", 1.0);
        if (fileName.isEmpty()) {
            call.reject("Missing fileName");
            return;
        }

        GameAudioManager.getInstance().playSfx(getContext(), fileName, (float) volume);
        call.resolve(new JSObject().put("played", true));
    }

    @PluginMethod
    public void preloadSfx(PluginCall call) {
        String fileName = call.getString("fileName", "");
        if (fileName.isEmpty()) {
            call.reject("Missing fileName");
            return;
        }

        GameAudioManager.getInstance().preloadSfx(getContext(), fileName, preloaded -> {
            JSObject result = new JSObject();
            result.put("preloaded", preloaded);
            call.resolve(result);
        });
    }
}
