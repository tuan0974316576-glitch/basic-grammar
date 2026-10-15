const FIREBASE_VERSION = '10.7.1';
const FUNCTIONS_REGION = 'asia-east2';
const STAGE_WORD_COUNT = 25;
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCfo5jxY1zvkRJPuPtZOMYj1V0kT7Te11A',
  authDomain: 'battleship-game-c0909.firebaseapp.com',
  databaseURL: 'https://battleship-game-c0909-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'battleship-game-c0909',
  storageBucket: 'battleship-game-c0909.firebasestorage.app',
  messagingSenderId: '199612407738',
  appId: '1:199612407738:web:3ed7840ec14992be7f8783'
};

const contract = window.VocabLevelContract;
const localEntries = Array.isArray(window.BATTLESHIP_VOCAB_LEVEL_LOCAL_DATA?.entries)
  ? window.BATTLESHIP_VOCAB_LEVEL_LOCAL_DATA.entries : [];
const state = {
  firebase: null,
  user: null,
  claims: null,
  displayName: '',
  overrides: {},
  activeLevel: 'L1',
  activeStage: 0,
  busy: false
};

const $ = id => document.getElementById(id);
const el = {
  loginView: $('login-view'),
  loginForm: $('login-form'),
  loginId: $('login-id'),
  loginPin: $('login-pin'),
  loginButton: $('login-button'),
  loginStatus: $('login-status'),
  workspace: $('workspace'),
  accountLabel: $('account-label'),
  refresh: $('refresh-button'),
  logout: $('logout-button'),
  level: $('level-select'),
  stage: $('stage-select'),
  summary: $('stage-summary'),
  saveStatus: $('save-status'),
  list: $('entry-list')
};

function setStatus(node, text, type = '') {
  node.textContent = text;
  node.className = node.className.replace(/\s+(error|success)\b/g, '') + (type ? ` ${type}` : '');
}

function errorMessage(error) {
  return String(error?.message || error?.code || error || 'Unknown error')
    .replace(/^FirebaseError:\s*/i, '')
    .replace(/^functions\/[a-z-]+:\s*/i, '')
    .slice(0, 300);
}

function readSnapshot(snapshot) {
  return snapshot?.exists?.() ? snapshot.val() || {} : {};
}

function getCallable(name) {
  return state.firebase.modules.httpsCallable(state.firebase.functions, name);
}

function getCurrentLevel(entry) {
  return contract.normalizeLevel(state.overrides[entry.key]?.level)
    || contract.normalizeLevel(entry.levels?.[0])
    || 'L1';
}

function sortedLevelEntries(level) {
  return localEntries
    .filter(entry => getCurrentLevel(entry) === level)
    .sort((left, right) => contract.normalizeWord(left.word).localeCompare(contract.normalizeWord(right.word), 'en'));
}

function getStageEntries(level, stage) {
  const entries = sortedLevelEntries(level);
  return entries.slice(stage * STAGE_WORD_COUNT, (stage + 1) * STAGE_WORD_COUNT);
}

function getStageCount(level) {
  return Math.max(1, Math.ceil(sortedLevelEntries(level).length / STAGE_WORD_COUNT));
}

function renderStageOptions() {
  const count = getStageCount(state.activeLevel);
  state.activeStage = Math.max(0, Math.min(state.activeStage, count - 1));
  el.stage.replaceChildren(...Array.from({ length: count }, (_, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `STAGE ${index + 1}`;
    option.selected = index === state.activeStage;
    return option;
  }));
}

function renderEntry(entry) {
  const card = document.createElement('article');
  card.className = 'entry-card';
  card.dataset.key = entry.key;

  const text = document.createElement('div');
  const word = document.createElement('div');
  word.className = 'entry-word';
  word.textContent = entry.word;
  const meta = document.createElement('div');
  meta.className = 'entry-meta';
  meta.textContent = `${entry.meaning}  //  原本 ${contract.LEVEL_LABELS[entry.levels?.[0]] || '--'}`;
  if (entry.pos) {
    const pos = document.createElement('span');
    pos.className = 'pos';
    pos.textContent = `  [${entry.pos}]`;
    meta.append(pos);
  }
  text.append(word, meta);

  const controls = document.createElement('div');
  controls.className = 'entry-controls';
  const select = document.createElement('select');
  select.className = 'entry-level';
  select.dataset.action = 'level';
  select.setAttribute('aria-label', `將 ${entry.word} 改去邊個 Level`);
  const currentLevel = getCurrentLevel(entry);
  contract.LEVELS.forEach(level => {
    const option = document.createElement('option');
    option.value = level;
    option.textContent = contract.LEVEL_LABELS[level];
    option.selected = level === currentLevel;
    select.append(option);
  });
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'button secondary reset-button';
  reset.dataset.action = 'reset';
  reset.textContent = '還原';
  reset.disabled = !state.overrides[entry.key];
  controls.append(select, reset);
  card.append(text, controls);
  return card;
}

function render() {
  el.level.value = state.activeLevel;
  renderStageOptions();
  el.stage.value = String(state.activeStage);
  const entries = getStageEntries(state.activeLevel, state.activeStage);
  const total = sortedLevelEntries(state.activeLevel).length;
  const start = entries.length ? state.activeStage * STAGE_WORD_COUNT + 1 : 0;
  const end = entries.length ? start + entries.length - 1 : 0;
  el.summary.textContent = `${entries.length} words  //  ${start}-${end} / ${total}`;
  el.list.replaceChildren(...entries.map(renderEntry));
  if (!entries.length) {
    const empty = document.createElement('div');
    empty.className = 'notice';
    empty.textContent = '呢個 Stage 暫時冇字。';
    el.list.append(empty);
  }
}

