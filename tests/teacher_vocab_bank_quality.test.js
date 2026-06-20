const assert = require("assert");

delete require.cache[require.resolve("../teacher_vocab_bank.js")];
delete require.cache[require.resolve("../teacher_vocab.js")];
const teacherVocab = require("../teacher_vocab.js");

function labels(word) {
  return teacherVocab.lookup(word, { exactOnly: true, limit: 24 })
    .map(teacherVocab.getEntryLabel);
}

function assertIncludes(word, expected) {
  const actual = labels(word);
  assert.ok(
    actual.includes(expected),
    `Expected ${word} to include "${expected}", got: ${actual.join(" | ")}`
  );
}

[
  ["may", "modal v. 可能 / 可以"],
  ["will", "modal v. 將會"],
  ["should", "modal v. 應該"],
  ["apply", "v. 申請"],
  ["apply", "v. 應用 / 使用"],
  ["content", "n. 內容"],
  ["content", "adj. 滿意的"],
  ["course", "n. 課程"],
  ["figure", "n. 數字"],
  ["lead", "v. 帶領 / 引導"],
  ["project", "n. 專題 / 項目"],
  ["address", "n. 地址"],
  ["address", "v. 處理 / 應付"],
  ["refuse", "v. 拒絕"],
  ["charge", "v. 充電"],
  ["state", "v. 說明 / 陳述"],
  ["sound", "n. 聲音"],
  ["sound", "v. 聽起來"],
  ["raise", "v. 籌集"],
  ["conduct", "n. 行為"],
  ["term", "n. 學期"],
  ["spring", "v. 跳起"],
  ["run", "v. 跑"],
  ["set", "n. 一套"],
  ["work", "v. 運作"],
  ["change", "n. 零錢"],
  ["turn", "n. 輪流 / 次序"],
  ["break", "n. 小休 / 休息"],
  ["deal with", "ph. 處理"],
  ["object", "v. 反對"],
  ["plant", "n. 工廠"],
  ["fall", "n. 秋天"],
  ["lie", "n. 謊言"],
  ["permit", "n. 許可證"],
  ["abuse", "v. 濫用 / 虐待"],
  ["access", "n. 使用權 / 途徑"],
  ["account for", "ph. 佔 / 解釋 / 是...原因"],
  ["acquaintance", "n. 熟人"],
  ["advocate", "v. 提倡"],
  ["adovcate", "v. 提倡"],
  ["apparel", "n. 服裝 / 衣服"],
  ["appetizer", "n. 前菜 / 開胃菜"],
  ["as", "conj. 因為 / 當 / 正如"],
  ["as + 句子", "pt. 因為 / 正如 / 當 / 隨著"],
  ["as well as", "ph. 除了...之外"],
  ["attribute", "v. 歸因於"],
  ["backlash", "n. 強烈反對 / 反彈"],
  ["bark", "v. 吠"],
  ["batch", "n. 一批"],
  ["be exposed to", "ph. 接觸 / 暴露於"],
  ["boost", "v. 提升 / 促進"],
  ["campaign", "v. 發起運動"],
  ["cliche", "n. 陳腔濫調 / 老生常談"],
  ["commitment", "n. 承諾 / 責任"],
  ["committment", "n. 承諾 / 責任"],
  ["concrete", "n. 混凝土"],
  ["conspicuous", "adj. 顯眼的 / 明顯的"],
  ["contribute to", "ph. 促成 / 導致 / 貢獻"],
  ["craftsmanship", "n. 手藝 / 工藝"],
  ["criteria", "n. 標準 / 準則"],
  ["cuisine", "n. 菜式 / 菜系"],
  ["customs", "n. 海關"],
  ["customs", "n. 習俗"],
  ["can", "modal v. 可以 / 能夠"],
  ["could", "modal v. 可以 / 可能"],
  ["must", "modal v. 必須"],
  ["would", "modal v. 會 / 願意"],
  ["might", "modal v. 可能"],
  ["ought to", "modal v. 應該"],
  ["won't", "modal v. 不會 / 將不會"],
  ["wont", "modal v. 不會 / 將不會"],
  ["swift", "adj. 迅速的 / 敏捷的"],
  ["delicacy", "n. 佳餚"],
  ["delicacy", "n. 精緻 / 微妙"],
  ["game", "n. 遊戲 / 比賽"],
  ["game", "n. 野味"],
  ["guts", "n. 膽量 / 勇氣"],
  ["deadly", "adj. 致命的"],
  ["decent", "adj. 不錯的 / 體面的"],
  ["decline", "v. 下降 / 衰退 / 拒絕"],
  ["develop", "v. 發展 / 患上"],
  ["diligent", "adj. 勤奮的"],
  ["destination", "n. 目的地"],
  ["domestic", "adj. 家庭的 / 本地的"],
  ["elaborate", "v. 詳細說明"],
  ["feature", "n. 特色 / 特徵"],
  ["feature", "v. 以...為特色 / 由...主演"],
  ["figure out", "ph. 理解 / 想出 / 找出"],
  ["gather", "v. 聚集 / 收集"],
  ["host", "n. 主持人 / 主人"],
  ["host", "v. 主持 / 舉辦"],
  ["I", "pron. 我"],
  ["in", "prep. 在...裡 / 在...期間"],
  ["it", "pron. 它 / 牠 / 這件事"],
  ["imply", "v. 暗示"],
  ["importance", "n. 重要性"],
  ["interest", "n. 興趣"],
  ["interest", "n. 利益"],
  ["issue", "n. 問題 / 議題"],
  ["issue", "v. 發出 / 發布"],
  ["just", "adv. 只是 / 剛剛"],
  ["just", "adj. 公正的"],
  ["key", "n. 關鍵"],
  ["key", "adj. 重要的 / 關鍵的"],
  ["kind", "n. 種類"],
  ["kind", "adj. 友善的"],
  ["last", "adj. 最後的 / 上一個的"],
  ["last", "v. 持續"],
  ["light", "n. 光 / 燈"],
  ["light", "adj. 輕的 / 淺色的"],
  ["like", "v. 喜歡"],
  ["like", "prep. 像"],
  ["likely", "adj. 可能的"],
  ["live", "v. 住 / 生活"],
  ["live", "adj. 現場直播的"],
  ["match", "n. 比賽 / 配對"],
  ["match", "v. 配對 / 相配"],
  ["mean", "v. 意思是 / 意味著"],
  ["mean", "adj. 刻薄的"],
  ["mention", "v. 提及"],
  ["model", "n. 模型 / 模特兒"],
  ["motivate", "v. 激勵 / 推動"],
  ["movement", "n. 移動 / 運動"],
  ["a", "det. 一個 / 一位"],
  ["an", "det. 一個 / 一位"],
  ["abstract", "adj. 抽象的"],
  ["abstact", "adj. 抽象的"],
  ["accommodating", "adj. 樂於助人的 / 好相處的"],
  ["accomodating", "adj. 樂於助人的 / 好相處的"],
  ["accuracy", "n. 準確性"],
  ["affect", "v. 影響"],
  ["affordable", "adj. 負擔得起的 / 價格合理的"],
  ["approach", "n. 方法 / 方式"],
  ["approach", "v. 接近 / 處理"],
  ["apporach", "n. 方法 / 方式"],
  ["apparent", "adj. 明顯的"],
  ["apparently", "adv. 顯然地 / 看來"],
  ["assembly", "n. 集會 / 組裝"],
  ["associate", "v. 聯想 / 聯繫"],
  ["associate", "adj. 副的 / 相關的"],
  ["at", "prep. 在 / 於"],
  ["around", "adv. 大約 / 在周圍"],
  ["aware of", "ph. 意識到 / 知道"]
].forEach(([word, expected]) => assertIncludes(word, expected));

