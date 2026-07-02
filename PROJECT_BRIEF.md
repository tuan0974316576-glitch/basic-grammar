# Project Brief: English Learning App

## Product Goal

This project is evolving from a grammar game into a Duolingo-style English learning app for Hong Kong primary students and the tutoring centre.

The app should feel like a real mobile app, not a scrolling website:

- clean, cute, Japanese stationery style
- fast lesson loops
- clear Cantonese / Traditional Chinese explanations
- game-like progress, XP, streaks, achievements, and level up
- eventually supports student records across devices

## Main App Areas

### 1. Grammar Lessons

This is the current main module.

Students practise grammar through short interactive lessons:

- Lesson 01: 分辨句子是否有主動動詞
- Lesson 02: 一句句子必須只有一個動詞
- Quiz 1: 重組英文句子
- Lesson 03: 何謂句子
- Lesson 04: 代名詞配對
- Lesson 05: 代名詞句子 MC
- Lesson 06: 可數名詞的使用要點
- Lesson 07: 名詞的類別
- Lesson 08: Modal Verb 的要訣
- Lesson 09: Adjective 形容詞
- Lesson 10: Adverb 副詞
- Lesson 11: Tenses 時態分辨
- Lesson 12: Verb Table 動詞四式
- Lesson 13: 「有」的主要用法

Design principle: each wrong answer should teach clearly why it is wrong. Explanations should be simple, accurate, and useful for primary students.

### 2. Vocabulary

Students should be able to enter vocabulary they learned in class and revise it later.

The app should automatically create different quiz modes from saved words:

- Reading: recognise English and meaning
- Spelling: type the English word
- Listening: hear the word and choose / type the answer
- Speaking: read the word aloud and check pronunciation

This module should eventually support vocab lists by class, topic, lesson, and student.

### 3. Scan Dictionary

Students can take a photo of worksheet / textbook text, scan words naturally, and look them up.

This feature is being developed in another app first and will be merged later.

Long-term behaviour:

- scan image
- detect English words
- show meanings / pronunciation / examples
- add selected words to the student's vocab list

## Player System

The app should gradually become more Duolingo-like:

- XP
- levels
- streaks
- daily goals
- achievements
- lesson mastery
- mistake revision queue
- encouraging sound and celebration effects

Keep the first version simple. Add the data model before adding complex UI.

## Records And Firebase Direction

Long term, the app should save player records online so students can continue on another phone and teachers can review progress.

### Firebase Project Status

Current setup uses the dedicated Grammar Game Firebase project (`enguistics-grammar-game`).

Do not move real student records back into the shared Battleship-1 project.

Azure Speech / shared vocab audio:

- Azure Speech resource: `battleship-speech-hk`
- Speech region: `eastasia`
- Firebase secrets `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` are set.
- Function `ensureVocabAudio` is deployed in `asia-east2`.
- Default Firebase Storage bucket `enguistics-grammar-game.firebasestorage.app` is created in `ASIA-EAST2`.
- New vocab audio flow: if the word is not in the bundled Battleship-1 audio manifest, the logged-in app calls `ensureVocabAudio`; the function generates Azure TTS MP3 once, saves it under `vocab-audio/v1/`, and later students reuse the shared Firebase audio file.
- Vocab example audio uses the same callable with `kind: "example"` only when the student taps an English example sentence. It generates Azure TTS once, saves shared MP3 files under `vocab-example-audio/v1/`, records metadata in `vocabExampleAudio`, and the app caches the MP3 in IndexedDB for offline replay.
- Student-facing vocab meaning lookup must stay deterministic and fast: cloud teacher live bank -> bundled teacher bank plus curated local supplement -> reviewed Hong Kong / culture / school supplement. Do not show placeholder meanings, call live Azure / Gemini meaning fallback, or display unreviewed ECDICT / CC-CEDICT reverse entries while students type.

Recommended direction:

- Firebase Authentication with tutoring-centre student accounts
- Students log in with `studentId + PIN`
- A Firebase Cloud Function verifies the PIN server-side and provisions a generated Firebase Auth email/password account
- PINs must never be stored in frontend code; store salted PIN hashes in protected Firestore documents
- Firestore for progress, attempts, vocab items, achievements, and streaks
- local/offline-first behaviour so students can still play without perfect internet

Suggested collections:

- `users/{uid}`
- `studentAccounts/{studentId}` for server-side account lookup only
- `users/{uid}/grammarProgress/{lessonId}`
- `users/{uid}/vocabItems/{wordId}`
- `users/{uid}/attempts/{attemptId}`
- `users/{uid}/achievements/{achievementId}`

Do not write to Firebase on every tap. Prefer saving after a question, round, or meaningful progress event.

### Vocabulary Sync Model

Vocab is local-first and syncs through `users/{uid}/vocabItems/{wordId}` after student login.

Each vocab item stores:

- `word`, `meaning`, `meanings`, `createdAt`, `updatedAt`
- `meanings` stores one or more meaning entries for the same English word, each with optional `pos`, `type`, `source`, `teacherEntryId`, and `sourceEntryId`; selecting two meanings should keep one vocab row, not create duplicate word rows.
- `progress` with SRS fields: `lastSeenAt`, `totalSeen`, `totalCorrect`, `totalIncorrect`, `streakCorrect`, `mastery`, `nextDueAt`, `halfLifeDays`, `lastRecallProb`, `updatedAt`
- `deletedAt` tombstones for cross-device deletion safety
- `ownerUid` and `syncedAt` for sync bookkeeping

Guest vocab may be backfilled into the first logged-in student account. If a different student logs in later, the app must not mix the previous student's cached vocab into the new account.

### Teacher Vocab Bank

Current vocab-bank goal:

1. Add and keep improving the in-app teacher vocab page first. Austin Sir can type English / POS / Chinese meaning during class and save entries to the shared Firebase `teacherVocabLive` bank. Students should be able to find those teacher-approved meanings immediately.
2. Build a clean student-facing vocab bank, not a noisy live dictionary. Oxford 3000 / Oxford 5000 / PDF lists are coverage checklists. ECDICT / CC-CEDICT / generated meanings / other sources are raw review material only, never automatic student-facing answers.
3. Use PDF / Oxford / common-word lists as checklists first, then use ECDICT / CC-CEDICT / generated sources only to prepare draft material. After that, Codex reviews entries in small batches and promotes only clean entries into the teacher / curated bank.
4. Large-batch review is Codex's job, not Austin Sir's manual job. Auto-review may prepare conservative drafts, but Codex must inspect batches, fix POS, improve Chinese meanings, remove duplicate or near-duplicate senses, add missing common meanings, handle phrases / phrasal verbs, and only then promote entries into the teacher / curated bank.
5. Cleanup order: teacher live input page + Firebase shared bank, then the existing 4000-ish teacher bank, then Oxford / common basic vocabulary, then countries, cities, Hong Kong life words, and school vocabulary.
6. Missing coverage should be fixed by improving the teacher / curated bank. Do not show placeholder meanings such as "待老師確認" in the student UI.

Chinese meanings should prefer Austin Sir's notes / Excel vocab sheets over generic dictionaries.

Current pipeline:

