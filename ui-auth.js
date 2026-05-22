let authOverlayTimeout = null;
let authResolveFallbackTimeout = null;
let hudRankRefreshToken = 0;
const AUTH_FLOW_FALLBACK_MS = 8000;
const PLAYER_PROFILE_CACHE_KEY = 'battleship_player_profile_cache_v1';
window.pendingAuthFlowPatch = window.pendingAuthFlowPatch || null;
if (typeof window.firebaseAuthResolved !== 'boolean') {
    window.firebaseAuthResolved = false;
}
if (typeof window.firebaseProfileResolved !== 'boolean') {
    window.firebaseProfileResolved = false;
}
window.authFlowState = window.authFlowState || {
    started: false,
    resolved: false,
    authenticated: false,
    needsRegistration: false,
    displayName: null,
    currentView: null
};

function readPlayerProfileCacheStore() {
    try {
        const parsed = JSON.parse(localStorage.getItem(PLAYER_PROFILE_CACHE_KEY) || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        console.warn('[Profile Cache] Failed to read cache:', error);
        return {};
    }
}

function writePlayerProfileCacheStore(store) {
    localStorage.setItem(PLAYER_PROFILE_CACHE_KEY, JSON.stringify(store));
}

function getCachedPlayerProfile(uid = localStorage.getItem('battleship_auth_uid')) {
    if (!uid) return null;
    const store = readPlayerProfileCacheStore();
    const profile = store.profiles?.[uid];
    if (!profile || profile.uid !== uid || !profile.displayName) return null;
    if (typeof profile.xp !== 'number' || typeof profile.supplies !== 'number') return null;
    return profile;
}

function cachePlayerProfile(uid, profilePatch = {}) {
    if (!uid) return null;

    const store = readPlayerProfileCacheStore();
    const profiles = store.profiles && typeof store.profiles === 'object' ? store.profiles : {};
    const existing = profiles[uid] || {};
    const profile = {
        ...existing,
        uid,
        displayName: profilePatch.displayName || existing.displayName || localStorage.getItem('battleship_username') || '',
        xp: Number.isFinite(profilePatch.xp) ? profilePatch.xp : (Number.isFinite(existing.xp) ? existing.xp : 0),
        supplies: Number.isFinite(profilePatch.supplies) ? profilePatch.supplies : (Number.isFinite(existing.supplies) ? existing.supplies : 0),
        updatedAt: Date.now()
    };

    ['mastery', 'sentenceProgress', 'unlockedRaces'].forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(profilePatch, key)) {
            profile[key] = profilePatch[key];
        }
    });

    if (!profile.displayName) return null;

    profiles[uid] = profile;
    try {
        writePlayerProfileCacheStore({ version: 1, profiles });
    } catch (error) {
        console.warn('[Profile Cache] Full cache write failed, saving core stats only:', error);
        const slimProfiles = {
            ...profiles,
            [uid]: {
                uid,
                displayName: profile.displayName,
                xp: profile.xp,
                supplies: profile.supplies,
                unlockedRaces: profile.unlockedRaces,
                updatedAt: profile.updatedAt
            }
        };
        try {
            writePlayerProfileCacheStore({ version: 1, profiles: slimProfiles });
        } catch (slimError) {
            console.warn('[Profile Cache] Core cache write failed:', slimError);
        }
    }

    localStorage.setItem('battleship_username', profile.displayName);
    localStorage.setItem('battleship_auth_uid', uid);
    return profile;
}

