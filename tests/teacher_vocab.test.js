const assert = require("assert");

global.TEACHER_VOCAB_BANK = {
  meta: { entryCount: 4 },
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
      id: "have-any-entry-0457",
      word: "have",
      meaning: "只好",
      type: "word",
      needsReview: true,
      sourceCount: 80
    }
  ]
};

delete require.cache[require.resolve("../teacher_vocab.js")];
const teacherVocab = require("../teacher_vocab.js");

assert.strictEqual(teacherVocab.normalizePos("(n)"), "noun");
assert.strictEqual(teacherVocab.normalizeType("", "be+pp"), "pattern");
assert.strictEqual(teacherVocab.formatPosLabel("adjective"), "adj.");
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

assert.strictEqual(teacherVocab.lookup("have").length, 0);
assert.strictEqual(teacherVocab.lookup("have", { includeNeedsReview: true }).length, 1);

delete global.TEACHER_VOCAB_BANK;

console.log("teacher_vocab tests passed");
