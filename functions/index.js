const crypto = require("crypto");
const admin = require("firebase-admin");
const { HttpsError, onCall } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");

admin.initializeApp();
setGlobalOptions({ region: "asia-east2" });

const db = admin.firestore();
const bucket = admin.storage().bucket();

const AZURE_SPEECH_KEY = defineSecret("AZURE_SPEECH_KEY");
const AZURE_SPEECH_REGION = defineSecret("AZURE_SPEECH_REGION");
const AZURE_TRANSLATOR_KEY = defineSecret("AZURE_TRANSLATOR_KEY");
const AZURE_TRANSLATOR_REGION = defineSecret("AZURE_TRANSLATOR_REGION");
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

const DEFAULT_VOICE = "en-US-AndrewMultilingualNeural";
const DEFAULT_OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";
const MAX_WORD_LENGTH = 64;
const MAX_AUDIO_TEXT_LENGTH = 220;
const AZURE_TRANSLATOR_ENDPOINT = "https://api.cognitive.microsofttranslator.com";
const AZURE_TRANSLATOR_API_VERSION = "3.0";
const AZURE_TRANSLATOR_SOURCE = "en";
const AZURE_TRANSLATOR_TARGET = "zh-Hant";
const AZURE_DICTIONARY_TARGET = "zh-Hans";
const AZURE_DICTIONARY_ENTRY_LIMIT = 8;
const AZURE_DICTIONARY_EXAMPLE_PAIR_LIMIT = 6;
const AZURE_DICTIONARY_EXAMPLE_LIMIT = 4;
const GEMINI_EXAMPLE_MODEL = "gemini-3.1-flash-lite";
const GEMINI_EXAMPLE_SOURCE = "gemini-generated-examples";
const GEMINI_EXAMPLE_LIMIT = 3;
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";

