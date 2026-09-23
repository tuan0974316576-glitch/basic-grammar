#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const ExportTeacherLive = require("./export-teacher-live-vocab.js");
const FirestoreRest = require("./firebase-firestore-rest.js");
const MeaningDedupe = require("./vocab-meaning-dedupe.js");
const TeacherLiveVocab = require("../teacher_live_vocab.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const PRIVATE_EXPORTS_DIR = path.join(ROOT_DIR, "private_exports");
const DEFAULT_INPUT = path.join(PRIVATE_EXPORTS_DIR, "teacher_live_vocab_snapshot.json");
const DEFAULT_PROJECT_ID = FirestoreRest.DEFAULT_PROJECT_ID;
const BATCH_LIMIT = 450;

function usage() {
  console.log([
    "Usage:",
    "  node scripts/clean-teacher-live-vocab.js [--input private_exports/teacher_live_vocab_snapshot.json]",
    "  node scripts/clean-teacher-live-vocab.js --write",
    "",
    "Finds exact and meaning-subset duplicates inside the active teacherVocabLive bank.",
    "Dry-run is the default. --write soft-disables redundant documents and records replacedBy."
  ].join("\n"));
}

function parseArgs(argv = []) {
  const options = {
    input: "",
    out: path.join(PRIVATE_EXPORTS_DIR, "teacher_live_vocab_dedupe_receipt.json"),
    project: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || DEFAULT_PROJECT_ID,
    write: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--input") {
      options.input = path.resolve(argv[index + 1] || DEFAULT_INPUT);
      index += 1;
      continue;
    }
    if (arg === "--out") {
      options.out = path.resolve(argv[index + 1] || options.out);
      index += 1;
      continue;
    }
    if (arg === "--project") {
      options.project = String(argv[index + 1] || DEFAULT_PROJECT_ID).trim();
      index += 1;
      continue;
    }
    if (arg === "--write") {
      options.write = true;
    }
  }
  return options;
}

function loadSnapshot(inputPath = "") {
  if (!inputPath) return null;
  const payload = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  return Array.isArray(payload.entries) ? payload.entries : Array.isArray(payload) ? payload : [];
}

function dedupeOptions() {
  return {
    normalizeWord: TeacherLiveVocab.normalizeWord,
    normalizeMeaning: TeacherLiveVocab.normalizeMeaning,
    normalizePos: TeacherLiveVocab.normalizePos,
    normalizeType: TeacherLiveVocab.normalizeType,
    effectivePos: (entry) => TeacherLiveVocab.normalizePos(entry.pos || entry.inferredPos)
  };
}

function makeDisableWrite(candidate, project = DEFAULT_PROJECT_ID, now = new Date()) {
  const keptId = String(candidate.keptId || "").trim();
  return {
    update: {
      name: `projects/${project}/databases/(default)/documents/teacherVocabLive/${candidate.id}`,
      fields: {
        disabled: { booleanValue: true },
        replacedBy: { stringValue: keptId },
        updatedAt: { timestampValue: now.toISOString() },
        updatedBy: { stringValue: "vocab-dedupe" }
      }
    },
    updateMask: {
      fieldPaths: ["disabled", "replacedBy", "updatedAt", "updatedBy"]
    }
  };
}

function buildDuplicatePlan(entries = []) {
  const result = MeaningDedupe.findMeaningDuplicatePlan(entries, dedupeOptions());
  const candidates = result.removed
    .map((item) => ({
      id: String(item.id || "").trim(),
      keptId: String(item.kept?.id || item.kept?.sourceEntryId || "").trim(),
      word: item.entry?.word || "",
      display: item.entry?.display || item.entry?.word || "",
      pos: item.entry?.pos || "",
      type: item.entry?.type || "",
      meaning: item.entry?.meaning || "",
      reason: item.reason || ""
    }))
    .filter((item) => item.id && item.keptId && item.id !== item.keptId);
  return {
    entries: result.entries,
    candidates
  };
}

async function writeDisablePlan(candidates = [], options = {}) {
  if (!candidates.length) return 0;
  const accessToken = FirestoreRest.refreshFirebaseCliTokenIfNeeded();
  const project = options.project || DEFAULT_PROJECT_ID;
  const commitUrl = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:commit`;
  let written = 0;
  for (let index = 0; index < candidates.length; index += BATCH_LIMIT) {
    const batch = candidates.slice(index, index + BATCH_LIMIT);
    const now = new Date();
    await FirestoreRest.postJson(commitUrl, {
      writes: batch.map((candidate) => makeDisableWrite(candidate, project, now))
    }, accessToken);
    written += batch.length;
  }
  return written;
}

async function cleanTeacherLiveVocab(options = {}) {
  let entries = loadSnapshot(options.input);
  let snapshotPath = options.input || "";
  if (!entries) {
    const snapshot = await ExportTeacherLive.exportTeacherLiveVocab({
      out: DEFAULT_INPUT,
      csv: DEFAULT_INPUT.replace(/\.json$/i, ".csv"),
      project: options.project || DEFAULT_PROJECT_ID
    });
    entries = snapshot.payload.entries;
    snapshotPath = snapshot.out;
  }

  const plan = buildDuplicatePlan(entries);
  const summary = {
    project: options.project || DEFAULT_PROJECT_ID,
    input: path.relative(ROOT_DIR, snapshotPath),
    activeEntryCount: entries.length,
    keptEntryCount: plan.entries.length,
    duplicateCount: plan.candidates.length,
    exactDuplicateCount: plan.candidates.filter((item) => item.reason === "exact-meaning").length,
    meaningSubsetCount: plan.candidates.filter((item) => item.reason === "meaning-subset").length,
    write: Boolean(options.write),
    sample: plan.candidates.slice(0, 20)
  };

  if (options.write) {
    summary.disabledCount = await writeDisablePlan(plan.candidates, options);
    summary.receipt = options.out;
    fs.mkdirSync(path.dirname(options.out), { recursive: true });
    fs.writeFileSync(options.out, `${JSON.stringify({
      meta: {
        generatedAt: new Date().toISOString(),
        source: "teacher-live-dedupe",
        project: summary.project,
        privateOnly: true,
        note: "Redundant active teacherVocabLive entries were soft-disabled and pointed to the kept entry."
      },
      summary,
      disabledEntries: plan.candidates
    }, null, 2)}\n`);
  }

  return summary;
}

async function main() {
  const summary = await cleanTeacherLiveVocab(parseArgs(process.argv.slice(2)));
  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  buildDuplicatePlan,
  cleanTeacherLiveVocab,
  makeDisableWrite,
  parseArgs,
  writeDisablePlan
};
