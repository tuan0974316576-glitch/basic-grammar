"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_TARGET = "/Users/macbook/battleship-1";

const SHARED_VOCAB_FILES = [
  "vocab_scheduler.js",
  "vocab_pos_inference.js",
  "teacher_vocab_bank.js",
  "teacher_vocab.js",
  "teacher_live_vocab.js",
  "vocab_sense_bank.js",
  "cc_cedict_supplement.js",
  "vocab_lookup.js",
  "vocab_audio.js",
  "vocab_example_utils.js",
  "vocab_example_seed.js",
  "vocab_word_audio_manifest.js"
];

function usage() {
  console.log([
    "Usage: node scripts/sync-vocab-to-battleship.js [--target /path/to/battleship-1] [--dry-run]",
    "",
    "Copies reviewed Grammar Game vocab assets into Battleship-1 so both apps use the same student-facing vocab bank.",
    "Grammar Game remains the master source. This does not copy student progress or raw review dictionaries."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    target: DEFAULT_TARGET,
    dryRun: false
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--target") {
      options.target = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--target=")) {
      options.target = arg.slice("--target=".length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function hashFile(filePath) {
  if (!fs.existsSync(filePath)) return "";
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function copyIfChanged(source, target, dryRun) {
  const sourceHash = hashFile(source);
  const targetHash = hashFile(target);
  if (!sourceHash) {
    return { file: path.relative(ROOT_DIR, source), status: "missing-source" };
  }
  if (sourceHash === targetHash) {
    return { file: path.relative(ROOT_DIR, source), status: "unchanged", hash: sourceHash.slice(0, 12) };
  }
  if (!dryRun) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
  return {
    file: path.relative(ROOT_DIR, source),
    status: dryRun ? "would-copy" : "copied",
    from: sourceHash.slice(0, 12),
    to: targetHash ? targetHash.slice(0, 12) : "new"
  };
}

function main() {
  const options = parseArgs(process.argv);
  if (options.help) {
    usage();
    return;
  }

  const targetRoot = path.resolve(options.target);
  if (!fs.existsSync(targetRoot)) {
    throw new Error(`Battleship target does not exist: ${targetRoot}`);
  }
  if (!fs.existsSync(path.join(targetRoot, "index.html"))) {
    throw new Error(`Target does not look like Battleship-1: ${targetRoot}`);
  }

  const results = SHARED_VOCAB_FILES.map((file) => {
    return copyIfChanged(path.join(ROOT_DIR, file), path.join(targetRoot, file), options.dryRun);
  });

  const summary = results.reduce((acc, result) => {
    acc[result.status] = (acc[result.status] || 0) + 1;
    return acc;
  }, {});

  console.log(JSON.stringify({
    dryRun: options.dryRun,
    source: ROOT_DIR,
    target: targetRoot,
    summary,
    results
  }, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  }
}

module.exports = {
  SHARED_VOCAB_FILES,
  copyIfChanged,
  hashFile
};
