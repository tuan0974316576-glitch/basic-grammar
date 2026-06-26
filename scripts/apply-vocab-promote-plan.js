#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const PromotePlan = require("./build-vocab-promote-plan.js");
const ReviewDashboard = require("./build-vocab-review-dashboard.js");
const ReviewIndex = require("./build-vocab-review-index.js");
const ReviewPaths = require("./vocab-review-paths.js");
const TeacherImporter = require("./import-teacher-vocab.js");
const VocabSenseBank = require("../vocab_sense_bank.js");
const VocabPosInference = require("../vocab_pos_inference.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_PLAN = path.join(ROOT_DIR, "private_exports", "vocab_promote_plan.json");
const DEFAULT_TEACHER_UPDATES = path.join(ROOT_DIR, "teacher_vocab_manual_updates.json");
const DEFAULT_CURATED_BANK = path.join(ROOT_DIR, "vocab_sense_bank.js");
const DEFAULT_TEACHER_BANK = path.join(ROOT_DIR, "teacher_vocab_bank.js");

function usage() {
  console.log([
    "Usage:",
    "  node scripts/apply-vocab-promote-plan.js [plan-json] [--write]",
    "",
    "Dry-runs by default. With --write, appends reviewed entries to:",
    "  - teacher_vocab_manual_updates.json for promoteTo=teacher",
    "  - vocab_sense_bank.js for promoteTo=curated",
    "and rebuilds teacher_vocab_bank.js from the existing bank plus manual updates."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    input: DEFAULT_PLAN,
    teacherUpdates: DEFAULT_TEACHER_UPDATES,
    curatedBank: DEFAULT_CURATED_BANK,
    teacherBank: DEFAULT_TEACHER_BANK,
    refresh: true,
    write: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--write") {
      options.write = true;
      continue;
    }
    if (arg === "--no-refresh") {
      options.refresh = false;
      continue;
    }
    if (arg === "--teacher-updates") {
      options.teacherUpdates = path.resolve(argv[index + 1] || DEFAULT_TEACHER_UPDATES);
      index += 1;
      continue;
    }
    if (arg === "--curated-bank") {
      options.curatedBank = path.resolve(argv[index + 1] || DEFAULT_CURATED_BANK);
      index += 1;
      continue;
    }
    if (arg === "--teacher-bank") {
      options.teacherBank = path.resolve(argv[index + 1] || DEFAULT_TEACHER_BANK);
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

function normalizeType(value, word) {
  const typeKey = String(value || "").trim().replace(/[().]/g, "").toLowerCase();
  if (["ph", "phr", "phrase"].includes(typeKey)) return "phrase";
  if (["pt", "pattern"].includes(typeKey)) return "pattern";
  if (typeKey === "word") return TeacherImporter.detectType(word, "");
  return TeacherImporter.normalizeManualType
    ? TeacherImporter.normalizeManualType(value, word, "")
    : TeacherImporter.detectType(word, "");
}

function loadPlan(filePath) {
  const plan = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(plan.entries)) {
    throw new Error(`Promote plan has no entries array: ${filePath}`);
  }
  return plan;
}

function getReviewQueueForPlan(input = "") {
  const baseName = ReviewPaths.stripReviewExtension(input);
  const queues = [
    {
      planPrefix: "teacher_vocab_promote_plan_highvalue",
      reviewPrefix: "teacher_vocab_review_batch_highvalue",
      indexFile: "teacher_vocab_review_index.json"
    },
    {
      planPrefix: "oxford_vocab_promote_plan",
      reviewPrefix: "oxford_vocab_review_batch",
      indexFile: "oxford_vocab_review_index.json"
    },
    {
      planPrefix: "supplement_vocab_promote_plan",
      reviewPrefix: "supplement_vocab_review_batch",
      indexFile: "supplement_vocab_review_index.json"
    },
    {
      planPrefix: "teacher_live_vocab_promote_plan",
      reviewPrefix: "teacher_live_vocab_review_batch",
      indexFile: "teacher_live_vocab_review_index.json"
    }
  ];
  return queues.find((queue) => baseName.startsWith(`${queue.planPrefix}_`)) || null;
}

function normalizeReviewBatchId(batchId = "") {
  return String(batchId || "").replace(/_(?:auto|codex)_review$/i, "");
}

function inferApplyReceiptPath(input = "") {
  return ReviewPaths.inferApplyReceiptPath(input);
}

function writeApplyReceipt(summary = {}, options = {}) {
  if (!options.write) return null;
  const out = options.receiptOut || inferApplyReceiptPath(options.input || DEFAULT_PLAN);
  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      input: path.relative(ROOT_DIR, options.input || DEFAULT_PLAN),
      privateOnly: true,
      note: "Apply receipt only. Indicates this promote plan was applied with --write."
    },
    summary
  };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`);
  return out;
}

function refreshReviewStatusAfterApply(input = "", options = {}) {
  const queue = getReviewQueueForPlan(input);
  if (!queue) return null;
  const dir = ReviewPaths.inferOutputDir(input);
  const indexOut = path.join(dir, queue.indexFile);
  const index = ReviewIndex.writeIndex({
    dir,
    prefix: queue.reviewPrefix,
    out: indexOut
  });
  const dashboardOut = path.join(dir, "vocab_review_dashboard.json");
  const dashboard = ReviewDashboard.writeDashboard({
    dir,
    out: dashboardOut
  });
  const planBaseName = ReviewPaths.stripReviewExtension(input);
  const batchId = normalizeReviewBatchId(planBaseName.replace(`${queue.planPrefix}_`, ""));
  return {
    queue: queue.reviewPrefix,
    indexOut,
    dashboardOut,
    status: (index.batches || []).find((batch) => batch.id === batchId)?.status || "",
    batchCount: index.meta?.batchCount || 0,
    dashboardQueueCount: dashboard.queues?.length || 0
  };
}

function planEntryKey(entry = {}) {
  return [
    PromotePlan.normalizePromoteTarget(entry.promoteTo),
    normalizeWord(entry.word),
    normalizeType(entry.type, entry.word),
    normalizePos(entry.pos),
    normalizeMeaning(entry.meaning)
  ].join("\u0001");
}

function splitEntries(entries = []) {
  const accepted = [];
  const skipped = [];
  const seen = new Set();

  entries.forEach((entry) => {
    const promoteTo = PromotePlan.normalizePromoteTarget(entry.promoteTo);
    if (promoteTo === "skip") {
      skipped.push({ ...entry, skipReason: "marked skip" });
      return;
    }
    const normalized = {
      ...entry,
      promoteTo,
      word: normalizeWord(entry.word),
      display: String(entry.display || entry.word || "").trim() || normalizeWord(entry.word),
      meaning: normalizeMeaning(entry.meaning),
      pos: normalizePos(entry.pos),
      type: normalizeType(entry.type || entry.pos, entry.word),
      level: String(entry.level || "").trim().toUpperCase(),
      notes: normalizeMeaning(entry.notes || ""),
      aliases: TeacherImporter.normalizeAliases(entry.aliases || entry.alias || []),
      replaceType: Boolean(entry.replaceType)
    };
    const findings = PromotePlan.validatePlanEntry(normalized);
    if (findings.length) {
      skipped.push({ ...normalized, skipReason: findings.join("; ") });
      return;
    }
    const key = planEntryKey(normalized);
    if (seen.has(key)) {
      skipped.push({ ...normalized, skipReason: "duplicate in plan" });
      return;
    }
    seen.add(key);
    accepted.push(normalized);
  });

  return {
    accepted,
    skipped,
    teacher: accepted.filter((entry) => entry.promoteTo === "teacher"),
    curated: accepted.filter((entry) => entry.promoteTo === "curated")
  };
}

function teacherUpdateKey(entry = {}) {
  return [
    normalizeWord(entry.word),
    normalizeType(entry.type, entry.word),
    normalizePos(entry.pos),
    normalizeMeaning(entry.meaning)
  ].join("\u0001");
}

function loadTeacherUpdates(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      meta: {
        lesson: "Teacher vocab manual updates",
        notes: "Austin Sir reviewed vocab meanings."
      },
      entries: []
    };
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function makeTeacherUpdateEntry(entry = {}) {
  const aliases = TeacherImporter.normalizeAliases(entry.aliases || entry.alias || []);
  const output = {
    word: normalizeWord(entry.word),
    meaning: normalizeMeaning(entry.meaning),
    pos: normalizePos(entry.pos) || undefined,
    type: normalizeType(entry.type, entry.word),
    replaceType: Boolean(entry.replaceType),
    suppress: Boolean(entry.suppress) || undefined,
    aliases: aliases.length ? aliases : undefined
  };
  if (entry.display && entry.display !== output.word) output.display = entry.display;
  if (entry.notes) output.notes = entry.notes;
  return Object.fromEntries(Object.entries(output).filter(([, value]) => value !== undefined && value !== ""));
}

function mergeTeacherUpdates(updateData = {}, entries = []) {
  const existingEntries = Array.isArray(updateData.entries) ? updateData.entries : [];
  const mergedExistingEntries = existingEntries.map((entry) => ({ ...entry }));
  const existingKeyIndex = new Map(mergedExistingEntries.map((entry, index) => [teacherUpdateKey(entry), index]));
  const aliasUpdatesByKey = new Map();
  const additions = [];

  entries.forEach((entry) => {
    const updateEntry = makeTeacherUpdateEntry(entry);
    const key = teacherUpdateKey(updateEntry);
    if (existingKeyIndex.has(key)) {
      const existingIndex = existingKeyIndex.get(key);
      const mergedAliases = TeacherImporter.normalizeAliases([
        ...(mergedExistingEntries[existingIndex].aliases || []),
        ...(updateEntry.aliases || [])
      ]);
      if (mergedAliases.length) {
        const before = TeacherImporter.normalizeAliases(mergedExistingEntries[existingIndex].aliases || []);
        mergedExistingEntries[existingIndex] = {
          ...mergedExistingEntries[existingIndex],
          aliases: mergedAliases
        };
        if (mergedAliases.join("\u0001") !== before.join("\u0001")) {
          aliasUpdatesByKey.set(key, mergedExistingEntries[existingIndex]);
        }
      }
      return;
    }
    existingKeyIndex.set(key, mergedExistingEntries.length + additions.length);
    additions.push(updateEntry);
  });

  const aliasUpdates = Array.from(aliasUpdatesByKey.values());

  return {
    data: {
      ...updateData,
      meta: {
        ...(updateData.meta || {}),
        notes: updateData.meta?.notes || "Austin Sir reviewed vocab meanings."
      },
      entries: [...mergedExistingEntries, ...additions]
    },
    additions,
    aliasUpdates,
    changedEntries: [...additions, ...aliasUpdates]
  };
}

function formatCompactJsonValue(value) {
  if (Array.isArray(value)) return `[${value.map(formatCompactJsonValue).join(", ")}]`;
  if (value && typeof value === "object") return formatCompactJsonObject(value);
  return JSON.stringify(value);
}

function formatCompactJsonObject(object = {}) {
  const entries = Object.entries(object)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${JSON.stringify(key)}: ${formatCompactJsonValue(value)}`);
  return `{ ${entries.join(", ")} }`;
}

