#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

let SpreadsheetFile;
let Workbook;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_INPUT = path.join(ROOT_DIR, "private_exports", "teacher_vocab_review_index.json");
const PRIVATE_ARTIFACT_TOOL = path.join(
  ROOT_DIR,
  "private_exports",
  "node_modules",
  "@oai",
  "artifact-tool",
  "dist",
  "artifact_tool.mjs"
);

try {
  ({ SpreadsheetFile, Workbook } = await import("@oai/artifact-tool"));
} catch (error) {
  try {
    ({ SpreadsheetFile, Workbook } = await import(pathToFileURL(PRIVATE_ARTIFACT_TOOL).href));
  } catch (fallbackError) {
    throw new Error([
      "Cannot load @oai/artifact-tool.",
      "In Codex desktop, run codex_app.load_workspace_dependencies and create a private node_modules symlink if needed:",
      "  ln -s <workspace-dependencies-node_modules> private_exports/node_modules",
      `Original error: ${error.message}`,
      `Fallback error: ${fallbackError.message}`
    ].join("\n"));
  }
}

function parseArgs(argv) {
  const options = {
    input: DEFAULT_INPUT,
    out: "",
    preview: true
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      console.log([
        "Usage:",
        "  node scripts/build-vocab-review-index-xlsx.mjs [index-json] [--out review-index.xlsx] [--no-preview]",
        "",
        "Creates a private XLSX dashboard for teacher vocab review batches."
      ].join("\n"));
      process.exit(0);
    }
    if (arg === "--out") {
      options.out = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg === "--no-preview") {
      options.preview = false;
      continue;
    }
    options.input = path.resolve(arg);
  }

  if (!options.out) {
    options.out = options.input.replace(/\.json$/i, ".xlsx");
  }

  return options;
}

function pct(numerator, denominator) {
  const bottom = Number(denominator) || 0;
  if (!bottom) return 0;
  return (Number(numerator) || 0) / bottom;
}

function statusLabel(status = "") {
  const key = String(status || "").trim();
  if (key === "ready-for-teacher-review") return "Ready for Austin Sir";
  if (key === "promote-plan-created") return "Promote plan created";
  if (key === "applied-or-ready-to-apply") return "Applied / ready";
  if (key === "needs-xlsx") return "Needs XLSX";
  if (key === "missing") return "Missing files";
  return key || "Unknown";
}

function nextAction(batch = {}) {
  if (batch.promotePlanExists || batch.applyPlanExists) return "Check promote plan, then apply after review";
  if (batch.reviewedEntryCount > 0) return "Build promote plan from reviewed XLSX";
  if (batch.xlsxExists) return "Open XLSX and fill yellow review columns";
  if (batch.jsonExists || batch.csvExists) return "Generate XLSX";
  return "Regenerate missing batch";
}

function fileYesNo(value) {
  return value ? "YES" : "NO";
}

function getReviewKind(index = {}) {
  const prefix = String(index.meta?.prefix || "").trim();
  if (/^oxford_/i.test(prefix)) {
    return {
      label: "Oxford Vocab",
      tableName: "OxfordVocabReviewIndex",
      purpose: "呢份係私有總覽，幫你管理 Oxford / common vocab review Excel。唔會放入 app，唔會 commit。"
    };
  }
  return {
    label: "Teacher Vocab",
    tableName: "TeacherVocabReviewIndex",
    purpose: "呢份係私有總覽，幫你管理 teacher vocab review Excel。唔會放入 app，唔會 commit。"
  };
}

function buildBatchRows(index = {}) {
  return (index.batches || []).map((batch) => {
    const entryCount = Number(batch.entryCount) || 0;
    const reviewedEntryCount = Number(batch.reviewedEntryCount) || 0;
    const start = Number(batch.offset) || 0;
    const end = Math.max(start, (Number(batch.nextOffset) || start) - 1);
    return [
      batch.id || "",
      statusLabel(batch.status),
      start,
      end,
      entryCount,
      reviewedEntryCount,
      pct(reviewedEntryCount, entryCount),
      nextAction(batch),
      fileYesNo(batch.jsonExists),
      fileYesNo(batch.csvExists),
      fileYesNo(batch.xlsxExists),
      fileYesNo(batch.promotePlanExists),
      batch.xlsx || "",
      batch.json || "",
      batch.csv || "",
      batch.promotePlan || "",
      batch.generatedAt || ""
    ];
  });
}

