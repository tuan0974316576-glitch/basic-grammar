#!/usr/bin/env node
"use strict";

const FirestoreRest = require("./firebase-firestore-rest.js");
const TeacherLiveVocab = require("../teacher_live_vocab.js");
const VocabText = require("../vocab_text.js");

const DEFAULT_PROJECT_ID = FirestoreRest.DEFAULT_PROJECT_ID;
const BATCH_LIMIT = 450;
const COLLECTION = "teacherVocabLive";

function parseArgs(argv = []) {
  const options = {
    project: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || DEFAULT_PROJECT_ID,
    write: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--write") {
      options.write = true;
    } else if (arg === "--project") {
      options.project = String(argv[index + 1] || DEFAULT_PROJECT_ID).trim();
      index += 1;
    }
  }
  return options;
}

function firestoreValueToJs(value = {}) {
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("timestampValue" in value) return value.timestampValue;
  if (value.arrayValue) return (value.arrayValue.values || []).map(firestoreValueToJs);
  if (value.mapValue) return Object.fromEntries(
    Object.entries(value.mapValue.fields || {}).map(([key, item]) => [key, firestoreValueToJs(item)])
  );
  return null;
}

function documentToRawEntry(document = {}) {
  const fields = Object.fromEntries(
    Object.entries(document.fields || {}).map(([key, value]) => [key, firestoreValueToJs(value)])
  );
  return {
    id: String(document.name || "").split("/").pop(),
    ...fields
  };
}

function toFirestoreValue(value) {
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value)
    ? { integerValue: String(value) }
    : { doubleValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (value && typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toFirestoreValue(item)]))
      }
    };
  }
  return { stringValue: String(value ?? "") };
}

function makeCanonicalEntry(raw = {}) {
  const rawWord = String(raw.word || raw.display || "").trim();
  const rawDisplay = String(raw.display || "").trim();
  if (!rawWord.includes("+") && !rawDisplay.includes("+")) return null;

  const canonicalDisplay = VocabText.canonicalizeHeadword(raw.display || rawWord);
  const canonicalWord = VocabText.normalizeHeadword(rawWord);
  if (!canonicalWord || canonicalWord.includes("+") || canonicalDisplay.includes("+")) return null;

  const normalized = TeacherLiveVocab.normalizeEntry({
    ...raw,
    word: canonicalWord,
    display: canonicalDisplay
  }, { source: raw.source || "teacher-live" });
  if (!normalized) return null;
  const canonicalId = TeacherLiveVocab.makeEntryId(normalized);
  return {
    ...raw,
    id: canonicalId,
    word: canonicalWord,
    display: canonicalDisplay || canonicalWord,
    aliases: Array.from(new Set([
      ...(Array.isArray(raw.aliases) ? raw.aliases : []),
      rawWord,
      rawDisplay
    ].map((value) => String(value || "").trim()).filter(Boolean))),
    sourceEntryId: canonicalId,
    disabled: false,
    replacedBy: "",
    updatedBy: "teacher-headword-migration"
  };
}

function buildMigrationPlan(entries = []) {
  const existingById = new Map(entries.map((entry) => [entry.id, entry]));
  const migrations = entries
    .filter((entry) => !entry.disabled)
    .map((entry) => {
      const canonical = makeCanonicalEntry(entry);
      if (!canonical || canonical.id === entry.id) return null;
      const existingCanonical = existingById.get(canonical.id);
      const mergedAliases = Array.from(new Set([
        ...(canonical.aliases || []),
        ...(existingCanonical?.aliases || [])
      ]));
      const mergedTeacherExamples = Array.from(new Set([
        ...(canonical.teacherExamples || []),
        ...(existingCanonical?.teacherExamples || [])
      ]));
      return {
        old: entry,
        canonical: existingCanonical
          ? {
            ...canonical,
            ...existingCanonical,
            id: canonical.id,
            word: canonical.word,
            display: canonical.display,
            aliases: mergedAliases,
            teacherExamples: mergedTeacherExamples,
            sourceEntryId: canonical.id,
            disabled: false,
            replacedBy: "",
            updatedBy: "teacher-headword-migration"
          }
          : canonical
      };
    })
    .filter(Boolean);
  return { scanned: entries.length, migrationCount: migrations.length, migrations };
}

