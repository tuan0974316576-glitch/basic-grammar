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

console.log("fallback_dictionary tests passed");
