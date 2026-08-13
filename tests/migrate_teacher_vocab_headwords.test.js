const assert = require("assert");
const migration = require("../scripts/migrate-teacher-vocab-headwords.js");

const document = {
  name: "projects/test/databases/(default)/documents/teacherVocabLive/old-plus-entry",
  fields: {
    word: { stringValue: "have been + V-ing" },
    display: { stringValue: "have been + V-ing" },
    meaning: { stringValue: "一直在..." },
    pos: { stringValue: "auxiliary" },
    type: { stringValue: "pattern" },
    aliases: { arrayValue: { values: [] } },
    disabled: { booleanValue: false },
    createdAt: { integerValue: "1234" },
    teacherExamples: { arrayValue: { values: [{ stringValue: "I have been waiting." }] } }
  }
};

const raw = migration.documentToRawEntry(document);
assert.strictEqual(raw.id, "old-plus-entry");
assert.strictEqual(raw.word, "have been + V-ing");
assert.strictEqual(raw.createdAt, 1234);

const plan = migration.buildMigrationPlan([raw]);
assert.strictEqual(plan.scanned, 1);
assert.strictEqual(plan.migrationCount, 1);
assert.strictEqual(plan.migrations[0].canonical.word, "have been ving");
assert.strictEqual(plan.migrations[0].canonical.display, "have been ving");
assert.ok(plan.migrations[0].canonical.aliases.includes("have been + V-ing"));
assert.deepStrictEqual(plan.migrations[0].canonical.teacherExamples, ["I have been waiting."]);

const writes = migration.makeMigrationWrites(plan.migrations[0], "test-project", new Date("2026-08-13T00:00:00.000Z"));
assert.strictEqual(writes.length, 2);
assert.strictEqual(writes[0].update.fields.word.stringValue, "have been ving");
assert.strictEqual(writes[1].update.fields.disabled.booleanValue, true);
assert.strictEqual(writes[1].update.fields.replacedBy.stringValue, plan.migrations[0].canonical.id);

const mergedPlan = migration.buildMigrationPlan([
  raw,
  {
    ...plan.migrations[0].canonical,
    aliases: ["have been ving"],
    teacherExamples: ["She has been studying."],
    disabled: true,
    replacedBy: "older-entry"
  }
]);
assert.deepStrictEqual(mergedPlan.migrations[0].canonical.teacherExamples, [
  "I have been waiting.",
  "She has been studying."
]);
assert.strictEqual(mergedPlan.migrations[0].canonical.disabled, false);
assert.strictEqual(mergedPlan.migrations[0].canonical.replacedBy, "");

assert.strictEqual(migration.makeCanonicalEntry({
  id: "museum",
  word: "M+ Museum",
  display: "M+ Museum",
  meaning: "M+ 博物館",
  pos: "noun",
  type: "phrase"
}).word, "m plus museum");

assert.strictEqual(migration.makeCanonicalEntry({
  id: "clean",
  word: "macaroni",
  meaning: "通心粉"
}), null);

console.log("migrate_teacher_vocab_headwords tests passed");
