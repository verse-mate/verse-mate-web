import { test, expect } from '@playwright/test';

/**
 * Regression specs for divergences flagged in FEATURES.md §4.
 *
 * Each test references the divergence number from FEATURES.md §4 and the
 * GitHub issue tracking the bug. When a divergence is fixed, the
 * corresponding test should assert the NEW behavior.
 */

test.describe('Divergences — current behavior snapshots', () => {
  /**
   * Divergence #1 — issue #44 FIXED: `/highlights` now shows an empty
   * state for guests, matching `/bookmarks` and `/notes`. Previously
   * guests were redirected to `/login` because HighlightsScreen called
   * the auth-required `/bible/user/theme-preferences` endpoint on mount.
   */
  test('#1 /highlights shows empty state for guests (matches /bookmarks/notes)', async ({ page }) => {
    await page.goto('/highlights');
    await expect(page.getByTestId('highlights-list')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('highlights-empty-state')).toBeVisible();
    // Should NOT have been redirected to /login.
    expect(page.url()).toContain('/highlights');
    expect(page.url()).not.toContain('/login');
  });

  /**
   * Divergence #2 — issue #45 FIXED: `/create-account` now shows
   * differentiated heading + subcopy and an "Already have an account?"
   * cross-link to /login. The provider buttons are still shared (Google
   * and Apple handle signup transparently regardless of entry point).
   */
  test('#2 /create-account shows signup-specific copy and a /login cross-link', async ({ page }) => {
    await page.goto('/create-account');
    // Signup-specific heading
    await expect(page.getByText(/Create your VerseMate account/i)).toBeVisible({ timeout: 10_000 });
    // Signup-specific subcopy
    await expect(page.getByText(/Sign up to save your bookmarks/i)).toBeVisible();
    // Email button reflects signup mode
    await expect(page.getByTestId('login-email-button')).toContainText(/Sign up with Email/i);
    // Cross-link back to sign-in
    await expect(page.getByTestId('login-providers-mode-toggle')).toBeVisible();
    await expect(page.getByTestId('login-providers-mode-toggle')).toContainText(/Already have an account/i);
    // Provider buttons still present
    await expect(page.getByTestId('login-google-button')).toBeVisible();
    await expect(page.getByTestId('login-apple-button')).toBeVisible();
  });

  test('#2 /login still shows signin-specific copy', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/Welcome to VerseMate/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Sign in to sync/i)).toBeVisible();
    await expect(page.getByTestId('login-email-button')).toContainText(/Continue with Email/i);
    await expect(page.getByTestId('login-providers-mode-toggle')).toContainText(/Don't have an account/i);
  });

  /**
   * Divergence #3 — issue #46 FIXED: commentary route now accepts both
   * the lowercase slug (canonical, matches `/bible/<slug>`) and the
   * legacy capitalized book name (existing URLs in the wild).
   *
   * Mobile-scoped: at >=1024px, DesktopLayout intercepts `/commentary`
   * URLs and redirects to `/read` because the right panel renders the
   * commentary inline.
   */
  test('#3 /read/<slug>/<chapter>/commentary works with lowercase slug', async ({ page, viewport }) => {
    test.skip(
      !!viewport && viewport.width >= 1024,
      'DesktopLayout redirects /commentary URLs to /read at desktop widths',
    );
    await page.goto('/read/genesis/1/commentary');
    await expect(page.getByTestId('tab-summary')).toBeVisible({ timeout: 15_000 });
  });

  test('#3 /read/<Book>/<chapter>/commentary still accepts capitalized name (backwards compat)', async ({ page, viewport }) => {
    test.skip(
      !!viewport && viewport.width >= 1024,
      'DesktopLayout redirects /commentary URLs to /read at desktop widths',
    );
    await page.goto('/read/Genesis/1/commentary');
    await expect(page.getByTestId('tab-summary')).toBeVisible({ timeout: 15_000 });
  });

  /**
   * Divergence #4 — no theme toggle in /menu/settings (mobile has 3 modes).
   * Asserts the absence; flip when the toggle ships.
   */
  test('#4 /menu/settings exposes no theme picker', async ({ page }) => {
    await page.goto('/menu/settings');
    await expect(page.getByTestId('settings-back-button')).toBeVisible();
    await expect(page.getByTestId('theme-selector-button')).toHaveCount(0);
    await expect(page.getByTestId('theme-option-light')).toHaveCount(0);
    await expect(page.getByTestId('theme-option-dark')).toHaveCount(0);
  });

  /**
   * Divergence #5 — `/menu/giving` CTA is a `mailto:` link, not a real
   * payment integration. Verify the CTA href schema.
   */
  test('#5 /menu/giving CTA is a mailto: link', async ({ page }) => {
    await page.goto('/menu/giving');
    // The "Give $X Monthly|One-time" CTA is the primary anchor with a
    // mailto href — match generically so it tracks copy variation.
    const mailto = page.locator('a[href^="mailto:"]').first();
    await expect(mailto).toBeVisible({ timeout: 15_000 });
    const href = await mailto.getAttribute('href');
    expect(href).toMatch(/^mailto:/);
    expect(href).toContain('@versemate.org');
  });

  /**
   * Divergence #6 — issue #49 FIXED: `/menu/about` now exposes Privacy
   * Policy, Terms of Service, and Contact links. URLs point to canonical
   * pages on versemate.org (Privacy, Terms) and a mailto for Contact.
   */
  test('#6 /menu/about exposes Privacy / Terms / Contact links', async ({ page }) => {
    await page.goto('/menu/about');
    await expect(page.getByTestId('about-privacy-link')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('about-terms-link')).toBeVisible();
    await expect(page.getByTestId('about-contact-link')).toBeVisible();
    // Verify hrefs are sensible
    await expect(page.getByTestId('about-privacy-link')).toHaveAttribute(
      'href',
      /https?:\/\/.+\/privacy/,
    );
    await expect(page.getByTestId('about-terms-link')).toHaveAttribute(
      'href',
      /https?:\/\/.+\/terms/,
    );
    await expect(page.getByTestId('about-contact-link')).toHaveAttribute(
      'href',
      /^mailto:.+@versemate\.org/,
    );
  });
});
