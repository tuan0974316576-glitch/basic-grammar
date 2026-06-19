const assert = require("assert");

global.TEACHER_VOCAB_BANK = {
  meta: { entryCount: 6 },
  entries: [
    {
      id: "secure-adj",
      word: "secure",
      meaning: "安全的",
      pos: "adjective",
      type: "word",
      sourceCount: 2
    },
    {
      id: "secure-verb",
      word: "secure",
      meaning: "確保 / 獲得",
      pos: "verb",
      type: "word",
      sourceCount: 4
    },
    {
      id: "be-pp",
      word: "be+pp",
      meaning: "被",
      type: "pattern",
      sourceCount: 1
    },
    {
      id: "intend-to",
      word: "intend to",
      meaning: "打算",
      type: "phrase",
      sourceCount: 3
    },
    {
      id: "curiosity-noun",
      word: "curiosity",
      meaning: "好奇心",
      pos: "noun",
      type: "word",
      aliases: ["curiosty"],
      sourceCount: 1
    },
    {
      id: "have-verb-entry-manual-has",
      word: "have",
      meaning: "有",
      pos: "verb",
      type: "word",
      sourceCount: 1
    },
    {
      id: "have-verb-entry-manual-eat-drink",
      word: "have",
      meaning: "食 / 飲",
      pos: "verb",
      type: "word",
      sourceCount: 1
    },
    {
      id: "have-to-phrase-entry-manual-must",
      word: "have to",
      meaning: "必須 / 要",
      type: "phrase",
      sourceCount: 1
    }
  ]
};

delete require.cache[require.resolve("../teacher_vocab.js")];
const teacherVocab = require("../teacher_vocab.js");

assert.strictEqual(teacherVocab.normalizePos("(n)"), "noun");
assert.strictEqual(teacherVocab.normalizeType("", "be+pp"), "pattern");
assert.strictEqual(teacherVocab.formatPosLabel("adjective"), "adj.");
assert.strictEqual(teacherVocab.normalizePos("modal v."), "modal");
assert.strictEqual(teacherVocab.formatPosLabel("modal"), "modal v.");
assert.strictEqual(teacherVocab.normalizePos("exclam."), "exclamation");
assert.strictEqual(teacherVocab.formatPosLabel("exclamation"), "exclam.");
assert.strictEqual(teacherVocab.formatPosLabel("number"), "num.");
assert.strictEqual(teacherVocab.formatPosLabel("phrase"), "ph.");
assert.strictEqual(teacherVocab.formatPosLabel("pattern"), "pt.");

const secureMatches = teacherVocab.lookup(" secure ");
assert.strictEqual(secureMatches.length, 2);
assert.strictEqual(teacherVocab.chooseAutoFillEntry(secureMatches), null);
assert.ok(teacherVocab.getEntryLabel(secureMatches[0]).includes("安全的"));

const patternMatches = teacherVocab.lookup("be+pp");
assert.strictEqual(patternMatches.length, 1);
assert.strictEqual(patternMatches[0].type, "pattern");
assert.strictEqual(teacherVocab.chooseAutoFillEntry(patternMatches).meaning, "被");

const phraseMatches = teacherVocab.lookup("intend to");
assert.strictEqual(phraseMatches.length, 1);
assert.strictEqual(phraseMatches[0].type, "phrase");

const typoMatches = teacherVocab.lookup("curiosty");
assert.strictEqual(typoMatches.length, 1);
assert.strictEqual(typoMatches[0].word, "curiosity");
assert.strictEqual(teacherVocab.getEntryLabel(typoMatches[0]), "n. 好奇心");

const haveMatches = teacherVocab.lookup("have");
assert.strictEqual(haveMatches.length, 2);
assert.deepStrictEqual(haveMatches.map(teacherVocab.getEntryLabel), ["v. 有", "v. 食 / 飲"]);

const haveToMatches = teacherVocab.lookup("have to");
assert.strictEqual(haveToMatches.length, 1);
assert.strictEqual(teacherVocab.getEntryLabel(haveToMatches[0]), "ph. 必須 / 要");

delete global.TEACHER_VOCAB_BANK;

console.log("teacher_vocab tests passed");
