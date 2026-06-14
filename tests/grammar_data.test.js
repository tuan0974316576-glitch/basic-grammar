const assert = require("assert");
const core = require("../grammar_core.js");
const data = require("../grammar_data.js");

assert.ok(Array.isArray(data.QUESTIONS));
assert.ok(data.QUESTIONS.length >= 50);
assert.ok(Array.isArray(data.VERB_COUNT_QUESTIONS));
assert.ok(Array.isArray(data.SENTENCE_BUILD_QUESTIONS));
assert.ok(Array.isArray(data.SENTENCE_UNDERLINE_QUESTIONS));
assert.ok(Array.isArray(data.PRONOUN_MATCH_QUESTIONS));
assert.ok(Array.isArray(data.PRONOUN_SENTENCE_QUESTION_BANK));
assert.ok(Array.isArray(data.COUNTABLE_NOUN_QUESTIONS));
assert.ok(Array.isArray(data.VERB_TABLE_QUESTIONS));

assert.strictEqual(data.LESSONS.lesson1.questions, data.QUESTIONS);
assert.strictEqual(data.LESSONS.lesson2.questions, data.VERB_COUNT_QUESTIONS);
assert.strictEqual(data.LESSONS["verb-table"].questions, data.VERB_TABLE_QUESTIONS);

assert.strictEqual(data.capitalizeWord("apple"), core.capitalizeWord("apple"));
assert.strictEqual(data.PRONOUN_SENTENCE_FORMS.He.subject.present, "thirdSingular");
assert.strictEqual(data.PRONOUN_SENTENCE_FORMS.him.roles.includes("object"), true);
assert.strictEqual(data.COUNTABLE_NOUN_QUESTIONS[0].answer.length > 0, true);
assert.strictEqual(data.COUNTABLE_NOUN_QUESTIONS.length, 100);
assert.strictEqual(data.COUNTABLE_NOUN_QUESTIONS.filter((question) => question.isCorrect).length, 50);
assert.strictEqual(data.COUNTABLE_NOUN_QUESTIONS.filter((question) => !question.isCorrect).length, 50);
assert.ok(data.COUNTABLE_NOUN_QUESTIONS.some((question) => question.answer === "I want an apple."));
assert.ok(data.COUNTABLE_NOUN_QUESTIONS.some((question) => question.answer === "We need more teachers."));

const countableQuestionText = data.COUNTABLE_NOUN_QUESTIONS
  .map((question) => [question.sentence, question.zh, question.answer, question.explanation].join("\n"))
  .join("\n");
[
  "An apple is red.",
  "Apple is red.",
  "Teachers are kind.",
  "老師很友善",
  "A banana is yellow.",
  "Lessons are important."
].forEach((awkwardExample) => {
  assert.strictEqual(countableQuestionText.includes(awkwardExample), false);
});

console.log("grammar_data tests passed");
