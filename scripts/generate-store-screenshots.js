const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_ROOT = path.join(ROOT_DIR, 'store-assets', 'screenshots');

const DEVICES = [
    {
        key: 'app-store/iphone-6.9-landscape',
        label: 'App Store iPhone 6.9 landscape',
        width: 2868,
        height: 1320
    },
    {
        key: 'app-store/iphone-6.5-landscape',
        label: 'App Store iPhone 6.5 landscape',
        width: 2778,
        height: 1284
    },
    {
        key: 'app-store/ipad-13-landscape',
        label: 'App Store iPad 13 landscape',
        width: 2752,
        height: 2064
    },
    {
        key: 'play-store/phone-landscape',
        label: 'Play Store phone landscape',
        width: 1920,
        height: 1080
    }
];

const SCENES = [
    { id: 'start', file: '01_start_screen.png', title: 'Start screen' },
    { id: 'mainMenu', file: '02_main_menu.png', title: 'Main menu' },
    { id: 'grammarTopics', file: '03_grammar_topics.png', title: 'Grammar topics' },
    { id: 'tenseNotes', file: '04_tenses_notes.png', title: 'Tenses notes' },
    { id: 'battleQuestion', file: '05_battle_question.png', title: 'Battle question' },
    { id: 'victoryResult', file: '06_victory_result.png', title: 'Victory result' }
];

const CONTENT_TYPES = {
    '.aac': 'audio/aac',
    '.css': 'text/css; charset=utf-8',
    '.gif': 'image/gif',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.m4a': 'audio/mp4',
    '.mp3': 'audio/mpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.wasm': 'application/wasm',
    '.woff2': 'font/woff2'
};

