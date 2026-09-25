# A1 BUDDY Development Handoff

Last updated: 25 September 2026

## Remembered Student Login And Vocabulary SRS (2026-09-25)

- Successful student login now stores the last student ID and PIN in
  `flutter_secure_storage`. Logout clears only the Firebase/device session and
  cached profile, so the next login screen restores both fields and the student
  can tap `登入` without typing them again. Login still succeeds if the secure
  storage provider is temporarily unavailable.
- Vocabulary progress now carries `totalIncorrect`, `streakCorrect`,
  `mastery`, `lastSeenAt`, `nextDueAt`, `halfLifeDays`, and `lastRecallProb` in
  local JSON and the Firestore `progress` payload. Review answers update these
  fields through `vocab_scheduler.dart`, and both the `待溫習` badge and review
  question selection use the scheduler's due state.
- The scheduler now follows the published Duolingo HLR shape more closely:
  recall is `2 ^ (-elapsedDays / halfLifeDays)`, and the half-life is estimated
  from a bias plus answer-history features. The prediction is bounded between
  15 minutes and nine months, with a local starter-weight fallback until A1
  BUDDY has enough of its own answer history to train weights.
- Correct answers schedule the next review at the point where predicted recall
  reaches `0.6`, rather than applying one fixed multiplier to every word. Wrong
  answers return after `0.04` day so the existing mistake-revision loop can
  still bring them back quickly. This mirrors the public research method while
  keeping the app's student-friendly retry behaviour.
- Legacy records that were marked mastered before timing fields existed remain
  outside the due queue until a new answer gives them a real schedule. New and
  reviewed records use `nextDueAt` plus the recall threshold normally.
- Focused scheduler/login tests and the complete Flutter suite pass. The arm64
  debug APK is
  `flutter_app/build/app/outputs/flutter-apk/app-arm64-v8a-debug.apk` with
  SHA-256 `520307c056b34e02a77d670482cc3316ce50f62b5c73f9093986f6aa59525f87`;
  it was installed with `adb install -r -d` on ASUS `S2AIOC447307NGJ` and the
  Flutter activity was launched successfully on 2026-09-25.

## Vocabulary Auto-Read Mode (2026-09-25)

- Vocabulary toolbar now has a cute play button immediately to the right of
  `Chi`. It starts from the highest currently visible row, reads words in
  displayed order with a 1-second pause between words, auto-scrolls later rows
  into view, and changes to a stop button while active.
- The currently spoken row uses A1 BUDDY pastel highlight plus a small
  `AnimatedScale` enlargement. Sorting, English/Chinese study-mode changes,
  manual row taps, and leaving the page stop the auto-read queue.
- The feature reuses the existing `VocabAudioRepository`, so local/bundled or
  reviewed cloud audio behavior remains unchanged. Focused Vocabulary tests
  cover start order, highlight scale, and sequential advance.

## Auth Startup Vocabulary Restore (2026-09-25)

- AppShell now uses different keys for auth-restoring and authenticated
  states. When Firebase/Auth restoration finishes, Flutter creates a fresh
  authenticated shell and `CloudSyncedVocabStore` instead of reusing the
  guest SharedPreferences controller from the first frame.
- While Auth is still restoring, the app now shows a stable
  `auth-startup-screen` instead of building the guest shell. This prevents an
  empty Vocabulary bank flashing briefly before the authenticated shell loads.
  Existing local/cloud vocab data is preserved, and a widget regression test
  ensures the guest empty bank cannot return during Auth startup.

## Profile Name Welcome Monster (2026-09-24)

- The first step of student onboarding, where the student enters their display
  name, now uses `yellow-monster-saying-hi.json` from Downloads instead of
  `monster-blue.json`. The existing layout and looping behavior are unchanged;
  the Critter-avatar editor and other monster scenes are unaffected.
- The new 480x480, 90-frame Lottie is bundled under
  `flutter_app/assets/lottie/monsters/` and covered by the asset validity test.

## Variable Vocabulary Session Size (2026-09-24)

- Vocabulary Training no longer hard-caps every round at ten. It selects only
  unseen or not-yet-mastered words, and the round contains the pool size up to
  20 questions. When more than 20 words are due, the current ordering brings
  unseen / weaker items forward and leaves the rest due for the next round.
- This follows Battleship's existing 20-question My Vocab Challenge session
  as a practical upper bound, while making short rounds naturally shorter.
  Duolingo publicly describes personalized practice/review, but does not
  publish a universal fixed exercise-count rule across all lesson types.
- Important distinction: A1 BUDDY `reviewMastered` is still a binary
  first-pass mastery flag. It is not the Battleship spaced-repetition model;
  `nextDueAt`, recall probability, half-life, and per-mode progress still need
  a separate SRS implementation before `待溫習` can mean scheduled due today.
- Regression tests cover 15 due words producing 15 questions and 25 due words
  producing a 20-question round that excludes already-mastered words.
- The complete Flutter suite passes 294 tests and the arm64 debug APK builds
  at `flutter_app/build/app/outputs/flutter-apk/app-arm64-v8a-debug.apk` with
  SHA-256 `f04d0e4700b1fa2e23ed650602854ab0bf15dabbe7fdd21797b308c65b7c60b1`.

## Talking Monster Retry Screen (2026-09-24)

- The Vocabulary mistake transition now follows the approved talking-character
  layout: a pastel dashed speech bubble with a pointed tail, a large
  bottom-aligned `three-eye-monster-6`, and the yellow `繼續溫習` action below.
- Retry copy rotates through seven Cantonese encouragement messages using the
  Hong Kong weekday and includes the actual number of wrong questions. It is
  deterministic for the day, so it does not change while the student is on
  the page.
- Seven pre-coloured `three-eye-monster-6` Lottie variants provide red,
  orange, yellow, green, cyan, blue, and purple weekday colours while
  preserving the original motion.
- Focused Lottie/retry tests and the complete 292-test Flutter suite pass; the
  arm64 debug APK builds successfully.

## Calendar Close Sound And Duplicate Save Guard (2026-09-23)

- The Streak calendar close sticker now plays the shared `close.mp3` cue
  before dismissing the panel.
- Vocabulary save now distinguishes an already saved word/sense from a new
  sense. Re-saving the same sense is a no-op with a clear `已經喺生字簿` message;
  a new POS or meaning for the same English word is still merged as a new
  sense.
- The current A1 BUDDY `待溫習` counter is not yet a Duolingo-style memory
  curve. It currently means unseen or not mastered in the current review
  state. A future SRS pass should add `nextDueAt`, recall probability,
  half-life, and correct-streak fields, following the existing Battleship
  scheduler direction.

## Close Sound And Delete Icon Alignment (2026-09-23)

- The Vocabulary delete button no longer uses a text `×` glyph whose font
  baseline made the white mark look low. It now uses a fixed-size centred
  `Icons.close_rounded` icon.
- Added the shared `SfxCue.close` backed by `assets/audio/sfx/close.mp3`.
  Vocabulary delete, Settings modal close, note-import close, and synonym
  dialog close now use this cue.
- Focused SFX, modal, and Vocabulary tests pass; the new arm64 debug APK was
  built at `flutter_app/build/app/outputs/flutter-apk/app-arm64-v8a-debug.apk`.

## Vocabulary Due-State Fix (2026-09-23)

- Vocabulary Training now stores an explicit `reviewMastered` state per saved
  word. A wrong first attempt followed by a correct retry keeps the historical
  `totalSeen` / `totalCorrect` counts but clears the word from `待溫習`.
- Old local and Firestore records derive the new flag from their existing
  counters when the field is absent, so upgrading does not require clearing
  student data. Cloud sync payloads now carry the flag in `progress`.
- Regression coverage verifies `dueCount` changes from 1 to 0 after the
  wrong-then-correct retry sequence. The complete Flutter suite passes 288
  tests.

## Full-Screen Streak Claim Page (2026-09-23)

- Claiming XP after Vocabulary Training now opens a persistent full-screen
  streak celebration overlay. It uses the A1 BUDDY white-paper / pastel theme:
  a Cantonese speech bubble, looping fire and monster art, the streak day
  count, a seven-day strip with today checked, and a `返回詞彙` button.
- The overlay stays open until the student taps the button. The root streak
  callback removes the overlay and clears the pending update; it no longer
  disappears automatically after a short timer.
- The monthly `StreakPanel` calendar no longer renders the looping fire Lottie
  in its header. Fire celebration art is reserved for the claim page; the
  calendar continues to show active and frozen dates only.

## Vocabulary Success Screen Colour Rotation (2026-09-23)

- The repeat-until-correct Vocabulary result screen now follows the approved
  stationery layout: centred success title and subtitle first, a larger
  floating monster below, three pastel XP / 正確率 / 速度 metrics, and the
  full-width yellow `得到經驗值` action at the bottom.
- The celebration monster is deterministic by Hong Kong weekday rather than
  random. Monday through Sunday use red, orange, yellow, green, cyan, blue,
  and purple variants. Each variant preserves the original `cute-monster`
  motion and face while changing only the body and limb colour fills.
- The seven pre-coloured assets are bundled as
  `cute-monster-monday.json` through `cute-monster-sunday.json` under
  `flutter_app/assets/lottie/monsters/`. `successMonsterAssetForToday()` in
  `vocab_screen.dart` uses the same UTC+8 day boundary as the streak system.
- Weekday mapping and all seven Lottie files are covered by tests. Focused
  Vocabulary/Lottie tests pass; the complete Flutter suite now passes 287
  tests; the result screen remains on the existing white-paper, pastel,
  dashed-border A1 BUDDY design.
- The arm64 debug APK built successfully at
  `flutter_app/build/app/outputs/flutter-apk/app-arm64-v8a-debug.apk` with
  SHA-256 `2e771a854d8be92fe1747a9480f34c4d636c5d9a15d1329bbae05bfa28f60100`.

## Vocabulary Training Mastery Flow (2026-09-22)

- Vocabulary Training now runs the app round in repeat-until-correct mode. A
  wrong answer is appended to the retry queue and, when the first pass ends,
  the student sees an A1 BUDDY stationery-style mistake transition with a
  monster speech bubble before the retry questions begin. Wrong attempts count
  in accuracy, but the target question count remains the original round size.
- The repeat-mode result screen shows `溫習大成功！！`, looping
  `cute-monster.json`, XP / 正確率 / 速度 metrics, and a `得到經驗值` action.
  Completion is recorded only when that action is tapped, so the root
  full-screen streak celebration appears after the result page and not behind
  it. The result and retry surfaces use the existing white-paper, pastel,
  dashed stationery UI; Duolingo screenshots are flow references only.
- Reading MC questions keep a selected `VocabSense` attached to the question.
  The displayed POS (`n.`, `v.`, `adj.`, etc.), correct Chinese meaning, and
  same-POS distractors now come from that same sense.
- The 22 September Downloads batch was deduplicated by filename. New assets
  are bundled under `flutter_app/assets/lottie/monsters/`: crying-monster,
  sad-monster, one-eye-monster-5, three-eye-monster through -6, and
  top-badge-animation. Flat-bottom monster placements use bottom alignment;
  `cute-monster` remains the floating/jumping celebration character.
- Focused Vocabulary/Lottie tests pass (25 tests); the complete Flutter suite
  passes (285 tests). `flutter analyze` has no new issues; only two existing
  ECON test lint hints remain. The arm64 debug APK is
  `flutter_app/build/app/outputs/flutter-apk/app-arm64-v8a-debug.apk`.
  SHA-256: `5d62f1efb753c2880372a776df15cbc2e396308702b9f6588985c397b2fdb5b2`.
  It was installed with `adb install -r -d` on ASUS `S2AIOC447307NGJ` after the
  device reconnected, preserving app data; `MainActivity` launched
  successfully.

## Critter Editor Final Styling (2026-09-21)

- Settings editor hides the back arrow when opened from the profile settings
  route. The large preview has a Japanese stationery pill button labelled
  `更改名稱`; the rename dialog uses the green Settings outline.
- Component thumbnails now show no Chinese labels and no border when idle.
  Only the selected component receives the A1 green border, matching the
  reference editor interaction. Immediate option refresh remains immutable-map
  based, so every tap rebuilds the preview.
- Focused profile/settings tests and `flutter analyze` pass. The latest arm64
  APK is built at `flutter_app/build/app/outputs/flutter-apk/app-debug.apk`,
  SHA-256 `7dbea5939c90fe6126facd17d983391df72e78b6212e239cdd6b1b62167ce550`.
  The ASUS disconnected before this final build could be installed; the
  previously installed APK and app data remain untouched.

## Vocabulary Book Recent-Date Ordering (2026-09-21)

- The Vocabulary `按時序排列` mode now sorts by `createdAt` descending, with
  `updatedAt` only as a same-creation-time tie-breaker. Previously the list
  sorted rows by `updatedAt` while date dividers displayed `createdAt`, so a
  later cloud merge or review could produce sequences such as 19 Sep, 7 Sep,
  15 Sep, 9 Sep, 20 Sep. The shared comparator is used by the controller,
  screen, and cloud merge path, keeping row order and date headers aligned.
- Regression coverage includes deliberately out-of-order update timestamps and
  verifies the visible order is 20 Sep, 19 Sep, 15 Sep, 9 Sep, 7 Sep.
- Full Flutter suite: 278 tests passed; the arm64 debug APK is
  `flutter_app/build/app/outputs/flutter-apk/app-debug.apk`, SHA-256
  `ae618fea6a99a44d6d67bbd2792e71453a27625141cec9c7ba0dd1b4df702e99`.
  It was installed with `adb install -r -d` on ASUS `S2AIOC447307NGJ`,
  preserving app data; `MainActivity` launched successfully.

## Rounded-Rectangle Critter Frames (2026-09-21)

- Critter avatars now use the official-style rounded-rectangle frame with a
  white border instead of a circle. The background colour fills the entire
  frame, preventing the monster's lower area from appearing empty after
  circular clipping.
- Settings' profile row now has a visible `更改名稱` button beside the current
  name/avatar rather than only an unlabeled pencil icon.
- Verification remains clean: full Flutter suite has 278 passing tests and
  `flutter analyze` reports no issues. The arm64 debug APK is
  `flutter_app/build/app/outputs/flutter-apk/app-debug.apk`, SHA-256
  `851d47c37e18845b43fd63a80be62a52709d6bc8170628270a12c831dc835e27`.
  It was installed on ASUS `S2AIOC447307NGJ` with data preserved and launched
  successfully. The white frame is rendered as a top overlay above the
  Critter layers, and Settings places the pencil immediately after the name
  with a visible `更改名稱` label. Avatar option updates now replace the
  options map immutably, so tapping a component rebuilds the preview layers
  immediately instead of leaving the old avatar on screen.

## Student Name And Critters Avatar Onboarding (2026-09-21)

- Authenticated students without `profileSetupComplete` now enter a two-step
  setup before AppShell. Step one is a friendly name greeting with the bundled
  blue `Monster.json` Lottie; step two is an animated transition into the
  Critters editor. Existing students receive it once after upgrading and
  teacher-role accounts skip it.
- The uploaded Monster set is kept under
  `flutter_app/assets/lottie/monsters/` (including `monster-blue.json`, the
  blue/orange-horned character used at onboarding). All files are local assets;
  no network fetch is required.
- The Critters editor now follows the reference interaction: a large live
  preview sits above a white rounded stationery sheet with icon tabs and a
  three-column thumbnail grid. Long helper copy and the old numbered header
  are gone. It still exposes top/head, body, pattern, cheeks, eyes, mouth,
  body/accent/ink colours, and six stationery background colours, with a
  sparkle randomize action and icon-only save action.
- Critters render on-device from a deterministic seed using
  `dicebear_core 10.7.0`, `dicebear_styles 10.6.0`, and `flutter_svg 2.3.0`.
  DiceBear core is MIT and the Critters style is CC0. DiceBear's embedded CSS
  keyframes are stripped because `flutter_svg` cannot run them; `CritterAvatar`
  splits the generated SVG into body and eyes layers, then supplies the
  default `fastest` body bob plus an eyes-only blink with a Flutter animation
  controller. Thumbnails are static to keep the editor lightweight. The
  preview background is the complete circular container fill, so no uncovered
  edge remains.
