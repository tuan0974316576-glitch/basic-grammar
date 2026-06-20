#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const PRIVATE_EXPORTS_DIR = path.join(ROOT_DIR, "private_exports");
const DEFAULT_OUTPUT = path.join(PRIVATE_EXPORTS_DIR, "vocab_review_dashboard.json");
const DEFAULT_QUEUES = [
  {
    id: "teacher",
    label: "Teacher vocab cleanup",
    indexFile: "teacher_vocab_review_index.json",
    command: "npm run vocab:review-next",
    priority: 1
  },
  {
    id: "oxford",
    label: "Oxford / common vocab",
    indexFile: "oxford_vocab_review_index.json",
    command: "npm run vocab:review-next:oxford -- --count 1",
    priority: 2
  },
  {
    id: "supplement",
    label: "Country / city / HK / school supplement",
    indexFile: "supplement_vocab_review_index.json",
    command: "npm run vocab:review-next:supplement -- --count 1",
    priority: 3
  },
  {
    id: "teacher-live",
    label: "Teacher live cloud review",
    indexFile: "teacher_live_vocab_review_index.json",
    command: "npm run vocab:export-teacher-live && npm run vocab:review-next:teacher-live -- --count 1",
    priority: 4
  }
];

function usage() {
  console.log([
    "Usage:",
    "  node scripts/build-vocab-review-dashboard.js [--dir private_exports] [--out private_exports/vocab_review_dashboard.json]",
    "",
    "Builds a private JSON/CSV dashboard across teacher, Oxford, and supplement vocab review queues."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    dir: PRIVATE_EXPORTS_DIR,
    out: DEFAULT_OUTPUT
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--dir") {
      options.dir = path.resolve(argv[index + 1] || PRIVATE_EXPORTS_DIR);
      index += 1;
      continue;
    }
    if (arg === "--out") {
      options.out = path.resolve(argv[index + 1] || DEFAULT_OUTPUT);
      index += 1;
      continue;
    }
  }

  return options;
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function pct(numerator, denominator) {
  const bottom = Number(denominator) || 0;
  if (!bottom) return 0;
  return (Number(numerator) || 0) / bottom;
}

function formatPercent(value) {
  return `${Math.round((Number(value) || 0) * 1000) / 10}%`;
}

function summarizeQueue(queue = {}, options = {}) {
  const dir = options.dir || PRIVATE_EXPORTS_DIR;
  const indexPath = path.join(dir, queue.indexFile);
  const index = readJsonIfExists(indexPath);
  if (!index) {
    return {
      id: queue.id,
      label: queue.label,
      priority: queue.priority,
      status: "missing-index",
      nextAction: `Run ${queue.command}`,
      index: path.relative(ROOT_DIR, indexPath),
      command: queue.command,
      privateOnly: true
    };
  }

  const meta = index.meta || {};
  const batches = Array.isArray(index.batches) ? index.batches : [];
  const totalCandidateCount = Number(meta.totalCandidateCount) || 0;
  const coveredCount = Number(meta.coveredCount) || 0;
  const reviewedEntryCount = batches.reduce((sum, batch) => sum + (Number(batch.reviewedEntryCount) || 0), 0);
  const entryCount = batches.reduce((sum, batch) => sum + (Number(batch.entryCount) || 0), 0);
  const isEmptyQueue = totalCandidateCount === 0 && entryCount === 0;
  const readyForReviewBatchCount = Number(meta.readyForReviewBatchCount) || batches.filter((batch) => batch.xlsxExists).length;
  const promotePlanBatchCount = Number(meta.promotePlanBatchCount) || batches.filter((batch) => batch.promotePlanExists).length;
  const appliedBatchCount = Number(meta.appliedBatchCount) || batches.filter((batch) => batch.applyPlanExists).length;
  const liveSyncedBatchCount = Number(meta.liveSyncedBatchCount) || batches.filter((batch) => batch.liveSyncExists).length;
  const liveSyncedEntryCount = Number(meta.liveSyncedEntryCount)
    || batches.reduce((sum, batch) => sum + (Number(batch.liveSyncEntryCount) || 0), 0);
  const preflightFailedBatchCount = Number(meta.preflightFailedBatchCount) || batches.filter((batch) => batch.status === "preflight-failed").length;
  const preflightPassedBatchCount = Number(meta.preflightPassedBatchCount) || batches.filter((batch) => batch.status === "preflight-passed").length;
  const needsXlsxBatchCount = batches.filter((batch) => batch.status === "needs-xlsx").length;
  const readyButUnplannedCount = batches.filter((batch) => batch.xlsxExists && !batch.promotePlanExists && batch.status !== "preflight-failed").length;
  const missingBatchCount = batches.filter((batch) => batch.status === "missing").length;
  const coverage = pct(coveredCount, totalCandidateCount);
  const reviewProgress = pct(reviewedEntryCount, entryCount);
  let status = "ready-for-teacher-review";
  if (preflightPassedBatchCount > 0) status = "preflight-passed";
  if (promotePlanBatchCount > 0) status = "has-promote-plans";
  if (coveredCount < totalCandidateCount) status = "needs-more-batches";
  if (appliedBatchCount > 0) status = "has-applied-batches";
  if (liveSyncedBatchCount > 0) status = "has-live-synced-batches";
  if (needsXlsxBatchCount) status = "needs-xlsx";
  if (preflightFailedBatchCount) status = "has-preflight-errors";
  if (missingBatchCount) status = "has-missing-files";
  if (isEmptyQueue) status = "empty";

  let nextAction = "Dry-run apply-plan for promote plans, then write when checked";
  if (readyButUnplannedCount) nextAction = "Run vocab:process-review after filling yellow review columns";
  if (status === "needs-xlsx") nextAction = "Generate XLSX for batches marked needs-xlsx";
  if (status === "has-live-synced-batches") nextAction = "Continue with remaining review batches";
  if (status === "has-applied-batches") nextAction = "Sync teacher entries live if needed, then continue with remaining review batches";
  if (status === "has-preflight-errors") nextAction = "Fix rows listed in *_preflight.csv, then rerun vocab:process-review";
  if (status === "needs-more-batches") nextAction = queue.command;
  if (status === "empty") nextAction = "No entries to review yet. Export again after adding teacher live vocab.";

  return {
    id: queue.id,
    label: queue.label,
    priority: queue.priority,
    status,
    nextAction,
    command: queue.command,
    index: path.relative(ROOT_DIR, indexPath),
    prefix: meta.prefix || "",
    generatedAt: meta.generatedAt || "",
    batchCount: Number(meta.batchCount) || batches.length,
    totalCandidateCount,
    coveredCount,
    coverage,
    coverageLabel: formatPercent(coverage),
    readyForReviewBatchCount,
    readyButUnplannedCount,
    needsXlsxBatchCount,
    preflightFailedBatchCount,
    preflightPassedBatchCount,
    promotePlanBatchCount,
    appliedBatchCount,
    liveSyncedBatchCount,
    liveSyncedEntryCount,
    reviewedEntryCount,
    reviewProgress,
    reviewProgressLabel: formatPercent(reviewProgress),
    nextOffset: Number(meta.nextOffset) || 0,
    nextBatchId: meta.nextBatchId || "",
    nextJson: meta.nextJson || "",
    nextXlsx: meta.nextXlsx || "",
    privateOnly: true
  };
}

function buildDashboard(options = {}) {
  const queues = DEFAULT_QUEUES.map((queue) => summarizeQueue(queue, options));
  const totals = queues.reduce((acc, queue) => {
    acc.totalCandidateCount += Number(queue.totalCandidateCount) || 0;
    acc.coveredCount += Number(queue.coveredCount) || 0;
    acc.batchCount += Number(queue.batchCount) || 0;
    acc.readyForReviewBatchCount += Number(queue.readyForReviewBatchCount) || 0;
    acc.preflightFailedBatchCount += Number(queue.preflightFailedBatchCount) || 0;
    acc.preflightPassedBatchCount += Number(queue.preflightPassedBatchCount) || 0;
    acc.promotePlanBatchCount += Number(queue.promotePlanBatchCount) || 0;
    acc.appliedBatchCount += Number(queue.appliedBatchCount) || 0;
    acc.liveSyncedBatchCount += Number(queue.liveSyncedBatchCount) || 0;
    acc.liveSyncedEntryCount += Number(queue.liveSyncedEntryCount) || 0;
    acc.reviewedEntryCount += Number(queue.reviewedEntryCount) || 0;
    return acc;
  }, {
    totalCandidateCount: 0,
    coveredCount: 0,
    batchCount: 0,
    readyForReviewBatchCount: 0,
    preflightFailedBatchCount: 0,
    preflightPassedBatchCount: 0,
    promotePlanBatchCount: 0,
    appliedBatchCount: 0,
    liveSyncedBatchCount: 0,
    liveSyncedEntryCount: 0,
    reviewedEntryCount: 0
  });
  totals.coverage = pct(totals.coveredCount, totals.totalCandidateCount);
  totals.coverageLabel = formatPercent(totals.coverage);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      privateOnly: true,
      note: "Private dashboard only. Review batches and Oxford-derived checklist files must stay out of git."
    },
    totals,
    queues
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, "\"\"")}"`;
}

