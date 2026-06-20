#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const yauzl = require("yauzl");
const sax = require("sax");
const VocabPosInference = require("../vocab_pos_inference.js");

const DEFAULT_OUTPUT = path.resolve(__dirname, "..", "teacher_vocab_bank.js");
const DEFAULT_CONFLICTS = path.resolve(__dirname, "..", "teacher_vocab_conflicts.json");
const DEFAULT_UPDATES = path.resolve(__dirname, "..", "teacher_vocab_manual_updates.json");
const XML_MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const XML_REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

const POS_ALIASES = {
  n: "noun",
  noun: "noun",
  名詞: "noun",
  v: "verb",
  vb: "verb",
  verb: "verb",
  動詞: "verb",
  adj: "adjective",
  adjective: "adjective",
  形容詞: "adjective",
  adv: "adverb",
  adverb: "adverb",
  副詞: "adverb",
  prep: "preposition",
  preposition: "preposition",
  介詞: "preposition",
  conj: "conjunction",
  conjunction: "conjunction",
  連詞: "conjunction",
  pron: "pronoun",
  pronoun: "pronoun",
  代名詞: "pronoun",
  det: "determiner",
  determiner: "determiner",
  限定詞: "determiner",
  modal: "modal",
  "modal v": "modal",
  modalverb: "modal",
  auxiliary: "auxiliary",
  aux: "auxiliary",
  "auxiliary v": "auxiliary",
  auxiliaryverb: "auxiliary",
  exclam: "exclamation",
  exclamation: "exclamation",
  interj: "exclamation",
  interjection: "exclamation",
  number: "number",
  num: "number",
  phrase: "phrase",
  pattern: "pattern"
};

function usage() {
  console.log([
    "Usage:",
    "  node scripts/import-teacher-vocab.js <xlsx...> [--updates teacher_vocab_manual_updates.json] [--out teacher_vocab_bank.js] [--conflicts teacher_vocab_conflicts.json]",
    "",
    "Example:",
    "  node scripts/import-teacher-vocab.js ~/Downloads/RANDOMISABLE\\ VOCAB\\ \\(2\\).xlsx"
  ].join("\n"));
}

function parseArgs(argv) {
  const files = [];
  let out = DEFAULT_OUTPUT;
  let conflicts = DEFAULT_CONFLICTS;
  let updateFiles = fs.existsSync(DEFAULT_UPDATES) ? [DEFAULT_UPDATES] : [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--out") {
      out = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--conflicts") {
      conflicts = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--updates") {
      updateFiles.push(path.resolve(argv[index + 1] || ""));
      index += 1;
      continue;
    }
    if (arg === "--no-updates") {
      updateFiles = [];
      continue;
    }
    files.push(path.resolve(arg));
  }

  if (!files.length) {
    usage();
    process.exit(1);
  }

  return { files, out, conflicts, updateFiles: Array.from(new Set(updateFiles)).filter(Boolean) };
}

function xmlLocalName(name = "") {
  return String(name).includes(":") ? String(name).split(":").pop() : String(name);
}

function normalizeWord(value) {
  return String(value || "")
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, "\"")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function normalizeMeaning(value) {
  return String(value || "")
    .trim()
    .replace(/\s*[/／;；]\s*/g, " / ")
    .replace(/\s+/g, " ");
}

function normalizePos(value) {
  const key = String(value || "")
    .trim()
    .replace(/[().]/g, "")
    .toLowerCase();
  return POS_ALIASES[key] || "";
}

function inferEntryPos(entry, options = {}) {
  return VocabPosInference.inferEntryPos(entry, options);
}

function slugify(value) {
  const ascii = normalizeWord(value)
    .replace(/\(([^)]+)\)/g, "$1")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return ascii || "entry";
}

function hasCjk(value) {
  return /[\u3400-\u9fff]/.test(String(value || ""));
}

function hasLatin(value) {
  return /[A-Za-z]/.test(String(value || ""));
}

function looksLikeHeader(value) {
  return ["english", "eng", "word", "vocab", "vocabulary"].includes(normalizeWord(value));
}

