const GRAMMAR_VERB_TIME_LIMIT = 30;
const GRAMMAR_VERB_QUESTION_COUNT = 20;
const GRAMMAR_REFERENCE_SPEAK_GAP_MS = 150;
const GRAMMAR_REFERENCE_AUDIO_VOICE = 'en-US-AndrewMultilingualNeural';
const GRAMMAR_VERB_FIELD_ORDER = ['present', 'past', 'pp', 'pg'];
const GRAMMAR_VERB_FIELD_LABELS = {
    present: 'PRESENT',
    past: 'PAST',
    pp: 'PP',
    pg: 'ING'
};
const GRAMMAR_VERB_FIELD_INDEX = {
    present: 1,
    past: 2,
    pp: 3,
    pg: 4
};

const grammarVerbState = {
    questions: [],
    wrongQuestions: [],
    history: [],
    currentQuestionIndex: 0,
    score: 0,
    checked: false,
    timeLeft: GRAMMAR_VERB_TIME_LIMIT,
    timerInterval: null,
    activeFieldIndex: 0,
    referenceRendered: false
};

const grammarLaunchState = {
    activeFieldIndex: 0,
    referenceRendered: false
};

let grammarTopicScreenMode = 'default';
let grammarTopicKeyboardActive = false;
let activeGrammarReferenceUtterances = [];
let activeGrammarReferenceAudio = null;
let activeGrammarReferenceAudioToken = 0;
const grammarReferenceAudioRuntimeCache = new Map();

function grammarUsesGameKeyboard() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        window.matchMedia('(pointer: coarse)').matches ||
        navigator.maxTouchPoints > 0;
}

function getGrammarVerbScreen() {
    return document.getElementById('grammar-verb-screen');
}

function getGrammarVerbFieldInput(fieldKey) {
    return document.getElementById(`grammar-verb-input-${fieldKey}`);
}

function getGrammarVerbFieldContainer(fieldKey) {
    const input = getGrammarVerbFieldInput(fieldKey);
    return input ? input.closest('.grammar-verb-field') : null;
}

function getCurrentGrammarQuestion() {
    return grammarVerbState.questions[grammarVerbState.currentQuestionIndex] || null;
}

function shuffleGrammarArray(items) {
    const clone = [...items];
    for (let i = clone.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
}

function buildGrammarBattleDeck() {
    return (window.GRAMMAR_VERB_BANK || []).map((verb) => ({
        ch: verb[0],
        en: verb[1],
        grammarTopic: 'VERB_TABLE',
        grammarForms: {
            present: verb[1],
            past: verb[2],
            pp: verb[3],
            pg: verb[4]
        }
    }));
}

function buildGrammarReferenceRows(bodyId) {
    const tbody = document.getElementById(bodyId);
    if (!tbody || !Array.isArray(window.GRAMMAR_VERB_BANK)) return;

    tbody.innerHTML = window.GRAMMAR_VERB_BANK.map((verb) => {
        const forms = [verb[1], verb[2], verb[3], verb[4]];
        const speakTextValue = forms.join(' ');
        const audioKey = forms.map(part => String(part || '').trim().toLowerCase()).join('|');
        return `
            <tr class="grammar-reference-row" data-grammar-speak="${speakTextValue}" data-grammar-audio-key="${audioKey}" data-grammar-search="${[verb[0], verb[1], verb[2], verb[3], verb[4]].join(' ').toLowerCase()}">
                <td data-reference-label="CHINESE">${verb[0]}</td>
                <td data-reference-label="PRESENT">${verb[1]}</td>
                <td data-reference-label="PAST">${verb[2]}</td>
                <td data-reference-label="PP">${verb[3]}</td>
                <td data-reference-label="ING">${verb[4]}</td>
            </tr>
        `;
    }).join('');
}

function getGrammarReferenceAudioBaseUrl() {
    if (typeof getSpeakingAssessmentBaseUrl === 'function') {
        return getSpeakingAssessmentBaseUrl();
    }
    const configBase = (window.APP_CONFIG && window.APP_CONFIG.SPEAKING_API_BASE || '').trim();
    if (configBase) return configBase.replace(/\/$/, '');
    const explicitBase = (localStorage.getItem('speaking_api_base') || '').trim();
    if (explicitBase) return explicitBase.replace(/\/$/, '');
    return '';
}

function getGrammarReferenceForms(text, rowElement) {
    const key = rowElement?.getAttribute('data-grammar-audio-key') || '';
    const forms = key.split('|').map(part => part.trim()).filter(Boolean);
    if (forms.length === 4) return forms;
    return String(text || '').split(/\s+/).map(part => part.trim()).filter(Boolean).slice(0, 4);
}

function stopGrammarReferenceAudioPlayback() {
    activeGrammarReferenceAudioToken++;
    if (typeof window.stopIosBundleAudio === 'function') {
        window.stopIosBundleAudio().catch(() => {});
    }
    if (activeGrammarReferenceAudio) {
        try {
            activeGrammarReferenceAudio.pause();
        } catch (_error) {}
        activeGrammarReferenceAudio = null;
    }
}

function getGrammarReferenceManifestUrl(audioKey) {
    const manifest = window.GRAMMAR_VERB_AUDIO_MANIFEST || {};
    return typeof manifest[audioKey] === 'string' ? manifest[audioKey] : '';
}

function fetchGrammarReferenceAudio(forms) {
    const audioKey = forms.join('|');
    const manifestUrl = getGrammarReferenceManifestUrl(audioKey);
    if (manifestUrl) {
        return Promise.resolve({
            ok: true,
            cached: true,
            audioUrl: manifestUrl,
            forms
        });
    }

    if (grammarReferenceAudioRuntimeCache.has(audioKey)) {
        return grammarReferenceAudioRuntimeCache.get(audioKey);
    }

    const baseUrl = getGrammarReferenceAudioBaseUrl();
    if (!baseUrl) return Promise.reject(new Error('Speech backend is not configured.'));

    const request = fetch(`${baseUrl}/api/verb-table-audio`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            forms,
            locale: 'en-US',
            accentLocale: 'en-US',
            voiceName: GRAMMAR_REFERENCE_AUDIO_VOICE,
            breakMs: GRAMMAR_REFERENCE_SPEAK_GAP_MS
        })
    }).then(async (response) => {
        const rawText = await response.text();
        let result = null;
        try {
            result = rawText ? JSON.parse(rawText) : null;
        } catch (_error) {
            throw new Error(rawText || 'Verb table audio failed.');
        }
        if (!response.ok || !result?.audioUrl) {
            throw new Error((result && (result.message || result.error)) || 'Verb table audio failed.');
        }
        return result;
    }).catch((error) => {
        grammarReferenceAudioRuntimeCache.delete(audioKey);
        throw error;
    });

    grammarReferenceAudioRuntimeCache.set(audioKey, request);
    return request;
}

