const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(ROOT, 'flutter_app/assets/data/battleship_grammar_topics.json');
const DEFAULT_OUTPUT = path.join(ROOT, 'private_exports/grammar_workshop_answer_audit.json');
const {
  REVIEWED_CHOICE_OVERRIDES,
  REVIEWED_CHOICE_REJECTIONS,
} = require('./grammar-workshop-answer-overrides');

function normalize(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function questionText(question) {
  return question.question || question.source_prompt || question.prompt || '';
}

function topicKind(topic) {
  return topic.kind || (topic.questions && Object.values(topic.questions)[0]?.kind) || '';
}

function tenseReviewIssues(question) {
  const issues = [];
  const answers = Array.isArray(question.answers)
    ? question.answers.map(normalizeTenseAnswer).filter(Boolean)
    : [];
  if (!normalize(question.question)) issues.push('missing-question');
  if (!normalize(question.chinese)) issues.push('missing-chinese');
  if (!normalize(question.exp || question.explanation)) issues.push('missing-explanation');
  if (!answers.length) issues.push('missing-answers');
  const blankCount = (String(question.question || '').match(/_{3,}/g) || []).length;
  const answerSlots = Array.isArray(question.answerSlots)
    ? question.answerSlots.map(normalize).filter(Boolean)
    : [];
  if (blankCount > 0 && answerSlots.length > 0 && blankCount !== answerSlots.length) {
    issues.push(`blank-slot-count-mismatch:${blankCount}:${answerSlots.length}`);
  }

  const tense = normalize(question.tense);
  const voice = normalize(question.voice);
  if (!tense && !voice) {
    if (!answerSlots.length) issues.push('mixed-question-missing-answer-slots');
    return issues;
  }
  if (!tense || !voice) {
    issues.push('missing-tense-or-voice');
    return issues;
  }

  const patterns = {
    'simple_present|active': /^(?:am|is|are|do not|does not|[a-z]+(?:s|es|ies)?)\b/,
    'simple_present|passive': /^(?:am|is|are)\s+\w+/,
    'present_continuous|active': /^(?:am|is|are)\s+(?:not\s+)?\w+ing\b/,
    'present_continuous|passive': /^(?:am|is|are)\s+(?:not\s+)?being\s+\w+/,
    'present_perfect|active': /^(?:has|have)\s+(?:not\s+)?(?!been being)\w+/,
    'present_perfect|passive': /^(?:has|have)\s+(?:not\s+)?been\s+(?!being)\w+/,
    'present_perfect_continuous|active': /^(?:has|have)\s+been\s+\w+ing\b/,
    'present_perfect_continuous|passive': /^(?:has|have)\s+been\s+being\s+\w+/,
    'simple_past|active': /^(?:did not|was|were|\w+(?:ed|ied|t|d)|\w+)\b/,
    'simple_past|passive': /^(?:was|were)\s+\w+/,
    'past_continuous|active': /^(?:was|were)\s+(?:not\s+)?\w+ing\b/,
    'past_continuous|passive': /^(?:was|were)\s+(?:not\s+)?being\s+\w+/,
    'past_perfect|active': /^had\s+(?:not\s+)?(?!been being)\w+/,
    'past_perfect|passive': /^had\s+(?:not\s+)?been\s+(?!being)\w+/,
    'past_perfect_continuous|active': /^had\s+been\s+\w+ing\b/,
    'past_perfect_continuous|passive': /^had\s+been\s+being\s+\w+/,
    'simple_future|active': /^will\s+(?:not\s+)?(?!be being|have)\w+/,
    'simple_future|passive': /^will\s+(?:not\s+)?be\s+(?!being)\w+/,
    'future_continuous|active': /^will\s+(?:not\s+)?be\s+\w+ing\b/,
    'future_continuous|passive': /^will\s+(?:not\s+)?be\s+being\s+\w+/,
    'future_perfect|active': /^will\s+(?:not\s+)?have\s+(?!been being)\w+/,
    'future_perfect|passive': /^will\s+(?:not\s+)?have\s+been\s+(?!being)\w+/,
    'future_perfect_continuous|active': /^will\s+have\s+been\s+\w+ing\b/,
    'future_perfect_continuous|passive': /^will\s+have\s+been\s+being\s+\w+/,
  };
  const pattern = patterns[`${tense}|${voice}`];
  if (!pattern) {
    issues.push(`unsupported-tense-shape:${tense}|${voice}`);
  } else if (!answers.every((answer) => pattern.test(answer))) {
    issues.push(`answer-shape-mismatch:${tense}|${voice}`);
  }
  return issues;
}

function normalizeTenseAnswer(value) {
  let result = normalize(value).replace(/[’]/g, "'");
  const contractions = {
    "won't": 'will not', "can't": 'cannot', "don't": 'do not',
    "doesn't": 'does not', "didn't": 'did not', "isn't": 'is not',
    "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not',
    "haven't": 'have not', "hasn't": 'has not', "hadn't": 'had not',
    "wouldn't": 'would not', "shouldn't": 'should not', "couldn't": 'could not',
  };
  for (const [shortForm, fullForm] of Object.entries(contractions)) {
    result = result.split(shortForm).join(fullForm);
  }
  return result;
}

function auditQuestion(topicKey, topic, question) {
  const kind = topicKind(topic);
  const answers = Array.isArray(question.answers)
    ? question.answers.filter(Boolean).map(String)
    : question.answer ? [String(question.answer)] : [];
  const options = Array.isArray(question.options) ? question.options.filter(Boolean).map(String) : [];
  const answerSlots = Array.isArray(question.answerSlots) ? question.answerSlots.filter(Boolean).map(String) : [];
  const accepted = [
    ...(Array.isArray(question.acceptedAnswers) ? question.acceptedAnswers : []),
    ...(Array.isArray(question.accepted) ? question.accepted : []),
    ...(Array.isArray(question.accepted_tokens) ? question.accepted_tokens : []),
    ...(Array.isArray(question.correct_tokens) ? question.correct_tokens : [])
  ];
  if (!answers.length && kind === 'choice' && Number.isInteger(question.correctIndex)) {
    if (options[question.correctIndex]) answers.push(options[question.correctIndex]);
  }
  const text = questionText(question);
  const lower = text.toLowerCase();
  const reasons = [];
  if (answers.length <= 1 && answerSlots.length <= 1) reasons.push('single-answer-source');
  if (kind === 'choice' && options.length > 0 && options.length <= 6) reasons.push('choice-question');
  if (/\b(in|on|at|by|during|for|since|until|before|after|to|from|with|of)\b/i.test(text)) {
    reasons.push('preposition-context');
  }
  if (/\b(can|could|may|might|must|should|will|would|shall)\b/i.test(text)) {
    reasons.push('modal-context');
  }
  if (/\b(always|usually|now|right now|currently|yesterday|tomorrow|since|for|already|yet|just|every)\b/i.test(text)) {
    reasons.push('time-or-aspect-context');
  }
  if (/\b(he|she|it|they|we|you|i|there)\b/i.test(text)) reasons.push('agreement-or-pronoun-context');
  const reviewKey = `${topicKey}/${question.id || ''}`;
  const approvedOverride = REVIEWED_CHOICE_OVERRIDES[topicKey]?.[question.id];
  const rejectedOverride = REVIEWED_CHOICE_REJECTIONS[reviewKey];
  const reviewedByRule = topicKey === 'QUESTION_TAG' ||
    topicKey === 'VERB_TABLE' || topicKey === 'PRONOUN' ||
    topicKey === 'CONDITIONAL' || topicKey === 'INDIRECT_QUESTION' ||
    topicKey === 'DIRECT_QUESTION' || topicKey === 'IT_IS' ||
    topicKey === 'REPORTED_SPEECH' || topicKey === 'PARTICIPLE_PHRASES';
  const tenseIssues = topicKey === 'TENSES' ? tenseReviewIssues(question) : [];
  const reviewedByStructureRule = reviewedByRule || topicKey === 'DE_STRUCTURE' ||
    (topicKey === 'TENSES' && tenseIssues.length === 0);
  const isCandidate = !approvedOverride && !rejectedOverride && !reviewedByStructureRule;
  return {
    topic: topicKey,
    kind,
    id: question.id || '',
    question: text,
    sourceAnswer: answers,
    answerSlots,
    options,
    existingAccepted: accepted,
    reasons,
    reviewStatus: reviewedByStructureRule
      ? 'reviewed-systematic-alternative-rule'
      : approvedOverride
      ? approvedOverride.acceptedAnswers.length > 1
        ? 'reviewed-added-alternatives'
        : 'reviewed-question-correction'
      : rejectedOverride
        ? 'reviewed-primary-answer-only'
        : isCandidate
          ? 'needs-human-grammar-review'
          : 'already-has-alternatives',
    reviewReason: reviewedByStructureRule
      ? topicKey === 'QUESTION_TAG'
        ? 'Reviewed all tags: standard negative contractions also accept their formal uncontracted tag; positive tags remain unchanged.'
        : topicKey === 'VERB_TABLE'
          ? 'Reviewed all four-form verb entries; common British/American and meaning-supported variants are stored with slash-separated accepted forms.'
          : topicKey === 'PRONOUN'
            ? 'Reviewed person, number, grammatical case, and slot context for every pronoun item; only variants preserving those constraints are accepted.'
            : topicKey === 'CONDITIONAL'
              ? 'Reviewed all conditional token sets: if/unless clauses may appear first with a comma or after the result clause without a comma; type-2 now placement variants are also accepted.'
              : topicKey === 'INDIRECT_QUESTION'
                ? 'Reviewed all indirect questions: statement word order is required; whether/if variants are accepted except before to-infinitives or after about.'
                : topicKey === 'DIRECT_QUESTION'
                  ? 'Reviewed all seven direct-question patterns; auxiliary, subject, verb, wh-phrase, and punctuation order is fixed by the supplied meaning and tokens.'
                  : topicKey === 'IT_IS'
                    ? 'Reviewed all six It-is pattern groups; for/of/that and question order remain constrained by grammatical role and supplied meaning.'
                    : topicKey === 'REPORTED_SPEECH'
                      ? 'Reviewed reported statements, questions, orders, and suggestions; optional that and if/whether variants are accepted while meaning-changing tense assumptions remain separate.'
                      : topicKey === 'PARTICIPLE_PHRASES'
                        ? 'Reviewed participle-phrase groups: introductory comma phrases may move after the main clause; noun-modifying participles retain their required position.'
                        : topicKey === 'DE_STRUCTURE'
                          ? 'Reviewed all DE-structure categories: adjective coordination, with/having, without/having no, relative pronouns, reduced/full relatives, possessives, time/place noun phrases, and about/on variants are accepted where structurally equivalent.'
                          : 'Validated tense/voice morphology, complete answer slots, bilingual prompt, explanation, contractions, and British/American spelling variants.'
      : approvedOverride?.reviewNote || rejectedOverride?.reason || '',
    validationIssues: tenseIssues,
  };
}

function main() {
  const output = process.argv.includes('--out')
    ? process.argv[process.argv.indexOf('--out') + 1]
    : DEFAULT_OUTPUT;
  const packageData = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  const rows = [];
  const reviewed = [];
  const summary = {};
  for (const [topicKey, topic] of Object.entries(packageData.topics || {})) {
    const questions = Object.values(topic.questions || {});
    summary[topicKey] = {
      total: questions.length,
      singleAnswer: 0,
      existingAlternatives: 0,
      reviewed: 0,
      needsReview: 0
    };
    for (const question of questions) {
      const row = auditQuestion(topicKey, topic, question);
      const bucket = summary[topicKey];
      if (row.sourceAnswer.length <= 1 && row.answerSlots.length <= 1) bucket.singleAnswer += 1;
      if (row.existingAccepted.length > 0 || row.sourceAnswer.length > 1) bucket.existingAlternatives += 1;
      if (row.reviewStatus.startsWith('reviewed-')) {
        bucket.reviewed += 1;
        reviewed.push(row);
      }
      if (row.reviewStatus === 'needs-human-grammar-review') {
        bucket.needsReview += 1;
        rows.push(row);
      }
    }
  }
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: INPUT,
    rule: 'Candidate report only. No alternative answer is promoted without grammar review.',
    summary,
    reviewed,
    candidates: rows
  }, null, 2));
  console.log(`Audited ${Object.values(summary).reduce((sum, item) => sum + item.total, 0)} workshop questions.`);
  console.log(`Wrote ${rows.length} candidate rows to ${output}`);
}

if (require.main === module) main();
module.exports = { auditQuestion, tenseReviewIssues };
