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
  test('all four tab buttons render', async ({ page }) => {
    const commentary = new CommentaryPage(page);
    await commentary.goto('Genesis', 1);

    await expect(commentary.tabSummary).toBeVisible();
    await expect(commentary.tabByline).toBeVisible();
    await expect(commentary.tabStudy).toBeVisible();
    // Visuals now ships for every book in the registry (Genesis through
    // Revelation) — minimum content is the BibleProject overview poster
    // plus per-chapter overview video.
    await expect(commentary.tabVisuals).toBeVisible();
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

  test('Visuals tab renders on every book — Genesis (poster only) and James (full set)', async ({ page }) => {
    const commentary = new CommentaryPage(page);

    // Genesis ships only the BibleProject poster + the chapter-aware
    // overview video (no hand-curated originals yet).
    await commentary.goto('Genesis', 1);
    await expect(commentary.tabVisuals).toBeVisible();
    await commentary.tabVisuals.click();
    await expect(page.getByText(/visuals for genesis 1/i)).toBeVisible({ timeout: 15_000 });

    // James is the launch book with all four hand-curated cards
    // (BibleProject poster, Swindoll chart, parallels, heatmap).
    await commentary.goto('James', 1);
    await expect(commentary.tabVisuals).toBeVisible();
    await commentary.tabVisuals.click();
    await expect(page.getByText(/visuals for james 1/i)).toBeVisible({ timeout: 15_000 });
  });
});