const STORE_CAPTURE_CSS = `
    * {
        animation-duration: 0.001ms !important;
        animation-delay: 0s !important;
        transition-duration: 0.001ms !important;
        scroll-behavior: auto !important;
    }

    html, body {
        width: 100vw !important;
        height: 100vh !important;
        overflow: hidden !important;
        background: #020611 !important;
    }

    body.store-capture {
        --grid-cell-size: clamp(40px, 4.5vh, 58px);
        --grid-gap: 3px;
        --grid-padding: 10px;
        --enemy-board-width: calc((var(--grid-cell-size) * 10) + (var(--grid-gap) * 9) + (var(--grid-padding) * 2) + 2px);
    }

    .store-capture #company-logo-splash,
    .store-capture #login-overlay,
    .store-capture #orientation-guard,
    .store-capture #registration-modal,
    .store-capture #settings-modal,
    .store-capture #diagnostic-log-panel,
    .store-capture .tech-modal-overlay,
    .store-capture #tech-notification {
        display: none !important;
    }

    .store-capture .panel-content-wrapper,
    .store-capture .vocab-row-entrance {
        opacity: 1 !important;
        transform: none !important;
    }

    .store-capture #main-settings-btn {
        opacity: 0.42;
    }

    .store-capture #coins-display {
        opacity: 0.78;
    }

    .store-capture #start-screen,
    .store-capture #level-screen,
    .store-capture #grammar-topic-screen,
    .store-capture #stage-screen,
    .store-capture #vocab-screen,
    .store-capture #lobby-screen,
    .store-capture #end-screen {
        isolation: isolate;
    }

    .store-capture #main-menu-carousel {
        display: block !important;
        width: min(1180px, 86vw);
        max-width: none !important;
    }

    .store-capture #main-menu-carousel .nav-arrow {
        display: none !important;
    }

    .store-capture #game-mode-selection {
        display: grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        justify-content: center;
        gap: clamp(18px, 2vw, 34px);
        overflow: visible !important;
        width: 100% !important;
        max-width: none !important;
        padding: 14px 0 !important;
    }

    .store-capture .carousel-item {
        flex: none !important;
        width: auto !important;
        min-width: 0 !important;
        height: clamp(120px, 15vh, 170px);
        opacity: 1 !important;
        visibility: visible !important;
    }

    .store-capture #grammar-topic-screen {
        padding: clamp(18px, 3vh, 42px) clamp(18px, 3vw, 60px);
        box-sizing: border-box;
    }

    .store-capture #grammar-topic-screen .grammar-topic-panel {
        width: min(1320px, calc(100vw - 80px)) !important;
        height: auto !important;
        max-height: calc(100vh - 54px) !important;
        overflow: visible !important;
        background: rgba(2, 12, 24, 0.54);
        border: 1px solid rgba(14, 165, 233, 0.36);
        border-radius: 14px;
        padding: clamp(20px, 3vh, 36px);
        box-shadow: 0 0 36px rgba(14, 165, 233, 0.2), inset 0 0 22px rgba(14, 165, 233, 0.08);
    }

    .store-capture #grammar-topic-grid {
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: clamp(12px, 1.6vh, 18px) clamp(14px, 1.6vw, 22px);
        width: 100% !important;
        min-height: 0 !important;
        overflow: visible !important;
        padding: 8px 4px 2px !important;
    }

    .store-capture .grammar-topic-btn {
        min-height: clamp(78px, 8.5vh, 112px);
        padding: clamp(12px, 1.5vh, 18px) clamp(12px, 1.4vw, 20px) clamp(28px, 3vh, 36px);
    }

    .store-capture .grammar-topic-name {
        font-size: clamp(15px, 1.65vw, 22px);
        line-height: 1.12;
        text-align: center;
    }

    .store-capture .grammar-topic-desc,
    .store-capture .grammar-topic-progress {
        font-size: clamp(10px, 1vw, 13px);
    }

    .store-capture .grammar-topic-progress {
        bottom: clamp(8px, 1vh, 12px);
    }

    .store-capture #vocab-screen {
        box-sizing: border-box;
        padding: clamp(18px, 4vh, 70px) 18px !important;
    }

    .store-capture #vocab-screen.grammar-reference-preview .vocab-container,
    .store-capture #vocab-screen.grammar-reference-notes .vocab-container {
        width: min(88vw, 1180px) !important;
        max-width: 1180px !important;
        height: min(66vh, 780px) !important;
    }

    .store-capture #vocab-screen.grammar-reference-notes .vocab-row {
        padding: clamp(12px, 1.5vh, 20px) clamp(14px, 1.7vw, 24px);
    }

    .store-capture #vocab-screen.grammar-reference-notes .vocab-en {
        font-size: clamp(16px, 1.4vw, 21px);
    }

    .store-capture #vocab-screen.grammar-reference-notes .vocab-ch,
    .store-capture #vocab-screen.grammar-reference-notes .vocab-example {
        font-size: clamp(14px, 1.22vw, 18px);
        line-height: 1.46;
    }

    .store-capture #game-ui {
        opacity: 1 !important;
        min-height: 100vh;
        justify-content: center;
        gap: clamp(8px, 1vh, 14px);
    }

    .store-capture #control-panel {
        transform: scale(1.06);
        transform-origin: center;
        margin-bottom: clamp(8px, 1.4vh, 18px);
    }

    .store-capture #enemy-board.active {
        visibility: visible !important;
        pointer-events: none !important;
    }

    .store-capture .cell.store-ship {
        background: linear-gradient(145deg, rgba(14, 165, 233, 0.48), rgba(125, 211, 252, 0.14)) !important;
        border-color: rgba(186, 230, 253, 0.7) !important;
        box-shadow: inset 0 0 10px rgba(14, 165, 233, 0.3), 0 0 8px rgba(14, 165, 233, 0.25);
    }

    .store-capture #launch-modal.store-battle-modal {
        display: flex !important;
        justify-content: flex-end !important;
        align-items: center !important;
        padding-right: min(6vw, 120px) !important;
        box-sizing: border-box !important;
        background: rgba(0, 0, 0, 0.16) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
    }

    .store-capture #launch-modal.store-battle-modal .modal-content {
        max-width: min(560px, 44vw);
        padding: clamp(22px, 2.8vh, 34px);
    }

    .store-capture #launch-modal.store-battle-modal #q-text {
        font-size: clamp(22px, 2.2vw, 34px) !important;
        line-height: 1.22;
    }

    .store-capture #launch-modal.store-battle-modal #launch-choice-sentence {
        font-size: clamp(20px, 2vw, 30px);
    }

    .store-capture #launch-modal.store-battle-modal #launch-choice-options {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
    }

    .store-capture #launch-modal.store-battle-modal .launch-choice-option {
        min-height: 48px;
        font-size: clamp(15px, 1.3vw, 20px);
    }

    .store-capture #end-screen .settlement-panel {
        max-width: min(840px, 86vw);
    }

    .store-capture #end-screen .settlement-title {
        font-size: clamp(58px, 7vh, 92px);
    }

    .store-capture #end-screen .settlement-subtitle {
        font-size: clamp(16px, 1.6vw, 23px);
    }
`;

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function serveFile(filePath, response) {
    fs.readFile(filePath, (error, data) => {
        if (error) {
            response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
            response.end('Not found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        response.writeHead(200, {
            'content-type': CONTENT_TYPES[ext] || 'application/octet-stream',
            'cache-control': 'no-store'
        });
        response.end(data);
    });
}

