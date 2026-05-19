# Vocab Conqueror - Native App Build Guide

## Prerequisites
- Node.js installed
- Xcode (for iOS) - requires macOS
- Android Studio (for Android)
- Apple Developer Account (for iOS)
- Google Play Developer Account (for Android)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Build for iOS

#### First Time Setup:
```bash
npm run build:ios
```

This will:
- Add iOS platform
- Sync web files to iOS project
- Open Xcode automatically

#### In Xcode:
1. Select your Team (Apple Developer Account) in Signing & Capabilities
2. Change Bundle Identifier if needed: `com.enguistics.vocabconqueror`
3. Connect your iPhone or use Simulator
4. Click Run (▶️) button

#### Subsequent Builds:
```bash
npm run sync
npx cap open ios
```

### 3. Build for Android

#### First Time Setup:
```bash
npm run build:android
```

This will:
- Add Android platform
- Sync web files to Android project
- Open Android Studio automatically

#### In Android Studio:
1. Wait for Gradle sync to complete
2. Connect your Android device or use Emulator
3. Click Run (▶️) button

#### Subsequent Builds:
```bash
npm run sync
npx cap open android
```

## App Store Submission

### iOS (App Store Connect)
1. In Xcode: Product → Archive
2. Upload to App Store Connect
3. Fill in app metadata, screenshots
4. Submit for review

### Android (Google Play Console)
1. In Android Studio: Build → Generate Signed Bundle/APK
2. Upload AAB to Google Play Console
3. Fill in app metadata, screenshots
4. Submit for review

## Key Features Enabled
- ✅ Auto keyboard popup (native behavior)
- ✅ Full screen support
- ✅ Dark status bar
- ✅ Splash screen
- ✅ Keyboard resize handling
- ✅ Offline support (PWA features)

## Troubleshooting

### iOS Keyboard Not Showing
- Make sure `contentInset: "always"` is set in capacitor.config.json
- Check that input elements have proper focus handling

### Android Build Errors
- Update Android Studio to latest version
- Check Gradle version compatibility
- Clear cache: `cd android && ./gradlew clean`

## File Structure
```
battleship/
├── index.html              # Main game file
├── capacitor.config.json   # Capacitor configuration
├── package.json            # Dependencies
├── ios/                    # iOS native project (generated)
└── android/                # Android native project (generated)
```

## Notes
- Web files are in root directory (index.html, CSS, JS, assets)
- Native projects are generated in `ios/` and `android/` folders
- After updating web files, run `npm run sync` to update native apps
- Firebase configuration is already in index.html
