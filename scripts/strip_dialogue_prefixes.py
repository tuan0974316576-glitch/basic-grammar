import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VOCAB_PATH = ROOT / "vocab_data.js"

CEFR_BANKS = {
    "A1": ROOT / "question_bank_a1.json",
    "A2": ROOT / "question_bank_a2.json",
    "B1": ROOT / "question_bank_b1.json",
    "B2": ROOT / "question_bank_b2.json",
    "C1": ROOT / "question_bank_c1.json",
    "C2": ROOT / "question_bank_c2.json",
}

LEVEL_SOURCES = {
    "L1": CEFR_BANKS["A1"],
    "L2": CEFR_BANKS["A2"],
    "L3": CEFR_BANKS["B1"],
    "L4": CEFR_BANKS["B2"],
    "L5": CEFR_BANKS["C1"],
    "L5_STAR": CEFR_BANKS["C2"],
}

FORUM_PREFIX = re.compile(
    r"^[A-Z][A-Za-z ]+\s+Posted:\s+[A-Za-z]+\s+\d{1,2}\s+\d{4},\s+\d{1,2}:\d{2}\s+[AP]M\s+"
)
OWNER_PREFIX = re.compile(r"^Owner:\s*[A-Za-z]+,\s*age\s*\d+\s*")
LABEL_TOKEN = r"(?:[A-Z][A-Za-z]+|[A-Z]{2,})"
SPEAKER_PREFIX = re.compile(rf"^(?:{LABEL_TOKEN}(?:\s+{LABEL_TOKEN})*:\s*)+")


def strip_prefixes(text: str) -> str:
    cleaned = str(text or "").strip()
    cleaned = FORUM_PREFIX.sub("", cleaned)
    cleaned = OWNER_PREFIX.sub("", cleaned)

    previous = None
    while previous != cleaned:
        previous = cleaned
        cleaned = SPEAKER_PREFIX.sub("", cleaned).strip()

    return re.sub(r"\s+", " ", cleaned).strip()


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
    return json.dumps(payload, ensure_ascii=False, indent=4).splitlines()


def replace_level_block(text, level_key, replacement_lines):
    marker = f'    "{level_key}":'
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

    indented = "\n".join(f"    {line}" if line else "" for line in replacement_lines)
    return text[:array_start] + "\n" + indented + text[end + 1 :]


def main():
    grouped = {}
    sorted_entries = []
    total_changes = 0

    for cefr, path in CEFR_BANKS.items():
        entries = json.loads(path.read_text(encoding="utf-8"))
        changed_here = 0

        for entry in entries:
            for sentence in entry.get("sentences", []):
                text = sentence.get("text", "")
                cleaned = strip_prefixes(text)
                if cleaned and cleaned != text:
                    sentence["text"] = cleaned
                    changed_here += 1

        if changed_here:
            path.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        grouped[cefr] = entries
        sorted_entries.extend(entries)
        total_changes += changed_here
        print(f"{cefr}: cleaned {changed_here} sentence prefixes")

    (ROOT / "question_bank_cefr_grouped.json").write_text(
        json.dumps(grouped, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (ROOT / "question_bank_cefr_sorted.json").write_text(
        json.dumps(sorted_entries, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    vocab_text = VOCAB_PATH.read_text(encoding="utf-8")
    for level_key, source_path in LEVEL_SOURCES.items():
        entries = json.loads(source_path.read_text(encoding="utf-8"))
        vocab_text = replace_level_block(vocab_text, level_key, build_level_block(entries))
    VOCAB_PATH.write_text(vocab_text, encoding="utf-8")

    print(f"total_cleaned={total_changes}")


if __name__ == "__main__":
    main()
