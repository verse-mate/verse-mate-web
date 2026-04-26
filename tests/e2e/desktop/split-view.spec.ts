import { test, expect } from '@playwright/test';
import { DesktopReaderPage } from '../pages/desktop.page';

/**
 * Desktop split-view layout spec.
 *
 * `DesktopLayout` renders only at viewports ≥1024px, so this entire file
 * is project-skipped on `chromium-mobile`. Maps to FEATURES.md §3.11
 * (Desktop / split-view), the web complement to the mobile repo's
 * existing `e2e/desktop/` Playwright suite.
 *
 * What we cover here:
 *   - Layout root + both panels render                  [P1]
 *   - Persistent left sidebar with book list           [P2]
 *   - Right panel renders commentary by default        [P1]
 *   - Commentary tab switching in the SHARED header    [P1]
 *   - Drag divider resizes the panels                  [P3]
 *
 * What we do NOT cover here (yet): chapter advancement / verse-actions
 * on desktop — gated by the same production state-revert bug as
 * `bible/load-and-navigate.spec.ts`.
 */

test.skip(
  ({ viewport }) => !viewport || viewport.width < 1024,
  'DesktopLayout only mounts at >=1024px',
);

test.describe('Desktop — split view layout', () => {
  test('layout root, sidebar, both panels, divider all render', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    await desktop.goto('genesis', 1);

    await expect(desktop.layoutRoot).toBeVisible();
    await expect(desktop.sidebar).toBeVisible();
    await expect(desktop.leftPanel).toBeVisible();
    await expect(desktop.rightPanel).toBeVisible();
    await expect(desktop.splitBody).toBeVisible();
    await expect(desktop.splitDivider).toBeVisible();
  });

  test('shared header surfaces chapter selector + hamburger', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    await desktop.goto('genesis', 1);

    await expect(desktop.chapterSelector).toBeVisible();
    await expect(desktop.chapterSelector).toContainText(/Genesis 1/);
    await expect(desktop.hamburgerMenu).toBeVisible();
  });

  test('commentary tabs render in shared header', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    await desktop.goto('genesis', 1);

    await expect(desktop.tabSummary).toBeVisible();
    await expect(desktop.tabByline).toBeVisible();
    await expect(desktop.tabDetailed).toBeVisible();
  });

  test('switching to Summary tab shows summary heading in right panel', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    await desktop.goto('genesis', 1);

    await desktop.tabSummary.click();
    await expect(
      desktop.rightPanel.getByText(/Summary of Genesis 1|No summary available/i),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('switching to Detailed tab shows in-depth heading in right panel', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    await desktop.goto('genesis', 1);

    await desktop.tabDetailed.click();
    await expect(
      desktop.rightPanel.getByText(/In-Depth Analysis of Genesis 1|Detailed commentary not available/i),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('split divider can be dragged to resize panels', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    await desktop.goto('genesis', 1);

    const before = await desktop.leftPanel.boundingBox();
    if (!before) throw new Error('Left panel has no bounding box');

    await desktop.dragDivider(150);
    await page.waitForTimeout(200); // settle the resize animation

    const after = await desktop.leftPanel.boundingBox();
    if (!after) throw new Error('Left panel has no bounding box after drag');

    // The drag should have widened the left panel (within bounds enforced
    // by MIN_LEFT_PCT/MAX_LEFT_PCT in DesktopLayout).
    expect(after.width).toBeGreaterThan(before.width);
  });
});