function detectType(word, explicitPos = "") {
  const normalized = normalizeWord(word);
  if (/[+*=]|名詞|動詞|形容詞|副詞|\bpp\b/i.test(normalized)) return "pattern";
  if (/\s/.test(normalized) || /[-/]/.test(normalized)) return "phrase";
  if (explicitPos === "phrase") return "phrase";
  return "word";
}

function normalizeManualType(value, word, explicitPos = "") {
  const type = String(value || "").trim().toLowerCase();
  if (type === "pattern" || type === "phrase" || type === "word") return type;
  return detectType(word, explicitPos);
}

function normalizeAliases(value) {
  const aliases = Array.isArray(value)
    ? value
    : String(value || "").split(/[,，;；|]/);
  return Array.from(new Set(
    aliases
      .map(normalizeWord)
      .filter(Boolean)
  ));
}

function splitPosFromWord(rawWord) {
  let word = String(rawWord || "").trim().replace(/\s+/g, " ");
  let pos = "";
  let multiSenseHint = false;

  word = word.replace(/\s*x\s*\d+\s*$/i, () => {
    multiSenseHint = true;
    return "";
  }).trim();

  const parenMatch = word.match(/\s*\(([^)]+)\)\s*$/);
  if (parenMatch) {
    const parsedPos = normalizePos(parenMatch[1]);
    if (parsedPos) {
      pos = parsedPos;
      word = word.slice(0, parenMatch.index).trim();
    }
  }

  return {
    display: String(rawWord || "").trim().replace(/\s+/g, " "),
    word: normalizeWord(word),
    pos,
    multiSenseHint
  };
}

function splitMeanings(rawMeaning) {
  const normalized = normalizeMeaning(rawMeaning);
  if (!normalized) return [];
  return normalized
    .split(/\s+\/\s+/)
    .map((part) => normalizeMeaning(part))
    .filter(Boolean);
}

function columnIndexFromRef(cellRef = "") {
  const match = String(cellRef).match(/([A-Z]+)/);
  if (!match) return -1;
  return match[1].split("").reduce((total, letter) => (total * 26) + letter.charCodeAt(0) - 64, 0) - 1;
}

function columnName(index) {
  let number = index + 1;
  let name = "";
  while (number > 0) {
    const remainder = (number - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    number = Math.floor((number - 1) / 26);
  }
  return name;
}

function readZipEntries(filePath) {
  return new Promise((resolve, reject) => {
    const entries = new Map();
    yauzl.open(filePath, { lazyEntries: true }, (openError, zipFile) => {
      if (openError) {
        reject(openError);
        return;
      }

      zipFile.readEntry();
      zipFile.on("entry", (entry) => {
        if (/\/$/.test(entry.fileName)) {
          zipFile.readEntry();
          return;
        }
        zipFile.openReadStream(entry, (streamError, stream) => {
          if (streamError) {
            reject(streamError);
            return;
          }
          const chunks = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => {
            entries.set(entry.fileName, Buffer.concat(chunks));
            zipFile.readEntry();
          });
          stream.on("error", reject);
        });
      });
      zipFile.on("end", () => resolve(entries));
      zipFile.on("error", reject);
    });
  });
}

function parseXmlString(xml, handlers = {}) {
  const parser = sax.parser(true, {
    trim: false,
    normalize: false,
    xmlns: true
  });
  parser.onopentag = handlers.onOpenTag || (() => {});
  parser.onclosetag = handlers.onCloseTag || (() => {});
  parser.ontext = handlers.onText || (() => {});
  parser.oncdata = handlers.onText || (() => {});
  parser.write(xml).close();
}

function readAttribute(node, localName, namespace = "") {
  const attrs = Object.values(node.attributes || {});
  const match = attrs.find((attr) => {
    const sameName = attr.local === localName || attr.name === localName || xmlLocalName(attr.name) === localName;
    return sameName && (!namespace || attr.uri === namespace);
  });
  return match ? match.value : "";
}

