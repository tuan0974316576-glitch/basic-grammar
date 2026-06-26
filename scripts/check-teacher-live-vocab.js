#!/usr/bin/env node
"use strict";

const FirestoreRest = require("./firebase-firestore-rest.js");
const TeacherLiveVocab = require("../teacher_live_vocab.js");

const DEFAULT_PROJECT_ID = FirestoreRest.DEFAULT_PROJECT_ID;

function usage() {
  console.log([
    "Usage:",
    "  node scripts/check-teacher-live-vocab.js <word-or-entry-id> [...more]",
    "",
    "Checks Firestore teacherVocabLive by document id first, then by word.",
    "Prints compact JSON rows so noisy disabled entries can be spot-checked after sync."
  ].join("\n"));
}

function parseArgs(argv = []) {
  const options = {
    project: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || DEFAULT_PROJECT_ID,
    terms: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--project") {
      options.project = String(argv[index + 1] || DEFAULT_PROJECT_ID).trim();
      index += 1;
      continue;
    }
    options.terms.push(String(arg || "").trim());
  }
  return options;
}

function firestoreValue(field) {
  if (!field) return undefined;
  if (Object.prototype.hasOwnProperty.call(field, "stringValue")) return field.stringValue;
  if (Object.prototype.hasOwnProperty.call(field, "booleanValue")) return field.booleanValue;
  if (Object.prototype.hasOwnProperty.call(field, "integerValue")) return Number(field.integerValue);
  if (Object.prototype.hasOwnProperty.call(field, "timestampValue")) return field.timestampValue;
  if (field.arrayValue) return (field.arrayValue.values || []).map(firestoreValue);
  return undefined;
}

function compactDocument(doc = {}, fallbackId = "") {
  const fields = doc.fields || {};
  const id = String(doc.name || "").split("/").pop() || fallbackId;
  return {
    id,
    word: firestoreValue(fields.word) || "",
    display: firestoreValue(fields.display) || "",
    meaning: firestoreValue(fields.meaning) || "",
    pos: firestoreValue(fields.pos) || "",
    type: firestoreValue(fields.type) || "",
    disabled: Boolean(firestoreValue(fields.disabled)),
    updatedBy: firestoreValue(fields.updatedBy) || "",
    updatedAt: firestoreValue(fields.updatedAt) || ""
  };
}

function makeDocumentUrl(project, id) {
  return `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/teacherVocabLive/${encodeURIComponent(id)}`;
}

function makeRunQueryUrl(project) {
  return `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:runQuery`;
}

function makeWordQueryPayload(word) {
  return {
    structuredQuery: {
      from: [{ collectionId: "teacherVocabLive" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "word" },
          op: "EQUAL",
          value: { stringValue: word }
        }
      },
      limit: 50
    }
  };
}

async function checkById(term, options = {}) {
  const url = makeDocumentUrl(options.project || DEFAULT_PROJECT_ID, term);
  try {
    const doc = await FirestoreRest.getJson(url, options.accessToken);
    return [compactDocument(doc, term)];
  } catch (error) {
    if (!/404/.test(String(error.message))) throw error;
    return [];
  }
}

async function checkByWord(term, options = {}) {
  const word = TeacherLiveVocab.normalizeWord(term);
  if (!word) return [];
  const url = makeRunQueryUrl(options.project || DEFAULT_PROJECT_ID);
  const rows = await FirestoreRest.postJson(url, makeWordQueryPayload(word), options.accessToken);
  return (Array.isArray(rows) ? rows : [])
    .map((row) => row.document)
    .filter(Boolean)
    .map((doc) => compactDocument(doc));
}

async function checkTeacherLiveTerms(options = {}) {
  const accessToken = options.accessToken || FirestoreRest.refreshFirebaseCliTokenIfNeeded();
  const results = [];
  for (const term of options.terms || []) {
    if (!term) continue;
    const byId = await checkById(term, { ...options, accessToken });
    const matches = byId.length ? byId : await checkByWord(term, { ...options, accessToken });
    results.push({
      term,
      matchCount: matches.length,
      matches
    });
  }
  return {
    project: options.project || DEFAULT_PROJECT_ID,
    checkedCount: results.length,
    results
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.terms.length) {
    usage();
    process.exit(1);
  }
  const summary = await checkTeacherLiveTerms(options);
  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  checkTeacherLiveTerms,
  compactDocument,
  firestoreValue,
  makeDocumentUrl,
  makeRunQueryUrl,
  makeWordQueryPayload,
  parseArgs
};
