#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_JSON_OUT = path.join(ROOT_DIR, "private_exports", "vocab_phrase_component_gaps.json");
const DEFAULT_CSV_OUT = path.join(ROOT_DIR, "private_exports", "vocab_phrase_component_gaps.csv");

global.window = globalThis;
require(path.join(ROOT_DIR, "grammar_verb_table_data.js"));
const senseBank = require(path.join(ROOT_DIR, "vocab_sense_bank.js"));
const teacherVocab = require(path.join(ROOT_DIR, "teacher_vocab.js"));
const cedictSupplement = require(path.join(ROOT_DIR, "cc_cedict_supplement.js"));

const STOP_COMPONENTS = new Set(`
a an the and or but nor so yet
for to of in on at by from with without into onto over under above below across through around about against between among during before after as than like per via
is are was were be been being am do does did have has had will would can could should may might must shall
one one's ones oneself someone somebody someone's somebody's something sth sb it its this that these those my your his her our their me him them us you i we he she they
not no all any every each either neither both some such same other another
up out off down away back
can't cannot don't doesn't didn't won't wouldn't isn't aren't wasn't weren't
`.trim().split(/\s+/));

const NON_STANDALONE_COMPONENTS = new Set(`
hong kong tai po sha shui wan tung chau cheung kwai lam lantau tong yuen wong siu chai choi chung shek sai shan kwun kowloon macau
pre anti eco non mini multi semi sub mid post co re ultra micro macro cyber
st nd rd th ing noun adj adjective verb adverb modal pron det prep conj
instagram facebook tiktok youtube whatsapp google microsoft netflix disney oxford cambridge harvard michelin
`.trim().split(/\s+/));

const SOURCE_ALLOWLIST_FOR_EXCLUDED_PROPER_PARTS = [
  /^curated-sense-bank$/,
  /^cc-cedict-supplement$/,
  /^mock-unseen-/
];

function parseArgs(argv) {
  const options = {
    jsonOut: DEFAULT_JSON_OUT,
    csvOut: DEFAULT_CSV_OUT,
    includeExcluded: false,
    maxExamples: 8
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--out") options.jsonOut = path.resolve(argv[++index]);
    else if (arg === "--csv") options.csvOut = path.resolve(argv[++index]);
    else if (arg === "--include-excluded") options.includeExcluded = true;
    else if (arg === "--no-csv") options.csvOut = "";
    else if (arg === "--examples") options.maxExamples = Math.max(1, Number(argv[++index]) || options.maxExamples);
    else if (arg === "--help" || arg === "-h") {
      console.log([
        "Usage: node scripts/audit-vocab-phrase-components.js [options]",
        "",
        "Options:",
        "  --out <file>        JSON output path",
        "  --csv <file>        CSV output path",
        "  --no-csv            Skip CSV output",
        "  --include-excluded  Include ignored stopword/proper-fragment rows in JSON",
        "  --examples <n>      Max phrase examples per missing component"
      ].join("\n"));
      process.exit(0);
    }
  }
  return options;
}

function normalizeWord(value) {
  if (typeof senseBank.normalizeWord === "function") return senseBank.normalizeWord(value);
  return String(value || "").trim().replace(/[’‘]/g, "'").replace(/[‐‑‒–—―]/g, "-").replace(/\s+/g, " ").toLowerCase();
}

function normalizeDisplay(value) {
  return String(value || "")
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ");
}

function tokenizePhrase(value) {
  return normalizeWord(value)
    .replace(/&/g, " and ")
    .replace(/\.\.\.|…/g, " ")
    .split(/[\s/-]+/)
    .map((token) => token.replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, "").replace(/^'+|'+$/g, ""))
    .filter(Boolean);
}

function getLookupVariants(component) {
  const variants = new Set([component]);
  if (component.endsWith("'s")) variants.add(component.slice(0, -2));
  if (component.endsWith("ies") && component.length > 4) variants.add(`${component.slice(0, -3)}y`);
  if (component.endsWith("ves") && component.length > 4) {
    variants.add(`${component.slice(0, -3)}f`);
    variants.add(`${component.slice(0, -3)}fe`);
  }
  if (component.endsWith("es") && component.length > 3) variants.add(component.slice(0, -2));
  if (component.endsWith("s") && component.length > 3) variants.add(component.slice(0, -1));
  if (component.endsWith("ing") && component.length > 5) {
    variants.add(component.slice(0, -3));
    variants.add(`${component.slice(0, -3)}e`);
  }
  if (component.endsWith("ed") && component.length > 4) {
    variants.add(component.slice(0, -2));
    variants.add(component.slice(0, -1));
  }
  return Array.from(variants).filter(Boolean);
}

function lookupAny(component) {
  const variants = getLookupVariants(component);
  for (const variant of variants) {
    const curated = senseBank.lookup(variant, { limit: 1 });
    if (curated.length) return { covered: true, via: "curated", variant, entry: curated[0] };
    const teacher = typeof teacherVocab.lookupStudentReady === "function"
      ? teacherVocab.lookupStudentReady(variant, { limit: 1 })
      : [];
    if (teacher.length) return { covered: true, via: "teacher", variant, entry: teacher[0] };
    const cedict = typeof cedictSupplement.lookup === "function"
      ? cedictSupplement.lookup(variant, { limit: 1 })
      : [];
    if (cedict.length) return { covered: true, via: "cedict", variant, entry: cedict[0] };
  }
  return { covered: false, via: "", variant: "" };
}

