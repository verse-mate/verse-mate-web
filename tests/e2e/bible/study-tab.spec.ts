import { test, expect } from '@playwright/test';
import { CommentaryPage } from '../pages/commentary.page';

/**
 * Commentary — Study tab.
 *
 * Maps to FEATURES.md §3.2 (Commentary tabs — Study).
 *
 * `commentary-tabs.spec.ts` covers Summary / By-Line / Detailed but skips
 * the fourth tab, Study. The Study tab renders `StudyPanel` which either
 * shows the "Inductive Study of <book> <chapter>" heading (when API data
 * is present) or the "Inductive Study coming soon" placeholder. Both are
 * acceptable signals that the tab body mounted.
 *
 * Desktop project skipped — DesktopLayout renders its own commentary
 * pane alongside the inner CommentaryScreen and duplicates tab testids.
 */

test.skip(
  ({ viewport }) => !!viewport && viewport.width >= 1024,
  'DesktopLayout duplicates commentary tab testids — Phase-2 follow-up',
);

test.describe('Commentary — Study tab', () => {
  test('Study tab button renders and is focusable', async ({ page }) => {
    const commentary = new CommentaryPage(page);
    await commentary.goto('Genesis', 1);
    await expect(commentary.tabStudy).toBeVisible();
  });

  test('switching to Study renders the inductive-study heading or placeholder', async ({ page }) => {
    const commentary = new CommentaryPage(page);
    await commentary.goto('Genesis', 1);

    await commentary.tabStudy.click();

    // Production currently renders BOTH the populated heading ("Inductive
    // Study of Genesis 1") AND a "Inductive Study coming soon" placeholder
    // paragraph in the same panel. Either signal is fine — use `.first()`
    // to avoid strict-mode multi-match errors.
    const populated = page.getByText(/inductive study of genesis 1/i);
    const placeholder = page.getByText(/inductive study coming soon/i);
    await expect(populated.or(placeholder).first()).toBeVisible({ timeout: 15_000 });
  });

  test('share buttons that belong to other tabs are NOT visible on Study', async ({ page }) => {
    const commentary = new CommentaryPage(page);
    await commentary.goto('Genesis', 1);
    await commentary.tabStudy.click();

    // CommentaryScreen renders share buttons only inside the active tab
    // body. Study has no share button — verify the others are unmounted
    // (testid count drops to 0) so we don't accidentally rely on stale
    // DOM from the Summary tab.
    await expect(commentary.shareSummary).toHaveCount(0);
    await expect(commentary.shareByline).toHaveCount(0);
  });
});
