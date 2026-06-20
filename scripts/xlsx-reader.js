#!/usr/bin/env node
"use strict";

const yauzl = require("yauzl");
const sax = require("sax");

const XML_REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

function xmlLocalName(name = "") {
  return String(name).includes(":") ? String(name).split(":").pop() : String(name);
}

function readAttribute(node, localName, namespace = "") {
  const attrs = Object.values(node.attributes || {});
  const match = attrs.find((attr) => {
    const sameName = attr.local === localName || attr.name === localName || xmlLocalName(attr.name) === localName;
    return sameName && (!namespace || attr.uri === namespace);
  });
  return match ? match.value : "";
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

function readWorkbookSheetRefs(entries) {
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

function parseCellValue(cell, sharedStrings) {
  const value = cell.value;
  if (!value) return "";
  if (cell.type === "s") {
    const index = Number(value);
    return Number.isInteger(index) && sharedStrings[index] ? String(sharedStrings[index]).trim() : "";
  }
  if (cell.type === "b") return value === "1" ? "TRUE" : "FALSE";
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
      if (inValue || inInlineText) currentCell.value += text;
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

function normalizeHeader(value = "") {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();
}

function rowsToObjects(rows = []) {
  const headerIndex = rows.findIndex((row) => Object.values(row).some((value) => String(value || "").trim()));
  if (headerIndex < 0) return [];
  const headerRow = rows[headerIndex] || {};
  const headers = Object.keys(headerRow)
    .map(Number)
    .sort((left, right) => left - right)
    .map((column) => ({ column, header: normalizeHeader(headerRow[column]) }))
    .filter((item) => item.header);

  return rows.slice(headerIndex + 1).map((row) => {
    const objectRow = {};
    headers.forEach(({ column, header }) => {
      objectRow[header] = String(row[column] || "").trim();
    });
    return objectRow;
  }).filter((row) => Object.values(row).some(Boolean));
}

async function readWorkbook(filePath) {
  const zipEntries = await readZipEntries(filePath);
  const sharedStrings = readSharedStrings(zipEntries);
  const sheets = readWorkbookSheetRefs(zipEntries);
  return {
    filePath,
    sheetCount: sheets.length,
    sharedStringCount: sharedStrings.length,
    sheets: sheets.map((sheet) => {
      const rows = readWorksheetRows(zipEntries, sheet.fileName, sharedStrings);
      return {
        ...sheet,
        rows,
        objects: rowsToObjects(rows)
      };
    })
  };
}

module.exports = {
  columnIndexFromRef,
  columnName,
  normalizeHeader,
  readWorkbook,
  readWorkbookSheetRefs,
  readWorksheetRows,
  readSharedStrings,
  readZipEntries,
  rowsToObjects
};
