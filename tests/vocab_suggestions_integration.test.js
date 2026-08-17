const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const htmlSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const buildSource = fs.readFileSync(path.join(root, "scripts", "build-web.js"), "utf8");

assert.match(
  htmlSource,
  /<script src="vocab_suggestions\.js\?v=[^"]+"><\/script>/,
  "index.html must load the reviewed-word suggestion engine before app.js"
);
assert.ok(
  htmlSource.indexOf("vocab_suggestions.js") < htmlSource.indexOf("app.js"),
  "vocab_suggestions.js must load before app.js"
);
assert.match(buildSource, /"vocab_suggestions\.js"/, "the web build must copy the suggestion engine");
assert.match(
  appSource,
  /const suggestions = matches\.length \? \[\] : getVocabWordSuggestions\(word, matches\);/,
  "suggestions must only be requested when exact lookup has no matches"
);
assert.match(
  appSource,
  /function selectVocabWordSuggestion[\s\S]*setTextEntryValue\(el\.vocabWordInput, word\);[\s\S]*refreshVocabTeacherLookup\(\{ force: true \}\)/,
  "choosing a suggestion must replace the input and run the normal exact lookup"
);
assert.doesNotMatch(
  appSource.match(/function selectVocabWordSuggestion[\s\S]*?\n\}/)?.[0] || "",
  /addVocabItemFromEntry/,
  "choosing a suggestion must not add it directly to the student's bank"
);

console.log("vocab suggestions integration tests passed");
