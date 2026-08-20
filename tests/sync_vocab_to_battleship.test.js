"use strict";

const assert = require("assert");
const { SHARED_VOCAB_FILES } = require("../scripts/sync-vocab-to-battleship.js");

assert(SHARED_VOCAB_FILES.includes("vocab_lookup.js"));
assert(SHARED_VOCAB_FILES.includes("vocab_word_audio_manifest.js"));
assert(
  !SHARED_VOCAB_FILES.includes("vocab_audio.js"),
  "App-specific audio playback runtimes must not be copied between projects."
);

console.log("sync vocab to Battleship tests passed");