- Each animated body/eyes layer now creates its own `SvgPicture` widgets per
  frame; no rendered widget instance is reused across the animation tree. This
  avoids the Flutter `child.owner == owner` render assertion that previously
  blanked the Grammar home and caused the large overflow banner. The Settings
  rename dialog also keeps its controller alive until the editor route is
  disposed, avoiding `_dependents.isEmpty` / disposed-controller assertions.
- The avatar editor preview now shows
  `${displayName}！運用你的想像力來設計頭像吧！` above the character.
- `StudentProfile` and the profile callables now persist `avatarOptions` next
  to `avatarStyle`, `avatarSeed`, and `avatarBackground`. The selected options
  are returned by both password and device login, mirrored to the signed-in
  `publicProfiles/{uid}`, and passed to the shared header/profile renderer.
  Firestore rules permit only the named option keys; student ID, class, login
  credentials, and progress remain private.
- Settings now shows the signed-in student's current name/avatar and opens the
  same editor at any time. The editor has a small rename action, and saving
  calls `completeStudentProfile` again so the local profile, private user doc,
  and `publicProfiles/{uid}` stay aligned. The welcome copy is
  `歡迎成為A1一份子`.
- Verification: focused profile tests cover the two screens, looping Monster
  presence, compact 320x568 layout, custom eye/body/background selections, and
  saved option payloads. Backend profile validation and syntax checks pass;
  `completeStudentProfile`, `studentLogin`, `studentDeviceLogin`, and Firestore
  rules are active in `enguistics-grammar-game`.
- Full Flutter suite: 277 tests passed; `flutter analyze` and `git diff --check`
  are clean. The arm64 debug APK is
  `flutter_app/build/app/outputs/flutter-apk/app-debug.apk`, 293 MB, SHA-256
  `9b358f8452f4f7c440ab7bbc39e205cc05524699c85ca17048dc0cfa769d56cf`.
  It was installed with `adb install -r -d` on ASUS `S2AIOC447307NGJ` on
  2026-09-21 12:58 HKT, preserving app data. `MainActivity` launched and was
  visible after installation.

## Vocab Spelling Layout, Fixed Characters And Header/Streak Polish (2026-09-21)

- The yellow/black block at the right edge of long spelling answers was
  Flutter's debug `RenderFlex overflow` indicator. `_SpellingPattern` no longer
  puts every character in one `Row`; it uses a centred multi-line `Wrap` inside
  a variable-height dashed answer surface, so long phrases fit compact phones.
- Spelling input now stores letters only. The first English letter remains
  given, while spaces, hyphens, apostrophes, and literal `...` pattern markers
  are fixed by the question and displayed automatically. Submission reconstructs
  the canonical headword before scoring: for example `tend to` only needs
  `endto` after the given `t`, and `differ from ... to ...` never asks the
  student to type spaces or dots.
- All persistent `streak-fire.json` instances (compact header badge, full badge,
  and streak panel) now use `repeat: true`. One-shot streak extension, freeze,
  and confetti celebration files remain intentionally non-looping. Test binding
  disables the continuous ticker only so `pumpAndSettle` can terminate.
- Shared section headers now reserve the same maximum control width on both
  sides. The Vocabulary training control plus profile/streak accessory no longer
  pushes `詞彙本` off the frame's geometric centre; the regression permits less
  than 0.5 px centre error.
- Focused compact-phone tests prove the long `differ from ... to ...` answer has
  no overflow, fixed punctuation is visible, letters-only input scores correct,
  and header centring remains stable. `flutter analyze` is clean and all 276
  Flutter tests pass.
- The latest arm64 debug APK is
  `flutter_app/build/app/outputs/flutter-apk/app-debug.apk`, 293 MB, SHA-256
  `5452b6591436b1d0f8fdbcad43e0f915754a6b2b13469aa5ef9f32421ddb9747`.
  It includes Critters onboarding and these four UI fixes and was not installed.

## Native Vocab Local-first Playback (2026-09-21)

- Saved-word playback no longer awaits `ensureVocabAudio(checkOnly: true)` before
  touching a valid local file. `speakWord` checks the persistent override cache
  first, then bundled audio, and starts playback immediately. A cloud revision
  check runs unawaited; if a teacher correction exists, it atomically replaces
  the persistent MP3/revision sidecar for the next tap.
- Downloaded overrides now remain ahead of bundled audio on every later tap.
  Previously a corrected bundled word could use the cloud file once, then fall
  back to its stale asset after `_cloudCheckedWords` suppressed another check.
- `VocabAudioReconciler` now refreshes revisions for existing My Vocab word
  audio in the background instead of treating `hasAudio == true` as complete.
  Refresh failure never blocks offline playback or aborts the rest of the pass.
  Missing words and example sentence audio retain the existing ensure/download
  behaviour.
- Regression coverage holds a cloud revision request open indefinitely and
  verifies cached `speakWord` still completes and plays a `DeviceFileSource`
  within 500 ms. Tests also cover revision replacement, persistent cache reuse,
  reconciler refresh ordering, pause/resume, and missing audio.
- Verification: `flutter analyze` is clean and all 267 Flutter tests pass. The
  arm64 debug APK built successfully with `DOPE_ALLOW_DEBUG_SIGNING=true` at
  `flutter_app/build/app/outputs/flutter-apk/app-debug.apk`, size 292 MB,
  SHA-256 `90b7f50d3683db67d6a920f0a9c568a08506db94549ace8d4ad5ea824f440495`.
  Per the user's request, this APK was not installed and no ADB install command
  was run.

## Vocab Console Playback, Example Parity And Pattern Lookup (2026-09-20)

- Teacher Vocab Console no longer starts browser `speechSynthesis` while the
  real shared MP3 is loading. Play now resolves the Firebase audio, stores it in
  browser Cache Storage (`teacher-vocab-audio-v1`), and plays that MP3; system
  speech runs only after cloud/audio playback genuinely fails. Word cards and
  opened example sentences preload with concurrency 2, so repeat/reload playback
  normally starts from browser cache. Regenerated and teacher-uploaded files use
  the same cache path after their rotated download URL is returned.
- Console examples now lazy-load the same 28 per-letter reviewed example shards
  exported for Flutter. Selection matches `word + meaning + POS + type`, then
  falls through to `lookupVocabExamples` only when the reviewed game shard has
  no matching sense. Cloud errors/timeouts are now labelled as read failures,
  not incorrectly as `暫時未有例句`.
- The live teacher entry `differ from ... to ...` was promoted into the curated
  bank with alias `differ from to`; `vary from ... to ...` has the matching
  collapsed alias. Flutter bundled lookup resolves both forms offline, while
  cloud lookup expands a typed `from to` pattern to `from ... to ...` and treats
  the returned canonical row as the same headword.
- `scripts/export-flutter-vocab-data.js` now deletes only the lookup/example/
  audio/meta files it owns instead of the whole vocab asset directory. This
  prevents future vocab exports from deleting `synonym_groups.json`; the 241
  group / 798 word Battleship synonym asset was regenerated after the issue was
  caught by the full suite.
- Live Hosting now contains the updated Console plus
  `assets/vocab-examples/examples_*.json`. The isolated release preserved
  `index.html`, `grammar-admin.html`, `manifest.json`, `privacy.html`,
  `teacher_vocab_bank.js`, and `vocab_sense_bank.js` byte-for-byte. Live checks
  confirmed 1,476 `d`-shard headwords and the new cache/example code.
- Verification: `flutter analyze` is clean; all 266 Flutter tests pass; the full
  root test suite, web build checks, focused lookup/audio/example tests, and
  `git diff --check` pass.
- Follow-up example generation now treats `...` as replaceable slots rather
  than literal dots. The quality validator accepts concrete uses such as
  `vary from student to student`, while the AI prompt explicitly preserves the
  fixed-word order and fills each slot. `no man is an island` and
  `vary from ... to ...` also have three reviewed fallback examples each, so
  they still work when both AI providers are unavailable.
- Those three entries are also bundled into the shared native/Console example
  shards, rather than relying only on callable fallback. Console shard requests
  carry release `20260920-pattern-examples` so Safari cannot retain the older
  empty `d`/`v`/`n` shard. A live check in the teacher's already-authenticated
  Safari tab showed all three `differ from ... to ...` examples after an ordinary
  refresh.
- The dynamic AI path itself is now validated live, not only hidden behind
  reviewed fallbacks. Root causes were: `isLikelyWordOrPhrase` rejected every
  headword containing `...` before generation; DeepSeek had only one attempt;
  and the Gemini fallback currently returns `User location is not supported for
  the API use` from `asia-east2`. Controlled `...` patterns now pass callable
  validation. DeepSeek output receives structured rejection reasons and one
  lower-temperature repair attempt when fewer than three examples pass; prompts
  forbid paraphrasing fixed idioms and require every placeholder to be filled.
- Live proof used `on ... occasions`, which has no reviewed shard entry. The
  authenticated Console generated and displayed three examples, and Firestore
  document `vocabExampleCache/1aa526f1206722e2e3b1d6bf` records
  `source: deepseek-generated-examples`, `status: ready`, three examples, and
  creation time `2026-09-20T03:24:13.905Z`.
- Selecting `ph.` in Teacher Vocab Console now writes `pos: "phrase"` together
  with `type: "phrase"`. The previous form adapter erased the selected POS,
  causing student-ready validation to reject phrases whose POS could not be
  inferred. The Console fix and updated `lookupVocabExamples`,
  `prepareTeacherVocabExamples`, and `warmTeacherVocabAssets` Functions are live.
- The arm64 debug APK was rebuilt with SHA-256
  `8fcb6fa6843f7ad127057510ff6925e4c150a376f1a6001227fffbec811c4a15`
  and installed on ASUS `S2AIOC447307NGJ` with `adb install -r -d`, preserving
  app data. Package `lastUpdateTime` is `2026-09-20 09:52:54`; the app process
  and `MainActivity` started successfully after install.

## Teacher-uploaded Vocab Audio (2026-09-20)

- Teacher Vocab Console word cards now include `上傳 MP3` beside Play and TTS
  regeneration. The picker accepts `.mp3` files from tools such as ElevenLabs,
  enforces 512 bytes to 2 MB in the browser, uploads through the teacher-only
  `uploadVocabAudio` callable, and immediately plays the returned cloud file so
  the teacher can verify it without relying on the student game.
- The existing Azure output is MP3, 24 kHz, 48 kbps, mono. Teacher uploads do
  not need to match that encoding exactly: normal ElevenLabs MP3 such as
  44.1 kHz / 128 kbps is supported. WAV, M4A, fake renamed files, malformed
  base64, and files over 2 MB are rejected server-side. Validation accepts both
  ID3-tagged MP3s and direct MPEG-frame MP3s.
- Successful uploads replace the shared `vocab-audio/v1` object, rotate the
  Firebase download token, write a new UUID revision plus uploader/file metadata
  to `vocabAudio`, and set source `teacher-upload`. The native revision check
  therefore replaces existing bundled/downloaded audio through the same path as
  a TTS correction.
- `uploadVocabAudio` is deployed in `asia-east2`; an unauthenticated live smoke
  request returns `401 UNAUTHENTICATED`. The three Console files are deployed to
  `https://enguistics-grammar-game.web.app/teacher-vocab`. The isolated Hosting
  release uploaded exactly three files and preserved live `index.html`,
  `grammar-admin.html`, `manifest.json`, `privacy.html`, and
  `teacher_vocab_bank.js` byte-for-byte.
- Verification: Functions syntax/lint and the dedicated MP3 validator tests
  pass; web build/bundle tests and `git diff --check` pass. Source of truth is
  `functions/vocab-audio-upload.js`, `functions/index.js`, and
  `teacher-vocab-admin.js` / `teacher-vocab-admin.css`.

## ECON materials, shading and guide parity — 2026-09-19

- Table visuals now retain only genuine source/material headings, such as
  `Source A: ...` and `資料 A：...`, above the table. Ordinary descriptive
  captions remain hidden, preserving the earlier compact-table requirement.
- Demand/supply shade anchor hit-testing now uses a consistent 28px screen
  radius (30px for structured tools) instead of normalized chart distance, so
  later P/Q guides such as P2 are no harder to trace than P1.
- Duplicate shaded concepts are numbered in drawing order (`TE1`, `TE2`, etc.).
  Consecutive P/Q guides now draw separate axis movement arrows; the second and
  later transitions use progressively outer lanes so P2->P3 and Q2->Q3 do not
  overlap P1->P2 and Q1->Q2.
- While Shade is active, its area-choice row replaces the selected curve's
  slope/MC/MPC/MSC/quota controls instead of appearing below them.
- Diagram drag recognition is conditional. Only an axis guide, shade anchor, or
  draggable point/gap/curve owns the canvas pan; the editor header, toolbars and
  controls remain normal vertical-scroll start areas. This removes the large
  non-scrollable region while keeping actual chart manipulation stable.
- Regressions cover 2025 P2 Q11 Source A/B table headings, equal P1/P2 shade
  tolerance, duplicate area numbering, non-overlapping guide lanes, Shade
  control replacement, and scroll gestures outside the canvas. `flutter
  analyze` is clean and all 264 Flutter tests pass. Rebuild and preserve-data
  install the arm64 debug APK on ASUS for the physical check.

## Teacher Vocab Audio Correction (2026-09-19)

- Teacher Vocab Console word cards now include `重新生成讀音` for teacher-role
  accounts. After confirmation it calls `ensureVocabAudio` with `force: true`,
  waits for Azure TTS, stores the replacement in the shared Grammar Game bucket,
  and immediately plays the returned MP3 for checking.
- Forced audio generation is enforced server-side: students cannot request it.
  Every replacement receives a new UUID revision and Firebase download token,
  with `teacherOverride`, `regeneratedAt`, and `regeneratedBy` metadata recorded
  in `vocabAudio` / Storage.
- Flutter word playback keeps a revision sidecar under the persistent
  `vocab-audio/v1` cache. Cached or bundled MP3s play first; the cloud correction
  check happens in the background and atomically replaces an older file without
  delaying the current tap. If the check is offline, local playback still works.
- Verification: `flutter analyze`, all 254 Flutter tests, the full root `npm
  test`, Functions lint, web build tests, and `git diff --check` pass. A focused
  regression covers `bald`: revision 1 is cached, revision 2 downloads after an
  app restart, and repeat playback in the same session does not re-check or
  re-download.
- Source of truth: `functions/index.js`, `teacher-vocab-admin.js` /
  `teacher-vocab-admin.css`, and
  `flutter_app/lib/features/vocabulary/vocab_audio_repository.dart`. Web assets
  in `www/` were rebuilt.
- `ensureVocabAudio` was deployed successfully to the
  `enguistics-grammar-game` project in `asia-east2` on 2026-09-19. An
  unauthenticated live force request returned `401 UNAUTHENTICATED` as expected.
  The three Teacher Vocab Console files were also released to live Hosting at
  `https://enguistics-grammar-game.web.app/teacher-vocab`. Deployment used an
  isolated staging bundle: the existing live `index.html`, `grammar-admin.html`,
  `manifest.json`, `privacy.html`, and `teacher_vocab_bank.js` were preserved
  byte-for-byte, so pending branding and teacher-bank changes were not released.
  Post-deploy checks confirmed the live JS button and cache-busted HTML.
- The earlier preview channel remains available at
  `https://enguistics-grammar-game--vocab-audio-refresh-wou93okd.web.app/teacher-vocab`
  until 2026-09-26, but normal teacher testing should now use the live URL.
- The Android arm64 debug build also succeeds with the repository's explicit
  `DOPE_ALLOW_DEBUG_SIGNING=true` local-build flag. The artifact is
  `flutter_app/build/app/outputs/flutter-apk/app-debug.apk`; no device was
  connected to ADB, so it was not installed.

