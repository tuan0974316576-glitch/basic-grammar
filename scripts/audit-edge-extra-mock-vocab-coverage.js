#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_CORPUS = path.join(ROOT_DIR, "private_exports", "edge_extra_mock_text_corpus.json");
const DEFAULT_JSON_OUT = path.join(ROOT_DIR, "private_exports", "edge_extra_mock_vocab_coverage.json");
const DEFAULT_CSV_OUT = path.join(ROOT_DIR, "private_exports", "edge_extra_mock_vocab_coverage.csv");

const senseBank = require(path.join(ROOT_DIR, "vocab_sense_bank.js"));
const teacherVocab = require(path.join(ROOT_DIR, "teacher_vocab.js"));
const cedictSupplement = require(path.join(ROOT_DIR, "cc_cedict_supplement.js"));

const STOPWORDS = new Set(`
a an the and or but nor so yet for to of in on at by from with without into onto over under above below across through around about against between among during before after as than like per via
is are was were be been being am do does did doing have has had having will would can could should may might must shall
i me my mine you your yours he him his she her hers it its we us our ours they them their theirs
this that these those there here then than who whom whose which what when where why how
not no yes all any every each either neither both some many much more most less least very too also only just even
one two three four five six seven eight nine ten first second third last next old new same other another own
mr mrs miss ms dr prof sir madam
paper part question questions answer answers mark marks exam mock page pages section task text passage paragraph
book booklet books data file files instructions instruction candidate candidates examiner marker markers marks spaces provided margins sheets supplementary recording
don't doesn't didn't won't wouldn't can't cannot isn't aren't wasn't weren't i'm i've i'd i'll you're you've you'd you'll we're we've we'd we'll they're they've they'd they'll it'll that'll it'd couldn't shouldn't hadn't hasn't he'll she'll she'd
`.trim().split(/\s+/));

const LIKELY_NAME_WORDS = new Set(`
longman pearson english edge extra mock hong kong hk hkdse dse china chinese cantonese asia cep shutterstock adobe flaticon fotolia freepik
wong chris lee chan leung lam lau lin simon fung maria david nico cheung mike chen ben alex sam emily ken chau tony michael paul thomas sarah andy charlie helen anna max lai yip tam yeung tong martin robert chu jones tom jenny patel tim karen pang mak john ryan lisa charles kwok tang cheng kwan mary smith ltd casey ashley ernie igor desouza elizabeth edith katie ann magda tomas
wan kung sai kok tai causeway sha york chai mong choi po tsui siu mai cha dai gen inverted eco chi chaan teng para tuk hongza tengs tynyuk bluey javier liza liz wellington dong
`.trim().split(/\s+/));

const CSV_HEADERS = [
  "candidate",
  "display",
  "kind",
  "covered",
  "coveredVia",
  "coveredVariant",
  "count",
  "documentCount",
  "mockPapers",
  "priority",
  "ignoreReason",
  "example"
];

function addEntryKeys(index, entry, keyGenerator) {
  const keys = [
    entry.word,
    entry.display,
    ...(Array.isArray(entry.aliases) ? entry.aliases : [])
  ].map(normalizeWord).filter(Boolean);
  keys.forEach((key) => {
    const expandedKeys = typeof keyGenerator === "function" ? keyGenerator(key) : [key];
    expandedKeys.forEach((expandedKey) => {
      const normalized = normalizeWord(expandedKey);
      if (normalized && !index.has(normalized)) index.set(normalized, entry);
    });
  });
}

function createCoverageIndex() {
  const index = new Map();
  teacherVocab.entries.forEach((entry) => {
    const ready = teacherVocab.normalizeStudentReadyEntry(entry);
    if (!ready) return;
    addEntryKeys(index, ready, teacherVocab.generatePlaceholderLookupKeys);
  });
  senseBank.entries.forEach((entry) => {
    if (entry.hidden) return;
    addEntryKeys(index, entry, senseBank.generatePlaceholderLookupKeys);
  });
  cedictSupplement.entries.forEach((entry) => {
    addEntryKeys(index, entry, null);
  });
  return index;
}

const coverageIndex = createCoverageIndex();