function setBusy(value) {
  state.busy = value;
  el.refresh.disabled = value;
  el.logout.disabled = value;
  el.level.disabled = value;
  el.stage.disabled = value;
  el.list.querySelectorAll('select, button').forEach(node => { node.disabled = value; });
}

async function saveOverride(key, level) {
  if (!contract.LEVELS.includes(level)) return;
  setBusy(true);
  setStatus(el.saveStatus, '儲存緊...');
  try {
    await getCallable('saveVocabLevelOverride')({ key, level });
    state.overrides[key] = { level, updatedAt: Date.now() };
    setStatus(el.saveStatus, `已改做 ${contract.LEVEL_LABELS[level]}；stages 已重新排列。`, 'success');
    render();
  } catch (error) {
    setStatus(el.saveStatus, `儲存失敗：${errorMessage(error)}`, 'error');
  } finally {
    setBusy(false);
  }
}

async function resetOverride(key) {
  if (!state.overrides[key] || !window.confirm('確定還原呢個字嘅原本 Level？')) return;
  setBusy(true);
  setStatus(el.saveStatus, '還原緊...');
  try {
    await getCallable('removeVocabLevelOverride')({ key });
    delete state.overrides[key];
    setStatus(el.saveStatus, '已還原原本 Level；stages 已重新排列。', 'success');
    render();
  } catch (error) {
    setStatus(el.saveStatus, `還原失敗：${errorMessage(error)}`, 'error');
  } finally {
    setBusy(false);
  }
}

async function loadOverrides() {
  const { get, ref } = state.firebase.modules;
  const snapshot = await get(ref(state.firebase.db, 'vocabLevelOverrides'));
  state.overrides = readSnapshot(snapshot);
  render();
}

async function login(event) {
  event.preventDefault();
  const studentId = String(el.loginId.value || '').trim().toUpperCase();
  const pin = String(el.loginPin.value || '').trim();
  if (!studentId || !pin) return;
  el.loginButton.disabled = true;
  setStatus(el.loginStatus, 'Verifying teacher account...');
  try {
    const result = await getCallable('grammarTeacherLogin')({ studentId, pin });
    state.displayName = result.displayName || studentId;
    await state.firebase.modules.signInWithCustomToken(state.firebase.auth, result.customToken);
    el.loginPin.value = '';
  } catch (error) {
    setStatus(el.loginStatus, '登入失敗，請檢查 Teacher ID / PIN。', 'error');
    console.warn('[Vocab Level Console] Login failed:', error);
  } finally {
    el.loginButton.disabled = false;
  }
}

async function handleAuth(user) {
  state.user = user;
  if (!user) {
    el.loginView.classList.remove('hidden');
    el.workspace.classList.add('hidden');
    setStatus(el.loginStatus, 'Teacher login ready.');
    return;
  }
  const token = await user.getIdTokenResult(true);
  state.claims = token.claims || {};
  if (state.claims.grammarTeacher !== true || state.claims.role !== 'grammar_teacher') {
    await state.firebase.modules.signOut(state.firebase.auth);
    setStatus(el.loginStatus, 'This account is not authorized for Vocab Levels.', 'error');
    return;
  }
  el.loginView.classList.add('hidden');
  el.workspace.classList.remove('hidden');
  el.accountLabel.textContent = `${state.displayName || state.claims.studentId || 'TEACHER'} // TEACHER`;
  await loadOverrides();
}

async function initFirebase() {
  const [firebaseApp, firebaseAuth, firebaseDatabase, firebaseFunctions] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-database.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-functions.js`)
  ]);
  const existing = firebaseApp.getApps().find(app => app.name === 'battleship-vocab-levels');
  const app = existing || firebaseApp.initializeApp(FIREBASE_CONFIG, 'battleship-vocab-levels');
  const auth = firebaseAuth.getAuth(app);
  const db = firebaseDatabase.getDatabase(app);
  const functions = firebaseFunctions.getFunctions(app, FUNCTIONS_REGION);
  state.firebase = { auth, db, functions, modules: { ...firebaseAuth, ...firebaseDatabase, ...firebaseFunctions } };
  firebaseAuth.onAuthStateChanged(auth, user => handleAuth(user).catch(error => setStatus(el.loginStatus, `Firebase auth failed: ${errorMessage(error)}`, 'error')));
  setStatus(el.loginStatus, 'Teacher login ready.');
}

el.loginForm.addEventListener('submit', login);
el.logout.addEventListener('click', () => state.firebase.modules.signOut(state.firebase.auth));
el.refresh.addEventListener('click', () => loadOverrides().catch(error => setStatus(el.saveStatus, `讀取失敗：${errorMessage(error)}`, 'error')));
el.level.addEventListener('change', () => { state.activeLevel = el.level.value; state.activeStage = 0; render(); });
el.stage.addEventListener('change', () => { state.activeStage = Number(el.stage.value) || 0; render(); });
el.list.addEventListener('change', event => {
  const select = event.target.closest('[data-action="level"]');
  if (!select) return;
  saveOverride(select.closest('.entry-card').dataset.key, select.value);
});
el.list.addEventListener('click', event => {
  const button = event.target.closest('[data-action="reset"]');
  if (button) resetOverride(button.closest('.entry-card').dataset.key);
});

render();
initFirebase().catch(error => setStatus(el.loginStatus, `Firebase 初始化失敗：${errorMessage(error)}`, 'error'));
