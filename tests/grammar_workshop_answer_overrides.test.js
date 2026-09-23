const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const {
  REVIEWED_CHOICE_OVERRIDES,
  REVIEWED_CHOICE_REJECTIONS,
  formalQuestionTag,
} = require('../scripts/grammar-workshop-answer-overrides');
const {
  auditQuestion,
  tenseReviewIssues,
} = require('../scripts/audit-grammar-workshop-answers');

const root = path.resolve(__dirname, '..');
const packageData = JSON.parse(fs.readFileSync(
  path.join(root, 'flutter_app/assets/data/battleship_grammar_topics.json'),
  'utf8',
));

test('the first reviewed Workshop batch covers every time-preposition question', () => {
  const approved = REVIEWED_CHOICE_OVERRIDES.PREPOSITION_OF_TIME;
  const rejected = REVIEWED_CHOICE_REJECTIONS;
  for (let number = 1; number <= 200; number += 1) {
    const id = `preposition_time_${String(number).padStart(3, '0')}`;
    assert.ok(
      approved[id] || rejected[`PREPOSITION_OF_TIME/${id}`],
      `${id} has no recorded review decision`,
    );
  }
  assert.equal(Object.keys(approved).length, 32);
});

test('the reviewed place batch covers every place-preposition question', () => {
  const approved = REVIEWED_CHOICE_OVERRIDES.PREPOSITION_OF_PLACE;
  for (let number = 1; number <= 200; number += 1) {
    const id = `preposition_place_${String(number).padStart(3, '0')}`;
    assert.ok(
      approved[id] || REVIEWED_CHOICE_REJECTIONS[`PREPOSITION_OF_PLACE/${id}`],
      `${id} has no recorded review decision`,
    );
  }
  assert.equal(Object.keys(approved).length, 47);
});

test('the reviewed phrasal-verb batch covers all questions and records the corrected prompt', () => {
  const approved = REVIEWED_CHOICE_OVERRIDES.PHRASAL_VERB;
  for (let number = 1; number <= 100; number += 1) {
    const id = `phrasal_verb_${String(number).padStart(3, '0')}`;
    assert.ok(
      approved[id] || REVIEWED_CHOICE_REJECTIONS[`PHRASAL_VERB/${id}`],
      `${id} has no recorded review decision`,
    );
  }
  assert.equal(approved.phrasal_verb_039.question.includes('my friend'), true);
});

test('the reviewed compound-adjective batch covers all questions and fixes delighted', () => {
  const approved = REVIEWED_CHOICE_OVERRIDES.COMPOUND_ADJ;
  for (let number = 1; number <= 175; number += 1) {
    const id = `compound_adj_${String(number).padStart(3, '0')}`;
    assert.ok(
      approved[id] || REVIEWED_CHOICE_REJECTIONS[`COMPOUND_ADJ/${id}`],
      `${id} has no recorded review decision`,
    );
  }
  assert.equal(Object.keys(approved).length, 36);
  assert.equal(approved.compound_adj_173.question.includes('delighted'), true);
});

test('the reviewed comparative batch covers every question', () => {
  const approved = REVIEWED_CHOICE_OVERRIDES.COMPARATIVE_SUPERLATIVE;
  for (let number = 1; number <= 139; number += 1) {
    const id = `comparative_superlative_${String(number).padStart(3, '0')}`;
    assert.ok(
      approved[id] || REVIEWED_CHOICE_REJECTIONS[`COMPARATIVE_SUPERLATIVE/${id}`],
      `${id} has no recorded review decision`,
    );
  }
  assert.equal(Object.keys(approved).length, 17);
});

test('reviewed verb-form variants include common British and American forms', () => {
  const verbs = REVIEWED_CHOICE_OVERRIDES.VERB_TABLE;
  assert.equal(Object.keys(verbs).length, 29);
  assert.equal(verbs.verb_learn_91fcb76d7dec.past, 'learnt/learned');
  assert.equal(verbs.verb_practise_20bde8dab6ba.present, 'practise/practice');
  assert.equal(verbs.verb_travel_e239864116a7.ing, 'travelling/traveling');
});

test('the inversion batch covers all questions and records normal-order equivalents', () => {
  const approved = REVIEWED_CHOICE_OVERRIDES.INVERSION;
  for (let number = 1; number <= 109; number += 1) {
    const id = `inversion_${String(number).padStart(3, '0')}`;
    assert.ok(
      approved[id] || REVIEWED_CHOICE_REJECTIONS[`INVERSION/${id}`],
      `${id} has no recorded review decision`,
    );
  }
  assert.equal(Object.keys(approved).length, 14);
});

