let authOverlayTimeout = null;
window.pendingAuthFlowPatch = window.pendingAuthFlowPatch || null;
window.authFlowState = window.authFlowState || {
    started: false,
    resolved: false,
    authenticated: false,
    needsRegistration: false,
    displayName: null,
    currentView: null
};

function hideMainMenuChrome() {
    const carousel = document.getElementById('main-menu-carousel');
    const gameModeSelect = document.getElementById('game-mode-selection');
    const suppliesDisplay = document.getElementById('coins-display');

    if (carousel) carousel.style.display = 'none';
    if (gameModeSelect) gameModeSelect.style.display = 'none';
    if (suppliesDisplay) suppliesDisplay.style.display = 'none';
}

window.applyAuthFlowState = function(patch = {}) {
    Object.assign(window.authFlowState, patch);

    if (!window.authFlowState.started) {
        window.pendingAuthFlowPatch = { ...patch };
        return;
    }

    window.pendingAuthFlowPatch = null;

    const startScreen = document.getElementById('start-screen');
    const regModal = document.getElementById('registration-modal');
    const overlay = document.getElementById('login-overlay');

    if (startScreen) startScreen.style.display = 'flex';
    if (overlay) overlay.style.display = 'none';

    let nextView = 'login';
    if (!window.authFlowState.resolved) {
        nextView = 'connecting';
    } else if (window.authFlowState.authenticated && window.authFlowState.needsRegistration) {
        nextView = 'registration';
    } else if (window.authFlowState.authenticated && window.authFlowState.displayName) {
        nextView = 'main';
    }

    if (window.authFlowState.currentView === nextView && !patch.force) {
        return;
    }
    window.authFlowState.currentView = nextView;

    if (nextView === 'main') {
        if (regModal) regModal.style.display = 'none';
        showMainMenu();
        return;
    }

    hideMainMenuChrome();

    if (nextView === 'registration') {
        switchHudPanel('login-panel');
        if (regModal) regModal.style.display = 'flex';
        if (typeof syncRegistrationInputMode === 'function') syncRegistrationInputMode();
        return;
    }

    if (regModal) regModal.style.display = 'none';
    switchHudPanel(nextView === 'connecting' ? 'connecting-panel' : 'login-panel');
};

window.reconcileAuthFlowState = function(force = false) {
    const splash = document.getElementById('splash-screen');
    const splashHidden = !splash || splash.style.display === 'none';
    const gameWrapper = document.getElementById('game-content-wrapper');
    const appVisible = !!(gameWrapper && gameWrapper.style.display !== 'none');
    const cachedName = localStorage.getItem('battleship_username');
    const cachedUid = localStorage.getItem('battleship_auth_uid');

    if (!window.authFlowState.started && (splashHidden || appVisible)) {
        window.authFlowState.started = true;
    }

    if (!window.authFlowState.started) return;

    if (window.pendingAuthFlowPatch) {
        const pendingPatch = { ...window.pendingAuthFlowPatch, force: true };
        window.pendingAuthFlowPatch = null;
        window.applyAuthFlowState(pendingPatch);
        return;
    }

    if (window.isFirebaseAuthenticated && window.myPlayerId) {
        window.applyAuthFlowState({
            resolved: true,
            authenticated: true,
            needsRegistration: !(cachedName && cachedUid && cachedUid === window.myPlayerId),
            displayName: (cachedUid === window.myPlayerId ? cachedName : null) || null,
            force
        });
        return;
    }

    window.applyAuthFlowState({
        resolved: true,
        authenticated: false,
        needsRegistration: false,
        displayName: null,
        force
    });
};

window.cancelAuthOverlay = function() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'none';
    if (authOverlayTimeout) {
        clearTimeout(authOverlayTimeout);
        authOverlayTimeout = null;
    }
    if (typeof playSound === 'function') playSound('delete-sfx');
};

