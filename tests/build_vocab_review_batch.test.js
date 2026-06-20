const assert = require("assert");
const review = require("../scripts/build-vocab-review-batch.js");

const rows = review.buildReviewRows({
  tasks: [
    {
      id: "oxford-meaning:answer",
      source: "oxford",
      word: "answer",
      display: "answer",
      level: "A1",
      oxfordPos: ["noun", "verb"],
      posRaw: ["n., v."],
      type: "word",
      checklist: { source: "private Oxford CEFR checklist" }
    },
    {
      id: "oxford-meaning:look-up",
      source: "oxford",
      word: "look up",
      display: "look up",
      level: "A2",
      oxfordPos: ["verb"],
      posRaw: ["phr. v."],
      type: "phrase",
      checklist: { source: "private Oxford CEFR checklist" }
    }
  ],
  lookups: {
    teacher: (word) => (word === "answer" ? [
      { id: "teacher-answer-n", word, pos: "noun", meaning: "答案", source: "teacher-bank" }
    ] : []),
    curated: (word) => (word === "look up" ? [
      { id: "curated-look-up", word, type: "phrase", meaning: "查閱 / 查字典", source: "curated-sense-bank" }
    ] : []),
    ccSupplement: () => [],
    ecdict: (word) => (word === "answer" ? [
      { id: "ecdict-answer-n", word, pos: "noun", meaning: "答案", source: "ecdict-material" },
      { id: "ecdict-answer-v", word, pos: "verb", meaning: "回答", source: "ecdict-material" }
    ] : []),
    generatedSeed: () => [],
    ccCedictReverse: () => []
  }
});

assert.strictEqual(rows.length, 2);
assert.strictEqual(rows[0].word, "answer");
assert.deepStrictEqual(rows[0].oxford.posLabels, ["n.", "v."]);
assert.deepStrictEqual(rows[0].existing.teacher.map((entry) => entry.meaning), ["答案"]);
assert.deepStrictEqual(rows[0].drafts.ecdict.map((entry) => `${entry.pos}:${entry.meaning}`), ["noun:答案", "verb:回答"]);
assert.ok(rows[0].flags.includes("multi-pos"));
assert.ok(rows[0].flags.includes("already-has-local-entry"));
assert.strictEqual(rows[0].review.action, "edit-before-promote");

assert.strictEqual(rows[1].type, "phrase");
assert.ok(rows[1].flags.includes("phrase"));
assert.ok(rows[1].flags.includes("already-has-local-entry"));
assert.ok(rows[1].flags.includes("no-draft-meaning"));

const csv = review.buildCsv(rows);
assert.ok(csv.includes("reviewed_pos"));
assert.ok(csv.includes("audit_reasons"));
assert.ok(csv.includes("original_teacher_entry"));
assert.ok(csv.includes("reviewed_meaning"));
assert.ok(csv.includes("promote_to"));
assert.ok(csv.includes("replace_type"));
assert.ok(csv.includes("answer"));
assert.ok(csv.includes("n. 答案 | v. 回答"));

assert.strictEqual(review.normalizeMeaningGroupKey("幼獸"), "幼獸");
assert.strictEqual(review.stringifyEntries([
  { pos: "noun", meaning: "蘋果" },
  { type: "phrase", meaning: "查閱" }
]), "n. 蘋果 | ph. 查閱");

const parsed = review.parseArgs(["--source", "all", "--offset", "100", "--limit", "50", "--level", "A2", "--out", "private_exports/foo.json"]);
assert.strictEqual(parsed.source, "all");
assert.strictEqual(parsed.offset, 100);
assert.strictEqual(parsed.limit, 50);
assert.strictEqual(parsed.level, "A2");
assert.ok(parsed.csv.endsWith("foo.csv"));

const teacherAuditTasks = review.getReviewTasks({ source: "teacher-audit" });
assert.ok(teacherAuditTasks.length > 4000, "Teacher audit should include full suspicious candidate set, not only needsReview entries.");
assert.ok(teacherAuditTasks[0].audit?.reasons?.length);
assert.strictEqual(teacherAuditTasks[0].source, "teacher-audit");

const teacherAuditRows = review.buildReviewRows({
  tasks: teacherAuditTasks.slice(0, 1),
  lookups: {
    teacher: () => [],
    curated: () => [],
    ccSupplement: () => [],
    ecdict: () => [],
    generatedSeed: () => [],
    ccCedictReverse: () => []
  }
});
assert.ok(teacherAuditRows[0].flags.includes("teacher-audit"));
assert.ok(teacherAuditRows[0].flags.some((flag) => flag.startsWith("audit:")));
assert.ok(teacherAuditRows[0].review.notes.startsWith("Original:"));

assert.strictEqual(review.isLikelyTeacherAuditJunk({
  word: "d",
  display: "d",
  audit: { originalMeaning: "患上 (v)" }
}), true);
assert.strictEqual(review.isLikelyTeacherAuditJunk({
  word: "mental health",
  display: "mental health",
  audit: { originalMeaning: "名詞 plays a ... part / role in ........." }
}), false);
assert.strictEqual(review.inferAuditType("either...or", "word"), "pattern");
assert.strictEqual(review.inferAuditType("mental health", "phrase"), "phrase");

const highValueTeacherAuditTasks = review.getReviewTasks({ source: "teacher-audit", skipJunk: true });
assert.ok(highValueTeacherAuditTasks.length < teacherAuditTasks.length);
assert.ok(highValueTeacherAuditTasks.length > 3000);
assert.ok(!highValueTeacherAuditTasks.some((task) => /^[a-z]$/.test(task.word)));

console.log("build_vocab_review_batch tests passed");
