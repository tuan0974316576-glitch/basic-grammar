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
  examplePayloads: new Map(),
  exampleRequests: new Map(),
  audioUrls: new Map(),
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
  resultsList: document.querySelector("#results-list"),
  editorTitle: document.querySelector("#editor-title"),
  entryForm: document.querySelector("#entry-form"),
  entryWord: document.querySelector("#entry-word"),
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

function getEntryDisplayWord(entry = {}) {
  return String(entry.display || entry.word || "").trim();
}

function getWordGroupKey(entry = {}) {
  return normalizeWord(entry.word || entry.display);
}

function getEntryExamples(entry = {}) {
  const examples = Array.isArray(entry.examples) ? entry.examples : [];
  const teacherExamples = Array.isArray(entry.teacherExamples) ? entry.teacherExamples : [];
  return examples.length ? examples : teacherExamples;
}

function getEntryExampleHint(entry = {}) {
  return {
    meaning: normalizeMeaning(entry.meaning),
    pos: normalizePos(entry.pos || entry.inferredPos),
    type: normalizeType(entry.type || entry.pos, entry.word || entry.display),
    level: String(entry.level || "").trim().toUpperCase()
  };
}

function getEntryExampleCacheKey(entry = {}) {
  const hint = getEntryExampleHint(entry);
  return [
    normalizeWord(entry.word || entry.display),
    hint.pos,
    hint.type,
    hint.meaning
  ].join("|");
}

function groupEntriesByWord(entries = []) {
  const groups = new Map();
  entries.forEach((entry) => {
    const key = getWordGroupKey(entry);
    if (!key) return;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        word: key,
        display: getEntryDisplayWord(entry) || key,
        entries: [],
        live: false,
        updatedAt: 0
      });
    }
    const group = groups.get(key);
    group.entries.push(entry);
    group.live = group.live || entry.source === "teacher-live";
    group.updatedAt = Math.max(group.updatedAt, Number(entry.updatedAt) || 0);
    if (entry.source === "teacher-live" && getEntryDisplayWord(entry)) {
      group.display = getEntryDisplayWord(entry);
    }
  });
  return Array.from(groups.values()).map((group) => ({
    ...group,
    entries: group.entries.sort((left, right) => {
      if ((left.source === "teacher-live") !== (right.source === "teacher-live")) {
        return left.source === "teacher-live" ? -1 : 1;
      }
      return formatEntryMeaning(left).localeCompare(formatEntryMeaning(right));
    })
  }));
}

function getTeacherCallable(name) {
  if (!state.firebase?.functions || !state.firebase.modules?.httpsCallable || !state.user) return null;
  return state.firebase.modules.httpsCallable(state.firebase.functions, name);
}

function normalizeExamplePayload(payload = {}) {
  return {
    status: payload.status || "ready",
    source: payload.source || "",
    examples: (Array.isArray(payload.examples) ? payload.examples : [])
      .map((example) => ({
        source: String(example?.source || example?.english || "").trim(),
        target: String(example?.target || example?.chinese || example?.translation || "").trim()
      }))
      .filter((example) => example.source)
      .slice(0, 3)
  };
}

function fallbackSpeak(text = "", kind = "word") {
  const value = String(text || "").trim();
  if (!value || !window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(value);
  utterance.lang = "en-US";
  utterance.rate = kind === "example" ? 0.9 : 0.84;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

async function playTeacherAudio(text = "", kind = "word", button = null) {
  const value = String(text || "").trim();
  if (!value) return;
  const cacheKey = `${kind}:${value.toLowerCase()}`;
  const previousText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "...";
  }

  try {
    let audioUrl = state.audioUrls.get(cacheKey);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.volume = 1;
      await audio.play();
    } else {
      const usedFallback = fallbackSpeak(value, kind);
      const callable = getTeacherCallable("ensureVocabAudio");
      if (!callable) throw new Error("login-required");
      const result = await callable({ text: value, kind });
      audioUrl = String(result?.data?.downloadUrl || "");
      if (audioUrl) state.audioUrls.set(cacheKey, audioUrl);
      if (!usedFallback && audioUrl) {
        const audio = new Audio(audioUrl);
        audio.volume = 1;
        await audio.play();
      } else if (!usedFallback && !audioUrl) {
        throw new Error("audio-unavailable");
      }
    }
  } catch (error) {
    console.warn("Teacher vocab audio failed:", error);
    fallbackSpeak(value, kind);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = previousText;
    }
  }
}

