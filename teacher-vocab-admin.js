const FIREBASE_VERSION = "10.12.5";
const LIVE_COLLECTION = "teacherVocabLive";
const SEARCH_LIMIT = 18;
const RECENT_LIMIT = 24;
const THEME_KEY = "teacher_vocab_console_theme_v1";
const POS_OPTIONS = [
  ["noun", "n."],
  ["verb", "v."],
  ["adjective", "adj."],
  ["adverb", "adv."],
  ["phrase", "ph."],
  ["modal", "modal v."],
  ["preposition", "prep."],
  ["conjunction", "conj."],
  ["pronoun", "pron."],
  ["determiner", "det."],
  ["number", "num."]
];

const state = {
  firebase: null,
  user: null,
  role: "",
  liveEntries: [],
  liveUnsubscribe: null,
  editingEntryId: "",
  bundledEntries: null,
  searchTimer: 0
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
  teacherOnlineBadge: document.querySelector("#teacher-online-badge"),
  accountLabel: document.querySelector("#account-label"),
  refreshButton: document.querySelector("#refresh-button"),
  searchSummary: document.querySelector("#search-summary"),
  resultsList: document.querySelector("#results-list"),
  editorTitle: document.querySelector("#editor-title"),
  entryForm: document.querySelector("#entry-form"),
  entryWord: document.querySelector("#entry-word"),
  entryAliases: document.querySelector("#entry-aliases"),
  meaningBlocks: document.querySelector("#meaning-blocks"),
  addSenseButton: document.querySelector("#add-sense-button"),
  entryStatus: document.querySelector("#entry-status"),
  saveEntryButton: document.querySelector("#save-entry-button"),
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
  if (source === "teacher-live") return "現有老師字義";
  if (source === "teacher") return "Reviewed bank";
  if (source === "curated-sense-bank") return "Reviewed bank";
  if (source === "cc-cedict-supplement") return "Reviewed supplement";
  return source ? "Reviewed bank" : "";
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
    return { exact: [], similar: [] };
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

  const exact = dedupeEntries([
    ...liveScored.filter((item) => item.exact).map((item) => item.entry),
    ...localWithoutLiveDuplicates.filter((item) => item.exact).map((item) => item.entry)
  ]).slice(0, SEARCH_LIMIT);
  const exactKeys = new Set(exact.map(getEntryKey));
  const similar = dedupeEntries([
    ...liveScored.filter((item) => !item.exact).map((item) => item.entry),
    ...localWithoutLiveDuplicates.filter((item) => !item.exact).map((item) => item.entry)
  ]).filter((entry) => !exactKeys.has(getEntryKey(entry))).slice(0, SEARCH_LIMIT);

  return { exact, similar };
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
  const query = String(el.entryWord?.value || "").trim();
  if (!el.resultsList) return;

  if (!query) {
    el.resultsList.replaceChildren(createEmptyState("先喺右邊 English 輸入字詞，例如 macaroni。"));
    setText(el.searchSummary, `已載入 ${state.liveEntries.filter((entry) => !entry.disabled).length} 個老師新增字義。`);
    return;
  }

  const results = searchEntries(query);
  const total = results.exact.length + results.similar.length;
  const fragment = document.createDocumentFragment();
  appendResultGroup(fragment, "Exact matches", results.exact);
  appendResultGroup(fragment, "Similar matches", results.similar, { similar: true });

  if (!total) {
    const empty = createEmptyState("未搵到現有字義。可以繼續填 POS + 中文解釋，然後新增。");
    el.resultsList.replaceChildren(empty);
  } else {
    el.resultsList.replaceChildren(fragment);
  }

  setText(el.searchSummary, `${results.exact.length} exact / ${results.similar.length} similar。先睇 Exact，有啱就唔需要新增。`);
}

function renderRecentList() {
  const activeEntries = state.liveEntries
    .filter((entry) => !entry.disabled)
    .sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0));
  setText(el.liveCount, String(activeEntries.length));
  if (!el.recentList) return;
  if (!activeEntries.length) {
    el.recentList.replaceChildren(createEmptyState("未有老師新增字義。"));
    return;
  }
  el.recentList.replaceChildren(...activeEntries.slice(0, RECENT_LIMIT).map((entry) => makeEntryCard(entry)));
}

function updateEditorMode() {
  const isEditing = Boolean(state.editingEntryId || getMeaningBlocks().some((block) => block.dataset.entryId));
  setText(el.editorTitle, isEditing ? "修改現有字義" : "新增老師字義");
  setText(el.saveEntryButton, isEditing ? "UPDATE" : "SAVE");
}