function formatTeacherUpdatesJson(data = {}) {
  const meta = data.meta || {};
  const entries = Array.isArray(data.entries) ? data.entries : [];
  const metaText = JSON.stringify(meta, null, 2).replace(/\n/g, "\n  ");
  const entryText = entries.map((entry) => `    ${formatCompactJsonObject(entry)}`).join(",\n");
  return `{
  "meta": ${metaText},
  "entries": [
${entryText}
  ]
}
`;
}

function curatedEntryKey(entry = {}) {
  return [
    normalizeWord(entry.word),
    normalizeType(entry.type, entry.word),
    normalizePos(entry.pos),
    normalizeMeaning(entry.meaning)
  ].join("\u0001");
}

function makeCuratedRawEntry(entry = {}) {
  const raw = [
    normalizeWord(entry.word),
    normalizePos(entry.pos),
    normalizeMeaning(entry.meaning)
  ];
  const options = {};
  if (normalizeType(entry.type, entry.word) !== "word") options.type = normalizeType(entry.type, entry.word);
  if (entry.level) options.level = String(entry.level).trim().toUpperCase();
  if (Object.keys(options).length) raw.push(options);
  return raw;
}

function formatJsString(value) {
  return JSON.stringify(String(value || ""));
}

function formatCuratedRawEntry(raw = []) {
  const [word, pos, meaning, options] = raw;
  const cells = [formatJsString(word), formatJsString(pos), formatJsString(meaning)];
  if (options && Object.keys(options).length) cells.push(JSON.stringify(options));
  return `    [${cells.join(", ")}]`;
}

