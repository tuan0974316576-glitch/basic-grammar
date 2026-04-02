const express = require('express');
const cors = require('cors');
const multer = require('multer');
const logger = require('firebase-functions/logger');
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const { assessPronunciation } = require('./services/pronunciation');

const azureSpeechKey = defineSecret('AZURE_SPEECH_KEY');
const azureSpeechRegion = defineString('AZURE_SPEECH_REGION', {
  default: 'eastasia'
});

const app = express();
const corsMiddleware = cors({ origin: true });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});

app.use(corsMiddleware);
app.options('*', corsMiddleware);
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'vocab-conqueror-speaking-firebase-functions',
    azureConfigured: true,
    region: azureSpeechRegion.value()
  });
});

app.post('/api/pronunciation-assessment', upload.single('audio'), async (req, res) => {
  try {
    const audioFile = req.file;
    const expectedText = (req.body.expectedText || '').trim();
    const locale = (req.body.locale || 'en-US').trim();
    const referenceId = (req.body.referenceId || '').trim();

    if (!audioFile || !audioFile.buffer?.length) {
      return res.status(400).json({
        error: 'missing_audio',
        message: 'Please upload an audio file in the "audio" field.'
      });
    }

    if (!expectedText) {
      return res.status(400).json({
        error: 'missing_expected_text',
        message: 'expectedText is required.'
      });
    }

    const mime = audioFile.mimetype || '';
    const isWav = mime.includes('wav') || mime.includes('wave');

    if (!isWav) {
      return res.status(415).json({
        error: 'unsupported_audio_format',
        message: 'This backend expects WAV audio. Convert the recorded blob to mono PCM WAV before upload.',
        receivedMimeType: mime || 'unknown'
      });
    }

    const result = await assessPronunciation({
      speechKey: azureSpeechKey.value(),
      speechRegion: azureSpeechRegion.value(),
      audioBuffer: audioFile.buffer,
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
