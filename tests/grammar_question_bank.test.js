const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const context = { window: {} };
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(__dirname, "../grammar-question-bank.js"), "utf8"),
  context,
  { filename: "grammar-question-bank.js" }
);
const helper = context.window.GrammarQuestionBankAdmin;

const adminHtml = fs.readFileSync(path.join(__dirname, "../grammar-admin.html"), "utf8");
assert.ok(adminHtml.includes('id="question-form"'));
assert.ok(adminHtml.includes('id="question-search"'));
assert.strictEqual(adminHtml.includes('id="questions-json"'), false);

assert.strictEqual(helper.lessonConfigs.length, 14);
assert.strictEqual(helper.assetToLesson["lesson_12.json"], "verb-table");

const validQuiz = [{
  id: "q1",
  zh: "她吃蘋果。",
  answer: ["She", "eats", "apples."],
  distractors: ["eat", "is"]
}];
assert.strictEqual(helper.validateQuestions("quiz1", validQuiz).length, 0);
assert.ok(helper.validateQuestions("quiz1", [{ ...validQuiz[0], distractors: ["eat"] }]).length);
assert.ok(helper.validateQuestions("lesson1", [{ id: "broken", zh: "" }]).length);
assert.strictEqual(helper.parseEditorJson("[{\"id\":\"q1\"}]").errors.length, 0);
assert.strictEqual(helper.parseEditorJson("not json").value, null);

console.log("grammar question bank tests passed");
