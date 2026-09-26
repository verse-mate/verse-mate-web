import { expect, test } from '@playwright/test';

import {
  capture,
  HELD_SESSION,
  LEADER_ID,
  MEETING_LINK,
  NEWEST_ID,
  PARKED_SESSION,
  useCoachApi,
} from './fixtures';

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

test.describe('The admin pipeline surface', () => {
  test('shows what is stuck and why, and puts a parked session back in the queue', async ({
    page,
  }, testInfo) => {
    await useCoachApi(page, { admin: true });
    await page.goto('/coach');
    await page.getByTestId('oversight-nav-pipeline').click();

    const parked = page.getByTestId(`coach-pipeline-${PARKED_SESSION.sourceSessionId}`);
    await expect(parked).toContainText(PARKED_SESSION.title);
    await expect(parked).toContainText(PARKED_SESSION.reason);
    await expect(page.getByTestId(`coach-pipeline-${HELD_SESSION.sourceSessionId}`)).toContainText(HELD_SESSION.reason);
    await capture(page, testInfo, 'r3-pipeline-stuck', parked);

    await page.getByTestId(`coach-pipeline-requeue-${PARKED_SESSION.sourceSessionId}`).click();
    await expect(parked).toHaveCount(0);
  });

  test('releases a report held for review', async ({ page }, testInfo) => {
    const calls: string[] = [];
    await useCoachApi(page, { admin: true, onPipelineRequest: (u) => calls.push(u) });
    await page.goto('/coach');
    await page.getByTestId('oversight-nav-pipeline').click();

    await page.getByTestId(`coach-pipeline-release-${HELD_SESSION.sourceSessionId}`).click();
    await expect(page.getByTestId(`coach-pipeline-${HELD_SESSION.sourceSessionId}`)).toHaveCount(0);
    expect(calls).toContain(`/coach/admin/reports/${HELD_SESSION.reportId}/release`);
    await expect(page.getByTestId(`coach-pipeline-release-${PARKED_SESSION.sourceSessionId}`)).toHaveCount(0);
    await capture(page, testInfo, 'r3-pipeline-released');
  });

  test('shows the coverage report', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true });
    await page.goto('/coach');
    await page.getByTestId('oversight-nav-pipeline').click();

    await expect(page.getByTestId('coach-coverage-summary')).toContainText('1 of 2 leaders covered over the last 30 days');
    await expect(page.getByTestId('coach-coverage-uncovered')).toContainText('Not covered');
    await capture(page, testInfo, 'r3-coverage', page.getByTestId('coach-coverage-summary'));
  });

  test('shows a server failure as a failure, not as an empty queue', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, pipelineStatus: 500 });
    await page.goto('/coach');
    await page.getByTestId('oversight-nav-pipeline').click();

    await expect(page.getByTestId('coach-pipeline-failed')).toBeVisible();
    await expect(page.getByTestId('coach-pipeline-failed')).toContainText('Server error (500)');
    await expect(page.getByTestId('coach-pipeline-empty')).toHaveCount(0);
    await capture(page, testInfo, 'r3-pipeline-server-failure');
  });

  test('is never shown to a leader', async ({ page }) => {
    const calls: string[] = [];
    await useCoachApi(page, { onPipelineRequest: (u) => calls.push(u) });
    await page.goto('/coach');

    await expect(page.getByText('August 29, 2026').first()).toBeVisible();
    await expect(page.getByTestId('oversight-nav-pipeline')).toHaveCount(0);
    await expect(page.getByTestId('coach-pipeline')).toHaveCount(0);
    expect(calls).toEqual([]);
  });
});

test.describe('The admin screen reads the served rubric', () => {
  test('names a program composite of 30 by the served band it falls in', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, programAvg: 30 });
    await page.goto('/coach');

    await expect(page.getByText(/a Early Stage program month/)).toBeVisible();
    await expect(page.getByText(/a Developing program month/)).toHaveCount(0);
    const mix = page.getByTestId('oversight-status-mix');
    for (const band of ['Exceptional', 'Strong', 'On Target', 'Developing', 'Early Stage']) {
      await expect(mix.getByTestId(`oversight-status-mix-${band}`)).toBeVisible();
    }
    await expect(mix.getByTestId('oversight-status-mix-Strong')).toContainText('1');
    await capture(page, testInfo, 'r6-program-band', mix);
  });

  test('shows served dimension names and rolls them up by the served clusters', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true });
    await page.goto('/coach');
    await page.getByTestId(`oversight-roster-${LEADER_ID}`).click();

    await expect(page.getByTestId('oversight-cluster-mix-Teaching Craft')).toContainText('80%');
    await expect(page.getByTestId('oversight-cluster-mix-Building Ministry')).toContainText('N/A');
    await expect(page.getByText('Dimension 1', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Structure & Flow')).toHaveCount(0);
    await capture(page, testInfo, 'r6-served-dimensions-and-clusters', page.getByTestId('oversight-cluster-mix-Teaching Craft'));
  });
});
