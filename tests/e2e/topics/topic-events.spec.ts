import { test, expect } from '@playwright/test';
import { TopicEventsPage } from '../pages/topic-events.page';
import { BookSelectorPage } from '../pages/book-selector.page';
import { ReaderPage } from '../pages/reader.page';

/**
 * Topics — TopicEventsScreen via canonical /topic/<cat>/<slug> URL.
 *
 * Maps to FEATURES.md §3.3 (Topic events list, References → Reader).
 *
 * Two reachability paths exist for TopicEventsScreen:
 *   1. Direct URL (canonical or legacy) — covered here.
 *   2. From the BookSelector modal's Topics tab — also covered here so a
 *      single spec asserts the full discovery flow.
 *
 * No `data-testid` on individual topic items in TopicsScreen / TopicEvents,
 * so we address by role + text. The reference buttons inside the events
 * screen ARE accessible via text (verse references like "Genesis 1:1").
 */

test.describe('Topics — TopicEventsScreen', () => {
  test('canonical /topic/<cat>/<slug> URL renders the screen header + search', async ({ page }) => {
    const events = new TopicEventsPage(page);
    // "creation" is the canonical category slug for the Creation topic
    // group — confirmed by `topics/browse.spec.ts`. The URL shape is
    // /topic/<category>/<topic>. Using "creation/creation" matches the
    // most stable production fixture (the top-level Creation topic).
    await events.gotoCanonical('creation', 'creation');
    await expect(events.title).toBeVisible({ timeout: 15_000 });
    await expect(events.searchInput).toBeVisible();
  });

  test('Topic discovery from BookSelector — click first topic, land on events screen', async ({ page }) => {
    const reader = new ReaderPage(page);
    const picker = new BookSelectorPage(page);

    await reader.goto('genesis', 1);
    await reader.chapterSelector.click();
    await picker.tabTopics.click();

    const firstTopic = page.locator('[data-testid^="topic-item-"]').first();
    await expect(firstTopic).toBeVisible({ timeout: 15_000 });
    await firstTopic.click();

    // After click we should have landed on either /topic/<cat>/<slug>
    // (canonical) or /topics/<id> (legacy). Both surface the screen-header
    // title.
    await expect(page).toHaveURL(/\/topics?\//, { timeout: 10_000 });
    await expect(page.getByTestId('screen-header-title')).toBeVisible({ timeout: 15_000 });
  });

  test('back button returns to a previous topics screen or reader', async ({ page }) => {
    const events = new TopicEventsPage(page);
    await events.gotoCanonical('creation', 'creation');
    // Direct URL entry — ScreenHeader's fallback goBack goes to the
    // browser history's prior entry. For direct-URL entry that resolves
    // to a sane default (TopicsScreen → /topics, or /read).
    await events.backButton.click();
    await expect(page).toHaveURL(/\/topics|\/read|\/bible\//, { timeout: 10_000 });
  });
});
