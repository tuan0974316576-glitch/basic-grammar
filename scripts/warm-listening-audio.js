const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');

const DEFAULT_API_BASE = 'https://asia-east2-battleship-game-c0909.cloudfunctions.net/speakingApi';
const DEFAULT_MANIFEST_PATH = path.resolve(__dirname, '..', 'listening_audio_manifest.js');
const DEFAULT_DATA_PATH = path.resolve(__dirname, '..', 'vocab_data.js');
const DEFAULT_LEVEL = 'L1';
const LISTENING_VOICES = [
  {
    label: 'Ava (Canada)',
    voiceName: 'en-US-AvaMultilingualNeural',
    accentLocale: 'en-CA'
  },
  {
    label: 'Andrew (US)',
    voiceName: 'en-US-AndrewMultilingualNeural',
    accentLocale: 'en-US'
  },
  {
    label: 'Jenny (US)',
    voiceName: 'en-US-JennyNeural',
    accentLocale: 'en-US'
  },
  {
    label: 'Guy (US)',
    voiceName: 'en-US-GuyNeural',
    accentLocale: 'en-US'
  }
];
let curlFallbackAnnounced = false;

function getArgValue(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = process.argv.find(arg => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function hasArg(name) {
  return process.argv.includes(`--${name}`);
}

function extractLevelArray(source, levelKey) {
  const levelPos = source.indexOf(`"${levelKey}"`);
  if (levelPos < 0) throw new Error(`Level ${levelKey} not found in vocab data.`);
  const arrStart = source.indexOf('[', levelPos);
  if (arrStart < 0) throw new Error(`Level ${levelKey} array not found.`);

  let depth = 0;
  for (let index = arrStart; index < source.length; index++) {
    const char = source[index];
    if (char === '[') depth++;
    if (char === ']') {
      depth--;
      if (depth === 0) return source.slice(arrStart, index + 1);
    }
  }

  throw new Error(`Level ${levelKey} array is not closed.`);
}

function loadListeningRows(levelKey) {
  const source = fs.readFileSync(DEFAULT_DATA_PATH, 'utf8');
  const levelWords = JSON.parse(extractLevelArray(source, levelKey));
  const rows = [];

  levelWords.forEach((word, wordIndex) => {
    const sentences = Array.isArray(word.sents) ? word.sents : [];
    sentences.forEach((sentence, sentenceIndex) => {
      const text = String(sentence?.text || '').trim();
      if (!text) return;
      const voice = LISTENING_VOICES[((wordIndex * 3) + sentenceIndex) % LISTENING_VOICES.length];
      rows.push({
        level: levelKey,
        word: String(word.en || '').trim(),
        wordIndex,
        sentenceIndex,
        text,
        voice
      });
    });
  });

  return rows;
}

function getListeningManifestKey(row) {
  return [
    row.level,
    'en-US',
    `${row.voice.voiceName}::${row.voice.accentLocale}`,
    row.text
  ].join('|');
}

function execFileAsync(file, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(file, args, {
      maxBuffer: 20 * 1024 * 1024,
      ...options
    }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

function getTimeoutSeconds(timeoutMs) {
  return Math.max(1, Math.ceil((timeoutMs || 30000) / 1000));
}

function shouldUseCurlFallback(error) {
  const code = error?.cause?.code || error?.code || '';
  return code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || /certificate|fetch failed/i.test(error?.message || '');
}

function announceCurlFallback() {
  if (curlFallbackAnnounced) return;
  curlFallbackAnnounced = true;
  console.warn('[listening-audio] Node HTTPS failed; using curl fallback for requests.');
}

function isRateLimitError(error) {
  return /429|too many|rate/i.test(JSON.stringify(error?.azure || {}))
    || /429|too many|rate/i.test(error?.message || '');
}

async function requestListeningAudioWithCurl(apiBase, payload, requestTimeoutMs) {
  const args = [
    '-sS',
    '-L',
    '--http1.1',
    '--max-time',
    String(getTimeoutSeconds(requestTimeoutMs)),
    '-X',
    'POST',
    '-H',
    'Content-Type: application/json',
    '--data-binary',
    JSON.stringify(payload),
    '-w',
    '\n__HTTP_STATUS__:%{http_code}',
    `${apiBase}/api/listening-audio`
  ];

  const { stdout } = await execFileAsync('curl', args);
  const marker = '\n__HTTP_STATUS__:';
  const markerIndex = stdout.lastIndexOf(marker);
  const rawBody = markerIndex >= 0 ? stdout.slice(0, markerIndex) : stdout;
  const status = markerIndex >= 0 ? Number(stdout.slice(markerIndex + marker.length).trim()) : 200;

  let result = null;
  try {
    result = rawBody ? JSON.parse(rawBody) : null;
  } catch (_error) {
    throw new Error(rawBody || 'Invalid JSON response from curl.');
  }

  if (status < 200 || status >= 300 || !result?.audioUrl) {
    const error = new Error((result && (result.message || result.error)) || `HTTP ${status}`);
    error.status = status;
    error.retryAfter = result?.retryAfter || '';
    error.azure = result?.azure || result || null;
    throw error;
  }

  return result;
}

async function warmOne(apiBase, row, index, total, requestTimeoutMs, curlOnly = false) {
  return retryAsync(
    () => warmOneAttempt(apiBase, row, index, total, requestTimeoutMs, curlOnly),
    `row ${index + 1}/${total} ${row.level} ${row.word} S${row.sentenceIndex + 1}`
  );
}

async function warmOneAttempt(apiBase, row, index, total, requestTimeoutMs, curlOnly = false) {
  const controller = new AbortController();
  const timeout = requestTimeoutMs
    ? setTimeout(() => controller.abort(), requestTimeoutMs)
    : null;

  const payload = {
    text: row.text,
    level: row.level,
    locale: 'en-US',
    word: row.word,
    sentenceIndex: row.sentenceIndex,
    voiceName: row.voice.voiceName,
    accentLocale: row.voice.accentLocale
  };

  if (curlOnly) {
    const result = await requestListeningAudioWithCurl(apiBase, payload, requestTimeoutMs);
    const status = result.cached ? 'cached' : 'created';
    console.log(`[${index + 1}/${total}] ${status}: ${row.level} ${row.word} S${row.sentenceIndex + 1} ${row.voice.label}`);
    if (timeout) clearTimeout(timeout);
    return [getListeningManifestKey(row), result.audioUrl];
  }

  let response = null;
  try {
    response = await fetch(`${apiBase}/api/listening-audio`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    if (shouldUseCurlFallback(error)) {
      announceCurlFallback();
      const result = await requestListeningAudioWithCurl(apiBase, payload, requestTimeoutMs);
      const status = result.cached ? 'cached' : 'created';
      console.log(`[${index + 1}/${total}] ${status}: ${row.level} ${row.word} S${row.sentenceIndex + 1} ${row.voice.label}`);
      return [getListeningManifestKey(row), result.audioUrl];
    }
    throw error;
  } finally {
    if (timeout) clearTimeout(timeout);
  }

  const rawText = await response.text();
  let result = null;
  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch (_error) {
    throw new Error(rawText || `Invalid JSON for row ${index + 1}`);
  }

  if (!response.ok || !result?.audioUrl) {
    const error = new Error((result && (result.message || result.error)) || `Failed row ${index + 1}`);
    if (result?.azure) error.azure = result.azure;
    throw error;
  }

  const status = result.cached ? 'cached' : 'created';
  console.log(`[${index + 1}/${total}] ${status}: ${row.level} ${row.word} S${row.sentenceIndex + 1} ${row.voice.label}`);
  return [getListeningManifestKey(row), result.audioUrl];
}

async function retryAsync(task, label, attempts = 4) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt >= attempts) break;
      const delayMs = isRateLimitError(error) ? 60000 * attempt : 750 * attempt;
      console.warn(`[retry ${attempt}/${attempts - 1}] ${label}: ${error.message || error}`);
      if (isRateLimitError(error)) console.warn(`[rate-limit] waiting ${delayMs}ms before retry`);
      await delay(delayMs);
    }
  }
  throw lastError;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runPool(rows, concurrency, task) {
  const results = new Array(rows.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < rows.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await task(rows[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.max(1, concurrency) }, worker);
  await Promise.all(workers);
  return results;
}

function writeFailedRows(failedRows, manifestPath, level) {
  if (!failedRows.length) return null;

  const failedPath = path.resolve(
    path.dirname(manifestPath),
    `listening_audio_failed_${level.toLowerCase()}.json`
  );
  fs.writeFileSync(failedPath, JSON.stringify(failedRows, null, 2), 'utf8');
  console.warn(`Wrote ${failedRows.length} failed rows to ${failedPath}`);
  return failedPath;
}

function writeManifest(entries, manifestPath) {
  const manifest = loadExistingManifest(manifestPath);
  entries.forEach(([key, url]) => {
    manifest[key] = url;
  });

  const content = [
    'window.LISTENING_AUDIO_MANIFEST = ',
    JSON.stringify(manifest, null, 2),
    ';\n'
  ].join('');

  fs.writeFileSync(manifestPath, content, 'utf8');
  console.log(`Wrote ${Object.keys(manifest).length} audio URLs to ${manifestPath}`);
}

function loadExistingManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) return {};

  const source = fs.readFileSync(manifestPath, 'utf8');
  const match = source.match(/window\.LISTENING_AUDIO_MANIFEST\s*=\s*(\{[\s\S]*\})\s*;/);
  if (!match) return {};

  try {
    return JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`Existing manifest is not valid JSON: ${error.message}`);
  }
}

