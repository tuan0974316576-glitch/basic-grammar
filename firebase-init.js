  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getDatabase, ref, set, onValue, update, push, child, get, onDisconnect, off, remove, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
  import { getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

    const firebaseConfig = {
        apiKey: "AIzaSyBdfTgb7FpkYdgjvrYWQ0jr-N-1fAaW9Q0",
        authDomain: "vocabularyxdungeon.firebaseapp.com",
        databaseURL: "https://vocabularyxdungeon-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "vocabularyxdungeon",
        storageBucket: "vocabularyxdungeon.appspot.com",
        messagingSenderId: "834761939928",
        appId: "1:834761939928:web:4591dcd9650ec99746f0ad"
    };

    // 初始化
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const auth = getAuth(app);

    // 掛載到 window 供 onclick 使用
window.firebaseModules = {
      initializeApp,
      getDatabase, ref, set, onValue, update, push, child, get, onDisconnect, off, remove, query, orderByChild, limitToLast,
      getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut
  };
    window.db = db;
    window.auth = auth;
console.log("Firebase Modules Loaded Successfully");
    // --- 1. 登入狀態監聽 (包含 Guest 自動派名) ---
    onAuthStateChanged(auth, (u) => {
        console.log('[Auth] onAuthStateChanged triggered, user:', u ? u.uid : 'null');
        const overlay = document.getElementById('login-overlay');
        console.log('[Auth] login-overlay element:', overlay);
        // 清除 auth overlay timeout (如果有)
        if (window.authOverlayTimeout) { clearTimeout(window.authOverlayTimeout); window.authOverlayTimeout = null; }
        if (u) {
            console.log('[Auth] User authenticated:', u.uid, 'isAnonymous:', u.isAnonymous);
            window.isFirebaseAuthenticated = true;
            window.myPlayerId = u.uid;

            // ★★★ SESSION TRACKING: 生成或讀取 deviceId ★★★
            let deviceId = localStorage.getItem('battleship_deviceId');
            if (!deviceId) {
                deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
                localStorage.setItem('battleship_deviceId', deviceId);
                console.log('[Session] Generated new deviceId:', deviceId);
            } else {
                console.log('[Session] Using existing deviceId:', deviceId);
            }

            // ★★★ SESSION TRACKING: 寫入 activeSession 到 Firebase ★★★
            const sessionRef = ref(db, 'users/' + u.uid + '/activeSession');
            update(ref(db, 'users/' + u.uid), {
                activeSession: {
                    deviceId: deviceId,
                    timestamp: Date.now()
                }
            }).then(() => {
                console.log('[Session] Active session updated');
            }).catch(err => {
                console.error('[Session] Failed to update session:', err);
            });

            // ★★★ SESSION TRACKING: 監聽 activeSession 變化 ★★★
            if (!window.sessionListener) {
                window.sessionListener = onValue(sessionRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const session = snapshot.val();
                        console.log('[Session] Session changed:', session);

                        // 如果 deviceId 唔同，代表另一部裝置登入咗
                        if (session.deviceId !== deviceId) {
                            console.log('[Session] Another device logged in, forcing logout');

                            // 停止監聽，避免重複觸發
                            if (window.sessionListener) {
                                off(sessionRef);
                                window.sessionListener = null;
                            }

                            // 顯示遊戲內通知並強制登出
                            if (typeof showNotification === 'function') {
                                showNotification("ACCOUNT LOGGED IN ON ANOTHER DEVICE", "error");
                            }

                            // 等 3 秒俾玩家睇到訊息，再強制登出
                            setTimeout(() => {
                                const { signOut, getAuth } = window.firebaseModules;
                                signOut(getAuth()).then(() => {
                                    console.log('[Session] Forced logout successful');
                                    window.location.reload();
                                }).catch(err => {
                                    console.error('[Session] Forced logout failed:', err);
                                    window.location.reload();
                                });
                            }, 3000);
                        }
                    }
                });
            }

            // 登入後從 Firebase 載入錯字記錄
            if (typeof loadWrongWordsFromFirebase === 'function') loadWrongWordsFromFirebase();

            // ★ 極速登入：如果 localStorage 有 cached username，即刻顯示主選單
            // 唔使等 get(userRef) 回應，避免 connecting panel 閃一閃
            const cachedName = localStorage.getItem('battleship_username');
            console.log('[Auth] Cached username:', cachedName);

            // ★★★ 重要修改：即使有 cached name，都要等 Firebase 驗證完先顯示 MAIN MENU ★★★
            // 這樣可以避免 token 過期時先顯示 MAIN MENU 再跳回 LOGIN
            // if (cachedName) {
            //     console.log('[Auth] Using cached name, showing main menu immediately');
            //     if(typeof showMainMenu === 'function') showMainMenu();
            //     if(overlay) {
            //         console.log('[Auth] Hiding overlay (cached name path), current display:', overlay.style.display);
            //         overlay.style.display = 'none';
            //         console.log('[Auth] Overlay display after setting to none:', overlay.style.display);
            //     }
            // }

            // 背景 fetch Firebase 數據 (更新名稱 / 處理新用戶)
            const userRef = ref(db, 'users/' + u.uid);
            console.log('[Auth] Fetching user data from Firebase...');
            get(userRef).then((snapshot) => {
                console.log('[Auth] Firebase get() completed, exists:', snapshot.exists());
                if (snapshot.exists() && snapshot.val().displayName) {
                    // 舊用戶 — 更新名稱 (可能 Firebase 上改過名)
                    const realName = snapshot.val().displayName;
                    console.log('[Auth] Existing user:', realName);
                    localStorage.setItem('battleship_username', realName);

                    // ★ 讀取 XP & Mastery (如果存在)
                    const userData = snapshot.val();
                    window.userTotalXP = (typeof userData.xp === 'number') ? userData.xp : 0;
                    window.userMastery = userData.mastery || { reading: {}, listening: {}, speaking: {} };
                    window.userSupplies = (typeof userData.supplies === 'number') ? userData.supplies : 0;
                    window.unlockedRaces = userData.unlockedRaces || ['VANGUARDS'];
                    console.log('[Auth] Loaded XP:', window.userTotalXP);
                    console.log('[Auth] Loaded Supplies:', window.userSupplies);
                    console.log('[Auth] Loaded Unlocked Races:', window.unlockedRaces);

                    // ★★★ 同步去 local variables (確保即時更新) ★★★
                    if (typeof userTotalXP !== 'undefined') {
                        userTotalXP = window.userTotalXP;
                    }
                    if (typeof userMastery !== 'undefined') {
                        userMastery = window.userMastery;
                    }
                    if (typeof userSupplies !== 'undefined') {
                        userSupplies = window.userSupplies;
                    }
                    if (typeof unlockedRaces !== 'undefined') {
                        unlockedRaces = window.unlockedRaces;
                    }

                    // ★★★ 重要：即使用咗 cached name，都要再 call updateHUD 更新 XP 顯示 ★★★
                    if(typeof updateHUD === 'function') updateHUD(realName);

                    // ★★★ 更新 Level 按鈕進度顯示 ★★★
                    if(typeof updateLevelButtonsProgress === 'function') updateLevelButtonsProgress();
                    if(typeof updateSkillButtonsProgress === 'function') updateSkillButtonsProgress();

                    // ★★★ Firebase 驗證成功，現在才顯示 MAIN MENU ★★★
                    console.log('[Auth] Firebase validation complete, showing main menu');
                    if(typeof showMainMenu === 'function') showMainMenu();

                    if(overlay) {
                        console.log('[Auth] Hiding overlay (Firebase path), current display:', overlay.style.display);
                        overlay.style.display = 'none';
                        console.log('[Auth] Overlay display after setting to none:', overlay.style.display);
                    } else {
                        console.warn('[Auth] Overlay element is null!');
                    }
                } else {
                    // 新用戶
                    console.log('[Auth] New user detected');
                    if (u.isAnonymous) {
                        // Guest 自動派名
                        const autoName = window.generateGuestId ? window.generateGuestId() : "GUEST_" + u.uid.substring(0,4);
                        console.log('[Auth] Creating guest account:', autoName);
                        // ★ 新用戶初始化 XP & Mastery & Unlocked Races
                        window.userTotalXP = 0;
                        window.userMastery = { reading: {}, listening: {}, speaking: {} };
                        window.userSupplies = 0;
                        window.unlockedRaces = ['VANGUARDS'];
                        update(ref(db, 'users/' + u.uid), { displayName: autoName, lastLogin: Date.now(), xp: 0, supplies: 0, unlockedRaces: ['VANGUARDS'] }).then(() => {
                            console.log('[Auth] Guest account created successfully');
                            localStorage.setItem('battleship_username', autoName);
                            if(typeof updateHUD === 'function') updateHUD(autoName);
                            if(typeof showMainMenu === 'function') showMainMenu();
                            if(overlay) overlay.style.display = 'none';
                        }).catch(err => {
                            console.error('[Auth] Guest account creation failed:', err);
                        });
                    } else {
                        // Google/Apple 新人
                        console.log('[Auth] Google/Apple new user, showing registration');
                        if(overlay) overlay.style.display = 'none';
                        const reg = document.getElementById('registration-modal');
                        if(reg) reg.style.display = 'flex';
                    }
                }
            }).catch(err => {
                console.error('[Auth] Firebase get() failed:', err);
                // ★★★ 安全網：如果 Firebase 請求失敗，都要隱藏 overlay ★★★
                if(overlay) overlay.style.display = 'none';

                // ★★★ 關鍵修復：即使 Firebase 請求失敗，都要顯示主選單 ★★★
                // 因為用戶其實已經 login 咗（onAuthStateChanged 已經觸發）
                // 只係讀取 user data 失敗，唔應該卡住喺 LOGIN PANEL
                const cachedName = localStorage.getItem('battleship_username');
                if (cachedName && typeof updateHUD === 'function') {
                    updateHUD(cachedName);
                }
                if(typeof showMainMenu === 'function') {
                    console.log('[Auth] Showing main menu despite Firebase error (user is authenticated)');
                    showMainMenu();
                }

                // 顯示錯誤通知
                if(typeof showNotification === 'function') {
                    showNotification('FAILED TO LOAD USER DATA', 'error', 3000);
                }
            });
        } else {
            console.log('[Auth] User is null - logged out or auth failed');
            console.log('[Auth] Current overlay display:', overlay ? overlay.style.display : 'overlay not found');
            console.log('[Auth] Stack trace:', new Error().stack);

            window.isFirebaseAuthenticated = false;

            // ★★★ SESSION TRACKING: 停止監聽 activeSession ★★★
            if (window.sessionListener) {
                console.log('[Session] Stopping session listener on logout');
                window.sessionListener = null;
            }

            // ★★★ CRITICAL FIX: Clear XP and Mastery data on logout ★★★
            window.userTotalXP = 0;
            window.userMastery = { reading: {}, listening: {}, speaking: {} };
            window.userSupplies = 0;
            if (typeof userTotalXP !== 'undefined') userTotalXP = 0;
            if (typeof userMastery !== 'undefined') userMastery = { reading: {}, listening: {}, speaking: {} };
            if (typeof userSupplies !== 'undefined') userSupplies = 0;
            console.log('[Auth] Cleared XP and Mastery data');

            // ★★★ HIDE SUPPLIES DISPLAY on logout ★★★
            const suppliesDisplay = document.getElementById('coins-display');
            if (suppliesDisplay) suppliesDisplay.style.display = 'none';

            // ★ 清除可能殘留嘅 cached username (確保下次唔會誤跳主選單)
            localStorage.removeItem('battleship_username');

            // ★★★ 確保隱藏 overlay（可能是 auth token 過期導致）★★★
            if(overlay) {
                console.log('[Auth] Hiding overlay due to null user');
                overlay.style.display = 'none';
            }

            if(typeof switchHudPanel === 'function') switchHudPanel('login-panel');

            // ★ 確保主選單元素都隱藏 (防止之前 showMainMenu 留低嘅狀態)
            const carousel = document.getElementById('main-menu-carousel');
            const gameModeSelect = document.getElementById('game-mode-selection');
            if (carousel) carousel.style.display = 'none';
            if (gameModeSelect) gameModeSelect.style.display = 'none';

            console.log('[Auth] Switched to login panel');
        }
    });

    // --- 2. 連線狀態監測 (紅綠燈) ---
    const connectedRef = ref(db, ".info/connected");
    onValue(connectedRef, (snap) => {
        const el = document.getElementById('connection-status');
        if (!el) return;
        if (snap.val() === true) {
            el.style.background = "#22c55e"; el.style.boxShadow = "0 0 5px #22c55e";
        } else {
            const splash = document.getElementById('splash-screen');
            if ((splash && splash.style.display !== 'none') || window.ignoreConnectionAlert) return;
            el.style.background = "#ef4444"; el.style.boxShadow = "0 0 5px #ef4444";
            if (typeof showNotification === 'function') showNotification("CONNECTION LOST!", "error");
        }
    });

    // --- 3. 遊戲初始化 (畫格子等) ---
    if(typeof createGrid === 'function') {
        createGrid('player-grid');
        createGrid('enemy-grid');
        if(window.placeEnemyShips) placeEnemyShips();
        if(window.renderSidebar) renderSidebar();
    }
