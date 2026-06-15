const GRAMMAR_DATA = window.GrammarData;
if (!GRAMMAR_DATA) {
  throw new Error("GrammarData failed to load.");
}

const {
  QUESTIONS,
  PRONOUN_CATEGORIES,
  PRONOUN_MATCH_QUESTIONS,
  PRONOUN_SENTENCE_ROLE_LABELS,
  PRONOUN_SENTENCE_FORMS,
  VERB_TABLE_FIELDS,
  LESSON1_ID,
  LESSON2_ID,
  QUIZ1_ID,
  SENTENCE_UNDERLINE_ID,
  PRONOUN_MATCH_ID,
  PRONOUN_SENTENCE_ID,
  COUNTABLE_NOUN_ID,
  VERB_TABLE_ID,
  LESSON_PROGRESS_KEYS,
  LESSONS,
  capitalizeWord
} = GRAMMAR_DATA;

const SOUND_KEY = "basic_grammar_sound_enabled_v1";
const PRACTICE_COUNT_KEY = "basic_grammar_practice_count_v1";
const BEST_STREAK_KEY = "basic_grammar_best_streak_v1";
const CATEGORY_LABELS = {
  action: "動作動詞",
  be: "「是」句",
  adjective: "形容詞句"
};
const UNDERLINE_COLOR_COUNT = 4;
const OPTIONAL_UNDERLINE_CONNECTORS = new Set(["and", "but", "so", "or", "that"]);
const PRONOUN_AUTO_ADVANCE_MS = 1350;
const PRONOUN_GRAND_ADVANCE_MS = 2600;
const PRONOUN_DISTRACTOR_COUNT = 2;
const FIREWORK_COLORS = ["#ff6b6b", "#ffe66d", "#4ecdc4", "#6bf178", "#74c0fc", "#f783ac"];
const QUESTION_WEIGHTS = {
  action: 0.5,
  be: 0.3,
  adjective: 0.2
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
  pronounPlace1: [
    { frequency: 523.25, delay: 0, duration: 0.065 }
  ],
  pronounPlace2: [
    { frequency: 659.25, delay: 0, duration: 0.065 }
  ],
  pronounPlace3: [
    { frequency: 783.99, delay: 0, duration: 0.07 }
  ],
  pronounPlace4: [
    { frequency: 987.77, delay: 0, duration: 0.08 },
    { frequency: 1174.66, delay: 0.075, duration: 0.07 }
  ],
  pronounRowWin: [
    { frequency: 783.99, delay: 0, duration: 0.07 },
    { frequency: 987.77, delay: 0.08, duration: 0.07 },
    { frequency: 1318.51, delay: 0.16, duration: 0.1 },
    { frequency: 1567.98, delay: 0.28, duration: 0.16 }
  ],
  pronounGrandWin: [
    { frequency: 523.25, delay: 0, duration: 0.08 },
    { frequency: 659.25, delay: 0.08, duration: 0.08 },
    { frequency: 783.99, delay: 0.16, duration: 0.08 },
    { frequency: 1046.5, delay: 0.24, duration: 0.1 },
    { frequency: 1318.51, delay: 0.36, duration: 0.12 },
    { frequency: 1567.98, delay: 0.5, duration: 0.18 },
    { frequency: 2093, delay: 0.7, duration: 0.22, gain: 0.12 }
  ],
  complete: [
    { frequency: 523.25, delay: 0, duration: 0.07 },
    { frequency: 659.25, delay: 0.08, duration: 0.07 },
    { frequency: 783.99, delay: 0.16, duration: 0.07 },
    { frequency: 1046.5, delay: 0.24, duration: 0.16 }
  ]
};
const UI_SOUND_GAIN = 0.098;
const VERB_TABLE_REFERENCE_SPEAK_GAP_MS = 180;
const VERB_TABLE_REFERENCE_MIN_ACTIVE_MS = 700;
const VERB_TABLE_IMAGE_VERSION = "20260613-lite";

let audioContext = null;
let celebrationAnimation = null;
let celebrationHideTimer = 0;
let verbTableReferenceRendered = false;
let activeVerbTableReferenceAudio = null;
let activeVerbTableReferenceAudioToken = 0;
let activeTextEntryTarget = "";

const state = {
  lessonId: LESSON1_ID,
  mode: "practice",
  index: 0,
  score: 0,
  mistakes: 0,
  questionMistakes: 0,
  resolved: false,
  questions: [],
  missedQuestionIds: [],
  reviewQuestions: [],
  selectedVerbIndexes: [],
  selectedUnderlineColor: 0,
  underlineDragActive: false,
  underlineDragIndexes: [],
  pronounMatches: {},
  pronounWordTexts: {},
  pronounWrongSlots: [],
  selectedPronounWordId: "",
  selectedPronounSlotKey: "",
  pronounAutoAdvanceTimer: 0,
  verbTableWrongSlots: [],
  verbTableSubmitState: "",
  verbTableActiveField: "present",
  streak: 0,
  bestStreak: getSavedBestStreak(),
  practiceCount: getSavedPracticeCount(),
  soundEnabled: getSavedSoundEnabled()
};

