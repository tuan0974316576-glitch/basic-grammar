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
  const readyForReviewBatchCount = Number(meta.readyForReviewBatchCount) || batches.filter((batch) => batch.xlsxExists).length;
  const promotePlanBatchCount = Number(meta.promotePlanBatchCount) || batches.filter((batch) => batch.promotePlanExists).length;
  const needsXlsxBatchCount = batches.filter((batch) => batch.status === "needs-xlsx").length;
  const readyButUnplannedCount = batches.filter((batch) => batch.xlsxExists && !batch.promotePlanExists).length;
  const missingBatchCount = batches.filter((batch) => batch.status === "missing").length;
  const coverage = pct(coveredCount, totalCandidateCount);
  const reviewProgress = pct(reviewedEntryCount, entryCount);
  const status = missingBatchCount
    ? "has-missing-files"
    : needsXlsxBatchCount
      ? "needs-xlsx"
      : coveredCount < totalCandidateCount
        ? "needs-more-batches"
        : promotePlanBatchCount > 0
          ? "has-promote-plans"
          : "ready-for-teacher-review";
  const nextAction = status === "needs-more-batches"
    ? queue.command
    : status === "needs-xlsx"
      ? "Generate XLSX for batches marked needs-xlsx"
      : readyButUnplannedCount
        ? "Open private XLSX files and fill yellow review columns"
        : "Build promote plans for reviewed batches";

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
    promotePlanBatchCount,
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
    acc.promotePlanBatchCount += Number(queue.promotePlanBatchCount) || 0;
    acc.reviewedEntryCount += Number(queue.reviewedEntryCount) || 0;
    return acc;
  }, {
    totalCandidateCount: 0,
    coveredCount: 0,
    batchCount: 0,
    readyForReviewBatchCount: 0,
    promotePlanBatchCount: 0,
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
    "promote_plan_batches",
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
      promote_plan_batches: queue.promotePlanBatchCount,
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
