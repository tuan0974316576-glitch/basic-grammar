const FIREBASE_VERSION = "10.12.5";
const LIVE_COLLECTION = "teacherVocabLive";
const SEARCH_LIMIT = 18;
const RECENT_LIMIT = 24;
const THEME_KEY = "teacher_vocab_console_theme_v1";

const state = {
  firebase: null,
  user: null,
  role: "",
  liveEntries: [],
  liveUnsubscribe: null,
  editingEntryId: "",
  bundledEntries: null,
  searchTimer: 0,
  warming: false
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
  refreshButton: document.querySelector("#refresh-button"),
  logoutButton: document.querySelector("#logout-button"),
  searchInput: document.querySelector("#search-input"),
  searchSummary: document.querySelector("#search-summary"),
  resultsList: document.querySelector("#results-list"),
  editorTitle: document.querySelector("#editor-title"),
  entryForm: document.querySelector("#entry-form"),
  entryWord: document.querySelector("#entry-word"),
  entryPos: document.querySelector("#entry-pos"),
  entryLevel: document.querySelector("#entry-level"),
  entryMeaning: document.querySelector("#entry-meaning"),
  entryAliases: document.querySelector("#entry-aliases"),
  entryNotes: document.querySelector("#entry-notes"),
  entryStatus: document.querySelector("#entry-status"),
  saveEntryButton: document.querySelector("#save-entry-button"),
  warmEntryButton: document.querySelector("#warm-entry-button"),
  resetFormButton: document.querySelector("#reset-form-button"),
  themeButtons: Array.from(document.querySelectorAll("[data-theme-choice]")),
  liveCount: document.querySelector("#live-count"),
  recentList: document.querySelector("#recent-list")
};

function getSavedTheme() {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    return theme === "grammar" ? "grammar" : "battleship";
  } catch (_error) {
    return "battleship";
  }
}

function setTheme(theme = "battleship") {
  const normalized = theme === "grammar" ? "grammar" : "battleship";
  document.body.classList.toggle("theme-grammar", normalized === "grammar");
  el.themeButtons.forEach((button) => {
    const isActive = button.dataset.themeChoice === normalized;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
  try {
    localStorage.setItem(THEME_KEY, normalized);
  } catch (_error) {
    // Ignore storage failures; the active theme still applies for this page.
  }
}

function api() {
  return window.TeacherLiveVocab || {};
}

function normalizeWord(value) {
  return api().normalizeWord?.(value) || String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeMeaning(value) {
  return api().normalizeMeaning?.(value) || String(value || "").trim().replace(/\s+/g, " ");
}

function normalizePos(value) {
  return api().normalizePos?.(value) || String(value || "").trim().toLowerCase();
}

function normalizeType(value, word = "") {
  return api().normalizeType?.(value, word) || (normalizeWord(word).includes(" ") ? "phrase" : "word");
}

function normalizeAliases(value) {
  return api().normalizeAliases?.(value) || String(value || "").split(/[,，;；|]/).map(normalizeWord).filter(Boolean);
}

function formatPosLabel(value) {
  if (window.TeacherVocab?.formatPosLabel) return window.TeacherVocab.formatPosLabel(value);
  const labels = {
    noun: "n.",
    verb: "v.",
    adjective: "adj.",
    adverb: "adv.",
    phrase: "ph.",
    modal: "modal v.",
    preposition: "prep.",
    conjunction: "conj.",
    pronoun: "pron.",
    determiner: "det.",
    number: "num.",
    pattern: "pt."
  };
  return labels[normalizePos(value)] || String(value || "");
}

function toMillis(value) {
  if (!value) return 0;
  if (typeof value === "number") return value;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.seconds === "number") return value.seconds * 1000;
  return Number(value) || 0;
}

function normalizeLiveEntry(raw = {}) {
  const normalized = api().normalizeEntry?.({
    ...raw,
    updatedAt: toMillis(raw.updatedAt) || Date.now(),
    createdAt: toMillis(raw.createdAt) || 0
  }, { source: "teacher-live" });
  if (!normalized) return null;
  return {
    ...normalized,
    createdAt: toMillis(raw.createdAt) || normalized.createdAt || 0,
    updatedAt: toMillis(raw.updatedAt) || normalized.updatedAt || 0,
    createdBy: raw.createdBy || "",
    updatedBy: raw.updatedBy || "",
    replacedBy: raw.replacedBy || ""
  };
}

function compactEntry(entry = {}) {
  if (api().compactEntry) return api().compactEntry(entry);
  return Object.fromEntries(Object.entries(entry).filter(([, value]) => (
    value !== "" && !(Array.isArray(value) && !value.length)
  )));
}

function setText(node, text = "") {
  if (node) node.textContent = text;
}

function setStatus(node, message = "", type = "") {
  if (!node) return;
  node.className = `status-line${type ? ` ${type}` : ""}`;
  node.textContent = message;
}

function describeSource(entry = {}) {
  const source = String(entry.source || "");
  if (source === "teacher-live") return "雲端老師字庫";
  if (source === "teacher") return "Reviewed teacher bank";
  if (source === "curated-sense-bank") return "Curated bank";
  if (source === "cc-cedict-supplement") return "HK / culture supplement";
  return source || "Reviewed bank";
}

function formatEntryMeaning(entry = {}) {
  const pos = formatPosLabel(entry.pos || entry.inferredPos || entry.type);
  const meaning = normalizeMeaning(entry.meaning);
  return pos ? `${pos} ${meaning}` : meaning;
}

function getEntryKey(entry = {}) {
  return [
    normalizeWord(entry.word || entry.display),
    normalizePos(entry.pos || entry.inferredPos),
    normalizeType(entry.type || entry.pos, entry.word || entry.display),
    normalizeMeaning(entry.meaning)
  ].join("|");
}

function dedupeEntries(entries = []) {
  const seen = new Set();
  const output = [];
  entries.forEach((entry) => {
    const key = getEntryKey(entry);
    if (!key || seen.has(key)) return;
    seen.add(key);
    output.push(entry);
  });
  return output;
}

function levenshtein(left = "", right = "") {
  const a = normalizeWord(left);
  const b = normalizeWord(right);
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      previous = temp;
    }
  }
  return row[b.length];
}

