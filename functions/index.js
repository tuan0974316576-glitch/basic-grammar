const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const admin = require('firebase-admin');
const logger = require('firebase-functions/logger');
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { assessPronunciation, synthesizeSpeech } = require('./services/pronunciation');

if (!admin.apps.length) {
  admin.initializeApp();
}

const azureSpeechKey = defineSecret('AZURE_SPEECH_KEY');
const azureSpeechRegion = defineSecret('AZURE_SPEECH_REGION');

const app = express();
const corsMiddleware = cors({ origin: true });
const VERB_TABLE_AUDIO_VERSION = 'v1';
const VERB_TABLE_AUDIO_BREAK_MS = 150;
const VERB_TABLE_AUDIO_VOICE = 'en-US-AndrewMultilingualNeural';
const LISTENING_AUDIO_VERSION = 'v2';
const BATCH_SYNTHESIS_API_VERSION = '2024-04-01';
const BATCH_SYNTHESIS_MAX_INPUTS = 1000;
const BATCH_SYNTHESIS_OUTPUT_FORMAT = 'audio-16khz-32kbitrate-mono-mp3';
const VERB_TABLE_AUDIO_BUCKET_FALLBACKS = [
  'battleship-game-c0909-verb-audio',
  'battleship-game-c0909.firebasestorage.app',
  'battleship-game-c0909.appspot.com'
];

app.use(corsMiddleware);
app.options('*', corsMiddleware);
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(express.json({ limit: '12mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'vocab-conqueror-speaking-firebase-functions',
    azureConfigured: true,
    region: azureSpeechRegion.value()
  });
});

app.post('/api/pronunciation-assessment', async (req, res) => {
  try {
    const expectedText = (req.body.expectedText || '').trim();
    const locale = (req.body.locale || 'en-US').trim();
    const referenceId = (req.body.referenceId || '').trim();
    const mimeType = (req.body.mimeType || '').trim();
    const audioBase64 = (req.body.audioBase64 || '').trim();

    if (!audioBase64) {
      return res.status(400).json({
        error: 'missing_audio',
        message: 'audioBase64 is required.'
      });
    }

    if (!expectedText) {
      return res.status(400).json({
        error: 'missing_expected_text',
        message: 'expectedText is required.'
      });
    }

    if (mimeType && !mimeType.includes('wav') && !mimeType.includes('wave')) {
      return res.status(415).json({
        error: 'unsupported_audio_format',
        message: 'This backend expects WAV audio. Convert the recorded blob to mono PCM WAV before upload.',
        receivedMimeType: mimeType || 'unknown'
      });
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    if (!audioBuffer.length) {
      return res.status(400).json({
        error: 'invalid_audio',
        message: 'The provided audioBase64 could not be decoded.'
      });
    }

    const result = await assessPronunciation({
      speechKey: azureSpeechKey.value(),
      speechRegion: azureSpeechRegion.value(),
      audioBuffer,
      expectedText,
      locale,
      referenceId
    });

    res.json(result);
  } catch (error) {
    logger.error('[PronunciationAssessment] Failed', error);
    res.status(500).json({
      error: 'assessment_failed',
      message: error.message || 'Pronunciation assessment failed.'
    });
  }
});

app.post('/api/speak-text', async (req, res) => {
  try {
    const text = (req.body.text || '').trim();
    const locale = (req.body.locale || 'en-US').trim();
    const mode = (req.body.mode || 'default').trim();
    const level = (req.body.level || '').trim();
    const voiceName = (req.body.voiceName || '').trim();
    const accentLocale = (req.body.accentLocale || '').trim();

    if (!text) {
      return res.status(400).json({
        error: 'missing_text',
        message: 'text is required.'
      });
    }

    const result = await synthesizeSpeech({
      speechKey: azureSpeechKey.value(),
      speechRegion: azureSpeechRegion.value(),
      text,
      locale,
      mode,
      level,
      voiceName,
      accentLocale
    });

    res.json(result);
  } catch (error) {
    logger.error('[SpeechSynthesis] Failed', error);
    res.status(500).json({
      error: 'tts_failed',
      message: error.message || 'Speech synthesis failed.'
    });
  }
});

app.get('/api/audio-proxy', async (req, res) => {
  try {
    const rawUrl = String(req.query.url || '').trim();
    if (!rawUrl) {
      return res.status(400).json({
        error: 'missing_url',
        message: 'url is required.'
      });
    }

    let audioUrl;
    try {
      audioUrl = new URL(rawUrl);
    } catch (_error) {
      return res.status(400).json({
        error: 'invalid_url',
        message: 'url must be a valid URL.'
      });
    }

    const pathParts = audioUrl.pathname.split('/').filter(Boolean);
    const bucketName = pathParts[0] || '';
    const objectPath = pathParts.slice(1).join('/');
    const allowedBuckets = getStorageBucketCandidates();
    const allowedObject = objectPath.startsWith('tts/listening/');

    if (
      audioUrl.protocol !== 'https:' ||
      audioUrl.hostname !== 'storage.googleapis.com' ||
      !allowedBuckets.includes(bucketName) ||
      !allowedObject
    ) {
      return res.status(403).json({
        error: 'unsupported_url',
        message: 'Only this app audio bucket can be proxied.'
      });
    }

    const upstream = await fetch(audioUrl);
    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: 'audio_fetch_failed',
        message: `Audio fetch failed with status ${upstream.status}.`
      });
    }

    const contentType = upstream.headers.get('content-type') || 'audio/mpeg';
    const audioBuffer = Buffer.from(await upstream.arrayBuffer());
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public,max-age=31536000,immutable',
      'Content-Type': contentType,
      'Content-Length': String(audioBuffer.length)
    });
    res.send(audioBuffer);
  } catch (error) {
    logger.error('[AudioProxy] Failed', error);
    res.status(500).json({
      error: 'audio_proxy_failed',
      message: error.message || 'Audio proxy failed.'
    });
  }
});

