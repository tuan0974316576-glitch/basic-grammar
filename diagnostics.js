(function() {
    const LOG_KEY = 'battleship_diagnostic_log_v1';
    const BUILD_KEY = 'battleship_diagnostic_build_v1';
    const BUILD_TAG = window.ENGLISH_CONQUEROR_BUILD || 'unknown-build';
    const MAX_ENTRIES = 900;
    const MAX_FIELD_LENGTH = 1800;
    const PROBE_TIMEOUT_MS = 8000;
    const POWER_SAMPLE_INTERVAL_MS = 60000;
    const originalConsole = {};
    const originalTimers = {
        setTimeout: window.setTimeout?.bind(window),
        clearTimeout: window.clearTimeout?.bind(window),
        setInterval: window.setInterval?.bind(window),
        clearInterval: window.clearInterval?.bind(window),
        requestAnimationFrame: window.requestAnimationFrame?.bind(window),
        cancelAnimationFrame: window.cancelAnimationFrame?.bind(window)
    };
    let probeInFlight = null;
    let probeRunCount = 0;
    let powerSampleTimer = null;
    let batteryState = { supported: false, reason: 'not checked' };
    const activeTimeouts = new Map();
    const activeIntervals = new Map();
    const activeRafs = new Map();
    const rafStats = {
        frames: 0,
        fps: 0,
        windowStartedAt: Date.now(),
        lastFrameAt: 0
    };

    try {
        const previousBuild = localStorage.getItem(BUILD_KEY);
        if (previousBuild !== BUILD_TAG) {
            localStorage.removeItem(LOG_KEY);
            localStorage.setItem(BUILD_KEY, BUILD_TAG);
        }
    } catch (error) {}

    function readEntries() {
        try {
            const parsed = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function writeEntries(entries) {
        try {
            localStorage.setItem(LOG_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
        } catch (error) {
            try {
                localStorage.setItem(LOG_KEY, JSON.stringify(entries.slice(-150)));
            } catch (_) {}
        }
    }

    function safeStringify(value, seen = new WeakSet()) {
        if (value instanceof Error) {
            return `${value.name || 'Error'}: ${value.message || ''}${value.stack ? '\n' + value.stack : ''}`;
        }
        if (value instanceof HTMLElement) {
            return `[HTMLElement ${value.tagName.toLowerCase()}${value.id ? '#' + value.id : ''}]`;
        }
        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean' || value == null) return String(value);
        if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;

        try {
            return JSON.stringify(value, (key, innerValue) => {
                if (typeof innerValue === 'function') return `[Function ${innerValue.name || 'anonymous'}]`;
                if (innerValue instanceof HTMLElement) {
                    return `[HTMLElement ${innerValue.tagName.toLowerCase()}${innerValue.id ? '#' + innerValue.id : ''}]`;
                }
                if (innerValue && typeof innerValue === 'object') {
                    if (seen.has(innerValue)) return '[Circular]';
                    seen.add(innerValue);
                }
                return innerValue;
            });
        } catch (error) {
            return Object.prototype.toString.call(value);
        }
    }

    function addEntry(level, args) {
        const message = Array.from(args).map(arg => {
            const text = safeStringify(arg);
            return text.length > MAX_FIELD_LENGTH ? `${text.slice(0, MAX_FIELD_LENGTH)}...` : text;
        }).join(' ');

        const entries = readEntries();
        entries.push({
            t: new Date().toISOString(),
            level,
            message
        });
        writeEntries(entries);
    }

    function getShortStack() {
        try {
            return (new Error().stack || '')
                .split('\n')
                .slice(2, 6)
                .map(line => line.trim())
                .filter(Boolean)
                .join(' | ');
        } catch (error) {
            return '';
        }
    }

    function installPowerInstrumentation() {
        if (window.__englishConquerorPowerInstrumentationInstalled) return;
        window.__englishConquerorPowerInstrumentationInstalled = true;

        if (originalTimers.setTimeout && originalTimers.clearTimeout) {
            window.setTimeout = function(callback, delay, ...args) {
                const createdAt = Date.now();
                let id;
                const wrapped = function(...callbackArgs) {
                    activeTimeouts.delete(id);
                    if (typeof callback === 'function') {
                        return callback.apply(this, callbackArgs);
                    }
                    try {
                        return Function(String(callback)).call(this);
                    } catch (error) {
                        console.error('[Diagnostic Timer] String timeout failed:', error);
                        return undefined;
                    }
                };
                id = originalTimers.setTimeout(wrapped, delay, ...args);
                activeTimeouts.set(id, {
                    delay: Number(delay) || 0,
                    createdAt,
                    stack: getShortStack()
                });
                return id;
            };

            window.clearTimeout = function(id) {
                activeTimeouts.delete(id);
                return originalTimers.clearTimeout(id);
            };
        }

        if (originalTimers.setInterval && originalTimers.clearInterval) {
            window.setInterval = function(callback, delay, ...args) {
                const createdAt = Date.now();
                const id = originalTimers.setInterval(function(...callbackArgs) {
                    const meta = activeIntervals.get(id);
                    if (meta) {
                        meta.tickCount += 1;
                        meta.lastTickAt = Date.now();
                    }
                    if (typeof callback === 'function') {
                        return callback.apply(this, callbackArgs);
                    }
                    try {
                        return Function(String(callback)).call(this);
                    } catch (error) {
                        console.error('[Diagnostic Timer] String interval failed:', error);
                        return undefined;
                    }
                }, delay, ...args);
                activeIntervals.set(id, {
                    delay: Number(delay) || 0,
                    createdAt,
                    tickCount: 0,
                    lastTickAt: 0,
                    stack: getShortStack()
                });
                return id;
            };

            window.clearInterval = function(id) {
                activeIntervals.delete(id);
                return originalTimers.clearInterval(id);
            };
        }

        if (originalTimers.requestAnimationFrame && originalTimers.cancelAnimationFrame) {
            window.requestAnimationFrame = function(callback) {
                const createdAt = Date.now();
                let id;
                const wrapped = function(timestamp) {
                    activeRafs.delete(id);
                    rafStats.frames += 1;
                    rafStats.lastFrameAt = Date.now();
                    const elapsed = rafStats.lastFrameAt - rafStats.windowStartedAt;
                    if (elapsed >= 5000) {
                        rafStats.fps = Math.round((rafStats.frames * 10000) / elapsed) / 10;
                        rafStats.frames = 0;
                        rafStats.windowStartedAt = rafStats.lastFrameAt;
                    }
                    return callback(timestamp);
                };
                id = originalTimers.requestAnimationFrame(wrapped);
                activeRafs.set(id, {
                    createdAt
                });
                return id;
            };

            window.cancelAnimationFrame = function(id) {
                activeRafs.delete(id);
                return originalTimers.cancelAnimationFrame(id);
            };
        }
    }

    installPowerInstrumentation();

    ['log', 'info', 'warn', 'error', 'debug'].forEach(level => {
        originalConsole[level] = console[level] ? console[level].bind(console) : console.log.bind(console);
        console[level] = function(...args) {
            addEntry(level, args);
            originalConsole[level](...args);
        };
    });

    function getDisplayState(id) {
        const el = document.getElementById(id);
        if (!el) return 'missing';
        return getComputedStyle(el).display;
    }

    function countActiveAnimations() {
        try {
            return document.getAnimations ? document.getAnimations().filter(animation => animation.playState === 'running').length : null;
        } catch (error) {
            return null;
        }
    }

    function summarizeIntervals() {
        const now = Date.now();
        const intervals = Array.from(activeIntervals.values()).map(meta => ({
            delay: meta.delay,
            ageSec: Math.round((now - meta.createdAt) / 1000),
            tickCount: meta.tickCount,
            lastTickAgeSec: meta.lastTickAt ? Math.round((now - meta.lastTickAt) / 1000) : null,
            stack: meta.stack
        }));

        intervals.sort((a, b) => {
            if (a.delay !== b.delay) return a.delay - b.delay;
            return b.tickCount - a.tickCount;
        });

        return {
            count: intervals.length,
            fastest: intervals.slice(0, 8)
        };
    }

    function summarizeTimeouts() {
        const now = Date.now();
        const timeouts = Array.from(activeTimeouts.values()).map(meta => ({
            delay: meta.delay,
            ageSec: Math.round((now - meta.createdAt) / 1000),
            stack: meta.stack
        }));
        timeouts.sort((a, b) => b.ageSec - a.ageSec);

        return {
            count: timeouts.length,
            oldest: timeouts.slice(0, 6)
        };
    }

    function getGameSnapshot() {
        const gameUi = document.getElementById('game-ui');
        const launchModal = document.getElementById('launch-modal');
        const timerBar = document.getElementById('timer-bar');
        const bgm = document.getElementById('bgm');
        const globalDebug = window.__englishConquerorDebug || {};

        const screenIds = [
            'start-screen',
            'game-mode-selection',
            'level-screen',
            'stage-screen',
            'grammar-topic-screen',
            'game-ui',
            'launch-modal',
            'settings-modal',
            'vocab-screen',
            'settlement-screen',
            'lobby-screen'
        ];
        const screens = screenIds.reduce((acc, id) => {
            acc[id] = getDisplayState(id);
            return acc;
        }, {});

        let gameDebugState = null;
        try {
            if (typeof window.getGameDebugState === 'function') {
                gameDebugState = window.getGameDebugState();
            }
        } catch (error) {
            gameDebugState = { error: safeStringify(error) };
        }

        let effectDebugState = null;
        try {
            if (typeof window.getEffectDebugState === 'function') {
                effectDebugState = window.getEffectDebugState();
            }
        } catch (error) {
            effectDebugState = { error: safeStringify(error) };
        }

        let bgmKnownActive = null;
        try {
            if (typeof window.isBgmKnownActive === 'function') bgmKnownActive = window.isBgmKnownActive();
        } catch (error) {}

        return {
            screens,
            visibleGameUi: !!(gameUi && getComputedStyle(gameUi).display !== 'none'),
            visibleLaunchModal: !!(launchModal && getComputedStyle(launchModal).display !== 'none'),
            timerBarWidth: timerBar?.style?.width || null,
            selectedGrammarTopic: window.selectedGrammarTopic || null,
            appState: globalDebug.app || null,
            audioState: globalDebug.audio || null,
            gameDebugState,
            effectDebugState,
            bgm: {
                htmlAudioPresent: !!bgm,
                htmlAudioPaused: bgm ? bgm.paused : null,
                htmlAudioCurrentTime: bgm ? Math.round((bgm.currentTime || 0) * 10) / 10 : null,
                htmlAudioVolume: bgm ? Math.round((bgm.volume || 0) * 100) / 100 : null,
                knownActive: bgmKnownActive,
                ducks: Array.isArray(window.__bgmDuckReasons) ? window.__bgmDuckReasons : null
            }
        };
    }

    function getPowerSnapshot(reason = 'sample') {
        const memory = performance?.memory ? {
            usedMB: Math.round(performance.memory.usedJSHeapSize / 1048576),
            totalMB: Math.round(performance.memory.totalJSHeapSize / 1048576),
            limitMB: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        } : null;

        return {
            reason,
            build: BUILD_TAG,
            sessionAgeSec: Math.round(performance.now() / 1000),
            time: new Date().toISOString(),
            url: location.href,
            platform: window.Capacitor?.getPlatform?.() || 'web',
            userAgent: navigator.userAgent,
            online: navigator.onLine,
            visibility: {
                state: document.visibilityState,
                hidden: document.hidden,
                hasFocus: typeof document.hasFocus === 'function' ? document.hasFocus() : null
            },
            screen: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio,
                orientation: screen.orientation?.type || null
            },
            battery: batteryState,
            timers: {
                intervals: summarizeIntervals(),
                timeouts: summarizeTimeouts(),
                pendingRaf: activeRafs.size,
                estimatedFps: rafStats.fps,
                activeCssAnimations: countActiveAnimations()
            },
            memory,
            game: getGameSnapshot()
        };
    }

    function logPowerSample(reason = 'sample') {
        const snapshot = getPowerSnapshot(reason);
        console.log('[Power Diagnostic] sample', snapshot);
        return snapshot;
    }

    function startPowerSampler() {
        if (powerSampleTimer || !originalTimers.setInterval) return;
        powerSampleTimer = originalTimers.setInterval(() => {
            logPowerSample('auto-60s');
        }, POWER_SAMPLE_INTERVAL_MS);
    }

    async function initBatteryDiagnostics() {
        if (!navigator.getBattery) {
            batteryState = { supported: false, reason: 'Battery API unavailable' };
            return;
        }

        try {
            const battery = await navigator.getBattery();
            const updateBatteryState = reason => {
                batteryState = {
                    supported: true,
                    reason,
                    level: typeof battery.level === 'number' ? Math.round(battery.level * 100) : null,
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
                console.log('[Power Diagnostic] battery', batteryState);
            };
            updateBatteryState('ready');
            battery.addEventListener?.('levelchange', () => updateBatteryState('levelchange'));
            battery.addEventListener?.('chargingchange', () => updateBatteryState('chargingchange'));
        } catch (error) {
            batteryState = { supported: false, reason: safeStringify(error) };
        }
    }

    function getStateSnapshot() {
        const overlay = document.getElementById('login-overlay');
        const panels = ['connecting-panel', 'login-panel', 'user-profile-panel'].reduce((acc, id) => {
            const el = document.getElementById(id);
            acc[id] = el ? getComputedStyle(el).display : 'missing';
            return acc;
        }, {});

        return {
            build: BUILD_TAG,
            url: location.href,
            userAgent: navigator.userAgent,
            online: navigator.onLine,
            platform: window.Capacitor?.getPlatform?.() || 'web',
            capacitorNative: !!window.Capacitor?.isNativePlatform?.(),
            firebaseAuthResolved: window.firebaseAuthResolved,
            firebaseProfileResolved: window.firebaseProfileResolved,
            isFirebaseAuthenticated: window.isFirebaseAuthenticated,
            myPlayerId: window.myPlayerId || null,
            diagnosticEntries: readEntries().length,
            diagnosticProbeRunning: !!probeInFlight,
            authFlowState: window.authFlowState || null,
            hasCachedUsername: !!localStorage.getItem('battleship_username'),
            hasCachedUid: !!localStorage.getItem('battleship_auth_uid'),
            overlayDisplay: overlay ? getComputedStyle(overlay).display : 'missing',
            panels,
            power: getPowerSnapshot('header')
        };
    }

    function buildLogText() {
        const entries = readEntries();
        const header = [
            'ENGLISH CONQUEROR DIAGNOSTIC LOG',
            `Generated: ${new Date().toISOString()}`,
            `State: ${safeStringify(getStateSnapshot())}`,
            ''
        ];
        return header.concat(entries.map(entry => `[${entry.t}] ${entry.level.toUpperCase()} ${entry.message}`)).join('\n');
    }

    async function copyText(text) {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }

        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.setAttribute('readonly', 'readonly');
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(textArea);
        return copied;
    }

    function getFirebaseConfig() {
        return window.firebaseConfig || {
            apiKey: 'AIzaSyCfo5jxY1zvkRJPuPtZOMYj1V0kT7Te11A',
            databaseURL: 'https://battleship-game-c0909-default-rtdb.asia-southeast1.firebasedatabase.app'
        };
    }

    async function probeFetch(label, url, options = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), options.timeoutMs || PROBE_TIMEOUT_MS);
        const startedAt = Date.now();

        try {
            const response = await fetch(url, {
                ...options.fetchOptions,
                cache: 'no-store',
                signal: controller.signal
            });
            clearTimeout(timeout);
            console.log('[Diagnostic Probe]', label, {
                reachable: true,
                status: response.status,
                ok: response.ok,
                ms: Date.now() - startedAt
            });
            return { label, reachable: true, status: response.status, ok: response.ok };
        } catch (error) {
            clearTimeout(timeout);
            console.error('[Diagnostic Probe]', label, {
                reachable: false,
                ms: Date.now() - startedAt,
                error: safeStringify(error)
            });
            return { label, reachable: false, error: safeStringify(error) };
        }
    }

    async function runNetworkProbe(reason = 'manual') {
        if (probeInFlight) {
            console.log('[Diagnostic Probe] Probe already running', { reason, run: probeRunCount });
            return probeInFlight;
        }

        const config = getFirebaseConfig();
        probeRunCount += 1;
        const run = probeRunCount;

        probeInFlight = (async () => {
            console.log('[Diagnostic Probe] Starting network probe', {
                build: BUILD_TAG,
                reason,
                run,
                online: navigator.onLine,
                platform: window.Capacitor?.getPlatform?.() || 'web'
            });

            const probes = [
                probeFetch('firebase-auth-module', 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'),
                probeFetch('identitytoolkit-accounts-lookup', `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(config.apiKey)}`, {
                    fetchOptions: {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({})
                    }
                }),
                probeFetch('securetoken-refresh', `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(config.apiKey)}`, {
                    fetchOptions: {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            grant_type: 'refresh_token',
                            refresh_token: 'diagnostic_invalid_refresh_token'
                        })
                    }
                }),
                probeFetch('firebase-rtdb-root', `${config.databaseURL}/.json?shallow=true`)
            ];

            const results = await Promise.all(probes);
            console.log('[Diagnostic Probe] Finished network probe', { reason, run, results });
            return results;
        })();

        try {
            return await probeInFlight;
        } finally {
            probeInFlight = null;
        }
    }

    function hasProbeEntries() {
        return readEntries().some(entry => entry.message.includes('[Diagnostic Probe]'));
    }

    function refreshPanelText() {
        const textArea = document.getElementById('diagnostic-log-text');
        if (textArea) textArea.value = buildLogText();
    }

    function ensurePanel() {
        let panel = document.getElementById('diagnostic-log-panel');
        if (panel) return panel;

        panel = document.createElement('div');
        panel.id = 'diagnostic-log-panel';
        panel.innerHTML = `
            <div class="diagnostic-log-box">
                <div class="diagnostic-log-title">DIAGNOSTIC LOG</div>
                <textarea id="diagnostic-log-text" readonly></textarea>
                <div class="diagnostic-log-actions">
                    <button type="button" data-diag-action="power">POWER</button>
                    <button type="button" data-diag-action="probe">PROBE</button>
                    <button type="button" data-diag-action="share">SHARE</button>
                    <button type="button" data-diag-action="copy">COPY</button>
                    <button type="button" data-diag-action="clear">CLEAR</button>
                    <button type="button" data-diag-action="close">CLOSE</button>
                </div>
                <div id="diagnostic-log-status" class="diagnostic-log-status"></div>
            </div>
        `;
        document.body.appendChild(panel);

        panel.addEventListener('click', event => {
            if (event.target === panel) window.battleDiagnostics.close();
        });
        panel.querySelector('.diagnostic-log-actions').addEventListener('click', async event => {
            const action = event.target?.dataset?.diagAction;
            if (!action) return;
            event.stopPropagation();
            const status = document.getElementById('diagnostic-log-status');
            const text = buildLogText();

            if (action === 'close') {
                window.battleDiagnostics.close();
                return;
            }
            if (action === 'clear') {
                writeEntries([]);
                console.log('[Diagnostic] Log cleared by user', { build: BUILD_TAG });
                runNetworkProbe('after-clear').finally(refreshPanelText);
                window.battleDiagnostics.open();
                if (status) status.textContent = 'CLEARED';
                return;
            }
            if (action === 'probe') {
                if (status) status.textContent = 'PROBING...';
                await runNetworkProbe('manual-button').catch(error => {
                    console.error('[Diagnostic Probe] Manual probe failed:', error);
                });
                refreshPanelText();
                if (status) status.textContent = 'PROBE DONE';
                return;
            }
            if (action === 'power') {
                logPowerSample('manual-button');
                refreshPanelText();
                if (status) status.textContent = 'POWER SAMPLE DONE';
                return;
            }
            if (action === 'copy') {
                const copied = await copyText(text).catch(() => false);
                if (status) status.textContent = copied ? 'COPIED' : 'COPY FAILED';
                return;
            }
            if (action === 'share') {
                if (navigator.share) {
                    try {
                        await navigator.share({ title: 'English Conqueror Diagnostic Log', text });
                        if (status) status.textContent = 'SHARED';
                        return;
                    } catch (error) {
                        console.warn('[Diagnostic] Share cancelled or failed:', error);
                    }
                }
                const copied = await copyText(text).catch(() => false);
                if (status) status.textContent = copied ? 'SHARE NOT AVAILABLE - COPIED' : 'SHARE FAILED';
            }
        });

        return panel;
    }

    window.battleDiagnostics = {
        add: addEntry,
        getText: buildLogText,
        probe: runNetworkProbe,
        powerSample: logPowerSample,
        getPowerSnapshot,
        open() {
            logPowerSample('panel-open');
            console.log('[Diagnostic] Opening diagnostic log panel', getStateSnapshot());
            const panel = ensurePanel();
            if (!hasProbeEntries()) {
                console.log('[Diagnostic] No probe entries found; running probe from panel open');
                runNetworkProbe('panel-open').finally(refreshPanelText);
            }
            refreshPanelText();
            panel.style.display = 'flex';
        },
        close() {
            const panel = document.getElementById('diagnostic-log-panel');
            if (panel) panel.style.display = 'none';
        },
        clear() {
            writeEntries([]);
        }
    };

    window.addEventListener('error', event => {
        addEntry('error', ['[window.error]', event.message, event.filename, event.lineno, event.colno, event.error]);
    });
    window.addEventListener('unhandledrejection', event => {
        addEntry('error', ['[unhandledrejection]', event.reason]);
    });
    window.addEventListener('online', () => console.log('[Network] online'));
    window.addEventListener('offline', () => console.warn('[Network] offline'));
    document.addEventListener('visibilitychange', () => {
        logPowerSample(document.hidden ? 'visibility-hidden' : 'visibility-visible');
    });
    window.addEventListener('pagehide', () => logPowerSample('pagehide'));
    window.addEventListener('pageshow', () => logPowerSample('pageshow'));
    window.addEventListener('blur', () => logPowerSample('window-blur'));
    window.addEventListener('focus', () => logPowerSample('window-focus'));

    console.log('[Diagnostic] Logger ready', {
        build: BUILD_TAG,
        href: location.href,
        userAgent: navigator.userAgent,
        online: navigator.onLine
    });
    initBatteryDiagnostics();
    startPowerSampler();

    setTimeout(() => {
        runNetworkProbe('startup').catch(error => {
            console.error('[Diagnostic Probe] Unexpected probe failure:', error);
        });
    }, 1200);
})();
