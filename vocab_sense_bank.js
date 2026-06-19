(function attachVocabSenseBank(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.VocabSenseBank = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createVocabSenseBank() {
  "use strict";

  const POS_ALIASES = {
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
    determiner: "determiner"
  };

  const ENTRIES = [
    ["have", "verb", "有"],
    ["have", "verb", "食 / 飲"],
    ["have", "verb", "上 / 參加", { level: "A2" }],
    ["has", "verb", "有"],
    ["has", "verb", "食 / 飲"],
    ["had", "verb", "有過"],
    ["had", "verb", "食咗 / 飲咗"],
    ["have to", "", "必須 / 要", { type: "phrase" }],
    ["has to", "", "必須 / 要", { type: "phrase" }],
    ["had to", "", "必須 / 要", { type: "phrase" }],
    ["go", "verb", "去"],
    ["go", "verb", "變成", { level: "A2" }],
    ["go", "verb", "運作 / 進行", { level: "B1" }],
    ["get", "verb", "得到 / 取得"],
    ["get", "verb", "到達"],
    ["get", "verb", "變得", { level: "A2" }],
    ["make", "verb", "製作"],
    ["make", "verb", "使 / 令", { level: "A2" }],
    ["take", "verb", "拿 / 取"],
    ["take", "verb", "乘搭"],
    ["take", "verb", "花費時間", { level: "A2" }],
    ["look", "verb", "看"],
    ["look", "verb", "看起來", { level: "A2" }],
    ["look for", "", "尋找", { type: "phrase" }],
    ["look up", "", "查閱 / 查字典", { type: "phrase" }],
    ["look after", "", "照顧", { type: "phrase" }],
    ["look at", "", "看著", { type: "phrase" }],
    ["game", "noun", "遊戲"],
    ["game", "noun", "比賽"],
    ["game", "noun", "野味", { level: "C1", hidden: false }],
    ["right", "adjective", "正確的"],
    ["right", "noun", "右邊 / 右方"],
    ["right", "noun", "權利", { level: "B1" }],
    ["left", "adjective", "左邊的"],
    ["left", "verb", "離開了"],
    ["light", "noun", "光 / 燈"],
    ["light", "adjective", "輕的"],
    ["light", "adjective", "淺色的"],
    ["kind", "adjective", "友善的"],
    ["kind", "noun", "種類"],
    ["present", "noun", "禮物"],
    ["present", "adjective", "在場的", { level: "B1" }],
    ["present", "verb", "呈現 / 展示"],
    ["book", "noun", "書"],
    ["book", "verb", "預訂", { level: "A2" }],
    ["watch", "verb", "觀看"],
    ["watch", "noun", "手錶"],
    ["play", "verb", "玩"],
    ["play", "verb", "演奏"],
    ["play", "noun", "戲劇", { level: "B1" }],
    ["mean", "verb", "意思是"],
    ["mean", "adjective", "刻薄的", { level: "B1" }],
    ["can", "verb", "能夠"],
    ["can", "noun", "罐"],
    ["like", "verb", "喜歡"],
    ["like", "preposition", "像"],
    ["well", "adverb", "好地"],
    ["well", "noun", "井", { level: "B1" }],
    ["class", "noun", "班級 / 課堂"],
    ["class", "noun", "種類 / 等級", { level: "B1" }],
    ["match", "noun", "比賽"],
    ["match", "verb", "配對 / 相襯"],
    ["hard", "adjective", "困難的"],
    ["hard", "adverb", "努力地"],
    ["fine", "adjective", "好的 / 不錯的"],
    ["fine", "noun", "罰款", { level: "B1" }],
    ["point", "noun", "重點 / 分數"],
    ["point", "verb", "指著"],
    ["park", "noun", "公園"],
    ["park", "verb", "泊車"],
    ["orange", "noun", "橙"],
    ["orange", "adjective", "橙色的"],
    ["sound", "noun", "聲音"],
    ["sound", "verb", "聽起來"],
    ["close", "verb", "關上"],
    ["close", "adjective", "接近的 / 親近的"],
    ["table", "noun", "桌子"],
    ["table", "noun", "表格", { level: "A2" }],
    ["date", "noun", "日期"],
    ["date", "noun", "約會", { level: "B1" }],
    ["story", "noun", "故事"],
    ["story", "noun", "樓層", { level: "B1" }],
    ["letter", "noun", "信"],
    ["letter", "noun", "字母"],
    ["minute", "noun", "分鐘"],
    ["minute", "adjective", "極小的", { level: "C1" }],
    ["egg tart", "noun", "蛋撻", { type: "phrase" }],
    ["lung cancer", "noun", "肺癌", { type: "phrase" }],
    ["hawker", "noun", "小販"],
    ["evaluate", "verb", "評估"],
    ["guts", "noun", "膽量"]
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

  function inferType(word, explicitType = "") {
    const type = String(explicitType || "").trim().toLowerCase();
    if (type === "phrase" || type === "pattern" || type === "word") return type;
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
      id: `sense-${normalizedWord.replace(/[^a-z0-9]+/g, "-")}-${normalizedPos || type}-${index}`,
      word: normalizedWord,
      display: normalizedWord,
      meaning: normalizedMeaning,
      pos: normalizedPos,
      type,
      level: String(options.level || "").trim().toUpperCase(),
      source: "curated-sense-bank",
      sourceEntryId: `sense-bank-${index}`,
      hidden: Boolean(options.hidden)
    };
  }

  const entries = ENTRIES.map(makeEntry).filter(Boolean);
  const byWord = new Map();

  entries.forEach((entry) => {
    if (!byWord.has(entry.word)) byWord.set(entry.word, []);
    byWord.get(entry.word).push(entry);
  });

  function lookup(word, options = {}) {
    const key = normalizeWord(word);
    const limit = Number(options.limit) || 12;
    if (!key) return [];
    return (byWord.get(key) || [])
      .filter((entry) => options.includeHidden || !entry.hidden)
      .slice(0, limit);
  }

  return {
    entries,
    lookup,
    normalizeMeaning,
    normalizePos,
    normalizeWord
  };
});
