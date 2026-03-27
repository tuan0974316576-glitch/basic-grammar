/* =========================================
   ★★★ TARGET VOICE SYSTEM (洗牌袋邏輯) ★★★
   ========================================= */

// 1. 設定聲音清單 (請根據你實際的 MP3 長度微調 duration)
// 單位: ms (毫秒)
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
// ★ 新增：用來記錄上一句播過咩
let lastPlayedFile = null;

// 3. 抽籤函數 (修正版)
function getNextTargetVoice() {
    // A. 如果袋乾淨了，重新倒滿
    if (currentVoiceBag.length === 0) {
        currentVoiceBag = [...targetVoiceConfig];
        console.log("Voice bag empty! Reshuffling...");
    }

    // B. 隨機抽一個索引
    let randomIndex = Math.floor(Math.random() * currentVoiceBag.length);
    let selectedVoice = currentVoiceBag[randomIndex];

    // ★★★ C. 防撞機制 (關鍵修改) ★★★
    // 如果抽中的剛好等於「上一句」 (只會發生在換新袋的第一抽)
    // 而且袋裡面有超過 1 個選擇 (如果得 1 個就避無可避)
    if (lastPlayedFile && selectedVoice.file === lastPlayedFile && currentVoiceBag.length > 1) {
        console.log(`Avoided repeat of ${selectedVoice.file}, picking next one.`);
        
        // 簡單直接：揀隔離嗰個 (因為袋係亂或未抽嘅，揀邊個都一樣係隨機)
        randomIndex = (randomIndex + 1) % currentVoiceBag.length;
        selectedVoice = currentVoiceBag[randomIndex];
    }

    // D. 記錄這次播了什麼，供下次檢查
    lastPlayedFile = selectedVoice.file;
    
    // E. 從袋中移除
    currentVoiceBag.splice(randomIndex, 1);
    
    return selectedVoice;
}
let currentPracticeMode = 'READING'; // 預設模式
let recognition = null; // 語音識別物件
let battleLog = [];
    // ★★★ 新增：自動排序功能 ★★★
    // 這段代碼會走遍所有 Level (L1, L2...), 自動按英文字母 A-Z 排列
    function sortDatabase() {
        // 檢查 VOCAB_DB 是否存在
        if (typeof VOCAB_DB === 'undefined') return;

        // 走遍每一個 Level (L1, L2, L3...)
        for (let levelKey in VOCAB_DB) {
            // 使用 JavaScript 原生的 sort 功能
            VOCAB_DB[levelKey].sort((a, b) => {
                // 將英文轉做細楷 (LowerCase) 來比較，確保 'a' 和 'A' 都能正確排序
                return a.en.toLowerCase().localeCompare(b.en.toLowerCase());
            });
        }
        console.log("題目庫已自動按字母排序完成！");
    }

    // 立即執行排序
    sortDatabase();
    // ★★★ 排序代碼結束 ★★★

    // =========================================
    // ★★★ 錯字記錄系統 (Wrong Words Tracker) ★★★
    // Firebase 為主 (登入用戶)，localStorage 為 fallback (Guest/離線)
    // =========================================

    const WRONG_WORDS_LS_KEY = 'battleship_wrongWords';

    // 從 localStorage 載入錯字記錄
    function loadWrongWordsFromLocal() {
        try {
            const data = localStorage.getItem(WRONG_WORDS_LS_KEY);
            if (data) wrongWordsDB = JSON.parse(data);
        } catch (e) {
            console.warn('loadWrongWordsFromLocal error:', e);
        }
    }

    // 儲存錯字記錄到 localStorage
    function saveWrongWordsToLocal() {
        try {
            localStorage.setItem(WRONG_WORDS_LS_KEY, JSON.stringify(wrongWordsDB));
        } catch (e) {
            console.warn('saveWrongWordsToLocal error:', e);
        }
    }

    // 從 Firebase 載入錯字記錄 (登入用戶)
    function loadWrongWordsFromFirebase() {
        if (!window.myPlayerId || !window.db) return;
        const { ref, get } = window.firebaseModules;
        const wrongRef = ref(window.db, 'users/' + window.myPlayerId + '/wrongWords');
        get(wrongRef).then((snapshot) => {
            if (snapshot.exists()) {
                wrongWordsDB = snapshot.val();
                saveWrongWordsToLocal(); // 同步到 localStorage 做 backup
                console.log('Loaded wrong words from Firebase:', wrongWordsDB);
            }
        }).catch(e => console.warn('loadWrongWordsFromFirebase error:', e));
    }

    // 同步錯字記錄到 Firebase
    function syncWrongWordsToFirebase() {
        if (!window.myPlayerId || !window.db) return;
        const { ref, set } = window.firebaseModules;
        const wrongRef = ref(window.db, 'users/' + window.myPlayerId + '/wrongWords');
        set(wrongRef, wrongWordsDB).catch(e => console.warn('syncWrongWordsToFirebase error:', e));
    }

    // 記錄一個錯字
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

    // 移除一個錯字 (答啱咗)
    function removeWrongWord(skill, level, wordEn) {
        if (wrongWordsDB[skill] && wrongWordsDB[skill][level] && wrongWordsDB[skill][level][wordEn]) {
            delete wrongWordsDB[skill][level][wordEn];
            // 清理空物件
            if (Object.keys(wrongWordsDB[skill][level]).length === 0) delete wrongWordsDB[skill][level];
            if (Object.keys(wrongWordsDB[skill]).length === 0) delete wrongWordsDB[skill];
            saveWrongWordsToLocal();
            syncWrongWordsToFirebase();
        }
    }

    // 獲取當前 skill+level 的錯字 vocab 物件列表
    function getWrongWordsForSession(skill, level) {
        if (!wrongWordsDB[skill] || !wrongWordsDB[skill][level]) return [];
        const wrongKeys = Object.keys(wrongWordsDB[skill][level]);
        if (wrongKeys.length === 0) return [];
        const levelVocab = VOCAB_DB[level];
        if (!levelVocab) return [];
        return levelVocab.filter(v => wrongKeys.includes(v.en));
    }

    // ★★★ CRITICAL FIX: Declare variables BEFORE calling loadWrongWordsFromLocal ★★★
    let wrongWordsDB = {};   // { READING: { L1: { "apple": 1 }, ... }, LISTENING: {...}, SPEAKING: {...} }
    let wrongWordsDeck = []; // 優先出錯字 deck

    // 初始化：先從 localStorage 載入
    loadWrongWordsFromLocal();

    // ★★★ 錯字記錄系統結束 ★★★


    // ... 下面接回你原本的代碼 ...
    let lastProcessedTimestamp = 0; // ★ 新增：防止重複處理同一手棋
let battleUnsubscribe = null; // ★ 新增：專門管理戰鬥中的監聽器
let turnCounter = 0; // 回合計數器
let playerEnergy = 0; // ★★★ 玩家 Energy ★★★
let isTargeting = false;
    // --- 1. Firebase 設定 (已填入你的資料) ---
    const firebaseConfig = {
        apiKey: "AIzaSyBdfTgb7FpkYdgjvrYWQ0jr-N-1fAaW9Q0",
        authDomain: "vocabularyxdungeon.firebaseapp.com",
        databaseURL: "https://vocabularyxdungeon-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "vocabularyxdungeon",
        storageBucket: "vocabularyxdungeon.appspot.com",
        messagingSenderId: "834761939928",
        appId: "1:834761939928:web:4591dcd9650ec99746f0ad"
    };

    // --- 2. 遊戲參數 ---
    const GRID_SIZE = 10;

