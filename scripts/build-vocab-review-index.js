#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const ReviewPaths = require("./vocab-review-paths.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const PRIVATE_EXPORTS_DIR = path.join(ROOT_DIR, "private_exports");
const DEFAULT_PREFIX = "teacher_vocab_review_batch_highvalue";
const DEFAULT_OUTPUT = path.join(PRIVATE_EXPORTS_DIR, "teacher_vocab_review_index.json");
const REVIEW_BATCH_RE = /^(.+)_(\d{4,})\.json$/;

function usage() {
  console.log([
    "Usage:",
    "  node scripts/build-vocab-review-index.js [--prefix teacher_vocab_review_batch_highvalue] [--out private_exports/teacher_vocab_review_index.json]",
    "",
    "Scans private review batches and writes a private index so cleanup can continue in order."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    dir: PRIVATE_EXPORTS_DIR,
    out: DEFAULT_OUTPUT,
    prefix: DEFAULT_PREFIX
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
    if (arg === "--prefix") {
      options.prefix = String(argv[index + 1] || DEFAULT_PREFIX).trim();
      index += 1;
      continue;
    }
  }

  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function readPreflightSummary(filePath) {
  if (!fileExists(filePath)) return null;
  try {
    const payload = readJson(filePath);
    return payload.summary || null;
  } catch (_error) {
    return null;
  }
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, "\"\"")}"`;
}

function batchStatus(batch = {}) {
  if (batch.applyPlanExists) return "applied-or-ready-to-apply";
  if (batch.promotePlanExists) return "promote-plan-created";
  if (batch.preflightExists && batch.preflightPass === false) return "preflight-failed";
  if (batch.preflightExists && batch.preflightPass === true) return "preflight-passed";
  if (batch.xlsxExists) return "ready-for-teacher-review";
  if (batch.csvExists || batch.jsonExists) return "needs-xlsx";
  return "missing";
}

function buildBatchRecord(filePath, options = {}) {
  const fileName = path.basename(filePath);
  const match = fileName.match(REVIEW_BATCH_RE);
  if (!match || match[1] !== options.prefix) return null;
  const payload = readJson(filePath);
  const meta = payload.meta || {};
  const basename = path.join(path.dirname(filePath), fileName.replace(/\.json$/i, ""));
  const suffix = match[2];
  const xlsxPath = `${basename}.xlsx`;
  const csvPath = `${basename}.csv`;
  const reviewInputPath = fileExists(xlsxPath) ? xlsxPath : fileExists(csvPath) ? csvPath : filePath;
  const promotePlanPath = ReviewPaths.inferPromotePlanPath(reviewInputPath);
  const preflightPath = ReviewPaths.inferPreflightPath(reviewInputPath);
  const preflightSummary = readPreflightSummary(preflightPath);
  const entryCount = Array.isArray(payload.entries) ? payload.entries.length : 0;
  const reviewedEntryCount = Array.isArray(payload.entries)
    ? payload.entries.filter((entry) => {
      const review = entry.review || {};
      return Boolean(review.reviewed_meaning || review.reviewedMeaning || review.approvedEntries?.length);
    }).length
    : 0;

  const record = {
    id: suffix,
    source: meta.source || "",
    offset: Number(meta.offset) || Number(suffix) || 0,
    limit: Number(meta.limit) || entryCount,
    selectedCount: Number(meta.selectedCount) || entryCount,
    totalCandidateCount: Number(meta.totalCandidateCount) || 0,
    nextOffset: Number(meta.nextOffset) || ((Number(meta.offset) || 0) + entryCount),
    entryCount,
    reviewedEntryCount,
    generatedAt: meta.generatedAt || "",
    json: path.relative(ROOT_DIR, filePath),
    csv: path.relative(ROOT_DIR, csvPath),
    xlsx: path.relative(ROOT_DIR, xlsxPath),
    preflight: path.relative(ROOT_DIR, preflightPath),
    promotePlan: path.relative(ROOT_DIR, promotePlanPath),
    jsonExists: true,
    csvExists: fileExists(csvPath),
    xlsxExists: fileExists(xlsxPath),
    preflightExists: fileExists(preflightPath),
    preflightPass: preflightSummary ? Boolean(preflightSummary.pass) : null,
    preflightErrorCount: preflightSummary ? Number(preflightSummary.errorCount) || 0 : 0,
    preflightWarningCount: preflightSummary ? Number(preflightSummary.warningCount) || 0 : 0,
    promotePlanExists: fileExists(promotePlanPath),
    applyPlanExists: false
  };
  return {
    ...record,
    status: batchStatus(record)
  };
}