function getWordCandidates(entry = {}) {
  return [
    entry.word,
    entry.display,
    ...(Array.isArray(entry.aliases) ? entry.aliases : [])
  ].map(normalizeWord).filter(Boolean);
}

function scoreEntry(entry = {}, query = "") {
  const wordQuery = normalizeWord(query);
  const meaningQuery = normalizeMeaning(query).toLowerCase();
  if (!wordQuery && !meaningQuery) return 0;

  const candidates = getWordCandidates(entry);
  if (candidates.includes(wordQuery)) return 100;
  if (normalizeMeaning(entry.meaning).toLowerCase().includes(meaningQuery) && meaningQuery.length >= 1) return 82;

  let best = 0;
  candidates.forEach((candidate) => {
    if (!candidate) return;
    if (candidate.startsWith(wordQuery) || wordQuery.startsWith(candidate)) {
      best = Math.max(best, 76 - Math.abs(candidate.length - wordQuery.length));
      return;
    }
    const distance = levenshtein(candidate, wordQuery);
    const allowed = wordQuery.length <= 5 ? 1 : wordQuery.length <= 10 ? 2 : 3;
    if (distance <= allowed) {
      best = Math.max(best, 72 - (distance * 8));
    }
  });
  return best;
}

function isExactEntry(entry = {}, query = "") {
  const key = normalizeWord(query);
  return key && getWordCandidates(entry).includes(key);
}

function getBundledEntries() {
  if (state.bundledEntries) return state.bundledEntries;
  const teacherEntries = Array.isArray(window.TeacherVocab?.entries) ? window.TeacherVocab.entries : [];
  const curatedEntries = Array.isArray(window.VocabSenseBank?.cleanEntries)
    ? window.VocabSenseBank.cleanEntries
    : Array.isArray(window.VocabSenseBank?.entries) ? window.VocabSenseBank.entries : [];
  const supplementEntries = Array.isArray(window.CcCedictSupplement?.entries) ? window.CcCedictSupplement.entries : [];
  state.bundledEntries = dedupeEntries([
    ...teacherEntries.map((entry) => ({ ...entry, source: entry.source || "teacher" })),
    ...curatedEntries.map((entry) => ({ ...entry, source: entry.source || "curated-sense-bank" })),
    ...supplementEntries.map((entry) => ({ ...entry, source: entry.source || "cc-cedict-supplement" }))
  ]);
  return state.bundledEntries;
}