function buildCuratedInsertText(rawEntries = []) {
  return rawEntries.map(formatCuratedRawEntry).join(",\n");
}

function mergeCuratedBank(sourceText = "", entries = []) {
  const existingKeys = new Set((VocabSenseBank.entries || []).map(curatedEntryKey));
  const additions = entries
    .filter((entry) => !existingKeys.has(curatedEntryKey(entry)))
    .map(makeCuratedRawEntry);

  if (!additions.length) return { sourceText, additions };

  const marker = "\n  ];";
  const markerIndex = sourceText.indexOf(marker);
  if (markerIndex < 0) {
    throw new Error("Could not find ENTRIES closing marker in vocab_sense_bank.js");
  }
  const prefix = sourceText.slice(0, markerIndex).replace(/\s+$/, "");
  const suffix = sourceText.slice(markerIndex);
  const separator = prefix.endsWith("[") ? "\n" : ",\n";
  return {
    sourceText: `${prefix}${separator}${buildCuratedInsertText(additions)}${suffix}`,
    additions
  };
}

function loadTeacherBank(filePath = DEFAULT_TEACHER_BANK) {
  const resolved = path.resolve(filePath || DEFAULT_TEACHER_BANK);
  const target = fs.existsSync(resolved) ? resolved : DEFAULT_TEACHER_BANK;
  delete require.cache[require.resolve(target)];
  return require(target);
}

