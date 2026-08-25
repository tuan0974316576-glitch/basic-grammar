const FIREBASE_VERSION = "10.12.5";
const DRAFTS = "grammarQuestionDrafts";
const PUBLISHED = "grammarQuestionBanks";
const helper = window.GrammarQuestionBankAdmin;

const state = {
  firebase: null,
  user: null,
  role: "",
  lessonId: "lesson1",
  banks: helper.canonicalBanks(),
  source: "bundled",
  questionIndex: 0,
  visibleIndexes: [],
  search: "",
  dirty: false
};

const el = {
  cloudStatus: document.querySelector("#cloud-status"),
  loginPanel: document.querySelector("#login-panel"),
  loginForm: document.querySelector("#login-form"),
  loginStudentId: document.querySelector("#login-student-id"),
  loginPin: document.querySelector("#login-pin"),
  loginButton: document.querySelector("#login-button"),
  loginStatus: document.querySelector("#login-status"),
  workspace: document.querySelector("#workspace"),
  accountLabel: document.querySelector("#account-label"),
  lessonList: document.querySelector("#lesson-list"),
  editorKicker: document.querySelector("#editor-kicker"),
  editorTitle: document.querySelector("#editor-title"),
  sourceBadge: document.querySelector("#source-badge"),
  questionCount: document.querySelector("#question-count"),
  questionSearch: document.querySelector("#question-search"),
  questionPosition: document.querySelector("#question-position"),
  previousButton: document.querySelector("#previous-question-button"),
  nextButton: document.querySelector("#next-question-button"),
  questionForm: document.querySelector("#question-form"),
  validationStatus: document.querySelector("#validation-status"),
  addButton: document.querySelector("#add-button"),
  deleteButton: document.querySelector("#delete-button"),
  saveDraftButton: document.querySelector("#save-draft-button"),
  publishButton: document.querySelector("#publish-button"),
  refreshButton: document.querySelector("#refresh-button")
};

function setStatus(node, message = "", type = "") {
  if (!node) return;
  node.className = `status-line${type ? ` ${type}` : ""}`;
  node.textContent = message;
}

