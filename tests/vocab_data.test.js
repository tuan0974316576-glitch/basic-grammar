const assert = require("assert");
const scheduler = require("../vocab_scheduler.js");
const vocabData = require("../vocab_data.js");

const now = Date.UTC(2026, 5, 16, 10, 0, 0);
const yesterday = now - scheduler.DAY_MS;
const twoDaysAgo = now - (2 * scheduler.DAY_MS);

assert.strictEqual(vocabData.normalizeWord("  Apple   Pie  "), "apple pie");
assert.strictEqual(vocabData.normalizeMeaning("  紅色   蘋果  "), "紅色 蘋果");
assert.strictEqual(vocabData.createId("School bag!"), "school-bag");

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
    createdAt: twoDaysAgo,
    updatedAt: yesterday
  },
  scheduler.updateProgressAfterAnswer(scheduler.getInitialProgress(yesterday), false, { now: yesterday }),
  { now }
);

assert.strictEqual(cloudDoc.word, "run");
assert.strictEqual(cloudDoc.progress.totalIncorrect, 1);
assert.strictEqual(cloudDoc.deletedAt, 0);

console.log("vocab_data tests passed");
