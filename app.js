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

  { id: "b01", type: "be", zh: "我是學生。", beForm: "am", english: "I am a student.", subjectZh: "我", subjectEn: "I", subjectRole: "第一身單數", pronoun: "I" },
  { id: "b02", type: "be", zh: "你是老師。", beForm: "are", english: "You are a teacher.", subjectZh: "你", subjectEn: "You", subjectRole: "第二身", pronoun: "You" },
  { id: "b03", type: "be", zh: "他是醫生。", beForm: "is", english: "He is a doctor.", subjectZh: "他", subjectEn: "He", subjectRole: "男性代名詞", pronoun: "He" },
  { id: "b04", type: "be", zh: "她是護士。", beForm: "is", english: "She is a nurse.", subjectZh: "她", subjectEn: "She", subjectRole: "女性代名詞", pronoun: "She" },
  { id: "b05", type: "be", zh: "它是一隻貓。", beForm: "is", english: "It is a cat.", subjectZh: "它", subjectEn: "It", subjectRole: "單數事物或動物", pronoun: "It" },
  { id: "b06", type: "be", zh: "我們是朋友。", beForm: "are", english: "We are friends.", subjectZh: "我們", subjectEn: "We", subjectRole: "第一身眾數", pronoun: "We" },
  { id: "b07", type: "be", zh: "他們是學生。", beForm: "are", english: "They are students.", subjectZh: "他們", subjectEn: "They", subjectRole: "眾數代名詞", pronoun: "They" },
  { id: "b08", type: "be", zh: "這是我的書。", beForm: "is", english: "This is my book.", subjectZh: "這", subjectEn: "This", subjectRole: "單數指示代名詞", pronoun: "This" },
  { id: "b09", type: "be", zh: "那是你的筆。", beForm: "is", english: "That is your pen.", subjectZh: "那", subjectEn: "That", subjectRole: "單數指示代名詞", pronoun: "That" },
  { id: "b10", type: "be", zh: "小明是男孩。", beForm: "is", english: "Siu Ming is a boy.", subjectZh: "小明", subjectEn: "Siu Ming", subjectRole: "男性名字", pronoun: "He" },
  { id: "b11", type: "be", zh: "妹妹是女孩。", beForm: "is", english: "My younger sister is a girl.", subjectZh: "妹妹", subjectEn: "My younger sister", subjectRole: "女性單數名詞", pronoun: "She" },
  { id: "b12", type: "be", zh: "爸爸是司機。", beForm: "is", english: "Dad is a driver.", subjectZh: "爸爸", subjectEn: "Dad", subjectRole: "男性單數名詞", pronoun: "He" },
  { id: "b13", type: "be", zh: "媽媽是廚師。", beForm: "is", english: "Mum is a cook.", subjectZh: "媽媽", subjectEn: "Mum", subjectRole: "女性單數名詞", pronoun: "She" },
  { id: "b14", type: "be", zh: "這些是蘋果。", beForm: "are", english: "These are apples.", subjectZh: "這些", subjectEn: "These", subjectRole: "眾數指示代名詞", pronoun: "They" },
  { id: "b15", type: "be", zh: "那些是椅子。", beForm: "are", english: "Those are chairs.", subjectZh: "那些", subjectEn: "Those", subjectRole: "眾數指示代名詞", pronoun: "They" },

  { id: "a01", type: "adjective", zh: "我很累。", beForm: "am", english: "I am tired.", subjectZh: "我", subjectEn: "I", subjectRole: "第一身單數", pronoun: "I" },
  { id: "a02", type: "adjective", zh: "你很開心。", beForm: "are", english: "You are happy.", subjectZh: "你", subjectEn: "You", subjectRole: "第二身", pronoun: "You" },
  { id: "a03", type: "adjective", zh: "他很高。", beForm: "is", english: "He is tall.", subjectZh: "他", subjectEn: "He", subjectRole: "男性代名詞", pronoun: "He" },
  { id: "a04", type: "adjective", zh: "她很聰明。", beForm: "is", english: "She is smart.", subjectZh: "她", subjectEn: "She", subjectRole: "女性代名詞", pronoun: "She" },
  { id: "a05", type: "adjective", zh: "它很可愛。", beForm: "is", english: "It is cute.", subjectZh: "它", subjectEn: "It", subjectRole: "單數事物或動物", pronoun: "It" },
  { id: "a06", type: "adjective", zh: "我們很忙。", beForm: "are", english: "We are busy.", subjectZh: "我們", subjectEn: "We", subjectRole: "第一身眾數", pronoun: "We" },
  { id: "a07", type: "adjective", zh: "他們很友善。", beForm: "are", english: "They are kind.", subjectZh: "他們", subjectEn: "They", subjectRole: "眾數代名詞", pronoun: "They" },
  { id: "a08", type: "adjective", zh: "天氣很熱。", beForm: "is", english: "The weather is hot.", subjectZh: "天氣", subjectEn: "The weather", subjectRole: "單數名詞", pronoun: "It" },
  { id: "a09", type: "adjective", zh: "這本書很有趣。", beForm: "is", english: "This book is interesting.", subjectZh: "這本書", subjectEn: "This book", subjectRole: "單數名詞", pronoun: "It" },
  { id: "a10", type: "adjective", zh: "房間很乾淨。", beForm: "is", english: "The room is clean.", subjectZh: "房間", subjectEn: "The room", subjectRole: "單數名詞", pronoun: "It" }
];

