const assert = require("assert");

delete require.cache[require.resolve("../vocab_sense_bank.js")];
const senseBank = require("../vocab_sense_bank.js");

const game = senseBank.lookup("game");
assert.deepStrictEqual(
  game.map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:遊戲", "noun:比賽", "noun:野味"]
);

const have = senseBank.lookup(" HAVE ");
assert.ok(have.some((entry) => entry.meaning === "食 / 飲" && entry.pos === "verb"));
assert.ok(have.some((entry) => entry.meaning === "上 / 參加" && entry.level === "A2"));

const lookUp = senseBank.lookup("look   up");
assert.strictEqual(lookUp.length, 1);
assert.strictEqual(lookUp[0].type, "phrase");
assert.strictEqual(lookUp[0].meaning, "查閱 / 查字典");

const hawker = senseBank.lookup("hawker");
assert.strictEqual(hawker[0].pos, "noun");
assert.strictEqual(hawker[0].meaning, "小販");

console.log("vocab_sense_bank tests passed");
