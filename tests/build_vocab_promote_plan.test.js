const assert = require("assert");
const promote = require("../scripts/build-vocab-promote-plan.js");

const plan = promote.buildPromotePlan({
  meta: { source: "oxford", offset: 0 },
  entries: [
    {
      word: "about",
      display: "about",
      level: "A1",
      type: "word",
      review: {
        promoteTo: "curated",
        approvedEntries: [
          { pos: "prep.", meaning: "關於" },
          { pos: "adv.", meaning: "大約", promoteTo: "teacher" }
        ],
        notes: "Austin reviewed"
      }
    },
    {
      word: "actor",
      display: "actor",
      level: "A1",
      type: "word",
      review: {
        promoteTo: "skip",
        approvedEntries: [],
        notes: "already okay"
      }
    }
  ]
});

assert.strictEqual(plan.meta.reviewedEntryCount, 2);
assert.strictEqual(plan.meta.findingCount, 0);
assert.deepStrictEqual(plan.entries.map((entry) => `${entry.promoteTo}:${entry.pos}:${entry.meaning}`), [
  "curated:preposition:關於",
  "teacher:adverb:大約"
]);
assert.strictEqual(plan.entries[0].notes, "Austin reviewed");

assert.deepStrictEqual(promote.getReviewedEntries({
  word: "empty",
  review: { approvedEntries: [] }
}), []);

const badFindings = promote.validatePlanEntry({
  word: "test",
  meaning: "English meaning",
  pos: "",
  type: "word",
  promoteTo: "curated"
});
assert.ok(badFindings.includes("missing POS"));
assert.ok(badFindings.includes("meaning looks noisy"));

assert.strictEqual(promote.normalizePromoteTarget("teacher-bank"), "teacher");
assert.strictEqual(promote.normalizePromoteTarget("curated-sense-bank"), "curated");

const csvEntries = promote.reviewedEntriesFromCsvRows([
  {
    word: "above",
    level: "A1",
    type: "word",
    reviewed_pos: "prep.",
    reviewed_meaning: "在...之上",
    promote_to: "curated",
    notes: "CSV reviewed"
  },
  {
    word: "empty",
    level: "A1",
    type: "word",
    reviewed_pos: "",
    reviewed_meaning: "",
    promote_to: "",
    notes: ""
  }
]);

assert.deepStrictEqual(csvEntries, [
  {
    word: "above",
    display: "above",
    meaning: "在...之上",
    pos: "preposition",
    type: "word",
    promoteTo: "curated",
    level: "A1",
    notes: "CSV reviewed"
  }
]);

const csvPlan = promote.buildPromotePlan({
  meta: { source: "review-csv" },
  entries: csvEntries
});
assert.strictEqual(csvPlan.meta.reviewedEntryCount, 1);
assert.strictEqual(csvPlan.entries[0].word, "above");

assert.deepStrictEqual(promote.parseCsvLine('"a,b","c""d",e'), ["a,b", "c\"d", "e"]);

console.log("build_vocab_promote_plan tests passed");
