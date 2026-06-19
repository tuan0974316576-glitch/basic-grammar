(function attachVocabPosInference(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.VocabPosInference = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createVocabPosInference() {
  "use strict";

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
    限定詞: "determiner"
  };

  const INVALID_WORDS = new Set([
    "adj",
    "adjective",
    "adv",
    "adverb",
    "conj",
    "conjunction",
    "det",
    "n",
    "noun",
    "ph",
    "phr",
    "phrase",
    "prep",
    "preposition",
    "pron",
    "pronoun",
    "v",
    "verb"
  ]);

  const CHINESE_NOUN_ENDING = /(?:人|者|員|師|徒|販|家|商|物|品|器|具|車|船|店|館|場|所|法|式|感|力|性|度|量|份|面|點|儀式|能力|活動|情況|原因|結果|影響|問題|機會|方法|方面|部分|習慣|文化|社區|政府|公司|學校|學生|老師|記者|僧侶|小販|好奇心|吸引力|創新|發明|質感|飲品|粉|份量|邊界|思維|想法|瘋潮|慶典)$/;
  const CHINESE_ADJECTIVE_HINT = /(?:的|性|可|值得|充足|足夠|準確|安全|方便|突然|絕對|抽象|荒謬|急性)$/;
  const CHINESE_ADVERB_HINT = /(?:地|通常|其實|最終|另外|因此|準確地|足夠地|突然地)$/;
  const CHINESE_CONJUNCTION_HINT = /^(?:只要|如果|除非|因為|所以|雖然|但是|而且|或者|否則)$/;
  const CHINESE_VERB_HINT = /(?:接受|放棄|廢除|廢棄|遺棄|評估|取得|得到|獲取|獲得|收購|吸收|陪同|達成|達到|加速|承認|致謝|應付|累積|指控|取得|管理|改善|增加|減少|影響|展示|低估|打算|意圖|充滿|吞|打發|支持|把握|抓緊|充公|起源於|尋找|照顧|查閱|查字典)$/;

  const NOUN_SUFFIX = /(?:tion|sion|ment|ness|ity|ism|ship|age|ance|ence|cy|dom|hood|ture|logy|ist|ian|er|or|ee|ery|ary)$/;
  const ADJECTIVE_SUFFIX = /(?:able|ible|al|ful|less|ous|ive|ic|ical|ary|ent|ant|ed|ing)$/;
  const ADVERB_SUFFIX = /ly$/;
  const VERB_SUFFIX = /(?:ize|ise|ify|en|ate)$/;
  const COMMON_LY_NON_ADVERBS = new Set(["family", "friendly", "lonely", "lovely", "silly", "ugly"]);

  function normalizeWord(value) {
    return String(value || "")
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, "\"")
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

  function normalizeType(value, word = "") {
    const type = String(value || "").trim().toLowerCase();
    if (type === "pattern" || type === "phrase" || type === "word") return type;
    const normalizedWord = normalizeWord(word);
    if (/[+*=]|名詞|動詞|形容詞|副詞|\bpp\b/i.test(normalizedWord)) return "pattern";
    if (/\s/.test(normalizedWord) || /[-/]/.test(normalizedWord)) return "phrase";
    return "word";
  }

  function splitMeaningParts(meaning) {
    return normalizeMeaning(meaning)
      .split(/\s*[/／]\s*/)
      .map((part) => part.trim().replace(/[()（）].*?[)）]/g, "").trim())
      .filter(Boolean);
  }

  function getLookupPosList(word, lookup) {
    if (!lookup) return [];
    const normalizedWord = normalizeWord(word);
    const raw = lookup instanceof Map ? lookup.get(normalizedWord) : lookup[normalizedWord];
    const list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
    return Array.from(new Set(list.map(normalizePos).filter(Boolean)));
  }

  function scoreCandidates(candidates) {
    return candidates
      .filter((candidate) => candidate.pos)
      .sort((left, right) => right.confidence - left.confidence)[0] || null;
  }

  function inferEntryPos(entry = {}, options = {}) {
    const word = normalizeWord(entry.word || entry.display || entry.english);
    const meaning = normalizeMeaning(entry.meaning || entry.chinese);
    const explicitPos = normalizePos(entry.pos);
    const type = normalizeType(entry.type, word);

    if (explicitPos) {
      return { pos: explicitPos, confidence: 100, reason: "explicit" };
    }
    if (
      !word
      || !meaning
      || type === "pattern"
      || type === "phrase"
      || INVALID_WORDS.has(word)
      || (word.length === 1 && word !== "i")
    ) {
      return { pos: "", confidence: 0, reason: "not-inferred" };
    }

    const parts = splitMeaningParts(meaning);
    const oxfordPos = getLookupPosList(word, options.wordPosLookup || options.oxfordPosByWord);
    const candidates = [];

    if (oxfordPos.length === 1) {
      candidates.push({ pos: oxfordPos[0], confidence: 88, reason: "oxford-single-pos" });
    }

    if (parts.some((part) => CHINESE_CONJUNCTION_HINT.test(part))) {
      candidates.push({ pos: "conjunction", confidence: 92, reason: "chinese-conjunction-meaning" });
    }
    if (parts.some((part) => CHINESE_ADVERB_HINT.test(part))) {
      candidates.push({ pos: "adverb", confidence: 92, reason: "chinese-adverb-meaning" });
    }
    if (parts.some((part) => /的$/.test(part) || CHINESE_ADJECTIVE_HINT.test(part))) {
      candidates.push({ pos: "adjective", confidence: 90, reason: "chinese-adjective-meaning" });
    }
    if (parts.some((part) => CHINESE_NOUN_ENDING.test(part))) {
      candidates.push({ pos: "noun", confidence: 90, reason: "chinese-noun-meaning" });
    }
    if (parts.some((part) => CHINESE_VERB_HINT.test(part))) {
      candidates.push({ pos: "verb", confidence: 86, reason: "chinese-verb-meaning" });
    }

    if (ADVERB_SUFFIX.test(word) && !COMMON_LY_NON_ADVERBS.has(word)) {
      candidates.push({ pos: "adverb", confidence: 94, reason: "english-adverb-suffix" });
    }
    if (NOUN_SUFFIX.test(word)) {
      candidates.push({ pos: "noun", confidence: 82, reason: "english-noun-suffix" });
    }
    if (ADJECTIVE_SUFFIX.test(word)) {
      candidates.push({ pos: "adjective", confidence: 78, reason: "english-adjective-suffix" });
    }
    if (VERB_SUFFIX.test(word) && parts.some((part) => CHINESE_VERB_HINT.test(part))) {
      candidates.push({ pos: "verb", confidence: 88, reason: "english-verb-suffix-with-meaning" });
    }

    if (oxfordPos.length > 1) {
      const supported = candidates.find((candidate) => oxfordPos.includes(candidate.pos));
      if (supported) {
        supported.confidence = Math.min(96, supported.confidence + 6);
        supported.reason = `${supported.reason}+oxford`;
      }
    }

    const best = scoreCandidates(candidates);
    if (!best || best.confidence < (Number(options.minConfidence) || 76)) {
      return { pos: "", confidence: best?.confidence || 0, reason: best?.reason || "not-inferred" };
    }
    return best;
  }

  return {
    inferEntryPos,
    normalizeMeaning,
    normalizePos,
    normalizeType,
    normalizeWord,
    splitMeaningParts
  };
});
