#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const ReviewBatch = require("./build-vocab-review-batch.js");
const TeacherVocab = require("../teacher_vocab.js");
const VocabPosInference = require("../vocab_pos_inference.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_MIN_CONFIDENCE = 84;

const HEADERS = [
  "word",
  "display",
  "level",
  "type",
  "audit_reasons",
  "original_teacher_entry",
  "oxford_pos",
  "existing_teacher",
  "existing_curated",
  "ecdict_drafts",
  "generated_seed_drafts",
  "cc_cedict_reverse_drafts",
  "flags",
  "reviewed_pos",
  "reviewed_meaning",
  "promote_to",
  "reviewed_pos_2",
  "reviewed_meaning_2",
  "promote_to_2",
  "reviewed_pos_3",
  "reviewed_meaning_3",
  "promote_to_3",
  "replace_type",
  "notes",
  "auto_review_decision"
];

const RISKY_AUDIT_REASONS = new Set([
  "duplicate-near-meaning",
  "long-meaning",
  "mixed-english-in-meaning",
  "no-chinese-meaning",
  "noisy-meaning-text",
  "non-ascii-word"
]);

const RISKY_SEED_FLAGS = new Set([
  "duplicate-draft-meaning",
  "multi-pos",
  "needs-pos-decision",
  "noisy-draft-text",
  "sources-disagree"
]);

function usage() {
  console.log([
    "Usage:",
    "  node scripts/auto-review-vocab-batch.js private_exports/teacher_vocab_review_batch_highvalue_0100.json [--out private_exports/teacher_vocab_review_batch_highvalue_0100_auto_review.csv]",
    "",
    "Conservatively fills reviewed columns for high-confidence rows only.",
    "ECDICT / CC-CEDICT are used only as supporting material; their meanings are not promoted directly."
  ].join("\n"));
}

function parseArgs(argv = []) {
  const options = {
    input: "",
    minConfidence: DEFAULT_MIN_CONFIDENCE,
    out: "",
    target: ""
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
    if (arg === "--target") {
      options.target = normalizePromoteTarget(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--min-confidence") {
      options.minConfidence = Math.max(1, Number(argv[index + 1]) || DEFAULT_MIN_CONFIDENCE);
      index += 1;
      continue;
    }
    options.input = path.resolve(arg);
  }

  if (!options.input) throw new Error("Missing review batch JSON input.");
  if (!options.out) options.out = inferOutputPath(options.input);
  return options;
}

function inferOutputPath(input = "") {
  return path.join(
    path.dirname(path.resolve(input)),
    `${path.basename(input).replace(/\.json$/i, "")}_auto_review.csv`
  );
}

function normalizePromoteTarget(value = "") {
  const target = String(value || "").trim().toLowerCase();
  if (["teacher", "curated"].includes(target)) return target;
  return "";
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

function formatPosLabel(pos = "") {
  return TeacherVocab.formatPosLabel(pos) || "";
}

function hasCjk(value = "") {
  return /[\u3400-\u9fff]/.test(String(value || ""));
}

function hasLatin(value = "") {
  return /[A-Za-z]{2,}/.test(String(value || ""));
}

function meaningLooksClean(meaning = "") {
  const normalized = normalizeMeaning(meaning);
  if (!normalized || !hasCjk(normalized)) return false;
  if (hasLatin(normalized)) return false;
  if (/undefined|null|[?？]|（.+?的過去式/i.test(normalized)) return false;
  if (/^\s*[-/／]\s*$/.test(normalized)) return false;
  if (normalized.length > 28) return false;
  return true;
}

function getMeaningGroupKey(value = "") {
  return ReviewBatch.normalizeMeaningGroupKey(value);
}

function sameMeaningGroup(left = "", right = "") {
  const leftKey = getMeaningGroupKey(left);
  const rightKey = getMeaningGroupKey(right);
  return Boolean(leftKey && rightKey && leftKey === rightKey);
}

function polishMeaningForPos(meaning = "", pos = "") {
  const normalized = normalizeMeaning(meaning);
  if (normalizePos(pos) !== "adjective") return normalized;
  return normalized
    .split(/\s+\/\s+/)
    .map((part) => {
      if (!part || /[的地]$/.test(part)) return part;
      if (/^(?:很|非常|十分|極|最)/.test(part)) return part;
      if (/^(?:不錯|足夠|充足|安全|方便|可疑|有限|無限|流利|油膩|可食用|昏昏欲睡|令人氣餒|荷蘭|法國|英國|美國|中國|日本|韓國|德國|意大利|西班牙)$/.test(part)) {
        return `${part}的`;
      }
      if (/^(?:有|無|沒有|具|缺乏|值得|可|難|易)/.test(part)) return `${part}的`;
      return part;
    })
    .join(" / ");
}

function hasRiskyAuditReason(row = {}) {
  return (row.audit?.reasons || []).some((reason) => RISKY_AUDIT_REASONS.has(reason));
}

function hasRiskySeedFlag(row = {}) {
  return (row.flags || []).some((flag) => RISKY_SEED_FLAGS.has(flag));
}

function allDraftEntries(row = {}) {
  return [
    ...(row.drafts?.generatedSeed || []),
    ...(row.drafts?.ecdict || []),
    ...(row.drafts?.ccCedictReverse || [])
  ];
}

function inferPosFromMatchingDraft(row = {}, meaning = "") {
  const matching = allDraftEntries(row)
    .filter((entry) => sameMeaningGroup(entry.meaning, meaning))
    .map((entry) => normalizePos(entry.pos || entry.inferredPos))
    .filter(Boolean);
  const unique = Array.from(new Set(matching));
  if (unique.length !== 1) return { pos: "", confidence: 0, reason: "no-unique-matching-draft-pos" };
  return { pos: unique[0], confidence: 88, reason: "matching-draft-pos" };
}

function inferReviewedPos(row = {}, meaning = "", options = {}) {
  const originalPos = normalizePos(row.audit?.originalPos);
  if (originalPos) return { pos: originalPos, confidence: 100, reason: "original-teacher-pos" };

  const inferred = VocabPosInference.inferEntryPos({
    word: row.word,
    display: row.display,
    meaning,
    type: row.type
  }, {
    minConfidence: Number(options.minConfidence) || DEFAULT_MIN_CONFIDENCE
  });
  if (inferred.pos && inferred.confidence >= (Number(options.minConfidence) || DEFAULT_MIN_CONFIDENCE)) {
    return inferred;
  }

  const draft = inferPosFromMatchingDraft(row, meaning);
  if (draft.pos) return draft;
  return inferred;
}

function defaultPromoteTarget(row = {}, options = {}) {
  if (options.target) return options.target;
  const source = String(row.checklistSource?.source || row.source || "").toLowerCase();
  if (source.includes("teacher")) return "teacher";
  if (source.includes("supplement")) return "curated";
  if (source.includes("oxford")) return "curated";
  return "teacher";
}

function chooseFromTeacherAudit(row = {}, options = {}) {
  const meaning = normalizeMeaning(row.audit?.originalMeaning || "");
  if (!meaning) return { approved: false, reason: "no-original-teacher-meaning" };
  if (hasRiskyAuditReason(row)) return { approved: false, reason: "risky-audit-reason" };
  if (!meaningLooksClean(meaning)) return { approved: false, reason: "original-meaning-not-clean" };

  const pos = inferReviewedPos(row, meaning, options);
  if (!pos.pos) return { approved: false, reason: `no-confident-pos:${pos.reason || "not-inferred"}` };

  return {
    approved: true,
    pos: pos.pos,
    meaning: polishMeaningForPos(meaning, pos.pos),
    promoteTo: defaultPromoteTarget(row, options),
    replaceType: true,
    reason: `teacher-meaning+${pos.reason}`
  };
}

function chooseFromSingleGeneratedSeed(row = {}, options = {}) {
  if (hasRiskySeedFlag(row)) return { approved: false, reason: "risky-seed-flag" };
  if ((row.existing?.teacher || []).length || (row.existing?.curated || []).length) {
    return { approved: false, reason: "already-has-existing-entry" };
  }

  const drafts = (row.drafts?.generatedSeed || [])
    .filter((entry) => meaningLooksClean(entry.meaning));
  if (drafts.length !== 1) return { approved: false, reason: "no-single-clean-generated-seed" };

  const draft = drafts[0];
  const pos = normalizePos(draft.pos) || inferReviewedPos(row, draft.meaning, options).pos;
  if (!pos && row.type !== "phrase" && row.type !== "pattern") {
    return { approved: false, reason: "seed-has-no-confident-pos" };
  }

  return {
    approved: true,
    pos,
    meaning: polishMeaningForPos(draft.meaning, pos),
    promoteTo: defaultPromoteTarget(row, options),
    replaceType: false,
    reason: "single-generated-seed"
  };
}

function chooseAutoReview(row = {}, options = {}) {
  const auditSource = Boolean(row.audit?.originalMeaning || row.flags?.includes("teacher-audit"));
  const decision = auditSource
    ? chooseFromTeacherAudit(row, options)
    : chooseFromSingleGeneratedSeed(row, options);

  if (!decision.approved) return decision;
  if (!["teacher", "curated"].includes(decision.promoteTo)) {
    return { approved: false, reason: "unsupported-promote-target" };
  }
  if (!formatPosLabel(decision.pos) && row.type !== "phrase" && row.type !== "pattern") {
    return { approved: false, reason: "unsupported-pos" };
  }
  return decision;
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, "\"\"")}"`;
}

function stringifyEntry(entry) {
  const pos = entry.posLabel || formatPosLabel(entry.pos) || (entry.type === "phrase" ? "ph." : "");
  const prefix = pos ? `${pos} ` : "";
  return `${prefix}${normalizeMeaning(entry.meaning)}`;
}

function stringifyEntries(entries = []) {
  return entries.map(stringifyEntry).join(" | ");
}

function rowToCsvObject(row = {}, decision = {}) {
  const posLabel = decision.approved ? formatPosLabel(decision.pos) : "";
  return {
    word: row.word,
    display: row.display || row.word,
    level: row.level || "",
    type: row.type || "",
    audit_reasons: row.audit?.reasons?.join(" / ") || "",
    original_teacher_entry: row.audit?.originalMeaning
      ? `${row.audit.originalPos ? `${formatPosLabel(row.audit.originalPos)} ` : ""}${normalizeMeaning(row.audit.originalMeaning)}`
      : "",
    oxford_pos: row.oxford?.posLabels?.join(" / ") || "",
    existing_teacher: stringifyEntries(row.existing?.teacher || []),
    existing_curated: stringifyEntries(row.existing?.curated || []),
    ecdict_drafts: stringifyEntries(row.drafts?.ecdict || []),
    generated_seed_drafts: stringifyEntries(row.drafts?.generatedSeed || []),
    cc_cedict_reverse_drafts: stringifyEntries(row.drafts?.ccCedictReverse || []),
    flags: row.flags?.join(" / ") || "",
    reviewed_pos: decision.approved ? posLabel : "",
    reviewed_meaning: decision.approved ? decision.meaning : "",
    promote_to: decision.approved ? decision.promoteTo : "",
    reviewed_pos_2: "",
    reviewed_meaning_2: "",
    promote_to_2: "",
    reviewed_pos_3: "",
    reviewed_meaning_3: "",
    promote_to_3: "",
    replace_type: decision.approved && decision.replaceType ? "yes" : "",
    notes: decision.approved ? `auto-review: ${decision.reason}` : "",
    auto_review_decision: decision.approved ? "approved" : `untouched: ${decision.reason}`
  };
}

function buildCsv(rows = [], decisions = []) {
  const lines = [HEADERS.join(",")];
  rows.forEach((row, index) => {
    const object = rowToCsvObject(row, decisions[index] || { approved: false, reason: "not-reviewed" });
    lines.push(HEADERS.map((header) => csvEscape(object[header])).join(","));
  });
  return `${lines.join("\n")}\n`;
}

function loadReviewBatch(filePath = "") {
  const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return {
    meta: payload.meta || {},
    entries: Array.isArray(payload.entries) ? payload.entries : []
  };
}

function autoReviewRows(rows = [], options = {}) {
  const seenApproved = new Set();
  const decisions = rows.map((row) => {
    const decision = chooseAutoReview(row, options);
    if (!decision.approved) return decision;
    const key = [
      normalizeWord(row.word),
      normalizePos(decision.pos),
      row.type || "",
      getMeaningGroupKey(decision.meaning)
    ].join("|");
    if (seenApproved.has(key)) return { approved: false, reason: "duplicate-auto-approval" };
    seenApproved.add(key);
    return decision;
  });
  return {
    rows,
    decisions,
    approved: rows.filter((_, index) => decisions[index]?.approved),
    untouched: rows.filter((_, index) => !decisions[index]?.approved)
  };
}

function writeAutoReviewedCsv(input = "", options = {}) {
  const batch = loadReviewBatch(input);
  const reviewed = autoReviewRows(batch.entries, options);
  fs.mkdirSync(path.dirname(options.out), { recursive: true });
  fs.writeFileSync(options.out, buildCsv(reviewed.rows, reviewed.decisions));
  return {
    input,
    out: options.out,
    source: batch.meta.source || "",
    totalCount: reviewed.rows.length,
    approvedCount: reviewed.approved.length,
    untouchedCount: reviewed.untouched.length,
    minConfidence: Number(options.minConfidence) || DEFAULT_MIN_CONFIDENCE,
    privateOnly: true
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const summary = writeAutoReviewedCsv(options.input, options);
  console.log(JSON.stringify({
    ...summary,
    input: path.relative(ROOT_DIR, summary.input),
    out: path.relative(ROOT_DIR, summary.out)
  }, null, 2));
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
  autoReviewRows,
  buildCsv,
  chooseAutoReview,
  inferOutputPath,
  parseArgs,
  writeAutoReviewedCsv
};
