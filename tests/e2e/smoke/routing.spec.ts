import { test, expect } from '@playwright/test';

/**
 * Smoke — top-level routing.
 *
 * Maps to FEATURES.md §1 (Routing parity table).
 *
 * Cheap, ultra-fast checks that the major routes resolve. Anything failing
 * here usually means the SPA bundle is broken or a route was renamed.
 */

test.describe('Smoke — routing', () => {
  test('/ redirects to /read (which then shows the reader)', async ({ page, viewport }) => {
    await page.goto('/');
    // App.tsx: <Route path="/" element={<Navigate to="/read" replace />} />
    // ReadingScreen also rewrites to /bible/<slug>/<n> via its useEffect,
    // so accept either /read or /bible/...
    await expect(page).toHaveURL(/\/read$|\/bible\//, { timeout: 15_000 });

    // On mobile, ReadingScreen's own header is visible — assert that.
    // On desktop, the per-screen header is hidden by CSS (DesktopLayout
    // renders its own shared chrome) — just confirm we landed somewhere
    // that isn't NotFound.
    if (!viewport || viewport.width < 1024) {
      await expect(page.getByTestId('chapter-selector-button')).toBeVisible();
    } else {
      await expect(page.locator('body')).not.toContainText(/page not found/i);
    }
  });

  test('/menu/signin redirects to /login (alias)', async ({ page }) => {
    await page.goto('/menu/signin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/bible/1/1 redirects to slug-form (numeric → slug)', async ({ page }) => {
    await page.goto('/bible/1/1');
    await expect(page).toHaveURL(/\/bible\/genesis\/1/, { timeout: 15_000 });
  });

  test('unknown route renders the NotFound page', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    // NotFound.tsx renders some text along the lines of "Not Found" or "404".
    // Loose match to avoid coupling to a specific copy revision.
    await expect(page.locator('body')).toContainText(/not found|404|page not/i, {
      timeout: 10_000,
    });
  });
});
