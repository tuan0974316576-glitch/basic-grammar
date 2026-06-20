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
  ["aware of", "ph. 意識到 / 知道"],
  ["a boon", "ph. 好事 / 有益的事"],
  ["a case in point", "ph. 一個好例子"],
  ["a fraction of", "ph. 一小部分"],
  ["a great deal of", "ph. 大量 / 很多（不可數）"],
  ["a handful of", "ph. 一小撮 / 少量"],
  ["a host of", "ph. 大量 / 許多"],
  ["a number of", "ph. 幾個 / 一些"],
  ["a staggering", "ph. 驚人的 / 大得驚人的"],
  ["a whopping", "ph. 大得驚人的"],
  ["a wide range of", "ph. 各式各樣的 / 不同種類的"],
  ["a wide variety of", "ph. 各式各樣的 / 不同種類的"],
  ["abandon", "v. 放棄 / 遺棄"],
  ["absorbed in", "ph. 全神貫注於"],
  ["access to", "ph. 使用 / 接觸 / 取得...的機會"],
  ["achilles' heel", "ph. 弱點 / 致命弱點"],
  ["acquainted with", "ph. 熟悉"],
  ["acquire", "v. 獲得 / 取得"],
  ["acquire", "v. 收購"],
  ["adopt", "v. 採用 / 領養"],
  ["advanced", "adj. 先進的 / 進階的"],
  ["Africa", "n. 非洲"],
  ["aggressive", "adj. 有攻擊性的 / 進取的"],
  ["agency", "n. 中介公司 / 機構"],
  ["aim at", "ph. 旨在 / 目標是"],
  ["aim to", "ph. 旨在 / 目的是"],
  ["akin to", "ph. 類似於 / 像"],
  ["albeit", "conj. 雖然"],
  ["alternative", "n. 替代品 / 選擇"],
  ["alternative", "adj. 另一選擇的 / 替代的"],
  ["amazing", "adj. 令人驚嘆的 / 精彩的"],
  ["Americano", "n. 美式咖啡"],
  ["amid", "prep. 在...當中"],
  ["among", "prep. 在...之中 / 在...之間"],
  ["ample", "adj. 充足的 / 足夠的"],
  ["amusing", "adj. 有趣的 / 好笑的"],
  ["ancient", "adj. 古代的 / 古老的"],
  ["anticipate", "v. 預期 / 預計"],
  ["anything but", "ph. 絕不 / 絕不是"],
  ["apathetic to", "ph. 對...冷漠 / 不關心"],
  ["appealing", "adj. 有吸引力的"],
  ["appropriate", "adj. 合適的 / 恰當的"],
  ["archaeologist", "n. 考古學家"],
  ["archaelogist", "n. 考古學家"],
  ["architect", "n. 建築師"],
  ["artchitect", "n. 建築師"],
  ["artificial", "adj. 人工的 / 人造的"],
  ["assemble", "v. 組裝 / 集合"],
  ["associated with", "ph. 與...有關 / 與...相關"],
  ["association", "n. 協會 / 關係 / 關聯"],
  ["assure", "v. 令...相信 / 保證"],
  ["astonishing", "adj. 令人驚訝的 / 震驚的"],
  ["at first glance", "ph. 乍看之下 / 第一眼看來"],
  ["at stake", "ph. 危在旦夕 / 有風險"],
  ["authority", "n. 權威 / 當局 / 權力"],
  ["authentic", "adj. 真正的 / 正宗的"],
  ["axe", "v. 裁員 / 解僱"],
  ["barely", "adv. 幾乎不 / 勉強"],
  ["bargain", "n. 便宜貨 / 划算的交易"],
  ["bargain", "v. 講價"],
  ["barrel", "n. 桶 / 圓桶"],
  ["barrier", "n. 屏障 / 障礙"],
  ["base", "n. 基地 / 基礎"],
  ["be", "v. 是 / 成為"],
  ["be about to", "ph. 即將 / 快將"],
  ["be absorbed in", "ph. 全神貫注於"],
  ["be afflicted with", "ph. 患有 / 受...折磨"],
  ["be capable of", "ph. 有能力 / 能夠"],
  ["be committed to ving", "ph. 致力於 / 承諾"],
  ["be connected with nature", "ph. 接觸大自然 / 與大自然接觸"],
  ["be dedicated to", "ph. 致力於 / 投入"],
  ["be destined to", "ph. 註定會"],
  ["be drawn to", "ph. 被...吸引 / 對...著迷"],
  ["be inclined to", "ph. 傾向於"],
  ["be ingrained in", "ph. 根深蒂固於"],
  ["be poised to", "ph. 即將 / 準備好"],
  ["be put down to", "ph. 歸因於"],
  ["be put down on", "ph. 歸因於"],
  ["be wary of", "ph. 提防 / 警惕"],
  ["beaver", "n. 海狸"],
  ["because", "conj. 因為"],
  ["because of", "ph. 因為"],
  ["beef up", "ph. 加強 / 增強"],
  ["beneficial", "adj. 有益的"],
  ["benevolent", "adj. 仁慈的 / 慈善的"],
  ["besides", "adv. 此外"],
  ["besides", "prep. 除了...之外"],
  ["bestie", "n. 好朋友 / 閨密"],
  ["between...and...", "pt. 在...與...之間"],
  ["beyond", "prep. 超出 / 超越"],
  ["beyond", "adv. 不單止"],
  ["beyond a shadow of a doubt", "ph. 毫無疑問 / 無可置疑"],
  ["biceps", "n. 二頭肌"],
  ["billboard", "n. 廣告牌"],
  ["binary", "adj. 二元的 / 二進制的"],
  ["biodiversity", "n. 生物多樣性"],
  ["brand new", "ph. 全新的"],
  ["bland new", "ph. 全新的"],
  ["blessing", "n. 祝福"],
  ["blind", "adj. 盲的 / 失明的"],
  ["blip", "n. 短暫問題 / 小波動"],
  ["blistering hot", "ph. 酷熱的 / 極熱"],
  ["blockbuster", "n. 賣座電影 / 大片"],
  ["bloom", "v. 開花"],
  ["blossom", "v. 開花"],
  ["blossom", "n. 花朵"],
  ["blouse", "n. 女裝上衣"],
  ["blue", "adj. 藍色的"],
  ["blue", "adj. 憂鬱的 / 失落的"],
  ["blur", "v. 使模糊 / 變模糊"],
  ["boast", "v. 吹噓 / 擁有"],
  ["bolster", "v. 支持 / 加強"],
  ["bombard", "v. 轟炸 / 不斷提問"],
  ["booth", "n. 攤位 / 小隔間"],
  ["both...and", "pt. 兩者都"],
  ["branch", "n. 分店 / 分支 / 樹枝"],
  ["brand", "n. 品牌"],
  ["bravo", "exclam. 好極了"],
  ["Brazil", "n. 巴西"],
  ["breach", "v. 違反 / 破壞"],
  ["breadwinner", "n. 養家的人 / 經濟支柱"],
  ["break the bank", "ph. 花很多錢 / 很貴"],
  ["break your bank", "ph. 花很多錢 / 很貴"],
  ["breakthrough", "n. 突破"],
  ["breakthough", "n. 突破"],
  ["breed", "n. 品種"],
  ["breed", "v. 繁殖"],
  ["breeds", "n. 品種"],
  ["breeze", "n. 微風"],
  ["bribery", "n. 行賄 / 賄賂"],
  ["brick-and-mortar", "ph. 實體店的 / 實體的"],
  ["brim with", "ph. 充滿"],
  ["brisk", "adj. 輕快的 / 清爽的"],
  ["broadcast", "v. 廣播 / 播放"],
  ["broadcast", "n. 廣播節目"],
  ["brochure", "n. 小冊子 / 宣傳冊"],
  ["bronze", "n. 青銅"],
  ["bronze", "adj. 銅色的"],
  ["browse", "v. 瀏覽"],
  ["brutal", "adj. 殘暴的 / 殘酷的"],
  ["bucket list", "ph. 死前願望清單"],
  ["budding", "adj. 新晉的 / 發展中的"],
  ["buddy", "n. 朋友 / 夥伴"],
  ["buffet", "n. 自助餐"],
  ["bulky", "adj. 笨重的 / 大件的"],
  ["bureau", "n. 局 / 辦事處"],
  ["burrito", "n. 墨西哥卷"],
  ["blender", "n. 攪拌機"],
  ["bouncy", "adj. 有彈性的 / 彈跳的"],
  ["by", "prep. 由 / 被 / 靠近"],
  ["by far", "ph. 到目前為止 / 遠遠地"],
  ["by leaps and bounds", "ph. 突飛猛進 / 快速地"]
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
assert.deepStrictEqual(labels("as well as 在句子開頭"), [], "lesson note should not be exposed as a vocab item");
assert.ok(
  !labels("anything but").some((label) => label.includes("絕對是")),
  "anything but should not show the opposite meaning"
);
assert.ok(
  !labels("absorbed in").some((label) => label.includes("全神異注")),
  "absorbed in should not show typo meanings"
);
assert.ok(
  !labels("associated with").some((label) => label.includes(".與")),
  "associated with should not show punctuation noise"
);
assert.ok(
  !labels("ample").some((label) => label.startsWith("n.")),
  "ample should not be shown as a noun"
);
assert.ok(
  !labels("amusing").some((label) => label.includes("amusement park")),
  "amusing should not include example fragments as meanings"
);
assert.ok(
  !labels("among").some((label) => label.includes("有...之間") || label.includes("在..當中")),
  "among should not show broken punctuation or wrong Chinese"
);
assert.ok(
  !labels("axe").some((label) => label.includes("解雇")),
  "axe should use Traditional Chinese 解僱"
);
assert.deepStrictEqual(labels("b"), [], "b should not be exposed as a vocabulary word");
assert.deepStrictEqual(labels("be a to"), [], "broken abbreviation be a to should not be exposed");
assert.deepStrictEqual(labels("be b t"), [], "broken abbreviation be b t should not be exposed");
assert.deepStrictEqual(labels("be c of"), [], "broken abbreviation be c of should not be exposed");
assert.deepStrictEqual(labels("be put down on").filter((label) => !label.includes("歸因於")), [], "be put down on should only resolve to the corrected phrase");
assert.ok(
  !labels("bargain").some((label) => label === "n. 講價"),
  "bargain should not show verb meanings as noun-only choices"
);
assert.ok(
  !labels("be").some((label) => label.includes("習慣") || label.includes("話雖如此")),
  "be should not inherit phrase meanings from broken rows"
);
assert.ok(
  !labels("base").some((label) => label.startsWith("adv.")),
  "base should not be shown as an adverb"
);
assert.ok(
  !labels("beef up").some((label) => label.includes("落後")),
  "beef up should not show the opposite meaning"
);
assert.ok(
  !labels("biodiversity").some((label) => label.startsWith("adj.")),
  "biodiversity should be a noun"
);
assert.ok(
  !labels("blip").some((label) => label.includes("雪花")),
  "blip should not include noisy arrow notes"
);
assert.ok(
  !labels("by far").some((label) => label.includes("到目到")),
  "by far should not show typo meanings"
);
assert.deepStrictEqual(labels("budding / aspiring"), [], "combined example fragment should not be exposed");

console.log("teacher_vocab_bank_quality tests passed");
