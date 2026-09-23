const LEARNING_ACTIVITY_KINDS = new Set(["grammar", "vocabulary", "workshop", "econ"]);
const STREAK_MILESTONES = new Set([3, 7, 14, 30, 50, 100]);

function hongKongDateKey(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function dateKeyDistance(fromKey, toKey) {
  const from = Date.parse(`${fromKey}T00:00:00Z`);
  const to = Date.parse(`${toKey}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
  return Math.round((to - from) / 86400000);
}

function nextStudyStreak(current, dateKey) {
  const lastDateKey = String(current.lastCompletedDateKey || "");
  if (lastDateKey === dateKey) {
    return { streak: current, extended: false, freezeUsed: false };
  }
  const distance = lastDateKey ? dateKeyDistance(lastDateKey, dateKey) : 0;
  if (distance < 0) {
    return { streak: current, extended: false, freezeUsed: false };
  }
  let days = 1;
  let freezeCount = Math.max(0, Math.min(2, Number(current.freezeCount) || 0));
  let freezesUsed = 0;
  const freezeUsedDateKeys = Array.isArray(current.freezeUsedDateKeys)
    ? current.freezeUsedDateKeys.slice(-31)
    : [];
  const activeDateKeys = Array.isArray(current.activeDateKeys)
    ? current.activeDateKeys.slice(-30)
    : [];
  if (distance === 1) {
    days = Math.max(0, Number(current.days) || 0) + 1;
  } else if (distance > 1) {
    const missedDays = distance - 1;
    freezesUsed = Math.min(missedDays, freezeCount);
    freezeCount -= freezesUsed;
    if (missedDays === freezesUsed) {
      days = Math.max(0, Number(current.days) || 0) + 1;
    }
    const last = Date.parse(`${lastDateKey}T00:00:00Z`);
    for (let offset = 1; offset <= freezesUsed; offset += 1) {
      freezeUsedDateKeys.push(hongKongDateKey(new Date(last + offset * 86400000)));
    }
  }
  const totalActiveDays = Math.max(0, Number(current.totalActiveDays) || 0) + 1;
  if (totalActiveDays === 3 || totalActiveDays % 7 === 0) {
    freezeCount = Math.min(2, freezeCount + 1);
  }
  return {
    streak: {
      days,
      bestDays: Math.max(days, Number(current.bestDays) || Number(current.days) || 0),
      freezeCount,
      totalActiveDays,
      lastDateKey: dateKey,
      lastCompletedDateKey: dateKey,
      activeDateKeys: [...new Set([...activeDateKeys, dateKey])].slice(-31),
      freezeUsedDateKeys: freezeUsedDateKeys.slice(-31),
    },
    extended: true,
    freezeUsed: freezesUsed > 0,
  };
}

module.exports = {
  LEARNING_ACTIVITY_KINDS,
  STREAK_MILESTONES,
  dateKeyDistance,
  hongKongDateKey,
  nextStudyStreak,
};