function normalizeVerbTableForms(value) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 4)
    .map(part => String(part || '').trim().toLowerCase())
    .filter(Boolean);
}

function getVerbTableAudioHash(cacheKey) {
  return crypto.createHash('sha1').update(cacheKey).digest('hex').slice(0, 16);
}

function getAudioHash(cacheKey) {
  return crypto.createHash('sha1').update(cacheKey).digest('hex').slice(0, 16);
}

function getVerbTableAudioSlug(forms) {
  const slug = forms.join('-').replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return slug.slice(0, 72) || 'verb-table-row';
}

function getAudioSlug(text, fallback = 'audio') {
  const slug = String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug.slice(0, 72) || fallback;
}

function getPublicStorageUrl(bucketName, filePath) {
  const encodedPath = filePath.split('/').map(part => encodeURIComponent(part)).join('/');
  return `https://storage.googleapis.com/${bucketName}/${encodedPath}`;
}

function getStorageBucketCandidates() {
  let configuredBucket = '';
  try {
    configuredBucket = JSON.parse(process.env.FIREBASE_CONFIG || '{}')?.storageBucket || '';
  } catch (_error) {
    configuredBucket = '';
  }
  return [...new Set([configuredBucket, ...VERB_TABLE_AUDIO_BUCKET_FALLBACKS].filter(Boolean))];
}

async function getAudioStorageBucket() {
  const candidates = getStorageBucketCandidates();
  let lastError = null;

  for (const bucketName of candidates) {
    const bucket = admin.storage().bucket(bucketName);
    try {
      await bucket.getMetadata();
      return bucket;
    } catch (error) {
      lastError = error;
      const code = error?.code || error?.statusCode || error?.errors?.[0]?.reason;
      if (code !== 404 && code !== 'notFound') {
        throw error;
      }
    }
  }

  throw new Error(
    `No Firebase Storage bucket found. Tried: ${candidates.join(', ')}. ${lastError?.message || ''}`.trim()
  );
}

async function getVerbTableStorageBucket() {
  return getAudioStorageBucket();
}

async function getExistingFileDownloadUrl(file, filePath) {
  await file.makePublic();
  return getPublicStorageUrl(file.bucket.name, filePath);
}

