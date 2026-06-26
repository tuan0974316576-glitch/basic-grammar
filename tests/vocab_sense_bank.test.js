const assert = require("assert");

delete require.cache[require.resolve("../vocab_sense_bank.js")];
const senseBank = require("../vocab_sense_bank.js");

const game = senseBank.lookup("game");
assert.deepStrictEqual(
  game.map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:遊戲", "noun:比賽"]
);

const have = senseBank.lookup(" HAVE ");
assert.ok(have.some((entry) => entry.meaning === "食 / 飲" && entry.pos === "verb"));
assert.ok(have.some((entry) => entry.meaning === "上 / 參加" && entry.level === "A2"));
assert.deepStrictEqual(
  senseBank.lookup("have a look").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:看一看 / 看一下"]
);
assert.deepStrictEqual(
  senseBank.lookup("have lunch").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:吃午餐"]
);

const lookUp = senseBank.lookup("look   up");
assert.strictEqual(lookUp.length, 1);
assert.strictEqual(lookUp[0].type, "phrase");
assert.strictEqual(lookUp[0].meaning, "查閱 / 查字典");
assert.strictEqual(lookUp[0].overrideTeacher, true);

assert.deepStrictEqual(
  senseBank.lookup("work").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:工作", "noun:作品", "verb:工作 / 做事", "verb:運作 / 奏效"]
);
assert.ok(senseBank.lookup("work").every((entry) => entry.overrideTeacher));
assert.ok(senseBank.lookup("mean").some((entry) => entry.pos === "adjective" && entry.meaning === "吝嗇的"));
assert.deepStrictEqual(
  senseBank.lookup("practice").map((entry) => `${entry.pos}:${entry.meaning}:${entry.level}`),
  ["noun:練習:A2", "noun:做法:B1", "noun:慣例:B1", "verb:練習:A2"]
);
assert.deepStrictEqual(
  senseBank.lookup("subject to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:受...影響的 / 取決於"]
);
assert.deepStrictEqual(
  senseBank.lookup("effect").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:影響", "noun:效果"]
);
assert.deepStrictEqual(
  senseBank.lookup("have an effect on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:對...有影響"]
);
assert.deepStrictEqual(
  senseBank.lookup("have effect on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:對...有影響"]
);
assert.deepStrictEqual(
  senseBank.lookup("have an impact on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:對...有影響 / 對...有衝擊"]
);
assert.deepStrictEqual(
  senseBank.lookup("have impact on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:對...有影響 / 對...有衝擊"]
);
assert.deepStrictEqual(
  senseBank.lookup("reason").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:理由", "noun:原因"]
);
assert.deepStrictEqual(
  senseBank.lookup("cause").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:原因", "verb:導致", "verb:引起"]
);
assert.deepStrictEqual(
  senseBank.lookup("result").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:結果", "verb:導致 / 產生結果"]
);
assert.deepStrictEqual(
  senseBank.lookup("impact").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:影響 / 衝擊", "verb:影響 / 衝擊"]
);
assert.deepStrictEqual(
  senseBank.lookup("term").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:學期", "noun:詞語 / 術語", "noun:條款", "noun:期限", "verb:稱為 / 把...叫做"]
);
assert.deepStrictEqual(
  senseBank.lookup("terms and conditions").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:條款及細則"]
);
assert.deepStrictEqual(
  senseBank.lookup("conditions").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  [
    "condition:noun:狀況",
    "condition:noun:狀態",
    "condition:noun:條件",
    "condition:noun:環境 / 情況",
    "terms:noun:條款",
    "terms:noun:條件"
  ]
);
assert.ok(senseBank.lookup("safe").some((entry) => entry.pos === "noun" && entry.meaning === "保險箱"));
assert.ok(senseBank.lookup("fair").some((entry) => entry.pos === "adjective" && entry.meaning === "尚可的 / 幾好的"));
assert.ok(senseBank.lookup("voice").some((entry) => entry.pos === "verb" && entry.meaning === "表達 / 說出"));
assert.ok(senseBank.lookup("bank").some((entry) => entry.pos === "verb" && entry.meaning === "存錢 / 把錢存入銀行"));
assert.ok(senseBank.lookup("major").some((entry) => entry.pos === "noun" && entry.meaning === "主修科目"));
assert.ok(senseBank.lookup("major").some((entry) => entry.pos === "verb" && entry.meaning === "主修"));
assert.ok(senseBank.lookup("parent notice").some((entry) => entry.pos === "noun" && entry.meaning === "家長通告"));
assert.ok(senseBank.lookup("dictation book").some((entry) => entry.pos === "noun" && entry.meaning === "默書簿"));
assert.ok(senseBank.lookup("corrections").some((entry) => entry.pos === "noun" && entry.meaning === "改正"));
assert.deepStrictEqual(
  senseBank.lookup("composition").map((entry) => `${entry.pos}:${entry.meaning}:${entry.level}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:作文:A2:override", "noun:組成 / 構成:B2:", "noun:樂曲:B2:"]
);
assert.ok(senseBank.lookup("green minibus").some((entry) => entry.pos === "noun" && entry.meaning === "綠色小巴"));
assert.ok(senseBank.lookup("red minibus").some((entry) => entry.pos === "noun" && entry.meaning === "紅色小巴"));
assert.ok(senseBank.lookup("Light Rail").some((entry) => entry.display === "Light Rail" && entry.meaning === "輕鐵"));
assert.ok(senseBank.lookup("Airport Express").some((entry) => entry.display === "Airport Express" && entry.meaning === "機場快線"));
assert.ok(senseBank.lookup("interchange station").some((entry) => entry.pos === "noun" && entry.meaning === "轉車站 / 轉乘站"));
assert.ok(senseBank.lookup("tap in").some((entry) => entry.pos === "verb" && entry.meaning === "拍卡入閘"));
assert.ok(senseBank.lookup("tap out").some((entry) => entry.pos === "verb" && entry.meaning === "拍卡出閘"));
assert.ok(senseBank.lookup("rice roll").some((entry) => entry.pos === "noun" && entry.meaning === "腸粉"));
assert.ok(senseBank.lookup("cart noodle").some((entry) => entry.pos === "noun" && entry.meaning === "車仔麵"));
assert.ok(senseBank.lookup("barbecued pork").some((entry) => entry.pos === "noun" && entry.meaning === "叉燒"));
assert.ok(senseBank.lookup("hot pot").some((entry) => entry.pos === "noun" && entry.meaning === "火鍋"));
assert.ok(senseBank.lookup("soy sauce").some((entry) => entry.pos === "noun" && entry.meaning === "豉油 / 醬油"));
assert.ok(senseBank.lookup("street food").some((entry) => entry.pos === "noun" && entry.meaning === "街頭小食 / 街頭食品"));
assert.ok(senseBank.lookup("snack shop").some((entry) => entry.pos === "noun" && entry.meaning === "小食店"));
assert.ok(senseBank.lookup("tea restaurant").some((entry) => entry.pos === "noun" && entry.meaning === "茶餐廳"));
assert.ok(senseBank.lookup("fishmonger").some((entry) => entry.pos === "noun" && entry.meaning === "魚檔 / 魚販"));
assert.ok(senseBank.lookup("vegetable stall").some((entry) => entry.pos === "noun" && entry.meaning === "菜檔"));
assert.ok(senseBank.lookup("fruit stall").some((entry) => entry.pos === "noun" && entry.meaning === "生果檔"));
assert.ok(senseBank.lookup("accident and emergency").some((entry) => entry.pos === "noun" && entry.meaning === "急症室"));
assert.ok(senseBank.lookup("A&E").some((entry) => entry.pos === "noun" && entry.meaning === "急症室"));
assert.ok(senseBank.lookup("capsule").some((entry) => entry.pos === "noun" && entry.meaning === "膠囊"));
assert.ok(senseBank.lookup("syrup").some((entry) => entry.pos === "noun" && entry.meaning === "藥水 / 糖漿"));
assert.ok(senseBank.lookup("dosage").some((entry) => entry.pos === "noun" && entry.meaning === "劑量 / 用藥分量"));
assert.ok(senseBank.lookup("bruise").some((entry) => entry.pos === "noun" && entry.meaning === "瘀傷"));
assert.ok(senseBank.lookup("faint").some((entry) => entry.pos === "verb" && entry.meaning === "暈倒"));
assert.ok(senseBank.lookup("vomit").some((entry) => entry.pos === "verb" && entry.meaning === "嘔吐"));
assert.ok(senseBank.lookup("diarrhea").some((entry) => entry.pos === "noun" && entry.meaning === "肚瀉 / 腹瀉"));
assert.ok(senseBank.lookup("constipation").some((entry) => entry.pos === "noun" && entry.meaning === "便秘"));
assert.deepStrictEqual(
  senseBank.lookup("about").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["preposition:關於", "adverb:大約"]
);
assert.deepStrictEqual(
  senseBank.lookup("bright").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:明亮的", "adjective:聰明的"]
);
assert.deepStrictEqual(
  senseBank.lookup("drop").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:掉下 / 放下", "verb:下降 / 減少", "noun:一滴", "noun:下降"]
);
assert.deepStrictEqual(
  senseBank.lookup("strong").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:強壯的", "adjective:強烈的"]
);
assert.deepStrictEqual(
  senseBank.lookup("wave").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:波浪", "noun:揮手", "verb:揮手"]
);
assert.deepStrictEqual(
  senseBank.lookup("check").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:檢查", "noun:檢查", "noun:賬單"]
);
assert.deepStrictEqual(
  senseBank.lookup("break").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:打破", "verb:弄壞", "noun:小休 / 休息"]
);
assert.deepStrictEqual(
  senseBank.lookup("lose").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:失去", "verb:輸掉"]
);
assert.deepStrictEqual(
  senseBank.lookup("number").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:數字", "noun:號碼", "verb:編號", "verb:數算"]
);
assert.deepStrictEqual(
  senseBank.lookup("stop").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:停止", "noun:車站", "noun:停止"]
);
assert.deepStrictEqual(
  senseBank.lookup("study").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:學習", "verb:研究", "noun:研究", "noun:書房"]
);
assert.deepStrictEqual(
  senseBank.lookup("egg waffle").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:雞蛋仔"]
);
assert.deepStrictEqual(
  senseBank.lookup("egg tart").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:蛋撻"]
);
assert.deepStrictEqual(
  senseBank.lookup("lung cancer").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:肺癌"]
);
assert.deepStrictEqual(
  senseBank.lookup("Octopus card").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:八達通"]
);
assert.deepStrictEqual(
  senseBank.lookup("Mong Kok").map((entry) => entry.display),
  ["Mong Kok"]
);
assert.deepStrictEqual(
  senseBank.lookup("china").map((entry) => entry.display),
  ["China"]
);
assert.deepStrictEqual(
  senseBank.lookup("south korea").map((entry) => entry.display),
  ["South Korea"]
);
assert.deepStrictEqual(
  senseBank.lookup("north korea").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["North Korea:noun:北韓"]
);
assert.deepStrictEqual(
  senseBank.lookup("tuen mun").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Tuen Mun:noun:屯門"]
);
assert.deepStrictEqual(
  senseBank.lookup("chinese language").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Chinese Language:phrase:noun:中文科 / 中國語文"]
);
assert.deepStrictEqual(
  senseBank.lookup("english language").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["English Language:phrase:noun:英文科 / 英國語文"]
);

assert.deepStrictEqual(
  senseBank.lookup("put on").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:穿上 / 戴上"]
);
assert.deepStrictEqual(
  senseBank.lookup("take off").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:脫下", "phrase:起飛"]
);
assert.strictEqual(senseBank.lookup("take off")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("pick up").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:拿起 / 撿起", "phrase:接載"]
);
assert.strictEqual(senseBank.lookup("pick up")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("wake up").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:醒來", "phrase:叫醒"]
);
assert.strictEqual(senseBank.lookup("wake up")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("care for").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:照顧", "phrase:關心 / 在乎"]
);
assert.strictEqual(senseBank.lookup("care for")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("bring up").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:提出", "phrase:撫養"]
);
assert.strictEqual(senseBank.lookup("bring up")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("go through").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:經歷", "phrase:仔細查看 / 檢查"]
);
assert.strictEqual(senseBank.lookup("go through")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("turn down").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:拒絕", "phrase:調低"]
);
assert.strictEqual(senseBank.lookup("turn down")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("account for").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:佔", "phrase:解釋 / 是...原因"]
);
assert.strictEqual(senseBank.lookup("account for")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("contribute to").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:促成 / 導致", "phrase:貢獻"]
);
assert.strictEqual(senseBank.lookup("contribute to")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("go on").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:繼續", "phrase:發生 / 進行"]
);
assert.strictEqual(senseBank.lookup("go on")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("get on").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:上車", "phrase:相處"]
);
assert.strictEqual(senseBank.lookup("get on")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("break down").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:壞掉 / 失靈", "phrase:崩潰 / 情緒失控", "phrase:分解 / 拆解"]
);
assert.strictEqual(senseBank.lookup("break down")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("take place").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:發生", "phrase:舉行"]
);
assert.strictEqual(senseBank.lookup("take place")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("bring out").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:出版 / 推出", "phrase:使顯現 / 帶出"]
);
assert.strictEqual(senseBank.lookup("bring out")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("refer to").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:指的是", "phrase:提及 / 提到"]
);
assert.strictEqual(senseBank.lookup("refer to")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("set up").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:創立 / 設立", "phrase:安裝 / 設定"]
);
assert.strictEqual(senseBank.lookup("set up")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("take over").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:接管", "phrase:收購"]
);
assert.strictEqual(senseBank.lookup("take over")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("take up").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:佔用", "phrase:開始從事 / 開始學"]
);
assert.strictEqual(senseBank.lookup("take up")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("come up with").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:想出", "phrase:提出"]
);
assert.strictEqual(senseBank.lookup("come up with")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("turn off").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:關掉"]
);
assert.deepStrictEqual(
  senseBank.lookup("as a result").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:結果 / 因此"]
);
assert.deepStrictEqual(
  senseBank.lookup("a piece of").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:一塊 / 一張 / 一件"]
);

[
  ["rice", "noun:飯 / 米"],
  ["noodle", "noun:麵"],
  ["homework", "noun:功課"],
  ["information", "noun:資訊 / 資料"],
  ["advice", "noun:建議"],
  ["news", "noun:新聞"],
  ["equipment", "noun:器材 / 設備"],
  ["furniture", "noun:家具"]
].forEach(([word, expected]) => {
  assert.deepStrictEqual(
    senseBank.lookup(word).map((entry) => `${entry.pos}:${entry.meaning}`),
    [expected]
  );
});

const hawker = senseBank.lookup("hawker");
assert.strictEqual(hawker[0].pos, "noun");
assert.strictEqual(hawker[0].meaning, "小販");

assert.deepStrictEqual(
  senseBank.lookup("swift").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:迅速的 / 敏捷的"]
);
assert.deepStrictEqual(
  senseBank.lookup("won't").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["modal:不會 / 將不會"]
);
assert.deepStrictEqual(
  senseBank.lookup("ought to").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["modal:應該"]
);
assert.deepStrictEqual(
  senseBank.lookup("delicacy").map((entry) => `${entry.pos}:${entry.meaning}`),
  [
    "noun:佳餚",
    "noun:精緻 / 微妙"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("characteristic").map((entry) => `${entry.pos}:${entry.meaning}`),
  [
    "adjective:典型的",
    "adjective:特有的",
    "noun:特徵",
    "noun:特點"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("considerable").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:相當大的", "adjective:可觀的"]
);
assert.deepStrictEqual(
  senseBank.lookup("critical").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:關鍵的", "adjective:批判性的", "adjective:危急的"]
);
assert.deepStrictEqual(
  senseBank.lookup("decline").map((entry) => `${entry.pos}:${entry.meaning}`),
  [
    "noun:下降",
    "noun:衰退",
    "verb:下降",
    "verb:衰退",
    "verb:婉拒 / 拒絕"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("dependent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:依賴的", "adjective:取決於...的"]
);
assert.deepStrictEqual(
  senseBank.lookup("desperate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:絕望的", "adjective:極需要的"]
);
assert.deepStrictEqual(
  senseBank.lookup("distinct").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:明顯不同的", "adjective:清楚的"]
);
assert.deepStrictEqual(
  senseBank.lookup("display").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:展示", "verb:顯示", "noun:展示 / 陳列", "noun:顯示器 / 顯示畫面"]
);
assert.deepStrictEqual(
  senseBank.lookup("distribute").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:分發", "verb:分配", "verb:分佈"]
);
assert.deepStrictEqual(
  senseBank.lookup("distribution").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:分發", "noun:分配", "noun:分佈"]
);
assert.deepStrictEqual(
  senseBank.lookup("document").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:文件", "verb:記錄", "verb:證明"]
);
assert.deepStrictEqual(
  senseBank.lookup("donation").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:捐款", "noun:捐贈"]
);
assert.deepStrictEqual(
  senseBank.lookup("dramatic").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:巨大的 / 突然的", "adjective:戲劇的"]
);
assert.deepStrictEqual(
  senseBank.lookup("edit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:編輯", "verb:修改"]
);
assert.deepStrictEqual(
  senseBank.lookup("eliminate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:消除", "verb:淘汰"]
);
assert.deepStrictEqual(
  senseBank.lookup("emphasis").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:強調", "noun:重點"]
);
assert.deepStrictEqual(
  senseBank.lookup("demonstrate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:示範", "verb:展示", "verb:顯示", "verb:證明"]
);
assert.deepStrictEqual(
  senseBank.lookup("embrace").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:接受", "verb:支持"]
);
assert.deepStrictEqual(
  senseBank.lookup("evaluate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:評估", "verb:評價"]
);
assert.deepStrictEqual(
  senseBank.lookup("create").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:創造", "verb:建立"]
);
assert.deepStrictEqual(
  senseBank.lookup("comfort").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:舒適", "noun:安慰", "verb:安慰"]
);
assert.deepStrictEqual(
  senseBank.lookup("turn").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:轉動", "verb:轉彎", "noun:輪流", "noun:次序"]
);
assert.deepStrictEqual(
  senseBank.lookup("close").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:關閉", "adjective:接近的", "adjective:親密的", "adverb:接近地", "noun:結束"]
);
assert.deepStrictEqual(
  senseBank.lookup("state").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:狀態", "noun:州", "noun:國家", "verb:陳述 / 說明", "adjective:國家的 / 州的"]
);
assert.deepStrictEqual(
  senseBank.lookup("hold").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:拿著 / 握住", "verb:舉行", "verb:容納", "verb:持有", "noun:抓握", "noun:控制"]
);
assert.deepStrictEqual(
  senseBank.lookup("record").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:記錄", "noun:紀錄", "noun:唱片", "verb:記錄", "verb:錄音", "verb:錄影"]
);
assert.deepStrictEqual(
  senseBank.lookup("right").map((entry) => `${entry.pos}:${entry.meaning}`),
  [
    "adjective:正確的",
    "adjective:右邊的",
    "noun:右邊 / 右方",
    "adverb:向右",
    "noun:權利",
    "adverb:正確地",
    "adverb:立刻 / 馬上"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("left").map((entry) => `${entry.pos}:${entry.meaning}`),
  [
    "adjective:左邊的",
    "noun:左邊",
    "adverb:向左",
    "adverb:在左邊",
    "verb:離開了（leave 的過去式 / PP）",
    "verb:留下了（leave 的過去式 / PP）"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("light").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:光", "noun:燈", "adjective:輕的", "adjective:淺色的", "verb:點燃"]
);
assert.deepStrictEqual(
  senseBank.lookup("sound").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:聲音", "verb:聽起來", "adjective:合理的", "adjective:可靠的"]
);
assert.deepStrictEqual(
  senseBank.lookup("class").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:班級", "noun:課堂", "noun:種類 / 類別"]
);
assert.deepStrictEqual(
  senseBank.lookup("hard").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:困難的", "adjective:硬的", "adverb:努力地"]
);
assert.deepStrictEqual(
  senseBank.lookup("free").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:免費的", "adjective:自由的", "adverb:免費地", "verb:釋放 / 使自由"]
);
assert.deepStrictEqual(
  senseBank.lookup("ask").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:問", "verb:要求"]
);
assert.deepStrictEqual(
  senseBank.lookup("call").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:打電話", "verb:稱呼", "noun:電話 / 呼叫"]
);
assert.deepStrictEqual(
  senseBank.lookup("see").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:看見", "verb:明白"]
);
assert.deepStrictEqual(
  senseBank.lookup("tell").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:告訴", "verb:講述"]
);
assert.deepStrictEqual(
  senseBank.lookup("get").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:得到", "verb:取得", "verb:收到", "verb:到達", "verb:變得"]
);
assert.deepStrictEqual(
  senseBank.lookup("make").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:製作", "verb:製造", "verb:使", "verb:令", "noun:品牌 / 型號"]
);
assert.deepStrictEqual(
  senseBank.lookup("take").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:拿", "verb:取", "verb:帶", "verb:乘搭", "verb:花費時間"]
);
assert.deepStrictEqual(
  senseBank.lookup("order").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:次序", "noun:命令", "noun:訂單", "verb:訂購", "verb:命令"]
);
assert.deepStrictEqual(
  senseBank.lookup("present").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:禮物", "noun:現在", "adjective:現在的", "adjective:在場的", "verb:呈現", "verb:展示", "verb:頒發"]
);
assert.deepStrictEqual(
  senseBank.lookup("cub").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:幼獸"]
);
assert.deepStrictEqual(
  senseBank.lookup("cubs").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:幼獸"]
);
assert.deepStrictEqual(
  senseBank.lookup("bear").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:熊:override", "verb:忍受:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("draw").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:畫畫:override", "verb:吸引:override", "noun:平局 / 和局:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("match").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:比賽:override", "noun:火柴:override", "verb:配對:override", "verb:相配:override", "verb:相襯:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("park").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:公園:override", "verb:泊車:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("plant").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:植物:override", "noun:工廠:override", "verb:種植:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("stand").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:站立:override", "verb:忍受:override", "noun:攤位 / 看台:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("rule out").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["phrase:verb:排除 / 不考慮:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("guts").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:膽量 / 勇氣:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("room").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:房間:override", "noun:空間:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("table").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:桌子:override", "noun:表格:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("be").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:是:override", "verb:成為:override", "auxiliary:be 動詞（am / is / are / was / were）:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("do").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:做:override", "verb:進行:override", "auxiliary:用於問句 / 否定句:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("form").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:表格:override", "noun:形式:override", "noun:形態:override", "verb:形成:override", "verb:組成:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("list").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:清單:override", "noun:名單:override", "verb:列出:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("green").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:綠色的:override", "noun:綠色:override", "adjective:環保的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("description").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:描述:override", "noun:說明:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("picture").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:圖畫:override", "noun:相片:override", "verb:想像:override", "verb:描繪:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("purpose").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:目的:override", "noun:用途:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("probably").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adverb:很可能 / 大概:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("regular").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:定期的:override", "adjective:規則的:override", "noun:常客:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("stage").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:舞台:override", "noun:階段:override", "verb:上演:override", "verb:舉辦:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("thought").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:想法:override", "noun:念頭:override", "verb:think 的過去式 / 過去分詞:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("yet").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adverb:尚未:override", "adverb:還:override", "conjunction:但是:override", "conjunction:然而:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("even").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adverb:甚至:override", "adjective:平坦的:override", "adjective:平均的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("if").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["conjunction:如果:override", "conjunction:是否:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("by").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["preposition:由:override", "preposition:被:override", "preposition:靠近:override", "adverb:經過:override", "adverb:在旁邊:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("may").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["may:modal:可能:override", "may:modal:可以:override", "May:noun:五月:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("it").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["it:pronoun:它 / 牠 / 這件事:override", "IT:noun:資訊科技:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("or").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["conjunction:或者:override", "conjunction:否則:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("will").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["modal:將會:override", "modal:會:override", "noun:意志:override", "noun:遺囑:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("around").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["preposition:在...周圍:override", "adverb:到處:override", "adverb:大約:override", "adverb:在周圍:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("could").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["modal:可以:override", "modal:可能:override", "modal:能夠:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("just").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adverb:只是:override", "adverb:剛剛:override", "adverb:正好:override", "adjective:公正的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("with").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["preposition:和...一起:override", "preposition:帶有:override", "preposition:使用:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("would").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["modal:會:override", "modal:願意:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("event").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:活動:override", "noun:事件:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("live").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:住:override", "verb:生活:override", "adjective:現場直播的:override", "adverb:現場直播地:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("move").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:移動:override", "verb:搬動:override", "verb:感動:override", "noun:行動:override", "noun:移動:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("model").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:模型:override", "noun:模特兒:override", "verb:示範:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("apply").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:申請:override", "verb:應用:override", "verb:使用:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("count").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:數:override", "verb:計算:override", "verb:重要:override", "verb:算數:override", "noun:數目:override", "noun:總數:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("direct").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:直接的:override", "adverb:直接地:override", "verb:指導 / 指揮:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("experience").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:經驗:override", "noun:經歷:override", "verb:經歷:override", "verb:體驗:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("expression").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:表達:override", "noun:表情:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("feature").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:特色:override", "noun:特徵:override", "verb:以...為特色:override", "verb:由...主演:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("physical").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:身體的:override", "adjective:物理的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("population").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:人口:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("develop").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:發展:override", "verb:成長:override", "verb:培養:override", "verb:形成:override", "verb:患上:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("development").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:發展", "noun:新發展 / 發展項目"]
);
assert.deepStrictEqual(
  senseBank.lookup("produce").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:生產:override", "verb:製造:override", "noun:農產品:override", "noun:農作物:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("process").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:過程:override", "noun:程序:override", "verb:處理:override", "verb:加工:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("rise").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:上升:override", "verb:升起:override", "noun:上升:override", "noun:增加:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("sign").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:標誌:override", "noun:跡象:override", "verb:簽署:override", "verb:簽名:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("shape").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:形狀:override", "verb:塑造:override", "verb:影響:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("keep").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:保持:override", "verb:保留:override", "verb:留著:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("meet").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:遇見:override", "verb:見面:override", "verb:滿足 / 符合:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("experiment").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:實驗:override", "verb:進行實驗:override", "verb:嘗試:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("following").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:以下的:override", "adjective:接著的:override", "preposition:在...之後:override", "noun:追隨者:override", "noun:支持者:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("mobile").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:手機:override", "adjective:流動的:override", "adjective:可移動的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("notice").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:告示:override", "noun:通知:override", "verb:注意到 / 留意:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("separate").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:分開:override", "verb:分離:override", "adjective:分開的:override", "adjective:獨立的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("survey").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:問卷調查:override", "noun:調查:override", "verb:調查:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("request").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:要求:override", "noun:請求:override", "verb:要求:override", "verb:請求:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("specific").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:特定的:override", "adjective:具體的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("consider").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:考慮:override", "verb:認為:override", "verb:視為:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("several").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["determiner:幾個 / 數個:override", "pronoun:幾個 / 數個:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("industry").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:行業:override", "noun:工業:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("drug").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:藥物:override", "noun:毒品:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("code").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:代碼:override", "noun:編碼:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("introduce").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:介紹:override", "verb:引入:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("join").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:加入:override", "verb:參加:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("know").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:知道:override", "verb:認識:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("step").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:步驟 / 措施:override", "noun:腳步:override", "verb:踏 / 踩:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("wave").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:波浪:override", "noun:揮手:override", "verb:揮手:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("whole").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:整個的 / 全部的:override", "noun:整體:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("power").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:力量:override", "noun:能力:override", "noun:權力:override", "noun:電力:override", "verb:為...提供動力:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("image").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:圖像:override", "noun:形象:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("movement").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:移動:override", "noun:運動:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("particular").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:特定的:override", "adjective:特別的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("rather").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adverb:頗:override", "adverb:相當:override", "adverb:反而:override", "adverb:而是:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("department").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:部門:override", "noun:政府部門:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("desert").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:沙漠:override", "verb:遺棄:override", "verb:離棄:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("competition").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:比賽:override", "noun:競爭:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("play").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:玩 / 打（球類）:override", "verb:演奏:override", "noun:戲劇:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("country").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:國家:override", "noun:鄉郊:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("alternative").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:替代品:override", "noun:另一選擇:override", "adjective:替代的:override", "adjective:另一選擇的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("late").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  [
    "adjective:遲的:override",
    "adjective:晚的:override",
    "adjective:已故的:override",
    "adverb:遲:override",
    "adverb:晚:override"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("learn").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:學習:override", "verb:得知:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("moment").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:時刻:override", "noun:片刻:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("ordinary").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:平凡的:override", "adjective:普通的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("involve").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:涉及:override", "verb:牽涉:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("individual").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:個人:override", "adjective:個別的:override", "adjective:個人的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("still").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adverb:仍然:override", "adjective:靜止的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("recent").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:最近的 / 近期的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("technology").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:科技 / 技術:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("unfortunately").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adverb:不幸地 / 可惜地:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("field").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:田野 / 運動場:override", "noun:領域 / 範疇:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("article").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:文章", "noun:冠詞"]
);
assert.deepStrictEqual(
  senseBank.lookup("ground").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:地面 / 土地", "noun:理由 / 根據"]
);
assert.deepStrictEqual(
  senseBank.lookup("incredible").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:難以置信的:override", "adjective:精彩的 / 非常好的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("used to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["phrase:modal:過去曾經 / 以前會:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("jewellery").map((entry) => `${entry.pos}:${entry.meaning}:${entry.level}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:珠寶:A2:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("behaviour").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:行為:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("realise").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:意識到:override", "verb:實現:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("realize").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:意識到:override", "verb:實現:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("recognise").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:認出:override", "verb:認可:override", "verb:承認:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("recognize").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:認出:override", "verb:認可:override", "verb:承認:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("organise").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:組織:override", "verb:安排:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("organize").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:組織:override", "verb:安排:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("USA").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["USA:noun:美國:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("UK").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["UK:noun:英國:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("GS").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["GS:noun:常識科:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("P.E. lesson").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["P.E. lesson:phrase:noun:體育課:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("tutorial centre").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["phrase:noun:補習社:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("Mongkok").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["Mongkok:noun:旺角:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("egg waffle").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:雞蛋仔:override"]
);

assert.deepStrictEqual(
  senseBank.lookup("customer-centric").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:以顧客為中心的"]
);
assert.deepStrictEqual(
  senseBank.lookup("Czech").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:捷克人 / 捷克語", "adjective:捷克的"]
);
assert.deepStrictEqual(
  senseBank.lookup("rise to fame").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:成名 / 走紅"]
);
assert.deepStrictEqual(
  senseBank.lookup("pretty").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:漂亮的", "adverb:頗 / 相當"]
);
assert.deepStrictEqual(
  senseBank.lookup("validity").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:有效性", "noun:合理性"]
);
assert.deepStrictEqual(
  senseBank.lookup("beard").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:鬍鬚"]
);
assert.deepStrictEqual(
  senseBank.lookup("hammer").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:錘子", "verb:用錘敲打"]
);
assert.deepStrictEqual(
  senseBank.lookup("cancelled").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:取消"]
);
assert.deepStrictEqual(
  senseBank.lookup("cancelling").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:取消"]
);
assert.deepStrictEqual(
  senseBank.lookup("spring").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:春天", "noun:泉水", "verb:跳起 / 彈起"]
);
assert.deepStrictEqual(
  senseBank.lookup("lie").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:說謊", "noun:謊言", "verb:躺 / 平放"]
);
assert.deepStrictEqual(
  senseBank.lookup("pass").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:通行證", "verb:通過", "verb:及格", "verb:經過", "verb:傳遞"]
);
assert.deepStrictEqual(
  senseBank.lookup("note").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:筆記", "noun:便條", "noun:音符", "verb:注意 / 記下"]
);
assert.deepStrictEqual(
  senseBank.lookup("return").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:返回", "verb:歸還", "noun:返回", "noun:歸還"]
);
assert.deepStrictEqual(
  senseBank.lookup("show").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:展示", "verb:顯示", "verb:給...看", "noun:表演", "noun:節目"]
);
assert.deepStrictEqual(
  senseBank.lookup("force").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:力量", "noun:武力", "verb:強迫"]
);
assert.deepStrictEqual(
  senseBank.lookup("end").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:結束", "noun:末端", "verb:結束"]
);
assert.deepStrictEqual(
  senseBank.lookup("section").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:部分", "noun:區段"]
);
assert.deepStrictEqual(
  senseBank.lookup("ticket").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:票", "noun:罰單"]
);
assert.deepStrictEqual(
  senseBank.lookup("permit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:允許", "noun:許可證"]
);
assert.deepStrictEqual(
  senseBank.lookup("charge").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:充電", "verb:收費", "verb:指控", "noun:費用", "noun:指控", "noun:控罪"]
);
assert.deepStrictEqual(
  senseBank.lookup("matter").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:事情", "noun:問題", "noun:物質", "verb:重要 / 有關係"]
);
assert.deepStrictEqual(
  senseBank.lookup("point").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:重點", "noun:分數", "noun:點 / 小點", "verb:指著 / 指向"]
);
assert.deepStrictEqual(
  senseBank.lookup("period").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:時期 / 期間", "noun:課節", "noun:句號"]
);
assert.deepStrictEqual(
  senseBank.lookup("run").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:跑", "verb:經營 / 營運", "verb:運行", "noun:跑步 / 一段路程"]
);
assert.deepStrictEqual(
  senseBank.lookup("case").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:情況", "noun:個案", "noun:案件", "noun:盒", "noun:箱"]
);
assert.deepStrictEqual(
  senseBank.lookup("based on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:根據 / 基於"]
);
assert.deepStrictEqual(
  senseBank.lookup("catch on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:流行起來 / 開始明白"]
);
assert.deepStrictEqual(
  senseBank.lookup("cater for").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:滿足...需要 / 提供餐飲"]
);
assert.deepStrictEqual(
  senseBank.lookup("capitalise on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:利用 / 善用"]
);
assert.deepStrictEqual(
  senseBank.lookup("capitalize on").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["capitalise on:phrase:verb:利用 / 善用"]
);
assert.deepStrictEqual(
  senseBank.lookup("be supposed to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:應該 / 本應"]
);
assert.deepStrictEqual(
  senseBank.lookup("break the bank").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:花很多錢 / 太昂貴"]
);
assert.deepStrictEqual(
  senseBank.lookup("conduct").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:行為", "verb:進行", "verb:指揮"]
);
assert.deepStrictEqual(
  senseBank.lookup("entrance exam").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:入學試"]
);
assert.deepStrictEqual(
  senseBank.lookup("object").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:物件", "verb:反對"]
);
assert.deepStrictEqual(
  senseBank.lookup("project").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:專題", "noun:項目", "verb:預計", "verb:投射"]
);
assert.deepStrictEqual(
  senseBank.lookup("refuse").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:拒絕", "noun:垃圾 / 廢物"]
);
assert.deepStrictEqual(
  senseBank.lookup("abrupt").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:突然的"]
);
assert.deepStrictEqual(
  senseBank.lookup("absolute").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:絕對的"]
);
assert.deepStrictEqual(
  senseBank.lookup("abundant").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:充足的 / 豐富的"]
);
assert.deepStrictEqual(
  senseBank.lookup("academy").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:學院"]
);
assert.deepStrictEqual(
  senseBank.lookup("accessible").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:容易到達的 / 容易使用的"]
);
assert.deepStrictEqual(
  senseBank.lookup("adjust").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:調整"]
);
assert.deepStrictEqual(
  senseBank.lookup("admire").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:欣賞 / 佩服"]
);
assert.deepStrictEqual(
  senseBank.lookup("advise").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:建議"]
);
assert.deepStrictEqual(
  senseBank.lookup("agenda").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:議程"]
);
assert.deepStrictEqual(
  senseBank.lookup("aftermath").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:後果 / 餘波"]
);
assert.deepStrictEqual(
  senseBank.lookup("alcohol").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:酒精 / 酒類飲品"]
);
assert.deepStrictEqual(
  senseBank.lookup("align").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:對齊 / 使一致"]
);
assert.deepStrictEqual(
  senseBank.lookup("allocate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:分配"]
);
assert.deepStrictEqual(
  senseBank.lookup("alter").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:改變 / 修改"]
);
assert.deepStrictEqual(
  senseBank.lookup("aluminium").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:鋁"]
);
assert.deepStrictEqual(
  senseBank.lookup("amend").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:修改 / 修訂"]
);
assert.deepStrictEqual(
  senseBank.lookup("analysis").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:分析"]
);
assert.deepStrictEqual(
  senseBank.lookup("anniversary").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:周年紀念"]
);
assert.deepStrictEqual(
  senseBank.lookup("announce").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:宣布"]
);
assert.deepStrictEqual(
  senseBank.lookup("anonymous").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:匿名的"]
);
assert.deepStrictEqual(
  senseBank.lookup("anxiety").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:焦慮 / 憂慮"]
);
assert.deepStrictEqual(
  senseBank.lookup("apparatus").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:儀器 / 裝置"]
);
assert.deepStrictEqual(
  senseBank.lookup("appear").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:出現", "verb:似乎"]
);
assert.deepStrictEqual(
  senseBank.lookup("appetite").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:胃口 / 食慾"]
);
assert.deepStrictEqual(
  senseBank.lookup("applaud").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:鼓掌 / 讚賞"]
);
assert.deepStrictEqual(
  senseBank.lookup("appreciate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:欣賞 / 感激"]
);
assert.deepStrictEqual(
  senseBank.lookup("approve").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:批准 / 贊成"]
);
assert.deepStrictEqual(
  senseBank.lookup("approximately").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:大約"]
);
assert.deepStrictEqual(
  senseBank.lookup("archive").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:檔案庫", "verb:存檔"]
);
assert.deepStrictEqual(
  senseBank.lookup("arguably").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:可以說 / 可能是"]
);
assert.deepStrictEqual(
  senseBank.lookup("arise").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:出現 / 產生"]
);
assert.deepStrictEqual(
  senseBank.lookup("arrange").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:安排"]
);
assert.deepStrictEqual(
  senseBank.lookup("assist").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:協助"]
);
assert.deepStrictEqual(
  senseBank.lookup("assistance").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:協助 / 援助"]
);
assert.deepStrictEqual(
  senseBank.lookup("assume").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:假設 / 以為"]
);
assert.deepStrictEqual(
  senseBank.lookup("assumption").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:假設"]
);
assert.deepStrictEqual(
  senseBank.lookup("athlete").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:運動員"]
);
assert.deepStrictEqual(
  senseBank.lookup("athleticism").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:運動能力"]
);
assert.deepStrictEqual(
  senseBank.lookup("atmosphere").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:氣氛", "noun:大氣層"]
);
assert.deepStrictEqual(
  senseBank.lookup("attach").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:附上 / 連接"]
);
assert.deepStrictEqual(
  senseBank.lookup("attain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:達到 / 達成"]
);
assert.deepStrictEqual(
  senseBank.lookup("attract").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:吸引"]
);
assert.deepStrictEqual(
  senseBank.lookup("available").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:可取得的 / 有空的"]
);
assert.deepStrictEqual(
  senseBank.lookup("average").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:平均數", "verb:平均為", "adjective:一般的 / 平均的"]
);
assert.deepStrictEqual(
  senseBank.lookup("awkward").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:尷尬的 / 笨拙的"]
);
assert.deepStrictEqual(
  senseBank.lookup("bacteria").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:細菌"]
);
assert.deepStrictEqual(
  senseBank.lookup("band").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:樂隊", "noun:帶子 / 橡筋圈"]
);
assert.deepStrictEqual(
  senseBank.lookup("base").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:基地", "noun:基礎", "verb:以...為基礎"]
);
assert.deepStrictEqual(
  senseBank.lookup("beam").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:樑 / 光束", "verb:微笑 / 發光"]
);
assert.deepStrictEqual(
  senseBank.lookup("benefit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:好處", "verb:有益於", "verb:受益"]
);
assert.deepStrictEqual(
  senseBank.lookup("beat").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:打敗", "verb:打", "noun:節拍", "noun:心跳"]
);
assert.deepStrictEqual(
  senseBank.lookup("belief").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:信念 / 信仰"]
);
assert.deepStrictEqual(
  senseBank.lookup("belongings").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:個人物品 / 財物"]
);
assert.deepStrictEqual(
  senseBank.lookup("beneath").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["preposition:在...下方"]
);
assert.deepStrictEqual(
  senseBank.lookup("bias").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:偏見"]
);
assert.deepStrictEqual(
  senseBank.lookup("bold").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:大膽的", "adjective:粗體的"]
);
assert.deepStrictEqual(
  senseBank.lookup("block").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:大廈", "noun:街區", "noun:一塊", "noun:一段", "verb:阻擋", "verb:堵塞"]
);
assert.deepStrictEqual(
  senseBank.lookup("board").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:板", "noun:委員會 / 董事會", "verb:登上 / 上車"]
);
assert.deepStrictEqual(
  senseBank.lookup("border").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:邊界", "noun:國界", "verb:與...接壤"]
);
assert.deepStrictEqual(
  senseBank.lookup("budget").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:預算", "verb:制定預算", "verb:節省開支"]
);
assert.deepStrictEqual(
  senseBank.lookup("boom").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:快速增長", "noun:繁榮", "verb:快速發展"]
);
assert.deepStrictEqual(
  senseBank.lookup("bother").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:打擾", "verb:煩擾"]
);
assert.deepStrictEqual(
  senseBank.lookup("boundary").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:邊界", "noun:界線"]
);
assert.deepStrictEqual(
  senseBank.lookup("boutique").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:時裝店", "noun:精品店"]
);
assert.deepStrictEqual(
  senseBank.lookup("breath").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:呼吸", "noun:氣息"]
);
assert.deepStrictEqual(
  senseBank.lookup("bubble").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:氣泡", "noun:泡泡"]
);
assert.deepStrictEqual(
  senseBank.lookup("calm").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:冷靜的", "adjective:平靜的", "verb:使平靜", "noun:平靜"]
);
assert.deepStrictEqual(
  senseBank.lookup("candidate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:候選人", "noun:參加者"]
);
assert.deepStrictEqual(
  senseBank.lookup("captain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:隊長", "noun:船長", "noun:機長"]
);
assert.deepStrictEqual(
  senseBank.lookup("central").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["central:adjective:中央的", "central:adjective:主要的", "Central:noun:中環"]
);
assert.deepStrictEqual(
  senseBank.lookup("channel").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:頻道", "noun:渠道", "noun:途徑"]
);
assert.deepStrictEqual(
  senseBank.lookup("cheat").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:作弊", "verb:欺騙", "noun:騙子", "noun:作弊者"]
);
assert.deepStrictEqual(
  senseBank.lookup("clause").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:子句", "noun:條款"]
);
assert.deepStrictEqual(
  senseBank.lookup("combination").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:組合", "noun:結合"]
);
assert.deepStrictEqual(
  senseBank.lookup("comic").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:滑稽的", "adjective:喜劇的", "noun:漫畫書"]
);
assert.deepStrictEqual(
  senseBank.lookup("command").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:命令", "verb:命令", "verb:指揮", "noun:掌握", "noun:控制能力"]
);
assert.deepStrictEqual(
  senseBank.lookup("comparative").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:比較的", "adjective:相對的"]
);
assert.deepStrictEqual(
  senseBank.lookup("concerned").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:擔心的", "adjective:有關的", "adjective:相關的"]
);
assert.deepStrictEqual(
  senseBank.lookup("brief").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:短暫的", "adjective:簡短的", "noun:摘要", "noun:指示", "verb:向...簡介"]
);
assert.deepStrictEqual(
  senseBank.lookup("broad").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:寬闊的", "adjective:廣泛的", "adjective:概括的"]
);
assert.deepStrictEqual(
  senseBank.lookup("broadcaster").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:廣播員", "noun:播音員", "noun:廣播機構"]
);
assert.deepStrictEqual(
  senseBank.lookup("broadly").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:大體上", "adverb:廣泛地"]
);
assert.deepStrictEqual(
  senseBank.lookup("cable").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:電纜", "noun:纜線", "noun:有線電視"]
);
assert.deepStrictEqual(
  senseBank.lookup("calculate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:計算", "verb:估計", "verb:推算"]
);
assert.deepStrictEqual(
  senseBank.lookup("burn").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:燃燒", "verb:燒傷", "noun:燒傷"]
);
assert.deepStrictEqual(
  senseBank.lookup("bury").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:埋葬", "verb:埋藏"]
);
assert.deepStrictEqual(
  senseBank.lookup("campaign").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:活動", "noun:運動", "verb:發起運動", "verb:參與運動"]
);
assert.deepStrictEqual(
  senseBank.lookup("cabinet").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:櫥櫃", "noun:內閣"]
);
assert.deepStrictEqual(
  senseBank.lookup("calendar").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:日曆 / 月曆"]
);
assert.deepStrictEqual(
  senseBank.lookup("canvas").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:畫布", "noun:帆布"]
);
assert.deepStrictEqual(
  senseBank.lookup("capital").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:首都", "noun:資本", "noun:資金", "adjective:大寫的"]
);
assert.deepStrictEqual(
  senseBank.lookup("capability").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:能力"]
);
assert.deepStrictEqual(
  senseBank.lookup("capacity").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:容量", "noun:能力"]
);
assert.deepStrictEqual(
  senseBank.lookup("career").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:職業", "noun:事業"]
);
assert.deepStrictEqual(
  senseBank.lookup("carve").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:雕刻"]
);
assert.deepStrictEqual(
  senseBank.lookup("cease").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:停止", "verb:終止"]
);
assert.deepStrictEqual(
  senseBank.lookup("century").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:世紀"]
);
assert.deepStrictEqual(
  senseBank.lookup("charm").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:魅力"]
);
assert.deepStrictEqual(
  senseBank.lookup("charming").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:迷人的", "adjective:有魅力的"]
);
assert.deepStrictEqual(
  senseBank.lookup("challenge").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:挑戰", "verb:挑戰", "verb:質疑"]
);
assert.deepStrictEqual(
  senseBank.lookup("capture").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:捕捉", "verb:俘虜", "verb:拍攝", "verb:記錄", "noun:捕獲", "noun:佔領"]
);
assert.deepStrictEqual(
  senseBank.lookup("casual").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:隨便的", "adjective:非正式的", "adjective:偶然的"]
);
assert.deepStrictEqual(
  senseBank.lookup("chest").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:胸部", "noun:胸腔"]
);
assert.deepStrictEqual(
  senseBank.lookup("classify").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:分類"]
);
assert.deepStrictEqual(
  senseBank.lookup("client").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:客戶"]
);
assert.deepStrictEqual(
  senseBank.lookup("clean").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:乾淨的", "verb:清潔"]
);
assert.deepStrictEqual(
  senseBank.lookup("cloth").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:布 / 布料"]
);
assert.deepStrictEqual(
  senseBank.lookup("coast").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:海岸"]
);
assert.deepStrictEqual(
  senseBank.lookup("collaboration").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:合作 / 協作"]
);
assert.deepStrictEqual(
  senseBank.lookup("combine").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:結合 / 組合"]
);
assert.deepStrictEqual(
  senseBank.lookup("commercial").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:商業的", "noun:廣告"]
);
assert.deepStrictEqual(
  senseBank.lookup("commit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:犯 / 承諾"]
);
assert.deepStrictEqual(
  senseBank.lookup("commence").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:開始"]
);
assert.deepStrictEqual(
  senseBank.lookup("company").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:公司", "noun:陪伴"]
);
assert.deepStrictEqual(
  senseBank.lookup("compassion").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:同情心 / 憐憫"]
);
assert.deepStrictEqual(
  senseBank.lookup("compete").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:競爭 / 比賽"]
);
assert.deepStrictEqual(
  senseBank.lookup("complaint").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:投訴 / 抱怨"]
);
assert.deepStrictEqual(
  senseBank.lookup("comprise").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:包含 / 由...組成"]
);
assert.deepStrictEqual(
  senseBank.lookup("concept").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:概念"]
);
assert.deepStrictEqual(
  senseBank.lookup("confirm").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:確認"]
);
assert.deepStrictEqual(
  senseBank.lookup("conservation").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:保育 / 保護"]
);
assert.deepStrictEqual(
  senseBank.lookup("consistently").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:持續地 / 一貫地"]
);
assert.deepStrictEqual(
  senseBank.lookup("constantly").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:不斷地"]
);
assert.deepStrictEqual(
  senseBank.lookup("constraint").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:限制 / 約束"]
);
assert.deepStrictEqual(
  senseBank.lookup("consult").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:諮詢 / 請教"]
);
assert.deepStrictEqual(
  senseBank.lookup("contain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:包含 / 含有"]
);
assert.deepStrictEqual(
  senseBank.lookup("controversy").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:爭議 / 爭論"]
);
assert.deepStrictEqual(
  senseBank.lookup("convert").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:轉換 / 改變"]
);
assert.deepStrictEqual(
  senseBank.lookup("convey").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:傳達 / 傳遞"]
);
assert.deepStrictEqual(
  senseBank.lookup("convince").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:說服"]
);
assert.deepStrictEqual(
  senseBank.lookup("corporation").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:公司 / 企業"]
);
assert.deepStrictEqual(
  senseBank.lookup("council").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:議會 / 委員會"]
);
assert.deepStrictEqual(
  senseBank.lookup("counterpart").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:對應的人 / 對應物"]
);
assert.deepStrictEqual(
  senseBank.lookup("crash").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:撞擊 / 崩潰", "noun:撞車 / 崩潰"]
);
assert.deepStrictEqual(
  senseBank.lookup("creature").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:生物"]
);
assert.deepStrictEqual(
  senseBank.lookup("credit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:信用 / 學分 / 讚揚", "verb:歸功於"]
);
assert.deepStrictEqual(
  senseBank.lookup("criteria").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:標準 / 準則"]
);
assert.deepStrictEqual(
  senseBank.lookup("critic").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:批評者 / 評論家"]
);
assert.deepStrictEqual(
  senseBank.lookup("criticism").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:批評"]
);
assert.deepStrictEqual(
  senseBank.lookup("crucial").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:至關重要的"]
);
assert.deepStrictEqual(
  senseBank.lookup("cruel").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:殘忍的"]
);
assert.deepStrictEqual(
  senseBank.lookup("cultural").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:文化的"]
);
assert.deepStrictEqual(
  senseBank.lookup("curiosity").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:好奇心"]
);
assert.deepStrictEqual(
  senseBank.lookup("currency").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:貨幣"]
);
assert.deepStrictEqual(
  senseBank.lookup("current").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:目前的 / 現時的", "noun:水流 / 氣流 / 電流"]
);
assert.deepStrictEqual(
  senseBank.lookup("currently").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:目前 / 現時"]
);
assert.deepStrictEqual(
  senseBank.lookup("cure").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:治療 / 治癒", "noun:療法"]
);
assert.deepStrictEqual(
  senseBank.lookup("deny").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:否認", "verb:拒絕給予"]
);
assert.deepStrictEqual(
  senseBank.lookup("determine").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:決定 / 確定", "verb:影響 / 支配"]
);
assert.deepStrictEqual(
  senseBank.lookup("disappear").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:消失"]
);
assert.deepStrictEqual(
  senseBank.lookup("disaster").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:災難"]
);
assert.deepStrictEqual(
  senseBank.lookup("discover").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:發現"]
);
assert.deepStrictEqual(
  senseBank.lookup("display").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:展示", "verb:顯示", "noun:展示 / 陳列", "noun:顯示器 / 顯示畫面"]
);
assert.deepStrictEqual(
  senseBank.lookup("effective").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:有效的"]
);
assert.deepStrictEqual(
  senseBank.lookup("efficient").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:有效率的"]
);
assert.deepStrictEqual(
  senseBank.lookup("employ").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:僱用", "verb:使用 / 採用"]
);
assert.deepStrictEqual(
  senseBank.lookup("employee").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:僱員 / 員工"]
);
assert.deepStrictEqual(
  senseBank.lookup("employer").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:僱主"]
);
assert.deepStrictEqual(
  senseBank.lookup("encourage").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:鼓勵"]
);
assert.deepStrictEqual(
  senseBank.lookup("enhance").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:提升 / 增強"]
);
assert.deepStrictEqual(
  senseBank.lookup("ensure").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:確保"]
);
assert.deepStrictEqual(
  senseBank.lookup("entire").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:整個的 / 全部的"]
);
assert.deepStrictEqual(
  senseBank.lookup("establish").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:建立 / 成立"]
);
assert.deepStrictEqual(
  senseBank.lookup("examine").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:檢查 / 審查"]
);
assert.deepStrictEqual(
  senseBank.lookup("exist").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:存在"]
);
assert.deepStrictEqual(
  senseBank.lookup("expect").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:預期 / 期待"]
);
assert.deepStrictEqual(
  senseBank.lookup("explore").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:探索 / 探究"]
);
assert.deepStrictEqual(
  senseBank.lookup("express").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:表達", "adjective:特快的 / 明確的"]
);
assert.deepStrictEqual(
  senseBank.lookup("fasten").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:扣緊 / 繫牢"]
);
assert.deepStrictEqual(
  senseBank.lookup("fault").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:錯誤 / 過失", "noun:缺點 / 故障"]
);
assert.deepStrictEqual(
  senseBank.lookup("faith").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:信任", "noun:信心", "noun:信仰"]
);
assert.deepStrictEqual(
  senseBank.lookup("finance").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:財務", "noun:資金", "verb:資助", "verb:提供資金"]
);
assert.deepStrictEqual(
  senseBank.lookup("financial").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:財務的 / 金融的"]
);
assert.deepStrictEqual(
  senseBank.lookup("finding").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:發現", "noun:研究結果"]
);
assert.deepStrictEqual(
  senseBank.lookup("forecast").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:預測 / 預報", "verb:預測 / 預報"]
);
assert.deepStrictEqual(
  senseBank.lookup("foundation").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:基礎", "noun:基金會"]
);
assert.deepStrictEqual(
  senseBank.lookup("frighten").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:使害怕 / 嚇怕"]
);
assert.deepStrictEqual(
  senseBank.lookup("gain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:獲得 / 取得", "noun:增加", "noun:收穫", "verb:增加"]
);
assert.deepStrictEqual(
  senseBank.lookup("gear").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:裝備 / 用具"]
);
assert.deepStrictEqual(
  senseBank.lookup("gender").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:性別"]
);
assert.deepStrictEqual(
  senseBank.lookup("generate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:產生 / 生成"]
);
assert.deepStrictEqual(
  senseBank.lookup("gradual").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:逐漸的"]
);
assert.deepStrictEqual(
  senseBank.lookup("grant").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:準許", "verb:授予", "noun:補助金", "noun:撥款"]
);
assert.deepStrictEqual(
  senseBank.lookup("handle").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:處理 / 應付", "noun:把手 / 手柄", "verb:觸摸 / 操作"]
);
assert.deepStrictEqual(
  senseBank.lookup("happen").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:發生"]
);
assert.deepStrictEqual(
  senseBank.lookup("harbour").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:海港 / 港口"]
);
assert.deepStrictEqual(
  senseBank.lookup("harm").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:傷害", "noun:損害", "verb:傷害", "verb:損害"]
);
assert.deepStrictEqual(
  senseBank.lookup("heal").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:痊癒 / 治癒"]
);
assert.deepStrictEqual(
  senseBank.lookup("hire").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:聘請 / 僱用", "noun:租用"]
);
assert.deepStrictEqual(
  senseBank.lookup("highlight").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:用螢光筆標示", "verb:突顯", "noun:重點", "noun:亮點"]
);
assert.deepStrictEqual(
  senseBank.lookup("honour").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:榮譽", "verb:尊重 / 表揚", "verb:履行承諾"]
);
assert.deepStrictEqual(
  senseBank.lookup("host").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:主持人", "noun:主人", "verb:主持", "verb:舉辦"]
);
assert.deepStrictEqual(
  senseBank.lookup("leave").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:離開", "verb:留下", "verb:留給", "noun:假期 / 休假"]
);
assert.deepStrictEqual(
  senseBank.lookup("line").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:線", "noun:行", "noun:隊伍", "noun:台詞", "verb:沿...排列"]
);
assert.deepStrictEqual(
  senseBank.lookup("household").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:家庭 / 住戶", "adjective:家庭的 / 家用的"]
);
assert.deepStrictEqual(
  senseBank.lookup("huge").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:巨大的"]
);
assert.deepStrictEqual(
  senseBank.lookup("ignore").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:忽視 / 不理會"]
);
assert.deepStrictEqual(
  senseBank.lookup("income").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:收入"]
);
assert.deepStrictEqual(
  senseBank.lookup("indicate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:顯示 / 表明"]
);
assert.deepStrictEqual(
  senseBank.lookup("inform").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:通知 / 告知"]
);
assert.deepStrictEqual(
  senseBank.lookup("inquiry").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:查詢 / 詢問"]
);
assert.deepStrictEqual(
  senseBank.lookup("inspect").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:檢查 / 視察"]
);
assert.deepStrictEqual(
  senseBank.lookup("install").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:安裝"]
);
assert.deepStrictEqual(
  senseBank.lookup("institute").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:學院 / 機構", "verb:制定 / 建立"]
);
assert.deepStrictEqual(
  senseBank.lookup("interact").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:互動 / 交流"]
);
assert.deepStrictEqual(
  senseBank.lookup("interpret").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:解釋 / 理解"]
);
assert.deepStrictEqual(
  senseBank.lookup("interrupt").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:打斷 / 中斷"]
);
assert.deepStrictEqual(
  senseBank.lookup("investigate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:調查"]
);
assert.deepStrictEqual(
  senseBank.lookup("implement").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:實施 / 執行"]
);
assert.deepStrictEqual(
  senseBank.lookup("increase").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:增加", "verb:增加"]
);
assert.deepStrictEqual(
  senseBank.lookup("influence").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:影響", "verb:影響"]
);
assert.deepStrictEqual(
  senseBank.lookup("instrument").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:儀器", "noun:樂器"]
);
assert.deepStrictEqual(
  senseBank.lookup("intense").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:強烈的"]
);
assert.deepStrictEqual(
  senseBank.lookup("jealous").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:妒忌的 / 嫉妒的"]
);
assert.deepStrictEqual(
  senseBank.lookup("journal").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:日記 / 期刊"]
);
assert.deepStrictEqual(
  senseBank.lookup("journalist").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:記者"]
);
assert.deepStrictEqual(
  senseBank.lookup("judge").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:判斷", "noun:法官 / 評判"]
);
assert.deepStrictEqual(
  senseBank.lookup("justice").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:公義 / 司法"]
);
assert.deepStrictEqual(
  senseBank.lookup("justify").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:證明...有道理 / 為...辯護"]
);
assert.deepStrictEqual(
  senseBank.lookup("key").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:鑰匙", "noun:關鍵", "adjective:重要的 / 關鍵的", "verb:輸入"]
);
assert.deepStrictEqual(
  senseBank.lookup("kit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:套裝 / 工具包"]
);
assert.deepStrictEqual(
  senseBank.lookup("label").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:標籤", "verb:貼標籤 / 稱為"]
);
assert.deepStrictEqual(
  senseBank.lookup("lack").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:缺乏", "verb:缺乏"]
);
assert.deepStrictEqual(
  senseBank.lookup("legal").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:合法的 / 法律的"]
);
assert.deepStrictEqual(
  senseBank.lookup("legend").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:傳說 / 傳奇人物"]
);
assert.deepStrictEqual(
  senseBank.lookup("leisure").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:休閒 / 空閒時間"]
);
assert.deepStrictEqual(
  senseBank.lookup("liberty").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:自由"]
);
assert.deepStrictEqual(
  senseBank.lookup("likely").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:可能的", "adverb:可能地"]
);
assert.deepStrictEqual(
  senseBank.lookup("literature").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:文學"]
);
assert.deepStrictEqual(
  senseBank.lookup("local").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:本地的", "noun:本地人"]
);
assert.deepStrictEqual(
  senseBank.lookup("loss").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:損失 / 失去"]
);
assert.deepStrictEqual(
  senseBank.lookup("lower").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:較低的", "verb:降低"]
);
assert.deepStrictEqual(
  senseBank.lookup("maintain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:維持 / 保持", "verb:保養 / 維護"]
);
assert.deepStrictEqual(
  senseBank.lookup("manage").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:管理", "verb:設法做到"]
);
assert.deepStrictEqual(
  senseBank.lookup("manufacture").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:製造", "noun:製造"]
);
assert.deepStrictEqual(
  senseBank.lookup("material").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:材料 / 原料", "adjective:重要的 / 物質的"]
);
assert.deepStrictEqual(
  senseBank.lookup("measure").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:測量", "noun:措施"]
);
assert.deepStrictEqual(
  senseBank.lookup("mention").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:提及", "noun:提及"]
);
assert.deepStrictEqual(
  senseBank.lookup("method").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:方法"]
);
assert.deepStrictEqual(
  senseBank.lookup("minor").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:次要的 / 輕微的"]
);
assert.deepStrictEqual(
  senseBank.lookup("motive").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:動機"]
);
assert.deepStrictEqual(
  senseBank.lookup("multiple").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:多個的 / 多重的", "noun:倍數"]
);
assert.deepStrictEqual(
  senseBank.lookup("needle").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:針"]
);
assert.deepStrictEqual(
  senseBank.lookup("negotiate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:談判 / 協商"]
);
assert.deepStrictEqual(
  senseBank.lookup("nightmare").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:惡夢 / 可怕的經歷"]
);
assert.deepStrictEqual(
  senseBank.lookup("noble").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:高尚的 / 崇高的"]
);
assert.deepStrictEqual(
  senseBank.lookup("nominate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:提名"]
);
assert.deepStrictEqual(
  senseBank.lookup("notion").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:概念 / 想法"]
);
assert.deepStrictEqual(
  senseBank.lookup("novel").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:小說", "adjective:新穎的"]
);
assert.deepStrictEqual(
  senseBank.lookup("numerous").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:許多的 / 大量的"]
);
assert.deepStrictEqual(
  senseBank.lookup("nutrient").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:營養素"]
);
assert.deepStrictEqual(
  senseBank.lookup("objective").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:目標", "adjective:客觀的"]
);
assert.deepStrictEqual(
  senseBank.lookup("observe").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:觀察", "verb:遵守"]
);
assert.deepStrictEqual(
  senseBank.lookup("obtain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:取得 / 獲得"]
);
assert.deepStrictEqual(
  senseBank.lookup("occasion").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:場合 / 時刻"]
);
assert.deepStrictEqual(
  senseBank.lookup("occur").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:發生"]
);
assert.deepStrictEqual(
  senseBank.lookup("odd").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:奇怪的", "adjective:單數的 / 奇數的"]
);
assert.deepStrictEqual(
  senseBank.lookup("operate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:操作 / 運作", "verb:做手術"]
);
assert.deepStrictEqual(
  senseBank.lookup("origin").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:起源 / 來源"]
);
assert.deepStrictEqual(
  senseBank.lookup("original").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:原本的 / 原創的", "noun:原件 / 原作"]
);
assert.deepStrictEqual(
  senseBank.lookup("overcome").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:克服"]
);
assert.deepStrictEqual(
  senseBank.lookup("own").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:自己的", "pronoun:自己的東西", "verb:擁有"]
);
assert.deepStrictEqual(
  senseBank.lookup("pace").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:步伐 / 速度", "verb:踱步 / 來回踱步"]
);
assert.deepStrictEqual(
  senseBank.lookup("passion").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:熱情 / 熱愛"]
);
assert.deepStrictEqual(
  senseBank.lookup("perceive").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:認為 / 看待", "verb:察覺 / 感知"]
);
assert.deepStrictEqual(
  senseBank.lookup("permanent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:永久的"]
);
assert.deepStrictEqual(
  senseBank.lookup("perspective").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:觀點 / 角度"]
);
assert.deepStrictEqual(
  senseBank.lookup("phase").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:階段"]
);
assert.deepStrictEqual(
  senseBank.lookup("possess").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:擁有 / 具備"]
);
assert.deepStrictEqual(
  senseBank.lookup("poverty").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:貧窮"]
);
assert.deepStrictEqual(
  senseBank.lookup("predict").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:預測 / 預計"]
);
assert.deepStrictEqual(
  senseBank.lookup("primary").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:主要的", "adjective:小學的 / 初級的"]
);
assert.deepStrictEqual(
  senseBank.lookup("promote").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:推廣 / 促進", "verb:晉升 / 使升職"]
);
assert.deepStrictEqual(
  senseBank.lookup("prospect").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:前景 / 前途"]
);
assert.deepStrictEqual(
  senseBank.lookup("protect").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:保護"]
);
assert.deepStrictEqual(
  senseBank.lookup("purchase").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:購買", "noun:購買 / 購買物"]
);
assert.deepStrictEqual(
  senseBank.lookup("pursue").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:追求", "verb:追趕 / 追捕"]
);
assert.deepStrictEqual(
  senseBank.lookup("content").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:內容", "noun:含量", "adjective:滿意的"]
);
assert.deepStrictEqual(
  senseBank.lookup("Polish").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.matchCase ? "case" : ""}`),
  ["polish:verb:擦亮 / 潤飾:", "Polish:adjective:波蘭的:case", "Polish:noun:波蘭語 / 波蘭人:case"]
);
assert.deepStrictEqual(
  senseBank.lookup("polish").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["polish:verb:擦亮 / 潤飾", "Polish:adjective:波蘭的", "Polish:noun:波蘭語 / 波蘭人"]
);
assert.deepStrictEqual(
  senseBank.lookup("quarter").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:四分之一", "noun:季度 / 一季"]
);
assert.deepStrictEqual(
  senseBank.lookup("quote").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:引用 / 引述", "noun:引文 / 引述", "noun:報價"]
);
assert.deepStrictEqual(
  senseBank.lookup("recall").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:回憶 / 記起", "noun:回憶 / 記憶"]
);
assert.deepStrictEqual(
  senseBank.lookup("reflect").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:反映", "verb:反射", "verb:反思 / 深思"]
);
assert.deepStrictEqual(
  senseBank.lookup("regulate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:規管 / 管制"]
);
assert.deepStrictEqual(
  senseBank.lookup("reinforce").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:加強 / 鞏固"]
);
assert.deepStrictEqual(
  senseBank.lookup("release").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:釋放", "verb:發佈 / 推出", "noun:釋放 / 發佈"]
);
assert.deepStrictEqual(
  senseBank.lookup("reliable").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:可靠的 / 可信賴的"]
);
assert.deepStrictEqual(
  senseBank.lookup("relief").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:舒緩 / 減輕", "noun:鬆一口氣 / 寬慰"]
);
assert.deepStrictEqual(
  senseBank.lookup("remark").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:評論 / 說話", "verb:評論 / 說"]
);
assert.deepStrictEqual(
  senseBank.lookup("represent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:代表", "verb:象徵 / 表示"]
);
assert.deepStrictEqual(
  senseBank.lookup("reputation").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:聲譽 / 名聲"]
);
assert.deepStrictEqual(
  senseBank.lookup("rescue").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:拯救 / 救援", "noun:拯救 / 救援"]
);
assert.deepStrictEqual(
  senseBank.lookup("reserve").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:預留 / 預約 / 保留", "noun:儲備", "noun:保護區"]
);
assert.deepStrictEqual(
  senseBank.lookup("restrict").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:限制 / 規限"]
);
assert.deepStrictEqual(
  senseBank.lookup("retain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:保留 / 保持"]
);
assert.deepStrictEqual(
  senseBank.lookup("reveal").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:揭示 / 透露", "verb:顯示"]
);
assert.deepStrictEqual(
  senseBank.lookup("secure").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:安全的 / 穩固的", "verb:取得 / 獲得 / 確保", "verb:保護 / 固定"]
);
assert.deepStrictEqual(
  senseBank.lookup("select").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:選擇 / 挑選"]
);
assert.deepStrictEqual(
  senseBank.lookup("series").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:系列 / 一連串"]
);
assert.deepStrictEqual(
  senseBank.lookup("settle").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:定居", "verb:解決"]
);
assert.deepStrictEqual(
  senseBank.lookup("severe").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:嚴重的"]
);
assert.deepStrictEqual(
  senseBank.lookup("shade").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:陰影 / 陰涼處", "verb:遮陰"]
);
assert.deepStrictEqual(
  senseBank.lookup("shelter").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:庇護所 / 避難所", "noun:遮蔽 / 保護", "verb:庇護 / 保護"]
);
assert.deepStrictEqual(
  senseBank.lookup("significance").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:重要性 / 意義"]
);
assert.deepStrictEqual(
  senseBank.lookup("speech").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:演講", "noun:說話 / 言語"]
);
assert.deepStrictEqual(
  senseBank.lookup("spirit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:精神 / 心靈"]
);
assert.deepStrictEqual(
  senseBank.lookup("stable").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:穩定的"]
);
assert.deepStrictEqual(
  senseBank.lookup("status").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:狀況 / 狀態"]
);
assert.deepStrictEqual(
  senseBank.lookup("steady").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:穩定的 / 平穩的"]
);
assert.deepStrictEqual(
  senseBank.lookup("stimulate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:刺激 / 促進"]
);
assert.deepStrictEqual(
  senseBank.lookup("straightforward").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:簡單直接的 / 易明的"]
);
assert.deepStrictEqual(
  senseBank.lookup("suffer").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:遭受 / 受苦"]
);
assert.deepStrictEqual(
  senseBank.lookup("supply").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:供應 / 供應量", "noun:物資 / 供應品", "verb:供應 / 提供"]
);
assert.deepStrictEqual(
  senseBank.lookup("surround").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:圍繞 / 包圍"]
);
assert.deepStrictEqual(
  senseBank.lookup("survive").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:生存 / 生還"]
);
assert.deepStrictEqual(
  senseBank.lookup("sustain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:維持 / 持續"]
);
assert.deepStrictEqual(
  senseBank.lookup("tackle").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:處理 / 應付", "verb:攔截 / 擒抱", "noun:攔截 / 擒抱"]
);
assert.deepStrictEqual(
  senseBank.lookup("talent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:天賦 / 才能", "noun:人才"]
);
assert.deepStrictEqual(
  senseBank.lookup("tend").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:傾向 / 往往會", "verb:照料 / 照顧"]
);
assert.deepStrictEqual(
  senseBank.lookup("theory").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:理論"]
);
assert.deepStrictEqual(
  senseBank.lookup("throughout").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["preposition:在整個...期間 / 遍及", "adverb:由頭到尾 / 全程"]
);
assert.deepStrictEqual(
  senseBank.lookup("tough").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:艱難的 / 困難的", "adjective:堅強的 / 強硬的"]
);
assert.deepStrictEqual(
  senseBank.lookup("trace").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:追蹤 / 追溯 / 查出", "noun:痕跡", "verb:描摹"]
);
assert.deepStrictEqual(
  senseBank.lookup("trade").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:貿易 / 交易", "verb:交易 / 買賣"]
);
assert.deepStrictEqual(
  senseBank.lookup("transform").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:徹底改變 / 轉變"]
);
assert.deepStrictEqual(
  senseBank.lookup("trial").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:審判 / 審訊", "noun:試驗 / 試用"]
);
assert.deepStrictEqual(
  senseBank.lookup("trigger").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:引發 / 觸發", "noun:扳機", "noun:誘因 / 觸發因素"]
);
assert.deepStrictEqual(
  senseBank.lookup("undergo").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:經歷 / 接受"]
);
assert.deepStrictEqual(
  senseBank.lookup("underlie").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:構成...的基礎 / 是...的根本原因"]
);
assert.deepStrictEqual(
  senseBank.lookup("undertake").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:承擔 / 從事", "verb:承諾 / 保證"]
);
assert.deepStrictEqual(
  senseBank.lookup("universe").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:宇宙"]
);
assert.deepStrictEqual(
  senseBank.lookup("urge").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:催促 / 力勸", "noun:衝動 / 強烈慾望"]
);
assert.deepStrictEqual(
  senseBank.lookup("utilize").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:利用 / 善用"]
);
assert.deepStrictEqual(
  senseBank.lookup("valid").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:有效的 / 合理的"]
);
assert.deepStrictEqual(
  senseBank.lookup("various").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:各種各樣的 / 不同的"]
);
assert.deepStrictEqual(
  senseBank.lookup("violent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:暴力的 / 猛烈的"]
);
assert.deepStrictEqual(
  senseBank.lookup("virtual").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:虛擬的 / 網上的"]
);
assert.deepStrictEqual(
  senseBank.lookup("vision").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:視力", "noun:願景 / 視野"]
);
assert.deepStrictEqual(
  senseBank.lookup("wander").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:漫步 / 閒逛", "verb:走神 / 離題"]
);
assert.deepStrictEqual(
  senseBank.lookup("wealth").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:財富 / 富裕"]
);
assert.deepStrictEqual(
  senseBank.lookup("welfare").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:福利 / 福祉"]
);
assert.deepStrictEqual(
  senseBank.lookup("well-being").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:身心健康 / 福祉"]
);
assert.deepStrictEqual(
  senseBank.lookup("willing").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:願意的 / 樂意的"]
);
assert.deepStrictEqual(
  senseBank.lookup("witness").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:目擊者 / 證人", "verb:目擊 / 見證"]
);
assert.deepStrictEqual(
  senseBank.lookup("wrap").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:包 / 包裹", "noun:包裹物 / 披肩"]
);
assert.deepStrictEqual(
  senseBank.lookup("yield").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:產生 / 帶來", "verb:讓步 / 屈服", "noun:產量 / 收益"]
);
assert.deepStrictEqual(
  senseBank.lookup("create").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:創造", "verb:建立"]
);
assert.deepStrictEqual(
  senseBank.lookup("decide").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:決定"]
);
assert.deepStrictEqual(
  senseBank.lookup("each").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["determiner:每個 / 各自", "pronoun:每個人 / 每件事物", "adverb:每個 / 各自"]
);
assert.deepStrictEqual(
  senseBank.lookup("few").map((entry) => `${entry.pos}:${entry.meaning}`),
  [
    "determiner:少數",
    "determiner:幾個",
    "adjective:很少的",
    "adjective:幾個的",
    "pronoun:少數人",
    "pronoun:少數事物"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("film").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:拍攝", "noun:電影 / 膠卷"]
);
assert.deepStrictEqual(
  senseBank.lookup("follow").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:跟隨", "verb:遵從"]
);
assert.deepStrictEqual(
  senseBank.lookup("gallery").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:畫廊", "noun:展覽館"]
);
assert.deepStrictEqual(
  senseBank.lookup("grow").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:成長 / 種植"]
);
assert.deepStrictEqual(
  senseBank.lookup("into").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["preposition:進入 / 變成"]
);
assert.deepStrictEqual(
  senseBank.lookup("let").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:讓 / 允許"]
);
assert.ok(
  senseBank.lookup("let", { includeHidden: true }).some((entry) => (
    entry.hidden && entry.pos === "verb" && entry.meaning === "let 的過去式 / PP"
  )),
  "same-spelling verb table markers should be hidden from student lookup but kept for grammar coverage"
);
assert.deepStrictEqual(
  senseBank.lookup("magazine").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:雜誌"]
);
assert.deepStrictEqual(
  senseBank.lookup("second").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["number:第二", "noun:秒", "adverb:第二 / 其次", "determiner:第二個"]
);
assert.deepStrictEqual(
  senseBank.lookup("think").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:想 / 認為"]
);
assert.deepStrictEqual(
  senseBank.lookup("to").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["preposition:向 / 到", "preposition:用來接動詞原形"]
);
assert.deepStrictEqual(
  senseBank.lookup("data").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:數據 / 資料"]
);
assert.deepStrictEqual(
  senseBank.lookup("director").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:導演 / 主管"]
);
assert.deepStrictEqual(
  senseBank.lookup("independent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:獨立的"]
);
assert.deepStrictEqual(
  senseBank.lookup("publish").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:出版 / 發布"]
);
assert.deepStrictEqual(
  senseBank.lookup("virus").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:病毒"]
);
assert.deepStrictEqual(
  senseBank.lookup("costume").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:服裝 / 戲服"]
);
assert.deepStrictEqual(
  senseBank.lookup("documentary").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:紀錄片"]
);
assert.deepStrictEqual(
  senseBank.lookup("earthquake").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:地震"]
);
assert.deepStrictEqual(
  senseBank.lookup("marketing").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:市場推廣 / 營銷"]
);
assert.deepStrictEqual(
  senseBank.lookup("persuade").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:說服"]
);
assert.deepStrictEqual(
  senseBank.lookup("remind").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:提醒 / 使想起"]
);
assert.deepStrictEqual(
  senseBank.lookup("unlike").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["preposition:不像 / 與...不同"]
);
assert.deepStrictEqual(
  senseBank.lookup("committee").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:委員會"]
);
assert.deepStrictEqual(
  senseBank.lookup("declare").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:宣布 / 聲明"]
);
assert.deepStrictEqual(
  senseBank.lookup("dominant").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:佔主導地位的 / 主要的"]
);
assert.deepStrictEqual(
  senseBank.lookup("elsewhere").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:在別處 / 去別處"]
);
assert.deepStrictEqual(
  senseBank.lookup("emphasis").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:強調", "noun:重點"]
);
assert.deepStrictEqual(
  senseBank.lookup("extent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:程度", "noun:範圍"]
);
assert.deepStrictEqual(
  senseBank.lookup("forbid").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:禁止"]
);
assert.deepStrictEqual(
  senseBank.lookup("heaven").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:天堂"]
);
assert.deepStrictEqual(
  senseBank.lookup("hypothesis").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:假說 / 假設"]
);
assert.deepStrictEqual(
  senseBank.lookup("immune").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:免疫的 / 不受影響的"]
);
assert.deepStrictEqual(
  senseBank.lookup("inherit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:繼承"]
);
assert.deepStrictEqual(
  senseBank.lookup("metaphor").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:比喻 / 隱喻"]
);
assert.deepStrictEqual(
  senseBank.lookup("pose").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:造成 / 提出"]
);
assert.deepStrictEqual(
  senseBank.lookup("relevant").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:相關的"]
);
assert.deepStrictEqual(
  senseBank.lookup("retail").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:零售"]
);
assert.deepStrictEqual(
  senseBank.lookup("scenario").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:可能出現的情況 / 場景"]
);
assert.deepStrictEqual(
  senseBank.lookup("somehow").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:不知怎的 / 以某種方式"]
);
assert.deepStrictEqual(
  senseBank.lookup("species").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:物種"]
);
assert.deepStrictEqual(
  senseBank.lookup("speculate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:推測 / 猜測"]
);
assert.deepStrictEqual(
  senseBank.lookup("stall").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:攤位 / 檔口"]
);
assert.deepStrictEqual(
  senseBank.lookup("suspend").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:暫停 / 停職"]
);
assert.deepStrictEqual(
  senseBank.lookup("via").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["preposition:經由 / 透過"]
);
assert.deepStrictEqual(
  senseBank.lookup("conceive").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:構想 / 懷孕"]
);
assert.deepStrictEqual(
  senseBank.lookup("deem").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:認為 / 視為"]
);
assert.deepStrictEqual(
  senseBank.lookup("deteriorate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:惡化"]
);
assert.deepStrictEqual(
  senseBank.lookup("facilitate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:促進 / 使便利"]
);
assert.deepStrictEqual(
  senseBank.lookup("forge").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:建立 / 偽造"]
);
assert.deepStrictEqual(
  senseBank.lookup("funeral").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:葬禮"]
);
assert.deepStrictEqual(
  senseBank.lookup("glimpse").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:一瞥 / 短暫一看"]
);
assert.deepStrictEqual(
  senseBank.lookup("manifest").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:顯示 / 表明"]
);
assert.deepStrictEqual(
  senseBank.lookup("overlook").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:忽略 / 俯瞰"]
);
assert.deepStrictEqual(
  senseBank.lookup("privilege").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:特權 / 榮幸"]
);
assert.deepStrictEqual(
  senseBank.lookup("prosecute").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:起訴"]
);
assert.deepStrictEqual(
  senseBank.lookup("sceptical").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:懷疑的"]
);
assert.deepStrictEqual(
  senseBank.lookup("scope").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:範圍 / 空間"]
);
assert.deepStrictEqual(
  senseBank.lookup("spark").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:引發 / 激起"]
);
assert.deepStrictEqual(
  senseBank.lookup("subsidy").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:補貼 / 津貼"]
);
assert.deepStrictEqual(
  senseBank.lookup("transparent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:透明的 / 清晰公開的"]
);
assert.deepStrictEqual(
  senseBank.lookup("unveil").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:揭幕 / 公布"]
);
assert.deepStrictEqual(
  senseBank.lookup("depend on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:取決於 / 依賴"]
);
assert.deepStrictEqual(
  senseBank.lookup("derive from").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:源自 / 衍生自"]
);
assert.deepStrictEqual(
  senseBank.lookup("dispose of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:棄置 / 處理掉"]
);
assert.deepStrictEqual(
  senseBank.lookup("embark on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:開始 / 踏上"]
);
assert.deepStrictEqual(
  senseBank.lookup("even though").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:雖然 / 即使"]
);
assert.deepStrictEqual(
  senseBank.lookup("feel like").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:想要 / 感覺像"]
);
assert.deepStrictEqual(
  senseBank.lookup("get rid of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:擺脫 / 除去"]
);
assert.deepStrictEqual(
  senseBank.lookup("given that").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:鑑於 / 既然"]
);
assert.deepStrictEqual(
  senseBank.lookup("happen to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:碰巧 / 剛好"]
);
assert.deepStrictEqual(
  senseBank.lookup("have no choice but to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:別無選擇，只好"]
);
assert.deepStrictEqual(
  senseBank.lookup("have no alternative / choice but to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["have no choice but to:phrase:verb:別無選擇，只好"]
);
assert.deepStrictEqual(
  senseBank.lookup("in a nutshell").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:總括而言 / 簡而言之"]
);
assert.deepStrictEqual(
  senseBank.lookup("in terms of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:在...方面 / 就...而言"]
);
assert.deepStrictEqual(
  senseBank.lookup("keep an eye on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:留意 / 注意"]
);
assert.deepStrictEqual(
  senseBank.lookup("let alone").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:更不用說 / 更何況"]
);
assert.deepStrictEqual(
  senseBank.lookup("make use of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:使用 / 利用"]
);
assert.deepStrictEqual(
  senseBank.lookup("lift x2").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  [
    "lift:noun:升降機",
    "lift:verb:舉起 / 抬起",
    "lift:verb:解除 / 撤銷限制"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("make a living").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:謀生 / 維持生計"]
);
assert.deepStrictEqual(
  senseBank.lookup("mindset").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["word:noun:思維 / 想法"]
);
assert.deepStrictEqual(
  senseBank.lookup("more often than not").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:很多時 / 通常"]
);
assert.deepStrictEqual(
  senseBank.lookup("participate in").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:參與 / 參加"]
);
assert.deepStrictEqual(
  senseBank.lookup("pay off").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:取得回報 / 成功"]
);
assert.deepStrictEqual(
  senseBank.lookup("pose a threat").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:構成威脅"]
);
assert.deepStrictEqual(
  senseBank.lookup("provided (that)").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["provided that:phrase:conjunction:只要 / 假如"]
);
assert.deepStrictEqual(
  senseBank.lookup("rather than").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:而不是"]
);
assert.deepStrictEqual(
  senseBank.lookup("regardless of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:不論 / 不管"]
);
assert.deepStrictEqual(
  senseBank.lookup("rely on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:依賴 / 依靠"]
);
assert.deepStrictEqual(
  senseBank.lookup("result in").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:導致"]
);
assert.deepStrictEqual(
  senseBank.lookup("suffer from").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:患有 / 受...之苦"]
);
assert.deepStrictEqual(
  senseBank.lookup("take advantage of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:利用 / 善用"]
);
assert.deepStrictEqual(
  senseBank.lookup("take into account").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:考慮 / 將...考慮在內"]
);
assert.deepStrictEqual(
  senseBank.lookup("all in all").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:總括而言"]
);
assert.deepStrictEqual(
  senseBank.lookup("as long as").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:只要"]
);
assert.deepStrictEqual(
  senseBank.lookup("utilize").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["utilize:word:verb:利用 / 善用"]
);
assert.deepStrictEqual(
  senseBank.lookup("with respect to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["with regard to:phrase:preposition:關於 / 就...而言"]
);
assert.deepStrictEqual(
  senseBank.lookup("worthwhile").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:值得做的 / 有價值的"]
);
assert.deepStrictEqual(
  senseBank.lookup("yearning for").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["yearn for:phrase:verb:渴望 / 嚮往"]
);
assert.deepStrictEqual(
  senseBank.lookup("addicted to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:對...上癮的 / 沉迷於"]
);
assert.deepStrictEqual(
  senseBank.lookup("apologize to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["apologise to:phrase:verb:向...道歉"]
);
assert.deepStrictEqual(
  senseBank.lookup("as soon as").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:一...就"]
);
assert.deepStrictEqual(
  senseBank.lookup("beneficial to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:對...有益"]
);
assert.deepStrictEqual(
  senseBank.lookup("compete against").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:與...競爭"]
);
assert.deepStrictEqual(
  senseBank.lookup("familiarize with").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["familiarise with:phrase:verb:使...熟悉"]
);
assert.deepStrictEqual(
  senseBank.lookup("in addition to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:除了...之外"]
);
assert.deepStrictEqual(
  senseBank.lookup("fall victim to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:成為...的受害者"]
);
assert.deepStrictEqual(
  senseBank.lookup("for a living").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:以...維生"]
);
assert.deepStrictEqual(
  senseBank.lookup("has nothing to do with").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["have nothing to do with:phrase:verb:與...無關"]
);
assert.deepStrictEqual(
  senseBank.lookup("has something to do with").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["have something to do with:phrase:verb:與...有關"]
);
assert.deepStrictEqual(
  senseBank.lookup("if only").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:如果...就好了"]
);
assert.deepStrictEqual(
  senseBank.lookup("on the verge of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:在...的邊緣 / 快將..."]
);
assert.deepStrictEqual(
  senseBank.lookup("pave the way for").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:為...鋪路"]
);
assert.deepStrictEqual(
  senseBank.lookup("pose a threat to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:對...構成威脅"]
);
assert.deepStrictEqual(
  senseBank.lookup("raise awareness of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:提高對...的意識"]
);
assert.deepStrictEqual(
  senseBank.lookup("related to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:與...有關"]
);
assert.deepStrictEqual(
  senseBank.lookup("prior to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:在...之前"]
);
assert.deepStrictEqual(
  senseBank.lookup("prohibit ... from").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:禁止...做某事"]
);
assert.deepStrictEqual(
  senseBank.lookup("reason for").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:...的原因"]
);
assert.deepStrictEqual(
  senseBank.lookup("pivotal in").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:對...極為重要"]
);
assert.deepStrictEqual(
  senseBank.lookup("be detrimental to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["detrimental to:phrase:adjective:對...有害"]
);
assert.deepStrictEqual(
  senseBank.lookup("hazardous to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:對...有危害"]
);
assert.deepStrictEqual(
  senseBank.lookup("in proximity to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:在...附近"]
);
assert.deepStrictEqual(
  senseBank.lookup("problem-solving skills").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:解難能力"]
);
assert.deepStrictEqual(
  senseBank.lookup("relative to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:相對於 / 與...相比"]
);
assert.deepStrictEqual(
  senseBank.lookup("wreak havoc on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:嚴重破壞 / 對...造成嚴重損害"]
);
assert.deepStrictEqual(
  senseBank.lookup("intrumental in").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["instrumental in:phrase:adjective:對...有幫助 / 起重要作用"]
);
assert.deepStrictEqual(
  senseBank.lookup("confined to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:限於 / 只限於"]
);
assert.deepStrictEqual(
  senseBank.lookup("brimmed with").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["brim with:phrase:verb:充滿"]
);
assert.deepStrictEqual(
  senseBank.lookup("deal with").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:處理 / 應付"]
);
assert.deepStrictEqual(
  senseBank.lookup("be used to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:習慣於"]
);
assert.deepStrictEqual(
  senseBank.lookup("in light of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:鑑於 / 考慮到"]
);
assert.deepStrictEqual(
  senseBank.lookup("look forward to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:期待"]
);
assert.deepStrictEqual(
  senseBank.lookup("originate in").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:起源於"]
);
assert.deepStrictEqual(
  senseBank.lookup("a sense of accomplishment").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["a sense of achievement:phrase:noun:成就感"]
);
assert.deepStrictEqual(
  senseBank.lookup("a growing number of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:determiner:越來越多的"]
);
assert.deepStrictEqual(
  senseBank.lookup("artificial intelligence").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:人工智能"]
);
assert.deepStrictEqual(
  senseBank.lookup("employment oopportunities").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["employment opportunities:phrase:noun:就業機會"]
);
assert.deepStrictEqual(
  senseBank.lookup("despite the fact that").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:雖然 / 儘管"]
);
assert.deepStrictEqual(
  senseBank.lookup("of utmost importance").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["of paramount importance:phrase:adjective:極為重要"]
);
assert.deepStrictEqual(
  senseBank.lookup("people from all walks of life").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:來自各行各業的人"]
);
assert.deepStrictEqual(
  senseBank.lookup("can be ascribed to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["can be attributed to:phrase:verb:可歸因於"]
);
assert.deepStrictEqual(
  senseBank.lookup("beyond a shadow of a doubt").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:毫無疑問 / 無可置疑"]
);
assert.deepStrictEqual(
  senseBank.lookup("breathe a sigh of relief").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:鬆一口氣"]
);
assert.deepStrictEqual(
  senseBank.lookup("far from satisfactory").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:遠不令人滿意"]
);
assert.deepStrictEqual(
  senseBank.lookup("go from bad to worse").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:每況愈下 / 越來越差"]
);
assert.deepStrictEqual(
  senseBank.lookup("in the blink of an eye").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:眨眼間"]
);
assert.deepStrictEqual(
  senseBank.lookup("on the grounds that").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:因為 / 基於...理由"]
);
assert.deepStrictEqual(
  senseBank.lookup("on top of the world").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:非常開心"]
);
assert.deepStrictEqual(
  senseBank.lookup("affluent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:富裕的"]
);
assert.deepStrictEqual(
  senseBank.lookup("algorithm").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:演算法 / 算法"]
);
assert.deepStrictEqual(
  senseBank.lookup("allergens").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["allergen:noun:致敏原"]
);
assert.deepStrictEqual(
  senseBank.lookup("Buddhist").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Buddhist:noun:佛教徒"]
);
assert.deepStrictEqual(
  senseBank.lookup("cliché").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["cliche:noun:陳腔濫調 / 老生常談"]
);
assert.deepStrictEqual(
  senseBank.lookup("burnout").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:身心耗竭 / 過度疲勞"]
);
assert.deepStrictEqual(
  senseBank.lookup("cramped").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:擠迫的"]
);
assert.deepStrictEqual(
  senseBank.lookup("cuisine").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:菜式 / 菜系"]
);
assert.deepStrictEqual(
  senseBank.lookup("daunting").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:令人卻步的 / 令人生畏的"]
);
assert.deepStrictEqual(
  senseBank.lookup("dwindle").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:逐漸減少"]
);
assert.deepStrictEqual(
  senseBank.lookup("eatery").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:食店 / 餐館"]
);
assert.deepStrictEqual(
  senseBank.lookup("gratitude").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:感激 / 感恩"]
);
assert.deepStrictEqual(
  senseBank.lookup("hazardous").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:有危害的 / 危險的"]
);
assert.deepStrictEqual(
  senseBank.lookup("hearty").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:豐盛的 / 熱情的"]
);
assert.deepStrictEqual(
  senseBank.lookup("intrinsic").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:內在的 / 固有的"]
);
assert.deepStrictEqual(
  senseBank.lookup("perspectives").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["perspective:noun:觀點 / 角度"]
);
assert.deepStrictEqual(
  senseBank.lookup("persuasive").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:有說服力的"]
);
assert.deepStrictEqual(
  senseBank.lookup("protagonist").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:主角 / 主要人物"]
);
assert.deepStrictEqual(
  senseBank.lookup("provacative").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["provocative:adjective:挑釁的 / 惹火的"]
);
assert.deepStrictEqual(
  senseBank.lookup("regulars").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["regular:noun:常客"]
);
assert.deepStrictEqual(
  senseBank.lookup("retailers").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["retailer:noun:零售商"]
);
assert.deepStrictEqual(
  senseBank.lookup("scarcely").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:幾乎不"]
);
assert.deepStrictEqual(
  senseBank.lookup("tourists").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["tourist:noun:旅客 / 遊客"]
);
assert.deepStrictEqual(
  senseBank.lookup("travellers").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["traveller:noun:旅客 / 旅行者"]
);
assert.deepStrictEqual(
  senseBank.lookup("vitamins").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["vitamin:noun:維他命 / 維生素"]
);
assert.deepStrictEqual(
  senseBank.lookup("subsidize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["subsidise:verb:津貼 / 資助"]
);
assert.deepStrictEqual(
  senseBank.lookup("supertitious").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["superstitious:adjective:迷信的"]
);
assert.deepStrictEqual(
  senseBank.lookup("Thai").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Thai:adjective:泰國的"]
);
assert.deepStrictEqual(
  senseBank.lookup("vigourous").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["vigorous:adjective:劇烈的 / 精力充沛的"]
);
assert.deepStrictEqual(
  senseBank.lookup("workload").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:工作量"]
);
assert.deepStrictEqual(
  senseBank.lookup("acquaintance").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:認識的人 / 泛泛之交"]
);
assert.deepStrictEqual(
  senseBank.lookup("allergies").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["allergy:noun:過敏 / 敏感"]
);
assert.deepStrictEqual(
  senseBank.lookup("ambiance").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["ambience:noun:氣氛 / 氛圍"]
);
assert.deepStrictEqual(
  senseBank.lookup("artifact").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["artefact:noun:文物 / 人造物"]
);
assert.deepStrictEqual(
  senseBank.lookup("alumni").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["alumnus:noun:校友"]
);
assert.deepStrictEqual(
  senseBank.lookup("aggravate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:使惡化 / 加劇"]
);
assert.deepStrictEqual(
  senseBank.lookup("apprehend").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:拘捕 / 逮捕"]
);
assert.deepStrictEqual(
  senseBank.lookup("arrogant").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:傲慢的 / 自大的"]
);
assert.deepStrictEqual(
  senseBank.lookup("baby boomers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["baby boomer:phrase:noun:嬰兒潮一代"]
);
assert.deepStrictEqual(
  senseBank.lookup("backpack").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:背包"]
);
assert.deepStrictEqual(
  senseBank.lookup("balconies").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["balcony:noun:露台"]
);
assert.deepStrictEqual(
  senseBank.lookup("bar chart").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:棒形圖 / 柱狀圖"]
);
assert.deepStrictEqual(
  senseBank.lookup("be absorbed in").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:全神貫注於"]
);
assert.deepStrictEqual(
  senseBank.lookup("behemoths").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["behemoth:noun:巨頭 / 龐然大物"]
);
assert.deepStrictEqual(
  senseBank.lookup("bubble tea").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:珍珠奶茶"]
);
assert.deepStrictEqual(
  senseBank.lookup("by no means").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:絕不"]
);
assert.deepStrictEqual(
  senseBank.lookup("cacti").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["cactus:noun:仙人掌"]
);
assert.deepStrictEqual(
  senseBank.lookup("call into question").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:質疑"]
);
assert.deepStrictEqual(
  senseBank.lookup("carbonated drinks").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["carbonated drink:phrase:noun:有汽飲品"]
);
assert.deepStrictEqual(
  senseBank.lookup("career prospects").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["career prospect:phrase:noun:事業前途"]
);
assert.deepStrictEqual(
  senseBank.lookup("century eggs").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["century egg:phrase:noun:皮蛋"]
);
assert.deepStrictEqual(
  senseBank.lookup("city dwellers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["city dweller:phrase:noun:城市居民 / 城市人"]
);
assert.deepStrictEqual(
  senseBank.lookup("co-workers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["co-worker:phrase:noun:同事"]
);
assert.deepStrictEqual(
  senseBank.lookup("churn out").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:大量快速生產"]
);
assert.deepStrictEqual(
  senseBank.lookup("commit crimes").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["commit crime:phrase:verb:犯罪"]
);
assert.deepStrictEqual(
  senseBank.lookup("conduct a survey").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:進行調查"]
);
assert.deepStrictEqual(
  senseBank.lookup("consumers").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["consumer:noun:消費者"]
);
assert.deepStrictEqual(
  senseBank.lookup("criticize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["criticize:verb:批評"]
);
assert.deepStrictEqual(
  senseBank.lookup("Confucian").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Confucian:adjective:儒家的 / 孔子的"]
);
assert.deepStrictEqual(
  senseBank.lookup("console games").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["console game:phrase:noun:主機遊戲"]
);
assert.deepStrictEqual(
  senseBank.lookup("convert a into b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["convert A into B:phrase:verb:將A轉變成B"]
);
assert.deepStrictEqual(
  senseBank.lookup("core values").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["core value:phrase:noun:核心價值"]
);
assert.deepStrictEqual(
  senseBank.lookup("craftsmen").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["craftsman:noun:工匠 / 手藝人"]
);
assert.deepStrictEqual(
  senseBank.lookup("customize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["customise:verb:自訂 / 訂製"]
);
assert.deepStrictEqual(
  senseBank.lookup("decidely").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["decidedly:adverb:明顯地 / 確實地"]
);
assert.deepStrictEqual(
  senseBank.lookup("declared monuments").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["declared monument:phrase:noun:法定古蹟"]
);
assert.deepStrictEqual(
  senseBank.lookup("disposable containers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["disposable container:phrase:noun:一次性容器"]
);
assert.deepStrictEqual(
  senseBank.lookup("do the dishes").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:洗碗"]
);
assert.deepStrictEqual(
  senseBank.lookup("drawbacks").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["drawback:noun:缺點"]
);
assert.deepStrictEqual(
  senseBank.lookup("durable").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:耐用的", "noun:耐用品"]
);
assert.deepStrictEqual(
  senseBank.lookup("Dutch").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Dutch:adjective:荷蘭的"]
);
assert.deepStrictEqual(
  senseBank.lookup("emphasize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["emphasize:verb:強調"]
);
assert.deepStrictEqual(
  senseBank.lookup("Europe").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Europe:noun:歐洲"]
);
assert.deepStrictEqual(
  senseBank.lookup("exhilirated").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["exhilarated:adjective:興高采烈的"]
);
assert.deepStrictEqual(
  senseBank.lookup("exquiste").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["exquisite:adjective:精緻的"]
);
assert.deepStrictEqual(
  senseBank.lookup("family bonds").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["family bond:phrase:noun:家庭關係 / 家庭羈絆"]
);
assert.deepStrictEqual(
  senseBank.lookup("fertiliser").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["fertilizer:noun:肥料"]
);
assert.deepStrictEqual(
  senseBank.lookup("first aid kit").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["first-aid kit:phrase:noun:急救包"]
);
assert.deepStrictEqual(
  senseBank.lookup("fizzy drinks").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["fizzy drink:phrase:noun:有汽飲品"]
);
assert.deepStrictEqual(
  senseBank.lookup("fresh graduates").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["fresh graduate:phrase:noun:剛畢業的大學生 / 應屆畢業生"]
);
assert.deepStrictEqual(
  senseBank.lookup("get over").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:克服"]
);
assert.deepStrictEqual(
  senseBank.lookup("give a try").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["give it a go:phrase:verb:試一試"]
);
assert.deepStrictEqual(
  senseBank.lookup("go viral").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:爆紅 / 瘋傳"]
);
assert.deepStrictEqual(
  senseBank.lookup("gravitate toward").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["gravitate towards:phrase:verb:被...吸引 / 傾向於"]
);
assert.deepStrictEqual(
  senseBank.lookup("grown-ups").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["grown-up:phrase:noun:成人 / 成年人"]
);
assert.deepStrictEqual(
  senseBank.lookup("high-rise buildings").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["high-rise building:phrase:noun:高層建築"]
);
assert.deepStrictEqual(
  senseBank.lookup("holistic").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:全面的 / 整體的"]
);
assert.deepStrictEqual(
  senseBank.lookup("household names").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["household name:phrase:noun:家喻戶曉的人或名字"]
);
assert.deepStrictEqual(
  senseBank.lookup("in contrast to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:與...相比 / 與...相反"]
);
assert.deepStrictEqual(
  senseBank.lookup("in the long term").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["in the long run:phrase:adverb:長遠來說"]
);
assert.deepStrictEqual(
  senseBank.lookup("in vain").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:白費地 / 徒勞地"]
);
assert.deepStrictEqual(
  senseBank.lookup("instill").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["instil:verb:灌輸"]
);
assert.deepStrictEqual(
  senseBank.lookup("jewellery").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["jewellery:noun:珠寶"]
);
assert.deepStrictEqual(
  senseBank.lookup("jews").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Jew:noun:猶太人"]
);
assert.deepStrictEqual(
  senseBank.lookup("labor costs").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["labour cost:phrase:noun:勞工成本"]
);
assert.deepStrictEqual(
  senseBank.lookup("larvae").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["larva:noun:幼蟲"]
);
assert.deepStrictEqual(
  senseBank.lookup("Latin America").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Latin America:phrase:noun:拉丁美洲"]
);
assert.deepStrictEqual(
  senseBank.lookup("leftover").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:剩下的", "noun:剩菜 / 剩餘食物"]
);
assert.deepStrictEqual(
  senseBank.lookup("leftovers").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["leftover:noun:剩菜 / 剩餘食物"]
);
assert.deepStrictEqual(
  senseBank.lookup("living conditions").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["living condition:phrase:noun:生活狀況"]
);
assert.deepStrictEqual(
  senseBank.lookup("low-rise buildings").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["low-rise building:phrase:noun:低層建築"]
);
assert.deepStrictEqual(
  senseBank.lookup("manufacturers").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["manufacturer:noun:製造商"]
);
assert.deepStrictEqual(
  senseBank.lookup("marginalized").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["marginalised:adjective:被邊緣化的"]
);
assert.deepStrictEqual(
  senseBank.lookup("Mexico").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Mexico:noun:墨西哥"]
);
assert.deepStrictEqual(
  senseBank.lookup("minimize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["minimize:verb:把...減到最低 / 盡量減少"]
);
assert.deepStrictEqual(
  senseBank.lookup("minimise").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["minimise:verb:減少 / 降低"]
);
assert.deepStrictEqual(
  senseBank.lookup("Mount Fuji").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Mount Fuji:phrase:noun:富士山"]
);
assert.deepStrictEqual(
  senseBank.lookup("natural disasters").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["natural disaster:phrase:noun:自然災害"]
);
assert.deepStrictEqual(
  senseBank.lookup("on behalf of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:代表"]
);
assert.deepStrictEqual(
  senseBank.lookup("organization").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["organization:noun:組織 / 機構"]
);
assert.deepStrictEqual(
  senseBank.lookup("overwhelmed").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:不知所措的 / 充滿強烈情感的"]
);
assert.deepStrictEqual(
  senseBank.lookup("patronize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["patronise:verb:光顧 / 惠顧"]
);
assert.deepStrictEqual(
  senseBank.lookup("plagiarize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["plagiarise:verb:抄襲"]
);
assert.deepStrictEqual(
  senseBank.lookup("prefer a to b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["prefer A to B:phrase:verb:喜歡A多於B"]
);
assert.deepStrictEqual(
  senseBank.lookup("prioritize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["prioritise:verb:優先考慮"]
);
assert.deepStrictEqual(
  senseBank.lookup("public facilities").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["public facility:phrase:noun:公共設施"]
);
assert.deepStrictEqual(
  senseBank.lookup("put up with").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:忍受"]
);
assert.deepStrictEqual(
  senseBank.lookup("quality of life").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:生活質素"]
);
assert.deepStrictEqual(
  senseBank.lookup("raise awareness").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:提高意識"]
);
assert.deepStrictEqual(
  senseBank.lookup("responsbility").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["responsibility:noun:責任"]
);
assert.deepStrictEqual(
  senseBank.lookup("revoluntionary").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["revolutionary:adjective:革命性的"]
);
assert.deepStrictEqual(
  senseBank.lookup("reminscent").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["reminiscent:adjective:令人想起的"]
);
assert.deepStrictEqual(
  senseBank.lookup("replace a with b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["replace A with B:phrase:verb:用B取代A"]
);
assert.deepStrictEqual(
  senseBank.lookup("respiratory diseases").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["respiratory disease:phrase:noun:呼吸道疾病"]
);
assert.deepStrictEqual(
  senseBank.lookup("sanitize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["sanitise:verb:消毒"]
);
assert.deepStrictEqual(
  senseBank.lookup("savory").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["savoury:adjective:鹹香的 / 濃味的"]
);
assert.deepStrictEqual(
  senseBank.lookup("skeptical about").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["sceptical about:phrase:adjective:對...懷疑"]
);
assert.deepStrictEqual(
  senseBank.lookup("social enterprises").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["social enterprise:phrase:noun:社會企業"]
);
assert.deepStrictEqual(
  senseBank.lookup("sought after").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["sought-after:phrase:adjective:備受追捧的"]
);
assert.deepStrictEqual(
  senseBank.lookup("stakeholders").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["stakeholder:noun:持分者"]
);
assert.deepStrictEqual(
  senseBank.lookup("story").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["story:noun:故事", "story:noun:樓層 / 層"]
);
assert.deepStrictEqual(
  senseBank.lookup("storey").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["storey:noun:樓層 / 層"]
);
assert.deepStrictEqual(
  senseBank.lookup("subdivided flat").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:劏房"]
);
assert.deepStrictEqual(
  senseBank.lookup("supplementary classes").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["supplementary class:phrase:noun:補課 / 補習課"]
);
assert.deepStrictEqual(
  senseBank.lookup("symbolize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["symbolise:verb:象徵"]
);
assert.deepStrictEqual(
  senseBank.lookup("tactics").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["tactic:noun:策略 / 戰術"]
);
assert.deepStrictEqual(
  senseBank.lookup("take a gap year of").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["take a gap year:phrase:verb:休學一年 / 空檔一年"]
);
assert.deepStrictEqual(
  senseBank.lookup("take pride ... on").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["take pride in:phrase:verb:以...為榮"]
);
assert.deepStrictEqual(
  senseBank.lookup("taught").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:teach 的過去式 / 過去分詞"]
);
assert.deepStrictEqual(
  senseBank.lookup("tech geeks").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["tech geek:phrase:noun:科技迷"]
);
assert.deepStrictEqual(
  senseBank.lookup("the greater bay area").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["the Greater Bay Area:phrase:noun:大灣區"]
);
assert.deepStrictEqual(
  senseBank.lookup("traffic accidents").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["traffic accident:phrase:noun:交通意外"]
);
assert.deepStrictEqual(
  senseBank.lookup("traveling").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["traveling:noun:旅行", "travel:verb:旅行"]
);
assert.deepStrictEqual(
  senseBank.lookup("turn a into b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["turn A into B:phrase:verb:將A變成B"]
);
assert.deepStrictEqual(
  senseBank.lookup("turn out to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["turn out to be:phrase:verb:結果是"]
);
assert.deepStrictEqual(
  senseBank.lookup("unmanly").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:不像男子漢的 / 懦弱的"]
);
assert.deepStrictEqual(
  senseBank.lookup("vendors").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["vendor:noun:賣家 / 小販"]
);
assert.deepStrictEqual(
  senseBank.lookup("virtualy impossible").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["virtually impossible:phrase:adjective:幾乎不可能的"]
);
assert.deepStrictEqual(
  senseBank.lookup("warp").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:使變形 / 扭曲"]
);
assert.deepStrictEqual(
  senseBank.lookup("well-paid jobs").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["well-paid job:phrase:noun:高收入工作"]
);
assert.deepStrictEqual(
  senseBank.lookup("westerners").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["westerner:noun:西方人"]
);
assert.deepStrictEqual(
  senseBank.lookup("white-collar workers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["white-collar worker:phrase:noun:白領人士"]
);
assert.deepStrictEqual(
  senseBank.lookup("work in your favour").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["work in your favour:phrase:verb:對你有利"]
);
assert.deepStrictEqual(
  senseBank.lookup("worth + ving").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["worth + V-ing:pattern:adjective:值得..."]
);
assert.deepStrictEqual(
  senseBank.lookup("well-known for").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:以...聞名"]
);
assert.deepStrictEqual(
  senseBank.lookup("when it comes to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:當談到..."]
);
assert.deepStrictEqual(
  senseBank.lookup("widely recognized").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["widely recognised:phrase:adjective:廣受認可的"]
);
assert.deepStrictEqual(
  senseBank.lookup("with a view to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:為了 / 旨在"]
);
assert.deepStrictEqual(
  senseBank.lookup("young generations").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["young generation:phrase:noun:年輕一代"]
);
assert.deepStrictEqual(
  senseBank.lookup("zombie").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:喪屍 / 殭屍"]
);
assert.deepStrictEqual(
  senseBank.lookup("a variety of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:determiner:不同種類的"]
);
assert.deepStrictEqual(
  senseBank.lookup("a bundle of nerves").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:非常緊張的人"]
);
assert.deepStrictEqual(
  senseBank.lookup("academic qualifications").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["academic qualification:phrase:noun:學歷"]
);
assert.deepStrictEqual(
  senseBank.lookup("adj + as + subj + be").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["adj + as + subject + be:pattern:conjunction:雖然"]
);
assert.deepStrictEqual(
  senseBank.lookup("adverse effects").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["adverse effect:phrase:noun:負面影響"]
);
assert.deepStrictEqual(
  senseBank.lookup("be+pp").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["be + pp:pattern:auxiliary:被（被動語態）"]
);
assert.deepStrictEqual(
  senseBank.lookup("between...and...").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["between ... and ...:pattern:preposition:在...與...之間"]
);
assert.deepStrictEqual(
  senseBank.lookup("can't help ving").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["can't help + V-ing:pattern:verb:忍不住做某事"]
);
assert.deepStrictEqual(
  senseBank.lookup("chance only favors prepared minds").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["chance favours the prepared mind:phrase:noun:機會只留給有準備的人"]
);
assert.deepStrictEqual(
  senseBank.lookup("chances are that").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:很可能..."]
);
assert.deepStrictEqual(
  senseBank.lookup("degree holders").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["degree holder:phrase:noun:大學畢業生"]
);
assert.deepStrictEqual(
  senseBank.lookup("dietician / nutritionist").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["nutritionist:noun:營養師"]
);
assert.deepStrictEqual(
  senseBank.lookup("dire = dreadful = appalling").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["dire / dreadful / appalling:phrase:adjective:可怕的"]
);
assert.deepStrictEqual(
  senseBank.lookup("dishes").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["dish:noun:菜式"]
);
assert.deepStrictEqual(
  senseBank.lookup("douse").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:潑濕 / 澆熄"]
);
assert.deepStrictEqual(
  senseBank.lookup("fc").map((entry) => `${entry.pos}:${entry.meaning}`),
  []
);
assert.deepStrictEqual(
  senseBank.lookup("either a or b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["either A or B:pattern:conjunction:不是A就是B / 或者A或者B"]
);
assert.deepStrictEqual(
  senseBank.lookup("environment conscious").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["environmentally conscious:phrase:adjective:有環保意識的"]
);
assert.deepStrictEqual(
  senseBank.lookup("find it adj").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["find it + adjective:pattern:verb:覺得...是..."]
);
assert.deepStrictEqual(
  senseBank.lookup("for+時間").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["for + time:pattern:preposition:持續一段時間"]
);
assert.deepStrictEqual(
  senseBank.lookup("from...to...").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["from ... to ...:pattern:preposition:從...到..."]
);
assert.deepStrictEqual(
  senseBank.lookup("fusion dishes").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["fusion dish:phrase:noun:融合菜式"]
);
assert.deepStrictEqual(
  senseBank.lookup("generally (speaking)").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["generally speaking:phrase:adverb:一般來說"]
);
assert.deepStrictEqual(
  senseBank.lookup("go down the drain / in vain").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["go down the drain:phrase:verb:白費 / 付諸東流"]
);
assert.deepStrictEqual(
  senseBank.lookup("graveyard").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:墓地"]
);
assert.deepStrictEqual(
  senseBank.lookup("happen to + v").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["happen to + verb:pattern:verb:碰巧..."]
);
assert.deepStrictEqual(
  senseBank.lookup("has pp").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["has + pp:pattern:auxiliary:已經... / ...過"]
);
assert.deepStrictEqual(
  senseBank.lookup("have to bite to eat").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["have a bite to eat:phrase:verb:吃點東西"]
);
assert.deepStrictEqual(
  senseBank.lookup("hidden youths").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["hidden youth:phrase:noun:隱青"]
);
assert.deepStrictEqual(
  senseBank.lookup("however + adj").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["however + adjective:pattern:conjunction:無論多麼..."]
);
assert.deepStrictEqual(
  senseBank.lookup("illicit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:非法的"]
);
assert.deepStrictEqual(
  senseBank.lookup("in opposition of").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["in opposition to:phrase:preposition:反對"]
);
assert.deepStrictEqual(
  senseBank.lookup("individuals").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["individual:noun:個人"]
);
assert.deepStrictEqual(
  senseBank.lookup("irresonsible").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["irresponsible:adjective:不負責任的"]
);
assert.deepStrictEqual(
  senseBank.lookup("is being pp").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["is being + pp:pattern:auxiliary:正在被..."]
);
assert.deepStrictEqual(
  senseBank.lookup("ivy league").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Ivy League:phrase:noun:常春藤聯盟"]
);
assert.deepStrictEqual(
  senseBank.lookup("k").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  []
);
assert.deepStrictEqual(
  senseBank.lookup("l").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  []
);
assert.deepStrictEqual(
  senseBank.lookup("keep one's eyes glued to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:緊盯著"]
);
assert.deepStrictEqual(
  senseBank.lookup("little wonder that").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:conjunction:難怪..."]
);
assert.deepStrictEqual(
  senseBank.lookup("live up to ... expectations").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:達到...期望"]
);
assert.deepStrictEqual(
  senseBank.lookup("loan sharks").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["loan shark:phrase:noun:高利貸"]
);
assert.deepStrictEqual(
  senseBank.lookup("long gone are the days when").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:conjunction:...的日子已不復返"]
);
assert.deepStrictEqual(
  senseBank.lookup("loosely").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:鬆散地 / 大概地"]
);
assert.deepStrictEqual(
  senseBank.lookup("m").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  []
);
assert.deepStrictEqual(
  senseBank.lookup("make...redundant").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["make ... redundant:phrase:verb:使...失業 / 解僱"]
);
assert.deepStrictEqual(
  senseBank.lookup("males").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["male:noun:男性 / 雄性動物"]
);
assert.deepStrictEqual(
  senseBank.lookup("managed to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["manage to:phrase:verb:設法做到 / 能夠"]
);
assert.deepStrictEqual(
  senseBank.lookup("mesmerized by").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["mesmerised by:phrase:adjective:被...迷倒 / 迷上"]
);
assert.deepStrictEqual(
  senseBank.lookup("motivations").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["motivation:noun:動力 / 動機"]
);
assert.deepStrictEqual(
  senseBank.lookup("multinational enterprises").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["multinational enterprise:phrase:noun:跨國企業"]
);
assert.deepStrictEqual(
  senseBank.lookup("neither...nor...").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["neither ... nor ...:pattern:conjunction:既不...也不..."]
);
assert.deepStrictEqual(
  senseBank.lookup("one of the 名詞s").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["one of the + plural noun:pattern:determiner:其中一個..."]
);
assert.deepStrictEqual(
  senseBank.lookup("over + 時間").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["over + time:pattern:preposition:在...期間"]
);
assert.deepStrictEqual(
  senseBank.lookup("overheads").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["overhead:noun:經常開支 / 間接成本"]
);
assert.deepStrictEqual(
  senseBank.lookup("pace of life").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pace of life:phrase:noun:生活節奏"]
);
assert.deepStrictEqual(
  senseBank.lookup("packed with").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:充滿 / 擠滿"]
);
assert.deepStrictEqual(
  senseBank.lookup("pale in comparison").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:相形見絀"]
);
assert.deepStrictEqual(
  senseBank.lookup("play sports").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:做運動 / 參與體育活動"]
);
assert.deepStrictEqual(
  senseBank.lookup("property owners").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["property owner:phrase:noun:業主"]
);
assert.deepStrictEqual(
  senseBank.lookup("public figures").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["public figure:phrase:noun:公眾人物"]
);
assert.deepStrictEqual(
  senseBank.lookup("put a ahead of b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["put A ahead of B:phrase:verb:把A放在B之前 / 比B更重視A"]
);
assert.deepStrictEqual(
  senseBank.lookup("remember ving").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["remember + V-ing:pattern:verb:記得做過"]
);
assert.deepStrictEqual(
  senseBank.lookup("reservations").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  [
    "reservation:noun:預訂",
    "reservation:noun:保留意見"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("respects").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["respect:noun:方面"]
);
assert.deepStrictEqual(
  senseBank.lookup("self-discipline").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:自律"]
);
assert.deepStrictEqual(
  senseBank.lookup("shopping list").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:購物清單"]
);
assert.deepStrictEqual(
  senseBank.lookup("smart devices").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["smart device:phrase:noun:智能設備"]
);
assert.deepStrictEqual(
  senseBank.lookup("Singaporean").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  [
    "Singaporean:adjective:新加坡的",
    "Singaporean:noun:新加坡人"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("stately").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:莊嚴的 / 氣派的"]
);
assert.deepStrictEqual(
  senseBank.lookup("stand in sharp contrast with").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["stand in sharp contrast to:phrase:verb:與...形成鮮明對比"]
);
assert.deepStrictEqual(
  senseBank.lookup("swarms of").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["swarm of:phrase:noun:大量... / 一大群..."]
);
assert.deepStrictEqual(
  senseBank.lookup("rules").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["rule:noun:規則"]
);
assert.deepStrictEqual(
  senseBank.lookup("re-energize").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["re-energise:phrase:verb:恢復精力"]
);
assert.deepStrictEqual(
  senseBank.lookup("scroll on phones").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["scroll through:phrase:verb:滑動瀏覽"]
);
assert.deepStrictEqual(
  senseBank.lookup("search (for)").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["search for:phrase:verb:尋找"]
);
assert.deepStrictEqual(
  senseBank.lookup("see as").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["see ... as ...:phrase:verb:視為"]
);
assert.deepStrictEqual(
  senseBank.lookup("simultanuously").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["simultaneously:adverb:同時"]
);
assert.deepStrictEqual(
  senseBank.lookup("so adj that").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["so + adjective + that:pattern:conjunction:如此...以致"]
);
assert.deepStrictEqual(
  senseBank.lookup("strike a work-life balance").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["strike a balance:phrase:verb:取得平衡"]
);
assert.deepStrictEqual(
  senseBank.lookup("skills").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["skill:noun:技能 / 技巧"]
);
assert.deepStrictEqual(
  senseBank.lookup("spices").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["spice:noun:香料"]
);
assert.deepStrictEqual(
  senseBank.lookup("ableist").map((entry) => `${entry.pos}:${entry.meaning}`),
  [
    "adjective:歧視殘疾人士的",
    "noun:歧視殘疾人士的人"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("africa").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Africa:noun:非洲"]
);
assert.deepStrictEqual(
  senseBank.lookup("an unparalleled success").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:無可比擬的成功"]
);
assert.deepStrictEqual(
  senseBank.lookup("anytime and anywhere").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:隨時隨地"]
);
assert.deepStrictEqual(
  senseBank.lookup("behaviour").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["behaviour:noun:行為"]
);
assert.deepStrictEqual(
  senseBank.lookup("blockbuster / box office hit").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["blockbuster:word:noun:賣座電影 / 大熱作品"]
);
assert.deepStrictEqual(
  senseBank.lookup("buried in").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:埋頭於 / 專心於"]
);
assert.deepStrictEqual(
  senseBank.lookup("ubiquitous").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:無處不在的"]
);
assert.deepStrictEqual(
  senseBank.lookup("under undue stress").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:承受過度壓力的"]
);
assert.deepStrictEqual(
  senseBank.lookup("urban dwellers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["urban dweller:phrase:noun:城市居民 / 都市人"]
);
assert.deepStrictEqual(
  senseBank.lookup("Valentine's Day").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Valentine's Day:phrase:noun:情人節"]
);
assert.deepStrictEqual(
  senseBank.lookup("visualize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["visualise:verb:想像 / 視覺化"]
);
assert.deepStrictEqual(
  senseBank.lookup("will ... soon").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:modal:快將"]
);
assert.deepStrictEqual(
  senseBank.lookup("名詞+free").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["noun + free:pattern:adjective:沒有...的"]
);
assert.deepStrictEqual(
  senseBank.lookup("行為+with").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["verb + with:pattern:preposition:用...來..."]
);
assert.deepStrictEqual(
  senseBank.lookup("tantalize our taste buds").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["tantalise our taste buds:phrase:verb:挑動我們的味蕾"]
);
assert.deepStrictEqual(
  senseBank.lookup("taste buds").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["taste bud:phrase:noun:味蕾"]
);
assert.deepStrictEqual(
  senseBank.lookup("tend to (v) / inclined to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["inclined to:phrase:adjective:傾向於"]
);
assert.deepStrictEqual(
  senseBank.lookup("the ... industry").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["the + industry:pattern:noun:...行業"]
);
assert.deepStrictEqual(
  senseBank.lookup("the amount of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:determiner:...的數量（不可數名詞）"]
);
assert.deepStrictEqual(
  senseBank.lookup("the authority concerned").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["the authorities concerned:phrase:noun:有關當局"]
);
assert.deepStrictEqual(
  senseBank.lookup("the odds are that").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["the odds are that:pattern:conjunction:很可能..."]
);
assert.deepStrictEqual(
  senseBank.lookup("the 名詞 concerned").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["the + noun + concerned:pattern:adjective:有關的..."]
);
assert.deepStrictEqual(
  senseBank.lookup("there's no doubt that").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["there is no doubt that:pattern:conjunction:毫無疑問..."]
);
assert.deepStrictEqual(
  senseBank.lookup("there are").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:verb:有（眾數）"]
);
assert.deepStrictEqual(
  senseBank.lookup("those with").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:pronoun:有...的人"]
);
assert.deepStrictEqual(
  senseBank.lookup("to whom it may concern").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["To whom it may concern:phrase:exclamation:敬啟者"]
);
assert.deepStrictEqual(
  senseBank.lookup("united nations").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["United Nations:phrase:noun:聯合國"]
);
assert.deepStrictEqual(
  senseBank.lookup("view as").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["view ... as ...:phrase:verb:視為"]
);
assert.deepStrictEqual(
  senseBank.lookup("tv series").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["TV series:phrase:noun:電視劇 / 電視連續劇"]
);
assert.deepStrictEqual(
  senseBank.lookup("about +數字").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["about + number:pattern:adverb:大約 + 數字"]
);
assert.deepStrictEqual(
  senseBank.lookup("as + 句子").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["as + clause:pattern:conjunction:因為 / 正如 / 當 / 隨著"]
);
assert.deepStrictEqual(
  senseBank.lookup("as + 名詞").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["as + noun:pattern:preposition:作為"]
);
assert.deepStrictEqual(
  senseBank.lookup("as far as ... be concerned").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["as far as ... is concerned:phrase:preposition:就...而言"]
);
assert.deepStrictEqual(
  senseBank.lookup("are bound to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["be bound to:phrase:verb:肯定會 / 必定"]
);
assert.deepStrictEqual(
  senseBank.lookup("commit to ving").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["commit to:phrase:verb:承諾 / 致力於"]
);
assert.deepStrictEqual(
  senseBank.lookup("cost you an arm and a leg").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["cost an arm and a leg:phrase:verb:非常昂貴"]
);
assert.deepStrictEqual(
  senseBank.lookup("a sense of safety").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:安全感"]
);
assert.deepStrictEqual(
  senseBank.lookup("and so on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:等等"]
);
assert.deepStrictEqual(
  senseBank.lookup("ancestors").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["ancestor:noun:祖先"]
);
assert.deepStrictEqual(
  senseBank.lookup("audiences").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["audience:noun:觀眾", "audience:noun:聽眾"]
);
assert.deepStrictEqual(
  senseBank.lookup("a defining victory").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:決定性的勝利"]
);
assert.deepStrictEqual(
  senseBank.lookup("a quarter of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:determiner:四分之一"]
);
assert.deepStrictEqual(
  senseBank.lookup("a soaring trend").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:快速上升的趨勢"]
);
assert.deepStrictEqual(
  senseBank.lookup("as is so often the case").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["as is often the case:phrase:adverb:正如多數情況一樣"]
);
assert.deepStrictEqual(
  senseBank.lookup("as the name suggests").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["as its name suggests:phrase:adverb:顧名思義"]
);
assert.deepStrictEqual(
  senseBank.lookup("association between a and b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["association between A and B:phrase:noun:A和B之間的關係"]
);
assert.deepStrictEqual(
  senseBank.lookup("be convinced that").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:深信"]
);
assert.deepStrictEqual(
  senseBank.lookup("be ingrained in").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:根深蒂固於"]
);
assert.deepStrictEqual(
  senseBank.lookup("be that as it may").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:話雖如此"]
);
assert.deepStrictEqual(
  senseBank.lookup("be willing to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:願意"]
);
assert.deepStrictEqual(
  senseBank.lookup("boom = burgeon").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["boom / burgeon:pattern:verb:迅速發展"]
);
assert.deepStrictEqual(
  senseBank.lookup("binge-").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:adverb:狂... / 過度..."]
);
assert.deepStrictEqual(
  senseBank.lookup("campaigns").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["campaign:noun:活動", "campaign:noun:運動"]
);
assert.deepStrictEqual(
  senseBank.lookup("candidates").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["candidate:noun:候選人", "candidate:noun:參加者"]
);
assert.deepStrictEqual(
  senseBank.lookup("colleagues").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["colleague:noun:同事"]
);
assert.deepStrictEqual(
  senseBank.lookup("concerns").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["concern:noun:擔憂 / 關注"]
);
assert.deepStrictEqual(
  senseBank.lookup("confusion").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:困惑", "noun:混亂"]
);
assert.deepStrictEqual(
  senseBank.lookup("consideration").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:考慮", "noun:體諒 / 顧及"]
);
assert.deepStrictEqual(
  senseBank.lookup("construction").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:建造 / 施工", "noun:建築物 / 結構"]
);
assert.deepStrictEqual(
  senseBank.lookup("consumption").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:消耗", "noun:消費"]
);
assert.deepStrictEqual(
  senseBank.lookup("contest").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:比賽 / 競賽", "verb:爭辯 / 質疑"]
);
assert.deepStrictEqual(
  senseBank.lookup("contribute").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:貢獻 / 捐助", "verb:促成 / 是原因之一"]
);
assert.deepStrictEqual(
  senseBank.lookup("coverage").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:新聞報道", "noun:覆蓋範圍"]
);
assert.deepStrictEqual(
  senseBank.lookup("crack").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:裂縫", "verb:破裂 / 裂開", "verb:破解 / 解決"]
);
assert.deepStrictEqual(
  senseBank.lookup("craft").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:手藝 / 工藝", "noun:船 / 飛行器", "verb:精心製作"]
);
assert.deepStrictEqual(
  senseBank.lookup("creation").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:創造 / 創作", "noun:創作品"]
);
assert.deepStrictEqual(
  senseBank.lookup("can hardly").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:modal:幾乎不能"]
);
assert.deepStrictEqual(
  senseBank.lookup("commit mistakes").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["commit a mistake:phrase:verb:犯錯"]
);
assert.deepStrictEqual(
  senseBank.lookup("canopy").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:遮篷 / 樹冠"]
);
assert.deepStrictEqual(
  senseBank.lookup("capture the hearts and minds of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:俘獲...的心"]
);
assert.deepStrictEqual(
  senseBank.lookup("celebration events").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["celebration event:phrase:noun:慶祝活動"]
);
assert.deepStrictEqual(
  senseBank.lookup("characteristics").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  [
    "characteristic:noun:特徵",
    "characteristic:noun:特點"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("chains").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["chain:noun:連鎖店"]
);
assert.deepStrictEqual(
  senseBank.lookup("charts").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["chart:noun:圖表"]
);
assert.deepStrictEqual(
  senseBank.lookup("cheeks").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["cheek:noun:臉頰"]
);
assert.deepStrictEqual(
  senseBank.lookup("circumstances").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["circumstance:noun:情況 / 環境"]
);
assert.deepStrictEqual(
  senseBank.lookup("cruise ship").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:郵輪 / 遊輪"]
);
assert.deepStrictEqual(
  senseBank.lookup("claim .... lives").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["claim lives:phrase:verb:奪去生命"]
);
assert.deepStrictEqual(
  senseBank.lookup("called").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:叫做 / 稱為", "verb:call 的過去式 / PP"]
);
assert.deepStrictEqual(
  senseBank.lookup("colleagues").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["colleague:noun:同事"]
);
assert.deepStrictEqual(
  senseBank.lookup("color").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["color:noun:顏色"]
);
assert.deepStrictEqual(
  senseBank.lookup("cubs").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:幼獸"]
);
assert.deepStrictEqual(
  senseBank.lookup("civilization").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["civilization:noun:文明"]
);
assert.deepStrictEqual(
  senseBank.lookup("cucumber").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:青瓜 / 黃瓜"]
);
assert.deepStrictEqual(
  senseBank.lookup("cutting edge").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:尖端 / 最前沿"]
);
assert.deepStrictEqual(
  senseBank.lookup("cutting-edge").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:尖端的 / 最先進的"]
);
assert.deepStrictEqual(
  senseBank.lookup("diploma").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:文憑"]
);
assert.deepStrictEqual(
  senseBank.lookup("dubious").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:可疑的 / 不可靠的"]
);
assert.deepStrictEqual(
  senseBank.lookup("dull / dreary").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:沉悶的"]
);
assert.deepStrictEqual(
  senseBank.lookup("each other").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:pronoun:互相 / 彼此"]
);
assert.deepStrictEqual(
  senseBank.lookup("eating habits").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["eating habit:phrase:noun:飲食習慣"]
);
assert.deepStrictEqual(
  senseBank.lookup("effect on").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["effect on:phrase:noun:對...的影響"]
);
assert.deepStrictEqual(
  senseBank.lookup("have an effect on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:對...有影響"]
);
assert.deepStrictEqual(
  senseBank.lookup("have an impact on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:對...有影響 / 對...有衝擊"]
);
assert.deepStrictEqual(
  senseBank.lookup("efforts").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["effort:noun:努力"]
);
assert.deepStrictEqual(
  senseBank.lookup("enable...to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["enable ... to:phrase:verb:使...能夠"]
);
assert.deepStrictEqual(
  senseBank.lookup("establishments").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["establishment:noun:公司 / 機構"]
);
assert.deepStrictEqual(
  senseBank.lookup("experts").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["expert:noun:專家"]
);
assert.deepStrictEqual(
  senseBank.lookup("express ... condolence").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["express condolence:phrase:verb:表達慰問 / 弔唁"]
);
assert.deepStrictEqual(
  senseBank.lookup("food critics").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["food critic:phrase:noun:食評家"]
);
assert.deepStrictEqual(
  senseBank.lookup("fun-filling").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["fun-filled:phrase:adjective:充滿樂趣的"]
);
assert.deepStrictEqual(
  senseBank.lookup("gen-zers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Gen-Zer:phrase:noun:Z世代的人"]
);
assert.deepStrictEqual(
  senseBank.lookup("get trapped in the vicious cycle of a and b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["get trapped in the vicious cycle of A and B:phrase:verb:陷入 A 和 B 的惡性循環"]
);
assert.deepStrictEqual(
  senseBank.lookup("go goblin mode").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["go all-out:phrase:verb:放飛自我 / 盡情放鬆"]
);
assert.deepStrictEqual(
  senseBank.lookup("has been to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:auxiliary:去過..."]
);
assert.deepStrictEqual(
  senseBank.lookup("have been adj/n").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["have been + noun/adjective:pattern:auxiliary:一直是 / 已經是"]
);
assert.deepStrictEqual(
  senseBank.lookup("have pp").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["have + pp:pattern:auxiliary:已經... / ...過"]
);
assert.deepStrictEqual(
  senseBank.lookup("have you ever wondered").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:auxiliary:你有沒有想過"]
);
assert.deepStrictEqual(
  senseBank.lookup("have a sweet tooth").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:喜歡甜食"]
);
assert.deepStrictEqual(
  senseBank.lookup("honor").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:榮譽"]
);
assert.deepStrictEqual(
  senseBank.lookup("hustle and bustle").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:繁忙喧鬧 / 熙來攘往"]
);
assert.deepStrictEqual(
  senseBank.lookup("i").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["I:pronoun:我"]
);
assert.deepStrictEqual(
  senseBank.lookup("indian cuisine").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Indian cuisine:phrase:noun:印度菜"]
);
assert.deepStrictEqual(
  senseBank.lookup("in stock").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:有存貨"]
);
assert.deepStrictEqual(
  senseBank.lookup("intricate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:複雜的 / 精細的"]
);
assert.deepStrictEqual(
  senseBank.lookup("is made up of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:由...組成"]
);
assert.deepStrictEqual(
  senseBank.lookup("it appears that").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:conjunction:似乎..."]
);
assert.deepStrictEqual(
  senseBank.lookup("it doesn't matter").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:auxiliary:沒關係 / 無所謂"]
);
assert.deepStrictEqual(
  senseBank.lookup("it was not until").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["It was not until:pattern:conjunction:直到...才"]
);
assert.deepStrictEqual(
  senseBank.lookup("look for").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:尋找"]
);
assert.deepStrictEqual(
  senseBank.lookup("long to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["long for:phrase:verb:渴望"]
);
assert.deepStrictEqual(
  senseBank.lookup("monetary returns").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["monetary return:phrase:noun:金錢回報"]
);
assert.deepStrictEqual(
  senseBank.lookup("newlyweds").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:新人 / 新婚夫婦"]
);
assert.deepStrictEqual(
  senseBank.lookup("niche").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:小眾市場 / 合適位置", "adjective:小眾的"]
);
assert.deepStrictEqual(
  senseBank.lookup("no matter + 假問句").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["no matter + question word:pattern:conjunction:無論..."]
);
assert.deepStrictEqual(
  senseBank.lookup("not bother to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:懶得"]
);
assert.deepStrictEqual(
  senseBank.lookup("numeracy").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:計算能力 / 數學能力"]
);
assert.deepStrictEqual(
  senseBank.lookup("on a daily basis").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:每天"]
);
assert.deepStrictEqual(
  senseBank.lookup("one another").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:pronoun:彼此 / 互相"]
);
assert.deepStrictEqual(
  senseBank.lookup("ought to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:modal:應該"]
);
assert.deepStrictEqual(
  senseBank.lookup("particularly / especially / in particular").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:尤其是 / 特別是"]
);
assert.deepStrictEqual(
  senseBank.lookup("poached egg").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:水波蛋"]
);
assert.deepStrictEqual(
  senseBank.lookup("price-cautious").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:重視價錢的"]
);
assert.deepStrictEqual(
  senseBank.lookup("property value").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:物業價值"]
);
assert.deepStrictEqual(
  senseBank.lookup("quarrel").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:爭吵 / 吵架", "noun:爭吵 / 吵架"]
);
assert.deepStrictEqual(
  senseBank.lookup("center").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:中心", "verb:集中於", "verb:以...為中心"]
);
assert.deepStrictEqual(
  senseBank.lookup("centre").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:中心", "verb:集中於", "verb:以...為中心"]
);
assert.deepStrictEqual(
  senseBank.lookup("theatre").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:劇場", "noun:戲院"]
);
assert.deepStrictEqual(
  senseBank.lookup("labor").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:勞動", "noun:勞工"]
);
assert.deepStrictEqual(
  senseBank.lookup("defense").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:防衛", "noun:防守", "noun:辯護"]
);
assert.deepStrictEqual(
  senseBank.lookup("defence").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:防衛", "noun:防守", "noun:辯護"]
);
assert.deepStrictEqual(
  senseBank.lookup("license").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:牌照", "noun:許可證", "verb:批准", "verb:發牌"]
);
assert.deepStrictEqual(
  senseBank.lookup("licence").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:牌照", "noun:許可證"]
);
assert.deepStrictEqual(
  senseBank.lookup("agency").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:機構", "noun:代理公司"]
);
assert.deepStrictEqual(
  senseBank.lookup("aggressive").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:有攻擊性的", "adjective:進取的"]
);
assert.deepStrictEqual(
  senseBank.lookup("aim").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:目標", "noun:目的", "verb:旨在", "verb:瞄準"]
);
assert.deepStrictEqual(
  senseBank.lookup("ambition").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:抱負", "noun:雄心"]
);
assert.deepStrictEqual(
  senseBank.lookup("ambitious").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:有抱負的", "adjective:有雄心的"]
);
assert.deepStrictEqual(
  senseBank.lookup("arrest").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:逮捕", "noun:拘捕", "verb:逮捕", "verb:拘捕"]
);
assert.deepStrictEqual(
  senseBank.lookup("artificial").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:人工的", "adjective:人造的"]
);
assert.deepStrictEqual(
  senseBank.lookup("associate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:聯想", "verb:聯繫", "adjective:副的", "adjective:相關的"]
);
assert.deepStrictEqual(
  senseBank.lookup("association").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:協會", "noun:關聯"]
);
assert.deepStrictEqual(
  senseBank.lookup("assure").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:保證", "verb:使...相信"]
);
assert.deepStrictEqual(
  senseBank.lookup("authority").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:權威", "noun:權力", "noun:當局", "noun:官方機構"]
);
assert.deepStrictEqual(
  senseBank.lookup("barrier").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:屏障", "noun:障礙"]
);
assert.deepStrictEqual(
  senseBank.lookup("blame").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:責任", "noun:責備", "verb:責怪", "verb:指責"]
);
assert.deepStrictEqual(
  senseBank.lookup("boost").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:提升", "noun:幫助", "verb:提升", "verb:促進"]
);
assert.deepStrictEqual(
  senseBank.lookup("broadcast").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:廣播節目", "verb:廣播", "verb:播放"]
);
assert.deepStrictEqual(
  senseBank.lookup("cabin").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:機艙", "noun:船艙", "noun:小屋"]
);
assert.deepStrictEqual(
  senseBank.lookup("program").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:節目", "noun:程式", "noun:計劃", "verb:編寫程式"]
);

console.log("vocab_sense_bank tests passed");