function slugify(value) {
  return normalizeWord(value)
    .replace(/\(([^)]+)\)/g, "$1")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "entry";
}

function teacherBankEntryKey(entry = {}) {
  return [
    normalizeWord(entry.word),
    normalizeType(entry.type, entry.word),
    normalizePos(entry.pos || entry.inferredPos),
    normalizeMeaning(entry.meaning)
  ].join("\u0001");
}

function teacherBankWordTypeKey(entry = {}) {
  return [
    normalizeWord(entry.word),
    normalizeType(entry.type, entry.word)
  ].join("\u0001");
}

function shouldReplaceTeacherBankEntry(entry = {}, replacementEntries = []) {
  if (!replacementEntries.length) return false;
  const entryPos = normalizePos(entry.pos);
  if (!entryPos) return true;
  return replacementEntries.some((replacement) => {
    const replacementPos = normalizePos(replacement.pos);
    return !replacementPos || replacementPos === entryPos;
  });
}

function makeTeacherBankEntry(entry = {}, index = 0) {
  const word = normalizeWord(entry.word);
  const pos = normalizePos(entry.pos);
  const type = normalizeType(entry.type, word);
  return {
    id: `${slugify(word)}-${pos || type || "any"}-entry-${String(index + 1).padStart(4, "0")}`.slice(0, 96),
    word,
    display: String(entry.display || entry.word || word).trim() || word,
    meaning: normalizeMeaning(entry.meaning),
    pos,
    type,
    needsReview: false,
    aliases: entry.aliases?.length ? TeacherImporter.normalizeAliases(entry.aliases) : undefined,
    sourceCount: 1
  };
}

function mergeTeacherBank(existingBank = {}, additions = [], options = {}) {
  const existingEntries = Array.isArray(existingBank.entries) ? existingBank.entries : [];
  const replacementsByWordType = additions
    .filter((entry) => entry.replaceType)
    .reduce((map, entry) => {
      const key = teacherBankWordTypeKey(entry);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(entry);
      return map;
    }, new Map());
  const filteredEntries = existingEntries.filter((entry) => {
    const replacements = replacementsByWordType.get(teacherBankWordTypeKey(entry)) || [];
    return !shouldReplaceTeacherBankEntry(entry, replacements);
  }).map((entry) => ({ ...entry }));
  const removedEntryCount = existingEntries.length - filteredEntries.length;
  const entries = [...filteredEntries];
  const seen = new Map(entries.map((entry, index) => [teacherBankEntryKey(entry), index]));
  const addedEntries = [];

  additions.forEach((entry) => {
    if (entry.suppress) return;
    const nextEntry = makeTeacherBankEntry(entry, entries.length);
    const key = teacherBankEntryKey(nextEntry);
    if (seen.has(key)) {
      const existingIndex = seen.get(key);
      const mergedAliases = TeacherImporter.normalizeAliases([
        ...(entries[existingIndex].aliases || []),
        ...(nextEntry.aliases || [])
      ]);
      if (mergedAliases.length) entries[existingIndex].aliases = mergedAliases;
      return;
    }
    seen.set(key, entries.length);
    addedEntries.push(nextEntry);
    entries.push(nextEntry);
  });

  const updateFiles = [
    ...(existingBank.meta?.updateFiles || []),
    ...(additions.length ? [{
      name: path.basename(options.teacherUpdates || DEFAULT_TEACHER_UPDATES),
      addedEntryCount: additions.length
    }] : [])
  ];

  return {
    meta: {
      ...(existingBank.meta || {}),
      generatedAt: new Date().toISOString(),
      sourceFiles: existingBank.meta?.sourceFiles || [],
      updateFiles,
      entryCount: entries.length,
      uniqueWordCount: new Set(entries.map((entry) => normalizeWord(entry.word))).size
    },
    entries,
    mergeSummary: {
      addedEntryCount: addedEntries.length,
      removedEntryCount,
      netEntryCount: entries.length - existingEntries.length
    }
  };
}