function startAuthOverlayTimeout() {
    if (authOverlayTimeout) clearTimeout(authOverlayTimeout);
    authOverlayTimeout = setTimeout(() => {
        const overlay = document.getElementById('login-overlay');
        if (overlay && overlay.style.display !== 'none') {
            overlay.style.display = 'none';
            console.log('Auth overlay auto-dismissed (timeout)');
        }
    }, 30000);
}

window.playAsGuest = function() {
    const { getAuth, signInAnonymously } = window.firebaseModules;
    if (typeof playSound === 'function') playSound('deploy-sfx');

    document.getElementById('login-overlay').style.display = 'flex';
    startAuthOverlayTimeout();
    playBgm();

    signInAnonymously(getAuth()).catch(error => {
        alert(error.message);
        cancelAuthOverlay();
    });
};

window.loginWithGoogle = function() {
    const { getAuth, GoogleAuthProvider, signInWithPopup, linkWithPopup } = window.firebaseModules;
    if (typeof playSound === 'function') playSound('deploy-sfx');

    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'flex';
    startAuthOverlayTimeout();

    if (typeof playBgm === 'function') playBgm();

    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const authAction = auth.currentUser && auth.currentUser.isAnonymous
        ? linkWithPopup(auth.currentUser, provider)
        : signInWithPopup(auth, provider);

    authAction
        .then(() => {
            console.log('[Google Login] Auth success, waiting for onAuthStateChanged...');
        })
        .catch(error => {
            cancelAuthOverlay();

            if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
                console.log('User cancelled login.');
                return;
            }

            if (error.code === 'auth/unauthorized-domain') {
                alert('System Error: Unauthorized Domain (Check Firebase Console)');
            } else {
                alert('LOGIN FAILED: ' + error.message);
            }
        });
};

window.loginWithApple = function() {
    const { getAuth, OAuthProvider, signInWithPopup, linkWithPopup } = window.firebaseModules;
    if (typeof playSound === 'function') playSound('deploy-sfx');

    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'flex';
    startAuthOverlayTimeout();

    if (typeof playBgm === 'function') playBgm();

    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');

    const auth = getAuth();
    const authAction = auth.currentUser && auth.currentUser.isAnonymous
        ? linkWithPopup(auth.currentUser, provider)
        : signInWithPopup(auth, provider);

    authAction
        .then(() => {
            console.log('[Apple Login] Auth success, waiting for onAuthStateChanged...');
        })
        .catch(error => {
            cancelAuthOverlay();

            if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
                console.log('User cancelled Apple login.');
                return;
            }

            if (error.code === 'auth/unauthorized-domain') {
                alert('System Error: Unauthorized Domain (Check Firebase Console)');
            } else {
                alert('APPLE LOGIN FAILED: ' + error.message);
            }
        });
};

window.logout = function() {
    const { getAuth, signOut } = window.firebaseModules;
    if (typeof playSound === 'function') playSound('delete-sfx');

    localStorage.removeItem('battleship_username');

    signOut(getAuth()).then(() => {
        localStorage.removeItem('battleship_auth_uid');
        document.getElementById('main-menu-carousel').style.display = 'none';
        document.getElementById('game-mode-selection').style.display = 'none';
        console.log('LOGOUT SUCCESSFUL -> RETURN TO LOGIN');
    });
};

window.changeName = function() {
    const newName = prompt('ENTER NEW CALLSIGN:');
    if (newName && newName.trim() !== '') {
        document.getElementById('hud-player-name').innerText = newName.toUpperCase();
    }
};

let currentUserUid = null;

