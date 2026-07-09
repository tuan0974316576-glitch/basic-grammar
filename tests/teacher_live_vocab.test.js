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

const unsafeNoPos = teacherLive.normalizeEntry({
  word: "academy",
  meaning: "學院",
  type: "word"
});
assert.strictEqual(teacherLive.isStudentReadyEntry(unsafeNoPos), false);
assert.strictEqual(teacherLive.getStudentReadyPos(unsafeNoPos), "");
assert.strictEqual(teacherLive.normalizeStudentReadyEntry(unsafeNoPos), null);

const unsafePlaceholder = teacherLive.normalizeEntry({
  word: "unknown",
  meaning: "待老師確認",
  pos: "n.",
  type: "word"
});
assert.strictEqual(teacherLive.isStudentReadyEntry(unsafePlaceholder), false);
assert.strictEqual(teacherLive.normalizeStudentReadyEntry(unsafePlaceholder), null);

const unsafeDisabled = teacherLive.normalizeEntry({
  word: "disabled",
  meaning: "停用的",
  pos: "adj.",
  type: "word",
  disabled: true
});
assert.strictEqual(teacherLive.isStudentReadyEntry(unsafeDisabled), false);
assert.strictEqual(teacherLive.normalizeStudentReadyEntry(unsafeDisabled), null);

const inferredVerb = teacherLive.normalizeEntry({
  word: "evaluate",
  meaning: "評估",
  type: "word"
});
assert.strictEqual(teacherLive.isStudentReadyEntry(inferredVerb), true);
assert.strictEqual(teacherLive.getStudentReadyPos(inferredVerb), "verb");
const inferredVerbStudentReady = teacherLive.normalizeStudentReadyEntry(inferredVerb);
assert.strictEqual(inferredVerbStudentReady.pos, "verb");
assert.strictEqual(inferredVerbStudentReady.level, "B1");
assert.strictEqual(inferredVerbStudentReady.source, "teacher-live");
assert.strictEqual(inferredVerbStudentReady.type, "word");

const livePayload = teacherLive.buildStudentReadyPayload({
  word: "evaluate",
  meaning: "評估",
  type: "word"
}, {
  previous: { createdAt: 1234, createdBy: "old-teacher" },
  uid: "teacher-uid",
  now: 5678
});
assert.deepStrictEqual(livePayload, {
  word: "evaluate",
  display: "evaluate",
  meaning: "評估",
  pos: "verb",
  type: "word",
  aliases: [],
  level: "",
  source: "teacher-live",
  notes: "",
  teacherExamples: [],
  disabled: false,
  createdAt: 1234,
  updatedAt: 5678,
  createdBy: "old-teacher",
  updatedBy: "teacher-uid"
});
const preservedLevelPayload = teacherLive.buildStudentReadyPayload({
  word: "evaluate",
  meaning: "評估",
  type: "word"
}, {
  previous: { level: "B2" },
  uid: "teacher-uid",
  now: 5678
});
assert.strictEqual(preservedLevelPayload.level, "B2");
assert.strictEqual(teacherLive.buildStudentReadyPayload(unsafeNoPos), null);
assert.strictEqual(teacherLive.buildStudentReadyPayload(unsafePlaceholder), null);
assert.strictEqual(teacherLive.buildStudentReadyPayload(unsafeDisabled), null);

const explicitLive = teacherLive.normalizeEntry({
  word: "corporate",
  meaning: "公司層面的",
  pos: "adj.",
  type: "word"
});
assert.strictEqual(teacherLive.isStudentReadyEntry(explicitLive), true);
assert.strictEqual(teacherLive.getStudentReadyPos(explicitLive), "adjective");
assert.strictEqual(teacherLive.normalizeStudentReadyEntry(explicitLive).level, "B1");

const liveDuplicateMatches = [
  teacherLive.normalizeStudentReadyEntry(teacherLive.normalizeEntry({
    id: "reviewed-intend-to",
    word: "intend to",
    meaning: "打算",
    pos: "v.",
    type: "phrase",
    updatedAt: 200
  })),
  teacherLive.normalizeStudentReadyEntry(teacherLive.normalizeEntry({
    id: "older-intend-to",
    word: "intend to",
    meaning: "打算",
    type: "phrase",
    updatedAt: 100
  })),
  teacherLive.normalizeStudentReadyEntry(teacherLive.normalizeEntry({
    id: "different-intend-to",
    word: "intend to",
    meaning: "意圖",
    pos: "v.",
    type: "phrase",
    updatedAt: 50
  }))
].filter(Boolean);
const dedupedLiveMatches = teacherLive.dedupeStudentReadyEntries(liveDuplicateMatches);
assert.deepStrictEqual(
  dedupedLiveMatches.map((entry) => `${entry.sourceEntryId}:${entry.pos}:${entry.meaning}`),
  [
    "reviewed-intend-to:verb:打算",
    "different-intend-to:verb:意圖"
  ]
);

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
  "all the rage::大受歡迎:phrase",
  "rise to fame:verb:成名:phrase",
  "lung cancer:noun:肺癌:phrase"
]);
assert.strictEqual(parsedBatch.errors[0].lineNumber, 12);
const allTheRage = parsedBatch.entries.find((entry) => entry.word === "all the rage");
assert.strictEqual(teacherLive.isStudentReadyEntry(allTheRage), false);
assert.strictEqual(teacherLive.normalizeStudentReadyEntry(allTheRage), null);

console.log("teacher_live_vocab tests passed");
