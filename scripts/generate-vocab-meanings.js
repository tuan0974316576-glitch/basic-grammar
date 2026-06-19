#!/usr/bin/env node
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const VocabPosInference = require("../vocab_pos_inference.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const PRIVATE_EXPORTS_DIR = path.join(ROOT_DIR, "private_exports");
const DEFAULT_OXFORD_INPUT = path.join(PRIVATE_EXPORTS_DIR, "oxford_cefr_vocab.js");
const DEFAULT_OUTPUT = path.join(PRIVATE_EXPORTS_DIR, "vocab_meaning_seed.js");
const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const FIREBASE_CLI_WRAPPER = path.join(ROOT_DIR, "scripts", "firebase-cli.js");
const FIREBASE_CONFIG_PATH = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";
const LEVEL_ORDER = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };
const SOURCE = "local-meaning-gemini";
const FIRESTORE_CACHE_SOURCE = "shared-cache";
const INVALID_OXFORD_WORDS = new Set([
  "nction",
  "tlement"
]);
const OXFORD_ENTRY_OVERRIDES = {
  diplomatic: {
    pos: ["adjective"],
    posRaw: "adj."
  }
};
const ITEM_ARRAY_KEYS = [
  "items",
  "entries",
  "words",
  "vocabulary",
  "vocab",
  "data",
  "results"
];
const SENSE_ARRAY_KEYS = [
  "senses",
  "meanings",
  "translations",
  "definitions",
  "entries",
  "items"
];
const POS_VALUE_KEYS = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "preposition",
  "conjunction",
  "pronoun",
  "determiner",
  "n",
  "v",
  "adj",
  "adv",
  "prep",
  "conj",
  "pron",
  "det",
  "modal",
  "auxiliary",
  "exclamation",
  "number",
  "n.",
  "v.",
  "adj.",
  "adv.",
  "prep.",
  "conj.",
  "pron.",
  "det.",
  "modal v.",
  "aux.",
  "exclam.",
  "num."
];

let cachedGeminiApiKey = "";

