const STAGE_WORD_COUNT = 25;
const contract = window.VocabLevelContract;
const localEntries = Array.isArray(window.BATTLESHIP_VOCAB_LEVEL_LOCAL_DATA?.entries)
  ? window.BATTLESHIP_VOCAB_LEVEL_LOCAL_DATA.entries : [];

const editorState = {
  overrides: {},
  activeLevel: "L1",
  activeStage: 0,
  busy: false,
  loaded: false
};

const editor = {
  button: document.querySelector("#level-editor-button"),
  panel: document.querySelector("#level-editor-panel"),
  close: document.querySelector("#level-editor-close"),
  level: document.querySelector("#level-editor-level"),
  stage: document.querySelector("#level-editor-stage"),
  summary: document.querySelector("#level-editor-summary"),
  status: document.querySelector("#level-editor-status"),
  list: document.querySelector("#level-editor-list")
};

function setEditorStatus(text = "", type = "") {
  if (!editor.status) return;
  editor.status.className = `status-line${type ? ` ${type}` : ""}`;
  editor.status.textContent = text;
}

function getCurrentLevel(entry) {
  return contract.normalizeLevel(editorState.overrides[entry.key]?.level)
    || contract.normalizeLevel(entry.levels?.[0])
    || "L1";
}

function sortedLevelEntries(level) {
  return localEntries
    .filter((entry) => getCurrentLevel(entry) === level)
    .sort((left, right) => contract.normalizeWord(left.word).localeCompare(contract.normalizeWord(right.word), "en"));
}

function getStageCount(level) {
  return Math.max(1, Math.ceil(sortedLevelEntries(level).length / STAGE_WORD_COUNT));
}

function getStageEntries(level, stage) {
  return sortedLevelEntries(level).slice(stage * STAGE_WORD_COUNT, (stage + 1) * STAGE_WORD_COUNT);
}

function renderStageOptions() {
  const stageCount = getStageCount(editorState.activeLevel);
  editorState.activeStage = Math.max(0, Math.min(editorState.activeStage, stageCount - 1));
  editor.stage.replaceChildren(...Array.from({ length: stageCount }, (_, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `STAGE ${index + 1}`;
    option.selected = index === editorState.activeStage;
    return option;
  }));
}

function renderEntry(entry) {
  const card = document.createElement("article");
  card.className = "level-editor-card";
  card.dataset.key = entry.key;

  const text = document.createElement("div");
  const word = document.createElement("div");
  word.className = "level-editor-word";
  word.textContent = entry.word;
  const meta = document.createElement("div");
  meta.className = "level-editor-meta";
  meta.textContent = `${entry.meaning} // 原本 ${contract.LEVEL_LABELS[entry.levels?.[0]] || "--"}`;
  if (entry.pos) meta.textContent += ` [${entry.pos}]`;
  text.append(word, meta);

  const controls = document.createElement("div");
  controls.className = "level-editor-controls";
  const select = document.createElement("select");
  select.dataset.action = "level";
  select.setAttribute("aria-label", `將 ${entry.word} 改去邊個 Level`);
  const currentLevel = getCurrentLevel(entry);
  contract.LEVELS.forEach((level) => {
    const option = document.createElement("option");
    option.value = level;
    option.textContent = contract.LEVEL_LABELS[level];
    option.selected = level === currentLevel;
    select.append(option);
  });
  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "secondary-action level-editor-reset";
  reset.dataset.action = "reset";
  reset.textContent = "還原";
  reset.disabled = !editorState.overrides[entry.key];
  controls.append(select, reset);
  card.append(text, controls);
  return card;
}

function render() {
  if (!editor.level || !editor.stage) return;
  editor.level.value = editorState.activeLevel;
  renderStageOptions();
  editor.stage.value = String(editorState.activeStage);
  const entries = getStageEntries(editorState.activeLevel, editorState.activeStage);
  const total = sortedLevelEntries(editorState.activeLevel).length;
  const start = entries.length ? editorState.activeStage * STAGE_WORD_COUNT + 1 : 0;
  const end = entries.length ? start + entries.length - 1 : 0;
  editor.summary.textContent = `${entries.length} words // ${start}-${end} / ${total}`;
  editor.list.replaceChildren(...entries.map(renderEntry));
  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "呢個 Stage 暫時冇字。";
    editor.list.append(empty);
  }
}