function triggerSaveButtonSuccess() {
  if (!el.saveEntryButton) return;
  el.saveEntryButton.classList.remove("save-success-pulse");
  void el.saveEntryButton.offsetWidth;
  el.saveEntryButton.classList.add("save-success-pulse");
  window.setTimeout(() => {
    el.saveEntryButton?.classList.remove("save-success-pulse");
  }, 1450);
}

function createPosSelect(value = "noun") {
  const select = document.createElement("select");
  select.className = "meaning-pos";
  POS_OPTIONS.forEach(([optionValue, label]) => {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = label;
    select.append(option);
  });
  select.value = normalizePos(value) || "noun";
  return select;
}

function createFieldLabel(labelText, field) {
  const label = document.createElement("label");
  const span = document.createElement("span");
  span.textContent = labelText;
  label.append(span, field);
  return label;
}

function createExampleRow(value = "") {
  const row = document.createElement("div");
  row.className = "example-row";

  const input = document.createElement("input");
  input.className = "meaning-example";
  input.type = "text";
  input.autocomplete = "off";
  input.placeholder = "English example sentence";
  input.value = String(value || "").trim();

  const addButton = document.createElement("button");
  addButton.className = "icon-add-button";
  addButton.type = "button";
  addButton.textContent = "+";
  addButton.setAttribute("aria-label", "Add another example sentence");
  addButton.addEventListener("click", () => {
    const nextRow = createExampleRow();
    row.after(nextRow);
    nextRow.querySelector("input")?.focus();
  });

  const removeButton = document.createElement("button");
  removeButton.className = "icon-remove-button";
  removeButton.type = "button";
  removeButton.textContent = "x";
  removeButton.setAttribute("aria-label", "Remove example sentence");
  removeButton.addEventListener("click", () => {
    const parent = row.parentElement;
    if (!parent || parent.querySelectorAll(".example-row").length <= 1) {
      input.value = "";
      input.focus();
      return;
    }
    row.remove();
  });

  row.append(input, addButton, removeButton);
  return row;
}

function createMeaningBlock(entry = {}) {
  const block = document.createElement("section");
  block.className = "meaning-block";
  if (entry.sourceEntryId || entry.id) {
    block.dataset.entryId = String(entry.sourceEntryId || entry.id);
  }

  const heading = document.createElement("div");
  heading.className = "meaning-block-heading";
  const title = document.createElement("div");
  title.className = "meaning-block-title";
  title.textContent = "Meaning";
  const removeButton = document.createElement("button");
  removeButton.className = "tiny-action danger meaning-remove-button";
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => {
    if (el.meaningBlocks?.querySelectorAll(".meaning-block").length <= 1) {
      const meaningInput = block.querySelector(".meaning-text");
      const exampleInput = block.querySelector(".meaning-example");
      if (meaningInput) meaningInput.value = "";
      if (exampleInput) exampleInput.value = "";
      meaningInput?.focus();
      return;
    }
    block.remove();
    updateEditorMode();
  });
  heading.append(title, removeButton);

  const topRow = document.createElement("div");
  topRow.className = "meaning-grid";
  const posLabel = createFieldLabel("POS", createPosSelect(entry.pos || entry.type || "noun"));
  const meaningInput = document.createElement("input");
  meaningInput.className = "meaning-text";
  meaningInput.type = "text";
  meaningInput.autocomplete = "off";
  meaningInput.placeholder = "通心粉";
  meaningInput.value = normalizeMeaning(entry.meaning || "");
  const meaningLabel = createFieldLabel("中文解釋", meaningInput);
  topRow.append(posLabel, meaningLabel);

  const examplesLabel = document.createElement("div");
  examplesLabel.className = "examples-label";
  examplesLabel.textContent = "英文例句";
  const examplesWrap = document.createElement("div");
  examplesWrap.className = "examples-wrap";
  const examples = Array.isArray(entry.examples) ? entry.examples : [];
  const exampleValues = examples
    .map((example) => String(example?.source || example || "").trim())
    .filter(Boolean);
  (exampleValues.length ? exampleValues : [""]).forEach((example) => {
    examplesWrap.append(createExampleRow(example));
  });

  block.append(heading, topRow, examplesLabel, examplesWrap);
  return block;
}

function getMeaningBlocks() {
  return Array.from(el.meaningBlocks?.querySelectorAll(".meaning-block") || []);
}

function renderMeaningBlocks(entries = [{}]) {
  if (!el.meaningBlocks) return;
  const blocks = (entries.length ? entries : [{}]).map(createMeaningBlock);
  el.meaningBlocks.replaceChildren(...blocks);
  updateEditorMode();
}

