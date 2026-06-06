const QUESTIONS = [
  {
    id: "eat-apple",
    zh: "我吃蘋果。",
    hasVerb: true,
    english: "I eat an apple.",
    note: "正確，「吃」是動詞。"
  },
  {
    id: "go-school",
    zh: "他去學校。",
    hasVerb: true,
    english: "He goes to school.",
    note: "正確，「去」是動詞。"
  },
  {
    id: "i-tired",
    zh: "我很累。",
    hasVerb: false,
    needsBe: true,
    beForm: "am",
    english: "I am tired."
  },
  {
    id: "she-tall",
    zh: "她很高。",
    hasVerb: false,
    needsBe: true,
    beForm: "is",
    english: "She is tall."
  },
  {
    id: "we-happy",
    zh: "我們很開心。",
    hasVerb: false,
    needsBe: true,
    beForm: "are",
    english: "We are happy."
  },
  {
    id: "they-play",
    zh: "他們踢足球。",
    hasVerb: true,
    english: "They play football.",
    note: "正確，「踢」是動詞。"
  },
  {
    id: "red-bag",
    zh: "我的紅色書包",
    hasVerb: false,
    needsBe: false,
    beForm: "",
    english: "my red school bag"
  },
  {
    id: "you-kind",
    zh: "你很友善。",
    hasVerb: false,
    needsBe: true,
    beForm: "are",
    english: "You are kind."
  }
];

const STORAGE_KEY = "basic_grammar_lesson_01_progress";

const state = {
  index: 0,
  score: 0,
  resolved: false
};

const el = {
  menuScreen: document.querySelector("#menu-screen"),
  lessonScreen: document.querySelector("#lesson-screen"),
  menuProgress: document.querySelector("#menu-progress"),
  questionNumber: document.querySelector("#question-number"),
  questionTotal: document.querySelector("#question-total"),
  stepLabel: document.querySelector("#step-label"),
  chinesePrompt: document.querySelector("#chinese-prompt"),
  guidance: document.querySelector("#guidance"),
  verbChoice: document.querySelector("#verb-choice"),
  beNeedChoice: document.querySelector("#be-need-choice"),
  beFormChoice: document.querySelector("#be-form-choice"),
  englishCard: document.querySelector("#english-card"),
  englishText: document.querySelector("#english-text"),
  feedback: document.querySelector("#feedback"),
  nextBtn: document.querySelector("#next-btn"),
  restartBtn: document.querySelector("#restart-btn")
};

function getProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return Math.max(0, Math.min(QUESTIONS.length, Number(saved.completed) || 0));
  } catch (_error) {
    return 0;
  }
}

function saveProgress(completed) {
  const nextCompleted = Math.max(getProgress(), Math.min(QUESTIONS.length, completed));
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    completed: nextCompleted,
    total: QUESTIONS.length,
    updatedAt: Date.now()
  }));
  updateMenuProgress();
}

function updateMenuProgress() {
  el.menuProgress.textContent = `${getProgress()}/${QUESTIONS.length}`;
}

function showScreen(screen) {
  el.menuScreen.classList.toggle("active", screen === "menu");
  el.lessonScreen.classList.toggle("active", screen === "lesson");
}

function setFeedback(message = "", type = "") {
  el.feedback.textContent = message;
  el.feedback.className = `feedback${type ? ` ${type}` : ""}`;
}

function showOnlyChoice(choice) {
  el.verbChoice.classList.toggle("hidden", choice !== "verb");
  el.beNeedChoice.classList.toggle("hidden", choice !== "needsBe");
  el.beFormChoice.classList.toggle("hidden", choice !== "beForm");
}

function currentQuestion() {
  return QUESTIONS[state.index] || null;
}

function startLesson() {
  state.index = 0;
  state.score = 0;
  showScreen("lesson");
  renderQuestion();
}

function backToMenu() {
  cancelSpeech();
  updateMenuProgress();
  showScreen("menu");
}

function renderQuestion() {
  const question = currentQuestion();
  if (!question) {
    renderComplete();
    return;
  }

  state.resolved = false;
  el.questionNumber.textContent = String(state.index + 1);
  el.questionTotal.textContent = String(QUESTIONS.length);
  el.stepLabel.textContent = "中文句子";
  el.chinesePrompt.textContent = question.zh;
  el.guidance.textContent = "分析句子有沒有動詞";
  el.englishCard.classList.add("hidden");
  el.nextBtn.classList.add("hidden");
  el.restartBtn.classList.add("hidden");
  showOnlyChoice("verb");
  setFeedback();
}