function setCloudStatus(message) {
  if (el.cloudStatus) el.cloudStatus.textContent = message;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function currentBank() {
  return state.banks[state.lessonId] || helper.canonicalBanks()[state.lessonId];
}

function currentQuestion() {
  return currentBank().questions[state.questionIndex] || null;
}

function markDirty() {
  state.dirty = true;
  if (el.sourceBadge && el.sourceBadge.textContent !== "NEW") el.sourceBadge.textContent = "UNSAVED";
}

function textField(label, key, value = "", options = {}) {
  const wrapper = document.createElement("label");
  if (options.className) wrapper.className = options.className;
  const caption = document.createElement("span");
  caption.textContent = label;
  const field = options.multiline ? document.createElement("textarea") : document.createElement("input");
  field.dataset.field = key;
  field.value = String(value ?? "");
  if (options.placeholder) field.placeholder = options.placeholder;
  if (options.multiline) {
    field.rows = options.rows || 3;
    if (options.short) field.classList.add("short");
  } else {
    field.type = options.type || "text";
  }
  wrapper.append(caption, field);
  return wrapper;
}

function selectField(label, key, value, options) {
  const wrapper = document.createElement("label");
  const caption = document.createElement("span");
  caption.textContent = label;
  const select = document.createElement("select");
  select.dataset.field = key;
  options.forEach(([optionValue, optionLabel]) => {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = optionLabel;
    option.selected = String(optionValue) === String(value);
    select.append(option);
  });
  wrapper.append(caption, select);
  return wrapper;
}

function checkboxField(label, key, checked) {
  const wrapper = document.createElement("label");
  wrapper.className = "toggle-row";
  const field = document.createElement("input");
  field.type = "checkbox";
  field.dataset.field = key;
  field.checked = Boolean(checked);
  const caption = document.createElement("span");
  caption.textContent = label;
  wrapper.append(field, caption);
  return wrapper;
}

function grid(...children) {
  const node = document.createElement("div");
  node.className = "question-form-grid";
  node.append(...children);
  return node;
}

function wide(field) {
  field.classList.add("wide");
  return field;
}

function arrayText(value) {
  return Array.isArray(value) ? value.join("\n") : String(value || "");
}

function renderQuestionForm(question) {
  const form = el.questionForm;
  form.replaceChildren();
  if (!question) {
    form.append(document.createTextNode("未有題目。按「新增題目」開始。"));
    return;
  }
  const lessonId = state.lessonId;
  const forms = question.forms || {};
  const add = (...nodes) => form.append(...nodes);
  const explanation = question.explanation || question.note || "";

  add(textField("題目編號（系統使用）", "id", question.id, { placeholder: "例如 v101" }));
  if (lessonId === "lesson1") {
    add(grid(
      selectField("題型", "type", question.type, [["action", "動作動詞"], ["be", "be 動詞"], ["adjective", "形容詞"]]),
      textField("中文句子", "zh", question.zh, { placeholder: "我吃蘋果。" })
    ));
    add(wide(textField("英文句子", "english", question.english, { placeholder: "I eat an apple." })));
    add(wide(textField("老師提示／解釋", "note", question.note, { multiline: true, placeholder: "「吃」是動作動詞。" })));
  } else if (lessonId === "lesson2") {
    add(grid(textField("中文句子", "zh", question.zh), textField("英文句子", "sentence", question.sentence)));
    add(grid(selectField("句子判斷", "isCorrect", question.isCorrect ? "true" : "false", [["true", "正確句"], ["false", "需要改正"]]), textField("動詞數量", "verbCount", question.verbCount, { type: "number" })));
    add(wide(textField("解釋", "explanation", question.explanation, { multiline: true })));
    add(wide(textField("正確寫法／改正提示", "correction", question.correction, { multiline: true })));
  } else if (lessonId === "quiz1") {
    add(wide(textField("中文句子", "zh", question.zh)));
    add(wide(textField("正確英文（每個詞一行）", "answerList", arrayText(question.answer), { multiline: true, placeholder: "She\neats\napples." })));
    add(wide(textField("錯誤選項（每個詞一行）", "distractorsList", arrayText(question.distractors), { multiline: true, placeholder: "eat\nis" })));
  } else if (lessonId === "sentence-underline") {
    add(wide(textField("英文句子", "text", question.text, { multiline: true })));
    add(wide(textField("分句（每行一段；詞語用空格分開）", "segmentsList", (question.segments || []).map((segment) => segment.join(" ")).join("\n"), { multiline: true })));
  } else if (lessonId === "pronoun-match") {
    add(textField("中文提示", "zh", question.zh));
    add(grid(
      textField("主語（I / he）", "forms.subject", forms.subject),
      textField("非主語（me / him）", "forms.object", forms.object),
      textField("的＋名詞（my / his）", "forms.possessiveAdjective", forms.possessiveAdjective),
      textField("的東西（mine / his）", "forms.possessivePronoun", forms.possessivePronoun)
    ));
  } else if (lessonId === "pronoun-sentence") {
    add(grid(textField("中文句子", "zh", question.zh), textField("英文句子", "sentence", question.sentence)));
    add(grid(textField("正確答案", "answer", question.answer), textField("空格位置", "slotType", question.slotType)));
    add(wide(textField("選項（每行一個）", "choicesList", arrayText(question.choices), { multiline: true })));
    add(wide(textField("解釋", "explanation", question.explanation, { multiline: true })));
  } else if (lessonId === "verb-table") {
    add(textField("中文意思", "zh", question.zh));
    add(grid(textField("Present 現在式", "forms.present", forms.present), textField("Past 過去式", "forms.past", forms.past), textField("PP", "forms.pp", forms.pp), textField("ING", "forms.ing", forms.ing)));
    add(wide(textField("圖片／讀音由系統管理", "_assetNote", "如要換圖，請聯絡管理員。", { multiline: true, short: true })));
  } else {
    add(grid(textField("中文句子", "zh", question.zh), textField("英文句子", "sentence", question.sentence)));
    if (question.category !== undefined || ["noun-category", "modal-verb", "adjective-lesson", "adverb-lesson", "have-usage"].includes(lessonId)) {
      add(grid(textField("分類", "category", question.category || ""), textField("分類顯示名稱", "categoryLabel", question.categoryLabel || "")));
    }
    add(grid(selectField("句子判斷", "isCorrect", question.isCorrect ? "true" : "false", [["true", "正確句"], ["false", "需要改正"]]), textField("正確答案／改正後句子", "answer", question.answer || question.english || "")));
    add(wide(textField("解釋", "explanation", explanation, { multiline: true })));
    add(wide(textField("可接受答案（每行一個）", "acceptedAnswersList", arrayText(question.acceptedAnswers), { multiline: true, placeholder: "可留空，系統會使用正確答案。" })));
    add(checkboxField("答案需要分大小寫", "caseSensitive", question.caseSensitive));
  }
  form.querySelectorAll("[data-field]").forEach((field) => field.addEventListener("input", markDirty));
  form.querySelectorAll("select, input[type=checkbox]").forEach((field) => field.addEventListener("change", markDirty));
}

function readField(key) {
  return el.questionForm.querySelector(`[data-field="${CSS.escape(key)}"]`);
}

function lines(value) {
  return String(value || "").split(/\n|,/).map((item) => item.trim()).filter(Boolean);
}

function readQuestionForm() {
  const current = currentQuestion();
  if (!current) return null;
  const question = clone(current);
  const value = (key) => readField(key)?.value?.trim() || "";
  const boolValue = (key) => value(key) === "true";
  const set = (key, next) => { if (next !== "") question[key] = next; };
  set("id", value("id"));
  if (state.lessonId === "lesson1") {
    set("type", value("type")); set("zh", value("zh")); set("english", value("english")); set("note", value("note"));
  } else if (state.lessonId === "lesson2") {
    set("zh", value("zh")); set("sentence", value("sentence")); question.isCorrect = boolValue("isCorrect"); question.verbCount = Number(value("verbCount")) || 0; set("explanation", value("explanation")); set("correction", value("correction"));
  } else if (state.lessonId === "quiz1") {
    set("zh", value("zh")); question.answer = lines(value("answerList")); question.distractors = lines(value("distractorsList"));
  } else if (state.lessonId === "sentence-underline") {
    set("text", value("text")); question.segments = String(value("segmentsList")).split("\n").map((row) => row.trim().split(/\s+/).filter(Boolean)).filter((row) => row.length);
  } else if (state.lessonId === "pronoun-match") {
    set("zh", value("zh")); question.forms = { ...(question.forms || {}), subject: value("forms.subject"), object: value("forms.object"), possessiveAdjective: value("forms.possessiveAdjective"), possessivePronoun: value("forms.possessivePronoun") };
  } else if (state.lessonId === "pronoun-sentence") {
    set("zh", value("zh")); set("sentence", value("sentence")); set("answer", value("answer")); set("slotType", value("slotType")); question.choices = lines(value("choicesList")); set("explanation", value("explanation"));
  } else if (state.lessonId === "verb-table") {
    set("zh", value("zh")); question.forms = { ...(question.forms || {}), present: value("forms.present"), past: value("forms.past"), pp: value("forms.pp"), ing: value("forms.ing") };
  } else {
    set("zh", value("zh")); set("sentence", value("sentence")); set("category", value("category")); set("categoryLabel", value("categoryLabel")); question.isCorrect = boolValue("isCorrect");
    const answer = value("answer"); set("answer", answer); if (Object.prototype.hasOwnProperty.call(question, "english")) question.english = answer;
    set("explanation", value("explanation")); question.acceptedAnswers = lines(value("acceptedAnswersList")); question.caseSensitive = Boolean(readField("caseSensitive")?.checked);
  }
  return question;
}

function commitCurrentQuestion() {
  const question = readQuestionForm();
  if (question) currentBank().questions[state.questionIndex] = question;
}

function updateVisibleIndexes() {
  const query = state.search.trim().toLowerCase();
  state.visibleIndexes = currentBank().questions.map((question, index) => ({ question, index })).filter(({ question }) => !query || JSON.stringify(question).toLowerCase().includes(query)).map(({ index }) => index);
  if (!state.visibleIndexes.includes(state.questionIndex)) state.questionIndex = state.visibleIndexes[0] ?? 0;
}

function renderLessonList() {
  el.lessonList.replaceChildren(...helper.lessonConfigs.map((config) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `lesson-button${state.lessonId === config.id ? " active" : ""}`;
    button.innerHTML = `<span>${config.kicker}</span><strong>${config.title}</strong><span>${state.banks[config.id]?.questions?.length || 0} 題</span>`;
    button.addEventListener("click", () => selectLesson(config.id));
    return button;
  }));
}

