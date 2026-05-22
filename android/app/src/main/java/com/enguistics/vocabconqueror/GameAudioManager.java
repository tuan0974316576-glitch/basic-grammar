package com.enguistics.vocabconqueror;

import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.media.audiofx.LoudnessEnhancer;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

final class GameAudioManager {
    interface Completion {
        void complete(boolean ok);
    }

    private static final String TAG = "GameAudioManager";
    private static final GameAudioManager INSTANCE = new GameAudioManager();

    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private MediaPlayer bundleAudioPlayer;
    private MediaPlayer remoteAudioPlayer;
    private LoudnessEnhancer bundleLoudnessEnhancer;
    private LoudnessEnhancer remoteLoudnessEnhancer;
    private Completion bundleCompletion;
    private Completion remoteCompletion;
    private final AtomicInteger remoteGeneration = new AtomicInteger(0);
    private boolean recordingSessionActive = false;
    private boolean shouldResumeBgmAfterRecording = true;

    private GameAudioManager() {}

    static GameAudioManager getInstance() {
        return INSTANCE;
    }

    boolean startBgm(Context context, float bgmVolume) {
        AndroidBgmPlayer.setVolume(bgmVolume);
        return AndroidBgmPlayer.start(context);
    }

    void pauseBgm() {
        AndroidBgmPlayer.pause();
    }

    void setBgmVolume(float volume) {
        AndroidBgmPlayer.setVolume(volume);
    }

    void prepareForRecording(boolean resumeBgm) {
        mainHandler.post(() -> {
            recordingSessionActive = true;
            shouldResumeBgmAfterRecording = resumeBgm;
            AndroidBgmPlayer.pause();
            stopBundleAudioLocked(false);
            stopRemoteAudioLocked(false);
        });
    }

    void finishRecording(Context context, boolean resumeBgm) {
        mainHandler.post(() -> {
            recordingSessionActive = false;
            boolean shouldResume = shouldResumeBgmAfterRecording && resumeBgm;
            shouldResumeBgmAfterRecording = true;
            if (shouldResume) {
                AndroidBgmPlayer.start(context);
            }
        });
    }

    void playBundleAudio(Context context, String relativePath, float volume, Completion completion) {
        String safePath = sanitizeAssetPath(relativePath);
        if (safePath.isEmpty()) {
            completion.complete(false);
            return;
        }

        mainHandler.post(() -> {
            if (recordingSessionActive) {
                completion.complete(false);
                return;
            }

            try {
                AssetFileDescriptor afd = context.getApplicationContext().getAssets().openFd(safePath);
                MediaPlayer player = createMediaPlayer();
                player.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                afd.close();
                prepareAndPlayBundlePlayer(player, volume, completion);
            } catch (Exception error) {
                Log.w(TAG, "Bundle audio failed: " + safePath, error);
                completion.complete(false);
            }
        });
    }

    void playRemoteAudio(Context context, String urlString, float volume, Completion completion) {
        if (!isHttpUrl(urlString)) {
            completion.complete(false);
            return;
        }

        int generation = remoteGeneration.incrementAndGet();
        executor.execute(() -> {
            File audioFile = getOrDownloadRemoteAudio(context.getApplicationContext(), urlString);
            mainHandler.post(() -> {
                if (
                    generation != remoteGeneration.get() ||
                    recordingSessionActive ||
                    audioFile == null ||
                    !audioFile.exists()
                ) {
                    completion.complete(false);
                    return;
                }

                try {
                    MediaPlayer player = createMediaPlayer();
                    player.setDataSource(audioFile.getAbsolutePath());
                    prepareAndPlayRemotePlayer(player, volume, completion);
                } catch (Exception error) {
                    Log.w(TAG, "Remote audio failed: " + urlString, error);
                    completion.complete(false);
                }
            });
        });
    }

    void preloadRemoteAudio(Context context, String urlString, Completion completion) {
        if (!isHttpUrl(urlString)) {
            completion.complete(false);
            return;
        }

        executor.execute(() -> {
            File audioFile = getOrDownloadRemoteAudio(context.getApplicationContext(), urlString);
            mainHandler.post(() -> completion.complete(audioFile != null && audioFile.exists()));
        });
    }