function shouldUseRegistrationGameKeyboard() {
    if (typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

function syncRegistrationInputMode() {
    const regInput = document.getElementById('reg-input');
    const regKeyboard = document.getElementById('registration-keyboard');
    const useGameKeyboard = shouldUseRegistrationGameKeyboard();

    if (regKeyboard) {
        regKeyboard.style.display = useGameKeyboard ? 'flex' : 'none';
    }

    if (regInput) {
        if (useGameKeyboard) {
            regInput.setAttribute('readonly', 'readonly');
            regInput.setAttribute('inputmode', 'none');
            regInput.blur();
        } else {
            regInput.removeAttribute('readonly');
            regInput.setAttribute('inputmode', 'text');

            if (isRegistrationModalVisible()) {
                setTimeout(() => regInput.focus(), 0);
            }
        }
    }
}

function isRegistrationModalVisible() {
    const modal = document.getElementById('registration-modal');
    return !!(modal && modal.style.display !== 'none');
}

function setRegistrationValue(nextValue) {
    const input = document.getElementById('reg-input');
    if (!input) return;
    input.value = nextValue.toUpperCase().slice(0, 12);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function handleRegistrationKeyInput(keyValue) {
    if (!isRegistrationModalVisible()) return;

    const input = document.getElementById('reg-input');
    const errorMsg = document.getElementById('reg-error');
    if (!input) return;

    if (errorMsg) errorMsg.innerText = '';

    if (keyValue === 'BACKSPACE') {
        setRegistrationValue(input.value.slice(0, -1));
        if (typeof playSound === 'function') playSound('delete-sfx');
        return;
    }

    if (keyValue === 'ENTER') {
        submitRegistration();
        return;
    }

    if (!/^[A-Z0-9]$/.test(keyValue)) return;
    if (input.value.length >= 12) return;

    setRegistrationValue(input.value + keyValue);
    if (typeof playSound === 'function') playSound('enter-sfx');
}

window.submitRegistration = function() {
    const input = document.getElementById('reg-input');
    const errorMsg = document.getElementById('reg-error');

    if (!input) return;
    const name = input.value.trim().toUpperCase();

    if (name.length < 2 || name.length > 12) {
        if (errorMsg) errorMsg.innerText = 'ERROR: NAME MUST BE 2-12 CHARS';
        if (typeof playSound === 'function') playSound('wrong-sfx');
        return;
    }

    const { getDatabase, ref, update, getAuth } = window.firebaseModules;
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        alert('CRITICAL ERROR: USER NOT LOGGED IN');
        return;
    }

    const db = getDatabase();

    userTotalXP = 0;
    window.userTotalXP = 0;
    userMastery = { reading: {}, listening: {}, speaking: {} };
    window.userMastery = { reading: {}, listening: {}, speaking: {} };
    userSupplies = 0;
    window.userSupplies = 0;

    update(ref(db, 'users/' + user.uid), {
        displayName: name,
        lastLogin: Date.now(),
        xp: 0,
        supplies: 0
    }).then(() => {
        localStorage.setItem('battleship_username', name);
        localStorage.setItem('battleship_auth_uid', user.uid);
        if (typeof playSound === 'function') playSound('deploy-sfx');

        const modal = document.getElementById('registration-modal');
        if (modal) modal.style.display = 'none';

        revealMainMenuWhenHudReady(name);
    }).catch(error => {
        console.error(error);
        if (errorMsg) errorMsg.innerText = 'DB ERROR: ' + error.message;
        if (typeof playSound === 'function') playSound('wrong-sfx');
    });
};

document.addEventListener('DOMContentLoaded', function() {
    const regInput = document.getElementById('reg-input');
    const regKeyboard = document.getElementById('registration-keyboard');

    if (regInput) {
        regInput.addEventListener('focus', function() {
            if (shouldUseRegistrationGameKeyboard()) {
                regInput.blur();
            }
        });

        regInput.addEventListener('keydown', function(e) {
            if (shouldUseRegistrationGameKeyboard()) {
                e.preventDefault();
            }
        });
    }

    if (regKeyboard) {
        regKeyboard.addEventListener('click', function(e) {
            const key = e.target.closest('[data-reg-key]');
            if (!key) return;
            e.preventDefault();
            e.stopPropagation();
            handleRegistrationKeyInput(key.getAttribute('data-reg-key'));
        });

        regKeyboard.addEventListener('touchstart', function(e) {
            const key = e.target.closest('.kb-key');
            if (!key) return;
            key.classList.add('kb-active');
        }, { passive: true });

        regKeyboard.addEventListener('touchend', function(e) {
            const key = e.target.closest('.kb-key');
            if (!key) return;
            setTimeout(() => key.classList.remove('kb-active'), 100);
        }, { passive: true });

        regKeyboard.addEventListener('touchcancel', function(e) {
            const key = e.target.closest('.kb-key');
            if (!key) return;
            key.classList.remove('kb-active');
        }, { passive: true });
    }

    document.addEventListener('keydown', function(e) {
        if (!isRegistrationModalVisible()) return;
        if (shouldUseRegistrationGameKeyboard()) return;

        if (/^[a-zA-Z0-9]$/.test(e.key)) {
            const regInput = document.getElementById('reg-input');
            const errorMsg = document.getElementById('reg-error');
            if (errorMsg) errorMsg.innerText = '';
            if (regInput) {
                regInput.value = regInput.value.toUpperCase();
            }
        }

        if (e.key === 'Backspace') {
            const errorMsg = document.getElementById('reg-error');
            if (errorMsg) errorMsg.innerText = '';
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            handleRegistrationKeyInput('ENTER');
        }
    });

    syncRegistrationInputMode();
    window.addEventListener('resize', syncRegistrationInputMode);
    if (typeof window.reconcileAuthFlowState === 'function') {
        setTimeout(() => window.reconcileAuthFlowState(true), 0);
    }
});

async function updateHUD(name) {
    const hudName = document.getElementById('hud-player-name');
    if (hudName) hudName.innerText = name;

    const xp = userTotalXP || window.userTotalXP || 0;
    if (typeof getRankForXP === 'function') {
        const rank = getRankForXP(xp);
        const rankEl = document.getElementById('hud-rank-title');
        if (rankEl) {
            await checkGlobalRankAndUpdateIcon(rankEl, rank);
        }
        updateExpBar(xp, rank);
    }
}

async function revealMainMenuWhenHudReady(name) {
    if (typeof updateHUD === 'function') {
        await updateHUD(name);
    }
    if (typeof window.applyAuthFlowState === 'function') {
        window.applyAuthFlowState({
            resolved: true,
            authenticated: true,
            needsRegistration: false,
            displayName: name,
            force: true
        });
    } else {
        showMainMenu();
    }
}

async function checkGlobalRankAndUpdateIcon(rankEl, rank) {
    console.log('[HUD] checkGlobalRankAndUpdateIcon called for player:', window.myPlayerId);

    const defaultIconPath = `ranking_icon/white/${rank.iconFile}`;
    rankEl.innerHTML = `${rank.name} <img src="${defaultIconPath}" style="width: 24px; height: 24px; vertical-align: middle; margin-left: 4px;" onerror="this.style.display='none'">`;

    if (!window.myPlayerId) {
        console.log('[HUD] Player ID not ready yet, skipping rank check');
        return;
    }

    try {
        const { ref, query, orderByChild, limitToLast, get } = firebaseModules;
        const usersRef = ref(window.db, 'users');
        const top10Query = query(usersRef, orderByChild('xp'), limitToLast(10));
        const snapshot = await get(top10Query);

        let xpRankIndex = -1;
        if (snapshot.exists()) {
            const top10 = [];
            snapshot.forEach(childSnapshot => {
                top10.push({
                    id: childSnapshot.key,
                    xp: childSnapshot.val().xp || 0
                });
            });
            top10.sort((a, b) => b.xp - a.xp);
            xpRankIndex = top10.findIndex(user => user.id === window.myPlayerId);
            console.log('[HUD] My XP rank index:', xpRankIndex);
        }

        let pvpRankIndex = -1;
        const allUsersSnapshot = await get(usersRef);
        if (allUsersSnapshot.exists()) {
            const users = allUsersSnapshot.val();
            const userArray = Object.keys(users)
                .map(uid => ({
                    uid,
                    pvpWins: users[uid].pvpWins || 0
                }))
                .filter(user => user.pvpWins > 0);

            userArray.sort((a, b) => b.pvpWins - a.pvpWins);
            const top10PVP = userArray.slice(0, 10);
            pvpRankIndex = top10PVP.findIndex(user => user.uid === window.myPlayerId);
            console.log('[HUD] My PVP rank index:', pvpRankIndex);
        }

        const xpColor = xpRankIndex !== -1 ? getIconColor(xpRankIndex) : 'white';
        const pvpColor = pvpRankIndex !== -1 ? getIconColor(pvpRankIndex) : 'white';
        const colorPriority = { gold: 4, silver: 3, bronze: 2, white: 1 };
        const bestColor = colorPriority[xpColor] > colorPriority[pvpColor] ? xpColor : pvpColor;
        const iconPath = `ranking_icon/${bestColor}/${rank.iconFile}`;
        rankEl.innerHTML = `${rank.name} <img src="${iconPath}" style="width: 24px; height: 24px; vertical-align: middle; margin-left: 4px;" onerror="this.style.display='none'">`;
    } catch (error) {
        console.error('[HUD] Error checking ranks:', error);
    }
}

async function updateOpponentRankBadge(opponentId) {
    try {
        const { ref, query, orderByChild, limitToLast, get } = firebaseModules;
        const opponentRef = ref(window.db, `users/${opponentId}`);
        const opponentSnapshot = await get(opponentRef);

        if (!opponentSnapshot.exists()) {
            console.log('[PVP] Opponent data not found');
            return;
        }

        const opponentXP = opponentSnapshot.val().xp || 0;
        const opponentRank = getRankForXP(opponentXP);
        const usersRef = ref(window.db, 'users');
        const top10Query = query(usersRef, orderByChild('xp'), limitToLast(10));
        const snapshot = await get(top10Query);

        if (!snapshot.exists()) {
            updateEnemySectorLabel(opponentRank, 'white');
            return;
        }

        const top10 = [];
        snapshot.forEach(childSnapshot => {
            top10.push({
                id: childSnapshot.key,
                xp: childSnapshot.val().xp || 0
            });
        });
        top10.sort((a, b) => b.xp - a.xp);

        const opponentIndex = top10.findIndex(user => user.id === opponentId);
        if (opponentIndex !== -1) {
            const iconColor = getIconColor(opponentIndex);
            updateEnemySectorLabel(opponentRank, iconColor);
            console.log(`[PVP] Opponent is rank #${opponentIndex + 1} globally. Icon: ${iconColor}`);
        } else {
            updateEnemySectorLabel(opponentRank, 'white');
            console.log('[PVP] Opponent not in top 10. Using white icon.');
        }
    } catch (error) {
        console.error('[PVP] Error updating opponent rank badge:', error);
    }
}

function updateEnemySectorLabel(rank, iconColor) {
    const enemyLabel = document.querySelector('#enemy-board .board-label');
    if (!enemyLabel) return;

    const iconPath = `ranking_icon/${iconColor}/${rank.iconFile}`;
    enemyLabel.innerHTML = `<img src="${iconPath}" style="width: 32px; height: 32px; vertical-align: middle; margin-right: 8px;" onerror="this.style.display='none'"><span style="color: var(--danger);">ENEMY SECTOR</span>`;
}

function updateExpBar(currentXP, rank) {
    const expBarFill = document.getElementById('exp-bar-fill');
    const expBarText = document.getElementById('exp-bar-text');
    const expBarLabel = document.querySelector('.exp-bar-label span:first-child');

    if (!expBarFill || !expBarText) return;

    const currentRankXP = rank.minXP;
    const nextRankXP = rank.nextXP;

    if (nextRankXP === null) {
        expBarFill.style.width = '100%';
        expBarText.innerText = `${currentXP.toLocaleString()} / MAX`;
        if (expBarLabel) expBarLabel.innerText = 'MAX RANK';
    } else {
        const xpInCurrentRank = currentXP - currentRankXP;
        const xpNeededForNextRank = nextRankXP - currentRankXP;
        const percentage = Math.min(100, Math.max(0, (xpInCurrentRank / xpNeededForNextRank) * 100));

        expBarFill.style.width = percentage + '%';
        expBarText.innerText = `${currentXP.toLocaleString()} / ${nextRankXP.toLocaleString()}`;

        const nextRankData = RANK_TABLE[rank.level];
        if (expBarLabel && nextRankData) {
            expBarLabel.innerText = `NEXT RANK: ${nextRankData.name}`;
        }
    }

    console.log(`[EXP Bar] Updated: ${currentXP} / ${nextRankXP || 'MAX'}`);
}

function updateSuppliesDisplay() {
    const suppliesAmount = document.getElementById('coins-amount');
    if (suppliesAmount) {
        const supplies = userSupplies || window.userSupplies || 0;
        suppliesAmount.innerText = `SUPPLIES: ${supplies.toLocaleString()}`;
        console.log('[Supplies] Updated display:', supplies);
    }
}

function revealAuthenticatedMainMenu() {
    const splash = document.getElementById('splash-screen');
    const gameWrapper = document.getElementById('game-content-wrapper');
    const startScreen = document.getElementById('start-screen');

    if (splash && splash.style.display !== 'none') {
        splash.style.opacity = '0';
        splash.style.display = 'none';
        console.log('[revealAuthenticatedMainMenu] Splash dismissed for authenticated auto-login');
    }

    if (gameWrapper) {
        gameWrapper.style.display = 'block';
    }

    if (startScreen) {
        startScreen.style.display = 'flex';
    }
}

function showMainMenu() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        console.log('[showMainMenu] Hiding login overlay');
    }

    if (window.isFirebaseAuthenticated && window.myPlayerId) {
        revealAuthenticatedMainMenu();
    }

    if (typeof hideMenuOverlayScreens === 'function') {
        hideMenuOverlayScreens();
    }

    switchHudPanel('user-profile-panel');

    const gameModeSelect = document.getElementById('game-mode-selection');
    const statusText = document.getElementById('system-status-text');
    if (gameModeSelect) gameModeSelect.style.display = 'flex';

    const carouselWrapper = document.getElementById('main-menu-carousel');
    if (carouselWrapper) {
        carouselWrapper.style.display = 'flex';
        carouselWrapper.style.animation = 'fadeIn 0.5s';
    }

    const splash = document.getElementById('splash-screen');
    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        if (!splash || splash.style.display === 'none') {
            suppliesDisplay.style.display = 'block';
            updateSuppliesDisplay();
        } else {
            console.log('[showMainMenu] Splash screen still visible, hiding supplies');
            suppliesDisplay.style.display = 'none';
        }
    }

    if (statusText) {
        statusText.innerText = 'IDENTITY CONFIRMED // SYSTEM READY';
        statusText.style.color = '#0ea5e9';
    }

    playBgm();
    initCarouselControl();
    if (typeof window.requestLandscapeForTablet === 'function') {
        window.requestLandscapeForTablet();
    }
}

