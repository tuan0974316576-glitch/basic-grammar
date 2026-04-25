import hashlib
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

TITLE_PATTERN = re.compile(r"\b(?:Mr|Ms|Mrs|Dr|Captain)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b")
NAME_PATTERN = re.compile(
    r"\b(?:Interviewer|Reporter|Owner|Control centre|Mabel|Shane|Luna|Sana|Rick Lai|Peter Wong|Winnie|Angel|David|Malcolm|Avery|Archie|Gehry|Charlie Chiba)\b"
)
TIME_PATTERN = re.compile(r"\b\d{1,2}:\d{2}(?:am|pm|AM|PM)\b")

TARGETED_REWRITES = {
    ("question_bank_a2.json", "wow", 1),
    ("question_bank_a2.json", "wow", 2),
    ("question_bank_a2.json", "wow", 3),
    ("question_bank_a2.json", "dear", 1),
    ("question_bank_a2.json", "dear", 2),
    ("question_bank_a2.json", "dear", 3),
    ("question_bank_b1.json", "policy", 3),
    ("question_bank_b1.json", "appointment", 1),
    ("question_bank_b1.json", "appointment", 2),
    ("question_bank_b1.json", "appointment", 3),
}

TEMPLATES = (
    "The teacher explained {word} in a simple way.",
    "We talked about {word} in class this morning.",
    "I wrote {word} in my notebook after the lesson.",
    "The article mentioned {word} more than once.",
    "She used {word} in a clear sentence.",
    "He heard {word} during a short discussion.",
    "The guide used {word} in a useful example.",
    "Our group practised {word} before lunch.",
    "The report included {word} as an important point.",
    "I saw {word} in a school notice today.",
    "We heard {word} in a class conversation.",
    "She repeated {word} so everyone understood.",
)


def build_sentence(word: str, slot_index: int) -> dict:
    digest = hashlib.sha1(word.encode("utf-8")).digest()
    base_index = digest[0] % len(TEMPLATES)
    template_index = (base_index + slot_index) % len(TEMPLATES)
    return {"text": TEMPLATES[template_index].format(word=word), "answer": word}


def should_rewrite(bank_name: str, word: str, sentence_index: int, text: str) -> bool:
    if (bank_name, word, sentence_index) in TARGETED_REWRITES:
        return True
    return bool(TIME_PATTERN.search(text) or TITLE_PATTERN.search(text) or NAME_PATTERN.search(text))


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
    total_rewritten = 0

    for cefr, path in CEFR_BANKS.items():
        bank_name = path.name
        entries = json.loads(path.read_text(encoding="utf-8"))
        rewritten = 0

        for entry in entries:
            for idx, sentence in enumerate(entry.get("sentences", []), start=1):
                text = sentence.get("text", "")
                if should_rewrite(bank_name, entry["word"], idx, text):
                    replacement = build_sentence(entry["word"], idx - 1)
                    sentence["text"] = replacement["text"]
                    sentence["answer"] = replacement["answer"]
                    rewritten += 1

        if rewritten:
            path.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        grouped[cefr] = entries
        sorted_entries.extend(entries)
        total_rewritten += rewritten
        print(f"{cefr}: rewrote {rewritten} named/source sentences")

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

    print(f"total_rewritten={total_rewritten}")


if __name__ == "__main__":
    main()
