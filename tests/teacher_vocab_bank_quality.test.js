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
  ["permit", "n. 許可證"]
].forEach(([word, expected]) => assertIncludes(word, expected));

assert.ok(
  !labels("apply").some((label) => label.startsWith("adv.")),
  "apply should not be shown as an adverb"
);

console.log("teacher_vocab_bank_quality tests passed");
