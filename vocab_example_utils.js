(function attachVocabExampleUtils(root, factory) {
  const vocabText = root.VocabText
    || (typeof require === "function" ? require("./vocab_text.js") : null);
  const utils = factory(vocabText);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = utils;
  }
  root.VocabExampleUtils = utils;
})(typeof globalThis !== "undefined" ? globalThis : window, function createVocabExampleUtils(VocabText) {
  "use strict";

  const CLOUD_EXAMPLE_CACHE_VERSION = "v2-written-zh";

  function normalizeWord(value) {
    if (VocabText?.normalizeHeadword) return VocabText.normalizeHeadword(value);
    return String(value || "")
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/[‐‑‒–—―]/g, "-")
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function normalizeMeaning(value) {
    return String(value || "")
      .trim()
      .replace(/\s*[/／;；]\s*/g, " / ")
      .replace(/\s+/g, " ");
  }

  function normalizePos(value) {
    return String(value || "").trim().toLowerCase();
  }

  function stableHash(value) {
    let hash = 2166136261;
    const text = String(value || "");
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(36);
  }

  function normalizeHints(hints = []) {
    const seen = new Set();
    return (Array.isArray(hints) ? hints : [])
      .map((hint) => ({
        meaning: normalizeMeaning(hint?.meaning || ""),
        pos: normalizePos(hint?.pos || ""),
        type: normalizePos(hint?.type || ""),
        level: String(hint?.level || "").trim().toUpperCase()
      }))
      .filter((hint) => hint.meaning)
      .filter((hint) => {
        const key = [hint.pos, hint.type, hint.meaning, hint.level].join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 4);
  }

  function getCloudCacheKey(word, hints = []) {
    const normalizedWord = normalizeWord(word);
    const hintText = normalizeHints(hints)
      .map((hint) => [hint.pos, hint.type, hint.meaning].filter(Boolean).join(":"))
      .join("|");
    const baseKey = hintText ? `${normalizedWord}|${hintText}` : normalizedWord;
    return `${CLOUD_EXAMPLE_CACHE_VERSION}|${baseKey}`;
  }

  function getLocalCacheKey(word, hints = []) {
    const normalizedWord = normalizeWord(word);
    const hintText = normalizeHints(hints)
      .map((hint) => [hint.pos, hint.type, hint.meaning].filter(Boolean).join(":"))
      .join("|");
    return hintText ? `${normalizedWord}|${stableHash(hintText)}` : normalizedWord;
  }

  function normalizeStorageKey(value) {
    return String(value || "")
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .slice(0, 80);
  }

  function normalizeMeaningKey(value) {
    return normalizeMeaning(value).replace(/[\s/／]+/g, "").toLowerCase();
  }

  function selectBestExamplePayload(entry = {}, candidates = []) {
    const rows = Array.isArray(candidates) ? candidates : [];
    if (!rows.length) return null;
    const meaningKey = normalizeMeaningKey(entry.meaning);
    const pos = normalizePos(entry.pos || entry.inferredPos);
    const type = normalizePos(entry.type);
    function score(candidate = {}) {
      const candidateMeaning = normalizeMeaningKey(candidate.meaning);
      const candidatePos = normalizePos(candidate.pos);
      const candidateType = normalizePos(candidate.type);
      let value = 0;
      if (candidateMeaning && candidateMeaning === meaningKey) value += 8;
      if (candidateMeaning && meaningKey &&
          (candidateMeaning.includes(meaningKey) || meaningKey.includes(candidateMeaning))) value += 4;
      if (candidatePos && candidatePos === pos) value += 3;
      if (candidateType && candidateType === type) value += 1;
      if (!candidateMeaning) value += 1;
      return value;
    }
    const ranked = rows
      .map((candidate) => ({ candidate, score: score(candidate) }))
      .sort((left, right) => right.score - left.score);
    return ranked[0]?.score > 0 ? ranked[0].candidate : null;
  }

  return {
    getCloudCacheKey,
    getLocalCacheKey,
    normalizeHints,
    normalizeMeaning,
    normalizeMeaningKey,
    normalizePos,
    normalizeStorageKey,
    normalizeWord,
    selectBestExamplePayload,
    stableHash
  };
});