function applyCachedPlayerProfile(profile) {
    if (!profile) return false;

    window.userTotalXP = Number.isFinite(profile.xp) ? profile.xp : 0;
    window.userSupplies = Number.isFinite(profile.supplies) ? profile.supplies : 0;
    if (profile.mastery) window.userMastery = profile.mastery;
    if (profile.sentenceProgress) window.userSentenceProgress = profile.sentenceProgress;
    if (profile.unlockedRaces) window.unlockedRaces = profile.unlockedRaces;

    if (typeof userTotalXP !== 'undefined') userTotalXP = window.userTotalXP;
    if (typeof userSupplies !== 'undefined') userSupplies = window.userSupplies;
    if (profile.mastery && typeof userMastery !== 'undefined') userMastery = window.userMastery;
    if (profile.sentenceProgress && typeof userSentenceProgress !== 'undefined') userSentenceProgress = window.userSentenceProgress;
    if (profile.unlockedRaces && typeof unlockedRaces !== 'undefined') unlockedRaces = window.unlockedRaces;
    if (typeof normalizeSentenceProgressState === 'function') normalizeSentenceProgressState();

    localStorage.setItem('battleship_username', profile.displayName);
    localStorage.setItem('battleship_auth_uid', profile.uid);
    return true;
}

function cacheCurrentPlayerProfile(profilePatch = {}) {
    const uid = profilePatch.uid || window.myPlayerId || localStorage.getItem('battleship_auth_uid');
    if (!uid) return null;
    const payload = {
        displayName: localStorage.getItem('battleship_username') || profilePatch.displayName,
        xp: Number.isFinite(window.userTotalXP) ? window.userTotalXP : profilePatch.xp,
        supplies: Number.isFinite(window.userSupplies) ? window.userSupplies : profilePatch.supplies,
        ...profilePatch
    };
    ['mastery', 'sentenceProgress', 'unlockedRaces'].forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(payload, key) && Object.prototype.hasOwnProperty.call(profilePatch, key)) {
            payload[key] = profilePatch[key];
        }
    });
    return cachePlayerProfile(uid, payload);
}

window.getCachedPlayerProfile = getCachedPlayerProfile;
window.cachePlayerProfile = cachePlayerProfile;
window.applyCachedPlayerProfile = applyCachedPlayerProfile;
window.cacheCurrentPlayerProfile = cacheCurrentPlayerProfile;

function clearAuthResolveFallback() {
    if (!authResolveFallbackTimeout) return;
    clearTimeout(authResolveFallbackTimeout);
    authResolveFallbackTimeout = null;
}

function resolveAuthFlowFromTimeout() {
    if (!window.authFlowState?.started || window.authFlowState.resolved) return;

    const cachedName = localStorage.getItem('battleship_username');
    const cachedUid = localStorage.getItem('battleship_auth_uid');
    const hasVerifiedUser = !!(window.isFirebaseAuthenticated && window.myPlayerId);

    console.warn('[Auth Flow] Startup auth fallback fired', {
        firebaseAuthResolved: window.firebaseAuthResolved,
        firebaseProfileResolved: window.firebaseProfileResolved,
        hasVerifiedUser,
        hasCachedName: !!cachedName
    });

    if (hasVerifiedUser) {
        const cachedProfile = getCachedPlayerProfile(window.myPlayerId);
        if (cachedProfile) {
            applyCachedPlayerProfile(cachedProfile);
            window.firebaseAuthResolved = true;
            window.firebaseProfileResolved = true;
            if (typeof updateHUD === 'function') {
                Promise.resolve(updateHUD(cachedProfile.displayName)).catch(error => {
                    console.error('[Auth Flow] Cached HUD update failed:', error);
                });
            }
            window.applyAuthFlowState({
                resolved: true,
                authenticated: true,
                needsRegistration: false,
                displayName: cachedProfile.displayName,
                force: true
            });
            return;
        }

        const actionText = document.getElementById('splash-action-text');
        const statusText = document.getElementById('splash-status-text');
        if (actionText) actionText.innerText = '>> SYNCING PROFILE <<';
        if (statusText) statusText.innerText = 'ACCOUNT DATA LINK SLOW...';
        if (cachedUid === window.myPlayerId && cachedName) {
            console.warn('[Auth Flow] Profile cache missing; staying on sync screen to avoid rendering empty stats.');
        }
        return;
    }

    window.firebaseAuthResolved = true;
    window.firebaseProfileResolved = true;
    window.applyAuthFlowState({
        resolved: true,
        authenticated: false,
        needsRegistration: false,
        displayName: null,
        force: true
    });

    if (typeof showNotification === 'function') {
        showNotification('AUTH LINK SLOW - LOGIN READY', 'warning', 3000);
    }
}

