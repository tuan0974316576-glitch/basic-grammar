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
    aliases: "almnd",
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
  },
  {
    word: "almnd",
    type: "word",
    promoteTo: "teacher",
    suppress: true,
    replaceType: true,
    notes: "typo kept as alias on almond"
  }
]);

assert.strictEqual(split.accepted.length, 3);
assert.strictEqual(split.skipped.length, 1);
assert.strictEqual(split.teacher[0].pos, "noun");
assert.deepStrictEqual(split.teacher[0].aliases, ["almnd"]);
assert.strictEqual(split.teacher[1].suppress, true);
assert.strictEqual(split.curated[0].type, "phrase");

const mergedTeacher = apply.mergeTeacherUpdates({
  meta: { lesson: "Test" },
  entries: [
    { word: "almond", meaning: "杏仁", pos: "noun", type: "word" }
  ]
}, [split.teacher[0]]);
assert.strictEqual(mergedTeacher.additions.length, 0);
assert.strictEqual(mergedTeacher.aliasUpdates.length, 1);
assert.deepStrictEqual(mergedTeacher.data.entries[0].aliases, ["almnd"]);

const teacherAddition = apply.mergeTeacherUpdates({
  meta: { lesson: "Test" },
  entries: []
}, [split.teacher[0]]);
assert.deepStrictEqual(teacherAddition.additions, [
  {
    word: "almond",
    meaning: "杏仁",
    pos: "noun",
    type: "word",
    aliases: ["almnd"],
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

const suppressTeacherAddition = apply.mergeTeacherUpdates({
  meta: { lesson: "Test" },
  entries: []
}, [split.teacher[1]]);
assert.deepStrictEqual(suppressTeacherAddition.additions, [
  {
    word: "almnd",
    type: "word",
    replaceType: true,
    suppress: true,
    notes: "typo kept as alias on almond"
  }
]);

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
assert.ok(compactTeacherJson.includes("    { \"word\": \"almond\", \"meaning\": \"杏仁\", \"pos\": \"noun\", \"type\": \"word\", \"replaceType\": true, \"aliases\": [\"almnd\"] }"));

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
    },
    {
      id: "almnd-typo-entry",
      word: "almnd",
      display: "almnd",
      meaning: "杏仁",
      pos: "",
      type: "word",
      needsReview: true,
      sourceCount: 1
    },
    {
      id: "material-no-pos-entry",
      word: "material",
      display: "material",
      meaning: "材料(不可食)",
      pos: "",
      inferredPos: "adjective",
      type: "word",
      needsReview: false,
      sourceCount: 1
    }
  ]
};
const bankMerge = apply.mergeTeacherBank(existingBank, teacherAddition.additions, {
  teacherUpdates: teacherUpdatesPath
});
assert.strictEqual(bankMerge.mergeSummary.addedEntryCount, 1);
assert.strictEqual(bankMerge.mergeSummary.removedEntryCount, 1);
assert.strictEqual(bankMerge.mergeSummary.netEntryCount, 0);
assert.strictEqual(bankMerge.entries.length, 6);
assert.strictEqual(bankMerge.entries.some((entry) => entry.id === "almond-noisy-entry"), false);
assert.strictEqual(bankMerge.entries.find((entry) => entry.id === "almond-phrase-entry").sourceCount, 2);
assert.strictEqual(bankMerge.entries.find((entry) => entry.id === "almond-adjective-entry").sourceCount, 3);
assert.strictEqual(bankMerge.entries.find((entry) => entry.id === "bacon-entry").sourceCount, 5);
assert.strictEqual(bankMerge.entries.find((entry) => entry.id === "almnd-typo-entry").sourceCount, 1);
assert.strictEqual(bankMerge.entries.find((entry) => entry.id === "material-no-pos-entry").sourceCount, 1);
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
assert.deepStrictEqual(
  bankMerge.entries.find((entry) => entry.word === "almond" && entry.meaning === "杏仁").aliases,
  ["almnd"]
);
assert.strictEqual(bankMerge.meta.sourceFiles[0].name, "old.xlsx");
assert.deepStrictEqual(bankMerge.meta.updateFiles.map((entry) => entry.name), [
  "old_updates.json",
  "teacher_vocab_manual_updates.json"
]);

