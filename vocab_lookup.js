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

  function dedupeVisibleLabels(matches = [], options = {}) {
    const kept = [];
    return matches.filter((entry) => {
      const key = [
        getEntryPos(entry, options)
      ].join("|");
      const entryParts = new Set(entryMeaningParts(entry, options));
      const isCovered = kept.some((keptEntry) => {
        const keptKey = [
          getEntryPos(keptEntry, options)
        ].join("|");
        if (keptKey !== key) return false;
        const keptParts = new Set(entryMeaningParts(keptEntry, options));
        if (!entryParts.size || !keptParts.size) return getMeaningGroupKey(keptEntry, options) === getMeaningGroupKey(entry, options);
        return Array.from(entryParts).every((part) => keptParts.has(part))
          || Array.from(keptParts).every((part) => entryParts.has(part));
      });
      if (isCovered) return false;
      kept.push(entry);
      return true;
    });
  }

  function limitVisibleMatches(matches = [], limit = 12, options = {}) {
    return dedupeVisibleLabels(dedupeMatches(matches, options), options)
      .slice(0, Number(limit) || 12);
  }

  function withDefaultSource(matches = [], source = "") {
    if (!source) return matches;
    return matches.map((entry) => ({
      ...entry,
      source: entry.source || source
    }));
  }

  function filterMatchesForQuery(matches = [], word = "") {
    const query = String(word || "").trim();
    const ambiguousCaseKeys = new Set(["it", "us"]);
    const acronymQuery = /^[A-Z][A-Z0-9&.-]*$/.test(query) && query.length >= 2;
    const filtered = matches.filter((entry) => {
      const display = String(entry.display || entry.word || "").trim();
      const acronymDisplay = /^[A-Z][A-Z0-9&.-]*$/.test(display) && display.length >= 2;
      const ambiguousCase = acronymDisplay && ambiguousCaseKeys.has(normalizeText(display));
      if (acronymQuery && display !== query && normalizeText(display) === normalizeText(query)) return false;
      if (entry.matchCase || ambiguousCase) return display === query;
      return true;
    });
    const exactCaseMatches = filtered.filter((entry) => (
      entry.matchCase
      && String(entry.display || entry.word || "").trim() === query
    ));
    return exactCaseMatches.length ? exactCaseMatches : filtered;
  }

  function preferExactCaseMatches(matches = [], word = "") {
    const query = String(word || "").trim();
    if (!query) return matches;
    const exactCaseMatches = matches.filter((entry) => (
      entry.matchCase
      && String(entry.display || entry.word || "").trim() === query
    ));
    return exactCaseMatches.length ? exactCaseMatches : matches;
  }

  function splitMeaningParts(meaning = "") {
    return normalizeMeaning(meaning)
      .split(/\s*[/／]\s*/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function entryMeaningParts(entry = {}, options = {}) {
    return splitMeaningParts(entry.meaning).map((part) => {
      if (typeof options.normalizeMeaningGroupKey === "function") {
        return options.normalizeMeaningGroupKey(part);
      }
      return part.replace(/[\s/／]+/g, "").toLowerCase();
    }).filter(Boolean);
  }

  function suppressTeacherEntriesCoveredByCurated(teacherMatches = [], curatedMatches = [], options = {}) {
    if (!teacherMatches.length || !curatedMatches.length) {
      return { matches: teacherMatches, suppressedCount: 0 };
    }
    const curatedPartKeysByPos = new Map();
    const overrideCuratedPos = new Set();
    curatedMatches.forEach((entry) => {
      const pos = getEntryPos(entry, options);
      if (entry.overrideTeacher && pos && !entry.hidden) overrideCuratedPos.add(pos);
      const keys = entryMeaningParts(entry, options);
      if (!keys.length) return;
      if (!curatedPartKeysByPos.has(pos)) curatedPartKeysByPos.set(pos, new Set());
      keys.forEach((key) => curatedPartKeysByPos.get(pos).add(key));
    });

    let suppressedCount = 0;
    const suppressedMatches = [];
    const matches = teacherMatches.filter((entry) => {
      const teacherPos = getEntryPos(entry, options);
      const explicitTeacherPos = normalizeText(entry.pos);
      const inferredOnlyTeacherPos = !explicitTeacherPos && teacherPos;
      const teacherParts = entryMeaningParts(entry, options);
      const coveredByOverridePos = teacherPos && overrideCuratedPos.has(teacherPos);
      if (!teacherParts.length) return true;
      const candidateSets = teacherPos
        ? [curatedPartKeysByPos.get(teacherPos)]
        : Array.from(curatedPartKeysByPos.values());
      const fullyCovered = candidateSets.some((set) => (
        set && teacherParts.every((part) => set.has(part))
      ));
      const partiallyCovered = !teacherPos && candidateSets.some((set) => (
        set && teacherParts.some((part) => set.has(part))
      ));
      const coveredByAnyCuratedPos = inferredOnlyTeacherPos && Array.from(curatedPartKeysByPos.values()).some((set) => (
        set && teacherParts.some((part) => set.has(part))
      ));
      const coveredByCuratedSuperset = curatedMatches.some((curatedEntry) => {
        const curatedPos = getEntryPos(curatedEntry, options);
        if (teacherPos && curatedPos && teacherPos !== curatedPos) return false;
        const curatedParts = new Set(entryMeaningParts(curatedEntry, options));
        if (!curatedParts.size) return false;
        return teacherParts.every((part) => curatedParts.has(part))
          && curatedParts.size > teacherParts.length;
      });
      const coveredByOverride = curatedMatches.some((curatedEntry) => (
        curatedEntry.overrideTeacher
        && (
          curatedMatchesCoverTeacherEntry(curatedEntry, entry, options)
          || entryMeaningParts(curatedEntry, options).some((part) => (
            teacherParts.some((teacherPart) => (
              part === teacherPart
              || (teacherPart.length >= 2 && part.includes(teacherPart))
              || (part.length >= 2 && teacherPart.includes(part))
            ))
          ))
        )
      ));
      const shouldSuppress = (!teacherPos && partiallyCovered)
        || coveredByAnyCuratedPos
        || coveredByOverridePos
        || coveredByCuratedSuperset
        || coveredByOverride
        || (fullyCovered && teacherParts.length > 1);
      if (shouldSuppress) {
        suppressedCount += 1;
        suppressedMatches.push(entry);
      }
      return !shouldSuppress;
    });
    return { matches, suppressedCount, suppressedMatches };
  }

  function suppressCuratedEntriesCoveredByTeacher(curatedMatches = [], teacherMatches = [], options = {}) {
    if (!curatedMatches.length || !teacherMatches.length) {
      return { matches: curatedMatches, suppressedCount: 0 };
    }

    const teacherPartKeysByPos = new Map();
    teacherMatches.forEach((entry) => {
      const pos = getEntryPos(entry, options);
      const keys = entryMeaningParts(entry, options);
      if (!pos || !keys.length) return;
      if (!teacherPartKeysByPos.has(pos)) teacherPartKeysByPos.set(pos, new Set());
      keys.forEach((key) => teacherPartKeysByPos.get(pos).add(key));
    });

    let suppressedCount = 0;
    const matches = curatedMatches.filter((entry) => {
      const curatedPos = getEntryPos(entry, options);
      const curatedParts = entryMeaningParts(entry, options);
      const teacherKeys = teacherPartKeysByPos.get(curatedPos);
      if (!teacherKeys || !curatedParts.length) return true;
      const fullyCovered = curatedParts.every((part) => teacherKeys.has(part));
      if (fullyCovered) suppressedCount += 1;
      return !fullyCovered;
    });
    return { matches, suppressedCount };
  }

  function curatedMatchesCoverTeacherEntry(curatedEntry = {}, teacherEntry = {}, options = {}) {
    const teacherPos = getEntryPos(teacherEntry, options);
    const curatedPos = getEntryPos(curatedEntry, options);
    if (teacherPos && curatedPos && teacherPos !== curatedPos) return false;
    const teacherParts = entryMeaningParts(teacherEntry, options);
    const curatedParts = new Set(entryMeaningParts(curatedEntry, options));
    if (!teacherParts.length || !curatedParts.size) return false;
    return teacherParts.some((part) => curatedParts.has(part));
  }

  function mergeTeacherAndCuratedMatches(teacherMatches = [], curatedMatches = [], teacherFilter = {}, curatedFilter = {}, options = {}) {
    const keptTeacherMatches = new Set(teacherFilter.matches || []);
    const suppressedTeacherMatches = new Set(teacherFilter.suppressedMatches || []);
    const remainingCurated = [...(curatedFilter.matches || curatedMatches)];
    const merged = [];

    teacherMatches.forEach((teacherEntry) => {
      if (keptTeacherMatches.has(teacherEntry)) {
        merged.push(teacherEntry);
        return;
      }
      if (!suppressedTeacherMatches.has(teacherEntry)) return;
      for (let index = 0; index < remainingCurated.length; index += 1) {
        const curatedEntry = remainingCurated[index];
        if (!curatedMatchesCoverTeacherEntry(curatedEntry, teacherEntry, options)) continue;
        merged.push(curatedEntry);
        remainingCurated.splice(index, 1);
        index -= 1;
      }
    });

    return [...merged, ...remainingCurated];
  }

  async function buildLookupMatches(word, providers = {}, options = {}) {
    let liveTeacherMatches = await callProvider(providers.getLiveTeacherMatches, word);
    if (!liveTeacherMatches.length && providers.shouldFetchLiveTeacher?.(word)) {
      liveTeacherMatches = await callProvider(providers.fetchLiveTeacherMatches, word);
    }
    if (liveTeacherMatches.length) {
      return limitVisibleMatches(
        preferExactCaseMatches(withDefaultSource(liveTeacherMatches, "teacher-live"), word),
        options.liveTeacherLimit,
        options
      );
    }

    const curatedMatches = filterMatchesForQuery(withDefaultSource(
      await callProvider(providers.getCuratedMatches, word),
      "curated-sense-bank"
    ), word);
    const visibleCuratedMatches = curatedMatches.filter((entry) => !entry.hidden);
    const visibleCuratedOverrideMatches = curatedMatches.filter((entry) => entry.overrideTeacher && !entry.hidden);
    const hiddenCuratedOverrideMatches = curatedMatches.filter((entry) => entry.overrideTeacher && entry.hidden);
    if (hiddenCuratedOverrideMatches.length && !visibleCuratedOverrideMatches.length && !visibleCuratedMatches.length) {
      return [];
    }

    const teacherMatches = filterMatchesForQuery(withDefaultSource(
      await callProvider(providers.getTeacherMatches, word),
      "teacher"
    ), word);
    if (teacherMatches.length) {
      const teacherFilter = suppressTeacherEntriesCoveredByCurated(teacherMatches, curatedMatches, options);
      const curatedFilter = suppressCuratedEntriesCoveredByTeacher(visibleCuratedMatches, teacherFilter.matches, options);
      const mergedMatches = teacherFilter.suppressedCount
        ? mergeTeacherAndCuratedMatches(teacherMatches, visibleCuratedMatches, teacherFilter, curatedFilter, options)
        : [...teacherFilter.matches, ...curatedFilter.matches];
      return limitVisibleMatches(
        preferExactCaseMatches([...visibleCuratedOverrideMatches, ...mergedMatches], word),
        options.teacherLimit,
        options
      );
    }

    if (visibleCuratedMatches.length) {
      return limitVisibleMatches(preferExactCaseMatches(visibleCuratedMatches, word), options.curatedLimit, options);
    }

    const cedictSupplementMatches = filterMatchesForQuery(withDefaultSource(
      await callProvider(providers.getCcCedictSupplementMatches, word),
      "cc-cedict-supplement"
    ), word);
    if (cedictSupplementMatches.length) {
      return limitVisibleMatches(preferExactCaseMatches(cedictSupplementMatches, word), options.ccCedictSupplementLimit, options);
    }

    return [];
  }

  return {
    buildLookupMatches,
    dedupeMatches,
    dedupeVisibleLabels,
    getEntryPos,
    suppressCuratedEntriesCoveredByTeacher
  };
});
