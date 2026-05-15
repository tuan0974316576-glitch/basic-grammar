# Capacitor Mac Handoff

Last updated: 2026-05-15 Asia/Hong_Kong

## Goal

Build the Capacitor iOS app and test native audio on iPad/iPhone.

The latest pushed commit should be:

```bash
3d18e49 Add Capacitor native audio adapter
```

## First Steps On MacBook

Open Terminal or VS Code terminal inside the `battleship` repo:

```bash
git pull origin main
git log -1 --oneline
npm install
```

Confirm the latest commit is `3d18e49`.

## Create iOS Project

Run:

```bash
npx cap add ios
npm run native:audio-assets
npx cap sync ios
npx cap open ios
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
