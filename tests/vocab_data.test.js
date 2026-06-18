const assert = require("assert");
const scheduler = require("../vocab_scheduler.js");
const vocabData = require("../vocab_data.js");

const now = Date.UTC(2026, 5, 16, 10, 0, 0);
const yesterday = now - scheduler.DAY_MS;
const twoDaysAgo = now - (2 * scheduler.DAY_MS);

assert.strictEqual(vocabData.normalizeWord("  Apple   Pie  "), "apple pie");
assert.strictEqual(vocabData.normalizeMeaning("  紅色   蘋果  "), "紅色 蘋果");
assert.strictEqual(vocabData.createId("School bag!"), "school-bag");
assert.notStrictEqual(
  vocabData.createMeaningId("secure", "安全的", "adjective"),
  vocabData.createMeaningId("secure", "確保", "verb")
);

const multiMeaningItem = vocabData.normalizeItem({
  id: "have",
  word: "have",
  meanings: [
    { meaning: "有", pos: "verb", source: "azure-dictionary" },
    { meaning: "擁有", pos: "verb", source: "azure-dictionary" }
  ],
  createdAt: now,
  updatedAt: now
}, { id: "have", now });

assert.strictEqual(multiMeaningItem.meaning, "有 / 擁有");
assert.strictEqual(multiMeaningItem.meanings.length, 2);
assert.strictEqual(multiMeaningItem.meanings[0].pos, "verb");
const multiMeaningStored = vocabData.stripItemForStorage(multiMeaningItem);
assert.strictEqual(multiMeaningStored.meanings.length, 2);

const localProgress = scheduler.updateProgressAfterAnswer(
  scheduler.getInitialProgress(twoDaysAgo),
  true,
  { now: twoDaysAgo }
);
const remoteProgress = scheduler.updateProgressAfterAnswer(
  localProgress,
  true,
  { now: yesterday }
);

const mergedWithRemote = vocabData.mergeItems(
  [
    {
      id: "apple",
      word: "apple",
      meaning: "蘋果",
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo
    }
  ],
  {
    apple: localProgress
  },
  [
    {
      id: "apple",
      word: "apple",
      meaning: "紅蘋果",
      pos: "noun",
      type: "word",
      source: "teacher",
      teacherEntryId: "teacher-apple-noun",
      createdAt: twoDaysAgo,
      updatedAt: yesterday,
      progress: remoteProgress
    },
    {
      id: "school",
      word: "school",
      meaning: "學校",
      createdAt: yesterday,
      updatedAt: yesterday,
      progress: scheduler.getInitialProgress(yesterday)
    }
  ],
  {},
  { now }
);

assert.deepStrictEqual(mergedWithRemote.items.map((item) => item.id), ["apple", "school"]);
assert.strictEqual(mergedWithRemote.items[0].meaning, "紅蘋果");
assert.strictEqual(mergedWithRemote.items[0].pos, "noun");
assert.strictEqual(mergedWithRemote.items[0].teacherEntryId, "teacher-apple-noun");
assert.strictEqual(mergedWithRemote.progressById.apple.totalCorrect, 2);

const queuedLocalWins = vocabData.mergeItems(
  [
    {
      id: "book",
      word: "book",
      meaning: "書",
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo
    }
  ],
  {},
  [
    {
      id: "book",
      word: "book",
      meaning: "簿",
      createdAt: twoDaysAgo,
      updatedAt: yesterday,
      progress: scheduler.getInitialProgress(yesterday)
    }
  ],
  {
    book: {
      id: "book",
      word: "book",
      meaning: "書本",
      createdAt: twoDaysAgo,
      updatedAt: now,
      progress: scheduler.getInitialProgress(now)
    }
  },
  { now }
);

assert.strictEqual(queuedLocalWins.items[0].meaning, "書本");

const deletedDoesNotReturn = vocabData.mergeItems(
  [
    {
      id: "cat",
      word: "cat",
      meaning: "貓",
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo
    }
  ],
  {},
  [
    {
      id: "cat",
      word: "cat",
      meaning: "貓",
      createdAt: twoDaysAgo,
      updatedAt: yesterday,
      progress: scheduler.getInitialProgress(yesterday)
    },
    {
      id: "dog",
      deletedAt: now,
      updatedAt: now
    }
  ],
  {
    cat: {
      id: "cat",
      deletedAt: now,
      updatedAt: now
    }
  },
  { now }
);

assert.strictEqual(deletedDoesNotReturn.items.some((item) => item.id === "cat"), false);
assert.strictEqual(deletedDoesNotReturn.items.some((item) => item.id === "dog"), false);

const cloudDoc = vocabData.makeCloudDoc(
  {
    id: "run",
    word: "run",
    meaning: "跑",
    pos: "verb",
    type: "word",
    source: "teacher",
    teacherEntryId: "teacher-run-verb",
    createdAt: twoDaysAgo,
    updatedAt: yesterday
  },
  scheduler.updateProgressAfterAnswer(scheduler.getInitialProgress(yesterday), false, { now: yesterday }),
  { now }
);

assert.strictEqual(cloudDoc.word, "run");
assert.strictEqual(cloudDoc.pos, "verb");
assert.strictEqual(cloudDoc.teacherEntryId, "teacher-run-verb");
assert.strictEqual(cloudDoc.progress.totalIncorrect, 1);
assert.strictEqual(cloudDoc.deletedAt, 0);

const multiMeaningCloudDoc = vocabData.makeCloudDoc(multiMeaningStored, scheduler.getInitialProgress(now), { now });
assert.strictEqual(multiMeaningCloudDoc.meaning, "有 / 擁有");
assert.strictEqual(multiMeaningCloudDoc.meanings.length, 2);

console.log("vocab_data tests passed");
