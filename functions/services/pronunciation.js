const sdk = require('microsoft-cognitiveservices-speech-sdk');

function getJsonResult(recognitionResult) {
  return recognitionResult.properties.getProperty(
    sdk.PropertyId.SpeechServiceResponse_JsonResult
  );
}

function normalizeWord(wordResult) {
  const pa = wordResult.PronunciationAssessment || {};
  return {
    word: wordResult.Word || '',
    accuracy: pa.AccuracyScore ?? null,
    errorType: pa.ErrorType || null,
    syllables: (wordResult.Syllables || []).map((syllable) => ({
      syllable: syllable.Syllable || '',
      accuracy: syllable.PronunciationAssessment?.AccuracyScore ?? null
    })),
    phonemes: (wordResult.Phonemes || []).map((phoneme) => ({
      phoneme: phoneme.Phoneme || '',
      accuracy: phoneme.PronunciationAssessment?.AccuracyScore ?? null,
      nBestPhonemes: phoneme.NBestPhonemes || []
    }))
  };
}

function normalizeAssessmentResponse(recognitionResult, rawJson, expectedText, locale, referenceId) {
  const pronunciationResult = sdk.PronunciationAssessmentResult.fromResult(recognitionResult);
  const parsedJson = rawJson ? JSON.parse(rawJson) : {};
  const nBest = parsedJson?.NBest?.[0] || {};
  const words = Array.isArray(nBest.Words) ? nBest.Words.map(normalizeWord) : [];

  return {
    ok: true,
    locale,
    referenceId,
    expectedText,
    recognizedText: recognitionResult.text || '',
    overall: {
      pronunciation: pronunciationResult.pronunciationScore ?? null,
      accuracy: pronunciationResult.accuracyScore ?? null,
      fluency: pronunciationResult.fluencyScore ?? null,
      completeness: pronunciationResult.completenessScore ?? null,
      prosody: pronunciationResult.prosodyScore ?? null
    },
    words,
    raw: {
      recognitionStatus: parsedJson.RecognitionStatus || null,
      displayText: nBest.Display || recognitionResult.text || ''
    }
  };
}

async function assessPronunciation({
  speechKey,
  speechRegion,
  audioBuffer,
  expectedText,
  locale = 'en-US',
  referenceId = ''
}) {
  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);

  speechConfig.speechRecognitionLanguage = locale;
  speechConfig.outputFormat = sdk.OutputFormat.Detailed;

  const audioConfig = sdk.AudioConfig.fromWavFileInput(audioBuffer);
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

  const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
    expectedText,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Phoneme,
    true
  );

  pronunciationConfig.phonemeAlphabet = 'IPA';
  pronunciationConfig.nbestPhonemeCount = 3;
  pronunciationConfig.enableProsodyAssessment = true;
  pronunciationConfig.applyTo(recognizer);

  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(
      (result) => {
        try {
          const rawJson = getJsonResult(result);
          const normalized = normalizeAssessmentResponse(
            result,
            rawJson,
            expectedText,
            locale,
            referenceId
          );
          recognizer.close();
          resolve(normalized);
        } catch (error) {
          recognizer.close();
          reject(error);
        }
      },
      (error) => {
        recognizer.close();
        reject(error);
      }
    );
  });
}

async function synthesizeSpeech({
  speechKey,
  speechRegion,
  text,
  locale = 'en-US',
  mode = 'default',
  level = '',
  voiceName = '',
  accentLocale = ''
}) {
  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  speechConfig.speechSynthesisLanguage = locale;
  speechConfig.speechSynthesisVoiceName = voiceName || (locale === 'en-GB' ? 'en-GB-SoniaNeural' : 'en-US-JennyNeural');
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
  const escapedText = String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  const listeningRateByLevel = {
    L1: '-10%',
    L2: '-8%',
    L3: '-6%',
    L4: '-4%',
    L5: '-2%',
    'L5*': '0%',
    L5_STAR: '0%'
  };
  const isListening = mode === 'listening';
  const rate = isListening ? (listeningRateByLevel[level] || '0%') : '0%';
  const volume = '+10%';
  const langLocale = accentLocale || locale;
  const ssml = [
    `<speak version="1.0" xml:lang="${locale}">`,
    `  <voice name="${speechConfig.speechSynthesisVoiceName}">`,
    `    <prosody rate="${rate}" volume="${volume}"><lang xml:lang="${langLocale}">${escapedText}</lang></prosody>`,
    '  </voice>',
    '</speak>'
  ].join('');

  return new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        try {
          const audioData = result.audioData instanceof ArrayBuffer
            ? Buffer.from(result.audioData)
            : Buffer.from(result.audioData || []);
          synthesizer.close();
          resolve({
            ok: true,
            locale,
            mode,
            level,
            voiceName: speechConfig.speechSynthesisVoiceName,
            accentLocale: langLocale,
            format: 'audio/mpeg',
            audioBase64: audioData.toString('base64')
          });
        } catch (error) {
          synthesizer.close();
          reject(error);
        }
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
}

module.exports = {
  assessPronunciation,
  synthesizeSpeech
};
