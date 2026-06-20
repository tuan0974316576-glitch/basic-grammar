#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const ExportTeacherLive = require("./export-teacher-live-vocab.js");
const ReviewNext = require("./build-vocab-review-next.js");
const ReviewDashboard = require("./build-vocab-review-dashboard.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const PRIVATE_EXPORTS_DIR = path.join(ROOT_DIR, "private_exports");
const DEFAULT_SNAPSHOT = path.join(PRIVATE_EXPORTS_DIR, "teacher_live_vocab_snapshot.json");
const DEFAULT_INDEX = path.join(PRIVATE_EXPORTS_DIR, "teacher_live_vocab_review_index.json");
const DEFAULT_DASHBOARD = path.join(PRIVATE_EXPORTS_DIR, "vocab_review_dashboard.json");

function usage() {
  console.log([
    "Usage:",
    "  node scripts/refresh-teacher-live-review.js [--count 1] [--limit 100] [--no-xlsx]",
    "  node scripts/refresh-teacher-live-review.js --entries-json private_exports/sample_teacher_live_entries.json --no-xlsx",
    "",
    "Exports Firestore teacherVocabLive, builds the next teacher-live private review batch, and refreshes the review dashboard.",
    "All generated files are private review material under private_exports/."
  ].join("\n"));
}

function parseArgs(argv = []) {
  const options = {
    count: 1,
    dashboardOut: DEFAULT_DASHBOARD,
    dir: PRIVATE_EXPORTS_DIR,
    entriesJson: "",
    includeDisabled: false,
    limit: 100,
    project: "",
    snapshotOut: DEFAULT_SNAPSHOT,
    xlsx: true
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--count") {
      options.count = Math.max(1, Number(argv[index + 1]) || 1);
      index += 1;
      continue;
    }
    if (arg === "--limit") {
      options.limit = Math.max(1, Number(argv[index + 1]) || 100);
      index += 1;
      continue;
    }
    if (arg === "--dir") {
      options.dir = path.resolve(argv[index + 1] || PRIVATE_EXPORTS_DIR);
      if (options.snapshotOut === DEFAULT_SNAPSHOT) {
        options.snapshotOut = path.join(options.dir, "teacher_live_vocab_snapshot.json");
      }
      if (options.dashboardOut === DEFAULT_DASHBOARD) {
        options.dashboardOut = path.join(options.dir, "vocab_review_dashboard.json");
      }
      index += 1;
      continue;
    }
    if (arg === "--snapshot-out") {
      options.snapshotOut = path.resolve(argv[index + 1] || DEFAULT_SNAPSHOT);
      index += 1;
      continue;
    }
    if (arg === "--dashboard-out") {
      options.dashboardOut = path.resolve(argv[index + 1] || DEFAULT_DASHBOARD);
      index += 1;
      continue;
    }
    if (arg === "--entries-json") {
      options.entriesJson = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--project") {
      options.project = String(argv[index + 1] || "").trim();
      index += 1;
      continue;
    }
    if (arg === "--include-disabled") {
      options.includeDisabled = true;
      continue;
    }
    if (arg === "--no-xlsx") {
      options.xlsx = false;
      continue;
    }
  }

  return options;
}

function loadEntriesJson(filePath = "") {
  if (!filePath) return null;
  const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return Array.isArray(payload.entries) ? payload.entries : Array.isArray(payload) ? payload : [];
}

async function refreshTeacherLiveReview(options = {}) {
  const dir = options.dir || PRIVATE_EXPORTS_DIR;
  const snapshotOut = options.snapshotOut || path.join(dir, "teacher_live_vocab_snapshot.json");
  const snapshotCsv = snapshotOut.replace(/\.json$/i, ".csv");
  const indexOut = path.join(dir, "teacher_live_vocab_review_index.json");
  const entries = loadEntriesJson(options.entriesJson);

  const exportResult = await ExportTeacherLive.exportTeacherLiveVocab({
    out: snapshotOut,
    csv: snapshotCsv,
    project: options.project || undefined,
    includeDisabled: Boolean(options.includeDisabled),
    ...(entries !== null ? { entries } : {})
  });

  const reviewSummary = ReviewNext.buildNextBatches({
    count: Math.max(1, Number(options.count) || 1),
    dir,
    indexOut,
    limit: Math.max(1, Number(options.limit) || 100),
    preset: "teacher-live",
    prefix: "teacher_live_vocab_review_batch",
    source: "teacher-live",
    skipJunk: false,
    teacherLiveInput: snapshotOut,
    xlsx: options.xlsx !== false
  });

  const dashboard = ReviewDashboard.writeDashboard({
    dir,
    out: options.dashboardOut || path.join(dir, "vocab_review_dashboard.json")
  });
  const teacherLiveQueue = (dashboard.queues || []).find((queue) => queue.id === "teacher-live") || null;

  return {
    snapshot: {
      out: path.relative(ROOT_DIR, exportResult.out),
      csv: path.relative(ROOT_DIR, exportResult.csv),
      entryCount: exportResult.payload.meta.entryCount
    },
    review: reviewSummary,
    dashboard: {
      out: path.relative(ROOT_DIR, options.dashboardOut || path.join(dir, "vocab_review_dashboard.json")),
      teacherLiveStatus: teacherLiveQueue?.status || "",
      teacherLiveReadyBatchCount: teacherLiveQueue?.readyForReviewBatchCount || 0,
      teacherLiveTotalCandidateCount: teacherLiveQueue?.totalCandidateCount || 0
    },
    privateOnly: true
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const summary = await refreshTeacherLiveReview(options);
  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  loadEntriesJson,
  parseArgs,
  refreshTeacherLiveReview
};
