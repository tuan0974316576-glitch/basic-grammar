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
  if (request === "firebase-functions/v2/firestore") {
    return {
      onDocumentWritten: (_options, handler) => handler
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
assert.ok(prompt.includes("Hong Kong written Chinese"));
assert.ok(prompt.includes("Do not use colloquial Cantonese"));
assert.ok(prompt.includes("Return exactly 3 examples"));
assert.ok(prompt.includes("vocabulary example sentences for Hong Kong English learners"));
assert.ok(!prompt.includes("Cantonese-friendly"));
assert.ok(helpers.makeVocabExamplesCacheKey("have", haveFoodHints).startsWith("v2-written-zh|"));

const deepSeekPayload = helpers.buildDeepSeekChatPayload(prompt);
assert.strictEqual(deepSeekPayload.model, "deepseek-v4-flash");
assert.deepStrictEqual(deepSeekPayload.response_format, { type: "json_object" });
assert.strictEqual(deepSeekPayload.messages[1].content, prompt);

assert.strictEqual(helpers.shouldReuseCachedExamples({ source: "azure-dictionary-examples" }), false);
assert.strictEqual(helpers.shouldReuseCachedExamples({ source: "deepseek-generated-examples" }), true);
assert.strictEqual(helpers.shouldReuseCachedExamples({ source: "gemini-generated-examples" }), true);
assert.strictEqual(helpers.shouldReuseCachedExamples({ source: "teacher-approved-examples" }), true);
assert.strictEqual(helpers.shouldReuseCachedExamples({ source: "template-generated-examples" }), false);
assert.strictEqual(helpers.shouldReuseCachedExamples({ source: "template-generated-examples", status: "ai-error" }), false);
assert.strictEqual(helpers.shouldReuseCachedMeaning({ source: "azure-dictionary" }), false);
assert.strictEqual(helpers.shouldReuseCachedMeaning({ source: "azure-translate-fallback" }), false);
assert.strictEqual(helpers.shouldReuseCachedMeaning({ source: "curated-cloud" }), true);

const parsed = helpers.parseGeminiJsonText("```json\n{\"examples\":[{\"source\":\"I have lunch.\",\"target\":\"我吃午餐。\"}]}\n```");
assert.strictEqual(parsed.examples[0].source, "I have lunch.");

const teacherExamplesInput = helpers.normalizeTeacherExampleInputs([
  "  I eats macaroni.  ",
  "",
  "I eats macaroni."
]);
assert.deepStrictEqual(teacherExamplesInput, ["I eats macaroni."]);

const teacherPrompt = helpers.buildTeacherExamplePrompt("macaroni", [
  { meaning: "通心粉", pos: "noun", type: "word" }
], teacherExamplesInput);
assert.ok(teacherPrompt.includes("Proofread"));
assert.ok(teacherPrompt.includes("通心粉"));
assert.ok(teacherPrompt.includes("Traditional Chinese"));
assert.ok(teacherPrompt.includes("Hong Kong written Chinese"));
assert.ok(!teacherPrompt.includes("Cantonese-friendly"));

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

const deepSeekExamples = helpers.normalizeDeepSeekExamples("have", {
  choices: [{
    message: {
      content: JSON.stringify({
        examples: [
          { source: "I have lunch at school.", target: "我在學校吃午餐。" },
          { source: "We have milk every day.", target: "我們每天喝牛奶。" }
        ]
      })
    }
  }]
}, haveFoodHints);
assert.strictEqual(deepSeekExamples.length, 2);
assert.strictEqual(deepSeekExamples[0].meaning, "食 / 飲");
assert.strictEqual(deepSeekExamples[0].provider, "deepseek-generated-examples");

const teacherExamples = helpers.normalizeTeacherExamplesWithGemini("macaroni", {
  candidates: [{
    content: {
      parts: [{
        text: JSON.stringify({
          examples: [
            { source: "I eat macaroni for lunch.", target: "我午餐吃通心粉。" }
          ]
        })
      }]
    }
  }]
}, [{ meaning: "通心粉", pos: "noun" }]);
assert.strictEqual(teacherExamples.length, 1);
assert.strictEqual(teacherExamples[0].provider, "teacher-approved-examples");
assert.strictEqual(teacherExamples[0].meaning, "通心粉");

const teacherExamplesFromDeepSeek = helpers.normalizeTeacherExamplesWithDeepSeek("macaroni", {
  choices: [{
    message: {
      content: JSON.stringify({
        examples: [
          { source: "I eat macaroni for lunch.", target: "我午餐吃通心粉。" }
        ]
      })
    }
  }]
}, [{ meaning: "通心粉", pos: "noun" }]);
assert.strictEqual(teacherExamplesFromDeepSeek.length, 1);
assert.strictEqual(teacherExamplesFromDeepSeek[0].provider, "teacher-approved-examples");
assert.strictEqual(teacherExamplesFromDeepSeek[0].meaning, "通心粉");

const templateExamples = helpers.buildTemplateExamples("macaroni", [
  { meaning: "通心粉", pos: "noun", type: "word" }
]);
assert.strictEqual(templateExamples.length, 3);
assert.strictEqual(templateExamples[0].provider, "template-generated-examples");
assert.strictEqual(templateExamples[0].meaning, "通心粉");
assert.ok(templateExamples[0].source.includes("macaroni"));

assert.strictEqual(helpers.shouldWarmTeacherVocabEntry(null, {
  word: "macaroni",
  meaning: "通心粉",
  pos: "noun"
}), true);
assert.strictEqual(helpers.shouldWarmTeacherVocabEntry({
  word: "macaroni",
  meaning: "通心粉",
  pos: "noun"
}, {
  word: "macaroni",
  meaning: "通心粉",
  pos: "noun",
  updatedAt: 123
}), false);
assert.strictEqual(helpers.shouldWarmTeacherVocabEntry({
  word: "macaroni",
  meaning: "通心粉",
  pos: "noun"
}, {
  word: "macaroni",
  meaning: "通心粉",
  pos: "noun",
  teacherExamples: ["I eat macaroni."]
}), true);
assert.strictEqual(helpers.shouldWarmTeacherVocabEntry(null, {
  word: "macaroni",
  meaning: "通心粉",
  pos: "noun",
  disabled: true
}), false);

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

  const normalizedCubMeanings = helpers.normalizeMeaningEntries("cub", [
    { meaning: "幼", pos: "noun", type: "word", sourceEntryId: "old-cache-0" },
    { meaning: "幼仔", pos: "noun", type: "word", sourceEntryId: "old-cache-1" },
    { meaning: "幼獸", pos: "noun", type: "word", sourceEntryId: "old-cache-2" },
    { meaning: "幼童", pos: "noun", type: "word", sourceEntryId: "old-cache-3" }
  ], "azure-dictionary");
  assert.deepStrictEqual(normalizedCubMeanings.map((entry) => `${entry.pos}:${entry.meaning}`), [
    "noun:幼獸"
  ]);

  mockMeaningCacheWord = "delicacy";
  mockMeaningCacheData = {
    word: "delicacy",
    source: "azure-dictionary",
    status: "ready",
    entries: [
      { meaning: "美味 佳餚", pos: "noun", type: "word", sourceEntryId: "old-cache-0" },
      { meaning: "美味", pos: "noun", type: "word", sourceEntryId: "old-cache-1" },
      { meaning: "美食", pos: "noun", type: "word", sourceEntryId: "old-cache-2" },
      { meaning: "佳餚", pos: "noun", type: "word", sourceEntryId: "old-cache-3" }
    ]
  };
  const delicacy = await helpers.getOrCreateVocabMeaning("delicacy");
  assert.strictEqual(delicacy.cached, false);
  assert.strictEqual(delicacy.source, "curated-cloud");
  assert.deepStrictEqual(delicacy.entries.map((entry) => `${entry.pos}:${entry.meaning}`), [
    "noun:佳餚"
  ]);

  mockMeaningCacheWord = "academy";
  mockMeaningCacheData = {
    word: "academy",
    source: "azure-dictionary",
    status: "ready",
    entries: [
      { meaning: "學院", pos: "noun", type: "word", sourceEntryId: "old-cache-0" }
    ]
  };
  const academy = await helpers.getOrCreateVocabMeaning("academy");
  assert.strictEqual(academy.cached, false);
  assert.strictEqual(academy.source, "reviewed-cache");
  assert.strictEqual(academy.status, "missing");
  assert.deepStrictEqual(academy.entries, []);

  mockMeaningCacheData = null;
  const callableMissing = await helpers.lookupVocabMeaning({
    auth: { uid: "student_test" },
    data: { word: "academy" }
  });
  assert.strictEqual(callableMissing.status, "missing");
  assert.strictEqual(callableMissing.source, "reviewed-cache");
  assert.deepStrictEqual(callableMissing.entries, []);

  const callableCurated = await helpers.lookupVocabMeaning({
    auth: { uid: "student_test" },
    data: { word: "swift" }
  });
  assert.strictEqual(callableCurated.status, "ready");
  assert.strictEqual(callableCurated.source, "curated-cloud");
  assert.deepStrictEqual(callableCurated.entries.map((entry) => `${entry.pos}:${entry.meaning}`), [
    "adjective:迅速的"
  ]);

  console.log("vocab example function tests passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
