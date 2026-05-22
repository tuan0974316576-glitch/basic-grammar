const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { execFile } = require('node:child_process');

const DEFAULT_DATA_PATH = path.resolve(__dirname, '..', 'vocab_data.js');
const DEFAULT_MANIFEST_PATH = path.resolve(__dirname, '..', 'listening_audio_manifest.js');
const DEFAULT_OUTPUT_DIR = path.resolve(__dirname, '..', 'audio', 'listening');
const DEFAULT_TEMP_DIR = path.resolve(__dirname, '..', '.tmp', 'listening-audio-batch');
const DEFAULT_VERSION = 'v2';
const DEFAULT_LOCALE = 'en-US';
const DEFAULT_OUTPUT_FORMAT = 'audio-16khz-32kbitrate-mono-mp3';
const BATCH_API_VERSION = '2024-04-01';
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

function getArgValue(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = process.argv.find(arg => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function hasArg(name) {
  return process.argv.includes(`--${name}`);
}

function normalizeEndpoint(endpoint, region) {
  const cleanEndpoint = String(endpoint || '').trim().replace(/\/+$/, '');
  if (cleanEndpoint) return cleanEndpoint;
  const cleanRegion = String(region || '').trim();
  if (!cleanRegion) throw new Error('AZURE_SPEECH_ENDPOINT or AZURE_SPEECH_REGION is required.');
  return `https://${cleanRegion}.api.cognitive.microsoft.com`;
}

function execFileAsync(file, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(file, args, {
      maxBuffer: 50 * 1024 * 1024,
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
  return Math.max(1, Math.ceil((timeoutMs || 60000) / 1000));
}

async function requestJson(endpoint, key, method, pathPart, body = null, timeoutMs = 60000) {
  const args = [
    '-sS',
    '-L',
    '--http1.1',
    '--max-time',
    String(getTimeoutSeconds(timeoutMs)),
    '-X',
    method,
    '-H',
    `Ocp-Apim-Subscription-Key: ${key}`,
    '-w',
    '\n__HTTP_STATUS__:%{http_code}',
    `${endpoint}${pathPart}`
  ];

  if (body) {
    args.splice(args.length - 3, 0, '-H', 'Content-Type: application/json', '--data-binary', JSON.stringify(body));
  }

  const { stdout } = await execFileAsync('curl', args);
  const marker = '\n__HTTP_STATUS__:';
  const markerIndex = stdout.lastIndexOf(marker);
  const rawBody = markerIndex >= 0 ? stdout.slice(0, markerIndex) : stdout;
  const status = markerIndex >= 0 ? Number(stdout.slice(markerIndex + marker.length).trim()) : 200;
  let result = null;

  try {
    result = rawBody ? JSON.parse(rawBody) : null;
  } catch (_error) {
    throw new Error(rawBody || `Invalid JSON response with HTTP ${status}.`);
  }

  if (status < 200 || status >= 300) {
    const error = new Error(result?.error?.message || result?.message || `HTTP ${status}`);
    error.status = status;
    error.azure = result;
    throw error;
  }

  return { status, body: result };
}

async function downloadFile(url, destination, timeoutMs = 300000) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
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
  const stats = fs.statSync(destination);
  if (!stats.size) throw new Error(`Downloaded empty file: ${destination}`);
}

async function unzip(zipPath, extractDir) {
  fs.rmSync(extractDir, { recursive: true, force: true });
  fs.mkdirSync(extractDir, { recursive: true });
  await execFileAsync('unzip', ['-q', zipPath, '-d', extractDir]);
}

function findFilesByExtension(root, extension) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...findFilesByExtension(fullPath, extension));
    if (entry.isFile() && entry.name.toLowerCase().endsWith(extension)) files.push(fullPath);
  }
  return files;
}

function loadVocabDb(dataPath) {
  const context = { globalThis: {} };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(dataPath, 'utf8') + '\nglobalThis.__db = VOCAB_DB;',
    context,
    { filename: dataPath }
  );
  return context.globalThis.__db;
}

function loadExistingManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) return {};
  const source = fs.readFileSync(manifestPath, 'utf8');
  const match = source.match(/window\.LISTENING_AUDIO_MANIFEST\s*=\s*(\{[\s\S]*\})\s*;/);
  if (!match) return {};
  return JSON.parse(match[1]);
}

function writeManifest(manifest, manifestPath) {
  fs.writeFileSync(
    manifestPath,
    `window.LISTENING_AUDIO_MANIFEST = ${JSON.stringify(manifest, null, 2)};\n`,
    'utf8'
  );
}

function getListeningManifestKey(row) {
  return [
    row.level,
    DEFAULT_LOCALE,
    `${row.voice.voiceName}::${row.voice.accentLocale}`,
    row.text
  ].join('|');
}

function isCurrentListeningManifestAudioUrl(url, version) {
  return typeof url === 'string' && url.includes(`/${version}/`);
}

function getListeningRate(level) {
  const rates = {
    L1: '-12%',
    L2: '-10%',
    L3: '-8%',
    L4: '-6%',
    L5: '-4%',
    'L5*': '-4%',
    L5_STAR: '-4%'
  };
  return rates[level] || '0%';
}

function getHash(value) {
  return crypto.createHash('sha1').update(value).digest('hex').slice(0, 16);
}

function getSlug(text) {
  const slug = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.slice(0, 72) || 'audio';
}

function escapeSsmlText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSsml(row) {
  const escapedText = escapeSsmlText(row.text);
  const speechBody = row.voice.accentLocale === DEFAULT_LOCALE
    ? escapedText
    : `<lang xml:lang="${row.voice.accentLocale}">${escapedText}</lang>`;
  return `<speak version="1.0" xml:lang="${DEFAULT_LOCALE}"><voice name="${row.voice.voiceName}"><prosody rate="${getListeningRate(row.level)}" volume="+20%">${speechBody}</prosody></voice></speak>`;
}

function getLocalAudioPath(row, outputDir, version) {
  const levelDir = row.level.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
  const fileName = `${getSlug(row.word)}-${getHash(getListeningManifestKey(row))}.mp3`;
  return path.join(outputDir, levelDir, version, fileName);
}

function toWebPath(filePath) {
  return path.relative(path.resolve(__dirname, '..'), filePath).split(path.sep).join('/');
}

function loadRows(dataPath, level) {
  const db = loadVocabDb(dataPath);
  const words = db[level] || [];
  const rows = [];

  words.forEach((word, wordIndex) => {
    const sentences = Array.isArray(word.sents) ? word.sents : [];
    sentences.forEach((sentence, sentenceIndex) => {
      const text = String(sentence?.text || '').trim();
      if (!text) return;
      const voice = LISTENING_VOICES[((wordIndex * 3) + sentenceIndex) % LISTENING_VOICES.length];
      rows.push({
        level,
        word: String(word.en || '').trim(),
        sentenceIndex,
        text,
        voice
      });
    });
  });

  return rows;
}

function buildJobId(level, chunkIndex, rows) {
  return `listen-${level.toLowerCase()}-${chunkIndex + 1}-${getHash(rows.map(row => getListeningManifestKey(row)).join('|'))}`;
}

function getBatchStatus(result) {
  return result?.status || result?.properties?.status || '';
}

async function createBatchJob(endpoint, key, rows, level, chunkIndex, options) {
  const jobId = buildJobId(level, chunkIndex, rows);
  const payload = {
    description: `Vocab Conqueror ${level} listening audio ${chunkIndex + 1}`,
    inputKind: 'SSML',
    inputs: rows.map(row => ({ content: buildSsml(row) })),
    properties: {
      outputFormat: options.outputFormat,
      concatenateResult: false,
      wordBoundaryEnabled: false,
      sentenceBoundaryEnabled: false,
      timeToLiveInHours: 48
    }
  };

  const result = await requestJson(
    endpoint,
    key,
    'PUT',
    `/texttospeech/batchsyntheses/${encodeURIComponent(jobId)}?api-version=${BATCH_API_VERSION}`,
    payload,
    options.requestTimeoutMs
  );

  return { jobId, azure: result.body };
}

