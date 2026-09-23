const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  buildAiPrompt,
  buildOcrChunks,
  groupDetectedEntries,
  normalizeRequestedFiles,
  validateJobId
} = require("../functions/vocab-import");

const root = path.resolve(__dirname, "..");

const grouped = groupDetectedEntries([
  { word: "Asset", pos: "n.", type: "word", chineseMeaning: "資產", confidence: 0.96 },
  { word: "asset", pos: "noun", type: "word", chineseMeaning: "資產", confidence: 0.94 },
  { word: "look after", pos: "phrase", type: "phrase", chineseMeaning: "照顧", confidence: 0.91 },
  { word: "marine", pos: "adj.", type: "word", chineseMeaning: "", confidence: 0.9 }
]);
assert.equal(grouped.length, 3);
assert.equal(grouped[0].word, "asset");
assert.equal(grouped[0].meanings.length, 1);
assert.equal(grouped[2].word, "marine");
assert.deepEqual(grouped[2].meanings, []);

const prompt = buildAiPrompt("English | Chinese\nasset | 資產");
assert.match(prompt, /extract every English vocabulary row/i);
assert.match(prompt, /extract only English words or phrases visibly covered by coloured highlighter ink/i);
assert.match(prompt, /do not invent or translate/i);

const chunks = buildOcrChunks([
  { fileIndex: 0, pageNumber: 1, text: "asset\nn. 資產" },
  { fileIndex: 0, pageNumber: 2, text: "marine\nadj. 海洋的" }
]);
assert.equal(chunks.length, 1);
assert.match(chunks[0], /\[DOCUMENT 1 \/\/ PAGE 1\]/);
assert.match(chunks[0], /\[DOCUMENT 1 \/\/ PAGE 2\]/);

const jobId = validateJobId("import-mewm4z7f-123456789abc");
const files = normalizeRequestedFiles("student-1", jobId, [{
  storagePath: `vocab-imports/student-1/${jobId}/01-notes.pdf`,
  mimeType: "application/pdf",
  size: 1024,
  originalName: "notes.pdf"
}]);
assert.equal(files.length, 1);
assert.throws(() => normalizeRequestedFiles("student-1", jobId, [{
  storagePath: `vocab-imports/student-2/${jobId}/01-notes.pdf`,
  mimeType: "application/pdf",
  size: 1024
}]), /not owned by this account/i);

const storageRules = fs.readFileSync(path.join(root, "storage.rules"), "utf8");
assert.match(storageRules, /match \/vocab-imports\/\{uid\}\/\{jobId\}\/\{fileName\}/);
assert.match(storageRules, /request\.auth\.uid == uid/);
assert.match(storageRules, /request\.resource\.size <= 25 \* 1024 \* 1024/);

const firestoreRules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
assert.match(firestoreRules, /match \/vocabImportJobs\/\{jobId\}/);
assert.match(firestoreRules, /allow read, delete: if isOwner\(uid\)/);

console.log("vocab_import_function tests passed");
