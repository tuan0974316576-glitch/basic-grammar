# DOPE ENGLISH Flutter app

This directory is the native iOS and Android app. The existing HTML/Capacitor
app remains the behavioural reference and the source of truth for grammar and
reviewed vocabulary content while migration continues.

Current native coverage:

- Student ID + PIN login with automatic device-session restoration.
- Grammar roadmap with Lesson 01-13 and Quiz 01 playable.
- Offline vocabulary lookup, multi-sense selection, saved word list, examples,
  spelling suggestions, bundled audio, and Firebase/Azure audio fallback.
- Awards and profile shell; cloud progress, SRS quiz flow, achievements, and
  scan dictionary are not complete yet.

Read `../DEVELOPMENT_HANDOFF.md` before continuing development.

## Run

Install Flutter, then from this directory:

```bash
flutter pub get
flutter run
```

From the repository root, `./scripts/bootstrap-new-mac.sh` checks the required
tools and installs Node and Flutter dependencies without handling private
credentials.
