let bgmFadeInterval = null;

const alertSfx = new Audio('your-fleet-is-under-attack.mp3');
alertSfx.volume = 1.0;

let lastAlertTime = 0;

let gameVolume = {
    bgm: 0.5,
    sfx: 0.5,
    voice: 1.0
};

const BGM_MAX_GAIN = 0.6;

function playBgm() {
    const bgm = document.getElementById('bgm');
    if (bgm && bgm.paused) {
        bgm.volume = gameVolume.bgm * BGM_MAX_GAIN;
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

function playUnderAttackAlert() {
    const now = Date.now();
    if (now - lastAlertTime > 8000) {
        const bgm = document.getElementById('bgm-audio');
        if (bgm) bgm.volume = 0.1;

        alertSfx.play().catch(error => console.log(error));
        lastAlertTime = now;

        setTimeout(() => {
            if (bgm) bgm.volume = 0.3;
        }, 3000);
    }
}

function toggleSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const isHidden = modal.style.display === 'none';
    modal.style.display = isHidden ? 'flex' : 'none';

    if (isHidden) {
        document.getElementById('vol-bgm').value = gameVolume.bgm;
        document.getElementById('vol-sfx').value = gameVolume.sfx;
        document.getElementById('vol-voice').value = gameVolume.voice;

        if (typeof playSound === 'function') playSound('open-room-sfx');
    } else {
        if (typeof playSound === 'function') playSound('delete-sfx');
    }
}

function updateVolume(type, val) {
    const v = parseFloat(val);
    gameVolume[type] = v;

    if (type === 'bgm') {
        const bgm = document.getElementById('bgm');
        if (bgm) {
            bgm.volume = v * BGM_MAX_GAIN;
        }
    }

    localStorage.setItem(`setting_${type}`, v);
}

function loadSavedAudioSettings() {
    if (localStorage.getItem('setting_bgm')) {
        gameVolume.bgm = parseFloat(localStorage.getItem('setting_bgm'));
        gameVolume.sfx = parseFloat(localStorage.getItem('setting_sfx'));
        gameVolume.voice = parseFloat(localStorage.getItem('setting_voice'));

        if (document.getElementById('vol-bgm')) document.getElementById('vol-bgm').value = gameVolume.bgm;
        if (document.getElementById('vol-sfx')) document.getElementById('vol-sfx').value = gameVolume.sfx;
        if (document.getElementById('vol-voice')) document.getElementById('vol-voice').value = gameVolume.voice;
    }

    const bgm = document.getElementById('bgm');
    if (bgm) bgm.volume = gameVolume.bgm * BGM_MAX_GAIN;
}