function searchEntries(query = "") {
  const q = String(query || "").trim();
  if (!q) {
    return { liveExact: [], liveSimilar: [], localExact: [], localSimilar: [] };
  }

  const activeLive = state.liveEntries.filter((entry) => !entry.disabled);
  const liveScored = activeLive
    .map((entry) => ({ entry, score: scoreEntry(entry, q), exact: isExactEntry(entry, q) }))
    .filter((item) => item.score >= 58 || item.exact)
    .sort((left, right) => right.score - left.score);

  const localLookup = [
    ...(window.TeacherVocab?.lookupStudentReady?.(q, { exactOnly: true, limit: 16 }) || []),
    ...(window.VocabSenseBank?.lookup?.(q, { limit: 16, includeHidden: true }) || []),
    ...(window.CcCedictSupplement?.lookup?.(q, { limit: 16 }) || [])
  ];

  const localScored = dedupeEntries([...localLookup, ...getBundledEntries()])
    .map((entry) => ({ entry, score: scoreEntry(entry, q), exact: isExactEntry(entry, q) }))
    .filter((item) => item.score >= 58 || item.exact)
    .sort((left, right) => {
      if (left.exact !== right.exact) return left.exact ? -1 : 1;
      return right.score - left.score;
    });

  const localWithoutLiveDuplicates = localScored.filter((item) => (
    !liveScored.some((liveItem) => getEntryKey(liveItem.entry) === getEntryKey(item.entry))
  ));

  return {
    liveExact: liveScored.filter((item) => item.exact).slice(0, SEARCH_LIMIT).map((item) => item.entry),
    liveSimilar: liveScored.filter((item) => !item.exact).slice(0, SEARCH_LIMIT).map((item) => item.entry),
    localExact: localWithoutLiveDuplicates.filter((item) => item.exact).slice(0, SEARCH_LIMIT).map((item) => item.entry),
    localSimilar: localWithoutLiveDuplicates.filter((item) => !item.exact).slice(0, SEARCH_LIMIT).map((item) => item.entry)
  };
}

function createEmptyState(message) {
  const node = document.createElement("div");
  node.className = "empty-state";
  node.textContent = message;
  return node;
}

function makeEntryCard(entry = {}, options = {}) {
  const card = document.createElement("article");
  card.className = `entry-card${entry.source === "teacher-live" ? " is-live" : ""}${options.similar ? " is-similar" : ""}`;

  const main = document.createElement("div");
  main.className = "entry-main";

  const wordLine = document.createElement("div");
  wordLine.className = "entry-word";
  const word = document.createElement("strong");
  word.textContent = entry.display || entry.word;
  const meta = document.createElement("span");
  meta.className = "entry-meta";
  meta.textContent = formatPosLabel(entry.pos || entry.inferredPos || entry.type) || "entry";
  wordLine.append(word, meta);

  const meaning = document.createElement("div");
  meaning.className = "entry-meaning";
  meaning.textContent = normalizeMeaning(entry.meaning);

  const source = document.createElement("div");
  source.className = "entry-source";
  const aliases = Array.isArray(entry.aliases) && entry.aliases.length ? ` aliases: ${entry.aliases.join(", ")}` : "";
  source.textContent = `${describeSource(entry)}${aliases}`;

  main.append(wordLine, meaning, source);

  const actions = document.createElement("div");
  actions.className = "entry-actions";

  const useButton = document.createElement("button");
  useButton.className = "tiny-action";
  useButton.type = "button";
  useButton.textContent = entry.source === "teacher-live" ? "Edit" : "Use";
  useButton.addEventListener("click", () => loadEntryIntoForm(entry, {
    edit: entry.source === "teacher-live"
  }));
  actions.append(useButton);

  if (entry.source === "teacher-live") {
    const warmButton = document.createElement("button");
    warmButton.className = "tiny-action";
    warmButton.type = "button";
    warmButton.textContent = "Warm";
    warmButton.addEventListener("click", () => warmEntryAssets(entry));
    actions.append(warmButton);

    const disableButton = document.createElement("button");
    disableButton.className = "tiny-action danger";
    disableButton.type = "button";
    disableButton.textContent = "Disable";
    disableButton.addEventListener("click", () => disableEntry(entry));
    actions.append(disableButton);
  }

  card.append(main, actions);
  return card;
}

function appendResultGroup(parent, title, entries, options = {}) {
  if (!entries.length) return;
  const group = document.createElement("section");
  group.className = "result-group";
  const heading = document.createElement("div");
  heading.className = "result-group-title";
  heading.textContent = `${title} (${entries.length})`;
  group.append(heading, ...entries.map((entry) => makeEntryCard(entry, options)));
  parent.append(group);
}