function normalizeBatchJobId(value, fallbackSeed = '') {
  const clean = String(value || '')
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '')
    .slice(0, 64);

  if (/^[A-Za-z0-9][A-Za-z0-9._-]{1,62}[A-Za-z0-9]$/.test(clean)) return clean;

  const hash = getAudioHash(`${Date.now()}|${fallbackSeed}`);
  return `vocab-${hash}`;
}

function validateBatchJobId(jobId) {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{1,62}[A-Za-z0-9]$/.test(jobId || '');
}

function normalizeBatchTexts(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const rows = [];

  for (const item of value) {
    const text = String(typeof item === 'string' ? item : (item?.text || item?.content || '')).trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(text);
    if (rows.length >= BATCH_SYNTHESIS_MAX_INPUTS) break;
  }

  return rows;
}

function escapeSsmlText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildBatchWordSsml(text, locale, voiceName, accentLocale) {
  const langLocale = accentLocale || locale;
  return [
    `<speak version="1.0" xml:lang="${locale}">`,
    `  <voice name="${voiceName}">`,
    `    <prosody rate="0%" volume="+20%"><lang xml:lang="${langLocale}">${escapeSsmlText(text)}</lang></prosody>`,
    '  </voice>',
    '</speak>'
  ].join('');
}

function shouldUsePlainTextVocabBatch(reqBody, locale, accentLocale) {
  if (reqBody.forceSsml) return false;
  if (String(reqBody.inputKind || '').trim().toLowerCase() === 'ssml') return false;
  return !accentLocale || accentLocale === locale;
}

function getBatchSynthesisUrl(region, jobId = '') {
  const safeRegion = String(region || '').trim();
  const path = jobId ? `/${encodeURIComponent(jobId)}` : '';
  return `https://${safeRegion}.api.cognitive.microsoft.com/texttospeech/batchsyntheses${path}?api-version=${BATCH_SYNTHESIS_API_VERSION}`;
}

async function callAzureBatchSynthesis(method, jobId = '', body = null) {
  const speechKey = azureSpeechKey.value();
  const speechRegion = azureSpeechRegion.value();
  const headers = {
    'Ocp-Apim-Subscription-Key': speechKey
  };
  const options = { method, headers };

  if (body) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(getBatchSynthesisUrl(speechRegion, jobId), options);
  const rawText = await response.text();
  let result = null;

  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch (_error) {
    result = rawText || null;
  }

  if (!response.ok) {
    const message = typeof result === 'object'
      ? (result?.error?.message || result?.message || `Azure batch synthesis HTTP ${response.status}`)
      : (result || `Azure batch synthesis HTTP ${response.status}`);
    const error = new Error(message);
    error.status = response.status;
    error.retryAfter = response.headers.get('retry-after') || '';
    error.azure = result;
    throw error;
  }

  return {
    statusCode: response.status,
    retryAfter: response.headers.get('retry-after') || '',
    body: result
  };
}

function getBatchUnavailableHint(error) {
  const status = Number(error?.status || 0);
  const code = String(error?.azure?.error?.code || error?.azure?.code || '').trim();
  const payload = JSON.stringify(error?.azure || {});
  const message = String(error?.message || '');
  if (
    status === 401
    || status === 403
    || code === '401'
    || code === '403'
    || /invalid subscription key|wrong API endpoint|access denied/i.test(`${message} ${payload}`)
  ) {
    return 'Azure accepted this Speech key for realtime TTS, but rejected the Batch Synthesis REST endpoint. Check that the Azure resource, region, and pricing tier support Batch Synthesis, or use the realtime warming fallback.';
  }
  return '';
}

