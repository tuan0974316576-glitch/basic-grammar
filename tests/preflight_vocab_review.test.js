const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const preflight = require("../scripts/preflight-vocab-review.js");

const rows = [
  preflight.normalizeReviewRow({
    word: "apple",
    type: "word",
    reviewed_pos: "n.",
    reviewed_meaning: "蘋果",
    promote_to: "curated"
  }, 0, "unit"),
  preflight.normalizeReviewRow({
    word: "apple",
    type: "word",
    reviewed_pos: "n.",
    reviewed_meaning: "蘋果",
    promote_to: "teacher"
  }, 1, "unit"),
  preflight.normalizeReviewRow({
    word: "banana",
    type: "word",
    reviewed_pos: "",
    reviewed_meaning: "香蕉",
    promote_to: "curated"
  }, 2, "unit"),
  preflight.normalizeReviewRow({
    word: "browser",
    type: "word",
    reviewed_pos: "n.",
    reviewed_meaning: "web browser",
    promote_to: "curated"
  }, 3, "unit"),
  preflight.normalizeReviewRow({
    word: "orange",
    type: "word",
    reviewed_pos: "n.",
    reviewed_meaning: "橙",
    promote_to: ""
  }, 4, "unit"),
  preflight.normalizeReviewRow({
    word: "bad",
    type: "word",
    reviewed_pos: "adj.",
    reviewed_meaning: "差的",
    promote_to: "skip"
  }, 5, "unit"),
  preflight.normalizeReviewRow({
    word: "long",
    type: "word",
    reviewed_pos: "adj.",
    reviewed_meaning: "這是一個非常非常非常非常非常非常非常非常非常非常長的中文解釋",
    promote_to: "curated"
  }, 6, "unit"),
  preflight.normalizeReviewRow({
    word: "look up",
    type: "phrase",
    reviewed_pos: "",
    reviewed_meaning: "查閱",
    promote_to: "teacher"
  }, 7, "unit")
];

const report = preflight.buildReport(rows, { input: "/tmp/review.csv" });
assert.strictEqual(report.summary.reviewedRowCount, 8);
assert.strictEqual(report.summary.pass, false);
assert.ok(report.findings.some((finding) => finding.message.includes("duplicate reviewed sense")));
assert.ok(report.findings.some((finding) => finding.message === "missing reviewed_pos"));
assert.ok(report.findings.some((finding) => finding.message === "meaning looks noisy"));
assert.ok(report.findings.some((finding) => finding.message === "missing promote_to"));
assert.ok(report.findings.some((finding) => finding.message === "skip row should leave reviewed POS / meaning blank"));
assert.ok(report.findings.some((finding) => finding.severity === "warning" && finding.message === "meaning may be too long"));
assert.ok(!report.findings.some((finding) => finding.word === "look up" && finding.message === "missing reviewed_pos"));

const cleanReport = preflight.buildReport([
  preflight.normalizeReviewRow({
    word: "look up",
    type: "phrase",
    reviewed_pos: "",
    reviewed_meaning: "查閱",
    promote_to: "teacher"
  }, 0, "unit"),
  preflight.normalizeReviewRow({
    word: "eight",
    type: "word",
    reviewed_pos: "num.",
    reviewed_meaning: "八",
    promote_to: "curated"
  }, 0, "unit"),
  preflight.normalizeReviewRow({
    word: "hello",
    type: "word",
    reviewed_pos: "exclam.",
    reviewed_meaning: "你好",
    promote_to: "curated"
  }, 0, "unit")
]);
assert.strictEqual(cleanReport.summary.pass, true);

const multiSenseRows = preflight.expandReviewRow({
  word: "work",
  type: "word",
  reviewed_pos: "n.",
  reviewed_meaning: "工作",
  promote_to: "curated",
  reviewed_pos_2: "n.",
  reviewed_meaning_2: "作品",
  promote_to_2: "curated"
}, 0, "unit");
assert.strictEqual(multiSenseRows.length, 2);
assert.strictEqual(multiSenseRows[1].senseNumber, 2);
assert.strictEqual(preflight.buildReport(multiSenseRows).summary.pass, true);

const notesOnlyRow = preflight.expandReviewRow({
  word: "work",
  type: "word",
  reviewed_pos: "n.",
  reviewed_meaning: "工作",
  promote_to: "curated",
  notes: "keep note on row"
}, 0, "unit");
assert.strictEqual(notesOnlyRow.length, 1);

const badMultiSenseReport = preflight.buildReport(preflight.expandReviewRow({
  word: "work",
  type: "word",
  reviewed_pos: "n.",
  reviewed_meaning: "工作",
  promote_to: "curated",
  reviewed_pos_2: "",
  reviewed_meaning_2: "作品",
  promote_to_2: "curated"
}, 0, "unit"));
assert.ok(badMultiSenseReport.findings.some((finding) => (
  finding.senseNumber === 2 && finding.message === "missing reviewed_pos"
)));
assert.ok(preflight.buildFindingsCsv(badMultiSenseReport).includes("error,2,2,work,curated,,作品,missing reviewed_pos"));

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vocab-preflight-"));
const csvPath = path.join(tmpDir, "review.csv");
fs.writeFileSync(csvPath, [
  "word,type,reviewed_pos,reviewed_meaning,promote_to,reviewed_pos_2,reviewed_meaning_2,promote_to_2",
  "apple,word,n.,蘋果,curated,n.,水果,curated",
  "banana,word,,香蕉,curated,,,"
].join("\n"));

preflight.readReviewRows(csvPath).then((csvRows) => {
  assert.strictEqual(csvRows.length, 3);
  const csvReport = preflight.buildReport(csvRows, { input: csvPath });
  assert.strictEqual(csvReport.summary.errorCount, 1);
  const outPath = path.join(tmpDir, "preflight.json");
  preflight.writeReport(csvReport, outPath);
  assert.ok(fs.existsSync(outPath));
  assert.ok(fs.existsSync(path.join(tmpDir, "preflight.csv")));
  assert.ok(preflight.buildFindingsCsv(csvReport).includes("missing reviewed_pos"));
  console.log("preflight_vocab_review tests passed");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
