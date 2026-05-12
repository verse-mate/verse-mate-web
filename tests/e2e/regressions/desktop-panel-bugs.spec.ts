import { test, expect } from '@playwright/test';
import { DesktopReaderPage } from '../pages/desktop.page';
import { BookSelectorPage } from '../pages/book-selector.page';

/**
 * Regression — desktop split-view panel state.
 *
 * Behavior history for topic routes on the desktop split-view:
 *
 * - Pre-#128: topic URLs landed inside the left "Bible reading" panel
 *   with the entire split-view (sidebar, chapter selector, commentary
 *   tabs, right pane) still mounted around them — visually broken.
 * - #128 fix: `AppLayout` was made route-aware; topic routes fell
 *   through to a single-panel mobile shell, fully unmounting
 *   `DesktopLayout`.
 * - Light-theme port: split-view was reinstated for topic routes
 *   ("bug — when clicking on a Topic we lose formatting and it goes
 *   to full screen") so the sidebar stays available. The right-pane
 *   commentary chrome remained mounted at first.
 * - **Current** (post-topic-fix): `DesktopLayout` stays mounted on
 *   topic routes so the sidebar + app-header are still there, but the
 *   chapter selector, commentary tab pills, divider and right pane
 *   all hide because they're tied to a Bible passage that the topic
 *   route doesn't have. The topic content takes the full width of
 *   `.split-body` via the left-panel `<Outlet />`.
 *
 * The right-panel title (when a sub-screen is open) is also hoisted
 * out of the panel body into the main `.app-header` dark banner per
 * user feedback ("The word 'notes' should be raised up to the top
 * level banner"). The label lives in
 * `[data-testid="desktop-right-panel-title"]` in the header, not as
 * a child of `[data-testid="desktop-right-panel"]`.
 *
 * These specs guard the **current** behavior.
 *
 * Desktop-only — split-view chrome only exists at ≥1024px.
 */

test.skip(
  ({ viewport }) => !viewport || viewport.width < 1024,
  'Desktop split-view only manifests at >=1024px',
);

test.describe('Regression — desktop split-view panel state (post-light-theme)', () => {
  test('topic navigation keeps the sidebar + layout mounted but drops Bible-only chrome', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    const picker = new BookSelectorPage(page);

    await desktop.goto('james', 1);
    await expect(desktop.layoutRoot).toBeVisible();
    // Sanity: chapter selector is visible BEFORE we navigate to a topic.
    await expect(desktop.chapterSelector).toBeVisible();

    // Open the chapter selector and pick a topic.
    await desktop.chapterSelector.click();
    await expect(picker.modal).toBeVisible();
    await picker.tabTopics.click();
    const firstTopic = page.locator('[data-testid^="topic-item-"]').first();
    await firstTopic.click();

    // URL should now be a topic URL.
    await expect(page).toHaveURL(/\/topics?\//, { timeout: 10_000 });

    // Layout shell + sidebar stay mounted so the user can still
    // navigate via the books sidebar / hamburger menu.
    await expect(desktop.layoutRoot).toBeVisible();
    await expect(desktop.sidebar).toBeVisible();
    await expect(desktop.leftPanel).toBeVisible();
    await expect(desktop.hamburgerMenu).toBeVisible();

    // Bible-only chrome is hidden on topic routes — chapter selector,
    // commentary tabs, divider and right pane all unmount because
    // there's no Bible passage to attach them to.
    await expect(desktop.chapterSelector).toHaveCount(0);
    await expect(desktop.tabSummary).toHaveCount(0);
    await expect(desktop.splitDivider).toHaveCount(0);
    await expect(desktop.rightPanel).toHaveCount(0);
  });

  test('topic content fills the split-body when right pane is unmounted', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    const picker = new BookSelectorPage(page);

    await desktop.goto('james', 1);
    await desktop.chapterSelector.click();
    await picker.tabTopics.click();
    await page.locator('[data-testid^="topic-item-"]').first().click();
    await expect(page).toHaveURL(/\/topics?\//, { timeout: 10_000 });

    // With the right pane + divider gone, the left panel should expand
    // to take ~the full split-body width (within a few px) so the
    // topic content isn't crammed into the previous ~50% slot.
    await expect(desktop.leftPanel).toBeVisible();
    const leftBox = await desktop.leftPanel.boundingBox();
    const splitBox = await desktop.splitBody.boundingBox();
    if (!leftBox || !splitBox) throw new Error('layout boxes missing');
    expect(leftBox.width).toBeGreaterThan(splitBox.width - 4);
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
