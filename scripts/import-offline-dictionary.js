#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const DEFAULT_OUTPUT_DIR = path.resolve(__dirname, "..", "assets", "offline-dictionary");
const DEFAULT_MAX_RANK = 20000;
const ALLOWED_POS = new Set([
  "noun",
  "verb",
  "adjective",
  "adverb",
  "preposition",
  "conjunction",
  "pronoun"
]);
const ECDICT_LICENSE = `MIT License

Copyright (c) 2025 Linwei

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

let convertToTraditional = (value) => value;
try {
  const OpenCC = require("opencc-js");
  convertToTraditional = OpenCC.Converter({ from: "cn", to: "hk" });
} catch (error) {
  console.warn("opencc-js is not installed; offline dictionary meanings will not be converted to Traditional Chinese.");
}

function usage() {
  console.log([
    "Usage:",
    "  node scripts/import-offline-dictionary.js <ecdict.csv> [--out assets/offline-dictionary] [--max-rank 20000]",
    "",
    "The raw ECDICT CSV is not committed. This script generates small local shards for offline lookup."
  ].join("\n"));
}

function parseArgs(argv) {
  let input = "";
  let outDir = DEFAULT_OUTPUT_DIR;
  let maxRank = DEFAULT_MAX_RANK;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--out") {
      outDir = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--max-rank") {
      maxRank = Number(argv[index + 1]) || DEFAULT_MAX_RANK;
      index += 1;
      continue;
    }
    input = path.resolve(arg);
  }

  if (!input) {
    usage();
    process.exit(1);
  }

  return { input, outDir, maxRank };
}

function parseCsvLine(line) {
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

function readCsvRows(filePath, onRow) {
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines.shift() || "");
  lines.forEach((line) => {
    const cells = parseCsvLine(line);
    if (cells.length < headers.length) return;
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] || "";
    });
    onRow(row);
  });
}

function normalizeWord(value) {
  return String(value || "")
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function parseRank(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 999999999;
}

function bestRank(row) {
  return Math.min(parseRank(row.bnc), parseRank(row.frq));
}

function detectPosFromTranslation(text = "") {
  const lower = String(text).toLowerCase();
  if (/^(a\.|adj\.|adjective)/.test(lower)) return "adjective";
  if (/^(v\.|vt\.|vi\.|verb)/.test(lower)) return "verb";
  if (/^(n\.|noun)/.test(lower)) return "noun";
  if (/^(adv\.)/.test(lower)) return "adverb";
  if (/^(prep\.)/.test(lower)) return "preposition";
  if (/^(conj\.)/.test(lower)) return "conjunction";
  if (/^(pron\.)/.test(lower)) return "pronoun";
  return "";
}

function cleanMeaningLine(line = "") {
  return convertToTraditional(String(line)
    .replace(/^(?:\[[^\]]+\]\s*)+/g, "")
    .replace(/^(vt\.|vi\.|v\.|n\.|a\.|adj\.|adv\.|prep\.|conj\.|pron\.|aux\.|art\.)\s*/i, "")
    .split(/[;,，；]/)[0]
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 24));
}

function extractMeaningParts(translation = "") {
  return String(translation)
    .replace(/\\n/g, "\n")
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => /[\u3400-\u9fff]/.test(line) && !/^\[[^\]]+\]$/.test(line))
    .map((line) => ({
      pos: detectPosFromTranslation(line),
      meaning: cleanMeaningLine(line)
    }))
    .filter((part) => part.meaning && /[\u3400-\u9fff]/.test(part.meaning));
}

function cleanMeaning(translation = "") {
  return extractMeaningParts(translation)[0]?.meaning || "";
}

function shardName(word) {
  const first = normalizeWord(word)[0] || "#";
  return /^[a-z]$/.test(first) ? first : "other";
}

function shouldKeepRow(row, maxRank) {
  const word = normalizeWord(row.word);
  if (!/^[a-z][a-z' -]{1,39}$/.test(word)) return false;
  if (!row.translation || !/[\u3400-\u9fff]/.test(row.translation)) return false;
  if (bestRank(row) > maxRank) return false;
  return true;
}

function slugWord(word) {
  return word.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "entry";
}

function createEntries(row) {
  const word = normalizeWord(row.word);
  const meanings = extractMeaningParts(row.translation)
    .filter((part) => ALLOWED_POS.has(part.pos));
  if (!meanings.length) return [];
  const rank = bestRank(row);
  const posCounts = {};
  const seen = new Set();
  return meanings.map((part) => {
    const key = `${part.pos}|${part.meaning}`;
    if (seen.has(key)) return null;
    seen.add(key);
    const posKey = part.pos || "entry";
    posCounts[posKey] = (posCounts[posKey] || 0) + 1;
    const countSuffix = posCounts[posKey] > 1 ? `-${posCounts[posKey]}` : "";
    return {
      id: `ecdict-${slugWord(word)}-${posKey}${countSuffix}`,
      word,
      pos: part.pos,
      meaning: part.meaning,
      type: word.includes(" ") ? "phrase" : "word",
      rank
    };
  }).filter(Boolean);
}

function createEntry(row) {
  return createEntries(row)[0] || null;
}

function writeShard(outDir, shard, entries) {
  const filePath = path.join(outDir, `${shard}.js`);
  const payload = {
    shard,
    entries: entries.sort((left, right) => left.word.localeCompare(right.word))
  };
  fs.writeFileSync(filePath, [
    "window.OFFLINE_DICTIONARY_SHARDS = window.OFFLINE_DICTIONARY_SHARDS || {};",
    `window.OFFLINE_DICTIONARY_SHARDS[${JSON.stringify(shard)}] = ${JSON.stringify(payload)};`,
    ""
  ].join("\n"));
}

function createManifest(maxRank, entryCount) {
  return {
    source: "ECDICT",
    language: "zh-HK",
    generatedAt: new Date().toISOString(),
    maxRank,
    entryCount,
    shards: {}
  };
}

function writeLicense(outDir) {
  fs.writeFileSync(path.join(outDir, "LICENSE-ECDICT.txt"), ECDICT_LICENSE);
}

function addEntry(map, entry) {
  const key = `${entry.word}|${entry.pos}|${entry.meaning}`;
  const previous = map.get(key);
  if (!previous || entry.rank < previous.rank) map.set(key, entry);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(args.input)) {
    throw new Error(`Dictionary CSV not found: ${args.input}`);
  }

  const byEntry = new Map();
  readCsvRows(args.input, (row) => {
    if (!shouldKeepRow(row, args.maxRank)) return;
    createEntries(row).forEach((entry) => addEntry(byEntry, entry));
  });

  const byShard = new Map();
  Array.from(byEntry.values()).forEach((entry) => {
    const shard = shardName(entry.word);
    if (!byShard.has(shard)) byShard.set(shard, []);
    byShard.get(shard).push(entry);
  });

  fs.rmSync(args.outDir, { recursive: true, force: true });
  fs.mkdirSync(args.outDir, { recursive: true });

  const manifest = createManifest(args.maxRank, byEntry.size);

  Array.from(byShard.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([shard, entries]) => {
      writeShard(args.outDir, shard, entries);
      manifest.shards[shard] = {
        file: `${shard}.js`,
        entryCount: entries.length
      };
    });

  writeLicense(args.outDir);
  fs.writeFileSync(
    path.join(args.outDir, "manifest.js"),
    `window.OFFLINE_DICTIONARY_MANIFEST = ${JSON.stringify(manifest, null, 2)};\n`
  );

  console.log(`Wrote ${byEntry.size} offline dictionary entries to ${args.outDir}`);
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
  cleanMeaning,
  createEntry,
  createEntries,
  detectPosFromTranslation,
  extractMeaningParts,
  parseCsvLine,
  shouldKeepRow,
  shardName
};
