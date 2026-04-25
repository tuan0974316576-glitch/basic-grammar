import json
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

REPLACEMENTS = {
    ("question_bank_a2.json", "alive", 2): "The small plant stayed alive through the winter.",
    ("question_bank_a2.json", "apply", 3): "Students can apply online before the deadline.",
    ("question_bank_a2.json", "brilliant", 2): "Your answer was absolutely brilliant.",
    ("question_bank_a2.json", "chat", 1): "We had a quick chat after class.",
    ("question_bank_a2.json", "chat", 3): "I had a long chat with my cousin online.",
    ("question_bank_a2.json", "rubbish", 3): "Don't believe that rubbish.",
    ("question_bank_a2.json", "wow", 2): "Wow, that magic trick was amazing.",
    ("question_bank_b1.json", "age", 3): "Children at that age need plenty of sleep.",
    ("question_bank_b1.json", "captain", 1): "The captain guided the ship through the storm.",
    ("question_bank_b1.json", "captain", 2): "The captain spoke to control by radio.",
    ("question_bank_b1.json", "captain", 3): "Everyone trusted the captain during the emergency.",
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
        bank_name = path.name
        entries = json.loads(path.read_text(encoding="utf-8"))
        changed = 0

        for entry in entries:
            for idx, sentence in enumerate(entry.get("sentences", []), start=1):
                key = (bank_name, entry.get("word"), idx)
                if key in REPLACEMENTS:
                    sentence["text"] = REPLACEMENTS[key]
                    changed += 1

        if changed:
            path.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        grouped[cefr] = entries
        sorted_entries.extend(entries)
        total_changes += changed
        print(f"{cefr}: rewrote {changed} transcript sentences")

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

    print(f"total_rewritten={total_changes}")


if __name__ == "__main__":
    main()