## ECON diagram drag performance — 2026-09-18

- Curve, point and market-gap drags now keep a canvas-local preview and update
  only the `CustomPaint` subtree while the finger moves. The parent practice
  screen receives one final diagram state on pointer release instead of a full
  page rebuild for every pointer event.
- This removes the per-move JSON state comparison and stops rebuilding the
  question text, answer controls and editor toolbar during a drag. Anchored
  shaded areas are resolved once for the final committed state while remaining
  visually attached in the local preview.
- Pointer-down on the diagram temporarily disables the outer question scroll;
  pointer-up/cancel restores it. Vertical curve moves therefore no longer lose
  the gesture to the surrounding `SingleChildScrollView`.
- Focused regressions verify zero parent commits during movement, exactly one
  commit on release, and parent-scroll locking throughout a curve drag. Run the
  full Flutter suite, rebuild the arm64 APK and install it on ASUS for the
  physical smoothness check.

## Vocabulary Training Persistent Attention And Workshop Answer Audit — 2026-09-17

- The Training dumbbell attention effect now lives in its own stateful widget:
  while `dueCount > 0` it continuously eases between normal size and 116%
  every 900 ms, starting after 80 ms and stopping as soon as no word is due.
  This is separate from the page's old one-shot animation controller. The
  widget regression verifies multiple complete scale cycles, not only startup.
- Vocabulary word/example playback remains at the requested 60% boost
  (`master volume * 1.6`, capped at 100%).
- A private Workshop answer audit command is now available:
  `npm run grammar:workshop:audit-answers`. It read-only audits the bundled
  complete 3,879-question release and writes
  `private_exports/grammar_workshop_answer_audit.json`, recording existing
  `answers`, `answerSlots`, `correct_tokens`, options, validation issues, and
  context flags. The final audited output is 3,879 reviewed and zero unreviewed
  candidates across all 18 Workshop topics.
- Reviewed alternatives live in
  `scripts/grammar-workshop-answer-overrides.js`; a generator creates the Dart
  override table, and the apply command updates the bundled release plus its
  topic/manifest hashes. Re-exporting a newer Battleship release reapplies the
  reviewed decisions so sync cannot silently remove them.
- Choice scoring now accepts reviewed option sets. Fill scoring accepts
  reviewed answer lists. Rearrangement token pools include every token needed
  by all accepted sequences. Systematic rules cover conditional clause order,
  indirect `if/whether`, reported-speech optional `that` and `if/whether`,
  participle phrase order, DE-structure relative/reduced forms, formal question
  tags, contractions, and British/American spelling. Tenses validate all 1,166
  bilingual prompts against answer presence, blank/slot alignment, tense/voice
  morphology, and mixed-answer slots; broken fixtures prove the validator
  rejects invalid data.
- Concrete corrections include `during/in the interview`, reviewed time/place
  preposition alternatives, `cheer my friend up` sentence structure,
  `delightful` -> `delighted`, common verb-table regional forms, and the broken
  `one of your collection` pronoun prompt.
- Final verification: `flutter analyze` is clean; the full Flutter suite passes
  all 242 tests; the Workshop audit tests pass all 14 cases; the Battleship
  publish/hash contract passes all 15 cases; `git diff --check` is clean. The
  latest debug APK was built at 20:22 HKT with SHA-256
  `b2d9436b824d2af1259d79f7258d88735f5f3574697706f8628daf8dfc6346f8`.
  ASUS `S2AIOC447307NGJ` was online, but the managed permission review timed out
  twice before `adb install` could start, so this exact APK still needs a
  preserve-data install when device command approval is available.

## ECON paper labels and single-table vertical fallback — 2026-09-17

- ECON `逐份操` now labels its paper selectors `Paper 1 MC` and `Paper 2 LQ`.
  In English mode its source selectors read `Past Paper` and `Mock Paper`;
  Chinese mode retains `歷屆試卷` and `模擬試卷`.
- Three-column source tables such as 2012 P1 Q10 remain a single responsive
  table when their content can fit. Wide source tables are now transposed into
  one real grid on compact phones: e.g. 2013 P1 Q13 becomes
  `價格 | 需求量 | 供應量`, with one row per price. The table caption is hidden,
  all original row labels are retained, unit brackets wrap onto the second line
  inside headers, and every cell keeps normal horizontal/vertical borders.
- The shared Settings modal is now subject-aware. ECON opens it with orange
  frame, title, volume panel, slider track and thumb; the Game Hub Settings
  control also changes to orange while ECON is selected. ENG keeps its existing
  palette.
- Focused regressions cover Q13 transposition/grid integrity, hidden captions,
  wrapped unit labels, paper/source labels, and the ECON Settings palette.
  `flutter analyze` and the full Flutter suite (234 tests) pass; rebuild/install
  the arm64 APK on ASUS before the next device smoke check.

## Vocabulary Study Attention, Audio, And POS Crayons — 2026-09-17

- The Vocabulary Training dumbbell now pulses only when there is at least one
  unseen or previously incorrect word (`dueCount > 0`); a fully practised bank
  no longer keeps drawing attention.
- Word and example playback now uses a 60% clarity boost over the selected
  vocabulary master volume (still clamped safely at 100%).
- English/Chinese study-mode crayon masks now use stable POS colours instead of
  hashing the saved item id: noun yellow, verb green, adjective purple, adverb
  blue, and other/unknown pink.
- The Training attention animation is continuous while `dueCount > 0`, using a
  clearly visible 16% ease-in/out scale cycle. The earlier one-shot pulse could
  finish before a student noticed it.

## Vocabulary Speaking And Quiet-Session Switch — 2026-09-16

- Vocabulary Training now includes Speaking Word and Speaking Sentence questions,
  following Battleship My Vocab's Azure Pronunciation Assessment direction.
  Flutter records a temporary 16 kHz mono WAV, the authenticated
  `assessVocabPronunciation` callable scores it in the dedicated
  `enguistics-grammar-game` Firebase project, and the local WAV is deleted
  immediately after assessment. Recordings are not written to Storage or
  Firestore.
- A score of 65 passes. The result panel shows the overall score and identifies
  the weakest word when a sentence needs more practice. Correct Speaking work
  persists `speakingMastered` through the existing local-first/cloud merge.
- Listening and Speaking questions now show a Cantonese-friendly
  `而家唔方便聽／講？改問其他題` action, based on Battleship DSE Synonym's
  `CAN'T LISTEN NOW?` flow. Listening and Speaking are independent session
  switches: each action immediately converts the current and every remaining
  question of that type into Reading or Spelling, while keeping the other mode,
  round length, and progress stable.
- Android now requests `RECORD_AUDIO`; iOS has a microphone privacy description.
  Microphone denial, empty audio, and assessment outages do not count as wrong
  answers.
- `assessVocabPronunciation` and the mastery-field Firestore rules were deployed
  successfully to `enguistics-grammar-game` in `asia-east2`. The live callable
  inventory shows the new Node.js 22 function, and an unauthenticated smoke
  request is rejected with `UNAUTHENTICATED` as intended.
- Verification: `flutter analyze` is clean, the full Flutter suite passes all
  226 tests, focused review tests pass after separating Listening/Speaking
  opt-outs, Android debug and unsigned iOS device builds succeed. The ASUS was
  not visible to ADB at deployment time; install the rebuilt debug APK with
  `adb install -r -d flutter_app/build/app/outputs/flutter-apk/app-debug.apk`
  after it reconnects, without clearing app data.

## Vocabulary Training Given-Letter Input — 2026-09-16

- Spelling training now stores the given first letter inside the answer field
  from the start, so entering the next letter appends to it instead of making
  the given letter disappear. The custom keyboard cannot backspace past that
  fixed first letter.
- The first given-letter slot remains without an underline, and the hidden
  input caret is forced to zero width and transparent so no blinking vertical
  line appears beside it.
- `vocab_review_screen_test.dart` covers the `achieve` -> `a` + `c` = `ac`
  regression, fixed-prefix backspace behaviour, and hidden-caret settings.

## ECON topic-practice legacy ordering — 2026-09-16

- `逐課操` now follows the retained standalone ECON selection setting instead
  of taking the first N records in JSON import order: questions previously
  answered incorrectly come first, then unseen questions, then previously
  correct questions.
- Every progress bucket is chronological by reviewed paper publication order
  (including the Aristo Mock Test 1–44 publication timeline), then by natural
  printed reference order such as Q1, Q2, Q10. `逐份操` also uses the same
  publication/reference ordering while still opening the complete paper.
- Focused repository/picker regressions, `flutter analyze`, and the full Flutter
  suite (220 tests) pass. Rebuild and install the arm64 debug APK on ASUS after
  this change; no question content or student progress was modified.

## ECON responsive table sizing — 2026-09-15

- ECON question tables now measure the actual frame width with `LayoutBuilder`
  instead of using the full device width. Content-aware column widths keep
  numeric columns compact, give text columns a safe minimum, shrink only the
  excess width when needed, and avoid stretching short one-column tables across
  large empty areas. Tables now fill a sensible 78–96% of the available frame
  width rather than either leaving a large blank strip or forcing every column
  to the full viewport width.
- A horizontal scroll view remains available only when a table genuinely cannot
  fit; compact three-column tables such as 2013 Q38 now fit without side
  scrolling, while dense multi-column data still uses the existing vertical
  card layout.
- Added focused widget regressions for 2013-style one-, two- and three-column
  tables. `flutter analyze`, the focused ECON suite and the full Flutter suite
  (216 tests) pass. The debug APK was rebuilt with
  `DOPE_ALLOW_DEBUG_SIGNING=true`; ASUS `S2AIOC447307NGJ` was disconnected at
  install time, so reinstall after it reconnects. No app data was cleared.

## ECON practice arrow hit targets and MC labels — 2026-09-15

- The previous/next arrow image remains 34 px and its centre is restored to the
  original stationery-frame border overlap. Its separate 92×112 transparent
  touch target remains fully inside the lesson stack's hittable bounds. This
  preserves the old appearance while fixing taps landing in the visually
  visible but non-hittable clipped area.
- ECON multiple-choice cards no longer prepend A./B./C./D.; choice ids remain
  internal for grading, while student-facing choices and correct-answer review
  show the answer text only.
- `flutter analyze` and the full Flutter suite (214 tests) pass. The arm64 APK
  was rebuilt at 00:17 on 15 September, but ASUS `S2AIOC447307NGJ` disconnected
  before the install and is not currently visible to ADB. No device data was
  cleared.

## ECON menu controls and complete-paper practice — 2026-09-14

- ECON Settings now tints the retained gear asset with the ECON orange accent,
  so it no longer appears in the ENG teal/green colour on ECON pages.
- Language selection is now one compact switch in the menu header (top-right,
  beside the top-left Settings seal). The duplicate centre language row was
  removed from both `逐課操` and `逐份操`; the selected language is shared by
  the ECON menu tabs.
- `逐課操` keeps the learning-style practice-count panel and starts the
  selected chapter with the chosen count. `逐份操` always opens every question
  in the selected paper/source set, so a complete paper is attempted instead
  of being truncated to the practice-count setting.
- The full Flutter suite (214 tests) and `flutter analyze` pass. The latest
  arm64 debug APK was rebuilt at
  `flutter_app/build/app/outputs/flutter-apk/app-arm64-v8a-debug.apk` and then
  installed on ASUS `S2AIOC447307NGJ` with `adb install -r -d` after reconnect.
  `MainActivity` resumed normally; no app data was cleared.

## Vocabulary Search Cute Sticker Animation (2026-09-14)

- Replaced the search-focus overlay's copied Battleship sci-fi treatment
  (`MEMORY TRACE LOCKED`, scan beam, radar-like ring) with an A1 BUDDY
  Japanese stationery sticker animation: a soft paper card saying `搵到喇！`,
  pastel star/heart/sparkle stickers, yellow crayon underline, and a gentle
  scale/tilt entrance. Exact saved-word centring, teal row highlight and
  search SFX remain unchanged.
- Updated the focused vocabulary screen regression and verified
  `flutter analyze` plus the full Flutter suite (211 tests) remain clean.
- ASUS was disconnected during this pass, so the new debug APK needs a
  physical reinstall after the device reconnects.

## ECON post-visual text and responsive tables — 2026-09-14

- ECON Paper 1 and Paper 2 now render source-verified `postVisualStem` text
  after the table/diagram and before the answer controls. The native layout no
  longer drops text printed after a visual; when the post-visual line is the
  same prompt, it is shown once in the prompt position instead of duplicated.
- Question tables now use fixed narrow columns for numeric data. Dense numeric
  tables on compact phones automatically switch to stacked row cards, avoiding
  repeated horizontal dragging while keeping the original headers and values.
  Wider screens retain the tabular layout with compressed numeric columns.
- Regression coverage checks post-visual text after both a table and a Paper 1
  diagram, plus vertical rendering for a dense numeric table. `flutter analyze`
  and the full Flutter suite (214 tests) pass. The latest arm64 debug APK at
  `flutter_app/build/app/outputs/flutter-apk/app-arm64-v8a-debug.apk` was
  installed on ASUS `S2AIOC447307NGJ` with `adb install -r -d`; the app launched
  successfully and the existing vocabulary/progress data was preserved.

## ECON bilingual answer and curve-sequence parity — 2026-09-13

- Overlay demand/supply curves now preserve the supplied baseline labels (for
  example D0/S0) and start student additions at D1/S1, then D2/S2. The grading
  payload also records equilibrium/point movement geometry, so a correct
  P1/Q1 → P2/Q2 movement is judged by its actual up/down/right/left direction
  rather than by the numeric suffix used in the source diagram.
- English ECON answer review now appends the reviewed Chinese answer, Chinese
  marking points and Chinese answer diagram when a safe bilingual counterpart
  exists; Chinese review remains Chinese-only. Pairing uses source, paper,
  marks, chapter and subpart-aware matching to avoid showing an unrelated
  offset mock-paper answer.
- The backend grading prompt includes the same suffix-offset rule. A targeted
  Firebase deployment was attempted with the `grammar-game` codebase filter,
  but the Firebase/IAM API timed out before uploading; retry deployment when
  the Firebase API is reachable. The local arm64 APK was rebuilt after these
  changes at `flutter_app/build/app/outputs/flutter-apk/app-arm64-v8a-debug.apk`.
- `flutter analyze`, the focused diagram/question/grade tests, and the full
  Flutter suite (211 tests) pass. No ASUS install was attempted because
  `S2AIOC447307NGJ` remains absent from ADB; no device data was cleared.

## Vocabulary Search Focus And Local-First Startup (2026-09-13)

- Vocabulary search now follows the retained Battleship interaction: when the
  typed query exactly matches a saved word, the list animates to the matching
  row, centres it in the viewport, and applies a short teal raised-surface
  focus treatment. A `MEMORY TRACE LOCKED` overlay adds a restrained scan/ring
  animation without intercepting taps. Large lists first animate near the
  estimated row and then use the real row context for final centring.
- The native `CloudSyncedVocabStore` already had local-first persistence, but
  the outer launch gate was still waiting for the complete Firebase/Auth
  startup future. Authenticated and signed-out routes now render a local
  `AppShell` while authentication resolves; the authenticated shell replaces
  it automatically when Firebase finishes. Firestore restore remains a
  background merge and never blocks the vocabulary list.
- Regression coverage includes existing-word search centring/highlight,
  delayed-row layout, slow Firestore restore returning local data within one
  second, and launch with an intentionally incomplete startup future.
  `flutter analyze` is clean and all 211 Flutter tests pass.
- A debug APK was rebuilt successfully at
  `flutter_app/build/app/outputs/flutter-apk/app-debug.apk`. ASUS was
  disconnected when the final install was attempted, so the physical install
  remains pending reconnection.

## ECON Paper 2 marking parity — 2026-09-13

- Paper 2 written-question feedback now preserves the old review flow: the
  returned grade is shown point by point with each criterion's mark allocation,
  feedback, evidence and missing component, followed by the official model
  answer, the retained answer-diagram crop and the source marking-point list.
  Answer diagrams are read from both question-level and part-level
  `answerVisuals`, so the old reference figure is not dropped by the native
  parser.
