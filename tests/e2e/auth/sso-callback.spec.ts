import { test, expect } from '@playwright/test';

/**
 * Auth — SSO callback handler at `/auth/callback/:provider`.
 *
 * Maps to FEATURES.md §3.1:
 *   - SSO callback success                                    [P0]
 *   - SSO callback error (?error=access_denied / oauth_error) [P1]
 *
 * AuthCallback consumes ?accessToken / ?refreshToken from the URL on
 * success, or ?error / ?error_description on failure. Success requires a
 * valid backend token, which we can't fabricate in this suite without
 * coupling to backend internals — so success is covered transitively by
 * the email/password happy path. This spec covers the error UI only.
 */

test.describe('Auth — SSO callback', () => {
  for (const provider of ['google', 'apple'] as const) {
    test(`renders error UI for ${provider} on access_denied`, async ({ page }) => {
      await page.goto(`/auth/callback/${provider}?error=access_denied`);

      await expect(page.getByText(/sign-in failed/i)).toBeVisible({ timeout: 10_000 });
    });

    test(`renders error UI for ${provider} on oauth_error`, async ({ page }) => {
      await page.goto(
        `/auth/callback/${provider}?error=oauth_error&error_description=Server%20error`,
      );

      await expect(page.getByText(/sign-in failed/i)).toBeVisible({ timeout: 10_000 });
    });
  }
});
