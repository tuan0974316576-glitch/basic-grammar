# Audio Handoff Log

Last updated: 2026-05-14 Asia/Hong_Kong

## Current Focus

Pause L3 listening warmup for now. Work on the iOS audio lag/silence issue first, then resume L3.

## Firebase / Azure Status

- Firebase project: `battleship-game-c0909`
- Function: `speakingApi`
- Function URL: `https://asia-east2-battleship-game-c0909.cloudfunctions.net/speakingApi`
- Cloud Run URL: `https://speakingapi-m3nllrk67a-df.a.run.app`
- Audio bucket: `battleship-game-c0909-verb-audio`
- Azure secrets are configured:
  - `AZURE_SPEECH_KEY`
  - `AZURE_SPEECH_REGION`

## Listening Audio Manifest Status

- `listening_audio_manifest.js`
- L1 complete: 1179 audio URLs
- L2 complete: 1959 audio URLs
- L3 partial: 1306 audio URLs out of 2640 listening rows
- Total manifest entries currently in workspace: 4444

There are local uncommitted audio-progress changes:

- `listening_audio_manifest.js`
- `listening_audio_failed_l3.json`

These were created while testing L3 after commit `da2a213`.

## Relevant Commits

- `da2a213 Warm partial L3 listening audio manifest`
  - Version `v0.88p`
  - L3 partial manifest committed at 1301 entries
  - Saved a failed list for L3
- `c75698b Report Azure speech cancellation details`
  - Deployed `speakingApi`
  - Function now returns Azure cancellation details
  - Warm script now records `azure` details into failed rows

## L3 Problem Found

The L3 failures are Azure throttling, not bad sentences, not wrong voices, and not SSML corruption.

Observed Azure detail:

```text
cancellationErrorCode: ConnectionFailure
cancellationErrorDetails: Unexpected server response: 429
```

Meaning: too many TTS requests / rate limited.

## Four Listening Voices

The game rotates these 4 voices:

- `en-US-AvaMultilingualNeural::en-CA`
- `en-US-AndrewMultilingualNeural::en-US`
- `en-US-JennyNeural::en-US`
- `en-US-GuyNeural::en-US`

The voice rotation key format is:

```text
LEVEL|en-US|voiceName::accentLocale|sentence text
```

## Safer L3 Resume Plan

Do not resume with high concurrency first. Use throttling-aware batches.

Recommended command shape:

```powershell
& 'C:\Program Files\nodejs\node.exe' .\scripts\warm-listening-audio.js --level=L3 --concurrency=1 --checkpoint-every=1 --max-rows=50 --delay-ms=4000 --request-timeout-ms=30000 --continue-on-error --api-base=https://asia-east2-battleship-game-c0909.cloudfunctions.net/speakingApi
```

Better next improvement:

- Add automatic long pause when failed response contains Azure `429`
- Example backoff: 60s, 120s, 240s
- Keep checkpointing every successful row

## iOS Audio Issue Context

Known symptom:

- iPhone has laggy SFX/audio
- Desktop and Android are smooth

Recent iOS-related work already done before this log:

- Remote listening MP3 avoids WebAudio boost because GCS URLs do not have CORS headers
- Listening remote audio reuses a preloaded `audioElement`
- `playsinline` added
- SFX pooling added in `ui-audio.js`
- `warmGameAudioForInteraction()` called on start/guest flow

Next iOS investigation should focus on:

- Whether multiple `HTMLAudioElement.play()` calls are queued too close together
- Whether SFX and listening voice compete on iOS audio session
- Whether iOS needs one unlocked audio path after first user gesture
- Whether any sound still goes through WebAudio with remote URLs
- Whether short SFX files need pre-decoded/persistent elements instead of creating new playback objects

## Verification Commands

Count manifest entries:

```powershell
@'
const fs = require('node:fs');
const vm = require('node:vm');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync('listening_audio_manifest.js', 'utf8'), context);
const manifest = context.window.LISTENING_AUDIO_MANIFEST || {};
const counts = {};
for (const key of Object.keys(manifest)) counts[key.split('|')[0]] = (counts[key.split('|')[0]] || 0) + 1;
let failed = [];
if (fs.existsSync('listening_audio_failed_l3.json')) failed = JSON.parse(fs.readFileSync('listening_audio_failed_l3.json','utf8'));
console.log(JSON.stringify({ total: Object.keys(manifest).length, counts, l3FailedFileRows: failed.length }, null, 2));
'@ | & 'C:\Program Files\nodejs\node.exe' -
```

Syntax checks:

```powershell
& 'C:\Program Files\nodejs\node.exe' --check .\functions\index.js
& 'C:\Program Files\nodejs\node.exe' --check .\functions\services\pronunciation.js
& 'C:\Program Files\nodejs\node.exe' --check .\scripts\warm-listening-audio.js
& 'C:\Program Files\nodejs\node.exe' --check .\app.js
& 'C:\Program Files\nodejs\node.exe' --check .\ui-audio.js
```
