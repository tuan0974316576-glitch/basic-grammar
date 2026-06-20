(function attachCcCedictSupplement(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.CcCedictSupplement = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createCcCedictSupplement() {
  "use strict";

  const POS_ALIASES = {
    n: "noun",
    noun: "noun",
    phrase: "phrase",
    ph: "phrase"
  };

  const ENTRIES = [
    ["Mong Kok", "noun", "旺角", { aliases: ["Mongkok"], sourceEntryId: "cc-cedict-旺角" }],
    ["Causeway Bay", "noun", "銅鑼灣", { sourceEntryId: "cc-cedict-銅鑼灣" }],
    ["Central", "noun", "中環", { sourceEntryId: "cc-cedict-中環" }],
    ["Tsim Sha Tsui", "noun", "尖沙咀", { aliases: ["TST"], sourceEntryId: "cc-cedict-尖沙咀" }],
    ["Sham Shui Po", "noun", "深水埗", { sourceEntryId: "cc-cedict-深水埗" }],
    ["Sha Tin", "noun", "沙田", { aliases: ["Shatin"], sourceEntryId: "cc-cedict-沙田" }],
    ["Tai Po", "noun", "大埔", { sourceEntryId: "cc-cedict-大埔" }],
    ["Yuen Long", "noun", "元朗", { sourceEntryId: "cc-cedict-元朗" }],
    ["Tin Shui Wai", "noun", "天水圍", { sourceEntryId: "cc-cedict-天水圍" }],
    ["Tung Chung", "noun", "東涌", { sourceEntryId: "cc-cedict-東涌" }],
    ["Lantau Island", "noun", "大嶼山", { sourceEntryId: "cc-cedict-大嶼山" }],
    ["Cheung Chau", "noun", "長洲", { sourceEntryId: "cc-cedict-長洲" }],
    ["Lamma Island", "noun", "南丫島", { sourceEntryId: "cc-cedict-南丫島" }],
    ["Victoria Harbour", "noun", "維多利亞港", { sourceEntryId: "cc-cedict-維多利亞港" }],
    ["dim sum", "noun", "點心", { sourceEntryId: "cc-cedict-點心" }],
    ["mahjong", "noun", "麻將", { sourceEntryId: "cc-cedict-麻將" }],
    ["kung fu", "noun", "功夫", { sourceEntryId: "cc-cedict-功夫" }],
    ["tai chi", "noun", "太極", { sourceEntryId: "cc-cedict-太極" }],
    ["feng shui", "noun", "風水", { sourceEntryId: "cc-cedict-風水" }],
    ["typhoon", "noun", "颱風", { sourceEntryId: "cc-cedict-颱風" }],
    ["dragon boat", "noun", "龍舟", { sourceEntryId: "cc-cedict-龍舟" }],
    ["Mid-Autumn Festival", "noun", "中秋節", { aliases: ["Mid Autumn Festival"], sourceEntryId: "cc-cedict-中秋節" }],
    ["Lunar New Year", "noun", "農曆新年", { aliases: ["Chinese New Year"], sourceEntryId: "cc-cedict-農曆新年" }]
  ];

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
    const key = String(value || "").trim().replace(/[().]/g, "").toLowerCase();
    return POS_ALIASES[key] || "";
  }

  function normalizeAliases(value) {
    const aliases = Array.isArray(value)
      ? value
      : String(value || "").split(/[,，;；|]/);
    return Array.from(new Set(aliases.map(normalizeWord).filter(Boolean)));
  }

  function inferType(word, explicitType = "") {
    const type = String(explicitType || "").trim().toLowerCase();
    if (type === "phrase" || type === "word") return type;
    return normalizeWord(word).includes(" ") ? "phrase" : "word";
  }

  function makeEntry(raw, index) {
    const [word, pos, meaning, options = {}] = raw;
    const normalizedWord = normalizeWord(word);
    const normalizedMeaning = normalizeMeaning(meaning);
    if (!normalizedWord || !normalizedMeaning) return null;
    const normalizedPos = normalizePos(pos);
    const type = inferType(normalizedWord, options.type);
    return {
      id: `cc-cedict-${normalizedWord.replace(/[^a-z0-9]+/g, "-")}-${normalizedPos || type}-${index}`,
      word: normalizedWord,
      display: String(word || "").trim(),
      meaning: normalizedMeaning,
      pos: normalizedPos,
      type,
      source: "cc-cedict-supplement",
      sourceEntryId: String(options.sourceEntryId || `cc-cedict-supplement-${index}`),
      aliases: normalizeAliases(options.aliases)
    };
  }

  const entries = ENTRIES.map(makeEntry).filter(Boolean);
  const byWord = new Map();

  entries.forEach((entry) => {
    [entry.word, ...entry.aliases].forEach((key) => {
      if (!byWord.has(key)) byWord.set(key, []);
      byWord.get(key).push(entry);
    });
  });

  function lookup(word, options = {}) {
    const key = normalizeWord(word);
    const limit = Number(options.limit) || 12;
    if (!key) return [];
    return (byWord.get(key) || []).slice(0, limit);
  }

  return {
    entries,
    lookup,
    normalizeMeaning,
    normalizePos,
    normalizeWord
  };
});
