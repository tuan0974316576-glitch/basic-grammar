let currentRankingTab = 'total-xp';
let vocabScreenMode = 'default';
let vocabPreviewRows = [];
let vocabPreviewReturnScreen = 'start';
let vocabPreviewTitle = 'CODE LIST';
let vocabPreviewSubtitle = 'CLASSIFIED VOCABULARY DATABASE';
let vocabSearchKeyboardActive = false;

function getVocabSearchInput() {
    return document.getElementById('vocab-search-input');
}

function getVocabKeyboard() {
    return document.getElementById('vocab-virtual-keyboard');
}

function showVocabSearchKeyboard() {
    const keyboard = getVocabKeyboard();
    const input = getVocabSearchInput();
    const vocabScreen = document.getElementById('vocab-screen');
    if (!keyboard || !input || !vocabScreen || vocabScreen.style.display === 'none') return;

    if (!vocabSearchKeyboardActive && typeof playSound === 'function') playSound('deploy-sfx');
    vocabSearchKeyboardActive = true;
    input.setAttribute('readonly', 'readonly');
    input.setAttribute('inputmode', 'none');
    input.blur();
    keyboard.style.display = 'block';
    vocabScreen.classList.add('vocab-keyboard-open');
    updateVocabKeyboardLayout();
}

window.showVocabSearchKeyboard = showVocabSearchKeyboard;

function updateVocabKeyboardLayout() {
    const keyboard = getVocabKeyboard();
    const vocabScreen = document.getElementById('vocab-screen');
    const header = document.querySelector('#vocab-screen .tech-header');
    const searchContainer = document.querySelector('.vocab-search-container');
    if (!keyboard || !vocabScreen || !vocabSearchKeyboardActive) return;

    const viewportHeight = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight;
    const keyboardHeight = keyboard.getBoundingClientRect().height || 220;
    const headerHeight = header && header.offsetParent !== null ? header.getBoundingClientRect().height : 0;
    const searchHeight = searchContainer && searchContainer.offsetParent !== null ? searchContainer.getBoundingClientRect().height : 0;
    const topGap = 16;
    const betweenGap = 18;
    const bottomGap = 8;
    const listHeight = Math.max(180, Math.floor(viewportHeight - keyboardHeight - headerHeight - searchHeight - topGap - betweenGap - bottomGap));

    vocabScreen.style.setProperty('--vocab-keyboard-height', `${Math.ceil(keyboardHeight)}px`);
    vocabScreen.style.setProperty('--vocab-list-height', `${listHeight}px`);
}

function hideVocabSearchKeyboard() {
    const keyboard = getVocabKeyboard();
    const vocabScreen = document.getElementById('vocab-screen');
    const wasActive = vocabSearchKeyboardActive;
    vocabSearchKeyboardActive = false;
    if (keyboard) keyboard.style.display = 'none';
    if (vocabScreen) {
        vocabScreen.classList.remove('vocab-keyboard-open');
        vocabScreen.style.removeProperty('--vocab-keyboard-height');
        vocabScreen.style.removeProperty('--vocab-list-height');
    }
    if (wasActive && typeof playSound === 'function') playSound('delete-sfx');
}

function setVocabSearchValue(value) {
    const input = getVocabSearchInput();
    if (!input) return;
    input.value = String(value || '').slice(0, 40);
    filterVocabList();
}

function handleVocabKeyboardInput(keyValue) {
    const input = getVocabSearchInput();
    if (!input) return;

    if (keyValue === 'ENTER') {
        hideVocabSearchKeyboard();
        return;
    }
    if (keyValue === 'BACKSPACE') {
        if (typeof playSound === 'function') playSound('delete-sfx');
        setVocabSearchValue(input.value.slice(0, -1));
        return;
    }
    if (keyValue === 'CLEAR') {
        if (typeof playSound === 'function') playSound('delete-sfx');
        setVocabSearchValue('');
        return;
    }
    if (typeof keyValue === 'string' && keyValue.length === 1) {
        if (typeof playSound === 'function') playSound('enter-sfx');
        setVocabSearchValue(input.value + keyValue.toLowerCase());
    }
}

