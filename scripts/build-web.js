const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "www");

const files = [
  ".htaccess",
  "app.js",
  "firebase_config.js",
  "firebase-init.js",
  "grammar_core.js",
  "grammar_data.js",
  "grammar_verb_table_audio_manifest.js",
  "grammar_verb_table_data.js",
  "grammar_verb_table_image_manifest.js",
  "index.html",
  "style.css",
  "teacher_vocab_bank.js",
  "vocab_pos_inference.js",
  "teacher_vocab.js",
  "teacher_live_vocab.js",
  "vocab_lookup.js",
  "vocab_sense_bank.js",
  "cc_cedict_supplement.js",
  "vocab_audio.js",
  "vocab_example_utils.js",
  "vocab_example_seed.js",
  "vocab_word_audio_manifest.js",
  "vocab_data.js",
  "vocab_scheduler.js"
];

const directories = [
  "assets",
  "audio"
];

const PRIVATE_REVIEW_ASSET_DIRS = new Set([
  path.join(rootDir, "assets", "offline-dictionary"),
  path.join(rootDir, "assets", "cc-cedict-reverse")
]);

function isPrivateReviewAsset(itemPath) {
  return Array.from(PRIVATE_REVIEW_ASSET_DIRS).some((privateDir) => (
    itemPath === privateDir || itemPath.startsWith(`${privateDir}${path.sep}`)
  ));
}

function copyFile(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDirectory(source, target) {
  fs.cpSync(source, target, {
    recursive: true,
    force: true,
    filter: (itemPath) => (
      !path.basename(itemPath).startsWith(".")
      && !isPrivateReviewAsset(itemPath)
    )
  });
}

function buildWeb() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  files.forEach((file) => {
    copyFile(path.join(rootDir, file), path.join(outDir, file));
  });

  directories.forEach((directory) => {
    copyDirectory(path.join(rootDir, directory), path.join(outDir, directory));
  });

  console.log(`Built web assets in ${outDir}`);
}

if (require.main === module) {
  buildWeb();
}

module.exports = {
  buildWeb,
  isPrivateReviewAsset
};
