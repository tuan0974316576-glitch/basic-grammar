"use strict";

const fs = require("fs");
const path = require("path");

const DEFAULT_ROOT = "/Users/macbook/Library/CloudStorage/GoogleDrive-austinau99@gmail.com/My Drive/Tutor/ENGLISH LANGUAGE/高中/Longman Pearson English EDGE/EDGE Extra Mock";
const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_OUT_JSON = path.join(ROOT_DIR, "private_exports", "edge_extra_mock_manifest.json");
const DEFAULT_OUT_CSV = path.join(ROOT_DIR, "private_exports", "edge_extra_mock_manifest.csv");

const SOURCE_EXTENSIONS = new Set([".docx", ".doc", ".pdf"]);
const MOCK_SCOPE = new Set(Array.from({ length: 42 }, (_, index) => index + 1));
const PAPER_SCOPE = new Set([1, 2, 3, 4]);

function parseArgs(argv) {
  const options = {
    root: DEFAULT_ROOT,
    outJson: DEFAULT_OUT_JSON,
    outCsv: DEFAULT_OUT_CSV
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root") {
      options.root = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--root=")) {
      options.root = arg.slice("--root=".length);
    } else if (arg === "--out") {
      options.outJson = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--out=")) {
      options.outJson = arg.slice("--out=".length);
    } else if (arg === "--csv") {
      options.outCsv = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--csv=")) {
      options.outCsv = arg.slice("--csv=".length);
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
    "Usage: node scripts/build-edge-extra-mock-manifest.js [--root PATH] [--out private_exports/edge_extra_mock_manifest.json] [--csv private_exports/edge_extra_mock_manifest.csv]",
    "",
    "Builds a private source-selection manifest for Longman Pearson English EDGE Extra Mock files.",
    "DOCX is preferred over DOC, and DOC is preferred over PDF. Temporary files, answer keys, marking schemes, and boilerplate guidelines are skipped."
  ].join("\n"));
}

function walkFiles(root) {
  const files = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    });
  }
  return files.sort((left, right) => left.localeCompare(right));
}

function normalizeName(value) {
  return String(value || "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, "\"")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function getMockNumber(relativePath) {
  const normalized = normalizeName(relativePath);
  const extraMockMatch = normalized.match(/(?:^|\/)Extra Mock\s+(\d+)(?:\/|$)/i);
  if (extraMockMatch) return Number(extraMockMatch[1]);
  const esMatch = normalized.match(/\b(?:CEP_)?ES(\d+)(?:[_\s-]|$)/i);
  if (esMatch) return Number(esMatch[1]);
  return null;
}

function getPaperNumber(relativePath) {
  const normalized = normalizeName(relativePath);
  const pMatch = normalized.match(/(?:^|[\/_\s-])P(?:aper\s*)?([1-4])(?:[\/_\s.()-]|$)/i)
    || normalized.match(/(?:^|[\/_\s-])Paper\s*([1-4])(?:[\/_\s.()-]|$)/i);
  return pMatch ? Number(pMatch[1]) : null;
}

function getExtensionPriority(ext) {
  if (ext === ".docx") return 0;
  if (ext === ".doc") return 1;
  if (ext === ".pdf") return 2;
  return 9;
}

function classifyRole(filePath) {
  const base = path.basename(filePath);
  const lower = normalizeName(base).toLowerCase();
  const fullLower = normalizeName(filePath).toLowerCase();
  if (base.startsWith("~$")) return "temp";
  if (/(?:^|[_\s-])ak(?:$|[_\s.-])/.test(lower)) return "answer";
  if (/(?:^|[_\s-])ms(?:$|[_\s.-])/.test(lower)) return "marking_scheme";
  if (/assessment[_\s-]*guidelines?|marking[_\s-]*guidelines?/.test(lower)) return "guideline";
  if (/marking[_\s-]*schemes?/.test(lower)) return "marking_scheme";
  if (/(?:^|[_\s-])ans(?:$|[_\s.-])|answers?|answer[_\s-]*keys?/.test(lower)) return "answer";
  if (/audio[_\s-]*script/.test(lower)) return "audio_script";
  if (/(?:^|[_\s-])as(?:$|[_\s.-])/.test(lower)) return "audio_script";
  if (/writing[_\s-]*guides?/.test(lower)) return "writing_guide";
  if (/student/.test(lower)) return "student";
  if (/questions?/.test(lower)) return "questions";
  if (/(?:^|[_\s-])(?:df|qa)(?:$|[_\s.-])/.test(lower)) return "questions";
  if (/teacher/.test(lower)) return "teacher";
  if (/paper\s*3/i.test(fullLower)) return "questions";
  return "paper";
}

function isSourceRole(role) {
  return !["temp", "guideline", "marking_scheme", "answer"].includes(role);
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

function getSelectionGroup(role, paper) {
  if (paper === 3 && role === "audio_script") return "audio_script";
  return "primary";
}

function makeCandidate(root, filePath) {
  const relativePath = path.relative(root, filePath);
  const ext = path.extname(filePath).toLowerCase();
  const stat = fs.statSync(filePath);
  const mock = getMockNumber(relativePath);
  const paper = getPaperNumber(relativePath);
  const role = classifyRole(filePath);
  return {
    path: filePath,
    relativePath,
    basename: path.basename(filePath),
    ext,
    bytes: stat.size,
    mock,
    paper,
    role,
    selectionGroup: paper ? getSelectionGroup(role, paper) : "",
    sourceRole: isSourceRole(role),
    extensionPriority: getExtensionPriority(ext),
    rolePriority: paper ? getRolePriority(role, paper) : 9
  };
}

function compareCandidates(left, right) {
  if (left.extensionPriority !== right.extensionPriority) return left.extensionPriority - right.extensionPriority;
  if (left.rolePriority !== right.rolePriority) return left.rolePriority - right.rolePriority;
  if (left.bytes !== right.bytes) return right.bytes - left.bytes;
  return left.relativePath.localeCompare(right.relativePath);
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, "\"\"")}"`;
  return str;
}

