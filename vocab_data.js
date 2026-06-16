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
  const DELETE_GRACE_MS = 30 * 24 * 60 * 60 * 1000;

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

  function createId(word) {
    return normalizeWord(word).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `word-${Date.now()}`;
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
    const word = normalizeWord(item.word);
    const meaning = normalizeMeaning(item.meaning);
    if (!word || !meaning) return null;

    const now = Number(options.now) || Date.now();
    const id = String(item.id || options.id || createId(word));
    const createdAt = safeTime(timestampToMillis(item.createdAt, item.createdAt), now);
    const updatedAt = safeTime(timestampToMillis(item.updatedAt, item.updatedAt), createdAt);
    const deletedAt = Number(timestampToMillis(item.deletedAt, item.deletedAt)) || 0;
    const progress = VocabScheduler?.normalizeProgress
      ? VocabScheduler.normalizeProgress(item.progress || {})
      : (item.progress || {});

    return {
      id,
      word,
      meaning,
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
      createdAt: normalized.createdAt,
      updatedAt: normalized.updatedAt,
      deletedAt: Number(options.deletedAt) || 0,
      progress: stripProgressForStorage(normalized.progress)
    };
  }

  return {
    DELETE_GRACE_MS,
    createId,
    makeCloudDoc,
    mergeItems,
    mergeProgress,
    normalizeItem,
    normalizeMeaning,
    normalizeWord,
    stripItemForStorage,
    stripProgressForStorage,
    timestampToMillis
  };
});