function renderEditor() {
  const config = helper.configFor(state.lessonId);
  const bank = currentBank();
  updateVisibleIndexes();
  el.editorKicker.textContent = config.kicker;
  el.editorTitle.textContent = config.title;
  el.sourceBadge.textContent = state.dirty ? "UNSAVED" : state.source.toUpperCase();
  el.questionCount.textContent = `${bank.questions.length} 題`;
  const position = state.visibleIndexes.indexOf(state.questionIndex);
  el.questionPosition.textContent = state.visibleIndexes.length ? `第 ${position + 1} / ${state.visibleIndexes.length} 題` : "沒有符合題目";
  el.previousButton.disabled = position <= 0;
  el.nextButton.disabled = position < 0 || position >= state.visibleIndexes.length - 1;
  el.deleteButton.disabled = bank.questions.length <= 1;
  renderQuestionForm(bank.questions[state.questionIndex]);
  renderLessonList();
}

async function selectLesson(lessonId) {
  if (state.dirty && !window.confirm("目前題目未儲存，確定放棄修改？")) return;
  state.lessonId = lessonId; state.questionIndex = 0; state.search = ""; state.dirty = false; state.source = "bundled";
  el.questionSearch.value = "";
  state.banks = helper.canonicalBanks();
  renderEditor();
  await loadRemoteBank(lessonId);
}

