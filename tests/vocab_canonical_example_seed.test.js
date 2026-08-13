const assert = require("assert");

const utils = require("../vocab_example_utils.js");
const bank = require("../vocab_sense_bank.js");
const canonicalExamples = require("../vocab_canonical_example_seed.js");

const seed = {
  entries: {
    "have been + ving|legacy": {
      word: "have been + ving",
      examples: [{ source: "Legacy.", target: "舊例句。" }]
    }
  }
};
canonicalExamples.apply(seed, utils);

assert.strictEqual(canonicalExamples.entries.length, 41);
assert.strictEqual(seed.entries["have been + ving|legacy"], undefined);

canonicalExamples.entries.forEach((item) => {
  assert.ok(!item.word.includes("+"), `${item.word} should use its canonical headword`);
  assert.strictEqual(item.examples.length, 3, `${item.word} should have three examples`);
  item.examples.forEach(([source, target]) => {
    assert.ok(source.trim(), `${item.word} should have an English example`);
    assert.ok(target.trim(), `${item.word} should have a Chinese translation`);
  });

  const matchingSense = bank.lookup(item.word, { includeHidden: true, limit: 20 }).find((entry) => (
    entry.word === item.word
    && entry.pos === item.pos
    && entry.type === item.type
    && utils.normalizeMeaning(entry.meaning) === utils.normalizeMeaning(item.meaning)
  ));
  assert.ok(matchingSense, `${item.word} (${item.meaning}) should match the sense bank`);

  const key = utils.getLocalCacheKey(item.word, [{
    meaning: item.meaning,
    pos: item.pos,
    type: item.type,
    level: item.level
  }]);
  const payload = seed.entries[key];
  assert.ok(payload, `${item.word} (${item.meaning}) should be seeded`);
  assert.strictEqual(payload.examples.length, 3);
  payload.examples.forEach((example) => {
    assert.ok(example.source);
    assert.ok(example.target);
  });
});

console.log("canonical vocab example seed tests passed");
