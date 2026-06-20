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

const compactTeacherJson = apply.formatTeacherUpdatesJson({
  meta: { lesson: "Test" },
  entries: teacherAddition.additions
});
assert.ok(compactTeacherJson.includes("    { \"word\": \"almond\", \"meaning\": \"杏仁\", \"pos\": \"noun\", \"type\": \"word\", \"replaceType\": true }"));

const existingBank = {
  meta: {
    generatedAt: "2026-01-01T00:00:00.000Z",
    sourceFiles: [{ name: "old.xlsx" }],
    updateFiles: [{ name: "old_updates.json", addedEntryCount: 1 }],
    entryCount: 4,
    uniqueWordCount: 3
  },
  entries: [
    {
      id: "almond-noisy-entry",
      word: "almond",
      display: "almond",
      meaning: "幼 / 幼仔",
      pos: "noun",
      type: "word",
      needsReview: true,
      sourceCount: 9
    },
    {
      id: "almond-phrase-entry",
      word: "almond",
      display: "almond",
      meaning: "杏仁味",
      pos: "",
      type: "phrase",
      needsReview: false,
      sourceCount: 2
    },
    {
      id: "almond-adjective-entry",
      word: "almond",
      display: "almond",
      meaning: "杏仁色的",
      pos: "adjective",
      type: "word",
      needsReview: false,
      sourceCount: 3
    },
    {
      id: "bacon-entry",
      word: "bacon",
      display: "bacon",
      meaning: "煙肉",
      pos: "noun",
      type: "word",
      needsReview: false,
      sourceCount: 5
    }
  ]
};
const bankMerge = apply.mergeTeacherBank(existingBank, teacherAddition.additions, {
  teacherUpdates: teacherUpdatesPath
});
assert.strictEqual(bankMerge.mergeSummary.addedEntryCount, 1);
assert.strictEqual(bankMerge.mergeSummary.removedEntryCount, 1);
assert.strictEqual(bankMerge.mergeSummary.netEntryCount, 0);
assert.strictEqual(bankMerge.entries.length, 4);
assert.strictEqual(bankMerge.entries.some((entry) => entry.id === "almond-noisy-entry"), false);
assert.strictEqual(bankMerge.entries.find((entry) => entry.id === "almond-phrase-entry").sourceCount, 2);
assert.strictEqual(bankMerge.entries.find((entry) => entry.id === "almond-adjective-entry").sourceCount, 3);
assert.strictEqual(bankMerge.entries.find((entry) => entry.id === "bacon-entry").sourceCount, 5);
assert.deepStrictEqual(
  bankMerge.entries
    .filter((entry) => entry.word === "almond")
    .map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  [
    "phrase::杏仁味",
    "word:adjective:杏仁色的",
    "word:noun:杏仁"
  ]
);
assert.strictEqual(bankMerge.meta.sourceFiles[0].name, "old.xlsx");
assert.deepStrictEqual(bankMerge.meta.updateFiles.map((entry) => entry.name), [
  "old_updates.json",
  "teacher_vocab_manual_updates.json"
]);

const drySummary = apply.applyPlan({
  entries: split.accepted
}, {
  input: path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0000.json"),
  teacherUpdates: teacherUpdatesPath,
  curatedBank: curatedPath,
  teacherBank: teacherBankPath,
  write: false
});
assert.strictEqual(drySummary.teacherAddCount, 1);
assert.strictEqual(drySummary.curatedAddCount, 1);
assert.ok(!fs.existsSync(teacherBankPath));
assert.strictEqual(drySummary.applyReceipt, undefined);

