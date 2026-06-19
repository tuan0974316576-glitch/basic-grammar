(function attachVocabExampleUtils(root, factory) {
  const utils = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = utils;
  }
  root.VocabExampleUtils = utils;
})(typeof globalThis !== "undefined" ? globalThis : window, function createVocabExampleUtils() {
  "use strict";

  function normalizeWord(value) {
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
    return hintText ? `${normalizedWord}|${hintText}` : normalizedWord;
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

  return {
    getCloudCacheKey,
    getLocalCacheKey,
    normalizeHints,
    normalizeMeaning,
    normalizePos,
    normalizeStorageKey,
    normalizeWord,
    stableHash
  };
});
