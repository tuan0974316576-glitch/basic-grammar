const assert = require("assert");

async function main() {
  global.VOCAB_WORD_AUDIO_MANIFEST = {
    "en-US|en-US-AndrewMultilingualNeural::en-US|affluent": "audio/vocab_words/v1/affluent-e9a686a3d67e6576.mp3",
    "en-US|en-US-AndrewMultilingualNeural::en-US|take for granted": "audio/vocab_words/v1/take-for-granted-test.mp3"
  };

  delete require.cache[require.resolve("../vocab_audio.js")];
  const vocabAudio = require("../vocab_audio.js");

  assert.strictEqual(vocabAudio.normalizeWord("  Take   for  Granted "), "take for granted");
  assert.strictEqual(vocabAudio.normalizeWord("look–for"), "look-for");
  assert.strictEqual(vocabAudio.hasStaticAudio("Affluent"), true);
  assert.strictEqual(vocabAudio.hasStaticAudio("unknown-word"), false);
  assert.strictEqual(
    vocabAudio.getStaticAudioUrl("take for granted"),
    "audio/vocab_words/v1/take-for-granted-test.mp3"
  );

  assert.strictEqual(vocabAudio._private.isLikelyEnglishWordOrPhrase("look for"), true);
  assert.strictEqual(vocabAudio._private.isLikelyEnglishWordOrPhrase("take-for-granted"), true);
  assert.strictEqual(vocabAudio._private.isLikelyEnglishWordOrPhrase("蘋果"), false);
  assert.strictEqual(vocabAudio._private.isLikelyEnglishWordOrPhrase(""), false);

  let requestedWord = "";
  global.VOCAB_WORD_AUDIO_MANIFEST = {};
  global.grammarFirebase = {
    auth: { currentUser: { uid: "student_test" } },
    functions: {},
    modules: {
      httpsCallable: (_functions, name) => {
        assert.strictEqual(name, "ensureVocabAudio");
        return async (payload) => {
          requestedWord = payload.word;
          return {
            data: {
              status: "ready",
              word: payload.word,
              downloadUrl: "https://example.test/audio.mp3",
              source: "firebase-shared",
              audioId: "audio123",
              storagePath: "vocab-audio/v1/example-audio123.mp3"
            }
          };
        };
      }
    }
  };

  delete require.cache[require.resolve("../vocab_audio.js")];
  const sharedVocabAudio = require("../vocab_audio.js");
  const result = await sharedVocabAudio._private.requestSharedAudio("  Evaluate  ");

  assert.strictEqual(requestedWord, "evaluate");
  assert.strictEqual(result.status, "ready");
  assert.strictEqual(result.source, "firebase-shared");

  delete global.VOCAB_WORD_AUDIO_MANIFEST;
  delete global.grammarFirebase;
  console.log("vocab_audio tests passed");
}

main().catch((error) => {
  delete global.VOCAB_WORD_AUDIO_MANIFEST;
  delete global.grammarFirebase;
  throw error;
});