function buildCsv(dashboard = {}) {
  const headers = [
    "id",
    "label",
    "status",
    "next_action",
    "batch_count",
    "total_candidates",
    "covered",
    "coverage",
    "ready_batches",
    "needs_xlsx_batches",
    "preflight_failed_batches",
    "preflight_passed_batches",
    "promote_plan_batches",
    "applied_batches",
    "live_synced_batches",
    "live_synced_entries",
    "reviewed_entries",
    "review_progress",
    "index",
    "next_xlsx"
  ];
  const lines = [headers.join(",")];
  (dashboard.queues || []).forEach((queue) => {
    const row = {
      id: queue.id,
      label: queue.label,
      status: queue.status,
      next_action: queue.nextAction,
      batch_count: queue.batchCount,
      total_candidates: queue.totalCandidateCount,
      covered: queue.coveredCount,
      coverage: queue.coverageLabel,
      ready_batches: queue.readyForReviewBatchCount,
      needs_xlsx_batches: queue.needsXlsxBatchCount,
      preflight_failed_batches: queue.preflightFailedBatchCount,
      preflight_passed_batches: queue.preflightPassedBatchCount,
      promote_plan_batches: queue.promotePlanBatchCount,
      applied_batches: queue.appliedBatchCount,
      live_synced_batches: queue.liveSyncedBatchCount,
      live_synced_entries: queue.liveSyncedEntryCount,
      reviewed_entries: queue.reviewedEntryCount,
      review_progress: queue.reviewProgressLabel,
      index: queue.index,
      next_xlsx: queue.nextXlsx
    };
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  });
  return `${lines.join("\n")}\n`;
}

function writeDashboard(options = {}) {
  const dashboard = buildDashboard(options);
  const out = options.out || DEFAULT_OUTPUT;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(dashboard, null, 2)}\n`);
  fs.writeFileSync(out.replace(/\.json$/i, ".csv"), buildCsv(dashboard));
  return dashboard;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const dashboard = writeDashboard(options);
  console.log(JSON.stringify({
    out: path.relative(ROOT_DIR, options.out),
    queueCount: dashboard.queues.length,
    totalCandidateCount: dashboard.totals.totalCandidateCount,
    coveredCount: dashboard.totals.coveredCount,
    coverage: dashboard.totals.coverageLabel
  }, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

module.exports = {
  buildCsv,
  buildDashboard,
  DEFAULT_QUEUES,
  formatPercent,
  parseArgs,
  summarizeQueue,
  writeDashboard
};