function usage() {
  console.log([
    "Usage:",
    "  node scripts/generate-vocab-meanings.js [options]",
    "",
    "Options:",
    "  --dry-run              Print task counts without calling Gemini.",
    "  --limit <n>            Generate only the first n missing words.",
    "  --word <word>          Generate only one word.",
    "  --level <A1-C1>        Generate only one CEFR level.",
    "  --batch-size <n>       Words per Gemini request. Default: 12.",
    "  --delay-ms <n>         Wait n milliseconds after each Gemini request.",
    "  --out <file>           Output private seed JS file.",
    "  --model <model>        Gemini model name.",
    "  --project <id>         Firebase project for secret/upload.",
    "  --force                Regenerate existing words.",
    "  --upload               Upload ready seed entries to Firestore vocabMeaningCache.",
    "  --insecure             Disable TLS verification if local CA is broken.",
    "",
    "Examples:",
    "  npm run vocab:meanings -- --dry-run",
    "  npm run vocab:meanings -- --level A1 --limit 50",
    "  npm run vocab:meanings -- --upload"
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    batchSize: 12,
    delayMs: 1200,
    dryRun: false,
    force: false,
    insecure: false,
    level: "",
    limit: 0,
    model: DEFAULT_MODEL,
    out: DEFAULT_OUTPUT,
    project: "enguistics-grammar-game",
    upload: false,
    word: ""
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
    if (arg === "--batch-size") {
      options.batchSize = Math.max(1, Math.min(30, Number(argv[index + 1]) || options.batchSize));
      index += 1;
      continue;
    }
    if (arg === "--delay-ms") {
      options.delayMs = Math.max(0, Number(argv[index + 1]) || 0);
      index += 1;
      continue;
    }
    if (arg === "--limit") {
      options.limit = Number(argv[index + 1]) || 0;
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
    if (arg === "--word") {
      options.word = VocabPosInference.normalizeWord(argv[index + 1] || "");
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

function loadJs(filePath, fallback = null) {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) return fallback;
  delete require.cache[require.resolve(resolvedPath)];
  return require(resolvedPath);
}

function loadSeed(filePath = DEFAULT_OUTPUT) {
  return loadJs(filePath, { meta: {}, entries: {} }) || { meta: {}, entries: {} };
}

function loadOxfordEntries(filePath = DEFAULT_OXFORD_INPUT) {
  const bank = loadJs(filePath, { entries: [] }) || { entries: [] };
  return Array.isArray(bank.entries) ? bank.entries : [];
}

function loadTeacherEntries() {
  const bank = loadJs(path.join(ROOT_DIR, "teacher_vocab_bank.js"), { entries: [] }) || { entries: [] };
  return Array.isArray(bank.entries) ? bank.entries : [];
}

function loadCuratedSenseEntries() {
  const bank = loadJs(path.join(ROOT_DIR, "vocab_sense_bank.js"), { entries: [] }) || { entries: [] };
  return Array.isArray(bank.entries) ? bank.entries : [];
}

function normalizePosList(value) {
  const list = Array.isArray(value) ? value : [value];
  return Array.from(new Set(
    list
      .map(VocabPosInference.normalizePos)
      .filter(Boolean)
  ));
}

function isUsableOxfordWord(word) {
  const normalized = VocabPosInference.normalizeWord(word);
  return Boolean(
    normalized
    && !INVALID_OXFORD_WORDS.has(normalized)
    && !normalized.includes(",")
    && /^[a-z][a-z' -]{0,63}$/.test(normalized)
    && !/ {2,}|--|''/.test(normalized)
  );
}

function compareLevel(left, right) {
  return (LEVEL_ORDER[left] || 99) - (LEVEL_ORDER[right] || 99);
}

function getCoveredPos(entry = {}) {
  const explicitPos = VocabPosInference.normalizePos(entry.pos);
  const inferredPos = VocabPosInference.normalizePos(entry.inferredPos);
  const type = VocabPosInference.normalizeType(entry.type, entry.word || entry.display || entry.english);
  if (explicitPos) return explicitPos;
  if (inferredPos) return inferredPos;
  return type === "phrase" ? "phrase" : "";
}

function makeExistingPosByWord(entries = []) {
  const byWord = new Map();
  entries.forEach((entry) => {
    const word = VocabPosInference.normalizeWord(entry.word || entry.display || entry.english);
    const coveredPos = getCoveredPos(entry);
    if (!word || !coveredPos) return;
    if (!byWord.has(word)) byWord.set(word, new Set());
    byWord.get(word).add(coveredPos);
  });
  return byWord;
}

function makeOxfordOnlyMeaningTasks(input = {}) {
  const oxfordEntries = Array.isArray(input.oxfordEntries) ? input.oxfordEntries : loadOxfordEntries();
  const teacherEntries = Array.isArray(input.teacherEntries) ? input.teacherEntries : loadTeacherEntries();
  const curatedEntries = Array.isArray(input.curatedEntries) ? input.curatedEntries : loadCuratedSenseEntries();
  const existingPosByWord = makeExistingPosByWord(
    input.includeCurated === false ? teacherEntries : [...teacherEntries, ...curatedEntries]
  );
  const byWord = new Map();

  oxfordEntries.forEach((entry) => {
    const word = VocabPosInference.normalizeWord(entry.word);
    const level = String(entry.level || "").trim().toUpperCase();
    if (!isUsableOxfordWord(word) || !LEVEL_ORDER[level]) return;
    const override = OXFORD_ENTRY_OVERRIDES[word] || {};
    const oxfordPos = normalizePosList(override.pos || entry.pos);
    const existingPos = existingPosByWord.get(word) || new Set();
    const missingPos = oxfordPos.filter((pos) => !existingPos.has(pos));
    if (!missingPos.length && oxfordPos.length) return;
    const existing = byWord.get(word) || {
      id: `oxford-meaning:${word}`,
      source: "oxford",
      word,
      display: entry.display || entry.word || word,
      level,
      pos: [],
      posRaw: []
    };
    if (compareLevel(level, existing.level) < 0) existing.level = level;
    missingPos.forEach((pos) => {
      if (!existing.pos.includes(pos)) existing.pos.push(pos);
    });
    const posRaw = override.posRaw || entry.posRaw;
    if (posRaw && !existing.posRaw.includes(posRaw)) {
      existing.posRaw.push(posRaw);
    }
    byWord.set(word, existing);
  });

  return Array.from(byWord.values())
    .sort((left, right) => (
      compareLevel(left.level, right.level)
      || left.word.localeCompare(right.word)
    ));
}

function buildPrompt(tasks = []) {
  const payload = tasks.map((task) => ({
    word: task.word,
    level: task.level,
    pos: task.pos
  }));
  return [
    "You are creating a reviewed vocabulary meaning bank for Hong Kong English students.",
    "For each Oxford vocabulary item, write concise Traditional Chinese meanings.",
    "",
    "Return JSON only. No markdown.",
    "Use this exact JSON shape:",
    "{\"items\":[{\"word\":\"apple\",\"senses\":[{\"pos\":\"noun\",\"meaning\":\"蘋果\"}]}]}",
    "",
    "Rules:",
    "- Use Traditional Chinese, not Simplified Chinese.",
    "- Meanings must be short, natural, Cantonese-friendly Traditional Chinese.",
    "- Do not write examples, explanations, or full sentences.",
    "- For each supplied POS, return 1 useful student-facing meaning.",
    "- If a word has multiple important POS, keep one sense per POS.",
    "- If POS is determiner/pronoun/preposition/conjunction/modal/auxiliary/exclamation/number, still give a clear Chinese meaning.",
    "- Prefer the most common school-use meaning for the given CEFR level.",
    "- Avoid rare, adult, political, religious, violent, or confusing meanings.",
    "- Do not include English in the Chinese meaning unless it is unavoidable.",
    "",
    `Items: ${JSON.stringify(payload)}`
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
    const extracted = extractFirstJsonDocument(candidate);
    if (extracted) {
      try {
        return JSON.parse(extracted);
      } catch (_innerError) {
        return null;
      }
    }
  }
  return null;
}

function extractFirstJsonDocument(text) {
  const source = String(text || "");
  const objectStart = source.indexOf("{");
  const arrayStart = source.indexOf("[");
  const starts = [objectStart, arrayStart].filter((index) => index >= 0);
  if (!starts.length) return "";
  const start = Math.min(...starts);
  const stack = [];
  let inString = false;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }
    if (char === "{" || char === "[") {
      stack.push(char);
      continue;
    }
    if (char === "}" || char === "]") {
      const opener = stack.pop();
      const validPair = (opener === "{" && char === "}") || (opener === "[" && char === "]");
      if (!validPair) return "";
      if (!stack.length) return source.slice(start, index + 1);
    }
  }
  return "";
}

function normalizeMeaning(value) {
  return String(value || "")
    .trim()
    .replace(/\s*[/／;；]\s*/g, " / ")
    .replace(/\s+/g, " ")
    .replace(/^(?:n|v|adj|adv|prep|conj|pron|det|num|aux|exclam|modal v?)\.\s*/i, "")
    .slice(0, 80);
}

function getGeminiText(body = {}) {
  if (typeof body === "string") return body;
  if (typeof body.text === "string") return body.text;
  if (typeof body.output_text === "string") return body.output_text;
  return body?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || "")
    .join("")
    .trim() || "";
}

function getFirstArray(object, keys = []) {
  if (Array.isArray(object)) return object;
  if (!object || typeof object !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(object[key])) return object[key];
  }
  return [];
}

function getFirstValue(object, keys = []) {
  if (!object || typeof object !== "object") return "";
  for (const key of keys) {
    if (object[key] !== undefined && object[key] !== null && object[key] !== "") {
      return object[key];
    }
  }
  return "";
}

function normalizePosCandidates(value) {
  const rawValues = Array.isArray(value) ? value : [value];
  const normalized = [];
  rawValues.forEach((rawValue) => {
    String(rawValue || "")
      .split(/\s*(?:[,/／|;；]|\bor\b|\band\b)\s*/i)
      .map((part) => VocabPosInference.normalizePos(part))
      .filter(Boolean)
      .forEach((pos) => {
        if (!normalized.includes(pos)) normalized.push(pos);
      });
  });
  return normalized;
}

function getGeneratedItems(parsed) {
  const array = getFirstArray(parsed, ITEM_ARRAY_KEYS);
  if (array.length) return array;
  if (!parsed || typeof parsed !== "object") return [];
  return Object.entries(parsed)
    .filter(([key]) => !ITEM_ARRAY_KEYS.includes(key))
    .map(([word, value]) => (
      value && typeof value === "object"
        ? { word, ...value }
        : { word, meaning: value }
    ));
}

function objectPosSenses(object) {
  if (!object || typeof object !== "object" || Array.isArray(object)) return [];
  const senses = [];
  POS_VALUE_KEYS.forEach((key) => {
    if (object[key] === undefined || object[key] === null || object[key] === "") return;
    senses.push({
      pos: key,
      meaning: object[key]
    });
  });
  return senses;
}

function objectMapSenses(object) {
  if (!object || typeof object !== "object" || Array.isArray(object)) return [];
  return Object.entries(object)
    .map(([pos, meaning]) => ({
      pos,
      meaning
    }))
    .filter((sense) => VocabPosInference.normalizePos(sense.pos) && sense.meaning);
}

function getGeneratedSenses(item) {
  const senses = getFirstArray(item, SENSE_ARRAY_KEYS);
  if (senses.length) return senses;
  for (const key of SENSE_ARRAY_KEYS) {
    const mappedSenses = objectMapSenses(item?.[key]);
    if (mappedSenses.length) return mappedSenses;
  }
  const posSenses = objectPosSenses(item);
  if (posSenses.length) return posSenses;
  const meaning = getFirstValue(item, [
    "meaning",
    "chinese",
    "translation",
    "definition",
    "traditionalChinese",
    "zhHant",
    "zh",
    "tc"
  ]);
  return meaning ? [item] : [];
}

function normalizeGeneratedMeaningPayload(tasks = [], body = {}) {
  const text = getGeminiText(body);
  const parsed = parseGeminiJsonText(text);
  const items = getGeneratedItems(parsed);
  const byTask = new Map(tasks.map((task) => [task.word, task]));
  const output = new Map();

  items.forEach((item) => {
    const word = VocabPosInference.normalizeWord(getFirstValue(item, [
      "word",
      "english",
      "term",
      "vocab",
      "vocabulary",
      "item"
    ]));
    const task = byTask.get(word);
    if (!task) return;
    const allowedPos = new Set(task.pos);
    const seen = new Set();
    const itemPosCandidates = normalizePosCandidates(getFirstValue(item, [
      "pos",
      "partOfSpeech",
      "part_of_speech",
      "category",
      "grammar"
    ]));
    const senses = getGeneratedSenses(item)
      .flatMap((sense, index) => {
        const sensePosCandidates = normalizePosCandidates(getFirstValue(sense, [
          "pos",
          "partOfSpeech",
          "part_of_speech",
          "category",
          "grammar"
        ]));
        const posCandidates = sensePosCandidates.length
          ? sensePosCandidates
          : (itemPosCandidates.length ? itemPosCandidates : (task.pos.length === 1 ? [task.pos[0]] : []));
        const meaning = normalizeMeaning(getFirstValue(sense, [
          "meaning",
          "chinese",
          "translation",
          "definition",
          "traditionalChinese",
          "zhHant",
          "zh",
          "tc"
        ]));
        const type = task.word.includes(" ") ? "phrase" : "word";
        if (!meaning) return [];
        return posCandidates
          .filter((pos) => pos && (!allowedPos.size || allowedPos.has(pos)))
          .map((pos, posIndex) => {
            const key = `${pos}:${meaning}`;
            if (seen.has(key)) return null;
            seen.add(key);
            return {
              meaning,
              pos,
              type,
              level: task.level,
              sourceEntryId: posIndex ? `gemini-meaning-${index}-${posIndex}` : `gemini-meaning-${index}`
            };
          })
          .filter(Boolean);
      })
      .filter(Boolean)
      .slice(0, Math.max(1, task.pos.length || 1));
    if (senses.length) {
      output.set(word, senses);
    }
  });

  return output;
}

function normalizeSeedPayload(task, senses, status = "ready", error = "") {
  return {
    word: task.word,
    display: task.display || task.word,
    source: SOURCE,
    status,
    level: task.level,
    pos: task.pos,
    posRaw: task.posRaw,
    entries: senses,
    error: error || undefined,
    updatedAt: new Date().toISOString()
  };
}

async function callGemini(tasks, options) {
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
        parts: [{ text: buildPrompt(tasks) }]
      }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      }
    },
    {},
    { insecure: options.insecure }
  );
  if (statusCode < 200 || statusCode >= 300) {
    const details = body?.error?.message || body?.raw || `HTTP ${statusCode}`;
    throw new Error(`Gemini meaning generation failed: ${details}`);
  }
  return normalizeGeneratedMeaningPayload(tasks, body);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readGeminiSecret(project) {
  if (cachedGeminiApiKey) return cachedGeminiApiKey;
  const result = spawnSync(process.execPath, [
    FIREBASE_CLI_WRAPPER,
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

function makeMeaningId(word) {
  return crypto.createHash("sha256").update(VocabPosInference.normalizeWord(word)).digest("hex").slice(0, 24);
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
    "(function attachVocabMeaningSeed(root, data) {",
    "  if (typeof module !== \"undefined\" && module.exports) {",
    "    module.exports = data;",
    "  }",
    "  root.VOCAB_MEANING_SEED = data;",
    `})(typeof globalThis !== \"undefined\" ? globalThis : window, ${JSON.stringify(seed, null, 2)});`,
    ""
  ].join("\n");
  fs.writeFileSync(filePath, source);
}

function updateSeedMeta(seed, options = {}) {
  const values = Object.values(seed.entries || {});
  seed.meta = {
    ...(seed.meta || {}),
    generatedAt: new Date().toISOString(),
    source: SOURCE,
    entryCount: values.length,
    readyCount: values.filter((entry) => entry.status === "ready").length,
    failedCount: values.filter((entry) => entry.status === "failed").length,
    senseCount: values.reduce((total, entry) => total + (entry.entries || []).length, 0),
    model: options.model || seed.meta?.model || DEFAULT_MODEL
  };
  return seed;
}

async function uploadMeaningSeed(seed, options, tasks = []) {
  const accessToken = refreshFirebaseCliTokenIfNeeded();
  const databaseId = "(default)";
  const commitUrl = `https://firestore.googleapis.com/v1/projects/${options.project}/databases/${databaseId}/documents:commit`;
  const allowedPosByWord = new Map(tasks.map((task) => [task.word, new Set(task.pos || [])]));
  const entries = Object.values(seed.entries || {})
    .map((entry) => {
      const allowedPos = allowedPosByWord.get(entry.word);
      if (!allowedPos) return null;
      return {
        ...entry,
        entries: (entry.entries || []).filter((sense) => allowedPos.has(VocabPosInference.normalizePos(sense.pos)))
      };
    })
    .filter((entry) => entry?.status === "ready" && entry.entries?.length);
  const skipped = Object.values(seed.entries || {}).filter((entry) => (
    entry.status === "ready"
    && entry.entries?.length
    && !allowedPosByWord.has(entry.word)
  )).length;
  let uploaded = 0;
  for (let index = 0; index < entries.length; index += 450) {
    const writes = entries.slice(index, index + 450).map((payload) => {
      const meaningId = makeMeaningId(payload.word);
      const fields = {
        word: firestoreString(payload.word),
        meaningId: firestoreString(meaningId),
        source: firestoreString(FIRESTORE_CACHE_SOURCE),
        seedSource: firestoreString(SOURCE),
        status: firestoreString("ready"),
        entries: firestoreValue(payload.entries.map((entry, entryIndex) => ({
          meaning: entry.meaning,
          pos: entry.pos,
          type: entry.type || "word",
          sourceEntryId: entry.sourceEntryId || `gemini-meaning-${entryIndex}`,
          level: entry.level || payload.level || ""
        }))),
        updatedAt: { timestampValue: new Date().toISOString() }
      };
      uploaded += 1;
      return {
        update: {
          name: `projects/${options.project}/databases/${databaseId}/documents/vocabMeaningCache/${meaningId}`,
          fields
        },
        updateMask: {
          fieldPaths: Object.keys(fields)
        }
      };
    });
    await postJson(commitUrl, { writes }, accessToken);
  }
  console.log(`Uploaded ${uploaded} meaning entries to Firestore vocabMeaningCache.`);
  if (skipped) {
    console.log(`Skipped ${skipped} stale or locally covered seed entries.`);
  }
}

async function main() {
  ensureNodeExtraCaCerts();
  const options = parseArgs(process.argv.slice(2));
  const seed = loadSeed(options.out);
  seed.entries = seed.entries || {};

  const tasks = makeOxfordOnlyMeaningTasks()
    .filter((task) => !options.word || task.word === options.word)
    .filter((task) => !options.level || task.level === options.level);
  const missingTasks = tasks.filter((task) => options.force || !seed.entries[task.word]);
  const selectedTasks = options.limit ? missingTasks.slice(0, options.limit) : missingTasks;
  const levelCounts = tasks.reduce((acc, task) => {
    acc[task.level] = (acc[task.level] || 0) + 1;
    return acc;
  }, {});

  console.log(JSON.stringify({
    totalTasks: tasks.length,
    existingSeedEntries: Object.keys(seed.entries).length,
    missingTasks: missingTasks.length,
    selectedTasks: selectedTasks.length,
    levelCounts,
    output: options.out
  }, null, 2));

  if (options.dryRun) return;

  for (let index = 0; index < selectedTasks.length; index += options.batchSize) {
    const batch = selectedTasks.slice(index, index + options.batchSize);
    console.log(`[${index + 1}-${index + batch.length}/${selectedTasks.length}] ${batch.map((task) => task.word).join(", ")}`);
    let generated = new Map();
    try {
      generated = await callGemini(batch, options);
    } catch (error) {
      console.warn(`Skipping batch: ${error.message}`);
      batch.forEach((task) => {
        seed.entries[task.word] = normalizeSeedPayload(task, [], "failed", error.message);
      });
      writeSeed(options.out, updateSeedMeta(seed, options));
      continue;
    }

    batch.forEach((task) => {
      const senses = generated.get(task.word) || [];
      seed.entries[task.word] = normalizeSeedPayload(
        task,
        senses,
        senses.length ? "ready" : "failed",
        senses.length ? "" : "Gemini returned no valid senses"
      );
    });
    writeSeed(options.out, updateSeedMeta(seed, options));
    if (options.delayMs > 0 && index + options.batchSize < selectedTasks.length) {
      await sleep(options.delayMs);
    }
  }

  if (options.upload) {
    await uploadMeaningSeed(seed, options, tasks);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  DEFAULT_OUTPUT,
  SOURCE,
  buildPrompt,
  isUsableOxfordWord,
  makeMeaningId,
  makeOxfordOnlyMeaningTasks,
  normalizeGeneratedMeaningPayload,
  normalizeMeaning,
  normalizeSeedPayload,
  parseArgs,
  parseGeminiJsonText,
  uploadMeaningSeed
};