const el = {
  appShell: document.querySelector("#app-shell"),
  appTabBar: document.querySelector("#app-tab-bar"),
  appTabs: [...document.querySelectorAll("[data-app-tab]")],
  menuScreen: document.querySelector("#menu-screen"),
  vocabScreen: document.querySelector("#vocab-screen"),
  scanScreen: document.querySelector("#scan-screen"),
  lessonScreen: document.querySelector("#lesson-screen"),
  resultScreen: document.querySelector("#result-screen"),
  menuProgressLesson1: document.querySelector("#menu-progress-lesson1"),
  menuProgressLesson2: document.querySelector("#menu-progress-lesson2"),
  menuProgressQuiz1: document.querySelector("#menu-progress-quiz1"),
  menuProgressSentenceUnderline: document.querySelector("#menu-progress-sentence-underline"),
  menuProgressPronounMatch: document.querySelector("#menu-progress-pronoun-match"),
  menuProgressPronounSentence: document.querySelector("#menu-progress-pronoun-sentence"),
  menuProgressCountableNouns: document.querySelector("#menu-progress-countable-nouns"),
  menuProgressVerbTable: document.querySelector("#menu-progress-verb-table"),
  openVerbTableReferenceBtn: document.querySelector("#open-verb-table-reference"),
  verbTableReferenceModal: document.querySelector("#verb-table-reference-modal"),
  verbTableReferenceSearch: document.querySelector("#verb-table-reference-search"),
  verbTableReferenceSearchToggle: document.querySelector("#verb-table-reference-search-toggle"),
  verbTableReferenceKeyboard: document.querySelector("#verb-table-reference-keyboard"),
  verbTableReferenceCount: document.querySelector("#verb-table-reference-count"),
  verbTableReferenceBody: document.querySelector("#verb-table-reference-body"),
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
  verbTableVisual: document.querySelector("#verb-table-visual"),
  verbTableImage: document.querySelector("#verb-table-image"),
  guidance: document.querySelector("#guidance"),
  ruleCard: document.querySelector("#rule-card"),
  verbChoice: document.querySelector("#verb-choice"),
  beNeedChoice: document.querySelector("#be-need-choice"),
  beFormChoice: document.querySelector("#be-form-choice"),
  judgmentChoice: document.querySelector("#judgment-choice"),
  verbCountChoice: document.querySelector("#verb-count-choice"),
  verbTokenChoice: document.querySelector("#verb-token-choice"),
  verbTokenGrid: document.querySelector("#verb-token-grid"),
  submitVerbsBtn: document.querySelector("#submit-verbs-btn"),
  countableCorrectionChoice: document.querySelector("#countable-correction-choice"),
  countableCorrectionInput: document.querySelector("#countable-correction-input"),
  countableCorrectionKeyboard: document.querySelector("#countable-correction-keyboard"),
  submitCountableCorrectionBtn: document.querySelector("#submit-countable-correction-btn"),
  sentenceBuilderChoice: document.querySelector("#sentence-builder-choice"),
  sentenceSlots: document.querySelector("#sentence-slots"),
  wordBank: document.querySelector("#word-bank"),
  resetBuilderBtn: document.querySelector("#reset-builder-btn"),
  confirmBuilderBtn: document.querySelector("#confirm-builder-btn"),
  sentenceUnderlineChoice: document.querySelector("#sentence-underline-choice"),
  underlineBoard: document.querySelector("#chinese-prompt"),
  underlinePalette: document.querySelector("#underline-palette"),
  resetUnderlineBtn: document.querySelector("#reset-underline-btn"),
  confirmUnderlineBtn: document.querySelector("#confirm-underline-btn"),
  pronounMatchChoice: document.querySelector("#pronoun-match-choice"),
  pronounMatchBoard: document.querySelector("#pronoun-match-board"),
  pronounWordBank: document.querySelector("#pronoun-word-bank"),
  resetPronounBtn: document.querySelector("#reset-pronoun-btn"),
  confirmPronounBtn: document.querySelector("#confirm-pronoun-btn"),
  pronounSentenceChoice: document.querySelector("#pronoun-sentence-choice"),
  verbTableChoice: document.querySelector("#verb-table-choice"),
  verbTableSlots: document.querySelector("#verb-table-slots"),
  verbTableKeyboard: document.querySelector("#verb-table-keyboard"),
  resetVerbTableBtn: document.querySelector("#reset-verb-table-btn"),
  confirmVerbTableBtn: document.querySelector("#confirm-verb-table-btn"),
  celebrationLayer: document.querySelector("#celebration-layer"),
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

function getMaxPracticeCount() {
  return Math.max(...Object.values(LESSONS).map((lesson) => lesson.questions.length));
}

function getSavedPracticeCount() {
  try {
    const rawValue = localStorage.getItem(PRACTICE_COUNT_KEY);
    if (rawValue === null) return 20;

    const saved = Number(rawValue);
    if (Number.isFinite(saved)) {
      return Math.max(10, Math.min(getMaxPracticeCount(), saved));
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
  el.practiceCountInput.max = String(getMaxPracticeCount());
  el.practiceCountInput.value = String(state.practiceCount);
  el.practiceCountOutput.textContent = `${state.practiceCount} 題`;
}

function updatePracticeCount() {
  state.practiceCount = Number(el.practiceCountInput.value);
  savePracticeCount();
  syncPracticeCount();
}

function shuffle(items) {
  if (window.GrammarCore?.shuffleItems) {
    return window.GrammarCore.shuffleItems(items);
  }
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function getQuestionQuotas(count) {
  if (window.GrammarCore?.getQuestionQuotas) {
    return window.GrammarCore.getQuestionQuotas(count, QUESTIONS, QUESTION_WEIGHTS);
  }
  const types = Object.keys(QUESTION_WEIGHTS);
  const availableCounts = Object.fromEntries(
    types.map((type) => [type, QUESTIONS.filter((question) => question.type === type).length])
  );
  const quotas = Object.fromEntries(types.map((type) => [type, 0]));
  const weightedTypes = types.map((type) => {
    const exactQuota = count * QUESTION_WEIGHTS[type];
    const baseQuota = Math.min(availableCounts[type], Math.floor(exactQuota));
    quotas[type] = baseQuota;
    return {
      type,
      remainder: exactQuota - baseQuota
    };
  });
  let assigned = Object.values(quotas).reduce((total, quota) => total + quota, 0);

  while (assigned < count) {
    const nextType = weightedTypes
      .filter(({ type }) => quotas[type] < availableCounts[type])
      .sort((left, right) => {
        if (right.remainder !== left.remainder) return right.remainder - left.remainder;
        return QUESTION_WEIGHTS[right.type] - QUESTION_WEIGHTS[left.type];
      })[0]?.type;

    if (!nextType) break;
    quotas[nextType] += 1;
    assigned += 1;
  }

  return quotas;
}

function pickPracticeQuestions(count) {
  if (window.GrammarCore?.pickWeightedQuestions) {
    return window.GrammarCore.pickWeightedQuestions(count, QUESTIONS, QUESTION_WEIGHTS);
  }
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

function pickQuestionsForLesson(lessonId, count) {
  if (window.GrammarCore?.pickLessonQuestions) {
    return window.GrammarCore.pickLessonQuestions(lessonId, count, LESSONS, {
      fallbackLessonId: LESSON1_ID,
      weightedLessonId: LESSON1_ID,
      weights: QUESTION_WEIGHTS
    });
  }
  const lesson = LESSONS[lessonId] || LESSONS[LESSON1_ID];
  const cappedCount = Math.min(count, lesson.questions.length);

  if (lessonId === LESSON1_ID) {
    return pickPracticeQuestions(cappedCount);
  }

  return shuffle(lesson.questions).slice(0, cappedCount);
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
  const wasEnabled = state.soundEnabled;
  if (wasEnabled) {
    playUiSound("step");
  }

  state.soundEnabled = !state.soundEnabled;
  saveSoundEnabled();
  syncSoundToggle();
  if (!wasEnabled && state.soundEnabled) {
    playUiSound("start");
  }
}

function getAudioContext() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return null;

  if (!audioContext) {
    audioContext = new AudioContextConstructor();
  }

  return audioContext;
}

function resumeAudioContext(context) {
  if (!context || context.state !== "suspended") {
    return Promise.resolve(context?.state !== "closed");
  }

  try {
    const resumeResult = context.resume();
    if (resumeResult && typeof resumeResult.then === "function") {
      return resumeResult
        .then(() => context.state !== "suspended" && context.state !== "closed")
        .catch(() => false);
    }
  } catch (_error) {
    return Promise.resolve(false);
  }

  return Promise.resolve(context.state !== "suspended" && context.state !== "closed");
}

function scheduleUiSound(context, pattern) {
  if (!context || context.state === "closed") return;

  const now = context.currentTime + 0.01;
  pattern.forEach((note) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = now + note.delay;
    const endAt = startAt + note.duration;

    oscillator.type = note.type || "triangle";
    oscillator.frequency.setValueAtTime(note.frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(note.gain || UI_SOUND_GAIN, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(endAt + 0.02);
  });
}

function playUiSound(kind) {
  if (!state.soundEnabled) return;

  const context = getAudioContext();
  const pattern = SOUND_PATTERNS[kind];
  if (!context || !pattern) return;

  if (context.state === "suspended") {
    resumeAudioContext(context).then((resumed) => {
      if (resumed) {
        scheduleUiSound(context, pattern);
      }
    });
    return;
  }

  scheduleUiSound(context, pattern);
}

function unlockAudio() {
  if (!state.soundEnabled) return;

  const context = getAudioContext();
  if (context?.state === "suspended") {
    resumeAudioContext(context);
  }
}

function currentLesson() {
  return LESSONS[state.lessonId] || LESSONS[LESSON1_ID];
}

function getLessonTotal(lessonId) {
  return LESSONS[lessonId]?.questions.length || 0;
}

function getProgress(lessonId = state.lessonId) {
  try {
    const saved = JSON.parse(localStorage.getItem(LESSON_PROGRESS_KEYS[lessonId]) || "{}");
    return Math.max(0, Math.min(getLessonTotal(lessonId), Number(saved.completed) || 0));
  } catch (_error) {
    return 0;
  }
}

function saveProgress(completed, lessonId = state.lessonId) {
  const total = getLessonTotal(lessonId);
  const previousCompleted = getProgress(lessonId);
  const nextCompleted = window.GrammarCore?.getNextProgress
    ? window.GrammarCore.getNextProgress(completed, total, previousCompleted)
    : Math.max(previousCompleted, Math.min(total, completed));
  localStorage.setItem(LESSON_PROGRESS_KEYS[lessonId], JSON.stringify({
    completed: nextCompleted,
    total,
    updatedAt: Date.now()
  }));
  updateMenuProgress();
}

function updateMenuProgress() {
  const lesson1Progress = getProgress(LESSON1_ID);
  const lesson2Progress = getProgress(LESSON2_ID);
  const quiz1Progress = getProgress(QUIZ1_ID);
  const underlineProgress = getProgress(SENTENCE_UNDERLINE_ID);
  const pronounProgress = getProgress(PRONOUN_MATCH_ID);
  const pronounSentenceProgress = getProgress(PRONOUN_SENTENCE_ID);
  const countableProgress = getProgress(COUNTABLE_NOUN_ID);
  const verbTableProgress = getProgress(VERB_TABLE_ID);
  el.menuProgressLesson1.textContent = `${lesson1Progress}/${getLessonTotal(LESSON1_ID)}`;
  el.menuProgressLesson2.textContent = `${lesson2Progress}/${getLessonTotal(LESSON2_ID)}`;
  el.menuProgressQuiz1.textContent = `${quiz1Progress}/${getLessonTotal(QUIZ1_ID)}`;
  el.menuProgressSentenceUnderline.textContent = `${underlineProgress}/${getLessonTotal(SENTENCE_UNDERLINE_ID)}`;
  el.menuProgressPronounMatch.textContent = `${pronounProgress}/${getLessonTotal(PRONOUN_MATCH_ID)}`;
  el.menuProgressPronounSentence.textContent = `${pronounSentenceProgress}/${getLessonTotal(PRONOUN_SENTENCE_ID)}`;
  el.menuProgressCountableNouns.textContent = `${countableProgress}/${getLessonTotal(COUNTABLE_NOUN_ID)}`;
  el.menuProgressVerbTable.textContent = `${verbTableProgress}/${getLessonTotal(VERB_TABLE_ID)}`;

  if (verbTableProgress >= getLessonTotal(VERB_TABLE_ID)) {
    el.menuCoachLine.textContent = "Lesson 07 已完成，Verb Table 四式記得好穩。";
  } else if (countableProgress >= getLessonTotal(COUNTABLE_NOUN_ID)) {
    el.menuCoachLine.textContent = "Lesson 06 已完成，可以挑戰 Lesson 07 Verb Table。";
  } else if (pronounSentenceProgress >= getLessonTotal(PRONOUN_SENTENCE_ID)) {
    el.menuCoachLine.textContent = "Lesson 05 已完成，可以挑戰 Lesson 06 可數名詞。";
  } else if (pronounProgress >= getLessonTotal(PRONOUN_MATCH_ID)) {
    el.menuCoachLine.textContent = "Lesson 04 已完成，可以挑戰 Lesson 05 代名詞句子 MC。";
  } else if (underlineProgress >= getLessonTotal(SENTENCE_UNDERLINE_ID)) {
    el.menuCoachLine.textContent = "Lesson 03 已完成，可以挑戰 Lesson 04 代名詞。";
  } else if (quiz1Progress >= getLessonTotal(QUIZ1_ID)) {
    el.menuCoachLine.textContent = "Quiz 1 已完成，可以再挑戰更快砌句子。";
  } else if (lesson2Progress >= getLessonTotal(LESSON2_ID)) {
    el.menuCoachLine.textContent = "Lesson 02 已完成，可以挑戰 Quiz 1。";
  } else if (lesson1Progress >= getLessonTotal(LESSON1_ID)) {
    el.menuCoachLine.textContent = "Lesson 01 已完成，可以挑戰 Lesson 02。";
  } else if (state.bestStreak >= 8) {
    el.menuCoachLine.textContent = `最佳連勝 ${state.bestStreak} 題，節奏好穩。`;
  } else {
    el.menuCoachLine.textContent = "今日由句子分析開始。";
  }
}

function getScreenForTab(tabName) {
  if (tabName === "vocab") return "vocab";
  if (tabName === "scan") return "scan";
  return "menu";
}

function updateAppTabs(activeTab, focusMode) {
  el.appShell?.classList.toggle("focus-mode", focusMode);
  el.appTabBar?.classList.toggle("hidden", focusMode);
  el.appTabs.forEach((button) => {
    const isActive = button.dataset.appTab === activeTab;
    button.classList.toggle("active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function showScreen(screen, options = {}) {
  const activeTab = options.activeTab || (["vocab", "scan"].includes(screen) ? screen : "grammar");
  const focusMode = screen === "lesson" || screen === "result";
  el.menuScreen.classList.toggle("active", screen === "menu");
  el.vocabScreen.classList.toggle("active", screen === "vocab");
  el.scanScreen.classList.toggle("active", screen === "scan");
  el.lessonScreen.classList.toggle("active", screen === "lesson");
  el.resultScreen.classList.toggle("active", screen === "result");
  updateAppTabs(activeTab, focusMode);
}

function switchAppTab(tabName) {
  clearPronounAutoAdvance();
  clearCelebration();
  cancelSpeech();
  deactivateTextEntryTarget();
  setVerbTableKeyboardDocked(false);
  closeVerbTableReference();
  showScreen(getScreenForTab(tabName), { activeTab: tabName });
  playUiSound("next");
}

function updateLessonChrome() {
  const lesson = currentLesson();
  const reviewing = state.mode === "review";
  el.lessonKicker.textContent = reviewing ? "Mistake Review" : lesson.kicker;
  el.lessonTitle.textContent = reviewing ? "錯題重練" : lesson.title;
  el.resultKicker.textContent = reviewing ? "Mistake Review Result" : `${lesson.kicker} Result`;
}

function updateLiveStats() {
  el.liveScore.textContent = String(state.score);
  el.liveTotal.textContent = String(state.questions.length);
  el.liveStreak.textContent = String(state.streak);
  el.bestStreak.textContent = String(state.bestStreak);
}

function setFeedback(message = "", type = "") {
  el.feedback.className = `feedback${type ? ` ${type}` : ""}`;
  el.feedback.replaceChildren();

  if (Array.isArray(message)) {
    message.forEach((part) => {
      const line = document.createElement("span");
      line.className = `feedback-line${part.className ? ` ${part.className}` : ""}`;
      line.textContent = part.text;
      el.feedback.append(line);
    });
    return;
  }

  el.feedback.textContent = message;
}

function showOnlyChoice(choice) {
  el.verbChoice.classList.toggle("hidden", choice !== "verb");
  el.beNeedChoice.classList.toggle("hidden", choice !== "needsBe");
  el.beFormChoice.classList.toggle("hidden", choice !== "beForm");
  el.judgmentChoice.classList.toggle("hidden", choice !== "judgment");
  el.verbCountChoice.classList.toggle("hidden", choice !== "verbCount");
  el.verbTokenChoice.classList.toggle("hidden", choice !== "verbTokens");
  el.countableCorrectionChoice.classList.toggle("hidden", choice !== "countableCorrection");
  el.sentenceBuilderChoice.classList.toggle("hidden", choice !== "builder");
  el.sentenceUnderlineChoice.classList.toggle("hidden", choice !== "underline");
  el.pronounMatchChoice.classList.toggle("hidden", choice !== "pronoun");
  el.pronounSentenceChoice.classList.toggle("hidden", choice !== "pronounSentence");
  el.verbTableChoice.classList.toggle("hidden", choice !== "verbTable");

  if (choice !== "countableCorrection" && activeTextEntryTarget === "countable") {
    deactivateTextEntryTarget("countable");
  }
}

function isLikelyPhoneOrTablet() {
  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const touchPoints = navigator.maxTouchPoints || 0;
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const iPadLike = /Macintosh/.test(userAgent) && touchPoints > 1;
  return /Android|webOS|iPhone|iPad|iPod|Mobile|Tablet/i.test(userAgent)
    || /iPad|iPhone|iPod/i.test(platform)
    || iPadLike
    || (hasCoarsePointer && !hasFinePointer);
}

function isComputerKeyboardMode() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches && !isLikelyPhoneOrTablet();
}

function getTextEntryValue(field) {
  return field?.dataset.value || "";
}

function setTextEntryValue(field, value) {
  if (!field) return;

  const nextValue = String(value || "");
  field.dataset.value = nextValue;
  field.textContent = nextValue;
  field.classList.toggle("is-placeholder", !nextValue);
  field.setAttribute("aria-valuetext", nextValue || field.dataset.placeholder || "");
}

function getTextEntryConfig(targetName = activeTextEntryTarget) {
  const configs = {
    countable: {
      field: el.countableCorrectionInput,
      keyboard: el.countableCorrectionKeyboard,
      keys: [
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        ["z", "x", "c", "v", "b", "n", "m", "backspace"],
        ["space", ".", "enter"]
      ],
      labels: {
        backspace: "⌫",
        enter: "確認",
        space: "Space"
      },
      maxLength: 80,
      onChange: () => setFeedback(),
      onEnter: submitCountableCorrection
    },
    verbReference: {
      field: el.verbTableReferenceSearch,
      keyboard: el.verbTableReferenceKeyboard,
      keys: [
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        ["z", "x", "c", "v", "b", "n", "m", "/", "backspace"],
        ["space", "clear", "enter"]
      ],
      labels: {
        backspace: "⌫",
        clear: "清空",
        enter: "完成",
        space: "Space"
      },
      maxLength: 36,
      onChange: renderVerbTableReferenceRows,
      onEnter: hideVerbTableReferenceSearchKeyboard
    }
  };

  return configs[targetName] || null;
}

function buildTextGameKeyboard(targetName) {
  const config = getTextEntryConfig(targetName);
  if (!config?.keyboard || config.keyboard.dataset.built === "true") return;

  config.keyboard.replaceChildren();
  config.keys.forEach((rowKeys) => {
    const row = document.createElement("div");
    row.className = "verb-table-key-row";

    rowKeys.forEach((keyValue) => {
      const button = document.createElement("button");
      button.className = "verb-table-key";
      button.type = "button";
      button.dataset.textKeyboardKey = keyValue;
      button.textContent = config.labels[keyValue] || keyValue.toUpperCase();

      if (keyValue === "backspace") button.classList.add("verb-table-key-backspace");
      if (keyValue === "enter") button.classList.add("verb-table-key-enter");
      if (keyValue === "space") button.classList.add("text-key-space");
      if (keyValue === "clear") button.classList.add("text-key-clear");

      button.addEventListener("click", () => handleTextKeyboardKey(targetName, keyValue));
      row.append(button);
    });

    config.keyboard.append(row);
  });

  config.keyboard.dataset.built = "true";
}

function setTextEntryKeyboardVisible(targetName, visible) {
  const config = getTextEntryConfig(targetName);
  if (!config?.keyboard) return;

  buildTextGameKeyboard(targetName);
  config.keyboard.classList.toggle("hidden", !visible);
  const isLessonKeyboard = targetName === "countable";
  if (isLessonKeyboard) {
    el.lessonScreen.classList.toggle("keyboard-docked", visible);
  }
}

function deactivateTextEntryTarget(targetName = activeTextEntryTarget) {
  const config = getTextEntryConfig(targetName);
  if (config?.field) {
    config.field.classList.remove("is-active");
  }
  if (targetName) {
    setTextEntryKeyboardVisible(targetName, false);
  }
  if (!targetName || activeTextEntryTarget === targetName) {
    activeTextEntryTarget = "";
  }
  updateTextEntryToggleLabels();
}

function activateTextEntryTarget(targetName, options = {}) {
  const config = getTextEntryConfig(targetName);
  if (!config?.field) return;

  if (activeTextEntryTarget && activeTextEntryTarget !== targetName) {
    deactivateTextEntryTarget(activeTextEntryTarget);
  }

  activeTextEntryTarget = targetName;
  buildTextGameKeyboard(targetName);
  config.field.classList.add("is-active");
  setTextEntryKeyboardVisible(targetName, options.showKeyboard ?? !isComputerKeyboardMode());
  updateTextEntryToggleLabels();
}

function setVerbTableKeyboardDocked(visible) {
  el.verbTableKeyboard?.classList.toggle("hidden", !visible);
  el.lessonScreen.classList.toggle("keyboard-docked", visible);
}

function updateTextEntryToggleLabels() {
  if (el.verbTableReferenceSearchToggle) {
    el.verbTableReferenceSearchToggle.textContent = activeTextEntryTarget === "verbReference" ? "完成" : "搜尋";
  }
}

function formatTextEntryCharacter(targetName, value, currentValue) {
  if (targetName !== "countable") return value;
  if (window.GrammarCore?.formatSentenceInputCharacter) {
    return window.GrammarCore.formatSentenceInputCharacter(value, currentValue);
  }
  if (!/^[a-z]$/.test(value)) return value;
  const trimmed = String(currentValue || "").replace(/\s+$/g, "");
  return !trimmed || /[.!?]$/.test(trimmed) ? value.toUpperCase() : value;
}

function appendTextEntryValue(targetName, value) {
  const config = getTextEntryConfig(targetName);
  if (!config?.field) return;

  const currentValue = getTextEntryValue(config.field);
  if (currentValue.length >= config.maxLength) return;

  const nextCharacter = formatTextEntryCharacter(targetName, value, currentValue);
  setTextEntryValue(config.field, `${currentValue}${nextCharacter}`);
  config.onChange?.();
}

function backspaceTextEntryValue(targetName) {
  const config = getTextEntryConfig(targetName);
  if (!config?.field) return;

  const currentValue = getTextEntryValue(config.field);
  setTextEntryValue(config.field, currentValue.slice(0, -1));
  config.onChange?.();
}

function clearTextEntryValue(targetName) {
  const config = getTextEntryConfig(targetName);
  if (!config?.field) return;

  setTextEntryValue(config.field, "");
  config.onChange?.();
}

function handleTextKeyboardKey(targetName, keyValue) {
  activateTextEntryTarget(targetName, { showKeyboard: true });

  if (keyValue === "backspace") {
    backspaceTextEntryValue(targetName);
    playUiSound("next");
    return;
  }

  if (keyValue === "clear") {
    clearTextEntryValue(targetName);
    playUiSound("next");
    return;
  }

  if (keyValue === "enter") {
    getTextEntryConfig(targetName)?.onEnter?.();
    return;
  }

  appendTextEntryValue(targetName, keyValue === "space" ? " " : keyValue);
  playUiSound("step");
}

function handleTextEntryDocumentKeydown(event) {
  if (!activeTextEntryTarget || !isComputerKeyboardMode()) return false;

  const config = getTextEntryConfig(activeTextEntryTarget);
  if (!config?.field || state.resolved && activeTextEntryTarget === "countable") return false;

  if (event.key === "Escape") {
    event.preventDefault();
    deactivateTextEntryTarget(activeTextEntryTarget);
    return true;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    config.onEnter?.();
    return true;
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    backspaceTextEntryValue(activeTextEntryTarget);
    playUiSound("next");
    return true;
  }

  if (event.key === " ") {
    event.preventDefault();
    appendTextEntryValue(activeTextEntryTarget, " ");
    playUiSound("step");
    return true;
  }

  if (event.key.length === 1 && /^[a-zA-Z./]$/.test(event.key)) {
    event.preventDefault();
    appendTextEntryValue(activeTextEntryTarget, event.key.toLowerCase());
    playUiSound("step");
    return true;
  }

  return false;
}

function currentQuestion() {
  return state.questions[state.index] || null;
}

function clearPronounAutoAdvance() {
  if (!state.pronounAutoAdvanceTimer) return;

  clearTimeout(state.pronounAutoAdvanceTimer);
  state.pronounAutoAdvanceTimer = 0;
}

function clearCelebration() {
  if (celebrationHideTimer) {
    clearTimeout(celebrationHideTimer);
    celebrationHideTimer = 0;
  }
  if (celebrationAnimation) {
    celebrationAnimation.destroy();
    celebrationAnimation = null;
  }
  el.celebrationLayer?.classList.remove("active", "grand");
  el.celebrationLayer?.replaceChildren();
}

function launchCelebration(kind = "small") {
  if (!el.celebrationLayer) return;

  const grand = kind === "grand";
  clearCelebration();
  el.celebrationLayer.classList.add("active");
  el.celebrationLayer.classList.toggle("grand", grand);

  if (window.lottie && window.CONFETTI_LOTTIE_DATA) {
    const holder = document.createElement("div");
    holder.className = "lottie-confetti";
    el.celebrationLayer.append(holder);
    celebrationAnimation = window.lottie.loadAnimation({
      container: holder,
      renderer: "svg",
      loop: false,
      autoplay: true,
      animationData: JSON.parse(JSON.stringify(window.CONFETTI_LOTTIE_DATA)),
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
      }
    });
    celebrationAnimation.setSpeed(grand ? 1.04 : 1.22);
    celebrationAnimation.addEventListener("complete", clearCelebration);
    celebrationHideTimer = setTimeout(clearCelebration, grand ? 3600 : 1900);
    return;
  }

  const burstCount = grand ? 5 : 2;
  const sparksPerBurst = grand ? 18 : 12;
  const lifetime = grand ? 1250 : 900;
  const centers = Array.from({ length: burstCount }, (_, index) => ({
    x: 24 + ((index * 17) % 54) + Math.random() * 8,
    y: 28 + ((index * 11) % 30) + Math.random() * 6
  }));

  centers.forEach((center, burstIndex) => {
    Array.from({ length: sparksPerBurst }, (_, sparkIndex) => {
      const angle = (Math.PI * 2 * sparkIndex) / sparksPerBurst;
      const distance = (grand ? 88 : 56) + Math.random() * (grand ? 54 : 30);
      const spark = document.createElement("span");
      spark.className = `firework-spark${grand ? " grand" : ""}`;
      spark.style.setProperty("--x", `${center.x}%`);
      spark.style.setProperty("--y", `${center.y}%`);
      spark.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      spark.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
      spark.style.setProperty("--spark-size", `${grand ? 12 : 9}px`);
      spark.style.setProperty("--spark-color", FIREWORK_COLORS[(sparkIndex + burstIndex) % FIREWORK_COLORS.length]);
      el.celebrationLayer.append(spark);
      setTimeout(() => spark.remove(), lifetime);
    });
  });
  celebrationHideTimer = setTimeout(clearCelebration, lifetime + 120);
}

function questionHasVerb(question) {
  return window.GrammarCore?.questionHasVerb
    ? window.GrammarCore.questionHasVerb(question)
    : question.type === "action";
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

function prepareRun(mode, lessonId, questions) {
  clearPronounAutoAdvance();
  state.lessonId = lessonId;
  state.mode = mode;
  state.index = 0;
  state.score = 0;
  state.mistakes = 0;
  state.questionMistakes = 0;
  state.streak = 0;
  state.missedQuestionIds = [];
  state.selectedVerbIndexes = [];
  state.selectedUnderlineColor = 0;
  state.underlineDragActive = false;
  state.underlineDragIndexes = [];
  state.pronounMatches = {};
  state.pronounWordTexts = {};
  state.pronounWrongSlots = [];
  state.selectedPronounWordId = "";
  state.selectedPronounSlotKey = "";
  state.verbTableWrongSlots = [];
  state.verbTableSubmitState = "";
  state.resolved = false;
  state.questions = questions;
  updateLessonChrome();
  updateLiveStats();
  showScreen("lesson");
  renderQuestion();
  playUiSound("start");
}

function startLesson(lessonId = state.lessonId) {
  const nextLessonId = LESSONS[lessonId] ? lessonId : LESSON1_ID;
  prepareRun("practice", nextLessonId, pickQuestionsForLesson(nextLessonId, state.practiceCount));
}

function startMistakeReview() {
  if (!state.reviewQuestions.length) return;
  prepareRun("review", state.lessonId, shuffle(state.reviewQuestions));
}

function backToMenu() {
  clearPronounAutoAdvance();
  clearCelebration();
  cancelSpeech();
  deactivateTextEntryTarget();
  setVerbTableKeyboardDocked(false);
  closeVerbTableReference();
  updateMenuProgress();
  showScreen("menu", { activeTab: "grammar" });
  playUiSound("next");
}

function renderQuestion() {
  clearPronounAutoAdvance();
  clearCelebration();
  setVerbTableKeyboardDocked(false);
  const question = currentQuestion();
  if (!question) {
    renderComplete();
    return;
  }

  state.resolved = false;
  state.questionMistakes = 0;
  state.selectedVerbIndexes = [];
  state.pronounMatches = {};
  state.pronounWordTexts = {};
  state.pronounWrongSlots = [];
  state.selectedPronounWordId = "";
  state.selectedPronounSlotKey = "";
  state.verbTableWrongSlots = [];
  state.verbTableSubmitState = "";
  el.questionNumber.textContent = String(state.index + 1);
  el.questionTotal.textContent = String(state.questions.length);
  updateLiveStats();
  el.englishCard.classList.add("hidden");
  el.nextBtn.classList.add("hidden");
  el.restartBtn.classList.add("hidden");
  el.lessonScreen.classList.toggle("quiz-screen", state.lessonId === QUIZ1_ID);
  el.lessonScreen.classList.toggle("underline-screen", state.lessonId === SENTENCE_UNDERLINE_ID);
  el.lessonScreen.classList.toggle("pronoun-screen", state.lessonId === PRONOUN_MATCH_ID);
  el.lessonScreen.classList.toggle("pronoun-sentence-screen", state.lessonId === PRONOUN_SENTENCE_ID);
  el.lessonScreen.classList.toggle("countable-screen", state.lessonId === COUNTABLE_NOUN_ID);
  el.lessonScreen.classList.toggle("verb-table-screen", state.lessonId === VERB_TABLE_ID);
  el.chinesePrompt.classList.toggle("english-prompt", state.lessonId === LESSON2_ID || state.lessonId === PRONOUN_SENTENCE_ID || state.lessonId === COUNTABLE_NOUN_ID);
  el.chinesePrompt.classList.toggle("builder-prompt", state.lessonId === QUIZ1_ID);
  el.chinesePrompt.classList.toggle("underline-prompt", state.lessonId === SENTENCE_UNDERLINE_ID);
  el.chinesePrompt.classList.toggle("pronoun-prompt", state.lessonId === PRONOUN_MATCH_ID);
  el.chinesePrompt.classList.toggle("pronoun-sentence-prompt", state.lessonId === PRONOUN_SENTENCE_ID);
  el.chinesePrompt.classList.toggle("verb-table-prompt", state.lessonId === VERB_TABLE_ID);
  el.ruleCard.classList.toggle("hidden", state.lessonId !== LESSON2_ID);
  el.verbTokenGrid.replaceChildren();
  setTextEntryValue(el.countableCorrectionInput, "");
  deactivateTextEntryTarget("countable");
  el.sentenceSlots.replaceChildren();
  el.wordBank.replaceChildren();
  el.underlineBoard.replaceChildren();
  el.underlinePalette.replaceChildren();
  el.pronounMatchBoard.replaceChildren();
  el.pronounWordBank.replaceChildren();
  el.pronounSentenceChoice.replaceChildren();
  el.verbTableSlots.replaceChildren();
  clearVerbTableImage();
  setFeedback();

  if (state.lessonId === LESSON2_ID) {
    renderVerbCountQuestion(question);
    return;
  }

  if (state.lessonId === QUIZ1_ID) {
    renderSentenceBuilderQuestion(question);
    return;
  }

  if (state.lessonId === SENTENCE_UNDERLINE_ID) {
    renderSentenceUnderlineQuestion(question);
    return;
  }

  if (state.lessonId === PRONOUN_MATCH_ID) {
    renderPronounMatchQuestion(question);
    return;
  }

  if (state.lessonId === PRONOUN_SENTENCE_ID) {
    renderPronounSentenceQuestion(question);
    return;
  }

  if (state.lessonId === COUNTABLE_NOUN_ID) {
    renderCountableNounQuestion(question);
    return;
  }

  if (state.lessonId === VERB_TABLE_ID) {
    renderVerbTableQuestion(question);
    return;
  }

  renderGrammarQuestion(question);
}

function renderGrammarQuestion(question) {
  el.stepLabel.textContent = "中文句子";
  el.categoryPill.textContent = CATEGORY_LABELS[question.type];
  el.categoryPill.dataset.type = question.type;
  el.chinesePrompt.textContent = question.zh;
  el.guidance.textContent = "分析句子有沒有動作動詞：有就 TICK，冇就 CROSS。";
  showOnlyChoice("verb");
}

function renderVerbCountQuestion(question) {
  el.stepLabel.textContent = "English sentence";
  el.categoryPill.textContent = "One verb rule";
  el.categoryPill.dataset.type = "verb-count";
  el.chinesePrompt.textContent = question.sentence;
  el.guidance.textContent = getLesson2Translation(question);
  showOnlyChoice("judgment");
}

function renderSentenceBuilderQuestion(question) {
  el.stepLabel.textContent = "中文句子";
  el.categoryPill.textContent = "Quiz 1";
  el.categoryPill.dataset.type = "quiz1";
  el.chinesePrompt.textContent = question.zh;
  el.guidance.textContent = "";
  el.sentenceSlots.setAttribute("aria-label", "答案區");

  getSentenceBuilderWordBlocks(question).forEach(({ word, id, type }) => {
    const button = document.createElement("button");
    button.className = "word-block";
    button.type = "button";
    button.textContent = word;
    button.dataset.wordIndex = String(id);
    button.dataset.wordType = type;
    button.addEventListener("click", () => toggleBuilderWord(button));
    el.wordBank.append(button);
  });

  updateBuilderControls();
  showOnlyChoice("builder");
}

function getUnderlineTokens(question) {
  return question.segments.flat();
}

function renderSentenceUnderlineQuestion(question) {
  el.stepLabel.textContent = "English sentence";
  el.categoryPill.textContent = "Sentence";
  el.categoryPill.dataset.type = "underline";
  el.guidance.textContent = "用唔同顏色 underline 每個句子。";
  state.selectedUnderlineColor = 0;

  for (let index = 0; index < UNDERLINE_COLOR_COUNT; index += 1) {
    const chip = document.createElement("span");
    chip.className = "underline-color-btn";
    chip.textContent = String(index + 1);
    chip.dataset.colorIndex = String(index);
    chip.classList.toggle("selected", index === state.selectedUnderlineColor);
    el.underlinePalette.append(chip);
  }

  getUnderlineTokens(question).forEach((token, index) => {
    const word = document.createElement("span");
    word.className = "underline-token";
    word.textContent = token;
    word.dataset.tokenIndex = String(index);
    el.underlineBoard.append(word);
  });

  updateUnderlineControls();
  showOnlyChoice("underline");
}

function renderPronounMatchQuestion(question) {
  el.stepLabel.textContent = "中文代名詞";
  el.categoryPill.textContent = "代名詞";
  el.categoryPill.dataset.type = "pronoun";
  el.chinesePrompt.textContent = question.zh;
  el.guidance.textContent = "左邊中文用途，右邊英文代名詞，放齊自動檢查。";

  PRONOUN_CATEGORIES.forEach(({ key, label }) => {
    const slot = document.createElement("button");
    slot.className = "pronoun-slot";
    slot.type = "button";
    slot.dataset.pronounSlot = key;
    slot.innerHTML = `<span class="pronoun-slot-label"></span><span class="pronoun-slot-value"></span>`;
    slot.querySelector(".pronoun-slot-label").textContent = label;
    slot.addEventListener("click", () => selectPronounSlot(key));
    el.pronounMatchBoard.append(slot);
  });

  getPronounWordBlocks(question).forEach(({ id, text }) => {
    state.pronounWordTexts[id] = text;
    const button = document.createElement("button");
    button.className = "pronoun-word word-block";
    button.type = "button";
    button.textContent = text;
    button.dataset.pronounWordId = id;
    button.addEventListener("click", () => selectPronounWord(id));
    el.pronounWordBank.append(button);
  });

  updatePronounMatchView();
  showOnlyChoice("pronoun");
}

function renderPronounSentenceQuestion(question) {
  el.stepLabel.textContent = "English sentence";
  el.categoryPill.textContent = "代名詞 MC";
  el.categoryPill.dataset.type = "pronoun-sentence";
  el.chinesePrompt.textContent = question.sentence;
  el.guidance.textContent = "";

  question.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = "option-btn pronoun-sentence-btn";
    button.type = "button";
    button.textContent = choice;
    button.dataset.pronounSentenceAnswer = choice;
    button.addEventListener("click", () => answerPronounSentence(choice));
    el.pronounSentenceChoice.append(button);
  });

  showOnlyChoice("pronounSentence");
}

function renderCountableNounQuestion(question) {
  el.stepLabel.textContent = "English sentence";
  el.categoryPill.textContent = "可數名詞";
  el.categoryPill.dataset.type = "countable";
  el.chinesePrompt.textContent = question.sentence;
  el.guidance.textContent = question.zh;
  showOnlyChoice("judgment");
}

function renderVerbTableQuestion(question) {
  el.stepLabel.textContent = "中文意思";
  el.categoryPill.textContent = "Verb Table";
  el.categoryPill.dataset.type = "verb-table";
  el.chinesePrompt.textContent = question.zh;
  renderVerbTableImage(question);
  el.guidance.textContent = "輸入現在式、過去式、PP、ING。";
  state.verbTableActiveField = "present";

  VERB_TABLE_FIELDS.forEach((field) => {
    const slot = document.createElement("div");
    slot.className = "verb-table-slot verb-table-field";
    slot.dataset.verbTableSlot = field.key;
    slot.tabIndex = 0;
    slot.setAttribute("role", "button");
    slot.setAttribute("aria-label", field.label);
    slot.innerHTML = `<span class="verb-table-slot-label"></span><span class="verb-table-input" role="textbox" aria-readonly="true"></span>`;
    slot.querySelector(".verb-table-slot-label").textContent = field.label;
    const input = slot.querySelector(".verb-table-input");
    input.dataset.verbTableField = field.key;
    input.dataset.placeholder = field.shortLabel;
    input.setAttribute("aria-label", field.label);
    if (field.key === "present") {
      input.dataset.verbTableHint = getVerbTablePresentHint(question);
    }
    setVerbTableElementValue(input, input.dataset.verbTableHint || "");
    slot.addEventListener("click", () => focusVerbTableField(field.key));
    slot.addEventListener("keydown", (event) => handleVerbTableSlotKeydown(event, field.key));
    el.verbTableSlots.append(slot);
  });

  updateVerbTableView();
  setVerbTableKeyboardDocked(!isComputerKeyboardMode());
  showOnlyChoice("verbTable");
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
  setVerbTableKeyboardDocked(false);
  el.guidance.textContent = "英文句子已解鎖，按一下可以聽讀音。";
  el.englishText.textContent = question.english;
  el.englishCard.classList.remove("hidden");
  el.nextBtn.classList.remove("hidden");
  setFeedback(message || "正確！", "success");
  playUiSound("correct");
}

function recordWrong(message) {
  const question = currentQuestion();
  if (!question || state.resolved) return;
  const isCountableLesson = state.lessonId === COUNTABLE_NOUN_ID;

  if (state.questionMistakes === 0) {
    state.streak = 0;
  }
  if (!state.missedQuestionIds.includes(question.id)) {
    state.missedQuestionIds.push(question.id);
  }
  state.mistakes += 1;
  state.questionMistakes += 1;
  state.resolved = true;
  if (state.mode === "practice") {
    saveProgress(state.index + 1);
  }
  updateLiveStats();
  showOnlyChoice("");
  setVerbTableKeyboardDocked(false);
  el.guidance.textContent = isCountableLesson ? question.zh : "睇完解釋，按「下一題」繼續。";
  if (question.english && !isCountableLesson) {
    el.englishText.textContent = question.english;
    el.englishCard.classList.remove("hidden");
  } else {
    el.englishCard.classList.add("hidden");
  }
  el.nextBtn.classList.remove("hidden");
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
  setFeedback(question.type === "be" ? "正確，「是」不算動詞" : "正確，呢句中文沒有動作動詞。", "success");
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

function getSentenceTokens(question) {
  return window.GrammarCore?.getSentenceTokens
    ? window.GrammarCore.getSentenceTokens(question)
    : question.sentence.replace(/[.?!]/g, "").split(" ");
}

function getLesson2Translation(question) {
  return question.zh || "";
}

function getLesson2Correction(question) {
  return window.GrammarCore?.getLesson2Correction
    ? window.GrammarCore.getLesson2Correction(question)
    : question.correction || "句子正確，不用改。";
}

function getVerbCountReason(question) {
  const baseExplanation = question.explanation.replace(/。$/, "");
  return `${baseExplanation}，所以${question.isCorrect ? "正確" : "錯誤"}。`;
}

function getVerbCountFeedback(question) {
  return [
    { text: getVerbCountReason(question) },
    { text: `正確答案：${getLesson2Correction(question)}`, className: "answer-line" }
  ];
}

function getCountableNounFeedback(question, opening = "") {
  return [
    { text: `${opening}${question.explanation}` },
    { text: `正確答案：${question.answer}`, className: "answer-line" }
  ];
}

function getPronounSentenceCompletedSentence(question) {
  return question.sentence.replace("___", question.answer);
}

function getPronounSentenceContext(question) {
  const afterBlank = question.sentence.split("___")[1]?.trim() || "";
  const firstWord = afterBlank.replace(/^[,.;:!?]+/, "").split(/\s+/)[0]?.replace(/[^A-Za-z]/g, "") || "";
  const secondWord = afterBlank.split(/\s+/)[1]?.replace(/[^A-Za-z]/g, "") || "";
  const followingNoun = question.slotType === "possessiveAdjective"
    ? firstWord
    : secondWord;
  return {
    firstWord,
    secondWord,
    followingNoun,
    hasNounAfterBlank: question.slotType === "possessiveAdjective"
  };
}

function getPronounSentenceWordInfo(choice) {
  return PRONOUN_SENTENCE_FORMS[choice] || PRONOUN_SENTENCE_FORMS[capitalizeWord(choice)] || null;
}

function getPronounSentenceMeaning(info, slotType) {
  if (!info) return "";
  return info.meanings?.[slotType]
    || info.meanings?.[info.roles?.[0]]
    || "";
}

function getPronounSentenceBeMismatch(info, context) {
  if (!info?.roles?.includes("subject") || !context.firstWord) return "";
  const nextWord = context.firstWord.toLowerCase();
  if (!["is", "am", "are"].includes(nextWord)) return "";
  const expectedBe = info.subject?.be || "";
  return expectedBe && expectedBe !== nextWord
    ? `雖然可做主語，但 ${getPronounSentenceMeaning(info, "subject")} 要配 ${expectedBe}，不配 ${context.firstWord}。`
    : "";
}

function getPronounSentenceVerbMismatch(info, context) {
  if (!info?.roles?.includes("subject") || !context.firstWord) return "";
  const nextWord = context.firstWord.toLowerCase();
  if (nextWord === "has") {
    return info.subject?.has === "has" ? "" : `雖然可做主語，但 ${getPronounSentenceMeaning(info, "subject")} 要配 have，不配 has。`;
  }
  if (nextWord.endsWith("s") && info.subject?.present === "base") {
    return `雖然可做主語，但 ${getPronounSentenceMeaning(info, "subject")} 後面的動詞不用加 s。`;
  }
  return "";
}

function getPronounSentenceChoiceReason(question, choice) {
  const info = getPronounSentenceWordInfo(choice);
  const slotType = question.slotType;
  const roleLabel = PRONOUN_SENTENCE_ROLE_LABELS[slotType] || "這個";
  const meaning = getPronounSentenceMeaning(info, slotType);
  const prefix = choice === question.answer ? `${choice} ✓` : `${choice} ×`;
  const context = getPronounSentenceContext(question);

  if (!info) return `${prefix}：不是這課要用的代名詞。`;

  if (choice === question.answer) {
    if (slotType === "possessiveAdjective") {
      return `${prefix}：表示「${meaning}」，後面可接名詞 ${context.followingNoun || ""}，所以正確。`;
    }
    if (slotType === "possessivePronoun") {
      return `${prefix}：表示「${meaning}」，本身已包含名詞意思，所以正確。`;
    }
    return `${prefix}：表示「${meaning}」，可放在${roleLabel}位置，所以正確。`;
  }

  const beMismatch = getPronounSentenceBeMismatch(info, context);
  if (beMismatch) return `${prefix}：${beMismatch}`;

  const verbMismatch = getPronounSentenceVerbMismatch(info, context);
  if (verbMismatch) return `${prefix}：${verbMismatch}`;

  if (slotType === "subject") {
    if (info.roles.includes("object")) {
      return `${prefix}：雖然意思是「${getPronounSentenceMeaning(info, "object")}」，但只可在不是主語的情況下使用。`;
    }
    if (info.roles.includes("possessiveAdjective")) {
      return `${prefix}：表示「${getPronounSentenceMeaning(info, "possessiveAdjective")}」，後面要有名詞，不可放主語位置。`;
    }
    if (info.roles.includes("possessivePronoun")) {
      return `${prefix}：表示「${getPronounSentenceMeaning(info, "possessivePronoun")}」，不是主語代名詞。`;
    }
  }

  if (slotType === "object") {
    if (info.roles.includes("subject")) {
      return `${prefix}：雖然意思是「${getPronounSentenceMeaning(info, "subject")}」，但只可做主語，不可放在動詞或介詞後。`;
    }
    if (info.roles.includes("possessiveAdjective")) {
      return `${prefix}：表示「${getPronounSentenceMeaning(info, "possessiveAdjective")}」，後面要有名詞，不可單獨放在這裡。`;
    }
    if (info.roles.includes("possessivePronoun")) {
      return `${prefix}：表示「${getPronounSentenceMeaning(info, "possessivePronoun")}」，不是非主語代名詞。`;
    }
  }

  if (slotType === "possessiveAdjective") {
    if (info.roles.includes("possessivePronoun") && !info.roles.includes("possessiveAdjective")) {
      return `${prefix}：表示「${getPronounSentenceMeaning(info, "possessivePronoun")}」，本身已包含名詞意思，後面不可再接名詞。`;
    }
    if (info.roles.includes("subject")) {
      return `${prefix}：表示「${getPronounSentenceMeaning(info, "subject")}」，是主語代名詞，不可直接放在名詞前。`;
    }
    if (info.roles.includes("object")) {
      return `${prefix}：雖然意思是「${getPronounSentenceMeaning(info, "object")}」，但只可在不是主語的情況下使用，不可直接放在名詞前。`;
    }
  }

  if (slotType === "possessivePronoun") {
    if (info.roles.includes("possessiveAdjective") && !info.roles.includes("possessivePronoun")) {
      return `${prefix}：表示「${getPronounSentenceMeaning(info, "possessiveAdjective")}」，後面要有名詞；這裡後面沒有名詞。`;
    }
    if (info.roles.includes("subject")) {
      return `${prefix}：表示「${getPronounSentenceMeaning(info, "subject")}」，是主語代名詞，不表示「${roleLabel}」。`;
    }
    if (info.roles.includes("object")) {
      return `${prefix}：雖然意思是「${getPronounSentenceMeaning(info, "object")}」，但只可在不是主語的情況下使用，不表示「${roleLabel}」。`;
    }
  }

  return `${prefix}：不是這個空格需要的${roleLabel}代名詞。`;
}

function getPronounSentenceChoiceFeedback(question) {
  return question.choices.map((choice) => ({
    text: getPronounSentenceChoiceReason(question, choice),
    className: choice === question.answer ? "answer-line" : ""
  }));
}

function getPronounSentenceFeedback(question, isCorrect) {
  return [
    { text: `中文：${question.zh}` },
    { text: `${isCorrect ? "正確。" : "未正確。"}${question.explanation}` },
    { text: `正確答案：${getPronounSentenceCompletedSentence(question)}`, className: "answer-line" },
    ...getPronounSentenceChoiceFeedback(question)
  ];
}

function answerPronounSentence(choice) {
  const question = currentQuestion();
  if (!question || state.lessonId !== PRONOUN_SENTENCE_ID || state.resolved) return;

  if (choice !== question.answer) {
    recordWrong(getPronounSentenceFeedback(question, false));
    return;
  }

  completeVerbLessonQuestion(getPronounSentenceFeedback(question, true));
}

function normalizeTypedSentence(value) {
  if (window.GrammarCore?.normalizeTypedSentence) {
    return window.GrammarCore.normalizeTypedSentence(value);
  }
  return String(value || "")
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, "\"")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?])/g, "$1")
    .replace(/[.?!]+$/g, "")
    .toLowerCase();
}

function isCountableTypedAnswerCorrect(question, value) {
  if (window.GrammarCore?.isCountableTypedAnswerCorrect) {
    return window.GrammarCore.isCountableTypedAnswerCorrect(question, value);
  }
  const normalized = normalizeTypedSentence(value);
  return question.acceptedAnswers.some((answer) => normalizeTypedSentence(answer) === normalized);
}

function askCountableCorrection() {
  const question = currentQuestion();
  if (question?.zh) {
    el.guidance.textContent = question.zh;
  }
  showOnlyChoice("countableCorrection");
  activateTextEntryTarget("countable");
  setFeedback("正確，呢句有問題，請改成正確英文。", "success");
  playUiSound("step");
}

function answerCountableJudgment(choice) {
  const question = currentQuestion();
  if (!question || state.lessonId !== COUNTABLE_NOUN_ID || state.resolved) return;

  const pickedCorrect = choice === "correct";
  if (pickedCorrect !== question.isCorrect) {
    recordWrong(getCountableNounFeedback(question, question.isCorrect ? "句子本身正確。" : "句子錯誤。"));
    return;
  }

  if (question.isCorrect) {
    completeVerbLessonQuestion(getCountableNounFeedback(question, "句子正確。"));
    return;
  }

  askCountableCorrection();
}

function submitCountableCorrection() {
  const question = currentQuestion();
  if (!question || state.lessonId !== COUNTABLE_NOUN_ID || state.resolved) return;
  const typedAnswer = getTextEntryValue(el.countableCorrectionInput);

  if (!typedAnswer.trim()) {
    setFeedback("請輸入正確英文句子。", "error");
    playUiSound("wrong");
    return;
  }

  if (!isCountableTypedAnswerCorrect(question, typedAnswer)) {
    recordWrong(getCountableNounFeedback(question, "改寫未正確。"));
    return;
  }

  completeVerbLessonQuestion(getCountableNounFeedback(question, "改寫正確。"));
}

function completeVerbLessonQuestion(message) {
  const question = currentQuestion();
  if (!question || state.resolved) return;

  state.resolved = true;
  state.score += 1;
  state.streak += 1;
  if (state.streak > state.bestStreak) {
    state.bestStreak = state.streak;
    saveBestStreak();
  }
  if (state.mode === "practice") {
    saveProgress(state.index + 1);
  }

  updateLiveStats();
  showOnlyChoice("");
  setVerbTableKeyboardDocked(false);
  el.guidance.textContent = state.lessonId === COUNTABLE_NOUN_ID ? question.zh : "睇完解釋，按「下一題」繼續。";
  el.englishCard.classList.add("hidden");
  el.nextBtn.classList.remove("hidden");
  setFeedback(message, "success");
  playUiSound("correct");
}

function answerSentenceJudgment(choice) {
  const question = currentQuestion();
  if (!question || state.resolved) return;

  if (state.lessonId === COUNTABLE_NOUN_ID) {
    answerCountableJudgment(choice);
    return;
  }

  if (state.lessonId !== LESSON2_ID) return;

  const pickedCorrect = choice === "correct";
  if (pickedCorrect !== question.isCorrect) {
    recordWrong(getVerbCountFeedback(question));
    return;
  }

  el.guidance.textContent = "正確。下一步揀句子有幾多個動詞。";
  showOnlyChoice("verbCount");
  setFeedback("正確，繼續數動詞。", "success");
  playUiSound("step");
}

function answerVerbCount(count) {
  const question = currentQuestion();
  if (!question || state.lessonId !== LESSON2_ID || state.resolved) return;

  const pickedCount = Number(count);
  if (pickedCount !== question.verbCount) {
    recordWrong(getVerbCountFeedback(question));
    return;
  }

  if (question.isCorrect || question.verbCount === 0) {
    completeVerbLessonQuestion(getVerbCountFeedback(question));
    return;
  }

  renderVerbTokenButtons(question);
  el.guidance.textContent = "數目正確。再揀出句子入面邊啲字係動詞。";
  showOnlyChoice("verbTokens");
  setFeedback("數目正確，請揀動詞。", "success");
  playUiSound("step");
}

function renderVerbTokenButtons(question) {
  el.verbTokenGrid.replaceChildren();
  getSentenceTokens(question).forEach((token, index) => {
    const button = document.createElement("button");
    button.className = "token-btn";
    button.type = "button";
    button.textContent = token;
    button.dataset.tokenIndex = String(index);
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => toggleVerbToken(index, button));
    el.verbTokenGrid.append(button);
  });
}

function toggleVerbToken(index, button) {
  if (state.resolved) return;

  if (state.selectedVerbIndexes.includes(index)) {
    state.selectedVerbIndexes = state.selectedVerbIndexes.filter((selectedIndex) => selectedIndex !== index);
  } else {
    state.selectedVerbIndexes.push(index);
  }

  const selected = state.selectedVerbIndexes.includes(index);
  button.classList.toggle("selected", selected);
  button.setAttribute("aria-pressed", String(selected));
  playUiSound("step");
}

function submitVerbTokens() {
  const question = currentQuestion();
  if (!question || state.lessonId !== LESSON2_ID || state.resolved) return;

  const picked = [...state.selectedVerbIndexes].sort((left, right) => left - right);
  const expected = [...question.verbIndexes].sort((left, right) => left - right);
  const matched = picked.length === expected.length && picked.every((index, position) => index === expected[position]);

  if (!matched) {
    recordWrong(getVerbCountFeedback(question));
    return;
  }

  completeVerbLessonQuestion(getVerbCountFeedback(question));
}

function getSentenceBuilderWordBlocks(question) {
  const answerWords = question.answer.map((word, index) => ({
    word,
    id: `answer-${index}`,
    type: "answer"
  }));
  const answerSet = new Set(question.answer.map((word) => word.toLowerCase()));
  const extraWords = shuffle((question.distractors || []).filter((word) => !answerSet.has(word.toLowerCase())))
    .slice(0, 2)
    .map((word, index) => ({
      word,
      id: `extra-${index}`,
      type: "extra"
    }));

  return shuffle([...answerWords, ...extraWords]);
}

function getPlacedBuilderWords() {
  return [...el.sentenceSlots.querySelectorAll(".word-block")].map((button) => button.textContent);
}

function moveBuilderBlock(button, target, beforeAppend = () => {}) {
  const startRect = button.getBoundingClientRect();
  beforeAppend();
  target.append(button);
  const endRect = button.getBoundingClientRect();
  const deltaX = startRect.left - endRect.left;
  const deltaY = startRect.top - endRect.top;

  if (deltaX || deltaY) {
    button.animate(
      [
        { transform: `translate(${deltaX}px, ${deltaY}px) scale(0.98)` },
        { transform: "translate(0, 0) scale(1)" }
      ],
      {
        duration: 280,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)"
      }
    );
  }
}

