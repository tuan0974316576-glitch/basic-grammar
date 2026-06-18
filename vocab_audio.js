(function attachVocabAudio(root, factory) {
  const api = factory(root.VOCAB_WORD_AUDIO_MANIFEST || {}, {
    getFirebaseBundle: () => root.grammarFirebase || null
  });
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.VocabAudio = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createVocabAudio(staticManifest, options = {}) {
  const DB_NAME = "grammar-game-vocab-audio";
  const DB_VERSION = 1;
  const STORE_AUDIO = "audio";
  const STORE_META = "meta";
  const MAX_AUDIO_BYTES = 1024 * 1024;
  const FETCH_TIMEOUT_MS = 12000;
  const CACHE_MISS_TTL_MS = 30 * 60 * 1000;
  const ALLOWED_MIME_TYPES = new Set(["audio/mpeg", "audio/mp3"]);

  const staticAudioByWord = buildStaticAudioIndex(staticManifest);
  const pendingDownloads = new Map();
  const downloadQueue = [];
  const queuedWords = new Set();
  let queueRunning = false;
  let dbPromise = null;
  let activeAudio = null;
  let activeObjectUrl = "";
  let activeToken = 0;
  let sharedAudioCallable = null;
  let sharedAudioCallableBundle = null;

  function normalizeWord(value) {
    return String(value || "")
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/[‐‑‒–—―]/g, "-")
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function normalizeAudioText(value, kind = "word") {
    if (kind === "example") {
      return String(value || "")
        .trim()
        .replace(/[’‘]/g, "'")
        .replace(/[“”]/g, "\"")
        .replace(/[‐‑‒–—―]/g, "-")
        .replace(/\s+/g, " ")
        .slice(0, 220);
    }
    return normalizeWord(value);
  }

  function getCacheKey(word, options = {}) {
    const kind = options.kind === "example" ? "example" : "word";
    if (kind === "example" && String(word || "").startsWith("example:")) {
      return String(word || "").trim().toLowerCase();
    }
    const text = normalizeAudioText(word, kind);
    return kind === "example" ? `example:${text.toLowerCase()}` : text;
  }

  function getRequestTextFromKey(key, kind = "word") {
    const value = String(key || "");
    if (kind === "example" && value.startsWith("example:")) return value.slice(8);
    return value;
  }

  function buildStaticAudioIndex(manifest = {}) {
    const byWord = new Map();
    Object.entries(manifest || {}).forEach(([key, url]) => {
      const cleanUrl = String(url || "").trim();
      if (!cleanUrl) return;
      const word = normalizeWord(String(key || "").split("|").pop());
      if (!word || byWord.has(word)) return;
      byWord.set(word, cleanUrl);
    });
    return byWord;
  }

  function hasIndexedDb() {
    return typeof indexedDB !== "undefined";
  }

  function openDb() {
    if (!hasIndexedDb()) return Promise.resolve(null);
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_AUDIO)) {
          db.createObjectStore(STORE_AUDIO, { keyPath: "word" });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: "word" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    });

    return dbPromise;
  }

  function readStore(storeName, key) {
    return openDb().then((db) => new Promise((resolve) => {
      if (!db) {
        resolve(null);
        return;
      }
      const transaction = db.transaction(storeName, "readonly");
      const request = transaction.objectStore(storeName).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    }));
  }

  function writeStore(storeName, value) {
    return openDb().then((db) => new Promise((resolve) => {
      if (!db) {
        resolve(false);
        return;
      }
      const transaction = db.transaction(storeName, "readwrite");
      const request = transaction.objectStore(storeName).put(value);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    }));
  }

  function hasStaticAudio(word, options = {}) {
    if (options.kind === "example") return false;
    return staticAudioByWord.has(getCacheKey(word));
  }

  async function getCachedRecord(word, options = {}) {
    const key = getCacheKey(word, options);
    if (!key) return null;
    const record = await readStore(STORE_AUDIO, key);
    return record?.blob ? record : null;
  }

  async function hasCachedAudio(word, options = {}) {
    return Boolean(await getCachedRecord(word, options));
  }

  async function hasAudio(word, options = {}) {
    if (hasStaticAudio(word, options)) return true;
    return hasCachedAudio(word, options);
  }

  function getStaticAudioUrl(word, options = {}) {
    if (options.kind === "example") return "";
    return staticAudioByWord.get(getCacheKey(word)) || "";
  }

  function stop() {
    activeToken += 1;
    if (activeAudio) {
      try {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      } catch (_error) {
        // Mobile WebViews can throw if playback has already ended.
      }
    }
    activeAudio = null;
    if (activeObjectUrl) {
      URL.revokeObjectURL(activeObjectUrl);
      activeObjectUrl = "";
    }
  }

  function playUrl(url, options = {}) {
    return new Promise((resolve, reject) => {
      const token = activeToken + 1;
      if (!options.keepCurrentObjectUrl) stop();
      activeToken = token;
      const audio = new Audio(url);
      activeAudio = audio;
      audio.volume = Number.isFinite(options.volume) ? Math.max(0, Math.min(1, options.volume)) : 1;
      audio.preload = "auto";
      audio.onended = () => {
        if (token === activeToken) {
          activeAudio = null;
          if (activeObjectUrl) {
            URL.revokeObjectURL(activeObjectUrl);
            activeObjectUrl = "";
          }
        }
        resolve(true);
      };
      audio.onerror = () => {
        if (token === activeToken) activeAudio = null;
        reject(new Error("Audio playback failed."));
      };
      audio.play().then(() => resolve(true)).catch(reject);
    });
  }

  async function play(word, options = {}) {
    const kind = options.kind === "example" ? "example" : "word";
    const key = getCacheKey(word, { kind });
    if (!key) return false;

    const staticUrl = getStaticAudioUrl(key, { kind });
    if (staticUrl) {
      await playUrl(staticUrl, options);
      return true;
    }

    let cached = await getCachedRecord(key, { kind });
    if (!cached?.blob && options.ensure !== false) {
      const result = await ensureAudio(word, { force: options.forceEnsure === true, kind });
      if (result?.status === "ready") {
        cached = await getCachedRecord(key, { kind });
      }
    }

    if (cached?.blob) {
      stop();
      activeObjectUrl = URL.createObjectURL(cached.blob);
      await playUrl(activeObjectUrl, { ...options, keepCurrentObjectUrl: true });
      return true;
    }

    return false;
  }

  function isLikelyEnglishWordOrPhrase(word) {
    const text = getCacheKey(word);
    return Boolean(text && /^[a-z][a-z' -]{0,60}$/.test(text) && !/ {2,}|--|''/.test(text));
  }

  function isLikelyEnglishAudioText(text, options = {}) {
    if (options.kind !== "example") return isLikelyEnglishWordOrPhrase(text);
    const value = normalizeAudioText(text, "example");
    return Boolean(
      value
      && value.length <= 220
      && /[a-z]/i.test(value)
      && /^[a-z0-9][a-z0-9\s.,!?;:'"()/-]{0,219}$/i.test(value)
      && !/ {2,}|--|''|""/.test(value)
    );
  }

  async function getMeta(word) {
    return readStore(STORE_META, getCacheKey(word));
  }

  async function markMiss(word, reason = "not-found") {
    const key = getCacheKey(word);
    if (!key) return;
    await writeStore(STORE_META, {
      word: key,
      status: "missing",
      reason,
      updatedAt: Date.now()
    });
  }

  function getSharedAudioCallable() {
    if (typeof options.sharedAudioProvider === "function") {
      return options.sharedAudioProvider;
    }

    const bundle = typeof options.getFirebaseBundle === "function" ? options.getFirebaseBundle() : null;
    if (!bundle?.functions || !bundle.modules?.httpsCallable) return null;
    if (bundle.auth && !bundle.auth.currentUser) return null;
    if (!sharedAudioCallable || sharedAudioCallableBundle !== bundle) {
      sharedAudioCallable = bundle.modules.httpsCallable(bundle.functions, "ensureVocabAudio");
      sharedAudioCallableBundle = bundle;
    }
    return sharedAudioCallable;
  }

  async function requestSharedAudio(word, options = {}) {
    const callable = getSharedAudioCallable();
    if (!callable) return null;
    const kind = options.kind === "example" ? "example" : "word";
    const text = kind === "example" ? normalizeAudioText(word, kind) : getCacheKey(word);
    const result = await callable({ word: text, text, kind });
    return result?.data || result || null;
  }

  function fetchWithTimeout(url) {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS) : 0;
    return fetch(url, {
      cache: "force-cache",
      signal: controller?.signal
    }).finally(() => {
      if (timer) clearTimeout(timer);
    });
  }

  async function fetchSharedAudioBlob(audioData) {
    const downloadUrl = String(audioData?.downloadUrl || "").trim();
    if (!downloadUrl) return null;
    const response = await fetchWithTimeout(downloadUrl);
    if (!response.ok) return null;
    const blob = await response.blob();
    const mime = String(blob.type || response.headers.get("content-type") || "").split(";")[0].toLowerCase();
    if (!blob.size || blob.size > MAX_AUDIO_BYTES) return null;
    if (mime && !ALLOWED_MIME_TYPES.has(mime) && !/^audio\/mpeg$/.test(mime)) return null;
    return {
      blob,
      playbackUrl: downloadUrl,
      source: audioData.source || "firebase-shared",
      audioId: audioData.audioId || "",
      storagePath: audioData.storagePath || ""
    };
  }

  async function saveSharedAudio(word, audio, options = {}) {
    const kind = options.kind === "example" ? "example" : "word";
    const key = getCacheKey(word, { kind });
    if (!key || !audio?.blob) return false;
    const now = Date.now();
    await writeStore(STORE_AUDIO, {
      word: key,
      text: normalizeAudioText(word, kind),
      kind,
      blob: audio.blob,
      source: audio.source || "firebase-shared",
      playbackUrl: audio.playbackUrl || "",
      audioId: audio.audioId || "",
      storagePath: audio.storagePath || "",
      createdAt: now,
      updatedAt: now
    });
    await writeStore(STORE_META, {
      word: key,
      text: normalizeAudioText(word, kind),
      kind,
      status: "ready",
      source: audio.source || "firebase-shared",
      audioId: audio.audioId || "",
      storagePath: audio.storagePath || "",
      updatedAt: now
    });
    return true;
  }

  async function ensureAudio(word, options = {}) {
    const kind = options.kind === "example" ? "example" : "word";
    const key = getCacheKey(word, { kind });
    const requestText = kind === "example" && !String(word || "").startsWith("example:")
      ? normalizeAudioText(word, kind)
      : getRequestTextFromKey(key, kind);
    if (!key || hasStaticAudio(key, { kind })) return { status: "ready", source: "bundle" };
    if (!isLikelyEnglishAudioText(requestText, { kind })) return { status: "skipped", source: "invalid" };
    if (pendingDownloads.has(key)) return pendingDownloads.get(key);

    const task = (async () => {
      if (await hasCachedAudio(key, { kind })) return { status: "ready", source: "cache" };

      const meta = options.force ? null : await getMeta(key);
      if (meta?.status === "missing" && Date.now() - Number(meta.updatedAt || 0) < CACHE_MISS_TTL_MS) {
        return { status: "missing", source: "cached-miss", reason: meta.reason || "cached-miss" };
      }

      try {
        const shared = await requestSharedAudio(requestText, { kind });
        if (!shared) {
          return { status: "missing", source: "firebase-shared", reason: "login-required" };
        }

        if (shared?.status !== "ready" || !shared.downloadUrl) {
          await markMiss(key, shared?.reason || "not-ready");
          return { status: "missing", source: shared?.source || "firebase-shared", reason: shared?.reason || "not-ready" };
        }

        const audio = await fetchSharedAudioBlob(shared);
        if (!audio?.blob) {
          await markMiss(key, "download-failed");
          return { status: "missing", source: shared.source || "firebase-shared", reason: "download-failed" };
        }

        await saveSharedAudio(requestText, audio, { kind });
        return {
          status: "ready",
          source: audio.source || "firebase-shared",
          audioId: audio.audioId || ""
        };
      } catch (error) {
        console.warn("Shared vocab audio request failed:", error);
        if (!options.force) {
          await markMiss(key, "network-error");
        }
        return { status: "missing", source: "firebase-shared", reason: "network-error" };
      }
    })().finally(() => {
      pendingDownloads.delete(key);
    });

    pendingDownloads.set(key, task);
    return task;
  }

  function queueEnsureAudio(word, options = {}) {
    const kind = options.kind === "example" ? "example" : "word";
    const key = getCacheKey(word, { kind });
    if (!key || hasStaticAudio(key, { kind })) return Promise.resolve({ status: "ready", source: "bundle" });
    if (!isLikelyEnglishAudioText(getRequestTextFromKey(key, kind), { kind })) return Promise.resolve({ status: "skipped", source: "invalid" });
    if (pendingDownloads.has(key)) return pendingDownloads.get(key);
    if (!queuedWords.has(key)) {
      queuedWords.add(key);
      downloadQueue.push(key);
    }
    runQueue();
    return Promise.resolve({ status: "queued", source: "firebase-shared" });
  }

  async function runQueue() {
    if (queueRunning) return;
    queueRunning = true;
    while (downloadQueue.length) {
      const key = downloadQueue.shift();
      queuedWords.delete(key);
      const kind = key.startsWith("example:") ? "example" : "word";
      await ensureAudio(getRequestTextFromKey(key, kind), { kind });
    }
    queueRunning = false;
  }

  return {
    ensureAudio,
    getCacheKey,
    getStaticAudioUrl,
    hasAudio,
    hasCachedAudio,
    hasStaticAudio,
    normalizeWord,
    normalizeAudioText,
    play,
    queueEnsureAudio,
    stop,
    _private: {
      buildStaticAudioIndex,
      ensureAudio,
      fetchSharedAudioBlob,
      isLikelyEnglishAudioText,
      isLikelyEnglishWordOrPhrase,
      markMiss,
      requestSharedAudio
    }
  };
});
