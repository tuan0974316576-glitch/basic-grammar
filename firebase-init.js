function applyStudentAuthState(patch) {
  if (typeof window.applyStudentAuthState === "function") {
    window.applyStudentAuthState(patch);
    return;
  }

  window.pendingStudentAuthState = {
    ...(window.pendingStudentAuthState || {}),
    ...patch
  };
}

function hasSavedStudentProfile() {
  try {
    return Boolean(window.localStorage?.getItem("basic_grammar_student_profile_v1"));
  } catch (_error) {
    return false;
  }
}

async function initializeGrammarFirebase() {
  const config = window.GRAMMAR_FIREBASE_CONFIG;

  if (!config || !config.apiKey || String(config.apiKey).startsWith("YOUR_")) {
    window.grammarFirebaseReady = false;
    applyStudentAuthState({
      resolved: true,
      available: false,
      authenticated: false,
      message: "未設定 Firebase，暫時只會儲存在本機。"
    });
    return;
  }

  try {
    const [
      firebaseApp,
      firebaseAuth,
      firebaseFirestore,
      firebaseFunctions
    ] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js")
    ]);

    const app = firebaseApp.initializeApp(config);
    const auth = firebaseAuth.getAuth(app);
    const db = firebaseFirestore.getFirestore(app);
    const functions = firebaseFunctions.getFunctions(app, config.functionsRegion || "asia-east2");

    window.grammarFirebaseReady = true;
    window.grammarFirebase = {
      app,
      auth,
      db,
      functions,
      modules: {
        ...firebaseAuth,
        ...firebaseFirestore,
        ...firebaseFunctions
      }
    };

    try {
      await firebaseAuth.setPersistence(auth, firebaseAuth.browserLocalPersistence);
    } catch (error) {
      console.warn("Firebase persistence setup failed:", error);
    }

    firebaseAuth.onAuthStateChanged(auth, (user) => {
      if (!user) {
        const hasSavedProfile = hasSavedStudentProfile();
        applyStudentAuthState({
          resolved: !hasSavedProfile,
          available: true,
          authenticated: false,
          user: null,
          restoringSavedProfile: hasSavedProfile
        });
        return;
      }

      applyStudentAuthState({
        resolved: true,
        available: true,
        authenticated: true,
        user: {
          uid: user.uid,
          displayName: user.displayName || "",
          isAnonymous: user.isAnonymous
        }
      });
    });
  } catch (error) {
    console.warn("Firebase failed to initialize:", error);
    window.grammarFirebaseReady = false;
    applyStudentAuthState({
      resolved: true,
      available: false,
      authenticated: false,
      message: "Firebase 暫時連不到，紀錄會先留在本機。"
    });
  }
}

initializeGrammarFirebase();