/* =========================================
       ★★★ 1. 戰艦數據 (已更新次序：T型排第3) ★★★
       ========================================= */
    // ★★★ 種族戰艦映射表 ★★★
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
            ships: ['1x2.png', '1x3.png', '1x3+1.png', '1x4.png', '2x4.png'], // TODO: 加入 Caustics 圖片
            damaged: ['1x2_damaged.png', '1x3_damaged.png', '1x3+1_damaged.png', '1x4_damaged.png', '2x4_damaged.png']
        }
    };

    // ★★★ 動態生成 FLEET 配置 ★★★
    function getFleetConfig(race = 'VANGUARDS') {
        const images = RACE_SHIP_IMAGES[race] || RACE_SHIP_IMAGES['VANGUARDS'];

        if (race === 'AURELIANS') {
            // Aurelians 有唔同的戰艦配置
            return [
                // 1. 1x2 (不變)
                {
                    width: 1, height: 2, img: images.ships[0],
                    voiceId: null // ★ Aurelians 暫時無語音
                },
                // 2. 2+1 (新 - 左上、左下、右下)
                {
                    width: 2, height: 2, img: images.ships[1], custom: true,
                    layoutV: [1, 0, 1, 1],
                    layoutH: [1, 1, 0, 1],
                    voiceId: null // ★ Aurelians 暫時無語音
                },
                // 3. 1+2 (左下1格+右邊2格)
                {
                    width: 2, height: 2, img: images.ships[2], custom: true,
                    layoutV: [0, 1, 1, 1],
                    layoutH: [0, 1, 1, 1],
                    voiceId: null // ★ Aurelians 暫時無語音
                },
                // 4. 1+3 (新 - VERTICAL:左上+右邊3格, HORIZONTAL:上排3格+左下1格, 2x3)
                {
                    width: 2, height: 3, img: images.ships[3], custom: true,
                    layoutV: [1, 1, 0, 1, 0, 1],
                    layoutH: [1, 1, 1, 1, 0, 0],
                    voiceId: null // ★ Aurelians 暫時無語音
                },
                // 5. 3x3 (不變)
                {
                    width: 3, height: 3, img: images.ships[4],
                    voiceId: null // ★ Aurelians 暫時無語音
                }
            ];
        } else {
            // Vanguards / Caustics 使用標準配置
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

    // ★★★ 動態生成 DAMAGED_IMAGES ★★★
    function getDamagedImages(race = 'VANGUARDS') {
        const images = RACE_SHIP_IMAGES[race] || RACE_SHIP_IMAGES['VANGUARDS'];
        return images.damaged;
    }

    // ★★★ 初始化 FLEET 和 DAMAGED_IMAGES ★★★
    let FLEET = getFleetConfig('VANGUARDS'); // 預設使用 Vanguards
    let DAMAGED_IMAGES = getDamagedImages('VANGUARDS');
    let ENEMY_DAMAGED_IMAGES = getDamagedImages('VANGUARDS'); // ★★★ AI 對手的受損圖片 ★★★

    // ★★★ 預載 Damaged 圖片以消除延遲 ★★★
    function preloadDamagedImages() {
        const allImages = [...DAMAGED_IMAGES, ...ENEMY_DAMAGED_IMAGES];
        allImages.forEach(src => {
            if (src) {
                const img = new Image();
                img.src = src;
            }
        });
    }

   

    // 全局變數：當前使用的生字表

    // =========================================
    // ★★★ RANK TABLE & XP SYSTEM ★★★
    // =========================================
    const RANK_TABLE = [
        { minXP: 0, name: 'RECRUIT', iconFile: '01_recruit.png' },
        { minXP: 3000, name: 'CADET', iconFile: '02_cadet.png' },
        { minXP: 8000, name: 'PRIVATE', iconFile: '03_private.png' },
        { minXP: 15000, name: 'TROOPER', iconFile: '04_trooper.png' },
        { minXP: 25000, name: 'CORPORAL', iconFile: '05_corporal.png' },
        { minXP: 38000, name: 'SERGEANT', iconFile: '06_sergeant.png' },
        { minXP: 55000, name: 'CHIEF', iconFile: '07_chief.png' },
        { minXP: 75000, name: 'ENSIGN', iconFile: '08_ensign.png' },
        { minXP: 100000, name: 'WARRANT', iconFile: '09_warrant.png' },
        { minXP: 130000, name: 'LIEUTENANT', iconFile: '10_lieutenant.png' },
        { minXP: 165000, name: 'CAPTAIN', iconFile: '11_captain.png' },
        { minXP: 205000, name: 'MAJOR', iconFile: '12_major.png' },
        { minXP: 250000, name: 'COLONEL', iconFile: '13_colonel.png' },
        { minXP: 300000, name: 'COMMANDER', iconFile: '14_commander.png' },
        { minXP: 360000, name: 'BRIGADIER', iconFile: '15_brigadier.png' },
        { minXP: 430000, name: 'COMMODORE', iconFile: '16_commodore.png' },
        { minXP: 510000, name: 'GENERAL', iconFile: '17_general.png' },
        { minXP: 600000, name: 'ADMIRAL', iconFile: '18_admiral.png' },
        { minXP: 700000, name: 'MARSHAL', iconFile: '19_marshal.png' },
        { minXP: 820000, name: 'WARLORD', iconFile: '20_warlord.png' },
        { minXP: 960000, name: 'ARCHON', iconFile: '21_archon.png' },
        { minXP: 1120000, name: 'TITAN', iconFile: '22_titan.png' },
        { minXP: 1300000, name: 'OVERLORD', iconFile: '23_overlord.png' },
        { minXP: 1500000, name: 'LEGEND', iconFile: '24_legend.png' }
    ];

    // ★★★ Dynamic Color Helper for Leaderboard Icons ★★★
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
        return { level, name: rank.name, minXP: rank.minXP, nextXP, iconFile: rank.iconFile };
    }

    // ★★★ XP & MASTERY GLOBAL VARIABLES ★★★
    let userTotalXP = 0;
    // mastery 結構: { reading: { L1: { "apple": { count: 3, status: 1 } }, ... }, listening: {...}, speaking: {...} }
    let userMastery = { reading: {}, listening: {}, speaking: {} };

    // ★★★ SUPPLIES SYSTEM ★★★
    let userSupplies = 0;
    window.userSupplies = 0;

    // ★★★ PHASE 5: SESSION XP TRACKING ★★★
    let sessionAnsweringXP = 0; // Tracks XP gained from answering questions in current match
    let sessionSupplies = 0; // Tracks supplies gained from answering questions in current match

    let activeVocabList = [];
    let sessionDeck = [];
    let selectedLevel = 'L1'; // 預設
    let tempGameMode = 'AI';  // 暫存模式選擇

    // --- 3. 全局變數 ---
let deploymentTimerInterval = null; // 佈陣倒數器
let turnTimerInterval = null; // 用來計選位嗰 8 秒
let turnTimeLeft = 10.0;
const TURN_SELECTION_TIME = 10.0;
    var app, db, auth;
    var myPlayerId = null, currentRoomId = null, gameMode = 'AI', playerRole = null, currentOpponentId = null;
    let myGrid = Array(GRID_SIZE*GRID_SIZE).fill(0);
    let enemyGrid = Array(GRID_SIZE*GRID_SIZE).fill(0);
    let enemyShots = [];
    let aiTargetStack = [];
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

    // ★★★ PVP ANTI-FARMING: Track turn count ★★★
    let currentTurnCount = 0;

// ★ 這是之前漏咗嘅函數，必須要有佢，VS AI 先唔會死機 ★
function setGameTimeout(callback, delay) {
    const id = setTimeout(() => {
        callback();
        // 執行完後，從列表中移除自己 (保持陣列整潔)
        gameTimeouts = gameTimeouts.filter(t => t !== id);
    }, delay);
    gameTimeouts.push(id);
    return id;
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
    currentPhase = 'ENEMY_TURN';
    switchScene('ENEMY');
    document.getElementById('warning-overlay').style.display = 'block';
    
    // 改用 setGameTimeout
    setGameTimeout(aiFire, 2000);
}

    const TOTAL_HP = 21; 
    let myDamage = 0;    // 我被打中幾多格 (我輸的進度)
    let enemyDamage = 0; // 敵人被打中幾多格 (我贏的進度)
    let unsubscribeRoom = null; // 用來儲存 Firebase 監聽器
    let pvpRaceSelectionShown = false;
    let isEnteringPVPDeploy = false;
    let latestPVPSetupData = null;
    const lobbyProfileCache = new Map();

    // --- 5. 流程控制 ---
function selectMode(mode) {
    tempGameMode = mode;
    hideMenuOverlayScreens();

    // ★★★ 隱藏 Supplies 顯示 (選擇遊戲模式後) ★★★
    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    if (mode === 'PVP') {
        // ★★★ Check rank requirement: PRIVATE or above ★★★
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

        // ★ 修復問題 2：隱藏整個標題畫面 (包括 Title 同 User Profile)
        // 這樣就不會擋住 Lobby 的按鈕
        document.getElementById('start-screen').style.display = 'none';

        // ★ 修復問題 1：PVP 直接去 Lobby (跳過 Skill 選擇)
        showLobbyScreen();

        // ★ 顯示玩家 ID (使用多重來源確保顯示)
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
        // --- AI 模式 (流程：Menu -> Level -> Skill) ---
        playSound('deploy-sfx');

        // ★★★ 先隱藏 Main Menu 避免閃現 ★★★
        document.getElementById('main-menu-carousel').style.display = 'none';
        document.getElementById('game-mode-selection').style.display = 'none';

        // ★★★ 顯示共用黑色底層 ★★★
        const overlay = document.getElementById('selection-overlay');
        if (overlay) overlay.style.display = 'block';

        // 顯示 Level 選擇 (先揀 Level 再揀 Skill)
        const levelScreen = document.getElementById('level-screen');
        levelScreen.style.display = 'flex';
        // ★★★ Trigger holoAppear animation on content wrapper ★★★
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
        // AI 模式：Level 係第一步，Back 返回主選單
        // ★★★ 隱藏共用黑色底層 ★★★
        const overlay = document.getElementById('selection-overlay');
        if (overlay) overlay.style.display = 'none';

        showMainMenu();
    } else {
        // PVP 建房時按 Back，返回 Lobby
        showLobbyScreen();
    }
}

    function prepareCreateRoom() {
        playSound('deploy-sfx');
        const lobbyScreen = document.getElementById('lobby-screen');
        if (lobbyScreen) lobbyScreen.style.display = 'none';
        showSelectionOverlay();
        // 彈出 Level 選單畀場主揀
        // ★★★ PVP 模式唔顯示進度，重置返原本嘅文字 ★★★
        resetLevelButtonsToDefault();
        const levelScreen = document.getElementById('level-screen');
        levelScreen.style.display = 'flex';
        // ★★★ Trigger holoAppear animation on content wrapper ★★★
        const wrapper = levelScreen.querySelector('.panel-content-wrapper');
        if (wrapper) {
            wrapper.style.animation = 'none';
            setTimeout(() => {
                wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
            }, 10);
        }
    }

// ★★★ PHASE 6: CONTEXT-SENSITIVE LEVEL PROGRESS DISPLAY ★★★
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

// ★★★ UPDATE SKILL BUTTONS WITH PROGRESS ★★★
function updateSkillButtonsProgress() {
    // Only update if we have a selected level
    if (!selectedLevel || !VOCAB_DB[selectedLevel]) return;

    const totalWords = VOCAB_DB[selectedLevel].length;

    // Calculate progress for each skill
    let readingCount = 0;
    let listeningCount = 0;
    let speakingCount = 0;

    if (userMastery.reading && userMastery.reading[selectedLevel]) {
        readingCount = Object.values(userMastery.reading[selectedLevel]).filter(m => m.status === 1).length;
    }
    if (userMastery.listening && userMastery.listening[selectedLevel]) {
        listeningCount = Object.values(userMastery.listening[selectedLevel]).filter(m => m.status === 1).length;
    }
    if (userMastery.speaking && userMastery.speaking[selectedLevel]) {
        speakingCount = Object.values(userMastery.speaking[selectedLevel]).filter(m => m.status === 1).length;
    }

    // Update Reading button
    const readingBtn = document.getElementById('skill-btn-reading');
    if (readingBtn) {
        readingBtn.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center;">
                <span style="font-size:24px;">READING</span>
                <span style="font-size:12px; opacity:0.8; font-family: 'Orbitron';">${readingCount}/${totalWords}</span>
            </div>
        `;
    }

    // Update Listening button
    const listeningBtn = document.getElementById('skill-btn-listening');
    if (listeningBtn) {
        listeningBtn.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center;">
                <span style="font-size:24px;">LISTENING</span>
                <span style="font-size:12px; opacity:0.8; font-family: 'Orbitron';">${listeningCount}/${totalWords}</span>
            </div>
        `;
    }

    // Update Speaking button
    const speakingBtn = document.getElementById('btn-skill-speaking');
    if (speakingBtn) {
        speakingBtn.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center;">
                <span style="font-size:24px;">SPEAKING</span>
                <span style="font-size:12px; opacity:0.8; font-family: 'Orbitron';">${speakingCount}/${totalWords}</span>
            </div>
        `;
    }

    console.log(`[Skill Progress] R: ${readingCount}/${totalWords} | L: ${listeningCount}/${totalWords} | S: ${speakingCount}/${totalWords}`);
}

// ★★★ RESET SKILL BUTTONS TO DEFAULT (FOR PVP) ★★★
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

// ★★★ RESET LEVEL BUTTONS TO DEFAULT (FOR PVP) ★★★
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

// --- 修正版：選擇等級 (PVP 改為去選 Skill) ---
function selectLevel(level) {
    selectedLevel = level;
    activeVocabList = VOCAB_DB[level];
    sessionDeck = [...activeVocabList];
    console.log(`Level ${level} selected. Deck size: ${sessionDeck.length}`);
    playSound('deploy-sfx');

    // ★★★ 隱藏 Supplies 顯示 (進入 Level 選擇後) ★★★
    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    // ★★★ 關鍵修正：直接隱藏 Level 畫面，千萬不要呼叫 closeLevelScreen() ★★★
    // closeLevelScreen() 係俾「返回鍵」用的，它會錯誤地帶你返去上一頁 (Skill Screen)
    document.getElementById('level-screen').style.display = 'none';

    // ★★★ 先隱藏 Main Menu 避免閃現 ★★★
    const carousel = document.getElementById('main-menu-carousel');
    if (carousel) carousel.style.display = 'none';

    if (tempGameMode === 'AI') {
        // --- AI 模式：Level -> Skill (顯示 Skill 選擇) ---
        // ★★★ Update skill buttons with progress for selected level ★★★
        updateSkillButtonsProgress();

        const skillScreen = document.getElementById('skill-screen');
        skillScreen.style.display = 'flex';
        // ★★★ Trigger holoAppear animation on content wrapper ★★★
        const wrapper = skillScreen.querySelector('.panel-content-wrapper');
        if (wrapper) {
            wrapper.style.animation = 'none';
            setTimeout(() => {
                wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
            }, 10);
        }

        // 確保 AI 模式見到 Speaking 按鈕
        const speakBtn = document.getElementById('btn-skill-speaking');
        if (speakBtn) speakBtn.style.display = 'flex';
    } else {
        // --- PVP 模式：Level -> Skill -> Lobby ---
        // ★★★ PVP 唔顯示進度，重置返原本嘅文字 ★★★
        resetSkillButtonsToDefault();
        showSelectionOverlay();
        const lobbyScreen = document.getElementById('lobby-screen');
        if (lobbyScreen) lobbyScreen.style.display = 'none';

        // 顯示 Skill 選擇
        const skillScreen = document.getElementById('skill-screen');
        skillScreen.style.display = 'flex';
        // ★★★ Trigger holoAppear animation on content wrapper ★★★
        const wrapper = skillScreen.querySelector('.panel-content-wrapper');
        if (wrapper) {
            wrapper.style.animation = 'none';
            setTimeout(() => {
                wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
            }, 10);
        }

        // PVP 暫時隱藏 Speaking Mode (如需要)
        const speakBtn = document.getElementById('btn-skill-speaking');
        if (speakBtn) speakBtn.style.display = 'none';
    }
}

function enterGameUI() {
    const bgm = document.getElementById('bgm');
    if (bgm) { bgm.volume = 0.5; bgm.play().then(()=>isMusicPlaying=true).catch(e=>{}); }

    // ★ PHASE 5: Reset session XP counter
    sessionAnsweringXP = 0;
    sessionSupplies = 0;

    // ★★★ ANTI-FARMING: Reset turn count ★★★
    currentTurnCount = 0;

    // ★ 初始化錯字優先 deck：將之前錯過的字排先出
    wrongWordsDeck = getWrongWordsForSession(currentPracticeMode, selectedLevel);
    if (wrongWordsDeck.length > 0) {
        console.log(`[Wrong Words] ${wrongWordsDeck.length} words to review for ${currentPracticeMode}/${selectedLevel}`);
    }

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('lobby-screen').style.display = 'none';

    // ★★★ 隱藏 Supplies 顯示 (進入遊戲時) ★★★
    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const gameUI = document.getElementById('game-ui');
    gameUI.style.display = 'flex';
    setTimeout(() => { gameUI.style.opacity = '1'; }, 50);

    // ★★★ Show AUTO DEPLOY button at start ★★★
    const autoDeployBtn = document.getElementById('auto-deploy-btn');
    if (autoDeployBtn) {
        autoDeployBtn.style.display = 'inline-block';
    }

    // ★★★ 重新渲染 Sidebar 以顯示對應種族的戰艦 ★★★
    if (typeof renderSidebar === 'function') {
        renderSidebar();
    }

    // ★★★ 預載 Damaged 圖片 ★★★
    preloadDamagedImages();

    startDeploymentTimer();

    // 刪除了 global-back-btn 的控制碼

    if (gameMode === 'PVP') initPVPListeners();
}

    // --- 6. PVP 邏輯 ---

// ★★★ ANTI-FARMING: Check match history in last 24 hours ★★★
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
        // ★ 新增：一按掣即刻播放開房音效 ★
        playSound('open-room-sfx');

        const { ref, set, onValue } = window.firebaseModules;
        const roomId = Math.floor(1000 + Math.random() * 9000).toString();
        currentRoomId = roomId;
        playerRole = 'host';
        gameMode = 'PVP';
        pvpRaceSelectionShown = false;
        isEnteringPVPDeploy = false;
        latestPVPSetupData = null;

set(ref(db, 'rooms/' + roomId), {
            host: myPlayerId, 
            guest: null, 
            status: 'waiting_for_guest', 
            turn: 'host',
            level: selectedLevel,
            practiceMode: currentPracticeMode,
            hostRace: null,
            guestRace: null
        });
const { onDisconnect, remove } = window.firebaseModules; // 確保拿到工具
    onDisconnect(ref(db, 'rooms/' + roomId)).remove();        
        const roomRef = ref(db, 'rooms/' + roomId);
        showPVPWaitingState(`ROOM: ${roomId} - WAITING...`, 'var(--success)');

unsubscribeRoom = onValue(roomRef, (snapshot) => {
            handlePVPMatchSetupSnapshot(snapshot.val());
        });
    }
function joinRoom() {
        const { ref, get, update } = window.firebaseModules;
        const inputId = document.getElementById('room-id-input').value.trim();

        // 簡單檢查長度
        if (inputId.length !== 4) {
            playSound('wrong-sfx');
            return;
        }

        const roomRef = ref(db, 'rooms/' + inputId);
        get(roomRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();

                // 檢查房間是否未滿
                if (!data.guest) {
                    playSound('open-room-sfx');
                    currentRoomId = inputId;
                    playerRole = 'guest';
                    tempGameMode = 'PVP';
                    pvpRaceSelectionShown = false;
                    isEnteringPVPDeploy = false;
                    latestPVPSetupData = null;

                    // ★ 關鍵修復：必須在這裡強制設定為 PVP 模式！ ★
                    // 因為 Guest 跳過了 selectLevel，如果唔加呢句，系統會以為係玩 AI
                    gameMode = 'PVP';

                    // Guest 跟隨 Host 的等級設定
                    if (data.level && VOCAB_DB[data.level]) {
                        selectedLevel = data.level;
                        activeVocabList = VOCAB_DB[data.level];
                        showNotification(`SYNCED: ${data.level}`, 'success');
                    }

                    // ★★★ Check match history before joining ★★★
                    checkMatchHistory(data.host, myPlayerId).then(result => {
                        const warningMsg = [];
                        if (result.hostExceeded) {
                            warningMsg.push(`⚠️ HOST has won 3+ matches against you in 24h. This match WON'T count for HOST.`);
                        }
                        if (result.guestExceeded) {
                            warningMsg.push(`⚠️ YOU have won 3+ matches against HOST in 24h. This match WON'T count for YOU.`);
                        }

                        if (warningMsg.length > 0) {
                            showNotification(warningMsg.join('\n'), 'warning', 8000);
                        }

                        update(roomRef, {
                            guest: myPlayerId,
                            status: 'choosing_race',
                            matchLimitWarning: warningMsg.length > 0 ? warningMsg : null
                        });

                        setupDisconnectHandler();

                        if (typeof showNotification === 'function') {
                            showNotification(`LINKING TO ROOM ${inputId}...`);
                        }
                        if (unsubscribeRoom) { unsubscribeRoom(); unsubscribeRoom = null; }
                        unsubscribeRoom = window.firebaseModules.onValue(roomRef, (snapshot) => {
                            handlePVPMatchSetupSnapshot(snapshot.val());
                        });
                    });
                } else {
                    document.getElementById('lobby-msg').innerText = "ROOM FULL";
                    playSound('wrong-sfx');
                }
            } else {
                document.getElementById('lobby-msg').innerText = "ROOM NOT FOUND";
                playSound('wrong-sfx');
            }
        });
    }

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
    
    // 1. 先移除舊的監聽
    const roomRef = ref(db, 'rooms/' + currentRoomId);
    off(roomRef); 

    // 2. 啟動新監聽
    onValue(roomRef, (snapshot) => {
        const data = snapshot.val();

        // --- 斷線偵測邏輯 (保持之前嘅寫法) ---
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

        // --- 勝利/失敗 判斷 (保持不變) ---
        if (data.winner) {
            if (currentPhase === 'GAME_OVER') return; 
            if (data.winner === playerRole) {
                renderReview();
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

        // --- 戰鬥邏輯 ---
        if (!data.lastMove) return;
        const move = data.lastMove;
        
        if (move.timestamp <= lastProcessedTimestamp) return;
        
        // 如果係對手打過嚟
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

                    // ★★★ AURELIANS: 戰艦被擊中 +2 energy ★★★
                    if (selectedRace === 'AURELIANS' && typeof addEnergy === 'function') {
                        addEnergy(2, 'Ship Hit');
                    }

                    // ★★★ PVP 關鍵修改：先檢查有無爆船，再決定播邊個聲 ★★★
                    const isDestroyed = checkMyShipDestruction(idx);

                    if (isDestroyed) {
                        playSound('unit-lost-sfx'); // 爆船：播 Unit Lost
                        // ★ 擊沉：強烈震動 ★
                        document.body.classList.add('screen-shake-sunk');
                        setTimeout(() => document.body.classList.remove('screen-shake-sunk'), 800);
                    } else {
                        playUnderAttackAlert();     // 未爆：播 Under Attack
                        // ★ 擊中：輕微震動 ★
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
    // --- 7. 佈陣邏輯 ---
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
        
        // 如果是垂直(v=true)，用原本長闊；水平則對調
        let w = v ? conf.width : conf.height;
        let h = v ? conf.height : conf.width;
        
        // 1. 檢查邊界 (出界就回傳 null)
        if (r + h > GRID_SIZE || c + w > GRID_SIZE) return null;
        
        // 2. 計算格仔位置
        if (conf.custom) {
            // ★ 特殊形狀邏輯 ★
            const layout = v ? conf.layoutV : conf.layoutH;
            
            for (let i = 0; i < h; i++) {
                for (let j = 0; j < w; j++) {
                    // 檢查 layout 陣列：如果是 1 才算有船
                    const layoutIdx = i * w + j;
                    if (layout[layoutIdx] === 1) {
                        indices.push((r + i) * GRID_SIZE + (c + j));
                    }
                }
            }
        } else {
            // ★ 普通長方形邏輯 (舊代碼) ★
            for (let i = 0; i < h; i++) {
                for (let j = 0; j < w; j++) {
                    indices.push((r + i) * GRID_SIZE + (c + j));
                }
            }
        }
        
        return indices;
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
       ★★★ 3. 點擊放置 (修正版：讀取 voiceId) ★★★
       ========================================= */
    function handleClick(index) {
        // 1. 非部署階段 -> 處理發射
        if (currentPhase !== 'DEPLOY') {
            if (currentPhase === 'PLAYER_TURN') {
                const cell = document.getElementById('enemy-grid').children[index];
                if (!cell.classList.contains('revealed')) openLaunchModal(index);
            }
            return;
        }

        // 2. 回收船隻邏輯
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

        // 3. 放置船隻邏輯
        if (deployIndex >= FLEET.length) return;

        const conf = FLEET[deployIndex];
        const indices = getShipIndices(index, conf, isVertical);

        if (!indices || indices.some(idx => myGrid[idx] === 1)) return;

        indices.forEach(idx => myGrid[idx] = 1);
        FLEET[deployIndex].indices = indices;
        FLEET[deployIndex].isVertical = isVertical; 

        placeShipImage('player-grid', index, conf, isVertical);
        
        // ★★★ 重點修正：不再依賴 Index，而是讀取 conf.voiceId ★★★
        // 這樣 Spectre 排第幾都好，都會讀番 'ship-voice-4'
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
        const startCell = board.children[idx];
        const img = document.createElement('img');
        img.src = conf.img;
        img.classList.add('ship-overlay');
        if (selectedRace === 'AURELIANS') {
            img.classList.add('aurelians');
        } else if (selectedRace === 'CAUSTICS') {
            img.classList.add('caustics');
        }

        if (boardId === 'player-grid') {
            // Use passed shipIndex if available, otherwise fall back to deployIndex
            const actualIndex = (shipIndex !== undefined) ? shipIndex : deployIndex;
            img.id = `board-ship-${actualIndex}`;
        }
        
        const pW = 35 * conf.width + 2 * (conf.width - 1);
        const pH = 35 * conf.height + 2 * (conf.height - 1);
        
        img.style.width = pW + 'px'; 
        img.style.height = pH + 'px';
        img.style.left = startCell.offsetLeft + 'px';
        img.style.top = startCell.offsetTop + 'px';
        
        if (!v) { 
            img.style.transformOrigin = '0 0'; 
            img.style.transform = `rotate(-90deg) translateX(-${pW}px)`; 
        }
        board.appendChild(img);
    }

    function rotateShip() {
        isVertical = !isVertical;
        document.getElementById('rotate-btn').innerText = isVertical ? "ROTATE: VERTICAL" : "ROTATE: HORIZONTAL";
    }

    // --- 8. 戰鬥流程 ---
function startBattle() {
    if (deploymentTimerInterval) clearInterval(deploymentTimerInterval);
    document.getElementById('turn-timer-container').style.visibility = 'hidden';

    // ★ PHASE 5: Reset session XP counter (in case not reset in enterGameUI)
    sessionAnsweringXP = 0;

    const exitBtn = document.getElementById('game-exit-btn');
    if(exitBtn) {
        exitBtn.innerText = "SURRENDER";
        exitBtn.style.borderColor = "var(--danger)";
    }

    // ★★★ Hide AUTO DEPLOY button when battle starts ★★★
    const autoDeployBtn = document.getElementById('auto-deploy-btn');
    if (autoDeployBtn) {
        autoDeployBtn.style.display = 'none';
    }

    document.getElementById('deploy-controls').style.display = 'none';
    document.getElementById('fleet-sidebar').style.display = 'none';
    // ★★★ 顯示底部 Battle HUD + spacer ★★★
    const battleHud = document.getElementById('battle-hud');
    if (battleHud) battleHud.style.display = 'flex';
    const spacer = document.getElementById('player-board-spacer');
    if (spacer) spacer.style.display = 'block';
    initEnemyFleetIndicator();
    playSound('deploy-sfx');

    if (gameMode === 'AI') {
        updateEnemyBoardLabel(enemyRace); // ★ Update AI opponent label ★
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
        updates[playerRole + 'Race'] = selectedRace; // ★ 儲存玩家種族 ★

        update(ref(db, 'rooms/' + currentRoomId), updates);
        document.getElementById('game-status').innerHTML = "WAITING FOR OPPONENT...";

        // 防止重複監聽
        if (battleUnsubscribe) battleUnsubscribe();

        battleUnsubscribe = onValue(ref(db, 'rooms/' + currentRoomId), (snapshot) => {
            const data = snapshot.val();
            
            // ★★★ 新增：檢測房間是否被刪除 (Host 走了) ★★★
            if (!data) {
                if (battleUnsubscribe) battleUnsubscribe(); // 停止監聽
                showNotification("CONNECTION LOST (HOST LEFT)", "error");
                playSound('wrong-sfx');
                // 延遲 2 秒後彈回大廳，讓玩家看清楚訊息
                setTimeout(() => resetGame(), 2000);
                return;
            }

            // ★★★ 新增：檢測 Guest 是否離開 (Host 視角) ★★★
            if (playerRole === 'host' && !data.guest) {
                if (battleUnsubscribe) battleUnsubscribe();
                showNotification("OPPONENT DISCONNECTED", "error");
                playSound('wrong-sfx');
                setTimeout(() => resetGame(), 2000);
                return;
            }
            
            // 當雙方都準備好
            if (data.hostReady && data.guestReady) {
                if (battleUnsubscribe) {
                    battleUnsubscribe(); // 停止監聽 Ready 狀態
                    battleUnsubscribe = null;
                }

                // ★★★ Get opponent race and update label ★★★
                const opponentRace = playerRole === 'host' ? data.guestRace : data.hostRace;
                if (opponentRace) {
                    enemyRace = opponentRace; // Store for later use
                    updateEnemyBoardLabel(opponentRace);
                }

                // ★★★ Task 5: Get opponent ID and update their rank badge ★★★
                const opponentId = playerRole === 'host' ? data.guest : data.host;
                currentOpponentId = opponentId; // ★★★ Store for settlement ★★★
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
        });
    }
}

// ★★★ Update enemy board label with race name ★★★
function updateEnemyBoardLabel(race) {
    const label = document.querySelector('#enemy-board .board-label');
    if (label) {
        label.innerText = `${race} FLEET`;
    }
}

function switchScene(sceneName) {
        document.getElementById('player-board').classList.remove('active');
        document.getElementById('enemy-board').classList.remove('active');
        const instrContainer = document.getElementById('instruction-container');

        if (sceneName === 'PLAYER') {
            document.getElementById('enemy-board').classList.add('active');
            document.getElementById('game-status').innerHTML = `PHASE: <span style="color:var(--success)">YOUR TURN</span>`;
            document.getElementById('control-panel').style.borderColor = "var(--success)";
            // 顯示 instruction container
            if (instrContainer) {
                instrContainer.style.visibility = 'visible';
                // Class toggle 觸發展開動畫（兼容 Safari/iOS）
                instrContainer.classList.remove('play-expand');
                void instrContainer.offsetWidth;
                instrContainer.classList.add('play-expand');
                // Aurelians 用金色
                if (selectedRace === 'AURELIANS') {
                    instrContainer.classList.add('aurelians');
                } else {
                    instrContainer.classList.remove('aurelians');
                }
            }
            // ★★★ 我方回合：技能可用 ★★★
            const skillGroup = document.getElementById('hud-skills');
            if (skillGroup) skillGroup.classList.remove('skills-inactive');
            clearActiveSkillState();
            cancelSkillSelection();
            refreshRadarScanDisplays();
            if (typeof updateSkillStates === 'function') updateSkillStates();
        } else {
            document.getElementById('player-board').classList.add('active');
            document.getElementById('game-status').innerHTML = `PHASE: <span style="color:var(--danger)">WARNING! ENEMY</span>`;
            document.getElementById('control-panel').style.borderColor = "var(--danger)";
            // ★★★ 敵方回合：技能不可用 ★★★
            const skillGroup = document.getElementById('hud-skills');
            if (skillGroup) skillGroup.classList.add('skills-inactive');
            clearActiveSkillState();
            // 隱藏 instruction container
            if (instrContainer) instrContainer.style.visibility = 'hidden';
        }
    }

/* =========================================
   ★★★ TARGET LOCK LOGIC (JS) - 修正計時器 Bug 版 ★★★
   ========================================= */

function handleEnemyGridClick(index) {
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

    // 1. 檢查鎖定：如果「正在瞄準(isTargeting)」或者「不是玩家回合」，直接無視點擊
    if (isTargeting || currentPhase !== 'PLAYER_TURN') {
        return; 
    }

    const cell = document.getElementById('enemy-grid').children[index];
    
    // 如果該格未被翻開
    if (!cell.classList.contains('revealed')) {
        
        // ★★★ 關鍵修正：一撳落去，即刻殺死計時器！ ★★★
        // 唔好等動畫播完先停，因為動畫播放期間唔應該計時
        if (typeof turnTimerInterval !== 'undefined' && turnTimerInterval) {
            clearInterval(turnTimerInterval);
        }
        // (選用) 順手隱藏埋條計時 Bar，畀玩家知「系統收到你指令啦」
        const timerContainer = document.getElementById('turn-timer-container');
        if (timerContainer) timerContainer.style.visibility = 'hidden';

        // 2. ★ 上鎖：立即設定為 true
        isTargeting = true;

        // Aim icon 放大縮小動畫
        const aimIcon = document.querySelector('.crosshair-icon');
        if (aimIcon) {
            aimIcon.classList.remove('aim-pulse');
            void aimIcon.offsetWidth;
            aimIcon.classList.add('aim-pulse');
        }

        // 3. 執行鎖定動畫
        runTargetLockAnimation(index, () => {
            // 動畫完成後的回調 (Callback)
            openLaunchModal(index);

            // 4. ★ 解鎖
            isTargeting = false;
        });
    }
}

// 執行鎖定動畫的主函數 (動態時長版)
function runTargetLockAnimation(index, onComplete) {
    const grid = document.getElementById('enemy-grid');
    const cell = grid.children[index];
    
    // --- 1. 抽取聲音與計算時間 ---
    const voiceObj = getNextTargetVoice(); 
    const totalDuration = voiceObj.duration; // 取得該聲音的長度 (ms)
    
    // 將 ms 轉換成秒 (給 CSS 用)，例如 1500ms -> "1.5s"
    const cssDuration = (totalDuration / 1000) + 's'; 

    console.log(`Playing: ${voiceObj.file}, Duration: ${totalDuration}ms`);

    // --- 2. 建立 DOM 元素 (同之前一樣) ---
    const cellLeft = cell.offsetLeft;
    const cellTop = cell.offsetTop;
    const cellW = cell.offsetWidth;
    const cellH = cell.offsetHeight;
    const centerX = cellLeft + cellW / 2;
    const centerY = cellTop + cellH / 2;

    const overlay = document.createElement('div');
    overlay.className = 'target-overlay';
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

    // ★★★ 關鍵：將計算出的時間傳給 CSS 變數 ★★★
    // 這裡我們把時間設在父層 overlay，或者直接設在元素上都可以
    lineH.style.setProperty('--anim-duration', cssDuration);
    lineV.style.setProperty('--anim-duration', cssDuration);
    reticle.style.setProperty('--anim-duration', cssDuration);

    overlay.appendChild(lineH);
    overlay.appendChild(lineV);
    overlay.appendChild(reticle);

    // --- 3. 播放抽到的聲音 ---
    // 假設你有一個通用播放函數，如果沒有，可以用簡單的 Audio 物件：
    const sfx = new Audio(voiceObj.file);
    sfx.volume = 0.8; // 調整音量
    sfx.play().catch(e => console.log("Audio play error:", e));

    // --- 4. 等待聲音播完才切換畫面 ---
    setTimeout(() => {
        overlay.remove();
        if (onComplete) onComplete();
    }, totalDuration); // 這裡直接使用聲音的長度
}

// --- 最終完整整合版：出題視窗 (圖片圖示 + 智能排版 + 語音修復) ---
function openLaunchModal(index) {
    // 1. 停止選位倒數
    if (typeof turnTimerInterval !== 'undefined' && turnTimerInterval) clearInterval(turnTimerInterval);
    document.getElementById('turn-timer-container').style.visibility = 'hidden';

    // 狀態文字
    let statusText = "DECRYPTING...";
    if (currentPracticeMode === 'SPEAKING') statusText = "VOICE UPLINK...";
    if (currentPracticeMode === 'LISTENING') statusText = "INCOMING TRANSMISSION...";
    
    document.getElementById('game-status').innerHTML = `PHASE: <span style="color:var(--warning)">${statusText}</span>`;

    currentTargetIndex = index;
    
    // 防呆機制
    const enemyShip = enemyGrid[index];
    if (enemyShip === 'hit' || enemyShip === 'miss') {
        playSound('wrong-sfx');
        return;
    }

// 準備題目 (AI: 3-Tier Spaced Repetition | PVP: Random)

    // ★★★ PVP 模式：簡單隨機抽字 (唔用 mastery 系統) ★★★
    if (gameMode === 'PVP') {
        // PVP 直接從 activeVocabList 隨機抽
        if (activeVocabList.length === 0) {
            alert("Error: Database is empty!");
            return;
        }
        const randIdx = Math.floor(Math.random() * activeVocabList.length);
        currentVocab = activeVocabList[randIdx];
        console.log(`[PVP Random] Word: ${currentVocab.en}`);
    } else {
        // ★★★ AI 模式：PHASE 3: 3-TIER QUEUE SYSTEM ★★★
        // Pool 1 (Learning): Wrong words from previous session
        // Pool 2 (New): Words not in userMastery
        // Pool 3 (Review): Mastered words

        // Convert currentPracticeMode to lowercase for mastery key (READING -> reading)
        const masteryKey = currentPracticeMode.toLowerCase();

        // Pool 1: Prioritize wrong words
        if (wrongWordsDeck.length > 0) {
            const wIdx = Math.floor(Math.random() * wrongWordsDeck.length);
            currentVocab = wrongWordsDeck[wIdx];
            wrongWordsDeck.splice(wIdx, 1);
            console.log(`[Pool 1 - Learning] Wrong word: ${currentVocab.en} (${wrongWordsDeck.length} remaining)`);
        } else {
            // Pool 2: New words (not in mastery)
            const newWords = activeVocabList.filter(word => {
                if (!userMastery[masteryKey]) return true;
                if (!userMastery[masteryKey][selectedLevel]) return true;
                return !userMastery[masteryKey][selectedLevel][word.en];
            });

            if (newWords.length > 0) {
                const randIdx = Math.floor(Math.random() * newWords.length);
                currentVocab = newWords[randIdx];
                console.log(`[Pool 2 - New] Fresh word: ${currentVocab.en} (${newWords.length} new words available)`);
            } else {
                // Pool 3: Review mastered words
                const masteredWords = activeVocabList.filter(word => {
                    if (!userMastery[masteryKey]) return false;
                    if (!userMastery[masteryKey][selectedLevel]) return false;
                    return userMastery[masteryKey][selectedLevel][word.en];
                });

                if (masteredWords.length > 0) {
                    const randIdx = Math.floor(Math.random() * masteredWords.length);
                    currentVocab = masteredWords[randIdx];
                    const masteryData = userMastery[masteryKey][selectedLevel][currentVocab.en];
                    console.log(`[Pool 3 - Review] Mastered word: ${currentVocab.en} (count: ${masteryData.count})`);
                } else {
                    // Fallback: if somehow no words available
                    if (activeVocabList.length === 0) {
                        alert("Error: Database is empty!");
                        return;
                    }
                    const randIdx = Math.floor(Math.random() * activeVocabList.length);
                    currentVocab = activeVocabList[randIdx];
                    console.log(`[Fallback] Random word: ${currentVocab.en}`);
                }
            }
        }
    }

    // ★★★ Handle sentence selection (support both old and new format) ★★★
    if (currentVocab.sents && currentVocab.sents.length > 0) {
        const randSentIndex = Math.floor(Math.random() * currentVocab.sents.length);
        const selectedSent = currentVocab.sents[randSentIndex];

        // Check if new format (object with text and answer)
        if (typeof selectedSent === 'object' && selectedSent.text) {
            currentVocab.sent = selectedSent.text;
            currentVocab.listeningAnswer = selectedSent.answer; // Store the correct answer for listening
            console.log(`[Vocab] Using new format - Sentence: "${selectedSent.text}", Answer: "${selectedSent.answer}"`);
        } else {
            // Old format (plain string)
            currentVocab.sent = selectedSent;
            currentVocab.listeningAnswer = null; // Will use base form
            console.log(`[Vocab] Using old format - Sentence: "${selectedSent}"`);
        }
    } else if (!currentVocab.sent && currentVocab.en) {
        // 如果連一句例句都無，就用個單字本身頂住先
        currentVocab.sent = currentVocab.en;
        currentVocab.listeningAnswer = null;
    }
    
    // 獲取介面元素
    const modal = document.getElementById('launch-modal');
    const qText = document.getElementById('q-text');
    const qDisplay = document.getElementById('q-display');
    const input = document.getElementById('hidden-input');
    const msgArea = document.getElementById('msg-area');
    const timerBar = document.getElementById('timer-bar');
    
    // 重置基本狀態
    msgArea.innerText = "";
    input.value = "";
    
    // 清理舊的 Mic 按鈕 (防止重複)
    const oldMic = document.getElementById('mic-btn');
    if(oldMic) oldMic.remove();

    // 隱藏 instruction container（進入答題版面）
    const instrContainer = document.getElementById('instruction-container');
    if (instrContainer) instrContainer.style.visibility = 'hidden';

    // ★★★ 關鍵：先顯示視窗，再執行後面的 focus，確保鍵盤彈出 ★★★
    modal.style.display = "flex";

    // ★★★ Apply Aurelians theme if player is using Aurelians ★★★
    if (selectedRace === 'AURELIANS') {
        modal.classList.add('aurelians-theme');
    } else {
        modal.classList.remove('aurelians-theme');
    }

    startMatrixEffect();

    // ★★★ 核心：根據模式切換介面 ★★★
if (currentPracticeMode === 'SPEAKING') {
    const textToRead = currentVocab.sent ? currentVocab.sent : currentVocab.en;
    qText.innerText = `READ: ${textToRead}`;
    
    // 字體縮細少少，因為句子比較長
    qText.style.fontSize = "22px"; 
    qText.style.lineHeight = "1.4"; // 增加行距，比較好讀
    qText.style.cursor = "default";
    qText.onclick = null;

    qDisplay.innerText = "(Tap Mic & Read Sentence)";
        qDisplay.style.color = "#94a3b8"; 
        
        input.style.display = 'none'; 

        // 動態加入 Mic 按鈕 (使用你畫的 PNG)
        const micBtn = document.createElement('div');
        micBtn.id = 'mic-btn';
        micBtn.className = 'mic-btn'; 
        micBtn.onclick = startListening;
        
        const container = document.getElementById('timer-bar-container');
        qDisplay.parentNode.insertBefore(micBtn, container);

    } else if (currentPracticeMode === 'LISTENING') {
        // --- B. 聽力模式 (Listening) ---
        fadeBgm(0.1, 800);
        let contentHTML = '';

        // ★★★ Use listeningAnswer if available (new format), otherwise use base form (old format) ★★★
        const targetWord = currentVocab.listeningAnswer || currentVocab.en;
        console.log(`[Listening Display] Using target word: "${targetWord}"`);

        // 1. 顯示句子填空 (如果有句子)
        if (currentVocab.sent) {
            const regex = new RegExp(`\\b${targetWord}\\b`, 'gi');
            // 將目標字換成跟字數一樣長度的動態底線
            const dynamicBlanks = generateSmartBlanks(targetWord);
            const displayHTML = currentVocab.sent.replace(regex, `<span class="listening-blank">${dynamicBlanks}</span>`);
            contentHTML += `<div class="sentence-container">${displayHTML}</div>`;
        } else {
            contentHTML += `<div style="font-family:'Orbitron'; font-size:14px; color:#d946ef; margin-bottom:15px; letter-spacing:2px;">// AUDIO INTERCEPTED //</div>`;
        }

        // 2. 加入高科技喇叭掣 (使用你畫的 PNG)
        const textToRead = currentVocab.sent ? currentVocab.sent : currentVocab.en;
        const safeText = textToRead.replace(/'/g, "\\'");

        contentHTML += `
            <div class="cyber-speaker-btn" onclick="speakText('${safeText}')"></div>
            <div style="font-size:10px; color:#d946ef; margin-top:5px; opacity:0.8; font-family:'Orbitron';">TAP TO REPLAY</div>
        `;

        qText.innerHTML = contentHTML;
        qText.style.cursor = "default";
        qText.onclick = null;

        // 3. 顯示智能底線
        qDisplay.innerHTML = generateSmartBlanks(targetWord);
        qDisplay.style.color = "var(--primary)";

        // 自動讀出整句句子
        setTimeout(() => speakText(textToRead), 300);

    } else {
        // --- C. 閱讀模式 (Reading) ---
        qText.innerText = currentVocab.ch;
        qText.style.fontSize = "";
        qText.style.cursor = "default";
        qText.onclick = null;

        qDisplay.innerHTML = generateSmartBlanks(currentVocab.en);
        qDisplay.style.color = "var(--primary)";
    }

    // ★★★ INPUT & VIRTUAL KEYBOARD CONTROL ★★★
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    // 檢測手機/平板：iOS 或 Android 或 touch device
    // 移除 innerWidth 判斷，避免大平板（iPad Pro）或縮小視窗時誤判
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
                     (navigator.maxTouchPoints > 0 && !window.matchMedia('(pointer: fine)').matches);

    if (isMobile && (currentPracticeMode === 'READING' || currentPracticeMode === 'LISTENING')) {
        // Mobile: Show virtual keyboard initially
        virtualKeyboard.style.display = 'block';
        input.removeAttribute('readonly'); // 允許實體鍵盤輸入
        input.style.position = 'absolute';
        input.style.left = '-9999px';

        // ★★★ 偵測實體鍵盤：如果有 keydown 事件就隱藏虛擬鍵盤 ★★★
        let physicalKeyboardDetected = false;
        const detectPhysicalKeyboard = (e) => {
            // 只在第一次實體鍵盤輸入時隱藏虛擬鍵盤
            if (!physicalKeyboardDetected && e.key && e.key.length === 1) {
                physicalKeyboardDetected = true;
                virtualKeyboard.style.display = 'none';
                console.log('[Keyboard] Physical keyboard detected, hiding virtual keyboard');

                // 調整答題框位置返回中央
                const modal = document.getElementById('launch-modal');
                if (modal) {
                    modal.style.alignItems = 'center';
                    modal.style.paddingTop = '0';
                }
            }
        };
        input.addEventListener('keydown', detectPhysicalKeyboard);

        // ★★★ Apply Aurelians theme if player is using Aurelians ★★★
        if (selectedRace === 'AURELIANS') {
            virtualKeyboard.classList.add('kb-aurelians');
        } else {
            virtualKeyboard.classList.remove('kb-aurelians');
        }

        // ★★★ 檢測平板並加大按鈕（只改大小，唔改 layout）★★★
        const screenWidth = window.innerWidth || screen.width;
        if (screenWidth >= 768) {
            virtualKeyboard.classList.add('kb-tablet-size');
            console.log('[Keyboard] Tablet detected, using larger buttons');
        }

        // ★★★ 調整答題框位置，避免被鍵盤遮住 ★★★
        const modal = document.getElementById('launch-modal');
        if (modal) {
            modal.style.alignItems = 'flex-start';
            modal.style.paddingTop = '5vh';
        }

        // Lock body scroll to prevent page scrolling
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    } else if (!isMobile && (currentPracticeMode === 'READING' || currentPracticeMode === 'LISTENING')) {
        // Desktop: Hide virtual keyboard, show and focus input
        virtualKeyboard.style.display = 'none';
        input.removeAttribute('readonly');
        input.style.position = 'static';
        input.style.left = 'auto';
        setTimeout(() => input.focus(), 10);
    } else {
        // SPEAKING mode: hide virtual keyboard, hide input
        virtualKeyboard.style.display = 'none';
        input.setAttribute('readonly', 'readonly');
        input.style.position = 'absolute';
        input.style.left = '-9999px';
    }

// --- 動畫與倒數 (修正版) ---
    // 1. 先重置條 Bar 做 100% (視覺上準備好)
    timerBar.style.transition = 'none';
    timerBar.style.width = '100%';
    timerBar.offsetHeight; // Trigger reflow
    
    // 2. 確保清除舊 Timer
    if (typeof timerInterval !== 'undefined' && timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // 3. 決定幾時開始計時
    if (currentPracticeMode === 'LISTENING') {
        // ★ Listening 模式：暫停！等 speakText 讀完先開始 (在 onend 觸發) ★
        console.log("WAITING FOR AUDIO TO FINISH...");
    } else {
        // ★ 其他模式 (Reading/Speaking)：延遲 0.5秒 後即刻開始 ★
        setTimeout(() => {
            // 確保視窗仲開緊先計時
            if (document.getElementById('launch-modal').style.display === 'flex') {
                startCountdownTimer();
            }
        }, 500);
    }

} // <--- 記得保留這個函數結束括號
// --- 0. 語音預熱系統 (解決延遲) ---
function warmUpVoiceEngine() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        // 播一段無聲嘅空白音，純粹為咗喚醒個 Engine
        const emptyMsg = new SpeechSynthesisUtterance(" "); 
        emptyMsg.volume = 0; 
        window.speechSynthesis.speak(emptyMsg);
        console.log("🔊 Voice Engine Warmed Up!");
    }
}
    
// --- 修正版：處理輸入超時 ---
function handlePlayerTimeout() {
    if(typeof fadeBgm === 'function') fadeBgm(0.5, 1000);

    if (typeof timerInterval !== 'undefined') clearInterval(timerInterval);
    timerInterval = null;
    launchTimerPaused = false;
    launchTimerTotal = 0;
    launchTimerTimeLeft = 0;
    if (speakingProcessingTimeout) {
        clearTimeout(speakingProcessingTimeout);
        speakingProcessingTimeout = null;
    }
    document.getElementById('launch-modal').style.display = "none";

    // Unlock body scroll when modal closes
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';

    playSound('timeout-sfx');
    stopMatrixEffect();
    
    currentPhase = 'PHASE_SWITCH'; 

    const status = document.getElementById('game-status');
    status.innerHTML = `PHASE: <span style="color:var(--danger)">TIMEOUT - TURN LOST</span>`;
    document.getElementById('control-panel').style.borderColor = "var(--danger)";
    
    if (typeof battleLog !== 'undefined' && typeof currentVocab !== 'undefined') {
        const lastLog = battleLog[battleLog.length - 1];
        const currentTurn = (typeof turnCounter !== 'undefined' ? turnCounter : 1);
        
        let correctContent = currentVocab.en; 
        if (currentPracticeMode === 'SPEAKING' && currentVocab.sent) {
            correctContent = currentVocab.sent;
        }

        // ★ 修正 3：嘗試獲取輸入框殘留的文字 ★
        const inputRaw = document.getElementById('hidden-input').value.trim();
        // 如果有字就顯示字，無字先顯示 (TIMEOUT)
        const userDisplay = inputRaw.length > 0 ? inputRaw : "(TIMEOUT)";

        if (!lastLog || lastLog.turn !== currentTurn) {
            battleLog.push({
                turn: currentTurn,
                user: userDisplay,    // ★ 使用殘留文字
                correct: correctContent,
                isCorrect: false
            });
        }

        // ★ 錯字記錄：Timeout 都算答錯
        saveWrongWord(currentPracticeMode, selectedLevel, currentVocab.en);
    }

    // 3. 邏輯分支 (保持不變)
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

// --- 2. 輸入監聽器 (修正版：保留空格與符號) ---
    document.getElementById('hidden-input').oninput = (e) => {
        // A. 獲取原始輸入 (轉大寫)
        let rawVal = e.target.value.toUpperCase();
        
        // ★ 關鍵修正：這裡的 Regex 必須包含 \s (空格), \- (連字號), \' (撇號)
        // 這樣 "LIVING ROOM" 的空格才不會被吃掉
        let displayVal = rawVal.replace(/[^A-Z0-9\s\-\']/g, '');

        // B. 將「有空格」的版本放回輸入框 (給玩家看，也給 battleLog 存)
        e.target.value = displayVal;

        // C. 生成「純字母」版本 (用來判斷對錯、填格仔)
        // 這裡我們才真正把符號清走，例如 "LIVING ROOM" -> "LIVINGROOM"
        let logicVal = displayVal.replace(/[^A-Z0-9]/g, '');

        // D. 防止打爆格 (用純字母長度去計)
        if (currentVocab && currentVocab.en) {
             // ★★★ For LISTENING mode, use listeningAnswer if available ★★★
             const targetWord = (currentPracticeMode === 'LISTENING' && currentVocab.listeningAnswer)
                 ? currentVocab.listeningAnswer
                 : currentVocab.en;
             const targetClean = targetWord.replace(/[^a-zA-Z0-9]/g, '');
             if (logicVal.length > targetClean.length) {
                 // 如果打多咗，截斷 logicVal
                 logicVal = logicVal.substring(0, targetClean.length);
                 // 注意：這裡不截斷 displayVal，以免刪錯玩家剛打的空格，反正多出的字不會填入格仔
             }
        }

        // E. 音效
        if (e.inputType === 'deleteContentBackward') {
            if(typeof playSound === 'function') playSound('delete-sfx');
        } else {
            if(typeof playSound === 'function') playSound('enter-sfx');
        }

        // F. 更新畫面 (傳入純字母去填窿窿)
        if(typeof updateSmartDisplay === 'function') {
            updateSmartDisplay(logicVal);
        }
    };
    // --- 3. Enter 鍵監聽 (完全保留舊有功能) ---
    document.getElementById('hidden-input').onkeydown = (e) => {
        if (e.key === 'Enter') checkAnswer();
    };

    // --- 4. 智能顯示函數 (核心：將 "WAKEUP" 塞番入去 "WAKE UP" 嘅格仔度) ---
    function updateSmartDisplay(inputVal) {
        let html = "";
        let inputIdx = 0; // 用黎記住用到第幾個玩家輸入嘅字母

        // ★★★ For LISTENING mode, use listeningAnswer if available ★★★
        const targetWord = (currentPracticeMode === 'LISTENING' && currentVocab.listeningAnswer)
            ? currentVocab.listeningAnswer
            : currentVocab.en;

        // 逐個字檢查題目原本格式 (例如 "WAKE UP")
        for (let i = 0; i < targetWord.length; i++) {
            const targetChar = targetWord[i];

            if (targetChar === ' ') {
                // 遇到空格：顯示空白位 (inputIdx 唔郁)
                html += `<span style="display:inline-block; width:20px;"></span>`;
            }
            else if (targetChar === '-' || targetChar === '\'') {
                // 遇到符號：顯示橙色符號 (inputIdx 唔郁)
                html += `<span style="color:var(--warning); font-weight:bold; margin:0 2px; font-size: 24px;">${targetChar}</span>`;
            }
            else {
                // 遇到字母：檢查玩家打咗未
                if (inputIdx < inputVal.length) {
                    // 玩家打咗 -> 顯示該字母 (藍色)
                    html += `<span style="color:var(--primary); font-weight:bold;">${inputVal[inputIdx]}</span> `;
                    inputIdx++; // 消耗一個玩家字母
                } else {
                    // 未打 -> 顯示底線
                    html += `_ `;
                }
            }
        }
        document.getElementById('q-display').innerHTML = html;
    }

    // 為了兼容，將舊名 updateDisplay 指向新函數 updateSmartDisplay
    window.updateDisplay = updateSmartDisplay;

// ★★★ PHASE 4: DYNAMIC XP & MASTERY CALCULATION ★★★
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

    // ★★★ SUPPLIES SYSTEM: Earn supplies for correct answers ★★★
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
    window.userSupplies = userSupplies;
    console.log(`[Supplies] Earned ${suppliesGained} supplies, total: ${userSupplies}`);

    // ★★★ ENERGY SYSTEM: 正確答題 +1 energy (所有種族) ★★★
    if (typeof addEnergy === 'function') {
        addEnergy(1, 'Correct Answer');
    }

    // ★★★ PHASE 5: Track session XP and Supplies ★★★
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

// --- 修正版：核對答案 (智能無視符號) ---
function checkAnswer() {
    const input = document.getElementById('hidden-input');

    // 1. 玩家輸入：轉大寫 + 移除所有空格同標點 (只留 A-Z 同 0-9)
    // 例如輸入 "cup of tea" 或 "cupoftea" 都會變做 "CUPOFTEA"
    const cleanInput = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // 2. 正確答案：同樣處理
    // ★★★ For LISTENING mode, use listeningAnswer if available (new format) ★★★
    let targetAnswer = currentVocab.en;
    if (currentPracticeMode === 'LISTENING' && currentVocab.listeningAnswer) {
        targetAnswer = currentVocab.listeningAnswer;
        console.log(`[Check Answer] Using listeningAnswer: "${targetAnswer}"`);
    }

    // 例如 "high-quality" 會變做 "HIGHQUALITY"
    const cleanTarget = targetAnswer.toUpperCase().replace(/[^A-Z0-9]/g, '');

    const isCorrect = (cleanInput === cleanTarget);

    // ★★★ 記錄 Log 邏輯 (使用 targetAnswer 而非 currentVocab.en) ★★★
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
                correct: targetAnswer,  // ★ Use targetAnswer instead of currentVocab.en
                isCorrect: isCorrect,
                mode: currentPracticeMode,  // ★★★ Add mode for display logic ★★★
                sentence: currentVocab.sent || null  // ★★★ Add sentence for LISTENING mode ★★★
            });
        }
    }

    // ★ 錯字記錄：答啱就移除，答錯就記錄
    if (isCorrect) {
        removeWrongWord(currentPracticeMode, selectedLevel, currentVocab.en);
        // ★★★ PHASE 4: Call XP & Mastery handler ★★★
        handleCorrectAnswer();
    } else {
        saveWrongWord(currentPracticeMode, selectedLevel, currentVocab.en);
    }

    // 結果處理
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

    // --- 10. 攻擊執行 ---
function playerFire(success) {
    fadeBgm(0.5, 1000);
    // 1. 基本清理：停計時器、關閉彈窗
    clearInterval(timerInterval);
    document.getElementById('launch-modal').style.display = "none";

    // Unlock body scroll when modal closes
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';

    stopMatrixEffect();

    if (success) {
        // ============================
        // ★ 分支 A：PVP 對戰模式 ★
        // ============================
        if (gameMode === 'PVP') {
            const { ref, update } = window.firebaseModules;

            // ★★★ ANTI-FARMING: Increment turn count ★★★
            currentTurnCount++;
            console.log(`[PVP] Turn count: ${currentTurnCount}`);

            // 1. 計算下一位係邊個
            const nextTurn = (playerRole === 'host') ? 'guest' : 'host';

            // 2. 更新 Firebase (合併做一次 Update)
            update(ref(db, 'rooms/' + currentRoomId), {
                lastMove: { attacker: playerRole, index: currentTargetIndex, timestamp: Date.now() },
                turn: nextTurn // ★ 強制交更：話畀 DB 知而家輪到下一位！
            });

            // 3. 播放發射動畫
            const cell = document.getElementById('enemy-grid').children[currentTargetIndex];
            cell.classList.add('revealed');
            playSound('laser-sfx');
            triggerAnimation(cell, 'blue');

            // 4. 延遲 0.5秒 顯示結果 (等發射動畫播一陣)
            setGameTimeout(() => {
                if (enemyGrid[currentTargetIndex] === 1) {
                    // --- 打中 (HIT) ---
                    cell.classList.add('hit');
                    triggerAnimation(cell, 'orange');
                    
                    enemyDamage++;
                    
                    // 檢查擊沉
                    const isSunk = checkEnemyShipDestruction(currentTargetIndex);
                    if (!isSunk) playSound('hit-sfx'); // 無沈先播 Hit 聲，沈咗會有 Destroy 聲

                    if (checkGameOver()) return; // 如果贏咗就停
                } else {
                    // --- 打失 (MISS) ---
                    cell.classList.add('miss');
                    cell.innerHTML = '<img src="close.png" class="miss-icon">';
                }

                refreshRadarScanDisplays();

                // ★ 5. 關鍵設定：延長至 3秒 後先轉場 (讓你睇清楚戰果) ★
                setGameTimeout(() => {
                    currentPhase = 'ENEMY_TURN';
                    document.getElementById('game-status').innerHTML = "OPPONENT'S TURN";
                    switchScene('ENEMY'); 
                }, 3000); 

            }, 500);

        } 
        // ============================
        // ★ 分支 B：AI 單機模式 ★
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
                    // AI 模式節奏快啲，維持 0.7秒 轉場
                    setGameTimeout(startEnemyTurn, 700);
                }
            }, 500);
        }
    }
}
// ★ 新增：AI 智能鎖定系統 (當打中時，將周圍格仔加入追擊名單)
function addSmartTargets(index) {
    const targets = [];
    const r = Math.floor(index / GRID_SIZE);
    const c = index % GRID_SIZE;

    // 搵出 上、下、左、右 四個鄰居
    if (r > 0) targets.push(index - GRID_SIZE); // 上
    if (r < GRID_SIZE - 1) targets.push(index + GRID_SIZE); // 下
    if (c > 0) targets.push(index - 1); // 左
    if (c < GRID_SIZE - 1) targets.push(index + 1);

    // (Optional) 隨機打亂次序，令 AI 無咁機械化
    targets.sort(() => Math.random() - 0.5);

    // 將未打過嘅位加入 Stack
    targets.forEach(t => {
        if (!enemyShots.includes(t) && !aiTargetStack.includes(t)) {
            aiTargetStack.push(t);
        }
    });
}
function aiFire() {
    playSound('laser-sfx');
    let t;
    
    // --- 1. 智能選位邏輯 (Smart Targeting) ---
    // 如果 Target Stack 有目標 (即係之前打中過)，優先攻擊嗰啲位
    if (aiTargetStack.length > 0) {
        // 取出最後一個目標 (Pop)
        // 循環直到搵到一個未打過的 (防止重複)
        do {
            if (aiTargetStack.length === 0) break;
            t = aiTargetStack.pop();
        } while (enemyShots.includes(t));
    }
    
    // 如果 Stack 空了 (即係追擊完畢或未打中過)，或者取出的目標原來已經打過
    // 就變回「隨機亂打」
    if (t === undefined || enemyShots.includes(t)) {
        do { t = Math.floor(Math.random() * 100); } while (enemyShots.includes(t));
    }

    enemyShots.push(t);
    
    // --- 2. 執行攻擊 ---
    const cell = document.getElementById('player-grid').children[t];
    cell.classList.add('revealed');
    triggerAnimation(cell, 'blue');
    
    setGameTimeout(() => {
        let isGameOver = false; 

        if (myGrid[t] === 1) { // ★ 打中了！
            cell.classList.add('hit');
            playSound('hit-sfx');
            triggerAnimation(cell, 'orange');
            myDamage++;

            // ★★★ AURELIANS: 戰艦被擊中 +2 energy ★★★
            if (selectedRace === 'AURELIANS' && typeof addEnergy === 'function') {
                addEnergy(2, 'Ship Hit');
            }

            // 加入智能追擊
            addSmartTargets(t);

            // ★★★ 關鍵邏輯：先檢查有無爆船，再決定播邊個聲 ★★★
            // checkMyShipDestruction 必須要回傳 true/false 先有效
            const isDestroyed = checkMyShipDestruction(t);

            if (isDestroyed) {
                playSound('unit-lost-sfx'); // 爆船：播 Unit Lost
                // ★ 擊沉：強烈震動 ★
                document.body.classList.add('screen-shake-sunk');
                setTimeout(() => document.body.classList.remove('screen-shake-sunk'), 800);
            } else {
                playUnderAttackAlert();     // 未爆：播 Under Attack
                // ★ 擊中：輕微震動 ★
                document.body.classList.add('screen-shake-hit');
                setTimeout(() => document.body.classList.remove('screen-shake-hit'), 400);
            }

            if (checkGameOver()) {
                isGameOver = true;
            }
        } else {
            // 打失
            cell.classList.add('miss'); 
            cell.innerHTML = '<img src="close.png" class="miss-icon">';
        }

        document.getElementById('warning-overlay').style.display = 'none';

        if (!isGameOver) {
            setGameTimeout(startPlayerTurn, 700);
        }
    }, 500);
}

function startPlayerTurn() {
        if (currentPhase === 'GAME_OVER') return;
        // ★ 新增：回合數 +1 ★
        turnCounter++;
        document.getElementById('turn-count').innerText = turnCounter;

        // ★★★ VANGUARDS 每個 turn 自動 +1 energy ★★★
        if (selectedRace === 'VANGUARDS') {
            addEnergy(1, 'Turn Start');
        }

        // 切換場景
        currentPhase = 'PLAYER_TURN';
        switchScene('PLAYER');

        // --- 10秒選位倒數 ---
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

    // 檢查全船是否被打中
    const allHit = targetShip.indices.every(idx => {
        const cell = document.getElementById('player-grid').children[idx];
        return cell.classList.contains('hit');
    });

    if (allHit) {
        revealMyShip(targetShip, targetIndex);
        return true; // ★ 關鍵：爆船回傳 true
    }
    return false; // ★ 關鍵：未爆回傳 false
}

 // ★ 最終修復版：顯示我自己嘅戰艦殘骸 (移除 absolute，加入智能檢測) ★
    // ★ 修正版：顯示我自己嘅戰艦殘骸 (並隱藏原本完好嘅船) ★
    function revealMyShip(ship, index) {
    ship.revealed = true;

    // ★★★ 記錄係咪第一次爆 (用於控制動畫) ★★★
    const isFirstReveal = !ship.animationPlayed;
    if (isFirstReveal) {
        ship.animationPlayed = true;
    }

    const grid = document.getElementById('player-grid');
    const container = document.getElementById('player-board');
    const startCell = grid.children[ship.indices[0]];

    // --- 1. 智能測量 (Smart Measurement) ---
    // 檢查棋盤是否隱藏中，如果是，暫時顯示以獲取正確座標
    const isVisible = (container.offsetParent !== null);
    let prevDisplay = '';
    let prevVisibility = '';

    if (!isVisible) {
        prevDisplay = container.style.display;
        prevVisibility = container.style.visibility;
        container.style.visibility = 'hidden'; 
        container.style.display = 'block';     
    }

    // 2. 讀取真實座標
    const cellLeft = startCell.offsetLeft;
    const cellTop = startCell.offsetTop;
    const cellSize = startCell.offsetWidth;

    // 3. 還原棋盤顯示狀態
    if (!isVisible) {
        container.style.display = prevDisplay;
        container.style.visibility = prevVisibility;
    }

    // --- ★ 隱藏原本完好嘅船 (避免重疊顯示) ★ ---
    const originalShipImg = document.getElementById(`board-ship-${index}`);
    if (originalShipImg) {
        originalShipImg.style.display = 'none'; // 隱藏舊圖
    }

    // --- 4. 建立戰損圖片 ---
    const img = document.createElement('img');
    
    // 確保使用對應的 Damaged 圖片
    if (typeof DAMAGED_IMAGES !== 'undefined' && DAMAGED_IMAGES[index]) {
        img.src = DAMAGED_IMAGES[index];
    } else {
        img.src = ship.img; // 如果無戰損圖，用原圖頂住先
    }
    
    img.classList.add('enemy-ship-revealed');

    // ★★★ 只有第一次爆先播動畫 ★★★
    if (!isFirstReveal) {
        img.classList.add('no-animation');
    }

    // 提升層級，確保它蓋在所有東西上面
    img.style.zIndex = "10"; 

    // 計算圖片大細 (包含邊框間隙)
    const pW = cellSize * ship.width + 2 * (ship.width - 1);
    const pH = cellSize * ship.height + 2 * (ship.height - 1);

    img.style.width = pW + 'px';
    img.style.height = pH + 'px';

    // ★★★ 重點修正：直接讀取部署時記錄的方向 ★★★
    // 這樣 2x4 船隻就不會再被錯誤判斷為橫向
    let isVertical = ship.isVertical;

    // (安全措施) 如果 undefined (例如舊存檔)，嘗試用舊方法估算，但 2x4 可能會錯
    if (isVertical === undefined && ship.indices.length > 1) {
         isVertical = (ship.indices[1] === ship.indices[0] + 10);
    }

    img.style.left = cellLeft + 'px';
    img.style.top = cellTop + 'px';

    // 如果是橫放，就需要旋轉圖片
    if (!isVertical) {
        const shift = (pH - pW) / 2;
        img.style.transformOrigin = 'center center';
        img.style.setProperty('--ship-rotation', 'rotate(-90deg)');
        img.style.setProperty('--ship-translate', `translate(${shift}px, -${shift}px)`);
        img.classList.add('horizontal-ship');
    } else {
        img.style.setProperty('--ship-rotation', 'rotate(0deg)');
        img.style.setProperty('--ship-translate', 'translate(0, 0)');
    }
    
    grid.appendChild(img);
    
    playSound('destroy-sfx'); 
}
// ★ 新增全局變數 (請確保放在 global 區域，例如 let enemyShots = []; 附近) ★
// ★ 新增：初始化敵軍狀態欄 ★
// ★ 新版：初始化敵軍狀態欄 (生成能量方塊) ★
    // ★ 2.0 版：根據戰艦形狀生成方塊 ★
    function initEnemyFleetIndicator() {
        const container = document.getElementById('enemy-fleet-indicator');
        container.innerHTML = '';

        // ★★★ 使用 AI 對手的種族配置 ★★★
        const enemyFleet = (gameMode === 'AI') ? getFleetConfig(enemyRace) : FLEET;

        enemyFleet.forEach((ship, index) => {
            const shipBlock = document.createElement('div');
            shipBlock.id = `indicator-ship-${index}`; 
            shipBlock.classList.add('enemy-ship-block');
            
            // ★ 關鍵 1：設定網格闊度 ★
            // 根據船的 width 設定有幾多直行 (columns)
            shipBlock.style.gridTemplateColumns = `repeat(${ship.width}, 1fr)`;

            // ★ 關鍵 2：決定格仔佈局 ★
            // 優先使用垂直佈局 layoutV (如有)，否則就全填滿
            let layout = [];
            
            if (ship.custom && ship.layoutV) {
                // 如果係特殊船 (例如 T型)，用它的 layoutV
                layout = ship.layoutV;
            } else {
                // 如果係普通船，生成一個全係 1 的陣列 (長度 = width * height)
                layout = Array(ship.width * ship.height).fill(1);
            }

            // ★ 關鍵 3：生成格仔 ★
            layout.forEach(status => {
                const cell = document.createElement('div');
                cell.classList.add('indicator-cell');
                
                // 如果 layout 係 0，代表嗰格係空氣 (例如 T型船的缺口)
                if (status === 0) {
                    cell.classList.add('cell-empty');
                }
                
                shipBlock.appendChild(cell);
            });
            
            container.appendChild(shipBlock);
        });
    }

// ★ 新版：更新狀態 (變空心) ★
// ★ 更新狀態 (變空心，忽略透明格) ★
    function updateEnemyIndicator(shipId) {
        const shipBlock = document.getElementById(`indicator-ship-${shipId}`);
        if (shipBlock) {
            // 只選取「非透明」的格仔來變空心
            const cells = shipBlock.querySelectorAll('.indicator-cell:not(.cell-empty)');
            cells.forEach(cell => {
                cell.classList.add('cell-destroyed');
            });
        }
    }

    // ★★★ ENERGY 系統函數 ★★★
    function updateEnergyDisplay() {
        const energyDisplay = document.getElementById('energy-count');
        if (energyDisplay) {
            energyDisplay.innerText = playerEnergy;
        }
    }

    function addEnergy(amount, reason) {
        const startEnergy = playerEnergy;
        const targetEnergy = playerEnergy + amount;

        console.log(`[Energy] +${amount} (${reason}) → Total: ${targetEnergy}`);

        // ★★★ 數字遞增動畫 ★★★
        const duration = 500; // 動畫持續時間 (ms)
        const steps = Math.min(amount, 20); // 最多 20 步，避免太慢
        const stepDuration = duration / steps;
        const increment = amount / steps;

        let currentStep = 0;
        const animationInterval = setInterval(() => {
            currentStep++;
            playerEnergy = Math.round(startEnergy + (increment * currentStep));

            if (currentStep >= steps) {
                playerEnergy = targetEnergy; // 確保最終值正確
                updateEnergyDisplay();
                clearInterval(animationInterval);
                if (typeof updateSkillStates === 'function') updateSkillStates();
            } else {
                updateEnergyDisplay();
            }
        }, stepDuration);

        // ★ 顯示 +Energy 彈出動畫 ★
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
        enemyFleetData = []; // 清空舊數據

        // ★★★ 使用 AI 對手的種族配置 ★★★
        const enemyFleet = (gameMode === 'AI') ? getFleetConfig(enemyRace) : FLEET;

        let p = 0;
        while (p < enemyFleet.length) {
            let r = Math.floor(Math.random() * 100);
            let v = Math.random() > 0.5;
            let idxs = getShipIndices(r, enemyFleet[p], v);
            if (idxs && !idxs.some(x => enemyGrid[x] === 1)) {
                idxs.forEach(x => enemyGrid[x] = 1);

                // ★ 儲存敵人船隻資料 (加入 shipId 以便配對圖片) ★
                enemyFleetData.push({
                    shipId: p, // 記住這是第幾號船 (0-3)
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

    // --- 修改後的動畫函數 (確保動畫在戰艦上面) ---
function triggerAnimation(cell, type) {
    const d = document.createElement('div');

    // ★★★ 根據種族選擇explosion ★★★
    if (type === 'blue') {
        // 檢查玩家種族,Aurelians用金色,其他用藍色
        if (selectedRace === 'AURELIANS') {
            d.classList.add('anim-gold');
        } else {
            d.classList.add('anim-blue');
        }
    }
    if (type === 'orange') d.classList.add('anim-orange');
    
    // ★ 關鍵修改 1：將動畫加到 Board (父層)，而不是 Cell (子層) ★
    // 這樣動畫就可以跟戰艦 (ship-overlay) 在同一個層級競爭
    const board = cell.parentElement; 
    
    // ★ 關鍵修改 2：手動設定動畫的位置和大小 ★
    // 因為移出了 Cell，我們要告訴它 Cell 在哪裡
    d.style.left = cell.offsetLeft + 'px';
    d.style.top = cell.offsetTop + 'px';
    d.style.width = cell.offsetWidth + 'px'; // 確保大小跟格仔一樣 (包含手機版 RWD)
    d.style.height = cell.offsetHeight + 'px';
    
    // ★ 關鍵修改 3：設定極高的 z-index ★
    // 戰艦係 z-index: 6，我哋設定 100 確保一定喺上面
    d.style.zIndex = '100'; 
    
    board.appendChild(d);
    
    // 0.5秒後移除
    setTimeout(() => d.remove(), 500);
}

function playSound(id) {
    const s = document.getElementById(id);
    if(s) {
        s.volume = (typeof gameVolume !== 'undefined' && isFinite(gameVolume.sfx)) ? gameVolume.sfx : 0.5;
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
    if (!sidebar) return; // 安全檢查
    sidebar.innerHTML = '';

    FLEET.forEach((ship, index) => {
        const container = document.createElement('div');
        container.id = `ship-unit-${index}`;
        container.classList.add('fleet-unit');

        // ★★★ 根據選擇的種族加入對應的 class ★★★
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

        // 設定初始狀態
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

// ★★★ PHASE 5: SETTLEMENT CALCULATION ★★★
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
        matchBonus = (gameMode === 'PVP') ? 100 : 50; // Win PVP: +100, Win AI: +50
        if (isPerfect) {
            matchBonus += 150; // Perfection bonus
        }
    } else {
        matchBonus = 20; // Loss: +20
    }

    // Add match bonus to total XP
    userTotalXP += matchBonus;

    // Calculate total session XP
    const totalSessionXP = sessionAnsweringXP + matchBonus;

    // ★★★ Supplies Earned (already tracked in sessionSupplies) ★★★
    const suppliesEarned = sessionSupplies;

    // ★★★ ANTI-FARMING: Check if match is valid (enemy HP <= 5, i.e., dealt 16+ damage) ★★★
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
            matchBonusEl.innerHTML = `+${matchBonus} <span style="color: var(--warning); font-size: 12px;">(+150 PERFECT!)</span>`;
        }
    }
    if (totalXpEl) totalXpEl.innerText = `+${totalSessionXP}`;

    // Sync to Firebase
    if (window.myPlayerId && window.db) {
        const { ref, get, update } = window.firebaseModules;

        // ★★★ PVP STATS TRACKING WITH ANTI-FARMING ★★★
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
                        showNotification('⚠️ This win does NOT count (3+ wins vs this opponent in 24h)', 'warning', 5000);
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

        // --- 情況 A：勝利 (Victory) ---
        if (enemyDamage >= TOTAL_HP) {
            enterGameOverState();
            title.innerText = "VICTORY";
            title.style.color = "var(--success)";
            title.style.textShadow = "0 0 30px var(--success)";
            msg.innerText = "ENEMY FLEET ELIMINATED";

            // 延遲 2.5 秒彈出畫面並播放勝利音效
            setTimeout(() => {
                renderReview();
                // ★★★ PHASE 5: Calculate and display settlement ★★★
                calculateAndDisplaySettlement(true, false);

                // ★ 修改點：播放 victory-sfx ★
                const vSfx = document.getElementById('victory-sfx');
                if(vSfx) { vSfx.currentTime = 0; vSfx.play().catch(e=>{}); }

                screen.style.display = "flex";
                screen.style.animation = "fadeIn 0.5s ease-out";
            }, 2500);

            return true;
        }
        
        // --- 情況 B：戰敗 (Defeat) ---
        if (myDamage >= TOTAL_HP) {
            enterGameOverState();
            title.innerText = "DEFEAT";
            title.style.color = "var(--danger)";
            title.style.textShadow = "0 0 30px var(--danger)";
            msg.innerText = "CRITICAL MISSION FAILURE";

            // 延遲 2.5 秒彈出畫面並播放失敗音效
            setTimeout(() => {
                renderReview();
                // ★★★ PHASE 5: Calculate and display settlement ★★★
                calculateAndDisplaySettlement(false, false);

                // ★ 修改點：播放 lose-sfx ★
                const lSfx = document.getElementById('lose-sfx');
                if(lSfx) { lSfx.currentTime = 0; lSfx.play().catch(e=>{}); }

                screen.style.display = "flex";
                screen.style.animation = "fadeIn 0.5s ease-out";
            }, 2500);

            return true;
        }

        return false;
    }

// ★ 優化版：確認離開/投降 (動態改字) ★
function confirmExit() {
    const lobbyScreen = document.getElementById('lobby-screen');
    
    // 1. 如果在大廳，直接離開，唔使問
    if (lobbyScreen.style.display && lobbyScreen.style.display !== 'none') {
        playSound('delete-sfx');
        resetGame(); 
        return;
    } 

    // 2. 獲取視窗內的文字元素
    const title = document.querySelector('#confirm-modal .tech-warning-title');
    const msg = document.querySelector('#confirm-modal .tech-warning-msg');
    const confirmBtn = document.querySelector('#confirm-modal .tech-btn.confirm');

    // 3. 判斷狀態：決定顯示邊套文字
    if (currentPhase === 'DEPLOY') {
        // --- A. 部署階段 (只是離開) ---
        title.innerText = "⚠ WARNING // ABORT?";
        msg.innerHTML = "ALL MISSION PROGRESS WILL BE LOST.<br>CONFIRM ABORT SEQUENCE?";
        confirmBtn.innerText = "CONFIRM ABORT";
    } else {
        // --- B. 戰鬥階段 (投降) ---
        title.innerText = "⚠ WARNING // SURRENDER?";
        msg.innerHTML = "YOU ARE ABOUT TO SURRENDER THIS MISSION.<br>THIS WILL BE RECORDED AS A DEFEAT.";
        confirmBtn.innerText = "CONFIRM SURRENDER";
    }

    // 4. 顯示視窗 & 播聲
    document.getElementById('confirm-modal').style.display = 'flex';
    playSound('wrong-sfx'); 
}
// ★ 補回這個函數，否則兩個掣都會死火 ★
// ★ 修正版：關閉確認窗 (播放取消聲) ★
    function closeConfirmModal() {
        playSound('delete-sfx'); // 播 Delete 聲
        document.getElementById('confirm-modal').style.display = 'none';
    }

// ★ 修正版：執行放棄/投降 (區分 部署中 vs 戰鬥中) ★
function executeAbort() {
    // 1. 關閉確認視窗
    document.getElementById('confirm-modal').style.display = 'none';

    // 2. 判斷當前階段
    // 如果還在大廳，或者還在部署船隻 (DEPLOY)，就直接重置 (當作退出)
    if (currentPhase === 'DEPLOY' || document.getElementById('lobby-screen').style.display !== 'none') {
        playSound('delete-sfx');
        resetGame();
    } 
    else {
        // ★★★ 戰鬥中投降 (SURRENDER) ★★★
        
        // A. 處理 PVP 數據 (通知對手我投降)
        if (gameMode === 'PVP' && currentRoomId) {
            const { ref, update } = window.firebaseModules;
            const opponentRole = (playerRole === 'host') ? 'guest' : 'host';
            update(ref(db, 'rooms/' + currentRoomId), {
                winner: opponentRole,
                endReason: 'surrendered'
            });
        }

        // B. 觸發本地戰敗流程 (唔好 Reset 住！)
        
        // 1. 停止所有計時器 (費事背景仲倒數緊)
        if (turnTimerInterval) clearInterval(turnTimerInterval);
        if (timerInterval) clearInterval(timerInterval);

        // ★ 關鍵修正：清除所有排隊中嘅 AI 動作 (startEnemyTurn / aiFire 等)
        if (typeof gameTimeouts !== 'undefined') {
            gameTimeouts.forEach(id => clearTimeout(id));
            gameTimeouts = [];
        }
        
        // 2. 生成戰後報告 (這就是你要的！)
        if(typeof renderReview === 'function') renderReview();

        // ★★★ PHASE 5: Calculate and display settlement (Surrender = no bonus) ★★★
        calculateAndDisplaySettlement(false, true);

        // 3. 設定 End Screen 文字
        document.getElementById('end-title').innerText = "DEFEAT";
        document.getElementById('end-title').style.color = "var(--danger)";
        document.getElementById('end-title').style.textShadow = "0 0 30px var(--danger)";
        document.getElementById('end-msg').innerText = "MISSION ABORTED // SURRENDERED";

        // 4. 顯示畫面 & 播片
        document.getElementById('end-screen').style.display = "flex";
        playSound('lose-sfx');
        
        // 5. 鎖死遊戲狀態
        currentPhase = 'GAME_OVER';
    }
}

function resetGame() {
    battleLog = [];
    pvpRaceSelectionShown = false;
    isEnteringPVPDeploy = false;
    latestPVPSetupData = null;
    
    // UI 重置
    const exitBtn = document.getElementById('game-exit-btn');
    if(exitBtn) { exitBtn.innerText = "EXIT"; }

    const lobbyMsg = document.getElementById('lobby-msg');
    if (lobbyMsg) lobbyMsg.innerText = "";
    resetLobbyScreenState();
    
    const roomInput = document.getElementById('room-id-input');
    if (roomInput) roomInput.value = ""; 
    
    // --- 1. 斷開 Firebase 連線 & 清理房間 ---
    if (unsubscribeRoom) { unsubscribeRoom(); unsubscribeRoom = null; }
    if (battleUnsubscribe) { battleUnsubscribe(); battleUnsubscribe = null; }
    
    if (currentRoomId) {
        const { ref, off, remove, update } = window.firebaseModules;
        
        // 停止監聽
        off(ref(db, 'rooms/' + currentRoomId));

        if (playerRole === 'host') {
            // Host 離開 -> 刪除整間房 (大家一齊斷)
            console.log("Host leaving -> Removing Room: " + currentRoomId);
            if (typeof remove === 'function') {
                remove(ref(db, 'rooms/' + currentRoomId));
            }
        } else if (playerRole === 'guest') {
            // ★★★ 新增：Guest 離開 -> 將 guest 欄位變回 null (通知 Host 我走了) ★★★
            console.log("Guest leaving -> Updating Room Status");
            if (typeof update === 'function') {
                update(ref(db, 'rooms/' + currentRoomId), {
                    guest: null,
                    status: 'waiting', // 變回 waiting 狀態
                    guestReady: null,  // 清除準備狀態
                    guestBoard: null
                });
            }
        }
    }
    
    // 重置變數
    currentRoomId = null;
    playerRole = null;
    currentOpponentId = null;

    // --- (以下保持不變) ---
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
    // ★★★ 隱藏底部 Battle HUD ★★★
    const battleHud = document.getElementById('battle-hud');
    if (battleHud) battleHud.style.display = 'none'; 
    
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('start-screen').style.opacity = '1';

    myGrid.fill(0);
    enemyGrid.fill(0);
    enemyShots = [];
    aiTargetStack = []; 
    radarScannedCells.clear();
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

    // ★★★ 重置 Energy ★★★
    playerEnergy = 0;
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
    document.getElementById('control-panel').style.borderColor = "var(--primary)";
    
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
    
function handleTurnTimeout() {
    // ★★★ 關鍵修正：一超時即刻鎖死狀態，防止玩家在轉場期間偷雞再打 ★★★
    currentPhase = 'TIMEOUT_LOCKED'; 

    document.getElementById('turn-timer-container').style.visibility = 'hidden';
    playSound('timeout-sfx');
    
    const status = document.getElementById('game-status');
    status.innerHTML = `PHASE: <span style="color:var(--danger)">TOO SLOW! TURN SKIPPED</span>`;
    document.getElementById('control-panel').style.borderColor = "var(--danger)";

    if (gameMode === 'PVP') {
        const { ref, update } = window.firebaseModules;
        // 通知對手我 Skip 咗
        update(ref(db, 'rooms/' + currentRoomId), {
            lastMove: { attacker: playerRole, index: -1, timestamp: Date.now() }
        });
        
        setGameTimeout(() => {
            currentPhase = 'ENEMY_TURN'; // 轉場完成，正式交更
            document.getElementById('game-status').innerHTML = "OPPONENT'S TURN";
            switchScene('ENEMY');
        }, 1500);
    } else {
        // AI 模式
        setGameTimeout(() => {
            // startEnemyTurn 裡面會將 phase 設定為 ENEMY_TURN
            startEnemyTurn(); 
        }, 1500);
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
            
            // ★ 修改重點：這裡統一顯示「進度」同「時間」 ★
            // 格式：DEPLOY: SHIP 1/4 [ 59s ]
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

// ★★★ AUTO DEPLOY FUNCTION ★★★
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

// ★★★ Helper function to deploy remaining ships ★★★
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

// 顯示高科技通知框
    let _notifTimer = null;
    function showNotification(text, type = 'success', duration = 3000) {
        const box = document.getElementById('tech-notification');
        const title = document.getElementById('notif-title');
        const content = document.getElementById('notif-content');

        // 清除上一個 timer，防止提早消失
        if (_notifTimer) clearTimeout(_notifTimer);

        // 設定內容
        content.innerText = text;

        // 設定顏色 (綠色=Success, 紅色=Alert)
        if (type === 'success') {
            box.style.borderColor = 'var(--success)';
            title.style.color = 'var(--success)';
            title.innerText = "SYSTEM // CONNECTED";
            playSound('deploy-sfx'); // 播放音效
        } else {
            box.style.borderColor = 'var(--danger)';
            title.style.color = 'var(--danger)';
            title.innerText = "SYSTEM // ALERT";
            playSound('wrong-sfx');
        }

        // 顯示 (滑下來)
        box.classList.add('active');

        // 自動收番埋去
        _notifTimer = setTimeout(() => {
            box.classList.remove('active');
            _notifTimer = null;
        }, duration);
    }
// 設定「斷線遺囑」
    function setupDisconnectHandler() {
        const { ref, onDisconnect, update } = window.firebaseModules;
        const roomRef = ref(db, 'rooms/' + currentRoomId);
        
        // 對手是誰？
        const opponentRole = (playerRole === 'host') ? 'guest' : 'host';

        // 設定 onDisconnect：如果我斷線，Update 房間數據，判對方贏
        onDisconnect(roomRef).update({
            winner: opponentRole,
            endReason: 'disconnected'
        });
    }
// 1. 處理 PVP 收到的敵人艦隊數據
    function processEnemyFleetData(shipsData) {
        enemyFleetData = [];
        if(!shipsData) return;
        
        shipsData.forEach(ship => {
            if(!ship.indices) return;
            const root = ship.indices[0];
            // 推算方向
            let isV = false;
            if (ship.indices.length > 1) {
                isV = (ship.indices[1] === root + GRID_SIZE);
            }
            
            enemyFleetData.push({
                shipId: ship.shipId, // 從對手那邊收到的 ID
                indices: ship.indices,
                conf: FLEET[ship.shipId], // 取得基本設定
                rootIndex: root,
                isVertical: isV,
                revealed: false
            });
        });
    }

  // 2. 檢查戰艦是否全滅 (修改版：會回傳 true/false)
    function checkEnemyShipDestruction(hitIdx) {
        const ship = enemyFleetData.find(s => s.indices.includes(hitIdx));
        if (!ship || ship.revealed) return false; // 無船或已現形

        // 檢查該船所有部分是否都已經係 'hit'
        const allHit = ship.indices.every(idx => {
            const cell = document.getElementById('enemy-grid').children[idx];
            return cell.classList.contains('hit');
        });

        if (allHit) {
            revealEnemyShip(ship);
updateEnemyIndicator(ship.shipId);
            return true; // ★ 關鍵：回傳「係，沉咗！」
        }
        return false; // 未沉
    }


// ★ 最終修正版：顯示敵軍戰艦殘骸 (包含 T型船 橫向偏移修復) ★
function revealEnemyShip(ship) {
    ship.revealed = true;

    // ★★★ 記錄係咪第一次爆 (用於控制動畫) ★★★
    const isFirstReveal = !ship.animationPlayed;
    if (isFirstReveal) {
        ship.animationPlayed = true;
    }

    const board = document.getElementById('enemy-grid');
    const container = document.getElementById('enemy-board'); 

    // 安全檢查
    if (!ship.rootIndex && ship.rootIndex !== 0) return;
    const startCell = board.children[ship.rootIndex];
    if (!startCell) return;

    // --- 1. 智能測量 (Smart Measurement) ---
    const isVisible = (container.offsetParent !== null);
    let prevDisplay = '';
    let prevVisibility = '';

    if (!isVisible) {
        prevDisplay = container.style.display;
        prevVisibility = container.style.visibility;
        container.style.visibility = 'hidden'; 
        container.style.display = 'block';     
    }

    // 2. 讀取真實座標 & 大細
    const cellLeft = startCell.offsetLeft;
    const cellTop = startCell.offsetTop;
    const cellSize = startCell.offsetWidth; 

    // 3. 還原狀態
    if (!isVisible) {
        container.style.display = prevDisplay;
        container.style.visibility = prevVisibility;
    }

    // --- 4. 建立圖片 ---
    const img = document.createElement('img');

    // ★★★ 圖片來源設定：AI 模式使用 ENEMY_DAMAGED_IMAGES ★★★
    const damagedImages = (gameMode === 'AI') ? ENEMY_DAMAGED_IMAGES : DAMAGED_IMAGES;
    if (typeof damagedImages !== 'undefined' && damagedImages[ship.shipId]) {
        img.src = damagedImages[ship.shipId];
    } else {
        img.src = ship.conf.img;
    }
    
    img.classList.add('enemy-ship-revealed');

    // ★★★ 只有第一次爆先播動畫 ★★★
    if (!isFirstReveal) {
        img.classList.add('no-animation');
    }

    const conf = ship.conf;
    const pW = cellSize * conf.width + 2 * (conf.width - 1);
    const pH = cellSize * conf.height + 2 * (conf.height - 1);
    
    img.style.width = pW + 'px'; 
    img.style.height = pH + 'px';
    
    img.style.left = cellLeft + 'px';
    img.style.top = cellTop + 'px';

    // Transform 修正 (旋轉)
    if (!ship.isVertical) {
        const shift = (pH - pW) / 2;
        img.style.transformOrigin = 'center center';
        img.style.setProperty('--ship-rotation', 'rotate(-90deg)');
        img.style.setProperty('--ship-translate', `translate(${shift}px, -${shift}px)`);
        img.classList.add('horizontal-ship');
    } else {
        img.style.setProperty('--ship-rotation', 'rotate(0deg)');
        img.style.setProperty('--ship-translate', 'translate(0, 0)');
    }

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
}

function handlePVPMatchSetupSnapshot(data) {
    if (!data) {
        if (isEnteringPVPDeploy || currentPhase === 'GAME_OVER') return;
        showNotification('ROOM CLOSED', 'error');
        playSound('wrong-sfx');
        setTimeout(() => resetGame(), 1500);
        return;
    }

    latestPVPSetupData = data;
    syncPVPSetupFromRoom(data);
    updatePVPBriefingPanel(data);

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

// A. 預先載入靚聲
function loadVoices() {
    const voices = synth.getVoices();
    // ★ 優先選擇英文語音，避免系統語言干擾 ★
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


// 9. 核心監聽器 (修正版：修復 Guest Login 同 Logout 卡死問題)
window.addEventListener('load', () => {
    createTwinklingStars();
    
    // ★ 1. 確保隨機名生成器存在 (如果未有，就在這裡定義)
    if (typeof generateGuestId !== 'function') {
        window.generateGuestId = function() {
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const l1 = letters.charAt(Math.floor(Math.random() * letters.length));
            const l2 = letters.charAt(Math.floor(Math.random() * letters.length));
            const nums = Math.floor(100 + Math.random() * 900); 
            return `${l1}${l2}${nums}`; 
        };
    }

    // 2. 極速登入檢查 (Cache Check)
    const cachedName = localStorage.getItem('battleship_username');
    const cachedUid = localStorage.getItem('battleship_auth_uid');
    if (cachedName && cachedUid) {
        console.log("🚀 FAST LOGIN: Found cached user -> " + cachedName);
        // ★★★ CRITICAL FIX: Clear XP before updateHUD to prevent inheritance ★★★
        window.userTotalXP = 0;
        window.userMastery = { reading: {}, listening: {}, speaking: {} };
        window.userSupplies = 0;
        if (typeof userTotalXP !== 'undefined') userTotalXP = 0;
        if (typeof userMastery !== 'undefined') userMastery = { reading: {}, listening: {}, speaking: {} };
        if (typeof userSupplies !== 'undefined') userSupplies = 0;
        console.log('[FAST LOGIN] Cleared XP data before updateHUD');
        updateHUD(cachedName);
    }

    // 3. ★★★ 關鍵修復：同步 Module Scope 嘅 Firebase 變數到 Regular Script Scope ★★★
    // Module <script type="module"> 入面嘅 const db, auth 同 Regular Script 入面嘅 let db, auth 係兩個唔同嘅變數！
    // Module 已經初始化咗 Firebase 並放咗入 window.db / window.auth
    // 呢度將佢地 sync 返入 let-scoped 變數，等 createRoom() / joinRoom() 等函數用得到
    db = window.db;
    auth = window.auth;
    myPlayerId = window.myPlayerId || null;

    // ★ 同步 XP & Mastery 從 Module Scope
    userTotalXP = window.userTotalXP || 0;
    userMastery = window.userMastery || { reading: {}, listening: {}, speaking: {} };
    userSupplies = window.userSupplies || 0;

    // 4. 同步 myPlayerId (因為 onAuthStateChanged 可能仲未 fire)
    // 加一個輕量級 listener 確保 let-scoped myPlayerId 永遠同步
    if (window.firebaseModules && auth) {
        window.firebaseModules.onAuthStateChanged(auth, (u) => {
            if (u) {
                myPlayerId = u.uid;
                // 同步更新 player-id-display (如果存在)
                const pidEl = document.getElementById('player-id-display');
                if (pidEl) {
                    const displayName = localStorage.getItem('battleship_username');
                    const cachedUid = localStorage.getItem('battleship_auth_uid');
                    pidEl.innerText = (cachedUid === u.uid ? displayName : null) || u.uid.substring(0, 8).toUpperCase();
                }
                // ★ 同步 XP & Mastery
                userTotalXP = window.userTotalXP || 0;
                userMastery = window.userMastery || { reading: {}, listening: {}, speaking: {} };
                userSupplies = window.userSupplies || 0;
            } else {
                myPlayerId = null;
                userTotalXP = 0;
                userMastery = { reading: {}, listening: {}, speaking: {} };
                userSupplies = 0;
            }
        });
    }
    });
    
// --- 修改後的 Carousel 控制邏輯 ---

// --- ★★★ CAROUSEL 箭嘴智能隱藏系統 (最終整合版) ★★★ ---

// 1. 捲動函數 (已加入檢查邏輯)
function scrollMenu(direction) {
    const track = document.getElementById('game-mode-selection');
    if (!track) return;
    
    // 搵出卡片闊度
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
    
    // ★ 關鍵升級：捲動後稍微延遲 0.3秒 才檢查，確保動畫完成後狀態準確 ★
    setTimeout(checkArrows, 300);
}

// 2. 檢查箭嘴是否需要隱藏 (核心邏輯)
function checkArrows() {
    const track = document.getElementById('game-mode-selection');
    const leftArrow = document.querySelector('.nav-arrow.left');
    const rightArrow = document.querySelector('.nav-arrow.right');

    if (!track || !leftArrow || !rightArrow) return;

    // A. 檢查左邊 (ScrollLeft 是否接近 0)
    // 使用 10px 容錯，防止小數點誤差
    if (track.scrollLeft <= 10) {
        leftArrow.style.opacity = '0';
        leftArrow.style.visibility = 'hidden'; // 確保隱藏後按不到
        leftArrow.style.pointerEvents = 'none';
    } else {
        leftArrow.style.opacity = '1';
        leftArrow.style.visibility = 'visible';
        leftArrow.style.pointerEvents = 'auto';
    }

    // B. 檢查右邊 (ScrollLeft + clientWidth 是否接近 scrollWidth)
    // 邏輯：目前捲動位置 + 視窗闊度 >= 總內容長度 - 容錯值
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

// 3. 啟動監聽器 (必須呼叫此函數！)
function initCarouselControl() {
    const track = document.getElementById('game-mode-selection');
    if (track) {
        // 當使用者自己用手指滑動時，都要檢查
        track.addEventListener('scroll', checkArrows);
        // 初始化檢查一次
        checkArrows();
    }
}


// ★ 最後記得：在 showMainMenu() 函數最尾加一句：
// setupCarouselObserver();

function generateGuestId() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const l1 = letters.charAt(Math.floor(Math.random() * letters.length));
    const l2 = letters.charAt(Math.floor(Math.random() * letters.length));
    const nums = Math.floor(100 + Math.random() * 900); // 100-999
    return `${l1}${l2}${nums}`; // 例如: AK479
}
// ★★★ 新增：生成隨機閃爍背景星星 (更新版：慢速 + 十字星) ★★★
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
        
        // 加入通用 class
        star.classList.add('star-item');
        star.classList.add('star-dot');

        // 普通發光星點：細細粒但有少少隨機大細
        const size = Math.random() * 2.5 + 1.5;
        star.style.width = size + 'px';
        star.style.height = size + 'px';

        // 少量彩色星：大約 8%，其餘保持白色
        const useColoredStar = Math.random() < 0.08;
        const starRgb = useColoredStar
            ? starColors[Math.floor(Math.random() * (starColors.length - 1)) + 1]
            : starColors[0];
        star.style.setProperty('--star-rgb', starRgb);
        
        // 隨機位置
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // ★ 隨機動畫延遲 (0 - 10秒)，令佢地唔會一齊閃
        const delay = Math.random() * 10;
        
        // ★ 減慢閃爍速度 (4 - 9秒 一個循環)
        const duration = Math.random() * 5 + 4; 

        star.style.left = x + '%';
        star.style.top = y + '%';
        
        // 應用動畫
        star.style.animation = `twinkleAnim ${duration}s infinite ease-in-out ${delay}s`;

        container.appendChild(star);
    }
}
    // ★★★ 新增：智能格式化工具 (幫 Input 補回空格同 Hyphen) ★★★
function formatDisplayInput(userRaw, targetCorrect) {
    // 防錯檢查
    if (!userRaw || userRaw === "(TIMEOUT)") return userRaw;
    if (!targetCorrect) return userRaw;

    let result = "";
    let rawIndex = 0;
    
    // 遍歷正確答案的每一個字 (作為樣板)
    for (let i = 0; i < targetCorrect.length; i++) {
        const targetChar = targetCorrect[i];
        
        // 如果樣板是「符號」(空格, -, ')，直接加落去結果度
        if (/[^a-zA-Z0-9]/.test(targetChar)) {
            result += targetChar;
            
            // ★ 關鍵：如果玩家自己本身都有打個符號，就要消耗掉 (避免重複變 living  room)
            if (rawIndex < userRaw.length && userRaw[rawIndex] === targetChar) {
                rawIndex++;
            }
        } else {
            // 如果樣板是「字母」，就由玩家輸入度拎一個字填落去
            if (rawIndex < userRaw.length) {
                result += userRaw[rawIndex];
                rawIndex++;
            }
        }
    }
    
    // 如果玩家打多咗字 (例如打錯)，將剩低嘅字加番係尾
    if (rawIndex < userRaw.length) {
        result += userRaw.substring(rawIndex);
    }
    
    return result;
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

        // ★ 修正 2：強制轉小寫 (除非係 TIMEOUT 字眼) ★
let displayUser = log.user;
if (displayUser !== "(TIMEOUT)") {
    displayUser = displayUser.toLowerCase();
    displayUser = formatDisplayInput(displayUser, log.correct);
}

        // ★ 修正 1：套用 .review-meaning 樣式 ★
        // ★★★ For LISTENING mode, show full sentence with highlighted answer ★★★
        let correctDisplay = log.correct;
        if (log.mode === 'LISTENING' && log.sentence) {
            // Show full sentence with answer word highlighted in orange
            const answerWord = log.correct;
            const sentence = log.sentence;
            const regex = new RegExp(`\\b(${answerWord})\\b`, 'gi');
            correctDisplay = sentence.replace(regex, '<span style="color: var(--warning);">$1</span>');
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
// ★★★ 新增：智能底線生成器 (處理空格、Hyphen、撇號) ★★★
function generateSmartBlanks(text) {
    let html = '';
    // 逐個字檢查
    for (let char of text) {
        if (char === ' ') {
            // 空格：顯示寬一點的空白，唔好畫底線
            html += `<span style="display:inline-block; width:20px;"></span>`;
        } else if (char === '-' || char === '\'') {
            // Hyphen 或撇號：顯示橙色符號
            html += `<span style="color:var(--warning); font-weight:bold; margin:0 2px; font-size: 24px;">${char}</span>`;
        } else {
            // 字母：顯示正常底線
            html += `_ `;
        }
    }
    return html;
}
// --- 最終修正版：選擇技能 (PVP 救星) ---
async function selectSkill(skill) {
    console.log("Skill Selected:", skill);
    currentPracticeMode = skill;
    playSound('deploy-sfx');
    const lobbyScreen = document.getElementById('lobby-screen');
    if (lobbyScreen) lobbyScreen.style.display = 'none';

    // 1. 預熱語音 (Listening 專用)
    if (skill === 'LISTENING') {
        if (typeof warmUpVoiceEngine === 'function') warmUpVoiceEngine();
    }

    // 2. ★ 載入錯字 (Local Storage) ★
    // 確保錯字功能運作
    if (typeof loadMissedWordsToPriorityDeck === 'function') {
        loadMissedWordsToPriorityDeck(skill);
    }

    // 3. 隱藏 Skill 畫面
    document.getElementById('skill-screen').style.display = 'none';

    if (tempGameMode === 'AI') {
        // 4. ★★★ AI 流程：跳去種族選擇畫面 ★★★
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

    // 4. ★★★ PVP 流程：揀完 Training Module 後直接開房 ★★★
    gameMode = 'PVP';
    showPVPWaitingState('OPENING ROOM...', 'var(--warning)');
    if (typeof createRoom === 'function') {
        createRoom();
    }
}

// ★★★ 新增：種族選擇函數 ★★★
let selectedRace = 'VANGUARDS'; // 預設種族（玩家）
let enemyRace = 'VANGUARDS'; // AI 對手種族
let unlockedRaces = ['VANGUARDS']; // 預設解鎖 Vanguards
window.unlockedRaces = unlockedRaces;

function selectRace(race) {
    const btn = document.getElementById(`race-btn-${race.toLowerCase()}`);
    const supplies = window.userSupplies || 0;

    // 如果是 Vanguards，直接選擇（免費且預設解鎖）
    if (race === 'VANGUARDS') {
        confirmRaceSelection(race);
        return;
    }

    // 檢查是否已經解鎖
    const isUnlocked = unlockedRaces.includes(race);

    if (isUnlocked) {
        // 已解鎖，直接選擇
        confirmRaceSelection(race);
        return;
    }

    // 未解鎖，檢查 supplies
    if (supplies < 15000) {
        // 不夠 supplies
        playSound('wrong-sfx');
        showSuppliesNeededAnimation(race);
        return;
    }

    // 夠 supplies，顯示解鎖確認視窗
    showRaceUnlockConfirmation(race);
}

// ★★★ 確認種族選擇並繼續遊戲 ★★★
function confirmRaceSelection(race) {
    selectedRace = race;
    console.log("Race Selected:", race);
    playSound('deploy-sfx');

    // ★★★ 重新載入對應種族的戰艦配置 ★★★
    FLEET = getFleetConfig(race);
    DAMAGED_IMAGES = getDamagedImages(race);
    console.log('[Race] Loaded fleet config for:', race);

    // ★★★ UPDATE PLAYER BOARD STYLING BASED ON RACE ★★★
    const playerBoard = document.getElementById('player-board');
    if (playerBoard) {
        // Remove all race classes
        playerBoard.classList.remove('race-vanguards', 'race-aurelians', 'race-caustics');
        // Add current race class
        playerBoard.classList.add(`race-${race.toLowerCase()}`);
        console.log('[Race] Updated player board styling for:', race);
    }

    // 隱藏種族畫面
    document.getElementById('race-screen').style.display = 'none';

    // 核心分流邏輯
    if (tempGameMode === 'AI') {
        // --- AI 模式：隨機選擇 AI 種族並開始遊戲 ---
        gameMode = 'AI';

        // ★★★ 隱藏共用黑色底層 ★★★
        const overlay = document.getElementById('selection-overlay');
        if (overlay) overlay.style.display = 'none';

        // ★★★ 隨機選擇 AI 對手種族 ★★★
        const availableRaces = ['VANGUARDS', 'AURELIANS'];
        enemyRace = availableRaces[Math.floor(Math.random() * availableRaces.length)];
        console.log('[AI Race] Enemy race selected:', enemyRace);

        // ★★★ 載入 AI 對手的受損圖片 ★★★
        ENEMY_DAMAGED_IMAGES = getDamagedImages(enemyRace);

        // ★★★ 重新擺放 AI 戰艦（使用正確的種族配置）★★★
        enemyGrid = Array(100).fill(0); // 清空棋盤
        if (typeof placeEnemyShips === 'function') {
            placeEnemyShips();
        }

        enterGameUI();
    } else {
        // --- PVP 模式：鎖定種族，等對手揀完 ---
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

// ★★★ 顯示種族解鎖確認視窗 ★★★
function showRaceUnlockConfirmation(race) {
    const raceName = race.charAt(0) + race.slice(1).toLowerCase();
    const required = 15000;

    // 決定邊框顏色
    let borderColor = '#EEE8AA'; // Aurelians PaleGoldenrod
    if (race === 'CAUSTICS') {
        borderColor = '#c084fc'; // Caustics 紫色
    }

    // 創建確認視窗
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

// ★★★ 確認解鎖種族 ★★★
function confirmRaceUnlock(race) {
    const required = 15000;
    const supplies = window.userSupplies || 0;

    // 扣除 supplies
    userSupplies -= required;
    window.userSupplies = userSupplies;

    // 加入到已解鎖列表
    if (!unlockedRaces.includes(race)) {
        unlockedRaces.push(race);
        window.unlockedRaces = unlockedRaces;
    }

    // 同步到 Firebase
    const { ref, update } = window.firebaseModules;
    if (myPlayerId && db) {
        update(ref(db, 'users/' + myPlayerId), {
            supplies: userSupplies,
            unlockedRaces: unlockedRaces
        }).then(() => {
            console.log(`[Supplies] Unlocked ${race}, remaining supplies: ${userSupplies}`);
            updateSuppliesDisplay();
            updateRaceButtons(); // 更新按鈕狀態
        }).catch(err => {
            console.error('[Supplies] Failed to sync unlock:', err);
        });
    }

    // 關閉視窗
    closeRaceUnlockModal();

    // 繼續選擇種族
    confirmRaceSelection(race);
}

// ★★★ 關閉解鎖確認視窗 ★★★
function closeRaceUnlockModal() {
    const modal = document.getElementById('race-unlock-modal');
    if (modal) {
        playSound('delete-sfx');
        modal.remove();
    }
}

// ★★★ 更新種族按鈕鎖定狀態 ★★★
function updateRaceButtons() {
    // Vanguards - 永遠解鎖且光亮
    const vanguardsBtn = document.getElementById('race-btn-vanguards');
    if (vanguardsBtn) {
        vanguardsBtn.classList.remove('locked');
    }

    // Aurelians - 根據解鎖狀態決定光暗
    const aureliansBtn = document.getElementById('race-btn-aurelians');
    if (aureliansBtn) {
        if (unlockedRaces.includes('AURELIANS')) {
            aureliansBtn.classList.remove('locked');
        } else {
            aureliansBtn.classList.add('locked');
        }
    }

    // Caustics - 根據解鎖狀態決定光暗
    const causticsBtn = document.getElementById('race-btn-caustics');
    if (causticsBtn) {
        if (unlockedRaces.includes('CAUSTICS')) {
            causticsBtn.classList.remove('locked');
        } else {
            causticsBtn.classList.add('locked');
        }
    }
}

// ★★★ 顯示 "需要更多補給" 動畫 ★★★
function showSuppliesNeededAnimation(race) {
    const supplies = window.userSupplies || 0;
    const required = 15000;
    const needed = required - supplies;

    // 使用系統通知顯示
    if (typeof showNotification === 'function') {
        showNotification(`${needed.toLocaleString()} MORE SUPPLIES NEEDED`, 'error', 5000);
    }
}

// ★★★ 返回按鈕處理 ★★★
function handleRaceBack() {
    playSound('delete-sfx');
    document.getElementById('race-screen').style.display = 'none';
    const skillScreen = document.getElementById('skill-screen');
    skillScreen.style.display = 'flex';
    // ★★★ Trigger holoAppear animation ★★★
    skillScreen.style.animation = 'none';
    setTimeout(() => {
        skillScreen.style.animation = 'holoAppear 0.4s forwards';
    }, 10);
}

function handleSkillBack() {
    playSound('delete-sfx');
    document.getElementById('skill-screen').style.display = 'none';

    if (tempGameMode === 'AI') {
        // AI: 返回主選單
        showMainMenu();
    } else {
        // PVP: 返回 Level 選擇 (因為流程是 Level -> Skill)
        const levelScreen = document.getElementById('level-screen');
        levelScreen.style.display = 'flex';
        // ★★★ Trigger holoAppear animation on content wrapper ★★★
        const wrapper = levelScreen.querySelector('.panel-content-wrapper');
        if (wrapper) {
            wrapper.style.animation = 'none';
            setTimeout(() => {
                wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
            }, 10);
        }
    }
}

// --- 2. 玩家說話 (Speech-to-Text) - 用於 Speaking Mode ---
function startListening() {
    // 檢查瀏覽器支唔支援
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Microphone API not supported (Try Chrome/Safari).");
        return;
    }

    if (!recognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false; // 只取最終結果
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            if (speakingProcessingTimeout) {
                clearTimeout(speakingProcessingTimeout);
                speakingProcessingTimeout = null;
            }
            launchTimerPaused = false;
            document.getElementById('mic-btn').classList.add('recording');
            document.getElementById('msg-area').innerText = "LISTENING... SPEAK NOW";
            document.getElementById('msg-area').style.color = "#d946ef";
        };

        recognition.onend = () => {
            const micBtn = document.getElementById('mic-btn');
            if(micBtn) micBtn.classList.remove('recording');

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

        recognition.onresult = (event) => {
            if (speakingProcessingTimeout) {
                clearTimeout(speakingProcessingTimeout);
                speakingProcessingTimeout = null;
            }
            launchTimerPaused = false;
            const transcript = event.results[0][0].transcript;
            console.log("User said:", transcript);
            checkSpeakingResult(transcript);
        };
        
        recognition.onerror = (event) => {
             if (speakingProcessingTimeout) {
                clearTimeout(speakingProcessingTimeout);
                speakingProcessingTimeout = null;
             }
             launchTimerPaused = false;
             document.getElementById('msg-area').innerText = "ERROR: " + event.error;
        };
    }
    
    // 開始錄音
    recognition.start();
}

// --- 3. 檢查口語結果 (Speaking Score - 句子版) ---
function checkSpeakingResult(spokenText) {
    if (speakingProcessingTimeout) {
        clearTimeout(speakingProcessingTimeout);
        speakingProcessingTimeout = null;
    }
    launchTimerPaused = false;

    // 獲取目標句子 (如果無句子先用單字)
    const targetText = currentVocab.sent ? currentVocab.sent : currentVocab.en;
    
    // 顯示玩家讀咗乜
    document.getElementById('q-display').innerText = `"${spokenText}"`;
    document.getElementById('q-display').style.fontSize = "18px"; 

    // --- 智能比對邏輯 ---
    const cleanSpoken = spokenText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const cleanTarget = targetText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    // 計算相似度
    const similarity = calculateSimilarity(cleanSpoken, cleanTarget);
    
    if (similarity >= 0.8) {
        // --- ★★★ 關鍵修正 1：即刻停止倒數，防止誤判 Timeout ★★★ ---
        if (typeof timerInterval !== 'undefined') clearInterval(timerInterval);
        timerInterval = null;

        // --- ★★★ 關鍵修正 2：寫入戰報 (Battle Log) ★★★ ---
        if (typeof battleLog !== 'undefined') {
            battleLog.push({
                turn: (typeof turnCounter !== 'undefined' ? turnCounter : 1),
                user: spokenText,       // 記錄你讀的句子
                correct: targetText,    // 記錄正確的句子
                isCorrect: true
            });
        }

        // ★ 錯字記錄：答啱就移除
        removeWrongWord(currentPracticeMode, selectedLevel, currentVocab.en);

        // ★★★ CRITICAL FIX: Call handleCorrectAnswer to award XP and update mastery ★★★
        if (typeof handleCorrectAnswer === 'function') {
            handleCorrectAnswer();
        }

        // UI 顯示
        const scorePercent = Math.floor(similarity * 100);
        document.getElementById('msg-area').innerText = `ACCURACY: ${scorePercent}% // MATCH CONFIRMED!`;
        document.getElementById('msg-area').style.color = "var(--success)";

        // 延遲 1 秒發射
        setTimeout(() => playerFire(true), 1000);

    } else {
        // --- 讀錯 ---
        // ★ 錯字記錄：答錯就記錄
        saveWrongWord(currentPracticeMode, selectedLevel, currentVocab.en);

        const scorePercent = Math.floor(similarity * 100);
        document.getElementById('msg-area').innerText = `ACCURACY: ${scorePercent}% // TOO LOW - TRY AGAIN`;
        document.getElementById('msg-area').style.color = "var(--danger)";
        playSound('wrong-sfx');
    }
}

// 返回上一頁 (Back 掣)
function backToMainMenu() {
    playSound('delete-sfx');
    document.getElementById('skill-screen').style.display = 'none';

    if (tempGameMode === 'AI') {
        // AI 模式：Skill 係第二步，Back 返回 Level 選擇
        document.getElementById('level-screen').style.display = 'flex';
    } else {
        // 其他模式返回主選單
        showMainMenu();
    }
}
/* =========================================
   ★★★ CYBERPUNK MATRIX EFFECT (平衡版：清晰但不刺眼) ★★★
   ========================================= */
let matrixInterval = null;

function startMatrixEffect() {
    const canvas = document.getElementById('matrix-bg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 設定全螢幕尺寸
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
    const charArray = chars.split('');

    const fontSize = 14;
    const columns = canvas.width / fontSize; 

    const drops = [];
    // 保持：隨機初始位置 (防止「窗簾」效果)
    for (let x = 0; x < columns; x++) {
        drops[x] = Math.random() * (canvas.height / fontSize);
    }

    function draw() {
        // ★ 微調 1：背景遮蓋度 (0.08) - 數值越細，拖尾越長
        // 比之前的 0.1 稍微長一點點，增加流動感
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ★ 根據種族選擇顏色 ★
        let mainColor, flashColor;
        if (typeof selectedRace !== 'undefined' && selectedRace === 'AURELIANS') {
            // Aurelians: 金色
            mainColor = 'rgba(250, 250, 210, 0.65)';
            flashColor = 'rgba(255, 255, 255, 0.8)';
        } else {
            // 其他種族: 藍色
            mainColor = 'rgba(14, 165, 233, 0.65)';
            flashColor = 'rgba(255, 255, 255, 0.8)';
        }

        ctx.font = fontSize + 'px "Orbitron", monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = charArray[Math.floor(Math.random() * charArray.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // ★ 微調 4：閃爍機率 (0.975) - 即係 2.5% 機會閃
            // 比之前的 0.5% 多啲生氣，但唔會閃盲眼
            if (Math.random() > 0.975) {
                ctx.fillStyle = flashColor;
            } else {
                ctx.fillStyle = mainColor;
            }

            ctx.fillText(text, x, y);

            // 隨機重置
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    if (matrixInterval) clearInterval(matrixInterval);
    matrixInterval = setInterval(draw, 33); // 30 FPS
}

// 視窗大小改變時重置
window.addEventListener('resize', () => {
    if (document.getElementById('launch-modal').style.display !== 'none') {
        startMatrixEffect();
    }
});
function stopMatrixEffect() {
    if (matrixInterval) {
        clearInterval(matrixInterval);
        matrixInterval = null;
    }
}

// ★★★ VIRTUAL KEYBOARD EVENT LISTENERS ★★★
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

                if(typeof playSound === 'function') playSound('delete-sfx');
            } else {
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

                if(typeof playSound === 'function') playSound('enter-sfx');
            }
        });

        // ★★★ Add touch animation for tablets (manual :active state) ★★★
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

    // 1. 初始化資料庫 (如果有)
    if(typeof sortDatabase === 'function') {
        sortDatabase();
    }

    // 2. 啟動背景星星特效
    if(typeof createTwinklingStars === 'function') {
        createTwinklingStars();
    }

    // 3. 確保預設狀態是「登入畫面」
    // ★ 關鍵修正：原本這裡錯誤地直接呼叫了 showMainMenu()，導致登入畫面被跳過
    // 現在我們強制先顯示 Login Panel，讓 Firebase 去決定下一步
    switchHudPanel('login-panel');

    // 確保主選單 Carousel 是隱藏的
    const carousel = document.getElementById('main-menu-carousel');
    if(carousel) {
        carousel.style.display = 'none';
    }

    // 4. 讀取之前的音量設定
    if (typeof loadSavedAudioSettings === 'function') {
        loadSavedAudioSettings();
    }

    // 被踢出後跳過 tap-to-start，直接去 login panel 並顯示通知
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
    document.getElementById('skill-screen').style.display = 'none';
    
    if (tempGameMode === 'AI') {
        // AI: 返回主選單
        showMainMenu();
    } else {
        // PVP: 返回 Level 選擇 (因為流程是 Level -> Skill)
        document.getElementById('level-screen').style.display = 'flex';
    }
}
// ★★★ 新增：計算兩個字串的相似度 (0.0 - 1.0) ★★★
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
// ★★★ 玩家名稱輸入打字音效 (簡單版) ★★★
// =========================================

// 1. 設定個計時器去搵個輸入框 (因為有時輸入框未 Load 出嚟)
const checkInputInterval = setInterval(() => {
    // 搵個輸入框 (ID = 'player-name-input')
    const nameInput = document.getElementById('player-name-input');
    
    if (nameInput) {
        // 搵到了！停止計時器
        clearInterval(checkInputInterval);
        
        // 2. 加入打字監聽
        nameInput.addEventListener('input', (e) => {
            // 每次打字，播放 enter_word.mp3
            // 創建新音效物件，確保連打時可以疊加聲音
            const sound = new Audio('enter_word.mp3'); 
            sound.volume = 0.3; // 30% 音量，費事太嘈
            
            // 播放 (加 catch 防止瀏覽器阻擋)
            sound.play().catch(() => {}); 
        });
        
        // 3. (選用) 加入刪除聲 (Backspace)
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                const delSound = new Audio('delete_word.mp3');
                delSound.volume = 0.3;
                delSound.play().catch(() => {});
            }
        });
        
        console.log("Typing sound loaded for player input!");
    }
}, 500); // 每 0.5 秒檢查一次，直到搵到為止

// --- ★ 新增：獨立計時器啟動函數 ★ ---
function startCountdownTimer() {
    // 1. 如果計時器已經在跑，就唔好再這啟動 (防止重複)
    if (timerInterval) return;

    const modal = document.getElementById('launch-modal');
    if (modal.style.display === 'none') return; // 如果視窗閂咗就唔好計

    const timerBar = document.getElementById('timer-bar');
    
    // 計算時間 (邏輯同原本一樣)
    let timeMultiplier = 0.7;
    let baseTime = 3;
    if (currentPracticeMode === 'SPEAKING') {
        baseTime = 4; timeMultiplier = 0.8;
    }
    const totalTime = baseTime + (currentVocab.en.length * timeMultiplier);
    launchTimerTotal = currentPracticeMode === 'SPEAKING' ? totalTime * 2 : totalTime;
    launchTimerTimeLeft = launchTimerTotal;
    launchTimerPaused = false;

    // 開始動畫
    timerBar.style.transition = 'width 0.1s linear';
    timerBar.style.width = '100%';
    
    // 啟動倒數
    timerInterval = setInterval(() => {
        if (launchTimerPaused) return;

        launchTimerTimeLeft -= 0.1;
        const percentage = (launchTimerTimeLeft / launchTimerTotal) * 100;
        timerBar.style.width = percentage + "%";
        
        if (launchTimerTimeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null; // 確保重置
            handlePlayerTimeout();
        }
    }, 100);
}

/* =========================================
   ★★★ ADVANCED VOICE ENGINE (Smart Timing) ★★★
   ========================================= */

function speakText(text, element = null) {
    if (!text) return;

    // ★ 保存當前focus狀態（LISTENING mode需要）
    const hiddenInput = document.getElementById('hidden-input');
    const shouldMaintainFocus = hiddenInput && hiddenInput.style.display !== 'none' &&
                                 typeof currentPracticeMode !== 'undefined' && currentPracticeMode === 'LISTENING';

    // 1. 檢查支援性
    if (!('speechSynthesis' in window)) {
        console.error("Browser does not support Speech Synthesis");
        return;
    }

    // 2. 停止舊語音 & 清除舊特效
    window.speechSynthesis.cancel();
    document.querySelectorAll('.vocab-row.speaking').forEach(el => el.classList.remove('speaking'));

    const utterance = new SpeechSynthesisUtterance(text);

    // ★★★ CRITICAL: Force English language to prevent system language interference ★★★
    utterance.lang = 'en-US';

    // 3. 設定語音參數 (整合音量設定)
    // 即使你未加音量設定，這段代碼也會自動用預設值，不會報錯
    const voiceVolume = (typeof gameVolume !== 'undefined' && Number.isFinite(gameVolume.voice))
        ? Math.max(0, Math.min(1, gameVolume.voice))
        : 1.0;
    utterance.volume = voiceVolume;

    // 嘗試套用 Google Voice 或其他英文聲
    if (typeof techVoice !== 'undefined' && techVoice) {
         utterance.voice = techVoice;
    }

    utterance.rate = 0.9; // 語速適中
    utterance.pitch = 1.0;

    // --- ★★★ 核心邏輯：智能鎖定目標字位置 ★★★ ---
    let hasTimerStarted = false;
    let targetWordEndIndex = -1;

    // 只在 LISTENING 模式下進行計算
    if (typeof currentPracticeMode !== 'undefined' && currentPracticeMode === 'LISTENING' &&
        typeof currentVocab !== 'undefined' && currentVocab.en &&
        text.toLowerCase().includes(currentVocab.en.toLowerCase())) {

        const targetWord = currentVocab.en;
        // 使用 Regex 準確搵出個字係句子入面既「結束位置」
        const escapedTarget = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedTarget}\\b`, 'i');
        const match = regex.exec(text);

        if (match) {
            // match.index 係單字開始位置 + 單字長度 = 結束位置
            targetWordEndIndex = match.index + match[0].length;
        }
    }

    // 4. 設定事件監聽器

    // A. 開始讀 (視覺特效)
    utterance.onstart = () => {
        if (element) element.classList.add('speaking');
    };

    // B. ★★★ 邊界事件 (每讀一個字都會 Trigger) ★★★
    utterance.onboundary = (event) => {
        // 條件：搵到目標字 + Timer 未開始 + 是單字邊界
        if (targetWordEndIndex !== -1 && !hasTimerStarted) {
            // 如果 當前位置 >= 目標字結束位置，即係代表目標字已經讀完！
            if (event.charIndex >= targetWordEndIndex) {
                console.log("Target word finished! Starting timer instantly.");
                hasTimerStarted = true;
                if (typeof startCountdownTimer === 'function') {
                    startCountdownTimer(); // <--- 立即啟動計時！
                }
            }
        }
    };

    // C. 讀完 (Fallback 保險掣)
    utterance.onend = () => {
        if (element) element.classList.remove('speaking');

        // ★ LISTENING mode：重新focus input
        if (shouldMaintainFocus && hiddenInput) {
            setTimeout(() => {
                hiddenInput.focus();
            }, 50);
        }

        // 如果讀完都未 Trigger (例如個字係整句既最後一個字)，就係度 Trigger
        if (typeof currentPracticeMode !== 'undefined' && currentPracticeMode === 'LISTENING' &&
            !hasTimerStarted) {
             const modal = document.getElementById('launch-modal');
             // 確保視窗仲開緊
             if (modal && modal.style.display === 'flex') {
                 if (typeof startCountdownTimer === 'function') {
                    startCountdownTimer();
                 }
             }
        }
    };

    // 5. 正式發聲
    try {
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('Speech synthesis failed:', error);

        if (element) element.classList.remove('speaking');

        if (shouldMaintainFocus && hiddenInput) {
            setTimeout(() => hiddenInput.focus(), 50);
        }

        if (typeof currentPracticeMode !== 'undefined' && currentPracticeMode === 'LISTENING' &&
            !hasTimerStarted) {
            const modal = document.getElementById('launch-modal');
            if (modal && modal.style.display === 'flex' && typeof startCountdownTimer === 'function') {
                startCountdownTimer();
            }
        }
    }
}

/* =========================================
   ★★★ SKILL SYSTEM ★★★
   ========================================= */

let selectedSkill = null;
let activeSkill = null;
let radarPreviewIndex = null;
let radarLockedIndex = null;
let missilePreviewIndex = null;
let missileLockedIndex = null;
const radarScannedCells = new Set();
const RADAR_SCAN_DURATION = 2200;
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
    cell.innerHTML = `<span class="radar-count-static">${count}</span>`;
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

function buildRadarOverlay(centerIndex, className, includeCenter = true) {
    const grid = document.getElementById('enemy-grid');
    if (!grid) return null;

    const cells = getRadarAreaIndices(centerIndex).map(index => getEnemyCell(index)).filter(Boolean);
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

    const centerCell = getEnemyCell(centerIndex);
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
    const overlay = buildRadarOverlay(centerIndex, 'radar-preview-overlay', true);
    if (!grid || !overlay) return;

    grid.appendChild(overlay);
    radarPreviewIndex = centerIndex;
}

function renderRadarScannedOverlay(centerIndex) {
    const grid = document.getElementById('enemy-grid');
    if (!grid || !radarScannedCells.has(centerIndex)) return;

    const existing = grid.querySelector(`.radar-scanned-overlay[data-center-index="${centerIndex}"]`);
    if (existing) existing.remove();

    const overlay = buildRadarOverlay(centerIndex, 'radar-scanned-overlay', false);
    if (overlay) grid.appendChild(overlay);
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
        sigil.textContent = '☢';
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
    const impactWidth = (right - left) + 44;
    const impactHeight = (bottom - top) + 44;
    const gridRect = grid.getBoundingClientRect();
    const missileHeight = 73;
    const impactTop = centerY - missileHeight;
    const startTop = -(gridRect.top + missileHeight + 12);
    const travelDistance = Math.abs(impactTop - startTop);
    const flightDuration = Math.max(620, Math.round(travelDistance / 1.2));
    const totalDuration = flightDuration + MISSILE_EXPLOSION_DURATION;

    const overlay = document.createElement('div');
    overlay.className = 'missile-strike-overlay';

    const missile = document.createElement('div');
    missile.className = 'missile-sprite';
    missile.style.left = `${centerX}px`;
    missile.style.setProperty('--missile-start-top', `${startTop}px`);
    missile.style.setProperty('--missile-impact-top', `${impactTop}px`);
    missile.style.setProperty('--missile-flight-duration', `${flightDuration}ms`);

    const explosion = document.createElement('div');
    explosion.className = 'missile-explosion';
    explosion.style.left = `${centerX}px`;
    explosion.style.top = `${centerY}px`;
    explosion.style.width = `${impactWidth}px`;
    explosion.style.height = `${impactHeight}px`;

    overlay.appendChild(missile);
    grid.appendChild(overlay);

    setTimeout(() => {
        if (lockOverlay) lockOverlay.remove();
        missile.remove();
        playSound('destroy-sfx');
        overlay.appendChild(explosion);
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
    const totalDuration = fadeStart + Math.max(NUKE_SHAKE_DURATION, NUKE_WHITEOUT_FADE, NUKE_EXPLOSION_DURATION);

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

    const explosion = document.createElement('div');
    explosion.className = 'nuke-explosion';
    explosion.style.left = `${centerX}px`;
    explosion.style.top = `${centerY}px`;
    explosion.style.width = `${impactWidth}px`;
    explosion.style.height = `${impactHeight}px`;

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
            overlay.appendChild(explosion);
            animateSpriteSheet(
                explosion,
                NUKE_EXPLOSION_COLUMNS,
                NUKE_EXPLOSION_ROWS,
                NUKE_EXPLOSION_FRAMES,
                NUKE_EXPLOSION_DURATION,
                () => explosion.remove()
            );
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
    const cell = getEnemyCell(centerIndex);
    if (!cell) return;

    updateRadarCellDisplay(centerIndex);
    const count = cell.dataset.radarCount || '0';
    const floating = document.createElement('span');
    floating.className = 'radar-count-floating';
    floating.textContent = count;
    cell.appendChild(floating);
    setTimeout(() => floating.remove(), 1500);
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

    const cells = getRadarAreaIndices(centerIndex).map(index => getEnemyCell(index)).filter(Boolean);
    const centerCell = getEnemyCell(centerIndex);
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
    if (centerCell) {
        overlay.style.setProperty('--radar-origin-x', `${centerCell.offsetLeft - left + (centerCell.offsetWidth / 2)}px`);
        overlay.style.setProperty('--radar-origin-y', `${centerCell.offsetTop - top + (centerCell.offsetHeight / 2)}px`);
    }

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
        radarScannedCells.add(centerIndex);
        renderRadarScannedOverlay(centerIndex);
        showRadarResult(centerIndex);
        finishRadarMode();
        if (currentPhase === 'PLAYER_TURN') {
            startTurnSelectionTimer(false);
        }
    }, RADAR_SCAN_DURATION);
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

// 根據 playerEnergy 更新每個技能嘅 available/disabled 狀態
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
    // Energy icon 同步
    const energyIcon = document.querySelector('.skill-energy-icon');
    if (energyIcon) {
        const anyAvailable = document.querySelector('.skill-diamond.skill-available');
        energyIcon.classList.toggle('energy-disabled', !anyAvailable);
    }
}

// 撳技能 diamond
function onSkillClick(e) {
    const diamond = e.currentTarget;
    if (diamond.classList.contains('skill-disabled')) return;
    if (currentPhase !== 'PLAYER_TURN') return;
    if (activeSkill) return;

    const skill = diamond.dataset.skill;
    const cost = parseInt(diamond.dataset.cost) || 0;

    // 如果已經選緊同一個 → 取消
    if (selectedSkill === skill) {
        cancelSkillSelection();
        return;
    }

    // 選擇新技能
    selectedSkill = skill;
    document.querySelectorAll('.skill-diamond').forEach(d => d.classList.remove('skill-selected'));
    diamond.classList.add('skill-selected');
    playSound(skill === 'nuke' ? 'nuke-ready-sfx' : 'skill-select-sfx');

    // 顯示 cost + 確認/取消
    const costVal = document.getElementById('skill-cost-val');
    const confirmBtns = document.getElementById('skill-confirm-btns');
    const costRow = costVal ? costVal.parentElement : null;
    if (costVal) {
        costVal.textContent = cost;
        costVal.style.display = 'inline';
        if (costRow) costRow.classList.toggle('cost-double-digit', String(cost).length >= 2);
    }
    if (confirmBtns) confirmBtns.style.display = 'flex';

    // 更新 instruction panel
    const info = SKILL_INFO[skill];
    if (info) {
        setInstructionPanel(info.name, info.desc, info.icon);
    }

    if (skill === 'radar') {
        radarLockedIndex = null;
        missileLockedIndex = null;
        clearMissilePreview();
        setRadarEligibleCells(true);
        setExplosionEligibleCells(false);
        setInstructionPanel('RADAR', 'SELECT A MISSED CELL TO SCAN', 'radar.png');
    } else if (skill === 'explosion') {
        missileLockedIndex = null;
        radarLockedIndex = null;
        clearRadarPreview();
        setRadarEligibleCells(false);
        setExplosionEligibleCells(true);
        setInstructionPanel('MISSILE', 'SELECT A 2X2 TARGET AREA', 'explosion.png');
    } else if (skill === 'nuke') {
        missileLockedIndex = null;
        radarLockedIndex = null;
        clearRadarPreview();
        setRadarEligibleCells(false);
        setExplosionEligibleCells(true);
        setInstructionPanel('NUKE', 'SELECT A 4X4 TARGET AREA', 'nuclear_bomb.png');
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

    // 還原 instruction panel
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

    // 扣 energy
    addEnergy(-cost, selectedSkill.toUpperCase());

    console.log(`★ SKILL ACTIVATED: ${selectedSkill} (cost: ${cost})`);
    cancelSkillSelection();
    updateSkillStates();
}

// 綁定事件
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
