const QUESTIONS = [
  { id: "v01", type: "action", zh: "我吃蘋果。", english: "I eat an apple.", note: "「吃」是動作動詞。" },
  { id: "v02", type: "action", zh: "他去學校。", english: "He goes to school.", note: "「去」是動作動詞。" },
  { id: "v03", type: "action", zh: "她看書。", english: "She reads a book.", note: "「看」是動作動詞。" },
  { id: "v04", type: "action", zh: "我們踢足球。", english: "We play football.", note: "「踢」是動作動詞。" },
  { id: "v05", type: "action", zh: "你喝水。", english: "You drink water.", note: "「喝」是動作動詞。" },
  { id: "v06", type: "action", zh: "他們唱歌。", english: "They sing songs.", note: "「唱」是動作動詞。" },
  { id: "v07", type: "action", zh: "媽媽煮飯。", english: "Mum cooks dinner.", note: "「煮」是動作動詞。" },
  { id: "v08", type: "action", zh: "爸爸開車。", english: "Dad drives a car.", note: "「開」是動作動詞。" },
  { id: "v09", type: "action", zh: "小明寫字。", english: "Siu Ming writes words.", note: "「寫」是動作動詞。" },
  { id: "v10", type: "action", zh: "妹妹畫畫。", english: "My younger sister draws pictures.", note: "「畫」是動作動詞。" },
  { id: "v11", type: "action", zh: "老師教英文。", english: "The teacher teaches English.", note: "「教」是動作動詞。" },
  { id: "v12", type: "action", zh: "學生聽故事。", english: "The students listen to a story.", note: "「聽」是動作動詞。" },
  { id: "v13", type: "action", zh: "我買麵包。", english: "I buy bread.", note: "「買」是動作動詞。" },
  { id: "v14", type: "action", zh: "你打開門。", english: "You open the door.", note: "「打開」是動作動詞。" },
  { id: "v15", type: "action", zh: "他關上窗。", english: "He closes the window.", note: "「關上」是動作動詞。" },
  { id: "v16", type: "action", zh: "她洗手。", english: "She washes her hands.", note: "「洗」是動作動詞。" },
  { id: "v17", type: "action", zh: "我們跑步。", english: "We run.", note: "「跑」是動作動詞。" },
  { id: "v18", type: "action", zh: "他們游泳。", english: "They swim.", note: "「游泳」是動作動詞。" },
  { id: "v19", type: "action", zh: "小狗睡覺。", english: "The dog sleeps.", note: "「睡覺」是動作動詞。" },
  { id: "v20", type: "action", zh: "小鳥飛。", english: "The bird flies.", note: "「飛」是動作動詞。" },
  { id: "v21", type: "action", zh: "我做功課。", english: "I do my homework.", note: "「做」是動作動詞。" },
  { id: "v22", type: "action", zh: "你讀英文。", english: "You read English.", note: "「讀」是動作動詞。" },
  { id: "v23", type: "action", zh: "哥哥打籃球。", english: "My older brother plays basketball.", note: "「打」是動作動詞。" },
  { id: "v24", type: "action", zh: "姐姐跳舞。", english: "My older sister dances.", note: "「跳舞」是動作動詞。" },
  { id: "v25", type: "action", zh: "我們玩遊戲。", english: "We play games.", note: "「玩」是動作動詞。" },

  { id: "b01", type: "be", zh: "我是學生。", beForm: "am", english: "I am a student." },
  { id: "b02", type: "be", zh: "你是老師。", beForm: "are", english: "You are a teacher." },
  { id: "b03", type: "be", zh: "他是醫生。", beForm: "is", english: "He is a doctor." },
  { id: "b04", type: "be", zh: "她是護士。", beForm: "is", english: "She is a nurse." },
  { id: "b05", type: "be", zh: "它是一隻貓。", beForm: "is", english: "It is a cat." },
  { id: "b06", type: "be", zh: "我們是朋友。", beForm: "are", english: "We are friends." },
  { id: "b07", type: "be", zh: "他們是學生。", beForm: "are", english: "They are students." },
  { id: "b08", type: "be", zh: "這是我的書。", beForm: "is", english: "This is my book." },
  { id: "b09", type: "be", zh: "那是你的筆。", beForm: "is", english: "That is your pen." },
  { id: "b10", type: "be", zh: "小明是男孩。", beForm: "is", english: "Siu Ming is a boy." },
  { id: "b11", type: "be", zh: "妹妹是女孩。", beForm: "is", english: "My younger sister is a girl." },
  { id: "b12", type: "be", zh: "爸爸是司機。", beForm: "is", english: "Dad is a driver." },
  { id: "b13", type: "be", zh: "媽媽是廚師。", beForm: "is", english: "Mum is a cook." },
  { id: "b14", type: "be", zh: "這些是蘋果。", beForm: "are", english: "These are apples." },
  { id: "b15", type: "be", zh: "那些是椅子。", beForm: "are", english: "Those are chairs." },

  { id: "a01", type: "adjective", zh: "我很累。", beForm: "am", english: "I am tired." },
  { id: "a02", type: "adjective", zh: "你很開心。", beForm: "are", english: "You are happy." },
  { id: "a03", type: "adjective", zh: "他很高。", beForm: "is", english: "He is tall." },
  { id: "a04", type: "adjective", zh: "她很聰明。", beForm: "is", english: "She is smart." },
  { id: "a05", type: "adjective", zh: "它很可愛。", beForm: "is", english: "It is cute." },
  { id: "a06", type: "adjective", zh: "我們很忙。", beForm: "are", english: "We are busy." },
  { id: "a07", type: "adjective", zh: "他們很友善。", beForm: "are", english: "They are kind." },
  { id: "a08", type: "adjective", zh: "天氣很熱。", beForm: "is", english: "The weather is hot." },
  { id: "a09", type: "adjective", zh: "這本書很有趣。", beForm: "is", english: "This book is interesting." },
  { id: "a10", type: "adjective", zh: "房間很乾淨。", beForm: "is", english: "The room is clean." }
];

