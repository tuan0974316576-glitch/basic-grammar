# A1 BUDDY Project Handover / Architecture Summary

Last audited: 10 September 2026 (Asia/Hong_Kong)

## Read This First

This is the short operational handover for the next Codex conversation. Read
these files in order before editing:

1. `AGENTS.md`
2. `PROJECT_HANDOVER.md` (this file)
3. `PROJECT_BRIEF.md`
4. `DEVELOPMENT_HANDOFF.md` for detailed history and old release notes
5. `/Users/macbook/Documents/ChatGPT/ECON/AGENTS.md` before changing ECON
   question content or Aristo Mock-paper presentation

The active product is **A1 BUDDY**, and its native app lives in
`flutter_app/`. Do not continue development in the old standalone ECON app.

### Critical working-tree warning

- Repository: `/Users/macbook/Documents/ChatGPT/Dope English`
- Branch: `main`
- Remote: `https://github.com/tuan0974316576-glitch/basic-grammar.git`
- Audited HEAD: `c2ffb3feaf91df6af6d5a701e4654e647c88d205`
- The working tree is intentionally very dirty: at audit time it had 76
  modified tracked files and about 1,604 untracked files.
- Most of the A1 BUDDY ECON migration is **not in HEAD**. The current working
  tree, not the last commit, contains the latest product.
- Never run `git reset --hard`, `git checkout -- .`, or mass-clean untracked
  files. Do not overwrite changes from another conversation. Inspect the exact
  files you need and work with the current state.

## Product In One Minute

A1 BUDDY is a native Flutter learning app for Hong Kong students. It combines
English and Economics in one app, one login, and one Firebase project.

Production opens the last-used subject directly. There is no main-menu page.
A half-visible subject control on the upper-left opens a picker:

- English icon: `assets/branding/united-kingdom.png`
- Economics icon: `assets/branding/dollar.png`
- Popup labels: `ENGLISH` and `ECONOMICS`
- Preference key: `a1-buddy-last-subject-v1`
- When English is opened without an explicit tab, Vocabulary (index 1) is the
  current default; tests that need Grammar must pass `initialEnglishTab: 0`.

Bottom navigation:

| Subject | Tabs |
| --- | --- |
| English | `文法` / `詞彙` / `研修` |
| Economics | `學習` / `逐課操` / `逐份操` / `排名` |

The visual language is light Japanese stationery: white paper, dark brown-grey
type, dashed rounded frames, raised shadows, yellow tags, compact mobile-first
geometry, and subject-specific accents.

## Runtime Architecture

```text
main.dart
  -> launch logo + StudentAuthController
  -> AppShell
       -> restore last subject
       -> upper-left SubjectSwitcher
       -> English tabs
       |    -> OriginalGrammarHome
       |    -> VocabularyScreen
       |    -> GrammarWorkshopScreen
       -> ECON tabs
            -> EconLearningMenuScreen -> EconConceptReviewScreen
            -> EconQuestionPickerScreen(topics) -> EconPracticeScreen
            -> EconQuestionPickerScreen(year)   -> EconPracticeScreen
            -> EconLeaderboardScreen

Flutter repositories
  -> local bundled JSON/assets
  -> Firebase Auth / Firestore / callable Functions
  -> Azure TTS through callable Functions and Firebase Storage
```

Primary routing and ownership are in `flutter_app/lib/main.dart`.

## Native App Identity

- Display name: `A1 BUDDY`
- Dart package: `dope_english`
- Current pubspec version: `0.1.1+6`
- Android package: `com.enguistics.dope_english`
- iOS bundle ID: `com.enguistics.dopeEnglish`
- Firebase project: `enguistics-grammar-game`
- Functions region: `asia-east2`

Do not change package IDs, bundle ID, Firebase project, signing identity, or
legacy `dope_*` storage keys. They preserve store update eligibility and
existing student data.

The old standalone ECON Android package is
`com.enguistics.econhkdse`. It can coexist on ASUS, but it is not A1 BUDDY.
When launching after installation, explicitly launch
`com.enguistics.dope_english`.

## Code Map