async function fetchDocuments(options = {}) {
  const project = options.project || DEFAULT_PROJECT_ID;
  const accessToken = options.accessToken || FirestoreRest.refreshFirebaseCliTokenIfNeeded();
  const url = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:runQuery`;
  const fields = [
    "word", "display", "meaning", "pos", "type", "sourceEntryId", "aliases",
    "level", "levelSource", "source", "notes", "examples", "teacherExamples",
    "disabled", "replacedBy", "createdAt", "createdBy"
  ];
  const rows = await FirestoreRest.postJson(url, {
    structuredQuery: {
      select: { fields: fields.map((fieldPath) => ({ fieldPath })) },
      from: [{ collectionId: COLLECTION }],
      where: {
        fieldFilter: {
          field: { fieldPath: "disabled" },
          op: "EQUAL",
          value: { booleanValue: false }
        }
      }
    }
  }, accessToken);
  return (Array.isArray(rows) ? rows : []).map((row) => row.document).filter(Boolean);
}

function makeWriteName(project, id) {
  return `projects/${project}/databases/(default)/documents/${COLLECTION}/${id}`;
}

function makeMigrationWrites(migration, project, now = new Date()) {
  const canonicalFields = Object.fromEntries(
    Object.entries({ ...migration.canonical, id: undefined })
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, (
        ["createdAt", "levelUpdatedAt"].includes(key)
        && typeof value === "string"
        && !Number.isNaN(Date.parse(value))
      ) ? { timestampValue: value } : toFirestoreValue(value)])
  );
  canonicalFields.updatedAt = { timestampValue: now.toISOString() };
  const disabledFields = {
    disabled: { booleanValue: true },
    replacedBy: { stringValue: migration.canonical.id },
    updatedAt: { timestampValue: now.toISOString() },
    updatedBy: { stringValue: "teacher-headword-migration" }
  };
  return [
    {
      update: { name: makeWriteName(project, migration.canonical.id), fields: canonicalFields },
      updateMask: { fieldPaths: Object.keys(canonicalFields) }
    },
    {
      update: { name: makeWriteName(project, migration.old.id), fields: disabledFields },
      updateMask: { fieldPaths: Object.keys(disabledFields) }
    }
  ];
}

async function writeMigrationPlan(plan, options = {}) {
  const project = options.project || DEFAULT_PROJECT_ID;
  const accessToken = options.accessToken || FirestoreRest.refreshFirebaseCliTokenIfNeeded();
  const commitUrl = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:commit`;
  const writes = plan.migrations.flatMap((migration) => makeMigrationWrites(migration, project));
  for (let index = 0; index < writes.length; index += BATCH_LIMIT) {
    await FirestoreRest.postJson(commitUrl, { writes: writes.slice(index, index + BATCH_LIMIT) }, accessToken);
  }
  return writes.length;
}

async function migrateTeacherVocabHeadwords(options = {}) {
  const documents = options.documents || await fetchDocuments(options);
  const plan = buildMigrationPlan(documents.map(documentToRawEntry));
  const summary = {
    project: options.project || DEFAULT_PROJECT_ID,
    write: Boolean(options.write),
    scanned: plan.scanned,
    migrationCount: plan.migrationCount,
    sample: plan.migrations.slice(0, 50).map((item) => ({
      oldId: item.old.id,
      oldWord: item.old.word || item.old.display,
      canonicalId: item.canonical.id,
      canonicalWord: item.canonical.word
    }))
  };
  if (options.write && plan.migrations.length) {
    summary.writeCount = await writeMigrationPlan(plan, options);
  }
  return summary;
}

if (require.main === module) {
  migrateTeacherVocabHeadwords(parseArgs(process.argv.slice(2)))
    .then((summary) => console.log(JSON.stringify(summary, null, 2)))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  buildMigrationPlan,
  documentToRawEntry,
  makeCanonicalEntry,
  makeMigrationWrites,
  migrateTeacherVocabHeadwords,
  parseArgs
};
