const assert = require("assert");

global.VOCAB_WORD_AUDIO_MANIFEST = {
  "en-US|en-US-AndrewMultilingualNeural::en-US|affluent": "audio/vocab_words/v1/affluent-e9a686a3d67e6576.mp3",
  "en-US|en-US-AndrewMultilingualNeural::en-US|take for granted": "audio/vocab_words/v1/take-for-granted-test.mp3"
};

delete require.cache[require.resolve("../vocab_audio.js")];
const vocabAudio = require("../vocab_audio.js");

assert.strictEqual(vocabAudio.normalizeWord("  Take   for  Granted "), "take for granted");
assert.strictEqual(vocabAudio.hasStaticAudio("Affluent"), true);
assert.strictEqual(vocabAudio.hasStaticAudio("unknown-word"), false);
assert.strictEqual(
  vocabAudio.getStaticAudioUrl("take for granted"),
  "audio/vocab_words/v1/take-for-granted-test.mp3"
);

const mp3Url = vocabAudio._private.getTranscodedMp3Url(
  "https://upload.wikimedia.org/wikipedia/commons/c/c5/En-uk-hello-1.ogg"
);
assert.strictEqual(
  mp3Url,
  "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c5/En-uk-hello-1.ogg/En-uk-hello-1.ogg.mp3"
);

const candidate = vocabAudio._private.chooseAudioCandidate([
  {
    title: "File:Something unrelated.jpg",
    imageinfo: [{ mime: "image/jpeg", url: "https://example.test/nope.jpg", extmetadata: {} }]
  },
  {
    title: "File:En-us-hello.ogg",
    imageinfo: [{
      mime: "application/ogg",
      url: "https://upload.wikimedia.org/wikipedia/commons/example/En-us-hello.ogg",
      extmetadata: {
        Categories: { value: "American English pronunciation|Hello" }
      }
    }]
  }
], "hello");

assert.strictEqual(candidate.page.title, "File:En-us-hello.ogg");

delete global.VOCAB_WORD_AUDIO_MANIFEST;

console.log("vocab_audio tests passed");
