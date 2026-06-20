const assert = require("assert");

global.TEACHER_VOCAB_BANK = {
  meta: { entryCount: 3 },
  entries: [
    {
      id: "hawker-any-entry-2514",
      word: "hawker",
      meaning: "小販",
      pos: "",
      inferredPos: "noun",
      type: "word",
      sourceCount: 1
    },
    {
      id: "look-for-any-entry-0985",
      word: "look for",
      meaning: "尋找",
      pos: "",
      type: "phrase",
      sourceCount: 2
    },
    {
      id: "instrumental-in-adj",
      word: "instrumental in",
      meaning: "有助於",
      pos: "adjective",
      type: "phrase",
      aliases: ["intrumental in"],
      sourceCount: 1
    },
    {
      id: "secure-adj",
      word: "secure",
      meaning: "安全的",
      pos: "adjective",
      type: "word",
      sourceCount: 2
    },
    {
      id: "cannot-modal",
      word: "cannot",
      meaning: "不能",
      pos: "modal",
      type: "word",
      sourceCount: 1
    },
    {
      id: "bye-exclamation",
      word: "bye",
      meaning: "再見",
      pos: "exclamation",
      type: "word",
      sourceCount: 1
    }
  ]
};

delete require.cache[require.resolve("../teacher_vocab.js")];
const teacherVocab = require("../teacher_vocab.js");

assert.strictEqual(teacherVocab.formatPosLabel("noun"), "n.");
assert.strictEqual(teacherVocab.formatPosLabel("modal"), "modal v.");
assert.strictEqual(teacherVocab.formatPosLabel("exclamation"), "exclam.");
assert.strictEqual(teacherVocab.formatPosLabel("phrase"), "ph.");
assert.strictEqual(teacherVocab.formatPosLabel("pattern"), "pt.");
assert.strictEqual(teacherVocab.getEntryLabel(teacherVocab.lookup("hawker")[0]), "n. 小販");
assert.strictEqual(teacherVocab.getEntryLabel(teacherVocab.lookup("cannot")[0]), "modal v. 不能");
assert.strictEqual(teacherVocab.getEntryLabel(teacherVocab.lookup("bye")[0]), "exclam. 再見");
assert.strictEqual(teacherVocab.getEntryLabel(teacherVocab.lookup("look for")[0]), "v. 尋找");
assert.strictEqual(teacherVocab.lookup("intrumental in")[0].word, "instrumental in");
assert.strictEqual(teacherVocab.getEntryLabel(teacherVocab.lookup("intrumental in")[0]), "adj. 有助於");

delete global.TEACHER_VOCAB_BANK;

console.log("vocab_format tests passed");
