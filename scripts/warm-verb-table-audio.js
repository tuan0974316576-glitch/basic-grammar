const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const DEFAULT_API_BASE = 'https://asia-east2-battleship-game-c0909.cloudfunctions.net/speakingApi';
const DEFAULT_MANIFEST_PATH = path.resolve(__dirname, '..', 'grammar_verb_table_audio_manifest.js');
const DEFAULT_DATA_PATH = path.resolve(__dirname, '..', 'grammar_verb_table_data.js');
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

async function main() {
  const apiBase = (getArgValue('api-base', process.env.SPEAKING_API_BASE || DEFAULT_API_BASE)).replace(/\/$/, '');
  const concurrency = Number(getArgValue('concurrency', process.env.CONCURRENCY || '3')) || 3;
  const manifestPath = path.resolve(getArgValue('manifest', DEFAULT_MANIFEST_PATH));
  const dryRun = hasArg('dry-run');
  const rows = loadVerbRows();

  if (!rows.length) {
    throw new Error('No verb rows found.');
  }

  console.log(`Verb rows: ${rows.length}`);
  console.log(`API base: ${apiBase}`);
  console.log(`Gap: ${AUDIO_BREAK_MS}ms`);
  console.log(`Voice: ${AUDIO_VOICE}`);

  if (dryRun) {
    rows.slice(0, 5).forEach((row, index) => console.log(`${index + 1}. ${getAudioKey(row)}`));
    return;
  }

  const entries = await runPool(rows, concurrency, (row, index) => warmOne(apiBase, row, index, rows.length));
  writeManifest(entries, manifestPath);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
