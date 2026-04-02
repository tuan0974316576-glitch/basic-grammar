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

## Important note for the first version

This first backend version expects `WAV` audio upload.

If the frontend still records `webm/opus` via `MediaRecorder`, we should either:

1. convert it to `mono PCM WAV` before upload, or
2. add a backend audio conversion step in the next round.

## Suggested response thresholds

- `< 60` red
- `60 - 79` yellow
- `>= 80` green