assert.deepStrictEqual(apply.getReviewQueueForPlan(path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0000.json")), {
  planPrefix: "teacher_vocab_promote_plan_highvalue",
  reviewPrefix: "teacher_vocab_review_batch_highvalue",
  indexFile: "teacher_vocab_review_index.json"
});
assert.deepStrictEqual(apply.getReviewQueueForPlan(path.join(tmpDir, "teacher_live_vocab_promote_plan_0000.json")), {
  planPrefix: "teacher_live_vocab_promote_plan",
  reviewPrefix: "teacher_live_vocab_review_batch",
  indexFile: "teacher_live_vocab_review_index.json"
});
assert.strictEqual(
  apply.inferApplyReceiptPath(path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0000.json")),
  path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0000_applied.json")
);

const reviewBatchPath = path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0000.json");
fs.writeFileSync(reviewBatchPath, JSON.stringify({
  meta: {
    source: "teacher-audit",
    offset: 0,
    limit: 100,
    selectedCount: 2,
    totalCandidateCount: 2,
    nextOffset: 2
  },
  entries: [{ word: "almond" }, { word: "jump over the moon" }]
}, null, 2));
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0000.xlsx"), "placeholder");
const planPath = path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0000.json");
fs.writeFileSync(planPath, JSON.stringify({ entries: split.accepted }, null, 2));

const smallTeacherBankPath = path.join(tmpDir, "small_teacher_vocab_bank.js");
fs.writeFileSync(smallTeacherBankPath, `module.exports = ${JSON.stringify(existingBank, null, 2)};\n`);
const smallTeacherUpdatesPath = path.join(tmpDir, "small_teacher_vocab_manual_updates.json");
fs.writeFileSync(smallTeacherUpdatesPath, JSON.stringify({ meta: { lesson: "Small" }, entries: [] }, null, 2));
const smallCuratedPath = path.join(tmpDir, "small_vocab_sense_bank.js");
fs.writeFileSync(smallCuratedPath, `const ENTRIES = [
  ["game", "noun", "遊戲"]
  ];
`);
const smallWriteSummary = apply.applyPlan({ entries: [split.teacher[0]] }, {
  input: planPath,
  teacherUpdates: smallTeacherUpdatesPath,
  curatedBank: smallCuratedPath,
  teacherBank: smallTeacherBankPath,
  write: true,
  refresh: false
});
assert.strictEqual(smallWriteSummary.teacherAddCount, 1);
assert.strictEqual(smallWriteSummary.teacherBankAddCount, 1);
assert.strictEqual(smallWriteSummary.teacherBankRemovedCount, 1);
assert.strictEqual(smallWriteSummary.teacherBankNetCount, 0);
const smallTeacherUpdatesText = fs.readFileSync(smallTeacherUpdatesPath, "utf8");
assert.ok(smallTeacherUpdatesText.includes("    { \"word\": \"almond\", \"meaning\": \"杏仁\", \"pos\": \"noun\", \"type\": \"word\", \"replaceType\": true }"));
delete require.cache[require.resolve(smallTeacherBankPath)];
const smallBankAfterWrite = require(smallTeacherBankPath);
assert.strictEqual(smallBankAfterWrite.entries.some((entry) => entry.id === "almond-noisy-entry"), false);
assert.strictEqual(smallBankAfterWrite.entries.find((entry) => entry.id === "bacon-entry").sourceCount, 5);
assert.strictEqual(smallBankAfterWrite.entries.find((entry) => entry.id === "almond-adjective-entry").sourceCount, 3);
assert.ok(smallBankAfterWrite.entries.some((entry) => entry.word === "almond" && entry.meaning === "杏仁"));

const writeSummary = apply.applyPlan({ entries: split.accepted }, {
  input: planPath,
  teacherUpdates: teacherUpdatesPath,
  curatedBank: curatedPath,
  teacherBank: teacherBankPath,
  write: true
});
assert.strictEqual(writeSummary.write, true);
assert.ok(fs.existsSync(writeSummary.applyReceipt));
assert.ok(fs.existsSync(path.join(tmpDir, "teacher_vocab_review_index.json")));
assert.ok(fs.existsSync(path.join(tmpDir, "vocab_review_dashboard.json")));
assert.strictEqual(writeSummary.refreshed.status, "applied-or-ready-to-apply");

console.log("apply_vocab_promote_plan tests passed");
