#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const PromotePlan = require("./build-vocab-promote-plan.js");
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
  const output = {
    word: normalizeWord(entry.word),
    meaning: normalizeMeaning(entry.meaning),
    pos: normalizePos(entry.pos) || undefined,
    type: normalizeType(entry.type, entry.word),
    replaceType: Boolean(entry.replaceType)
  };
  if (entry.display && entry.display !== output.word) output.display = entry.display;
  if (entry.notes) output.notes = entry.notes;
  return Object.fromEntries(Object.entries(output).filter(([, value]) => value !== undefined && value !== ""));
}

function mergeTeacherUpdates(updateData = {}, entries = []) {
  const existingEntries = Array.isArray(updateData.entries) ? updateData.entries : [];
  const seen = new Set(existingEntries.map(teacherUpdateKey));
  const additions = [];

  entries.forEach((entry) => {
    const updateEntry = makeTeacherUpdateEntry(entry);
    const key = teacherUpdateKey(updateEntry);
    if (seen.has(key)) return;
    seen.add(key);
    additions.push(updateEntry);
  });

  return {
    data: {
      ...updateData,
      meta: {
        ...(updateData.meta || {}),
        notes: updateData.meta?.notes || "Austin Sir reviewed vocab meanings."
      },
      entries: [...existingEntries, ...additions]
    },
    additions
  };
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

function createTeacherBankFromExistingAndUpdates(updateData = {}, options = {}) {
  const ExistingBank = require("../teacher_vocab_bank.js");
  const existingRaw = Array.isArray(ExistingBank.entries) ? ExistingBank.entries.map((entry, index) => ({
    id: entry.id || "",
    word: normalizeWord(entry.word || entry.display),
    display: String(entry.display || entry.word || "").trim(),
    meaning: normalizeMeaning(entry.meaning),
    pos: normalizePos(entry.pos),
    type: normalizeType(entry.type, entry.word),
    source: entry.source || "teacher",
    sourceFile: "existing-teacher-vocab-bank.js",
    sheet: "Existing generated bank",
    row: index + 1,
    columns: "bank",
    needsReview: Boolean(entry.needsReview),
    notes: normalizeMeaning(entry.notes || ""),
    aliases: TeacherImporter.normalizeAliases(entry.aliases || entry.alias),
    override: false,
    replaceType: false
  })) : [];
  const manualRaw = TeacherImporter.createManualEntriesFromData(
    updateData,
    path.basename(options.teacherUpdates || DEFAULT_TEACHER_UPDATES)
  );
  const entries = TeacherImporter.dedupeEntries([...existingRaw, ...manualRaw]);
  const bank = {
    meta: {
      ...(ExistingBank.meta || {}),
      generatedAt: new Date().toISOString(),
      sourceFiles: ExistingBank.meta?.sourceFiles || [],
      updateFiles: [
        ...(ExistingBank.meta?.updateFiles || []),
        {
          name: path.basename(options.teacherUpdates || DEFAULT_TEACHER_UPDATES),
          rawEntryCount: manualRaw.length
        }
      ],
      entryCount: entries.length,
      uniqueWordCount: new Set(entries.map((entry) => normalizeWord(entry.word))).size
    },
    entries: entries.map((entry) => TeacherImporter.slimEntryForBank(entry))
  };
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
  const teacherBankSource = createTeacherBankFromExistingAndUpdates(mergedTeacher.data, options);

  const summary = {
    inputEntryCount: plan.entries.length,
    acceptedEntryCount: split.accepted.length,
    skippedEntryCount: split.skipped.length,
    teacherPlanCount: split.teacher.length,
    curatedPlanCount: split.curated.length,
    teacherAddCount: mergedTeacher.additions.length,
    curatedAddCount: mergedCurated.additions.length,
    write: Boolean(options.write),
    skipped: split.skipped
  };

  if (options.write) {
    fs.writeFileSync(options.teacherUpdates || DEFAULT_TEACHER_UPDATES, `${JSON.stringify(mergedTeacher.data, null, 2)}\n`);
    fs.writeFileSync(options.curatedBank || DEFAULT_CURATED_BANK, mergedCurated.sourceText);
    fs.writeFileSync(options.teacherBank || DEFAULT_TEACHER_BANK, teacherBankSource);
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
  curatedEntryKey,
  loadPlan,
  makeCuratedRawEntry,
  makeTeacherUpdateEntry,
  mergeCuratedBank,
  mergeTeacherUpdates,
  parseArgs,
  splitEntries
};
