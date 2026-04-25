import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "tmp_answer_mismatch_report.json"
C2_BANK = ROOT / "question_bank_c2.json"
GROUPED = ROOT / "question_bank_cefr_grouped.json"
SORTED = ROOT / "question_bank_cefr_sorted.json"
VOCAB_PATH = ROOT / "vocab_data.js"


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
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    updates = [
        item
        for item in report["surface"]
        if item.get("cefr") == "C2" and item.get("bank") == "question_bank_c2.json"
    ]

    bank = json.loads(C2_BANK.read_text(encoding="utf-8"))
    by_word = {entry["word"]: entry for entry in bank}
    changes = 0

    for item in updates:
        entry = by_word.get(item["word"])
        if not entry:
            continue
        sentence_index = int(item["sentence_index"]) - 1
        if sentence_index < 0 or sentence_index >= len(entry.get("sentences", [])):
            continue
        sentence = entry["sentences"][sentence_index]
        candidate = item["candidates"][0]
        if sentence.get("text") != item["text"]:
            continue
        if sentence.get("answer") != candidate:
            sentence["answer"] = candidate
            changes += 1

    C2_BANK.write_text(json.dumps(bank, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    grouped = json.loads(GROUPED.read_text(encoding="utf-8"))
    grouped["C2"] = bank
    GROUPED.write_text(json.dumps(grouped, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    sorted_entries = json.loads(SORTED.read_text(encoding="utf-8"))
    bank_lookup = {entry["word"]: entry for entry in bank}
    for idx, entry in enumerate(sorted_entries):
        if entry.get("cefr") == "C2" and entry.get("word") in bank_lookup:
            sorted_entries[idx] = bank_lookup[entry["word"]]
    SORTED.write_text(json.dumps(sorted_entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    vocab_text = VOCAB_PATH.read_text(encoding="utf-8")
    vocab_text = replace_level_block(vocab_text, "L5_STAR", build_level_block(bank))
    VOCAB_PATH.write_text(vocab_text, encoding="utf-8")

    print(f"updated_answers={changes}")


if __name__ == "__main__":
    main()
