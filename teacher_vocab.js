(function attachTeacherVocab(root, factory) {
  const bank = root.TEACHER_VOCAB_BANK
    || (typeof require === "function" ? require("./teacher_vocab_bank.js") : null);
  const posInference = root.VocabPosInference
    || (typeof require === "function" ? require("./vocab_pos_inference.js") : null);
  const api = factory(bank, posInference);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.TeacherVocab = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createTeacherVocab(rawBank, VocabPosInference) {
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
    modal: "modal v.",
    auxiliary: "aux.",
    exclamation: "exclam.",
    number: "num.",
    phrase: "ph.",
    pattern: "pt."
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
    modal: "modal",
    "modal v": "modal",
    modalverb: "modal",
    auxiliary: "auxiliary",
    aux: "auxiliary",
    "auxiliary v": "auxiliary",
    auxiliaryverb: "auxiliary",
    exclam: "exclamation",
    exclamation: "exclamation",
    interj: "exclamation",
    interjection: "exclamation",
    number: "number",
    num: "number",
    phrase: "phrase",
    詞組: "phrase",
    pattern: "pattern",
    句式: "pattern"
  };

  const VALID_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
  const DEFAULT_STUDENT_READY_LEVEL = "B1";

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

  function normalizeLevel(value) {
    const level = String(value || "").trim().toUpperCase();
    return VALID_LEVELS.has(level) ? level : "";
  }

  function normalizeType(value, word = "") {
    const type = String(value || "").trim().toLowerCase();
    if (type === "pattern" || type === "phrase" || type === "word") return type;
    const normalizedWord = normalizeWord(word);
    if (/[+*=]|\.{2,}|…|名詞|動詞|形容詞|副詞|\bpp\b/i.test(normalizedWord)) return "pattern";
    if (/\s/.test(normalizedWord)) return "phrase";
    return "word";
  }

  function normalizeAliases(value) {
    const aliases = Array.isArray(value)
      ? value
      : String(value || "")
        .split(/[,，;；|]/);
    return Array.from(new Set(
      aliases
        .map(normalizeWord)
        .filter(Boolean)
    ));
  }

  function cleanGeneratedLookupKey(value) {
    return normalizeWord(value).replace(/\s+/g, " ").trim();
  }

  function expandLookupPattern(keys, pattern, replacements, limit = 300) {
    const next = new Set(keys);
    keys.forEach((key) => {
      replacements.forEach((replacement) => {
        const expanded = cleanGeneratedLookupKey(key.replace(pattern, replacement));
        if (expanded) next.add(expanded);
      });
    });
    return Array.from(next).slice(0, limit);
  }

  const OBJECT_PLACEHOLDER_REPLACEMENTS = ["something", "sth", "it", "this", "that", "things", "them"];
  const OBJECT_INSERTION_PATTERNS = [
    {
      pattern: /^take into account$/,
      build: (object) => `take ${object} into account`
    }
  ];

  function addObjectInsertionLookupKeys(keys, limit = 300) {
    const next = new Set(keys);
    keys.forEach((key) => {
      OBJECT_INSERTION_PATTERNS.forEach(({ pattern, build }) => {
        if (!pattern.test(key)) return;
        OBJECT_PLACEHOLDER_REPLACEMENTS.forEach((object) => {
          const expanded = cleanGeneratedLookupKey(build(object));
          if (expanded) next.add(expanded);
        });
      });
    });
    return Array.from(next).slice(0, limit);
  }

  const POSSESSIVE_BODY_PART_PATTERN = /(^|\s)one's\s+(appetite|arm|arms|back|blood|body|bone|bones|brain|breath|chest|ear|ears|eye|eyes|face|feet|finger|fingers|foot|hair|hand|hands|head|heart|heel|heels|knee|knees|leg|legs|mind|mouth|neck|nerve|nerves|nose|shoulder|shoulders|skin|skull|spine|stomach|throat|toe|toes|tongue|tooth|teeth|voice)(?=\s|$)/g;

  function generatePlaceholderLookupKeys(key) {
    let keys = [cleanGeneratedLookupKey(key)].filter(Boolean);
    if (!keys.length) return [];
    if (!keys[0].includes(" ")) return keys;

    keys = expandLookupPattern(
      keys,
      /(^|\s)(someone|somebody|sb)(?=\s|$)/g,
      ["$1someone", "$1somebody", "$1sb", "$1me", "$1you", "$1him", "$1her", "$1us", "$1them"]
    );
    keys = expandLookupPattern(
      keys,
      /(^|\s)(someone's|somebody's|sb's)(?=\s|$)/g,
      ["$1someone's", "$1somebody's", "$1sb's", "$1someones", "$1somebodies", "$1sbs", "$1someone", "$1somebody", "$1sb", "$1my", "$1your", "$1his", "$1her", "$1its", "$1our", "$1their", "$1"]
    );
    keys = expandLookupPattern(
      keys,
      /(^|\s)one's(?=\s|$)/g,
      ["$1one's", "$1ones", "$1one", "$1someone's", "$1somebody's", "$1sb's", "$1someones", "$1somebodies", "$1sbs", "$1someone", "$1somebody", "$1sb", "$1my", "$1your", "$1his", "$1her", "$1its", "$1our", "$1their", "$1"]
    );
    keys = expandLookupPattern(
      keys,
      POSSESSIVE_BODY_PART_PATTERN,
      ["$1the $2"]
    );
    keys = expandLookupPattern(
      keys,
      /(^|\s)(something|sth)(?=\s|$)/g,
      ["$1something", "$1sth", "$1it", "$1this", "$1that", "$1things", "$1them"]
    );
    keys = expandLookupPattern(
      keys,
      /(^|\s)oneself(?=\s|$)/g,
      ["$1oneself", "$1myself", "$1yourself", "$1himself", "$1herself", "$1itself", "$1ourselves", "$1themselves"]
    );
    keys = addObjectInsertionLookupKeys(keys);

    return Array.from(new Set(keys.map(cleanGeneratedLookupKey).filter(Boolean)));
  }

  function entrySearchKey(entry = {}) {
    return normalizeWord(entry.word || entry.english || entry.display || "");
  }

  function entrySearchKeys(entry = {}) {
    const directKeys = [
      entrySearchKey(entry),
      ...normalizeAliases(entry.aliases || entry.alias)
    ].filter(Boolean);
    return Array.from(new Set(
      directKeys.flatMap((key) => generatePlaceholderLookupKeys(key))
    ));
  }

  const entries = Array.isArray(bank.entries) ? bank.entries : [];
  const byWord = new Map();

  entries.forEach((entry) => {
    const normalized = {
      ...entry,
      word: normalizeWord(entry.word || entry.english || entry.display),
      meaning: normalizeMeaning(entry.meaning),
      pos: normalizePos(entry.pos),
      inferredPos: normalizePos(entry.inferredPos),
      type: normalizeType(entry.type, entry.word || entry.english || entry.display),
      aliases: normalizeAliases(entry.aliases || entry.alias)
    };
    if (!entrySearchKey(normalized) || !normalized.meaning) return;
    entrySearchKeys(normalized).forEach((key) => {
      if (!byWord.has(key)) byWord.set(key, []);
      byWord.get(key).push(normalized);
    });
  });

  byWord.forEach((items) => {
    items.sort((left, right) => {
      const leftScore = ((left.pos || left.inferredPos) ? 0 : 1) + (left.needsReview ? 2 : 0);
      const rightScore = ((right.pos || right.inferredPos) ? 0 : 1) + (right.needsReview ? 2 : 0);
      return leftScore - rightScore || String(left.meaning).localeCompare(String(right.meaning));
    });
  });

  function filterLookupItems(items = [], options = {}) {
    if (options.includeNeedsReview) return items;
    return items.filter((entry) => !entry.needsReview);
  }

  function getInferredPos(entry = {}, minConfidence = 84) {
    if (entry.pos) return "";
    return VocabPosInference?.inferEntryPos?.(entry, { minConfidence })?.pos || "";
  }

  function getStudentReadyPos(entry = {}, minConfidence = 84) {
    if (entry.type === "pattern") return "pattern";
    return normalizePos(entry.pos)
      || normalizePos(getInferredPos(entry, minConfidence));
  }

  function isStudentReadyEntry(entry = {}, options = {}) {
    if (entry.needsReview) return false;
    if (!normalizeMeaning(entry.meaning)) return false;
    if (/待老師|unknown|undefined|null/i.test(String(entry.meaning || ""))) return false;
    return Boolean(getStudentReadyPos(entry, Number(options.minConfidence) || 84));
  }

  function getStudentReadyLevel(entry = {}, options = {}) {
    return normalizeLevel(entry.level)
      || normalizeLevel(options.defaultLevel)
      || DEFAULT_STUDENT_READY_LEVEL;
  }

  function normalizeStudentReadyEntry(entry = {}, options = {}) {
    if (!isStudentReadyEntry(entry, options)) return null;
    const minConfidence = Number(options.minConfidence) || 84;
    const inferredPos = getInferredPos(entry, minConfidence);
    const studentPos = getStudentReadyPos(entry, minConfidence);
    return {
      ...entry,
      pos: normalizePos(entry.pos) || (entry.type === "pattern" ? "" : studentPos),
      inferredPos: normalizePos(inferredPos),
      type: normalizeType(entry.type, entry.word || entry.display),
      meaning: normalizeMeaning(entry.meaning),
      level: getStudentReadyLevel(entry, options),
      source: entry.source || "teacher",
      sourceEntryId: entry.sourceEntryId || entry.id || ""
    };
  }

  function lookup(query, options = {}) {
    const key = normalizeWord(query);
    const limit = Number(options.limit) || 8;
    if (!key) return [];

    const exactMatches = filterLookupItems(byWord.get(key) || [], options);
    if ((byWord.has(key) && exactMatches.length) || options.exactOnly !== false) {
      return exactMatches.slice(0, limit);
    }

    const fuzzyMatches = [];
    byWord.forEach((items, wordKey) => {
      if (wordKey.startsWith(key)) {
        fuzzyMatches.push(...filterLookupItems(items, options));
      }
    });
    return fuzzyMatches.slice(0, limit);
  }

  function lookupStudentReady(query, options = {}) {
    const limit = Number(options.limit) || 8;
    const matches = lookup(query, {
      ...options,
      limit: Math.max(limit * 4, 32)
    }).map((entry) => normalizeStudentReadyEntry(entry, options)).filter(Boolean);
    return dedupeStudentReadyEntries(matches).slice(0, limit);
  }

  function getStudentReadyEntryKey(entry = {}) {
    return [
      normalizeWord(entry.word || entry.display),
      normalizePos(entry.pos || entry.inferredPos),
      normalizeType(entry.type, entry.word || entry.display),
      normalizeMeaning(entry.meaning)
    ].join("\t");
  }

  function dedupeStudentReadyEntries(matches = []) {
    const seen = new Set();
    return matches.filter((entry) => {
      const key = getStudentReadyEntryKey(entry);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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
    const inferred = getInferredPos(entry, 84);
    const posLabel = formatPosLabel(entry.pos || entry.inferredPos || inferred) || formatPosLabel(entry.type);
    const prefix = posLabel ? `${posLabel} ` : "";
    return `${prefix}${normalizeMeaning(entry.meaning)}`;
  }

  return {
    entries,
    formatPosLabel,
    getEntryLabel,
    getStudentReadyLevel,
    getStudentReadyPos,
    isStudentReadyEntry,
    lookup,
    lookupStudentReady,
    normalizeStudentReadyEntry,
    dedupeStudentReadyEntries,
    getStudentReadyEntryKey,
    chooseAutoFillEntry,
    generatePlaceholderLookupKeys,
    normalizeAliases,
    normalizeLevel,
    normalizeMeaning,
    normalizePos,
    normalizeType,
    normalizeWord,
    meta: bank.meta || {}
  };
});
