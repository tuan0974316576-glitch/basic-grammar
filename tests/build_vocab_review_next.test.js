const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const next = require("../scripts/build-vocab-review-next.js");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vocab-review-next-"));

function writeBatch(id, offset, nextOffset) {
  fs.writeFileSync(path.join(tmpDir, `teacher_vocab_review_batch_highvalue_${id}.json`), JSON.stringify({
    meta: {
      source: "teacher-audit",
      offset,
      limit: 100,
      selectedCount: 100,
      totalCandidateCount: 3971,
      nextOffset
    },
    entries: []
  }, null, 2));
}

writeBatch("0000", 0, 100);
writeBatch("0100", 100, 200);

assert.strictEqual(next.batchId(0), "0000");
assert.strictEqual(next.batchId(200), "0200");
assert.strictEqual(next.getNextOffset({
  dir: tmpDir,
  prefix: "teacher_vocab_review_batch_highvalue"
}), 200);

assert.deepStrictEqual(next.outputPaths({
  dir: tmpDir,
  prefix: "teacher_vocab_review_batch_highvalue",
  offset: 200
}), {
  id: "0200",
  json: path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0200.json"),
  csv: path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0200.csv"),
  xlsx: path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0200.xlsx")
});

const parsed = next.parseArgs(["--offset", "300", "--limit", "50", "--count", "3", "--all", "--no-xlsx"]);
assert.strictEqual(parsed.offset, 300);
assert.strictEqual(parsed.limit, 50);
assert.strictEqual(parsed.count, 3);
assert.strictEqual(parsed.all, true);
assert.strictEqual(parsed.xlsx, false);

const oxfordParsed = next.parseArgs(["--preset", "oxford", "--dir", tmpDir, "--limit", "25", "--no-xlsx"]);
assert.strictEqual(oxfordParsed.preset, "oxford");
assert.strictEqual(oxfordParsed.prefix, "oxford_vocab_review_batch");
assert.strictEqual(oxfordParsed.source, "oxford");
assert.strictEqual(oxfordParsed.skipJunk, false);
assert.strictEqual(oxfordParsed.indexOut, path.join(tmpDir, "oxford_vocab_review_index.json"));
assert.strictEqual(oxfordParsed.limit, 25);
assert.strictEqual(oxfordParsed.xlsx, false);

const explicitSource = next.parseArgs(["--preset", "oxford", "--source", "all", "--prefix", "custom_review"]);
assert.strictEqual(explicitSource.source, "all");
assert.strictEqual(explicitSource.prefix, "custom_review");

const supplementParsed = next.parseArgs(["--preset", "supplement", "--dir", tmpDir, "--limit", "10", "--no-xlsx"]);
assert.strictEqual(supplementParsed.preset, "supplement");
assert.strictEqual(supplementParsed.prefix, "supplement_vocab_review_batch");
assert.strictEqual(supplementParsed.source, "supplement");
assert.strictEqual(supplementParsed.skipJunk, false);
assert.strictEqual(supplementParsed.indexOut, path.join(tmpDir, "supplement_vocab_review_index.json"));
assert.strictEqual(supplementParsed.limit, 10);
assert.strictEqual(supplementParsed.xlsx, false);

const teacherLiveInput = path.join(tmpDir, "teacher_live_vocab_snapshot.json");
const teacherLiveParsed = next.parseArgs(["--preset", "teacher-live", "--dir", tmpDir, "--limit", "10", "--teacher-live-input", teacherLiveInput, "--no-xlsx"]);
assert.strictEqual(teacherLiveParsed.preset, "teacher-live");
assert.strictEqual(teacherLiveParsed.prefix, "teacher_live_vocab_review_batch");
assert.strictEqual(teacherLiveParsed.source, "teacher-live");
assert.strictEqual(teacherLiveParsed.skipJunk, false);
assert.strictEqual(teacherLiveParsed.indexOut, path.join(tmpDir, "teacher_live_vocab_review_index.json"));
assert.strictEqual(teacherLiveParsed.teacherLiveInput, teacherLiveInput);

assert.strictEqual(next.getBatchCount({
  dir: tmpDir,
  prefix: "teacher_vocab_review_batch_highvalue",
  limit: 100,
  all: true
}), 38);
assert.strictEqual(next.getBatchCount({ count: 4 }), 4);

const childArgs = next.childArgsForBatch({
  dir: tmpDir,
  indexOut: path.join(tmpDir, "index.json"),
  prefix: "teacher_vocab_review_batch_highvalue",
  source: "teacher-audit",
  teacherLiveInput,
  skipJunk: true,
  xlsx: false,
  limit: 100
}, 200);
assert.ok(childArgs.includes("--in-process"));
assert.ok(childArgs.includes("--no-xlsx"));
assert.ok(childArgs.includes("--teacher-live-input"));
assert.ok(childArgs.includes(teacherLiveInput));

const fakeSubprocessSummary = next.makeSubprocessSummary({
  batches: [{ offset: 3900, limit: 100 }],
  firstOffset: 3900,
  indexNextOffset: 3971
});
assert.strictEqual(fakeSubprocessSummary.lastNextOffset, 3971);
assert.strictEqual(fakeSubprocessSummary.indexNextOffset, 3971);

const emptyTeacherLiveInput = path.join(tmpDir, "teacher_live_vocab_snapshot_empty.json");
fs.writeFileSync(emptyTeacherLiveInput, JSON.stringify({
  meta: { source: "teacher-live", entryCount: 0, privateOnly: true },
  entries: []
}, null, 2));
const emptyTeacherLiveSummary = next.buildNextBatches({
  dir: tmpDir,
  indexOut: path.join(tmpDir, "teacher_live_vocab_review_index.json"),
  prefix: "teacher_live_vocab_review_batch",
  source: "teacher-live",
  teacherLiveInput: emptyTeacherLiveInput,
  skipJunk: false,
  xlsx: false,
  limit: 100,
  count: 1
});
assert.strictEqual(emptyTeacherLiveSummary.count, 0);
assert.strictEqual(emptyTeacherLiveSummary.skippedCount, 1);
assert.strictEqual(emptyTeacherLiveSummary.skipped[0].reason, "no-review-tasks");
assert.ok(fs.existsSync(path.join(tmpDir, "teacher_live_vocab_review_index.json")));
assert.ok(!fs.existsSync(path.join(tmpDir, "teacher_live_vocab_review_batch_0000.json")));

console.log("build_vocab_review_next tests passed");
