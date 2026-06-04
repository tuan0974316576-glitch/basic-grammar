import argparse
import csv
import os
import re
import time
from collections import Counter

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    import pandas as pd
except ImportError:
    pd = None

try:
    from spellchecker import SpellChecker
except ImportError:
    SpellChecker = None

try:
    import nltk
    from nltk.corpus import wordnet
    from nltk.stem import WordNetLemmatizer
except ImportError:
    nltk = None
    wordnet = None
    WordNetLemmatizer = None

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    requests = None
    BeautifulSoup = None


# === File settings ===
# Put this script, 2026.txt, and the Oxford PDF in the same folder.
INPUT_TEXT = "2026.txt"
INPUT_EXCEL = "2026_New_Vocab.xlsx"
INPUT_PDF = "The_Oxford_5000_by_CEFR_level (combined).pdf"
OUTPUT_CSV = "2026_New_Vocab_Done.csv"

# Hong Kong proper nouns to protect from spelling correction.
HK_EXCLUDE_LIST = {
    "MTR", "DSE", "HKSAR", "KOWLOON", "TAI", "KWUN", "CENTRAL", "WAN",
    "SHUM", "PO", "YOUTUBE", "STARBUCKS", "CHATIME", "GONG", "COCO"
}

STOPWORDS = {
    "a", "able", "about", "above", "after", "again", "against", "all", "also",
    "am", "an", "and", "any", "are", "around", "as", "at", "away", "be",
    "because", "been", "before", "being", "below", "between", "both", "but",
    "by", "can", "could", "did", "do", "does", "doing", "done", "down", "each",
    "few", "for", "from", "get", "gets", "getting", "give", "go", "goes", "had",
    "has", "have", "having", "he", "her", "here", "hers", "him", "his", "how",
    "i", "if", "in", "into", "is", "it", "its", "just", "let", "like", "made",
    "make", "many", "may", "me", "might", "more", "most", "much", "must", "my",
    "new", "no", "not", "now", "of", "off", "on", "once", "one", "only", "or",
    "other", "our", "out", "over", "own", "same", "see", "she", "should", "so",
    "some", "such", "take", "than", "that", "the", "their", "them", "then",
    "there", "these", "they", "thing", "this", "those", "through", "to", "too",
    "up", "us", "very", "was", "we", "well", "were", "what", "when", "where",
    "which", "while", "who", "why", "will", "with", "would", "you", "your"
}

cambridge_cache = {}


def init_nltk():
    if nltk is None:
        print("NLTK is not installed. Lemmatizing will be skipped.")
        return False

    print("Initializing NLTK resources...")
    for package in ("wordnet", "averaged_perceptron_tagger", "omw-1.4"):
        nltk.download(package, quiet=True)
    return True


def get_wordnet_pos(word):
    if nltk is None or wordnet is None:
        return None
    try:
        tag = nltk.pos_tag([word])[0][1][0].upper()
        tag_dict = {
            "J": wordnet.ADJ,
            "N": wordnet.NOUN,
            "V": wordnet.VERB,
            "R": wordnet.ADV,
        }
        return tag_dict.get(tag, wordnet.NOUN)
    except Exception:
        return wordnet.NOUN


def extract_oxford_levels(pdf_path):
    if not os.path.exists(pdf_path):
        print(f"Oxford PDF not found: {pdf_path}. CEFR will use Cambridge/fallback.")
        return {}
    if fitz is None:
        print("PyMuPDF is not installed. Cannot read Oxford PDF.")
        return {}

    print(f"Reading PDF: {pdf_path}...")
    try:
        doc = fitz.open(pdf_path)
    except Exception as error:
        print(f"Error opening PDF: {error}")
        return {}

    word_level_map = {}
    levels = ["A1", "A2", "B1", "B2", "C1"]
    current_level = "A1"

    for page in doc:
        for line in page.get_text().split("\n"):
            line = line.strip()
            if line in levels:
                current_level = line
                continue
            match = re.match(r"^([a-zA-Z\-]+)", line)
            if match:
                word = match.group(1).lower()
                if len(word) > 1:
                    word_level_map[word] = current_level
    return word_level_map


