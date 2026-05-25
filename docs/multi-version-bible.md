# Multi-Version Bible — Session Handoff

Runbook for finishing multi-translation support across the VerseMate stack.
Self-contained so a fresh session (in either repo) can pick it up. Read this
top-to-bottom, then start with the "Next session: start here" checklist.

## Repos & endpoints

| Thing | Location |
|-------|----------|
| Web frontend (this repo) | `verse-mate/verse-mate-web` |
| Backend / API | `verse-mate/verse-mate` |
| Live API base | `https://api.versemate.org/` |
| OpenAPI schema (parse this first) | `https://api.versemate.org/openapi/json` |
| Ingest tool | `scripts/bible-ingest/` (this repo) |
| Web PR | `verse-mate/verse-mate-web` #200 |

## Where things stand

Done on the **web** side (PR #200):
- `scripts/bible-ingest/build.py` downloads open-licensed Bibles from eBible.org
  and converts USFM → the app's `Chapter` JSON. License-gated (no NC/ND/permission).
- `src/constants/bible-versions.ts` lists 11 open versions in the picker.

**The blocker:** the backend doesn't serve them. `GET /bible/book/{bookId}/{chapter}`
ignores the version and returns only NASB1995. In `src/services/bibleService.ts`
the version arg is received as unused `_version` and omitted from the request
(see the NOTE at ~line 196). So the picker entries render but load no text yet.

**Not started:** all backend work (storage, ingest, version-aware endpoints).
Nothing has been pushed to or run against `verse-mate/verse-mate`.

## The versions (curated, all redistributable)

| Key | Lang | eBible ID | Version | License | Books |
|-----|------|-----------|---------|---------|-------|
| `KJV`    | en | `eng-kjv2006` | King James (Authorized) Version | Public Domain | 66 |
| `SCH51`  | de | `deu1951`     | Schlachter-Bibel 1951 | CC BY 4.0 | 66 |
| `LSG`    | fr | `fraLSG`      | Louis Segond 1910 | Public Domain | 66 |
| `TGLULB` | tl | `tglulb`      | Banal na Bibliya (ULB) | CC BY-SA 4.0 | 66 |
| `HCV`    | hi | `hincv`       | Hindi Contemporary Version | CC BY-SA 4.0 | 66 |
| `BLIV`   | pt | `porbr2018`   | Bíblia Livre | CC BY 3.0 | 66 |
| `RIV`    | it | `ita1927`     | Riveduta 1927 | Public Domain | 66 |
| `SYN`    | ru | `russyn`      | Синодальный перевод | Public Domain | 66 |
| `RVR09`  | es | `spaRV1909`   | Reina-Valera 1909 | Public Domain | 66 |
| `VDC`    | ro | `ron1924`     | Biblia Cornilescu 1924 | Public Domain | 66 |
| `UKRKL`  | uk | `ukr1871`     | Переклад Куліша | Public Domain | NT only (27) |

NASB1995 stays the licensed backend English text. NIV/ESV are unavailable
(copyrighted, not on eBible) and intentionally excluded. The `key` values are
the canonical version identifiers — keep them identical in `build.py`,
`bible-versions.ts`, and the backend.

## Step 1 — Generate the data

From a network that can reach eBible.org (it returns HTTP 403 to some
datacenter IPs; run locally if CI is blocked):

```bash
cd scripts/bible-ingest
python3 build.py --self-test     # sanity-check the parser
python3 build.py --all           # download + convert all 11 versions
```

Output (git-ignored staging data, not bundled into the app):

```
scripts/bible-ingest/output/
  index.json                 # all versions + metadata + attribution lines
  <KEY>/
    manifest.json            # key, language, license, attribution, counts
    <bookId>/<chapter>.json  # { book, bookId, chapter, verses:[{number,text}], subtitles? }
```

`book` is the localized book name (from USFM `\h`). `bookId` is 1–66
(Genesis=1 … Revelation=66). `subtitles` are section headings as
`{ subtitle, start_verse, end_verse }`.

## Step 2 — Backend (`verse-mate/verse-mate`)

Do this in the backend repo. **Begin by fetching and reading the OpenAPI
schema** (`https://api.versemate.org/openapi/json`) to learn the real route
signatures, auth, and existing `/bible/*` shapes before changing anything.

1. **Storage** — add a version dimension to verse text. Likely a `versions`
   table (key, language, title, license, license_url, attribution) and a
   `version_id` (or version key) FK on the verse/chapter text. NASB1995 becomes
   one row among many. Handle NT-only versions (Ukrainian) — missing OT books
   should 404/empty cleanly, not error.
2. **Ingest loader** — read `scripts/bible-ingest/output/` and upsert per
   version → book → chapter → verse, plus the version metadata from each
   `manifest.json`. Store the localized `book` name per (version, bookId).
3. **Version-aware chapter endpoint** — make `GET /bible/book/{bookId}/{chapter}`
   accept a version parameter and return that version's text. Confirm the
   param name from the schema; `/topics` already uses `bible_version`, so
   prefer `bible_version` for consistency (the web note shows `versionKey`
   currently 404s). Default to NASB1995 when omitted (back-compat).
   - **Response contract the web app already expects** (do not break it):
     ```json
     { "book": { "name": "<localized book name>",
       "chapters": [ { "verses": [ { "verseNumber": 1, "text": "…" } ],
                       "subtitles": [ { "subtitle": "…", "start_verse": 1, "end_verse": 3 } ] } ] } }
     ```
4. **Discovery endpoints**:
   - `GET /bible/languages` must include the new languages (de, fr, tl, hi, pt,
     it, ru, es, ro, uk). It currently lists only languages with content.
   - Consider a `GET /bible/versions` endpoint (key, language, title, license,
     attribution) so the frontend stops hard-coding the list.
5. **Books per version** — `GET /bible/books` may need to be version-aware so
   localized names and the available-book set reflect the selected version.

## Step 3 — Frontend follow-ups (this repo)

Only after the backend serves versions:

1. `src/services/bibleService.ts` (~line 196–209): re-add the version param to
   the `GET /bible/book/{bookId}/{chapter}` request, rename `_version` →
   `version`, and pass it through. Remove the "API 404s" NOTE.
2. Fix the matching note in `DEVELOPMENT.md` (the `versionKey` 404 section).
3. If a `/bible/versions` endpoint lands, drive the picker from it instead of
   the static `bibleVersions` array (or keep the array as a fallback).
4. **Credits screen**: surface the attribution line for every CC BY / CC BY-SA
   version actually shown (German, Portuguese, Tagalog, Hindi). Pull from each
   `manifest.json` / `index.json`. This is a license obligation, not optional.
5. Picker UX: group `bibleVersions` by `language`; mark Ukrainian as NT-only.
6. RTL is not needed for this set (no Arabic/Urdu/Hebrew-script versions).

## License obligations (must honor)

- Public-domain versions: no obligations.
- CC BY / CC BY-SA (`SCH51`, `BLIV`, `TGLULB`, `HCV`): show the attribution
  line in-app (credits/About). CC BY-SA additionally means any redistributed
  derivative of that text inherits CC BY-SA. The exact lines are in each
  version's `manifest.json`.

## Definition of done

- [ ] `python3 build.py --all` produces `output/` for all 11 versions.
- [ ] Backend stores + serves each version; NASB1995 still default.
- [ ] `GET /bible/book/1/1?bible_version=LSG` (or final param) returns Segond text.
- [ ] `GET /bible/languages` lists the new languages.
- [ ] Web `fetchChapter` passes the version; switching in the picker changes text.
- [ ] Ukrainian (NT-only) degrades gracefully for OT books.
- [ ] Attribution shown for the CC-licensed versions.

---

## Paste-ready kickoff prompt for a backend session

> Work in `verse-mate/verse-mate` (the VerseMate API). Goal: serve multiple
> Bible translations, not just NASB1995. First, fetch and study the OpenAPI
> schema at https://api.versemate.org/openapi/json and the existing `/bible/*`
> routes. The web repo `verse-mate/verse-mate-web` has an ingest tool at
> `scripts/bible-ingest/` that outputs per-version JSON
> (`output/<KEY>/<bookId>/<chapter>.json`, shape
> `{ book, bookId, chapter, verses:[{number,text}], subtitles? }`) plus a
> `manifest.json` with license/attribution. Implement: (1) versioned storage
> for verse text, (2) a loader for that JSON, (3) a version-aware
> `GET /bible/book/{bookId}/{chapter}` that accepts a `bible_version` param and
> defaults to NASB1995, returning the existing
> `{ book: { name, chapters:[{ verses:[{verseNumber,text}], subtitles }] } }`
> contract, and (4) `/bible/languages` (and ideally `/bible/versions`) updated
> to list the new content. The version keys are KJV, SCH51, LSG, TGLULB, HCV,
> BLIV, RIV, SYN, RVR09, VDC, UKRKL (UKRKL is NT-only — handle missing OT
> books gracefully). See `docs/multi-version-bible.md` in verse-mate-web for
> the full handoff.
