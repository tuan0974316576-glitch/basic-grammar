#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const Preflight = require("./preflight-vocab-review.js");
const PromotePlan = require("./build-vocab-promote-plan.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_DIR = path.join(ROOT_DIR, "private_exports");

function usage() {
  console.log([
    "Usage:",
    "  node scripts/process-vocab-review.js <review.xlsx|review.csv|review.json> [--out private_exports/promote_plan.json] [--preflight-out private_exports/preflight.json]",
    "",
    "Runs review preflight first. A promote plan is created only when preflight has no errors."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    input: "",
    out: "",
    preflightOut: ""
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
    options.input = path.resolve(arg);
  }

  if (!options.input) throw new Error("Missing review file.");
  if (!options.out) options.out = inferPromotePlanPath(options.input);
  if (!options.preflightOut) options.preflightOut = inferPreflightPath(options.input);
  return options;
}

function stripReviewExtension(filePath = "") {
  return path.basename(filePath).replace(/\.(?:xlsx|csv|json)$/i, "");
}

function inferOutputDir(filePath = "") {
  const dir = path.dirname(path.resolve(filePath || DEFAULT_DIR));
  return dir || DEFAULT_DIR;
}

function inferPromotePlanName(baseName = "") {
  if (/^teacher_vocab_review_batch_highvalue_/i.test(baseName)) {
    return baseName.replace(/^teacher_vocab_review_batch_highvalue_/i, "teacher_vocab_promote_plan_highvalue_");
  }
  if (/^oxford_vocab_review_batch_/i.test(baseName)) {
    return baseName.replace(/^oxford_vocab_review_batch_/i, "oxford_vocab_promote_plan_");
  }
  if (/^supplement_vocab_review_batch_/i.test(baseName)) {
    return baseName.replace(/^supplement_vocab_review_batch_/i, "supplement_vocab_promote_plan_");
  }
  if (/vocab_review_batch/i.test(baseName)) {
    return baseName.replace(/vocab_review_batch/i, "vocab_promote_plan");
  }
  if (/review_batch/i.test(baseName)) {
    return baseName.replace(/review_batch/i, "promote_plan");
  }
  return `${baseName}_promote_plan`;
}

function inferPromotePlanPath(input = "") {
  return path.join(inferOutputDir(input), `${inferPromotePlanName(stripReviewExtension(input))}.json`);
}

function inferPreflightPath(input = "") {
  return path.join(inferOutputDir(input), `${stripReviewExtension(input)}_preflight.json`);
}

function writePromotePlan(plan = {}, out = "") {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(plan, null, 2)}\n`);
}

async function processReview(options = {}) {
  const input = path.resolve(options.input || "");
  const preflightOut = path.resolve(options.preflightOut || inferPreflightPath(input));
  const out = path.resolve(options.out || inferPromotePlanPath(input));

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
    pass: false
  };

  if (!preflightReport.summary.pass) {
    summary.note = "Preflight failed. Fix the reviewed Excel/CSV before creating a promote plan.";
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

  return { summary, preflightReport, plan };
}

function relativeSummary(summary = {}) {
  return {
    ...summary,
    input: summary.input ? path.relative(ROOT_DIR, summary.input) : "",
    preflightOut: summary.preflightOut ? path.relative(ROOT_DIR, summary.preflightOut) : "",
    out: summary.out ? path.relative(ROOT_DIR, summary.out) : ""
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
  inferPreflightPath,
  inferPromotePlanName,
  inferPromotePlanPath,
  parseArgs,
  processReview,
  relativeSummary,
  stripReviewExtension,
  writePromotePlan
};