function scheduleAuthResolveFallback() {
    clearAuthResolveFallback();
    authResolveFallbackTimeout = setTimeout(resolveAuthFlowFromTimeout, AUTH_FLOW_FALLBACK_MS);
}

function setSplashLoadingState() {
    const splash = document.getElementById('splash-screen');
    const gameWrapper = document.getElementById('game-content-wrapper');
    const actionText = document.getElementById('splash-action-text');
    const statusText = document.getElementById('splash-status-text');

    if (actionText) {
        actionText.innerText = '>> INITIALIZING... <<';
    }
    if (statusText) {
        statusText.innerText = 'ESTABLISHING LINK...';
    }
    if (splash) {
        splash.style.opacity = '1';
        splash.style.display = 'flex';
    }
    if (gameWrapper) {
        gameWrapper.style.display = 'none';
    }
    scheduleAuthResolveFallback();
}

function dismissSplashToAuthUI() {
    clearAuthResolveFallback();
    const splash = document.getElementById('splash-screen');
    const gameWrapper = document.getElementById('game-content-wrapper');
    const startScreen = document.getElementById('start-screen');

    if (splash && splash.style.display !== 'none') {
        splash.style.opacity = '0';
        splash.style.display = 'none';
    }
    if (gameWrapper) {
        gameWrapper.style.display = 'block';
    }
    if (startScreen) {
        startScreen.style.display = 'flex';
    }
}

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

    let nextView = 'login';
    if (!window.authFlowState.resolved) {
        nextView = 'connecting';
    } else if (window.authFlowState.authenticated && window.authFlowState.needsRegistration) {
        nextView = 'registration';
    } else if (window.authFlowState.authenticated && window.authFlowState.displayName) {
        nextView = 'main';
    }

    const previousView = window.authFlowState.currentView;
    if (previousView === nextView && !patch.force) {
        return;
    }
    window.authFlowState.currentView = nextView;

    if (nextView === 'connecting') {
        setSplashLoadingState();
    } else {
        dismissSplashToAuthUI();
    }

    if (startScreen) startScreen.style.display = 'flex';
    if (overlay) overlay.style.display = 'none';

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

    if (!window.firebaseAuthResolved || !window.firebaseProfileResolved) {
        window.applyAuthFlowState({
            resolved: false,
            authenticated: false,
            needsRegistration: false,
            displayName: null,
            force
        });
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

function isNativeAuthPlatform() {
    return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
}

function getCapacitorPlugin(name) {
    return window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins[name] : null;
}

function beginAuthAttempt() {
    if (typeof window.warmGameAudioForInteraction === 'function') {
        window.warmGameAudioForInteraction();
    }
    if (typeof playSound === 'function') playSound('deploy-sfx');

    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'flex';
    startAuthOverlayTimeout();

    if (typeof playBgm === 'function') playBgm();
}

function isUserCancelledAuth(error) {
    const code = error && (error.code || error.error || error.type);
    const message = String((error && (error.message || error.localizedDescription)) || '');
    return code === 'auth/popup-closed-by-user'
        || code === 'auth/cancelled-popup-request'
        || code === 'userCancelled'
        || code === 'userLoggedOut'
        || message.includes('AuthorizationError error 1001')
        || message.toLowerCase().includes('cancel');
}

function showAuthFailure(providerName, error) {
    cancelAuthOverlay();

    if (isUserCancelledAuth(error)) {
        console.log(`[${providerName} Login] User cancelled login.`);
        return;
    }

    if (error && error.code === 'auth/unauthorized-domain') {
        alert('System Error: Unauthorized Domain (Check Firebase Console)');
        return;
    }

    const message = (error && (error.message || error.errorMessage || error.localizedDescription)) || String(error);
    alert(`${providerName.toUpperCase()} LOGIN FAILED: ${message}`);
}

async function signInOrLinkWithCredential(auth, credential) {
    const { signInWithCredential, linkWithCredential } = window.firebaseModules;

    if (auth.currentUser && auth.currentUser.isAnonymous) {
        try {
            return await linkWithCredential(auth.currentUser, credential);
        } catch (error) {
            if (error && (
                error.code === 'auth/credential-already-in-use'
                || error.code === 'auth/email-already-in-use'
                || error.code === 'auth/provider-already-linked'
            )) {
                console.log('[Auth] Provider already has an account, signing into it instead of linking guest.');
                return signInWithCredential(auth, credential);
            }
            throw error;
        }
    }

    return signInWithCredential(auth, credential);
}

function randomNonce(length = 32) {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    return Array.from(randomValues).map(value => charset[value % charset.length]).join('');
}

async function sha256Hex(input) {
    const data = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

window.playAsGuest = function() {
    const { getAuth, signInAnonymously } = window.firebaseModules;
    if (typeof window.warmGameAudioForInteraction === 'function') {
        window.warmGameAudioForInteraction();
    }
    if (typeof playSound === 'function') playSound('deploy-sfx');

    document.getElementById('login-overlay').style.display = 'flex';
    startAuthOverlayTimeout();
    playBgm();

    signInAnonymously(getAuth()).catch(error => {
        alert(error.message);
        cancelAuthOverlay();
    });
};

window.loginWithGoogle = async function() {
    const { getAuth, GoogleAuthProvider, signInWithPopup, linkWithPopup } = window.firebaseModules;
    const auth = getAuth();

    beginAuthAttempt();

    if (isNativeAuthPlatform()) {
        try {
            const GoogleAuth = getCapacitorPlugin('GoogleAuth');
            if (!GoogleAuth || typeof GoogleAuth.signIn !== 'function') {
                throw new Error('Native GoogleAuth plugin is not available in this build.');
            }

            const googleUser = await GoogleAuth.signIn();
            const idToken = googleUser?.authentication?.idToken || googleUser?.idToken;
            const accessToken = googleUser?.authentication?.accessToken || googleUser?.accessToken;

            if (!idToken && !accessToken) {
                throw new Error('Google did not return an auth token. Check the native Google OAuth client ID setup.');
            }

            const credential = GoogleAuthProvider.credential(idToken || null, accessToken || null);
            await signInOrLinkWithCredential(auth, credential);
            console.log('[Google Login] Auth success, waiting for onAuthStateChanged...');
        } catch (error) {
            showAuthFailure('Google', error);
        }
        return;
    }

    const provider = new GoogleAuthProvider();
    const authAction = auth.currentUser && auth.currentUser.isAnonymous
        ? linkWithPopup(auth.currentUser, provider)
        : signInWithPopup(auth, provider);

    authAction
        .then(() => {
            console.log('[Google Login] Auth success, waiting for onAuthStateChanged...');
        })
        .catch(error => showAuthFailure('Google', error));
};

window.loginWithApple = async function() {
    const { getAuth, OAuthProvider, signInWithPopup, linkWithPopup, signInWithRedirect, linkWithRedirect } = window.firebaseModules;
    const auth = getAuth();
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');

    if (isNativeAuthPlatform() && typeof getCapacitorPlatform === 'function' && getCapacitorPlatform() !== 'ios') {
        alert('Apple login is available in the iOS app. Please use Google login on Android.');
        return;
    }

    beginAuthAttempt();

    if (typeof getCapacitorPlatform === 'function' && getCapacitorPlatform() === 'ios') {
        try {
            const SignInWithApple = getCapacitorPlugin('SignInWithApple');
            if (!SignInWithApple || typeof SignInWithApple.authorize !== 'function') {
                throw new Error('Native Sign in with Apple plugin is not available in this build.');
            }

            const rawNonce = randomNonce();
            const hashedNonce = await sha256Hex(rawNonce);
            const result = await SignInWithApple.authorize({
                clientId: 'com.enguistics.vocabconqueror',
                redirectURI: 'https://battleship-game-c0909.firebaseapp.com/__/auth/handler',
                scopes: 'email name',
                state: 'vocab-conqueror',
                nonce: hashedNonce
            });
            const idToken = result?.response?.identityToken;

            if (!idToken) {
                throw new Error('Apple did not return an identity token. Check Sign in with Apple capability setup.');
            }

            const credential = provider.credential({
                idToken,
                rawNonce
            });
            await signInOrLinkWithCredential(auth, credential);
            console.log('[Apple Login] Auth success, waiting for onAuthStateChanged...');
        } catch (error) {
            showAuthFailure('Apple', error);
        }
        return;
    }

    if (isNativeAuthPlatform()) {
        const authAction = auth.currentUser && auth.currentUser.isAnonymous
            ? linkWithRedirect(auth.currentUser, provider)
            : signInWithRedirect(auth, provider);

        authAction.catch(error => showAuthFailure('Apple', error));
        return;
    }

    const authAction = auth.currentUser && auth.currentUser.isAnonymous
        ? linkWithPopup(auth.currentUser, provider)
        : signInWithPopup(auth, provider);

    authAction
        .then(() => {
            console.log('[Apple Login] Auth success, waiting for onAuthStateChanged...');
        })
        .catch(error => showAuthFailure('Apple', error));
};

function configureNativeLoginButtons() {
    const appleButton = document.getElementById('apple-login-btn');
    if (!appleButton) return;
    if (isNativeAuthPlatform() && typeof getCapacitorPlatform === 'function' && getCapacitorPlatform() !== 'ios') {
        appleButton.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', configureNativeLoginButtons);

window.logout = function() {
    const { getAuth, signOut } = window.firebaseModules;
    if (typeof playSound === 'function') playSound('delete-sfx');

    localStorage.removeItem('battleship_username');
    const GoogleAuth = getCapacitorPlugin('GoogleAuth');
    if (GoogleAuth && typeof GoogleAuth.signOut === 'function') {
        GoogleAuth.signOut().catch(error => console.log('[Google Login] Native sign out skipped:', error));
    }

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
        if (typeof window.cachePlayerProfile === 'function') {
            window.cachePlayerProfile(user.uid, {
                displayName: name,
                xp: 0,
                supplies: 0,
                mastery: window.userMastery,
                sentenceProgress: window.userSentenceProgress,
                unlockedRaces: window.unlockedRaces
            });
        }
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
            const refreshToken = ++hudRankRefreshToken;
            checkGlobalRankAndUpdateIcon(rankEl, rank, refreshToken).catch(error => {
                console.error('[HUD] Rank refresh failed:', error);
            });
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

async function checkGlobalRankAndUpdateIcon(rankEl, rank, refreshToken = hudRankRefreshToken) {
    console.log('[HUD] checkGlobalRankAndUpdateIcon called for player:', window.myPlayerId);

    const renderHudRank = (iconPath) => {
        const zhLabel = rank.zh ? `<span class="hud-rank-zh">[${rank.zh}]</span>` : '';
        rankEl.innerHTML = `
            <span class="hud-rank-name">${rank.name}</span>
            ${zhLabel}
            <img src="${iconPath}" class="hud-rank-icon" onerror="this.style.display='none'">
        `;
    };

    const defaultIconPath = `ranking_icon/white/${rank.iconFile}`;
    renderHudRank(defaultIconPath);

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
        const topPvpQuery = query(usersRef, orderByChild('pvpWins'), limitToLast(10));
        const pvpSnapshot = await get(topPvpQuery);
        if (pvpSnapshot.exists()) {
            const top10PVP = [];
            pvpSnapshot.forEach(childSnapshot => {
                const pvpWins = childSnapshot.val().pvpWins || 0;
                if (pvpWins > 0) {
                    top10PVP.push({
                        uid: childSnapshot.key,
                        pvpWins
                    });
                }
            });

            top10PVP.sort((a, b) => b.pvpWins - a.pvpWins);
            pvpRankIndex = top10PVP.findIndex(user => user.uid === window.myPlayerId);
            console.log('[HUD] My PVP rank index:', pvpRankIndex);
        }

        if (refreshToken !== hudRankRefreshToken) return;

        const xpColor = xpRankIndex !== -1 ? getIconColor(xpRankIndex) : 'white';
        const pvpColor = pvpRankIndex !== -1 ? getIconColor(pvpRankIndex) : 'white';
        const colorPriority = { gold: 4, silver: 3, bronze: 2, white: 1 };
        const bestColor = colorPriority[xpColor] > colorPriority[pvpColor] ? xpColor : pvpColor;
        const iconPath = `ranking_icon/${bestColor}/${rank.iconFile}`;
        renderHudRank(iconPath);
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
    if (typeof window.resetBgmDucks === 'function') {
        window.resetBgmDucks(180);
    }

    const splash = document.getElementById('splash-screen');
    const gameWrapper = document.getElementById('game-content-wrapper');
    const startScreen = document.getElementById('start-screen');
    const gameUi = document.getElementById('game-ui');
    if (!splash || splash.style.display === 'none') {
        if (gameWrapper) gameWrapper.style.display = 'block';
        if (startScreen) {
            startScreen.style.display = 'flex';
            startScreen.style.opacity = '1';
        }
        if (gameUi) gameUi.style.display = 'none';
    }

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

    if (typeof playBgm === 'function') {
        playBgm();
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
    window.pendingStartExperience = false;
    window.ignoreConnectionAlert = true;
    setTimeout(() => {
        window.ignoreConnectionAlert = false;
    }, 3000);

    if (window.Capacitor) {
        try {
            const { Keyboard } = window.Capacitor.Plugins;
            if (Keyboard) {
                Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(() => {});
                Keyboard.setScroll({ isDisabled: true }).catch(() => {});
            }
        } catch (error) {
            console.log('Keyboard config error:', error);
        }
    }

    const platform = window.Capacitor?.getPlatform?.() || '';
    const sfxVolume = (typeof gameVolume !== 'undefined' && isFinite(gameVolume.sfx)) ? gameVolume.sfx : 0.5;
    console.log(`[Audio Debug] startExperience audio path platform=${platform || 'web'}`);
    if (platform === 'android' && typeof window.playNativeSfx === 'function') {
        window.playNativeSfx('deploy-sfx', sfxVolume).then(played => {
            if (!played && typeof window.playImmediateWebSfx === 'function') {
                window.playImmediateWebSfx('deploy-sfx', sfxVolume);
            }
        }).catch(() => {
            if (typeof window.playImmediateWebSfx === 'function') {
                window.playImmediateWebSfx('deploy-sfx', sfxVolume);
            }
        });
    } else if (typeof playSound === 'function') {
        playSound('deploy-sfx');
    }

    if (typeof window.warmGameAudioForInteraction === 'function') {
        window.warmGameAudioForInteraction();
    }

    const startRequestedBgm = () => {
        playBgm();
    };
    if (platform === 'android') {
        setTimeout(startRequestedBgm, 120);
    } else {
        startRequestedBgm();
    }
    if (typeof window.requestLandscapeForTablet === 'function') {
        window.requestLandscapeForTablet();
    }

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    setSplashLoadingState();

    if (typeof window.applyAuthFlowState === 'function') {
        window.authFlowState.started = true;
        window.applyAuthFlowState({
            resolved: false,
            authenticated: false,
            needsRegistration: false,
            displayName: null,
            force: true
        });
        if (typeof window.reconcileAuthFlowState === 'function') {
            window.reconcileAuthFlowState(false);
        }
    }
};

if (window.pendingStartExperience) {
    setTimeout(() => {
        if (typeof window.startExperience === 'function') {
            window.startExperience();
        }
    }, 0);
}

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