function renderSearchResults() {
  const query = String(el.searchInput?.value || "").trim();
  if (!el.resultsList) return;

  if (!query) {
    el.resultsList.replaceChildren(createEmptyState("輸入英文或中文意思，例如 macaroni / 通心粉。"));
    setText(el.searchSummary, `已載入 ${state.liveEntries.filter((entry) => !entry.disabled).length} 個雲端老師字。`);
    return;
  }

  const results = searchEntries(query);
  const total = Object.values(results).reduce((sum, items) => sum + items.length, 0);
  const fragment = document.createDocumentFragment();
  appendResultGroup(fragment, "雲端 exact", results.liveExact);
  appendResultGroup(fragment, "雲端 similar / meaning", results.liveSimilar, { similar: true });
  appendResultGroup(fragment, "Reviewed exact", results.localExact);
  appendResultGroup(fragment, "Reviewed similar", results.localSimilar, { similar: true });

  if (!total) {
    const empty = createEmptyState("暫時搵不到現有字。可在右邊輸入 POS + 中文解釋，直接新增到雲端。");
    const useQueryButton = document.createElement("button");
    useQueryButton.className = "secondary-action";
    useQueryButton.type = "button";
    useQueryButton.textContent = "Use search word";
    useQueryButton.addEventListener("click", () => {
      if (el.entryWord) el.entryWord.value = query;
      state.editingEntryId = "";
      updateEditorMode();
      el.entryMeaning?.focus();
    });
    empty.append(document.createElement("br"), useQueryButton);
    el.resultsList.replaceChildren(empty);
  } else {
    el.resultsList.replaceChildren(fragment);
  }

  const exactCount = results.liveExact.length + results.localExact.length;
  const similarCount = results.liveSimilar.length + results.localSimilar.length;
  setText(el.searchSummary, `${exactCount} exact / ${similarCount} similar。雲端結果會優先畀學生見到。`);
}

function renderRecentList() {
  const activeEntries = state.liveEntries
    .filter((entry) => !entry.disabled)
    .sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0));
  setText(el.liveCount, String(activeEntries.length));
  if (!el.recentList) return;
  if (!activeEntries.length) {
    el.recentList.replaceChildren(createEmptyState("未有雲端老師字。"));
    return;
  }
  el.recentList.replaceChildren(...activeEntries.slice(0, RECENT_LIMIT).map((entry) => makeEntryCard(entry)));
}

function updateEditorMode() {
  const isEditing = Boolean(state.editingEntryId);
  setText(el.editorTitle, isEditing ? "修改雲端字義" : "新增老師字義");
  setText(el.saveEntryButton, isEditing ? "Update Cloud Entry" : "Save to Cloud");
}

function resetForm() {
  state.editingEntryId = "";
  if (el.entryForm) el.entryForm.reset();
  if (el.entryPos) el.entryPos.value = "noun";
  updateEditorMode();
  setStatus(el.entryStatus, "儲存後學生會即時喺兩隻 game 查到。");
}

function loadEntryIntoForm(entry = {}, options = {}) {
  const normalized = normalizeLiveEntry(entry) || entry;
  state.editingEntryId = options.edit ? String(normalized.sourceEntryId || normalized.id || "") : "";
  if (el.entryWord) el.entryWord.value = normalized.display || normalized.word || "";
  if (el.entryPos) el.entryPos.value = normalizePos(normalized.pos || normalized.type) || "noun";
  if (el.entryLevel) el.entryLevel.value = normalized.level || "";
  if (el.entryMeaning) el.entryMeaning.value = normalizeMeaning(normalized.meaning);
  if (el.entryAliases) el.entryAliases.value = Array.isArray(normalized.aliases) ? normalized.aliases.join(", ") : "";
  if (el.entryNotes) el.entryNotes.value = normalized.notes || "";
  updateEditorMode();
  setStatus(el.entryStatus, options.edit ? "正在修改現有雲端字。" : "已載入資料，可修改後新增到雲端。", options.edit ? "loading" : "");
  el.entryMeaning?.focus();
}

