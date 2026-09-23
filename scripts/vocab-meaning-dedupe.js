"use strict";

function normalizeWord(value) {
  return String(value || "")
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
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
  return String(value || "")
    .trim()
    .replace(/[().]/g, "")
    .toLowerCase();
}

function inferType(value, word = "") {
  const explicit = String(value || "").trim().toLowerCase();
  if (["pattern", "phrase", "word"].includes(explicit)) return explicit;
  const normalizedWord = normalizeWord(word);
  if (/[+*=]|\.{2,}|…|名詞|動詞|形容詞|副詞|\bpp\b/i.test(normalizedWord)) return "pattern";
  return /\s/.test(normalizedWord) || /[-/]/.test(normalizedWord) ? "phrase" : "word";
}

function meaningParts(value, options = {}) {
  const normalize = options.normalizeMeaning || normalizeMeaning;
  const canonical = normalize(value).replace(/\s*[,，、]\s*/g, " / ");
  return Array.from(new Set(
    canonical
      .split(" / ")
      .map((part) => normalize(part)
        .replace(/^[「『“\"]+/g, "")
        .replace(/[」』】”\"]+$/g, "")
        .replace(/[、，,;；]+$/g, "")
        .trim())
      .filter(Boolean)
  ));
}

function getGroupKey(entry = {}, options = {}) {
  const word = (options.normalizeWord || normalizeWord)(entry.word || entry.display);
  const type = (options.normalizeType || inferType)(entry.type || entry.pos, word);
  const pos = (options.effectivePos || ((item) => item.pos || item.inferredPos || ""))(entry);
  return [word, type, (options.normalizePos || normalizePos)(pos)].join("\u0001");
}

function getMeaningKey(entry = {}, options = {}) {
  return meaningParts(entry.meaning, options).join(" / ");
}

function entryIdentity(entry = {}, index = 0) {
  return String(entry.id || entry.sourceEntryId || `entry-${index}`);
}

function entryRank(entry = {}) {
  const meaning = String(entry.meaning || "").trim();
  const hasClosingQuote = /[」』】）)](?:[、，,;；])?$/.test(meaning);
  const hasTrailingSeparator = /[、，,;；]$/.test(meaning);
  return (entry.pos || entry.inferredPos ? 16 : 0)
    + (entry.override ? 8 : 0)
    + (entry.source === "teacher" || entry.source === "reviewed-teacher-bank" ? 4 : 0)
    + (Array.isArray(entry.teacherExamples) ? entry.teacherExamples.length : 0)
    - (hasClosingQuote ? 100 : 0)
    - (hasTrailingSeparator ? 10 : 0)
    + (Number(entry.updatedAt) || 0) / 1e13;
}

function mergeEquivalentEntries(preferred = {}, duplicate = {}) {
  const aliases = Array.from(new Set([
    ...(Array.isArray(preferred.aliases) ? preferred.aliases : []),
    ...(Array.isArray(duplicate.aliases) ? duplicate.aliases : [])
  ].filter(Boolean)));
  const teacherExamples = Array.from(new Set([
    ...(Array.isArray(preferred.teacherExamples) ? preferred.teacherExamples : []),
    ...(Array.isArray(duplicate.teacherExamples) ? duplicate.teacherExamples : [])
  ].filter(Boolean))).slice(0, 4);
  return {
    ...preferred,
    ...(aliases.length ? { aliases } : {}),
    ...(teacherExamples.length ? { teacherExamples } : {})
  };
}

function findMeaningDuplicatePlan(entries = [], options = {}) {
  const groups = new Map();
  entries.forEach((entry, index) => {
    if (!entry || !String(entry.meaning || "").trim()) return;
    const normalized = {
      entry,
      index,
      id: entryIdentity(entry, index),
      groupKey: getGroupKey(entry, options),
      meaningKey: getMeaningKey(entry, options),
      parts: meaningParts(entry.meaning, options)
    };
    if (!normalized.parts.length) return;
    if (!groups.has(normalized.groupKey)) groups.set(normalized.groupKey, []);
    groups.get(normalized.groupKey).push(normalized);
  });

  const removedById = new Map();
  const survivorsById = new Map();

  groups.forEach((group) => {
    const byMeaning = new Map();
    group.forEach((item) => {
      if (!byMeaning.has(item.meaningKey)) byMeaning.set(item.meaningKey, []);
      byMeaning.get(item.meaningKey).push(item);
    });

    byMeaning.forEach((sameMeaning) => {
      if (sameMeaning.length < 2) return;
      const survivor = sameMeaning.slice().sort((left, right) => (
        entryRank(right.entry) - entryRank(left.entry)
        || right.index - left.index
      ))[0];
      let merged = survivor.entry;
      sameMeaning.forEach((item) => {
        if (item === survivor) return;
        merged = mergeEquivalentEntries(merged, item.entry);
        removedById.set(item.id, {
          entry: item.entry,
          id: item.id,
          kept: survivor.entry,
          reason: "exact-meaning"
        });
      });
      survivor.entry = merged;
      survivorsById.set(survivor.id, survivor.entry);
    });

    const active = group.filter((item) => !removedById.has(item.id));
    active.forEach((item) => {
      const supersets = active.filter((candidate) => (
        candidate !== item
        && candidate.parts.length > item.parts.length
        && item.parts.every((part) => candidate.parts.includes(part))
      ));
      if (!supersets.length) return;
      const kept = supersets.slice().sort((left, right) => (
        right.parts.length - left.parts.length
        || entryRank(right.entry) - entryRank(left.entry)
        || right.index - left.index
      ))[0];
      removedById.set(item.id, {
        entry: item.entry,
        id: item.id,
        kept: kept.entry,
        reason: "meaning-subset"
      });
    });
  });

  const removedIds = new Set(removedById.keys());
  const outputEntries = entries
    .map((entry, index) => {
      const id = entryIdentity(entry, index);
      if (removedIds.has(id)) return null;
      const survivor = survivorsById.get(id);
      return survivor || entry;
    })
    .filter(Boolean);

  return {
    entries: outputEntries,
    removed: Array.from(removedById.values())
  };
}

function collapseMeaningSubsetDuplicates(entries = [], options = {}) {
  return findMeaningDuplicatePlan(entries, options);
}

module.exports = {
  collapseMeaningSubsetDuplicates,
  findMeaningDuplicatePlan,
  getGroupKey,
  meaningParts,
  normalizeMeaning,
  normalizePos,
  normalizeWord
};
