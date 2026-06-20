#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

let SpreadsheetFile;
let Workbook;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_INPUT = path.join(ROOT_DIR, "private_exports", "vocab_review_batch_0000.json");
const PRIVATE_ARTIFACT_TOOL = path.join(ROOT_DIR, "private_exports", "node_modules", "@oai", "artifact-tool", "dist", "artifact_tool.mjs");

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
        "  node scripts/build-vocab-review-xlsx.mjs [review-json] [--out review.xlsx] [--no-preview]",
        "",
        "Creates a private XLSX workbook for Austin Sir to review vocab POS / meanings / promotion target."
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

function entryText(entry = {}) {
  const pos = entry.posLabel || (entry.type === "phrase" ? "ph." : "");
  return `${pos ? `${pos} ` : ""}${entry.meaning || ""}`.trim();
}

function entriesText(entries = []) {
  return entries.map(entryText).filter(Boolean).join(" | ");
}

function truncate(value, max = 900) {
  const text = String(value || "");
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function buildRows(entries = []) {
  return entries.map((row) => [
    row.word || "",
    row.level || "",
    row.type || "",
    row.audit?.reasons?.join(" / ") || "",
    row.audit?.originalMeaning
      ? `${row.audit.originalPos ? `${row.audit.originalPos} ` : ""}${row.audit.originalMeaning}`
      : "",
    row.oxford?.posLabels?.join(" / ") || "",
    truncate(entriesText(row.existing?.teacher || [])),
    truncate(entriesText(row.existing?.curated || [])),
    truncate(entriesText(row.drafts?.ecdict || [])),
    truncate(entriesText(row.drafts?.generatedSeed || [])),
    truncate(entriesText(row.drafts?.ccCedictReverse || [])),
    row.flags?.join(" / ") || "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ]);
}

function guideRows(source, entries) {
  return [
    ["Source", source.meta?.source || ""],
    ["Offset", source.meta?.offset ?? ""],
    ["Selected", source.meta?.selectedCount ?? entries.length],
    ["Total candidates", source.meta?.totalCandidateCount ?? ""],
    ["Next offset", source.meta?.nextOffset ?? ""],
    ["Private only", "Yes"],
    ["Reminder", "ECDICT / CC-CEDICT / generated drafts 只係參考材料；一定要改乾淨先 promote."],
    ["", ""],
    ["How to fill", "只需要填 Review Batch 入面黃色欄位。"],
    ["reviewed POS", "填 n. / v. / adj. / adv. / prep. / conj. / pron. / det. / modal v. / ph. / pt."],
    ["reviewed meaning", "填學生應該見到的乾淨中文意思，短、自然、準確。"],
    ["promote to", "teacher = Austin Sir 上堂字庫；curated = 通用乾淨補充字典；skip = 不加入。"],
    ["multi-meaning", "同一個字有多個常用意思時，可填 reviewed POS 2 / meaning 2 / promote to 2；最多 3 個意思。"],
    ["replace type", "普通新增可以留空。清走舊 teacher-bank 錯意思 / 垃圾資料時先填 yes。"],
    ["notes", "可留空。可寫 typo、alias、或者點解 skip。"],
    ["", ""],
    ["Examples", "如果 word 係 guility，應該修正 spelling / notes，再決定 promote 或 skip；錯串字不要直接畀學生見。"],
    ["Examples", "如果 ha = 只好 呢類明顯 spreadsheet junk，promote to 填 skip。"],
    ["Examples", "如果一個字有兩三個真正常用意思，而都想畀學生揀，用 reviewed POS 2/3 同 meaning 2/3。"]
  ];
}

async function buildWorkbook(source, options = {}) {
  const entries = Array.isArray(source.entries) ? source.entries : [];
  const workbook = Workbook.create();
  const sheet = workbook.worksheets.add("Review Batch");
  const guide = workbook.worksheets.add("Guide");

  const headers = [
    "word",
    "level",
    "type",
    "audit reasons",
    "original teacher entry",
    "Oxford POS",
    "Existing teacher",
    "Existing curated",
    "ECDICT draft",
    "Generated draft",
    "CC-CEDICT draft",
    "flags",
    "reviewed POS",
    "reviewed meaning",
    "promote to",
    "reviewed POS 2",
    "reviewed meaning 2",
    "promote to 2",
    "reviewed POS 3",
    "reviewed meaning 3",
    "promote to 3",
    "replace type",
    "notes"
  ];

  const rows = buildRows(entries);
  sheet.showGridLines = false;
  guide.showGridLines = false;
  sheet.getRangeByIndexes(0, 0, 1, headers.length).values = [headers];
  if (rows.length) {
    sheet.getRangeByIndexes(1, 0, rows.length, headers.length).values = rows;
  }

  const usedRange = sheet.getRangeByIndexes(0, 0, Math.max(1, rows.length + 1), headers.length);
  usedRange.format = {
    font: { name: "Aptos", size: 10, color: "#1F2937" },
    borders: {
      insideHorizontal: { style: "thin", color: "#E5E7EB" },
      top: { style: "thin", color: "#D1D5DB" },
      bottom: { style: "thin", color: "#D1D5DB" }
    },
    wrapText: true,
    verticalAlignment: "top"
  };

  sheet.getRangeByIndexes(0, 0, 1, headers.length).format = {
    fill: "#2F7D5C",
    font: { bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    verticalAlignment: "middle"
  };

  sheet.getRangeByIndexes(1, 12, Math.max(1, rows.length), 11).format = {
    fill: "#FFF7D6",
    borders: { preset: "all", style: "thin", color: "#E8C65F" },
    wrapText: true,
    verticalAlignment: "top"
  };

  [
    ["A:A", 18],
    ["B:B", 8],
    ["C:C", 10],
    ["D:D", 30],
    ["E:E", 30],
    ["F:F", 14],
    ["G:H", 26],
    ["I:K", 30],
    ["L:L", 32],
    ["M:M", 14],
    ["N:N", 24],
    ["O:O", 16],
    ["P:P", 14],
    ["Q:Q", 24],
    ["R:R", 16],
    ["S:S", 14],
    ["T:T", 24],
    ["U:U", 16],
    ["V:V", 14],
    ["W:W", 24]
  ].forEach(([range, width]) => {
    sheet.getRange(range).format.columnWidth = width;
  });
  sheet.getRangeByIndexes(0, 0, rows.length + 1, headers.length).format.autofitRows();
  sheet.freezePanes.freezeRows(1);
  sheet.freezePanes.freezeColumns(1);

  if (rows.length) {
    const tableRange = `A1:W${rows.length + 1}`;
    const table = sheet.tables.add(tableRange, true, "VocabReviewBatch");
    table.style = "TableStyleMedium4";
    table.showFilterButton = true;
    ["M", "P", "S"].forEach((column) => {
      sheet.dataValidations.add({
        range: `${column}2:${column}${rows.length + 1}`,
        rule: { type: "list", values: ["n.", "v.", "adj.", "adv.", "prep.", "conj.", "pron.", "det.", "modal v.", "ph.", "pt."] }
      });
    });
    ["O", "R", "U"].forEach((column) => {
      sheet.dataValidations.add({
        range: `${column}2:${column}${rows.length + 1}`,
        rule: { type: "list", values: ["curated", "teacher", "skip", "needs class example"] }
      });
    });
    sheet.dataValidations.add({
      range: `V2:V${rows.length + 1}`,
      rule: { type: "list", values: ["", "yes", "no"] }
    });
  }

  guide.getRange("A1:D1").merge();
  guide.getRange("A1").values = [["Vocabulary Review Batch"]];
  guide.getRange("A1").format = {
    fill: "#2F7D5C",
    font: { bold: true, color: "#FFFFFF", size: 14 },
    horizontalAlignment: "center"
  };
  const guideTableRows = guideRows(source, entries);
  guide.getRangeByIndexes(2, 0, guideTableRows.length, 2).values = guideTableRows;
  guide.getRangeByIndexes(2, 0, guideTableRows.length, 1).format = { fill: "#E6F3EA", font: { bold: true } };
  guide.getRangeByIndexes(2, 0, guideTableRows.length, 2).format = {
    borders: { preset: "all", style: "thin", color: "#D1D5DB" },
    wrapText: true
  };
  guide.getRange("A:B").format.columnWidth = 28;
  guide.getRange("B:B").format.columnWidth = 74;

  if (options.inspect !== false) {
    const check = await workbook.inspect({
      kind: "table",
      range: "Review Batch!A1:W6",
      include: "values",
      tableMaxRows: 6,
      tableMaxCols: 23,
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
    const preview = await workbook.render({
      sheetName: "Review Batch",
      range: "A1:Q20",
      scale: 1,
      format: "png"
    });
    await fs.writeFile(options.out.replace(/\.xlsx$/i, ".preview.png"), new Uint8Array(await preview.arrayBuffer()));
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
  buildRows,
  buildWorkbook,
  entriesText,
  guideRows,
  parseArgs,
  truncate
};
