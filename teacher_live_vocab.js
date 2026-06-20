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
    if (VocabPosInference?.normalizePos) return VocabPosInference.normalizePos(value);
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
      "modal v": "modal"
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
    sha1Hex
  };
});
