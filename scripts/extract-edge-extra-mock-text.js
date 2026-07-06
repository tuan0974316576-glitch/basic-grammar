"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_MANIFEST = path.join(ROOT_DIR, "private_exports", "edge_extra_mock_manifest.json");
const DEFAULT_OUT_JSON = path.join(ROOT_DIR, "private_exports", "edge_extra_mock_text_corpus.json");
const DEFAULT_OUT_DIR = path.join(ROOT_DIR, "private_exports", "edge_extra_mock_text");
const BUNDLED_PYTHON = "/Users/macbook/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";

function parseArgs(argv) {
  const options = {
    manifest: DEFAULT_MANIFEST,
    outJson: DEFAULT_OUT_JSON,
    outDir: DEFAULT_OUT_DIR,
    python: fs.existsSync(BUNDLED_PYTHON) ? BUNDLED_PYTHON : "python3"
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--manifest") {
      options.manifest = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--manifest=")) {
      options.manifest = arg.slice("--manifest=".length);
    } else if (arg === "--out") {
      options.outJson = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--out=")) {
      options.outJson = arg.slice("--out=".length);
    } else if (arg === "--out-dir") {
      options.outDir = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--out-dir=")) {
      options.outDir = arg.slice("--out-dir=".length);
    } else if (arg === "--python") {
      options.python = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--python=")) {
      options.python = arg.slice("--python=".length);
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function usage() {
  console.log([
    "Usage: node scripts/extract-edge-extra-mock-text.js [--manifest private_exports/edge_extra_mock_manifest.json]",
    "",
    "Extracts text from the selected EDGE Extra Mock source files into private_exports."
  ].join("\n"));
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function sha1(value) {
  return crypto.createHash("sha1").update(value).digest("hex");
}

function getTextutilFormat(ext) {
  if (ext === ".docx") return "docx";
  if (ext === ".doc") return "doc";
  return "";
}

function extractWordText(filePath, ext) {
  const format = getTextutilFormat(ext);
  if (!format) throw new Error(`Unsupported Word extension: ${ext}`);
  const output = execFileSync("textutil", ["-convert", "txt", "-format", format, "-stdout", filePath], {
    encoding: "utf8",
    maxBuffer: 80 * 1024 * 1024
  });
  return normalizeText(output);
}

function extractPdfText(filePath, python) {
  const code = [
    "import sys",
    "path = sys.argv[1]",
    "text = ''",
    "try:",
    "    import pdfplumber",
    "    parts = []",
    "    with pdfplumber.open(path) as pdf:",
    "        for page in pdf.pages:",
    "            parts.append(page.extract_text() or '')",
    "    text = '\\n\\n'.join(parts)",
    "except Exception:",
    "    try:",
    "        from pypdf import PdfReader",
    "        reader = PdfReader(path)",
    "        text = '\\n\\n'.join((page.extract_text() or '') for page in reader.pages)",
    "    except Exception as exc:",
    "        raise SystemExit(str(exc))",
    "sys.stdout.write(text)"
  ].join("\n");
  const output = execFileSync(python, ["-c", code, filePath], {
    encoding: "utf8",
    maxBuffer: 120 * 1024 * 1024
  });
  return normalizeText(output);
}

function extractFile(filePath, python) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".docx" || ext === ".doc") return extractWordText(filePath, ext);
  if (ext === ".pdf") return extractPdfText(filePath, python);
  throw new Error(`Unsupported extension: ${ext}`);
}

function makeOutputName(source) {
  const suffix = sha1(source.path).slice(0, 10);
  const base = `${String(source.mock).padStart(2, "0")}_P${source.paper}_${source.role}_${suffix}.txt`;
  return base.replace(/[^a-zA-Z0-9_.-]+/g, "_");
}

function getExtensionPriority(ext) {
  if (ext === ".docx") return 0;
  if (ext === ".doc") return 1;
  if (ext === ".pdf") return 2;
  return 9;
}

function getRolePriority(role, paper) {
  if (paper === 3 && role === "audio_script") return 0;
  if (role === "questions") return 1;
  if (role === "student") return 2;
  if (role === "paper") return 3;
  if (role === "teacher") return 4;
  if (role === "writing_guide") return 5;
  if (role === "audio_script") return 6;
  return 9;
}

function compareCandidates(left, right) {
  const leftExt = getExtensionPriority(left.ext);
  const rightExt = getExtensionPriority(right.ext);
  if (leftExt !== rightExt) return leftExt - rightExt;
  const leftRole = getRolePriority(left.role, left.paper);
  const rightRole = getRolePriority(right.role, right.paper);
  if (leftRole !== rightRole) return leftRole - rightRole;
  if (left.bytes !== right.bytes) return right.bytes - left.bytes;
  return String(left.relativePath || "").localeCompare(String(right.relativePath || ""));
}

function candidateKey(source) {
  return source.path || source.sourcePath || source.relativePath;
}

function getFallbackCandidates(record, selectedSource) {
  const selectedGroup = selectedSource.selectedGroup || selectedSource.selectionGroup || "primary";
  return (record.candidates || [])
    .filter((candidate) => candidate.sourceRole)
    .filter((candidate) => (candidate.selectionGroup || "primary") === selectedGroup)
    .filter((candidate) => candidateKey(candidate) !== candidateKey(selectedSource))
    .map((candidate) => ({ ...candidate, mock: record.mock, paper: record.paper }))
    .sort((left, right) => {
      const leftSameRole = left.role === selectedSource.role ? 0 : 1;
      const rightSameRole = right.role === selectedSource.role ? 0 : 1;
      if (leftSameRole !== rightSameRole) return leftSameRole - rightSameRole;
      return compareCandidates(left, right);
    });
}

function extractSourceWithFallback(record, selectedSource, python) {
  const attempts = [
    { ...selectedSource, mock: record.mock, paper: record.paper },
    ...getFallbackCandidates(record, selectedSource)
  ];
  const errors = [];
  for (const source of attempts) {
    try {
      const text = extractFile(source.path, python);
      if (text.length) {
        return {
          source,
          text,
          fallbackFrom: candidateKey(source) === candidateKey(selectedSource) ? "" : selectedSource.relativePath,
          errors
        };
      }
      errors.push({ relativePath: source.relativePath, error: "empty-text" });
    } catch (error) {
      errors.push({ relativePath: source.relativePath, error: String(error && error.message ? error.message : error) });
    }
  }
  return {
    source: { ...selectedSource, mock: record.mock, paper: record.paper },
    text: "",
    fallbackFrom: "",
    errors
  };
}

function main() {
  const options = parseArgs(process.argv);
  if (options.help) {
    usage();
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(options.manifest, "utf8"));
  const selectedPairs = manifest.records.flatMap((record) => (
    record.selectedSources.map((source) => ({ record, source }))
  ));
  fs.mkdirSync(options.outDir, { recursive: true });
  const records = [];
  const failures = [];
  selectedPairs.forEach(({ record, source: selectedSource }, index) => {
    try {
      const extraction = extractSourceWithFallback(record, selectedSource, options.python);
      const source = extraction.source;
      const text = extraction.text;
      const outName = makeOutputName(source);
      const outPath = path.join(options.outDir, outName);
      fs.writeFileSync(outPath, text);
      const wordMatches = text.match(/[A-Za-z][A-Za-z'-]*/g) || [];
      records.push({
        index,
        mock: source.mock,
        paper: source.paper,
        role: source.role,
        ext: source.ext,
        sourcePath: source.path,
        relativePath: source.relativePath,
        textPath: outPath,
        textBytes: Buffer.byteLength(text, "utf8"),
        charCount: text.length,
        roughWordCount: wordMatches.length,
        sha1: sha1(text),
        status: text.length ? "ok" : "empty",
        fallbackFrom: extraction.fallbackFrom,
        extractionErrors: extraction.errors
      });
    } catch (error) {
      failures.push({
        index,
        mock: record.mock,
        paper: record.paper,
        role: selectedSource.role,
        ext: selectedSource.ext,
        sourcePath: selectedSource.path,
        relativePath: selectedSource.relativePath,
        error: String(error && error.message ? error.message : error)
      });
    }
  });
  const summary = {
    generatedAt: new Date().toISOString(),
    manifest: options.manifest,
    selectedSourceCount: selectedPairs.length,
    extractedCount: records.length,
    failureCount: failures.length,
    emptyCount: records.filter((record) => record.status === "empty").length,
    fallbackCount: records.filter((record) => record.fallbackFrom).length,
    totalChars: records.reduce((sum, record) => sum + record.charCount, 0),
    totalRoughWords: records.reduce((sum, record) => sum + record.roughWordCount, 0),
    byExtension: {},
    byRole: {}
  };
  records.forEach((record) => {
    summary.byExtension[record.ext] = (summary.byExtension[record.ext] || 0) + 1;
    summary.byRole[record.role] = (summary.byRole[record.role] || 0) + 1;
  });
  const corpus = { summary, records, failures };
  fs.mkdirSync(path.dirname(options.outJson), { recursive: true });
  fs.writeFileSync(options.outJson, JSON.stringify(corpus, null, 2));
  console.log(JSON.stringify({ outJson: options.outJson, outDir: options.outDir, summary }, null, 2));
  if (failures.length) {
    console.error(`Extraction failures: ${failures.length}`);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  }
}

module.exports = {
  extractFile,
  normalizeText
};
