const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const { HttpsError } = require("firebase-functions/v2/https");
const { ImageAnnotatorClient } = require("@google-cloud/vision");
const { GoogleGenAI } = require("@google/genai");

const IMPORT_PATH = "vocab-imports";
const MAX_FILES = 12;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
const MAX_DETECTED_WORDS = 3000;
const OCR_CHUNK_CHARACTERS = 6500;
const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/tiff"
]);
const VISUAL_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
]);
const POS_ALIASES = {
  n: "noun",
  noun: "noun",
  v: "verb",
  verb: "verb",
  adj: "adjective",
  adjective: "adjective",
  adv: "adverb",
  adverb: "adverb",
  prep: "preposition",
  preposition: "preposition",
  conj: "conjunction",
  conjunction: "conjunction",
  pron: "pronoun",
  pronoun: "pronoun",
  det: "determiner",
  determiner: "determiner",
  modal: "modal",
  aux: "auxiliary",
  auxiliary: "auxiliary",
  phrase: "phrase",
  ph: "phrase",
  pattern: "pattern"
};
const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    documentMode: {
      type: "string",
      enum: ["VOCAB_TABLE", "HIGHLIGHTED_PASSAGE", "VOCAB_NOTES", "NO_VOCAB"]
    },
    entries: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          word: { type: "string" },
          pos: { type: "string" },
          type: { type: "string", enum: ["word", "phrase", "pattern"] },
          chineseMeaning: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 }
        },
        required: ["word", "pos", "type", "chineseMeaning", "confidence"]
      }
    }
  },
  required: ["documentMode", "entries"]
};

let visionClient;
let generativeClient;
let pdfJsPromise;

function cleanText(value, maxLength = 200) {
  return String(value ?? "").replace(/\r\n?/g, "\n").trim().slice(0, maxLength);
}

function normalizeWord(value) {
  return cleanText(value, 80)
    .replace(/[’‘]/g, "'")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/^[^a-z]+|[^a-z]+$/g, "")
    .slice(0, 64);
}

function displayWord(value) {
  return cleanText(value, 80)
    .replace(/[’‘]/g, "'")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "")
    .slice(0, 64);
}

function normalizeType(value, word = "") {
  const type = cleanText(value, 20).toLowerCase();
  if (["word", "phrase", "pattern"].includes(type)) return type;
  return normalizeWord(word).includes(" ") ? "phrase" : "word";
}

function normalizePos(value, type = "") {
  const key = cleanText(value, 30).replace(/[().]/g, "").toLowerCase();
  if (POS_ALIASES[key]) return POS_ALIASES[key];
  if (type === "phrase") return "phrase";
  if (type === "pattern") return "pattern";
  return "";
}

