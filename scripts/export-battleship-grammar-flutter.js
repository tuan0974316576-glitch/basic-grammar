const fs = require("node:fs");
const path = require("node:path");
const {
  applyGrammarWorkshopAnswerOverrides
} = require("./grammar-workshop-answer-overrides");

const root = path.resolve(__dirname, "..");
const outputPath = path.join(
  root,
  "flutter_app",
  "assets",
  "data",
  "battleship_grammar_topics.json"
);
const databaseRoot =
  "https://battleship-game-c0909-default-rtdb.asia-southeast1.firebasedatabase.app";

async function fetchJson(remotePath) {
  const response = await fetch(`${databaseRoot}/${remotePath}.json`);
  if (!response.ok) {
    throw new Error(`Battleship grammar export failed (${response.status}).`);
  }
  return response.json();
}

async function main() {
  const [manifest, topics] = await Promise.all([
    fetchJson("grammarBank/public/manifest"),
    fetchJson("grammarBank/public/topics")
  ]);
  if (!manifest?.releaseId || !topics || typeof topics !== "object") {
    throw new Error("Battleship has no complete published grammar release.");
  }
  applyGrammarWorkshopAnswerOverrides(topics);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify({ schemaVersion: 1, manifest, topics })}\n`
  );
  const topicCount = Object.keys(topics).length;
  const questionCount = Object.values(topics).reduce(
    (total, topic) => total + Number(topic?.count || 0),
    0
  );
  console.log(
    `Exported Battleship grammar ${manifest.releaseId}: ` +
      `${topicCount} topics / ${questionCount} questions -> ${outputPath}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
