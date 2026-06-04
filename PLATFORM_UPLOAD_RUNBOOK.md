# Platform Upload Runbook

Use this when uploading English Conqueror to TestFlight or Google Play test tracks.

Last known successful upload:
- Date: 2026-06-01
- iOS: version 1.0.3 build 30 uploaded to TestFlight
- Android: version 1.0.3 versionCode 22 uploaded to Google Play track `TESTING`

## Important Ruby/Fastlane Note

Do not run plain `bundle exec fastlane` from this machine. `/usr/bin/bundle` uses the system Ruby 2.6 and fails because `Gemfile.lock` requires Bundler 4.0.9.

Use rbenv every time:

```sh
rbenv exec bundle exec fastlane ...
```

Known working local toolchain:

```sh
rbenv exec ruby -v
rbenv exec bundle -v
```

Expected:
- Ruby 3.2.2
- Bundler 4.0.9

Fastlane may warn that Ruby 3.2 support is going away. That warning did not block uploads.

## Before Uploading

Run from repo root:

```sh
cd /Users/macbook/battleship-1
```

If uploading a new binary, bump build numbers first:

Android:
- File: `android/app/build.gradle`
- Increment `versionCode`
- Keep `versionName` unless intentionally releasing a new app version

iOS:
- File: `ios/App/App.xcodeproj/project.pbxproj`
- Increment every `CURRENT_PROJECT_VERSION`
- Keep `MARKETING_VERSION` unless intentionally releasing a new app version

Quick check:

```sh
rg -n "versionCode|CURRENT_PROJECT_VERSION|MARKETING_VERSION" android/app/build.gradle ios/App/App.xcodeproj/project.pbxproj
```

Run relevant syntax checks for files changed. For grammar/data JS, this was enough:

```sh
node --check ui-grammar.js
node --check grammar_conditional_data.js
node --check grammar_conditional_extra_data.js
node --check grammar_conditional_more_data.js
```

## TestFlight Upload

Command:

```sh
rbenv exec bundle exec fastlane ios testflight_build_upload
```

This lane already does:
- `npm run native:sync`
- web asset sync into Capacitor
- native audio asset sync
- iOS pod install / patch
- IPA archive and export
- TestFlight upload with App Store Connect API key

Successful output should include:

```text
Successfully exported and signed the ipa file:
build/ios-testflight/EnglishConqueror.ipa
Successfully uploaded package to App Store Connect.
Successfully uploaded the new binary to App Store Connect
```

Because `skip_waiting_for_build_processing` is enabled, the build may take a few minutes to appear in App Store Connect after upload finishes.

## Android Internal Test Upload

Use this for Google Play Internal Testing:

```sh
PLAY_TRACK=internal PLAY_RELEASE_STATUS=completed rbenv exec bundle exec fastlane android play_build_and_upload
```

Successful output should include:

```text
BUILD SUCCESSFUL
Successfully finished the upload to Google Play
```

## Android Closed Test Upload

Use this for the existing Closed Test track named `TESTING`:

```sh
PLAY_TRACK=TESTING PLAY_RELEASE_STATUS=completed rbenv exec bundle exec fastlane android play_build_and_upload
```

Important: the track name is uppercase `TESTING` in this Play Console setup. Previous successful upload used this exact value.

Successful output should include:

```text
@version_code=22
Updating track 'TESTING'
Successfully finished the upload to Google Play
```

## What The Android Lane Does

The Android lane already does:
- `npm run native:sync`
- web asset sync into Capacitor
- native audio asset sync
- app icon/store asset generation
- signed release AAB build
- copies AAB to `build/android-play/EnglishConqueror-android-latest.aab`
- uploads that AAB to the chosen Play track

Do not manually upload an old AAB unless the user explicitly asks. The safest path is always `play_build_and_upload` after bumping `versionCode`.

## Common Failure

If this appears:

```text
Could not find 'bundler' (4.0.9) required by Gemfile.lock
bundler requires Ruby version >= 3.2.0
```

The command used system Ruby. Retry with:

```sh
rbenv exec bundle exec fastlane ...
```

