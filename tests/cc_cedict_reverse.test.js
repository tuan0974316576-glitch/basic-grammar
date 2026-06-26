const assert = require("assert");

delete require.cache[require.resolve("../cc_cedict_reverse.js")];
const reverse = require("../cc_cedict_reverse.js");

assert.strictEqual(reverse.shardName(" Bacon "), "b");
reverse.seed([
  {
    id: "ccr-bacon",
    word: "Bacon",
    meaning: "培根 / 煙肉",
    type: "word",
    rank: 20,
    sourceCount: 4
  },
  {
    id: "ccr-rule-out",
    word: "rule out",
    meaning: "排除",
    pos: "verb",
    type: "phrase",
    rank: 30
  }
]);

const bacon = reverse.lookup("bacon");
assert.strictEqual(bacon.length, 1);
assert.strictEqual(bacon[0].source, "cc-cedict-reverse");
assert.strictEqual(bacon[0].pos, "");
assert.strictEqual(bacon[0].meaning, "培根 / 煙肉");

reverse.seed([
  {
    id: "ccr-beard",
    word: "beard",
    meaning: "鬍鬚",
    type: "word"
  }
]);
const beard = reverse.lookup("beard");
assert.strictEqual(beard[0].pos, "");

const ruleOut = reverse.lookup(" RULE   OUT ");
assert.strictEqual(ruleOut.length, 1);
assert.strictEqual(ruleOut[0].pos, "verb");
assert.strictEqual(ruleOut[0].type, "phrase");
assert.strictEqual(ruleOut[0].meaning, "排除");

console.log("cc_cedict_reverse tests passed");
