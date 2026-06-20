const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const indexer = require("../scripts/build-vocab-review-index.js");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vocab-review-index-"));

function writeBatch(id, meta = {}) {
  const file = path.join(tmpDir, `teacher_vocab_review_batch_highvalue_${id}.json`);
  fs.writeFileSync(file, JSON.stringify({
    meta: {
      source: "teacher-audit",
      offset: Number(id),
      limit: 100,
      selectedCount: 100,
      totalCandidateCount: 3971,
      nextOffset: Number(id) + 100,
      ...meta
    },
    entries: [
      { word: "alpha", review: { approvedEntries: [] } },
      { word: "beta", review: { approvedEntries: [{ meaning: "測試" }] } }
    ]
  }, null, 2));
  return file;
}

writeBatch("0000");
writeBatch("0100");
writeBatch("0200");
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0000.xlsx"), "placeholder");
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0100.csv"), "placeholder");
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0100.json"), "{}");
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0100_applied.json"), JSON.stringify({
  summary: { write: true }
}, null, 2));
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0100_live_synced.json"), JSON.stringify({
  summary: { write: true, uploaded: 2 }
}, null, 2));
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0000_preflight.json"), JSON.stringify({
  summary: {
    pass: false,
    errorCount: 2,
    warningCount: 1
  }
}, null, 2));
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0200.xlsx"), "placeholder");
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0200_auto_review.csv"), "placeholder");
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0200_auto_review_preflight.json"), JSON.stringify({
  summary: {
    pass: true,
    errorCount: 0,
    warningCount: 0
  }
}, null, 2));
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0200_auto_review.json"), "{}");
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0200_auto_review_applied.json"), JSON.stringify({
  summary: { write: true }
}, null, 2));
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0200_codex_review.csv"), "placeholder");
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0200_codex_review_preflight.json"), JSON.stringify({
  summary: {
    pass: true,
    errorCount: 0,
    warningCount: 0
  }
}, null, 2));
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0200_codex_review.json"), "{}");
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0200_codex_review_applied.json"), JSON.stringify({
  summary: { write: true }
}, null, 2));

const index = indexer.buildIndex({
  dir: tmpDir,
  prefix: "teacher_vocab_review_batch_highvalue"
});

assert.strictEqual(index.meta.batchCount, 3);
assert.strictEqual(index.meta.totalCandidateCount, 3971);
assert.strictEqual(index.meta.nextOffset, 300);
assert.strictEqual(index.meta.nextBatchId, "0300");
assert.strictEqual(index.meta.readyForReviewBatchCount, 2);
assert.strictEqual(index.meta.promotePlanBatchCount, 2);
assert.strictEqual(index.meta.appliedBatchCount, 2);
assert.strictEqual(index.meta.liveSyncedBatchCount, 1);
assert.strictEqual(index.meta.liveSyncedEntryCount, 2);
assert.strictEqual(index.meta.preflightFailedBatchCount, 1);
assert.strictEqual(index.batches[0].status, "preflight-failed");
assert.strictEqual(index.batches[0].preflightErrorCount, 2);
assert.strictEqual(index.batches[1].status, "live-synced");
assert.strictEqual(index.batches[1].applyPlanExists, true);
assert.strictEqual(index.batches[1].liveSyncExists, true);
assert.strictEqual(index.batches[1].liveSyncEntryCount, 2);
assert.strictEqual(index.batches[2].status, "applied-or-ready-to-apply");
assert.strictEqual(index.batches[2].autoReviewCsvExists, true);
assert.strictEqual(index.batches[2].codexReviewCsvExists, true);
assert.strictEqual(index.batches[2].preflightPass, true);
assert.ok(index.batches[2].promotePlan.endsWith("teacher_vocab_promote_plan_highvalue_0200_codex_review.json"));
assert.ok(index.batches[2].applyReceipt.endsWith("teacher_vocab_promote_plan_highvalue_0200_codex_review_applied.json"));
assert.strictEqual(index.batches[0].reviewedEntryCount, 1);

const csv = indexer.buildCsv(index);
assert.ok(csv.includes("teacher_vocab_review_batch_highvalue_0000.xlsx"));
assert.ok(csv.includes("preflight-failed"));
assert.ok(csv.includes("teacher_vocab_review_batch_highvalue_0000_preflight.json"));
assert.ok(csv.includes("teacher_vocab_promote_plan_highvalue_0100_applied.json"));
assert.ok(csv.includes("teacher_vocab_promote_plan_highvalue_0100_live_synced.json"));
assert.ok(csv.includes("teacher_vocab_review_batch_highvalue_0200_auto_review.csv"));
assert.ok(csv.includes("teacher_vocab_review_batch_highvalue_0200_codex_review.csv"));
assert.ok(csv.includes("teacher_vocab_promote_plan_highvalue_0200_codex_review_applied.json"));

console.log("build_vocab_review_index tests passed");