function startStaticServer() {
    const server = http.createServer((request, response) => {
        const url = new URL(request.url, 'http://127.0.0.1');
        const relativePath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
        const filePath = path.resolve(ROOT_DIR, `.${relativePath}`);

        if (!filePath.startsWith(ROOT_DIR)) {
            response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
            response.end('Forbidden');
            return;
        }

        serveFile(filePath, response);
    });

    return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => resolve(server));
    });
}

async function preparePage(page, baseUrl) {
    await page.goto(`${baseUrl}/index.html?storeScreenshot=${Date.now()}`, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
    });

    await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(1800);
    await page.addStyleTag({ content: STORE_CAPTURE_CSS });
}

async function renderScene(page, sceneId) {
    await page.evaluate((id) => {
        const $ = (elementId) => document.getElementById(elementId);
        const setDisplay = (elementId, display) => {
            const element = $(elementId);
            if (element) element.style.display = display;
            return element;
        };
        const setText = (elementId, text) => {
            const element = $(elementId);
            if (element) element.innerText = text;
        };
        const hide = (...ids) => ids.forEach((elementId) => setDisplay(elementId, 'none'));
        const show = (elementId, display = 'flex') => setDisplay(elementId, display);

        const allScreens = [
            'company-logo-splash',
            'splash-screen',
            'start-screen',
            'vocab-screen',
            'ranking-screen',
            'skill-screen',
            'race-screen',
            'level-screen',
            'grammar-topic-screen',
            'grammar-verb-screen',
            'stage-screen',
            'lobby-screen',
            'game-ui',
            'launch-modal',
            'end-screen',
            'selection-overlay'
        ];

        const setClass = (elementId, className, enabled) => {
            const element = $(elementId);
            if (element) element.classList.toggle(className, enabled);
        };

        const resetScreens = () => {
            document.body.classList.add('store-capture');
            document.documentElement.classList.remove('capacitor-native', 'capacitor-ios', 'capacitor-android');
            allScreens.forEach((elementId) => hide(elementId));
            show('game-content-wrapper', 'block');
            hide('registration-modal', 'settings-modal', 'confirm-modal', 'speaking-debrief-modal', 'rank-info-modal');
            const topicScreen = $('grammar-topic-screen');
            if (topicScreen) topicScreen.classList.remove('grammar-topic-reference-mode', 'grammar-topic-keyboard-open');
            const launchModal = $('launch-modal');
            if (launchModal) launchModal.classList.remove('store-battle-modal', 'aurelians-theme');
            const controlPanel = $('control-panel');
            if (controlPanel) controlPanel.classList.remove('battle-mode');
            const endScreen = $('end-screen');
            if (endScreen) endScreen.style.animation = '';
        };

        const buildGrid = (gridId, options = {}) => {
            const grid = $(gridId);
            if (!grid) return;
            grid.innerHTML = '';
            const hits = new Set(options.hits || []);
            const misses = new Set(options.misses || []);
            const ships = new Set(options.ships || []);
            const scanned = new Set(options.scanned || []);

            for (let index = 0; index < 100; index += 1) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.index = String(index);
                if (ships.has(index)) cell.classList.add('store-ship');
                if (hits.has(index)) {
                    cell.classList.add('hit');
                    cell.textContent = 'X';
                } else if (misses.has(index)) {
                    cell.classList.add('miss');
                    cell.innerHTML = '<span style="color:rgba(226,232,240,.42);font-family:Orbitron;">·</span>';
                }
                if (scanned.has(index)) {
                    cell.classList.add('radar-scanned');
                    cell.innerHTML = '<span class="radar-count-static">2</span>';
                }
                grid.appendChild(cell);
            }
        };

        const buildMinimap = () => {
            const miniGrid = $('minimap-grid');
            if (!miniGrid) return;
            miniGrid.innerHTML = '';
            const shipCells = new Set([1, 11, 26, 27, 28, 54, 55, 64, 65, 83, 84, 85, 86]);
            const hitCells = new Set([27, 55, 83]);
            const missCells = new Set([6, 37, 48, 72]);
            for (let index = 0; index < 100; index += 1) {
                const cell = document.createElement('div');
                cell.className = 'minimap-cell';
                if (shipCells.has(index)) cell.classList.add('ship');
                if (hitCells.has(index)) cell.classList.add('hit');
                if (missCells.has(index)) cell.classList.add('miss');
                miniGrid.appendChild(cell);
            }
        };

        const buildEnemyIndicator = () => {
            const indicator = $('enemy-fleet-indicator');
            if (!indicator) return;
            indicator.innerHTML = '';
            const shapes = [
                { cols: 1, cells: 2, destroyed: true },
                { cols: 1, cells: 3, destroyed: true },
                { cols: 2, cells: 4, destroyed: false },
                { cols: 1, cells: 4, destroyed: false },
                { cols: 2, cells: 6, destroyed: false }
            ];
            shapes.forEach((shape, shapeIndex) => {
                const block = document.createElement('div');
                block.className = 'enemy-ship-block';
                block.style.gridTemplateColumns = `repeat(${shape.cols}, 1fr)`;
                block.id = `indicator-ship-${shapeIndex}`;
                if (shape.destroyed) block.classList.add('destroyed');
                for (let i = 0; i < shape.cells; i += 1) {
                    const cell = document.createElement('div');
                    cell.className = `indicator-cell${shape.destroyed ? ' cell-destroyed' : ''}`;
                    block.appendChild(cell);
                }
                indicator.appendChild(block);
            });
        };

        const fillProfile = () => {
            setDisplay('connecting-panel', 'none');
            setDisplay('login-panel', 'none');
            show('user-profile-panel', 'block');
            show('main-menu-carousel', 'flex');
            setText('hud-rank-title', 'CAPTAIN');
            setText('hud-player-name', 'AUAU');
            setText('coins-amount', 'SUPPLIES: 21850');
            setText('exp-bar-text', '134095 / 165000');
            const expFill = $('exp-bar-fill');
            if (expFill) expFill.style.width = '81%';
            setText('system-status-text', 'READY FOR DEPLOYMENT');
        };

        if (id === 'start') {
            document.body.classList.add('store-capture');
            hide('company-logo-splash', 'game-content-wrapper', 'registration-modal', 'settings-modal', 'login-overlay');
            show('splash-screen', 'flex');
            setText('splash-status-text', 'TACTICAL ENGLISH LEARNING ONLINE');
            return;
        }

        resetScreens();

        if (id === 'mainMenu') {
            show('start-screen', 'flex');
            fillProfile();
            return;
        }

        if (id === 'grammarTopics') {
            show('selection-overlay', 'block');
            show('grammar-topic-screen', 'flex');
            const panel = document.querySelector('#grammar-topic-screen .panel-content-wrapper');
            if (panel) panel.style.display = 'flex';
            setText('grammar-topic-title', 'SELECT TOPIC');
            setText('grammar-topic-subtitle', 'GRAMMAR TRAINING MODULE');

            const progress = {
                'grammar-topic-progress': '82/393',
                'grammar-tense-topic-progress': '91/160',
                'grammar-pronoun-topic-progress': '62/140',
                'grammar-comparative-superlative-topic-progress': '55/140',
                'grammar-preposition-place-topic-progress': '74/170',
                'grammar-preposition-time-topic-progress': '68/160',
                'grammar-infinitive-gerund-topic-progress': '44/120',
                'grammar-direct-topic-progress': '39/120',
                'grammar-indirect-topic-progress': '32/150',
                'grammar-it-is-topic-progress': '41/120',
                'grammar-conditional-topic-progress': '36/120',
                'grammar-reported-speech-topic-progress': '45/160',
                'grammar-participle-phrases-topic-progress': '24/90',
                'grammar-inversion-topic-progress': '18/80',
                'grammar-question-tag-topic-progress': '30/100',
                'grammar-compound-adj-topic-progress': '51/110',
                'grammar-phrasal-verb-topic-progress': '57/120'
            };
            Object.entries(progress).forEach(([elementId, text]) => setText(elementId, text));
            return;
        }

        if (id === 'tenseNotes') {
            if (typeof window.openGrammarTenseReferenceScreen === 'function') {
                window.openGrammarTenseReferenceScreen();
            } else {
                show('vocab-screen', 'flex');
            }
            const body = $('vocab-list-body');
            if (body) body.scrollTop = 0;
            return;
        }

        if (id === 'battleQuestion') {
            show('game-ui', 'flex');
            setDisplay('player-board', 'block');
            setDisplay('enemy-board', 'block');
            setClass('player-board', 'active', false);
            setClass('enemy-board', 'active', true);
            setClass('player-board', 'race-vanguards', true);
            setClass('enemy-board', 'aurelians-theme', true);
            const controlPanel = $('control-panel');
            if (controlPanel) controlPanel.classList.add('battle-mode');
            setText('game-status', 'PHASE: YOUR TURN // GRAMMAR STRIKE');
            setText('energy-count', '8');
            setText('turn-count', '6');
            setDisplay('turn-timer-container', 'block');
            const timer = $('turn-timer-bar');
            if (timer) timer.style.width = '68%';
            buildGrid('enemy-grid', {
                hits: [2, 3, 12, 13, 44, 45, 55, 76],
                misses: [8, 17, 28, 31, 39, 62, 70, 91],
                scanned: [66]
            });
            buildGrid('player-grid', {
                ships: [1, 11, 21, 26, 27, 28, 54, 55, 64, 65, 83, 84, 85, 86],
                hits: [27, 55, 83],
                misses: [6, 37, 48, 72]
            });
            buildEnemyIndicator();
            buildMinimap();
            show('battle-hud', 'flex');
            setClass('hud-minimap', 'player-map', true);
            setClass('hud-minimap', 'race-vanguards', true);
            setText('instruction-text', 'SINGLE SHOT: TAP A CELL TO FIRE');

            show('launch-modal', 'flex');
            const launch = $('launch-modal');
            if (launch) launch.classList.add('store-battle-modal');
            setDisplay('matrix-bg', 'none');
            setText('launch-mode-label', 'Grammar Strike:');
            setText('q-text', 'Choose the correct preposition.');
            setDisplay('q-display', 'none');
            setDisplay('launch-grammar-panel', 'block');
            hide('launch-grammar-verb-wrap', 'launch-grammar-tense-wrap', 'launch-grammar-direct-wrap');
            show('launch-grammar-choice-wrap', 'block');
            setText('launch-choice-command', '5 OPTION SIGNALS');
            setText('launch-choice-sentence', 'The drone is flying ___ the harbor.');
            const options = $('launch-choice-options');
            if (options) {
                options.innerHTML = ['over', 'on', 'in', 'at', 'under'].map((option, index) => (
                    `<button class="launch-choice-option${index === 0 ? ' selected' : ''}">${option}</button>`
                )).join('');
            }
            setText('launch-subhint', 'SELECT THE CODE // FIRE TO ATTACK');
            const fire = $('launch-choice-fire-btn');
            if (fire) {
                fire.disabled = false;
                fire.innerText = 'FIRE';
            }
            return;
        }

        if (id === 'victoryResult') {
            show('end-screen', 'flex');
            hide('game-ui');
            setText('end-title', 'VICTORY');
            const title = $('end-title');
            if (title) {
                title.style.color = 'var(--success)';
                title.style.textShadow = '0 0 30px var(--success)';
            }
            setText('end-msg', 'ENEMY FLEET ELIMINATED');
            setText('settlement-player-name', 'AUAU [VANGUARDS]');
            setText('settlement-enemy-name', 'AI [AURELIANS]');
            setText('settlement-turns', '8');
            setText('settlement-correct-percent', '92%');
            setText('settlement-units-destroyed', '5 / 5');
            setText('settlement-hits', '21');
            setText('settlement-missed', '5');
            setText('settlement-shot-accuracy', '81%');
            setText('settlement-best-hit-streak', '7');
            const battlePage = $('settlement-page-battle');
            const rewardPage = $('settlement-page-rewards');
            const debriefPage = $('settlement-page-debrief');
            if (battlePage) battlePage.classList.add('active');
            if (rewardPage) rewardPage.classList.remove('active');
            if (debriefPage) debriefPage.classList.remove('active');
        }
    }, sceneId);

    await page.waitForTimeout(400);
}

