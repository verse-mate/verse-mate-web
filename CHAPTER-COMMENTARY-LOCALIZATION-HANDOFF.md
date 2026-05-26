# Chapter Commentary Localization — Backend Handoff

Hand-off for fixing **AI chapter commentary (Summary / By-Line / Detailed) not
honoring the user's language**. Self-contained so a fresh session — primarily
in the **backend** repo (`verse-mate/verse-mate`), with a small follow-up in
`verse-mate/verse-mate-web` — can pick it up.

## Symptom

In `verse-mate-web`, Settings → **Language Preferences** is meant to set the AI
explanation/commentary language. Signed in, selecting a language saves
`preferred_language` and reloads the page, but the chapter commentary
(Summary / By-Line / Detailed) always renders in **English**, regardless of the
chosen language.

## Root cause (confirmed via live OpenAPI + curls)

The **public chapter explanation endpoint has no language selector**:

```
GET /bible/book/explanation/{bookId}/{chapterNumber}
query params: bible_version, versionKey, explanationType    ← that is ALL
```

The response includes a `language_code` field (the server decides which
language to return), but the client has **no way to request one**. Verified
live — all of these return the *identical English* summary for Genesis 1:

```bash
curl -s 'https://api.versemate.org/bible/book/explanation/1/1?explanationType=summary'
curl -s 'https://api.versemate.org/bible/book/explanation/1/1?explanationType=summary&language=es'
curl -s 'https://api.versemate.org/bible/book/explanation/1/1?explanationType=summary&lang=es'
curl -s 'https://api.versemate.org/bible/book/explanation/1/1?explanationType=summary&bible_version=RVR09'
```

By contrast, the **topic** explanation endpoint already supports a language
param:

```
GET /topics/{id}/explanation?type=summary|byline|detailed&lang=<code>   ← has `lang`
```

So the capability exists for topics but was never added for chapter commentary.

## System context (from OpenAPI)

- `GET /bible/languages` (public) → AI explanation languages
  (`language_code`, `name`, `native_name`). This is what drives the FE picker.
- `GET /admin/explanations/languages` → per-language `explanation_count`
  (so multi-language explanation rows **do** exist in the system).
- `POST /admin/batch-explanations` → generates chapter explanations, keyed on
  **`bibleVersion`**.
- `POST /admin/batch-topic-explanations` → keyed on **`languageCode`**.
- `POST /admin/topics/translate-explanations` → has `source_language_code` /
  `target_language_code`.
- `POST /admin/explanations/set-active-as-default | set-defaults-active |
  set-specific-version-active` → operate by `languageCode`, implying the public
  endpoint serves whichever explanation is marked **active/default** for a
  (book, chapter, type) — there is no per-request language choice today.

## Decision the backend must make

Chapter-commentary language is ambiguous in the current model:

- **Option A (recommended) — mirror topics:** add a `lang` query param to
  `GET /bible/book/explanation/{bookId}/{chapterNumber}` that selects the
  explanation row by `language_code`, falling back to the default (English)
  when a translation is missing. This makes the existing "Language Preferences"
  picker meaningful and matches `/topics/{id}/explanation`.
- **Option B — version-driven:** treat each `bible_version`'s language as the
  commentary language (the generator is already per-version). Then the FE just
  passes `bible_version`, and the user changes commentary language by changing
  the **Bible version** — "Language Preferences" would not control chapter
  commentary (only topics, which already takes `lang`).

Recommend **A**.

## Backend work (`verse-mate/verse-mate`)

