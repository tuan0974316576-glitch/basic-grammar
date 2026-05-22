const GRAMMAR_VERB_BASE_TIME = 8;
const GRAMMAR_VERB_SECONDS_PER_LETTER = 0.3;
const GRAMMAR_VERB_QUESTION_COUNT = 20;
const GRAMMAR_TENSE_BASE_TIME = 8;
const GRAMMAR_TENSE_SECONDS_PER_LETTER = 0.8;
const GRAMMAR_TENSE_TOPIC = 'TENSES';
const GRAMMAR_CONDITIONAL_TOPIC = 'CONDITIONAL';
const GRAMMAR_DIRECT_TOPIC = 'DIRECT_QUESTION';
const GRAMMAR_INDIRECT_TOPIC = 'INDIRECT_QUESTION';
const GRAMMAR_IT_IS_TOPIC = 'IT_IS';
const GRAMMAR_INFINITIVE_GERUND_TOPIC = 'INFINITIVE_GERUND';
const GRAMMAR_PREPOSITION_PLACE_TOPIC = 'PREPOSITION_OF_PLACE';
const GRAMMAR_PREPOSITION_TIME_TOPIC = 'PREPOSITION_OF_TIME';
const GRAMMAR_REPORTED_SPEECH_TOPIC = 'REPORTED_SPEECH';
const GRAMMAR_REARRANGE_TOPICS = [GRAMMAR_DIRECT_TOPIC, GRAMMAR_INDIRECT_TOPIC, GRAMMAR_IT_IS_TOPIC, GRAMMAR_CONDITIONAL_TOPIC, GRAMMAR_REPORTED_SPEECH_TOPIC];
const GRAMMAR_FILL_IN_TOPICS = [GRAMMAR_TENSE_TOPIC, GRAMMAR_INFINITIVE_GERUND_TOPIC];
const GRAMMAR_CHOICE_TOPICS = [GRAMMAR_PREPOSITION_PLACE_TOPIC, GRAMMAR_PREPOSITION_TIME_TOPIC];
const GRAMMAR_DIRECT_BASE_TIME = 15;
const GRAMMAR_DIRECT_SECONDS_PER_TOKEN = 3;
const GRAMMAR_CHOICE_BASE_TIME = 10;
const GRAMMAR_TENSE_SELECTION_STORAGE_KEY = 'grammar_tense_selection_v1';
const GRAMMAR_CONDITIONAL_SELECTION_STORAGE_KEY = 'grammar_conditional_selection_v1';
const GRAMMAR_REPORTED_SPEECH_SELECTION_STORAGE_KEY = 'grammar_reported_speech_selection_v1';
const GRAMMAR_REFERENCE_SPEAK_GAP_MS = 150;
const GRAMMAR_REFERENCE_AUDIO_VOICE = 'en-US-AndrewMultilingualNeural';
const GRAMMAR_VERB_FIELD_ORDER = ['present', 'past', 'pp', 'pg'];
const GRAMMAR_BE_PRESENT_FORMS = ['am', 'is', 'are'];
const GRAMMAR_BE_PAST_FORMS = ['was', 'were'];
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
const GRAMMAR_TENSE_DEFINITIONS = [
    { id: 'simple_present', label: 'Simple Present' },
    { id: 'present_continuous', label: 'Present Continuous' },
    { id: 'present_perfect', label: 'Present Perfect' },
    { id: 'present_perfect_continuous', label: 'Present Perfect Cont.' },
    { id: 'simple_past', label: 'Simple Past' },
    { id: 'past_continuous', label: 'Past Continuous' },
    { id: 'past_perfect', label: 'Past Perfect' },
    { id: 'past_perfect_continuous', label: 'Past Perfect Cont.' },
    { id: 'simple_future', label: 'Simple Future' },
    { id: 'future_continuous', label: 'Future Continuous' },
    { id: 'future_perfect', label: 'Future Perfect' },
    { id: 'future_perfect_continuous', label: 'Future Perfect Cont.' }
];
const GRAMMAR_VOICE_DEFINITIONS = [
    { id: 'active', label: 'ACTIVE' },
    { id: 'passive', label: 'PASSIVE' }
];
const GRAMMAR_CONDITIONAL_DEFINITIONS = [
    { id: '0', label: 'TYPE 0' },
    { id: '1', label: 'TYPE 1' },
    { id: '2', label: 'TYPE 2' },
    { id: '3', label: 'TYPE 3' }
];
const GRAMMAR_REPORTED_SPEECH_DEFINITIONS = [
    { id: 'statement', label: 'REPORTED STATEMENT' },
    { id: 'question', label: 'REPORTED QUESTION' },
    { id: 'order', label: 'REPORTED ORDERS' }
];

const grammarVerbState = {
    questions: [],
    wrongQuestions: [],
    history: [],
    currentQuestionIndex: 0,
    score: 0,
    checked: false,
    timeLeft: GRAMMAR_VERB_BASE_TIME,
    timeLimit: GRAMMAR_VERB_BASE_TIME,
    timerInterval: null,
    activeFieldIndex: 0,
    referenceRendered: false
};

const grammarLaunchState = {
    activeFieldIndex: 0,
    referenceRendered: false,
    tenseAnswerWords: [],
    tenseAnswerText: '',
    tenseBlankCount: 1,
    tenseSlotTexts: [],
    directSelectedTokens: [],
    choiceSelectedIndex: null,
    choiceSelectedText: '',
    choiceSubmitting: false,
    choiceResolved: false
};

const grammarTenseSelectionState = {
    selectedTenses: new Set(),
    selectedVoices: new Set(),
    loaded: false
};

const grammarConditionalSelectionState = {
    selectedTypes: new Set(),
    loaded: false
};

const grammarReportedSpeechSelectionState = {
    selectedTypes: new Set(),
    loaded: false
};

let grammarTopicScreenMode = 'default';
let grammarTopicKeyboardActive = false;
let activeGrammarReferenceUtterances = [];
let activeGrammarReferenceAudio = null;
let activeGrammarReferenceAudioToken = 0;
const grammarReferenceAudioRuntimeCache = new Map();
let grammarIntrinsicCapitalTokenCache = null;

function isGrammarQuestionRearrangeTopic(topic) {
    return GRAMMAR_REARRANGE_TOPICS.includes(topic);
}

function isGrammarFillInTopic(topic) {
    return GRAMMAR_FILL_IN_TOPICS.includes(topic);
}

function isGrammarChoiceTopic(topic) {
    return GRAMMAR_CHOICE_TOPICS.includes(topic);
}

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

function getGrammarFormAnswer(question, fieldKey) {
    if (!question) return '';
    if (question.grammarForms) return String(question.grammarForms[fieldKey] || '');
    if (Array.isArray(question)) return String(question[GRAMMAR_VERB_FIELD_INDEX[fieldKey]] || '');
    return '';
}

function isGrammarBeQuestion(question) {
    const present = getGrammarFormAnswer(question, 'present').trim().toLowerCase();
    const pp = getGrammarFormAnswer(question, 'pp').trim().toLowerCase();
    const pg = getGrammarFormAnswer(question, 'pg').trim().toLowerCase();
    return present === 'be' && pp === 'been' && pg === 'being';
}

function getGrammarVerbFieldAnswers(question, fieldKey) {
    if (isGrammarBeQuestion(question)) {
        if (fieldKey === 'present') return [...GRAMMAR_BE_PRESENT_FORMS];
        if (fieldKey === 'past') return [...GRAMMAR_BE_PAST_FORMS];
    }

    const answer = getGrammarFormAnswer(question, fieldKey).trim();
    return answer ? [answer] : [];
}

function getGrammarVerbFieldAnswerText(question, fieldKey) {
    return getGrammarVerbFieldAnswers(question, fieldKey).join(' / ');
}

function getGrammarVerbAnswerSlots(question) {
    const slots = [];
    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey) => {
        const answers = getGrammarVerbFieldAnswers(question, fieldKey);
        answers.forEach((answer, subIndex) => {
            const hasSubSlots = answers.length > 1;
            slots.push({
                slotKey: hasSubSlots ? `${fieldKey}-${subIndex}` : fieldKey,
                fieldKey,
                subIndex: hasSubSlots ? subIndex : null,
                answer,
                label: hasSubSlots
                    ? `${GRAMMAR_VERB_FIELD_LABELS[fieldKey]} ${subIndex + 1}`
                    : GRAMMAR_VERB_FIELD_LABELS[fieldKey]
            });
        });
    });
    return slots.map((slot, index) => ({ ...slot, index }));
}

function getGrammarVerbFirstSlotIndexForField(fieldKey, question) {
    const slots = getGrammarVerbAnswerSlots(question);
    const slotIndex = slots.findIndex((slot) => slot.fieldKey === fieldKey);
    return slotIndex >= 0 ? slotIndex : 0;
}

function getGrammarVerbSlotCount(question) {
    return getGrammarVerbAnswerSlots(question).length || GRAMMAR_VERB_FIELD_ORDER.length;
}

function getGrammarAnswerLetters(question) {
    return getGrammarVerbAnswerSlots(question)
        .map((slot) => slot.answer)
        .join('')
        .replace(/[^A-Z]/gi, '').length;
}

function getGrammarVerbAnswerTimeLimit(question) {
    return GRAMMAR_VERB_BASE_TIME + (getGrammarAnswerLetters(question) * GRAMMAR_VERB_SECONDS_PER_LETTER);
}

function getGrammarTensePrimaryAnswer(question) {
    const answers = question?.grammarTense?.answers || question?.answers || [];
    return String(answers[0] || '').trim();
}

function getGrammarTenseAnswerLetters(question) {
    return getGrammarTensePrimaryAnswer(question).replace(/[^A-Z]/gi, '').length;
}

function getGrammarTenseAnswerTimeLimit(question) {
    return GRAMMAR_TENSE_BASE_TIME + (getGrammarTenseAnswerLetters(question) * GRAMMAR_TENSE_SECONDS_PER_LETTER);
}

function getGrammarDirectPrimaryTokens(question) {
    const answers = question?.grammarDirect?.correctTokens || question?.correct_tokens || [];
    const firstAnswer = Array.isArray(answers) ? answers[0] : null;
    return Array.isArray(firstAnswer) ? firstAnswer.map(token => String(token || '').trim()).filter(Boolean) : [];
}

function getGrammarDirectAnswerTimeLimit(question) {
    const tokenCount = getGrammarDirectPrimaryTokens(question).length;
    return GRAMMAR_DIRECT_BASE_TIME + (tokenCount * GRAMMAR_DIRECT_SECONDS_PER_TOKEN);
}

function getGrammarChoiceAnswerTimeLimit() {
    return GRAMMAR_CHOICE_BASE_TIME;
}

