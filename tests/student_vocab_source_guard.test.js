const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const appJs = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const syncTeacherLive = fs.readFileSync(path.join(rootDir, "scripts", "sync-teacher-live-vocab.js"), "utf8");
const buildWeb = require("../scripts/build-web.js");

const forbiddenStudentScripts = [
  "fallback_dictionary.js",
  "cc_cedict_reverse.js"
];

forbiddenStudentScripts.forEach((script) => {
  assert.ok(
    !indexHtml.includes(script),
    `Student app must not load raw review dictionary script: ${script}`
  );
});

[
  path.join(rootDir, "assets", "offline-dictionary"),
  path.join(rootDir, "assets", "cc-cedict-reverse")
].forEach((assetPath) => {
  assert.strictEqual(
    buildWeb.isPrivateReviewAsset(assetPath),
    true,
    `build-web must keep private review assets out of the student bundle: ${assetPath}`
  );
});

assert.strictEqual(
  buildWeb.isPrivateReviewAsset(path.join(rootDir, "assets", "grammar-verbs")),
  false,
  "build-web should still copy normal student assets."
);

[
  "getLiveTeacherMatches",
  "getCuratedMatches",
  "getTeacherMatches",
  "getCcCedictSupplementMatches"
].forEach((providerName) => {
  assert.ok(
    appJs.includes(providerName),
    `Student vocab lookup is missing approved provider: ${providerName}`
  );
});

[
  "lookupVocabMeaning",
  "getCcCedictReverseMatches",
  "FallbackDictionary",
  "OfflineDictionary",
  "lookupVocabMeaningsWithAzure",
  "translateVocabMeaningWithAzure",
  "vocabMeaningCache",
  "azure-translate-fallback"
].forEach((forbiddenToken) => {
  assert.ok(
    !appJs.includes(forbiddenToken),
    `Student vocab lookup must not call unreviewed meaning fallback: ${forbiddenToken}`
  );
});

assert.ok(
  appJs.includes("lookupVocabExamples"),
  "Example generation may use the reviewed cloud example flow."
);

assert.ok(
  appJs.includes("buildStudentReadyPayload"),
  "Teacher live vocab saves in the app must use the canonical student-ready payload gate."
);

assert.ok(
  syncTeacherLive.includes("buildStudentReadyPayload"),
  "Batch teacher-live sync must use the canonical student-ready payload gate."
);

assert.ok(
  /function\s+normalizeTeacherEntry[\s\S]*?buildStudentReadyPayload[\s\S]*?function\s+normalizeDisabledTeacherEntry/.test(syncTeacherLive),
  "sync normalizeTeacherEntry must not bypass TeacherLiveVocab.buildStudentReadyPayload."
);

console.log("student_vocab_source_guard tests passed");
