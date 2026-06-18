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
const AZURE_TRANSLATOR_KEY = defineSecret("AZURE_TRANSLATOR_KEY");
const AZURE_TRANSLATOR_REGION = defineSecret("AZURE_TRANSLATOR_REGION");

const DEFAULT_VOICE = "en-US-AndrewMultilingualNeural";
const DEFAULT_OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";
const MAX_WORD_LENGTH = 64;
const AZURE_TRANSLATOR_ENDPOINT = "https://api.cognitive.microsofttranslator.com";
const AZURE_TRANSLATOR_API_VERSION = "3.0";
const AZURE_TRANSLATOR_SOURCE = "en";
const AZURE_TRANSLATOR_TARGET = "zh-Hant";

const CURATED_VOCAB_MEANINGS = new Map([
  ["egg tart", [{ meaning: "蛋撻", pos: "noun", type: "phrase" }]],
  ["look up", [{ meaning: "查閱 / 查字典", type: "phrase" }]],
  ["lung cancer", [{ meaning: "肺癌", pos: "noun", type: "phrase" }]]
]);

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

function makeVocabMeaningId(word) {
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

function inferVocabType(word) {
  return normalizeVocabWord(word).includes(" ") ? "phrase" : "word";
}

function normalizeCloudMeaning(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/，/g, " / ")
    .replace(/\s*\/\s*/g, " / ");
}

function cleanCloudTranslation(value, word) {
  let text = normalizeCloudMeaning(value);
  const normalizedWord = normalizeVocabWord(word);
  if (normalizedWord === "look up" && /抬頭/.test(text)) {
    text = "查閱 / 查字典";
  }
  return text;
}

function normalizeMeaningEntries(word, entries = [], source = "azure-translator") {
  const normalizedWord = normalizeVocabWord(word);
  return entries
    .map((entry, index) => ({
      id: `${source}-${makeVocabMeaningId(`${normalizedWord}:${entry.meaning}:${index}`)}`,
      word: normalizedWord,
      meaning: normalizeCloudMeaning(entry.meaning),
      pos: String(entry.pos || "").trim().toLowerCase(),
      type: entry.type || inferVocabType(normalizedWord),
      source,
      sourceEntryId: entry.sourceEntryId || ""
    }))
    .filter((entry) => entry.meaning);
}

function shouldReuseCachedMeaning(cached = {}) {
  const source = String(cached.source || "").toLowerCase();
  return Boolean(source && !source.includes("google"));
}

async function translateVocabMeaningWithAzure(word, { translatorKey, translatorRegion }) {
  const key = String(translatorKey || "").trim();
  const region = String(translatorRegion || "").trim();
  if (!key || !region) {
    throw new HttpsError("failed-precondition", "Azure Translator secrets are not configured.");
  }

  const params = new URLSearchParams({
    "api-version": AZURE_TRANSLATOR_API_VERSION,
    from: AZURE_TRANSLATOR_SOURCE,
    to: AZURE_TRANSLATOR_TARGET
  });
  const response = await fetch(`${AZURE_TRANSLATOR_ENDPOINT}/translate?${params.toString()}`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Ocp-Apim-Subscription-Region": region,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([{ Text: word }])
  });

  const body = await response.json().catch(async () => ({ raw: await response.text().catch(() => "") }));
  if (!response.ok) {
    const details = body?.error?.message || body?.raw || `HTTP ${response.status}`;
    throw new Error(`Azure Translator failed: ${details}`);
  }

  const translatedText = body?.[0]?.translations?.[0]?.text || "";
  const meaning = cleanCloudTranslation(translatedText, word);
  return meaning ? [{ meaning, type: inferVocabType(word) }] : [];
}

async function getOrCreateVocabMeaning(word) {
  const normalizedWord = normalizeVocabWord(word);
  const meaningId = makeVocabMeaningId(normalizedWord);
  const docRef = db.collection("vocabMeaningCache").doc(meaningId);
  const cachedSnap = await docRef.get();

  if (cachedSnap.exists && shouldReuseCachedMeaning(cachedSnap.data() || {})) {
    const cached = cachedSnap.data() || {};
    const entries = normalizeMeaningEntries(normalizedWord, cached.entries || [], cached.source || "shared-cache");
    if (entries.length) {
      return {
        meaningId,
        word: normalizedWord,
        entries,
        cached: true,
        source: cached.source || "shared-cache"
      };
    }
  }

  const curated = CURATED_VOCAB_MEANINGS.get(normalizedWord);
  let rawEntries = curated;
  const source = curated ? "curated-cloud" : "azure-translator";

  if (!rawEntries) {
    try {
      rawEntries = await translateVocabMeaningWithAzure(normalizedWord, {
        translatorKey: AZURE_TRANSLATOR_KEY.value(),
        translatorRegion: AZURE_TRANSLATOR_REGION.value()
      });
    } catch (error) {
      console.error("Azure Translator lookup failed.", {
        word: normalizedWord,
        message: error?.message || String(error)
      });
      await docRef.set({
        word: normalizedWord,
        meaningId,
        source,
        status: "translator-error",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return {
        meaningId,
        word: normalizedWord,
        entries: [],
        cached: false,
        source,
        status: "translator-error"
      };
    }
  }
  const entries = normalizeMeaningEntries(normalizedWord, rawEntries, source);

  if (!entries.length) {
    await docRef.set({
      word: normalizedWord,
      meaningId,
      source,
      status: "missing",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return {
      meaningId,
      word: normalizedWord,
      entries: [],
      cached: false,
      source,
      status: "missing"
    };
  }

  await docRef.set({
    word: normalizedWord,
    meaningId,
    source,
    status: "ready",
    entries: entries.map((entry) => ({
      meaning: entry.meaning,
      pos: entry.pos,
      type: entry.type,
      sourceEntryId: entry.sourceEntryId || entry.id
    })),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return {
    meaningId,
    word: normalizedWord,
    entries,
    cached: false,
    source,
    status: "ready"
  };
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
  invoker: "public",
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

exports.lookupVocabMeaning = onCall({
  invoker: "public",
  secrets: [AZURE_TRANSLATOR_KEY, AZURE_TRANSLATOR_REGION]
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please log in first.");
  }

  const word = normalizeVocabWord(request.data?.word);
  if (!isLikelyWordOrPhrase(word)) {
    throw new HttpsError("invalid-argument", "Invalid vocabulary word.");
  }

  const result = await getOrCreateVocabMeaning(word);
  return {
    status: result.status || "ready",
    word,
    meaningId: result.meaningId,
    entries: result.entries,
    source: result.source,
    cached: result.cached
  };
});

exports.studentLogin = onCall({
  invoker: "public"
}, async (request) => {
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
