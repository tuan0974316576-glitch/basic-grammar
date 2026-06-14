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

console.log("grammar_data tests passed");
