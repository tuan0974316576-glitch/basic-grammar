#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnFileSync } = require("./python-runner");

const ROOT_DIR = path.resolve(__dirname, "..");
const PRIVATE_EXPORTS_DIR = path.join(ROOT_DIR, "private_exports");
const DEFAULT_OUTPUT = path.join(PRIVATE_EXPORTS_DIR, "oxford_cefr_vocab.js");
const DEFAULT_PYTHON = "/Users/macbook/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";

function usage() {
  console.log([
    "Usage:",
    "  node scripts/import-oxford-cefr.js <Oxford 3000 PDF> <Oxford 5000 PDF> [--out private_exports/oxford_cefr_vocab.js]",
    "",
    "The default output is ignored by Git and is used only as a local CEFR reference for example generation.",
    "",
    "Example:",
    "  node scripts/import-oxford-cefr.js The_Oxford_3000_by_CEFR_level.pdf The_Oxford_5000_by_CEFR_level.pdf"
  ].join("\n"));
}

function parseArgs(argv) {
  const files = [];
  let out = DEFAULT_OUTPUT;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--out") {
      out = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    files.push(path.resolve(arg));
  }

  if (!files.length) {
    usage();
    process.exit(1);
  }

  files.forEach((file) => {
    if (!fs.existsSync(file)) {
      throw new Error(`PDF not found: ${file}`);
    }
  });

  return { files, out };
}

function writeBank(out, data) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const source = [
    "(function attachOxfordCefrVocab(root, data) {",
    "  if (typeof module !== \"undefined\" && module.exports) {",
    "    module.exports = data;",
    "  }",
    "  root.OXFORD_CEFR_VOCAB = data;",
    `})(typeof globalThis !== \"undefined\" ? globalThis : window, ${JSON.stringify(data, null, 2)});`,
    ""
  ].join("\n");
  fs.writeFileSync(out, source);
}

function main() {
  const { files, out } = parseArgs(process.argv.slice(2));
  const python = process.env.PYTHON || (fs.existsSync(DEFAULT_PYTHON) ? DEFAULT_PYTHON : "python3");
  const script = path.join(__dirname, "import_oxford_cefr.py");
  const result = spawnFileSync(python, [script, ...files], {
    cwd: ROOT_DIR,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || "");
    process.exit(result.status || 1);
  }

  const data = JSON.parse(result.stdout);
  writeBank(out, data);
  console.log(`Imported ${data.meta.entryCount} Oxford CEFR entries (${data.meta.uniqueWordCount} unique words) to ${out}`);
  console.log(JSON.stringify(data.meta.levelCounts, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  DEFAULT_OUTPUT,
  parseArgs,
  writeBank
};