async function captureScene(browser, baseUrl, device, scene) {
    const context = await browser.newContext({
        viewport: { width: device.width, height: device.height },
        deviceScaleFactor: 1,
        serviceWorkers: 'block',
        colorScheme: 'dark',
        reducedMotion: 'reduce'
    });

    const page = await context.newPage();
    page.on('dialog', (dialog) => dialog.dismiss().catch(() => {}));
    page.on('pageerror', (error) => {
        console.warn(`[store:screenshots] Page error in ${scene.id}: ${error.message}`);
    });

    await preparePage(page, baseUrl);
    await renderScene(page, scene.id);

    const outputDir = path.join(OUTPUT_ROOT, device.key);
    ensureDir(outputDir);
    const outputPath = path.join(outputDir, scene.file);

    await page.screenshot({
        path: outputPath,
        fullPage: false,
        animations: 'disabled',
        scale: 'css'
    });

    await context.close();
    return outputPath;
}

async function main() {
    ensureDir(OUTPUT_ROOT);

    const server = await startStaticServer();
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    const browser = await chromium.launch({ headless: true });
    const generated = [];

    try {
        for (const device of DEVICES) {
            for (const scene of SCENES) {
                const outputPath = await captureScene(browser, baseUrl, device, scene);
                generated.push({
                    device: device.label,
                    width: device.width,
                    height: device.height,
                    scene: scene.title,
                    file: path.relative(ROOT_DIR, outputPath)
                });
                console.log(`[store:screenshots] ${device.label}: ${scene.file}`);
            }
        }
    } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
    }

    const manifestPath = path.join(OUTPUT_ROOT, 'manifest.json');
    fs.writeFileSync(manifestPath, `${JSON.stringify({
        generatedAt: new Date().toISOString(),
        build: '1.0.3-build24-grammar-notes-result',
        screenshots: generated
    }, null, 2)}\n`);

    console.log(`[store:screenshots] Manifest: ${path.relative(ROOT_DIR, manifestPath)}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
