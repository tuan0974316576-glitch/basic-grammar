#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "flutter_app", "assets", "data", "vocab");

const TeacherVocab = require(path.join(root, "teacher_vocab.js"));
const VocabSenseBank = require(path.join(root, "vocab_sense_bank.js"));
const CcCedictSupplement = require(path.join(root, "cc_cedict_supplement.js"));
const VocabLookup = require(path.join(root, "vocab_lookup.js"));
const VocabExampleSeed = require(path.join(root, "vocab_example_seed.js"));

const POS_LABELS = {
  noun: "n.",
  verb: "v.",
  adjective: "adj.",
  adverb: "adv.",
  preposition: "prep.",
  conjunction: "conj.",
  pronoun: "pron.",
  determiner: "det.",
  modal: "modal v.",
  auxiliary: "aux.",
  exclamation: "exclam.",
  number: "num.",
  phrase: "ph.",
  pattern: "pt."
};

function normalizeWord(value) {
  return TeacherVocab.normalizeWord(value);
}

function normalizeMeaning(value) {
  return TeacherVocab.normalizeMeaning(value);
}

function normalizeMeaningKey(value) {
  return normalizeMeaning(value).replace(/[\s/／]+/g, "").toLowerCase();
}

function getEntryPos(entry = {}) {
  if (entry.type === "pattern") return entry.pos === "verb" ? "verb" : "";
  return TeacherVocab.normalizePos(entry.pos || entry.inferredPos)
    || TeacherVocab.getStudentReadyPos(entry);
}

function shardFor(value) {
  const first = normalizeWord(value).charAt(0);
  if (/[a-z]/.test(first)) return first;
  if (/[0-9]/.test(first)) return "0";
  return "_";
}

function compactEntry(entry = {}) {
  const word = normalizeWord(entry.word || entry.display);
  const display = String(entry.display || entry.word || "").trim();
  const pos = getEntryPos(entry);
  const type = TeacherVocab.normalizeType(entry.type, word);
  return {
    id: String(entry.id || entry.sourceEntryId || [word, pos, type, entry.meaning].join("|")),
    word,
    display: display || word,
    meaning: normalizeMeaning(entry.meaning),
    pos,
    type,
    level: String(entry.level || "").trim().toUpperCase(),
    source: String(entry.source || "").trim(),
    sourceEntryId: String(entry.sourceEntryId || entry.id || "").trim()
  };
}

