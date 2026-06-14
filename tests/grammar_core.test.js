const assert = require("assert");
const core = require("../grammar_core.js");

assert.strictEqual(core.normalizeTypedSentence("  Apples  are healthy!!! "), "apples are healthy");
assert.strictEqual(core.normalizeTypedSentence("An apple ."), "an apple");

assert.strictEqual(
  core.isCountableTypedAnswerCorrect({ acceptedAnswers: ["Air is clean."] }, "air is clean"),
  true
);
assert.strictEqual(
  core.isCountableTypedAnswerCorrect({ acceptedAnswers: ["Air is clean."] }, "An air is clean"),
  false
);

assert.deepStrictEqual(core.getSentenceTokens({ sentence: "He is play football well." }), [
  "He",
  "is",
  "play",
  "football",
  "well"
]);

const quotaQuestions = [
  { id: "a1", type: "action" },
  { id: "a2", type: "action" },
  { id: "a3", type: "action" },
  { id: "b1", type: "be" },
  { id: "b2", type: "be" },
  { id: "j1", type: "adjective" }
];
assert.deepStrictEqual(
  core.getQuestionQuotas(5, quotaQuestions, { action: 0.5, be: 0.3, adjective: 0.2 }),
  { action: 3, be: 1, adjective: 1 }
);

const zeroRng = () => 0;
const weightedPicked = core.pickWeightedQuestions(4, quotaQuestions, { action: 0.5, be: 0.25, adjective: 0.25 }, zeroRng);
assert.strictEqual(weightedPicked.length, 4);
assert.deepStrictEqual(
  weightedPicked.reduce((counts, question) => {
    counts[question.type] = (counts[question.type] || 0) + 1;
    return counts;
  }, {}),
  { action: 2, be: 1, adjective: 1 }
);

const lessons = {
  lesson1: { id: "lesson1", questions: quotaQuestions },
  lesson2: { id: "lesson2", questions: [{ id: "l2a" }, { id: "l2b" }, { id: "l2c" }] }
};
assert.strictEqual(
  core.pickLessonQuestions("lesson2", 2, lessons, { fallbackLessonId: "lesson1", weightedLessonId: "lesson1", rng: zeroRng }).length,
  2
);

assert.strictEqual(core.getNextProgress(3, 10, 5), 5);
assert.strictEqual(core.getNextProgress(12, 10, 5), 10);
assert.strictEqual(core.getScorePercent(7, 10), 70);
assert.strictEqual(core.getScorePercent(1, 0), 0);
assert.deepStrictEqual(
  core.getReviewQuestions([{ id: "a" }, { id: "b" }, { id: "c" }], ["b", "x"]),
  [{ id: "b" }]
);

const verbQuestion = {
  forms: {
    present: "be",
    past: "was/were",
    pp: "been",
    ing: "being"
  }
};

assert.strictEqual(core.normalizeVerbTableAnswer(" was / were "), "was/were");
assert.strictEqual(core.isVerbTableSlotCorrect(verbQuestion, "past", "was / were"), true);
assert.deepStrictEqual(
  core.getVerbTableWrongSlots(verbQuestion, {
    present: "be",
    past: "was / were",
    pp: "been",
    ing: "be"
  }),
  ["ing"]
);

console.log("grammar_core tests passed");
