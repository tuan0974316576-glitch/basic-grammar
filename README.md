# Basic English Grammar Game

A standalone beginner grammar game for students, styled after the Japanese stationery look of the N4 practice app.

Long-term product direction is documented in [PROJECT_BRIEF.md](PROJECT_BRIEF.md).

Current modules:

- Lesson 01: 分辨句子是否有主動動詞
- 100 questions total: 50 action-verb sentences, 30 `是` sentences, and 20 adjective sentences.
- Students choose the practice length from 10 to 100 questions.
- Main menu keeps the coach and practice length in one fixed control panel, with lessons in a separate scrollable picker.
- Each practice randomly samples and interleaves action, `是`, and adjective questions.
- Students answer with Tick / Cross after reading the Chinese sentence.
- Action-verb sentences reveal the English sentence with browser speech playback.
- `是` sentences are not counted as action-verb sentences, so students press Cross first, then choose whether `is / am / are` is needed.
- Adjective sentences also ask whether `is / am / are` is needed, then ask students to pick the correct be verb.
- Cute browser-generated sound effects for start, correct, wrong, next, and complete states, with a small sound toggle.
- A coach mascot, live first-try score, current streak, and saved best streak keep the practice loop more game-like.
- Result page shows first-try score, mistake count, and accuracy.
- Result page can launch a focused mistake review round for any questions missed in the last practice.
- Lesson 02: 一句句子必須只有一個動詞.
- 100 Lesson 02 questions ask students to judge whether an English sentence is correct, count 0/1/2 verbs, and identify the verbs in wrong two-verb sentences.
- Quiz 1: 重組英文句子.
- 50 Quiz 1 questions show a Chinese sentence, then ask students to tap word blocks onto one long dashed answer line and confirm the rebuilt English sentence.
- Word blocks include question-specific distractors, animate into the answer line, can be tapped again to return to the word bank, and show the correct answer after a wrong confirmation.
- Lesson 03: 何謂句子.
- 30 Lesson 03 questions ask students to drag crayon-like underline strokes across English sentence units.
- Student login scaffold supports centre-issued `studentId + PIN` accounts through server-verified PINs and generated Firebase Auth email/password accounts.
- Progress still saves locally when Firebase is not configured, then queues grammar progress for Firestore sync after login.

Published with GitHub Pages:

https://tuan0974316576-glitch.github.io/basic-grammar/

## Student Login Setup

The current Firebase target is the dedicated Grammar Game project (`enguistics-grammar-game`). Do not move it back to the shared Battleship-1 project.

1. Copy `firebase_config.example.js` to `firebase_config.js` and fill in the Firebase web app config.
2. Deploy the Firestore rules and callable function with `npm run firebase:deploy:login`.
3. Put student accounts in `functions/students.json`, using the same shape as `functions/students.sample.json`.
4. Run `npm install` inside `functions/` once, then run `npm run firebase:seed:students`.
5. Test one account in the app before creating a full class batch.
6. If Firebase deploy says credentials are invalid, run `npm run firebase:reauth` first.
7. On this Mac, Firebase CLI commands run through `scripts/firebase-cli.js` so Node uses the Homebrew / system CA certificates.

Firestore rules and the callable `studentLogin` function are currently deployed to `enguistics-grammar-game` and have been verified with sample student accounts.

The app must never contain real student PINs. The seed script stores salted PIN hashes in Firestore.

## Vocabulary Example Seed Workflow

The app can use pre-generated AI example sentences before falling back to Firestore / Gemini. Teacher vocab stays the priority source. Oxford 3000 / 5000 PDFs are used only as a private CEFR level reference and must not be bundled into the app or committed.

1. Import the Oxford PDFs into the ignored private export:

   ```bash
   npm run vocab:import:oxford -- "/path/The_Oxford_3000_by_CEFR_level.pdf" "/path/The_Oxford_5000_by_CEFR_level.pdf"
   ```

2. Check task counts without calling Gemini:

   ```bash
   npm run vocab:examples -- --dry-run
   ```

3. Generate a small review batch first:

   ```bash
   npm run vocab:examples -- --limit 20
   ```

4. Review `vocab_example_seed.js`, especially Chinese translations and words with multiple meanings.

5. Generate larger batches only after the sample quality looks right:

   ```bash
   npm run vocab:examples -- --limit 300
   ```

   The generator defaults to a short delay between Gemini requests. If the API returns `generate_content_free_tier_requests`, the API key's Google AI Studio project is still on the free tier; link billing / paid quota to that exact project before running large batches.

6. Optionally upload reviewed seed entries to shared Firestore cache:

   ```bash
   npm run vocab:examples -- --upload --limit 300
   ```

The generated app seed file is `vocab_example_seed.js`. It should contain only reviewed examples that are safe to ship. The private Oxford export stays under `private_exports/`, which is ignored by Git.