function normalizeDetectedEntry(raw = {}) {
  const word = normalizeWord(raw.word || raw.headword || raw.english);
  const display = displayWord(raw.word || raw.headword || raw.english || word);
  const type = normalizeType(raw.type, word);
  const pos = normalizePos(raw.pos || raw.partOfSpeech, type);
  const rawMeaning = cleanText(
    raw.meaning || raw.chineseMeaning || raw.traditionalChinese,
    100
  ).replace(/\s+/g, " ");
  const meaning = /[\u3400-\u9fff]/u.test(rawMeaning) ? rawMeaning : "";
  const confidence = Number(raw.confidence);
  if (!word || !display || !/^[a-z][a-z' -]*$/i.test(word)) return null;
  if (Number.isFinite(confidence) && confidence < 0.72) return null;
  return {
    word,
    display,
    meaning,
    pos,
    type,
    confidence: Number.isFinite(confidence) ? confidence : 0.85
  };
}

function meaningKey(entry = {}) {
  return [
    normalizePos(entry.pos, entry.type),
    cleanText(entry.meaning, 100).replace(/[\s/／]+/g, "").toLowerCase()
  ].join("|");
}

function groupDetectedEntries(rawEntries = []) {
  const groups = new Map();
  rawEntries.map(normalizeDetectedEntry).filter(Boolean).forEach((entry) => {
    const group = groups.get(entry.word) || {
      word: entry.word,
      display: entry.display,
      meanings: [],
      confidence: entry.confidence,
      suggestedPos: entry.pos,
      suggestedType: entry.type
    };
    if (entry.meaning && entry.pos) {
      const key = meaningKey(entry);
      if (!group.meanings.some((meaning) => meaningKey(meaning) === key)) {
        group.meanings.push({
          meaning: entry.meaning,
          pos: entry.pos,
          type: entry.type,
          source: "uploaded-note"
        });
      }
    }
    group.confidence = Math.max(group.confidence, entry.confidence);
    group.suggestedPos ||= entry.pos;
    group.suggestedType ||= entry.type;
    groups.set(entry.word, group);
  });
  return [...groups.values()].slice(0, MAX_DETECTED_WORDS);
}

function validateJobId(value) {
  const jobId = cleanText(value, 80);
  if (!/^import-[a-z0-9-]{12,72}$/i.test(jobId)) {
    throw new HttpsError("invalid-argument", "Invalid import job.");
  }
  return jobId;
}

function normalizeRequestedFiles(uid, jobId, rawFiles) {
  if (!Array.isArray(rawFiles) || !rawFiles.length || rawFiles.length > MAX_FILES) {
    throw new HttpsError("invalid-argument", `Choose between 1 and ${MAX_FILES} files.`);
  }
  const prefix = `${IMPORT_PATH}/${uid}/${jobId}/`;
  let totalBytes = 0;
  const files = rawFiles.map((raw, index) => {
    const storagePath = cleanText(raw?.storagePath, 500);
    const mimeType = cleanText(raw?.mimeType, 80).toLowerCase();
    const size = Number(raw?.size) || 0;
    if (!storagePath.startsWith(prefix) || storagePath.includes("..")) {
      throw new HttpsError("permission-denied", "Import file path is not owned by this account.");
    }
    if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
      throw new HttpsError(
        "invalid-argument",
        "Only PDF, JPEG, PNG, WEBP, and TIFF files are supported."
      );
    }
    if (size <= 0 || size > MAX_FILE_BYTES) {
      throw new HttpsError("invalid-argument", "An import file is too large.");
    }
    totalBytes += size;
    return {
      index,
      storagePath,
      mimeType,
      size,
      originalName: cleanText(raw?.originalName, 120)
    };
  });
  if (totalBytes > MAX_TOTAL_BYTES) {
    throw new HttpsError("invalid-argument", "The selected files exceed the 50 MB import limit.");
  }
  return files;
}

function getVisionClient() {
  visionClient ||= new ImageAnnotatorClient();
  return visionClient;
}

function getGenerativeClient() {
  if (generativeClient) return generativeClient;
  const project = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
  if (!project) throw new Error("Google Cloud project is unavailable.");
  generativeClient = new GoogleGenAI({
    vertexai: true,
    project,
    location: process.env.VOCAB_IMPORT_VERTEX_LOCATION || "global",
    apiVersion: "v1"
  });
  return generativeClient;
}

async function updateJob(uid, jobId, patch = {}) {
  await admin.firestore()
    .collection("users")
    .doc(uid)
    .collection("vocabImportJobs")
    .doc(jobId)
    .set({ ...patch, updatedAt: Date.now() }, { merge: true });
}

async function resolveStorageBucket() {
  const project = process.env.GCLOUD_PROJECT || "enguistics-grammar-game";
  const candidates = [
    admin.app().options.storageBucket,
    `${project}.firebasestorage.app`,
    `${project}.appspot.com`
  ].filter(Boolean);
  let lastError;
  for (const name of new Set(candidates)) {
    const bucket = admin.storage().bucket(name);
    try {
      await bucket.getMetadata();
      return bucket;
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Firebase Storage bucket is unavailable: ${lastError?.message || "unknown"}`);
}

async function verifyFiles(bucket, files) {
  const verified = [];
  let totalBytes = 0;
  for (const item of files) {
    const file = bucket.file(item.storagePath);
    const [exists] = await file.exists();
    if (!exists) throw new HttpsError("not-found", "An uploaded import file is missing.");
    const [metadata] = await file.getMetadata();
    const actualSize = Number(metadata.size) || 0;
    const actualMime = cleanText(metadata.contentType, 80).toLowerCase();
    if (actualSize <= 0 || actualSize > MAX_FILE_BYTES) {
      throw new HttpsError("invalid-argument", "An uploaded import file is too large.");
    }
    totalBytes += actualSize;
    if (totalBytes > MAX_TOTAL_BYTES) {
      throw new HttpsError("invalid-argument", "The uploaded files exceed the 50 MB import limit.");
    }
    if (actualMime && actualMime !== item.mimeType) {
      throw new HttpsError("invalid-argument", "An uploaded import file type does not match.");
    }
    verified.push({
      ...item,
      file,
      actualSize,
      gcsUri: `gs://${bucket.name}/${item.storagePath}`
    });
  }
  return verified;
}