function isLikelyProperNamePart(component, examples) {
  if (NON_STANDALONE_COMPONENTS.has(component)) return true;
  return examples.some((example) => {
    const display = normalizeDisplay(example.display);
    if (!display) return false;
    const parts = display.split(/[\s/-]+/).filter(Boolean);
    const matchingPart = parts.find((part) => normalizeWord(part) === component);
    if (!matchingPart) return false;
    return /^[A-Z][a-z]+$/.test(matchingPart)
      && parts.some((part) => /^[A-Z][a-z]+$/.test(part))
      && SOURCE_ALLOWLIST_FOR_EXCLUDED_PROPER_PARTS.some((pattern) => pattern.test(example.source || ""));
  });
}

function getIgnoreReason(component, examples) {
  if (!component || component.length < 3) return "too-short";
  if (STOP_COMPONENTS.has(component)) return "function-word";
  if (/^\d[\d,]*$/.test(component) || /^\d[\d,]*(?:st|nd|rd|th|s)$/.test(component)) return "number";
  if (/^\d[\d,]*[a-z]+$/.test(component)) return "number-fragment";
  if (/^[a-z]$/.test(component)) return "single-letter";
  if (/^[ivx]+$/.test(component)) return "roman-numeral";
  if (component.includes("'") && /^(?:someone|somebody|one|everyone|everybody|people|parent|student|child|children|artist|baby)'?s$/.test(component)) {
    return "placeholder-possessive";
  }
  if (component === "..." || component === "…") return "pattern-placeholder";
  if (isLikelyProperNamePart(component, examples)) return "proper-name-or-prefix-fragment";
  return "";
}

function createComponentAudit(options = {}) {
  const phraseEntries = senseBank.entries.filter((entry) => {
    if (!entry || entry.hidden) return false;
    const display = normalizeWord(entry.display || entry.word);
    return entry.type === "phrase" || display.includes(" ");
  });

  const components = new Map();
  phraseEntries.forEach((entry) => {
    const display = normalizeDisplay(entry.display || entry.word);
    const uniqueTokens = Array.from(new Set(tokenizePhrase(display)));
    uniqueTokens.forEach((component) => {
      if (!components.has(component)) {
        components.set(component, {
          component,
          phraseCount: 0,
          examples: []
        });
      }
      const row = components.get(component);
      row.phraseCount += 1;
      if (row.examples.length < options.maxExamples) {
        row.examples.push({
          display,
          meaning: entry.meaning,
          source: entry.source,
          pos: entry.pos,
          type: entry.type
        });
      }
    });
  });

  const rows = Array.from(components.values()).map((row) => {
    const coverage = lookupAny(row.component);
    const ignoreReason = coverage.covered ? "" : getIgnoreReason(row.component, row.examples);
    return {
      ...row,
      covered: coverage.covered,
      coveredVia: coverage.via,
      coveredVariant: coverage.variant,
      ignoreReason,
      actionable: !coverage.covered && !ignoreReason
    };
  }).sort((left, right) => (
    Number(right.actionable) - Number(left.actionable)
      || right.phraseCount - left.phraseCount
      || left.component.localeCompare(right.component)
  ));

  const actionable = rows.filter((row) => row.actionable);
  const ignoredMissing = rows.filter((row) => !row.covered && row.ignoreReason);
  const covered = rows.filter((row) => row.covered);

  return {
    generatedAt: new Date().toISOString(),
    phraseEntryCount: phraseEntries.length,
    uniqueComponentCount: rows.length,
    coveredComponentCount: covered.length,
    missingComponentCount: rows.length - covered.length,
    actionableMissingCount: actionable.length,
    ignoredMissingCount: ignoredMissing.length,
    actionable,
    ignoredMissing: options.includeExcluded ? ignoredMissing : undefined
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(filePath, rows) {
  const header = ["component", "phraseCount", "examples", "sources"];
  const lines = [header.join(",")];
  rows.forEach((row) => {
    lines.push([
      row.component,
      row.phraseCount,
      row.examples.map((example) => `${example.display} = ${example.meaning}`).join(" | "),
      Array.from(new Set(row.examples.map((example) => example.source))).join(" | ")
    ].map(csvEscape).join(","));
  });
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const audit = createComponentAudit(options);
  fs.mkdirSync(path.dirname(options.jsonOut), { recursive: true });
  fs.writeFileSync(options.jsonOut, `${JSON.stringify(audit, null, 2)}\n`);
  if (options.csvOut) writeCsv(options.csvOut, audit.actionable);
  console.log(JSON.stringify({
    phraseEntryCount: audit.phraseEntryCount,
    uniqueComponentCount: audit.uniqueComponentCount,
    coveredComponentCount: audit.coveredComponentCount,
    missingComponentCount: audit.missingComponentCount,
    actionableMissingCount: audit.actionableMissingCount,
    ignoredMissingCount: audit.ignoredMissingCount,
    jsonOut: options.jsonOut,
    csvOut: options.csvOut || ""
  }, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  createComponentAudit,
  getLookupVariants,
  tokenizePhrase
};