| Path | Responsibility |
| --- | --- |
| `flutter_app/lib/main.dart` | App startup, auth gate, subject/tab state, navigation |
| `flutter_app/lib/core/app_brand.dart` | Public brand strings |
| `flutter_app/lib/core/app_palette.dart` | English/global stationery palette |
| `flutter_app/lib/core/widgets/stationery_frame.dart` | Dashed paper surfaces, shared yellow tag |
| `flutter_app/lib/core/widgets/original_section_frame.dart` | Subject-accent-aware section shell |
| `flutter_app/lib/features/grammar/shared/lesson_ui.dart` | Shared lesson, answer, progress and result UI |
| `flutter_app/lib/features/game/game_hub_screen.dart` | Subject switcher and English/ECON bottom bars |
| `flutter_app/lib/features/grammar/` | English lessons, controllers and repositories |
| `flutter_app/lib/features/vocabulary/` | Lookup, saved words, review, cloud sync, import and audio |
| `flutter_app/lib/features/workshop/` | Published Battleship grammar-topic practice |
| `flutter_app/lib/features/econ/` | ECON learning, practice, diagrams, progress and leaderboard |
| `functions/index.js` | Auth, vocab/audio, ECON aggregation and leaderboard functions |
| `functions/econ-grading.js` | ECON P2 marker logic |
| `functions/p2-grading-data.json` | Reviewed P2 marking data used by Functions |
| `firestore.rules` / `storage.rules` | Production data access contracts |

## Shared UI Contract

English and ECON must feel like one game. Reuse the same geometry and shared
widgets; only the accent palette and subject content should change.

- English accent comes from `AppPalette` (mint/teal).
- ECON accent comes from `EconPalette`.
- ECON primary is `#FFC067`; dark/soft/border companions are in
  `flutter_app/lib/features/econ/econ_palette.dart`.
- Selected English bottom tabs use yellow; selected ECON tabs use light khaki.
- Both bottom bars use a coloured 28x28 glyph block on the left and a text
  label on the right.
- ECON section and lesson frames pass accent values into shared widgets. Do
  not hard-code `AppPalette.primary` in a new ECON screen.
- Lesson/paper cards should match English card metrics: frame padding
  `18,23,16,18`, radius 18, ring width 4, shadow depth 5, yellow tag at top.

Current UI unification work in the working tree:

- ECON learning has an English-style Coach panel and practice-count slider.
- The ECON practice count is held by `AppShell` and reused by concept, topic,
  and paper routes.
- ECON topic/paper cards show `啱 x · 錯 y` from `questionStats`; they do not
  show total bank size, key-point descriptions, or verbose subtitles.
- List top padding protects the first yellow tag from being clipped.

Known consistency gap: English Grammar's practice-count slider is currently
visual state inside `OriginalGrammarHome`; it is not yet passed into every
English lesson controller. ECON's count is functional. A future cleanup should
extract one shared Coach/count widget and one shared round-size contract.

## English Feature State

- Grammar Lesson 01-13 and Quiz 01 are native and playable.
- Controllers/repositories own lesson rules; screens should not duplicate
  grading logic.
- Grammar progress is currently local through
  `GrammarProgressController`; full cloud XP/streak/mastery is not complete.
- Vocabulary supports reviewed lookup, multi-sense selection, saved lists,
  local-first Firestore sync, reading/listening/spelling review, photo/file
  import, synonym suggestions, and cached/generative audio.
- The English subject defaults to Vocabulary when opened or switched to from
  ECON. Vocabulary display labels strip accidental trailing POS text such as
  `rather (adv)` from the English headword; POS remains on the meaning line.
- Searching an exact saved word centres its row with a smooth scroll and
  brief teal raised-surface focus. The local vocabulary snapshot is
  rendered before Firebase/Auth startup completes; cloud restore merges in the
  background.
- The search focus is intentionally A1 BUDDY stationery rather than
  Battleship's sci-fi look: `搵到喇！` paper sticker, pastel star/heart/sparkle
  accents, soft tilt/scale entrance and yellow crayon underline.
- Synonym candidates from the published Grammar platform resolve POS and
  meanings against the reviewed bundled vocabulary bank before inference.
  Lookup/save/restore merge repeated or overlapping glosses for the same word,
  POS, and type. Vocabulary MC choices reject repeated or overlapping Chinese
  meanings and fall back to Spelling when three fair same-POS distractors are
  unavailable.
