#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const VocabExampleUtils = require("../vocab_example_utils.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_SEED = path.join(ROOT_DIR, "vocab_example_seed.js");

const CURATED_EXAMPLES = [
  {
    word: "game",
    pos: "noun",
    meaning: "遊戲",
    level: "A1",
    examples: [
      ["This game is fun.", "這個遊戲很好玩。"],
      ["We play a word game.", "我們玩一個文字遊戲。"],
      ["I like this game.", "我喜歡這個遊戲。"]
    ]
  },
  {
    word: "game",
    pos: "noun",
    meaning: "比賽",
    level: "A2",
    examples: [
      ["Our team won the game.", "我們的隊伍贏了比賽。"],
      ["The game starts at four.", "比賽四點開始。"],
      ["He watched the football game.", "他看了那場足球比賽。"]
    ]
  },
  {
    word: "game",
    pos: "noun",
    meaning: "野味",
    level: "C1",
    examples: [
      ["Some restaurants serve game meat.", "有些餐廳供應野味肉類。"],
      ["Game is not common in Hong Kong.", "野味在香港並不常見。"],
      ["The menu included game dishes.", "餐牌包括野味菜式。"]
    ]
  },
  {
    word: "go",
    pos: "verb",
    meaning: "去",
    level: "A1",
    examples: [
      ["I go to school.", "我去學校。"],
      ["We go home together.", "我們一起回家。"],
      ["They go to the park.", "他們去公園。"]
    ]
  },
  {
    word: "go",
    pos: "verb",
    meaning: "變成",
    level: "A2",
    examples: [
      ["The milk goes bad quickly.", "牛奶很快變壞。"],
      ["The sky goes dark.", "天空變暗了。"],
      ["His face goes red.", "他的臉變紅了。"]
    ]
  },
  {
    word: "go",
    pos: "verb",
    meaning: "運作 / 進行",
    level: "B1",
    examples: [
      ["The lesson goes well today.", "今天的課堂進行得很順利。"],
      ["The plan goes smoothly.", "計劃進行得很順利。"],
      ["How did the meeting go?", "會議進行得怎樣？"]
    ]
  },
  {
    word: "get",
    pos: "verb",
    meaning: "得到 / 取得",
    level: "A1",
    examples: [
      ["I get a new book.", "我得到一本新書。"],
      ["She gets a sticker.", "她得到一張貼紙。"],
      ["We get our test papers.", "我們拿到測驗卷。"]
    ]
  },
  {
    word: "get",
    pos: "verb",
    meaning: "到達",
    level: "A2",
    examples: [
      ["I get to school early.", "我很早到達學校。"],
      ["They get home at six.", "他們六點到家。"],
      ["We get there by bus.", "我們乘巴士到達那裡。"]
    ]
  },
  {
    word: "get",
    pos: "verb",
    meaning: "變得",
    level: "A2",
    examples: [
      ["The room gets hot.", "房間變熱了。"],
      ["She gets tired after school.", "她放學後變得很累。"],
      ["The work gets easier.", "這份工作變得容易了。"]
    ]
  },
  {
    word: "look",
    pos: "verb",
    meaning: "看",
    level: "A1",
    examples: [
      ["Look at the board.", "看著黑板。"],
      ["I look at the picture.", "我看著那幅圖畫。"],
      ["Please look here.", "請看這裡。"]
    ]
  },
  {
    word: "look",
    pos: "verb",
    meaning: "看起來",
    level: "A2",
    examples: [
      ["You look happy today.", "你今天看起來很開心。"],
      ["The cake looks delicious.", "蛋糕看起來很好吃。"],
      ["He looks tired now.", "他現在看起來很累。"]
    ]
  },
  {
    word: "right",
    pos: "adjective",
    meaning: "正確的",
    level: "A1",
    examples: [
      ["Your answer is right.", "你的答案是正確的。"],
      ["This is the right page.", "這是正確的一頁。"],
      ["Choose the right word.", "選擇正確的字。"]
    ]
  },
  {
    word: "right",
    pos: "noun",
    meaning: "右邊 / 右方",
    level: "A1",
    examples: [
      ["Turn right at the shop.", "在商店那裡向右轉。"],
      ["My bag is on the right.", "我的書包在右邊。"],
      ["Stand on my right.", "站在我的右邊。"]
    ]
  },
  {
    word: "right",
    pos: "noun",
    meaning: "權利",
    level: "B1",
    examples: [
      ["Children have the right to learn.", "兒童有學習的權利。"],
      ["Everyone has this right.", "每個人都有這項權利。"],
      ["We should respect others' rights.", "我們應該尊重別人的權利。"]
    ]
  },
  {
    word: "kind",
    pos: "adjective",
    meaning: "友善的",
    level: "A1",
    examples: [
      ["My teacher is kind.", "我的老師很友善。"],
      ["She is kind to everyone.", "她對每個人都很友善。"],
      ["A kind friend helps me.", "一位友善的朋友幫助我。"]
    ]
  },
  {
    word: "kind",
    pos: "noun",
    meaning: "種類",
    level: "A2",
    examples: [
      ["What kind of book is this?", "這是甚麼種類的書？"],
      ["I like this kind of game.", "我喜歡這種遊戲。"],
      ["There are many kinds of fruit.", "水果有很多種類。"]
    ]
  },
  {
    word: "present",
    pos: "noun",
    meaning: "禮物",
    level: "A1",
    examples: [
      ["I got a birthday present.", "我收到一份生日禮物。"],
      ["This present is for you.", "這份禮物是給你的。"],
      ["She opens the present.", "她打開那份禮物。"]
    ]
  },
  {
    word: "present",
    pos: "adjective",
    meaning: "在場的",
    level: "B1",
    examples: [
      ["All students are present today.", "今天所有學生都在場。"],
      ["The teacher was present too.", "老師也在場。"],
      ["Only ten people were present.", "只有十個人在場。"]
    ]
  },
  {
    word: "present",
    pos: "verb",
    meaning: "呈現 / 展示",
    level: "B1",
    examples: [
      ["We present our project today.", "我們今天展示我們的專題。"],
      ["She presents her idea clearly.", "她清楚地展示她的想法。"],
      ["They present the results in class.", "他們在課堂上展示結果。"]
    ]
  },
  {
    word: "book",
    pos: "noun",
    meaning: "書",
    level: "A1",
    examples: [
      ["This book is interesting.", "這本書很有趣。"],
      ["I read a book at home.", "我在家讀一本書。"],
      ["Please open your book.", "請打開你的書。"]
    ]
  },
  {
    word: "book",
    pos: "verb",
    meaning: "預訂",
    level: "A2",
    examples: [
      ["We book a table online.", "我們在網上預訂一張桌子。"],
      ["Dad books the tickets.", "爸爸預訂門票。"],
      ["Please book the room early.", "請早點預訂房間。"]
    ]
  },
  {
    word: "watch",
    pos: "verb",
    meaning: "觀看",
    level: "A1",
    examples: [
      ["I watch TV after dinner.", "我晚飯後看電視。"],
      ["We watch a short video.", "我們觀看一段短片。"],
      ["They watch the football game.", "他們觀看足球比賽。"]
    ]
  },
  {
    word: "watch",
    pos: "noun",
    meaning: "手錶",
    level: "A1",
    examples: [
      ["My watch is blue.", "我的手錶是藍色的。"],
      ["He wears a new watch.", "他戴著一隻新手錶。"],
      ["This watch is too big.", "這隻手錶太大了。"]
    ]
  },
  {
    word: "hawker",
    pos: "noun",
    meaning: "小販",
    level: "B1",
    examples: [
      ["The hawker sells fish balls.", "那位小販售賣魚蛋。"],
      ["A hawker works near the market.", "一位小販在市場附近工作。"],
      ["We buy snacks from a hawker.", "我們向小販買小食。"]
    ]
  },
  {
    word: "evaluate",
    pos: "verb",
    meaning: "評估",
    level: "B2",
    examples: [
      ["Teachers evaluate our writing.", "老師評估我們的寫作。"],
      ["We evaluate the plan carefully.", "我們仔細評估這個計劃。"],
      ["The report evaluates the results.", "報告評估那些結果。"]
    ]
  },
  {
    word: "guts",
    pos: "noun",
    meaning: "膽量",
    level: "B1",
    examples: [
      ["He has the guts to try.", "他有膽量去嘗試。"],
      ["It takes guts to speak up.", "站出來發聲需要膽量。"],
      ["She showed real guts today.", "她今天展現了真正的膽量。"]
    ]
  }
];