async function loadExamplesForEntry(entry = {}, panel, button = null) {
  const cacheKey = getEntryExampleCacheKey(entry);
  const cached = state.examplePayloads.get(cacheKey);
  if (cached) {
    renderExamplePanel(panel, cached);
    return;
  }

  if (state.exampleRequests.has(cacheKey)) {
    const payload = await state.exampleRequests.get(cacheKey);
    renderExamplePanel(panel, payload);
    return;
  }

  const localExamples = getEntryExamples(entry);
  if (localExamples.length) {
    const payload = normalizeExamplePayload({
      status: "ready",
      source: "teacher-input",
      examples: localExamples.map((example) => ({
        source: example?.source || example,
        target: example?.target || ""
      }))
    });
    state.examplePayloads.set(cacheKey, payload);
    renderExamplePanel(panel, payload);
    return;
  }

  const callable = getTeacherCallable("lookupVocabExamples");
  if (!callable) {
    renderExamplePanel(panel, normalizeExamplePayload({ status: "login-required", examples: [] }));
    return;
  }

  panel.textContent = "Loading examples...";
  if (button) button.disabled = true;
  const request = callable({
    word: normalizeWord(entry.word || entry.display),
    meanings: [getEntryExampleHint(entry)]
  }).then((result) => {
    const payload = normalizeExamplePayload(result?.data || {});
    state.examplePayloads.set(cacheKey, payload);
    return payload;
  }).catch((error) => {
    console.warn("Teacher vocab examples failed:", error);
    return normalizeExamplePayload({ status: "error", examples: [] });
  }).finally(() => {
    state.exampleRequests.delete(cacheKey);
    if (button) button.disabled = false;
  });
  state.exampleRequests.set(cacheKey, request);
  renderExamplePanel(panel, await request);
}

function renderExamplePanel(panel, payload = {}) {
  if (!panel) return;
  panel.replaceChildren();
  if (!payload.examples?.length) {
    const message = document.createElement("div");
    message.className = "entry-example-empty";
    message.textContent = payload.status === "login-required"
      ? "登入後可以載入例句。"
      : "暫時未有例句。";
    panel.append(message);
    return;
  }

  payload.examples.forEach((example) => {
    const row = document.createElement("div");
    row.className = "entry-example-row";
    const text = document.createElement("button");
    text.className = "entry-example-en";
    text.type = "button";
    text.textContent = example.source;
    text.addEventListener("click", () => playTeacherAudio(example.source, "example", text));
    const target = document.createElement("div");
    target.className = "entry-example-zh";
    target.textContent = example.target || "";
    row.append(text, target);
    panel.append(row);
  });
}

function makeEntryMeaningRow(entry = {}) {
  const row = document.createElement("section");
  row.className = "entry-meaning-row";

  const line = document.createElement("div");
  line.className = "entry-meaning-line";
  const meaning = document.createElement("div");
  meaning.className = "entry-meaning";
  meaning.textContent = formatEntryMeaning(entry);

  const actions = document.createElement("div");
  actions.className = "entry-actions";

  const examplesButton = document.createElement("button");
  examplesButton.className = "tiny-action";
  examplesButton.type = "button";
  examplesButton.textContent = "Examples";

  const editButton = document.createElement("button");
  editButton.className = "tiny-action";
  editButton.type = "button";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => loadEntryIntoForm(entry, {
    edit: entry.source === "teacher-live"
  }));

  actions.append(examplesButton, editButton);

  if (state.role === "teacher" && entry.source === "teacher-live") {
    const removeButton = document.createElement("button");
    removeButton.className = "tiny-action danger";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => disableEntry(entry));
    actions.append(removeButton);
  }

  line.append(meaning, actions);

  const panel = document.createElement("div");
  panel.className = "entry-examples-panel hidden";
  examplesButton.addEventListener("click", async () => {
    const isOpening = panel.classList.contains("hidden");
    panel.classList.toggle("hidden", !isOpening);
    examplesButton.classList.toggle("active", isOpening);
    if (isOpening) await loadExamplesForEntry(entry, panel, examplesButton);
  });

  row.append(line, panel);
  return row;
}

function makeEntryGroupCard(group = {}, options = {}) {
  const card = document.createElement("article");
  card.className = `entry-card${options.similar ? " is-similar" : ""}`;

  const main = document.createElement("div");
  main.className = "entry-main";

  const wordLine = document.createElement("div");
  wordLine.className = "entry-word";
  const word = document.createElement("strong");
  word.textContent = group.display || group.word;
  const meta = document.createElement("span");
  meta.className = "entry-meta";
  meta.textContent = `${group.entries.length} meaning${group.entries.length > 1 ? "s" : ""}`;
  const playButton = document.createElement("button");
  playButton.className = "entry-play-button";
  playButton.type = "button";
  playButton.textContent = "PLAY";
  playButton.addEventListener("click", () => playTeacherAudio(group.display || group.word, "word", playButton));
  wordLine.append(word, meta, playButton);

  const meanings = document.createElement("div");
  meanings.className = "entry-meanings";
  meanings.append(...group.entries.map(makeEntryMeaningRow));

  main.append(wordLine, meanings);
  card.append(main);
  return card;
}

function appendResultGroup(parent, title, entries, options = {}) {
  if (!entries.length) return;
  const groups = groupEntriesByWord(entries);
  const group = document.createElement("section");
  group.className = "result-group";
  const heading = document.createElement("div");
  heading.className = "result-group-title";
  heading.textContent = `${title} (${groups.length})`;
  group.append(heading, ...groups.map((entryGroup) => makeEntryGroupCard(entryGroup, options)));
  parent.append(group);
}