- Grammar Workshop uses the published Battleship `grammarBank/public` release,
  caches the last valid release, and uses a bundled fallback.
- Scan Dictionary remains a future merge; it is not a bottom tab today.

English content source rules:

- Grammar source: root `grammar_data.js` and related canonical JS banks.
- After grammar data changes, run `npm run flutter:export-grammar`.
- Battleship Workshop export: `npm run flutter:export-battleship-grammar`.
- Synonym export: `npm run flutter:export-synonyms`.
- Reviewed vocabulary authority: `teacher_vocab_bank.js`,
  `teacher_vocab_manual_updates.json`, and `vocab_sense_bank.js`.
- ECDICT, CC-CEDICT reverse data, PDFs, and generated meanings are review
  material only. Never publish them directly to students.

## ECON Feature State

Current A1 BUDDY ECON files are under
`flutter_app/lib/features/econ/`.

- `學習`: chapter list exists; Chapter 1 opens Concept Review. Later chapters
  are listed and locked as `即將推出`.
- Concept Review includes reorder, symbol, tick/cross, and typed-answer modes
  in Chinese and English.
- `逐課操`: filters the reviewed bank by language, P1/P2, and chapter.
- `逐份操`: filters by language, P1/P2, past/mock, and set/year.
- `排名`: loads P1/P2 leaderboard data from the A1 Firebase project.
- P1 is marked locally using the reviewed `correctChoice`.
- P2 calls `gradeP2Answer` and can send a diagram payload.
- Attempts are written to `users/{uid}/attempts`; server aggregation derives
  `questionStats`, `topicStats`, user totals, and leaderboard fields.

Bundled ECON data:

- `flutter_app/assets/data/question-bank.json` (about 11 MB)
- `flutter_app/assets/data/concept-review.json`
- `flutter_app/assets/econ-question-visuals/` (about 73 MB)
- The A1 question-bank checksum matched the standalone ECON source at audit:
  `c4b7306cb2f670fa75a68d9f4c28f1262b0304b66e1be43c6efaa438c19a55b7`.

The canonical standalone ECON source/reference is:

- `/Users/macbook/Documents/ChatGPT/ECON/mobile/App.tsx`
- `/Users/macbook/Documents/ChatGPT/ECON/mobile/src/econ-diagram-builder.tsx`
- `/Users/macbook/Documents/ChatGPT/ECON/mobile/src/econ-diagram.ts`
- `/Users/macbook/Documents/ChatGPT/ECON/mobile/assets/data/question-bank.json`

### ECON diagram editor warning

The Flutter editor is not yet full legacy parity. The A1 editor is
`flutter_app/lib/features/econ/econ_diagram_editor.dart`; the legacy React
Native builder and domain engine are much larger and support more behaviour.
Do not redesign from memory. Compare feature-by-feature against the two legacy
files above and preserve the grading payload contract.

Parity work should cover at least curves, curve types/shapes, points, labels,
axes, drag/edit, areas/shading, market gaps, guide lines/prices, policy labels,
source seeds/continuations, delete/clear, undo/redo, responsive canvas, state
serialization, and `gradeP2Answer` payload compatibility. Add focused Flutter
tests for each restored behaviour and verify on a real device.

Other ECON gaps:

- Topic/paper practice currently takes the first N questions; it does not yet
  reproduce legacy wrong-first/unseen-first prioritization or topic expansion.
- Picker progress is loaded on screen initialization; refresh after returning
  from a completed practice round should be reviewed.
- The practice-count setting is in memory only and resets to 10 after restart.
- Concept Review Chapter 1 currently has seven exercises, so a setting above
  seven simply uses the full available lesson.

### ECON publication gate

Question wording and visuals have stricter rules in
`/Users/macbook/Documents/ChatGPT/ECON/AGENTS.md`. In particular, do not run a
generic DOCX rebuild over P1 and do not publish OCR wording. For any Aristo Mock
update, run all four gates in the ECON repo:

```sh
/Users/macbook/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/validate_questions.py
/Users/macbook/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/check_aristo_mock_rendering.py
/Users/macbook/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/audit_aristo_mock_presentation.py
/Users/macbook/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/audit_aristo_mock_fidelity.py
```

Then visually inspect the reported regression question in the running app and
add a focused assertion for every newly reported defect.

