#!/usr/bin/env node
"use strict";

const path = require("path");
const VocabPosInference = require("../vocab_pos_inference.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_SEED = path.join(ROOT_DIR, "private_exports", "vocab_meaning_seed.js");
const SIMPLIFIED_RE = /[这为个汉语龙门东车后发会学体国实对时过苹]/;
const SUSPICIOUS_RE = /[A-Za-z]{2,}|例句|句子|意思是|翻譯|translation|undefined|null/i;

function usage() {
  console.log([
    "Usage:",
    "  node scripts/review-vocab-meaning-seed.js [seed-file]",
    "",
    "Prints suspicious generated vocab meanings for manual review."
  ].join("\n"));
}

function loadSeed(filePath) {
  const resolved = path.resolve(filePath || DEFAULT_SEED);
  delete require.cache[require.resolve(resolved)];
  return require(resolved);
}

function getEntryFindings(key, payload = {}) {
  const findings = [];
  if (payload.status !== "ready") {
    findings.push("not ready");
  }
  if (VocabPosInference.normalizeWord(payload.word) !== key) {
    findings.push("key/word mismatch");
  }
  const senses = Array.isArray(payload.entries) ? payload.entries : [];
  if (!senses.length) {
    findings.push("missing senses");
  }
  const seen = new Set();
  senses.forEach((sense) => {
    const meaning = String(sense.meaning || "").trim();
    const pos = VocabPosInference.normalizePos(sense.pos);
    if (!meaning) findings.push("empty meaning");
    if (!pos) findings.push("missing POS");
    if (meaning.length > 28) findings.push("meaning too long");
    if (SIMPLIFIED_RE.test(meaning)) findings.push("possible Simplified Chinese");
    if (SUSPICIOUS_RE.test(meaning)) findings.push("suspicious meaning text");
    const senseKey = `${pos}:${meaning}`;
    if (seen.has(senseKey)) findings.push("duplicate sense");
    seen.add(senseKey);
  });
  return Array.from(new Set(findings));
}

function main(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    usage();
    return 0;
  }
  const seed = loadSeed(argv[0]);
  const findings = Object.entries(seed.entries || {})
    .map(([key, entry]) => ({ key, entry, reasons: getEntryFindings(key, entry) }))
    .filter((finding) => finding.reasons.length);

  console.log(JSON.stringify({
    entryCount: Object.keys(seed.entries || {}).length,
    findingCount: findings.length,
    findings: findings.map(({ key, entry, reasons }) => ({
      key,
      reasons,
      word: entry.word,
      level: entry.level,
      entries: entry.entries
    }))
  }, null, 2));
  return findings.length ? 1 : 0;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = {
  getEntryFindings,
  loadSeed
};
