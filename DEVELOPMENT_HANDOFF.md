# DOPE ENGLISH Development Handoff

Last updated: 20 August 2026

This is the operational handoff for moving development to another Mac or a new
Codex conversation. Read this file together with `AGENTS.md` and
`PROJECT_BRIEF.md` before changing the product.

## One-Minute Summary

- Product: DOPE ENGLISH, a native-first English learning app for Hong Kong
  students in a light Japanese stationery / sticker style.
- GitHub: `https://github.com/tuan0974316576-glitch/basic-grammar.git`
- Main native app: `flutter_app/` (Flutter for iOS and Android).
- Legacy/reference app: root HTML/JavaScript plus Capacitor. Keep it working;
  do not delete it until native parity is complete.
- Firebase project: `enguistics-grammar-game`. Never move real student data
  back to the Battleship Firebase project.
- Grammar content source of truth: `grammar_data.js`.
- Reviewed vocabulary master: Grammar Game files, especially
  `teacher_vocab_bank.js`, `teacher_vocab_manual_updates.json`, and
  `vocab_sense_bank.js`.
- Current native milestone: Grammar Lesson 01-13 plus Quiz 01 are playable.
- Current high-priority gaps: real grammar progress/XP persistence, native
  vocabulary SRS quiz loop and Firestore sync, achievements/streaks, then Scan.

## Read Order For A New Codex Task

1. `AGENTS.md`
2. `PROJECT_BRIEF.md`
3. `DEVELOPMENT_HANDOFF.md` (this file)
4. `VOCAB_REVIEW_HANDOFF.md` only when doing dictionary/content review
5. `EDGE_EXTRA_MOCK_VOCAB_GOAL.md` only when resuming that mock-paper audit

Before editing, always run:

```bash
git status --short
git log -1 --oneline
```

The worktree may contain another task's changes. Do not revert, overwrite, or
silently include unrelated files in a commit.

## New Mac Setup

### 1. Install the tools

Install these first:

- Git
- Flutter stable with Dart 3.3 or newer
- Xcode and Xcode Command Line Tools for iOS
- CocoaPods if Flutter asks for it
- Android Studio, Android SDK, and platform tools for Android
- Node.js 22 LTS (Firebase Functions declares Node 22)

Accept the Xcode licence and open Xcode once after installation.

### 2. Clone and install dependencies

```bash
git clone https://github.com/tuan0974316576-glitch/basic-grammar.git
cd basic-grammar
./scripts/bootstrap-new-mac.sh
```

The old Mac currently opens `/Users/macbook/Documents/Grammar Game`, which is a
symlink to an external SSD. The new Mac does not need the same path or symlink.
Run commands from the cloned repository root.

### 3. Firebase access

The app can use the already deployed backend after cloning because the public
Firebase client configuration is versioned. Deploying functions/rules or
reading protected teacher data requires the authorised Google account.

```bash
npm run firebase:reauth
```

This command uses `scripts/firebase-cli.js`, which handles the macOS CA issue
previously seen as `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` or Firebase attest login
failure. Do not copy temporary CA files from the old Mac.

Azure, Gemini, and other server keys belong in Firebase Secret Manager. Never
put them in Dart, JavaScript, a handoff file, a student-account file, or Git.
The new Mac normally does not need the raw keys to run the app.

### 4. Run iOS

```bash
cd flutter_app
flutter doctor -v
flutter devices
flutter run -d <IOS_DEVICE_ID>
```

If signing fails, open `flutter_app/ios/Runner.xcworkspace` in Xcode, select the
Runner target, choose Austin Sir's Apple developer team, and keep bundle ID
`com.enguistics.dopeEnglish`. Trust the developer certificate on the device if
iOS requests it.

### 5. Run Android

Enable Developer Options and USB debugging, connect the phone, then run:

```bash
adb devices
cd flutter_app
flutter run -d <ANDROID_DEVICE_ID>
```

Do not commit `android/local.properties`, build folders, signing files, or
device-specific Xcode user data.

## Repository Structure

