import { expect, test, type Page } from '@playwright/test';

import { API, capture, LEADER_ID, ME, monthlyFor, refuse, serve, useCoachApi } from './fixtures';

const MONTH = '2031-02';

const PROGRAM_REPORT = {
  month: MONTH,
  monthLabel: 'February 2031',
  overview: { sessions: 9, leaders: 2, from: '2031-02-01', to: '2031-02-28' },
  leaderboard: [
    { id: 'alice', name: 'Alice Adams', composite: 84, status: 'Strong' },
    { id: 'bob', name: 'Bob Brown', composite: 71, status: 'Developing' },
  ],
  bands: [
    { label: 'Strong', count: 1 },
    { label: 'Developing', count: 1 },
  ],
  heatMap: {
    dimensions: [
      { n: 1, name: 'Scripture Focus' },
      { n: 2, name: 'Open Questions' },
    ],
    rows: [
      { id: 'alice', name: 'Alice Adams', cells: [{ n: 1, avg: 4.5, mark: 'strong' }, { n: 2, avg: 3, mark: 'middle' }] },
      { id: 'bob', name: 'Bob Brown', cells: [{ n: 1, avg: 2, mark: 'weak' }, { n: 2, avg: null, mark: null }] },
    ],
  },
  trends: {
    priorAvg: 76,
    allTimeAvg: 77,
    bestImproving: { id: 'bob', name: 'Bob Brown', delta: 4 },
    mostImprovedDimension: { name: 'Open Questions', delta: 0.5 },
    needsAttention: { name: 'Scripture Focus', avg: 3.2 },
    text: ['Open questions rose across the program.'],
  },
  snapshots: [{ id: 'alice', name: 'Alice Adams', text: 'A month of steady framing.' }],
  priorityMatrix: { lowest: ['Scripture Focus'], declining: [], plateau: ['Open Questions'] },
  initiatives: ['Open each session with the passage read aloud.'],
  executiveSummary: ['Nine sessions ran this month.'],
};

const LEADER_ROW = {
  id: 11,
  kind: 'leader',
  coachId: 'alice',
  month: MONTH,
  state: 'held',
  holdReason: 'held: the first month after cutover, or a month before it, waits for an admin to release it',
  skipped: [],
  summary: { strengths: [{ text: 'Scripture first.', session: '2031-02-07' }], growth: [], trends: ['Steady across the month.'], conversationGuide: [], focus: { goals: [] }, clusters: [] },
};

const PROGRAM_ROW = { id: 12, kind: 'program', coachId: null, month: MONTH, state: 'held', holdReason: null, skipped: [], summary: PROGRAM_REPORT };

async function adminMonth(page: Page, opts: { releaseRefusal?: string } = {}) {
  const writes: Array<{ method: string; path: string; body: unknown }> = [];
  await serve(page, /\/coach\/admin\/monthly\?/, (route) =>
    route.fulfill({
      json: {
        month: MONTH,
        monthLabel: 'February 2031',
        program: { sessions: 9, activeLeaders: 2, newcomers: 0, avgScore: 78, clusters: [], delta: 2 },
        leaders: [
          { id: 'alice', name: 'Alice Adams', group: '', sessions: 5, avgScore: 84, delta: null, status: 'Strong', statusEmoji: '🟢', dimensions: [] },
        ],
        availableMonths: [MONTH, '2031-01'],
        narrative: { executiveSummary: ['Nine sessions ran this month.'], trends: ['Open questions rose across the program.'] },
        programReport: PROGRAM_REPORT,
      },
    }),
  );
  await serve(page, /\/coach\/admin\/monthly-reports/, (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    if (req.method() === 'GET') return route.fulfill({ json: { reports: [LEADER_ROW, PROGRAM_ROW] } });
    writes.push({ method: req.method(), path, body: req.postDataJSON() });
    if (path.endsWith('/release'))
      return opts.releaseRefusal ? refuse(route, opts.releaseRefusal) : route.fulfill({ json: { released: true, sent: true } });
    return route.fulfill({ json: { edited: true } });
  });
  return writes;
}