function writeCsv(manifest, outCsv) {
  const rows = [[
    "mock",
    "paper",
    "status",
    "selected_count",
    "selected_roles",
    "selected_files",
    "candidate_count",
    "skipped_count",
    "notes"
  ]];
  manifest.records.forEach((record) => {
    rows.push([
      record.mock,
      record.paper,
      record.status,
      record.selectedSources.length,
      record.selectedSources.map((source) => source.role).join(" | "),
      record.selectedSources.map((source) => source.relativePath).join(" | "),
      record.candidates.length,
      record.skipped.length,
      record.notes.join(" | ")
    ]);
  });
  fs.mkdirSync(path.dirname(outCsv), { recursive: true });
  fs.writeFileSync(outCsv, rows.map((row) => row.map(csvEscape).join(",")).join("\n"));
}

function buildManifest(options) {
  const root = path.resolve(options.root);
  if (!fs.existsSync(root)) {
    throw new Error(`EDGE Extra Mock root not found: ${root}`);
  }

  const allFiles = walkFiles(root);
  const allCandidates = allFiles
    .filter((filePath) => SOURCE_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
    .map((filePath) => makeCandidate(root, filePath));

  const considered = [];
  const ignoredFiles = [];
  allCandidates.forEach((candidate) => {
    const ignoredReasons = [];
    if (candidate.role === "temp") ignoredReasons.push("temporary-word-lock-file");
    if (!candidate.mock || !MOCK_SCOPE.has(candidate.mock)) ignoredReasons.push("out-of-scope-or-no-mock-number");
    if (!candidate.paper || !PAPER_SCOPE.has(candidate.paper)) ignoredReasons.push("out-of-scope-or-no-paper-number");
    if (!SOURCE_EXTENSIONS.has(candidate.ext)) ignoredReasons.push("unsupported-extension");

    if (ignoredReasons.length) {
      ignoredFiles.push({ ...candidate, ignoredReasons });
    } else {
      considered.push(candidate);
    }
  });

  const byPaper = new Map();
  considered.forEach((candidate) => {
    const key = `${candidate.mock}|${candidate.paper}`;
    if (!byPaper.has(key)) byPaper.set(key, []);
    byPaper.get(key).push(candidate);
  });

  const records = [];
  for (const mock of Array.from(MOCK_SCOPE).sort((a, b) => a - b)) {
    for (const paper of Array.from(PAPER_SCOPE).sort((a, b) => a - b)) {
      const key = `${mock}|${paper}`;
      const candidates = (byPaper.get(key) || []).sort(compareCandidates);
      const selectedSources = [];
      const skipped = [];
      const notes = [];

      if (!candidates.length) {
        records.push({
          mock,
          paper,
          status: "missing",
          selectedSources,
          candidates,
          skipped,
          notes: ["No DOCX/DOC/PDF candidate found for this mock paper."]
        });
        continue;
      }

      const sourceCandidates = candidates.filter((candidate) => candidate.sourceRole);
      const nonSourceCandidates = candidates.filter((candidate) => !candidate.sourceRole);
      nonSourceCandidates.forEach((candidate) => {
        skipped.push({ ...candidate, skippedReason: `non-source-role:${candidate.role}` });
      });

      if (!sourceCandidates.length) {
        records.push({
          mock,
          paper,
          status: "no-source",
          selectedSources,
          candidates,
          skipped,
          notes: ["Candidates exist, but all are answer keys, marking schemes, guidelines, or temporary files."]
        });
        continue;
      }

      const groups = new Map();
      sourceCandidates.forEach((candidate) => {
        const group = candidate.selectionGroup || "primary";
        if (!groups.has(group)) groups.set(group, []);
        groups.get(group).push(candidate);
      });

      groups.forEach((groupCandidates, group) => {
        const sorted = groupCandidates.sort(compareCandidates);
        selectedSources.push({ ...sorted[0], selectedGroup: group });
        sorted.slice(1).forEach((candidate) => {
          skipped.push({ ...candidate, skippedReason: `duplicate-lower-priority:${group}` });
        });
      });

      if (paper !== 3) {
        const nonPrimary = selectedSources.filter((source) => source.selectedGroup !== "primary");
        nonPrimary.forEach((source) => {
          skipped.push({ ...source, skippedReason: "non-primary-role-for-paper" });
        });
        for (let i = selectedSources.length - 1; i >= 0; i -= 1) {
          if (selectedSources[i].selectedGroup !== "primary") selectedSources.splice(i, 1);
        }
      }

      if (paper === 3 && !selectedSources.some((source) => source.selectedGroup === "audio_script")) {
        notes.push("Paper 3 has no selected audio script; only question/source paper selected.");
      }
      if (!selectedSources.some((source) => source.selectedGroup === "primary")) {
        notes.push("No primary question/student/source paper selected.");
      }

      records.push({
        mock,
        paper,
        status: selectedSources.length ? "selected" : "no-source",
        selectedSources,
        candidates,
        skipped: skipped.sort((left, right) => left.relativePath.localeCompare(right.relativePath)),
        notes
      });
    }
  }

  const summary = {
    root,
    generatedAt: new Date().toISOString(),
    expectedMockCount: MOCK_SCOPE.size,
    expectedPaperCount: MOCK_SCOPE.size * PAPER_SCOPE.size,
    sourceFileCount: allCandidates.length,
    consideredFileCount: considered.length,
    ignoredFileCount: ignoredFiles.length,
    selectedRecordCount: records.filter((record) => record.status === "selected").length,
    missingRecordCount: records.filter((record) => record.status === "missing").length,
    noSourceRecordCount: records.filter((record) => record.status === "no-source").length,
    selectedSourceFileCount: records.reduce((sum, record) => sum + record.selectedSources.length, 0),
    selectedByExtension: {},
    selectedByRole: {}
  };
  records.forEach((record) => {
    record.selectedSources.forEach((source) => {
      summary.selectedByExtension[source.ext] = (summary.selectedByExtension[source.ext] || 0) + 1;
      summary.selectedByRole[source.role] = (summary.selectedByRole[source.role] || 0) + 1;
    });
  });

  return { summary, records, ignoredFiles };
}

function main() {
  const options = parseArgs(process.argv);
  if (options.help) {
    usage();
    return;
  }
  const manifest = buildManifest(options);
  fs.mkdirSync(path.dirname(options.outJson), { recursive: true });
  fs.writeFileSync(options.outJson, JSON.stringify(manifest, null, 2));
  writeCsv(manifest, options.outCsv);
  console.log(JSON.stringify({
    outJson: options.outJson,
    outCsv: options.outCsv,
    summary: manifest.summary
  }, null, 2));
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
  buildManifest,
  classifyRole,
  getMockNumber,
  getPaperNumber
};
