import { defineConfig, devices } from '@playwright/test';

/**
 * Standalone Playwright config for the E2E parity suite.
 *
 * - Lives at tests/e2e/playwright.config.ts so it can co-exist with the
 *   repo-root config (Lovable wrapper) and tests/migration/playwright.config.ts
 *   without cross-contamination.
 * - testDir is '.', so all specs under tests/e2e/** are discovered.
 * - Two projects: chromium-mobile (≈ iPhone 12 viewport) and
 *   chromium-desktop (1280×800) — every P0 spec runs on both unless
 *   tagged @desktop-only or @mobile-only.
 *
 * Run locally:
 *   bun run test:e2e                 # headless, both projects
 *   bun run test:e2e:headed          # headed, single worker
 *   bun run test:e2e -- --grep auth  # filter
 *
 * Env vars (see tests/e2e/fixtures/env.ts):
 *   E2E_BASE_URL          override for an already-running app
 *   E2E_TEST_EMAIL        credentials for authed flows (defaults to
 *   E2E_TEST_PASSWORD     the shared mobile test account)
 *   VITE_API_URL          forwarded to the spawned dev server
 *   CI                    Playwright treats as production (retries on)
 */

const PORT = Number(process.env.E2E_PORT || 5173);
const BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${PORT}`;
const SPAWN_DEV_SERVER = !process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Bound concurrency on CI so all workers share one Vite dev server cleanly
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    // The app uses cookie-based auth; clear by default per test
    storageState: { cookies: [], origins: [] },
  },

  projects: [
    /**
     * `setup` project produces the authenticated storageState file used by
     * specs that need a signed-in user. Specs opt-in via:
     *   test.use({ storageState: 'tests/e2e/.auth/user.json' })
     */
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium-mobile',
      dependencies: ['setup'],
      use: {
        // Use Chromium with an iPhone-12-sized viewport. Pulling in
        // `devices['iPhone 12']` brings WebKit + a mobile UA — we want
        // Chromium specifically (aligns with mobile Maestro's web tests
        // running on Chromium/Chrome) and a viewport-driven mobile shape.
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'chromium-desktop',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],

  webServer: SPAWN_DEV_SERVER
    ? {
        command: `bunx vite --port ${PORT} --host 127.0.0.1`,
        // Run vite from the repo root, not from this config's dir
        cwd: '../..',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        // Forward env to the dev server so VITE_API_URL etc. are picked up
        env: {
          VITE_API_URL: process.env.VITE_API_URL || 'https://api.versemate.org',
          VITE_POSTHOG_KEY: '', // disable analytics during tests
          VITE_POSTHOG_SESSION_REPLAY: 'false',
        },
      }
    : undefined,
});