test.describe('Written monthly summaries in the portal (8.10)', () => {
  test("The admin's monthly view shows the program report as the month's narrative", async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true });
    await adminMonth(page);
    const asked: string[] = [];
    page.on('request', (r) => r.url().includes('/coach/admin/monthly?') && asked.push(new URL(r.url()).searchParams.get('month') ?? ''));
    await page.goto(`/coach/monthly?month=${MONTH}`);
    const report = page.getByTestId('coach-program-report');
    await expect(report.getByTestId('coach-program-summary')).toContainText('9 sessions from 2 leaders');
    await expect(report.getByTestId('coach-program-summary')).toContainText('Nine sessions ran this month.');
    await expect(report.getByTestId('coach-program-leaderboard').locator('li')).toHaveText(['Alice Adams · 84 · Strong', 'Bob Brown · 71 · Developing']);
    await expect(report.getByTestId('coach-program-bands')).toHaveText('Strong: 1 · Developing: 1');
    await expect(report.getByTestId('coach-program-heatmap').locator('td[data-mark="weak"]')).toHaveText('2');
    await expect(report.getByTestId('coach-program-trends')).toContainText('Most improved leader: Bob Brown (+4)');
    await expect(report.getByTestId('coach-program-snapshots')).toContainText('A month of steady framing.');
    await expect(report.getByTestId('coach-program-priorities')).toContainText('Scripture Focus');
    await expect(report.getByTestId('coach-program-initiatives').locator('li')).toHaveText(['Open each session with the passage read aloud.']);
    await expect(page.getByTestId('coach-monthly-narrative')).toHaveCount(0);
    expect(asked[0]).toBe(MONTH);
    await capture(page, testInfo, 'm1-program-report', report);
  });

  test('An admin corrects a held summary and releases it', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true });
    const writes = await adminMonth(page);
    await page.goto(`/coach/monthly?month=${MONTH}`);
    const row = page.getByTestId('coach-monthly-report-11');
    await expect(row).toContainText('Alice Adams');
    await expect(row.getByTestId('coach-monthly-report-state')).toHaveText('Held for an admin');
    await expect(page.getByTestId('coach-monthly-report-12')).toContainText('Program report');
    await row.getByTestId('coach-monthly-report-edit').click();
    await row.getByTestId('coach-monthly-report-field-trends.0').fill('Steadier in the second half of the month.');
    await capture(page, testInfo, 'm2-monthly-correct', row);
    await row.getByTestId('coach-monthly-report-save').click();
    await expect(row.getByTestId('coach-monthly-report-outcome')).toHaveText('Saved.');
    await row.getByTestId('coach-monthly-report-release').click();
    await expect(row.getByTestId('coach-monthly-report-outcome')).toHaveText('Released and sent.');
    expect(writes).toEqual([
      {
        method: 'PUT',
        path: '/coach/admin/monthly-reports/11',
        body: {
          strengths: [{ text: 'Scripture first.', session: '2031-02-07' }],
          growth: [],
          trends: ['Steadier in the second half of the month.'],
          conversationGuide: [],
          focusGoals: [],
          insights: {},
        },
      },
      { method: 'POST', path: '/coach/admin/monthly-reports/11/release', body: null },
    ]);
  });

  test("A release the server refuses says why", async ({ page }) => {
    await useCoachApi(page, { admin: true });
    await adminMonth(page, { releaseRefusal: 'benchmark-name' });
    await page.goto(`/coach/monthly?month=${MONTH}`);
    const row = page.getByTestId('coach-monthly-report-11');
    await row.getByTestId('coach-monthly-report-release').click();
    await expect(row.getByTestId('coach-monthly-report-outcome')).toHaveText(
      "Refused (409): It still names the benchmark leader in another leader's summary: correct the text first",
    );
  });

  test("A leader's monthly view opens on the emailed month and shows the written prose and study profile", async ({ page }, testInfo) => {
    await useCoachApi(page);
    const asked: string[] = [];
    await serve(page, (url) => url.href.startsWith(`${API}/coach/monthly-summary`), (route) => {
      const month = new URL(route.request().url()).searchParams.get('month') ?? '';
      asked.push(month);
      const base = monthlyFor('alice', month);
      return route.fulfill({
        json: {
          profile: { id: LEADER_ID, name: ME.profile.name, group: ME.profile.group },
          availableMonths: [MONTH],
          summary: {
            ...base.summary,
            leaderId: LEADER_ID,
            leaderName: ME.profile.name,
            profile: { study: 'Romans', format: 'In person', groupSize: 12 },
            trends: ['Open questions grew each week.'],
            conversationGuide: [{ label: 'Opening', q: 'Which question drew the most voices?' }],
            focus: { clusterName: 'Engaging People', clusterPct: 61, goals: ['Ask one open question before the first answer.'] },
          },
        },
      });
    });
    await page.goto(`/coach/monthly-summary?month=${MONTH}`);
    await expect(page.getByTestId('coach-leader-monthly-profile')).toHaveText('Romans · In person · group of 12');
    await expect(page.getByText('Open questions grew each week.')).toBeVisible();
    await expect(page.getByText('Which question drew the most voices?')).toBeVisible();
    await expect(page.getByText('Ask one open question before the first answer.')).toBeVisible();
    expect(asked[0]).toBe(MONTH);
    await capture(page, testInfo, 'm3-leader-monthly-prose');
  });

  test("The admin drill-in opens on the emailed month", async ({ page }) => {
    await useCoachApi(page, { admin: true });
    const asked: string[] = [];
    page.on('request', (r) => {
      if (/\/coach\/admin\/coaches\/alice\/monthly-summary/.test(r.url())) asked.push(new URL(r.url()).searchParams.get('month') ?? '');
    });
    await page.goto('/coach/leader/alice/monthly?month=2026-07');
    await expect(page.getByText('Alice opened every session with a newcomer welcome.')).toBeVisible();
    expect(asked[0]).toBe('2026-07');
  });
});
