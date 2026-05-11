# Versemate Web — E2E Test Suite

Playwright suite that mirrors the mobile Maestro coverage feature-for-feature. Backed by the parity matrix in [`FEATURES.md`](../../FEATURES.md).

## Running

```bash
# install Chromium browser binary (one-time)
bun run test:e2e:install

# run the whole suite (mobile + desktop projects, headless)
bun run test:e2e

# run a subset
bun run test:e2e -- --grep auth
bun run test:e2e -- --project=chromium-mobile

# run headed for debugging
bun run test:e2e:headed -- --grep verse-actions

# open the HTML report from the last run
bun run test:e2e:report
```

By default the suite spawns a Vite dev server on port 5173. To run against
an already-running app (e.g. a deployed preview):

```bash
E2E_BASE_URL=https://verse-mate-web-preview.workers.dev bun run test:e2e
```

## Authenticated tests

Specs that require a signed-in user opt in via:

```ts
import { test } from '@playwright/test';
test.use({ storageState: 'tests/e2e/.auth/user.json' });
```

The `setup` project at `fixtures/auth.setup.ts` runs once before any
authenticated spec, signs in via the email/password UI, and writes the
storageState file. Without `E2E_TEST_PASSWORD` set, the setup writes an
empty storageState and the dependent specs `test.skip()` themselves.

```bash
# defaults: chaves.augusto+verse@gmail.com (mobile shared account)
E2E_TEST_PASSWORD=•••• bun run test:e2e
```

`VM_TEST_EMAIL` / `VM_TEST_PASSWORD` are accepted as fallbacks for parity
with `tests/migration/`.

## Layout

```
tests/e2e/
├── playwright.config.ts          standalone config (parallel to migration's)
├── fixtures/
│   ├── env.ts                    credential helpers
│   └── auth.setup.ts             produces storageState for authed specs
├── pages/                        page objects (POM)
│   ├── login.page.ts
│   ├── reader.page.ts
│   ├── commentary.page.ts
│   ├── menu.page.ts
│   ├── book-selector.page.ts
│   ├── data-screens.page.ts      Bookmarks / Notes / Highlights
│   ├── settings.page.ts
│   ├── desktop.page.ts           DesktopLayout (≥1024px)
│   ├── about.page.ts             /menu/about static screen
│   ├── help.page.ts              /menu/help feedback form
│   ├── giving.page.ts            /menu/giving donation page
│   ├── topic-events.page.ts      /topic/<cat>/<slug> + /topics/<id>
│   └── most-quoted.page.ts       /topics/<id>/<event>/most-quoted
└── <feature>/
    └── *.spec.ts                 one or more specs per feature folder
```

Each feature folder mirrors the mobile Maestro `.maestro/<folder>/` layout
so coverage gaps are obvious by comparison.

## Coverage map (specs)