function closeVocabScreen() {
    playSound('delete-sfx');
    hideVocabSearchKeyboard();
    const vocabScreen = document.getElementById('vocab-screen');
    vocabScreen.style.display = 'none';
    const returnScreen = vocabPreviewReturnScreen;

    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    if (vocabScreenMode === 'stage-preview') {
        if (typeof restoreStageVocabBgm === 'function') restoreStageVocabBgm();
        vocabScreen.classList.remove('stage-preview');
        if (title) title.innerText = 'CODE LIST';
        if (subtitle) subtitle.innerText = 'CLASSIFIED VOCABULARY DATABASE';
        if (tabs) tabs.style.display = 'flex';
        if (searchContainer) searchContainer.style.display = 'flex';
        vocabScreenMode = 'default';
        vocabPreviewRows = [];
        vocabPreviewReturnScreen = 'start';
        vocabPreviewTitle = 'CODE LIST';
        vocabPreviewSubtitle = 'CLASSIFIED VOCABULARY DATABASE';

        const stageScreen = document.getElementById('stage-screen');
        if (returnScreen === 'stage' && stageScreen) {
            stageScreen.style.display = 'flex';
            const wrapper = stageScreen.querySelector('.panel-content-wrapper');
            if (wrapper) {
                wrapper.style.animation = 'none';
                setTimeout(() => {
                    wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
                }, 10);
            }
            return;
        }
    }

    document.getElementById('start-screen').style.display = 'flex';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'block';
        updateSuppliesDisplay();
    }
}

function openRankingScreen() {
    playSound('deploy-sfx');

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('ranking-screen').style.display = 'flex';
    currentRankingTab = 'total-xp';
    switchRankingTab('total-xp');
}

function closeRankingScreen() {
    playSound('delete-sfx');
    document.getElementById('ranking-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'block';
        updateSuppliesDisplay();
    }
}

function switchRankingTab(tabName) {
    currentRankingTab = tabName;

    document.getElementById('tab-total-xp').classList.toggle('active', tabName === 'total-xp');
    document.getElementById('tab-pvp-winrate').classList.toggle('active', tabName === 'pvp-winrate');

    if (tabName === 'total-xp') {
        loadTotalXPRanking();
    } else {
        loadPVPWinRateRanking();
    }
}

async function loadTotalXPRanking() {
    const rankingList = document.getElementById('ranking-list');
    if (!rankingList) return;

    rankingList.innerHTML = '<div style="text-align: center; color: #64748b; padding: 40px; font-family: \'Orbitron\'; font-size: 12px;">LOADING RANKING DATA...</div>';

    try {
        const { ref, get } = window.firebaseModules;
        const usersRef = ref(window.db, 'users');
        const snapshot = await get(usersRef);
        const users = snapshot.val();

        if (!users) {
            rankingList.innerHTML = '<div style="text-align: center; color: #64748b; padding: 40px; font-family: \'Orbitron\'; font-size: 12px;">NO RANKING DATA AVAILABLE</div>';
            return;
        }

        const userArray = Object.keys(users).map(uid => ({
            uid,
            name: users[uid].name || users[uid].displayName || 'UNKNOWN',
            totalXP: users[uid].xp || 0
        }));

        userArray.sort((a, b) => b.totalXP - a.totalXP);

        const top100 = userArray.slice(0, 100);

        let html = '';
        top100.forEach((user, index) => {
            const rank = index + 1;
            const rankData = getRankForXP(user.totalXP);
            const isCurrentUser = user.uid === myPlayerId;
            const iconColor = getIconColor(index);
            const iconPath = `ranking_icon/${iconColor}/${rankData.iconFile}`;

            let rankColor = '#94a3b8';
            if (index === 0) rankColor = '#fbbf24';
            else if (index >= 1 && index <= 2) rankColor = '#c0c0c0';
            else if (index >= 3 && index <= 9) rankColor = '#cd7f32';

            html += `
                <div class="ranking-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: ${isCurrentUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.5)'}; border: 1px solid ${isCurrentUser ? 'rgba(255, 255, 255, 0.4)' : 'rgba(100, 116, 139, 0.2)'}; border-radius: 3px; opacity: 0;">
                    <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="font-family: 'Black Ops One'; font-size: 16px; color: ${rankColor}; min-width: 50px; text-align: center;">
                                #${rank}
                            </div>
                            <img src="${iconPath}" style="width: 24px; height: 24px; vertical-align: middle;" onerror="this.style.display='none'">
                        </div>
                        <div style="flex: 1;">
                            <div style="font-family: 'Orbitron'; font-size: 14px; color: ${isCurrentUser ? '#ffffff' : '#e2e8f0'}; font-weight: ${isCurrentUser ? 'bold' : 'normal'};">
                                ${user.name} ${isCurrentUser ? '(YOU)' : ''}
                            </div>
                            <div style="font-size: 10px; color: #94a3b8; font-family: 'Orbitron'; margin-top: 2px;">
                                ${rankData.name}
                            </div>
                        </div>
                    </div>
                    <div style="font-family: 'Orbitron'; font-size: 14px; color: #ffffff; font-weight: bold;">
                        ${user.totalXP.toLocaleString()} XP
                    </div>
                </div>
            `;
        });

        rankingList.innerHTML = html;

        const rankingItems = document.querySelectorAll('.ranking-item');
        rankingItems.forEach((item, index) => {
            item.style.animation = `fadeIn 0.3s ease-out ${index * 0.05}s forwards`;
        });
    } catch (error) {
        console.error('[Ranking] Error loading total XP data:', error);
        rankingList.innerHTML = '<div style="text-align: center; color: #ff4444; padding: 40px; font-family: \'Orbitron\'; font-size: 12px;">ERROR LOADING RANKING DATA</div>';
    }
}

