const assert = require("assert");
const suggestions = require("../vocab_suggestions.js");

const entries = [
  { word: "pineapple", meaning: "菠蘿 / 鳳梨", pos: "noun", source: "curated-sense-bank" },
  { word: "apple", meaning: "蘋果", pos: "noun", source: "teacher" },
  { word: "appeal", meaning: "吸引力", pos: "noun", source: "curated-sense-bank" },
  { word: "friend", meaning: "朋友", pos: "noun", source: "teacher" },
  { word: "look for", meaning: "尋找", pos: "verb", type: "phrase", source: "curated-sense-bank" },
  { word: "hidden word", meaning: "不應顯示", pos: "noun", hidden: true, source: "curated-sense-bank" }
];

const index = suggestions.buildIndex(entries);

assert.strictEqual(suggestions.boundedDamerauLevenshtein("appel", "apple", 1), 1);
assert.strictEqual(suggestions.suggest(index, "pinapple")[0].word, "pineapple");
assert.strictEqual(suggestions.suggest(index, "appel")[0].word, "apple");
assert.strictEqual(suggestions.suggest(index, "freind")[0].word, "friend");
assert.strictEqual(suggestions.suggest(index, "look fro")[0].word, "look for");
assert.strictEqual(suggestions.suggest(index, "hidden wor").some((entry) => entry.word === "hidden word"), false);
assert.strictEqual(
  suggestions.suggest(index, "pinapple", {
    matches: [{ word: "pineapple" }]
  }).some((entry) => entry.word === "pineapple"),
  false
);

console.log("vocab_suggestions tests passed");
