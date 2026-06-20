#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const VocabPosInference = require("../vocab_pos_inference.js");
const TeacherVocab = require("../teacher_vocab.js");
const VocabSenseBank = require("../vocab_sense_bank.js");
const CcCedictSupplement = require("../cc_cedict_supplement.js");
const TeacherAudit = require("./audit-teacher-vocab.js");
const SupplementChecklist = require("./vocab-supplement-checklist.js");
const meaningGenerator = require("./generate-vocab-meanings.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const PRIVATE_EXPORTS_DIR = path.join(ROOT_DIR, "private_exports");
const DEFAULT_OUTPUT = path.join(PRIVATE_EXPORTS_DIR, "vocab_review_batch_0000.json");
const DEFAULT_LIMIT = 100;
const SOURCE_OXFORD = "oxford";
const SOURCE_SUPPLEMENT = "supplement";
const SOURCE_TEACHER_AUDIT = "teacher-audit";
const SOURCE_ALL = "all";
const SUPPORTED_SOURCES = new Set([SOURCE_OXFORD, SOURCE_SUPPLEMENT, SOURCE_TEACHER_AUDIT, SOURCE_ALL]);
const OFFLINE_DICTIONARY_DIR = path.join(ROOT_DIR, "assets", "offline-dictionary");
const CEDICT_REVERSE_DIR = path.join(ROOT_DIR, "assets", "cc-cedict-reverse");
const MEANING_SEED_PATH = path.join(PRIVATE_EXPORTS_DIR, "vocab_meaning_seed.js");

const shardCache = new Map();

function usage() {
  console.log([
    "Usage:",
    "  node scripts/build-vocab-review-batch.js [options]",
    "",
    "Options:",
    "  --source <oxford|supplement|teacher-audit|all>",
    "                                      Review source. Default: oxford.",
    "  --offset <n>                         Starting row. Default: 0.",
    "  --limit <n>                          Batch size. Default: 100.",
    "  --level <A1-C1>                      Oxford CEFR level filter.",
    "  --word <word>                        One word / phrase only.",
    "  --skip-junk                          Skip likely spreadsheet extraction fragments in teacher-audit batches.",
    "  --out <file>                         JSON output. Default: private_exports/vocab_review_batch_0000.json",
    "  --csv <file>                         CSV output. Default: same basename as JSON.",
    "",
    "This creates private review material only. It does not promote entries into the student dictionary."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    csv: "",
    level: "",
    limit: DEFAULT_LIMIT,
    offset: 0,
    out: DEFAULT_OUTPUT,
    skipJunk: false,
    source: SOURCE_OXFORD,
    word: ""
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--source") {
      options.source = String(argv[index + 1] || options.source).trim().toLowerCase();
      index += 1;
      continue;
    }
    if (arg === "--offset") {
      options.offset = Math.max(0, Number(argv[index + 1]) || 0);
      index += 1;
      continue;
    }
    if (arg === "--limit") {
      options.limit = Math.max(1, Number(argv[index + 1]) || DEFAULT_LIMIT);
      index += 1;
      continue;
    }
    if (arg === "--level") {
      options.level = String(argv[index + 1] || "").trim().toUpperCase();
      index += 1;
      continue;
    }
    if (arg === "--word") {
      options.word = normalizeWord(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--skip-junk") {
      options.skipJunk = true;
      continue;
    }
    if (arg === "--out") {
      options.out = path.resolve(argv[index + 1] || DEFAULT_OUTPUT);
      index += 1;
      continue;
    }
    if (arg === "--csv") {
      options.csv = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
  }

  if (!SUPPORTED_SOURCES.has(options.source)) {
    throw new Error(`Unsupported source: ${options.source}`);
  }
  if (options.level && !/^(A1|A2|B1|B2|C1)$/.test(options.level)) {
    throw new Error(`Unsupported CEFR level: ${options.level}`);
  }
  if (!options.csv) {
    options.csv = options.out.replace(/\.[^.]+$/, "") + ".csv";
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

function formatPosLabel(pos) {
  return TeacherVocab.formatPosLabel(pos) || (pos ? `${pos}.` : "");
}

function inferType(word, explicitType = "") {
  return VocabPosInference.normalizeType(explicitType, word);
}

function inferAuditType(word, explicitType = "") {
  const normalizedExplicit = String(explicitType || "").trim().toLowerCase();
  if (normalizedExplicit === "word") return inferType(word, "");
  return inferType(word, explicitType);
}

function shardName(word) {
  const first = normalizeWord(word)[0] || "#";
  return /^[a-z]$/.test(first) ? first : "other";
}

function loadJsModule(filePath, fallback = null) {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) return fallback;
  delete require.cache[require.resolve(resolvedPath)];
  return require(resolvedPath);
}

function loadWindowAssignedShard(filePath, globalName, shard) {
  const cacheKey = `${globalName}:${shard}`;
  if (shardCache.has(cacheKey)) return shardCache.get(cacheKey);
  if (!fs.existsSync(filePath)) {
    shardCache.set(cacheKey, []);
    return [];
  }

  const windowObject = {};
  const sandbox = {
    window: windowObject,
    globalThis: windowObject
  };
  vm.runInNewContext(fs.readFileSync(filePath, "utf8"), sandbox, {
    filename: filePath,
    timeout: 1000
  });
  const entries = windowObject[globalName]?.[shard]?.entries || [];
  shardCache.set(cacheKey, entries);
  return entries;
}

function loadOfflineDictionaryShard(word) {
  const shard = shardName(word);
  return loadWindowAssignedShard(
    path.join(OFFLINE_DICTIONARY_DIR, `${shard}.js`),
    "OFFLINE_DICTIONARY_SHARDS",
    shard
  );
}

function loadCedictReverseShard(word) {
  const shard = shardName(word);
  return loadWindowAssignedShard(
    path.join(CEDICT_REVERSE_DIR, `${shard}.js`),
    "CC_CEDICT_REVERSE_SHARDS",
    shard
  );
}

function normalizeSourceEntry(entry = {}, source = "") {
  const word = normalizeWord(entry.word || entry.display);
  const meaning = normalizeMeaning(entry.meaning);
  if (!word || !meaning) return null;
  const pos = normalizePos(entry.pos || entry.inferredPos);
  return {
    id: String(entry.id || entry.sourceEntryId || `${source}-${word}`),
    word,
    display: String(entry.display || entry.word || word).trim() || word,
    pos,
    posLabel: formatPosLabel(pos),
    meaning,
    type: inferType(word, entry.type),
    source: source || entry.source || "",
    sourceEntryId: String(entry.sourceEntryId || entry.id || ""),
    rank: Number(entry.rank) || undefined,
    needsReview: Boolean(entry.needsReview)
  };
}

function dedupeEntries(entries = []) {
  const seen = new Set();
  return entries
    .map((entry) => normalizeSourceEntry(entry, entry.source))
    .filter(Boolean)
    .filter((entry) => {
      const key = [
        entry.word,
        entry.pos,
        entry.type,
        normalizeMeaningGroupKey(entry.meaning)
      ].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeMeaningGroupKey(value) {
  return normalizeMeaning(value)
    .replace(/[（）()「」『』]/g, "")
    .replace(/[的地]$/g, "")
    .replace(/\s*[/／]\s*/g, "/")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function lookupOfflineDictionary(word, options = {}) {
  const key = normalizeWord(word);
  if (!key) return [];
  const allowedPos = new Set((options.pos || []).map(normalizePos).filter(Boolean));
  return dedupeEntries(loadOfflineDictionaryShard(key)
    .filter((entry) => normalizeWord(entry.word) === key)
    .filter((entry) => !allowedPos.size || allowedPos.has(normalizePos(entry.pos)))
    .sort((left, right) => (Number(left.rank) || 999999) - (Number(right.rank) || 999999))
    .slice(0, Number(options.limit) || 10)
    .map((entry) => ({
      ...entry,
      source: "ecdict-material"
    })));
}

function lookupCedictReverse(word, options = {}) {
  const key = normalizeWord(word);
  if (!key) return [];
  return dedupeEntries(loadCedictReverseShard(key)
    .filter((entry) => normalizeWord(entry.word) === key)
    .sort((left, right) => (Number(left.rank) || 999999) - (Number(right.rank) || 999999))
    .slice(0, Number(options.limit) || 8)
    .map((entry) => ({
      ...entry,
      source: "cc-cedict-reverse-material"
    })));
}

function loadMeaningSeed(filePath = MEANING_SEED_PATH) {
  return loadJsModule(filePath, { entries: {} }) || { entries: {} };
}

function lookupMeaningSeed(word, seed = loadMeaningSeed()) {
  const key = normalizeWord(word);
  const payload = seed.entries?.[key];
  if (!payload?.entries?.length) return [];
  return dedupeEntries(payload.entries.map((entry, index) => ({
    ...entry,
    id: `meaning-seed-${key}-${index}`,
    word: key,
    display: payload.display || key,
    source: "generated-meaning-seed-material"
  })));
}

function getTeacherMatches(word) {
  return dedupeEntries(TeacherVocab.lookup(word, {
    exactOnly: true,
    includeNeedsReview: true,
    limit: 24
  }).map((entry) => ({
    ...entry,
    source: "teacher-bank"
  })));
}

function getCuratedMatches(word) {
  return dedupeEntries(VocabSenseBank.lookup(word, {
    includeHidden: true,
    limit: 24
  }).map((entry) => ({
    ...entry,
    source: "curated-sense-bank"
  })));
}

function getCcSupplementMatches(word) {
  return dedupeEntries(CcCedictSupplement.lookup(word, {
    limit: 12
  }).map((entry) => ({
    ...entry,
    source: "cc-cedict-supplement"
  })));
}

function makeOxfordReviewTasks() {
  return meaningGenerator.makeOxfordOnlyMeaningTasks().map((task) => ({
    id: task.id,
    source: SOURCE_OXFORD,
    word: task.word,
    display: task.display || task.word,
    level: task.level,
    oxfordPos: task.pos || [],
    posRaw: task.posRaw || [],
    type: inferType(task.word),
    checklist: {
      source: "private Oxford CEFR checklist",
      note: "Oxford PDF is used locally as a checklist only; raw list is not bundled into the app."
    }
  }));
}

function makeSupplementReviewTasks() {
  return (SupplementChecklist.entries || []).map((entry) => {
    const word = normalizeWord(entry.word || entry.display);
    const pos = normalizePos(entry.pos);
    const meaning = normalizeMeaning(entry.meaning);
    const category = String(entry.category || "supplement").trim();
    const display = String(entry.display || entry.word || word).trim() || word;
    return {
      id: entry.id || `supplement:${category}:${word}`,
      source: SOURCE_SUPPLEMENT,
      word,
      display,
      level: String(entry.level || "").trim().toUpperCase(),
      oxfordPos: pos ? [pos] : [],
      posRaw: pos ? [formatPosLabel(pos)] : [],
      type: inferType(word, entry.type),
      aliases: Array.isArray(entry.aliases) ? entry.aliases : [],
      supplementDrafts: meaning ? [{
        id: `supplement-draft:${category}:${word}:${pos || "entry"}`,
        word,
        display,
        pos,
        posLabel: formatPosLabel(pos),
        meaning,
        type: inferType(word, entry.type),
        source: "local-supplement-checklist",
        sourceEntryId: entry.id || ""
      }] : [],
      checklist: {
        source: "local supplement checklist",
        category,
        note: "Country / city / Hong Kong life / school vocab candidate. Review before promotion."
      }
    };
  }).filter((task) => task.word);
}

function makeTeacherAuditTasks() {
  return TeacherAudit.buildAuditRows(TeacherVocab.entries || [])
    .map((row) => {
      const word = normalizeWord(row.word || row.display);
      return {
        id: `teacher-audit:${row.id || word}`,
        source: SOURCE_TEACHER_AUDIT,
        word,
        display: row.display || row.word || word,
        level: "",
        oxfordPos: [normalizePos(row.pos)].filter(Boolean),
        posRaw: [],
        type: inferAuditType(word, row.type),
        audit: {
          id: row.id || "",
          score: Number(row.score) || 0,
          reasons: Array.isArray(row.reasons) ? row.reasons : [],
          originalPos: normalizePos(row.pos),
          originalMeaning: normalizeMeaning(row.meaning),
          sourceFile: row.sourceFile || "",
          notes: row.notes || ""
        },
        checklist: {
          source: "teacher bank audit",
          note: "Existing teacher entry is suspicious and should be cleaned before promotion."
        }
      };
    })
    .filter((task) => task.word);
}

function isLikelyTeacherAuditJunk(task = {}) {
  const word = normalizeWord(task.word);
  const display = String(task.display || task.word || "").trim();
  const originalMeaning = normalizeMeaning(task.audit?.originalMeaning || "");
  if (/^[a-z]$/.test(word)) return true;
  if (!/[a-z]{2,}/.test(word)) return true;
  if (/^[-,.;:]+/.test(display)) return true;
  if (/[×]| x\d+\b/i.test(display)) return true;
  if (/^(?:[nv]|adj|adv|prep|conj)\.?$/i.test(word)) return true;
  if (/^[a-z]{2,}\s*[×x]\s*\d+$/i.test(display)) return true;
  if (/^[a-z]+$/.test(word) && originalMeaning && !/[\u3400-\u9fff]/.test(originalMeaning)) return true;
  return false;
}

function getReviewTasks(options = {}) {
  const taskGroups = [];
  if (options.source === SOURCE_OXFORD || options.source === SOURCE_ALL) {
    taskGroups.push(...makeOxfordReviewTasks());
  }
  if (options.source === SOURCE_SUPPLEMENT || options.source === SOURCE_ALL) {
    taskGroups.push(...makeSupplementReviewTasks());
  }
  if (options.source === SOURCE_TEACHER_AUDIT || options.source === SOURCE_ALL) {
    taskGroups.push(...makeTeacherAuditTasks());
  }

  const seen = new Set();
  return taskGroups
    .filter((task) => !(options.skipJunk && task.source === SOURCE_TEACHER_AUDIT && isLikelyTeacherAuditJunk(task)))
    .filter((task) => !options.level || task.level === options.level)
    .filter((task) => !options.word || normalizeWord(task.word) === options.word)
    .filter((task) => {
      const key = task.source === SOURCE_TEACHER_AUDIT
        ? `${task.source}:${task.audit?.id || task.id}:${task.word}:${task.audit?.originalMeaning || ""}`
        : task.source === SOURCE_SUPPLEMENT
          ? `${task.source}:${task.id}:${task.word}:${task.checklist?.category || ""}`
        : `${task.source}:${task.word}:${(task.oxfordPos || []).join(",")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function meaningListKey(entries = []) {
  return entries.map((entry) => `${entry.pos || entry.type}:${entry.meaning}`).join("|");
}

function getDraftFlags(task, existing, drafts) {
  const flags = [];
  const allDrafts = [
    ...drafts.ecdict,
    ...drafts.generatedSeed,
    ...drafts.ccCedictReverse
  ];
  const allExisting = [
    ...existing.teacher,
    ...existing.curated,
    ...existing.ccSupplement
  ];
  const draftMeaningGroups = new Map();
  allDrafts.forEach((entry) => {
    const key = normalizeMeaningGroupKey(entry.meaning);
    if (!key) return;
    draftMeaningGroups.set(key, (draftMeaningGroups.get(key) || 0) + 1);
  });

  if (task.source === SOURCE_TEACHER_AUDIT) flags.push("teacher-audit");
  if (task.source === SOURCE_SUPPLEMENT) flags.push("supplement-checklist");
  if (task.checklist?.category) flags.push(`category:${task.checklist.category}`);
  (task.audit?.reasons || []).forEach((reason) => flags.push(`audit:${reason}`));
  if (task.type === "phrase") flags.push("phrase");
  if ((task.oxfordPos || []).length > 1) flags.push("multi-pos");
  if (allExisting.length) flags.push("already-has-local-entry");
  if (!allDrafts.length) flags.push("no-draft-meaning");
  if ([...draftMeaningGroups.values()].some((count) => count > 1)) flags.push("duplicate-draft-meaning");
  if (allExisting.some((entry) => entry.needsReview)) flags.push("teacher-entry-needs-review");
  if (meaningListKey(drafts.ecdict) && meaningListKey(drafts.ccCedictReverse) && meaningListKey(drafts.ecdict) !== meaningListKey(drafts.ccCedictReverse)) {
    flags.push("sources-disagree");
  }
  if (allDrafts.some((entry) => !entry.pos) && (task.oxfordPos || []).length > 1) {
    flags.push("needs-pos-decision");
  }
  if (allDrafts.some((entry) => /[A-Za-z]{2,}|（.+?的過去式|undefined|null/i.test(entry.meaning))) {
    flags.push("noisy-draft-text");
  }

  return Array.from(new Set(flags));
}

function makeReviewRow(task, lookups = {}) {
  const existing = {
    teacher: lookups.teacher?.(task.word, task) || getTeacherMatches(task.word),
    curated: lookups.curated?.(task.word, task) || getCuratedMatches(task.word),
    ccSupplement: lookups.ccSupplement?.(task.word, task) || getCcSupplementMatches(task.word)
  };
  const drafts = {
    ecdict: lookups.ecdict?.(task.word, task) || lookupOfflineDictionary(task.word, { pos: task.oxfordPos, limit: 10 }),
    generatedSeed: lookups.generatedSeed?.(task.word, task) || [
      ...(task.supplementDrafts || []),
      ...lookupMeaningSeed(task.word)
    ],
    ccCedictReverse: lookups.ccCedictReverse?.(task.word, task) || lookupCedictReverse(task.word, { limit: 8 })
  };

  return {
    id: task.id,
    word: task.word,
    display: task.display || task.word,
    level: task.level || "",
    type: task.type || inferType(task.word),
    checklistSource: task.checklist,
    audit: task.audit || null,
    oxford: {
      pos: task.oxfordPos || [],
      posLabels: (task.oxfordPos || []).map(formatPosLabel),
      posRaw: task.posRaw || []
    },
    existing,
    drafts,
    flags: getDraftFlags(task, existing, drafts),
    review: {
      action: "edit-before-promote",
      promoteTo: "curated-or-teacher-bank",
      approvedEntries: [],
      notes: task.audit?.originalMeaning
        ? `Original: ${task.audit.originalMeaning}`
        : ""
    }
  };
}

function buildReviewRows(options = {}) {
  const tasks = Array.isArray(options.tasks) ? options.tasks : getReviewTasks(options);
  return tasks.map((task) => makeReviewRow(task, options.lookups || {}));
}

function stringifyEntry(entry) {
  const pos = entry.posLabel || formatPosLabel(entry.pos) || (entry.type === "phrase" ? "ph." : "");
  const prefix = pos ? `${pos} ` : "";
  return `${prefix}${entry.meaning}`;
}

function stringifyEntries(entries = []) {
  return entries.map(stringifyEntry).join(" | ");
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, "\"\"")}"`;
}

function buildCsv(rows = []) {
  const headers = [
    "word",
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
    "replace_type",
    "notes"
  ];
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((header) => {
      const value = {
        word: row.word,
        level: row.level,
        type: row.type,
        audit_reasons: row.audit?.reasons?.join(" / ") || "",
        original_teacher_entry: row.audit?.originalMeaning
          ? `${row.audit.originalPos ? `${formatPosLabel(row.audit.originalPos)} ` : ""}${row.audit.originalMeaning}`
          : "",
        oxford_pos: row.oxford.posLabels.join(" / "),
        existing_teacher: stringifyEntries(row.existing.teacher),
        existing_curated: stringifyEntries(row.existing.curated),
        ecdict_drafts: stringifyEntries(row.drafts.ecdict),
        generated_seed_drafts: stringifyEntries(row.drafts.generatedSeed),
        cc_cedict_reverse_drafts: stringifyEntries(row.drafts.ccCedictReverse),
        flags: row.flags.join(" / "),
        reviewed_pos: "",
        reviewed_meaning: "",
        promote_to: "",
        replace_type: "",
        notes: ""
      }[header];
      return csvEscape(value);
    }).join(","));
  });
  return `${lines.join("\n")}\n`;
}

function writeOutputs(options, rows, totalCandidateCount = rows.length) {
  const output = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: options.source,
      offset: options.offset,
      limit: options.limit,
      selectedCount: rows.length,
      totalCandidateCount,
      nextOffset: options.offset + rows.length,
      privateOnly: true,
      note: "Review material only. ECDICT / CC-CEDICT / generated meanings are draft material and must be edited before promotion."
    },
    entries: rows
  };

  fs.mkdirSync(path.dirname(options.out), { recursive: true });
  fs.writeFileSync(options.out, `${JSON.stringify(output, null, 2)}\n`);
  fs.writeFileSync(options.csv, buildCsv(rows));
  return output;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const allTasks = getReviewTasks(options);
  const selectedTasks = allTasks.slice(options.offset, options.offset + options.limit);
  const rows = buildReviewRows({
    ...options,
    tasks: selectedTasks
  });
  const output = writeOutputs(options, rows, allTasks.length);
  console.log(JSON.stringify({
    source: output.meta.source,
    totalCandidateCount: output.meta.totalCandidateCount,
    selectedCount: output.meta.selectedCount,
    nextOffset: output.meta.nextOffset,
    json: options.out,
    csv: options.csv
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
  buildCsv,
  buildReviewRows,
  dedupeEntries,
  getDraftFlags,
  getReviewTasks,
  inferAuditType,
  lookupCedictReverse,
  lookupOfflineDictionary,
  isLikelyTeacherAuditJunk,
  makeSupplementReviewTasks,
  makeReviewRow,
  normalizeMeaningGroupKey,
  parseArgs,
  SOURCE_SUPPLEMENT,
  stringifyEntries,
  writeOutputs
};