function getGrammarBattleAnswerTimeLimit(question) {
    if (isGrammarChoiceTopic(question?.grammarTopic)) {
        return getGrammarChoiceAnswerTimeLimit(question);
    }
    if (isGrammarFillInTopic(question?.grammarTopic)) {
        return getGrammarTenseAnswerTimeLimit(question);
    }
    if (isGrammarQuestionRearrangeTopic(question?.grammarTopic)) {
        return getGrammarDirectAnswerTimeLimit(question);
    }
    return getGrammarVerbAnswerTimeLimit(question);
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

function getGrammarTenseBank() {
    return Array.isArray(window.GRAMMAR_TENSE_BANK) ? window.GRAMMAR_TENSE_BANK : [];
}

function getGrammarMixedTenseBank() {
    return Array.isArray(window.GRAMMAR_MIXED_TENSE_BANK) ? window.GRAMMAR_MIXED_TENSE_BANK : [];
}

function getGrammarInfinitiveGerundBank() {
    return Array.isArray(window.GRAMMAR_INFINITIVE_GERUND_BANK) ? window.GRAMMAR_INFINITIVE_GERUND_BANK : [];
}

function getGrammarPrepositionPlaceBank() {
    return Array.isArray(window.GRAMMAR_PREPOSITION_PLACE_BANK) ? window.GRAMMAR_PREPOSITION_PLACE_BANK : [];
}

function getGrammarPrepositionTimeBank() {
    return Array.isArray(window.GRAMMAR_PREPOSITION_TIME_BANK) ? window.GRAMMAR_PREPOSITION_TIME_BANK : [];
}

function getGrammarConditionalQuestionBank() {
    return Array.isArray(window.GRAMMAR_CONDITIONAL_BANK) ? window.GRAMMAR_CONDITIONAL_BANK : [];
}

function getGrammarReportedSpeechBank() {
    return Array.isArray(window.GRAMMAR_REPORTED_SPEECH_BANK) ? window.GRAMMAR_REPORTED_SPEECH_BANK : [];
}

function getGrammarTenseLabel(tenseId) {
    return GRAMMAR_TENSE_DEFINITIONS.find(item => item.id === tenseId)?.label || String(tenseId || '').replace(/_/g, ' ');
}

function getGrammarVoiceLabel(voiceId) {
    return GRAMMAR_VOICE_DEFINITIONS.find(item => item.id === voiceId)?.label || String(voiceId || '').toUpperCase();
}

function getGrammarConditionalTypeLabel(typeId) {
    return GRAMMAR_CONDITIONAL_DEFINITIONS.find(item => item.id === String(typeId))?.label || `TYPE ${typeId}`;
}

function getGrammarReportedSpeechTypeLabel(typeId) {
    return GRAMMAR_REPORTED_SPEECH_DEFINITIONS.find(item => item.id === String(typeId))?.label || String(typeId || '').toUpperCase();
}

function loadGrammarTenseSelectionState() {
    if (grammarTenseSelectionState.loaded) return;
    grammarTenseSelectionState.loaded = true;

    try {
        const rawValue = localStorage.getItem(GRAMMAR_TENSE_SELECTION_STORAGE_KEY);
        if (!rawValue) return;

        const saved = JSON.parse(rawValue);
        const validTenses = new Set(GRAMMAR_TENSE_DEFINITIONS.map(item => item.id));
        const validVoices = new Set(GRAMMAR_VOICE_DEFINITIONS.map(item => item.id));
        grammarTenseSelectionState.selectedTenses = new Set(
            Array.isArray(saved?.tenses) ? saved.tenses.filter(id => validTenses.has(id)) : []
        );
        grammarTenseSelectionState.selectedVoices = new Set(
            Array.isArray(saved?.voices) ? saved.voices.filter(id => validVoices.has(id)) : []
        );
    } catch (error) {
        console.warn('[Grammar Tenses] Failed to load saved selection:', error);
    }
}

function saveGrammarTenseSelectionState() {
    try {
        localStorage.setItem(GRAMMAR_TENSE_SELECTION_STORAGE_KEY, JSON.stringify({
            tenses: Array.from(grammarTenseSelectionState.selectedTenses),
            voices: Array.from(grammarTenseSelectionState.selectedVoices)
        }));
    } catch (error) {
        console.warn('[Grammar Tenses] Failed to save selection:', error);
    }
}

function loadGrammarConditionalSelectionState() {
    if (grammarConditionalSelectionState.loaded) return;
    grammarConditionalSelectionState.loaded = true;

    try {
        const rawValue = localStorage.getItem(GRAMMAR_CONDITIONAL_SELECTION_STORAGE_KEY);
        if (!rawValue) return;

        const saved = JSON.parse(rawValue);
        const validTypes = new Set(GRAMMAR_CONDITIONAL_DEFINITIONS.map(item => item.id));
        grammarConditionalSelectionState.selectedTypes = new Set(
            Array.isArray(saved?.types) ? saved.types.map(String).filter(id => validTypes.has(id)) : []
        );
    } catch (error) {
        console.warn('[Grammar Conditional] Failed to load saved selection:', error);
    }
}

function saveGrammarConditionalSelectionState() {
    try {
        localStorage.setItem(GRAMMAR_CONDITIONAL_SELECTION_STORAGE_KEY, JSON.stringify({
            types: Array.from(grammarConditionalSelectionState.selectedTypes)
        }));
    } catch (error) {
        console.warn('[Grammar Conditional] Failed to save selection:', error);
    }
}

function loadGrammarReportedSpeechSelectionState() {
    if (grammarReportedSpeechSelectionState.loaded) return;
    grammarReportedSpeechSelectionState.loaded = true;

    try {
        const rawValue = localStorage.getItem(GRAMMAR_REPORTED_SPEECH_SELECTION_STORAGE_KEY);
        if (!rawValue) return;

        const saved = JSON.parse(rawValue);
        const validTypes = new Set(GRAMMAR_REPORTED_SPEECH_DEFINITIONS.map(item => item.id));
        grammarReportedSpeechSelectionState.selectedTypes = new Set(
            Array.isArray(saved?.types) ? saved.types.map(String).filter(id => validTypes.has(id)) : []
        );
    } catch (error) {
        console.warn('[Grammar Reported Speech] Failed to load saved selection:', error);
    }
}

function saveGrammarReportedSpeechSelectionState() {
    try {
        localStorage.setItem(GRAMMAR_REPORTED_SPEECH_SELECTION_STORAGE_KEY, JSON.stringify({
            types: Array.from(grammarReportedSpeechSelectionState.selectedTypes)
        }));
    } catch (error) {
        console.warn('[Grammar Reported Speech] Failed to save selection:', error);
    }
}

function createGrammarTenseBattleItem(question, options = {}) {
    const topic = options.topic || GRAMMAR_TENSE_TOPIC;
    return {
        ch: question.chinese,
        en: question.id,
        grammarTopic: topic,
        grammarTense: {
            id: question.id,
            topic,
            tense: question.tense || 'mixed_tenses',
            voice: question.voice || (Array.isArray(question.voices) ? question.voices.join('+') : ''),
            tenses: Array.isArray(question.tenses) ? question.tenses : [question.tense].filter(Boolean),
            voices: Array.isArray(question.voices) ? question.voices : [question.voice].filter(Boolean),
            mixed: question.mixed === true,
            chinese: question.chinese,
            question: question.question,
            answers: question.answers,
            answerSlots: question.answerSlots,
            exp: question.exp,
            structure: question.structure === true
        }
    };
}

function grammarMixedQuestionMatchesSelection(question, selectedTenseSet, selectedVoiceSet) {
    const requiredTenses = Array.isArray(question.tenses) ? question.tenses.filter(Boolean) : [];
    const requiredVoices = Array.isArray(question.voices) ? question.voices.filter(Boolean) : [question.voice].filter(Boolean);
    if (selectedTenseSet.size < 2 || requiredTenses.length < 2) return false;
    if (!requiredTenses.every(tense => selectedTenseSet.has(tense))) return false;
    return requiredVoices.length === 0 || requiredVoices.every(voice => selectedVoiceSet.has(voice));
}

function buildGrammarTenseBattleDeck() {
    loadGrammarTenseSelectionState();
    const selectedTenses = Array.from(grammarTenseSelectionState.selectedTenses);
    const selectedVoices = Array.from(grammarTenseSelectionState.selectedVoices);
    const selectedTenseSet = new Set(selectedTenses);
    const selectedVoiceSet = new Set(selectedVoices);
    const buckets = new Map();

    getGrammarTenseBank().forEach((question) => {
        if (!selectedTenses.includes(question.tense) || !selectedVoices.includes(question.voice)) return;
        const key = `${question.tense}::${question.voice}`;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(question);
    });

    getGrammarMixedTenseBank().forEach((question) => {
        if (!grammarMixedQuestionMatchesSelection(question, selectedTenseSet, selectedVoiceSet)) return;
        const key = `mixed::${question.tenses.join('+')}::${(question.voices || []).join('+')}`;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(question);
    });

    const bucketKeys = shuffleGrammarArray(Array.from(buckets.keys()));
    bucketKeys.forEach((key) => {
        buckets.set(key, shuffleGrammarArray(buckets.get(key)));
    });

    const deck = [];
    let hasMore = true;
    while (hasMore) {
        hasMore = false;
        shuffleGrammarArray(bucketKeys).forEach((key) => {
            const bucket = buckets.get(key);
            if (!bucket || bucket.length === 0) return;
            deck.push(createGrammarTenseBattleItem(bucket.pop()));
            hasMore = true;
        });
    }

    return deck;
}

function buildGrammarInfinitiveGerundBattleDeck() {
    return shuffleGrammarArray(getGrammarInfinitiveGerundBank())
        .map((question) => createGrammarTenseBattleItem(question, {
            topic: GRAMMAR_INFINITIVE_GERUND_TOPIC
        }));
}

function createGrammarChoiceBattleItem(question, index = 0, options = {}) {
    const topic = options.topic || GRAMMAR_PREPOSITION_PLACE_TOPIC;
    const idPrefix = options.idPrefix || 'preposition_place';
    const choiceOptions = Array.isArray(question.options) ? question.options.map(option => String(option || '').trim()) : [];
    const correctIndex = Number.isInteger(question.correctIndex) ? question.correctIndex : 0;
    return {
        ch: question.chinese,
        en: question.id || `${idPrefix}_${index + 1}`,
        grammarTopic: topic,
        grammarChoice: {
            id: question.id || `${idPrefix}_${index + 1}`,
            topic,
            chinese: question.chinese,
            question: question.question,
            options: choiceOptions,
            correctIndex,
            correctText: choiceOptions[correctIndex] || '',
            explanation: question.explanation || ''
        }
    };
}

function buildGrammarPrepositionPlaceBattleDeck() {
    return shuffleGrammarArray(getGrammarPrepositionPlaceBank())
        .map((question, index) => createGrammarChoiceBattleItem(question, index, {
            topic: GRAMMAR_PREPOSITION_PLACE_TOPIC,
            idPrefix: 'preposition_place'
        }));
}

function buildGrammarPrepositionTimeBattleDeck() {
    return shuffleGrammarArray(getGrammarPrepositionTimeBank())
        .map((question, index) => createGrammarChoiceBattleItem(question, index, {
            topic: GRAMMAR_PREPOSITION_TIME_TOPIC,
            idPrefix: 'preposition_time'
        }));
}

function getGrammarDirectQuestionBank() {
    return Array.isArray(window.GRAMMAR_DIRECT_QUESTION_BANK) ? window.GRAMMAR_DIRECT_QUESTION_BANK : [];
}

function getGrammarIndirectQuestionBank() {
    return Array.isArray(window.GRAMMAR_INDIRECT_QUESTION_BANK) ? window.GRAMMAR_INDIRECT_QUESTION_BANK : [];
}

function getGrammarItIsQuestionBank() {
    return Array.isArray(window.GRAMMAR_IT_IS_BANK) ? window.GRAMMAR_IT_IS_BANK : [];
}

function createGrammarDirectQuestionBattleItem(question, index = 0, options = {}) {
    const topic = options.topic || GRAMMAR_DIRECT_TOPIC;
    const idPrefix = options.idPrefix || (
        topic === GRAMMAR_INDIRECT_TOPIC
            ? 'indirect_question'
            : topic === GRAMMAR_IT_IS_TOPIC
            ? 'it_is'
            : topic === GRAMMAR_CONDITIONAL_TOPIC
            ? 'conditional'
            : topic === GRAMMAR_REPORTED_SPEECH_TOPIC
            ? 'reported_speech'
            : 'direct_question'
    );
    const rawAnswers = Array.isArray(question.correct_tokens) ? question.correct_tokens : [];
    const answers = Array.isArray(rawAnswers[0]) ? rawAnswers : (rawAnswers.length ? [rawAnswers] : []);
    const primaryTokens = Array.isArray(answers[0]) ? answers[0] : [];
    const answerText = formatGrammarDirectTokens(primaryTokens);
    return {
        ch: question.chinese,
        en: question.id || `${idPrefix}_${index + 1}`,
        grammarTopic: topic,
        grammarDirect: {
            id: question.id || `${idPrefix}_${index + 1}`,
            topic,
            rule: question.rule ?? question.type,
            chinese: question.chinese,
            correctTokens: answers,
            distractors: Array.isArray(question.distractors) ? question.distractors : [],
            correctText: answerText
        }
    };
}

function buildGrammarDirectQuestionBattleDeck() {
    return shuffleGrammarArray(getGrammarDirectQuestionBank())
        .map((question, index) => createGrammarDirectQuestionBattleItem(question, index, {
            topic: GRAMMAR_DIRECT_TOPIC,
            idPrefix: 'direct_question'
        }));
}

function buildGrammarIndirectQuestionBattleDeck() {
    return shuffleGrammarArray(getGrammarIndirectQuestionBank())
        .map((question, index) => createGrammarDirectQuestionBattleItem(question, index, {
            topic: GRAMMAR_INDIRECT_TOPIC,
            idPrefix: 'indirect_question'
        }));
}

function buildGrammarItIsQuestionBattleDeck() {
    return shuffleGrammarArray(getGrammarItIsQuestionBank())
        .map((question, index) => createGrammarDirectQuestionBattleItem(question, index, {
            topic: GRAMMAR_IT_IS_TOPIC,
            idPrefix: 'it_is'
        }));
}

function buildGrammarConditionalBattleDeck() {
    loadGrammarConditionalSelectionState();
    const selectedTypes = Array.from(grammarConditionalSelectionState.selectedTypes);
    const buckets = new Map();

    getGrammarConditionalQuestionBank().forEach((question) => {
        const type = String(question.type ?? question.rule ?? '');
        if (!selectedTypes.includes(type)) return;
        if (!buckets.has(type)) buckets.set(type, []);
        buckets.get(type).push(question);
    });

    const bucketKeys = shuffleGrammarArray(Array.from(buckets.keys()));
    bucketKeys.forEach((key) => {
        buckets.set(key, shuffleGrammarArray(buckets.get(key)));
    });

    const deck = [];
    let hasMore = true;
    while (hasMore) {
        hasMore = false;
        shuffleGrammarArray(bucketKeys).forEach((key) => {
            const bucket = buckets.get(key);
            if (!bucket || bucket.length === 0) return;
            deck.push(createGrammarDirectQuestionBattleItem(bucket.pop(), deck.length, {
                topic: GRAMMAR_CONDITIONAL_TOPIC,
                idPrefix: 'conditional'
            }));
            hasMore = true;
        });
    }

    return deck;
}

function buildGrammarReportedSpeechBattleDeck() {
    loadGrammarReportedSpeechSelectionState();
    const selectedTypes = Array.from(grammarReportedSpeechSelectionState.selectedTypes);
    const buckets = new Map();

    getGrammarReportedSpeechBank().forEach((question) => {
        const type = String(question.type ?? question.rule ?? '');
        if (!selectedTypes.includes(type)) return;
        if (!buckets.has(type)) buckets.set(type, []);
        buckets.get(type).push(question);
    });

    const bucketKeys = shuffleGrammarArray(Array.from(buckets.keys()));
    bucketKeys.forEach((key) => {
        buckets.set(key, shuffleGrammarArray(buckets.get(key)));
    });

    const deck = [];
    let hasMore = true;
    while (hasMore) {
        hasMore = false;
        shuffleGrammarArray(bucketKeys).forEach((key) => {
            const bucket = buckets.get(key);
            if (!bucket || bucket.length === 0) return;
            deck.push(createGrammarDirectQuestionBattleItem(bucket.pop(), deck.length, {
                topic: GRAMMAR_REPORTED_SPEECH_TOPIC,
                idPrefix: 'reported_speech'
            }));
            hasMore = true;
        });
    }

    return deck;
}

function getGrammarBattleDeckSnapshot() {
    if (window.selectedGrammarTopic === GRAMMAR_TENSE_TOPIC ||
        (typeof selectedLevel !== 'undefined' && selectedLevel === GRAMMAR_TENSE_TOPIC)) {
        return buildGrammarTenseBattleDeck();
    }
    if (window.selectedGrammarTopic === GRAMMAR_CONDITIONAL_TOPIC ||
        (typeof selectedLevel !== 'undefined' && selectedLevel === GRAMMAR_CONDITIONAL_TOPIC)) {
        return buildGrammarConditionalBattleDeck();
    }
    if (window.selectedGrammarTopic === GRAMMAR_REPORTED_SPEECH_TOPIC ||
        (typeof selectedLevel !== 'undefined' && selectedLevel === GRAMMAR_REPORTED_SPEECH_TOPIC)) {
        return buildGrammarReportedSpeechBattleDeck();
    }
    if (window.selectedGrammarTopic === GRAMMAR_DIRECT_TOPIC ||
        (typeof selectedLevel !== 'undefined' && selectedLevel === GRAMMAR_DIRECT_TOPIC)) {
        return buildGrammarDirectQuestionBattleDeck();
    }
    if (window.selectedGrammarTopic === GRAMMAR_INDIRECT_TOPIC ||
        (typeof selectedLevel !== 'undefined' && selectedLevel === GRAMMAR_INDIRECT_TOPIC)) {
        return buildGrammarIndirectQuestionBattleDeck();
    }
    if (window.selectedGrammarTopic === GRAMMAR_IT_IS_TOPIC ||
        (typeof selectedLevel !== 'undefined' && selectedLevel === GRAMMAR_IT_IS_TOPIC)) {
        return buildGrammarItIsQuestionBattleDeck();
    }
    if (window.selectedGrammarTopic === GRAMMAR_INFINITIVE_GERUND_TOPIC ||
        (typeof selectedLevel !== 'undefined' && selectedLevel === GRAMMAR_INFINITIVE_GERUND_TOPIC)) {
        return buildGrammarInfinitiveGerundBattleDeck();
    }
    if (window.selectedGrammarTopic === GRAMMAR_PREPOSITION_PLACE_TOPIC ||
        (typeof selectedLevel !== 'undefined' && selectedLevel === GRAMMAR_PREPOSITION_PLACE_TOPIC)) {
        return buildGrammarPrepositionPlaceBattleDeck();
    }
    if (window.selectedGrammarTopic === GRAMMAR_PREPOSITION_TIME_TOPIC ||
        (typeof selectedLevel !== 'undefined' && selectedLevel === GRAMMAR_PREPOSITION_TIME_TOPIC)) {
        return buildGrammarPrepositionTimeBattleDeck();
    }
    return buildGrammarBattleDeck();
}

function buildGrammarReferenceRows(bodyId) {
    const tbody = document.getElementById(bodyId);
    if (!tbody || !Array.isArray(window.GRAMMAR_VERB_BANK)) return;

    tbody.innerHTML = window.GRAMMAR_VERB_BANK.map((verb) => {
        const question = [verb[0], verb[1], verb[2], verb[3], verb[4]];
        const displayForms = GRAMMAR_VERB_FIELD_ORDER.map((fieldKey) =>
            getGrammarVerbFieldAnswerText(question, fieldKey).replace(/\s+\/\s+/g, '/')
        );
        const speakParts = getGrammarVerbAnswerSlots(question).map((slot) => slot.answer);
        const speakTextValue = speakParts.join(' ');
        const audioKey = speakParts.map(part => String(part || '').trim().toLowerCase()).join('|');
        return `
            <tr class="grammar-reference-row" data-grammar-speak="${speakTextValue}" data-grammar-audio-key="${audioKey}" data-grammar-search="${[verb[0], ...displayForms, ...speakParts].join(' ').toLowerCase()}">
                <td data-reference-label="CHINESE">${verb[0]}</td>
                <td data-reference-label="PRESENT">${displayForms[0]}</td>
                <td data-reference-label="PAST">${displayForms[1]}</td>
                <td data-reference-label="PP">${displayForms[2]}</td>
                <td data-reference-label="ING">${displayForms[3]}</td>
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

        const shouldUseIosBundleAudio = !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform())
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
    document.querySelectorAll('.grammar-reference-row.speaking').forEach((row) => row.classList.remove('speaking'));
    stopGrammarReferenceAudioPlayback();
    if (window.speechSynthesis && typeof window.speechSynthesis.cancel === 'function') window.speechSynthesis.cancel();

    const played = await playGrammarReferenceStoredAudio(parts, rowElement);
    if (!played) speakGrammarReferenceFallback(parts, rowElement);
}

function isGrammarBattleMode() {
    return currentPracticeMode === 'GRAMMAR' &&
        (
            window.selectedGrammarTopic === 'VERB_TABLE' ||
            isGrammarFillInTopic(window.selectedGrammarTopic) ||
            isGrammarQuestionRearrangeTopic(window.selectedGrammarTopic) ||
            isGrammarChoiceTopic(window.selectedGrammarTopic)
        );
}

function isGrammarVerbBattleMode(question = currentVocab) {
    return isGrammarBattleMode() && (question?.grammarTopic || window.selectedGrammarTopic) === 'VERB_TABLE';
}

function isGrammarTenseBattleMode(question = currentVocab) {
    return isGrammarBattleMode() && Boolean(question?.grammarTense || isGrammarFillInTopic(question?.grammarTopic || window.selectedGrammarTopic));
}

function isGrammarDirectQuestionBattleMode(question = currentVocab) {
    return isGrammarBattleMode() && isGrammarQuestionRearrangeTopic(question?.grammarTopic || window.selectedGrammarTopic);
}

function isGrammarChoiceBattleMode(question = currentVocab) {
    return isGrammarBattleMode() && isGrammarChoiceTopic(question?.grammarTopic || window.selectedGrammarTopic);
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

function getGrammarVerbTopicProgress() {
    const total = Array.isArray(window.GRAMMAR_VERB_BANK) ? window.GRAMMAR_VERB_BANK.length : 0;
    const masteryRoot = (typeof userMastery !== 'undefined' ? userMastery : window.userMastery) || {};
    const grammarMastery = masteryRoot.grammar || {};
    const masteredWords = new Set();

    ['VERB_TABLE', 'GRAMMAR'].forEach((levelKey) => {
        Object.entries(grammarMastery[levelKey] || {}).forEach(([wordKey, entry]) => {
            if (entry?.status === 1) masteredWords.add(String(wordKey).toLowerCase());
        });
    });

    return { mastered: masteredWords.size, total };
}

function getGrammarTenseTopicProgress() {
    const total = getGrammarTenseBank().length + getGrammarMixedTenseBank().length;
    const masteryRoot = (typeof userMastery !== 'undefined' ? userMastery : window.userMastery) || {};
    const grammarMastery = masteryRoot.grammar || {};
    const mastered = Object.values(grammarMastery[GRAMMAR_TENSE_TOPIC] || {})
        .filter(entry => entry?.status === 1)
        .length;

    return { mastered, total };
}

function getGrammarInfinitiveGerundTopicProgress() {
    const total = getGrammarInfinitiveGerundBank().length;
    const masteryRoot = (typeof userMastery !== 'undefined' ? userMastery : window.userMastery) || {};
    const grammarMastery = masteryRoot.grammar || {};
    const mastered = Object.values(grammarMastery[GRAMMAR_INFINITIVE_GERUND_TOPIC] || {})
        .filter(entry => entry?.status === 1)
        .length;

    return { mastered, total };
}

function getGrammarPrepositionPlaceTopicProgress() {
    const total = getGrammarPrepositionPlaceBank().length;
    const masteryRoot = (typeof userMastery !== 'undefined' ? userMastery : window.userMastery) || {};
    const grammarMastery = masteryRoot.grammar || {};
    const mastered = Object.values(grammarMastery[GRAMMAR_PREPOSITION_PLACE_TOPIC] || {})
        .filter(entry => entry?.status === 1)
        .length;

    return { mastered, total };
}

function getGrammarPrepositionTimeTopicProgress() {
    const total = getGrammarPrepositionTimeBank().length;
    const masteryRoot = (typeof userMastery !== 'undefined' ? userMastery : window.userMastery) || {};
    const grammarMastery = masteryRoot.grammar || {};
    const mastered = Object.values(grammarMastery[GRAMMAR_PREPOSITION_TIME_TOPIC] || {})
        .filter(entry => entry?.status === 1)
        .length;

    return { mastered, total };
}

function getGrammarDirectQuestionTopicProgress(topic = GRAMMAR_DIRECT_TOPIC) {
    const total = topic === GRAMMAR_INDIRECT_TOPIC
        ? getGrammarIndirectQuestionBank().length
        : topic === GRAMMAR_IT_IS_TOPIC
        ? getGrammarItIsQuestionBank().length
        : topic === GRAMMAR_CONDITIONAL_TOPIC
        ? getGrammarConditionalQuestionBank().length
        : topic === GRAMMAR_REPORTED_SPEECH_TOPIC
        ? getGrammarReportedSpeechBank().length
        : getGrammarDirectQuestionBank().length;
    const masteryRoot = (typeof userMastery !== 'undefined' ? userMastery : window.userMastery) || {};
    const grammarMastery = masteryRoot.grammar || {};
    const mastered = Object.values(grammarMastery[topic] || {})
        .filter(entry => entry?.status === 1)
        .length;

    return { mastered, total };
}

function updateGrammarTopicProgress() {
    const verbProgress = getGrammarVerbTopicProgress();
    const tenseProgress = getGrammarTenseTopicProgress();
    const conditionalProgress = getGrammarDirectQuestionTopicProgress(GRAMMAR_CONDITIONAL_TOPIC);
    const reportedSpeechProgress = getGrammarDirectQuestionTopicProgress(GRAMMAR_REPORTED_SPEECH_TOPIC);
    const directProgress = getGrammarDirectQuestionTopicProgress();
    const indirectProgress = getGrammarDirectQuestionTopicProgress(GRAMMAR_INDIRECT_TOPIC);
    const itIsProgress = getGrammarDirectQuestionTopicProgress(GRAMMAR_IT_IS_TOPIC);
    const infinitiveGerundProgress = getGrammarInfinitiveGerundTopicProgress();
    const prepositionPlaceProgress = getGrammarPrepositionPlaceTopicProgress();
    const prepositionTimeProgress = getGrammarPrepositionTimeTopicProgress();
    const progressEl = document.getElementById('grammar-topic-progress');
    const tenseProgressEl = document.getElementById('grammar-tense-topic-progress');
    const conditionalProgressEl = document.getElementById('grammar-conditional-topic-progress');
    const reportedSpeechProgressEl = document.getElementById('grammar-reported-speech-topic-progress');
    const directProgressEl = document.getElementById('grammar-direct-topic-progress');
    const indirectProgressEl = document.getElementById('grammar-indirect-topic-progress');
    const itIsProgressEl = document.getElementById('grammar-it-is-topic-progress');
    const infinitiveGerundProgressEl = document.getElementById('grammar-infinitive-gerund-topic-progress');
    const prepositionPlaceProgressEl = document.getElementById('grammar-preposition-place-topic-progress');
    const prepositionTimeProgressEl = document.getElementById('grammar-preposition-time-topic-progress');
    const topicBtn = document.querySelector('.grammar-topic-btn:not(.grammar-topic-btn-tense)');
    const tenseTopicBtn = document.querySelector('.grammar-topic-btn-tense');
    const conditionalTopicBtn = document.querySelector('.grammar-topic-btn-conditional');
    const reportedSpeechTopicBtn = document.querySelector('.grammar-topic-btn-reported-speech');
    const directTopicBtn = document.querySelector('.grammar-topic-btn-direct');
    const indirectTopicBtn = document.querySelector('.grammar-topic-btn-indirect');
    const itIsTopicBtn = document.querySelector('.grammar-topic-btn-it-is');
    const infinitiveGerundTopicBtn = document.querySelector('.grammar-topic-btn-infinitive-gerund');
    const prepositionPlaceTopicBtn = document.querySelector('.grammar-topic-btn-preposition-place');
    const prepositionTimeTopicBtn = document.querySelector('.grammar-topic-btn-preposition-time');

    if (progressEl) {
        progressEl.textContent = `${verbProgress.mastered}/${verbProgress.total}`;
    }
    if (topicBtn) {
        topicBtn.classList.toggle('completed', verbProgress.total > 0 && verbProgress.mastered >= verbProgress.total);
    }
    if (tenseProgressEl) {
        tenseProgressEl.textContent = `${tenseProgress.mastered}/${tenseProgress.total}`;
    }
    if (tenseTopicBtn) {
        tenseTopicBtn.classList.toggle('completed', tenseProgress.total > 0 && tenseProgress.mastered >= tenseProgress.total);
    }
    if (conditionalProgressEl) {
        conditionalProgressEl.textContent = `${conditionalProgress.mastered}/${conditionalProgress.total}`;
    }
    if (conditionalTopicBtn) {
        conditionalTopicBtn.classList.toggle('completed', conditionalProgress.total > 0 && conditionalProgress.mastered >= conditionalProgress.total);
    }
    if (reportedSpeechProgressEl) {
        reportedSpeechProgressEl.textContent = `${reportedSpeechProgress.mastered}/${reportedSpeechProgress.total}`;
    }
    if (reportedSpeechTopicBtn) {
        reportedSpeechTopicBtn.classList.toggle('completed', reportedSpeechProgress.total > 0 && reportedSpeechProgress.mastered >= reportedSpeechProgress.total);
    }
    if (directProgressEl) {
        directProgressEl.textContent = `${directProgress.mastered}/${directProgress.total}`;
    }
    if (directTopicBtn) {
        directTopicBtn.classList.toggle('completed', directProgress.total > 0 && directProgress.mastered >= directProgress.total);
    }
    if (indirectProgressEl) {
        indirectProgressEl.textContent = `${indirectProgress.mastered}/${indirectProgress.total}`;
    }
    if (indirectTopicBtn) {
        indirectTopicBtn.classList.toggle('completed', indirectProgress.total > 0 && indirectProgress.mastered >= indirectProgress.total);
    }
    if (itIsProgressEl) {
        itIsProgressEl.textContent = `${itIsProgress.mastered}/${itIsProgress.total}`;
    }
    if (itIsTopicBtn) {
        itIsTopicBtn.classList.toggle('completed', itIsProgress.total > 0 && itIsProgress.mastered >= itIsProgress.total);
    }
    if (infinitiveGerundProgressEl) {
        infinitiveGerundProgressEl.textContent = `${infinitiveGerundProgress.mastered}/${infinitiveGerundProgress.total}`;
    }
    if (infinitiveGerundTopicBtn) {
        infinitiveGerundTopicBtn.classList.toggle('completed', infinitiveGerundProgress.total > 0 && infinitiveGerundProgress.mastered >= infinitiveGerundProgress.total);
    }
    if (prepositionPlaceProgressEl) {
        prepositionPlaceProgressEl.textContent = `${prepositionPlaceProgress.mastered}/${prepositionPlaceProgress.total}`;
    }
    if (prepositionPlaceTopicBtn) {
        prepositionPlaceTopicBtn.classList.toggle('completed', prepositionPlaceProgress.total > 0 && prepositionPlaceProgress.mastered >= prepositionPlaceProgress.total);
    }
    if (prepositionTimeProgressEl) {
        prepositionTimeProgressEl.textContent = `${prepositionTimeProgress.mastered}/${prepositionTimeProgress.total}`;
    }
    if (prepositionTimeTopicBtn) {
        prepositionTimeTopicBtn.classList.toggle('completed', prepositionTimeProgress.total > 0 && prepositionTimeProgress.mastered >= prepositionTimeProgress.total);
    }
}

function openGrammarTopicScreen() {
    if (typeof tempGameMode !== 'undefined' && tempGameMode === 'PVP') {
        if (typeof playSound === 'function') playSound('wrong-sfx');
        if (typeof showNotification === 'function') {
            showNotification('GRAMMAR NOT AVAILABLE IN MULTIPLAYER', 'warning', 2500);
        }
        return;
    }

    playSound('deploy-sfx');
    const levelScreen = document.getElementById('level-screen');
    if (levelScreen) levelScreen.style.display = 'none';
    showSelectionOverlay();
    returnToGrammarTopicList();
    updateGrammarTopicProgress();
    showGrammarScreenWithAnimation('grammar-topic-screen');
}

function closeGrammarTopicScreen() {
    if (grammarTopicScreenMode === 'reference') {
        setGrammarTopicReferenceMode(false);
        return;
    }
    if (grammarTopicScreenMode === 'tense' || grammarTopicScreenMode === 'conditional' || grammarTopicScreenMode === 'reported') {
        returnToGrammarTopicList();
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

function setGrammarTopicCardsVisible(isVisible) {
    document.querySelectorAll('#grammar-topic-grid > .grammar-topic-card').forEach((card) => {
        card.style.display = isVisible ? '' : 'none';
    });
}

function setGrammarTopicReferenceMode(isReferenceMode) {
    const topicScreen = document.getElementById('grammar-topic-screen');
    const reference = document.getElementById('grammar-topic-reference');
    const title = document.getElementById('grammar-topic-title');
    const subtitle = document.getElementById('grammar-topic-subtitle');
    const grid = document.getElementById('grammar-topic-grid');
    const tenseSetup = document.getElementById('grammar-tense-setup');
    const conditionalSetup = document.getElementById('grammar-conditional-setup');
    const reportedSpeechSetup = document.getElementById('grammar-reported-speech-setup');
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
        if (grid) grid.style.display = 'flex';
        setGrammarTopicCardsVisible(false);
        if (tenseSetup) tenseSetup.style.display = 'none';
        if (conditionalSetup) conditionalSetup.style.display = 'none';
        if (reportedSpeechSetup) reportedSpeechSetup.style.display = 'none';
        if (searchWrap) searchWrap.style.display = 'block';
        if (panel) {
            panel.classList.add('is-reference-open');
            panel.classList.remove('is-tense-open');
        }
        if (reference) reference.style.display = 'block';
        return;
    }

    hideGrammarTopicSearchKeyboard();
    if (typeof restoreStageVocabBgm === 'function') restoreStageVocabBgm();
    if (topicScreen) topicScreen.classList.remove('grammar-topic-reference-mode');
    if (title) title.innerText = 'SELECT TOPIC';
    if (subtitle) {
        subtitle.innerText = 'GRAMMAR TRAINING MODULE';
        subtitle.style.display = 'block';
    }
    if (grid) grid.style.display = 'flex';
    setGrammarTopicCardsVisible(true);
    if (tenseSetup) tenseSetup.style.display = 'none';
    if (conditionalSetup) conditionalSetup.style.display = 'none';
    if (reportedSpeechSetup) reportedSpeechSetup.style.display = 'none';
    if (searchWrap) searchWrap.style.display = 'none';
    if (searchInput) {
        searchInput.value = '';
        filterGrammarTopicReference();
    }
    if (panel) panel.classList.remove('is-reference-open', 'is-tense-open');
    if (reference) reference.style.display = 'none';
    updateGrammarTopicProgress();
}

function returnToGrammarTopicList() {
    setGrammarTopicReferenceMode(false);
}

function renderGrammarTenseSetupOptions() {
    const tenseGrid = document.getElementById('grammar-tense-option-grid');
    const voiceGrid = document.getElementById('grammar-voice-option-grid');

    if (tenseGrid && !tenseGrid.dataset.rendered) {
        tenseGrid.innerHTML = GRAMMAR_TENSE_DEFINITIONS.map((item) => `
            <button type="button" class="grammar-tense-option" data-grammar-tense="${item.id}" onclick="toggleGrammarTenseOption('${item.id}')">${item.label}</button>
        `).join('');
        tenseGrid.dataset.rendered = 'true';
    }

    if (voiceGrid && !voiceGrid.dataset.rendered) {
        voiceGrid.innerHTML = GRAMMAR_VOICE_DEFINITIONS.map((item) => `
            <button type="button" class="grammar-tense-option grammar-voice-option" data-grammar-voice="${item.id}" onclick="toggleGrammarVoiceOption('${item.id}')">${item.label}</button>
        `).join('');
        voiceGrid.dataset.rendered = 'true';
    }
}

function getSelectedGrammarTenseQuestionCount() {
    const selectedTenses = grammarTenseSelectionState.selectedTenses;
    const selectedVoices = grammarTenseSelectionState.selectedVoices;
    const regularCount = getGrammarTenseBank().filter(question =>
        selectedTenses.has(question.tense) && selectedVoices.has(question.voice)
    ).length;
    const mixedCount = getGrammarMixedTenseBank().filter(question =>
        grammarMixedQuestionMatchesSelection(question, selectedTenses, selectedVoices)
    ).length;
    return regularCount + mixedCount;
}

function updateGrammarTenseSetupUI() {
    loadGrammarTenseSelectionState();
    document.querySelectorAll('[data-grammar-tense]').forEach((button) => {
        const tenseId = button.getAttribute('data-grammar-tense');
        const selected = grammarTenseSelectionState.selectedTenses.has(tenseId);
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });

    document.querySelectorAll('[data-grammar-voice]').forEach((button) => {
        const voiceId = button.getAttribute('data-grammar-voice');
        const selected = grammarTenseSelectionState.selectedVoices.has(voiceId);
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });

    const selectedCount = getSelectedGrammarTenseQuestionCount();
    const selectedMixedCount = getGrammarMixedTenseBank().filter(question =>
        grammarMixedQuestionMatchesSelection(question, grammarTenseSelectionState.selectedTenses, grammarTenseSelectionState.selectedVoices)
    ).length;
    const selectedTenseCount = grammarTenseSelectionState.selectedTenses.size;
    const selectedVoiceCount = grammarTenseSelectionState.selectedVoices.size;
    const summary = document.getElementById('grammar-tense-selection-summary');
    const confirmBtn = document.getElementById('grammar-tense-confirm-btn');
    const isReady = selectedTenseCount > 0 && selectedVoiceCount > 0 && selectedCount > 0;

    if (summary) {
        summary.innerText = isReady
            ? `已選 ${selectedCount} 題 // ${selectedTenseCount} 個時態 // ${selectedVoiceCount} 種語態${selectedMixedCount ? ` // MIXED ${selectedMixedCount}` : ''}`
            : '請選擇至少一個時態及主動/被動';
    }
    if (confirmBtn) confirmBtn.disabled = !isReady;
}

function openGrammarTenseSetupScreen(options = {}) {
    if (!options.silent && typeof playSound === 'function') playSound('deploy-sfx');
    loadGrammarTenseSelectionState();
    renderGrammarTenseSetupOptions();
    setGrammarTopicReferenceMode(false);

    const title = document.getElementById('grammar-topic-title');
    const subtitle = document.getElementById('grammar-topic-subtitle');
    const grid = document.getElementById('grammar-topic-grid');
    const tenseSetup = document.getElementById('grammar-tense-setup');
    const conditionalSetup = document.getElementById('grammar-conditional-setup');
    const reportedSpeechSetup = document.getElementById('grammar-reported-speech-setup');
    const panel = document.querySelector('.grammar-topic-panel');

    grammarTopicScreenMode = 'tense';
    if (title) title.innerText = 'TENSES';
    if (subtitle) {
        subtitle.innerText = 'SELECT TRAINING SIGNALS';
        subtitle.style.display = 'block';
    }
    if (grid) grid.style.display = 'none';
    if (tenseSetup) tenseSetup.style.display = 'flex';
    if (conditionalSetup) conditionalSetup.style.display = 'none';
    if (reportedSpeechSetup) reportedSpeechSetup.style.display = 'none';
    if (panel) panel.classList.add('is-tense-open');
    updateGrammarTenseSetupUI();
}

function toggleGrammarTenseOption(tenseId) {
    loadGrammarTenseSelectionState();
    if (typeof playSound === 'function') playSound('enter-sfx');
    if (grammarTenseSelectionState.selectedTenses.has(tenseId)) {
        grammarTenseSelectionState.selectedTenses.delete(tenseId);
    } else {
        grammarTenseSelectionState.selectedTenses.add(tenseId);
    }
    saveGrammarTenseSelectionState();
    updateGrammarTenseSetupUI();
}

function toggleGrammarVoiceOption(voiceId) {
    loadGrammarTenseSelectionState();
    if (typeof playSound === 'function') playSound('enter-sfx');
    if (grammarTenseSelectionState.selectedVoices.has(voiceId)) {
        grammarTenseSelectionState.selectedVoices.delete(voiceId);
    } else {
        grammarTenseSelectionState.selectedVoices.add(voiceId);
    }
    saveGrammarTenseSelectionState();
    updateGrammarTenseSetupUI();
}

function selectAllGrammarTenses() {
    loadGrammarTenseSelectionState();
    if (typeof playSound === 'function') playSound('enter-sfx');
    grammarTenseSelectionState.selectedTenses = new Set(GRAMMAR_TENSE_DEFINITIONS.map(item => item.id));
    saveGrammarTenseSelectionState();
    updateGrammarTenseSetupUI();
}

function clearGrammarTenses() {
    loadGrammarTenseSelectionState();
    if (typeof playSound === 'function') playSound('delete-sfx');
    grammarTenseSelectionState.selectedTenses.clear();
    saveGrammarTenseSelectionState();
    updateGrammarTenseSetupUI();
}

function confirmGrammarTenseSetup() {
    loadGrammarTenseSelectionState();
    const deck = buildGrammarTenseBattleDeck();
    if (!deck.length) {
        if (typeof playSound === 'function') playSound('wrong-sfx');
        if (typeof showNotification === 'function') {
            showNotification('NO TENSE SIGNALS SELECTED', 'warning', 2500);
        }
        return;
    }

    saveGrammarTenseSelectionState();
    if (typeof playSound === 'function') playSound('deploy-sfx');
    const topicScreen = document.getElementById('grammar-topic-screen');
    if (topicScreen) topicScreen.style.display = 'none';

    window.selectedGrammarTopic = GRAMMAR_TENSE_TOPIC;
    currentPracticeMode = 'GRAMMAR';
    selectedLevel = GRAMMAR_TENSE_TOPIC;
    selectedStageIndex = null;
    selectedStageLabel = 'TENSES';
    activeVocabList = deck;
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

function renderGrammarConditionalSetupOptions() {
    const typeGrid = document.getElementById('grammar-conditional-option-grid');
    if (typeGrid && !typeGrid.dataset.rendered) {
        typeGrid.innerHTML = GRAMMAR_CONDITIONAL_DEFINITIONS.map((item) => `
            <button type="button" class="grammar-tense-option grammar-conditional-option" data-grammar-conditional-type="${item.id}" onclick="toggleGrammarConditionalOption('${item.id}')">${item.label}</button>
        `).join('');
        typeGrid.dataset.rendered = 'true';
    }
}

function getSelectedGrammarConditionalQuestionCount() {
    const selectedTypes = grammarConditionalSelectionState.selectedTypes;
    return getGrammarConditionalQuestionBank().filter(question =>
        selectedTypes.has(String(question.type ?? question.rule ?? ''))
    ).length;
}

function updateGrammarConditionalSetupUI() {
    loadGrammarConditionalSelectionState();
    document.querySelectorAll('[data-grammar-conditional-type]').forEach((button) => {
        const typeId = button.getAttribute('data-grammar-conditional-type');
        const selected = grammarConditionalSelectionState.selectedTypes.has(typeId);
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });

    const selectedCount = getSelectedGrammarConditionalQuestionCount();
    const selectedTypeCount = grammarConditionalSelectionState.selectedTypes.size;
    const summary = document.getElementById('grammar-conditional-selection-summary');
    const confirmBtn = document.getElementById('grammar-conditional-confirm-btn');
    const isReady = selectedTypeCount > 0 && selectedCount > 0;

    if (summary) {
        const labels = Array.from(grammarConditionalSelectionState.selectedTypes)
            .sort()
            .map(getGrammarConditionalTypeLabel)
            .join(' / ');
        summary.innerText = isReady
            ? `已選 ${selectedCount} 題 // ${labels}`
            : '請選擇至少一種 Conditional Type';
    }
    if (confirmBtn) confirmBtn.disabled = !isReady;
}

function openGrammarConditionalSetupScreen(options = {}) {
    if (!options.silent && typeof playSound === 'function') playSound('deploy-sfx');
    loadGrammarConditionalSelectionState();
    renderGrammarConditionalSetupOptions();
    setGrammarTopicReferenceMode(false);

    const title = document.getElementById('grammar-topic-title');
    const subtitle = document.getElementById('grammar-topic-subtitle');
    const grid = document.getElementById('grammar-topic-grid');
    const tenseSetup = document.getElementById('grammar-tense-setup');
    const conditionalSetup = document.getElementById('grammar-conditional-setup');
    const reportedSpeechSetup = document.getElementById('grammar-reported-speech-setup');
    const panel = document.querySelector('.grammar-topic-panel');

    grammarTopicScreenMode = 'conditional';
    if (title) title.innerText = 'CONDITIONAL';
    if (subtitle) {
        subtitle.innerText = 'SELECT CONDITIONAL TYPES';
        subtitle.style.display = 'block';
    }
    if (grid) grid.style.display = 'none';
    if (tenseSetup) tenseSetup.style.display = 'none';
    if (conditionalSetup) conditionalSetup.style.display = 'flex';
    if (reportedSpeechSetup) reportedSpeechSetup.style.display = 'none';
    if (panel) panel.classList.add('is-tense-open');
    updateGrammarConditionalSetupUI();
}

function toggleGrammarConditionalOption(typeId) {
    loadGrammarConditionalSelectionState();
    if (typeof playSound === 'function') playSound('enter-sfx');
    const normalizedType = String(typeId);
    if (grammarConditionalSelectionState.selectedTypes.has(normalizedType)) {
        grammarConditionalSelectionState.selectedTypes.delete(normalizedType);
    } else {
        grammarConditionalSelectionState.selectedTypes.add(normalizedType);
    }
    saveGrammarConditionalSelectionState();
    updateGrammarConditionalSetupUI();
}

function selectAllGrammarConditionals() {
    loadGrammarConditionalSelectionState();
    if (typeof playSound === 'function') playSound('enter-sfx');
    grammarConditionalSelectionState.selectedTypes = new Set(GRAMMAR_CONDITIONAL_DEFINITIONS.map(item => item.id));
    saveGrammarConditionalSelectionState();
    updateGrammarConditionalSetupUI();
}

function clearGrammarConditionals() {
    loadGrammarConditionalSelectionState();
    if (typeof playSound === 'function') playSound('delete-sfx');
    grammarConditionalSelectionState.selectedTypes.clear();
    saveGrammarConditionalSelectionState();
    updateGrammarConditionalSetupUI();
}

function confirmGrammarConditionalSetup() {
    loadGrammarConditionalSelectionState();
    const deck = buildGrammarConditionalBattleDeck();
    if (!deck.length) {
        if (typeof playSound === 'function') playSound('wrong-sfx');
        if (typeof showNotification === 'function') {
            showNotification('NO CONDITIONAL TYPES SELECTED', 'warning', 2500);
        }
        return;
    }

    saveGrammarConditionalSelectionState();
    if (typeof playSound === 'function') playSound('deploy-sfx');
    const topicScreen = document.getElementById('grammar-topic-screen');
    if (topicScreen) topicScreen.style.display = 'none';

    window.selectedGrammarTopic = GRAMMAR_CONDITIONAL_TOPIC;
    currentPracticeMode = 'GRAMMAR';
    selectedLevel = GRAMMAR_CONDITIONAL_TOPIC;
    selectedStageIndex = null;
    selectedStageLabel = 'CONDITIONAL';
    activeVocabList = deck;
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

function renderGrammarReportedSpeechSetupOptions() {
    const typeGrid = document.getElementById('grammar-reported-speech-option-grid');
    if (typeGrid && !typeGrid.dataset.rendered) {
        typeGrid.innerHTML = GRAMMAR_REPORTED_SPEECH_DEFINITIONS.map((item) => `
            <button type="button" class="grammar-tense-option grammar-reported-speech-option" data-grammar-reported-speech-type="${item.id}" onclick="toggleGrammarReportedSpeechOption('${item.id}')">${item.label}</button>
        `).join('');
        typeGrid.dataset.rendered = 'true';
    }
}

function getSelectedGrammarReportedSpeechQuestionCount() {
    const selectedTypes = grammarReportedSpeechSelectionState.selectedTypes;
    return getGrammarReportedSpeechBank().filter(question =>
        selectedTypes.has(String(question.type ?? question.rule ?? ''))
    ).length;
}

function updateGrammarReportedSpeechSetupUI() {
    loadGrammarReportedSpeechSelectionState();
    document.querySelectorAll('[data-grammar-reported-speech-type]').forEach((button) => {
        const typeId = button.getAttribute('data-grammar-reported-speech-type');
        const selected = grammarReportedSpeechSelectionState.selectedTypes.has(typeId);
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });

    const selectedCount = getSelectedGrammarReportedSpeechQuestionCount();
    const selectedTypeCount = grammarReportedSpeechSelectionState.selectedTypes.size;
    const summary = document.getElementById('grammar-reported-speech-selection-summary');
    const confirmBtn = document.getElementById('grammar-reported-speech-confirm-btn');
    const isReady = selectedTypeCount > 0 && selectedCount > 0;

    if (summary) {
        const labels = Array.from(grammarReportedSpeechSelectionState.selectedTypes)
            .sort()
            .map(getGrammarReportedSpeechTypeLabel)
            .join(' / ');
        summary.innerText = isReady
            ? `已選 ${selectedCount} 題 // ${labels}`
            : '請選擇至少一種 Reported Speech 類型';
    }
    if (confirmBtn) confirmBtn.disabled = !isReady;
}

function openGrammarReportedSpeechSetupScreen(options = {}) {
    if (!options.silent && typeof playSound === 'function') playSound('deploy-sfx');
    loadGrammarReportedSpeechSelectionState();
    renderGrammarReportedSpeechSetupOptions();
    setGrammarTopicReferenceMode(false);

    const title = document.getElementById('grammar-topic-title');
    const subtitle = document.getElementById('grammar-topic-subtitle');
    const grid = document.getElementById('grammar-topic-grid');
    const tenseSetup = document.getElementById('grammar-tense-setup');
    const conditionalSetup = document.getElementById('grammar-conditional-setup');
    const reportedSpeechSetup = document.getElementById('grammar-reported-speech-setup');
    const panel = document.querySelector('.grammar-topic-panel');

    grammarTopicScreenMode = 'reported';
    if (title) title.innerText = 'REPORTED SPEECH';
    if (subtitle) {
        subtitle.innerText = 'SELECT REPORTING CHANNELS';
        subtitle.style.display = 'block';
    }
    if (grid) grid.style.display = 'none';
    if (tenseSetup) tenseSetup.style.display = 'none';
    if (conditionalSetup) conditionalSetup.style.display = 'none';
    if (reportedSpeechSetup) reportedSpeechSetup.style.display = 'flex';
    if (panel) panel.classList.add('is-tense-open');
    updateGrammarReportedSpeechSetupUI();
}

function toggleGrammarReportedSpeechOption(typeId) {
    loadGrammarReportedSpeechSelectionState();
    if (typeof playSound === 'function') playSound('enter-sfx');
    const normalizedType = String(typeId);
    if (grammarReportedSpeechSelectionState.selectedTypes.has(normalizedType)) {
        grammarReportedSpeechSelectionState.selectedTypes.delete(normalizedType);
    } else {
        grammarReportedSpeechSelectionState.selectedTypes.add(normalizedType);
    }
    saveGrammarReportedSpeechSelectionState();
    updateGrammarReportedSpeechSetupUI();
}

function selectAllGrammarReportedSpeechTypes() {
    loadGrammarReportedSpeechSelectionState();
    if (typeof playSound === 'function') playSound('enter-sfx');
    grammarReportedSpeechSelectionState.selectedTypes = new Set(GRAMMAR_REPORTED_SPEECH_DEFINITIONS.map(item => item.id));
    saveGrammarReportedSpeechSelectionState();
    updateGrammarReportedSpeechSetupUI();
}

function clearGrammarReportedSpeechTypes() {
    loadGrammarReportedSpeechSelectionState();
    if (typeof playSound === 'function') playSound('delete-sfx');
    grammarReportedSpeechSelectionState.selectedTypes.clear();
    saveGrammarReportedSpeechSelectionState();
    updateGrammarReportedSpeechSetupUI();
}

function confirmGrammarReportedSpeechSetup() {
    loadGrammarReportedSpeechSelectionState();
    const deck = buildGrammarReportedSpeechBattleDeck();
    if (!deck.length) {
        if (typeof playSound === 'function') playSound('wrong-sfx');
        if (typeof showNotification === 'function') {
            showNotification('NO REPORTED SPEECH TYPES SELECTED', 'warning', 2500);
        }
        return;
    }

    saveGrammarReportedSpeechSelectionState();
    if (typeof playSound === 'function') playSound('deploy-sfx');
    const topicScreen = document.getElementById('grammar-topic-screen');
    if (topicScreen) topicScreen.style.display = 'none';

    window.selectedGrammarTopic = GRAMMAR_REPORTED_SPEECH_TOPIC;
    currentPracticeMode = 'GRAMMAR';
    selectedLevel = GRAMMAR_REPORTED_SPEECH_TOPIC;
    selectedStageIndex = null;
    selectedStageLabel = 'REPORTED SPEECH';
    activeVocabList = deck;
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

function getGrammarVerbSlotInput(slot) {
    if (!slot) return null;
    if (slot.subIndex !== null) {
        return document.querySelector(`.grammar-verb-subslot-input[data-grammar-slot-key="${slot.slotKey}"]`);
    }
    return getGrammarVerbFieldInput(slot.fieldKey);
}

function getLaunchGrammarSlotInput(slot) {
    if (!slot) return null;
    if (slot.subIndex !== null) {
        return document.querySelector(`.launch-grammar-subslot-input[data-grammar-slot-key="${slot.slotKey}"]`);
    }
    return getLaunchGrammarInput(slot.fieldKey);
}

function applyGrammarInputMode(input) {
    if (!input) return;
    if (grammarUsesGameKeyboard()) {
        input.setAttribute('readonly', 'readonly');
        input.classList.add('grammar-readonly');
    } else {
        input.removeAttribute('readonly');
        input.classList.remove('grammar-readonly');
    }
}

function clearGrammarSlotInputState(input) {
    if (!input) return;
    input.disabled = false;
    input.classList.remove('is-active', 'is-correct', 'is-wrong');
    applyGrammarInputMode(input);
}

function renderGrammarVerbSlotLayout(question) {
    const slots = getGrammarVerbAnswerSlots(question);
    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey) => {
        const container = getGrammarVerbFieldContainer(fieldKey);
        const input = getGrammarVerbFieldInput(fieldKey);
        if (!container || !input) return;

        container.querySelectorAll('.grammar-verb-subslot-row').forEach((row) => row.remove());
        const fieldSubSlots = slots.filter((slot) => slot.fieldKey === fieldKey && slot.subIndex !== null);
        container.classList.toggle('has-subslots', fieldSubSlots.length > 0);
        input.style.display = fieldSubSlots.length ? 'none' : '';
        if (!fieldSubSlots.length) return;

        const row = document.createElement('div');
        row.className = 'grammar-verb-subslot-row';
        row.style.setProperty('--grammar-subslot-count', String(fieldSubSlots.length));
        fieldSubSlots.forEach((slot) => {
            const subInput = document.createElement('input');
            subInput.className = 'grammar-verb-input grammar-verb-subslot-input';
            subInput.autocomplete = 'off';
            subInput.spellcheck = false;
            subInput.placeholder = String(slot.subIndex + 1);
            subInput.setAttribute('data-grammar-field', fieldKey);
            subInput.setAttribute('data-grammar-slot-key', slot.slotKey);
            subInput.setAttribute('data-grammar-slot-index', String(slot.index));
            subInput.setAttribute('aria-label', slot.label);
            attachGrammarVerbSlotInputBehavior(subInput);
            row.appendChild(subInput);
        });
        input.insertAdjacentElement('afterend', row);
    });
}

function renderLaunchGrammarSlotLayout(question) {
    const slots = getGrammarVerbAnswerSlots(question);
    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey) => {
        const field = getLaunchGrammarField(fieldKey);
        const input = getLaunchGrammarInput(fieldKey);
        if (!field || !input) return;

        field.querySelectorAll('.launch-grammar-subslot-row').forEach((row) => row.remove());
        const fieldSubSlots = slots.filter((slot) => slot.fieldKey === fieldKey && slot.subIndex !== null);
        field.classList.toggle('has-subslots', fieldSubSlots.length > 0);
        input.style.display = fieldSubSlots.length ? 'none' : '';
        if (!fieldSubSlots.length) return;

        const row = document.createElement('div');
        row.className = 'launch-grammar-subslot-row';
        row.style.setProperty('--grammar-subslot-count', String(fieldSubSlots.length));
        fieldSubSlots.forEach((slot) => {
            const subInput = document.createElement('input');
            subInput.className = 'launch-grammar-input launch-grammar-subslot-input';
            subInput.autocomplete = 'off';
            subInput.spellcheck = false;
            subInput.placeholder = String(slot.subIndex + 1);
            subInput.setAttribute('data-grammar-field', fieldKey);
            subInput.setAttribute('data-grammar-slot-key', slot.slotKey);
            subInput.setAttribute('data-grammar-slot-index', String(slot.index));
            subInput.setAttribute('aria-label', slot.label);
            attachLaunchGrammarSlotInputBehavior(subInput);
            row.appendChild(subInput);
        });
        input.insertAdjacentElement('afterend', row);
    });
}

function setLaunchGrammarActiveField(index) {
    const slots = getGrammarVerbAnswerSlots(currentVocab);
    const safeIndex = Math.max(0, Math.min(slots.length - 1, index));
    const activeSlot = slots[safeIndex] || null;
    grammarLaunchState.activeFieldIndex = safeIndex;

    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey) => {
        const field = getLaunchGrammarField(fieldKey);
        const input = getLaunchGrammarInput(fieldKey);
        if (field) {
            field.classList.toggle('is-active', activeSlot?.fieldKey === fieldKey);
            field.querySelectorAll('.launch-grammar-subslot-input').forEach((subInput) => {
                subInput.classList.toggle('is-active', subInput.getAttribute('data-grammar-slot-key') === activeSlot?.slotKey);
            });
        }
        if (input) input.classList.toggle('is-active', activeSlot?.fieldKey === fieldKey && activeSlot?.subIndex === null);
    });

    const activeInput = getLaunchGrammarSlotInput(activeSlot);
    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey) => {
        const input = getLaunchGrammarInput(fieldKey);
        if (!input) return;
        if (grammarUsesGameKeyboard()) {
            input.blur();
        }
    });
    document.querySelectorAll('.launch-grammar-subslot-input').forEach((input) => {
        if (grammarUsesGameKeyboard()) input.blur();
    });
    if (!grammarUsesGameKeyboard() && activeInput && document.getElementById('launch-modal')?.style.display === 'flex') {
        activeInput.focus();
        const endPosition = activeInput.value.length;
        activeInput.setSelectionRange(endPosition, endPosition);
    }
}

