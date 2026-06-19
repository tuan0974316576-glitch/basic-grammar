const assert = require("assert");
const inference = require("../vocab_pos_inference.js");

assert.strictEqual(inference.inferEntryPos({
  word: "hawker",
  meaning: "小販",
  type: "word"
}).pos, "noun");

assert.strictEqual(inference.inferEntryPos({
  word: "evaluate",
  meaning: "評估",
  type: "word"
}, {
  wordPosLookup: new Map([["evaluate", ["verb"]]])
}).pos, "verb");

assert.strictEqual(inference.inferEntryPos({
  word: "comfortable",
  meaning: "舒服的",
  type: "word"
}).pos, "adjective");

assert.strictEqual(inference.inferEntryPos({
  word: "usually",
  meaning: "通常",
  type: "word"
}).pos, "adverb");

assert.strictEqual(inference.inferEntryPos({
  word: "a",
  meaning: "一連串的",
  type: "word"
}).pos, "");

assert.strictEqual(inference.inferEntryPos({
  word: "abruptly",
  meaning: "突然",
  type: "word"
}).pos, "adverb");

assert.strictEqual(inference.inferEntryPos({
  word: "look for",
  meaning: "尋找",
  type: "phrase"
}).pos, "");

assert.strictEqual(inference.normalizeType("", "look for"), "phrase");

console.log("vocab_pos_inference tests passed");
