from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


QUESTION_BANK_UPDATES = {
    "question_bank_a1.json": {
        "cheap": "便宜的",
        "clever": "聰明的",
        "near": "近的／在附近",
        "small": "小的",
        "tall": "高的",
        "third": "第三",
        "year": "年",
    },
    "question_bank_a2.json": {
        "smartphone": "智能手機",
        "take a walk": "散步",
    },
    "question_bank_b1.json": {
        "creative": "創意工作者",
        "horror": "恐怖／恐懼",
    },
}


TRANSLATION_UPDATES = {
    "a1_ch_translations.json": QUESTION_BANK_UPDATES["question_bank_a1.json"],
    "a2_ch_translations.json": QUESTION_BANK_UPDATES["question_bank_a2.json"],
    "b1_ch_translations.json": QUESTION_BANK_UPDATES["question_bank_b1.json"],
}


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def update_question_bank(path: Path, mapping: dict[str, str]) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    for entry in data:
        word = entry.get("word")
        if word in mapping:
            entry["ch"] = mapping[word]
    write_json(path, data)


def update_grouped_or_sorted(path: Path) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, dict):
        groups = data.values()
    else:
        groups = [data]

    merged_mapping: dict[str, str] = {}
    for mapping in QUESTION_BANK_UPDATES.values():
        merged_mapping.update(mapping)

    for group in groups:
        for entry in group:
            word = entry.get("word")
            if word in merged_mapping:
                entry["ch"] = merged_mapping[word]

    write_json(path, data)


def update_translation_map(path: Path, mapping: dict[str, str]) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    data.update(mapping)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def update_vocab_data(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    replacements = {
        '"en": "cheap",\n            "ch": "???"': '"en": "cheap",\n            "ch": "便宜的"',
        '"en": "clever",\n            "ch": "???"': '"en": "clever",\n            "ch": "聰明的"',
        '"en": "near",\n            "ch": "??????"': '"en": "near",\n            "ch": "近的／在附近"',
        '"en": "small",\n            "ch": "??"': '"en": "small",\n            "ch": "小的"',
        '"en": "tall",\n            "ch": "??"': '"en": "tall",\n            "ch": "高的"',
        '"en": "third",\n            "ch": "??"': '"en": "third",\n            "ch": "第三"',
        '"en": "year",\n            "ch": "?"': '"en": "year",\n            "ch": "年"',
        '"en": "smartphone",\n            "ch": "????"': '"en": "smartphone",\n            "ch": "智能手機"',
        '"en": "take a walk",\n            "ch": "??"': '"en": "take a walk",\n            "ch": "散步"',
        '"en": "creative",\n            "ch": "?????"': '"en": "creative",\n            "ch": "創意工作者"',
        '"en": "horror",\n            "ch": "?????"': '"en": "horror",\n            "ch": "恐怖／恐懼"',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    for file_name, mapping in QUESTION_BANK_UPDATES.items():
        update_question_bank(ROOT / file_name, mapping)

    update_grouped_or_sorted(ROOT / "question_bank_cefr_grouped.json")
    update_grouped_or_sorted(ROOT / "question_bank_cefr_sorted.json")

    for file_name, mapping in TRANSLATION_UPDATES.items():
        update_translation_map(ROOT / file_name, mapping)

    update_vocab_data(ROOT / "vocab_data.js")


if __name__ == "__main__":
    main()
