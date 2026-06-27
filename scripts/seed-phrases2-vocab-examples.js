#!/usr/bin/env node
"use strict";

const fs = require("fs");
const https = require("https");
const path = require("path");
const { spawnSync } = require("child_process");
const VocabExampleUtils = require("../vocab_example_utils.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_INPUT = "/Users/macbook/Downloads/PHRASES-2.txt";
const DEFAULT_OUTPUT = path.join(ROOT_DIR, "vocab_example_seed.js");
const DEFAULT_PROJECT = "enguistics-grammar-game";
const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const BATCH_SIZE = 20;

function parseArgs(argv) {
  const options = {
    input: DEFAULT_INPUT,
    out: DEFAULT_OUTPUT,
    project: DEFAULT_PROJECT,
    model: DEFAULT_MODEL,
    dryRun: false,
    force: false,
    limit: 0
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") {
      options.input = path.resolve(argv[index + 1] || "");
      index += 1;
    } else if (arg === "--out") {
      options.out = path.resolve(argv[index + 1] || "");
      index += 1;
    } else if (arg === "--project") {
      options.project = argv[index + 1] || options.project;
      index += 1;
    } else if (arg === "--model") {
      options.model = argv[index + 1] || options.model;
      index += 1;
    } else if (arg === "--limit") {
      options.limit = Math.max(0, Number(argv[index + 1]) || 0);
      index += 1;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    }
  }
  return options;
}

function normalizeMeaning(value) {
  return VocabExampleUtils.normalizeMeaning(String(value || "").replace(/\s*\/\s*/g, " / "));
}

function parsePhraseFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/);
  const entries = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^\s*\*\s+(.+?)\s+\(([^)]+)\.\)\s+(.+?)\s*$/);
    if (!match) continue;
    let example = "";
    for (let next = index + 1; next < lines.length; next += 1) {
      if (lines[next].trim()) {
        example = lines[next].trim();
        break;
      }
    }
    entries.push({
      word: VocabExampleUtils.normalizeWord(match[1]),
      display: match[1].trim(),
      pos: match[2].trim() === "v" ? "verb" : match[2].trim(),
      meaning: normalizeMeaning(match[3]),
      sourceExample: example
    });
  }
  return entries;
}

function loadSeed(filePath) {
  delete require.cache[require.resolve(filePath)];
  return require(filePath);
}

function loadSenseBank() {
  delete require.cache[require.resolve(path.join(ROOT_DIR, "vocab_sense_bank.js"))];
  return require(path.join(ROOT_DIR, "vocab_sense_bank.js"));
}

function makeTask(entry, senseBank) {
  const hit = senseBank.lookup(entry.word).find((item) => item.type === "phrase" && item.pos === "verb");
  const meaning = normalizeMeaning(hit?.meaning || entry.meaning);
  const level = String(hit?.level || "B2").toUpperCase();
  const hints = VocabExampleUtils.normalizeHints([{
    meaning,
    pos: "verb",
    type: "phrase",
    level
  }]);
  return {
    ...entry,
    meaning,
    level,
    hints,
    localKey: VocabExampleUtils.getLocalCacheKey(entry.word, hints)
  };
}

function readGeminiSecret(project) {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const result = spawnSync(process.execPath, [
    path.join(ROOT_DIR, "scripts", "firebase-cli.js"),
    "functions:secrets:access",
    "GEMINI_API_KEY",
    "--project",
    project
  ], {
    cwd: ROOT_DIR,
    encoding: "utf8",
    maxBuffer: 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error(String(result.stderr || result.stdout || "Could not read GEMINI_API_KEY").trim());
  }
  return String(result.stdout || "").trim();
}

function postJson(url, payload) {
  const certificatePath = [
    process.env.NODE_EXTRA_CA_CERTS,
    "/opt/homebrew/etc/ca-certificates/cert.pem",
    "/usr/local/etc/ca-certificates/cert.pem",
    "/etc/ssl/cert.pem"
  ].filter(Boolean).find((candidate) => fs.existsSync(candidate));
  const ca = certificatePath ? fs.readFileSync(certificatePath) : undefined;
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const request = https.request(url, {
      method: "POST",
      ca,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    }, (response) => {
      let data = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { data += chunk; });
      response.on("end", () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (_error) {
          parsed = { raw: data };
        }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(parsed?.error?.message || parsed?.raw || `HTTP ${response.statusCode}`));
          return;
        }
        resolve(parsed);
      });
    });
    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

function parseJsonText(text) {
  const raw = String(text || "").trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : raw;
  try {
    return JSON.parse(candidate);
  } catch (_error) {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
  }
  return null;
}

