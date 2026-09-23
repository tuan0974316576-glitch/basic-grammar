const assert = require("assert");
const utils = require("../vocab_example_utils.js");

const candidates = [
  {
    meaning: "使不同",
    pos: "verb",
    type: "word",
    examples: [{ source: "These colours differ.", target: "這些顏色不同。" }]
  },
  {
    meaning: "因...而異",
    pos: "verb",
    type: "pattern",
    examples: [{ source: "Prices differ from shop to shop.", target: "價格因商店而異。" }]
  }
];

const selected = utils.selectBestExamplePayload({
  meaning: "因...而異",
  pos: "verb",
  type: "pattern"
}, candidates);

assert.strictEqual(selected.examples[0].source, "Prices differ from shop to shop.");
assert.strictEqual(utils.selectBestExamplePayload({}, []), null);
console.log("vocab example utils tests passed");
