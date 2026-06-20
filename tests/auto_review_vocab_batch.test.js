const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const autoReview = require("../scripts/auto-review-vocab-batch.js");
const processor = require("../scripts/process-vocab-review.js");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vocab-auto-review-"));
const input = path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0000.json");
const out = path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0000_auto_review.csv");

function teacherAuditRow(word, meaning, extras = {}) {
  return {
    id: `teacher-audit:${word}`,
    word,
    display: extras.display || word,
    level: "",
    type: extras.type || (word.includes(" ") ? "phrase" : "word"),
    checklistSource: { source: "teacher bank audit" },
    audit: {
      id: `${word}-old`,
      reasons: extras.reasons || ["needsReview", "missing-pos"],
      originalPos: extras.originalPos || "",
      originalMeaning: meaning
    },
    oxford: { pos: [], posLabels: [] },
    existing: { teacher: [], curated: [], ccSupplement: [] },
    drafts: {
      ecdict: extras.ecdict || [],
      generatedSeed: [],
      ccCedictReverse: []
    },
    flags: ["teacher-audit", ...(extras.flags || [])],
    review: { approvedEntries: [] }
  };
}

const rows = [
  teacherAuditRow("journalist", "記者"),
  teacherAuditRow("look for", "尋找"),
  teacherAuditRow("fluent", "流利", { originalPos: "adjective", display: "Fluent" }),
  teacherAuditRow("diabetes", "糖尿病", {
    ecdict: [{ word: "diabetes", pos: "noun", meaning: "糖尿病", source: "ecdict-material" }]
  }),
  teacherAuditRow("feline", "貓 cat = kitten", {
    reasons: ["needsReview", "missing-pos", "mixed-english-in-meaning", "noisy-meaning-text"]
  }),
  teacherAuditRow("either a or b", "一係A 一係B", {
    reasons: ["needsReview", "missing-pos", "duplicate-near-meaning"]
  })
];

fs.writeFileSync(input, JSON.stringify({
  meta: {
    source: "teacher-audit",
    offset: 0,
    limit: 100,
    selectedCount: rows.length,
    totalCandidateCount: rows.length,
    nextOffset: rows.length,
    privateOnly: true
  },
  entries: rows
}, null, 2));

const reviewed = autoReview.autoReviewRows(rows, { minConfidence: 84 });
assert.strictEqual(reviewed.approved.length, 4);
assert.deepStrictEqual(
  reviewed.decisions.map((decision) => decision.approved ? `${decision.pos}:${decision.meaning}` : decision.reason),
  [
    "noun:記者",
    "verb:尋找",
    "adjective:流利的",
    "noun:糖尿病",
    "risky-audit-reason",
    "risky-audit-reason"
  ]
);

const summary = autoReview.writeAutoReviewedCsv(input, {
  out,
  minConfidence: 84
});
assert.strictEqual(summary.approvedCount, 4);
assert.strictEqual(summary.untouchedCount, 2);
assert.ok(fs.existsSync(out));

const csv = fs.readFileSync(out, "utf8");
assert.ok(csv.includes("journalist"));
assert.ok(csv.includes("fluent,Fluent"));
assert.ok(csv.includes("n.,記者,teacher"));
assert.ok(csv.includes("v.,尋找,teacher"));
assert.ok(csv.includes("adj.,流利的,teacher"));
assert.ok(csv.includes("matching-draft-pos"));
assert.ok(csv.includes("untouched: risky-audit-reason"));

processor.processReview({
  input: out,
  out: path.join(tmpDir, "auto_plan.json"),
  preflightOut: path.join(tmpDir, "auto_preflight.json"),
  refresh: false
}).then((result) => {
  assert.strictEqual(result.summary.pass, true);
  assert.strictEqual(result.summary.reviewedEntryCount, 4);
  assert.strictEqual(result.summary.findingCount, 0);
  assert.deepStrictEqual(
    result.plan.entries.map((entry) => `${entry.promoteTo}:${entry.word}:${entry.pos}:${entry.meaning}`),
    [
      "teacher:journalist:noun:記者",
      "teacher:look for:verb:尋找",
      "teacher:fluent:adjective:流利的",
      "teacher:diabetes:noun:糖尿病"
    ]
  );
  console.log("auto_review_vocab_batch tests passed");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