const CURATED_VOCAB_MEANINGS = new Map([
  ["have", [
    { meaning: "有", pos: "verb" },
    { meaning: "食 / 飲", pos: "verb" },
    { meaning: "上 / 參加", pos: "verb", level: "A2" }
  ]],
  ["has", [
    { meaning: "有", pos: "verb" },
    { meaning: "食 / 飲", pos: "verb" }
  ]],
  ["had", [
    { meaning: "有過", pos: "verb" },
    { meaning: "食咗 / 飲咗", pos: "verb" }
  ]],
  ["have to", [{ meaning: "必須 / 要", type: "phrase" }]],
  ["has to", [{ meaning: "必須 / 要", type: "phrase" }]],
  ["had to", [{ meaning: "必須 / 要", type: "phrase" }]],
  ["go", [
    { meaning: "去", pos: "verb" },
    { meaning: "變成", pos: "verb", level: "A2" },
    { meaning: "運作 / 進行", pos: "verb", level: "B1" }
  ]],
  ["get", [
    { meaning: "得到 / 取得", pos: "verb" },
    { meaning: "到達", pos: "verb" },
    { meaning: "變得", pos: "verb", level: "A2" }
  ]],
  ["make", [
    { meaning: "製作", pos: "verb" },
    { meaning: "使 / 令", pos: "verb", level: "A2" }
  ]],
  ["take", [
    { meaning: "拿 / 取", pos: "verb" },
    { meaning: "乘搭", pos: "verb" },
    { meaning: "花費時間", pos: "verb", level: "A2" }
  ]],
  ["look", [
    { meaning: "看", pos: "verb" },
    { meaning: "看起來", pos: "verb", level: "A2" }
  ]],
  ["look for", [{ meaning: "尋找", type: "phrase" }]],
  ["look after", [{ meaning: "照顧", type: "phrase" }]],
  ["look at", [{ meaning: "看著", type: "phrase" }]],
  ["egg tart", [{ meaning: "蛋撻", pos: "noun", type: "phrase" }]],
  ["look up", [{ meaning: "查閱 / 查字典", type: "phrase" }]],
  ["lung cancer", [{ meaning: "肺癌", pos: "noun", type: "phrase" }]],
  ["game", [
    { meaning: "遊戲", pos: "noun" },
    { meaning: "比賽", pos: "noun" },
    { meaning: "野味", pos: "noun", level: "C1" }
  ]],
  ["right", [
    { meaning: "正確的", pos: "adjective" },
    { meaning: "右邊 / 右方", pos: "noun" },
    { meaning: "權利", pos: "noun", level: "B1" }
  ]],
  ["left", [
    { meaning: "左邊的", pos: "adjective" },
    { meaning: "離開了", pos: "verb" }
  ]],
  ["light", [
    { meaning: "光 / 燈", pos: "noun" },
    { meaning: "輕的", pos: "adjective" },
    { meaning: "淺色的", pos: "adjective" }
  ]],
  ["kind", [
    { meaning: "友善的", pos: "adjective" },
    { meaning: "種類", pos: "noun" }
  ]],
  ["present", [
    { meaning: "禮物", pos: "noun" },
    { meaning: "在場的", pos: "adjective", level: "B1" },
    { meaning: "呈現 / 展示", pos: "verb" }
  ]],
  ["book", [
    { meaning: "書", pos: "noun" },
    { meaning: "預訂", pos: "verb", level: "A2" }
  ]],
  ["watch", [
    { meaning: "觀看", pos: "verb" },
    { meaning: "手錶", pos: "noun" }
  ]],
  ["play", [
    { meaning: "玩", pos: "verb" },
    { meaning: "演奏", pos: "verb" },
    { meaning: "戲劇", pos: "noun", level: "B1" }
  ]],
  ["mean", [
    { meaning: "意思是", pos: "verb" },
    { meaning: "刻薄的", pos: "adjective", level: "B1" }
  ]],
  ["can", [
    { meaning: "能夠", pos: "verb" },
    { meaning: "罐", pos: "noun" }
  ]],
  ["like", [
    { meaning: "喜歡", pos: "verb" },
    { meaning: "像", pos: "preposition" }
  ]],
  ["well", [
    { meaning: "好地", pos: "adverb" },
    { meaning: "井", pos: "noun", level: "B1" }
  ]],
  ["class", [
    { meaning: "班級 / 課堂", pos: "noun" },
    { meaning: "種類 / 等級", pos: "noun", level: "B1" }
  ]],
  ["match", [
    { meaning: "比賽", pos: "noun" },
    { meaning: "配對 / 相襯", pos: "verb" }
  ]],
  ["hard", [
    { meaning: "困難的", pos: "adjective" },
    { meaning: "努力地", pos: "adverb" }
  ]],
  ["fine", [
    { meaning: "好的 / 不錯的", pos: "adjective" },
    { meaning: "罰款", pos: "noun", level: "B1" }
  ]],
  ["point", [
    { meaning: "重點 / 分數", pos: "noun" },
    { meaning: "指著", pos: "verb" }
  ]],
  ["park", [
    { meaning: "公園", pos: "noun" },
    { meaning: "泊車", pos: "verb" }
  ]],
  ["orange", [
    { meaning: "橙", pos: "noun" },
    { meaning: "橙色的", pos: "adjective" }
  ]],
  ["sound", [
    { meaning: "聲音", pos: "noun" },
    { meaning: "聽起來", pos: "verb" }
  ]],
  ["close", [
    { meaning: "關上", pos: "verb" },
    { meaning: "接近的 / 親近的", pos: "adjective" }
  ]],
  ["table", [
    { meaning: "桌子", pos: "noun" },
    { meaning: "表格", pos: "noun", level: "A2" }
  ]],
  ["date", [
    { meaning: "日期", pos: "noun" },
    { meaning: "約會", pos: "noun", level: "B1" }
  ]],
  ["story", [
    { meaning: "故事", pos: "noun" },
    { meaning: "樓層", pos: "noun", level: "B1" }
  ]],
  ["letter", [
    { meaning: "信", pos: "noun" },
    { meaning: "字母", pos: "noun" }
  ]],
  ["minute", [
    { meaning: "分鐘", pos: "noun" },
    { meaning: "極小的", pos: "adjective", level: "C1" }
  ]],
  ["hawker", [{ meaning: "小販", pos: "noun" }]],
  ["evaluate", [{ meaning: "評估", pos: "verb" }]],
  ["guts", [{ meaning: "膽量", pos: "noun" }]]
]);

