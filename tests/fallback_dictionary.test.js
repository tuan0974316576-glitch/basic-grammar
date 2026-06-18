const assert = require("assert");

delete require.cache[require.resolve("../fallback_dictionary.js")];
const dictionary = require("../fallback_dictionary.js");

assert.strictEqual(dictionary.isLoaded(), false);
dictionary.seed([
  { id: "generous-adj", word: "Generous", pos: "adjective", meaning: "慷慨的" },
  { id: "present-n", word: "present", pos: "noun", meaning: "禮物" },
  { id: "present-v", word: "present", pos: "verb", meaning: "展示" }
]);

assert.strictEqual(dictionary.isLoaded(), true);

const generous = dictionary.lookup(" generous ");
assert.strictEqual(generous.length, 1);
assert.strictEqual(generous[0].word, "generous");
assert.strictEqual(generous[0].meaning, "慷慨的");
assert.strictEqual(generous[0].source, "offline-dictionary");

const presentAll = dictionary.lookup("present");
assert.strictEqual(presentAll.length, 2);

const limited = dictionary.lookup("present", { limit: 1 });
assert.strictEqual(limited.length, 1);

const presentVerb = dictionary.lookup("present", { pos: "verb" });
assert.strictEqual(presentVerb.length, 1);
assert.strictEqual(presentVerb[0].meaning, "展示");

const have = dictionary.lookup("have");
assert.strictEqual(have[0].pos, "verb");
assert.strictEqual(have[0].meaning, "有");
assert.ok(have.some((entry) => entry.meaning === "食 / 飲"));

const haveTo = dictionary.lookup("have to");
assert.strictEqual(haveTo[0].type, "phrase");
assert.strictEqual(haveTo[0].meaning, "必須 / 要");

dictionary.seed([
  { id: "ecdict-guts-noun", word: "guts", pos: "noun", meaning: "飛碟遊戲（比賽雙方每組5人" }
]);
const guts = dictionary.lookup("guts");
assert.strictEqual(guts.length, 1);
assert.strictEqual(guts[0].meaning, "膽量");

console.log("fallback_dictionary tests passed");
