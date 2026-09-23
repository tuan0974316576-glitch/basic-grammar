const assert = require("assert");
const {
  MAX_TEACHER_AUDIO_BYTES,
  decodeTeacherMp3,
  hasMpegFrameHeader,
  safeOriginalFileName,
} = require("./vocab-audio-upload");

const mp3 = Buffer.alloc(1024);
mp3.set([0x49, 0x44, 0x33, 0x04, 0x00, 0x00]);
assert.strictEqual(decodeTeacherMp3(mp3.toString("base64"), "audio/mpeg").length, 1024);

const framedMp3 = Buffer.alloc(1024);
framedMp3.set([0xff, 0xfb, 0x90, 0x64]);
assert.strictEqual(hasMpegFrameHeader(framedMp3), true);
assert.strictEqual(decodeTeacherMp3(framedMp3.toString("base64"), "audio/mp3").length, 1024);

assert.throws(() => decodeTeacherMp3(mp3.toString("base64"), "audio/wav"), /Only MP3/);
assert.throws(() => decodeTeacherMp3(Buffer.alloc(1024).toString("base64"), "audio/mpeg"), /valid MP3/);
assert.throws(() => decodeTeacherMp3(Buffer.alloc(MAX_TEACHER_AUDIO_BYTES + 1).toString("base64"), "audio/mpeg"), /Invalid MP3|2 MB/);
assert.strictEqual(safeOriginalFileName("../../bald (final).mp3"), "bald (final).mp3");
assert.strictEqual(safeOriginalFileName("bald<script>.mp3"), "bald_script_.mp3");

console.log("Teacher vocab MP3 upload checks passed.");