async function loadRemoteBank(lessonId) {
  if (!state.firebase?.db || !state.user || state.role !== "teacher") return;
  const modules = state.firebase.modules;
  const [draftSnapshot, publishedSnapshot] = await Promise.all([
    modules.getDoc(modules.doc(state.firebase.db, DRAFTS, lessonId)).catch(() => null),
    modules.getDoc(modules.doc(state.firebase.db, PUBLISHED, lessonId)).catch(() => null)
  ]);
  const draftVersion = Number(draftSnapshot?.data()?.version || 0);
  const publishedVersion = Number(publishedSnapshot?.data()?.version || 0);
  const snapshot = draftSnapshot?.exists() && draftVersion > publishedVersion ? draftSnapshot : publishedSnapshot?.exists() ? publishedSnapshot : draftSnapshot;
  if (!snapshot?.exists() || !Array.isArray(snapshot.data()?.questions)) return;
  const data = snapshot.data();
  state.banks[lessonId] = { lessonId, kicker: data.kicker || helper.configFor(lessonId).kicker, title: data.title || helper.configFor(lessonId).title, questions: data.questions };
  state.source = draftVersion > publishedVersion ? "draft" : "published";
  state.dirty = false;
  renderEditor();
}

function applyAuthUi() {
  const signedIn = Boolean(state.user);
  const isTeacher = signedIn && state.role === "teacher";
  el.loginPanel.classList.toggle("hidden", signedIn);
  el.workspace.classList.toggle("hidden", !isTeacher);
  el.accountLabel.textContent = signedIn ? `${state.user.displayName || state.user.email || state.user.uid} (${state.role || "user"})` : "";
  setCloudStatus(isTeacher ? "TEACHER ONLINE" : signedIn ? "READ ONLY" : "LOGIN REQUIRED");
  [el.saveDraftButton, el.publishButton, el.addButton, el.deleteButton].forEach((button) => { if (button) button.disabled = !isTeacher; });
}

