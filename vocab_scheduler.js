(function attachVocabScheduler(root, factory) {
  const scheduler = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = scheduler;
  }
  root.VocabScheduler = scheduler;
})(typeof globalThis !== "undefined" ? globalThis : window, function createVocabScheduler() {
  "use strict";

  const DAY_MS = 24 * 60 * 60 * 1000;
  const DEFAULT_STAGE_SIZE = 10;
  const TARGET_RECALL = 0.6;
  const MIN_HALF_LIFE_DAYS = 0.08;
  const MAX_HALF_LIFE_DAYS = 180;
  const DEFAULT_HALF_LIFE_DAYS = 0.5;
  const HLR_WEIGHTS = {
    bias: -1,
    totalSeen: 0.18,
    totalCorrect: 0.28,
    totalIncorrect: -0.42,
    streakCorrect: 0.2,
    mastery: 1.15
  };

  function clamp(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.max(min, Math.min(max, number));
  }

  function safeInteger(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback;
  }

  function normalizeProgress(progress = {}) {
    const totalCorrect = safeInteger(progress.totalCorrect ?? progress.correct);
    const totalIncorrect = safeInteger(progress.totalIncorrect ?? progress.wrong);
    const totalSeen = Math.max(safeInteger(progress.totalSeen), totalCorrect + totalIncorrect);
    const mastery = clamp(progress.mastery, 0, 1);

    return {
      lastSeenAt: Number(progress.lastSeenAt) || 0,
      totalSeen,
      totalCorrect,
      totalIncorrect,
      streakCorrect: safeInteger(progress.streakCorrect),
      mastery,
      nextDueAt: Number(progress.nextDueAt) || 0,
      lastRecallProb: clamp(progress.lastRecallProb ?? 0, 0, 1),
      halfLifeDays: clamp(progress.halfLifeDays || DEFAULT_HALF_LIFE_DAYS, MIN_HALF_LIFE_DAYS, MAX_HALF_LIFE_DAYS),
      updatedAt: Number(progress.updatedAt) || 0
    };
  }

  function estimateHalfLifeDays(progress = {}) {
    const normalized = normalizeProgress(progress);
    const dotProduct = HLR_WEIGHTS.bias
      + (HLR_WEIGHTS.totalSeen * Math.log1p(normalized.totalSeen))
      + (HLR_WEIGHTS.totalCorrect * Math.log1p(normalized.totalCorrect))
      + (HLR_WEIGHTS.totalIncorrect * Math.log1p(normalized.totalIncorrect))
      + (HLR_WEIGHTS.streakCorrect * Math.log1p(normalized.streakCorrect))
      + (HLR_WEIGHTS.mastery * normalized.mastery);

    return clamp(2 ** dotProduct, MIN_HALF_LIFE_DAYS, MAX_HALF_LIFE_DAYS);
  }

  function getElapsedDays(lastSeenAt, now = Date.now()) {
    const lastSeen = Number(lastSeenAt) || 0;
    if (!lastSeen) return Infinity;
    return Math.max(0, (Number(now) - lastSeen) / DAY_MS);
  }

  function getRecallProbability(progress = {}, now = Date.now()) {
    const normalized = normalizeProgress(progress);
    if (!normalized.lastSeenAt || !normalized.totalSeen) return 0;
    const halfLifeDays = normalized.halfLifeDays || estimateHalfLifeDays(normalized);
    const elapsedDays = getElapsedDays(normalized.lastSeenAt, now);
    return clamp(2 ** (-elapsedDays / halfLifeDays), 0, 1);
  }

  function getInitialProgress(now = Date.now()) {
    return {
      lastSeenAt: 0,
      totalSeen: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      streakCorrect: 0,
      mastery: 0,
      nextDueAt: Number(now) || Date.now(),
      lastRecallProb: 0,
      halfLifeDays: DEFAULT_HALF_LIFE_DAYS,
      updatedAt: Number(now) || Date.now()
    };
  }

  function getItemReviewState(item, progressById = {}, now = Date.now()) {
    const itemId = item?.id || "";
    const progress = normalizeProgress(progressById[itemId] || {});
    const recallProbability = getRecallProbability(progress, now);
    const nextDueAt = progress.nextDueAt || Number(item?.createdAt) || 0;
    const due = !progress.totalSeen || !nextDueAt || nextDueAt <= now || recallProbability <= TARGET_RECALL;

    return {
      item,
      progress,
      due,
      recallProbability,
      priority: getReviewPriority(progress, recallProbability, nextDueAt, now)
    };
  }

  function getReviewPriority(progress, recallProbability, nextDueAt, now = Date.now()) {
    const normalized = normalizeProgress(progress);
    const overdueDays = nextDueAt ? Math.max(0, (now - nextDueAt) / DAY_MS) : 3;
    const targetDistance = Math.abs(recallProbability - TARGET_RECALL);
    const weakBonus = normalized.totalIncorrect > normalized.totalCorrect ? 1.2 : 0;
    const newBonus = normalized.totalSeen ? 0 : 2;
    return (overdueDays * 1.3) + ((1 - targetDistance) * 1.1) + weakBonus + newBonus + (1 - normalized.mastery);
  }

  function pickReviewItems(items, progressById = {}, options = {}) {
    const itemList = Array.isArray(items) ? items : [];
    const now = Number(options.now) || Date.now();
    const limit = Math.max(1, safeInteger(options.limit, DEFAULT_STAGE_SIZE));
    const states = itemList.map((item) => getItemReviewState(item, progressById, now));

    return states
      .sort((left, right) => {
        if (left.due !== right.due) return left.due ? -1 : 1;
        if (right.priority !== left.priority) return right.priority - left.priority;
        return String(left.item?.word || "").localeCompare(String(right.item?.word || ""));
      })
      .slice(0, limit)
      .map((state) => state.item);
  }

  function getNextIntervalDays(progress, correct) {
    const normalized = normalizeProgress(progress);
    if (!correct) return 0.04;
    if (normalized.totalSeen <= 1) return 0.25;
    return clamp((normalized.halfLifeDays || DEFAULT_HALF_LIFE_DAYS) * 1.6, 0.25, 45);
  }

  function updateProgressAfterAnswer(progress = {}, correct, options = {}) {
    const now = Number(options.now) || Date.now();
    const previous = normalizeProgress(progress);
    const totalSeen = previous.totalSeen + 1;
    const totalCorrect = previous.totalCorrect + (correct ? 1 : 0);
    const totalIncorrect = previous.totalIncorrect + (correct ? 0 : 1);
    const streakCorrect = correct ? previous.streakCorrect + 1 : 0;
    const previousMastery = previous.mastery || 0;
    const mastery = clamp(previousMastery + (correct ? 0.11 : -0.18), 0, 1);
    const halfLifeDays = estimateHalfLifeDays({
      ...previous,
      totalSeen,
      totalCorrect,
      totalIncorrect,
      streakCorrect,
      mastery
    });
    const nextIntervalDays = getNextIntervalDays({ ...previous, halfLifeDays, totalSeen }, correct);
    const nextDueAt = now + Math.round(nextIntervalDays * DAY_MS);
    const nextProgress = {
      ...previous,
      lastSeenAt: now,
      totalSeen,
      totalCorrect,
      totalIncorrect,
      streakCorrect,
      mastery,
      nextDueAt,
      halfLifeDays,
      lastRecallProb: correct ? 1 : 0,
      updatedAt: now
    };

    return nextProgress;
  }

  return {
    DAY_MS,
    DEFAULT_STAGE_SIZE,
    TARGET_RECALL,
    estimateHalfLifeDays,
    getInitialProgress,
    getItemReviewState,
    getRecallProbability,
    normalizeProgress,
    pickReviewItems,
    updateProgressAfterAnswer
  };
});
