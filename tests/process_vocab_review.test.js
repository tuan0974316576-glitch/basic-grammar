const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const processor = require("../scripts/process-vocab-review.js");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vocab-process-review-"));

assert.strictEqual(
  processor.inferPromotePlanPath(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0200.xlsx")),
  path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0200.json")
);
assert.strictEqual(
  processor.inferPromotePlanPath(path.join(tmpDir, "oxford_vocab_review_batch_0300.csv")),
  path.join(tmpDir, "oxford_vocab_promote_plan_0300.json")
);
assert.strictEqual(
  processor.inferPromotePlanPath(path.join(tmpDir, "supplement_vocab_review_batch_0000.json")),
  path.join(tmpDir, "supplement_vocab_promote_plan_0000.json")
);
assert.strictEqual(
  processor.inferPromotePlanPath(path.join(tmpDir, "teacher_live_vocab_review_batch_0000.json")),
  path.join(tmpDir, "teacher_live_vocab_promote_plan_0000.json")
);
assert.strictEqual(
  processor.inferPreflightPath(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0200.xlsx")),
  path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0200_preflight.json")
);

const parsed = processor.parseArgs([
  path.join(tmpDir, "custom_review.csv"),
  "--out",
  path.join(tmpDir, "custom_plan.json"),
  "--preflight-out",
  path.join(tmpDir, "custom_preflight.json"),
  "--no-refresh"
]);
assert.strictEqual(parsed.out, path.join(tmpDir, "custom_plan.json"));
assert.strictEqual(parsed.preflightOut, path.join(tmpDir, "custom_preflight.json"));
assert.strictEqual(parsed.refresh, false);
assert.deepStrictEqual(processor.getReviewQueueForInput(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0000.xlsx")), {
  prefix: "teacher_vocab_review_batch_highvalue",
  indexFile: "teacher_vocab_review_index.json"
});
assert.deepStrictEqual(processor.getReviewQueueForInput(path.join(tmpDir, "teacher_live_vocab_review_batch_0000.xlsx")), {
  prefix: "teacher_live_vocab_review_batch",
  indexFile: "teacher_live_vocab_review_index.json"
});

const dirtyReview = path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0000.csv");
fs.writeFileSync(dirtyReview, [
  "word,type,reviewed_pos,reviewed_meaning,promote_to",
  "apple,word,,蘋果,teacher"
].join("\n"));
fs.writeFileSync(path.join(tmpDir, "teacher_vocab_review_batch_highvalue_0000.json"), JSON.stringify({
  meta: {
    source: "teacher-audit",
    offset: 0,
    limit: 100,
    selectedCount: 1,
    totalCandidateCount: 1,
    nextOffset: 1
  },
  entries: [{ word: "apple" }]
}, null, 2));

processor.processReview({ input: dirtyReview }).then((dirtyResult) => {
  assert.strictEqual(dirtyResult.summary.pass, false);
  assert.strictEqual(dirtyResult.summary.preflightPass, false);
  assert.ok(dirtyResult.summary.errorCount > 0);
  assert.strictEqual(dirtyResult.summary.out, "");
  assert.strictEqual(dirtyResult.plan, null);
  assert.strictEqual(dirtyResult.summary.refreshed.status, "preflight-failed");
  assert.ok(fs.existsSync(processor.inferPreflightPath(dirtyReview)));
  assert.ok(!fs.existsSync(processor.inferPromotePlanPath(dirtyReview)));
  assert.ok(fs.existsSync(path.join(tmpDir, "teacher_vocab_review_index.json")));
  assert.ok(fs.existsSync(path.join(tmpDir, "vocab_review_dashboard.json")));

  const cleanReview = path.join(tmpDir, "supplement_vocab_review_batch_0000.csv");
  fs.writeFileSync(cleanReview, [
    "word,type,reviewed_pos,reviewed_meaning,promote_to",
    "almond,word,n.,杏仁,teacher",
    "look up,phrase,,查閱,curated"
  ].join("\n"));
  fs.writeFileSync(path.join(tmpDir, "supplement_vocab_review_batch_0000.json"), JSON.stringify({
    meta: {
      source: "supplement",
      offset: 0,
      limit: 100,
      selectedCount: 2,
      totalCandidateCount: 2,
      nextOffset: 2
    },
    entries: [{ word: "almond" }, { word: "look up" }]
  }, null, 2));

  return processor.processReview({ input: cleanReview });
}).then((cleanResult) => {
  assert.strictEqual(cleanResult.summary.pass, true);
  assert.strictEqual(cleanResult.summary.preflightPass, true);
  assert.strictEqual(cleanResult.summary.reviewedEntryCount, 2);
  assert.strictEqual(cleanResult.summary.findingCount, 0);
  assert.strictEqual(cleanResult.summary.refreshed.status, "promote-plan-created");
  assert.ok(fs.existsSync(processor.inferPreflightPath(cleanResult.summary.input)));
  assert.ok(fs.existsSync(processor.inferPromotePlanPath(cleanResult.summary.input)));
  assert.ok(fs.existsSync(path.join(tmpDir, "supplement_vocab_review_index.json")));
  const plan = JSON.parse(fs.readFileSync(processor.inferPromotePlanPath(cleanResult.summary.input), "utf8"));
  assert.deepStrictEqual(plan.entries.map((entry) => `${entry.promoteTo}:${entry.word}:${entry.meaning}`), [
    "teacher:almond:杏仁",
    "curated:look up:查閱"
  ]);
  console.log("process_vocab_review tests passed");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
