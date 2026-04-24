const express = require('express');
const cors = require('cors');
const logger = require('firebase-functions/logger');
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const { assessPronunciation, synthesizeSpeech } = require('./services/pronunciation');

const azureSpeechKey = defineSecret('AZURE_SPEECH_KEY');
const azureSpeechRegion = defineString('AZURE_SPEECH_REGION', {
  default: 'eastasia'
});

const app = express();
const corsMiddleware = cors({ origin: true });

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
      level
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
