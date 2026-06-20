#!/usr/bin/env node
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const ApplyPlan = require("./apply-vocab-promote-plan.js");
const VocabPosInference = require("../vocab_pos_inference.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_INPUT = path.join(ROOT_DIR, "teacher_vocab_manual_updates.json");
const DEFAULT_PROJECT_ID = "enguistics-grammar-game";
const FIREBASE_CLI_WRAPPER = path.join(ROOT_DIR, "scripts", "firebase-cli.js");
const FIREBASE_CONFIG_PATH = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
const BATCH_LIMIT = 450;

function usage() {
  console.log([
    "Usage:",
    "  node scripts/sync-teacher-live-vocab.js [input-json] [--write] [--project enguistics-grammar-game]",
    "",
    "Inputs:",
    "  - teacher_vocab_manual_updates.json",
    "  - vocab promote plan JSON from npm run vocab:promote-plan",
    "",
    "Dry-runs by default. With --write, uploads reviewed teacher entries to Firestore teacherVocabLive.",
    "Curated entries are intentionally skipped; only teacher-approved class vocab goes to the live cloud bank."
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    input: DEFAULT_INPUT,
    project: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || DEFAULT_PROJECT_ID,
    write: false,
    source: "auto"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--write") {
      options.write = true;
      continue;
    }
    if (arg === "--project") {
      options.project = String(argv[index + 1] || DEFAULT_PROJECT_ID).trim();
      index += 1;
      continue;
    }
    if (arg === "--source") {
      options.source = String(argv[index + 1] || "auto").trim();
      index += 1;
      continue;
    }
    options.input = path.resolve(arg);
  }

  return options;
}

function normalizeWord(value) {
  return VocabPosInference.normalizeWord(value);
}

function normalizeMeaning(value) {
  return VocabPosInference.normalizeMeaning(value);
}

function normalizePos(value) {
  return VocabPosInference.normalizePos(value);
}

function normalizeType(value, word = "") {
  const typeKey = String(value || "").trim().replace(/[().]/g, "").toLowerCase();
  if (["ph", "phr", "phrase"].includes(typeKey)) return "phrase";
  if (["pt", "pattern"].includes(typeKey)) return "pattern";
  if (["modal", "modal v", "aux", "auxiliary"].includes(typeKey)) return "word";
  if (typeKey === "word") return "word";
  if (/[+*=]|名詞|動詞|形容詞|副詞|\bpp\b/i.test(normalizeWord(word))) return "pattern";
  return normalizeWord(word).includes(" ") ? "phrase" : "word";
}

function stableHash(value) {
  return crypto.createHash("sha1").update(String(value || "")).digest("hex").slice(0, 10);
}

function makeTeacherLiveEntryId(entry = {}) {
  const word = normalizeWord(entry.word || entry.display);
  const meaning = normalizeMeaning(entry.meaning);
  const pos = normalizePos(entry.pos);
  const type = normalizeType(entry.type || entry.pos, word);
  const slug = [word, pos || type || "entry", meaning]
    .join("-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 52) || "teacher-vocab";
  return `${slug}-${stableHash(`${word}|${pos}|${type}|${meaning}`)}`.slice(0, 80);
}

function normalizeAliases(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map(normalizeWord).filter(Boolean))];
  }
  return [...new Set(String(value || "")
    .split(/[,，;；|]/)
    .map(normalizeWord)
    .filter(Boolean))];
}

