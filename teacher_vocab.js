(function attachTeacherVocab(root, factory) {
  const bank = root.TEACHER_VOCAB_BANK
    || (typeof require === "function" ? require("./teacher_vocab_bank.js") : null);
  const api = factory(bank);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.TeacherVocab = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createTeacherVocab(rawBank) {
  "use strict";

  const bank = rawBank || {};

  const POS_LABELS = {
    noun: "n.",
    verb: "v.",
    adjective: "adj.",
    adverb: "adv.",
    preposition: "prep.",
    conjunction: "conj.",
    pronoun: "pron.",
    determiner: "det.",
    phrase: "phrase",
    pattern: "pattern"
  };

  const POS_ALIASES = {
    n: "noun",
    noun: "noun",
    名詞: "noun",
    v: "verb",
    vb: "verb",
    verb: "verb",
    動詞: "verb",
    adj: "adjective",
    adjective: "adjective",
    形容詞: "adjective",
    adv: "adverb",
    adverb: "adverb",
    副詞: "adverb",
    prep: "preposition",
    preposition: "preposition",
    介詞: "preposition",
    conj: "conjunction",
    conjunction: "conjunction",
    連詞: "conjunction",
    pron: "pronoun",
    pronoun: "pronoun",
    代名詞: "pronoun",
    det: "determiner",
    determiner: "determiner",
    限定詞: "determiner",
    phrase: "phrase",
    詞組: "phrase",
    pattern: "pattern",
    句式: "pattern"
  };

  function normalizeWord(value) {
    return String(value || "")
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, "\"")
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
    const key = String(value || "")
      .trim()
      .replace(/[().]/g, "")
      .toLowerCase();
    return POS_ALIASES[key] || "";
  }

  function formatPosLabel(pos) {
    const normalized = normalizePos(pos);
    return POS_LABELS[normalized] || "";
  }

  function normalizeType(value, word = "") {
    const type = String(value || "").trim().toLowerCase();
    if (type === "pattern" || type === "phrase" || type === "word") return type;
    const normalizedWord = normalizeWord(word);
    if (/[+*=]|名詞|動詞|形容詞|副詞|\bpp\b/i.test(normalizedWord)) return "pattern";
    if (/\s/.test(normalizedWord)) return "phrase";
    return "word";
  }

  function entrySearchKey(entry = {}) {
    return normalizeWord(entry.word || entry.english || entry.display || "");
  }

  const entries = Array.isArray(bank.entries) ? bank.entries : [];
  const byWord = new Map();

  entries.forEach((entry) => {
    const normalized = {
      ...entry,
      word: normalizeWord(entry.word || entry.english || entry.display),
      meaning: normalizeMeaning(entry.meaning),
      pos: normalizePos(entry.pos),
      type: normalizeType(entry.type, entry.word || entry.english || entry.display)
    };
    const key = entrySearchKey(normalized);
    if (!key || !normalized.meaning) return;
    if (!byWord.has(key)) byWord.set(key, []);
    byWord.get(key).push(normalized);
  });

  byWord.forEach((items) => {
    items.sort((left, right) => {
      const leftScore = (left.pos ? 0 : 1) + (left.needsReview ? 2 : 0);
      const rightScore = (right.pos ? 0 : 1) + (right.needsReview ? 2 : 0);
      return leftScore - rightScore || String(left.meaning).localeCompare(String(right.meaning));
    });
  });

  function lookup(query, options = {}) {
    const key = normalizeWord(query);
    const limit = Number(options.limit) || 8;
    if (!key) return [];

    const exactMatches = byWord.get(key) || [];
    if (exactMatches.length || options.exactOnly !== false) {
      return exactMatches.slice(0, limit);
    }

    const fuzzyMatches = [];
    byWord.forEach((items, wordKey) => {
      if (wordKey.startsWith(key)) {
        fuzzyMatches.push(...items);
      }
    });
    return fuzzyMatches.slice(0, limit);
  }

  function chooseAutoFillEntry(matches = []) {
    if (!matches.length) return null;
    if (matches.length === 1) return matches[0];

    const meaningSet = new Set(matches.map((entry) => normalizeMeaning(entry.meaning)));
    if (meaningSet.size === 1) {
      return matches[0];
    }
    return null;
  }

  function getEntryLabel(entry = {}) {
    const posLabel = formatPosLabel(entry.pos);
    const prefix = posLabel ? `${posLabel} ` : "";
    return `${prefix}${normalizeMeaning(entry.meaning)}`;
  }

  return {
    entries,
    formatPosLabel,
    getEntryLabel,
    lookup,
    chooseAutoFillEntry,
    normalizeMeaning,
    normalizePos,
    normalizeType,
    normalizeWord,
    meta: bank.meta || {}
  };
});