const STORAGE_KEY = "basic_grammar_lesson_01_progress_v2";
const SOUND_KEY = "basic_grammar_sound_enabled_v1";
const PRACTICE_COUNT_KEY = "basic_grammar_practice_count_v1";
const BEST_STREAK_KEY = "basic_grammar_best_streak_v1";
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
  mode: "practice",
  index: 0,
  score: 0,
  mistakes: 0,
  questionMistakes: 0,
  resolved: false,
  questions: [],
  missedQuestionIds: [],
  reviewQuestions: [],
  streak: 0,
  bestStreak: getSavedBestStreak(),
  practiceCount: getSavedPracticeCount(),
  soundEnabled: getSavedSoundEnabled()
};

const el = {
  menuScreen: document.querySelector("#menu-screen"),
  lessonScreen: document.querySelector("#lesson-screen"),
  resultScreen: document.querySelector("#result-screen"),
  menuProgress: document.querySelector("#menu-progress"),
  menuCoachLine: document.querySelector("#menu-coach-line"),
  practiceCountInput: document.querySelector("#practice-count"),
  practiceCountOutput: document.querySelector("#practice-count-output"),
  lessonKicker: document.querySelector("#lesson-kicker"),
  lessonTitle: document.querySelector("#lesson-title"),
  liveScore: document.querySelector("#live-score"),
  liveTotal: document.querySelector("#live-total"),
  liveStreak: document.querySelector("#live-streak"),
  bestStreak: document.querySelector("#best-streak"),
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
  soundToggle: document.querySelector("#sound-toggle"),
  resultKicker: document.querySelector("#result-kicker"),
  resultScore: document.querySelector("#result-score"),
  resultTotal: document.querySelector("#result-total"),
  resultMistakes: document.querySelector("#result-mistakes"),
  resultPercent: document.querySelector("#result-percent"),
  resultMessage: document.querySelector("#result-message"),
  reviewSummary: document.querySelector("#review-summary"),
  reviewMistakesBtn: document.querySelector("#review-mistakes-btn")
};

function getSavedPracticeCount() {
  try {
    const rawValue = localStorage.getItem(PRACTICE_COUNT_KEY);
    if (rawValue === null) return 20;

    const saved = Number(rawValue);
    if (Number.isFinite(saved)) {
      return Math.max(10, Math.min(QUESTIONS.length, saved));
    }
  } catch (_error) {
    // Fall back to a short mixed practice if storage is unavailable.
  }
  return 20;
}