function normalizeTeacherEntry(raw = {}) {
  const word = normalizeWord(raw.word || raw.display);
  const meaning = normalizeMeaning(raw.meaning);
  if (!word || !meaning) return null;
  const pos = normalizePos(raw.pos);
  const type = normalizeType(raw.type || raw.pos, word);
  const display = String(raw.display || raw.word || word).trim() || word;
  const entry = {
    word,
    display,
    meaning,
    pos,
    type,
    aliases: normalizeAliases(raw.aliases || raw.alias),
    level: String(raw.level || "").trim().toUpperCase().slice(0, 2),
    source: "reviewed-teacher-bank",
    notes: normalizeMeaning(raw.notes || "").slice(0, 120),
    disabled: Boolean(raw.disabled)
  };
  const id = makeTeacherLiveEntryId(entry);
  return {
    id,
    ...Object.fromEntries(Object.entries(entry).filter(([, value]) => (
      !(typeof value === "string" && value === "")
      && !(Array.isArray(value) && value.length === 0)
    )))
  };
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function entriesFromPromotePlan(plan = {}) {
  return ApplyPlan.splitEntries(plan.entries || []).teacher;
}

function entriesFromTeacherUpdates(updateData = {}) {
  return Array.isArray(updateData.entries) ? updateData.entries : [];
}

function detectInputKind(payload = {}, filePath = "", source = "auto") {
  if (source && source !== "auto") return source;
  if (Array.isArray(payload.entries) && payload.entries.some((entry) => entry.promoteTo || entry.promote_to)) {
    return "promote-plan";
  }
  if (/promote[_-]plan/i.test(path.basename(filePath))) return "promote-plan";
  return "teacher-updates";
}

function loadTeacherLiveEntries(inputPath, options = {}) {
  const payload = loadJson(inputPath);
  const inputKind = detectInputKind(payload, inputPath, options.source || "auto");
  const rawEntries = inputKind === "promote-plan"
    ? entriesFromPromotePlan(payload)
    : entriesFromTeacherUpdates(payload);
  const seen = new Set();
  const entries = rawEntries
    .map(normalizeTeacherEntry)
    .filter(Boolean)
    .filter((entry) => {
      if (seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    });
  return {
    inputKind,
    sourceEntryCount: rawEntries.length,
    entries
  };
}

function firestoreString(value) {
  return { stringValue: String(value || "") };
}

function firestoreBoolean(value) {
  return { booleanValue: Boolean(value) };
}

function firestoreArray(values = []) {
  return {
    arrayValue: {
      values: values.map((value) => firestoreString(value))
    }
  };
}

function makeFirestoreFields(entry = {}, now = new Date()) {
  const fields = {
    word: firestoreString(entry.word),
    display: firestoreString(entry.display || entry.word),
    meaning: firestoreString(entry.meaning),
    pos: firestoreString(entry.pos || ""),
    type: firestoreString(entry.type || "word"),
    aliases: firestoreArray(entry.aliases || []),
    level: firestoreString(entry.level || ""),
    source: firestoreString(entry.source || "reviewed-teacher-bank"),
    notes: firestoreString(entry.notes || ""),
    disabled: firestoreBoolean(entry.disabled),
    updatedAt: { timestampValue: now.toISOString() },
    updatedBy: firestoreString("teacher-review-sync")
  };
  return fields;
}

function makeFirestoreWrite(entry = {}, project = DEFAULT_PROJECT_ID, now = new Date()) {
  const fields = makeFirestoreFields(entry, now);
  return {
    update: {
      name: `projects/${project}/databases/(default)/documents/teacherVocabLive/${entry.id}`,
      fields
    },
    updateMask: {
      fieldPaths: Object.keys(fields)
    }
  };
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
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        "Authorization": `Bearer ${accessToken}`
      },
      ca: getCertificate()
    }, (response) => {
      let responseBody = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        responseBody += chunk;
      });
      response.on("end", () => {
        const bodyJson = parseResponseBody(responseBody);
        if ((response.statusCode || 0) >= 200 && (response.statusCode || 0) < 300) {
          resolve(bodyJson);
          return;
        }
        reject(new Error(`Firestore REST request failed (${response.statusCode}): ${JSON.stringify(bodyJson)}`));
      });
    });
    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

async function uploadTeacherLiveEntries(entries = [], options = {}) {
  if (!entries.length) return { uploaded: 0 };
  const project = options.project || DEFAULT_PROJECT_ID;
  const accessToken = refreshFirebaseCliTokenIfNeeded();
  const commitUrl = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:commit`;
  let uploaded = 0;
  for (let index = 0; index < entries.length; index += BATCH_LIMIT) {
    const batch = entries.slice(index, index + BATCH_LIMIT);
    const now = new Date();
    const writes = batch.map((entry) => makeFirestoreWrite(entry, project, now));
    await postJson(commitUrl, { writes }, accessToken);
    uploaded += batch.length;
  }
  return { uploaded };
}

async function syncTeacherLiveVocab(options = {}) {
  const source = loadTeacherLiveEntries(options.input || DEFAULT_INPUT, options);
  const summary = {
    input: path.relative(ROOT_DIR, options.input || DEFAULT_INPUT),
    inputKind: source.inputKind,
    sourceEntryCount: source.sourceEntryCount,
    uploadEntryCount: source.entries.length,
    write: Boolean(options.write),
    project: options.project || DEFAULT_PROJECT_ID,
    sample: source.entries.slice(0, 8).map((entry) => ({
      id: entry.id,
      word: entry.word,
      pos: entry.pos || "",
      type: entry.type || "",
      meaning: entry.meaning
    }))
  };

  if (options.write) {
    const upload = await uploadTeacherLiveEntries(source.entries, options);
    summary.uploaded = upload.uploaded;
  }
  return summary;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const summary = await syncTeacherLiveVocab(options);
  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  detectInputKind,
  entriesFromPromotePlan,
  entriesFromTeacherUpdates,
  loadTeacherLiveEntries,
  makeFirestoreFields,
  makeFirestoreWrite,
  makeTeacherLiveEntryId,
  normalizeTeacherEntry,
  parseArgs,
  syncTeacherLiveVocab
};
