#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const Preflight = require("./preflight-vocab-review.js");
const PromotePlan = require("./build-vocab-promote-plan.js");
const ReviewDashboard = require("./build-vocab-review-dashboard.js");
const ReviewIndex = require("./build-vocab-review-index.js");
const ReviewPaths = require("./vocab-review-paths.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_DIR = ReviewPaths.DEFAULT_DIR;
const REVIEW_QUEUES = [
  {
    prefix: "teacher_vocab_review_batch_highvalue",
    indexFile: "teacher_vocab_review_index.json"
  },
  {
    prefix: "oxford_vocab_review_batch",
    indexFile: "oxford_vocab_review_index.json"
  },
  {
    prefix: "supplement_vocab_review_batch",
    indexFile: "supplement_vocab_review_index.json"
  },
  {
    prefix: "teacher_live_vocab_review_batch",
    indexFile: "teacher_live_vocab_review_index.json"
  }
];

function usage() {
  console.log([
    "Usage:",
    "  node scripts/process-vocab-review.js <review.xlsx|review.csv|review.json> [--out private_exports/promote_plan.json] [--preflight-out private_exports/preflight.json] [--no-refresh]",
    "",
    "Runs review preflight first. A promote plan is created only when preflight has no errors."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    input: "",
    out: "",
    preflightOut: "",
    refresh: true
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--out") {
      options.out = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--preflight-out") {
      options.preflightOut = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--no-refresh") {
      options.refresh = false;
      continue;
    }
    options.input = path.resolve(arg);
  }

  if (!options.input) throw new Error("Missing review file.");
  if (!options.out) options.out = ReviewPaths.inferPromotePlanPath(options.input);
  if (!options.preflightOut) options.preflightOut = ReviewPaths.inferPreflightPath(options.input);
  return options;
}

function writePromotePlan(plan = {}, out = "") {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(plan, null, 2)}\n`);
}

function getReviewQueueForInput(input = "") {
  const baseName = ReviewPaths.stripReviewExtension(input);
  return REVIEW_QUEUES.find((queue) => baseName.startsWith(`${queue.prefix}_`)) || null;
}

function refreshReviewStatus(input = "", options = {}) {
  const queue = getReviewQueueForInput(input);
  if (!queue) return null;
  const dir = ReviewPaths.inferOutputDir(input);
  const inputBaseName = ReviewPaths.stripReviewExtension(input);
  const batchId = inputBaseName.replace(`${queue.prefix}_`, "");
  const indexOut = path.join(dir, queue.indexFile);
  const index = ReviewIndex.writeIndex({
    dir,
    prefix: queue.prefix,
    out: indexOut
  });
  const dashboardOut = options.dashboardOut || path.join(dir, "vocab_review_dashboard.json");
  const dashboard = ReviewDashboard.writeDashboard({
    dir,
    out: dashboardOut
  });
  return {
    queue: queue.prefix,
    indexOut,
    dashboardOut,
    status: (index.batches || []).find((batch) => batch.id === batchId)?.status || "",
    batchCount: index.meta?.batchCount || 0,
    dashboardQueueCount: dashboard.queues?.length || 0
  };
}

async function processReview(options = {}) {
  const input = path.resolve(options.input || "");
  const preflightOut = path.resolve(options.preflightOut || ReviewPaths.inferPreflightPath(input));
  const out = path.resolve(options.out || ReviewPaths.inferPromotePlanPath(input));

  const rows = await Preflight.readReviewRows(input);
  const preflightReport = Preflight.buildReport(rows, { input });
  Preflight.writeReport(preflightReport, preflightOut);

  const summary = {
    input,
    preflightOut,
    preflightPass: preflightReport.summary.pass,
    rowCount: preflightReport.summary.rowCount,
    reviewedRowCount: preflightReport.summary.reviewedRowCount,
    errorCount: preflightReport.summary.errorCount,
    warningCount: preflightReport.summary.warningCount,
    out: "",
    reviewedEntryCount: 0,
    findingCount: 0,
    pass: false,
    refreshed: null
  };

  if (!preflightReport.summary.pass) {
    summary.note = "Preflight failed. Fix the reviewed Excel/CSV before creating a promote plan.";
    if (options.refresh !== false) summary.refreshed = refreshReviewStatus(input, options);
    return { summary, preflightReport, plan: null };
  }

  const reviewBatch = await PromotePlan.loadReviewInput(input);
  const plan = PromotePlan.buildPromotePlan(reviewBatch);
  writePromotePlan(plan, out);

  summary.out = out;
  summary.reviewedEntryCount = plan.meta.reviewedEntryCount;
  summary.findingCount = plan.meta.findingCount;
  summary.pass = plan.meta.findingCount === 0;
  summary.note = summary.pass
    ? "Promote plan created. Dry-run apply-plan before using --write."
    : "Promote plan created but still has findings. Fix before applying.";
  if (options.refresh !== false) summary.refreshed = refreshReviewStatus(input, options);

  return { summary, preflightReport, plan };
}

function relativeSummary(summary = {}) {
  return {
    ...summary,
    input: summary.input ? path.relative(ROOT_DIR, summary.input) : "",
    preflightOut: summary.preflightOut ? path.relative(ROOT_DIR, summary.preflightOut) : "",
    out: summary.out ? path.relative(ROOT_DIR, summary.out) : "",
    refreshed: summary.refreshed ? {
      ...summary.refreshed,
      indexOut: summary.refreshed.indexOut ? path.relative(ROOT_DIR, summary.refreshed.indexOut) : "",
      dashboardOut: summary.refreshed.dashboardOut ? path.relative(ROOT_DIR, summary.refreshed.dashboardOut) : ""
    } : null
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await processReview(options);
  console.log(JSON.stringify(relativeSummary(result.summary), null, 2));
  if (!result.summary.pass) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  inferPreflightPath: ReviewPaths.inferPreflightPath,
  inferPromotePlanName: ReviewPaths.inferPromotePlanName,
  inferPromotePlanPath: ReviewPaths.inferPromotePlanPath,
  inferOutputDir: ReviewPaths.inferOutputDir,
  getReviewQueueForInput,
  parseArgs,
  processReview,
  relativeSummary,
  refreshReviewStatus,
  stripReviewExtension: ReviewPaths.stripReviewExtension,
  writePromotePlan
};