window.requestLandscapeForTablet = async function() {
    const isTouchDevice = navigator.maxTouchPoints > 0 && typeof window.matchMedia === 'function' && !window.matchMedia('(pointer: fine)').matches;
    const shortestSide = Math.min(window.screen?.width || window.innerWidth, window.screen?.height || window.innerHeight);
    const isTablet = isTouchDevice && shortestSide >= 700;
    if (!isTablet) return;

    try {
        if (screen.orientation && typeof screen.orientation.lock === 'function') {
            await screen.orientation.lock('landscape');
        }
    } catch (error) {
        console.log('[Orientation] Landscape lock skipped:', error?.message || error);
    }
};

window.startExperience = function() {
    window.ignoreConnectionAlert = true;
    setTimeout(() => {
        window.ignoreConnectionAlert = false;
    }, 3000);

    if (window.Capacitor) {
        try {
            const { Keyboard } = window.Capacitor.Plugins;
            if (Keyboard) {
                Keyboard.setAccessoryBarVisible({ isVisible: false });
                Keyboard.setScroll({ isDisabled: true });
            }
        } catch (error) {
            console.log('Keyboard config error:', error);
        }
    }

    playBgm();
    if (typeof playSound === 'function') playSound('deploy-sfx');
    if (typeof window.requestLandscapeForTablet === 'function') {
        window.requestLandscapeForTablet();
    }

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const cachedName = localStorage.getItem('battleship_username');
    const cachedUid = localStorage.getItem('battleship_auth_uid');
    const shouldWaitForFirebase = !!((cachedName && cachedUid) || window.isFirebaseAuthenticated);

    if (typeof window.applyAuthFlowState === 'function') {
        window.authFlowState.started = true;
        if (shouldWaitForFirebase) {
            window.applyAuthFlowState({
                resolved: false,
                authenticated: true,
                needsRegistration: false,
                displayName: null,
                force: true
            });
        } else {
            window.applyAuthFlowState({
                resolved: true,
                authenticated: false,
                needsRegistration: false,
                displayName: null,
                force: true
            });
        }
        if (typeof window.reconcileAuthFlowState === 'function') {
            window.reconcileAuthFlowState(true);
        }
    }

    const splash = document.getElementById('splash-screen');
    splash.style.opacity = '0';
    setTimeout(() => {
        splash.style.display = 'none';

        if (window.isFirebaseAuthenticated && window.myPlayerId) {
            const nextSuppliesDisplay = document.getElementById('coins-display');
            if (nextSuppliesDisplay) {
                nextSuppliesDisplay.style.display = 'block';
                if (typeof updateSuppliesDisplay === 'function') {
                    updateSuppliesDisplay();
                }
            }
        }

        if (typeof window.applyAuthFlowState === 'function') {
            window.applyAuthFlowState({
                started: true,
                ...(window.authFlowState.resolved ? {} : shouldWaitForFirebase
                    ? { resolved: false, authenticated: true, needsRegistration: false, displayName: null }
                    : { resolved: true, authenticated: false, needsRegistration: false, displayName: null })
            });
            if (typeof window.reconcileAuthFlowState === 'function') {
                window.reconcileAuthFlowState(true);
            }
        }
    }, 500);

    const gameWrapper = document.getElementById('game-content-wrapper');
    if (gameWrapper) {
        gameWrapper.style.display = 'block';
    }
};

function switchHudPanel(panelId) {
    document.getElementById('connecting-panel').style.display = 'none';
    document.getElementById('login-panel').style.display = 'none';
    document.getElementById('user-profile-panel').style.display = 'none';

    const carousel = document.getElementById('main-menu-carousel');
    if (carousel) carousel.style.display = 'none';

    const target = document.getElementById(panelId);
    if (target) {
        target.style.display = 'block';

        if (panelId === 'user-profile-panel') {
            console.log('[switchHudPanel] Triggering holoAppear animation for user-profile-panel');
            target.style.animation = 'none';
            void target.offsetWidth;
            target.style.animation = 'holoAppear 0.4s forwards';
            console.log('[switchHudPanel] Animation set:', target.style.animation);
        } else {
            target.style.animation = 'fadeIn 0.5s';
        }
    } else {
        console.warn('[switchHudPanel] Target panel not found:', panelId);
    }
}
