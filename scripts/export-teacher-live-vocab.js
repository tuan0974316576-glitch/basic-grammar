#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const FirestoreRest = require("./firebase-firestore-rest.js");
const TeacherLiveVocab = require("../teacher_live_vocab.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const PRIVATE_EXPORTS_DIR = path.join(ROOT_DIR, "private_exports");
const DEFAULT_OUTPUT = path.join(PRIVATE_EXPORTS_DIR, "teacher_live_vocab_snapshot.json");
const DEFAULT_PROJECT_ID = FirestoreRest.DEFAULT_PROJECT_ID;
const PAGE_SIZE = 300;

function usage() {
  console.log([
    "Usage:",
    "  node scripts/export-teacher-live-vocab.js [--out private_exports/teacher_live_vocab_snapshot.json] [--project enguistics-grammar-game]",
    "  node scripts/export-teacher-live-vocab.js --input private_exports/teacher_live_vocab_snapshot.json --out private_exports/teacher_live_vocab_snapshot_clean.json",
    "",
    "Exports Firestore teacherVocabLive into private review material.",
    "The output is private and should not be committed."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    csv: "",
    includeDisabled: false,
    input: "",
    out: DEFAULT_OUTPUT,
    project: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || DEFAULT_PROJECT_ID
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--out") {
      options.out = path.resolve(argv[index + 1] || DEFAULT_OUTPUT);
      index += 1;
      continue;
    }
    if (arg === "--csv") {
      options.csv = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--project") {
      options.project = String(argv[index + 1] || DEFAULT_PROJECT_ID).trim();
      index += 1;
      continue;
    }
    if (arg === "--input") {
      options.input = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--include-disabled") {
      options.includeDisabled = true;
      continue;
    }
  }

  if (!options.csv) options.csv = options.out.replace(/\.json$/i, ".csv");
  return options;
}

function normalizeSnapshotEntry(raw = {}) {
  const entry = TeacherLiveVocab.normalizeEntry(raw, { source: "teacher-live" });
  if (!entry) return null;
  return TeacherLiveVocab.compactEntry({
    id: String(raw.id || raw.sourceEntryId || entry.id || TeacherLiveVocab.makeEntryId(entry)).trim(),
    word: entry.word,
    display: entry.display || entry.word,
    pos: entry.pos || "",
    type: entry.type || "word",
    meaning: entry.meaning,
    aliases: entry.aliases || [],
    level: entry.level || "",
    notes: entry.notes || "",
    source: "teacher-live",
    sourceEntryId: String(raw.sourceEntryId || raw.id || entry.sourceEntryId || entry.id || "").trim(),
    disabled: Boolean(raw.disabled),
    replacedBy: String(raw.replacedBy || "").trim(),
    createdAt: normalizeTimestamp(raw.createdAt),
    updatedAt: normalizeTimestamp(raw.updatedAt),
    createdBy: String(raw.createdBy || "").trim(),
    updatedBy: String(raw.updatedBy || "").trim()
  });
}

function normalizeTimestamp(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return new Date(value).toISOString();
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  return "";
}

function firestoreValueToJs(value = {}) {
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map(firestoreValueToJs);
  }
  if ("mapValue" in value) {
    return firestoreFieldsToJs(value.mapValue.fields || {});
  }
  return "";
}

function firestoreFieldsToJs(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, firestoreValueToJs(value)]));
}

function documentToEntry(document = {}) {
  const id = String(document.name || "").split("/").pop();
  return normalizeSnapshotEntry({
    id,
    sourceEntryId: id,
    ...firestoreFieldsToJs(document.fields || {})
  });
}

async function fetchTeacherLiveDocuments(options = {}) {
  const project = options.project || DEFAULT_PROJECT_ID;
  const accessToken = FirestoreRest.refreshFirebaseCliTokenIfNeeded();
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/teacherVocabLive`;
  let pageToken = "";
  const documents = [];
  do {
    const url = new URL(baseUrl);
    url.searchParams.set("pageSize", String(PAGE_SIZE));
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const page = await FirestoreRest.getJson(url.toString(), accessToken);
    documents.push(...(page.documents || []));
    pageToken = page.nextPageToken || "";
  } while (pageToken);
  return documents;
}

function loadInputEntries(inputPath = "") {
  if (!inputPath) return [];
  const payload = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  return Array.isArray(payload.entries) ? payload.entries : Array.isArray(payload) ? payload : [];
}

function dedupeEntries(entries = []) {
  const seen = new Set();
  return entries
    .map(normalizeSnapshotEntry)
    .filter(Boolean)
    .filter((entry) => {
      const key = entry.id || TeacherLiveVocab.makeEntryId(entry);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((left, right) => {
      const time = String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
      return time || left.word.localeCompare(right.word) || left.meaning.localeCompare(right.meaning);
    });
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, "\"\"")}"`;
}

function buildCsv(entries = []) {
  const headers = [
    "id",
    "word",
    "display",
    "pos",
    "type",
    "meaning",
    "aliases",
    "level",
    "disabled",
    "replaced_by",
    "updated_at",
    "updated_by",
    "notes"
  ];
  const lines = [headers.join(",")];
  entries.forEach((entry) => {
    const row = {
      id: entry.id,
      word: entry.word,
      display: entry.display,
      pos: entry.pos,
      type: entry.type,
      meaning: entry.meaning,
      aliases: (entry.aliases || []).join(" | "),
      level: entry.level,
      disabled: entry.disabled ? "yes" : "",
      replaced_by: entry.replacedBy || "",
      updated_at: entry.updatedAt || "",
      updated_by: entry.updatedBy || "",
      notes: entry.notes || ""
    };
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  });
  return `${lines.join("\n")}\n`;
}

async function exportTeacherLiveVocab(options = {}) {
  const hasExplicitEntries = Object.prototype.hasOwnProperty.call(options, "entries");
  const rawEntries = hasExplicitEntries
    ? options.entries
    : loadInputEntries(options.input);
  const docs = hasExplicitEntries || rawEntries.length || options.input
    ? []
    : await fetchTeacherLiveDocuments(options);
  const entries = dedupeEntries([
    ...rawEntries,
    ...docs.map(documentToEntry)
  ]).filter((entry) => options.includeDisabled || !entry.disabled);
  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: "teacher-live",
      project: options.project || DEFAULT_PROJECT_ID,
      entryCount: entries.length,
      includeDisabled: Boolean(options.includeDisabled),
      privateOnly: true,
      note: "Private snapshot of Firestore teacherVocabLive. Review before promoting into local bundled banks."
    },
    entries
  };
  const out = options.out || DEFAULT_OUTPUT;
  const csv = options.csv || out.replace(/\.json$/i, ".csv");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`);
  fs.writeFileSync(csv, buildCsv(entries));
  return { payload, out, csv };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await exportTeacherLiveVocab(options);
  console.log(JSON.stringify({
    out: path.relative(ROOT_DIR, result.out),
    csv: path.relative(ROOT_DIR, result.csv),
    entryCount: result.payload.meta.entryCount,
    privateOnly: true
  }, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  buildCsv,
  dedupeEntries,
  documentToEntry,
  exportTeacherLiveVocab,
  firestoreFieldsToJs,
  firestoreValueToJs,
  normalizeSnapshotEntry,
  parseArgs
};
