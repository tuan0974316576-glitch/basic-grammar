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