async function playGrammarReferenceStoredAudio(forms, rowElement) {
    const audioKey = forms.join('|');
    if (forms.length !== 4) return false;

    const playbackToken = ++activeGrammarReferenceAudioToken;
    rowElement.classList.add('speaking');

    try {
        const result = await fetchGrammarReferenceAudio(forms);
        if (playbackToken !== activeGrammarReferenceAudioToken) return true;
        const audioUrl = result?.audioUrl || getGrammarReferenceManifestUrl(audioKey);
        if (!audioUrl) return false;

        const shouldUseIosBundleAudio = window.Capacitor?.getPlatform?.() === 'ios'
            && typeof window.playIosBundleAudio === 'function';
        if (shouldUseIosBundleAudio) {
            const playedNatively = await window.playIosBundleAudio(
                audioUrl,
                typeof getListeningVoiceVolume === 'function' ? getListeningVoiceVolume() : 1
            );
            if (playbackToken !== activeGrammarReferenceAudioToken) return true;
            rowElement.classList.remove('speaking');
            if (playedNatively) return true;
        }

        const audio = new Audio(audioUrl);
        activeGrammarReferenceAudio = audio;
        audio.volume = typeof getListeningVoiceVolume === 'function' ? getListeningVoiceVolume() : 1;
        audio.preload = 'auto';

        audio.onended = () => {
            if (activeGrammarReferenceAudio === audio) activeGrammarReferenceAudio = null;
            rowElement.classList.remove('speaking');
        };
        audio.onerror = () => {
            if (activeGrammarReferenceAudio === audio) activeGrammarReferenceAudio = null;
            rowElement.classList.remove('speaking');
        };

        await audio.play();
        return true;
    } catch (error) {
        console.warn('[Verb Table Audio] Stored audio failed, falling back to browser speech:', error);
        if (playbackToken === activeGrammarReferenceAudioToken) {
            rowElement.classList.remove('speaking');
        }
        return false;
    }
}