function summaryRows(index = {}) {
  const meta = index.meta || {};
  const batches = index.batches || [];
  const totalEntries = batches.reduce((sum, batch) => sum + (Number(batch.entryCount) || 0), 0);
  const reviewedEntries = batches.reduce((sum, batch) => sum + (Number(batch.reviewedEntryCount) || 0), 0);
  const needsXlsx = batches.filter((batch) => batch.status === "needs-xlsx").length;
  const ready = batches.filter((batch) => batch.status === "ready-for-teacher-review").length;
  const promotePlans = Number(meta.promotePlanBatchCount) || batches.filter((batch) => batch.promotePlanExists).length;
  return [
    ["Generated at", meta.generatedAt || ""],
    ["Private only", meta.privateOnly ? "YES" : ""],
    ["Batch prefix", meta.prefix || ""],
    ["Total candidate entries", Number(meta.totalCandidateCount) || 0],
    ["Covered entries", Number(meta.coveredCount) || 0],
    ["Coverage", pct(meta.coveredCount, meta.totalCandidateCount)],
    ["Batch count", Number(meta.batchCount) || batches.length],
    ["Ready-for-review batches", Number(meta.readyForReviewBatchCount) || ready],
    ["Needs XLSX batches", needsXlsx],
    ["Promote-plan batches", promotePlans],
    ["Reviewed entries inside batches", reviewedEntries],
    ["Review progress", pct(reviewedEntries, totalEntries)],
    ["Next offset", Number(meta.nextOffset) || 0],
    ["Next batch id", meta.nextBatchId || ""]
  ];
}

function guideRows(index = {}) {
  const kind = getReviewKind(index);
  return [
    ["Purpose", kind.purpose],
    ["Step 1", "由 Batches 頁開對應 XLSX，逐行清理黃色欄位。"],
    ["Step 2", "每行填 reviewed POS、reviewed meaning、promote to。錯字 / 垃圾資料就 skip。"],
    ["Step 3", "清好一份後，用 promote-plan 工具建立 plan，再 apply-plan --write。"],
    ["Meaning rule", "學生見到的解釋要短、自然、準確。老師筆記優先，字典 draft 只作參考。"],
    ["POS rule", "常用 POS：n. / v. / adj. / adv. / prep. / conj. / pron. / det. / modal v. / ph. / pt."],
    ["Privacy", "private_exports 入面有學生 account、review Excel、Oxford 私有資料，唔好 commit / share。"]
  ];
}

function styleTitle(sheet, range, title) {
  sheet.getRange(range).merge();
  sheet.getRange(range.split(":")[0]).values = [[title]];
  sheet.getRange(range).format = {
    fill: "#2F7D5C",
    font: { bold: true, color: "#FFFFFF", size: 15 },
    horizontalAlignment: "center",
    verticalAlignment: "middle"
  };
}

