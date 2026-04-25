import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def replace_text(value: str) -> str:
    return value.replace("café", "cafe").replace("Café", "Cafe")


def update_bank(path: Path) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))

    changed = False

    def walk(node):
        nonlocal changed
        if isinstance(node, dict):
            if node.get("word") == "café":
                node["word"] = "cafe"
                changed = True
            if node.get("answer") == "café":
                node["answer"] = "cafe"
                changed = True
            if isinstance(node.get("text"), str) and "café" in node["text"]:
                node["text"] = replace_text(node["text"])
                changed = True
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(data)

    if changed:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def update_mapping(path: Path) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    if "café" in data:
        data["cafe"] = data.pop("café")
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def update_vocab_js(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    text = text.replace('"en": "café"', '"en": "cafe"')
    text = text.replace('"answer": "café"', '"answer": "cafe"')
    text = text.replace(" quiet café ", " quiet cafe ")
    text = text.replace("The café on the corner", "The cafe on the corner")
    text = text.replace(" at the café.", " at the cafe.")
    path.write_text(text, encoding="utf-8")


def main():
    update_bank(ROOT / "question_bank_a1.json")
    update_bank(ROOT / "question_bank_cefr_grouped.json")
    update_bank(ROOT / "question_bank_cefr_sorted.json")
    update_mapping(ROOT / "a1_ch_translations.json")
    update_vocab_js(ROOT / "vocab_data.js")


if __name__ == "__main__":
    main()
