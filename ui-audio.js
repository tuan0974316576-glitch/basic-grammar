let bgmFadeInterval = null;
const bgmDuckReasons = new Set();

const alertSfx = new Audio('your-fleet-is-under-attack.mp3');
alertSfx.volume = 1.0;

let lastAlertTime = 0;

let gameVolume = {
    bgm: 0.5,
    sfx: 0.5,
    voice: 1.0
};

const IOS_AUDIO_DEVICE = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const SFX_POOL_SIZE = IOS_AUDIO_DEVICE ? 2 : 1;
const sfxAudioPools = new Map();
const sfxBufferPromises = new Map();
const sfxAudioBuffers = new Map();
let gameAudioUnlocked = false;
let sfxAudioContext = null;

const POOLED_SFX_IDS = [
    'deploy-sfx',
    'enter-sfx',
    'enter-number-sfx',
    'delete-sfx',
    'wrong-sfx',
    'laser-sfx',
    'hit-sfx',
    'timeout-sfx',
    'open-room-sfx',
    'destroy-sfx',
    'level-select-sfx',
    'speaking-open-sfx',
    'speaking-green-sfx',
    'speaking-wrong-sfx',
    'skill-select-sfx',
    'radar-sfx',
    'aurelians-shield-sfx',
    'aurelians-shield-break-sfx',
    'missile-flying-sfx',
    'nuke-ready-sfx',
    'nuke-launch-sfx',
    'nuke-detected-sfx',
    'victory-sfx',
    'lose-sfx',
    'new-commander-sfx',
    'ship-voice-0',
    'ship-voice-1',
    'ship-voice-2',
    'ship-voice-3',
    'ship-voice-4',
    'unit-lost-sfx'
];

function normalizeVolume(value, fallback) {
    const parsed = parseFloat(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(0, Math.min(1, parsed));
}

function prepareAudioElementForIos(audio) {
    if (!audio) return;
    audio.preload = 'auto';
    audio.playsInline = true;
    audio.setAttribute('playsinline', '');
    try {
        audio.load();
    } catch (_error) {}
}

function getSfxAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sfxAudioContext) {
        sfxAudioContext = new AudioContextClass();
    }
    return sfxAudioContext;
}

function getAudioElementSource(id) {
    const audio = document.getElementById(id);
    if (!audio) return '';
    const source = audio.currentSrc
        || audio.src
        || audio.querySelector('source')?.src
        || audio.querySelector('source')?.getAttribute('src')
        || '';
    return source;
}

async function unlockSfxAudioContext() {
    const context = getSfxAudioContext();
    if (!context) return false;

    if (context.state === 'suspended') {
        await context.resume();
    }

    const buffer = context.createBuffer(1, 1, context.sampleRate || 22050);
    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = 0;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(context.destination);
    source.start(0);
    return true;
}

