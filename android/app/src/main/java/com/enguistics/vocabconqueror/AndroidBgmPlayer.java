package com.enguistics.vocabconqueror;

import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.util.Log;

final class AndroidBgmPlayer {
    private static final String TAG = "AndroidBgmPlayer";
    private static MediaPlayer player;
    private static float volume = 0.7f;

    private AndroidBgmPlayer() {}

    static synchronized void start(Context context) {
        if (context == null) return;

        try {
            if (player == null) {
                AssetFileDescriptor afd = context.getApplicationContext().getAssets().openFd("bgm.mp3");
                MediaPlayer nextPlayer = new MediaPlayer();
                nextPlayer.setAudioAttributes(
                    new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_GAME)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build()
                );
                nextPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                afd.close();
                nextPlayer.setLooping(true);
                nextPlayer.setVolume(volume, volume);
                nextPlayer.prepare();
                player = nextPlayer;
            }

            if (!player.isPlaying()) {
                player.start();
                Log.i(TAG, "BGM started");
            }
        } catch (Exception error) {
            Log.w(TAG, "Unable to start BGM", error);
            release();
        }
    }

    static synchronized void pause() {
        try {
            if (player != null && player.isPlaying()) {
                player.pause();
                Log.i(TAG, "BGM paused");
            }
        } catch (Exception error) {
            Log.w(TAG, "Unable to pause BGM", error);
        }
    }

    static synchronized void setVolume(float nextVolume) {
        volume = Math.max(0f, Math.min(1f, nextVolume));
        if (player != null) {
            player.setVolume(volume, volume);
        }
        Log.i(TAG, "BGM volume set to " + volume);
    }

    static synchronized void release() {
        if (player != null) {
            try {
                player.release();
            } catch (Exception ignored) {}
            player = null;
        }
    }
}