function speakGrammarReferenceFallback(parts, rowElement) {
    if (!window.speechSynthesis || typeof window.speechSynthesis.speak !== 'function' || typeof SpeechSynthesisUtterance === 'undefined') return;

    if (typeof window.speechSynthesis.cancel === 'function') window.speechSynthesis.cancel();
    activeGrammarReferenceUtterances = [];
    rowElement.classList.add('speaking');

    const baseRate = 0.855;
    const voice = typeof techVoice !== 'undefined' ? techVoice : null;
    const volume = typeof getBoostedListeningVoiceVolume === 'function' ? getBoostedListeningVoiceVolume() : 1;

    const speakPart = (index) => {
        if (index >= parts.length) {
            rowElement.classList.remove('speaking');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(parts[index]);
        utterance.lang = 'en-US';
        utterance.rate = baseRate;
        utterance.pitch = 1.0;
        utterance.volume = volume;
        if (voice) utterance.voice = voice;
        utterance.onend = () => {
            if (index === parts.length - 1) {
                rowElement.classList.remove('speaking');
            } else {
                setTimeout(() => speakPart(index + 1), GRAMMAR_REFERENCE_SPEAK_GAP_MS);
            }
        };
        utterance.onerror = () => {
            rowElement.classList.remove('speaking');
        };
        activeGrammarReferenceUtterances.push(utterance);
        window.speechSynthesis.speak(utterance);
    };

    speakPart(0);
}

async function speakGrammarReferenceSequence(text, rowElement) {
    const parts = getGrammarReferenceForms(text, rowElement);
    if (!parts.length) return;
    if (typeof playSound === 'function') {
        playSound('enter-number-sfx');
    }
    document.querySelectorAll('.grammar-reference-row.speaking').forEach((row) => row.classList.remove('speaking'));
    stopGrammarReferenceAudioPlayback();
    if (window.speechSynthesis && typeof window.speechSynthesis.cancel === 'function') window.speechSynthesis.cancel();

    const played = await playGrammarReferenceStoredAudio(parts, rowElement);
    if (!played) speakGrammarReferenceFallback(parts, rowElement);
}

function isGrammarBattleMode() {
    return window.selectedGrammarTopic === 'VERB_TABLE' && currentPracticeMode === 'GRAMMAR';
}

function showGrammarScreenWithAnimation(screenId) {
    const screen = document.getElementById(screenId);
    if (!screen) return;
    screen.style.display = 'flex';
    const wrapper = screen.querySelector('.panel-content-wrapper');
    if (wrapper) {
        wrapper.style.animation = 'none';
        setTimeout(() => {
            wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
        }, 10);
    }
}

function openGrammarTopicScreen() {
    playSound('deploy-sfx');
    const levelScreen = document.getElementById('level-screen');
    if (levelScreen) levelScreen.style.display = 'none';
    showSelectionOverlay();
    setGrammarTopicReferenceMode(false);
    showGrammarScreenWithAnimation('grammar-topic-screen');
}

function closeGrammarTopicScreen() {
    if (grammarTopicScreenMode === 'reference') {
        setGrammarTopicReferenceMode(false);
        return;
    }

    const topicScreen = document.getElementById('grammar-topic-screen');
    setGrammarTopicReferenceMode(false);
    if (topicScreen) topicScreen.style.display = 'none';
    window.selectedGrammarTopic = null;

    showSelectionOverlay();
    const levelScreen = document.getElementById('level-screen');
    if (levelScreen) {
        levelScreen.style.display = 'flex';
        const wrapper = levelScreen.querySelector('.panel-content-wrapper');
        if (wrapper) {
            wrapper.style.animation = 'none';
            setTimeout(() => {
                wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
            }, 10);
        }
    }
}

function renderGrammarVerbReference() {
    if (grammarVerbState.referenceRendered) return;
    buildGrammarReferenceRows('grammar-verb-reference-body');
    grammarVerbState.referenceRendered = true;
}

function renderGrammarTopicReference() {
    buildGrammarReferenceRows('grammar-topic-reference-body');
}

function setGrammarTopicReferenceMode(isReferenceMode) {
    const topicScreen = document.getElementById('grammar-topic-screen');
    const reference = document.getElementById('grammar-topic-reference');
    const title = document.getElementById('grammar-topic-title');
    const subtitle = document.getElementById('grammar-topic-subtitle');
    const card = document.querySelector('.grammar-topic-card');
    const panel = document.querySelector('.grammar-topic-panel');
    const searchWrap = document.getElementById('grammar-topic-search-wrap');
    const searchInput = document.getElementById('grammar-topic-search-input');

    grammarTopicScreenMode = isReferenceMode ? 'reference' : 'default';

    if (isReferenceMode) {
        if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();
        renderGrammarTopicReference();
        if (topicScreen) topicScreen.classList.add('grammar-topic-reference-mode');
        if (title) title.innerText = 'VERB TABLE REFERENCE';
        if (subtitle) subtitle.style.display = 'none';
        if (card) card.style.display = 'none';
        if (searchWrap) searchWrap.style.display = 'block';
        if (panel) panel.classList.add('is-reference-open');
        if (reference) reference.style.display = 'block';
        return;
    }

    hideGrammarTopicSearchKeyboard();
    if (typeof restoreStageVocabBgm === 'function') restoreStageVocabBgm();
    if (topicScreen) topicScreen.classList.remove('grammar-topic-reference-mode');
    if (title) title.innerText = 'SELECT TOPIC';
    if (subtitle) subtitle.style.display = 'block';
    if (card) card.style.display = 'block';
    if (searchWrap) searchWrap.style.display = 'none';
    if (searchInput) {
        searchInput.value = '';
        filterGrammarTopicReference();
    }
    if (panel) panel.classList.remove('is-reference-open');
    if (reference) reference.style.display = 'none';
}

function toggleGrammarVerbReference() {
    if (typeof playSound === 'function') {
        playSound('enter-number-sfx');
    }
    const reference = document.getElementById('grammar-verb-reference');
    if (!reference) return;
    if (reference.style.display === 'none') {
        renderGrammarVerbReference();
        reference.style.display = 'block';
    } else {
        reference.style.display = 'none';
    }
}

function toggleGrammarTopicReference() {
    if (typeof playSound === 'function') {
        playSound('enter-number-sfx');
    }
    setGrammarTopicReferenceMode(grammarTopicScreenMode !== 'reference');
}

function filterGrammarTopicReference() {
    const input = document.getElementById('grammar-topic-search-input');
    if (!input) return;
    const filter = input.value.trim().toLowerCase();
    document.querySelectorAll('#grammar-topic-reference .grammar-reference-row').forEach((row) => {
        const haystack = row.getAttribute('data-grammar-search') || '';
        row.style.display = !filter || haystack.includes(filter) ? '' : 'none';
    });
}

function showGrammarTopicSearchKeyboard() {
    const screen = document.getElementById('grammar-topic-screen');
    const input = document.getElementById('grammar-topic-search-input');
    const keyboard = document.getElementById('grammar-topic-virtual-keyboard');
    if (!screen || screen.style.display === 'none' || !input || !keyboard) return;

    if (!grammarTopicKeyboardActive && typeof playSound === 'function') {
        playSound('deploy-sfx');
    }
    grammarTopicKeyboardActive = true;
    input.setAttribute('readonly', 'readonly');
    input.setAttribute('inputmode', 'none');
    input.blur();
    keyboard.style.display = 'block';
    keyboard.style.visibility = 'visible';
    screen.classList.add('grammar-topic-keyboard-open');
    updateGrammarTopicKeyboardLayout();
    requestAnimationFrame(updateGrammarTopicKeyboardLayout);
}

function updateGrammarTopicKeyboardLayout() {
    const screen = document.getElementById('grammar-topic-screen');
    const keyboard = document.getElementById('grammar-topic-virtual-keyboard');
    const title = document.getElementById('grammar-topic-title');
    const searchWrap = document.getElementById('grammar-topic-search-wrap');
    if (!screen || !keyboard || !grammarTopicKeyboardActive) return;

    const viewportHeight = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight;
    const keyboardHeight = keyboard.getBoundingClientRect().height || 220;
    screen.style.setProperty('--grammar-topic-keyboard-height', `${Math.ceil(keyboardHeight)}px`);
    const titleHeight = title && title.offsetParent !== null ? title.getBoundingClientRect().height : 0;
    const searchHeight = searchWrap && searchWrap.offsetParent !== null ? searchWrap.getBoundingClientRect().height : 0;
    const referenceHeight = Math.max(180, Math.floor(viewportHeight - keyboardHeight - titleHeight - searchHeight - 46));
    screen.style.setProperty('--grammar-topic-reference-height', `${referenceHeight}px`);
}

function mountGrammarTopicKeyboardToScreen() {
    const screen = document.getElementById('grammar-topic-screen');
    const keyboard = document.getElementById('grammar-topic-virtual-keyboard');
    if (screen && keyboard && keyboard.parentElement !== screen) {
        screen.appendChild(keyboard);
    }
}

function hideGrammarTopicSearchKeyboard() {
    const screen = document.getElementById('grammar-topic-screen');
    const keyboard = document.getElementById('grammar-topic-virtual-keyboard');
    const wasActive = grammarTopicKeyboardActive;
    grammarTopicKeyboardActive = false;
    if (keyboard) {
        keyboard.style.display = 'none';
        keyboard.style.visibility = 'hidden';
    }
    if (screen) {
        screen.classList.remove('grammar-topic-keyboard-open');
        screen.style.removeProperty('--grammar-topic-keyboard-height');
        screen.style.removeProperty('--grammar-topic-reference-height');
    }
    if (wasActive && typeof playSound === 'function') {
        playSound('delete-sfx');
    }
}

function setGrammarTopicSearchValue(value) {
    const input = document.getElementById('grammar-topic-search-input');
    if (!input) return;
    input.value = String(value || '').slice(0, 40);
    filterGrammarTopicReference();
}

function handleGrammarTopicKeyboardInput(keyValue) {
    const input = document.getElementById('grammar-topic-search-input');
    if (!input) return;

    if (keyValue === 'ENTER') {
        hideGrammarTopicSearchKeyboard();
        return;
    }
    if (keyValue === 'BACKSPACE') {
        if (typeof playSound === 'function') playSound('delete-sfx');
        setGrammarTopicSearchValue(input.value.slice(0, -1));
        return;
    }
    if (typeof keyValue === 'string' && keyValue.length === 1) {
        if (typeof playSound === 'function') playSound('enter-sfx');
        setGrammarTopicSearchValue(input.value + keyValue.toLowerCase());
    }
}

function renderLaunchGrammarReference() {
    if (grammarLaunchState.referenceRendered) return;
    buildGrammarReferenceRows('launch-grammar-reference-body');
    grammarLaunchState.referenceRendered = true;
}

function toggleLaunchGrammarReference() {
    if (typeof playSound === 'function') {
        playSound('enter-number-sfx');
    }
    const reference = document.getElementById('launch-grammar-reference');
    if (!reference) return;

    if (reference.style.display === 'none') {
        renderLaunchGrammarReference();
        reference.style.display = 'block';
    } else {
        reference.style.display = 'none';
    }
}

function resetLaunchGrammarHints() {
    document.querySelectorAll('.launch-grammar-hint').forEach((hint) => hint.remove());
}

function getLaunchGrammarInput(fieldKey) {
    return document.getElementById(`launch-grammar-input-${fieldKey}`);
}

function getLaunchGrammarField(fieldKey) {
    return document.getElementById(`launch-grammar-field-${fieldKey}`);
}

function setLaunchGrammarActiveField(index) {
    const safeIndex = Math.max(0, Math.min(GRAMMAR_VERB_FIELD_ORDER.length - 1, index));
    grammarLaunchState.activeFieldIndex = safeIndex;

    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey, fieldIndex) => {
        const field = getLaunchGrammarField(fieldKey);
        const input = getLaunchGrammarInput(fieldKey);
        if (field) {
            field.classList.toggle('is-active', fieldIndex === safeIndex);
        }
        if (!input) return;
        if (grammarUsesGameKeyboard()) {
            input.blur();
        } else if (fieldIndex === safeIndex && document.getElementById('launch-modal')?.style.display === 'flex') {
            input.focus();
            const endPosition = input.value.length;
            input.setSelectionRange(endPosition, endPosition);
        }
    });
}

