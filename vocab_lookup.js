(function attachVocabLookup(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.VocabLookup = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createVocabLookup() {
  "use strict";

  function normalizeText(value) {
    return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  }

  function normalizeMeaning(value) {
    return String(value || "").trim().replace(/\s*[/／;；]\s*/g, " / ").replace(/\s+/g, " ");
  }

  function callProvider(provider, word) {
    if (typeof provider !== "function") return Promise.resolve([]);
    return Promise.resolve(provider(word)).then((value) => (Array.isArray(value) ? value : []));
  }

  function getEntryPos(entry = {}, options = {}) {
    if (typeof options.getEntryPos === "function") {
      return options.getEntryPos(entry) || "";
    }
    if (typeof options.normalizePos === "function") {
      return options.normalizePos(entry.pos || entry.inferredPos) || "";
    }
    return normalizeText(entry.pos || entry.inferredPos);
  }

  function getDedupedWord(entry = {}, options = {}) {
    const word = entry.word || entry.display || "";
    return typeof options.normalizeWord === "function" ? options.normalizeWord(word) : normalizeText(word);
  }

  function getMeaningGroupKey(entry = {}, options = {}) {
    if (typeof options.normalizeMeaningGroupKey === "function") {
      return options.normalizeMeaningGroupKey(entry.meaning);
    }
    return normalizeMeaning(entry.meaning).replace(/[\s/／]+/g, "").toLowerCase();
  }

  function dedupeMatches(matches = [], options = {}) {
    const seen = new Set();
    return matches.filter((entry) => {
      const key = [
        getDedupedWord(entry, options),
        getEntryPos(entry, options),
        String(entry.type || "").trim().toLowerCase(),
        getMeaningGroupKey(entry, options)
      ].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function withDefaultSource(matches = [], source = "") {
    if (!source) return matches;
    return matches.map((entry) => ({
      ...entry,
      source: entry.source || source
    }));
  }

  async function buildLookupMatches(word, providers = {}, options = {}) {
    let liveTeacherMatches = await callProvider(providers.getLiveTeacherMatches, word);
    if (!liveTeacherMatches.length && providers.shouldFetchLiveTeacher?.(word)) {
      liveTeacherMatches = await callProvider(providers.fetchLiveTeacherMatches, word);
    }
    if (liveTeacherMatches.length) {
      return dedupeMatches(withDefaultSource(liveTeacherMatches, "teacher-live"), options)
        .slice(0, Number(options.liveTeacherLimit) || 12);
    }

    const curatedMatches = withDefaultSource(
      await callProvider(providers.getCuratedMatches, word),
      "curated-sense-bank"
    );
    const curatedOverrideMatches = curatedMatches.filter((entry) => entry.overrideTeacher);
    if (curatedOverrideMatches.length) {
      return dedupeMatches(curatedOverrideMatches, options).slice(0, Number(options.curatedOverrideLimit) || 12);
    }

    const teacherMatches = withDefaultSource(
      await callProvider(providers.getTeacherMatches, word),
      "teacher"
    );
    if (teacherMatches.length) {
      return dedupeMatches(teacherMatches, options).slice(0, Number(options.teacherLimit) || 12);
    }

    if (curatedMatches.length) {
      return dedupeMatches(curatedMatches, options).slice(0, Number(options.curatedLimit) || 12);
    }

    const cedictSupplementMatches = withDefaultSource(
      await callProvider(providers.getCcCedictSupplementMatches, word),
      "cc-cedict-supplement"
    );
    if (cedictSupplementMatches.length) {
      return dedupeMatches(cedictSupplementMatches, options).slice(0, Number(options.ccCedictSupplementLimit) || 12);
    }

    const reverseCedictMatches = withDefaultSource(
      await callProvider(providers.getCcCedictReverseMatches, word),
      "cc-cedict-reverse"
    );
    if (reverseCedictMatches.length) {
      return dedupeMatches(reverseCedictMatches, options).slice(0, Number(options.ccCedictReverseLimit) || 8);
    }

    return [];
  }

  return {
    buildLookupMatches,
    dedupeMatches,
    getEntryPos
  };
});
