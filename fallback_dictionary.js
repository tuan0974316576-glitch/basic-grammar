(function attachFallbackDictionary(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.FallbackDictionary = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createFallbackDictionary() {
  "use strict";

  const CACHE = new Map();
  const LOADED_SHARDS = new Set();
  const LOADING_SHARDS = new Map();
  let loaded = false;

  const CURATED_ENTRIES = [
    { id: "curated-have-verb", word: "have", pos: "verb", meaning: "有", rank: 8 },
    { id: "curated-have-eat-drink-verb", word: "have", pos: "verb", meaning: "食 / 飲", rank: 9 },
    { id: "curated-has-verb", word: "has", pos: "verb", meaning: "有", rank: 8 },
    { id: "curated-has-eat-drink-verb", word: "has", pos: "verb", meaning: "食 / 飲", rank: 9 },
    { id: "curated-had-verb", word: "had", pos: "verb", meaning: "有過", rank: 8 },
    { id: "curated-had-eat-drink-verb", word: "had", pos: "verb", meaning: "食咗 / 飲咗", rank: 9 },
    { id: "curated-have-to-phrase", word: "have to", pos: "", meaning: "必須 / 要", type: "phrase", rank: 8 },
    { id: "curated-guts-noun", word: "guts", pos: "noun", meaning: "膽量", rank: 8700 }
  ];

  const BLOCKED_MEANING_PATTERNS = [
    /飛碟遊戲/
  ];

  function normalizeWord(value) {
    return String(value || "")
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function normalizeMeaning(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ");
  }

  function normalizePos(value) {
    return String(value || "").trim().toLowerCase();
  }

  function makeCacheKey(word, pos = "") {
    return `${normalizeWord(word)}|${normalizePos(pos)}`;
  }

  function seed(entries = []) {
    entries.forEach((entry) => {
      if (shouldBlockEntry(entry)) return;
      const key = makeCacheKey(entry.word, entry.pos);
      const current = CACHE.get(key) || [];
      const normalizedEntry = {
        id: String(entry.id || key),
        word: normalizeWord(entry.word),
        meaning: normalizeMeaning(entry.meaning),
        pos: normalizePos(entry.pos),
        type: entry.type || "word",
        source: entry.source || "offline-dictionary",
        sourceEntryId: String(entry.sourceEntryId || entry.id || key),
        sourceCount: Number(entry.sourceCount) || 1,
        rank: Number(entry.rank) || 999999
      };
      const duplicateIndex = current.findIndex((item) => (
        item.word === normalizedEntry.word
        && item.pos === normalizedEntry.pos
        && item.meaning === normalizedEntry.meaning
      ));
      if (duplicateIndex >= 0) {
        if ((current[duplicateIndex].rank || 999999) > normalizedEntry.rank) {
          current[duplicateIndex] = normalizedEntry;
        }
      } else {
        current.push(normalizedEntry);
      }
      current.sort(compareEntries);
      CACHE.set(key, current);
    });
    loaded = true;
  }

  function shouldBlockEntry(entry = {}) {
    const meaning = normalizeMeaning(entry.meaning);
    return BLOCKED_MEANING_PATTERNS.some((pattern) => pattern.test(meaning));
  }

  function compareEntries(left = {}, right = {}) {
    const leftRank = Number(left.rank) || 999999;
    const rightRank = Number(right.rank) || 999999;
    return leftRank - rightRank
      || String(left.meaning || "").localeCompare(String(right.meaning || ""));
  }

  function shardName(word) {
    const first = normalizeWord(word)[0] || "#";
    return /^[a-z]$/.test(first) ? first : "other";
  }

  function canLoadShard() {
    return typeof document !== "undefined" && typeof window !== "undefined";
  }

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Unable to load offline dictionary shard: ${url}`));
      document.head.appendChild(script);
    });
  }

  async function loadShardForWord(word) {
    const shard = shardName(word);
    if (LOADED_SHARDS.has(shard)) return true;
    if (!canLoadShard()) return false;
    if (LOADING_SHARDS.has(shard)) return LOADING_SHARDS.get(shard);

    const promise = (async () => {
      await loadScript(`assets/offline-dictionary/${shard}.js`);
      const payload = window.OFFLINE_DICTIONARY_SHARDS?.[shard] || window.OFFLINE_DICTIONARY_SHARD;
      if (payload?.entries?.length) {
        seed(payload.entries.map((entry) => ({
          ...entry,
          sourceEntryId: entry.id
        })));
      }
      LOADED_SHARDS.add(shard);
      return true;
    })().catch((error) => {
      console.warn(error);
      LOADED_SHARDS.add(shard);
      return false;
    }).finally(() => {
      LOADING_SHARDS.delete(shard);
    });

    LOADING_SHARDS.set(shard, promise);
    return promise;
  }

  function lookup(word, options = {}) {
    const limit = Number(options.limit) || 10;
    const key = makeCacheKey(word, options.pos || "");
    const exact = CACHE.get(key) || [];
    if (exact.length) return exact.slice(0, limit);
    if (options.pos) return [];

    const prefix = normalizeWord(word);
    const results = [];
    CACHE.forEach((items, cacheKey) => {
      if (cacheKey.startsWith(`${prefix}|`)) {
        results.push(...items);
      }
    });
    return results.slice(0, limit);
  }

  function isLoaded() {
    return loaded;
  }

  seed(CURATED_ENTRIES.map((entry) => ({
    ...entry,
    source: "curated-dictionary",
    sourceEntryId: entry.id
  })));
  loaded = false;

  return {
    isLoaded,
    loadShardForWord,
    lookup,
    normalizeMeaning,
    normalizePos,
    normalizeWord,
    seed
  };
});