app.post('/api/verb-table-audio', async (req, res) => {
  try {
    const forms = normalizeVerbTableForms(req.body.forms);
    const locale = (req.body.locale || 'en-US').trim();
    const accentLocale = (req.body.accentLocale || locale).trim();
    const voiceName = (req.body.voiceName || VERB_TABLE_AUDIO_VOICE).trim();
    const breakMs = Math.max(0, Math.min(1200, Number(req.body.breakMs) || VERB_TABLE_AUDIO_BREAK_MS));

    if (forms.length !== 4) {
      return res.status(400).json({
        error: 'invalid_forms',
        message: 'forms must contain present, past, pp, and ing.'
      });
    }

    const cacheKey = [
      VERB_TABLE_AUDIO_VERSION,
      locale,
      accentLocale,
      voiceName,
      breakMs,
      ...forms
    ].join('|');
    const filePath = [
      'tts',
      'verb-table',
      VERB_TABLE_AUDIO_VERSION,
      `${getVerbTableAudioSlug(forms)}-${getVerbTableAudioHash(cacheKey)}.mp3`
    ].join('/');
    const bucket = await getVerbTableStorageBucket();
    const file = bucket.file(filePath);
    const [exists] = await file.exists();

    if (exists) {
      const audioUrl = await getExistingFileDownloadUrl(file, filePath);
      return res.json({
        ok: true,
        cached: true,
        audioUrl,
        storagePath: filePath,
        forms,
        format: 'audio/mpeg',
        voiceName,
        accentLocale,
        breakMs
      });
    }

    const result = await synthesizeSpeech({
      speechKey: azureSpeechKey.value(),
      speechRegion: azureSpeechRegion.value(),
      text: forms.join(' '),
      segments: forms,
      breakMs,
      locale,
      mode: 'verb-table',
      voiceName,
      accentLocale
    });

    const audioBuffer = Buffer.from(result.audioBase64 || '', 'base64');
    if (!audioBuffer.length) {
      throw new Error('Azure returned empty audio.');
    }

    await file.save(audioBuffer, {
      resumable: false,
      metadata: {
        contentType: 'audio/mpeg',
        cacheControl: 'public,max-age=31536000,immutable',
        metadata: {
          cacheKey,
          forms: forms.join('|'),
          voiceName,
          accentLocale,
          breakMs: String(breakMs)
        }
      }
    });
    await file.makePublic();

    const audioUrl = getPublicStorageUrl(bucket.name, filePath);
    res.json({
      ok: true,
      cached: false,
      audioUrl,
      storagePath: filePath,
      forms,
      format: 'audio/mpeg',
      voiceName,
      accentLocale,
      breakMs
    });
  } catch (error) {
    logger.error('[VerbTableAudio] Failed', error);
    res.status(500).json({
      error: 'verb_table_tts_failed',
      message: error.message || 'Verb table audio generation failed.'
    });
  }
});

app.post('/api/listening-audio', async (req, res) => {
  try {
    const text = String(req.body.text || '').trim();
    const locale = (req.body.locale || 'en-US').trim();
    const level = (req.body.level || 'L1').trim();
    const sentenceIndex = Number.isInteger(req.body.sentenceIndex) ? req.body.sentenceIndex : null;
    const word = String(req.body.word || '').trim();
    const accentLocale = (req.body.accentLocale || locale).trim();
    const voiceName = String(req.body.voiceName || '').trim();

    if (!text) {
      return res.status(400).json({
        error: 'missing_text',
        message: 'text is required.'
      });
    }

    if (!voiceName) {
      return res.status(400).json({
        error: 'missing_voice',
        message: 'voiceName is required for listening audio.'
      });
    }

    const cacheKey = [
      LISTENING_AUDIO_VERSION,
      level,
      locale,
      accentLocale,
      voiceName,
      text
    ].join('|');
    const filePath = [
      'tts',
      'listening',
      level.toLowerCase(),
      LISTENING_AUDIO_VERSION,
      `${getAudioSlug(word || text, 'listening')}-${getAudioHash(cacheKey)}.mp3`
    ].join('/');
    const bucket = await getAudioStorageBucket();
    const file = bucket.file(filePath);
    const [exists] = await file.exists();

    if (exists) {
      const audioUrl = await getExistingFileDownloadUrl(file, filePath);
      return res.json({
        ok: true,
        cached: true,
        audioUrl,
        storagePath: filePath,
        text,
        word,
        level,
        sentenceIndex,
        format: 'audio/mpeg',
        voiceName,
        accentLocale
      });
    }

    const synthesisMode = level.toUpperCase() === 'VOCAB' ? 'vocab-word' : 'listening';
    const result = await synthesizeSpeech({
      speechKey: azureSpeechKey.value(),
      speechRegion: azureSpeechRegion.value(),
      text,
      locale,
      mode: synthesisMode,
      level,
      voiceName,
      accentLocale
    });

    const audioBuffer = Buffer.from(result.audioBase64 || '', 'base64');
    if (!audioBuffer.length) {
      throw new Error('Azure returned empty audio.');
    }

    await file.save(audioBuffer, {
      resumable: false,
      metadata: {
        contentType: 'audio/mpeg',
        cacheControl: 'public,max-age=31536000,immutable',
        metadata: {
          cacheKey,
          text,
          word,
          level,
          sentenceIndex: sentenceIndex === null ? '' : String(sentenceIndex),
          voiceName,
          accentLocale
        }
      }
    });
    await file.makePublic();

    const audioUrl = getPublicStorageUrl(bucket.name, filePath);
    res.json({
      ok: true,
      cached: false,
      audioUrl,
      storagePath: filePath,
      text,
      word,
      level,
      sentenceIndex,
      format: 'audio/mpeg',
      voiceName,
      accentLocale
    });
  } catch (error) {
    logger.error('[ListeningAudio] Failed', {
      message: error.message || String(error),
      azure: error.azure || null
    });
    res.status(500).json({
      error: 'listening_tts_failed',
      message: error.message || 'Listening audio generation failed.',
      azure: error.azure || null
    });
  }
});

