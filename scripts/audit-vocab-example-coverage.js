#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const VocabExampleUtils = require("../vocab_example_utils.js");
const generator = require("./generate-vocab-examples.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_SEED = path.join(ROOT_DIR, "vocab_example_seed.js");
const DEFAULT_OUT = path.join(ROOT_DIR, "private_exports", "vocab_example_coverage_gaps.json");
const EXAMPLES_PER_ENTRY = generator.EXAMPLES_PER_ENTRY || 3;

function usage() {
  console.log([
    "Usage:",
    "  node scripts/audit-vocab-example-coverage.js [options]",
    "",
    "Options:",
    "  --seed <file>          Vocab example seed file.",
    "  --out <file>           Write full JSON gap report.",
    "  --no-write             Print summary only.",
    "  --limit <n>            Include only first n gap rows in stdout sample."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    seed: DEFAULT_SEED,
    out: DEFAULT_OUT,
    write: true,
    limit: 20
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--seed") {
      options.seed = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--out") {
      options.out = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--no-write") {
      options.write = false;
      continue;
    }
    if (arg === "--limit") {
      options.limit = Math.max(0, Number(argv[index + 1]) || 0);
      index += 1;
    }
  }
  return options;
}

function loadSeed(filePath) {
  const resolved = path.resolve(filePath);
  delete require.cache[require.resolve(resolved)];
  return require(resolved);
}

function normalizeExampleText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function countValidExamples(payload = {}) {
  const seen = new Set();
  return (Array.isArray(payload.examples) ? payload.examples : [])
    .filter((example) => {
      const source = normalizeExampleText(example.source);
      const target = normalizeExampleText(example.target);
      if (!source || !target) return false;
      const key = `${source}|${target}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).length;
}

function auditCoverage(options = {}) {
  const seed = loadSeed(options.seed || DEFAULT_SEED);
  const blockedKeys = generator.getBlockedSeedKeys(seed);
  const tasks = generator.buildTasks();
  const taskKeys = new Set(tasks.map((task) => task.localKey));
  const staleSeedEntries = Object.entries(seed.entries || {})
    .filter(([localKey]) => !taskKeys.has(localKey))
    .map(([localKey, payload]) => ({
      localKey,
      word: payload.word || "",
      meaning: payload.meaning || "",
      pos: payload.pos || "",
      type: payload.type || "",
      level: payload.level || "",
      status: payload.status || "",
      validExampleCount: countValidExamples(payload)
    }));
  const gaps = [];
  const sourceCounts = {};
  const levelCounts = {};

  tasks.forEach((task) => {
    sourceCounts[task.source] = (sourceCounts[task.source] || 0) + 1;
    levelCounts[task.level] = (levelCounts[task.level] || 0) + 1;
    const payload = seed.entries?.[task.localKey];
    const validExampleCount = payload ? countValidExamples(payload) : 0;
    const blocked = blockedKeys.has(task.localKey);
    if (validExampleCount < EXAMPLES_PER_ENTRY) {
      gaps.push({
        word: task.word,
        display: task.display,
        meaning: task.meaning,
        pos: task.pos,
        type: task.type,
        level: task.level,
        source: task.source,
        localKey: task.localKey,
        cloudKey: task.cloudKey,
        validExampleCount,
        missingExampleCount: EXAMPLES_PER_ENTRY - validExampleCount,
        status: payload?.status || (blocked ? "blocked" : "missing"),
        blocked
      });
    }
  });

  const blockedGapCount = gaps.filter((gap) => gap.blocked).length;
  const summary = {
    checkedAt: new Date().toISOString(),
    requiredExamplesPerEntry: EXAMPLES_PER_ENTRY,
    taskCount: tasks.length,
    seedEntryCount: Object.keys(seed.entries || {}).length,
    staleSeedEntryCount: staleSeedEntries.length,
    fullyCoveredCount: tasks.length - gaps.length,
    gapCount: gaps.length,
    blockedGapCount,
    actionableGapCount: gaps.length - blockedGapCount,
    sourceCounts,
    levelCounts
  };

  return { summary, gaps, staleSeedEntries };
}

function writeReport(filePath, report) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(report, null, 2)}\n`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = auditCoverage(options);
  if (options.write) {
    writeReport(options.out, report);
  }
  console.log(JSON.stringify({
    ...report.summary,
    out: options.write ? options.out : ""
  }, null, 2));
  const sample = report.gaps.slice(0, options.limit);
  if (sample.length) {
    console.log(JSON.stringify(sample, null, 2));
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  auditCoverage,
  countValidExamples
};