function normalizeStudentId(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeVocabWord(value) {
  return String(value || "")
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function makeStudentEmail(studentId) {
  const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "students";
  return `${normalizeStudentId(studentId).toLowerCase()}@${projectId}.local`;
}

function makeStudentPassword(studentId, pin, salt) {
  return `Gg-${normalizeStudentId(studentId)}-${hashPin(pin, salt).slice(0, 24)}`;
}

function hashPin(pin, salt) {
  return crypto
    .pbkdf2Sync(String(pin), String(salt), 120000, 32, "sha256")
    .toString("hex");
}

function isLikelyWordOrPhrase(value) {
  const text = normalizeVocabWord(value);
  return Boolean(text && /^[a-z][a-z' -]{0,63}$/.test(text) && !/ {2,}|--|''/.test(text));
}

function normalizeAudioText(value, kind = "word") {
  const text = String(value || "")
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, "\"")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, MAX_AUDIO_TEXT_LENGTH);
  return kind === "example" ? text : normalizeVocabWord(text);
}

function isLikelyAudioText(value, kind = "word") {
  const text = normalizeAudioText(value, kind);
  if (kind !== "example") return isLikelyWordOrPhrase(text);
  return Boolean(
    text
    && text.length <= MAX_AUDIO_TEXT_LENGTH
    && /[a-z]/i.test(text)
    && /^[a-z0-9][a-z0-9\s.,!?;:'"()/-]{0,219}$/i.test(text)
    && !/ {2,}|--|''|""/.test(text)
  );
}

function makeAudioId(word) {
  return crypto.createHash("sha256").update(normalizeVocabWord(word)).digest("hex").slice(0, 24);
}

function makeAudioTextId(text, kind = "word") {
  if (kind !== "example") return makeAudioId(text);
  return crypto.createHash("sha256").update(`${kind}:${normalizeAudioText(text, kind)}`).digest("hex").slice(0, 24);
}

function makeVocabMeaningId(word) {
  return crypto.createHash("sha256").update(normalizeVocabWord(word)).digest("hex").slice(0, 24);
}

function makeStoragePath(word) {
  const text = normalizeVocabWord(word);
  const slug = text
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "word";
  return `vocab-audio/v1/${slug}-${makeAudioId(text)}.mp3`;
}

function makeAudioStoragePath(text, kind = "word") {
  if (kind !== "example") return makeStoragePath(text);
  const cleanText = normalizeAudioText(text, kind);
  const slug = cleanText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "example";
  return `vocab-example-audio/v1/${slug}-${makeAudioTextId(cleanText, kind)}.mp3`;
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getAzureEndpoint(region) {
  return `https://${String(region || "").trim()}.tts.speech.microsoft.com/cognitiveservices/v1`;
}

function inferVocabType(word) {
  return normalizeVocabWord(word).includes(" ") ? "phrase" : "word";
}

function normalizeCloudMeaning(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/，/g, " / ")
    .replace(/\s*\/\s*/g, " / ");
}

function cleanCloudTranslation(value, word) {
  let text = normalizeCloudMeaning(value);
  const normalizedWord = normalizeVocabWord(word);
  if (normalizedWord === "look up" && /抬頭/.test(text)) {
    text = "查閱 / 查字典";
  }
  return text;
}

function normalizeAzureDictionaryPos(posTag, word) {
  if (inferVocabType(word) === "phrase") return "";
  const value = String(posTag || "").trim().toUpperCase();
  const map = {
    ADJ: "adjective",
    ADJECTIVE: "adjective",
    ADV: "adverb",
    ADVERB: "adverb",
    AUX: "auxiliary",
    CONJ: "conjunction",
    CONJUNCTION: "conjunction",
    DET: "determiner",
    NOUN: "noun",
    NUM: "number",
    PREP: "preposition",
    PREPOSITION: "preposition",
    PRON: "pronoun",
    PRONOUN: "pronoun",
    VERB: "verb"
  };
  return map[value] || "";
}

function normalizeMeaningEntries(word, entries = [], source = "azure-dictionary") {
  const normalizedWord = normalizeVocabWord(word);
  return entries
    .map((entry, index) => ({
      id: `${source}-${makeVocabMeaningId(`${normalizedWord}:${entry.meaning}:${index}`)}`,
      word: normalizedWord,
      meaning: normalizeCloudMeaning(entry.meaning),
      pos: String(entry.pos || "").trim().toLowerCase(),
      type: entry.type || inferVocabType(normalizedWord),
      source,
      sourceEntryId: entry.sourceEntryId || "",
      level: String(entry.level || "").trim().toUpperCase()
    }))
    .filter((entry) => entry.meaning);
}

function shouldReuseCachedMeaning(cached = {}) {
  const source = String(cached.source || "").toLowerCase();
  return Boolean(source && [
    "azure-dictionary",
    "azure-translate-fallback",
    "curated-cloud",
    "shared-cache"
  ].includes(source));
}

function getAzureTranslatorCredentials({ translatorKey, translatorRegion }) {
  const key = String(translatorKey || "").trim();
  const region = String(translatorRegion || "").trim();
  if (!key || !region) {
    throw new HttpsError("failed-precondition", "Azure Translator secrets are not configured.");
  }
  return { key, region };
}

async function postAzureTranslatorJson(path, params, items, credentials) {
  const { key, region } = getAzureTranslatorCredentials(credentials);
  const query = new URLSearchParams({
    "api-version": AZURE_TRANSLATOR_API_VERSION,
    ...params
  });

  const response = await fetch(`${AZURE_TRANSLATOR_ENDPOINT}${path}?${query.toString()}`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Ocp-Apim-Subscription-Region": region,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(items.map((item) => (
      item && typeof item === "object" ? item : { Text: item }
    )))
  });

  const body = await response.json().catch(async () => ({ raw: await response.text().catch(() => "") }));
  if (!response.ok) {
    const details = body?.error?.message || body?.raw || `HTTP ${response.status}`;
    throw new Error(`Azure Translator failed: ${details}`);
  }
  return body;
}

function joinAzureExampleParts(example = {}, side = "source") {
  const prefix = String(example[`${side}Prefix`] || "");
  const term = String(example[`${side}Term`] || "");
  const suffix = String(example[`${side}Suffix`] || "");
  return `${prefix}${term}${suffix}`.trim().replace(/\s+/g, " ");
}

function normalizeVocabExample(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 180);
}