function savePracticeCount() {
  try {
    localStorage.setItem(PRACTICE_COUNT_KEY, String(state.practiceCount));
  } catch (_error) {
    // The chosen count still works during the current session.
  }
}

function getSavedBestStreak() {
  try {
    const saved = Number(localStorage.getItem(BEST_STREAK_KEY));
    return Number.isFinite(saved) ? Math.max(0, saved) : 0;
  } catch (_error) {
    return 0;
  }
}

function saveBestStreak() {
  try {
    localStorage.setItem(BEST_STREAK_KEY, String(state.bestStreak));
  } catch (_error) {
    // The best streak still updates during the current session.
  }
}

function syncPracticeCount() {
  el.practiceCountInput.value = String(state.practiceCount);
  el.practiceCountOutput.textContent = `${state.practiceCount} 題`;
}

function updatePracticeCount() {
  state.practiceCount = Number(el.practiceCountInput.value);
  savePracticeCount();
  syncPracticeCount();
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function getQuestionQuotas(count) {
  const action = Math.min(25, Math.round(count * 0.5));
  const adjective = Math.min(10, Math.max(1, Math.round(count * 0.2)));
  const be = Math.min(15, count - action - adjective);
  return {
    action,
    be,
    adjective: count - action - be
  };
}

function pickPracticeQuestions(count) {
  const quotas = getQuestionQuotas(count);
  const buckets = Object.fromEntries(
    Object.entries(quotas).map(([type, quota]) => [
      type,
      shuffle(QUESTIONS.filter((question) => question.type === type)).slice(0, quota)
    ])
  );
  const mixed = [];
  let previousType = "";

  while (mixed.length < count) {
    const availableTypes = Object.keys(buckets).filter((type) => buckets[type].length > 0);
    const choices = availableTypes.filter((type) => type !== previousType);
    const pool = choices.length ? choices : availableTypes;
    const nextType = pool[Math.floor(Math.random() * pool.length)];
    mixed.push(buckets[nextType].pop());
    previousType = nextType;
  }

  return mixed;
}

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
  const progress = getProgress();
  el.menuProgress.textContent = `${progress}/${QUESTIONS.length}`;

  if (progress >= QUESTIONS.length) {
    el.menuCoachLine.textContent = "Lesson 01 已完成，可以挑戰滿分。";
  } else if (state.bestStreak >= 8) {
    el.menuCoachLine.textContent = `最佳連勝 ${state.bestStreak} 題，節奏好穩。`;
  } else {
    el.menuCoachLine.textContent = "今日由句子分析開始。";
  }
}

function showScreen(screen) {
  el.menuScreen.classList.toggle("active", screen === "menu");
  el.lessonScreen.classList.toggle("active", screen === "lesson");
  el.resultScreen.classList.toggle("active", screen === "result");
}

function updateLessonChrome() {
  const reviewing = state.mode === "review";
  el.lessonKicker.textContent = reviewing ? "Mistake Review" : "Lesson 01";
  el.lessonTitle.textContent = reviewing ? "錯題重練" : "分辨句子是否有動作動詞";
  el.resultKicker.textContent = reviewing ? "Mistake Review Result" : "Lesson 01 Result";
}

function updateLiveStats() {
  el.liveScore.textContent = String(state.score);
  el.liveTotal.textContent = String(state.questions.length);
  el.liveStreak.textContent = String(state.streak);
  el.bestStreak.textContent = String(state.bestStreak);
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
  return state.questions[state.index] || null;
}

function questionHasVerb(question) {
  return question.type === "action";
}

