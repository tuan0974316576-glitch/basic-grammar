const assert = require("assert");
const Module = require("module");

process.env.NODE_ENV = "test";

let mockMeaningCacheData = null;
let mockFirestoreSetCount = 0;
let mockMeaningCacheWord = "apple";

const originalLoad = Module._load;
Module._load = function loadMock(request, parent, isMain) {
  if (request === "firebase-admin") {
    const firestore = () => ({
      collection: (collectionName) => ({
        doc: (docId) => ({
          get: async () => {
            const expectedId = helpersForMock.makeVocabMeaningId(mockMeaningCacheWord);
            if (collectionName === "vocabMeaningCache" && docId === expectedId && mockMeaningCacheData) {
              return {
                exists: true,
                data: () => mockMeaningCacheData
              };
            }
            return { exists: false };
          },
          set: async () => {
            mockFirestoreSetCount += 1;
          }
        })
      })
    });
    firestore.FieldValue = {
      serverTimestamp: () => ({ __type: "serverTimestamp" })
    };
    return {
      initializeApp: () => {},
      firestore,
      storage: () => ({
        bucket: () => ({
          file: () => ({
            exists: async () => [false],
            getMetadata: async () => [{}],
            setMetadata: async () => {},
            save: async () => {}
          })
        })
      })
    };
  }
  if (request === "firebase-functions/v2/https") {
    class HttpsError extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    }
    return {
      HttpsError,
      onCall: (_options, handler) => handler
    };
  }
  if (request === "firebase-functions/v2") {
    return {
      setGlobalOptions: () => {}
    };
  }
  if (request === "firebase-functions/params") {
    return {
      defineSecret: (name) => ({
        value: () => process.env[name] || ""
      })
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const functions = require("../functions/index.js");
Module._load = originalLoad;

const helpers = functions._private;
const helpersForMock = helpers;
assert.ok(helpers, "Expected test helpers to be exported.");

const haveFoodHints = helpers.normalizeExampleHints([
  { meaning: "食 / 飲", pos: "verb", type: "word" },
  { meaning: "食 / 飲", pos: "verb", type: "word" },
  { meaning: "", pos: "noun" }
]);

assert.deepStrictEqual(haveFoodHints, [
  { meaning: "食 / 飲", pos: "verb", type: "word", level: "" }
]);

assert.notStrictEqual(
  helpers.makeVocabExamplesCacheKey("have", [{ meaning: "有", pos: "verb" }]),
  helpers.makeVocabExamplesCacheKey("have", [{ meaning: "食 / 飲", pos: "verb" }])
);

const prompt = helpers.buildGeminiExamplePrompt("have", haveFoodHints);
assert.ok(prompt.includes("食 / 飲"));
assert.ok(prompt.includes("Traditional Chinese"));
assert.ok(prompt.includes("Return exactly 3 examples"));

assert.strictEqual(helpers.shouldReuseCachedExamples({ source: "azure-dictionary-examples" }), false);
assert.strictEqual(helpers.shouldReuseCachedExamples({ source: "gemini-generated-examples" }), true);

const parsed = helpers.parseGeminiJsonText("```json\n{\"examples\":[{\"source\":\"I have lunch.\",\"target\":\"我吃午餐。\"}]}\n```");
assert.strictEqual(parsed.examples[0].source, "I have lunch.");

const examples = helpers.normalizeGeminiExamples("have", {
  candidates: [{
    content: {
      parts: [{
        text: JSON.stringify({
          examples: [
            { source: "I have lunch at school.", target: "我在學校吃午餐。" },
            { source: "We have milk every day.", target: "我們每天喝牛奶。" }
          ]
        })
      }]
    }
  }]
}, haveFoodHints);

assert.strictEqual(examples.length, 2);
assert.strictEqual(examples[0].meaning, "食 / 飲");
assert.strictEqual(examples[0].provider, "gemini-generated-examples");

mockMeaningCacheData = {
  word: "apple",
  source: "shared-cache",
  status: "ready",
  entries: [
    { meaning: "蘋果", pos: "noun", type: "word", level: "A1", sourceEntryId: "seed-apple-noun" }
  ]
};

(async () => {
  const cachedMeaning = await helpers.getOrCreateVocabMeaning("apple");
  assert.strictEqual(cachedMeaning.cached, true);
  assert.strictEqual(cachedMeaning.source, "shared-cache");
  assert.strictEqual(cachedMeaning.entries.length, 1);
  assert.strictEqual(cachedMeaning.entries[0].meaning, "蘋果");
  assert.strictEqual(cachedMeaning.entries[0].pos, "noun");
  assert.strictEqual(cachedMeaning.entries[0].level, "A1");
  assert.strictEqual(mockFirestoreSetCount, 0);

  mockMeaningCacheWord = "won't";
  mockMeaningCacheData = {
    word: "won't",
    source: "azure-dictionary",
    status: "ready",
    entries: [
      { meaning: "不會", pos: "verb", type: "word", sourceEntryId: "old-cache-0" },
      { meaning: "不會", pos: "verb", type: "word", sourceEntryId: "old-cache-1" }
    ]
  };
  const cachedModal = await helpers.getOrCreateVocabMeaning("won't");
  assert.strictEqual(cachedModal.cached, false);
  assert.strictEqual(cachedModal.source, "curated-cloud");
  assert.strictEqual(cachedModal.entries.length, 1);
  assert.strictEqual(cachedModal.entries[0].pos, "modal");
  assert.strictEqual(cachedModal.entries[0].meaning, "不會");

  mockMeaningCacheData = null;
  const swift = await helpers.getOrCreateVocabMeaning("swift");
  assert.strictEqual(swift.source, "curated-cloud");
  assert.deepStrictEqual(swift.entries.map((entry) => `${entry.pos}:${entry.meaning}`), [
    "adjective:迅速的"
  ]);

  console.log("vocab example function tests passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
