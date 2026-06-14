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
    getSentenceTokens,
    getVerbTableAnswerLine,
    getVerbTableWrongSlots,
    isCountableTypedAnswerCorrect,
    isVerbTableSlotCorrect,
    normalizeTypedSentence,
    normalizeVerbTableAnswer,
    questionHasVerb
  };
});
