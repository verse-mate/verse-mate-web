import { test, expect } from '@playwright/test';

/**
 * Smoke — extra route coverage beyond `smoke/routing.spec.ts`.
 *
 * Maps to FEATURES.md §1 (Routing parity table). Each test asserts the
 * minimum-viable signal that a given route mounts the right screen.
 * These are intentionally cheap (no API timing assertions) — anything
 * failing here means the SPA bundle, route table, or BibleRoute slug
 * resolver is broken.
 *
 * The "anchor" /bible/james/1 test here complements
 * `bible/james-anchor.spec.ts` (which exercises the reader in depth).
 * Here we just prove the URL resolves to the reader chrome.
 */

test.describe('Smoke — extra routes', () => {
  test('/bible/james/1 (production anchor URL) resolves to the reader', async ({ page, viewport }) => {
    await page.goto('/bible/james/1');
    if (!viewport || viewport.width < 1024) {
      // Mobile: ReadingScreen header is visible.
      await expect(page.getByTestId('chapter-selector-button')).toBeVisible({ timeout: 15_000 });
    } else {
      // Desktop: DesktopLayout shell is visible.
      await expect(page.getByTestId('desktop-layout')).toBeVisible({ timeout: 15_000 });
    }
  });

  test('/logout route renders without crashing (guest)', async ({ page }) => {
    // Logout is a route component that fires sign-out side-effects and
    // navigates onwards. For a guest, it should not throw and should land
    // somewhere reachable (/read, /bible/..., /login, or /menu).
    await page.goto('/logout');
    await page.waitForURL(/\/read|\/bible\/|\/login|\/menu/, { timeout: 15_000 });
  });

  test('/bible/<unknown-book>/1 resolves to NotFound or a sane fallback', async ({ page }) => {
    await page.goto('/bible/not-a-real-book-xyz/1');
    // The app may either render NotFound text or rewrite the slug back to
    // Genesis (BibleRoute's slug resolver falls back when no match exists).
    // Either is acceptable — we just want to confirm we don't error.
    await expect(page.locator('body')).toContainText(/not found|404|genesis|james|john/i, {
      timeout: 15_000,
    });
  });

  test('/topics/<unknown-id> renders without crashing', async ({ page }) => {
    await page.goto('/topics/99999999');
    // TopicEventsScreen handles unknown topicIds by showing "Loading…"
    // until the API returns, then renders an empty / not-found UI. Either
    // surface is acceptable for smoke coverage.
    await expect(page.getByTestId('screen-header-back-button').or(page.getByText(/not found/i))).toBeVisible({
      timeout: 15_000,
    });
  });
});
