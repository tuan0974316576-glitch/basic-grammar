const fs = require('fs');
const path = require('path');
const {
  applyGrammarWorkshopAnswerOverrides,
} = require('./grammar-workshop-answer-overrides');

const root = path.resolve(__dirname, '..');
const target = path.join(
  root,
  'flutter_app',
  'assets',
  'data',
  'battleship_grammar_topics.json',
);

const packageData = JSON.parse(fs.readFileSync(target, 'utf8'));
applyGrammarWorkshopAnswerOverrides(packageData.topics);

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) =>
      `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function contentHash(value) {
  let hash = 0xcbf29ce484222325n;
  for (const byte of new TextEncoder().encode(stableStringify(value))) {
    hash ^= BigInt(byte);
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash.toString(16).padStart(16, '0');
}

for (const [topicKey, topic] of Object.entries(packageData.topics)) {
  const questions = (topic.order || []).map((id) => topic.questions[id]);
  topic.hash = contentHash(questions.filter((question) => question.disabled !== true));
  topic.revisionHash = contentHash(questions);
  if (packageData.manifest?.topics?.[topicKey]) {
    packageData.manifest.topics[topicKey].hash = topic.hash;
    packageData.manifest.topics[topicKey].count = questions.filter(
      (question) => question.disabled !== true,
    ).length;
  }
}
const topicKeys = Object.keys(packageData.topics);
const aggregateHash = contentHash(topicKeys.map((key) => packageData.topics[key].hash));
packageData.manifest.hash = aggregateHash;
packageData.manifest.draftHash = aggregateHash;
fs.writeFileSync(target, `${JSON.stringify(packageData)}\n`);
console.log(`Applied reviewed Workshop answer overrides to ${target}`);
