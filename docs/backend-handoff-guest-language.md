# Backend Handoff: Localize Chapter Explanations for Guests (and via explicit param)

**Audience:** backend engineer working on the VerseMate API
**Goal:** let an unauthenticated (guest) request receive AI commentary in a chosen
language, and let any request specify the language explicitly rather than relying
solely on the JWT.

---

## TL;DR

Add an optional `lang` query parameter to the chapter-explanation endpoint and
honor it for **both authenticated and unauthenticated** requests. When `lang` is
present it takes precedence over the JWT `preferred_language` claim. When it's
absent, behavior is unchanged (use the JWT claim, else the default language).

This mirrors the existing public lemma endpoint (`GET /lemma/{strongs}?lang=`),
which already localizes for guests with no token.

---

## Why

Today, chapter explanations are localized **only** from the JWT's
`preferred_language` claim. Guests send no token, so they always get the default
(English) commentary — even after picking a language in Settings. The language
picker is open to guests and already localizes lexicon/word cards (which use the
`lang` param), so commentary is the one piece that silently stays English.

Tying language to the token also forces an awkward flow for signed-in users: the
frontend currently has to `PATCH /user/preferences`, refresh the token to get a
new claim, then **full-page reload** so commentary refetches. An explicit param
removes the reload and unifies the guest and signed-in code paths.

---

## The endpoint

```
GET /bible/book/explanation/{bookId}/{chapter}?explanationType={summary|byline|detailed}
```

- `bookId`: 1–66 (canonical order, Genesis=1 … Revelation=66)
- `chapter`: 1-based integer
- `explanationType`: `summary` | `byline` | `detailed`
- Auth today: optional `Authorization: Bearer <jwt>`; backend reads
  `preferred_language` from the claims to choose the language.

**Current response shape (unchanged by this request):**

```json
{
  "explanation": {
    "explanation": "## Genesis 1:1\n> In the beginning…\n### Summary\n…",
    "explanation_id": 12345
  }
}
```

> Note: `byline` returns Markdown with per-verse headings like `## <Localized Book
> Name> 1:1`. The frontend parses these, so the **localized book name in the
> heading must match the requested language** (the frontend already handles
> non-ASCII / diacritic book names).

---

## Requested change

### 1. Accept a `lang` query parameter

```
GET /bible/book/explanation/{bookId}/{chapter}?explanationType=byline&lang=es
```

- **Name:** `lang` (chosen for consistency with the existing public `/lemma`
  endpoint; the JWT claim and the `PATCH /user/preferences` body keep using
  `preferred_language` — only the public query param is `lang`).
- **Value:** a base ISO 639-1 code, lowercased (`es`, `pt`, `fr`, `ro`, `de`, …).
  The frontend collapses any region suffix before sending, e.g. `es-MX → es`.
  The authoritative set is whatever `GET /bible/languages` returns in
  `language_code`.
- **Applies to:** authenticated **and** unauthenticated requests.

### 2. Precedence

1. If `lang` is present and valid → use it.
2. Else if a JWT with `preferred_language` is present → use that (current behavior).
3. Else → default language (English).

Making the explicit param win lets the frontend send `lang` on **every** request
(guest and signed-in) and drop the token-refresh + reload dance.

### 3. Fallback behavior

If commentary isn't available in the requested `lang`, **fall back to English**
rather than returning empty/404. This matches the lemma endpoint's field-by-field
English fallback. (If a coverage signal like the lemma `is_translated` flag is
cheap to add, include it — but it's not required; the frontend treats a returned
explanation as authoritative.)

### 4. Backward compatibility

- When `lang` is **absent**, behavior is exactly as today. No existing caller
  breaks.
- Unknown/unsupported `lang` value → treat as "no translation available" and fall
  back to English (don't error).

---

## Precedent to copy from

The lemma endpoint already does exactly this pattern and is the reference
implementation:

```
GET /lemma/{strongs}?lang={code}     # public, no auth required
```

- Localizes by `lang` query param.
- Field-by-field English fallback; never returns null for a field that exists in
  English.
- Surfaces an `is_translated` boolean for whole-card degradation.

Apply the same philosophy to chapter explanations.

---

## Caching note (please don't skip)

If explanations are cached (CDN, edge, or app-level), the cache key **must now
include `lang`** (and must not collapse authenticated vs. unauthenticated
responses for the same `lang`). Otherwise a guest could get another language's
cached commentary. The frontend caches per `bookId:chapter:lang`, so the server
should vary on the same dimensions.

---

## Acceptance criteria

- [ ] `GET …/explanation/1/1?explanationType=summary&lang=es` with **no
      Authorization header** returns Spanish commentary.
- [ ] Same request with `lang=pt` returns Portuguese; `lang=fr` returns French.
- [ ] `lang` present **and** a conflicting JWT claim present → `lang` wins.
- [ ] No `lang` and a JWT with `preferred_language=es` → still returns Spanish
      (unchanged behavior).
- [ ] No `lang` and no token → returns English (unchanged behavior).
- [ ] `lang` set to an unsupported code (e.g. `zz`) → returns English, HTTP 200.
- [ ] `byline` response headings use the localized book name for the requested
      language (e.g. `## Génesis 1:1` for `lang=es`).
- [ ] All three `explanationType`s (`summary`, `byline`, `detailed`) honor `lang`.
- [ ] Caching keys on `lang` (no cross-language bleed between guests).

---

## Accompanying frontend changes (for context / sequencing)

Once the backend honors `lang`, the frontend will:

1. Send `lang` (from `localStorage['@versemate:preferred_language']`, collapsed to
   base ISO) on the explanation fetch — `src/services/bibleService.ts`
   `fetchExplanation` — for **all** users, with `auth` still `true` so signed-in
   users keep sending their token.
2. Key the in-memory explanation cache by `bookId:chapter:lang` (currently
   `bookId:chapter`) so switching language refetches instead of serving stale
   English.
3. Remove the `window.location.reload()` + forced token refresh in
   `SettingsScreen.handleLanguageChange`. Signed-in users still
   `PATCH /user/preferences` so the choice persists as their server-side default,
   but localization no longer depends on the refreshed claim.

**Rollout order:** ship the backend change first (it's backward-compatible — the
frontend doesn't send `lang` yet, so nothing changes until it does). Then ship the
frontend change. No coordinated deploy needed.

---

## Open questions for backend

1. Is `lang` an acceptable param name, or do you prefer `language` /
   `preferred_language` for consistency with the claim? (Frontend can send
   whatever you choose.)
2. Is there an `is_translated`-style coverage flag worth returning, or is silent
   English fallback sufficient?
3. Any rate-limit / abuse considerations for unauthenticated explanation requests
   that previously implicitly required a token?