const STORAGE_KEY = "basic_grammar_lesson_01_progress_v2";
const SOUND_KEY = "basic_grammar_sound_enabled_v1";
const CATEGORY_LABELS = {
  action: "動作動詞",
  be: "「是」句",
  adjective: "形容詞句"
};

const SOUND_PATTERNS = {
  start: [
    { frequency: 523.25, delay: 0, duration: 0.07 },
    { frequency: 659.25, delay: 0.08, duration: 0.08 },
    { frequency: 783.99, delay: 0.16, duration: 0.1 }
  ],
  step: [
    { frequency: 659.25, delay: 0, duration: 0.055 },
    { frequency: 880, delay: 0.07, duration: 0.07 }
  ],
  correct: [
    { frequency: 783.99, delay: 0, duration: 0.06 },
    { frequency: 987.77, delay: 0.07, duration: 0.07 },
    { frequency: 1318.51, delay: 0.15, duration: 0.09 }
  ],
  wrong: [
    { frequency: 329.63, delay: 0, duration: 0.08, type: "sine" },
    { frequency: 246.94, delay: 0.09, duration: 0.12, type: "sine" }
  ],
  next: [
    { frequency: 587.33, delay: 0, duration: 0.055 },
    { frequency: 739.99, delay: 0.06, duration: 0.055 }
  ],
  complete: [
    { frequency: 523.25, delay: 0, duration: 0.07 },
    { frequency: 659.25, delay: 0.08, duration: 0.07 },
    { frequency: 783.99, delay: 0.16, duration: 0.07 },
    { frequency: 1046.5, delay: 0.24, duration: 0.16 }
  ]
};

let audioContext = null;

const state = {
  index: 0,
  score: 0,
  resolved: false,
  soundEnabled: getSavedSoundEnabled()
};

const el = {
  menuScreen: document.querySelector("#menu-screen"),
  lessonScreen: document.querySelector("#lesson-screen"),
  menuProgress: document.querySelector("#menu-progress"),
  questionNumber: document.querySelector("#question-number"),
  questionTotal: document.querySelector("#question-total"),
  stepLabel: document.querySelector("#step-label"),
  categoryPill: document.querySelector("#category-pill"),
  chinesePrompt: document.querySelector("#chinese-prompt"),
  guidance: document.querySelector("#guidance"),
  verbChoice: document.querySelector("#verb-choice"),
  beNeedChoice: document.querySelector("#be-need-choice"),
  beFormChoice: document.querySelector("#be-form-choice"),
  englishCard: document.querySelector("#english-card"),
  englishText: document.querySelector("#english-text"),
  feedback: document.querySelector("#feedback"),
  nextBtn: document.querySelector("#next-btn"),
  restartBtn: document.querySelector("#restart-btn"),
  soundToggle: document.querySelector("#sound-toggle")
};

function getSavedSoundEnabled() {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch (_error) {
    return true;
  }
}

function saveSoundEnabled() {
  try {
    localStorage.setItem(SOUND_KEY, state.soundEnabled ? "on" : "off");
  } catch (_error) {
    // Sound still works during the current session if storage is unavailable.
  }
}

