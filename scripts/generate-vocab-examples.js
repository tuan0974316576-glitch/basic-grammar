#!/usr/bin/env node
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const VocabExampleUtils = require("../vocab_example_utils.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const PRIVATE_EXPORTS_DIR = path.join(ROOT_DIR, "private_exports");
const DEFAULT_OXFORD_INPUT = path.join(PRIVATE_EXPORTS_DIR, "oxford_cefr_vocab.js");
const DEFAULT_OUTPUT = path.join(ROOT_DIR, "vocab_example_seed.js");
const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const FIREBASE_CLI_WRAPPER = path.join(ROOT_DIR, "scripts", "firebase-cli.js");
const FIREBASE_CONFIG_PATH = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";
const EXAMPLES_PER_ENTRY = 3;
const LEVEL_ORDER = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };
const LEVEL_GUIDES = {
  A1: "Hong Kong junior primary level. Use 4-7 words, present simple, daily life only.",
  A2: "Hong Kong senior primary level. Use 5-9 words and simple school/home contexts.",
  B1: "Hong Kong Secondary 1 level. Use 7-12 words and simple because/when/if clauses when natural.",
  B2: "Hong Kong Secondary 2-3 level. Use 9-15 words, natural school or daily contexts.",
  C1: "Hong Kong DSE level. Use precise but still clear sentences; avoid obscure academic wording."
};

let cachedGeminiApiKey = "";

function ensureNodeExtraCaCerts() {
  if (process.env.NODE_EXTRA_CA_CERTS) return;
  const certificatePaths = [
    "/opt/homebrew/etc/ca-certificates/cert.pem",
    "/usr/local/etc/ca-certificates/cert.pem",
    "/etc/ssl/cert.pem"
  ];
  const certificatePath = certificatePaths.find((candidate) => fs.existsSync(candidate));
  if (certificatePath) {
    process.env.NODE_EXTRA_CA_CERTS = certificatePath;
  }
}

function getCertificate() {
  const certificatePaths = [
    process.env.NODE_EXTRA_CA_CERTS,
    "/opt/homebrew/etc/ca-certificates/cert.pem",
    "/usr/local/etc/ca-certificates/cert.pem",
    "/etc/ssl/cert.pem"
  ].filter(Boolean);
  const certificatePath = certificatePaths.find((candidate) => fs.existsSync(candidate));
  return certificatePath ? fs.readFileSync(certificatePath) : undefined;
}

function usage() {
  console.log([
    "Usage:",
    "  node scripts/generate-vocab-examples.js [options]",
    "",
    "Options:",
    "  --dry-run              Print task counts without calling Gemini.",
    "  --limit <n>            Generate only the first n missing tasks.",
    "  --word <word>          Generate only one word / phrase.",
    "  --level <A1-C1>        Generate only one CEFR level.",
    "  --delay-ms <n>         Wait n milliseconds after each Gemini request.",
    "  --out <file>           Output seed JS file.",
    "  --model <model>        Gemini model name.",
    "  --upload               Upload generated / existing seed entries to Firestore.",
    "  --project <id>         Firebase project for upload.",
    "  --force                Regenerate entries that already exist in seed.",
    "  --retries <n>          Retry each Gemini task n times before marking it failed.",
    "  --insecure             Disable TLS verification for local generation if macOS CA is broken.",
    "",
    "Examples:",
    "  npm run vocab:import:oxford -- \"/path/The_Oxford_3000_by_CEFR_level.pdf\" \"/path/The_Oxford_5000_by_CEFR_level.pdf\"",
    "  node scripts/generate-vocab-examples.js --dry-run",
    "  node scripts/generate-vocab-examples.js --limit 20",
    "  node scripts/generate-vocab-examples.js --upload --limit 100"
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    delayMs: 4500,
    force: false,
    insecure: false,
    limit: 0,
    model: DEFAULT_MODEL,
    out: DEFAULT_OUTPUT,
    project: "enguistics-grammar-game",
    retries: 2,
    upload: false,
    word: "",
    level: ""
  };

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
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--insecure") {
      options.insecure = true;
      continue;
    }
    if (arg === "--upload") {
      options.upload = true;
      continue;
    }
    if (arg === "--limit") {
      options.limit = Number(argv[index + 1]) || 0;
      index += 1;
      continue;
    }
    if (arg === "--delay-ms") {
      options.delayMs = Math.max(0, Number(argv[index + 1]) || 0);
      index += 1;
      continue;
    }
    if (arg === "--model") {
      options.model = argv[index + 1] || options.model;
      index += 1;
      continue;
    }
    if (arg === "--out") {
      options.out = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--project") {
      options.project = argv[index + 1] || options.project;
      index += 1;
      continue;
    }
    if (arg === "--retries") {
      options.retries = Math.max(0, Number(argv[index + 1]) || 0);
      index += 1;
      continue;
    }
    if (arg === "--word") {
      options.word = VocabExampleUtils.normalizeWord(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--level") {
      options.level = String(argv[index + 1] || "").trim().toUpperCase();
      index += 1;
      continue;
    }
  }

  if (options.level && !LEVEL_ORDER[options.level]) {
    throw new Error(`Unsupported level: ${options.level}`);
  }

  return options;
}

