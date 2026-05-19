const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { execFile } = require('node:child_process');

const DEFAULT_API_BASE = 'https://asia-east2-battleship-game-c0909.cloudfunctions.net/speakingApi';
const DEFAULT_DATA_PATH = path.resolve(__dirname, '..', 'vocab_data.js');
const DEFAULT_MANIFEST_PATH = path.resolve(__dirname, '..', 'vocab_word_audio_manifest.js');
const DEFAULT_OUTPUT_DIR = path.resolve(__dirname, '..', 'audio', 'vocab_words');
const DEFAULT_VERSION = 'v1';
const DEFAULT_LOCALE = 'en-US';
const DEFAULT_VOICE_NAME = 'en-US-AndrewMultilingualNeural';
const DEFAULT_ACCENT_LOCALE = 'en-US';
const DEFAULT_AZURE_TTS_OUTPUT_FORMAT = 'audio-16khz-32kbitrate-mono-mp3';
let curlFallbackAnnounced = false;

function getArgValue(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = process.argv.find(arg => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function hasArg(name) {
  return process.argv.includes(`--${name}`);
}

function hasArgValue(name) {
  return process.argv.some(arg => arg.startsWith(`--${name}=`));
}

function normalizeText(text) {
  return String(text || '').trim();
}

function normalizeKeyText(text) {
  return normalizeText(text).toLowerCase();
}

function escapeSsmlText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getVoiceKey(voiceName, accentLocale) {
  return `${voiceName || 'default'}::${accentLocale || ''}`;
}

function getManifestKey(text, locale, voiceName, accentLocale) {
  return [
    locale || DEFAULT_LOCALE,
    getVoiceKey(voiceName || DEFAULT_VOICE_NAME, accentLocale || DEFAULT_ACCENT_LOCALE),
    normalizeKeyText(text)
  ].join('|');
}

function getAudioHash(value) {
  return crypto.createHash('sha1').update(value).digest('hex').slice(0, 16);
}

function getAudioSlug(text) {
  const slug = normalizeKeyText(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.slice(0, 72) || 'word';
}

function toRelativeWebPath(filePath) {
  return path.relative(path.resolve(__dirname, '..'), filePath).split(path.sep).join('/');
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
  return Math.max(1, Math.ceil((timeoutMs || 45000) / 1000));
}

function getAzureRealtimeTtsUrl(region) {
  const safeRegion = String(region || '').trim();
  if (!safeRegion) throw new Error('AZURE_SPEECH_REGION is required for --direct-azure.');
  return `https://${safeRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
}

function buildAzureWordSsml(text, locale, voiceName, accentLocale) {
  const safeLocale = locale || DEFAULT_LOCALE;
  const safeVoiceName = voiceName || DEFAULT_VOICE_NAME;
  const langLocale = accentLocale || safeLocale;
  const escapedText = escapeSsmlText(text);
  const speechBody = langLocale === safeLocale
    ? escapedText
    : `<lang xml:lang="${langLocale}">${escapedText}</lang>`;

  return [
    `<speak version="1.0" xml:lang="${safeLocale}">`,
    `  <voice name="${safeVoiceName}">`,
    `    ${speechBody}`,
    '  </voice>',
    '</speak>'
  ].join('');
}

function shouldUseCurlFallback(error) {
  const code = error?.cause?.code || error?.code || '';
  return code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || /certificate|fetch failed/i.test(error?.message || '');
}

function isRateLimitError(error) {
  return /429|too many|rate/i.test(JSON.stringify(error?.azure || {}))
    || /429|too many|rate/i.test(error?.message || '');
}

function shouldFallbackToRealtime(error) {
  const status = Number(error?.status || error?.azure?.status || 0);
  const code = String(error?.azure?.error?.code || error?.azure?.code || '').trim();
  const payload = JSON.stringify(error?.azure || {});
  const message = String(error?.message || '');

  return status === 401
    || status === 403
    || code === '401'
    || code === '403'
    || /invalid subscription key|wrong API endpoint|access denied/i.test(`${message} ${payload}`);
}

function announceCurlFallback() {
  if (curlFallbackAnnounced) return;
  curlFallbackAnnounced = true;
  console.warn('[vocab-audio] Node TLS trust failed; using curl fallback for HTTPS requests.');
}

async function fetchJsonWithCurl(url, payload, timeoutMs) {
  const result = await requestJsonWithCurl(url, {
    method: 'POST',
    payload,
    timeoutMs
  });

  if (!result?.audioUrl) {
    const error = new Error((result && (result.message || result.error)) || 'Vocab word audio failed.');
    if (result?.azure) error.azure = result.azure;
    throw error;
  }
  return result;
}

async function requestJsonWithCurl(url, options = {}) {
  const method = options.method || 'GET';
  const args = [
    '-sS',
    '-L',
    '--http1.1',
    '--max-time',
    String(getTimeoutSeconds(options.timeoutMs)),
    '-X',
    method,
    '-w',
    '\n__HTTP_STATUS__:%{http_code}'
  ];

  if (options.payload) {
    args.push('-H', 'Content-Type: application/json', '--data-binary', JSON.stringify(options.payload));
  }

  args.push(url);
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

  if (status < 200 || status >= 300 || result?.ok === false) {
    const error = new Error((result && (result.message || result.error)) || `HTTP ${status}`);
    error.status = status;
    error.retryAfter = result?.retryAfter || '';
    error.azure = result?.azure || result || null;
    throw error;
  }

  return result;
}

async function downloadFileWithCurl(url, destination, timeoutMs) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  try {
    await execFileAsync('curl', [
      '-fL',
      '-sS',
      '--http1.1',
      '--max-time',
      String(getTimeoutSeconds(timeoutMs)),
      '-o',
      destination,
      url
    ]);
  } catch (error) {
    if (fs.existsSync(destination)) fs.rmSync(destination, { force: true });
    throw new Error((error.stderr || error.message || 'curl download failed').trim());
  }
  const stats = fs.statSync(destination);
  if (!stats.size) {
    fs.rmSync(destination, { force: true });
    throw new Error('Downloaded audio was empty.');
  }
}

async function requestJson(url, options = {}) {
  const method = options.method || 'GET';
  const controller = new AbortController();
  const timeout = options.timeoutMs ? setTimeout(() => controller.abort(), options.timeoutMs) : null;
  const requestOptions = {
    method,
    signal: controller.signal,
    headers: {}
  };

  if (options.payload) {
    requestOptions.headers['Content-Type'] = 'application/json';
    requestOptions.body = JSON.stringify(options.payload);
  }

  try {
    const response = await fetch(url, requestOptions);
    const rawText = await response.text();
    let result = null;
    try {
      result = rawText ? JSON.parse(rawText) : null;
    } catch (_error) {
      throw new Error(rawText || 'Invalid JSON response.');
    }
    if (!response.ok || result?.ok === false) {
      const error = new Error((result && (result.message || result.error)) || `HTTP ${response.status}`);
      error.status = response.status;
      error.retryAfter = response.headers.get('retry-after') || result?.retryAfter || '';
      error.azure = result?.azure || result || null;
      throw error;
    }
    return result;
  } catch (error) {
    if (shouldUseCurlFallback(error)) {
      announceCurlFallback();
      return requestJsonWithCurl(url, options);
    }
    throw error;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function loadVocabDb(dataPath) {
  const source = fs.readFileSync(dataPath, 'utf8');
  const context = {};
  vm.runInNewContext(`${source}\nthis.VOCAB_DB = VOCAB_DB;`, context, { filename: dataPath });
  if (!context.VOCAB_DB || typeof context.VOCAB_DB !== 'object') {
    throw new Error(`VOCAB_DB was not found in ${dataPath}`);
  }
  return context.VOCAB_DB;
}

function loadRows(dataPath, levelArg) {
  const db = loadVocabDb(dataPath);
  const wantedLevels = levelArg && levelArg.toLowerCase() !== 'all'
    ? levelArg.split(',').map(part => part.trim()).filter(Boolean)
    : Object.keys(db);
  const byKey = new Map();

  wantedLevels.forEach(level => {
    const rows = db[level];
    if (!Array.isArray(rows)) {
      throw new Error(`Level ${level} was not found in vocab data.`);
    }

    rows.forEach((entry, index) => {
      const text = normalizeText(entry?.en);
      if (!text) return;
      const key = normalizeKeyText(text);
      const existing = byKey.get(key);
      if (existing) {
        existing.levels.push(level);
        return;
      }
      byKey.set(key, {
        text,
        firstLevel: level,
        levels: [level],
        index
      });
    });
  });

  return Array.from(byKey.values()).sort((a, b) => normalizeKeyText(a.text).localeCompare(normalizeKeyText(b.text)));
}

function loadExistingManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) return {};
  const source = fs.readFileSync(manifestPath, 'utf8');
  const match = source.match(/window\.VOCAB_WORD_AUDIO_MANIFEST\s*=\s*(\{[\s\S]*\})\s*;/);
  if (!match) return {};
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`Existing vocab word audio manifest is not valid JSON: ${error.message}`);
  }
}

function writeManifest(manifest, manifestPath) {
  const ordered = {};
  Object.keys(manifest).sort().forEach(key => {
    ordered[key] = manifest[key];
  });
  const content = [
    'window.VOCAB_WORD_AUDIO_MANIFEST = ',
    JSON.stringify(ordered, null, 2),
    ';\n'
  ].join('');
  fs.writeFileSync(manifestPath, content, 'utf8');
}

function getLocalAudioPath(row, options) {
  const cacheKey = [
    options.version,
    options.locale,
    options.voiceName,
    options.accentLocale,
    normalizeKeyText(row.text)
  ].join('|');
  const filename = `${getAudioSlug(row.text)}-${getAudioHash(cacheKey)}.mp3`;
  return path.join(options.outputDir, options.version, filename);
}

function getPendingRows(rows, manifest, options) {
  const pending = [];
  let repairedManifest = false;

  rows.forEach(row => {
    const manifestKey = getManifestKey(row.text, options.locale, options.voiceName, options.accentLocale);
    const localPath = getLocalAudioPath(row, options);
    const webPath = toRelativeWebPath(localPath);
    const manifestPath = manifest[manifestKey] ? path.resolve(__dirname, '..', manifest[manifestKey]) : '';

    if (manifestPath && fs.existsSync(manifestPath)) return;

    if (fs.existsSync(localPath)) {
      manifest[manifestKey] = webPath;
      repairedManifest = true;
      return;
    }

    pending.push(row);
  });

  return { pending, repairedManifest };
}

function chunkRows(rows, chunkSize) {
  const chunks = [];
  for (let index = 0; index < rows.length; index += chunkSize) {
    chunks.push(rows.slice(index, index + chunkSize));
  }
  return chunks;
}

function buildBatchJobId(rows, chunkIndex, options) {
  const seed = rows.map(row => row.text).join('|');
  const hash = getAudioHash(`${options.version}|${options.voiceName}|${options.accentLocale}|${seed}`);
  const nonce = Date.now().toString(36);
  return `vocab-${options.version}-${String(chunkIndex + 1).padStart(3, '0')}-${nonce}-${hash}`.slice(0, 64);
}

function getAzureBatchStatus(result) {
  return String(result?.azure?.status || result?.azure?.properties?.status || '').trim();
}

function getRetryAfterMs(result, fallbackMs) {
  const retryAfter = Number(result?.retryAfter || result?.azure?.retryAfter || 0);
  return Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : fallbackMs;
}

async function createBatchJob(rows, chunkIndex, options) {
  const jobId = buildBatchJobId(rows, chunkIndex, options);
  const payload = {
    jobId,
    description: `Vocab Conqueror word audio ${options.level} chunk ${chunkIndex + 1}`,
    inputs: rows.map(row => row.text),
    locale: options.locale,
    accentLocale: options.accentLocale,
    voiceName: options.voiceName
  };

  const result = await requestJson(`${options.apiBase}/api/vocab-word-batch/create`, {
    method: 'POST',
    payload,
    timeoutMs: options.requestTimeoutMs
  });

  return {
    jobId: result.jobId || jobId,
    result
  };
}

async function waitForBatchJob(jobId, options) {
  const startedAt = Date.now();
  const timeoutAt = startedAt + options.batchTimeoutMs;

  while (Date.now() < timeoutAt) {
    const result = await requestJson(`${options.apiBase}/api/vocab-word-batch/status/${encodeURIComponent(jobId)}`, {
      timeoutMs: options.requestTimeoutMs
    });
    const status = getAzureBatchStatus(result);
    console.log(`[batch ${jobId}] status=${status || 'unknown'}`);

    if (/Succeeded/i.test(status)) return result;

    if (/Failed/i.test(status)) {
      const error = new Error(`Azure batch synthesis failed: ${status}`);
      error.azure = result.azure || result;
      throw error;
    }

    if (/Cancelled|Deleted/i.test(status)) {
      const error = new Error(`Azure batch synthesis stopped: ${status}`);
      error.azure = result.azure || result;
      throw error;
    }

    await delay(getRetryAfterMs(result, options.pollMs));
  }

  throw new Error(`Timed out waiting for batch job ${jobId}.`);
}

function findFilesByExtension(rootDir, extension) {
  const results = [];
  if (!fs.existsSync(rootDir)) return results;

  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFilesByExtension(entryPath, extension));
    } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === extension) {
      results.push(entryPath);
    }
  }

  return results;
}

function sortBatchOutputFiles(files) {
  return files.sort((a, b) => {
    const aName = path.basename(a);
    const bName = path.basename(b);
    return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' });
  });
}

async function extractBatchZip(zipPath, extractDir) {
  fs.rmSync(extractDir, { recursive: true, force: true });
  fs.mkdirSync(extractDir, { recursive: true });
  await execFileAsync('unzip', ['-q', '-o', zipPath, '-d', extractDir]);
}

async function importBatchResult(rows, zipPath, extractDir, manifest, options) {
  await extractBatchZip(zipPath, extractDir);
  const audioFiles = sortBatchOutputFiles(findFilesByExtension(extractDir, '.mp3'));

  if (audioFiles.length < rows.length) {
    throw new Error(`Batch result only contained ${audioFiles.length} mp3 files for ${rows.length} inputs.`);
  }

  rows.forEach((row, index) => {
    const sourcePath = audioFiles[index];
    const localPath = getLocalAudioPath(row, options);
    const manifestKey = getManifestKey(row.text, options.locale, options.voiceName, options.accentLocale);
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.copyFileSync(sourcePath, localPath);
    manifest[manifestKey] = toRelativeWebPath(localPath);
  });
}

async function processBatchChunk(rows, chunkIndex, totalChunks, manifest, options) {
  console.log(`[batch ${chunkIndex + 1}/${totalChunks}] creating ${rows.length} words...`);
  const { jobId } = await createBatchJob(rows, chunkIndex, options);
  console.log(`[batch ${chunkIndex + 1}/${totalChunks}] job=${jobId}`);
  await waitForBatchJob(jobId, options);

  const batchDir = path.join(options.tempDir, jobId);
  const zipPath = path.join(batchDir, `${jobId}.zip`);
  const extractDir = path.join(batchDir, 'extract');
  fs.mkdirSync(batchDir, { recursive: true });

  await downloadFile(`${options.apiBase}/api/vocab-word-batch/result/${encodeURIComponent(jobId)}`, zipPath, options.resultTimeoutMs);
  await importBatchResult(rows, zipPath, extractDir, manifest, options);
  writeManifest(manifest, options.manifestPath);
  console.log(`[batch ${chunkIndex + 1}/${totalChunks}] imported ${rows.length} words.`);

  if (options.deleteJobs) {
    await requestJson(`${options.apiBase}/api/vocab-word-batch/${encodeURIComponent(jobId)}`, {
      method: 'DELETE',
      timeoutMs: options.requestTimeoutMs
    }).catch(error => {
      console.warn(`[batch ${jobId}] delete skipped: ${error.message || error}`);
    });
  }

  if (!options.keepTemp) {
    fs.rmSync(batchDir, { recursive: true, force: true });
  }
}

async function runBatchMode(rows, manifest, options) {
  const { pending, repairedManifest } = getPendingRows(rows, manifest, options);
  if (repairedManifest) writeManifest(manifest, options.manifestPath);

  console.log(`Already local: ${rows.length - pending.length}`);
  console.log(`Pending batch audio: ${pending.length}`);
  if (!pending.length) {
    if (fs.existsSync(options.failedPath)) fs.rmSync(options.failedPath, { force: true });
    console.log(`Done. Wrote ${Object.keys(manifest).length} vocab word audio entries.`);
    return;
  }

  const chunks = chunkRows(pending, options.batchSize);
  const failed = [];

  for (let index = 0; index < chunks.length; index++) {
    try {
      await processBatchChunk(chunks[index], index, chunks.length, manifest, options);
    } catch (error) {
      const failedRows = chunks[index].map(row => ({
        word: row.text,
        levels: row.levels,
        message: error.message || String(error),
        azure: error.azure || null
      }));
      failed.push(...failedRows);
      fs.writeFileSync(options.failedPath, JSON.stringify(failed, null, 2), 'utf8');
      console.error(`[batch ${index + 1}/${chunks.length}] failed: ${error.message || error}`);
      if (!options.continueOnError) throw error;
    }
  }

  if (failed.length) {
    console.warn(`Finished with ${failed.length} failed rows. See ${options.failedPath}`);
  } else if (fs.existsSync(options.failedPath)) {
    fs.rmSync(options.failedPath, { force: true });
  }

  writeManifest(manifest, options.manifestPath);
  console.log(`Done. Wrote ${Object.keys(manifest).length} vocab word audio entries.`);
}

async function runRealtimeMode(rows, manifest, options) {
  const completed = [];
  const failed = [];

  await runPool(rows, options.concurrency, async (row, index) => {
    try {
      const entry = await warmOne(row, index, rows.length, options, manifest);
      manifest[entry.key] = entry.url;
      completed.push(entry);
      if (completed.length % options.checkpointEvery === 0) {
        writeManifest(manifest, options.manifestPath);
        console.log(`Checkpoint: wrote ${Object.keys(manifest).length} manifest entries.`);
      }
      if (options.delayMs) await delay(options.delayMs);
      return entry;
    } catch (error) {
      failed.push({
        word: row.text,
        levels: row.levels,
        message: error.message || String(error),
        azure: error.azure || null
      });
      console.error(`[failed] ${row.text}: ${error.message || error}`);
      if (options.stopOnRateLimit && isRateLimitError(error)) {
        writeManifest(manifest, options.manifestPath);
        fs.writeFileSync(options.failedPath, JSON.stringify(failed, null, 2), 'utf8');
        throw new Error(`Azure rate limit hit while generating "${row.text}". Stop and rerun later; completed entries were checkpointed.`);
      }
      if (!options.continueOnError) throw error;
      if (options.delayMs) await delay(options.delayMs);
      return null;
    }
  });

  writeManifest(manifest, options.manifestPath);

  if (failed.length) {
    fs.writeFileSync(options.failedPath, JSON.stringify(failed, null, 2), 'utf8');
    console.warn(`Finished with ${failed.length} failed rows. See ${options.failedPath}`);
    if (!options.continueOnError) process.exitCode = 1;
  } else if (fs.existsSync(options.failedPath)) {
    fs.rmSync(options.failedPath, { force: true });
  }

  console.log(`Done. Wrote ${Object.keys(manifest).length} vocab word audio entries.`);
}

async function fetchJson(url, payload, timeoutMs) {
  const controller = new AbortController();
  const timeout = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const rawText = await response.text();
    let result = null;
    try {
      result = rawText ? JSON.parse(rawText) : null;
    } catch (_error) {
      throw new Error(rawText || 'Invalid JSON response.');
    }
    if (!response.ok || !result?.audioUrl) {
      const error = new Error((result && (result.message || result.error)) || 'Vocab word audio failed.');
      if (result?.azure) error.azure = result.azure;
      throw error;
    }
    return result;
  } catch (error) {
    if (shouldUseCurlFallback(error)) {
      announceCurlFallback();
      return fetchJsonWithCurl(url, payload, timeoutMs);
    }
    throw error;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function downloadFile(url, destination, timeoutMs) {
  const controller = new AbortController();
  const timeout = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Download failed with HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) throw new Error('Downloaded audio was empty.');
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, bytes);
  } catch (error) {
    if (shouldUseCurlFallback(error)) {
      announceCurlFallback();
      await downloadFileWithCurl(url, destination, timeoutMs);
      return;
    }
    throw error;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function writeAzureRealtimeTtsFile(text, destination, options) {
  if (!options.azureSpeechKey) throw new Error('AZURE_SPEECH_KEY is required for --direct-azure.');

  const controller = new AbortController();
  const timeout = options.requestTimeoutMs ? setTimeout(() => controller.abort(), options.requestTimeoutMs) : null;
  const tempPath = `${destination}.tmp-${process.pid}-${Date.now()}`;

  try {
    const response = await fetch(getAzureRealtimeTtsUrl(options.azureSpeechRegion), {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Ocp-Apim-Subscription-Key': options.azureSpeechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': options.azureTtsOutputFormat || DEFAULT_AZURE_TTS_OUTPUT_FORMAT,
        'User-Agent': 'vocab-conqueror-word-audio'
      },
      body: buildAzureWordSsml(text, options.locale, options.voiceName, options.accentLocale)
    });

    if (!response.ok) {
      const rawText = await response.text().catch(() => '');
      const error = new Error(rawText || `Azure realtime TTS failed with HTTP ${response.status}.`);
      error.status = response.status;
      error.retryAfter = response.headers.get('retry-after') || '';
      error.azure = {
        status: response.status,
        message: rawText.slice(0, 500)
      };
      throw error;
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) throw new Error('Azure returned empty audio.');

    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(tempPath, bytes);
    fs.renameSync(tempPath, destination);
  } finally {
    if (timeout) clearTimeout(timeout);
    if (fs.existsSync(tempPath)) fs.rmSync(tempPath, { force: true });
  }
}

async function retryAsync(task, label, attempts = 4) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt >= attempts) break;
      const isRateLimited = isRateLimitError(error);
      const delayMs = isRateLimited ? 5000 * attempt : 900 * attempt;
      console.warn(`[retry ${attempt}/${attempts - 1}] ${label}: ${error.message || error}`);
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

async function warmOne(row, index, total, options, manifest) {
  const manifestKey = getManifestKey(row.text, options.locale, options.voiceName, options.accentLocale);
  const localPath = getLocalAudioPath(row, options);
  const webPath = toRelativeWebPath(localPath);

  if (manifest[manifestKey] && fs.existsSync(path.resolve(__dirname, '..', manifest[manifestKey]))) {
    console.log(`[${index + 1}/${total}] local: ${row.text}`);
    return { key: manifestKey, url: manifest[manifestKey], skipped: true };
  }

  if (fs.existsSync(localPath)) {
    console.log(`[${index + 1}/${total}] file: ${row.text}`);
    return { key: manifestKey, url: webPath, skipped: true };
  }

  const result = await retryAsync(async () => {
    const apiResult = await fetchJson(`${options.apiBase}/api/listening-audio`, {
      text: row.text,
      locale: options.locale,
      level: 'VOCAB',
      word: row.text,
      sentenceIndex: null,
      voiceName: options.voiceName,
      accentLocale: options.accentLocale
    }, options.requestTimeoutMs);

    await downloadFile(apiResult.audioUrl, localPath, options.requestTimeoutMs);
    return apiResult;
  }, `word ${index + 1}/${total} ${row.text}`, options.attempts);

  console.log(`[${index + 1}/${total}] ${result.cached ? 'cached' : 'created'}: ${row.text}`);
  return { key: manifestKey, url: webPath, skipped: false };
}

async function warmOneDirectAzure(row, index, total, options, manifest) {
  const manifestKey = getManifestKey(row.text, options.locale, options.voiceName, options.accentLocale);
  const localPath = getLocalAudioPath(row, options);
  const webPath = toRelativeWebPath(localPath);

  if (manifest[manifestKey] && fs.existsSync(path.resolve(__dirname, '..', manifest[manifestKey]))) {
    console.log(`[${index + 1}/${total}] local: ${row.text}`);
    return { key: manifestKey, url: manifest[manifestKey], skipped: true };
  }

  if (fs.existsSync(localPath)) {
    console.log(`[${index + 1}/${total}] file: ${row.text}`);
    return { key: manifestKey, url: webPath, skipped: true };
  }

  await retryAsync(async () => {
    await writeAzureRealtimeTtsFile(row.text, localPath, options);
  }, `direct word ${index + 1}/${total} ${row.text}`, options.attempts);

  console.log(`[${index + 1}/${total}] direct: ${row.text}`);
  return { key: manifestKey, url: webPath, skipped: false };
}

async function runDirectAzureMode(rows, manifest, options) {
  const completed = [];
  const failed = [];

  await runPool(rows, options.concurrency, async (row, index) => {
    try {
      const entry = await warmOneDirectAzure(row, index, rows.length, options, manifest);
      manifest[entry.key] = entry.url;
      completed.push(entry);
      if (completed.length % options.checkpointEvery === 0) {
        writeManifest(manifest, options.manifestPath);
        console.log(`Checkpoint: wrote ${Object.keys(manifest).length} manifest entries.`);
      }
      if (options.delayMs) await delay(options.delayMs);
      return entry;
    } catch (error) {
      failed.push({
        word: row.text,
        levels: row.levels,
        message: error.message || String(error),
        azure: error.azure || null
      });
      console.error(`[failed] ${row.text}: ${error.message || error}`);
      if (options.stopOnRateLimit && isRateLimitError(error)) {
        writeManifest(manifest, options.manifestPath);
        fs.writeFileSync(options.failedPath, JSON.stringify(failed, null, 2), 'utf8');
        throw new Error(`Azure rate limit hit while generating "${row.text}". Stop and rerun later; completed entries were checkpointed.`);
      }
      if (!options.continueOnError) throw error;
      if (options.delayMs) await delay(options.delayMs);
      return null;
    }
  });

  writeManifest(manifest, options.manifestPath);

  if (failed.length) {
    fs.writeFileSync(options.failedPath, JSON.stringify(failed, null, 2), 'utf8');
    console.warn(`Finished with ${failed.length} failed rows. See ${options.failedPath}`);
    if (!options.continueOnError) process.exitCode = 1;
  } else if (fs.existsSync(options.failedPath)) {
    fs.rmSync(options.failedPath, { force: true });
  }

  console.log(`Done. Wrote ${Object.keys(manifest).length} vocab word audio entries.`);
}

async function main() {
  const apiBase = (getArgValue('api-base', process.env.SPEAKING_API_BASE || DEFAULT_API_BASE)).replace(/\/$/, '');
  const dataPath = path.resolve(getArgValue('data', DEFAULT_DATA_PATH));
  const manifestPath = path.resolve(getArgValue('manifest', DEFAULT_MANIFEST_PATH));
  const outputDir = path.resolve(getArgValue('output-dir', DEFAULT_OUTPUT_DIR));
  const level = getArgValue('level', process.env.LEVEL || 'all');
  const locale = getArgValue('locale', process.env.LOCALE || DEFAULT_LOCALE);
  const voiceName = getArgValue('voice-name', process.env.VOICE_NAME || DEFAULT_VOICE_NAME);
  const accentLocale = getArgValue('accent-locale', process.env.ACCENT_LOCALE || DEFAULT_ACCENT_LOCALE);
  const version = getArgValue('version', process.env.VERSION || DEFAULT_VERSION);
  const useRealtime = hasArg('realtime');
  const useDirectAzure = hasArg('direct-azure');
  const batchOnly = hasArg('batch-only');
  const concurrencyArgProvided = hasArgValue('concurrency');
  const delayArgProvided = hasArgValue('delay-ms');
  const concurrency = Number(getArgValue('concurrency', process.env.CONCURRENCY || '1')) || 1;
  const maxRows = Math.max(0, Number(getArgValue('max-rows', process.env.MAX_ROWS || '0')) || 0);
  const requestTimeoutMs = Math.max(0, Number(getArgValue('request-timeout-ms', process.env.REQUEST_TIMEOUT_MS || '45000')) || 0);
  const resultTimeoutMs = Math.max(0, Number(getArgValue('result-timeout-ms', process.env.RESULT_TIMEOUT_MS || '300000')) || 0);
  const batchTimeoutMs = Math.max(0, Number(getArgValue('batch-timeout-ms', process.env.BATCH_TIMEOUT_MS || '1800000')) || 0);
  const pollMs = Math.max(1000, Number(getArgValue('poll-ms', process.env.POLL_MS || '30000')) || 30000);
  const batchSize = Math.max(1, Math.min(1000, Number(getArgValue('batch-size', process.env.BATCH_SIZE || '900')) || 900));
  const tempDir = path.resolve(getArgValue('temp-dir', path.resolve(__dirname, '..', '.tmp', 'vocab-word-batch')));
  const checkpointEvery = Math.max(1, Number(getArgValue('checkpoint-every', process.env.CHECKPOINT_EVERY || '25')) || 25);
  const attempts = Math.max(1, Number(getArgValue('attempts', process.env.ATTEMPTS || '4')) || 4);
  const defaultDelayMs = useRealtime || !batchOnly ? '3500' : '0';
  const delayMs = Math.max(0, Number(getArgValue('delay-ms', process.env.DELAY_MS || defaultDelayMs)) || 0);
  const azureSpeechRegion = getArgValue('azure-region', process.env.AZURE_SPEECH_REGION || '');
  const azureSpeechKey = getArgValue('azure-key', process.env.AZURE_SPEECH_KEY || '');
  const azureTtsOutputFormat = getArgValue('azure-output-format', process.env.AZURE_TTS_OUTPUT_FORMAT || DEFAULT_AZURE_TTS_OUTPUT_FORMAT);
  const dryRun = hasArg('dry-run');
  const continueOnError = hasArg('continue-on-error');
  const stopOnRateLimit = !hasArg('continue-on-rate-limit');
  const keepTemp = hasArg('keep-temp');
  const deleteJobs = hasArg('delete-jobs');
  const failedPath = path.resolve(path.dirname(manifestPath), 'vocab_word_audio_failed.json');
  const manifest = loadExistingManifest(manifestPath);
  const allRows = loadRows(dataPath, level);
  const rows = maxRows ? allRows.slice(0, maxRows) : allRows;

  console.log(`Vocab word rows: ${allRows.length}`);
  console.log(`Rows this run: ${rows.length}${maxRows ? ` of ${allRows.length}` : ''}`);
  console.log(`Levels: ${level}`);
  console.log(`API base: ${apiBase}`);
  console.log(`Voice: ${voiceName} (${accentLocale})`);
  console.log(`Output: ${path.relative(path.resolve(__dirname, '..'), outputDir) || '.'}`);
  console.log(`Manifest: ${path.relative(path.resolve(__dirname, '..'), manifestPath)}`);
  console.log(`Mode: ${useDirectAzure ? 'direct Azure realtime local files' : (useRealtime ? 'realtime fallback' : (batchOnly ? 'batch synthesis only' : 'batch synthesis with realtime fallback'))}`);
  if (useDirectAzure) {
    console.log(`Azure region: ${azureSpeechRegion || '(missing)'}`);
    console.log(`Concurrency: ${concurrency}`);
    if (delayMs) console.log(`Delay after each request: ${delayMs}ms`);
    if (stopOnRateLimit) console.log('Rate limit guard: stop on Azure 429');
  } else if (useRealtime) {
    console.log(`Concurrency: ${concurrency}`);
    if (delayMs) console.log(`Delay after each request: ${delayMs}ms`);
    if (stopOnRateLimit) console.log('Rate limit guard: stop on Azure 429');
  } else {
    console.log(`Batch size: ${batchSize}`);
    console.log(`Poll interval: ${pollMs}ms`);
  }

  if (dryRun) {
    rows.slice(0, 20).forEach((row, index) => {
      console.log(`${index + 1}. ${row.text} [${row.levels.join(', ')}]`);
    });
    return;
  }

  if (useDirectAzure) {
    await runDirectAzureMode(rows, manifest, {
      outputDir,
      manifestPath,
      failedPath,
      locale,
      voiceName,
      accentLocale,
      version,
      requestTimeoutMs,
      attempts,
      concurrency,
      delayMs,
      checkpointEvery,
      stopOnRateLimit,
      continueOnError,
      azureSpeechRegion,
      azureSpeechKey,
      azureTtsOutputFormat
    });
    return;
  }

  if (!useRealtime) {
    await runBatchMode(rows, manifest, {
      apiBase,
      outputDir,
      manifestPath,
      failedPath,
      tempDir,
      locale,
      voiceName,
      accentLocale,
      version,
      level,
      batchSize,
      pollMs,
      batchTimeoutMs,
      requestTimeoutMs,
      resultTimeoutMs,
      continueOnError,
      keepTemp,
      deleteJobs
    }).catch(async error => {
      if (batchOnly || !shouldFallbackToRealtime(error)) throw error;
      console.warn(`[batch] unavailable (${error.status || 'unknown'}): ${error.message || error}`);
      console.warn('[batch] Falling back to realtime Azure synthesis with conservative throttling.');
      const fallbackConcurrency = concurrencyArgProvided ? concurrency : 1;
      const fallbackDelayMs = delayArgProvided ? delayMs : Math.max(delayMs, 3500);
      await runRealtimeMode(rows, manifest, {
        apiBase,
        outputDir,
        manifestPath,
        failedPath,
        locale,
        voiceName,
        accentLocale,
        version,
        requestTimeoutMs,
        attempts,
        concurrency: fallbackConcurrency,
        delayMs: fallbackDelayMs,
        checkpointEvery,
        stopOnRateLimit,
        continueOnError
      });
    });
    return;
  }

  await runRealtimeMode(rows, manifest, {
    apiBase,
    outputDir,
    manifestPath,
    failedPath,
    locale,
    voiceName,
    accentLocale,
    version,
    requestTimeoutMs,
    attempts,
    concurrency,
    delayMs,
    checkpointEvery,
    stopOnRateLimit,
    continueOnError
  });
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
