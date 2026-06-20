const assert = require("assert");
const importer = require("../scripts/import-cc-cedict-reverse.js");

assert.strictEqual(importer.extractTraditional("培根 培根 [pei2 gen1] /bacon/"), "培根");
assert.deepStrictEqual(importer.extractDefinitions("培根 培根 [pei2 gen1] /bacon/"), ["bacon"]);
assert.strictEqual(importer.cleanEnglishDefinition("to rule out"), "rule out");
assert.strictEqual(importer.cleanEnglishDefinition("(Tw) bacon"), "bacon");
assert.strictEqual(importer.looksLikeEnglishLookupKey("bacon"), true);
assert.strictEqual(importer.looksLikeEnglishLookupKey("the emergency number for law enforcement in Mainland China"), false);

const baconEntries = importer.parseLine("培根 培根 [pei2 gen1] /bacon/", 1);
assert.deepStrictEqual(baconEntries, [{
  id: "ccr-bacon-1",
  word: "bacon",
  display: "bacon",
  meaning: "培根",
  pos: "",
  type: "word",
  rank: 2
}]);

const ruleOutEntries = importer.parseLine("排除 排除 [pai2 chu2] /to eliminate/to remove/to exclude/to rule out/", 2);
assert.ok(ruleOutEntries.some((entry) => (
  entry.word === "rule out"
  && entry.meaning === "排除"
  && entry.pos === "verb"
  && entry.type === "phrase"
)));

const merged = importer.mergeEntries([
  ...baconEntries,
  { ...baconEntries[0], meaning: "煙肉", rank: 4 },
  { ...baconEntries[0], meaning: "培根", rank: 9 }
]);
assert.deepStrictEqual(merged, [{
  id: "ccr-bacon",
  word: "bacon",
  display: "bacon",
  meaning: "培根 / 煙肉",
  pos: "",
  type: "word",
  rank: 2,
  sourceCount: 3
}]);

assert.strictEqual(importer.shardName("Rule out"), "r");

console.log("import_cc_cedict_reverse tests passed");