function loadSeed(filePath = DEFAULT_OUTPUT) {
  if (!fs.existsSync(filePath)) {
    return { meta: {}, entries: {} };
  }
  delete require.cache[require.resolve(filePath)];
  return require(filePath);
}

function loadOxfordEntries(filePath = DEFAULT_OXFORD_INPUT) {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(`Oxford CEFR reference not found at ${resolvedPath}. Continuing with teacher vocab only.`);
      console.warn("Run `npm run vocab:import:oxford -- <Oxford 3000 PDF> <Oxford 5000 PDF>` to create the private reference.");
    }
    return [];
  }
  const requirePath = require.resolve(resolvedPath);
  delete require.cache[requirePath];
  const bank = require(requirePath);
  return Array.isArray(bank.entries) ? bank.entries : [];
}

function loadTeacherEntries() {
  delete require.cache[require.resolve(path.join(ROOT_DIR, "teacher_vocab_bank.js"))];
  const bank = require(path.join(ROOT_DIR, "teacher_vocab_bank.js"));
  return Array.isArray(bank.entries) ? bank.entries : [];
}

function makeCacheId(cloudCacheKey) {
  return crypto.createHash("sha256").update(VocabExampleUtils.normalizeWord(cloudCacheKey)).digest("hex").slice(0, 24);
}

function makeOxfordLevelLookup(oxfordEntries = []) {
  const map = new Map();
  oxfordEntries.forEach((entry) => {
    const word = VocabExampleUtils.normalizeWord(entry.word);
    const level = String(entry.level || "").toUpperCase();
    if (!word || !LEVEL_ORDER[level]) return;
    const previous = map.get(word);
    if (!previous || LEVEL_ORDER[level] < LEVEL_ORDER[previous]) {
      map.set(word, level);
    }
  });
  return map;
}

function inferFallbackLevel(entry = {}) {
  const word = VocabExampleUtils.normalizeWord(entry.word);
  if (!word) return "B1";
  if (entry.type === "phrase") return word.split(/\s+/).length >= 3 ? "B2" : "B1";
  if (word.length <= 5) return "A2";
  if (word.length <= 8) return "B1";
  if (/(?:tion|sion|ment|ness|ity|ism|ship|ance|ence|ture|logy)$/.test(word)) return "B2";
  return "B1";
}

function normalizeTeacherTask(entry = {}, oxfordLevelByWord = new Map()) {
  const word = VocabExampleUtils.normalizeWord(entry.word);
  const meaning = VocabExampleUtils.normalizeMeaning(entry.meaning);
  if (!word || !meaning || entry.type === "pattern") return null;
  const level = oxfordLevelByWord.get(word) || inferFallbackLevel(entry);
  const hints = VocabExampleUtils.normalizeHints([{
    meaning,
    pos: entry.pos || "",
    type: entry.type || "word",
    level
  }]);
  const localKey = VocabExampleUtils.getLocalCacheKey(word, hints);
  const cloudKey = VocabExampleUtils.getCloudCacheKey(word, hints);
  return {
    id: `teacher:${entry.id || localKey}`,
    source: "teacher",
    word,
    display: entry.display || entry.word,
    meaning,
    pos: entry.pos || "",
    type: entry.type || "word",
    level,
    hints,
    localKey,
    cloudKey
  };
}

