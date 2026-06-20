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
assert.strictEqual(promote.normalizeReviewType("word", "look up", "ph."), "phrase");
assert.strictEqual(promote.normalizeReviewType("word", "either...or", ""), "pattern");

const csvEntries = promote.reviewedEntriesFromCsvRows([
  {
    word: "above",
    display: "Above",
    level: "A1",
    type: "word",
    audit_reasons: "missing-pos / noisy-meaning",
    original_teacher_entry: "上面",
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
  },
  {
    word: "look up",
    level: "A2",
    type: "word",
    reviewed_pos: "ph.",
    reviewed_meaning: "查閱",
    promote_to: "teacher",
    notes: ""
  },
  {
    word: "work",
    level: "A1",
    type: "word",
    reviewed_pos: "n.",
    reviewed_meaning: "工作",
    promote_to: "curated",
    reviewed_pos_2: "n.",
    reviewed_meaning_2: "作品",
    promote_to_2: "curated",
    reviewed_pos_3: "v.",
    reviewed_meaning_3: "工作 / 做事",
    promote_to_3: "curated",
    notes: "multi-sense"
  }
]);

assert.deepStrictEqual(csvEntries, [
  {
    word: "above",
    display: "Above",
    meaning: "在...之上",
    pos: "preposition",
    type: "word",
    promoteTo: "curated",
    level: "A1",
    notes: "CSV reviewed",
    auditReasons: ["missing-pos", "noisy-meaning"],
    originalTeacherEntry: "上面",
    replaceType: true
  },
  {
    word: "look up",
    display: "look up",
    meaning: "查閱",
    pos: "",
    type: "phrase",
    promoteTo: "teacher",
    level: "A2",
    notes: "",
    auditReasons: [],
    originalTeacherEntry: "",
    replaceType: false
  },
  {
    word: "work",
    display: "work",
    meaning: "工作",
    pos: "noun",
    type: "word",
    promoteTo: "curated",
    level: "A1",
    notes: "multi-sense",
    auditReasons: [],
    originalTeacherEntry: "",
    replaceType: false
  },
  {
    word: "work",
    display: "work",
    meaning: "作品",
    pos: "noun",
    type: "word",
    promoteTo: "curated",
    level: "A1",
    notes: "multi-sense",
    auditReasons: [],
    originalTeacherEntry: "",
    replaceType: false
  },
  {
    word: "work",
    display: "work",
    meaning: "工作 / 做事",
    pos: "verb",
    type: "word",
    promoteTo: "curated",
    level: "A1",
    notes: "multi-sense",
    auditReasons: [],
    originalTeacherEntry: "",
    replaceType: false
  }
]);

const csvPlan = promote.buildPromotePlan({
  meta: { source: "review-csv" },
  entries: csvEntries
});
assert.strictEqual(csvPlan.meta.reviewedEntryCount, 5);
assert.strictEqual(csvPlan.entries[0].word, "above");
assert.strictEqual(csvPlan.entries[1].word, "look up");
assert.strictEqual(csvPlan.entries[1].promoteTo, "teacher");
assert.deepStrictEqual(csvPlan.entries.filter((entry) => entry.word === "work").map((entry) => `${entry.pos}:${entry.meaning}`), [
  "noun:工作",
  "noun:作品",
  "verb:工作 / 做事"
]);

const workbookEntries = promote.reviewedEntriesFromWorkbookRows([
  {
    word: "either...or",
    level: "",
    type: "pattern",
    reviewed_pos: "",
    reviewed_meaning: "一係...一係...",
    promote_to: "teacher"
  }
]);
assert.strictEqual(workbookEntries[0].type, "pattern");
assert.strictEqual(workbookEntries[0].promoteTo, "teacher");
assert.strictEqual(workbookEntries[0].replaceType, false);

assert.deepStrictEqual(promote.parseCsvLine('"a,b","c""d",e'), ["a,b", "c\"d", "e"]);

console.log("build_vocab_promote_plan tests passed");
