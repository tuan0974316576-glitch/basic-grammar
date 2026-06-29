const assert = require("assert");
const fs = require("fs");
const path = require("path");
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
assert.ok(Array.isArray(data.NOUN_CATEGORY_QUESTIONS));
assert.ok(Array.isArray(data.MODAL_VERB_QUESTIONS));
assert.ok(Array.isArray(data.ADJECTIVE_QUESTIONS));
assert.ok(Array.isArray(data.ADVERB_QUESTIONS));
assert.ok(Array.isArray(data.TENSE_QUESTIONS));
assert.ok(Array.isArray(data.VERB_TABLE_QUESTIONS));
assert.ok(Array.isArray(data.HAVE_USAGE_QUESTIONS));

assert.strictEqual(data.LESSONS.lesson1.questions, data.QUESTIONS);
assert.strictEqual(data.LESSONS.lesson2.questions, data.VERB_COUNT_QUESTIONS);
assert.strictEqual(data.LESSONS["noun-category"].questions, data.NOUN_CATEGORY_QUESTIONS);
assert.strictEqual(data.LESSONS["modal-verb"].questions, data.MODAL_VERB_QUESTIONS);
assert.strictEqual(data.LESSONS["adjective-lesson"].questions, data.ADJECTIVE_QUESTIONS);
assert.strictEqual(data.LESSONS["adverb-lesson"].questions, data.ADVERB_QUESTIONS);
assert.strictEqual(data.LESSONS.tenses.questions, data.TENSE_QUESTIONS);
assert.strictEqual(data.LESSONS["verb-table"].questions, data.VERB_TABLE_QUESTIONS);
assert.strictEqual(data.LESSONS["have-usage"].questions, data.HAVE_USAGE_QUESTIONS);
assert.strictEqual(data.LESSONS["adjective-lesson"].kicker, "Lesson 09");
assert.strictEqual(data.LESSONS["adverb-lesson"].kicker, "Lesson 10");
assert.strictEqual(data.LESSONS.tenses.kicker, "Lesson 11");
assert.strictEqual(data.LESSONS["verb-table"].kicker, "Lesson 12");
assert.strictEqual(data.LESSONS["have-usage"].kicker, "Lesson 13");

const lesson2Text = data.VERB_COUNT_QUESTIONS
  .map((question) => [question.sentence, question.zh, question.explanation, question.correction].join("\n"))
  .join("\n");
[
  "過去式",
  "ING",
  "PP",
  "yesterday",
  " now.",
  "swam",
  "ate lunch",
  "reading",
  "playing",
  "sleeping"
].forEach((notYetTaughtPattern) => {
  assert.strictEqual(lesson2Text.includes(notYetTaughtPattern), false);
});
assert.ok(data.VERB_COUNT_QUESTIONS.filter((question) => !question.isCorrect).every((question) => (
  question.correctSentence
    && Array.isArray(question.acceptedAnswers)
    && question.acceptedAnswers.includes(question.correctSentence)
)));

assert.strictEqual(data.capitalizeWord("apple"), core.capitalizeWord("apple"));
assert.strictEqual(data.PRONOUN_SENTENCE_FORMS.He.subject.present, "thirdSingular");
assert.strictEqual(data.PRONOUN_SENTENCE_FORMS.him.roles.includes("object"), true);
assert.strictEqual(data.PRONOUN_SENTENCE_QUESTION_BANK.length, 50);
assert.strictEqual(data.PRONOUN_SENTENCE_QUESTION_BANK.every((question) => question.zh), true);
assert.ok(data.PRONOUN_SENTENCE_QUESTION_BANK.some((question) => question.sentence === "He is waiting for ___."));
assert.strictEqual(
  data.PRONOUN_SENTENCE_QUESTION_BANK.some((question) => question.sentence === "Sam waits for ___."),
  false
);
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

