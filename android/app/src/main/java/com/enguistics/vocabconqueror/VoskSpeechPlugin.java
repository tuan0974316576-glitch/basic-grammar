package com.enguistics.vocabconqueror;

import android.content.res.AssetManager;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONObject;
import org.vosk.Model;
import org.vosk.Recognizer;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;

@CapacitorPlugin(name = "VoskSpeech")
public class VoskSpeechPlugin extends Plugin {
    private static final String MODEL_ASSET_DIR = "vosk-model-small-en-us-0.15";
    private static final Object MODEL_LOCK = new Object();
    private static Model sharedModel = null;

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", true);
        result.put("engine", "vosk-local");
        result.put("model", MODEL_ASSET_DIR);
        call.resolve(result);
    }

    @PluginMethod
    public void prepare(PluginCall call) {
        new Thread(() -> {
            try {
                getOrLoadModel();
                JSObject result = new JSObject();
                result.put("ready", true);
                result.put("engine", "vosk-local");
                result.put("model", MODEL_ASSET_DIR);
                getActivity().runOnUiThread(() -> call.resolve(result));
            } catch (Exception error) {
                getActivity().runOnUiThread(() -> call.reject(error.getMessage(), error));
            }
        }, "VoskSpeechPrepare").start();
    }

    @PluginMethod
    public void assess(PluginCall call) {
        String audioBase64 = call.getString("audioBase64", "");
        String grammarJson = call.getString("grammarJson", "");
        if (audioBase64 == null || audioBase64.trim().isEmpty()) {
            call.reject("Missing audioBase64");
            return;
        }

        new Thread(() -> {
            try {
                JSObject result = recognizeWav(audioBase64, grammarJson);
                getActivity().runOnUiThread(() -> call.resolve(result));
            } catch (Exception error) {
                getActivity().runOnUiThread(() -> call.reject(error.getMessage(), error));
            }
        }, "VoskSpeechAssess").start();
    }

    private JSObject recognizeWav(String audioBase64, String grammarJson) throws Exception {
        byte[] wavBytes = Base64.decode(audioBase64, Base64.DEFAULT);
        WavData wavData = parseWavData(wavBytes);
        Model model = getOrLoadModel();
        String cleanGrammar = normalizeGrammarJson(grammarJson);
        boolean grammarApplied = cleanGrammar.length() > 0;

        Recognizer recognizer;
        try {
            recognizer = grammarApplied
                    ? new Recognizer(model, wavData.sampleRate, cleanGrammar)
                    : new Recognizer(model, wavData.sampleRate);
        } catch (IOException grammarError) {
            grammarApplied = false;
            recognizer = new Recognizer(model, wavData.sampleRate);
        }

        recognizer.setWords(true);
        int offset = 0;
        int chunkSize = Math.max(3200, Math.round(wavData.sampleRate * 0.2f) * 2);
        while (offset < wavData.pcm16.length) {
            int len = Math.min(chunkSize, wavData.pcm16.length - offset);
            byte[] chunk = Arrays.copyOfRange(wavData.pcm16, offset, offset + len);
            recognizer.acceptWaveForm(chunk, chunk.length);
            offset += len;
        }

        String finalJson = recognizer.getFinalResult();
        recognizer.close();

        JSONObject parsed = finalJson == null || finalJson.trim().isEmpty()
                ? new JSONObject()
                : new JSONObject(finalJson);
        JSONArray rawWords = parsed.optJSONArray("result");
        JSONArray words = new JSONArray();
        if (rawWords != null) {
            for (int i = 0; i < rawWords.length(); i++) {
                JSONObject rawWord = rawWords.optJSONObject(i);
                if (rawWord == null) continue;
                JSONObject word = new JSONObject();
                double confidence = rawWord.optDouble("conf", 0);
                word.put("word", rawWord.optString("word", ""));
                word.put("confidence", confidence);
                word.put("conf", confidence);
                word.put("start", rawWord.optDouble("start", 0));
                word.put("end", rawWord.optDouble("end", 0));
                words.put(word);
            }
        }

        JSObject result = new JSObject();
        result.put("ok", true);
        result.put("engine", "vosk-local");
        result.put("model", MODEL_ASSET_DIR);
        result.put("sampleRate", wavData.sampleRate);
        result.put("recognizedText", parsed.optString("text", ""));
        result.put("words", words);
        result.put("rawJson", finalJson);
        result.put("grammarApplied", grammarApplied);
        return result;
    }

    private Model getOrLoadModel() throws IOException {
        synchronized (MODEL_LOCK) {
            if (sharedModel != null) return sharedModel;

            File modelDir = new File(getContext().getFilesDir(), MODEL_ASSET_DIR);
            File modelConf = new File(modelDir, "conf/model.conf");
            if (!modelConf.exists()) {
                if (modelDir.exists()) deleteRecursively(modelDir);
                copyAssetDirectory(getContext().getAssets(), MODEL_ASSET_DIR, modelDir);
            }

            sharedModel = new Model(modelDir.getAbsolutePath());
            return sharedModel;
        }
    }

    private String normalizeGrammarJson(String grammarJson) {
        String clean = grammarJson == null ? "" : grammarJson.trim();
        if (clean.isEmpty()) return "";
        try {
            JSONArray grammar = new JSONArray(clean);
            return grammar.length() > 0 ? grammar.toString() : "";
        } catch (Exception _error) {
            return "";
        }
    }

    private void copyAssetDirectory(AssetManager assets, String assetPath, File targetDir) throws IOException {
        String[] children = assets.list(assetPath);
        if (children == null || children.length == 0) {
            File parent = targetDir.getParentFile();
            if (parent != null && !parent.exists() && !parent.mkdirs()) {
                throw new IOException("Unable to create " + parent.getAbsolutePath());
            }
            try (InputStream input = assets.open(assetPath);
                 FileOutputStream output = new FileOutputStream(targetDir)) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = input.read(buffer)) != -1) {
                    output.write(buffer, 0, read);
                }
            }
            return;
        }

        if (!targetDir.exists() && !targetDir.mkdirs()) {
            throw new IOException("Unable to create " + targetDir.getAbsolutePath());
        }
        for (String child : children) {
            copyAssetDirectory(assets, assetPath + "/" + child, new File(targetDir, child));
        }
    }

    private void deleteRecursively(File file) {
        if (file == null || !file.exists()) return;
        if (file.isDirectory()) {
            File[] children = file.listFiles();
            if (children != null) {
                for (File child : children) deleteRecursively(child);
            }
        }
        file.delete();
    }

    private WavData parseWavData(byte[] bytes) throws IOException {
        if (bytes == null || bytes.length < 44) {
            throw new IOException("Invalid WAV audio");
        }
        if (!readAscii(bytes, 0, 4).equals("RIFF") || !readAscii(bytes, 8, 4).equals("WAVE")) {
            throw new IOException("Audio must be RIFF/WAVE PCM");
        }

        int offset = 12;
        int sampleRate = 16000;
        int channels = 1;
        int bitsPerSample = 16;
        int audioFormat = 1;
        int dataOffset = -1;
        int dataSize = 0;

        while (offset + 8 <= bytes.length) {
            String chunkId = readAscii(bytes, offset, 4);
            int chunkSize = readIntLE(bytes, offset + 4);
            int chunkDataOffset = offset + 8;
            if (chunkDataOffset + chunkSize > bytes.length) break;

            if (chunkId.equals("fmt ") && chunkSize >= 16) {
                audioFormat = readShortLE(bytes, chunkDataOffset);
                channels = readShortLE(bytes, chunkDataOffset + 2);
                sampleRate = readIntLE(bytes, chunkDataOffset + 4);
                bitsPerSample = readShortLE(bytes, chunkDataOffset + 14);
            } else if (chunkId.equals("data")) {
                dataOffset = chunkDataOffset;
                dataSize = chunkSize;
                break;
            }

            offset = chunkDataOffset + chunkSize + (chunkSize % 2);
        }

        if (audioFormat != 1 || bitsPerSample != 16 || dataOffset < 0 || dataSize <= 0) {
            throw new IOException("WAV must be 16-bit PCM");
        }
        if (channels < 1) channels = 1;
        if (sampleRate <= 0) sampleRate = 16000;

        byte[] pcm = new byte[dataSize];
        System.arraycopy(bytes, dataOffset, pcm, 0, dataSize);
        if (channels == 1) {
            return new WavData(pcm, sampleRate);
        }

        int frameCount = dataSize / (channels * 2);
        byte[] mono = new byte[frameCount * 2];
        for (int frame = 0; frame < frameCount; frame++) {
            int sum = 0;
            for (int channel = 0; channel < channels; channel++) {
                int sampleOffset = (frame * channels + channel) * 2;
                sum += (short) ((pcm[sampleOffset] & 0xff) | (pcm[sampleOffset + 1] << 8));
            }
            short mixed = (short) Math.max(Short.MIN_VALUE, Math.min(Short.MAX_VALUE, sum / channels));
            int monoOffset = frame * 2;
            mono[monoOffset] = (byte) (mixed & 0xff);
            mono[monoOffset + 1] = (byte) ((mixed >> 8) & 0xff);
        }
        return new WavData(mono, sampleRate);
    }

    private String readAscii(byte[] bytes, int offset, int length) {
        return new String(bytes, offset, length);
    }

    private int readShortLE(byte[] bytes, int offset) {
        return (bytes[offset] & 0xff) | ((bytes[offset + 1] & 0xff) << 8);
    }

    private int readIntLE(byte[] bytes, int offset) {
        return (bytes[offset] & 0xff)
                | ((bytes[offset + 1] & 0xff) << 8)
                | ((bytes[offset + 2] & 0xff) << 16)
                | ((bytes[offset + 3] & 0xff) << 24);
    }

    private static class WavData {
        final byte[] pcm16;
        final float sampleRate;

        WavData(byte[] pcm16, int sampleRate) {
            this.pcm16 = pcm16;
            this.sampleRate = sampleRate;
        }
    }
}