function syncSoundToggle() {
  el.soundToggle.classList.toggle("muted", !state.soundEnabled);
  el.soundToggle.setAttribute("aria-label", state.soundEnabled ? "關閉音效" : "開啟音效");
  el.soundToggle.setAttribute("aria-pressed", String(state.soundEnabled));
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  saveSoundEnabled();
  syncSoundToggle();
  if (state.soundEnabled) {
    playUiSound("start");
  }
}

function getAudioContext() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return null;

  if (!audioContext) {
    audioContext = new AudioContextConstructor();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playUiSound(kind) {
  if (!state.soundEnabled) return;

  const context = getAudioContext();
  const pattern = SOUND_PATTERNS[kind];
  if (!context || !pattern) return;

  const now = context.currentTime + 0.01;
  pattern.forEach((note) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = now + note.delay;
    const endAt = startAt + note.duration;

    oscillator.type = note.type || "triangle";
    oscillator.frequency.setValueAtTime(note.frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(note.gain || 0.065, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(endAt + 0.02);
  });
}

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

function questionHasVerb(question) {
  return question.type === "action" || question.type === "be";
}

function startLesson() {
  state.index = 0;
  state.score = 0;
  showScreen("lesson");
  renderQuestion();
  playUiSound("start");
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
  el.categoryPill.textContent = CATEGORY_LABELS[question.type];
  el.categoryPill.dataset.type = question.type;
  el.chinesePrompt.textContent = question.zh;
  el.guidance.textContent = "分析句子有沒有動詞：有就 TICK，冇就 CROSS。";
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
  el.guidance.textContent = "英文句子已解鎖，按一下可以聽讀音。";
  el.englishText.textContent = question.english;
  el.englishCard.classList.remove("hidden");
  el.nextBtn.classList.remove("hidden");
  setFeedback(message || "正確！", "success");
  playUiSound(state.index === QUESTIONS.length - 1 ? "complete" : "correct");
}

function askBeForm(message) {
  el.stepLabel.textContent = "is / am / are";
  el.guidance.textContent = "揀正確的 be verb。";
  showOnlyChoice("beForm");
  setFeedback(message, "success");
  playUiSound("step");
}

function answerVerbChoice(choice) {
  const question = currentQuestion();
  if (!question || state.resolved) return;

  const hasVerbChoice = choice === "true";
  if (questionHasVerb(question) !== hasVerbChoice) {
    setFeedback(hasVerbChoice ? "再睇一次：形容詞句中文未有動詞，所以先按 CROSS。" : "再睇一次：呢句有動詞或「是」，所以應該按 TICK。", "error");
    playUiSound("wrong");
    return;
  }

  if (question.type === "action") {
    completeQuestion(`正確，${question.note}`);
    return;
  }

  if (question.type === "be") {
    askBeForm("正確，「是」要轉成英文 be verb。");
    return;
  }

  el.stepLabel.textContent = "Be verb check";
  el.guidance.textContent = "中文形容詞句沒有明顯動詞，英文要不要補 is / am / are？";
  showOnlyChoice("needsBe");
  setFeedback("正確，呢句中文沒有動詞。", "success");
  playUiSound("step");
}

function answerNeedsBe(choice) {
  const question = currentQuestion();
  if (!question || question.type !== "adjective" || state.resolved) return;

  const needsBeChoice = choice === "true";
  if (!needsBeChoice) {
    setFeedback("形容詞句要補 be verb，例如：I am tired.", "error");
    playUiSound("wrong");
    return;
  }

  askBeForm("正確，形容詞句英文要補 be verb。");
}

function answerBeForm(form) {
  const question = currentQuestion();
  if (!question || state.resolved) return;

  if (form !== question.beForm) {
    setFeedback(`未啱，再諗吓主語應該配 is / am / are 邊個。`, "error");
    playUiSound("wrong");
    return;
  }

  completeQuestion(`正確，今句用 ${question.beForm}。`);
}

function nextQuestion() {
  cancelSpeech();
  state.index += 1;
  renderQuestion();
  playUiSound("next");
}

function renderComplete() {
  saveProgress(QUESTIONS.length);
  el.questionNumber.textContent = String(QUESTIONS.length);
  el.questionTotal.textContent = String(QUESTIONS.length);
  el.stepLabel.textContent = "Lesson complete";
  el.categoryPill.textContent = "完成";
  el.categoryPill.dataset.type = "done";
  el.chinesePrompt.textContent = "完成第一課";
  el.guidance.textContent = `Score ${state.score}/${QUESTIONS.length}`;
  showOnlyChoice("");
  el.englishCard.classList.add("hidden");
  el.nextBtn.classList.add("hidden");
  el.restartBtn.classList.remove("hidden");
  setFeedback("你已完成 50 題：25 動詞 + 15「是」+ 10 形容詞。", "success");
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
el.soundToggle.addEventListener("click", toggleSound);

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
syncSoundToggle();