function moveLaunchGrammarField(direction) {
    const nextIndex = (grammarLaunchState.activeFieldIndex + direction + GRAMMAR_VERB_FIELD_ORDER.length) % GRAMMAR_VERB_FIELD_ORDER.length;
    setLaunchGrammarActiveField(nextIndex);
}

function getLaunchGrammarPresentClue(question = currentVocab) {
    return String(question?.grammarForms?.present || '').charAt(0).toLowerCase();
}

function prepareLaunchGrammarQuestion(question) {
    const panel = document.getElementById('launch-grammar-panel');
    const qDisplay = document.getElementById('q-display');
    const hiddenInput = document.getElementById('hidden-input');
    const reference = document.getElementById('launch-grammar-reference');
    const subhint = document.getElementById('launch-subhint');

    if (!panel || !question?.grammarForms) return;

    panel.style.display = 'block';
    if (qDisplay) qDisplay.style.display = 'none';
    if (hiddenInput) {
        hiddenInput.value = '';
        hiddenInput.style.display = 'none';
    }
    if (reference) reference.style.display = 'none';
    if (subhint) subhint.innerText = 'FILL ALL FOUR FORMS // FIRE TO CONFIRM';

    resetLaunchGrammarHints();
    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey) => {
        const input = getLaunchGrammarInput(fieldKey);
        if (!input) return;
        input.value = fieldKey === 'present' ? getLaunchGrammarPresentClue(question) : '';
        input.disabled = false;
        input.classList.remove('is-correct', 'is-wrong');
        if (grammarUsesGameKeyboard()) {
            input.setAttribute('readonly', 'readonly');
            input.classList.add('grammar-readonly');
        } else {
            input.removeAttribute('readonly');
            input.classList.remove('grammar-readonly');
        }
    });

    setLaunchGrammarActiveField(0);
}

function resetLaunchGrammarQuestion() {
    const panel = document.getElementById('launch-grammar-panel');
    const qDisplay = document.getElementById('q-display');
    const hiddenInput = document.getElementById('hidden-input');
    const reference = document.getElementById('launch-grammar-reference');
    const subhint = document.getElementById('launch-subhint');
    if (panel) panel.style.display = 'none';
    if (qDisplay) qDisplay.style.display = 'block';
    if (hiddenInput) hiddenInput.style.display = '';
    if (reference) reference.style.display = 'none';
    if (subhint) subhint.innerText = 'TYPE TO DECRYPT // ENTER TO FIRE';
    resetLaunchGrammarHints();
}

function focusLaunchGrammarField() {
    if (!isGrammarBattleMode()) return;
    setLaunchGrammarActiveField(grammarLaunchState.activeFieldIndex || 0);
}

