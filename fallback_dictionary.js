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
      const key = makeCacheKey(entry.word, entry.pos);
      const current = CACHE.get(key) || [];
      current.push({
        id: String(entry.id || key),
        word: normalizeWord(entry.word),
        meaning: normalizeMeaning(entry.meaning),
        pos: normalizePos(entry.pos),
        type: entry.type || "word",
        source: "offline-dictionary",
        sourceEntryId: String(entry.sourceEntryId || entry.id || key),
        sourceCount: Number(entry.sourceCount) || 1
      });
      CACHE.set(key, current);
    });
    loaded = true;
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
