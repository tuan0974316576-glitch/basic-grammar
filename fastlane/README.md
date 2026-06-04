fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Android

### android play_validate_key

```sh
[bundle exec] fastlane android play_validate_key
```

Check that the Google Play service account JSON can access Play Console

### android play_upload

```sh
[bundle exec] fastlane android play_upload
```

Upload the current signed AAB to Google Play Console

### android play_build_and_upload

```sh
[bundle exec] fastlane android play_build_and_upload
```

Build a signed release AAB, copy it to build/android-play, then upload it

### android play_upload_screenshots

```sh
[bundle exec] fastlane android play_upload_screenshots
```

Upload store screenshots to Google Play Console

----


## iOS

### ios testflight_build_upload

```sh
[bundle exec] fastlane ios testflight_build_upload
```

Build a release IPA and upload it to TestFlight

### ios appstore_upload_screenshots

```sh
[bundle exec] fastlane ios appstore_upload_screenshots
```

Upload store screenshots to App Store Connect

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