app.post('/api/vocab-word-batch/create', async (req, res) => {
  try {
    const texts = normalizeBatchTexts(req.body.inputs || req.body.texts);
    const locale = String(req.body.locale || 'en-US').trim();
    const accentLocale = String(req.body.accentLocale || locale).trim();
    const voiceName = String(req.body.voiceName || VERB_TABLE_AUDIO_VOICE).trim();
    const outputFormat = String(req.body.outputFormat || BATCH_SYNTHESIS_OUTPUT_FORMAT).trim();
    const description = String(req.body.description || 'Vocab Conqueror word audio batch').trim().slice(0, 240);
    const jobId = normalizeBatchJobId(req.body.jobId, texts.join('|'));

    if (!texts.length) {
      return res.status(400).json({
        error: 'missing_inputs',
        message: 'inputs must contain at least one text item.'
      });
    }

    if (texts.length > BATCH_SYNTHESIS_MAX_INPUTS) {
      return res.status(400).json({
        error: 'too_many_inputs',
        message: `Batch synthesis accepts at most ${BATCH_SYNTHESIS_MAX_INPUTS} inputs per job.`
      });
    }

    const usePlainText = shouldUsePlainTextVocabBatch(req.body, locale, accentLocale);
    const payload = {
      description,
      inputKind: usePlainText ? 'PlainText' : 'SSML',
      ...(usePlainText ? {
        synthesisConfig: {
          voice: voiceName
        }
      } : {}),
      inputs: texts.map(text => ({
        content: usePlainText ? text : buildBatchWordSsml(text, locale, voiceName, accentLocale)
      })),
      properties: {
        outputFormat,
        concatenateResult: false,
        wordBoundaryEnabled: false,
        sentenceBoundaryEnabled: false,
        timeToLiveInHours: 48
      }
    };

    const result = await callAzureBatchSynthesis('PUT', jobId, payload);
    res.status(result.statusCode === 201 ? 201 : 200).json({
      ok: true,
      jobId,
      inputCount: texts.length,
      locale,
      accentLocale,
      voiceName,
      outputFormat,
      inputKind: payload.inputKind,
      azure: result.body
    });
  } catch (error) {
    logger.error('[VocabWordBatchCreate] Failed', {
      message: error.message || String(error),
      status: error.status || null,
      retryAfter: error.retryAfter || '',
      azure: error.azure || null
    });
    res.status(error.status || 500).json({
      error: 'vocab_word_batch_create_failed',
      message: error.message || 'Batch synthesis create failed.',
      hint: getBatchUnavailableHint(error),
      retryAfter: error.retryAfter || '',
      azure: error.azure || null
    });
  }
});