## Firebase Contracts

Firebase project: `enguistics-grammar-game`; do not move real student data to
the old Battleship project.

Important deployed/defined Functions:

- `studentLogin`, `studentDeviceLogin`
- `processVocabImport`
- `lookupVocabMeaning`, `lookupVocabExamples`
- `ensureVocabAudio`, `warmTeacherVocabAssets`
- `prepareTeacherVocabExamples`
- `createBattleshipVocabAuthToken`, `deleteBattleshipSharedVocabAccount`
- `gradeP2Answer`
- `aggregateEconPracticeAttempt`
- `getLeaderboard`

Core Firestore paths:

- `studentAccounts/{studentId}`: protected account records
- `users/{uid}`: profile and aggregate totals
- `users/{uid}/grammarProgress/{lessonId}`
- `users/{uid}/vocabItems/{wordId}`
- `users/{uid}/attempts/{attemptId}`
- `users/{uid}/questionStats/{questionId}` (server-derived, client read-only)
- `users/{uid}/topicStats/{topicId}` (server-derived, client read-only)
- `users/{uid}/achievements/{achievementId}`
- `teacherVocabLive`

Authentication uses Student ID + PIN through `studentLogin`, then Firebase Auth.
Long-lived device restoration uses secure-storage keys
`dope_student_device_session_v1` and `dope_student_profile_v1` with
`studentDeviceLogin`. Never put PINs, service accounts, upload passwords, Azure
keys, or Gemini keys in source or handover documents.

## Local Development And Verification

```sh
cd "/Users/macbook/Documents/ChatGPT/Dope English/flutter_app"
flutter pub get
flutter analyze
flutter test
```

Root web/data/backend checks:

```sh
cd "/Users/macbook/Documents/ChatGPT/Dope English"
npm test
npm run check:js
```

Functions-only validation:

```sh
npm --prefix functions run lint
```

The 10 September 2026 audit found and corrected two stale test harness
assumptions: the grammar-progress widget test now explicitly opens Grammar,
and the Functions mock now supplies `onDocumentCreated`.

Final audit result:

- `flutter analyze`: clean
- `flutter test`: all 173 tests passed
- `npm test`: passed
- `npm run check:js`: passed
- `npm --prefix functions run lint`: passed
- ECON grading validation: 3,803 questions passed

## Android / ASUS

Connected ASUS test device ID: `S2AIOC447307NGJ` (`ASUS_AI2401_H`).

Build and install a local debug APK:

```sh
cd "/Users/macbook/Documents/ChatGPT/Dope English/flutter_app"
DOPE_ALLOW_DEBUG_SIGNING=true flutter build apk --debug
adb -s S2AIOC447307NGJ install -r build/app/outputs/flutter-apk/app-debug.apk
adb -s S2AIOC447307NGJ shell am force-stop com.enguistics.dope_english
adb -s S2AIOC447307NGJ shell monkey -p com.enguistics.dope_english 1
```

Current device caveat: ASUS has A1 BUDDY `0.1.1 (6)`, last updated on device at
2026-09-07 16:35. The latest source includes later ECON Coach/card/count changes,
so the installed app should be treated as stale until rebuilt and reinstalled.

The generated `app-debug.apk` can also be stale. Compare its timestamp with the
source before installing; rebuild rather than trusting an existing artifact.

## Store Builds And Signing

Last recorded store build is `0.1.1 (11)`. Local working-tree changes were made
after that upload. Before the next TestFlight or Google Play upload, bump
`flutter_app/pubspec.yaml` to at least build number 7. Stores will reject another
build 6.

Android Play identity:

- Keystore: `/Users/macbook/.config/enguistics/dope-english-upload.keystore`
- Alias: `dope-english-upload`
- Password: macOS Keychain service `dope-english-play-upload`
- Accepted SHA-1:
  `F1:01:21:7C:6C:41:41:F4:31:F1:BF:B4:DD:0A:00:8D:94:23:41:2E`
- Accepted SHA-256:
  `35:05:42:82:BF:0B:AE:CB:D4:1B:D1:63:A4:D3:DA:76:E6:84:EF:DD:BE:60:8C:5F:16:30:5B:DD:FC:8B:27:CE`

