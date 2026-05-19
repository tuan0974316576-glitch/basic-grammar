# Capacitor Mac Handoff

Last updated: 2026-05-15 Asia/Hong_Kong

## Goal

Build the Capacitor iOS app and test native audio on iPad/iPhone.

The latest pushed commit should be:

```bash
8332c6c Add Capacitor Mac handoff notes
```

## First Steps On MacBook

Open Terminal or VS Code terminal inside the `battleship` repo:

```bash
git pull origin main
git log -1 --oneline
npm install
npm run native:web-assets
```

Confirm the latest commit is `8332c6c`. If you see `3d18e49`, pull once more; that commit has the native audio adapter, and `8332c6c` adds these Mac handoff notes.

## Create iOS Project

Run:

```bash
npm run native:web-assets
npx cap add ios
npm run native:audio-assets
npx cap sync ios
npx cap open ios
```

Shortcut:

```bash
npm run build:ios
```

`npm run native:audio-assets` copies BGM/SFX files into:

```text
ios/App/App/sounds
```

The native audio plugin needs those files there.

## If iOS Project Already Exists

Use:

```bash
npm run native:sync
npx cap open ios
```

`www/` is generated from the shared web code and is ignored by git. Edit the root files, then run `npm run native:sync` before opening Xcode again.

## Xcode Test

In Xcode:

1. Select the connected iPad/iPhone as the run target.
2. Set the Apple Developer Team if Xcode asks.
3. Press Run.

## What To Test

- BGM starts after entering the game.
- BGM does not restart on every tap/click.
- SFX clicks feel faster than the web/PWA version.
- Code List and Stage Vocab List make BGM quieter.
- Listening and Speaking answer screens make BGM quieter.
- Leaving those screens restores BGM volume.

## Notes

- Web/PWA still uses browser audio fallback.
- Capacitor native app uses `@capacitor-community/native-audio`.
- Do not create a separate copy of the game code. This repo uses one shared codebase with a native audio adapter.
