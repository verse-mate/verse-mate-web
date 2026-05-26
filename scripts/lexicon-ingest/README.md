# Lexicon Ingest

Generates `../verse-mate-lexicon/src/generated/` from open scholarly sources.

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

* `../verse-mate-lexicon/src/generated/_lemmas.json` — global lexicon (every lemma referenced by any built book, keyed by translit slug for parity with the hand-curated `lemmas.ts`).
* `../verse-mate-lexicon/src/generated/<book-slug>-<chapter>.json` — one alignment file per chapter, matching the `ChapterAlignment` TypeScript shape.

The TypeScript renderer prefers hand-curated entries (`lemmas.ts`) over generated ones for the same lemma key — so the rich James 1–5 cards are preserved.

## Adding contextual glosses (Layer 2)

Not built yet. Plan: a separate script reads the generated alignments, picks the ~200 theologically loaded lemmas, batches Claude API calls with the lexicon entry + verse context as grounding, and writes a `_contextual.json` overlay file. Each `(lemma, pericope)` pair gets one contextual blurb, reviewed before merge.

## KJV alias coverage (`kjv_aliases.py`)

The reader matches lemmas to displayed text by English *surface* string
(`TokenizedVerse.tsx`, whole-word match), so showing a Greek/Hebrew definition
on a translation requires that translation's word to be a known surface for the
lemma. For English that's `_aliases.json`. Its KJV coverage was patchy — missing
the archaic inflections (`-eth`/`-est`, "hath", "doeth", "saith") and a few KJV
synonyms ("ghost", "raiment", "firmament") — and because the match is strict
whole-word, "love" never matches inside "loveth".

`kjv_aliases.py` fills those gaps deterministically (no network/API key). It
derives archaic verb forms from a curated whitelist of common verbs (gated on
`pos == "Verb"`, so it never inflects a noun synonym) plus a small irregular /
synonym table, and merges them into `_aliases.json` additively.

```bash
./kjv_aliases.py --report     # preview: lemmas touched, surfaces added, probe check
./kjv_aliases.py              # write _aliases.json in the sibling lexicon repo
```

Reads/writes the sibling `../../../verse-mate-lexicon/src/generated`, falling
back to the installed `@versemate/lexicon` package for inputs. After running,
commit the regenerated `_aliases.json` in **verse-mate-lexicon** and bump the
pin in this repo's `package.json`. Note: KJV text only renders once the backend
serves it (see `docs/multi-version-bible.md`); the aliases just make it light up.

## License posture

BSB is public domain (no restrictions). TBESG is CC BY 4.0 — attribution required in the app's About / credits screen. Don't redistribute the raw TBESG file with the app; the generated JSON is a derivative work that just needs the credit line.
