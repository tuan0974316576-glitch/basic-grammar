#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const VocabPosInference = require("../vocab_pos_inference.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_INPUT = path.join(ROOT_DIR, "teacher_vocab_bank.js");
const DEFAULT_OUTPUT = DEFAULT_INPUT;
const DEFAULT_OXFORD = path.join(ROOT_DIR, "private_exports", "oxford_cefr_vocab.js");

function usage() {
  console.log([
    "Usage:",
    "  node scripts/enrich-teacher-vocab-pos.js [options]",
    "",
    "Options:",
    "  --in <file>           Teacher bank JS input.",
    "  --out <file>          Output teacher bank JS.",
    "  --dry-run             Print stats only.",
    "  --min-confidence <n>  Minimum POS inference confidence. Default: 84.",
    "",
    "Example:",
    "  npm run vocab:pos"
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    input: DEFAULT_INPUT,
    minConfidence: 84,
    output: DEFAULT_OUTPUT,
    oxford: DEFAULT_OXFORD
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--in") {
      options.input = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--out") {
      options.output = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--oxford") {
      options.oxford = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--min-confidence") {
      options.minConfidence = Number(argv[index + 1]) || options.minConfidence;
      index += 1;
      continue;
    }
  }

  return options;
}

function loadJs(filePath) {
  const resolved = path.resolve(filePath);
  delete require.cache[require.resolve(resolved)];
  return require(resolved);
}

function loadOxfordPosLookup(filePath) {
  if (!fs.existsSync(filePath)) return new Map();
  const bank = loadJs(filePath);
  const lookup = new Map();
  (bank.entries || []).forEach((entry) => {
    const word = VocabPosInference.normalizeWord(entry.word);
    if (!word) return;
    const current = lookup.get(word) || [];
    (Array.isArray(entry.pos) ? entry.pos : [entry.pos])
      .map(VocabPosInference.normalizePos)
      .filter(Boolean)
      .forEach((pos) => {
        if (!current.includes(pos)) current.push(pos);
      });
    lookup.set(word, current);
  });
  return lookup;
}

function createBankJs(bank) {
  const json = JSON.stringify(bank, null, 2);
  return `(function attachTeacherVocabBank(root, bank) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = bank;
  }
  root.TEACHER_VOCAB_BANK = bank;
})(typeof globalThis !== "undefined" ? globalThis : window, ${json});
`;
}

function enrichBank(bank, options = {}) {
  const wordPosLookup = options.wordPosLookup || new Map();
  let inferredCount = 0;
  let releasedFromReviewCount = 0;
  let visibleInferredCount = 0;
  const reasonCounts = {};
  const posCounts = {};

  const entries = (bank.entries || []).map((entry) => {
    const type = VocabPosInference.normalizeType(entry.type, entry.word);
    const inferred = VocabPosInference.inferEntryPos(entry, {
      wordPosLookup,
      minConfidence: options.minConfidence
    });
    const shouldApply = !entry.pos && inferred.pos && inferred.confidence >= options.minConfidence;
    const nextEntry = {
      ...entry
    };

    if (shouldApply) {
      nextEntry.inferredPos = inferred.pos;
      nextEntry.posConfidence = inferred.confidence;
      nextEntry.posReason = inferred.reason;
      inferredCount += 1;
      reasonCounts[inferred.reason] = (reasonCounts[inferred.reason] || 0) + 1;
      posCounts[inferred.pos] = (posCounts[inferred.pos] || 0) + 1;
      if (nextEntry.needsReview && inferred.confidence >= 84) {
        nextEntry.needsReview = false;
        releasedFromReviewCount += 1;
      }
      if (!nextEntry.needsReview) {
        visibleInferredCount += 1;
      }
    } else {
      delete nextEntry.inferredPos;
      delete nextEntry.posConfidence;
      delete nextEntry.posReason;
      if (!nextEntry.pos && type === "word") {
        nextEntry.needsReview = true;
      }
    }

    return nextEntry;
  });

  return {
    bank: {
      ...bank,
      meta: {
        ...(bank.meta || {}),
        posInference: {
          generatedAt: new Date().toISOString(),
          minConfidence: options.minConfidence,
          inferredCount,
          releasedFromReviewCount,
          visibleInferredCount,
          posCounts,
          reasonCounts
        }
      },
      entries
    },
    stats: {
      entryCount: entries.length,
      inferredCount,
      releasedFromReviewCount,
      visibleInferredCount,
      posCounts,
      reasonCounts
    }
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const bank = loadJs(options.input);
  const wordPosLookup = loadOxfordPosLookup(options.oxford);
  const result = enrichBank(bank, {
    minConfidence: options.minConfidence,
    wordPosLookup
  });

  console.log(JSON.stringify(result.stats, null, 2));
  if (options.dryRun) return;

  fs.writeFileSync(options.output, createBankJs(result.bank));
  console.log(`Wrote ${options.output}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  enrichBank,
  loadOxfordPosLookup,
  parseArgs
};
