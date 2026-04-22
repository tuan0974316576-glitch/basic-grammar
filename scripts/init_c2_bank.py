from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def valid_sentence_count(entry: dict) -> int:
    sentences = entry.get("sentences") or []
    return sum(
        1
        for s in sentences
        if (s.get("text") or "").strip() and (s.get("answer") or "").strip()
    )


def main() -> None:
    grouped_path = ROOT / "question_bank_cefr_grouped.json"
    c2_path = ROOT / "question_bank_c2.json"
    missing_sentences_path = ROOT / "question_bank_c2_missing_sentences.csv"
    missing_chinese_path = ROOT / "question_bank_c2_missing_chinese.csv"
    translations_path = ROOT / "c2_ch_translations.json"

    grouped = json.loads(grouped_path.read_text(encoding="utf-8"))
    c2_entries = []

    for entry in grouped.get("C2", []):
        c2_entries.append(
            {
                "word": entry["word"],
                "cefr": "C2",
                "frequency": entry.get("frequency", 0),
                "sentences": entry.get("sentences", []),
                "ch": entry.get("ch", ""),
            }
        )

    c2_entries.sort(key=lambda x: x["word"].casefold())

    c2_path.write_text(
        json.dumps(c2_entries, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    missing_sentence_rows = []
    missing_chinese_rows = []

    for entry in c2_entries:
        sentence_count = valid_sentence_count(entry)
        if sentence_count < 3:
            missing_sentence_rows.append(
                {
                    "word": entry["word"],
                    "cefr": entry["cefr"],
                    "current_sentence_count": str(sentence_count),
                }
            )
        if not (entry.get("ch") or "").strip():
            missing_chinese_rows.append(
                {
                    "word": entry["word"],
                    "cefr": entry["cefr"],
                }
            )

    with missing_sentences_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(
            f, fieldnames=["word", "cefr", "current_sentence_count"]
        )
        writer.writeheader()
        writer.writerows(missing_sentence_rows)

    with missing_chinese_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["word", "cefr"])
        writer.writeheader()
        writer.writerows(missing_chinese_rows)

    translations = {
        entry["word"]: entry.get("ch", "")
        for entry in c2_entries
        if (entry.get("ch") or "").strip()
    }
    translations_path.write_text(
        json.dumps(translations, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
