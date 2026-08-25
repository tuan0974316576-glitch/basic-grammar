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
  source: "bundled"
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
  questionsJson: document.querySelector("#questions-json"),
  validationStatus: document.querySelector("#validation-status"),
  formatButton: document.querySelector("#format-button"),
  addButton: document.querySelector("#add-button"),
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

function currentBank() {
  return state.banks[state.lessonId] || helper.canonicalBanks()[state.lessonId];
}

function currentQuestions() {
  const parsed = helper.parseEditorJson(el.questionsJson?.value || "");
  return parsed.errors.length ? null : parsed.value;
}

function validateEditor(showSuccess = false) {
  const parsed = helper.parseEditorJson(el.questionsJson?.value || "");
  if (parsed.errors.length) {
    setStatus(el.validationStatus, parsed.errors.join(" "), "error");
    return { valid: false, questions: null };
  }
  const errors = helper.validateQuestions(state.lessonId, parsed.value);
  if (errors.length) {
    setStatus(el.validationStatus, errors.slice(0, 8).join(" "), "error");
    return { valid: false, questions: parsed.value };
  }
  setStatus(el.validationStatus, showSuccess ? `格式正確，共 ${parsed.value.length} 題。` : "", showSuccess ? "success" : "");
  return { valid: true, questions: parsed.value };
}

function renderLessonList() {
  el.lessonList.replaceChildren(...helper.lessonConfigs.map((config) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `lesson-button${state.lessonId === config.id ? " active" : ""}`;
    button.innerHTML = `<span>${config.kicker}</span><strong>${config.title}</strong><span>${state.banks[config.id]?.questions?.length || 0} questions</span>`;
    button.addEventListener("click", () => selectLesson(config.id));
    return button;
  }));
}

function renderEditor() {
  const config = helper.configFor(state.lessonId);
  const bank = currentBank();
  el.editorKicker.textContent = config.kicker;
  el.editorTitle.textContent = config.title;
  el.sourceBadge.textContent = state.source.toUpperCase();
  el.questionCount.textContent = `${bank.questions.length} questions`;
  el.questionsJson.value = JSON.stringify(bank.questions, null, 2);
  setStatus(el.validationStatus, "");
  renderLessonList();
}

async function selectLesson(lessonId) {
  const parsed = validateEditor();
  if (!parsed.valid && state.lessonId !== lessonId) {
    const ok = window.confirm("目前內容未通過格式檢查，放棄未儲存修改？");
    if (!ok) return;
  }
  state.lessonId = lessonId;
  state.source = "bundled";
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
  const snapshot = draftSnapshot?.exists() && draftVersion > publishedVersion
    ? draftSnapshot
    : publishedSnapshot?.exists() ? publishedSnapshot : draftSnapshot;
  if (!snapshot?.exists()) return;
  const data = snapshot.data() || {};
  if (!Array.isArray(data.questions)) return;
  state.banks[lessonId] = {
    lessonId,
    kicker: data.kicker || helper.configFor(lessonId).kicker,
    title: data.title || helper.configFor(lessonId).title,
    questions: data.questions
  };
  state.source = draftSnapshot?.exists() ? "draft" : "published";
  renderEditor();
}

function applyAuthUi() {
  const signedIn = Boolean(state.user);
  const isTeacher = signedIn && state.role === "teacher";
  el.loginPanel.classList.toggle("hidden", signedIn);
  el.workspace.classList.toggle("hidden", !isTeacher);
  el.accountLabel.textContent = signedIn
    ? `${state.user.displayName || state.user.email || state.user.uid} (${state.role || "user"})`
    : "";
  setCloudStatus(isTeacher ? "TEACHER ONLINE" : signedIn ? "READ ONLY" : "LOGIN REQUIRED");
  [el.saveDraftButton, el.publishButton, el.addButton, el.formatButton].forEach((button) => {
    if (button) button.disabled = !isTeacher;
  });
}

async function refreshRole(user) {
  if (!user) {
    state.role = "";
    return;
  }
  const token = await user.getIdTokenResult(true).catch(() => null);
  state.role = token?.claims?.role === "teacher" ? "teacher" : "student";
}