function completeQuestion(message) {
  const question = currentQuestion();
  if (!question) return;

  if (!state.resolved) {
    state.resolved = true;
    state.score += 1;
    saveProgress(state.index + 1);
  }

  showOnlyChoice("");
  el.guidance.textContent = "英文句子已解鎖";
  el.englishText.textContent = question.english;
  el.englishCard.classList.remove("hidden");
  el.nextBtn.classList.remove("hidden");
  setFeedback(message || "正確。按英文句子可以聽讀音。", "success");
}

function answerVerbChoice(choice) {
  const question = currentQuestion();
  if (!question || state.resolved) return;

  const hasVerbChoice = choice === "true";
  if (question.hasVerb !== hasVerbChoice) {
    setFeedback(hasVerbChoice ? "再睇一次：呢句未有動作字，所以先按 CROSS。" : "再睇一次：呢句有動詞，所以應該按 TICK。", "error");
    return;
  }

  if (question.hasVerb) {
    completeQuestion(question.note || "正確，呢句有動詞。");
    return;
  }

  el.stepLabel.textContent = "Be verb check";
  el.guidance.textContent = "中文沒有明顯動詞，英文要不要補 is / am / are？";
  showOnlyChoice("needsBe");
  setFeedback("正確，呢句中文沒有動詞。", "success");
}

function answerNeedsBe(choice) {
  const question = currentQuestion();
  if (!question || question.hasVerb || state.resolved) return;

  const needsBeChoice = choice === "true";
  if (question.needsBe !== needsBeChoice) {
    setFeedback(needsBeChoice ? "呢句只係名詞短語，暫時不用 is / am / are。" : "英文完整句要補 be verb。", "error");
    return;
  }

  if (!question.needsBe) {
    completeQuestion("正確，呢句不用補 is / am / are。");
    return;
  }

  el.stepLabel.textContent = "is / am / are";
  el.guidance.textContent = "揀正確的 be verb";
  showOnlyChoice("beForm");
  setFeedback("正確，要補 be verb。", "success");
}

function answerBeForm(form) {
  const question = currentQuestion();
  if (!question || state.resolved) return;

  if (form !== question.beForm) {
    setFeedback("未啱，再揀一次 is / am / are。", "error");
    return;
  }

  completeQuestion(`正確，今句用 ${question.beForm}。`);
}

function nextQuestion() {
  cancelSpeech();
  state.index += 1;
  renderQuestion();
}

function renderComplete() {
  saveProgress(QUESTIONS.length);
  el.questionNumber.textContent = String(QUESTIONS.length);
  el.questionTotal.textContent = String(QUESTIONS.length);
  el.stepLabel.textContent = "Lesson complete";
  el.chinesePrompt.textContent = "完成第一課";
  el.guidance.textContent = `Score ${state.score}/${QUESTIONS.length}`;
  showOnlyChoice("");
  el.englishCard.classList.add("hidden");
  el.nextBtn.classList.add("hidden");
  el.restartBtn.classList.remove("hidden");
  setFeedback("你已完成「分辨句子是否有動詞」。", "success");
}

function cancelSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  el.englishCard.classList.remove("speaking");
}

function speakCurrentEnglish() {
  const question = currentQuestion();
  if (!question || !window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") return;

  cancelSpeech();
  const utterance = new SpeechSynthesisUtterance(question.english);
  utterance.lang = "en-US";
  utterance.rate = 0.88;
  utterance.onstart = () => el.englishCard.classList.add("speaking");
  utterance.onend = () => el.englishCard.classList.remove("speaking");
  utterance.onerror = () => el.englishCard.classList.remove("speaking");
  window.speechSynthesis.speak(utterance);
}

document.querySelector("[data-start-lesson]").addEventListener("click", startLesson);
document.querySelector("[data-back-menu]").addEventListener("click", backToMenu);
el.nextBtn.addEventListener("click", nextQuestion);
el.restartBtn.addEventListener("click", startLesson);
el.englishCard.addEventListener("click", speakCurrentEnglish);

document.querySelectorAll("[data-verb-choice]").forEach((button) => {
  button.addEventListener("click", () => answerVerbChoice(button.dataset.verbChoice));
});

document.querySelectorAll("[data-needs-be]").forEach((button) => {
  button.addEventListener("click", () => answerNeedsBe(button.dataset.needsBe));
});

document.querySelectorAll("[data-be-form]").forEach((button) => {
  button.addEventListener("click", () => answerBeForm(button.dataset.beForm));
});

updateMenuProgress();