test('every approved alternative is a visible option in the bundled question', () => {
  for (const [topicKey, overrides] of Object.entries(REVIEWED_CHOICE_OVERRIDES)) {
    const questions = packageData.topics[topicKey].questions;
    for (const [id, override] of Object.entries(overrides)) {
      assert.ok(questions[id], `${id} is missing`);
      if (!override.acceptedAnswers.length) continue;
      override.acceptedAnswers.forEach((answer) => {
        if (Array.isArray(questions[id].options)) {
          assert.ok(questions[id].options.includes(answer), `${id} does not offer ${answer}`);
          assert.ok(questions[id].acceptedAnswers.includes(answer), `${id} did not export ${answer}`);
        } else {
          assert.ok(questions[id].answers.includes(answer), `${id} did not export ${answer}`);
        }
      });
    }
  }
});

test('formal question-tag alternatives are generated without changing positive tags', () => {
  assert.equal(formalQuestionTag("isn't it"), 'is it not');
  assert.equal(formalQuestionTag("aren't I"), 'am I not');
  assert.equal(formalQuestionTag('is she'), '');
  const questions = packageData.topics.QUESTION_TAG.questions;
  assert.ok(questions.question_tag_001.answers.includes('is it not'));
  assert.ok(questions.question_tag_008.answers.includes('am I not'));
  assert.deepEqual(questions.question_tag_012.answers, ['is she']);
});

test('every pronoun question has a recorded systematic review decision', () => {
  const topic = packageData.topics.PRONOUN;
  const rows = Object.values(topic.questions).map((question) =>
    auditQuestion('PRONOUN', topic, question));
  assert.equal(rows.length, 130);
  assert.equal(rows.every((row) => row.reviewStatus.startsWith('reviewed-')), true);
  assert.deepEqual(topic.questions.pronoun_013.answers, ['me', 'I']);
  assert.equal(topic.questions.pronoun_114.question.includes('in ______ collection'), true);
});

test('every conditional question has a recorded systematic review decision', () => {
  const topic = packageData.topics.CONDITIONAL;
  const rows = Object.values(topic.questions).map((question) =>
    auditQuestion('CONDITIONAL', topic, question));
  assert.equal(rows.length, 240);
  assert.equal(rows.every((row) => row.reviewStatus.startsWith('reviewed-')), true);
});

test('every indirect-question item has a recorded systematic review decision', () => {
  const topic = packageData.topics.INDIRECT_QUESTION;
  const rows = Object.values(topic.questions).map((question) =>
    auditQuestion('INDIRECT_QUESTION', topic, question));
  assert.equal(rows.length, 164);
  assert.equal(rows.every((row) => row.reviewStatus.startsWith('reviewed-')), true);
});

test('direct, It-is, and reported-speech topics have systematic review decisions', () => {
  for (const topicKey of [
    'DIRECT_QUESTION',
    'IT_IS',
    'REPORTED_SPEECH',
    'PARTICIPLE_PHRASES',
    'DE_STRUCTURE',
  ]) {
    const topic = packageData.topics[topicKey];
    const rows = Object.values(topic.questions).map((question) =>
      auditQuestion(topicKey, topic, question));
    assert.equal(
      rows.every((row) => row.reviewStatus.startsWith('reviewed-')),
      true,
      topicKey,
    );
  }
});

test('the tense validator covers every item and rejects broken fixtures', () => {
  const topic = packageData.topics.TENSES;
  const questions = Object.values(topic.questions);
  assert.equal(questions.length, 1166);
  assert.equal(questions.every((question) => tenseReviewIssues(question).length === 0), true);
  assert.ok(tenseReviewIssues({
    id: 'broken-tense',
    question: 'She ______ and ______.',
    chinese: '她正在測試。',
    exp: 'Present continuous active.',
    tense: 'present_continuous',
    voice: 'active',
    answers: ['is testing'],
    answerSlots: ['is testing'],
  }).includes('blank-slot-count-mismatch:2:1'));
  assert.ok(tenseReviewIssues({
    id: 'broken-morphology',
    question: 'She ______ (test).',
    chinese: '她正在測試。',
    exp: 'Present continuous active.',
    tense: 'present_continuous',
    voice: 'active',
    answers: ['tested'],
    answerSlots: ['tested'],
  }).includes('answer-shape-mismatch:present_continuous|active'));
});
