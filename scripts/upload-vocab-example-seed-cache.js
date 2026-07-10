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
const DEFAULT_SEED = path.join(ROOT_DIR, "vocab_example_seed.js");
const FIREBASE_CLI_WRAPPER = path.join(ROOT_DIR, "scripts", "firebase-cli.js");
const FIREBASE_CONFIG_PATH = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
const DEFAULT_PROJECT = "enguistics-grammar-game";
const DATABASE_ID = "(default)";
const BATCH_SIZE = 450;
const LOCAL_SEED_EXAMPLE_SOURCE = "local-seed-gemini";

function usage() {
  console.log([
    "Usage:",
    "  node scripts/upload-vocab-example-seed-cache.js [options]",
    "",
    "Options:",
    "  --dry-run          Count upload documents without writing.",
    "  --seed <file>      Seed JS file. Defaults to vocab_example_seed.js.",
    "  --project <id>     Firebase project. Defaults to enguistics-grammar-game.",
    "  --limit <n>        Upload only the first n unique cache documents.",
    "  --offset <n>       Skip the first n unique cache documents.",
    "",
    "Uploads existing reviewed seed examples to Firestore vocabExampleCache.",
    "This script never calls AI generation."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    limit: 0,
    offset: 0,
    project: DEFAULT_PROJECT,
    seed: DEFAULT_SEED
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
    if (arg === "--limit") {
      options.limit = Math.max(0, Number(argv[index + 1]) || 0);
      index += 1;
      continue;
    }
    if (arg === "--offset") {
      options.offset = Math.max(0, Number(argv[index + 1]) || 0);
      index += 1;
      continue;
    }
    if (arg === "--project") {
      options.project = argv[index + 1] || DEFAULT_PROJECT;
      index += 1;
      continue;
    }
    if (arg === "--seed") {
      options.seed = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function getCertificate() {
  const candidates = [
    process.env.NODE_EXTRA_CA_CERTS,
    "/tmp/macos-all-certs.pem",
    "/opt/homebrew/etc/ca-certificates/cert.pem",
    "/usr/local/etc/ca-certificates/cert.pem",
    "/etc/ssl/cert.pem"
  ].filter(Boolean);
  const certificatePath = candidates.find((candidate) => fs.existsSync(candidate));
  return certificatePath ? fs.readFileSync(certificatePath) : undefined;
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
  if (config.tokens?.access_token && expiresAt > Date.now() + 60000) {
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

  const refreshedToken = readFirebaseCliConfig().tokens?.access_token;
  if (!refreshedToken) throw new Error("Firebase CLI token was not found after refresh.");
  return refreshedToken;
}

function parseResponseBody(responseBody) {
  if (!responseBody) return {};
  try {
    return JSON.parse(responseBody);
  } catch (_error) {
    return { raw: responseBody };
  }
}

function postJson(url, payload, accessToken) {
  const body = JSON.stringify(payload);
  const requestUrl = new URL(url);
  return new Promise((resolve, reject) => {
    const request = https.request({
      method: "POST",
      hostname: requestUrl.hostname,
      path: `${requestUrl.pathname}${requestUrl.search}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      },
      ca: getCertificate()
    }, (response) => {
      let responseBody = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        responseBody += chunk;
      });
      response.on("end", () => {
        const parsed = parseResponseBody(responseBody);
        if ((response.statusCode || 0) >= 200 && (response.statusCode || 0) < 300) {
          resolve(parsed);
          return;
        }
        reject(new Error(`Firestore REST request failed (${response.statusCode}): ${JSON.stringify(parsed)}`));
      });
    });
    request.on("error", reject);
    request.write(body);
    request.end();
  });
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

function loadSeed(seedPath) {
  if (!fs.existsSync(seedPath)) throw new Error(`Seed file not found: ${seedPath}`);
  delete require.cache[require.resolve(seedPath)];
  return require(seedPath);
}

function makeCacheId(cloudCacheKey) {
  return crypto.createHash("sha256")
    .update(VocabExampleUtils.normalizeWord(cloudCacheKey))
    .digest("hex")
    .slice(0, 24);
}

function inferType(word, payload = {}) {
  return String(payload.type || "").trim().toLowerCase() || (VocabExampleUtils.normalizeWord(word).includes(" ") ? "phrase" : "word");
}

function getEntryHints(localKey, payload = {}) {
  if (Array.isArray(payload.hints) && payload.hints.length) {
    return VocabExampleUtils.normalizeHints(payload.hints);
  }
  const word = VocabExampleUtils.normalizeWord(payload.word || payload.display || String(localKey).split("|")[0]);
  if (!payload.meaning) return [];
  return VocabExampleUtils.normalizeHints([{
    meaning: payload.meaning,
    pos: payload.pos || "",
    type: inferType(word, payload),
    level: payload.level || ""
  }]);
}

function normalizeExample(example = {}) {
  return {
    source: String(example.source || "").trim().replace(/\s+/g, " ").slice(0, 180),
    target: String(example.target || "").trim().replace(/\s+/g, " ").slice(0, 180),
    meaning: VocabExampleUtils.normalizeMeaning(example.meaning || ""),
    sourceEntryId: String(example.sourceEntryId || example.id || "").trim().slice(0, 120)
  };
}

function buildUploadDocuments(seed = {}) {
  const documents = new Map();
  let skipped = 0;
  let collisions = 0;
  Object.entries(seed.entries || {}).forEach(([localKey, payload]) => {
    const word = VocabExampleUtils.normalizeWord(payload.word || payload.display || String(localKey).split("|")[0]);
    const examples = (Array.isArray(payload.examples) ? payload.examples : [])
      .map(normalizeExample)
      .filter((example) => example.source && example.target)
      .slice(0, 3);
    if (!word || payload.status === "failed" || !examples.length) {
      skipped += 1;
      return;
    }
    const hints = getEntryHints(localKey, payload);
    const cloudKey = VocabExampleUtils.getCloudCacheKey(word, hints);
    const exampleId = makeCacheId(cloudKey);
    const doc = {
      word,
      exampleId,
      cacheKey: cloudKey,
      localKey,
      hints,
      source: payload.source || LOCAL_SEED_EXAMPLE_SOURCE,
      status: payload.status || "ready",
      level: String(payload.level || "").trim().toUpperCase(),
      examples
    };
    if (documents.has(exampleId)) collisions += 1;
    documents.set(exampleId, doc);
  });
  return {
    documents: Array.from(documents.values()),
    skipped,
    collisions
  };
}

function makeWrite(project, doc) {
  const fields = {
    word: firestoreString(doc.word),
    exampleId: firestoreString(doc.exampleId),
    cacheKey: firestoreString(doc.cacheKey),
    localKey: firestoreString(doc.localKey),
    hints: firestoreValue(doc.hints),
    source: firestoreString(doc.source || LOCAL_SEED_EXAMPLE_SOURCE),
    status: firestoreString(doc.status || "ready"),
    level: firestoreString(doc.level || ""),
    examples: firestoreValue(doc.examples),
    updatedAt: { timestampValue: new Date().toISOString() }
  };
  return {
    update: {
      name: `projects/${project}/databases/${DATABASE_ID}/documents/vocabExampleCache/${doc.exampleId}`,
      fields
    },
    updateMask: {
      fieldPaths: Object.keys(fields)
    }
  };
}

async function uploadDocuments(documents, options) {
  const accessToken = refreshFirebaseCliTokenIfNeeded();
  const commitUrl = `https://firestore.googleapis.com/v1/projects/${options.project}/databases/${DATABASE_ID}/documents:commit`;
  let uploaded = 0;
  for (let index = 0; index < documents.length; index += BATCH_SIZE) {
    const batch = documents.slice(index, index + BATCH_SIZE);
    await postJson(commitUrl, {
      writes: batch.map((doc) => makeWrite(options.project, doc))
    }, accessToken);
    uploaded += batch.length;
    console.log(`Uploaded ${uploaded}/${documents.length} vocab example cache documents...`);
  }
  return uploaded;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const seed = loadSeed(options.seed);
  const result = buildUploadDocuments(seed);
  const selected = result.documents.slice(options.offset, options.limit ? options.offset + options.limit : undefined);
  const summary = {
    dryRun: options.dryRun,
    project: options.project,
    seed: options.seed,
    seedEntryCount: Object.keys(seed.entries || {}).length,
    seedExampleCount: Object.values(seed.entries || {}).reduce((total, entry) => total + (Array.isArray(entry.examples) ? entry.examples.length : 0), 0),
    uniqueCloudDocuments: result.documents.length,
    selectedDocuments: selected.length,
    skipped: result.skipped,
    collisionsDeduped: result.collisions
  };
  console.log(JSON.stringify(summary, null, 2));
  if (options.dryRun) return;
  const uploaded = await uploadDocuments(selected, options);
  console.log(`Uploaded ${uploaded} seed entries to Firestore vocabExampleCache.`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  });
}

module.exports = {
  buildUploadDocuments,
  getEntryHints,
  makeCacheId
};