function moveLaunchGrammarField(direction) {
    const slotCount = getGrammarVerbSlotCount(currentVocab);
    const nextIndex = (grammarLaunchState.activeFieldIndex + direction + slotCount) % slotCount;
    setLaunchGrammarActiveField(nextIndex);
}

function getLaunchGrammarPresentClue(question = currentVocab) {
    return getGrammarFormAnswer(question, 'present').charAt(0).toUpperCase();
}

function getLaunchGrammarSlotInitialValue(slot, question = currentVocab) {
    if (!slot || slot.fieldKey !== 'present') return '';
    const isFirstPresentSlot = slot.subIndex === null || slot.subIndex === 0;
    return isFirstPresentSlot ? String(slot.answer || getGrammarFormAnswer(question, 'present')).charAt(0).toUpperCase() : '';
}

function resetLaunchGrammarVerbInputs(question = currentVocab) {
    const allInputs = new Set([
        ...GRAMMAR_VERB_FIELD_ORDER.map((fieldKey) => getLaunchGrammarInput(fieldKey)).filter(Boolean),
        ...document.querySelectorAll('.launch-grammar-subslot-input')
    ]);

    allInputs.forEach((input) => {
        input.value = '';
        clearGrammarSlotInputState(input);
    });

    getGrammarVerbAnswerSlots(question).forEach((slot) => {
        const input = getLaunchGrammarSlotInput(slot);
        if (!input) return;
        input.value = getLaunchGrammarSlotInitialValue(slot, question);
        clearGrammarSlotInputState(input);
    });
}

function escapeGrammarHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getGrammarTenseAnswerWords(question) {
    return getGrammarTensePrimaryAnswer(question)
        .split(/\s+/)
        .map(word => word.trim())
        .filter(Boolean);
}

function getGrammarTenseAnswerSlots(question) {
    const explicitSlots = question?.grammarTense?.answerSlots || question?.answerSlots;
    if (Array.isArray(explicitSlots) && explicitSlots.length) {
        return explicitSlots.map(slot => String(slot || '').trim());
    }
    const questionText = question?.grammarTense?.question || question?.question || '';
    return splitGrammarTenseWordsForBlanks(getGrammarTenseAnswerWords(question), getGrammarTenseBlankCount(questionText));
}

function getGrammarTenseBlankCount(questionText) {
    return Math.max(1, (String(questionText || '').match(/______/g) || []).length);
}

function splitGrammarTenseWordsForBlanks(words, blankCount) {
    const safeBlankCount = Math.max(1, blankCount || 1);
    const cleanWords = (words || []).map(word => String(word || '').trim()).filter(Boolean);
    if (safeBlankCount <= 1) return [cleanWords.join(' ')];

    const slots = [];
    for (let index = 0; index < safeBlankCount; index += 1) {
        if (index === safeBlankCount - 1) {
            slots.push(cleanWords.slice(index).join(' '));
        } else {
            slots.push(cleanWords[index] || '');
        }
    }
    return slots;
}