- Run `npm run vocab:import -- "/path/to/vocab.xlsx"` to generate `teacher_vocab_bank.js`.
- The importer reads side-by-side `English | Chinese` column pairs, including sheets with A/B and C/D pairs.
- `teacher_vocab_manual_updates.json` stores Austin Sir's latest lesson meanings. Manual updates are applied after Excel import and override older entries with the same word / POS / type.
- Teacher notes are the highest authority, but obvious typos, wrong POS labels, or misleading meanings may be corrected in manual updates. Keep the original typo as an `aliases` entry when useful, so searching the typo still returns the corrected word while students save / see the proper spelling.
- `teacher_vocab_conflicts.json` is generated for review when the same English word has multiple Chinese meanings or unclear POS.
- POS belongs to a specific meaning, not only to the spelling of the English word. For example, `secure` can have separate adjective and verb entries.
- Patterns such as `be+pp` and `as+名詞` are stored as `type: "pattern"`, not as normal POS.
- Do not show ECDICT / generated offline dictionary entries directly to students. It is too noisy for primary-level vocab and can surface misleading meanings. Keep it only as a developer/reference asset unless an entry is manually promoted into the curated bank.
- Vocabulary bank cleanup should be review-first. Use `npm run vocab:review-batch -- --offset 0 --limit 100` to create private JSON/CSV batches in `private_exports/` from the Oxford checklist, existing teacher entries, curated entries, ECDICT material, generated meaning seeds, and CC-CEDICT reverse material. Codex reviews POS, Chinese meanings, duplicate senses, multi-meaning words, and phrases in small batches before anything is promoted into `vocab_sense_bank.js`, `teacher_vocab_manual_updates.json`, or the cloud teacher bank. Austin Sir may spot-check, but should not need to manually review thousands of rows.
- After each reviewed batch, Codex must do a second-pass common-meaning sweep for basic or high-frequency words. Cleaning a noisy teacher entry is not enough: common extra senses should be added when appropriate, e.g. `water n. 水` and `water v. 澆水`, while related plural-only forms such as `waters n. 水域` must not pollute the singular `water` lookup.
- For the existing teacher bank, use `npm run vocab:review-batch -- --source teacher-audit --skip-junk --offset 0 --limit 100 --out private_exports/teacher_vocab_review_batch_highvalue_0000.json` to produce the first high-value cleanup batch. Full audit mode keeps spreadsheet extraction fragments; `--skip-junk` hides obvious one-letter / malformed fragments so Austin Sir can clean real class vocabulary first.
- Use `npm run vocab:review-index -- --out private_exports/teacher_vocab_review_index.json` after creating review batches. The private index tracks generated batch files, ready-for-review batches, current coverage, and the next offset so the 4000-word cleanup can continue in order. Do not treat "ready for review" as "already cleaned".
- Use `npm run vocab:review-dashboard` to create a private `vocab_review_dashboard.json/csv` across teacher, Oxford, teacher-live, and supplement queues. It is a management view only; reviewed entries still need promote-plan / apply-plan before becoming student-facing.
- Use `npm run vocab:review-next` to generate the next high-value teacher-audit batch automatically from the private index. It writes JSON/CSV/XLSX and refreshes the index. Use `npm run vocab:review-next -- --count 2` to generate multiple 100-word batches in order when preparing more private review work.
- For Oxford / common-vocab cleanup after the teacher-audit pass, use `npm run vocab:review-next:oxford -- --count 1`. This uses a separate private prefix/index (`oxford_vocab_review_batch_*`, `oxford_vocab_review_index.json`) so Oxford batches do not mix with the 4000-word teacher cleanup. Oxford PDFs remain a local checklist only; only reviewed meanings should be promoted.
- To fold same-day cloud entries back into the reviewed local bank, run `npm run vocab:refresh-teacher-live-review`. This exports Firestore `teacherVocabLive` into `private_exports/teacher_live_vocab_snapshot.json/csv`, creates the next private `teacher_live_vocab_review_batch_*` review batch, and refreshes `private_exports/vocab_review_dashboard.json/csv` in one command. Use `-- --count 2` to prepare more than one batch, or `-- --no-xlsx` only for fast developer tests. The older lower-level commands `npm run vocab:export-teacher-live` and `npm run vocab:review-next:teacher-live -- --count 1` still exist for debugging.
- The in-app teacher vocab page supports both single-entry saves and batch paste into Firestore `teacherVocabLive`. Batch paste accepts lines such as `hawker n. 小販`, `look for v. 尋找`, tab-separated `word / POS / meaning`, or `word 中文意思`; POS is inferred when safe and should still be exported/reviewed later through the teacher-live review queue.
- For the later country / city / Hong Kong life / school-vocab supplement pass, use `npm run vocab:review-next:supplement -- --count 1`. This reads our own `scripts/vocab-supplement-checklist.js` candidate list, writes `supplement_vocab_review_batch_*` private files, and still requires Austin Sir review before promotion.
- Use `npm run vocab:review-xlsx -- private_exports/teacher_vocab_review_batch_highvalue_0000.json --out private_exports/teacher_vocab_review_batch_highvalue_0000.xlsx` to turn a private review JSON into a formatted Excel workbook. The workbook is private review material and must stay out of git.
- Review workbooks support up to three approved senses on one row: `reviewed POS / reviewed meaning / promote to`, then `reviewed POS 2 / reviewed meaning 2 / promote to 2`, and `reviewed POS 3 / reviewed meaning 3 / promote to 3`. Use these for true multi-meaning words instead of manually duplicating rows.
- For assistant-side bulk cleanup where Austin Sir should not manually inspect every row, use `npm run vocab:auto-review -- private_exports/teacher_vocab_review_batch_highvalue_0100.json`. This creates a private `_auto_review.csv` with only high-confidence rows filled in. The auto-review rules are deliberately conservative: use the original teacher Chinese meaning when it is clean, infer / confirm POS from deterministic rules and matching draft material, and leave duplicate, noisy, multi-POS, or source-conflict rows untouched for a later focused pass. ECDICT / CC-CEDICT remain supporting material only; their meanings are not promoted directly into the student dictionary. Run `npm run vocab:process-review -- <auto_review.csv>` next, then dry-run / write `vocab:apply-plan` as usual.
- After Austin Sir fills `reviewed_pos`, `reviewed_meaning`, and `promote_to` in a private review CSV/XLSX, run `npm run vocab:process-review -- private_exports/teacher_vocab_review_batch_highvalue_0000.xlsx`. This runs preflight first and only creates `private_exports/teacher_vocab_promote_plan_highvalue_0000.json` if there are no blocking errors. Fix errors such as missing `promote_to`, unsupported POS, noisy English text inside Chinese meanings, duplicate senses, and half-filled rows before trying again.
- After a promote plan is created, dry-run `npm run vocab:apply-plan -- private_exports/teacher_vocab_promote_plan_highvalue_0000.json`; only add `--write` after checking the summary. Applying a plan writes reviewed teacher entries to `teacher_vocab_manual_updates.json`, curated entries to `vocab_sense_bank.js`, rebuilds the generated teacher bank for the app, writes a private `*_applied.json` receipt, and refreshes the review index/dashboard. The lower-level `vocab:review-preflight` and `vocab:promote-plan` commands still exist for debugging, but the normal workflow should use `vocab:process-review`.
- To publish reviewed teacher entries into the shared cloud teacher bank, run `npm run vocab:sync-teacher-live -- private_exports/teacher_vocab_promote_plan_highvalue_0000.json` first. This dry-run only counts `promote_to=teacher` entries and prints a sample. After checking it, add `--write` to upload to Firestore `teacherVocabLive`; a successful write creates a private `*_live_synced.json` receipt and refreshes the review index/dashboard so synced batches show as `live-synced`. To sync all already-applied teacher manual updates, use `npm run vocab:sync-teacher-live -- teacher_vocab_manual_updates.json --write`. Curated entries are intentionally not uploaded by this tool.
- Student-facing meaning lookup order is: Firestore `teacherVocabLive` / same-day teacher entries first, then `teacher_vocab_bank.js` / Austin Sir notes merged with `vocab_sense_bank.js`, then reviewed Hong Kong / culture / school supplements. Do not guess from generic dictionaries in the student UI, do not display unreviewed ECDICT / CC-CEDICT reverse entries, and do not show placeholders as selectable meanings.
- `vocab_sense_bank.js` is the curated local multi-meaning supplement for common words that generic dictionaries often confuse. It sits after teacher notes and before the CC-CEDICT supplement, but an entry may set `overrideTeacher` when it is a manually reviewed correction for noisy old Excel / generated teacher-bank data. Saved vocab, example lookup, and revision should follow the selected sense (`word + POS/type + meaning`), so a word such as `game` only shows `野味` examples if the student selected `n. 野味`.
- Battleship-1 should share the same reviewed student-facing vocab bank. Grammar Game remains the master source; after updating reviewed vocab files, run `npm run vocab:sync-battleship` to copy the shared vocab assets into `/Users/macbook/battleship-1`. This syncs vocab lookup content only, not student progress or raw review dictionaries.
- `cc_cedict_supplement.js` is a small curated supplement for Hong Kong place names and Chinese culture words such as `Mong Kok = 旺角`, `dim sum = 點心`, and `Mid-Autumn Festival = 中秋節`. It is not a general English dictionary.
- `cc_cedict_reverse.js` loads generated shards from `assets/cc-cedict-reverse/`. These shards are an offline English-to-Traditional-Chinese reverse index generated from CC-CEDICT (CC BY-SA 4.0). Keep it as private review material only; entries must be promoted into `vocab_sense_bank.js`, `cc_cedict_supplement.js`, or teacher bank before students see them.
- If teacher bank, curated supplement, and reviewed Hong Kong / culture / school supplement all have no match, show no selectable meaning and keep the Add button disabled. Fix coverage by improving the teacher / curated vocab bank, not by asking students to save an unknown placeholder.
- Vocab example sentences should be AI-generated, not pulled directly from dictionary examples. The app sends the selected meaning / POS hints to Firebase Function `lookupVocabExamples`; the function checks shared Firestore cache `vocabExampleCache` first, then uses Gemini to generate short, natural, primary-level English examples with tightly matched Traditional Chinese translations. Cache generated examples in Firestore for the whole class and in localStorage for offline / fast repeat viewing. Example audio still uses shared Azure TTS cache only when the student taps an English example sentence.
- Pre-generated vocab examples may be bundled in `vocab_example_seed.js` after review. The app checks this seed before localStorage / Firestore / Gemini. Teacher vocab examples use a meaning-aware key (`word + POS/type/meaning`) so multi-meaning words such as `have` do not mix examples. CEFR level controls generation difficulty, but it is not part of the app lookup key because saved student vocab items may not always carry a level. Oxford-only examples use a bare word key.
- Oxford 3000 / 5000 PDFs may be imported locally to `private_exports/oxford_cefr_vocab.js` to infer CEFR levels for example generation, but the full Oxford word list must not be committed or bundled into the app. Keep it as a private local reference only.
- Example generation should be batched cautiously: dry-run first, generate a small sample, review the seed, then generate a larger batch. Avoid one giant uncontrolled Gemini run.

Student vocab items can store optional metadata:

- `pos`, `type`, `source`, `teacherEntryId`

This lets the app remember which teacher-bank meaning the student selected, so multi-meaning words do not overwrite each other during local/Firebase sync.

## Development Priorities

1. Keep improving the grammar lessons already in the app.
2. Add a 3-tab app shell: Grammar / Vocab / Scan.
3. Add player data model locally first.
4. Add Firebase sync for grammar progress, XP, streaks, and achievements.
5. Build the vocab module.
6. Merge the scan dictionary app later.
7. Build teacher / parent progress views after the student loop feels strong.

## Content Principles

- Use Traditional Chinese / Cantonese-friendly explanations.
- Keep English sentences natural and primary-level.
- Avoid examples that are grammatically possible but semantically odd.
- If a sentence is testing a specific grammar point, make the context natural enough that students focus on the grammar, not on guessing the teacher's intention.
- Wrong-answer explanations should distinguish different types of mistakes.
