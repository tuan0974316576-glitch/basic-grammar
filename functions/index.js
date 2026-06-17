const crypto = require("crypto");
const admin = require("firebase-admin");
const { HttpsError, onCall } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");

admin.initializeApp();
setGlobalOptions({ region: "asia-east2" });

const db = admin.firestore();
const bucket = admin.storage().bucket();

const AZURE_SPEECH_KEY = defineSecret("AZURE_SPEECH_KEY");
const AZURE_SPEECH_REGION = defineSecret("AZURE_SPEECH_REGION");

const DEFAULT_VOICE = "en-US-AndrewMultilingualNeural";
const DEFAULT_OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";
const MAX_WORD_LENGTH = 64;

function normalizeStudentId(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeVocabWord(value) {
  return String(value || "")
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function makeStudentEmail(studentId) {
  const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "students";
  return `${normalizeStudentId(studentId).toLowerCase()}@${projectId}.local`;
}

function makeStudentPassword(studentId, pin, salt) {
  return `Gg-${normalizeStudentId(studentId)}-${hashPin(pin, salt).slice(0, 24)}`;
}

function hashPin(pin, salt) {
  return crypto
    .pbkdf2Sync(String(pin), String(salt), 120000, 32, "sha256")
    .toString("hex");
}

function isLikelyWordOrPhrase(value) {
  const text = normalizeVocabWord(value);
  return Boolean(text && /^[a-z][a-z' -]{0,63}$/.test(text) && !/ {2,}|--|''/.test(text));
}

function makeAudioId(word) {
  return crypto.createHash("sha256").update(normalizeVocabWord(word)).digest("hex").slice(0, 24);
}

function makeStoragePath(word) {
  const text = normalizeVocabWord(word);
  const slug = text
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "word";
  return `vocab-audio/v1/${slug}-${makeAudioId(text)}.mp3`;
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getAzureEndpoint(region) {
  return `https://${String(region || "").trim()}.tts.speech.microsoft.com/cognitiveservices/v1`;
}

function makeDownloadUrl(bucketName, storagePath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
}

async function getOrCreateDownloadUrl(file, storagePath) {
  const [metadata] = await file.getMetadata();
  const existingToken = String(metadata?.metadata?.firebaseStorageDownloadTokens || "")
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)[0];
  const token = existingToken || crypto.randomUUID();

  if (!existingToken) {
    await file.setMetadata({
      metadata: {
        ...(metadata.metadata || {}),
        firebaseStorageDownloadTokens: token
      }
    });
  }

  return makeDownloadUrl(bucket.name, storagePath, token);
}

async function generateAzureTtsMp3(word, { speechKey, speechRegion }) {
  const endpoint = getAzureEndpoint(speechRegion);
  const ssml = [
    `<speak version="1.0" xml:lang="en-US">`,
    `<voice name="${DEFAULT_VOICE}">${escapeXml(word)}</voice>`,
    `</speak>`
  ].join("");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": speechKey,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": DEFAULT_OUTPUT_FORMAT,
      "User-Agent": "enguistics-grammar-game"
    },
    body: ssml
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Azure TTS failed: ${response.status} ${details}`.trim());
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (!buffer.length) throw new Error("Azure TTS returned empty audio.");
  return buffer;
}

async function getOrCreateVocabAudio(word, context) {
  const normalizedWord = normalizeVocabWord(word);
  const audioId = makeAudioId(normalizedWord);
  const storagePath = makeStoragePath(normalizedWord);
  const docRef = db.collection("vocabAudio").doc(audioId);
  const [docSnap, existsResult] = await Promise.all([
    docRef.get(),
    bucket.file(storagePath).exists()
  ]);
  const file = bucket.file(storagePath);
  const fileExists = Boolean(existsResult?.[0]);

  if (fileExists) {
    const data = docSnap.exists ? (docSnap.data() || {}) : {};
    const downloadUrl = await getOrCreateDownloadUrl(file, storagePath);
    await docRef.set({
      word: normalizedWord,
      audioId,
      storagePath,
      source: data.source || "firebase-shared",
      voice: data.voice || DEFAULT_VOICE,
      outputFormat: data.outputFormat || DEFAULT_OUTPUT_FORMAT,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return {
      audioId,
      storagePath,
      downloadUrl,
      source: data.source || "firebase-shared",
      createdAt: data.createdAt || null,
      cached: true
    };
  }

  const key = AZURE_SPEECH_KEY.value();
  const region = AZURE_SPEECH_REGION.value();

  if (!key || !region) {
    throw new HttpsError("failed-precondition", "Azure Speech secrets are not configured.");
  }

  const audioBuffer = await generateAzureTtsMp3(normalizedWord, {
    speechKey: key,
    speechRegion: region
  });

  const downloadToken = crypto.randomUUID();
  await file.save(audioBuffer, {
    resumable: false,
    metadata: {
      contentType: "audio/mpeg",
      cacheControl: "public, max-age=31536000, immutable",
      metadata: {
        audioId,
        word: normalizedWord,
        voice: DEFAULT_VOICE,
        source: "azure-tts",
        firebaseStorageDownloadTokens: downloadToken
      }
    }
  });

  const downloadUrl = makeDownloadUrl(bucket.name, storagePath, downloadToken);

  await docRef.set({
    word: normalizedWord,
    audioId,
    storagePath,
    downloadUrl,
    source: "azure-tts",
    voice: DEFAULT_VOICE,
    outputFormat: DEFAULT_OUTPUT_FORMAT,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return {
    audioId,
    storagePath,
    downloadUrl,
    source: "azure-tts",
    cached: false
  };
}

exports.ensureVocabAudio = onCall({
  secrets: [AZURE_SPEECH_KEY, AZURE_SPEECH_REGION]
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please log in first.");
  }

  const word = normalizeVocabWord(request.data?.word);
  if (!isLikelyWordOrPhrase(word)) {
    throw new HttpsError("invalid-argument", "Invalid vocabulary word.");
  }

  const result = await getOrCreateVocabAudio(word, request);
  return {
    status: "ready",
    word,
    ...result
  };
});

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
  const email = account.email || makeStudentEmail(studentId);
  const authPassword = makeStudentPassword(studentId, pin, salt);

  await admin.auth().updateUser(uid, {
    email,
    password: authPassword,
    displayName
  }).catch(async (error) => {
    if (error?.code !== "auth/user-not-found") throw error;
    await admin.auth().createUser({
      uid,
      email,
      password: authPassword,
      displayName
    });
  });

  await admin.auth().setCustomUserClaims(uid, {
    role: "student",
    studentId,
    classId
  });

  await accountRef.set({
    uid,
    email,
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

  return {
    email,
    authPassword,
    studentId,
    displayName,
    classId
  };
});
