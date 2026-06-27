#!/usr/bin/env node
"use strict";

const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_SEED = path.join(ROOT_DIR, "vocab_example_seed.js");

const SUSPICIOUS_MEANING_RE = /prompt|缺點|歸根究底|話雖如此/i;
const ABSTRACT_A1_RE = /資金|斷食|禁食|驅使|驅動|事業|陪同|野味|竭盡全力|每況愈下|罰款|環保的|增長|電影\s*拍攝|總而言之|不久的將來|立即|放縱|換言|地球上的|好喜歡|好中意|似乎|唔洗講都知|日子已不復返|渴望|推廣|很好少|但是|想像|幻想|呈現|預計|四分人|統治|營運|經營|例如|判決|判刑|如果|健全|良好的|良好/;

function usage() {
  console.log([
    "Usage:",
    "  node scripts/review-vocab-example-seed.js [seed-file]",
    "",
    "Prints suspicious generated vocab examples for manual review."
  ].join("\n"));
}

function loadSeed(filePath) {
  const resolved = path.resolve(filePath || DEFAULT_SEED);
  delete require.cache[require.resolve(resolved)];
  return require(resolved);
}

function getMismatchReason(entry = {}) {
  const meaning = String(entry.meaning || "");
  const examplesText = (entry.examples || [])
    .map((example) => `${example.source || ""} ${example.target || ""}`)
    .join(" ");
  if (entry.word === "cons" && meaning === "缺點") return "";
  if (entry.word === "but" && meaning === "但是") return "";
  if (entry.word === "however" && /但是|可是/.test(meaning)) return "";
  if (entry.word === "if" && /如果|是否/.test(meaning)) return "";
  if (SUSPICIOUS_MEANING_RE.test(meaning)) return "suspicious meaning";
  if (/\d$/.test(String(entry.word || ""))) return "word contains trailing number";
  if (/因為\+句子/.test(meaning) && entry.word !== "because") return "non-because causal phrase";
  if (entry.word === "imagine" && /幻想|想像/.test(meaning)) return "";
  if (entry.level === "A1" && ABSTRACT_A1_RE.test(meaning)) return "abstract A1 meaning";
  if (
    entry.word === "drive" &&
    /驅使|驅動/.test(meaning) &&
    /car|work|開車|駕駛|drive to/i.test(examplesText) &&
    !/drives? (her|him|them|us|me|people)|驅使|推動/i.test(examplesText)
  ) {
    return "drive meaning mismatch";
  }
  if (entry.word === "course" && meaning === "時間" && /課程|course/i.test(examplesText)) {
    return "course meaning mismatch";
  }
  return "";
}

function main(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    usage();
    return 0;
  }
  const seed = loadSeed(argv[0]);
  const findings = Object.entries(seed.entries || [])
    .map(([key, entry]) => ({ key, entry, reason: getMismatchReason(entry) }))
    .filter((finding) => finding.reason);

  console.log(JSON.stringify({
    entryCount: Object.keys(seed.entries || {}).length,
    findingCount: findings.length,
    findings: findings.map(({ key, entry, reason }) => ({
      key,
      reason,
      word: entry.word,
      meaning: entry.meaning,
      level: entry.level,
      examples: (entry.examples || []).map((example) => ({
        source: example.source,
        target: example.target
      }))
    }))
  }, null, 2));
  return findings.length ? 1 : 0;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = {
  getMismatchReason,
  loadSeed
};