async function loadPVPWinRateRanking() {
    const rankingList = document.getElementById('ranking-list');
    if (!rankingList) return;

    rankingList.innerHTML = '<div style="text-align: center; color: #64748b; padding: 40px; font-family: \'Orbitron\'; font-size: 12px;">LOADING PVP RANKING DATA...</div>';

    try {
        const { ref, get } = window.firebaseModules;
        const usersRef = ref(window.db, 'users');
        const snapshot = await get(usersRef);
        const users = snapshot.val();

        if (!users) {
            rankingList.innerHTML = '<div style="text-align: center; color: #64748b; padding: 40px; font-family: \'Orbitron\'; font-size: 12px;">NO RANKING DATA AVAILABLE</div>';
            return;
        }

        const userArray = Object.keys(users)
            .map(uid => ({
                uid,
                name: users[uid].name || users[uid].displayName || 'UNKNOWN',
                totalXP: users[uid].xp || 0,
                pvpWins: users[uid].pvpWins || 0,
                pvpLosses: users[uid].pvpLosses || 0,
                pvpTotalMatches: users[uid].pvpTotalMatches || 0
            }))
            .filter(user => user.pvpWins > 0);

        userArray.forEach(user => {
            user.winRate = user.pvpTotalMatches > 0
                ? (user.pvpWins / user.pvpTotalMatches * 100)
                : 0;
        });

        userArray.sort((a, b) => b.pvpWins - a.pvpWins);

        if (userArray.length === 0) {
            rankingList.innerHTML = '<div style="text-align: center; color: #64748b; padding: 40px; font-family: \'Orbitron\'; font-size: 12px;">NO PVP DATA AVAILABLE</div>';
            return;
        }

        const top100 = userArray.slice(0, 100);

        let html = '';
        top100.forEach((user, index) => {
            const rank = index + 1;
            const rankData = getRankForXP(user.totalXP);
            const isCurrentUser = user.uid === myPlayerId;
            const iconColor = getIconColor(index);
            const iconPath = `ranking_icon/${iconColor}/${rankData.iconFile}`;

            let rankColor = '#94a3b8';
            if (index === 0) rankColor = '#fbbf24';
            else if (index >= 1 && index <= 2) rankColor = '#c0c0c0';
            else if (index >= 3 && index <= 9) rankColor = '#cd7f32';

            html += `
                <div class="ranking-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: ${isCurrentUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.5)'}; border: 1px solid ${isCurrentUser ? 'rgba(255, 255, 255, 0.4)' : 'rgba(100, 116, 139, 0.2)'}; border-radius: 3px; opacity: 0;">
                    <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="font-family: 'Black Ops One'; font-size: 16px; color: ${rankColor}; min-width: 50px; text-align: center;">
                                #${rank}
                            </div>
                            <img src="${iconPath}" style="width: 24px; height: 24px; vertical-align: middle;" onerror="this.style.display='none'">
                        </div>
                        <div style="flex: 1;">
                            <div style="font-family: 'Orbitron'; font-size: 14px; color: ${isCurrentUser ? '#ffffff' : '#e2e8f0'}; font-weight: ${isCurrentUser ? 'bold' : 'normal'};">
                                ${user.name} ${isCurrentUser ? '(YOU)' : ''}
                            </div>
                            <div style="font-size: 10px; color: #94a3b8; font-family: 'Orbitron'; margin-top: 2px;">
                                ${rankData.name}
                            </div>
                        </div>
                    </div>
                    <div style="font-family: 'Orbitron'; font-size: 14px; color: #ffffff; font-weight: bold;">
                        ${user.pvpWins}W${user.pvpLosses}L(${user.winRate.toFixed(1)}%)
                    </div>
                </div>
            `;
        });

        rankingList.innerHTML = html;

        const rankingItems = document.querySelectorAll('.ranking-item');
        rankingItems.forEach((item, index) => {
            item.style.animation = `fadeIn 0.3s ease-out ${index * 0.05}s forwards`;
        });
    } catch (error) {
        console.error('[Ranking] Error loading PVP win rate data:', error);
        rankingList.innerHTML = '<div style="text-align: center; color: #ff4444; padding: 40px; font-family: \'Orbitron\'; font-size: 12px;">ERROR LOADING RANKING DATA</div>';
    }
}

