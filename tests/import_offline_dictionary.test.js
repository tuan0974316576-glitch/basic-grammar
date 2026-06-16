const assert = require("assert");
const importer = require("../scripts/import-offline-dictionary.js");

assert.deepStrictEqual(importer.parseCsvLine('word,translation,pos'), ["word", "translation", "pos"]);
assert.deepStrictEqual(importer.parseCsvLine('"a,b","c""d",e'), ["a,b", "c\"d", "e"]);

assert.strictEqual(importer.cleanMeaning("a. 慷慨的, 有雅量的, 大量的"), "慷慨的");
assert.strictEqual(importer.cleanMeaning("vt. 借, 借入, 借用"), "借");
assert.strictEqual(importer.cleanMeaning("n. 学生, 学员"), "學生");
assert.strictEqual(importer.cleanMeaning("[醫] 蘋果"), "蘋果");
assert.strictEqual(importer.cleanMeaning("abbr. English only\\nn. 自走榴弹炮"), "自走榴彈炮");
assert.strictEqual(importer.detectPosFromTranslation("a. 慷慨的"), "adjective");
assert.strictEqual(importer.detectPosFromTranslation("vt. 借入"), "verb");
assert.strictEqual(importer.detectPosFromTranslation("n. 老師"), "noun");
assert.strictEqual(importer.shardName("Generous"), "g");

const row = {
  word: "generous",
  translation: "a. 慷慨的, 有雅量的, 大量的",
  bnc: "3178",
  frq: "3886"
};
assert.strictEqual(importer.shouldKeepRow(row, 20000), true);
assert.deepStrictEqual(importer.createEntry(row), {
  id: "ecdict-generous-adjective",
  word: "generous",
  pos: "adjective",
  meaning: "慷慨的",
  type: "word",
  rank: 3178
});

const multiPosRow = {
  word: "present",
  translation: "n. 礼物\\nvt. 展示",
  bnc: "100",
  frq: "200"
};
assert.deepStrictEqual(importer.createEntries(multiPosRow), [
  {
    id: "ecdict-present-noun",
    word: "present",
    pos: "noun",
    meaning: "禮物",
    type: "word",
    rank: 100
  },
  {
    id: "ecdict-present-verb",
    word: "present",
    pos: "verb",
    meaning: "展示",
    type: "word",
    rank: 100
  }
]);

assert.deepStrictEqual(importer.createEntries({
  word: "apple",
  translation: "n. 苹果\\n[醫] 蘋果",
  bnc: "100",
  frq: "200"
}), [
  {
    id: "ecdict-apple-noun",
    word: "apple",
    pos: "noun",
    meaning: "蘋果",
    type: "word",
    rank: 100
  }
]);

console.log("import_offline_dictionary tests passed");
