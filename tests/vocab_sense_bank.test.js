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
assert.strictEqual(lookUp[0].overrideTeacher, true);

assert.deepStrictEqual(
  senseBank.lookup("work").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:工作", "noun:作品", "verb:工作 / 做事", "verb:運作 / 奏效"]
);
assert.ok(senseBank.lookup("work").every((entry) => entry.overrideTeacher));
assert.deepStrictEqual(
  senseBank.lookup("egg waffle").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:雞蛋仔"]
);
assert.deepStrictEqual(
  senseBank.lookup("egg tart").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:蛋撻"]
);
assert.deepStrictEqual(
  senseBank.lookup("lung cancer").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:肺癌"]
);
assert.deepStrictEqual(
  senseBank.lookup("Octopus card").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:八達通"]
);

assert.deepStrictEqual(
  senseBank.lookup("put on").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:穿上 / 戴上"]
);
assert.deepStrictEqual(
  senseBank.lookup("take off").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:脫下 / 起飛"]
);
assert.strictEqual(senseBank.lookup("take off")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("turn off").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:關掉"]
);
assert.deepStrictEqual(
  senseBank.lookup("as a result").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:結果 / 因此"]
);
assert.deepStrictEqual(
  senseBank.lookup("a piece of").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:一塊 / 一張 / 一件"]
);

[
  ["rice", "noun:飯 / 米"],
  ["noodle", "noun:麵"],
  ["homework", "noun:功課"],
  ["information", "noun:資訊 / 資料"],
  ["advice", "noun:建議"],
  ["news", "noun:新聞"],
  ["equipment", "noun:器材 / 設備"],
  ["furniture", "noun:家具"]
].forEach(([word, expected]) => {
  assert.deepStrictEqual(
    senseBank.lookup(word).map((entry) => `${entry.pos}:${entry.meaning}`),
    [expected]
  );
});

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

assert.deepStrictEqual(
  senseBank.lookup("customer-centric").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:以顧客為中心的"]
);
assert.deepStrictEqual(
  senseBank.lookup("Czech").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:捷克人 / 捷克語", "adjective:捷克的"]
);
assert.deepStrictEqual(
  senseBank.lookup("rise to fame").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:成名 / 走紅"]
);

console.log("vocab_sense_bank tests passed");