| Folder | Spec | What it covers |
| --- | --- | --- |
| auth/ | login.spec.ts | Providers + email screens, mode toggle, empty/bad creds, happy-path signin |
| auth/ | logout.spec.ts | Signed-in user logout |
| auth/ | sso-callback.spec.ts | OAuth callback handler |
| auth/ | email-screen-back.spec.ts | `login-screen-back`, providers back, providers mode toggle |
| bible/ | load-and-navigate.spec.ts | Chapter load, FAB nav, left-boundary, progress bar |
| bible/ | chapter-picker.spec.ts | BookSelector modal — OT/NT/Topics tabs, search, end-to-end nav |
| bible/ | verse-actions.spec.ts | Long-press → action sheet, 6 actions, 5 highlight colors (fixme'd) |
| bible/ | view-toggle.spec.ts | Bible ↔ Insight pill navigation |
| bible/ | commentary-tabs.spec.ts | Summary / By-Line / Detailed tab swap + share buttons |
| bible/ | study-tab.spec.ts | Fourth commentary tab (Study / Inductive Study panel) |
| bible/ | byline-interactions.spec.ts | Byline expand-all, per-verse toggle |
| bible/ | audio-inline.spec.ts | `audio-inline-entry` data-state on Commentary (guest) |
| bible/ | audio-listen-smoke.spec.ts | Full chip → dock → sheet → Esc audio path (authed) |
| bible/ | james-anchor.spec.ts | Production `/bible/james/1` URL — full flow + last-chapter (James 5) |
| bible/ | last-chapter-boundary.spec.ts | Revelation 22 and James 5 both hide Next FAB (intra-book right boundary) |
| bookmarks/ | list-and-empty.spec.ts | Guest empty state |
| bookmarks/ | crud-authenticated.spec.ts | Create + delete chapter bookmark (authed) |
| bookmarks/ | back-nav.spec.ts | Back button → /menu |
| desktop/ | split-view.spec.ts | DesktopLayout shell, panels, divider drag, header tabs |
| desktop/ | sidebar.spec.ts | OT/NT collapsible sections, sidebar chapter click |
| highlights/ | list-and-empty.spec.ts | Guest empty state |
| highlights/ | auto-themes.spec.ts | Auto-Highlights section heading + back nav |
| menu/ | items.spec.ts | All 9 menu items + close + profile card |
| menu/ | navigate.spec.ts | Each menu item routes to its destination |
| menu/ | about.spec.ts | About screen content, Privacy/Terms/Contact links, version label |
| menu/ | help.spec.ts | Help form structure + textarea input + back nav |
| menu/ | giving.spec.ts | Monthly/One-time toggle, 4 preset amounts, mailto CTA |
| notes/ | list-and-empty.spec.ts | Guest empty state |
| notes/ | scoped-chapter.spec.ts | /notes/<book>/<chapter> scoped view + chapter-back-button |
| regressions/ | divergences.spec.ts | Current behavior snapshots (highlights guest, theme, mailto giving, etc.) |
| regressions/ | desktop-panel-bugs.spec.ts | Desktop split-view: right panel resets across topic nav; topic routes render full-screen |
| regressions/ | chapter-notes-sheet.spec.ts | Chapter-notes modal: open without nav, inline sign-in flow, draft preservation, edit/delete |
| settings/ | settings.spec.ts | Version (4) + Language (4) options, font-slider range, back nav |
| settings/ | sections.spec.ts | Section headings, dynamic px display, version footer |
| smoke/ | routing.spec.ts | /, /menu/signin, /bible/1/1, NotFound |
| smoke/ | extra-routes.spec.ts | /bible/james/1 anchor, /logout, unknown book, unknown topic |
| topics/ | browse.spec.ts | /topics list, expected categories visible, back nav |
| topics/ | topic-events.spec.ts | /topic/<cat>/<slug> canonical URL + BookSelector discovery |
| topics/ | most-quoted.spec.ts | Most Quoted Verses screen (discovery path) |

## What is *not* covered (Phase-2 follow-ups)

These have intentional gaps tracked here so future contributors can pick them up:

1. **Long-press verse → action sheet** (`bible/verse-actions.spec.ts` — `test.describe.fixme`). CDP `Input.dispatchTouchEvent` doesn't reliably fire React `onTouchStart` / `onTouchEnd`; real users on real devices work fine. Possible workarounds documented in the spec.
2. **Verse selection toolbar** (`SelectionToolbar.tsx`) — no `data-testid` on color / copy / share / bookmark buttons; relies on `window.getSelection()` ranges which Playwright doesn't model well.
3. **VerseInsightSheet, AddNoteSheet, EditNoteSheet, NoteOptionsSheet, HighlightOptionsSheet, VersionPicker, OptionsSheet** — no `data-testid` attributes. Add testids in the component source before writing positive specs.
4. **StudyPanel internal expand/collapse** — the panel mounts (`bible/study-tab.spec.ts`), but the per-step accordion buttons have no testids.
5. **Desktop reader full-flow** — `chromium-desktop` skips every `bible/*.spec.ts` because DesktopLayout duplicates reader testids. Phase-2: scoped page objects that target the inner panel.
6. **Audio dock + full sheet on desktop** — `bible/audio-listen-smoke.spec.ts` is mobile-only.
7. **HelpScreen form submit** — submit handler is not exercised; only structural render is tested.

## Adding a new spec

1. **Pick the right folder** — `auth/`, `bible/`, `bookmarks/`, etc. If
   the feature is new, add a row in `FEATURES.md` § 3 first.
2. **Use page objects, not raw locators**. If the page object is
   missing a locator, add it to the page object — don't inline
   `page.getByTestId('…')` in the spec.
3. **Use `data-testid` selectors**. Names mirror mobile's testID
   inventory; if a needed testid is missing on web, add it to the
   component (this was the work of PR-A `qa/add-e2e-testids`).
4. **Tag mobile-only / desktop-only flows** by skipping at the top of
   the spec (see `bible/verse-actions.spec.ts` for an example).
5. **Be deterministic**. Don't rely on copy you don't control; prefer
   testids. Prefer route assertions over animation timing.
6. **Clean up authenticated state**. Authenticated specs that mutate
   bookmarks/notes/highlights should remove what they create in
   `afterEach` — see `FEATURES.md` § 6 question 3.

## CI

Runs on every PR via `.github/workflows/e2e.yml`. The workflow:
- Installs Chromium
- Spawns the Vite dev server (via Playwright's `webServer`)
- Runs P0 + P1 specs against `chromium-mobile` and `chromium-desktop`
- Uploads HTML report + traces as artifacts on failure

Authenticated specs only run when the `E2E_TEST_PASSWORD` repo secret
is set; otherwise they skip cleanly.

## Known limitations (Phase-1 baseline)

These are tracked for follow-up; do not consider them blockers:

1. **DesktopLayout duplicates reader testids.** At ≥1024px, `DesktopLayout`
   renders its own chrome alongside the inner `<Outlet />` (ReadingScreen),
   producing duplicate `chapter-selector-button`, `bible-view-icon`, FAB,
   etc. testids. As a result, all `tests/e2e/bible/*` specs are skipped on
   the `chromium-desktop` project for now (with explicit `test.skip` at
   the top of each file). Phase-2 follow-up: scoped page objects that
   target the inner panel via `page.locator('[data-testid="..."]').first()`
   or a wrapper element. The mobile repo's `e2e/desktop/` Playwright suite
   already covers desktop split-view interactions in the meantime.
2. **FAB navigation `test.fixme`.** `chromium-mobile` clicks on the
   absolutely-positioned chapter Previous/Next FAB don't fire the
   ReadingScreen handler. State stays on the original chapter. Manual
   testing in a real mobile browser works. Likely Playwright touch/mouse
   interaction quirk — needs a `touchscreen.tap` with explicit timing.
3. **Verse long-press `test.fixme`.** Same root cause as #2 — simulating
   a 600 ms `mouse.down`/`mouse.up` doesn't trigger
   `ReadingScreen.handlePressStart`'s 400 ms timer to open the action
   sheet. Verse selection (`onMouseUp` < 400 ms) does fire correctly.
4. **Chapter-picker end-to-end `test.fixme`.** Also click-routing —
   selecting a chapter button inside the modal doesn't update state.
5. **Web app has no theme toggle.** Mobile has 3 modes (light/dark/auto);
   web ships dark only. Tracked in `FEATURES.md` §4 #4. No web spec yet.
