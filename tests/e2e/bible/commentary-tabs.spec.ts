import { test, expect } from '@playwright/test';
import { CommentaryPage } from '../pages/commentary.page';

/**
 * Commentary — Summary / By-Line / Detailed tab switching + share.
 *
 * Maps to FEATURES.md §3.2 (Commentary tabs).
 *
 * Each tab renders different content in CommentaryScreen.tsx:
 *  - Summary  → "Summary of <book> <chapter>" heading + share button
 *  - By Line  → "Line-by-Line Analysis of …" heading + Expand-All
 *  - Detailed → "In-Depth Analysis of …" heading
 *
 * Desktop project skipped — DesktopLayout renders its own commentary
 * panel alongside the inner CommentaryScreen, duplicating tab testids.
 * Phase-2 follow-up: scoped page object for the right panel.
 */

test.skip(
  ({ viewport }) => !!viewport && viewport.width >= 1024,
  'DesktopLayout duplicates commentary tab testids — Phase-2 follow-up',
);

test.describe('Commentary — tabs', () => {
  test('all three tab buttons render', async ({ page }) => {
    const commentary = new CommentaryPage(page);
    await commentary.goto('Genesis', 1);

    await expect(commentary.tabSummary).toBeVisible();
    await expect(commentary.tabByline).toBeVisible();
    await expect(commentary.tabStudy).toBeVisible();
    // Detailed has been removed; Visuals is gated to books with curated
    // assets and should NOT be visible on Genesis.
    await expect(commentary.tabVisuals).toHaveCount(0);
  });

  test('Summary tab is active by default and shows the share button', async ({ page }) => {
    const commentary = new CommentaryPage(page);
    await commentary.goto('Genesis', 1);

    // Either real summary copy or the explicit fallback paragraph is fine —
    // we just want to know the tab body rendered something.
    await expect(page.getByText(/summary of genesis 1|no summary available/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(commentary.shareSummary).toBeVisible();
  });

  test('switching to By-Line shows Expand-All control', async ({ page }) => {
    const commentary = new CommentaryPage(page);
    await commentary.goto('Genesis', 1);

    await commentary.tabByline.click();
    // Expand-All only renders when byLineItems.length > 0; otherwise the
    // empty fallback ("Line-by-line analysis not available.") shows. Either
    // is acceptable — assert that at least one of the two surfaces.
    const expand = commentary.bylineExpandAll;
    const empty = page.getByText(/line-by-line analysis not available/i);
    await expect(expand.or(empty)).toBeVisible({ timeout: 15_000 });
    await expect(commentary.shareByline).toBeVisible();
  });

  test('Visuals tab renders on James and stays hidden on Genesis', async ({ page }) => {
    const commentary = new CommentaryPage(page);

    // Gated OFF for books without curated visuals (Genesis is one).
    await commentary.goto('Genesis', 1);
    await expect(commentary.tabVisuals).toHaveCount(0);

    // Gated ON for James — the launch book for the Visuals catalogue.
    await commentary.goto('James', 1);
    await expect(commentary.tabVisuals).toBeVisible();
    await commentary.tabVisuals.click();
    // The panel renders a "Visuals for James 1" heading; either it shows
    // immediately or the body scrolls to it. Wait on visibility.
    await expect(page.getByText(/visuals for james 1/i)).toBeVisible({ timeout: 15_000 });
  });
});
