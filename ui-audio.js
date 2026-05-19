let bgmFadeInterval = null;
const bgmDuckReasons = new Set();
let bgmPlayRequested = false;
let bgmPlayInFlight = false;
let bgmPrepared = false;
let currentBgmVolume = 0;
let nativeAudioConfigured = false;
let nativeBgmActive = false;
let nativeBgmStarting = false;
let gameAudioBgmActive = false;
let gameAudioBgmStarting = false;
let bgmWaitingForLogoSplash = false;
const nativeAudioPreloads = new Map();

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
    'unit-lost-sfx',
    'under-attack-sfx'
];

const AUDIO_ID_FILE_OVERRIDES = {
    'under-attack-sfx': 'your-fleet-is-under-attack.mp3'
};

function isCapacitorNativeRuntime() {
    if (!window.Capacitor) return false;
    if (typeof window.Capacitor.isNativePlatform === 'function') {
        return window.Capacitor.isNativePlatform();
    }
    return !!window.Capacitor.Plugins;
}

function getNativeAudioPlugin() {
    if (!isCapacitorNativeRuntime()) return null;
    return window.Capacitor?.Plugins?.NativeAudio || null;
}

function getGameAudioPlugin() {
    if (!isCapacitorNativeRuntime()) return null;
    return window.Capacitor?.Plugins?.GameAudio || null;
}

function getAndroidBgmPlugin() {
    if (!isCapacitorNativeRuntime() || getCapacitorPlatform() !== 'android') return null;
    return window.Capacitor?.Plugins?.AndroidBgm || null;
}

function getCapacitorPlatform() {
    if (!window.Capacitor) return '';
    if (typeof window.Capacitor.getPlatform === 'function') {
        return window.Capacitor.getPlatform();
    }
    return '';
}

function getNativeAudioAssetPath(fileName) {
    if (!fileName) return '';
    return getCapacitorPlatform() === 'ios' ? `sounds/${fileName}` : fileName;
}

function shouldUseNativeBgm() {
    return getCapacitorPlatform() !== 'ios';
}

function shouldUseNativeSfx() {
    return getCapacitorPlatform() !== 'ios';
}

function getNativeBgmFileName() {
    return getCapacitorPlatform() === 'ios' ? 'bgm_native.m4a' : 'bgm.mp3';
}

function getAudioFileNameForId(id) {
    if (id === 'bgm') return getNativeBgmFileName();
    if (AUDIO_ID_FILE_OVERRIDES[id]) return AUDIO_ID_FILE_OVERRIDES[id];
    const source = getAudioElementSource(id);
    if (!source) return '';
    try {
        return new URL(source, window.location.href).pathname.split('/').pop() || source;
    } catch (_error) {
        return source.split('/').pop() || source;
    }
}

function getNativeAudioSource(id) {
    const fileName = getAudioFileNameForId(id);
    if (!fileName) return '';
    return getNativeAudioAssetPath(fileName);
}

function startGameAudioBgm() {
    const gameAudio = getGameAudioPlugin();
    if (!gameAudio) return Promise.resolve(false);
    if (gameAudioBgmActive || gameAudioBgmStarting) {
        gameAudio.setBgmVolume({ volume: getCurrentBgmTargetVolume() }).catch(() => {});
        return Promise.resolve(true);
    }
    gameAudioBgmStarting = true;
    return gameAudio.start({ bgmVolume: getCurrentBgmTargetVolume() })
        .then(() => {
            gameAudioBgmActive = true;
            return true;
        })
        .catch(error => {
            console.log('[GameAudio] BGM start failed', error?.message || error);
            return false;
        })
        .finally(() => {
            gameAudioBgmStarting = false;
        });
}

function isCompanyLogoSplashActive() {
    const logoSplash = document.getElementById('company-logo-splash');
    return !!logoSplash &&
        logoSplash.style.display !== 'none' &&
        window.companyLogoSplashDone !== true;
}