function addEntryKeys(target, entry, expand) {
  const direct = [entry.word, entry.display, ...(entry.aliases || [])]
    .map(normalizeWord)
    .filter(Boolean);
  direct.forEach((key) => {
    const keys = typeof expand === "function" ? expand(key) : [key];
    keys.forEach((expanded) => {
      const normalized = normalizeWord(expanded);
      if (normalized) target.add(normalized);
    });
  });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value)}\n`);
}

function readAudioManifest() {
  const source = fs.readFileSync(path.join(root, "vocab_word_audio_manifest.js"), "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: "vocab_word_audio_manifest.js" });
  const byWord = {};
  Object.entries(context.window.VOCAB_WORD_AUDIO_MANIFEST || {}).forEach(([key, assetPath]) => {
    const word = normalizeWord(String(key).split("|").pop());
    if (!word || byWord[word]) return;
    byWord[word] = String(assetPath).replace(/^audio\//, "audio/");
  });
  return byWord;
}

async function buildLookupShards() {
  const keys = new Set();
  TeacherVocab.entries.forEach((entry) => {
    const ready = TeacherVocab.normalizeStudentReadyEntry(entry);
    if (ready) addEntryKeys(keys, ready, TeacherVocab.generatePlaceholderLookupKeys);
  });
  VocabSenseBank.cleanEntries.forEach((entry) => {
    addEntryKeys(keys, entry, VocabSenseBank.generatePlaceholderLookupKeys);
  });
  CcCedictSupplement.entries.forEach((entry) => addEntryKeys(keys, entry));

  const shards = new Map();
  const headwords = new Map();
  const sortedKeys = Array.from(keys).sort((left, right) => left.localeCompare(right));

  for (const key of sortedKeys) {
    const matches = await VocabLookup.buildLookupMatches(key, {
      getCuratedMatches: (word) => VocabSenseBank.lookup(word, { limit: 20, includeHidden: true }),
      getTeacherMatches: (word) => TeacherVocab.lookupStudentReady(word, { exactOnly: true, limit: 20 }),
      getCcCedictSupplementMatches: (word) => CcCedictSupplement.lookup(word, { limit: 20 })
    }, {
      normalizeWord,
      normalizeMeaningGroupKey: normalizeMeaningKey,
      getEntryPos,
      teacherLimit: 12,
      curatedLimit: 12,
      ccCedictSupplementLimit: 12
    });
    const compact = matches.map(compactEntry).filter((entry) => entry.meaning && (entry.pos || entry.type === "pattern"));
    if (!compact.length) continue;
    const shard = shardFor(key);
    if (!shards.has(shard)) shards.set(shard, {});
    shards.get(shard)[key] = compact;
    compact.forEach((entry) => {
      if (!headwords.has(entry.word)) {
        headwords.set(entry.word, { word: entry.word, display: entry.display });
      }
    });
  }

  Array.from(shards.entries()).forEach(([shard, entries]) => {
    writeJson(path.join(outputDir, `lookup_${shard}.json`), entries);
  });
  writeJson(path.join(outputDir, "headwords.json"), Array.from(headwords.values())
    .sort((left, right) => left.word.localeCompare(right.word)));
  return { keyCount: sortedKeys.length, headwordCount: headwords.size };
}

function buildExampleShards() {
  const shards = new Map();
  Object.values(VocabExampleSeed.entries || {}).forEach((payload) => {
    const word = normalizeWord(payload?.word || payload?.display);
    const examples = Array.isArray(payload?.examples)
      ? payload.examples
        .map((example) => ({
          source: String(example?.source || "").trim(),
          target: String(example?.target || "").trim()
        }))
        .filter((example) => example.source && example.target)
        .slice(0, 3)
      : [];
    if (!word || !examples.length) return;
    const shard = shardFor(word);
    if (!shards.has(shard)) shards.set(shard, {});
    const entries = shards.get(shard);
    if (!entries[word]) entries[word] = [];
    const sense = {
      pos: TeacherVocab.normalizePos(payload.pos),
      type: TeacherVocab.normalizeType(payload.type, word),
      meaning: normalizeMeaning(payload.meaning),
      level: String(payload.level || "").trim().toUpperCase(),
      examples
    };
    const key = [sense.pos, sense.type, normalizeMeaningKey(sense.meaning)].join("|");
    if (!entries[word].some((entry) => (
      [entry.pos, entry.type, normalizeMeaningKey(entry.meaning)].join("|") === key
    ))) {
      entries[word].push(sense);
    }
  });
  let senseCount = 0;
  Array.from(shards.entries()).forEach(([shard, entries]) => {
    senseCount += Object.values(entries).reduce((sum, senses) => sum + senses.length, 0);
    writeJson(path.join(outputDir, `examples_${shard}.json`), entries);
  });
  return { senseCount };
}

async function main() {
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });
  const lookup = await buildLookupShards();
  const examples = buildExampleShards();
  const audioManifest = readAudioManifest();
  writeJson(path.join(outputDir, "audio_manifest.json"), audioManifest);
  writeJson(path.join(outputDir, "meta.json"), {
    generatedAt: new Date().toISOString(),
    lookupKeys: lookup.keyCount,
    headwords: lookup.headwordCount,
    exampleSenses: examples.senseCount,
    audioWords: Object.keys(audioManifest).length,
    posLabels: POS_LABELS
  });
  console.log(`Exported ${lookup.headwordCount} Flutter headwords, ${examples.senseCount} example senses and ${Object.keys(audioManifest).length} audio entries.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
