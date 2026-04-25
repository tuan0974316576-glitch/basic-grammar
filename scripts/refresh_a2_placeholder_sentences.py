import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
A2_BANK = ROOT / "question_bank_a2.json"
GROUPED = ROOT / "question_bank_cefr_grouped.json"
SORTED = ROOT / "question_bank_cefr_sorted.json"
VOCAB_PATH = ROOT / "vocab_data.js"

PLACEHOLDER_PATTERNS = (
    'We learned the word "',
    'Please remember "',
    'My teacher used "',
)

TEMPLATES = [
    'I saw "{word}" in a short article this morning.',
    'The teacher wrote "{word}" on the board before class.',
    'We used "{word}" in a quick speaking exercise today.',
    'I noticed "{word}" in a poster at the station.',
    'The news report included "{word}" in the headline.',
    'Our class discussion mentioned "{word}" more than once.',
    'I heard "{word}" in a conversation after school.',
    'The guidebook used "{word}" in a simple example.',
    'She wrote "{word}" in her notebook during the lesson.',
    'The online video explained "{word}" in a clear way.',
    'I found "{word}" in a message from my teacher.',
    'The reading passage used "{word}" in a real-life context.',
]


def is_placeholder_sentence(text: str) -> bool:
    return any(pattern in text for pattern in PLACEHOLDER_PATTERNS)


def is_generated_sentence(text: str, word: str) -> bool:
    return text in {template.format(word=word) for template in TEMPLATES}


def replacement_text(word: str, slot_index: int) -> str:
    digest = hashlib.sha1(word.encode("utf-8")).digest()
    base_index = digest[0] % len(TEMPLATES)
    template_index = (base_index + slot_index) % len(TEMPLATES)
    return TEMPLATES[template_index].format(word=word)


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
    bank = json.loads(A2_BANK.read_text(encoding="utf-8"))
    changed_entries = 0
    changed_sentences = 0

    for entry in bank:
        word = entry["word"]
        updated = False
        sentences = entry.get("sentences", [])
        for idx, sentence in enumerate(sentences):
            text = sentence.get("text", "")
            if is_placeholder_sentence(text) or is_generated_sentence(text, word):
                sentence["text"] = replacement_text(word, idx)
                sentence["answer"] = word
                changed_sentences += 1
                updated = True
        if updated:
            changed_entries += 1

    A2_BANK.write_text(json.dumps(bank, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    grouped = json.loads(GROUPED.read_text(encoding="utf-8"))
    grouped["A2"] = bank
    GROUPED.write_text(json.dumps(grouped, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    sorted_entries = json.loads(SORTED.read_text(encoding="utf-8"))
    for idx, entry in enumerate(sorted_entries):
        if entry.get("cefr") == "A2":
            replacement = next(item for item in bank if item["word"] == entry["word"])
            sorted_entries[idx] = replacement
    SORTED.write_text(json.dumps(sorted_entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    vocab_text = VOCAB_PATH.read_text(encoding="utf-8")
    vocab_text = replace_level_block(vocab_text, "L2", build_level_block(bank))
    VOCAB_PATH.write_text(vocab_text, encoding="utf-8")

    print(f"changed_entries={changed_entries}")
    print(f"changed_sentences={changed_sentences}")


if __name__ == "__main__":
    main()
