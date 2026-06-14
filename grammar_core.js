(function attachGrammarCore(root, factory) {
  const core = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = core;
  }
  root.GrammarCore = core;
})(typeof globalThis !== "undefined" ? globalThis : window, function createGrammarCore() {
  "use strict";

  const VERB_TABLE_FIELDS = [
    { key: "present", label: "現在式", shortLabel: "Present" },
    { key: "past", label: "過去式", shortLabel: "Past" },
    { key: "pp", label: "PP", shortLabel: "PP" },
    { key: "ing", label: "ING", shortLabel: "ING" }
  ];

  function capitalizeWord(word) {
    const value = String(word || "");
    return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
  }

  function questionHasVerb(question) {
    return question?.type === "action";
  }

  function getSafeInteger(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback;
  }

  function getRandomIndex(maxExclusive, rng = Math.random) {
    const rawValue = typeof rng === "function" ? Number(rng()) : Math.random();
    const safeValue = Number.isFinite(rawValue) ? Math.max(0, Math.min(rawValue, 0.999999999999)) : 0;
    return Math.floor(safeValue * maxExclusive);
  }

  function shuffleItems(items, rng = Math.random) {
    const copy = Array.isArray(items) ? [...items] : [];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = getRandomIndex(index + 1, rng);
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
  }

  function getQuestionQuotas(count, questions, weights) {
    const questionList = Array.isArray(questions) ? questions : [];
    const weightMap = weights || {};
    const types = Object.keys(weightMap);
    const targetCount = Math.min(getSafeInteger(count), questionList.length);
    const availableCounts = Object.fromEntries(
      types.map((type) => [type, questionList.filter((question) => question?.type === type).length])
    );
    const quotas = Object.fromEntries(types.map((type) => [type, 0]));
    const weightedTypes = types.map((type) => {
      const exactQuota = targetCount * Number(weightMap[type] || 0);
      const baseQuota = Math.min(availableCounts[type], Math.floor(exactQuota));
      quotas[type] = baseQuota;
      return {
        type,
        remainder: exactQuota - baseQuota
      };
    });
    let assigned = Object.values(quotas).reduce((total, quota) => total + quota, 0);

    while (assigned < targetCount) {
      const nextType = weightedTypes
        .filter(({ type }) => quotas[type] < availableCounts[type])
        .sort((left, right) => {
          if (right.remainder !== left.remainder) return right.remainder - left.remainder;
          return Number(weightMap[right.type] || 0) - Number(weightMap[left.type] || 0);
        })[0]?.type;

      if (!nextType) break;
      quotas[nextType] += 1;
      assigned += 1;
    }

    return quotas;
  }

  function pickWeightedQuestions(count, questions, weights, rng = Math.random) {
    const questionList = Array.isArray(questions) ? questions : [];
    const quotas = getQuestionQuotas(count, questionList, weights);
    const buckets = Object.fromEntries(
      Object.entries(quotas).map(([type, quota]) => [
        type,
        shuffleItems(questionList.filter((question) => question?.type === type), rng).slice(0, quota)
      ])
    );
    const targetCount = Object.values(buckets).reduce((total, bucket) => total + bucket.length, 0);
    const mixed = [];
    let previousType = "";

    while (mixed.length < targetCount) {
      const availableTypes = Object.keys(buckets).filter((type) => buckets[type].length > 0);
      if (!availableTypes.length) break;
      const choices = availableTypes.filter((type) => type !== previousType);
      const pool = choices.length ? choices : availableTypes;
      const nextType = pool[getRandomIndex(pool.length, rng)];
      mixed.push(buckets[nextType].pop());
      previousType = nextType;
    }

    return mixed;
  }

  function pickLessonQuestions(lessonId, count, lessons, options = {}) {
    const lessonMap = lessons || {};
    const fallbackLessonId = options.fallbackLessonId || Object.keys(lessonMap)[0];
    const lesson = lessonMap[lessonId] || lessonMap[fallbackLessonId] || { id: lessonId, questions: [] };
    const questions = Array.isArray(lesson.questions) ? lesson.questions : [];
    const cappedCount = Math.min(getSafeInteger(count), questions.length);

    if (lesson.id === options.weightedLessonId) {
      return pickWeightedQuestions(cappedCount, questions, options.weights || {}, options.rng || Math.random);
    }

    return shuffleItems(questions, options.rng || Math.random).slice(0, cappedCount);
  }

  function getNextProgress(completed, total, previous = 0) {
    const safeTotal = getSafeInteger(total);
    const safeCompleted = Math.min(safeTotal, getSafeInteger(completed));
    const safePrevious = Math.min(safeTotal, getSafeInteger(previous));
    return Math.max(safePrevious, safeCompleted);
  }

  function getScorePercent(score, total) {
    const safeTotal = getSafeInteger(total);
    if (!safeTotal) return 0;
    return Math.round((getSafeInteger(score) / safeTotal) * 100);
  }

  function getReviewQuestions(questions, missedQuestionIds) {
    const missedIds = new Set(Array.isArray(missedQuestionIds) ? missedQuestionIds : []);
    return (Array.isArray(questions) ? questions : []).filter((question) => missedIds.has(question?.id));
  }

  function getSentenceTokens(question) {
    return String(question?.sentence || "").replace(/[.?!]/g, "").split(" ").filter(Boolean);
  }

  function getLesson2Correction(question) {
    return question?.correction || "句子正確，不用改。";
  }

  function normalizeTypedSentence(value) {
    return String(value || "")
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, "\"")
      .replace(/\s+/g, " ")
      .replace(/\s+([.,!?])/g, "$1")
      .replace(/[.?!]+$/g, "")
      .toLowerCase();
  }

  function shouldAutoCapitalizeSentenceLetter(currentValue) {
    const value = String(currentValue || "");
    const trimmed = value.replace(/\s+$/g, "");
    return !trimmed || /[.!?]$/.test(trimmed);
  }

  function formatSentenceInputCharacter(value, currentValue) {
    const character = String(value || "");
    if (!/^[a-z]$/.test(character)) return character;
    return shouldAutoCapitalizeSentenceLetter(currentValue) ? character.toUpperCase() : character;
  }

  function isCountableTypedAnswerCorrect(question, value) {
    const normalized = normalizeTypedSentence(value);
    return (question?.acceptedAnswers || [])
      .some((answer) => normalizeTypedSentence(answer) === normalized);
  }

  function normalizeVerbTableAnswer(value) {
    return String(value || "")
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/\s*\/\s*/g, "/")
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function getVerbTableAnswerLine(question, fields = VERB_TABLE_FIELDS) {
    return fields
      .map((field) => `${field.label}：${question?.forms?.[field.key] || ""}`)
      .join(" / ");
  }

  function isVerbTableSlotCorrect(question, slotKey, value) {
    return normalizeVerbTableAnswer(value) === normalizeVerbTableAnswer(question?.forms?.[slotKey]);
  }

  function getVerbTableWrongSlots(question, valuesBySlot, fields = VERB_TABLE_FIELDS) {
    return fields
      .filter((field) => !isVerbTableSlotCorrect(question, field.key, valuesBySlot?.[field.key]))
      .map((field) => field.key);
  }

  return {
    VERB_TABLE_FIELDS,
    capitalizeWord,
    getLesson2Correction,
    getNextProgress,
    getQuestionQuotas,
    getReviewQuestions,
    getScorePercent,
    getSentenceTokens,
    getVerbTableAnswerLine,
    getVerbTableWrongSlots,
    formatSentenceInputCharacter,
    isCountableTypedAnswerCorrect,
    isVerbTableSlotCorrect,
    normalizeTypedSentence,
    normalizeVerbTableAnswer,
    pickLessonQuestions,
    pickWeightedQuestions,
    shuffleItems,
    questionHasVerb
  };
});
