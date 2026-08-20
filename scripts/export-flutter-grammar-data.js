"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const {
  QUESTIONS,
  VERB_COUNT_QUESTIONS,
  SENTENCE_BUILD_QUESTIONS,
  SENTENCE_UNDERLINE_QUESTIONS,
  PRONOUN_MATCH_QUESTIONS,
  PRONOUN_SENTENCE_QUESTION_BANK,
  COUNTABLE_NOUN_QUESTIONS,
  NOUN_CATEGORY_QUESTIONS,
  MODAL_VERB_QUESTIONS,
  ADJECTIVE_QUESTIONS,
  ADVERB_QUESTIONS,
  TENSE_QUESTIONS,
  VERB_TABLE_QUESTIONS,
  HAVE_USAGE_QUESTIONS
} = require("../grammar_data.js");

const outputDir = path.join(__dirname, "..", "flutter_app", "assets", "data");

function writeQuestions(filename, questions) {
  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
  console.log(`Exported ${questions.length} questions to ${outputPath}`);
}

function loadWindowValue(filename, key) {
  const context = { window: {} };
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, "..", filename), "utf8"),
    context,
    { filename }
  );
  return context.window[key] || {};
}

function enrichVerbTableQuestions(questions) {
  const imageManifest = loadWindowValue(
    "grammar_verb_table_image_manifest.js",
    "GRAMMAR_VERB_IMAGE_MANIFEST"
  );
  const audioManifest = loadWindowValue(
    "grammar_verb_table_audio_manifest.js",
    "GRAMMAR_VERB_AUDIO_MANIFEST"
  );
  return questions.map((question) => {
    const rowKey = [
      question.forms.present,
      question.forms.past,
      question.forms.pp,
      question.forms.ing
    ].join("|");
    return {
      ...question,
      imageAsset: imageManifest[rowKey]?.src || "",
      audioAsset: audioManifest[rowKey] || ""
    };
  });
}

function loadVerbTableReferenceQuestions() {
  const bank = loadWindowValue(
    "grammar_verb_table_data.js",
    "GRAMMAR_VERB_BANK"
  );
  return bank
    .map(([zh, present, past, pp, ing], index) => ({
      id: `vtr${String(index + 1).padStart(3, "0")}`,
      type: "verb-table-reference",
      zh,
      forms: { present, past, pp, ing }
    }))
    .sort((left, right) => {
      const present = left.forms.present.localeCompare(
        right.forms.present,
        "en",
        { sensitivity: "base" }
      );
      if (present !== 0) return present;
      return left.id.localeCompare(right.id, "en", { sensitivity: "base" });
    })
    .map((question, index) => ({
      ...question,
      id: `vtr${String(index + 1).padStart(3, "0")}`
    }));
}

fs.mkdirSync(outputDir, { recursive: true });
writeQuestions("lesson_01.json", QUESTIONS);
writeQuestions("lesson_02.json", VERB_COUNT_QUESTIONS);
writeQuestions("quiz_01.json", SENTENCE_BUILD_QUESTIONS);
writeQuestions("lesson_03.json", SENTENCE_UNDERLINE_QUESTIONS);
writeQuestions("lesson_04.json", PRONOUN_MATCH_QUESTIONS);
writeQuestions("lesson_05.json", PRONOUN_SENTENCE_QUESTION_BANK);
writeQuestions("lesson_06.json", COUNTABLE_NOUN_QUESTIONS);
writeQuestions("lesson_07.json", NOUN_CATEGORY_QUESTIONS);
writeQuestions("lesson_08.json", MODAL_VERB_QUESTIONS);
writeQuestions("lesson_09.json", ADJECTIVE_QUESTIONS);
writeQuestions("lesson_10.json", ADVERB_QUESTIONS);
writeQuestions("lesson_11.json", TENSE_QUESTIONS);
writeQuestions("lesson_12.json", enrichVerbTableQuestions(VERB_TABLE_QUESTIONS));
writeQuestions(
  "verb_table_reference.json",
  enrichVerbTableQuestions(loadVerbTableReferenceQuestions())
);
writeQuestions("lesson_13.json", HAVE_USAGE_QUESTIONS);

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
console.log(`Quiz 01 questions: ${SENTENCE_BUILD_QUESTIONS.length}`);

const remainingCounts = [
  SENTENCE_UNDERLINE_QUESTIONS,
  PRONOUN_MATCH_QUESTIONS,
  PRONOUN_SENTENCE_QUESTION_BANK,
  COUNTABLE_NOUN_QUESTIONS,
  NOUN_CATEGORY_QUESTIONS,
  MODAL_VERB_QUESTIONS,
  ADJECTIVE_QUESTIONS,
  ADVERB_QUESTIONS,
  TENSE_QUESTIONS,
  VERB_TABLE_QUESTIONS,
  HAVE_USAGE_QUESTIONS
].map((questions) => questions.length);
console.log(`Lesson 03-13 questions: ${remainingCounts.join(", ")}`);