assert.strictEqual(data.NOUN_CATEGORY_QUESTIONS.length, 60);
assert.strictEqual(data.NOUN_CATEGORY_QUESTIONS.filter((question) => question.isCorrect).length, 30);
assert.strictEqual(data.NOUN_CATEGORY_QUESTIONS.filter((question) => !question.isCorrect).length, 30);
assert.ok(data.NOUN_CATEGORY_QUESTIONS.every((question) => question.type === "noun-category"));
assert.ok(data.NOUN_CATEGORY_QUESTIONS.every((question) => question.sentence && question.zh && question.answer && question.explanation));
assert.ok(data.NOUN_CATEGORY_QUESTIONS.filter((question) => !question.isCorrect).every((question) => (
  Array.isArray(question.acceptedAnswers)
    && question.acceptedAnswers.includes(question.answer)
)));

const nounCategorySet = new Set(data.NOUN_CATEGORY_QUESTIONS.map((question) => question.category));
["countable", "uncountable", "gerund", "proper-noun"].forEach((category) => {
  assert.strictEqual(nounCategorySet.has(category), true);
});

const nounCategoryQuestionText = data.NOUN_CATEGORY_QUESTIONS
  .map((question) => [question.sentence, question.zh, question.answer, question.explanation].join("\n"))
  .join("\n");
[
  "I like cats.",
  "Information is useful.",
  "I can see a girl holding a pen.",
  "Tom is my friend."
].forEach((expectedExample) => {
  assert.strictEqual(nounCategoryQuestionText.includes(expectedExample), true);
});

assert.strictEqual(data.MODAL_VERB_QUESTIONS.length, 60);
assert.strictEqual(data.MODAL_VERB_QUESTIONS.filter((question) => question.isCorrect).length, 30);
assert.strictEqual(data.MODAL_VERB_QUESTIONS.filter((question) => !question.isCorrect).length, 30);
assert.ok(data.MODAL_VERB_QUESTIONS.every((question) => question.type === "modal-verb"));
assert.ok(data.MODAL_VERB_QUESTIONS.every((question) => question.sentence && question.zh && question.answer && question.explanation));
assert.ok(data.MODAL_VERB_QUESTIONS.filter((question) => !question.isCorrect).every((question) => (
  Array.isArray(question.acceptedAnswers)
    && question.acceptedAnswers.includes(question.answer)
)));

const modalVerbCategorySet = new Set(data.MODAL_VERB_QUESTIONS.map((question) => question.category));
["base-verb", "be", "position"].forEach((category) => {
  assert.strictEqual(modalVerbCategorySet.has(category), true);
});

const modalVerbQuestionText = data.MODAL_VERB_QUESTIONS
  .map((question) => [question.sentence, question.zh, question.answer, question.explanation].join("\n"))
  .join("\n");
[
  "I can swim.",
  "I may be late.",
  "He may be able to pass the exam.",
  "Modal verb"
].forEach((expectedExample) => {
  assert.strictEqual(modalVerbQuestionText.includes(expectedExample), true);
});

assert.strictEqual(data.ADJECTIVE_QUESTIONS.length, 60);
assert.strictEqual(data.ADJECTIVE_QUESTIONS.filter((question) => question.isCorrect).length, 30);
assert.strictEqual(data.ADJECTIVE_QUESTIONS.filter((question) => !question.isCorrect).length, 30);
assert.ok(data.ADJECTIVE_QUESTIONS.every((question) => question.type === "adjective-lesson"));
assert.ok(data.ADJECTIVE_QUESTIONS.every((question) => question.sentence && question.zh && question.answer && question.explanation));
assert.ok(data.ADJECTIVE_QUESTIONS.filter((question) => !question.isCorrect).every((question) => (
  Array.isArray(question.acceptedAnswers)
    && question.acceptedAnswers.includes(question.answer)
)));

const adjectiveCategorySet = new Set(data.ADJECTIVE_QUESTIONS.map((question) => question.category));
["simple", "hyphen", "compound"].forEach((category) => {
  assert.strictEqual(adjectiveCategorySet.has(category), true);
});

