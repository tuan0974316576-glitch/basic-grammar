# Agent Notes

Before making product or architecture changes, read `PROJECT_BRIEF.md`.

This app is intended to grow into a Duolingo-style English learning app for Hong Kong primary students, with three main areas:

- Grammar Lessons
- Vocabulary revision
- Scan dictionary / photo word lookup

Keep UI decisions app-like and mobile-first. Keep grammar explanations in clear Traditional Chinese / Cantonese-friendly wording.

Firebase reminder: the app now targets the dedicated Grammar Game Firebase project (`enguistics-grammar-game`). Do not move real student data back into the Battleship-1 project.

Vocabulary bank direction:

- Add and maintain the teacher vocab page first, saving teacher-approved English / POS / Chinese meaning entries to the shared Firebase `teacherVocabLive` bank.
- Use Oxford / PDF / common-word lists as coverage checklists.
- Use ECDICT / CC-CEDICT / generated sources as review material only, not as the student-facing dictionary.
- Codex should review large vocab batches in small chunks, clean POS / meanings / duplicates / phrases, and promote clean entries into the teacher / curated bank. Austin Sir should not need to manually review thousands of rows.
- After the existing teacher bank is clean, continue with Oxford / common basic words, then countries, cities, Hong Kong life words, and school vocabulary.
