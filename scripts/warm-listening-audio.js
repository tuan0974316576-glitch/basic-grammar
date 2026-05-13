const fs = require('node:fs');
const path = require('node:path');

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
    label: 'Seraphina (Australia)',
    voiceName: 'de-DE-SeraphinaMultilingualNeural',
    accentLocale: 'en-AU'
  },
  {
    label: 'Florian (UK)',
    voiceName: 'de-DE-FlorianMultilingualNeural',
    accentLocale: 'en-GB'
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

async function warmOne(apiBase, row, index, total) {
  const response = await fetch(`${apiBase}/api/listening-audio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: row.text,
      level: row.level,
      locale: 'en-US',
      word: row.word,
      sentenceIndex: row.sentenceIndex,
      voiceName: row.voice.voiceName,
      accentLocale: row.voice.accentLocale
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
  console.log(`[${index + 1}/${total}] ${status}: ${row.level} ${row.word} S${row.sentenceIndex + 1} ${row.voice.label}`);
  return [getListeningManifestKey(row), result.audioUrl];
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
    'window.LISTENING_AUDIO_MANIFEST = ',
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
  const level = getArgValue('level', process.env.LEVEL || DEFAULT_LEVEL);
  const dryRun = hasArg('dry-run');
  const rows = loadListeningRows(level);
  const totalChars = rows.reduce((sum, row) => sum + row.text.length, 0);

  if (!rows.length) throw new Error(`No listening rows found for ${level}.`);

  console.log(`Listening rows: ${rows.length}`);
  console.log(`Level: ${level}`);
  console.log(`API base: ${apiBase}`);
  console.log(`Voices: ${LISTENING_VOICES.map(voice => voice.label).join(', ')}`);
  console.log(`Estimated Azure chars: ${totalChars}`);

  if (dryRun) {
    rows.slice(0, 12).forEach((row, index) => {
      console.log(`${index + 1}. ${row.word} S${row.sentenceIndex + 1} ${row.voice.label}: ${row.text}`);
    });
    return;
  }

  const entries = await runPool(rows, concurrency, (row, index) => warmOne(apiBase, row, index, rows.length));
  writeManifest(entries, manifestPath);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
