# Vocabulary Image Generation Progress

Last updated: 5 October 2026

## Current setup

- Generator: `scripts/generate-vocab-images.js`
- Command: `npm run vocab:images`
- Private output: `private_exports/vocab_image_generation/`
- Progress file: `private_exports/vocab_image_generation/manifest.json`
- Output format: 1024x1024 transparent RGBA PNG
- Queue: 5,000 distinct single-word candidates from the teacher bank and
  bundled headwords

## Prompt

The generator keeps the requested prompt structure and only replaces the text
inside the quotation marks:

`创作 Irasutoya风格 AI 插画表示“英文單字 中文意思” 透明背景`

Short English text inside an illustration is acceptable when it helps explain
the word. The generator does not require every image to contain text.

## API behaviour

The V7 proxy's async image endpoint currently reports that async tasks are not
enabled. The generator automatically falls back to the synchronous
`/images/generations` endpoint and still supports async polling for providers
that enable it.

## Verified work

- Focused generator tests pass: `node --test tests/generate_vocab_images.test.js`
- Real transparent PNG generation succeeded for `algorithm`, `abalone`,
  `abandon`, and `ability`.
- The `bargain` sample showed that a short English label can be useful and is
  accepted as part of the visual review.
- Generated images are still private test outputs. They have not been copied
  into the Flutter bundle or uploaded to Firebase.

## Next step

Continue in small reviewed batches first. The estimated maximum at USD 0.60
per image is USD 3,000 for 5,000 images, so do not start the full queue until
the visual style and storage/naming plan are approved. The manifest makes the
process resumable and skips completed files.