function addLaunchGrammarHint(fieldKey, answerText) {
    const field = getLaunchGrammarField(fieldKey);
    if (!field) return;
    const hint = document.createElement('div');
    hint.className = 'launch-grammar-hint';
    hint.innerText = answerText;
    field.appendChild(hint);
}

function handleLaunchGrammarKey(keyValue, keyElement) {
    if (!isGrammarBattleMode()) return;

    if (keyValue === 'PREV_FIELD') {
        if (typeof playSound === 'function') playSound('enter-sfx');
        moveLaunchGrammarField(-1);
        return;
    }

    if (keyValue === 'NEXT_FIELD') {
        if (typeof playSound === 'function') playSound('enter-sfx');
        moveLaunchGrammarField(1);
        return;
    }

    if (keyValue === 'ENTER') {
        checkAnswer();
        return;
    }

    const fieldKey = GRAMMAR_VERB_FIELD_ORDER[grammarLaunchState.activeFieldIndex];
    const input = getLaunchGrammarInput(fieldKey);
    if (!input || input.disabled) return;

    if (keyValue === 'BACKSPACE') {
        const presentClue = getLaunchGrammarPresentClue();
        if (fieldKey === 'present' && input.value.length <= presentClue.length) return;
        if (typeof playSound === 'function') playSound('delete-sfx');
        input.value = input.value.slice(0, -1);
        return;
    }

    if (keyElement) {
        lastVirtualKeyboardKey = keyElement;
    }
    if (typeof playSound === 'function') playSound('enter-sfx');
    input.value += keyValue;
}

function checkGrammarBattleAnswer() {
    if (!isGrammarBattleMode() || !currentVocab?.grammarForms) return false;

    const answers = currentVocab.grammarForms;
    resetLaunchGrammarHints();
    let allCorrect = true;

    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey) => {
        const input = getLaunchGrammarInput(fieldKey);
        if (!input) return;
        const isCorrect = grammarValueMatches(input.value, answers[fieldKey]);
        input.classList.remove('is-correct', 'is-wrong');
        if (isCorrect) {
            input.classList.add('is-correct');
        } else {
            allCorrect = false;
            input.classList.add('is-wrong');
        }
    });

    return allCorrect;
}

function configureGrammarKeyboard() {
    const keyboard = document.getElementById('grammar-virtual-keyboard');
    if (!keyboard) return;

    if (!grammarUsesGameKeyboard()) {
        keyboard.style.display = 'none';
        keyboard.style.visibility = 'hidden';
        return;
    }

    const screen = document.getElementById('grammar-verb-screen');
    if (screen) {
        screen.classList.add('grammar-keyboard-open');
    }
    keyboard.style.display = 'block';
    keyboard.style.visibility = 'visible';
}

function hideGrammarKeyboard() {
    const keyboard = document.getElementById('grammar-virtual-keyboard');
    if (!keyboard) return;
    keyboard.style.display = 'none';
    keyboard.style.visibility = 'hidden';
    const screen = document.getElementById('grammar-verb-screen');
    if (screen) {
        screen.classList.remove('grammar-keyboard-open');
    }
}

function setGrammarVerbActiveField(index) {
    const safeIndex = Math.max(0, Math.min(GRAMMAR_VERB_FIELD_ORDER.length - 1, index));
    grammarVerbState.activeFieldIndex = safeIndex;

    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey, fieldIndex) => {
        const container = getGrammarVerbFieldContainer(fieldKey);
        const input = getGrammarVerbFieldInput(fieldKey);
        if (container) {
            container.classList.toggle('is-active', fieldIndex === safeIndex);
        }
        if (!input || grammarUsesGameKeyboard()) return;
        if (fieldIndex === safeIndex && document.getElementById('grammar-verb-screen')?.style.display === 'flex') {
            input.focus();
            input.select();
        }
    });
}

function moveGrammarVerbField(direction) {
    const nextIndex = (grammarVerbState.activeFieldIndex + direction + GRAMMAR_VERB_FIELD_ORDER.length) % GRAMMAR_VERB_FIELD_ORDER.length;
    setGrammarVerbActiveField(nextIndex);
}

function stopGrammarVerbTimer() {
    if (grammarVerbState.timerInterval) {
        clearInterval(grammarVerbState.timerInterval);
        grammarVerbState.timerInterval = null;
    }
}

function updateGrammarVerbTimerUI() {
    const timerText = document.getElementById('grammar-verb-timer-text');
    const timerBar = document.getElementById('grammar-verb-timer-bar');
    if (timerText) timerText.innerText = grammarVerbState.timeLeft.toFixed(1);
    if (timerBar) {
        timerBar.style.width = `${(grammarVerbState.timeLeft / GRAMMAR_VERB_TIME_LIMIT) * 100}%`;
        timerBar.style.background = grammarVerbState.timeLeft <= 5
            ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.95), rgba(248, 113, 113, 0.8))'
            : 'linear-gradient(90deg, rgba(14, 165, 233, 0.95), rgba(34, 211, 238, 0.8))';
    }
}

function startGrammarVerbTimer() {
    stopGrammarVerbTimer();
    grammarVerbState.timeLeft = GRAMMAR_VERB_TIME_LIMIT;
    updateGrammarVerbTimerUI();
    grammarVerbState.timerInterval = setInterval(() => {
        grammarVerbState.timeLeft = Math.max(0, grammarVerbState.timeLeft - 0.1);
        updateGrammarVerbTimerUI();
        if (grammarVerbState.timeLeft <= 0) {
            stopGrammarVerbTimer();
            checkGrammarVerbAnswer(true);
        }
    }, 100);
}

function resetGrammarVerbHints() {
    document.querySelectorAll('.grammar-answer-hint').forEach((hint) => hint.remove());
}

