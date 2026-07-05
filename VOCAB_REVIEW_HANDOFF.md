# Vocab Review Handoff

This file is for continuing the long-running vocab-bank review in a new Codex conversation.

## Read First

Before changing product / architecture / vocab pipeline code, read:

1. `AGENTS.md`
2. `PROJECT_BRIEF.md`
3. This file

## Current Goal

逐份審查 Oxford / Unseen Graded Mock Test / mock paper 內的文件，補完整學生會在文章、題目、選項、答案解釋中遇到的 `VOCAB BANK`。

Rules:

- If a paper has DOCX / DOC, use that first. Use PDF only if no Word file exists or Word extraction is unusable.
- Do not only run word extraction. Read the actual passage, questions, options, answer key, model writing, and tapescript.
- Add only reviewed, student-facing entries. ECDICT / CC-CEDICT / AI output may be used as reference material only, never directly promoted.
- Skip people names, fictional companies / institutions, non-famous places. Keep countries, famous places, Hong Kong life words, and reusable school / exam vocabulary.
- Phrasal verbs use POS `verb`, not `ph`.
- POS should be clean: `noun`, `verb`, `adjective`, `adverb`, `preposition`, `conjunction`, `modal`.
- Chinese meanings should be concise Traditional Chinese and suitable for Hong Kong students.
- Avoid pure literal combinations. Add phrases when the combined meaning is not obvious or is exam-useful, e.g. `brick-and-mortar = 實體店的 / 非網上的`.
- Do not add ordinary compositional verb+noun collocations as phrase entries when the parts already explain the meaning, e.g. `generate goodwill` should be covered by `generate` + `goodwill`. Add idioms / non-compositional phrases such as `snowed under`, `a dime a dozen`, `tick all the boxes`, or `get the short straw`.
- When adding a phrase, also consider whether component words need missing senses.

## Current Progress

Review log:

`private_exports/mock_unseen_vocab_review_log.json`

Latest verified progress:

| Paper | Total | Done | Remaining |
|---|---:|---:|---:|
| Paper 1 | 84 | 69 | 15 |
| Paper 2 | 81 | 81 | 0 |
| Paper 3 | 77 | 77 | 0 |
| Paper 4 | 72 | 72 | 0 |
| Total | 314 | 299 | 15 |

Most recent completed paper:

- `MT69 Paper 1`
- Source tag: `mock-unseen-mt69-paper1-reviewed`
- Added 108 reviewed entries, including pay cheque to pay cheque / osmosis learning / blow off steam / drive round the bend / mask mandate / Asia's World City / human-competitive / clarion call / AI-driven / polymorphic malware / moratorium / crawl out of the woodwork / robot overlord / personification
- Verified with focused vocab tests and duplicate/POS scan. Full `npm test`, `npm run check:js`, `npm run build:web`, and Battleship sync should be run before commit if this was resumed mid-turn.

Next likely item:

- Paper 3 and Paper 4 are complete. Continue remaining Paper 1 items from the review log.
- Next missing Paper 1 item is likely the next unchecked Paper 1 item after `MT68 Paper 1`; consult `private_exports/mock_unseen_vocab_review_log.json` and the source-tag coverage before starting.
- Use the `.docx` student and teacher files first. If `textutil` extraction is poor, compare with PDF extraction.

## Normal Workflow For One Paper

1. Locate files.

   ```bash
   find "/Users/macbook/Downloads/Unseen Graded Mock Test" -type f \( -iname "*MT15*Paper*3*.docx" -o -iname "*MT15*Paper*3*.doc" -o -iname "*MT15*Paper*3*.pdf" \)
   ```

2. Extract text into `private_exports/`.

   ```bash
   textutil -convert txt -stdout "/path/to/file.doc" > private_exports/mt15_paper3_textutil.txt
   ```

3. Read the extracted text in chunks. Do not rely only on automated word lists.

4. Check existing lookup before adding entries:

   ```bash
   node - <<'NODE'
   const bank = require("./vocab_sense_bank.js");
   for (const q of ["example phrase", "example word"]) {
     console.log(q, "=>", bank.lookup(q).map(e => `${e.display}|${e.pos}|${e.meaning}|${e.source}`).join(" || ") || "MISS");
   }
   NODE
   ```

5. Add reviewed entries to `vocab_sense_bank.js` with a source tag like:

   `mock-unseen-mt15-paper3-reviewed`

6. Add that source tag to:

   - `vocab_data.js`
   - `scripts/audit-core-vocab-senses.js`
   - `tests/vocab_lookup_order.test.js`

7. Add tests in:

   - `tests/vocab_sense_bank.test.js`
   - `tests/audit_core_vocab_senses.test.js` if source count increases

8. Add a review-log entry to:

   `private_exports/mock_unseen_vocab_review_log.json`

   Include:

   - checked file name
   - teacher / answer-key file if applicable
   - source tag
   - new vocab count
   - supplemented existing sense count
   - representative examples
   - skipped summary

9. Verify:

   ```bash
   node tests/vocab_sense_bank.test.js
   node tests/vocab_lookup_order.test.js
   node tests/audit_core_vocab_senses.test.js
   npm test
   npm run check:js
   npm run build:web
   npm run vocab:sync-battleship
   npm run vocab:sync-battleship -- --dry-run
   ```

10. Spot-check Grammar Game and Battleship lookup:

    ```bash
    node - <<'NODE'
    const bank = require("./vocab_sense_bank.js");
    for (const q of ["new phrase 1", "new phrase 2"]) {
      console.log(q, "=>", bank.lookup(q).map(e => `${e.display}|${e.pos}|${e.meaning}|${e.source}`).join(" || "));
    }
    NODE

    node - <<'NODE'
    const bank = require("/Users/macbook/battleship-1/vocab_sense_bank.js");
    for (const q of ["new phrase 1", "new phrase 2"]) {
      console.log(q, "=>", bank.lookup(q).map(e => `${e.display}|${e.pos}|${e.meaning}|${e.source}`).join(" || "));
    }
    NODE
    ```

## Battleship Sync

Grammar Game is the vocab master. Battleship-1 shares the reviewed vocab files.

Run:

```bash
npm run vocab:sync-battleship
npm run vocab:sync-battleship -- --dry-run
```

Dry-run should show all 13 shared files as `unchanged`.

## Important Current Worktree Note

The worktree may already be dirty from previous approved work, including:

- `PROJECT_BRIEF.md`
- `package.json`
- `scripts/apply-vocab-promote-plan.js`
- `scripts/audit-core-vocab-senses.js`
- `scripts/sync-vocab-to-battleship.js`
- vocab tests
- `vocab_data.js`
- `vocab_sense_bank.js`

Do not revert unrelated changes. Continue working with the current state.
