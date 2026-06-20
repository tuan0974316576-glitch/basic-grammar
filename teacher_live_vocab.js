(function attachTeacherLiveVocab(root, factory) {
  const posInference = root.VocabPosInference
    || (typeof require === "function" ? require("./vocab_pos_inference.js") : null);
  const api = factory(posInference);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.TeacherLiveVocab = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createTeacherLiveVocab(VocabPosInference) {
  "use strict";

  const BATCH_NOUN_PHRASE_HINT = /(?:仔|撻|餅|糕|茶|飯|麵|粉|湯|包|果|糖|癌|病|帶|機|車|站|店|街|路|區|角|灣|山|河|湖|島|國|城|市|村|鎮|場|館|中心|機場|餐廳|公園|市場|學校|公司|節|術|器|具|物|品|人|者|員|師)$/;

  function normalizeWord(value) {
    if (VocabPosInference?.normalizeWord) return VocabPosInference.normalizeWord(value);
    return String(value || "")
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, "\"")
      .replace(/[‐‑‒–—―]/g, "-")
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function normalizeMeaning(value) {
    if (VocabPosInference?.normalizeMeaning) return VocabPosInference.normalizeMeaning(value);
    return String(value || "")
      .trim()
      .replace(/\s*[/／;；]\s*/g, " / ")
      .replace(/\s+/g, " ");
  }

  function normalizePos(value) {
    const inferred = VocabPosInference?.normalizePos?.(value);
    if (inferred) return inferred;
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
      modal: "modal",
      "modal v": "modal",
      pron: "pronoun",
      pronoun: "pronoun",
      det: "determiner",
      determiner: "determiner",
      aux: "auxiliary",
      auxiliary: "auxiliary",
      "auxiliary v": "auxiliary",
      exclam: "exclamation",
      exclamation: "exclamation",
      num: "number",
      number: "number",
      ph: "phrase",
      phr: "phrase",
      phrase: "phrase",
      詞組: "phrase",
      pt: "pattern",
      pattern: "pattern",
      句式: "pattern"
    };
    return aliases[key] || "";
  }

  function normalizeType(value, word = "") {
    const typeKey = String(value || "").trim().replace(/[().]/g, "").toLowerCase();
    if (["ph", "phr", "phrase"].includes(typeKey)) return "phrase";
    if (["pt", "pattern"].includes(typeKey)) return "pattern";
    if (["modal", "modal v", "aux", "auxiliary"].includes(typeKey)) return "word";
    if (typeKey === "word") return "word";
    const normalizedWord = normalizeWord(word);
    if (/[+*=]|\.{2,}|…|名詞|動詞|形容詞|副詞|\bpp\b/i.test(normalizedWord)) return "pattern";
    return normalizedWord.includes(" ") ? "phrase" : "word";
  }

  function normalizeAliases(value) {
    const aliases = Array.isArray(value)
      ? value
      : String(value || "").split(/[,，;；|]/);
    return [...new Set(aliases.map(normalizeWord).filter(Boolean))];
  }

  function utf8Bytes(value) {
    const text = String(value || "");
    if (typeof TextEncoder !== "undefined") return Array.from(new TextEncoder().encode(text));
    return Array.from(Buffer.from(text, "utf8"));
  }

  function leftRotate(value, shift) {
    return ((value << shift) | (value >>> (32 - shift))) >>> 0;
  }

  function sha1Hex(value) {
    const bytes = utf8Bytes(value);
    const bitLength = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) bytes.push(0);
    for (let shift = 56; shift >= 0; shift -= 8) {
      bytes.push(Math.floor(bitLength / (2 ** shift)) & 0xff);
    }

    let h0 = 0x67452301;
    let h1 = 0xefcdab89;
    let h2 = 0x98badcfe;
    let h3 = 0x10325476;
    let h4 = 0xc3d2e1f0;

    for (let chunk = 0; chunk < bytes.length; chunk += 64) {
      const words = new Array(80).fill(0);
      for (let index = 0; index < 16; index += 1) {
        const offset = chunk + (index * 4);
        words[index] = (
          (bytes[offset] << 24)
          | (bytes[offset + 1] << 16)
          | (bytes[offset + 2] << 8)
          | bytes[offset + 3]
        ) >>> 0;
      }
      for (let index = 16; index < 80; index += 1) {
        words[index] = leftRotate(words[index - 3] ^ words[index - 8] ^ words[index - 14] ^ words[index - 16], 1);
      }

      let a = h0;
      let b = h1;
      let c = h2;
      let d = h3;
      let e = h4;

      for (let index = 0; index < 80; index += 1) {
        let f;
        let k;
        if (index < 20) {
          f = (b & c) | ((~b) & d);
          k = 0x5a827999;
        } else if (index < 40) {
          f = b ^ c ^ d;
          k = 0x6ed9eba1;
        } else if (index < 60) {
          f = (b & c) | (b & d) | (c & d);
          k = 0x8f1bbcdc;
        } else {
          f = b ^ c ^ d;
          k = 0xca62c1d6;
        }
        const temp = (leftRotate(a, 5) + f + e + k + words[index]) >>> 0;
        e = d;
        d = c;
        c = leftRotate(b, 30);
        b = a;
        a = temp;
      }

      h0 = (h0 + a) >>> 0;
      h1 = (h1 + b) >>> 0;
      h2 = (h2 + c) >>> 0;
      h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0;
    }

    return [h0, h1, h2, h3, h4]
      .map((part) => part.toString(16).padStart(8, "0"))
      .join("");
  }

  function legacyAppHash(value) {
    let hash = 2166136261;
    const text = String(value || "");
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(36);
  }

  function makeEntryIdWithHash(entry = {}, hashFn = (value) => sha1Hex(value).slice(0, 10)) {
    const word = normalizeWord(entry.word || entry.display);
    const meaning = normalizeMeaning(entry.meaning);
    const pos = normalizePos(entry.pos);
    const type = normalizeType(entry.type || entry.pos, word);
    const slug = [word, pos || type || "entry", meaning]
      .join("-")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 52) || "teacher-vocab";
    return `${slug}-${hashFn(`${word}|${pos}|${type}|${meaning}`)}`.slice(0, 80);
  }

  function makeEntryId(entry = {}) {
    return makeEntryIdWithHash(entry);
  }

  function makeLegacyAppEntryId(entry = {}) {
    return makeEntryIdWithHash(entry, legacyAppHash);
  }

  function normalizeEntry(raw = {}, options = {}) {
    const word = normalizeWord(raw.word || raw.display);
    const meaning = normalizeMeaning(raw.meaning);
    if (!word || !meaning) return null;
    const pos = normalizePos(raw.pos);
    const type = normalizeType(raw.type || raw.pos, word);
    const id = String(raw.sourceEntryId || raw.id || makeEntryId({ word, meaning, pos, type })).trim();
    return {
      id,
      word,
      display: String(raw.display || raw.word || word).trim() || word,
      meaning,
      pos,
      type,
      aliases: normalizeAliases(raw.aliases || raw.alias),
      level: String(raw.level || "").trim().toUpperCase().slice(0, 2),
      source: String(options.source || raw.source || "teacher-live"),
      notes: normalizeMeaning(raw.notes || "").slice(0, 120),
      disabled: Boolean(raw.disabled),
      sourceEntryId: id,
      updatedAt: Number(raw.updatedAt) || Date.now()
    };
  }

  function parseBatchParts(parts = [], options = {}) {
    const cleanParts = parts.map((part) => String(part || "").trim()).filter(Boolean);
    if (cleanParts.length < 2) return null;

    const possiblePos = normalizePos(cleanParts[1]);
    if (cleanParts.length >= 3 && possiblePos) {
      return {
        word: cleanParts[0],
        pos: possiblePos,
        meaning: cleanParts.slice(2).join(" ")
      };
    }

    const word = cleanParts[0];
    const meaning = cleanParts.slice(1).join(" ");
    return {
      word,
      pos: inferBatchPos({ word, meaning }, options),
      meaning
    };
  }

  function inferBatchPos(entry = {}, options = {}) {
    const inferred = VocabPosInference?.inferEntryPos?.(entry, { minConfidence: 76 });
    const word = normalizeWord(entry.word || entry.display);
    if (inferred?.pos) return inferred.pos;
    if (word.includes(" ")) return looksLikeBatchNounPhrase(entry) ? "noun" : "phrase";
    return normalizePos(options.defaultPos) || "noun";
  }

  function looksLikeBatchNounPhrase(entry = {}) {
    const meaning = normalizeMeaning(entry.meaning || entry.chinese);
    return BATCH_NOUN_PHRASE_HINT.test(meaning);
  }

  function parseBatchLine(line = "", options = {}) {
    const raw = String(line || "").trim();
    const lineNumber = Number(options.lineNumber) || 0;
    if (!raw || /^#/.test(raw)) return { skipped: true, lineNumber };

    const cleaned = raw.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim();
    const delimitedParts = cleaned.includes("\t")
      ? cleaned.split(/\t+/)
      : cleaned.includes("|")
        ? cleaned.split("|")
        : null;
    const fromDelimited = delimitedParts ? parseBatchParts(delimitedParts, options) : null;
    const posPattern = /^(.*?)\s+(modal\s+v\.?|n\.?|noun|v\.?|verb|adj\.?|adjective|adv\.?|adverb|ph\.?|phrase|conj\.?|conjunction|prep\.?|preposition)\s+(.+)$/i;
    const posMatch = fromDelimited ? null : cleaned.match(posPattern);
    const colonMatch = fromDelimited || posMatch ? null : cleaned.match(/^(.+?)\s*(?:=|:|：)\s*(.+)$/);
    const dashMatch = fromDelimited || posMatch || colonMatch ? null : cleaned.match(/^(.+?)\s+[-–—]\s+(.+)$/);
    const cjkMatch = fromDelimited || posMatch || colonMatch || dashMatch ? null : cleaned.match(/^(.+?)\s+([\u3400-\u9FFF\uF900-\uFAFF].*)$/);
    const parsed = fromDelimited
      || (posMatch ? { word: posMatch[1], pos: normalizePos(posMatch[2]), meaning: posMatch[3] } : null)
      || (colonMatch ? { word: colonMatch[1], meaning: colonMatch[2] } : null)
      || (dashMatch ? { word: dashMatch[1], meaning: dashMatch[2] } : null)
      || (cjkMatch ? { word: cjkMatch[1], meaning: cjkMatch[2] } : null);
    if (parsed && !parsed.pos) {
      parsed.pos = inferBatchPos(parsed, options);
    }

    const normalized = parsed ? normalizeEntry(parsed, { source: "teacher-live" }) : null;
    if (!normalized) {
      return {
        error: true,
        lineNumber,
        raw,
        message: "cannot-parse"
      };
    }

    return {
      entry: normalized,
      lineNumber,
      raw
    };
  }

  function parseBatchText(text = "", options = {}) {
    const entries = [];
    const errors = [];
    let skippedCount = 0;
    String(text || "").split(/\r?\n/).forEach((line, index) => {
      const result = parseBatchLine(line, { ...options, lineNumber: index + 1 });
      if (result.skipped) {
        skippedCount += 1;
      } else if (result.error) {
        errors.push(result);
      } else if (result.entry) {
        entries.push({ ...result.entry, lineNumber: result.lineNumber });
      }
    });
    return { entries, errors, skippedCount };
  }

  function compactEntry(entry = {}) {
    return Object.fromEntries(Object.entries(entry).filter(([, value]) => (
      !(typeof value === "string" && value === "")
      && !(Array.isArray(value) && value.length === 0)
    )));
  }

  return {
    compactEntry,
    makeEntryId,
    makeLegacyAppEntryId,
    normalizeAliases,
    normalizeEntry,
    normalizeMeaning,
    normalizePos,
    normalizeType,
    normalizeWord,
    parseBatchLine,
    parseBatchText,
    sha1Hex
  };
});