function normalizeOxfordTask(entry = {}, teacherWordSet = new Set()) {
  const word = VocabExampleUtils.normalizeWord(entry.word);
  if (!word || teacherWordSet.has(word)) return null;
  if (word.includes(",")) return null;
  const level = String(entry.level || "").toUpperCase();
  if (!LEVEL_ORDER[level]) return null;
  const pos = Array.isArray(entry.pos) ? entry.pos[0] || "" : "";
  const hints = [];
  const localKey = word;
  const cloudKey = word;
  return {
    id: `oxford:${word}:${level}:${entry.posRaw || ""}`,
    source: "oxford",
    word,
    display: entry.display || entry.word,
    meaning: "",
    pos,
    type: word.includes(" ") ? "phrase" : "word",
    level,
    hints,
    localKey,
    cloudKey
  };
}

function buildTasks(input = {}) {
  const oxfordEntries = Array.isArray(input.oxfordEntries) ? input.oxfordEntries : loadOxfordEntries();
  const teacherEntries = Array.isArray(input.teacherEntries) ? input.teacherEntries : loadTeacherEntries();
  const oxfordLevelByWord = makeOxfordLevelLookup(oxfordEntries);
  const teacherWordSet = new Set(
    teacherEntries.map((entry) => VocabExampleUtils.normalizeWord(entry.word)).filter(Boolean)
  );
  const tasks = [
    ...teacherEntries.map((entry) => normalizeTeacherTask(entry, oxfordLevelByWord)),
    ...oxfordEntries.map((entry) => normalizeOxfordTask(entry, teacherWordSet))
  ].filter(Boolean);

  const seen = new Set();
  return tasks.filter((task) => {
    if (seen.has(task.localKey)) return false;
    seen.add(task.localKey);
    return true;
  }).sort((left, right) => (
    (LEVEL_ORDER[left.level] || 99) - (LEVEL_ORDER[right.level] || 99)
    || left.word.localeCompare(right.word)
    || left.localKey.localeCompare(right.localKey)
  ));
}

function buildPrompt(task) {
  const hint = task.hints[0] || {};
  const meaningLine = hint.meaning && !/core vocabulary/i.test(hint.meaning)
    ? `Target meaning: ${hint.meaning}`
    : "Target meaning: choose the most common useful meaning for Hong Kong students.";
  return [
    "You are writing vocabulary example sentences for Hong Kong students.",
    "Create short, natural, safe English example sentences with tightly matched Traditional Chinese translations.",
    "",
    `Vocabulary item: ${task.word}`,
    `Part of speech / type: ${[task.pos, task.type].filter(Boolean).join(" / ") || "word"}`,
    `CEFR level: ${task.level}`,
    `Difficulty guide: ${LEVEL_GUIDES[task.level] || LEVEL_GUIDES.B1}`,
    meaningLine,
    "",
    "Rules:",
    "- Return JSON only. No markdown.",
    `- Return exactly ${EXAMPLES_PER_ENTRY} examples.`,
    "- Each English sentence must include the vocabulary item or a natural inflected form of it.",
    "- The Traditional Chinese must match the English sentence closely.",
    "- The Traditional Chinese translation must be natural Cantonese-friendly Traditional Chinese, not word-for-word machine translation.",
    "- Do not translate fixed chunks awkwardly. For example, translate 'talk about' as '談論', not '談論關於'.",
    "- Use Traditional Chinese, not Simplified Chinese.",
    "- Avoid strange, violent, adult, political, religious, or scary content.",
    "- Avoid rare names and idioms unless the vocabulary item itself is a phrase.",
    "- If the vocabulary item is a phrase, keep the phrase together in the English sentence.",
    "",
    "JSON shape:",
    "{\"examples\":[{\"source\":\"English sentence.\",\"target\":\"繁體中文翻譯。\"}]}"
  ].join("\n");
}

function parseGeminiJsonText(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : raw;
  try {
    return JSON.parse(candidate);
  } catch (_error) {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch (_innerError) {
        return null;
      }
    }
  }
  return null;
}

function normalizeExampleText(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 180);
}

