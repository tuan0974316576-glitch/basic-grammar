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

const manualEntries = importer.createManualEntriesFromData({
  meta: { lesson: "Today" },
  entries: [
    { word: "appeal", meaning: "吸引力", pos: "noun" },
    { word: "manage to", meaning: "能夠", type: "phrase" }
  ]
}, "manual.json");
assert.strictEqual(manualEntries.length, 2);
assert.strictEqual(manualEntries[0].override, true);
assert.strictEqual(manualEntries[0].pos, "noun");

const overridden = importer.dedupeEntries([
  {
    id: "",
    word: "appeal",
    display: "appeal",
    meaning: "上訴",
    pos: "noun",
    type: "word",
    source: "teacher",
    sourceFile: "old.xlsx",
    sheet: "Old",
    row: 1,
    columns: "A:B",
    needsReview: false
  },
  {
    id: "",
    word: "appeal",
    display: "appeal",
    meaning: "吸引",
    pos: "",
    type: "word",
    source: "teacher",
    sourceFile: "old.xlsx",
    sheet: "Old",
    row: 2,
    columns: "A:B",
    needsReview: true
  },
  ...manualEntries.slice(0, 1)
]);
assert.strictEqual(overridden.length, 1);
assert.strictEqual(overridden[0].word, "appeal");
assert.strictEqual(overridden[0].meaning, "吸引力");
assert.strictEqual(overridden[0].pos, "noun");

console.log("import_teacher_vocab tests passed");