function resetGrammarVerbInputs() {
    resetGrammarVerbHints();

    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey) => {
        const input = getGrammarVerbFieldInput(fieldKey);
        if (!input) return;
        input.value = '';
        input.disabled = false;
        input.classList.remove('is-correct', 'is-wrong');
        if (grammarUsesGameKeyboard()) {
            input.setAttribute('readonly', 'readonly');
            input.classList.add('grammar-readonly');
        } else {
            input.removeAttribute('readonly');
            input.classList.remove('grammar-readonly');
        }
    });
}

function updateGrammarVerbHeader() {
    const qNum = document.getElementById('grammar-verb-q-num');
    const qTotal = document.getElementById('grammar-verb-q-total');
    const score = document.getElementById('grammar-verb-score');
    if (qNum) qNum.innerText = String(grammarVerbState.currentQuestionIndex + 1);
    if (qTotal) qTotal.innerText = String(grammarVerbState.questions.length);
    if (score) score.innerText = String(grammarVerbState.score);
}

function loadGrammarVerbQuestion() {
    const question = getCurrentGrammarQuestion();
    if (!question) {
        endGrammarVerbChallenge();
        return;
    }

    const prompt = document.getElementById('grammar-verb-prompt');
    const message = document.getElementById('grammar-verb-message');
    const checkBtn = document.getElementById('grammar-verb-check-btn');
    const nextBtn = document.getElementById('grammar-verb-next-btn');

    grammarVerbState.checked = false;
    resetGrammarVerbInputs();
    updateGrammarVerbHeader();
    if (prompt) prompt.innerText = question[0];
    if (message) message.innerText = '';
    if (checkBtn) checkBtn.style.display = 'inline-flex';
    if (nextBtn) nextBtn.style.display = 'none';

    setGrammarVerbActiveField(0);
    configureGrammarKeyboard();
    startGrammarVerbTimer();
}

function initGrammarVerbChallenge(useWrongQuestions = false) {
    const source = useWrongQuestions && grammarVerbState.wrongQuestions.length
        ? grammarVerbState.wrongQuestions
        : (window.GRAMMAR_VERB_BANK || []);

    grammarVerbState.questions = shuffleGrammarArray(source).slice(0, Math.min(GRAMMAR_VERB_QUESTION_COUNT, source.length));
    grammarVerbState.currentQuestionIndex = 0;
    grammarVerbState.score = 0;
    grammarVerbState.history = [];
    if (!useWrongQuestions) {
        grammarVerbState.wrongQuestions = [];
    }

    const result = document.getElementById('grammar-verb-result');
    const game = document.getElementById('grammar-verb-game');
    const actions = document.querySelector('.grammar-verb-actions');
    if (result) {
        result.style.display = 'none';
        result.innerHTML = '';
    }
    if (game) game.style.display = 'flex';
    if (actions) actions.style.display = 'flex';

    loadGrammarVerbQuestion();
}

function openGrammarVerbTableScreen() {
    playSound('deploy-sfx');
    const topicScreen = document.getElementById('grammar-topic-screen');
    if (topicScreen) topicScreen.style.display = 'none';

    window.selectedGrammarTopic = 'VERB_TABLE';
    currentPracticeMode = 'GRAMMAR';
    selectedLevel = 'VERB_TABLE';
    selectedStageIndex = null;
    selectedStageLabel = 'VERB TABLE';
    activeVocabList = buildGrammarBattleDeck();
    if (!activeVocabList.length) {
        if (typeof showNotification === 'function') {
            showNotification('GRAMMAR DATABASE NOT LOADED', 'error', 4000);
        } else {
            alert('Grammar database not loaded.');
        }
        if (topicScreen) topicScreen.style.display = 'flex';
        return;
    }
    sessionDeck = [...activeVocabList];

    if (typeof loadMissedWordsToPriorityDeck === 'function') {
        loadMissedWordsToPriorityDeck('GRAMMAR');
    }

    updateRaceButtons();
    const raceScreen = document.getElementById('race-screen');
    if (raceScreen) {
        raceScreen.style.display = 'flex';
        const wrapper = raceScreen.querySelector('.panel-content-wrapper');
        if (wrapper) {
            wrapper.style.animation = 'none';
            setTimeout(() => {
                wrapper.style.animation = 'holoAppear 0.4s forwards';
            }, 10);
        }
    }
}

function returnFromGrammarVerbScreen() {
    stopGrammarVerbTimer();
    hideGrammarKeyboard();
    const grammarScreen = getGrammarVerbScreen();
    if (grammarScreen) grammarScreen.style.display = 'none';
    const reference = document.getElementById('grammar-verb-reference');
    if (reference) reference.style.display = 'none';
    showGrammarScreenWithAnimation('grammar-topic-screen');
}

function buildGrammarAnswerMap(question) {
    return {
        present: question[GRAMMAR_VERB_FIELD_INDEX.present],
        past: question[GRAMMAR_VERB_FIELD_INDEX.past],
        pg: question[GRAMMAR_VERB_FIELD_INDEX.pg],
        pp: question[GRAMMAR_VERB_FIELD_INDEX.pp]
    };
}

function addGrammarAnswerHint(fieldKey, answerText) {
    const container = getGrammarVerbFieldContainer(fieldKey);
    if (!container) return;
    const hint = document.createElement('div');
    hint.className = 'grammar-answer-hint';
    hint.innerText = answerText;
    container.appendChild(hint);
}

function grammarValueMatches(userValue, answerText) {
    const normalizedUser = userValue.trim().toLowerCase();
    if (!normalizedUser) return false;
    return answerText
        .toLowerCase()
        .split('/')
        .map((part) => part.trim())
        .some((part) => part === normalizedUser);
}