function normalizeGeneratedExamples(task, body) {
  const text = body?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || "")
    .join("")
    .trim();
  const parsed = parseGeminiJsonText(text);
  const examples = Array.isArray(parsed?.examples) ? parsed.examples : [];
  const seen = new Set();
  return examples
    .map((example, index) => ({
      id: `seed-${VocabExampleUtils.stableHash(`${task.localKey}:${index}:${example.source || ""}`)}`,
      source: normalizeExampleText(example.source || example.english || ""),
      target: normalizeExampleText(example.target || example.chinese || example.translation || ""),
      meaning: task.meaning || "",
      level: task.level
    }))
    .filter((example) => example.source && example.target)
    .filter((example) => {
      const key = `${example.source}|${example.target}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, EXAMPLES_PER_ENTRY);
}

async function callGemini(task, options) {
  if (options.insecure) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }
  const apiKey = process.env.GEMINI_API_KEY || readGeminiSecret(options.project);
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Set env var or Firebase secret first.");
  }
  const endpoint = `${GEMINI_ENDPOINT}/models/${options.model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const { statusCode, body } = await postJsonWithStatus(
    endpoint,
    {
      contents: [{
        role: "user",
        parts: [{ text: buildPrompt(task) }]
      }],
      generationConfig: {
        temperature: 0.45,
        topP: 0.9,
        maxOutputTokens: 512,
        responseMimeType: "application/json"
      }
    },
    {},
    { insecure: options.insecure }
  );
  if (statusCode < 200 || statusCode >= 300) {
    const details = body?.error?.message || body?.raw || `HTTP ${statusCode}`;
    throw new Error(`Gemini failed for ${task.word}: ${details}`);
  }
  const examples = normalizeGeneratedExamples(task, body);
  if (examples.length !== EXAMPLES_PER_ENTRY) {
    throw new Error(`Gemini returned ${examples.length} examples for ${task.word}`);
  }
  return examples;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelayMs(error) {
  const text = String(error?.message || "");
  const match = text.match(/Please retry in\s+([0-9.]+)s/i);
  if (match) {
    return Math.ceil(Number(match[1]) * 1000) + 1500;
  }
  if (/quota|rate limit|resource exhausted/i.test(text)) {
    return 65000;
  }
  return 1200;
}

async function callGeminiWithRetry(task, options) {
  let lastError = null;
  const attempts = Math.max(1, (Number(options.retries) || 0) + 1);
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await callGemini(task, options);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        const delayMs = getRetryDelayMs(error);
        console.warn(`Retrying ${task.word} (${attempt}/${attempts - 1}) after ${Math.round(delayMs / 1000)}s: ${error.message}`);
        await sleep(delayMs);
      }
    }
  }
  throw lastError || new Error(`Gemini failed for ${task.word}`);
}

function readGeminiSecret(project) {
  if (cachedGeminiApiKey) return cachedGeminiApiKey;
  const cli = path.join(__dirname, "firebase-cli.js");
  const result = spawnSync(process.execPath, [
    cli,
    "functions:secrets:access",
    "GEMINI_API_KEY",
    "--project",
    project
  ], {
    cwd: ROOT_DIR,
    encoding: "utf8",
    maxBuffer: 1024 * 1024
  });
  if (result.status !== 0) return "";
  cachedGeminiApiKey = String(result.stdout || "").trim();
  return cachedGeminiApiKey;
}

function readFirebaseCliConfig() {
  return JSON.parse(fs.readFileSync(FIREBASE_CONFIG_PATH, "utf8"));
}

function refreshFirebaseCliTokenIfNeeded() {
  let config;
  try {
    config = readFirebaseCliConfig();
  } catch (_error) {
    throw new Error("Firebase CLI is not logged in. Run `npm run firebase:reauth` first.");
  }

  const expiresAt = Number(config.tokens?.expires_at) || 0;
  const hasToken = Boolean(config.tokens?.access_token);
  if (hasToken && expiresAt > Date.now() + 60000) {
    return config.tokens.access_token;
  }

  const result = spawnSync(process.execPath, [
    FIREBASE_CLI_WRAPPER,
    "projects:list",
    "--json"
  ], {
    cwd: ROOT_DIR,
    encoding: "utf8",
    maxBuffer: 1024 * 1024
  });

  if (result.status !== 0) {
    throw new Error("Could not refresh Firebase CLI token. Run `npm run firebase:reauth` first.");
  }

  const refreshedConfig = readFirebaseCliConfig();
  const refreshedToken = refreshedConfig.tokens?.access_token;
  if (!refreshedToken) {
    throw new Error("Firebase CLI token was not found after refresh.");
  }
  return refreshedToken;
}