Release Gradle requires `DOPE_KEYSTORE_FILE`, `DOPE_KEY_ALIAS`,
`DOPE_STORE_PASSWORD`, and `DOPE_KEY_PASSWORD`. It intentionally fails closed
if they are missing. `DOPE_ALLOW_DEBUG_SIGNING=true` is only for local builds;
never upload a debug-signed AAB.

iOS already contains camera, photo-library and location purpose strings plus
`ITSAppUsesNonExemptEncryption=false` in `ios/Runner/Info.plist`.

Last recorded store state (verified 18 September 2026):

- TestFlight `0.1.1 (11)` was uploaded successfully on 18 September 2026 via
  App Store Connect API key. Apple accepted the upload and reports it as
  `PROCESSING`; delivery UUID is `a334a4a1-dc13-430e-97f3-163d417904b2`.
- Google Play Closed Testing Alpha build `11` was uploaded successfully with
  the Grammar Game service account JSON at
  `/Users/macbook/Downloads/enguistics-grammar-game-ca6a58648b45.json`.
  Package `com.enguistics.dope_english` now has version code `11` on track
  `alpha` with release status `completed`. The resumable upload used 4 MiB
  chunks and the signed AAB was built from `flutter_app/pubspec.yaml` version
  `0.1.1+11`. The older `english-conqueror-play-upload` account is for the
  legacy app and must not be used for A1 BUDDY uploads.
- Store listing may still show the historic `DOPE ENGLISH` name even though
  installed builds display `A1 BUDDY`.

## Study Streak, Freeze, And Notifications (2026-09-18)

- A shared study-streak system now covers Grammar, Vocabulary Training,
  Grammar Workshop, ECON concept review, and ECON topic/paper practice. A
  completed round submits one idempotent learning activity; Hong Kong dates
  and streak changes are calculated server-side by `recordLearningActivity`.
- Streak state stores current/best days, recent active dates, total active
  days, up to two Streak Freezes, and recent freeze-used dates. One Freeze is
  earned on active day 3 and every seventh active day thereafter. Missed days
  consume available Freezes before a streak breaks.
- The app shell shows a tappable fire/day badge. Its panel shows the current
  month, active/frozen days, best streak, total active days, and Freeze count.
  Completing a new day plays the recoloured `streak-extend.json`; milestone
  days add confetti and protected gaps overlay `streak-freeze.json`.
- On compact phones the badge is a small circular fire with the day number as
  a lower-right chip, reserved inside the shared section header so it does not
  overlap the title or the Vocabulary Training dumbbell.
- The supplied fire Lottie was recoloured to the existing A1 BUDDY orange-red
  and warm-yellow flame palette. Both supplied animations are vector-only and
  bundled under `flutter_app/assets/lottie/`.
- Settings now offers an explicit daily-reminder switch. The app only requests
  notification permission after the student enables it. FCM tokens are bound
  to the current authenticated student through callable functions and are not
  client-readable in Firestore.
- `sendStudyReminders` runs every 30 minutes but sends only at 18:30 HKT for an
  unfinished daily reminder and 20:30 HKT when an existing streak is at risk.
  It skips students who completed that date, sends no student score/name on
  the lock screen, disables invalid tokens, and opens Vocabulary when tapped.
- Live deployment in Firebase project `enguistics-grammar-game` succeeded for
  `recordLearningActivity`, `registerNotificationToken`,
  `unregisterNotificationToken`, `sendStudyReminders`, and Firestore rules.
  An unauthenticated smoke request is rejected as intended.
- Flutter Messaging is deliberately pinned at `16.5.0` with Firebase Core
  `4.13.0`; Messaging 16.7.0 requests Firebase iOS SDK 12.19 while the current
  Storage plugin uses 12.17 and cannot resolve in the same iOS build.
- Verification: `flutter analyze` passes; streak, Lottie, settings, and main
  shell focused tests pass; Functions lint and pure streak-engine tests pass;
  Android debug APK and unsigned iOS device builds succeed. The full Flutter
  run passed 246/247 tests; the pre-existing ECON diagram-editor curve-drag
  test currently expects one commit but receives zero and also fails alone,
  with no streak/notification files in its path.
