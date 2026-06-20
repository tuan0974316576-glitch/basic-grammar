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
  skipJunk: true,
  xlsx: false,
  limit: 100
}, 200);
assert.ok(childArgs.includes("--in-process"));
assert.ok(childArgs.includes("--no-xlsx"));

const fakeSubprocessSummary = next.makeSubprocessSummary({
  batches: [{ offset: 3900, limit: 100 }],
  firstOffset: 3900,
  indexNextOffset: 3971
});
assert.strictEqual(fakeSubprocessSummary.lastNextOffset, 3971);
assert.strictEqual(fakeSubprocessSummary.indexNextOffset, 3971);

console.log("build_vocab_review_next tests passed");
