const assert = require("assert");
const importer = require("../scripts/import-teacher-vocab.js");

assert.deepStrictEqual(importer.splitPosFromWord("measure (n)"), {
  display: "measure (n)",
  word: "measure",
  pos: "noun",
  multiSenseHint: false
});

assert.deepStrictEqual(importer.splitPosFromWord("force x2"), {
  display: "force x2",
  word: "force",
  pos: "",
  multiSenseHint: true
});

assert.strictEqual(importer.detectType("be+pp"), "pattern");
assert.strictEqual(importer.detectType("as+名詞"), "pattern");
assert.strictEqual(importer.detectType("intend to"), "phrase");
assert.deepStrictEqual(importer.splitMeanings("力量/強迫"), ["力量", "強迫"]);

const extracted = importer.extractEntriesFromRows({
  sourceFile: "fixture.xlsx",
  sheetName: "MON 1815 1.12.2025",
  rows: [
    { 0: "English", 1: "Chinese", 2: "English", 3: "Chinese" },
    { 0: "measure (n)", 1: "措施", 2: "be+pp", 3: "被" },
    { 0: "force x2", 1: "力量/強迫", 2: "intend to", 3: "打算" }
  ]
});

assert.strictEqual(extracted.entries.length, 5);
assert.ok(extracted.entries.some((entry) => entry.word === "measure" && entry.pos === "noun" && entry.meaning === "措施"));
assert.ok(extracted.entries.some((entry) => entry.word === "be+pp" && entry.type === "pattern" && entry.meaning === "被"));
assert.ok(extracted.entries.some((entry) => entry.word === "force" && entry.meaning === "力量" && entry.needsReview));
assert.ok(extracted.entries.some((entry) => entry.word === "force" && entry.meaning === "強迫" && entry.needsReview));
assert.ok(extracted.entries.some((entry) => entry.word === "intend to" && entry.type === "phrase"));

const deduped = importer.dedupeEntries([
  extracted.entries[0],
  { ...extracted.entries[0], row: 9 }
]);
assert.strictEqual(deduped.length, 1);
assert.strictEqual(deduped[0].sourceCount, 2);

console.log("import_teacher_vocab tests passed");
