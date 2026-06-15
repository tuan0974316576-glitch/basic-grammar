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

### Firebase Project Migration Reminder

Current temporary setup uses the Battleship-1 Firebase project (`battleship-game-c0909`) so login and progress sync can be tested quickly.

Before any real student rollout, real `studentId + PIN` batch, App Store / Play Store release, teacher dashboard, paid class usage, or large vocab / scan sync feature, remind the user to move this app to its own Firebase project.

Do not let real student records build up in the shared Battleship-1 project unless the user explicitly accepts that migration cost.

Recommended direction:

- Firebase Authentication with tutoring-centre student accounts
- Students log in with `studentId + PIN`
- A Firebase Cloud Function verifies the PIN server-side and returns a Firebase custom token
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