const adjectiveQuestionText = data.ADJECTIVE_QUESTIONS
  .map((question) => [question.sentence, question.zh, question.answer, question.explanation].join("\n"))
  .join("\n");
[
  "He is willing to help me.",
  "I am interested in English.",
  "They are excited about the trip.",
  "It is a high-quality school bag.",
  "形容詞"
].forEach((expectedExample) => {
  assert.strictEqual(adjectiveQuestionText.includes(expectedExample), true);
});

assert.strictEqual(data.ADVERB_QUESTIONS.length, 100);
assert.strictEqual(data.ADVERB_QUESTIONS.length % 2, 0);
assert.strictEqual(data.ADVERB_QUESTIONS.filter((question) => question.isCorrect).length, data.ADVERB_QUESTIONS.length / 2);
assert.strictEqual(data.ADVERB_QUESTIONS.filter((question) => !question.isCorrect).length, data.ADVERB_QUESTIONS.length / 2);
assert.ok(data.ADVERB_QUESTIONS.every((question) => question.type === "adverb-lesson"));
assert.ok(data.ADVERB_QUESTIONS.every((question) => question.sentence && question.zh && question.answer && question.explanation));
assert.ok(data.ADVERB_QUESTIONS.filter((question) => !question.isCorrect).every((question) => (
  Array.isArray(question.acceptedAnswers)
    && question.acceptedAnswers.includes(question.answer)
)));

const adverbCategorySet = new Set(data.ADVERB_QUESTIONS.map((question) => question.category));
["front", "end-time", "end-place", "end-order", "end-manner", "middle", "degree"].forEach((category) => {
  assert.strictEqual(adverbCategorySet.has(category), true);
});

const adverbQuestionText = data.ADVERB_QUESTIONS
  .map((question) => [question.sentence, question.zh, question.answer, question.explanation].join("\n"))
  .join("\n");
[
  "Interestingly, Tom likes grammar.",
  "I lived in Tsuen Wan in 2010.",
  "I can still walk.",
  "He is even willing to help me.",
  "They even know my birthday.",
  "I go to school every day.",
  "Please try again.",
  "The box is very heavy.",
  "I really like this story.",
  "I like this book very much.",
  "Certainly, I can help you.",
  "副詞"
].forEach((expectedExample) => {
  assert.strictEqual(adverbQuestionText.includes(expectedExample), true);
});

