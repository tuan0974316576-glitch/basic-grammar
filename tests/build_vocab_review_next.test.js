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

const parsed = next.parseArgs(["--offset", "300", "--limit", "50", "--no-xlsx"]);
assert.strictEqual(parsed.offset, 300);
assert.strictEqual(parsed.limit, 50);
assert.strictEqual(parsed.xlsx, false);

console.log("build_vocab_review_next tests passed");
