const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { execFile } = require('node:child_process');

const DEFAULT_API_BASE = 'https://asia-east2-battleship-game-c0909.cloudfunctions.net/speakingApi';
const DEFAULT_MANIFEST_PATH = path.resolve(__dirname, '..', 'grammar_verb_table_audio_manifest.js');
const DEFAULT_DATA_PATH = path.resolve(__dirname, '..', 'grammar_verb_table_data.js');
const DEFAULT_OUTPUT_DIR = path.resolve(__dirname, '..', 'audio', 'verb_table');
const DEFAULT_VERSION = 'v1';
const AUDIO_VOICE = 'en-US-AndrewMultilingualNeural';
const AUDIO_BREAK_MS = 150;

function getArgValue(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = process.argv.find(arg => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function hasArg(name) {
  return process.argv.includes(`--${name}`);
}

function getHash(value) {
  return crypto.createHash('sha1').update(value).digest('hex').slice(0, 16);
}

function getSlug(value) {
  const slug = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.slice(0, 72) || 'verb-table-row';
}

function toRelativeWebPath(filePath) {
  return path.relative(path.resolve(__dirname, '..'), filePath).split(path.sep).join('/');
}

function getLocalAudioPath(forms, outputDir, version) {
  const audioKey = forms.join('|');
  const filename = `${getSlug(forms.join('-'))}-${getHash(`${version}|${audioKey}`)}.mp3`;
  return path.join(outputDir, version, filename);
}

function execFileAsync(file, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(file, args, { maxBuffer: 20 * 1024 * 1024, ...options }, (error, stdout, stderr) => {
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

async function downloadFile(url, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const tempPath = `${destination}.tmp-${process.pid}-${Date.now()}`;
  try {
    await execFileAsync('curl', [
      '-fL',
      '-sS',
      '--http1.1',
      '--max-time',
      '90',
      '-o',
      tempPath,
      url
    ]);
    const stats = fs.statSync(tempPath);
    if (!stats.size) throw new Error('Downloaded audio was empty.');
    fs.renameSync(tempPath, destination);
  } catch (error) {
    if (fs.existsSync(tempPath)) fs.rmSync(tempPath, { force: true });
    throw new Error((error.stderr || error.message || 'curl download failed').trim());
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadFileWithRetry(url, destination, attempts = 4) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await downloadFile(url, destination);
      return;
    } catch (error) {
      lastError = error;
      if (attempt >= attempts) break;
      console.warn(`[retry ${attempt}/${attempts - 1}] ${path.basename(destination)}: ${error.message || error}`);
      await delay(1000 * attempt);
    }
  }
  throw lastError;
}

function loadExistingManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) return {};
  const source = fs.readFileSync(manifestPath, 'utf8');
  const match = source.match(/window\.GRAMMAR_VERB_AUDIO_MANIFEST\s*=\s*(\{[\s\S]*\})\s*;/);
  if (!match) return {};
  return JSON.parse(match[1]);
}

function loadVerbRows() {
  const source = fs.readFileSync(DEFAULT_DATA_PATH, 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: DEFAULT_DATA_PATH });
  return Array.isArray(context.window.GRAMMAR_VERB_BANK)
    ? context.window.GRAMMAR_VERB_BANK
    : [];
}

function getAudioKey(row) {
  return row.slice(1, 5).map(part => String(part || '').trim().toLowerCase()).join('|');
}

async function warmOne(apiBase, row, index, total) {
  const forms = row.slice(1, 5).map(part => String(part || '').trim().toLowerCase());
  const response = await fetch(`${apiBase}/api/verb-table-audio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      forms,
      locale: 'en-US',
      accentLocale: 'en-US',
      voiceName: AUDIO_VOICE,
      breakMs: AUDIO_BREAK_MS
    })
  });

  const rawText = await response.text();
  let result = null;
  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch (_error) {
    throw new Error(rawText || `Invalid JSON for row ${index + 1}`);
  }

  if (!response.ok || !result?.audioUrl) {
    throw new Error((result && (result.message || result.error)) || `Failed row ${index + 1}`);
  }

  const status = result.cached ? 'cached' : 'created';
  console.log(`[${index + 1}/${total}] ${status}: ${forms.join(' ')}`);
  return [forms.join('|'), result.audioUrl];
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

function writeManifest(entries, manifestPath) {
  const manifest = {};
  entries.forEach(([key, url]) => {
    manifest[key] = url;
  });

  const content = [
    'window.GRAMMAR_VERB_AUDIO_MANIFEST = ',
    JSON.stringify(manifest, null, 2),
    ';\n'
  ].join('');

  fs.writeFileSync(manifestPath, content, 'utf8');
  console.log(`Wrote ${Object.keys(manifest).length} audio URLs to ${manifestPath}`);
}

async function localizeOne(row, manifest, options, index, total) {
  const forms = row.slice(1, 5).map(part => String(part || '').trim().toLowerCase());
  const audioKey = forms.join('|');
  const sourceUrl = manifest[audioKey];
  if (!sourceUrl) throw new Error(`Missing manifest URL for ${audioKey}`);

  const localPath = getLocalAudioPath(forms, options.outputDir, options.version);
  const webPath = toRelativeWebPath(localPath);

  if (!fs.existsSync(localPath)) {
    await downloadFileWithRetry(sourceUrl, localPath);
    console.log(`[${index + 1}/${total}] downloaded: ${audioKey}`);
  } else {
    console.log(`[${index + 1}/${total}] local: ${audioKey}`);
  }

  return [audioKey, webPath];
}

async function localizeManifest(rows, manifestPath, outputDir, version, concurrency) {
  const manifest = loadExistingManifest(manifestPath);
  const entries = await runPool(rows, concurrency, (row, index) => localizeOne(row, manifest, {
    outputDir,
    version
  }, index, rows.length));
  writeManifest(entries, manifestPath);
}

async function main() {
  const apiBase = (getArgValue('api-base', process.env.SPEAKING_API_BASE || DEFAULT_API_BASE)).replace(/\/$/, '');
  const concurrency = Number(getArgValue('concurrency', process.env.CONCURRENCY || '3')) || 3;
  const manifestPath = path.resolve(getArgValue('manifest', DEFAULT_MANIFEST_PATH));
  const outputDir = path.resolve(getArgValue('output-dir', DEFAULT_OUTPUT_DIR));
  const version = getArgValue('version', process.env.VERSION || DEFAULT_VERSION);
  const localize = hasArg('localize');
  const dryRun = hasArg('dry-run');
  const rows = loadVerbRows();

  if (!rows.length) {
    throw new Error('No verb rows found.');
  }

  console.log(`Verb rows: ${rows.length}`);
  console.log(`API base: ${apiBase}`);
  console.log(`Gap: ${AUDIO_BREAK_MS}ms`);
  console.log(`Voice: ${AUDIO_VOICE}`);
  if (localize) {
    console.log(`Mode: localize existing Firebase audio`);
    console.log(`Output: ${path.relative(path.resolve(__dirname, '..'), outputDir)}`);
  }

  if (dryRun) {
    rows.slice(0, 5).forEach((row, index) => console.log(`${index + 1}. ${getAudioKey(row)}`));
    return;
  }

  if (localize) {
    await localizeManifest(rows, manifestPath, outputDir, version, concurrency);
    return;
  }

  const entries = await runPool(rows, concurrency, (row, index) => warmOne(apiBase, row, index, rows.length));
  writeManifest(entries, manifestPath);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