- Device caveat: the rebuilt APK is ready at
  `flutter_app/build/app/outputs/flutter-apk/app-debug.apk`, but ASUS Wi-Fi ADB
  currently reports `unauthorized`. Accept the debugging prompt before install.
- iOS caveat: Push Notifications capability and environment-specific APNs
  entitlements are present and the iOS build succeeds. Before live iOS push
  testing, verify that an APNs authentication key is uploaded under Firebase
  Cloud Messaging; the browser's current Google account cannot view this
  project even though Firebase CLI account `austinau99@gmail.com` can deploy.

## Teacher Live Vocabulary Lookup Cache (2026-09-19)

- Teacher Vocab Console writes are healthy. A live Firestore check confirmed
  `bald-adjective-3cd320544d` in `teacherVocabLive` with `bald`, adjective,
  `禿頭`, A2, and `disabled=false`.
- The native lookup bug was an unbounded in-memory Future cache in
  `CloudVocabLookupRepository`: the first empty result or timeout for a word
  stayed cached for the rest of the app session, so a later same-day teacher
  entry remained invisible until restart.
- Meaning lookup now coalesces only requests that are still in flight. A
  successful live result is cached for one minute, a confirmed empty result
  for three seconds, and a timeout/offline failure is not cached at all. This
  keeps typing reads controlled while allowing newly added words to appear on
  the next search without restarting the app.
- Focused tests cover empty-result expiry with the real `bald / 禿頭` shape,
  immediate retry after failure, teacher precedence, POS display cleanup, and
  the complete Vocabulary screen suite. `flutter analyze` is clean.
- Slow meaning lookups now show a fixed-height `激情搜尋中...` status beneath
  the English input. Its three dots animate in sequence while
  `VocabController.isLookingUp` is true, then the row smoothly collapses when
  meanings, suggestions, or the not-found state arrive. A delayed-lookup
  widget regression verifies that the status remains visible until completion
  and is replaced by `adj. 禿頭`.

## Notification Preferences And Delivery V2 (2026-09-19)

- Settings now has four independent notification categories with the requested
  colours: daily reminder in English green, streak risk in orange, class/friend
  task in pink, and achievements/weekly summary in gold. Each category has its
  own switch. Students can choose a weekday reminder time; the default is
  18:30 HKT.
- Device-scoped Firestore token records now store `categories`,
  `reminderMinutes`, `timeZone`, platform, and enabled state under
  `users/{uid}/notificationTokens/{tokenHash}`. Legacy single-switch users are
  migrated conservatively to daily + streak-risk enabled; social and
  achievements remain off.
- `sendStudyReminders` runs every 15 minutes in `Asia/Hong_Kong`. From the
  chosen start time it sends at most three ordinary reminders at 90-minute
  intervals. A streak-risk reminder is separately capped at one per day and
  scheduled no earlier than 20:30 and no later than 22:30. Completed days are
  skipped.
- Notification copy uses fixed safe Cantonese-friendly templates. There are 24
  daily templates plus separate 8-template pools for streak risk, achievements,
  weekly summaries, and social tasks. Per-token history prevents the same
  template ID from repeating within seven days. Lock-screen copy never contains
  scores, mistakes, or another student's name.
- `recordLearningActivity` sends opted-in milestone notifications after the
  streak transaction without allowing an FCM failure to fail the learning
  result. Weekly summaries are delivered Sunday afternoon. A server-only
  `notificationOutbox` trigger accepts only `classGoal`, `friendQuest`, or
  `friendStreak` event types and supplies safe social copy; students cannot read
  or write the outbox.
- The first OS notification prompt is delayed until a signed-in student has
  completed at least three learning rounds and has a two-day streak. A
  stationery soft prompt appears once first; only tapping `開啟提醒` invokes the
  iOS/Android permission dialog. Manual Settings switches still count as an
  explicit user request.
- Token refresh disables the previous token before registering the new one.
  Logout unregisters the current token before Firebase sign-out. Notification
  taps open Vocabulary when due words exist, otherwise Grammar.
- Live verification: all five notification/streak functions are deployed in
  `asia-east2`; Scheduler is enabled every 15 minutes in Hong Kong time; the
  required `notificationTokens.enabled` collection-group index is `READY`; and
  the live query returns the ASUS token with the expected four-category schema.
  Android 13+ `POST_NOTIFICATIONS` is granted on ASUS. A direct FCM v1 smoke
  message was accepted, appeared in the ASUS notification shade with safe copy,
  and opened the Vocabulary page when tapped.
