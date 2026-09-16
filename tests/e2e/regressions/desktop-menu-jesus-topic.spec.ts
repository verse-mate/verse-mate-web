import { test, expect } from '@playwright/test';
import { DesktopReaderPage } from '../pages/desktop.page';

/**
 * Regression — the side menu was dead on the Jesus and Topic tabs.
 *
 * Reported as: "for Jesus tab and Topic tab — when you hit any menu button on
 * the side menu, nothing happens. Needs to work like it does on Old and New
 * Testament tabs."
 *
 * Cause: `DesktopLayout` renders menu sub-pages (Bookmarks, Notes, Settings, …)
 * in the right pane, but the pane's branch order let the Jesus-event and topic
 * insight panes claim it unconditionally — and the Jesus hub / browse lists
 * force the pane closed entirely (`jesusFullWidth`). Clicking a menu item set
 * `rightPanelView` and closed the drawer with nothing to show for it.
 *
 * Fix: a sub-page outranks every route-specific pane and forces the pane open,
 * so Bible, Topic and Jesus routes all behave the same.
 *
 * Desktop-only — the phone chrome routes to `/menu`, which never had the bug.
 */

test.skip(
  ({ viewport }) => !viewport || viewport.width < 1024,
  'The side-menu overlay with right-pane sub-pages only exists at >=1024px',
);

/** Open the desktop drawer and pick one of its items by visible label. */
async function openMenuItem(page: import('@playwright/test').Page, label: RegExp) {
  const desktop = new DesktopReaderPage(page);
  // The hamburger can be overlapped by absolutely-positioned header elements;
  // fire the DOM click directly (same approach as desktop-panel-bugs.spec.ts).
  await desktop.hamburgerMenu.evaluate((el) => (el as HTMLElement).click());
  await page.getByRole('button', { name: label }).first().click();
}

const ROUTES: { name: string; url: string }[] = [
  // The Jesus hub is the worst case: it runs full-width, so before the fix the
  // right pane wasn't even mounted.
  { name: 'Jesus hub', url: '/jesus' },
  { name: 'Jesus timeline', url: '/jesus/life' },
  { name: 'Topics list', url: '/topics' },
];

for (const route of ROUTES) {
  test(`${route.name} — a side-menu item opens its sub-page in the right pane`, async ({
    page,
  }) => {
    const desktop = new DesktopReaderPage(page);

    await page.goto(route.url);
    await expect(desktop.layoutRoot).toBeVisible();

    await openMenuItem(page, /^bookmarks$/i);

    // The pane is forced open and shows Bookmarks, with the title hoisted into
    // the dark banner exactly as it is on a Bible route.
    await expect(desktop.rightPanel).toBeVisible();
    const bannerTitle = page.getByTestId('desktop-right-panel-title');
    await expect(bannerTitle).toBeVisible();
    await expect(bannerTitle).toHaveText(/bookmarks/i);

    // The route's own insight pills step aside while the sub-page is up.
    await expect(page.getByTestId('desktop-topic-tab-summary')).toHaveCount(0);

    // The back chevron closes it and hands the pane back to the route.
    await page.getByTestId('desktop-right-panel-close').click();
    await expect(page.getByTestId('desktop-right-panel-title')).toHaveCount(0);
    // Closing must not have navigated away from the tab we were on.
    await expect(page).toHaveURL(new RegExp(`${route.url}$`));
  });
}

test('topic detail — every side-menu item reaches its sub-page', async ({ page }) => {
  const desktop = new DesktopReaderPage(page);

  await page.goto('/topics');
  await expect(desktop.layoutRoot).toBeVisible();

  const firstTopic = page.locator('[data-testid^="topic-item-"]').first();
  test.skip((await firstTopic.count()) === 0, 'No seeded topics to drill into');
  await firstTopic.click();
  await expect(page).toHaveURL(/\/topics?\//);

  // Every item the drawer offers — not just Bookmarks — has to land somewhere.
  for (const [label, title] of [
    [/^notes$/i, /notes/i],
    [/^highlights$/i, /highlights/i],
    [/^about$/i, /about/i],
  ] as const) {
    await openMenuItem(page, label);
    const bannerTitle = page.getByTestId('desktop-right-panel-title');
    await expect(bannerTitle).toBeVisible();
    await expect(bannerTitle).toHaveText(title);
  }

  // Backing out returns the pane to the topic's own insight tabs.
  await page.getByTestId('desktop-right-panel-close').click();
  await expect(page.getByTestId('desktop-topic-tab-summary')).toBeVisible();
});