function readSharedStrings(entries) {
  const buffer = entries.get("xl/sharedStrings.xml");
  if (!buffer) return [];

  const strings = [];
  let inSi = false;
  let inText = false;
  let current = "";

  parseXmlString(buffer.toString("utf8"), {
    onOpenTag(node) {
      const local = node.local || xmlLocalName(node.name);
      if (local === "si") {
        inSi = true;
        current = "";
      } else if (inSi && local === "t") {
        inText = true;
      }
    },
    onText(text) {
      if (inSi && inText) current += text;
    },
    onCloseTag(name) {
      const local = xmlLocalName(name);
      if (local === "t") {
        inText = false;
      } else if (local === "si") {
        strings.push(current);
        inSi = false;
        current = "";
      }
    }
  });

  return strings;
}

function readWorkbookSheets(entries) {
  const workbook = entries.get("xl/workbook.xml");
  const rels = entries.get("xl/_rels/workbook.xml.rels");
  if (!workbook || !rels) return [];

  const ridToTarget = {};
  parseXmlString(rels.toString("utf8"), {
    onOpenTag(node) {
      const local = node.local || xmlLocalName(node.name);
      if (local !== "Relationship") return;
      const id = readAttribute(node, "Id");
      const target = readAttribute(node, "Target");
      if (id && target) ridToTarget[id] = target;
    }
  });

  const sheets = [];
  parseXmlString(workbook.toString("utf8"), {
    onOpenTag(node) {
      const local = node.local || xmlLocalName(node.name);
      if (local !== "sheet") return;
      const name = readAttribute(node, "name");
      const rid = readAttribute(node, "id", XML_REL_NS) || readAttribute(node, "id");
      const target = ridToTarget[rid];
      if (!name || !target) return;
      const fileName = (`xl/${target.replace(/^\/+/, "")}`).replace("xl/xl/", "xl/");
      sheets.push({ name, fileName });
    }
  });

  return sheets;
}

function parseCellValue(cell, sharedStrings) {
  const value = cell.value;
  if (!value) return "";
  if (cell.type === "s") {
    const index = Number(value);
    return Number.isInteger(index) && sharedStrings[index] ? String(sharedStrings[index]).trim() : "";
  }
  return String(value).trim();
}

function readWorksheetRows(entries, fileName, sharedStrings) {
  const buffer = entries.get(fileName);
  if (!buffer) return [];

  const rows = [];
  let currentRow = null;
  let currentCell = null;
  let inValue = false;
  let inInlineText = false;

  parseXmlString(buffer.toString("utf8"), {
    onOpenTag(node) {
      const local = node.local || xmlLocalName(node.name);
      if (local === "row") {
        currentRow = {};
      } else if (local === "c" && currentRow) {
        currentCell = {
          column: columnIndexFromRef(readAttribute(node, "r")),
          type: readAttribute(node, "t"),
          value: ""
        };
      } else if (local === "v" && currentCell) {
        inValue = true;
      } else if (local === "t" && currentCell?.type === "inlineStr") {
        inInlineText = true;
      }
    },
    onText(text) {
      if (!currentCell) return;
      if (inValue || inInlineText) {
        currentCell.value += text;
      }
    },
    onCloseTag(name) {
      const local = xmlLocalName(name);
      if (local === "v") {
        inValue = false;
      } else if (local === "t") {
        inInlineText = false;
      } else if (local === "c" && currentCell && currentRow) {
        const text = parseCellValue(currentCell, sharedStrings);
        if (currentCell.column >= 0 && text) currentRow[currentCell.column] = text;
        currentCell = null;
      } else if (local === "row") {
        if (currentRow && Object.keys(currentRow).length) rows.push(currentRow);
        currentRow = null;
      }
    }
  });

  return rows;
}

function makeEntryId(word, pos, meaning, index) {
  const base = [slugify(word), pos || "any", slugify(meaning)].join("-");
  return `${base}-${String(index + 1).padStart(4, "0")}`.slice(0, 96);
}

