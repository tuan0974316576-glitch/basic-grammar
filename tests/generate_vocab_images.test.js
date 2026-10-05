"use strict";

const assert = require("assert");
const test = require("node:test");

const generator = require("../scripts/generate-vocab-images.js");

test("candidate builder returns distinct image-friendly words", () => {
  const candidates = generator.buildCandidates({
    source: "teacher+headwords",
    targetCount: 5000
  });
  assert.equal(candidates.length, 5000);
  assert.equal(new Set(candidates.map((candidate) => candidate.normalizedWord)).size, 5000);
  assert.ok(candidates.every((candidate) => generator.isImageWord(candidate.display)));
  assert.ok(candidates.every((candidate) => !/\s/.test(candidate.display)));
  const algorithm = candidates.find((candidate) => candidate.normalizedWord === "algorithm");
  assert.match(algorithm.meaning, /演算法/);
});

test("prompt uses the fixed Irasutoya template", () => {
  const prompt = generator.buildPrompt({
    display: "apple",
    meaning: "蘋果",
    pos: "noun"
  });
  assert.match(prompt, /apple/);
  assert.match(prompt, /创作 Irasutoya风格 AI 插画表示“apple 蘋果” 透明背景/);
  assert.match(prompt, /透明背景/);
});

test("async API helpers read common task response shapes", () => {
  assert.equal(generator.taskIdFrom({ task_id: "abc" }), "abc");
  assert.equal(generator.taskIdFrom({ data: { id: "def" } }), "def");
  assert.equal(generator.statusFrom({ data: { status: "completed" } }), "completed");
  assert.match(
    generator.firstImageValue({ result: { data: [{ url: "https://example.test/a.png" }] } }),
    /example\.test/
  );
});
