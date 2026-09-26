import { expect, test } from '@playwright/test';

import { capture, LEADER_ID, MEETING_LINK, NEWEST_ID, useCoachApi } from './fixtures';

test.describe('A retained recording, for a leader who saved a meeting link', () => {
  test('is offered to the leader, and the meeting link is never labelled a recording', async ({
    page,
  }, testInfo) => {
    await useCoachApi(page, { retained: [NEWEST_ID] });
    await page.goto('/coach');

    await expect(page.getByTestId(`coach-recording-play-${NEWEST_ID}`)).toBeVisible();
    await expect(page.locator(`a[href="${MEETING_LINK}"]`, { hasText: /recording/i })).toHaveCount(0);
    await capture(page, testInfo, 'r5-leader-retained-with-meeting-link', page.getByTestId(`coach-recording-play-${NEWEST_ID}`));
  });

  test('is offered to an admin on the leader dashboard', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, retained: [NEWEST_ID] });
    await page.goto(`/coach/leader/${LEADER_ID}`);

    await expect(page.getByTestId(`coach-recording-play-${NEWEST_ID}`)).toBeVisible();
    await expect(page.getByTestId(`coach-recording-attached-${NEWEST_ID}`)).toHaveCount(0);
    await capture(page, testInfo, 'r5-admin-retained-with-meeting-link', page.getByTestId(`coach-recording-play-${NEWEST_ID}`));
  });

  test('is offered to an admin on the management screen', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'the full report renders on the desktop layout');
    await useCoachApi(page, { admin: true, retained: [NEWEST_ID] });
    await page.goto(`/coach/leader/${LEADER_ID}/manage`);

    const notes = page.getByTestId(`coach-session-notes-${NEWEST_ID}`);
    await expect(notes.getByTestId(`coach-recording-play-${NEWEST_ID}`)).toBeVisible();
    await capture(page, testInfo, 'r5-admin-manage-retained-with-meeting-link', notes);
  });

  test('gives way to a link an admin attached deliberately', async ({ page }, testInfo) => {
    const link = 'https://drive.example.test/recording.mp4';
    await useCoachApi(page, { retained: [NEWEST_ID], attached: { [NEWEST_ID]: link } });
    await page.goto('/coach');

    await expect(page.getByTestId(`coach-recording-attached-${NEWEST_ID}`)).toHaveAttribute('href', link);
    await expect(page.getByTestId(`coach-recording-play-${NEWEST_ID}`)).toHaveCount(0);
    await capture(page, testInfo, 'r5-attached-link-wins', page.getByTestId(`coach-recording-attached-${NEWEST_ID}`));
  });
});
