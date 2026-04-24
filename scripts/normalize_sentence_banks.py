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

TEMPLATES = (
    'We learned the word "{word}" in class today.',
    'Please remember "{word}" for the quiz.',
    'My teacher used "{word}" in an example.',
)


def sentence_contains_answer(text: str, answer: str) -> bool:
    return answer.strip().casefold() in text.strip().casefold()


def build_short_sentence(word: str, index: int) -> dict:
    template = TEMPLATES[index % len(TEMPLATES)]
    return {"text": template.format(word=word), "answer": word}


def normalize_entry_sentences(entry: dict) -> tuple[bool, int]:
    word = entry["word"]
    sentences = entry.get("sentences") or []
    normalized = []
    replacements = 0
    changed = False

    for index in range(3):
        source = sentences[index] if index < len(sentences) else None

        if isinstance(source, dict):
            text = str(source.get("text", "")).strip()
            answer = str(source.get("answer", word)).strip() or word
        elif isinstance(source, str):
            text = source.strip()
            answer = word
        else:
            text = ""
            answer = word

        needs_rewrite = (
            not text
            or len(text) > 90
            or not sentence_contains_answer(text, answer)
        )

        if needs_rewrite:
            normalized.append(build_short_sentence(word, index))
            replacements += 1
            changed = True
        else:
            normalized.append({"text": text, "answer": answer})
            if not isinstance(source, dict) or text != source.get("text", "").strip() or answer != str(source.get("answer", word)).strip():
                changed = True

    if entry.get("sentences") != normalized:
        entry["sentences"] = normalized
        changed = True

    return changed, replacements


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
    stats = {}

    for cefr, path in CEFR_BANKS.items():
        entries = json.loads(path.read_text(encoding="utf-8"))
        replacements = 0
        for entry in entries:
            _, count = normalize_entry_sentences(entry)
            replacements += count
        path.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
        grouped[cefr] = entries
        sorted_entries.extend(entries)
        stats[cefr] = replacements

    (ROOT / "question_bank_cefr_grouped.json").write_text(
        json.dumps(grouped, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    (ROOT / "question_bank_cefr_sorted.json").write_text(
        json.dumps(sorted_entries, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )

    vocab_text = VOCAB_PATH.read_text(encoding="utf-8")
    for level_key, source_path in LEVEL_SOURCES.items():
        entries = json.loads(source_path.read_text(encoding="utf-8"))
        vocab_text = replace_level_block(vocab_text, level_key, build_level_block(entries))
    VOCAB_PATH.write_text(vocab_text, encoding="utf-8", newline="\n")

    for cefr, count in stats.items():
        print(f"{cefr}: rewrote {count} sentence slots")


if __name__ == "__main__":
    main()
