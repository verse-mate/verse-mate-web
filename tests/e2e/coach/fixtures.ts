/**
 * A leader's coaching data, as the API returns it.
 *
 * The suite spawns a Vite dev server with no backend, so every coach spec
 * fulfils the API from here. These shapes mirror what the real endpoints
 * answered when the flows were driven against a running backend: the reports
 * list carries no `hasRetainedRecording` (that field is detail-only, because a
 * list that knew would be one step from minting a recording address per row),
 * and the rubric is served rather than hardcoded in the portal.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Page } from '@playwright/test';

export const API = process.env.VITE_API_URL ?? 'https://api.versemate.org';

export const RUBRIC = {
  model: 'v3-weighted-100',
  clusters: [
    { name: 'Teaching Craft', weight: 33 },
    { name: 'Building Ministry', weight: 31 },
    { name: 'Engaging People', weight: 18 },
    { name: 'Being Real', weight: 18 },
  ],
  dimensions: Array.from({ length: 12 }, (_, i) => ({
    n: i + 1,
    name: `Dimension ${i + 1}`,
    cluster: 'Teaching Craft',
    clusterWeight: 33,
    what: 'what it measures',
    target: 'the research-backed target',
  })),
  statusBands: [
    { min: 85, label: 'Exceptional', emoji: '🔷' },
    { min: 72, label: 'Strong', emoji: '🟢' },
    { min: 60, label: 'On Target', emoji: '🟡' },
    { min: 45, label: 'Developing', emoji: '🟠' },
    { min: 0, label: 'Early Stage', emoji: '🔴' },
  ],
  dimensionBands: [
    { min: 5, label: 'Exemplary' },
    { min: 4, label: 'Strong' },
    { min: 3, label: 'On target' },
    { min: 2, label: 'Developing' },
    { min: 1, label: 'Early stage' },
  ],
};

export const NEWEST_ID = 'leader-2026-08-29-saturday-morning';
export const OLDER_ID = 'leader-2026-08-22-saturday-morning';

function report(over: Record<string, unknown>) {
  return {
    id: NEWEST_ID,
    date: '2026-08-29',
    dateLabel: 'August 29, 2026',
    session: 'Obadiah, Lesson 4',
    topic: 'Obadiah 1',
    duration: '62 min',
    attendees: 17,
    newcomers: 3,
    score: 84.04,
    base: 80.04,
    newcomerBonus: 3,
    sizeBonus: 1,
    status: 'Strong',
    statusEmoji: '🟢',
    clusters: RUBRIC.clusters.map((c) => ({
      name: c.name,
      weight: c.weight,
      scorePct: 80,
      contribution: (c.weight * 80) / 100,
    })),
    dimensions: RUBRIC.dimensions.map((d) => ({
      n: d.n,
      name: d.name,
      score: 4,
      note: 'a real reason',
    })),
    bigIdeas: ['Pride goes before a fall'],
    feedback: {
      headline: 'A strong session',
      strengths: [],
      improvements: [],
      recommendations: [],
    },
    ...over,
  };
}

export const REPORTS = [
  report({}),
  report({
    id: OLDER_ID,
    date: '2026-08-22',
    dateLabel: 'August 22, 2026',
    session: 'Obadiah, Lesson 3',
    score: 54.26,
    base: 54.26,
    newcomerBonus: 0,
    sizeBonus: 0,
    status: 'Developing',
    statusEmoji: '🟠',
  }),
];

export const ME = {
  isCoach: true,
  isAdmin: false,
  profile: {
    id: 'leader',
    name: 'Bryan Bailey',
    email: 'leader@example.test',
    group: 'Saturday Morning Study',
    coachName: '',
  },
  zoomLink: '',
  affiliatedChurch: '',
  bibleCoach: '',
  model: RUBRIC.model,
  clusters: RUBRIC.clusters,
};

export const ADMIN_ME = {
  ...ME,
  isCoach: false,
  isAdmin: true,
  profile: null,
  statusBands: RUBRIC.statusBands,
};

export const LEADER_ID = 'leader';

export const TRENDS = {
  scoreSeries: REPORTS.map((r) => ({
    date: r.date,
    dateLabel: r.dateLabel,
    score: r.score,
    session: r.session,
    status: r.status,
  })).reverse(),
  clusterSeries: REPORTS.map((r) => ({
    date: r.date,
    dateLabel: r.dateLabel,
    ...Object.fromEntries(r.clusters.map((c) => [c.name, c.contribution])),
  })).reverse(),
  dimensionSeries: [],
  delta: null,
};

export const MONTHLY_LEADERS: Record<string, { name: string; strength: string }> = {
  alice: { name: 'Alice Adams', strength: 'Alice opened every session with a newcomer welcome.' },
  bob: { name: 'Bob Brown', strength: 'Bob tied every question back to the passage.' },
};

function monthlyFor(id: string, month: string) {
  const leader = MONTHLY_LEADERS[id];
  const avg = { tc: 80, bm: 80, ep: 80, br: 80 };
  return {
    profile: { id, name: leader.name, group: 'Saturday Morning Study' },
    availableMonths: [month],
    summary: {
      month,
      monthLabel: month,
      priorMonthLabel: '',
      leaderId: id,
      leaderName: leader.name,
      group: 'Saturday Morning Study',
      sessionsCount: 2,
      composite: 80,
      status: { label: 'Strong', emoji: '🟢' },
      priorComposite: null,
      delta: null,
      clusterAvg: avg,
      glance: { rows: [], avg: { ...avg, composite: 80, status: 'Strong' } },
      trajectory: [],
      clusters: [],
      strengths: [{ text: leader.strength, session: 'Obadiah, Lesson 4' }],
      growth: [],
      trends: [],
      conversationGuide: [],
      focus: { clusterName: 'Teaching Craft', clusterPct: 80, goals: [] },
      sessions: [],
    },
  };
}

/**
 * One second of black, 1.7 KB, generated with ffmpeg. Real bytes rather than a
 * stub, so a spec can tell "the player plays" from "the player failed and
 * re-minted", which are different code paths and were a bug apiece.
 */
