const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const refresh = require("../scripts/refresh-teacher-live-review.js");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

async function runNonEmptyRefreshTest() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "teacher-live-refresh-"));
  const entriesJson = path.join(tmpDir, "entries.json");
  const dashboardOut = path.join(tmpDir, "dashboard.json");
  fs.writeFileSync(entriesJson, JSON.stringify({
    entries: [
      {
        id: "almond-n",
        word: "almond",
        display: "almond",
        pos: "n.",
        type: "word",
        meaning: "杏仁",
        updatedAt: "2026-06-21T00:00:00.000Z",
        updatedBy: "teacher_001"
      },
      {
        id: "look-for-v",
        word: "look for",
        display: "look for",
        pos: "v.",
        type: "phrase",
        meaning: "尋找",
        updatedAt: "2026-06-21T00:01:00.000Z",
        updatedBy: "teacher_001"
      }
    ]
  }, null, 2));

  const result = await refresh.refreshTeacherLiveReview({
    count: 1,
    dashboardOut,
    dir: tmpDir,
    entriesJson,
    limit: 100,
    project: "test-project",
    xlsx: false
  });

  assert.strictEqual(result.snapshot.entryCount, 2);
  assert.strictEqual(result.review.count, 1);
  assert.strictEqual(result.review.batches[0].selectedCount, 2);
  assert.strictEqual(result.dashboard.teacherLiveStatus, "needs-xlsx");
  assert.strictEqual(result.dashboard.teacherLiveTotalCandidateCount, 2);

  const snapshotPath = path.join(tmpDir, "teacher_live_vocab_snapshot.json");
  const snapshotCsvPath = path.join(tmpDir, "teacher_live_vocab_snapshot.csv");
  const batchPath = path.join(tmpDir, "teacher_live_vocab_review_batch_0000.json");
  const batchCsvPath = path.join(tmpDir, "teacher_live_vocab_review_batch_0000.csv");
  const indexPath = path.join(tmpDir, "teacher_live_vocab_review_index.json");

  assert.ok(fs.existsSync(snapshotPath));
  assert.ok(fs.existsSync(snapshotCsvPath));
  assert.ok(fs.existsSync(batchPath));
  assert.ok(fs.existsSync(batchCsvPath));
  assert.ok(fs.existsSync(indexPath));
  assert.ok(fs.existsSync(dashboardOut));
  assert.ok(fs.existsSync(dashboardOut.replace(/\.json$/i, ".csv")));

  const snapshot = readJson(snapshotPath);
  assert.strictEqual(snapshot.meta.entryCount, 2);
  assert.deepStrictEqual(snapshot.entries.map((entry) => entry.word).sort(), ["almond", "look for"]);

  const batch = readJson(batchPath);
  assert.strictEqual(batch.meta.source, "teacher-live");
  assert.strictEqual(batch.entries.length, 2);
  assert.ok(batch.entries.some((entry) => entry.word === "look for"));

  const index = readJson(indexPath);
  assert.strictEqual(index.meta.totalCandidateCount, 2);
  assert.strictEqual(index.meta.batchCount, 1);
}

async function runEmptyRefreshTest() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "teacher-live-refresh-empty-"));
  const entriesJson = path.join(tmpDir, "entries.json");
  const dashboardOut = path.join(tmpDir, "dashboard.json");
  fs.writeFileSync(entriesJson, JSON.stringify({ entries: [] }, null, 2));

  const result = await refresh.refreshTeacherLiveReview({
    count: 1,
    dashboardOut,
    dir: tmpDir,
    entriesJson,
    limit: 100,
    project: "test-project",
    xlsx: false
  });

  assert.strictEqual(result.snapshot.entryCount, 0);
  assert.strictEqual(result.review.count, 0);
  assert.strictEqual(result.review.skippedCount, 1);
  assert.strictEqual(result.review.skipped[0].reason, "no-review-tasks");
  assert.strictEqual(result.dashboard.teacherLiveStatus, "empty");
  assert.strictEqual(result.dashboard.teacherLiveTotalCandidateCount, 0);

  assert.ok(fs.existsSync(path.join(tmpDir, "teacher_live_vocab_snapshot.json")));
  assert.ok(fs.existsSync(path.join(tmpDir, "teacher_live_vocab_snapshot.csv")));
  assert.ok(fs.existsSync(path.join(tmpDir, "teacher_live_vocab_review_index.json")));
  assert.ok(!fs.existsSync(path.join(tmpDir, "teacher_live_vocab_review_batch_0000.json")));

  const dashboard = readJson(dashboardOut);
  const teacherLiveQueue = dashboard.queues.find((queue) => queue.id === "teacher-live");
  assert.strictEqual(teacherLiveQueue.status, "empty");
}

assert.deepStrictEqual(refresh.loadEntriesJson(""), null);
assert.strictEqual(refresh.parseArgs(["--count", "2", "--limit", "25", "--no-xlsx"]).count, 2);

runNonEmptyRefreshTest()
  .then(runEmptyRefreshTest)
  .then(() => {
    console.log("refresh_teacher_live_review tests passed");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