async function waitForBatchJob(endpoint, key, jobId, options) {
  const timeoutAt = Date.now() + options.batchTimeoutMs;

  while (Date.now() < timeoutAt) {
    const result = await requestJson(
      endpoint,
      key,
      'GET',
      `/texttospeech/batchsyntheses/${encodeURIComponent(jobId)}?api-version=${BATCH_API_VERSION}`,
      null,
      options.requestTimeoutMs
    );
    const status = getBatchStatus(result.body);
    console.log(`[batch ${jobId}] status=${status || 'unknown'}`);

    if (/Succeeded/i.test(status)) return result.body;
    if (/Failed/i.test(status)) {
      const error = new Error(`Azure batch synthesis failed: ${status}`);
      error.azure = result.body;
      throw error;
    }

    await new Promise(resolve => setTimeout(resolve, options.pollMs));
  }

  throw new Error(`Timed out waiting for batch job ${jobId}.`);
}

async function deleteBatchJob(endpoint, key, jobId, options) {
  await execFileAsync('curl', [
    '-sS',
    '--max-time',
    String(getTimeoutSeconds(options.requestTimeoutMs)),
    '-X',
    'DELETE',
    '-H',
    `Ocp-Apim-Subscription-Key: ${key}`,
    `${endpoint}/texttospeech/batchsyntheses/${encodeURIComponent(jobId)}?api-version=${BATCH_API_VERSION}`
  ]);
}

async function importBatchResult(rows, zipPath, extractDir, manifest, options) {
  await unzip(zipPath, extractDir);
  const audioFiles = findFilesByExtension(extractDir, '.mp3')
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b), undefined, { numeric: true }));

  if (audioFiles.length !== rows.length) {
    throw new Error(`Batch result contained ${audioFiles.length} mp3 files for ${rows.length} inputs.`);
  }

  rows.forEach((row, index) => {
    const destination = getLocalAudioPath(row, options.outputDir, options.version);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(audioFiles[index], destination);
    manifest[getListeningManifestKey(row)] = toWebPath(destination);
  });
}

function chunkRows(rows, size) {
  const chunks = [];
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }
  return chunks;
}

async function processChunk(endpoint, key, rows, chunkIndex, totalChunks, manifest, options) {
  const { jobId } = await createBatchJob(endpoint, key, rows, options.level, chunkIndex, options);
  console.log(`[batch ${chunkIndex + 1}/${totalChunks}] job=${jobId} rows=${rows.length}`);
  const status = await waitForBatchJob(endpoint, key, jobId, options);
  const resultUrl = status.outputs?.result || status.properties?.outputs?.result || '';
  if (!resultUrl) throw new Error(`Batch job ${jobId} succeeded without a result URL.`);

  const batchDir = path.join(options.tempDir, jobId);
  const zipPath = path.join(batchDir, `${jobId}.zip`);
  const extractDir = path.join(batchDir, 'extract');
  fs.mkdirSync(batchDir, { recursive: true });
  await downloadFile(resultUrl, zipPath, options.resultTimeoutMs);
  await importBatchResult(rows, zipPath, extractDir, manifest, options);
  writeManifest(manifest, options.manifestPath);
  console.log(`[batch ${chunkIndex + 1}/${totalChunks}] imported ${rows.length} audio files.`);

  if (options.deleteJobs) {
    await deleteBatchJob(endpoint, key, jobId, options).catch(error => {
      console.warn(`[batch ${jobId}] delete skipped: ${error.message || error}`);
    });
  }

  if (!options.keepTemp) fs.rmSync(batchDir, { recursive: true, force: true });
}

