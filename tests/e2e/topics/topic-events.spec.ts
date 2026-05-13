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

function topicSelectorLocator(page: import('@playwright/test').Page, viewport: { width: number } | null) {
  // Topic-name dropdown trigger:
  //   - Desktop / tablet  → DesktopLayout's `desktop-chapter-selector-button`
  //   - Phone             → TopicEventsScreen's `topic-selector-button`
  return viewport && viewport.width >= 768
    ? page.getByTestId('desktop-chapter-selector-button')
    : page.getByTestId('topic-selector-button');
}

test.describe('Topics — TopicEventsScreen', () => {
  test('canonical /topic/<cat>/<slug> URL renders the topic selector + search', async ({
    page,
    viewport,
  }) => {
    const events = new TopicEventsPage(page);
    // "creation" is the canonical category slug for the Creation topic
    // group — confirmed by `topics/browse.spec.ts`. The URL shape is
    // /topic/<category>/<topic>. Using "creation/creation" matches the
    // most stable production fixture (the top-level Creation topic).
    await events.gotoCanonical('creation', 'creation');
    await expect(topicSelectorLocator(page, viewport)).toBeVisible({ timeout: 15_000 });
    await expect(events.searchInput).toBeVisible();
  });

  test('Topic discovery from BookSelector — click first topic, land on events screen', async ({
    page,
    viewport,
  }) => {
    // ReaderPage relies on the mobile `chapter-selector-button` testid,
    // which DesktopLayout duplicates with its own `desktop-`-prefixed
    // copy — strict-mode visibility waits flake on desktop. Same Phase-2
    // deferral pattern used by `bible/*.spec.ts`.
    test.skip(
      !!viewport && viewport.width >= 1024,
      'DesktopLayout duplicates reader testids — Phase-2 follow-up',
    );
    const reader = new ReaderPage(page);
    const picker = new BookSelectorPage(page);

    await reader.goto('genesis', 1);
    await reader.chapterSelector.click();
    await picker.tabTopics.click();

    const firstTopic = page.locator('[data-testid^="topic-item-"]').first();
    await expect(firstTopic).toBeVisible({ timeout: 15_000 });
    await firstTopic.click();

    // After click we should have landed on either /topic/<cat>/<slug>
    // (canonical) or /topics/<id> (legacy). The topic-name dropdown
    // trigger confirms we're on the topic page in either viewport.
    await expect(page).toHaveURL(/\/topics?\//, { timeout: 10_000 });
    await expect(topicSelectorLocator(page, viewport)).toBeVisible({ timeout: 15_000 });
  });

  test('topic page has no back arrow — topic name acts as the chapter selector', async ({
    page,
    viewport,
  }) => {
    const events = new TopicEventsPage(page);
    await events.gotoCanonical('creation', 'creation');

    // Topics are treated like a Bible chapter — no in-page ScreenHeader
    // back arrow. The topic name lives in the same dropdown slot the
    // reader uses for "Genesis 1".
    await expect(page.getByTestId('screen-header-back-button')).toHaveCount(0);
    await expect(topicSelectorLocator(page, viewport)).toBeVisible({ timeout: 10_000 });
  });
});