function addMeaningBlock(entry = {}) {
  const block = createMeaningBlock(entry);
  el.meaningBlocks?.append(block);
  updateEditorMode();
  block.querySelector(".meaning-pos")?.focus();
}

function readMeaningBlocks() {
  return getMeaningBlocks().map((block) => {
    const pos = normalizePos(block.querySelector(".meaning-pos")?.value);
    const meaning = normalizeMeaning(block.querySelector(".meaning-text")?.value);
    const examples = Array.from(block.querySelectorAll(".meaning-example"))
      .map((input) => String(input.value || "").trim().replace(/\s+/g, " "))
      .filter(Boolean)
      .slice(0, 4);
    return {
      editingEntryId: String(block.dataset.entryId || "").trim(),
      pos,
      meaning,
      examples
    };
  }).filter((entry) => entry.meaning);
}

function resetForm() {
  state.editingEntryId = "";
  if (el.entryForm) el.entryForm.reset();
  renderMeaningBlocks([{}]);
  updateEditorMode();
  setStatus(el.entryStatus, "");
  renderSearchResults();
}

function loadEntryIntoForm(entry = {}, options = {}) {
  const normalized = normalizeLiveEntry(entry) || entry;
  state.editingEntryId = options.edit ? String(normalized.sourceEntryId || normalized.id || "") : "";
  if (el.entryWord) el.entryWord.value = normalized.display || normalized.word || "";
  if (el.entryAliases) el.entryAliases.value = Array.isArray(normalized.aliases) ? normalized.aliases.join(", ") : "";
  renderMeaningBlocks([{
    ...normalized,
    sourceEntryId: options.edit ? state.editingEntryId : ""
  }]);
  updateEditorMode();
  setStatus(el.entryStatus, options.edit ? "正在修改現有字義。" : "已載入資料，可修改後新增。", options.edit ? "loading" : "");
  renderSearchResults();
  el.meaningBlocks?.querySelector(".meaning-text")?.focus();
}

function readEntryFormEntries() {
  const word = normalizeWord(el.entryWord?.value);
  const display = String(el.entryWord?.value || "").trim();
  const aliases = normalizeAliases(el.entryAliases?.value);
  return readMeaningBlocks().map((sense) => {
    const type = sense.pos === "phrase" ? "phrase" : normalizeType(sense.pos, word);
    return compactEntry({
      word,
      display: display || word,
      pos: sense.pos === "phrase" ? "" : sense.pos,
      type,
      meaning: sense.meaning,
      aliases,
      source: "teacher-live",
      sourceEntryId: sense.editingEntryId,
      teacherExamples: sense.examples
    });
  });
}

function findExistingEntry(entry = {}, editingEntryId = "") {
  const entryKey = getEntryKey(entry);
  return state.liveEntries.find((item) => (
    String(item.sourceEntryId || item.id || "") === editingEntryId
    || String(item.sourceEntryId || item.id || "") === String(entry.sourceEntryId || entry.id || "")
    || getEntryKey(item) === entryKey
  ));
}

