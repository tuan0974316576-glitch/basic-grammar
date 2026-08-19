"use strict";

const fs = require("fs");
const path = require("path");

const { QUESTIONS, VERB_COUNT_QUESTIONS } = require("../grammar_data.js");

const outputDir = path.join(__dirname, "..", "flutter_app", "assets", "data");

function writeQuestions(filename, questions) {
  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
  console.log(`Exported ${questions.length} questions to ${outputPath}`);
}

fs.mkdirSync(outputDir, { recursive: true });
writeQuestions("lesson_01.json", QUESTIONS);
writeQuestions("lesson_02.json", VERB_COUNT_QUESTIONS);

const counts = QUESTIONS.reduce((result, question) => {
  result[question.type] = (result[question.type] || 0) + 1;
  return result;
}, {});

console.log(`Lesson 01 mix: ${JSON.stringify(counts)}`);

const verbCountMix = VERB_COUNT_QUESTIONS.reduce((result, question) => {
  result[question.verbCount] = (result[question.verbCount] || 0) + 1;
  return result;
}, {});
console.log(`Lesson 02 mix: ${JSON.stringify(verbCountMix)}`);