function firestoreString(value) {
  return { stringValue: String(value || "") };
}

function firestoreArray(values = []) {
  return {
    arrayValue: {
      values: values.map((value) => firestoreValue(value))
    }
  };
}

function firestoreMap(value = {}) {
  return {
    mapValue: {
      fields: Object.fromEntries(
        Object.entries(value)
          .filter(([, entryValue]) => entryValue !== undefined)
          .map(([key, entryValue]) => [key, firestoreValue(entryValue)])
      )
    }
  };
}

function firestoreValue(value) {
  if (Array.isArray(value)) return firestoreArray(value);
  if (value && typeof value === "object") return firestoreMap(value);
  return firestoreString(value);
}

function parseResponseBody(responseBody) {
  if (!responseBody) return {};
  try {
    return JSON.parse(responseBody);
  } catch (_error) {
    return { raw: responseBody };
  }
}

function postJsonWithStatus(url, payload, headers = {}, options = {}) {
  const body = JSON.stringify(payload);
  const requestUrl = new URL(url);
  return new Promise((resolve, reject) => {
    const request = https.request({
      method: "POST",
      hostname: requestUrl.hostname,
      path: `${requestUrl.pathname}${requestUrl.search}`,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        ...headers
      },
      ca: getCertificate(),
      rejectUnauthorized: options.insecure ? false : undefined
    }, (response) => {
      let responseBody = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        responseBody += chunk;
      });
      response.on("end", () => {
        resolve({
          statusCode: response.statusCode || 0,
          body: parseResponseBody(responseBody)
        });
      });
    });

    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

async function postJson(url, payload, accessToken) {
  const result = await postJsonWithStatus(url, payload, {
    "Authorization": `Bearer ${accessToken}`
  });
  if (result.statusCode >= 200 && result.statusCode < 300) {
    return result.body;
  }
  throw new Error(`Firestore REST request failed (${result.statusCode}): ${JSON.stringify(result.body)}`);
}

function writeSeed(filePath, seed) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const source = [
    "(function attachVocabExampleSeed(root, data) {",
    "  if (typeof module !== \"undefined\" && module.exports) {",
    "    module.exports = data;",
    "  }",
    "  root.VOCAB_EXAMPLE_SEED = data;",
    `})(typeof globalThis !== \"undefined\" ? globalThis : window, ${JSON.stringify(seed, null, 2)});`,
    ""
  ].join("\n");
  fs.writeFileSync(filePath, source);
}

async function uploadSeedEntries(seed, tasksByLocalKey, options) {
  const accessToken = refreshFirebaseCliTokenIfNeeded();
  const databaseId = "(default)";
  const commitUrl = `https://firestore.googleapis.com/v1/projects/${options.project}/databases/${databaseId}/documents:commit`;
  const entries = Object.entries(seed.entries || {});
  let uploaded = 0;
  for (let index = 0; index < entries.length; index += 450) {
    const writes = entries.slice(index, index + 450).map(([localKey, payload]) => {
      const task = tasksByLocalKey.get(localKey) || {};
      const cloudKey = task.cloudKey || VocabExampleUtils.getCloudCacheKey(payload.word, payload.hints || []);
      const exampleId = makeCacheId(cloudKey);
      const fields = {
        word: firestoreString(payload.word || task.word || ""),
        exampleId: firestoreString(exampleId),
        cacheKey: firestoreString(cloudKey),
        localKey: firestoreString(localKey),
        hints: firestoreValue(payload.hints || task.hints || []),
        source: firestoreString(payload.source || "local-seed-gemini"),
        status: firestoreString(payload.status || "ready"),
        level: firestoreString(payload.level || task.level || ""),
        examples: firestoreValue((payload.examples || []).map((example) => ({
          source: example.source,
          target: example.target,
          meaning: example.meaning || "",
          sourceEntryId: example.id || ""
        }))),
        updatedAt: { timestampValue: new Date().toISOString() }
      };
      uploaded += 1;
      return {
        update: {
          name: `projects/${options.project}/databases/${databaseId}/documents/vocabExampleCache/${exampleId}`,
          fields
        },
        updateMask: {
          fieldPaths: Object.keys(fields)
        }
      };
    });
    await postJson(commitUrl, { writes }, accessToken);
  }
  console.log(`Uploaded ${uploaded} seed entries to Firestore vocabExampleCache.`);
}

