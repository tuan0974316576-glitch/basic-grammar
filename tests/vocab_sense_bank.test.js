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

assert.deepStrictEqual(
  senseBank.lookup("work").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:工作", "noun:作品", "verb:工作 / 做事", "verb:運作 / 奏效"]
);
assert.deepStrictEqual(
  senseBank.lookup("egg waffle").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:雞蛋仔"]
);
assert.deepStrictEqual(
  senseBank.lookup("Octopus card").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:八達通"]
);

const hawker = senseBank.lookup("hawker");
assert.strictEqual(hawker[0].pos, "noun");
assert.strictEqual(hawker[0].meaning, "小販");

assert.deepStrictEqual(
  senseBank.lookup("swift").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:迅速的"]
);
assert.deepStrictEqual(
  senseBank.lookup("won't").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["modal:不會"]
);
assert.deepStrictEqual(
  senseBank.lookup("ought to").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["modal:應該"]
);
assert.deepStrictEqual(
  senseBank.lookup("delicacy").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:佳餚"]
);
assert.deepStrictEqual(
  senseBank.lookup("cub").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:幼獸"]
);
assert.deepStrictEqual(
  senseBank.lookup("cubs").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:幼獸"]
);

console.log("vocab_sense_bank tests passed");