function updateBuilderControls() {
  const filledCount = getPlacedBuilderWords().length;
  el.confirmBuilderBtn.disabled = filledCount === 0;
  el.resetBuilderBtn.disabled = filledCount === 0;
}

function placeBuilderWord(button) {
  moveBuilderBlock(button, el.sentenceSlots, () => {
    button.classList.add("placed");
    button.setAttribute("aria-label", `${button.textContent} 已放到答案區`);
  });
  updateBuilderControls();
  setFeedback();
  playUiSound("step");
}

function returnBuilderWord(button) {
  moveBuilderBlock(button, el.wordBank, () => {
    button.classList.remove("placed");
    button.removeAttribute("aria-label");
  });
  updateBuilderControls();
  setFeedback();
  playUiSound("next");
}

function toggleBuilderWord(button) {
  if (state.resolved) return;

  if (button.classList.contains("placed")) {
    returnBuilderWord(button);
    return;
  }

  placeBuilderWord(button);
}

function resetSentenceBuilder() {
  if (state.resolved) return;

  const placedButtons = [...el.sentenceSlots.querySelectorAll(".word-block")];
  placedButtons.forEach((button) => {
    moveBuilderBlock(button, el.wordBank, () => {
      button.classList.remove("placed");
      button.removeAttribute("aria-label");
    });
  });
  updateBuilderControls();
  setFeedback();
  if (placedButtons.length) {
    playUiSound("next");
  }
}

