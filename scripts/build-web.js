const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "www");

const files = [
  ".htaccess",
  "app.js",
  "fallback_dictionary.js",
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

function copyFile(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDirectory(source, target) {
  fs.cpSync(source, target, {
    recursive: true,
    force: true,
    filter: (itemPath) => !path.basename(itemPath).startsWith(".")
  });
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

files.forEach((file) => {
  copyFile(path.join(rootDir, file), path.join(outDir, file));
});

directories.forEach((directory) => {
  copyDirectory(path.join(rootDir, directory), path.join(outDir, directory));
});

console.log(`Built web assets in ${outDir}`);