function readEntryForm() {
  const word = normalizeWord(el.entryWord?.value);
  const display = String(el.entryWord?.value || "").trim();
  const pos = normalizePos(el.entryPos?.value);
  const meaning = normalizeMeaning(el.entryMeaning?.value);
  const level = String(el.entryLevel?.value || "").trim().toUpperCase();
  const aliases = normalizeAliases(el.entryAliases?.value);
  const notes = normalizeMeaning(el.entryNotes?.value).slice(0, 120);
  const type = pos === "phrase" ? "phrase" : normalizeType(pos, word);
  return compactEntry({
    word,
    display: display || word,
    pos: pos === "phrase" ? "" : pos,
    type,
    meaning,
    level,
    aliases,
    notes,
    source: "teacher-live"
  });
}

function findExistingEntry(entry = {}) {
  const entryKey = getEntryKey(entry);
  return state.liveEntries.find((item) => (
    String(item.sourceEntryId || item.id || "") === state.editingEntryId
    || String(item.sourceEntryId || item.id || "") === String(entry.sourceEntryId || entry.id || "")
    || getEntryKey(item) === entryKey
  ));
}

async function saveEntry(event) {
  event?.preventDefault();
  if (!state.user || state.role !== "teacher") {
    setStatus(el.entryStatus, "老師帳號先可以修改雲端字庫。", "error");
    return;
  }

  const rawEntry = readEntryForm();
  if (!rawEntry.word || !rawEntry.meaning) {
    setStatus(el.entryStatus, "請輸入 English 同中文解釋。", "error");
    return;
  }

  const normalized = api().normalizeEntry?.(rawEntry, { source: "teacher-live" });
  if (!normalized) {
    setStatus(el.entryStatus, "呢個字格式未清楚，請檢查英文 / POS / 中文解釋。", "error");
    return;
  }

  const modules = state.firebase.modules;
  const entryId = api().makeEntryId?.(normalized) || normalized.id;
  const existing = findExistingEntry({ ...normalized, id: entryId, sourceEntryId: entryId }) || {};
  const previousEditingId = state.editingEntryId;
  const payload = api().buildStudentReadyPayload?.({
    ...normalized,
    id: entryId,
    sourceEntryId: entryId
  }, {
    previous: existing,
    uid: state.user.uid,
    now: Date.now()
  });

  if (!payload) {
    setStatus(el.entryStatus, "呢個 entry 未能成為學生可用字義，請補 POS / 中文解釋。", "error");
    return;
  }

  el.saveEntryButton.disabled = true;
  setStatus(el.entryStatus, "Saving to cloud...", "loading");
  try {
    const writePayload = {
      ...payload,
      updatedAt: modules.serverTimestamp()
    };
    if (!existing.sourceEntryId && !existing.id) {
      writePayload.createdAt = modules.serverTimestamp();
    } else {
      delete writePayload.createdAt;
    }
    await modules.setDoc(modules.doc(state.firebase.db, LIVE_COLLECTION, entryId), writePayload, { merge: true });

    if (previousEditingId && previousEditingId !== entryId) {
      await modules.setDoc(modules.doc(state.firebase.db, LIVE_COLLECTION, previousEditingId), {
        disabled: true,
        replacedBy: entryId,
        updatedAt: modules.serverTimestamp(),
        updatedBy: state.user.uid
      }, { merge: true });
    }

    state.editingEntryId = entryId;
    updateEditorMode();
    setStatus(el.entryStatus, `${payload.display || payload.word} 已儲存。例句同讀音會喺背景預熱。`, "success");
    warmEntryAssets({ ...payload, id: entryId, sourceEntryId: entryId });
  } catch (error) {
    console.warn("Teacher vocab save failed:", error);
    setStatus(el.entryStatus, `儲存不到：${error?.message || error}`, "error");
  } finally {
    el.saveEntryButton.disabled = false;
  }
}

async function disableEntry(entry = {}) {
  if (!state.user || state.role !== "teacher") {
    setStatus(el.entryStatus, "老師帳號先可以停用雲端字。", "error");
    return;
  }
  const entryId = String(entry.sourceEntryId || entry.id || "").trim();
  if (!entryId) return;
  const confirmed = window.confirm(`停用 ${entry.display || entry.word} / ${entry.meaning}？學生之後不會再見到呢個雲端解釋。`);
  if (!confirmed) return;
  try {
    const modules = state.firebase.modules;
    await modules.setDoc(modules.doc(state.firebase.db, LIVE_COLLECTION, entryId), {
      disabled: true,
      updatedAt: modules.serverTimestamp(),
      updatedBy: state.user.uid
    }, { merge: true });
    setStatus(el.entryStatus, "已停用。", "success");
  } catch (error) {
    console.warn("Disable teacher vocab failed:", error);
    setStatus(el.entryStatus, `停用不到：${error?.message || error}`, "error");
  }
}

