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
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0000.xlsx"), "placeholder");
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0100.csv"), "placeholder");
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0100.json"), "{}");
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0100_applied.json"), JSON.stringify({
  summary: { write: true }
}, null, 2));
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0000_preflight.json"), JSON.stringify({
  summary: {
    pass: false,
    errorCount: 2,
    warningCount: 1
  }
}, null, 2));

const index = indexer.buildIndex({
  dir: tmpDir,
  prefix: "teacher_vocab_review_batch_highvalue"
});

assert.strictEqual(index.meta.batchCount, 2);
assert.strictEqual(index.meta.totalCandidateCount, 3971);
assert.strictEqual(index.meta.nextOffset, 200);
assert.strictEqual(index.meta.nextBatchId, "0200");
assert.strictEqual(index.meta.readyForReviewBatchCount, 1);
assert.strictEqual(index.meta.promotePlanBatchCount, 1);
assert.strictEqual(index.meta.appliedBatchCount, 1);
assert.strictEqual(index.meta.preflightFailedBatchCount, 1);
assert.strictEqual(index.batches[0].status, "preflight-failed");
assert.strictEqual(index.batches[0].preflightErrorCount, 2);
assert.strictEqual(index.batches[1].status, "applied-or-ready-to-apply");
assert.strictEqual(index.batches[1].applyPlanExists, true);
assert.strictEqual(index.batches[0].reviewedEntryCount, 1);

const csv = indexer.buildCsv(index);
assert.ok(csv.includes("teacher_vocab_review_batch_highvalue_0000.xlsx"));
assert.ok(csv.includes("preflight-failed"));
assert.ok(csv.includes("teacher_vocab_review_batch_highvalue_0000_preflight.json"));
assert.ok(csv.includes("teacher_vocab_promote_plan_highvalue_0100_applied.json"));

console.log("build_vocab_review_index tests passed");
