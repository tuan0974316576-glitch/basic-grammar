const assert = require("assert");

const audit = require("../scripts/audit-teacher-vocab.js");

const rows = audit.buildAuditRows([
  { id: "ok", word: "apple", meaning: "蘋果", pos: "noun", type: "word" },
  { id: "missing-pos", word: "run", meaning: "跑", type: "word" },
  { id: "cub-a", word: "cub", meaning: "幼仔", pos: "noun", type: "word" },
  { id: "cub-b", word: "cub", meaning: "幼獸", pos: "noun", type: "word" },
  { id: "mixed", word: "nevertheless", meaning: "然而 nevertheless", pos: "adverb", type: "word" }
]);

assert.strictEqual(rows.some((row) => row.id === "ok"), false);
assert.ok(rows.find((row) => row.id === "missing-pos").reasons.includes("missing-pos"));
assert.ok(rows.find((row) => row.id === "cub-a").reasons.includes("duplicate-near-meaning"));
assert.ok(rows.find((row) => row.id === "mixed").reasons.includes("mixed-english-in-meaning"));

assert.strictEqual(audit.meaningGroupKey("幼仔"), "young-animal");
assert.strictEqual(audit.meaningGroupKey("幼獸"), "young-animal");

console.log("audit_teacher_vocab tests passed");
