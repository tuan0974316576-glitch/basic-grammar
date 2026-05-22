package com.enguistics.vocabconqueror;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AndroidBgm")
public class AndroidBgmPlugin extends Plugin {
    @PluginMethod
    public void start(PluginCall call) {
        boolean started = AndroidBgmPlayer.start(getContext());
        call.resolve(new JSObject().put("started", started));
    }

    @PluginMethod
    public void pause(PluginCall call) {
        AndroidBgmPlayer.pause();
        call.resolve();
    }

    @PluginMethod
    public void setVolume(PluginCall call) {
        double volume = call.getDouble("volume", 0.3);
        AndroidBgmPlayer.setVolume((float) volume);
        call.resolve();
    }
}