function checkGrammarVerbAnswer(isTimeout = false) {
    if (grammarVerbState.checked) return;

    const question = getCurrentGrammarQuestion();
    if (!question) return;

    stopGrammarVerbTimer();
    grammarVerbState.checked = true;

    const answers = buildGrammarAnswerMap(question);
    const errors = [];
    let allCorrect = true;

    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey) => {
        const input = getGrammarVerbFieldInput(fieldKey);
        if (!input) return;

        const isCorrect = grammarValueMatches(input.value, answers[fieldKey]);
        input.disabled = true;

        if (isCorrect && !isTimeout) {
            input.classList.add('is-correct');
            grammarVerbState.score += 1;
        } else {
            allCorrect = false;
            input.classList.add('is-wrong');
            addGrammarAnswerHint(fieldKey, answers[fieldKey]);
            errors.push({
                label: GRAMMAR_VERB_FIELD_LABELS[fieldKey],
                user: input.value.trim(),
                correct: answers[fieldKey]
            });
        }
    });

    const score = document.getElementById('grammar-verb-score');
    const message = document.getElementById('grammar-verb-message');
    const checkBtn = document.getElementById('grammar-verb-check-btn');
    const nextBtn = document.getElementById('grammar-verb-next-btn');

    if (score) score.innerText = String(grammarVerbState.score);
    if (message) {
        message.innerText = allCorrect && !isTimeout
            ? 'ALL FORMS CONFIRMED'
            : (isTimeout ? 'TIME OUT // REVIEW ANSWERS' : 'REVIEW THE CORRECT FORMS');
    }
    if (checkBtn) checkBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'inline-flex';

    if (!allCorrect && !grammarVerbState.wrongQuestions.includes(question)) {
        grammarVerbState.wrongQuestions.push(question);
    }

    if (!allCorrect) {
        grammarVerbState.history.push({
            chinese: question[0],
            errors
        });
    }
}

function advanceGrammarVerbQuestion() {
    if (!grammarVerbState.checked) return;
    grammarVerbState.currentQuestionIndex += 1;
    if (grammarVerbState.currentQuestionIndex >= grammarVerbState.questions.length) {
        endGrammarVerbChallenge();
        return;
    }
    loadGrammarVerbQuestion();
}

function endGrammarVerbChallenge() {
    stopGrammarVerbTimer();
    hideGrammarKeyboard();

    const result = document.getElementById('grammar-verb-result');
    const game = document.getElementById('grammar-verb-game');
    const actions = document.querySelector('.grammar-verb-actions');
    if (!result || !game || !actions) return;

    const maxScore = grammarVerbState.questions.length * GRAMMAR_VERB_FIELD_ORDER.length;
    const percent = maxScore > 0 ? Math.round((grammarVerbState.score / maxScore) * 100) : 0;
    const errorHtml = grammarVerbState.history.length
        ? grammarVerbState.history.map((item) => `
            <div class="grammar-verb-error-item">
                <div class="grammar-verb-error-title">${item.chinese}</div>
                ${item.errors.map((error) => `
                    <div class="grammar-verb-error-row">
                        <span>${error.label}</span>
                        <span>${error.user || '(blank)'} -> ${error.correct}</span>
                    </div>
                `).join('')}
            </div>
        `).join('')
        : '<div class="grammar-verb-result-score">PERFECT RUN // NO ERRORS</div>';

    result.innerHTML = `
        <div class="grammar-verb-result-title">CHALLENGE COMPLETE</div>
        <div class="grammar-verb-result-score">${grammarVerbState.score} / ${maxScore} // ${percent}%</div>
        ${errorHtml}
        <div class="grammar-verb-result-actions">
            <button class="grammar-ghost-btn" onclick="returnFromGrammarVerbScreen()">&lt; TOPICS</button>
            ${grammarVerbState.wrongQuestions.length ? '<button class="grammar-action-btn grammar-action-btn-secondary" onclick="retryGrammarVerbWrongQuestions()">RETRY WRONG</button>' : ''}
            <button class="grammar-action-btn grammar-action-btn-primary" onclick="restartGrammarVerbChallenge()">RESTART</button>
        </div>
    `;

    game.style.display = 'none';
    actions.style.display = 'none';
    result.style.display = 'block';
}

function restartGrammarVerbChallenge() {
    playSound('deploy-sfx');
    initGrammarVerbChallenge(false);
}

function retryGrammarVerbWrongQuestions() {
    if (!grammarVerbState.wrongQuestions.length) return;
    playSound('deploy-sfx');
    initGrammarVerbChallenge(true);
}

function handleGrammarKeyboardKey(keyValue, keyElement) {
    if (getGrammarVerbScreen()?.style.display !== 'flex') return;

    if (keyValue === 'PREV_FIELD') {
        moveGrammarVerbField(-1);
        return;
    }

    if (keyValue === 'NEXT_FIELD') {
        moveGrammarVerbField(1);
        return;
    }

    if (keyValue === 'ENTER') {
        if (grammarVerbState.checked) {
            advanceGrammarVerbQuestion();
        } else {
            checkGrammarVerbAnswer();
        }
        return;
    }

    if (grammarVerbState.checked) return;

    const fieldKey = GRAMMAR_VERB_FIELD_ORDER[grammarVerbState.activeFieldIndex];
    const input = getGrammarVerbFieldInput(fieldKey);
    if (!input) return;

    if (keyValue === 'BACKSPACE') {
        input.value = input.value.slice(0, -1);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return;
    }

    if (keyElement) {
        lastVirtualKeyboardKey = keyElement;
    }
    input.value += keyValue;
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function attachGrammarInputBehaviors() {
    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey, index) => {
        const input = getGrammarVerbFieldInput(fieldKey);
        if (!input) return;

        input.addEventListener('focus', () => {
            setGrammarVerbActiveField(index);
            if (grammarUsesGameKeyboard()) {
                configureGrammarKeyboard();
                input.blur();
            }
        });

        input.addEventListener('click', () => {
            setGrammarVerbActiveField(index);
            if (grammarUsesGameKeyboard()) {
                configureGrammarKeyboard();
                input.blur();
            }
        });

        input.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                moveGrammarVerbField(-1);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                moveGrammarVerbField(1);
            } else if (event.key === 'Enter') {
                event.preventDefault();
                if (grammarVerbState.checked) {
                    advanceGrammarVerbQuestion();
                } else {
                    checkGrammarVerbAnswer();
                }
            }
        });

        input.addEventListener('input', () => {
            input.classList.remove('is-correct', 'is-wrong');
            const container = getGrammarVerbFieldContainer(fieldKey);
            if (container) {
                const hint = container.querySelector('.grammar-answer-hint');
                if (hint) hint.remove();
            }
        });
    });
}

