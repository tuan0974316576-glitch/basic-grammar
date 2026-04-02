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

async function assessPronunciation({ audioBuffer, expectedText, locale = 'en-US', referenceId = '' }) {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY,
    process.env.AZURE_SPEECH_REGION
  );

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

module.exports = {
  assessPronunciation
};