    void stopBundleAudio() {
        mainHandler.post(() -> stopBundleAudioLocked(false));
    }

    void stopRemoteAudio() {
        remoteGeneration.incrementAndGet();
        mainHandler.post(() -> stopRemoteAudioLocked(false));
    }

    void playSfx(Context context, String fileName, float volume) {
        playBundleAudio(context, fileName, volume, ignored -> {});
    }

    void preloadSfx(Context context, String fileName, Completion completion) {
        String safePath = sanitizeAssetPath(fileName);
        if (safePath.isEmpty()) {
            completion.complete(false);
            return;
        }

        executor.execute(() -> {
            boolean exists;
            try {
                AssetFileDescriptor afd = context.getApplicationContext().getAssets().openFd(safePath);
                afd.close();
                exists = true;
            } catch (Exception error) {
                exists = false;
            }
            boolean finalExists = exists;
            mainHandler.post(() -> completion.complete(finalExists));
        });
    }

    private MediaPlayer createMediaPlayer() {
        MediaPlayer player = new MediaPlayer();
        player.setAudioAttributes(
            new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build()
        );
        return player;
    }

    private void prepareAndPlayBundlePlayer(MediaPlayer player, float volume, Completion completion) throws Exception {
        stopBundleAudioLocked(false);
        stopRemoteAudioLocked(false);
        bundleAudioPlayer = player;
        bundleCompletion = completion;
        prepareAndStart(player, volume, true);
    }

    private void prepareAndPlayRemotePlayer(MediaPlayer player, float volume, Completion completion) throws Exception {
        stopBundleAudioLocked(false);
        stopRemoteAudioLocked(false);
        remoteAudioPlayer = player;
        remoteCompletion = completion;
        prepareAndStart(player, volume, false);
    }

    private void prepareAndStart(MediaPlayer player, float volume, boolean bundle) throws Exception {
        float clampedVolume = Math.max(0f, Math.min(1f, volume));
        player.setVolume(clampedVolume, clampedVolume);
        applyVoiceBoost(player, volume, bundle);
        player.setOnCompletionListener(completedPlayer -> {
            if (bundle) {
                stopBundleAudioLocked(true);
            } else {
                stopRemoteAudioLocked(true);
            }
        });
        player.setOnErrorListener((erroredPlayer, what, extra) -> {
            Log.w(TAG, "Audio player error what=" + what + " extra=" + extra);
            if (bundle) {
                stopBundleAudioLocked(false);
            } else {
                stopRemoteAudioLocked(false);
            }
            return true;
        });
        player.prepare();
        player.start();
    }

    private void applyVoiceBoost(MediaPlayer player, float volume, boolean bundle) {
        if (volume <= 1f) {
            return;
        }

        try {
            LoudnessEnhancer enhancer = new LoudnessEnhancer(player.getAudioSessionId());
            int targetGainMb = Math.min(950, Math.max(0, Math.round(2000f * (float) Math.log10(Math.min(3.0f, volume)))));
            enhancer.setTargetGain(targetGainMb);
            enhancer.setEnabled(true);

            if (bundle) {
                releaseBundleLoudnessEnhancer();
                bundleLoudnessEnhancer = enhancer;
            } else {
                releaseRemoteLoudnessEnhancer();
                remoteLoudnessEnhancer = enhancer;
            }
        } catch (Exception error) {
            Log.w(TAG, "Voice boost unavailable", error);
        }
    }

    private void releaseBundleLoudnessEnhancer() {
        if (bundleLoudnessEnhancer == null) return;
        try {
            bundleLoudnessEnhancer.setEnabled(false);
        } catch (Exception ignored) {}
        try {
            bundleLoudnessEnhancer.release();
        } catch (Exception ignored) {}
        bundleLoudnessEnhancer = null;
    }

