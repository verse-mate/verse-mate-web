import { test, expect } from '@playwright/test';
import { DesktopReaderPage } from '../pages/desktop.page';
import { BookSelectorPage } from '../pages/book-selector.page';

/**
 * Regression — desktop split-view panel state.
 *
 * Originally a guard for two bugs filed under issue #128:
 *
 * - **Bug A** — right-panel state (e.g. Bookmarks) was sticky across URL
 *   changes; navigating to a topic left a stale menu page pinned in the
 *   right panel.
 * - **Bug B** — non-Bible routes still rendered inside the Bible
 *   split-view chrome; topic URLs landed inside the left "Bible reading"
 *   panel with the surrounding sidebar/right-panel/tabs intact.
 *
 * The original guards asserted that `DesktopLayout` *unmounted* on topic
 * routes — the fix for #128 made `AppLayout` route-aware so it fell
 * through to a single-panel mobile shell for non-Bible URLs.
 *
 * That behavior was **reverted** during the light-theme port at the
 * user's explicit request ("bug — when clicking on a Topic we lose
 * formatting and it goes to full screen"). Topic routes now render
 * INSIDE the split-view so the books sidebar, chapter chrome, and
 * commentary tabs stay visible while exploring a topic — the topic
 * content sits in the LEFT panel via `<Outlet />`.
 *
 * The right-panel title (when a sub-screen is open) was also hoisted
 * out of the panel body into the main `.app-header` dark banner per
 * user feedback ("The word 'notes' should be raised up to the top
 * level banner"). The label now lives in
 * `[data-testid="desktop-right-panel-title"]` in the header, not as
 * a child of `[data-testid="desktop-right-panel"]`.
 *
 * These specs are the updated guards for the **current** intended
 * behavior, not the #128-era behavior.
 *
 * Desktop-only — split-view chrome only exists at ≥1024px.
 */

test.skip(
  ({ viewport }) => !viewport || viewport.width < 1024,
  'Desktop split-view only manifests at >=1024px',
);

test.describe('Regression — desktop split-view panel state (post-light-theme)', () => {
  test('topic navigation keeps the desktop split-view chrome mounted', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    const picker = new BookSelectorPage(page);

    await desktop.goto('james', 1);
    await expect(desktop.layoutRoot).toBeVisible();

    // Open the chapter selector and pick a topic.
    await desktop.chapterSelector.click();
    await expect(picker.modal).toBeVisible();
    await picker.tabTopics.click();
    const firstTopic = page.locator('[data-testid^="topic-item-"]').first();
    await firstTopic.click();

    // URL should now be a topic URL.
    await expect(page).toHaveURL(/\/topics?\//, { timeout: 10_000 });

    // After the light-theme behavior change, navigating to a topic
    // KEEPS the desktop split-view chrome (sidebar + left/right panels)
    // mounted — the topic content renders in the left panel via Outlet
    // while the books sidebar + chapter selector remain available.
    await expect(desktop.layoutRoot).toBeVisible();
    await expect(desktop.sidebar).toBeVisible();
    await expect(desktop.leftPanel).toBeVisible();
    await expect(desktop.rightPanel).toBeVisible();
  });

  test('topic routes render inside the desktop split-view chrome', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    const picker = new BookSelectorPage(page);

    await desktop.goto('james', 1);
    await desktop.chapterSelector.click();
    await picker.tabTopics.click();
    await page.locator('[data-testid^="topic-item-"]').first().click();
    await expect(page).toHaveURL(/\/topics?\//, { timeout: 10_000 });

    // Split-view chrome stays mounted on topic routes — confirm every
    // structural landmark is still present.
    await expect(desktop.layoutRoot).toBeVisible();
    await expect(desktop.sidebar).toBeVisible();
    await expect(desktop.leftPanel).toBeVisible();
    await expect(desktop.rightPanel).toBeVisible();
  });

  test('right-panel sub-screen title is hoisted into the top dark banner', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);

    await desktop.goto('james', 1);
    await expect(desktop.layoutRoot).toBeVisible();

    // Open menu → Bookmarks. On desktop the hamburger menu wires
    // `openRightPanel('bookmarks')` rather than navigating to /bookmarks.
    // The hamburger button can be intermittently overlapped by absolutely-
    // positioned header elements; fire the DOM click directly.
    await desktop.hamburgerMenu.evaluate((el) => (el as HTMLElement).click());
    await page.getByRole('button', { name: /^bookmarks$/i }).first().click();

    // After the title-hoist, the "Bookmarks" label lives in the
    // top-banner `[data-testid="desktop-right-panel-title"]` span —
    // NOT as a child of the right panel itself. Both assertions matter:
    // it MUST appear in the banner; it MUST NOT live inside the panel.
    const bannerTitle = page.getByTestId('desktop-right-panel-title');
    await expect(bannerTitle).toBeVisible({ timeout: 10_000 });
    await expect(bannerTitle).toHaveText(/bookmarks/i);

    // The right panel itself stays empty of the title slab — it should
    // not contain a heading-shaped "Bookmarks" element. The body content
    // (empty state copy, list, etc.) is still inside the panel.
    const titleInsidePanel = desktop.rightPanel.getByTestId('desktop-right-panel-title');
    await expect(titleInsidePanel).toHaveCount(0);
  });

  test('Returning to /bible from a topic re-renders the commentary tabs', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    const picker = new BookSelectorPage(page);

    await desktop.goto('james', 1);
    // Open Bookmarks first so the right panel is in a non-default state.
    await desktop.hamburgerMenu.evaluate((el) => (el as HTMLElement).click());
    await page.getByRole('button', { name: /^bookmarks$/i }).first().click();

    // Pick a topic.
    await desktop.chapterSelector.click();
    await picker.tabTopics.click();
    await page.locator('[data-testid^="topic-item-"]').first().click();
    await expect(page).toHaveURL(/\/topics?\//, { timeout: 10_000 });

    // Navigate back to a Bible reading URL. DesktopLayout was never
    // unmounted (we stayed in split-view through the topic), but the
    // commentary tabs should still be available when we return.
    await page.goto('/bible/james/1');
    await expect(desktop.layoutRoot).toBeVisible();
    await expect(desktop.rightPanel).toBeVisible();
    // Commentary tabs come back once the user closes the right-panel
    // sub-screen — the test asserts the chrome is reachable, not that
    // it's necessarily on the commentary view immediately. If Bookmarks
    // is still pinned, the right-panel close chevron exits to commentary.
    const closeBtn = page.getByTestId('desktop-right-panel-close');
    if ((await closeBtn.count()) > 0) {
      await closeBtn.click();
    }
    await expect(desktop.tabSummary).toBeVisible();
  });
});