function renderVocabList(level, isSilent = false) {
    const listBody = document.getElementById('vocab-list-body');
    const isFirstLoad = listBody.innerHTML === '';

    if (!isFirstLoad && !isSilent) {
        const levelSfx = document.getElementById('level-select-sfx');
        if (levelSfx) {
            levelSfx.currentTime = 0;
            levelSfx.play().catch(error => console.log('Audio play prevented:', error));
        }
    }

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        if (btn.innerText.replace('*', '_STAR') === level || (level === 'L5_STAR' && btn.innerText === 'L5*')) {
            btn.classList.add('active');
        }
    });

    listBody.innerHTML = '';

    const searchInput = document.getElementById('vocab-search-input');
    if (searchInput) searchInput.value = '';
    hideVocabSearchKeyboard();

    const data = VOCAB_DB[level];
    if (!data) return;

    const fragment = document.createDocumentFragment();

    data.forEach((item, index) => {
        const row = document.createElement('div');
        row.classList.add('vocab-row');

        if (index < 20) {
            row.classList.add('vocab-row-entrance');
            row.style.setProperty('--vocab-row-delay', `${index * 0.05}s`);
            row.addEventListener('animationend', () => {
                row.classList.remove('vocab-row-entrance');
                row.style.removeProperty('--vocab-row-delay');
            }, { once: true });
        }

        row.addEventListener('click', () => speakVocabText(item.en, row));

        row.innerHTML = `
            <span class="vocab-ch">${item.ch}</span>
            <span class="vocab-en">${item.en}</span>
        `;

        fragment.appendChild(row);
    });

    listBody.appendChild(fragment);
}

function renderCustomVocabList(rows) {
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    listBody.innerHTML = '';

    const searchInput = document.getElementById('vocab-search-input');
    if (searchInput) searchInput.value = '';
    hideVocabSearchKeyboard();

    const fragment = document.createDocumentFragment();

    rows.forEach((item, index) => {
        const row = document.createElement('div');
        row.classList.add('vocab-row');

        if (index < 20) {
            row.classList.add('vocab-row-entrance');
            row.style.setProperty('--vocab-row-delay', `${index * 0.05}s`);
            row.addEventListener('animationend', () => {
                row.classList.remove('vocab-row-entrance');
                row.style.removeProperty('--vocab-row-delay');
            }, { once: true });
        }

        row.addEventListener('click', () => speakVocabText(item.en, row));
        row.innerHTML = `
            <span class="vocab-ch">${item.ch}</span>
            <span class="vocab-en">${item.en}</span>
        `;
        fragment.appendChild(row);
    });

    listBody.appendChild(fragment);
}

