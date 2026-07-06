# EDGE Extra Mock Vocab Review Goal

## Objective

Review the Longman Pearson English EDGE `Extra Mock` corpus and use it as a coverage checklist for the Grammar Game student-facing vocabulary bank.

Grammar Game remains the master vocab source. Battleship-1 should only receive synced reviewed vocab assets after Grammar Game is updated.

## Source Scope

- Root folder: `/Users/macbook/Library/CloudStorage/GoogleDrive-austinau99@gmail.com/My Drive/Tutor/ENGLISH LANGUAGE/高中/Longman Pearson English EDGE/EDGE Extra Mock`
- Include all available Extra Mock / ES sets found in the folder.
- Cover Paper 1, Paper 2, Paper 3, and Paper 4 for each set.
- Prefer `DOCX`, then `DOC`, then `PDF` when the same content exists.
- For Paper 3, include both question paper and audio script when both are available.
- Ignore temporary files, answer keys, marking schemes, and marking guidelines unless no student-facing source exists.

## Review Rules

- Do not import raw dictionary output directly into the student dictionary.
- Use the corpus to find useful missing words, phrasal verbs, idioms, academic phrases, and DSE-style expressions.
- Ignore ordinary combinations where the existing single-word meanings are enough, for example `guide service` if `guide` and `service` are already covered.
- Add true phrases and idioms when the whole expression has a meaning students cannot easily infer, for example `a slap on the wrist`, `snowed under`, or `turn a blind eye to`.
- Names, non-famous places, one-off company names, and document boilerplate should not be added.
- For phrases containing real vocabulary words, ensure the component words are also searchable unless they are function words or non-standalone fragments.
- POS and Chinese meanings must be clean, concise, and useful for Hong Kong students.

## Workflow

1. Build the source manifest and confirm no Paper 1-4 source is missing.
2. Extract text from selected DOCX / DOC / PDF files into a private corpus.
3. Run a coverage audit against the current Grammar Game lookup stack:
   teacher bank, curated sense bank, and reviewed supplements.
4. Review missing candidates in small batches.
5. Promote only reviewed entries into `vocab_sense_bank.js` or the approved teacher vocab bank.
6. Run vocab tests and JavaScript checks.
7. Run `npm run vocab:sync-battleship` after Grammar Game vocab changes.
8. Report remaining source gaps or intentionally skipped items.

## Done Criteria

- Manifest has no missing Paper 1-4 records for the detected mock sets.
- Text extraction has `failureCount = 0` and `emptyCount = 0`.
- High-value missing words and phrases from the corpus have been reviewed and either added or explicitly skipped.
- Newly added phrase entries have component-word coverage checked.
- Grammar Game tests pass for vocab lookup.
- Battleship-1 shared vocab assets are synced after approved vocab changes.