def fetch_cambridge_level(vocab, delay=1.0):
    vocab_lower = str(vocab).strip().lower()
    if not vocab_lower:
        return "Unclassified"
    if vocab_lower in cambridge_cache:
        return cambridge_cache[vocab_lower]
    if requests is None or BeautifulSoup is None:
        return "Unclassified"

    search_term = vocab_lower.replace(" ", "-")
    url = f"https://dictionary.cambridge.org/dictionary/english/{search_term}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            level_tag = soup.find("span", class_=lambda c: c and "epp-xref" in c)
            if level_tag:
                level = level_tag.text.strip().upper()
                cambridge_cache[vocab_lower] = level
                time.sleep(delay)
                return level
    except Exception:
        pass

    cambridge_cache[vocab_lower] = "Unclassified"
    time.sleep(delay)
    return "Unclassified"


def get_level_logic(word, oxford_map, lemmatizer=None, use_cambridge=True):
    lower_word = str(word).strip().lower()
    if not lower_word:
        return "Unclassified"
    if " " in lower_word:
        return fetch_cambridge_level(lower_word) if use_cambridge else "Phrase"
    if lower_word in oxford_map:
        return oxford_map[lower_word]

    if lemmatizer is not None:
        pos = get_wordnet_pos(lower_word)
        base_word = lemmatizer.lemmatize(lower_word, pos) if pos else lemmatizer.lemmatize(lower_word)
        if base_word in oxford_map:
            return oxford_map[base_word]

    return fetch_cambridge_level(lower_word) if use_cambridge else "Unclassified"


def normalize_word(original_word, spell=None):
    original_word = str(original_word).strip()
    if not original_word:
        return ""

    is_phrase = " " in original_word
    if (
        is_phrase
        or original_word.upper() in HK_EXCLUDE_LIST
        or original_word.istitle()
        or original_word.isupper()
        or spell is None
    ):
        corrected_word = original_word
    else:
        corrected_word = spell.correction(original_word) or original_word

    if corrected_word.istitle() or corrected_word.isupper():
        return corrected_word
    return corrected_word.lower()


def extract_words_from_text(text_path):
    print(f"Loading text file: {text_path}...")
    with open(text_path, "r", encoding="utf-8-sig") as file:
        text = file.read()

    raw_words = re.findall(r"[A-Za-z][A-Za-z'-]*", text)
    cleaned = []
    for word in raw_words:
        word = word.strip("'").replace("'", "")
        if len(word) < 3:
            continue
        if word.lower() in STOPWORDS:
            continue
        if re.search(r"\d", word):
            continue
        cleaned.append(word)

    return Counter(cleaned)


def process_text_vocab(args):
    if not os.path.exists(args.text):
        print(f"Error: Could not find '{args.text}'.")
        return

    init_nltk()
    oxford_map = extract_oxford_levels(args.pdf)
    spell = SpellChecker() if SpellChecker is not None and not args.no_spellcheck else None
    lemmatizer = WordNetLemmatizer() if WordNetLemmatizer is not None else None

    word_counts = extract_words_from_text(args.text)
    print(f"Found {len(word_counts)} candidate words.")

    rows_by_word = {}
    for index, (word, frequency) in enumerate(word_counts.most_common(), start=1):
        final_word = normalize_word(word, spell=spell)
        if not final_word or final_word.lower() in STOPWORDS:
            continue

        level = get_level_logic(
            final_word,
            oxford_map,
            lemmatizer=lemmatizer,
            use_cambridge=not args.no_cambridge,
        )

        existing = rows_by_word.setdefault(final_word, {
            "Word": final_word,
            "CEFR_Level": level,
            "Frequency": 0,
            "Years_Count": 1,
            "Years_Appeared": "2026",
            "Source": os.path.basename(args.text),
        })
        existing["Frequency"] += frequency
        if existing["CEFR_Level"] == "Unclassified" and level != "Unclassified":
            existing["CEFR_Level"] = level

        if index % 50 == 0:
            print(f"   Processed {index} / {len(word_counts)} candidate words...")

    level_order = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}
    rows = sorted(
        rows_by_word.values(),
        key=lambda row: (level_order.get(row["CEFR_Level"], 99), -row["Frequency"], row["Word"].lower()),
    )

    with open(args.output, "w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=["Word", "CEFR_Level", "Frequency", "Years_Count", "Years_Appeared", "Source"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nAll done. Text vocabulary processed and saved to: {args.output}")