function getExampleHints(entry = {}) {
  const pos = normalizePos(entry.pos || entry.type);
  return [{
    meaning: normalizeMeaning(entry.meaning),
    pos,
    type: normalizeType(entry.type || pos, entry.word || entry.display),
    sourceEntryId: entry.sourceEntryId || entry.id || ""
  }];
}

async function warmEntryAssets(entry = readEntryForm()) {
  if (!state.user || !state.firebase?.functions || state.warming) return;
  const normalized = api().normalizeEntry?.(entry, { source: "teacher-live" }) || entry;
  const word = normalizeWord(normalized.word || normalized.display);
  if (!word) return;

  state.warming = true;
  el.warmEntryButton.disabled = true;
  setStatus(el.entryStatus, "預熱例句 / 讀音中...", "loading");
  try {
    const modules = state.firebase.modules;
    const lookupExamples = modules.httpsCallable(state.firebase.functions, "lookupVocabExamples");
    const ensureAudio = modules.httpsCallable(state.firebase.functions, "ensureVocabAudio");
    const [exampleResult] = await Promise.allSettled([
      lookupExamples({ word, meanings: getExampleHints(normalized) }),
      ensureAudio({ word, text: normalized.display || word, kind: "word" })
    ]);
    const examples = exampleResult.status === "fulfilled"
      ? (exampleResult.value?.data?.examples || [])
      : [];
    if (examples.length) {
      await Promise.allSettled(examples.slice(0, 3).map((example) => (
        ensureAudio({ word: example.source, text: example.source, kind: "example" })
      )));
    }
    setStatus(el.entryStatus, "例句 / 讀音 cache 已開始準備。", "success");
  } catch (error) {
    console.warn("Warm teacher vocab assets failed:", error);
    setStatus(el.entryStatus, "字義已可用；例句 / 讀音稍後會由學生端補生成。", "error");
  } finally {
    state.warming = false;
    el.warmEntryButton.disabled = false;
  }
}

function applyAuthUi() {
  const signedIn = Boolean(state.user);
  const isTeacher = signedIn && state.role === "teacher";
  el.loginPanel?.classList.toggle("hidden", signedIn);
  el.workspace?.classList.toggle("hidden", !signedIn);
  setText(el.accountLabel, signedIn ? `${state.user.displayName || state.user.email || state.user.uid} (${state.role || "user"})` : "--");
  setText(el.cloudStatus, signedIn ? (isTeacher ? "Teacher Online" : "Read Only") : "Login Required");
  if (el.saveEntryButton) el.saveEntryButton.disabled = !isTeacher;
  if (el.warmEntryButton) el.warmEntryButton.disabled = !isTeacher;
  if (signedIn && !isTeacher) {
    setStatus(el.entryStatus, "目前帳號不是 teacher role，只可以搜尋，不能寫入。", "error");
  }
}

async function refreshRole(user) {
  if (!user) {
    state.role = "";
    return;
  }
  const token = await user.getIdTokenResult(true).catch(() => null);
  state.role = token?.claims?.role === "teacher" ? "teacher" : "student";
}

async function startLiveListener() {
  if (!state.firebase?.db || !state.user) return;
  if (state.liveUnsubscribe) state.liveUnsubscribe();
  const modules = state.firebase.modules;
  state.liveUnsubscribe = modules.onSnapshot(
    modules.collection(state.firebase.db, LIVE_COLLECTION),
    (snapshot) => {
      state.liveEntries = snapshot.docs
        .map((docSnapshot) => normalizeLiveEntry({
          id: docSnapshot.id,
          sourceEntryId: docSnapshot.id,
          ...(docSnapshot.data() || {})
        }))
        .filter(Boolean)
        .sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0));
      renderRecentList();
      renderSearchResults();
      setText(el.cloudStatus, state.role === "teacher" ? "Teacher Online" : "Read Only");
    },
    (error) => {
      console.warn("Teacher vocab live listener failed:", error);
      setText(el.cloudStatus, "Cloud Error");
      setStatus(el.loginStatus, `雲端讀取不到：${error?.message || error}`, "error");
    }
  );
}