const TINY_MP4 = readFileSync(join(import.meta.dirname, 'tiny.mp4'));

export interface CoachApiOptions {
  retained?: string[];
  /** Hold the rubric response this long, to observe the pre-rubric paint. */
  rubricDelayMs?: number;
  /** Called with each minted report id, so a spec can count mints. */
  onMint?: (reportId: string) => void;
  /** Make the minted address unreachable, the failed-playback path. */
  breakPlayback?: boolean;
  mintDelayMs?: number;
  monthlyDelayMs?: Record<string, number>;
  admin?: boolean;
}

/**
 * Sign the browser in as a leader and answer every coach call from the
 * fixtures above.
 */
export async function useCoachApi(page: Page, opts: CoachApiOptions = {}) {
  const retained = new Set(opts.retained ?? []);
  let minted = 0;

  await page.context().addCookies([
    { name: 'accessToken', value: 'e2e-token', domain: 'localhost', path: '/' },
  ]);

  // Registered FIRST, because Playwright matches the most recently added route
  // first: this is the fallback the specific handlers below take precedence
  // over. It exists because the fake token would otherwise draw a real 401 from
  // the production API and the app would navigate to /logout mid-test.
  await page.route(`${API}/**`, (route) =>
    route.fulfill({ json: { reports: [], classes: [], months: [], summary: null } }),
  );

  await page.route(`${API}/coach/rubric`, async (route) => {
    if (opts.rubricDelayMs) {
      await new Promise((r) => setTimeout(r, opts.rubricDelayMs));
    }
    await route.fulfill({ json: RUBRIC });
  });

  await page.route(`${API}/coach/me`, (route) =>
    route.fulfill({ json: opts.admin ? ADMIN_ME : ME }),
  );

  await page.route(`${API}/coach/trends`, (route) => route.fulfill({ json: TRENDS }));

  await page.route(`${API}/coach/admin/coaches/*/reports`, (route) => {
    if (!opts.admin) return route.fulfill({ status: 403, json: { error: 'FORBIDDEN' } });
    return route.fulfill({
      json: {
        profile: { ...ME.profile, id: LEADER_ID },
        reports: REPORTS.map((r) => ({ ...r, hasRetainedRecording: retained.has(r.id) })),
      },
    });
  });

  await page.route(/\/coach\/admin\/coaches\/[^/]+\/monthly-summary/, async (route) => {
    if (!opts.admin) return route.fulfill({ status: 403, json: { error: 'FORBIDDEN' } });
    const url = new URL(route.request().url());
    const id = decodeURIComponent(url.pathname.split('/').at(-2) ?? '');
    if (!MONTHLY_LEADERS[id]) return route.fulfill({ status: 404, json: { error: 'NOT_FOUND' } });
    const delay = opts.monthlyDelayMs?.[id];
    if (delay) await new Promise((r) => setTimeout(r, delay));
    return route.fulfill({ json: monthlyFor(id, url.searchParams.get('month') ?? '') });
  });

  await page.route(/\/coach\/admin\/monthly\?/, (route) => {
    const month = new URL(route.request().url()).searchParams.get('month') ?? '';
    return route.fulfill({
      json: {
        month,
        monthLabel: month,
        program: { sessions: 0, activeLeaders: 0, newcomers: 0, avgScore: null, clusters: [], delta: null },
        leaders: [],
        availableMonths: [],
        narrative: null,
      },
    });
  });

  await page.route(`${API}/coach/admin/coaches`, (route) =>
    opts.admin
      ? route.fulfill({
          json: {
            coaches: [
              {
                id: LEADER_ID,
                name: ME.profile.name,
                group: ME.profile.group,
                coachName: '',
                sessionCount: REPORTS.length,
                latest: {
                  date: REPORTS[0].date,
                  dateLabel: REPORTS[0].dateLabel,
                  score: REPORTS[0].score,
                  status: REPORTS[0].status,
                  statusEmoji: REPORTS[0].statusEmoji,
                },
              },
            ],
          },
        })
      : route.fulfill({ status: 403, json: { error: 'FORBIDDEN' } }),
  );

  await page.route(`${API}/coach/admin/coaches/*/trends`, (route) =>
    opts.admin
      ? route.fulfill({ json: TRENDS })
      : route.fulfill({ status: 403, json: { error: 'FORBIDDEN' } }),
  );

  await page.route(`${API}/coach/reports`, (route) =>
    route.fulfill({ json: { reports: REPORTS } }),
  );

  await page.route(`${API}/fake-object-store/**`, (route) =>
    opts.breakPlayback
      ? route.fulfill({ status: 404, body: 'gone' })
      : route.fulfill({ contentType: 'video/mp4', body: TINY_MP4 }),
  );

  await page.route(`${API}/coach/reports/*/recording-url`, async (route) => {
    const id = decodeURIComponent(
      new URL(route.request().url()).pathname.split('/').at(-2) ?? '',
    );
    opts.onMint?.(id);
    if (opts.mintDelayMs) {
      await new Promise((r) => setTimeout(r, opts.mintDelayMs));
    }
    if (!retained.has(id)) {
      return route.fulfill({ status: 404, json: { error: 'NOT_FOUND' } });
    }
    // A fresh address every time, as a real signed URL is: the signature and
    // timestamp differ per mint. It matters here, because a re-mint that
    // returned a byte-identical src would not make the media element load
    // again, and the failed-playback path would never advance.
    minted += 1;
    return route.fulfill({
      json: {
        url: `${API}/fake-object-store/${id}.mp4?sig=${minted}`,
        expiresInSeconds: 86400,
      },
    });
  });

  await page.route(`${API}/coach/reports/*`, (route) => {
    if (opts.admin) return route.fulfill({ status: 404, json: { error: 'NOT_FOUND' } });
    const id = decodeURIComponent(
      new URL(route.request().url()).pathname.split('/').at(-1) ?? '',
    );
    const found = REPORTS.find((r) => r.id === id);
    if (!found) return route.fulfill({ status: 404, json: { error: 'NOT_FOUND' } });
    return route.fulfill({
      json: { report: { ...found, hasRetainedRecording: retained.has(id) } },
    });
  });

}
