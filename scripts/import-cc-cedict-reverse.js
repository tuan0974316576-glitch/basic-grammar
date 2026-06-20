#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const DEFAULT_OUTPUT_DIR = path.resolve(__dirname, "..", "assets", "cc-cedict-reverse");
const VocabPosInference = require("../vocab_pos_inference.js");
const LICENSE_TEXT = `CC-CEDICT

Community maintained free Chinese-English dictionary.

Publisher: MDBG
Source: https://www.mdbg.net/chinese/dictionary?page=cc-cedict
License: Creative Commons Attribution-ShareAlike 4.0 International License
https://creativecommons.org/licenses/by-sa/4.0/

This app generates an English-to-Traditional-Chinese reverse index from CC-CEDICT
for offline student lookup. The generated index keeps only short, clean English
headwords and phrases from the original definitions.
`;

function usage() {
  console.log([
    "Usage:",
    "  node scripts/import-cc-cedict-reverse.js <cedict_ts.u8|cedict.txt.gz> [--out assets/cc-cedict-reverse]",
    "",
    "Creates browser-loadable shards for reverse English -> Traditional Chinese lookup."
  ].join("\n"));
}

function parseArgs(argv) {
  let input = "";
  let outDir = DEFAULT_OUTPUT_DIR;
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
    input = path.resolve(arg);
  }
  if (!input) {
    usage();
    process.exit(1);
  }
  return { input, outDir };
}

function readText(filePath) {
  const buffer = fs.readFileSync(filePath);
  const output = filePath.endsWith(".gz") ? zlib.gunzipSync(buffer) : buffer;
  return output.toString("utf8").replace(/^\uFEFF/, "");
}

function normalizeWord(value) {
  return String(value || "")
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function normalizeMeaning(value) {
  return String(value || "")
    .trim()
    .replace(/\s*[/／;；]\s*/g, " / ")
    .replace(/\s+/g, " ");
}

function stripParentheticalPrefix(value = "") {
  return String(value)
    .replace(/^\([^)]*\)\s*/g, "")
    .replace(/^\[[^\]]*\]\s*/g, "")
    .trim();
}

function cleanEnglishDefinition(value = "") {
  let text = stripParentheticalPrefix(value)
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/^to be\s+/i, "be ")
    .replace(/^to\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

  text = text
    .replace(/^(a|an|the)\s+/i, "")
    .replace(/\s+(etc|etc\.)$/i, "")
    .trim();

  return normalizeWord(text);
}

function extractTraditional(line = "") {
  const match = String(line).match(/^(\S+)\s+\S+\s+\[[^\]]+\]\s+\//);
  return match ? match[1] : "";
}