function normalizeExampleEntries(word, examples = [], source = "azure-dictionary-examples") {
  const normalizedWord = normalizeVocabWord(word);
  const seen = new Set();
  return examples
    .map((example, index) => ({
      id: `${source}-${makeVocabMeaningId(`${normalizedWord}:${example.source}:${index}`)}`,
      word: normalizedWord,
      source: normalizeVocabExample(example.source),
      target: normalizeVocabExample(example.target),
      meaning: normalizeCloudMeaning(example.meaning),
      sourceEntryId: example.sourceEntryId || "",
      provider: source
    }))
    .filter((example) => example.source && example.target)
    .filter((example) => {
      const key = `${example.source}|${example.target}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, AZURE_DICTIONARY_EXAMPLE_LIMIT);
}

function shouldReuseCachedExamples(cached = {}) {
  const source = String(cached.source || "").toLowerCase();
  return source === GEMINI_EXAMPLE_SOURCE;
}

function normalizeExampleHints(hints = []) {
  const seen = new Set();
  return (Array.isArray(hints) ? hints : [])
    .map((hint) => ({
      meaning: normalizeCloudMeaning(hint?.meaning || ""),
      pos: String(hint?.pos || "").trim().toLowerCase().slice(0, 32),
      type: String(hint?.type || "").trim().toLowerCase().slice(0, 32),
      level: String(hint?.level || "").trim().toUpperCase().slice(0, 2)
    }))
    .filter((hint) => hint.meaning)
    .filter((hint) => {
      const key = `${hint.pos}:${hint.type}:${hint.meaning}:${hint.level}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 4);
}

function makeVocabExamplesCacheKey(word, hints = []) {
  const normalizedWord = normalizeVocabWord(word);
  const hintText = normalizeExampleHints(hints)
    .map((hint) => [hint.pos, hint.type, hint.meaning].filter(Boolean).join(":"))
    .join("|");
  return hintText ? `${normalizedWord}|${hintText}` : normalizedWord;
}

function makeVocabExampleId(word, hints = []) {
  return makeVocabMeaningId(makeVocabExamplesCacheKey(word, hints));
}

function getGeminiApiKey(value) {
  const key = String(value || "").trim();
  if (!key) {
    throw new HttpsError("failed-precondition", "Gemini API key is not configured.");
  }
  return key;
}

function buildGeminiExamplePrompt(word, hints = []) {
  const normalizedWord = normalizeVocabWord(word);
  const normalizedHints = normalizeExampleHints(hints);
  const cefrLevel = normalizedHints.find((hint) => hint.level)?.level || "";
  const levelGuide = {
    A1: "A1: Hong Kong junior primary level. Use 4-7 words, present simple, daily life only.",
    A2: "A2: Hong Kong senior primary level. Use 5-9 words and simple school/home contexts.",
    B1: "B1: Hong Kong Secondary 1 level. Use 7-12 words and simple because/when/if clauses when natural.",
    B2: "B2: Hong Kong Secondary 2-3 level. Use 9-15 words, natural school or daily contexts.",
    C1: "C1: Hong Kong DSE level. Use precise but still clear sentences; avoid obscure academic wording."
  }[cefrLevel] || "Default: Hong Kong primary-friendly English. Keep sentences short and clear.";
  const hintLines = normalizedHints
    .map((hint, index) => {
      const label = [hint.pos, hint.type].filter(Boolean).join(" / ");
      const level = hint.level ? ` [${hint.level}]` : "";
      return `${index + 1}. ${label ? `${label}: ` : ""}${hint.meaning}${level}`;
    })
    .join("\n");

  return [
    "You are writing vocabulary example sentences for Hong Kong primary school students.",
    "Create short, natural, safe English example sentences with matching Traditional Chinese translations.",
    "",
    `Vocabulary item: ${normalizedWord}`,
    hintLines ? `Target meaning / part of speech hints:\n${hintLines}` : "Target meaning hint: choose the most common primary-level meaning.",
    `Difficulty guide: ${levelGuide}`,
    "",
    "Rules:",
    "- Return JSON only. No markdown.",
    `- Return exactly ${GEMINI_EXAMPLE_LIMIT} examples.`,
    "- Each English sentence must be 4 to 10 words, natural, and primary-level.",
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

function normalizeGeminiExamples(word, body, hints = []) {
  const text = body?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || "")
    .join("")
    .trim();
  const parsed = parseGeminiJsonText(text);
  const examples = Array.isArray(parsed?.examples) ? parsed.examples : [];
  const primaryMeaning = normalizeExampleHints(hints)[0]?.meaning || "";
  return normalizeExampleEntries(
    word,
    examples.map((example, index) => ({
      source: example.source || example.english || "",
      target: example.target || example.chinese || example.translation || "",
      meaning: example.meaning || primaryMeaning,
      sourceEntryId: `gemini-example-${index}`
    })),
    GEMINI_EXAMPLE_SOURCE
  ).slice(0, GEMINI_EXAMPLE_LIMIT);
}

async function generateVocabExamplesWithGemini(word, hints = [], apiKeyValue) {
  const apiKey = getGeminiApiKey(apiKeyValue);
  const endpoint = `${GEMINI_API_ENDPOINT}/models/${GEMINI_EXAMPLE_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [{ text: buildGeminiExamplePrompt(word, hints) }]
      }],
      generationConfig: {
        temperature: 0.45,
        topP: 0.9,
        maxOutputTokens: 512,
        responseMimeType: "application/json"
      }
    })
  });

  const body = await response.json().catch(async () => ({ raw: await response.text().catch(() => "") }));
  if (!response.ok) {
    const details = body?.error?.message || body?.raw || `HTTP ${response.status}`;
    throw new Error(`Gemini example generation failed: ${details}`);
  }

  return normalizeGeminiExamples(word, body, hints);
}

async function translateTextItemsWithAzure(items, { from, to, translatorKey, translatorRegion }) {
  if (!items.length) return [];
  const body = await postAzureTranslatorJson("/translate", {
    from,
    to
  }, items, { translatorKey, translatorRegion });

  return items.map((original, index) => (
    body?.[index]?.translations?.[0]?.text || original
  ));
}

async function translateVocabMeaningWithAzure(word, { translatorKey, translatorRegion }) {
  const [translatedText] = await translateTextItemsWithAzure([word], {
    from: AZURE_TRANSLATOR_SOURCE,
    to: AZURE_TRANSLATOR_TARGET,
    translatorKey,
    translatorRegion
  });
  const meaning = cleanCloudTranslation(translatedText, word);
  return meaning ? [{ meaning, type: inferVocabType(word) }] : [];
}

async function translateDictionaryTargetsToTraditional(entries, { translatorKey, translatorRegion }) {
  if (!entries.length) return [];
  const traditionalMeanings = await translateTextItemsWithAzure(
    entries.map((entry) => entry.text),
    {
      from: AZURE_DICTIONARY_TARGET,
      to: AZURE_TRANSLATOR_TARGET,
      translatorKey,
      translatorRegion
    }
  ).catch((error) => {
    console.error("Azure Dictionary zh-Hant conversion failed.", {
      message: error?.message || String(error)
    });
    return entries.map((entry) => entry.text);
  });

  return entries.map((entry, index) => ({
    ...entry,
    meaning: cleanCloudTranslation(traditionalMeanings[index] || entry.text, entry.word || "")
  }));
}

function extractAzureDictionaryTranslations(word, body) {
  return (body || [])
    .flatMap((item) => Array.isArray(item?.translations) ? item.translations : [])
    .map((item, index) => ({
      word,
      text: normalizeCloudMeaning(item.normalizedTarget || item.displayTarget || ""),
      displayText: normalizeCloudMeaning(item.displayTarget || item.normalizedTarget || ""),
      pos: normalizeAzureDictionaryPos(item.posTag, word),
      confidence: Number(item.confidence || 0),
      sourceEntryId: `azure-dictionary-${index}`
    }))
    .filter((entry) => entry.text)
    .sort((a, b) => b.confidence - a.confidence);
}

function dedupeAzureDictionaryTranslations(rawTranslations = [], limit = AZURE_DICTIONARY_ENTRY_LIMIT) {
  const deduped = [];
  const seen = new Set();
  for (const entry of rawTranslations) {
    const key = `${entry.pos}:${entry.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
    if (deduped.length >= limit) break;
  }
  return deduped;
}

async function lookupAzureDictionaryEntries(word, { translatorKey, translatorRegion }) {
  const body = await postAzureTranslatorJson("/dictionary/lookup", {
    from: AZURE_TRANSLATOR_SOURCE,
    to: AZURE_DICTIONARY_TARGET
  }, [word], { translatorKey, translatorRegion });

  const deduped = dedupeAzureDictionaryTranslations(
    extractAzureDictionaryTranslations(word, body)
  );
  const translatedEntries = await translateDictionaryTargetsToTraditional(deduped, {
    translatorKey,
    translatorRegion
  });

  return translatedEntries
    .map((entry) => ({
      meaning: entry.meaning,
      pos: entry.pos,
      type: inferVocabType(word),
      sourceEntryId: entry.sourceEntryId
    }))
    .filter((entry) => entry.meaning);
}

async function lookupAzureDictionaryExamples(word, { translatorKey, translatorRegion }) {
  const lookupBody = await postAzureTranslatorJson("/dictionary/lookup", {
    from: AZURE_TRANSLATOR_SOURCE,
    to: AZURE_DICTIONARY_TARGET
  }, [word], { translatorKey, translatorRegion });
  const lookupEntries = dedupeAzureDictionaryTranslations(
    extractAzureDictionaryTranslations(word, lookupBody),
    AZURE_DICTIONARY_EXAMPLE_PAIR_LIMIT
  );
  if (!lookupEntries.length) return [];

  const body = await postAzureTranslatorJson("/dictionary/examples", {
    from: AZURE_TRANSLATOR_SOURCE,
    to: AZURE_DICTIONARY_TARGET
  }, lookupEntries.map((entry) => ({
    Text: normalizeVocabWord(word),
    Translation: entry.text
  })), { translatorKey, translatorRegion });

  const rawExamples = [];
  (body || []).forEach((item, itemIndex) => {
    const lookupEntry = lookupEntries[itemIndex] || {};
    (Array.isArray(item?.examples) ? item.examples : []).forEach((example) => {
      rawExamples.push({
        source: joinAzureExampleParts(example, "source"),
        target: joinAzureExampleParts(example, "target"),
        meaning: lookupEntry.displayText || lookupEntry.text || "",
        sourceEntryId: lookupEntry.sourceEntryId || ""
      });
    });
  });

  const examples = normalizeExampleEntries(word, rawExamples);
  if (!examples.length) return [];

  const traditionalTargets = await translateTextItemsWithAzure(
    examples.map((example) => example.target),
    {
      from: AZURE_DICTIONARY_TARGET,
      to: AZURE_TRANSLATOR_TARGET,
      translatorKey,
      translatorRegion
    }
  ).catch((error) => {
    console.error("Azure example zh-Hant conversion failed.", {
      word,
      message: error?.message || String(error)
    });
    return examples.map((example) => example.target);
  });

  return normalizeExampleEntries(
    word,
    examples.map((example, index) => ({
      ...example,
      target: traditionalTargets[index] || example.target
    }))
  );
}

async function lookupVocabMeaningsWithAzure(word, credentials) {
  const dictionaryEntries = await lookupAzureDictionaryEntries(word, credentials);
  if (dictionaryEntries.length) {
    return {
      entries: dictionaryEntries,
      source: "azure-dictionary"
    };
  }

  return {
    entries: await translateVocabMeaningWithAzure(word, credentials),
    source: "azure-translate-fallback"
  };
}

async function getOrCreateVocabMeaning(word) {
  const normalizedWord = normalizeVocabWord(word);
  const meaningId = makeVocabMeaningId(normalizedWord);
  const docRef = db.collection("vocabMeaningCache").doc(meaningId);
  const curated = CURATED_VOCAB_MEANINGS.get(normalizedWord);
  let rawEntries = curated;
  let source = curated ? "curated-cloud" : "azure-dictionary";

  if (!rawEntries) {
    const cachedSnap = await docRef.get();
    if (cachedSnap.exists && shouldReuseCachedMeaning(cachedSnap.data() || {})) {
      const cached = cachedSnap.data() || {};
      const entries = normalizeMeaningEntries(normalizedWord, cached.entries || [], cached.source || "shared-cache");
      if (entries.length) {
        return {
          meaningId,
          word: normalizedWord,
          entries,
          cached: true,
          source: cached.source || "shared-cache"
        };
      }
    }
  }

  if (!rawEntries) {
    try {
      const result = await lookupVocabMeaningsWithAzure(normalizedWord, {
        translatorKey: AZURE_TRANSLATOR_KEY.value(),
        translatorRegion: AZURE_TRANSLATOR_REGION.value()
      });
      rawEntries = result.entries;
      source = result.source;
    } catch (error) {
      console.error("Azure vocab meaning lookup failed.", {
        word: normalizedWord,
        message: error?.message || String(error)
      });
      await docRef.set({
        word: normalizedWord,
        meaningId,
        source,
        status: "translator-error",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return {
        meaningId,
        word: normalizedWord,
        entries: [],
        cached: false,
        source,
        status: "translator-error"
      };
    }
  }
  const entries = normalizeMeaningEntries(normalizedWord, rawEntries, source);

  if (!entries.length) {
    await docRef.set({
      word: normalizedWord,
      meaningId,
      source,
      status: "missing",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return {
      meaningId,
      word: normalizedWord,
      entries: [],
      cached: false,
      source,
      status: "missing"
    };
  }

  await docRef.set({
    word: normalizedWord,
    meaningId,
    source,
    status: "ready",
    entries: entries.map((entry) => ({
      meaning: entry.meaning,
      pos: entry.pos,
      type: entry.type,
      sourceEntryId: entry.sourceEntryId || entry.id,
      level: entry.level || ""
    })),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return {
    meaningId,
    word: normalizedWord,
    entries,
    cached: false,
    source,
    status: "ready"
  };
}

function makeDownloadUrl(bucketName, storagePath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
}

async function getOrCreateDownloadUrl(file, storagePath) {
  const [metadata] = await file.getMetadata();
  const existingToken = String(metadata?.metadata?.firebaseStorageDownloadTokens || "")
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)[0];
  const token = existingToken || crypto.randomUUID();

  if (!existingToken) {
    await file.setMetadata({
      metadata: {
        ...(metadata.metadata || {}),
        firebaseStorageDownloadTokens: token
      }
    });
  }

  return makeDownloadUrl(bucket.name, storagePath, token);
}

async function generateAzureTtsMp3(text, { speechKey, speechRegion }) {
  const endpoint = getAzureEndpoint(speechRegion);
  const ssml = [
    `<speak version="1.0" xml:lang="en-US">`,
    `<voice name="${DEFAULT_VOICE}">${escapeXml(text)}</voice>`,
    `</speak>`
  ].join("");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": speechKey,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": DEFAULT_OUTPUT_FORMAT,
      "User-Agent": "enguistics-grammar-game"
    },
    body: ssml
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Azure TTS failed: ${response.status} ${details}`.trim());
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (!buffer.length) throw new Error("Azure TTS returned empty audio.");
  return buffer;
}

async function getOrCreateVocabAudio(text, context = {}) {
  const kind = context.kind === "example" ? "example" : "word";
  const normalizedText = normalizeAudioText(text, kind);
  const audioId = makeAudioTextId(normalizedText, kind);
  const storagePath = makeAudioStoragePath(normalizedText, kind);
  const collectionName = kind === "example" ? "vocabExampleAudio" : "vocabAudio";
  const docRef = db.collection(collectionName).doc(audioId);
  const [docSnap, existsResult] = await Promise.all([
    docRef.get(),
    bucket.file(storagePath).exists()
  ]);
  const file = bucket.file(storagePath);
  const fileExists = Boolean(existsResult?.[0]);

  if (fileExists) {
    const data = docSnap.exists ? (docSnap.data() || {}) : {};
    const downloadUrl = await getOrCreateDownloadUrl(file, storagePath);
    await docRef.set({
      text: normalizedText,
      word: kind === "word" ? normalizedText : "",
      kind,
      audioId,
      storagePath,
      source: data.source || "firebase-shared",
      voice: data.voice || DEFAULT_VOICE,
      outputFormat: data.outputFormat || DEFAULT_OUTPUT_FORMAT,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return {
      audioId,
      storagePath,
      downloadUrl,
      source: data.source || "firebase-shared",
      kind,
      createdAt: data.createdAt || null,
      cached: true
    };
  }

  const key = AZURE_SPEECH_KEY.value();
  const region = AZURE_SPEECH_REGION.value();

  if (!key || !region) {
    throw new HttpsError("failed-precondition", "Azure Speech secrets are not configured.");
  }

  const audioBuffer = await generateAzureTtsMp3(normalizedText, {
    speechKey: key,
    speechRegion: region
  });

  const downloadToken = crypto.randomUUID();
  await file.save(audioBuffer, {
    resumable: false,
    metadata: {
      contentType: "audio/mpeg",
      cacheControl: "public, max-age=31536000, immutable",
      metadata: {
        audioId,
        text: normalizedText,
        word: kind === "word" ? normalizedText : "",
        kind,
        voice: DEFAULT_VOICE,
        source: "azure-tts",
        firebaseStorageDownloadTokens: downloadToken
      }
    }
  });

  const downloadUrl = makeDownloadUrl(bucket.name, storagePath, downloadToken);

  await docRef.set({
    text: normalizedText,
    word: kind === "word" ? normalizedText : "",
    kind,
    audioId,
    storagePath,
    downloadUrl,
    source: "azure-tts",
    voice: DEFAULT_VOICE,
    outputFormat: DEFAULT_OUTPUT_FORMAT,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return {
    audioId,
    storagePath,
    downloadUrl,
    source: "azure-tts",
    kind,
    cached: false
  };
}

exports.ensureVocabAudio = onCall({
  invoker: "public",
  secrets: [AZURE_SPEECH_KEY, AZURE_SPEECH_REGION]
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please log in first.");
  }

  const kind = request.data?.kind === "example" ? "example" : "word";
  const text = normalizeAudioText(request.data?.text || request.data?.word, kind);
  if (!isLikelyAudioText(text, kind)) {
    throw new HttpsError("invalid-argument", "Invalid audio text.");
  }

  const result = await getOrCreateVocabAudio(text, { ...request, kind });
  return {
    status: "ready",
    word: kind === "word" ? text : "",
    text,
    kind,
    ...result
  };
});

exports.lookupVocabMeaning = onCall({
  invoker: "public",
  secrets: [AZURE_TRANSLATOR_KEY, AZURE_TRANSLATOR_REGION]
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please log in first.");
  }

  const word = normalizeVocabWord(request.data?.word);
  if (!isLikelyWordOrPhrase(word)) {
    throw new HttpsError("invalid-argument", "Invalid vocabulary word.");
  }

  const result = await getOrCreateVocabMeaning(word);
  return {
    status: result.status || "ready",
    word,
    meaningId: result.meaningId,
    entries: result.entries,
    source: result.source,
    cached: result.cached
  };
});

async function getOrCreateVocabExamples(word, hints = []) {
  const normalizedWord = normalizeVocabWord(word);
  const normalizedHints = normalizeExampleHints(hints);
  const exampleId = makeVocabExampleId(normalizedWord, normalizedHints);
  const docRef = db.collection("vocabExampleCache").doc(exampleId);
  const cachedSnap = await docRef.get();
  if (cachedSnap.exists) {
    const cached = cachedSnap.data() || {};
    const examples = normalizeExampleEntries(normalizedWord, cached.examples || [], cached.source || "shared-cache");
    if (shouldReuseCachedExamples(cached) && (examples.length || cached.status === "missing")) {
      return {
        exampleId,
        word: normalizedWord,
        examples,
        cached: true,
        source: cached.source || "shared-cache",
        status: cached.status || (examples.length ? "ready" : "missing")
      };
    }
  }

  let examples = [];
  let status = "ready";
  const source = GEMINI_EXAMPLE_SOURCE;
  try {
    examples = await generateVocabExamplesWithGemini(normalizedWord, normalizedHints, GEMINI_API_KEY.value());
    status = examples.length ? "ready" : "missing";
  } catch (error) {
    console.error("Gemini vocab example generation failed.", {
      word: normalizedWord,
      message: error?.message || String(error)
    });
    status = "ai-error";
  }

  await docRef.set({
    word: normalizedWord,
    exampleId,
    cacheKey: makeVocabExamplesCacheKey(normalizedWord, normalizedHints),
    hints: normalizedHints,
    source,
    status,
    examples: examples.map((example) => ({
      source: example.source,
      target: example.target,
      meaning: example.meaning || "",
      sourceEntryId: example.sourceEntryId || ""
    })),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return {
    exampleId,
    word: normalizedWord,
    examples,
    cached: false,
    source,
    status
  };
}

exports.lookupVocabExamples = onCall({
  invoker: "public",
  secrets: [GEMINI_API_KEY]
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please log in first.");
  }

  const word = normalizeVocabWord(request.data?.word);
  if (!isLikelyWordOrPhrase(word)) {
    throw new HttpsError("invalid-argument", "Invalid vocabulary word.");
  }

  const hints = normalizeExampleHints(request.data?.meanings || request.data?.hints || []);
  const result = await getOrCreateVocabExamples(word, hints);
  return {
    status: result.status || "ready",
    word,
    exampleId: result.exampleId,
    examples: result.examples,
    source: result.source,
    cached: result.cached
  };
});

exports.studentLogin = onCall({
  invoker: "public"
}, async (request) => {
  const studentId = normalizeStudentId(request.data?.studentId);
  const pin = String(request.data?.pin || "").trim();

  if (!studentId || !/^[A-Z0-9_-]{2,16}$/.test(studentId)) {
    throw new HttpsError("invalid-argument", "Invalid student ID.");
  }

  if (!/^[0-9]{4,8}$/.test(pin)) {
    throw new HttpsError("invalid-argument", "Invalid PIN.");
  }

  const accountRef = db.collection("studentAccounts").doc(studentId);
  const accountSnapshot = await accountRef.get();
  if (!accountSnapshot.exists) {
    throw new HttpsError("unauthenticated", "Student account not found.");
  }

  const account = accountSnapshot.data() || {};
  if (account.disabled) {
    throw new HttpsError("permission-denied", "Student account is disabled.");
  }

  const expectedHash = account.pinHash;
  const salt = account.pinSalt;
  const actualHash = salt ? hashPin(pin, salt) : "";
  const validHash = expectedHash
    && actualHash.length === expectedHash.length
    && crypto.timingSafeEqual(Buffer.from(actualHash), Buffer.from(expectedHash));

  if (!validHash) {
    await accountRef.set({
      failedLoginCount: admin.firestore.FieldValue.increment(1),
      lastFailedLoginAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    throw new HttpsError("unauthenticated", "Incorrect PIN.");
  }

  const uid = account.uid || `student_${studentId.toLowerCase()}`;
  const displayName = account.displayName || studentId;
  const classId = account.classId || "";
  const email = account.email || makeStudentEmail(studentId);
  const authPassword = makeStudentPassword(studentId, pin, salt);

  await admin.auth().updateUser(uid, {
    email,
    password: authPassword,
    displayName
  }).catch(async (error) => {
    if (error?.code !== "auth/user-not-found") throw error;
    await admin.auth().createUser({
      uid,
      email,
      password: authPassword,
      displayName
    });
  });

  await admin.auth().setCustomUserClaims(uid, {
    role: "student",
    studentId,
    classId
  });

  await accountRef.set({
    uid,
    email,
    displayName,
    classId,
    lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    failedLoginCount: 0
  }, { merge: true });

  await db.collection("users").doc(uid).set({
    studentId,
    displayName,
    classId,
    lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return {
    email,
    authPassword,
    studentId,
    displayName,
    classId
  };
});

if (process.env.NODE_ENV === "test") {
  module.exports._private = {
    buildGeminiExamplePrompt,
    makeVocabExamplesCacheKey,
    makeVocabExampleId,
    normalizeExampleHints,
    normalizeGeminiExamples,
    parseGeminiJsonText,
    shouldReuseCachedExamples
  };
}
