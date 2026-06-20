const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const apply = require("../scripts/apply-vocab-promote-plan.js");

const split = apply.splitEntries([
  {
    word: "almond",
    display: "almond",
    pos: "n.",
    type: "word",
    meaning: "杏仁",
    promoteTo: "teacher",
    replaceType: true
  },
  {
    word: "jump over the moon",
    pos: "v.",
    type: "phrase",
    meaning: "跳過月亮",
    promoteTo: "curated"
  },
  {
    word: "bad",
    meaning: "English meaning",
    type: "word",
    promoteTo: "curated"
  }
]);

assert.strictEqual(split.accepted.length, 2);
assert.strictEqual(split.skipped.length, 1);
assert.strictEqual(split.teacher[0].pos, "noun");
assert.strictEqual(split.curated[0].type, "phrase");

const mergedTeacher = apply.mergeTeacherUpdates({
  meta: { lesson: "Test" },
  entries: [
    { word: "almond", meaning: "杏仁", pos: "noun", type: "word" }
  ]
}, split.teacher);
assert.strictEqual(mergedTeacher.additions.length, 0);

const teacherAddition = apply.mergeTeacherUpdates({
  meta: { lesson: "Test" },
  entries: []
}, split.teacher);
assert.deepStrictEqual(teacherAddition.additions, [
  {
    word: "almond",
    meaning: "杏仁",
    pos: "noun",
    type: "word",
    replaceType: true
  }
]);

const normalTeacherAddition = apply.mergeTeacherUpdates({
  meta: { lesson: "Test" },
  entries: []
}, [apply.splitEntries([{
  word: "bacon",
  pos: "n.",
  type: "word",
  meaning: "煙肉",
  promoteTo: "teacher"
}]).teacher[0]]);
assert.strictEqual(normalTeacherAddition.additions[0].replaceType, false);

const rawCurated = apply.makeCuratedRawEntry(split.curated[0]);
assert.deepStrictEqual(rawCurated, [
  "jump over the moon",
  "verb",
  "跳過月亮",
  { type: "phrase" }
]);

const mergedCurated = apply.mergeCuratedBank(`(function () {
  const ENTRIES = [
    ["game", "noun", "遊戲"]
  ];
})();
`, split.curated);
assert.ok(mergedCurated.sourceText.includes("[\"jump over the moon\", \"verb\", \"跳過月亮\", {\"type\":\"phrase\"}]"));
assert.strictEqual(mergedCurated.additions.length, 1);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vocab-apply-test-"));
const teacherUpdatesPath = path.join(tmpDir, "teacher_vocab_manual_updates.json");
const curatedPath = path.join(tmpDir, "vocab_sense_bank.js");
const teacherBankPath = path.join(tmpDir, "teacher_vocab_bank.js");
fs.writeFileSync(teacherUpdatesPath, JSON.stringify({ meta: { lesson: "Test" }, entries: [] }, null, 2));
fs.writeFileSync(curatedPath, `const ENTRIES = [
  ["game", "noun", "遊戲"]
  ];
`);

const drySummary = apply.applyPlan({
  entries: split.accepted
}, {
  teacherUpdates: teacherUpdatesPath,
  curatedBank: curatedPath,
  teacherBank: teacherBankPath,
  write: false
});
assert.strictEqual(drySummary.teacherAddCount, 1);
assert.strictEqual(drySummary.curatedAddCount, 1);
assert.ok(!fs.existsSync(teacherBankPath));

console.log("apply_vocab_promote_plan tests passed");