- P2 round results now add awarded marks and use the sum of each question's
  actual marks as the denominator. A four-mark written question therefore
  contributes up to 4 marks instead of being treated as a one-point
  right/wrong question; P1 remains one mark per question.
- Added a regression for the cloud grade payload parser. `flutter analyze` and
  all 204 Flutter tests pass. Rebuild/install the APK on ASUS when
  `S2AIOC447307NGJ` reconnects; no device data was cleared.

## Main-menu Settings parity — 2026-09-12

- The shared `OriginalSectionFrame` Settings seal is now wired into every ENG
  and ECON main page: Grammar, Vocabulary, Grammar Workshop, ECON 逐課學習,
  逐課操, 逐份操 and 排名. ECON pages pass the orange `EconPalette` accent so
  the control follows the subject colour rather than the ENG teal/yellow
  treatment.
- The ECON 逐課操 and 逐份操 pickers no longer render the old top-right 返回
  arrow. Their tab selection remains owned by the app shell, while the new
  top-left Settings seal stays in the same position as the original main-menu
  pages. Focused widget tests cover the Settings keys and the absence of the
  picker 返回 control.
- `flutter analyze` and all 203 Flutter tests pass. The arm64 debug APK is at
  `flutter_app/build/app/outputs/flutter-apk/app-arm64-v8a-debug.apk`; the
  ASUS `S2AIOC447307NGJ` is currently disconnected from ADB, so the physical
  install/smoke check is still pending reconnection. No app data was cleared.

## App identity and ASUS install note — 2026-09-11

- The Flutter app project is `/Users/macbook/Documents/ChatGPT/Dope English`
  and its native source is under `flutter_app/`. The public app identity is
  `A1 BUDDY` (`lib/core/app_brand.dart` and Android manifest). `ECONOMICS` is
  the subject shown inside the app's Game Hub; `5**` is an exam/content label,
  not the application or repository name. The separate ECON source/reference
  repository is `/Users/macbook/Documents/ChatGPT/ECON`.
- The latest arm64 debug APK was rebuilt and installed on ASUS
  `S2AIOC447307NGJ` with app data preserved; `MainActivity` resumed normally.
- Arrow interaction polish: previous/next arrows now keep side-specific
  animation keys and use a fully transparent InkWell overlay, removing the
  grey square splash. The latest arm64 APK rebuilt successfully after a clean
  Flutter build; ASUS disconnected during the final install retry and needs to
  reconnect for the physical check.

## ECON Diagram Legacy UI And Gesture Parity — 2026-09-10

- 11 September follow-up: Check/Next now stay on one row; edge navigation is
  rendered as larger solid rounded arrow stickers; S1→S2 movement arrows have
  no text label; guide numbering includes market-gap labels so P3/P4 continue
  correctly; topic picker and learning menu tags now use `CHAPTER 01`,
  `CHAPTER 02`, etc. The updated APK was rebuilt and installed on ASUS
  `S2AIOC447307NGJ` with app data preserved. Focused ECON/practice/picker tests
  pass.
- ECON question-bank loading now uses a shared in-memory Future cache and is
  preloaded when ECON opens or the subject switches to ECON. This removes the
  first-entry delay when opening `逐課操` from the learning menu; `逐份操` had
  appeared instant before because its picker had already warmed the same bank.
- The preload is now included in the main startup Future, so it runs during the
  white A1 launch screen and the picker reads the resolved cache immediately.
  The arm64 split debug APK was installed on ASUS `S2AIOC447307NGJ` after the
  full universal APK hit the device's low-storage limit; app data was preserved.
- Practice edge navigation now uses Austin Sir's supplied
  `assets/branding/next-arrow-2.png`; the previous control mirrors it, both
  overlap the frame edges, enter with a small horizontal motion and compress on
  tap. Chapter and by-paper picker cards now cycle orange, mint, blue, pink,
  purple and yellow accents; locked chapter cards retain a quiet tint instead
  of collapsing to one grey treatment.

- The Flutter ECON editor now follows the retained pre-zoom mobile reference
  at ECON commit `6e92ac2`. Demand, supply and shade form the first fixed tool
  row; price ceiling/floor and tax/subsidy occupy their own rows above the
  canvas. Undo, redo and reset remain in the header, while selected-object,
  shaded-area and delete controls render below the canvas. Zoom controls and
  the extra Flutter instruction footer were removed.
- The editor frame, 54dp header, 52dp tool buttons, grey separators, soft tool
  fills, graph padding and axis arrows match the legacy mobile metrics. Invalid
  tools disable until their curve prerequisites exist. Demand/supply lines now
  use clipped line segments, including quota and policy-family geometry, so
  no clamped horizontal tails appear at either end.
- A Y-axis guide remembers the pointer-down position with
  `DragStartBehavior.down`. Its horizontal dashed draft follows the finger
  immediately without publishing P/Q labels; releasing over a valid curve,
  equilibrium or market-gap target creates the matching P/Q guide. The same
  axis gesture now works for structured diagrams and stores curve anchors.
- Demand/supply shading again uses the legacy intersection-trace workflow:
  only axis, curve, guide, quota and price-control intersections become visible
  anchor dots; at least three distinct anchors are required; the completed
  polygon stays visible while the student chooses its economic label below the
  graph. Structured diagrams use the legacy choose-area, select-anchor,
  `3+`, clear and save flow.
- Area anchors are now serialized in both ordinary and structured diagram
  state. Each vertex retains its boundary IDs and is re-resolved after a curve
  moves, so shaded regions remain attached to their economic boundaries.
  Price-control annotations also follow the legacy two-stage presentation:
  PC/PF initially shows only the policy line; P/Qd/Qs and the shortage/surplus
  bracket appear after the student completes the Y-axis drag.
- Focused regressions cover pointer-down Y-axis guides, delayed guide commit,
  intersection-only shade tracing, post-trace area choice, anchor JSON
  round-trip and structured anchored guides. `flutter analyze` is clean and
  the full Flutter suite passes with 203 tests. A 390dp rendered preview was
  visually checked with D/S, E1/P1/Q1, Pc/P2/Qd/Qs and CS shading; controls and
  chart labels fit without overlap. Rebuild and install the debug APK on ASUS
  when `S2AIOC447307NGJ` reconnects, then smoke-test one D/S and one structured
  question on the physical touchscreen.
- Follow-up anchor-tuning pass restored the old hit tolerances (`0.08` for
  demand/supply and `0.12` for structured curves; Flutter had been too wide at
  `0.22`/`0.16`). Completed traces now deduplicate, remove near-duplicate
  endpoints and collinear detours, then use a convex hull capped at four
  vertices. Accidental concave or self-crossing regions therefore collapse to
  triangle, rectangle or trapezoid-style shapes. A focused regression covers a
  concave anchor detour.
- Follow-up ECON polish adds per-area fill colours, a repaint boundary for
  smoother curve drags, live green EQM draft guides, horizontal S1→S2 movement
  arrows (vertical arrows only for tax/subsidy), Chinese `短缺`/`盈餘` labels
  with numbered duplicates, sticker-style Check/Next controls, and animated
  left/right question navigation arrows centred at the screen edges. Focused
  diagram/practice tests remain green after this pass; rebuild/install the
  latest APK for the next ASUS visual smoke check.

 - Latest verification: full Flutter suite passes all 203 tests after the
   sticker-button, edge-navigation, draft-colour, movement-arrow, gap-label,
   and repaint changes. The debug APK was rebuilt and installed on ASUS
   `S2AIOC447307NGJ` with app data preserved; `MainActivity` resumed normally.

## ECON Diagram Contract And Practice Navigation — 2026-09-10

- The Flutter ECON diagram work now has a dedicated pure-Dart domain layer in
  `flutter_app/lib/features/econ/econ_diagram_domain.dart`. It serializes the
  reviewed legacy state contract (curves, P/Q points, equilibria, market gaps,
  areas, strokes, policies, and structured diagrams) into the payload expected
  by `gradeP2Answer`, including source geometry kept separate from student
  objects.
- `EconDiagramEditor` now supports demand/supply and the five structured kinds
  (`as-ad`, `money-market`, `trade-barrier`, `monopoly`, `ppf`) with source-seed
  overlay, continuation-safe geometry, curve selection/dragging, slope and
  label controls, equilibrium/axis guides, market-gap lines, policy supply
  shifts, quota sections, shaded traces, object deletion, undo/redo, zoom, and
  responsive compact-phone layout. The Y-axis drag is the guide creation
  gesture, matching the retained legacy editor; source objects render locked.
- ECON practice now preserves each question's draft while moving between
  questions, inherits a continuation diagram by `diagramContinuationKey`,
  requires both written text and a ready diagram when configured, and exposes
  previous/next arrow controls. Before checking, the bottom bar has separate
  `檢查答案` and `下一題`/`查看結果` actions; after checking it becomes the
  single `繼續`/`查看結果` action used by the legacy flow.
- The question loader no longer drops valid P2 records whose scored prompt is
  stored only in `parts[0].prompt`. Runtime policy inference now matches the
  legacy tax/subsidy and split-price rules, and visual reading order keeps
  scored prompt text after source visuals.
- Regression coverage includes the 597 published diagram experiences, all six
  diagram kinds, source/overlay payload separation, tax/subsidy split prices,
  quota geometry, P2 readiness, prompt-only records, dual answer controls,
  previous/next navigation, undo/redo, reference mode, and compact 320dp
  layouts. `flutter analyze` is clean and the full Flutter suite passes (196
  tests). ECON publication checks all pass, and the latest debug APK was built
  and installed on ASUS `S2AIOC447307NGJ` (`com.enguistics.dope_english`).
- The ASUS device was still on its secure lock screen during the final capture;
  startup logs showed normal Flutter/Impeller initialization with no fatal
  error. Unlock the phone for the remaining visual smoke check of one
  demand/supply and one structured P2 round before calling device verification
  complete. This pass is a substantial native parity foundation, but further
  fine-grained legacy structured behaviours and real-device checks remain.

For a concise current architecture and takeover checklist, start with
`PROJECT_HANDOVER.md`. This file remains the detailed chronological history.

## Vocabulary-First English And Meaning Deduplication (2026-09-10)

- Entering the English subject now opens the Vocabulary tab first, both on a
  normal launch and when switching back from ECON. Grammar and Workshop remain
  available from the existing bottom tabs.
- The live `teacherVocabLive` rows for `rather` were checked in the dedicated
  `enguistics-grammar-game` project and already contain `pos=adverb`. The bug
  was in the Grammar-platform synonym payload, which has no POS field and was
  being classified by spelling alone. Published/cached synonym candidates now
  resolve against the reviewed bundled A1 vocabulary bank before fallback
  inference, so `rather` shows `adv.` and `immense` shows `adj.`.
- Vocabulary senses are deduplicated at lookup, local/cloud restore, merge,
  import, synonym-save, and progress-sync boundaries. Overlapping rows such as
  `巨大的 / 大量的` plus another `巨大的` are folded into one sense, including
  existing student data after it is next loaded. The synonym popup also shows
  each linked English word only once across overlapping Grammar groups.
- Vocabulary MC choices now split multi-meaning glosses and reject distractors
  whose Chinese meaning overlaps the answer or another choice. Variants such
  as `巨大` and `巨大的` share one comparison key, so `tremendous`, `immense`,
  and `massive` cannot create duplicate-looking MC answers. If three fair,
  same-POS distractors are unavailable, the question becomes Spelling.
- `flutter analyze` is clean and all 173 Flutter tests pass. No Firebase write
  or deployment was required.
- The debug APK was rebuilt and installed with `adb install -r` on ASUS
  AI2401 H, preserving app data. The phone had ECON saved as its last subject;
  switching to `ENGLISH` opened Vocabulary directly. UI semantics confirmed
  the saved `rather (adv)` card and both `adv.` meaning rows. MainActivity
  remained resumed with no Flutter/fatal crash; only the existing non-fatal
  App Check provider warning appeared.
- After the display-label cleanup, the new debug APK was rebuilt and installed
  over the same ASUS device with data preserved. The device was on its secure
  lock screen during the final visual capture, so a post-cleanup screenshot
  could not be taken without Austin Sir unlocking the phone manually.

## Vocabulary Save Performance (2026-09-07)

- The native A1 BUDDY save path was compared directly with Battleship's
  `vocab_learning_bridge.js`. Battleship updates local storage/UI first and
  performs cloud work in the background; A1 BUDDY was still awaiting a
  Firestore rewrite of every saved word. Since Firestore writes were split
  into 450-document batches with a 15-second timeout, a large vocabulary bank
  could visibly stall for 15/30/45/60 seconds when one word was added.
- `CloudSyncedVocabStore` is now genuinely local-first. Add, delete, import,
  synonym, and review-progress saves return after local persistence, while the
  cloud queue writes only changed word documents or new tombstones. Unchanged
  cloud restores no longer rewrite the whole bank.
- Pending changes are coalesced by Firebase UID and normalized word. A newer
  update or delete supersedes an older queued action, failed deltas remain
  dirty for the next save, remote snapshots cannot discard pending local
  words, and listener application/disposal are serialized to avoid races.
- The fake cloud backend in `vocab_cloud_store_test.dart` now models
  incremental Firestore merges. Coverage includes a deliberately blocked
  cloud write with 600 existing words: local Save completes without waiting
  and the outgoing delta contains only the one new word. Migration,
  tombstones, offline retry, add/delete races, and listener races are also
  covered. `flutter analyze` is clean and all 167 Flutter tests pass.
- A debug APK containing the fix was built successfully at
  `flutter_app/build/app/outputs/flutter-apk/app-debug.apk` with the explicit
  local-test signing opt-in. ASUS was not visible to ADB, so this build has not
  yet been installed or timed on the physical phone.

## Lesson 12 Verb Table Info Sticker (2026-09-07)

- Lesson 12's Verb Table `i` controls now use the app's Japanese stationery
  sticker treatment: visible yellow fill, white edge, teal dashed surface, and
  a deeper yellow raised shadow. The main roadmap card and the in-lesson
  reference control both keep their original navigation behaviour.
- `flutter analyze` and the focused roadmap/Lesson 12 tests pass after the UI
  update.

## ECON Accent And Subject Switcher — 2026-09-07

- ECON section frames now accept a subject accent and use the orange palette
  for the main dashed frame, header title, settings seal, and glow; ENG keeps
  the original mint palette by default.
- The ECON bottom tab frame uses the orange border and a light khaki selected
  state, with orange glyph blocks matching the ENG tab layout.
- The edge subject switcher now shows a rounded UK flag for English and a coin
  badge for Economics. Its popup labels are `ENGLISH` and `ECONOMICS` in each
  subject's accent colour.
- ECON's accent is now a softer powder yellow-orange palette, and the switcher
  uses the supplied transparent PNGs at `assets/branding/united-kingdom.png`
  and `assets/branding/dollar.png` without an extra icon border.
- The ECON picker now leaves top breathing room for the first lesson tag and
  follows the legacy picker copy: no total-question or key-point subtitle;
  topic and paper rows show latest `啱` / `錯` progress from `questionStats`.
- ECON's primary accent is now the brighter pastel yellow-orange `#FFC067`
  family, with the supplied subject icons unchanged.
- ECON learning now mirrors the English Coach panel geometry and exposes a
  shared practice-count slider. The selected count is reused by concept,
  topic, and paper practice routes; ECON lesson and picker cards also share
  the English frame padding, ring, typography, and spacing metrics.
- ECON answer-choice controls now accept the same shared lesson accent API, so
  selected borders, panels, progress bars, and result frames stay in the ECON
  palette while ENG keeps its mint defaults.

## ECON Review Reorder And Subject Switcher — 2026-09-06

- ECON Concept Review reorder cards now use the same fixed-width TextPainter
  sizing as Grammar Quiz 01, including the flight target, so Chinese tokens do
  not expand to one full line each.