function renderGrammarTenseSentence(questionText, expectedSlots = []) {
    let blankIndex = 0;
    return escapeGrammarHtml(questionText).replace(/______/g, () => {
        const slotText = expectedSlots[blankIndex] || '';
        const width = Math.max(6, Math.min(24, slotText.length + 2));
        const html = `<span class="launch-tense-blank" data-launch-tense-blank="${blankIndex}" style="--tense-blank-ch: ${width}ch;"><span class="launch-tense-typed"></span></span>`;
        blankIndex += 1;
        return html;
    });
}

function configureLaunchTenseKeyboard(isTenseMode) {
    const keyboard = document.getElementById('virtual-keyboard');
    if (!keyboard) return;

    const prevKey = keyboard.querySelector('.kb-nav-prev');
    const nextKey = keyboard.querySelector('.kb-nav-next');
    const spaceKey = keyboard.querySelector('.kb-tense-space-key');
    keyboard.classList.toggle('kb-tense-space', Boolean(isTenseMode));

    if (prevKey) {
        prevKey.setAttribute('data-key', 'PREV_FIELD');
        prevKey.textContent = '←';
        prevKey.setAttribute('aria-label', 'Previous blank');
        prevKey.classList.remove('kb-space');
    }

    if (nextKey) {
        nextKey.setAttribute('data-key', 'NEXT_FIELD');
        nextKey.textContent = '→';
        nextKey.setAttribute('aria-label', 'Next blank');
        nextKey.classList.remove('kb-space');
    }

    if (spaceKey) {
        spaceKey.setAttribute('data-key', 'SPACE');
        spaceKey.textContent = 'SPACE';
        spaceKey.setAttribute('aria-label', 'Space');
    }
}

function prepareLaunchGrammarQuestion(question) {
    if (isGrammarChoiceTopic(question?.grammarTopic)) {
        prepareLaunchGrammarChoiceQuestion(question);
        return;
    }
    if (isGrammarQuestionRearrangeTopic(question?.grammarTopic)) {
        prepareLaunchGrammarDirectQuestion(question);
        return;
    }
    if (question?.grammarTense || isGrammarFillInTopic(question?.grammarTopic)) {
        prepareLaunchGrammarTenseQuestion(question);
        return;
    }
    prepareLaunchGrammarVerbQuestion(question);
}

function setLaunchTenseLayoutMode(isTenseMode) {
    const modal = document.getElementById('launch-modal');
    if (modal) modal.classList.toggle('launch-tense-mode', Boolean(isTenseMode));
}

function prepareLaunchGrammarVerbQuestion(question) {
    const panel = document.getElementById('launch-grammar-panel');
    const verbWrap = document.getElementById('launch-grammar-verb-wrap');
    const tenseWrap = document.getElementById('launch-grammar-tense-wrap');
    const directWrap = document.getElementById('launch-grammar-direct-wrap');
    const choiceWrap = document.getElementById('launch-grammar-choice-wrap');
    const modeLabel = document.getElementById('launch-mode-label');
    const qText = document.getElementById('q-text');
    const qDisplay = document.getElementById('q-display');
    const hiddenInput = document.getElementById('hidden-input');
    const reference = document.getElementById('launch-grammar-reference');
    const subhint = document.getElementById('launch-subhint');

    if (!panel || !question?.grammarForms) return;

    setLaunchTenseLayoutMode(false);
    configureLaunchTenseKeyboard(false);
    renderLaunchGrammarSlotLayout(question);
    panel.style.display = 'block';
    if (verbWrap) verbWrap.style.display = 'block';
    if (tenseWrap) tenseWrap.style.display = 'none';
    if (directWrap) directWrap.style.display = 'none';
    if (choiceWrap) choiceWrap.style.display = 'none';
    if (qText) qText.classList.remove('launch-tense-prompt');
    if (qDisplay) qDisplay.style.display = 'none';
    if (modeLabel) modeLabel.style.display = '';
    if (hiddenInput) {
        hiddenInput.value = '';
        hiddenInput.style.display = 'none';
    }
    if (reference) reference.style.display = 'none';
    if (subhint) {
        subhint.style.display = '';
        subhint.innerText = 'FILL ALL FOUR FORMS // FIRE TO CONFIRM';
    }

    resetLaunchGrammarHints();
    resetLaunchGrammarVerbInputs(question);

    setLaunchGrammarActiveField(0);
}

function prepareLaunchGrammarTenseQuestion(question) {
    const panel = document.getElementById('launch-grammar-panel');
    const verbWrap = document.getElementById('launch-grammar-verb-wrap');
    const tenseWrap = document.getElementById('launch-grammar-tense-wrap');
    const directWrap = document.getElementById('launch-grammar-direct-wrap');
    const choiceWrap = document.getElementById('launch-grammar-choice-wrap');
    const modeLabel = document.getElementById('launch-mode-label');
    const qText = document.getElementById('q-text');
    const qDisplay = document.getElementById('q-display');
    const hiddenInput = document.getElementById('hidden-input');
    const reference = document.getElementById('launch-grammar-reference');
    const subhint = document.getElementById('launch-subhint');
    const meta = document.getElementById('launch-tense-meta');
    const sentence = document.getElementById('launch-tense-sentence');
    const answerGrid = document.getElementById('launch-tense-answer-grid');
    const feedback = document.getElementById('launch-tense-feedback');

    if (!panel || !question?.grammarTense) return;

    const tenseQuestion = question.grammarTense;
    grammarLaunchState.tenseAnswerText = '';
    grammarLaunchState.tenseBlankCount = getGrammarTenseBlankCount(tenseQuestion.question);
    grammarLaunchState.tenseAnswerWords = getGrammarTenseAnswerSlots(question);
    grammarLaunchState.tenseSlotTexts = Array.from({ length: grammarLaunchState.tenseBlankCount }, () => '');
    grammarLaunchState.activeFieldIndex = 0;

    configureLaunchTenseKeyboard(true);
    setLaunchTenseLayoutMode(true);
    panel.style.display = 'block';
    if (verbWrap) verbWrap.style.display = 'none';
    if (tenseWrap) tenseWrap.style.display = 'flex';
    if (directWrap) directWrap.style.display = 'none';
    if (choiceWrap) choiceWrap.style.display = 'none';
    if (qText) qText.classList.add('launch-tense-prompt');
    if (modeLabel) modeLabel.style.display = 'none';
    if (qDisplay) qDisplay.style.display = 'none';
    if (hiddenInput) {
        hiddenInput.value = '';
        hiddenInput.style.display = 'none';
    }
    if (reference) reference.style.display = 'none';
    if (subhint) {
        subhint.innerText = '';
        subhint.style.display = 'none';
    }
    if (meta) {
        meta.innerText = '';
        meta.style.display = 'none';
    }
    if (sentence) {
        sentence.innerHTML = renderGrammarTenseSentence(tenseQuestion.question, grammarLaunchState.tenseAnswerWords);
    }
    if (feedback) feedback.innerText = '';
    if (answerGrid) {
        answerGrid.innerHTML = '<input id="launch-tense-answer-input" class="launch-tense-input launch-tense-hidden-input" autocomplete="off" autocapitalize="none" spellcheck="false">';
        attachLaunchTenseInputBehaviors();
    }

    updateLaunchTenseInlineAnswer();
    setLaunchTenseActiveField(0);
}

function renderGrammarChoiceSentence(questionText) {
    return escapeGrammarHtml(questionText).replace(/______/g, '<span class="launch-choice-blank">______</span>');
}

function resetLaunchGrammarChoiceQuestion() {
    grammarLaunchState.choiceSelectedIndex = null;
    grammarLaunchState.choiceSelectedText = '';
    grammarLaunchState.choiceSubmitting = false;
    grammarLaunchState.choiceResolved = false;
    const optionGrid = document.getElementById('launch-choice-options');
    const feedback = document.getElementById('launch-choice-feedback');
    const fireBtn = document.getElementById('launch-choice-fire-btn');
    if (optionGrid) optionGrid.innerHTML = '';
    if (feedback) feedback.innerText = '';
    if (fireBtn) {
        fireBtn.disabled = true;
        fireBtn.style.display = 'none';
    }
}

function syncLaunchChoiceOptionStates(isResolved = false) {
    const question = currentVocab?.grammarChoice;
    const selectedIndex = grammarLaunchState.choiceSelectedIndex;
    const isSubmitting = grammarLaunchState.choiceSubmitting;
    document.querySelectorAll('.launch-choice-option').forEach((button) => {
        const optionIndex = Number(button.getAttribute('data-choice-index'));
        const isSelected = optionIndex === selectedIndex;
        const isCorrect = question && optionIndex === question.correctIndex;
        button.classList.toggle('is-selected', isSelected && !isResolved);
        button.classList.toggle('is-correct', Boolean(isResolved && isCorrect));
        button.classList.toggle('is-wrong', Boolean(isResolved && isSelected && !isCorrect));
        button.classList.toggle('is-locked', Boolean(isResolved || isSubmitting));
        button.disabled = Boolean(isResolved || isSubmitting);
    });
}

function selectLaunchGrammarChoice(optionIndex, optionText) {
    if (grammarLaunchState.choiceResolved || grammarLaunchState.choiceSubmitting) return;
    grammarLaunchState.choiceSelectedIndex = optionIndex;
    grammarLaunchState.choiceSelectedText = optionText;
    grammarLaunchState.choiceSubmitting = true;
    const feedback = document.getElementById('launch-choice-feedback');
    if (feedback) feedback.innerText = 'ANALYSING OPTION...';
    syncLaunchChoiceOptionStates(false);
    setTimeout(() => {
        if (typeof checkAnswer === 'function') checkAnswer();
    }, 70);
}

function createLaunchChoiceOption(optionText, optionIndex, displayIndex = 0) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'launch-choice-option';
    const text = document.createElement('span');
    text.className = 'launch-choice-option-text';
    text.textContent = optionText;
    button.appendChild(text);
    button.setAttribute('aria-label', optionText);
    button.setAttribute('data-choice-index', String(optionIndex));
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        if (button.disabled || button.classList.contains('is-locked')) return;
        selectLaunchGrammarChoice(optionIndex, optionText);
    });
    return button;
}

function prepareLaunchGrammarChoiceQuestion(question) {
    const panel = document.getElementById('launch-grammar-panel');
    const verbWrap = document.getElementById('launch-grammar-verb-wrap');
    const tenseWrap = document.getElementById('launch-grammar-tense-wrap');
    const directWrap = document.getElementById('launch-grammar-direct-wrap');
    const choiceWrap = document.getElementById('launch-grammar-choice-wrap');
    const modeLabel = document.getElementById('launch-mode-label');
    const qText = document.getElementById('q-text');
    const qDisplay = document.getElementById('q-display');
    const hiddenInput = document.getElementById('hidden-input');
    const reference = document.getElementById('launch-grammar-reference');
    const subhint = document.getElementById('launch-subhint');
    const command = document.getElementById('launch-choice-command');
    const sentence = document.getElementById('launch-choice-sentence');
    const optionGrid = document.getElementById('launch-choice-options');
    const feedback = document.getElementById('launch-choice-feedback');

    if (!panel || !question?.grammarChoice) return;

    const choiceQuestion = question.grammarChoice;
    resetLaunchGrammarChoiceQuestion();
    configureLaunchTenseKeyboard(false);
    setLaunchTenseLayoutMode(false);
    panel.style.display = 'block';
    if (verbWrap) verbWrap.style.display = 'none';
    if (tenseWrap) tenseWrap.style.display = 'none';
    if (directWrap) directWrap.style.display = 'none';
    if (choiceWrap) choiceWrap.style.display = 'flex';
    if (qText) qText.classList.remove('launch-tense-prompt');
    if (modeLabel) {
        modeLabel.innerText = 'SELECT PREPOSITION';
        modeLabel.style.display = '';
    }
    if (qDisplay) qDisplay.style.display = 'none';
    if (hiddenInput) {
        hiddenInput.value = '';
        hiddenInput.style.display = 'none';
    }
    if (reference) reference.style.display = 'none';
    if (subhint) {
        subhint.style.display = '';
        subhint.innerText = 'SELECT ONE SIGNAL // AUTO FIRE';
    }
    if (command) command.innerText = '5 OPTION SIGNALS';
    if (sentence) sentence.innerHTML = renderGrammarChoiceSentence(choiceQuestion.question);
    if (feedback) feedback.innerText = '';
    if (optionGrid) {
        const optionItems = choiceQuestion.options.map((text, index) => ({ text, index }));
        shuffleGrammarArray(optionItems).forEach(({ text, index }, displayIndex) => {
            optionGrid.appendChild(createLaunchChoiceOption(text, index, displayIndex));
        });
    }
    const fireBtn = document.getElementById('launch-choice-fire-btn');
    if (fireBtn) {
        fireBtn.disabled = true;
        fireBtn.style.display = 'none';
    }
}

function formatGrammarDirectTokens(tokens) {
    return (tokens || [])
        .map(token => String(token || '').trim())
        .filter(Boolean)
        .join(' ')
        .replace(/\s+([?.!,;:])/g, '$1');
}

