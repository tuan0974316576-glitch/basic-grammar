let authOverlayTimeout = null;

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
    showMainMenu();
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
}

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

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
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
    }, 500);

    const gameWrapper = document.getElementById('game-content-wrapper');
    if (gameWrapper) {
        gameWrapper.style.display = 'block';

        const cachedName = localStorage.getItem('battleship_username');
        const cachedUid = localStorage.getItem('battleship_auth_uid');
        if ((cachedName && cachedUid) || (cachedName && window.isFirebaseAuthenticated)) {
            console.log('[startExperience] Cached auth found, keeping CONNECTING panel until Firebase resolves');
            switchHudPanel('connecting-panel');
        } else {
            console.log('[startExperience] New user or not authenticated, showing login panel');
            document.getElementById('start-screen').style.display = 'flex';
        }
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
