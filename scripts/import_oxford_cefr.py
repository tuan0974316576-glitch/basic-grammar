#!/usr/bin/env python3
import json
import re
import sys
from collections import Counter
from pathlib import Path

from pypdf import PdfReader


LEVELS = {"A1", "A2", "B1", "B2", "C1"}
LEVEL_ORDER = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5}
ENTRY_RE = re.compile(
    r"^(?P<term>[A-Za-z][A-Za-z0-9 .,/()\-’‘]+?)\s+"
    r"(?P<pos>(?:indefinite article|modal v\.|auxiliary v\.|"
    r"[a-z]+\.|number|det\./pron\./adv\.|det\./pron\.|exclam\./n\.|"
    r"n\., v\.|v\., n\.|adj\., n\.|adj\., adv\.|prep\., adv\.|adv\., prep\.|"
    r"n\., adj\., adv\.|n\., adj\.|n\., v\., adj\.|adj\., v\.|"
    r"det\., pron\.|det\., pron\., adv\.|pron\.|prep\.|adv\.|adj\.|n\.|v\.|conj\.)"
    r"(?:.*)?)$"
)


def normalize_word(value):
    text = str(value or "").strip()
    text = text.replace("\u00a0", " ").replace("’", "'").replace("‘", "'")
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\d+$", "", text).strip()
    text = re.sub(r"\s*\([^)]*\)", "", text).strip()
    return text.lower()


def normalize_display(value):
    text = str(value or "").strip()
    text = text.replace("\u00a0", " ").replace("’", "'").replace("‘", "'")
    text = re.sub(r"\s+", " ", text)
    return re.sub(r"\d+$", "", text).strip()


def normalize_pos_tags(value):
    text = str(value or "").lower()
    tags = []
    if "indefinite article" in text:
        tags.append("determiner")
    if "modal" in text:
        tags.append("modal")
    if "auxiliary" in text:
        tags.append("auxiliary")
    mapping = {
        "n": "noun",
        "v": "verb",
        "adj": "adjective",
        "adv": "adverb",
        "prep": "preposition",
        "pron": "pronoun",
        "det": "determiner",
        "conj": "conjunction",
        "exclam": "exclamation",
    }
    raw_parts = re.split(r"[,/]\s*", text.replace(".", " "))
    for raw_part in raw_parts:
        key = raw_part.strip()
        pos = mapping.get(key)
        if pos and pos not in tags:
            tags.append(pos)
    if "number" in text and "number" not in tags:
        tags.append("number")
    return tags


def clean_line(raw):
    line = str(raw or "").replace("\u00a0", " ").strip()
    line = re.sub(r"^© Oxford University Press \d+ / \d+\s*", "", line).strip()
    line = re.sub(r"^The Oxford \d+™? by CEFR level\s*", "", line).strip()
    return line


def parse_pdf(pdf_path):
    current_level = None
    entries = []
    reader = PdfReader(str(pdf_path))
    for page in reader.pages:
        text = page.extract_text() or ""
        for raw_line in text.splitlines():
            line = clean_line(raw_line)
            if not line:
                continue
            if line in LEVELS:
                current_level = line
                continue
            joined_level = re.match(r"^(A1|A2|B1|B2|C1)\s+(.+)$", line)
            if joined_level:
                current_level = joined_level.group(1)
                line = joined_level.group(2).strip()
            if not current_level:
                continue
            match = ENTRY_RE.match(line)
            if not match:
                continue
            display = normalize_display(match.group("term"))
            word = normalize_word(display)
            if not word:
                continue
            entries.append({
                "word": word,
                "display": display,
                "level": current_level,
                "pos": normalize_pos_tags(match.group("pos")),
                "posRaw": match.group("pos"),
                "source": pdf_path.name,
            })
    return entries


def main(argv):
    if not argv:
        print("Expected PDF path arguments.", file=sys.stderr)
        return 1

    raw_entries = []
    source_files = []
    for arg in argv:
        pdf_path = Path(arg)
        if not pdf_path.exists():
            print(f"PDF not found: {pdf_path}", file=sys.stderr)
            return 1
        parsed = parse_pdf(pdf_path)
        raw_entries.extend(parsed)
        source_files.append({
            "name": pdf_path.name,
            "entryCount": len(parsed),
        })

    seen = set()
    entries = []
    for entry in raw_entries:
        key = (entry["word"], entry["level"], entry["posRaw"])
        if key in seen:
            continue
        seen.add(key)
        entries.append(entry)

    word_level = {}
    for entry in entries:
        existing_level = word_level.get(entry["word"])
        if not existing_level or LEVEL_ORDER[entry["level"]] < LEVEL_ORDER[existing_level]:
            word_level[entry["word"]] = entry["level"]

    entries.sort(key=lambda entry: (
        LEVEL_ORDER.get(entry["level"], 99),
        entry["word"],
        entry["posRaw"],
    ))

    level_counts = Counter(entry["level"] for entry in entries)
    unique_level_counts = Counter(word_level.values())
    output = {
        "meta": {
            "generatedAt": "",
            "entryCount": len(entries),
            "uniqueWordCount": len(word_level),
            "levelCounts": dict(sorted(level_counts.items())),
            "uniqueWordLevelCounts": dict(sorted(unique_level_counts.items())),
            "sourceFiles": source_files,
        },
        "entries": entries,
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
