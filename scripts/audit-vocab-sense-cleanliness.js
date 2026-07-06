#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

global.window = globalThis;
require("../grammar_verb_table_data.js");

const senseBank = require("../vocab_sense_bank.js");
const VocabExampleUtils = require("../vocab_example_utils.js");
const seed = require("../vocab_example_seed.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_OUT = path.join(ROOT_DIR, "private_exports", "vocab_sense_cleanliness_audit.json");

function parseArgs(argv) {
  const options = {
    out: DEFAULT_OUT,
    write: true,
    limit: 30
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--no-write") {
      options.write = false;
      continue;
    }
    if (arg === "--out") {
      options.out = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--limit") {
      options.limit = Math.max(0, Number(argv[index + 1]) || 0);
      index += 1;
    }
  }
  return options;
}

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeMeaning(value) {
  return senseBank.normalizeMeaning
    ? senseBank.normalizeMeaning(value)
    : String(value || "").trim().replace(/\s*[/／;；]\s*/g, " / ").replace(/\s+/g, " ");
}

function exactSenseKey(entry = {}) {
  return [
    normalizeText(entry.word),
    normalizeText(entry.type),
    normalizeText(entry.pos),
    normalizeMeaning(entry.meaning)
  ].join("|");
}

function getSeedKeys(entry = {}) {
  const hint = {
    meaning: entry.meaning,
    pos: entry.pos,
    type: entry.type,
    level: entry.level
  };
  const keys = [
    VocabExampleUtils.getLocalCacheKey(entry.word, [hint]),
    VocabExampleUtils.getLocalCacheKey(entry.word, [{ ...hint, pos: "" }]),
    VocabExampleUtils.getLocalCacheKey(entry.word, [{ meaning: entry.meaning, pos: "", type: "" }])
  ];
  return Array.from(new Set(keys.filter(Boolean)));
}

function countValidExamples(payload = {}) {
  const seen = new Set();
  return (Array.isArray(payload.examples) ? payload.examples : []).filter((example) => {
    const source = String(example.source || "").trim().replace(/\s+/g, " ");
    const target = String(example.target || "").trim().replace(/\s+/g, " ");
    if (!source || !target) return false;
    const key = `${source}|${target}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).length;
}

function getValidSeedExampleCount(entry = {}) {
  return Math.max(0, ...getSeedKeys(entry).map((key) => countValidExamples(seed.entries?.[key])));
}

function audit() {
  const sourceEntries = Array.isArray(senseBank.cleanEntries) ? senseBank.cleanEntries : senseBank.entries;
  const visibleEntries = sourceEntries.filter((entry) => !entry.hidden);
  const groups = new Map();
  visibleEntries.forEach((entry) => {
    const key = exactSenseKey(entry);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  });
  const duplicateGroups = Array.from(groups.entries())
    .filter(([, entries]) => entries.length > 1)
    .map(([key, entries]) => ({
      key,
      word: entries[0].word,
      display: entries[0].display,
      pos: entries[0].pos,
      type: entries[0].type,
      meaning: entries[0].meaning,
      count: entries.length,
      sources: entries.map((entry) => entry.sourceEntryId || entry.source)
    }));

  const missingExampleEntries = visibleEntries
    .filter((entry) => entry.overrideTeacher || /reviewed|curated|sense-bank|verb-table/.test(entry.source || ""))
    .map((entry) => ({
      word: entry.word,
      display: entry.display,
      meaning: entry.meaning,
      pos: entry.pos,
      type: entry.type,
      level: entry.level,
      source: entry.source,
      sourceEntryId: entry.sourceEntryId,
      localKeys: getSeedKeys(entry),
      validExampleCount: getValidSeedExampleCount(entry)
    }))
    .filter((entry) => entry.validExampleCount < 3);

  return {
    checkedAt: new Date().toISOString(),
    summary: {
      visibleEntryCount: visibleEntries.length,
      duplicateGroupCount: duplicateGroups.length,
      missingExampleEntryCount: missingExampleEntries.length
    },
    duplicateGroups,
    missingExampleEntries
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = audit();
  if (options.write) {
    fs.mkdirSync(path.dirname(options.out), { recursive: true });
    fs.writeFileSync(options.out, `${JSON.stringify(report, null, 2)}\n`);
  }
  console.log(JSON.stringify({
    ...report.summary,
    out: options.write ? options.out : ""
  }, null, 2));
  if (options.limit) {
    console.log(JSON.stringify({
      duplicateGroups: report.duplicateGroups.slice(0, options.limit),
      missingExampleEntries: report.missingExampleEntries.slice(0, options.limit)
    }, null, 2));
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  audit,
  exactSenseKey,
  getSeedKeys,
  getValidSeedExampleCount
};