const commonAdverbExamples = [
  "interestingly",
  "importantly",
  "strangely",
  "luckily",
  "clearly",
  "surely",
  "certainly",
  "every day",
  "tomorrow",
  "yesterday",
  "today",
  "next week",
  "at night",
  "on monday",
  "now",
  "soon",
  "again",
  "here",
  "there",
  "overseas",
  "abroad",
  "happily",
  "quickly",
  "carefully",
  "slowly",
  "well",
  "once in a while",
  "still",
  "even",
  "always",
  "usually",
  "often",
  "sometimes",
  "never",
  "also",
  "already",
  "just",
  "probably",
  "very",
  "really",
  "very much",
  "too",
  "quite"
];
const lowerAdverbQuestionText = adverbQuestionText.toLowerCase();
const coveredCommonAdverbs = commonAdverbExamples.filter((term) => {
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z])${escapedTerm}([^a-z]|$)`).test(lowerAdverbQuestionText);
});
assert.ok(coveredCommonAdverbs.length >= 40);

assert.strictEqual(data.TENSE_QUESTIONS.length, 260);
assert.deepStrictEqual(data.TENSE_OPTION_ROWS, [
  ["present", "past", "continuous"],
  ["perfect", "perfectContinuous"]
]);
assert.deepStrictEqual(data.TENSE_LABELS, {
  present: "現在式",
  past: "過去式",
  continuous: "進行式",
  perfect: "has/have + pp",
  perfectContinuous: "has/have + been + Ving"
});
assert.ok(data.TENSE_QUESTIONS.every((question) => (
  question.type === "tenses"
    && question.zh
    && question.sentence.includes("___")
    && question.answer
    && question.english.includes(question.answer)
    && Array.isArray(question.acceptedAnswers)
    && question.acceptedAnswers.includes(question.answer)
    && question.explanation
)));
const tenseCounts = data.TENSE_QUESTIONS.reduce((counts, question) => {
  counts[question.tense] = (counts[question.tense] || 0) + 1;
  return counts;
}, {});
assert.deepStrictEqual(tenseCounts, {
  present: 52,
  past: 52,
  continuous: 52,
  perfect: 56,
  perfectContinuous: 48
});

const tenseQuestionText = data.TENSE_QUESTIONS
  .map((question) => [question.zh, question.sentence, question.answer, question.english, question.explanation].join("\n"))
  .join("\n");
[
  "He seldom ___ beer.",
  "Dogs often ___ holes.",
  "I wish I ___ a rich dad.",
  "When you called me, I ___.",
  "I ___ the project.",
  "Have you ever ___ to Japan?",
  "He ___ today.",
  "I ___ English for many years.",
  "My brother ___ his teeth every day.",
  "I ___ a sandwich yesterday.",
  "I ___ an English book now.",
  "I ___ my room.",
  "She ___ all morning.",
  "has/have + pp",
  "has/have + been + Ving"
].forEach((expectedExample) => {
  assert.strictEqual(tenseQuestionText.includes(expectedExample), true);
});

const appSource = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
[
  "function showTenseScopePicker()",
  "function startTensePracticeWithScope",
  "function getTenseChoiceRowsForPractice",
  "if (!shouldAskTenseQuestion())",
  "只選一種就直接填空，不會再問時態。",
  "data-tense-scope",
  "全部混合"
].forEach((expectedSource) => {
  assert.strictEqual(appSource.includes(expectedSource), true);
});

assert.strictEqual(data.HAVE_USAGE_QUESTIONS.length, 80);
assert.strictEqual(data.HAVE_USAGE_QUESTIONS.filter((question) => question.isCorrect).length, 40);
assert.strictEqual(data.HAVE_USAGE_QUESTIONS.filter((question) => !question.isCorrect).length, 40);
assert.deepStrictEqual(data.HAVE_USAGE_OPTION_ROWS, [["there-be", "with-without", "have"]]);
assert.deepStrictEqual(data.HAVE_USAGE_LABELS, {
  "there-be": "There be",
  "with-without": "with / without",
  have: "have / has"
});
assert.ok(data.HAVE_USAGE_QUESTIONS.every((question) => (
  question.type === "have-usage"
    && question.category
    && question.categoryLabel
    && question.sentence
    && question.zh
    && question.answer
    && question.english
    && Array.isArray(question.acceptedAnswers)
    && question.acceptedAnswers.includes(question.answer)
    && question.explanation
)));
const haveUsageCategorySet = new Set(data.HAVE_USAGE_QUESTIONS.map((question) => question.category));
["there-be", "with-without", "have"].forEach((category) => {
  assert.strictEqual(haveUsageCategorySet.has(category), true);
});
const haveUsageQuestionText = data.HAVE_USAGE_QUESTIONS
  .map((question) => [question.sentence, question.zh, question.answer, question.explanation].join("\n"))
  .join("\n");
[
  "There are many wet markets in Hong Kong.",
  "There is a lot of fake news online.",
  "There are many students asking me this question.",
  "There are many students punished by my class teacher.",
  "I want a tortoise with two heads.",
  "With your help, I believe I can pass.",
  "Without you, my life is meaningless.",
  "They have many questions.",
  "These chairs do not have price tags.",
  "There be",
  "with / without",
  "have / has"
].forEach((expectedExample) => {
  assert.strictEqual(haveUsageQuestionText.includes(expectedExample), true);
});
[
  "function renderHaveUsageQuestion",
  "function answerHaveUsageCategory",
  "state.haveUsageCategoryAnswered",
  "dataset.haveUsageChoice",
  "Lesson 13"
].forEach((expectedSource) => {
  assert.strictEqual(appSource.includes(expectedSource), true);
});

console.log("grammar_data tests passed");
