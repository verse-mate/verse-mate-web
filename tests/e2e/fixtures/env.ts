/**
 * Centralized env-var access for the E2E suite.
 *
 * Aligns with the mobile suite's convention (E2E_TEST_EMAIL / E2E_TEST_PASSWORD)
 * documented in verse-mate-mobile/.maestro/README.md so a single set of
 * credentials drives both platforms. Falls back to the existing migration
 * suite's `VM_TEST_*` names so this co-exists with tests/migration/.
 */

export const TEST_EMAIL =
  process.env.E2E_TEST_EMAIL ||
  process.env.VM_TEST_EMAIL ||
  'chaves.augusto+verse@gmail.com';

export const TEST_PASSWORD =
  process.env.E2E_TEST_PASSWORD ||
  process.env.VM_TEST_PASSWORD ||
  '';

/** True when authenticated specs should run; false skips them with a clear reason. */
export const HAS_AUTH_CREDENTIALS = TEST_PASSWORD.length > 0;

export const skipReasonNoAuth =
  'No E2E_TEST_PASSWORD set — authenticated tests skipped. ' +
  'Set E2E_TEST_EMAIL + E2E_TEST_PASSWORD to enable.';

export const E2E_PORT = Number(process.env.E2E_PORT || 5173);

export const BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${E2E_PORT}`;

/**
 * localStorage key the web app writes once a visitor dismisses the first-run
 * feature tour (see src/components/onboarding/FeatureOnboarding.tsx). The tour
 * renders as a full-screen overlay on first visit; left unset under test it
 * would intercept every click and hang the suite, so the E2E default
 * storageState seeds this flag to start every spec as a returning visitor.
 */
export const ONBOARDING_SEEN_KEY = 'versemate-onboarding-seen';

/**
 * Guest storageState: no auth cookies, but with the first-run tour marked as
 * seen so the onboarding overlay never blocks interactions. `origin` must match
 * the app origin under test (defaults to the suite's BASE_URL).
 */
export function guestStorageState(origin: string = BASE_URL) {
  return {
    cookies: [],
    origins: [{ origin, localStorage: [{ name: ONBOARDING_SEEN_KEY, value: '1' }] }],
  };
}