function getVerbChoiceExplanation(question, pickedHasActionVerb) {
  if (question.type === "action") {
    return `${question.note} 所以呢句有動作動詞，應該按 TICK。`;
  }

  if (question.type === "be") {
    return `「${question.zh}」入面中文「是」用來連接主語和身份，不是動作動詞，所以應該先按 CROSS。`;
  }

  if (pickedHasActionVerb) {
    return `「${question.zh}」是形容詞句，是在形容主語，沒有動作動詞，所以應該先按 CROSS。`;
  }

  return "再睇一次句子類型，先分清楚有沒有動作動詞。";
}

function getBeRuleExplanation(question) {
  if (!question.subjectZh || !question.subjectEn || !question.subjectRole || !question.pronoun) {
    return `主語要配 ${question.beForm}。`;
  }

  return `因為主語是${question.subjectZh}（英文是 ${question.subjectEn}），即是${question.subjectRole}（${question.pronoun}），所以應該用 ${question.beForm}。`;
}

function getNeedsBeExplanation(question) {
  const sentenceType = question.type === "be" ? "「是」句" : "形容詞句";
  return `${sentenceType}英文要用 be verb。${getBeRuleExplanation(question)}`;
}

function getWrongBeFormExplanation(question, pickedForm) {
  return `你揀咗 ${pickedForm}，但${getBeRuleExplanation(question)}`;
}

function prepareRun(mode, questions) {
  state.mode = mode;
  state.index = 0;
  state.score = 0;
  state.mistakes = 0;
  state.questionMistakes = 0;
  state.streak = 0;
  state.missedQuestionIds = [];
  state.resolved = false;
  state.questions = questions;
  updateLessonChrome();
  updateLiveStats();
  showScreen("lesson");
  renderQuestion();
  playUiSound("start");
}

function startLesson() {
  prepareRun("practice", pickPracticeQuestions(state.practiceCount));
}

function startMistakeReview() {
  if (!state.reviewQuestions.length) return;
  prepareRun("review", shuffle(state.reviewQuestions));
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
  state.questionMistakes = 0;
  el.questionNumber.textContent = String(state.index + 1);
  el.questionTotal.textContent = String(state.questions.length);
  updateLiveStats();
  el.stepLabel.textContent = "中文句子";
  el.categoryPill.textContent = CATEGORY_LABELS[question.type];
  el.categoryPill.dataset.type = question.type;
  el.chinesePrompt.textContent = question.zh;
  el.guidance.textContent = "分析句子有沒有動作動詞：有就 TICK，冇就 CROSS。";
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
    if (state.questionMistakes === 0) {
      state.score += 1;
      state.streak += 1;
      if (state.streak > state.bestStreak) {
        state.bestStreak = state.streak;
        saveBestStreak();
      }
    }
    if (state.mode === "practice") {
      saveProgress(state.index + 1);
    }
    updateLiveStats();
  }

  showOnlyChoice("");
  el.guidance.textContent = "英文句子已解鎖，按一下可以聽讀音。";
  el.englishText.textContent = question.english;
  el.englishCard.classList.remove("hidden");
  el.nextBtn.classList.remove("hidden");
  setFeedback(message || "正確！", "success");
  playUiSound("correct");
}

function recordWrong(message) {
  const question = currentQuestion();
  if (state.questionMistakes === 0) {
    state.streak = 0;
  }
  if (question && !state.missedQuestionIds.includes(question.id)) {
    state.missedQuestionIds.push(question.id);
  }
  state.mistakes += 1;
  state.questionMistakes += 1;
  updateLiveStats();
  setFeedback(message, "error");
  playUiSound("wrong");
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
    recordWrong(getVerbChoiceExplanation(question, hasVerbChoice));
    return;
  }

  if (question.type === "action") {
    completeQuestion(`正確，${question.note}`);
    return;
  }

  el.stepLabel.textContent = "Be verb check";
  el.guidance.textContent = question.type === "be"
    ? "中文「是」不當動作動詞，英文要不要用 is / am / are？"
    : "中文形容詞句沒有動作動詞，英文要不要補 is / am / are？";
  showOnlyChoice("needsBe");
  setFeedback(question.type === "be" ? "正確，「是」句先按 CROSS。" : "正確，呢句中文沒有動作動詞。", "success");
  playUiSound("step");
}

