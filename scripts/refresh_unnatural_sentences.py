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

PLACEHOLDER_SNIPPETS = (
    'We learned the word "',
    'Please remember "',
    'My teacher used "',
    "in a short article this morning.",
    "in a message from my teacher.",
    "in a clear way.",
    "on the board before class.",
    "in a quick speaking exercise today.",
    "in a poster at the station.",
    "in the headline.",
    "more than once.",
    "after school.",
    "in a simple example.",
    "in her notebook during the lesson.",
    "in a real-life context.",
)

SOURCE_SNIPPETS = (
    "Action to be taken:",
    "Images for articles:",
    "Focus on One Theme",
    "Your theme is",
    "One more thing:",
    "What we would like to know is:",
    "Over...",
    "Please repeat instruction, control.",
)

DISCOURSE_STARTS = (
    "Anyway",
    "Right",
    "Well",
    "So",
    "Ok",
    "Okay",
    "Wow",
    "Oh",
    "No",
    "Yes",
    "And",
    "But",
)

FORUM_PREFIX = re.compile(
    r"^[A-Z][A-Za-z ]+\s+Posted:\s+[A-Za-z]+\s+\d{1,2}\s+\d{4},\s+\d{1,2}:\d{2}\s+[AP]M\s+"
)
OWNER_PREFIX = re.compile(r"^Owner:\s*[A-Za-z]+,\s*age\s*[\d.]+\s*")
SPEAKER_PREFIX = re.compile(
    r"(?:^|\s)(?:\d{1,2}:\d{2}(?:am|pm|AM|PM)?\s+)?"
    r"(?:[A-Z][A-Za-z]+|[A-Z]{2,})(?:\s+(?:[A-Z][A-Za-z]+|[A-Z]{2,}|[a-z]+))*:"
)
BRACKET_REF = re.compile(r"\[[0-9]+\]")
MULTI_COLON = re.compile(r".*:.*:")

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
    "The class reviewed {word} before the quiz.",
    "He remembered {word} from yesterday's lesson.",
    "The email included {word} in the first paragraph.",
    "I noticed {word} in the reading passage.",
    "The speaker used {word} when answering the question.",
    "We copied {word} into our notes carefully.",
)


def sentence_contains_answer(text: str, answer: str) -> bool:
    return answer.strip().casefold() in text.strip().casefold()


def is_unnatural(text: str, answer: str) -> bool:
    if not text.strip():
        return True

    if any(snippet in text for snippet in PLACEHOLDER_SNIPPETS):
        return True

    if any(snippet in text for snippet in SOURCE_SNIPPETS):
        return True

    if FORUM_PREFIX.search(text) or OWNER_PREFIX.search(text):
        return True

    if SPEAKER_PREFIX.search(text):
        return True

    if BRACKET_REF.search(text):
        return True

    if MULTI_COLON.search(text):
        return True

    if '//' in text or '...' in text or '“' in text or '”' in text:
        return True

    if '"' in text:
        return True

    if "(" in text or ")" in text:
        return True

    if text.endswith(("'", '"')):
        return True

    words = re.findall(r"[A-Za-z0-9']+", text)
    if len(words) <= 3 and text.endswith(("!", "?", ".")):
        return True

    if any(text.startswith(prefix) for prefix in DISCOURSE_STARTS):
        return True

    if len(text) > 110:
        return True

    if not sentence_contains_answer(text, answer):
        return True

    return False


def build_sentence(word: str, slot_index: int) -> dict:
    digest = hashlib.sha1(word.encode("utf-8")).digest()
    base_index = digest[0] % len(TEMPLATES)
    template_index = (base_index + slot_index) % len(TEMPLATES)
    return {"text": TEMPLATES[template_index].format(word=word), "answer": word}


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
        entries = json.loads(path.read_text(encoding="utf-8"))
        rewritten = 0

        for entry in entries:
            sentences = entry.get("sentences") or []
            normalized = []

            for idx in range(3):
                source = sentences[idx] if idx < len(sentences) else None

                if isinstance(source, dict):
                    text = str(source.get("text", "")).strip()
                    answer = str(source.get("answer", entry["word"])).strip() or entry["word"]
                elif isinstance(source, str):
                    text = source.strip()
                    answer = entry["word"]
                else:
                    text = ""
                    answer = entry["word"]

                if is_unnatural(text, answer):
                    normalized.append(build_sentence(entry["word"], idx))
                    rewritten += 1
                else:
                    normalized.append({"text": text, "answer": answer})

            entry["sentences"] = normalized

        path.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        grouped[cefr] = entries
        sorted_entries.extend(entries)
        total_rewritten += rewritten
        print(f"{cefr}: rewrote {rewritten} unnatural sentence slots")

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