async function initFirebase() {
  const config = window.GRAMMAR_FIREBASE_CONFIG;
  if (!config?.apiKey) {
    setText(el.cloudStatus, "No Firebase");
    setStatus(el.loginStatus, "未設定 Firebase config。", "error");
    return;
  }

  const [
    firebaseApp,
    firebaseAuth,
    firebaseFirestore,
    firebaseFunctions
  ] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-functions.js`)
  ]);

  const app = firebaseApp.initializeApp(config, "teacher-vocab-console");
  const auth = firebaseAuth.getAuth(app);
  const db = firebaseFirestore.getFirestore(app);
  const functions = firebaseFunctions.getFunctions(app, config.functionsRegion || "asia-east2");
  await firebaseAuth.setPersistence(auth, firebaseAuth.browserLocalPersistence).catch(() => {});
  state.firebase = {
    app,
    auth,
    db,
    functions,
    modules: {
      ...firebaseAuth,
      ...firebaseFirestore,
      ...firebaseFunctions
    }
  };

  firebaseAuth.onAuthStateChanged(auth, async (user) => {
    state.user = user;
    if (user) {
      await refreshRole(user);
      setStatus(el.loginStatus, "已登入。", "success");
      await startLiveListener();
    } else {
      state.role = "";
      state.liveEntries = [];
      if (state.liveUnsubscribe) state.liveUnsubscribe();
      state.liveUnsubscribe = null;
    }
    applyAuthUi();
    renderRecentList();
    renderSearchResults();
  });
}

async function login(event) {
  event.preventDefault();
  const studentId = String(el.loginStudentId?.value || "").trim().toUpperCase();
  const pin = String(el.loginPin?.value || "").trim();
  if (!studentId || !pin) {
    setStatus(el.loginStatus, "請輸入 Teacher ID 同 PIN。", "error");
    return;
  }
  if (!state.firebase) {
    setStatus(el.loginStatus, "Firebase 未準備好，請稍後再試。", "error");
    return;
  }

  el.loginButton.disabled = true;
  setStatus(el.loginStatus, "登入中...", "loading");
  try {
    const modules = state.firebase.modules;
    const studentLogin = modules.httpsCallable(state.firebase.functions, "studentLogin");
    const result = await studentLogin({ studentId, pin });
    const data = result?.data || {};
    if (!data.email || !data.authPassword) throw new Error("Missing auth credentials.");
    const credential = await modules.signInWithEmailAndPassword(state.firebase.auth, data.email, data.authPassword);
    await refreshRole(credential.user);
    if (state.role !== "teacher") {
      setStatus(el.loginStatus, "呢個帳號不是老師帳號，只可以讀取，不能修改。", "error");
    } else {
      setStatus(el.loginStatus, "登入成功。", "success");
    }
    if (el.loginPin) el.loginPin.value = "";
  } catch (error) {
    console.warn("Teacher console login failed:", error);
    setStatus(el.loginStatus, "登入失敗，請檢查 Teacher ID / PIN。", "error");
  } finally {
    el.loginButton.disabled = false;
  }
}

async function logout() {
  if (!state.firebase?.auth) return;
  await state.firebase.modules.signOut(state.firebase.auth);
  resetForm();
  setStatus(el.loginStatus, "已登出。");
}

function scheduleSearchRender() {
  if (state.searchTimer) clearTimeout(state.searchTimer);
  state.searchTimer = setTimeout(() => {
    state.searchTimer = 0;
    renderSearchResults();
  }, 120);
}

function bindEvents() {
  el.loginForm?.addEventListener("submit", login);
  el.logoutButton?.addEventListener("click", logout);
  el.themeButtons.forEach((button) => {
    button.addEventListener("click", () => setTheme(button.dataset.themeChoice));
  });
  el.refreshButton?.addEventListener("click", () => {
    renderRecentList();
    renderSearchResults();
  });
  el.searchInput?.addEventListener("input", scheduleSearchRender);
  el.entryForm?.addEventListener("submit", saveEntry);
  el.resetFormButton?.addEventListener("click", resetForm);
  el.warmEntryButton?.addEventListener("click", () => warmEntryAssets(readEntryForm()));
}

setTheme(getSavedTheme());
bindEvents();
applyAuthUi();
resetForm();
initFirebase().catch((error) => {
  console.warn("Teacher vocab console init failed:", error);
  setText(el.cloudStatus, "Init Error");
  setStatus(el.loginStatus, `Firebase 初始化失敗：${error?.message || error}`, "error");
});
