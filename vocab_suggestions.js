(function attachVocabSuggestions(root, factory) {
  const vocabText = root.VocabText
    || (typeof require === "function" ? require("./vocab_text.js") : null);
  const api = factory(vocabText);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.VocabSuggestions = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createVocabSuggestions(VocabText) {
  "use strict";

  const DEFAULT_LIMIT = 5;

  function canonicalizeWord(value) {
    if (VocabText?.canonicalizeHeadword) return VocabText.canonicalizeHeadword(value);
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function normalizeWord(value) {
    if (VocabText?.normalizeHeadword) return VocabText.normalizeHeadword(value);
    return canonicalizeWord(value).toLowerCase();
  }

  function normalizeMeaning(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function normalizeSuggestionKey(value) {
    return normalizeWord(value)
      .replace(/[‐‑‒–—―]/g, "-")
      .replace(/[^a-z0-9' -]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function compactSuggestionKey(value) {
    return normalizeSuggestionKey(value).replace(/[^a-z0-9]+/g, "");
  }

  function tokenizeSuggestionPhrase(value) {
    return normalizeSuggestionKey(value)
      .split(/[\s-]+/)
      .map((token) => token.trim())
      .filter(Boolean);
  }

  function boundedDamerauLevenshtein(leftValue, rightValue, maxDistance = 2) {
    const left = String(leftValue || "");
    const right = String(rightValue || "");
    const leftLength = left.length;
    const rightLength = right.length;
    if (Math.abs(leftLength - rightLength) > maxDistance) return maxDistance + 1;
    if (!leftLength) return rightLength;
    if (!rightLength) return leftLength;

    let previousPrevious = null;
    let previous = new Array(rightLength + 1);
    let current = new Array(rightLength + 1);
    for (let column = 0; column <= rightLength; column += 1) previous[column] = column;

    for (let row = 1; row <= leftLength; row += 1) {
      current[0] = row;
      let rowMin = current[0];
      for (let column = 1; column <= rightLength; column += 1) {
        const cost = left[row - 1] === right[column - 1] ? 0 : 1;
        let value = Math.min(
          previous[column] + 1,
          current[column - 1] + 1,
          previous[column - 1] + cost
        );
        if (
          previousPrevious
          && row > 1
          && column > 1
          && left[row - 1] === right[column - 2]
          && left[row - 2] === right[column - 1]
        ) {
          value = Math.min(value, previousPrevious[column - 2] + 1);
        }
        current[column] = value;
        rowMin = Math.min(rowMin, value);
      }
      if (rowMin > maxDistance) return maxDistance + 1;
      previousPrevious = previous;
      previous = current;
      current = new Array(rightLength + 1);
    }
    return previous[rightLength];
  }

  function countOrderedTokenHits(queryTokens, targetTokens) {
    let cursor = 0;
    let hits = 0;
    queryTokens.forEach((token) => {
      for (let index = cursor; index < targetTokens.length; index += 1) {
        if (targetTokens[index] !== token) continue;
        hits += 1;
        cursor = index + 1;
        return;
      }
    });
    return hits;
  }

  function scorePhraseSimilarity(queryKey, targetKey) {
    const queryTokens = tokenizeSuggestionPhrase(queryKey);
    const targetTokens = tokenizeSuggestionPhrase(targetKey);
    if (queryTokens.length < 2 && targetTokens.length < 2) return null;
    if (!queryTokens.length || !targetTokens.length) return null;

    const usedTargetIndexes = new Set();
    let matchWeight = 0;
    queryTokens.forEach((queryToken) => {
      let best = null;
      targetTokens.forEach((targetToken, targetIndex) => {
        if (usedTargetIndexes.has(targetIndex)) return;
        let weight = 0;
        if (queryToken === targetToken) {
          weight = 1;
        } else if (
          queryToken.length >= 3
          && targetToken.length >= 3
          && (targetToken.startsWith(queryToken) || queryToken.startsWith(targetToken))
        ) {
          weight = 0.78;
        } else if (Math.abs(queryToken.length - targetToken.length) <= 1) {
          const tokenDistance = boundedDamerauLevenshtein(queryToken, targetToken, 1);
          if (tokenDistance <= 1) {
            weight = Math.min(queryToken.length, targetToken.length) <= 2 ? 0.54 : 0.68;
          }
        }
        if (!weight || (best && best.weight >= weight)) return;
        best = { targetIndex, weight };
      });
      if (!best) return;
      usedTargetIndexes.add(best.targetIndex);
      matchWeight += best.weight;
    });

    const coverage = matchWeight / Math.max(queryTokens.length, targetTokens.length);
    if (coverage < 0.52) return null;
    const orderedHits = countOrderedTokenHits(queryTokens, targetTokens);
    const orderScore = orderedHits / Math.max(queryTokens.length, targetTokens.length);
    const lengthPenalty = Math.abs(queryTokens.length - targetTokens.length) * 2.4;
    const score = Math.round(54 + (coverage * 30) + (orderScore * 8) - lengthPenalty);
    return Math.max(0, Math.min(84, score));
  }

  function getSourceRank(entry = {}) {
    const source = String(entry.storageSource || entry.source || "");
    if (source === "teacher-live") return 4;
    if (source === "teacher") return 3;
    if (source === "cc-cedict-supplement") return 1;
    return 2;
  }

  function normalizeAliases(entry = {}) {
    const rawAliases = Array.isArray(entry.aliases)
      ? entry.aliases
      : String(entry.alias || "").split(/[,，;；|]/);
    return Array.from(new Set(rawAliases.map(normalizeWord).filter(Boolean)));
  }

  function addSearchKeys(group, values = []) {
    values.forEach((value) => {
      const key = normalizeSuggestionKey(value);
      if (key) group.keys.add(key);
    });
  }

  function addEntry(byWord, rawEntry = {}) {
    if (!rawEntry || rawEntry.disabled || rawEntry.hidden || rawEntry.needsReview) return;
    const word = normalizeWord(rawEntry.word || rawEntry.english || rawEntry.display);
    const meaning = normalizeMeaning(rawEntry.meaning);
    if (!word || !meaning) return;

    const normalized = {
      ...rawEntry,
      word,
      display: canonicalizeWord(rawEntry.display || rawEntry.word || rawEntry.english || word) || word,
      meaning,
      aliases: normalizeAliases(rawEntry)
    };
    const sourceRank = getSourceRank(normalized);
    const group = byWord.get(word) || {
      word,
      display: normalized.display,
      keys: new Set(),
      sourceRank: 0,
      primaryEntry: normalized
    };
    if (sourceRank > group.sourceRank) {
      group.display = normalized.display;
      group.primaryEntry = normalized;
    }
    group.sourceRank = Math.max(group.sourceRank, sourceRank);
    addSearchKeys(group, [word, normalized.display, ...normalized.aliases]);
    byWord.set(word, group);
  }

  function addBucketEntry(bucket, key, group) {
    if (!key) return;
    if (!bucket.has(key)) bucket.set(key, []);
    bucket.get(key).push(group);
  }

  function buildIndex(entries = []) {
    const byWord = new Map();
    entries.forEach((entry) => addEntry(byWord, entry));
    const groups = Array.from(byWord.values()).map((group) => ({
      ...group,
      keys: Array.from(group.keys)
    })).filter((group) => group.keys.length);
    const firstCharBuckets = new Map();
    const prefixBuckets = new Map();
    const suffixBuckets = new Map();
    const tokenBuckets = new Map();
    const substringBuckets = new Map();

    groups.forEach((group) => {
      group.keys.forEach((key) => {
        if (key[0]) addBucketEntry(firstCharBuckets, key[0], group);
        tokenizeSuggestionPhrase(key).forEach((token) => {
          if (token.length >= 2) addBucketEntry(tokenBuckets, token, group);
        });
        const compactKey = compactSuggestionKey(key);
        if (compactKey.length >= 2) {
          addBucketEntry(prefixBuckets, compactKey.slice(0, 2), group);
          addBucketEntry(suffixBuckets, compactKey.slice(-2), group);
        }
        if (compactKey.length >= 3) {
          addBucketEntry(substringBuckets, compactKey.slice(0, 3), group);
          addBucketEntry(substringBuckets, compactKey.slice(-3), group);
        }
      });
    });

    return {
      groups,
      firstCharBuckets,
      prefixBuckets,
      suffixBuckets,
      tokenBuckets,
      substringBuckets
    };
  }

  function scoreGroup(queryKey, group) {
    const queryCompact = compactSuggestionKey(queryKey);
    if (!queryCompact) return null;
    let best = null;

    group.keys.forEach((targetKey) => {
      if (!targetKey) return;
      const targetCompact = compactSuggestionKey(targetKey);
      let candidate = null;

      if (targetKey === queryKey) {
        candidate = { score: 100, reason: "EXACT" };
      } else if (targetKey.startsWith(queryKey)) {
        const gap = Math.max(0, targetKey.length - queryKey.length);
        candidate = { score: Math.max(78, 95 - Math.min(gap, 16)), reason: "PREFIX" };
      } else if (queryKey.length >= 3 && targetKey.includes(queryKey)) {
        const indexPenalty = Math.min(targetKey.indexOf(queryKey), 18) * 0.7;
        candidate = { score: Math.round(73 - indexPenalty), reason: "CONTAINS" };
      }

      if (
        queryCompact.length >= 4
        && targetCompact.length >= 4
        && Math.abs(queryCompact.length - targetCompact.length) <= 2
      ) {
        const maxDistance = queryCompact.length >= 6 ? 2 : 1;
        const distance = boundedDamerauLevenshtein(queryCompact, targetCompact, maxDistance);
        if (distance <= maxDistance) {
          const typoScore = Math.round(90 - (distance * 8) - Math.abs(queryCompact.length - targetCompact.length));
          if (!candidate || typoScore > candidate.score) candidate = { score: typoScore, reason: "TYPO" };
        }
      }

      const phraseScore = scorePhraseSimilarity(queryKey, targetKey);
      if (phraseScore && (!candidate || phraseScore > candidate.score)) {
        candidate = { score: phraseScore, reason: "PHRASE" };
      }
      if (!candidate || candidate.score < 55) return;
      const adjustedScore = candidate.score + (Math.min(group.sourceRank || 0, 4) / 100);
      if (!best || adjustedScore > best.score) best = { ...candidate, score: adjustedScore };
    });

    return best;
  }

  function suggest(index, word, options = {}) {
    const queryKey = normalizeSuggestionKey(word);
    if (!index || queryKey.length < 2) return [];
    const exactMatchWords = new Set((options.matches || []).map((entry) => (
      normalizeWord(entry.word || entry.display)
    )).filter(Boolean));
    const candidates = new Map();
    const addCandidate = (group) => {
      if (group?.word && !candidates.has(group.word)) candidates.set(group.word, group);
    };

    const compactKey = compactSuggestionKey(queryKey);
    if (compactKey.length >= 2) {
      (index.prefixBuckets?.get(compactKey.slice(0, 2)) || []).forEach(addCandidate);
      (index.suffixBuckets?.get(compactKey.slice(-2)) || []).forEach(addCandidate);
    }
    if (compactKey.length >= 3) {
      const probes = new Set([
        compactKey.slice(0, 3),
        compactKey.slice(Math.max(0, compactKey.length - 3))
      ].filter((probe) => probe.length >= 3));
      probes.forEach((probe) => (index.substringBuckets.get(probe) || []).forEach(addCandidate));
    }
    const queryTokens = tokenizeSuggestionPhrase(queryKey);
    if (queryTokens.length >= 2) {
      queryTokens.forEach((token) => (index.tokenBuckets.get(token) || []).forEach(addCandidate));
    }
    if (compactKey.length === 2 || !candidates.size) {
      (index.firstCharBuckets.get(queryKey[0]) || []).forEach(addCandidate);
    }

    const ranked = [];
    candidates.forEach((group) => {
      const groupWord = normalizeWord(group.word || group.display);
      const displayWord = normalizeWord(group.display || group.word);
      if (groupWord === queryKey || displayWord === queryKey || exactMatchWords.has(groupWord)) return;
      const score = scoreGroup(queryKey, group);
      if (!score) return;
      ranked.push({
        word: group.word,
        display: group.display || group.word,
        primaryEntry: group.primaryEntry,
        reason: score.reason,
        score: score.score,
        sourceRank: group.sourceRank || 0
      });
    });

    return ranked.sort((left, right) => (
      right.score - left.score
      || right.sourceRank - left.sourceRank
      || String(left.word).localeCompare(String(right.word))
    )).slice(0, Number(options.limit) || DEFAULT_LIMIT);
  }

  return {
    boundedDamerauLevenshtein,
    buildIndex,
    compactSuggestionKey,
    normalizeSuggestionKey,
    scorePhraseSimilarity,
    suggest,
    tokenizeSuggestionPhrase
  };
});