async function main() {
  const apiBase = (getArgValue('api-base', process.env.SPEAKING_API_BASE || DEFAULT_API_BASE)).replace(/\/$/, '');
  const concurrency = Number(getArgValue('concurrency', process.env.CONCURRENCY || '3')) || 3;
  const manifestPath = path.resolve(getArgValue('manifest', DEFAULT_MANIFEST_PATH));
  const level = getArgValue('level', process.env.LEVEL || DEFAULT_LEVEL);
  const checkpointEvery = Number(getArgValue('checkpoint-every', process.env.CHECKPOINT_EVERY || '25')) || 25;
  const delayMs = Math.max(0, Number(getArgValue('delay-ms', process.env.DELAY_MS || '0')) || 0);
  const maxRows = Math.max(0, Number(getArgValue('max-rows', process.env.MAX_ROWS || '0')) || 0);
  const requestTimeoutMs = Math.max(0, Number(getArgValue('request-timeout-ms', process.env.REQUEST_TIMEOUT_MS || '30000')) || 0);
  const continueOnError = hasArg('continue-on-error');
  const dryRun = hasArg('dry-run');
  const curlOnly = hasArg('curl-only');
  const rows = loadListeningRows(level);
  const totalChars = rows.reduce((sum, row) => sum + row.text.length, 0);
  const existingManifest = loadExistingManifest(manifestPath);
  const allRowsToWarm = rows.filter(row => !existingManifest[getListeningManifestKey(row)]);
  const rowsToWarm = maxRows ? allRowsToWarm.slice(0, maxRows) : allRowsToWarm;
  const existingCount = rows.length - rowsToWarm.length;

  if (!rows.length) throw new Error(`No listening rows found for ${level}.`);

  console.log(`Listening rows: ${rows.length}`);
  console.log(`Already in manifest: ${rows.length - allRowsToWarm.length}`);
  console.log(`Rows to warm: ${rowsToWarm.length}${maxRows ? ` of ${allRowsToWarm.length}` : ''}`);
  console.log(`Level: ${level}`);
  console.log(`API base: ${apiBase}`);
  console.log(`Voices: ${LISTENING_VOICES.map(voice => voice.label).join(', ')}`);
  console.log(`Estimated Azure chars: ${totalChars}`);
  if (delayMs) console.log(`Delay between requests: ${delayMs}ms`);
  if (maxRows) console.log(`Max rows this run: ${maxRows}`);
  if (requestTimeoutMs) console.log(`Request timeout: ${requestTimeoutMs}ms`);
  if (continueOnError) console.log('Continue on error: enabled');
  if (curlOnly) console.log('HTTP mode: curl only');

  if (dryRun) {
    rows.slice(0, 12).forEach((row, index) => {
      console.log(`${index + 1}. ${row.word} S${row.sentenceIndex + 1} ${row.voice.label}: ${row.text}`);
    });
    return;
  }

  if (!rowsToWarm.length) {
    console.log(`Manifest already contains all ${level} audio URLs.`);
    return;
  }

  const checkpointEntries = [];
  const failedRows = [];
  let completed = 0;
  const entries = await runPool(rowsToWarm, concurrency, async (row, index) => {
    let entry = null;
    try {
      entry = await warmOne(apiBase, row, index, rowsToWarm.length, requestTimeoutMs, curlOnly);
      checkpointEntries[index] = entry;
    } catch (error) {
      if (!continueOnError) throw error;
      failedRows.push({
        level: row.level,
        word: row.word,
        sentenceIndex: row.sentenceIndex,
        text: row.text,
        voiceName: row.voice.voiceName,
        accentLocale: row.voice.accentLocale,
        error: error.message || String(error),
        azure: error.azure || null
      });
      const azureSummary = error.azure
        ? ` (${error.azure.cancellationErrorCode || error.azure.resultReason || 'azure detail'})`
        : '';
      console.warn(`[${index + 1}/${rowsToWarm.length}] failed: ${row.level} ${row.word} S${row.sentenceIndex + 1} ${row.voice.label}: ${error.message || error}${azureSummary}`);
    }
    completed++;
    if (checkpointEvery > 0 && completed % checkpointEvery === 0) {
      writeManifest(checkpointEntries.filter(Boolean), manifestPath);
      console.log(`Checkpoint saved: ${completed}/${rowsToWarm.length} new URLs`);
      writeFailedRows(failedRows, manifestPath, level);
    }
    if (delayMs) await delay(delayMs);
    return entry;
  });
  writeManifest(entries.filter(Boolean), manifestPath);
  writeFailedRows(failedRows, manifestPath, level);
  if (failedRows.length) {
    console.warn(`Completed with ${failedRows.length} failed rows. Re-run later to retry skipped rows.`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
