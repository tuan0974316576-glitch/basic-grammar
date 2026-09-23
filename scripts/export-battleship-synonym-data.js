#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const sourcePath = process.env.BATTLESHIP_SYNONYM_DATA
  || "/Users/macbook/battleship-1/synonym_data.js";
const outputPath = path.join(
  root,
  "flutter_app",
  "assets",
  "data",
  "vocab",
  "synonym_groups.json"
);

function normalize(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function compactWord(word) {
  const text = normalize(word?.text || word?.lookup);
  const lookup = normalize(word?.lookup || word?.text).toLowerCase();
  const meaning = normalize(word?.meaning);
  if (!text || !lookup || !meaning) return null;
  return { text, lookup, meaning };
}

function compactGroup(group) {
  const words = Array.isArray(group?.words)
    ? group.words.map(compactWord).filter(Boolean)
    : [];
  const id = normalize(group?.id);
  const meaning = normalize(group?.meaning);
  if (!id || !meaning || words.length < 2) return null;
  return {
    id,
    sourceId: normalize(group?.sourceId),
    meaning,
    words,
  };
}

function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Battleship synonym source not found: ${sourcePath}`);
  }
  const source = require(sourcePath);
  const groups = Array.isArray(source?.groups)
    ? source.groups.map(compactGroup).filter(Boolean)
    : [];
  if (!groups.length) throw new Error("Battleship synonym source is empty.");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify({
    schemaVersion: 1,
    meta: source.meta || {},
    groups,
  })}\n`);
  const wordCount = groups.reduce((total, group) => total + group.words.length, 0);
  console.log(
    `Exported ${groups.length} Battleship synonym groups / ${wordCount} words -> ${outputPath}`
  );
}

main();
