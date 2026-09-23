const sdk = require("microsoft-cognitiveservices-speech-sdk");

function normalizeWord(wordResult) {
  const assessment = wordResult.PronunciationAssessment || {};
  return {
    word: wordResult.Word || "",
    accuracy: assessment.AccuracyScore ?? null,
    errorType: assessment.ErrorType || null,
    syllables: (wordResult.Syllables || []).map((syllable) => ({
      syllable: syllable.Syllable || "",
      accuracy: syllable.PronunciationAssessment?.AccuracyScore ?? null,
    })),
    phonemes: (wordResult.Phonemes || []).map((phoneme) => ({
      phoneme: phoneme.Phoneme || "",
      accuracy: phoneme.PronunciationAssessment?.AccuracyScore ?? null,
    })),
  };
}

async function assessPronunciation({
  speechKey,
  speechRegion,
  audioBuffer,
  expectedText,
  referenceId = "",
}) {
  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  speechConfig.speechRecognitionLanguage = "en-US";
  speechConfig.outputFormat = sdk.OutputFormat.Detailed;

  const audioConfig = sdk.AudioConfig.fromWavFileInput(audioBuffer);
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  const config = new sdk.PronunciationAssessmentConfig(
    expectedText,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Phoneme,
    true,
  );
  config.phonemeAlphabet = "IPA";
  config.nbestPhonemeCount = 3;
  config.enableProsodyAssessment = true;
  config.applyTo(recognizer);

  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(
      (result) => {
        try {
          const rawJson = result.properties.getProperty(
            sdk.PropertyId.SpeechServiceResponse_JsonResult,
          );
          const parsed = rawJson ? JSON.parse(rawJson) : {};
          const nBest = parsed?.NBest?.[0] || {};
          const assessment = sdk.PronunciationAssessmentResult.fromResult(result);
          resolve({
            recognizedText: result.text || "",
            expectedText,
            referenceId,
            overall: {
              pronunciation: assessment.pronunciationScore ?? null,
              accuracy: assessment.accuracyScore ?? null,
              fluency: assessment.fluencyScore ?? null,
              completeness: assessment.completenessScore ?? null,
              prosody: assessment.prosodyScore ?? null,
            },
            words: (nBest.Words || []).map(normalizeWord),
          });
          recognizer.close();
        } catch (error) {
          recognizer.close();
          reject(error);
        }
      },
      (error) => {
        recognizer.close();
        reject(error);
      },
    );
  });
}

module.exports = { assessPronunciation };
