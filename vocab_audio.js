(function attachVocabAudio(root, factory) {
  const api = factory(root.VOCAB_WORD_AUDIO_MANIFEST || {});
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.VocabAudio = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createVocabAudio(staticManifest) {
  "use strict";

  const DB_NAME = "grammar-game-vocab-audio";
  const DB_VERSION = 1;
  const STORE_AUDIO = "audio";
  const STORE_META = "meta";
  const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
  const MAX_AUDIO_BYTES = 1024 * 1024;
  const FETCH_TIMEOUT_MS = 12000;
  const CACHE_MISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  const ALLOWED_MIME_TYPES = new Set(["audio/mpeg", "audio/ogg", "application/ogg", "audio/wav", "audio/webm"]);

  const staticAudioByWord = buildStaticAudioIndex(staticManifest);
  const pendingDownloads = new Map();
  const downloadQueue = [];
  const queuedWords = new Set();
  let queueRunning = false;
  let dbPromise = null;
  let activeAudio = null;
  let activeObjectUrl = "";
  let activeToken = 0;

  function normalizeWord(value) {
    return String(value || "")
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function getCacheKey(word) {
    return normalizeWord(word);
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

  function hasStaticAudio(word) {
    return staticAudioByWord.has(getCacheKey(word));
  }

  async function getCachedRecord(word) {
    const key = getCacheKey(word);
    if (!key) return null;
    const record = await readStore(STORE_AUDIO, key);
    return record?.blob ? record : null;
  }

  async function hasCachedAudio(word) {
    return Boolean(await getCachedRecord(word));
  }

  async function hasAudio(word) {
    return hasStaticAudio(word) || await hasCachedAudio(word);
  }

  function getStaticAudioUrl(word) {
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
    const key = getCacheKey(word);
    if (!key) return false;

    const staticUrl = getStaticAudioUrl(key);
    if (staticUrl) {
      await playUrl(staticUrl, options);
      return true;
    }

    const cached = await getCachedRecord(key);
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
    return Boolean(text && /^[a-z][a-z' -]{0,60}$/.test(text));
  }

  function stripHtml(value) {
    return String(value || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  }

  function titleScore(title, word) {
    const cleanTitle = normalizeWord(title.replace(/^File:/i, "").replace(/\.(ogg|oga|mp3|wav|webm)$/i, ""));
    const exactWord = getCacheKey(word);
    let score = 0;
    if (cleanTitle.includes(exactWord)) score += 25;
    if (/\ben[-_ ]?us\b/.test(cleanTitle)) score += 18;
    if (/\ben[-_ ]?uk\b|\ben[-_ ]?gb\b/.test(cleanTitle)) score += 10;
    if (/lingua[_ -]?libre|pronunciation|audio/.test(cleanTitle)) score += 8;
    if (/sentence|example|music|song|accent/i.test(title)) score -= 12;
    if (!cleanTitle.includes(exactWord)) score -= 25;
    return score;
  }

  function buildSearchQueries(word) {
    const text = getCacheKey(word);
    return [
      `${text} pronunciation english`,
      `en-us ${text} pronunciation`,
      `lingua libre ${text} english`
    ];
  }

  function buildCommonsApiUrl(params) {
    const url = new URL(COMMONS_API);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    return url.toString();
  }

  function fetchJsonWithTimeout(url) {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS) : 0;
    return fetch(url, {
      cache: "force-cache",
      signal: controller?.signal
    }).then((response) => {
      if (!response.ok) throw new Error(`Commons API failed: ${response.status}`);
      return response.json();
    }).finally(() => {
      if (timer) clearTimeout(timer);
    });
  }

  function getTranscodedMp3Url(fileUrl = "") {
    try {
      const url = new URL(fileUrl);
      const filename = url.pathname.split("/").pop() || "";
      if (!/\.ogg$/i.test(filename)) return "";
      const basePath = url.pathname
        .replace(/\/[^/]+$/, "")
        .replace("/wikipedia/commons/", "/wikipedia/commons/transcoded/");
      return `${url.origin}${basePath}/${filename}/${filename}.mp3`;
    } catch (_error) {
      return "";
    }
  }

  function chooseAudioCandidate(pages, word) {
    return pages
      .map((page) => {
        const info = page.imageinfo?.[0] || {};
        const mime = String(info.mime || "").toLowerCase();
        const categories = stripHtml(info.extmetadata?.Categories?.value || "").toLowerCase();
        const isAudio = ALLOWED_MIME_TYPES.has(mime) || /^audio\//.test(mime) || /\.(ogg|oga|mp3|wav|webm)$/i.test(info.url || "");
        const isEnglish = /english|eng\b|en-us|en-uk|en-gb|american|british/.test(`${page.title} ${categories}`.toLowerCase());
        const isPronunciation = /pronunciation|lingua libre|spoken/.test(`${page.title} ${categories}`.toLowerCase());
        return {
          page,
          info,
          score: titleScore(page.title || "", word) + (isAudio ? 40 : -40) + (isEnglish ? 20 : -20) + (isPronunciation ? 16 : 0)
        };
      })
      .filter((candidate) => candidate.info.url && candidate.score > 25)
      .sort((left, right) => right.score - left.score)[0] || null;
  }

  async function findCommonsAudio(word) {
    const text = getCacheKey(word);
    if (!isLikelyEnglishWordOrPhrase(text)) return null;

    for (const query of buildSearchQueries(text)) {
      const url = buildCommonsApiUrl({
        action: "query",
        format: "json",
        origin: "*",
        generator: "search",
        gsrnamespace: "6",
        gsrsearch: query,
        gsrlimit: "10",
        prop: "imageinfo",
        iiprop: "url|mime|size|user|extmetadata"
      });
      const data = await fetchJsonWithTimeout(url);
      const pages = Object.values(data.query?.pages || {});
      const candidate = chooseAudioCandidate(pages, text);
      if (candidate) return candidate;
    }
    return null;
  }

  async function fetchAudioBlob(candidate) {
    const sourceUrl = candidate?.info?.url;
    if (!sourceUrl) return null;
    const mp3Url = getTranscodedMp3Url(sourceUrl);
    const urls = mp3Url ? [mp3Url, sourceUrl] : [sourceUrl];

    for (const url of urls) {
      try {
        const response = await fetch(url, { cache: "force-cache" });
        if (!response.ok) continue;
        const blob = await response.blob();
        const mime = String(blob.type || response.headers.get("content-type") || "").toLowerCase();
        if (!blob.size || blob.size > MAX_AUDIO_BYTES) continue;
        if (mime && !ALLOWED_MIME_TYPES.has(mime) && !/^audio\//.test(mime)) continue;
        return { blob, url, originalUrl: sourceUrl };
      } catch (_error) {
        // Try the next URL form.
      }
    }
    return null;
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

  async function ensureAudio(word) {
    const key = getCacheKey(word);
    if (!key || hasStaticAudio(key)) return { status: "ready", source: "bundle" };
    if (pendingDownloads.has(key)) return pendingDownloads.get(key);

    const task = (async () => {
      if (await hasCachedAudio(key)) return { status: "ready", source: "cache" };

      const meta = await getMeta(key);
      if (meta?.status === "missing" && Date.now() - Number(meta.updatedAt || 0) < CACHE_MISS_TTL_MS) {
        return { status: "missing", source: "cached-miss" };
      }

      try {
        const candidate = await findCommonsAudio(key);
        if (!candidate) {
          await markMiss(key, "not-found");
          return { status: "missing", source: "commons" };
        }

        const audio = await fetchAudioBlob(candidate);
        if (!audio?.blob) {
          await markMiss(key, "download-failed");
          return { status: "missing", source: "commons" };
        }

        const now = Date.now();
        await writeStore(STORE_AUDIO, {
          word: key,
          blob: audio.blob,
          source: "wikimedia-commons",
          sourceUrl: audio.originalUrl,
          playbackUrl: audio.url,
          fileTitle: candidate.page?.title || "",
          artist: stripHtml(candidate.info?.extmetadata?.Artist?.value || candidate.info?.user || ""),
          license: stripHtml(candidate.info?.extmetadata?.LicenseShortName?.value || candidate.info?.extmetadata?.UsageTerms?.value || ""),
          descriptionUrl: candidate.info?.descriptionurl || "",
          createdAt: now,
          updatedAt: now
        });
        await writeStore(STORE_META, {
          word: key,
          status: "ready",
          source: "wikimedia-commons",
          updatedAt: now
        });
        return { status: "ready", source: "wikimedia-commons" };
      } catch (_error) {
        await markMiss(key, "network-error");
        return { status: "missing", source: "commons" };
      }
    })().finally(() => {
      pendingDownloads.delete(key);
    });

    pendingDownloads.set(key, task);
    return task;
  }

  function queueEnsureAudio(word) {
    const key = getCacheKey(word);
    if (!key || hasStaticAudio(key)) return Promise.resolve({ status: "ready", source: "bundle" });
    if (!isLikelyEnglishWordOrPhrase(key)) return Promise.resolve({ status: "skipped", source: "invalid" });
    if (pendingDownloads.has(key)) return pendingDownloads.get(key);
    if (!queuedWords.has(key)) {
      queuedWords.add(key);
      downloadQueue.push(key);
    }
    runQueue();
    return Promise.resolve({ status: "queued", source: "commons" });
  }

  async function runQueue() {
    if (queueRunning) return;
    queueRunning = true;
    while (downloadQueue.length) {
      const key = downloadQueue.shift();
      queuedWords.delete(key);
      await ensureAudio(key);
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
    play,
    queueEnsureAudio,
    stop,
    _private: {
      buildStaticAudioIndex,
      chooseAudioCandidate,
      getTranscodedMp3Url,
      titleScore
    }
  };
});