function answerNeedsBe(choice) {
  const question = currentQuestion();
  if (!question || !["be", "adjective"].includes(question.type) || state.resolved) return;

  const needsBeChoice = choice === "true";
  if (!needsBeChoice) {
    recordWrong(getNeedsBeExplanation(question));
    return;
  }

  askBeForm(question.type === "be" ? "正確，「是」句英文要用 be verb。" : "正確，形容詞句英文要補 be verb。");
}

function answerBeForm(form) {
  const question = currentQuestion();
  if (!question || state.resolved) return;

  if (form !== question.beForm) {
    recordWrong(getWrongBeFormExplanation(question, form));
    return;
  }

  completeQuestion(`正確，${getBeRuleExplanation(question)}`);
}

function nextQuestion() {
  cancelSpeech();
  const wasLastQuestion = state.index >= state.questions.length - 1;
  state.index += 1;
  renderQuestion();
  playUiSound(wasLastQuestion ? "complete" : "next");
}

function renderComplete() {
  const total = state.questions.length;
  const percent = total ? Math.round((state.score / total) * 100) : 0;
  state.reviewQuestions = state.questions.filter((question) => state.missedQuestionIds.includes(question.id));

  if (state.mode === "practice") {
    saveProgress(total);
  }

  updateLessonChrome();
  updateLiveStats();
  el.resultScore.textContent = `${state.score}/${total}`;
  el.resultTotal.textContent = String(total);
  el.resultMistakes.textContent = String(state.mistakes);
  el.resultPercent.textContent = `${percent}%`;
  el.resultMessage.textContent = getResultMessage(percent, state.mistakes, state.mode);
  renderReviewSummary();
  showScreen("result");
}

function renderReviewSummary() {
  el.reviewSummary.replaceChildren();
  const hasReviewQuestions = state.reviewQuestions.length > 0;

  el.reviewSummary.classList.toggle("hidden", !hasReviewQuestions);
  el.reviewMistakesBtn.classList.toggle("hidden", !hasReviewQuestions);
  el.reviewMistakesBtn.textContent = hasReviewQuestions
    ? `重練 ${state.reviewQuestions.length} 條錯題`
    : "重練錯題";

  if (!hasReviewQuestions) return;

  state.reviewQuestions.slice(0, 6).forEach((question) => {
    const chip = document.createElement("span");
    chip.textContent = question.zh;
    el.reviewSummary.append(chip);
  });

  if (state.reviewQuestions.length > 6) {
    const chip = document.createElement("span");
    chip.textContent = `+${state.reviewQuestions.length - 6}`;
    el.reviewSummary.append(chip);
  }
}

function getResultMessage(percent, mistakes, mode) {
  if (mode === "review" && mistakes === 0) return "錯題已清晒，返去挑戰新一輪。";
  if (mode === "review") return "差少少，再重練今輪錯題就得。";
  if (percent === 100 && mistakes === 0) return "滿分！你第一次就全部答啱。";
  if (percent >= 80) return "好穩陣！再玩一次可以挑戰更高準確率。";
  if (percent >= 60) return "有進步空間，留意形容詞句要補 be verb。";
  return "慢慢嚟，先分清動作動詞、「是」同形容詞句。";
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
document.querySelector("[data-result-menu]").addEventListener("click", backToMenu);
document.querySelector("[data-restart-lesson]").addEventListener("click", startLesson);
el.reviewMistakesBtn.addEventListener("click", startMistakeReview);
el.nextBtn.addEventListener("click", nextQuestion);
el.restartBtn.addEventListener("click", startLesson);
el.englishCard.addEventListener("click", speakCurrentEnglish);
el.soundToggle.addEventListener("click", toggleSound);
el.practiceCountInput.addEventListener("input", updatePracticeCount);

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
syncPracticeCount();
syncSoundToggle();
updateLiveStats();