| Path | Responsibility |
|---|---|
| `flutter_app/` | Native Flutter app and native tests |
| `flutter_app/lib/main.dart` | App shell, roadmap, tabs, routing |
| `flutter_app/lib/features/grammar/` | Native lesson controllers, models, repositories, screens |
| `flutter_app/lib/features/vocabulary/` | Native lookup, saved list, examples, suggestions, audio |
| `flutter_app/lib/features/auth/` | Student ID/PIN login and secure device session |
| `flutter_app/assets/data/` | Generated native grammar and vocab JSON; do not hand-edit |
| `grammar_data.js` | Canonical Grammar Lesson 01-13 and Quiz 01 content |
| `app.js`, `index.html`, `style.css` | Existing web/Capacitor implementation and behaviour reference |
| `teacher_vocab_bank.js` | Generated teacher-approved vocabulary bank |
| `teacher_vocab_manual_updates.json` | Reviewed/manual teacher corrections and additions |
| `vocab_sense_bank.js` | Reviewed curated multi-sense vocabulary and aliases |
| `vocab_example_seed.js` | Bundled reviewed/offline example-sentence seed |
| `functions/` | Firebase callable functions: login, audio, vocab cloud services |
| `scripts/` | Export, review, sync, build, and Firebase helper scripts |
| `tests/` | Legacy web, vocab-bank, pipeline, and Cloud Function tests |
| `private_exports/` | Ignored local review material; not available after a fresh clone |

## Source-Of-Truth And Generated Data

### Grammar

Edit `grammar_data.js`, then regenerate Flutter JSON:

```bash
npm run flutter:export-grammar
```

Generated files are `flutter_app/assets/data/lesson_01.json` through
`lesson_13.json` and `quiz_01.json`. Commit the source and generated JSON in the
same commit.

Current question-bank sizes:

| Content | Questions/rows |
|---|---:|
| Lesson 01 | 100 |
| Lesson 02 | 100 |
| Quiz 01 | 50 |
| Lesson 03 | 30 |
| Lesson 04 | 7 matching groups |
| Lesson 05 | 50 |
| Lesson 06 | 100 |
| Lesson 07 | 60 |
| Lesson 08 | 60 |
| Lesson 09 | 60 |
| Lesson 10 | 100 |
| Lesson 11 | 260 |
| Lesson 12 | 100 verb rows |
| Lesson 13 | 80 |

### Vocabulary

Grammar Game is the vocabulary master. After reviewed source changes, export
the sharded native lookup/examples:

```bash
npm run flutter:export-vocab
```

The generated shards under `flutter_app/assets/data/vocab/` keep startup and
lookup fast and offline. Do not edit a shard manually.

To update Battleship-1's copy after Grammar Game tests pass:

```bash
npm run vocab:sync-battleship
npm run vocab:sync-battleship -- --dry-run
```

That script currently expects a sibling checkout at
`/Users/macbook/battleship-1`. On another Mac, clone Battleship there or update
the sync script deliberately. Do not edit Battleship's original `VOCAB_DB`
lesson lists while syncing the shared dictionary.

The sync copies reviewed lookup data and audio manifests, but deliberately does
not copy `vocab_audio.js`. Grammar Game and Battleship have different native
audio bridges, so each app owns and tests its own playback runtime.

## Native Progress

### Complete and playable

- Student ID + PIN login through Firebase callable functions.
- Secure device-session restoration, so normal app updates do not require PIN
  entry again unless the user logs out or local secure storage is removed.
- Four-tab shell: Grammar, Vocabulary, Awards, Profile.
- Grammar roadmap and Lesson 01-13 plus Quiz 01.
- Native iOS/Android keyboard for all typed answers.
- Lesson-specific Traditional Chinese feedback, SFX, mistake handling, and
  celebrations.
- Lesson 12 illustrated Verb Table, responsive phone/tablet layout, bundled
  audio where available, and shared audio fallback.
- Native vocabulary lookup from offline shards, spelling suggestions,
  multi-meaning selection, one-row-per-word saved list, date grouping,
  expandable examples, and word/example pronunciation.
- Bundled audio first; missing audio uses Firebase Function + Azure generation,
  shared Firebase Storage, and local device cache.

### Partial or placeholder

- Native saved vocabulary currently uses `SharedPreferences`; full per-user
  Firestore vocab sync is not connected in Flutter yet.
- Native example lookup currently uses bundled example shards. Web has broader
  Firestore/Gemini fallback behaviour that still needs repository-level native
  migration.
- Awards tab is a placeholder.
- Profile shows the logged-in student and logout, but has no detailed stats.
- Roadmap top counters are visual sample values, not live XP/streak data.
- Lesson completion/First Try results are not yet persisted into the native
  player profile or Firestore.
- Vocabulary review/SRS session is not yet migrated as a complete native quiz.
- Scan dictionary/photo OCR is not yet merged into Flutter.
- Notifications, leagues, daily goals, streak freeze, teacher dashboard, and
  speaking assessment remain future work.

