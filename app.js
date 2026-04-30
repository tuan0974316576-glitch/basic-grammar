/* =========================================
   ���� TARGET VOICE SYSTEM (ϴ�ƴ�߉݋) ����
   ========================================= */

// 1. �O������� (Ո�����㌍�H�� MP3 �L��΢�{ duration)
// ��λ: ms (����)
const targetVoiceConfig = [
    { file: 'attack_zone_located.mp3',      duration: 1600 },
    { file: 'affirmative.mp3',      duration: 1150 },
    { file: 'copy_that.mp3',      duration: 800 },
    { file: 'received_your_order.mp3',      duration: 1350 },
    { file: 'locked_and_loaded.mp3',      duration: 1300 },
    { file: 'acknowledged.mp3',      duration: 1300 },
    { file: 'understood.mp3',        duration: 1100 },
    { file: 'got_it.mp3',            duration: 800  }, 
    { file: 'fire_zone_confirmed.mp3', duration: 1600 }, 
    { file: 'roger_that.mp3',        duration: 1100 } 
];

let currentVoiceBag = [...targetVoiceConfig];
// �� �������Á�ӛ���һ�䲥�^��
let lastPlayedFile = null;

// 3. ��`���� (������)
function getNextTargetVoice() {
    // A. �����Ǭ�Q�ˣ����µ��M
    if (currentVoiceBag.length === 0) {
        currentVoiceBag = [...targetVoiceConfig];
        console.log("Voice bag empty! Reshuffling...");
    }

    // B. �S�C��һ������
    let randomIndex = Math.floor(Math.random() * currentVoiceBag.length);
    let selectedVoice = currentVoiceBag[randomIndex];

    // ���� C. ��ײ�C�� (�P�I�޸�) ����
    // ������еĄ��õ�춡���һ�䡹 (ֻ���l���ړQ�´��ĵ�һ��)
    // ���Ҵ��e���г��^ 1 ���x�� (����� 1 ���ͱܟo�ɱ�)
    if (lastPlayedFile && selectedVoice.file === lastPlayedFile && currentVoiceBag.length > 1) {
        console.log(`Avoided repeat of ${selectedVoice.file}, picking next one.`);
        
        // ����ֱ�ӣ������x�� (�����S�y��δ�������߅����һ�ӂS�S�C)
        randomIndex = (randomIndex + 1) % currentVoiceBag.length;
        selectedVoice = currentVoiceBag[randomIndex];
    }

    // D. ӛ��@�β���ʲ�N�����´Ιz��
    lastPlayedFile = selectedVoice.file;
    
    // E. �Ĵ����Ƴ�
    currentVoiceBag.splice(randomIndex, 1);
    
    return selectedVoice;
}
let currentPracticeMode = 'READING'; // �A�Oģʽ
let recognition = null; // �Z���R�e���
let speakingMediaRecorder = null;
let speakingRecordedChunks = [];
let speakingAudioStream = null;
let speakingPcmAudioContext = null;
let speakingPcmSource = null;
let speakingPcmProcessor = null;
let speakingPcmSilenceGain = null;
let speakingPcmChunks = [];
let speakingPcmSampleRate = 16000;
let speakingPcmClosePromise = Promise.resolve();
let speakingSilenceAudioContext = null;
let speakingSilenceAnalyser = null;
let speakingSilenceSource = null;
let speakingSilenceCheckInterval = null;
let speakingSilenceDetectedVoice = false;
let speakingVoiceDetectionFrames = 0;
let speakingRecordingStartedAt = 0;
let speakingVoiceStartedAt = 0;
let speakingMinVoiceWindowMs = 2200;
let speakingManualStopMinMs = 2000;
let speakingRecordingTimeout = null;
let speakingTailStopTimeout = null;
let speakingWaveLevel = 0;
let speakingWaveVisualLevel = 0;
let speakingLatestRms = 0;
let speakingLastSampleAt = 0;
let speakingNoiseFloorRms = 0.006;
let speakingNoiseSampleCount = 0;
let speakingSilenceMs = 1000;
let speakingTailBufferMs = 450;
let speakingSilenceThreshold = 0.018;
let speakingMaxRecordingMs = 10000;
let speakingUseAzureAssessment = true;
let speakingNoVoiceTimeout = null;
let speakingNoVoiceTimeoutMs = 5000;
let speakingLastRecordedAudioBase64 = '';
let speakingDebriefActiveLogIndex = null;
let speakingDebriefPlaybackAudio = null;
let speakingDebriefPlaybackObjectUrl = '';
let speakingDebriefBgmRestoreVolume = null;
const listeningTtsCache = new Map();
const listeningPreparedAudioCache = new Map();
let listeningPlaybackAudio = null;
let listeningPlaybackObjectUrl = '';
let listeningPlaybackBoost = null;
let listeningPlaybackToken = 0;
let listeningTimerStartTimeout = null;
const LISTENING_VOICE_GAIN = 1.2;
const LISTENING_VOICE_ROTATION = [
    {
        label: 'Ava (Canada)',
        voiceName: 'en-US-AvaMultilingualNeural',
        accentLocale: 'en-CA'
    },
    {
        label: 'Andrew (US)',
        voiceName: 'en-US-AndrewMultilingualNeural',
        accentLocale: 'en-US'
    },
    {
        label: 'Seraphina (Australia)',
        voiceName: 'de-DE-SeraphinaMultilingualNeural',
        accentLocale: 'en-AU'
    },
    {
        label: 'Florian (UK)',
        voiceName: 'de-DE-FlorianMultilingualNeural',
        accentLocale: 'en-GB'
    }
];
let listeningVoiceCycleIndex = null;
let listeningPromptVoiceKey = '';
let listeningPromptVoiceProfile = null;
let pendingBattleVocab = null;
let userSentenceProgress = { listening: {}, speaking: {} };
let battleLog = [];
let battleUsedWordKeys = new Set();
let attackResolutionLocked = false;
const DEFAULT_SPEAKING_ASSESSMENT_BASE = 'http://localhost:8787';
const SPEAKING_PASS_SCORE = 70;

function isCoarseTouchDevice() {
    return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
}

function isTabletLikeDevice() {
    const shortestSide = Math.min(window.innerWidth, window.innerHeight);
    const longestSide = Math.max(window.innerWidth, window.innerHeight);
    return isCoarseTouchDevice() && (shortestSide >= 768 || longestSide >= 1024);
}

function getDesiredOrientationMode() {
    if (!isCoarseTouchDevice()) return null;
    return isTabletLikeDevice() ? 'landscape' : 'portrait';
}

function tryLockOrientation(mode) {
    if (!mode || !screen.orientation || typeof screen.orientation.lock !== 'function') return;
    const lockValue = mode === 'landscape' ? 'landscape-primary' : 'portrait-primary';
    screen.orientation.lock(lockValue).catch(() => {});
}

function updateOrientationGuard() {
    const guard = document.getElementById('orientation-guard');
    const guardMsg = document.getElementById('orientation-guard-msg');
    if (!guard || !guardMsg) return;

    const desiredMode = getDesiredOrientationMode();
    if (!desiredMode) {
        guard.style.display = 'none';
        return;
    }

    tryLockOrientation(desiredMode);

    const currentMode = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    const isValid = currentMode === desiredMode;
    guardMsg.textContent = desiredMode === 'landscape'
        ? 'LANDSCAPE MODE REQUIRED FOR TABLETS'
        : 'PORTRAIT MODE REQUIRED FOR PHONES';
    guard.style.display = isValid ? 'none' : 'flex';
}

window.addEventListener('load', updateOrientationGuard);
window.addEventListener('resize', updateOrientationGuard);
window.addEventListener('orientationchange', updateOrientationGuard);

    // ���� �������Ԅ������� ����
    // �@�δ��a���߱����� Level (L1, L2...), �ԄӰ�Ӣ����ĸ A-Z ����
    function sortDatabase() {
        // �z�� VOCAB_DB �Ƿ����
        if (typeof VOCAB_DB === 'undefined') return;

        // �߱�ÿһ�� Level (L1, L2, L3...)
        for (let levelKey in VOCAB_DB) {
            // ʹ�� JavaScript ԭ���� sort ����
            VOCAB_DB[levelKey].sort((a, b) => {
                // ��Ӣ���D������ (LowerCase) ����^���_�� 'a' �� 'A' �������_����
                return a.en.toLowerCase().localeCompare(b.en.toLowerCase());
            });
        }
        console.log("�}Ŀ�����ԄӰ���ĸ������ɣ�");
    }

    // ������������
    sortDatabase();
    // ���� ������a�Y�� ����

    function getSpeakingAssessmentBaseUrl() {
        const configBase = (window.APP_CONFIG && window.APP_CONFIG.SPEAKING_API_BASE || '').trim();
        if (configBase) return configBase.replace(/\/$/, '');

        const explicitBase = (localStorage.getItem('speaking_api_base') || '').trim();
        if (explicitBase) return explicitBase.replace(/\/$/, '');

        const host = window.location.hostname;
        const isDesktopWindows = /Windows/i.test(navigator.userAgent);
        if (host === 'localhost' || host === '127.0.0.1' || isDesktopWindows) {
            return DEFAULT_SPEAKING_ASSESSMENT_BASE;
        }

        return '';
    }

function canUseAzureSpeakingAssessment() {
        return Boolean(
            speakingUseAzureAssessment &&
            getSpeakingAssessmentBaseUrl() &&
            navigator.mediaDevices &&
            typeof navigator.mediaDevices.getUserMedia === 'function' &&
            window.MediaRecorder
        );
    }

    function normalizeAssessmentWord(word) {
        return String(word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    function getWordRoots(word) {
        const normalized = normalizeAssessmentWord(word);
        const roots = new Set();
        if (!normalized) return roots;

        roots.add(normalized);
        if (normalized.endsWith('ies') && normalized.length > 3) roots.add(normalized.slice(0, -3) + 'y');
        if (normalized.endsWith('es') && normalized.length > 2) roots.add(normalized.slice(0, -2));
        if (normalized.endsWith('s') && normalized.length > 1) roots.add(normalized.slice(0, -1));
        return roots;
    }

    function findTargetWordAssessment(words, targetWord) {
        const targetRoots = getWordRoots(targetWord);
        if (!targetRoots.size) return null;

        return (words || []).find(wordEntry => {
            const wordRoots = getWordRoots(wordEntry.word);
            for (const root of targetRoots) {
                if (wordRoots.has(root)) return true;
            }
            return false;
        }) || null;
    }

    function findClosestWordAssessment(words, targetWord) {
        const normalizedTarget = normalizeAssessmentWord(targetWord);
        if (!normalizedTarget) return null;

        let best = null;
        let bestSimilarity = 0;
        for (const wordEntry of (words || [])) {
            const normalizedWord = normalizeAssessmentWord(wordEntry.word);
            if (!normalizedWord) continue;
            const similarity = calculateSimilarity(normalizedWord, normalizedTarget);
            if (similarity > bestSimilarity) {
                bestSimilarity = similarity;
                best = wordEntry;
            }
        }

        return bestSimilarity >= 0.45 ? { wordAssessment: best, similarity: bestSimilarity } : null;
    }

    function resolveSpeakingTargetAssessment(words, targetWord) {
        const exact = findTargetWordAssessment(words, targetWord);
        if (exact) {
            return { wordAssessment: exact, matchType: 'exact', similarity: 1 };
        }

        const closest = findClosestWordAssessment(words, targetWord);
        if (closest?.wordAssessment) {
            return { wordAssessment: closest.wordAssessment, matchType: 'closest', similarity: closest.similarity };
        }

        return { wordAssessment: null, matchType: 'missing', similarity: 0 };
    }

    function getSpeakingScoreClass(score) {
        if (score < 35) return 'danger';
        if (score < 55) return 'warning';
        return 'success';
    }

    function getSpeakingScoreColor(score) {
        if (score < 35) return 'var(--danger)';
        if (score < 55) return '#fbbf24';
        return 'var(--success)';
    }

    function getSpeakingAssessmentColor(score, errorType = 'None') {
        const normalizedError = String(errorType || 'None').toLowerCase();
        if (normalizedError.includes('omission') || normalizedError.includes('missing')) {
            return 'var(--danger)';
        }
        if (score >= 80) return 'var(--success)';
        if (score >= 40) return '#fbbf24';
        return 'var(--danger)';
    }

    function writeWavString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    function encodeWavFromMonoFloat(samples, sampleRate) {
        const bytesPerSample = 2;
        const blockAlign = bytesPerSample;
        const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
        const view = new DataView(buffer);

        writeWavString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length * bytesPerSample, true);
        writeWavString(view, 8, 'WAVE');
        writeWavString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, 16, true);
        writeWavString(view, 36, 'data');
        view.setUint32(40, samples.length * bytesPerSample, true);

        let offset = 44;
        for (let i = 0; i < samples.length; i++, offset += 2) {
            const sample = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        }

        return new Blob([buffer], { type: 'audio/wav' });
    }

    async function convertBlobToMonoWav(blob, targetSampleRate = 16000) {
        const arrayBuffer = await blob.arrayBuffer();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        try {
            const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
            const offlineContext = new OfflineAudioContext(1, Math.ceil(decoded.duration * targetSampleRate), targetSampleRate);
            const source = offlineContext.createBufferSource();
            const monoBuffer = offlineContext.createBuffer(1, decoded.length, decoded.sampleRate);
            const monoOutput = monoBuffer.getChannelData(0);

            for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
                const input = decoded.getChannelData(channel);
                for (let i = 0; i < input.length; i++) {
                    monoOutput[i] += input[i] / decoded.numberOfChannels;
                }
            }

            source.buffer = monoBuffer;
            source.connect(offlineContext.destination);
            source.start(0);

            const rendered = await offlineContext.startRendering();
            return encodeWavFromMonoFloat(rendered.getChannelData(0), targetSampleRate);
        } finally {
            await audioContext.close();
        }
    }

    async function blobToBase64(blob) {
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = String(reader.result || '');
                const commaIndex = result.indexOf(',');
                resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
            };
            reader.onerror = () => reject(reader.error || new Error('Failed to convert blob to base64.'));
            reader.readAsDataURL(blob);
        });
    }

    function stopSpeakingPcmCapture() {
        if (speakingPcmProcessor) {
            try { speakingPcmProcessor.disconnect(); } catch (_error) {}
            speakingPcmProcessor.onaudioprocess = null;
            speakingPcmProcessor = null;
        }
        if (speakingPcmSource) {
            try { speakingPcmSource.disconnect(); } catch (_error) {}
            speakingPcmSource = null;
        }
        if (speakingPcmSilenceGain) {
            try { speakingPcmSilenceGain.disconnect(); } catch (_error) {}
            speakingPcmSilenceGain = null;
        }
        if (speakingPcmAudioContext) {
            try {
                const closingContext = speakingPcmAudioContext;
                speakingPcmClosePromise = Promise.resolve(closingContext.close()).catch(() => {});
            } catch (_error) {
                speakingPcmClosePromise = Promise.resolve();
            }
            speakingPcmAudioContext = null;
        }
        speakingLatestRms = 0;
        speakingLastSampleAt = 0;
        speakingNoiseFloorRms = 0.006;
        speakingNoiseSampleCount = 0;
    }

    async function startSpeakingPcmCapture() {
        stopSpeakingPcmCapture();
        await speakingPcmClosePromise;
        speakingPcmChunks = [];

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx || !speakingAudioStream) return false;

        speakingPcmAudioContext = new AudioCtx();
        if (speakingPcmAudioContext.state === 'suspended') {
            try {
                await speakingPcmAudioContext.resume();
            } catch (_error) {}
        }
        speakingPcmSampleRate = speakingPcmAudioContext.sampleRate || 44100;
        speakingPcmSource = speakingPcmAudioContext.createMediaStreamSource(speakingAudioStream);
        speakingPcmProcessor = speakingPcmAudioContext.createScriptProcessor(2048, 1, 1);
        speakingPcmSilenceGain = speakingPcmAudioContext.createGain();
        speakingPcmSilenceGain.gain.value = 0;

        speakingPcmProcessor.onaudioprocess = (event) => {
            if (!speakingMediaRecorder || speakingMediaRecorder.state !== 'recording') return;
            const inputBuffer = event.inputBuffer;
            const channelCount = inputBuffer.numberOfChannels || 1;
            const frameCount = inputBuffer.length;
            const monoChunk = new Float32Array(frameCount);

            for (let channel = 0; channel < channelCount; channel++) {
                const channelData = inputBuffer.getChannelData(channel);
                for (let i = 0; i < frameCount; i++) {
                    monoChunk[i] += channelData[i] / channelCount;
                }
            }

            let sum = 0;
            for (let i = 0; i < frameCount; i++) {
                sum += monoChunk[i] * monoChunk[i];
            }
            const rawRms = Math.sqrt(sum / frameCount);
            speakingLastSampleAt = Date.now();
            if (!speakingSilenceDetectedVoice && speakingRecordingStartedAt && (speakingLastSampleAt - speakingRecordingStartedAt < 1800)) {
                speakingNoiseSampleCount += 1;
                const alpha = speakingNoiseSampleCount <= 1 ? 1 : 0.18;
                speakingNoiseFloorRms = (speakingNoiseFloorRms * (1 - alpha)) + (rawRms * alpha);
            }
            speakingLatestRms = Math.max(0, rawRms - (speakingNoiseFloorRms * 1.1));
            speakingWaveLevel = speakingLatestRms;
            updateSpeakingWave(Math.min(1, speakingLatestRms / 0.045));
            speakingPcmChunks.push(monoChunk);
        };

        speakingPcmSource.connect(speakingPcmProcessor);
        speakingPcmProcessor.connect(speakingPcmSilenceGain);
        speakingPcmSilenceGain.connect(speakingPcmAudioContext.destination);
        return true;
    }

    function buildSpeakingPcmWavBlob() {
        if (!speakingPcmChunks.length) {
            return encodeWavFromMonoFloat(new Float32Array(0), speakingPcmSampleRate || 16000);
        }

        const totalLength = speakingPcmChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const combined = new Float32Array(totalLength);
        let offset = 0;

        for (const chunk of speakingPcmChunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
        }

        return encodeWavFromMonoFloat(combined, speakingPcmSampleRate || 16000);
    }

    function stopSpeakingSilenceMonitor() {
        if (speakingSilenceCheckInterval) {
            clearInterval(speakingSilenceCheckInterval);
            speakingSilenceCheckInterval = null;
        }
        if (speakingSilenceSource) {
            try { speakingSilenceSource.disconnect(); } catch (_error) {}
            speakingSilenceSource = null;
        }
        if (speakingSilenceAnalyser) {
            try { speakingSilenceAnalyser.disconnect(); } catch (_error) {}
            speakingSilenceAnalyser = null;
        }
        if (speakingSilenceAudioContext) {
            try { speakingSilenceAudioContext.close(); } catch (_error) {}
            speakingSilenceAudioContext = null;
        }
        speakingSilenceDetectedVoice = false;
        speakingVoiceDetectionFrames = 0;
        speakingVoiceStartedAt = 0;
        if (speakingTailStopTimeout) {
            clearTimeout(speakingTailStopTimeout);
            speakingTailStopTimeout = null;
        }
        speakingWaveLevel = 0;
        updateSpeakingWave(0);
    }

    function startSpeakingSilenceMonitor() {
        if (!speakingAudioStream || !speakingMediaRecorder) return;

        stopSpeakingSilenceMonitor();
        let silenceStartedAt = 0;

        speakingSilenceCheckInterval = setInterval(() => {
            if (!speakingMediaRecorder || speakingMediaRecorder.state !== 'recording') return;

            const now = Date.now();
            const rms = speakingLatestRms;
            if (speakingLastSampleAt && (now - speakingLastSampleAt > 250)) {
                speakingLatestRms = 0;
                speakingWaveLevel = 0;
                updateSpeakingWave(0);
            }

            const voiceGate = Math.max(speakingSilenceThreshold * 0.45, 0.0065);
            const sustainedVoiceGate = Math.max(voiceGate * 0.72, 0.0045);
            if (rms >= voiceGate) {
                speakingVoiceDetectionFrames += 1;
            } else if (!speakingSilenceDetectedVoice && speakingVoiceDetectionFrames > 0) {
                speakingVoiceDetectionFrames -= 1;
            }

        if (!speakingSilenceDetectedVoice && speakingVoiceDetectionFrames >= 2) {
            speakingSilenceDetectedVoice = true;
            speakingVoiceStartedAt = now;
            console.log(`[Speaking Debug] Voice detected at ${now - speakingRecordingStartedAt}ms (rms=${rms.toFixed(4)})`);
            if (speakingNoVoiceTimeout) {
                clearTimeout(speakingNoVoiceTimeout);
                speakingNoVoiceTimeout = null;
            }
        }

            if (speakingSilenceDetectedVoice && rms >= sustainedVoiceGate) {
                silenceStartedAt = 0;
                if (speakingTailStopTimeout) {
                    clearTimeout(speakingTailStopTimeout);
                    speakingTailStopTimeout = null;
                }
                return;
            }

            if (!speakingSilenceDetectedVoice) return;

            if (speakingVoiceStartedAt && (now - speakingVoiceStartedAt < speakingMinVoiceWindowMs)) {
                silenceStartedAt = 0;
                return;
            }

            if (!silenceStartedAt) {
                silenceStartedAt = now;
                return;
            }

            if (now - silenceStartedAt >= speakingSilenceMs) {
                if (!speakingTailStopTimeout) {
                    console.log(`[Speaking Debug] Silence stop triggered after ${now - speakingRecordingStartedAt}ms`);
                    speakingTailStopTimeout = setTimeout(() => {
                        speakingTailStopTimeout = null;
                        if (speakingMediaRecorder && speakingMediaRecorder.state === 'recording') {
                            console.log(`[Speaking Debug] Tail buffer stop after ${now - speakingRecordingStartedAt + speakingTailBufferMs}ms`);
                            speakingMediaRecorder.stop();
                        }
                    }, speakingTailBufferMs);
                }
            }
        }, 50);
    }

    function stopSpeakingAudioStream() {
        if (speakingRecordingTimeout) {
            clearTimeout(speakingRecordingTimeout);
            speakingRecordingTimeout = null;
        }
        if (speakingTailStopTimeout) {
            clearTimeout(speakingTailStopTimeout);
            speakingTailStopTimeout = null;
        }
        if (speakingNoVoiceTimeout) {
            clearTimeout(speakingNoVoiceTimeout);
            speakingNoVoiceTimeout = null;
        }
        stopSpeakingSilenceMonitor();
        stopSpeakingPcmCapture();
        if (speakingAudioStream) {
            speakingAudioStream.getTracks().forEach(track => track.stop());
            speakingAudioStream = null;
        }
    }

function updateSpeakingWave(level = 0) {
    const waveEl = document.getElementById('speaking-wave');
    if (!waveEl) return;
    const clamped = Math.max(0, Math.min(1, level));
    const eased = Math.pow(clamped, 0.7);
    speakingWaveVisualLevel = (speakingWaveVisualLevel * 0.72) + (eased * 0.28);
    const visual = Math.max(0, Math.min(1, speakingWaveVisualLevel));
    waveEl.style.display = 'block';
    waveEl.style.setProperty('--wave-opacity', (0.52 + visual * 0.12).toFixed(3));
    waveEl.style.setProperty('--wave-height', `${18 + visual * 34}px`);
    waveEl.style.setProperty('--wave-glow', `${7 + visual * 14}px`);
    waveEl.style.setProperty('--wave-scale', (0.015 + visual * 0.985).toFixed(3));
    waveEl.style.setProperty('--wave-offset', `${visual * 7}px`);
    waveEl.style.setProperty('--wave-main-opacity', (0.52 + visual * 0.28).toFixed(3));
    waveEl.style.setProperty('--wave-accent-opacity', (0.42 + visual * 0.26).toFixed(3));
}
function showSpeakingAzureUnavailable(message) {
    launchTimerPaused = false;
    const qDisplay = document.getElementById('q-display');
    const msgArea = document.getElementById('msg-area');
    const micBtn = document.getElementById('mic-btn');
    if (micBtn) micBtn.classList.remove('recording');
    updateSpeakingWave(0);
    if (qDisplay) {
        qDisplay.innerText = "(Azure pronunciation backend unavailable)";
        qDisplay.style.color = "#fbbf24";
        qDisplay.style.fontSize = "18px";
    }
    if (msgArea) {
        msgArea.innerText = message || "AZURE LINK OFFLINE";
        msgArea.style.color = "#f59e0b";
    }
    setSpeakingUiState('error', message || "AZURE LINK OFFLINE", '--');
}
function clearSpeakingAssessmentDetail() {
    const detailEl = document.getElementById('speaking-detail');
    const detailTitleEl = document.getElementById('speaking-detail-title');
    const detailBodyEl = document.getElementById('speaking-detail-body');
    if (!detailEl || !detailTitleEl || !detailBodyEl) return;
    detailEl.style.display = 'none';
    detailTitleEl.textContent = 'PRONUNCIATION BREAKDOWN';
    detailBodyEl.innerHTML = '';
}

function renderSpeakingAssessmentDetail(wordAssessment, matchType = 'exact', sentenceScore = null) {
    const detailEl = document.getElementById('speaking-detail');
    const detailTitleEl = document.getElementById('speaking-detail-title');
    const detailBodyEl = document.getElementById('speaking-detail-body');
    if (!detailEl || !detailTitleEl || !detailBodyEl) return;

    if (!wordAssessment) {
        if (sentenceScore == null) {
            clearSpeakingAssessmentDetail();
            return;
        }

        detailTitleEl.textContent = 'SENTENCE // PRONUNCIATION SIGNAL';
        detailBodyEl.innerHTML = `<span class="speaking-chip" style="color:${getSpeakingScoreColor(sentenceScore)}"><span class="speaking-chip-label">SENTENCE SCORE</span><span class="speaking-chip-score">${Math.round(sentenceScore)}</span></span><span class="speaking-chip" style="color:#94a3b8"><span class="speaking-chip-label">WORD BREAKDOWN UNAVAILABLE</span></span>`;
        detailEl.style.display = 'block';
        return;
    }

    const phonemes = Array.isArray(wordAssessment.phonemes) ? wordAssessment.phonemes : [];
    const syllables = Array.isArray(wordAssessment.syllables) ? wordAssessment.syllables : [];
    const breakdown = phonemes.length ? phonemes : syllables;
    const labelKey = phonemes.length ? 'phoneme' : 'syllable';
    const breakdownLabel = phonemes.length ? 'PHONEME' : 'SYLLABLE';
    const matchLabel = matchType === 'closest' ? ' // CLOSEST MATCH' : '';

    detailTitleEl.textContent = `${(wordAssessment.word || 'TARGET').toUpperCase()} // ${breakdownLabel} BREAKDOWN${matchLabel}`;
    detailBodyEl.innerHTML = breakdown.length
        ? breakdown.map(item => {
            const label = String(item[labelKey] || '?');
            const score = Math.round(item.accuracy ?? 0);
            const color = getSpeakingAssessmentColor(score, item.errorType);
            return `<span class="speaking-chip" style="color:${color}"><span class="speaking-chip-label">${label}</span><span class="speaking-chip-score">${score}</span></span>`;
        }).join('')
        : `<span class="speaking-chip" style="color:${getSpeakingAssessmentColor(Math.round(wordAssessment.accuracy ?? sentenceScore ?? 0), wordAssessment.errorType)}"><span class="speaking-chip-label">WORD SCORE</span><span class="speaking-chip-score">${Math.round(wordAssessment.accuracy ?? sentenceScore ?? 0)}</span></span><span class="speaking-chip" style="color:#94a3b8"><span class="speaking-chip-label">NO PHONEME DATA</span></span>`;
    detailEl.style.display = 'block';
}

function setSpeakingUiState(state = 'idle', statusText = 'VOICE LINK STANDBY', scoreText = '--') {
    const statusEl = document.getElementById('speaking-status');
    const waveEl = document.getElementById('speaking-wave');
    const subhintEl = document.getElementById('launch-subhint');
    const scorebarEl = document.getElementById('speaking-scorebar');
    const scoreValueEl = document.getElementById('speaking-score-value');
    const isSpeaking = currentPracticeMode === 'SPEAKING';
    if (!statusEl || !subhintEl || !scorebarEl || !scoreValueEl) return;
    if (!isSpeaking) {
        statusEl.style.display = 'none';
        if (waveEl) waveEl.style.display = 'none';
        subhintEl.style.display = '';
        scorebarEl.style.display = 'none';
        statusEl.className = 'speaking-status';
        scoreValueEl.textContent = '--';
        scoreValueEl.style.color = '#f8fafc';
        clearSpeakingAssessmentDetail();
        return;
    }
    statusEl.style.display = 'inline-flex';
    subhintEl.style.display = 'none';
    scorebarEl.style.display = 'flex';
    statusEl.className = ('speaking-status ' + state).trim();
    statusEl.textContent = statusText;
    statusEl.style.color = (state === 'recording' || (typeof statusText === 'string' && statusText.startsWith('VOICE LINK ACTIVE')))
        ? '#ffffff'
        : '';
    scoreValueEl.textContent = scoreText;
    scoreValueEl.style.color = scoreText === '--' ? '#f8fafc' : getSpeakingScoreColor(parseInt(scoreText, 10) || 0);
    if (scoreText === '--') clearSpeakingAssessmentDetail();
}

    // =========================================
    // ���� �e��ӛ�ϵ�y (Wrong Words Tracker) ����
    // Firebase ���� (�����Ñ�)��localStorage �� fallback (Guest/�x��)
    // =========================================

    const WRONG_WORDS_LS_KEY = 'battleship_wrongWords';

    // �� localStorage �d���e��ӛ�
    function loadWrongWordsFromLocal() {
        try {
            const data = localStorage.getItem(WRONG_WORDS_LS_KEY);
            if (data) wrongWordsDB = JSON.parse(data);
        } catch (e) {
            console.warn('loadWrongWordsFromLocal error:', e);
        }
    }

    // �����e��ӛ䛵� localStorage
    function saveWrongWordsToLocal() {
        try {
            localStorage.setItem(WRONG_WORDS_LS_KEY, JSON.stringify(wrongWordsDB));
        } catch (e) {
            console.warn('saveWrongWordsToLocal error:', e);
        }
    }

    // �� Firebase �d���e��ӛ� (�����Ñ�)
    function loadWrongWordsFromFirebase() {
        if (!window.myPlayerId || !window.db) return;
        const { ref, get } = window.firebaseModules;
        const wrongRef = ref(window.db, 'users/' + window.myPlayerId + '/wrongWords');
        get(wrongRef).then((snapshot) => {
            if (snapshot.exists()) {
                wrongWordsDB = snapshot.val();
                saveWrongWordsToLocal(); // ͬ���� localStorage �� backup
                console.log('Loaded wrong words from Firebase:', wrongWordsDB);
            }
        }).catch(e => console.warn('loadWrongWordsFromFirebase error:', e));
    }

    // ͬ���e��ӛ䛵� Firebase
    function syncWrongWordsToFirebase() {
        if (!window.myPlayerId || !window.db) return;
        const { ref, set } = window.firebaseModules;
        const wrongRef = ref(window.db, 'users/' + window.myPlayerId + '/wrongWords');
        set(wrongRef, wrongWordsDB).catch(e => console.warn('syncWrongWordsToFirebase error:', e));
    }

    // ӛ�һ���e��
    function saveWrongWord(skill, level, wordEn) {
        if (!wrongWordsDB[skill]) wrongWordsDB[skill] = {};
        if (!wrongWordsDB[skill][level]) wrongWordsDB[skill][level] = {};
        if (!wrongWordsDB[skill][level][wordEn]) {
            wrongWordsDB[skill][level][wordEn] = 1;
        } else {
            wrongWordsDB[skill][level][wordEn]++;
        }
        saveWrongWordsToLocal();
        syncWrongWordsToFirebase();
    }

    // �Ƴ�һ���e�� (�����)
    function removeWrongWord(skill, level, wordEn) {
        if (wrongWordsDB[skill] && wrongWordsDB[skill][level] && wrongWordsDB[skill][level][wordEn]) {
            delete wrongWordsDB[skill][level][wordEn];
            // ��������
            if (Object.keys(wrongWordsDB[skill][level]).length === 0) delete wrongWordsDB[skill][level];
            if (Object.keys(wrongWordsDB[skill]).length === 0) delete wrongWordsDB[skill];
            saveWrongWordsToLocal();
            syncWrongWordsToFirebase();
        }
    }

    // �@ȡ��ǰ skill+level ���e�� vocab ����б�
    function getWrongWordsForSession(skill, level) {
        if (!wrongWordsDB[skill] || !wrongWordsDB[skill][level]) return [];
        const wrongKeys = Object.keys(wrongWordsDB[skill][level]);
        if (wrongKeys.length === 0) return [];
        const levelVocab = VOCAB_DB[level];
        if (!levelVocab) return [];
        return levelVocab.filter(v => wrongKeys.includes(v.en));
    }

    // ���� CRITICAL FIX: Declare variables BEFORE calling loadWrongWordsFromLocal ����
    let wrongWordsDB = {};   // { READING: { L1: { "apple": 1 }, ... }, LISTENING: {...}, SPEAKING: {...} }
    let wrongWordsDeck = []; // ���ȳ��e�� deck

    // ��ʼ�����ȏ� localStorage �d��
    loadWrongWordsFromLocal();

    // ���� �e��ӛ�ϵ�y�Y�� ����


    // ... ����ӻ���ԭ���Ĵ��a ...
    let lastProcessedTimestamp = 0; // �� ��������ֹ���}̎��ͬһ����
let battleUnsubscribe = null; // �� ���������T������Y�еıO ��
let turnCounter = 0; // �غ�Ӌ����
let playerEnergy = 0; // ���� ��� Energy ����
let aiEnergy = 0; // ���� AI Energy ����
let isTargeting = false;
    // --- 1. Firebase �O�� (����������Y��) ---
    const firebaseConfig = {
        apiKey: "AIzaSyBdfTgb7FpkYdgjvrYWQ0jr-N-1fAaW9Q0",
        authDomain: "vocabularyxdungeon.firebaseapp.com",
        databaseURL: "https://vocabularyxdungeon-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "vocabularyxdungeon",
        storageBucket: "vocabularyxdungeon.appspot.com",
        messagingSenderId: "834761939928",
        appId: "1:834761939928:web:4591dcd9650ec99746f0ad"
    };

    // --- 2. �[�򅢔� ---
    const GRID_SIZE = 10;

/* =========================================
       ���� 1. ��Ş���� (�Ѹ��´���T���ŵ�3) ����
       ========================================= */
    // ���� �N���Şӳ��� ����
    const RACE_SHIP_IMAGES = {
        'VANGUARDS': {
            ships: ['1x2.png', '1x3.png', '1x3+1.png', '1x4.png', '2x4.png'],
            damaged: ['1x2_damaged.png', '1x3_damaged.png', '1x3+1_damaged.png', '1x4_damaged.png', '2x4_damaged.png']
        },
        'AURELIANS': {
            ships: ['1x2_aurelians.png', '2+1_aurelians.png', '1+2_aurelians.png', '1+3_aurelians.png', '3x3_aurelians.png'],
            damaged: ['1x2_aurelians_damaged.png', '2+1_aurelians_damaged.png', '1+2_aurelians_damaged.png', '1+3_aurelians_damaged.png', '3x3_aurelians_damaged.png']
        },
        'CAUSTICS': {
            ships: ['1x2.png', '1x3.png', '1x3+1.png', '1x4.png', '2x4.png'], // TODO: ���� Caustics �DƬ
            damaged: ['1x2_damaged.png', '1x3_damaged.png', '1x3+1_damaged.png', '1x4_damaged.png', '2x4_damaged.png']
        }
    };

    // ���� �ӑB���� FLEET ���� ����
    function getFleetConfig(race = 'VANGUARDS') {
        const images = RACE_SHIP_IMAGES[race] || RACE_SHIP_IMAGES['VANGUARDS'];

        if (race === 'AURELIANS') {
            // Aurelians ����ͬ�đ�Ş����
            return [
                // 1. 1x2 (��׃)
                {
                    width: 1, height: 2, img: images.ships[0],
                    voiceId: null // �� Aurelians ���r�o�Z��
                },
                // 2. 2+1 (�� - ���ϡ����¡�����)
                {
                    width: 2, height: 2, img: images.ships[1], custom: true,
                    layoutV: [1, 0, 1, 1],
                    layoutH: [0, 1, 1, 1],
                    voiceId: null // �� Aurelians ���r�o�Z��
                },
                // 3. 1+2 (����1��+��߅2��)
                {
                    width: 2, height: 2, img: images.ships[2], custom: true,
                    layoutV: [0, 1, 1, 1],
                    layoutH: [1, 1, 0, 1],
                    voiceId: null // �� Aurelians ���r�o�Z��
                },
                // 4. 1+3 (�� - VERTICAL:����+��߅3��, HORIZONTAL:����3��+����1��, 2x3)
                {
                    width: 2, height: 3, img: images.ships[3], custom: true,
                    layoutV: [1, 1, 0, 1, 0, 1],
                    layoutH: [1, 1, 1, 1, 0, 0],
                    voiceId: null // �� Aurelians ���r�o�Z��
                },
                // 5. 3x3 (��׃)
                {
                    width: 3, height: 3, img: images.ships[4],
                    voiceId: null // �� Aurelians ���r�o�Z��
                }
            ];
        } else {
            // Vanguards / Caustics ʹ�Ø˜�����
            return [
                // 1. GHOST (1x2)
                {
                    width: 1, height: 2, img: images.ships[0],
                    voiceId: 'ship-voice-0'
                },
                // 2. STRIKER (1x3)
                {
                    width: 1, height: 3, img: images.ships[1],
                    voiceId: 'ship-voice-1'
                },
                // 3. SPECTRE (3+1 "T-Shape")
                {
                    width: 2, height: 3, img: images.ships[2], custom: true,
                    layoutV: [1, 0, 1, 1, 1, 0],
                    layoutH: [0, 1, 0, 1, 1, 1],
                    voiceId: 'ship-voice-4'
                },
                // 4. DREADNOUGHT (1x4)
                {
                    width: 1, height: 4, img: images.ships[3],
                    voiceId: 'ship-voice-2'
                },
                // 5. DESTROYER (2x4)
                {
                    width: 2, height: 4, img: images.ships[4],
                    voiceId: 'ship-voice-3'
                }
            ];
        }
    }

    // ���� �ӑB���� DAMAGED_IMAGES ����
    function getDamagedImages(race = 'VANGUARDS') {
        const images = RACE_SHIP_IMAGES[race] || RACE_SHIP_IMAGES['VANGUARDS'];
        return images.damaged;
    }

    // ���� ��ʼ�� FLEET �� DAMAGED_IMAGES ����
    let FLEET = getFleetConfig('VANGUARDS'); // �A�Oʹ�� Vanguards
    let DAMAGED_IMAGES = getDamagedImages('VANGUARDS');
    let ENEMY_DAMAGED_IMAGES = getDamagedImages('VANGUARDS'); // ���� AI ���ֵ��ܓp�DƬ ����

    // ���� �A�d Damaged �DƬ���������t ����
    function preloadDamagedImages() {
        const allImages = [...DAMAGED_IMAGES, ...ENEMY_DAMAGED_IMAGES];
        allImages.forEach(src => {
            if (src) {
                const img = new Image();
                img.src = src;
            }
        });
    }

    const BATTLE_EFFECT_IMAGE_SOURCES = [
        'missile_sprite.png',
        'close.png',
        'nuke_1.png',
        'nuke_2.png'
    ];

    const BATTLE_EFFECT_AUDIO_IDS = [
        'laser-sfx',
        'hit-sfx',
        'missile-flying-sfx',
        'nuke-ready-sfx',
        'nuke-launch-sfx',
        'nuke-detected-sfx',
        'destroy-sfx'
    ];

    const preloadedBattleEffectImages = [];
    let battleEffectAssetsPreloaded = false;

    function preloadBattleEffectAssets() {
        if (battleEffectAssetsPreloaded) return;
        battleEffectAssetsPreloaded = true;

        BATTLE_EFFECT_IMAGE_SOURCES.forEach(src => {
            const img = new Image();
            img.decoding = 'async';
            img.src = src;
            preloadedBattleEffectImages.push(img);

            if (typeof img.decode === 'function') {
                img.decode().catch(() => {});
            }
        });

        BATTLE_EFFECT_AUDIO_IDS.forEach(id => {
            const audio = document.getElementById(id);
            if (!audio) return;
            audio.preload = 'auto';
            try {
                audio.load();
            } catch (_) {}
        });

        preloadEffekseerEffect('vanguardsNuke');
        preloadEffekseerEffect('missileImpact');
        preloadEffekseerEffect('vanguardsNormalStrike');
        preloadEffekseerEffect('normalAttack');
        preloadEffekseerEffect('aureliansNormalAttack');
    }

   

    // ȫ��׃������ǰʹ�õ����ֱ�

    // =========================================
    // ���� RANK TABLE & XP SYSTEM ����
    // =========================================
    const RANK_TABLE = [
        { minXP: 0, name: 'RECRUIT', zh: '新兵', iconFile: '01_recruit.png' },
        { minXP: 3000, name: 'CADET', zh: '軍校生', iconFile: '02_cadet.png' },
        { minXP: 8000, name: 'PRIVATE', zh: '列兵', iconFile: '03_private.png' },
        { minXP: 15000, name: 'TROOPER', zh: '士兵', iconFile: '04_trooper.png' },
        { minXP: 25000, name: 'CORPORAL', zh: '下士', iconFile: '05_corporal.png' },
        { minXP: 38000, name: 'SERGEANT', zh: '中士', iconFile: '06_sergeant.png' },
        { minXP: 55000, name: 'CHIEF', zh: '軍士長', iconFile: '07_chief.png' },
        { minXP: 75000, name: 'ENSIGN', zh: '少尉', iconFile: '08_ensign.png' },
        { minXP: 100000, name: 'WARRANT', zh: '准尉', iconFile: '09_warrant.png' },
        { minXP: 130000, name: 'LIEUTENANT', zh: '中尉', iconFile: '10_lieutenant.png' },
        { minXP: 165000, name: 'CAPTAIN', zh: '上尉', iconFile: '11_captain.png' },
        { minXP: 205000, name: 'MAJOR', zh: '少校', iconFile: '12_major.png' },
        { minXP: 250000, name: 'COLONEL', zh: '上校', iconFile: '13_colonel.png' },
        { minXP: 300000, name: 'COMMANDER', zh: '指揮官', iconFile: '14_commander.png' },
        { minXP: 360000, name: 'BRIGADIER', zh: '准將', iconFile: '15_brigadier.png' },
        { minXP: 430000, name: 'COMMODORE', zh: '準將提督', iconFile: '16_commodore.png' },
        { minXP: 510000, name: 'GENERAL', zh: '將軍', iconFile: '17_general.png' },
        { minXP: 600000, name: 'ADMIRAL', zh: '海軍上將', iconFile: '18_admiral.png' },
        { minXP: 700000, name: 'MARSHAL', zh: '元帥', iconFile: '19_marshal.png' },
        { minXP: 820000, name: 'WARLORD', zh: '戰王', iconFile: '20_warlord.png' },
        { minXP: 960000, name: 'ARCHON', zh: '大執政官', iconFile: '21_archon.png' },
        { minXP: 1120000, name: 'TITAN', zh: '泰坦', iconFile: '22_titan.png' },
        { minXP: 1300000, name: 'OVERLORD', zh: '霸王', iconFile: '23_overlord.png' },
        { minXP: 1500000, name: 'LEGEND', zh: '傳奇', iconFile: '24_legend.png' }
    ];

    // ���� Dynamic Color Helper for Leaderboard Icons ����
    function getIconColor(globalRankIndex) {
        if (globalRankIndex === 0) return 'gold';
        if (globalRankIndex >= 1 && globalRankIndex <= 2) return 'silver';
        if (globalRankIndex >= 3 && globalRankIndex <= 9) return 'bronze';
        return 'white';
    }

    function getRankForXP(xp) {
        let rank = RANK_TABLE[0];
        let level = 1;
        for (let i = RANK_TABLE.length - 1; i >= 0; i--) {
            if (xp >= RANK_TABLE[i].minXP) {
                rank = RANK_TABLE[i];
                level = i + 1;
                break;
            }
        }
        const nextXP = (level < RANK_TABLE.length) ? RANK_TABLE[level].minXP : null;
        return { level, name: rank.name, zh: rank.zh, minXP: rank.minXP, nextXP, iconFile: rank.iconFile };
    }

    function getCurrentUserXPValue() {
        if (typeof userTotalXP === 'number' && !Number.isNaN(userTotalXP)) {
            return userTotalXP;
        }
        if (typeof window.userTotalXP === 'number' && !Number.isNaN(window.userTotalXP)) {
            return window.userTotalXP;
        }
        return 0;
    }

    function refreshRankInfoModalIfOpen() {
        const modal = document.getElementById('rank-info-modal');
        if (modal && modal.style.display === 'flex') {
            renderRankInfoModal();
        }
    }

    function syncUserProgressGlobals() {
        window.userTotalXP = userTotalXP;
        window.userSupplies = userSupplies;
        refreshRankInfoModalIfOpen();
    }

    function renderRankInfoModal() {
        const currentXP = getCurrentUserXPValue();
        const currentRank = getRankForXP(currentXP);
        const currentLabelEl = document.getElementById('rank-info-current');
        const listEl = document.getElementById('rank-info-list');
        if (!currentLabelEl || !listEl) return;

        currentLabelEl.innerText = `CURRENT: ${currentRank.name} [${currentRank.zh}] // ${currentXP.toLocaleString()} XP`;
        listEl.innerHTML = RANK_TABLE.map((rank, index) => {
            const isCurrent = currentRank.name === rank.name;
            const nextMinXP = RANK_TABLE[index + 1]?.minXP ?? null;
            const rangeLabel = nextMinXP === null
                ? `${rank.minXP.toLocaleString()}+`
                : `${rank.minXP.toLocaleString()}`;
            const iconPath = `ranking_icon/white/${rank.iconFile}`;

            return `
                <div class="rank-info-row${isCurrent ? ' current' : ''}">
                    <div class="rank-info-threshold">${rangeLabel}</div>
                    <div class="rank-info-main">
                        <img class="rank-info-icon" src="${iconPath}" alt="${rank.name} icon" onerror="this.style.display='none'">
                        <div class="rank-info-name">${rank.name} <span class="rank-info-name-zh">[${rank.zh}]</span></div>
                    </div>
                    <div class="rank-info-badge${isCurrent ? ' current' : ''}">${isCurrent ? 'YOU' : `R${index + 1}`}</div>
                </div>
            `;
        }).join('');

        const currentRow = listEl.querySelector('.rank-info-row.current');
        if (currentRow) {
            requestAnimationFrame(() => {
                currentRow.scrollIntoView({ block: 'center', behavior: 'smooth' });
            });
        }
    }

    function openRankInfoModal() {
        const modal = document.getElementById('rank-info-modal');
        if (!modal) return;
        renderRankInfoModal();
        modal.style.display = 'flex';
        if (typeof playSound === 'function') {
            playSound('deploy-sfx');
        }
    }

    function closeRankInfoModal() {
        const modal = document.getElementById('rank-info-modal');
        if (!modal) return;
        modal.style.display = 'none';
        if (typeof playSound === 'function') {
            playSound('delete-sfx');
        }
    }

    // ���� XP & MASTERY GLOBAL VARIABLES ����
    let userTotalXP = 0;
    // mastery �Y��: { reading: { L1: { "apple": { count: 3, status: 1 } }, ... }, listening: {...}, speaking: {...} }
    let userMastery = { reading: {}, listening: {}, speaking: {} };

    // ���� SUPPLIES SYSTEM ����
    let userSupplies = 0;
    window.userSupplies = 0;

    // ���� PHASE 5: SESSION XP TRACKING ����
    let sessionAnsweringXP = 0; // Tracks XP gained from answering questions in current match
    let sessionSupplies = 0; // Tracks supplies gained from answering questions in current match

    let activeVocabList = [];
    let sessionDeck = [];
    let selectedLevel = 'L1'; // �A�O
    let selectedStageIndex = null;
    let selectedStageLabel = '';
    let tempGameMode = 'AI';  // ����ģʽ�x��
    const STAGE_WORD_COUNT = 25;
    const STAGE_WORD_SESSION_MISS_LIMIT = 2;
    const PVP_SHARED_QUESTION_DECK_SIZE = 100;
    let stageSessionMissCounts = {};
    let lastAskedWordKey = '';

    // --- 3. ȫ��׃�� ---
let deploymentTimerInterval = null; // ��ꇵ�����
let turnTimerInterval = null; // �Á�Ӌ�xλ�� 8 ��
let turnTimeLeft = 10.0;
const TURN_SELECTION_TIME = 10.0;
    var app, db, auth;
    var myPlayerId = null, currentRoomId = null, gameMode = 'AI', playerRole = null, currentOpponentId = null;
    let myGrid = Array(GRID_SIZE*GRID_SIZE).fill(0);
    let enemyGrid = Array(GRID_SIZE*GRID_SIZE).fill(0);
    let enemyShots = [];
    let aiTargetStack = [];
    let aiRadarScannedCenters = new Set();
    let pvpOpponentRadarScannedCenters = new Set();
    let aiRadarIntel = [];
    let currentPhase = 'DEPLOY';
    let deployIndex = 0;
    let isVertical = true;
    let currentTargetIndex = null, timerInterval = null, currentVocab = null;
    let launchTimerTotal = 0;
    let launchTimerTimeLeft = 0;
    let launchTimerPaused = false;
    let speakingProcessingTimeout = null;
    let isMusicPlaying = false;
    let gameTimeouts = [];

    // ���� PVP ANTI-FARMING: Track turn count ����
    let currentTurnCount = 0;

// �� �@��֮ǰ©�������������Ҫ�Ёڣ�VS AI ��������C ��
function setGameTimeout(callback, delay) {
    const id = setTimeout(() => {
        callback();
        // �������ᣬ���б����Ƴ��Լ� (�����������)
        gameTimeouts = gameTimeouts.filter(t => t !== id);
    }, delay);
    gameTimeouts.push(id);
    return id;
}

function getBattleWordKey(word) {
    if (!word || !word.en) return '';
    return `${currentPracticeMode || 'UNKNOWN'}::${selectedLevel || 'L1'}::${word.en.toLowerCase()}`;
}

function pickBattleUniqueWord(wordList) {
    if (!Array.isArray(wordList) || wordList.length === 0) return null;
    const unusedWords = wordList.filter(word => !battleUsedWordKeys.has(getBattleWordKey(word)));
    const pool = unusedWords.length > 0 ? unusedWords : wordList;
    return pool[Math.floor(Math.random() * pool.length)] || null;
}

function pickBattleWordWithCooldown(wordList) {
    if (!Array.isArray(wordList) || wordList.length === 0) return null;
    const basePick = pickBattleUniqueWord(wordList);
    if (!basePick) return null;

    if (wordList.length <= 1 || !lastAskedWordKey) {
        return basePick;
    }

    const filtered = wordList.filter(word => getBattleWordKey(word) !== lastAskedWordKey);
    if (filtered.length === 0) {
        return basePick;
    }

    return pickBattleUniqueWord(filtered) || basePick;
}

function markBattleWordUsed(word) {
    if (word && word.en) {
        const wordKey = getBattleWordKey(word);
        battleUsedWordKeys.add(wordKey);
        lastAskedWordKey = wordKey;
    }
}

function isCurrentStagePrimaryWord(word) {
    if (!word || tempGameMode !== 'AI' || selectedStageIndex === null) return false;
    return getCurrentStagePrimaryWords(currentPracticeMode.toLowerCase()).some(stageWord => stageWord.en === word.en);
}

function getStageSessionMissCount(wordEn) {
    return stageSessionMissCounts[wordEn] || 0;
}

function recordStageSessionMiss(wordEn) {
    if (!wordEn) return;
    stageSessionMissCounts[wordEn] = (stageSessionMissCounts[wordEn] || 0) + 1;
}

function buildPvpQuestionPayload(word, voiceProfile = null) {
    if (!word || !word.en) return null;
    return {
        en: word.en,
        ch: word.ch || '',
        sent: word.sent || word.en,
        listeningAnswer: word.listeningAnswer || null,
        listeningVoiceName: voiceProfile?.voiceName || null,
        listeningAccentLocale: voiceProfile?.accentLocale || null,
        sentenceIndex: Number.isInteger(word.sentenceIndex) ? word.sentenceIndex : 0,
        timestamp: Date.now()
    };
}

function normalizePvpQuestionDeck(deckData) {
    if (Array.isArray(deckData)) {
        return deckData.filter(question => question && question.en);
    }

    if (!deckData || typeof deckData !== 'object') {
        return [];
    }

    return Object.keys(deckData)
        .sort((a, b) => {
            const aNumber = Number(a);
            const bNumber = Number(b);
            if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) {
                return aNumber - bNumber;
            }
            return String(a).localeCompare(String(b));
        })
        .map(key => deckData[key])
        .filter(question => question && question.en);
}

function rememberPvpQuestionDeck(deckData) {
    const deck = normalizePvpQuestionDeck(deckData);
    if (deck.length > 0) {
        pvpQuestionDeck = deck;
    }
    return deck;
}

function hydrateCurrentVocabFromPvpQuestion(payload) {
    if (!payload?.en) return false;
    const baseWord = Array.isArray(activeVocabList)
        ? activeVocabList.find(word => word.en === payload.en)
        : null;

    currentVocab = {
        ...(baseWord || {}),
        en: payload.en,
        ch: payload.ch || baseWord?.ch || '',
        sent: payload.sent || baseWord?.sent || payload.en,
        listeningAnswer: payload.listeningAnswer || null,
        listeningVoiceName: payload.listeningVoiceName || null,
        listeningAccentLocale: payload.listeningAccentLocale || null,
        deckIndex: Number.isInteger(payload.deckIndex) ? payload.deckIndex : null,
        sentenceIndex: Number.isInteger(payload.sentenceIndex) ? payload.sentenceIndex : 0
    };

    markBattleWordUsed(currentVocab);
    return true;
}

function buildPvpQuestionDeck(count = PVP_SHARED_QUESTION_DECK_SIZE) {
    if (!Array.isArray(activeVocabList) || activeVocabList.length === 0) return [];

    const previousCurrentVocab = currentVocab;
    const deck = [];
    let pool = [];

    for (let i = 0; i < count; i++) {
        if (pool.length === 0) {
            pool = shuffleArray(activeVocabList);
        }

        const sourceWord = pool.pop();
        if (!sourceWord) break;

        currentVocab = { ...sourceWord };
        assignSentenceForCurrentVocab();
        const preparedWord = { ...currentVocab };
        const voiceProfile = currentPracticeMode === 'LISTENING'
            ? getCurrentListeningVoiceProfile(preparedWord.sent || preparedWord.en, selectedLevel || 'L1')
            : null;
        const payload = buildPvpQuestionPayload(preparedWord, voiceProfile);
        if (payload) {
            deck.push({
                ...payload,
                deckIndex: deck.length
            });
        }
    }

    currentVocab = previousCurrentVocab;
    return deck;
}

async function ensurePvpQuestionDeckReady(roomData = latestPVPSetupData) {
    if (gameMode !== 'PVP' || !currentRoomId || playerRole !== 'host') return false;
    const existingDeck = rememberPvpQuestionDeck(roomData?.questionDeck);
    if (roomData?.questionDeckReady && existingDeck.length > 0) {
        return true;
    }

    const deck = buildPvpQuestionDeck();
    if (deck.length === 0) return false;

    const { ref, update } = window.firebaseModules;
    await update(ref(db, 'rooms/' + currentRoomId), {
        questionDeck: deck,
        questionDeckReady: true
    });

    latestPVPSetupData = {
        ...(latestPVPSetupData || {}),
        questionDeck: deck,
        questionDeckReady: true
    };
    pvpQuestionDeck = deck;
    pvpLocalQuestionIndex = 0;
    preloadPvpSharedListeningQuestion(deck[0]);
    console.log(`[PVP Question Deck] Ready: ${deck.length} questions`);
    return true;
}

function getPvpDeckQuestion(roomData = latestPVPSetupData, questionIndex = pvpLocalQuestionIndex) {
    const deck = Array.isArray(pvpQuestionDeck) && pvpQuestionDeck.length > 0
        ? pvpQuestionDeck
        : normalizePvpQuestionDeck(roomData?.questionDeck);
    if (!Array.isArray(deck) || deck.length === 0) return null;
    const index = Number.isInteger(questionIndex) ? questionIndex : 0;
    return deck[((index % deck.length) + deck.length) % deck.length] || null;
}

function preloadPvpSharedListeningQuestion(questionPayload) {
    if ((currentPracticeMode || '').toUpperCase() !== 'LISTENING') return;
    const text = String(questionPayload?.sent || questionPayload?.en || '').trim();
    if (!text) return;
    const voiceProfile = questionPayload?.listeningVoiceName
        ? {
            label: 'PVP Shared',
            voiceName: questionPayload.listeningVoiceName,
            accentLocale: questionPayload.listeningAccentLocale || 'en-US'
        }
        : null;
    preloadListeningAzureAudio(text, 'en-US', selectedLevel || 'L1', voiceProfile).then(() => {
        console.log(`[PVP Listening Preload] Ready: ${text}`);
    }).catch(() => {});
}

function getCurrentListeningVoiceProfile(text, levelKey = '') {
    if (
        gameMode === 'PVP' &&
        currentVocab?.listeningVoiceName
    ) {
        return {
            label: 'PVP Shared',
            voiceName: currentVocab.listeningVoiceName,
            accentLocale: currentVocab.listeningAccentLocale || 'en-US'
        };
    }
    return ensureListeningPromptVoiceProfile(text, levelKey);
}

async function refreshLatestPvpRoomData() {
    if (gameMode !== 'PVP' || !currentRoomId || !window.firebaseModules) return null;
    const { ref, get } = window.firebaseModules;
    const snapshot = await get(ref(db, 'rooms/' + currentRoomId));
    const data = snapshot.val();
    if (data) {
        const questionDeck = rememberPvpQuestionDeck(data.questionDeck);
        latestPVPSetupData = questionDeck.length > 0
            ? { ...data, questionDeck }
            : data;
        const nextDeckQuestion = getPvpDeckQuestion(data);
        if (nextDeckQuestion) {
            preloadPvpSharedListeningQuestion(nextDeckQuestion);
        }
    }
    return data;
}

function delayPvpQuestionDeckRetry(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureLocalPvpQuestionDeckReady() {
    if (pvpQuestionDeck.length > 0 || normalizePvpQuestionDeck(latestPVPSetupData?.questionDeck).length > 0) {
        rememberPvpQuestionDeck(latestPVPSetupData?.questionDeck);
        return true;
    }

    if (playerRole === 'host') {
        await ensurePvpQuestionDeckReady(latestPVPSetupData);
        if (pvpQuestionDeck.length > 0) return true;
    }

    for (let attempt = 0; attempt < 6; attempt++) {
        await refreshLatestPvpRoomData().catch(error => {
            console.warn('[PVP Question Deck] Failed to refresh room data:', error);
            return null;
        });
        if (pvpQuestionDeck.length > 0 || normalizePvpQuestionDeck(latestPVPSetupData?.questionDeck).length > 0) {
            rememberPvpQuestionDeck(latestPVPSetupData?.questionDeck);
            return true;
        }
        await delayPvpQuestionDeckRetry(250);
    }

    return false;
}

async function resolvePvpSharedQuestion() {
    if (gameMode !== 'PVP' || !currentRoomId) return false;

    await ensureLocalPvpQuestionDeckReady();

    const question = getPvpDeckQuestion();
    if (!question) {
        console.warn('[PVP Question Deck] Missing local deck question', {
            localDeckSize: Array.isArray(pvpQuestionDeck) ? pvpQuestionDeck.length : 0,
            remoteDeckSize: normalizePvpQuestionDeck(latestPVPSetupData?.questionDeck).length,
            pvpLocalQuestionIndex,
            roomId: currentRoomId,
            role: playerRole
        });
        return false;
    }

    const hydrated = hydrateCurrentVocabFromPvpQuestion(question);
    if (!hydrated) return false;

    pvpLocalQuestionIndex++;
    const nextQuestion = getPvpDeckQuestion();
    if (nextQuestion) {
        preloadPvpSharedListeningQuestion(nextQuestion);
    }
    return true;
}

function updateTurnTimerUI() {
    const bar = document.getElementById('turn-timer-bar');
    const status = document.getElementById('game-status');
    if (bar) {
        const percentage = Math.max(0, (turnTimeLeft / TURN_SELECTION_TIME) * 100);
        bar.style.width = percentage + "%";
    }
    if (status && currentPhase === 'PLAYER_TURN') {
        status.innerHTML = `TURN ${turnCounter} // YOUR MOVE (<span style="color:var(--warning)">${Math.ceil(turnTimeLeft)}s</span>)`;
    }
}

function stopTurnSelectionTimer() {
    if (turnTimerInterval) {
        clearInterval(turnTimerInterval);
        turnTimerInterval = null;
    }
}

function startTurnSelectionTimer(reset = false) {
    const barContainer = document.getElementById('turn-timer-container');
    if (barContainer) barContainer.style.visibility = 'visible';

    if (reset) {
        turnTimeLeft = TURN_SELECTION_TIME;
    }

    stopTurnSelectionTimer();
    updateTurnTimerUI();

    turnTimerInterval = setInterval(() => {
        turnTimeLeft -= 0.1;
        updateTurnTimerUI();

        if (turnTimeLeft <= 0) {
            turnTimeLeft = 0;
            updateTurnTimerUI();
            stopTurnSelectionTimer();
            handleTurnTimeout();
        }
    }, 100);
}

function startEnemyTurn() {
    if (currentPhase === 'GAME_OVER') return;
    attackResolutionLocked = false;
    isTargeting = false;
    currentPhase = 'ENEMY_TURN';
    switchScene('ENEMY');
    document.getElementById('warning-overlay').style.display = 'block';

    if (gameMode === 'AI' && enemyRace === 'VANGUARDS') {
        addAiEnergy(1, 'Turn Start');
    }
    
    // ���� setGameTimeout
    setGameTimeout(aiTakeTurn, 2000);
}

    const TOTAL_HP = 21; 
    let myDamage = 0;    // �ұ����Ў׶�� (��ݔ���M��)
    let enemyDamage = 0; // ���˱����Ў׶�� (���A���M��)
    let unsubscribeRoom = null; // �Á탦�� Firebase �O ��
    let pvpRaceSelectionShown = false;
    let isEnteringPVPDeploy = false;
    let pvpBattleStartPending = false;
    let pvpBattleStarted = false;
    let pvpLocalQuestionIndex = 0;
    let pvpQuestionDeck = [];
    let latestPVPSetupData = null;
    const lobbyProfileCache = new Map();
    let inviteListenerUnsubscribe = null;
    let inviteResponseListenerUnsubscribe = null;
    let currentIncomingInvite = null;
    let recentInviteCandidates = [];

    // --- 5. ���̿��� ---
function selectMode(mode) {
    tempGameMode = mode;
    hideMenuOverlayScreens();

    // ���� �[�� Supplies �@ʾ (�x���[��ģʽ��) ����
    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    if (mode === 'PVP') {
        // ���� Check rank requirement: PRIVATE or above ����
        const currentXP = userTotalXP || window.userTotalXP || 0;
        console.log('[PVP Check] Current XP:', currentXP);

        if (typeof getRankForXP !== 'function') {
            console.error('[PVP Check] getRankForXP function not found!');
            playSound('wrong-sfx');
            showNotification('SYSTEM ERROR: RANK CHECK FAILED', 'error', 4000);
            return;
        }

        const currentRank = getRankForXP(currentXP);
        console.log('[PVP Check] Current Rank:', currentRank.name, 'Level:', currentRank.level);

        if (currentRank.level < 3) {  // RECRUIT is level 1, CADET is level 2, PRIVATE is level 3
            playSound('wrong-sfx');
            showNotification('ONLY AVAILABLE TO PRIVATE OR ABOVE', 'error', 4000);
            console.log('[PVP Check] Access DENIED - Rank too low (need PRIVATE or above)');
            return;  // Block PVP access
        }

        console.log('[PVP Check] Access GRANTED');
        playSound('deploy-sfx');

        // �� �ޏ͆��} 2���[���������}���� (���� Title ͬ User Profile)
        // �@�ӾͲ�����ס Lobby �İ��o
        document.getElementById('start-screen').style.display = 'none';

        // �� �ޏ͆��} 1��PVP ֱ��ȥ Lobby (���^ Skill �x��)
        showLobbyScreen();

        // �� �@ʾ��� ID (ʹ�ö��؁�Դ�_���@ʾ)
        const pidEl = document.getElementById('player-id-display');
        if (pidEl) {
            const playerId = myPlayerId || window.myPlayerId;
            const displayName = localStorage.getItem('battleship_username');
            if (displayName) {
                pidEl.innerText = displayName;
            } else if (playerId) {
                pidEl.innerText = playerId.substring(0, 8).toUpperCase();
            } else {
                pidEl.innerText = 'LOADING...';
            }
        }
    } else {
        // --- AI ģʽ (���̣�Menu -> Level -> Skill) ---
        playSound('deploy-sfx');

        // ���� ���[�� Main Menu �����W�F ����
        document.getElementById('main-menu-carousel').style.display = 'none';
        document.getElementById('game-mode-selection').style.display = 'none';

        // ���� �@ʾ���ú�ɫ�׌� ����
        const overlay = document.getElementById('selection-overlay');
        if (overlay) overlay.style.display = 'block';

        // �@ʾ Level �x�� (�Ȓ� Level �ْ� Skill)
        const levelScreen = document.getElementById('level-screen');
        levelScreen.style.display = 'flex';
        // ���� Trigger holoAppear animation on content wrapper ����
        const wrapper = levelScreen.querySelector('.panel-content-wrapper');
        if (wrapper) {
            wrapper.style.animation = 'none';
            setTimeout(() => {
                wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
            }, 10);
        }
    }
}

function closeLevelScreen() {
    playSound('delete-sfx');
    document.getElementById('level-screen').style.display = 'none';

    if (tempGameMode === 'AI') {
        // AI ģʽ��Level �S��һ����Back �������x��
        // ���� �[�ع��ú�ɫ�׌� ����
        const overlay = document.getElementById('selection-overlay');
        if (overlay) overlay.style.display = 'none';

        showMainMenu();
    } else {
        // PVP �����r�� Back������ Lobby
        showLobbyScreen();
    }
}

function getLevelDisplayShort(levelKey) {
    const map = {
        L1: '1',
        L2: '2',
        L3: '3',
        L4: '4',
        L5: '5',
        L5_STAR: '5*'
    };
    return map[levelKey] || levelKey;
}

function getLevelStageCount(levelKey) {
    const totalWords = VOCAB_DB[levelKey] ? VOCAB_DB[levelKey].length : 0;
    return Math.max(1, Math.ceil(totalWords / STAGE_WORD_COUNT));
}

function getStageLabel(levelKey, stageIndex) {
    return `${getLevelDisplayShort(levelKey)}-${stageIndex + 1}`;
}

function getStageBaseWords(levelKey, stageIndex) {
    const levelWords = VOCAB_DB[levelKey] || [];
    const startIndex = stageIndex * STAGE_WORD_COUNT;
    return levelWords.slice(startIndex, startIndex + STAGE_WORD_COUNT);
}

function shuffleArray(items) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function getStageReviewWords(levelKey, modeKey, stageIndex) {
    if (stageIndex <= 0) return [];
    const levelWords = VOCAB_DB[levelKey] || [];
    const priorWords = levelWords.slice(0, stageIndex * STAGE_WORD_COUNT);
    return shuffleArray(priorWords);
}

function getStageProgressSummary(levelKey, stageIndex) {
    const stageWords = getStageBaseWords(levelKey, stageIndex);
    const totalSlots = stageWords.length * 3;
    if (totalSlots === 0) {
        return { completedSlots: 0, totalSlots: 0, ratio: 0, percent: 0 };
    }

    let completedSlots = 0;
    const modeKeys = ['reading', 'listening', 'speaking'];

    stageWords.forEach(word => {
        modeKeys.forEach(modeKey => {
            if (userMastery?.[modeKey]?.[levelKey]?.[word.en]?.status === 1) {
                completedSlots += 1;
            }
        });
    });

    const ratio = completedSlots / totalSlots;
    return {
        completedSlots,
        totalSlots,
        ratio,
        percent: Math.round(ratio * 100)
    };
}

function isStageUnlocked(levelKey, stageIndex) {
    if (stageIndex <= 0) return true;
    return getStageProgressSummary(levelKey, stageIndex - 1).ratio >= 0.6;
}

function setStageScreenMessage(text, type = 'info') {
    const stageSubtitle = document.getElementById('stage-screen-subtitle');
    if (!stageSubtitle) return;

    const colorMap = {
        info: '#94a3b8',
        warning: '#fbbf24',
        success: '#22c55e',
        error: '#ef4444'
    };

    stageSubtitle.style.display = 'block';
    stageSubtitle.textContent = text;
    stageSubtitle.style.color = colorMap[type] || colorMap.info;
}

function hideStageScreenMessage() {
    const stageSubtitle = document.getElementById('stage-screen-subtitle');
    if (!stageSubtitle) return;
    stageSubtitle.style.display = 'none';
    stageSubtitle.textContent = '';
}

function getCurrentStagePrimaryWords(modeKey) {
    const levelWords = VOCAB_DB[selectedLevel] || [];
    if (tempGameMode !== 'AI' || selectedStageIndex === null) {
        return levelWords;
    }
    return getStageBaseWords(selectedLevel, selectedStageIndex);
}

function getCurrentStageReviewWords(modeKey) {
    if (tempGameMode !== 'AI' || selectedStageIndex === null) {
        return [];
    }
    return getStageReviewWords(selectedLevel, modeKey, selectedStageIndex);
}

function buildStageVocabListForMode(modeKey) {
    const levelWords = VOCAB_DB[selectedLevel] || [];
    if (tempGameMode !== 'AI' || selectedStageIndex === null) {
        return levelWords;
    }

    const stageWords = getStageBaseWords(selectedLevel, selectedStageIndex);
    const reviewWords = getStageReviewWords(selectedLevel, modeKey, selectedStageIndex);
    const stageWordSet = new Set(stageWords.map(word => word.en));
    const dedupedReviewWords = reviewWords.filter(word => !stageWordSet.has(word.en));
    return [...stageWords, ...dedupedReviewWords];
}

function getScopedWordSetForMode(modeKey) {
    return new Set(getCurrentStagePrimaryWords(modeKey).map(word => word.en));
}

function getScopedMasteryCountForMode(modeKey) {
    const masteryByWord = userMastery?.[modeKey]?.[selectedLevel] || {};
    const scopedWords = getScopedWordSetForMode(modeKey);
    let masteryCount = 0;

    scopedWords.forEach(wordEn => {
        if (masteryByWord[wordEn]?.status === 1) {
            masteryCount += 1;
        }
    });

    return masteryCount;
}

function showStageScreen() {
    const stageScreen = document.getElementById('stage-screen');
    if (!stageScreen) return;
    stageScreen.style.display = 'flex';

    const wrapper = stageScreen.querySelector('.panel-content-wrapper');
    if (wrapper) {
        wrapper.style.animation = 'none';
        setTimeout(() => {
            wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
        }, 10);
    }
}

function renderStageScreen(levelKey) {
    const stageTitle = document.getElementById('stage-screen-title');
    const stageSubtitle = document.getElementById('stage-screen-subtitle');
    const stageGrid = document.getElementById('stage-grid');
    if (!stageGrid) return;

    const stageCount = getLevelStageCount(levelKey);
    if (stageTitle) stageTitle.textContent = 'SELECT STAGE';
    hideStageScreenMessage();

    stageGrid.innerHTML = '';

    for (let stageIndex = 0; stageIndex < stageCount; stageIndex++) {
        const progress = getStageProgressSummary(levelKey, stageIndex);
        const unlocked = isStageUnlocked(levelKey, stageIndex);
        const completed = progress.ratio >= 1;
        const button = document.createElement('button');
        button.className = `level-btn stage-btn-simple${unlocked ? '' : ' locked'}${completed ? ' completed' : ''}`;
        button.type = 'button';
        button.onclick = () => selectStage(stageIndex);
        button.innerHTML = `
            <span class="stage-btn-label">STAGE ${stageIndex + 1}</span>
            ${unlocked ? `<span class="stage-btn-progress">${progress.percent}% COMPLETED</span>` : ''}
            <span class="stage-info-btn" onclick="openStageInfo(${stageIndex}, event)" title="Stage info" aria-label="Stage info">i</span>
        `;
        stageGrid.appendChild(button);
    }
}

function closeStageScreen() {
    const stageScreen = document.getElementById('stage-screen');
    if (stageScreen) stageScreen.style.display = 'none';

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

function selectStage(stageIndex) {
    if (!isStageUnlocked(selectedLevel, stageIndex)) {
        playSound('delete-sfx');
        showNotification(
            `COMPLETE AT LEAST 60% OF THE ${STAGE_WORD_COUNT} WORDS IN STAGE ${stageIndex} TO UNLOCK STAGE ${stageIndex + 1}`,
            'error',
            3500
        );
        return;
    }

    playSound('deploy-sfx');
    selectedStageIndex = stageIndex;
    selectedStageLabel = getStageLabel(selectedLevel, stageIndex);
    activeVocabList = buildStageVocabListForMode('reading');
    sessionDeck = [...activeVocabList];

    console.log(`[Stage] ${selectedStageLabel} selected for ${selectedLevel}. Preview size: ${sessionDeck.length}`);

    const stageScreen = document.getElementById('stage-screen');
    if (stageScreen) stageScreen.style.display = 'none';

    updateSkillButtonsProgress();

    const skillScreen = document.getElementById('skill-screen');
    if (skillScreen) {
        skillScreen.style.display = 'flex';
        const wrapper = skillScreen.querySelector('.panel-content-wrapper');
        if (wrapper) {
            wrapper.style.animation = 'none';
            setTimeout(() => {
                wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
            }, 10);
        }
    }

    const speakBtn = document.getElementById('btn-skill-speaking');
    if (speakBtn) speakBtn.style.display = 'flex';
}

function openStageInfo(stageIndex, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const stageWords = getStageBaseWords(selectedLevel, stageIndex);
    const previewTitle = `${getStageLabel(selectedLevel, stageIndex)} // VOCAB`;
    if (typeof window.openStageVocabPreview === 'function') {
        window.openStageVocabPreview(selectedLevel, stageWords, previewTitle);
    }
}

    function prepareCreateRoom() {
        playSound('deploy-sfx');
        const lobbyScreen = document.getElementById('lobby-screen');
        if (lobbyScreen) lobbyScreen.style.display = 'none';
        showSelectionOverlay();
        // ���� Level �x�������
        // ���� PVP ģʽ���@ʾ�M�ȣ����÷�ԭ�������� ����
        resetLevelButtonsToDefault();
        const levelScreen = document.getElementById('level-screen');
        levelScreen.style.display = 'flex';
        // ���� Trigger holoAppear animation on content wrapper ����
        const wrapper = levelScreen.querySelector('.panel-content-wrapper');
        if (wrapper) {
            wrapper.style.animation = 'none';
            setTimeout(() => {
                wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
            }, 10);
        }
    }

// ���� PHASE 6: CONTEXT-SENSITIVE LEVEL PROGRESS DISPLAY ����
function updateLevelProgressUI() {
    const levels = ['L1', 'L2', 'L3', 'L4', 'L5', 'L5_STAR'];
    const levelNames = ['LEVEL 1', 'LEVEL 2', 'LEVEL 3', 'LEVEL 4', 'LEVEL 5', 'LEVEL 5*'];

    // Determine current mode and its display letter
    let modeKey = 'reading'; // default
    let modeLetter = 'R';

    if (typeof currentPracticeMode !== 'undefined' && currentPracticeMode) {
        modeKey = currentPracticeMode.toLowerCase();
        if (modeKey === 'reading') modeLetter = 'R';
        else if (modeKey === 'listening') modeLetter = 'L';
        else if (modeKey === 'speaking') modeLetter = 'S';
    }

    levels.forEach((levelKey, index) => {
        // Find the button in #level-screen
        const levelScreen = document.getElementById('level-screen');
        if (!levelScreen) return;

        const buttons = levelScreen.querySelectorAll('.level-btn');
        const button = buttons[index];
        if (!button) return;

        // Calculate progress for CURRENT MODE ONLY
        const totalWords = VOCAB_DB[levelKey] ? VOCAB_DB[levelKey].length : 0;
        let masteryCount = 0;

        if (userMastery[modeKey] && userMastery[modeKey][levelKey]) {
            masteryCount = Object.values(userMastery[modeKey][levelKey]).filter(m => m.status === 1).length;
        }

        // Update button text with context-sensitive progress
        button.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <span style="font-size: 18px; font-weight: bold;">${levelNames[index]}</span>
                <span style="font-size: 11px; opacity: 0.7; font-family: 'Orbitron';">
                    ${modeLetter}: ${masteryCount}/${totalWords}
                </span>
            </div>
        `;
    });

    console.log(`[Level Progress] Updated for mode: ${currentPracticeMode} (${modeLetter})`);
}

// ���� UPDATE SKILL BUTTONS WITH PROGRESS ����
function updateSkillButtonsProgress() {
    // Only update if we have a selected level
    if (!selectedLevel || !VOCAB_DB[selectedLevel]) return;

    const useStageScope = tempGameMode === 'AI' && selectedStageIndex !== null;
    const readingTotal = useStageScope ? getCurrentStagePrimaryWords('reading').length : VOCAB_DB[selectedLevel].length;
    const listeningTotal = useStageScope ? getCurrentStagePrimaryWords('listening').length : VOCAB_DB[selectedLevel].length;
    const speakingTotal = useStageScope ? getCurrentStagePrimaryWords('speaking').length : VOCAB_DB[selectedLevel].length;

    const readingCount = useStageScope
        ? getScopedMasteryCountForMode('reading')
        : (userMastery.reading && userMastery.reading[selectedLevel]
            ? Object.values(userMastery.reading[selectedLevel]).filter(m => m.status === 1).length
            : 0);
    const listeningCount = useStageScope
        ? getScopedMasteryCountForMode('listening')
        : (userMastery.listening && userMastery.listening[selectedLevel]
            ? Object.values(userMastery.listening[selectedLevel]).filter(m => m.status === 1).length
            : 0);
    const speakingCount = useStageScope
        ? getScopedMasteryCountForMode('speaking')
        : (userMastery.speaking && userMastery.speaking[selectedLevel]
            ? Object.values(userMastery.speaking[selectedLevel]).filter(m => m.status === 1).length
            : 0);

    // Update Reading button
    const readingBtn = document.getElementById('skill-btn-reading');
    if (readingBtn) {
        readingBtn.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center;">
                <span style="font-size:24px;">READING</span>
                <span style="font-size:12px; opacity:0.8; font-family: 'Orbitron';">${readingCount}/${readingTotal}</span>
            </div>
        `;
    }

    // Update Listening button
    const listeningBtn = document.getElementById('skill-btn-listening');
    if (listeningBtn) {
        listeningBtn.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center;">
                <span style="font-size:24px;">LISTENING</span>
                <span style="font-size:12px; opacity:0.8; font-family: 'Orbitron';">${listeningCount}/${listeningTotal}</span>
            </div>
        `;
    }

    // Update Speaking button
    const speakingBtn = document.getElementById('btn-skill-speaking');
    if (speakingBtn) {
        speakingBtn.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center;">
                <span style="font-size:24px;">SPEAKING</span>
                <span style="font-size:12px; opacity:0.8; font-family: 'Orbitron';">${speakingCount}/${speakingTotal}</span>
            </div>
        `;
    }

    const stageSuffix = useStageScope && selectedStageLabel ? ` [${selectedStageLabel}]` : '';
    console.log(`[Skill Progress${stageSuffix}] R: ${readingCount}/${readingTotal} | L: ${listeningCount}/${listeningTotal} | S: ${speakingCount}/${speakingTotal}`);
}

// ���� RESET SKILL BUTTONS TO DEFAULT (FOR PVP) ����
function resetSkillButtonsToDefault() {
    // Reset Reading button
    const readingBtn = document.getElementById('skill-btn-reading');
    if (readingBtn) {
        readingBtn.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center;">
                <span style="font-size:24px;">READING</span>
                <span style="font-size:10px; opacity:0.7;">DECRYPT CODE</span>
            </div>
        `;
    }

    // Reset Listening button
    const listeningBtn = document.getElementById('skill-btn-listening');
    if (listeningBtn) {
        listeningBtn.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center;">
                <span style="font-size:24px;">LISTENING</span>
                <span style="font-size:10px; opacity:0.7;">AUDIO INTEL</span>
            </div>
        `;
    }

    // Reset Speaking button
    const speakingBtn = document.getElementById('btn-skill-speaking');
    if (speakingBtn) {
        speakingBtn.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center;">
                <span style="font-size:24px;">SPEAKING</span>
                <span style="font-size:10px; opacity:0.7;">VOICE COMMAND</span>
            </div>
        `;
    }

    console.log(`[Skill Buttons] Reset to default (PVP mode)`);
}

// ���� RESET LEVEL BUTTONS TO DEFAULT (FOR PVP) ����
function resetLevelButtonsToDefault() {
    const levels = ['L1', 'L2', 'L3', 'L4', 'L5', 'L5_STAR'];
    const levelNames = ['LEVEL 1', 'LEVEL 2', 'LEVEL 3', 'LEVEL 4', 'LEVEL 5', 'LEVEL 5*'];

    levels.forEach((levelKey, index) => {
        const levelScreen = document.getElementById('level-screen');
        if (!levelScreen) return;

        const buttons = levelScreen.querySelectorAll('.level-btn');
        const button = buttons[index];
        if (!button) return;

        // Reset to default text without progress
        button.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <span style="font-size: 18px; font-weight: bold;">${levelNames[index]}</span>
            </div>
        `;
    });

    console.log(`[Level Buttons] Reset to default (PVP mode)`);
}

// Legacy function name for compatibility
function updateLevelProgress() {
    updateLevelProgressUI();
}

// --- �����棺�x��ȼ� (PVP �Ğ�ȥ�x Skill) ---
function selectLevel(level) {
    selectedLevel = level;
    selectedStageIndex = null;
    selectedStageLabel = '';
    activeVocabList = VOCAB_DB[level];
    sessionDeck = [...activeVocabList];
    console.log(`Level ${level} selected. Deck size: ${sessionDeck.length}`);
    playSound('deploy-sfx');

    // ���� �[�� Supplies �@ʾ (�M�� Level �x����) ����
    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    // ���� �P�I������ֱ���[�� Level ���棬ǧ�f��Ҫ��� closeLevelScreen() ����
    // closeLevelScreen() �S�¡������I���õģ������e�`�؎��㷵ȥ��һ� (Skill Screen)
    document.getElementById('level-screen').style.display = 'none';

    // ���� ���[�� Main Menu �����W�F ����
    const carousel = document.getElementById('main-menu-carousel');
    if (carousel) carousel.style.display = 'none';

    if (tempGameMode === 'AI') {
        renderStageScreen(level);
        showStageScreen();
    } else {
        // --- PVP ģʽ��Level -> Skill -> Lobby ---
        // ���� PVP ���@ʾ�M�ȣ����÷�ԭ�������� ����
        resetSkillButtonsToDefault();
        showSelectionOverlay();
        const lobbyScreen = document.getElementById('lobby-screen');
        if (lobbyScreen) lobbyScreen.style.display = 'none';

        // �@ʾ Skill �x��
        const skillScreen = document.getElementById('skill-screen');
        skillScreen.style.display = 'flex';
        // ���� Trigger holoAppear animation on content wrapper ����
        const wrapper = skillScreen.querySelector('.panel-content-wrapper');
        if (wrapper) {
            wrapper.style.animation = 'none';
            setTimeout(() => {
                wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
            }, 10);
        }

        // PVP ���r�[�� Speaking Mode (����Ҫ)
        const speakBtn = document.getElementById('btn-skill-speaking');
        if (speakBtn) speakBtn.style.display = 'none';
    }
}

function enterGameUI() {
    const bgm = document.getElementById('bgm');
    if (bgm) { bgm.volume = 0.5; bgm.play().then(()=>isMusicPlaying=true).catch(e=>{}); }

    // �� PHASE 5: Reset session XP counter
    sessionAnsweringXP = 0;
    sessionSupplies = 0;

    // ���� ANTI-FARMING: Reset turn count ����
    currentTurnCount = 0;

    // �� ��ʼ���e�փ��� deck����֮ǰ�e�^�������ȳ�
    wrongWordsDeck = getWrongWordsForSession(currentPracticeMode, selectedLevel);
    stageSessionMissCounts = {};
    lastAskedWordKey = '';
    if (tempGameMode === 'AI' && Array.isArray(activeVocabList) && activeVocabList.length > 0) {
        const scopedPrimaryWords = selectedStageIndex !== null
            ? getCurrentStagePrimaryWords(currentPracticeMode.toLowerCase())
            : activeVocabList;
        const activeWordSet = new Set(scopedPrimaryWords.map(word => word.en));
        wrongWordsDeck = wrongWordsDeck.filter(word => activeWordSet.has(word.en));
    }
    if (wrongWordsDeck.length > 0) {
        console.log(`[Wrong Words] ${wrongWordsDeck.length} words to review for ${currentPracticeMode}/${selectedLevel}`);
    }

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('lobby-screen').style.display = 'none';

    // ���� �[�� Supplies �@ʾ (�M���[��r) ����
    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const gameUI = document.getElementById('game-ui');
    gameUI.style.display = 'flex';
    setTimeout(() => { gameUI.style.opacity = '1'; }, 50);

    // ���� Show AUTO DEPLOY button at start ����
    const autoDeployBtn = document.getElementById('auto-deploy-btn');
    if (autoDeployBtn) {
        autoDeployBtn.style.display = 'inline-block';
    }

    // ���� ������Ⱦ Sidebar ���@ʾ�����N��đ�Ş ����
    if (typeof renderSidebar === 'function') {
        renderSidebar();
    }

    // ���� �A�d Damaged �DƬ ����
    preloadDamagedImages();

    startDeploymentTimer();

    // �h���� global-back-btn �Ŀ��ƴa

    if (gameMode === 'PVP') initPVPListeners();
}

    // --- 6. PVP ߉݋ ---

// ���� ANTI-FARMING: Check match history in last 24 hours ����
async function checkMatchHistory(player1Id, player2Id) {
    try {
        const { ref, get } = window.firebaseModules;
        const now = Date.now();
        const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);

        // Get match history for both players
        const player1HistoryRef = ref(window.db, `users/${player1Id}/matchHistory`);
        const player2HistoryRef = ref(window.db, `users/${player2Id}/matchHistory`);

        const [player1Snapshot, player2Snapshot] = await Promise.all([
            get(player1HistoryRef),
            get(player2HistoryRef)
        ]);

        // Count wins against each other in last 24h
        let player1WinsAgainstPlayer2 = 0;
        let player2WinsAgainstPlayer1 = 0;

        if (player1Snapshot.exists()) {
            const history = player1Snapshot.val();
            Object.values(history).forEach(match => {
                if (match.opponent === player2Id &&
                    match.timestamp > twentyFourHoursAgo &&
                    match.result === 'win' &&
                    match.counted) {
                    player1WinsAgainstPlayer2++;
                }
            });
        }

        if (player2Snapshot.exists()) {
            const history = player2Snapshot.val();
            Object.values(history).forEach(match => {
                if (match.opponent === player1Id &&
                    match.timestamp > twentyFourHoursAgo &&
                    match.result === 'win' &&
                    match.counted) {
                    player2WinsAgainstPlayer1++;
                }
            });
        }

        console.log(`[Match History] Player1 wins vs Player2: ${player1WinsAgainstPlayer2}, Player2 wins vs Player1: ${player2WinsAgainstPlayer1}`);

        return {
            hostExceeded: player1WinsAgainstPlayer2 >= 3,
            guestExceeded: player2WinsAgainstPlayer1 >= 3,
            hostWins: player1WinsAgainstPlayer2,
            guestWins: player2WinsAgainstPlayer1
        };
    } catch (error) {
        console.error('[Match History] Error checking history:', error);
        return { hostExceeded: false, guestExceeded: false, hostWins: 0, guestWins: 0 };
    }
}

function createRoom() {
        // �� ������һ�������̲����_����Ч ��
        playSound('open-room-sfx');

        const { ref, set, onValue } = window.firebaseModules;
        const roomId = Math.floor(1000 + Math.random() * 9000).toString();
        currentRoomId = roomId;
        playerRole = 'host';
        gameMode = 'PVP';
        pvpRaceSelectionShown = false;
        isEnteringPVPDeploy = false;
        pvpLocalQuestionIndex = 0;
        pvpQuestionDeck = [];
        pvpBattleStarted = false;
        latestPVPSetupData = null;

        const openingQuestionDeck = buildPvpQuestionDeck();
        pvpQuestionDeck = openingQuestionDeck;
        console.log(`[PVP Question Deck] Opening room with ${openingQuestionDeck.length} questions`);
        if (openingQuestionDeck.length === 0) {
            console.warn('[PVP Question Deck] Opening room without questions', {
                level: selectedLevel,
                practiceMode: currentPracticeMode,
                activeVocabSize: Array.isArray(activeVocabList) ? activeVocabList.length : 0
            });
        }

set(ref(db, 'rooms/' + roomId), {
            host: myPlayerId, 
            guest: null, 
            status: 'waiting_for_guest', 
            turn: 'host',
            level: selectedLevel,
            practiceMode: currentPracticeMode,
            hostRace: null,
            guestRace: null,
            questionDeck: openingQuestionDeck,
            questionDeckReady: openingQuestionDeck.length > 0,
            currentQuestion: null
        });
const { onDisconnect, remove } = window.firebaseModules; // �_���õ�����
    onDisconnect(ref(db, 'rooms/' + roomId)).remove();        
        const roomRef = ref(db, 'rooms/' + roomId);
        showPVPWaitingState(`ROOM: ${roomId} - WAITING...`, 'var(--success)');

unsubscribeRoom = onValue(roomRef, (snapshot) => {
            handlePVPMatchSetupSnapshot(snapshot.val());
        });
    }

async function joinRoomById(inputId, viaInvite = false) {
    const { ref, get, update } = window.firebaseModules;
    const normalizedId = String(inputId || '').trim();

    if (normalizedId.length !== 4) {
        playSound('wrong-sfx');
        return false;
    }

    const roomRef = ref(db, 'rooms/' + normalizedId);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) {
        const lobbyMsg = document.getElementById('lobby-msg');
        if (lobbyMsg) lobbyMsg.innerText = "ROOM NOT FOUND";
        playSound('wrong-sfx');
        return false;
    }

    const data = snapshot.val();
    if (data.guest) {
        const lobbyMsg = document.getElementById('lobby-msg');
        if (lobbyMsg) lobbyMsg.innerText = "ROOM FULL";
        playSound('wrong-sfx');
        return false;
    }

    playSound('open-room-sfx');
    currentRoomId = normalizedId;
    playerRole = 'guest';
    tempGameMode = 'PVP';
    pvpRaceSelectionShown = false;
    isEnteringPVPDeploy = false;
    pvpLocalQuestionIndex = 0;
    pvpQuestionDeck = [];
    pvpBattleStarted = false;
    latestPVPSetupData = null;
    gameMode = 'PVP';

    if (data.level && VOCAB_DB[data.level]) {
        selectedLevel = data.level;
        activeVocabList = VOCAB_DB[data.level];
        showNotification(`SYNCED: ${data.level}`, 'success');
    }

    const result = await checkMatchHistory(data.host, myPlayerId);
    const warningMsg = [];
    if (result.hostExceeded) {
        warningMsg.push(`?? HOST has won 3+ matches against you in 24h. This match WON'T count for HOST.`);
    }
    if (result.guestExceeded) {
        warningMsg.push(`?? YOU have won 3+ matches against HOST in 24h. This match WON'T count for YOU.`);
    }

    if (warningMsg.length > 0) {
        showNotification(warningMsg.join('\n'), 'warning', 8000);
    }

    await update(roomRef, {
        guest: myPlayerId,
        status: 'choosing_race',
        matchLimitWarning: warningMsg.length > 0 ? warningMsg : null
    });

    setupDisconnectHandler();

    if (typeof showNotification === 'function') {
        showNotification(viaInvite ? `INVITE ACCEPTED // LINKING ROOM ${normalizedId}` : `LINKING TO ROOM ${normalizedId}...`);
    }
    if (unsubscribeRoom) { unsubscribeRoom(); unsubscribeRoom = null; }
    unsubscribeRoom = window.firebaseModules.onValue(roomRef, (nextSnapshot) => {
        handlePVPMatchSetupSnapshot(nextSnapshot.val());
    });
    return true;
}

async function joinRoom() {
        const inputId = document.getElementById('room-id-input').value.trim();
        await joinRoomById(inputId, false);
    }

async function sendPvpInvite(targetId) {
    if (!targetId || !window.db || !window.firebaseModules) return;

    if (!currentRoomId || playerRole !== 'host') {
        showNotification('OPEN A HOST ROOM FIRST', 'warning', 2500);
        return;
    }

    if (latestPVPSetupData?.guest) {
        showNotification('ROOM ALREADY LINKED', 'warning', 2500);
        return;
    }

    const targetPlayer = recentInviteCandidates.find(player => player.id === targetId);
    const inviteId = `invite_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const payload = {
        inviteId,
        from: window.myPlayerId || myPlayerId,
        fromName: localStorage.getItem('battleship_username') || 'COMMANDER',
        roomId: currentRoomId,
        level: selectedLevel,
        practiceMode: currentPracticeMode,
        createdAt: Date.now()
    };

    const { ref, set, remove } = window.firebaseModules;
    await remove(ref(window.db, `users/${payload.from}/pvpInbox/response`));
    await set(ref(window.db, `users/${targetId}/pvpInbox/invite`), payload);
    closeInvitePlayersModal();
    showNotification(`INVITE SENT TO ${targetPlayer?.name || 'COMMANDER'}`, 'success', 2600);
}

window.sendPvpInvite = sendPvpInvite;

function updateRoomCodeValue(nextValue) {
    const roomInput = document.getElementById('room-id-input');
    if (!roomInput) return;
    roomInput.value = String(nextValue || '').replace(/\D/g, '').slice(0, 4);
}

function handleRoomCodeInput(keyValue) {
    const lobbyControls = document.getElementById('lobby-controls');
    const roomInput = document.getElementById('room-id-input');
    if (!lobbyControls || !roomInput || lobbyControls.style.display === 'none') return;

    if (keyValue === 'JOIN') {
        if (typeof playSound === 'function') playSound('deploy-sfx');
        joinRoom();
        return;
    }

    if (keyValue === 'BACKSPACE') {
        updateRoomCodeValue(roomInput.value.slice(0, -1));
        if (typeof playSound === 'function') playSound('delete-sfx');
        return;
    }

    if (keyValue === 'CLEAR') {
        updateRoomCodeValue('');
        if (typeof playSound === 'function') playSound('delete-sfx');
        return;
    }

    if (/^\d$/.test(keyValue)) {
        if (roomInput.value.length >= 4) return;
        updateRoomCodeValue(roomInput.value + keyValue);
        if (typeof playSound === 'function') playSound('enter-number-sfx');
    }
}

function initPVPListeners() {
    const { ref, onValue, off } = window.firebaseModules;
    
    // 1. ���Ƴ��f�ıO 
    const roomRef = ref(db, 'rooms/' + currentRoomId);
    off(roomRef); 

    // 2. �����±O 
    onValue(roomRef, (snapshot) => {
        const data = snapshot.val();

        // --- �ྀ�ɜy߉݋ (����֮ǰ������) ---
        if (!data) {
            if (currentPhase === 'GAME_OVER') return; 
            showNotification("CONNECTION LOST (HOST LEFT)", "error");
            playSound('wrong-sfx');
            setTimeout(() => resetGame(), 1500);
            return; 
        }
        if (playerRole === 'host' && !data.guest) {
            if (currentPhase === 'GAME_OVER') return;
            showNotification("OPPONENT DISCONNECTED", "error");
            playSound('wrong-sfx');
            setTimeout(() => resetGame(), 1500);
            return;
        }

        const questionDeck = rememberPvpQuestionDeck(data.questionDeck);
        latestPVPSetupData = questionDeck.length > 0
            ? { ...data, questionDeck }
            : data;
        const nextDeckQuestion = getPvpDeckQuestion(data);
        if (nextDeckQuestion) {
            preloadPvpSharedListeningQuestion(nextDeckQuestion);
        }

        // --- ����/ʧ�� �Д� (���ֲ�׃) ---
        if (data.winner) {
            if (currentPhase === 'GAME_OVER') return; 
            if (data.winner === playerRole) {
                renderReview();
                calculateAndDisplaySettlement(true, false);
                document.getElementById('end-title').innerText = "VICTORY";
                document.getElementById('end-title').style.color = "var(--success)";
                document.getElementById('end-title').style.textShadow = "0 0 30px var(--success)";
                const reason = data.endReason === 'disconnected' ? "CONNECTION LOST" : 
                               data.endReason === 'surrendered' ? "SURRENDERED" : "DESTROYED";
                document.getElementById('end-msg').innerText = `ENEMY ${reason}`;
                document.getElementById('end-screen').style.display = "flex";
                playSound('victory-sfx'); 
            } else {
                renderReview();
                document.getElementById('end-title').innerText = "DEFEAT";
                document.getElementById('end-title').style.color = "var(--warning)";
                document.getElementById('end-title').style.textShadow = "0 0 30px var(--warning)";
                document.getElementById('end-msg').innerText = "FLEET DESTROYED";
                document.getElementById('end-screen').style.display = "flex";
                playSound('lose-sfx');
            }
            currentPhase = 'GAME_OVER';
            return; 
        }

        // --- ���Y߉݋ ---
        if (!data.lastMove) return;
        const move = data.lastMove;
        
        if (move.timestamp <= lastProcessedTimestamp) return;
        
        // ����S���ִ��^��
        if (move.attacker !== playerRole) {
            lastProcessedTimestamp = move.timestamp;

            if (move.index === -1) {
                const status = document.getElementById('game-status');
                status.innerHTML = `OPPONENT TIMED OUT!`;
                status.style.color = "var(--success)";
                playSound('time_out'); 
                setGameTimeout(startPlayerTurn, 1500);
                return;
            }

            if (move.type === 'explosion' && Array.isArray(move.indices) && move.indices.length > 0) {
                const lockOverlay = createMissileLockOverlay('player-grid', move.anchor ?? move.indices[0]);
                setGameTimeout(() => {
                    playSound('missile-flying-sfx');
                    playMissileStrikeAnimation('player-grid', move.anchor ?? move.indices[0], lockOverlay, () => {
                        applyExplosionDamageToPlayer(move.indices);
                    });
                }, MISSILE_LOCK_ON_DURATION);
                return;
            }

            if (move.type === 'nuke' && Array.isArray(move.indices) && move.indices.length > 0) {
                playSound('nuke-detected-sfx');
                const lockOverlay = createNukeLockOverlay('player-grid', move.anchor ?? move.indices[0]);
                setGameTimeout(() => {
                    playSound('missile-flying-sfx');
                    playNukeStrikeAnimation('player-grid', move.anchor ?? move.indices[0], lockOverlay, () => {
                        applyExplosionDamageToPlayer(move.indices);
                    });
                }, NUKE_LOCK_ON_DURATION);
                return;
            }

            if (move.type === 'radar' && Number.isInteger(move.centerIndex)) {
                const status = document.getElementById('game-status');
                if (status) {
                    status.innerHTML = `PHASE: <span style="color:var(--primary)">ENEMY RADAR SCAN</span>`;
                }

                playRadarScanOnBoard({
                    gridId: 'player-grid',
                    centerIndex: move.centerIndex,
                    getCell: getPlayerCell,
                    countTargets: countAiRadarTargets,
                    scannedSet: pvpOpponentRadarScannedCenters,
                    onScanComplete: () => {}
                });
                return;
            }

            const idx = move.index;
            const cell = document.getElementById('player-grid').children[idx];
            
            if (cell.classList.contains('revealed')) return;

            cell.classList.add('revealed');
            playSound('laser-sfx');
            triggerAnimation(cell, 'blue');
            
            setGameTimeout(() => {
                if (myGrid[idx] === 1) {
                    // --- Hit Logic ---
                    cell.classList.add('hit');
                    playSound('hit-sfx');
                    triggerAnimation(cell, 'orange');
                    myDamage++;

                    // ���� AURELIANS: ��Ş������ +2 energy ����
                    if (selectedRace === 'AURELIANS' && typeof addEnergy === 'function') {
                        addEnergy(2, 'Ship Hit');
                    }

                    // ���� PVP �P�I�޸ģ��șz���Пo�������ٛQ����߅�� ����
                    const isDestroyed = checkMyShipDestruction(idx);

                    if (isDestroyed) {
                        playSound('unit-lost-sfx'); // �������� Unit Lost
                        // �� ������������ ��
                        document.body.classList.add('screen-shake-sunk');
                        setTimeout(() => document.body.classList.remove('screen-shake-sunk'), 800);
                    } else {
                        playUnderAttackAlert();     // δ������ Under Attack
                        // �� ���У��p΢��� ��
                        document.body.classList.add('screen-shake-hit');
                        setTimeout(() => document.body.classList.remove('screen-shake-hit'), 400);
                    }

                    if (checkGameOver()) return;
                } else {
                    // --- Miss Logic ---
                    cell.classList.add('miss');
                    cell.innerHTML = '<img src="close.png" class="miss-icon">';
                }
            }, 500);
            
            setGameTimeout(() => {
                if (currentPhase !== 'GAME_OVER') {
                    startPlayerTurn();
                }
            }, 1200);
        }
    });
}
    // --- 7. ���߉݋ ---
    function createGrid(elementId) {
        const board = document.getElementById(elementId);
        board.innerHTML = '';
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            if (elementId === 'player-grid') {
                cell.addEventListener('mouseover', () => handleHover(i));
                cell.addEventListener('click', () => handleClick(i));
            } else {
                cell.addEventListener('click', () => handleEnemyGridClick(i));
            }
            board.appendChild(cell);
        }
        board.addEventListener('mouseleave', clearPreview);
    }

function getShipIndices(idx, conf, v) {
        let indices = [];
        let r = Math.floor(idx / GRID_SIZE);
        let c = idx % GRID_SIZE;
        
        // ����Ǵ�ֱ(v=true)����ԭ���L韣�ˮƽ�t���{
        let w = v ? conf.width : conf.height;
        let h = v ? conf.height : conf.width;
        
        // 1. �z��߅�� (����ͻ؂� null)
        if (r + h > GRID_SIZE || c + w > GRID_SIZE) return null;
        
        // 2. Ӌ�����λ��
        if (conf.custom) {
            // �� �����Π�߉݋ ��
            const layout = v ? conf.layoutV : conf.layoutH;
            
            for (let i = 0; i < h; i++) {
                for (let j = 0; j < w; j++) {
                    // �z�� layout ��У������ 1 �����д�
                    const layoutIdx = i * w + j;
                    if (layout[layoutIdx] === 1) {
                        indices.push((r + i) * GRID_SIZE + (c + j));
                    }
                }
            }
        } else {
            // �� ��ͨ�L����߉݋ (�f���a) ��
            for (let i = 0; i < h; i++) {
                for (let j = 0; j < w; j++) {
                    indices.push((r + i) * GRID_SIZE + (c + j));
                }
            }
        }
        
        return indices;
    }

    function getShipBoundsFromIndices(indices) {
        if (!Array.isArray(indices) || indices.length === 0) return null;

        const rows = indices.map(idx => Math.floor(idx / GRID_SIZE));
        const cols = indices.map(idx => idx % GRID_SIZE);

        return {
            topRow: Math.min(...rows),
            leftCol: Math.min(...cols),
            bottomRow: Math.max(...rows),
            rightCol: Math.max(...cols),
            rootIndex: (Math.min(...rows) * GRID_SIZE) + Math.min(...cols)
        };
    }

function createPositionedShipImage(boardId, idx, conf, v, options = {}) {
        const board = document.getElementById(boardId);
        if (!board) return null;

        const {
            src = conf.img,
            className = 'ship-overlay',
            extraClasses = [],
            elementId = null,
            zIndex = null,
            containerId = null
        } = options;

        const container = containerId ? document.getElementById(containerId) : null;
        const isVisible = !container || container.offsetParent !== null;
        let prevDisplay = '';
        let prevVisibility = '';

        if (container && !isVisible) {
            prevDisplay = container.style.display;
            prevVisibility = container.style.visibility;
            container.style.visibility = 'hidden';
            container.style.display = 'block';
        }

        const startCell = board.children[idx];
        if (!startCell) {
            if (container && !isVisible) {
                container.style.display = prevDisplay;
                container.style.visibility = prevVisibility;
            }
            return null;
        }

        const img = document.createElement('img');
        img.src = src;
        img.classList.add(className);
        extraClasses.forEach(cls => cls && img.classList.add(cls));
        if (elementId) img.id = elementId;

        const cellWidth = startCell.offsetWidth;
        const cellHeight = startCell.offsetHeight;
        const boardStyle = window.getComputedStyle(board);
        const gridGap = parseFloat(boardStyle.gap || boardStyle.columnGap || '0') || 0;
        const pW = (cellWidth * conf.width) + (gridGap * (conf.width - 1));
        const pH = (cellHeight * conf.height) + (gridGap * (conf.height - 1));

        img.style.width = pW + 'px';
        img.style.height = pH + 'px';
        img.style.left = startCell.offsetLeft + 'px';
        img.style.top = startCell.offsetTop + 'px';
        if (zIndex !== null) img.style.zIndex = String(zIndex);

        if (!v) {
            const shift = (pH - pW) / 2;
            img.style.transformOrigin = 'center center';
            img.style.setProperty('--ship-rotation', 'rotate(-90deg)');
            img.style.setProperty('--ship-translate', `translate(${shift}px, -${shift}px)`);
            img.style.transform = `translate(${shift}px, -${shift}px) rotate(-90deg)`;
            img.classList.add('horizontal-ship');
        } else {
            img.style.transformOrigin = 'center center';
            img.style.setProperty('--ship-rotation', 'rotate(0deg)');
            img.style.setProperty('--ship-translate', 'translate(0, 0)');
            img.style.transform = 'translate(0, 0) rotate(0deg)';
        }

        if (container && !isVisible) {
            container.style.display = prevDisplay;
            container.style.visibility = prevVisibility;
        }

        return img;
    }

    function handleHover(index) {
        if (currentPhase !== 'DEPLOY') return;
        clearPreview();
        if (deployIndex >= FLEET.length) return;
        
        const indices = getShipIndices(index, FLEET[deployIndex], isVertical);
        const cells = document.getElementById('player-grid').children;
        
        if (!indices) { 
            cells[index].classList.add('invalid-hover'); 
            return; 
        }
        
        let overlap = indices.some(idx => myGrid[idx] === 1);
        indices.forEach(idx => cells[idx].classList.add(overlap ? 'invalid-hover' : 'valid-hover'));
    }

    function clearPreview() { 
        document.querySelectorAll('.cell').forEach(c => c.classList.remove('valid-hover', 'invalid-hover')); 
    }

/* =========================================
       ���� 3. �c����� (�����棺�xȡ voiceId) ����
       ========================================= */
    function handleClick(index) {
        // 1. �ǲ����A�� -> ̎��l��
        if (currentPhase !== 'DEPLOY') {
            if (currentPhase === 'PLAYER_TURN') {
                const cell = document.getElementById('enemy-grid').children[index];
                if (!cell.classList.contains('revealed')) openLaunchModal(index);
            }
            return;
        }

        // 2. ���մ��b߉݋
        if (myGrid[index] === 1) {
            let targetShipId = -1;
            FLEET.forEach((ship, i) => {
                if (ship.indices && ship.indices.includes(index)) {
                    targetShipId = i;
                }
            });

            if (targetShipId !== -1) {
                FLEET[targetShipId].indices.forEach(idx => myGrid[idx] = 0);
                FLEET[targetShipId].indices = null;

                // Remove ship image - try by ID first, then by position
                const playerBoard = document.getElementById('player-grid');
                let imgRemoved = false;

                // Try to find by ID
                const imgById = document.getElementById(`board-ship-${targetShipId}`);
                if (imgById) {
                    imgById.remove();
                    imgRemoved = true;
                }

                // If not found by ID, find by position overlap
                if (!imgRemoved) {
                    const shipImages = playerBoard.querySelectorAll('.ship-overlay');
                    const clickedCell = playerBoard.children[index];
                    const cellRect = clickedCell.getBoundingClientRect();

                    shipImages.forEach(img => {
                        const imgRect = img.getBoundingClientRect();
                        // Check if image overlaps with clicked cell
                        if (imgRect.left <= cellRect.right && imgRect.right >= cellRect.left &&
                            imgRect.top <= cellRect.bottom && imgRect.bottom >= cellRect.top) {
                            img.remove();
                        }
                    });
                }

                playSound('delete-sfx');

                if (deployIndex < FLEET.length) {
                    const currentHolding = document.getElementById(`ship-unit-${deployIndex}`);
                    if (currentHolding) {
                        currentHolding.classList.remove('current');
                        currentHolding.classList.add('pending');
                    }
                }

                deployIndex = targetShipId;
                const newCurrent = document.getElementById(`ship-unit-${deployIndex}`);
                if (newCurrent) {
                    newCurrent.classList.remove('deployed', 'pending');
                    newCurrent.classList.add('current');
                }

                const sBtn = document.getElementById('start-btn');
                sBtn.style.display = 'none';
                sBtn.disabled = true;
                
                document.getElementById('rotate-btn').style.display = 'inline-block'; 
                
                return;
            }
        }

        // 3. ���ô��b߉݋
        if (deployIndex >= FLEET.length) return;

        const conf = FLEET[deployIndex];
        const indices = getShipIndices(index, conf, isVertical);

        if (!indices || indices.some(idx => myGrid[idx] === 1)) return;

        indices.forEach(idx => myGrid[idx] = 1);
        FLEET[deployIndex].indices = indices;
        FLEET[deployIndex].isVertical = isVertical; 

        placeShipImage('player-grid', index, conf, isVertical);
        
        // ���� ���c������������ه Index�������xȡ conf.voiceId ����
        // �@�� Spectre �ŵڎ׶��ã������x�� 'ship-voice-4'
        playSound('deploy-sfx'); 
        
        const voiceToPlay = conf.voiceId || `ship-voice-${deployIndex}`;
        setTimeout(() => {
            playSound(voiceToPlay); 
        }, 200);

        const justPlaced = document.getElementById(`ship-unit-${deployIndex}`);
        if (justPlaced) {
            justPlaced.classList.remove('current');
            justPlaced.classList.add('deployed');
        }

        deployIndex = findNextUnplaced();

        if (deployIndex < FLEET.length) {
            const nextShip = document.getElementById(`ship-unit-${deployIndex}`);
            if (nextShip) {
                nextShip.classList.remove('pending');
                nextShip.classList.add('current');
            }
        } else {
            document.getElementById('rotate-btn').style.display = 'none';
            const sBtn = document.getElementById('start-btn');
            sBtn.style.display = 'inline-block';
            sBtn.disabled = false;
        }
    }

    function placeShipImage(boardId, idx, conf, v, shipIndex) {
        const board = document.getElementById(boardId);
        if (!board) return;

        const extraClasses = [];
        if (selectedRace === 'AURELIANS') {
            extraClasses.push('aurelians');
        } else if (selectedRace === 'CAUSTICS') {
            extraClasses.push('caustics');
        }

        const actualIndex = (boardId === 'player-grid')
            ? ((shipIndex !== undefined) ? shipIndex : deployIndex)
            : null;

        const img = createPositionedShipImage(boardId, idx, conf, v, {
            className: 'ship-overlay',
            extraClasses,
            elementId: actualIndex !== null ? `board-ship-${actualIndex}` : null
        });

        if (img) {
            board.appendChild(img);
        }
    }

    function rotateShip() {
        isVertical = !isVertical;
        document.getElementById('rotate-btn').innerText = isVertical ? "ROTATE: VERTICAL" : "ROTATE: HORIZONTAL";
    }

    // --- 8. ���Y���� ---
function startBattle() {
    if (deploymentTimerInterval) clearInterval(deploymentTimerInterval);
    document.getElementById('turn-timer-container').style.visibility = 'hidden';

    // �� PHASE 5: Reset session XP counter (in case not reset in enterGameUI)
    sessionAnsweringXP = 0;

    const exitBtn = document.getElementById('game-exit-btn');
    if(exitBtn) {
        exitBtn.innerText = "EXIT";
        exitBtn.style.borderColor = "var(--danger)";
        exitBtn.style.color = "var(--danger)";
        exitBtn.style.display = "none";
    }

    // ���� Hide AUTO DEPLOY button when battle starts ����
    const autoDeployBtn = document.getElementById('auto-deploy-btn');
    if (autoDeployBtn) {
        autoDeployBtn.style.display = 'none';
    }

    document.getElementById('deploy-controls').style.display = 'none';
    document.getElementById('fleet-sidebar').style.display = 'none';
    const controlPanel = document.getElementById('control-panel');
    if (controlPanel) controlPanel.classList.add('battle-mode');
    // ���� �@ʾ�ײ� Battle HUD + spacer ����
    const battleHud = document.getElementById('battle-hud');
    if (battleHud) battleHud.style.display = 'flex';
    const spacer = document.getElementById('player-board-spacer');
    if (spacer) spacer.style.display = 'block';
    initEnemyFleetIndicator();
    playSound('deploy-sfx');

    if (gameMode === 'AI') {
        updateEnemyBoardLabel(enemyRace); // �� Update AI opponent label ��
        renderBattleMinimap('PLAYER');
        primePendingListeningQuestion();
        preloadLikelyNextListeningPrompt();
        startPlayerTurn();
    } else {
        const { ref, update, onValue, off } = window.firebaseModules;
        const updates = {};
        const field = (playerRole === 'host') ? 'hostBoard' : 'guestBoard';
        updates[field] = myGrid;

        const myShipsForSending = FLEET.map((s, index) => ({
            shipId: index,
            indices: s.indices,
            width: s.width,
            height: s.height,
            isVertical: s.isVertical
        }));
        updates[field + 'Ships'] = myShipsForSending;
        updates[playerRole + 'Ready'] = true;
        updates[playerRole + 'Race'] = selectedRace; // �� ������ҷN�� ��

        update(ref(db, 'rooms/' + currentRoomId), updates);
        document.getElementById('game-status').innerHTML = "WAITING FOR OPPONENT...";

        // ��ֹ���}�O 
        if (battleUnsubscribe) battleUnsubscribe();

        battleUnsubscribe = onValue(ref(db, 'rooms/' + currentRoomId), async (snapshot) => {
            const data = snapshot.val();
            
            // ���� �������z�y���g�Ƿ񱻄h�� (Host ����) ����
            if (!data) {
                if (battleUnsubscribe) battleUnsubscribe(); // ֹͣ�O 
                showNotification("CONNECTION LOST (HOST LEFT)", "error");
                playSound('wrong-sfx');
                // ���t 2 ���Ꮧ�ش�d��׌��ҿ����ӍϢ
                setTimeout(() => resetGame(), 2000);
                return;
            }

            // ���� �������z�y Guest �Ƿ��x�_ (Host ҕ��) ����
            if (playerRole === 'host' && !data.guest) {
                if (battleUnsubscribe) battleUnsubscribe();
                showNotification("OPPONENT DISCONNECTED", "error");
                playSound('wrong-sfx');
                setTimeout(() => resetGame(), 2000);
                return;
            }
            
            // ���p�����ʂ��
            if (data.hostReady && data.guestReady) {
                if (pvpBattleStarted || pvpBattleStartPending) return;

                const roomQuestionDeck = normalizePvpQuestionDeck(data.questionDeck);

                if (playerRole === 'host' && (!data.questionDeckReady || roomQuestionDeck.length === 0)) {
                    pvpBattleStartPending = true;
                    document.getElementById('game-status').innerHTML = "SYNCING QUESTION DECK...";
                    try {
                        await ensurePvpQuestionDeckReady(data);
                        const freshData = await refreshLatestPvpRoomData();
                        enterPvpBattleFromRoom(freshData || latestPVPSetupData);
                    } catch (error) {
                        console.warn('[PVP Question Deck] Failed to prepare:', error);
                        showNotification("QUESTION DECK SYNC FAILED", "error");
                    } finally {
                        pvpBattleStartPending = false;
                    }
                    return;
                }

                if (!data.questionDeckReady || roomQuestionDeck.length === 0) {
                    document.getElementById('game-status').innerHTML = "WAITING FOR QUESTION DECK...";
                    return;
                }

                enterPvpBattleFromRoom({ ...data, questionDeck: roomQuestionDeck });
            }
        });
    }
}

function enterPvpBattleFromRoom(data) {
    if (!data || pvpBattleStarted) return;
    const questionDeck = normalizePvpQuestionDeck(data.questionDeck);
    if (!data.questionDeckReady || questionDeck.length === 0) return;

    pvpBattleStarted = true;
    latestPVPSetupData = { ...data, questionDeck };
    pvpQuestionDeck = questionDeck;
    pvpLocalQuestionIndex = 0;

    if (battleUnsubscribe) {
        battleUnsubscribe();
        battleUnsubscribe = null;
    }

    const opponentRace = playerRole === 'host' ? data.guestRace : data.hostRace;
    if (opponentRace) {
        enemyRace = opponentRace;
        updateEnemyBoardLabel(opponentRace);
    }

    const opponentId = playerRole === 'host' ? data.guest : data.host;
    currentOpponentId = opponentId;
    if (opponentId) {
        updateOpponentRankBadge(opponentId);
    }

    if (playerRole === 'host') {
        enemyGrid = data.guestBoard;
        processEnemyFleetData(data.guestBoardShips);
        startPlayerTurn();
    } else {
        enemyGrid = data.hostBoard;
        processEnemyFleetData(data.hostBoardShips);
        currentPhase = 'ENEMY_TURN';
        document.getElementById('game-status').innerHTML = "OPPONENT'S TURN";
        switchScene('ENEMY');
    }
}

// ���� Update enemy board label with race name ����
function updateEnemyBoardLabel(race) {
    const label = document.querySelector('#enemy-board .board-label');
    if (label) {
        label.innerText = `${race} FLEET`;
    }
}

function minimapHasPlayerShipAt(index) {
    return index >= 0 && index < GRID_SIZE * GRID_SIZE && myGrid[index] === 1;
}

function renderBattleMinimap(sceneName = null) {
    const minimap = document.getElementById('hud-minimap');
    const label = document.getElementById('minimap-label');
    const grid = document.getElementById('minimap-grid');
    if (!minimap || !label || !grid) return;

    const resolvedScene = sceneName || (document.getElementById('enemy-board')?.classList.contains('active') ? 'PLAYER' : 'ENEMY');
    const showPlayerMap = resolvedScene === 'PLAYER';

    minimap.classList.toggle('player-map', showPlayerMap);
    minimap.classList.toggle('enemy-map', !showPlayerMap);
    minimap.classList.toggle('race-vanguards', showPlayerMap && selectedRace === 'VANGUARDS');
    minimap.classList.toggle('race-aurelians', showPlayerMap && selectedRace === 'AURELIANS');
    minimap.classList.toggle('race-caustics', showPlayerMap && selectedRace === 'CAUSTICS');
    label.textContent = showPlayerMap ? 'YOUR FLEET' : 'ENEMY SECTOR';
    grid.innerHTML = '';
    const scannedArea = new Set();
    radarScannedCells.forEach(centerIndex => {
        getRadarAreaIndices(centerIndex).forEach(index => scannedArea.add(index));
    });

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const miniCell = document.createElement('div');
        miniCell.className = 'minimap-cell';

        if (showPlayerMap) {
            const boardCell = getPlayerCell(i);
            const wasShot = enemyShots.includes(i) || (boardCell && boardCell.classList.contains('revealed'));

            if (myGrid[i] === 1) {
                miniCell.classList.add('ship');
                const row = Math.floor(i / GRID_SIZE);
                const col = i % GRID_SIZE;
                if (row === 0 || !minimapHasPlayerShipAt(i - GRID_SIZE)) miniCell.classList.add('ship-edge-top');
                if (row === GRID_SIZE - 1 || !minimapHasPlayerShipAt(i + GRID_SIZE)) miniCell.classList.add('ship-edge-bottom');
                if (col === 0 || !minimapHasPlayerShipAt(i - 1)) miniCell.classList.add('ship-edge-left');
                if (col === GRID_SIZE - 1 || !minimapHasPlayerShipAt(i + 1)) miniCell.classList.add('ship-edge-right');
            }
            if (boardCell && boardCell.classList.contains('hit')) {
                miniCell.classList.add('hit');
            } else if (wasShot) {
                miniCell.classList.add('miss');
            }
        } else {
            const boardCell = getEnemyCell(i);
            const isHit = !!(boardCell && boardCell.classList.contains('hit'));
            const isMiss = !!(boardCell && boardCell.classList.contains('miss'));

            if (isHit) {
                miniCell.classList.add('hit');
            } else if (isMiss) {
                miniCell.classList.add('miss');
            }

            if (!isHit && !isMiss && scannedArea.has(i)) {
                miniCell.classList.add('scanned');
            }
            if (!isHit && !isMiss && radarScannedCells.has(i)) {
                miniCell.classList.add('scanned-center');
            }
        }

        grid.appendChild(miniCell);
    }
}

function switchScene(sceneName) {
        document.getElementById('player-board').classList.remove('active');
        document.getElementById('enemy-board').classList.remove('active');
        const instrContainer = document.getElementById('instruction-container');

        if (sceneName === 'PLAYER') {
            document.getElementById('enemy-board').classList.add('active');
            document.getElementById('game-status').innerHTML = `PHASE: <span style="color:var(--success)">YOUR TURN</span>`;
            document.getElementById('control-panel').style.borderColor = selectedRace === 'AURELIANS' ? "#2dd4bf" : "var(--success)";
            document.getElementById('control-panel').style.boxShadow = selectedRace === 'AURELIANS'
                ? "0 0 15px rgba(45, 212, 191, 0.3)"
                : "0 0 15px rgba(14, 165, 233, 0.3)";
            // �@ʾ instruction container
            if (instrContainer) {
                instrContainer.style.display = 'flex';
                instrContainer.style.visibility = 'visible';
                // Class toggle �|�lչ�_�Ӯ������� Safari/iOS��
                instrContainer.classList.remove('play-expand');
                void instrContainer.offsetWidth;
                instrContainer.classList.add('play-expand');
                // Aurelians �����}ɫ
                if (selectedRace === 'AURELIANS') {
                    instrContainer.classList.add('aurelians');
                } else {
                    instrContainer.classList.remove('aurelians');
                }
            }
            // ���� �ҷ��غϣ����ܿ��� ����
            const skillGroup = document.getElementById('hud-skills');
            if (skillGroup) skillGroup.classList.remove('skills-inactive');
            clearActiveSkillState();
            cancelSkillSelection();
            refreshRadarScanDisplays();
            if (typeof updateSkillStates === 'function') updateSkillStates();
        } else {
            document.getElementById('player-board').classList.add('active');
            document.getElementById('game-status').innerHTML = `PHASE: <span style="color:var(--danger)">WARNING! ENEMY</span>`;
            document.getElementById('control-panel').style.borderColor = selectedRace === 'AURELIANS' ? "#2dd4bf" : "var(--danger)";
            document.getElementById('control-panel').style.boxShadow = selectedRace === 'AURELIANS'
                ? "0 0 15px rgba(45, 212, 191, 0.3)"
                : "0 0 15px rgba(14, 165, 233, 0.3)";
            // ���� �����غϣ����ܲ����� ����
            const skillGroup = document.getElementById('hud-skills');
            if (skillGroup) skillGroup.classList.add('skills-inactive');
            clearActiveSkillState();
            // �[�� instruction container
            if (instrContainer) {
                instrContainer.style.visibility = 'hidden';
                instrContainer.style.display = 'none';
            }
        }

        renderBattleMinimap(sceneName);
}

/* =========================================
   ���� TARGET LOCK LOGIC (JS) - ����Ӌ�r�� Bug �� ����
   ========================================= */

function handleEnemyGridClick(index) {
    if (isBattleInteractionLocked()) {
        return;
    }

    if (selectedSkill && !activeSkill) {
        if (selectedSkill === 'radar') {
            if (!isRadarSelectable(index)) {
                playSound('wrong-sfx');
                return;
            }
            lockRadarTarget(index);
            return;
        }
        if (selectedSkill === 'explosion') {
            if (!isExplosionSelectable(index)) {
                playSound('wrong-sfx');
                return;
            }
            missileLockedIndex = getExplosionAnchor(index);
            renderExplosionPreview(missileLockedIndex);
            setInstructionPanel('MISSILE', 'TARGET LOCKED. PRESS TICK TO FIRE', 'explosion.png');
            return;
        }
        if (selectedSkill === 'nuke') {
            if (!isNukeSelectable(index)) {
                playSound('wrong-sfx');
                return;
            }
            missileLockedIndex = getExplosionAnchor(index, 4);
            renderNukePreview(missileLockedIndex);
            setInstructionPanel('NUKE', 'TARGET LOCKED. PRESS TICK TO LAUNCH', 'nuclear_bomb.png');
            return;
        }
        return;
    }

    if (activeSkill === 'radar') {
        return;
    }

    // 1. �z���i����������������(isTargeting)�����ߡ�������һغϡ���ֱ�ӟoҕ�c��
    if (isTargeting || currentPhase !== 'PLAYER_TURN') {
        return; 
    }

    const cell = document.getElementById('enemy-grid').children[index];
    
    // ���ԓ��δ�����_
    if (!cell.classList.contains('revealed')) {
        
        // ���� �P�I������һ����ȥ�����̚���Ӌ�r���� ����
        // ��õȄӮ�������ͣ�����Ӯ��������g�푪ԓӋ�r
        if (typeof turnTimerInterval !== 'undefined' && turnTimerInterval) {
            clearInterval(turnTimerInterval);
        }
        // (�x��) ����[����lӋ�r Bar������֪��ϵ�y�յ���ָ������
        const timerContainer = document.getElementById('turn-timer-container');
        if (timerContainer) timerContainer.style.visibility = 'hidden';

        // 2. �� ���i�������O���� true
        isTargeting = true;
        attackResolutionLocked = true;

        // Aim icon �Ŵ�sС�Ӯ�
        const aimIcon = document.querySelector('.crosshair-icon');
        if (aimIcon) {
            aimIcon.classList.remove('aim-pulse');
            void aimIcon.offsetWidth;
            aimIcon.classList.add('aim-pulse');
        }

        // 3. �����i���Ӯ�
        runTargetLockAnimation(index, () => {
            // �Ӯ������Ļ��{ (Callback)
            openLaunchModal(index);
        });
    }
}

// �����i���Ӯ��������� (�ӑB�r�L��)
function runTargetLockAnimation(index, onComplete) {
    warmListeningPlaybackDuringTargetLock();
    const grid = document.getElementById('enemy-grid');
    const cell = grid.children[index];
    
    // --- 1. ��ȡ���cӋ��r�g ---
    const voiceObj = getNextTargetVoice(); 
    const totalDuration = voiceObj.duration; // ȡ��ԓ����L�� (ms)
    
    // �� ms �D�Q���� (�o CSS ��)������ 1500ms -> "1.5s"
    const cssDuration = (totalDuration / 1000) + 's'; 

    console.log(`Playing: ${voiceObj.file}, Duration: ${totalDuration}ms`);

    // --- 2. ���� DOM Ԫ�� (֮ͬǰһ��) ---
    const cellLeft = cell.offsetLeft;
    const cellTop = cell.offsetTop;
    const cellW = cell.offsetWidth;
    const cellH = cell.offsetHeight;
    const centerX = cellLeft + cellW / 2;
    const centerY = cellTop + cellH / 2;

    const overlay = document.createElement('div');
    overlay.className = 'target-overlay';
    if (selectedRace === 'AURELIANS') {
        overlay.classList.add('aurelians-theme');
    }
    grid.appendChild(overlay);

    const lineH = document.createElement('div');
    lineH.className = 'aim-line-h';
    lineH.style.setProperty('--target-y', centerY + 'px');
    
    const lineV = document.createElement('div');
    lineV.className = 'aim-line-v';
    lineV.style.setProperty('--target-x', centerX + 'px');
    
    const reticle = document.createElement('div');
    reticle.className = 'aim-reticle';
    reticle.style.width = cellW + 'px';
    reticle.style.height = cellH + 'px';
    reticle.style.left = cellLeft + 'px';
    reticle.style.top = cellTop + 'px';

    // ���� �P�I����Ӌ����ĕr�g���o CSS ׃�� ����
    // �@�e�҂��ѕr�g�O�ڸ��� overlay������ֱ���O��Ԫ���϶�����
    lineH.style.setProperty('--anim-duration', cssDuration);
    lineV.style.setProperty('--anim-duration', cssDuration);
    reticle.style.setProperty('--anim-duration', cssDuration);

    overlay.appendChild(lineH);
    overlay.appendChild(lineV);
    overlay.appendChild(reticle);

    // --- 3. ���ų鵽���� ---
    // ���O����һ��ͨ�ò��ź���������]�У������ú��ε� Audio �����
    const sfx = new Audio(voiceObj.file);
    sfx.volume = 0.8; // �{������
    sfx.play().catch(e => console.log("Audio play error:", e));

    // --- 4. �ȴ��������ГQ���� ---
    setTimeout(() => {
        overlay.remove();
        if (onComplete) onComplete();
    }, totalDuration); // �@�eֱ��ʹ������L��
}

// --- ��K�������ϰ棺���}ҕ�� (�DƬ�Dʾ + �����Ű� + �Z���ޏ�) ---
async function openLaunchModal(index) {
    // 1. ֹͣ�xλ����
    if (typeof turnTimerInterval !== 'undefined' && turnTimerInterval) clearInterval(turnTimerInterval);
    document.getElementById('turn-timer-container').style.visibility = 'hidden';

    // ��B����
    let statusText = "DECRYPTING...";
    if (currentPracticeMode === 'SPEAKING') statusText = "VOICE UPLINK...";
    if (currentPracticeMode === 'LISTENING') statusText = "INCOMING TRANSMISSION...";
    
    document.getElementById('game-status').innerHTML = `PHASE: <span style="color:var(--warning)">${statusText}</span>`;

    currentTargetIndex = index;
    
    // ����C��
    const enemyShip = enemyGrid[index];
    if (enemyShip === 'hit' || enemyShip === 'miss') {
        playSound('wrong-sfx');
        return;
    }

// �ʂ��}Ŀ (AI: 3-Tier Spaced Repetition | PVP: shared deck sequence)

    // ���� PVP ģʽ������ shared question ���^���S�C���� ����
    if (gameMode === 'PVP') {
        const resolved = await resolvePvpSharedQuestion();
        if (!resolved || !currentVocab) {
            showNotification("QUESTION LINK LOST", "error");
            return;
        }
        console.log(`[PVP Shared Question] Word: ${currentVocab.en}`);
    } else {
        if (currentPracticeMode === 'LISTENING' && pendingBattleVocab) {
            currentVocab = pendingBattleVocab;
            pendingBattleVocab = null;
            console.log(`[Listening Prime] Using preselected word: ${currentVocab.en}`);
        } else {
            currentVocab = takeNextAiBattleVocab();
            if (!currentVocab) {
                return;
            }
        }
    }

    if (currentVocab && currentVocab.en) {
        markBattleWordUsed(currentVocab);
    }

    if (gameMode !== 'PVP') {
        assignSentenceForCurrentVocab();
    }
    preloadCurrentListeningPrompt();
    primePendingListeningQuestion();
    preloadLikelyNextListeningPrompt();
    
    // �@ȡ����Ԫ��
    const modal = document.getElementById('launch-modal');
    const modeLabel = document.getElementById('launch-mode-label');
    const qText = document.getElementById('q-text');
    const qDisplay = document.getElementById('q-display');
    const input = document.getElementById('hidden-input');
    const msgArea = document.getElementById('msg-area');
    const timerBar = document.getElementById('timer-bar');
    
    // ���û�����B
    msgArea.innerText = "";
    input.value = "";
    
    // �����f�� Mic ���o (��ֹ���})
    const oldMic = document.getElementById('mic-btn');
    if(oldMic) oldMic.remove();

    // �[�� instruction container���M����}���棩
    const instrContainer = document.getElementById('instruction-container');
    if (instrContainer) {
        instrContainer.style.visibility = 'hidden';
        instrContainer.style.display = 'none';
    }

    // ���� �P�I�����@ʾҕ�����و�������� focus���_���I�P���� ����
    modal.style.display = "flex";

    // ���� Apply Aurelians theme if player is using Aurelians ����
    if (selectedRace === 'AURELIANS') {
        modal.classList.add('aurelians-theme');
    } else {
        modal.classList.remove('aurelians-theme');
    }

    startMatrixEffect();
    setSpeakingUiState();

    // ���� ���ģ�����ģʽ�ГQ���� ����
if (currentPracticeMode === 'SPEAKING') {
    if (modeLabel) modeLabel.innerText = "READ IT ALOUD.";
    const textToRead = currentVocab.sent ? currentVocab.sent : currentVocab.en;
    qText.innerText = `READ: ${textToRead}`;
    
    // ���w�s�����٣������ӱ��^�L
    qText.style.fontSize = "22px"; 
    qText.style.lineHeight = "1.4"; // �����о࣬���^���x
    qText.style.cursor = "default";
    qText.onclick = null;

    qDisplay.innerHTML = '';
        qDisplay.style.display = 'none';
        qDisplay.style.color = "var(--primary)";
        qDisplay.style.fontSize = "";
        setSpeakingUiState('idle', 'VOICE LINK STANDBY', '--');
        input.style.display = 'none'; 

        // �ӑB���� Mic ���o (ʹ���㮋�� PNG)
        const speakingStatus = document.getElementById('speaking-status');
        const micBtn = document.createElement('div');
        micBtn.id = 'mic-btn';
        micBtn.className = 'mic-btn'; 
        micBtn.onclick = handleSpeakingMicClick;
        
        const container = document.getElementById('timer-bar-container');
        if (speakingStatus) qDisplay.parentNode.insertBefore(speakingStatus, container);
        qDisplay.parentNode.insertBefore(micBtn, container);

    } else if (currentPracticeMode === 'LISTENING') {
        qDisplay.style.display = 'block';
        if (modeLabel) modeLabel.innerText = "Translate to English:";
        // --- B.  ��ģʽ (Listening) ---
        fadeBgm(0.1, 800);
        let contentHTML = '';

        // ���� Use listeningAnswer if available (new format), otherwise use base form (old format) ����
        const targetWord = currentVocab.listeningAnswer || currentVocab.en;
        const textToRead = currentVocab.sent ? currentVocab.sent : currentVocab.en;
        const safeText = textToRead.replace(/'/g, "\\'");
        console.log(`[Listening Display] Using target word: "${targetWord}"`);

        // 1. �@ʾ������� (����о���)
        if (currentVocab.sent) {
            const displayHTML = replaceListeningAnswerWithBlank(currentVocab.sent, targetWord);
            contentHTML += `<div class="sentence-container">${displayHTML}<span class="cyber-speaker-btn cyber-speaker-btn-small listening-replay-btn" onclick="speakText('${safeText}', null, true)" role="button" aria-label="Replay audio"></span></div>`;
        } else {
            contentHTML += `<div style="font-family:'Orbitron'; font-size:14px; color:#d946ef; margin-bottom:15px; letter-spacing:2px;">// AUDIO INTERCEPTED //</div>`;
        }

        // 2. ����߿Ƽ����ȳ� (ʹ���㮋�� PNG)
        if (!currentVocab.sent) {
            contentHTML += `
                <div class="cyber-speaker-btn" onclick="speakText('${safeText}', null, true)"></div>
            `;
        }

        qText.innerHTML = contentHTML;
        qText.style.cursor = "default";
        qText.onclick = null;

        // 3. �@ʾ���ܵ׾�
        qDisplay.innerHTML = renderListeningAnswerDisplay(targetWord, "");
        qDisplay.style.color = "var(--primary)";

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    speakText(textToRead, null, true);
                }, 300);
            });
        });

    } else {
        qDisplay.style.display = 'block';
        if (modeLabel) modeLabel.innerText = "Translate to English:";
        // --- C. ��xģʽ (Reading) ---
        qText.innerText = currentVocab.ch;
        qText.style.fontSize = "";
        qText.style.cursor = "default";
        qText.onclick = null;

        qDisplay.innerHTML = generateSmartBlanks(currentVocab.en);
        qDisplay.style.color = "var(--primary)";
    }

    // ���� INPUT & VIRTUAL KEYBOARD CONTROL ����
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    // �z�y�֙C/ƽ�壺iOS �� Android �� touch device
    // �Ƴ� innerWidth �Д࣬�����ƽ�壨iPad Pro����sСҕ���r�`��
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
                     (navigator.maxTouchPoints > 0 && !window.matchMedia('(pointer: fine)').matches);

    if (isMobile && (currentPracticeMode === 'READING' || currentPracticeMode === 'LISTENING')) {
        const screenWidth = window.innerWidth || screen.width;
        const isTablet = screenWidth >= 768;

        // Apply final keyboard classes before first paint to avoid the
        // temporary "grow taller" reflow on tablets.
        virtualKeyboard.classList.toggle('kb-tablet-size', isTablet);

        // Mobile: Show virtual keyboard initially
        virtualKeyboard.style.visibility = 'hidden';
        virtualKeyboard.style.display = 'block';
        input.setAttribute('readonly', 'readonly');
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        input.blur();

        // ���� Apply Aurelians theme if player is using Aurelians ����
        if (selectedRace === 'AURELIANS') {
            virtualKeyboard.classList.add('kb-aurelians');
        } else {
            virtualKeyboard.classList.remove('kb-aurelians');
        }

        // ���� �z�yƽ��K�Ӵ��o��ֻ�Ĵ�С����� layout������
        if (isTablet) {
            console.log('[Keyboard] Tablet detected, using larger buttons');
            if (typeof window.requestLandscapeForTablet === 'function') {
                window.requestLandscapeForTablet();
            }
        }

        // ���� �{�����}��λ�ã����ⱻ�I�P��ס ����
        const modal = document.getElementById('launch-modal');
        if (modal) {
            modal.style.alignItems = 'flex-start';
            modal.style.paddingTop = '5vh';
        }

        // Lock body scroll to prevent page scrolling
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';

        // Force layout once with the final tablet/mobile classes, then reveal.
        virtualKeyboard.offsetHeight;
        virtualKeyboard.style.visibility = 'visible';
    } else if (!isMobile && (currentPracticeMode === 'READING' || currentPracticeMode === 'LISTENING')) {
        // Desktop: Hide virtual keyboard, show and focus input
        virtualKeyboard.style.display = 'none';
        virtualKeyboard.style.visibility = 'hidden';
        virtualKeyboard.classList.remove('kb-tablet-size');
        input.removeAttribute('readonly');
        input.style.position = 'static';
        input.style.left = 'auto';
        setTimeout(() => input.focus(), 10);
    } else {
        // SPEAKING mode: hide virtual keyboard, hide input
        virtualKeyboard.style.display = 'none';
        virtualKeyboard.style.visibility = 'hidden';
        input.setAttribute('readonly', 'readonly');
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        if (typeof fadeBgm === 'function') fadeBgm(0.05, 450);
    }

// --- �Ӯ��c���� (������) ---
    // 1. �����×l Bar �� 100% (ҕ�X�Ϝʂ��)
    timerBar.style.transition = 'none';
    timerBar.style.width = '100%';
    timerBar.offsetHeight; // Trigger reflow
    
    // 2. �_������f Timer
    if (typeof timerInterval !== 'undefined' && timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // 3. �Q���וr�_ʼӋ�r
    if (currentPracticeMode === 'LISTENING') {
        // �� Listening ģʽ����ͣ���� speakText �x�����_ʼ (�� onend �|�l) ��
        console.log("WAITING FOR AUDIO TO FINISH...");
    } else {
        // �� ����ģʽ (Reading/Speaking)�����t 0.5�� �ἴ���_ʼ ��
        setTimeout(() => {
            // �_��ҕ�����_�o��Ӌ�r
            if (document.getElementById('launch-modal').style.display === 'flex') {
                startCountdownTimer();
            }
        }, 500);
    }

} // <--- ӛ�ñ����@�������Y����̖
// --- 0. �Z���A��ϵ�y (��Q���t) ---
function warmUpVoiceEngine() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        // ��һ�Οo���հ�������������т� Engine
        const emptyMsg = new SpeechSynthesisUtterance(" "); 
        emptyMsg.volume = 0; 
        window.speechSynthesis.speak(emptyMsg);
        console.log("?? Voice Engine Warmed Up!");
    }
}

function clearListeningTimerStartTimeout() {
    if (listeningTimerStartTimeout) {
        clearTimeout(listeningTimerStartTimeout);
        listeningTimerStartTimeout = null;
    }
}

function getListeningVoiceVolume() {
    const baseVolume = (typeof gameVolume !== 'undefined' && Number.isFinite(gameVolume.voice))
        ? gameVolume.voice
        : 1.0;
    return Math.max(0, Math.min(1, baseVolume));
}

function getBoostedListeningVoiceVolume() {
    return Math.max(0, Math.min(1, getListeningVoiceVolume() * LISTENING_VOICE_GAIN));
}

function clearListeningPlaybackBoost() {
    if (!listeningPlaybackBoost) return;
    const boost = listeningPlaybackBoost;
    listeningPlaybackBoost = null;

    try {
        boost.source?.disconnect();
    } catch (_error) {}
    try {
        boost.gain?.disconnect();
    } catch (_error) {}
    try {
        boost.context?.close();
    } catch (_error) {}
}

function applyListeningPlaybackBoost(audio) {
    audio.volume = getListeningVoiceVolume();

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    try {
        const context = new AudioContextClass();
        const source = context.createMediaElementSource(audio);
        const gain = context.createGain();
        gain.gain.value = LISTENING_VOICE_GAIN;
        source.connect(gain);
        gain.connect(context.destination);
        listeningPlaybackBoost = { context, source, gain };
        return context;
    } catch (error) {
        console.warn('[Listening TTS] Playback boost unavailable:', error);
        return null;
    }
}

function getListeningTtsCacheKey(text, locale = 'en-US', levelKey = '') {
    return `${locale}::${levelKey || ''}::${(text || '').trim()}`;
}

function buildListeningVoiceCacheKey(voiceProfile) {
    if (!voiceProfile) return 'default';
    return `${voiceProfile.voiceName || 'default'}::${voiceProfile.accentLocale || ''}`;
}

function getListeningPromptVoiceKey(text, levelKey = '') {
    return `${levelKey || ''}::${(text || '').trim()}`;
}

function resetListeningVoiceCycle() {
    listeningVoiceCycleIndex = null;
    listeningPromptVoiceKey = '';
    listeningPromptVoiceProfile = null;
}

function advanceListeningVoiceProfile() {
    if (!LISTENING_VOICE_ROTATION.length) return null;
    if (listeningVoiceCycleIndex === null) {
        listeningVoiceCycleIndex = Math.floor(Math.random() * LISTENING_VOICE_ROTATION.length);
    } else {
        listeningVoiceCycleIndex = (listeningVoiceCycleIndex + 1) % LISTENING_VOICE_ROTATION.length;
    }
    return { ...LISTENING_VOICE_ROTATION[listeningVoiceCycleIndex] };
}

function ensureListeningPromptVoiceProfile(text, levelKey = '') {
    const promptKey = getListeningPromptVoiceKey(text, levelKey);
    if (listeningPromptVoiceKey !== promptKey || !listeningPromptVoiceProfile) {
        listeningPromptVoiceKey = promptKey;
        listeningPromptVoiceProfile = advanceListeningVoiceProfile();
        if (listeningPromptVoiceProfile) {
            console.log('[Listening Voice]', listeningPromptVoiceProfile.label, listeningPromptVoiceProfile.voiceName, listeningPromptVoiceProfile.accentLocale);
        }
    }
    return listeningPromptVoiceProfile;
}

function peekNextListeningVoiceProfile() {
    if (!LISTENING_VOICE_ROTATION.length) return null;
    const nextIndex = listeningVoiceCycleIndex === null
        ? 0
        : (listeningVoiceCycleIndex + 1) % LISTENING_VOICE_ROTATION.length;
    return { ...LISTENING_VOICE_ROTATION[nextIndex] };
}

function preloadListeningAzureAudio(text, locale = 'en-US', levelKey = '', voiceProfile = null) {
    const cleanText = (text || '').trim();
    if (!cleanText) return Promise.reject(new Error('Text is required for listening TTS.'));

    const cacheKey = `${getListeningTtsCacheKey(cleanText, locale, levelKey)}::${buildListeningVoiceCacheKey(voiceProfile)}`;
    const cached = listeningTtsCache.get(cacheKey);
    if (cached) return cached;

    const request = fetchSpeakingDebriefReferenceAudio(cleanText, locale, {
        mode: 'listening',
        level: levelKey || selectedLevel || 'L1',
        voiceName: voiceProfile?.voiceName || null,
        accentLocale: voiceProfile?.accentLocale || null
    })
        .then((result) => {
            listeningTtsCache.set(cacheKey, Promise.resolve(result));
            return result;
        })
        .catch((error) => {
            listeningTtsCache.delete(cacheKey);
            throw error;
        });

    listeningTtsCache.set(cacheKey, request);
    return request;
}

function prepareListeningPlaybackAsset(text, locale = 'en-US', levelKey = '', voiceProfile = null) {
    const cleanText = (text || '').trim();
    if (!cleanText) return Promise.reject(new Error('Text is required for prepared listening audio.'));

    const cacheKey = `${getListeningTtsCacheKey(cleanText, locale, levelKey)}::${buildListeningVoiceCacheKey(voiceProfile)}`;
    const cached = listeningPreparedAudioCache.get(cacheKey);
    if (cached) return cached;

    const request = preloadListeningAzureAudio(cleanText, locale, levelKey, voiceProfile)
        .then((result) => {
            const binary = atob(result.audioBase64 || '');
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            const objectUrl = URL.createObjectURL(new Blob([bytes], { type: result.format || 'audio/mpeg' }));
            const warmAudio = new Audio(objectUrl);
            warmAudio.preload = 'auto';
            warmAudio.load();

            return {
                ...result,
                objectUrl,
                cacheKey
            };
        })
        .catch((error) => {
            listeningPreparedAudioCache.delete(cacheKey);
            throw error;
        });

    listeningPreparedAudioCache.set(cacheKey, request);
    return request;
}

function stopListeningPlayback() {
    clearListeningTimerStartTimeout();
    listeningPlaybackToken++;
    window.speechSynthesis.cancel();
    clearListeningPlaybackBoost();
    if (!listeningPlaybackAudio) return;
    try {
        listeningPlaybackAudio.pause();
    } catch (_error) {}
    if (listeningPlaybackObjectUrl) {
        URL.revokeObjectURL(listeningPlaybackObjectUrl);
        listeningPlaybackObjectUrl = '';
    }
    listeningPlaybackAudio = null;
}

function estimateListeningTargetFinishMs(text, targetWord, durationMs) {
    const safeText = (text || '').trim();
    const safeTarget = (targetWord || '').trim();
    if (!safeText || !safeTarget || !durationMs || durationMs <= 0) return durationMs;

    const escapedTarget = safeTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedTarget}\\b`, 'i');
    const match = regex.exec(safeText);
    if (!match) return durationMs;

    const endIndex = match.index + match[0].length;
    const ratio = Math.max(0.12, Math.min(0.92, endIndex / safeText.length));
    return Math.round(durationMs * ratio);
}

function getPreviewSentenceForWord(word, modeKey, levelKey) {
    if (!word?.sents || word.sents.length === 0) {
        return {
            text: word?.sent || word?.en || '',
            answer: word?.listeningAnswer || null
        };
    }

    if (modeKey !== 'listening' && modeKey !== 'speaking') {
        const firstSentence = word.sents[0];
        return typeof firstSentence === 'object' && firstSentence?.text
            ? { text: firstSentence.text, answer: firstSentence.answer || null }
            : { text: firstSentence, answer: null };
    }

    const entry = ensureSentenceProgressEntry(modeKey, levelKey, word.en, word.sents.length);
    const previewIndex = entry.queue[0] ?? 0;
    const selected = word.sents[previewIndex];
    return typeof selected === 'object' && selected?.text
        ? { text: selected.text, answer: selected.answer || null }
        : { text: selected, answer: null };
}

function getLikelyNextBattleWord() {
    if (pendingBattleVocab) return pendingBattleVocab;
    if (!Array.isArray(activeVocabList) || activeVocabList.length === 0) return null;

    if (gameMode === 'PVP') {
        const previewPool = activeVocabList.filter(word => !battleUsedWordKeys.has(getBattleWordKey(word)));
        return (previewPool.length > 0 ? previewPool : activeVocabList)[0] || null;
    }

    const masteryKey = (currentPracticeMode || '').toLowerCase();
    const primaryWordPool = (tempGameMode === 'AI' && selectedStageIndex !== null)
        ? getCurrentStagePrimaryWords(masteryKey)
        : activeVocabList;
    const stageReviewPool = (tempGameMode === 'AI' && selectedStageIndex !== null)
        ? getCurrentStageReviewWords(masteryKey)
        : [];

    if (wrongWordsDeck.length > 0) {
        const availableWrongWords = wrongWordsDeck.filter(word => !battleUsedWordKeys.has(getBattleWordKey(word)));
        return (availableWrongWords.length > 0 ? availableWrongWords : wrongWordsDeck)[0] || null;
    }

    const newWords = primaryWordPool.filter(word => {
        if (!userMastery[masteryKey]) return true;
        if (!userMastery[masteryKey][selectedLevel]) return true;
        return !userMastery[masteryKey][selectedLevel][word.en];
    });
    if (newWords.length > 0) return newWords[0];

    const masteredWords = primaryWordPool.filter(word => {
        if (!userMastery[masteryKey]) return false;
        if (!userMastery[masteryKey][selectedLevel]) return false;
        return userMastery[masteryKey][selectedLevel][word.en];
    });
    if (masteredWords.length > 0) return masteredWords[0];

    if (stageReviewPool.length > 0) return stageReviewPool[0];

    return activeVocabList[0] || null;
}

function takeNextAiBattleVocab() {
    const masteryKey = currentPracticeMode.toLowerCase();
    const primaryWordPool = (tempGameMode === 'AI' && selectedStageIndex !== null)
        ? getCurrentStagePrimaryWords(masteryKey)
        : activeVocabList;
    const stageReviewPool = (tempGameMode === 'AI' && selectedStageIndex !== null)
        ? getCurrentStageReviewWords(masteryKey)
        : [];

    if (wrongWordsDeck.length > 0) {
        const availableWrongWords = wrongWordsDeck.filter(word => !battleUsedWordKeys.has(getBattleWordKey(word)));
        const learningPool = availableWrongWords.length > 0 ? availableWrongWords : wrongWordsDeck;
        const pickedWrongWord = pickBattleWordWithCooldown(learningPool);
        if (pickedWrongWord) {
            const removeIndex = wrongWordsDeck.findIndex(word => word.en === pickedWrongWord.en && word.ch === pickedWrongWord.ch);
            if (removeIndex >= 0) wrongWordsDeck.splice(removeIndex, 1);
            console.log(`[Pool 1 - Learning] Wrong word: ${pickedWrongWord.en} (${wrongWordsDeck.length} remaining)`);
            return pickedWrongWord;
        }
    }

    const newWords = primaryWordPool.filter(word => {
        if (!userMastery[masteryKey]) return true;
        if (!userMastery[masteryKey][selectedLevel]) return true;
        if (userMastery[masteryKey][selectedLevel][word.en]) return false;
        return getStageSessionMissCount(word.en) < STAGE_WORD_SESSION_MISS_LIMIT;
    });

    if (newWords.length > 0) {
        const pickedWord = pickBattleWordWithCooldown(newWords);
        if (pickedWord) {
            console.log(`[Pool 2 - Stage New] Fresh word: ${pickedWord.en} (${newWords.length} stage words available)`);
            return pickedWord;
        }
    }

    if (stageReviewPool.length > 0) {
        const pickedWord = pickBattleWordWithCooldown(stageReviewPool);
        if (pickedWord) {
            console.log(`[Pool 3 - Legacy Review] Review word: ${pickedWord.en} (${stageReviewPool.length} prior-stage words available)`);
            return pickedWord;
        }
    }

    const masteredWords = primaryWordPool.filter(word => {
        if (!userMastery[masteryKey]) return false;
        if (!userMastery[masteryKey][selectedLevel]) return false;
        return userMastery[masteryKey][selectedLevel][word.en];
    });

    if (masteredWords.length > 0) {
        const pickedWord = pickBattleWordWithCooldown(masteredWords);
        if (pickedWord) {
            const masteryData = userMastery[masteryKey][selectedLevel][pickedWord.en];
            console.log(`[Pool 4 - Stage Review] Mastered word: ${pickedWord.en} (count: ${masteryData.count})`);
            return pickedWord;
        }
    }

    if (activeVocabList.length === 0) {
        alert("Error: Database is empty!");
        return null;
    }

    const fallbackWord = pickBattleWordWithCooldown(activeVocabList);
    if (fallbackWord) {
        console.log(`[Fallback] Random word: ${fallbackWord.en}`);
    }
    return fallbackWord;
}

function primePendingListeningQuestion() {
    if (gameMode === 'PVP' || currentPracticeMode !== 'LISTENING' || pendingBattleVocab) return;
    const previewWord = takeNextAiBattleVocab();
    if (!previewWord) return;
    pendingBattleVocab = previewWord;
    const preview = getPreviewSentenceForWord(previewWord, 'listening', selectedLevel || 'L1');
    if (preview?.text) {
        const voiceProfile = ensureListeningPromptVoiceProfile(preview.text, selectedLevel || 'L1');
        preloadListeningAzureAudio(
            preview.text,
            'en-US',
            selectedLevel || 'L1',
            voiceProfile
        ).catch(() => {});
    }
}

function preloadLikelyNextListeningPrompt() {
    if (currentPracticeMode !== 'LISTENING') return;
    if (pendingBattleVocab) return;
    const previewWord = getLikelyNextBattleWord();
    if (!previewWord) return;
    const preview = getPreviewSentenceForWord(previewWord, 'listening', selectedLevel || 'L1');
    if (preview?.text) {
        preloadListeningAzureAudio(
            preview.text,
            'en-US',
            selectedLevel || 'L1',
            peekNextListeningVoiceProfile()
        ).catch(() => {});
    }
}

function preloadCurrentListeningPrompt() {
    if (currentPracticeMode !== 'LISTENING' || !currentVocab) return;
    const textToRead = (currentVocab.sent || currentVocab.en || '').trim();
    if (!textToRead) return;
    const voiceProfile = getCurrentListeningVoiceProfile(textToRead, selectedLevel || 'L1');
    preloadListeningAzureAudio(
        textToRead,
        'en-US',
        selectedLevel || 'L1',
        voiceProfile
    ).catch(() => {});
}

function warmListeningPlaybackDuringTargetLock() {
    if (currentPracticeMode !== 'LISTENING') return;

    let textToRead = '';
    let voiceProfile = null;

    if (gameMode === 'PVP') {
        const questionPayload = getPvpDeckQuestion() || null;
        textToRead = String(questionPayload?.sent || questionPayload?.en || '').trim();
        if (questionPayload?.listeningVoiceName) {
            voiceProfile = {
                label: 'PVP Shared',
                voiceName: questionPayload.listeningVoiceName,
                accentLocale: questionPayload.listeningAccentLocale || 'en-US'
            };
        }
    } else if (pendingBattleVocab) {
        const preview = getPreviewSentenceForWord(pendingBattleVocab, 'listening', selectedLevel || 'L1');
        textToRead = String(preview?.text || '').trim();
        if (textToRead) {
            voiceProfile = ensureListeningPromptVoiceProfile(textToRead, selectedLevel || 'L1');
        }
    } else if (currentVocab) {
        textToRead = String(currentVocab.sent || currentVocab.en || '').trim();
        if (textToRead) {
            voiceProfile = getCurrentListeningVoiceProfile(textToRead, selectedLevel || 'L1');
        }
    }

    if (!textToRead) return;

    prepareListeningPlaybackAsset(
        textToRead,
        'en-US',
        selectedLevel || 'L1',
        voiceProfile
    ).catch(() => {});
}

async function playListeningAzureText(text, element = null, startListeningTimer = false) {
    const hiddenInput = document.getElementById('hidden-input');
    const shouldMaintainFocus = hiddenInput && hiddenInput.style.display !== 'none' &&
                                 typeof currentPracticeMode !== 'undefined' && currentPracticeMode === 'LISTENING';

    window.speechSynthesis.cancel();
    document.querySelectorAll('.vocab-row.speaking').forEach(el => el.classList.remove('speaking'));
    stopListeningPlayback();
    const playbackToken = ++listeningPlaybackToken;

    const voiceProfile = getCurrentListeningVoiceProfile(text, selectedLevel || 'L1');
    const result = await prepareListeningPlaybackAsset(text, 'en-US', selectedLevel || 'L1', voiceProfile);
    if (playbackToken !== listeningPlaybackToken) return true;

    const objectUrl = result.objectUrl;
    const audio = new Audio(objectUrl);
    const audioContext = applyListeningPlaybackBoost(audio);
    audio.preload = 'auto';

    const cleanup = () => {
        if (listeningPlaybackAudio === audio) {
            clearListeningPlaybackBoost();
        }
        if (listeningPlaybackObjectUrl === objectUrl) {
            listeningPlaybackObjectUrl = '';
        }
        if (listeningPlaybackAudio === audio) {
            listeningPlaybackAudio = null;
        }
        if (element) element.classList.remove('speaking');
    };

    let listeningCountdownScheduled = false;
    let listeningCountdownStarted = false;
    const scheduleListeningCountdown = () => {
        if (!startListeningTimer || listeningCountdownScheduled) return;

        const durationMs = Number.isFinite(result?.durationMs) && result.durationMs > 0
            ? Math.round(result.durationMs)
            : (Number.isFinite(audio.duration) && audio.duration > 0 ? Math.round(audio.duration * 1000) : 0);

        if (!durationMs) {
            return;
        }

        const listeningTarget = currentVocab?.listeningAnswer || currentVocab?.en || '';
        const estimatedMs = estimateListeningTargetFinishMs(
            currentVocab?.sent ? currentVocab.sent : text,
            listeningTarget,
            durationMs
        );

        listeningCountdownScheduled = true;
        clearListeningTimerStartTimeout();
        listeningTimerStartTimeout = setTimeout(() => {
            listeningTimerStartTimeout = null;
            const modal = document.getElementById('launch-modal');
            if (modal && modal.style.display === 'flex' && typeof startCountdownTimer === 'function' && !timerInterval) {
                listeningCountdownStarted = true;
                console.log(`[Listening Debug] Estimated target finished at ${estimatedMs}ms, starting timer.`);
                startCountdownTimer();
            }
        }, Math.max(250, estimatedMs));
    };

    audio.onplay = () => {
        if (element) element.classList.add('speaking');
        scheduleListeningCountdown();
    };

    audio.onloadedmetadata = () => {
        scheduleListeningCountdown();
    };

    audio.onended = () => {
        clearListeningTimerStartTimeout();
        cleanup();
        if (shouldMaintainFocus && hiddenInput) {
            setTimeout(() => hiddenInput.focus(), 50);
        }
        if (startListeningTimer &&
            typeof currentPracticeMode !== 'undefined' &&
            currentPracticeMode === 'LISTENING' &&
            !listeningCountdownStarted) {
            const modal = document.getElementById('launch-modal');
            if (modal && modal.style.display === 'flex' && typeof startCountdownTimer === 'function' && !timerInterval) {
                listeningCountdownStarted = true;
                startCountdownTimer();
            }
        }
    };

    audio.onerror = () => {
        clearListeningTimerStartTimeout();
        cleanup();
    };

    listeningPlaybackAudio = audio;
    listeningPlaybackObjectUrl = objectUrl;
    if (audioContext?.state === 'suspended') {
        await audioContext.resume().catch(() => {});
    }
    await audio.play();
    return true;
}

function closeLaunchModalUI() {
    const modal = document.getElementById('launch-modal');
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    const hiddenInput = document.getElementById('hidden-input');
    const msgArea = document.getElementById('msg-area');

    if (typeof timerInterval !== 'undefined' && timerInterval) {
        clearInterval(timerInterval);
    }
    timerInterval = null;
    launchTimerPaused = false;
    launchTimerTotal = 0;
    launchTimerTimeLeft = 0;

    if (speakingProcessingTimeout) {
        clearTimeout(speakingProcessingTimeout);
        speakingProcessingTimeout = null;
    }

    if (speakingMediaRecorder && speakingMediaRecorder.state !== 'inactive') {
        speakingMediaRecorder.stop();
    }
    stopListeningPlayback();
    speakingMediaRecorder = null;
    speakingRecordedChunks = [];
    stopSpeakingAudioStream();

    if (modal) {
        modal.style.display = 'none';
        modal.style.alignItems = '';
        modal.style.paddingTop = '';
        modal.classList.remove('aurelians-theme');
    }

    if (virtualKeyboard) {
        virtualKeyboard.style.display = 'none';
        virtualKeyboard.style.visibility = 'hidden';
        virtualKeyboard.classList.remove('kb-aurelians', 'kb-tablet-size');
    }

    if (hiddenInput) {
        hiddenInput.value = '';
        hiddenInput.blur();
        hiddenInput.setAttribute('readonly', 'readonly');
        hiddenInput.style.position = 'absolute';
        hiddenInput.style.left = '-9999px';
    }

    if (msgArea) msgArea.innerText = '';

    // Unlock body scroll / fixed positioning when modal closes
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';

    if (currentPracticeMode === 'SPEAKING' && typeof fadeBgm === 'function') {
        fadeBgm(0.5, 700);
    }

    stopMatrixEffect();
}
    
// --- �����棺̎��ݔ�볬�r ---
function handlePlayerTimeout() {
    if(typeof fadeBgm === 'function') fadeBgm(0.5, 1000);
    attackResolutionLocked = false;
    isTargeting = false;
    closeLaunchModalUI();

    playSound('timeout-sfx');
    
    currentPhase = 'PHASE_SWITCH'; 

    const status = document.getElementById('game-status');
    status.innerHTML = `PHASE: <span style="color:var(--danger)">TIMEOUT - TURN LOST</span>`;
    document.getElementById('control-panel').style.borderColor = selectedRace === 'AURELIANS' ? "#2dd4bf" : "var(--danger)";
    document.getElementById('control-panel').style.boxShadow = selectedRace === 'AURELIANS'
        ? "0 0 15px rgba(45, 212, 191, 0.3)"
        : "0 0 15px rgba(14, 165, 233, 0.3)";
    
    if (typeof battleLog !== 'undefined' && typeof currentVocab !== 'undefined') {
        const lastLog = battleLog[battleLog.length - 1];
        const currentTurn = (typeof turnCounter !== 'undefined' ? turnCounter : 1);
        
        let correctContent = currentVocab.en; 
        let sentenceContent = null;
        if (currentPracticeMode === 'SPEAKING' && currentVocab.sent) {
            correctContent = currentVocab.sent;
        }
        if (currentPracticeMode === 'LISTENING' && currentVocab.sent) {
            correctContent = currentVocab.listeningAnswer || currentVocab.en;
            sentenceContent = currentVocab.sent;
        }

        // �� ���� 3���Lԇ�@ȡݔ���������� ��
        const inputRaw = document.getElementById('hidden-input').value.trim();
        // ������־��@ʾ�֣��o�����@ʾ (TIMEOUT)
        const userDisplay = inputRaw.length > 0 ? inputRaw : "(TIMEOUT)";

        if (!lastLog || lastLog.turn !== currentTurn) {
            battleLog.push({
                turn: currentTurn,
                mode: currentPracticeMode,
                user: userDisplay,    // �� ʹ�Ú�������
                correct: correctContent,
                sentence: sentenceContent,
                isCorrect: false
            });
        }

        // �� �e��ӛ䛣�Timeout ������e
        saveWrongWord(currentPracticeMode, selectedLevel, currentVocab.en);
    }

    // 3. ߉݋��֧ (���ֲ�׃)
    if (gameMode === 'PVP') {
        const { ref, update } = window.firebaseModules;
        const nextTurn = (playerRole === 'host') ? 'guest' : 'host';
        update(ref(db, 'rooms/' + currentRoomId), {
            lastMove: { attacker: playerRole, index: -1, timestamp: Date.now() },
            turn: nextTurn
        });
        setGameTimeout(() => {
            currentPhase = 'ENEMY_TURN';
            document.getElementById('game-status').innerHTML = "OPPONENT'S TURN";
            switchScene('ENEMY');
        }, 1500);
    } else {
        setGameTimeout(() => {
            startEnemyTurn(); 
        }, 1500);
    }
}

// --- 1. Focus Input (Desktop/Mobile Hybrid) ---
    function focusInput() {
        const input = document.getElementById('hidden-input');
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if(input) {
            if (isMobile) {
                // Mobile: Keep input off-screen, virtual keyboard handles input
                // No focus needed to avoid triggering native keyboard
            } else {
                // Desktop: Focus the input for normal keyboard typing
                input.focus();
                const val = input.value;
                input.value = '';
                input.value = val;
            }
        }
    }

// --- 2. ݔ��O �� (�����棺����ո��c��̖) ---
    document.getElementById('hidden-input').oninput = (e) => {
        // A. �@ȡԭʼݔ�� (�D��)
        let rawVal = e.target.value.toUpperCase();
        
        // �� �P�I�������@�e�� Regex ��횰��� \s (�ո�), \- (�B��̖), \' (Ʋ̖)
        // �@�� "LIVING ROOM" �Ŀո�Ų������Ե�
        let displayVal = rawVal.replace(/[^A-Z0-9\s\-\']/g, '');

        // C. ���ɡ�����ĸ���汾 (�Á��Д���e�������)
        // �@�e�҂��������ѷ�̖���ߣ����� "LIVING ROOM" -> "LIVINGROOM"
        let logicVal = displayVal.replace(/[^A-Z0-9]/g, '');

        // D. ��ֹ�򱬸� (�ü���ĸ�L��ȥӋ)
        if (currentVocab && currentVocab.en) {
             // ���� For LISTENING mode, use listeningAnswer if available ����
             const targetWord = (currentPracticeMode === 'LISTENING' && currentVocab.listeningAnswer)
                 ? currentVocab.listeningAnswer
                 : currentVocab.en;
             const targetClean = String(targetWord || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

             if (currentPracticeMode === 'READING' && logicVal.length > targetClean.length) {
                 logicVal = logicVal.substring(0, targetClean.length);
                 displayVal = logicVal;
                 e.target.value = displayVal;
                 if(typeof playSound === 'function') playSound('wrong-sfx');
                 flashVirtualKeyboardErrorKey(lastVirtualKeyboardKey);
                 if(typeof updateSmartDisplay === 'function') {
                     updateSmartDisplay(logicVal);
                 }
                 return;
             }

             if (currentPracticeMode === 'LISTENING') {
                 displayVal = formatInputForTarget(logicVal, targetWord);
             }
        }

        // B. �����пո񡹵İ汾�Ż�ݔ��� (�o��ҿ���Ҳ�o battleLog ��)
        e.target.value = displayVal;

        // E. ��Ч
        if (e.inputType === 'deleteContentBackward') {
            if(typeof playSound === 'function') playSound('delete-sfx');
        } else {
            if(typeof playSound === 'function') playSound('enter-sfx');
        }

        // F. ���®��� (���뼃��ĸȥ������)
        if(typeof updateSmartDisplay === 'function') {
            updateSmartDisplay(logicVal);
        }
    };
    // --- 3. Enter �I�O  (��ȫ�����f�й���) ---
    document.getElementById('hidden-input').onkeydown = (e) => {
        if (e.key === 'Enter') checkAnswer();
    };

    // --- 4. �����@ʾ���� (���ģ��� "WAKEUP" ������ȥ "WAKE UP" �����ж�) ---
    function updateSmartDisplay(inputVal) {
        if (currentPracticeMode === 'LISTENING') {
            const targetWord = currentVocab.listeningAnswer || currentVocab.en;
            const formattedVal = formatInputForTarget(inputVal, targetWord);
            document.getElementById('q-display').innerHTML = renderListeningAnswerDisplay(targetWord, formattedVal);
            return;
        }

        let html = "";
        let inputIdx = 0; // ����ӛס�õ��ڎׂ����ݔ�����ĸ

        const targetWord = currentVocab.en;

        // ����֙z���}Ŀԭ����ʽ (���� "WAKE UP")
        for (let i = 0; i < targetWord.length; i++) {
            const targetChar = targetWord[i];

            if (targetChar === ' ') {
                // �����ո��@ʾ�հ�λ (inputIdx ����)
                html += `<span style="display:inline-block; width:20px;"></span>`;
            }
            else if (targetChar === '-' || targetChar === '\'') {
                // ������̖���@ʾ��ɫ��̖ (inputIdx ����)
                html += `<span style="color:var(--warning); font-weight:bold; margin:0 2px; font-size: 24px;">${targetChar}</span>`;
            }
            else {
                // ������ĸ���z����Ҵ��δ
                if (inputIdx < inputVal.length) {
                    // ��Ҵ�� -> �@ʾԓ��ĸ (�{ɫ)
                    html += `<span style="color:var(--primary); font-weight:bold;">${inputVal[inputIdx]}</span> `;
                    inputIdx++; // ����һ�������ĸ
                } else {
                    // δ�� -> �@ʾ�׾�
                    html += `_ `;
                }
            }
        }
        document.getElementById('q-display').innerHTML = html;
    }

    // ���˼��ݣ����f�� updateDisplay ָ���º��� updateSmartDisplay
    window.updateDisplay = updateSmartDisplay;

// ���� PHASE 4: DYNAMIC XP & MASTERY CALCULATION ����
function handleCorrectAnswer() {
    // Convert currentPracticeMode to lowercase for mastery key (READING -> reading)
    const masteryKey = currentPracticeMode.toLowerCase();
    const wordId = currentVocab.en;

    // Initialize mastery structure if needed
    if (!userMastery[masteryKey]) userMastery[masteryKey] = {};
    if (!userMastery[masteryKey][selectedLevel]) userMastery[masteryKey][selectedLevel] = {};

    // Get current count (default to 0 if word is new)
    const currentCount = userMastery[masteryKey][selectedLevel][wordId]?.count || 0;

    // Calculate XP based on half-life formula
    let xpGained = 0;
    if (currentCount === 0) {
        xpGained = 100; // New word
    } else if (currentCount === 1) {
        xpGained = 50;
    } else if (currentCount === 2) {
        xpGained = 25;
    } else {
        xpGained = 10; // Cap at 10 XP for count >= 3
    }

    // Update global XP
    userTotalXP += xpGained;
    syncUserProgressGlobals();

    // ���� SUPPLIES SYSTEM: Earn supplies for correct answers ����
    let suppliesGained = 0;
    if (currentCount === 0) {
        suppliesGained = 10; // New word: 10 supplies
    } else if (currentCount === 1) {
        suppliesGained = 5; // Second time: 5 supplies
    } else if (currentCount === 2) {
        suppliesGained = 3; // Third time: 3 supplies
    } else {
        suppliesGained = 1; // Cap at 1 supply for count >= 3
    }

    userSupplies += suppliesGained;
    syncUserProgressGlobals();
    console.log(`[Supplies] Earned ${suppliesGained} supplies, total: ${userSupplies}`);

    // ���� ENERGY SYSTEM: ���_���} +1 energy (���зN��) ����
    if (typeof addEnergy === 'function') {
        addEnergy(1, 'Correct Answer');
    }

    // ���� PHASE 5: Track session XP and Supplies ����
    sessionAnsweringXP += xpGained;
    sessionSupplies += suppliesGained;

    // Update mastery for this word
    userMastery[masteryKey][selectedLevel][wordId] = {
        count: currentCount + 1,
        status: 1
    };

    console.log(`[XP] +${xpGained} XP | Word: ${wordId} | Count: ${currentCount} -> ${currentCount + 1} | Total XP: ${userTotalXP}`);

    // Update Firebase instantly
    if (window.myPlayerId && window.db) {
        const { ref, update } = window.firebaseModules;
        const userRef = ref(window.db, 'users/' + window.myPlayerId);

        // Update both XP, Supplies and this specific word's mastery
        const updates = {};
        updates['xp'] = userTotalXP;
        updates['supplies'] = userSupplies;
        updates[`mastery/${masteryKey}/${selectedLevel}/${wordId}`] = {
            count: currentCount + 1,
            status: 1
        };

        update(userRef, updates).then(() => {
            console.log(`[Firebase] Synced XP (${userTotalXP}), Supplies (${userSupplies}) and mastery for ${wordId}`);
            updateSuppliesDisplay();
        }).catch(e => {
            console.warn('[Firebase] Update failed:', e);
        });
    }

    // Update HUD to reflect new rank
    if (typeof updateHUD === 'function') {
        const cachedName = localStorage.getItem('battleship_username');
        if (cachedName) updateHUD(cachedName);
    }
}

// --- �����棺�ˌ��� (���ܟoҕ��̖) ---
function checkAnswer() {
    const input = document.getElementById('hidden-input');

    // 1. ���ݔ�룺�D�� + �Ƴ����пո�ͬ���c (ֻ�� A-Z ͬ 0-9)
    // ����ݔ�� "cup of tea" �� "cupoftea" ����׃�� "CUPOFTEA"
    const cleanInput = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // 2. ���_�𰸣�ͬ��̎��
    // ���� For LISTENING mode, use listeningAnswer if available (new format) ����
    let targetAnswer = currentVocab.en;
    if (currentPracticeMode === 'LISTENING' && currentVocab.listeningAnswer) {
        targetAnswer = currentVocab.listeningAnswer;
        console.log(`[Check Answer] Using listeningAnswer: "${targetAnswer}"`);
    }

    // ���� "high-quality" ��׃�� "HIGHQUALITY"
    const cleanTarget = targetAnswer.toUpperCase().replace(/[^A-Z0-9]/g, '');

    const isCorrect = (cleanInput === cleanTarget);

    // ���� ӛ� Log ߉݋ (ʹ�� targetAnswer ���� currentVocab.en) ����
    if (typeof battleLog !== 'undefined') {
        const currentTurn = (typeof turnCounter !== 'undefined' ? turnCounter : 1);
        const existingLogIndex = battleLog.findIndex(log => log.turn === currentTurn);

        if (existingLogIndex !== -1) {
            battleLog[existingLogIndex].user = input.value;
            battleLog[existingLogIndex].isCorrect = isCorrect;
        } else {
            battleLog.push({
                turn: currentTurn,
                user: input.value,
                correct: targetAnswer,  // �� Use targetAnswer instead of currentVocab.en
                isCorrect: isCorrect,
                mode: currentPracticeMode,  // ���� Add mode for display logic ����
                sentence: currentVocab.sent || null  // ���� Add sentence for LISTENING mode ����
            });
        }
    }

    // �� �e��ӛ䛣�������Ƴ������e��ӛ�
    if (isCorrect) {
        removeWrongWord(currentPracticeMode, selectedLevel, currentVocab.en);
        // ���� PHASE 4: Call XP & Mastery handler ����
        handleCorrectAnswer();
    } else {
        saveWrongWord(currentPracticeMode, selectedLevel, currentVocab.en);
        if (isCurrentStagePrimaryWord(currentVocab)) {
            recordStageSessionMiss(currentVocab.en);
            console.log(`[Stage Miss] ${currentVocab.en} miss count: ${getStageSessionMissCount(currentVocab.en)}/${STAGE_WORD_SESSION_MISS_LIMIT}`);
        }
    }

    // �Y��̎��
    if (isCorrect) {
        playerFire(true);
    } else {
        playSound('wrong-sfx');
        document.getElementById('msg-area').innerText = "CODE INVALID!";
        const d = document.getElementById('q-display');
        d.style.color = "var(--danger)";
        setTimeout(() => d.style.color = "var(--primary)", 500);
    }
}

    // --- 10. ������� ---
function playerFire(success) {
    fadeBgm(0.5, 1000);
    // 1. ���������ͣӋ�r�����P�]����
    closeLaunchModalUI();

    if (success) {
        // ============================
        // �� ��֧ A��PVP ����ģʽ ��
        // ============================
        if (gameMode === 'PVP') {
            const { ref, update } = window.firebaseModules;

            // ���� ANTI-FARMING: Increment turn count ����
            currentTurnCount++;
            console.log(`[PVP] Turn count: ${currentTurnCount}`);

            // 1. Ӌ����һλ�S߅��
            const nextTurn = (playerRole === 'host') ? 'guest' : 'host';

            // 2. ���� Firebase (�ρ���һ�� Update)
            update(ref(db, 'rooms/' + currentRoomId), {
                lastMove: { attacker: playerRole, index: currentTargetIndex, timestamp: Date.now() },
                turn: nextTurn // �� ���ƽ�����Ԓ� DB ֪����݆����һλ��
            });

            // 3. ���Űl��Ӯ�
            const cell = document.getElementById('enemy-grid').children[currentTargetIndex];
            cell.classList.add('revealed');
            playSound('laser-sfx');
            triggerAnimation(cell, 'blue');

            // 4. ���t 0.5�� �@ʾ�Y�� (�Ȱl��Ӯ���һ�)
            setGameTimeout(() => {
                if (enemyGrid[currentTargetIndex] === 1) {
                    // --- ���� (HIT) ---
                    cell.classList.add('hit');
                    triggerAnimation(cell, 'orange');
                    
                    enemyDamage++;
                    
                    // �z����
                    const isSunk = checkEnemyShipDestruction(currentTargetIndex);
                    if (!isSunk) playSound('hit-sfx'); // �o���Ȳ� Hit ��������� Destroy 

                    if (checkGameOver()) return; // ����A����ͣ
                } else {
                    // --- ��ʧ (MISS) ---
                    cell.classList.add('miss');
                    cell.innerHTML = '<img src="close.png" class="miss-icon">';
                }

                refreshRadarScanDisplays();

                // �� 5. �P�I�O�������L�� 3�� �����D�� (׌����������) ��
                setGameTimeout(() => {
                    currentPhase = 'ENEMY_TURN';
                    document.getElementById('game-status').innerHTML = "OPPONENT'S TURN";
                    switchScene('ENEMY'); 
                }, 3000); 

            }, 500);

        } 
        // ============================
        // �� ��֧ B��AI �ΙCģʽ ��
        // ============================
        else {
            playSound('laser-sfx');
            const cell = document.getElementById('enemy-grid').children[currentTargetIndex];
            cell.classList.add('revealed');
            triggerAnimation(cell, 'blue');
            
            setGameTimeout(() => {
                let isGameOver = false; 

                if (enemyGrid[currentTargetIndex] === 1) {
                    cell.classList.add('hit');
                    triggerAnimation(cell, 'orange');
                    enemyDamage++;
                    const isSunk = checkEnemyShipDestruction(currentTargetIndex);
                    if (!isSunk) playSound('hit-sfx');
                    if (checkGameOver()) isGameOver = true;
                } else {
                    cell.classList.add('miss');
                    cell.innerHTML = '<img src="close.png" class="miss-icon">';
                }

                refreshRadarScanDisplays();

                if (!isGameOver) {
                    // AI ģʽ����솬���S�� 0.7�� �D��
                    setGameTimeout(startEnemyTurn, 700);
                }
            }, 500);
        }
    }
}
// �� ������AI �����i��ϵ�y (�����Еr�����܇����м���׷������)
function addSmartTargets(index) {
    const targets = [];
    const r = Math.floor(index / GRID_SIZE);
    const c = index % GRID_SIZE;

    // ���� �ϡ��¡����� �Ă����
    if (r > 0) targets.push(index - GRID_SIZE); // ��
    if (r < GRID_SIZE - 1) targets.push(index + GRID_SIZE); // ��
    if (c > 0) targets.push(index - 1); // ��
    if (c < GRID_SIZE - 1) targets.push(index + 1);

    // (Optional) �S�C��y������ AI �o��Cе��
    targets.sort(() => Math.random() - 0.5);

    // ��δ���^��λ���� Stack
    targets.forEach(t => {
        if (!enemyShots.includes(t) && !aiTargetStack.includes(t)) {
            aiTargetStack.push(t);
        }
    });
}

function getPlayerCell(index) {
    const grid = document.getElementById('player-grid');
    return grid ? grid.children[index] : null;
}

function countAiRadarTargets(centerIndex) {
    return getRadarAreaIndices(centerIndex).filter(index => {
        if (index === centerIndex) return false;
        const cell = getPlayerCell(index);
        return myGrid[index] === 1 && cell && !cell.classList.contains('hit');
    }).length;
}

function refreshAiRadarIntel() {
    aiRadarIntel = aiRadarIntel.map(entry => ({
        ...entry,
        remaining: countAiRadarTargets(entry.centerIndex)
    }));
}

function getAiRadarEligibleCenters() {
    return enemyShots.filter(index => {
        const cell = getPlayerCell(index);
        return cell && cell.classList.contains('miss') && !aiRadarScannedCenters.has(index);
    });
}

function chooseBestAiRadarCenter() {
    const eligible = getAiRadarEligibleCenters();
    if (eligible.length === 0) return null;

    let bestScore = -1;
    let bestCenters = [];

    eligible.forEach(centerIndex => {
        const unknownCells = getRadarAreaIndices(centerIndex).filter(index => {
            if (index === centerIndex) return false;
            return !enemyShots.includes(index);
        }).length;

        if (unknownCells > bestScore) {
            bestScore = unknownCells;
            bestCenters = [centerIndex];
        } else if (unknownCells === bestScore) {
            bestCenters.push(centerIndex);
        }
    });

    if (bestCenters.length === 0) return eligible[0];
    return bestCenters[Math.floor(Math.random() * bestCenters.length)];
}

function getBestAiTargetFromRadarIntel() {
    refreshAiRadarIntel();

    const scores = new Map();
    aiRadarIntel.forEach(entry => {
        if (entry.remaining <= 0) return;

        entry.area.forEach(index => {
            if (index === entry.centerIndex) return;
            if (enemyShots.includes(index)) return;
            scores.set(index, (scores.get(index) || 0) + entry.remaining);
        });
    });

    if (scores.size === 0) return null;

    let bestScore = -1;
    let bestTargets = [];
    scores.forEach((score, index) => {
        if (score > bestScore) {
            bestScore = score;
            bestTargets = [index];
        } else if (score === bestScore) {
            bestTargets.push(index);
        }
    });

    return bestTargets[Math.floor(Math.random() * bestTargets.length)];
}

function getAiAvoidCells() {
    refreshAiRadarIntel();
    const avoid = new Set();
    aiRadarIntel.forEach(entry => {
        if (entry.remaining !== 0) return;
        entry.area.forEach(index => {
            if (index !== entry.centerIndex) avoid.add(index);
        });
    });
    return avoid;
}

function updateAiRadarIntel(centerIndex, result) {
    const existingIndex = aiRadarIntel.findIndex(entry => entry.centerIndex === centerIndex);
    const intel = {
        centerIndex,
        area: getRadarAreaIndices(centerIndex),
        remaining: result
    };

    if (existingIndex >= 0) {
        aiRadarIntel[existingIndex] = intel;
    } else {
        aiRadarIntel.push(intel);
    }
}

function performAiRadarScan(centerIndex) {
    const status = document.getElementById('game-status');
    if (status) {
        status.innerHTML = `PHASE: <span style="color:var(--primary)">ENEMY RADAR SCAN</span>`;
    }

    playRadarScanOnBoard({
        gridId: 'player-grid',
        centerIndex,
        getCell: getPlayerCell,
        countTargets: countAiRadarTargets,
        scannedSet: aiRadarScannedCenters,
        onScanComplete: (result) => {
            updateAiRadarIntel(centerIndex, result);
            setGameTimeout(aiFire, AI_RADAR_ATTACK_DELAY);
        }
    });
}

function getAiKnownHitIndices() {
    const hits = [];
    const grid = document.getElementById('player-grid');
    if (!grid) return hits;

    for (let i = 0; i < myGrid.length; i++) {
        const cell = grid.children[i];
        if (cell && cell.classList.contains('hit')) {
            hits.push(i);
        }
    }

    return hits;
}

function getAdjacentIndices(index) {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const adjacent = [];

    if (row > 0) adjacent.push(index - GRID_SIZE);
    if (row < GRID_SIZE - 1) adjacent.push(index + GRID_SIZE);
    if (col > 0) adjacent.push(index - 1);
    if (col < GRID_SIZE - 1) adjacent.push(index + 1);

    return adjacent;
}

function isValidAiTargetIndex(index) {
    return Number.isInteger(index) && index >= 0 && index < GRID_SIZE * GRID_SIZE;
}

const AI_SKILL_COSTS = {
    radar: 4,
    explosion: 7,
    nuke: 20
};

function aiCanUseBattleSkills() {
    return gameMode === 'AI' && enemyRace === 'VANGUARDS';
}

function getAiSkillCost(skill) {
    return AI_SKILL_COSTS[skill] ?? Infinity;
}

function addAiEnergy(amount, reason) {
    aiEnergy = Math.max(0, aiEnergy + amount);
    console.log(`[AI Energy] ${amount >= 0 ? '+' : ''}${amount} (${reason}) �� Total: ${aiEnergy}`);
}

function spendAiEnergy(skill) {
    const cost = getAiSkillCost(skill);
    if (!aiCanUseBattleSkills() || aiEnergy < cost) return false;
    aiEnergy = Math.max(0, aiEnergy - cost);
    console.log(`[AI Energy] -${cost} (${skill.toUpperCase()}) �� Total: ${aiEnergy}`);
    return true;
}

function evaluateAiMissileAnchor(topLeftIndex) {
    const indices = getExplosionAreaIndices(topLeftIndex, 2);
    if (indices.length !== 4) return null;

    const unshotIndices = indices.filter(index => !enemyShots.includes(index));
    if (unshotIndices.length === 0) return null;

    const knownHits = new Set(getAiKnownHitIndices());
    const avoidCells = getAiAvoidCells();
    let score = 0;

    unshotIndices.forEach(index => {
        aiRadarIntel.forEach(entry => {
            if (entry.remaining > 0 && entry.area.includes(index)) {
                score += entry.remaining * 1.6;
            }
        });

        if (avoidCells.has(index)) {
            score -= 1.2;
        }

        if (getAdjacentIndices(index).some(adj => knownHits.has(adj))) {
            score += 2.5;
        }
    });

    score += Math.max(0, unshotIndices.length - 1) * 0.6;

    return { topLeftIndex, score, unshotCount: unshotIndices.length };
}

function evaluateAiNukeAnchor(topLeftIndex) {
    const indices = getExplosionAreaIndices(topLeftIndex, 4);
    if (indices.length !== 16) return null;

    const unshotIndices = indices.filter(index => !enemyShots.includes(index));
    if (unshotIndices.length === 0) return null;

    const knownHits = new Set(getAiKnownHitIndices());
    const avoidCells = getAiAvoidCells();
    let score = 0;
    let positiveIntelCells = 0;

    unshotIndices.forEach(index => {
        let cellIntelScore = 0;

        aiRadarIntel.forEach(entry => {
            if (entry.remaining > 0 && entry.area.includes(index)) {
                cellIntelScore += entry.remaining * 1.9;
            }
        });

        if (cellIntelScore > 0) {
            positiveIntelCells++;
            score += cellIntelScore;
        }

        if (avoidCells.has(index)) {
            score -= 1.35;
        }

        const adjacentHitCount = getAdjacentIndices(index).filter(adj => knownHits.has(adj)).length;
        score += adjacentHitCount * 2.8;
    });

    score += Math.max(0, positiveIntelCells - 2) * 1.2;
    score += Math.max(0, unshotIndices.length - 6) * 0.35;

    return {
        topLeftIndex,
        score,
        unshotCount: unshotIndices.length,
        positiveIntelCells
    };
}

function chooseBestAiMissileAnchor() {
    refreshAiRadarIntel();

    let best = null;
    for (let row = 0; row < GRID_SIZE - 1; row++) {
        for (let col = 0; col < GRID_SIZE - 1; col++) {
            const candidate = evaluateAiMissileAnchor(row * GRID_SIZE + col);
            if (!candidate) continue;

            if (!best || candidate.score > best.score) {
                best = candidate;
            }
        }
    }

    if (!best) return null;
    if (best.score < 4.2) return null;
    return best.topLeftIndex;
}

function chooseBestAiNukeAnchor() {
    refreshAiRadarIntel();

    let best = null;
    for (let row = 0; row < GRID_SIZE - 3; row++) {
        for (let col = 0; col < GRID_SIZE - 3; col++) {
            const candidate = evaluateAiNukeAnchor(row * GRID_SIZE + col);
            if (!candidate) continue;

            if (!best || candidate.score > best.score) {
                best = candidate;
            }
        }
    }

    if (!best) return null;

    const hasKnownHits = getAiKnownHitIndices().length > 0;
    const hasActionableIntel = aiRadarIntel.some(entry => entry.remaining > 0);

    if (best.unshotCount < 8) return null;
    if (best.positiveIntelCells < 3 && !hasKnownHits) return null;
    if (best.score < (hasKnownHits || hasActionableIntel ? 11.5 : 14.5)) return null;

    return best.topLeftIndex;
}

function performAiMissileStrike(topLeftIndex) {
    const indices = getExplosionAreaIndices(topLeftIndex, 2);
    if (indices.length !== 4) {
        aiFire();
        return;
    }

    if (!spendAiEnergy('explosion')) {
        aiFire();
        return;
    }

    indices.forEach(index => {
        if (!enemyShots.includes(index)) enemyShots.push(index);
    });

    const status = document.getElementById('game-status');
    if (status) {
        status.innerHTML = `PHASE: <span style="color:var(--warning)">ENEMY MISSILE STRIKE</span>`;
    }

    const lockOverlay = createMissileLockOverlay('player-grid', topLeftIndex);
    setGameTimeout(() => {
        playSound('missile-flying-sfx');
        playMissileStrikeAnimation('player-grid', topLeftIndex, lockOverlay, () => {
            const isGameOver = applyExplosionDamageToPlayer(indices);
            document.getElementById('warning-overlay').style.display = 'none';
            refreshAiRadarIntel();

            if (!isGameOver) {
                setGameTimeout(startPlayerTurn, 700);
            }
        });
    }, MISSILE_LOCK_ON_DURATION);
}

function performAiNukeStrike(topLeftIndex) {
    const indices = getExplosionAreaIndices(topLeftIndex, 4);
    if (indices.length !== 16) {
        aiFire();
        return;
    }

    if (!spendAiEnergy('nuke')) {
        aiFire();
        return;
    }

    indices.forEach(index => {
        if (!enemyShots.includes(index)) enemyShots.push(index);
    });

    const status = document.getElementById('game-status');
    if (status) {
        status.innerHTML = `PHASE: <span style="color:var(--danger)">ENEMY NUCLEAR STRIKE</span>`;
    }

    playSound('nuke-detected-sfx');
    const lockOverlay = createNukeLockOverlay('player-grid', topLeftIndex);

    setGameTimeout(() => {
        playSound('missile-flying-sfx');
        let isGameOver = false;

        playNukeStrikeAnimation('player-grid', topLeftIndex, lockOverlay, () => {
            isGameOver = applyExplosionDamageToPlayer(indices);
            refreshAiRadarIntel();
        }, () => {
            document.getElementById('warning-overlay').style.display = 'none';

            if (!isGameOver) {
                setGameTimeout(startPlayerTurn, 700);
            }
        });
    }, NUKE_LOCK_ON_DURATION);
}

function aiTakeTurn() {
    if (currentPhase === 'GAME_OVER') return;

    refreshAiRadarIntel();

    if (aiCanUseBattleSkills()) {
        if (aiEnergy >= getAiSkillCost('nuke')) {
            const nukeAnchor = chooseBestAiNukeAnchor();
            if (nukeAnchor !== null) {
                performAiNukeStrike(nukeAnchor);
                return;
            }
        }

        if (aiEnergy >= getAiSkillCost('explosion')) {
            const missileAnchor = chooseBestAiMissileAnchor();
            if (missileAnchor !== null) {
                performAiMissileStrike(missileAnchor);
                return;
            }
        }

        if (aiEnergy >= getAiSkillCost('radar') && aiTargetStack.length === 0 && !getBestAiTargetFromRadarIntel()) {
            const radarCenter = chooseBestAiRadarCenter();
            if (radarCenter !== null && spendAiEnergy('radar')) {
                playSound('radar-sfx');
                performAiRadarScan(radarCenter);
                return;
            }
        }
    }

    aiFire();
}

function aiFire() {
    playSound('laser-sfx');
    let t;
    
    // --- 1. �����xλ߉݋ (Smart Targeting) ---
    // ��� Target Stack ��Ŀ�� (���S֮ǰ�����^)�����ȹ����λ
    if (aiTargetStack.length > 0) {
        // ȡ������һ��Ŀ�� (Pop)
        // ѭ�hֱ������һ��δ���^�� (��ֹ���})
        do {
            if (aiTargetStack.length === 0) break;
            t = aiTargetStack.pop();
        } while (enemyShots.includes(t));
    }
    
    // ��� Stack ���� (���S׷���ꮅ��δ�����^)������ȡ����Ŀ��ԭ���ѽ����^
    // ��׃�ء��S�C�y��
    if (!isValidAiTargetIndex(t) || enemyShots.includes(t)) {
        t = getBestAiTargetFromRadarIntel();
    }

    if (!isValidAiTargetIndex(t) || enemyShots.includes(t)) {
        const avoidCells = getAiAvoidCells();
        const preferredTargets = [];
        const fallbackTargets = [];

        for (let i = 0; i < 100; i++) {
            if (enemyShots.includes(i)) continue;
            fallbackTargets.push(i);
            if (!avoidCells.has(i)) preferredTargets.push(i);
        }

        const pool = preferredTargets.length > 0 ? preferredTargets : fallbackTargets;
        if (pool.length > 0) {
            t = pool[Math.floor(Math.random() * pool.length)];
        }
    }

    if (!isValidAiTargetIndex(t) || enemyShots.includes(t)) {
        const remainingTargets = [];
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            if (!enemyShots.includes(i)) remainingTargets.push(i);
        }

        if (remainingTargets.length === 0) {
            document.getElementById('warning-overlay').style.display = 'none';
            setGameTimeout(startPlayerTurn, 300);
            return;
        }

        t = remainingTargets[Math.floor(Math.random() * remainingTargets.length)];
    }

    enemyShots.push(t);
    
    // --- 2. ���й��� ---
    const cell = document.getElementById('player-grid').children[t];
    cell.classList.add('revealed');
    triggerAnimation(cell, 'blue');
    
    setGameTimeout(() => {
        let isGameOver = false; 

        if (myGrid[t] === 1) { // �� �����ˣ�
            cell.classList.add('hit');
            playSound('hit-sfx');
            triggerAnimation(cell, 'orange');
            myDamage++;

            // ���� AURELIANS: ��Ş������ +2 energy ����
            if (selectedRace === 'AURELIANS' && typeof addEnergy === 'function') {
                addEnergy(2, 'Ship Hit');
            }

            // ��������׷��
            addSmartTargets(t);

            // ���� �P�I߉݋���șz���Пo�������ٛQ����߅�� ����
            // checkMyShipDestruction ���Ҫ�؂� true/false ����Ч
            const isDestroyed = checkMyShipDestruction(t);

            if (isDestroyed) {
                playSound('unit-lost-sfx'); // �������� Unit Lost
                // �� ������������ ��
                document.body.classList.add('screen-shake-sunk');
                setTimeout(() => document.body.classList.remove('screen-shake-sunk'), 800);
            } else {
                playUnderAttackAlert();     // δ������ Under Attack
                // �� ���У��p΢��� ��
                document.body.classList.add('screen-shake-hit');
                setTimeout(() => document.body.classList.remove('screen-shake-hit'), 400);
            }

            if (checkGameOver()) {
                isGameOver = true;
            }
        } else {
            // ��ʧ
            cell.classList.add('miss'); 
            cell.innerHTML = '<img src="close.png" class="miss-icon">';
        }

        document.getElementById('warning-overlay').style.display = 'none';
        renderBattleMinimap('ENEMY');

        if (!isGameOver) {
            setGameTimeout(startPlayerTurn, 700);
        }
    }, 500);
}

function startPlayerTurn() {
        if (currentPhase === 'GAME_OVER') return;
        attackResolutionLocked = false;
        isTargeting = false;
        // �� �������غϔ� +1 ��
        turnCounter++;
        document.getElementById('turn-count').innerText = turnCounter;

        // ���� VANGUARDS ÿ�� turn �Ԅ� +1 energy ����
        if (selectedRace === 'VANGUARDS') {
            addEnergy(1, 'Turn Start');
        }

        // �ГQ����
        currentPhase = 'PLAYER_TURN';
        switchScene('PLAYER');

        // --- 10���xλ���� ---
        startTurnSelectionTimer(true);
    }

function checkMyShipDestruction(hitIdx) {
    let targetShip = null;
    let targetIndex = -1;
    
    FLEET.forEach((ship, index) => {
        if (ship.indices && ship.indices.includes(hitIdx)) {
            targetShip = ship;
            targetIndex = index;
        }
    });
    
    if (!targetShip || targetShip.revealed) return false; 

    // �z��ȫ���Ƿ񱻴���
    const allHit = targetShip.indices.every(idx => {
        const cell = document.getElementById('player-grid').children[idx];
        return cell.classList.contains('hit');
    });

    if (allHit) {
        revealMyShip(targetShip, targetIndex);
        return true; // �� �P�I�������؂� true
    }
    return false; // �� �P�I��δ���؂� false
}

 // �� ��K�ޏͰ棺�@ʾ���Լ�����Ş���� (�Ƴ� absolute���������ܙz�y) ��
    // �� �����棺�@ʾ���Լ�����Ş���� (�K�[��ԭ����Æ���) ��
    function revealMyShip(ship, index) {
    ship.revealed = true;

    // ���� ӛ䛂S���һ�α� (��춿��ƄӮ�) ����
    const isFirstReveal = !ship.animationPlayed;
    if (isFirstReveal) {
        ship.animationPlayed = true;
    }

    const shipBounds = getShipBoundsFromIndices(ship.indices);
    if (!shipBounds) return;
    const grid = document.getElementById('player-grid');
    if (!grid) return;

    // --- �� �[��ԭ����Æ��� (�����دB�@ʾ) �� ---
    const originalShipImg = document.getElementById(`board-ship-${index}`);
    if (originalShipImg) {
        originalShipImg.style.display = 'none'; // �[���f�D
    }

    // --- 4. ������p�DƬ ---
    let isVertical = ship.isVertical;

    // (��ȫ��ʩ) ��� undefined (�����f��n)���Lԇ���f�������㣬�� 2x4 ���ܕ��e
    if (isVertical === undefined && ship.indices.length > 1) {
         const spanRows = shipBounds.bottomRow - shipBounds.topRow + 1;
         const spanCols = shipBounds.rightCol - shipBounds.leftCol + 1;
         isVertical = spanRows >= spanCols;
    }

    const img = createPositionedShipImage('player-grid', shipBounds.rootIndex, ship, isVertical, {
        src: (typeof DAMAGED_IMAGES !== 'undefined' && DAMAGED_IMAGES[index]) ? DAMAGED_IMAGES[index] : ship.img,
        className: 'enemy-ship-revealed',
        extraClasses: !isFirstReveal ? ['no-animation'] : [],
        zIndex: 10,
        containerId: 'player-board'
    });

    if (!img) return;

    grid.appendChild(img);
    
    playSound('destroy-sfx'); 
}
// �� ����ȫ��׃�� (Ո�_������ global �^������ let enemyShots = []; ����) ��
// �� ��������ʼ����܊��B�� ��
// �� �°棺��ʼ����܊��B�� (�����������K) ��
    // �� 2.0 �棺������Ş�Π����ɷ��K ��
    function initEnemyFleetIndicator() {
        const container = document.getElementById('enemy-fleet-indicator');
        container.innerHTML = '';

        // ���� ʹ�� AI ���ֵķN������ ����
        const enemyFleet = (gameMode === 'AI') ? getFleetConfig(enemyRace) : FLEET;

        enemyFleet.forEach((ship, index) => {
            const shipBlock = document.createElement('div');
            shipBlock.id = `indicator-ship-${index}`; 
            shipBlock.classList.add('enemy-ship-block');
            
            // �� �P�I 1���O���W��韶� ��
            // �������� width �O���Ў׶�ֱ�� (columns)
            shipBlock.style.gridTemplateColumns = `repeat(${ship.width}, 1fr)`;

            // �� �P�I 2���Q�����ЁѾ� ��
            // ����ʹ�ô�ֱ�Ѿ� layoutV (����)����t��ȫ��M
            let layout = [];
            
            if (ship.custom && ship.layoutV) {
                // ����S���⴬ (���� T��)�������� layoutV
                layout = ship.layoutV;
            } else {
                // ����S��ͨ��������һ��ȫ�S 1 ����� (�L�� = width * height)
                layout = Array(ship.width * ship.height).fill(1);
            }

            // �� �P�I 3�����ɸ��� ��
            layout.forEach(status => {
                const cell = document.createElement('div');
                cell.classList.add('indicator-cell');
                
                // ��� layout �S 0��������S�՚� (���� T�ʹ���ȱ��)
                if (status === 0) {
                    cell.classList.add('cell-empty');
                }
                
                shipBlock.appendChild(cell);
            });
            
            container.appendChild(shipBlock);
        });
    }

// �� �°棺��� �B (׃����) ��
// �� ��� �B (׃���ģ�����͸����) ��
    function updateEnemyIndicator(shipId) {
        const shipBlock = document.getElementById(`indicator-ship-${shipId}`);
        if (shipBlock) {
            // ֻ�xȡ����͸�����ĸ��Ё�׃����
            const cells = shipBlock.querySelectorAll('.indicator-cell:not(.cell-empty)');
            cells.forEach(cell => {
                cell.classList.add('cell-destroyed');
            });
        }
    }

    // ���� ENERGY ϵ�y���� ����
    function updateEnergyDisplay() {
        const energyDisplay = document.getElementById('energy-count');
        if (energyDisplay) {
            energyDisplay.innerText = playerEnergy;
        }
    }

    function addEnergy(amount, reason) {
        const startEnergy = playerEnergy;
        const targetEnergy = playerEnergy + amount;

        console.log(`[Energy] +${amount} (${reason}) �� Total: ${targetEnergy}`);

        // ���� �����f���Ӯ� ����
        const duration = 500; // �Ӯ����m�r�g (ms)
        const steps = Math.min(amount, 20); // ��� 20 ��������̫��
        const stepDuration = duration / steps;
        const increment = amount / steps;

        let currentStep = 0;
        const animationInterval = setInterval(() => {
            currentStep++;
            playerEnergy = Math.round(startEnergy + (increment * currentStep));

            if (currentStep >= steps) {
                playerEnergy = targetEnergy; // �_����Kֵ���_
                updateEnergyDisplay();
                clearInterval(animationInterval);
                if (typeof updateSkillStates === 'function') updateSkillStates();
            } else {
                updateEnergyDisplay();
            }
        }, stepDuration);

        // �� �@ʾ +Energy �����Ӯ� ��
        showEnergyGainAnimation(amount);
    }

    function showEnergyGainAnimation(amount) {
        const energyDisplay = document.getElementById('energy-count');
        if (!energyDisplay) return;

        const popup = document.createElement('div');
        popup.innerText = `+${amount}`;
        popup.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 20px;
            font-weight: 900;
            color: #fbbf24;
            text-shadow: 0 0 10px #fbbf24;
            pointer-events: none;
            animation: energyPop 0.8s ease-out forwards;
            z-index: 1000;
        `;

        energyDisplay.parentElement.style.position = 'relative';
        energyDisplay.parentElement.appendChild(popup);

        setTimeout(() => popup.remove(), 800);
    }

    let enemyFleetData = [];

    const SIDEBAR_SHIP_IMAGE_ADJUSTMENTS = {
        VANGUARDS: {
            '1x2.png': { scaleX: 1.08, scaleY: 1.14, offsetX: -1, offsetY: 0 },
            '1x3.png': { scaleX: 1.08, scaleY: 1.02, offsetX: -1, offsetY: 0 },
            '1x3+1.png': { scaleX: 1.08, scaleY: 1.06, offsetX: -1, offsetY: -1 }
        },
        AURELIANS: {
            '1x2_aurelians.png': { scaleX: 1.08, scaleY: 1.02, offsetX: -1, offsetY: 0 }
        },
        CAUSTICS: {
            '1x2.png': { scaleX: 1.08, scaleY: 1.14, offsetX: -1, offsetY: 0 },
            '1x3.png': { scaleX: 1.08, scaleY: 1.02, offsetX: -1, offsetY: 0 },
            '1x3+1.png': { scaleX: 1.08, scaleY: 1.06, offsetX: -1, offsetY: -1 }
        }
    };

    function getSidebarShipImageAdjustment(shipImg) {
        const raceAdjustments = SIDEBAR_SHIP_IMAGE_ADJUSTMENTS[selectedRace] || {};
        const fileName = shipImg.split('/').pop();
        return raceAdjustments[fileName] || null;
    }

    function placeEnemyShips() {
        enemyFleetData = []; // ����f����

        // ���� ʹ�� AI ���ֵķN������ ����
        const enemyFleet = (gameMode === 'AI') ? getFleetConfig(enemyRace) : FLEET;

        let p = 0;
        while (p < enemyFleet.length) {
            let r = Math.floor(Math.random() * 100);
            let v = Math.random() > 0.5;
            let idxs = getShipIndices(r, enemyFleet[p], v);
            if (idxs && !idxs.some(x => enemyGrid[x] === 1)) {
                idxs.forEach(x => enemyGrid[x] = 1);

                // �� ���攳�˴��b�Y�� (���� shipId �Ա��䌦�DƬ) ��
                enemyFleetData.push({
                    shipId: p, // ӛס�@�ǵڎ�̖�� (0-3)
                    indices: idxs,
                    conf: enemyFleet[p],
                    rootIndex: r,
                    isVertical: v,
                    revealed: false
                });
                p++;
            }
        }
    }

    // --- �޸���ĄӮ����� (�_���Ӯ��ڑ�Ş����) ---
function triggerAnimation(cell, type) {
    if (type === 'orange') {
        const rect = cell.getBoundingClientRect();
        playEffekseerEffect(
            'normalAttack',
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
        );
        return;
    }

    const d = document.createElement('div');

    // ���� �����N���x��explosion ����
    if (type === 'blue') {
        // �z����ҷN��,Aurelians�ý�ɫ,�������{ɫ
        if (selectedRace === 'AURELIANS') {
            const rect = cell.getBoundingClientRect();
            playEffekseerEffect(
                'aureliansNormalAttack',
                rect.left + rect.width / 2,
                rect.top + rect.height / 2
            );
            return;
        } else {
            const rect = cell.getBoundingClientRect();
            playEffekseerEffect(
                'vanguardsNormalStrike',
                rect.left + rect.width / 2,
                rect.top + rect.height / 2
            );
            return;
        }
    }
    // �� �P�I�޸� 1�����Ӯ��ӵ� Board (����)�������� Cell (�ӌ�) ��
    // �@�ӄӮ��Ϳ��Ը���Ş (ship-overlay) ��ͬһ���Ӽ�����
    const board = cell.parentElement; 
    
    // �� �P�I�޸� 2���ք��O���Ӯ���λ�úʹ�С ��
    // ����Ƴ��� Cell���҂�Ҫ���V�� Cell �����e
    d.style.left = cell.offsetLeft + 'px';
    d.style.top = cell.offsetTop + 'px';
    d.style.width = cell.offsetWidth + 'px'; // �_����С������һ�� (�����֙C�� RWD)
    d.style.height = cell.offsetHeight + 'px';
    
    // �� �P�I�޸� 3���O���O�ߵ� z-index ��
    // ��Ş�S z-index: 6���҆O�O�� 100 �_��һ��������
    d.style.zIndex = '100'; 
    
    board.appendChild(d);
    
    // 0.5�����Ƴ�
    setTimeout(() => d.remove(), 500);
}

function playSound(id) {
    const s = document.getElementById(id);
    if(s) {
        const baseVolume = (typeof gameVolume !== 'undefined' && isFinite(gameVolume.sfx)) ? gameVolume.sfx : 0.5;
        s.volume = id === 'enter-sfx'
            ? Math.min(1, Math.max(0.42, baseVolume * 1.35))
            : baseVolume;
        s.currentTime = 0;
        s.play().catch(e=>{});
    }
}

function isElementVisible(el) {
    return !!(el && el.offsetParent !== null);
}

    function toggleMusic() {
        const bgm = document.getElementById('bgm');
        const btn = document.getElementById('music-btn');
        if (isMusicPlaying) {
            bgm.pause(); btn.innerText = " BGM: OFF"; btn.style.background = "";
        } else {
            bgm.play().then(() => { btn.innerText = " BGM: ON"; btn.style.background = "var(--success)"; });
        }
        isMusicPlaying = !isMusicPlaying;
    }

function renderSidebar() {
    const sidebar = document.getElementById('fleet-sidebar');
    if (!sidebar) return; // ��ȫ�z��
    sidebar.innerHTML = '';

    FLEET.forEach((ship, index) => {
        const container = document.createElement('div');
        container.id = `ship-unit-${index}`;
        container.classList.add('fleet-unit');

        // ���� �����x��ķN����댦���� class ����
        if (selectedRace === 'AURELIANS') {
            container.classList.add('aurelians');
        } else if (selectedRace === 'CAUSTICS') {
            container.classList.add('caustics');
        }

        container.style.gridTemplateColumns = `repeat(${ship.width}, var(--mini-cell-size))`;

        const totalCells = ship.width * ship.height;
        for(let i=0; i<totalCells; i++) {
            const cell = document.createElement('div');
            cell.classList.add('mini-cell');
            if (ship.custom && ship.layoutV[i] === 0) {
                cell.style.visibility = 'hidden';
            }
            container.appendChild(cell);
        }

        const img = document.createElement('img');
        img.src = ship.img;
        img.classList.add('fleet-ship-img');

        const styles = getComputedStyle(container);
        const cellSize = parseFloat(styles.getPropertyValue('--mini-cell-size')) || 25;
        const cellGap = parseFloat(styles.getPropertyValue('--mini-cell-gap')) || 2;
        const shipWidth = cellSize * ship.width + cellGap * (ship.width - 1);
        const shipHeight = cellSize * ship.height + cellGap * (ship.height - 1);
        const imageAdjustment = getSidebarShipImageAdjustment(ship.img);

        img.style.width = shipWidth + 'px';
        img.style.height = shipHeight + 'px';

        if (imageAdjustment) {
            const adjustedWidth = shipWidth * (imageAdjustment.scaleX || 1);
            const adjustedHeight = shipHeight * (imageAdjustment.scaleY || 1);
            img.style.width = adjustedWidth + 'px';
            img.style.height = adjustedHeight + 'px';
            img.style.left = (3 + (imageAdjustment.offsetX || 0)) + 'px';
            img.style.top = (3 + (imageAdjustment.offsetY || 0)) + 'px';
        }
        container.appendChild(img);

        // �O����ʼ��B
        if (index === 0) container.classList.add('current');
        else container.classList.add('pending');

        sidebar.appendChild(container);
    });
}

    function findNextUnplaced() {
        for (let i = 0; i < FLEET.length; i++) {
            if (!FLEET[i].indices) {
                return i;
            }
        }
        return FLEET.length;
    }

// ���� PHASE 5: SETTLEMENT CALCULATION ����
function calculateAndDisplaySettlement(isVictory, isSurrender = false) {
    // Calculate accuracy
    const totalAnswers = battleLog.length;
    const correctAnswers = battleLog.filter(log => log.isCorrect).length;
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    const isPerfect = accuracy === 100 && totalAnswers > 0;

    // Calculate match bonus
    let matchBonus = 0;
    if (isSurrender) {
        matchBonus = 0; // Surrender: no bonus
    } else if (isVictory) {
        // Victory and perfect victory both grant the same flat bonus.
        matchBonus = 500;
    } else {
        matchBonus = 20; // Loss: +20
    }

    // Add match bonus to total XP
    userTotalXP += matchBonus;
    syncUserProgressGlobals();

    // Calculate total session XP
    const totalSessionXP = sessionAnsweringXP + matchBonus;

    // ���� Supplies Earned (already tracked in sessionSupplies) ����
    const suppliesEarned = sessionSupplies;

    // ���� ANTI-FARMING: Check if match is valid (enemy HP <= 5, i.e., dealt 16+ damage) ����
    const enemyRemainingHP = TOTAL_HP - enemyDamage;
    const isValidMatch = enemyRemainingHP <= 5;
    console.log(`[Settlement] Enemy damage: ${enemyDamage}/${TOTAL_HP}, Remaining HP: ${enemyRemainingHP}, Valid match: ${isValidMatch}`);

    // Update UI
    const suppliesEl = document.getElementById('settlement-supplies');
    const matchBonusLabelEl = document.getElementById('settlement-match-bonus-label');
    const answeringXpEl = document.getElementById('settlement-answering-xp');
    const matchBonusEl = document.getElementById('settlement-match-bonus');
    const totalXpEl = document.getElementById('settlement-total-xp');

    // Update Match Bonus label based on result
    if (matchBonusLabelEl) {
        if (isSurrender) {
            matchBonusLabelEl.innerText = "Match Bonus (Surrender):";
        } else if (isVictory) {
            matchBonusLabelEl.innerText = "Match Bonus (Win):";
        } else {
            matchBonusLabelEl.innerText = "Match Bonus (Lose):";
        }
    }

    if (answeringXpEl) answeringXpEl.innerText = `+${sessionAnsweringXP}`;
    if (suppliesEl) suppliesEl.innerText = `+${suppliesEarned}`;
    if (matchBonusEl) {
        matchBonusEl.innerText = `+${matchBonus}`;
        if (isPerfect && isVictory) {
            matchBonusEl.innerHTML = `+${matchBonus} <span style="color: var(--warning); font-size: 11px; white-space: nowrap;">(PERFECT)</span>`;
        }
    }
    if (totalXpEl) totalXpEl.innerText = `+${totalSessionXP}`;

    // Sync to Firebase
    if (window.myPlayerId && window.db) {
        const { ref, get, update } = window.firebaseModules;

        // ���� PVP STATS TRACKING WITH ANTI-FARMING ����
        if (gameMode === 'PVP' && isValidMatch && currentOpponentId) {
            // Valid PVP match: Check 24h limit and update stats
            const userRef = ref(window.db, 'users/' + window.myPlayerId);

            // Check if this player has already won 3+ times against this opponent in 24h
            checkMatchHistory(window.myPlayerId, currentOpponentId).then(historyResult => {
                const shouldCount = isVictory
                    ? !historyResult.hostExceeded  // If I'm winning, check if I haven't exceeded limit
                    : true;  // Losses always count

                console.log(`[PVP Stats] Should count: ${shouldCount}, Victory: ${isVictory}, History check: ${JSON.stringify(historyResult)}`);

                return get(userRef).then(snapshot => {
                    const userData = snapshot.val() || {};
                    const currentPvpWins = userData.pvpWins || 0;
                    const currentPvpLosses = userData.pvpLosses || 0;
                    const currentPvpTotalMatches = userData.pvpTotalMatches || 0;

                    const updates = {
                        xp: userTotalXP,
                        pvpTotalMatches: currentPvpTotalMatches + 1
                    };

                    // Record match history
                    const matchHistoryRef = ref(window.db, `users/${window.myPlayerId}/matchHistory/${Date.now()}`);
                    const matchRecord = {
                        opponent: currentOpponentId,
                        timestamp: Date.now(),
                        result: isVictory && !isSurrender ? 'win' : (isSurrender ? 'surrender' : 'loss'),
                        counted: shouldCount,
                        enemyDamage: enemyDamage,
                        myDamage: myDamage
                    };

                    if (shouldCount) {
                        if (isVictory && !isSurrender) {
                            updates.pvpWins = currentPvpWins + 1;
                            console.log(`[PVP Stats] Win recorded. Total wins: ${currentPvpWins + 1}`);
                        } else if (!isVictory && !isSurrender) {
                            updates.pvpLosses = currentPvpLosses + 1;
                            console.log(`[PVP Stats] Loss recorded. Total losses: ${currentPvpLosses + 1}`);
                        }
                    } else {
                        console.log(`[PVP Stats] Match NOT counted (24h limit exceeded)`);
                        showNotification('?? This win does NOT count (3+ wins vs this opponent in 24h)', 'warning', 5000);
                    }

                    // Update both stats and match history
                    return Promise.all([
                        update(userRef, updates),
                        update(matchHistoryRef, matchRecord)
                    ]);
                });
            }).then(() => {
                console.log(`[Settlement] PVP stats and XP synced: ${userTotalXP}`);
            }).catch(e => {
                console.warn('[Settlement] Firebase sync failed:', e);
            });
        } else if (gameMode === 'PVP' && !isValidMatch) {
            // Invalid PVP match (enemy HP > 5): Only sync XP, no stats
            console.log(`[Settlement] Insufficient damage dealt (${enemyDamage}/${TOTAL_HP}). Enemy HP: ${enemyRemainingHP}. PVP stats NOT updated.`);
            update(ref(window.db, 'users/' + window.myPlayerId), {
                xp: userTotalXP
            }).then(() => {
                console.log(`[Settlement] XP synced (no PVP stats): ${userTotalXP}`);
            }).catch(e => {
                console.warn('[Settlement] Firebase sync failed:', e);
            });
        } else {
            // AI mode: Only sync XP
            update(ref(window.db, 'users/' + window.myPlayerId), {
                xp: userTotalXP
            }).then(() => {
                console.log(`[Settlement] Synced final XP: ${userTotalXP} (Bonus: +${matchBonus})`);
            }).catch(e => {
                console.warn('[Settlement] Firebase sync failed:', e);
            });
        }
    }

    // Update HUD to reflect new rank
    if (typeof updateHUD === 'function') {
        const cachedName = localStorage.getItem('battleship_username');
        if (cachedName) updateHUD(cachedName);
    }

    console.log(`[Settlement] Answering: +${sessionAnsweringXP} | Bonus: +${matchBonus} | Total: +${totalSessionXP} | Final XP: ${userTotalXP}`);
}

   function enterGameOverState() {
        if (currentPhase === 'GAME_OVER') return;

        currentPhase = 'GAME_OVER';

        if (turnTimerInterval) clearInterval(turnTimerInterval);
        if (timerInterval) clearInterval(timerInterval);

        if (typeof gameTimeouts !== 'undefined') {
            gameTimeouts.forEach(id => clearTimeout(id));
            gameTimeouts = [];
        }
    }

   function checkGameOver() {
        const title = document.getElementById('end-title');
        const msg = document.getElementById('end-msg');
        const screen = document.getElementById('end-screen');

        // --- ��r A������ (Victory) ---
        if (enemyDamage >= TOTAL_HP) {
            enterGameOverState();
            title.innerText = "VICTORY";
            title.style.color = "var(--success)";
            title.style.textShadow = "0 0 30px var(--success)";
            msg.innerText = "ENEMY FLEET ELIMINATED";

            // ���t 2.5 �돗������K���ń�����Ч
            setTimeout(() => {
                renderReview();
                // ���� PHASE 5: Calculate and display settlement ����
                calculateAndDisplaySettlement(true, false);

                // �� �޸��c������ victory-sfx ��
                const vSfx = document.getElementById('victory-sfx');
                if(vSfx) { vSfx.currentTime = 0; vSfx.play().catch(e=>{}); }

                screen.style.display = "flex";
                screen.style.animation = "fadeIn 0.5s ease-out";
            }, 2500);

            return true;
        }
        
        // --- ��r B���� (Defeat) ---
        if (myDamage >= TOTAL_HP) {
            enterGameOverState();
            title.innerText = "DEFEAT";
            title.style.color = "var(--danger)";
            title.style.textShadow = "0 0 30px var(--danger)";
            msg.innerText = "CRITICAL MISSION FAILURE";

            // ���t 2.5 �돗������K����ʧ����Ч
            setTimeout(() => {
                renderReview();
                // ���� PHASE 5: Calculate and display settlement ����
                calculateAndDisplaySettlement(false, false);

                // �� �޸��c������ lose-sfx ��
                const lSfx = document.getElementById('lose-sfx');
                if(lSfx) { lSfx.currentTime = 0; lSfx.play().catch(e=>{}); }

                screen.style.display = "flex";
                screen.style.animation = "fadeIn 0.5s ease-out";
            }, 2500);

            return true;
        }

        return false;
    }

// �� �����棺�_�J�x�_/Ͷ�� (�ӑB����) ��
function confirmExit() {
    const lobbyScreen = document.getElementById('lobby-screen');
    
    // 1. ����ڴ�d��ֱ���x�_����ʹ��
    if (lobbyScreen.style.display && lobbyScreen.style.display !== 'none') {
        playSound('delete-sfx');
        resetGame(); 
        return;
    } 

    // 2. �@ȡҕ���ȵ�����Ԫ��
    const title = document.querySelector('#confirm-modal .tech-warning-title');
    const msg = document.querySelector('#confirm-modal .tech-warning-msg');
    const confirmBtn = document.querySelector('#confirm-modal .tech-btn.confirm');

    // 3. �Д��B���Q���@ʾ߅������
    if (currentPhase === 'DEPLOY') {
        // --- A. �����A�� (ֻ���x�_) ---
        title.innerText = "? WARNING // ABORT?";
        msg.innerHTML = "ALL MISSION PROGRESS WILL BE LOST.<br>CONFIRM ABORT SEQUENCE?";
        confirmBtn.innerText = "CONFIRM ABORT";
    } else {
        // --- B. ���Y�A�� (Ͷ��) ---
        title.innerText = "? WARNING // SURRENDER?";
        msg.innerHTML = "YOU ARE ABOUT TO SURRENDER THIS MISSION.<br>THIS WILL BE RECORDED AS A DEFEAT.";
        confirmBtn.innerText = "CONFIRM SURRENDER";
    }

    // 4. �@ʾҕ�� & ��
    document.getElementById('confirm-modal').style.display = 'flex';
    playSound('wrong-sfx'); 
}
// �� �a���@����������t�ɂ����������� ��
// �� �����棺�P�]�_�J�� (����ȡ��) ��
    function closeConfirmModal() {
        playSound('delete-sfx'); // �� Delete 
        document.getElementById('confirm-modal').style.display = 'none';
    }

// �� �����棺���зŗ�/Ͷ�� (�^�� ������ vs ���Y��) ��
function executeAbort() {
    // 1. �P�]�_�Jҕ��
    document.getElementById('confirm-modal').style.display = 'none';
    attackResolutionLocked = false;
    isTargeting = false;
    closeLaunchModalUI();

    // 2. �Дஔǰ�A��
    // ���߀�ڴ�d������߀�ڲ����b (DEPLOY)����ֱ������ (�����˳�)
    if (currentPhase === 'DEPLOY' || document.getElementById('lobby-screen').style.display !== 'none') {
        playSound('delete-sfx');
        resetGame();
    } 
    else {
        // ���� ���Y��Ͷ�� (SURRENDER) ����
        
        // A. ̎�� PVP ���� (֪ͨ������Ͷ��)
        if (gameMode === 'PVP' && currentRoomId) {
            const { ref, update } = window.firebaseModules;
            const opponentRole = (playerRole === 'host') ? 'guest' : 'host';
            update(ref(db, 'rooms/' + currentRoomId), {
                winner: opponentRole,
                endReason: 'surrendered'
            });
        }

        // B. �|�l���ؑ����� (��� Reset ס��)
        
        // 1. ֹͣ����Ӌ�r�� (�M�±����ٵ����o)
        if (turnTimerInterval) clearInterval(turnTimerInterval);
        if (timerInterval) clearInterval(timerInterval);

        // �� �P�I�����������������І� AI ���� (startEnemyTurn / aiFire ��)
        if (typeof gameTimeouts !== 'undefined') {
            gameTimeouts.forEach(id => clearTimeout(id));
            gameTimeouts = [];
        }
        
        // 2. ���ɑ����� (�@������Ҫ�ģ�)
        if(typeof renderReview === 'function') renderReview();

        // ���� PHASE 5: Calculate and display settlement (Surrender = no bonus) ����
        calculateAndDisplaySettlement(false, true);

        // 3. �O�� End Screen ����
        document.getElementById('end-title').innerText = "DEFEAT";
        document.getElementById('end-title').style.color = "var(--danger)";
        document.getElementById('end-title').style.textShadow = "0 0 30px var(--danger)";
        document.getElementById('end-msg').innerText = "MISSION ABORTED // SURRENDERED";

        // 4. �@ʾ���� & ��Ƭ
        document.getElementById('end-screen').style.display = "flex";
        playSound('lose-sfx');
        
        // 5. �i���[���B
        currentPhase = 'GAME_OVER';
    }
}

function resetGame() {
    battleLog = [];
    battleUsedWordKeys.clear();
    pendingBattleVocab = null;
    stageSessionMissCounts = {};
    lastAskedWordKey = '';
    resetListeningVoiceCycle();
    pvpRaceSelectionShown = false;
    isEnteringPVPDeploy = false;
    pvpBattleStartPending = false;
    pvpBattleStarted = false;
    pvpLocalQuestionIndex = 0;
    pvpQuestionDeck = [];
    latestPVPSetupData = null;
    selectedStageIndex = null;
    selectedStageLabel = '';
    gameMode = 'AI';
    tempGameMode = 'AI';
    currentPracticeMode = 'READING';
    
    // UI ����
    const exitBtn = document.getElementById('game-exit-btn');
    if(exitBtn) {
        exitBtn.innerText = "EXIT";
        exitBtn.style.display = "";
        exitBtn.style.borderColor = "var(--danger)";
        exitBtn.style.color = "var(--danger)";
    }

    const lobbyMsg = document.getElementById('lobby-msg');
    if (lobbyMsg) lobbyMsg.innerText = "";
    resetLobbyScreenState();
    
    const roomInput = document.getElementById('room-id-input');
    if (roomInput) roomInput.value = ""; 
    closeLaunchModalUI();
    closeIncomingInviteModal();
    closeInvitePlayersModal();
    const confirmModal = document.getElementById('confirm-modal');
    if (confirmModal) confirmModal.style.display = 'none';
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) settingsModal.style.display = 'none';
    const selectionOverlay = document.getElementById('selection-overlay');
    if (selectionOverlay) selectionOverlay.style.display = 'none';
    if (typeof hideMenuOverlayScreens === 'function') {
        hideMenuOverlayScreens();
    }
    
    // --- 1. ���_ Firebase �B�� & ������g ---
    if (unsubscribeRoom) { unsubscribeRoom(); unsubscribeRoom = null; }
    if (battleUnsubscribe) { battleUnsubscribe(); battleUnsubscribe = null; }
    
    if (currentRoomId) {
        const { ref, off, remove, update } = window.firebaseModules;
        
        // ֹͣ�O 
        off(ref(db, 'rooms/' + currentRoomId));

        if (playerRole === 'host') {
            // Host �x�_ -> �h�����g�� (���һ�R��)
            console.log("Host leaving -> Removing Room: " + currentRoomId);
            if (typeof remove === 'function') {
                remove(ref(db, 'rooms/' + currentRoomId));
            }
        } else if (playerRole === 'guest') {
            // ���� ������Guest �x�_ -> �� guest ��λ׃�� null (֪ͨ Host ������) ����
            console.log("Guest leaving -> Updating Room Status");
            if (typeof update === 'function') {
                update(ref(db, 'rooms/' + currentRoomId), {
                    guest: null,
                    status: 'waiting_for_guest',
                    guestReady: null,
                    guestBoard: null,
                    guestBoardShips: null,
                    guestRace: null,
                    questionDeck: null,
                    questionDeckReady: false,
                    currentQuestion: null,
                    matchLimitWarning: null
                });
            }
        }
    }
    
    // ����׃��
    currentRoomId = null;
    playerRole = null;
    currentOpponentId = null;
    selectedRace = null;
    enemyRace = null;

    // --- (���±��ֲ�׃) ---
    if (turnTimerInterval) clearInterval(turnTimerInterval);
    if (timerInterval) clearInterval(timerInterval);
    if (deploymentTimerInterval) clearInterval(deploymentTimerInterval);
    if (typeof gameTimeouts !== 'undefined') {
            gameTimeouts.forEach(id => clearTimeout(id));
            gameTimeouts = [];
    }

    document.getElementById('turn-timer-container').style.visibility = 'hidden';
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = 'none';
    document.getElementById('lobby-screen').style.display = 'none';
    const reviewContainer = document.getElementById('review-container');
    const reviewList = document.getElementById('review-list');
    if (reviewContainer) reviewContainer.style.display = 'none';
    if (reviewList) reviewList.innerHTML = '';
    // ���� �[�صײ� Battle HUD ����
    const battleHud = document.getElementById('battle-hud');
    if (battleHud) battleHud.style.display = 'none'; 
    const spacer = document.getElementById('player-board-spacer');
    if (spacer) spacer.style.display = 'none';
    const instrContainer = document.getElementById('instruction-container');
    if (instrContainer) {
        instrContainer.style.visibility = 'hidden';
        instrContainer.style.display = 'none';
        instrContainer.classList.remove('play-expand', 'aurelians');
    }
    const controlPanel = document.getElementById('control-panel');
    if (controlPanel) controlPanel.classList.remove('battle-mode');
    
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('start-screen').style.opacity = '1';

    myGrid.fill(0);
    enemyGrid.fill(0);
    enemyShots = [];
    aiTargetStack = []; 
    aiRadarScannedCenters.clear();
    pvpOpponentRadarScannedCenters.clear();
    aiRadarIntel = [];
    radarScannedCells.clear();
    lastRadarResultShownAt = 0;
    clearRadarScannedOverlays();
    clearActiveSkillState();
    deployIndex = 0;
    currentPhase = 'DEPLOY';
    myDamage = 0;
    enemyDamage = 0;
    lastProcessedTimestamp = 0;

    if (typeof turnCounter !== 'undefined') {
        turnCounter = 0;
        const turnDisplay = document.getElementById('turn-count');
        if(turnDisplay) turnDisplay.innerText = "1";
    }

    // ���� ���� Energy ����
    playerEnergy = 0;
    aiEnergy = 0;
    updateEnergyDisplay();

    createGrid('player-grid');
    createGrid('enemy-grid');
    
    document.getElementById('player-board').classList.add('active');
    document.getElementById('enemy-board').classList.remove('active');

    const sidebar = document.getElementById('fleet-sidebar');
    if(sidebar) sidebar.style.display = 'flex'; 
    document.getElementById('deploy-controls').style.display = 'inline'; 
    
    renderSidebar(); 
    document.getElementById('rotate-btn').style.display = 'inline-block';
    
    document.getElementById('game-status').innerHTML = `PHASE: <span style="color: var(--warning);">DEPLOYMENT</span>`;
    document.getElementById('control-panel').style.borderColor = selectedRace === 'AURELIANS' ? "#2dd4bf" : "var(--primary)";
    document.getElementById('control-panel').style.boxShadow = selectedRace === 'AURELIANS'
        ? "0 0 15px rgba(45, 212, 191, 0.3)"
        : "0 0 15px rgba(14, 165, 233, 0.3)";
    
    const sBtn = document.getElementById('start-btn');
    sBtn.style.display = 'none'; 
    sBtn.disabled = true;        
    
    FLEET.forEach(ship => {
        ship.indices = null;
        ship.revealed = false; 
    });
    placeEnemyShips();
    showMainMenu();
}
    
function handleTurnTimeout(skipRecoveryDelay = false) {
    // ���� �P�I������һ���r�����i����B����ֹ������D�����g͵�u�ٴ� ����
    currentPhase = 'TIMEOUT_LOCKED'; 

    document.getElementById('turn-timer-container').style.visibility = 'hidden';
    playSound('timeout-sfx');
    
    const status = document.getElementById('game-status');
    status.innerHTML = `PHASE: <span style="color:var(--danger)">TOO SLOW! TURN SKIPPED</span>`;
    document.getElementById('control-panel').style.borderColor = "var(--danger)";

    if (gameMode === 'PVP') {
        const { ref, update } = window.firebaseModules;
        const nextTurn = (playerRole === 'host') ? 'guest' : 'host';
        // ֪ͨ������ Skip ��
        update(ref(db, 'rooms/' + currentRoomId), {
            lastMove: { attacker: playerRole, index: -1, timestamp: Date.now() },
            turn: nextTurn
        });
        
        setGameTimeout(() => {
            currentPhase = 'ENEMY_TURN'; // �D����ɣ���ʽ����
            document.getElementById('game-status').innerHTML = "OPPONENT'S TURN";
            switchScene('ENEMY');
        }, skipRecoveryDelay ? 0 : 1500);
    } else {
        // AI ģʽ
        setGameTimeout(() => {
            // startEnemyTurn �e����� phase �O���� ENEMY_TURN
            startEnemyTurn(); 
        }, skipRecoveryDelay ? 0 : 1500);
    }
}
function startDeploymentTimer() {
        const barContainer = document.getElementById('turn-timer-container');
        const bar = document.getElementById('turn-timer-bar');
        const status = document.getElementById('game-status');
        
        barContainer.style.visibility = 'visible';
        bar.style.width = '100%';
        
        let timeLeft = 60.0; 
        
        if (deploymentTimerInterval) clearInterval(deploymentTimerInterval);
        
        deploymentTimerInterval = setInterval(() => {
            timeLeft -= 0.1;
            const percentage = (timeLeft / 60.0) * 100;
            bar.style.width = percentage + "%";
            
            // �� �޸����c���@�e�yһ�@ʾ���M�ȡ�ͬ���r�g�� ��
            // ��ʽ��DEPLOY: SHIP 1/4 [ 59s ]
            let currentShipNum = Math.min(deployIndex + 1, FLEET.length);
            let timeStr = Math.ceil(timeLeft);
            
            status.innerHTML = `DEPLOY: SHIP ${currentShipNum}/${FLEET.length} <span style="color:var(--warning); margin-left:10px;">[ ${timeStr}s ]</span>`;

            if (timeLeft <= 0) {
                clearInterval(deploymentTimerInterval);
                handleDeploymentTimeout(); 
            }
        }, 100);
    }
function handleDeploymentTimeout() {
    playSound('timeout-sfx');
    const status = document.getElementById('game-status');
    status.innerHTML = `TIME'S UP! AUTO-DEPLOYING...`;

    autoDeployRemainingShips();

    deployIndex = FLEET.length;

    // Hide ROTATE and AUTO DEPLOY buttons
    document.getElementById('rotate-btn').style.display = 'none';
    const autoDeployBtn = document.getElementById('auto-deploy-btn');
    if (autoDeployBtn) {
        autoDeployBtn.style.display = 'none';
    }

    // Show and enable START BATTLE button
    const sBtn = document.getElementById('start-btn');
    sBtn.style.display = 'inline-block';
    sBtn.disabled = false;

    // Lock the board - set phase to prevent further clicks
    currentPhase = 'DEPLOY_LOCKED';
}

// ���� AUTO DEPLOY FUNCTION ����
function autoDeployFleet() {
    playSound('deploy-sfx');

    // Clear all existing ships from grid data
    for (let i = 0; i < myGrid.length; i++) {
        myGrid[i] = 0;
    }

    // Clear all ship indices in FLEET
    for (let i = 0; i < FLEET.length; i++) {
        FLEET[i].indices = null;
    }

    // Remove ALL ship images from player board (not just by ID)
    const playerBoard = document.getElementById('player-grid');
    const shipImages = playerBoard.querySelectorAll('.ship-overlay');
    shipImages.forEach(img => img.remove());

    // Reset all fleet unit UI states
    for (let i = 0; i < FLEET.length; i++) {
        const unit = document.getElementById(`ship-unit-${i}`);
        if (unit) {
            unit.classList.remove('deployed', 'current');
            unit.classList.add('pending');
        }
    }

    // Reset deploy index
    deployIndex = 0;

    // Auto deploy all ships
    autoDeployRemainingShips();

    // Update UI
    deployIndex = FLEET.length;
    document.getElementById('rotate-btn').style.display = 'none';
    const sBtn = document.getElementById('start-btn');
    sBtn.style.display = 'inline-block';
    sBtn.disabled = false;

    showNotification('FLEET AUTO-DEPLOYED', 'success', 2000);
}

// ���� Helper function to deploy remaining ships ����
function autoDeployRemainingShips() {
    for (let i = 0; i < FLEET.length; i++) {
        if (!FLEET[i].indices) {
            let placed = false;
            while (!placed) {
                let r = Math.floor(Math.random() * 100);
                let v = Math.random() > 0.5;
                let idxs = getShipIndices(r, FLEET[i], v);

                if (idxs && !idxs.some(x => myGrid[x] === 1)) {
                    idxs.forEach(x => myGrid[x] = 1);
                    FLEET[i].indices = idxs;
                    FLEET[i].isVertical = v;
                    placeShipImage('player-grid', r, FLEET[i], v, i);
                    const unit = document.getElementById(`ship-unit-${i}`);
                    if (unit) {
                        unit.classList.remove('pending', 'current');
                        unit.classList.add('deployed');
                    }
                    placed = true;
                }
            }
        }
    }
}

// �@ʾ�߿Ƽ�֪ͨ��
    let _notifTimer = null;
    function showNotification(text, type = 'success', duration = 3000) {
        const box = document.getElementById('tech-notification');
        const title = document.getElementById('notif-title');
        const content = document.getElementById('notif-content');

        // �����һ�� timer����ֹ������ʧ
        if (_notifTimer) clearTimeout(_notifTimer);

        // �O������
        content.innerText = text;

        // �O���ɫ (�Gɫ=Success, �tɫ=Alert)
        if (type === 'success') {
            box.style.borderColor = 'var(--success)';
            title.style.color = 'var(--success)';
            title.innerText = "SYSTEM // CONNECTED";
            playSound('deploy-sfx'); // ������Ч
        } else {
            box.style.borderColor = 'var(--danger)';
            title.style.color = 'var(--danger)';
            title.innerText = "SYSTEM // ALERT";
            playSound('wrong-sfx');
        }

        // �@ʾ (����)
        box.classList.add('active');

        // �Ԅ��շ���ȥ
        _notifTimer = setTimeout(() => {
            box.classList.remove('active');
            _notifTimer = null;
        }, duration);
    }

function getInvitePopupEnabled() {
    return localStorage.getItem('setting_pvp_invite_popups') !== '0';
}

function updateInvitePopupSetting(enabled) {
    const normalized = !!enabled;
    playSound('level-select-sfx');
    localStorage.setItem('setting_pvp_invite_popups', normalized ? '1' : '0');
    const toggle = document.getElementById('toggle-pvp-invite-popups');
    if (toggle) toggle.checked = normalized;
    showNotification(
        normalized ? 'PVP INVITE POPUPS // ENABLED' : 'PVP INVITE POPUPS // DISABLED',
        normalized ? 'success' : 'warning',
        2400
    );
}

window.updateInvitePopupSetting = updateInvitePopupSetting;

function closeInvitePlayersModal() {
    const modal = document.getElementById('invite-players-modal');
    if (modal) modal.style.display = 'none';
}

function renderInvitePlayersList(players) {
    const listEl = document.getElementById('invite-players-list');
    if (!listEl) return;

    if (!players.length) {
        listEl.innerHTML = '<div class="invite-player-empty">NO ONLINE COMMANDERS AVAILABLE</div>';
        return;
    }

    listEl.innerHTML = players.map(player => `
        <div class="invite-player-row">
            <div>
                <div class="invite-player-name">${escapeHtml(player.name)}</div>
                <div class="invite-player-meta">RANK: ${escapeHtml(player.rank)} // PVP: W${player.wins} / L${player.losses}</div>
            </div>
            <button class="btn" onclick="sendPvpInvite('${player.id}')">INVITE</button>
        </div>
    `).join('');
}

function filterInvitePlayers(queryText = '') {
    const query = String(queryText || '').trim().toLowerCase();
    if (!query) {
        renderInvitePlayersList(recentInviteCandidates);
        return;
    }

    const filtered = recentInviteCandidates.filter(player => {
        const haystack = `${player.name} ${player.rank} ${player.id}`.toLowerCase();
        return haystack.includes(query);
    });
    renderInvitePlayersList(filtered);
}

window.filterInvitePlayers = filterInvitePlayers;

async function fetchRecentInviteCandidates() {
    const { ref, get } = window.firebaseModules;
    let snapshot = null;
    let publicLookupFailed = false;
    try {
        snapshot = await get(ref(window.db, 'users_public'));
    } catch (error) {
        publicLookupFailed = true;
        console.warn('[Invite] users_public lookup failed, falling back to users:', error);
    }

    if ((!snapshot || !snapshot.exists()) && !publicLookupFailed) {
        try {
            snapshot = await get(ref(window.db, 'users'));
        } catch (error) {
            console.warn('[Invite] users fallback lookup failed:', error);
        }
    }
    if (!snapshot || !snapshot.exists()) return [];

    const now = Date.now();
    const players = [];
    snapshot.forEach(childSnap => {
        const uid = childSnap.key;
        if (uid === (window.myPlayerId || myPlayerId)) return;

        const user = childSnap.val() || {};
        const ts = user.activeSession?.timestamp || 0;
        if (!ts || now - ts > 10 * 60 * 1000) return;

        const xp = user.totalXP || user.xp || 0;
        const rank = typeof getRankForXP === 'function' ? getRankForXP(xp) : null;
        players.push({
            id: uid,
            name: user.username || user.displayName || uid.substring(0, 8).toUpperCase(),
            rank: rank ? rank.name : 'UNRANKED',
            wins: user.pvpWins || 0,
            losses: user.pvpLosses || 0,
            activeAt: ts
        });
    });

    players.sort((a, b) => b.activeAt - a.activeAt);
    return players.slice(0, 30);
}

async function openInvitePlayersModal() {
    if (!currentRoomId || playerRole !== 'host') {
        showNotification('OPEN A HOST ROOM FIRST', 'warning', 2500);
        return;
    }

    if (latestPVPSetupData?.guest) {
        showNotification('ROOM ALREADY LINKED', 'warning', 2500);
        return;
    }

    const modal = document.getElementById('invite-players-modal');
    const searchInput = document.getElementById('invite-player-search');
    if (!modal) return;

    modal.style.display = 'flex';
    if (searchInput) searchInput.value = '';
    renderInvitePlayersList([]);

    try {
        recentInviteCandidates = await fetchRecentInviteCandidates();
        renderInvitePlayersList(recentInviteCandidates);
    } catch (error) {
        console.warn('[Invite] Failed to load invite candidates:', error);
        const listEl = document.getElementById('invite-players-list');
        if (listEl) {
            listEl.innerHTML = '<div class="invite-player-empty">FAILED TO LOAD ONLINE PLAYERS</div>';
        }
    }
}

function openIncomingInviteModal(invite) {
    currentIncomingInvite = invite;
    const modal = document.getElementById('incoming-invite-modal');
    const summary = document.getElementById('incoming-invite-summary');
    const detail = document.getElementById('incoming-invite-detail');
    if (!modal || !summary || !detail) return;

    summary.innerText = `${invite.fromName || 'COMMANDER'} IS CALLING YOU`;
    detail.innerHTML = `ROOM ${invite.roomId} // ${formatLobbyLevel(invite.level)} // ${formatLobbySkill(invite.practiceMode)}<br>ACCEPT TO LINK DIRECTLY INTO PVP`;
    modal.style.display = 'flex';
}

function closeIncomingInviteModal() {
    currentIncomingInvite = null;
    const modal = document.getElementById('incoming-invite-modal');
    if (modal) modal.style.display = 'none';
}

function isElementActuallyVisible(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return false;
    const styles = window.getComputedStyle(el);
    return styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0';
}

async function respondToIncomingInvite(invite, status, reason = null) {
    if (!invite || !window.db || !window.firebaseModules) return;
    const { ref, set, remove } = window.firebaseModules;
    const myId = window.myPlayerId || myPlayerId;
    const myName = localStorage.getItem('battleship_username') || (myId ? myId.substring(0, 8).toUpperCase() : 'PILOT');

    await set(ref(window.db, `users/${invite.from}/pvpInbox/response`), {
        inviteId: invite.inviteId,
        roomId: invite.roomId,
        status,
        reason,
        by: myId,
        byName: myName,
        createdAt: Date.now()
    });

    await remove(ref(window.db, `users/${myId}/pvpInbox/invite`));
}

async function acceptIncomingInvite() {
    if (!currentIncomingInvite) return;
    const invite = currentIncomingInvite;
    closeIncomingInviteModal();

    const joined = await joinRoomById(invite.roomId, true);
    await respondToIncomingInvite(invite, joined ? 'accepted' : 'declined');
    if (!joined) {
        showNotification('INVITE EXPIRED OR ROOM FULL', 'warning', 3000);
    }
}

async function declineIncomingInvite(autoReason = false, declineReason = null) {
    if (!currentIncomingInvite) return;
    const invite = currentIncomingInvite;
    closeIncomingInviteModal();
    await respondToIncomingInvite(invite, 'declined', declineReason);
    if (!autoReason) {
        showNotification('PVP INVITE DECLINED', 'warning', 2200);
    }
}

window.acceptIncomingInvite = acceptIncomingInvite;
window.declineIncomingInvite = declineIncomingInvite;
window.openInvitePlayersModal = openInvitePlayersModal;
window.closeInvitePlayersModal = closeInvitePlayersModal;

function handleIncomingInviteSnapshot(snapshot) {
    const invite = snapshot.exists() ? snapshot.val() : null;
    if (!invite) return;
    if (currentIncomingInvite?.inviteId && currentIncomingInvite.inviteId === invite.inviteId) return;

    const now = Date.now();
    if (!invite.createdAt || now - invite.createdAt > 60 * 1000) {
        console.log('[Invite Auto-Decline]', {
            reason: 'expired',
            inviteId: invite.inviteId,
            createdAt: invite.createdAt || null,
            now,
            ageMs: invite.createdAt ? now - invite.createdAt : null
        });
        currentIncomingInvite = invite;
        declineIncomingInvite(true, 'expired');
        return;
    }

    if (!getInvitePopupEnabled()) {
        console.log('[Invite Auto-Decline]', {
            reason: 'popup_disabled',
            inviteId: invite.inviteId,
            popupEnabled: false
        });
        currentIncomingInvite = invite;
        declineIncomingInvite(true, 'popup_disabled');
        return;
    }

    console.log('[Invite Debug]', {
        inviteId: invite.inviteId,
        currentPhase,
        gameMode,
        tempGameMode,
        currentRoomId,
        playerRole,
        isEnteringPVPDeploy,
        pvpRaceSelectionShown
    });

    console.log('[Invite Debug] opening popup', { inviteId: invite.inviteId });
    openIncomingInviteModal(invite);
}

function handleInviteResponseSnapshot(snapshot) {
    if (!snapshot.exists()) return;
    const response = snapshot.val();
    const { ref, remove } = window.firebaseModules;
    const status = response?.status;
    const name = response?.byName || 'COMMANDER';
    const reason = response?.reason || null;

    if (status === 'accepted') {
        showNotification(`${name} ACCEPTED YOUR INVITE`, 'success', 2600);
    } else if (status === 'declined') {
        let message = `${name} DECLINED YOUR INVITE`;
        if (reason === 'popup_disabled') {
            message = `${name} DECLINED // POPUPS DISABLED`;
        } else if (reason === 'expired') {
            message = `${name} DECLINED // INVITE EXPIRED`;
        }
        showNotification(message, 'warning', 2600);
    }

    remove(ref(window.db, `users/${window.myPlayerId}/pvpInbox/response`));
}

function stopInviteListeners() {
    if (typeof inviteListenerUnsubscribe === 'function') {
        inviteListenerUnsubscribe();
        inviteListenerUnsubscribe = null;
    }
    if (typeof inviteResponseListenerUnsubscribe === 'function') {
        inviteResponseListenerUnsubscribe();
        inviteResponseListenerUnsubscribe = null;
    }
}

function startInviteListeners(uid) {
    if (!uid || !window.db || !window.firebaseModules) return;
    stopInviteListeners();

    const { ref, onValue } = window.firebaseModules;
    inviteListenerUnsubscribe = onValue(ref(window.db, `users/${uid}/pvpInbox/invite`), handleIncomingInviteSnapshot);
    inviteResponseListenerUnsubscribe = onValue(ref(window.db, `users/${uid}/pvpInbox/response`), handleInviteResponseSnapshot);
}

window.startInviteListeners = startInviteListeners;
window.stopInviteListeners = stopInviteListeners;

if (window.pendingInviteListenerUid) {
    startInviteListeners(window.pendingInviteListenerUid);
    window.pendingInviteListenerUid = null;
}
// �O�����ྀ�z�ڡ�
    function setupDisconnectHandler() {
        const { ref, onDisconnect, update } = window.firebaseModules;
        const roomRef = ref(db, 'rooms/' + currentRoomId);
        
        // �������l��
        const opponentRole = (playerRole === 'host') ? 'guest' : 'host';

        // �O�� onDisconnect������Ҕྀ��Update ���g�������Ќ����A
        onDisconnect(roomRef).update({
            winner: opponentRole,
            endReason: 'disconnected'
        });
    }
// 1. ̎�� PVP �յ��Ĕ���Şꠔ���
    function processEnemyFleetData(shipsData) {
        enemyFleetData = [];
        if(!shipsData) return;
        const enemyFleetConfig = getFleetConfig(enemyRace);
        
        shipsData.forEach(ship => {
            if(!ship.indices) return;
            const shipBounds = getShipBoundsFromIndices(ship.indices);
            if (!shipBounds) return;
            const root = shipBounds.rootIndex;
            let isV = ship.isVertical;
            if (isV === undefined && ship.indices.length > 1) {
                const spanRows = shipBounds.bottomRow - shipBounds.topRow + 1;
                const spanCols = shipBounds.rightCol - shipBounds.leftCol + 1;
                isV = spanRows >= spanCols;
            }
            
            enemyFleetData.push({
                shipId: ship.shipId, // �Č�����߅�յ��� ID
                indices: ship.indices,
                conf: enemyFleetConfig[ship.shipId] || FLEET[ship.shipId], // �Ì��ַN���O��������ߴ�/�Π��e��
                rootIndex: root,
                isVertical: isV,
                revealed: false
            });
        });
    }

  // 2. �z���Ş�Ƿ�ȫ�� (�޸İ棺���؂� true/false)
    function checkEnemyShipDestruction(hitIdx) {
        const ship = enemyFleetData.find(s => s.indices.includes(hitIdx));
        if (!ship || ship.revealed) return false; // �o�����ѬF��

        // �z��ԓ�����в����Ƿ��ѽ��S 'hit'
        const allHit = ship.indices.every(idx => {
            const cell = document.getElementById('enemy-grid').children[idx];
            return cell.classList.contains('hit');
        });

        if (allHit) {
            revealEnemyShip(ship);
updateEnemyIndicator(ship.shipId);
            return true; // �� �P�I���؂����S����������
        }
        return false; // δ��
    }


// �� ��K�����棺�@ʾ��܊��Ş���� (���� T�ʹ� �M��ƫ���ޏ�) ��
function revealEnemyShip(ship) {
    ship.revealed = true;

    // ���� ӛ䛂S���һ�α� (��춿��ƄӮ�) ����
    const isFirstReveal = !ship.animationPlayed;
    if (isFirstReveal) {
        ship.animationPlayed = true;
    }

    const board = document.getElementById('enemy-grid');

    // ��ȫ�z��
    if (!ship.rootIndex && ship.rootIndex !== 0) return;
    const shipBounds = getShipBoundsFromIndices(ship.indices);
    const startCell = board.children[(shipBounds ? shipBounds.rootIndex : ship.rootIndex)];
    if (!startCell) return;

    // --- 4. �����DƬ ---
    const damagedImages = (gameMode === 'AI') ? ENEMY_DAMAGED_IMAGES : DAMAGED_IMAGES;
    const img = createPositionedShipImage('enemy-grid', (shipBounds ? shipBounds.rootIndex : ship.rootIndex), ship.conf, ship.isVertical, {
        src: (typeof damagedImages !== 'undefined' && damagedImages[ship.shipId]) ? damagedImages[ship.shipId] : ship.conf.img,
        className: 'enemy-ship-revealed',
        extraClasses: !isFirstReveal ? ['no-animation'] : [],
        containerId: 'enemy-board'
    });

    if (!img) return;

    board.appendChild(img);
    
    playSound('destroy-sfx'); 
    showNotification("ENEMY SHIP DESTROYED!", "success");
    
    if(typeof updateEnemyIndicator === 'function') {
            updateEnemyIndicator(ship.shipId);
    }
}

let synth = window.speechSynthesis;
let techVoice = null;

function hideMenuOverlayScreens() {
    const ids = ['level-screen', 'skill-screen', 'race-screen', 'lobby-screen', 'ranking-screen', 'vocab-screen'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const overlay = document.getElementById('selection-overlay');
    if (overlay) overlay.style.display = 'none';
}

function showSelectionOverlay() {
    const overlay = document.getElementById('selection-overlay');
    if (overlay) overlay.style.display = 'block';
}

function showLobbyScreen() {
    const lobbyScreen = document.getElementById('lobby-screen');
    if (!lobbyScreen) return;

    resetLobbyScreenState();
    const overlay = document.getElementById('selection-overlay');
    if (overlay) overlay.style.display = 'none';
    lobbyScreen.style.display = 'flex';

    const wrapper = lobbyScreen.querySelector('.panel-content-wrapper');
    if (wrapper) {
        wrapper.style.animation = 'none';
        setTimeout(() => {
            wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
        }, 10);
    }
}

function resetLobbyScreenState() {
    const lobbyControls = document.getElementById('lobby-controls');
    const briefing = document.getElementById('lobby-briefing');
    const lobbyMsg = document.getElementById('lobby-msg');

    closeInvitePlayersModal();
    closeIncomingInviteModal();
    recentInviteCandidates = [];
    if (lobbyControls) lobbyControls.style.display = 'block';
    if (briefing) briefing.style.display = 'none';
    if (lobbyMsg) {
        lobbyMsg.innerText = '';
        lobbyMsg.style.color = 'var(--danger)';
    }
}

function showPVPWaitingState(message, color = 'var(--warning)') {
    showLobbyScreen();

    const lobbyControls = document.getElementById('lobby-controls');
    const briefing = document.getElementById('lobby-briefing');
    const lobbyMsg = document.getElementById('lobby-msg');
    const briefingTitle = document.getElementById('lobby-briefing-title');

    if (lobbyControls) lobbyControls.style.display = 'none';
    if (briefing) briefing.style.display = 'block';
    if (briefingTitle) briefingTitle.innerText = message;
    if (lobbyMsg) {
        lobbyMsg.innerText = '';
        lobbyMsg.style.color = color;
    }

    if (latestPVPSetupData) {
        updatePVPBriefingPanel(latestPVPSetupData);
    }
}

function showPVPRaceSelectionScreen() {
    if (isEnteringPVPDeploy) return;

    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.style.display = 'none';
    const carousel = document.getElementById('main-menu-carousel');
    if (carousel) carousel.style.display = 'none';
    const gameModeSelection = document.getElementById('game-mode-selection');
    if (gameModeSelection) gameModeSelection.style.display = 'none';
    ['connecting-panel', 'login-panel', 'user-profile-panel'].forEach(id => {
        const panel = document.getElementById(id);
        if (panel) panel.style.display = 'none';
    });

    const lobbyScreen = document.getElementById('lobby-screen');
    if (lobbyScreen) lobbyScreen.style.display = 'none';
    showSelectionOverlay();

    updateRaceButtons();
    const raceScreen = document.getElementById('race-screen');
    if (!raceScreen) return;

    raceScreen.style.display = 'flex';
    const wrapper = raceScreen.querySelector('.panel-content-wrapper');
    if (wrapper) {
        wrapper.style.animation = 'none';
        setTimeout(() => {
            wrapper.style.animation = 'holoAppear 0.4s forwards';
        }, 10);
    }

    pvpRaceSelectionShown = true;
}

function syncPVPSetupFromRoom(data) {
    if (!data) return;

    if (data.level && VOCAB_DB[data.level]) {
        selectedLevel = data.level;
        activeVocabList = VOCAB_DB[data.level];
        sessionDeck = [...activeVocabList];
    }

    if (data.practiceMode) {
        currentPracticeMode = data.practiceMode;
    }
}

function formatLobbyLevel(level) {
    if (!level) return '--';
    return level === 'L5_STAR' ? 'LEVEL 5*' : level.replace('L', 'LEVEL ');
}

function formatLobbySkill(skill) {
    if (!skill) return '--';
    return skill.replace(/_/g, ' ');
}

async function getLobbyPlayerProfile(playerId) {
    if (!playerId) return null;
    if (lobbyProfileCache.has(playerId)) return lobbyProfileCache.get(playerId);

    let profile = {
        name: playerId.substring(0, 8).toUpperCase(),
        rank: 'UNRANKED',
        wins: 0,
        losses: 0
    };

    try {
        const { ref, get } = window.firebaseModules;
        const snapshot = await get(ref(window.db, `users/${playerId}`));
        if (snapshot.exists()) {
            const userData = snapshot.val();
            const xp = userData.totalXP || userData.xp || 0;
            const rank = typeof getRankForXP === 'function' ? getRankForXP(xp) : null;
            profile = {
                name: userData.username || profile.name,
                rank: rank ? rank.name : 'UNRANKED',
                wins: userData.pvpWins || 0,
                losses: userData.pvpLosses || 0
            };
        }
    } catch (error) {
        console.warn('[Lobby] Failed to fetch player profile:', playerId, error);
    }

    lobbyProfileCache.set(playerId, profile);
    return profile;
}

function updateLobbyPlayerCard(prefix, profile, statusText, statusColor) {
    const nameEl = document.getElementById(`lobby-${prefix}-name`);
    const rankEl = document.getElementById(`lobby-${prefix}-rank`);
    const recordEl = document.getElementById(`lobby-${prefix}-record`);
    const statusEl = document.getElementById(`lobby-${prefix}-status`);

    if (nameEl) nameEl.innerText = profile?.name || 'AWAITING LINK';
    if (rankEl) rankEl.innerText = `RANK: ${profile?.rank || '--'}`;
    if (recordEl) recordEl.innerText = `PVP: W${profile?.wins || 0} / L${profile?.losses || 0}`;
    if (statusEl) {
        statusEl.innerText = `STATUS: ${statusText}`;
        statusEl.style.color = statusColor;
    }
}

async function updatePVPBriefingPanel(data) {
    if (!data) return;

    const roomEl = document.getElementById('lobby-briefing-room');
    const levelEl = document.getElementById('lobby-briefing-level');
    const skillEl = document.getElementById('lobby-briefing-skill');
    const inviteBtn = document.getElementById('lobby-invite-btn');

    if (roomEl) roomEl.innerText = currentRoomId || '----';
    if (levelEl) levelEl.innerText = formatLobbyLevel(data.level || selectedLevel);
    if (skillEl) skillEl.innerText = formatLobbySkill(data.practiceMode || currentPracticeMode);

    const myId = myPlayerId || window.myPlayerId;
    const opponentId = playerRole === 'host' ? data.guest : data.host;
    const myRaceLocked = playerRole === 'host' ? !!data.hostRace : !!data.guestRace;
    const opponentRaceLocked = playerRole === 'host' ? !!data.guestRace : !!data.hostRace;

    const [myProfile, opponentProfile] = await Promise.all([
        getLobbyPlayerProfile(myId),
        getLobbyPlayerProfile(opponentId)
    ]);

    updateLobbyPlayerCard(
        'you',
        myProfile,
        myRaceLocked ? 'RACE LOCKED' : (data.guest ? 'CHOOSING RACE' : 'ROOM OPEN'),
        myRaceLocked ? 'var(--success)' : 'var(--primary)'
    );

    updateLobbyPlayerCard(
        'opp',
        opponentProfile,
        !opponentId ? 'AWAITING LINK' : (opponentRaceLocked ? 'RACE LOCKED' : 'CHOOSING RACE'),
        opponentRaceLocked ? 'var(--success)' : '#fda4af'
    );

    if (inviteBtn) {
        const canInvite = playerRole === 'host' && !opponentId;
        inviteBtn.style.display = canInvite ? 'block' : 'none';
    }
}

function handlePVPMatchSetupSnapshot(data) {
    if (!data) {
        if (isEnteringPVPDeploy || currentPhase === 'GAME_OVER') return;
        showNotification('ROOM CLOSED', 'error');
        playSound('wrong-sfx');
        setTimeout(() => resetGame(), 1500);
        return;
    }

    const questionDeck = rememberPvpQuestionDeck(data.questionDeck);
    latestPVPSetupData = questionDeck.length > 0
        ? { ...data, questionDeck }
        : data;
    syncPVPSetupFromRoom(data);
    updatePVPBriefingPanel(data);

    const nextDeckQuestion = getPvpDeckQuestion(data);
    if (nextDeckQuestion) {
        preloadPvpSharedListeningQuestion(nextDeckQuestion);
    }

    if (!data.guest) {
        if (playerRole === 'host' && !isEnteringPVPDeploy) {
            showPVPWaitingState(`ROOM: ${currentRoomId} - WAITING...`, 'var(--success)');
        }
        return;
    }

    const myRaceField = playerRole === 'host' ? 'hostRace' : 'guestRace';
    const opponentRaceField = playerRole === 'host' ? 'guestRace' : 'hostRace';
    const myRaceLocked = !!data[myRaceField];
    const opponentRaceLocked = !!data[opponentRaceField];

    setupDisconnectHandler();

    if (!myRaceLocked && !pvpRaceSelectionShown) {
        showNotification('PLAYER LINKED! SELECT RACE');
        showPVPRaceSelectionScreen();
        return;
    }

    if (myRaceLocked && !opponentRaceLocked && !isEnteringPVPDeploy) {
        showPVPWaitingState('WAITING FOR OPPONENT...', 'var(--warning)');
        return;
    }

    if (data.hostRace && data.guestRace && !isEnteringPVPDeploy) {
        isEnteringPVPDeploy = true;
        if (unsubscribeRoom) {
            unsubscribeRoom();
            unsubscribeRoom = null;
        }
        hideMenuOverlayScreens();
        showNotification('RACE LOCKED // DEPLOYING', 'success');
        setTimeout(() => {
            enterGameUI();
        }, 600);
    }
}

function abolishRoom() {
    playSound('delete-sfx');
    showNotification('ROOM ABOLISHED', 'warning');
    resetGame();
}

// A. �A���d���n
function loadVoices() {
    const voices = synth.getVoices();
    // �� �����x��Ӣ���Z�������ϵ�y�Z�Ըɔ_ ��
    techVoice = voices.find(v => v.lang === 'en-US') ||
                voices.find(v => v.lang === 'en-GB') ||
                voices.find(v => v.name.includes('Google US English')) ||
                voices.find(v => v.name.includes('Zira')) ||
                voices.find(v => v.name.includes('Samantha')) ||
                voices.find(v => v.lang.startsWith('en'));

    if (techVoice) {
        console.log('Selected voice:', techVoice.name, techVoice.lang);
    }
}

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}


// 9. ���ıO �� (�����棺�ޏ� Guest Login ͬ Logout �������})
window.addEventListener('load', () => {
    createTwinklingStars();
    
    // �� 1. �_���S�C������������ (���δ�У������@�e���x)
    if (typeof generateGuestId !== 'function') {
        window.generateGuestId = function() {
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const l1 = letters.charAt(Math.floor(Math.random() * letters.length));
            const l2 = letters.charAt(Math.floor(Math.random() * letters.length));
            const nums = Math.floor(100 + Math.random() * 900); 
            return `${l1}${l2}${nums}`; 
        };
    }

    // 2. �O�ٵ���z�� (Cache Check)
    const cachedName = localStorage.getItem('battleship_username');
    const cachedUid = localStorage.getItem('battleship_auth_uid');
    if (cachedName && cachedUid) {
        console.log("?? FAST LOGIN: Found cached user -> " + cachedName);
        console.log('[FAST LOGIN] Deferring HUD render until Firebase auth resolves');
    }

    // 3. ���� �P�I�ޏͣ�ͬ�� Module Scope �� Firebase ׃���� Regular Script Scope ����
    // Module <script type="module"> ����� const db, auth ͬ Regular Script ����� let db, auth �S�ɂ���ͬ��׃����
    // Module �ѽ���ʼ���� Firebase �K�Ņ��� window.db / window.auth
    // �ضȌ��ڵ� sync ���� let-scoped ׃������ createRoom() / joinRoom() �Ⱥ����õõ�
    db = window.db;
    auth = window.auth;
    myPlayerId = window.myPlayerId || null;

    // �� ͬ�� XP & Mastery �� Module Scope
    userTotalXP = window.userTotalXP || 0;
    userMastery = window.userMastery || { reading: {}, listening: {}, speaking: {} };
    userSentenceProgress = window.userSentenceProgress || { listening: {}, speaking: {} };
    normalizeSentenceProgressState();
    userSupplies = window.userSupplies || 0;

    // 4. ͬ�� myPlayerId (��� onAuthStateChanged ������δ fire)
    // ��һ���p���� listener �_�� let-scoped myPlayerId ���hͬ��
    if (window.firebaseModules && auth) {
        window.firebaseModules.onAuthStateChanged(auth, (u) => {
            if (u) {
                myPlayerId = u.uid;
                // ͬ������ player-id-display (�������)
                const pidEl = document.getElementById('player-id-display');
                if (pidEl) {
                    const displayName = localStorage.getItem('battleship_username');
                    const cachedUid = localStorage.getItem('battleship_auth_uid');
                    pidEl.innerText = (cachedUid === u.uid ? displayName : null) || u.uid.substring(0, 8).toUpperCase();
                }
                // �� ͬ�� XP & Mastery
                userTotalXP = window.userTotalXP || 0;
                    userMastery = window.userMastery || { reading: {}, listening: {}, speaking: {} };
                    userSentenceProgress = window.userSentenceProgress || { listening: {}, speaking: {} };
                    normalizeSentenceProgressState();
                    userSupplies = window.userSupplies || 0;
                } else {
                    myPlayerId = null;
                    userTotalXP = 0;
                    userMastery = { reading: {}, listening: {}, speaking: {} };
                    userSentenceProgress = { listening: {}, speaking: {} };
                    normalizeSentenceProgressState();
                    userSupplies = 0;
                }
            });
    }
    });
    
// --- �޸���� Carousel ����߉݋ ---

// --- ���� CAROUSEL ���������[��ϵ�y (��K���ϰ�) ���� ---

// 1. �ԄӺ��� (�Ѽ���z��߉݋)
function scrollMenu(direction) {
    const track = document.getElementById('game-mode-selection');
    if (!track) return;
    
    // ������Ƭ韶�
    const item = track.querySelector('.carousel-item');
    if (!item) return;
    
    const itemWidth = item.offsetWidth;
    const gap = 20; 
    const scrollAmount = itemWidth + gap;
    
    track.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
    
    playSound('deploy-sfx'); 
    
    // �� �P�I�������Ԅ�����΢���t 0.3�� �řz�飬�_���Ӯ�������B�ʴ_ ��
    setTimeout(checkArrows, 300);
}

// 2. �z������Ƿ���Ҫ�[�� (����߉݋)
function checkArrows() {
    const track = document.getElementById('game-mode-selection');
    const leftArrow = document.querySelector('.nav-arrow.left');
    const rightArrow = document.querySelector('.nav-arrow.right');

    if (!track || !leftArrow || !rightArrow) return;

    // A. �z����߅ (ScrollLeft �Ƿ�ӽ� 0)
    // ʹ�� 10px ���e����ֹС���c�`��
    if (track.scrollLeft <= 10) {
        leftArrow.style.opacity = '0';
        leftArrow.style.visibility = 'hidden'; // �_���[���ᰴ����
        leftArrow.style.pointerEvents = 'none';
    } else {
        leftArrow.style.opacity = '1';
        leftArrow.style.visibility = 'visible';
        leftArrow.style.pointerEvents = 'auto';
    }

    // B. �z����߅ (ScrollLeft + clientWidth �Ƿ�ӽ� scrollWidth)
    // ߉݋��Ŀǰ�Ԅ�λ�� + ҕ��韶� >= �������L�� - ���eֵ
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        rightArrow.style.opacity = '0';
        rightArrow.style.visibility = 'hidden';
        rightArrow.style.pointerEvents = 'none';
    } else {
        rightArrow.style.opacity = '1';
        rightArrow.style.visibility = 'visible';
        rightArrow.style.pointerEvents = 'auto';
    }
}

// 3. ���ӱO �� (��횺�д˺�����)
function initCarouselControl() {
    const track = document.getElementById('game-mode-selection');
    if (track) {
        // ��ʹ�����Լ�����ָ���ӕr����Ҫ�z��
        track.addEventListener('scroll', checkArrows);
        // ��ʼ���z��һ��
        checkArrows();
    }
}


// �� ����ӛ�ã��� showMainMenu() ������β��һ�䣺
// setupCarouselObserver();

function generateGuestId() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const l1 = letters.charAt(Math.floor(Math.random() * letters.length));
    const l2 = letters.charAt(Math.floor(Math.random() * letters.length));
    const nums = Math.floor(100 + Math.random() * 900); // 100-999
    return `${l1}${l2}${nums}`; // ����: AK479
}
// ���� �����������S�C�W�q�������� (���°棺���� + ʮ����) ����
function createTwinklingStars() {
    const starCount = 60;
    const container = document.body;
    const starColors = [
        '255,255,255',
        '191,219,254',
        '254,240,138',
        '251,207,232',
        '186,230,253'
    ];

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        
        // ����ͨ�� class
        star.classList.add('star-item');
        star.classList.add('star-dot');

        // ��ͨ�l�����c�����������������S�C��
        const size = Math.random() * 2.5 + 1.5;
        star.style.width = size + 'px';
        star.style.height = size + 'px';

        // ������ɫ�ǣ���s 8%�����N���ְ�ɫ
        const useColoredStar = Math.random() < 0.08;
        const starRgb = useColoredStar
            ? starColors[Math.floor(Math.random() * (starColors.length - 1)) + 1]
            : starColors[0];
        star.style.setProperty('--star-rgb', starRgb);
        
        // �S�Cλ��
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // �� �S�C�Ӯ����t (0 - 10��)����ڵ����һ�R�W
        const delay = Math.random() * 10;
        
        // �� �p���W�q�ٶ� (4 - 9�� һ��ѭ�h)
        const duration = Math.random() * 5 + 4; 

        star.style.left = x + '%';
        star.style.top = y + '%';
        
        // ���ÄӮ�
        star.style.animation = `twinkleAnim ${duration}s infinite ease-in-out ${delay}s`;

        container.appendChild(star);
    }
}
    // ���� ���������ܸ�ʽ������ (�� Input �a�ؿո�ͬ Hyphen) ����
function formatDisplayInput(userRaw, targetCorrect) {
    // ���e�z��
    if (!userRaw || userRaw === "(TIMEOUT)") return userRaw;
    if (!targetCorrect) return userRaw;

    let result = "";
    let rawIndex = 0;
    
    // ��v���_�𰸵�ÿһ���� (����Ӱ�)
    for (let i = 0; i < targetCorrect.length; i++) {
        const targetChar = targetCorrect[i];
        
        // ����Ӱ��ǡ���̖��(�ո�, -, ')��ֱ�Ӽ���ȥ�Y����
        if (/[^a-zA-Z0-9]/.test(targetChar)) {
            result += targetChar;
            
            // �� �P�I���������Լ�������д򂀷�̖����Ҫ���ĵ� (�������}׃ living  room)
            if (rawIndex < userRaw.length && userRaw[rawIndex] === targetChar) {
                rawIndex++;
            }
        } else {
            // ����Ӱ��ǡ���ĸ�����������ݔ�����һ��������ȥ
            if (rawIndex < userRaw.length) {
                result += userRaw[rawIndex];
                rawIndex++;
            }
        }
    }
    
    // �����Ҵ����� (������e)����ʣ�͆��ּӷ��Sβ
    if (rawIndex < userRaw.length) {
        result += userRaw.substring(rawIndex);
    }
    
    return result;
}
function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function buildSpeakingDebriefSentence(log) {
    const assessment = log?.speakingAssessment;
    const targetWord = (assessment?.targetWord || '').toLowerCase();
    const words = Array.isArray(assessment?.words) ? assessment.words : [];
    const targetMatch = resolveSpeakingTargetAssessment(words, targetWord).wordAssessment;
    if (words.length) {
        return words.map(wordEntry => {
            const score = Math.round(wordEntry.accuracy ?? 0);
            const color = getSpeakingAssessmentColor(score, wordEntry.errorType);
            const isTarget = targetMatch && wordEntry === targetMatch;
            return `<span class="speaking-debrief-word${isTarget ? ' target' : ''}" style="color:${color}">${escapeHtml(wordEntry.word || '?')}</span>`;
        }).join(' ');
    }

    const sentence = log?.sentence || log?.correct || '';
    if (!sentence) return '<span class="speaking-debrief-word" style="color:#94a3b8">NO SENTENCE DATA</span>';
    return sentence.split(/(\s+)/).map(token => {
        if (!token.trim()) return token;
        const cleanToken = token.toLowerCase().replace(/[^a-z']/g, '');
        const isTarget = targetWord && cleanToken === targetWord;
        return `<span class="speaking-debrief-word${isTarget ? ' target' : ''}" style="color:${isTarget ? 'var(--warning)' : '#67e8f9'}">${escapeHtml(token)}</span>`;
    }).join('');
}

function buildSpeakingDebriefWordRows(log) {
    const words = Array.isArray(log?.speakingAssessment?.words) ? log.speakingAssessment.words : [];
    if (!words.length) {
        return '<div class="speaking-debrief-word-row"><div class="speaking-debrief-word-name">no data</div><div class="speaking-debrief-phoneme-list"><span class="speaking-chip" style="color:#94a3b8"><span class="speaking-chip-label">NO BREAKDOWN</span></span></div></div>';
    }

    return words.map(wordEntry => {
        const phonemes = Array.isArray(wordEntry.phonemes) && wordEntry.phonemes.length ? wordEntry.phonemes : (Array.isArray(wordEntry.syllables) ? wordEntry.syllables : []);
        const labelKey = Array.isArray(wordEntry.phonemes) && wordEntry.phonemes.length ? 'phoneme' : 'syllable';
        const bars = phonemes.length
            ? phonemes.map(item => {
                const label = escapeHtml(item[labelKey] || '?');
                const score = Math.max(0, Math.min(100, Math.round(item.accuracy ?? 0)));
                const color = getSpeakingAssessmentColor(score, item.errorType);
                return `<div class="speaking-debrief-phoneme"><div class="speaking-debrief-phoneme-bar"><div class="speaking-debrief-phoneme-fill" style="height:${Math.max(8, score)}%; color:${color}; background:${color};"></div></div><div class="speaking-debrief-phoneme-label">${label}</div></div>`;
            }).join('')
            : `<span class="speaking-chip" style="color:${getSpeakingAssessmentColor(Math.round(wordEntry.accuracy ?? 0), wordEntry.errorType)}"><span class="speaking-chip-label">WORD SCORE</span><span class="speaking-chip-score">${Math.round(wordEntry.accuracy ?? 0)}</span></span><span class="speaking-chip" style="color:#94a3b8"><span class="speaking-chip-label">NO PHONEME DATA</span></span>`;

        return `<div class="speaking-debrief-word-row"><div class="speaking-debrief-word-name">${escapeHtml(wordEntry.word || '?')}</div><div class="speaking-debrief-phoneme-list">${bars}</div></div>`;
    }).join('');
}

function closeSpeakingDebriefModal() {
    const modal = document.getElementById('speaking-debrief-modal');
    const box = modal ? modal.querySelector('.speaking-debrief-box') : null;
    speakingDebriefActiveLogIndex = null;
    stopSpeakingDebriefPlayback();
    if (typeof playSound === 'function') playSound('delete-sfx');
    if (box) box.classList.remove('reveal');
    if (modal) modal.style.display = 'none';
}

function openSpeakingDebriefModal(logIndex) {
    const log = battleLog[Number(logIndex)];
    if (!log || log.mode !== 'SPEAKING' || !log.speakingAssessment) return;

    const modal = document.getElementById('speaking-debrief-modal');
    const box = modal ? modal.querySelector('.speaking-debrief-box') : null;
    const sentenceEl = document.getElementById('speaking-debrief-sentence');
    const scoreGridEl = document.getElementById('speaking-debrief-score-grid');
    const wordListEl = document.getElementById('speaking-debrief-word-list');
    const azurePlayBtn = document.getElementById('speaking-debrief-azure-play');
    const playerPlayBtn = document.getElementById('speaking-debrief-player-play');
    if (!modal || !sentenceEl || !scoreGridEl || !wordListEl) return;

    speakingDebriefActiveLogIndex = Number(logIndex);
    stopSpeakingDebriefPlayback();
    const overall = log.speakingAssessment.overall || {};
    const cards = [
        { label: 'SESSION SCORE', value: Math.round(overall.pronunciation ?? log.speakingAssessment.targetScore ?? 0) },
        { label: 'ACCURACY', value: Math.round(overall.accuracy ?? 0) },
        { label: 'FLUENCY', value: Math.round(overall.fluency ?? 0) },
        { label: 'COMPLETENESS', value: Math.round(overall.completeness ?? 0) }
    ];

    sentenceEl.innerHTML = buildSpeakingDebriefSentence(log);
    scoreGridEl.innerHTML = cards.map(card => `<div class="speaking-debrief-score-card"><div class="speaking-debrief-score-value">${card.value}</div><div class="speaking-debrief-score-label">${card.label}</div></div>`).join('');
    wordListEl.innerHTML = buildSpeakingDebriefWordRows(log);
    if (azurePlayBtn) azurePlayBtn.disabled = !log.sentence;
    if (playerPlayBtn) playerPlayBtn.disabled = !log.speakingAssessment.playerAudioBase64;
    if (typeof playSound === 'function') playSound('speaking-open-sfx');
    if (box) {
        box.classList.remove('reveal');
        void box.offsetWidth;
        box.classList.add('reveal');
    }
    modal.style.display = 'flex';
}

function upsertSpeakingBattleLogEntry(transcript, targetText, result, targetWord, targetScore, isCorrect) {
    if (typeof battleLog === 'undefined') return;

    const turn = (typeof turnCounter !== 'undefined' ? turnCounter : 1);
    const speakingEntry = {
        turn,
        user: transcript || '(no transcript)',
        correct: targetText,
        isCorrect,
        mode: 'SPEAKING',
        sentence: currentVocab.sent || currentVocab.en || null,
        speakingAssessment: {
            targetWord: targetWord,
            targetScore: targetScore,
            recognizedText: transcript || '',
            overall: result.overall || {},
            words: Array.isArray(result.words) ? result.words : [],
            playerAudioBase64: speakingLastRecordedAudioBase64 || '',
            playerAudioMimeType: 'audio/wav'
        }
    };

    const existingIndex = battleLog.findIndex(log => log.turn === turn);
    if (existingIndex !== -1) {
        battleLog[existingIndex] = { ...battleLog[existingIndex], ...speakingEntry };
    } else {
        battleLog.push(speakingEntry);
    }
}

function renderReview() {
    const container = document.getElementById('review-container');
    const list = document.getElementById('review-list');
    if (!container || !list) return;

    list.innerHTML = ""; 
    container.style.display = battleLog.length > 0 ? 'flex' : 'none';

    battleLog.forEach(log => {
        const item = document.createElement('div');
        item.className = 'review-item';
        
        const userClass = log.isCorrect ? 'correct' : 'wrong';
        
        let chineseMeaning = "--";
        if (typeof activeVocabList !== 'undefined') {
            const foundWord = activeVocabList.find(w => w.en === log.correct || w.sent === log.correct);
            if (foundWord && foundWord.ch) {
                chineseMeaning = foundWord.ch;
            }
        }

        // �� ���� 2�������DС�� (���ǂS TIMEOUT ����) ��
let displayUser = log.user;
if (displayUser !== "(TIMEOUT)") {
    if (log.mode === 'SPEAKING') {
        displayUser = escapeHtml(displayUser);
    } else {
        displayUser = displayUser.toLowerCase();
        displayUser = formatDisplayInput(displayUser, log.correct);
    }
}

        // �� ���� 1������ .review-meaning ��ʽ ��
        // ���� For LISTENING mode, show full sentence with highlighted answer ����
        let correctDisplay = log.correct;
        if (log.mode === 'LISTENING' && log.sentence) {
            // Show full sentence with answer word highlighted in orange
            const answerWord = log.correct;
            const sentence = log.sentence;
            const regex = new RegExp(`(${escapeRegExp(answerWord)})`, 'gi');
            const replacedSentence = sentence.replace(regex, '<span style="color: var(--warning);">$1</span>');
            correctDisplay = replacedSentence !== sentence ? replacedSentence : escapeHtml(answerWord);
        }

        if (log.mode === 'SPEAKING' && log.speakingAssessment) {
            item.classList.add('review-item-interactive');
            item.dataset.logIndex = String(battleLog.indexOf(log));
            item.onclick = () => openSpeakingDebriefModal(item.dataset.logIndex);
        }

        item.innerHTML = `
            <div class="review-turn">T-${log.turn}</div>
            <div class="review-meaning">${chineseMeaning}</div>
            <div class="review-user ${userClass}">${displayUser}</div>
            <div class="review-answer">${correctDisplay}</div>
        `;
        list.appendChild(item);
    });
}
// ���� ���������ܵ׾������� (̎��ո�Hyphen��Ʋ̖) ����
function generateSmartBlanks(text) {
    let html = '';
    // ����֙z��
    for (let char of text) {
        if (char === ' ') {
            // �ո��@ʾ��һ�c�Ŀհף���î��׾�
            html += `<span style="display:inline-block; width:20px;"></span>`;
        } else if (char === '-' || char === '\'') {
            // Hyphen ��Ʋ̖���@ʾ��ɫ��̖
            html += `<span style="color:var(--warning); font-weight:bold; margin:0 2px; font-size: 24px;">${char}</span>`;
        } else {
            // ��ĸ���@ʾ�����׾�
            html += `_ `;
        }
    }
    return html;
}

function getListeningAnswerRows(text) {
    const cleanText = (text || '').trim();
    return [cleanText];
}

function splitListeningInputByRows(inputVal, rows) {
    let remaining = inputVal || '';
    return rows.map((row, index) => {
        if (index === rows.length - 1) return remaining;
        const chunk = remaining.slice(0, row.length);
        remaining = remaining.slice(chunk.length);
        return chunk;
    });
}

function renderListeningSentenceBlank(text) {
    const isLongAnswer = (text || '').trim().length > 12;
    const blankClass = isLongAnswer
        ? 'listening-blank listening-blank-inline listening-blank-inline-wide'
        : 'listening-blank listening-blank-inline';
    return `<span class="${blankClass}" aria-hidden="true"><span class="listening-answer-line"></span></span>`;
}

function escapeRegExp(text) {
    return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceListeningAnswerWithBlank(sentence, answer) {
    const source = String(sentence || '');
    const target = String(answer || '').trim();
    if (!source || !target) return renderListeningSentenceBlank(target);

    const regex = new RegExp(escapeRegExp(target), 'gi');
    const replaced = source.replace(regex, renderListeningSentenceBlank(target));
    return replaced !== source ? replaced : renderListeningSentenceBlank(target);
}

function getSentenceSurfaceAnswer(sentence, answer) {
    const source = String(sentence || '');
    const target = String(answer || '').trim();
    if (!source || !target) return target;

    const exactRegex = new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(target)}(?![A-Za-z0-9])`, 'i');
    const exactMatch = source.match(exactRegex);
    if (exactMatch && exactMatch[0]) return exactMatch[0];

    const tokenMatches = source.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) || [];
    const lowerTarget = target.toLowerCase();
    const preferred = tokenMatches.find(token => token.toLowerCase() === lowerTarget);
    if (preferred) return preferred;

    const containing = tokenMatches.find(token => token.toLowerCase().includes(lowerTarget));
    if (containing) return containing;

    return target;
}

function formatInputForTarget(logicInput, targetWord) {
    const cleanLogic = String(logicInput || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const target = String(targetWord || '');
    let logicIdx = 0;
    let formatted = '';

    for (let i = 0; i < target.length; i++) {
        const targetChar = target[i];

        if (/[A-Za-z0-9]/.test(targetChar)) {
            if (logicIdx >= cleanLogic.length) break;
            formatted += cleanLogic[logicIdx];
            logicIdx++;
            continue;
        }

        if (/[\s\-']/.test(targetChar) && logicIdx > 0 && logicIdx < cleanLogic.length) {
            formatted += targetChar;
        }
    }

    if (logicIdx < cleanLogic.length) {
        formatted += cleanLogic.slice(logicIdx);
    }

    return formatted;
}

let lastVirtualKeyboardKey = null;

function flashVirtualKeyboardErrorKey(keyElement) {
    if (!keyElement) return;
    keyElement.classList.remove('kb-error');
    void keyElement.offsetWidth;
    keyElement.classList.add('kb-error');
    setTimeout(() => keyElement.classList.remove('kb-error'), 220);
}

function renderListeningAnswerDisplay(text, inputVal) {
    const rows = getListeningAnswerRows(text);
    const typedRows = splitListeningInputByRows(inputVal, rows);
    const rowClass = 'listening-answer-shell one-line';

    const rowMarkup = rows.map((row, index) => {
        const typedText = escapeHtml(typedRows[index] || '');
        const lengthBasis = Math.max((typedRows[index] || '').length, row.length);
        let fontSize = 24;
        let letterSpacing = 3;

        if (lengthBasis >= 24) {
            fontSize = 12;
            letterSpacing = 0.4;
        } else if (lengthBasis >= 20) {
            fontSize = 14;
            letterSpacing = 0.6;
        } else if (lengthBasis >= 17) {
            fontSize = 16;
            letterSpacing = 0.8;
        } else if (lengthBasis >= 14) {
            fontSize = 18;
            letterSpacing = 1.2;
        } else if (lengthBasis >= 10) {
            fontSize = 22;
            letterSpacing = 2.4;
        }

        return `
            <div class="listening-answer-row">
                <span class="listening-answer-typed" style="font-size:${fontSize}px; letter-spacing:${letterSpacing}px;">${typedText || '&nbsp;'}</span>
            </div>
        `;
    }).join('');

    return `<div class="${rowClass}">${rowMarkup}</div>`;
}
// --- ��K�����棺�x���� (PVP ����) ---
async function selectSkill(skill) {
    console.log("Skill Selected:", skill);
    currentPracticeMode = skill;
    if (tempGameMode === 'AI') {
        activeVocabList = buildStageVocabListForMode(skill.toLowerCase());
        sessionDeck = [...activeVocabList];
        if (selectedStageLabel) {
            console.log(`[Stage] ${selectedStageLabel} -> ${skill} deck size: ${sessionDeck.length}`);
        }
    }
    playSound('deploy-sfx');
    const lobbyScreen = document.getElementById('lobby-screen');
    if (lobbyScreen) lobbyScreen.style.display = 'none';

    // 1. �A���Z�� (Listening ����)
    if (skill === 'LISTENING') {
        if (typeof warmUpVoiceEngine === 'function') warmUpVoiceEngine();
    }

    // 2. �� �d���e�� (Local Storage) ��
    // �_���e�ֹ����\��
    if (typeof loadMissedWordsToPriorityDeck === 'function') {
        loadMissedWordsToPriorityDeck(skill);
    }

    // 3. �[�� Skill ����
    document.getElementById('skill-screen').style.display = 'none';

    if (tempGameMode === 'AI') {
        // 4. ���� AI ���̣���ȥ�N���x���� ����
        updateRaceButtons();
        const raceScreen = document.getElementById('race-screen');
        raceScreen.style.display = 'flex';
        const wrapper = raceScreen.querySelector('.panel-content-wrapper');
        if (wrapper) {
            wrapper.style.animation = 'none';
            setTimeout(() => {
                wrapper.style.animation = 'holoAppear 0.4s forwards';
            }, 10);
        }
        return;
    }

    // 4. ���� PVP ���̣����� Training Module ��ֱ���_�� ����
    gameMode = 'PVP';
    showPVPWaitingState('OPENING ROOM...', 'var(--warning)');
    if (typeof createRoom === 'function') {
        createRoom();
    }
}

// ���� �������N���x�񺯔� ����
let selectedRace = 'VANGUARDS'; // �A�O�N�壨��ң�
let enemyRace = 'VANGUARDS'; // AI ���ַN��
let unlockedRaces = ['VANGUARDS']; // �A�O���i Vanguards
window.unlockedRaces = unlockedRaces;

function selectRace(race) {
    const btn = document.getElementById(`race-btn-${race.toLowerCase()}`);
    const supplies = window.userSupplies || 0;

    // ����� Vanguards��ֱ���x�����M���A�O���i��
    if (race === 'VANGUARDS') {
        confirmRaceSelection(race);
        return;
    }

    // �z���Ƿ��ѽ����i
    const isUnlocked = unlockedRaces.includes(race);

    if (isUnlocked) {
        // �ѽ��i��ֱ���x��
        confirmRaceSelection(race);
        return;
    }

    // δ���i���z�� supplies
    if (supplies < 15000) {
        // ���� supplies
        playSound('wrong-sfx');
        showSuppliesNeededAnimation(race);
        return;
    }

    // �� supplies���@ʾ���i�_�Jҕ��
    showRaceUnlockConfirmation(race);
}

// ���� �_�J�N���x��K�^�m�[�� ����
function confirmRaceSelection(race) {
    selectedRace = race;
    console.log("Race Selected:", race);
    playSound('deploy-sfx');
    updateBattleRaceUiTheme();

    // ���� �����d�댦���N��đ�Ş���� ����
    FLEET = getFleetConfig(race);
    DAMAGED_IMAGES = getDamagedImages(race);
    console.log('[Race] Loaded fleet config for:', race);

    // ���� UPDATE PLAYER BOARD STYLING BASED ON RACE ����
    const playerBoard = document.getElementById('player-board');
    if (playerBoard) {
        // Remove all race classes
        playerBoard.classList.remove('race-vanguards', 'race-aurelians', 'race-caustics');
        // Add current race class
        playerBoard.classList.add(`race-${race.toLowerCase()}`);
        console.log('[Race] Updated player board styling for:', race);
    }

    // �[�طN�宋��
    document.getElementById('race-screen').style.display = 'none';

    // ���ķ���߉݋
    if (tempGameMode === 'AI') {
        // --- AI ģʽ���S�C�x�� AI �N��K�_ʼ�[�� ---
        gameMode = 'AI';

        // ���� �[�ع��ú�ɫ�׌� ����
        const overlay = document.getElementById('selection-overlay');
        if (overlay) overlay.style.display = 'none';

        // ���� �S�C�x�� AI ���ַN�� ����
        const availableRaces = ['VANGUARDS', 'AURELIANS'];
        enemyRace = availableRaces[Math.floor(Math.random() * availableRaces.length)];
        console.log('[AI Race] Enemy race selected:', enemyRace);

        // ���� �d�� AI ���ֵ��ܓp�DƬ ����
        ENEMY_DAMAGED_IMAGES = getDamagedImages(enemyRace);

        // ���� ���[�� AI ��Ş��ʹ�����_�ķN�����ã�����
        enemyGrid = Array(100).fill(0); // �����P
        if (typeof placeEnemyShips === 'function') {
            placeEnemyShips();
        }

        enterGameUI();
    } else {
        // --- PVP ģʽ���i���N�壬�Ȍ��֒��� ---
        gameMode = 'PVP';
        const { ref, update } = window.firebaseModules;
        const raceField = playerRole === 'host' ? 'hostRace' : 'guestRace';

        showPVPWaitingState('WAITING FOR OPPONENT...', 'var(--warning)');

        if (currentRoomId) {
            update(ref(db, 'rooms/' + currentRoomId), {
                [raceField]: race,
                status: 'choosing_race'
            });
        }
    }
}

// ���� �@ʾ�N����i�_�Jҕ�� ����
function showRaceUnlockConfirmation(race) {
    const raceName = race.charAt(0) + race.slice(1).toLowerCase();
    const required = 15000;

    // �Q��߅���ɫ
    let borderColor = '#EEE8AA'; // Aurelians PaleGoldenrod
    if (race === 'CAUSTICS') {
        borderColor = '#c084fc'; // Caustics ��ɫ
    }

    // �����_�Jҕ��
    const modal = document.createElement('div');
    modal.id = 'race-unlock-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    modal.innerHTML = `
        <div style="
            background: rgba(10, 20, 35, 0.95);
            border: 2px solid ${borderColor};
            border-radius: 10px;
            padding: 40px;
            max-width: 450px;
            width: 90%;
            text-align: center;
            box-shadow: 0 0 30px ${borderColor}80, inset 0 0 20px ${borderColor}20;
            backdrop-filter: blur(15px);
            position: relative;
            animation: holo-open 0.4s ease-out forwards;
        ">
            <div style="font-family: 'Black Ops One'; font-size: 28px; color: ${borderColor}; margin-bottom: 20px; text-shadow: 0 0 15px ${borderColor};">
                UNLOCK ${race}?
            </div>
            <div style="font-family: 'Orbitron'; color: #e2e8f0; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
                This will permanently unlock the <span style="color: ${borderColor}; font-weight: bold;">${raceName}</span> faction for <span style="color: #EEE8AA; font-weight: bold;">${required.toLocaleString()} supplies</span>.
            </div>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button onclick="closeRaceUnlockModal()" style="
                    background: transparent;
                    border: 2px solid ${borderColor};
                    color: ${borderColor};
                    padding: 12px 30px;
                    font-family: 'Orbitron';
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-shadow: 0 0 8px ${borderColor};
                " onmouseover="this.style.borderColor='${borderColor}'; this.style.color='#fff';" onmouseout="this.style.borderColor='${borderColor}'; this.style.color='${borderColor}';">
                    CANCEL
                </button>
                <button onclick="confirmRaceUnlock('${race}')" style="
                    background: ${borderColor};
                    border: 2px solid ${borderColor};
                    color: #000;
                    padding: 12px 30px;
                    font-family: 'Orbitron';
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 0 20px ${borderColor}80;
                " onmouseover="this.style.boxShadow='0 0 30px ${borderColor}'; this.style.transform='scale(1.05)';" onmouseout="this.style.boxShadow='0 0 20px ${borderColor}80'; this.style.transform='scale(1)';">
                    CONFIRM
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    playSound('open-room-sfx');
}

// ���� �_�J���i�N�� ����
function confirmRaceUnlock(race) {
    const required = 15000;
    const supplies = window.userSupplies || 0;

    // �۳� supplies
    userSupplies -= required;
    window.userSupplies = userSupplies;

    // ���뵽�ѽ��i�б�
    if (!unlockedRaces.includes(race)) {
        unlockedRaces.push(race);
        window.unlockedRaces = unlockedRaces;
    }

    // ͬ���� Firebase
    const { ref, update } = window.firebaseModules;
    if (myPlayerId && db) {
        update(ref(db, 'users/' + myPlayerId), {
            supplies: userSupplies,
            unlockedRaces: unlockedRaces
        }).then(() => {
            console.log(`[Supplies] Unlocked ${race}, remaining supplies: ${userSupplies}`);
            updateSuppliesDisplay();
            updateRaceButtons(); // ���°��o��B
        }).catch(err => {
            console.error('[Supplies] Failed to sync unlock:', err);
        });
    }

    // �P�]ҕ��
    closeRaceUnlockModal();

    // �^�m�x��N��
    confirmRaceSelection(race);
}

// ���� �P�]���i�_�Jҕ�� ����
function closeRaceUnlockModal() {
    const modal = document.getElementById('race-unlock-modal');
    if (modal) {
        playSound('delete-sfx');
        modal.remove();
    }
}

// ���� ���·N�尴�o�i����B ����
function updateRaceButtons() {
    // Vanguards - ���h���i�ҹ���
    const vanguardsBtn = document.getElementById('race-btn-vanguards');
    if (vanguardsBtn) {
        vanguardsBtn.classList.remove('locked');
    }

    // Aurelians - �������i��B�Q���ⰵ
    const aureliansBtn = document.getElementById('race-btn-aurelians');
    if (aureliansBtn) {
        if (unlockedRaces.includes('AURELIANS')) {
            aureliansBtn.classList.remove('locked');
        } else {
            aureliansBtn.classList.add('locked');
        }
    }

    // Caustics - �������i��B�Q���ⰵ
    const causticsBtn = document.getElementById('race-btn-caustics');
    if (causticsBtn) {
        if (unlockedRaces.includes('CAUSTICS')) {
            causticsBtn.classList.remove('locked');
        } else {
            causticsBtn.classList.add('locked');
        }
    }
}

// ���� �@ʾ "��Ҫ�����a�o" �Ӯ� ����
function showSuppliesNeededAnimation(race) {
    const supplies = window.userSupplies || 0;
    const required = 15000;
    const needed = required - supplies;

    // ʹ��ϵ�y֪ͨ�@ʾ
    if (typeof showNotification === 'function') {
        showNotification(`${needed.toLocaleString()} MORE SUPPLIES NEEDED`, 'error', 5000);
    }
}

// ���� ���ذ��o̎�� ����
function handleRaceBack() {
    playSound('delete-sfx');
    if (tempGameMode === 'PVP' && currentRoomId) {
        showNotification('PVP LINK ABORTED', 'warning', 2000);
        resetGame();
        return;
    }
    document.getElementById('race-screen').style.display = 'none';
    const skillScreen = document.getElementById('skill-screen');
    skillScreen.style.display = 'flex';
    // ���� Trigger holoAppear animation ����
    skillScreen.style.animation = 'none';
    setTimeout(() => {
        skillScreen.style.animation = 'holoAppear 0.4s forwards';
    }, 10);
}

function handleSkillBack() {
    playSound('delete-sfx');
    document.getElementById('skill-screen').style.display = 'none';

    if (tempGameMode === 'AI') {
        // AI: �������x��
        showMainMenu();
    } else {
        // PVP: ���� Level �x�� (��������� Level -> Skill)
        const levelScreen = document.getElementById('level-screen');
        levelScreen.style.display = 'flex';
        // ���� Trigger holoAppear animation on content wrapper ����
        const wrapper = levelScreen.querySelector('.panel-content-wrapper');
        if (wrapper) {
            wrapper.style.animation = 'none';
            setTimeout(() => {
                wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
            }, 10);
        }
    }
}

// --- 2. ����fԒ (Speech-to-Text / Azure Pronunciation) - ��� Speaking Mode ---
function createLegacySpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const instance = new SpeechRecognition();
    instance.lang = 'en-US';
    instance.interimResults = false;
    instance.maxAlternatives = 1;

    instance.onstart = () => {
        if (speakingProcessingTimeout) {
            clearTimeout(speakingProcessingTimeout);
            speakingProcessingTimeout = null;
        }
        launchTimerPaused = false;
        const micBtn = document.getElementById('mic-btn');
        if (micBtn) micBtn.classList.add('recording');
        document.getElementById('msg-area').innerText = "LISTENING... SPEAK NOW";
        document.getElementById('msg-area').style.color = getSpeakingThemeColor();
    };

    instance.onend = () => {
        const micBtn = document.getElementById('mic-btn');
        if (micBtn) micBtn.classList.remove('recording');

        const modal = document.getElementById('launch-modal');
        if (currentPracticeMode === 'SPEAKING' && modal && modal.style.display === 'flex' && timerInterval) {
            launchTimerPaused = true;
            document.getElementById('msg-area').innerText = "ANALYZING TRANSMISSION...";
            document.getElementById('msg-area').style.color = "#fbbf24";

            if (speakingProcessingTimeout) clearTimeout(speakingProcessingTimeout);
            speakingProcessingTimeout = setTimeout(() => {
                launchTimerPaused = false;
                speakingProcessingTimeout = null;
                if (modal.style.display === 'flex') {
                    document.getElementById('msg-area').innerText = "NO MATCH // TRY AGAIN";
                    document.getElementById('msg-area').style.color = "var(--danger)";
                }
            }, 2500);
        }
    };

    instance.onresult = (event) => {
        if (speakingProcessingTimeout) {
            clearTimeout(speakingProcessingTimeout);
            speakingProcessingTimeout = null;
        }
        launchTimerPaused = false;
        const transcript = event.results[0][0].transcript;
        console.log("User said:", transcript);
        checkSpeakingResult(transcript);
    };

    instance.onerror = (event) => {
        if (speakingProcessingTimeout) {
            clearTimeout(speakingProcessingTimeout);
            speakingProcessingTimeout = null;
        }
        launchTimerPaused = false;
        document.getElementById('msg-area').innerText = "ERROR: " + event.error;
    };

    return instance;
}

function startLegacySpeechRecognition() {
    if (!recognition) recognition = createLegacySpeechRecognition();
    if (!recognition) {
        alert("Microphone API not supported (Try Chrome/Safari).");
        return;
    }
    recognition.start();
}

async function submitSpeakingAudioForAssessment(blob) {
    const baseUrl = getSpeakingAssessmentBaseUrl();
    if (!baseUrl) throw new Error('Speaking assessment backend is not configured.');

    const wavBlob = /wav/i.test(blob.type || '') ? blob : await convertBlobToMonoWav(blob);
    console.log(`[Speaking Debug] Submitting assessment (${Math.round(wavBlob.size / 1024)} KB WAV)`);
    const audioBase64 = await blobToBase64(wavBlob);
    speakingLastRecordedAudioBase64 = audioBase64;
    const payload = {
        audioBase64,
        expectedText: currentVocab.sent ? currentVocab.sent : currentVocab.en,
        locale: 'en-US',
        referenceId: `speaking-${Date.now()}`,
        mimeType: 'audio/wav'
    };

    const response = await fetch(`${baseUrl}/api/pronunciation-assessment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const rawText = await response.text();
    let result = null;

    try {
        result = rawText ? JSON.parse(rawText) : null;
    } catch (_error) {
        throw new Error(rawText || 'Pronunciation assessment failed.');
    }

    if (!response.ok) {
        throw new Error((result && (result.message || result.error)) || 'Pronunciation assessment failed.');
    }

    console.log('[Speaking Debug] Assessment response received');
    return result;
}

async function fetchSpeakingDebriefReferenceAudio(text, locale = 'en-US', options = {}) {
    const baseUrl = getSpeakingAssessmentBaseUrl();
    if (!baseUrl) throw new Error('Speaking assessment backend is not configured.');

    const response = await fetch(`${baseUrl}/api/speak-text`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text,
            locale,
            mode: options.mode || 'default',
            level: options.level || null,
            voiceName: options.voiceName || null,
            accentLocale: options.accentLocale || null
        })
    });

    const rawText = await response.text();
    let result = null;

    try {
        result = rawText ? JSON.parse(rawText) : null;
    } catch (_error) {
        throw new Error(rawText || 'Speech synthesis failed.');
    }

    if (!response.ok) {
        throw new Error((result && (result.message || result.error)) || 'Speech synthesis failed.');
    }

    return result;
}

function stopSpeakingDebriefPlayback() {
    if (!speakingDebriefPlaybackAudio) return;
    try {
        speakingDebriefPlaybackAudio.pause();
    } catch (_error) {}
    if (speakingDebriefPlaybackObjectUrl) {
        URL.revokeObjectURL(speakingDebriefPlaybackObjectUrl);
        speakingDebriefPlaybackObjectUrl = '';
    }
    speakingDebriefPlaybackAudio = null;
    restoreSpeakingDebriefBgm();
}

function duckSpeakingDebriefBgm(targetVolume = 0.08) {
    const bgm = document.getElementById('bgm');
    if (!bgm || bgm.paused) return;
    if (speakingDebriefBgmRestoreVolume === null) {
        speakingDebriefBgmRestoreVolume = bgm.volume;
    }
    bgm.volume = Math.max(0, Math.min(1, targetVolume));
}

function restoreSpeakingDebriefBgm() {
    const bgm = document.getElementById('bgm');
    if (!bgm || speakingDebriefBgmRestoreVolume === null) return;
    bgm.volume = speakingDebriefBgmRestoreVolume;
    speakingDebriefBgmRestoreVolume = null;
}

function boostWavPlaybackBytes(bytes, peakTarget = 0.92, maxBoost = 2.8) {
    if (!(bytes instanceof Uint8Array) || bytes.length < 48) return bytes;

    const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
    const wave = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    if (riff !== 'RIFF' || wave !== 'WAVE') return bytes;

    let offset = 12;
    let audioFormat = 1;
    let bitsPerSample = 16;
    let dataOffset = -1;
    let dataSize = 0;

    while (offset + 8 <= bytes.length) {
        const chunkId = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
        const chunkSize =
            bytes[offset + 4] |
            (bytes[offset + 5] << 8) |
            (bytes[offset + 6] << 16) |
            (bytes[offset + 7] << 24);
        const chunkDataOffset = offset + 8;

        if (chunkId === 'fmt ' && chunkSize >= 16 && chunkDataOffset + 16 <= bytes.length) {
            audioFormat = bytes[chunkDataOffset] | (bytes[chunkDataOffset + 1] << 8);
            bitsPerSample = bytes[chunkDataOffset + 14] | (bytes[chunkDataOffset + 15] << 8);
        } else if (chunkId === 'data') {
            dataOffset = chunkDataOffset;
            dataSize = Math.min(chunkSize, bytes.length - chunkDataOffset);
            break;
        }

        offset = chunkDataOffset + chunkSize + (chunkSize % 2);
    }

    if (audioFormat !== 1 || bitsPerSample !== 16 || dataOffset < 0 || dataSize < 2) {
        return bytes;
    }

    const boosted = new Uint8Array(bytes);
    const view = new DataView(boosted.buffer);
    let peak = 0;

    for (let i = dataOffset; i < dataOffset + dataSize; i += 2) {
        const sample = view.getInt16(i, true);
        const normalized = Math.abs(sample) / 32768;
        if (normalized > peak) peak = normalized;
    }

    if (peak <= 0) return boosted;

    const gain = Math.max(1, Math.min(maxBoost, peakTarget / peak));
    if (gain <= 1.02) return boosted;

    for (let i = dataOffset; i < dataOffset + dataSize; i += 2) {
        const sample = view.getInt16(i, true);
        const amplified = Math.max(-32768, Math.min(32767, Math.round(sample * gain)));
        view.setInt16(i, amplified, true);
    }

    return boosted;
}

function playBase64Audio(base64Audio, mimeType = 'audio/mpeg', options = {}) {
    stopSpeakingDebriefPlayback();
    if (!base64Audio) return;

    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    const processedBytes = options.boostWavPlayback ? boostWavPlaybackBytes(bytes) : bytes;
    const objectUrl = URL.createObjectURL(new Blob([processedBytes], { type: mimeType }));
    const audio = new Audio(objectUrl);
    audio.volume = (typeof gameVolume !== 'undefined' && isFinite(gameVolume.sfx)) ? gameVolume.sfx : 0.5;
    duckSpeakingDebriefBgm();
    audio.onended = () => {
        URL.revokeObjectURL(objectUrl);
        if (speakingDebriefPlaybackObjectUrl === objectUrl) {
            speakingDebriefPlaybackObjectUrl = '';
        }
        if (speakingDebriefPlaybackAudio === audio) {
            speakingDebriefPlaybackAudio = null;
        }
        restoreSpeakingDebriefBgm();
    };
    audio.play().catch(() => {
        URL.revokeObjectURL(objectUrl);
        if (speakingDebriefPlaybackObjectUrl === objectUrl) {
            speakingDebriefPlaybackObjectUrl = '';
        }
        restoreSpeakingDebriefBgm();
    });
    speakingDebriefPlaybackAudio = audio;
    speakingDebriefPlaybackObjectUrl = objectUrl;
}

async function playSpeakingDebriefReference() {
    const log = battleLog[Number(speakingDebriefActiveLogIndex)];
    if (!log || !log.sentence) return;
    try {
        const result = await fetchSpeakingDebriefReferenceAudio(log.sentence, 'en-US');
        playBase64Audio(result.audioBase64, result.format || 'audio/mpeg');
    } catch (error) {
        console.warn('Speaking debrief Azure reference playback failed:', error);
    }
}

function playSpeakingDebriefPlayer() {
    const log = battleLog[Number(speakingDebriefActiveLogIndex)];
    if (!log?.speakingAssessment?.playerAudioBase64) return;
    playBase64Audio(
        log.speakingAssessment.playerAudioBase64,
        log.speakingAssessment.playerAudioMimeType || 'audio/wav',
        { boostWavPlayback: true }
    );
}

async function startAzureSpeakingAssessment() {
    if (speakingMediaRecorder && speakingMediaRecorder.state !== 'inactive') return;

    const micBtn = document.getElementById('mic-btn');
    const msgArea = document.getElementById('msg-area');
    const qDisplay = document.getElementById('q-display');
    const modal = document.getElementById('launch-modal');

    speakingRecordedChunks = [];
    speakingPcmChunks = [];
    speakingSilenceDetectedVoice = false;
    speakingVoiceDetectionFrames = 0;
    speakingVoiceStartedAt = 0;
    speakingNoiseFloorRms = 0.006;
    speakingNoiseSampleCount = 0;
    const sentenceText = String((currentVocab && (currentVocab.sent || currentVocab.en)) || '').trim();
    const sentenceWordCount = sentenceText ? sentenceText.split(/\s+/).filter(Boolean).length : 1;
    speakingMinVoiceWindowMs = Math.max(2200, Math.min(3600, sentenceWordCount * 320));
    speakingManualStopMinMs = Math.max(1500, Math.min(6000, sentenceWordCount * 500));
    speakingNoVoiceTimeoutMs = Math.max(5000, Math.min(9000, sentenceWordCount * 500));
    console.log('[Speaking Debug] Azure speaking capture started');
    speakingAudioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
            channelCount: 1,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
        }
    });

    const stopRecording = async () => {
        if (!speakingMediaRecorder || speakingMediaRecorder.state !== 'recording') return;
        speakingMediaRecorder.state = 'stopping';

        if (micBtn) micBtn.classList.remove('recording');

        if (!modal || modal.style.display !== 'flex') {
            speakingMediaRecorder = null;
            stopSpeakingAudioStream();
            speakingPcmChunks = [];
            return;
        }

        launchTimerPaused = true;
        if (msgArea) {
            msgArea.innerText = "SCORING TARGET WORD // HOLD POSITION";
            msgArea.style.color = "#fbbf24";
        }
        if (qDisplay) {
            qDisplay.style.color = "var(--primary)";
            qDisplay.style.fontSize = "";
        }
        setSpeakingUiState('analyzing', 'ANALYZING PRONUNCIATION...', '--');
        clearSpeakingAssessmentDetail();
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        const recordedBlob = buildSpeakingPcmWavBlob();
        speakingMediaRecorder = null;
        speakingPcmChunks = [];
        stopSpeakingAudioStream();

        try {
            const assessment = await submitSpeakingAudioForAssessment(recordedBlob);
            checkSpeakingAssessment(assessment);
        } catch (error) {
            console.warn('[Speaking Debug] Assessment request failed:', error);
            console.warn('Azure speaking assessment failed:', error);
            showSpeakingAzureUnavailable("AZURE OFFLINE // CHECK BACKEND");
        }
    };

    speakingMediaRecorder = {
        state: 'recording',
        stop: () => {
            stopRecording().catch((error) => {
                console.warn('Azure speaking recorder stop failed:', error);
                showSpeakingAzureUnavailable("AZURE START FAILED");
            });
        }
    };

    if (!(await startSpeakingPcmCapture())) {
        speakingMediaRecorder = null;
        stopSpeakingAudioStream();
        throw new Error('PCM capture unavailable.');
    }

    if (speakingProcessingTimeout) {
        clearTimeout(speakingProcessingTimeout);
        speakingProcessingTimeout = null;
    }
    if (speakingRecordingTimeout) {
        clearTimeout(speakingRecordingTimeout);
        speakingRecordingTimeout = null;
    }
    speakingRecordingStartedAt = Date.now();
    launchTimerPaused = false;
    if (micBtn) micBtn.classList.add('recording');
    if (msgArea) {
        msgArea.innerText = "READ CLEARLY // TAP MIC AGAIN TO SEND";
        msgArea.style.color = getSpeakingThemeColor();
    }
    if (qDisplay) {
        qDisplay.style.color = "var(--primary)";
        qDisplay.style.fontSize = "";
    }
    setSpeakingUiState('recording', 'LISTENING FOR VOICE...', '--');
    clearSpeakingAssessmentDetail();

    startSpeakingSilenceMonitor();
    if (speakingNoVoiceTimeout) {
        clearTimeout(speakingNoVoiceTimeout);
        speakingNoVoiceTimeout = null;
    }
    speakingNoVoiceTimeout = setTimeout(() => {
        speakingNoVoiceTimeout = null;
        if (!speakingMediaRecorder || speakingMediaRecorder.state !== 'recording') return;
        if (speakingSilenceDetectedVoice) return;
        if (micBtn) micBtn.classList.remove('recording');
        if (msgArea) {
            msgArea.innerText = "NO VOICE DETECTED // TRY AGAIN";
            msgArea.style.color = "#fbbf24";
        }
        if (qDisplay) {
            qDisplay.style.color = "var(--primary)";
            qDisplay.style.fontSize = "";
        }
        setSpeakingUiState('error', 'NO VOICE DETECTED // TRY AGAIN', '--');
        speakingMediaRecorder = null;
        speakingPcmChunks = [];
        stopSpeakingAudioStream();
    }, speakingNoVoiceTimeoutMs);
    speakingRecordingTimeout = setTimeout(() => {
        speakingRecordingTimeout = null;
        if (speakingMediaRecorder && speakingMediaRecorder.state === 'recording') {
            speakingMediaRecorder.stop();
        }
    }, speakingMaxRecordingMs);
}

function startListening() {
    if (currentPracticeMode === 'SPEAKING') {
        const statusEl = document.getElementById('speaking-status');
        if (speakingMediaRecorder && speakingMediaRecorder.state !== 'inactive') return;
        if (statusEl && (statusEl.classList.contains('analyzing') || statusEl.classList.contains('success'))) return;

        if (!canUseAzureSpeakingAssessment()) {
            const baseUrl = getSpeakingAssessmentBaseUrl();
            const blockedByMixedContent = window.isSecureContext && baseUrl && /^http:\/\//i.test(baseUrl) && !/^http:\/\/localhost(?::\d+)?$/i.test(baseUrl);
            if (blockedByMixedContent) {
                showSpeakingAzureUnavailable("AZURE NEEDS HTTPS BACKEND");
            } else {
                showSpeakingAzureUnavailable("AZURE BACKEND NOT READY");
            }
            return;
        }

        startAzureSpeakingAssessment().catch((error) => {
            console.warn('Azure speaking start failed:', error);
            showSpeakingAzureUnavailable("AZURE START FAILED");
        });
        return;
    }

    startLegacySpeechRecognition();
}

function getSpeakingThemeColor() {
    return selectedRace === 'AURELIANS' ? '#fae382' : '#0ea5e9';
}

function handleSpeakingMicClick() {
    const qDisplay = document.getElementById('q-display');
    const statusEl = document.getElementById('speaking-status');

    if (speakingMediaRecorder && speakingMediaRecorder.state === 'recording') {
        const elapsed = Math.max(0, Date.now() - speakingRecordingStartedAt);
        if (elapsed < speakingManualStopMinMs) {
            const remainingMs = Math.max(0, speakingManualStopMinMs - elapsed);
            if (qDisplay) {
                qDisplay.innerText = "KEEP READING // MIC SEND LOCKED";
                qDisplay.style.color = "#94a3b8";
                qDisplay.style.fontSize = "18px";
            }
            if (statusEl && !statusEl.classList.contains('analyzing')) {
                setSpeakingUiState('recording', `VOICE LINK ACTIVE // ${Math.ceil(remainingMs / 1000)}S TO SEND`, '--');
            }
            return;
        }

        console.log(`[Speaking Debug] Manual mic stop after ${elapsed}ms`);
        speakingMediaRecorder.stop();
        return;
    }

    startListening();
}

function renderSpeakingWordScores(words, targetWord) {
    const targetMatch = resolveSpeakingTargetAssessment(words, targetWord).wordAssessment;
    return (words || []).map(wordEntry => {
        const score = Math.round(wordEntry.accuracy ?? 0);
        const color = getSpeakingAssessmentColor(score, wordEntry.errorType);
        const isTarget = targetMatch && wordEntry === targetMatch;
        const style = [
            `color:${color}`,
            isTarget ? 'display:inline-block;margin:0 10px 8px 0;padding:4px 10px;border:1px solid currentColor;border-radius:999px;text-shadow:0 0 10px currentColor;box-shadow:inset 0 0 10px rgba(255,255,255,0.05)' : 'display:inline-block;margin:0 6px 8px 0;opacity:0.92'
        ].filter(Boolean).join(';');
        return `<span style="${style}">${wordEntry.word}</span>`;
    }).join(' ');
}

function checkSpeakingAssessment(result) {
    if (speakingProcessingTimeout) {
        clearTimeout(speakingProcessingTimeout);
        speakingProcessingTimeout = null;
    }

    launchTimerPaused = false;

    const targetWord = currentVocab.en;
    const targetContext = resolveSpeakingTargetAssessment(result.words, targetWord);
    const targetWordAssessment = targetContext.wordAssessment;
    const sentenceScore = Math.round(result.overall?.pronunciation ?? result.overall?.accuracy ?? 0);
    const targetMissing = targetContext.matchType === 'missing' || /omission|missing/i.test(String(targetWordAssessment?.errorType || ''));
    const rawWordScore = targetMissing
        ? 0
        : Math.round(targetWordAssessment?.accuracy ?? sentenceScore ?? 0);
    const speakingWords = Array.isArray(result.words) ? result.words : [];
    const targetWordLower = String(targetWord || '').trim().toLowerCase();
    const weightedWordTotal = speakingWords.reduce((sum, wordEntry) => {
        const word = String(wordEntry?.word || '').trim().toLowerCase();
        const weight = word && word === targetWordLower ? 2 : 1;
        return sum + (Math.round(wordEntry?.accuracy ?? 0) * weight);
    }, 0);
    const weightedWordDivisor = speakingWords.reduce((sum, wordEntry) => {
        const word = String(wordEntry?.word || '').trim().toLowerCase();
        return sum + (word && word === targetWordLower ? 2 : 1);
    }, 0);
    const hasTargetWordInWords = speakingWords.some(wordEntry => String(wordEntry?.word || '').trim().toLowerCase() === targetWordLower);
    const weightedSentenceScore = weightedWordDivisor > 0
        ? Math.round((weightedWordTotal + (hasTargetWordInWords ? 0 : rawWordScore * 2)) / (weightedWordDivisor + (hasTargetWordInWords ? 0 : 2)))
        : sentenceScore;
    const targetScore = targetMissing ? 0 : rawWordScore;
    const finalScore = weightedWordDivisor > 0
        ? weightedSentenceScore
        : Math.round((sentenceScore * 0.6) + (targetScore * 0.4));
    const transcript = result.recognizedText || '';
    const qDisplay = document.getElementById('q-display');
    const msgArea = document.getElementById('msg-area');

    if (qDisplay) {
        qDisplay.style.display = 'block';
        qDisplay.innerHTML = renderSpeakingWordScores(result.words, targetWord) || `"${transcript}"`;
        qDisplay.style.fontSize = "18px";
    }

    setSpeakingUiState('analyzing', 'ASSESSMENT LOCKED', `${finalScore}`);
    renderSpeakingAssessmentDetail(targetWordAssessment, targetContext.matchType, sentenceScore);

    const isCorrect = finalScore >= SPEAKING_PASS_SCORE && !targetMissing;

    if (isCorrect) {
        if (typeof timerInterval !== 'undefined') clearInterval(timerInterval);
        timerInterval = null;

        upsertSpeakingBattleLogEntry(
            transcript,
            currentVocab.sent ? currentVocab.sent : currentVocab.en,
            result,
            targetWord,
            finalScore,
            true
        );

        removeWrongWord(currentPracticeMode, selectedLevel, currentVocab.en);
        if (typeof handleCorrectAnswer === 'function') handleCorrectAnswer();

        if (msgArea) {
            msgArea.innerText = `${targetWord.toUpperCase()} ${finalScore} // MATCH CONFIRMED!`;
            msgArea.style.color = getSpeakingAssessmentColor(targetScore, targetWordAssessment?.errorType);
        }
        playSound('speaking-green-sfx');
        setSpeakingUiState('success', 'TARGET LOCKED // FIRE AUTHORIZED', `${finalScore}`);
        setTimeout(() => playerFire(true), 1000);
        return;
    }

    upsertSpeakingBattleLogEntry(
        transcript,
        currentVocab.sent ? currentVocab.sent : currentVocab.en,
        result,
        targetWord,
        finalScore,
        false
    );

    saveWrongWord(currentPracticeMode, selectedLevel, currentVocab.en);
    if (msgArea) {
        msgArea.innerText = `${targetWord.toUpperCase()} ${finalScore} // TRY AGAIN`;
        msgArea.style.color = getSpeakingAssessmentColor(targetScore, targetWordAssessment?.errorType);
    }
    setSpeakingUiState('error', targetMissing ? 'MISPRONUNCIATION // TRY AGAIN' : 'UNCLEAR // ADJUST PRONUNCIATION', `${finalScore}`);
    playSound('speaking-wrong-sfx');
}

// --- 3. �z����Z�Y�� (Speaking Score - fallback legacy sentence matching) ---
function checkSpeakingResult(spokenText) {
    if (speakingProcessingTimeout) {
        clearTimeout(speakingProcessingTimeout);
        speakingProcessingTimeout = null;
    }
    launchTimerPaused = false;

    // �@ȡĿ�˾��� (����o�������Æ���)
    const targetText = currentVocab.sent ? currentVocab.sent : currentVocab.en;
    
    // �@ʾ����x��ؿ
    document.getElementById('q-display').style.display = 'block';
    document.getElementById('q-display').innerText = `"${spokenText}"`;
    document.getElementById('q-display').style.fontSize = "18px"; 

    // --- ���ܱȌ�߉݋ ---
    const cleanSpoken = spokenText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const cleanTarget = targetText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    // Ӌ�����ƶ�
    const similarity = calculateSimilarity(cleanSpoken, cleanTarget);
    
    if (similarity >= 0.8) {
        // --- ���� �P�I���� 1������ֹͣ��������ֹ�`�� Timeout ���� ---
        if (typeof timerInterval !== 'undefined') clearInterval(timerInterval);
        timerInterval = null;

        // --- ���� �P�I���� 2�������� (Battle Log) ���� ---
        if (typeof battleLog !== 'undefined') {
            battleLog.push({
                turn: (typeof turnCounter !== 'undefined' ? turnCounter : 1),
                user: spokenText,       // ӛ����x�ľ���
                correct: targetText,    // ӛ����_�ľ���
                isCorrect: true
            });
        }

        // �� �e��ӛ䛣�������Ƴ�
        removeWrongWord(currentPracticeMode, selectedLevel, currentVocab.en);

        // ���� CRITICAL FIX: Call handleCorrectAnswer to award XP and update mastery ����
        if (typeof handleCorrectAnswer === 'function') {
            handleCorrectAnswer();
        }

        // UI �@ʾ
        const scorePercent = Math.floor(similarity * 100);
        document.getElementById('msg-area').innerText = `ACCURACY: ${scorePercent}% // MATCH CONFIRMED!`;
        document.getElementById('msg-area').style.color = "var(--success)";

        // ���t 1 ��l��
        setTimeout(() => playerFire(true), 1000);

    } else {
        // --- �x�e ---
        // �� �e��ӛ䛣����e��ӛ�
        saveWrongWord(currentPracticeMode, selectedLevel, currentVocab.en);

        const scorePercent = Math.floor(similarity * 100);
        document.getElementById('msg-area').innerText = `ACCURACY: ${scorePercent}% // TOO LOW - TRY AGAIN`;
        document.getElementById('msg-area').style.color = "var(--danger)";
        playSound('wrong-sfx');
    }
}

// ������һ� (Back ��)
function backToMainMenu() {
    playSound('delete-sfx');
    document.getElementById('skill-screen').style.display = 'none';

    if (tempGameMode === 'AI') {
        // AI ģʽ��Skill �S�ڶ�����Back ���� Level �x��
        document.getElementById('level-screen').style.display = 'flex';
    } else {
        // ����ģʽ�������x��
        showMainMenu();
    }
}
/* =========================================
   ���� CYBERPUNK MATRIX EFFECT (ƽ��棺������������) ����
   ========================================= */
let matrixInterval = null;

function startMatrixEffect() {
    const canvas = document.getElementById('matrix-bg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // �O��ȫΞĻ�ߴ�
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
    const charArray = chars.split('');

    const fontSize = 14;
    const columns = canvas.width / fontSize; 

    const drops = [];
    // ���֣��S�C��ʼλ�� (��ֹ��������Ч��)
    for (let x = 0; x < columns; x++) {
        drops[x] = Math.random() * (canvas.height / fontSize);
    }

    function draw() {
        // �� ΢�{ 1���������w�� (0.08) - ��ֵԽ������βԽ�L
        // ��֮ǰ�� 0.1 ��΢�Lһ�c�c���������Ӹ�
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // �� �����N���x���ɫ ��
        let mainColor, flashColor;
        if (typeof selectedRace !== 'undefined' && selectedRace === 'AURELIANS') {
            // Aurelians: ��ɫ
            mainColor = 'rgba(250, 250, 210, 0.65)';
            flashColor = 'rgba(255, 255, 255, 0.8)';
        } else {
            // �����N��: �{ɫ
            mainColor = 'rgba(14, 165, 233, 0.65)';
            flashColor = 'rgba(255, 255, 255, 0.8)';
        }

        ctx.font = fontSize + 'px "Orbitron", monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = charArray[Math.floor(Math.random() * charArray.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // �� ΢�{ 4���W�q�C�� (0.975) - ���S 2.5% �C���W
            // ��֮ǰ�� 0.5% ������⣬������Wä��
            if (Math.random() > 0.975) {
                ctx.fillStyle = flashColor;
            } else {
                ctx.fillStyle = mainColor;
            }

            ctx.fillText(text, x, y);

            // �S�C����
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    if (matrixInterval) clearInterval(matrixInterval);
    matrixInterval = setInterval(draw, 33); // 30 FPS
}

// ҕ����С��׃�r����
window.addEventListener('resize', () => {
    if (document.getElementById('launch-modal').style.display !== 'none') {
        startMatrixEffect();
    setSpeakingUiState();
    }
});
function stopMatrixEffect() {
    if (matrixInterval) {
        clearInterval(matrixInterval);
        matrixInterval = null;
    }
}

// ���� VIRTUAL KEYBOARD EVENT LISTENERS ����
document.addEventListener('DOMContentLoaded', function() {
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    const hiddenInput = document.getElementById('hidden-input');

    if (virtualKeyboard && hiddenInput) {
        // Add click event to all keyboard keys
        virtualKeyboard.addEventListener('click', function(e) {
            const key = e.target.closest('.kb-key');
            if (!key) return;

            e.preventDefault();
            e.stopPropagation();

            const keyValue = key.getAttribute('data-key');

            if (keyValue === 'ENTER') {
                // Fire button - submit answer
                checkAnswer();
            } else if (keyValue === 'BACKSPACE') {
                lastVirtualKeyboardKey = null;
                // Backspace - remove last character
                // Temporarily remove readonly to modify value
                const wasReadonly = hiddenInput.hasAttribute('readonly');
                if (wasReadonly) hiddenInput.removeAttribute('readonly');

                const currentValue = hiddenInput.value;
                hiddenInput.value = currentValue.slice(0, -1);

                // Trigger input event to update display
                const inputEvent = new Event('input', { bubbles: true });
                hiddenInput.dispatchEvent(inputEvent);

                // Restore readonly
                if (wasReadonly) hiddenInput.setAttribute('readonly', 'readonly');

            } else {
                lastVirtualKeyboardKey = key;
                // Regular key or space - add character
                // Temporarily remove readonly to modify value
                const wasReadonly = hiddenInput.hasAttribute('readonly');
                if (wasReadonly) hiddenInput.removeAttribute('readonly');

                hiddenInput.value += keyValue;

                // Trigger input event to update display
                const inputEvent = new Event('input', { bubbles: true });
                hiddenInput.dispatchEvent(inputEvent);

                // Restore readonly
                if (wasReadonly) hiddenInput.setAttribute('readonly', 'readonly');

            }
        });

        // ���� Add touch animation for tablets (manual :active state) ����
        virtualKeyboard.addEventListener('touchstart', function(e) {
            const key = e.target.closest('.kb-key');
            if (!key) return;
            key.classList.add('kb-active');
        }, { passive: true });

        virtualKeyboard.addEventListener('touchend', function(e) {
            const key = e.target.closest('.kb-key');
            if (!key) return;
            setTimeout(() => key.classList.remove('kb-active'), 100);
        }, { passive: true });

        virtualKeyboard.addEventListener('touchcancel', function(e) {
            const key = e.target.closest('.kb-key');
            if (!key) return;
            key.classList.remove('kb-active');
        }, { passive: true });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const roomCodePad = document.getElementById('room-code-pad');
    const roomInput = document.getElementById('room-id-input');

    if (roomCodePad) {
        roomCodePad.addEventListener('click', function(e) {
            const key = e.target.closest('[data-room-key]');
            if (!key) return;

            e.preventDefault();
            e.stopPropagation();
            handleRoomCodeInput(key.getAttribute('data-room-key'));
        });

        roomCodePad.addEventListener('touchstart', function(e) {
            const key = e.target.closest('.room-code-key, .room-code-join');
            if (!key) return;
            key.classList.add('kb-active');
        }, { passive: true });

        roomCodePad.addEventListener('touchend', function(e) {
            const key = e.target.closest('.room-code-key, .room-code-join');
            if (!key) return;
            setTimeout(() => key.classList.remove('kb-active'), 100);
        }, { passive: true });

        roomCodePad.addEventListener('touchcancel', function(e) {
            const key = e.target.closest('.room-code-key, .room-code-join');
            if (!key) return;
            key.classList.remove('kb-active');
        }, { passive: true });
    }

    if (roomInput) {
        roomInput.addEventListener('keydown', function(e) {
            e.preventDefault();
        });

        roomInput.addEventListener('focus', function() {
            roomInput.blur();
        });
    }

    document.addEventListener('keydown', function(e) {
        const lobbyControls = document.getElementById('lobby-controls');
        const lobbyScreen = document.getElementById('lobby-screen');
        if (!isElementVisible(lobbyScreen) || !isElementVisible(lobbyControls)) return;

        if (/^\d$/.test(e.key)) {
            e.preventDefault();
            handleRoomCodeInput(e.key);
            return;
        }

        if (e.key === 'Backspace') {
            e.preventDefault();
            handleRoomCodeInput('BACKSPACE');
            return;
        }

        if (e.key === 'Delete') {
            e.preventDefault();
            handleRoomCodeInput('CLEAR');
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            handleRoomCodeInput('JOIN');
        }
    });
});

window.onload = function() {
    console.log("System Initializing...");

    preloadBattleEffectAssets();

    // 1. ��ʼ���Y�ώ� (�����)
    if(typeof sortDatabase === 'function') {
        sortDatabase();
    }

    // 2. ���ӱ���������Ч
    if(typeof createTwinklingStars === 'function') {
        createTwinklingStars();
    }

    // 3. ��ʼ�� HUD ��B���� cached auth �����@ʾ CONNECTING�������W�� LOGIN PANEL
    const cachedName = localStorage.getItem('battleship_username');
    const cachedUid = localStorage.getItem('battleship_auth_uid');
    if (cachedName && cachedUid) {
        switchHudPanel('connecting-panel');
    } else {
        switchHudPanel('login-panel');
    }

    // �_�����x�� Carousel ���[�ص�
    const carousel = document.getElementById('main-menu-carousel');
    if(carousel) {
        carousel.style.display = 'none';
    }

    // 4. �xȡ֮ǰ�������O��
    if (typeof loadSavedAudioSettings === 'function') {
        loadSavedAudioSettings();
    }

    // ���߳������^ tap-to-start��ֱ��ȥ login panel �K�@ʾ֪ͨ
    if (localStorage.getItem('battleship_kicked')) {
        localStorage.removeItem('battleship_kicked');
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-content-wrapper').style.display = 'flex';
        switchHudPanel('login-panel');
        setTimeout(() => {
            showNotification("ACCOUNT LOGGED IN ON ANOTHER DEVICE", "error", 3000);
        }, 500);
    }
};
function handleSkillBack() {
    playSound('delete-sfx');
    if (tempGameMode === 'PVP' && currentRoomId) {
        showNotification('PVP LINK ABORTED', 'warning', 2000);
        resetGame();
        return;
    }
    document.getElementById('skill-screen').style.display = 'none';
    
    if (tempGameMode === 'AI') {
        if (selectedLevel) {
            renderStageScreen(selectedLevel);
            showStageScreen();
        } else {
            showMainMenu();
        }
    } else {
        // PVP: ���� Level �x�� (��������� Level -> Skill)
        document.getElementById('level-screen').style.display = 'flex';
    }
}
// ���� ������Ӌ��ɂ��ִ������ƶ� (0.0 - 1.0) ����
function calculateSimilarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}
// =========================================
// ���� ������Qݔ�������Ч (���ΰ�) ����
// =========================================

// 1. �O����Ӌ�r��ȥ����ݔ��� (����Еrݔ���δ Load ����)
const checkInputInterval = setInterval(() => {
    // ����ݔ��� (ID = 'player-name-input')
    const nameInput = document.getElementById('player-name-input');
    
    if (nameInput) {
        // �����ˣ�ֹͣӋ�r��
        clearInterval(checkInputInterval);
        
        // 2. ������ֱO 
        nameInput.addEventListener('input', (e) => {
            // ÿ�δ��֣����� enter_word.mp3
            // ��������Ч������_���B��r���ԯB����
            const sound = new Audio('enter_word.mp3'); 
            sound.volume = 0.45; // boost typing sound slightly
            
            // ���� (�� catch ��ֹ�g�[�����)
            sound.play().catch(() => {}); 
        });
        
        // 3. (�x��) ����h�� (Backspace)
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                const delSound = new Audio('delete_word.mp3');
                delSound.volume = 0.3;
                delSound.play().catch(() => {});
            }
        });
        
        console.log("Typing sound loaded for player input!");
    }
}, 500); // ÿ 0.5 ��z��һ�Σ�ֱ��������ֹ

// --- �� ����������Ӌ�r�����Ӻ��� �� ---
function startCountdownTimer() {
    // 1. ���Ӌ�r���ѽ����ܣ���������@���� (��ֹ���})
    if (timerInterval) return;

    const modal = document.getElementById('launch-modal');
    if (modal.style.display === 'none') return; // ���ҕ���V�������Ӌ

    const timerBar = document.getElementById('timer-bar');
    
    // Ӌ��r�g (߉݋ͬԭ��һ��)
    let timeMultiplier = 1.0;
    let baseTime = 3;
    if (currentPracticeMode === 'LISTENING') {
        timeMultiplier = 1.1;
    } else if (currentPracticeMode === 'SPEAKING') {
        baseTime = 4;
        timeMultiplier = 0.8;
    }
    const totalTime = baseTime + (currentVocab.en.length * timeMultiplier);
    launchTimerTotal = currentPracticeMode === 'SPEAKING' ? totalTime * 2 : totalTime;
    launchTimerTimeLeft = launchTimerTotal;
    launchTimerPaused = false;

    // �_ʼ�Ӯ�
    timerBar.style.transition = 'width 0.1s linear';
    timerBar.style.width = '100%';
    
    // ���ӵ���
    timerInterval = setInterval(() => {
        if (launchTimerPaused) return;

        launchTimerTimeLeft -= 0.1;
        const percentage = (launchTimerTimeLeft / launchTimerTotal) * 100;
        timerBar.style.width = percentage + "%";
        
        if (launchTimerTimeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null; // �_������
            handlePlayerTimeout();
        }
    }, 100);
}

/* =========================================
   ���� ADVANCED VOICE ENGINE (Smart Timing) ����
   ========================================= */

async function speakText(text, element = null, startListeningTimer = false) {
    if (!text) return;

    if (typeof currentPracticeMode !== 'undefined' && currentPracticeMode === 'LISTENING') {
        try {
            const played = await playListeningAzureText(text, element, startListeningTimer);
            if (played) return;
        } catch (error) {
            console.warn('Listening Azure playback failed, falling back to browser voice:', error);
        }
    }

    // �� ���殔ǰfocus��B��LISTENING mode��Ҫ��
    const hiddenInput = document.getElementById('hidden-input');
    const shouldMaintainFocus = hiddenInput && hiddenInput.style.display !== 'none' &&
                                 typeof currentPracticeMode !== 'undefined' && currentPracticeMode === 'LISTENING';

    // 1. �z��֧Ԯ��
    if (!('speechSynthesis' in window)) {
        console.error("Browser does not support Speech Synthesis");
        return;
    }

    // 2. ֹͣ�f�Z�� & ����f��Ч
    window.speechSynthesis.cancel();
    document.querySelectorAll('.vocab-row.speaking').forEach(el => el.classList.remove('speaking'));

    const utterance = new SpeechSynthesisUtterance(text);

    // ���� CRITICAL: Force English language to prevent system language interference ����
    utterance.lang = 'en-US';

    // 3. �O���Z�􅢔� (���������O��)
    // ��ʹ��δ�������O�����@�δ��aҲ���Ԅ����A�Oֵ���������e
    utterance.volume = getBoostedListeningVoiceVolume();

    // �Lԇ���� Google Voice ������Ӣ��
    if (typeof techVoice !== 'undefined' && techVoice) {
         utterance.voice = techVoice;
    }

    utterance.rate = 0.9; // �Z���m��
    utterance.pitch = 1.0;

    // --- ���� ����߉݋�������i��Ŀ����λ�� ���� ---
    let hasTimerStarted = false;
    let targetWordEndIndex = -1;

    // ֻ�� LISTENING ģʽ���M��Ӌ��
    if (typeof currentPracticeMode !== 'undefined' && currentPracticeMode === 'LISTENING' &&
        typeof currentVocab !== 'undefined' && currentVocab.en &&
        text.toLowerCase().includes(currentVocab.en.toLowerCase())) {

        const targetWord = currentVocab.en;
        // ʹ�� Regex �ʴ_�������ւS��������ȡ��Y��λ�á�
        const escapedTarget = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedTarget}\\b`, 'i');
        const match = regex.exec(text);

        if (match) {
            // match.index �S�����_ʼλ�� + �����L�� = �Y��λ��
            targetWordEndIndex = match.index + match[0].length;
        }
    }

    // 4. �O���¼��O ��

    // A. �_ʼ�x (ҕ�X��Ч)
    utterance.onstart = () => {
        if (element) element.classList.add('speaking');
    };

    // B. ���� ߅���¼� (ÿ�xһ���ֶ��� Trigger) ����
    utterance.onboundary = (event) => {
        // �l��������Ŀ���� + Timer δ�_ʼ + �ǆ���߅��
        if (targetWordEndIndex !== -1 && !hasTimerStarted) {
            // ��� ��ǰλ�� >= Ŀ���ֽY��λ�ã����S����Ŀ�����ѽ��x�꣡
            if (event.charIndex >= targetWordEndIndex) {
                console.log("Target word finished! Starting timer instantly.");
                hasTimerStarted = true;
                if (typeof startCountdownTimer === 'function') {
                    startCountdownTimer(); // <--- ��������Ӌ�r��
                }
            }
        }
    };

    // C. �x�� (Fallback ���U��)
    utterance.onend = () => {
        if (element) element.classList.remove('speaking');

        // �� LISTENING mode������focus input
        if (shouldMaintainFocus && hiddenInput) {
            setTimeout(() => {
                hiddenInput.focus();
            }, 50);
        }

        // ����x�궼δ Trigger (���炀�ւS���������һ����)���͂S�� Trigger
        if (startListeningTimer &&
            typeof currentPracticeMode !== 'undefined' && currentPracticeMode === 'LISTENING' &&
            !hasTimerStarted) {
             const modal = document.getElementById('launch-modal');
             // �_��ҕ�����_�o
             if (modal && modal.style.display === 'flex') {
                 if (typeof startCountdownTimer === 'function') {
                    startCountdownTimer();
                 }
             }
        }
    };

    // 5. ��ʽ�l
    try {
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('Speech synthesis failed:', error);

        if (element) element.classList.remove('speaking');

        if (shouldMaintainFocus && hiddenInput) {
            setTimeout(() => hiddenInput.focus(), 50);
        }

        if (startListeningTimer &&
            typeof currentPracticeMode !== 'undefined' && currentPracticeMode === 'LISTENING' &&
            !hasTimerStarted) {
            const modal = document.getElementById('launch-modal');
            if (modal && modal.style.display === 'flex' && typeof startCountdownTimer === 'function') {
                startCountdownTimer();
            }
        }
    }
}

/* =========================================
   ���� SKILL SYSTEM ����
   ========================================= */

let selectedSkill = null;
let activeSkill = null;
let radarPreviewIndex = null;
let radarLockedIndex = null;
let missilePreviewIndex = null;
let missileLockedIndex = null;
let lastRadarResultShownAt = 0;
const radarScannedCells = new Set();
const RADAR_SCAN_DURATION = 2200;
const RADAR_RESULT_DISPLAY_DURATION = 1500;
const AI_RADAR_ATTACK_DELAY = 500;
const MISSILE_EXPLOSION_DURATION = 720;
const MISSILE_LOCK_ON_DURATION = 500;
const NUKE_WHITEOUT_HOLD = 1000;
const NUKE_WHITEOUT_FADE = 500;
const NUKE_SHAKE_DURATION = 800;
const NUKE_EXPLOSION_DURATION = 720;
const NUKE_EXPLOSION_COLUMNS = 5;
const NUKE_EXPLOSION_ROWS = 5;
const NUKE_EXPLOSION_FRAMES = 25;
const NUKE_LOCK_ON_DURATION = 1000;
const EFFEKSEER_RUNTIME_SCRIPT_PATH = 'vendor/effekseer/effekseer.min.js';
const EFFEKSEER_RUNTIME_WASM_PATH = 'vendor/effekseer/effekseer.wasm';
const EFFEKSEER_EFFECTS = {
    vanguardsNuke: {
        path: 'effects/vanguards/firepunch/FirePunch.efkefc',
        loadScale: 1,
        playScale: 0.72,
        speed: 1,
        duration: 1500,
        viewportSize: 4096
    },
    missileImpact: {
        path: 'effects/vanguards/missile_fire_punch/Fire Punch.efkefc',
        loadScale: 1,
        playScale: 0.238,
        speed: 1.08,
        duration: 820,
        viewportSize: 4096
    },
    vanguardsNormalStrike: {
        path: 'effects/vanguards/normal_strike/Strike2_Lv1_Blue_Vanguards.efkefc',
        loadScale: 1,
        playScale: 0.22,
        speed: 0.47,
        duration: 1470,
        viewportSize: 4096
    },
    normalAttack: {
        path: 'effects/vanguards/normal_explosion/normal_explosion.efkefc',
        loadScale: 1,
        playScale: 0.17,
        speed: 1.15,
        duration: 520,
        viewportSize: 4096
    },
    aureliansNormalAttack: {
        path: 'effects/aurelians/normal_attack/Circular Impact_Aurelians.efkefc',
        loadScale: 1,
        playScale: 0.06,
        speed: 1.12,
        duration: 620,
        viewportSize: 4096
    }
};
const DEFAULT_INSTRUCTION = {
    name: 'SINGLE SHOT',
    desc: 'TAP A CELL TO FIRE',
    icon: 'aim.png'
};

const SKILL_INFO = {
    radar:     { name: 'RADAR',   desc: 'Shows the number of undamaged objects surrounding a missed cell', icon: 'radar.png' },
    explosion: { name: 'MISSILE', desc: 'Fire a missile at a 2x2 area of your choice', icon: 'explosion.png' },
    nuke:      { name: 'NUKE',    desc: 'Launch a nuclear missile at a 4x4 area of your choice', icon: 'nuclear_bomb.png' }
};

const AURELIANS_SKILL_INFO = {
    radar:     { name: 'AEGIS',    desc: 'SELECT A SHIELDED 4X4 ZONE', icon: 'aurelians_shield.png', title: 'Aegis (4?)' },
    explosion: { name: 'TELEPORT', desc: 'SELECT A TELEPORT ZONE', icon: 'aurelians_teleport.png', title: 'Teleport (7?)' },
    nuke:      { name: 'JUDGMENT', desc: 'SELECT A 4X4 JUDGMENT ZONE', icon: 'aurelians_judgment.png', title: 'Judgment (20?)' }
};

function getSkillInfo(skill) {
    if (selectedRace === 'AURELIANS') {
        return AURELIANS_SKILL_INFO[skill] || SKILL_INFO[skill];
    }
    return SKILL_INFO[skill];
}

function normalizeSentenceProgressState() {
    if (!userSentenceProgress || typeof userSentenceProgress !== 'object') {
        userSentenceProgress = { listening: {}, speaking: {} };
    }
    if (!userSentenceProgress.listening || typeof userSentenceProgress.listening !== 'object') {
        userSentenceProgress.listening = {};
    }
    if (!userSentenceProgress.speaking || typeof userSentenceProgress.speaking !== 'object') {
        userSentenceProgress.speaking = {};
    }
    window.userSentenceProgress = userSentenceProgress;
    return userSentenceProgress;
}

function buildSentenceCycleQueue(sentenceCount) {
    return Array.from({ length: sentenceCount }, (_, index) => index);
}

function isValidSentenceQueue(queue, sentenceCount) {
    return Array.isArray(queue) &&
        queue.length > 0 &&
        queue.every(index => Number.isInteger(index) && index >= 0 && index < sentenceCount);
}

function ensureSentenceProgressEntry(modeKey, levelKey, wordId, sentenceCount) {
    const progress = normalizeSentenceProgressState();
    if (!progress[modeKey][levelKey]) progress[modeKey][levelKey] = {};

    const existingEntry = progress[modeKey][levelKey][wordId];
    const queue = isValidSentenceQueue(existingEntry?.queue, sentenceCount)
        ? [...existingEntry.queue]
        : buildSentenceCycleQueue(sentenceCount);

    const entry = {
        queue,
        lastIndex: Number.isInteger(existingEntry?.lastIndex) ? existingEntry.lastIndex : null,
        updatedAt: existingEntry?.updatedAt || null
    };

    progress[modeKey][levelKey][wordId] = entry;
    return entry;
}

function syncSentenceProgressEntry(modeKey, levelKey, wordId, entry) {
    const progress = normalizeSentenceProgressState();
    if (!progress[modeKey][levelKey]) progress[modeKey][levelKey] = {};
    progress[modeKey][levelKey][wordId] = entry;
    window.userSentenceProgress = progress;

    if (!window.myPlayerId || !window.db || !window.firebaseModules?.set || !window.firebaseModules?.ref) return;

    const sentenceProgressRef = window.firebaseModules.ref(
        window.db,
        `users/${window.myPlayerId}/sentenceProgress/${modeKey}/${levelKey}/${wordId}`
    );
    window.firebaseModules.set(sentenceProgressRef, entry).catch(error => {
        console.warn('[Sentence Progress] Failed to sync sentence queue:', error);
    });
}

function applySelectedSentenceToCurrentVocab(selectedSent) {
    if (typeof selectedSent === 'object' && selectedSent?.text) {
        currentVocab.sent = selectedSent.text;
        currentVocab.listeningAnswer = getSentenceSurfaceAnswer(
            selectedSent.text,
            selectedSent.answer || currentVocab.en || ''
        );
        console.log(`[Vocab] Using new format - Sentence: "${selectedSent.text}", Answer: "${currentVocab.listeningAnswer}"`);
    } else {
        currentVocab.sent = selectedSent;
        currentVocab.listeningAnswer = null;
        console.log(`[Vocab] Using old format - Sentence: "${selectedSent}"`);
    }
}

function assignSentenceForCurrentVocab() {
    if (!currentVocab?.sents || currentVocab.sents.length === 0) {
        if (!currentVocab?.sent && currentVocab?.en) {
            currentVocab.sent = currentVocab.en;
            currentVocab.listeningAnswer = null;
        }
        return;
    }

    const modeKey = (currentPracticeMode || '').toLowerCase();
    if (modeKey !== 'listening' && modeKey !== 'speaking') {
        const fallbackSent = currentVocab.sents[0];
        applySelectedSentenceToCurrentVocab(fallbackSent);
        currentVocab.sentenceIndex = 0;
        return;
    }

    const sentenceCount = currentVocab.sents.length;
    const levelKey = selectedLevel || 'L1';
    const wordId = currentVocab.en;
    const entry = ensureSentenceProgressEntry(modeKey, levelKey, wordId, sentenceCount);
    const selectedIndex = entry.queue.shift();

    if (entry.queue.length === 0) {
        entry.queue = buildSentenceCycleQueue(sentenceCount);
    }

    entry.lastIndex = selectedIndex;
    entry.updatedAt = Date.now();
    syncSentenceProgressEntry(modeKey, levelKey, wordId, entry);

    currentVocab.sentenceIndex = selectedIndex;
    applySelectedSentenceToCurrentVocab(currentVocab.sents[selectedIndex]);
    console.log(`[Sentence Debug] ${modeKey.toUpperCase()} ${levelKey} ${wordId} -> S${selectedIndex + 1}`);
    console.log(`[Sentence Progress] ${modeKey}/${levelKey}/${wordId} -> sentence ${selectedIndex + 1}/${sentenceCount}`);
}

function updateBattleRaceUiTheme() {
    const isAurelians = selectedRace === 'AURELIANS';
    const hudSkills = document.getElementById('hud-skills');
    const enemyBoard = document.getElementById('enemy-board');
    const playerBoard = document.getElementById('player-board');
    const playerBoardLabel = playerBoard ? playerBoard.querySelector('.board-label') : null;
    const controlPanel = document.getElementById('control-panel');
    const energyIcon = document.querySelector('.skill-energy-icon');
    const visuals = isAurelians ? AURELIANS_SKILL_INFO : SKILL_INFO;

    if (hudSkills) hudSkills.classList.toggle('aurelians-theme', isAurelians);
    if (enemyBoard) enemyBoard.classList.toggle('aurelians-theme', isAurelians);
    if (playerBoardLabel) {
        playerBoardLabel.style.color = isAurelians ? '#2dd4bf' : 'var(--success)';
        playerBoardLabel.style.textShadow = isAurelians ? '0 0 10px rgba(45, 212, 191, 0.8)' : '0 0 10px currentColor';
    }
    if (controlPanel && isAurelians) {
        controlPanel.style.borderColor = '#2dd4bf';
        controlPanel.style.boxShadow = '0 0 15px rgba(45, 212, 191, 0.3)';
    }
    if (energyIcon) energyIcon.src = isAurelians ? 'aurelians_energy.png' : 'energy.png';

    document.querySelectorAll('.skill-diamond').forEach(diamond => {
        const skill = diamond.dataset.skill;
        const info = visuals[skill];
        const icon = diamond.querySelector('.skill-icon');
        if (!info || !icon) return;

        icon.src = info.icon;
        icon.alt = info.name;
        diamond.title = info.title || `${info.name}`;
    });
}

function setInstructionPanel(name, desc, icon) {
    const instrIcon = document.getElementById('instruction-icon');
    const instrText = document.getElementById('instruction-text');
    if (instrIcon) instrIcon.src = icon;
    if (instrText) {
        instrText.innerHTML = `<span class="instr-name">${name}:</span> <span class="instr-desc">${desc}</span>`;
    }
}

function resetSkillSelectionUI() {
    const costVal = document.getElementById('skill-cost-val');
    const confirmBtns = document.getElementById('skill-confirm-btns');
    const costRow = costVal ? costVal.parentElement : null;

    if (costVal) costVal.style.display = 'none';
    if (costRow) costRow.classList.remove('cost-double-digit');
    if (confirmBtns) confirmBtns.style.display = 'none';
}

function getEnemyCell(index) {
    const grid = document.getElementById('enemy-grid');
    return grid ? grid.children[index] : null;
}

function getRadarAreaIndices(centerIndex) {
    const centerRow = Math.floor(centerIndex / GRID_SIZE);
    const centerCol = centerIndex % GRID_SIZE;
    const indices = [];

    for (let row = centerRow - 1; row <= centerRow + 1; row++) {
        for (let col = centerCol - 1; col <= centerCol + 1; col++) {
            if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) continue;
            indices.push(row * GRID_SIZE + col);
        }
    }

    return indices;
}

function isRadarSelectable(index) {
    const cell = getEnemyCell(index);
    return !!cell && cell.classList.contains('miss') && !radarScannedCells.has(index);
}

function countRadarTargets(centerIndex) {
    return getRadarAreaIndices(centerIndex).filter(index => {
        if (index === centerIndex) return false;
        const cell = getEnemyCell(index);
        return enemyGrid[index] === 1 && cell && !cell.classList.contains('hit');
    }).length;
}

function updateRadarCellDisplay(centerIndex) {
    const cell = getEnemyCell(centerIndex);
    if (!cell || !cell.classList.contains('miss')) return;

    const count = countRadarTargets(centerIndex);
    cell.classList.add('radar-scanned');
    cell.dataset.radarCount = String(count);
    if (!cell.querySelector('.radar-count-static')) {
        cell.innerHTML = '<img src="close.png" class="miss-icon">';
    }
}

function refreshRadarScanDisplays() {
    radarScannedCells.forEach(index => {
        updateRadarCellDisplay(index);
        renderRadarScannedOverlay(index);
    });
}

function clearRadarPreview() {
    radarPreviewIndex = null;
    document.querySelectorAll('.radar-preview-overlay').forEach(el => el.remove());
}

function clearMissilePreview() {
    missilePreviewIndex = null;
    document.querySelectorAll('.explosion-preview-overlay').forEach(el => el.remove());
}

function clearNukeFlashEffects() {
    document.querySelectorAll('.nuke-flash-overlay').forEach(el => el.remove());
    document.body.classList.remove('screen-shake-nuke');
}

function clearRadarScannedOverlays() {
    document.querySelectorAll('.radar-scanned-overlay').forEach(el => el.remove());
}

function clearRadarEffects() {
    radarPreviewIndex = null;
    missilePreviewIndex = null;
    document.querySelectorAll('.radar-preview-overlay, .radar-scan-overlay, .explosion-preview-overlay, .missile-strike-overlay, .nuke-lock-overlay').forEach(el => el.remove());
    clearNukeFlashEffects();
}

function getRadarLinePosition(offsets, cellSize, lineIndex) {
    if (!Array.isArray(offsets) || offsets.length <= lineIndex) return -9999;
    const prev = offsets[lineIndex - 1];
    const current = offsets[lineIndex];
    const gap = current - prev - cellSize;
    return current - (gap / 2);
}

function buildRadarOverlay(centerIndex, className, includeCenter = true, getCell = getEnemyCell, gridId = 'enemy-grid') {
    const grid = document.getElementById(gridId);
    if (!grid) return null;

    const cells = getRadarAreaIndices(centerIndex).map(index => getCell(index)).filter(Boolean);
    if (cells.length === 0) return null;

    const left = Math.min(...cells.map(cell => cell.offsetLeft));
    const top = Math.min(...cells.map(cell => cell.offsetTop));
    const right = Math.max(...cells.map(cell => cell.offsetLeft + cell.offsetWidth));
    const bottom = Math.max(...cells.map(cell => cell.offsetTop + cell.offsetHeight));

    const overlay = document.createElement('div');
    overlay.className = className;
    overlay.style.left = `${left}px`;
    overlay.style.top = `${top}px`;
    overlay.style.width = `${right - left}px`;
    overlay.style.height = `${bottom - top}px`;
    overlay.dataset.centerIndex = String(centerIndex);

    const centerCell = getCell(centerIndex);
    if (centerCell) {
        const colOffsets = [...new Set(cells.map(cell => cell.offsetLeft - left))].sort((a, b) => a - b);
        const rowOffsets = [...new Set(cells.map(cell => cell.offsetTop - top))].sort((a, b) => a - b);
        const lineX1 = getRadarLinePosition(colOffsets, centerCell.offsetWidth, 1);
        const lineX2 = getRadarLinePosition(colOffsets, centerCell.offsetWidth, 2);
        const lineY1 = getRadarLinePosition(rowOffsets, centerCell.offsetHeight, 1);
        const lineY2 = getRadarLinePosition(rowOffsets, centerCell.offsetHeight, 2);

        overlay.style.setProperty('--radar-line-x1', `${lineX1}px`);
        overlay.style.setProperty('--radar-line-x2', `${lineX2}px`);
        overlay.style.setProperty('--radar-line-y1', `${lineY1}px`);
        overlay.style.setProperty('--radar-line-y2', `${lineY2}px`);

        if (includeCenter) {
            const reticle = document.createElement('div');
            reticle.className = 'radar-preview-center';
            reticle.style.left = `${centerCell.offsetLeft - left}px`;
            reticle.style.top = `${centerCell.offsetTop - top}px`;
            reticle.style.width = `${centerCell.offsetWidth}px`;
            reticle.style.height = `${centerCell.offsetHeight}px`;
            overlay.appendChild(reticle);
        }
    }

    return overlay;
}

function renderRadarPreview(centerIndex) {
    clearRadarPreview();

    if (!isRadarSelectable(centerIndex)) return;
    const grid = document.getElementById('enemy-grid');
    const overlay = buildRadarOverlay(centerIndex, 'radar-preview-overlay', true, getEnemyCell, 'enemy-grid');
    if (!grid || !overlay) return;

    grid.appendChild(overlay);
    radarPreviewIndex = centerIndex;
}

function renderRadarScannedOverlay(centerIndex, options = {}) {
    const {
        gridId = 'enemy-grid',
        scannedSet = radarScannedCells,
        getCell = getEnemyCell
    } = options;
    const grid = document.getElementById(gridId);
    if (!grid || !scannedSet.has(centerIndex)) return;

    const existing = grid.querySelector(`.radar-scanned-overlay[data-center-index="${centerIndex}"]`);
    if (existing) existing.remove();

    const overlay = buildRadarOverlay(centerIndex, 'radar-scanned-overlay', false, getCell, gridId);
    if (overlay) grid.appendChild(overlay);
}

function showRadarResultOnBoard(centerIndex, options = {}) {
    const {
        getCell = getEnemyCell,
        countTargets = countRadarTargets,
        resultDisplayDuration = RADAR_RESULT_DISPLAY_DURATION
    } = options;
    const cell = getCell(centerIndex);
    if (!cell || !cell.classList.contains('miss')) return;

    const count = String(countTargets(centerIndex));
    cell.classList.add('radar-scanned');
    cell.dataset.radarCount = count;
    cell.innerHTML = `<span class="radar-count-static">${count}</span>`;
    lastRadarResultShownAt = Date.now();

    setTimeout(() => {
        const latestCell = getCell(centerIndex);
        if (!latestCell || !latestCell.classList.contains('miss')) return;
        latestCell.classList.add('radar-scanned');
        latestCell.innerHTML = '<img src="close.png" class="miss-icon">';
    }, resultDisplayDuration);
}

function playRadarScanOnBoard(options) {
    const {
        gridId,
        centerIndex,
        getCell,
        countTargets,
        scannedSet,
        onScanComplete
    } = options;

    const grid = document.getElementById(gridId);
    if (!grid) return;

    const cells = getRadarAreaIndices(centerIndex).map(index => getCell(index)).filter(Boolean);
    const centerCell = getCell(centerIndex);
    if (!centerCell || cells.length === 0) return;

    const left = Math.min(...cells.map(cell => cell.offsetLeft));
    const top = Math.min(...cells.map(cell => cell.offsetTop));
    const right = Math.max(...cells.map(cell => cell.offsetLeft + cell.offsetWidth));
    const bottom = Math.max(...cells.map(cell => cell.offsetTop + cell.offsetHeight));

    const overlay = document.createElement('div');
    overlay.className = 'radar-scan-overlay';
    overlay.style.left = `${left}px`;
    overlay.style.top = `${top}px`;
    overlay.style.width = `${right - left}px`;
    overlay.style.height = `${bottom - top}px`;
    overlay.style.setProperty('--radar-origin-x', `${centerCell.offsetLeft - left + (centerCell.offsetWidth / 2)}px`);
    overlay.style.setProperty('--radar-origin-y', `${centerCell.offsetTop - top + (centerCell.offsetHeight / 2)}px`);

    const circle = document.createElement('div');
    circle.className = 'radar-scan-circle';

    const wavePrimary = document.createElement('div');
    wavePrimary.className = 'radar-scan-wave radar-scan-wave-primary';

    const waveSecondary = document.createElement('div');
    waveSecondary.className = 'radar-scan-wave radar-scan-wave-secondary';

    const sweep = document.createElement('div');
    sweep.className = 'radar-scan-sweep';

    circle.appendChild(wavePrimary);
    circle.appendChild(waveSecondary);
    circle.appendChild(sweep);
    overlay.appendChild(circle);
    grid.appendChild(overlay);

    setTimeout(() => {
        overlay.remove();
        scannedSet.add(centerIndex);
        renderRadarScannedOverlay(centerIndex, { gridId, scannedSet, getCell });
        const result = countTargets(centerIndex);
        showRadarResultOnBoard(centerIndex, { getCell, countTargets });
        if (typeof onScanComplete === 'function') onScanComplete(result);
    }, RADAR_SCAN_DURATION);
}

function setRadarEligibleCells(isEnabled) {
    document.querySelectorAll('#enemy-grid .cell').forEach(cell => {
        cell.classList.remove('radar-eligible');
        const index = parseInt(cell.dataset.index, 10);
        if (isEnabled && Number.isInteger(index) && isRadarSelectable(index)) {
            cell.classList.add('radar-eligible');
        }
    });
}

function getExplosionAreaIndices(topLeftIndex, size = 2) {
    const row = Math.floor(topLeftIndex / GRID_SIZE);
    const col = topLeftIndex % GRID_SIZE;
    if (row > GRID_SIZE - size || col > GRID_SIZE - size) return [];

    const indices = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            indices.push(topLeftIndex + (r * GRID_SIZE) + c);
        }
    }
    return indices;
}

function getExplosionAnchor(index, size = 2) {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const anchorRow = Math.max(0, Math.min(row, GRID_SIZE - size));
    const anchorCol = Math.max(0, Math.min(col, GRID_SIZE - size));
    return anchorRow * GRID_SIZE + anchorCol;
}

function isExplosionSelectable(index, size = 2) {
    const indices = getExplosionAreaIndices(getExplosionAnchor(index, size), size);
    return indices.length === size * size && indices.some(index => {
        const cell = getEnemyCell(index);
        return cell && !cell.classList.contains('revealed');
    });
}

function renderExplosionPreview(index, size = 2, variant = 'explosion') {
    clearMissilePreview();

    const grid = document.getElementById('enemy-grid');
    const topLeftIndex = getExplosionAnchor(index, size);
    const cells = getExplosionAreaIndices(topLeftIndex, size).map(index => getEnemyCell(index)).filter(Boolean);
    if (!grid || cells.length !== size * size) return;

    const left = Math.min(...cells.map(cell => cell.offsetLeft));
    const top = Math.min(...cells.map(cell => cell.offsetTop));
    const right = Math.max(...cells.map(cell => cell.offsetLeft + cell.offsetWidth));
    const bottom = Math.max(...cells.map(cell => cell.offsetTop + cell.offsetHeight));

    const overlay = document.createElement('div');
    overlay.className = variant === 'nuke'
        ? 'explosion-preview-overlay nuke-preview-overlay'
        : 'explosion-preview-overlay';
    overlay.style.left = `${left}px`;
    overlay.style.top = `${top}px`;
    overlay.style.width = `${right - left}px`;
    overlay.style.height = `${bottom - top}px`;

    const reticle = document.createElement('div');
    reticle.className = variant === 'nuke'
        ? 'explosion-preview-reticle nuke-preview-reticle'
        : 'explosion-preview-reticle';
    overlay.appendChild(reticle);

    if (variant === 'nuke') {
        const sigil = document.createElement('div');
        sigil.className = 'nuke-preview-sigil';
        overlay.appendChild(sigil);
    }

    ['top', 'right', 'bottom', 'left'].forEach(dir => {
        const arrow = document.createElement('div');
        arrow.className = `explosion-preview-arrow ${dir}`;
        overlay.appendChild(arrow);
    });

    grid.appendChild(overlay);
    missilePreviewIndex = topLeftIndex;
}

function isNukeSelectable(index) {
    return isExplosionSelectable(index, 4);
}

function renderNukePreview(index) {
    renderExplosionPreview(index, 4, 'nuke');
}

function setExplosionEligibleCells(isEnabled) {
    document.querySelectorAll('#enemy-grid .cell').forEach(cell => {
        cell.classList.remove('explosion-eligible');
    });
}

function clearActiveSkillState() {
    activeSkill = null;
    selectedSkill = null;
    radarLockedIndex = null;
    missileLockedIndex = null;
    clearRadarEffects();
    resetSkillSelectionUI();
    setRadarEligibleCells(false);
    setExplosionEligibleCells(false);
    document.querySelectorAll('.skill-diamond').forEach(d => d.classList.remove('skill-selected'));
}

function finishRadarMode() {
    clearActiveSkillState();
    setInstructionPanel(DEFAULT_INSTRUCTION.name, DEFAULT_INSTRUCTION.desc, DEFAULT_INSTRUCTION.icon);
}

function finishPlayerSkillMode() {
    clearActiveSkillState();
    setInstructionPanel(DEFAULT_INSTRUCTION.name, DEFAULT_INSTRUCTION.desc, DEFAULT_INSTRUCTION.icon);
    if (currentPhase === 'PLAYER_TURN') {
        startTurnSelectionTimer(false);
    }
}

function playMissileStrikeAnimation(boardId, topLeftIndex, lockOverlay, onComplete) {
    const grid = document.getElementById(boardId);
    const cells = getExplosionAreaIndices(topLeftIndex).map(index => grid ? grid.children[index] : null).filter(Boolean);
    if (!grid || cells.length !== 4) {
        if (onComplete) onComplete();
        return;
    }

    const left = Math.min(...cells.map(cell => cell.offsetLeft));
    const top = Math.min(...cells.map(cell => cell.offsetTop));
    const right = Math.max(...cells.map(cell => cell.offsetLeft + cell.offsetWidth));
    const bottom = Math.max(...cells.map(cell => cell.offsetTop + cell.offsetHeight));
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    const gridRect = grid.getBoundingClientRect();
    const missileHeight = 73;
    const impactTop = centerY - missileHeight;
    const startTop = -(gridRect.top + missileHeight + 12);
    const travelDistance = Math.abs(impactTop - startTop);
    const flightDuration = Math.max(620, Math.round(travelDistance / 1.2));
    const totalDuration = flightDuration + Math.max(MISSILE_EXPLOSION_DURATION, EFFEKSEER_EFFECTS.missileImpact.duration);

    const overlay = document.createElement('div');
    overlay.className = 'missile-strike-overlay';

    const missile = document.createElement('div');
    missile.className = 'missile-sprite';
    missile.style.left = `${centerX}px`;
    missile.style.setProperty('--missile-start-top', `${startTop}px`);
    missile.style.setProperty('--missile-impact-top', `${impactTop}px`);
    missile.style.setProperty('--missile-flight-duration', `${flightDuration}ms`);

    overlay.appendChild(missile);
    grid.appendChild(overlay);

    setTimeout(() => {
        const impactX = gridRect.left + centerX;
        const impactY = gridRect.top + centerY;

        if (lockOverlay) lockOverlay.remove();
        missile.remove();
        playSound('destroy-sfx');
        playEffekseerEffect('missileImpact', impactX, impactY);
    }, flightDuration);

    setTimeout(() => {
        overlay.remove();
        if (onComplete) onComplete();
    }, totalDuration);
}

function createMissileLockOverlay(boardId, topLeftIndex) {
    const grid = document.getElementById(boardId);
    const cells = getExplosionAreaIndices(topLeftIndex, 2).map(index => grid ? grid.children[index] : null).filter(Boolean);
    if (!grid || cells.length !== 4) return null;

    const left = Math.min(...cells.map(cell => cell.offsetLeft));
    const top = Math.min(...cells.map(cell => cell.offsetTop));
    const right = Math.max(...cells.map(cell => cell.offsetLeft + cell.offsetWidth));
    const bottom = Math.max(...cells.map(cell => cell.offsetTop + cell.offsetHeight));
    const width = right - left;
    const height = bottom - top;

    const overlay = document.createElement('div');
    overlay.className = 'nuke-lock-overlay missile-lock-overlay';
    overlay.style.left = `${left}px`;
    overlay.style.top = `${top}px`;
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;

    [1.75, 1.38, 1.12].forEach((scale, index) => {
        const frame = document.createElement('div');
        frame.className = `nuke-lock-frame ${index === 2 ? 'final' : 'zooming'}`;
        frame.style.setProperty('--nuke-lock-scale', scale);
        overlay.appendChild(frame);
    });

    for (let i = 0; i < 3; i++) {
        const pulse = document.createElement('div');
        pulse.className = 'nuke-lock-square-pulse';
        pulse.style.setProperty('--nuke-square-delay', `${i * 0.16}s`);
        overlay.appendChild(pulse);
    }

    grid.appendChild(overlay);
    return overlay;
}

function triggerNukeWhiteout(screenX, screenY) {
    clearNukeFlashEffects();

    const flash = document.createElement('div');
    flash.className = 'nuke-flash-overlay';
    flash.style.setProperty('--nuke-flash-x', `${screenX}px`);
    flash.style.setProperty('--nuke-flash-y', `${screenY}px`);

    const bloom = document.createElement('div');
    bloom.className = 'nuke-flash-bloom';
    flash.appendChild(bloom);
    document.body.appendChild(flash);

    setTimeout(() => {
        flash.remove();
    }, NUKE_WHITEOUT_HOLD + NUKE_WHITEOUT_FADE + 120);
}

function createNukeLockOverlay(boardId, topLeftIndex) {
    const grid = document.getElementById(boardId);
    const cells = getExplosionAreaIndices(topLeftIndex, 4).map(index => grid ? grid.children[index] : null).filter(Boolean);
    if (!grid || cells.length !== 16) return null;

    const left = Math.min(...cells.map(cell => cell.offsetLeft));
    const top = Math.min(...cells.map(cell => cell.offsetTop));
    const right = Math.max(...cells.map(cell => cell.offsetLeft + cell.offsetWidth));
    const bottom = Math.max(...cells.map(cell => cell.offsetTop + cell.offsetHeight));
    const width = right - left;
    const height = bottom - top;

    const overlay = document.createElement('div');
    overlay.className = 'nuke-lock-overlay';
    overlay.style.left = `${left}px`;
    overlay.style.top = `${top}px`;
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;

    [1.95, 1.55, 1.18].forEach((scale, index) => {
        const frame = document.createElement('div');
        frame.className = `nuke-lock-frame ${index === 2 ? 'final' : 'zooming'}`;
        frame.style.setProperty('--nuke-lock-scale', scale);

        if (index === 2) {
            ['tl', 'tr', 'br', 'bl'].forEach(corner => {
                const cornerEl = document.createElement('div');
                cornerEl.className = `nuke-lock-corner ${corner}`;
                frame.appendChild(cornerEl);
            });
        }

        overlay.appendChild(frame);
    });

    for (let i = 0; i < 4; i++) {
        const pulse = document.createElement('div');
        pulse.className = 'nuke-lock-square-pulse';
        pulse.style.setProperty('--nuke-square-delay', `${i * 0.18}s`);
        overlay.appendChild(pulse);
    }

    grid.appendChild(overlay);
    return overlay;
}

function animateSpriteSheet(element, columns, rows, totalFrames, duration, onComplete) {
    if (!element) {
        if (onComplete) onComplete();
        return;
    }

    const frameDuration = duration / totalFrames;
    let frame = 0;

    const renderFrame = () => {
        const col = frame % columns;
        const row = Math.floor(frame / columns);
        const x = columns > 1 ? (col / (columns - 1)) * 100 : 0;
        const y = rows > 1 ? (row / (rows - 1)) * 100 : 0;
        element.style.backgroundPosition = `${x}% ${y}%`;
    };

    renderFrame();

    const timer = setInterval(() => {
        frame++;
        if (frame >= totalFrames) {
            clearInterval(timer);
            if (onComplete) onComplete();
            return;
        }
        renderFrame();
    }, frameDuration);
}

function animateImageSequence(element, frames, frameDuration) {
    if (!element || !Array.isArray(frames) || frames.length === 0) return null;

    let frameIndex = 0;
    element.style.backgroundImage = `url('${frames[0]}')`;

    return setInterval(() => {
        frameIndex = (frameIndex + 1) % frames.length;
        element.style.backgroundImage = `url('${frames[frameIndex]}')`;
    }, frameDuration);
}

const effekseerEffectState = {
    canvas: null,
    gl: null,
    context: null,
    runtimePromise: null,
    effects: new Map(),
    activeHandles: [],
    animationFrameId: null,
    lastFrameTime: 0,
    pixelRatio: 1
};

function ensureEffekseerCanvas() {
    if (effekseerEffectState.canvas) return effekseerEffectState.canvas;

    const canvas = document.createElement('canvas');
    canvas.className = 'effekseer-effects-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    effekseerEffectState.canvas = canvas;
    resizeEffekseerCanvas();
    window.addEventListener('resize', resizeEffekseerCanvas);
    window.addEventListener('orientationchange', resizeEffekseerCanvas);
    return canvas;
}

function resizeEffekseerCanvas() {
    const canvas = effekseerEffectState.canvas;
    if (!canvas) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(window.innerWidth * pixelRatio));
    const height = Math.max(1, Math.round(window.innerHeight * pixelRatio));

    effekseerEffectState.pixelRatio = pixelRatio;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        if (effekseerEffectState.gl) {
            effekseerEffectState.gl.viewport(0, 0, width, height);
        }
    }

    if (effekseerEffectState.context) {
        setEffekseerScreenMatrices();
    }
}

function setEffekseerScreenMatrices(viewportSize) {
    const canvas = effekseerEffectState.canvas;
    const context = effekseerEffectState.context;
    if (!canvas || !context) return;

    const projectionSize = viewportSize || Math.max(canvas.width, canvas.height, 1);
    const depthScale = -(projectionSize / Math.max(canvas.height, 1));
    context.setProjectionMatrix([
        1, 0, 0, 0,
        0, -1, 0, 0,
        0, 0, 1, depthScale,
        0, 0, 0, 1
    ]);
    context.setCameraMatrix([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, -10, 1
    ]);
}

function initEffekseerRuntime() {
    if (effekseerEffectState.runtimePromise) return effekseerEffectState.runtimePromise;

    effekseerEffectState.runtimePromise = new Promise((resolve, reject) => {
        if (!window.effekseer || typeof window.effekseer.initRuntime !== 'function') {
            reject(new Error(`Effekseer runtime script not loaded: ${EFFEKSEER_RUNTIME_SCRIPT_PATH}`));
            return;
        }

        window.effekseer.initRuntime(EFFEKSEER_RUNTIME_WASM_PATH, () => {
            try {
                const canvas = ensureEffekseerCanvas();
                const gl = canvas.getContext('webgl', {
                    alpha: true,
                    antialias: true,
                    premultipliedAlpha: true,
                    preserveDrawingBuffer: false
                });

                if (!gl) {
                    throw new Error('WebGL is unavailable for Effekseer');
                }

                const context = window.effekseer.createContext();
                if (!context) {
                    throw new Error('Effekseer context creation failed');
                }

                context.init(gl, {
                    instanceMaxCount: 4096,
                    squareMaxCount: 4096
                });
                context.setRestorationOfStatesFlag(false);

                effekseerEffectState.gl = gl;
                effekseerEffectState.context = context;
                resizeEffekseerCanvas();
                resolve(context);
            } catch (error) {
                reject(error);
            }
        }, reject);
    }).catch(error => {
        console.warn('[Effekseer] Runtime initialization failed:', error);
        effekseerEffectState.runtimePromise = null;
        throw error;
    });

    return effekseerEffectState.runtimePromise;
}

async function loadEffekseerEffect(effectKey) {
    const config = EFFEKSEER_EFFECTS[effectKey];
    if (!config) throw new Error(`Unknown Effekseer effect: ${effectKey}`);

    const cached = effekseerEffectState.effects.get(effectKey);
    if (cached) return cached;

    const context = await initEffekseerRuntime();
    const effectPromise = new Promise((resolve, reject) => {
        const effect = context.loadEffect(config.path, config.loadScale || 1, () => {
            resolve(effect);
        }, reject);
    });

    effekseerEffectState.effects.set(effectKey, effectPromise);
    return effectPromise;
}

function preloadEffekseerEffect(effectKey) {
    loadEffekseerEffect(effectKey).catch(error => {
        console.warn(`[Effekseer] Failed to preload ${effectKey}:`, error);
    });
}

function playEffekseerEffect(effectKey, screenX, screenY, options = {}) {
    const config = EFFEKSEER_EFFECTS[effectKey];
    if (!config) return Promise.resolve(null);

    return loadEffekseerEffect(effectKey).then(effect => {
        const context = effekseerEffectState.context;
        if (!context || !effect) return null;

        const handle = context.play(effect);
        if (!handle) return null;

        const playScale = options.scale || config.playScale || 1;
        handle.setScale(playScale, playScale, playScale);
        handle.setSpeed(options.speed || config.speed || 1);
        handle.setLocation(0, 0, 0);

        effekseerEffectState.activeHandles.push({
            handle,
            screenX,
            screenY,
            viewportSize: options.viewportSize || config.viewportSize || 4096
        });
        startEffekseerRenderLoop();

        window.setTimeout(() => {
            if (handle.exists) handle.stopRoot();
        }, options.duration || config.duration || 1600);

        return handle;
    }).catch(error => {
        console.warn(`[Effekseer] Failed to play ${effectKey}:`, error);
        return null;
    });
}

function startEffekseerRenderLoop() {
    if (effekseerEffectState.animationFrameId) return;

    effekseerEffectState.lastFrameTime = performance.now();
    const render = now => {
        const context = effekseerEffectState.context;
        const gl = effekseerEffectState.gl;
        const canvas = effekseerEffectState.canvas;

        if (!context || !gl || !canvas) {
            effekseerEffectState.animationFrameId = null;
            return;
        }

        const elapsedMs = Math.min(64, now - effekseerEffectState.lastFrameTime);
        effekseerEffectState.lastFrameTime = now;
        const deltaFrames = Math.max(1, Math.round(elapsedMs / (1000 / 60)));

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        context.update(deltaFrames);
        effekseerEffectState.activeHandles = effekseerEffectState.activeHandles.filter(entry => {
            const handle = entry && entry.handle;
            if (!handle || !handle.exists) return false;
            const viewportSize = entry.viewportSize || 4096;
            const x = Math.round((entry.screenX || 0) * effekseerEffectState.pixelRatio);
            const y = Math.round((entry.screenY || 0) * effekseerEffectState.pixelRatio);
            gl.viewport(
                x - Math.round(viewportSize / 2),
                canvas.height - y - Math.round(viewportSize / 2),
                viewportSize,
                viewportSize
            );
            setEffekseerScreenMatrices(viewportSize);
            context.beginDraw();
            context.drawHandle(handle);
            context.endDraw();
            return true;
        });

        if (effekseerEffectState.activeHandles.length > 0) {
            effekseerEffectState.animationFrameId = requestAnimationFrame(render);
        } else {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            effekseerEffectState.animationFrameId = null;
        }
    };

    effekseerEffectState.animationFrameId = requestAnimationFrame(render);
}

function playNukeStrikeAnimation(boardId, topLeftIndex, lockOverlay, onImpact, onComplete) {
    const grid = document.getElementById(boardId);
    const cells = getExplosionAreaIndices(topLeftIndex, 4).map(index => grid ? grid.children[index] : null).filter(Boolean);
    if (!grid || cells.length !== 16) {
        if (onImpact) onImpact();
        if (onComplete) onComplete();
        return;
    }

    const left = Math.min(...cells.map(cell => cell.offsetLeft));
    const top = Math.min(...cells.map(cell => cell.offsetTop));
    const right = Math.max(...cells.map(cell => cell.offsetLeft + cell.offsetWidth));
    const bottom = Math.max(...cells.map(cell => cell.offsetTop + cell.offsetHeight));
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    const impactWidth = (right - left) + 28;
    const impactHeight = (bottom - top) + 28;
    const gridRect = grid.getBoundingClientRect();
    const cellWidth = cells[0].offsetWidth || 35;
    const nukeWidth = Math.max(22, Math.round(cellWidth * 0.7));
    const nukeHeight = Math.round(nukeWidth * (308 / 68));
    const impactTop = centerY - nukeHeight;
    const startTop = -(gridRect.top + nukeHeight + 24);
    const travelDistance = Math.abs(impactTop - startTop);
    const flightDuration = Math.max(900, Math.round(travelDistance / 0.95));
    const fadeStart = flightDuration + NUKE_WHITEOUT_HOLD;
    const effekseerDuration = EFFEKSEER_EFFECTS.vanguardsNuke.duration;
    const totalDuration = fadeStart + Math.max(NUKE_SHAKE_DURATION, NUKE_WHITEOUT_FADE, effekseerDuration);

    const overlay = document.createElement('div');
    overlay.className = 'missile-strike-overlay';

    const missile = document.createElement('div');
    missile.className = 'nuke-sprite';
    missile.style.left = `${centerX}px`;
    missile.style.width = `${nukeWidth}px`;
    missile.style.height = `${nukeHeight}px`;
    missile.style.setProperty('--missile-start-top', `${startTop}px`);
    missile.style.setProperty('--missile-impact-top', `${impactTop}px`);
    missile.style.setProperty('--missile-flight-duration', `${flightDuration}ms`);

    overlay.appendChild(missile);
    grid.appendChild(overlay);
    const nukeFrameTimer = animateImageSequence(missile, ['nuke_1.png', 'nuke_2.png'], 180);

    setTimeout(() => {
        const impactX = gridRect.left + centerX;
        const impactY = gridRect.top + centerY;

        if (nukeFrameTimer) clearInterval(nukeFrameTimer);
        if (lockOverlay) lockOverlay.remove();
        missile.remove();
        triggerNukeWhiteout(impactX, impactY);

        setTimeout(() => {
            document.body.classList.remove('screen-shake-nuke');
            void document.body.offsetWidth;
            document.body.classList.add('screen-shake-nuke');
            setTimeout(() => document.body.classList.remove('screen-shake-nuke'), NUKE_SHAKE_DURATION);

            playSound('destroy-sfx');
            playEffekseerEffect('vanguardsNuke', impactX, impactY);
            if (onImpact) onImpact();
        }, NUKE_WHITEOUT_HOLD);
    }, flightDuration);

    setTimeout(() => {
        if (nukeFrameTimer) clearInterval(nukeFrameTimer);
        overlay.remove();
        clearNukeFlashEffects();
        if (onComplete) onComplete();
    }, totalDuration);
}

function applyExplosionDamageToEnemy(indices) {
    let isGameOver = false;
    const hitIndices = [];

    indices.forEach(index => {
        const cell = getEnemyCell(index);
        if (!cell || cell.classList.contains('revealed')) return;

        cell.classList.add('revealed');

        if (enemyGrid[index] === 1) {
            cell.classList.add('hit');
            enemyDamage++;
            hitIndices.push(index);
        } else {
            cell.classList.add('miss');
            cell.innerHTML = '<img src="close.png" class="miss-icon">';
        }
    });

    if (hitIndices.length > 0) {
        [...new Set(hitIndices)].forEach(index => checkEnemyShipDestruction(index));
        if (checkGameOver()) isGameOver = true;
    }

    refreshRadarScanDisplays();
    return isGameOver;
}

function applyExplosionDamageToPlayer(indices) {
    const grid = document.getElementById('player-grid');
    const hitIndices = [];

    indices.forEach(index => {
        const cell = grid ? grid.children[index] : null;
        if (!cell || cell.classList.contains('revealed')) return;

        cell.classList.add('revealed');

        if (myGrid[index] === 1) {
            cell.classList.add('hit');
            myDamage++;
            hitIndices.push(index);

            if (selectedRace === 'AURELIANS' && typeof addEnergy === 'function') {
                addEnergy(2, 'Ship Hit');
            }
        } else {
            cell.classList.add('miss');
            cell.innerHTML = '<img src="close.png" class="miss-icon">';
        }
    });

    renderBattleMinimap('ENEMY');

    if (hitIndices.length > 0) {
        let destroyedAny = false;
        [...new Set(hitIndices)].forEach(index => {
            if (checkMyShipDestruction(index)) destroyedAny = true;
        });

        if (destroyedAny) {
            playSound('unit-lost-sfx');
            document.body.classList.add('screen-shake-sunk');
            setTimeout(() => document.body.classList.remove('screen-shake-sunk'), 800);
        } else {
            playUnderAttackAlert();
            document.body.classList.add('screen-shake-hit');
            setTimeout(() => document.body.classList.remove('screen-shake-hit'), 400);
        }

        if (checkGameOver()) return true;
    }

    return false;
}

function executeExplosionStrike(topLeftIndex) {
    const indices = getExplosionAreaIndices(topLeftIndex);
    if (indices.length !== 4) return;

    stopTurnSelectionTimer();
    const timerContainer = document.getElementById('turn-timer-container');
    if (timerContainer) timerContainer.style.visibility = 'hidden';

    clearMissilePreview();
    radarLockedIndex = null;
    missileLockedIndex = null;
    resetSkillSelectionUI();
    document.querySelectorAll('.skill-diamond').forEach(d => d.classList.remove('skill-selected'));
    setRadarEligibleCells(false);
    setExplosionEligibleCells(false);
    activeSkill = 'explosion';
    setInstructionPanel('MISSILE', 'MISSILE INBOUND', 'explosion.png');

    if (gameMode === 'PVP') {
        const { ref, update } = window.firebaseModules;
        update(ref(db, 'rooms/' + currentRoomId), {
            lastMove: { attacker: playerRole, type: 'explosion', indices, anchor: topLeftIndex, timestamp: Date.now() }
        });
    }

    const lockOverlay = createMissileLockOverlay('enemy-grid', topLeftIndex);

    setTimeout(() => {
        playSound('missile-flying-sfx');
        playMissileStrikeAnimation('enemy-grid', topLeftIndex, lockOverlay, () => {
            const isGameOver = applyExplosionDamageToEnemy(indices);
            finishPlayerSkillMode();

            if (!isGameOver) {
                document.getElementById('game-status').innerHTML = `PHASE: <span style="color:var(--success)">YOUR TURN</span>`;
            }
        });
    }, MISSILE_LOCK_ON_DURATION);
}

function executeNukeStrike(topLeftIndex) {
    const indices = getExplosionAreaIndices(topLeftIndex, 4);
    if (indices.length !== 16) return;

    stopTurnSelectionTimer();
    const timerContainer = document.getElementById('turn-timer-container');
    if (timerContainer) timerContainer.style.visibility = 'hidden';

    clearMissilePreview();
    radarLockedIndex = null;
    missileLockedIndex = null;
    resetSkillSelectionUI();
    document.querySelectorAll('.skill-diamond').forEach(d => d.classList.remove('skill-selected'));
    setRadarEligibleCells(false);
    setExplosionEligibleCells(false);
    activeSkill = 'nuke';
    setInstructionPanel('NUKE', 'NUCLEAR PAYLOAD INBOUND', 'nuclear_bomb.png');

    if (gameMode === 'PVP') {
        const { ref, update } = window.firebaseModules;
        update(ref(db, 'rooms/' + currentRoomId), {
            lastMove: { attacker: playerRole, type: 'nuke', indices, anchor: topLeftIndex, timestamp: Date.now() }
        });
    }

    let isGameOver = false;
    const lockOverlay = createNukeLockOverlay('enemy-grid', topLeftIndex);

    setTimeout(() => {
        playSound('missile-flying-sfx');
        playNukeStrikeAnimation('enemy-grid', topLeftIndex, lockOverlay, () => {
            isGameOver = applyExplosionDamageToEnemy(indices);
        }, () => {
            finishPlayerSkillMode();

            if (!isGameOver) {
                document.getElementById('game-status').innerHTML = `PHASE: <span style="color:var(--success)">YOUR TURN</span>`;
            }
        });
    }, NUKE_LOCK_ON_DURATION);
}

function lockRadarTarget(index) {
    radarLockedIndex = index;
    renderRadarPreview(index);
    setInstructionPanel('RADAR', 'TARGET LOCKED. PRESS TICK TO SCAN', 'radar.png');
}

function showRadarResult(centerIndex) {
    showRadarResultOnBoard(centerIndex, {
        getCell: getEnemyCell,
        countTargets: countRadarTargets
    });
}

function executeRadarScan(centerIndex) {
    const grid = document.getElementById('enemy-grid');
    if (!grid || !isRadarSelectable(centerIndex)) return;

    stopTurnSelectionTimer();
    clearRadarPreview();
    radarLockedIndex = null;
    resetSkillSelectionUI();
    document.querySelectorAll('.skill-diamond').forEach(d => d.classList.remove('skill-selected'));
    setRadarEligibleCells(false);
    activeSkill = 'radar';
    setInstructionPanel('RADAR', 'SCANNING TARGET AREA', 'radar.png');

    if (gameMode === 'PVP') {
        const { ref, update } = window.firebaseModules;
        update(ref(db, 'rooms/' + currentRoomId), {
            lastMove: { attacker: playerRole, type: 'radar', centerIndex, timestamp: Date.now() }
        });
    }

    playRadarScanOnBoard({
        gridId: 'enemy-grid',
        centerIndex,
        getCell: getEnemyCell,
        countTargets: countRadarTargets,
        scannedSet: radarScannedCells,
        onScanComplete: () => {
        finishRadarMode();
        if (currentPhase === 'PLAYER_TURN') {
            if (turnTimeLeft <= 0.15) {
                stopTurnSelectionTimer();
                setGameTimeout(() => handleTurnTimeout(true), RADAR_RESULT_DISPLAY_DURATION);
            } else {
                startTurnSelectionTimer(false);
            }
        }
        }
    });
}

function onEnemyGridHover(event) {
    if (currentPhase !== 'PLAYER_TURN') return;
    if (selectedSkill !== 'radar' && selectedSkill !== 'explosion' && selectedSkill !== 'nuke') return;
    if (selectedSkill === 'radar' && radarLockedIndex !== null) return;
    if ((selectedSkill === 'explosion' || selectedSkill === 'nuke') && missileLockedIndex !== null) return;

    const cell = event.target.closest('.cell');
    const grid = document.getElementById('enemy-grid');
    if (!cell || !grid || !grid.contains(cell)) {
        clearRadarPreview();
        clearMissilePreview();
        return;
    }

    const index = parseInt(cell.dataset.index, 10);
    if (!Number.isInteger(index)) {
        clearRadarPreview();
        clearMissilePreview();
        return;
    }

    if (selectedSkill === 'radar') {
        if (!isRadarSelectable(index)) {
            clearRadarPreview();
            return;
        }
        if (radarPreviewIndex !== index) {
            renderRadarPreview(index);
        }
        return;
    }

    if (selectedSkill === 'nuke') {
        if (!isNukeSelectable(index)) {
            clearMissilePreview();
            return;
        }

        const anchorIndex = getExplosionAnchor(index, 4);
        if (missilePreviewIndex !== anchorIndex) {
            renderNukePreview(anchorIndex);
        }
        return;
    }

    if (!isExplosionSelectable(index)) {
        clearMissilePreview();
        return;
    }

    const anchorIndex = getExplosionAnchor(index);
    if (missilePreviewIndex !== anchorIndex) {
        renderExplosionPreview(anchorIndex);
    }
}

function onEnemyGridLeave() {
    if (radarLockedIndex !== null || missileLockedIndex !== null) return;
    clearRadarPreview();
    clearMissilePreview();
}

function isSpeakingLaunchModalBlockingInteraction() {
    const modal = document.getElementById('launch-modal');
    return currentPracticeMode === 'SPEAKING' && modal && modal.style.display === 'flex';
}

function isBattleInteractionLocked() {
    return attackResolutionLocked || isSpeakingLaunchModalBlockingInteraction();
}

// ���� playerEnergy ����ÿ�����܆� available/disabled ��B
function updateSkillStates() {
    document.querySelectorAll('.skill-diamond').forEach(diamond => {
        const cost = parseInt(diamond.dataset.cost) || 0;
        if (playerEnergy >= cost) {
            diamond.classList.add('skill-available');
            diamond.classList.remove('skill-disabled');
        } else {
            diamond.classList.remove('skill-available');
            diamond.classList.add('skill-disabled');
        }
    });
    // Energy icon ͬ��
    const energyIcon = document.querySelector('.skill-energy-icon');
    if (energyIcon) {
        const anyAvailable = document.querySelector('.skill-diamond.skill-available');
        energyIcon.classList.toggle('energy-disabled', !anyAvailable);
    }
}

// �弼�� diamond
function onSkillClick(e) {
    if (isBattleInteractionLocked()) return;

    const diamond = e.currentTarget;
    if (diamond.classList.contains('skill-disabled')) return;
    if (currentPhase !== 'PLAYER_TURN') return;
    if (activeSkill) return;

    const skill = diamond.dataset.skill;
    const cost = parseInt(diamond.dataset.cost) || 0;

    // ����ѽ��x�oͬһ�� �� ȡ��
    if (selectedSkill === skill) {
        cancelSkillSelection();
        return;
    }

    // �x���¼���
    selectedSkill = skill;
    document.querySelectorAll('.skill-diamond').forEach(d => d.classList.remove('skill-selected'));
    diamond.classList.add('skill-selected');
    playSound(skill === 'nuke' ? 'nuke-ready-sfx' : 'skill-select-sfx');

    // �@ʾ cost + �_�J/ȡ��
    const costVal = document.getElementById('skill-cost-val');
    const confirmBtns = document.getElementById('skill-confirm-btns');
    const costRow = costVal ? costVal.parentElement : null;
    if (costVal) {
        costVal.textContent = cost;
        costVal.style.display = 'inline';
        if (costRow) costRow.classList.toggle('cost-double-digit', String(cost).length >= 2);
    }
    if (confirmBtns) confirmBtns.style.display = 'flex';

    // ���� instruction panel
    const info = getSkillInfo(skill);
    if (info) {
        setInstructionPanel(info.name, info.desc, info.icon);
    }

    if (skill === 'radar') {
        radarLockedIndex = null;
        missileLockedIndex = null;
        clearMissilePreview();
        setRadarEligibleCells(true);
        setExplosionEligibleCells(false);
        const radarInfo = getSkillInfo('radar');
        setInstructionPanel(radarInfo.name, 'SELECT A MISSED CELL TO SCAN', radarInfo.icon);
    } else if (skill === 'explosion') {
        missileLockedIndex = null;
        radarLockedIndex = null;
        clearRadarPreview();
        setRadarEligibleCells(false);
        setExplosionEligibleCells(true);
        const explosionInfo = getSkillInfo('explosion');
        setInstructionPanel(explosionInfo.name, 'SELECT A 2X2 TARGET AREA', explosionInfo.icon);
    } else if (skill === 'nuke') {
        missileLockedIndex = null;
        radarLockedIndex = null;
        clearRadarPreview();
        setRadarEligibleCells(false);
        setExplosionEligibleCells(true);
        const nukeInfo = getSkillInfo('nuke');
        setInstructionPanel(nukeInfo.name, 'SELECT A 4X4 TARGET AREA', nukeInfo.icon);
    } else {
        clearRadarPreview();
        clearMissilePreview();
        setRadarEligibleCells(false);
        setExplosionEligibleCells(false);
    }
}

function cancelSkillSelection() {
    selectedSkill = null;
    radarLockedIndex = null;
    missileLockedIndex = null;
    document.querySelectorAll('.skill-diamond').forEach(d => d.classList.remove('skill-selected'));
    resetSkillSelectionUI();
    clearRadarPreview();
    clearMissilePreview();
    setRadarEligibleCells(false);
    setExplosionEligibleCells(false);

    // ߀ԭ instruction panel
    setInstructionPanel(DEFAULT_INSTRUCTION.name, DEFAULT_INSTRUCTION.desc, DEFAULT_INSTRUCTION.icon);
}

function confirmSkillSelection() {
    if (!selectedSkill) return;
    const diamond = document.querySelector(`.skill-diamond[data-skill="${selectedSkill}"]`);
    if (!diamond) return;
    const cost = parseInt(diamond.dataset.cost) || 0;

    if (playerEnergy < cost) {
        cancelSkillSelection();
        return;
    }

    if (selectedSkill === 'radar') {
        if (radarLockedIndex === null || !isRadarSelectable(radarLockedIndex)) {
            playSound('wrong-sfx');
            setInstructionPanel('RADAR', 'SELECT A MISSED CELL FIRST', 'radar.png');
            return;
        }
        playSound('radar-sfx');
        addEnergy(-cost, selectedSkill.toUpperCase());
        executeRadarScan(radarLockedIndex);
        updateSkillStates();
        return;
    }

    if (selectedSkill === 'explosion') {
        if (missileLockedIndex === null || !isExplosionSelectable(missileLockedIndex)) {
            playSound('wrong-sfx');
            setInstructionPanel('MISSILE', 'SELECT A 2X2 TARGET AREA FIRST', 'explosion.png');
            return;
        }
        addEnergy(-cost, selectedSkill.toUpperCase());
        executeExplosionStrike(missileLockedIndex);
        updateSkillStates();
        return;
    }

    if (selectedSkill === 'nuke') {
        if (missileLockedIndex === null || !isNukeSelectable(missileLockedIndex)) {
            playSound('wrong-sfx');
            setInstructionPanel('NUKE', 'SELECT A 4X4 TARGET AREA FIRST', 'nuclear_bomb.png');
            return;
        }
        playSound('nuke-launch-sfx');
        addEnergy(-cost, selectedSkill.toUpperCase());
        executeNukeStrike(missileLockedIndex);
        updateSkillStates();
        return;
    }

    // �� energy
    addEnergy(-cost, selectedSkill.toUpperCase());

    console.log(`�� SKILL ACTIVATED: ${selectedSkill} (cost: ${cost})`);
    cancelSkillSelection();
    updateSkillStates();
}

// �����¼�
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.skill-diamond').forEach(diamond => {
        diamond.addEventListener('click', onSkillClick);
    });
    const cancelBtn = document.getElementById('skill-cancel');
    const confirmBtn = document.getElementById('skill-confirm');
    const enemyGridEl = document.getElementById('enemy-grid');
    if (cancelBtn) cancelBtn.addEventListener('click', cancelSkillSelection);
    if (confirmBtn) confirmBtn.addEventListener('click', confirmSkillSelection);
    if (enemyGridEl) {
        enemyGridEl.addEventListener('mousemove', onEnemyGridHover);
        enemyGridEl.addEventListener('mouseleave', onEnemyGridLeave);
    }
});