function getLevelFirebase() {
  return window.TeacherVocabConsole?.getLevelFirebase?.() || null;
}

function setBusy(value) {
  editorState.busy = value;
  editor.level.disabled = value;
  editor.stage.disabled = value;
  editor.list.querySelectorAll("select, button").forEach((node) => { node.disabled = value; });
}

async function loadOverrides() {
  const levelFirebase = getLevelFirebase();
  if (!levelFirebase?.levelFirebaseUser && !levelFirebase?.user) {
    const state = window.TeacherVocabConsole?.getState?.() || {};
    if (!state.levelFirebaseUser) throw new Error("VS AI Level 權限未準備好，請重新登入 Teacher Vocab。");
  }
  const modules = levelFirebase.modules;
  const snapshot = await modules.get(modules.ref(levelFirebase.db, "vocabLevelOverrides"));
  editorState.overrides = snapshot?.exists?.() ? snapshot.val() || {} : {};
  editorState.loaded = true;
  render();
}

async function openEditor() {
  editor.panel.classList.remove("hidden");
  editor.button.setAttribute("aria-expanded", "true");
  editor.panel.scrollIntoView({ behavior: "smooth", block: "start" });
  if (editorState.loaded) return;
  setEditorStatus("讀取 VS AI Level...", "loading");
  try {
    await loadOverrides();
    setEditorStatus("已載入。改字後會即時重新排列 stages。", "success");
  } catch (error) {
    setEditorStatus(error?.message || String(error), "error");
  }
}

function closeEditor() {
  editor.panel.classList.add("hidden");
  editor.button.setAttribute("aria-expanded", "false");
}

async function saveOverride(key, level) {
  if (!contract.LEVELS.includes(level)) return;
  const levelFirebase = getLevelFirebase();
  if (!levelFirebase) {
    setEditorStatus("VS AI Level 權限未準備好，請重新登入。", "error");
    return;
  }
  setBusy(true);
  setEditorStatus("儲存緊...", "loading");
  try {
    const callable = levelFirebase.modules.httpsCallable(levelFirebase.functions, "saveVocabLevelOverride");
    await callable({ key, level });
    editorState.overrides[key] = { level, updatedAt: Date.now() };
    setEditorStatus(`已改做 ${contract.LEVEL_LABELS[level]}；stages 已重新排列。`, "success");
    render();
  } catch (error) {
    setEditorStatus(`儲存失敗：${error?.message || String(error)}`, "error");
  } finally {
    setBusy(false);
  }
}

async function resetOverride(key) {
  if (!editorState.overrides[key] || !window.confirm("確定還原呢個字嘅原本 Level？")) return;
  const levelFirebase = getLevelFirebase();
  if (!levelFirebase) return;
  setBusy(true);
  setEditorStatus("還原緊...", "loading");
  try {
    const callable = levelFirebase.modules.httpsCallable(levelFirebase.functions, "removeVocabLevelOverride");
    await callable({ key });
    delete editorState.overrides[key];
    setEditorStatus("已還原原本 Level；stages 已重新排列。", "success");
    render();
  } catch (error) {
    setEditorStatus(`還原失敗：${error?.message || String(error)}`, "error");
  } finally {
    setBusy(false);
  }
}

editor.button?.addEventListener("click", openEditor);
editor.close?.addEventListener("click", closeEditor);
editor.level?.addEventListener("change", () => {
  editorState.activeLevel = editor.level.value;
  editorState.activeStage = 0;
  render();
});
editor.stage?.addEventListener("change", () => {
  editorState.activeStage = Number(editor.stage.value) || 0;
  render();
});
editor.list?.addEventListener("change", (event) => {
  const select = event.target.closest('[data-action="level"]');
  if (!select) return;
  saveOverride(select.closest(".level-editor-card").dataset.key, select.value);
});
editor.list?.addEventListener("click", (event) => {
  const reset = event.target.closest('[data-action="reset"]');
  if (reset) resetOverride(reset.closest(".level-editor-card").dataset.key);
});

window.addEventListener("teacher-vocab:level-auth", () => {
  if (!editor.panel.classList.contains("hidden") && !editorState.loaded) openEditor();
});
