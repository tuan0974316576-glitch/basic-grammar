#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_MANIFEST = path.join(
  ROOT_DIR,
  "private_exports",
  "vocab_image_generation",
  "manifest.json"
);
const DEFAULT_OUTPUT_DIR = path.join(
  ROOT_DIR,
  "private_exports",
  "vocab_image_generation",
  "images"
);
const DEFAULT_MODEL = "gpt-image-2";
const DEFAULT_PRICE_PER_IMAGE = 0.6;
const PROMPT_TEMPLATE = "irasutoya-v1";
const WORD_PATTERN = /^[A-Za-z]+(?:[-'][A-Za-z]+)*$/;
const SUCCESS_STATUSES = new Set([
  "completed",
  "complete",
  "success",
  "succeeded",
  "done",
  "SUCCESS",
  "COMPLETED"
]);
const FAILURE_STATUSES = new Set([
  "failed",
  "failure",
  "error",
  "cancelled",
  "canceled",
  "FAILED",
  "FAILURE"
]);

function usage() {
  console.log([
    "Usage:",
    "  node scripts/generate-vocab-images.js [options]",
    "",
    "Safe first step:",
    "  node scripts/generate-vocab-images.js --dry-run --limit 10",
    "",
    "Options:",
    "  --dry-run                 List candidates and estimated cost only.",
    "  --source <name>           teacher, headwords, or teacher+headwords.",
    "                            Default: teacher+headwords.",
    "  --target-count <n>        Number of distinct words to prepare. Default: 5000.",
    "  --limit <n>               Process at most n pending images this run.",
    "  --offset <n>              Start at candidate offset n. Default: 0.",
    "  --word <word>             Process one exact word only.",
    "  --base-url <url>          OpenAI-compatible API base URL (or env var).",
    "  --api-key <key>           Avoid this; use VOCAB_IMAGE_API_KEY instead.",
    "  --model <id>              Image model. Default: gpt-image-2.",
    "  --size <size>             512x512, 1024x1024, etc. Default: 1024x1024.",
    "  --concurrency <n>         Simultaneous jobs. Default: 2.",
    "  --delay-ms <n>            Pause after each completed job. Default: 750.",
    "  --poll-ms <n>             Async task poll interval. Default: 3000.",
    "  --retries <n>             Retries after a failed job. Default: 2.",
    "  --confirm-cost <usd>      Required for real calls; must cover estimate.",
    "  --price-per-image <usd>   Estimate only. Default: 0.60.",
    "  --manifest <file>         Progress manifest path.",
    "  --out-dir <dir>           Downloaded PNG directory.",
    "  --retry-failed            Include failed records again.",
    "  --help                    Show this help."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    apiKey: process.env.VOCAB_IMAGE_API_KEY || "",
    baseUrl: process.env.VOCAB_IMAGE_API_BASE_URL || "",
    concurrency: 2,
    confirmCost: null,
    delayMs: 750,
    dryRun: false,
    limit: 0,
    manifest: DEFAULT_MANIFEST,
    model: DEFAULT_MODEL,
    offset: 0,
    outDir: DEFAULT_OUTPUT_DIR,
    pollMs: 3000,
    pricePerImage: DEFAULT_PRICE_PER_IMAGE,
    retries: 2,
    retryFailed: false,
    size: "1024x1024",
    source: "teacher+headwords",
    targetCount: 5000,
    word: ""
  };
  const valueArgs = new Set([
    "--api-key",
    "--base-url",
    "--concurrency",
    "--confirm-cost",
    "--delay-ms",
    "--limit",
    "--manifest",
    "--model",
    "--offset",
    "--out-dir",
    "--poll-ms",
    "--price-per-image",
    "--retries",
    "--size",
    "--source",
    "--target-count",
    "--word"
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--retry-failed") {
      options.retryFailed = true;
      continue;
    }
    if (valueArgs.has(arg)) {
      const value = argv[index + 1];
      if (value == null || value.startsWith("--")) {
        throw new Error(`${arg} requires a value.`);
      }
      index += 1;
      switch (arg) {
        case "--api-key":
          options.apiKey = value;
          break;
        case "--base-url":
          options.baseUrl = value;
          break;
        case "--concurrency":
          options.concurrency = clampInteger(value, 1, 8, options.concurrency);
          break;
        case "--confirm-cost":
          options.confirmCost = Number(value);
          break;
        case "--delay-ms":
          options.delayMs = clampInteger(value, 0, 120000, options.delayMs);
          break;
        case "--limit":
          options.limit = Math.max(0, Number(value) || 0);
          break;
        case "--manifest":
          options.manifest = path.resolve(value);
          break;
        case "--model":
          options.model = value;
          break;
        case "--offset":
          options.offset = Math.max(0, Number(value) || 0);
          break;
        case "--out-dir":
          options.outDir = path.resolve(value);
          break;
        case "--poll-ms":
          options.pollMs = clampInteger(value, 500, 120000, options.pollMs);
          break;
        case "--price-per-image":
          options.pricePerImage = Number(value);
          break;
        case "--retries":
          options.retries = clampInteger(value, 0, 10, options.retries);
          break;
        case "--size":
          options.size = value;
          break;
        case "--source":
          options.source = value;
          break;
        case "--target-count":
          options.targetCount = Math.max(1, Number(value) || options.targetCount);
          break;
        case "--word":
          options.word = value.trim();
          break;
      }
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }
  if (!Number.isFinite(options.pricePerImage) || options.pricePerImage < 0) {
    throw new Error("--price-per-image must be a non-negative number.");
  }
  if (options.confirmCost != null &&
      (!Number.isFinite(options.confirmCost) || options.confirmCost < 0)) {
    throw new Error("--confirm-cost must be a non-negative number.");
  }
  return options;
}

function clampInteger(value, minimum, maximum, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.trunc(parsed)));
}

function normalizeWord(value) {
  return String(value || "").trim().toLowerCase();
}

function isImageWord(value) {
  const word = String(value || "").trim();
  return word.length >= 2 && word.length <= 40 && WORD_PATTERN.test(word);
}

function addCandidate(map, rawWord, details, source) {
  const word = String(rawWord || "").trim();
  const normalized = normalizeWord(word);
  if (!isImageWord(word) || map.has(normalized)) return;
  const meanings = Array.isArray(details?.meanings)
    ? details.meanings.filter(Boolean)
    : details?.meaning
      ? [details.meaning]
      : [];
  map.set(normalized, {
    display: word,
    normalizedWord: normalized,
    meaning: meanings.slice(0, 2).join(" / "),
    pos: String(details?.pos || "").trim(),
    source
  });
}

function loadTeacherCandidates() {
  const bank = require(path.join(ROOT_DIR, "teacher_vocab_bank.js"));
  const map = new Map();
  for (const entry of Object.values(bank.entries || {})) {
    const key = normalizeWord(entry.word);
    const existing = map.get(key);
    if (!isImageWord(entry.word)) continue;
    if (!existing) {
      map.set(key, {
        display: String(entry.word).trim(),
        normalizedWord: key,
        meaning: entry.meaning ? String(entry.meaning).trim() : "",
        meanings: entry.meaning ? [String(entry.meaning).trim()] : [],
        pos: String(entry.pos || "").trim(),
        source: "teacher"
      });
      continue;
    }
    if (entry.meaning && !existing.meanings.includes(String(entry.meaning).trim())) {
      existing.meanings.push(String(entry.meaning).trim());
      existing.meaning = existing.meanings.slice(0, 2).join(" / ");
    }
    if (!existing.pos && entry.pos) existing.pos = String(entry.pos).trim();
  }
  return [...map.values()];
}

function loadHeadwordCandidates() {
  const headwords = require(path.join(
    ROOT_DIR,
    "flutter_app",
    "assets",
    "data",
    "vocab",
    "headwords.json"
  ));
  const map = new Map();
  const lookupMap = loadBundledLookupMap();
  for (const entry of headwords) {
    const word = entry.word || entry.display;
    const senses = lookupMap.get(normalizeWord(word)) || [];
    addCandidate(map, word, {
      ...entry,
      meanings: senses.map((sense) => sense.meaning).filter(Boolean).slice(0, 2),
      meaning: senses.map((sense) => sense.meaning).filter(Boolean).slice(0, 2).join(" / "),
      pos: senses[0]?.pos || ""
    }, "headwords");
  }
  return [...map.values()];
}

function loadBundledLookupMap() {
  const directory = path.join(ROOT_DIR, "flutter_app", "assets", "data", "vocab");
  const map = new Map();
  for (const file of fs.readdirSync(directory).filter((name) => /^lookup_.*\.json$/.test(name))) {
    const payload = JSON.parse(fs.readFileSync(path.join(directory, file), "utf8"));
    for (const [word, senses] of Object.entries(payload)) {
      const cleanSenses = Array.isArray(senses) ? senses : [];
      if (!map.has(normalizeWord(word))) map.set(normalizeWord(word), cleanSenses);
    }
  }
  return map;
}

function buildCandidates(options = {}) {
  const source = options.source || "teacher+headwords";
  if (!["teacher", "headwords", "teacher+headwords"].includes(source)) {
    throw new Error("--source must be teacher, headwords, or teacher+headwords.");
  }
  const map = new Map();
  if (source === "teacher" || source === "teacher+headwords") {
    for (const candidate of loadTeacherCandidates()) {
      map.set(normalizeWord(candidate.display), candidate);
    }
  }
  if (source === "headwords" || source === "teacher+headwords") {
    for (const candidate of loadHeadwordCandidates()) {
      if (!map.has(normalizeWord(candidate.display))) map.set(normalizeWord(candidate.display), candidate);
    }
  }
  let candidates = [...map.values()];
  if (options.word) {
    const normalized = normalizeWord(options.word);
    candidates = candidates.filter((candidate) => normalizeWord(candidate.display) === normalized);
  }
  return candidates.slice(0, Math.max(1, options.targetCount || 5000));
}

function buildPrompt(candidate) {
  const meaning = candidate.meaning || "最清楚、最常見的中文意思";
  return `创作 Irasutoya风格 AI 插画表示“${candidate.display} ${meaning}” 透明背景`;
}

function slugFor(candidate, index) {
  const slug = normalizeWord(candidate.display)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42) || "word";
  const hash = crypto.createHash("sha1").update(normalizeWord(candidate.display)).digest("hex").slice(0, 8);
  return `${String(index + 1).padStart(5, "0")}-${slug}-${hash}.png`;
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readManifest(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!parsed || !Array.isArray(parsed.items)) throw new Error(`Invalid manifest: ${filePath}`);
  return parsed;
}

function writeManifest(filePath, manifest) {
  ensureParent(filePath);
  const temporary = `${filePath}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\n`);
  fs.renameSync(temporary, filePath);
}

