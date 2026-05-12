const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const admin = require('firebase-admin');
const logger = require('firebase-functions/logger');
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const { assessPronunciation, synthesizeSpeech } = require('./services/pronunciation');

if (!admin.apps.length) {
  admin.initializeApp();
}

const azureSpeechKey = defineSecret('AZURE_SPEECH_KEY');
const azureSpeechRegion = defineString('AZURE_SPEECH_REGION', {
  default: 'eastasia'
});
const firebaseStorageBucket = defineString('FIREBASE_STORAGE_BUCKET', {
  default: 'battleship-game-c0909.firebasestorage.app'
});

const app = express();
const corsMiddleware = cors({ origin: true });
const VERB_TABLE_AUDIO_VERSION = 'v1';
const VERB_TABLE_AUDIO_BREAK_MS = 150;
const VERB_TABLE_AUDIO_VOICE = 'en-US-AndrewMultilingualNeural';

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

function getVerbTableAudioSlug(forms) {
  const slug = forms.join('-').replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return slug.slice(0, 72) || 'verb-table-row';
}

function getFirebaseStorageDownloadUrl(bucketName, filePath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
}

async function getExistingFileDownloadUrl(file, filePath) {
  const [metadata] = await file.getMetadata();
  let token = metadata?.metadata?.firebaseStorageDownloadTokens || '';
  if (!token) {
    token = crypto.randomUUID();
    await file.setMetadata({
      metadata: {
        ...(metadata.metadata || {}),
        firebaseStorageDownloadTokens: token
      }
    });
  }
  return getFirebaseStorageDownloadUrl(file.bucket.name, filePath, token);
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
    const bucket = admin.storage().bucket(firebaseStorageBucket.value());
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

    const downloadToken = crypto.randomUUID();
    await file.save(audioBuffer, {
      resumable: false,
      metadata: {
        contentType: 'audio/mpeg',
        cacheControl: 'public,max-age=31536000,immutable',
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
          cacheKey,
          forms: forms.join('|'),
          voiceName,
          accentLocale,
          breakMs: String(breakMs)
        }
      }
    });

    const audioUrl = getFirebaseStorageDownloadUrl(bucket.name, filePath, downloadToken);
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

exports.speakingApi = onRequest(
  {
    region: 'asia-east2',
    cors: true,
    timeoutSeconds: 60,
    memory: '512MiB',
    secrets: [azureSpeechKey]
  },
  app
);