    private void releaseRemoteLoudnessEnhancer() {
        if (remoteLoudnessEnhancer == null) return;
        try {
            remoteLoudnessEnhancer.setEnabled(false);
        } catch (Exception ignored) {}
        try {
            remoteLoudnessEnhancer.release();
        } catch (Exception ignored) {}
        remoteLoudnessEnhancer = null;
    }

    private void stopBundleAudioLocked(boolean completed) {
        Completion completion = bundleCompletion;
        bundleCompletion = null;
        releaseBundleLoudnessEnhancer();
        if (bundleAudioPlayer != null) {
            try {
                bundleAudioPlayer.stop();
            } catch (Exception ignored) {}
            try {
                bundleAudioPlayer.release();
            } catch (Exception ignored) {}
            bundleAudioPlayer = null;
        }
        if (completion != null) completion.complete(completed);
    }

    private void stopRemoteAudioLocked(boolean completed) {
        Completion completion = remoteCompletion;
        remoteCompletion = null;
        releaseRemoteLoudnessEnhancer();
        if (remoteAudioPlayer != null) {
            try {
                remoteAudioPlayer.stop();
            } catch (Exception ignored) {}
            try {
                remoteAudioPlayer.release();
            } catch (Exception ignored) {}
            remoteAudioPlayer = null;
        }
        if (completion != null) completion.complete(completed);
    }

    private File getOrDownloadRemoteAudio(Context context, String urlString) {
        File cacheDir = new File(context.getCacheDir(), "game-audio");
        if (!cacheDir.exists() && !cacheDir.mkdirs()) return null;

        File target = new File(cacheDir, sha256(urlString) + ".mp3");
        if (target.exists() && target.length() > 0) return target;

        File partial = new File(cacheDir, target.getName() + ".tmp");
        HttpURLConnection connection = null;
        try {
            URL url = new URL(urlString);
            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(12000);
            connection.setReadTimeout(20000);
            connection.setInstanceFollowRedirects(true);
            connection.setRequestProperty("Accept", "audio/mpeg,audio/*,*/*");

            int status = connection.getResponseCode();
            if (status < 200 || status >= 300) {
                Log.w(TAG, "Remote audio HTTP " + status + ": " + urlString);
                return null;
            }

            try (
                InputStream input = connection.getInputStream();
                FileOutputStream output = new FileOutputStream(partial)
            ) {
                byte[] buffer = new byte[32 * 1024];
                int read;
                while ((read = input.read(buffer)) != -1) {
                    output.write(buffer, 0, read);
                }
            }

            if (!partial.renameTo(target)) {
                throw new IllegalStateException("Unable to store audio cache file.");
            }
            return target;
        } catch (Exception error) {
            Log.w(TAG, "Remote audio download failed: " + urlString, error);
            try {
                //noinspection ResultOfMethodCallIgnored
                partial.delete();
            } catch (Exception ignored) {}
            return null;
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    private String sanitizeAssetPath(String relativePath) {
        String rawPath = String.valueOf(relativePath == null ? "" : relativePath).trim();
        if (rawPath.isEmpty()) return "";
        if (rawPath.startsWith("file:") || rawPath.startsWith("http:") || rawPath.startsWith("https:")) return "";

        String normalized = rawPath.replace("\\", "/");
        while (normalized.startsWith("/")) normalized = normalized.substring(1);
        String[] parts = normalized.split("/");
        StringBuilder builder = new StringBuilder();
        for (String part : parts) {
            if (part.isEmpty() || ".".equals(part) || "..".equals(part)) continue;
            if (builder.length() > 0) builder.append('/');
            builder.append(part);
        }
        return builder.toString();
    }

    private boolean isHttpUrl(String value) {
        String lower = String.valueOf(value == null ? "" : value).toLowerCase(Locale.US);
        return lower.startsWith("http://") || lower.startsWith("https://");
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes("UTF-8"));
            StringBuilder builder = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                builder.append(String.format(Locale.US, "%02x", b));
            }
            return builder.toString();
        } catch (Exception error) {
            return String.valueOf(value.hashCode());
        }
    }
}
