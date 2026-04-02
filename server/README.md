# Speaking Backend Prototype

This folder contains the first backend skeleton for `Speaking Mode v2` using Azure Pronunciation Assessment.

## What this version does

- exposes `GET /api/health`
- exposes `POST /api/pronunciation-assessment`
- accepts:
  - multipart file field: `audio`
  - text field: `expectedText`
  - optional fields: `locale`, `referenceId`
- returns:
  - overall pronunciation scores
  - word-level accuracy
  - syllable and phoneme detail

## Azure resource you need

- `Azure AI Speech`

## Environment variables

Copy `.env.example` to `.env` in this `server/` folder:

```bash
AZURE_SPEECH_KEY=your_key_here
AZURE_SPEECH_REGION=eastasia
PORT=8787
```

## Run locally

Install dependencies first:

```bash
npm install
```

Then run:

```bash
npm run server
```

## Best way to use this on computer, phone, and tablet

Use an HTTPS backend. The easiest setup for this repo is:

1. Push this repo to GitHub
2. Create a new Render Blueprint / Web Service from the repo
3. Use the included `render.yaml`
4. Set env vars in Render:
   - `AZURE_SPEECH_KEY`
   - `AZURE_SPEECH_REGION=eastasia`
5. After Render gives you a URL like:
   - `https://vocab-conqueror-speaking.onrender.com`
6. Put that URL into:
   - `/app-config.js`
   - `SPEAKING_API_BASE: 'https://your-render-url.onrender.com'`

After that, the same GitHub Pages frontend can use Azure pronunciation assessment on:

- desktop
- phone
- tablet

No native app conversion is required.

## Important note for the first version

This first backend version expects `WAV` audio upload.

If the frontend still records `webm/opus` via `MediaRecorder`, we should either:

1. convert it to `mono PCM WAV` before upload, or
2. add a backend audio conversion step in the next round.

## Suggested response thresholds

- `< 60` red
- `60 - 79` yellow
- `>= 80` green
