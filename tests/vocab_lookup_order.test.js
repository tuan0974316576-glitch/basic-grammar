const assert = require("assert");

global.window = globalThis;
delete require.cache[require.resolve("../grammar_verb_table_data.js")];
require("../grammar_verb_table_data.js");
delete require.cache[require.resolve("../teacher_vocab.js")];
delete require.cache[require.resolve("../vocab_sense_bank.js")];
delete require.cache[require.resolve("../cc_cedict_supplement.js")];
delete require.cache[require.resolve("../vocab_lookup.js")];

const teacherVocab = require("../teacher_vocab.js");
const senseBank = require("../vocab_sense_bank.js");
const cedict = require("../cc_cedict_supplement.js");
const vocabLookup = require("../vocab_lookup.js");

const liveTeacherEntries = [
  {
    id: "live-corporate-company",
    word: "corporate",
    meaning: "公司層面的",
    pos: "adjective",
    type: "word",
    level: "B1",
    source: "teacher-live"
  },
  {
    id: "live-disabled-corporate",
    word: "corporate",
    meaning: "已停用的錯解釋",
    pos: "adjective",
    type: "word",
    level: "B1",
    source: "teacher-live",
    disabled: true
  },
  {
    id: "live-duplicate-first",
    word: "live-duplicate",
    meaning: "已審查意思",
    pos: "noun",
    type: "word",
    level: "B1",
    source: "teacher-live"
  },
  {
    id: "live-duplicate-second",
    word: "live-duplicate",
    meaning: "已審查意思",
    pos: "noun",
    type: "word",
    level: "B1",
    source: "teacher-live"
  }
];

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
      )).map((entry) => entry.source === "teacher-live" ? entry : { ...entry, source: "teacher-live" });
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
          type: "word",
          level: "B1"
        }
      ];
    },
    getCuratedMatches(word) {
      return senseBank.lookup(word, { limit: 12, includeHidden: true });
    },
    getTeacherMatches(word) {
      return teacherVocab.lookupStudentReady(word, { exactOnly: true, limit: 10 });
    },
    getCcCedictSupplementMatches(word) {
      return cedict.lookup(word, { limit: 12 });
    },
    getCcCedictReverseMatches() {
      throw new Error("Student lookup must not call raw CC-CEDICT reverse fallback.");
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

function assertStudentLookupContract(word, matches) {
  const approvedSources = new Set([
    "teacher-live",
    "teacher",
    "curated-sense-bank",
    "mock-unseen-mt35-paper3-reviewed",
    "mock-unseen-mt38-paper3-reviewed",
    "mock-unseen-mt42-paper3-reviewed",
    "mock-unseen-mt45-paper3-reviewed",
    "mock-unseen-mt49-paper3-reviewed",
    "mock-unseen-mt52-paper3-reviewed",
    "mock-unseen-mt56-paper3-reviewed",
    "mock-unseen-mt59-paper3-reviewed",
    "mock-unseen-mt20-paper3-reviewed",
    "mock-unseen-mt22-paper3-reviewed",
    "mock-unseen-mt25-paper3-reviewed",
    "mock-unseen-mt27-paper3-reviewed",
    "mock-unseen-mt16-paper3-reviewed",
    "mock-unseen-mt18-paper3-reviewed",
    "mock-unseen-mt19-paper3-reviewed",
    "mock-unseen-mt21-paper3-reviewed",
    "mock-unseen-mt23-paper3-reviewed",
    "mock-unseen-mt24-paper3-reviewed",
    "mock-unseen-mt26-paper3-reviewed",
    "mock-unseen-mt28-paper3-reviewed",
    "mock-unseen-mt29-paper3-reviewed",
    "mock-unseen-mt31-paper3-reviewed",
    "mock-unseen-mt33-paper3-reviewed",
    "mock-unseen-mt34-paper3-reviewed",
    "mock-unseen-mt36-paper3-reviewed",
    "mock-unseen-mt39-paper3-reviewed",
    "mock-unseen-mt41-paper3-reviewed",
    "mock-unseen-mt43-paper3-reviewed",
    "mock-unseen-mt46-paper3-reviewed",
    "mock-unseen-mt48-paper3-reviewed",
    "mock-unseen-mt50-paper3-reviewed",
    "mock-unseen-mt53-paper3-reviewed",
    "mock-unseen-mt87-paper3-reviewed",
    "mock-unseen-mt63-paper3-reviewed",
    "mock-unseen-mt66-paper3-reviewed",
    "mock-unseen-mt70-paper3-reviewed",
    "mock-unseen-mt73-paper3-reviewed",
    "mock-unseen-mt77-paper3-reviewed",
    "mock-unseen-mt80-paper3-reviewed",
    "mock-unseen-mt84-paper3-reviewed",
    "mock-unseen-mt32-paper3-reviewed",
    "mock-unseen-mt30-paper3-reviewed",
    "mock-unseen-mt9-paper3-reviewed",
    "mock-unseen-mt10-paper3-reviewed",
    "mock-unseen-mt11-paper3-reviewed",
    "mock-unseen-mt12-paper3-reviewed",
    "mock-unseen-mt13-paper3-reviewed",
    "mock-unseen-mt14-paper3-reviewed",
    "mock-unseen-mt15-paper3-reviewed",
    "mock-unseen-mt37-paper3-reviewed",
    "mock-unseen-mt40-paper3-reviewed",
    "mock-unseen-mt44-paper3-reviewed",
    "mock-unseen-mt47-paper3-reviewed",
    "mock-unseen-mt51-paper3-reviewed",
    "mock-unseen-mt54-paper3-reviewed",
    "mock-unseen-mt57-paper3-reviewed",
    "mock-unseen-mt58-paper3-reviewed",
    "mock-unseen-mt30-paper2-reviewed",
    "mock-unseen-mt32-paper2-reviewed",
    "mock-unseen-mt35-paper2-reviewed",
    "mock-unseen-mt38-paper2-reviewed",
    "mock-unseen-mt42-paper2-reviewed",
    "mock-unseen-mt45-paper2-reviewed",
    "mock-unseen-mt49-paper2-reviewed",
    "mock-unseen-mt52-paper2-reviewed",
    "mock-unseen-mt56-paper2-reviewed",
    "mock-unseen-mt58-paper2-reviewed",
    "mock-unseen-mt61-paper2-reviewed",
    "mock-unseen-mt65-paper2-reviewed",
    "mock-unseen-mt68-paper2-reviewed",
    "mock-unseen-mt72-paper2-reviewed",
    "mock-unseen-mt75-paper2-reviewed",
    "mock-unseen-mt79-paper2-reviewed",
    "mock-unseen-mt82-paper2-reviewed",
    "mock-unseen-mt59-paper2-reviewed",
    "mock-unseen-mt63-paper2-reviewed",
    "mock-unseen-mt66-paper2-reviewed",
    "mock-unseen-mt70-paper2-reviewed",
    "mock-unseen-mt73-paper2-reviewed",
    "mock-unseen-mt77-paper2-reviewed",
    "mock-unseen-mt80-paper2-reviewed",
    "mock-unseen-mt84-paper2-reviewed",
    "mock-unseen-mt87-paper2-reviewed",
    "mock-unseen-mt9-paper2-reviewed",
    "mock-unseen-mt10-paper2-reviewed",
    "mock-unseen-mt11-paper2-reviewed",
    "mock-unseen-mt12-paper2-reviewed",
    "mock-unseen-mt13-paper2-reviewed",
    "mock-unseen-mt14-paper2-reviewed",
    "mock-unseen-mt15-paper2-reviewed",
    "mock-unseen-mt16-paper2-reviewed",
    "mock-unseen-mt17-paper2-reviewed",
    "mock-unseen-mt18-paper2-reviewed",
    "mock-unseen-mt19-paper2-reviewed",
    "mock-unseen-mt20-paper2-reviewed",
    "mock-unseen-mt21-paper2-reviewed",
    "mock-unseen-mt22-paper2-reviewed",
    "mock-unseen-mt23-paper2-reviewed",
    "mock-unseen-mt24-paper2-reviewed",
    "mock-unseen-mt25-paper2-reviewed",
    "mock-unseen-mt26-paper2-reviewed",
    "mock-unseen-mt27-paper2-reviewed",
    "mock-unseen-mt31-paper2-reviewed",
    "mock-unseen-mt28-paper2-reviewed",
    "mock-unseen-mt29-paper2-reviewed",
    "mock-unseen-mt33-paper2-reviewed",
    "mock-unseen-mt34-paper2-reviewed",
    "mock-unseen-mt36-paper2-reviewed",
    "mock-unseen-mt39-paper2-reviewed",
    "mock-unseen-mt41-paper2-reviewed",
    "mock-unseen-mt43-paper2-reviewed",
    "mock-unseen-mt46-paper2-reviewed",
    "mock-unseen-mt48-paper2-reviewed",
    "mock-unseen-mt50-paper2-reviewed",
    "mock-unseen-mt51-paper2-reviewed",
    "mock-unseen-mt54-paper2-reviewed",
    "mock-unseen-mt58-paper2-reviewed",
    "mock-unseen-mt61-paper2-reviewed",
    "mock-unseen-mt65-paper2-reviewed",
    "mock-unseen-mt68-paper2-reviewed",
    "mock-unseen-mt72-paper2-reviewed",
    "mock-unseen-mt75-paper2-reviewed",
    "mock-unseen-mt79-paper2-reviewed",
    "mock-unseen-mt82-paper2-reviewed",
    "mock-unseen-mt53-paper2-reviewed",
    "mock-unseen-mt55-paper2-reviewed",
    "mock-unseen-mt57-paper2-reviewed",
    "mock-unseen-mt60-paper2-reviewed",
    "mock-unseen-mt62-paper2-reviewed",
    "mock-unseen-mt64-paper2-reviewed",
    "mock-unseen-mt67-paper2-reviewed",
    "mock-unseen-mt69-paper2-reviewed",
    "mock-unseen-mt71-paper2-reviewed",
    "mock-unseen-mt74-paper2-reviewed",
    "mock-unseen-mt76-paper2-reviewed",
    "mock-unseen-mt78-paper2-reviewed",
    "mock-unseen-mt81-paper2-reviewed",
    "mock-unseen-mt83-paper2-reviewed",
    "mock-unseen-mt85-paper2-reviewed",
    "mock-unseen-mt86-paper2-reviewed",
    "mock-unseen-mt88-paper2-reviewed",
    "mock-unseen-mt37-paper2-reviewed",
    "mock-unseen-mt40-paper2-reviewed",
    "mock-unseen-mt44-paper2-reviewed",
    "mock-unseen-mt47-paper2-reviewed",
    "mock-unseen-mt90-paper2-reviewed",
    "mock-unseen-mt15-paper1-reviewed",
    "mock-unseen-mt17-paper1-reviewed",
    "mock-unseen-mt20-paper1-reviewed",
    "mock-unseen-mt22-paper1-reviewed",
    "mock-unseen-mt25-paper1-reviewed",
    "mock-unseen-mt27-paper1-reviewed",
    "mock-unseen-mt30-paper1-reviewed",
    "mock-unseen-mt32-paper1-reviewed",
    "mock-unseen-mt35-paper1-reviewed",
    "mock-unseen-mt38-paper1-reviewed",
    "mock-unseen-mt42-paper1-reviewed",
    "mock-unseen-mt45-paper1-reviewed",
    "mock-unseen-mt49-paper1-reviewed",
    "mock-unseen-mt52-paper1-reviewed",
    "mock-unseen-mt56-paper1-reviewed",
    "mock-unseen-mt59-paper1-reviewed",
    "mock-unseen-mt63-paper1-reviewed",
    "mock-unseen-mt66-paper1-reviewed",
    "mock-unseen-mt87-paper1-reviewed",
    "mock-unseen-mt70-paper1-reviewed",
    "mock-unseen-mt73-paper1-reviewed",
    "mock-unseen-mt77-paper1-reviewed",
    "mock-unseen-mt80-paper1-reviewed",
    "mock-unseen-mt84-paper1-reviewed",
    "verb-table-form",
    "cc-cedict-supplement"
  ]);
  matches.forEach((entry) => {
    assert.ok(
      approvedSources.has(entry.source),
      `${word} used unapproved source: ${entry.source || "(none)"}`
    );
    assert.ok(
      teacherVocab.normalizeMeaning(entry.meaning),
      `${word} returned an empty meaning`
    );
    assert.ok(
      !/待老師|unknown|undefined|null/i.test(String(entry.meaning || "")),
      `${word} returned a placeholder/noisy meaning: ${entry.meaning}`
    );
    assert.ok(
      entry.type === "pattern" || entryPos(entry),
      `${word} returned a selectable entry without POS: ${JSON.stringify(entry)}`
    );
    assert.ok(
      /^(A1|A2|B1|B2|C1|C2)$/.test(String(entry.level || "")),
      `${word} returned a selectable entry without valid level: ${JSON.stringify(entry)}`
    );
    assert.notStrictEqual(entry.source, "offline-dictionary");
    assert.notStrictEqual(entry.source, "cc-cedict-reverse");
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
    (await lookupForStudent("about")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "preposition:關於:curated-sense-bank",
      "adverb:大約:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("drop")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:掉下 / 放下:curated-sense-bank",
      "verb:下降 / 減少:curated-sense-bank",
      "noun:一滴:curated-sense-bank",
      "noun:下降:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("strong")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:強壯的:curated-sense-bank",
      "adjective:強烈的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("wave")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:波浪:curated-sense-bank",
      "noun:揮手:curated-sense-bank",
      "verb:揮手:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("check")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:檢查:curated-sense-bank",
      "noun:檢查:curated-sense-bank",
      "noun:賬單:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("break")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:打破:curated-sense-bank",
      "verb:弄壞:curated-sense-bank",
      "noun:小休 / 休息:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("broke")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:打破 / 折斷 / 損壞（break 過去式）:verb-table-form"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("broken")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:壞了的 / 破碎的:curated-sense-bank",
      "verb:打破 / 折斷 / 損壞（break PP）:verb-table-form"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("breaking")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:打破 / 折斷 / 損壞（break ING）:verb-table-form"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("power")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:力量:curated-sense-bank",
      "noun:能力:curated-sense-bank",
      "noun:權力:curated-sense-bank",
      "noun:電力:curated-sense-bank",
      "verb:為...提供動力:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("physical")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:身體的:curated-sense-bank",
      "adjective:物理的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("physical force")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:武力 / 身體力量:mock-unseen-mt46-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("condoning")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["condone:verb:縱容 / 默許:mock-unseen-mt46-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("space suit")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["spacesuit:noun:太空衣:mock-unseen-mt46-paper2-reviewed"]
  );

  assert.ok(
    (await lookupForStudent("acknowledge")).some((entry) => (
      entry.pos === "verb" &&
      entry.meaning === "向...打招呼 / 理會" &&
      entry.source === "mock-unseen-mt46-paper2-reviewed"
    )),
    "Expected MT46 acknowledge sense for neighbours/community context"
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gap year")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:空檔年 / 升學前休學一年:mock-unseen-mt48-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("standardised tests")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["standardized test:phrase:noun:標準化考試:mock-unseen-mt48-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("denigrated")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["denigrate:verb:貶低 / 詆毀:mock-unseen-mt48-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("horseless carriage")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:無馬車 / 早期汽車:mock-unseen-mt48-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("white water rafting")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["white-water rafting:phrase:noun:激流泛舟:mock-unseen-mt50-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("communal rubbish bins")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["communal rubbish bin:phrase:noun:公用垃圾桶:mock-unseen-mt50-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("unsupervised")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:無人看管的 / 無人監督的:mock-unseen-mt50-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("grass is greener on the other side")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:總覺得別人的較好:mock-unseen-mt50-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("emotional baggage")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:情感包袱 / 心理負擔:mock-unseen-mt50-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("meat-free days")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["meat-free day:phrase:noun:無肉日 / 素食日:mock-unseen-mt51-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("game developers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["game developer:phrase:noun:遊戲開發者:mock-unseen-mt51-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("four day workweeks")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["four-day workweek:phrase:noun:四天工作週:mock-unseen-mt51-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("across the board")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["across the board:phrase:adverb:全面地 / 涉及所有方面:mock-unseen-mt51-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("club merchandise")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["club merchandise:phrase:noun:球會商品 / 俱樂部商品:mock-unseen-mt51-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("magic potions")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["magic potion:phrase:noun:魔法藥水:mock-unseen-mt51-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("falling back on")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fall back on:phrase:verb:依靠作後備 / 退而依靠:mock-unseen-mt51-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in situ")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["in situ:phrase:adverb:在原本位置 / 在現場:mock-unseen-mt51-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("art heists")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["art heist:phrase:noun:藝術品盜竊案:mock-unseen-mt51-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ripped apart")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["rip apart:phrase:verb:撕裂 / 扯爛:mock-unseen-mt51-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("beyond the shadow of a doubt")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["beyond the shadow of a doubt:phrase:adverb:毫無疑問地 / 證據確鑿地:mock-unseen-mt51-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flat earthers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["flat-earther:phrase:noun:地平說支持者:mock-unseen-mt51-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dry ice")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["dry ice:phrase:noun:乾冰:mock-unseen-mt54-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("meet and greet session")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["meet-and-greet:phrase:noun:見面交流環節 / 見面會:mock-unseen-mt54-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("right up our alley")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["right up one's alley:phrase:adjective:非常適合某人 / 正合某人興趣:mock-unseen-mt54-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pull it off")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["pull off:phrase:verb:成功做到 / 成功完成難事:mock-unseen-mt54-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("by way of compensation")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["by way of compensation:phrase:adverb:作為補償:mock-unseen-mt54-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("underwater scenes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["underwater scene:phrase:noun:水底場景 / 水底戲份:mock-unseen-mt54-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("animated gifs")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["animated GIF:phrase:noun:動態 GIF 圖:mock-unseen-mt57-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("funds to clear")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["funds clear:phrase:verb:款項入帳 / 資金結算完成:mock-unseen-mt57-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("IP theft")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["IP theft:phrase:noun:知識產權盜竊 / 盜用創作:mock-unseen-mt57-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("disable right-click")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["disable right-click:phrase:verb:停用右鍵功能:mock-unseen-mt57-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("lock-in contracts")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["lock-in contract:phrase:noun:綁定合約 / 長期綁約:mock-unseen-mt57-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("go the extra mile")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["go the extra mile:phrase:verb:多走一步 / 額外付出:mock-unseen-mt57-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sous chef")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["sous chef:phrase:noun:副主廚:mock-unseen-mt57-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("junk mail")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["junk mail:phrase:noun:垃圾郵件 / 垃圾宣傳郵件:mock-unseen-mt57-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Paralympic Games")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Paralympics:word:noun:殘疾人奧運會 / 殘奧會:mock-unseen-mt58-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("beat the odds")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["beat the odds:phrase:verb:逆境取勝 / 克服困難成功:mock-unseen-mt58-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("VIP areas")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["VIP area:phrase:noun:貴賓區:mock-unseen-mt58-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("false advertising")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["false advertising:phrase:noun:虛假廣告:mock-unseen-mt58-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("low-income families")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["low-income family:phrase:noun:低收入家庭:mock-unseen-mt54-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dye her hair")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["dye one's hair:phrase:verb:染髮:mock-unseen-mt54-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flicking through")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["flick through:phrase:verb:快速翻閱:mock-unseen-mt54-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("staff turnover")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["staff turnover:phrase:noun:員工流失率:mock-unseen-mt54-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("car parking spaces")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["car parking space:phrase:noun:汽車泊車位:mock-unseen-mt54-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cover versions")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["cover version:phrase:noun:翻唱版本:mock-unseen-mt54-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("virtual assistants")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["virtual assistant:phrase:noun:虛擬助理:mock-unseen-mt54-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("idolizing celebrities")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["idolize celebrities:phrase:verb:崇拜名人 / 追星:mock-unseen-mt54-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("live life to the fullest")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["live life to the fullest:phrase:verb:盡情生活 / 充實地生活:mock-unseen-mt54-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("water resources")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["water resource:phrase:noun:水資源:mock-unseen-mt58-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("work-life balance")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["work-life balance:phrase:noun:工作與生活平衡:mock-unseen-mt58-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Shek O")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Shek O:phrase:noun:石澳:mock-unseen-mt58-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("online gaming")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["online gaming:phrase:noun:網上遊戲:mock-unseen-mt58-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("the Bund")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["the Bund:phrase:noun:外灘:mock-unseen-mt58-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("broaden horizons")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["broaden one's horizons:phrase:verb:擴闊眼界:mock-unseen-mt58-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("poetry festivals")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["poetry festival:phrase:noun:詩歌節:mock-unseen-mt58-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("subdivided apartments")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["sub-divided apartment:phrase:noun:劏房:mock-unseen-mt58-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("drifting apart")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["drift apart:phrase:verb:逐漸疏遠:mock-unseen-mt58-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("student orientation sessions")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["student orientation session:phrase:noun:學生迎新活動 / 新生簡介會:mock-unseen-mt61-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("familiarize yourself with")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["familiarize oneself with:phrase:verb:熟悉 / 了解:mock-unseen-mt61-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("annual fundraising gala")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["annual fundraising gala:phrase:noun:年度籌款晚會:mock-unseen-mt61-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("throwing a tantrum")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["throw a tantrum:phrase:verb:發脾氣 / 發怒:mock-unseen-mt61-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Styrofoam boxes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Styrofoam box:phrase:noun:發泡膠盒:mock-unseen-mt61-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("poetry translators")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["poetry translator:phrase:noun:詩歌翻譯員:mock-unseen-mt61-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sports podcast hosts")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["sports podcast host:phrase:noun:體育 podcast 主持:mock-unseen-mt61-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("classical music concerts")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["classical music concert:phrase:noun:古典音樂會:mock-unseen-mt61-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("as nervous as a mouse")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["as nervous as a mouse:phrase:adjective:非常緊張的:mock-unseen-mt61-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("have faith in yourself")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["have faith in oneself:phrase:verb:對自己有信心:mock-unseen-mt61-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("immersive cinemas")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["immersive cinema:phrase:noun:沉浸式影院 / 沉浸式電影體驗:mock-unseen-mt65-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("scene stealing")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["scene-stealing:phrase:adjective:搶鏡的:mock-unseen-mt65-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("carried out maintenance")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["carry out maintenance:phrase:verb:進行維修 / 保養:mock-unseen-mt65-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("scalded")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["scald:word:verb:燙傷:mock-unseen-mt65-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fairy godmothers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fairy godmother:phrase:noun:仙女教母:mock-unseen-mt65-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("aced the interview")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["ace the interview:phrase:verb:面試表現出色 / 成功通過面試:mock-unseen-mt65-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("proposed mergers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["proposed merger:phrase:noun:擬議合併 / 建議中的合併:mock-unseen-mt65-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("signup day")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["sign-up day:phrase:noun:報名日 / 招生日:mock-unseen-mt68-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("veterinary assistants")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["veterinary assistant:phrase:noun:獸醫助理:mock-unseen-mt68-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("elephant in the room")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["elephant in the room:phrase:noun:明顯但大家避談的問題:mock-unseen-mt68-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hotly contested")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["hotly contested:phrase:adjective:競爭激烈的:mock-unseen-mt68-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("faced up to")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["face up to:phrase:verb:勇敢面對:mock-unseen-mt68-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("truth dawned on")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["truth dawns on:phrase:verb:真相逐漸明白 / 恍然大悟:mock-unseen-mt68-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("on condition that")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["on condition that:phrase:conjunction:條件是 / 只要:mock-unseen-mt68-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("LCSD")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Leisure and Cultural Services Department:phrase:noun:康樂及文化事務署:mock-unseen-mt72-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("school-wide ban")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["schoolwide ban:phrase:noun:全校禁令:mock-unseen-mt72-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("combating cheating")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["combat cheating:phrase:verb:打擊作弊:mock-unseen-mt72-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("got hooked on")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["get hooked on:phrase:verb:對...上癮 / 迷上:mock-unseen-mt72-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("G force")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["g-force:phrase:noun:重力加速度 / G力:mock-unseen-mt72-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("beheld")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["behold:word:verb:看見 / 注視:mock-unseen-mt72-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in unison")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["in unison:phrase:adverb:齊聲地 / 一致地:mock-unseen-mt72-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("environment clubs")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Environment Club:phrase:noun:環保學會 / 環境保護學會:mock-unseen-mt75-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("community recycling program")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["community recycling programme:phrase:noun:社區回收計劃:mock-unseen-mt75-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("high-level athletes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["high-level athlete:phrase:noun:高水平運動員:mock-unseen-mt75-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("deferred dreams")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["dream deferred:phrase:noun:被延遲的夢想 / 暫時擱置的夢想:mock-unseen-mt75-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("out of my control")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["out of one's control:phrase:adjective:不受某人控制的:mock-unseen-mt75-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("works in progress")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["work in progress:phrase:noun:未完成作品 / 進行中的作品:mock-unseen-mt75-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("global food festivals")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Global Food Festival:phrase:noun:環球美食節:mock-unseen-mt79-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("air quality indexes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["air quality index:phrase:noun:空氣質素指數:mock-unseen-mt79-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Zambian rock")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Zamrock:word:noun:贊比亞搖滾樂:mock-unseen-mt79-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("put together their teams")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["put together a team:phrase:verb:組成隊伍:mock-unseen-mt79-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("arguing in favor of")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["argue in favour of:phrase:verb:支持...而辯論 / 主張:mock-unseen-mt79-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("up and coming artists")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["up-and-coming artist:phrase:noun:新晉藝術家:mock-unseen-mt79-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Random Acts of Kindness Week")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["random act of kindness:phrase:noun:隨機善舉 / 小小善行:mock-unseen-mt82-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("plant based alternatives")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["plant-based alternative:phrase:noun:植物性替代品:mock-unseen-mt82-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("paid lip service to")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["pay lip service to:phrase:verb:口頭上支持 / 只是口講重視:mock-unseen-mt82-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("trafficked animals")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["traffic animals:phrase:verb:販運動物:mock-unseen-mt82-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("wildlife organisations")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["wildlife organization:phrase:noun:野生動物保護組織:mock-unseen-mt82-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("new town plaza")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["New Town Plaza:phrase:noun:新城市廣場:mock-unseen-mt82-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("state of mind")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:心境 / 思想狀態:mock-unseen-mt53-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stretch your legs")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["stretch one's legs:phrase:verb:活動一下腿腳 / 走動一下:mock-unseen-mt53-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("marketing gimmick")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:營銷噱頭:mock-unseen-mt53-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("well versed in")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:熟悉...的 / 精通...的:mock-unseen-mt53-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("intimidated")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:感到受恐嚇的 / 感到害怕的:mock-unseen-mt53-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("up for grabs")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:可供爭奪的 / 有機會得到的:mock-unseen-mt55-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("few and far between")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:寥寥可數的 / 很少見的:mock-unseen-mt55-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("strike out on my own")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["strike out on one's own:phrase:verb:獨立發展 / 自己創業:mock-unseen-mt55-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("tranilizer dart")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["tranquilizer dart:phrase:noun:麻醉飛鏢:mock-unseen-mt55-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("inexplicable anomalies")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["inexplicable anomaly:phrase:noun:無法解釋的異常現象:mock-unseen-mt55-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("phone-free zones")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phone-free zone:phrase:noun:禁用手機區:mock-unseen-mt57-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("work under pressure")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:在壓力下工作:mock-unseen-mt57-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("eSports")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["e-sports:phrase:noun:電子競技 / 電競:mock-unseen-mt57-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("reading for pleasure")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:消閒閱讀 / 為興趣而閱讀:mock-unseen-mt57-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Reader's Theatre")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Reader's Theatre:phrase:noun:讀者劇場:mock-unseen-mt57-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("jam packed")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["jam-packed:phrase:adjective:擠滿人的 / 非常擠迫的:mock-unseen-mt60-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("money does not grow on trees")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:錢不是容易得來的 / 錢不會從天而降:mock-unseen-mt60-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("get in the way of")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:妨礙 / 阻礙:mock-unseen-mt60-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("posing as")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["pose as:phrase:verb:冒充 / 假扮成:mock-unseen-mt60-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("identity fraud")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:身份詐騙:mock-unseen-mt60-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pitching a tent")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["pitch a tent:phrase:verb:搭帳篷:mock-unseen-mt62-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hit on a good idea")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["hit on an idea:phrase:verb:偶然想到主意 / 想出點子:mock-unseen-mt62-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("one nil behind")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["one-nil behind:phrase:adjective:落後一比零的:mock-unseen-mt62-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("glued to screens")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["glued to a screen:phrase:adjective:長時間盯著螢幕的:mock-unseen-mt62-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in accordance with")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:preposition:根據 / 按照:mock-unseen-mt62-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("home crowd")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["home crowd:phrase:noun:本地觀眾 / 主場觀眾:mock-unseen-mt64-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cost effective")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["cost-effective:phrase:adjective:具成本效益的 / 合算的:mock-unseen-mt64-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fitted")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fit:verb:安裝:mock-unseen-mt64-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("put chai ko")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["put chai ko:phrase:noun:砵仔糕:mock-unseen-mt67-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hole in the wall eateries")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["hole-in-the-wall eatery:phrase:noun:細小不起眼的食店:mock-unseen-mt67-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("take out membership")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["take out membership:phrase:verb:申請會籍 / 辦理會員資格:mock-unseen-mt67-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("perpetually")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adverb:長期地 / 不斷地:mock-unseen-mt67-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("climate anxiety")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["climate anxiety:phrase:noun:氣候焦慮:mock-unseen-mt69-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("romance tropes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["romance trope:phrase:noun:愛情片套路:mock-unseen-mt69-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("booked appointments")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["book appointments:phrase:verb:預約 / 安排預約:mock-unseen-mt69-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("abandoned their pets")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["abandon a pet:phrase:verb:棄養寵物:mock-unseen-mt69-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("warehouse retailers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["warehouse retailer:phrase:noun:倉儲式零售商:mock-unseen-mt74-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("autonomous vehicles")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["autonomous vehicle:phrase:noun:自動駕駛車輛:mock-unseen-mt74-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ban mobile phones")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["ban mobile phones:phrase:verb:禁止使用手機:mock-unseen-mt74-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gratitude journal")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["gratitude journal:phrase:noun:感恩日記:mock-unseen-mt74-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("artistic license")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["artistic licence:phrase:noun:藝術加工 / 藝術創作自由:mock-unseen-mt71-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("AFCD")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Agriculture, Fisheries and Conservation Department:phrase:noun:漁農自然護理署:mock-unseen-mt71-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("marine reserves")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["marine reserve:phrase:noun:海岸公園 / 海洋保護區:mock-unseen-mt71-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("six-day working week")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["six-day working week:phrase:noun:六天工作週:mock-unseen-mt71-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("lose out on")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["lose out on:phrase:verb:錯失 / 失去...機會:mock-unseen-mt71-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Greater Bay Area")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Greater Bay Area:phrase:noun:大灣區:mock-unseen-mt76-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("facades")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["facade:word:noun:建築物正面 / 外牆:mock-unseen-mt76-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stress relief")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["stress relief:phrase:noun:減壓 / 舒緩壓力:mock-unseen-mt76-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("career pathways")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["career pathway:phrase:noun:職業路向 / 事業發展路徑:mock-unseen-mt76-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stay on top of")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["stay on top of:phrase:verb:掌握 / 妥善處理:mock-unseen-mt78-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("drone users")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["drone user:phrase:noun:無人機使用者:mock-unseen-mt78-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("have too much on your plate")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["have too much on one's plate:phrase:verb:有太多事情要處理:mock-unseen-mt78-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("antique shops")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["antique shop:phrase:noun:古董店:mock-unseen-mt78-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("wearable fitness trackers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["wearable fitness tracker:phrase:noun:穿戴式健身追蹤器:mock-unseen-mt81-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Hong Kong egg tarts")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Hong Kong egg tart:phrase:noun:港式蛋撻:mock-unseen-mt81-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("false alarms")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["false alarm:phrase:noun:誤報 / 假警報:mock-unseen-mt81-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bend the rules")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["bend the rules:phrase:verb:鑽規則空子 / 稍微違規:mock-unseen-mt81-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("couch potatoes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["couch potato:phrase:noun:經常坐著不動的人 / 懶散少動的人:mock-unseen-mt83-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("come out of her shell")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["come out of one's shell:phrase:verb:變得不再害羞 / 開始外向起來:mock-unseen-mt83-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("self-employed")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["self-employed:phrase:adjective:自僱的:mock-unseen-mt83-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("AI-generated work")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["AI-generated work:phrase:noun:人工智能生成的作品 / AI生成工作:mock-unseen-mt83-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("on the chopping block")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["on the chopping block:phrase:adjective:有被裁走風險的 / 可能被取消的:mock-unseen-mt83-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("doze off")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["doze off:phrase:verb:打瞌睡 / 入睡:mock-unseen-mt83-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("public address system")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["public address system:phrase:noun:公共廣播系統:mock-unseen-mt85-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("face your fears")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["face one's fears:phrase:verb:面對自己的恐懼:mock-unseen-mt85-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("synthetic materials")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["synthetic material:phrase:noun:合成材料:mock-unseen-mt85-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Rubik's Cube")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Rubik's Cube:phrase:noun:扭計骰 / 魔方:mock-unseen-mt85-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("standard of living")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["standard of living:phrase:noun:生活水平:mock-unseen-mt85-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("work from home trends")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["work-from-home trend:phrase:noun:在家工作趨勢:mock-unseen-mt85-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("restrict themselves to")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["restrict oneself to:phrase:verb:限制自己只做...:mock-unseen-mt88-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("washed ashore")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["wash ashore:phrase:verb:被沖上海岸:mock-unseen-mt88-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("work its way up")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["work its way up:phrase:verb:逐步向上傳遞 / 慢慢進入:mock-unseen-mt88-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("co-working spaces")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["co-working space:phrase:noun:共享工作空間:mock-unseen-mt88-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("online abuse")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["online abuse:phrase:noun:網上辱罵 / 網絡欺凌:mock-unseen-mt88-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("crossed the line")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["cross the line:phrase:verb:越界 / 過分:mock-unseen-mt88-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("taking over ownership")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["take over ownership:phrase:verb:接手擁有權 / 成為新主人:mock-unseen-mt37-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("office partitions")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["office partition:phrase:noun:辦公室隔板:mock-unseen-mt37-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("TV commercials")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["television commercial:phrase:noun:電視廣告:mock-unseen-mt37-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("all-male cast")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["all-male cast:phrase:noun:全男演員陣容:mock-unseen-mt37-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("read up on")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["read up on:phrase:verb:查閱 / 閱讀資料了解:mock-unseen-mt37-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hinges on")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["hinge on:phrase:verb:取決於 / 視乎:mock-unseen-mt37-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Tung Ping Chau")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Tung Ping Chau:phrase:noun:東平洲:mock-unseen-mt40-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("head injuries")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["head injury:phrase:noun:頭部受傷:mock-unseen-mt40-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ivory")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["ivory:word:noun:象牙:mock-unseen-mt40-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("content warnings")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["content warning:phrase:noun:內容警告 / 內容提示:mock-unseen-mt40-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("full length albums")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["full-length album:phrase:noun:完整專輯 / 長篇專輯:mock-unseen-mt40-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Songkran")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Songkran Festival:phrase:noun:潑水節 / 宋干節:mock-unseen-mt40-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("community gardens")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["community garden:phrase:noun:社區花園:mock-unseen-mt44-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("keep their business afloat")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["keep afloat:phrase:verb:維持經營 / 勉強支撐:mock-unseen-mt44-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("waste charging schemes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["waste charging scheme:phrase:noun:垃圾徵費計劃:mock-unseen-mt44-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("VR tours")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["virtual reality tour:phrase:noun:虛擬實境導覽 / VR 睇樓:mock-unseen-mt44-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("put a ceiling on")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["put a ceiling on:phrase:verb:限制 / 設下上限:mock-unseen-mt44-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("container terminals")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["container terminal:phrase:noun:貨櫃碼頭:mock-unseen-mt44-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("wheelchair users")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["wheelchair user:phrase:noun:輪椅使用者:mock-unseen-mt47-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("disabled toilets")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["disabled toilet:phrase:noun:傷殘人士洗手間 / 無障礙洗手間:mock-unseen-mt47-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("were bombarded with")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["be bombarded with:phrase:verb:被大量...轟炸 / 不斷接收到:mock-unseen-mt47-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("learning apps")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["learning app:phrase:noun:學習應用程式:mock-unseen-mt47-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("throat lozenges")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["throat lozenge:phrase:noun:喉糖 / 潤喉含片:mock-unseen-mt47-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("recruitment drives")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["recruitment drive:phrase:noun:招募行動 / 招募活動:mock-unseen-mt47-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("impromptu performances")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["impromptu performance:phrase:noun:即興表演:mock-unseen-mt47-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("news outlets")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["news outlet:phrase:noun:新聞媒體 / 新聞機構:mock-unseen-mt47-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("school sports blog")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["school sports blog:phrase:noun:學校體育博客 / 學校運動網誌:mock-unseen-mt90-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("perfecting assignments")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["perfect an assignment:phrase:verb:完善功課 / 把作業做到最好:mock-unseen-mt90-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Beef Wellington")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Beef Wellington:phrase:noun:威靈頓牛柳:mock-unseen-mt90-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("season it properly")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["season properly:phrase:verb:適當調味:mock-unseen-mt90-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("attitudes toward money")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["attitude towards money:phrase:noun:對金錢的態度:mock-unseen-mt90-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("economic conditions")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["economic condition:phrase:noun:經濟狀況:mock-unseen-mt90-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("abruptly changed lanes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["abruptly change lanes:phrase:verb:突然轉線:mock-unseen-mt86-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("license plate")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["license plate:phrase:noun:車牌:mock-unseen-mt86-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Golden Age classics")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Golden Age classic:phrase:noun:黃金時代經典作品:mock-unseen-mt86-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fenced off")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fence off:phrase:verb:用圍欄圍起:mock-unseen-mt86-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("10k race")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["10-kilometer race:phrase:noun:十公里賽跑:mock-unseen-mt86-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gave it everything I had")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["give it everything one has:phrase:verb:盡全力 / 拼盡全力:mock-unseen-mt86-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("image")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:圖像:curated-sense-bank",
      "noun:形象:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("lose")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:失去:curated-sense-bank",
      "verb:輸掉:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("number")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:數字:curated-sense-bank",
      "noun:號碼:curated-sense-bank",
      "verb:編號:curated-sense-bank",
      "verb:數算:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("purpose")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:目的:curated-sense-bank",
      "noun:用途:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("around")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "preposition:在...周圍:curated-sense-bank",
      "adverb:到處:curated-sense-bank",
      "adverb:大約:curated-sense-bank",
      "adverb:在周圍:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("by")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "preposition:由:curated-sense-bank",
      "preposition:被:curated-sense-bank",
      "preposition:靠近:curated-sense-bank",
      "adverb:經過:curated-sense-bank",
      "adverb:在旁邊:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("may")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "may:modal:可能:curated-sense-bank",
      "may:modal:可以:curated-sense-bank",
      "May:noun:五月:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("will")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "modal:將會:curated-sense-bank",
      "modal:會:curated-sense-bank",
      "noun:意志:curated-sense-bank",
      "noun:遺囑:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("event")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:活動:curated-sense-bank",
      "noun:事件:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("keep")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:保持:curated-sense-bank",
      "verb:保留:curated-sense-bank",
      "verb:留著:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("meet")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:遇見:curated-sense-bank",
      "verb:見面:curated-sense-bank",
      "verb:滿足 / 符合:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("move")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:移動:curated-sense-bank",
      "verb:搬動:curated-sense-bank",
      "verb:感動:curated-sense-bank",
      "noun:行動:curated-sense-bank",
      "noun:移動:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("experience")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:經驗:curated-sense-bank",
      "noun:經歷:curated-sense-bank",
      "verb:經歷:curated-sense-bank",
      "verb:體驗:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("expression")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:表達:curated-sense-bank",
      "noun:表情:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("feature")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:特色:curated-sense-bank",
      "noun:特徵:curated-sense-bank",
      "verb:以...為特色:curated-sense-bank",
      "verb:由...主演:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("process")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:過程:curated-sense-bank",
      "noun:程序:curated-sense-bank",
      "verb:處理:curated-sense-bank",
      "verb:加工:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rise")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:上升:curated-sense-bank",
      "verb:升起:curated-sense-bank",
      "noun:上升:curated-sense-bank",
      "noun:增加:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sign")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:標誌:curated-sense-bank",
      "noun:跡象:curated-sense-bank",
      "verb:簽署:curated-sense-bank",
      "verb:簽名:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("shape")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:形狀:curated-sense-bank",
      "verb:塑造:curated-sense-bank",
      "verb:影響:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("develop")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:發展:curated-sense-bank",
      "verb:成長:curated-sense-bank",
      "verb:培養:curated-sense-bank",
      "verb:形成:curated-sense-bank",
      "verb:患上:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("produce")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:生產:curated-sense-bank",
      "verb:製造:curated-sense-bank",
      "noun:農產品:curated-sense-bank",
      "noun:農作物:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("separate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:分開:curated-sense-bank",
      "verb:分離:curated-sense-bank",
      "adjective:分開的:curated-sense-bank",
      "adjective:獨立的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("request")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:要求:curated-sense-bank",
      "noun:請求:curated-sense-bank",
      "verb:要求:curated-sense-bank",
      "verb:請求:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("several")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "determiner:幾個 / 數個:curated-sense-bank",
      "pronoun:幾個 / 數個:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("drug")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:藥物:curated-sense-bank",
      "noun:毒品:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("be")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:是:curated-sense-bank",
      "verb:成為:curated-sense-bank",
      "auxiliary:be 動詞（am / is / are / was / were）:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("form")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:表格:curated-sense-bank",
      "noun:形式:curated-sense-bank",
      "noun:形態:curated-sense-bank",
      "verb:形成:curated-sense-bank",
      "verb:組成:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("join")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:加入:curated-sense-bank",
      "verb:參加:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("country")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:國家:curated-sense-bank",
      "noun:鄉郊:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rather")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adverb:頗:curated-sense-bank",
      "adverb:相當:curated-sense-bank",
      "adverb:反而:curated-sense-bank",
      "adverb:而是:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("apply")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:申請:curated-sense-bank",
      "verb:應用:curated-sense-bank",
      "verb:使用:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("count")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:數:curated-sense-bank",
      "verb:計算:curated-sense-bank",
      "verb:重要:curated-sense-bank",
      "verb:算數:curated-sense-bank",
      "noun:數目:curated-sense-bank",
      "noun:總數:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("movement")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:移動:curated-sense-bank",
      "noun:運動:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("particular")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:特定的:curated-sense-bank",
      "adjective:特別的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stop")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:停止:curated-sense-bank",
      "noun:車站:curated-sense-bank",
      "noun:停止:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("study")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:學習:curated-sense-bank",
      "verb:研究:curated-sense-bank",
      "noun:研究:curated-sense-bank",
      "noun:書房:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("save")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:儲存:curated-sense-bank",
      "verb:拯救:curated-sense-bank",
      "verb:節省:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("safe")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:安全的:curated-sense-bank",
      "noun:保險箱:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("file")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:檔案 / 文件:curated-sense-bank",
      "verb:歸檔:curated-sense-bank",
      "verb:提交:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("monitor")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:班長 / 監察員:curated-sense-bank",
      "noun:螢幕 / 顯示器:curated-sense-bank",
      "verb:監察 / 監控:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("diet")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:日常飲食:curated-sense-bank",
      "noun:節食:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("notebook")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:筆記簿:curated-sense-bank",
      "noun:手提電腦:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rubber")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:擦膠:curated-sense-bank",
      "noun:橡膠:curated-sense-bank",
      "adjective:橡膠的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("course")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:課程:curated-sense-bank",
      "noun:過程:curated-sense-bank",
      "noun:一道菜:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("lesson")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:課堂 / 課:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("exam")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:考試:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("homework")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:功課:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("principal")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:校長:curated-sense-bank",
      "adjective:主要的:curated-sense-bank",
      "noun:本金:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("question")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:問題:curated-sense-bank",
      "verb:詢問 / 質疑:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("answer")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:答案:curated-sense-bank",
      "verb:回答:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("score")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:得分:curated-sense-bank",
      "noun:分數 / 得分:curated-sense-bank",
      "verb:用刀劃痕 / 劃線:mock-unseen-mt56-paper3-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("level")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:水平 / 級別:curated-sense-bank",
      "adjective:平坦的 / 同高的:curated-sense-bank",
      "verb:弄平:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("standard")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:標準:curated-sense-bank",
      "adjective:標準的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("general")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:一般的 / 總體的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("common")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:普遍的 / 常見的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("private")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:私人的 / 私立的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("paper")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:紙:curated-sense-bank",
      "noun:試卷:curated-sense-bank",
      "noun:論文 / 報告:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("exercise")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:練習:curated-sense-bank",
      "noun:運動:curated-sense-bank",
      "verb:運動 / 鍛鍊:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("practise")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:練習:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hawker")).map((entry) => `${entryPos(entry)}:${entry.meaning}:${entry.source}`),
    ["noun:小販:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Mong Kok")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:旺角:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bacon")).map((entry) => `${entry.type}:${entry.meaning}:${entry.source}`),
    ["word:煙肉 / 培根:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("annual leave")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:年假 / 有薪年假:mock-unseen-mt30-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("well-travelled")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["well travelled:phrase:adjective:見多識廣的 / 去過很多地方的:mock-unseen-mt30-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Poya")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Poya:noun:斯里蘭卡滿月節:mock-unseen-mt30-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sheer drops")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["sheer drop:phrase:noun:垂直落差 / 陡峭懸崖:mock-unseen-mt30-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pre opening sales")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["pre-opening sale:phrase:noun:開幕前特賣:mock-unseen-mt30-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("childcare area")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["child care area:phrase:noun:兒童照顧區:mock-unseen-mt30-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("set in stone")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:不可更改的 / 已成定局的:mock-unseen-mt30-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("juggling")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:兼顧 / 同時應付:mock-unseen-mt38-paper1-reviewed",
      "verb:拋接雜耍:mock-unseen-mt30-paper3-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("wear charity like a mask")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:以慈善作包裝 / 假裝有善心:mock-unseen-mt30-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cohesive ties")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["cohesive tie:phrase:noun:銜接手法 / 連貫手法:mock-unseen-mt30-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pay rise")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["pay rise:phrase:noun:加薪:mock-unseen-mt9-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("kleptomania")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["word:noun:偷竊癖 / 無法停止偷竊的心理失調:mock-unseen-mt9-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("turn yourself in")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["turn oneself in:phrase:verb:自首:mock-unseen-mt9-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("laptop-tracking software")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:手提電腦追蹤軟件:mock-unseen-mt9-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("jump down your throat")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["jump down someone's throat:phrase:verb:突然嚴厲斥責某人:mock-unseen-mt9-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("run-down")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["run down:phrase:adjective:破舊的 / 殘舊的:mock-unseen-mt10-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("claim her prize")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["claim a prize:phrase:verb:領獎 / 申領獎金:mock-unseen-mt10-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("red carpet release party")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:紅地氈首映派對:mock-unseen-mt10-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("lost her cool")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["lose one's cool:phrase:verb:失去冷靜 / 發脾氣:mock-unseen-mt10-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("reprising their roles")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["reprise one's role:phrase:verb:再次飾演同一角色:mock-unseen-mt10-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cold-pressed juice")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:冷壓果汁:mock-unseen-mt35-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("charge through the nose")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:收取過高價錢:mock-unseen-mt35-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stop motion animation")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["stop-motion animation:phrase:noun:定格動畫:mock-unseen-mt35-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("appropriacy")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:語境合適度 / 用語恰當度:mock-unseen-mt35-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("go live")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:上線 / 開始公開播放:mock-unseen-mt38-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("head it up")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["head up:phrase:verb:負責 / 帶領:mock-unseen-mt38-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("jump ship")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:跳槽 / 離職轉投別處:mock-unseen-mt38-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("green buildings")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["green building:phrase:noun:綠色建築 / 環保建築:mock-unseen-mt38-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ultramarathons")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["ultramarathon:noun:超級馬拉松 / 超馬:mock-unseen-mt42-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("MacLehose Trail")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["MacLehose Trail:phrase:noun:麥理浩徑:mock-unseen-mt42-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("aid stations")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["aid station:phrase:noun:補給站 / 救護站:mock-unseen-mt42-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sign up for")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:報名參加:mock-unseen-mt42-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cheese rolling")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["cheese-rolling:phrase:noun:滾芝士比賽:mock-unseen-mt45-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pulling your leg")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["pull someone's leg:phrase:verb:開某人玩笑 / 作弄某人:mock-unseen-mt45-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("descended en masse")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["descend en masse:phrase:verb:大批湧到 / 成群到達:mock-unseen-mt45-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("reimbursed")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["reimburse:verb:賠償 / 發還款項:mock-unseen-mt45-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("break the mould")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["break the mold:phrase:verb:打破常規 / 打破舊模式:mock-unseen-mt49-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flew under the radar")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fly under the radar:phrase:verb:不受注意 / 低調地避過關注:mock-unseen-mt49-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("child musical prodigy")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["child prodigy:phrase:noun:神童 / 天才兒童:mock-unseen-mt49-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stepped on the toes of")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["step on someone's toes:phrase:verb:冒犯某人 / 侵犯某人的地位:mock-unseen-mt49-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("story time series")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["story time series:phrase:noun:故事時間系列活動:mock-unseen-mt52-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("substantive editors")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["substantive editor:phrase:noun:內容編輯 / 結構編輯:mock-unseen-mt52-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("keep me posted")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["keep someone posted:phrase:verb:讓某人知道最新情況:mock-unseen-mt52-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("visually impaired")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["visually impaired:adjective:視障的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("product testers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["product tester:phrase:noun:產品測試員:mock-unseen-mt52-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("swag bags")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["swag bag:phrase:noun:紀念品袋 / 贈品袋:mock-unseen-mt52-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("turns up her nose")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["turn up one's nose:phrase:verb:嗤之以鼻 / 表示嫌棄:mock-unseen-mt52-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bodes well")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["bode well:phrase:verb:是好兆頭 / 預示好結果:mock-unseen-mt52-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("crunchy top")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["crunchy top:phrase:noun:香脆頂層:mock-unseen-mt56-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("scored")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "score:verb:用刀劃痕 / 劃線:mock-unseen-mt56-paper3-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Sino-Japanese War")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Sino-Japanese War:phrase:noun:中日戰爭:mock-unseen-mt56-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("public consultations")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["public consultation:phrase:noun:公眾諮詢:mock-unseen-mt56-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("container return program")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["container return programme:phrase:noun:容器回收計劃 / 容器歸還計劃:mock-unseen-mt56-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sold out")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "sold out:phrase:adjective:售罄:curated-sense-bank",
      "sell out:phrase:verb:出賣原則 / 為利益妥協:mock-unseen-mt56-paper3-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("high fructose corn syrup")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["high fructose corn syrup:phrase:noun:高果糖粟米糖漿:mock-unseen-mt56-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("critically endangered")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["critically endangered:phrase:adjective:極度瀕危的:mock-unseen-mt56-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("click through rate")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["click-through rate:phrase:noun:點擊率:mock-unseen-mt56-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("impressions")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "impression:noun:曝光次數 / 瀏覽曝光:mock-unseen-mt56-paper3-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("black-faced spoonbills")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["black-faced spoonbill:phrase:noun:黑臉琵鷺:mock-unseen-mt59-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Mai Po")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Mai Po:phrase:noun:米埔:mock-unseen-mt59-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("capsized")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["capsize:verb:翻船 / 傾覆:mock-unseen-mt59-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hired out")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["hire out:phrase:verb:出租:mock-unseen-mt59-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in the event of")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["in the event of:phrase:preposition:如果發生 / 在...情況下:mock-unseen-mt59-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Eurasian tree sparrows")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Eurasian tree sparrow:phrase:noun:樹麻雀:mock-unseen-mt70-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gig work")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:零工工作 / 短期接案工作:mock-unseen-mt70-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("killed two birds with one stone")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["kill two birds with one stone:phrase:verb:一石二鳥 / 一舉兩得:mock-unseen-mt70-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("on the same page")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:想法一致的 / 達成共識的:mock-unseen-mt70-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("false choice")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:假兩難選擇 / 不必要的二選一:mock-unseen-mt70-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Northern Lights")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Northern Lights:phrase:noun:北極光:mock-unseen-mt73-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("snowmobiles")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["snowmobile:noun:雪地電單車 / 雪上摩托車:mock-unseen-mt73-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("satellite phone")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["satellite phone:phrase:noun:衛星電話:mock-unseen-mt42-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("good with kids")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:擅長與小朋友相處的:mock-unseen-mt73-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dos and don'ts")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:注意事項 / 應做與不應做的事:mock-unseen-mt73-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("quick fire questions")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["quick-fire question:phrase:noun:快速連環問題:mock-unseen-mt73-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Canis lupus")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Canis lupus:phrase:noun:灰狼的學名:mock-unseen-mt77-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("routine checkups")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["routine check-up:phrase:noun:例行檢查 / 定期檢查:mock-unseen-mt77-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("on board")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "phrase:adjective:加入的 / 參與其中的:mock-unseen-mt77-paper3-reviewed",
      "phrase:adverb:在船上 / 在交通工具上:mock-unseen-mt32-paper2-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("the likes of")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:preposition:像...這類 / 例如:mock-unseen-mt77-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("complimentary massage")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:免費按摩:mock-unseen-mt77-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cooked from scratch")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:由新鮮材料即場烹調的:mock-unseen-mt80-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Midday Meal Scheme")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Midday Meal Scheme:phrase:noun:印度學校午餐計劃:mock-unseen-mt80-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("wrong way round")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:方向倒轉 / 反過來:mock-unseen-mt80-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("membership tiers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["membership tier:phrase:noun:會籍級別:mock-unseen-mt80-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("have no problem with that whatsoever")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["have no problem with:phrase:verb:不介意 / 對...沒有問題:mock-unseen-mt80-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rundown")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["word:noun:節目流程 / 項目清單:mock-unseen-mt63-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("field reports")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["field report:phrase:noun:現場報道 / 實地報告:mock-unseen-mt63-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("parental controls")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["parental control:phrase:noun:家長監控功能:mock-unseen-mt63-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("polite yet firm")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:有禮但堅定的:mock-unseen-mt63-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("take down")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:下架 / 移除網上內容:mock-unseen-mt63-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pet adoption")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:領養寵物:mock-unseen-mt20-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("desexed")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["desex:verb:為動物絕育:mock-unseen-mt20-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("parent supervisors")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["parent supervisor:phrase:noun:家長監察員 / 隨隊家長:mock-unseen-mt20-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Most Valuable Player")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Most Valuable Player:phrase:noun:最有價值球員:mock-unseen-mt20-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("basketball runs in sung's blood")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["run in someone's blood:phrase:verb:是某人天生擅長 / 家族遺傳的:mock-unseen-mt20-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bike sharing schemes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["bike-sharing scheme:phrase:noun:共享單車計劃:mock-unseen-mt22-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("on the spur of the moment")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:一時衝動地 / 即興地:mock-unseen-mt22-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("put them off")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["put someone off:phrase:verb:令某人卻步 / 使某人不想做:mock-unseen-mt22-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("renewable energy source")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["renewable source of energy:phrase:noun:可再生能源:mock-unseen-mt22-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("wind turbines")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["wind turbine:phrase:noun:風力發電機:mock-unseen-mt22-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Davy Jones's locker")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Davy Jones's locker:phrase:noun:海底 / 葬身海底之處:mock-unseen-mt25-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("safety harnesses")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["safety harness:phrase:noun:安全吊帶 / 安全帶:mock-unseen-mt25-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Hidden Colours Viewer")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Hidden Colours Viewer:phrase:noun:隱藏顏色觀察器:mock-unseen-mt25-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("kinetic energy")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:動能:mock-unseen-mt25-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("has a bee in his bonnet")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["have a bee in one's bonnet:phrase:verb:對某事念念不忘 / 過分執著:mock-unseen-mt25-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("shady")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`).slice(0, 2),
    [
      "adjective:陰涼的:mock-unseen-mt27-paper3-reviewed",
      "adjective:可疑的 / 不誠實的:mock-unseen-mt45-paper3-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("knocks down")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "knock down:phrase:verb:撞倒 / 撞跌:mock-unseen-mt27-paper3-reviewed",
      "knock down:phrase:verb:拆卸 / 拆掉:mock-unseen-mt73-paper2-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("get the hang of it")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["get the hang of:phrase:verb:掌握...的竅門 / 開始懂得:mock-unseen-mt27-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("visualisation exercises")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["visualization exercise:phrase:noun:視覺化練習 / 想像訓練:mock-unseen-mt27-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("at the top of my game")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["at the top of one's game:phrase:adjective:處於最佳狀態 / 表現巔峰:mock-unseen-mt27-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sport psychologists")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["sport psychologist:phrase:noun:運動心理學家:mock-unseen-mt27-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("greenwashing")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["word:noun:漂綠 / 假環保宣傳:mock-unseen-mt87-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Komodo dragons")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Komodo dragon:phrase:noun:科莫多巨蜥:mock-unseen-mt87-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("glamping resorts")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["glamping resort:phrase:noun:豪華露營度假村:mock-unseen-mt87-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rainwater harvesting")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "rainwater harvesting:phrase:noun:雨水收集:curated-sense-bank",
      "rainwater harvesting system:phrase:noun:雨水收集系統:mock-unseen-mt87-paper3-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("crunching the numbers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["crunch the numbers:phrase:verb:計算數字 / 仔細計數:mock-unseen-mt87-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("at the helm")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:掌舵 / 負責領導:mock-unseen-mt87-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("book tokens")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["book token:phrase:noun:書券:mock-unseen-mt16-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("mini-ovens")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["mini-oven:phrase:noun:小型焗爐:mock-unseen-mt16-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("market share")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:市場佔有率:mock-unseen-mt16-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rotisserie function")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:旋轉烤焗功能:mock-unseen-mt16-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dog friendly")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["doggy-friendly:phrase:adjective:歡迎狗隻的 / 狗狗友善的:mock-unseen-mt16-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("four-legged friends")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["four-legged friend:phrase:noun:寵物狗 / 四腳朋友:mock-unseen-mt16-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("preservative free")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["preservative-free:phrase:adjective:不含防腐劑的:mock-unseen-mt16-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("type 2 diabetes")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:二型糖尿病:mock-unseen-mt16-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("reversing diabetes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["reverse diabetes:phrase:verb:逆轉糖尿病:mock-unseen-mt16-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cronuts")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["cronut:word:noun:牛角包冬甩:mock-unseen-mt16-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fundraising campaigns")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fund-raising campaign:phrase:noun:籌款活動 / 籌款運動:mock-unseen-mt18-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("mascots")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["mascot:word:noun:吉祥物:mock-unseen-mt18-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("vet clinics")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["vet clinic:phrase:noun:獸醫診所:mock-unseen-mt18-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("loyalty schemes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["loyalty scheme:phrase:noun:會員優惠計劃 / 顧客忠誠計劃:mock-unseen-mt18-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("veterinary science")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:獸醫科學 / 獸醫學:mock-unseen-mt18-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("be put on hold")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["put on hold:phrase:verb:電話等候 / 被要求等候:mock-unseen-mt18-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("microchipped")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["microchip:word:verb:為...植入晶片:mock-unseen-mt18-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in the flesh")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:親眼見到 / 本人地:mock-unseen-mt18-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("therapy animals")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["therapy animal:phrase:noun:治療動物:mock-unseen-mt18-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("adoption fees")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adoption fee:phrase:noun:領養費:mock-unseen-mt18-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("study leave")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "phrase:noun:溫習假:curated-sense-bank",
      "phrase:noun:考試溫習假:mock-unseen-mt19-paper3-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pulled a muscle")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["pull a muscle:phrase:verb:拉傷肌肉:mock-unseen-mt19-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fear of missing out")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["FOMO:phrase:noun:錯失恐懼症 / 怕錯過別人活動的焦慮:mock-unseen-mt19-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("wake up call")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["wake-up call:phrase:noun:警號 / 提醒人正視問題的事:mock-unseen-mt19-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("emitting radiation")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["emit radiation:phrase:verb:發出輻射:mock-unseen-mt19-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("distracted driving")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:分心駕駛:mock-unseen-mt19-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rendered incomprehensible")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["render incomprehensible:phrase:verb:令...難以理解:mock-unseen-mt19-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gritty texture")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:粗糙有沙粒感的口感:mock-unseen-mt21-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("not to everyone's taste")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:不是人人都喜歡的:mock-unseen-mt21-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cup distributors")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["cup distributor:phrase:noun:杯子供應商 / 杯子分銷商:mock-unseen-mt21-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("applications due")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["application due:phrase:adjective:申請截止的:mock-unseen-mt21-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rinseless shampoo")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:免沖洗洗頭水:mock-unseen-mt21-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("docking time")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:對接時間:mock-unseen-mt21-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("zero gravity")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:零重力:mock-unseen-mt21-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("wedding planners")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["wedding planner:phrase:noun:婚禮策劃師:mock-unseen-mt23-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("on the house")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:由店方免費招待的:mock-unseen-mt23-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("secret diners")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["secret diner:phrase:noun:神秘食客 / 餐廳暗訪員:mock-unseen-mt23-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("head and shoulders above")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:遠勝於 / 明顯優於:mock-unseen-mt23-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("revamped")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["revamp:verb:徹底改造 / 翻新:mock-unseen-mt23-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("monkey bars")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:攀爬架 / 猴架:mock-unseen-mt24-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("false starts")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["false start:phrase:noun:搶跑 / 起步犯規:mock-unseen-mt24-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flagship brands")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["flagship brand:phrase:noun:旗艦品牌 / 主打品牌:mock-unseen-mt24-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fleshed out")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["flesh out:phrase:verb:充實內容 / 加入細節:mock-unseen-mt24-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("tone style and register")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["tone, style and register:phrase:noun:語氣、文體和語域:mock-unseen-mt24-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("black rhinos")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["black rhino:phrase:noun:黑犀牛:mock-unseen-mt26-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("waders")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["wader:noun:涉水長靴:mock-unseen-mt26-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("wheelchair ramps")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["wheelchair ramp:phrase:noun:輪椅斜道:mock-unseen-mt26-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("voice-over")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["voiceover:noun:旁白:mock-unseen-mt26-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("drone mounted camera")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["drone-mounted camera:phrase:noun:無人機安裝相機:mock-unseen-mt26-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("chunks taken verbatim")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["chunk taken verbatim:phrase:noun:逐字照抄的一段文字:mock-unseen-mt26-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("trade show")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["trade fair:phrase:noun:貿易展覽 / 商貿展:mock-unseen-mt28-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Q and A session")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Q&A session:phrase:noun:問答環節:mock-unseen-mt28-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("tell off")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:責罵 / 斥責:mock-unseen-mt28-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Silver Surfers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["silver surfer:phrase:noun:年長網民 / 年長科技用家:mock-unseen-mt28-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("run through")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:快速講解 / 排練:mock-unseen-mt28-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("World Quality of Life Survey")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["World Quality of Life Survey:phrase:noun:世界生活質素調查:mock-unseen-mt29-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("chime in")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:插話 / 加入討論:mock-unseen-mt29-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sneak peek")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:率先預覽 / 偷偷一看:mock-unseen-mt29-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("airport shuttles")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["airport shuttle:phrase:noun:機場接駁車:mock-unseen-mt29-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("motion sensors")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["motion sensor:phrase:noun:動作感應器:mock-unseen-mt29-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("spare no expense")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:不惜工本 / 不計成本:mock-unseen-mt29-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("time trial")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:計時賽:mock-unseen-mt31-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("roofing membrane")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:屋頂防水膜:mock-unseen-mt31-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("green thumb")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:園藝天分 / 種植物的本領:mock-unseen-mt31-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("go over well")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:反應良好 / 被接受:mock-unseen-mt31-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("even playing field")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:公平競爭環境:mock-unseen-mt33-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("AR goggles")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["AR goggles:phrase:noun:AR 眼鏡 / 擴增實境護目鏡:mock-unseen-mt33-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in the running")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:有機會勝出 / 入圍的:mock-unseen-mt33-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("wholesale demand")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:批發需求:mock-unseen-mt33-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("infinite canvas")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:無限畫布:mock-unseen-mt34-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("escape rooms")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["escape room:phrase:noun:密室逃脫遊戲 / 逃脫房間:mock-unseen-mt34-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("poke the bear")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:惹怒對方 / 刺激敏感的人:mock-unseen-mt34-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Cheung Po Tsai Cave")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Cheung Po Tsai Cave:phrase:noun:張保仔洞:mock-unseen-mt34-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dumbed down")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["dumb down:phrase:verb:簡化到過分淺白 / 降低深度:mock-unseen-mt36-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("strobe lights")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["strobe light:phrase:noun:頻閃燈:mock-unseen-mt36-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rigged up")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["rig up:phrase:verb:臨時裝設 / 架設:mock-unseen-mt36-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("perfect fit")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:非常合適的人或事物:mock-unseen-mt36-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("haggis")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["word:noun:羊雜布丁 / 哈吉斯:mock-unseen-mt39-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rough cut")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:粗剪版 / 初剪版本:mock-unseen-mt39-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("WOM campaign")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["word-of-mouth campaign:phrase:noun:口碑宣傳活動:mock-unseen-mt39-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("casting decisions")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["casting decision:phrase:noun:選角決定:mock-unseen-mt39-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("provenance")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["word:noun:來源紀錄 / 流傳歷史:mock-unseen-mt41-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("synthetic fibers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["synthetic fibre:phrase:noun:合成纖維:mock-unseen-mt41-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("tonometers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["tonometer:word:noun:眼壓計:mock-unseen-mt41-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("tax deduction")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:扣稅項目 / 稅務扣減:mock-unseen-mt41-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("at cost")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:按成本價:mock-unseen-mt41-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("skateboard ramp")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:滑板斜台:mock-unseen-mt43-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in-game ads")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["in-game ad:phrase:noun:遊戲內廣告:mock-unseen-mt43-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("one off development fee")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["one-off fee:phrase:noun:一次性費用:mock-unseen-mt43-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("iron out the kinks")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:解決小問題 / 修正毛病:mock-unseen-mt43-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Internet cafes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Internet cafe:phrase:noun:網吧:mock-unseen-mt43-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Kowloon Walled City")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Kowloon Walled City:phrase:noun:九龍寨城:mock-unseen-mt43-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("yearbook")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["word:noun:畢業紀念冊 / 年刊:mock-unseen-mt46-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("artist's impression")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:藝術構想圖 / 效果圖:mock-unseen-mt46-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("lazy-river ride")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:漂流河遊樂設施:mock-unseen-mt46-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("plummeting")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "word:verb:暴跌 / 急跌:curated-sense-bank",
      "word:verb:急墜 / 垂直落下:mock-unseen-mt46-paper3-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fit the bill")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:符合要求 / 合適:mock-unseen-mt35-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("llamas")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["llama:word:noun:羊駝:mock-unseen-mt48-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("volcanic ash")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:火山灰:mock-unseen-mt48-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("two-factor authentication")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:雙重認證:mock-unseen-mt48-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rip off")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:敲詐 / 收取過高價錢:mock-unseen-mt48-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("supersonic aircraft")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:超音速飛機:mock-unseen-mt48-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in-flight meals")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["in-flight meal:phrase:noun:機上餐膳:mock-unseen-mt48-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("volunteer tourism")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:義工旅遊 / 志願服務旅遊:mock-unseen-mt50-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("blade guard")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:鋸片護罩:mock-unseen-mt50-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("paid in exposure")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:以曝光率作報酬的:mock-unseen-mt50-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stick to your guns")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["stick to one's guns:phrase:verb:堅持立場 / 不讓步:mock-unseen-mt50-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("choosing beggars")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["choosing beggar:phrase:noun:又要免費又要求多多的人:mock-unseen-mt53-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("podcast directory")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:podcast 目錄 / 播客目錄平台:mock-unseen-mt53-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Nam Koo Terrace")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Nam Koo Terrace:phrase:noun:南固臺:mock-unseen-mt53-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("muffled")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["word:adjective:聲音焗住的 / 聽不清的:mock-unseen-mt53-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("co-hosting")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["co-host:phrase:verb:共同主持:mock-unseen-mt53-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stilt houses")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["stilt house:phrase:noun:棚屋 / 高腳屋:mock-unseen-mt66-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rattan furniture")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:藤製家具:mock-unseen-mt66-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sustainable farming methods")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["sustainable farming method:phrase:noun:可持續耕作方法:mock-unseen-mt66-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gesture of goodwill")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:善意表示 / 善意補償:mock-unseen-mt66-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("put myself in the customers' shoes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["put oneself in someone's shoes:phrase:verb:代入某人處境 / 設身處地:mock-unseen-mt66-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("get back on his feet")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["get back on one's feet:phrase:verb:重新站穩 / 從困境中恢復:mock-unseen-mt84-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("e-readers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["e-reader:phrase:noun:電子書閱讀器:mock-unseen-mt84-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sweeten the deal")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:增加好處令條件更吸引:mock-unseen-mt84-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("meet with your approval")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["meet with one's approval:phrase:verb:獲得某人批准 / 得到某人認可:mock-unseen-mt84-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("speaker roster")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:講者名單:mock-unseen-mt84-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("eco fashion")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["eco-fashion:phrase:noun:環保時裝 / 環保時尚:mock-unseen-mt32-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("focus groups")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["focus group:phrase:noun:焦點小組:mock-unseen-mt32-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("second largest polluter")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["second-largest polluter:phrase:noun:第二大污染源:mock-unseen-mt32-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pop up shops")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["pop-up shop:phrase:noun:期間限定店 / 快閃店:mock-unseen-mt32-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cash in on")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:從...獲利 / 趁機利用:mock-unseen-mt32-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("goes public")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["go public:phrase:verb:上市 / 公開發行股票:mock-unseen-mt32-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("speak for itself")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:不言而喻 / 本身已能說明一切:mock-unseen-mt32-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("groundbreaking")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:開創性的 / 突破性的:mock-unseen-mt32-paper3-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("quake-hit")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:受地震重創的:mock-unseen-mt30-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Dragon Boat Racing")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Dragon Boat Racing:phrase:noun:龍舟競賽:mock-unseen-mt30-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("animal adoption")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:領養動物:mock-unseen-mt30-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hut")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:小屋 / 茅屋:mock-unseen-mt30-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("mats")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["mat:noun:墊子 / 席子:mock-unseen-mt30-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("roared")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:吼叫 / 咆哮:mock-unseen-mt30-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("SPCA")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["SPCA:noun:愛護動物協會:mock-unseen-mt30-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("publicised")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:宣傳 / 公布:mock-unseen-mt30-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("take up a sport")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:開始參與一項運動:mock-unseen-mt30-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("baked goods")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:烘焙食品:mock-unseen-mt30-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("treasure hunts")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:尋寶遊戲:mock-unseen-mt30-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("school assembly")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:學校集會:mock-unseen-mt32-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pet-friendly policies")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:寵物友善政策:mock-unseen-mt32-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("light pollution")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:光污染:mock-unseen-mt32-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("video arcades")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:電子遊戲機中心 / 遊戲機舖:mock-unseen-mt32-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("desensitised")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:使麻木 / 使失去敏感度:mock-unseen-mt32-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("aired on the channel")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:在頻道播放:mock-unseen-mt32-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Hong Kong Railway Museum")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Hong Kong Railway Museum:phrase:noun:香港鐵路博物館:mock-unseen-mt35-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("public sitting-out area")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:公眾休憩處:mock-unseen-mt35-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("clinch victory")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:取得勝利:mock-unseen-mt35-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("creative outlets")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:創意出口 / 表達創意的途徑:mock-unseen-mt35-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("all expenses paid")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:包全部費用的:mock-unseen-mt35-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("places of interest")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:名勝 / 景點:mock-unseen-mt35-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fibre optics")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:光纖技術:mock-unseen-mt38-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("paved the way")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:鋪路 / 為...創造條件:mock-unseen-mt38-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fat shaming")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:嘲笑肥胖 / 身材羞辱:mock-unseen-mt38-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("wrongful convictions")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:錯誤定罪 / 冤案:mock-unseen-mt38-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("the show must go on")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:演出必須繼續 / 無論如何都要繼續:mock-unseen-mt38-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("word for word")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:逐字逐句地:mock-unseen-mt38-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("mentoring program")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:師友計劃 / 輔導計劃:mock-unseen-mt42-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("student body")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:全體學生:mock-unseen-mt42-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("search engines")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:搜尋引擎:mock-unseen-mt42-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("extras")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["movie extra:phrase:noun:電影臨時演員 / 群眾演員:mock-unseen-mt42-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("picked on")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:欺負 / 針對:mock-unseen-mt42-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("HR Department")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Human Resources Department:phrase:noun:人力資源部:mock-unseen-mt42-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("satellite phones")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:衛星電話:mock-unseen-mt42-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("made it out alive")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:活著逃出 / 生還:mock-unseen-mt42-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("board game nights")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:桌上遊戲晚會:mock-unseen-mt45-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("owners committee")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Owners' Committee:phrase:noun:業主委員會:mock-unseen-mt45-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("running costs")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:營運費 / 日常開支:mock-unseen-mt45-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("intranet")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["word:noun:內聯網:mock-unseen-mt45-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("at my fingertips")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:近在手邊 / 隨手可得:mock-unseen-mt45-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("spa treatments")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:水療護理 / Spa 護理:mock-unseen-mt45-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("spa")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["word:noun:水療 / Spa:mock-unseen-mt45-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("planted crops")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:種植農作物:mock-unseen-mt45-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("deluxe suites")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:豪華套房:mock-unseen-mt49-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("student radio host")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["radio host:phrase:noun:電台主持:mock-unseen-mt49-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("remote learning")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:遙距學習 / 網上學習:mock-unseen-mt49-paper2-reviewed"]
  );

  assert.ok(
    (await lookupForStudent("hand sanitizer")).some((entry) => (
      entry.type === "phrase"
      && entry.pos === "noun"
      && entry.meaning === "酒精搓手液 / 消毒搓手液"
      && entry.source === "mock-unseen-mt49-paper2-reviewed"
    ))
  );

  assert.deepStrictEqual(
    (await lookupForStudent("game consoles")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:遊戲機 / 遊戲主機:mock-unseen-mt49-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("awe inspiring")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:令人敬畏的 / 令人驚嘆的:mock-unseen-mt49-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("World War II")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Second World War:phrase:noun:第二次世界大戰:mock-unseen-mt49-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("changed the face of")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:徹底改變...的面貌:mock-unseen-mt49-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hotel amenities")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["hotel amenity:phrase:noun:酒店設施:mock-unseen-mt52-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("put up their tents")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:搭帳篷:mock-unseen-mt52-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bobs up and down")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:上下浮動:mock-unseen-mt52-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sedan chairs")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["sedan chair:phrase:noun:轎 / 轎子:mock-unseen-mt56-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rolled the dice")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:擲骰子:mock-unseen-mt56-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("guest of honor")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["guest of honour:phrase:noun:主禮嘉賓 / 貴賓:mock-unseen-mt56-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("traditional characters")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["traditional character:phrase:noun:繁體字:mock-unseen-mt56-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("TV channels")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["television channel:phrase:noun:電視頻道:mock-unseen-mt56-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("award winning")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:得獎的 / 獲獎的:mock-unseen-mt56-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("immigration trends")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["immigration trend:phrase:noun:移民趨勢:mock-unseen-mt59-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("jotted down")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:匆匆記下 / 草草寫下:mock-unseen-mt59-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("chief librarians")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["chief librarian:phrase:noun:總圖書館館長 / 圖書館主管:mock-unseen-mt59-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("not my cup of tea")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["not one's cup of tea:phrase:adjective:不是某人喜歡的事物:mock-unseen-mt59-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("slacking off")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:偷懶 / 懈怠:mock-unseen-mt59-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("give it my all")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["give it one's all:phrase:verb:全力以赴:mock-unseen-mt59-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pop culture")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["popular culture:phrase:noun:流行文化:mock-unseen-mt63-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sent in")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["write in:phrase:verb:寫信 / 寫訊息到節目:mock-unseen-mt63-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("on three main grounds")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["grounds:word:noun:理由 / 根據:mock-unseen-mt63-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("trapped")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["trap:word:verb:困住 / 使陷入困境:mock-unseen-mt63-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("set a dangerous precedent")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:開危險先例:mock-unseen-mt63-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("future generations")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["future generation:phrase:noun:下一代 / 後代:mock-unseen-mt63-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pet accessories")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["pet accessory:phrase:noun:寵物用品 / 寵物配件:mock-unseen-mt66-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("internal combustion engines")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["internal combustion engine:phrase:noun:內燃機:mock-unseen-mt66-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("put the devices to good use")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["put something to good use:phrase:verb:善用某物:mock-unseen-mt66-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("audio and visual")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["audio-visual:phrase:adjective:視聽的 / 影音的:mock-unseen-mt66-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("run sports teams")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["run a sports team:phrase:verb:帶領 / 管理運動隊伍:mock-unseen-mt66-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("mandatory work experience")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["mandatory work experience:phrase:noun:強制工作體驗:mock-unseen-mt66-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("marine wildlife")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:海洋野生動物:mock-unseen-mt70-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pack my bags")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:收拾行李離開:mock-unseen-mt70-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bricks and mortar")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "phrase:noun:實體店 / 實體建築:curated-sense-bank",
      "phrase:adjective:實體店的 / 非網上的:mock-unseen-mt70-paper2-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("brick and mortar")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "phrase:noun:實體店 / 實體建築:curated-sense-bank",
      "phrase:adjective:實體店的 / 非網上的:mock-unseen-mt70-paper2-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("brick-and-mortar")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "phrase:noun:實體店 / 實體建築:curated-sense-bank",
      "phrase:adjective:實體店的 / 非網上的:mock-unseen-mt70-paper2-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bricks-and-mortar")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "phrase:noun:實體店 / 實體建築:curated-sense-bank",
      "phrase:adjective:實體店的 / 非網上的:mock-unseen-mt70-paper2-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dai pai dongs")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:大牌檔:mock-unseen-mt70-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("innocent bystanders")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:無辜旁觀者:mock-unseen-mt70-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("illuminated neon signs")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:發光霓虹招牌:mock-unseen-mt73-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("culturally diverse")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["culturally diverse:phrase:adjective:文化多元的:mock-unseen-mt9-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("amateur theater companies")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["amateur theatre company:phrase:noun:業餘劇團:mock-unseen-mt9-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("agreed to disagree")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["agree to disagree:phrase:verb:同意彼此保留不同意見:mock-unseen-mt9-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("workplace skills")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["workplace skills:phrase:noun:職場技能:mock-unseen-mt9-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("reality TV programmes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["reality TV:phrase:noun:真人騷 / 真人實境節目:mock-unseen-mt9-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("singer songwriter")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["singer-songwriter:phrase:noun:創作歌手:mock-unseen-mt9-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in the unlikely event of")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["in the unlikely event of:phrase:preposition:萬一發生...時:mock-unseen-mt10-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("healthy options")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["healthy option:phrase:noun:健康選擇:mock-unseen-mt10-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("work smarter not harder")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["work smarter, not harder:phrase:verb:聰明工作而非盲目苦幹:mock-unseen-mt10-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("paper-free offices")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["paper-free office:phrase:noun:無紙化辦公室:mock-unseen-mt10-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("till all the seas go dry")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["till all the seas go dry:phrase:adverb:直到海枯石爛:mock-unseen-mt10-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("parachutists")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["parachutist:word:noun:跳傘者:mock-unseen-mt10-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dog-walking services")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["dog walking service:phrase:noun:遛狗服務:mock-unseen-mt11-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("break it to you")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["break it to:phrase:verb:把壞消息告訴...:mock-unseen-mt11-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("invasions of privacy")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["invasion of privacy:phrase:noun:侵犯私隱:mock-unseen-mt11-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("choking")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["choke:word:verb:窒息 / 哽住:mock-unseen-mt11-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("come around to")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["come round to:phrase:verb:來到...家 / 順道到...:mock-unseen-mt11-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("illegal loggers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["illegal logger:phrase:noun:非法伐木者:mock-unseen-mt11-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("regained consciousness")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["regain consciousness:phrase:verb:恢復知覺 / 醒過來:mock-unseen-mt11-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("audio books")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["audio book:phrase:noun:有聲書:mock-unseen-mt12-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in app purchases")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["in-app purchase:phrase:noun:應用程式內購買:mock-unseen-mt12-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("calm your nerves")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["calm one's nerves:phrase:verb:安撫緊張情緒 / 使自己冷靜:mock-unseen-mt12-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("complimenting me on")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["compliment someone on:phrase:verb:稱讚某人的...:mock-unseen-mt12-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("clapping along")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["clap along:phrase:verb:跟著節奏拍手:mock-unseen-mt12-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("learning centers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["learning centre:phrase:noun:補習中心 / 學習中心:mock-unseen-mt13-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("work-experience placement")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["work experience placement:phrase:noun:工作體驗實習 / 職場體驗安排:mock-unseen-mt13-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("week in week out")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["week in, week out:phrase:adverb:每星期都 / 周復周地:mock-unseen-mt13-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("legal restrictions")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["legal restriction:phrase:noun:法律限制:mock-unseen-mt13-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("closed down")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["close down:phrase:verb:結業 / 關閉:mock-unseen-mt13-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("follow in your footsteps")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["follow in someone's footsteps:phrase:verb:追隨某人的腳步 / 效法某人:mock-unseen-mt13-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("try my luck")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["try one's luck:phrase:verb:碰碰運氣 / 試試運氣:mock-unseen-mt13-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("medical bills")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["medical bill:phrase:noun:醫療費用 / 醫藥費:mock-unseen-mt13-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("financial security")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["financial security:phrase:noun:經濟保障 / 財務安全:mock-unseen-mt13-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("over-packaged goods")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["over-packaged:phrase:adjective:過度包裝的:mock-unseen-mt14-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("returning to the workforce")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["return to the workforce:phrase:verb:重返職場:mock-unseen-mt14-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("brand endorsements")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["brand endorsement:phrase:noun:品牌代言 / 品牌背書:mock-unseen-mt14-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("working from home")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["working from home:phrase:noun:在家工作:mock-unseen-mt14-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("met targets")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["meet targets:phrase:verb:達成目標 / 達標:mock-unseen-mt14-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("went bankrupt")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["go bankrupt:phrase:verb:破產:mock-unseen-mt28-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("individual sports")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["individual sport:phrase:noun:個人運動:mock-unseen-mt28-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("give them a go")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["give something a go:phrase:verb:試一試:mock-unseen-mt28-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("DAB radios")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["DAB radio:phrase:noun:數碼聲音廣播收音機:mock-unseen-mt28-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("runs right across her face")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["run right across:phrase:verb:橫跨 / 橫過:mock-unseen-mt28-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("upcycled")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["upcycle:word:verb:升級再造 / 改造再用:mock-unseen-mt29-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("spelt the end of")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["spell the end of:phrase:verb:導致...結束:mock-unseen-mt29-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hand-eye coordination")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["hand-eye coordination:phrase:noun:手眼協調:mock-unseen-mt84-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("keep your cool")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["keep one's cool:phrase:verb:保持冷靜:mock-unseen-mt29-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("superiors")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["superior:word:noun:上司 / 上級:mock-unseen-mt29-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("safety concerns")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["safety concern:phrase:noun:安全顧慮 / 安全問題:mock-unseen-mt33-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bring our game to the next level")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["bring something to the next level:phrase:verb:把...提升到更高水平:mock-unseen-mt33-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("company provided lunches")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["company-provided lunch:phrase:noun:公司提供的午餐:mock-unseen-mt33-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("tell on others")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["tell on someone:phrase:verb:告發某人 / 打小報告:mock-unseen-mt33-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("victimized")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["victimised:word:adjective:被欺負的 / 成為受害者的:mock-unseen-mt33-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Ngong Ping 360")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Ngong Ping 360:phrase:noun:昂坪360:mock-unseen-mt34-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cross harbour swimming race")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Cross-Harbour Swimming Race:phrase:noun:渡海泳比賽:mock-unseen-mt34-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("tight project deadlines")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["tight deadline:phrase:noun:緊迫的期限:mock-unseen-mt34-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("live streamed")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["live stream:phrase:verb:直播:mock-unseen-mt34-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("well groomed")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["well-groomed:phrase:adjective:打理整潔的 / 梳洗整齊的:mock-unseen-mt34-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("typhoon signal number 8")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Typhoon Signal Number 8:phrase:noun:八號颱風信號 / 八號風球:mock-unseen-mt36-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("signal was hoisted")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["hoist a signal:phrase:verb:懸掛信號 / 發出信號:mock-unseen-mt36-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("shared kitchen areas")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["shared kitchen area:phrase:noun:共用廚房區:mock-unseen-mt36-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("animal sanctuaries")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["animal sanctuary:phrase:noun:動物庇護所 / 動物保護區:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("reruns")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["re-run:phrase:noun:重播:mock-unseen-mt36-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("photo editing software")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["photo-editing software:phrase:noun:修圖軟件:mock-unseen-mt39-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gave in to")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["give in to:phrase:verb:屈服於 / 讓步於:mock-unseen-mt39-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stripped him of")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["strip someone of:phrase:verb:剝奪某人的... / 取消某人的...:mock-unseen-mt39-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("wage statistics")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["wage statistic:phrase:noun:工資統計數據:mock-unseen-mt39-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("binge watched")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["binge-watch:phrase:verb:一口氣追看:mock-unseen-mt39-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Big Dipper")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Big Dipper:phrase:noun:北斗七星:mock-unseen-mt39-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("positive reinforcement")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:正面鼓勵 / 正向強化:mock-unseen-mt39-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Instagram tourists")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Instagram tourist:phrase:noun:為拍照打卡而旅遊的人:mock-unseen-mt41-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("jostling for positions")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["jostle for position:phrase:verb:爭位 / 擠著搶位置:mock-unseen-mt41-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("first person shooters")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["first-person shooter:phrase:noun:第一身射擊遊戲:mock-unseen-mt41-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pitch invasions")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["pitch invasion:phrase:noun:球迷衝入球場:mock-unseen-mt41-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("punching above its weight")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["punch above one's weight:phrase:verb:表現超出自身規模 / 以小搏大:mock-unseen-mt41-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Michelin awarded")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Michelin-awarded:phrase:adjective:獲米芝蓮評級的:mock-unseen-mt41-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("nemeses")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["nemesis:noun:宿敵 / 難以戰勝的對手:mock-unseen-mt41-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rolls off the tongue")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["roll off the tongue:phrase:verb:說起來順口 / 容易上口:mock-unseen-mt41-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("leaves a lot to be desired")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["leave a lot to be desired:phrase:verb:有很多不足 / 未如理想:mock-unseen-mt41-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("vocal warm-up exercises")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["vocal warm-up:phrase:noun:開聲練習 / 聲樂熱身:mock-unseen-mt41-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("marches")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`).filter((line) => line.includes("mock-unseen-mt43-paper2-reviewed")),
    ["march:noun:遊行 / 示威遊行:mock-unseen-mt43-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("throwaway society")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["throw-away society:phrase:noun:即棄型社會 / 浪費型社會:mock-unseen-mt43-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("mixed team sports leagues")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["mixed-team sports league:phrase:noun:男女混合運動聯賽:mock-unseen-mt43-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("facial disfigurements")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["facial disfigurement:phrase:noun:面部毀容 / 面部缺陷:mock-unseen-mt43-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("held in high regard")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:備受尊敬的:mock-unseen-mt43-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("would be thieves")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["would-be thief:phrase:noun:潛在小偷 / 意圖偷竊的人:mock-unseen-mt43-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("breaking and entering")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:非法闖入 / 入屋犯法行為:mock-unseen-mt43-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("knocked down")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "phrase:verb:撞倒 / 撞跌:mock-unseen-mt27-paper3-reviewed",
      "phrase:verb:拆卸 / 拆掉:mock-unseen-mt73-paper2-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cinematic universes")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:電影宇宙:mock-unseen-mt73-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("AI-focused")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["AI-focussed:phrase:adjective:以人工智能為重點的:mock-unseen-mt73-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cream soda with milk")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:忌廉溝鮮奶:mock-unseen-mt73-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("food sharing areas")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:食物分享區:mock-unseen-mt77-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("mysterious red envelopes")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:神秘紅封包 / 神秘利是封:mock-unseen-mt77-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("one size fits all")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:一刀切的 / 不分差異的:mock-unseen-mt77-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("breathing new life into")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:為...注入新生命 / 令...重現活力:mock-unseen-mt77-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stepped out of my comfort zone")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:踏出舒適圈:mock-unseen-mt77-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("time capsules")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:時間囊 / 時光膠囊:mock-unseen-mt80-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("box office sales")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:票房收入 / 票房銷售:mock-unseen-mt80-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("embarking on a cruise")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:登上郵輪展開旅程:mock-unseen-mt80-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("open water swimming")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:公開水域游泳 / 戶外水域游泳:mock-unseen-mt80-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Cross Harbour Swim")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Cross Harbour Swim:phrase:noun:渡海泳:mock-unseen-mt80-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("study buddies")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:學習伙伴 / 功課伙伴:mock-unseen-mt84-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("looked up to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:尊敬 / 仰慕:mock-unseen-mt84-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fill in the blanks")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:填充的 / 填空的:mock-unseen-mt84-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pick up this language")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:學會一種語言 / 自然學懂語言:mock-unseen-mt84-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("alternate routes")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:替代路線 / 另一條路:mock-unseen-mt84-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Hong Kongers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Hong Konger:phrase:noun:香港人:mock-unseen-mt84-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("at any rate")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:無論如何 / 不管怎樣:mock-unseen-mt84-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("visual prompts")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["visual prompt:phrase:noun:圖片提示 / 視覺提示:mock-unseen-mt84-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("overcame jealous feelings")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["overcome jealous feelings:phrase:verb:克服妒忌心:mock-unseen-mt84-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("real-time error correction")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["real-time error correction:phrase:noun:即時錯誤糾正:mock-unseen-mt84-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in case of emergency")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["in case of emergency:phrase:adverb:以防緊急情況 / 遇到緊急情況時:mock-unseen-mt84-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("table for two")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["table for two:phrase:noun:二人桌 / 兩位用餐:mock-unseen-mt84-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("came to life")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:開始出現 / 變得活躍:mock-unseen-mt87-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("jade amulets")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:玉護身符 / 玉符:mock-unseen-mt87-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pay their way")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:自己負擔費用:mock-unseen-mt87-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("developing countries")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:發展中國家:mock-unseen-mt87-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("do more harm than good")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:弊多於利 / 害處多於好處:mock-unseen-mt87-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("vocational training")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:職業訓練:mock-unseen-mt87-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bidding for")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:申辦 / 爭取舉辦:mock-unseen-mt15-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Summer Olympics")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Summer Olympic Games:phrase:noun:夏季奧運會:mock-unseen-mt15-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("put their hearts and souls into")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:全心全意投入:mock-unseen-mt15-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("noxious fumes")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:有毒廢氣 / 有害煙霧:mock-unseen-mt15-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("get on each other's nerves")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:令某人煩躁 / 惹某人討厭:mock-unseen-mt15-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("jerked to a stop")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:猛然停下 / 突然一震停住:mock-unseen-mt15-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("went on the rampage")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["go on the rampage:phrase:verb:橫衝直撞地破壞 / 到處搗亂:mock-unseen-mt16-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("get lost")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "get lost:phrase:verb:迷路:mock-unseen-mt42-paper3-reviewed",
      "get lost:phrase:verb:走開 / 滾開:mock-unseen-mt16-paper2-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("home-schoolers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["home schooler:phrase:noun:在家學習的學生:mock-unseen-mt16-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("five star hotel")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["five-star hotel:phrase:noun:五星級酒店:mock-unseen-mt16-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("melt in the mouth")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["melt in your mouth:phrase:verb:入口即化:mock-unseen-mt16-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fancy dress parties")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fancy-dress party:phrase:noun:化裝派對:mock-unseen-mt16-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("took me back to")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["take someone back to:phrase:verb:使某人回想起...:mock-unseen-mt16-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("landslides")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["landslip:word:noun:山泥傾瀉:mock-unseen-mt16-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("curried fish balls")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["curried fish ball:phrase:noun:咖喱魚蛋:mock-unseen-mt18-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("crashed headlong into")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["crash headlong into:phrase:verb:頭朝前撞向:mock-unseen-mt18-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Winter Olympics")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Winter Olympic Games:phrase:noun:冬季奧運會:mock-unseen-mt18-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("keep a roof over our heads")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["keep a roof over one's head:phrase:verb:維持有地方住 / 保住棲身之所:mock-unseen-mt18-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("second-generation immigrants")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["second generation immigrant:phrase:noun:第二代移民:mock-unseen-mt18-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hold down a job")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["hold down a job:phrase:verb:保住一份工作 / 做得住一份工:mock-unseen-mt18-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("do our bit")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["do one's bit:phrase:verb:盡自己一分力:mock-unseen-mt18-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("jumped the queue")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["jump the queue:phrase:verb:打尖 / 插隊:mock-unseen-mt18-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Mass Transit Railway")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Mass Transit Railway:phrase:noun:港鐵 / 地下鐵路:mock-unseen-mt18-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("clutching at straws")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["clutch at straws:phrase:verb:抓住渺茫希望 / 作無望掙扎:mock-unseen-mt18-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ticket stubs")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["ticket stub:phrase:noun:票尾 / 票根:mock-unseen-mt18-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("tiger mothers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["tiger mother:phrase:noun:虎媽 / 嚴厲母親:mock-unseen-mt18-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ran into")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["run into:phrase:verb:偶然遇見 / 撞見:mock-unseen-mt18-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fumbled around")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fumble around:phrase:verb:摸索 / 笨拙地翻找:mock-unseen-mt18-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Memory Lane")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Memory Lane:phrase:noun:回憶長廊 / 懷舊回憶:mock-unseen-mt19-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("aquaphobia")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["aquaphobia:word:noun:恐水症 / 怕水:mock-unseen-mt19-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("far from finished")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["far from finished:phrase:adjective:遠未完成的:mock-unseen-mt19-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("live wires")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["live wire:phrase:noun:帶電電線 / 通電電線:mock-unseen-mt19-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("have you in stitches")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["have someone in stitches:phrase:verb:令某人笑到停不了:mock-unseen-mt19-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("star-studded")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["star-studded:phrase:adjective:明星雲集的:mock-unseen-mt19-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fiercely competitive")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fiercely competitive:phrase:adjective:競爭非常激烈的:mock-unseen-mt19-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("secure admission")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["secure admission:phrase:verb:取得入學資格 / 成功入讀:mock-unseen-mt19-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pay cut in disguise")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["pay cut in disguise:phrase:noun:變相減薪:mock-unseen-mt19-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("thin ideal")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["thin ideal:phrase:noun:以瘦為美的標準:mock-unseen-mt19-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("thigh gap")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["thigh gap:phrase:noun:大腿縫 / 大腿間距:mock-unseen-mt19-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("forked out")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fork out:phrase:verb:勉強付出 / 掏錢付:mock-unseen-mt19-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Monday morning blues")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Monday morning blues:phrase:noun:星期一上班上學的鬱悶心情:mock-unseen-mt19-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("catch a glimpse of")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["catch a glimpse of:phrase:verb:瞥見 / 匆匆看見:mock-unseen-mt19-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("deep-fried squid")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["deep-fried squid:phrase:noun:炸魷魚:mock-unseen-mt21-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("benefits and drawbacks")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["benefit and drawback:phrase:noun:好處和壞處 / 利弊:mock-unseen-mt21-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("get involved in")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["get involved in:phrase:verb:參與 / 投入:mock-unseen-mt21-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("deal with success and defeat")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["deal with success and defeat:phrase:verb:面對成功與失敗:mock-unseen-mt21-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sail around the world")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["sail around the world:phrase:verb:環遊世界航行:mock-unseen-mt21-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("care for the elderly")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["care for the elderly:phrase:verb:照顧長者:mock-unseen-mt21-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("call in on")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["call in on:phrase:verb:順道探望 / 探訪:mock-unseen-mt21-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("serve your internship")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["serve an internship:phrase:verb:實習 / 完成實習:mock-unseen-mt21-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stand me in good stead")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["stand someone in good stead:phrase:verb:對某人將來有幫助:mock-unseen-mt21-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("lead guitarist")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["lead guitarist:phrase:noun:主音結他手:mock-unseen-mt21-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("thick canopy")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["thick canopy:phrase:noun:茂密樹冠:mock-unseen-mt21-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("come alive")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["come alive:phrase:verb:恢復生氣 / 變得有活力:mock-unseen-mt21-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("think up")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["think up:phrase:verb:想出 / 構思出:mock-unseen-mt21-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("creative industries")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["creative industry:phrase:noun:創意產業:mock-unseen-mt21-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Adoption Day")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Adoption Day:phrase:noun:領養日 / 領養活動日:mock-unseen-mt23-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("locally sourced")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["locally sourced:phrase:adjective:本地採購的 / 本地來源的:mock-unseen-mt23-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("top of their game")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["at the top of one's game:phrase:adjective:處於最佳狀態 / 表現頂尖:mock-unseen-mt23-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("opening night performance")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["opening night performance:phrase:noun:首晚演出 / 開幕夜演出:mock-unseen-mt23-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fundraising activities")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fundraising activity:phrase:noun:籌款活動:mock-unseen-mt23-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("electronic copies")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["electronic copy:phrase:noun:電子版本 / 電子副本:mock-unseen-mt23-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("collecting dust")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["collect dust:phrase:verb:擺著不用 / 積塵:mock-unseen-mt23-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("online shopping website")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["online shopping website:phrase:noun:網上購物網站:mock-unseen-mt23-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("quote a price")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["quote a price:phrase:verb:報價:mock-unseen-mt23-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("traipse around")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["traipse around:phrase:verb:到處奔波 / 疲累地四處走:mock-unseen-mt23-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("quiz show")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["quiz show:phrase:noun:問答遊戲節目 / 競答節目:mock-unseen-mt23-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("conduct myself")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["conduct oneself:phrase:verb:表現自己 / 舉止得體:mock-unseen-mt23-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hologram menus")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["hologram menu:phrase:noun:全息影像餐牌:mock-unseen-mt23-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Tube Station")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Tube Station:phrase:noun:管道車站 / 未來交通站:mock-unseen-mt23-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("floating school")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["floating school:phrase:noun:空中學校 / 漂浮學校:mock-unseen-mt23-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("action figures")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["action figure:phrase:noun:動作人偶 / 可動公仔:mock-unseen-mt24-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("adrenaline rush")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adrenalin rush:phrase:noun:腎上腺素飆升 / 刺激感:mock-unseen-mt24-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("two sided argumentative essays")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["two-sided argumentative essay:phrase:noun:雙面議論文 / 正反議論文:mock-unseen-mt24-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("games consoles")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["game console:phrase:noun:遊戲機 / 遊戲主機:mock-unseen-mt24-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("posh")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["posh:word:adjective:高級的 / 有錢人味的:mock-unseen-mt24-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("could do with some")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["could do with:phrase:verb:需要 / 最好有:mock-unseen-mt26-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Kwai Tsing Container Port")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Kwai Tsing Container Port:phrase:noun:葵青貨櫃碼頭:mock-unseen-mt26-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fair trade")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fair trade:phrase:noun:公平貿易:mock-unseen-mt26-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gambling addictions")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["gambling addiction:phrase:noun:賭博成癮 / 賭癮:mock-unseen-mt26-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bury their heads in the sand")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["bury one's head in the sand:phrase:verb:逃避現實 / 不願面對問題:mock-unseen-mt26-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("jabbing")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["jab:word:verb:戳 / 猛戳:mock-unseen-mt26-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Thai wai greeting")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Thai wai greeting:phrase:noun:泰式合十鞠躬問候:mock-unseen-mt26-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("die-hard fans")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["diehard fan:phrase:noun:死忠粉絲:mock-unseen-mt26-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("four digit pin")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["four-digit PIN:phrase:noun:四位數密碼:mock-unseen-mt26-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("clueless")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["clueless:word:adjective:完全不明白的 / 無頭緒的:mock-unseen-mt26-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("donating blood")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["donate blood:phrase:verb:捐血:mock-unseen-mt31-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("work placements")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["work placement:phrase:noun:實習工作 / 工作體驗安排:mock-unseen-mt31-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("through the eyes of")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["through the eyes of:phrase:preposition:從...的角度:mock-unseen-mt31-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("backfired")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["backfire:word:verb:產生反效果 / 適得其反:mock-unseen-mt31-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("jumped on the bandwagon")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["jump on the bandwagon:phrase:verb:趕潮流 / 跟風:mock-unseen-mt31-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Careers Week")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Careers Week:phrase:noun:職業週:mock-unseen-mt31-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stretch my mind")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["stretch one's mind:phrase:verb:擴闊思維 / 挑戰思考:mock-unseen-mt31-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("drama workshops")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["drama workshop:phrase:noun:戲劇工作坊:mock-unseen-mt31-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("put their hearts into")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["put one's heart into:phrase:verb:全心投入:mock-unseen-mt31-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("deliver their speech")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["deliver a speech:phrase:verb:發表演說 / 演講:mock-unseen-mt31-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stand-up paddle surfing")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:直立板衝浪 / 直立划板:mock-unseen-mt17-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Shing Mun River")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Shing Mun River:phrase:noun:城門河:mock-unseen-mt17-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cordoned off")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:封鎖 / 圍封:mock-unseen-mt17-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Pearl River Delta")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Pearl River Delta:phrase:noun:珠江三角洲:mock-unseen-mt17-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Individual Visit Scheme")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Individual Visit Scheme:phrase:noun:個人遊計劃:mock-unseen-mt17-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Michelin starred restaurants")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:米芝蓮星級餐廳:mock-unseen-mt17-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("give me a break")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:饒了我吧 / 別煩我:mock-unseen-mt17-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("mortarboards")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:四方帽 / 畢業帽:mock-unseen-mt17-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("where their talent lies")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:某人的才能所在:mock-unseen-mt20-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in safe hands")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:由可靠的人照顧 / 安全可靠:mock-unseen-mt20-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("variety is the spice of life")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:變化使生活更有趣:mock-unseen-mt20-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("black and white")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:黑白分明的 / 單調的:mock-unseen-mt20-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("zookeepers")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:動物園管理員 / 飼養員:mock-unseen-mt20-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("must-see destination")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:必到目的地:mock-unseen-mt22-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("haggling")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:講價 / 討價還價:mock-unseen-mt22-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("agony aunt")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:答讀者煩惱的專欄作者:mock-unseen-mt22-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Symphony of Lights")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Symphony of Lights:phrase:noun:幻彩詠香江:mock-unseen-mt22-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("well signposted")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:有清楚路牌指示的:mock-unseen-mt22-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("never left his side")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:離開某人身邊:mock-unseen-mt22-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("marched him to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:押送某人到:mock-unseen-mt22-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("yum cha")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:飲茶:mock-unseen-mt25-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Rugby Sevens")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Rugby Sevens:phrase:noun:七人欖球賽:mock-unseen-mt25-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("take on board")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:接受並考慮 / 聽取:mock-unseen-mt25-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dented")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:削弱 / 打擊:mock-unseen-mt25-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rent the air")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:劃破長空 / 響徹空中:mock-unseen-mt25-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("to no avail")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:徒勞無功 / 無效:mock-unseen-mt25-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Comic-Con")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Comic-Con:phrase:noun:動漫展 / 漫畫展:mock-unseen-mt25-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("have your heart set on")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:一心想要 / 決心要:mock-unseen-mt25-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rooting for")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:支持 / 為...打氣:mock-unseen-mt25-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("environment friendly")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["environment-friendly:phrase:adjective:環保的:mock-unseen-mt27-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sports ambassador")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:體育大使 / 運動代表:mock-unseen-mt27-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("line managed")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["line-manage:phrase:verb:直接管理 / 作為直屬上司管理:mock-unseen-mt27-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("shark's fin soup")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["shark fin soup:phrase:noun:魚翅湯:mock-unseen-mt27-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("passers-by")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["passer-by:phrase:noun:途人 / 路人:mock-unseen-mt27-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("have in store")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:即將推出 / 準備好:mock-unseen-mt27-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("platform games")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:平台遊戲:mock-unseen-mt27-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Poetry Society")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Poetry Society:phrase:noun:詩社 / 詩歌學會:mock-unseen-mt27-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("work experience")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:工作體驗 / 工作經驗:mock-unseen-mt27-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sets")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`).filter((line) => line.includes("mock-unseen-mt27-paper2-reviewed")),
    ["set:noun:佈景 / 舞台布景:mock-unseen-mt27-paper2-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cut from the same cloth")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:同類的 / 本質相似的:mock-unseen-mt15-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("World Cosplay Summit")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["World Cosplay Summit:phrase:noun:世界 Cosplay 峰會:mock-unseen-mt15-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("LARPs")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["LARP:noun:真人角色扮演遊戲:mock-unseen-mt15-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pathological gamers")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:病態遊戲玩家:mock-unseen-mt15-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("caving in")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:讓步 / 屈服:mock-unseen-mt15-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("caught on like wildfire")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:迅速流行起來:mock-unseen-mt17-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ISS")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["International Space Station:phrase:noun:國際太空站:mock-unseen-mt17-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("seeping through")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:滲透 / 滲入:mock-unseen-mt17-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("electronic cigarettes")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:電子煙:mock-unseen-mt17-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("kicking the habit")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:戒掉壞習慣 / 戒煙癮:mock-unseen-mt17-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("withdrawal symptoms")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:戒斷症狀:mock-unseen-mt17-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("linear TV")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["linear TV:phrase:noun:線性電視 / 傳統電視:mock-unseen-mt63-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Sharp Peak")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Sharp Peak:phrase:noun:蚺蛇尖:mock-unseen-mt63-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("snap-happy invaders")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["snap-happy invader:phrase:noun:瘋狂拍照的闖入者:mock-unseen-mt63-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("left on the cutting-room floor")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:被剪掉的 / 被刪走的:mock-unseen-mt63-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Qatar")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Qatar:noun:卡塔爾:mock-unseen-mt66-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("human rights record")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:人權紀錄:mock-unseen-mt66-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("on the table")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:正在考慮中的:mock-unseen-mt66-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("goblin mode")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:放縱懶散模式 / 不理社會期望的狀態:mock-unseen-mt66-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rubbing their achievements in everyone else's face")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:炫耀成就 / 把成就曬給別人看:mock-unseen-mt66-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Korean Wave")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Korean Wave:phrase:noun:韓流:mock-unseen-mt87-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("push the envelope")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:突破界限 / 挑戰極限:mock-unseen-mt87-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("venture capital")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:風險投資:mock-unseen-mt87-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("buddying up")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:結伴同行 / 找同伴:mock-unseen-mt87-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("slow parenting")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:慢養育 / 慢節奏育兒:mock-unseen-mt87-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dip their toe in")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:初步嘗試 / 小試牛刀:mock-unseen-mt87-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cross our fingers")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:祈求好運 / 希望順利:mock-unseen-mt20-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hit the nail on the head")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:說得完全正確 / 一針見血:mock-unseen-mt20-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gave away")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "phrase:verb:捐出 / 送出:mock-unseen-mt20-paper1-reviewed",
      "phrase:verb:洩露 / 透露:mock-unseen-mt40-paper2-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("orphanages")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:孤兒院:mock-unseen-mt20-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("foreign domestic helpers")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:外籍家庭傭工 / 外傭:mock-unseen-mt20-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("SMW")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["statutory minimum wage:phrase:noun:法定最低工資:mock-unseen-mt20-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("MAW")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["minimum allowable wage:phrase:noun:最低允許工資:mock-unseen-mt20-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("TV personality")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:電視名人:mock-unseen-mt22-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gawked at")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:呆望 / 盯著看:mock-unseen-mt22-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sea hibiscus")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:黃槿 / 海濱木槿:mock-unseen-mt22-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("tip over")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:翻側 / 翻倒:mock-unseen-mt22-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("getting the hang of")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:掌握技巧 / 學會竅門:mock-unseen-mt22-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("brownfield site")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:棕地 / 已發展後閒置土地:mock-unseen-mt25-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Small House Policy")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Small House Policy:phrase:noun:丁屋政策 / 小型屋宇政策:mock-unseen-mt25-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("at a premium")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:供不應求的 / 非常珍貴的:mock-unseen-mt25-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("property bubble")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:樓市泡沫 / 物業泡沫:mock-unseen-mt25-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("priced out of the market")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:因價格太高而被市場排除的:mock-unseen-mt25-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cut my losses")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:止蝕 / 減少損失:mock-unseen-mt25-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("up their game")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:提升表現 / 加把勁:mock-unseen-mt27-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("waterslide tester")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:水上滑梯測試員:mock-unseen-mt27-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("living out of a suitcase")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:長期在外奔波 / 經常旅行:mock-unseen-mt27-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("snuffed out")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:殺死 / 消滅:mock-unseen-mt27-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Arctic Circle")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Arctic Circle:phrase:noun:北極圈:mock-unseen-mt27-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("getting my bearings")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:弄清方向 / 了解身處環境:mock-unseen-mt27-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("run-of-the-mill")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:普通的 / 平凡的:mock-unseen-mt30-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("tourist trap")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:遊客陷阱 / 專賺遊客錢的地方:mock-unseen-mt30-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flexitarianism")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:彈性素食主義:mock-unseen-mt30-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sure-fire")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:肯定成功的 / 穩妥的:mock-unseen-mt30-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ethically indefensible")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:道德上站不住腳的:mock-unseen-mt30-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Meat-free Monday")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Meat-free Monday:phrase:noun:無肉星期一運動:mock-unseen-mt30-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("virtual doctor")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:虛擬醫生 / 電腦醫生:mock-unseen-mt32-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("far-fetched")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:牽強的 / 難以相信的:mock-unseen-mt32-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("heart attack")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:心臟病發 / 心肌梗塞:mock-unseen-mt32-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gender-neutral uniform")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:性別中立校服 / 不分性別的校服:mock-unseen-mt32-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Chinese tunic suit")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Chinese tunic suit:phrase:noun:中山裝:mock-unseen-mt32-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("frown upon")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:不贊成 / 反對:mock-unseen-mt32-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rival")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:對手 / 競爭者:curated-sense-bank",
      "adjective:競爭的:curated-sense-bank",
      "verb:媲美 / 與...匹敵:mock-unseen-mt59-paper1-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("squash")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:壁球:mock-unseen-mt59-paper1-reviewed",
      "verb:壓扁 / 壓爛:mock-unseen-mt35-paper3-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("HIIT")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["HIIT:phrase:noun:高強度間歇訓練:mock-unseen-mt59-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("heart rate")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:心率 / 心跳率:mock-unseen-mt59-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("graphic novel")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:圖像小說 / 漫畫小說:mock-unseen-mt70-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("white knuckles")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:因害怕而握緊至發白的手:mock-unseen-mt70-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("thermal vent")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:熱泉口 / 熱液噴口:mock-unseen-mt70-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("implode")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:向內爆裂 / 內爆:mock-unseen-mt70-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("illustrious")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:著名且受尊敬的:mock-unseen-mt73-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("euthanasia")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:安樂死:mock-unseen-mt73-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("phase out")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:逐步淘汰 / 逐步停止:mock-unseen-mt73-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("watered down")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:削弱 / 淡化:mock-unseen-mt73-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("HSP")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["highly sensitive person:phrase:noun:高敏感人士:mock-unseen-mt52-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("no-frills")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:簡單實用的 / 沒有花巧服務的:mock-unseen-mt52-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("French toast")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:西多士 / 法式多士:mock-unseen-mt52-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("tabletop game")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:桌上遊戲:mock-unseen-mt52-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("game changer")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:改變局面的事物 / 重大轉捩點:mock-unseen-mt52-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("couch-to-5K")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["couch-to-5K:phrase:noun:由零開始跑五公里的訓練計劃:mock-unseen-mt49-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("birdcage")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:鳥籠:mock-unseen-mt49-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Mai Po Marshes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Mai Po Marshes:phrase:noun:米埔濕地:mock-unseen-mt49-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Blue Zones")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Blue Zone:phrase:noun:藍區 / 長壽地區:mock-unseen-mt49-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("life expectancy")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:預期壽命:mock-unseen-mt49-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("location sharing app")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:位置分享應用程式:mock-unseen-mt45-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("microcation")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:短途短假期 / 微度假:mock-unseen-mt45-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("staycation")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:留家度假 / 本地度假:mock-unseen-mt45-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("add fuel to the fire")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:火上加油 / 令問題惡化:mock-unseen-mt45-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("lesser-known destination")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:較少人認識的目的地:mock-unseen-mt45-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("e-waste")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:電子廢物:mock-unseen-mt42-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("planned obsolescence")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:計劃性淘汰 / 有意設計成短壽命:mock-unseen-mt42-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("greywater")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:生活污水 / 可重用廢水:mock-unseen-mt42-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("per capita")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:人均 / 每人計:mock-unseen-mt42-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("mock meats")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:素肉 / 仿肉:mock-unseen-mt42-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gained traction")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:開始受支持 / 逐漸被接受:mock-unseen-mt38-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("delayed gratification")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:延遲滿足 / 等待後才得到滿足:mock-unseen-mt38-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("titivating")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:修飾 / 反覆修改:mock-unseen-mt38-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("capture point")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:記錄點 / 收集想法的位置:mock-unseen-mt38-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("word-processing software")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:文字處理軟件:mock-unseen-mt38-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("classified ad")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:分類廣告:mock-unseen-mt35-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("proven track record")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:已證明的良好往績:mock-unseen-mt35-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("autopilot")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:自動駕駛系統:mock-unseen-mt35-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("come clean")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:坦白承認 / 說出真相:mock-unseen-mt35-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("BASE jumping")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["BASE jumping:phrase:noun:定點跳傘:mock-unseen-mt35-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("transatlantic flight")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:橫越大西洋的飛行:mock-unseen-mt35-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cynophobia")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:恐狗症 / 對狗的恐懼:mock-unseen-mt56-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("tea connoisseur")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:茶藝鑑賞家 / 懂茶的人:mock-unseen-mt56-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fast fashion")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:快時尚 / 快速時裝:mock-unseen-mt56-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ephemeral")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:短暫的 / 轉瞬即逝的:mock-unseen-mt56-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("digital detox")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:戒用電子產品 / 數碼排毒:mock-unseen-mt84-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hand-eye coordination")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:手眼協調:mock-unseen-mt84-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("take a toll")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:對...造成傷害 / 有負面影響:mock-unseen-mt84-paper1-reviewed"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("campaign")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:活動:curated-sense-bank",
      "noun:運動:curated-sense-bank",
      "verb:發起運動:curated-sense-bank",
      "verb:參與運動:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("capital")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:首都:curated-sense-bank",
      "noun:資本:curated-sense-bank",
      "noun:資金:curated-sense-bank",
      "adjective:大寫的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("degree")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:度數:curated-sense-bank",
      "noun:程度:curated-sense-bank",
      "noun:大學學位:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("nature")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:大自然:curated-sense-bank",
      "noun:性質 / 特質:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cabinet")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:櫥櫃:curated-sense-bank",
      "noun:內閣:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("canvas")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:畫布:curated-sense-bank",
      "noun:帆布:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("career")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:職業:curated-sense-bank",
      "noun:事業:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cease")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:停止:curated-sense-bank",
      "verb:終止:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("challenge")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:挑戰:curated-sense-bank",
      "verb:挑戰:curated-sense-bank",
      "verb:質疑:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("casual")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:隨便的:curated-sense-bank",
      "adjective:非正式的:curated-sense-bank",
      "adjective:偶然的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("chest")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:胸部:curated-sense-bank",
      "noun:胸腔:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("capture")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:捕捉:curated-sense-bank",
      "verb:俘虜:curated-sense-bank",
      "verb:拍攝:curated-sense-bank",
      "verb:記錄:curated-sense-bank",
      "noun:捕獲:curated-sense-bank",
      "noun:佔領:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("across")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "preposition:橫過 / 穿過 / 遍及:curated-sense-bank",
      "preposition:在...對面:curated-sense-bank",
      "adverb:橫過去 / 在對面:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("reverse-only-word")).map((entry) => `${entry.pos || entry.type}:${entry.meaning}:${entry.source}`),
    []
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fc")).map((entry) => `${entry.pos || entry.type}:${entry.meaning}:${entry.source}`),
    []
  );

  assert.deepStrictEqual(
    (await lookupForStudent("busy")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:忙碌的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("her")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "pronoun:她:curated-sense-bank",
      "determiner:她的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("it")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["it:pronoun:它 / 牠 / 這件事:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("IT")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["IT:noun:資訊科技:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("k")).map((entry) => `${entry.pos || entry.type}:${entry.meaning}:${entry.source}`),
    []
  );
  assert.deepStrictEqual(
    (await lookupForStudent("l")).map((entry) => `${entry.pos || entry.type}:${entry.meaning}:${entry.source}`),
    []
  );
  assert.deepStrictEqual(
    (await lookupForStudent("m")).map((entry) => `${entry.pos || entry.type}:${entry.meaning}:${entry.source}`),
    []
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rule out")).map((entry) => `${entry.pos || entry.type}:${entry.meaning}:${entry.source}`),
    ["verb:排除 / 不考慮:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("corporate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:公司層面的:teacher-live"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("same-day-word", { fetchLiveTeacher: true })).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:即日新增字:teacher-live"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("live-duplicate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:已審查意思:teacher-live"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pretty")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:漂亮的:curated-sense-bank",
      "adverb:頗 / 相當:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("beard")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:鬍鬚:teacher"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hammer")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:用錘敲打:teacher",
      "noun:錘子:teacher"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cancelled")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:取消:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("have")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:有:curated-sense-bank",
      "verb:食 / 飲:curated-sense-bank",
      "verb:上 / 參加:curated-sense-bank",
      "auxiliary:已經（完成式助動詞）:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("have a look")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:看一看:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("have lunch")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:吃午餐:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("have a shower")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:洗澡:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("game")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:遊戲:curated-sense-bank",
      "noun:比賽:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("guts")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:膽量 / 勇氣:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("give")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:給 / 交給:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("mean")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:意思是 / 意味著:curated-sense-bank",
      "adjective:刻薄的:curated-sense-bank",
      "adjective:吝嗇的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("right")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:正確的:curated-sense-bank",
      "adjective:右邊的:curated-sense-bank",
      "noun:右邊 / 右方:curated-sense-bank",
      "adverb:向右:curated-sense-bank",
      "noun:權利:curated-sense-bank",
      "adverb:正確地:curated-sense-bank",
      "adverb:立刻 / 馬上:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("left")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:左邊的:curated-sense-bank",
      "noun:左邊:curated-sense-bank",
      "adverb:向左:curated-sense-bank",
      "adverb:在左邊:curated-sense-bank",
      "verb:離開了（leave 的過去式 / PP）:curated-sense-bank",
      "verb:留下了（leave 的過去式 / PP）:curated-sense-bank",
      "verb:離開 / 遺留 / 剩下（leave 過去式 / PP）:verb-table-form"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("light")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:光:curated-sense-bank",
      "noun:燈:curated-sense-bank",
      "adjective:輕的:curated-sense-bank",
      "adjective:淺色的:curated-sense-bank",
      "verb:點燃:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sound")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:聲音:curated-sense-bank",
      "verb:聽起來:curated-sense-bank",
      "adjective:合理的:curated-sense-bank",
      "adjective:可靠的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("class")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:班級:curated-sense-bank",
      "noun:課堂:curated-sense-bank",
      "noun:種類 / 類別:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hard")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:困難的:curated-sense-bank",
      "adjective:硬的:curated-sense-bank",
      "adverb:努力地:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("free")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:免費的:curated-sense-bank",
      "adjective:自由的:curated-sense-bank",
      "verb:釋放 / 使自由:curated-sense-bank",
      "adverb:免費地:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ask")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:問:curated-sense-bank",
      "verb:要求:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("call")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:打電話:curated-sense-bank",
      "verb:稱呼:curated-sense-bank",
      "noun:電話 / 呼叫:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("see")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:看見:curated-sense-bank",
      "verb:明白:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("tell")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:告訴:curated-sense-bank",
      "verb:講述:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("get")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:得到:curated-sense-bank",
      "verb:取得:curated-sense-bank",
      "verb:收到:curated-sense-bank",
      "verb:到達:curated-sense-bank",
      "verb:變得:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("make")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:製作:curated-sense-bank",
      "verb:製造:curated-sense-bank",
      "verb:使:curated-sense-bank",
      "verb:令:curated-sense-bank",
      "noun:品牌 / 型號:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("take")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:拿:curated-sense-bank",
      "verb:取:curated-sense-bank",
      "verb:帶:curated-sense-bank",
      "verb:乘搭:curated-sense-bank",
      "verb:花費時間:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("order")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:次序:curated-sense-bank",
      "noun:命令:curated-sense-bank",
      "noun:訂單:curated-sense-bank",
      "verb:訂購:curated-sense-bank",
      "verb:命令:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("present")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:禮物:curated-sense-bank",
      "noun:現在:curated-sense-bank",
      "adjective:現在的:curated-sense-bank",
      "adjective:在場的:curated-sense-bank",
      "verb:呈現:curated-sense-bank",
      "verb:展示:curated-sense-bank",
      "verb:頒發:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("period")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:時期 / 期間:curated-sense-bank",
      "noun:課節:curated-sense-bank",
      "noun:句號:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("run")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:跑:curated-sense-bank",
      "verb:經營 / 營運:curated-sense-bank",
      "verb:運行:curated-sense-bank",
      "noun:跑步 / 一段路程:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("match")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:比賽:curated-sense-bank",
      "noun:火柴:curated-sense-bank",
      "verb:配對:curated-sense-bank",
      "verb:相配:curated-sense-bank",
      "verb:相襯:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("validity")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:有效性:curated-sense-bank",
      "noun:合理性:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("signature")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:標誌性的 / 招牌的:curated-sense-bank",
      "noun:簽名:curated-sense-bank",
      "noun:特色 / 標誌:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cub")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:幼獸:teacher"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("emergency")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:緊急情況:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("frequently")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adverb:經常 / 頻繁地:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("generally")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adverb:一般來說 / 通常:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("illegal")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:非法的 / 違法的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("medium")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:中等的:curated-sense-bank",
      "noun:媒介 / 媒體:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("operation")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:手術:curated-sense-bank",
      "noun:運作 / 操作:curated-sense-bank",
      "noun:營運 / 經營:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("property")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:物業 / 房地產:curated-sense-bank",
      "noun:財產:curated-sense-bank",
      "noun:性質 / 特質:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("simply")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adverb:只是 / 僅僅:curated-sense-bank",
      "adverb:簡單地:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("access")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:使用權 / 途徑:curated-sense-bank",
      "verb:存取 / 使用:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("aim")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:目標:curated-sense-bank",
      "noun:目的:curated-sense-bank",
      "verb:旨在:curated-sense-bank",
      "verb:瞄準:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("agency")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:機構:curated-sense-bank",
      "noun:代理公司:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("aggressive")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:有攻擊性的:curated-sense-bank",
      "adjective:進取的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("point")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:重點:curated-sense-bank",
      "noun:分數:curated-sense-bank",
      "noun:點 / 小點:curated-sense-bank",
      "verb:指著 / 指向:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("brand")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:品牌:curated-sense-bank",
      "verb:把...稱為:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("complex")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:複雜的:curated-sense-bank",
      "noun:綜合大樓 / 綜合體:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("case")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:情況:curated-sense-bank",
      "noun:個案:curated-sense-bank",
      "noun:案件:curated-sense-bank",
      "noun:盒:curated-sense-bank",
      "noun:箱:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("board")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:板:curated-sense-bank",
      "noun:委員會 / 董事會:curated-sense-bank",
      "verb:登上 / 上車:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cases")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "case:noun:情況:curated-sense-bank",
      "case:noun:個案:curated-sense-bank",
      "case:noun:案件:curated-sense-bank",
      "case:noun:盒:curated-sense-bank",
      "case:noun:箱:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("plot")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:情節:curated-sense-bank",
      "noun:小塊土地:curated-sense-bank",
      "verb:密謀 / 策劃:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("press")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:傳媒 / 新聞界:curated-sense-bank",
      "verb:按 / 壓:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rarely")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adverb:很少 / 甚少:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("arrest")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:逮捕:curated-sense-bank",
      "noun:拘捕:curated-sense-bank",
      "verb:逮捕:curated-sense-bank",
      "verb:拘捕:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("doubt")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:懷疑 / 疑問:curated-sense-bank",
      "verb:懷疑 / 不相信:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("escape")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:逃脫 / 逃走:curated-sense-bank",
      "verb:逃脫 / 逃離:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fancy")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:花巧的 / 高級的:curated-sense-bank",
      "verb:想要 / 喜歡:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fuel")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:燃料:curated-sense-bank",
      "verb:加劇:curated-sense-bank",
      "verb:推動:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("faith")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:信任:curated-sense-bank",
      "noun:信心:curated-sense-bank",
      "noun:信仰:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("finance")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:財務:curated-sense-bank",
      "noun:資金:curated-sense-bank",
      "verb:資助:curated-sense-bank",
      "verb:提供資金:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("finding")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:發現:curated-sense-bank",
      "noun:研究結果:curated-sense-bank",
      "verb:發現 / 找到（find ING）:verb-table-form"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("brief")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:短暫的:curated-sense-bank",
      "adjective:簡短的:curated-sense-bank",
      "noun:摘要:curated-sense-bank",
      "noun:指示:curated-sense-bank",
      "verb:向...簡介:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("broad")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:寬闊的:curated-sense-bank",
      "adjective:廣泛的:curated-sense-bank",
      "adjective:概括的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("calculate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:計算:curated-sense-bank",
      "verb:估計:curated-sense-bank",
      "verb:推算:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("coverage")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:新聞報道:curated-sense-bank",
      "noun:覆蓋範圍:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("crack")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:裂縫:curated-sense-bank",
      "verb:破裂 / 裂開:curated-sense-bank",
      "verb:破解 / 解決:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("craft")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:手藝 / 工藝:curated-sense-bank",
      "noun:船 / 飛行器:curated-sense-bank",
      "verb:精心製作:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("creation")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:創造 / 創作:curated-sense-bank",
      "noun:創作品:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("row")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:一排:curated-sense-bank",
      "noun:爭吵:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Polish")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "Polish:adjective:波蘭的:curated-sense-bank",
      "Polish:noun:波蘭語 / 波蘭人:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("polish")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["polish:verb:擦亮 / 潤飾:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("entrance exam")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:入學試:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("matter")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:事情:curated-sense-bank",
      "noun:問題:curated-sense-bank",
      "noun:物質:curated-sense-bank",
      "verb:重要 / 有關係:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("matters")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "matter:noun:事情:curated-sense-bank",
      "matter:noun:問題:curated-sense-bank",
      "matter:noun:物質:curated-sense-bank",
      "matter:verb:重要 / 有關係:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("charges")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "charge:verb:充電:curated-sense-bank",
      "charge:verb:收費:curated-sense-bank",
      "charge:verb:指控:curated-sense-bank",
      "charge:noun:費用:curated-sense-bank",
      "charge:noun:指控:curated-sense-bank",
      "charge:noun:控罪:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("conduct")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:行為:curated-sense-bank",
      "verb:進行:curated-sense-bank",
      "verb:指揮:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("project")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:專題:curated-sense-bank",
      "noun:項目:curated-sense-bank",
      "verb:預計:curated-sense-bank",
      "verb:投射:curated-sense-bank",
      "verb:使聲音傳遠 / 放聲說話:mock-unseen-mt38-paper2-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("harm")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:傷害:curated-sense-bank",
      "noun:損害:curated-sense-bank",
      "verb:傷害:curated-sense-bank",
      "verb:損害:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("subjects")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "subject:noun:科目:curated-sense-bank",
      "subject:noun:主題:curated-sense-bank",
      "subject:noun:實驗對象:curated-sense-bank",
      "subject:verb:使遭受 / 使受制於:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("subject to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:受...影響的 / 取決於:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("effect")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:影響:curated-sense-bank",
      "noun:效果:curated-sense-bank"
    ]
  );
  assert.deepStrictEqual(
    (await lookupForStudent("affect")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:影響:curated-sense-bank"]
  );
  assert.deepStrictEqual(
    (await lookupForStudent("claim")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:聲稱:curated-sense-bank",
      "verb:索取 / 要求:curated-sense-bank",
      "noun:聲稱:curated-sense-bank",
      "noun:索償 / 要求:curated-sense-bank"
    ]
  );
  assert.deepStrictEqual(
    (await lookupForStudent("concern")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:擔憂 / 關注:curated-sense-bank",
      "verb:使擔心:curated-sense-bank",
      "verb:關乎 / 涉及:curated-sense-bank"
    ]
  );
  assert.deepStrictEqual(
    (await lookupForStudent("condition")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:狀況:curated-sense-bank",
      "noun:狀態:curated-sense-bank",
      "noun:條件:curated-sense-bank",
      "noun:環境 / 情況:curated-sense-bank"
    ]
  );
  assert.deepStrictEqual(
    (await lookupForStudent("quality")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:質素 / 品質:curated-sense-bank",
      "noun:特質 / 特點:curated-sense-bank"
    ]
  );
  assert.deepStrictEqual(
    (await lookupForStudent("have an effect on")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:對...有影響:curated-sense-bank"]
  );
  assert.deepStrictEqual(
    (await lookupForStudent("have impact on")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:對...有影響 / 對...有衝擊:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("effects")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "effect:noun:影響:curated-sense-bank",
      "effect:noun:效果:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("reason")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:理由:curated-sense-bank",
      "noun:原因:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("causes")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "cause:noun:原因:curated-sense-bank",
      "cause:verb:導致:curated-sense-bank",
      "cause:verb:引起:curated-sense-bank"
    ]
  );
  assert.deepStrictEqual(
    (await lookupForStudent("cause")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:原因:curated-sense-bank",
      "verb:導致:curated-sense-bank",
      "verb:引起:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("mark")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:分數:curated-sense-bank",
      "noun:標記 / 記號:curated-sense-bank",
      "verb:標記:curated-sense-bank",
      "verb:批改 / 評分:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("issue")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:問題 / 議題:curated-sense-bank",
      "verb:發出 / 發布:curated-sense-bank",
      "verb:發給 / 發出:mock-unseen-mt19-paper3-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("range")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:範圍:curated-sense-bank",
      "noun:一系列:curated-sense-bank",
      "verb:介乎 / 變動:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("subject")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:科目:curated-sense-bank",
      "noun:主題:curated-sense-bank",
      "noun:實驗對象:curated-sense-bank",
      "verb:使遭受 / 使受制於:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("figure")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:數字:curated-sense-bank",
      "noun:人物:curated-sense-bank",
      "noun:圖表:curated-sense-bank",
      "noun:身材:curated-sense-bank",
      "verb:認為 / 估計:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("address")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:地址:curated-sense-bank",
      "verb:處理 / 應付:curated-sense-bank",
      "verb:向...講話:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cover")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:覆蓋:curated-sense-bank",
      "verb:包括 / 涉及:curated-sense-bank",
      "noun:封面:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("balance")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:平衡:curated-sense-bank",
      "verb:保持平衡:curated-sense-bank",
      "noun:餘額:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bill")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:帳單:curated-sense-bank",
      "verb:開帳單給 / 宣傳為:curated-sense-bank",
      "noun:鳥嘴 / 喙:mock-unseen-mt59-paper3-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("branch")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:樹枝:curated-sense-bank",
      "noun:分店 / 分支:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("change")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:改變:curated-sense-bank",
      "noun:變化:curated-sense-bank",
      "noun:零錢:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("results")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "result:noun:結果:curated-sense-bank",
      "result:verb:導致 / 產生結果:curated-sense-bank"
    ]
  );
  assert.deepStrictEqual(
    (await lookupForStudent("result")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:結果:curated-sense-bank",
      "verb:導致 / 產生結果:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("role")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:角色:curated-sense-bank",
      "noun:作用 / 職責:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("story")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:故事:curated-sense-bank",
      "noun:樓層 / 層:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("letter")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:信:curated-sense-bank",
      "noun:字母:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("approach")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:方法 / 方式:curated-sense-bank",
      "verb:接近:curated-sense-bank",
      "verb:處理 / 對待:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cost")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:花費:curated-sense-bank",
      "noun:費用 / 成本:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("credit")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:信用 / 學分 / 讚揚:curated-sense-bank",
      "verb:歸功於:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("deal")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:處理:curated-sense-bank",
      "noun:交易 / 協議:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("impacts")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "impact:noun:影響 / 衝擊:curated-sense-bank",
      "impact:verb:影響 / 衝擊:curated-sense-bank"
    ]
  );
  assert.deepStrictEqual(
    (await lookupForStudent("impact")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:影響 / 衝擊:curated-sense-bank",
      "verb:影響 / 衝擊:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("term")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:學期:curated-sense-bank",
      "noun:詞語 / 術語:curated-sense-bank",
      "noun:條款:curated-sense-bank",
      "noun:期限:curated-sense-bank",
      "verb:稱為 / 把...叫做:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("terms")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "terms:noun:條款:curated-sense-bank",
      "terms:noun:條件:curated-sense-bank",
      "terms:noun:關係 / 說法:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("terms and conditions")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:條款及細則:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("charge")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:充電:curated-sense-bank",
      "verb:收費:curated-sense-bank",
      "verb:指控:curated-sense-bank",
      "noun:費用:curated-sense-bank",
      "noun:指控:curated-sense-bank",
      "noun:控罪:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fine")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:好的 / 不錯的:curated-sense-bank",
      "noun:罰款:curated-sense-bank",
      "verb:罰款:curated-sense-bank",
      "adjective:細微的 / 精細的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("store")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:商店:curated-sense-bank",
      "verb:儲存:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("support")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:支持 / 支援:curated-sense-bank",
      "noun:支持 / 支援:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("touch")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:觸摸 / 接觸:curated-sense-bank",
      "noun:觸碰:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("value")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:價值:curated-sense-bank",
      "verb:重視 / 珍惜:curated-sense-bank",
      "verb:估價:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("view")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:觀點 / 看法:curated-sense-bank",
      "noun:景色:curated-sense-bank",
      "verb:觀看 / 查看:curated-sense-bank",
      "verb:視為 / 看待:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pick")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:挑選 / 摘:curated-sense-bank",
      "noun:選擇:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("spring")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:春天:curated-sense-bank",
      "noun:泉水:curated-sense-bank",
      "verb:跳起 / 彈起:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("strike")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:擊打 / 撞擊:curated-sense-bank",
      "verb:罷工:curated-sense-bank",
      "noun:罷工:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("conditions")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "condition:noun:狀況:curated-sense-bank",
      "condition:noun:狀態:curated-sense-bank",
      "condition:noun:條件:curated-sense-bank",
      "condition:noun:環境 / 情況:curated-sense-bank",
      "terms:noun:條款:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("boards")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "board:noun:板:curated-sense-bank",
      "board:noun:委員會 / 董事會:curated-sense-bank",
      "board:verb:登上 / 上車:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("beat")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:打敗:curated-sense-bank",
      "verb:打:curated-sense-bank",
      "noun:節拍:curated-sense-bank",
      "noun:心跳:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("benefit")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:好處:curated-sense-bank",
      "verb:有益於:curated-sense-bank",
      "verb:受益:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("block")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:大廈:curated-sense-bank",
      "noun:街區:curated-sense-bank",
      "noun:一塊:curated-sense-bank",
      "noun:一段:curated-sense-bank",
      "verb:阻擋:curated-sense-bank",
      "verb:堵塞:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("boom")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:快速增長:curated-sense-bank",
      "noun:繁榮:curated-sense-bank",
      "verb:快速發展:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("border")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:邊界:curated-sense-bank",
      "noun:國界:curated-sense-bank",
      "verb:與...接壤:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bother")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:打擾:curated-sense-bank",
      "verb:煩擾:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("boundary")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:邊界:curated-sense-bank",
      "noun:界線:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("budget")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:預算:curated-sense-bank",
      "verb:制定預算:curated-sense-bank",
      "verb:節省開支:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bury")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:埋葬:curated-sense-bank",
      "verb:埋藏:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("center")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:中心:curated-sense-bank",
      "verb:集中於:curated-sense-bank",
      "verb:以...為中心:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("centre")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:中心:curated-sense-bank",
      "verb:集中於:curated-sense-bank",
      "verb:以...為中心:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("theater")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:劇場:curated-sense-bank",
      "noun:戲院:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("labour")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:勞動:curated-sense-bank",
      "noun:勞工:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("defense")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:防衛:curated-sense-bank",
      "noun:防守:curated-sense-bank",
      "noun:辯護:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("defence")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:防衛:curated-sense-bank",
      "noun:防守:curated-sense-bank",
      "noun:辯護:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("license")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:牌照:curated-sense-bank",
      "noun:許可證:curated-sense-bank",
      "verb:批准:curated-sense-bank",
      "verb:發牌:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("licence")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:牌照:curated-sense-bank",
      "noun:許可證:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("program")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:節目:curated-sense-bank",
      "noun:程式:curated-sense-bank",
      "noun:計劃:curated-sense-bank",
      "verb:編寫程式:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("article")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:文章:curated-sense-bank",
      "noun:冠詞:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ground")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:地面 / 土地:curated-sense-bank",
      "noun:理由 / 根據:curated-sense-bank",
      "verb:磨碎 / 碾碎（grind 過去式 / PP）:verb-table-form"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("chemical")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:化學的:curated-sense-bank",
      "noun:化學物質:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("generation")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:一代人:curated-sense-bank",
      "noun:產生 / 生成:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gain")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:獲得 / 取得:curated-sense-bank",
      "noun:增加:curated-sense-bank",
      "noun:收穫:curated-sense-bank",
      "verb:增加:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("grant")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:準許:curated-sense-bank",
      "verb:授予:curated-sense-bank",
      "noun:補助金:curated-sense-bank",
      "noun:撥款:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("graduate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:畢業生:curated-sense-bank",
      "verb:畢業:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("risk")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:風險:curated-sense-bank",
      "verb:冒險 / 冒...的風險:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("authority")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:權威:curated-sense-bank",
      "noun:權力:curated-sense-bank",
      "noun:當局:curated-sense-bank",
      "noun:官方機構:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("despite")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["preposition:儘管 / 雖然:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("essential")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:必要的 / 重要的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("eventually")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adverb:最終 / 終於:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("identity")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:身份 / 身分:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("policy")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:政策 / 方針:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("practice")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:練習:curated-sense-bank",
      "noun:做法:curated-sense-bank",
      "noun:慣例:curated-sense-bank",
      "verb:練習:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("responsibility")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:責任:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("development")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:發展:curated-sense-bank",
      "noun:新發展 / 發展項目:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("composition")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:作文:curated-sense-bank",
      "noun:組成 / 構成:curated-sense-bank",
      "noun:樂曲:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("technique")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:技巧 / 技術:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pleasant")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:令人愉快的 / 舒適的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ambitious")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:有抱負的:curated-sense-bank",
      "adjective:有雄心的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("artificial")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:人工的:curated-sense-bank",
      "adjective:人造的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ceremony")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:典禮 / 儀式:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("confuse")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:使困惑 / 混淆:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("collection")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:收藏 / 收藏品:curated-sense-bank",
      "noun:系列服裝 / 新一季產品:mock-unseen-mt56-paper1-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("continuous")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:持續的 / 連續的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("guilty")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:內疚的 / 有罪的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("impressive")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:令人印象深刻的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("intelligence")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:智慧 / 智力:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("expedition")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:遠征 / 探險:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("giant")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:巨大的:curated-sense-bank",
      "noun:巨人 / 巨型事物:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("protest")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:抗議 / 示威:curated-sense-bank",
      "verb:抗議 / 反對:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("reference")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:參考 / 提及:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("tyre")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:輪胎:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("acquire")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:獲得 / 取得:curated-sense-bank",
      "verb:收購:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("associate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:聯想:curated-sense-bank",
      "verb:聯繫:curated-sense-bank",
      "adjective:副的:curated-sense-bank",
      "adjective:相關的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("blame")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:責任:curated-sense-bank",
      "noun:責備:curated-sense-bank",
      "verb:責怪:curated-sense-bank",
      "verb:指責:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("boost")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:提升:curated-sense-bank",
      "noun:幫助:curated-sense-bank",
      "verb:提升:curated-sense-bank",
      "verb:促進:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cabin")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:機艙:curated-sense-bank",
      "noun:船艙:curated-sense-bank",
      "noun:小屋:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("concrete")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:具體的:curated-sense-bank",
      "noun:混凝土:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("characteristic")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:典型的:curated-sense-bank",
      "adjective:特有的:curated-sense-bank",
      "noun:特徵:curated-sense-bank",
      "noun:特點:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("characteristics")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "characteristic:noun:特徵:curated-sense-bank",
      "characteristic:noun:特點:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("considerable")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:相當大的:curated-sense-bank",
      "adjective:可觀的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("critical")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:關鍵的:curated-sense-bank",
      "adjective:批判性的:curated-sense-bank",
      "adjective:危急的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("decline")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:下降:curated-sense-bank",
      "noun:衰退:curated-sense-bank",
      "verb:下降:curated-sense-bank",
      "verb:衰退:curated-sense-bank",
      "verb:婉拒 / 拒絕:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("demonstrate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:示範:curated-sense-bank",
      "verb:展示:curated-sense-bank",
      "verb:顯示:curated-sense-bank",
      "verb:證明:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("embrace")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:接受:curated-sense-bank",
      "verb:支持:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("display")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:展示:curated-sense-bank",
      "verb:顯示:curated-sense-bank",
      "noun:展示 / 陳列:curated-sense-bank",
      "noun:顯示器 / 顯示畫面:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("distribute")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:分發:curated-sense-bank",
      "verb:分配:curated-sense-bank",
      "verb:分佈:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("document")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:文件:curated-sense-bank",
      "verb:記錄:curated-sense-bank",
      "verb:證明:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("department")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:部門:curated-sense-bank",
      "noun:政府部門:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("district")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:地區:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("employer")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:僱主:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("emphasis")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:強調:curated-sense-bank",
      "noun:重點:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("extent")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:程度:curated-sense-bank",
      "noun:範圍:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("evaluate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:評估:curated-sense-bank",
      "verb:評價:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("lack")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:缺乏:curated-sense-bank",
      "verb:缺乏:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("paste")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:貼上:curated-sense-bank",
      "noun:醬 / 膏:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("copy")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:副本:curated-sense-bank",
      "verb:複製 / 抄寫:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("grade")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:成績 / 等級:curated-sense-bank",
      "verb:評分 / 分級:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("test")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:測驗 / 測試:curated-sense-bank",
      "verb:測試 / 測驗:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fit")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:適合 / 合身:curated-sense-bank",
      "adjective:健康的:curated-sense-bank",
      "adjective:合適的:curated-sense-bank",
      "noun:發作 / 一陣:curated-sense-bank",
      "verb:安裝:mock-unseen-mt64-paper2-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stick")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:棍 / 枝條:curated-sense-bank",
      "verb:黏住 / 貼住:curated-sense-bank",
      "verb:插入 / 卡住:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("launch")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:推出 / 發起:curated-sense-bank",
      "verb:發射:curated-sense-bank",
      "noun:推出 / 發射:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("maintain")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:維持 / 保持:curated-sense-bank",
      "verb:保養 / 維護:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("resolve")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:解決:curated-sense-bank",
      "verb:下定決心:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("honour")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:榮譽:curated-sense-bank",
      "verb:尊重 / 表揚:curated-sense-bank",
      "verb:履行承諾:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("review")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:溫習 / 檢討:curated-sense-bank",
      "noun:評論 / 回顧:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("treat")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:對待:curated-sense-bank",
      "verb:治療:curated-sense-bank",
      "verb:請客:curated-sense-bank",
      "noun:款待 / 樂事:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("serve")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:服務:curated-sense-bank",
      "verb:供應 / 上菜:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("permit")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:允許:curated-sense-bank",
      "noun:許可證:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("object")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:物件:curated-sense-bank",
      "verb:反對:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("refuse")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:拒絕:curated-sense-bank",
      "noun:垃圾 / 廢物:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("commit")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:犯 / 承諾:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("focus")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:集中 / 聚焦:curated-sense-bank",
      "noun:焦點 / 重點:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("key")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:鑰匙:curated-sense-bank",
      "noun:關鍵:curated-sense-bank",
      "adjective:重要的 / 關鍵的:curated-sense-bank",
      "verb:輸入:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("lower")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:較低的:curated-sense-bank",
      "verb:降低:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("deny")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:否認:curated-sense-bank",
      "verb:拒絕給予:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("determine")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:決定 / 確定:curated-sense-bank",
      "verb:影響 / 支配:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("employ")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:僱用:curated-sense-bank",
      "verb:使用 / 採用:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("express")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:表達:curated-sense-bank",
      "adjective:特快的 / 明確的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("require")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:需要 / 要求:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("release")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:釋放:curated-sense-bank",
      "verb:發佈 / 推出:curated-sense-bank",
      "noun:釋放 / 發佈:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("remain")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:保持 / 仍然是:curated-sense-bank",
      "verb:留下 / 剩下:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("respect")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:尊重:curated-sense-bank",
      "verb:尊重:curated-sense-bank",
      "noun:方面:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("shift")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:輪班:curated-sense-bank",
      "verb:轉移 / 移動:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("spot")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:地點:curated-sense-bank",
      "noun:斑點:curated-sense-bank",
      "verb:發現 / 看見:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("represent")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:代表:curated-sense-bank",
      "verb:象徵 / 表示:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("reserve")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:預留 / 預約 / 保留:curated-sense-bank",
      "noun:儲備:curated-sense-bank",
      "noun:保護區:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("manage")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:管理:curated-sense-bank",
      "verb:設法做到:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("manufacture")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:製造:curated-sense-bank",
      "noun:製造:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("measure")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:測量:curated-sense-bank",
      "noun:措施:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("minor")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:次要的 / 輕微的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("observe")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:觀察:curated-sense-bank",
      "verb:遵守:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("occur")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:發生:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("operate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:操作 / 運作:curated-sense-bank",
      "verb:做手術:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("plain")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:簡單的 / 樸素的:curated-sense-bank",
      "adjective:清楚的 / 明顯的:curated-sense-bank",
      "noun:平原:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("secure")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:安全的 / 穩固的:curated-sense-bank",
      "verb:取得 / 獲得 / 確保:curated-sense-bank",
      "verb:保護 / 固定:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("select")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:選擇 / 挑選:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("series")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:系列 / 一連串:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("significance")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:重要性 / 意義:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("create")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:創造:curated-sense-bank",
      "verb:建立:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("comfort")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:舒適:curated-sense-bank",
      "noun:安慰:curated-sense-bank",
      "verb:安慰:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("turn")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:轉動:curated-sense-bank",
      "verb:轉彎:curated-sense-bank",
      "noun:輪流:curated-sense-bank",
      "noun:次序:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("close")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:關閉:curated-sense-bank",
      "adjective:接近的:curated-sense-bank",
      "adjective:親密的:curated-sense-bank",
      "adverb:接近地:curated-sense-bank",
      "noun:結束:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("state")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:狀態:curated-sense-bank",
      "noun:州:curated-sense-bank",
      "noun:國家:curated-sense-bank",
      "verb:陳述 / 說明:curated-sense-bank",
      "adjective:國家的 / 州的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hold")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:拿著 / 握住:curated-sense-bank",
      "verb:舉行:curated-sense-bank",
      "verb:容納:curated-sense-bank",
      "verb:持有:curated-sense-bank",
      "noun:抓握:curated-sense-bank",
      "noun:控制:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("record")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:記錄:curated-sense-bank",
      "noun:紀錄:curated-sense-bank",
      "noun:唱片:curated-sense-bank",
      "verb:記錄:curated-sense-bank",
      "verb:錄音:curated-sense-bank",
      "verb:錄影:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dependent")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:依賴的:curated-sense-bank",
      "adjective:取決於...的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("distract")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:分散注意力:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hence")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adverb:因此 / 所以:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("desperately")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adverb:極度 / 非常:curated-sense-bank",
      "adverb:絕望地:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("excessive")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:過度的 / 過量的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("elaborate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:精心設計的 / 複雜的:curated-sense-bank",
      "verb:詳細說明:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("initiative")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:新措施 / 新計劃:curated-sense-bank",
      "noun:主動性:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("literally")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adverb:字面上:curated-sense-bank",
      "adverb:真正地 / 確實:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("master")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:大師 / 師傅:curated-sense-bank",
      "verb:掌握 / 精通:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("mount")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:增加 / 上升:curated-sense-bank",
      "verb:登上 / 安裝:curated-sense-bank",
      "noun:山:teacher"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("literacy")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:讀寫能力 / 素養:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("influential")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:有影響力的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("occasionally")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adverb:偶爾 / 間中:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("potential")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:潛在的:curated-sense-bank",
      "noun:潛力:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("scale")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:規模:curated-sense-bank",
      "noun:刻度 / 等級:curated-sense-bank",
      "noun:磅 / 體重計:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ruin")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:廢墟 / 毀滅:curated-sense-bank",
      "verb:毀壞 / 破壞:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("premium")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:優質的 / 高級的:curated-sense-bank",
      "noun:保費 / 額外費用:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sensation")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:感覺:curated-sense-bank",
      "noun:轟動的人或事:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ultimate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:最終的 / 終極的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("variation")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:變化 / 差異:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("abuse")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:濫用 / 虐待:curated-sense-bank",
      "verb:濫用 / 虐待:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("anchor")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:錨 / 主持人:curated-sense-bank",
      "verb:固定 / 主持:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("highlight")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:用螢光筆標示:curated-sense-bank",
      "verb:突顯:curated-sense-bank",
      "noun:重點:curated-sense-bank",
      "noun:亮點:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("host")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:主持人:curated-sense-bank",
      "noun:主人:curated-sense-bank",
      "verb:主持:curated-sense-bank",
      "verb:舉辦:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pass")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:通行證:curated-sense-bank",
      "verb:通過:curated-sense-bank",
      "verb:及格:curated-sense-bank",
      "verb:經過:curated-sense-bank",
      "verb:傳遞:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("note")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:筆記:curated-sense-bank",
      "noun:便條:curated-sense-bank",
      "noun:音符:curated-sense-bank",
      "verb:注意 / 記下:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("return")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:返回:curated-sense-bank",
      "verb:歸還:curated-sense-bank",
      "noun:返回:curated-sense-bank",
      "noun:歸還:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("show")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:展示:curated-sense-bank",
      "verb:顯示:curated-sense-bank",
      "verb:給...看:curated-sense-bank",
      "noun:表演:curated-sense-bank",
      "noun:節目:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("force")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:力量:curated-sense-bank",
      "noun:武力:curated-sense-bank",
      "verb:強迫:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("end")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:結束:curated-sense-bank",
      "noun:末端:curated-sense-bank",
      "verb:結束:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("section")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:部分:curated-sense-bank",
      "noun:區段:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ticket")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:票:curated-sense-bank",
      "noun:罰單:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("few")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "determiner:少數:curated-sense-bank",
      "determiner:幾個:curated-sense-bank",
      "adjective:很少的:curated-sense-bank",
      "adjective:幾個的:curated-sense-bank",
      "pronoun:少數人:curated-sense-bank",
      "pronoun:少數事物:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("follow")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:跟隨:curated-sense-bank",
      "verb:遵從:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gallery")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:畫廊:curated-sense-bank",
      "noun:展覽館:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("base")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:基地:curated-sense-bank",
      "noun:基礎:curated-sense-bank",
      "verb:以...為基礎:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flood")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:洪水 / 水浸:curated-sense-bank",
      "verb:淹沒:curated-sense-bank",
      "verb:湧入:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gather")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:聚集:curated-sense-bank",
      "verb:收集:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("grow")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:成長:curated-sense-bank",
      "verb:種植:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hide")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:隱藏:curated-sense-bank",
      "verb:躲藏:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ride")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:騎:curated-sense-bank",
      "verb:乘搭:curated-sense-bank",
      "noun:乘車:curated-sense-bank",
      "noun:騎乘:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("time")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:時間:curated-sense-bank",
      "noun:次:curated-sense-bank",
      "verb:計時:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("visit")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:探訪:curated-sense-bank",
      "verb:參觀:curated-sense-bank",
      "noun:探訪:curated-sense-bank",
      "noun:參觀:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("walk")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:走路:curated-sense-bank",
      "noun:散步:curated-sense-bank",
      "noun:步行:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("parent")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:父母:curated-sense-bank",
      "noun:家長:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("piece")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:一塊:curated-sense-bank",
      "noun:一件:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("send")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:發送:curated-sense-bank",
      "verb:寄:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stay")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:停留:curated-sense-bank",
      "verb:留下:curated-sense-bank",
      "noun:停留:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("title")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:標題:curated-sense-bank",
      "noun:頭銜:curated-sense-bank",
      "verb:給...加標題:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("use")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:使用:curated-sense-bank",
      "noun:使用:curated-sense-bank",
      "noun:用途:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("video")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:影片:curated-sense-bank",
      "noun:錄像:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("position")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:位置:curated-sense-bank",
      "noun:職位:curated-sense-bank",
      "verb:安置:curated-sense-bank",
      "verb:放置:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("late")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:遲的:curated-sense-bank",
      "adjective:晚的:curated-sense-bank",
      "adjective:已故的:curated-sense-bank",
      "adverb:遲:curated-sense-bank",
      "adverb:晚:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("learn")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:學習:curated-sense-bank",
      "verb:得知:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("leave")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:離開:curated-sense-bank",
      "verb:留下:curated-sense-bank",
      "verb:留給:curated-sense-bank",
      "noun:假期 / 休假:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("line")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:線:curated-sense-bank",
      "noun:行:curated-sense-bank",
      "noun:隊伍:curated-sense-bank",
      "noun:台詞:curated-sense-bank",
      "verb:沿...排列:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("attribute")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:特徵 / 屬性:curated-sense-bank",
      "verb:歸因於:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("vulnerable")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:脆弱的 / 易受傷害的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gloomy")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:灰暗的 / 陰沉的:curated-sense-bank",
      "adjective:悲觀的 / 沒希望的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("plateau")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:高原:curated-sense-bank",
      "noun:停滯期:curated-sense-bank",
      "verb:停滯不前:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("energetic")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:有活力的 / 精力充沛的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("vendor")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:賣家 / 小販:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("as well as")).map((entry) => `${entry.type}:${entry.meaning}:${entry.source}`),
    ["phrase:以及 / 除了...之外:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("allure")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:吸引力 / 魅力:curated-sense-bank",
      "verb:吸引 / 引誘:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("decay")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:腐爛 / 衰退:curated-sense-bank",
      "verb:腐爛 / 衰退:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flooded with")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:充滿 / 充斥:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("nothing but")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:只有 / 只是:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("overhead")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:經常開支 / 間接成本:curated-sense-bank",
      "adjective:頭頂上方的:curated-sense-bank",
      "adverb:在頭頂上方:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("static")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:靜止的 / 靜態的:curated-sense-bank",
      "noun:靜電 / 雜音:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("thanks to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:preposition:因為 / 幸虧:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("work out")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "phrase:verb:做運動 / 健身:curated-sense-bank",
      "phrase:verb:計算出 / 想出 / 解決:curated-sense-bank",
      "phrase:verb:結果是 / 成功發展:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Chinese")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "Chinese:adjective:中國的 / 中文的:curated-sense-bank",
      "Chinese:noun:中文 / 中國人:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("manage to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:設法做到 / 能夠:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("mental health")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:心理健康 / 精神健康:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("scam")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:騙局 / 詐騙:curated-sense-bank",
      "verb:詐騙:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("scent")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:氣味 / 香氣:curated-sense-bank",
      "verb:聞出 / 察覺:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("stack")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:一疊 / 一堆:curated-sense-bank",
      "verb:堆疊:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("a staggering")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:驚人的 / 大得驚人的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("staple")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:主要的:curated-sense-bank",
      "noun:主食 / 主要產品:curated-sense-bank",
      "noun:釘書釘 / U形釘:mock-unseen-mt41-paper3-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("vulnerable to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:易受...傷害 / 影響:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bark")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:樹皮:curated-sense-bank",
      "verb:吠:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("concerning")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:令人擔憂的:curated-sense-bank",
      "preposition:關於:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("customs")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:海關:curated-sense-bank",
      "noun:習俗:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Catholic")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "Catholic:adjective:天主教的:curated-sense-bank",
      "Catholic:noun:天主教徒:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("decisively")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adverb:明確地 / 果斷地:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in other words")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:換句話說:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("livestream")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:直播:curated-sense-bank",
      "verb:直播:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("overhaul")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:徹底檢修 / 全面改革:curated-sense-bank",
      "verb:徹底檢修 / 全面改革:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pandemic")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:大流行的:curated-sense-bank",
      "noun:大流行病:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sarcifice")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "sacrifice:noun:犧牲:curated-sense-bank",
      "sacrifice:verb:犧牲:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ransom")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:贖金:curated-sense-bank",
      "verb:贖回:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rash")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:魯莽的:curated-sense-bank",
      "noun:紅疹:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rinse")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:沖洗:curated-sense-bank",
      "verb:沖洗:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("struggle to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:努力做... / 難以做...:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("prioritise a over b")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["prioritise A over B:phrase:verb:優先考慮A多於B / 重視A多於B:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("these")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "determiner:這些:curated-sense-bank",
      "pronoun:這些:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("underneath")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adverb:在下面:curated-sense-bank",
      "preposition:在...之下:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("whistle")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:口哨:curated-sense-bank",
      "verb:吹口哨:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("carry out")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:實施 / 進行 / 執行:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("write off")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:勾銷 / 報廢 / 不再理會:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("a few")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:determiner:幾個 / 一些:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("a little")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:determiner:一些 / 少少:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Achilles' heel")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Achilles' heel:phrase:noun:弱點 / 致命弱點:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("act as")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:擔任 / 充當:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("add colour to / add spice to")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "add colour to:phrase:verb:為...增添色彩 / 趣味:curated-sense-bank",
      "add spice to:phrase:verb:為...增添趣味 / 色彩:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("alongside with")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["alongside:phrase:preposition:與...一起 / 伴隨著:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("and yet")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:conjunction:但是 / 然而:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("appeal to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:吸引 / 呼籲:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("apply to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:應用於 / 適用於:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("based on")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:preposition:根據 / 基於:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("catch on")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:流行起來 / 開始明白:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cater for")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:滿足...需要 / 提供餐飲:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("capitalize on")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["capitalise on:phrase:verb:利用 / 善用:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("be supposed to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:應該 / 本應:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("depend on")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:取決於 / 依賴:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dispose of")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:棄置 / 處理掉:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("even though")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:conjunction:雖然 / 即使:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("feel like")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:想要 / 感覺像:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("get rid of")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:擺脫 / 除去:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("given that")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:conjunction:鑑於 / 既然:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("have no alternative / choice but to")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["have no choice but to:phrase:verb:別無選擇，只好:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in a nutshell")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:總括而言 / 簡而言之:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in terms of")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:preposition:在...方面 / 就...而言:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("keep an eye on")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:密切注意 / 照顧:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("let alone")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:conjunction:更不用說 / 更何況:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("lift x2")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "lift:noun:升降機:curated-sense-bank",
      "lift:verb:舉起 / 抬起:curated-sense-bank",
      "lift:verb:解除 / 撤銷限制:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("make a living")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:謀生:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("mindset")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["word:noun:思維 / 想法:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("participate in")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:參與 / 參加:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("not ... anytime soon")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:短期內不會:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("paint ... with a single brush")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:以偏概全 / 一竹竿打沉一船人:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pose a threat")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:構成威脅:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fumble")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:笨拙地摸索 / 失手處理:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in contrast,")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["in contrast:phrase:adverb:相反 / 相比之下:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pro-")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:支持...的 / 親...的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("provided (that)")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["provided that:phrase:conjunction:只要 / 假如:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rather than")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:conjunction:而不是:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Rather,")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "rather:adverb:頗:curated-sense-bank",
      "rather:adverb:相當:curated-sense-bank",
      "rather:adverb:反而:curated-sense-bank",
      "rather:adverb:而是:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("regardless of")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:preposition:不論 / 不管:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rely on")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:依賴 / 依靠:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rely on /")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["rely on:phrase:verb:依賴 / 依靠:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("take up... as a hobby")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["take up ... as a hobby:phrase:verb:開始把...當作興趣:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("result in")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:導致:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("have an effect on")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:對...有影響:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("have an impact on")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:對...有影響 / 對...有衝擊:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("take into account")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:考慮 / 將...考慮在內:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("all in all")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:總括而言:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("as long as")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:conjunction:只要:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("utilize")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["utilize:word:verb:利用 / 善用:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("with respect to")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["with regard to:phrase:preposition:關於 / 就...而言:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("worthwhile")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["word:adjective:值得做的 / 有價值的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("addicted to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:對...上癮的 / 沉迷於:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("apologize to")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["apologise to:phrase:verb:向...道歉:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("as soon as")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:conjunction:一...就:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("beneficial to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:對...有益:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("compete against")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:與...競爭:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fall victim to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:成為...的受害者:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("has nothing to do with")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["have nothing to do with:phrase:verb:與...無關:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("if only")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:conjunction:如果...就好了:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pave the way for")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:為...鋪路:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pose a threat to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:對...構成威脅:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("raise awareness of")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:提高對...的意識:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("related to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "phrase:adjective:與...有關:curated-sense-bank",
      "phrase:verb:理解 / 有共鳴:mock-unseen-mt15-paper1-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("prior to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:preposition:在...之前:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("reason for")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:...的原因:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("be detrimental to")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["detrimental to:phrase:adjective:對...有害:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in proximity to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:preposition:在...附近:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("problem-solving skills")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:解難能力:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("wreak havoc on")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:嚴重破壞 / 對...造成嚴重損害:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("intrumental in")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["instrumental in:phrase:adjective:對...有幫助 / 起重要作用:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("deal with")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:處理 / 應付:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("be used to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:習慣於:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in order to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:preposition:為了:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("lead to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:導致 / 通向:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("look forward to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:期待:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("a sense of accomplishment")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["a sense of achievement:phrase:noun:成就感:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("artificial intelligence")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:人工智能:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("employment oopportunities")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["employment opportunities:phrase:noun:就業機會:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("despite the fact that")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:conjunction:雖然 / 儘管:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("of utmost importance")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["of paramount importance:phrase:adjective:極為重要:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("can be ascribed to")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["can be attributed to:phrase:verb:可歸因於:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("breathe a sigh of relief")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:鬆一口氣:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("far from satisfactory")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:遠不令人滿意:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("on the grounds that")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:conjunction:因為 / 基於...理由:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("allergens")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["allergen:noun:致敏原:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Buddhist")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Buddhist:noun:佛教徒:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cliché")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["cliche:noun:陳腔濫調 / 老生常談:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("daunting")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:令人卻步的 / 令人生畏的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dwindle")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:逐漸減少:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gratitude")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:感激 / 感恩:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("intrinsic")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:內在的 / 固有的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("perspectives")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["perspective:noun:觀點 / 角度:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("protagonist")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:主角 / 主要人物:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("provacative")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["provocative:adjective:挑釁的 / 惹火的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("regulars")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["regular:noun:常客:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("subsidize")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["subsidise:verb:津貼 / 資助:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Thai")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Thai:adjective:泰國的:curated-sense-bank", "Thai:noun:泰國人 / 泰文:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("vigourous")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["vigorous:adjective:劇烈的 / 精力充沛的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("as if / as though")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "as if:phrase:conjunction:彷彿 / 好像:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("remarkabe")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["remarkable:adjective:非凡的 / 令人印象深刻的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("glamourous")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["glamorous:adjective:迷人的 / 有魅力的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("inacessible")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["inaccessible:adjective:難以到達的 / 難以接觸的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Causeway Bay")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Causeway Bay:noun:銅鑼灣:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("china")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["China:noun:中國:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("China")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["China:noun:中國:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("general studies")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["General Studies:noun:常識科:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("General Studies")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["General Studies:noun:常識科:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("acquaintance")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:認識的人 / 泛泛之交:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("allergies")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["allergy:noun:過敏 / 敏感:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ambiance")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["ambience:noun:氣氛 / 氛圍:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("artifact")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["artefact:noun:文物 / 人造物:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("baby boomers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["baby boomer:phrase:noun:嬰兒潮一代:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("composition book")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:作文簿:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("be absorbed in")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:全神貫注於:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("bubble tea")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:珍珠奶茶:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("cacti")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["cactus:noun:仙人掌:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("carbon footprint")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:碳足印 / 碳足跡:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("chief executive")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:行政長官 / 行政總裁:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("co-workers")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["co-worker:phrase:noun:同事:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("conduct a survey")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:進行調查:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("consumers")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["consumer:noun:消費者:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("criticize")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["criticize:verb:批評:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("recognize")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "recognize:verb:認出:curated-sense-bank",
      "recognize:verb:認可:curated-sense-bank",
      "recognize:verb:承認:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("organise")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "organise:verb:組織:curated-sense-bank",
      "organise:verb:安排:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("convert a into b")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["convert A into B:phrase:verb:將A轉變成B:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("customize")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["customise:verb:自訂 / 訂製:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("pace of life")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:生活節奏:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("property owners")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["property owner:phrase:noun:業主:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("put a ahead of b")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["put A ahead of B:phrase:verb:把A放在B之前 / 比B更重視A:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("remember ving")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["remember + V-ing:pattern:verb:記得做過:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("scroll on phones")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["scroll through:phrase:verb:滑動瀏覽:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sign up")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:報名 / 註冊:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("so adj that")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["so + adjective + that:pattern:conjunction:如此...以致:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("strike a work-life balance")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["strike a balance:phrase:verb:取得平衡:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("the amount of")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:determiner:...的數量（不可數名詞）:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("there's no doubt that")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["there is no doubt that:pattern:conjunction:毫無疑問...:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("united nations")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["United Nations:phrase:noun:聯合國:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("view as")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["view ... as ...:phrase:verb:視為:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("as + 句子")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["as + clause:pattern:conjunction:因為 / 正如 / 當 / 隨著:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("are bound to")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["be bound to:phrase:verb:肯定會 / 必定:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("commit to ving")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["commit to:phrase:verb:承諾 / 致力於:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("a quarter of")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:determiner:四分之一:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("as the name suggests")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["as its name suggests:phrase:adverb:顧名思義:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("association between a and b")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["association between A and B:phrase:noun:A和B之間的關係:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("be that as it may")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:話雖如此:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("boom = burgeon")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["boom / burgeon:pattern:verb:迅速發展:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("can hardly")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:modal:幾乎不能:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("commit mistakes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["commit a mistake:phrase:verb:犯錯:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("decidely")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["decidedly:adverb:明顯地 / 確實地:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("declared monuments")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["declared monument:phrase:noun:法定古蹟:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("do the dishes")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:洗碗:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Europe")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Europe:noun:歐洲:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("exquiste")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["exquisite:adjective:精緻的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("first aid kit")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["first-aid kit:phrase:noun:急救包:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fresh graduates")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fresh graduate:phrase:noun:剛畢業的大學生 / 應屆畢業生:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("go viral")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:爆紅 / 瘋傳:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("grown-ups")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["grown-up:phrase:noun:成人 / 成年人:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("holistic")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:全面的 / 整體的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in the long term")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["in the long run:phrase:adverb:長遠來說:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in vain")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adverb:白費地 / 徒勞地:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("instill")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["instil:verb:灌輸:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("jews")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Jew:noun:猶太人:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("labor costs")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["labour cost:phrase:noun:勞工成本:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("leftover")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:剩下的:curated-sense-bank",
      "noun:剩菜 / 剩餘食物:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Latin America")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Latin America:phrase:noun:拉丁美洲:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Mexico")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Mexico:noun:墨西哥:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("minimize")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["minimize:verb:把...減到最低 / 盡量減少:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("Mount Fuji")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["Mount Fuji:phrase:noun:富士山:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("organization")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["organization:noun:組織 / 機構:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("patronize")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["patronise:verb:光顧 / 惠顧:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("prefer a to b")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["prefer A to B:phrase:verb:喜歡A多於B:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("health")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:健康:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("healthy")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:健康的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("environment")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:環境:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("environmental")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:環境的 / 環保的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("community")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:社區:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("society")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:社會:curated-sense-bank",
      "noun:協會 / 團體:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("social")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:社會的 / 社交的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("public")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:公眾的 / 公開的:curated-sense-bank",
      "noun:公眾:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("facility")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["facility:noun:設施:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("facilities")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["facility:noun:設施:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("resource")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["resource:noun:資源:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("resources")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["resource:noun:資源:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("problem")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:問題:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("diagonal")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:對角線:curated-sense-bank",
      "adjective:對角線的 / 斜的:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("digestion")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:消化:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("diminishing")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:逐漸減少的 / 遞減的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("discern")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:看出 / 察覺:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("discernible")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:可辨別的 / 看得出的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("discreet")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:謹慎的 / 審慎的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("discriminate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:歧視:curated-sense-bank",
      "verb:區分 / 分辨:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("disdain")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:蔑視 / 鄙視:curated-sense-bank",
      "verb:蔑視 / 鄙視:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("disfigured")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:毀容的 / 外貌受損的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("disgraceful")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:不光彩的 / 可恥的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("disguise")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:偽裝:curated-sense-bank",
      "verb:偽裝 / 掩飾:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("disheartened")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:感到灰心的 / 沮喪的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("disheartening")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:令人灰心的 / 令人沮喪的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dismayed")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:感到沮喪的 / 震驚的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dismaying")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:令人沮喪的 / 令人震驚的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("distraction")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:令人分心的事 / 分心:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("distill")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["distil:verb:蒸餾:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dodge")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:避開 / 閃避:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("domesticate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:馴養 / 使馴化:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("doner")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:土耳其烤肉:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("doubtful")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:懷疑的 / 不確定的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("downpour")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:暴雨 / 傾盆大雨:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("drained")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:筋疲力盡的 / 很累的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("drawers")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["drawer:noun:抽屜:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dubbed")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["dub:verb:稱為 / 給...起名:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("dwellers")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["dweller:noun:居民:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("eccentric")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:古怪的 / 反常的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("eerie")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:怪異的 / 陰森的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("elders")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["elder:noun:長輩:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("elements")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["element:noun:元素 / 要素:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("elevating")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["elevate:verb:提升 / 抬高:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("emigrate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:移民:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("emit")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:排放 / 發出:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("empathy")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:同理心 / 共情:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("employers")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["employer:noun:僱主:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("employment opportunity")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:就業機會:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("emulate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:模仿 / 努力趕上:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("enhanced")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:增強的 / 改善的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("enlighten")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:啟發 / 使明白:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("enquiries")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["enquiry:noun:查詢 / 調查:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("enrolment")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:報名 / 入學人數:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("entail")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:涉及 / 需要:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("enterprises")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["enterprise:noun:企業 / 事業:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("enticement")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:誘惑 / 誘因:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("envious")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:羨慕的 / 妒忌的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("envisage")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:想像 / 設想:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("envy")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:羨慕 / 妒忌:curated-sense-bank",
      "verb:羨慕 / 妒忌:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("epic")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:宏大的 / 史詩般的:curated-sense-bank",
      "noun:史詩 / 宏大的作品:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("erase")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:刪除 / 抹去:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("erode")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:侵蝕 / 逐漸削弱:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("estimation")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:估計 / 估算:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ethics")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:倫理 / 道德規範:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("evacuation")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:撤離 / 疏散:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("evaproate")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["evaporate:verb:蒸發:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("exacerbate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:使惡化 / 加劇:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("exasperation")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:惱怒 / 極度煩躁:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("exclaim")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:驚叫 / 大聲說:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("excursion")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:短途旅行:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("exhaust")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:使筋疲力盡 / 用盡:curated-sense-bank",
      "noun:廢氣:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("exhausted")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:筋疲力盡的 / 很累的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("exorbitant")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:過高的 / 昂貴得離譜的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("expat")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:外籍人士:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("expenses")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "expense:noun:費用 / 開支:curated-sense-bank",
      "expense:noun:代價:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("extinct")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:絕種的 / 滅絕的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("extravaganza")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:盛大表演 / 鋪張的活動:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("exude")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:散發 / 流露:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fanatics")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fanatic:noun:狂熱者:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fares")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fare:noun:車費 / 票價:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fees")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fee:noun:費用 / 收費:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fad")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:一時熱潮 / 一時風尚:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fascinate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:使著迷 / 使深感興趣:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fatigue")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:疲勞 / 疲倦:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("feast")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:盛宴 / 大餐:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fencing")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:劍擊:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("ferment")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "verb:發酵:curated-sense-bank",
      "noun:發酵 / 動盪:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fetch")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:取來 / 賣得（某價錢）:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("figures")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "figure:noun:數字:curated-sense-bank",
      "figure:noun:人物:curated-sense-bank",
      "figure:noun:圖表:curated-sense-bank",
      "figure:noun:身材:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("filling")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:餡料 / 填充物:curated-sense-bank",
      "verb:填滿 / 裝滿（fill ING）:verb-table-form"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fined")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fine:verb:罰款:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fines")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "fine:noun:罰款:curated-sense-bank",
      "fine:verb:罰款:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flakes")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["flake:noun:薄片 / 小碎片:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flamingo")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:火烈鳥:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flap")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:拍動 / 擺動:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flavourful")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:美味的 / 味道濃郁的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flaws")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["flaw:noun:缺陷 / 瑕疵:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fleets")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fleet:noun:船隊 / 車隊:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flex")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:伸展 / 活動一下:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flip")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:翻轉 / 翻動:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flooding")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:水浸 / 洪水氾濫:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fluctuate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:波動 / 起伏不定:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flush")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:沖廁 / 沖走:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flyer")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:傳單:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("foodie")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:美食愛好者 / 吃貨:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fountain")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:噴泉:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fracture")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:骨折 / 裂縫:curated-sense-bank",
      "verb:使斷裂 / 使破裂:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fragrance")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:香味 / 香氣:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("frequenters")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["frequenter:noun:常客:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("freshwater")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:淡水的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fume")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:煙霧 / 廢氣:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("fungi")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["fungus:noun:真菌:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("furnish")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:布置 / 為...配備家具:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("furnishings")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["furnishing:noun:家具 / 室內陳設:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("futile")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:徒勞無功的 / 無效的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("flurry companion")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["furry companion:phrase:noun:毛孩 / 寵物:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("galleries")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "gallery:noun:畫廊:curated-sense-bank",
      "gallery:noun:展覽館:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("garment")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:服裝 / 衣服:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("genes")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["gene:noun:基因:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("genetics")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:遺傳學 / 基因:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("germ")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:細菌 / 病菌:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gigantic")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:巨大的 / 龐大的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gimmicks")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["gimmick:noun:噱頭 / 花招:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gist")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:主旨 / 要點:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("glitz")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:浮華 / 耀眼魅力:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("glitzy")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:華麗的 / 耀眼的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gossip")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:八卦 / 閒話:curated-sense-bank",
      "verb:講八卦 / 說閒話:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gourmet")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "adjective:美食的 / 高級美食的:curated-sense-bank",
      "noun:美食家:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("graduates")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["graduate:noun:畢業生:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("graphs")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["graph:noun:圖表:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("gravitate")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:被吸引 / 受吸引而去:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("graze")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["verb:吃草 / 放牧:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("a wide array of")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["array:noun:一系列 / 大量:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("an array of")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["array:noun:一系列 / 大量:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("devoted to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:adjective:致力於 / 投放於:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("granted")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "grant:verb:準許:curated-sense-bank",
      "grant:verb:授予:curated-sense-bank"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("greenery")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:綠化 / 綠色植物:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("grooming")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    [
      "noun:整理儀容 / 打扮:curated-sense-bank",
      "noun:寵物梳洗 / 美容:mock-unseen-mt27-paper3-reviewed"
    ]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("groundless")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["adjective:無根據的:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("grouper")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:石斑魚:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("hard-earned money")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:血汗錢:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("have been to")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:去過:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("household name(s)")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["household name:phrase:noun:家喻戶曉的人或名字:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("in comparison to / compared to")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["in comparison to:phrase:preposition:與...相比:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("live up to expectations")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["live up to:phrase:verb:達到 / 不辜負:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("shed some lights on")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["shed light on:phrase:verb:闡明 / 有助於解釋:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("shortcomings")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["shortcoming:noun:缺點 / 短處:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("straw")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:稻草 / 飲管:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("thorns")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["thorn:noun:刺 / 荊棘:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("times")).map((entry) => `${entry.pos}:${entry.meaning}:${entry.source}`),
    ["noun:倍:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("public facilities")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["public facility:phrase:noun:公共設施:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("raise awareness")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:提高意識:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("responsbility")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["responsibility:noun:責任:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("replace a with b")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["replace A with B:phrase:verb:用B取代A:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("sanitize")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["sanitise:verb:消毒:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("skeptical about")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["sceptical about:phrase:adjective:對...懷疑:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("social enterprises")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["social enterprise:phrase:noun:社會企業:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("subdivided flat")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:noun:劏房:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("supplementary classes")).map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["supplementary class:phrase:noun:補課 / 補習課:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("symbolize")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["symbolise:verb:象徵:curated-sense-bank"]
  );

  assert.deepStrictEqual(await lookupForStudent("not a real class word"), []);

  const forbiddenProvidersResult = await vocabLookup.buildLookupMatches("raw-only-word", {
    getLiveTeacherMatches: () => [],
    shouldFetchLiveTeacher: () => false,
    fetchLiveTeacherMatches: () => [],
    getCuratedMatches: () => [],
    getTeacherMatches: () => [],
    getCcCedictSupplementMatches: () => [],
    getCcCedictReverseMatches: () => {
      throw new Error("raw CC-CEDICT reverse provider must never be called");
    },
    getOfflineDictionaryMatches: () => {
      throw new Error("raw offline dictionary provider must never be called");
    },
    getGeneratedMeaningMatches: () => {
      throw new Error("generated/AI meaning provider must never be called");
    }
  }, {
    normalizeWord: teacherVocab.normalizeWord,
    normalizeMeaningGroupKey,
    getEntryPos: entryPos
  });
  assert.deepStrictEqual(forbiddenProvidersResult, []);

  for (const word of [
    "pretty",
    "beard",
    "hammer",
    "have",
    "work",
    "game",
    "cub",
    "validity",
    "signature",
    "Causeway Bay",
    "China",
    "General Studies",
    "corporate",
    "same-day-word",
    "live-duplicate",
    "look up",
    "rule out",
    "based on",
    "catch on",
    "cater for",
    "capitalize on",
    "be supposed to",
    "depend on",
    "dispose of",
    "even though",
    "feel like",
    "get rid of",
    "given that",
    "have no alternative / choice but to",
    "in a nutshell",
    "in terms of",
    "keep an eye on",
    "let alone",
    "lift x2",
    "make a living",
    "mindset",
    "participate in",
    "pose a threat",
    "provided (that)",
    "rather than",
    "regardless of",
    "rely on",
    "result in",
    "take into account",
    "all in all",
    "as long as",
    "utilize",
    "with respect to",
    "worthwhile",
    "addicted to",
    "apologize to",
    "as soon as",
    "beneficial to",
    "compete against",
    "fall victim to",
    "has nothing to do with",
    "if only",
    "pave the way for",
    "pose a threat to",
    "raise awareness of",
    "related to",
    "prior to",
    "reason for",
    "be detrimental to",
    "in proximity to",
    "problem-solving skills",
    "wreak havoc on",
    "instrumental in",
    "intrumental in",
    "confined to",
    "brim with",
    "deal with",
    "insist on",
    "lie in",
    "adapt to",
    "attribute to",
    "attach importance to",
    "be able to",
    "be used to",
    "belong to",
    "carry on",
    "comply with",
    "concentrate on",
    "cope with",
    "focus on",
    "give in",
    "in light of",
    "in order to",
    "invest in",
    "lead to",
    "look down on",
    "look forward to",
    "look into",
    "opt for",
    "originate in",
    "a close-knit community",
    "a considerable number of",
    "a growing number of",
    "a sense of accomplishment",
    "a sense of belonging",
    "academic performance",
    "after-school activities",
    "all around the world",
    "all-round development",
    "artificial intelligence",
    "brick-and-mortar stores",
    "cardiovascular diseases",
    "commercial district",
    "cultural melting pot",
    "despite the fact that",
    "discriminate against",
    "electronic appliances",
    "employment oopportunities",
    "employment opportunities",
    "in close proximity to",
    "intangible cultural heritage",
    "intense competition",
    "interpersonal relationship",
    "mother-tongue education",
    "of utmost importance",
    "pay attention in class",
    "people from all walks of life",
    "attach great importance to",
    "bear much resemblance to",
    "bear no resemblance to",
    "beyond a shadow of a doubt",
    "breathe a sigh of relief",
    "by leaps and bounds",
    "can be ascribed to",
    "can be attributed to",
    "come up to expectations",
    "conjure up images of",
    "contributory factor",
    "create a ripple effect",
    "far from satisfactory",
    "gain much popularity",
    "get into a vicious cycle",
    "give the cold shoulder",
    "go from bad to worse",
    "go from strength to strength",
    "go to great lengths to",
    "hold in high regard",
    "in the blink of an eye",
    "in this day and age",
    "maintain social order",
    "make every endeavour to",
    "meet the expectations",
    "on the grounds that",
    "on top of the world",
    "abalone",
    "acupuncture",
    "admittedly",
    "affluent",
    "algorithm",
    "allergens",
    "altruism",
    "altruistic",
    "anime",
    "aroma",
    "aromatic",
    "artisan",
    "asparagus",
    "asthma",
    "autism",
    "autistic",
    "avocado",
    "breathtaking",
    "Buddhist",
    "burglar",
    "burnout",
    "bustling",
    "catastrophe",
    "chewy",
    "chubby",
    "cliché",
    "complacent",
    "craftsmanship",
    "cramped",
    "crave",
    "craze",
    "cuisine",
    "culprit",
    "daunting",
    "delectable",
    "diligently",
    "disapprove",
    "disposable",
    "dwindle",
    "eatery",
    "economical",
    "emerging",
    "entice",
    "enticing",
    "essentials",
    "exponential",
    "feasible",
    "fragrant",
    "gratitude",
    "hazardous",
    "hearty",
    "humidity",
    "hypermarket",
    "impending",
    "incessant",
    "indifferent",
    "infectious",
    "inferior",
    "insignificant",
    "instagrammable",
    "intrinsic",
    "paramount",
    "passable",
    "pathetic",
    "pathological",
    "peacefully",
    "perspectives",
    "persuasive",
    "pharmacist",
    "plausible",
    "polish",
    "porter",
    "pottery",
    "practicality",
    "priceless",
    "promptly",
    "proponent",
    "protagonist",
    "provacative",
    "provocative",
    "puzzling",
    "racecourse",
    "reap",
    "reassuring",
    "recreational",
    "refreshments",
    "regulars",
    "retailers",
    "rewarding",
    "rigid",
    "satisfactory",
    "scarcely",
    "startling",
    "starved",
    "steroids",
    "subsidize",
    "supertitious",
    "symptoms",
    "tableware",
    "tactics",
    "tangible",
    "tellingly",
    "tempting",
    "terrestrial",
    "Thai",
    "thrifty",
    "titan",
    "tourists",
    "traits",
    "travellers",
    "trends",
    "trustworthy",
    "understate",
    "undisputed",
    "uneventful",
    "unintentionally",
    "uniqueness",
    "unlawful",
    "unmanned",
    "unpalatable",
    "unwavering",
    "utter",
    "vaguely",
    "vandalism",
    "vet",
    "vigourous",
    "villain",
    "vitamins",
    "vividly",
    "wearisome",
    "wholeheartedly",
    "wholesaler",
    "wholesome",
    "wicked",
    "workload",
    "wrangling",
    "bacon",
    "Mong Kok",
    "hawker",
    "guts",
    "give",
    "mean",
    "right",
    "emergency",
    "frequently",
    "generally",
    "illegal",
    "immigrant",
    "medium",
    "necessarily",
    "operation",
    "property",
    "sight",
    "simply",
    "access",
    "aim",
    "brand",
    "complex",
    "export",
    "import",
    "plot",
    "practical",
    "press",
    "rarely",
    "arrest",
    "damage",
    "doubt",
    "escape",
    "fancy",
    "flood",
    "force",
    "fuel",
    "impact",
    "row",
    "chemical",
    "dislike",
    "generation",
    "graduate",
    "liquid",
    "mix",
    "risk",
    "till",
    "ambition",
    "authority",
    "consume",
    "due",
    "advanced",
    "analyse",
    "category",
    "conclusion",
    "consequence",
    "definition",
    "despite",
    "essential",
    "eventually",
    "gather",
    "identity",
    "importance",
    "obvious",
    "obviously",
    "policy",
    "political",
    "responsibility",
    "technique",
    "trend",
    "version",
    "victim",
    "performance",
    "pleasant",
    "proper",
    "ambitious",
    "apologize",
    "celebration",
    "ceremony",
    "clue",
    "collection",
    "concentrate",
    "confuse",
    "convenient",
    "disappointed",
    "effort",
    "emotion",
    "continuous",
    "economic",
    "effectively",
    "element",
    "exhibition",
    "fascinating",
    "grateful",
    "guilty",
    "hardly",
    "historical",
    "impressive",
    "innocent",
    "intelligence",
    "intention",
    "coal",
    "expedition",
    "fence",
    "giant",
    "goods",
    "grain",
    "leading",
    "luxury",
    "management",
    "meanwhile",
    "mixture",
    "murder",
    "nation",
    "official",
    "old-fashioned",
    "originally",
    "poet",
    "politician",
    "powder",
    "previous",
    "previously",
    "protest",
    "punishment",
    "qualification",
    "rare",
    "reaction",
    "reference",
    "religious",
    "remote",
    "sculpture",
    "sensible",
    "similarly",
    "slightly",
    "specifically",
    "staff",
    "substance",
    "successfully",
    "surface",
    "symptom",
    "typically",
    "tyre",
    "unpleasant",
    "abandon",
    "abstract",
    "accuracy",
    "accurately",
    "acquire",
    "additionally",
    "adequate",
    "adequately",
    "adopt",
    "affordable",
    "agency",
    "aggressive",
    "agriculture",
    "aid",
    "amusing",
    "analyst",
    "ancestor",
    "annually",
    "anticipate",
    "apparent",
    "apparently",
    "appropriate",
    "artificial",
    "aspect",
    "assess",
    "assessment",
    "associate",
    "association",
    "assure",
    "astonishing",
    "attempt",
    "barely",
    "barrier",
    "beneficial",
    "blame",
    "blind",
    "boost",
    "broadcast",
    "cabin",
    "canal",
    "characteristic",
    "chief",
    "collapse",
    "colony",
    "comfort",
    "commitment",
    "complicated",
    "component",
    "comprehensive",
    "compulsory",
    "concentration",
    "concrete",
    "confess",
    "conflict",
    "confusing",
    "conscious",
    "considerable",
    "considerably",
    "consistent",
    "constant",
    "construct",
    "contemporary",
    "controversial",
    "convincing",
    "core",
    "creativity",
    "crew",
    "criterion",
    "critical",
    "criticize",
    "cruise",
    "deadly",
    "decent",
    "decline",
    "deliberately",
    "delight",
    "democracy",
    "demonstrate",
    "dependent",
    "depressed",
    "depression",
    "deserve",
    "desperately",
    "destruction",
    "determination",
    "disability",
    "discipline",
    "dismiss",
    "distinct",
    "distinguish",
    "distract",
    "diverse",
    "diversity",
    "domestic",
    "dramatically",
    "dull",
    "elegant",
    "elementary",
    "embrace",
    "emerge",
    "emission",
    "emotional",
    "entertaining",
    "entirely",
    "entrepreneur",
    "essentially",
    "ethnic",
    "evaluate",
    "evident",
    "evolution",
    "exceed",
    "exception",
    "excessive",
    "exotic",
    "exploit",
    "expose",
    "extensive",
    "extraordinary",
    "fabulous",
    "facility",
    "firm",
    "flexible",
    "format",
    "former",
    "found",
    "founder",
    "fragment",
    "fundamental",
    "genre",
    "genuine",
    "genuinely",
    "gesture",
    "grab",
    "gradually",
    "headquarters",
    "hence",
    "herb",
    "hilarious",
    "humorous",
    "dedication",
    "defect",
    "delicate",
    "destructive",
    "diminish",
    "disastrous",
    "discrimination",
    "distinctive",
    "divine",
    "donor",
    "drain",
    "effectiveness",
    "efficiency",
    "elaborate",
    "emergence",
    "enforcement",
    "engagement",
    "engaging",
    "enthusiast",
    "establishment",
    "exceptional",
    "exclusive",
    "exploitation",
    "fatal",
    "fierce",
    "flawed",
    "flexibility",
    "formula",
    "fragile",
    "guilt",
    "harassment",
    "heritage",
    "humble",
    "illustrate",
    "illustration",
    "implication",
    "imply",
    "impose",
    "incentive",
    "increasingly",
    "inevitably",
    "infection",
    "inflation",
    "infrastructure",
    "inhabitant",
    "initial",
    "initially",
    "initiative",
    "innovation",
    "innovative",
    "insight",
    "insist",
    "inspire",
    "instantly",
    "institution",
    "insurance",
    "interaction",
    "invasion",
    "investigation",
    "investment",
    "lately",
    "likewise",
    "literally",
    "literary",
    "long-term",
    "massive",
    "master",
    "means",
    "miserable",
    "motivate",
    "motivation",
    "mount",
    "navigation",
    "immense",
    "imprisonment",
    "inadequate",
    "inappropriate",
    "incidence",
    "indigenous",
    "infamous",
    "infant",
    "influential",
    "inherent",
    "insider",
    "inspiration",
    "insufficient",
    "insult",
    "intact",
    "intensive",
    "interactive",
    "interior",
    "intermediate",
    "intervention",
    "intimate",
    "intriguing",
    "ironic",
    "ironically",
    "large-scale",
    "legacy",
    "legislation",
    "lengthy",
    "lethal",
    "likelihood",
    "linear",
    "literacy",
    "magnetic",
    "mainstream",
    "mandatory",
    "marine",
    "medieval",
    "meditation",
    "merchant",
    "merely",
    "merit",
    "migration",
    "mobility",
    "monk",
    "morality",
    "necessity",
    "nutrition",
    "obligation",
    "observation",
    "obstacle",
    "occasionally",
    "offence",
    "offender",
    "offensive",
    "opponent",
    "organic",
    "outcome",
    "parliament",
    "participation",
    "pause",
    "perception",
    "potential",
    "precious",
    "precise",
    "precisely",
    "preference",
    "presence",
    "primarily",
    "privacy",
    "promising",
    "proportion",
    "propose",
    "psychologist",
    "psychology",
    "radiation",
    "rapid",
    "rapidly",
    "realistic",
    "reasonable",
    "refugee",
    "regulation",
    "relatively",
    "remarkable",
    "remarkably",
    "resolve",
    "resort",
    "restore",
    "revenue",
    "revolution",
    "ridiculous",
    "risky",
    "romance",
    "roughly",
    "ruin",
    "scale",
    "scholar",
    "scholarship",
    "seek",
    "sibling",
    "significant",
    "significantly",
    "slight",
    "so-called",
    "sophisticated",
    "speculation",
    "spice",
    "sponsorship",
    "stance",
    "strict",
    "stunning",
    "subsequent",
    "sufficient",
    "surrounding",
    "suspect",
    "sustainable",
    "swallow",
    "namely",
    "notorious",
    "obsession",
    "occasional",
    "originate",
    "outlet",
    "overwhelming",
    "patron",
    "peculiar",
    "pioneer",
    "predator",
    "pregnancy",
    "premium",
    "prestigious",
    "presumably",
    "prevail",
    "prevalence",
    "profound",
    "proposition",
    "prospective",
    "province",
    "radical",
    "rage",
    "rape",
    "rational",
    "realm",
    "reliability",
    "renowned",
    "reproduction",
    "resignation",
    "respectively",
    "retreat",
    "revolutionary",
    "ritual",
    "sacred",
    "sacrifice",
    "seemingly",
    "seize",
    "seldom",
    "sensation",
    "sheer",
    "shrink",
    "simultaneously",
    "solidarity",
    "stark",
    "stem",
    "striking",
    "substantial",
    "substantially",
    "subtle",
    "superior",
    "surveillance",
    "suspicious",
    "temporarily",
    "temporary",
    "tendency",
    "tension",
    "thorough",
    "thoroughly",
    "threaten",
    "thus",
    "tournament",
    "tragic",
    "trait",
    "tropical",
    "ultimate",
    "ultimately",
    "unique",
    "universal",
    "urban",
    "variation",
    "vast",
    "vertical",
    "vital",
    "vitamin",
    "whereas",
    "widespread",
    "wildlife",
    "wise",
    "absurd",
    "abuse",
    "accountability",
    "accountable",
    "accumulate",
    "acute",
    "admission",
    "adolescent",
    "advocate",
    "aesthetic",
    "albeit",
    "allege",
    "allowance",
    "amateur",
    "amid",
    "anchor",
    "appealing",
    "aspiration",
    "assemble",
    "attribute",
    "authentic",
    "barrel",
    "blend",
    "blessing",
    "boast",
    "breakthrough",
    "breed",
    "brutal",
    "buddy",
    "burden",
    "cargo",
    "cautious",
    "cemetery",
    "chronic",
    "chunk",
    "cluster",
    "cognitive",
    "collaborate",
    "collective",
    "combat",
    "commodity",
    "compelling",
    "complication",
    "compromise",
    "concede",
    "conserve",
    "consistency",
    "correspondent",
    "corruption",
    "costly",
    "credible",
    "cultivate",
    "tempt",
    "tender",
    "terrific",
    "texture",
    "thankfully",
    "toxic",
    "transparency",
    "tremendous",
    "tribute",
    "triumph",
    "underlying",
    "undoubtedly",
    "unprecedented",
    "uphold",
    "vague",
    "varied",
    "vessel",
    "viable",
    "vibrant",
    "virtue",
    "vulnerable",
    "as well as",
    "energetic",
    "established",
    "fictitious",
    "findings",
    "gadget",
    "glamorous",
    "gloomy",
    "inquisitive",
    "nutritious",
    "pastime",
    "plateau",
    "regrettably",
    "repetitive",
    "roast",
    "studies",
    "the emergence of",
    "vendor",
    "remarkabe",
    "glamourous",
    "inacessible"
  ]) {
    assertStudentLookupContract(word, await lookupForStudent(word, { fetchLiveTeacher: true }));
  }

  for (const [word, expected] of [
    ["look forward to", "phrase:verb:期待:curated-sense-bank"],
    ["be used to", "phrase:adjective:習慣於:curated-sense-bank"],
    ["get used to", "phrase:verb:變得習慣於:curated-sense-bank"],
    ["object to", "phrase:verb:反對:curated-sense-bank"],
    ["be opposed to", "phrase:adjective:反對:curated-sense-bank"],
    ["commit to", "phrase:verb:承諾 / 致力於:curated-sense-bank"],
    ["be committed to", "phrase:adjective:致力於:curated-sense-bank"],
    ["dedicate to", "phrase:verb:奉獻於:curated-sense-bank"],
    ["be dedicated to", "phrase:adjective:專注於 / 奉獻於:curated-sense-bank"],
    ["devote to", "phrase:verb:投身於:curated-sense-bank"],
    ["be devoted to", "phrase:adjective:全心投入於:curated-sense-bank"],
    ["contribute to", "phrase:verb:有助於 / 促成:curated-sense-bank"],
    ["with a view to", "phrase:adverb:為了 / 目的在於:curated-sense-bank"],
    ["with an eye to", "phrase:adverb:考慮到 / 目的在於:curated-sense-bank"],
    ["adapt to", "phrase:verb:適應:curated-sense-bank"],
    ["adjust to", "phrase:verb:調整 / 適應:curated-sense-bank"],
    ["admit to", "phrase:verb:承認:curated-sense-bank"],
    ["confess to", "phrase:verb:坦白 / 交代:curated-sense-bank"],
    ["take to", "phrase:verb:開始喜歡 / 養成...習慣:curated-sense-bank"],
    ["resort to", "phrase:verb:訴諸於 / 不得不使用:curated-sense-bank"],
    ["apply oneself to", "phrase:verb:專心致力於:curated-sense-bank"],
    ["be close to", "phrase:adjective:接近於:curated-sense-bank"],
    ["be near to", "phrase:adjective:接近於:curated-sense-bank"],
    ["key to", "phrase:noun:...的關鍵:curated-sense-bank"],
    ["secret to", "phrase:noun:...的秘訣:curated-sense-bank"],
    ["solution to", "phrase:noun:...的解決辦法:curated-sense-bank"],
    ["alternative to", "phrase:noun:...之外的替代方案:curated-sense-bank"],
    ["approach to", "phrase:noun:...的方法:curated-sense-bank"],
    ["access to", "phrase:noun:進入 / 使用...的權利或機會:curated-sense-bank"],
    ["response to", "phrase:noun:對...的回應:curated-sense-bank"],
    ["reaction to", "phrase:noun:對...的反應:curated-sense-bank"],
    ["challenge to", "phrase:noun:對...的挑戰:curated-sense-bank"],
    ["limit to", "phrase:noun:對...的限制:curated-sense-bank"],
    ["open to", "phrase:adjective:對...開放的 / 不排斥的:curated-sense-bank"],
    ["equal to", "phrase:adjective:勝任...的 / 與...相等的:curated-sense-bank"],
    ["essential to", "phrase:adjective:對...不可或缺的:curated-sense-bank"],
    ["preparatory to", "phrase:adverb:作為...的準備:curated-sense-bank"],
    ["prior to", "phrase:preposition:在...之前:curated-sense-bank"],
    ["impervious to", "phrase:adjective:不受...影響的:curated-sense-bank"],
    ["resigned to", "phrase:adjective:無奈接受...的:curated-sense-bank"]
  ]) {
    const [entry] = await lookupForStudent(word);
    assert.ok(entry, `${word} should be available in student lookup`);
    assert.strictEqual(`${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`, expected);
  }

  for (const [word, expected] of [
    ["pick your brains", "phrase:verb:向某人請教 / 徵詢某人意見:mock-unseen-mt15-paper3-reviewed"],
    ["meet up in person", "phrase:verb:見面 / 相約見面:mock-unseen-mt15-paper3-reviewed"],
    ["feel spied on", "phrase:verb:感到被監視:mock-unseen-mt15-paper3-reviewed"],
    ["not in the same league as", "phrase:preposition:不能與...相比 / 不及...:mock-unseen-mt15-paper3-reviewed"]
  ]) {
    const [entry] = await lookupForStudent(word);
    assert.ok(entry, `${word} should be available in student lookup`);
    assert.strictEqual(`${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`, expected);
  }

  for (const [word, expected] of [
    ["off the beaten track", "phrase:adjective:人跡罕至的 / 非熱門路線的:mock-unseen-mt37-paper3-reviewed"],
    ["Hong Kong Geopark", "phrase:noun:香港地質公園:mock-unseen-mt37-paper3-reviewed"],
    ["stone wall trees", "phrase:noun:石牆樹:mock-unseen-mt37-paper3-reviewed"],
    ["keep your distance", "phrase:verb:保持距離:mock-unseen-mt37-paper3-reviewed"]
  ]) {
    const [entry] = await lookupForStudent(word);
    assert.ok(entry, `${word} should be available in student lookup`);
    assert.strictEqual(`${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`, expected);
  }

  for (const [word, expected] of [
    ["jumble sale", "phrase:noun:舊物義賣 / 雜物義賣:mock-unseen-mt40-paper3-reviewed"],
    ["pair the toaster", "word:verb:配對 / 連接裝置:mock-unseen-mt40-paper3-reviewed"],
    ["big-ticket items", "phrase:noun:貴價貨品 / 高價值物品:mock-unseen-mt40-paper3-reviewed"],
    ["marketing ploy", "phrase:noun:營銷手段 / 宣傳花招:mock-unseen-mt40-paper3-reviewed"],
    ["mixed bag", "phrase:noun:好壞參半的事物:mock-unseen-mt40-paper3-reviewed"],
    ["get ahead of yourself", "phrase:verb:操之過急 / 太快下結論:mock-unseen-mt40-paper3-reviewed"]
  ]) {
    const [entry] = await lookupForStudent(word);
    assert.ok(entry, `${word} should be available in student lookup`);
    assert.strictEqual(`${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`, expected);
  }

  for (const [word, expected] of [
    ["guest editorial", "phrase:noun:客席社論 / 特邀社論:mock-unseen-mt44-paper3-reviewed"],
    ["scavenger hunt", "phrase:noun:尋寶遊戲:mock-unseen-mt44-paper3-reviewed"],
    ["step into the shoes of", "phrase:verb:設身處地 / 代入某人的處境:mock-unseen-mt44-paper3-reviewed"],
    ["camera obscura", "phrase:noun:暗箱 / 針孔成像裝置:mock-unseen-mt44-paper3-reviewed"],
    ["instant gratification", "phrase:noun:即時滿足:mock-unseen-mt44-paper3-reviewed"],
    ["worth her salt", "phrase:adjective:稱職的 / 名副其實的:mock-unseen-mt44-paper3-reviewed"]
  ]) {
    const [entry] = await lookupForStudent(word);
    assert.ok(entry, `${word} should be available in student lookup`);
    assert.strictEqual(`${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`, expected);
  }

  for (const [word, expected] of [
    ["sharing economy", "phrase:noun:共享經濟:mock-unseen-mt47-paper3-reviewed"],
    ["cut out the middleman", "phrase:verb:省去中間人 / 直接交易:mock-unseen-mt47-paper3-reviewed"],
    ["hot desk", "phrase:noun:流動辦公桌 / 非固定座位:mock-unseen-mt47-paper3-reviewed"],
    ["bugged the hell out of", "phrase:verb:令...非常煩厭:mock-unseen-mt47-paper3-reviewed"],
    ["throwing money in the sea", "phrase:verb:浪費金錢 / 把錢倒進海裡:mock-unseen-mt47-paper3-reviewed"],
    ["I stand corrected", "phrase:verb:承認自己錯了 / 接受指正:mock-unseen-mt47-paper3-reviewed"]
  ]) {
    const [entry] = await lookupForStudent(word);
    assert.ok(entry, `${word} should be available in student lookup`);
    assert.strictEqual(`${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`, expected);
  }

  console.log("vocab_lookup_order tests passed");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
