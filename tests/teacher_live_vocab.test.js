const assert = require("assert");

delete require.cache[require.resolve("../teacher_live_vocab.js")];
delete require.cache[require.resolve("../scripts/sync-teacher-live-vocab.js")];

const teacherLive = require("../teacher_live_vocab.js");
const sync = require("../scripts/sync-teacher-live-vocab.js");

const raw = {
  word: "Have To",
  pos: "modal v.",
  type: "word",
  meaning: " 必須／要 ",
  aliases: "must, need to",
  level: "a2",
  notes: "Austin reviewed"
};

const normalized = teacherLive.normalizeEntry(raw);
assert.strictEqual(normalized.word, "have to");
assert.strictEqual(normalized.meaning, "必須 / 要");
assert.strictEqual(normalized.pos, "modal");
assert.strictEqual(normalized.type, "word");
assert.deepStrictEqual(normalized.aliases, ["must", "need to"]);
assert.strictEqual(normalized.level, "A2");

const canonicalId = teacherLive.makeEntryId(raw);
const syncId = sync.makeTeacherLiveEntryId(raw);
assert.strictEqual(syncId, canonicalId);
assert.ok(canonicalId.startsWith("have-to-modal-"));
assert.ok(/-[a-f0-9]{10}$/.test(canonicalId));

const legacyId = teacherLive.makeLegacyAppEntryId(raw);
assert.notStrictEqual(legacyId, canonicalId);
assert.ok(legacyId.startsWith("have-to-modal-"));

assert.strictEqual(teacherLive.normalizeType("ph.", "look up"), "phrase");
assert.strictEqual(teacherLive.normalizeType("modal v.", "ought to"), "word");
assert.strictEqual(teacherLive.normalizeType("", "be+pp"), "pattern");

const compact = teacherLive.compactEntry({
  word: "apple",
  meaning: "蘋果",
  pos: "",
  aliases: [],
  type: "word"
});
assert.deepStrictEqual(compact, {
  word: "apple",
  meaning: "蘋果",
  type: "word"
});

const parsedBatch = teacherLive.parseBatchText([
  "intense 強烈的",
  "look for 尋找",
  "hawker n. 小販",
  "look for v. 尋找",
  "customer-centric\tadj.\t以顧客為中心的",
  "egg tart\t蛋撻",
  "manage to 能夠",
  "all the rage 大受歡迎",
  "rise to fame 成名",
  "lung cancer 肺癌",
  "# note only",
  "bad line"
].join("\n"), { defaultPos: "noun" });
assert.strictEqual(parsedBatch.entries.length, 10);
assert.strictEqual(parsedBatch.errors.length, 1);
assert.strictEqual(parsedBatch.skippedCount, 1);
assert.deepStrictEqual(parsedBatch.entries.map((entry) => `${entry.word}:${entry.pos}:${entry.meaning}:${entry.type}`), [
  "intense:adjective:強烈的:word",
  "look for:verb:尋找:phrase",
  "hawker:noun:小販:word",
  "look for:verb:尋找:phrase",
  "customer-centric:adjective:以顧客為中心的:word",
  "egg tart:noun:蛋撻:phrase",
  "manage to:verb:能夠:phrase",
  "all the rage:phrase:大受歡迎:phrase",
  "rise to fame:verb:成名:phrase",
  "lung cancer:noun:肺癌:phrase"
]);
assert.strictEqual(parsedBatch.errors[0].lineNumber, 12);

console.log("teacher_live_vocab tests passed");