function createManualEntriesFromData(data = {}, sourceFile = "manual-updates") {
  const lesson = data.meta?.lesson || data.lesson || "Manual updates";
  const rows = Array.isArray(data.entries) ? data.entries : [];

  return rows.map((row, index) => {
    const word = normalizeWord(row.word || row.english || row.display);
    const display = String(row.display || row.word || row.english || "").trim().replace(/\s+/g, " ");
    const pos = normalizePos(row.pos);
    const suppress = Boolean(row.suppress);
    const meaning = normalizeMeaning(row.meaning || row.chinese || (suppress ? "__SUPPRESS__" : ""));
    const type = normalizeManualType(row.type, word, pos);
    if (!word || !meaning) return null;

    return {
      id: "",
      word,
      display: display || word,
      meaning,
      pos,
      type,
      source: "teacher",
      sourceFile,
      sheet: lesson,
      row: index + 1,
      columns: "manual",
      needsReview: Boolean(row.needsReview),
      notes: normalizeMeaning(row.notes || "老師指定更新"),
      aliases: normalizeAliases(row.aliases || row.alias),
      override: row.override !== false,
      replaceType: Boolean(row.replaceType),
      suppress
    };
  }).filter(Boolean);
}

function readManualUpdateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Manual update file not found: ${filePath}`);
  }
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return {
    filePath,
    entries: createManualEntriesFromData(data, path.basename(filePath))
  };
}

function extractEntriesFromRows({ sourceFile, sheetName, rows }) {
  const entries = [];
  const blankChineseCandidates = [];

  rows.forEach((row, rowIndex) => {
    const columns = Object.keys(row).map(Number).sort((left, right) => left - right);
    columns.forEach((column) => {
      const english = row[column];
      const chinese = row[column + 1];
      if (!hasLatin(english) || looksLikeHeader(english)) return;
      if (!hasCjk(chinese)) {
        if (column === 0 || column === 2) {
          blankChineseCandidates.push({
            sourceFile,
            sheetName,
            row: rowIndex + 1,
            english,
            column: columnName(column)
          });
        }
        return;
      }

      const parsed = splitPosFromWord(english);
      const meanings = splitMeanings(chinese);
      const type = detectType(parsed.word, parsed.pos);
      const shouldSplit = parsed.multiSenseHint && meanings.length > 1;
      const entryMeanings = shouldSplit ? meanings : [normalizeMeaning(chinese)];

      entryMeanings.forEach((meaning, splitIndex) => {
        if (!parsed.word || !meaning) return;
        entries.push({
          id: "",
          word: parsed.word,
          display: parsed.display,
          meaning,
          pos: parsed.pos,
          type,
          source: "teacher",
          sourceFile,
          sheet: sheetName.trim(),
          row: rowIndex + 1,
          columns: `${columnName(column)}:${columnName(column + 1)}`,
          needsReview: !parsed.pos && (parsed.multiSenseHint || meanings.length > 1 || type === "word"),
          notes: [
            parsed.multiSenseHint ? "x2 多義提示" : "",
            splitIndex > 0 ? "由多義中文拆出" : ""
          ].filter(Boolean).join("；")
        });
      });
    });
  });

  return { entries, blankChineseCandidates };
}

async function readWorkbook(filePath) {
  const zipEntries = await readZipEntries(filePath);
  const sharedStrings = readSharedStrings(zipEntries);
  const sheets = readWorkbookSheets(zipEntries);
  const extractedEntries = [];
  const blankChineseCandidates = [];

  sheets.forEach((sheet) => {
    const rows = readWorksheetRows(zipEntries, sheet.fileName, sharedStrings);
    const extracted = extractEntriesFromRows({
      sourceFile: path.basename(filePath),
      sheetName: sheet.name,
      rows
    });
    extractedEntries.push(...extracted.entries);
    blankChineseCandidates.push(...extracted.blankChineseCandidates);
  });

  return {
    filePath,
    sheetCount: sheets.length,
    sharedStringCount: sharedStrings.length,
    entries: extractedEntries,
    blankChineseCandidates
  };
}

function overrideKey(entry) {
  return [
    normalizeWord(entry.word),
    entry.type || detectType(entry.word, entry.pos),
    normalizePos(entry.pos)
  ].join("\u0001");
}

function wordTypeKey(entry) {
  return [
    normalizeWord(entry.word),
    entry.type || detectType(entry.word, entry.pos)
  ].join("\u0001");
}

function applyManualOverrides(rawEntries) {
  const overrideKeys = new Set();
  const overrideWordTypeKeys = new Set();
  const replaceWordTypeKeys = new Set();
  const suppressWordTypeKeys = new Set();

  rawEntries.forEach((entry) => {
    if (!entry.override) return;
    overrideKeys.add(overrideKey(entry));
    overrideWordTypeKeys.add(wordTypeKey(entry));
    if (entry.replaceType) replaceWordTypeKeys.add(wordTypeKey(entry));
    if (entry.suppress) suppressWordTypeKeys.add(wordTypeKey(entry));
  });

  if (!overrideKeys.size) return rawEntries;

  return rawEntries.filter((entry) => {
    if (entry.suppress) return false;
    if (entry.override) return true;
    const exactKey = overrideKey(entry);
    if (suppressWordTypeKeys.has(wordTypeKey(entry))) return false;
    if (replaceWordTypeKeys.has(wordTypeKey(entry))) return false;
    if (overrideKeys.has(exactKey)) return false;
    if (!entry.pos && overrideWordTypeKeys.has(wordTypeKey(entry))) return false;
    return true;
  });
}

function dedupeEntries(rawEntries) {
  const groups = new Map();

  applyManualOverrides(rawEntries).forEach((entry) => {
    const key = [
      normalizeWord(entry.word),
      normalizePos(entry.pos),
      normalizeMeaning(entry.meaning),
      entry.type
    ].join("\u0001");
    if (!groups.has(key)) {
      groups.set(key, {
        ...entry,
        sources: []
      });
    } else if (entry.aliases?.length) {
      const group = groups.get(key);
      group.aliases = normalizeAliases([...(group.aliases || []), ...entry.aliases]);
    }
    groups.get(key).sources.push({
      sourceFile: entry.sourceFile,
      sheet: entry.sheet,
      row: entry.row,
      columns: entry.columns,
      override: Boolean(entry.override)
    });
  });

  const entries = Array.from(groups.values()).map((entry, index) => {
    const sourceCount = entry.sources.length;
    return {
      id: makeEntryId(entry.word, entry.pos, entry.meaning, index),
      word: entry.word,
      display: entry.display,
      meaning: entry.meaning,
      pos: entry.pos,
      type: entry.type,
      source: entry.source,
      needsReview: Boolean(entry.needsReview),
      notes: entry.notes,
      aliases: normalizeAliases(entry.aliases),
      sourceCount,
      sources: entry.sources.slice(0, 8),
      override: Boolean(entry.override),
      replaceType: Boolean(entry.replaceType)
    };
  });

  entries.sort((left, right) => {
    return left.word.localeCompare(right.word)
      || left.type.localeCompare(right.type)
      || left.meaning.localeCompare(right.meaning)
      || left.id.localeCompare(right.id);
  });

  return entries;
}

function buildConflicts(entries, blankChineseCandidates) {
  const byWord = new Map();
  entries.forEach((entry) => {
    const key = normalizeWord(entry.word);
    if (!byWord.has(key)) byWord.set(key, []);
    byWord.get(key).push(entry);
  });

  const conflicts = [];
  byWord.forEach((items, word) => {
    const meanings = new Set(items.map((entry) => normalizeMeaning(entry.meaning)));
    const posValues = new Set(items.map((entry) => entry.pos || ""));
    const needsReview = items.some((entry) => entry.needsReview);
    if (meanings.size <= 1 && !needsReview) return;
    conflicts.push({
      word,
      needsReview,
      meaningCount: meanings.size,
      posValues: Array.from(posValues).filter(Boolean),
      options: items.map((entry) => ({
        id: entry.id,
        meaning: entry.meaning,
        pos: entry.pos,
        type: entry.type,
        aliases: entry.aliases,
        notes: entry.notes,
        sourceCount: entry.sourceCount,
        sampleSources: entry.sources.slice(0, 4)
      }))
    });
  });

  conflicts.sort((left, right) => {
    return Number(right.needsReview) - Number(left.needsReview)
      || right.meaningCount - left.meaningCount
      || left.word.localeCompare(right.word);
  });

  return {
    conflicts,
    blankChineseCandidates: blankChineseCandidates.slice(0, 1000)
  };
}

function slimEntryForBank(entry, options = {}) {
  const inferred = inferEntryPos(entry, options);
  const inferredPos = !entry.pos && inferred.pos ? inferred.pos : "";
  const inferredConfidence = Number(inferred.confidence) || 0;
  return {
    id: entry.id,
    word: entry.word,
    display: entry.display,
    meaning: entry.meaning,
    pos: entry.pos,
    inferredPos: inferredPos || undefined,
    posConfidence: inferredPos ? inferredConfidence : undefined,
    posReason: inferredPos ? inferred.reason : undefined,
    type: entry.type,
    needsReview: Boolean(entry.needsReview && !(inferredPos && inferredConfidence >= 84)),
    aliases: entry.aliases?.length ? entry.aliases : undefined,
    sourceCount: entry.sourceCount
  };
}

function createBankJs(bank) {
  const json = JSON.stringify(bank, null, 2);
  return `(function attachTeacherVocabBank(root, bank) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = bank;
  }
  root.TEACHER_VOCAB_BANK = bank;
})(typeof globalThis !== "undefined" ? globalThis : window, ${json});
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const missingFiles = args.files.filter((file) => !fs.existsSync(file));
  if (missingFiles.length) {
    throw new Error(`File not found: ${missingFiles.join(", ")}`);
  }

  const workbooks = [];
  for (const file of args.files) {
    workbooks.push(await readWorkbook(file));
  }
  const manualUpdates = [];
  for (const file of args.updateFiles) {
    manualUpdates.push(readManualUpdateFile(file));
  }

  const rawEntries = [
    ...workbooks.flatMap((workbook) => workbook.entries),
    ...manualUpdates.flatMap((updateFile) => updateFile.entries)
  ];
  const entries = dedupeEntries(rawEntries);
  const blankChineseCandidates = workbooks.flatMap((workbook) => workbook.blankChineseCandidates);
  const conflictReport = buildConflicts(entries, blankChineseCandidates);
  const uniqueWordCount = new Set(entries.map((entry) => normalizeWord(entry.word))).size;
  const typeCounts = entries.reduce((counts, entry) => {
    counts[entry.type] = (counts[entry.type] || 0) + 1;
    return counts;
  }, {});

  const bank = {
    meta: {
      generatedAt: new Date().toISOString(),
      sourceFiles: workbooks.map((workbook) => ({
        name: path.basename(workbook.filePath),
        sheetCount: workbook.sheetCount,
        rawEntryCount: workbook.entries.length,
        sharedStringCount: workbook.sharedStringCount
      })),
      updateFiles: manualUpdates.map((updateFile) => ({
        name: path.basename(updateFile.filePath),
        rawEntryCount: updateFile.entries.length
      })),
      entryCount: entries.length,
      uniqueWordCount,
      conflictCount: conflictReport.conflicts.length,
      typeCounts
    },
    entries: entries.map((entry) => slimEntryForBank(entry))
  };

  fs.writeFileSync(args.out, createBankJs(bank));
  fs.writeFileSync(args.conflicts, `${JSON.stringify({
    meta: bank.meta,
    ...conflictReport
  }, null, 2)}\n`);

  console.log(`Imported ${entries.length} teacher vocab entries (${uniqueWordCount} unique words).`);
  console.log(`Wrote ${args.out}`);
  console.log(`Wrote ${args.conflicts}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  detectType,
  createManualEntriesFromData,
  dedupeEntries,
  extractEntriesFromRows,
  inferEntryPos,
  readManualUpdateFile,
  normalizeAliases,
  normalizeMeaning,
  normalizePos,
  normalizeWord,
  splitMeanings,
  splitPosFromWord,
  slimEntryForBank
};
