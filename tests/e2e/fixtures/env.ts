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
