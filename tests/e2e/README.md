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
│   └── settings.page.ts
└── <feature>/
    └── *.spec.ts                 one or more specs per feature folder
```

Each feature folder mirrors the mobile Maestro `.maestro/<folder>/` layout
so coverage gaps are obvious by comparison.

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