function createManifest(candidates, options) {
  return {
    version: 2,
    promptTemplate: PROMPT_TEMPLATE,
    createdAt: new Date().toISOString(),
    source: options.source,
    targetCount: candidates.length,
    model: options.model,
    size: options.size,
    outputFormat: "png",
    background: "transparent",
    items: candidates.map((candidate, index) => ({
      index,
      word: candidate.display,
      normalizedWord: normalizeWord(candidate.display),
      meaning: candidate.meaning,
      pos: candidate.pos,
      source: candidate.source,
      prompt: buildPrompt(candidate),
      file: slugFor(candidate, index),
      status: "pending",
      attempts: 0
    }))
  };
}

function extractPath(value, pathExpression) {
  return pathExpression.split(".").reduce((current, key) => {
    if (key === "*") return current;
    if (current == null) return undefined;
    return current[key];
  }, value);
}

function firstImageValue(payload) {
  const candidates = [];
  function visit(value) {
    if (typeof value === "string") {
      if (value.startsWith("data:image/") || /^https?:\/\//.test(value)) candidates.push(value);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (value && typeof value === "object") {
      if (typeof value.url === "string") visit(value.url);
      if (typeof value.b64_json === "string") visit(`data:image/png;base64,${value.b64_json}`);
      for (const [key, child] of Object.entries(value)) {
        if (key !== "url" && key !== "b64_json") visit(child);
      }
    }
  }
  visit(payload);
  return candidates[0] || "";
}

function taskIdFrom(payload) {
  return payload?.task_id || payload?.taskId || payload?.id || payload?.data?.task_id || payload?.data?.id || "";
}

function statusFrom(payload) {
  return payload?.status || payload?.state || payload?.data?.status || payload?.data?.state || "";
}

function errorFrom(payload) {
  return payload?.error?.message || payload?.error || payload?.data?.error || payload?.message || "Image task failed.";
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

async function requestJson(url, options, timeoutMs = 120000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch (_) {
      payload = { raw: text };
    }
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}: ${errorFrom(payload)}`);
    }
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

function authHeaders(apiKey, json = false) {
  return {
    Authorization: `Bearer ${apiKey}`,
    ...(json ? { "Content-Type": "application/json" } : {})
  };
}

async function downloadImage(imageValue, apiKey) {
  if (imageValue.startsWith("data:image/")) {
    const comma = imageValue.indexOf(",");
    return Buffer.from(imageValue.slice(comma + 1), "base64");
  }
  const attempts = [
    { headers: authHeaders(apiKey) },
    { headers: {} }
  ];
  for (const options of attempts) {
    try {
      const response = await fetch(imageValue, options);
      if (!response.ok) continue;
      return Buffer.from(await response.arrayBuffer());
    } catch (_) {
      // Try the signed URL without the API header below.
    }
  }
  throw new Error("Image result could not be downloaded.");
}

async function submitAndPoll(item, options) {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const headers = authHeaders(options.apiKey, true);
  const body = {
    model: options.model,
    prompt: item.prompt,
    size: options.size,
    quality: "auto",
    output_format: "png",
    moderation: "auto",
    output_compression: 100,
    n: 1,
    background: "transparent"
  };
  let submitted;
  try {
    submitted = await requestJson(`${baseUrl}/images/generations/async`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
  } catch (error) {
    // Some OpenAI-compatible proxies expose only the synchronous Images API.
    // Fall back only for the explicit "async not enabled" response so other
    // failures still retry normally without accidentally submitting twice.
    if (!/async image tasks are not enabled/i.test(String(error?.message || ""))) {
      throw error;
    }
    const synchronous = await requestJson(`${baseUrl}/images/generations`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    const image = firstImageValue(synchronous);
    if (!image) throw new Error("Synchronous image response had no image result.");
    return image;
  }
  const taskId = taskIdFrom(submitted);
  if (!taskId) {
    const image = firstImageValue(submitted);
    if (!image) throw new Error("API response had no task ID or image result.");
    return image;
  }
  for (;;) {
    await sleep(options.pollMs);
    const result = await requestJson(
      `${baseUrl}/images/tasks/${encodeURIComponent(taskId)}`,
      { headers: authHeaders(options.apiKey) }
    );
    const status = statusFrom(result);
    if (SUCCESS_STATUSES.has(status)) {
      const image = firstImageValue(result);
      if (!image) throw new Error("Completed task had no image result.");
      return image;
    }
    if (FAILURE_STATUSES.has(status)) throw new Error(String(errorFrom(result)));
  }
}

function pendingItems(manifest, options) {
  const start = Math.min(manifest.items.length, options.offset);
  const end = options.limit > 0
    ? Math.min(manifest.items.length, start + options.limit)
    : manifest.items.length;
  return manifest.items.slice(start, end).filter((item) => {
    if (item.status === "done" && fs.existsSync(path.join(options.outDir, item.file))) return false;
    if (item.status === "failed") return options.retryFailed;
    return true;
  });
}

async function run(options) {
  const candidates = buildCandidates(options);
  if (candidates.length === 0) throw new Error("No valid vocabulary candidates found.");
  let manifest = readManifest(options.manifest);
  if (!manifest || manifest.version !== 2 || manifest.promptTemplate !== PROMPT_TEMPLATE || manifest.source !== options.source || manifest.targetCount !== candidates.length) {
    manifest = createManifest(candidates, options);
    writeManifest(options.manifest, manifest);
  }
  const items = pendingItems(manifest, options);
  const estimatedCost = items.length * options.pricePerImage;
  console.log(`Candidates: ${candidates.length}`);
  console.log(`Pending this run: ${items.length}`);
  console.log(`Estimated maximum cost: USD ${estimatedCost.toFixed(2)}`);
  console.log(`Manifest: ${options.manifest}`);
  console.log(`Output: ${options.outDir}`);
  if (options.dryRun) return { candidates, items, estimatedCost };
  if (!options.apiKey || !options.baseUrl) {
    throw new Error("Real generation requires VOCAB_IMAGE_API_KEY and VOCAB_IMAGE_API_BASE_URL.");
  }
  if (options.confirmCost == null || options.confirmCost < estimatedCost) {
    throw new Error(`Add --confirm-cost ${estimatedCost.toFixed(2)} or higher before real generation.`);
  }
  fs.mkdirSync(options.outDir, { recursive: true });
  let nextIndex = 0;
  async function worker() {
    while (true) {
      const item = items[nextIndex++];
      if (!item) return;
      item.status = "running";
      item.updatedAt = new Date().toISOString();
      writeManifest(options.manifest, manifest);
      let lastError;
      for (let attempt = 0; attempt <= options.retries; attempt += 1) {
        item.attempts = (item.attempts || 0) + 1;
        try {
          const imageValue = await submitAndPoll(item, options);
          const bytes = await downloadImage(imageValue, options.apiKey);
          const filePath = path.join(options.outDir, item.file);
          fs.writeFileSync(`${filePath}.tmp`, bytes);
          fs.renameSync(`${filePath}.tmp`, filePath);
          item.status = "done";
          item.updatedAt = new Date().toISOString();
          item.error = "";
          writeManifest(options.manifest, manifest);
          console.log(`DONE ${item.index + 1}/${manifest.items.length} ${item.word}`);
          lastError = null;
          break;
        } catch (error) {
          lastError = error;
          item.error = error instanceof Error ? error.message : String(error);
          if (attempt < options.retries) await sleep(Math.min(30000, 1000 * 2 ** attempt));
        }
      }
      if (lastError) {
        item.status = "failed";
        item.updatedAt = new Date().toISOString();
        writeManifest(options.manifest, manifest);
        console.error(`FAILED ${item.index + 1}/${manifest.items.length} ${item.word}: ${item.error}`);
      }
      if (options.delayMs > 0) await sleep(options.delayMs);
    }
  }
  await Promise.all(Array.from({ length: Math.min(options.concurrency, Math.max(1, items.length)) }, worker));
  return { candidates, items, estimatedCost };
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    await run(options);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  buildCandidates,
  buildPrompt,
  createManifest,
  firstImageValue,
  isImageWord,
  normalizeWord,
  parseArgs,
  statusFrom,
  taskIdFrom
};