async function saveEntry(event) {
  event?.preventDefault();
  if (!state.user || state.role !== "teacher") {
    setStatus(el.entryStatus, "老師帳號先可以修改老師字庫。", "error");
    return;
  }

  const rawEntries = readEntryFormEntries();
  const firstEntry = rawEntries[0] || {};
  if (!firstEntry.word || !rawEntries.some((entry) => entry.meaning)) {
    setStatus(el.entryStatus, "請輸入 English 同中文解釋。", "error");
    return;
  }

  const normalizedEntries = rawEntries.map((rawEntry) => ({
    rawEntry,
    normalized: api().normalizeEntry?.(rawEntry, { source: "teacher-live" })
  }));
  if (normalizedEntries.some((item) => !item.normalized)) {
    setStatus(el.entryStatus, "呢個字格式未清楚，請檢查英文 / POS / 中文解釋。", "error");
    return;
  }

  const modules = state.firebase.modules;
  const preparedEntries = normalizedEntries.map(({ rawEntry, normalized }) => {
    const entryId = api().makeEntryId?.(normalized) || normalized.id;
    const previousEditingId = String(rawEntry.sourceEntryId || "").trim();
    const existing = findExistingEntry({ ...normalized, id: entryId, sourceEntryId: entryId }, previousEditingId) || {};
    const payload = api().buildStudentReadyPayload?.({
      ...normalized,
      id: entryId,
      sourceEntryId: entryId
    }, {
      previous: existing,
      uid: state.user.uid,
      now: Date.now()
    });
    return {
      entryId,
      previousEditingId,
      existing,
      payload,
      teacherExamples: Array.isArray(rawEntry.teacherExamples) ? rawEntry.teacherExamples : []
    };
  });

  if (preparedEntries.some((entry) => !entry.payload)) {
    setStatus(el.entryStatus, "呢個 entry 未能成為學生可用字義，請補 POS / 中文解釋。", "error");
    return;
  }

  el.saveEntryButton.disabled = true;
  setStatus(el.entryStatus, "Saving...", "loading");
  let savedSuccessfully = false;
  try {
    for (const prepared of preparedEntries) {
      const writePayload = {
        ...prepared.payload,
        updatedAt: modules.serverTimestamp()
      };
      if (prepared.teacherExamples.length) {
        writePayload.teacherExamples = prepared.teacherExamples;
      } else {
        writePayload.teacherExamples = [];
      }
      if (!prepared.existing.sourceEntryId && !prepared.existing.id) {
        writePayload.createdAt = modules.serverTimestamp();
      } else {
        delete writePayload.createdAt;
      }
      await modules.setDoc(modules.doc(state.firebase.db, LIVE_COLLECTION, prepared.entryId), writePayload, { merge: true });

      if (prepared.previousEditingId && prepared.previousEditingId !== prepared.entryId) {
        await modules.setDoc(modules.doc(state.firebase.db, LIVE_COLLECTION, prepared.previousEditingId), {
          disabled: true,
          replacedBy: prepared.entryId,
          updatedAt: modules.serverTimestamp(),
          updatedBy: state.user.uid
        }, { merge: true });
      }
    }

    state.editingEntryId = preparedEntries[0]?.entryId || "";
    renderMeaningBlocks(preparedEntries.map((prepared) => ({
      ...prepared.payload,
      id: prepared.entryId,
      sourceEntryId: prepared.entryId,
      examples: prepared.teacherExamples
    })));
    updateEditorMode();
    setStatus(el.entryStatus, "");
    savedSuccessfully = true;
  } catch (error) {
    console.warn("Teacher vocab save failed:", error);
    setStatus(el.entryStatus, `儲存不到：${error?.message || error}`, "error");
  } finally {
    el.saveEntryButton.disabled = false;
    if (savedSuccessfully) triggerSaveButtonSuccess();
  }
}

async function disableEntry(entry = {}) {
  if (!state.user || state.role !== "teacher") {
    setStatus(el.entryStatus, "老師帳號先可以停用字義。", "error");
    return;
  }
  const entryId = String(entry.sourceEntryId || entry.id || "").trim();
  if (!entryId) return;
  const confirmed = window.confirm(`停用 ${entry.display || entry.word} / ${entry.meaning}？學生之後不會再見到呢個解釋。`);
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

function applyAuthUi() {
  const signedIn = Boolean(state.user);
  const isTeacher = signedIn && state.role === "teacher";
  el.loginPanel?.classList.toggle("hidden", signedIn);
  el.workspace?.classList.toggle("hidden", !signedIn);
  setText(el.accountLabel, signedIn ? `${state.user.displayName || state.user.email || state.user.uid} (${state.role || "user"})` : "--");
  setText(el.teacherOnlineBadge, isTeacher ? "TEACHER ONLINE" : signedIn ? "READ ONLY" : "OFFLINE");
  el.teacherOnlineBadge?.classList.toggle("is-readonly", signedIn && !isTeacher);
  setText(el.cloudStatus, signedIn ? (isTeacher ? "Teacher Online" : "Read Only") : "Login Required");
  if (el.saveEntryButton) el.saveEntryButton.disabled = !isTeacher;
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
      setText(el.cloudStatus, "Connection Error");
      setStatus(el.loginStatus, `字庫讀取不到：${error?.message || error}`, "error");
    }
  );
}

async function initFirebase() {
  const config = window.GRAMMAR_FIREBASE_CONFIG;
  if (!config?.apiKey) {
    setText(el.cloudStatus, "Config Error");
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

function scheduleSearchRender() {
  if (state.searchTimer) clearTimeout(state.searchTimer);
  state.searchTimer = setTimeout(() => {
    state.searchTimer = 0;
    renderSearchResults();
  }, 120);
}

function bindEvents() {
  el.loginForm?.addEventListener("submit", login);
  el.themeButtons.forEach((button) => {
    button.addEventListener("click", () => setTheme(button.dataset.themeChoice));
  });
  el.refreshButton?.addEventListener("click", () => {
    renderRecentList();
    renderSearchResults();
  });
  el.entryWord?.addEventListener("input", scheduleSearchRender);
  el.entryForm?.addEventListener("submit", saveEntry);
  el.resetFormButton?.addEventListener("click", resetForm);
  el.addSenseButton?.addEventListener("click", () => addMeaningBlock());
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