function getIosBundleAudioRelativePath(source) {
    if (getCapacitorPlatform() !== 'ios' || !source) return '';
    if (/^(https?:|blob:|data:)/i.test(source)) return '';

    let pathname = source;
    try {
        pathname = new URL(source, window.location.href).pathname;
    } catch (_error) {
        pathname = String(source || '').split(/[?#]/)[0];
    }

    pathname = pathname.replace(/^\/+/, '');
    if (!pathname || pathname.includes('..')) return '';
    return pathname.startsWith('public/') ? pathname : `public/${pathname}`;
}

window.playIosNativeAudioSource = async function(source, volume = 1) {
    if (getCapacitorPlatform() !== 'ios') return false;

    const gameAudio = getGameAudioPlugin();
    if (!gameAudio) return false;

    if (/^https?:\/\//i.test(source || '')) {
        if (typeof gameAudio.playRemoteAudio !== 'function') return false;
        try {
            const result = await gameAudio.playRemoteAudio({
                url: source,
                volume: Math.max(0, Math.min(1, volume))
            });
            return result?.played !== false;
        } catch (error) {
            console.log('[GameAudio] remote audio failed', error?.message || error);
            return false;
        }
    }

    if (typeof gameAudio.playBundleAudio !== 'function') return false;

    const relativePath = getIosBundleAudioRelativePath(source);
    if (!relativePath) return false;

    try {
        const result = await gameAudio.playBundleAudio({
            relativePath,
            volume: Math.max(0, Math.min(1, volume))
        });
        return result?.played !== false;
    } catch (error) {
        console.log('[GameAudio] bundled audio failed', relativePath, error?.message || error);
        return false;
    }
};

window.playIosBundleAudio = window.playIosNativeAudioSource;

window.preloadIosNativeAudioSource = async function(source) {
    if (getCapacitorPlatform() !== 'ios') return false;
    if (!/^https?:\/\//i.test(source || '')) return false;

    const gameAudio = getGameAudioPlugin();
    if (!gameAudio || typeof gameAudio.preloadRemoteAudio !== 'function') return false;

    try {
        const result = await gameAudio.preloadRemoteAudio({ url: source });
        return result?.preloaded !== false;
    } catch (error) {
        console.log('[GameAudio] remote audio preload failed', error?.message || error);
        return false;
    }
};

window.stopIosBundleAudio = async function() {
    if (getCapacitorPlatform() !== 'ios') return false;

    const gameAudio = getGameAudioPlugin();
    if (!gameAudio) return false;

    try {
        if (typeof gameAudio.stopBundleAudio === 'function') {
            await gameAudio.stopBundleAudio();
        }
        if (typeof gameAudio.stopRemoteAudio === 'function') {
            await gameAudio.stopRemoteAudio();
        }
        return true;
    } catch (_error) {
        return false;
    }
};

async function configureNativeAudio() {
    const nativeAudio = getNativeAudioPlugin();
    if (!nativeAudio || nativeAudioConfigured) return !!nativeAudio;
    nativeAudioConfigured = true;
    if (typeof nativeAudio.configure === 'function') {
        await nativeAudio.configure({ fade: false, focus: true }).catch(() => {});
    }
    return true;
}

async function preloadNativeAudio(id, options = {}) {
    const nativeAudio = getNativeAudioPlugin();
    if (!nativeAudio) return false;

    await configureNativeAudio();
    if (nativeAudioPreloads.has(id)) return nativeAudioPreloads.get(id);

    const assetPath = options.assetPath || getNativeAudioSource(id);
    if (!assetPath) return false;

    const preloadPromise = nativeAudio.preload({
        assetId: id,
        assetPath,
        channels: options.audioChannelNum || 1,
        audioChannelNum: options.audioChannelNum || 1,
        isUrl: false,
        volume: options.volume ?? 1
    })
        .then(() => true)
        .catch(error => {
            nativeAudioPreloads.delete(id);
            console.log('[NativeAudio] preload failed', id, error?.message || error);
            return false;
        });

    nativeAudioPreloads.set(id, preloadPromise);
    return preloadPromise;
}

window.preloadNativeSfx = async function(id, volume = gameVolume.sfx) {
    if (getCapacitorPlatform() === 'ios') {
        const gameAudio = getGameAudioPlugin();
        if (!gameAudio || typeof gameAudio.preloadSfx !== 'function') return false;

        const fileName = getAudioFileNameForId(id);
        if (!fileName) return false;

        try {
            await gameAudio.preloadSfx({ assetId: id, fileName, volume });
            return true;
        } catch (error) {
            console.log('[GameAudio] SFX preload failed', id, error?.message || error);
            return false;
        }
    }

    return preloadNativeAudio(id, { audioChannelNum: 4, volume });
};

function preloadNativeAudioInBackground() {
    if (getCapacitorPlatform() === 'ios') {
        playBgm().catch(() => {});
        POOLED_SFX_IDS.forEach(id => {
            window.preloadNativeSfx(id, gameVolume.sfx).catch(() => {});
        });
        return;
    }

    if (!getNativeAudioPlugin()) return;
    if (!shouldUseNativeSfx()) return;
    POOLED_SFX_IDS.forEach(id => {
        preloadNativeAudio(id, { audioChannelNum: 4, volume: gameVolume.sfx }).catch(() => {});
    });
}

function shouldMuteWebSfxForNativeTest() {
    return getCapacitorPlatform() === 'ios';
}

window.playNativeSfx = async function(id, volume = 0.5) {
    if (getCapacitorPlatform() === 'ios') {
        const gameAudio = getGameAudioPlugin();
        if (!gameAudio) return true;

        const fileName = getAudioFileNameForId(id);
        if (!fileName) return true;

        try {
            await gameAudio.playSfx({ assetId: id, fileName, volume });
        } catch (error) {
            console.log('[GameAudio] SFX failed', id, error?.message || error);
        }
        return true;
    }

    const nativeAudio = getNativeAudioPlugin();
    if (!nativeAudio || !shouldUseNativeSfx()) return false;

    const loaded = await preloadNativeAudio(id, { audioChannelNum: 4, volume });
    if (!loaded) return false;

    try {
        await nativeAudio.setVolume({ assetId: id, volume: Math.max(0.01, Math.min(1, volume)) }).catch(() => {});
        await nativeAudio.play({ assetId: id });
        return true;
    } catch (error) {
        console.log('[NativeAudio] play failed', id, error?.message || error);
        return false;
    }
};

window.pauseBgm = async function() {
    bgmPlayRequested = false;
    const androidBgm = getAndroidBgmPlugin();
    if (androidBgm) {
        await androidBgm.pause().catch(() => {});
    }

    const gameAudio = getGameAudioPlugin();
    if (getCapacitorPlatform() === 'ios' && gameAudio) {
        await gameAudio.pauseBgm().catch(() => {});
        gameAudioBgmActive = false;
    }

    const nativeAudio = getNativeAudioPlugin();
    if (nativeAudio && nativeBgmActive) {
        await nativeAudio.pause({ assetId: 'bgm' }).catch(() => {});
        nativeBgmActive = false;
    }

    const bgm = document.getElementById('bgm');
    if (bgm) bgm.pause();
};

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
    if (shouldMuteWebSfxForNativeTest()) return true;

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

window.shouldMuteWebSfxForNativeTest = shouldMuteWebSfxForNativeTest;

window.warmGameAudioForInteraction = function() {
    if (gameAudioUnlocked) return;
    gameAudioUnlocked = true;

    if (getCapacitorPlatform() === 'ios') {
        playBgm().catch(() => {});
        POOLED_SFX_IDS.forEach(id => {
            window.preloadNativeSfx(id, gameVolume.sfx).catch(() => {});
        });
        return;
    }

    POOLED_SFX_IDS.forEach(id => {
        const pool = getSfxPool(id);
        if (!pool) return;

        pool.items.forEach(audio => {
            prepareAudioElementForIos(audio);
        });
    });

    unlockSfxAudioContext()
        .then(() => {
            preloadSfxBuffersInBackground();
            preloadNativeAudioInBackground();
        })
        .catch(() => {
            preloadSfxBuffersInBackground();
            preloadNativeAudioInBackground();
        });
};

document.addEventListener('pointerdown', (event) => {
    if (sfxAudioContext?.state === 'suspended') {
        sfxAudioContext.resume().catch(() => {});
    }
    retryRequestedBgm(event);
}, { passive: true });

document.addEventListener('visibilitychange', () => {
    if (!document.hidden && sfxAudioContext?.state === 'suspended') {
        gameAudioUnlocked = false;
    }
    if (!document.hidden) retryRequestedBgm();
});

const BGM_MAX_GAIN = 0.9;
const BGM_DUCK_VOLUME = 0.08;

function getNormalBgmVolume() {
    return ((gameVolume && Number.isFinite(gameVolume.bgm)) ? gameVolume.bgm : 0.5) * BGM_MAX_GAIN;
}

function getCurrentBgmTargetVolume() {
    return bgmDuckReasons.size > 0 ? BGM_DUCK_VOLUME : getNormalBgmVolume();
}

window.resetBgmDucks = function(duration = 180) {
    if (bgmDuckReasons.size > 0) {
        bgmDuckReasons.clear();
    }
    applyBgmTargetVolume(duration);
    if (getCapacitorPlatform() === 'ios') {
        startGameAudioBgm().catch(() => {});
    }
};

function setBgmVolume(volume) {
    currentBgmVolume = Math.max(0, Math.min(1, volume));
    const bgm = document.getElementById('bgm');
    if (bgm) bgm.volume = currentBgmVolume;

    const androidBgm = getAndroidBgmPlugin();
    if (androidBgm) {
        androidBgm.setVolume({ volume: currentBgmVolume }).catch(() => {});
        return;
    }

    const gameAudio = getGameAudioPlugin();
    if (getCapacitorPlatform() === 'ios' && gameAudio) {
        gameAudio.setBgmVolume({ volume: currentBgmVolume }).catch(() => {});
        return;
    }

    const nativeAudio = getNativeAudioPlugin();
    if (nativeAudio && shouldUseNativeBgm() && (nativeBgmActive || nativeAudioPreloads.has('bgm'))) {
        nativeAudio.setVolume({
            assetId: 'bgm',
            volume: Math.max(0.01, currentBgmVolume)
        }).catch(() => {});
    }
}

function applyBgmTargetVolume(duration = 0) {
    const targetVolume = getCurrentBgmTargetVolume();
    if (duration > 0) {
        fadeBgm(targetVolume, duration);
    } else {
        setBgmVolume(targetVolume);
    }
}

function prepareBgmElement(bgm) {
    if (!bgm || bgmPrepared) return;
    bgm.loop = true;
    bgm.preload = 'auto';
    bgm.playsInline = true;
    bgm.setAttribute('playsinline', '');
    try {
        bgm.load();
    } catch (_error) {}
    bgmPrepared = true;
}

function retryRequestedBgm(event = null) {
    if (event?.target?.closest?.('[data-listening-replay]')) return;
    if (!bgmPlayRequested || bgmPlayInFlight) return;
    playBgm();
}

function playHtmlBgm() {
    const bgm = document.getElementById('bgm');
    if (!bgm) return Promise.resolve(false);

    bgmPlayRequested = true;
    prepareBgmElement(bgm);
    applyBgmTargetVolume();

    if (!bgm.paused) {
        return Promise.resolve(true);
    }

    bgmPlayInFlight = true;
    return bgm.play()
        .then(() => {
            bgmPlayInFlight = false;
            return true;
        })
        .catch(error => {
            bgmPlayInFlight = false;
            console.log('BGM waiting for interaction', error?.name || error?.message || error);
            return false;
        });
}

function playNativeBgm() {
    const nativeAudio = getNativeAudioPlugin();
    if (!nativeAudio || !shouldUseNativeBgm()) return Promise.resolve(false);

    if (nativeBgmActive || nativeBgmStarting) {
        return Promise.resolve(true);
    }

    nativeBgmStarting = true;
    return preloadNativeAudio('bgm', { assetPath: getNativeAudioAssetPath(getNativeBgmFileName()), audioChannelNum: 1, volume: getCurrentBgmTargetVolume() })
        .then(loaded => {
            if (!loaded) return false;
            return nativeAudio.setVolume({ assetId: 'bgm', volume: Math.max(0.01, getCurrentBgmTargetVolume()) })
                .catch(() => {})
                .then(() => nativeAudio.play({ assetId: 'bgm' }))
                .then(() => {
                    nativeAudio.loop({ assetId: 'bgm' }).catch(() => {});
                    nativeBgmActive = true;
                    return true;
                });
        })
        .catch(error => {
            console.log('[NativeAudio] BGM waiting for interaction', error?.message || error);
            return false;
        })
        .finally(() => {
            nativeBgmStarting = false;
        });
}

function playBgm() {
    bgmPlayRequested = true;

    if (isCompanyLogoSplashActive()) {
        if (!bgmWaitingForLogoSplash) {
            bgmWaitingForLogoSplash = true;
            window.addEventListener('company-logo-splash-done', () => {
                bgmWaitingForLogoSplash = false;
                retryRequestedBgm();
            }, { once: true });
        }
        return Promise.resolve(false);
    }

    applyBgmTargetVolume();

    const androidBgm = getAndroidBgmPlugin();
    if (androidBgm) {
        return androidBgm.start()
            .then(() => true)
            .catch(error => {
                console.log('[AndroidBgm] start failed', error?.message || error);
                return playHtmlBgm();
            });
    }

    if (getCapacitorPlatform() === 'ios') {
        return startGameAudioBgm();
    }

    if (getCapacitorPlatform() === 'android') {
        return playHtmlBgm()
            .then(played => {
                if (played) return true;
                return playNativeBgm();
            });
    }

    return playNativeBgm()
        .then(played => {
            if (played) return true;
            return playHtmlBgm();
        });
}

document.addEventListener('touchend', retryRequestedBgm, { passive: true });
window.addEventListener('pageshow', retryRequestedBgm);

function fadeBgm(targetVol, duration = 800) {
    const bgm = document.getElementById('bgm');
    const gameAudioBgmActive = getCapacitorPlatform() === 'ios' && !!getGameAudioPlugin();
    if ((!bgm || bgm.paused) && !nativeBgmActive && !gameAudioBgmActive) return;

    if (bgmFadeInterval) clearInterval(bgmFadeInterval);

    const startVol = (nativeBgmActive || gameAudioBgmActive) ? currentBgmVolume : bgm.volume;
    const stepTime = 50;
    const steps = duration / stepTime;
    const volStep = (targetVol - startVol) / steps;

    let currentStep = 0;

    bgmFadeInterval = setInterval(() => {
        currentStep++;
        let newVol = startVol + (volStep * currentStep);

        if (newVol < 0) newVol = 0;
        if (newVol > 1) newVol = 1;

        setBgmVolume(newVol);

        if (currentStep >= steps) {
            clearInterval(bgmFadeInterval);
            setBgmVolume(targetVol);
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
        setBgmVolume(0.1);

        if (getCapacitorPlatform() === 'ios' && typeof window.playNativeSfx === 'function') {
            window.playNativeSfx('under-attack-sfx', 1).catch(error => console.log(error));
        } else {
            alertSfx.play().catch(error => console.log(error));
        }
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
    if (bgm) {
        prepareBgmElement(bgm);
        applyBgmTargetVolume();
    }
}
