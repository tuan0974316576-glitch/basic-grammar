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

console.log("teacher_live_vocab tests passed");