async function main() {
  const level = getArgValue('level', process.env.LEVEL || 'L4');
  const dataPath = path.resolve(getArgValue('data', DEFAULT_DATA_PATH));
  const manifestPath = path.resolve(getArgValue('manifest', DEFAULT_MANIFEST_PATH));
  const outputDir = path.resolve(getArgValue('output-dir', DEFAULT_OUTPUT_DIR));
  const tempDir = path.resolve(getArgValue('temp-dir', DEFAULT_TEMP_DIR));
  const version = getArgValue('version', process.env.VERSION || DEFAULT_VERSION);
  const azureKey = getArgValue('azure-key', process.env.AZURE_SPEECH_KEY || '');
  const endpoint = normalizeEndpoint(getArgValue('azure-endpoint', process.env.AZURE_SPEECH_ENDPOINT || ''), getArgValue('azure-region', process.env.AZURE_SPEECH_REGION || ''));
  const outputFormat = getArgValue('output-format', process.env.AZURE_TTS_OUTPUT_FORMAT || DEFAULT_OUTPUT_FORMAT);
  const batchSize = Math.max(1, Math.min(10000, Number(getArgValue('batch-size', process.env.BATCH_SIZE || '500')) || 500));
  const maxRows = Math.max(0, Number(getArgValue('max-rows', process.env.MAX_ROWS || '0')) || 0);
  const pollMs = Math.max(1000, Number(getArgValue('poll-ms', process.env.POLL_MS || '10000')) || 10000);
  const requestTimeoutMs = Math.max(0, Number(getArgValue('request-timeout-ms', process.env.REQUEST_TIMEOUT_MS || '60000')) || 0);
  const resultTimeoutMs = Math.max(0, Number(getArgValue('result-timeout-ms', process.env.RESULT_TIMEOUT_MS || '600000')) || 0);
  const batchTimeoutMs = Math.max(0, Number(getArgValue('batch-timeout-ms', process.env.BATCH_TIMEOUT_MS || '1800000')) || 0);
  const dryRun = hasArg('dry-run');
  const keepTemp = hasArg('keep-temp');
  const deleteJobs = hasArg('delete-jobs');

  if (!azureKey && !dryRun) throw new Error('AZURE_SPEECH_KEY or --azure-key is required.');

  const manifest = loadExistingManifest(manifestPath);
  const allRows = loadRows(dataPath, level);
  const pendingRows = allRows.filter(row => !isCurrentListeningManifestAudioUrl(manifest[getListeningManifestKey(row)], version));
  const rows = maxRows ? pendingRows.slice(0, maxRows) : pendingRows;
  const chunks = chunkRows(rows, batchSize);
  const totalChars = rows.reduce((sum, row) => sum + row.text.length, 0);

  console.log(`Level: ${level}`);
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Listening rows: ${allRows.length}`);
  console.log(`Already in manifest: ${allRows.length - pendingRows.length}`);
  console.log(`Rows to batch: ${rows.length}${maxRows ? ` of ${pendingRows.length}` : ''}`);
  console.log(`Characters to batch: ${totalChars}`);
  console.log(`Batch size: ${batchSize}`);
  console.log(`Chunks: ${chunks.length}`);
  console.log(`Voices: ${LISTENING_VOICES.map(voice => voice.label).join(', ')}`);
  console.log(`Output: ${path.relative(path.resolve(__dirname, '..'), outputDir) || '.'}`);

  if (dryRun) {
    rows.slice(0, 20).forEach((row, index) => {
      console.log(`${index + 1}. ${row.level} ${row.word} S${row.sentenceIndex + 1} ${row.voice.label}: ${row.text}`);
    });
    return;
  }

  if (!rows.length) {
    console.log(`Manifest already contains all ${level} listening audio.`);
    return;
  }

  fs.mkdirSync(tempDir, { recursive: true });
  for (let index = 0; index < chunks.length; index++) {
    await processChunk(endpoint, azureKey, chunks[index], index, chunks.length, manifest, {
      level,
      outputDir,
      tempDir,
      version,
      manifestPath,
      outputFormat,
      pollMs,
      requestTimeoutMs,
      resultTimeoutMs,
      batchTimeoutMs,
      keepTemp,
      deleteJobs
    });
  }

  console.log(`Done. Wrote ${Object.keys(manifest).length} listening audio entries.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
