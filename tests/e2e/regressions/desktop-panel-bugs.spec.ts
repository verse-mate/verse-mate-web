import { test, expect } from '@playwright/test';
import { DesktopReaderPage } from '../pages/desktop.page';
import { BookSelectorPage } from '../pages/book-selector.page';

/**
 * Regression — desktop split-view panel state (issue #128).
 *
 * Before the fix, two related bugs surfaced together when navigating to a
 * topic from `/bible/<book>/<chapter>` on desktop:
 *
 * **Bug A — right panel was sticky across URL changes.**
 * `DesktopLayout` held `rightPanelView` in local state. The menu overlay
 * set it via `openRightPanel('bookmarks')` etc., but nothing reset it
 * when the URL changed — so Bookmarks (or any other menu page) stayed
 * pinned in the right panel after the user navigated to a topic.
 *
 * **Bug B — non-Bible routes still rendered inside the Bible split-view chrome.**
 * `AppLayout` always mounted `DesktopLayout` on desktop, regardless of
 * the URL. `/topic/<cat>/<slug>` therefore landed inside the left "Bible
 * reading" panel while the surrounding header still showed the previously
 * active book/chapter and the right-panel commentary tabs.
 *
 * **Fix:** `AppLayout` is now route-aware — it only mounts `DesktopLayout`
 * for Bible-reading paths (`/bible/*`, `/read`, `/read/*`). Other paths
 * render full-screen via the mobile-style `<Outlet />` shell on every
 * viewport. Navigating to a topic unmounts `DesktopLayout`, which throws
 * away its stale `rightPanelView` state — Bug A and Bug B fall out
 * together.
 *
 * Desktop-only — Bug B has no analogue on mobile (no split chrome).
 */

test.skip(
  ({ viewport }) => !viewport || viewport.width < 1024,
  'Issue #128 panel bugs only manifest at >=1024px',
);

test.describe('Regression — desktop split-view panel state (#128)', () => {
  test('Bug A: navigating to a topic clears any menu page from the right panel', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    const picker = new BookSelectorPage(page);

    await desktop.goto('james', 1);
    await expect(desktop.layoutRoot).toBeVisible();

    // Step 1 — open menu, click Bookmarks. On desktop the hamburger menu
    // is wired to `openRightPanel('bookmarks')` rather than navigating to
    // `/bookmarks`, so this is the production reproduction path.
    // The desktop hamburger button is absolutely positioned and intermittently
    // overlapped by header elements in test runs; bypass Playwright's
    // actionability checks by firing the DOM click directly.
    await desktop.hamburgerMenu.evaluate((el) => (el as HTMLElement).click());
    await page.getByRole('button', { name: /^bookmarks$/i }).first().click();

    // Sanity: Bookmarks now in the right panel.
    await expect(desktop.rightPanel.getByText(/^bookmarks$/i).first()).toBeVisible({
      timeout: 10_000,
    });

    // Step 2 — open the chapter selector, pick a topic.
    await desktop.chapterSelector.click();
    await expect(picker.modal).toBeVisible();
    await picker.tabTopics.click();
    const firstTopic = page.locator('[data-testid^="topic-item-"]').first();
    await firstTopic.click();

    // URL should now be a topic URL.
    await expect(page).toHaveURL(/\/topics?\//, { timeout: 10_000 });

    // After the fix, `DesktopLayout` is unmounted — the right-panel
    // Bookmarks state is gone with it. The desktop right panel testid
    // should not exist anywhere on a topic page.
    await expect(desktop.rightPanel).toHaveCount(0);
    await expect(page.getByText(/^bookmarks$/i)).toHaveCount(0);
  });

  test('Bug B: topic routes render full-screen, not inside Bible chrome', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    const picker = new BookSelectorPage(page);

    await desktop.goto('james', 1);
    await desktop.chapterSelector.click();
    await picker.tabTopics.click();
    await page.locator('[data-testid^="topic-item-"]').first().click();
    await expect(page).toHaveURL(/\/topics?\//, { timeout: 10_000 });

    // After the fix, `AppLayout` falls through to the single-panel shell
    // for non-reading paths — the split-view chrome (sidebar, left/right
    // panels, commentary tabs) is gone entirely.
    await expect(desktop.layoutRoot).toHaveCount(0);
    await expect(desktop.sidebar).toHaveCount(0);
    await expect(desktop.leftPanel).toHaveCount(0);
    await expect(desktop.rightPanel).toHaveCount(0);
    await expect(desktop.tabSummary).toHaveCount(0);
    await expect(desktop.tabByline).toHaveCount(0);
    await expect(desktop.tabDetailed).toHaveCount(0);
  });

  test('Returning to /bible from a topic re-mounts the split-view cleanly', async ({ page }) => {
    const desktop = new DesktopReaderPage(page);
    const picker = new BookSelectorPage(page);

    // Reproduce the bug A trigger so we have stale state to clear.
    await desktop.goto('james', 1);
    // The desktop hamburger button is absolutely positioned and intermittently
    // overlapped by header elements in test runs; bypass Playwright's
    // actionability checks by firing the DOM click directly.
    await desktop.hamburgerMenu.evaluate((el) => (el as HTMLElement).click());
    await page.getByRole('button', { name: /^bookmarks$/i }).first().click();
    await desktop.chapterSelector.click();
    await picker.tabTopics.click();
    await page.locator('[data-testid^="topic-item-"]').first().click();
    await expect(page).toHaveURL(/\/topics?\//, { timeout: 10_000 });

    // Navigate back to a Bible reading URL — DesktopLayout should remount
    // with the right panel back to its default ("commentary") view,
    // showing the commentary tabs and NOT a stale Bookmarks list.
    await page.goto('/bible/james/1');
    await expect(desktop.layoutRoot).toBeVisible();
    await expect(desktop.rightPanel).toBeVisible();
    await expect(desktop.tabSummary).toBeVisible();
    await expect(desktop.rightPanel.getByText(/^bookmarks$/i)).toHaveCount(0);
  });
});
