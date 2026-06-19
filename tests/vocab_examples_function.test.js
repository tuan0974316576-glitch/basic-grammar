const assert = require("assert");
const Module = require("module");

process.env.NODE_ENV = "test";

const originalLoad = Module._load;
Module._load = function loadMock(request, parent, isMain) {
  if (request === "firebase-admin") {
    return {
      initializeApp: () => {},
      firestore: () => ({
        collection: () => ({
          doc: () => ({
            get: async () => ({ exists: false }),
            set: async () => {}
          })
        })
      }),
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
assert.ok(helpers, "Expected test helpers to be exported.");

const haveFoodHints = helpers.normalizeExampleHints([
  { meaning: "食 / 飲", pos: "verb", type: "word" },
  { meaning: "食 / 飲", pos: "verb", type: "word" },
  { meaning: "", pos: "noun" }
]);

assert.deepStrictEqual(haveFoodHints, [
  { meaning: "食 / 飲", pos: "verb", type: "word" }
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

console.log("vocab example function tests passed");
