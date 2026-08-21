#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.resolve(process.argv[2] || "");
const manifestPath = path.join(rootDir, "grammar_verb_table_image_manifest.js");
const referencePath = path.join(
  rootDir,
  "flutter_app",
  "assets",
  "data",
  "verb_table_reference.json"
);
const assetRelativeDir = path.join("assets", "grammar-verbs", "teacher", "v1");
const webAssetDir = path.join(rootDir, assetRelativeDir);
const flutterAssetDir = path.join(rootDir, "flutter_app", assetRelativeDir);

function fail(message) {
  console.error(message);
  process.exit(1);
}

function loadManifest() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(manifestPath, "utf8"), context, {
    filename: manifestPath
  });
  return context.window.GRAMMAR_VERB_IMAGE_MANIFEST || {};
}

function rowKey(row) {
  return ["present", "past", "pp", "ing"]
    .map((field) => row.forms[field])
    .join("|");
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sourceStem(filename) {
  return path.basename(filename, path.extname(filename)).toLowerCase();
}

function selectRow(filename, rowsByPresent) {
  const stem = sourceStem(filename);
  if (stem === "lie") {
    return rowsByPresent.get("lie")?.find((row) => row.forms.past === "lied");
  }
  if (stem === "lie(2)") {
    return rowsByPresent.get("lie")?.find((row) => row.forms.past === "lay");
  }

  const present = stem.replace(/\(\d+\)$/, "");
  const matches = rowsByPresent.get(present) || [];
  if (matches.length !== 1) {
    fail(`Expected one Verb Table row for ${filename}; found ${matches.length}.`);
  }
  return matches[0];
}

function removeUnreferencedOldAsset(oldSrc, manifest) {
  if (!oldSrc || !oldSrc.startsWith("assets/grammar-verbs/")) return;
  const stillUsed = Object.values(manifest).some((entry) => entry.src === oldSrc);
  if (stillUsed) return;

  [rootDir, path.join(rootDir, "flutter_app")].forEach((baseDir) => {
    const target = path.join(baseDir, oldSrc);
    if (fs.existsSync(target)) fs.rmSync(target);
  });
}

if (!process.argv[2]) {
  fail("Usage: node scripts/import-verb-table-images.js /path/to/verb_table_image");
}
if (!fs.statSync(sourceDir, { throwIfNoEntry: false })?.isDirectory()) {
  fail(`Image directory not found: ${sourceDir}`);
}

const sourceFiles = fs
  .readdirSync(sourceDir)
  .filter((filename) => /\.(png|jpe?g)$/i.test(filename))
  .sort((left, right) => left.localeCompare(right, "en"));
if (!sourceFiles.length) fail(`No PNG or JPEG files found in ${sourceDir}.`);

const referenceRows = JSON.parse(fs.readFileSync(referencePath, "utf8"));
const rowsByPresent = new Map();
referenceRows.forEach((row) => {
  const present = row.forms.present.toLowerCase();
  if (!rowsByPresent.has(present)) rowsByPresent.set(present, []);
  rowsByPresent.get(present).push(row);
});

const manifest = loadManifest();
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "verb-table-images-"));
const oldSources = [];
const importedKeys = new Set();

try {
  fs.mkdirSync(webAssetDir, { recursive: true });
  fs.mkdirSync(flutterAssetDir, { recursive: true });

  sourceFiles.forEach((filename) => {
    const row = selectRow(filename, rowsByPresent);
    if (!row) fail(`Could not resolve Verb Table row for ${filename}.`);

    const key = rowKey(row);
    if (importedKeys.has(key)) fail(`More than one source image maps to ${key}.`);
    if (!manifest[key]) fail(`Image manifest row not found for ${key}.`);
    importedKeys.add(key);

    const sourcePath = path.join(sourceDir, filename);
    const sourceHash = crypto
      .createHash("sha256")
      .update(fs.readFileSync(sourcePath))
      .digest("hex")
      .slice(0, 10);
    const outputName = `${slug(key)}-${sourceHash}.jpg`;
    const tempOutput = path.join(tempDir, outputName);
    const relativeSrc = path.posix.join(
      "assets",
      "grammar-verbs",
      "teacher",
      "v1",
      outputName
    );

    execFileSync(
      "sips",
      [
        "-Z",
        "600",
        "-s",
        "format",
        "jpeg",
        "-s",
        "formatOptions",
        "85",
        sourcePath,
        "--out",
        tempOutput
      ],
      { stdio: "ignore" }
    );
    fs.copyFileSync(tempOutput, path.join(webAssetDir, outputName));
    fs.copyFileSync(tempOutput, path.join(flutterAssetDir, outputName));

    oldSources.push(manifest[key].src);
    manifest[key] = {
      src: relativeSrc,
      sourceType: "teacher-provided",
      sourceFile: filename
    };
  });

  fs.writeFileSync(
    manifestPath,
    `window.GRAMMAR_VERB_IMAGE_MANIFEST = ${JSON.stringify(manifest, null, 2)};\n`
  );
  oldSources.forEach((oldSrc) => removeUnreferencedOldAsset(oldSrc, manifest));
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

console.log(`Imported ${importedKeys.size} Verb Table images from ${sourceDir}.`);
console.log("lie.png -> lie / lied / lied / lying (說謊)");
console.log("lie(2).png -> lie / lay / lain / lying (躺)");