- The production app opens the last-used subject directly. A half-visible
  `ENG`/`ECON` edge tab opens the subject picker; ENG keeps three bottom tabs
  while ECON uses four: `學習`, `逐課操`, `逐份操`, and `排名`.
- The latest ASUS test APK was built with the existing debug certificate but
  could not be installed after the USB device disconnected. The currently
  installed ASUS build is the preceding debug build; reconnect the device
  before installing `flutter_app/build/app/outputs/flutter-apk/app-debug.apk`.
- ECON `學習` now opens a chapter menu first. Chapter 01 enters Concept Review;
  Chapters 02-25 and 29 are listed with yellow lesson tags and locked
  `即將推出` states until their content is published. `逐課操` and `逐份操`
  use the same yellow-tag lesson-card language.
- ECON leaderboard refreshes the Firebase Auth ID token before calling the
  A1 `getLeaderboard` callable and now surfaces login/permission/network errors
  separately instead of always showing a generic load failure.

## Release 0.1.1 (6) — 2026-09-04/05

- Version was bumped to `0.1.1+6`. `flutter analyze`, all 147 Flutter tests,
  and the full root Node/web/backend test suite passed before release builds.
- The signed Android AAB at
  `flutter_app/build/app/outputs/bundle/release/app-release.aab` is version code
  `6`, package `com.enguistics.dope_english`, and uses the accepted upload
  certificate SHA-1 `F1:01:21:7C:6C:41:41:F4:31:F1:BF:B4:DD:0A:00:8D:94:23:41:2E`.
  It was uploaded to Closed Testing Alpha at 100% and submitted to Google;
  Play Console confirmed **變更內容審核中**.
- TestFlight build `0.1.1 (6)` uploaded successfully at 16:46 on 4 September.
  App Store Connect Build Uploads showed `Complete`. Export compliance was
  answered accurately as `None of the algorithms mentioned above`: the app
  does not implement encryption algorithms; its SHA-256 use is only a cache
  filename digest and TLS/Keychain come from the OS/Firebase. The existing
  external group was selected, Traditional Chinese What to Test text was
  supplied, automatic tester notification remained on, and `Submit for Review`
  entered `Submitting` before the web session later expired.
- `ITSAppUsesNonExemptEncryption=false` is now recorded in iOS `Info.plist` so
  future builds do not ask the same export-compliance question. This plist
  declaration will take effect from the next build; build 6 was completed
  manually in App Store Connect.
- Store-console record names still show the historic `DOPE ENGLISH` name even
  though the installed build displays `A1 BUDDY`. Renaming the store listings
  is a metadata change separate from the uploaded build and remains pending if
  the console requires a new store version or fresh web authentication.

## A1 BUDDY Brand And Launch Intro (2026-09-04)

- The public app name is now `A1 BUDDY`; the grammar home pairs the
  `A1 EDUCATION` eyebrow with the `A1 BUDDY` title. Android launcher label,
  iOS display/bundle name, permission copy, login backdrop, retained web app,
  teacher console heading, and privacy-policy product references use the new
  public name.
- Launch uses Austin Sir's supplied `A1 EDUCATION / 100% HKU` raster logo from
  `/Users/macbook/Downloads/A1 logo 2024 print.png`. Optimized copies are kept
  under `flutter_app/assets/branding/`, Android `drawable-nodpi`, and the iOS
  `LaunchImage.imageset`.
- iOS first shows the A1 logo on white at the native launch layer. Android
  deliberately keeps the original pig app icon in its Android 12+ system
  splash per Austin Sir's decision, then hands off to the A1 logo animation.
  Flutter uses a white composition with a 1.45-second fade/slide/ease-out
  scale animation while SFX and the saved student session initialize, then
  cross-fades into login or the app shell.
- Update identity is deliberately unchanged: Dart package `dope_english`,
  Android package `com.enguistics.dope_english`, iOS bundle ID
  `com.enguistics.dopeEnglish`, Firebase project `enguistics-grammar-game`,
  signing keys, and all legacy `dope_*` local/secure-storage keys remain. This
  preserves store update eligibility and existing student data.
- App Store Connect and Google Play listing titles still need to be changed to
  `A1 BUDDY` when the next release is prepared. The existing square app icon is
  retained until a square A1 BUDDY icon is supplied or approved; the horizontal
  education-centre logo is unsuitable for automatic square cropping.
- Verification is clean: `flutter analyze`, all 147 Flutter tests, Android
  debug APK build, and unsigned iOS device build pass. APK inspection confirms
  launcher label `A1 BUDDY` with the original package ID; the built iOS app
  confirms display/bundle name `A1 BUDDY` with the original bundle ID. An ASUS
  cold-launch check showed the renamed home screen. The experimental A1 image
  in Android's circular system splash was removed after review, restoring the
  original pig icon before the Flutter A1 animation.
- The final Android debug APK was rebuilt and installed over USB on ASUS
  AI2401 H with app data retained. Timed cold-launch screenshots confirm the
  intended sequence: original pig system splash, then the sharp A1 Education
  logo growing on white. No app crash appeared in the checked logs.
- The signed iOS release build was installed wirelessly on the physical iPad
  Pro. Apple device inventory confirms `A1 BUDDY`, bundle
  `com.enguistics.dopeEnglish`, version `0.1.1` build `5`. Automatic launch was
  denied only because the iPad had locked after installation; the app itself
  is installed and can be opened after unlocking.

## Vocabulary Note Photo Import (2026-09-04)

- The native Vocabulary `上傳筆記` action now offers three Japanese
  stationery-style choices: `拍攝相片`, `從相簿選取`, and `瀏覽檔案`.
- Camera and gallery images are converted into the existing
  `VocabImportFile` upload contract and continue through the same secure upload,
  OCR, AI analysis, shared teacher-bank lookup, and save-to-vocabulary steps.
- iOS already contains the required camera and photo-library purpose strings;
  the `image_picker` plugin is now included in the Flutter app dependencies.
- `flutter analyze`, the full Flutter test suite (146 tests), and
  `flutter build ios --no-codesign` all pass after this change.

## Vocabulary Crayon Reveal (2026-09-04)

- In the Vocabulary book's `只顯示中文` study mode, the English word now
  keeps its first letter visible while the remaining letters stay under the
  coloured crayon mask. Tapping the crayon reveals the full word.
- Crayon reveals now play `SfxCue.step` through the screen's injected SFX
  mixer, so the feedback is consistent with the rest of the vocabulary UI and
  remains testable.
- Vocabulary screen tests cover the reveal interaction and injected SFX.
- Debug APK rebuilt with the local-only debug signing opt-in and installed over
  USB on ASUS AI2401 H (Android 16 / API 36), version code `5`. The real
  device showed the `Chi` mode with first-letter hints and the full word after
  tapping the crayon; `MainActivity` remained resumed with no app crash.

## Release 0.1.1 (5) — 2026-09-03

- Version was bumped from `0.1.1+4` to `0.1.1+5` in
  `flutter_app/pubspec.yaml`.
- Flutter verification completed successfully: `flutter analyze` clean and
  all 145 tests passing.
- Android App Bundle was built and signed with the dedicated DOPE ENGLISH
  Play upload key at
  `flutter_app/build/app/outputs/bundle/release/app-release.aab`.
- Google Play Closed Testing Alpha now contains version `5 (0.1.1)`. The
  release was submitted on 3 September 2026 and is currently shown as
  **變更內容審核中** (under review). It is a 100% rollout to the existing
  Alpha tester group; no new developer account or key was created.
- iOS IPA at `flutter_app/build/ios/ipa/DOPE ENGLISH.ipa` was uploaded to App
  Store Connect successfully and is processing. Third-party dSYM warnings
  were non-blocking.

This is the operational handoff for moving development to another Mac or a new
Codex conversation. Read this file together with `AGENTS.md` and
`PROJECT_BRIEF.md` before changing the product.

## One-Minute Summary

- Product: A1 BUDDY (formerly DOPE ENGLISH), a native-first English learning app for Hong Kong
  students in a light Japanese stationery / sticker style.
- GitHub: `https://github.com/tuan0974316576-glitch/basic-grammar.git`
- Main native app: `flutter_app/` (Flutter for iOS and Android).
- Legacy/reference app: root HTML/JavaScript plus Capacitor. Keep it working;
  do not delete it until native parity is complete.
- Firebase project: `enguistics-grammar-game`. Never move real student data
  back to the Battleship Firebase project.
- ECON is now being merged into the same A1 BUDDY Flutter app and Firebase
  project. A1 Functions now deploy `gradeP2Answer`,
  `aggregateEconPracticeAttempt`, and `getLeaderboard`; reviewed ECON P2
  marking data lives in `functions/p2-grading-data.json` and its marker logic
  in `functions/econ-grading.js`.
- Grammar lesson source of truth: `grammar_data.js`. The Lesson 12 Verb Table
  reference is imported from the original Basic Grammar Game bank in
  `grammar_verb_table_data.js`.
- Reviewed vocabulary master: Grammar Game files, especially
  `teacher_vocab_bank.js`, `teacher_vocab_manual_updates.json`, and
  `vocab_sense_bank.js`.
- Current native milestone: Grammar Lesson 01-13 plus Quiz 01 are playable.
- ECON native milestone: Game Hub subject/mode routing, Concept Review, P1/P2
  topic/year pickers, reviewed ECON question bank, source visuals/tables, and
  a requirements-driven native diagram editor are in `flutter_app/`.
- A1 Firebase backend merge completed on 2026-09-06. The three ECON callables
  are ACTIVE in `asia-east2`; P1/P2 attempts use `users/{uid}/attempts` and
  stats are derived server-side. ASUS installation is pending because no ADB
  device was connected during the merge verification.
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

Current verified native toolchain on the new Mac is Flutter 3.47.1, Dart
3.13.1, Temurin JDK 17, Android Studio 2026.1, Android SDK platforms 36 and
37.0, CocoaPods 1.16.2, and Xcode 26.6. The app currently compiles against API
36. Keep `flutter_secure_storage` on 10.3.1 for now:
version 11 hard-codes `compileSdk = 37`, but Google's stable, beta, and canary
SDK channels currently publish `platforms;android-37.0`, not the distinct
Gradle package ID `platforms;android-37`. Do not rename or symlink 37.0 to 37.
Upgrade the plugin only after the real `platforms;android-37` package exists
and an Android build passes.

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
| `grammar_verb_table_data.js` | Basic Grammar Game's complete Lesson 12 reference bank |
| `grammar_verb_table_image_manifest.js` | Verb Table image mapping shared by web and Flutter export |
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

Edit the grammar source files, then regenerate Flutter JSON:

```bash
npm run flutter:export-grammar
```

Generated files are `flutter_app/assets/data/lesson_01.json` through
`lesson_13.json`, `quiz_01.json`, and `verb_table_reference.json`. Commit the
source and generated JSON in the same commit. `lesson_12.json` remains the
100-row practice bank; `verb_table_reference.json` contains the complete
282-row Basic Grammar Game reference bank and is sorted by present form.

Teacher-provided Verb Table replacement images are imported in small batches
from a local folder with:

```bash
npm run grammar:import-verb-images -- "/path/to/verb_table_image"
npm run flutter:export-grammar
```

The importer creates 600px JPEG assets under both
`assets/grammar-verbs/teacher/v1/` and
`flutter_app/assets/grammar-verbs/teacher/v1/`, updates the shared manifest,
and removes superseded images that are no longer referenced. For the two
homonyms, `lie.png` maps to `lie / lied / lied / lying` (說謊), while
`lie(2).png` maps to `lie / lay / lain / lying` (躺).

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
| Lesson 12 practice | 100 verb rows |
| Lesson 12 reference | 282 verb rows |
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
- Lesson 12 illustrated Verb Table, responsive phone/tablet layout, Search,
  alphabetical reference rows, the complete 282-row Basic Grammar Game bank,
  bundled audio where available, and shared audio fallback. Lesson practice
  still uses a short randomized round from the 100-row exercise bank.
- Native vocabulary lookup from offline shards, spelling suggestions,
  multi-meaning selection, one-row-per-word saved list, date grouping,
  expandable examples, and word/example pronunciation.
- The vocabulary custom keyboard follows the original English Grammar Game
  dock: an opaque full-width white sheet at the bottom of the window with
  pastel crayon keycaps. Q/A/Z rows are centred and use the same alphabet-key
  width (the shorter rows leave equal side margins). While it is open the three
  main app tabs are hidden; Android back dismisses it. Tapping the `English
  word` field plays the supplied `click_english_words.mp3`; each typed key
  continues to use `type.mp3`. The shared widget is also used by Vocabulary
  Spelling, Lesson 02 correction, Lesson 11 tense answers, Lesson 12 Verb Table
  forms, and Grammar Workshop answer fields; answer-entry variants add a
  rightmost `✓` submit key beside the Space row. Keyboard labels explicitly
  use `ChironGoRoundTC`; every key has a short press-down scale/translate
  animation with matching shadow compression. Answer fields disable platform
  spell-check underlines so no stray yellow underline appears while entering
  text. A new APK was built after the Lesson 11 hint update, but ASUS was
  disconnected during the reinstall attempt; reconnect before the next
  physical smoke check.
  On the Vocabulary home, a pointer outside the keyboard (including a list
  scroll/tap) dismisses the dock immediately and restores the three tabs.
- Native vocabulary training now matches the original mixed stage loop:
  Reading and Listening four-choice questions alternate with Spelling input,
  with automatic listening audio, keyboard Done submission, feedback, score,
  and answer progress saved back to the local vocabulary row.
- Bundled audio first; missing audio uses Firebase Function + Azure generation,
  shared Firebase Storage, and local device cache.

### Partial or placeholder

- Native saved vocabulary is now local-first with per-student Firestore sync.
  `CloudSyncedVocabStore` restores and merges `users/{uid}/vocabItems` after
  Firebase login, scopes local preferences by Firebase UID, migrates the old
  unscoped local list once, retries cloud writes after offline failures, and
  listens for remote changes. Deletes are represented by `deletedAt` tombstone
  documents because the deployed Firestore rules intentionally disallow direct
  deletes. `SharedPreferencesVocabStore` remains available for unauthenticated
  test shells only.
- Native example lookup now calls the shared `lookupVocabExamples` callable and
  uses the same sense-aware `vocabExampleCache` as Battleship, with bundled
  shards as the offline fallback.
- Awards tab is a placeholder.
- Profile shows the logged-in student and logout, but has no detailed stats.
- Roadmap top counters are visual sample values, not live XP/streak data.
- Lesson completion/First Try results are not yet persisted into the native
  player profile or Firestore.
- Scan dictionary/photo OCR is not yet merged into Flutter.
- Notifications, leagues, daily goals, streak freeze, teacher dashboard, and
  speaking assessment remain future work.

## Recommended Next Development Order

1. Add a tested native player/progress repository: local-first grammar attempts,
   lesson mastery, XP, streak, and queued Firestore sync.
2. Replace the roadmap's sample counters and lesson states with real progress.
3. Finish native vocabulary persistence per student and Firestore sync, keeping
   guest/student caches isolated.
4. Extend the native vocabulary trainer with sentence ordering and speaking
   prompts, then connect its progress to the per-student Firestore sync.
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

## Native Original UI Port (2026-08-25)

The native Flutter shell now uses the original Basic Grammar Game visual
language from the retained web source (`index.html` / `style.css`):

- `flutter_app/lib/features/grammar/original_grammar_home.dart` contains the
  native home screen, Coach panel, practice-count slider, yellow lesson pills,
  dashed stationery cards, three-tab bar, and Scan placeholder.
- `flutter_app/lib/main.dart` keeps the existing Flutter lesson screens,
  repositories, Firebase login, vocabulary page, and Verb Table reference, but
  routes them from the original-style native shell.
- `flutter_app/test/widget_test.dart` covers the native shell, lesson and Quiz
  navigation, Verb Table reference, and a 320x568 compact-phone layout.

This is a true iOS/Android Flutter UI, not a WebView wrapper. The following
checks passed after the port:

```text
flutter analyze
flutter test (73 tests)
flutter build apk --debug
flutter build ios --no-codesign
```

The iOS artifact requires the normal Xcode signing team before device install
or TestFlight upload. No Firebase deployment was made for this UI-only task.

## Grammar Question Admin (2026-08-25)

There is now a teacher-only question-bank console at:

`https://enguistics-grammar-game.web.app/grammar-admin`

The existing vocabulary console remains at:

`https://enguistics-grammar-game.web.app/teacher-vocab`

The grammar console uses the existing Teacher ID + PIN flow and requires the
Firebase Auth custom claim `role=teacher`. It loads the canonical Lesson 01-13
banks from `grammar_data.js`, lets the teacher edit one normal form-based
question at a time (Chinese, English, answer, choices, explanation, or Verb
Table forms as appropriate), search and navigate questions, add/delete
questions, and supports separate Save Draft and Publish actions. Teachers do
not need to see or edit JSON. Drafts are stored in
`grammarQuestionDrafts/{lessonId}`; published banks are stored in
`grammarQuestionBanks/{lessonId}`.

Published banks are protected by the deployed Firestore rules: signed-in
students can read only published banks, while only teacher-role accounts can
write draft or published documents. The rules were released on 2026-08-25.

Native Flutter repositories now check the matching published bank first and
fall back to the bundled JSON asset after a timeout, while offline, or when a
published bank is missing/malformed. This keeps the app usable if Firebase is
unavailable. The mapping and validation helper lives in
`grammar-question-bank.js`; the native reader is
`flutter_app/lib/features/grammar/grammar_question_bank_service.dart`.

Hosting and rules were deployed to `enguistics-grammar-game`. No question
content was changed or published during the initial deployment; the console
starts from the current bundled banks.

## ASUS Android Smoke Check (2026-08-25)

The debug APK was installed on the connected ASUS AI2401 H (Android 16,
serial `S2AIOC447307NGJ`) and the app launched successfully. Teacher login
with the configured teacher account reached the native app shell. During the
manual check, the device showed the bottom tab bar but the selected page
content could render blank after tab/login transitions. The app shell was
hardened by replacing the three-child `IndexedStack` with a selected-tab
builder, so only the active Grammar, Vocabulary, or Scan page is built. A
widget test now verifies that switching Scan -> Grammar keeps the page content
visible.

The ASUS USB/ADB connection was disconnected before the hardened APK could be
reinstalled. Reconnect the phone and run:

```bash
cd flutter_app
adb install -r build/app/outputs/flutter-apk/app-debug.apk
adb shell monkey -p com.enguistics.dope_english 1
```

The native login screen was then updated to match the original Basic Grammar
Game login treatment: a centred white teal-dashed frame, yellow `Student
Account` label, yellow status panel, cream paper inputs, and yellow pill login
button. The updated debug APK was installed on ASUS and verified after clearing
the test app data; no student/Firebase data was deleted.

After the ASUS login smoke check showed the bottom tabs moving into the middle
of the screen after sign-in, the native shell was hardened again: successful
login now explicitly dismisses the keyboard, and the authenticated `AppShell`
uses `resizeToAvoidBottomInset: false` so the main Grammar/Vocabulary/Scan
content is not compressed by the login IME transition. Flutter analyze and all
74 Flutter tests pass. The rebuilt APK is ready at
`flutter_app/build/app/outputs/flutter-apk/app-debug.apk`.

The final ASUS re-install is pending a fresh Wireless debugging pairing. The
previous pairing endpoint/code expired and the device is currently not visible
to ADB. Use ASUS Settings -> System -> Developer options -> Wireless debugging
-> Pair device with pairing code, then provide the fresh `IP:pairing-port` and
six-digit code before claiming the post-login screen is verified again.

The next USB investigation captured the exact cause of the apparent blank
pages: `OriginalTabBar` was receiving the full Scaffold height (914 logical
pixels) and the Scaffold body was receiving `h=0.0`. The tab strip now has an
explicit 76 logical pixel height, and a widget test asserts that the tab bar is
finite while the Grammar home body remains non-zero. This fixes all three tabs
at the layout level rather than relying on login timing.

## Native Original Tab and Vocabulary Polish (2026-08-25)

The native Flutter shell now matches the original tab language more closely:

- Settings uses the teal gear seal with white circular face and shadow.
- Bottom tabs use the original `文`, `字`, and `查` glyphs inside teal icon
  squares, with the yellow selected state.
- Vocabulary header now has the original `VOCABULARY / 詞彙本` title, settings
  seal, yellow dumbbell review button, and in-panel `已加入 / 待溫習` stats.
- Vocabulary's entry panel is kept in one stable widget tree while the input
  is focused, so Android does not rebuild it and dismiss the keyboard.
- `flutter_app/test/vocab_screen_test.dart` checks that the native text field
  keeps focus after tapping.

The current USB ASUS connection disappeared while building the latest APK, so
the final physical-device install of this polish is pending reconnection. The
latest APK was built at `flutter_app/build/app/outputs/flutter-apk/app-debug.apk`.

The original asset files `assets/setting-2.png` and `assets/dumbbel.png` are
now bundled in Flutter and used directly for the native settings and training
buttons. Vocabulary is wrapped in the same full stationery frame as the
original web `vocab-home-screen`, and the entry field remains in a stable tree
while the Android keyboard is open. A USB ASUS smoke check after the final
asset/header build showed the corrected Grammar and Vocabulary pages with no
Flutter red error; the only filtered log noise was ASUS audio calibration
warnings.

Grammar, Vocabulary, and Scan now use the single shared native shell in
`flutter_app/lib/core/widgets/original_section_frame.dart`. It owns the outer
frame dimensions, border radius, padding, title baseline, and the exact
original settings seal placement. Grammar and Vocabulary therefore no longer
draw slightly different frames or settings buttons, and Grammar scrolls only
its lesson list inside the fixed frame. Scan keeps the original web behaviour
of having no settings button, while using the identical frame geometry. A
widget regression test compares the frame rectangles across all three tabs and
the settings-button rectangles across Grammar and Vocabulary.

The native Vocabulary home now follows the retained `style.css` selectors
directly instead of using approximate Material controls. The stat/input panel,
word rows, progress badge, teal `例` button, red `×` button, expanded amber
dashed examples panel, individual white example cards, and the bottom tabs use
the original CSS dimensions and colors. Native tap states reproduce the
original raised/depressed VFX, while the word row highlights with the original
soft teal background and teal dashed border. The extra native-only speaker icon
inside each example was removed; the full white example card is the sentence
audio tab, so the underlined English and Chinese text do not need separate
click handling. The add button
is now always present and disabled in the same grey state as the original when
no meaning is selected. `OriginalDashedSurface` in
`flutter_app/lib/core/widgets/stationery_frame.dart` is the shared painter for
these non-screen controls, preventing solid-border drift.

After this parity pass, `flutter analyze`, all 78 Flutter tests, and the Android
debug build passed. The APK was installed on the USB-connected ASUS AI2401 H.
Physical screenshots confirmed the collapsed and expanded Vocabulary states,
including three loaded example cards and the corrected pale-yellow selected
Vocabulary tab.

## Original Motion Assets (2026-08-26)

The retained web source and its Git history were audited before changing native
motion assets. Contrary to the earlier assumption that every header control was
a Lottie file, the verifiable originals are:

- Settings: `assets/setting-2.png`, an Inkscape-authored 128x128 PNG added in
  commit `05156c16`. Both Grammar and Vocabulary use the byte-identical file in
  Flutter. The original 420ms / 145-degree gear rotation now runs while the
  Settings sheet is open.
- Vocabulary Training: `assets/dumbbel.png`, an Inkscape-authored 128x128 PNG
  added in commit `1c84ad48` when the earlier inline SVG was replaced. Flutter
  uses the byte-identical PNG with the original raised/pressed button motion.
- Lessons / Quiz: `assets/confetti.json` is the actual original Lottie. All
  native Lesson 01-13 and Quiz 01 success/completion overlays now render this
  asset through the Flutter `lottie` package. The separate hand-painted Flutter
  particle implementations in Lesson 01, Lesson 02, and Quiz 01 were removed.
- Study streak: the original `STREAK_FIRE_LOTTIE_DATA` embedded in
  `assets/streak-fire-animation.js` was extracted without redesign into
  `flutter_app/assets/lottie/streak-fire.json`; the native reusable widget is
  `OriginalStreakFireAnimation` in `lesson_ui.dart` for the later persisted
  streak screen.

The installed legacy iPad app (`com.enguistics.grammar`), its readable WebKit
cache, all reachable Git objects, the Mac filesystem, and a focused LottieFiles
search were checked. No separate Settings, Lesson-card, or Training Lottie JSON
exists in the available source, so those PNG controls must not be relabelled as
Lottie or replaced by an unverified lookalike. Tests validate both Lottie JSON
files, render both Flutter Lottie widgets, and compare the native Settings and
Training PNG hashes against the retained web originals.

The Flutter APK built from this motion pass is approximately 277 MB in debug
mode because it bundles the Lottie renderer and original JSON assets. Release
builds should be used for TestFlight / Play Store distribution.

## Native Vocabulary Cloud Lookup (2026-08-26)

The native Vocabulary screen previously queried only the generated local shards
under `flutter_app/assets/data/vocab/`. This meant a teacher-live word such as
`macaroni` (present in Firebase `teacherVocabLive` as `macaroni-noun-d09b937542`
with meaning `通心粉`) was invisible even though the web/Battleship mechanism
could find it. `CloudVocabLookupRepository` now follows the Battleship order:

1. Read signed-in `teacherVocabLive` by exact normalized `word` and, when
   available, `aliases array-contains`.
2. Use non-disabled teacher rows as the student-facing result, preserving POS,
   type, display, and source metadata.
3. Fall back to the generated local teacher/curated/supplement shards when the
   cloud is unavailable, unauthenticated, malformed, or times out.

Cloud teacher examples are also read from `teacherExamples` / `examples` when
present, with local reviewed examples as fallback. The existing
`ensureVocabAudio` callable remains the Battleship-compatible audio path: local
manifest first, then shared Firebase Storage generation/download for missing
word or example audio. Added tests cover cloud-first `macaroni` resolution and
offline fallback. The ASUS USB device disconnected before this final cloud
lookup APK could be reinstalled; reconnect it for a physical `macaroni` smoke
check.

## Native Vocab Audio Reconciliation (2026-08-26)

Native audio now follows Battleship commit `86eede3d` rather than waiting for
the student to tap every word. `VocabAudioRepository` exposes separate
`hasAudio` (local-only, no network) and `ensureAudio` (download/cache only,
never playback) operations. `VocabAudioReconciler` starts after the authenticated
AppShell restores the local My Vocab list, then processes all saved words first
and all sense-specific example sentences second. It skips bundled or persistent
cache hits, deduplicates in-flight downloads, yields between requests, pauses
when the app backgrounds or connectivity reports offline, resumes on foreground
or online, and schedules a 31-minute retry after temporary failures. The cache
uses `getApplicationSupportDirectory()/vocab-audio/v1`, which survives normal
app updates and is recreated automatically after uninstall, data clearing, or
device migration.

`AppShell` owns one shared `VocabController`, audio repository, and reconciler
so switching Grammar/Vocabulary/Scan cannot dispose an active background pass.
The shared Firebase `ensureVocabAudio` callable and `asia-east2` Storage remain
the single source for generated word/example MP3s. Tests cover ordering,
existing-audio skips, no-playback background ensures, pause-safe reconciliation,
cache reuse, and the cloud example/meaning paths. Full per-user Firestore My
Vocab item sync remains a separate future milestone; this pass guarantees that
every locally restored My Vocab item receives the same shared audio treatment.

## Native Vocabulary Playback VFX and Hit Targets (2026-08-26)

The native Vocabulary screen now keeps the original short teal raised-surface
feedback while audio starts. Tapping a saved word's main row plays word audio
and briefly applies the original soft-teal fill, teal dashed border, lifted
surface, and deeper pale-teal shadow. Tapping an expanded example's full white
example tab plays that sentence and applies the same restrained active state;
the English and Chinese sentence text are presentation only, so students do
not need to aim at the text. The example tab is intentionally the only sentence
audio hit target, preventing a sentence tap from also triggering the word row.

Source of truth: `flutter_app/lib/features/vocabulary/vocab_screen.dart` and
`flutter_app/test/vocab_screen_test.dart`. Verified with `flutter analyze
lib/features/vocabulary/vocab_screen.dart`, `flutter test
test/vocab_screen_test.dart`, and the full `flutter test` suite (91 tests).
The debug APK was rebuilt and installed over USB on ASUS AI2401 H
(`S2AIOC447307NGJ`, Android 16 / API 36); `MainActivity` launched and no
Flutter fatal error appeared in logcat.

## Native Vocabulary Training Parity (2026-08-26)

The Flutter review route now follows the retained web trainer instead of the
old single-mode meaning quiz. Each round selects up to ten saved words using
the same unseen/weak-word priority and assigns the original repeating stage
pattern: `reading`, `listening`, `spelling`. Reading and Listening render four
large dashed choices; Listening shows the yellow replay button and auto-plays
the word when the question opens. Spelling shows the Chinese meaning, opens the
native Latin keyboard, and accepts the keyboard Done action. All answer states
use the original pale-teal/yellow stationery treatment, reveal the correct
meaning, advance with `下一題`, and finish in the same-page score state with
`Full marks!` on a perfect round. Completed answers update the saved row's
`totalSeen` / `totalCorrect` counters through `VocabController`.

Source of truth: `flutter_app/lib/features/vocabulary/vocab_review_controller.dart`,
`flutter_app/lib/features/vocabulary/vocab_screen.dart`, and the two
`vocab_review_*_test.dart` files. `flutter analyze` and the full Flutter suite
pass with 94 tests.
The debug APK was rebuilt at `flutter_app/build/app/outputs/flutter-apk/app-debug.apk`.
The ASUS USB device disconnected immediately before the first install attempt;
after reconnecting, the latest APK was installed successfully and
`MainActivity` launched without a Flutter fatal error in logcat.

## Native Lesson UI Parity (2026-08-26)

All native grammar lesson routes now use the retained web lesson visual system:
the white stationery frame with teal dashed border, `< Menu` lesson header,
teal progress bar and `Q n/total` badge, paper prompt panels, yellow raised
primary actions, dashed answer controls, amber feedback panels, and the same
result-panel layout. The shared treatment covers Lesson 03-13 and the common
correction/Verb Table screens; Lesson 01, Lesson 02 and Quiz 01 were brought
onto the same frame, header, prompt, feedback, action-button, and result
styles. Compact-phone spacing was tightened where necessary without changing
question behaviour or native keyboard flows.

Source of truth: `flutter_app/lib/features/grammar/shared/lesson_ui.dart` and
the lesson-specific screens under `flutter_app/lib/features/grammar/`.
Verified with `flutter analyze`, the full Flutter suite (94 tests), a rebuilt
debug APK, USB installation on ASUS AI2401 H (`S2AIOC447307NGJ`, Android 16 /
API 36), and a successful `MainActivity` launch.
The final pass also moved Lesson 06-12 text-entry fields onto the same white
paper/dashed-border input treatment; the rebuilt APK was reinstalled on ASUS
after that change and launched cleanly.

## Quiz 1 Original Layout Refinement (2026-08-26)

Quiz 1 now uses its dedicated retained-web composition rather than the generic
lesson status treatment. The screen keeps the teal dashed prompt, independent
grey dashed answer line, yellow dashed word bank, teal-highlighted selected
word blocks, and a full-width yellow `確認` action. The yellow sound control
and the `FIRST TRY / STREAK / BEST` strip are intentionally absent per the
reference layout request. Tests explicitly cover those removals and the
yellow word-bank/full-width confirm geometry.
The latest debug APK is built at
`flutter_app/build/app/outputs/flutter-apk/app-debug.apk`; ASUS disconnected
again immediately before this final install attempt, so reconnect
`S2AIOC447307NGJ` before the next physical Quiz 1 smoke check.

