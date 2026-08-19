"use strict";

const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 44100;
const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "flutter_app",
  "assets",
  "audio",
  "sfx"
);

const PATTERNS = {
  start: [
    [523.25, 0, 0.07],
    [659.25, 0.08, 0.08],
    [783.99, 0.16, 0.1]
  ],
  step: [
    [659.25, 0, 0.055],
    [880, 0.07, 0.07]
  ],
  click: [
    [587.33, 0, 0.045],
    [783.99, 0.045, 0.045]
  ],
  correct: [
    [783.99, 0, 0.06],
    [987.77, 0.07, 0.07],
    [1318.51, 0.15, 0.09]
  ],
  wrong: [
    [329.63, 0, 0.08],
    [246.94, 0.09, 0.12]
  ],
  next: [
    [587.33, 0, 0.055],
    [739.99, 0.06, 0.055]
  ],
  pronounPlace1: [[523.25, 0, 0.065]],
  pronounPlace2: [[659.25, 0, 0.065]],
  pronounPlace3: [[783.99, 0, 0.07]],
  pronounPlace4: [
    [987.77, 0, 0.08],
    [1174.66, 0.075, 0.07]
  ],
  pronounRowWin: [
    [783.99, 0, 0.07],
    [987.77, 0.08, 0.07],
    [1318.51, 0.16, 0.1],
    [1567.98, 0.28, 0.16]
  ],
  pronounGrandWin: [
    [523.25, 0, 0.08],
    [659.25, 0.08, 0.08],
    [783.99, 0.16, 0.08],
    [1046.5, 0.24, 0.1],
    [1318.51, 0.36, 0.12],
    [1567.98, 0.5, 0.18],
    [2093, 0.7, 0.22]
  ],
  complete: [
    [523.25, 0, 0.07],
    [659.25, 0.08, 0.07],
    [783.99, 0.16, 0.08],
    [1046.5, 0.25, 0.11],
    [1318.51, 0.38, 0.15],
    [1567.98, 0.56, 0.24]
  ]
};

function renderSamples(notes) {
  const endTime = Math.max(...notes.map(([, delay, duration]) => delay + duration));
  const length = Math.ceil((endTime + 0.035) * SAMPLE_RATE);
  const samples = new Float64Array(length);

  for (const [frequency, delay, duration] of notes) {
    const start = Math.floor(delay * SAMPLE_RATE);
    const noteLength = Math.floor(duration * SAMPLE_RATE);
    for (let index = 0; index < noteLength; index += 1) {
      const progress = index / noteLength;
      const attack = Math.min(1, progress / 0.08);
      const release = Math.min(1, (1 - progress) / 0.2);
      const envelope = attack * release;
      const time = index / SAMPLE_RATE;
      const fundamental = Math.sin(2 * Math.PI * frequency * time);
      const overtone = Math.sin(2 * Math.PI * frequency * 2 * time) * 0.14;
      samples[start + index] += (fundamental + overtone) * envelope * 0.48;
    }
  }

  return samples;
}

function writeWav(filePath, samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  samples.forEach((sample, index) => {
    const clipped = Math.max(-1, Math.min(1, sample));
    buffer.writeInt16LE(Math.round(clipped * 32767), 44 + index * 2);
  });
  fs.writeFileSync(filePath, buffer);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
for (const [name, notes] of Object.entries(PATTERNS)) {
  writeWav(path.join(OUTPUT_DIR, `${name}.wav`), renderSamples(notes));
}

console.log(`Generated ${Object.keys(PATTERNS).length} Flutter SFX in ${OUTPUT_DIR}`);