function usage() {
  console.log([
    "Usage: node scripts/audit-edge-extra-mock-vocab-coverage.js [options]",
    "",
    "Options:",
    "  --corpus <file>        Text corpus JSON. Default: private_exports/edge_extra_mock_text_corpus.json",
    "  --out <file>           JSON output. Default: private_exports/edge_extra_mock_vocab_coverage.json",
    "  --csv <file>           CSV output. Default: private_exports/edge_extra_mock_vocab_coverage.csv",
    "  --min-count <n>        Minimum total frequency for word rows. Default: 2",
    "  --min-phrase-count <n> Minimum frequency for phrase rows. Default: 4",
    "  --phrase-window <n>    Max phrase length to scan. Default: 4",
    "  --max-words <n>        Max word candidates before lookup. Default: 12000",
    "  --max-phrases <n>      Max phrase candidates before lookup. Default: 6000",
    "  --max-example-rows <n> Max missing rows to scan for examples. Default: 300",
    "  --limit <n>            Max rows to include in CSV. Default: 1200"
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    corpus: DEFAULT_CORPUS,
    jsonOut: DEFAULT_JSON_OUT,
    csvOut: DEFAULT_CSV_OUT,
    minCount: 2,
    minPhraseCount: 4,
    phraseWindow: 4,
    maxWords: 12000,
    maxPhrases: 6000,
    maxExampleRows: 300,
    limit: 1200
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--corpus") options.corpus = path.resolve(argv[++index] || options.corpus);
    else if (arg === "--out") options.jsonOut = path.resolve(argv[++index] || options.jsonOut);
    else if (arg === "--csv") options.csvOut = path.resolve(argv[++index] || options.csvOut);
    else if (arg === "--min-count") options.minCount = Math.max(1, Number(argv[++index]) || options.minCount);
    else if (arg === "--min-phrase-count") options.minPhraseCount = Math.max(1, Number(argv[++index]) || options.minPhraseCount);
    else if (arg === "--phrase-window") options.phraseWindow = Math.min(5, Math.max(2, Number(argv[++index]) || options.phraseWindow));
    else if (arg === "--max-words") options.maxWords = Math.max(100, Number(argv[++index]) || options.maxWords);
    else if (arg === "--max-phrases") options.maxPhrases = Math.max(0, Number(argv[++index]) || 0);
    else if (arg === "--max-example-rows") options.maxExampleRows = Math.max(0, Number(argv[++index]) || 0);
    else if (arg === "--limit") options.limit = Math.max(1, Number(argv[++index]) || options.limit);
  }
  return options;
}

function normalizeWord(value) {
  return String(value || "")
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function normalizeDisplay(value) {
  return String(value || "")
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ");
}

function stripPossessive(token) {
  return token.replace(/'s$/i, "");
}

function tokenize(text) {
  return String(text || "")
    .replace(/[’‘]/g, "'")
    .replace(/[‐‑‒–—―]/g, "-")
    .match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g) || [];
}

function getLookupVariants(word) {
  const normalized = normalizeWord(word);
  const variants = new Set([normalized, stripPossessive(normalized)]);
  if (normalized.endsWith("'s")) variants.add(normalized.slice(0, -2));
  if (normalized.endsWith("ies") && normalized.length > 4) variants.add(`${normalized.slice(0, -3)}y`);
  if (normalized.endsWith("ves") && normalized.length > 4) {
    variants.add(`${normalized.slice(0, -3)}f`);
    variants.add(`${normalized.slice(0, -3)}fe`);
  }
  if (normalized.endsWith("es") && normalized.length >= 4) variants.add(normalized.slice(0, -2));
  if (normalized.endsWith("s") && normalized.length > 3) variants.add(normalized.slice(0, -1));
  if (normalized.endsWith("ying") && normalized.length > 5) variants.add(`${normalized.slice(0, -4)}ie`);
  if (normalized.endsWith("ing") && normalized.length > 4) {
    const base = normalized.slice(0, -3);
    if (base.length <= 2 && !base.endsWith("o")) variants.add(`${base}e`);
    variants.add(base);
    if (!(base.length <= 2 && !base.endsWith("o"))) variants.add(`${base}e`);
    if (/([a-z])\1$/.test(base)) variants.add(base.slice(0, -1));
  }
  if (normalized.endsWith("ied") && normalized.length >= 4) {
    variants.add(normalized.slice(0, -1));
    variants.add(`${normalized.slice(0, -3)}y`);
  }
  if (normalized.endsWith("ed") && normalized.length > 4) {
    const base = normalized.slice(0, -2);
    variants.add(base);
    variants.add(`${base}e`);
    if (/([a-z])\1$/.test(base)) variants.add(base.slice(0, -1));
  }
  if (normalized.endsWith("er") && normalized.length > 4) {
    const base = normalized.slice(0, -2);
    variants.add(base);
    variants.add(`${base}e`);
    if (/([a-z])\1$/.test(base)) variants.add(base.slice(0, -1));
    if (normalized.endsWith("ier")) variants.add(`${normalized.slice(0, -3)}y`);
  }
  if (normalized.endsWith("est") && normalized.length > 5) {
    const base = normalized.slice(0, -3);
    variants.add(base);
    variants.add(`${base}e`);
    if (/([a-z])\1$/.test(base)) variants.add(base.slice(0, -1));
    if (normalized.endsWith("iest")) variants.add(`${normalized.slice(0, -4)}y`);
  }
  return Array.from(variants).filter(Boolean);
}

const lookupCache = new Map();

function lookupAny(candidate) {
  const cacheKey = normalizeWord(candidate);
  if (lookupCache.has(cacheKey)) return lookupCache.get(cacheKey);
  const variants = getLookupVariants(candidate);
  for (const variant of variants) {
    const indexedEntry = coverageIndex.get(variant);
    if (indexedEntry) {
      const result = {
        covered: true,
        via: indexedEntry.source === "cc-cedict-supplement"
          ? "supplement"
          : (indexedEntry.source === "teacher" ? "teacher" : "curated"),
        variant,
        entry: indexedEntry
      };
      lookupCache.set(cacheKey, result);
      return result;
    }
  }
  const result = { covered: false, via: "", variant: "" };
  lookupCache.set(cacheKey, result);
  return result;
}

function isStopToken(token) {
  const normalized = normalizeWord(token);
  return normalized.length < 3 || STOPWORDS.has(normalized) || LIKELY_NAME_WORDS.has(normalized);
}

function isLikelyBoilerplate(word) {
  return /^(?:www|w-w-w|http|https|com|org|edu|html|pdf|docx?|copyright|reserved|photocopiable|pearson|longman|question-answer|mergeformat|acknowledgements|announcer|lang|eng|parta|partb|qab|qab-[a-z]|df-[a-z]|rp-[a-z]|[a-z]-[a-z]|b-one|b-two|nos|btw|hmm|yep|huh|thx|etc|eset|nssle|adj|prep|mon|pok|greentrek|yeahk|ffg|gohk|csc|digimediaco|crowdkitty|lira|upf|panpo|hksm|rawpixel|rec|bep|bsc|aug|sep|apr|inc|cont|frm|pic|pics|img|sec|hrs|abt|caf|yahoo|gmail|hotmail|suntours|leungchopan|szefei|hkrcc|mlc|sds|ffghk|artisticco|kitty|ups|kee|vox|dos|zolimacitymag|theguardian|blogdomain|georgejmclittle|mlcfilms|redsol|hash-freshscoopmk|wwf-hong|cuhk|fehd|rthk|mit|npcs|gaa|arkit|gsm|als|coca|ritte|autumnn|asiatalk|dlee|hanghighhammocks|hkidf|hkytf|kcb|mbti|oceanwatchhk|ssle|coetpo|crstocker|esdkh|cro|hkid|hkx|invstgt|istockphoto|jpl|lddesign|michaeljung|notesheet|papipaebrl|skramer|xmail|yummybuum|ssm|tdsc|tonyl|dlaw|maxco|nathanpo|skmc|thrillworld|crogroup|fssas|lilyau|mydas|qfung|wkc|aktmag|ckchan|dela|hkies|htse|seahk|animart|artfriendly|csa|cso|llner|mchiu|oags|rau|seaofbooks|shopmaxx|aiff|annieb|artmakerbit|blackday|bmc|boysdancetoo|careersite|chkmcu|chrisfungch|classen|cmb|ica|ssf|hkca|cbc|ccs|ctbuh|cuson|cwcollege|defpicture|dena|dergriza|djvstock|drawlab|ecf|everhillacademy|farbai|flydragon|fotoru|ger|hafakot|hkto|ico|ilm|iqoncept|ireach|ismadesign|itv|jamesjoong|jamiew|jbk|jga|jimspence|jrr|kcy|kinglaidev|kues|lantauanimalwelfare|lilya|llahk|lmok|luisangel|mandarinka|mannyc|metastudy|mihoyo|mpc|mtkang|nastyboy|newentrepreneuroftheyear|oag|ontopoint|pathdoc|pml|ppfta|pta|racorn|robuart|sayam|sergiobarrios|sfs|sia|simont|simpp|skgazette|spc|ssc|stpc|stu|superpediax|svetara|swd|syzx|thm|tlau|membranaceus|ons)$/.test(word);
}

function isContraction(word) {
  return /^[a-z]+(?:n't|'[a-z]+)$/.test(word);
}

function isReversedTextArtifact(word) {
  const reversed = normalizeWord(word).split("").reverse().join("");
  return STOPWORDS.has(reversed) || coverageIndex.has(reversed);
}

function getIgnoreReason(row) {
  const word = row.candidate;
  if (!word || word.length < 3) return "too-short";
  if (STOPWORDS.has(word)) return "function-word";
  if (LIKELY_NAME_WORDS.has(word)) return "source-name";
  if (isLikelyBoilerplate(word)) return "boilerplate";
  if (isContraction(word)) return "contraction";
  if (/^(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)-(?:one|two|three|four|five|six|seven|eight|nine)$/.test(word)) return "hyphen-number";
  if (/^(?:\d+|[a-z]+)?-?year-olds?$/.test(word)) return "age-expression";
  if (row.kind === "word" && (isReversedTextArtifact(word) || /^(?:eht|dekram|lliw|nettirw|snigram|srewsna|eb|lla|desu|writt|emos|egaugnal|yam|saedi|yletairporppa|egnar|elpmis|ylraelc|etairporppa|noitacinummoc|snrettap|yletarucca|yralubacov|htiw|nehw|seigetarts|snoisserpxe|sesnopser|tsom|yllareneg|desserpxe|sdnuos|sdrow|segnahcxe|sretsulc|yllausu|noitcerroc-fles|dednapxe|dednetxe|deniatsus|dnopser|etarucca|lanoitasrevnoc|srehto|decudorp|dednetxe|depoleved|detarobale|detcirtser|detpmorp|gnisarhper|serutaef|smelborp|srorre|deknil|dedrawa|deriuqer|detroppus|devired|evitaterpretni|gnidnopser|gnidrawa|gnikaeps|gnisu|gnitartnecnoc|secneuqes|sehcterts|senilediug|sesarhp|sniamod|stpmetta)$/.test(word))) return "reversed-text-artifact";
  if (/^(?:[a-z]-){2,}[a-z]$/.test(word)) return "spelled-out-initials";
  if (/^(?:th-century|twenty-ten|m-a-y|nine-one)$/.test(word)) return "date-expression";
  if (/^(?:three-seven-two-eight)$/.test(word)) return "number-fragment";
  if (/^(?:w-w-w-dot-greentrek-dot-org-dot-h-k|equipmnt|two-teams|vailable)$/.test(word)) return "source-fragment";
  if (/^(?:hike-leader-to-group-member|how-algorithms-control-your-life-hannah-fry|slash-summer-hyphen-appeal|huffed-out|cetera)$/.test(word)) return "long-source-fragment";
  if (row.kind === "word" && row.lowercaseCount === 0 && row.titleCaseCount > 0) return "likely-proper-name";
  if (row.kind === "word" && row.titleCaseCount >= row.count * 0.9 && row.lowercaseCount <= 2) return "likely-proper-name";
  if (/^\d+$/.test(word)) return "number";
  if (/^[a-z]$/.test(word)) return "single-letter";
  if (/^[ivx]+$/.test(word)) return "roman-numeral";
  if (row.kind === "phrase") {
    const parts = word.split(/\s+/);
    if (parts.length < 2) return "not-phrase";
    if (/(?:listening note-taking|note card back|self-correction|well-developed|narrowly-restricted formulaic|language patterns|communication self-correction|impede communication|magazine listening|out line|card back|take away (?:back|front)|away (?:back|front)|taken away|collected together)/.test(word)) return "exam-boilerplate-phrase";
    if (/^(?:something|someone|say|find|want|learn|saying|there's|it's|that's|really looking forward|working together|work together|time together|people together|walking along|back home|further away|far away|way back|science behind|back memories|out anything|people out|things down|something (?:else|important|positive|useful|special|that's)|single-use face|animal-free ice|resolved ongoing follow-up(?: action)?|issue resolved ongoing follow-up|ongoing follow-up(?: action)?|down taylor|mei-ling jake|two-three-seven club|ultra-processed people|say something|that's something|someone else|welcome back|find something|want something|it's something|learn something|saying something|there's something|forty-five minutes|(?:beach )?clean-up report|pop-up themed|desu noitcerroc-fles|jewellery-making school|nineteen ninety-two|indie-mood festival|longest-running organisations|malaria-carrying mosquitoes|night-sky brightness|top-level athletes)$/.test(word)) return "ordinary-combination";
    if (parts.some((part) => STOPWORDS.has(part) || LIKELY_NAME_WORDS.has(part) || isLikelyBoilerplate(part))) return "boilerplate-phrase";
    if (parts.every((part) => STOPWORDS.has(part))) return "function-phrase";
  }
  if (row.documentCount <= 1 && /^[A-Z][a-z]+$/.test(row.display)) return "likely-name";
  return "";
}

function hasPhraseSignal(phrase) {
  const parts = phrase.split(/\s+/);
  if (parts.some((part) => STOPWORDS.has(part) || LIKELY_NAME_WORDS.has(part) || isLikelyBoilerplate(part))) return false;
  if (phrase.includes("-")) return true;
  if (/\b(?:about|across|after|against|ahead|along|around|away|back|behind|down|for|forward|from|in|into|off|on|out|over|through|to|together|under|up|with|without)\b/.test(phrase)) {
    return true;
  }
  if (/\b(?:as|at|by|of|the|one's|someone|something)\b/.test(phrase)) return true;
  return false;
}

function findExample(text, candidate) {
  const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  const match = String(text || "").match(new RegExp(`[^.!?]{0,80}\\b${escaped}\\b[^.!?]{0,120}[.!?]?`, "i"));
  return match ? normalizeDisplay(match[0]).slice(0, 240) : "";
}

function addRow(map, key, data) {
  if (!map.has(key)) {
    map.set(key, {
      candidate: key,
      display: data.display || key,
      kind: data.kind || "word",
      count: 0,
      documentKeys: new Set(),
      mockPapers: new Set(),
      lowercaseCount: 0,
      titleCaseCount: 0,
      uppercaseCount: 0,
      examples: []
    });
  }
  const row = map.get(key);
  row.count += data.count || 1;
  if (/^[a-z]/.test(data.display || "")) row.lowercaseCount += 1;
  else if (/^[A-Z][a-z]/.test(data.display || "")) row.titleCaseCount += 1;
  else if (/^[A-Z]{2,}$/.test(data.display || "")) row.uppercaseCount += 1;
  if (data.documentKey) row.documentKeys.add(data.documentKey);
  if (data.mockPaper) row.mockPapers.add(data.mockPaper);
  if (data.example && row.examples.length < 3) row.examples.push(data.example);
}

function collectRows(corpus, options) {
  const words = new Map();
  const phrases = new Map();

  corpus.records.forEach((record) => {
    if (!record.textPath || !fs.existsSync(record.textPath)) return;
    const text = fs.readFileSync(record.textPath, "utf8");
    const tokens = tokenize(text);
    const normalizedTokens = tokens.map((token) => normalizeWord(token)).filter(Boolean);
    const documentKey = `${record.mock || "?"}-P${record.paper || "?"}-${record.role || "source"}`;
    const mockPaper = `ES${record.mock || "?"} P${record.paper || "?"}`;

    normalizedTokens.forEach((token, index) => {
      if (isStopToken(token) || isLikelyBoilerplate(token)) return;
      addRow(words, stripPossessive(token), {
        display: tokens[index],
        kind: "word",
        documentKey,
        mockPaper,
        example: ""
      });
    });

    if (options.maxPhrases > 0) {
      for (let index = 0; index < normalizedTokens.length; index += 1) {
        for (let size = 2; size <= options.phraseWindow; size += 1) {
          const slice = normalizedTokens.slice(index, index + size);
          if (slice.length < size) continue;
          if (slice.some((part) => !part || isLikelyBoilerplate(part))) continue;
          if (isStopToken(slice[0]) || isStopToken(slice[slice.length - 1])) continue;
          if (slice.filter((part) => !STOPWORDS.has(part)).length < 2) continue;
          const phrase = slice.join(" ");
          addRow(phrases, phrase, {
            display: tokens.slice(index, index + size).join(" "),
            kind: "phrase",
            documentKey,
            mockPaper,
            example: ""
          });
        }
      }
    }
  });

  function finalize(row) {
    const coverage = lookupAny(row.candidate);
    const plain = {
      candidate: row.candidate,
      display: row.display,
      kind: row.kind,
      covered: coverage.covered,
      coveredVia: coverage.via,
      coveredVariant: coverage.variant,
      count: row.count,
      documentCount: row.documentKeys.size,
      lowercaseCount: row.lowercaseCount,
      titleCaseCount: row.titleCaseCount,
      uppercaseCount: row.uppercaseCount,
      mockPapers: Array.from(row.mockPapers).slice(0, 12),
      examples: row.examples
    };
    plain.ignoreReason = coverage.covered ? "" : getIgnoreReason(plain);
    plain.priority = scorePriority(plain);
    return plain;
  }

  const wordRows = Array.from(words.values())
    .filter((row) => row.count >= options.minCount)
    .sort((left, right) => (
      right.documentKeys.size - left.documentKeys.size
      || right.count - left.count
      || left.candidate.localeCompare(right.candidate)
    ))
    .slice(0, options.maxWords)
    .map(finalize);
  const phraseRows = Array.from(phrases.values())
    .filter((row) => row.count >= options.minPhraseCount)
    .filter((row) => hasPhraseSignal(row.candidate))
    .sort((left, right) => (
      right.documentKeys.size - left.documentKeys.size
      || right.count - left.count
      || left.candidate.localeCompare(right.candidate)
    ))
    .slice(0, options.maxPhrases)
    .map(finalize);

  addExamples(wordRows, corpus, options);
  addExamples(phraseRows, corpus, options);

  return [...wordRows, ...phraseRows].sort((left, right) => (
    Number(left.covered) - Number(right.covered)
    || Number(Boolean(left.ignoreReason)) - Number(Boolean(right.ignoreReason))
    || right.priority - left.priority
    || right.documentCount - left.documentCount
    || right.count - left.count
    || left.candidate.localeCompare(right.candidate)
  ));
}

function addExamples(rows, corpus, options = {}) {
  const maxExampleRows = Number(options.maxExampleRows) || 0;
  const needExamples = rows.filter((row) => !row.covered && !row.ignoreReason).slice(0, maxExampleRows);
  if (!needExamples.length) return;
  const texts = corpus.records
    .filter((record) => record.textPath && fs.existsSync(record.textPath))
    .map((record) => fs.readFileSync(record.textPath, "utf8"));
  needExamples.forEach((row) => {
    for (const text of texts) {
      const example = findExample(text, row.candidate);
      if (example) {
        row.examples = [example];
        break;
      }
    }
  });
}

function scorePriority(row) {
  if (row.covered || row.ignoreReason) return 0;
  let score = Math.min(row.documentCount, 20) * 5 + Math.min(row.count, 80);
  if (row.kind === "phrase") score += 25;
  if (/-/.test(row.candidate)) score += 8;
  if (/\b(?:under|over|into|through|around|away|back|off|out|up|down|for|with|against|about)\b/.test(row.candidate)) {
    score += 6;
  }
  return score;
}

function escapeCsv(value) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(rows, outPath, limit) {
  const selected = rows.slice(0, limit);
  const lines = [CSV_HEADERS.join(",")];
  selected.forEach((row) => {
    lines.push(CSV_HEADERS.map((header) => {
      if (header === "example") return escapeCsv(row.examples?.[0] || "");
      return escapeCsv(row[header]);
    }).join(","));
  });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${lines.join("\n")}\n`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const corpus = JSON.parse(fs.readFileSync(options.corpus, "utf8"));
  const rows = collectRows(corpus, options);
  const actionable = rows.filter((row) => !row.covered && !row.ignoreReason);
  const covered = rows.filter((row) => row.covered);
  const ignored = rows.filter((row) => !row.covered && row.ignoreReason);
  const summary = {
    generatedAt: new Date().toISOString(),
    corpus: options.corpus,
    sourceRecords: corpus.records?.length || 0,
    totalRows: rows.length,
    coveredCount: covered.length,
    ignoredMissingCount: ignored.length,
    actionableMissingCount: actionable.length,
    actionableWords: actionable.filter((row) => row.kind === "word").length,
    actionablePhrases: actionable.filter((row) => row.kind === "phrase").length,
    topActionable: actionable.slice(0, 40).map((row) => ({
      candidate: row.candidate,
      kind: row.kind,
      count: row.count,
      documentCount: row.documentCount,
      priority: row.priority,
      example: row.examples?.[0] || ""
    }))
  };

  fs.mkdirSync(path.dirname(options.jsonOut), { recursive: true });
  fs.writeFileSync(options.jsonOut, JSON.stringify({ summary, rows }, null, 2));
  writeCsv(rows, options.csvOut, options.limit);
  console.log(JSON.stringify({ outJson: options.jsonOut, outCsv: options.csvOut, summary }, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  collectRows,
  getLookupVariants,
  lookupAny,
  normalizeWord,
  tokenize
};