## Recommended Next Development Order

1. Add a tested native player/progress repository: local-first grammar attempts,
   lesson mastery, XP, streak, and queued Firestore sync.
2. Replace the roadmap's sample counters and lesson states with real progress.
3. Finish native vocabulary persistence per student and Firestore sync, keeping
   guest/student caches isolated.
4. Build the short mixed vocabulary SRS quiz loop: reading, spelling, listening,
   sentence ordering, and speaking prompts.
5. Connect Awards and streak celebration screens to real data.
6. Merge Scan/OCR behind a repository/plugin boundary.
7. Add local notifications and server-driven reminders only after streak data
   is reliable.

Do not start a second native architecture or rewrite the completed lessons.
Continue Flutter with repositories/controllers outside widgets. Preserve the
existing Firebase contracts and migrate web behaviour incrementally.

## Verification Before Every Push

From the repository root:

```bash
npm test
npm run check:js
npm run build:web
```

From `flutter_app/`:

```bash
flutter analyze
flutter test
```

When grammar or vocab source data changed, run the relevant export before
tests. When shared vocab changed, sync Battleship and check dry-run reports all
shared files unchanged.

For UI changes, also launch on at least one compact phone and one tablet. Check
that text does not overlap, screens do not require unintended page scrolling,
native keyboards do not cover the confirmation flow, audio plays, and the
Japanese stationery style remains consistent.

## Git Workflow Across Two Macs

At the start of a task:

```bash
git switch main
git pull --rebase origin main
git status --short
```

Use one branch per substantial task when both Macs may be active:

```bash
git switch -c codex/<short-task-name>
```

Do not edit the same generated bank on two Macs at once. Vocabulary seed and
bank files are large and produce painful conflicts. Finish, test, commit, and
push one vocabulary batch before starting another machine's batch.

After another Mac pushes to `main`, update with `git pull --rebase origin main`
before continuing. Never use `git reset --hard` to solve a dirty-worktree
problem; preserve or commit the active work first.

## Files That Must Stay Private Or Local

Never commit:

- `functions/students.json` or real student IDs/PIN source files
- Firebase service-account JSON/private keys
- Azure, Gemini, DeepSeek, Apple, or signing secrets
- `private_exports/` review documents and licensed Oxford checklist exports
- `.firebase/`, `node_modules/`, `www/`, Flutter/Android/iOS build output
- `android/local.properties`, signing keystores, Xcode `xcuserdata`

Public Firebase client configuration is not a server secret. Actual authority
comes from Firebase Auth, Security Rules, App Check when enabled, and server
secrets.

### Moving private material to the new Mac

Git is enough for normal Flutter, grammar, lookup, and backend code work. If the
new Mac will continue vocab-paper review or create student accounts, transfer
the required private files separately with an encrypted external drive, AirDrop,
or the tutoring centre's private cloud folder:

- `private_exports/` only when the unfinished review queue/history is needed
- original mock/PDF/Excel source files, keeping their folder structure
- `functions/students.json` only when seeding accounts, then remove extra copies

Do not send these through a public Git commit or paste real PINs into Codex.
Already deployed Firebase secrets stay in Firebase Secret Manager and do not
need to be copied. Xcode-managed signing can be restored by signing into the
same Apple developer account; private distribution certificates/keystores must
be transferred through their proper secure export process if automatic signing
cannot recreate them.

For a brand-new Codex conversation, the shortest safe instruction is:

> Read `AGENTS.md`, `PROJECT_BRIEF.md`, and `DEVELOPMENT_HANDOFF.md`, then check
> `git status` before continuing. Do not touch unrelated dirty files.

## Backend Deployment

Only deploy after tests pass and Firebase CLI is authenticated to
`enguistics-grammar-game`:

```bash
npm run firebase:deploy:functions
npm run firebase:deploy:firestore
```

Deploying code and pushing Git are separate actions. A Git push does not deploy
Cloud Functions, Firestore rules, Hosting, App Store builds, or Play Store
builds. Record backend deployments in the task summary so the next developer
knows what is live.

## Definition Of A Good Handoff

Before ending a substantial task, update this file if architecture, progress,
commands, or priorities changed. The final task note should state:

- commit hash and branch pushed
- tests run and results
- devices/simulators checked
- Firebase components deployed, if any
- remaining local-only files or known failures
- exact next recommended step
