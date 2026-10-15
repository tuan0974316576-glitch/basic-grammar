(function attachVocabLevelContract(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.VocabLevelContract = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function createVocabLevelContract() {
  'use strict';
  const LEVELS = Object.freeze(['L1', 'L2', 'L3', 'L4', 'L5', 'L5_STAR']);
  const LEVEL_LABELS = Object.freeze({ L1: 'LEVEL 1', L2: 'LEVEL 2', L3: 'LEVEL 3', L4: 'LEVEL 4', L5: 'LEVEL 5', L5_STAR: 'LEVEL 5*' });
  function normalizeWord(value) { return String(value || '').trim().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').toLowerCase(); }
  function normalizeMeaning(value) { return String(value || '').trim().replace(/\s+/g, ' '); }
  function normalizeLevel(value) { const level = String(value || '').trim().toUpperCase(); return LEVELS.includes(level) ? level : ''; }
  function inferPos(meaning) { const match = String(meaning || '').match(/\(([^()]*)\)\s*$/); return match ? match[1].trim().toLowerCase() : ''; }
  function hashText(value) { let hash = 0x811c9dc5; for (const byte of new TextEncoder().encode(String(value || ''))) { hash ^= byte; hash = Math.imul(hash, 0x01000193); } return (hash >>> 0).toString(36); }
  function makeEntryKey(word, meaning) { return `v_${hashText(`${normalizeWord(word)}|${normalizeMeaning(meaning).toLowerCase()}`)}`; }
  function makeEntry(word, meaning, level) { const normalizedWord = normalizeWord(word); const normalizedMeaning = normalizeMeaning(meaning); return { key: makeEntryKey(normalizedWord, normalizedMeaning), word: String(word || '').trim(), meaning: normalizedMeaning, pos: inferPos(normalizedMeaning), level: normalizeLevel(level) }; }
  return Object.freeze({ LEVELS, LEVEL_LABELS, normalizeWord, normalizeMeaning, normalizeLevel, inferPos, makeEntryKey, makeEntry });
});