function loadSeed(filePath) {
  const resolved = path.resolve(filePath || DEFAULT_SEED);
  delete require.cache[require.resolve(resolved)];
  return require(resolved);
}

function stableId(localKey, index, source) {
  return `seed-${VocabExampleUtils.stableHash(`${localKey}:${index}:${source}`)}`;
}

function makeEntry(item) {
  const word = VocabExampleUtils.normalizeWord(item.word);
  const meaning = VocabExampleUtils.normalizeMeaning(item.meaning);
  const type = item.type || (word.includes(" ") ? "phrase" : "word");
  const level = String(item.level || "").trim().toUpperCase();
  const hints = VocabExampleUtils.normalizeHints([{
    meaning,
    pos: item.pos || "",
    type,
    level
  }]);
  const localKey = VocabExampleUtils.getLocalCacheKey(word, hints);
  return {
    key: localKey,
    value: {
      word,
      display: item.display || word,
      source: "local-seed-curated",
      status: "ready",
      level,
      meaning,
      pos: item.pos || "",
      type,
      hints,
      examples: item.examples.map(([source, target], index) => ({
        id: stableId(localKey, index, source),
        source,
        target,
        meaning,
        level
      }))
    }
  };
}

function writeSeed(filePath, seed) {
  const body = [
    "(function attachVocabExampleSeed(root, data) {",
    "  if (typeof module !== \"undefined\" && module.exports) {",
    "    module.exports = data;",
    "  }",
    "  root.VOCAB_EXAMPLE_SEED = data;",
    `})(typeof globalThis !== \"undefined\" ? globalThis : window, ${JSON.stringify(seed, null, 2)});`,
    ""
  ].join("\n");
  fs.writeFileSync(filePath, body);
}

function main(argv) {
  const filePath = path.resolve(argv[0] || DEFAULT_SEED);
  const seed = loadSeed(filePath);
  const entries = { ...(seed.entries || {}) };
  CURATED_EXAMPLES.map(makeEntry).forEach(({ key, value }) => {
    entries[key] = value;
  });
  const entryValues = Object.values(entries);
  seed.entries = Object.fromEntries(Object.entries(entries).sort(([left], [right]) => left.localeCompare(right)));
  seed.meta = {
    ...(seed.meta || {}),
    generatedAt: new Date().toISOString(),
    entryCount: entryValues.length,
    exampleCount: entryValues.reduce((count, entry) => count + (entry.examples || []).length, 0),
    readyCount: entryValues.filter((entry) => entry.status === "ready").length,
    curatedCount: entryValues.filter((entry) => entry.source === "local-seed-curated").length
  };
  writeSeed(filePath, seed);
  console.log(`Seeded ${CURATED_EXAMPLES.length} curated vocab example entries into ${filePath}`);
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = {
  CURATED_EXAMPLES,
  makeEntry
};
