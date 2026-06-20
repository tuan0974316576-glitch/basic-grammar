#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const VocabPosInference = require("../vocab_pos_inference.js");
const TeacherVocab = require("../teacher_vocab.js");
const XlsxReader = require("./xlsx-reader.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_INPUT = path.join(ROOT_DIR, "private_exports", "vocab_review_batch_0000.json");
const DEFAULT_OUTPUT = path.join(ROOT_DIR, "private_exports", "vocab_promote_plan.json");
const ALLOWED_PROMOTE_TARGETS = new Set(["curated", "teacher", "skip", "needs class example"]);
const REVIEW_SENSES = [
  { suffix: "", posKey: "reviewed_pos", posLabel: "reviewed POS", meaningKey: "reviewed_meaning", meaningLabel: "reviewed meaning", targetKey: "promote_to", targetLabel: "promote to" },
  { suffix: "_2", posKey: "reviewed_pos_2", posLabel: "reviewed POS 2", meaningKey: "reviewed_meaning_2", meaningLabel: "reviewed meaning 2", targetKey: "promote_to_2", targetLabel: "promote to 2" },
  { suffix: "_3", posKey: "reviewed_pos_3", posLabel: "reviewed POS 3", meaningKey: "reviewed_meaning_3", meaningLabel: "reviewed meaning 3", targetKey: "promote_to_3", targetLabel: "promote to 3" }
];

function usage() {
  console.log([
    "Usage:",
    "  node scripts/build-vocab-promote-plan.js [review-json|review-csv|review-xlsx] [--out private_exports/vocab_promote_plan.json]",
    "",
    "Reads a reviewed private batch and builds a promote plan. It does not edit app files."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    input: DEFAULT_INPUT,
    out: DEFAULT_OUTPUT
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--out") {
      options.out = path.resolve(argv[index + 1] || DEFAULT_OUTPUT);
      index += 1;
      continue;
    }
    options.input = path.resolve(arg);
  }

  return options;
}

function normalizeWord(value) {
  return VocabPosInference.normalizeWord(value);
}

function normalizeMeaning(value) {
  return VocabPosInference.normalizeMeaning(value);
}

function normalizePos(value) {
  return VocabPosInference.normalizePos(value);
}

function normalizeReviewType(value, word = "", posValue = "") {
  const posKey = String(posValue || "").trim().replace(/[().]/g, "").toLowerCase();
  if (["ph", "phr", "phrase"].includes(posKey)) return "phrase";
  if (["pt", "pattern"].includes(posKey)) return "pattern";
  const typeKey = String(value || "").trim().toLowerCase();
  if (typeKey === "word") return TeacherVocab.normalizeType("", word);
  return TeacherVocab.normalizeType(value, word);
}

function normalizePromoteTarget(value) {
  const target = String(value || "").trim().toLowerCase();
  if (target === "curated-sense-bank") return "curated";
  if (target === "teacher-bank" || target === "teacher live" || target === "teacher-live") return "teacher";
  if (target === "no" || target === "none" || target === "ignore") return "skip";
  return target;
}

function parseCsvLine(line = "") {
  const cells = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) {
      if (char === "\"" && line[index + 1] === "\"") {
        value += "\"";
        index += 1;
      } else if (char === "\"") {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === "\"") {
      quoted = true;
    } else if (char === ",") {
      cells.push(value);
      value = "";
    } else {
      value += char;
    }
  }
  cells.push(value);
  return cells;
}

function readCsvRows(filePath) {
  const lines = fs.readFileSync(filePath, "utf8")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  const headers = parseCsvLine(lines.shift() || "").map((header) => header.trim());
  return lines.map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""]));
  });
}

function normalizeReviewedEntry(raw = {}, fallback = {}) {
  const word = normalizeWord(raw.word || fallback.word);
  const meaning = normalizeMeaning(raw.meaning || raw.chinese || raw.reviewedMeaning);
  const pos = normalizePos(raw.pos || raw.reviewedPos);
  const type = normalizeReviewType(raw.type || fallback.type, word, raw.pos || raw.reviewedPos);
  const promoteTo = normalizePromoteTarget(raw.promoteTo || raw.promote_to || fallback.promoteTo);
  if (!word || !meaning || !promoteTo) return null;
  const originalTeacherEntry = normalizeMeaning(
    raw.originalTeacherEntry
    || raw.original_teacher_entry
    || fallback.originalTeacherEntry
    || ""
  );
  const auditReasons = Array.isArray(raw.auditReasons)
    ? raw.auditReasons.map(normalizeMeaning).filter(Boolean)
    : normalizeMeaning(raw.audit_reasons || raw.auditReasons || fallback.auditReasons || "")
      .split(/\s+\/\s+/)
      .map(normalizeMeaning)
      .filter(Boolean);
  const replaceTypeRaw = raw.replaceType ?? raw.replace_type ?? fallback.replaceType;
  const replaceType = typeof replaceTypeRaw === "boolean"
    ? replaceTypeRaw
    : /^(?:true|yes|y|1|replace)$/i.test(String(replaceTypeRaw || ""));
  return {
    word,
    display: String(raw.display || fallback.display || word).trim() || word,
    meaning,
    pos,
    type,
    promoteTo,
    level: String(raw.level || fallback.level || "").trim().toUpperCase(),
    notes: normalizeMeaning(raw.notes || fallback.notes || ""),
    auditReasons,
    originalTeacherEntry,
    replaceType: replaceType || Boolean(originalTeacherEntry || auditReasons.length)
  };
}

