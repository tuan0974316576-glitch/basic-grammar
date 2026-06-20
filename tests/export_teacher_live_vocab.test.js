const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const exporter = require("../scripts/export-teacher-live-vocab.js");

const fields = {
  word: { stringValue: "customer-centric" },
  display: { stringValue: "customer-centric" },
  meaning: { stringValue: "以顧客為中心的" },
  pos: { stringValue: "adjective" },
  type: { stringValue: "phrase" },
  aliases: { arrayValue: { values: [{ stringValue: "customer centered" }] } },
  level: { stringValue: "B1" },
  disabled: { booleanValue: false },
  updatedAt: { timestampValue: "2026-06-21T00:00:00.000Z" },
  updatedBy: { stringValue: "teacher_001" }
};

assert.deepStrictEqual(exporter.firestoreFieldsToJs(fields), {
  word: "customer-centric",
  display: "customer-centric",
  meaning: "以顧客為中心的",
  pos: "adjective",
  type: "phrase",
  aliases: ["customer centered"],
  level: "B1",
  disabled: false,
  updatedAt: "2026-06-21T00:00:00.000Z",
  updatedBy: "teacher_001"
});

const entry = exporter.documentToEntry({
  name: "projects/test/databases/(default)/documents/teacherVocabLive/customer-centric-adjective-abc",
  fields
});
assert.strictEqual(entry.id, "customer-centric-adjective-abc");
assert.strictEqual(entry.word, "customer-centric");
assert.strictEqual(entry.meaning, "以顧客為中心的");
assert.strictEqual(entry.pos, "adjective");
assert.strictEqual(entry.type, "phrase");
assert.deepStrictEqual(entry.aliases, ["customer centered"]);

const deduped = exporter.dedupeEntries([
  entry,
  { ...entry, meaning: "以顧客為中心的" },
  { ...entry, id: "customer-centric-adjective-new", meaning: "以客戶為中心的", updatedAt: "2026-06-22T00:00:00.000Z" },
  { word: "old", meaning: "舊的", disabled: true }
]);
assert.strictEqual(deduped.length, 3);
assert.strictEqual(deduped[0].id, "customer-centric-adjective-new");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "teacher-live-export-test-"));
const out = path.join(tmpDir, "teacher_live_vocab_snapshot.json");
const csv = path.join(tmpDir, "teacher_live_vocab_snapshot.csv");

exporter.exportTeacherLiveVocab({
  out,
  csv,
  project: "test-project",
  entries: [
    entry,
    { word: "old", meaning: "舊的", disabled: true }
  ]
}).then((result) => {
  assert.strictEqual(result.payload.meta.entryCount, 1);
  assert.strictEqual(result.payload.entries[0].word, "customer-centric");
  assert.ok(fs.existsSync(out));
  assert.ok(fs.existsSync(csv));
  assert.ok(fs.readFileSync(csv, "utf8").includes("customer-centric"));

  return exporter.exportTeacherLiveVocab({
    out,
    csv,
    project: "test-project",
    entries: [
      entry,
      { word: "old", meaning: "舊的", disabled: true }
    ],
    includeDisabled: true
  });
}).then((result) => {
  assert.strictEqual(result.payload.meta.entryCount, 2);
  assert.ok(result.payload.entries.some((item) => item.disabled));
  console.log("export_teacher_live_vocab tests passed");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
