# Lexicon Ingest

Generates `src/data/lexicon/generated/` from open scholarly sources.

## Sources

| Source | License | What it gives us |
|---|---|---|
| [Berean Standard Bible tables](https://berean.bible/downloads.htm) (`bsb_tables.xlsx`) | Public domain | Token-level Greek↔English alignment with Strong's numbers |
| [STEP Bible TBESG](https://github.com/STEPBible/STEPBible-Data) | CC BY 4.0 | Strong's → (Greek lemma, transliteration, POS, English gloss, Abbott-Smith definition) |

## Setup

```bash
cd scripts/lexicon-ingest
pip install -r requirements.txt
```

## Usage

```bash
# Build one book
./build.py --book Philippians

# Build all 27 NT books (one-time, ~30 sec after caches warm)
./build.py --all-nt
```

First run downloads the BSB xlsx (53 MB) + TBESG (5 MB) into `./data/`. Subsequent runs read the cached files.

## Output

* `src/data/lexicon/generated/_lemmas.json` — global lexicon (every lemma referenced by any built book, keyed by translit slug for parity with the hand-curated `lemmas.ts`).
* `src/data/lexicon/generated/<book-slug>-<chapter>.json` — one alignment file per chapter, matching the `ChapterAlignment` TypeScript shape.

The TypeScript renderer prefers hand-curated entries (`lemmas.ts`) over generated ones for the same lemma key — so the rich James 1–5 cards are preserved.

## Adding contextual glosses (Layer 2)

Not built yet. Plan: a separate script reads the generated alignments, picks the ~200 theologically loaded lemmas, batches Claude API calls with the lexicon entry + verse context as grounding, and writes a `_contextual.json` overlay file. Each `(lemma, pericope)` pair gets one contextual blurb, reviewed before merge.

## License posture

BSB is public domain (no restrictions). TBESG is CC BY 4.0 — attribution required in the app's About / credits screen. Don't redistribute the raw TBESG file with the app; the generated JSON is a derivative work that just needs the credit line.
