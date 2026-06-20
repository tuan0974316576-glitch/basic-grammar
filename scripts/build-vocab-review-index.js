#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

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

function csvEscape(value) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, "\"\"")}"`;
}

function batchStatus(batch = {}) {
  if (batch.applyPlanExists) return "applied-or-ready-to-apply";
  if (batch.promotePlanExists) return "promote-plan-created";
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
  const promotePlanPath = path.join(path.dirname(filePath), `${options.prefix.replace("review_batch", "promote_plan")}_${suffix}.json`);
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
    csv: path.relative(ROOT_DIR, `${basename}.csv`),
    xlsx: path.relative(ROOT_DIR, `${basename}.xlsx`),
    promotePlan: path.relative(ROOT_DIR, promotePlanPath),
    jsonExists: true,
    csvExists: fileExists(`${basename}.csv`),
    xlsxExists: fileExists(`${basename}.xlsx`),
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

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      prefix,
      batchCount: batches.length,
      totalCandidateCount,
      coveredCount,
      reviewedBatchCount: batches.filter((batch) => batch.status !== "needs-xlsx").length,
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
  writeIndex
};
