const assert = require("assert");
const dedupe = require("../scripts/vocab-meaning-dedupe.js");
const liveCleanup = require("../scripts/clean-teacher-live-vocab.js");

const result = dedupe.findMeaningDuplicatePlan([
  { id: "massive-small", word: "massive", pos: "adjective", type: "word", meaning: "巨大的" },
  { id: "massive-kept", word: "massive", pos: "adjective", type: "word", meaning: "巨大的 / 大量的" },
  { id: "order-command", word: "order", pos: "noun", type: "word", meaning: "命令" },
  { id: "order-sequence", word: "order", pos: "noun", type: "word", meaning: "次序" },
  { id: "order-kept", word: "order", pos: "noun", type: "word", meaning: "次序 / 命令 / 訂單" },
  { id: "order-verb", word: "order", pos: "verb", type: "word", meaning: "命令" },
  { id: "exact-old", word: "swiftly", pos: "adverb", type: "word", meaning: "迅速地", aliases: ["quickly"] },
  { id: "exact-new", word: "swiftly", pos: "adverb", type: "word", meaning: "迅速地", updatedAt: 10 },
  { id: "comma-small", word: "endure", type: "word", meaning: "忍受, 持續" },
  { id: "comma-kept", word: "endure", type: "word", meaning: "經歷 / 忍受 / 持續" }
]);

assert.deepStrictEqual(result.removed.map((entry) => `${entry.id}:${entry.reason}`).sort(), [
  "comma-small:meaning-subset",
  "exact-old:exact-meaning",
  "massive-small:meaning-subset",
  "order-command:meaning-subset",
  "order-sequence:meaning-subset"
]);
assert.deepStrictEqual(result.entries.map((entry) => entry.id).sort(), [
  "comma-kept",
  "exact-new",
  "massive-kept",
  "order-kept",
  "order-verb"
]);

const exactSurvivor = result.entries.find((entry) => entry.word === "swiftly");
assert.deepStrictEqual(exactSurvivor.aliases, ["quickly"]);
assert.ok(liveCleanup.makeDisableWrite({ id: "massive-small", keptId: "massive-kept" }, "test-project")
  .update.name.endsWith("/teacherVocabLive/massive-small"));
assert.strictEqual(liveCleanup.parseArgs(["--write", "--project", "test-project"]).write, true);

console.log("vocab_meaning_dedupe tests passed");