const suppressBankMerge = apply.mergeTeacherBank(existingBank, suppressTeacherAddition.additions, {
  teacherUpdates: teacherUpdatesPath
});
assert.strictEqual(suppressBankMerge.mergeSummary.addedEntryCount, 0);
assert.strictEqual(suppressBankMerge.mergeSummary.removedEntryCount, 1);
assert.strictEqual(suppressBankMerge.entries.some((entry) => entry.id === "almnd-typo-entry"), false);
assert.strictEqual(suppressBankMerge.entries.some((entry) => entry.word === "almnd"), false);

const materialReplacement = apply.splitEntries([
  {
    word: "material",
    pos: "n.",
    type: "word",
    meaning: "材料 / 原料",
    promoteTo: "teacher",
    replaceType: true
  }
]).teacher;
const materialBankMerge = apply.mergeTeacherBank(existingBank, materialReplacement, {
  teacherUpdates: teacherUpdatesPath
});
assert.strictEqual(materialBankMerge.entries.some((entry) => entry.id === "material-no-pos-entry"), false);
assert.deepStrictEqual(
  materialBankMerge.entries
    .filter((entry) => entry.word === "material")
    .map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["word:noun:材料 / 原料"]
);

const drySummary = apply.applyPlan({
  entries: split.accepted.filter((entry) => !entry.suppress)
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
assert.strictEqual(apply.normalizeReviewBatchId("0400_auto_review"), "0400");
assert.strictEqual(apply.normalizeReviewBatchId("0400_codex_review"), "0400");
assert.strictEqual(apply.normalizeReviewBatchId("0400"), "0400");

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
assert.ok(smallTeacherUpdatesText.includes("    { \"word\": \"almond\", \"meaning\": \"杏仁\", \"pos\": \"noun\", \"type\": \"word\", \"replaceType\": true, \"aliases\": [\"almnd\"] }"));
delete require.cache[require.resolve(smallTeacherBankPath)];
const smallBankAfterWrite = require(smallTeacherBankPath);
assert.strictEqual(smallBankAfterWrite.entries.some((entry) => entry.id === "almond-noisy-entry"), false);
assert.strictEqual(smallBankAfterWrite.entries.find((entry) => entry.id === "bacon-entry").sourceCount, 5);
assert.strictEqual(smallBankAfterWrite.entries.find((entry) => entry.id === "almond-adjective-entry").sourceCount, 3);
assert.ok(smallBankAfterWrite.entries.some((entry) => entry.word === "almond" && entry.meaning === "杏仁"));
assert.deepStrictEqual(
  smallBankAfterWrite.entries.find((entry) => entry.word === "almond" && entry.meaning === "杏仁").aliases,
  ["almnd"]
);

const smallSuppressBankPath = path.join(tmpDir, "small_suppress_teacher_vocab_bank.js");
fs.writeFileSync(smallSuppressBankPath, `module.exports = ${JSON.stringify(existingBank, null, 2)};\n`);
const smallSuppressUpdatesPath = path.join(tmpDir, "small_suppress_teacher_vocab_manual_updates.json");
fs.writeFileSync(smallSuppressUpdatesPath, JSON.stringify({ meta: { lesson: "Suppress" }, entries: [] }, null, 2));
const suppressWriteSummary = apply.applyPlan({ entries: [split.teacher[1]] }, {
  input: planPath,
  teacherUpdates: smallSuppressUpdatesPath,
  curatedBank: smallCuratedPath,
  teacherBank: smallSuppressBankPath,
  write: true,
  refresh: false
});
assert.strictEqual(suppressWriteSummary.teacherAddCount, 1);
assert.strictEqual(suppressWriteSummary.teacherBankAddCount, 0);
assert.strictEqual(suppressWriteSummary.teacherBankRemovedCount, 1);
delete require.cache[require.resolve(smallSuppressBankPath)];
const smallSuppressBankAfterWrite = require(smallSuppressBankPath);
assert.strictEqual(smallSuppressBankAfterWrite.entries.some((entry) => entry.word === "almnd"), false);
assert.ok(fs.readFileSync(smallSuppressUpdatesPath, "utf8").includes("\"suppress\": true"));

const writeSummary = apply.applyPlan({ entries: split.accepted.filter((entry) => !entry.suppress) }, {
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
assert.deepStrictEqual(writeSummary.battleshipSync, {
  skipped: true,
  reason: "custom vocab output paths"
});

console.log("apply_vocab_promote_plan tests passed");
