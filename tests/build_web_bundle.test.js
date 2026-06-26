const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const buildWeb = require("../scripts/build-web.js");

buildWeb.buildWeb();

const wwwDir = path.join(rootDir, "www");
const indexHtml = fs.readFileSync(path.join(wwwDir, "index.html"), "utf8");
const appJs = fs.readFileSync(path.join(wwwDir, "app.js"), "utf8");

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkFiles(fullPath);
    return [fullPath];
  });
}

const builtCodeFiles = walkFiles(wwwDir).filter((file) => /\.(?:html|js)$/i.test(file));
const builtCodeText = builtCodeFiles.map((file) => (
  `\n/* ${path.relative(wwwDir, file)} */\n${fs.readFileSync(file, "utf8")}`
)).join("\n");

assert.ok(!indexHtml.includes("fallback_dictionary.js"));
assert.ok(!indexHtml.includes("cc_cedict_reverse.js"));
assert.ok(!fs.existsSync(path.join(wwwDir, "fallback_dictionary.js")));
assert.ok(!fs.existsSync(path.join(wwwDir, "cc_cedict_reverse.js")));
assert.ok(!fs.existsSync(path.join(wwwDir, "assets", "offline-dictionary")));
assert.ok(!fs.existsSync(path.join(wwwDir, "assets", "cc-cedict-reverse")));
[
  "lookupVocabMeaning",
  "lookupVocabMeaningsWithAzure",
  "translateVocabMeaningWithAzure",
  "vocabMeaningCache",
  "azure-translate-fallback",
  "FallbackDictionary",
  "OfflineDictionary",
  "getCcCedictReverseMatches"
].forEach((forbiddenToken) => {
  assert.ok(!appJs.includes(forbiddenToken), `Built student app must not include meaning fallback token: ${forbiddenToken}`);
  assert.ok(!builtCodeText.includes(forbiddenToken), `Built code must not include meaning fallback token anywhere: ${forbiddenToken}`);
});
assert.ok(appJs.includes("lookupVocabExamples"));
assert.ok(builtCodeText.includes("lookupVocabExamples"));

console.log("build_web_bundle tests passed");
