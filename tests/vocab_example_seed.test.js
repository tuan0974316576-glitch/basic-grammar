const assert = require("assert");

process.env.NODE_ENV = "test";

const utils = require("../vocab_example_utils.js");
const generator = require("../scripts/generate-vocab-examples.js");

const blockedKeys = generator.getBlockedSeedKeys({
  meta: { blockedKeys: ["drive|bad", "course|bad"] }
});
assert.strictEqual(blockedKeys.has("drive|bad"), true);
assert.strictEqual(blockedKeys.has("course|bad"), true);
assert.strictEqual(blockedKeys.has("drive|good"), false);

const oxfordLevelByWord = new Map([
  ["have", "A1"],
  ["evaluate", "B2"]
]);

const haveFoodTask = generator.normalizeTeacherTask({
  id: "teacher-have-food",
  word: "have",
  display: "have",
  meaning: "食 / 飲",
  pos: "verb",
  type: "word"
}, oxfordLevelByWord);

assert.ok(haveFoodTask, "Expected teacher task to be created.");
assert.strictEqual(haveFoodTask.word, "have");
assert.strictEqual(haveFoodTask.level, "A1");
assert.notStrictEqual(haveFoodTask.localKey, "have");
assert.ok(haveFoodTask.cloudKey.includes("have|"));
assert.ok(haveFoodTask.cloudKey.includes("食 / 飲"));
assert.deepStrictEqual(haveFoodTask.hints, [{
  meaning: "食 / 飲",
  pos: "verb",
  type: "word",
  level: "A1"
}]);

const havePossessTask = generator.normalizeTeacherTask({
  word: "have",
  meaning: "有",
  pos: "verb",
  type: "word"
}, oxfordLevelByWord);
assert.notStrictEqual(haveFoodTask.localKey, havePossessTask.localKey);
assert.notStrictEqual(haveFoodTask.cloudKey, havePossessTask.cloudKey);

const oxfordOnlyTask = generator.normalizeOxfordTask({
  word: "apple",
  display: "apple",
  level: "A1",
  pos: ["noun"],
  posRaw: "n."
}, new Set(["have"]));
assert.ok(oxfordOnlyTask, "Expected Oxford-only task to be created.");
assert.strictEqual(oxfordOnlyTask.localKey, "apple");
assert.strictEqual(oxfordOnlyTask.cloudKey, "apple");
assert.deepStrictEqual(oxfordOnlyTask.hints, []);

assert.strictEqual(
  generator.normalizeOxfordTask({ word: "have", level: "A1" }, new Set(["have"])),
  null,
  "Teacher-bank words should win over Oxford-only tasks."
);
assert.strictEqual(
  generator.normalizeOxfordTask({ word: "a, an", level: "A1" }, new Set()),
  null,
  "Combined Oxford entries are not useful as direct lookup seed keys."
);

assert.strictEqual(generator.inferFallbackLevel({ word: "go", type: "word" }), "A2");
assert.strictEqual(generator.inferFallbackLevel({ word: "curious", type: "word" }), "B1");
assert.strictEqual(generator.inferFallbackLevel({ word: "innovation", type: "word" }), "B2");
assert.strictEqual(generator.inferFallbackLevel({ word: "take for granted", type: "phrase" }), "B2");

const tasks = generator.buildTasks({
  teacherEntries: [
    { id: "t1", word: "evaluate", meaning: "評估", pos: "verb", type: "word" },
    { id: "t2", word: "be+pp", meaning: "被", type: "pattern" }
  ],
  oxfordEntries: [
    { word: "evaluate", display: "evaluate", level: "B2", pos: ["verb"], posRaw: "v." },
    { word: "apple", display: "apple", level: "A1", pos: ["noun"], posRaw: "n." }
  ]
});

assert.deepStrictEqual(
  tasks.map((task) => `${task.source}:${task.word}:${task.localKey}:${task.level}`),
  [
    "oxford:apple:apple:A1",
    `teacher:evaluate:${utils.getLocalCacheKey("evaluate", [{ meaning: "評估", pos: "verb", type: "word", level: "B2" }])}:B2`
  ]
);

const prompt = generator.buildPrompt(haveFoodTask);
assert.ok(prompt.includes("CEFR level: A1"));
assert.ok(prompt.includes("Hong Kong junior primary level"));
assert.ok(prompt.includes("natural Cantonese-friendly Traditional Chinese"));
assert.ok(prompt.includes("not word-for-word machine translation"));
assert.ok(prompt.includes("not '談論關於'"));

const parsed = generator.parseGeminiJsonText("```json\n{\"examples\":[{\"source\":\"I have rice.\",\"target\":\"我吃飯。\"}]}\n```");
assert.strictEqual(parsed.examples[0].source, "I have rice.");

const normalized = generator.normalizeGeneratedExamples(haveFoodTask, {
  candidates: [{
    content: {
      parts: [{
        text: JSON.stringify({
          examples: [
            { source: "I have rice.", target: "我吃飯。" },
            { source: "We have milk.", target: "我們喝牛奶。" },
            { source: "We have milk.", target: "我們喝牛奶。" },
            { source: "They have lunch.", target: "他們吃午餐。" }
          ]
        })
      }]
    }
  }]
});
assert.strictEqual(normalized.length, 3);
assert.strictEqual(normalized[0].meaning, "食 / 飲");
assert.strictEqual(normalized[0].level, "A1");

console.log("vocab example seed tests passed");
