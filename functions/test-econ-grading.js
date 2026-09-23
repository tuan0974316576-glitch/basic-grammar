"use strict";

process.env.NODE_ENV = "test";
const assert = require("node:assert/strict");
const grading = require("./econ-grading");
const data = require("./p2-grading-data.json");

assert.equal(grading.questionCount, data.questions.length);
assert.ok(grading.questionCount > 3000);
assert.equal(
  grading.exactResponseQuote("Demand increases.", "demand increases"),
  "Demand increases",
);

const sample = data.questions.find((question) => question.language === "zh");
assert.ok(sample, "A reviewed Traditional Chinese P2 question is required.");
const normalized = grading.normalizeStudentDiagram({
  curves: [{ id: "d", type: "demand", position: 0, steepness: 1 }],
  points: [],
});
assert.equal(normalized.curves.length, 1);
assert.equal(normalized.curves[0].type, "demand");
assert.equal(typeof sample.maxMarks, "number");
assert.ok(sample.gradingRubric?.criteria?.length);
assert.match(
  grading.gradingInstructions(sample),
  /official diagram shows P0 to P1.*student.*uses P1 to P2/s,
);

console.log(`A1 ECON grading checks passed for ${grading.questionCount} questions.`);