async function getPdfJs() {
  pdfJsPromise ||= import("pdfjs-dist/legacy/build/pdf.mjs");
  return pdfJsPromise;
}

async function extractEmbeddedPdfPages(item) {
  const [content] = await item.file.download();
  const pdfjs = await getPdfJs();
  const document = await pdfjs.getDocument({
    data: new Uint8Array(content),
    disableFontFace: true,
    isEvalSupported: false,
    useWorkerFetch: false
  }).promise;
  const pages = [];
  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const contentItems = await page.getTextContent();
      const text = cleanText(
        (contentItems.items || []).map((part) => (
          `${part.str || ""}${part.hasEOL ? "\n" : " "}`
        )).join("").replace(/[ \t]+\n/g, "\n").replace(/[ \t]{2,}/g, " "),
        120000
      );
      if (text) pages.push({ fileIndex: item.index, pageNumber, text });
      page.cleanup();
    }
  } finally {
    await document.destroy().catch(() => {});
  }
  const combined = pages.map((page) => page.text).join("\n");
  const latinWords = combined.match(/\b[a-z][a-z'-]{1,}\b/gi) || [];
  return combined.length >= 40 && latinWords.length >= 3 ? pages : [];
}

function extractVisionPages(payload = {}, fileIndex = 0) {
  return (Array.isArray(payload.responses) ? payload.responses : [])
    .map((response, index) => ({
      fileIndex,
      pageNumber: Number(response?.context?.pageNumber) || index + 1,
      text: cleanText(response?.fullTextAnnotation?.text, 120000)
    }))
    .filter((page) => page.text);
}

async function ocrImage(item) {
  const [result] = await getVisionClient().documentTextDetection({
    image: { source: { imageUri: item.gcsUri } },
    imageContext: { languageHints: ["en", "zh-Hant"] }
  });
  const text = cleanText(result?.fullTextAnnotation?.text, 120000);
  return text ? [{ fileIndex: item.index, pageNumber: 1, text }] : [];
}

async function ocrDocument(bucket, uid, jobId, item) {
  const outputPrefix = `${IMPORT_PATH}/${uid}/${jobId}/_ocr/${item.index}/`;
  const [operation] = await getVisionClient().asyncBatchAnnotateFiles({
    requests: [{
      inputConfig: {
        gcsSource: { uri: item.gcsUri },
        mimeType: item.mimeType
      },
      features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
      outputConfig: {
        gcsDestination: { uri: `gs://${bucket.name}/${outputPrefix}` },
        batchSize: 20
      }
    }]
  });
  await operation.promise();
  const [files] = await bucket.getFiles({ prefix: outputPrefix });
  const pages = [];
  for (const file of files.sort((left, right) => left.name.localeCompare(right.name))) {
    const [content] = await file.download();
    pages.push(...extractVisionPages(JSON.parse(content.toString("utf8")), item.index));
  }
  await Promise.all(files.map((file) => file.delete({ ignoreNotFound: true }).catch(() => {})));
  return pages;
}

async function runOcr(bucket, uid, jobId, files) {
  const pages = [];
  for (let index = 0; index < files.length; index += 1) {
    const item = files[index];
    let extracted = [];
    if (item.mimeType === "application/pdf") {
      try {
        extracted = await extractEmbeddedPdfPages(item);
      } catch (error) {
        logger.info("[Vocab Import] PDF text layer unavailable; using OCR", {
          storagePath: item.storagePath,
          message: error?.message || String(error)
        });
      }
    }
    if (!extracted.length) {
      extracted = item.mimeType === "application/pdf" || item.mimeType === "image/tiff"
        ? await ocrDocument(bucket, uid, jobId, item)
        : await ocrImage(item);
    }
    pages.push(...extracted);
    await updateJob(uid, jobId, {
      step: "OCR",
      stepIndex: 2,
      progress: Math.round(((index + 1) / files.length) * 100),
      detail: `掃描筆記 ${index + 1} / ${files.length}`
    });
  }
  return pages;
}

function buildOcrChunks(pages = []) {
  const chunks = [];
  let current = "";
  pages.forEach((page) => {
    const block = `[DOCUMENT ${Number(page.fileIndex) + 1} // PAGE ${page.pageNumber}]\n${page.text}`;
    if (current && current.length + block.length > OCR_CHUNK_CHARACTERS) {
      chunks.push(current);
      current = "";
    }
    current += `${current ? "\n\n" : ""}${block}`;
  });
  if (current) chunks.push(current);
  return chunks;
}

function buildOcrAnalysisTasks(pages = [], files = []) {
  const grouped = new Map();
  pages.forEach((page) => {
    const list = grouped.get(page.fileIndex) || [];
    list.push(page);
    grouped.set(page.fileIndex, list);
  });
  return [...grouped.entries()].flatMap(([fileIndex, filePages]) => {
    const file = files.find((candidate) => candidate.index === fileIndex) || {};
    return buildOcrChunks(filePages).map((ocrText) => ({
      fileIndex,
      ocrText,
      gcsUri: file.gcsUri || "",
      mimeType: file.mimeType || ""
    }));
  });
}

function buildAiPrompt(ocrText) {
  return `You are extracting English vocabulary selected by a teacher or student from study notes.

Return JSON only. Classify the page as VOCAB_TABLE, HIGHLIGHTED_PASSAGE, VOCAB_NOTES, or NO_VOCAB.

1. For a vocabulary table, list, worksheet vocabulary box, spreadsheet, or grid, extract every English vocabulary row. A blank Chinese cell does not mean the English item should be omitted.
2. For continuous prose, articles, comprehension passages, or ordinary paragraphs, extract only English words or phrases visibly covered by coloured highlighter ink. Never extract unhighlighted passage text.
3. For handwritten or typed vocabulary notes, extract the listed vocabulary items.
4. Do not treat headings, dates, page numbers, instructions, examples, student names, or ordinary body text as vocabulary.
5. Keep phrasal verbs, idioms, collocations, and grammar patterns together.
6. Copy a nearby Traditional Chinese meaning when it is present. Leave chineseMeaning empty when the note has none; do not invent or translate it.
7. Infer a standard part of speech. Correct an obvious OCR spelling error only when the note context makes it certain. Omit unreadable content and deduplicate repeated items.

OCR TEXT:
${ocrText}`;
}

function parseModelPayload(value) {
  const text = cleanText(value, 500000)
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const parsed = JSON.parse(text);
  return Array.isArray(parsed?.entries) ? parsed.entries : [];
}

async function analyseTask(task) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const parts = [];
      if (task.gcsUri && VISUAL_MIME_TYPES.has(task.mimeType)) {
        parts.push({ fileData: { fileUri: task.gcsUri, mimeType: task.mimeType } });
      }
      parts.push({ text: buildAiPrompt(task.ocrText) });
      const result = await getGenerativeClient().models.generateContent({
        model: process.env.VOCAB_IMPORT_MODEL || "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
        config: {
          temperature: 0,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseJsonSchema: ANALYSIS_SCHEMA
        }
      });
      return parseModelPayload(result?.text);
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 700));
    }
  }
  throw lastError;
}