app.get('/api/vocab-word-batch/status/:jobId', async (req, res) => {
  try {
    const jobId = String(req.params.jobId || '').trim();
    if (!validateBatchJobId(jobId)) {
      return res.status(400).json({
        error: 'invalid_job_id',
        message: 'Invalid batch synthesis job id.'
      });
    }

    const result = await callAzureBatchSynthesis('GET', jobId);
    res.json({
      ok: true,
      jobId,
      retryAfter: result.retryAfter,
      azure: result.body
    });
  } catch (error) {
    logger.error('[VocabWordBatchStatus] Failed', {
      message: error.message || String(error),
      status: error.status || null,
      retryAfter: error.retryAfter || '',
      azure: error.azure || null
    });
    res.status(error.status || 500).json({
      error: 'vocab_word_batch_status_failed',
      message: error.message || 'Batch synthesis status failed.',
      hint: getBatchUnavailableHint(error),
      retryAfter: error.retryAfter || '',
      azure: error.azure || null
    });
  }
});

app.get('/api/vocab-word-batch/result/:jobId', async (req, res) => {
  try {
    const jobId = String(req.params.jobId || '').trim();
    if (!validateBatchJobId(jobId)) {
      return res.status(400).json({
        error: 'invalid_job_id',
        message: 'Invalid batch synthesis job id.'
      });
    }

    const statusResult = await callAzureBatchSynthesis('GET', jobId);
    const azureJob = statusResult.body || {};
    const status = azureJob.status || azureJob.properties?.status || '';
    const resultUrl = azureJob.outputs?.result || azureJob.properties?.outputs?.result || azureJob.resultUrl || '';

    if (!/Succeeded/i.test(status) || !resultUrl) {
      return res.status(409).json({
        error: 'batch_not_ready',
        message: 'Batch synthesis result is not ready.',
        jobId,
        status,
        azure: azureJob
      });
    }

    const response = await fetch(resultUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': azureSpeechKey.value()
      }
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return res.status(response.status).json({
        error: 'batch_result_download_failed',
        message: errorText || `Azure result download failed with HTTP ${response.status}.`,
        jobId
      });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.set('Content-Type', response.headers.get('content-type') || 'application/zip');
    res.set('Content-Disposition', `attachment; filename="${jobId}.zip"`);
    res.send(buffer);
  } catch (error) {
    logger.error('[VocabWordBatchResult] Failed', {
      message: error.message || String(error),
      status: error.status || null,
      retryAfter: error.retryAfter || '',
      azure: error.azure || null
    });
    res.status(error.status || 500).json({
      error: 'vocab_word_batch_result_failed',
      message: error.message || 'Batch synthesis result failed.',
      hint: getBatchUnavailableHint(error),
      retryAfter: error.retryAfter || '',
      azure: error.azure || null
    });
  }
});

app.delete('/api/vocab-word-batch/:jobId', async (req, res) => {
  try {
    const jobId = String(req.params.jobId || '').trim();
    if (!validateBatchJobId(jobId)) {
      return res.status(400).json({
        error: 'invalid_job_id',
        message: 'Invalid batch synthesis job id.'
      });
    }

    const result = await callAzureBatchSynthesis('DELETE', jobId);
    res.json({
      ok: true,
      jobId,
      azure: result.body
    });
  } catch (error) {
    logger.error('[VocabWordBatchDelete] Failed', {
      message: error.message || String(error),
      status: error.status || null,
      retryAfter: error.retryAfter || '',
      azure: error.azure || null
    });
    res.status(error.status || 500).json({
      error: 'vocab_word_batch_delete_failed',
      message: error.message || 'Batch synthesis delete failed.',
      hint: getBatchUnavailableHint(error),
      retryAfter: error.retryAfter || '',
      azure: error.azure || null
    });
  }
});

exports.speakingApi = onRequest(
  {
    region: 'asia-east2',
    cors: true,
    timeoutSeconds: 300,
    memory: '1GiB',
    secrets: [azureSpeechKey, azureSpeechRegion]
  },
  app
);
