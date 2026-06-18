const assert = require("assert");

function installFakeIndexedDb() {
  const stores = new Map();

  global.indexedDB = {
    open: () => {
      const request = {
        result: null,
        onblocked: null,
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null
      };

      setTimeout(() => {
        const db = {
          objectStoreNames: {
            contains: (storeName) => stores.has(storeName)
          },
          createObjectStore: (storeName) => {
            if (!stores.has(storeName)) stores.set(storeName, new Map());
          },
          transaction: (storeName) => ({
            objectStore: () => ({
              get: (key) => {
                const storeRequest = { result: null, onerror: null, onsuccess: null };
                setTimeout(() => {
                  storeRequest.result = stores.get(storeName)?.get(key) || null;
                  storeRequest.onsuccess?.();
                }, 0);
                return storeRequest;
              },
              put: (value) => {
                const storeRequest = { onerror: null, onsuccess: null };
                setTimeout(() => {
                  stores.get(storeName)?.set(value.word, value);
                  storeRequest.onsuccess?.();
                }, 0);
                return storeRequest;
              }
            })
          })
        };

        request.result = db;
        request.onupgradeneeded?.();
        request.onsuccess?.();
      }, 0);

      return request;
    }
  };
}

async function main() {
  const originalFetch = global.fetch;

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
  installFakeIndexedDb();
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

  global.fetch = async () => ({
    ok: false,
    headers: { get: () => "" }
  });
  requestedWord = "";
  await sharedVocabAudio._private.markMiss("Striker", "network-error");
  const skippedResult = await sharedVocabAudio._private.ensureAudio("Striker");
  assert.strictEqual(skippedResult.status, "missing");
  assert.strictEqual(skippedResult.source, "cached-miss");

  const retryResult = await sharedVocabAudio._private.ensureAudio("Striker", { force: true });
  assert.strictEqual(requestedWord, "striker");
  assert.strictEqual(retryResult.status, "missing");
  assert.notStrictEqual(retryResult.source, "cached-miss");

  global.fetch = originalFetch;
  delete global.VOCAB_WORD_AUDIO_MANIFEST;
  delete global.grammarFirebase;
  console.log("vocab_audio tests passed");
}

main().catch((error) => {
  delete global.VOCAB_WORD_AUDIO_MANIFEST;
  delete global.grammarFirebase;
  throw error;
});