function filterVocabList() {
    const input = document.getElementById('vocab-search-input');
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll('.vocab-row');

    rows.forEach(row => {
        const enText = row.querySelector('.vocab-en').innerText.toLowerCase();
        const chText = row.querySelector('.vocab-ch').innerText.toLowerCase();

        if (enText.includes(filter) || chText.includes(filter)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function openVocabScreen() {
    playSound('open-room-sfx');
    if (typeof restoreStageVocabBgm === 'function') restoreStageVocabBgm();

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    document.getElementById('start-screen').style.display = 'none';
    const vocabScreen = document.getElementById('vocab-screen');
    if (vocabScreen) vocabScreen.classList.remove('stage-preview');
    document.getElementById('vocab-screen').style.display = 'flex';
    renderVocabList('L1', true);
    setupVocabSearchKeyboard();
}

function openStageVocabPreview(levelKey, stageWords, previewTitle) {
    playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const stageScreen = document.getElementById('stage-screen');
    if (stageScreen) stageScreen.style.display = 'none';

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'stage-preview';
    vocabPreviewRows = Array.isArray(stageWords) ? [...stageWords] : [];
    vocabPreviewReturnScreen = 'stage';
    vocabPreviewTitle = previewTitle || `${levelKey} STAGE PREVIEW`;
    vocabPreviewSubtitle = 'STAGE INFORMATION';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'none';
    if (vocabScreen) {
        vocabScreen.classList.add('stage-preview');
        vocabScreen.style.display = 'flex';
    }
    renderCustomVocabList(vocabPreviewRows);
    setupVocabSearchKeyboard();
}

window.openStageVocabPreview = openStageVocabPreview;


function setupVocabSearchKeyboard() {
    const input = getVocabSearchInput();
    const keyboard = getVocabKeyboard();
    const searchContainer = document.querySelector('.vocab-search-container');
    if (!input || !keyboard) return;

    input.setAttribute('readonly', 'readonly');
    input.setAttribute('inputmode', 'none');

    if (keyboard.dataset.bound === 'true') return;
    keyboard.dataset.bound = 'true';

    input.addEventListener('focus', showVocabSearchKeyboard);
    input.addEventListener('click', showVocabSearchKeyboard);
    input.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        showVocabSearchKeyboard();
    });
    input.addEventListener('touchstart', (event) => {
        event.preventDefault();
        showVocabSearchKeyboard();
    }, { passive: false });

    if (searchContainer) {
        searchContainer.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            showVocabSearchKeyboard();
        });
    }

    keyboard.addEventListener('click', (event) => {
        const key = event.target.closest('.kb-key');
        if (!key) return;
        event.preventDefault();
        event.stopPropagation();
        handleVocabKeyboardInput(key.getAttribute('data-vocab-key'));
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
}

document.addEventListener('DOMContentLoaded', setupVocabSearchKeyboard);

window.addEventListener('resize', () => {
    if (vocabSearchKeyboardActive) updateVocabKeyboardLayout();
});

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        if (vocabSearchKeyboardActive) updateVocabKeyboardLayout();
    });
}

document.addEventListener('keydown', (event) => {
    if (!vocabSearchKeyboardActive) return;
    const vocabScreen = document.getElementById('vocab-screen');
    if (!vocabScreen || vocabScreen.style.display === 'none') return;

    if (/^[a-z0-9]$/i.test(event.key)) {
        event.preventDefault();
        handleVocabKeyboardInput(event.key);
    } else if (event.key === ' ') {
        event.preventDefault();
        handleVocabKeyboardInput(' ');
    } else if (event.key === 'Backspace') {
        event.preventDefault();
        handleVocabKeyboardInput('BACKSPACE');
    } else if (event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault();
        handleVocabKeyboardInput('ENTER');
    }
});