function buildPrompt(tasks) {
  return [
    "You are preparing reviewed vocabulary examples for Hong Kong English students.",
    "For each item, translate the provided English example into natural Traditional Chinese, then add exactly two more short natural English examples with Traditional Chinese translations.",
    "Keep the phrase together in each English sentence. Use the target meaning only. Avoid adult, violent, scary, political, or religious content.",
    "Return JSON only.",
    "",
    "JSON shape:",
    "{\"items\":[{\"id\":\"...\",\"translation\":\"繁體中文。\",\"extra\":[{\"source\":\"English.\",\"target\":\"繁體中文。\"},{\"source\":\"English.\",\"target\":\"繁體中文。\"}]}]}",
    "",
    "Items:",
    JSON.stringify(tasks.map((task, index) => ({
      id: String(index),
      phrase: task.display,
      pos: "v.",
      meaning: task.meaning,
      level: task.level,
      example: task.sourceExample
    })), null, 2)
  ].join("\n");
}

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 220);
}

async function generateBatch(tasks, options) {
  const apiKey = readGeminiSecret(options.project);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${options.model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = await postJson(endpoint, {
    contents: [{
      role: "user",
      parts: [{ text: buildPrompt(tasks) }]
    }],
    generationConfig: {
      temperature: 0.35,
      topP: 0.9,
      maxOutputTokens: 8192,
      responseMimeType: "application/json"
    }
  });
  const text = body?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("");
  const parsed = parseJsonText(text);
  const items = Array.isArray(parsed?.items) ? parsed.items : [];
  const byId = new Map(items.map((item) => [String(item.id), item]));
  return tasks.map((task, index) => {
    const generated = byId.get(String(index));
    const extra = Array.isArray(generated?.extra) ? generated.extra : [];
    const examples = [
      {
        source: normalizeText(task.sourceExample),
        target: normalizeText(generated?.translation || "")
      },
      ...extra.map((example) => ({
        source: normalizeText(example.source),
        target: normalizeText(example.target)
      }))
    ].filter((example) => example.source && example.target).slice(0, 3);
    if (examples.length !== 3) {
      throw new Error(`Gemini returned ${examples.length} examples for ${task.word}`);
    }
    return { task, examples };
  });
}

function makeSeedEntry(task, examples) {
  return {
    word: task.word,
    display: task.display,
    source: "local-seed-phrases2",
    status: "ready",
    level: task.level,
    meaning: task.meaning,
    pos: "verb",
    type: "phrase",
    hints: task.hints,
    examples: examples.map((example, index) => ({
      id: `seed-${VocabExampleUtils.stableHash(`${task.localKey}:${index}:${example.source}`)}`,
      source: example.source,
      target: example.target,
      meaning: task.meaning,
      level: task.level
    }))
  };
}

function writeSeed(filePath, seed) {
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

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const seed = loadSeed(options.out);
  const senseBank = loadSenseBank();
  const allTasks = parsePhraseFile(options.input).map((entry) => makeTask(entry, senseBank));
  const missing = allTasks.filter((task) => options.force || !seed.entries?.[task.localKey]);
  const selected = options.limit ? missing.slice(0, options.limit) : missing;
  console.log(JSON.stringify({
    input: options.input,
    total: allTasks.length,
    missing: missing.length,
    selected: selected.length,
    output: options.out
  }, null, 2));
  if (options.dryRun) return;

  seed.entries = seed.entries || {};
  for (let index = 0; index < selected.length; index += BATCH_SIZE) {
    const batch = selected.slice(index, index + BATCH_SIZE);
    console.log(`[${index + 1}-${index + batch.length}/${selected.length}] ${batch[0].word} ...`);
    const generated = await generateBatch(batch, options);
    generated.forEach(({ task, examples }) => {
      seed.entries[task.localKey] = makeSeedEntry(task, examples);
    });
    const values = Object.values(seed.entries);
    seed.meta = {
      ...(seed.meta || {}),
      generatedAt: new Date().toISOString(),
      entryCount: values.length,
      readyCount: values.filter((entry) => entry.status !== "failed").length,
      failedCount: values.filter((entry) => entry.status === "failed").length,
      exampleCount: values.reduce((total, entry) => total + (entry.examples || []).length, 0),
      phrases2SeedCount: values.filter((entry) => entry.source === "local-seed-phrases2").length
    };
    seed.entries = Object.fromEntries(Object.entries(seed.entries).sort(([left], [right]) => left.localeCompare(right)));
    writeSeed(options.out, seed);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  makeTask,
  parsePhraseFile
};
