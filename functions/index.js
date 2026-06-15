const crypto = require("crypto");
const admin = require("firebase-admin");
const { HttpsError, onCall } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");

admin.initializeApp();
setGlobalOptions({ region: "asia-east2" });

const db = admin.firestore();

function normalizeStudentId(value) {
  return String(value || "").trim().toUpperCase();
}

function hashPin(pin, salt) {
  return crypto
    .pbkdf2Sync(String(pin), String(salt), 120000, 32, "sha256")
    .toString("hex");
}

exports.studentLogin = onCall(async (request) => {
  const studentId = normalizeStudentId(request.data?.studentId);
  const pin = String(request.data?.pin || "").trim();

  if (!studentId || !/^[A-Z0-9_-]{2,16}$/.test(studentId)) {
    throw new HttpsError("invalid-argument", "Invalid student ID.");
  }

  if (!/^[0-9]{4,8}$/.test(pin)) {
    throw new HttpsError("invalid-argument", "Invalid PIN.");
  }

  const accountRef = db.collection("studentAccounts").doc(studentId);
  const accountSnapshot = await accountRef.get();
  if (!accountSnapshot.exists) {
    throw new HttpsError("unauthenticated", "Student account not found.");
  }

  const account = accountSnapshot.data() || {};
  if (account.disabled) {
    throw new HttpsError("permission-denied", "Student account is disabled.");
  }

  const expectedHash = account.pinHash;
  const salt = account.pinSalt;
  const actualHash = salt ? hashPin(pin, salt) : "";
  const validHash = expectedHash
    && actualHash.length === expectedHash.length
    && crypto.timingSafeEqual(Buffer.from(actualHash), Buffer.from(expectedHash));

  if (!validHash) {
    await accountRef.set({
      failedLoginCount: admin.firestore.FieldValue.increment(1),
      lastFailedLoginAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    throw new HttpsError("unauthenticated", "Incorrect PIN.");
  }

  const uid = account.uid || `student_${studentId.toLowerCase()}`;
  const displayName = account.displayName || studentId;
  const classId = account.classId || "";

  await admin.auth().updateUser(uid, {
    displayName
  }).catch(async (error) => {
    if (error?.code !== "auth/user-not-found") throw error;
    await admin.auth().createUser({
      uid,
      displayName
    });
  });

  await accountRef.set({
    uid,
    displayName,
    classId,
    lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    failedLoginCount: 0
  }, { merge: true });

  await db.collection("users").doc(uid).set({
    studentId,
    displayName,
    classId,
    lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  const token = await admin.auth().createCustomToken(uid, {
    studentId,
    classId
  });

  return {
    token,
    studentId,
    displayName,
    classId
  };
});