function getSentenceBuilderAnswer(question) {
  return question.answer.join(" ");
}

function getSentenceBuilderFeedback(question, isCorrect) {
  return [
    { text: isCorrect ? "句子次序正確。" : "句子次序未正確。" },
    { text: `正確答案：${getSentenceBuilderAnswer(question)}`, className: "answer-line" }
  ];
}

function submitSentenceBuilder() {
  const question = currentQuestion();
  if (!question || state.lessonId !== QUIZ1_ID || state.resolved) return;

  const pickedWords = getPlacedBuilderWords();
  if (!pickedWords.length) {
    setFeedback("", "error");
    playUiSound("wrong");
    return;
  }

  const matched = pickedWords.length === question.answer.length
    && pickedWords.every((word, index) => word === question.answer[index]);
  if (!matched) {
    recordWrong(getSentenceBuilderFeedback(question, false));
    return;
  }

  completeVerbLessonQuestion(getSentenceBuilderFeedback(question, true));
}

function getVerbTableImageKey(question) {
  return VERB_TABLE_FIELDS
    .map((field) => question?.forms?.[field.key])
    .join("|");
}

function getVersionedVerbTableImageSrc(src) {
  if (!src) return "";
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}v=${VERB_TABLE_IMAGE_VERSION}`;
}

function getVerbTableImageEntry(question) {
  return window.GRAMMAR_VERB_IMAGE_MANIFEST?.[getVerbTableImageKey(question)] || null;
}

function clearVerbTableImage() {
  if (el.verbTableImage) {
    el.verbTableImage.removeAttribute("src");
    el.verbTableImage.alt = "";
  }

  if (el.verbTableVisual) {
    el.verbTableVisual.classList.add("hidden");
    el.verbTableVisual.setAttribute("aria-hidden", "true");
  }
}

function renderVerbTableImage(question) {
  const entry = getVerbTableImageEntry(question);
  if (!el.verbTableVisual || !el.verbTableImage || !entry?.src) {
    clearVerbTableImage();
    return;
  }

  el.verbTableImage.src = getVersionedVerbTableImageSrc(entry.src);
  el.verbTableImage.alt = `${question.zh} 的圖片提示`;
  el.verbTableImage.draggable = false;
  el.verbTableVisual.classList.remove("hidden");
  el.verbTableVisual.setAttribute("aria-hidden", "false");
}

function getVerbTableAnswerLine(question) {
  if (window.GrammarCore?.getVerbTableAnswerLine) {
    return window.GrammarCore.getVerbTableAnswerLine(question, VERB_TABLE_FIELDS);
  }
  return VERB_TABLE_FIELDS
    .map((field) => `${field.label}：${question.forms[field.key]}`)
    .join(" / ");
}

function getVerbTableFeedback(question, isCorrect) {
  return [
    { text: isCorrect ? "動詞四式全部正確。" : "紅色圈住嗰格未正確。" },
    { text: `正確答案：${getVerbTableAnswerLine(question)}`, className: "answer-line" }
  ];
}

function getVerbTableInputs() {
  return [...el.verbTableSlots.querySelectorAll(".verb-table-input")];
}

function getVerbTableInput(slotKey) {
  return el.verbTableSlots.querySelector(`.verb-table-input[data-verb-table-field="${slotKey}"]`);
}

function getVerbTableFieldOrder() {
  return VERB_TABLE_FIELDS.map((field) => field.key);
}

function getVerbTableInputValue(slotKey) {
  return getVerbTableInput(slotKey)?.dataset.value || "";
}

function getVerbTablePresentHint(question) {
  return String(question?.forms?.present || "").trim().charAt(0).toLowerCase();
}

function getVerbTableTypedValue(slotKey) {
  const input = getVerbTableInput(slotKey);
  if (!input) return "";
  const value = getVerbTableElementValue(input).trim();
  if (slotKey === "present" && value === input.dataset.verbTableHint) return "";
  return value;
}

function getVerbTableElementValue(input) {
  return input?.dataset.value || "";
}

function setVerbTableElementValue(input, value) {
  if (!input) return;
  const nextValue = String(value || "").trim();
  input.dataset.value = nextValue;
  input.textContent = nextValue;
  input.classList.toggle("is-placeholder", !nextValue);
}

function restoreVerbTablePresentHint(input) {
  const hint = input?.dataset.verbTableHint || "";
  if (!hint || getVerbTableElementValue(input).trim()) return;

  setVerbTableElementValue(input, hint);
}

function tidyVerbTablePresentInput(input) {
  if (!input) return;

  restoreVerbTablePresentHint(input);
  const question = currentQuestion();
  const answer = question?.forms?.present || "";
  const hint = input.dataset.verbTableHint || "";
  if (answer && hint && normalizeVerbTableAnswer(getVerbTableElementValue(input)) === normalizeVerbTableAnswer(`${hint}${answer}`)) {
    setVerbTableElementValue(input, answer);
  }
}

function getActiveVerbTableFieldKey() {
  return VERB_TABLE_FIELDS.some((field) => field.key === state.verbTableActiveField)
    ? state.verbTableActiveField
    : "present";
}

function focusVerbTableInput(slotKey) {
  focusVerbTableField(slotKey);
}

function focusVerbTableField(slotKey) {
  if (!VERB_TABLE_FIELDS.some((field) => field.key === slotKey)) return;
  state.verbTableActiveField = slotKey;
  updateVerbTableView();
}

function setVerbTableFieldValue(slotKey, value) {
  const input = getVerbTableInput(slotKey);
  if (!input || state.resolved) return;

  if (slotKey === "present") {
    const hint = input.dataset.verbTableHint || "";
    const nextValue = String(value || "").trim();
    setVerbTableElementValue(input, nextValue || hint);
    tidyVerbTablePresentInput(input);
  } else {
    setVerbTableElementValue(input, value);
  }

  state.verbTableWrongSlots = state.verbTableWrongSlots.filter((wrongSlot) => wrongSlot !== slotKey);
  state.verbTableSubmitState = "";
  updateVerbTableView();
  setFeedback();
}

function appendVerbTableFieldCharacter(char) {
  const slotKey = getActiveVerbTableFieldKey();
  const input = getVerbTableInput(slotKey);
  if (!input || state.resolved) return;

  const current = slotKey === "present" && !getVerbTableTypedValue(slotKey)
    ? input.dataset.verbTableHint || ""
    : getVerbTableInputValue(slotKey);
  setVerbTableFieldValue(slotKey, `${current}${char}`);
}

function backspaceVerbTableField() {
  const slotKey = getActiveVerbTableFieldKey();
  const current = getVerbTableInputValue(slotKey);
  setVerbTableFieldValue(slotKey, current.slice(0, -1));
}

function moveVerbTableField(direction) {
  const fields = getVerbTableFieldOrder();
  const currentIndex = fields.indexOf(getActiveVerbTableFieldKey());
  const nextIndex = (currentIndex + direction + fields.length) % fields.length;
  focusVerbTableField(fields[nextIndex]);
}

function handleVerbTableKeyboardKey(keyValue) {
  if (state.resolved) return;

  if (keyValue === "prev") {
    moveVerbTableField(-1);
    playUiSound("step");
    return;
  }

  if (keyValue === "next") {
    moveVerbTableField(1);
    playUiSound("step");
    return;
  }

  if (keyValue === "enter") {
    submitVerbTable();
    return;
  }

  if (keyValue === "backspace") {
    backspaceVerbTableField();
    playUiSound("next");
    return;
  }

  if (/^[a-z]$/.test(keyValue)) {
    appendVerbTableFieldCharacter(keyValue);
    playUiSound("step");
  }
}

function handleVerbTableSlotKeydown(event, slotKey) {
  if (!isComputerKeyboardMode()) {
    event.preventDefault();
    return;
  }

  if (state.resolved) return;

  if (event.key === "Enter") {
    event.preventDefault();
    submitVerbTable();
    return;
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    focusVerbTableField(slotKey);
    backspaceVerbTableField();
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveVerbTableField(-1);
    return;
  }

  if (event.key === "ArrowRight" || event.key === "Tab") {
    event.preventDefault();
    moveVerbTableField(1);
    return;
  }

  if (/^[a-zA-Z]$/.test(event.key)) {
    event.preventDefault();
    focusVerbTableField(slotKey);
    appendVerbTableFieldCharacter(event.key.toLowerCase());
  }
}

function normalizeVerbTableAnswer(value) {
  if (window.GrammarCore?.normalizeVerbTableAnswer) {
    return window.GrammarCore.normalizeVerbTableAnswer(value);
  }
  return String(value)
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function handleVerbTableInput(slotKey) {
  if (state.resolved) return;

  if (slotKey === "present") {
    tidyVerbTablePresentInput(getVerbTableInput(slotKey));
  }
  state.verbTableWrongSlots = state.verbTableWrongSlots.filter((wrongSlot) => wrongSlot !== slotKey);
  state.verbTableSubmitState = "";
  updateVerbTableView();
  setFeedback();
}

function updateVerbTableView() {
  const question = currentQuestion();
  if (!question) return;

  el.verbTableSlots.querySelectorAll(".verb-table-slot").forEach((slot) => {
    const slotKey = slot.dataset.verbTableSlot;
    const input = slot.querySelector(".verb-table-input");
    const hasValue = Boolean(getVerbTableTypedValue(slotKey));
    const isWrong = state.verbTableWrongSlots.includes(slotKey);
    const isCorrect = state.resolved && !isWrong && isVerbTableSlotCorrect(question, slotKey);
    const isActive = state.verbTableActiveField === slotKey && !state.resolved;
    slot.classList.toggle("filled", hasValue);
    slot.classList.toggle("wrong", state.verbTableWrongSlots.includes(slotKey));
    slot.classList.toggle("correct", isCorrect);
    slot.classList.toggle("active", isActive);
    if (input) {
      input.setAttribute("aria-disabled", state.resolved ? "true" : "false");
      input.classList.toggle("wrong", isWrong);
      input.classList.toggle("correct", isCorrect);
      input.classList.toggle("active", isActive);
    }
  });

  el.verbTableKeyboard?.querySelectorAll(".verb-table-key").forEach((button) => {
    button.disabled = state.resolved;
  });

  if (el.resetVerbTableBtn) {
    const filledCount = VERB_TABLE_FIELDS.filter((field) => getVerbTableTypedValue(field.key)).length;
    el.resetVerbTableBtn.disabled = state.resolved || filledCount === 0;
  }
  if (el.confirmVerbTableBtn) {
    el.confirmVerbTableBtn.disabled = state.resolved;
    el.confirmVerbTableBtn.classList.toggle("is-wrong", state.verbTableSubmitState === "wrong" || state.verbTableSubmitState === "incomplete");
    el.confirmVerbTableBtn.classList.toggle("is-correct", state.verbTableSubmitState === "correct");
  }
}

function isVerbTableSlotCorrect(question, slotKey) {
  if (window.GrammarCore?.isVerbTableSlotCorrect) {
    return window.GrammarCore.isVerbTableSlotCorrect(question, slotKey, getVerbTableInputValue(slotKey));
  }
  return normalizeVerbTableAnswer(getVerbTableInputValue(slotKey)) === normalizeVerbTableAnswer(question.forms[slotKey]);
}

function getVerbTableWrongSlots(question) {
  if (window.GrammarCore?.getVerbTableWrongSlots) {
    const valuesBySlot = Object.fromEntries(
      VERB_TABLE_FIELDS.map((field) => [field.key, getVerbTableInputValue(field.key)])
    );
    return window.GrammarCore.getVerbTableWrongSlots(question, valuesBySlot, VERB_TABLE_FIELDS);
  }
  return VERB_TABLE_FIELDS
    .filter((field) => !isVerbTableSlotCorrect(question, field.key))
    .map((field) => field.key);
}

function resetVerbTable() {
  if (state.resolved) return;

  const hadInput = VERB_TABLE_FIELDS.some((field) => getVerbTableTypedValue(field.key));
  getVerbTableInputs().forEach((input) => {
    setVerbTableElementValue(input, input.dataset.verbTableHint || "");
  });
  state.verbTableWrongSlots = [];
  state.verbTableSubmitState = "";
  updateVerbTableView();
  setFeedback();
  if (hadInput) {
    playUiSound("next");
    focusVerbTableInput("present");
  }
}

function completeVerbTableQuestion(message) {
  const question = currentQuestion();
  if (!question || state.lessonId !== VERB_TABLE_ID || state.resolved) return;

  state.resolved = true;
  state.score += 1;
  state.streak += 1;
  if (state.streak > state.bestStreak) {
    state.bestStreak = state.streak;
    saveBestStreak();
  }
  if (state.mode === "practice") {
    saveProgress(state.index + 1);
  }

  updateLiveStats();
  setVerbTableKeyboardDocked(false);
  state.verbTableSubmitState = "correct";
  updateVerbTableView();
  el.guidance.textContent = "答啱！按「下一題」繼續。";
  el.englishCard.classList.add("hidden");
  el.nextBtn.classList.remove("hidden");
  setFeedback(message, "success");
  const isLastQuestion = state.index >= state.questions.length - 1;
  playUiSound(isLastQuestion && state.mode === "practice" ? "pronounGrandWin" : "pronounRowWin");
  launchCelebration(isLastQuestion && state.mode === "practice" ? "grand" : "small");
}

function recordVerbTableWrong(question) {
  if (!question || state.resolved) return;

  state.verbTableWrongSlots = getVerbTableWrongSlots(question);
  state.verbTableSubmitState = "wrong";
  if (state.questionMistakes === 0) {
    state.streak = 0;
  }
  if (!state.missedQuestionIds.includes(question.id)) {
    state.missedQuestionIds.push(question.id);
  }
  state.mistakes += 1;
  state.questionMistakes += 1;
  state.resolved = true;
  if (state.mode === "practice") {
    saveProgress(state.index + 1);
  }

  updateLiveStats();
  updateVerbTableView();
  setVerbTableKeyboardDocked(false);
  el.guidance.textContent = "睇完答案，按「下一題」繼續。";
  el.englishCard.classList.add("hidden");
  el.nextBtn.classList.remove("hidden");
  setFeedback(getVerbTableFeedback(question, false), "error");
  playUiSound("wrong");
}

function submitVerbTable() {
  const question = currentQuestion();
  if (!question || state.lessonId !== VERB_TABLE_ID || state.resolved) return;

  const blankSlots = VERB_TABLE_FIELDS
    .filter((field) => !getVerbTableTypedValue(field.key))
    .map((field) => field.key);

  if (blankSlots.length) {
    state.verbTableWrongSlots = blankSlots;
    state.verbTableSubmitState = "incomplete";
    updateVerbTableView();
    setFeedback("請先填齊四格。", "error");
    playUiSound("wrong");
    return;
  }

  const wrongSlots = getVerbTableWrongSlots(question);
  if (wrongSlots.length) {
    recordVerbTableWrong(question);
    return;
  }

  completeVerbTableQuestion(getVerbTableFeedback(question, true));
}

function getPronounWordBlocks(question) {
  const answerTexts = new Set(PRONOUN_CATEGORIES.map(({ key }) => question.forms[key]));
  const correctBlocks = PRONOUN_CATEGORIES.map(({ key }) => ({
    id: key,
    text: question.forms[key]
  }));
  const distractorBlocks = getPronounDistractorBlocks(question, answerTexts);
  return shuffle([...correctBlocks, ...distractorBlocks]);
}

function getPronounDistractorBlocks(question, answerTexts) {
  const seenTexts = new Set(answerTexts);
  const candidates = PRONOUN_MATCH_QUESTIONS
    .filter((item) => item.id !== question.id)
    .flatMap((item) => PRONOUN_CATEGORIES.map(({ key }) => item.forms[key]))
    .filter((text) => {
      if (seenTexts.has(text)) return false;
      seenTexts.add(text);
      return true;
    });

  return shuffle(candidates)
    .slice(0, PRONOUN_DISTRACTOR_COUNT)
    .map((text, index) => ({
      id: `distractor-${question.id}-${index}`,
      text
    }));
}

function getPronounWordText(question, wordId) {
  return PRONOUN_CATEGORIES.find(({ key }) => key === wordId)
    ? question.forms[wordId]
    : state.pronounWordTexts[wordId] || "";
}

function getPronounPlacedSlot(wordId) {
  return Object.entries(state.pronounMatches)
    .find(([, placedWordId]) => placedWordId === wordId)?.[0] || "";
}

function placePronounWord(wordId, slotKey) {
  const question = currentQuestion();
  if (!question) return;

  state.pronounWrongSlots = [];
  const previousSlot = getPronounPlacedSlot(wordId);
  if (previousSlot) {
    delete state.pronounMatches[previousSlot];
  }
  state.pronounMatches[slotKey] = wordId;
  state.selectedPronounWordId = "";
  state.selectedPronounSlotKey = "";
  updatePronounMatchView();
  const placedCorrectly = isPronounSlotCorrect(question, slotKey);
  if (isPronounMatchReady()) {
    if (placedCorrectly && isPronounMatchCorrect(question)) {
      playPronounPlacementSound(getPronounCorrectCount(question));
    }
    submitPronounMatch();
    return;
  }
  setFeedback();
  if (placedCorrectly) {
    playPronounPlacementSound(getPronounCorrectCount(question));
  } else {
    playUiSound("step");
  }
}

function selectPronounWord(wordId) {
  if (state.resolved) return;

  if (state.selectedPronounSlotKey) {
    placePronounWord(wordId, state.selectedPronounSlotKey);
    return;
  }

  state.selectedPronounWordId = state.selectedPronounWordId === wordId ? "" : wordId;
  updatePronounMatchView();
  setFeedback();
  playUiSound("step");
}

function selectPronounSlot(slotKey) {
  if (state.resolved) return;

  if (state.selectedPronounWordId) {
    placePronounWord(state.selectedPronounWordId, slotKey);
    return;
  }

  if (state.pronounMatches[slotKey]) {
    state.pronounWrongSlots = [];
    delete state.pronounMatches[slotKey];
    state.selectedPronounSlotKey = "";
    updatePronounMatchView();
    setFeedback();
    playUiSound("next");
    return;
  }

  state.selectedPronounSlotKey = state.selectedPronounSlotKey === slotKey ? "" : slotKey;
  updatePronounMatchView();
  setFeedback();
  playUiSound("step");
}

function updatePronounMatchView() {
  const question = currentQuestion();
  if (!question) return;

  el.pronounMatchBoard.querySelectorAll(".pronoun-slot").forEach((slot) => {
    const slotKey = slot.dataset.pronounSlot;
    const wordId = state.pronounMatches[slotKey] || "";
    const value = slot.querySelector(".pronoun-slot-value");
    slot.classList.toggle("selected", state.selectedPronounSlotKey === slotKey);
    slot.classList.toggle("filled", Boolean(wordId));
    slot.classList.toggle("wrong", state.pronounWrongSlots.includes(slotKey));
    value.textContent = wordId ? getPronounWordText(question, wordId) : "";
  });

  const placedWordIds = new Set(Object.values(state.pronounMatches));
  el.pronounWordBank.querySelectorAll(".pronoun-word").forEach((button) => {
    const wordId = button.dataset.pronounWordId;
    button.classList.toggle("selected", state.selectedPronounWordId === wordId);
    button.classList.toggle("placed", placedWordIds.has(wordId));
  });

  const placedCount = Object.keys(state.pronounMatches).length;
  el.resetPronounBtn.disabled = placedCount === 0;
  el.confirmPronounBtn.disabled = placedCount < PRONOUN_CATEGORIES.length;
}

function isPronounMatchReady() {
  return Object.keys(state.pronounMatches).length === PRONOUN_CATEGORIES.length;
}

function isPronounMatchCorrect(question) {
  return PRONOUN_CATEGORIES.every(({ key }) => isPronounSlotCorrect(question, key));
}

function isPronounSlotCorrect(question, slotKey) {
  const wordId = state.pronounMatches[slotKey];
  return Boolean(wordId) && getPronounWordText(question, wordId) === question.forms[slotKey];
}

function getPronounCorrectCount(question) {
  return PRONOUN_CATEGORIES
    .filter(({ key }) => isPronounSlotCorrect(question, key))
    .length;
}

function playPronounPlacementSound(correctCount) {
  const level = Math.max(1, Math.min(PRONOUN_CATEGORIES.length, correctCount));
  playUiSound(`pronounPlace${level}`);
}

function resetPronounMatch() {
  if (state.resolved) return;

  const hadMatches = Object.keys(state.pronounMatches).length > 0
    || state.selectedPronounWordId
    || state.selectedPronounSlotKey;
  state.pronounMatches = {};
  state.pronounWrongSlots = [];
  state.selectedPronounWordId = "";
  state.selectedPronounSlotKey = "";
  updatePronounMatchView();
  setFeedback();
  if (hadMatches) {
    playUiSound("next");
  }
}

function getPronounAnswerLine(question) {
  return PRONOUN_CATEGORIES
    .map(({ key, label }) => `${label} ${question.forms[key]}`)
    .join(" / ");
}

function getPronounMatchFeedback(question, isCorrect) {
  return [
    { text: isCorrect ? `${question.zh}的代名詞配對正確。` : `${question.zh}的代名詞配對未正確。` },
    { text: `正確答案：${getPronounAnswerLine(question)}`, className: "answer-line" }
  ];
}

function recordPronounRetry() {
  const question = currentQuestion();
  if (!question || state.lessonId !== PRONOUN_MATCH_ID || state.resolved) return;

  state.pronounWrongSlots = PRONOUN_CATEGORIES
    .filter(({ key }) => getPronounWordText(question, state.pronounMatches[key]) !== question.forms[key])
    .map(({ key }) => key);
  if (state.questionMistakes === 0) {
    state.streak = 0;
  }
  if (!state.missedQuestionIds.includes(question.id)) {
    state.missedQuestionIds.push(question.id);
  }
  state.mistakes += 1;
  state.questionMistakes += 1;
  updateLiveStats();
  updatePronounMatchView();
  setFeedback("配對未正確，再試一次。", "error");
  playUiSound("wrong");
}

function completePronounMatchQuestion(message) {
  const question = currentQuestion();
  if (!question || state.lessonId !== PRONOUN_MATCH_ID || state.resolved) return;

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
  el.guidance.textContent = state.index >= state.questions.length - 1
    ? "配對完成。"
    : "配對正確，自動去下一行。";
  el.englishCard.classList.add("hidden");
  el.nextBtn.classList.add("hidden");
  el.resetPronounBtn.disabled = true;
  el.confirmPronounBtn.disabled = true;
  setFeedback(message, "success");
  const isLastQuestion = state.index >= state.questions.length - 1;
  playUiSound(isLastQuestion && state.mode === "practice" ? "pronounGrandWin" : "pronounRowWin");
  launchCelebration(isLastQuestion && state.mode === "practice" ? "grand" : "small");

  const expectedLessonId = state.lessonId;
  const expectedMode = state.mode;
  const expectedIndex = state.index;
  clearPronounAutoAdvance();
  state.pronounAutoAdvanceTimer = setTimeout(() => {
    state.pronounAutoAdvanceTimer = 0;
    const stillOnSameQuestion = state.lessonId === expectedLessonId
      && state.mode === expectedMode
      && state.index === expectedIndex
      && el.lessonScreen.classList.contains("active");
    if (stillOnSameQuestion) {
      nextQuestion({ playSound: false });
    }
  }, isLastQuestion && state.mode === "practice" ? PRONOUN_GRAND_ADVANCE_MS : PRONOUN_AUTO_ADVANCE_MS);
}

function submitPronounMatch() {
  const question = currentQuestion();
  if (!question || state.lessonId !== PRONOUN_MATCH_ID || state.resolved) return;

  if (!isPronounMatchCorrect(question)) {
    recordPronounRetry();
    return;
  }

  completePronounMatchQuestion(getPronounMatchFeedback(question, true));
}

function updateUnderlinePalette() {
  el.underlinePalette.querySelectorAll(".underline-color-btn").forEach((chip) => {
    chip.classList.toggle("selected", Number(chip.dataset.colorIndex) === state.selectedUnderlineColor);
  });
}

function getUnderlineTokenFromPoint(event) {
  const target = document.elementFromPoint(event.clientX, event.clientY);
  return target?.closest?.(".underline-token") || null;
}

function markUnderlineDraft(token) {
  const index = Number(token?.dataset.tokenIndex);
  if (!Number.isFinite(index) || state.underlineDragIndexes.includes(index)) return;

  state.underlineDragIndexes.push(index);
  renderUnderlineDraft();
}

function renderUnderlineDraft() {
  el.underlineBoard.querySelectorAll(".underline-token").forEach((token) => {
    delete token.dataset.draft;
  });
  if (!state.underlineDragIndexes.length) return;

  const start = Math.min(...state.underlineDragIndexes);
  const end = Math.max(...state.underlineDragIndexes);
  for (let index = start; index <= end; index += 1) {
    const token = el.underlineBoard.querySelector(`.underline-token[data-token-index="${index}"]`);
    if (token) {
      token.dataset.draft = String(state.selectedUnderlineColor);
    }
  }
}

function startUnderlineDrag(event) {
  if (state.resolved || state.lessonId !== SENTENCE_UNDERLINE_ID) return;

  const token = getUnderlineTokenFromPoint(event);
  if (!token) return;

  event.preventDefault();
  state.underlineDragActive = true;
  state.underlineDragIndexes = [];
  el.underlineBoard.setPointerCapture?.(event.pointerId);
  markUnderlineDraft(token);
  playUiSound("step");
}

function moveUnderlineDrag(event) {
  if (!state.underlineDragActive || state.resolved) return;

  event.preventDefault();
  const token = getUnderlineTokenFromPoint(event);
  if (token) {
    markUnderlineDraft(token);
  }
}

function clearUnderlineDraft() {
  el.underlineBoard.querySelectorAll(".underline-token").forEach((token) => {
    delete token.dataset.draft;
  });
}

function finishUnderlineDrag(event) {
  if (!state.underlineDragActive) return;

  event.preventDefault();
  const token = getUnderlineTokenFromPoint(event);
  if (token) {
    markUnderlineDraft(token);
  }

  const indexes = state.underlineDragIndexes;
  state.underlineDragActive = false;
  state.underlineDragIndexes = [];
  clearUnderlineDraft();
  if (!indexes.length) return;

  const start = Math.min(...indexes);
  const end = Math.max(...indexes);
  const group = String(state.selectedUnderlineColor);
  for (let index = start; index <= end; index += 1) {
    const underlineToken = el.underlineBoard.querySelector(`.underline-token[data-token-index="${index}"]`);
    if (underlineToken) {
      underlineToken.dataset.group = group;
    }
  }

  state.selectedUnderlineColor = (state.selectedUnderlineColor + 1) % UNDERLINE_COLOR_COUNT;
  updateUnderlinePalette();
  updateUnderlineControls();
  playUiSound("step");
}

function cancelUnderlineDrag() {
  if (!state.underlineDragActive) return;

  state.underlineDragActive = false;
  state.underlineDragIndexes = [];
  clearUnderlineDraft();
}

function resetSentenceUnderline() {
  if (state.resolved) return;

  el.underlineBoard.querySelectorAll(".underline-token").forEach((button) => {
    delete button.dataset.group;
  });
  state.selectedUnderlineColor = 0;
  updateUnderlinePalette();
  updateUnderlineControls();
  playUiSound("next");
}

function updateUnderlineControls() {
  const hasSelection = [...el.underlineBoard.querySelectorAll(".underline-token")]
    .some((button) => button.dataset.group !== undefined);
  el.resetUnderlineBtn.disabled = !hasSelection;
  el.confirmUnderlineBtn.disabled = !hasSelection;
}

function normalizeUnderlineToken(token) {
  return token.toLowerCase().replace(/[^a-z]/g, "");
}

function getExpectedUnderlineTokens(question) {
  return question.segments.flatMap((segment, segmentIndex) => {
    const canStartNextSentence = segmentIndex < question.segments.length - 1;

    return segment.map((token, tokenIndex) => ({
      group: segmentIndex,
      optional: canStartNextSentence
        && tokenIndex === segment.length - 1
        && OPTIONAL_UNDERLINE_CONNECTORS.has(normalizeUnderlineToken(token))
    }));
  });
}

function getPickedUnderlineGroups() {
  return [...el.underlineBoard.querySelectorAll(".underline-token")].map((button) => {
    if (button.dataset.group === undefined) return null;
    return Number(button.dataset.group);
  });
}

function isUnderlineAnswerMatched(question, pickedGroups) {
  const expectedTokens = getExpectedUnderlineTokens(question);
  if (pickedGroups.length !== expectedTokens.length) return false;

  const colorMap = new Map();
  let nextGroup = 0;

  return pickedGroups.every((group, index) => {
    const expected = expectedTokens[index];
    if (expected.optional) return true;
    if (group === null) return false;
    if (!colorMap.has(group)) {
      colorMap.set(group, nextGroup);
      nextGroup += 1;
    }
    return colorMap.get(group) === expected.group;
  });
}

function getUnderlineFeedback(question, isCorrect) {
  const count = question.segments.length;
  const answer = question.segments
    .map((segment, index) => `${index + 1}. ${segment.join(" ")}`)
    .join("  ");

  return [
    { text: isCorrect ? `正確，這一句有 ${count} 個句子。` : `這一句有 ${count} 個句子。` },
    { text: `正確答案：${answer}`, className: "answer-line" }
  ];
}

function submitSentenceUnderline() {
  const question = currentQuestion();
  if (!question || state.lessonId !== SENTENCE_UNDERLINE_ID || state.resolved) return;

  const pickedGroups = getPickedUnderlineGroups();
  const matched = isUnderlineAnswerMatched(question, pickedGroups);

  if (!matched) {
    recordWrong(getUnderlineFeedback(question, false));
    return;
  }

  completeVerbLessonQuestion(getUnderlineFeedback(question, true));
}

function nextQuestion(options = {}) {
  cancelSpeech();
  const wasLastQuestion = state.index >= state.questions.length - 1;
  state.index += 1;
  renderQuestion();
  if (options.playSound !== false) {
    playUiSound(wasLastQuestion ? "complete" : "next");
  }
}

function renderComplete() {
  const total = state.questions.length;
  const percent = window.GrammarCore?.getScorePercent
    ? window.GrammarCore.getScorePercent(state.score, total)
    : total ? Math.round((state.score / total) * 100) : 0;
  state.reviewQuestions = window.GrammarCore?.getReviewQuestions
    ? window.GrammarCore.getReviewQuestions(state.questions, state.missedQuestionIds)
    : state.questions.filter((question) => state.missedQuestionIds.includes(question.id));

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
    chip.textContent = getQuestionPrompt(question);
    el.reviewSummary.append(chip);
  });

  if (state.reviewQuestions.length > 6) {
    const chip = document.createElement("span");
    chip.textContent = `+${state.reviewQuestions.length - 6}`;
    el.reviewSummary.append(chip);
  }
}

function getQuestionPrompt(question) {
  if (question.type === "countable") return question.sentence;
  if (question.type === "pronoun-sentence") return question.sentence;
  if (question.type === "verb-table") return question.zh;
  return question.zh || question.sentence || question.text || "";
}

function getResultMessage(percent, mistakes, mode) {
  if (mode === "review" && mistakes === 0) return "錯題已清晒，返去挑戰新一輪。";
  if (mode === "review") return "差少少，再重練今輪錯題就得。";
  if (state.lessonId === COUNTABLE_NOUN_ID && percent === 100 && mistakes === 0) return "滿分！可數名詞預設加 s 呢個盲點已經打通。";
  if (state.lessonId === COUNTABLE_NOUN_ID && percent >= 80) return "好穩陣！繼續留意 a/an、the 同不可數名詞。";
  if (state.lessonId === COUNTABLE_NOUN_ID) return "慢慢嚟，先問自己：泛指？一個？指定？不可數？";
  if (state.lessonId === VERB_TABLE_ID && percent === 100 && mistakes === 0) return "滿分！Verb Table 四格都配得好準。";
  if (state.lessonId === VERB_TABLE_ID && percent >= 80) return "好穩陣！繼續記住過去式同 PP 嘅分別。";
  if (state.lessonId === VERB_TABLE_ID) return "慢慢嚟，先讀現在式，再記過去式、PP、ING。";
  if (state.lessonId === PRONOUN_MATCH_ID && percent === 100 && mistakes === 0) return "滿分！主語、非主語、的、的東西都配得好準。";
  if (state.lessonId === PRONOUN_MATCH_ID && percent >= 80) return "好穩陣！繼續記住 my/mine、your/yours 呢類分別。";
  if (state.lessonId === PRONOUN_MATCH_ID) return "慢慢嚟，先分清楚主語、非主語、的、的東西。";
  if (state.lessonId === PRONOUN_SENTENCE_ID && percent === 100 && mistakes === 0) return "滿分！你可以直接用位置判斷代名詞。";
  if (state.lessonId === PRONOUN_SENTENCE_ID && percent >= 80) return "好穩陣！繼續留意名詞前後有冇名詞。";
  if (state.lessonId === PRONOUN_SENTENCE_ID) return "慢慢嚟，先分清主語、非主語、的、的東西。";
  if (state.lessonId === SENTENCE_UNDERLINE_ID && percent === 100 && mistakes === 0) return "滿分！你分到每個句子嘅邊界。";
  if (state.lessonId === SENTENCE_UNDERLINE_ID && percent >= 80) return "好穩陣！繼續留意 that、and、but、so、or 後面。";
  if (state.lessonId === SENTENCE_UNDERLINE_ID) return "慢慢嚟，先搵主語同動詞，再分顏色。";
  if (state.lessonId === QUIZ1_ID && percent === 100 && mistakes === 0) return "滿分！你可以由中文準確砌出英文句子。";
  if (state.lessonId === QUIZ1_ID && percent >= 80) return "好穩陣！繼續練主語、動詞同句尾次序。";
  if (state.lessonId === QUIZ1_ID) return "慢慢嚟，先搵主語，再搵動詞，最後補完整句。";
  if (state.lessonId === LESSON2_ID && percent === 100 && mistakes === 0) return "滿分！你記得一句句子只可以有一個動詞。";
  if (state.lessonId === LESSON2_ID && percent >= 80) return "好穩陣！繼續留意 ING / PP 不當動詞。";
  if (state.lessonId === LESSON2_ID) return "慢慢嚟，先數現在式、過去式同 be 動詞。";
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
  if (!question?.english || !window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") return;

  playUiSound("step");
  cancelSpeech();
  const utterance = new SpeechSynthesisUtterance(question.english);
  utterance.lang = "en-US";
  utterance.rate = 0.88;
  utterance.onstart = () => el.englishCard.classList.add("speaking");
  utterance.onend = () => el.englishCard.classList.remove("speaking");
  utterance.onerror = () => el.englishCard.classList.remove("speaking");
  window.speechSynthesis.speak(utterance);
}

function getVerbTableReferenceBank() {
  return Array.isArray(window.GRAMMAR_VERB_BANK) ? window.GRAMMAR_VERB_BANK : [];
}

function getVerbTableReferenceKey(forms) {
  return forms.map((part) => String(part || "").trim().toLowerCase()).join("|");
}

function getVerbTableReferenceAudioUrl(forms) {
  return window.GRAMMAR_VERB_AUDIO_MANIFEST?.[getVerbTableReferenceKey(forms)] || "";
}

function getVerbTableReferenceImageEntry(forms) {
  return window.GRAMMAR_VERB_IMAGE_MANIFEST?.[getVerbTableReferenceKey(forms)] || null;
}

function stopVerbTableReferenceAudio() {
  activeVerbTableReferenceAudioToken += 1;
  if (activeVerbTableReferenceAudio) {
    try {
      activeVerbTableReferenceAudio.pause();
      activeVerbTableReferenceAudio.currentTime = 0;
    } catch (_error) {
      // Audio may already be gone on some mobile browsers.
    }
    activeVerbTableReferenceAudio = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  document.querySelectorAll(".verb-table-reference-row.speaking").forEach((row) => {
    row.classList.remove("speaking");
  });
}

function createVerbTableReferenceCell(label, value, className = "") {
  const cell = document.createElement("span");
  cell.className = `verb-table-reference-cell${className ? ` ${className}` : ""}`;
  cell.dataset.label = label;
  cell.textContent = value;
  return cell;
}

function createVerbTableReferenceChineseCell(zh, forms) {
  const cell = createVerbTableReferenceCell("中文", zh, "chinese");
  const entry = getVerbTableReferenceImageEntry(forms);
  if (!entry?.src) return cell;

  const imageWrap = document.createElement("span");
  imageWrap.className = "verb-table-reference-image-wrap";

  const image = document.createElement("img");
  image.className = "verb-table-reference-image";
  image.src = getVersionedVerbTableImageSrc(entry.src);
  image.alt = `${zh} 的圖片提示`;
  image.loading = "lazy";
  image.decoding = "async";
  image.draggable = false;

  imageWrap.append(image);
  cell.append(imageWrap);
  return cell;
}

function createVerbTableReferenceRow(verb, index) {
  const [zh, present, past, pp, ing] = verb;
  const forms = [present, past, pp, ing];
  const row = document.createElement("div");
  row.className = "verb-table-reference-row";
  row.tabIndex = 0;
  row.setAttribute("role", "button");
  row.setAttribute("aria-label", `讀出 ${present} 四式`);
  row.dataset.referenceIndex = String(index);
  row.dataset.forms = JSON.stringify(forms);
  row.dataset.search = [zh, ...forms].join(" ").toLowerCase();

  row.append(
    createVerbTableReferenceChineseCell(zh, forms),
    createVerbTableReferenceCell("Present", present),
    createVerbTableReferenceCell("Past", past),
    createVerbTableReferenceCell("PP", pp),
    createVerbTableReferenceCell("ING", ing)
  );

  return row;
}

function renderVerbTableReferenceRows() {
  if (!el.verbTableReferenceBody || !el.verbTableReferenceCount) return;

  if (verbTableReferenceRendered) {
    stopVerbTableReferenceAudio();
  }
  const query = getTextEntryValue(el.verbTableReferenceSearch).trim().toLowerCase();
  const bank = getVerbTableReferenceBank();
  const rows = bank.filter((verb) => !query || verb.join(" ").toLowerCase().includes(query));
  el.verbTableReferenceBody.replaceChildren(...rows.map(createVerbTableReferenceRow));
  el.verbTableReferenceCount.textContent = `${rows.length}/${bank.length} verbs`;
  verbTableReferenceRendered = true;
}

function hideVerbTableReferenceSearchKeyboard() {
  deactivateTextEntryTarget("verbReference");
  el.verbTableReferenceSearch?.closest(".verb-table-reference-search")?.classList.remove("is-searching");
}

function showVerbTableReferenceSearchKeyboard() {
  if (!el.verbTableReferenceSearch) return;
  activateTextEntryTarget("verbReference");
  el.verbTableReferenceSearch.closest(".verb-table-reference-search")?.classList.add("is-searching");
}

function toggleVerbTableReferenceSearchKeyboard() {
  if (activeTextEntryTarget === "verbReference") {
    hideVerbTableReferenceSearchKeyboard();
    return;
  }

  showVerbTableReferenceSearchKeyboard();
}

function openVerbTableReference(event) {
  event?.preventDefault();
  event?.stopPropagation();
  if (!el.verbTableReferenceModal) return;

  hideVerbTableReferenceSearchKeyboard();
  renderVerbTableReferenceRows();
  el.verbTableReferenceModal.classList.remove("hidden");
  el.verbTableReferenceModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  playUiSound("step");
}

function closeVerbTableReference() {
  if (!el.verbTableReferenceModal || el.verbTableReferenceModal.classList.contains("hidden")) return;

  stopVerbTableReferenceAudio();
  hideVerbTableReferenceSearchKeyboard();
  el.verbTableReferenceModal.classList.add("hidden");
  el.verbTableReferenceModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  playUiSound("next");
}

function getVerbTableReferenceForms(row) {
  try {
    const forms = JSON.parse(row?.dataset.forms || "[]");
    return Array.isArray(forms) ? forms : [];
  } catch (_error) {
    return [];
  }
}

function clearVerbTableReferenceSpeaking(row, token, startedAt) {
  const elapsed = Date.now() - startedAt;
  const delay = Math.max(0, VERB_TABLE_REFERENCE_MIN_ACTIVE_MS - elapsed);
  setTimeout(() => {
    if (token === activeVerbTableReferenceAudioToken) {
      row.classList.remove("speaking");
    }
  }, delay);
}

function speakVerbTableReferenceFallback(forms, row, token, startedAt) {
  if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
    clearVerbTableReferenceSpeaking(row, token, startedAt);
    return;
  }

  const speakPart = (index) => {
    if (token !== activeVerbTableReferenceAudioToken) return;
    if (index >= forms.length) {
      clearVerbTableReferenceSpeaking(row, token, startedAt);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(forms[index]);
    utterance.lang = "en-US";
    utterance.rate = 0.84;
    utterance.pitch = 1;
    utterance.onend = () => {
      if (token !== activeVerbTableReferenceAudioToken) return;
      if (index >= forms.length - 1) {
        clearVerbTableReferenceSpeaking(row, token, startedAt);
        return;
      }
      setTimeout(() => speakPart(index + 1), VERB_TABLE_REFERENCE_SPEAK_GAP_MS);
    };
    utterance.onerror = () => clearVerbTableReferenceSpeaking(row, token, startedAt);
    window.speechSynthesis.speak(utterance);
  };

  speakPart(0);
}

async function speakVerbTableReferenceRow(row) {
  if (!row) return;
  const forms = getVerbTableReferenceForms(row);
  if (forms.length !== 4) return;

  stopVerbTableReferenceAudio();
  const token = activeVerbTableReferenceAudioToken;
  const startedAt = Date.now();
  row.classList.add("speaking");
  const audioUrl = getVerbTableReferenceAudioUrl(forms);

  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      activeVerbTableReferenceAudio = audio;
      audio.volume = 1;
      audio.preload = "auto";
      audio.onended = () => {
        if (token === activeVerbTableReferenceAudioToken) {
          activeVerbTableReferenceAudio = null;
          clearVerbTableReferenceSpeaking(row, token, startedAt);
        }
      };
      audio.onerror = () => {
        if (token === activeVerbTableReferenceAudioToken) {
          activeVerbTableReferenceAudio = null;
          speakVerbTableReferenceFallback(forms, row, token, startedAt);
        }
      };
      await audio.play();
      return;
    } catch (_error) {
      if (token !== activeVerbTableReferenceAudioToken) return;
    }
  }

  speakVerbTableReferenceFallback(forms, row, token, startedAt);
}

function handleVerbTableReferenceBodyClick(event) {
  const row = event.target.closest(".verb-table-reference-row");
  if (!row || !el.verbTableReferenceBody?.contains(row)) return;
  event.preventDefault();
  speakVerbTableReferenceRow(row);
}

function handleVerbTableReferenceBodyKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  const row = event.target.closest(".verb-table-reference-row");
  if (!row || !el.verbTableReferenceBody?.contains(row)) return;
  event.preventDefault();
  speakVerbTableReferenceRow(row);
}

document.addEventListener("pointerdown", unlockAudio, { passive: true });
document.addEventListener("keydown", unlockAudio);
document.addEventListener("contextmenu", (event) => event.preventDefault());

document.querySelectorAll("[data-start-lesson]").forEach((button) => {
  button.addEventListener("click", () => startLesson(button.dataset.startLesson));
});
el.appTabs.forEach((button) => {
  button.addEventListener("click", () => switchAppTab(button.dataset.appTab));
});
document.querySelector("[data-back-menu]").addEventListener("click", backToMenu);
document.querySelector("[data-result-menu]").addEventListener("click", backToMenu);
document.querySelector("[data-restart-lesson]").addEventListener("click", () => startLesson(state.lessonId));
el.openVerbTableReferenceBtn?.addEventListener("click", openVerbTableReference);
document.querySelectorAll("[data-close-verb-table-reference]").forEach((button) => {
  button.addEventListener("click", closeVerbTableReference);
});
el.verbTableReferenceSearch?.addEventListener("click", showVerbTableReferenceSearchKeyboard);
el.verbTableReferenceSearchToggle?.addEventListener("click", toggleVerbTableReferenceSearchKeyboard);
el.verbTableReferenceBody?.addEventListener("click", handleVerbTableReferenceBodyClick);
el.verbTableReferenceBody?.addEventListener("keydown", handleVerbTableReferenceBodyKeydown);
document.addEventListener("keydown", (event) => {
  if (handleTextEntryDocumentKeydown(event)) return;

  if (event.key === "Escape") {
    closeVerbTableReference();
  }
});
el.reviewMistakesBtn.addEventListener("click", startMistakeReview);
el.nextBtn.addEventListener("click", nextQuestion);
el.restartBtn.addEventListener("click", () => startLesson(state.lessonId));
el.englishCard.addEventListener("click", speakCurrentEnglish);
el.soundToggle.addEventListener("click", toggleSound);
el.practiceCountInput.addEventListener("input", updatePracticeCount);
el.practiceCountInput.addEventListener("change", () => playUiSound("step"));

document.querySelectorAll("[data-verb-choice]").forEach((button) => {
  button.addEventListener("click", () => answerVerbChoice(button.dataset.verbChoice));
});

document.querySelectorAll("[data-needs-be]").forEach((button) => {
  button.addEventListener("click", () => answerNeedsBe(button.dataset.needsBe));
});

document.querySelectorAll("[data-be-form]").forEach((button) => {
  button.addEventListener("click", () => answerBeForm(button.dataset.beForm));
});

document.querySelectorAll("[data-sentence-judgment]").forEach((button) => {
  button.addEventListener("click", () => answerSentenceJudgment(button.dataset.sentenceJudgment));
});

document.querySelectorAll("[data-verb-count]").forEach((button) => {
  button.addEventListener("click", () => answerVerbCount(button.dataset.verbCount));
});

el.submitVerbsBtn.addEventListener("click", submitVerbTokens);
el.submitCountableCorrectionBtn?.addEventListener("click", submitCountableCorrection);
el.countableCorrectionInput.addEventListener("click", () => activateTextEntryTarget("countable"));
el.resetBuilderBtn.addEventListener("click", resetSentenceBuilder);
el.confirmBuilderBtn.addEventListener("click", submitSentenceBuilder);
el.underlineBoard.addEventListener("pointerdown", startUnderlineDrag);
el.underlineBoard.addEventListener("pointermove", moveUnderlineDrag);
el.underlineBoard.addEventListener("pointerup", finishUnderlineDrag);
el.underlineBoard.addEventListener("pointercancel", cancelUnderlineDrag);
el.resetUnderlineBtn.addEventListener("click", resetSentenceUnderline);
el.confirmUnderlineBtn.addEventListener("click", submitSentenceUnderline);
el.resetPronounBtn.addEventListener("click", resetPronounMatch);
el.confirmPronounBtn.addEventListener("click", submitPronounMatch);
el.verbTableKeyboard?.querySelectorAll("[data-verb-table-key]").forEach((button) => {
  button.addEventListener("click", () => handleVerbTableKeyboardKey(button.dataset.verbTableKey));
});
el.resetVerbTableBtn?.addEventListener("click", resetVerbTable);
el.confirmVerbTableBtn?.addEventListener("click", submitVerbTable);

setTextEntryValue(el.countableCorrectionInput, "");
setTextEntryValue(el.verbTableReferenceSearch, "");
updateMenuProgress();
syncPracticeCount();
syncSoundToggle();
updateLiveStats();
