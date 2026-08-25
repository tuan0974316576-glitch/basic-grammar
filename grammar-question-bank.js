(function attachGrammarQuestionBank(root) {
  "use strict";

  const lessonConfigs = [
    ["lesson1", "Lesson 01", "分辨句子是否有主動動詞"],
    ["lesson2", "Lesson 02", "一句句子必須只有一個動詞"],
    ["quiz1", "Quiz 1", "重組英文句子"],
    ["sentence-underline", "Lesson 03", "何謂句子"],
    ["pronoun-match", "Lesson 04", "代名詞"],
    ["pronoun-sentence", "Lesson 05", "代名詞句子 MC"],
    ["countable-nouns", "Lesson 06", "可數名詞的使用要點"],
    ["noun-category", "Lesson 07", "名詞的類別"],
    ["modal-verb", "Lesson 08", "Modal Verb 的要訣"],
    ["adjective-lesson", "Lesson 09", "Adjective 形容詞"],
    ["adverb-lesson", "Lesson 10", "Adverb 副詞"],
    ["tenses", "Lesson 11", "Tenses 時態分辨"],
    ["verb-table", "Lesson 12", "Verb Table 動詞四式"],
    ["have-usage", "Lesson 13", "「有」的主要用法"]
  ].map(([id, kicker, title]) => ({ id, kicker, title }));

  const assetToLesson = {
    "lesson_01.json": "lesson1",
    "lesson_02.json": "lesson2",
    "quiz_01.json": "quiz1",
    "lesson_03.json": "sentence-underline",
    "lesson_04.json": "pronoun-match",
    "lesson_05.json": "pronoun-sentence",
    "lesson_06.json": "countable-nouns",
    "lesson_07.json": "noun-category",
    "lesson_08.json": "modal-verb",
    "lesson_09.json": "adjective-lesson",
    "lesson_10.json": "adverb-lesson",
    "lesson_11.json": "tenses",
    "lesson_12.json": "verb-table",
    "lesson_13.json": "have-usage",
    "verb_table_reference.json": "verb-table-reference"
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function configFor(lessonId) {
    return lessonConfigs.find((lesson) => lesson.id === lessonId) || {
      id: lessonId,
      kicker: lessonId,
      title: lessonId
    };
  }

  function canonicalBanks(grammarData = root.GrammarData) {
    const lessons = grammarData?.LESSONS || {};
    return lessonConfigs.reduce((result, config) => {
      const questions = lessons[config.id]?.questions || [];
      result[config.id] = {
        lessonId: config.id,
        kicker: config.kicker,
        title: config.title,
        questions: clone(questions)
      };
      return result;
    }, {});
  }

  function stringValue(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function listValue(value) {
    return Array.isArray(value) ? value : [];
  }

  function objectValue(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  }

  function validateQuestions(lessonId, questions) {
    const errors = [];
    if (!Array.isArray(questions) || !questions.length) {
      return ["題庫必須至少有一題。"];
    }
    const ids = new Set();
    questions.forEach((question, index) => {
      const prefix = `第 ${index + 1} 題`;
      if (!objectValue(question)) {
        errors.push(`${prefix} 必須係 JSON object。`);
        return;
      }
      const id = stringValue(question.id);
      if (!id) errors.push(`${prefix} 缺少 id。`);
      if (id && ids.has(id)) errors.push(`${prefix} id 重複：${id}。`);
      if (id) ids.add(id);

      const requireText = (key) => {
        if (!stringValue(question[key])) errors.push(`${prefix} 缺少 ${key}。`);
      };
      const requireList = (key, minimum = 1) => {
        if (listValue(question[key]).length < minimum) {
          errors.push(`${prefix} ${key} 至少要有 ${minimum} 項。`);
        }
      };

      if (lessonId === "lesson1") {
        requireText("type");
        requireText("zh");
        requireText("english");
        requireText("note");
        if (!["action", "be", "adjective"].includes(question.type)) {
          errors.push(`${prefix} type 必須係 action、be 或 adjective。`);
        }
      } else if (lessonId === "lesson2") {
        requireText("sentence");
        requireText("zh");
        requireText("explanation");
        requireText("correction");
        if (typeof question.isCorrect !== "boolean") errors.push(`${prefix} isCorrect 必須係 true / false。`);
        if (!Number.isInteger(question.verbCount) || question.verbCount < 0) errors.push(`${prefix} verbCount 必須係 0 或以上整數。`);
      } else if (lessonId === "quiz1") {
        requireText("zh");
        requireList("answer");
        requireList("distractors", 2);
      } else if (lessonId === "sentence-underline") {
        requireText("text");
        requireList("segments");
      } else if (lessonId === "pronoun-match") {
        requireText("zh");
        const forms = objectValue(question.forms);
        ["subject", "object", "possessiveAdjective", "possessivePronoun"].forEach((key) => {
          if (!stringValue(forms?.[key])) errors.push(`${prefix} forms.${key} 缺少。`);
        });
      } else if (lessonId === "pronoun-sentence") {
        requireText("sentence");
        requireText("zh");
        requireText("answer");
        requireList("choices", 2);
      } else if (lessonId === "verb-table" || lessonId === "verb-table-reference") {
        requireText("zh");
        const forms = objectValue(question.forms);
        ["present", "past", "pp", "ing"].forEach((key) => {
          if (!stringValue(forms?.[key])) errors.push(`${prefix} forms.${key} 缺少。`);
        });
      } else {
        requireText("sentence");
        requireText("zh");
        requireText("explanation");
        if (typeof question.isCorrect !== "boolean") errors.push(`${prefix} isCorrect 必須係 true / false。`);
        if (!stringValue(question.answer || question.english)) errors.push(`${prefix} 缺少 answer 或 english。`);
      }
    });
    return errors;
  }

  function parseEditorJson(source) {
    try {
      const parsed = JSON.parse(source);
      return { value: parsed, errors: [] };
    } catch (error) {
      return { value: null, errors: [`JSON 格式錯誤：${error.message}`] };
    }
  }

  root.GrammarQuestionBankAdmin = {
    assetToLesson,
    canonicalBanks,
    configFor,
    lessonConfigs,
    parseEditorJson,
    validateQuestions
  };
})(typeof window !== "undefined" ? window : globalThis);
