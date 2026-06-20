#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const PromotePlan = require("./build-vocab-promote-plan.js");
const XlsxReader = require("./xlsx-reader.js");
const VocabPosInference = require("../vocab_pos_inference.js");
const TeacherVocab = require("../teacher_vocab.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_OUTPUT = path.join(ROOT_DIR, "private_exports", "vocab_review_preflight.json");
const ALLOWED_POS_LABELS = new Set(["n.", "v.", "adj.", "adv.", "prep.", "conj.", "pron.", "det.", "modal v.", "ph.", "pt."]);
const ALLOWED_PROMOTE_TARGETS = new Set(["teacher", "curated", "skip", "needs class example"]);
const REVIEW_SENSES = [
  { number: 1, suffix: "", label: "" },
  { number: 2, suffix: "_2", label: " 2" },
  { number: 3, suffix: "_3", label: " 3" }
];

function usage() {
  console.log([
    "Usage:",
    "  node scripts/preflight-vocab-review.js <review.xlsx|review.csv|review.json> [--out private_exports/preflight.json]",
    "",
    "Checks reviewed yellow columns before building a promote plan.",
    "Exits non-zero when rows need fixing."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    input: "",
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

  if (!options.input) throw new Error("Missing review file.");
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

function normalizeHeaderValue(row = {}, ...keys) {
  for (const key of keys) {
    const normalized = XlsxReader.normalizeHeader(key);
    if (row[normalized] !== undefined) return row[normalized];
    if (row[key] !== undefined) return row[key];
  }
  return "";
}

function normalizeReviewRow(row = {}, index = 0, source = "", sense = REVIEW_SENSES[0]) {
  const word = normalizeWord(normalizeHeaderValue(row, "word"));
  const reviewedPosRaw = normalizeHeaderValue(row, `reviewed_pos${sense.suffix}`, `reviewed POS${sense.label}`);
  const reviewedMeaning = normalizeMeaning(normalizeHeaderValue(row, `reviewed_meaning${sense.suffix}`, `reviewed meaning${sense.label}`));
  const promoteToRaw = normalizeHeaderValue(row, `promote_to${sense.suffix}`, `promote to${sense.label}`);
  const promoteTo = PromotePlan.normalizePromoteTarget(promoteToRaw);
  const type = String(normalizeHeaderValue(row, "type") || "").trim().toLowerCase();
  const suppress = normalizeMeaning(normalizeHeaderValue(row, "suppress"));
  return {
    index,
    rowNumber: index + 2,
    senseNumber: sense.number,
    source,
    word,
    level: String(normalizeHeaderValue(row, "level") || "").trim().toUpperCase(),
    type,
    originalType: type,
    auditReasons: normalizeMeaning(normalizeHeaderValue(row, "audit_reasons", "audit reasons")),
    originalTeacherEntry: normalizeMeaning(normalizeHeaderValue(row, "original_teacher_entry", "original teacher entry")),
    oxfordPos: normalizeMeaning(normalizeHeaderValue(row, "oxford_pos", "Oxford POS")),
    existingTeacher: normalizeMeaning(normalizeHeaderValue(row, "existing_teacher", "Existing teacher")),
    existingCurated: normalizeMeaning(normalizeHeaderValue(row, "existing_curated", "Existing curated")),
    ecdictDrafts: normalizeMeaning(normalizeHeaderValue(row, "ecdict_drafts", "ECDICT draft")),
    generatedDrafts: normalizeMeaning(normalizeHeaderValue(row, "generated_seed_drafts", "Generated draft")),
    ccCedictDrafts: normalizeMeaning(normalizeHeaderValue(row, "cc_cedict_reverse_drafts", "CC-CEDICT draft")),
    flags: normalizeMeaning(normalizeHeaderValue(row, "flags")),
    reviewedPosRaw,
    reviewedPos: normalizePos(reviewedPosRaw),
    reviewedPosLabel: TeacherVocab.formatPosLabel(normalizePos(reviewedPosRaw)) || "",
    reviewedMeaning,
    promoteToRaw,
    promoteTo,
    replaceType: normalizeMeaning(normalizeHeaderValue(row, "replace_type", "replace type")),
    suppress,
    notes: normalizeMeaning(normalizeHeaderValue(row, "notes"))
  };
}

function expandReviewRow(row = {}, index = 0, source = "") {
  return REVIEW_SENSES
    .map((sense) => normalizeReviewRow(row, index, source, sense))
    .filter((normalized, senseIndex) => senseIndex === 0 || hasPromotableInput(normalized));
}

function readCsvRows(filePath) {
  return PromotePlan.readCsvRows(filePath);
}

async function readReviewRows(filePath) {
  const resolved = path.resolve(filePath);
  if (/\.csv$/i.test(resolved)) {
    return readCsvRows(resolved).flatMap((row, index) => expandReviewRow(row, index, path.basename(resolved)));
  }
  if (/\.xlsx$/i.test(resolved)) {
    const workbook = await XlsxReader.readWorkbook(resolved);
    const reviewSheet = workbook.sheets.find((sheet) => sheet.name === "Review Batch") || workbook.sheets[0] || { objects: [] };
    return (reviewSheet.objects || []).flatMap((row, index) => expandReviewRow(row, index, `${path.basename(resolved)}:${reviewSheet.name}`));
  }
  const payload = JSON.parse(fs.readFileSync(resolved, "utf8"));
  const rows = Array.isArray(payload.entries) ? payload.entries.map((entry) => ({
    word: entry.word,
    level: entry.level,
    type: entry.type,
    audit_reasons: entry.audit?.reasons?.join(" / ") || "",
    original_teacher_entry: entry.audit?.originalMeaning || "",
    oxford_pos: entry.oxford?.posLabels?.join(" / ") || "",
    existing_teacher: "",
    existing_curated: "",
    ecdict_drafts: "",
    generated_seed_drafts: "",
    cc_cedict_reverse_drafts: "",
    flags: entry.flags?.join(" / ") || "",
    reviewed_pos: entry.reviewed_pos || entry.reviewedPos || "",
    reviewed_meaning: entry.reviewed_meaning || entry.reviewedMeaning || "",
    promote_to: entry.promote_to || entry.promoteTo || "",
    replace_type: entry.replace_type || entry.replaceType || "",
    notes: entry.notes || ""
  })) : [];
  return rows.flatMap((row, index) => expandReviewRow(row, index, path.basename(resolved)));
}

function hasAnyReviewInput(row = {}) {
  return Boolean(row.reviewedPosRaw || row.reviewedMeaning || row.promoteToRaw || row.replaceType || row.suppress || row.notes);
}

function hasPromotableInput(row = {}) {
  return Boolean(row.reviewedPosRaw || row.reviewedMeaning || row.promoteToRaw);
}

function meaningLooksNoisy(meaning = "") {
  return /[A-Za-z]{2,}|undefined|null|（.+?的過去式/i.test(meaning);
}

function meaningIsTooLong(meaning = "") {
  return meaning.length > 28;
}

function isPhraseLike(row = {}) {
  return row.type === "phrase" || row.reviewedPos === "phrase" || /\s/.test(row.word);
}

function validateReviewedRow(row = {}, allRows = []) {
  const findings = [];
  const hasReview = hasPromotableInput(row);
  const isSkip = row.promoteTo === "skip";
  const isSuppress = /^(?:true|yes|y|1|suppress)$/i.test(String(row.suppress || ""));

  if (!hasAnyReviewInput(row)) return findings;
  if (!row.word) findings.push("missing word");
  if (!row.promoteToRaw) findings.push("missing promote_to");
  if (row.promoteToRaw && !ALLOWED_PROMOTE_TARGETS.has(row.promoteTo)) findings.push("unsupported promote_to");

  if (isSuppress) {
    if (row.promoteTo !== "teacher") findings.push("suppress row should promote_to teacher");
    if (row.reviewedMeaning || row.reviewedPosRaw) findings.push("suppress row should leave reviewed POS / meaning blank");
    return findings;
  }

  if (isSkip) {
    if (row.reviewedMeaning || row.reviewedPosRaw) findings.push("skip row should leave reviewed POS / meaning blank");
    return findings;
  }

  if (hasReview && !row.reviewedMeaning) findings.push("missing reviewed_meaning");
  if (hasReview && !row.reviewedPosRaw && !isPhraseLike(row) && row.type !== "pattern") findings.push("missing reviewed_pos");
  if (row.reviewedPosRaw && !row.reviewedPos && row.reviewedPosRaw.trim()) findings.push("unsupported reviewed_pos");
  if (row.reviewedPosRaw && !ALLOWED_POS_LABELS.has((row.reviewedPosLabel || row.reviewedPosRaw).trim())) findings.push("reviewed_pos should use short POS label");
  if (row.reviewedMeaning && meaningLooksNoisy(row.reviewedMeaning)) findings.push("meaning looks noisy");
  if (row.reviewedMeaning && meaningIsTooLong(row.reviewedMeaning)) findings.push("meaning may be too long");
  if (/[，。！？]/.test(row.reviewedMeaning)) findings.push("meaning should be a short phrase, not a sentence");
  if (/^\s*[-/／]\s*$/.test(row.reviewedMeaning)) findings.push("meaning is empty punctuation");

  const duplicate = allRows.find((candidate) => (
    candidate !== row
    && hasPromotableInput(candidate)
    && !["skip", ""].includes(candidate.promoteTo)
    && candidate.word === row.word
    && candidate.reviewedMeaning
    && row.reviewedMeaning
    && candidate.reviewedMeaning === row.reviewedMeaning
    && normalizePos(candidate.reviewedPos || candidate.reviewedPosRaw) === normalizePos(row.reviewedPos || row.reviewedPosRaw)
  ));
  if (duplicate) findings.push(`duplicate reviewed sense with row ${duplicate.rowNumber}${duplicate.senseNumber > 1 ? ` sense ${duplicate.senseNumber}` : ""}`);

  return findings;
}

function buildReport(rows = [], options = {}) {
  const reviewedRows = rows.filter(hasAnyReviewInput);
  const findings = [];
  rows.forEach((row) => {
    validateReviewedRow(row, rows).forEach((message) => {
      findings.push({
        severity: message.startsWith("meaning may") ? "warning" : "error",
        rowNumber: row.rowNumber,
        senseNumber: row.senseNumber,
        word: row.word,
        promoteTo: row.promoteToRaw,
        reviewedPos: row.reviewedPosRaw,
        reviewedMeaning: row.reviewedMeaning,
        message
      });
    });
  });
  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  const warningCount = findings.filter((finding) => finding.severity === "warning").length;
  return {
    meta: {
      generatedAt: new Date().toISOString(),
      input: options.input ? path.relative(ROOT_DIR, options.input) : "",
      privateOnly: true,
      note: "Preflight only. Fix error rows before building a promote plan."
    },
    summary: {
      rowCount: rows.length,
      reviewedRowCount: reviewedRows.length,
      findingCount: findings.length,
      errorCount,
      warningCount,
      pass: errorCount === 0
    },
    findings,
    reviewedRows: reviewedRows.map((row) => ({
      rowNumber: row.rowNumber,
      senseNumber: row.senseNumber,
      word: row.word,
      reviewedPos: row.reviewedPosRaw,
      reviewedMeaning: row.reviewedMeaning,
      promoteTo: row.promoteToRaw
    }))
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, "\"\"")}"`;
}

function buildFindingsCsv(report = {}) {
  const headers = ["severity", "row", "sense", "word", "promote_to", "reviewed_pos", "reviewed_meaning", "message"];
  const lines = [headers.join(",")];
  (report.findings || []).forEach((finding) => {
    const row = {
      severity: finding.severity,
      row: finding.rowNumber,
      sense: finding.senseNumber || 1,
      word: finding.word,
      promote_to: finding.promoteTo,
      reviewed_pos: finding.reviewedPos,
      reviewed_meaning: finding.reviewedMeaning,
      message: finding.message
    };
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  });
  return `${lines.join("\n")}\n`;
}

function writeReport(report = {}, out = DEFAULT_OUTPUT) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(out.replace(/\.json$/i, ".csv"), buildFindingsCsv(report));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const rows = await readReviewRows(options.input);
  const report = buildReport(rows, options);
  writeReport(report, options.out);
  console.log(JSON.stringify({
    input: path.relative(ROOT_DIR, options.input),
    out: path.relative(ROOT_DIR, options.out),
    rowCount: report.summary.rowCount,
    reviewedRowCount: report.summary.reviewedRowCount,
    errorCount: report.summary.errorCount,
    warningCount: report.summary.warningCount,
    pass: report.summary.pass
  }, null, 2));
  if (!report.summary.pass) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  buildFindingsCsv,
  buildReport,
  hasAnyReviewInput,
  hasPromotableInput,
  meaningLooksNoisy,
  expandReviewRow,
  normalizeReviewRow,
  parseArgs,
  readReviewRows,
  validateReviewedRow,
  writeReport
};
