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
- Lesson 07: Verb Table 動詞四式

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
- Cloud vocab meaning fallback should use Azure Translator, not Google Translate. Firebase secrets `AZURE_TRANSLATOR_KEY` and `AZURE_TRANSLATOR_REGION` must be set for `lookupVocabMeaning`.

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

- `word`, `meaning`, `createdAt`, `updatedAt`
- `progress` with SRS fields: `lastSeenAt`, `totalSeen`, `totalCorrect`, `totalIncorrect`, `streakCorrect`, `mastery`, `nextDueAt`, `halfLifeDays`, `lastRecallProb`, `updatedAt`
- `deletedAt` tombstones for cross-device deletion safety
- `ownerUid` and `syncedAt` for sync bookkeeping

Guest vocab may be backfilled into the first logged-in student account. If a different student logs in later, the app must not mix the previous student's cached vocab into the new account.

### Teacher Vocab Bank

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
- If teacher notes do not contain a word, the logged-in app may call Firebase Function `lookupVocabMeaning`. The function first checks shared Firestore cache `vocabMeaningCache`; if missing, it calls Azure Dictionary Lookup for multiple meaning / POS choices, then falls back to Azure Translate only when dictionary lookup has no useful entry. The student UI should still show normal labels such as `n.`, `v.`, `adj.`, or `ph.`, not the source label.
- Cloud fallback lookup should be debounced and cached on the client. Do not call Firebase / Azure Translator on every typed letter.
- If the offline / cloud dictionary is still unclear or has multiple unsuitable meanings, mark it as `待老師確認` rather than guessing.

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