async function main() {
  ensureNodeExtraCaCerts();
  const options = parseArgs(process.argv.slice(2));
  const seed = loadSeed(options.out);
  seed.meta = {
    ...(seed.meta || {}),
    generatedAt: seed.meta?.generatedAt || "",
    source: "local-seed-gemini"
  };
  seed.entries = seed.entries || {};

  const tasks = buildTasks()
    .filter((task) => !options.word || task.word === options.word)
    .filter((task) => !options.level || task.level === options.level);
  const missingTasks = tasks.filter((task) => options.force || !seed.entries[task.localKey]);
  const selectedTasks = options.limit ? missingTasks.slice(0, options.limit) : missingTasks;
  const counts = tasks.reduce((acc, task) => {
    acc[task.level] = (acc[task.level] || 0) + 1;
    return acc;
  }, {});

  console.log(JSON.stringify({
    totalTasks: tasks.length,
    existingSeedEntries: Object.keys(seed.entries).length,
    missingTasks: missingTasks.length,
    selectedTasks: selectedTasks.length,
    levelCounts: counts,
    output: options.out
  }, null, 2));

  if (options.dryRun) return;

  for (let index = 0; index < selectedTasks.length; index += 1) {
    const task = selectedTasks[index];
    console.log(`[${index + 1}/${selectedTasks.length}] ${task.word} ${task.level} ${task.meaning || ""}`.trim());
    let examples;
    try {
      examples = await callGeminiWithRetry(task, options);
    } catch (error) {
      seed.entries[task.localKey] = {
        word: task.word,
        display: task.display,
        source: "local-seed-gemini",
        status: "failed",
        level: task.level,
        meaning: task.meaning || "",
        pos: task.pos || "",
        type: task.type || "",
        hints: task.hints,
        error: error.message,
        examples: []
      };
      console.warn(`Skipping ${task.word}: ${error.message}`);
      writeSeed(options.out, {
        ...seed,
        meta: {
          ...seed.meta,
          generatedAt: new Date().toISOString(),
          entryCount: Object.keys(seed.entries).length,
          readyCount: Object.values(seed.entries).filter((entry) => entry.status !== "failed").length,
          failedCount: Object.values(seed.entries).filter((entry) => entry.status === "failed").length,
          exampleCount: Object.values(seed.entries).reduce((total, entry) => total + (entry.examples || []).length, 0)
        }
      });
      continue;
    }
    seed.entries[task.localKey] = {
      word: task.word,
      display: task.display,
      source: "local-seed-gemini",
      status: "ready",
      level: task.level,
      meaning: task.meaning || "",
      pos: task.pos || "",
      type: task.type || "",
      hints: task.hints,
      examples
    };
    writeSeed(options.out, {
      ...seed,
      meta: {
        ...seed.meta,
        generatedAt: new Date().toISOString(),
        entryCount: Object.keys(seed.entries).length,
        readyCount: Object.values(seed.entries).filter((entry) => entry.status !== "failed").length,
        failedCount: Object.values(seed.entries).filter((entry) => entry.status === "failed").length,
        exampleCount: Object.values(seed.entries).reduce((total, entry) => total + (entry.examples || []).length, 0)
      }
    });
    if (options.delayMs > 0 && index < selectedTasks.length - 1) {
      await sleep(options.delayMs);
    }
  }

  const tasksByLocalKey = new Map(tasks.map((task) => [task.localKey, task]));
  if (options.upload) {
    await uploadSeedEntries(seed, tasksByLocalKey, options);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  DEFAULT_MODEL,
  DEFAULT_OXFORD_INPUT,
  DEFAULT_OUTPUT,
  EXAMPLES_PER_ENTRY,
  LEVEL_GUIDES,
  LEVEL_ORDER,
  buildPrompt,
  buildTasks,
  inferFallbackLevel,
  loadOxfordEntries,
  makeOxfordLevelLookup,
  normalizeGeneratedExamples,
  normalizeOxfordTask,
  normalizeTeacherTask,
  parseArgs,
  parseGeminiJsonText,
  callGeminiWithRetry
};