function styleHeader(range) {
  range.format = {
    fill: "#2F7D5C",
    font: { bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    verticalAlignment: "middle",
    wrapText: true
  };
}

async function buildWorkbook(index = {}, options = {}) {
  const kind = getReviewKind(index);
  const workbook = Workbook.create();
  const summary = workbook.worksheets.add("Summary");
  const batches = workbook.worksheets.add("Batches");
  const guide = workbook.worksheets.add("Guide");

  [summary, batches, guide].forEach((sheet) => {
    sheet.showGridLines = false;
  });

  styleTitle(summary, "A1:D1", `${kind.label} Review Index`);
  const summaryData = summaryRows(index);
  summary.getRangeByIndexes(2, 0, summaryData.length, 2).values = summaryData;
  summary.getRangeByIndexes(2, 0, summaryData.length, 1).format = {
    fill: "#E6F3EA",
    font: { bold: true, color: "#1F2937" }
  };
  summary.getRangeByIndexes(2, 0, summaryData.length, 2).format = {
    borders: { preset: "all", style: "thin", color: "#D1D5DB" },
    font: { name: "Aptos", size: 11, color: "#1F2937" },
    verticalAlignment: "middle"
  };
  summary.getRange("B3:B3").format.numberFormat = "yyyy-mm-dd hh:mm";
  summary.getRange("B6:B7").format.numberFormat = "0";
  summary.getRange("B8:B8").format.numberFormat = "0.0%";
  summary.getRange("B9:B13").format.numberFormat = "0";
  summary.getRange("B14:B14").format.numberFormat = "0.0%";
  summary.getRange("B15:B15").format.numberFormat = "0";
  summary.getRange("B16:B16").format.numberFormat = "0000";
  summary.getRange("A:A").format.columnWidth = 30;
  summary.getRange("B:B").format.columnWidth = 26;

  const batchHeaders = [
    "batch id",
    "status",
    "from",
    "to",
    "entries",
    "reviewed",
    "review %",
    "next action",
    "json",
    "csv",
    "xlsx",
    "promote plan",
    "xlsx path",
    "json path",
    "csv path",
    "promote plan path",
    "generated at"
  ];
  const batchRows = buildBatchRows(index);
  styleTitle(batches, "A1:Q1", `${kind.label} Review Batches`);
  batches.getRangeByIndexes(2, 0, 1, batchHeaders.length).values = [batchHeaders];
  if (batchRows.length) {
    batches.getRangeByIndexes(3, 0, batchRows.length, batchHeaders.length).values = batchRows;
  }
  const batchUsedRows = Math.max(1, batchRows.length + 1);
  batches.getRangeByIndexes(2, 0, batchUsedRows, batchHeaders.length).format = {
    font: { name: "Aptos", size: 10, color: "#1F2937" },
    borders: {
      insideHorizontal: { style: "thin", color: "#E5E7EB" },
      top: { style: "thin", color: "#D1D5DB" },
      bottom: { style: "thin", color: "#D1D5DB" }
    },
    verticalAlignment: "top",
    wrapText: true
  };
  styleHeader(batches.getRangeByIndexes(2, 0, 1, batchHeaders.length));
  if (batchRows.length) {
    const table = batches.tables.add(`A3:Q${batchRows.length + 3}`, true, kind.tableName);
    table.style = "TableStyleMedium4";
    table.showFilterButton = true;
    batches.getRange(`G4:G${batchRows.length + 3}`).format.numberFormat = "0.0%";
    batches.getRange(`A4:A${batchRows.length + 3}`).format.numberFormat = "0000";
    batches.getRange(`Q4:Q${batchRows.length + 3}`).format.numberFormat = "yyyy-mm-dd hh:mm";
    batches.getRange(`I4:L${batchRows.length + 3}`).format = {
      horizontalAlignment: "center",
      verticalAlignment: "middle"
    };
  }
  [
    ["A:A", 11],
    ["B:B", 24],
    ["C:F", 10],
    ["G:G", 11],
    ["H:H", 34],
    ["I:L", 12],
    ["M:P", 42],
    ["Q:Q", 24]
  ].forEach(([range, width]) => {
    batches.getRange(range).format.columnWidth = width;
  });
  batches.freezePanes.freezeRows(3);
  batches.freezePanes.freezeColumns(1);

  styleTitle(guide, "A1:B1", "How To Use");
  const guideData = guideRows(index);
  guide.getRangeByIndexes(2, 0, guideData.length, 2).values = guideData;
  guide.getRangeByIndexes(2, 0, guideData.length, 1).format = {
    fill: "#E6F3EA",
    font: { bold: true }
  };
  guide.getRangeByIndexes(2, 0, guideData.length, 2).format = {
    borders: { preset: "all", style: "thin", color: "#D1D5DB" },
    font: { name: "Aptos", size: 11, color: "#1F2937" },
    wrapText: true,
    verticalAlignment: "top"
  };
  guide.getRange("A:A").format.columnWidth = 20;
  guide.getRange("B:B").format.columnWidth = 92;
  guide.getRangeByIndexes(2, 0, guideData.length, 2).format.autofitRows();

  if (options.inspect !== false) {
    const check = await workbook.inspect({
      kind: "table",
      range: "Batches!A3:Q8",
      include: "values",
      tableMaxRows: 6,
      tableMaxCols: 17,
      maxChars: 4000
    });
    console.log(check.ndjson);

    const errors = await workbook.inspect({
      kind: "match",
      searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
      options: { useRegex: true, maxResults: 50 },
      summary: "formula error scan",
      maxChars: 1000
    });
    console.log(errors.ndjson);
  }

  return workbook;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const source = JSON.parse(await fs.readFile(options.input, "utf8"));
  const workbook = await buildWorkbook(source);

  if (options.preview) {
    const previews = [
      ["Summary", "A1:D18", ".summary.preview.png"],
      ["Batches", "A1:Q20", ".batches.preview.png"],
      ["Guide", "A1:B12", ".guide.preview.png"]
    ];
    for (const [sheetName, range, suffix] of previews) {
      const preview = await workbook.render({
        sheetName,
        range,
        scale: 1,
        format: "png"
      });
      await fs.writeFile(options.out.replace(/\.xlsx$/i, suffix), new Uint8Array(await preview.arrayBuffer()));
    }
  }

  await fs.mkdir(path.dirname(options.out), { recursive: true });
  const xlsx = await SpreadsheetFile.exportXlsx(workbook);
  await xlsx.save(options.out);
  console.log(`Wrote ${options.out}`);
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || "")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export {
  buildBatchRows,
  buildWorkbook,
  guideRows,
  nextAction,
  parseArgs,
  statusLabel,
  summaryRows
};
