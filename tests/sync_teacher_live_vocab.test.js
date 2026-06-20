const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sync = require("../scripts/sync-teacher-live-vocab.js");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "teacher-live-sync-test-"));

const promotePlanPath = path.join(tmpDir, "teacher_vocab_promote_plan_highvalue_0000.json");
fs.writeFileSync(promotePlanPath, JSON.stringify({
  meta: { source: "review-xlsx" },
  entries: [
    {
      word: "almond",
      display: "almond",
      pos: "n.",
      type: "word",
      meaning: "杏仁",
      promoteTo: "teacher",
      level: "A2"
    },
    {
      word: "jump over the moon",
      pos: "v.",
      type: "phrase",
      meaning: "跳過月亮",
      promoteTo: "curated"
    }
  ]
}, null, 2));

const loadedPlan = sync.loadTeacherLiveEntries(promotePlanPath);
assert.strictEqual(loadedPlan.inputKind, "promote-plan");
assert.strictEqual(loadedPlan.sourceEntryCount, 1);
assert.strictEqual(loadedPlan.entries.length, 1);
assert.strictEqual(loadedPlan.entries[0].word, "almond");
assert.strictEqual(loadedPlan.entries[0].pos, "noun");
assert.strictEqual(loadedPlan.entries[0].type, "word");
assert.strictEqual(loadedPlan.entries[0].meaning, "杏仁");
assert.ok(loadedPlan.entries[0].id.startsWith("almond-noun-"));

const manualUpdatesPath = path.join(tmpDir, "teacher_vocab_manual_updates.json");
fs.writeFileSync(manualUpdatesPath, JSON.stringify({
  meta: { lesson: "Test" },
  entries: [
    {
      word: "have to",
      pos: "modal v.",
      type: "word",
      meaning: "必須 / 要",
      aliases: ["must"]
    },
    {
      word: "have to",
      pos: "modal v.",
      type: "word",
      meaning: "必須 / 要",
      aliases: ["must"]
    }
  ]
}, null, 2));

const loadedManual = sync.loadTeacherLiveEntries(manualUpdatesPath);
assert.strictEqual(loadedManual.inputKind, "teacher-updates");
assert.strictEqual(loadedManual.sourceEntryCount, 2);
assert.strictEqual(loadedManual.entries.length, 1);
assert.strictEqual(loadedManual.entries[0].type, "word");
assert.strictEqual(loadedManual.entries[0].source, "reviewed-teacher-bank");
assert.deepStrictEqual(loadedManual.entries[0].aliases, ["must"]);

const idA = sync.makeTeacherLiveEntryId(loadedManual.entries[0]);
const idB = sync.makeTeacherLiveEntryId({ ...loadedManual.entries[0] });
assert.strictEqual(idA, idB);
assert.ok(/-[a-f0-9]{10}$/.test(idA));

const fields = sync.makeFirestoreFields(loadedManual.entries[0], new Date("2026-06-21T00:00:00.000Z"));
assert.strictEqual(fields.word.stringValue, "have to");
assert.strictEqual(fields.meaning.stringValue, "必須 / 要");
assert.strictEqual(fields.type.stringValue, "word");
assert.strictEqual(fields.disabled.booleanValue, false);
assert.strictEqual(fields.updatedAt.timestampValue, "2026-06-21T00:00:00.000Z");

const write = sync.makeFirestoreWrite(loadedManual.entries[0], "test-project", new Date("2026-06-21T00:00:00.000Z"));
assert.ok(write.update.name.includes("/teacherVocabLive/"));
assert.ok(write.updateMask.fieldPaths.includes("word"));
assert.ok(write.updateMask.fieldPaths.includes("updatedAt"));

sync.syncTeacherLiveVocab({
  input: manualUpdatesPath,
  project: "test-project",
  write: false
}).then((summary) => {
  assert.strictEqual(summary.uploadEntryCount, 1);
  assert.strictEqual(summary.write, false);
  assert.strictEqual(summary.sample[0].word, "have to");
  console.log("sync_teacher_live_vocab tests passed");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
