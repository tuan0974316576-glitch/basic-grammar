const path = require("path");

const MAX_TEACHER_AUDIO_BYTES = 2 * 1024 * 1024;
const MIN_TEACHER_AUDIO_BYTES = 512;
const MAX_BASE64_LENGTH = Math.ceil(MAX_TEACHER_AUDIO_BYTES * 4 / 3) + 8;
const ALLOWED_MP3_CONTENT_TYPES = new Set(["audio/mpeg", "audio/mp3"]);

function hasMpegFrameHeader(buffer, offset = 0) {
  if (offset < 0 || offset + 4 > buffer.length) return false;
  const header = buffer.readUInt32BE(offset);
  const sync = (header >>> 21) === 0x7ff;
  const version = (header >>> 19) & 0x3;
  const layer = (header >>> 17) & 0x3;
  const bitrate = (header >>> 12) & 0xf;
  const sampleRate = (header >>> 10) & 0x3;
  return sync && version !== 1 && layer !== 0 && bitrate !== 0 && bitrate !== 15 && sampleRate !== 3;
}

function hasMp3Signature(buffer) {
  if (buffer.subarray(0, 3).toString("ascii") === "ID3") return true;
  return hasMpegFrameHeader(buffer, 0);
}

function decodeTeacherMp3(audioBase64, contentType) {
  const mime = String(contentType || "").trim().toLowerCase().split(";")[0];
  if (!ALLOWED_MP3_CONTENT_TYPES.has(mime)) {
    throw new Error("Only MP3 audio is accepted.");
  }
  const encoded = String(audioBase64 || "").trim();
  if (!encoded || encoded.length > MAX_BASE64_LENGTH || encoded.length % 4 !== 0 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    throw new Error("Invalid MP3 upload.");
  }
  const buffer = Buffer.from(encoded, "base64");
  if (buffer.length < MIN_TEACHER_AUDIO_BYTES || buffer.length > MAX_TEACHER_AUDIO_BYTES) {
    throw new Error("MP3 must be between 512 bytes and 2 MB.");
  }
  if (!hasMp3Signature(buffer)) {
    throw new Error("The uploaded file is not a valid MP3.");
  }
  return buffer;
}

function safeOriginalFileName(value) {
  return path.basename(String(value || "audio.mp3"))
    .replace(/[^A-Za-z0-9._ ()-]+/g, "_")
    .slice(0, 120) || "audio.mp3";
}

module.exports = {
  MAX_TEACHER_AUDIO_BYTES,
  decodeTeacherMp3,
  hasMpegFrameHeader,
  hasMp3Signature,
  safeOriginalFileName,
};