function extractDefinitions(line = "") {
  const firstSlash = line.indexOf("/");
  const lastSlash = line.lastIndexOf("/");
  if (firstSlash < 0 || lastSlash <= firstSlash) return [];
  return line
    .slice(firstSlash + 1, lastSlash)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitDefinitionCandidates(definition = "") {
  const withoutExamples = String(definition)
    .replace(/"[^"]*"/g, " ")
    .replace(/\be\.g\..*$/i, "")
    .trim();
  return withoutExamples
    .split(/;|,| or | and |\u3001/)
    .map(cleanEnglishDefinition)
    .filter(Boolean);
}

function looksLikeEnglishLookupKey(value = "") {
  const word = normalizeWord(value);
  if (!/^[a-z][a-z0-9' -]{1,48}$/.test(word)) return false;
  if (word.split(" ").length > 5) return false;
  if (word.length < 2 || word.length > 48) return false;
  if (/\b(of|for|with|from|into|onto|that|which|who|when|where|because)\b.*\b(of|for|with|from|into|onto|that|which|who|when|where|because)\b/.test(word)) return false;
  if (/^(abbr|archaic|classifier|cl|dialect|erhua|fig|figuratively|honorific|idiom|interjection|japanese|korean|loanword|onomatopoeia|slang|surname|taiwan pr|variant|see also|same as|old variant|old form|also written|lit|literary|used in|used to|refers to|one of|name of|type of|kind of)\b/i.test(word)) return false;
  if (/\b(one's|sb|sth|somebody|something|someone)\b/.test(word)) return false;
  return true;
}

function shardName(word) {
  const first = normalizeWord(word)[0] || "#";
  return /^[a-z]$/.test(first) ? first : "other";
}

function slugWord(word) {
  return normalizeWord(word).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "entry";
}

function inferType(word) {
  return normalizeWord(word).includes(" ") ? "phrase" : "word";
}

function parseLine(line, index) {
  if (!line || line.startsWith("#")) return [];
  const traditional = normalizeMeaning(extractTraditional(line));
  if (!traditional || !/[\u3400-\u9fff]/.test(traditional)) return [];
  const definitions = extractDefinitions(line);
  const entries = [];
  definitions.forEach((definition) => {
    splitDefinitionCandidates(definition).forEach((word) => {
      if (!looksLikeEnglishLookupKey(word)) return;
      entries.push({
        id: `ccr-${slugWord(word)}-${index}`,
        word,
        display: word,
        meaning: traditional,
        pos: VocabPosInference.inferEntryPos({
          word,
          meaning: traditional,
          type: inferType(word)
        }, { minConfidence: 84 }).pos,
        type: inferType(word),
        rank: index + 1
      });
    });
  });
  return entries;
}

function mergeEntries(entries = []) {
  const groups = new Map();
  entries.forEach((entry) => {
    const key = entry.word;
    if (!groups.has(key)) {
      groups.set(key, {
        ...entry,
        meanings: new Map([[entry.meaning, entry.rank]]),
        sourceCount: 1
      });
      return;
    }
    const group = groups.get(key);
    group.sourceCount += 1;
    if (!group.pos && entry.pos) group.pos = entry.pos;
    const previousRank = group.meanings.get(entry.meaning);
    if (!previousRank || entry.rank < previousRank) group.meanings.set(entry.meaning, entry.rank);
    group.rank = Math.min(group.rank, entry.rank);
  });

  return Array.from(groups.values()).map((group) => {
    const meanings = Array.from(group.meanings.entries())
      .sort((left, right) => left[1] - right[1] || left[0].localeCompare(right[0]))
      .slice(0, 4)
      .map(([meaning]) => meaning);
    return {
      id: `ccr-${slugWord(group.word)}`,
      word: group.word,
      display: group.display,
      meaning: meanings.join(" / "),
      pos: group.pos || "",
      type: group.type,
      rank: group.rank,
      sourceCount: group.sourceCount
    };
  }).sort((left, right) => left.word.localeCompare(right.word));
}

function writeShard(outDir, shard, entries) {
  const filePath = path.join(outDir, `${shard}.js`);
  const payload = { shard, entries };
  fs.writeFileSync(filePath, [
    "window.CC_CEDICT_REVERSE_SHARDS = window.CC_CEDICT_REVERSE_SHARDS || {};",
    `window.CC_CEDICT_REVERSE_SHARDS[${JSON.stringify(shard)}] = ${JSON.stringify(payload)};`,
    ""
  ].join("\n"));
}

function writeManifest(outDir, meta) {
  fs.writeFileSync(
    path.join(outDir, "manifest.js"),
    `window.CC_CEDICT_REVERSE_MANIFEST = ${JSON.stringify(meta, null, 2)};\n`
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(args.input)) throw new Error(`CC-CEDICT file not found: ${args.input}`);

  const lines = readText(args.input).split(/\r?\n/);
  const rawEntries = [];
  lines.forEach((line, index) => {
    rawEntries.push(...parseLine(line, index));
  });
  const entries = mergeEntries(rawEntries);

  const byShard = new Map();
  entries.forEach((entry) => {
    const shard = shardName(entry.word);
    if (!byShard.has(shard)) byShard.set(shard, []);
    byShard.get(shard).push(entry);
  });

  fs.rmSync(args.outDir, { recursive: true, force: true });
  fs.mkdirSync(args.outDir, { recursive: true });
  Array.from(byShard.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([shard, shardEntries]) => writeShard(args.outDir, shard, shardEntries));

  const manifest = {
    source: "CC-CEDICT reverse index",
    language: "zh-Hant",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://www.mdbg.net/chinese/dictionary?page=cc-cedict",
    generatedAt: new Date().toISOString(),
    entryCount: entries.length,
    rawEntryCount: rawEntries.length,
    shards: Object.fromEntries(Array.from(byShard.entries()).map(([shard, shardEntries]) => [
      shard,
      { file: `${shard}.js`, entryCount: shardEntries.length }
    ]))
  };
  writeManifest(args.outDir, manifest);
  fs.writeFileSync(path.join(args.outDir, "LICENSE-CC-CEDICT.txt"), LICENSE_TEXT);
  console.log(`Wrote ${entries.length} CC-CEDICT reverse entries (${rawEntries.length} raw) to ${args.outDir}`);
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
  cleanEnglishDefinition,
  extractDefinitions,
  extractTraditional,
  inferType,
  looksLikeEnglishLookupKey,
  mergeEntries,
  parseLine,
  shardName,
  splitDefinitionCandidates
};