function createTeacherBankFromExistingAndAdditions(additions = [], options = {}) {
  const existingBank = loadTeacherBank(options.teacherBank || DEFAULT_TEACHER_BANK);
  const merged = mergeTeacherBank(existingBank, additions, options);
  const { mergeSummary: _mergeSummary, ...bank } = merged;
  return TeacherImporter.createBankJs(bank);
}

function applyPlan(plan, options = {}) {
  const split = splitEntries(plan.entries || []);
  const teacherUpdates = loadTeacherUpdates(options.teacherUpdates || DEFAULT_TEACHER_UPDATES);
  const mergedTeacher = mergeTeacherUpdates(teacherUpdates, split.teacher);
  const curatedSource = fs.existsSync(options.curatedBank || DEFAULT_CURATED_BANK)
    ? fs.readFileSync(options.curatedBank || DEFAULT_CURATED_BANK, "utf8")
    : "";
  const mergedCurated = mergeCuratedBank(curatedSource, split.curated);
  const existingTeacherBank = loadTeacherBank(options.teacherBank || DEFAULT_TEACHER_BANK);
  const mergedTeacherBankPayload = mergeTeacherBank(
    existingTeacherBank,
    split.teacher,
    options
  );
  const { mergeSummary: teacherBankMergeSummary, ...mergedTeacherBank } = mergedTeacherBankPayload;
  const teacherBankSource = TeacherImporter.createBankJs(mergedTeacherBank);

  const summary = {
    inputEntryCount: plan.entries.length,
    acceptedEntryCount: split.accepted.length,
    skippedEntryCount: split.skipped.length,
    teacherPlanCount: split.teacher.length,
    curatedPlanCount: split.curated.length,
    teacherAddCount: mergedTeacher.additions.length,
    teacherAliasUpdateCount: mergedTeacher.aliasUpdates.length,
    teacherBankAddCount: teacherBankMergeSummary.addedEntryCount,
    teacherBankRemovedCount: teacherBankMergeSummary.removedEntryCount,
    teacherBankNetCount: teacherBankMergeSummary.netEntryCount,
    curatedAddCount: mergedCurated.additions.length,
    write: Boolean(options.write),
    skipped: split.skipped
  };

  if (options.write) {
    fs.writeFileSync(options.teacherUpdates || DEFAULT_TEACHER_UPDATES, formatTeacherUpdatesJson(mergedTeacher.data));
    fs.writeFileSync(options.curatedBank || DEFAULT_CURATED_BANK, mergedCurated.sourceText);
    fs.writeFileSync(options.teacherBank || DEFAULT_TEACHER_BANK, teacherBankSource);
    summary.applyReceipt = writeApplyReceipt(summary, options);
    if (options.refresh !== false) summary.refreshed = refreshReviewStatusAfterApply(options.input || DEFAULT_PLAN, options);
  }

  return summary;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const plan = loadPlan(options.input);
  const summary = applyPlan(plan, options);
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
  applyPlan,
  buildCuratedInsertText,
  createTeacherBankFromExistingAndAdditions,
  curatedEntryKey,
  formatTeacherUpdatesJson,
  getReviewQueueForPlan,
  inferApplyReceiptPath,
  loadPlan,
  makeCuratedRawEntry,
  makeTeacherUpdateEntry,
  mergeTeacherBank,
  mergeCuratedBank,
  mergeTeacherUpdates,
  normalizeReviewBatchId,
  parseArgs,
  refreshReviewStatusAfterApply,
  splitEntries
};
