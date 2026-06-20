#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const TeacherVocab = require("../teacher_vocab.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_OUTPUT = path.join(ROOT_DIR, "private_exports", "teacher_vocab_audit_batch.json");
const DEFAULT_LIMIT = 100;

function parseArgs(argv) {
  const args = {
    limit: DEFAULT_LIMIT,
    offset: 0,
    out: DEFAULT_OUTPUT
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--limit") {
      args.limit = Math.max(1, Number(argv[index + 1]) || DEFAULT_LIMIT);
      index += 1;
      continue;
    }
    if (arg === "--offset") {
      args.offset = Math.max(0, Number(argv[index + 1]) || 0);
      index += 1;
      continue;
    }
    if (arg === "--out") {
      args.out = path.resolve(argv[index + 1] || DEFAULT_OUTPUT);
      index += 1;
      continue;
    }
  }

  return args;
}

function normalizeMeaning(value) {
  return TeacherVocab.normalizeMeaning(value)
    .replace(/[（）()「」『』]/g, "")
    .replace(/[的地]$/g, "")
    .replace(/[\s/／]+/g, "")
    .toLowerCase();
}

function meaningGroupKey(value) {
  const key = normalizeMeaning(value);
  const groups = [
    ["young-animal", ["幼", "幼仔", "幼獸", "幼崽", "幼童", "幼兒"]],
    ["delicacy-food", ["美味", "美食", "佳餚", "珍饈", "可口食物"]],
    ["wealthy", ["富裕", "富裕的", "富有", "富有的", "有錢"]],
    ["fast", ["迅速", "迅速的", "快速", "快速的"]]
  ];
  const match = groups.find(([, variants]) => variants.includes(key));
  return match ? match[0] : key;
}

function hasCjk(value) {
  return /[\u3400-\u9fff]/.test(String(value || ""));
}

function hasLatin(value) {
  return /[A-Za-z]/.test(String(value || ""));
}

function getPos(entry = {}) {
  return TeacherVocab.normalizePos(entry.pos || entry.inferredPos) || "";
}

function getReviewReasons(entry = {}, duplicatesForWord = []) {
  const reasons = [];
  const word = TeacherVocab.normalizeWord(entry.word);
  const meaning = TeacherVocab.normalizeMeaning(entry.meaning);
  const pos = getPos(entry);

  if (entry.needsReview) reasons.push("needsReview");
  if (!pos && entry.type !== "pattern") reasons.push("missing-pos");
  if (!hasCjk(meaning)) reasons.push("no-chinese-meaning");
  if (hasLatin(meaning) && hasCjk(meaning)) reasons.push("mixed-english-in-meaning");
  if (meaning.length > 28) reasons.push("long-meaning");
  if (/x\d|xxx|\?|\b[a-z]+\b/i.test(meaning)) reasons.push("noisy-meaning-text");
  if (/[A-Za-z]{2,}/.test(word) && /[^\x00-\x7F]/.test(word)) reasons.push("non-ascii-word");

  const sameGroup = duplicatesForWord.filter((other) => (
    other !== entry
    && getPos(other) === pos
    && meaningGroupKey(other.meaning) === meaningGroupKey(meaning)
  ));
  if (sameGroup.length) reasons.push("duplicate-near-meaning");

  return Array.from(new Set(reasons));
}

function scoreReasons(reasons = []) {
  const weights = {
    needsReview: 10,
    "no-chinese-meaning": 10,
    "missing-pos": 8,
    "duplicate-near-meaning": 7,
    "mixed-english-in-meaning": 6,
    "noisy-meaning-text": 6,
    "long-meaning": 4,
    "non-ascii-word": 4
  };
  return reasons.reduce((total, reason) => total + (weights[reason] || 1), 0);
}

function buildAuditRows(entries = []) {
  const byWord = new Map();
  entries.forEach((entry) => {
    const word = TeacherVocab.normalizeWord(entry.word);
    if (!word) return;
    if (!byWord.has(word)) byWord.set(word, []);
    byWord.get(word).push(entry);
  });

  return entries
    .map((entry) => {
      const word = TeacherVocab.normalizeWord(entry.word);
      const reasons = getReviewReasons(entry, byWord.get(word) || []);
      if (!reasons.length) return null;
      return {
        id: entry.id || "",
        word,
        display: entry.display || entry.word || "",
        pos: getPos(entry),
        type: entry.type || "",
        meaning: TeacherVocab.normalizeMeaning(entry.meaning),
        sourceFile: entry.sourceFile || "",
        notes: entry.notes || "",
        reasons,
        score: scoreReasons(reasons)
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || left.word.localeCompare(right.word) || left.meaning.localeCompare(right.meaning));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const rows = buildAuditRows(TeacherVocab.entries || []);
  const batch = rows.slice(args.offset, args.offset + args.limit);
  const output = {
    meta: {
      generatedAt: new Date().toISOString(),
      totalCandidates: rows.length,
      offset: args.offset,
      limit: args.limit,
      nextOffset: args.offset + batch.length
    },
    entries: batch
  };

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${batch.length}/${rows.length} teacher vocab audit entries to ${args.out}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  buildAuditRows,
  getReviewReasons,
  meaningGroupKey
};