async function analysePages(uid, jobId, pages, files) {
  const tasks = buildOcrAnalysisTasks(pages, files);
  const entries = [];
  for (let index = 0; index < tasks.length; index += 1) {
    entries.push(...await analyseTask(tasks[index]));
    await updateJob(uid, jobId, {
      step: "AI_ANALYSIS",
      stepIndex: 3,
      progress: Math.round(((index + 1) / tasks.length) * 100),
      detail: `分析詞彙 ${index + 1} / ${tasks.length}`
    });
  }
  return groupDetectedEntries(entries);
}

function normalizeTeacherSense(document) {
  const data = document.data() || {};
  if (data.disabled === true) return null;
  const word = normalizeWord(data.word || data.display);
  const type = normalizeType(data.type, word);
  const pos = normalizePos(data.pos || data.inferredPos, type);
  const meaning = cleanText(data.meaning, 100).replace(/\s+/g, " ");
  if (!word || !meaning || !pos || !/[\u3400-\u9fff]/u.test(meaning)) return null;
  return {
    word,
    display: displayWord(data.display || data.word || word),
    meaning,
    pos,
    type,
    level: cleanText(data.level, 8).toUpperCase(),
    source: "teacher-live",
    sourceEntryId: document.id
  };
}

async function loadTeacherMeanings(words) {
  const byWord = new Map();
  for (let offset = 0; offset < words.length; offset += 30) {
    const batch = words.slice(offset, offset + 30);
    const snapshot = await admin.firestore()
      .collection("teacherVocabLive")
      .where("word", "in", batch)
      .get();
    snapshot.docs.forEach((document) => {
      const sense = normalizeTeacherSense(document);
      if (!sense) return;
      const senses = byWord.get(sense.word) || [];
      if (!senses.some((entry) => meaningKey(entry) === meaningKey(sense))) senses.push(sense);
      byWord.set(sense.word, senses);
    });
  }
  return byWord;
}

