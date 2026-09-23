const assert = require("assert");
const {
  DAILY_TEMPLATES,
  SOCIAL_TEMPLATES,
  dueReminderAt,
  pickFreshTemplate,
  reminderSlots,
} = require("./notification-engine");

assert.deepStrictEqual(reminderSlots(18 * 60 + 30), {
  daily: [18 * 60 + 30, 20 * 60, 21 * 60 + 30],
  danger: 22 * 60 + 30,
});
assert.strictEqual(reminderSlots(18 * 60 + 30).daily.length, 3);
assert.deepStrictEqual(reminderSlots(8 * 60), {
  daily: [8 * 60, 9 * 60 + 30, 11 * 60],
  danger: 20 * 60 + 30,
});
assert.deepStrictEqual(dueReminderAt(18 * 60 + 30, 18 * 60 + 30), {
  kind: "daily",
  slotIndex: 0,
});
assert.deepStrictEqual(dueReminderAt(20 * 60 + 8, 18 * 60 + 30), {
  kind: "daily",
  slotIndex: 1,
});
assert.deepStrictEqual(dueReminderAt(22 * 60 + 30, 18 * 60 + 30), {
  kind: "streakRisk",
  slotIndex: 0,
});
assert.strictEqual(dueReminderAt(17 * 60, 18 * 60 + 30), null);
assert.ok(DAILY_TEMPLATES.length >= 21);
assert.ok(SOCIAL_TEMPLATES.length >= 7);

const dateKey = "2026-09-19";
const first = pickFreshTemplate(DAILY_TEMPLATES, {}, dateKey, "student-1");
const history = { [first.id]: dateKey };
const second = pickFreshTemplate(DAILY_TEMPLATES, history, dateKey, "student-1");
assert.notStrictEqual(second.id, first.id);

const recentHistory = Object.fromEntries(
  DAILY_TEMPLATES.slice(0, 21).map((template) => [template.id, "2026-09-14"]),
);
const freshAfterTwentyOneSends = pickFreshTemplate(
  DAILY_TEMPLATES,
  recentHistory,
  "2026-09-19",
  "student-1",
);
assert.ok(!recentHistory[freshAfterTwentyOneSends.id]);

console.log("A1 notification engine checks passed.");