function normalizeGrammarDirectAnswer(value) {
    return String(value || '')
        .trim()
        .replace(/[’]/g, "'")
        .replace(/\s+([?.!,;:])/g, '$1')
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

function getGrammarTokenKey(value) {
    return String(value || '').trim().toLowerCase();
}

function hasGrammarTokenUppercase(value) {
    return /[A-Z]/.test(String(value || ''));
}

function getGrammarIntrinsicCapitalTokenSet() {
    if (grammarIntrinsicCapitalTokenCache) return grammarIntrinsicCapitalTokenCache;

    const intrinsicKeys = new Set([
        'i',
        'a.i.',
        'ai',
        'china',
        'hong',
        'kong',
        'taiwan',
        'japan',
        'korea',
        'russia',
        'english',
        'chinese',
        'tom',
        'peter',
        'mary',
        'john',
        'amy',
        'david',
        'sally',
        'ben',
        'tiktok',
        'youtube',
        'whatsapp',
        'facebook',
        'instagram',
        'ipad',
        'iphone'
    ]);

    [
        window.GRAMMAR_DIRECT_QUESTION_BANK,
        window.GRAMMAR_INDIRECT_QUESTION_BANK,
        window.GRAMMAR_IT_IS_BANK,
        window.GRAMMAR_CONDITIONAL_BANK,
        window.GRAMMAR_REPORTED_SPEECH_BANK
    ].forEach((bank) => {
        (Array.isArray(bank) ? bank : []).forEach((question) => {
            (Array.isArray(question.correct_tokens) ? question.correct_tokens : []).forEach((tokens) => {
                (Array.isArray(tokens) ? tokens : []).forEach((token, index) => {
                    const lettersOnly = String(token || '').replace(/[^A-Za-z]/g, '');
                    const isAcronym = lettersOnly.length > 1 && lettersOnly === lettersOnly.toUpperCase();
                    if (index > 0 && hasGrammarTokenUppercase(token) && !isAcronym) {
                        intrinsicKeys.add(getGrammarTokenKey(token));
                    }
                });
            });
        });
    });

    grammarIntrinsicCapitalTokenCache = intrinsicKeys;
    return intrinsicKeys;
}

function isGrammarIntrinsicCapitalToken(rawText) {
    const text = String(rawText || '').trim();
    if (!hasGrammarTokenUppercase(text)) return false;
    if (/^I(['’][A-Za-z]+)?$/.test(text)) return true;
    if (/[a-z][A-Z]/.test(text)) return true;
    if (/[A-Z]\./.test(text)) return true;

    const lettersOnly = text.replace(/[^A-Za-z]/g, '');
    if (lettersOnly.length > 1 && lettersOnly === lettersOnly.toUpperCase()) return true;

    return getGrammarIntrinsicCapitalTokenSet().has(getGrammarTokenKey(text));
}

function getGrammarDirectTokenPoolDisplayText(rawText) {
    const text = String(rawText || '').trim();
    if (!hasGrammarTokenUppercase(text) || isGrammarIntrinsicCapitalToken(text)) return text;
    return text.replace(/[A-Z]/, char => char.toLowerCase());
}

function getGrammarDirectCorrectTexts(question = currentVocab) {
    const answers = question?.grammarDirect?.correctTokens || question?.correct_tokens || [];
    return (Array.isArray(answers) ? answers : [])
        .filter(tokens => Array.isArray(tokens))
        .map(tokens => formatGrammarDirectTokens(tokens));
}

function getGrammarDirectRuleText(question = currentVocab) {
    const ruleId = question?.grammarDirect?.rule || question?.rule;
    const topic = question?.grammarTopic || question?.grammarDirect?.topic;
    const rules = topic === GRAMMAR_INDIRECT_TOPIC
        ? (window.GRAMMAR_INDIRECT_QUESTION_RULES || {})
        : topic === GRAMMAR_IT_IS_TOPIC
        ? (window.GRAMMAR_IT_IS_RULES || {})
        : topic === GRAMMAR_CONDITIONAL_TOPIC
        ? (window.GRAMMAR_CONDITIONAL_RULES || {})
        : topic === GRAMMAR_REPORTED_SPEECH_TOPIC
        ? (window.GRAMMAR_REPORTED_SPEECH_RULES || {})
        : (window.GRAMMAR_DIRECT_QUESTION_RULES || {});
    return rules[ruleId] || '';
}

function getGrammarDirectTokenPool(question) {
    const correctTokens = getGrammarDirectPrimaryTokens(question);
    const distractors = Array.isArray(question?.grammarDirect?.distractors) ? question.grammarDirect.distractors : [];
    return shuffleGrammarArray([...correctTokens, ...distractors].filter(token => token !== undefined && token !== null))
        .map((text, index) => ({
            id: `direct-token-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
            text: String(text)
        }));
}

function getLaunchDirectFlightTheme() {
    const isAurelians = document.getElementById('launch-modal')?.classList.contains('aurelians-theme');
    return isAurelians ? 'aurelians' : 'vanguards';
}

function spawnLaunchDirectLandingBurst(endRect) {
    if (!endRect || !document.body) return;
    const burst = document.createElement('div');
    const theme = getLaunchDirectFlightTheme();
    const size = Math.max(58, Math.min(120, Math.max(endRect.width, endRect.height) * 1.35));
    burst.className = `launch-direct-landing-burst is-${theme}`;
    burst.style.left = `${endRect.left + endRect.width / 2}px`;
    burst.style.top = `${endRect.top + endRect.height / 2}px`;
    burst.style.width = `${size}px`;
    burst.style.height = `${size}px`;
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 520);
}

function setLaunchDirectFireWrongState(isWrong = false) {
    const fireBtn = document.getElementById('launch-direct-fire-btn');
    if (!fireBtn) return;
    fireBtn.classList.toggle('is-wrong', Boolean(isWrong));
}

function spawnLaunchDirectFlightEffect(token, startRect, endRect) {
    if (!token || !startRect || !endRect || !document.body) return;
    const theme = getLaunchDirectFlightTheme();
    const displayText = token.textContent || token.getAttribute('data-direct-token-text') || '';
    const computedStyle = window.getComputedStyle(token);
    const startX = startRect.left;
    const startY = startRect.top;
    const endX = endRect.left;
    const endY = endRect.top;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const ghostCount = 5;

    for (let index = 0; index < ghostCount; index += 1) {
        const ghost = document.createElement('div');
        const progress = 0.18 + (index * 0.13);
        ghost.className = `launch-direct-flight-ghost is-${theme}`;
        ghost.textContent = displayText;
        ghost.style.left = `${startX + deltaX * progress}px`;
        ghost.style.top = `${startY + deltaY * progress}px`;
        ghost.style.width = `${startRect.width}px`;
        ghost.style.height = `${startRect.height}px`;
        ghost.style.fontSize = computedStyle.fontSize;
        ghost.style.setProperty('--ghost-opacity', `${0.36 - index * 0.045}`);
        ghost.style.setProperty('--ghost-delay', `${index * 22}ms`);
        ghost.style.setProperty('--ghost-drift-x', `${deltaX * 0.1}px`);
        ghost.style.setProperty('--ghost-drift-y', `${deltaY * 0.1}px`);
        document.body.appendChild(ghost);
        setTimeout(() => ghost.remove(), 520);
    }

    spawnLaunchDirectLandingBurst(endRect);
}

function getLaunchDirectDisplayText(rawText, isFirstAnswerToken = false) {
    const text = String(rawText || '');
    if (!isFirstAnswerToken) return text;
    if (/^[a-z]+[A-Z]/.test(text)) return text;
    return text.replace(/[a-z]/i, char => char.toUpperCase());
}

function refreshLaunchDirectTokenDisplay() {
    const answerZone = document.getElementById('launch-direct-answer-zone');
    const answerTokens = Array.from(answerZone?.children || []);
    document.querySelectorAll('.launch-direct-token').forEach((token) => {
        const rawText = token.getAttribute('data-direct-token-text') || token.textContent || '';
        const displayText = token.getAttribute('data-direct-token-display-text') || getGrammarDirectTokenPoolDisplayText(rawText);
        const isFirstAnswerToken = answerTokens[0] === token;
        token.textContent = getLaunchDirectDisplayText(displayText, isFirstAnswerToken);
    });
}

function moveLaunchDirectToken(token, destination, options = {}) {
    if (!token || !destination || token.classList.contains('is-moving')) return;
    setLaunchDirectFireWrongState(false);
    const startRect = token.getBoundingClientRect();
    token.classList.add('is-moving');
    token.style.transition = 'none';
    destination.appendChild(token);
    refreshLaunchDirectTokenDisplay();
    const endRect = token.getBoundingClientRect();
    const deltaX = startRect.left - endRect.left;
    const deltaY = startRect.top - endRect.top;
    token.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${options.toAnswer ? 1.04 : 0.96})`;
    if (options.toAnswer) spawnLaunchDirectFlightEffect(token, startRect, endRect);

    token.offsetHeight;
    token.style.transition = 'transform 0.26s cubic-bezier(0.2, 0.9, 0.2, 1), box-shadow 0.22s ease, border-color 0.22s ease';
    token.style.transform = 'translate(0, 0) scale(1)';
    token.addEventListener('transitionend', () => {
        token.classList.remove('is-moving');
        token.style.transition = '';
        token.style.transform = '';
        syncLaunchDirectSelectedTokens();
    }, { once: true });
    setTimeout(() => {
        token.classList.remove('is-moving');
        syncLaunchDirectSelectedTokens();
    }, 320);
}

function syncLaunchDirectSelectedTokens() {
    const answerZone = document.getElementById('launch-direct-answer-zone');
    refreshLaunchDirectTokenDisplay();
    grammarLaunchState.directSelectedTokens = Array.from(answerZone?.children || [])
        .map(token => token.textContent || token.getAttribute('data-direct-token-text') || '');
}

function handleLaunchDirectTokenClick(event) {
    event.stopPropagation();
    const token = event.currentTarget;
    const answerZone = document.getElementById('launch-direct-answer-zone');
    const tokenPool = document.getElementById('launch-direct-token-pool');
    const feedback = document.getElementById('launch-direct-feedback');
    if (!token || !answerZone || !tokenPool || token.classList.contains('is-locked')) return;
    answerZone.classList.remove('is-correct', 'is-wrong');
    document.querySelectorAll('.launch-direct-token').forEach((item) => item.classList.remove('is-correct', 'is-wrong'));
    if (feedback) feedback.innerText = '';

    if (token.parentElement === tokenPool) {
        if (typeof playSound === 'function') playSound('enter-sfx');
        moveLaunchDirectToken(token, answerZone, { toAnswer: true });
        return;
    }

    if (token.parentElement === answerZone) {
        if (typeof playSound === 'function') playSound('delete-sfx');
        moveLaunchDirectToken(token, tokenPool, { toAnswer: false });
    }
}

function createLaunchDirectToken(tokenData) {
    const token = document.createElement('button');
    const displayText = getGrammarDirectTokenPoolDisplayText(tokenData.text);
    token.type = 'button';
    token.className = 'launch-direct-token';
    token.textContent = getLaunchDirectDisplayText(displayText);
    token.setAttribute('data-direct-token-id', tokenData.id);
    token.setAttribute('data-direct-token-text', tokenData.text);
    token.setAttribute('data-direct-token-display-text', displayText);
    token.addEventListener('click', handleLaunchDirectTokenClick);
    return token;
}

function resetLaunchGrammarDirectQuestion() {
    grammarLaunchState.directSelectedTokens = [];
    setLaunchDirectFireWrongState(false);
    const answerZone = document.getElementById('launch-direct-answer-zone');
    const tokenPool = document.getElementById('launch-direct-token-pool');
    const feedback = document.getElementById('launch-direct-feedback');
    if (answerZone) {
        answerZone.innerHTML = '';
        answerZone.classList.remove('is-correct', 'is-wrong');
    }
    if (tokenPool) tokenPool.innerHTML = '';
    if (feedback) feedback.innerText = '';
}

function prepareLaunchGrammarDirectQuestion(question) {
    const panel = document.getElementById('launch-grammar-panel');
    const verbWrap = document.getElementById('launch-grammar-verb-wrap');
    const tenseWrap = document.getElementById('launch-grammar-tense-wrap');
    const directWrap = document.getElementById('launch-grammar-direct-wrap');
    const choiceWrap = document.getElementById('launch-grammar-choice-wrap');
    const modeLabel = document.getElementById('launch-mode-label');
    const qText = document.getElementById('q-text');
    const qDisplay = document.getElementById('q-display');
    const hiddenInput = document.getElementById('hidden-input');
    const reference = document.getElementById('launch-grammar-reference');
    const subhint = document.getElementById('launch-subhint');
    const tokenPool = document.getElementById('launch-direct-token-pool');
    const command = document.getElementById('launch-direct-command');

    if (!panel || !question?.grammarDirect) return;

    resetLaunchGrammarDirectQuestion();
    configureLaunchTenseKeyboard(false);
    setLaunchTenseLayoutMode(false);
    panel.style.display = 'block';
    if (verbWrap) verbWrap.style.display = 'none';
    if (tenseWrap) tenseWrap.style.display = 'none';
    if (directWrap) directWrap.style.display = 'flex';
    if (choiceWrap) choiceWrap.style.display = 'none';
    if (qText) qText.classList.remove('launch-tense-prompt');
    if (modeLabel) {
        modeLabel.innerText = question.grammarTopic === GRAMMAR_INDIRECT_TOPIC
            ? 'REARRANGE INDIRECT QUESTION'
            : question.grammarTopic === GRAMMAR_IT_IS_TOPIC
            ? 'REARRANGE IT IS PATTERN'
            : question.grammarTopic === GRAMMAR_CONDITIONAL_TOPIC
            ? 'REARRANGE CONDITIONAL'
            : question.grammarTopic === GRAMMAR_REPORTED_SPEECH_TOPIC
            ? 'REARRANGE REPORTED SPEECH'
            : 'REARRANGE THE QUESTION';
        modeLabel.style.display = '';
    }
    if (qDisplay) qDisplay.style.display = 'none';
    if (hiddenInput) {
        hiddenInput.value = '';
        hiddenInput.style.display = 'none';
    }
    if (reference) reference.style.display = 'none';
    if (subhint) {
        subhint.style.display = '';
        subhint.innerText = 'TAP WORD BLOCKS // FIRE TO CONFIRM';
    }
    if (command) {
        const answerCount = getGrammarDirectPrimaryTokens(question).length;
        command.innerText = `${answerCount} BLOCKS REQUIRED`;
    }
    if (tokenPool) {
        getGrammarDirectTokenPool(question).forEach((tokenData, index) => {
            const token = createLaunchDirectToken(tokenData);
            token.style.animationDelay = `${Math.min(index, 10) * 18}ms`;
            tokenPool.appendChild(token);
        });
    }
}

function getLaunchTenseInput() {
    return document.getElementById('launch-tense-answer-input');
}

function getLaunchTenseFieldCount() {
    return Math.max(1, grammarLaunchState.tenseBlankCount || 1);
}

function normalizeLaunchTenseSlotIndex(index) {
    const blankCount = getLaunchTenseFieldCount();
    return Math.max(0, Math.min(blankCount - 1, Number(index) || 0));
}

function ensureLaunchTenseSlotTexts() {
    const blankCount = getLaunchTenseFieldCount();
    if (!Array.isArray(grammarLaunchState.tenseSlotTexts)) {
        grammarLaunchState.tenseSlotTexts = [];
    }
    while (grammarLaunchState.tenseSlotTexts.length < blankCount) {
        grammarLaunchState.tenseSlotTexts.push('');
    }
    if (grammarLaunchState.tenseSlotTexts.length > blankCount) {
        grammarLaunchState.tenseSlotTexts = grammarLaunchState.tenseSlotTexts.slice(0, blankCount);
    }
    return grammarLaunchState.tenseSlotTexts;
}

function composeLaunchTenseAnswerText() {
    const slots = ensureLaunchTenseSlotTexts();
    return slots.join(' ');
}

function syncLaunchTenseComposedAnswer() {
    grammarLaunchState.tenseAnswerText = composeLaunchTenseAnswerText();
    const input = getLaunchTenseInput();
    if (input && input.value !== grammarLaunchState.tenseAnswerText) {
        input.value = grammarLaunchState.tenseAnswerText;
    }
}

function getGrammarTenseExpectedSlots(question = currentVocab) {
    return getGrammarTenseAnswerSlots(question);
}

function applyGrammarTenseSlotCasing(value, slotIndex) {
    const expected = getGrammarTenseExpectedSlots()[normalizeLaunchTenseSlotIndex(slotIndex)] || '';
    const expectedChars = Array.from(expected).filter(char => !/\s/.test(char));
    let expectedIndex = 0;

    return Array.from(String(value || '')).map((char) => {
        if (/\s/.test(char)) return char;

        const expectedChar = expectedChars[expectedIndex] || '';
        expectedIndex += 1;
        if (!/[a-z]/i.test(char)) return char;
        if (expectedChar && /[a-z]/i.test(expectedChar)) {
            return expectedChar === expectedChar.toUpperCase()
                ? char.toUpperCase()
                : char.toLowerCase();
        }
        return char.toLowerCase();
    }).join('');
}

function setLaunchTenseSlotText(index, value) {
    const slotIndex = normalizeLaunchTenseSlotIndex(index);
    const slots = ensureLaunchTenseSlotTexts();
    slots[slotIndex] = applyGrammarTenseSlotCasing(value, slotIndex);
    syncLaunchTenseComposedAnswer();
    updateLaunchTenseInlineAnswer();
}

function getLaunchTenseDisplaySlots() {
    return [...ensureLaunchTenseSlotTexts()];
}

function getLaunchTenseActiveBlankIndex() {
    return normalizeLaunchTenseSlotIndex(grammarLaunchState.activeFieldIndex || 0);
}

function updateLaunchTenseInlineAnswer() {
    syncLaunchTenseComposedAnswer();

    const slots = getLaunchTenseDisplaySlots();
    const activeBlankIndex = getLaunchTenseActiveBlankIndex();
    document.querySelectorAll('[data-launch-tense-blank]').forEach((blank) => {
        const index = Number(blank.getAttribute('data-launch-tense-blank') || 0);
        const typed = blank.querySelector('.launch-tense-typed');
        const slotText = slots[index] || '';
        if (typed) typed.textContent = slotText;
        blank.classList.toggle('is-filled', Boolean(slotText));
        blank.classList.toggle('is-active', index === activeBlankIndex);
        blank.classList.remove('is-correct', 'is-wrong');
    });
}

function syncLaunchTenseInputMode() {
    const input = getLaunchTenseInput();
    if (!input) return;
    if (grammarUsesGameKeyboard()) {
        input.setAttribute('readonly', 'readonly');
        input.classList.add('grammar-readonly');
        input.blur();
        return;
    }

    input.removeAttribute('readonly');
    input.classList.remove('grammar-readonly');
    if (document.getElementById('launch-modal')?.style.display === 'flex') {
        input.focus();
        const endPosition = input.value.length;
        input.setSelectionRange(endPosition, endPosition);
    }
}

function setLaunchTenseActiveField(index) {
    grammarLaunchState.activeFieldIndex = normalizeLaunchTenseSlotIndex(index);
    syncLaunchTenseInputMode();
    updateLaunchTenseInlineAnswer();
}

function appendLaunchTenseAnswerText(value) {
    const nextValue = String(value || '');
    if (!nextValue) return;

    const activeIndex = getLaunchTenseActiveBlankIndex();
    const slots = ensureLaunchTenseSlotTexts();
    const current = slots[activeIndex] || '';
    if (nextValue === ' ') {
        if (!current || /\s$/.test(current)) return;
        setLaunchTenseSlotText(activeIndex, `${current} `);
    } else {
        setLaunchTenseSlotText(activeIndex, `${current}${nextValue}`);
    }
}

function attachLaunchTenseInputBehaviors() {
    const input = getLaunchTenseInput();
    if (!input || input.dataset.bound === 'true') return;
    input.dataset.bound = 'true';

    input.addEventListener('focus', () => {
        setLaunchTenseActiveField(0);
        if (grammarUsesGameKeyboard()) input.blur();
    });

    input.addEventListener('click', (event) => {
        event.stopPropagation();
        setLaunchTenseActiveField(0);
        if (grammarUsesGameKeyboard()) input.blur();
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkAnswer();
        }
    });

    input.addEventListener('input', () => {
        setLaunchTenseSlotText(getLaunchTenseActiveBlankIndex(), input.value);
        const feedback = document.getElementById('launch-tense-feedback');
        if (feedback) feedback.innerText = '';
    });
}

function resetLaunchGrammarQuestion() {
    const panel = document.getElementById('launch-grammar-panel');
    const verbWrap = document.getElementById('launch-grammar-verb-wrap');
    const tenseWrap = document.getElementById('launch-grammar-tense-wrap');
    const directWrap = document.getElementById('launch-grammar-direct-wrap');
    const choiceWrap = document.getElementById('launch-grammar-choice-wrap');
    const modeLabel = document.getElementById('launch-mode-label');
    const qText = document.getElementById('q-text');
    const qDisplay = document.getElementById('q-display');
    const hiddenInput = document.getElementById('hidden-input');
    const reference = document.getElementById('launch-grammar-reference');
    const subhint = document.getElementById('launch-subhint');
    const meta = document.getElementById('launch-tense-meta');
    const answerGrid = document.getElementById('launch-tense-answer-grid');
    const feedback = document.getElementById('launch-tense-feedback');
    setLaunchTenseLayoutMode(false);
    renderLaunchGrammarSlotLayout(null);
    resetLaunchGrammarVerbInputs(null);
    if (panel) panel.style.display = 'none';
    if (verbWrap) verbWrap.style.display = 'block';
    if (tenseWrap) tenseWrap.style.display = 'none';
    if (directWrap) directWrap.style.display = 'none';
    if (choiceWrap) choiceWrap.style.display = 'none';
    if (qText) qText.classList.remove('launch-tense-prompt');
    if (modeLabel) modeLabel.style.display = '';
    if (qDisplay) qDisplay.style.display = 'block';
    if (hiddenInput) hiddenInput.style.display = '';
    if (reference) reference.style.display = 'none';
    if (subhint) {
        subhint.style.display = '';
        subhint.innerText = 'TYPE TO DECRYPT // ENTER TO FIRE';
    }
    if (answerGrid) answerGrid.innerHTML = '';
    if (feedback) feedback.innerText = '';
    if (meta) meta.style.display = '';
    configureLaunchTenseKeyboard(false);
    grammarLaunchState.tenseAnswerWords = [];
    grammarLaunchState.tenseAnswerText = '';
    grammarLaunchState.tenseBlankCount = 1;
    grammarLaunchState.tenseSlotTexts = [];
    resetLaunchGrammarDirectQuestion();
    resetLaunchGrammarChoiceQuestion();
    resetLaunchGrammarHints();
}

function focusLaunchGrammarField() {
    if (!isGrammarBattleMode()) return;
    if (isGrammarChoiceBattleMode()) return;
    if (isGrammarDirectQuestionBattleMode()) return;
    if (isGrammarTenseBattleMode()) {
        setLaunchTenseActiveField(grammarLaunchState.activeFieldIndex || 0);
        return;
    }
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
    if (isGrammarChoiceBattleMode()) {
        if (keyValue === 'ENTER') checkAnswer();
        return;
    }
    if (isGrammarDirectQuestionBattleMode()) {
        if (keyValue === 'ENTER') checkAnswer();
        return;
    }
    if (isGrammarTenseBattleMode()) {
        handleLaunchTenseKey(keyValue, keyElement);
        return;
    }

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

    const activeSlot = getGrammarVerbAnswerSlots(currentVocab)[grammarLaunchState.activeFieldIndex];
    const input = getLaunchGrammarSlotInput(activeSlot);
    if (!input || input.disabled) return;

    if (keyValue === 'BACKSPACE') {
        const protectedValue = getLaunchGrammarSlotInitialValue(activeSlot);
        if (protectedValue && input.value.length <= protectedValue.length) return;
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

function handleLaunchTenseKey(keyValue, keyElement) {
    if (keyValue === 'PREV_FIELD') {
        setLaunchTenseActiveField(getLaunchTenseActiveBlankIndex() - 1);
        if (typeof playSound === 'function') playSound('enter-sfx');
        return;
    }

    if (keyValue === 'NEXT_FIELD') {
        setLaunchTenseActiveField(getLaunchTenseActiveBlankIndex() + 1);
        if (typeof playSound === 'function') playSound('enter-sfx');
        return;
    }

    if (keyValue === 'SPACE') {
        appendLaunchTenseAnswerText(' ');
        if (typeof playSound === 'function') playSound('enter-sfx');
        return;
    }

    if (keyValue === 'ENTER') {
        checkAnswer();
        return;
    }

    const input = getLaunchTenseInput();
    if (!input || input.disabled) return;

    if (keyValue === 'BACKSPACE') {
        if (typeof playSound === 'function') playSound('delete-sfx');
        const activeIndex = getLaunchTenseActiveBlankIndex();
        const slots = ensureLaunchTenseSlotTexts();
        setLaunchTenseSlotText(activeIndex, String(slots[activeIndex] || '').slice(0, -1));
        return;
    }

    if (keyElement) {
        lastVirtualKeyboardKey = keyElement;
    }
    if (typeof playSound === 'function') playSound('enter-sfx');
    appendLaunchTenseAnswerText(keyValue);
}

function checkGrammarBattleAnswer() {
    if (isGrammarChoiceBattleMode()) {
        return checkGrammarChoiceBattleAnswer();
    }
    if (isGrammarDirectQuestionBattleMode()) {
        return checkGrammarDirectBattleAnswer();
    }
    if (isGrammarTenseBattleMode()) {
        return checkGrammarTenseBattleAnswer();
    }
    if (!isGrammarBattleMode() || !currentVocab?.grammarForms) return false;

    resetLaunchGrammarHints();
    let allCorrect = true;
    const hintedFields = new Set();

    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey) => {
        evaluateGrammarVerbFieldSlots(currentVocab, fieldKey, getLaunchGrammarSlotInput).forEach(({ slot, input, isCorrect }) => {
            if (!input) return;
            input.classList.remove('is-correct', 'is-wrong');
            if (isCorrect) {
                input.classList.add('is-correct');
            } else {
                allCorrect = false;
                input.classList.add('is-wrong');
                if (!hintedFields.has(slot.fieldKey)) {
                    addLaunchGrammarHint(slot.fieldKey, getGrammarVerbFieldAnswerText(currentVocab, slot.fieldKey));
                    hintedFields.add(slot.fieldKey);
                }
            }
        });
    });

    return allCorrect;
}

function checkGrammarChoiceBattleAnswer() {
    if (!isGrammarBattleMode() || !currentVocab?.grammarChoice) return false;
    if (grammarLaunchState.choiceResolved) return null;

    const question = currentVocab.grammarChoice;
    const selectedIndex = grammarLaunchState.choiceSelectedIndex;
    const feedback = document.getElementById('launch-choice-feedback');
    if (!Number.isInteger(selectedIndex)) {
        if (feedback) feedback.innerText = 'SELECT ONE OPTION FIRST';
        return null;
    }

    const isCorrect = selectedIndex === question.correctIndex;
    grammarLaunchState.choiceResolved = true;
    grammarLaunchState.choiceSubmitting = false;
    const fireBtn = document.getElementById('launch-choice-fire-btn');
    if (fireBtn) fireBtn.disabled = true;
    syncLaunchChoiceOptionStates(true);
    if (feedback) {
        feedback.innerText = isCorrect ? 'OPTION CONFIRMED // FIRING' : 'OPTION REJECTED // TURN LOST';
    }
    return isCorrect;
}

function normalizeGrammarAnswerValue(value) {
    let normalizedValue = String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[’]/g, "'")
        .replace(/\s+/g, ' ');
    const contractionMap = {
        "won't": 'will not',
        "can't": 'cannot',
        "don't": 'do not',
        "doesn't": 'does not',
        "didn't": 'did not',
        "isn't": 'is not',
        "aren't": 'are not',
        "wasn't": 'was not',
        "weren't": 'were not',
        "haven't": 'have not',
        "hasn't": 'has not',
        "hadn't": 'had not',
        "wouldn't": 'would not',
        "shouldn't": 'should not',
        "couldn't": 'could not'
    };
    Object.entries(contractionMap).forEach(([shortForm, fullForm]) => {
        normalizedValue = normalizedValue.replace(new RegExp(`\\b${shortForm.replace("'", "\\'")}\\b`, 'g'), fullForm);
    });
    return normalizedValue
        .replace(/\blearnt\b/g, 'learned')
        .replace(/analys/g, 'analyz')
        .replace(/organis/g, 'organiz')
        .replace(/practis/g, 'practic')
        .replace(/criticis/g, 'criticiz')
        .replace(/honour/g, 'honor')
        .replace(/cancelled/g, 'canceled')
        .replace(/cancelling/g, 'canceling')
        .replace(/travelled/g, 'traveled')
        .replace(/travelling/g, 'traveling')
        .replace(/\s+/g, ' ')
        .trim();
}

function checkGrammarTenseBattleAnswer() {
    if (!isGrammarBattleMode() || !currentVocab?.grammarTense) return false;

    const question = currentVocab.grammarTense;
    const input = getLaunchTenseInput();
    const userAnswerText = grammarLaunchState.tenseAnswerText || input?.value || '';
    const userAnswer = normalizeGrammarAnswerValue(userAnswerText);
    const isCorrect = question.answers.some(answer => normalizeGrammarAnswerValue(answer) === userAnswer);

    if (input) input.disabled = isCorrect;
    document.querySelectorAll('[data-launch-tense-blank]').forEach((blank) => {
        blank.classList.toggle('is-correct', isCorrect);
        blank.classList.toggle('is-wrong', !isCorrect);
        blank.classList.remove('is-active');
    });

    if (!isCorrect) {
        updateLaunchTenseInlineAnswer();
        document.querySelectorAll('[data-launch-tense-blank]').forEach((blank) => {
            blank.classList.add('is-wrong');
        });
    }

    const feedback = document.getElementById('launch-tense-feedback');
    if (feedback) {
        feedback.innerText = '';
    }

    return isCorrect;
}

function checkGrammarDirectBattleAnswer() {
    if (!isGrammarBattleMode() || !currentVocab?.grammarDirect) return false;

    syncLaunchDirectSelectedTokens();
    const answerZone = document.getElementById('launch-direct-answer-zone');
    const feedback = document.getElementById('launch-direct-feedback');
    const userAnswer = formatGrammarDirectTokens(grammarLaunchState.directSelectedTokens);
    const normalizedUserAnswer = normalizeGrammarDirectAnswer(userAnswer);
    const correctTexts = getGrammarDirectCorrectTexts(currentVocab);
    const isCorrect = correctTexts.some(answer => normalizeGrammarDirectAnswer(answer) === normalizedUserAnswer);

    if (answerZone) {
        answerZone.classList.toggle('is-correct', isCorrect);
        answerZone.classList.toggle('is-wrong', !isCorrect);
    }

    document.querySelectorAll('.launch-direct-token').forEach((token) => {
        token.classList.toggle('is-locked', isCorrect);
        token.classList.toggle('is-correct', isCorrect && token.parentElement === answerZone);
        token.classList.toggle('is-wrong', !isCorrect && token.parentElement === answerZone);
    });

    if (feedback) feedback.innerText = isCorrect ? 'SEQUENCE CONFIRMED' : 'SEQUENCE INVALID';
    setLaunchDirectFireWrongState(!isCorrect);
    return isCorrect;
}

function getGrammarBattleModeLabel(question = currentVocab) {
    if (question?.grammarTopic === GRAMMAR_PREPOSITION_PLACE_TOPIC) return 'Select the correct preposition.';
    if (question?.grammarTopic === GRAMMAR_PREPOSITION_TIME_TOPIC) return 'Select the correct time preposition.';
    if (question?.grammarTopic === GRAMMAR_TENSE_TOPIC) return 'Complete the tense code.';
    if (question?.grammarTopic === GRAMMAR_INFINITIVE_GERUND_TOPIC) return 'Complete the infinitive or gerund form.';
    if (question?.grammarTopic === GRAMMAR_CONDITIONAL_TOPIC) return 'Reconstruct the conditional sentence.';
    if (question?.grammarTopic === GRAMMAR_REPORTED_SPEECH_TOPIC) return 'Reconstruct the reported speech.';
    if (question?.grammarTopic === GRAMMAR_IT_IS_TOPIC) return 'Reconstruct the It is pattern.';
    if (question?.grammarTopic === GRAMMAR_INDIRECT_TOPIC) return 'Reconstruct the indirect question.';
    if (question?.grammarTopic === GRAMMAR_DIRECT_TOPIC) return 'Reconstruct the question.';
    return 'Complete the verb table.';
}

function getGrammarBattlePromptText(question = currentVocab) {
    return question?.ch || '';
}

function getGrammarBattleErrorMessage(question = currentVocab) {
    if (question?.grammarTopic === GRAMMAR_PREPOSITION_PLACE_TOPIC) return 'PREPOSITION LOCK INVALID!';
    if (question?.grammarTopic === GRAMMAR_PREPOSITION_TIME_TOPIC) return 'TIME PREPOSITION LOCK INVALID!';
    if (question?.grammarTopic === GRAMMAR_TENSE_TOPIC) return 'TENSE CODE INVALID!';
    if (question?.grammarTopic === GRAMMAR_INFINITIVE_GERUND_TOPIC) return 'FORM CODE INVALID!';
    if (question?.grammarTopic === GRAMMAR_CONDITIONAL_TOPIC) return 'CONDITIONAL SEQUENCE INVALID!';
    if (question?.grammarTopic === GRAMMAR_REPORTED_SPEECH_TOPIC) return 'REPORTED SEQUENCE INVALID!';
    if (isGrammarQuestionRearrangeTopic(question?.grammarTopic)) return 'QUESTION SEQUENCE INVALID!';
    return 'TABLE INCOMPLETE!';
}

function grammarBattleUsesVirtualKeyboard(question = currentVocab) {
    return !(isGrammarDirectQuestionBattleMode(question) || isGrammarChoiceBattleMode(question));
}

function joinGrammarReviewParts(parts) {
    const cleanedParts = parts.map((part) => String(part || '').trim());
    return cleanedParts.some(Boolean)
        ? cleanedParts.map((part) => part || '_').join(' / ')
        : '(blank)';
}

function getGrammarVerbReviewEntry(question = currentVocab) {
    const slots = getGrammarVerbAnswerSlots(question);
    return {
        user: joinGrammarReviewParts(slots.map((slot) => getLaunchGrammarSlotInput(slot)?.value || '')),
        correct: joinGrammarReviewParts(slots.map((slot) => slot.answer)),
        chinese: question?.ch || ''
    };
}

function getGrammarTenseReviewEntry(question = currentVocab) {
    const tenseQuestion = question?.grammarTense || {};
    const userAnswer = grammarLaunchState.tenseAnswerText || composeLaunchTenseAnswerText();
    const answerSlots = getGrammarTenseAnswerSlots(question);
    return {
        user: String(userAnswer || '').trim() || '(blank)',
        correct: getGrammarTensePrimaryAnswer(question),
        chinese: tenseQuestion.chinese || question?.ch || '',
        sentence: tenseQuestion.question || '',
        grammarAnswerSlots: answerSlots
    };
}

function getGrammarDirectReviewEntry(question = currentVocab) {
    const userAnswer = formatGrammarDirectTokens(grammarLaunchState.directSelectedTokens);
    const correctTexts = getGrammarDirectCorrectTexts(question);
    return {
        user: userAnswer || '(blank)',
        correct: correctTexts[0] || '',
        chinese: question?.grammarDirect?.chinese || question?.ch || '',
        sentence: null,
        grammarRuleText: getGrammarDirectRuleText(question)
    };
}

function getGrammarChoiceReviewEntry(question = currentVocab) {
    const choiceQuestion = question?.grammarChoice || {};
    const selectedIndex = grammarLaunchState.choiceSelectedIndex;
    const selectedText = Number.isInteger(selectedIndex)
        ? (choiceQuestion.options || [])[selectedIndex]
        : grammarLaunchState.choiceSelectedText;
    return {
        user: String(selectedText || '').trim() || '(blank)',
        correct: choiceQuestion.correctText || '',
        chinese: choiceQuestion.chinese || question?.ch || '',
        sentence: choiceQuestion.question || '',
        grammarAnswerSlots: [choiceQuestion.correctText || ''],
        grammarRuleText: choiceQuestion.explanation || null
    };
}

function getGrammarBattleReviewEntry(question = currentVocab) {
    const isQuestionRearrange = isGrammarQuestionRearrangeTopic(question?.grammarTopic) || question?.grammarDirect;
    const isChoiceQuestion = !isQuestionRearrange && (isGrammarChoiceTopic(question?.grammarTopic) || question?.grammarChoice);
    const isTenseQuestion = !isQuestionRearrange && !isChoiceQuestion && (question?.grammarTopic === GRAMMAR_TENSE_TOPIC || question?.grammarTense);
    const entry = isChoiceQuestion
        ? getGrammarChoiceReviewEntry(question)
        : isQuestionRearrange
        ? getGrammarDirectReviewEntry(question)
        : isTenseQuestion
        ? getGrammarTenseReviewEntry(question)
        : getGrammarVerbReviewEntry(question);
    return {
        mode: 'GRAMMAR',
        grammarTopic: isChoiceQuestion
            ? (question?.grammarTopic || question?.grammarChoice?.topic || GRAMMAR_PREPOSITION_PLACE_TOPIC)
            : isQuestionRearrange
            ? (question?.grammarTopic || question?.grammarDirect?.topic || GRAMMAR_DIRECT_TOPIC)
            : (isTenseQuestion ? (question?.grammarTopic || question?.grammarTense?.topic || GRAMMAR_TENSE_TOPIC) : 'VERB_TABLE'),
        ...entry
    };
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
    const slots = getGrammarVerbAnswerSlots(getCurrentGrammarQuestion());
    const safeIndex = Math.max(0, Math.min(slots.length - 1, index));
    const activeSlot = slots[safeIndex] || null;
    grammarVerbState.activeFieldIndex = safeIndex;

    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey) => {
        const container = getGrammarVerbFieldContainer(fieldKey);
        const input = getGrammarVerbFieldInput(fieldKey);
        if (container) {
            container.classList.toggle('is-active', activeSlot?.fieldKey === fieldKey);
            container.querySelectorAll('.grammar-verb-subslot-input').forEach((subInput) => {
                subInput.classList.toggle('is-active', subInput.getAttribute('data-grammar-slot-key') === activeSlot?.slotKey);
            });
        }
        if (input) input.classList.toggle('is-active', activeSlot?.fieldKey === fieldKey && activeSlot?.subIndex === null);
    });

    const activeInput = getGrammarVerbSlotInput(activeSlot);
    if (!grammarUsesGameKeyboard() && activeInput && document.getElementById('grammar-verb-screen')?.style.display === 'flex') {
        activeInput.focus();
        activeInput.select();
    }
}

function moveGrammarVerbField(direction) {
    const slotCount = getGrammarVerbSlotCount(getCurrentGrammarQuestion());
    const nextIndex = (grammarVerbState.activeFieldIndex + direction + slotCount) % slotCount;
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
    const timeLimit = Math.max(0.1, grammarVerbState.timeLimit || GRAMMAR_VERB_BASE_TIME);
    if (timerText) timerText.innerText = grammarVerbState.timeLeft.toFixed(1);
    if (timerBar) {
        timerBar.style.width = `${(grammarVerbState.timeLeft / timeLimit) * 100}%`;
        timerBar.style.background = grammarVerbState.timeLeft <= 5
            ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.95), rgba(248, 113, 113, 0.8))'
            : 'linear-gradient(90deg, rgba(14, 165, 233, 0.95), rgba(34, 211, 238, 0.8))';
    }
}

function startGrammarVerbTimer() {
    stopGrammarVerbTimer();
    grammarVerbState.timeLimit = getGrammarVerbAnswerTimeLimit(getCurrentGrammarQuestion());
    grammarVerbState.timeLeft = grammarVerbState.timeLimit;
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

    const allInputs = new Set([
        ...GRAMMAR_VERB_FIELD_ORDER.map((fieldKey) => getGrammarVerbFieldInput(fieldKey)).filter(Boolean),
        ...document.querySelectorAll('.grammar-verb-subslot-input')
    ]);

    allInputs.forEach((input) => {
        input.value = '';
        clearGrammarSlotInputState(input);
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
    renderGrammarVerbSlotLayout(question);
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

function openGrammarDirectQuestionScreen() {
    playSound('deploy-sfx');
    const topicScreen = document.getElementById('grammar-topic-screen');
    if (topicScreen) topicScreen.style.display = 'none';

    window.selectedGrammarTopic = GRAMMAR_DIRECT_TOPIC;
    currentPracticeMode = 'GRAMMAR';
    selectedLevel = GRAMMAR_DIRECT_TOPIC;
    selectedStageIndex = null;
    selectedStageLabel = 'DIRECT QUESTION';
    activeVocabList = buildGrammarDirectQuestionBattleDeck();
    if (!activeVocabList.length) {
        if (typeof showNotification === 'function') {
            showNotification('DIRECT QUESTION DATABASE NOT LOADED', 'error', 4000);
        } else {
            alert('Direct Question database not loaded.');
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

function openGrammarIndirectQuestionScreen() {
    playSound('deploy-sfx');
    const topicScreen = document.getElementById('grammar-topic-screen');
    if (topicScreen) topicScreen.style.display = 'none';

    window.selectedGrammarTopic = GRAMMAR_INDIRECT_TOPIC;
    currentPracticeMode = 'GRAMMAR';
    selectedLevel = GRAMMAR_INDIRECT_TOPIC;
    selectedStageIndex = null;
    selectedStageLabel = 'INDIRECT QUESTION';
    activeVocabList = buildGrammarIndirectQuestionBattleDeck();
    if (!activeVocabList.length) {
        if (typeof showNotification === 'function') {
            showNotification('INDIRECT QUESTION DATABASE NOT LOADED', 'error', 4000);
        } else {
            alert('Indirect Question database not loaded.');
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

function openGrammarItIsScreen() {
    playSound('deploy-sfx');
    const topicScreen = document.getElementById('grammar-topic-screen');
    if (topicScreen) topicScreen.style.display = 'none';

    window.selectedGrammarTopic = GRAMMAR_IT_IS_TOPIC;
    currentPracticeMode = 'GRAMMAR';
    selectedLevel = GRAMMAR_IT_IS_TOPIC;
    selectedStageIndex = null;
    selectedStageLabel = 'IT IS';
    activeVocabList = buildGrammarItIsQuestionBattleDeck();
    if (!activeVocabList.length) {
        if (typeof showNotification === 'function') {
            showNotification('IT IS DATABASE NOT LOADED', 'error', 4000);
        } else {
            alert('IT IS database not loaded.');
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

function openGrammarInfinitiveGerundScreen() {
    playSound('deploy-sfx');
    const topicScreen = document.getElementById('grammar-topic-screen');
    if (topicScreen) topicScreen.style.display = 'none';

    window.selectedGrammarTopic = GRAMMAR_INFINITIVE_GERUND_TOPIC;
    currentPracticeMode = 'GRAMMAR';
    selectedLevel = GRAMMAR_INFINITIVE_GERUND_TOPIC;
    selectedStageIndex = null;
    selectedStageLabel = 'INFINITIVE / GERUND';
    activeVocabList = buildGrammarInfinitiveGerundBattleDeck();
    if (!activeVocabList.length) {
        if (typeof showNotification === 'function') {
            showNotification('INFINITIVE / GERUND DATABASE NOT LOADED', 'error', 4000);
        } else {
            alert('Infinitive / Gerund database not loaded.');
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

function openGrammarPrepositionPlaceScreen() {
    playSound('deploy-sfx');
    const topicScreen = document.getElementById('grammar-topic-screen');
    if (topicScreen) topicScreen.style.display = 'none';

    window.selectedGrammarTopic = GRAMMAR_PREPOSITION_PLACE_TOPIC;
    currentPracticeMode = 'GRAMMAR';
    selectedLevel = GRAMMAR_PREPOSITION_PLACE_TOPIC;
    selectedStageIndex = null;
    selectedStageLabel = 'PREPOSITION OF PLACE';
    activeVocabList = buildGrammarPrepositionPlaceBattleDeck();
    if (!activeVocabList.length) {
        if (typeof showNotification === 'function') {
            showNotification('PREPOSITION OF PLACE DATABASE NOT LOADED', 'error', 4000);
        } else {
            alert('Preposition of Place database not loaded.');
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

function openGrammarPrepositionTimeScreen() {
    playSound('deploy-sfx');
    const topicScreen = document.getElementById('grammar-topic-screen');
    if (topicScreen) topicScreen.style.display = 'none';

    window.selectedGrammarTopic = GRAMMAR_PREPOSITION_TIME_TOPIC;
    currentPracticeMode = 'GRAMMAR';
    selectedLevel = GRAMMAR_PREPOSITION_TIME_TOPIC;
    selectedStageIndex = null;
    selectedStageLabel = 'PREPOSITION OF TIME';
    activeVocabList = buildGrammarPrepositionTimeBattleDeck();
    if (!activeVocabList.length) {
        if (typeof showNotification === 'function') {
            showNotification('PREPOSITION OF TIME DATABASE NOT LOADED', 'error', 4000);
        } else {
            alert('Preposition of Time database not loaded.');
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
        present: getGrammarVerbFieldAnswerText(question, 'present'),
        past: getGrammarVerbFieldAnswerText(question, 'past'),
        pp: getGrammarVerbFieldAnswerText(question, 'pp'),
        pg: getGrammarVerbFieldAnswerText(question, 'pg')
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
    const normalizedUser = String(userValue || '').trim().toLowerCase();
    if (!normalizedUser) return false;
    return String(answerText || '')
        .toLowerCase()
        .split('/')
        .map((part) => part.trim())
        .some((part) => part === normalizedUser);
}

function getGrammarAnswerVariants(answerText) {
    return String(answerText || '')
        .toLowerCase()
        .split('/')
        .map((part) => part.trim())
        .filter(Boolean);
}

function evaluateGrammarVerbFieldSlots(question, fieldKey, getInputForSlot) {
    const fieldSlots = getGrammarVerbAnswerSlots(question).filter((slot) => slot.fieldKey === fieldKey);
    if (fieldSlots.length <= 1) {
        return fieldSlots.map((slot) => {
            const input = getInputForSlot(slot);
            return {
                slot,
                input,
                isCorrect: grammarValueMatches(input?.value || '', slot.answer)
            };
        });
    }

    const expectedAnswers = fieldSlots.map((slot) => getGrammarAnswerVariants(slot.answer));
    const usedExpectedIndexes = new Set();
    return fieldSlots.map((slot) => {
        const input = getInputForSlot(slot);
        const normalizedUser = String(input?.value || '').trim().toLowerCase();
        const matchIndex = expectedAnswers.findIndex((variants, index) =>
            !usedExpectedIndexes.has(index) && variants.includes(normalizedUser)
        );
        const isCorrect = matchIndex >= 0;
        if (isCorrect) usedExpectedIndexes.add(matchIndex);
        return { slot, input, isCorrect };
    });
}

function checkGrammarVerbAnswer(isTimeout = false) {
    if (grammarVerbState.checked) return;

    const question = getCurrentGrammarQuestion();
    if (!question) return;

    stopGrammarVerbTimer();
    grammarVerbState.checked = true;

    const errors = [];
    let allCorrect = true;
    const hintedFields = new Set();

    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey) => {
        evaluateGrammarVerbFieldSlots(question, fieldKey, getGrammarVerbSlotInput).forEach(({ slot, input, isCorrect }) => {
            if (!input) return;

            input.disabled = true;

            if (isCorrect && !isTimeout) {
                input.classList.add('is-correct');
                grammarVerbState.score += 1;
            } else {
                allCorrect = false;
                input.classList.add('is-wrong');
                if (!hintedFields.has(slot.fieldKey)) {
                    addGrammarAnswerHint(slot.fieldKey, getGrammarVerbFieldAnswerText(question, slot.fieldKey));
                    hintedFields.add(slot.fieldKey);
                }
                errors.push({
                    label: slot.label,
                    user: input.value.trim(),
                    correct: slot.answer
                });
            }
        });
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

    const maxScore = grammarVerbState.questions.reduce((total, question) => total + getGrammarVerbSlotCount(question), 0);
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

    const activeSlot = getGrammarVerbAnswerSlots(getCurrentGrammarQuestion())[grammarVerbState.activeFieldIndex];
    const input = getGrammarVerbSlotInput(activeSlot);
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

function clearGrammarVerbFieldFeedback(input, fieldKey) {
    input.classList.remove('is-correct', 'is-wrong');
    const container = getGrammarVerbFieldContainer(fieldKey);
    if (container) {
        const hint = container.querySelector('.grammar-answer-hint');
        if (hint) hint.remove();
    }
}

function clearLaunchGrammarFieldFeedback(input, fieldKey) {
    input.classList.remove('is-correct', 'is-wrong');
    const field = getLaunchGrammarField(fieldKey);
    if (field) {
        const hint = field.querySelector('.launch-grammar-hint');
        if (hint) hint.remove();
    }
}

function getLaunchGrammarSlotByInput(input, fallbackFieldKey = '') {
    const slotKey = input?.getAttribute('data-grammar-slot-key') || '';
    const slots = getGrammarVerbAnswerSlots(currentVocab);
    if (slotKey) return slots.find((slot) => slot.slotKey === slotKey) || null;
    return slots.find((slot) => slot.fieldKey === fallbackFieldKey && slot.subIndex === null) || null;
}

function enforceLaunchGrammarSlotPrefix(input, slot) {
    const protectedValue = getLaunchGrammarSlotInitialValue(slot);
    if (!input || !protectedValue) return;
    if (!input.value) {
        input.value = protectedValue;
        return;
    }
    if (!input.value.toLowerCase().startsWith(protectedValue.toLowerCase())) {
        input.value = protectedValue + input.value;
        return;
    }
    if (!input.value.startsWith(protectedValue)) {
        input.value = protectedValue + input.value.slice(protectedValue.length);
    }
}

function attachGrammarVerbSlotInputBehavior(input) {
    input.addEventListener('focus', () => {
        setGrammarVerbActiveField(Number(input.getAttribute('data-grammar-slot-index') || 0));
        if (grammarUsesGameKeyboard()) {
            configureGrammarKeyboard();
            input.blur();
        }
    });

    input.addEventListener('click', () => {
        setGrammarVerbActiveField(Number(input.getAttribute('data-grammar-slot-index') || 0));
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
        clearGrammarVerbFieldFeedback(input, input.getAttribute('data-grammar-field'));
    });
}

function attachLaunchGrammarSlotInputBehavior(input) {
    input.addEventListener('focus', () => {
        setLaunchGrammarActiveField(Number(input.getAttribute('data-grammar-slot-index') || 0));
        if (grammarUsesGameKeyboard()) input.blur();
    });

    input.addEventListener('click', (event) => {
        event.stopPropagation();
        setLaunchGrammarActiveField(Number(input.getAttribute('data-grammar-slot-index') || 0));
        if (grammarUsesGameKeyboard()) input.blur();
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
        const slot = getLaunchGrammarSlotByInput(input);
        enforceLaunchGrammarSlotPrefix(input, slot);
        clearLaunchGrammarFieldFeedback(input, input.getAttribute('data-grammar-field'));
    });
}

function attachGrammarInputBehaviors() {
    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey, index) => {
        const input = getGrammarVerbFieldInput(fieldKey);
        if (!input) return;

        input.addEventListener('focus', () => {
            setGrammarVerbActiveField(getGrammarVerbFirstSlotIndexForField(fieldKey, getCurrentGrammarQuestion()));
            if (grammarUsesGameKeyboard()) {
                configureGrammarKeyboard();
                input.blur();
            }
        });

        input.addEventListener('click', () => {
            setGrammarVerbActiveField(getGrammarVerbFirstSlotIndexForField(fieldKey, getCurrentGrammarQuestion()));
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
            clearGrammarVerbFieldFeedback(input, fieldKey);
        });
    });
}

function attachLaunchGrammarInputBehaviors() {
    GRAMMAR_VERB_FIELD_ORDER.forEach((fieldKey, index) => {
        const input = getLaunchGrammarInput(fieldKey);
        if (!input) return;

        input.addEventListener('focus', () => {
            setLaunchGrammarActiveField(getGrammarVerbFirstSlotIndexForField(fieldKey, currentVocab));
            if (grammarUsesGameKeyboard()) {
                input.blur();
            }
        });

        input.addEventListener('click', (event) => {
            event.stopPropagation();
            setLaunchGrammarActiveField(getGrammarVerbFirstSlotIndexForField(fieldKey, currentVocab));
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
            enforceLaunchGrammarSlotPrefix(input, getLaunchGrammarSlotByInput(input, fieldKey));
            clearLaunchGrammarFieldFeedback(input, fieldKey);
        });
    });
}

function teardownGrammarScreens() {
    stopGrammarVerbTimer();
    hideGrammarKeyboard();
    const reference = document.getElementById('grammar-verb-reference');
    if (reference) reference.style.display = 'none';
    const tenseSetup = document.getElementById('grammar-tense-setup');
    if (tenseSetup) tenseSetup.style.display = 'none';
    const choiceWrap = document.getElementById('launch-grammar-choice-wrap');
    if (choiceWrap) choiceWrap.style.display = 'none';
}

window.openGrammarTopicScreen = openGrammarTopicScreen;
window.closeGrammarTopicScreen = closeGrammarTopicScreen;
window.updateGrammarTopicProgress = updateGrammarTopicProgress;
window.openGrammarVerbTableScreen = openGrammarVerbTableScreen;
window.openGrammarDirectQuestionScreen = openGrammarDirectQuestionScreen;
window.openGrammarIndirectQuestionScreen = openGrammarIndirectQuestionScreen;
window.openGrammarItIsScreen = openGrammarItIsScreen;
window.openGrammarInfinitiveGerundScreen = openGrammarInfinitiveGerundScreen;
window.openGrammarPrepositionPlaceScreen = openGrammarPrepositionPlaceScreen;
window.openGrammarPrepositionTimeScreen = openGrammarPrepositionTimeScreen;
window.openGrammarTenseSetupScreen = openGrammarTenseSetupScreen;
window.openGrammarConditionalSetupScreen = openGrammarConditionalSetupScreen;
window.openGrammarReportedSpeechSetupScreen = openGrammarReportedSpeechSetupScreen;
window.returnToGrammarTopicList = returnToGrammarTopicList;
window.toggleGrammarTenseOption = toggleGrammarTenseOption;
window.toggleGrammarVoiceOption = toggleGrammarVoiceOption;
window.selectAllGrammarTenses = selectAllGrammarTenses;
window.clearGrammarTenses = clearGrammarTenses;
window.confirmGrammarTenseSetup = confirmGrammarTenseSetup;
window.toggleGrammarConditionalOption = toggleGrammarConditionalOption;
window.selectAllGrammarConditionals = selectAllGrammarConditionals;
window.clearGrammarConditionals = clearGrammarConditionals;
window.confirmGrammarConditionalSetup = confirmGrammarConditionalSetup;
window.toggleGrammarReportedSpeechOption = toggleGrammarReportedSpeechOption;
window.selectAllGrammarReportedSpeechTypes = selectAllGrammarReportedSpeechTypes;
window.clearGrammarReportedSpeechTypes = clearGrammarReportedSpeechTypes;
window.confirmGrammarReportedSpeechSetup = confirmGrammarReportedSpeechSetup;
window.returnFromGrammarVerbScreen = returnFromGrammarVerbScreen;
window.toggleGrammarVerbReference = toggleGrammarVerbReference;
window.toggleGrammarTopicReference = toggleGrammarTopicReference;
window.checkGrammarVerbAnswer = checkGrammarVerbAnswer;
window.advanceGrammarVerbQuestion = advanceGrammarVerbQuestion;
window.restartGrammarVerbChallenge = restartGrammarVerbChallenge;
window.retryGrammarVerbWrongQuestions = retryGrammarVerbWrongQuestions;
window.teardownGrammarScreens = teardownGrammarScreens;
window.isGrammarBattleMode = isGrammarBattleMode;
window.isGrammarTenseBattleMode = isGrammarTenseBattleMode;
window.isGrammarDirectQuestionBattleMode = isGrammarDirectQuestionBattleMode;
window.isGrammarChoiceBattleMode = isGrammarChoiceBattleMode;
window.grammarBattleUsesVirtualKeyboard = grammarBattleUsesVirtualKeyboard;
window.getGrammarVerbAnswerTimeLimit = getGrammarVerbAnswerTimeLimit;
window.getGrammarBattleAnswerTimeLimit = getGrammarBattleAnswerTimeLimit;
window.prepareLaunchGrammarQuestion = prepareLaunchGrammarQuestion;
window.resetLaunchGrammarQuestion = resetLaunchGrammarQuestion;
window.focusLaunchGrammarField = focusLaunchGrammarField;
window.handleLaunchGrammarKey = handleLaunchGrammarKey;
window.checkGrammarBattleAnswer = checkGrammarBattleAnswer;
window.getGrammarBattleModeLabel = getGrammarBattleModeLabel;
window.getGrammarBattlePromptText = getGrammarBattlePromptText;
window.getGrammarBattleErrorMessage = getGrammarBattleErrorMessage;
window.getGrammarBattleReviewEntry = getGrammarBattleReviewEntry;
window.toggleLaunchGrammarReference = toggleLaunchGrammarReference;
window.getGrammarBattleDeckSnapshot = getGrammarBattleDeckSnapshot;
window.filterGrammarTopicReference = filterGrammarTopicReference;
window.showGrammarTopicSearchKeyboard = showGrammarTopicSearchKeyboard;
document.addEventListener('DOMContentLoaded', () => {
    renderGrammarTenseSetupOptions();
    updateGrammarTenseSetupUI();
    renderGrammarConditionalSetupOptions();
    updateGrammarConditionalSetupUI();
    renderGrammarReportedSpeechSetupOptions();
    updateGrammarReportedSpeechSetupUI();
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
