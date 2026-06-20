const assert = require("assert");

delete require.cache[require.resolve("../teacher_vocab.js")];
delete require.cache[require.resolve("../vocab_sense_bank.js")];
delete require.cache[require.resolve("../cc_cedict_supplement.js")];
delete require.cache[require.resolve("../cc_cedict_reverse.js")];

const teacherVocab = require("../teacher_vocab.js");
const senseBank = require("../vocab_sense_bank.js");
const cedict = require("../cc_cedict_supplement.js");
const reverseCedict = require("../cc_cedict_reverse.js");

const liveTeacherEntries = [
  {
    id: "live-corporate-company",
    word: "corporate",
    meaning: "公司層面的",
    pos: "adjective",
    type: "word",
    source: "teacher-live"
  },
  {
    id: "live-disabled-corporate",
    word: "corporate",
    meaning: "已停用的錯解釋",
    pos: "adjective",
    type: "word",
    source: "teacher-live",
    disabled: true
  }
];

reverseCedict.seed([
  { id: "ccr-bacon", word: "bacon", meaning: "培根 / 煙肉", type: "word" },
  { id: "ccr-rule-out", word: "rule out", meaning: "排除", pos: "verb", type: "phrase" }
]);

function entryPos(entry = {}) {
  return teacherVocab.normalizePos(entry.pos || entry.inferredPos) || "";
}

function dedupe(matches = []) {
  const seen = new Set();
  return matches.filter((entry) => {
    const key = [
      teacherVocab.normalizeWord(entry.word),
      entryPos(entry),
      String(entry.type || "").trim().toLowerCase(),
      teacherVocab.normalizeMeaning(entry.meaning)
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function lookupForStudent(word) {
  const liveMatches = liveTeacherEntries.filter((entry) => (
    !entry.disabled
    && teacherVocab.normalizeWord(entry.word) === teacherVocab.normalizeWord(word)
  ));
  if (liveMatches.length) return dedupe(liveMatches).slice(0, 12);

  const curatedMatches = senseBank.lookup(word, { limit: 12 }).map((entry) => ({
    ...entry,
    source: entry.source || "curated-sense-bank"
  }));
  const curatedOverrideMatches = curatedMatches.filter((entry) => entry.overrideTeacher);
  if (curatedOverrideMatches.length) return dedupe(curatedOverrideMatches).slice(0, 12);

  const teacherMatches = teacherVocab.lookup(word, { exactOnly: true, limit: 10 });
  if (teacherMatches.length) {
    return dedupe(teacherMatches.map((entry) => ({
      ...entry,
      source: entry.source || "teacher"
    }))).slice(0, 12);
  }

  if (curatedMatches.length) return dedupe(curatedMatches).slice(0, 12);
  const cedictMatches = dedupe(cedict.lookup(word, { limit: 12 })).slice(0, 12);
  if (cedictMatches.length) return cedictMatches;
  return dedupe(reverseCedict.lookup(word, { limit: 8 })).slice(0, 8);
}

assert.deepStrictEqual(
  lookupForStudent("look up").map((entry) => `${entry.type}:${entry.meaning}:${entry.source}`),
  ["phrase:查閱 / 查字典:curated-sense-bank"]
);

assert.deepStrictEqual(
  lookupForStudent("work").map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
  [
    "noun:工作:curated-sense-bank",
    "noun:作品:curated-sense-bank",
    "verb:工作 / 做事:curated-sense-bank",
    "verb:運作 / 奏效:curated-sense-bank"
  ]
);

assert.deepStrictEqual(
  lookupForStudent("hawker").map((entry) => `${entryPos(entry)}:${entry.meaning}:${entry.source}`),
  ["noun:小販:teacher"]
);

assert.deepStrictEqual(
  lookupForStudent("Mong Kok").map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
  ["noun:旺角:cc-cedict-supplement"]
);

assert.deepStrictEqual(
  lookupForStudent("bacon").map((entry) => `${entry.type}:${entry.meaning}:${entry.source}`),
  ["word:培根 / 煙肉:cc-cedict-reverse"]
);

assert.deepStrictEqual(
  lookupForStudent("rule out").map((entry) => `${entry.pos || entry.type}:${entry.meaning}:${entry.source}`),
  ["verb:排除:cc-cedict-reverse"]
);

assert.deepStrictEqual(
  lookupForStudent("corporate").map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
  ["adjective:公司層面的:teacher-live"]
);

assert.deepStrictEqual(lookupForStudent("not a real class word"), []);

console.log("vocab_lookup_order tests passed");