function attachLaunchGrammarInputBehaviors() {
    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey, index) => {
        const input = getLaunchGrammarInput(fieldKey);
        if (!input) return;

        input.addEventListener('focus', () => {
            setLaunchGrammarActiveField(index);
            if (grammarUsesGameKeyboard()) {
                input.blur();
            }
        });

        input.addEventListener('click', (event) => {
            event.stopPropagation();
            setLaunchGrammarActiveField(index);
            if (grammarUsesGameKeyboard()) {
                input.blur();
            }
        });

        input.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                moveLaunchGrammarField(-1);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                moveLaunchGrammarField(1);
            } else if (event.key === 'Enter') {
                event.preventDefault();
                checkAnswer();
            }
        });

        input.addEventListener('input', () => {
            const presentClue = getLaunchGrammarPresentClue();
            if (fieldKey === 'present' && presentClue && !input.value) {
                input.value = presentClue;
            }
            input.classList.remove('is-correct', 'is-wrong');
            const field = getLaunchGrammarField(fieldKey);
            if (field) {
                const hint = field.querySelector('.launch-grammar-hint');
                if (hint) hint.remove();
            }
        });
    });
}

function teardownGrammarScreens() {
    stopGrammarVerbTimer();
    hideGrammarKeyboard();
    const reference = document.getElementById('grammar-verb-reference');
    if (reference) reference.style.display = 'none';
}

window.openGrammarTopicScreen = openGrammarTopicScreen;
window.closeGrammarTopicScreen = closeGrammarTopicScreen;
window.openGrammarVerbTableScreen = openGrammarVerbTableScreen;
window.returnFromGrammarVerbScreen = returnFromGrammarVerbScreen;
window.toggleGrammarVerbReference = toggleGrammarVerbReference;
window.toggleGrammarTopicReference = toggleGrammarTopicReference;
window.checkGrammarVerbAnswer = checkGrammarVerbAnswer;
window.advanceGrammarVerbQuestion = advanceGrammarVerbQuestion;
window.restartGrammarVerbChallenge = restartGrammarVerbChallenge;
window.retryGrammarVerbWrongQuestions = retryGrammarVerbWrongQuestions;
window.teardownGrammarScreens = teardownGrammarScreens;
window.isGrammarBattleMode = isGrammarBattleMode;
window.prepareLaunchGrammarQuestion = prepareLaunchGrammarQuestion;
window.resetLaunchGrammarQuestion = resetLaunchGrammarQuestion;
window.focusLaunchGrammarField = focusLaunchGrammarField;
window.handleLaunchGrammarKey = handleLaunchGrammarKey;
window.checkGrammarBattleAnswer = checkGrammarBattleAnswer;
window.toggleLaunchGrammarReference = toggleLaunchGrammarReference;
window.getGrammarBattleDeckSnapshot = buildGrammarBattleDeck;
window.filterGrammarTopicReference = filterGrammarTopicReference;
window.showGrammarTopicSearchKeyboard = showGrammarTopicSearchKeyboard;
document.addEventListener('DOMContentLoaded', () => {
    attachGrammarInputBehaviors();
    attachLaunchGrammarInputBehaviors();
    mountGrammarTopicKeyboardToScreen();

    const keyboard = document.getElementById('grammar-virtual-keyboard');
    if (!keyboard) return;

    keyboard.addEventListener('click', (event) => {
        const key = event.target.closest('.kb-key');
        if (!key) return;
        event.preventDefault();
        event.stopPropagation();
        handleGrammarKeyboardKey(key.getAttribute('data-grammar-key'), key);
    });

    keyboard.addEventListener('touchstart', (event) => {
        const key = event.target.closest('.kb-key');
        if (!key) return;
        key.classList.add('kb-active');
    }, { passive: true });

    keyboard.addEventListener('touchend', (event) => {
        const key = event.target.closest('.kb-key');
        if (!key) return;
        setTimeout(() => key.classList.remove('kb-active'), 100);
    }, { passive: true });

    keyboard.addEventListener('touchcancel', (event) => {
        const key = event.target.closest('.kb-key');
        if (!key) return;
        key.classList.remove('kb-active');
    }, { passive: true });

    document.addEventListener('click', (event) => {
        const row = event.target.closest('.grammar-reference-row');
        if (!row) return;
        const speakTextValue = row.getAttribute('data-grammar-speak') || '';
        speakGrammarReferenceSequence(speakTextValue, row);
    });

    const topicKeyboard = document.getElementById('grammar-topic-virtual-keyboard');
    if (topicKeyboard) {
        topicKeyboard.addEventListener('click', (event) => {
            const key = event.target.closest('.kb-key');
            if (!key) return;
            event.preventDefault();
            event.stopPropagation();
            handleGrammarTopicKeyboardInput(key.getAttribute('data-grammar-topic-key'));
        });

        topicKeyboard.addEventListener('touchstart', (event) => {
            const key = event.target.closest('.kb-key');
            if (!key) return;
            key.classList.add('kb-active');
        }, { passive: true });

        topicKeyboard.addEventListener('touchend', (event) => {
            const key = event.target.closest('.kb-key');
            if (!key) return;
            setTimeout(() => key.classList.remove('kb-active'), 100);
        }, { passive: true });

        topicKeyboard.addEventListener('touchcancel', (event) => {
            const key = event.target.closest('.kb-key');
            if (!key) return;
            key.classList.remove('kb-active');
        }, { passive: true });
    }
});

window.addEventListener('resize', () => {
    if (grammarTopicKeyboardActive) updateGrammarTopicKeyboardLayout();
});

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        if (grammarTopicKeyboardActive) updateGrammarTopicKeyboardLayout();
    });
}
