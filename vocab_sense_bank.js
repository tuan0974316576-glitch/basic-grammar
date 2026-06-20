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
    determiner: "determiner",
    modal: "modal",
    "modal v": "modal",
    auxiliary: "auxiliary",
    aux: "auxiliary",
    exclam: "exclamation",
    exclamation: "exclamation",
    interj: "exclamation",
    interjection: "exclamation",
    number: "number",
    num: "number"
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
    ["look up", "", "查閱 / 查字典", { type: "phrase", overrideTeacher: true }],
    ["look after", "", "照顧", { type: "phrase" }],
    ["look at", "", "看著", { type: "phrase" }],
    ["put on", "", "穿上 / 戴上", { type: "phrase" }],
    ["take off", "", "脫下 / 起飛", { type: "phrase", overrideTeacher: true }],
    ["pick up", "", "拿起 / 接載", { type: "phrase" }],
    ["give up", "", "放棄", { type: "phrase" }],
    ["turn on", "", "開啟", { type: "phrase" }],
    ["turn off", "", "關掉", { type: "phrase" }],
    ["get up", "", "起床", { type: "phrase" }],
    ["wake up", "", "醒來 / 叫醒", { type: "phrase" }],
    ["find out", "", "找出 / 查明", { type: "phrase" }],
    ["work", "noun", "工作", { overrideTeacher: true }],
    ["work", "noun", "作品", { overrideTeacher: true }],
    ["work", "verb", "工作 / 做事", { overrideTeacher: true }],
    ["work", "verb", "運作 / 奏效", { overrideTeacher: true }],
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
    ["can", "modal", "能夠"],
    ["can", "noun", "罐"],
    ["cannot", "modal", "不能"],
    ["won't", "modal", "不會"],
    ["ought to", "modal", "應該"],
    ["bye", "exclamation", "再見"],
    ["swift", "adjective", "迅速的"],
    ["prompt", "noun", "提示"],
    ["prompt", "verb", "促使"],
    ["prompt", "adjective", "迅速的"],
    ["like", "verb", "喜歡"],
    ["like", "preposition", "像"],
    ["well", "adverb", "好地"],
    ["well", "noun", "井", { level: "B1" }],
    ["many", "determiner", "很多", { overrideTeacher: true }],
    ["much", "determiner", "很多", { overrideTeacher: true }],
    ["more than", "", "多於 / 超過", { type: "phrase", overrideTeacher: true }],
    ["less than", "", "少於", { type: "phrase" }],
    ["a lot of", "", "很多", { type: "phrase" }],
    ["lots of", "", "很多", { type: "phrase" }],
    ["a piece of", "", "一塊 / 一張 / 一件", { type: "phrase" }],
    ["a pair of", "", "一雙 / 一對", { type: "phrase" }],
    ["a bottle of", "", "一瓶", { type: "phrase" }],
    ["a cup of", "", "一杯", { type: "phrase" }],
    ["a bowl of", "", "一碗", { type: "phrase" }],
    ["a glass of", "", "一杯", { type: "phrase" }],
    ["as a result", "", "結果 / 因此", { type: "phrase" }],
    ["for example", "", "例如", { type: "phrase" }],
    ["at least", "", "至少", { type: "phrase" }],
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
    ["rice", "noun", "飯 / 米"],
    ["noodle", "noun", "麵"],
    ["noodles", "noun", "麵"],
    ["homework", "noun", "功課"],
    ["information", "noun", "資訊 / 資料"],
    ["advice", "noun", "建議"],
    ["news", "noun", "新聞"],
    ["knowledge", "noun", "知識"],
    ["equipment", "noun", "器材 / 設備", { overrideTeacher: true }],
    ["furniture", "noun", "家具", { overrideTeacher: true }],
    ["bread", "noun", "麵包"],
    ["water", "noun", "水"],
    ["milk", "noun", "牛奶"],
    ["sugar", "noun", "糖"],
    ["cub", "noun", "幼獸"],
    ["cubs", "noun", "幼獸"],
    ["delicacy", "noun", "佳餚"],
    ["egg waffle", "noun", "雞蛋仔"],
    ["egg tart", "noun", "蛋撻", { type: "phrase" }],
    ["pineapple bun", "noun", "菠蘿包"],
    ["fish ball", "noun", "魚蛋"],
    ["siu mai", "noun", "燒賣"],
    ["dim sum", "noun", "點心"],
    ["MTR", "noun", "港鐵"],
    ["Octopus card", "noun", "八達通"],
    ["DSE", "noun", "文憑試"],
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
      hidden: Boolean(options.hidden),
      overrideTeacher: Boolean(options.overrideTeacher)
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
