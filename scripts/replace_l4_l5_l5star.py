import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VOCAB_PATH = ROOT / "vocab_data.js"


LEVEL_SOURCES = {
    "L4": ROOT / "question_bank_b2.json",
    "L5": ROOT / "question_bank_c1.json",
    "L5_STAR": ROOT / "question_bank_c2.json",
}


def build_level_block(entries):
    payload = []
    for item in entries:
        payload.append(
            {
                "en": item["word"],
                "ch": item["ch"],
                "sents": item["sentences"],
            }
        )
    return json.dumps(payload, ensure_ascii=False, indent=4)


def replace_level_block(text, level_key, replacement_json):
    marker = f'    "{level_key}": ['
    start = text.index(marker)
    array_start = text.index("[", start)

    depth = 0
    end = array_start
    while end < len(text):
        char = text[end]
        if char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                break
        end += 1

    indented = "\n".join(f"        {line}" if line else "" for line in replacement_json.splitlines())
    return text[:array_start] + "[\n" + indented + "\n    ]" + text[end + 1 :]


def main():
    text = VOCAB_PATH.read_text(encoding="utf-8")

    for level_key, source_path in LEVEL_SOURCES.items():
        with source_path.open(encoding="utf-8") as f:
            entries = json.load(f)
        text = replace_level_block(text, level_key, build_level_block(entries))

    VOCAB_PATH.write_text(text, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
