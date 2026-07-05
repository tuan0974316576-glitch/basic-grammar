(function attachVocabData(root, factory) {
  const scheduler = root.VocabScheduler
    || (typeof require === "function" ? require("./vocab_scheduler.js") : null);
  const data = factory(scheduler);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }
  root.VocabData = data;
})(typeof globalThis !== "undefined" ? globalThis : window, function createVocabData(VocabScheduler) {
  "use strict";

  const MAX_WORD_LENGTH = 42;
  const MAX_MEANING_LENGTH = 80;
  const MAX_MEANING_ENTRIES = 8;
  const DELETE_GRACE_MS = 30 * 24 * 60 * 60 * 1000;
  const EXTRA_TEXT_FIELDS = ["pos", "type", "source", "teacherEntryId", "sourceEntryId", "level"];
  const APPROVED_MEANING_SOURCES = new Set([
    "teacher-live",
    "teacher",
    "curated-sense-bank",
    "curated-phrasal-verb-supplement",
    "mock-unseen-reviewed",
    "mock-unseen-mt35-paper3-reviewed",
    "mock-unseen-mt38-paper3-reviewed",
    "mock-unseen-mt42-paper3-reviewed",
    "mock-unseen-mt45-paper3-reviewed",
    "mock-unseen-mt49-paper3-reviewed",
    "mock-unseen-mt52-paper3-reviewed",
    "mock-unseen-mt56-paper3-reviewed",
    "mock-unseen-mt59-paper3-reviewed",
    "mock-unseen-mt20-paper3-reviewed",
    "mock-unseen-mt22-paper3-reviewed",
    "mock-unseen-mt25-paper3-reviewed",
    "mock-unseen-mt27-paper3-reviewed",
    "mock-unseen-mt16-paper3-reviewed",
    "mock-unseen-mt18-paper3-reviewed",
    "mock-unseen-mt19-paper3-reviewed",
    "mock-unseen-mt21-paper3-reviewed",
    "mock-unseen-mt23-paper3-reviewed",
    "mock-unseen-mt24-paper3-reviewed",
    "mock-unseen-mt26-paper3-reviewed",
    "mock-unseen-mt28-paper3-reviewed",
    "mock-unseen-mt29-paper3-reviewed",
    "mock-unseen-mt31-paper3-reviewed",
    "mock-unseen-mt33-paper3-reviewed",
    "mock-unseen-mt34-paper3-reviewed",
    "mock-unseen-mt36-paper3-reviewed",
    "mock-unseen-mt39-paper3-reviewed",
    "mock-unseen-mt41-paper3-reviewed",
    "mock-unseen-mt43-paper3-reviewed",
    "mock-unseen-mt46-paper3-reviewed",
    "mock-unseen-mt48-paper3-reviewed",
    "mock-unseen-mt50-paper3-reviewed",
    "mock-unseen-mt53-paper3-reviewed",
    "mock-unseen-mt87-paper3-reviewed",
    "mock-unseen-mt63-paper3-reviewed",
    "mock-unseen-mt66-paper3-reviewed",
    "mock-unseen-mt70-paper3-reviewed",
    "mock-unseen-mt73-paper3-reviewed",
    "mock-unseen-mt77-paper3-reviewed",
    "mock-unseen-mt80-paper3-reviewed",
    "mock-unseen-mt84-paper3-reviewed",
    "mock-unseen-mt32-paper3-reviewed",
    "mock-unseen-mt30-paper3-reviewed",
    "mock-unseen-mt9-paper3-reviewed",
    "mock-unseen-mt10-paper3-reviewed",
    "mock-unseen-mt11-paper3-reviewed",
    "mock-unseen-mt12-paper3-reviewed",
    "mock-unseen-mt13-paper3-reviewed",
    "mock-unseen-mt14-paper3-reviewed",
    "mock-unseen-mt15-paper3-reviewed",
    "mock-unseen-mt16-paper4-reviewed",
    "mock-unseen-mt18-paper4-reviewed",
    "mock-unseen-mt19-paper4-reviewed",
    "mock-unseen-mt21-paper4-reviewed",
    "mock-unseen-mt23-paper4-reviewed",
    "mock-unseen-mt24-paper4-reviewed",
    "mock-unseen-mt26-paper4-reviewed",
    "mock-unseen-mt28-paper4-reviewed",
    "mock-unseen-mt29-paper4-reviewed",
    "mock-unseen-mt31-paper4-reviewed",
    "mock-unseen-mt33-paper4-reviewed",
    "mock-unseen-mt34-paper4-reviewed",
    "mock-unseen-mt36-paper4-reviewed",
    "mock-unseen-mt37-paper4-reviewed",
    "mock-unseen-mt39-paper4-reviewed",
    "mock-unseen-mt40-paper4-reviewed",
    "mock-unseen-mt41-paper4-reviewed",
    "mock-unseen-mt43-paper4-reviewed",
    "mock-unseen-mt44-paper4-reviewed",
    "mock-unseen-mt46-paper4-reviewed",
    "mock-unseen-mt47-paper4-reviewed",
    "mock-unseen-mt48-paper4-reviewed",
    "mock-unseen-mt58-paper4-reviewed",
    "mock-unseen-mt61-paper4-reviewed",
    "mock-unseen-mt15-paper4-reviewed",
    "mock-unseen-mt17-paper4-reviewed",
    "mock-unseen-mt20-paper4-reviewed",
    "mock-unseen-mt22-paper4-reviewed",
    "mock-unseen-mt25-paper4-reviewed",
    "mock-unseen-mt27-paper4-reviewed",
    "mock-unseen-mt30-paper4-reviewed",
    "mock-unseen-mt32-paper4-reviewed",
    "mock-unseen-mt35-paper4-reviewed",
    "mock-unseen-mt38-paper4-reviewed",
    "mock-unseen-mt42-paper4-reviewed",
    "mock-unseen-mt45-paper4-reviewed",
    "mock-unseen-mt49-paper4-reviewed",
    "mock-unseen-mt50-paper4-reviewed",
    "mock-unseen-mt51-paper4-reviewed",
    "mock-unseen-mt56-paper4-reviewed",
    "mock-unseen-mt57-paper4-reviewed",
    "mock-unseen-mt59-paper4-reviewed",
    "mock-unseen-mt60-paper4-reviewed",
    "mock-unseen-mt62-paper4-reviewed",
    "mock-unseen-mt63-paper4-reviewed",
    "mock-unseen-mt64-paper4-reviewed",
    "mock-unseen-mt65-paper4-reviewed",
    "mock-unseen-mt66-paper4-reviewed",
    "mock-unseen-mt67-paper4-reviewed",
    "mock-unseen-mt68-paper4-reviewed",
    "mock-unseen-mt69-paper4-reviewed",
    "mock-unseen-mt70-paper4-reviewed",
    "mock-unseen-mt71-paper4-reviewed",
    "mock-unseen-mt72-paper4-reviewed",
    "mock-unseen-mt73-paper4-reviewed",
    "mock-unseen-mt75-paper4-reviewed",
    "mock-unseen-mt78-paper4-reviewed",
    "mock-unseen-mt79-paper4-reviewed",
    "mock-unseen-mt81-paper4-reviewed",
    "mock-unseen-mt83-paper4-reviewed",
    "mock-unseen-mt84-paper4-reviewed",
    "mock-unseen-mt85-paper4-reviewed",
    "mock-unseen-mt86-paper4-reviewed",
    "mock-unseen-mt87-paper4-reviewed",
    "mock-unseen-mt7-paper4-reviewed",
    "mock-unseen-mt8-paper4-reviewed",
    "mock-unseen-mt9-paper4-reviewed",
    "mock-unseen-mt10-paper4-reviewed",
    "mock-unseen-mt11-paper4-reviewed",
    "mock-unseen-mt12-paper4-reviewed",
    "mock-unseen-mt13-paper4-reviewed",
    "mock-unseen-mt14-paper4-reviewed",
    "mock-unseen-mt68-paper3-reviewed",
    "mock-unseen-mt62-paper3-reviewed",
    "mock-unseen-mt64-paper3-reviewed",
    "mock-unseen-mt67-paper3-reviewed",
    "mock-unseen-mt69-paper3-reviewed",
    "mock-unseen-mt71-paper3-reviewed",
    "mock-unseen-mt72-paper3-reviewed",
    "mock-unseen-mt74-paper3-reviewed",
    "mock-unseen-mt75-paper3-reviewed",
    "mock-unseen-mt79-paper3-reviewed",
    "mock-unseen-mt82-paper3-reviewed",
    "mock-unseen-mt85-paper3-reviewed",
    "mock-unseen-mt86-paper3-reviewed",
    "mock-unseen-mt88-paper3-reviewed",
    "mock-unseen-mt90-paper3-reviewed",
    "mock-unseen-mt76-paper3-reviewed",
    "mock-unseen-mt37-paper3-reviewed",
    "mock-unseen-mt40-paper3-reviewed",
    "mock-unseen-mt44-paper3-reviewed",
    "mock-unseen-mt47-paper3-reviewed",
    "mock-unseen-mt51-paper3-reviewed",
    "mock-unseen-mt54-paper3-reviewed",
    "mock-unseen-mt55-paper3-reviewed",
    "mock-unseen-mt57-paper3-reviewed",
    "mock-unseen-mt58-paper3-reviewed",
    "mock-unseen-mt60-paper3-reviewed",
    "mock-unseen-mt61-paper3-reviewed",
    "mock-unseen-mt65-paper3-reviewed",
    "mock-unseen-mt30-paper2-reviewed",
    "mock-unseen-mt32-paper2-reviewed",
    "mock-unseen-mt35-paper2-reviewed",
    "mock-unseen-mt38-paper2-reviewed",
    "mock-unseen-mt42-paper2-reviewed",
    "mock-unseen-mt45-paper2-reviewed",
    "mock-unseen-mt49-paper2-reviewed",
    "mock-unseen-mt52-paper2-reviewed",
    "mock-unseen-mt56-paper2-reviewed",
    "mock-unseen-mt58-paper2-reviewed",
    "mock-unseen-mt61-paper2-reviewed",
    "mock-unseen-mt65-paper2-reviewed",
    "mock-unseen-mt68-paper2-reviewed",
    "mock-unseen-mt72-paper2-reviewed",
    "mock-unseen-mt75-paper2-reviewed",
    "mock-unseen-mt79-paper2-reviewed",
    "mock-unseen-mt82-paper2-reviewed",
    "mock-unseen-mt59-paper2-reviewed",
    "mock-unseen-mt63-paper2-reviewed",
    "mock-unseen-mt66-paper2-reviewed",
    "mock-unseen-mt70-paper2-reviewed",
    "mock-unseen-mt73-paper2-reviewed",
    "mock-unseen-mt77-paper2-reviewed",
    "mock-unseen-mt80-paper2-reviewed",
    "mock-unseen-mt84-paper2-reviewed",
    "mock-unseen-mt87-paper2-reviewed",
    "mock-unseen-mt9-paper2-reviewed",
    "mock-unseen-mt10-paper2-reviewed",
    "mock-unseen-mt11-paper2-reviewed",
    "mock-unseen-mt12-paper2-reviewed",
    "mock-unseen-mt13-paper2-reviewed",
    "mock-unseen-mt14-paper2-reviewed",
    "mock-unseen-mt15-paper2-reviewed",
    "mock-unseen-mt16-paper2-reviewed",
    "mock-unseen-mt17-paper2-reviewed",
    "mock-unseen-mt18-paper2-reviewed",
    "mock-unseen-mt19-paper2-reviewed",
    "mock-unseen-mt20-paper2-reviewed",
    "mock-unseen-mt21-paper2-reviewed",
    "mock-unseen-mt22-paper2-reviewed",
    "mock-unseen-mt23-paper2-reviewed",
    "mock-unseen-mt24-paper2-reviewed",
    "mock-unseen-mt25-paper2-reviewed",
    "mock-unseen-mt26-paper2-reviewed",
    "mock-unseen-mt27-paper2-reviewed",
    "mock-unseen-mt28-paper2-reviewed",
    "mock-unseen-mt29-paper2-reviewed",
    "mock-unseen-mt31-paper2-reviewed",
    "mock-unseen-mt33-paper2-reviewed",
    "mock-unseen-mt34-paper2-reviewed",
    "mock-unseen-mt36-paper2-reviewed",
    "mock-unseen-mt39-paper2-reviewed",
    "mock-unseen-mt41-paper2-reviewed",
    "mock-unseen-mt43-paper2-reviewed",
    "mock-unseen-mt46-paper2-reviewed",
    "mock-unseen-mt48-paper2-reviewed",
    "mock-unseen-mt50-paper2-reviewed",
    "mock-unseen-mt51-paper2-reviewed",
    "mock-unseen-mt54-paper2-reviewed",
    "mock-unseen-mt58-paper2-reviewed",
    "mock-unseen-mt61-paper2-reviewed",
    "mock-unseen-mt65-paper2-reviewed",
    "mock-unseen-mt68-paper2-reviewed",
    "mock-unseen-mt72-paper2-reviewed",
    "mock-unseen-mt75-paper2-reviewed",
    "mock-unseen-mt79-paper2-reviewed",
    "mock-unseen-mt82-paper2-reviewed",
    "mock-unseen-mt53-paper2-reviewed",
    "mock-unseen-mt55-paper2-reviewed",
    "mock-unseen-mt57-paper2-reviewed",
    "mock-unseen-mt60-paper2-reviewed",
    "mock-unseen-mt62-paper2-reviewed",
    "mock-unseen-mt64-paper2-reviewed",
    "mock-unseen-mt67-paper2-reviewed",
    "mock-unseen-mt69-paper2-reviewed",
    "mock-unseen-mt71-paper2-reviewed",
    "mock-unseen-mt74-paper2-reviewed",
    "mock-unseen-mt76-paper2-reviewed",
    "mock-unseen-mt78-paper2-reviewed",
    "mock-unseen-mt81-paper2-reviewed",
    "mock-unseen-mt83-paper2-reviewed",
    "mock-unseen-mt85-paper2-reviewed",
    "mock-unseen-mt86-paper2-reviewed",
    "mock-unseen-mt88-paper2-reviewed",
    "mock-unseen-mt37-paper2-reviewed",
    "mock-unseen-mt40-paper2-reviewed",
    "mock-unseen-mt44-paper2-reviewed",
    "mock-unseen-mt47-paper2-reviewed",
    "mock-unseen-mt90-paper2-reviewed",
    "mock-unseen-mt7-paper1-reviewed",
    "mock-unseen-mt8-paper1-reviewed",
    "mock-unseen-mt9-paper1-reviewed",
    "mock-unseen-mt10-paper1-reviewed",
    "mock-unseen-mt11-paper1-reviewed",
    "mock-unseen-mt12-paper1-reviewed",
    "mock-unseen-mt13-paper1-reviewed",
    "mock-unseen-mt14-paper1-reviewed",
    "mock-unseen-mt15-paper1-reviewed",
    "mock-unseen-mt16-paper1-reviewed",
    "mock-unseen-mt17-paper1-reviewed",
    "mock-unseen-mt18-paper1-reviewed",
    "mock-unseen-mt19-paper1-reviewed",
    "mock-unseen-mt20-paper1-reviewed",
    "mock-unseen-mt21-paper1-reviewed",
    "mock-unseen-mt22-paper1-reviewed",
    "mock-unseen-mt23-paper1-reviewed",
    "mock-unseen-mt24-paper1-reviewed",
    "mock-unseen-mt25-paper1-reviewed",
    "mock-unseen-mt26-paper1-reviewed",
    "mock-unseen-mt28-paper1-reviewed",
    "mock-unseen-mt29-paper1-reviewed",
    "mock-unseen-mt31-paper1-reviewed",
    "mock-unseen-mt33-paper1-reviewed",
    "mock-unseen-mt34-paper1-reviewed",
    "mock-unseen-mt36-paper1-reviewed",
    "mock-unseen-mt37-paper1-reviewed",
    "mock-unseen-mt39-paper1-reviewed",
    "mock-unseen-mt40-paper1-reviewed",
    "mock-unseen-mt41-paper1-reviewed",
    "mock-unseen-mt43-paper1-reviewed",
    "mock-unseen-mt44-paper1-reviewed",
    "mock-unseen-mt27-paper1-reviewed",
    "mock-unseen-mt30-paper1-reviewed",
    "mock-unseen-mt32-paper1-reviewed",
    "mock-unseen-mt35-paper1-reviewed",
    "mock-unseen-mt38-paper1-reviewed",
    "mock-unseen-mt42-paper1-reviewed",
    "mock-unseen-mt45-paper1-reviewed",
    "mock-unseen-mt46-paper1-reviewed",
    "mock-unseen-mt47-paper1-reviewed",
    "mock-unseen-mt48-paper1-reviewed",
    "mock-unseen-mt49-paper1-reviewed",
    "mock-unseen-mt50-paper1-reviewed",
    "mock-unseen-mt51-paper1-reviewed",
    "mock-unseen-mt52-paper1-reviewed",
    "mock-unseen-mt53-paper1-reviewed",
    "mock-unseen-mt54-paper1-reviewed",
    "mock-unseen-mt55-paper1-reviewed",
    "mock-unseen-mt57-paper1-reviewed",
    "mock-unseen-mt58-paper1-reviewed",
    "mock-unseen-mt56-paper1-reviewed",
    "mock-unseen-mt59-paper1-reviewed",
    "mock-unseen-mt60-paper1-reviewed",
    "mock-unseen-mt61-paper1-reviewed",
    "mock-unseen-mt62-paper1-reviewed",
    "mock-unseen-mt64-paper1-reviewed",
    "mock-unseen-mt65-paper1-reviewed",
    "mock-unseen-mt67-paper1-reviewed",
    "mock-unseen-mt68-paper1-reviewed",
    "mock-unseen-mt69-paper1-reviewed",
    "mock-unseen-mt63-paper1-reviewed",
    "mock-unseen-mt66-paper1-reviewed",
    "mock-unseen-mt87-paper1-reviewed",
    "mock-unseen-mt70-paper1-reviewed",
    "mock-unseen-mt71-paper1-reviewed",
    "mock-unseen-mt72-paper1-reviewed",
    "mock-unseen-mt74-paper1-reviewed",
    "mock-unseen-mt75-paper1-reviewed",
    "mock-unseen-mt76-paper1-reviewed",
    "mock-unseen-mt73-paper1-reviewed",
    "mock-unseen-mt77-paper1-reviewed",
    "mock-unseen-mt78-paper1-reviewed",
    "mock-unseen-mt79-paper1-reviewed",
    "mock-unseen-mt80-paper1-reviewed",
    "mock-unseen-mt81-paper1-reviewed",
    "mock-unseen-mt82-paper1-reviewed",
    "mock-unseen-mt83-paper1-reviewed",
    "mock-unseen-mt84-paper1-reviewed",
    "mock-unseen-mt85-paper1-reviewed",
    "mock-unseen-mt86-paper1-reviewed",
    "mock-unseen-mt88-paper1-reviewed",
    "verb-table-form",
    "cc-cedict-supplement"
  ]);
  const VALID_MEANING_POS = new Set([
    "noun",
    "verb",
    "adjective",
    "adverb",
    "preposition",
    "conjunction",
    "pronoun",
    "determiner",
    "modal",
    "auxiliary",
    "exclamation",
    "number",
    "phrase",
    "pattern"
  ]);
  const VALID_MEANING_TYPES = new Set(["word", "phrase", "pattern"]);

  function normalizeWord(value) {
    return String(value || "")
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .slice(0, MAX_WORD_LENGTH);
  }

  function normalizeMeaning(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, MAX_MEANING_LENGTH);
  }

  function normalizePos(value) {
    const key = String(value || "").trim().replace(/[().]/g, "").toLowerCase();
    const aliases = {
      n: "noun",
      noun: "noun",
      v: "verb",
      verb: "verb",
      adj: "adjective",
      adjective: "adjective",
      adv: "adverb",
      adverb: "adverb",
      prep: "preposition",
      preposition: "preposition",
      conj: "conjunction",
      conjunction: "conjunction",
      pron: "pronoun",
      pronoun: "pronoun",
      det: "determiner",
      determiner: "determiner",
      modal: "modal",
      "modal v": "modal",
      aux: "auxiliary",
      auxiliary: "auxiliary",
      exclam: "exclamation",
      exclamation: "exclamation",
      num: "number",
      number: "number",
      ph: "phrase",
      phrase: "phrase",
      pt: "pattern",
      pattern: "pattern"
    };
    return aliases[key] || "";
  }

  function normalizeType(value, word = "") {
    const key = String(value || "").trim().replace(/[().]/g, "").toLowerCase();
    if (key === "word" || key === "phrase" || key === "pattern") return key;
    const normalizedWord = normalizeWord(word);
    if (/[+*=]|\.{2,}|…|名詞|動詞|形容詞|副詞|\bpp\b/i.test(normalizedWord)) return "pattern";
    return normalizedWord.includes(" ") ? "phrase" : "word";
  }

  function isApprovedMeaningSource(source = "") {
    return APPROVED_MEANING_SOURCES.has(String(source || "").trim());
  }

  function isUnsafeMeaningEntry(entry = {}) {
    const source = String(entry.source || "").trim();
    const meaning = normalizeMeaning(entry.meaning);
    if (!meaning || /待老師|unknown|undefined|null/i.test(meaning)) return true;
    if (!isApprovedMeaningSource(source)) return true;

    const type = normalizeType(entry.type, entry.word || "");
    if (!VALID_MEANING_TYPES.has(type)) return true;
    if (type === "pattern") return false;
    const pos = normalizePos(entry.pos);
    return !VALID_MEANING_POS.has(pos);
  }

  function normalizeMeaningEntry(entry = {}) {
    const meaning = normalizeMeaning(entry.meaning);
    if (isUnsafeMeaningEntry({ ...entry, meaning })) return null;
    const normalized = { meaning };
    EXTRA_TEXT_FIELDS.forEach((field) => {
      const value = String(entry[field] || "").trim().slice(0, 80);
      if (!value) return;
      if (field === "pos") {
        const pos = normalizePos(value);
        if (pos) normalized[field] = pos;
        return;
      }
      if (field === "type") {
        normalized[field] = normalizeType(value, entry.word || "");
        return;
      }
      normalized[field] = value;
    });
    return normalized;
  }

  function normalizeMeaningEntries(item = {}) {
    const rawEntries = Array.isArray(item.meanings) ? item.meanings : [];
    const entries = rawEntries
      .map(normalizeMeaningEntry)
      .filter(Boolean);

    if (!entries.length) {
      const primary = normalizeMeaningEntry(item);
      if (primary) entries.unshift(primary);
    }

    const seen = new Set();
    return entries.filter((entry) => {
      const key = [
        entry.meaning,
        entry.pos || "",
        entry.type || "",
        entry.teacherEntryId || "",
        entry.sourceEntryId || ""
      ].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, MAX_MEANING_ENTRIES);
  }

  function summarizeMeaning(entries = []) {
    return entries
      .map((entry) => normalizeMeaning(entry.meaning))
      .filter(Boolean)
      .join(" / ")
      .slice(0, MAX_MEANING_LENGTH);
  }

  function createId(word) {
    return normalizeWord(word).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `word-${Date.now()}`;
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

  function createMeaningId(word, meaning, pos = "") {
    const base = [word, pos, meaning]
      .map((part) => normalizeWord(part).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
      .filter(Boolean)
      .join("-");
    const prefix = base.slice(0, 64) || createId(word);
    return `${prefix}-${stableHash(`${word}|${pos}|${meaning}`)}`.slice(0, 80);
  }

  function safeTime(value, fallback = Date.now()) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
  }

  function timestampToMillis(value, fallback = 0) {
    if (!value) return fallback;
    if (typeof value.toMillis === "function") return value.toMillis();
    if (typeof value.seconds === "number") return (value.seconds * 1000) + Math.floor((value.nanoseconds || 0) / 1000000);
    return safeTime(value, fallback);
  }

  function normalizeItem(item = {}, options = {}) {
    const normalizedWord = normalizeWord(item.word);
    const displayWord = String(item.word || "").trim().replace(/\s+/g, " ");
    const meanings = normalizeMeaningEntries(item);
    const meaning = summarizeMeaning(meanings);
    if (!normalizedWord || !meaning) return null;

    const now = Number(options.now) || Date.now();
    const id = String(item.id || options.id || createId(normalizedWord));
    const createdAt = safeTime(timestampToMillis(item.createdAt, item.createdAt), now);
    const updatedAt = safeTime(timestampToMillis(item.updatedAt, item.updatedAt), createdAt);
    const deletedAt = Number(timestampToMillis(item.deletedAt, item.deletedAt)) || 0;
    const progress = VocabScheduler?.normalizeProgress
      ? VocabScheduler.normalizeProgress(item.progress || {})
      : (item.progress || {});
    const extras = {};
    EXTRA_TEXT_FIELDS.forEach((field) => {
      const value = String(item[field] || "").trim().slice(0, 80);
      if (value) extras[field] = value;
    });

    return {
      id,
      word: displayWord || normalizedWord,
      meaning,
      meanings,
      ...extras,
      createdAt,
      updatedAt,
      deletedAt,
      progress
    };
  }

  function stripItemForStorage(item = {}) {
    const normalized = normalizeItem(item, { id: item.id });
    if (!normalized || normalized.deletedAt) return null;
    return {
      id: normalized.id,
      word: normalized.word,
      meaning: normalized.meaning,
      meanings: normalized.meanings,
      ...Object.fromEntries(
        EXTRA_TEXT_FIELDS
          .filter((field) => normalized[field])
          .map((field) => [field, normalized[field]])
      ),
      createdAt: normalized.createdAt,
      updatedAt: normalized.updatedAt
    };
  }

  function stripProgressForStorage(progress = {}) {
    return VocabScheduler?.normalizeProgress
      ? VocabScheduler.normalizeProgress(progress)
      : { ...progress };
  }

  function compareByUpdatedAt(left = {}, right = {}) {
    const leftTime = Number(left.updatedAt) || Number(left.createdAt) || 0;
    const rightTime = Number(right.updatedAt) || Number(right.createdAt) || 0;
    return leftTime - rightTime;
  }

  function mergeProgress(localProgress = {}, remoteProgress = {}) {
    const local = stripProgressForStorage(localProgress);
    const remote = stripProgressForStorage(remoteProgress);
    return compareByUpdatedAt(local, remote) >= 0 ? local : remote;
  }

  function mergeItems(localItems = [], localProgressById = {}, remoteDocs = [], queue = {}, options = {}) {
    const now = Number(options.now) || Date.now();
    const byId = new Map();
    const progressById = {};
    const tombstones = {};

    function putItem(item, source = "local") {
      if (item?.deletedAt && (!item.word || !item.meaning)) {
        tombstones[item.id] = Math.max(Number(tombstones[item.id]) || 0, Number(item.deletedAt) || now);
        return;
      }

      const normalized = normalizeItem(item, { now, id: item?.id });
      if (!normalized) return;
      const queued = queue[normalized.id] || {};
      const queuedDeletedAt = Number(queued.deletedAt) || 0;
      const deletedAt = Math.max(Number(normalized.deletedAt) || 0, queuedDeletedAt);

      if (deletedAt) {
        tombstones[normalized.id] = Math.max(Number(tombstones[normalized.id]) || 0, deletedAt);
      }

      const previous = byId.get(normalized.id);
      const shouldReplace = !previous || compareByUpdatedAt(normalized, previous) >= 0 || source === "queue";
      if (shouldReplace) {
        byId.set(normalized.id, {
          ...normalized,
          deletedAt
        });
      }
    }

    localItems.forEach((item) => putItem({
      ...item,
      progress: localProgressById[item.id]
    }, "local"));
    remoteDocs.forEach((item) => putItem(item, "remote"));
    Object.entries(queue).forEach(([id, item]) => putItem({
      ...item,
      id
    }, "queue"));

    Array.from(byId.entries()).forEach(([id, item]) => {
      const tombstone = Number(tombstones[id]) || 0;
      if (tombstone && tombstone >= (Number(item.updatedAt) || 0)) {
        byId.delete(id);
        if (now - tombstone < DELETE_GRACE_MS) {
          tombstones[id] = tombstone;
        } else {
          delete tombstones[id];
        }
        return;
      }

      const localProgress = localProgressById[id] || {};
      progressById[id] = mergeProgress(localProgress, item.progress || {});
      item.progress = progressById[id];
    });

    const items = Array.from(byId.values())
      .map(stripItemForStorage)
      .filter(Boolean)
      .sort((left, right) => {
        const diff = (Number(right.updatedAt) || 0) - (Number(left.updatedAt) || 0);
        return diff || String(left.word).localeCompare(String(right.word));
      });

    return {
      items,
      progressById,
      tombstones
    };
  }

  function makeCloudDoc(item = {}, progress = {}, options = {}) {
    const normalized = normalizeItem({
      ...item,
      progress
    }, { id: item.id, now: options.now });
    if (!normalized) return null;

    return {
      word: normalized.word,
      meaning: normalized.meaning,
      meanings: normalized.meanings,
      ...Object.fromEntries(
        EXTRA_TEXT_FIELDS
          .filter((field) => normalized[field])
          .map((field) => [field, normalized[field]])
      ),
      createdAt: normalized.createdAt,
      updatedAt: normalized.updatedAt,
      deletedAt: Number(options.deletedAt) || 0,
      progress: stripProgressForStorage(normalized.progress)
    };
  }

  return {
    APPROVED_MEANING_SOURCES,
    DELETE_GRACE_MS,
    VALID_MEANING_POS,
    VALID_MEANING_TYPES,
    createId,
    createMeaningId,
    makeCloudDoc,
    mergeItems,
    mergeProgress,
    normalizeItem,
    normalizeMeaningEntries,
    normalizeMeaningEntry,
    normalizeMeaning,
    normalizePos,
    normalizeType,
    normalizeWord,
    stripItemForStorage,
    stripProgressForStorage,
    timestampToMillis
  };
});