function renderSearchResults() {
  const query = String(el.entryWord?.value || "").trim();
  if (!el.resultsList) return;

  if (!query) {
    el.resultsList.replaceChildren(createEmptyState("先喺右邊 English 輸入字詞，例如 macaroni。"));
    return;
  }

  const results = searchEntries(query);
  const total = results.exact.length + results.similar.length;
  const fragment = document.createDocumentFragment();
  appendResultGroup(fragment, "完全相同", results.exact);
  appendResultGroup(fragment, "近似字詞", results.similar, { similar: true });

  if (!total) {
    const empty = createEmptyState("未搵到現有字義。可以繼續填 POS + 中文解釋，然後新增。");
    el.resultsList.replaceChildren(empty);
  } else {
    el.resultsList.replaceChildren(fragment);
  }

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
  el.recentList.replaceChildren(...groupEntriesByWord(activeEntries).slice(0, RECENT_LIMIT).map(makeEntryGroupCard));
}

function updateEditorMode() {
  setText(el.editorTitle, "新增 / 修改字義");
  setText(el.saveEntryButton, "SAVE");
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

function getLiveEntryById(entryId = "") {
  const targetId = String(entryId || "").trim();
  if (!targetId) return null;
  return state.liveEntries.find((entry) => (
    String(entry.sourceEntryId || entry.id || "").trim() === targetId
  )) || null;
}

function renderMeaningBlocks(entries = [{}]) {
  if (!el.meaningBlocks) return;
  const blocks = (entries.length ? entries : [{}]).map(createMeaningBlock);
  el.meaningBlocks.replaceChildren(...blocks);
  updateEditorMode();
}

function clearMeaningBlockEditingIds() {
  state.editingEntryId = "";
  getMeaningBlocks().forEach((block) => {
    delete block.dataset.entryId;
  });
  updateEditorMode();
}

function clearEditLinksIfWordChanged() {
  const currentWord = normalizeWord(el.entryWord?.value);
  const editingIds = getMeaningBlocks()
    .map((block) => String(block.dataset.entryId || "").trim())
    .filter(Boolean);
  if (!currentWord || !editingIds.length) return;
  const stillEditingSameWord = editingIds.every((entryId) => {
    const entry = getLiveEntryById(entryId);
    if (!entry) return false;
    return normalizeWord(entry.word || entry.display) === currentWord;
  });
  if (!stillEditingSameWord) {
    clearMeaningBlockEditingIds();
  }
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
  renderMeaningBlocks([{
    ...normalized,
    sourceEntryId: options.edit ? state.editingEntryId : ""
  }]);
  updateEditorMode();
  setStatus(el.entryStatus, "已載入左邊，可修改後按 SAVE。", "loading");
  renderSearchResults();
  el.meaningBlocks?.querySelector(".meaning-text")?.focus();
}

function readEntryFormEntries() {
  const word = normalizeWord(el.entryWord?.value);
  const display = String(el.entryWord?.value || "").trim();
  return readMeaningBlocks().map((sense) => {
    const type = sense.pos === "phrase" ? "phrase" : normalizeType(sense.pos, word);
    return compactEntry({
      word,
      display: display || word,
      pos: sense.pos === "phrase" ? "" : sense.pos,
      type,
      meaning: sense.meaning,
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
    const rawPreviousEditingId = String(rawEntry.sourceEntryId || "").trim();
    const previousEntry = getLiveEntryById(rawPreviousEditingId);
    const previousEditingId = previousEntry
      && normalizeWord(previousEntry.word || previousEntry.display) === normalizeWord(normalized.word || normalized.display)
      ? rawPreviousEditingId
      : "";
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
  const savedDisplayWord = firstEntry.display || firstEntry.word;
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

    const optimisticEntries = preparedEntries.map((prepared) => normalizeLiveEntry({
      id: prepared.entryId,
      sourceEntryId: prepared.entryId,
      ...prepared.payload,
      teacherExamples: prepared.teacherExamples,
      updatedAt: Date.now()
    })).filter(Boolean);
    const optimisticIds = new Set(optimisticEntries.map((entry) => String(entry.sourceEntryId || entry.id)));
    const replacedIds = new Set(preparedEntries
      .map((prepared) => prepared.previousEditingId && prepared.previousEditingId !== prepared.entryId ? prepared.previousEditingId : "")
      .filter(Boolean));
    state.liveEntries = [
      ...optimisticEntries,
      ...state.liveEntries.filter((entry) => {
        const entryId = String(entry.sourceEntryId || entry.id || "");
        return !optimisticIds.has(entryId) && !replacedIds.has(entryId);
      })
    ].sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0));
    state.editingEntryId = "";
    if (el.entryForm) el.entryForm.reset();
    if (el.entryWord) el.entryWord.value = savedDisplayWord;
    renderMeaningBlocks([{}]);
    renderRecentList();
    renderSearchResults();
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
  el.entryWord?.addEventListener("input", () => {
    clearEditLinksIfWordChanged();
    scheduleSearchRender();
  });
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
