const assert = require("assert");

delete require.cache[require.resolve("../cc_cedict_supplement.js")];
const supplement = require("../cc_cedict_supplement.js");

assert.deepStrictEqual(
  supplement.lookup("Mong Kok").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:旺角"]
);
assert.deepStrictEqual(
  supplement.lookup("Mong Kok").map((entry) => `${entry.display}:${entry.level}:${entry.source}`),
  ["Mong Kok:A2:cc-cedict-supplement"]
);
assert.deepStrictEqual(
  supplement.lookup("Mongkok").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:旺角"]
);
assert.deepStrictEqual(
  supplement.lookup("TST").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:尖沙咀"]
);
assert.deepStrictEqual(
  supplement.lookup("dim sum").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:點心"]
);

assert.strictEqual(supplement.entries.length, 23);
assert.ok(supplement.entries.every((entry) => entry.pos));
assert.ok(supplement.entries.every((entry) => entry.level));
assert.ok(supplement.entries.every((entry) => entry.display));
assert.ok(supplement.entries.every((entry) => entry.source === "cc-cedict-supplement"));

console.log("cc_cedict_supplement tests passed");
