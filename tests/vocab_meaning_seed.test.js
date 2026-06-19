const assert = require("assert");
const generator = require("../scripts/generate-vocab-meanings.js");
const reviewer = require("../scripts/review-vocab-meaning-seed.js");

const tasks = generator.makeOxfordOnlyMeaningTasks({
  teacherEntries: [
    { word: "have", meaning: "有", pos: "verb" }
  ],
  oxfordEntries: [
    { word: "have", level: "A1", pos: ["verb"] },
    { word: "a, an", level: "A1", pos: ["determiner"] },
    { word: "apple", display: "apple", level: "A1", pos: ["noun"] },
    { word: "answer", display: "answer", level: "A1", pos: ["noun", "verb"] },
    { word: "answer", display: "answer", level: "B1", pos: ["noun"] },
    { word: "can", display: "can", level: "A1", pos: ["modal", "noun"] },
    { word: "bye", display: "bye", level: "A1", pos: ["exclamation"] }
  ],
  curatedEntries: []
});

assert.deepStrictEqual(tasks.map((task) => task.word), ["answer", "apple", "bye", "can"]);
assert.strictEqual(tasks[0].level, "A1");
assert.deepStrictEqual(tasks[0].pos, ["noun", "verb"]);
assert.deepStrictEqual(tasks.find((task) => task.word === "can").pos, ["modal", "noun"]);
assert.deepStrictEqual(tasks.find((task) => task.word === "bye").pos, ["exclamation"]);

const posGapTasks = generator.makeOxfordOnlyMeaningTasks({
  teacherEntries: [
    { word: "can", meaning: "罐", pos: "noun" }
  ],
  curatedEntries: [],
  oxfordEntries: [
    { word: "can", level: "A1", pos: ["modal", "noun"] }
  ],
  includeCurated: false
});

assert.deepStrictEqual(posGapTasks.map((task) => ({ word: task.word, pos: task.pos })), [
  { word: "can", pos: ["modal"] }
]);

const prompt = generator.buildPrompt(tasks.slice(0, 1));
assert.ok(prompt.includes("Traditional Chinese"));
assert.ok(prompt.includes("answer"));
assert.ok(prompt.includes("modal/auxiliary/exclamation/number"));
assert.deepStrictEqual(generator.parseGeminiJsonText('{"items":[{"word":"apple"}]} trailing }]}'), {
  items: [{ word: "apple" }]
});
assert.strictEqual(generator.normalizeMeaning("modal v. 能夠"), "能夠");

const normalized = generator.normalizeGeneratedMeaningPayload(tasks, {
  candidates: [{
    content: {
      parts: [{
        text: JSON.stringify({
          items: [
            {
              word: "answer",
              senses: [
                { pos: "noun", meaning: "答案" },
                { pos: "verb", meaning: "回答" },
                { pos: "adjective", meaning: "錯誤詞性" }
              ]
            },
            {
              word: "apple",
              senses: [{ pos: "noun", meaning: "蘋果" }]
            }
          ]
        })
      }]
    }
  }]
});

assert.deepStrictEqual(normalized.get("answer"), [
  { meaning: "答案", pos: "noun", type: "word", level: "A1", sourceEntryId: "gemini-meaning-0" },
  { meaning: "回答", pos: "verb", type: "word", level: "A1", sourceEntryId: "gemini-meaning-1" }
]);

const alternateShape = generator.normalizeGeneratedMeaningPayload(tasks, {
  candidates: [{
    content: {
      parts: [{
        text: JSON.stringify({
          entries: [
            { word: "answer", meanings: [{ pos: "n.", chinese: "答案" }] },
            { word: "apple", translations: [{ pos: "noun", translation: "蘋果" }] }
          ]
        })
      }]
    }
  }]
});

assert.deepStrictEqual(alternateShape.get("answer"), [
  { meaning: "答案", pos: "noun", type: "word", level: "A1", sourceEntryId: "gemini-meaning-0" }
]);
assert.deepStrictEqual(alternateShape.get("apple"), [
  { meaning: "蘋果", pos: "noun", type: "word", level: "A1", sourceEntryId: "gemini-meaning-0" }
]);

const topLevelSense = generator.normalizeGeneratedMeaningPayload(tasks, {
  text: JSON.stringify({
    vocabulary: [
      { english: "answer", partOfSpeech: "v.", meaning: "回答" }
    ]
  })
});

assert.deepStrictEqual(topLevelSense.get("answer"), [
  { meaning: "回答", pos: "verb", type: "word", level: "A1", sourceEntryId: "gemini-meaning-0" }
]);

const wordKeyedShape = generator.normalizeGeneratedMeaningPayload(tasks, {
  text: JSON.stringify({
    answer: {
      noun: "答案",
      verb: "回答"
    },
    apple: {
      meanings: {
        "n.": "蘋果"
      }
    }
  })
});

assert.deepStrictEqual(wordKeyedShape.get("answer"), [
  { meaning: "答案", pos: "noun", type: "word", level: "A1", sourceEntryId: "gemini-meaning-0" },
  { meaning: "回答", pos: "verb", type: "word", level: "A1", sourceEntryId: "gemini-meaning-1" }
]);
assert.deepStrictEqual(wordKeyedShape.get("apple"), [
  { meaning: "蘋果", pos: "noun", type: "word", level: "A1", sourceEntryId: "gemini-meaning-0" }
]);
assert.strictEqual(generator.makeMeaningId(" apple ").length, 24);

assert.deepStrictEqual(reviewer.getEntryFindings("apple", {
  word: "apple",
  status: "ready",
  entries: [{ meaning: "蘋果", pos: "noun" }]
}), []);

assert.ok(reviewer.getEntryFindings("apple", {
  word: "apple",
  status: "ready",
  entries: [{ meaning: "苹果", pos: "noun" }]
}).includes("possible Simplified Chinese"));

console.log("vocab meaning seed tests passed");
