const assert = require("assert");

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
    ["phrase:verb:看一看 / 看一下:curated-sense-bank"]
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
      "verb:留下了（leave 的過去式 / PP）:curated-sense-bank"
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
      "noun:研究結果:curated-sense-bank"
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
      "verb:投射:curated-sense-bank"
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
      "noun:理由 / 根據:curated-sense-bank"
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
    ["noun:收藏 / 收藏品:curated-sense-bank"]
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
      "noun:主食 / 主要產品:curated-sense-bank"
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
    ["phrase:verb:留意 / 注意:curated-sense-bank"]
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
    ["phrase:verb:謀生 / 維持生計:curated-sense-bank"]
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
    (await lookupForStudent("pose a threat")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:構成威脅:curated-sense-bank"]
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
    (await lookupForStudent("regardless of")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:preposition:不論 / 不管:curated-sense-bank"]
  );

  assert.deepStrictEqual(
    (await lookupForStudent("rely on")).map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.source}`),
    ["phrase:verb:依賴 / 依靠:curated-sense-bank"]
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
    ["phrase:adjective:與...有關:curated-sense-bank"]
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
    ["Thai:adjective:泰國的:curated-sense-bank"]
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
    (await lookupForStudent("general studies")).map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
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

  console.log("vocab_lookup_order tests passed");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