def process_excel_vocab(args):
    if pd is None:
        print("Error: pandas is not installed. Install pandas or use --source text.")
        return
    if not os.path.exists(args.excel):
        print(f"Error: Could not find '{args.excel}'.")
        return

    init_nltk()
    oxford_map = extract_oxford_levels(args.pdf)
    spell = SpellChecker() if SpellChecker is not None and not args.no_spellcheck else None
    lemmatizer = WordNetLemmatizer() if WordNetLemmatizer is not None else None

    print(f"Loading new vocabulary Excel: {args.excel}...")
    df_raw = pd.read_excel(args.excel)

    processed_data = []
    total_rows = len(df_raw)
    print(f"Processing {total_rows} new words...")

    for index, row in df_raw.iterrows():
        original_word = str(row["Word"]).strip()
        if not original_word or original_word.lower() in ["nan", "word"]:
            continue

        final_word = normalize_word(original_word, spell=spell)
        row["Word"] = final_word
        row["CEFR_Level"] = get_level_logic(
            final_word,
            oxford_map,
            lemmatizer=lemmatizer,
            use_cambridge=not args.no_cambridge,
        )
        processed_data.append(row)

        if (index + 1) % 50 == 0:
            print(f"   Processed {index + 1} / {total_rows} rows...")

    print("Merging duplicates and sorting...")
    df_final = pd.DataFrame(processed_data)

    agg_funcs = {"CEFR_Level": "first"}
    for col in df_final.columns:
        if col in ["Word", "CEFR_Level"]:
            continue
        if col in ["Frequency", "Years_Count"]:
            agg_funcs[col] = "sum"
        elif col == "Years_Appeared":
            agg_funcs[col] = lambda x: ", ".join(set(str(v) for v in x if str(v) != "nan"))
        else:
            agg_funcs[col] = "first"

    df_merged = df_final.groupby("Word", as_index=False).agg(agg_funcs)
    cols = df_merged.columns.tolist()
    if "CEFR_Level" in cols:
        cols.insert(1, cols.pop(cols.index("CEFR_Level")))
    df_merged = df_merged[cols]

    sort_cols = [col for col in ["CEFR_Level", "Frequency"] if col in df_merged.columns]
    if sort_cols:
        df_merged = df_merged.sort_values(by=sort_cols, ascending=[True] + [False] * (len(sort_cols) - 1))

    df_merged.to_csv(args.output, index=False, encoding="utf-8-sig")
    print(f"\nAll done. Excel vocabulary processed and saved to: {args.output}")


def process_new_vocab():
    parser = argparse.ArgumentParser(description="Process DSE vocabulary from 2026.txt or Excel.")
    parser.add_argument("--source", choices=["auto", "text", "excel"], default="auto")
    parser.add_argument("--text", default=INPUT_TEXT)
    parser.add_argument("--excel", default=INPUT_EXCEL)
    parser.add_argument("--pdf", default=INPUT_PDF)
    parser.add_argument("--output", default=OUTPUT_CSV)
    parser.add_argument("--no-cambridge", action="store_true", help="Skip Cambridge online lookup.")
    parser.add_argument("--no-spellcheck", action="store_true", help="Skip spelling correction.")
    args = parser.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    print(f"Working directory: {script_dir}")

    source = args.source
    if source == "auto":
        source = "text" if os.path.exists(args.text) else "excel"

    if source == "text":
        process_text_vocab(args)
    else:
        process_excel_vocab(args)


if __name__ == "__main__":
    process_new_vocab()
