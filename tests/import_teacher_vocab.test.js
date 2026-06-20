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
assert.strictEqual(importer.normalizePos("modal v."), "modal");
assert.strictEqual(importer.normalizePos("aux."), "auxiliary");
assert.strictEqual(importer.normalizePos("exclam."), "exclamation");
assert.strictEqual(importer.normalizePos("num."), "number");

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
    { word: "manage to", meaning: "能夠", type: "phrase", aliases: ["mange to"] },
    { word: "will", meaning: "將會", pos: "modal" },
    { word: "swift", meaning: "迅速的", pos: "adjective", replaceType: true },
    { word: "adj", type: "word", suppress: true }
  ]
}, "manual.json");
assert.strictEqual(manualEntries.length, 5);
assert.strictEqual(manualEntries[0].override, true);
assert.strictEqual(manualEntries[0].pos, "noun");
assert.deepStrictEqual(manualEntries[1].aliases, ["mange to"]);
assert.strictEqual(manualEntries[2].pos, "modal");
assert.strictEqual(manualEntries[3].replaceType, true);
assert.strictEqual(manualEntries[4].suppress, true);

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

const slimPhrase = importer.slimEntryForBank(importer.dedupeEntries([manualEntries[1]])[0]);
assert.deepStrictEqual(slimPhrase.aliases, ["mange to"]);

const replaceTypeOverride = importer.dedupeEntries([
  {
    id: "",
    word: "swift",
    display: "swift",
    meaning: "迅速地",
    pos: "adverb",
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
    word: "swift",
    display: "swift",
    meaning: "快速",
    pos: "",
    type: "word",
    source: "teacher",
    sourceFile: "old.xlsx",
    sheet: "Old",
    row: 2,
    columns: "A:B",
    needsReview: true
  },
  manualEntries[3]
]);
assert.strictEqual(replaceTypeOverride.length, 1);
assert.strictEqual(replaceTypeOverride[0].word, "swift");
assert.strictEqual(replaceTypeOverride[0].meaning, "迅速的");
assert.strictEqual(replaceTypeOverride[0].pos, "adjective");

const suppressed = importer.dedupeEntries([
  {
    id: "",
    word: "adj",
    display: "adj",
    meaning: "巨大",
    pos: "",
    type: "word",
    source: "teacher",
    sourceFile: "old.xlsx",
    sheet: "Old",
    row: 1,
    columns: "A:B",
    needsReview: true
  },
  manualEntries[4]
]);
assert.strictEqual(suppressed.length, 0);

console.log("import_teacher_vocab tests passed");