async function loadSfxBuffer(id) {
    if (sfxAudioBuffers.has(id)) return sfxAudioBuffers.get(id);
    if (sfxBufferPromises.has(id)) return sfxBufferPromises.get(id);

    const context = getSfxAudioContext();
    const url = getAudioElementSource(id);
    if (!context || !url) return null;

    const promise = fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch ${id}: ${response.status}`);
            return response.arrayBuffer();
        })
        .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
        .then(buffer => {
            sfxAudioBuffers.set(id, buffer);
            return buffer;
        })
        .catch(error => {
            sfxBufferPromises.delete(id);
            throw error;
        });

    sfxBufferPromises.set(id, promise);
    return promise;
}

function preloadSfxBuffersInBackground() {
    POOLED_SFX_IDS.forEach(id => {
        loadSfxBuffer(id).catch(() => {});
    });
}

window.playBufferedSfx = async function(id, volume = 0.5) {
    const context = getSfxAudioContext();
    if (!context) return false;

    try {
        if (context.state === 'suspended') {
            await context.resume();
        }

        const buffer = await loadSfxBuffer(id);
        if (!buffer) return false;

        const source = context.createBufferSource();
        const gain = context.createGain();
        gain.gain.value = Math.max(0, Math.min(1, volume));
        source.buffer = buffer;
        source.connect(gain);
        gain.connect(context.destination);
        source.start(0);
        return true;
    } catch (_error) {
        return false;
    }
};

function getSfxPool(id) {
    if (sfxAudioPools.has(id)) return sfxAudioPools.get(id);

    const original = document.getElementById(id);
    if (!original) return null;

    prepareAudioElementForIos(original);
    const pool = {
        index: 0,
        items: [original]
    };

    for (let i = 1; i < SFX_POOL_SIZE; i++) {
        const clone = original.cloneNode(true);
        clone.removeAttribute('id');
        prepareAudioElementForIos(clone);
        pool.items.push(clone);
    }

    sfxAudioPools.set(id, pool);
    return pool;
}

window.getPooledSfxAudio = function(id) {
    const pool = getSfxPool(id);
    if (!pool || !pool.items.length) return document.getElementById(id);

    const audio = pool.items[pool.index % pool.items.length];
    pool.index = (pool.index + 1) % pool.items.length;
    return audio;
};

window.warmGameAudioForInteraction = function() {
    if (gameAudioUnlocked) return;
    gameAudioUnlocked = true;

    POOLED_SFX_IDS.forEach(id => {
        const pool = getSfxPool(id);
        if (!pool) return;

        pool.items.forEach(audio => {
            prepareAudioElementForIos(audio);
        });
    });

    unlockSfxAudioContext()
        .then(() => preloadSfxBuffersInBackground())
        .catch(() => preloadSfxBuffersInBackground());
};

document.addEventListener('pointerdown', () => {
    if (!sfxAudioContext || sfxAudioContext.state !== 'suspended') return;
    sfxAudioContext.resume().catch(() => {});
}, { passive: true });

document.addEventListener('visibilitychange', () => {
    if (!document.hidden && sfxAudioContext?.state === 'suspended') {
        gameAudioUnlocked = false;
    }
});

const BGM_MAX_GAIN = 0.59;
const BGM_DUCK_VOLUME = 0.08;

function getNormalBgmVolume() {
    return ((gameVolume && Number.isFinite(gameVolume.bgm)) ? gameVolume.bgm : 0.5) * BGM_MAX_GAIN;
}

function getCurrentBgmTargetVolume() {
    return bgmDuckReasons.size > 0 ? BGM_DUCK_VOLUME : getNormalBgmVolume();
}

function setBgmVolume(volume) {
    const bgm = document.getElementById('bgm');
    if (!bgm) return;
    bgm.volume = Math.max(0, Math.min(1, volume));
}

function applyBgmTargetVolume(duration = 0) {
    const targetVolume = getCurrentBgmTargetVolume();
    if (duration > 0) {
        fadeBgm(targetVolume, duration);
    } else {
        setBgmVolume(targetVolume);
    }
}

function playBgm() {
    const bgm = document.getElementById('bgm');
    if (bgm) {
        applyBgmTargetVolume();
        if (!bgm.paused) return;
        bgm.play().catch(() => console.log('BGM waiting for interaction'));
    }
}

function fadeBgm(targetVol, duration = 800) {
    const bgm = document.getElementById('bgm');
    if (!bgm || bgm.paused) return;

    if (bgmFadeInterval) clearInterval(bgmFadeInterval);

    const startVol = bgm.volume;
    const stepTime = 50;
    const steps = duration / stepTime;
    const volStep = (targetVol - startVol) / steps;

    let currentStep = 0;

    bgmFadeInterval = setInterval(() => {
        currentStep++;
        let newVol = startVol + (volStep * currentStep);

        if (newVol < 0) newVol = 0;
        if (newVol > 1) newVol = 1;

        bgm.volume = newVol;

        if (currentStep >= steps) {
            clearInterval(bgmFadeInterval);
            bgm.volume = targetVol;
        }
    }, stepTime);
}

function requestBgmDuck(reason = 'default', duration = 250) {
    bgmDuckReasons.add(reason);
    applyBgmTargetVolume(duration);
}

function releaseBgmDuck(reason = 'default', duration = 250) {
    bgmDuckReasons.delete(reason);
    applyBgmTargetVolume(duration);
}

function duckStageVocabBgm() {
    requestBgmDuck('stage-vocab', 250);
}

function restoreStageVocabBgm() {
    releaseBgmDuck('stage-vocab', 250);
}

function playUnderAttackAlert() {
    const now = Date.now();
    if (now - lastAlertTime > 8000) {
        const bgm = document.getElementById('bgm');
        if (bgm) bgm.volume = 0.1;

        alertSfx.play().catch(error => console.log(error));
        lastAlertTime = now;

        setTimeout(() => {
            applyBgmTargetVolume(250);
        }, 3000);
    }
}

function toggleSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const surrenderBtn = document.getElementById('settings-surrender-btn');
    const isHidden = modal.style.display === 'none';
    modal.style.display = isHidden ? 'flex' : 'none';

    if (isHidden) {
        document.getElementById('vol-bgm').value = gameVolume.bgm;
        document.getElementById('vol-sfx').value = gameVolume.sfx;
        document.getElementById('vol-voice').value = gameVolume.voice;
        const inviteToggle = document.getElementById('toggle-pvp-invite-popups');
        if (inviteToggle && typeof getInvitePopupEnabled === 'function') {
            inviteToggle.checked = getInvitePopupEnabled();
        }

        const gameUi = document.getElementById('game-ui');
        const inBattle = typeof currentPhase !== 'undefined'
            && currentPhase !== 'DEPLOY'
            && gameUi
            && gameUi.style.display !== 'none';
        if (surrenderBtn) surrenderBtn.style.display = inBattle ? 'block' : 'none';

        if (typeof playSound === 'function') playSound('open-room-sfx');
    } else {
        if (surrenderBtn) surrenderBtn.style.display = 'none';
        if (typeof playSound === 'function') playSound('delete-sfx');
    }
}

function updateVolume(type, val) {
    const fallback = type === 'voice' ? 1.0 : 0.5;
    const v = normalizeVolume(val, fallback);
    gameVolume[type] = v;

    if (type === 'bgm') {
        applyBgmTargetVolume();
    }

    localStorage.setItem(`setting_${type}`, v);
}

function loadSavedAudioSettings() {
    if (localStorage.getItem('setting_bgm')) {
        gameVolume.bgm = normalizeVolume(localStorage.getItem('setting_bgm'), 0.5);
        gameVolume.sfx = normalizeVolume(localStorage.getItem('setting_sfx'), 0.5);
        gameVolume.voice = normalizeVolume(localStorage.getItem('setting_voice'), 1.0);

        if (document.getElementById('vol-bgm')) document.getElementById('vol-bgm').value = gameVolume.bgm;
        if (document.getElementById('vol-sfx')) document.getElementById('vol-sfx').value = gameVolume.sfx;
        if (document.getElementById('vol-voice')) document.getElementById('vol-voice').value = gameVolume.voice;
    }

    const inviteToggle = document.getElementById('toggle-pvp-invite-popups');
    if (inviteToggle && typeof getInvitePopupEnabled === 'function') {
        inviteToggle.checked = getInvitePopupEnabled();
    }

    const bgm = document.getElementById('bgm');
    if (bgm) applyBgmTargetVolume();
}