assert.ok(
  !labels("apply").some((label) => label.startsWith("adv.")),
  "apply should not be shown as an adverb"
);
assert.ok(
  !labels("acquaintance").some((label) => label.includes("前所未有")),
  "acquaintance should not show a whole example sentence as a meaning"
);
assert.ok(
  !labels("swift").some((label) => label.startsWith("adv.")),
  "swift should not be shown as an adverb"
);
assert.ok(
  !labels("deadly").some((label) => label.startsWith("adv.")),
  "deadly should not be shown as an adverb"
);
assert.ok(
  !labels("destination").some((label) => label.startsWith("adv.")),
  "destination should not be shown as an adverb"
);
assert.ok(
  !labels("diligent").some((label) => label.startsWith("n.")),
  "diligent should not be shown as a noun"
);
assert.ok(
  !labels("game").every((label) => label.includes("野味")),
  "game should include the common meaning, not only the rare meat meaning"
);
assert.ok(
  !labels("in").some((label) => label.startsWith("adj.")),
  "in should not be shown as an adjective from broken Excel rows"
);
assert.ok(
  !labels("imply").some((label) => label.startsWith("adv.")),
  "imply should not be shown as an adverb"
);
assert.ok(
  !labels("importance").some((label) => label.startsWith("adj.")),
  "importance should not be shown as an adjective"
);
assert.ok(
  !labels("motivate").some((label) => label.startsWith("n.")),
  "motivate should not be shown as a noun"
);
assert.deepStrictEqual(labels("adj"), [], "adj should not be exposed as a vocabulary word");
assert.deepStrictEqual(labels("adv"), [], "adv should not be exposed as a vocabulary word");
assert.deepStrictEqual(labels("a b"), [], "broken abbreviation a b should not be exposed");
assert.ok(
  !labels("a").some((label) => label.includes("提倡") || label.includes("顯然地")),
  "a should not include meanings from broken Excel rows"
);
assert.ok(
  !labels("affect").some((label) => label.startsWith("n.")),
  "affect should not be shown as a noun for the common verb sense"
);
assert.ok(
  !labels("accuracy").some((label) => label.startsWith("adj.")),
  "accuracy should not be shown as an adjective"
);
assert.ok(
  !labels("apparent").some((label) => label.startsWith("adv.")),
  "apparent should not be shown as an adverb"
);
assert.ok(
  !labels("assembly").some((label) => label.startsWith("adv.")),
  "assembly should not be shown as an adverb"
);

console.log("teacher_vocab_bank_quality tests passed");