async function refreshRole(user) {
  if (!user) { state.role = ""; return; }
  const token = await user.getIdTokenResult(true).catch(() => null);
  state.role = token?.claims?.role === "teacher" ? "teacher" : "student";
}

async function login(event) {
  event.preventDefault();
  const studentId = String(el.loginStudentId.value || "").trim().toUpperCase();
  const pin = String(el.loginPin.value || "").trim();
  if (!studentId || !pin || !state.firebase) { setStatus(el.loginStatus, "請輸入 Teacher ID / PIN，並稍等 Firebase 準備好。", "error"); return; }
  el.loginButton.disabled = true; setStatus(el.loginStatus, "登入中...", "loading");
  try {
    const callable = state.firebase.modules.httpsCallable(state.firebase.functions, "studentLogin");
    const result = await callable({ studentId, pin });
    const data = result?.data || {};
    const credential = await state.firebase.modules.signInWithEmailAndPassword(state.firebase.auth, data.email, data.authPassword);
    state.user = credential.user; await refreshRole(state.user); applyAuthUi(); await loadRemoteBank(state.lessonId);
    setStatus(el.loginStatus, state.role === "teacher" ? "登入成功。" : "呢個帳號不是 teacher role。", state.role === "teacher" ? "success" : "error");
  } catch (error) { console.warn("Grammar admin login failed:", error); setStatus(el.loginStatus, "登入失敗，請檢查 Teacher ID / PIN。", "error"); }
  finally { el.loginButton.disabled = false; }
}