1. Pick A vs B (recommend A).
2. If A:
   - Add `lang` (or `language`) query param to
     `GET /bible/book/explanation/{bookId}/{chapterNumber}`; select the active
     explanation for that `language_code`; fall back to default/English when
     none exists. Mirror the semantics of `/topics/{id}/explanation`.
   - Decide the source of the language: an explicit client param (preferred,
     simplest) **or** `preferred_language` read from the JWT claim. If JWT,
     document it — the FE already sends the token (see #207 below).
   - Ensure non-English chapter explanations exist **and are marked active**
     for the languages in `/bible/languages` (batch-generate / translate via
     `/admin/batch-explanations`, `/admin/topics/translate-explanations`;
     `/admin/explanations/languages` shows coverage).
3. Update the OpenAPI so the new param is discoverable.

## Frontend follow-up (`verse-mate/verse-mate-web`) — small, do AFTER backend

File: `src/services/bibleService.ts` → `fetchExplanation()`

- Today it sends only `{ explanationType }` (plus `auth: true` as of #207).
- Once the backend supports it, pass the language, e.g.
  `{ explanationType, lang: <preferredLanguageCode> }`. Source the code from the
  stored preference (`localStorage['@versemate:preferred_language']` or the
  user record's `preferredLanguage`).
- **IMPORTANT — cache key:** the in-module explanation cache
  (`_explanationCache` in the same file) is keyed by `` `${bookId}:${chapter}` ``
  only. Add the language (and/or version) to that key, or stale content will be
  served when the language changes without a full reload. Today
  `SettingsScreen.handleLanguageChange` does a full `window.location.reload()`
  on language change, which masks this; if you want no-reload switching, the
  cache key must include language.
- If the backend goes the **JWT-claim** route instead of a param: no FE param
  needed — keep `auth: true` from #207, just add language to the cache key.
- **Fix the stale comment:** the comment block above the `auth: true` line in
  `fetchExplanation` asserts the backend reads `preferred_language` from the
  JWT. That was a hypothesis and is currently false (the endpoint has no
  language mechanism at all). Correct it when wiring the real fix.

## State of related FE PRs (all merged to `main`)

- **#205** — UKRKL → full canon coverage; version-picker group headers in
  English.
- **#206** — curated catalog is authoritative for known versions' display name +
  testament coverage (removes the stale "NT only" badge / "(НЗ)" name on UKRKL);
  Language Preferences list shows English base-language names, deduped; full
  reload after a language change.
- **#207** — sends the auth token on the chapter explanation fetch. Based on the
  (now-disproven) assumption that the endpoint localizes by the JWT
  `preferred_language` claim. **Harmless, left in place** (the reading screen
  already makes authed calls, so no new failure mode) and possibly required if
  the backend goes the JWT route. Its code comment overstates the mechanism —
  correct when fixing.

## Definition of done

- `GET /bible/book/explanation/...` returns localized Summary/By-Line/Detailed
  for a requested language (param or JWT), falling back to English when a
  translation is missing.
- Non-English chapter explanations exist + are active for the supported
  languages in `/bible/languages`.
- `verse-mate-web` `fetchExplanation` passes the language, and
  `_explanationCache` is keyed including language.
- Signed in, changing the Language Preference changes the chapter commentary
  language (after the existing reload).

## Verify

```bash
# default (English) today and after the fix
curl -s 'https://api.versemate.org/bible/book/explanation/1/1?explanationType=summary' | head -c 200
# after the fix: Spanish
curl -s 'https://api.versemate.org/bible/book/explanation/1/1?explanationType=summary&lang=es' | head -c 200
# topics already supports lang (reference behavior)
curl -s 'https://api.versemate.org/topics/<topicId>/explanation?type=summary&lang=es' | head -c 200
```

---

## Paste-ready kickoff prompt

> Work in `verse-mate/verse-mate` (backend). Chapter AI commentary doesn't
> localize: `GET /bible/book/explanation/{bookId}/{chapterNumber}` has no
> language selector (only `bible_version` / `versionKey` / `explanationType`),
> while `GET /topics/{id}/explanation` already supports `?lang=`. Add a `lang`
> query param to the chapter explanation endpoint that selects the explanation
> by `language_code` and falls back to English when missing, mirroring the
> topics endpoint; update the OpenAPI; and ensure non-English chapter
> explanations are generated and marked active for the languages returned by
> `/bible/languages` (see `/admin/batch-explanations`,
> `/admin/topics/translate-explanations`, `/admin/explanations/languages`).
> Then in `verse-mate/verse-mate-web`, update `src/services/bibleService.ts`
> `fetchExplanation()` to pass the user's `preferred_language` as `lang` and
> include the language in the `_explanationCache` key (it's currently keyed by
> `bookId:chapter` only). Verify:
> `GET /bible/book/explanation/1/1?explanationType=summary&lang=es` returns
> Spanish.
