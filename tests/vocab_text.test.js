const assert = require("assert");
const fs = require("fs");
const path = require("path");

const vocabText = require("../vocab_text.js");
const teacherVocab = require("../teacher_vocab.js");
const teacherLiveVocab = require("../teacher_live_vocab.js");
const vocabSenseBank = require("../vocab_sense_bank.js");
const vocabAudio = require("../vocab_audio.js");
const vocabData = require("../vocab_data.js");

assert.strictEqual(vocabText.canonicalizeHeadword("have been + V-ing"), "have been ving");
assert.strictEqual(vocabText.canonicalizeHeadword("have been + pp"), "have been pp");
assert.strictEqual(vocabText.canonicalizeHeadword("for+時間"), "for 時間");
assert.strictEqual(vocabText.canonicalizeHeadword("M+ Museum"), "M Plus Museum");
assert.strictEqual(vocabText.normalizeHeadword("  HAVE BEEN + V-ING  "), "have been ving");

const liveEntry = teacherLiveVocab.normalizeEntry({
  word: "have been + V-ing",
  display: "have been + V-ing",
  meaning: "一直在...",
  pos: "auxiliary",
  type: "pattern"
});
assert.strictEqual(liveEntry.word, "have been ving");
assert.strictEqual(liveEntry.display, "have been ving");

assert.strictEqual(vocabAudio.getCacheKey("have been + V-ing"), "have been ving");

const savedEntry = vocabData.normalizeItem({
  word: "have been + V-ing",
  meaning: "一直在...",
  pos: "auxiliary",
  type: "pattern",
  source: "curated-sense-bank"
});
assert.ok(savedEntry);
assert.strictEqual(savedEntry.word, "have been ving");

const oldSpellingMatches = vocabSenseBank.lookup("have been + V-ing");
assert.ok(oldSpellingMatches.some((entry) => entry.word === "have been ving"));

const haveBeenPpMatches = teacherVocab.lookupStudentReady("have been + pp", {
  exactOnly: true,
  limit: 10
});
assert.strictEqual(haveBeenPpMatches.length, 1);
assert.strictEqual(haveBeenPpMatches[0].pos, "verb");
assert.strictEqual(haveBeenPpMatches[0].type, "pattern");
assert.strictEqual(
  teacherVocab.getEntryLabel(haveBeenPpMatches[0]),
  "v. 一直被 / 已經被"
);
assert.deepStrictEqual(vocabSenseBank.lookup("have been pp", { includeHidden: true }), []);

const visibleEntries = [
  ...teacherVocab.entries,
  ...vocabSenseBank.cleanEntries.filter((entry) => !entry.hidden)
];
visibleEntries.forEach((entry) => {
  assert.ok(!String(entry.word || "").includes("+"), `word still contains +: ${entry.word}`);
  assert.ok(!String(entry.display || "").includes("+"), `display still contains +: ${entry.display}`);
});

const senseBankSource = fs.readFileSync(path.join(__dirname, "..", "vocab_sense_bank.js"), "utf8");
assert.ok(
  !/^\s*\["[^"\n]*\+[^"\n]*"/m.test(senseBankSource),
  "source sense-bank headwords must not contain +"
);

console.log("vocab_text tests passed");
