#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(GameAudioPlugin, "GameAudio",
           CAP_PLUGIN_METHOD(start, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(pauseBgm, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(prepareForRecording, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(finishRecording, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setBgmVolume, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(playSfx, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(playBundleAudio, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(playRemoteAudio, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(preloadRemoteAudio, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(stopBundleAudio, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(stopRemoteAudio, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(startSpeechCapture, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(stopSpeechCapture, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(preloadSfx, CAPPluginReturnPromise);
)