async function initFirebase() {
  const config = window.GRAMMAR_FIREBASE_CONFIG;
  if (!config?.apiKey) { setStatus(el.loginStatus, "未設定 Firebase config。", "error"); return; }
  const [firebaseApp, firebaseAuth, firebaseFirestore, firebaseFunctions] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-functions.js`)
  ]);
  const app = firebaseApp.initializeApp(config, "grammar-question-console");
  const auth = firebaseAuth.getAuth(app); const db = firebaseFirestore.getFirestore(app); const functions = firebaseFunctions.getFunctions(app, config.functionsRegion || "asia-east2");
  await firebaseAuth.setPersistence(auth, firebaseAuth.browserLocalPersistence).catch(() => {});
  state.firebase = { app, auth, db, functions, modules: { ...firebaseAuth, ...firebaseFirestore, ...firebaseFunctions } };
  firebaseAuth.onAuthStateChanged(auth, async (user) => { state.user = user; await refreshRole(user); applyAuthUi(); if (state.role === "teacher") await loadRemoteBank(state.lessonId); });
}

function validateAll() {
  commitCurrentQuestion();
  const errors = helper.validateQuestions(state.lessonId, currentBank().questions);
  setStatus(el.validationStatus, errors.length ? errors.slice(0, 8).join(" ") : `格式正確，共 ${currentBank().questions.length} 題。`, errors.length ? "error" : "success");
  return !errors.length;
}

async function writeBank(collection, status) {
  if (!state.user || state.role !== "teacher") { setStatus(el.validationStatus, "請先登入 teacher role。", "error"); return; }
  if (!validateAll()) return;
  const config = helper.configFor(state.lessonId); const modules = state.firebase.modules; const payload = { lessonId: state.lessonId, kicker: config.kicker, title: config.title, questions: currentBank().questions, status, version: Date.now(), updatedAt: modules.serverTimestamp(), updatedBy: state.user.uid, ...(status === "published" ? { publishedAt: modules.serverTimestamp(), publishedBy: state.user.uid } : {}) };
  await modules.setDoc(modules.doc(state.firebase.db, collection, state.lessonId), payload, { merge: true });
  if (status === "published") await modules.setDoc(modules.doc(state.firebase.db, DRAFTS, state.lessonId), { ...payload, status: "draft" }, { merge: true });
  state.source = status; state.dirty = false; renderEditor(); setStatus(el.validationStatus, status === "published" ? "已發布；學生 app 下一次載入會讀到新題庫。" : "Draft 已儲存。", "success");
}

function moveQuestion(delta) {
  commitCurrentQuestion();
  const position = state.visibleIndexes.indexOf(state.questionIndex);
  const next = state.visibleIndexes[position + delta];
  if (next === undefined) return;
  state.questionIndex = next; renderEditor();
}

function blankQuestion() {
  const id = `new-${Date.now()}`;
  if (state.lessonId === "lesson1") return { id, type: "action", zh: "", english: "", note: "" };
  if (state.lessonId === "lesson2") return { id, sentence: "", zh: "", isCorrect: true, verbCount: 1, explanation: "", correction: "" };
  if (state.lessonId === "quiz1") return { id, zh: "", answer: [""], distractors: ["", ""] };
  if (state.lessonId === "sentence-underline") return { id, text: "", segments: [[]] };
  if (state.lessonId === "pronoun-match") return { id, zh: "", forms: { subject: "", object: "", possessiveAdjective: "", possessivePronoun: "" } };
  if (state.lessonId === "pronoun-sentence") return { id, sentence: "___", zh: "", answer: "", choices: ["", ""], slotType: "subject", explanation: "" };
  if (state.lessonId === "verb-table") return { id, zh: "", forms: { present: "", past: "", pp: "", ing: "" }, imageAsset: "", audioAsset: "" };
  return { id, category: "", categoryLabel: "", sentence: "", zh: "", isCorrect: true, answer: "", acceptedAnswers: [], explanation: "", caseSensitive: false };
}

el.loginForm.addEventListener("submit", login);
el.questionForm.addEventListener("input", markDirty);
el.questionForm.addEventListener("change", markDirty);
el.questionSearch.addEventListener("input", () => { commitCurrentQuestion(); state.search = el.questionSearch.value; renderEditor(); });
el.previousButton.addEventListener("click", () => moveQuestion(-1));
el.nextButton.addEventListener("click", () => moveQuestion(1));
el.addButton.addEventListener("click", () => { commitCurrentQuestion(); const questions = currentBank().questions; questions.push(blankQuestion()); state.questionIndex = questions.length - 1; state.search = ""; el.questionSearch.value = ""; markDirty(); renderEditor(); });
el.deleteButton.addEventListener("click", () => { if (currentBank().questions.length <= 1 || !window.confirm("確定刪除目前題目？")) return; currentBank().questions.splice(state.questionIndex, 1); state.questionIndex = Math.max(0, state.questionIndex - 1); markDirty(); renderEditor(); });
el.saveDraftButton.addEventListener("click", () => writeBank(DRAFTS, "draft").catch((error) => setStatus(el.validationStatus, `Draft 儲存失敗：${error.message}`, "error")));
el.publishButton.addEventListener("click", () => { if (window.confirm("確定發布目前課題嘅全部題目？")) writeBank(PUBLISHED, "published").catch((error) => setStatus(el.validationStatus, `Publish 失敗：${error.message}`, "error")); });
el.refreshButton.addEventListener("click", () => loadRemoteBank(state.lessonId));

renderLessonList();
renderEditor();
applyAuthUi();
initFirebase().catch((error) => { console.warn("Grammar admin init failed:", error); setStatus(el.loginStatus, `Firebase 初始化失敗：${error.message}`, "error"); });
