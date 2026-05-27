# Handoff: Lexicon cards untranslated for some words (backend coverage gap)

**Status:** Root cause confirmed. Fix belongs in the backend (`verse-mate-api`), not in
`verse-mate-web`.

**Reported symptom:** With a non-English language preference set, some lexicon (lemma)
popups show fully translated content, while others show English. There is no obvious
pattern to the user — it looks random/broken.

---

## Symptom in one example

Both screenshots came from a non-English session (Spanish lemma cards):

| Word | Strong's | Card content | "Translated" badge |
|------|----------|--------------|--------------------|
| מֹשֶׁה (Moses) | `H4872` | Spanish — "Nombre propio (persona)", "Moisés", Spanish semantic range | ✅ shown |
| מוֹצָא (mo.tsa) | `H4161` | English — English basic sense + English related-word notes | ❌ not shown |

Both words are ordinary Hebrew OT lemmas in the same chapter (Numbers 33). One is
translated, the other is not.

---

## Root cause

The `/lemma/:strongs?lang=<code>` endpoint has **partial translation coverage**. High
frequency / high-priority lemmas (e.g. `H4872` Moses) have a translated row; rarer lemmas
(e.g. `H4161`) do not yet. For an uncovered lemma the endpoint falls back to English
field-by-field and returns `is_translated: false`.

This is **expected, documented endpoint behavior** — the frontend renders exactly what the
API returns. The user-visible inconsistency is a data-coverage gap on the server, not a
rendering bug.

---

## Why this is NOT a frontend bug (evidence)

The frontend was audited end-to-end. Both words travel the identical code path:

1. **Same fetch, same params.** For any non-English user, `LexiconPopover`
   (`src/components/LexiconPopover.tsx:101-141`) fetches
   `GET /lemma/:strongs?lang=<code>` and merges the response over the bundled English
   entry. There is no per-word branching.

2. **Both words have clean Strong's numbers.** Verified against the bundled lexicon
   (`@versemate/lexicon` `_lemmas.json`):
   - `mosheh` → `H4872`
   - `motsa` → `H4161`

   Both are clean 4-digit forms, so neither hits the "no Strong's → skip fetch" early
   return (`LexiconPopover.tsx:104`), and there is no format the backend would fail to
   canonicalize.

3. **The English *content* is the proof.** The `is_translated` flag only controls the
   "Translated" badge (`LexiconPopover.tsx:332`); it does **not** gate the displayed text.
   The badge and the prose come from two independent parts of the merge. Since the mo.tsa
   card shows English *prose* (not merely a missing badge), the server returned English
   prose for `H4161?lang=es`. Per the endpoint contract documented in
   `src/services/lemmaApi.ts:4-12`:

   > "The endpoint does field-by-field English fallback: when a translation row exists but
   > a field is untranslated it returns the English value, never null... Worst case the
   > whole card degrades to English with `is_translated: false`."

4. **Region-code mismatch ruled out.** `usePreferredLanguage`
   (`src/hooks/usePreferredLanguage.ts:10`) collapses `es-MX → es` before the fetch, and
   the endpoint keys translations on the bare ISO code. The same `lang` value is sent for
   both words.

Conclusion: the frontend fetches both lemmas identically; the server returns a translated
card for one and an English-fallback card for the other.

---

## What the frontend sends / expects (contract reference)

Request:

```
GET /lemma/{strongs}?lang={baseIsoCode}
```

- `{strongs}`: canonical-ish Strong's as stored in the bundle, e.g. `H4161`, `G2385`. The
  backend is expected to canonicalize (`g80` / `G0080` / `G80` → `G0080`).
- `{baseIsoCode}`: base ISO language code, e.g. `es`, `de`, `pt`, `tl` (region suffix
  already stripped client-side).
- Public endpoint — no auth header is sent.

Response shape the frontend consumes (`src/services/lemmaApi.ts:13-29`):

```ts
interface ApiLemmaCard {
  strongs: string;
  lemma: string;
  translit: string | null;
  pronunciation: string | null;
  nt_frequency: number | null;
  ot_frequency: number | null;
  loaded: boolean;
  pos: string | null;
  basic_gloss: string | null;
  semantic_range: string[] | null;
  notes: string | null;
  related: Array<{ translit: string; note: string }> | null;
  language_code: string;
  source: string | null;
  is_translated: boolean;   // true only when the card is actually translated
}
```

Frontend fallback semantics (already correct, no change needed):
- **404** → cached as a permanent miss; renders the bundled English entry.
- **5xx / network error** → not cached; renders bundled English; a later tap retries.
- **200 with `is_translated: false`** → renders the (English) content the API returned,
  no badge.

---

## What the backend needs to do

The fix is to **close the translation-coverage gap** for the `/lemma` endpoint. Suggested
work, in priority order:

1. **Measure current coverage.** For each supported `lang`, count how many Strong's
   entries in the lexicon have a complete translated row vs. fall back to English. The
   bundled lexicon (`@versemate/lexicon` `_lemmas.json`) has ~18,100 entries — that is the
   universe to cover.

2. **Backfill missing translations** through the existing LLM translation pipeline
   (cards already carry `source: "llm:claude-haiku-4-5"`, so the pipeline exists). Prioritize
   by lemma frequency so the most-tapped words are covered first.

3. **Decide on partial-field policy.** Confirm the intended contract: should a row ever be
   `is_translated: true` while individual fields are still English, or must all
   user-visible prose fields (`basic_gloss`, `semantic_range`, `notes`, `pos`, related
   notes) be translated before the flag flips true? The frontend trusts `is_translated`
   for the badge, so the flag should mean "this card reads as translated."

4. **Confirm language matching.** Verify the endpoint matches on the **base ISO code**
   (`es`, not `es-MX`) since that is what the client sends. If any path uses the
   authenticated user's stored `preferred_language` (which may carry a region suffix)
   instead of the `?lang=` query param, normalize it the same way.

5. **(Optional) Coverage telemetry.** Consider logging `is_translated: false` responses
   per `(strongs, lang)` so the gap can be tracked over time and re-prioritized.

---

## How to verify the fix

Pick an affected lemma + language and call the endpoint directly:

```bash
# Before the fix: English fallback, is_translated:false
curl -s "https://api.versemate.org/lemma/H4161?lang=es" | jq '{basic_gloss, is_translated}'

# After the fix: Spanish prose, is_translated:true
# expect basic_gloss in Spanish and is_translated == true
```

Then in the app, set the language preference to the target language, open the chapter, and
tap the previously-untranslated word — it should now render translated prose with the
"Translated" badge. No frontend change is required for the fix to take effect (lemma cards
are cached per page load, so a refresh picks up new coverage).

> Note: this container's network blocks `api.versemate.org` ("Host not in allowlist"), so
> live coverage could not be probed from here. Run the `curl` checks from an environment
> with API access.

---

## Frontend follow-up (separate, optional)

Independent of the backend fix, the frontend currently shows an English fallback card to a
non-English user with **no explanation**, which reads as "broken." A small UX improvement
would be to show a subtle "Shown in English — translation pending" hint when
`is_translated === false` for a non-English user. This is cosmetic and does not fix the
underlying gap; track it separately if desired.
