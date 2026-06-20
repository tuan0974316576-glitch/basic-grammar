const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const dashboard = require("../scripts/build-vocab-review-dashboard.js");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vocab-review-dashboard-"));

function writeIndex(fileName, meta, batches) {
  fs.writeFileSync(path.join(tmpDir, fileName), JSON.stringify({
    meta: {
      privateOnly: true,
      generatedAt: "2026-06-20T00:00:00.000Z",
      ...meta
    },
    batches
  }, null, 2));
}

writeIndex("teacher_vocab_review_index.json", {
  prefix: "teacher_vocab_review_batch_highvalue",
  batchCount: 2,
  totalCandidateCount: 200,
  coveredCount: 200,
  readyForReviewBatchCount: 2,
  promotePlanBatchCount: 0,
  preflightFailedBatchCount: 1,
  nextOffset: 200,
  nextBatchId: "0200",
  nextXlsx: "private_exports/teacher_vocab_review_batch_highvalue_0200.xlsx"
}, [
  { id: "0000", entryCount: 100, reviewedEntryCount: 5, xlsxExists: true, status: "preflight-failed", preflightErrorCount: 3 },
  { id: "0100", entryCount: 100, reviewedEntryCount: 0, xlsxExists: true, status: "ready-for-teacher-review" }
]);

writeIndex("oxford_vocab_review_index.json", {
  prefix: "oxford_vocab_review_batch",
  batchCount: 1,
  totalCandidateCount: 300,
  coveredCount: 100,
  readyForReviewBatchCount: 1,
  promotePlanBatchCount: 1,
  appliedBatchCount: 1,
  liveSyncedBatchCount: 1,
  liveSyncedEntryCount: 8,
  nextOffset: 100,
  nextBatchId: "0100",
  nextXlsx: "private_exports/oxford_vocab_review_batch_0100.xlsx"
}, [
  { id: "0000", entryCount: 100, reviewedEntryCount: 0, xlsxExists: true, promotePlanExists: true, applyPlanExists: true, liveSyncExists: true, liveSyncEntryCount: 8, status: "live-synced" }
]);

writeIndex("supplement_vocab_review_index.json", {
  prefix: "supplement_vocab_review_batch",
  batchCount: 1,
  totalCandidateCount: 50,
  coveredCount: 50,
  readyForReviewBatchCount: 0,
  promotePlanBatchCount: 0,
  nextOffset: 50,
  nextBatchId: "0050",
  nextXlsx: "private_exports/supplement_vocab_review_batch_0050.xlsx"
}, [
  { id: "0000", entryCount: 50, reviewedEntryCount: 0, xlsxExists: false, status: "needs-xlsx" }
]);

const result = dashboard.buildDashboard({ dir: tmpDir });
assert.strictEqual(result.queues.length, 4);
assert.strictEqual(result.totals.totalCandidateCount, 550);
assert.strictEqual(result.totals.coveredCount, 350);
assert.strictEqual(result.totals.liveSyncedBatchCount, 1);
assert.strictEqual(result.totals.liveSyncedEntryCount, 8);
assert.strictEqual(result.queues.find((queue) => queue.id === "teacher").status, "has-preflight-errors");
assert.strictEqual(result.queues.find((queue) => queue.id === "oxford").status, "has-live-synced-batches");
assert.strictEqual(result.queues.find((queue) => queue.id === "oxford").appliedBatchCount, 1);
assert.strictEqual(result.queues.find((queue) => queue.id === "oxford").liveSyncedBatchCount, 1);
assert.strictEqual(result.queues.find((queue) => queue.id === "oxford").liveSyncedEntryCount, 8);
assert.strictEqual(result.queues.find((queue) => queue.id === "supplement").status, "needs-xlsx");
assert.strictEqual(result.queues.find((queue) => queue.id === "teacher-live").status, "missing-index");
assert.ok(result.queues.find((queue) => queue.id === "teacher-live").nextAction.includes("vocab:export-teacher-live"));
assert.strictEqual(result.queues.find((queue) => queue.id === "teacher").reviewedEntryCount, 5);
assert.strictEqual(result.queues.find((queue) => queue.id === "teacher").preflightFailedBatchCount, 1);
assert.ok(result.queues.find((queue) => queue.id === "teacher").nextAction.includes("*_preflight.csv"));
assert.strictEqual(result.queues.find((queue) => queue.id === "teacher").reviewProgressLabel, "2.5%");

const csv = dashboard.buildCsv(result);
assert.ok(csv.includes("Teacher vocab cleanup"));
assert.ok(csv.includes("has-live-synced-batches"));
assert.ok(csv.includes("has-preflight-errors"));
assert.ok(csv.includes("Fix rows listed"));

const written = dashboard.writeDashboard({
  dir: tmpDir,
  out: path.join(tmpDir, "dashboard.json")
});
assert.strictEqual(written.queues.length, 4);
assert.ok(fs.existsSync(path.join(tmpDir, "dashboard.json")));
assert.ok(fs.existsSync(path.join(tmpDir, "dashboard.csv")));

console.log("build_vocab_review_dashboard tests passed");
