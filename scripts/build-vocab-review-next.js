#!/usr/bin/env node
"use strict";

const { spawnSync } = require("child_process");
const path = require("path");
const ReviewBatch = require("./build-vocab-review-batch.js");
const ReviewIndex = require("./build-vocab-review-index.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const PRIVATE_EXPORTS_DIR = path.join(ROOT_DIR, "private_exports");
const DEFAULT_PREFIX = "teacher_vocab_review_batch_highvalue";
const DEFAULT_INDEX = path.join(PRIVATE_EXPORTS_DIR, "teacher_vocab_review_index.json");
const DEFAULT_LIMIT = 100;

function usage() {
  console.log([
    "Usage:",
    "  node scripts/build-vocab-review-next.js [--limit 100] [--offset n] [--no-xlsx]",
    "",
    "Builds the next teacher vocab review batch from the private index.",
    "Default source is teacher-audit with --skip-junk."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    dir: PRIVATE_EXPORTS_DIR,
    indexOut: DEFAULT_INDEX,
    limit: DEFAULT_LIMIT,
    offset: null,
    prefix: DEFAULT_PREFIX,
    source: "teacher-audit",
    skipJunk: true,
    xlsx: true
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
    if (arg === "--index-out") {
      options.indexOut = path.resolve(argv[index + 1] || DEFAULT_INDEX);
      index += 1;
      continue;
    }
    if (arg === "--limit") {
      options.limit = Math.max(1, Number(argv[index + 1]) || DEFAULT_LIMIT);
      index += 1;
      continue;
    }
    if (arg === "--offset") {
      options.offset = Math.max(0, Number(argv[index + 1]) || 0);
      index += 1;
      continue;
    }
    if (arg === "--prefix") {
      options.prefix = String(argv[index + 1] || DEFAULT_PREFIX).trim();
      index += 1;
      continue;
    }
    if (arg === "--source") {
      options.source = String(argv[index + 1] || options.source).trim();
      index += 1;
      continue;
    }
    if (arg === "--no-skip-junk") {
      options.skipJunk = false;
      continue;
    }
    if (arg === "--no-xlsx") {
      options.xlsx = false;
      continue;
    }
  }

  return options;
}

function batchId(offset) {
  return String(Number(offset) || 0).padStart(4, "0");
}

function outputPaths(options = {}) {
  const id = batchId(options.offset);
  const base = path.join(options.dir || PRIVATE_EXPORTS_DIR, `${options.prefix || DEFAULT_PREFIX}_${id}`);
  return {
    id,
    json: `${base}.json`,
    csv: `${base}.csv`,
    xlsx: `${base}.xlsx`
  };
}

function getNextOffset(options = {}) {
  if (options.offset !== null && options.offset !== undefined) return Number(options.offset) || 0;
  const index = ReviewIndex.buildIndex({
    dir: options.dir,
    prefix: options.prefix
  });
  return Number(index.meta?.nextOffset) || 0;
}

function buildNextBatch(options = {}) {
  const offset = getNextOffset(options);
  const resolved = {
    ...options,
    offset
  };
  const paths = outputPaths(resolved);
  const allTasks = ReviewBatch.getReviewTasks({
    source: resolved.source,
    skipJunk: resolved.skipJunk,
    offset,
    limit: resolved.limit
  });
  const selectedTasks = allTasks.slice(offset, offset + resolved.limit);
  const rows = ReviewBatch.buildReviewRows({
    source: resolved.source,
    skipJunk: resolved.skipJunk,
    offset,
    limit: resolved.limit,
    tasks: selectedTasks
  });
  const output = ReviewBatch.writeOutputs({
    source: resolved.source,
    skipJunk: resolved.skipJunk,
    offset,
    limit: resolved.limit,
    out: paths.json,
    csv: paths.csv
  }, rows, allTasks.length);

  if (resolved.xlsx) {
    const result = spawnSync(process.execPath, [
      path.join(ROOT_DIR, "scripts", "build-vocab-review-xlsx.mjs"),
      paths.json,
      "--out",
      paths.xlsx,
      "--no-preview"
    ], {
      cwd: ROOT_DIR,
      encoding: "utf8"
    });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status !== 0) {
      throw new Error(`Failed to build XLSX for ${paths.json}`);
    }
  }

  const index = ReviewIndex.writeIndex({
    dir: resolved.dir,
    out: resolved.indexOut,
    prefix: resolved.prefix
  });

  return {
    id: paths.id,
    offset,
    limit: resolved.limit,
    selectedCount: output.meta.selectedCount,
    totalCandidateCount: output.meta.totalCandidateCount,
    nextOffset: output.meta.nextOffset,
    json: path.relative(ROOT_DIR, paths.json),
    csv: path.relative(ROOT_DIR, paths.csv),
    xlsx: path.relative(ROOT_DIR, paths.xlsx),
    index: path.relative(ROOT_DIR, resolved.indexOut),
    indexNextOffset: index.meta.nextOffset
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const summary = buildNextBatch(options);
  console.log(JSON.stringify(summary, null, 2));
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
  batchId,
  buildNextBatch,
  getNextOffset,
  outputPaths,
  parseArgs
};