function buildIndex(options = {}) {
  const dir = options.dir || PRIVATE_EXPORTS_DIR;
  const prefix = options.prefix || DEFAULT_PREFIX;
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const batches = files
    .filter((file) => file.endsWith(".json"))
    .map((file) => buildBatchRecord(path.join(dir, file), { prefix }))
    .filter(Boolean)
    .sort((left, right) => left.offset - right.offset);
  const latest = batches[batches.length - 1] || null;
  const totalCandidateCount = latest?.totalCandidateCount || batches.find((batch) => batch.totalCandidateCount)?.totalCandidateCount || 0;
  const coveredCount = batches.reduce((max, batch) => Math.max(max, batch.nextOffset), 0);
  const nextOffset = latest?.nextOffset || 0;
  const nextId = String(nextOffset).padStart(4, "0");
  const readyForReviewBatchCount = batches.filter((batch) => batch.xlsxExists).length;
  const promotePlanBatchCount = batches.filter((batch) => batch.promotePlanExists).length;
  const preflightFailedBatchCount = batches.filter((batch) => batch.status === "preflight-failed").length;
  const preflightPassedBatchCount = batches.filter((batch) => batch.status === "preflight-passed").length;

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      prefix,
      batchCount: batches.length,
      totalCandidateCount,
      coveredCount,
      readyForReviewBatchCount,
      promotePlanBatchCount,
      preflightFailedBatchCount,
      preflightPassedBatchCount,
      nextOffset,
      nextBatchId: nextId,
      nextJson: path.relative(ROOT_DIR, path.join(dir, `${prefix}_${nextId}.json`)),
      nextXlsx: path.relative(ROOT_DIR, path.join(dir, `${prefix}_${nextId}.xlsx`)),
      privateOnly: true
    },
    batches
  };
}

function buildCsv(index = {}) {
  const headers = [
    "id",
    "status",
    "offset",
    "limit",
    "selected_count",
    "next_offset",
    "entry_count",
    "reviewed_entry_count",
    "json",
    "csv",
    "xlsx",
    "preflight",
    "preflight_pass",
    "preflight_errors",
    "promote_plan"
  ];
  const lines = [headers.join(",")];
  (index.batches || []).forEach((batch) => {
    const row = {
      id: batch.id,
      status: batch.status,
      offset: batch.offset,
      limit: batch.limit,
      selected_count: batch.selectedCount,
      next_offset: batch.nextOffset,
      entry_count: batch.entryCount,
      reviewed_entry_count: batch.reviewedEntryCount,
      json: batch.json,
      csv: batch.csv,
      xlsx: batch.xlsx,
      preflight: batch.preflight,
      preflight_pass: batch.preflightPass,
      preflight_errors: batch.preflightErrorCount,
      promote_plan: batch.promotePlan
    };
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  });
  return `${lines.join("\n")}\n`;
}

function writeIndex(options = {}) {
  const index = buildIndex(options);
  fs.mkdirSync(path.dirname(options.out || DEFAULT_OUTPUT), { recursive: true });
  fs.writeFileSync(options.out || DEFAULT_OUTPUT, `${JSON.stringify(index, null, 2)}\n`);
  fs.writeFileSync((options.out || DEFAULT_OUTPUT).replace(/\.json$/i, ".csv"), buildCsv(index));
  return index;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const index = writeIndex(options);
  console.log(JSON.stringify(index.meta, null, 2));
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
  batchStatus,
  buildBatchRecord,
  buildCsv,
  buildIndex,
  parseArgs,
  readPreflightSummary,
  writeIndex
};