The latest Quiz 1 word-block pass keeps the APK build current, but ASUS was
not connected during the final install retry; reconnect the device before the
next physical smoke check.

## Quiz 1 Word Block Classification (2026-08-26)

Quiz 1 word blocks are now narrow, natural-width pills rather than full-width
rows. They wrap inside the yellow word bank. The answer line remains a grey
dotted guide; selected blocks fly upward into it with a short motion and keep a
white fill plus their classification dash color. Classification colors are
noun = yellow, verb = green, adverb = blue, and other words = purple. The
latest APK was rebuilt after this animation/color pass.
ASUS was subsequently reconnected; the APK installed successfully over USB,
`MainActivity` launched, and no Flutter fatal error appeared in logcat.
The final flight fix measures every pill from its rendered text, uses a bounded
wrap so multiple pills share each row, keeps the dotted answer guide painted
behind selected pills, and animates a loose overlay from the tapped bank
position to the answer line. This avoids the earlier full-screen constraint
that enlarged the flight pill. ASUS install time was verified as
`2026-08-27 10:17:03` after this fix.
The follow-up destination fix reserves an invisible pill at the exact next Wrap
slot and flies directly to that measured position, eliminating the interim
center stop and final snap. The 10:39 APK contains this fix; ASUS disconnected
before the first install attempt. It was later installed successfully; ASUS
reports `lastUpdateTime=2026-08-27 10:59:27`, and `MainActivity` launched cleanly.
The final landing refinement removes the answer pill's second entrance tween,
moves the grey dotted guide to the bottom of the answer area, and keeps pills
above it with spacing. A regression test verifies that the completed pill
occupies the exact placeholder coordinate with no post-flight jump. The 11:23
APK was installed on ASUS with `lastUpdateTime=2026-08-27 11:24:42`.

## Main Menu Lesson Card Position (2026-08-26)

The Main Menu lesson cards now center their title/meta content vertically in
the dashed card and move the yellow Lesson label upward so its center sits on
the card's top dashed border instead of hanging too low. Widget tests pass,
and the rebuilt APK was installed and launched on ASUS AI2401 H.

The lesson label is now slightly shorter vertically with extra breathing room
before the title. Quiz 1 word-block dashed borders use layered, lightly offset
strokes to restore the original crayon-like underline feel; the updated APK was
also installed and launched on ASUS.

## Native Game SFX Mixer and First-Tap Reliability (2026-08-27)

`AppSfx` now uses the cross-platform SoLoud C++ game mixer from
`flutter_soloud`, not `audioplayers.AudioPool`. ASUS logging proved that the old
pool still created `USAGE_MEDIA` players and requested/abandoned audio focus per
short cue. After roughly three seconds of idle, AudioFlinger or a Bluetooth
A2DP route could enter standby; a 100-175ms click/step cue then finished while
the route was still waking, so the first tap was silent and quick repeats were
audible.

The app now initializes one 48kHz stereo shared SoLoud stream before `runApp`,
preloads every playable cue (including the previously omitted `step.wav`) into
memory, permits 32 overlapping voices, and reuses that mixer for the whole app
session. Shared/non-MMAP mode and a 2048-frame buffer are intentional: they add
a small buffer latency but preserve the complete short sound while Android or
Bluetooth wakes, instead of dropping its first frames. `audioplayers` remains
only for longer word/example playback and as an emergency SFX fallback if the
native mixer cannot initialize.

The supplied `correct.mp3` and `wrong.mp3` replace the old generated WAV cues.
Lesson result pages play the supplied
`result_over80percent.mp3`, `result_60to80percent.mp3`, or
`result_below60percent.mp3` according to the final percentage. The MP3 assets
live under `flutter_app/assets/audio/sfx/` and are included by the Flutter asset
directory declaration.

The final APK was installed on ASUS AI2401 H with
`lastUpdateTime=2026-08-27 15:17:43`. Cold-start logs show one shared AAudio
stream opened without MMAP and left in `state=started`. Repeated physical tests
after 15-second idle periods on the three Vocabulary sort buttons produced no
new focus request, focus abandon, route reopen, AAudio disconnect, fallback
player, or Flutter error. `flutter analyze` and all 112 Flutter tests pass;
`flutter_app/test/app_sfx_test.dart` locks the complete preload contract,
single initialization, playback ordering, volume, and failure isolation.

## Device Orientation Policy (2026-08-27)

The app root now applies a professional game-style orientation policy using
the standard 600dp shortest-side breakpoint: phones lock to `portraitUp`, while
tablets allow only `landscapeLeft` and `landscapeRight`. The policy is
centralised in `flutter_app/lib/main.dart` and covered by
`flutter_app/test/orientation_lock_test.dart`; Android/iOS platform manifests
leave the supported orientations available for this runtime decision.

## Original Settings And Lesson Start Modals (2026-08-27)

The Material bottom sheets for Settings and roadmap lesson details have been
removed. Both now use the retained original web modal hierarchy through
`flutter_app/lib/core/widgets/original_modal.dart`: blurred/dimmed backdrop,
centred white stationery panel, yellow raised kicker, teal title, red raised
close button, and a thin grey dashed header divider. Border hierarchy is
deliberate and tested: the outer modal uses a 4px teal dashed stroke, inner
content/volume panels use 2px teal dashed strokes, and the grey divider/volume
track use 2px fine dashes.

Settings reproduces the original `Settings / 設定` layout with a 50% default,
percentage label, custom dashed track and raised teal thumb, `Log out`, and the
Enguistics Learning Centre 2026 footer. Volume persists in SharedPreferences
under `dope_english_master_volume_v1`, controls the SoLoud global game-SFX mix,
and also applies to word/example `audioplayers` playback. Lesson start uses the
same modal frame, with the lesson label, title, a pale-teal 2px dashed details
panel, and a full-width raised yellow `開始課堂` command.

Verified with `flutter analyze`, all 123 Flutter tests, Android debug build,
and physical ASUS screenshots of Settings and Lesson 02. The APK was installed
with `lastUpdateTime=2026-08-27 23:11:36`; both modals fit portrait without
overflow and logcat contained no Flutter fatal or missing-plugin error.

## Cross-Lesson Stationery Feedback (2026-08-28)

All grammar lesson feedback now uses the same compact Japanese stationery
treatment. The shared `LessonFeedbackCard` in
`flutter_app/lib/features/grammar/shared/lesson_ui.dart` is a white or pale
yellow paper panel with a thick state-coloured dashed border, a small
check/cross icon, and a separate white teal-dashed correct-answer panel. A
correct answer uses the yellow stationery palette and a 4px outer border, so
the green Tick remains the accent instead of filling the whole feedback card.
Lesson 01, Lesson 02, and Quiz 01 custom resolved panels were brought onto the
same hierarchy, and the Lesson 01/Lesson 02/correction correct-versus-wrong
controls use white backgrounds, coloured icons, and matching 5px dashed
borders. Question banks, word-bank colours, and lesson behaviour are unchanged.

Verification on 2026-08-28: `flutter analyze` passed; the focused grammar UI
tests and the complete Flutter suite passed (`126 tests`); and
`flutter build apk --debug` produced
`flutter_app/build/app/outputs/flutter-apk/app-debug.apk`. ASUS AI2401 H
(`S2AIOC447307NGJ`) was reconnected and the latest APK installed successfully
at `2026-08-28 01:43:06`; `MainActivity` cold-launched cleanly and the sampled
logcat contained no Flutter fatal or missing-plugin error. The MetSys palette
experiment was reverted after review: only the dedicated Tick `#8ED8B8` and
Cross `#F68BA2` tokens remain; all other app and web palette tokens are back to
the original values.

## Immediate Grammar Progress (2026-08-28)

Grammar progress is now stored locally per student (or the `guest` profile)
through `flutter_app/lib/features/grammar/grammar_progress_controller.dart`.
Each Lesson 01-13 and Quiz 01 screen reports its `questionCorrect` event to the
controller immediately, so leaving a lesson through Menu keeps every correct
answer in the roadmap count. The roadmap reads the stored values instead of
hard-coded zeroes; for example, a saved Lesson 03 value changes from `3/30` to
`5/30` after two correct questions even if the round is not completed. Values
are clamped to each published lesson total and student profiles are isolated.

Verification: `flutter analyze` passed; the complete Flutter suite passed with
`130 tests`; the debug APK built successfully. The latest APK is
`flutter_app/build/app/outputs/flutter-apk/app-debug.apk`. ASUS
`S2AIOC447307NGJ` disconnected during the latest install retry, so reconnect
it before the next physical progress persistence smoke check.

## Native Vocabulary Note Import (2026-08-27)

The Flutter Vocabulary home now has three equal controls on one row: `已加入`,
`待溫習`, and the yellow `上傳筆記` action on the right. Tapping import opens the
native multi-file picker directly. It accepts PDF, JPEG, PNG, WebP, and TIFF,
with the Battleship limits of 12 files, 25 MB per file, and 50 MB total.

The complete import path is split across
`flutter_app/lib/features/vocabulary/vocab_import_repository.dart`,
`vocab_import_dialog.dart`, `vocab_import_models.dart`, and
`functions/vocab-import.js`. Files upload privately to
`vocab-imports/{uid}/{jobId}/`; the app follows live Firestore job status through
`users/{uid}/vocabImportJobs/{jobId}` and shows all five stages: secure upload,
document OCR, AI analysis, cloud vocab bank, and one bulk save to My Vocab.
Temporary uploads and job status are deleted defensively after success or
failure.

Unlike Battleship, this port never depends on Battleship RTDB or its student
data. The backend uses Dope English's dedicated `enguistics-grammar-game`
project, matches extracted headwords against reviewed `teacherVocabLive`
entries, and may preserve a Chinese meaning visibly present in the uploaded
note. Missing meanings are resolved client-side through the existing reviewed
cloud/local lookup order; AI is not allowed to invent or translate a missing
student-facing meaning. `VocabController.bulkUpsertImported` deduplicates by
word and sense, merges existing rows, writes the complete batch with one store
save, and rolls back the whole batch if that save fails.

`processVocabImport` is live in `asia-east2` with a 540-second timeout, 2 GiB
memory, and concurrency 4. Firestore and Storage rules were deployed to
`enguistics-grammar-game`; Cloud Vision and Vertex AI APIs were enabled there.
The callable is ACTIVE and its unauthenticated probe correctly returns
`UNAUTHENTICATED`. Tests cover file validation, owned Storage paths, prompt
selection rules, bulk merge/rollback, direct picker launch, all five progress
stages, result counts, and compact 320x568 portrait layout.
Final verification passed with `flutter analyze`, all 105 Flutter tests,
`npm test`, `npm run check:js`, a vulnerability-free production dependency
audit for `functions/`, and an Android debug APK build. The latest APK was
installed on ASUS AI2401 H and verified with
`lastUpdateTime=2026-08-27 14:08:38`. A real signed-in note import completed all
five stages and moved the local vocab count from 34 to 92 (58 detected/imported
headwords in that document), preserving phrases, POS, and Chinese meanings.
The three-control row and progress modal were visually checked on the physical
portrait phone with no clipping or overlap. After completion, the student's
`vocab-imports/` Storage prefix contained zero temporary objects and the
Firestore import-job subcollection contained zero documents. No Flutter fatal
error or missing-plugin error appeared in logcat. The device currently logs the
existing non-fatal `No AppCheckProvider installed` warning; App Check
enforcement is disabled, while Firebase Auth and owner-only Storage rules are
active and were exercised by the successful import.

## Native My Vocab Sorting And Flashcards (2026-08-27)

The Vocabulary entry panel now starts 30 logical pixels higher, leaving a fixed
five-button toolbar between entry and the saved list. It ports Battleship's
behaviour but deliberately uses the Dope English stationery style rather than
its dark sci-fi appearance: pale-teal rounded History, A-Z, and Shuffle icon
buttons; a small divider; pale-purple `En` and `Chi` buttons; and the existing
raised yellow selected state.

History sorts by newest update/create time, A-Z uses normalized English
headwords, and every Shuffle tap generates a different order with a short icon
spin and staggered row entrance. `En` hides only Chinese meanings under a
native-painted crayon mark while leaving POS visible; `Chi` hides the English
headword. Every mask is one thick crayon stroke, with width following the real
text and thickness following its text height; it no longer renders parallel
two/three-line stripes. Rows deterministically cycle through
yellow/green/blue/purple/pink crayons, and tapping a mask reveals only that word
card. Tapping the active language button again returns to the normal bilingual
list. Sorting or changing language resets reveals and closes expanded examples,
matching Battleship's interaction contract. The `上傳筆記` stat tile now places
its text above the upload icon as requested.

`flutter analyze` and all 112 Flutter tests pass. The debug APK was installed
on ASUS AI2401 H with `lastUpdateTime=2026-08-27 15:28:23`. Physical portrait
screenshots verified the five-button row, A-Z order, both crayon directions,
per-card reveal, stable row geometry, and no clipping. Logcat contained no
Flutter fatal or missing-plugin error.

## Native Grammar Workshop And Battleship Sync (2026-08-27)

The third bottom tab is now `研 / 研修`; the old `查 / Scan` placeholder is no
longer routed from the app shell. Workshop uses the Dope English light Japanese
stationery style and presents the published Battleship grammar topics as a
compact two-column grid. Topic cards are short horizontal tiles with a bare
colour icon on the left and Chinese/English names on the right. They do not
show per-topic counts, white icon boxes, a visible sync status row, or a manual
refresh button. Sync is automatic and invisible to students.

Battleship remains the live source of truth through its intentionally public,
published-only Realtime Database paths:

- `grammarBank/public/manifest`
- `grammarBank/public/topics`

`GrammarWorkshopRepository` reads the small manifest whenever the tab opens.
It downloads the 1.3 MB topic payload only when the release changes, validates
every manifest count and Battleship FNV-1a content hash, then writes the release
under Application Support for offline use. An invalid/incomplete release is
rejected. The last valid cache is preferred over the bundled fallback. The
runtime never reads Battleship drafts, student records, or private paths.

The bundled fallback is generated from the current published release with:

```bash
npm run flutter:export-battleship-grammar
```

Source: `scripts/export-battleship-grammar-flutter.js`.
Generated asset: `flutter_app/assets/data/battleship_grammar_topics.json`.
Current release `v2-mtfvjjqm` contains 19 published topics and 4,120 entries,
including 241 published DSE synonym groups. A repository test simulates
publishing one
additional Battleship question, verifies that Dope advances to the new release,
and verifies that the new question survives an offline restart from cache.

`GrammarWorkshopPracticeController` and `grammar_workshop_screen.dart` share
five render paths: Verb Table, fill, choice, rearrange, and synonym. Rounds use
up to ten questions. Fill supports multiple slots and accepted alternatives;
Verb Table accepts slash-separated variants; rearrange supports duplicate
tokens, distractors, and published alternative token sequences. Unlike
Battleship's end-only debrief, each submit locks the current answer and
immediately shows correct/incorrect state, the correct answer, a Cantonese-
friendly topic teaching point, and the question's specific explanation. Only
then is Next enabled.

Verified with `flutter analyze`, all 121 Flutter tests, `npm run check:js`,
exporter regeneration, and an Android debug APK build. ASUS showed the online
19-topic/4,120-entry release and a real Tenses wrong answer immediately
displayed the explanation and correct answer. That complete functional build
was installed at `2026-08-27 16:30:40`. The subsequent student-facing compact
horizontal cards, hidden background sync, no refresh control, no counts, and
bare icons also pass the full suite. The current APK was installed on ASUS
AI2401 H with `lastUpdateTime=2026-08-27 22:50:37`; `MainActivity` cold-started
successfully and logcat contained no Flutter fatal or missing-plugin error.

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

## Store Submission Status (2026-08-30)

- Icon pack from `/Users/macbook/Downloads/dope english` is integrated into
  Flutter iOS/Android, legacy web/PWA, and Capacitor resources. The source pack
  is archived under `store_assets/dope-english-icon-pack/`.
