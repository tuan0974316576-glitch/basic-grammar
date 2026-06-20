#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const ApplyPlan = require("./apply-vocab-promote-plan.js");
const FirestoreRest = require("./firebase-firestore-rest.js");
const ReviewDashboard = require("./build-vocab-review-dashboard.js");
const ReviewIndex = require("./build-vocab-review-index.js");
const ReviewPaths = require("./vocab-review-paths.js");
const TeacherLiveVocab = require("../teacher_live_vocab.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_INPUT = path.join(ROOT_DIR, "teacher_vocab_manual_updates.json");
const DEFAULT_PROJECT_ID = FirestoreRest.DEFAULT_PROJECT_ID;
const BATCH_LIMIT = 450;

function usage() {
  console.log([
    "Usage:",
    "  node scripts/sync-teacher-live-vocab.js [input-json] [--write] [--project enguistics-grammar-game]",
    "",
    "Inputs:",
    "  - teacher_vocab_manual_updates.json",
    "  - vocab promote plan JSON from npm run vocab:promote-plan",
    "",
    "Dry-runs by default. With --write, uploads reviewed teacher entries to Firestore teacherVocabLive.",
    "Curated entries are intentionally skipped; only teacher-approved class vocab goes to the live cloud bank.",
    "With --write, also writes a private *_live_synced.json receipt and refreshes review dashboard/index."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    input: DEFAULT_INPUT,
    project: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || DEFAULT_PROJECT_ID,
    write: false,
    source: "auto"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--write") {
      options.write = true;
      continue;
    }
    if (arg === "--no-refresh") {
      options.refresh = false;
      continue;
    }
    if (arg === "--project") {
      options.project = String(argv[index + 1] || DEFAULT_PROJECT_ID).trim();
      index += 1;
      continue;
    }
    if (arg === "--source") {
      options.source = String(argv[index + 1] || "auto").trim();
      index += 1;
      continue;
    }
    options.input = path.resolve(arg);
  }

  return options;
}

function makeTeacherLiveEntryId(entry = {}) {
  return TeacherLiveVocab.makeEntryId(entry);
}

function normalizeTeacherEntry(raw = {}) {
  const entry = TeacherLiveVocab.normalizeEntry(raw, {
    source: "reviewed-teacher-bank",
  });
  return entry ? TeacherLiveVocab.compactEntry({
    ...entry,
    id: makeTeacherLiveEntryId(entry),
    sourceEntryId: makeTeacherLiveEntryId(entry)
  }) : null;
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function entriesFromPromotePlan(plan = {}) {
  return ApplyPlan.splitEntries(plan.entries || []).teacher;
}

function entriesFromTeacherUpdates(updateData = {}) {
  return Array.isArray(updateData.entries) ? updateData.entries : [];
}

function detectInputKind(payload = {}, filePath = "", source = "auto") {
  if (source && source !== "auto") return source;
  if (Array.isArray(payload.entries) && payload.entries.some((entry) => entry.promoteTo || entry.promote_to)) {
    return "promote-plan";
  }
  if (/promote[_-]plan/i.test(path.basename(filePath))) return "promote-plan";
  return "teacher-updates";
}

function loadTeacherLiveEntries(inputPath, options = {}) {
  const payload = loadJson(inputPath);
  const inputKind = detectInputKind(payload, inputPath, options.source || "auto");
  const rawEntries = inputKind === "promote-plan"
    ? entriesFromPromotePlan(payload)
    : entriesFromTeacherUpdates(payload);
  const seen = new Set();
  const entries = rawEntries
    .map(normalizeTeacherEntry)
    .filter(Boolean)
    .filter((entry) => {
      if (seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    });
  return {
    inputKind,
    sourceEntryCount: rawEntries.length,
    entries
  };
}

function inferLiveSyncReceiptPath(input = "") {
  return ReviewPaths.inferLiveSyncReceiptPath(input || DEFAULT_INPUT);
}

function writeLiveSyncReceipt(summary = {}, options = {}) {
  if (!options.write) return null;
  const out = options.receiptOut || inferLiveSyncReceiptPath(options.input || DEFAULT_INPUT);
  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      input: path.relative(ROOT_DIR, options.input || DEFAULT_INPUT),
      project: options.project || DEFAULT_PROJECT_ID,
      privateOnly: true,
      note: "Live sync receipt only. Indicates teacher entries were uploaded to Firestore teacherVocabLive with --write."
    },
    summary
  };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`);
  return out;
}

function refreshReviewStatusAfterLiveSync(input = "", options = {}) {
  const queue = ApplyPlan.getReviewQueueForPlan(input);
  if (!queue) return null;
  const dir = ReviewPaths.inferOutputDir(input);
  const indexOut = path.join(dir, queue.indexFile);
  const index = ReviewIndex.writeIndex({
    dir,
    prefix: queue.reviewPrefix,
    out: indexOut
  });
  const dashboardOut = options.dashboardOut || path.join(dir, "vocab_review_dashboard.json");
  const dashboard = ReviewDashboard.writeDashboard({
    dir,
    out: dashboardOut
  });
  const planBaseName = ReviewPaths.stripReviewExtension(input);
  const batchId = planBaseName.replace(`${queue.planPrefix}_`, "");
  return {
    queue: queue.reviewPrefix,
    indexOut,
    dashboardOut,
    status: (index.batches || []).find((batch) => batch.id === batchId)?.status || "",
    batchCount: index.meta?.batchCount || 0,
    dashboardQueueCount: dashboard.queues?.length || 0
  };
}

function firestoreString(value) {
  return { stringValue: String(value || "") };
}

function firestoreBoolean(value) {
  return { booleanValue: Boolean(value) };
}

function firestoreArray(values = []) {
  return {
    arrayValue: {
      values: values.map((value) => firestoreString(value))
    }
  };
}

function makeFirestoreFields(entry = {}, now = new Date()) {
  const fields = {
    word: firestoreString(entry.word),
    display: firestoreString(entry.display || entry.word),
    meaning: firestoreString(entry.meaning),
    pos: firestoreString(entry.pos || ""),
    type: firestoreString(entry.type || "word"),
    aliases: firestoreArray(entry.aliases || []),
    level: firestoreString(entry.level || ""),
    source: firestoreString(entry.source || "reviewed-teacher-bank"),
    notes: firestoreString(entry.notes || ""),
    disabled: firestoreBoolean(entry.disabled),
    updatedAt: { timestampValue: now.toISOString() },
    updatedBy: firestoreString("teacher-review-sync")
  };
  return fields;
}

function makeFirestoreWrite(entry = {}, project = DEFAULT_PROJECT_ID, now = new Date()) {
  const fields = makeFirestoreFields(entry, now);
  return {
    update: {
      name: `projects/${project}/databases/(default)/documents/teacherVocabLive/${entry.id}`,
      fields
    },
    updateMask: {
      fieldPaths: Object.keys(fields)
    }
  };
}

async function uploadTeacherLiveEntries(entries = [], options = {}) {
  if (!entries.length) return { uploaded: 0 };
  const project = options.project || DEFAULT_PROJECT_ID;
  const accessToken = FirestoreRest.refreshFirebaseCliTokenIfNeeded();
  const commitUrl = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:commit`;
  let uploaded = 0;
  for (let index = 0; index < entries.length; index += BATCH_LIMIT) {
    const batch = entries.slice(index, index + BATCH_LIMIT);
    const now = new Date();
    const writes = batch.map((entry) => makeFirestoreWrite(entry, project, now));
    await FirestoreRest.postJson(commitUrl, { writes }, accessToken);
    uploaded += batch.length;
  }
  return { uploaded };
}

async function syncTeacherLiveVocab(options = {}) {
  const source = loadTeacherLiveEntries(options.input || DEFAULT_INPUT, options);
  const summary = {
    input: path.relative(ROOT_DIR, options.input || DEFAULT_INPUT),
    inputKind: source.inputKind,
    sourceEntryCount: source.sourceEntryCount,
    uploadEntryCount: source.entries.length,
    write: Boolean(options.write),
    project: options.project || DEFAULT_PROJECT_ID,
    sample: source.entries.slice(0, 8).map((entry) => ({
      id: entry.id,
      word: entry.word,
      pos: entry.pos || "",
      type: entry.type || "",
      meaning: entry.meaning
    }))
  };

  if (options.write) {
    const uploader = options.uploadTeacherLiveEntries || uploadTeacherLiveEntries;
    const upload = await uploader(source.entries, options);
    summary.uploaded = upload.uploaded;
    summary.liveSyncReceipt = writeLiveSyncReceipt(summary, options);
    if (options.refresh !== false) {
      summary.refreshed = refreshReviewStatusAfterLiveSync(options.input || DEFAULT_INPUT, options);
    }
  }
  return summary;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const summary = await syncTeacherLiveVocab(options);
  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  detectInputKind,
  entriesFromPromotePlan,
  entriesFromTeacherUpdates,
  inferLiveSyncReceiptPath,
  loadTeacherLiveEntries,
  makeFirestoreFields,
  makeFirestoreWrite,
  makeTeacherLiveEntryId,
  normalizeTeacherEntry,
  parseArgs,
  refreshReviewStatusAfterLiveSync,
  syncTeacherLiveVocab
};
