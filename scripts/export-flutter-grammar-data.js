"use strict";

const fs = require("fs");
const path = require("path");

const { QUESTIONS } = require("../grammar_data.js");

const outputPath = path.join(
  __dirname,
  "..",
  "flutter_app",
  "assets",
  "data",
  "lesson_01.json"
);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(QUESTIONS, null, 2)}\n`, "utf8");

const counts = QUESTIONS.reduce((result, question) => {
  result[question.type] = (result[question.type] || 0) + 1;
  return result;
}, {});

console.log(`Exported ${QUESTIONS.length} Lesson 01 questions to ${outputPath}`);
console.log(`Question mix: ${JSON.stringify(counts)}`);