async function login(event) {
  event.preventDefault();
  const studentId = String(el.loginStudentId.value || "").trim().toUpperCase();
  const pin = String(el.loginPin.value || "").trim();
  if (!studentId || !pin || !state.firebase) {
    setStatus(el.loginStatus, "請輸入 Teacher ID / PIN，並稍等 Firebase 準備好。", "error");
    return;
  }
  el.loginButton.disabled = true;
  setStatus(el.loginStatus, "登入中...", "loading");
  try {
    const callable = state.firebase.modules.httpsCallable(state.firebase.functions, "studentLogin");
    const result = await callable({ studentId, pin });
    const data = result?.data || {};
    const credential = await state.firebase.modules.signInWithEmailAndPassword(
      state.firebase.auth,
      data.email,
      data.authPassword
    );
    state.user = credential.user;
    await refreshRole(state.user);
    applyAuthUi();
    await loadRemoteBank(state.lessonId);
    setStatus(el.loginStatus, state.role === "teacher" ? "登入成功。" : "呢個帳號不是 teacher role。", state.role === "teacher" ? "success" : "error");
  } catch (error) {
    console.warn("Grammar admin login failed:", error);
    setStatus(el.loginStatus, "登入失敗，請檢查 Teacher ID / PIN。", "error");
  } finally {
    el.loginButton.disabled = false;
  }
}

async function initFirebase() {
  const config = window.GRAMMAR_FIREBASE_CONFIG;
  if (!config?.apiKey) {
    setStatus(el.loginStatus, "未設定 Firebase config。", "error");
    return;
  }
  const [firebaseApp, firebaseAuth, firebaseFirestore, firebaseFunctions] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-functions.js`)
  ]);
  const app = firebaseApp.initializeApp(config, "grammar-question-console");
  const auth = firebaseAuth.getAuth(app);
  const db = firebaseFirestore.getFirestore(app);
  const functions = firebaseFunctions.getFunctions(app, config.functionsRegion || "asia-east2");
  await firebaseAuth.setPersistence(auth, firebaseAuth.browserLocalPersistence).catch(() => {});
  state.firebase = { app, auth, db, functions, modules: { ...firebaseAuth, ...firebaseFirestore, ...firebaseFunctions } };
  firebaseAuth.onAuthStateChanged(auth, async (user) => {
    state.user = user;
    await refreshRole(user);
    applyAuthUi();
    if (state.role === "teacher") {
      await loadRemoteBank(state.lessonId);
    }
  });
}

async function writeBank(collection, status) {
  if (!state.user || state.role !== "teacher") {
    setStatus(el.validationStatus, "請先登入 teacher role。", "error");
    return;
  }
  const result = validateEditor(true);
  if (!result.valid) return;
  const config = helper.configFor(state.lessonId);
  const modules = state.firebase.modules;
  const payload = {
    lessonId: state.lessonId,
    kicker: config.kicker,
    title: config.title,
    questions: result.questions,
    status,
    version: Date.now(),
    updatedAt: modules.serverTimestamp(),
    updatedBy: state.user.uid,
    ...(status === "published" ? { publishedAt: modules.serverTimestamp(), publishedBy: state.user.uid } : {})
  };
  await modules.setDoc(
    modules.doc(state.firebase.db, collection, state.lessonId),
    payload,
    { merge: true }
  );
  if (status === "published") {
    await modules.setDoc(
      modules.doc(state.firebase.db, DRAFTS, state.lessonId),
      { ...payload, status: "draft" },
      { merge: true }
    );
  }
  state.banks[state.lessonId] = { lessonId: state.lessonId, kicker: config.kicker, title: config.title, questions: result.questions };
  state.source = status === "published" ? "published" : "draft";
  renderEditor();
  setStatus(el.validationStatus, status === "published" ? "已發布；學生 app 下一次載入會讀到新題庫。" : "Draft 已儲存。", "success");
}

el.loginForm.addEventListener("submit", login);
el.questionsJson.addEventListener("input", () => validateEditor(false));
el.formatButton.addEventListener("click", () => {
  const parsed = helper.parseEditorJson(el.questionsJson.value);
  if (parsed.errors.length) return validateEditor(true);
  el.questionsJson.value = JSON.stringify(parsed.value, null, 2);
  validateEditor(true);
});
el.addButton.addEventListener("click", () => {
  const result = validateEditor(true);
  if (!result.valid) return;
  result.questions.push({ id: `new-${Date.now()}`, zh: "", sentence: "", explanation: "" });
  el.questionsJson.value = JSON.stringify(result.questions, null, 2);
  validateEditor(false);
  el.questionsJson.focus();
});
el.saveDraftButton.addEventListener("click", () => writeBank(DRAFTS, "draft").catch((error) => setStatus(el.validationStatus, `Draft 儲存失敗：${error.message}`, "error")));
el.publishButton.addEventListener("click", () => {
  if (!window.confirm("確定 Publish 呢個課題？")) return;
  writeBank(PUBLISHED, "published").catch((error) => setStatus(el.validationStatus, `Publish 失敗：${error.message}`, "error"));
});
el.refreshButton.addEventListener("click", () => loadRemoteBank(state.lessonId));

renderLessonList();
renderEditor();
applyAuthUi();
initFirebase().catch((error) => {
  console.warn("Grammar admin init failed:", error);
  setStatus(el.loginStatus, `Firebase 初始化失敗：${error.message}`, "error");
});