- Privacy policy is live at `https://enguistics-grammar-game.web.app/privacy.html`.
  On 2026-08-29 it was expanded with a dedicated account/data deletion section
  covering the request route, identity check, deleted data categories, partial
  deletion, and 30/90-day handling periods, then redeployed to Firebase Hosting.
- iOS App Store Connect app record `DOPE ENGLISH` exists (Apple app ID
  `6806440842`). Apple rejected the first upload path with missing
  `NSLocationWhenInUseUsageDescription`, `NSPhotoLibraryUsageDescription`, and
  `NSCameraUsageDescription` purpose strings. Those keys are now present in
  `flutter_app/ios/Runner/Info.plist` with clear Traditional Chinese copy.
  A fresh release IPA was built on 2026-08-30 as version `0.1.1`, build `3`:
  `flutter_app/build/ios/ipa/DOPE ENGLISH.ipa`. The archive embeds all three
  purpose strings and passed plist validation. Flutter also reports the older,
  non-blocking default launch-image placeholder warning. Transporter delivered
  build 3 successfully; it is ready for internal testing in TestFlight.
- Google Play app `DOPE ENGLISH` exists under package
  `com.enguistics.dope_english` (app ID `4974394013301134066`). Login details
  for reviewer access were saved using the confirmed test account `S001` and
  PIN `1234`. Closed Testing Alpha now contains build `0.1.1 (3)`, uploaded
  with the original DOPE Play upload key. Hong Kong is selected and the
  existing `battleship tester` email list remains attached.
- Google Play store listing text is saved as a draft. The 512x512 Play icon,
  `store_assets/google-play-feature/cropped.jpeg` (1024x500), and two 1080x1920
  phone screenshots (`lesson-01.jpeg` and `quiz-01.jpeg`) are uploaded,
  attached to the listing, and saved. A third prepared Vocabulary screenshot
  remains local but is not required for the listing's two-screenshot minimum.
- Google Play app-content declarations are complete: IARC content rating was
  submitted with `austinau99@gmail.com` (all-ages / PEGI 3 style ratings),
  target audience is 9-12, ads are declared absent, Data Safety is saved, and
  the app category is Education. Public store contact email is
  `austinau99@gmail.com`; website is `https://enguistics-grammar-game.web.app`.
- Closed Testing Alpha release `0.1.1 (3)` (version code `3`) passed Play's
  automatic checks and is shown as provided to Google Play testers. The first
  tester opt-in is visible in Play Console. The release still requires at least
  12 opted-in testers for the later production-access step.
- Immediate next step: verify build `0.1.1 (3)` appears in TestFlight. No
  Google Play upload-key reset is required.

## Store Submission Attempt (2026-09-02)

- Version remains `0.1.1`; build/version code was incremented to `4` in
  `flutter_app/pubspec.yaml` for the next store uploads.
- A signed Android AAB was built at
  `flutter_app/build/app/outputs/bundle/release/app-release.aab` using the
  existing Play upload keystore and alias. The Play Console browser session
  was signed in as `tuan0974316576@gmail.com`, which currently opens the
  developer-account signup page rather than the existing DOPE ENGLISH app;
  do not create a second developer account. Reopen Play Console with the
  account that owns `com.enguistics.dope_english`, then upload the AAB to
  Closed Testing Alpha.
- A signed iOS IPA was built at `flutter_app/build/ios/ipa/DOPE ENGLISH.ipa`
  and uploaded with `xcodebuild -exportArchive` to App Store Connect. Apple
  reported `Upload succeeded` and `Uploaded package is processing` for build
  `0.1.1 (4)`; no further upload is needed, only processing/TestFlight
  availability verification.

## Store Submission Attempt (2026-09-02, build 5)

- `flutter_app/pubspec.yaml` is now `0.1.1+5` for the launch/suggestions
  release.
- iOS IPA build `0.1.1 (5)` was uploaded successfully to App Store Connect
  with `xcodebuild -exportArchive`; Apple reports that the package is
  processing. The missing third-party framework dSYM warnings are
  non-blocking and did not prevent upload.
- Android release AAB was built and signed with the existing Play upload key at
  `flutter_app/build/app/outputs/bundle/release/app-release.aab`. Closed Test
  upload is still blocked because the active Play Console session is
  `tuan0974316576@gmail.com`, which has no developer account and opens the
  signup page. Do not create a second account; sign in with the existing DOPE
  ENGLISH owner account before uploading to Closed Testing Alpha.

## Vocabulary Suggestions And Launch Screen (2026-09-02)

- Suggested Words now uses a stationery sticker panel with a yellow title tag,
  pastel rounded word stickers, coloured crayon edges, and a short press
  animation instead of Material `ActionChip` styling.
- Android launch resources are forced to white in both light and dark resource
  variants. Authentication is resolved before the first Flutter frame so the
  separate DOPE ENGLISH loading transition no longer flashes after the native
  splash screen.
- The debug APK containing this change was installed on ASUS AI2401 H and
  launched successfully. Full Flutter tests and analysis passed.
- After the follow-up launch/splash adjustments, the latest debug APK was
  rebuilt and installed on ASUS AI2401 H as version code 4 at 16:43:31; the
  app launched without a Flutter fatal error. The Play/TestFlight release
  build remains the separately signed `0.1.1 (4)` artifact.

## Native Per-Student Vocabulary Sync (2026-08-30)

`CloudSyncedVocabStore` now mirrors the Battleship saved-vocabulary contract in
the native Flutter app without creating another Firebase project. Authenticated
students use the existing `enguistics-grammar-game` Firebase project and sync
to `users/{uid}/vocabItems/{wordId}`. Local preferences are scoped by Firebase
UID, while the previous unscoped `dope_english_vocab_items_v1` list is migrated
once into the first signed-in student's scope and then uploaded. Login restores
the cloud snapshot, merges newer local and remote senses/progress, and starts a
Firestore listener so another device's changes appear automatically. Saves are
local-first and queued for retry when offline. Deletes use `deletedAt` tombstone
documents because the deployed rules disallow direct deletes.

`flutter_app/test/vocab_cloud_store_test.dart` covers restore, first-login
migration, tombstones, remote updates, and offline retention. `flutter analyze`
and the full Flutter suite (139 tests) pass. New release artifacts containing
the sync feature are:

- Android AAB: `flutter_app/build/app/outputs/bundle/release/app-release.aab`
  (`0.1.1` build `3`, signed with the original Play upload key and accepted
  by Closed Testing Alpha)
- Android release APK for direct ASUS installation:
  `flutter_app/build/app/outputs/flutter-apk/app-release.apk` (`0.1.1` build `3`)
- iOS IPA: `flutter_app/build/ios/ipa/DOPE ENGLISH.ipa` (`0.1.1` build `3`,
  delivered through Transporter)

The Android update was signed with the existing Play upload key. Play accepts
the SHA1 `F1:01:21:7C:6C:41:41:F4:31:F1:BF:B4:DD:0A:00:8D:94:23:41:2E` and
SHA-256 `35:05:42:82:BF:0B:AE:CB:D4:1B:D1:63:A4:D3:DA:76:E6:84:EF:DD:BE:60:8C:5F:16:30:5B:DD:FC:8B:27:CE`.
The keystore is stored at `/Users/macbook/.config/enguistics/dope-english-upload.keystore`
with its password in Keychain service `dope-english-play-upload`; do not commit
either secret.

The Android Gradle release build now fails closed when the DOPE upload-key
environment is absent. A debug-signed release is only possible with the
explicit local-only opt-in `DOPE_ALLOW_DEBUG_SIGNING=true`, so a Play upload
cannot silently repeat the previous signing mistake.

## Vocabulary Synonym Link (2026-08-30)

The native vocabulary screen now follows Battleship's saved-word flow: after a
word is added, it checks the reviewed Battleship synonym groups and opens a
cute stationery dialog after a short delay. Candidates are resolved against
the same local reviewed vocabulary bank, with a conservative `dse-synonym`
fallback for the small number of words not present locally. All candidates
start selected, already-saved words are marked, and the student can skip or
save the remaining linked words; saves use the normal local/cloud vocab store.

Source and exporter:

- Battleship source: `/Users/macbook/battleship-1/synonym_data.js`
- Export command: `npm run flutter:export-synonyms`
- Generated asset: `flutter_app/assets/data/vocab/synonym_groups.json`
- Flutter implementation: `flutter_app/lib/features/vocabulary/vocab_synonym_repository.dart`
  and `vocab_synonym_dialog.dart`

The synonym repository and automatic post-save dialog are covered by the
Flutter vocabulary tests. The cloud-store merge also preserves cloud-only
tombstones so an offline device cannot resurrect a deleted word.
When the Grammar platform publishes a `DSE_SYNONYM` topic, the native app
checks the same public `battleship-game-c0909` manifest/topics endpoints on the
first vocabulary lookup, adopts the newer published group set, and stores it
under Application Support for offline use. Release `v2-mtfvjjqm` now includes
the published 241-group DSE topic, including `ramp up` and `accelerate` with
the shared meaning `加速`.
After this change, a local debug APK was rebuilt successfully with the
explicit `DOPE_ALLOW_DEBUG_SIGNING=true` opt-in at
`flutter_app/build/app/outputs/flutter-apk/app-debug.apk`; this local artifact
has not been uploaded to Play or TestFlight.

## Vocabulary Review MC Rules And Typing SFX (2026-08-30)

Vocabulary Reading and Listening MC questions now use only saved vocabulary
items in the same POS bucket (`noun`, `verb`, `adjective`, `adverb`, or
`other`). A bucket needs at least four distinct saved words and four distinct
Chinese meanings; otherwise the would-be MC slot becomes a Spelling question.
MC choices contain Chinese meanings only, without POS labels. Spelling prompts
show the first letter of the saved word, and every editable text field in the
app (login, vocabulary lookup, spelling, grammar answers, Verb Table search,
and Workshop answers) plays the bundled `flutter_app/assets/audio/sfx/type.mp3`
through `SfxCue.type`. The type cue uses a dedicated low-latency `AudioPool` so
rapid keystrokes do not stop or overwrite one another.

The synonym-link dialog keeps its stationery popup animation. Relevant
coverage is in `flutter_app/test/vocab_review_controller_test.dart`,
`vocab_review_screen_test.dart`, `vocab_screen_test.dart`, and
`app_sfx_test.dart`.
The debug APK was rebuilt with `DOPE_ALLOW_DEBUG_SIGNING=true` at
`flutter_app/build/app/outputs/flutter-apk/app-debug.apk`. The ASUS device was
reconnected, the APK was installed, and the vocabulary custom keyboard was
opened successfully. A real ASUS key tap produced `[AppSfx] type cue requested`,
`[AppSfx] type pool played`, and `[AppSfx] type mixer call returned` in logcat.
The final verification pass reports `flutter analyze` clean and all 143 Flutter
tests passing.

## Vocabulary Meaning Dedupe (2026-09-10)

The active Firebase `teacherVocabLive` bank was audited and cleaned in the
dedicated `enguistics-grammar-game` project. Active entries went from 4,615 to
4,599: 16 redundant entries were soft-disabled with `replacedBy`, preserving an
audit trail because Firestore rules do not allow hard deletes. The cleanup
keeps different POS and true different senses; it removes exact duplicates and
meanings that are strict subsets of a fuller meaning in the same word/POS/type
group. The final live snapshot reports zero exact or subset duplicates.

The bundled `teacher_vocab_bank.js` was rebuilt from the existing bank with the
same conservative rule and now contains 6,383 entries. The cleaned bank was
also synced to `/Users/macbook/battleship-1` and the shared-vocab dry-run was
clean (12 files unchanged after sync).

Root cause: manual updates can contain an old single-sense row and a later
merged multi-sense row, while the old cloud sync only uploaded the new
meaning-based document ID and did not disable the old document. The reusable
dedupe logic is in `scripts/vocab-meaning-dedupe.js`; local rebuild and teacher
live sync now apply it before writing. The live dry-run/write command is:

```bash
node scripts/clean-teacher-live-vocab.js --input private_exports/teacher_live_vocab_snapshot.json
node scripts/clean-teacher-live-vocab.js --input private_exports/teacher_live_vocab_snapshot.json --write
```

The command is dry-run by default. It treats `/`, comma, and Chinese list
punctuation as meaning separators, strips stray surrounding quote marks for
dedupe comparison, and keeps the cleaner / fuller entry. Private snapshots and
dedupe receipts remain under `private_exports/` and must not be committed.

## Shared Study Streak And Notifications (2026-09-18)

The first retention release is implemented across English and ECON. Flutter
owns shared streak state under `lib/features/streak/`, while Cloud Functions
owns the authoritative Hong Kong date, idempotency, streak, best-day, Freeze,
and milestone calculations. The four live notification/streak functions and
Firestore rules are deployed to `enguistics-grammar-game` in `asia-east2`.

Notification permission is user initiated from Settings. FCM tokens are stored
server-side under each user, and the scheduled reminder checks completion before
sending at 18:30 or, for an at-risk existing streak, 20:30 HKT. Android and iOS
builds pass. Verify the Firebase APNs key before the first physical iPhone push
test, and accept the ASUS ADB authorization prompt before installing the rebuilt
debug APK. See `PROJECT_HANDOVER.md` for exact files, deployed function names,
test status, and the isolated pre-existing ECON diagram test failure.

## Teacher Live Lookup Cache Fix (2026-09-19)

The Teacher Vocab Console correctly wrote `bald / adjective / 禿頭 / A2` to
`teacherVocabLive`; the missing result came from native
`CloudVocabLookupRepository` retaining a completed empty/failed Future forever.
The repository now keeps only in-flight request coalescing, caches confirmed
empty results for three seconds and successful rows for one minute, and never
caches network failures. Focused cloud lookup and Vocabulary UI tests pass, and
the regression proves a word added after an empty lookup becomes visible in the
same repository/app session.

The Vocabulary entry panel also shows an animated `激情搜尋中...` status for
the full duration of a meaning lookup. Three dots cycle without changing the
row width, and `AnimatedSize` removes the row cleanly after the result arrives.
The focused widget test uses a deliberately delayed `bald` result and verifies
the loading state is replaced by `adj. 禿頭`.

## Notification Preferences And Delivery V2 (2026-09-19)

The notification system now has four independent category preferences, a
student-selected HKT start time (default 18:30), three 90-minute ordinary slots,
one evening streak-risk slot, seven-day template dedupe, milestone/weekly
delivery, and a server-only social outbox. Token refresh and logout both clean up
the prior token. Permission prompting is deferred until three completed rounds
and a two-day streak, with an in-app offer before the OS prompt.

The live Scheduler runs every 15 minutes. Firestore's
`notificationTokens.enabled` collection-group index is deployed and `READY`.
An FCM v1 smoke notification was posted and opened successfully on ASUS, where
the four-colour Settings panel and 18:30 selector also render correctly. Firebase
Console still shows no APNs key/certificate for the iOS app; Apple Developer
sign-in and an APNs authentication key are required before iOS push can work.

## Full-Screen Streak Celebration (2026-09-21)

Streak updates now show through a root `OverlayEntry`, which fixes the previous
route-layering bug where only the top-right day badge changed after a practice
route completed. The full-screen overlay plays fire, optional Freeze ice, and
milestone confetti; milestone days also show one deterministic happy monster
from `assets/lottie/monsters/`. This follows Duolingo's official milestone
pattern of celebrating with a full-screen character/power-up transformation.

The complete Flutter suite passes 283 tests after restoring conditional custom
keyboard insertion for Vocabulary review. Build/install the next arm64 debug
APK on ASUS before asking Austin Sir to inspect the 3-day milestone in person.

The streak calendar panel no longer shows a confusing `Freeze 1/2` inventory
row. It uses blue ice markers for frozen dates and reserves the Chinese
`火焰已凍結，連續學習繼續保持` message for an actual Freeze recovery
celebration. The red circular close sticker sits on the dashed frame corner and
the header copy is centered.
