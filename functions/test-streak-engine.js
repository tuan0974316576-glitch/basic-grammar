const assert = require("assert");
const { hongKongDateKey, nextStudyStreak } = require("./streak-engine");

assert.strictEqual(hongKongDateKey(new Date("2026-09-18T15:59:00Z")), "2026-09-18");
assert.strictEqual(hongKongDateKey(new Date("2026-09-18T16:00:00Z")), "2026-09-19");

const first = nextStudyStreak({}, "2026-09-18");
assert.strictEqual(first.streak.days, 1);
assert.strictEqual(first.streak.totalActiveDays, 1);

const consecutive = nextStudyStreak(first.streak, "2026-09-19");
assert.strictEqual(consecutive.streak.days, 2);

const earnedFreeze = nextStudyStreak(consecutive.streak, "2026-09-20");
assert.strictEqual(earnedFreeze.streak.days, 3);
assert.strictEqual(earnedFreeze.streak.freezeCount, 1);

const protectedStreak = nextStudyStreak(earnedFreeze.streak, "2026-09-22");
assert.strictEqual(protectedStreak.streak.days, 4);
assert.strictEqual(protectedStreak.streak.freezeCount, 0);
assert.strictEqual(protectedStreak.freezeUsed, true);
assert.deepStrictEqual(protectedStreak.streak.freezeUsedDateKeys, ["2026-09-21"]);

const brokenStreak = nextStudyStreak({
  ...protectedStreak.streak,
  freezeCount: 1,
}, "2026-09-25");
assert.strictEqual(brokenStreak.streak.days, 1);
assert.strictEqual(brokenStreak.streak.freezeCount, 0);
assert.strictEqual(brokenStreak.streak.bestDays, 4);

console.log("A1 streak engine checks passed.");