async function resolveReviewedEntries(uid, jobId, detected) {
  const teacherMeanings = await loadTeacherMeanings(detected.map((entry) => entry.word));
  const entries = detected.map((entry) => {
    const approved = teacherMeanings.get(entry.word) || [];
    return {
      word: entry.word,
      display: approved[0]?.display || entry.display,
      meanings: approved.length ? approved : entry.meanings
    };
  });
  await updateJob(uid, jobId, {
    step: "CLOUD_VOCAB_BANK",
    stepIndex: 4,
    progress: 100,
    detail: `已配對 ${teacherMeanings.size} 個老師字庫詞彙`,
    detectedCount: entries.length
  });
  return entries;
}

async function deleteImportFiles(bucket, uid, jobId) {
  if (!bucket) return;
  await bucket.deleteFiles({
    prefix: `${IMPORT_PATH}/${uid}/${jobId}/`,
    force: true
  }).catch((error) => logger.warn("[Vocab Import] Temporary cleanup failed", {
    uid,
    jobId,
    message: error?.message || String(error)
  }));
}

async function processVocabImport(request) {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in before importing vocab.");
  const jobId = validateJobId(request.data?.jobId);
  const requestedFiles = normalizeRequestedFiles(uid, jobId, request.data?.files);
  let bucket;
  try {
    await updateJob(uid, jobId, {
      status: "processing",
      step: "VERIFYING_UPLOAD",
      stepIndex: 1,
      progress: 0,
      detail: "核對安全上傳",
      startedAt: Date.now()
    });
    bucket = await resolveStorageBucket();
    const verifiedFiles = await verifyFiles(bucket, requestedFiles);
    await updateJob(uid, jobId, {
      step: "OCR",
      stepIndex: 2,
      progress: 0,
      detail: "準備掃描文件"
    });
    const pages = await runOcr(bucket, uid, jobId, verifiedFiles);
    if (!pages.length) {
      throw new HttpsError("failed-precondition", "No readable vocab text was detected.");
    }
    await updateJob(uid, jobId, {
      step: "AI_ANALYSIS",
      stepIndex: 3,
      progress: 0,
      detail: `分析 ${pages.length} 頁筆記`
    });
    const detected = await analysePages(uid, jobId, pages, verifiedFiles);
    if (!detected.length) {
      throw new HttpsError("failed-precondition", "No selected vocabulary was detected.");
    }
    await updateJob(uid, jobId, {
      step: "CLOUD_VOCAB_BANK",
      stepIndex: 4,
      progress: 0,
      detail: "配對已審核詞彙庫"
    });
    const entries = await resolveReviewedEntries(uid, jobId, detected);
    await updateJob(uid, jobId, {
      status: "ready",
      step: "READY_TO_SAVE",
      stepIndex: 5,
      progress: 0,
      detail: `${entries.length} 個詞彙準備儲存`,
      detectedCount: entries.length,
      completedAt: Date.now()
    });
    return { ok: true, jobId, detectedCount: entries.length, entries };
  } catch (error) {
    logger.error("[Vocab Import] Processing failed", {
      uid,
      jobId,
      code: error?.code || null,
      errorMessage: error?.message || String(error),
      errorStack: cleanText(error?.stack, 3000)
    });
    await updateJob(uid, jobId, {
      status: "failed",
      step: "FAILED",
      detail: cleanText(error?.message || "IMPORT FAILED", 160),
      failedAt: Date.now()
    }).catch(() => {});
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Vocab analysis could not be completed.");
  } finally {
    await deleteImportFiles(bucket, uid, jobId);
  }
}

module.exports = {
  MAX_DETECTED_WORDS,
  buildAiPrompt,
  buildOcrAnalysisTasks,
  buildOcrChunks,
  extractEmbeddedPdfPages,
  groupDetectedEntries,
  normalizeDetectedEntry,
  normalizeRequestedFiles,
  processVocabImport,
  validateJobId
};
