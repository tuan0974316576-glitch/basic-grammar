(function attachCcCedictReverse(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.CcCedictReverse = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createCcCedictReverse() {
  "use strict";

  const CACHE = new Map();
  const LOADED_SHARDS = new Set();
  const LOADING_SHARDS = new Map();

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

  function inferType(word, explicitType = "") {
    const type = String(explicitType || "").trim().toLowerCase();
    if (type === "phrase" || type === "word") return type;
    return normalizeWord(word).includes(" ") ? "phrase" : "word";
  }

  function compareEntries(left = {}, right = {}) {
    const leftScore = Number(left.rank) || 999999;
    const rightScore = Number(right.rank) || 999999;
    return leftScore - rightScore
      || String(left.meaning || "").localeCompare(String(right.meaning || ""));
  }

  function shardName(word) {
    const first = normalizeWord(word)[0] || "#";
    return /^[a-z]$/.test(first) ? first : "other";
  }

  function seed(entries = []) {
    entries.forEach((entry) => {
      const word = normalizeWord(entry.word);
      const meaning = normalizeMeaning(entry.meaning);
      if (!word || !meaning) return;
      const normalizedEntry = {
        id: String(entry.id || `cc-reverse-${word}`),
        word,
        display: String(entry.display || word).trim() || word,
        meaning,
        pos: String(entry.pos || "").trim().toLowerCase(),
        type: inferType(word, entry.type),
        source: "cc-cedict-reverse",
        sourceEntryId: String(entry.sourceEntryId || entry.id || `cc-reverse-${word}`),
        sourceCount: Number(entry.sourceCount) || 1,
        rank: Number(entry.rank) || 999999
      };
      const current = CACHE.get(word) || [];
      const duplicateIndex = current.findIndex((item) => item.meaning === normalizedEntry.meaning);
      if (duplicateIndex >= 0) {
        const previous = current[duplicateIndex];
        current[duplicateIndex] = {
          ...previous,
          sourceCount: Math.max(previous.sourceCount || 1, normalizedEntry.sourceCount || 1),
          rank: Math.min(previous.rank || 999999, normalizedEntry.rank || 999999)
        };
      } else {
        current.push(normalizedEntry);
      }
      current.sort(compareEntries);
      CACHE.set(word, current);
    });
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
      script.onerror = () => reject(new Error(`Unable to load CC-CEDICT reverse shard: ${url}`));
      document.head.appendChild(script);
    });
  }

  async function loadShardForWord(word) {
    const shard = shardName(word);
    if (LOADED_SHARDS.has(shard)) return true;
    if (!canLoadShard()) return false;
    if (LOADING_SHARDS.has(shard)) return LOADING_SHARDS.get(shard);

    const promise = (async () => {
      await loadScript(`assets/cc-cedict-reverse/${shard}.js`);
      const payload = window.CC_CEDICT_REVERSE_SHARDS?.[shard] || window.CC_CEDICT_REVERSE_SHARD;
      if (payload?.entries?.length) {
        seed(payload.entries);
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
    const key = normalizeWord(word);
    const limit = Number(options.limit) || 8;
    if (!key) return [];
    return (CACHE.get(key) || []).slice(0, limit);
  }

  return {
    loadShardForWord,
    lookup,
    normalizeMeaning,
    normalizeWord,
    seed,
    shardName
  };
});
