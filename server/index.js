const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { assessPronunciation } = require('./services/pronunciation');

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'vocab-conqueror-speaking-backend',
    azureConfigured: Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION)
  });
});

app.post('/api/pronunciation-assessment', upload.single('audio'), async (req, res) => {
  try {
    const audioFile = req.file;
    const expectedText = (req.body.expectedText || '').trim();
    const locale = (req.body.locale || 'en-US').trim();
    const referenceId = (req.body.referenceId || '').trim();

    if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
      return res.status(500).json({
        error: 'azure_not_configured',
        message: 'AZURE_SPEECH_KEY or AZURE_SPEECH_REGION is missing.'
      });
    }

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
        message: 'This first backend version expects WAV audio. Convert the recorded blob to mono PCM WAV before upload.',
        receivedMimeType: mime || 'unknown'
      });
    }

    const result = await assessPronunciation({
      audioBuffer: audioFile.buffer,
      expectedText,
      locale,
      referenceId
    });

    res.json(result);
  } catch (error) {
    console.error('[PronunciationAssessment] Failed:', error);
    res.status(500).json({
      error: 'assessment_failed',
      message: error.message || 'Pronunciation assessment failed.'
    });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`[Speaking Backend] Listening on http://localhost:${port}`);
});
