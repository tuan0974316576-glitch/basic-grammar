const assert = require("assert");
const scheduler = require("../vocab_scheduler.js");

const now = Date.UTC(2026, 5, 16, 8, 0, 0);
const items = [
  { id: "apple", word: "apple", meaning: "蘋果", createdAt: now - scheduler.DAY_MS },
  { id: "book", word: "book", meaning: "書", createdAt: now - scheduler.DAY_MS },
  { id: "school", word: "school", meaning: "學校", createdAt: now - scheduler.DAY_MS }
];

const oldStrongProgress = scheduler.updateProgressAfterAnswer(
  scheduler.updateProgressAfterAnswer(
    scheduler.updateProgressAfterAnswer(scheduler.getInitialProgress(now - (5 * scheduler.DAY_MS)), true, { now: now - (5 * scheduler.DAY_MS) }),
    true,
    { now: now - (4 * scheduler.DAY_MS) }
  ),
  true,
  { now: now - scheduler.DAY_MS }
);

const progressById = {
  apple: oldStrongProgress,
  book: scheduler.updateProgressAfterAnswer(scheduler.getInitialProgress(now - scheduler.DAY_MS), false, { now: now - scheduler.DAY_MS })
};

const picked = scheduler.pickReviewItems(items, progressById, { limit: 2, now });
assert.strictEqual(picked.length, 2);
assert.strictEqual(picked[0].id, "school");
assert.strictEqual(picked.some((item) => item.id === "book"), true);

const brandNew = scheduler.getItemReviewState(items[2], {}, now);
assert.strictEqual(brandNew.due, true);
assert.strictEqual(brandNew.recallProbability, 0);

const afterCorrect = scheduler.updateProgressAfterAnswer(scheduler.getInitialProgress(now), true, { now });
assert.strictEqual(afterCorrect.totalSeen, 1);
assert.strictEqual(afterCorrect.totalCorrect, 1);
assert.ok(afterCorrect.mastery > 0);
assert.ok(afterCorrect.nextDueAt > now);

const afterWrong = scheduler.updateProgressAfterAnswer(afterCorrect, false, { now: now + scheduler.DAY_MS });
assert.strictEqual(afterWrong.totalIncorrect, 1);
assert.strictEqual(afterWrong.streakCorrect, 0);
assert.ok(afterWrong.nextDueAt < now + scheduler.DAY_MS + (2 * 60 * 60 * 1000));

const probability = scheduler.getRecallProbability(afterCorrect, afterCorrect.lastSeenAt + Math.round(afterCorrect.halfLifeDays * scheduler.DAY_MS));
assert.ok(probability > 0.49 && probability < 0.51);

console.log("vocab_scheduler tests passed");