- Firebase Console confirms that the iOS app currently has no development or
  production APNs authentication key/certificate. Android delivery is live;
  iOS delivery still requires an Apple Push Notifications key from the Apple
  Developer account and upload to Firebase. No existing `.p8` APNs key is on
  this Mac, and Apple Developer requires a fresh sign-in before a key can be
  inspected or created.
- Verification: `flutter analyze` passes; the complete Flutter suite passes all
  260 tests; Functions lint and notification/streak engine tests pass; Android
  split APK and unsigned iOS device builds succeed. The arm64 APK is installed
  on ASUS without clearing data, and the four-colour Settings panel was visually
  checked on the physical device.

## Full-Screen Streak Celebration And Milestone Monsters (2026-09-21)

- Streak celebration now inserts a root `OverlayEntry`, so it covers the
  active practice/result route instead of sitting behind a pushed Navigator
  page. Completing a round now shows a full-screen fire animation and the
  updated day count; Freeze runs layer its ice animation on top.
- Duolingo's official milestone design uses a full-screen character/power-up
  transformation rather than only changing the small streak number. A1 BUDDY
  follows that hierarchy with its own stationery fire assets and adds a happy
  monster plus confetti only at milestone days `3/7/14/30/50/100`.
- Milestone monster order is deterministic: `cute-monster`, `monster-blue`,
  `monster-3`, `monster-5`, `monster-6`, and `one-eye-monster-2`. The assets
  live under `flutter_app/assets/lottie/monsters/`; they are 512px vector-only
  Lottie files with no image assets or expressions. `cute-monster` is used for
  the first 3-day celebration because its happy jump is the clearest success
  signal.
- The full-screen celebration includes `3 日連續學習！` and a short success
  line, blocks accidental taps during the 2.4 second animation, and removes
  itself safely when the shell is disposed.
- Restored the Vocabulary custom keyboard to conditional insertion while it is
  open. A previous always-mounted hidden keyboard could lay itself outside a
  compact test viewport; the isolated and complete Vocabulary tests now pass.
- Verification: `flutter analyze` is clean and the complete Flutter suite now
  passes all 283 tests. Focused Lottie/streak tests validate milestone monster
  presence and vector asset integrity. Rebuild the arm64 APK before the next
  store upload; the current ASUS install predates this final monster overlay.
- Streak calendar panel polish: the always-visible Freeze inventory capsule
  was removed. The panel stays focused on active/frozen calendar dates; only
  an actual Freeze recovery celebration says `火焰已凍結，連續學習繼續保持`.
  The close control is a red circular sticker with a white X attached to the
  dashed frame corner, and the Chinese title/subtitle are centered separately
  from the flame icon.

## Recommended Next Work

1. Finish full ECON diagram-editor parity against the standalone app and its
   grading/state contracts.
2. Extract the duplicated English/ECON Coach panel, card geometry, and practice
   count into shared subject-aware widgets.
3. Wire the English practice-count slider into English lesson controllers;
   persist the shared count if product wants it retained across launches.
4. Restore legacy ECON wrong-first/unseen-first practice selection and refresh
   picker progress immediately after a round.
5. Add remaining ECON learning content after Chapter 1 without bypassing the
   ECON source/publication rules.
6. Rebuild/install on ASUS and visually inspect English + ECON at compact phone
   size before preparing build 7.
7. Only then run release verification and prepare TestFlight/Closed Testing.

## Prompt For The Next Conversation

Use this as the opening instruction when continuing work:

> Continue A1 BUDDY from `/Users/macbook/Documents/ChatGPT/Dope English`.
> Read `AGENTS.md`, `PROJECT_HANDOVER.md`, `PROJECT_BRIEF.md`, and
> `DEVELOPMENT_HANDOFF.md` before editing. The working tree contains the latest
> uncommitted ECON migration, so do not reset, checkout, clean, or overwrite
> unrelated changes. Inspect current files first, keep English and ECON on the
> same shared stationery UI geometry, preserve each subject palette, run
> `flutter analyze` and the relevant/full tests, and verify user-facing changes
> on the ASUS device when requested.
