import { test, expect } from '@playwright/test';

/**
 * Jesus tab — hub, browse, timeline, studies and entry detail.
 *
 * Every screen is data-driven off `GET /jesus/*`, so these assert on the
 * structural test ids and on a handful of entries that are part of the seeded
 * corpus (the I AM statements, the parables) rather than on counts, which grow
 * as content is curated.
 */

test.describe('Jesus — hub', () => {
  test('hub renders the browse skeleton', async ({ page }) => {
    await page.goto('/jesus');

    await expect(page.getByTestId('jesus-screen-title')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('jesus-hub-tagline')).toContainText(
      /Explore His life, words, and actions/i,
    );

    // The hero entry point, the nine kinds, the theme row and the studies.
    await expect(page.getByTestId('jesus-follow-his-life')).toBeVisible();
    await expect(page.getByTestId('jesus-kind-miracles')).toBeVisible();
    await expect(page.getByTestId('jesus-kind-parables')).toBeVisible();
    await expect(page.getByTestId('jesus-kind-questions')).toBeVisible();
    await expect(page.getByTestId('jesus-theme-row')).toBeVisible();
    await expect(page.getByTestId('jesus-studies-list')).toBeVisible();
  });

  test('search returns matching entries', async ({ page }) => {
    await page.goto('/jesus');
    await expect(page.getByTestId('jesus-search-input')).toBeVisible({ timeout: 15_000 });

    await page.getByTestId('jesus-search-input').fill('prodigal');

    await expect(page.getByTestId('jesus-search-results')).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByTestId('jesus-entry-card-parable-of-the-prodigal-son'),
    ).toBeVisible();
  });

  test('a kind card opens its list', async ({ page }) => {
    await page.goto('/jesus');
    await page.getByTestId('jesus-kind-miracles').click();

    await expect(page).toHaveURL(/\/jesus\/browse\/miracles$/);
    await expect(page.getByTestId('jesus-list-title')).toHaveText(/miracles/i);
    await expect(page.getByTestId('jesus-entry-list')).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Jesus — Follow His Life', () => {
  test('timeline renders every period, including empty ones', async ({ page }) => {
    await page.goto('/jesus/life');

    await expect(page.getByTestId('jesus-life-title')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('jesus-life-period-row')).toBeVisible();

    // The arc is shown whole — a stretch of the ministry with nothing
    // catalogued still appears with its description.
    await expect(page.getByTestId('jesus-life-section-incarnation')).toBeVisible();
    await expect(page.getByTestId('jesus-life-section-passion-week')).toBeVisible();
  });

  test('a period pill drills into that period', async ({ page }) => {
    await page.goto('/jesus/life');
    await page.getByTestId('jesus-life-period-passion-week').click();

    await expect(page).toHaveURL(/\/jesus\/life\/passion-week$/);
    await expect(page.getByTestId('jesus-life-title')).toHaveText(/passion week/i);
  });
});

test.describe('Jesus — studies', () => {
  test('the I AM statements study lists its members in order', async ({ page }) => {
    await page.goto('/jesus/study/the-i-am-statements');

    await expect(page.getByTestId('jesus-list-title')).toHaveText(/I AM statements/i, {
      timeout: 15_000,
    });
    await expect(page.getByTestId('jesus-entry-list')).toBeVisible();
    await expect(
      page.getByTestId('jesus-entry-card-i-am-the-bread-of-life'),
    ).toBeVisible();
    await expect(
      page.getByTestId('jesus-entry-card-before-abraham-was-i-am'),
    ).toBeVisible();
  });

  test('an unknown study shows an empty state rather than erroring', async ({ page }) => {
    await page.goto('/jesus/study/not-a-real-study');
    await expect(page.getByTestId('jesus-empty')).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Jesus — entry detail', () => {
  test('entry shows its quote, scripture and insight tabs', async ({ page }) => {
    await page.goto('/jesus/entry/i-am-the-light-of-the-world');

    await expect(page.getByTestId('jesus-entry-title')).toHaveText(
      /light of the world/i,
      { timeout: 15_000 },
    );
    await expect(page.getByTestId('jesus-entry-kind')).toHaveText(/claim/i);
    await expect(page.getByTestId('jesus-entry-quote')).toContainText(/light of the world/i);
    await expect(page.getByTestId('jesus-entry-themes')).toBeVisible();
    await expect(page.getByTestId('jesus-insight-tabs')).toBeVisible();

    // Insight tabs switch the body without navigating.
    await page.getByTestId('jesus-insight-tab-detailed').click();
    await expect(page.getByTestId('jesus-insight-body')).toBeVisible();
    await expect(page).toHaveURL(/\/jesus\/entry\/i-am-the-light-of-the-world$/);
  });

  test('related entries link on to another entry', async ({ page }) => {
    await page.goto('/jesus/entry/i-am-the-light-of-the-world');
    await expect(page.getByTestId('jesus-entry-related')).toBeVisible({ timeout: 15_000 });

    await page.getByTestId('jesus-entry-link-i-am-the-bread-of-life').click();
    await expect(page).toHaveURL(/\/jesus\/entry\/i-am-the-bread-of-life$/);
    await expect(page.getByTestId('jesus-entry-title')).toHaveText(/bread of life/i);
  });

  test('an unknown entry shows a not-found state', async ({ page }) => {
    await page.goto('/jesus/entry/not-a-real-entry');
    await expect(page.getByTestId('jesus-empty')).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Jesus — search modal tab', () => {
  test('the Jesus tab sits between New Testament and Topics', async ({ page }) => {
    await page.goto('/read');
    await page.getByTestId('chapter-selector-button').first().click();

    await expect(page.getByTestId('bible-navigation-modal')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('tab-jesus')).toBeVisible();

    await page.getByTestId('tab-jesus').click();
    await expect(page.getByTestId('jesus-tab-list')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('jesus-tab-follow-his-life')).toBeVisible();
    await expect(page.getByTestId('jesus-tab-kind-parables')).toBeVisible();
  });

  test('searching in the tab navigates to an entry', async ({ page }) => {
    await page.goto('/read');
    await page.getByTestId('chapter-selector-button').first().click();
    await page.getByTestId('tab-jesus').click();

    await page.getByTestId('jesus-search-input').fill('prodigal');
    await expect(page.getByTestId('jesus-tab-results')).toBeVisible({ timeout: 15_000 });

    await page.getByTestId('jesus-tab-entry-parable-of-the-prodigal-son').click();
    await expect(page).toHaveURL(/\/jesus\/entry\/parable-of-the-prodigal-son$/);
  });
});
