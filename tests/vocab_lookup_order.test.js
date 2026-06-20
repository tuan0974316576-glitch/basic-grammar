const assert = require("assert");

delete require.cache[require.resolve("../teacher_vocab.js")];
delete require.cache[require.resolve("../vocab_sense_bank.js")];
delete require.cache[require.resolve("../cc_cedict_supplement.js")];
delete require.cache[require.resolve("../cc_cedict_reverse.js")];
delete require.cache[require.resolve("../vocab_lookup.js")];

const teacherVocab = require("../teacher_vocab.js");
const senseBank = require("../vocab_sense_bank.js");
const cedict = require("../cc_cedict_supplement.js");
const reverseCedict = require("../cc_cedict_reverse.js");
const vocabLookup = require("../vocab_lookup.js");

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

function normalizeMeaningGroupKey(value = "") {
  return teacherVocab.normalizeMeaning(value)
    .replace(/[（）()「」『』]/g, "")
    .replace(/[的地]$/g, "")
    .replace(/[\s/／]+/g, "")
    .toLowerCase();
}

function providers(options = {}) {
  return {
    getLiveTeacherMatches(word) {
      return liveTeacherEntries.filter((entry) => (
        !entry.disabled
        && teacherVocab.normalizeWord(entry.word) === teacherVocab.normalizeWord(word)
      ));
    },
    shouldFetchLiveTeacher: () => Boolean(options.fetchLiveTeacher),
    fetchLiveTeacherMatches(word) {
      if (teacherVocab.normalizeWord(word) !== "same-day-word") return [];
      return [
        {
          id: "live-same-day-word",
          word: "same-day-word",
          meaning: "即日新增字",
          pos: "noun",
          type: "word"
        }
      ];
    },
    getCuratedMatches(word) {
      return senseBank.lookup(word, { limit: 12 });
    },
    getTeacherMatches(word) {
      return teacherVocab.lookup(word, { exactOnly: true, limit: 10 });
    },
    getCcCedictSupplementMatches(word) {
      return cedict.lookup(word, { limit: 12 });
    },
    getCcCedictReverseMatches(word) {
      return reverseCedict.lookup(word, { limit: 8 });
    }
  };
}

function lookupForStudent(word, options = {}) {
  return vocabLookup.buildLookupMatches(word, providers(options), {
    normalizeWord: teacherVocab.normalizeWord,
    normalizeMeaningGroupKey,
    getEntryPos: entryPos
  });
}

(async () => {
  assert.deepStrictEqual(
    (await lookupForStudent("look up")).map((entry) => `${entry.type}:${entry.meaning}:${entry.source}`),
    ["phrase:查閱 / 查字典:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("work")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:工作:curated-sense-bank",
      "noun:作品:curated-sense-bank",
      "verb:工作 / 做事:curated-sense-bank",
      "verb:運作 / 奏效:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hawker")).map((entry) => `${entryPos(entry)}:${entry.meaning}:${entry.source}`),
    ["noun:小販:teacher"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Mong Kok")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:旺角:cc-cedict-supplement"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bacon")).map((entry) => `${entry.type}:${entry.meaning}:${entry.source}`),
    ["word:培根 / 煙肉:cc-cedict-reverse"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rule out")).map((entry) => `${entry.pos || entry.type}:${entry.meaning}:${entry.source}`),
    ["verb:排除:cc-cedict-reverse"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("corporate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:公司層面的:teacher-live"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("same-day-word", { fetchLiveTeacher: true })).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:即日新增字:teacher-live"]
  );

  assert.deepStrictEqual(await lookupForStudent("not a real class word"), []);

  console.log("vocab_lookup_order tests passed");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