function getRowValue(row = {}, key = "", label = "") {
  return row[key] || row[label] || "";
}

function reviewedEntriesFromCsvRows(rows = []) {
  return rows
    .flatMap((row) => REVIEW_SENSES.map((sense) => normalizeReviewedEntry({
      word: row.word,
      display: row.word,
      level: row.level,
      type: row.type,
      pos: getRowValue(row, sense.posKey, sense.posLabel),
      meaning: getRowValue(row, sense.meaningKey, sense.meaningLabel),
      promoteTo: getRowValue(row, sense.targetKey, sense.targetLabel),
      notes: row.notes,
      audit_reasons: row.audit_reasons || row["audit reasons"],
      original_teacher_entry: row.original_teacher_entry || row["original teacher entry"],
      replace_type: row.replace_type || row["replace type"]
    })))
    .filter(Boolean);
}

function reviewedEntriesFromWorkbookRows(rows = []) {
  return reviewedEntriesFromCsvRows(rows);
}

function getReviewedEntries(row = {}) {
  const fallback = {
    word: row.word,
    display: row.display,
    level: row.level,
    type: row.type,
    promoteTo: row.review?.promoteTo,
    notes: row.review?.notes,
    auditReasons: row.audit?.reasons || [],
    originalTeacherEntry: row.audit?.originalMeaning || "",
    replaceType: Boolean(row.audit?.originalMeaning || row.audit?.reasons?.length)
  };
  const reviewed = Array.isArray(row.review?.approvedEntries) ? row.review.approvedEntries : [];
  return reviewed
    .map((entry) => normalizeReviewedEntry(entry, fallback))
    .filter(Boolean);
}

async function loadReviewInput(filePath) {
  const resolved = path.resolve(filePath || DEFAULT_INPUT);
  if (/\.csv$/i.test(resolved)) {
    return {
      meta: {
        source: "review-csv",
        sourceFile: path.basename(resolved)
      },
      entries: reviewedEntriesFromCsvRows(readCsvRows(resolved))
    };
  }
  if (/\.xlsx$/i.test(resolved)) {
    const workbook = await XlsxReader.readWorkbook(resolved);
    const entries = reviewedEntriesFromWorkbookRows(workbook.sheets.flatMap((sheet) => sheet.objects || []));
    return {
      meta: {
        source: "review-xlsx",
        sourceFile: path.basename(resolved),
        sheetCount: workbook.sheetCount
      },
      entries
    };
  }
  return JSON.parse(fs.readFileSync(resolved, "utf8"));
}

function validatePlanEntry(entry = {}) {
  const findings = [];
  if (!entry.word) findings.push("missing word");
  if (!entry.meaning) findings.push("missing meaning");
  if (!entry.pos && entry.type !== "phrase" && entry.type !== "pattern") findings.push("missing POS");
  if (!ALLOWED_PROMOTE_TARGETS.has(entry.promoteTo)) findings.push("unsupported promote target");
  if (/[A-Za-z]{2,}|undefined|null/i.test(entry.meaning)) findings.push("meaning looks noisy");
  if (entry.meaning.length > 28) findings.push("meaning may be too long");
  return findings;
}

function buildPromotePlan(reviewBatch = {}) {
  if (Array.isArray(reviewBatch.entries) && ["review-csv", "review-xlsx"].includes(reviewBatch.meta?.source)) {
    const deduped = dedupePlanEntries(reviewBatch.entries);
    const findings = getPlanFindings(deduped);
    return makePlanPayload(reviewBatch, deduped, findings);
  }

  const rows = Array.isArray(reviewBatch.entries) ? reviewBatch.entries : [];
  const entries = rows.flatMap(getReviewedEntries);
  const deduped = dedupePlanEntries(entries);
  const findings = getPlanFindings(deduped);

  return makePlanPayload(reviewBatch, deduped, findings);
}

function dedupePlanEntries(entries = []) {
  const seen = new Set();
  return entries.filter((entry) => {
    const key = [entry.promoteTo, entry.word, entry.pos, entry.type, entry.meaning].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getPlanFindings(entries = []) {
  return entries
    .map((entry) => ({ entry, findings: validatePlanEntry(entry) }))
    .filter((item) => item.findings.length);
}

function makePlanPayload(reviewBatch = {}, entries = [], findings = []) {
  return {
    meta: {
      generatedAt: new Date().toISOString(),
      sourceBatch: reviewBatch.meta || {},
      reviewedEntryCount: entries.length,
      findingCount: findings.length,
      note: "Plan only. Review findings before applying to curated / teacher bank."
    },
    entries,
    findings
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const reviewBatch = await loadReviewInput(options.input);
  const plan = buildPromotePlan(reviewBatch);
  fs.mkdirSync(path.dirname(options.out), { recursive: true });
  fs.writeFileSync(options.out, `${JSON.stringify(plan, null, 2)}\n`);
  console.log(JSON.stringify({
    input: options.input,
    out: options.out,
    reviewedEntryCount: plan.meta.reviewedEntryCount,
    findingCount: plan.meta.findingCount
  }, null, 2));
  if (plan.meta.findingCount) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  buildPromotePlan,
  dedupePlanEntries,
  getPlanFindings,
  getReviewedEntries,
  loadReviewInput,
  makePlanPayload,
  normalizePromoteTarget,
  normalizeReviewedEntry,
  normalizeReviewType,
  parseArgs,
  parseCsvLine,
  readCsvRows,
  reviewedEntriesFromCsvRows,
  reviewedEntriesFromWorkbookRows,
  validatePlanEntry
};
