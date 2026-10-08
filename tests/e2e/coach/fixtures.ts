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

import type { Locator, Page, Route, TestInfo } from '@playwright/test';

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

export const MEETING_LINK = 'https://zoom.us/j/5551234567';

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
    recordingUrl: MEETING_LINK,
    attachedRecordingUrl: null,
    feedback: {
      headline: 'A strong session',
      strengths: [],
      improvements: [],
      recommendations: [],
    },
    ...over,
  };
}

export const NEWEST_SCORES: Record<number, number> = { 2: 5, 3: 3, 4: 2, 5: 1 };

export const REPORTS = [
  report({
    dimensions: RUBRIC.dimensions.map((d) => ({
      n: d.n,
      name: d.name,
      score: NEWEST_SCORES[d.n] ?? 4,
      note: 'a real reason',
    })),
  }),
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

export function olderId(i: number) {
  return `leader-older-${i}`;
}

function history(length: number) {
  return Array.from({ length }, (_, i) => {
    const d = new Date(Date.UTC(2026, 7, 15 - 7 * i));
    const date = d.toISOString().slice(0, 10);
    return report({
      id: olderId(i),
      date,
      dateLabel: date,
      session: `Older session ${i}`,
      score: 70,
      base: 70,
      newcomerBonus: 0,
      sizeBonus: 0,
      status: 'On Target',
      statusEmoji: '🟡',
    });
  });
}

function summaryOf(r: ReturnType<typeof report>) {
  return {
    id: r.id,
    date: r.date,
    dateLabel: r.dateLabel,
    session: r.session,
    topic: r.topic,
    score: r.score,
    status: r.status,
    statusEmoji: r.statusEmoji,
  };
}

export const ME = {
  isCoach: true,
  isAdmin: false,
  profile: {
    id: 'leader',
    name: 'Avery Hollis',
    email: 'leader@example.test',
    group: 'Saturday Morning Study',
    coachName: '',
  },
  zoomLink: MEETING_LINK,
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

export const AGGREGATES = { streakWeeks: 3, quarterSessions: 9 };

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

export const ADMIN_TRENDS = {
  ...TRENDS,
  dimensionSeries: REPORTS.map((r) => ({
    date: r.date,
    dateLabel: r.dateLabel,
    ...Object.fromEntries(r.dimensions.map((d) => [d.name, d.score])),
  })).reverse(),
};

export const MONTHLY_LEADERS: Record<string, { name: string; strength: string; months?: string[] }> = {
  alice: { name: 'Alice Adams', strength: 'Alice opened every session with a newcomer welcome.', months: ['2026-07'] },
  bob: { name: 'Bob Brown', strength: 'Bob tied every question back to the passage.' },
  carol: { name: 'Carol Chen', strength: '', months: [] },
};

function monthlyFor(id: string, month: string) {
  const leader = MONTHLY_LEADERS[id];
  const avg = { tc: 80, bm: 80, ep: 80, br: 80 };
  const months = leader.months ?? [month];
  return {
    profile: { id, name: leader.name, group: 'Saturday Morning Study' },
    availableMonths: months,
    summary: months.length === 0 ? null : {
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
  attached?: Record<string, string>;
  pipelineStatus?: number;
  programAvg?: number;
  historyLength?: number;
  onReportsRequest?: (url: string) => void;
  onPipelineRequest?: (url: string) => void;
  leaderAdmin?: boolean;
  onAdminWrite?: (method: string, path: string, body: unknown) => void;
}

export const PARKED_SESSION = {
  sourceSessionId: 'ff-parked',
  coachId: LEADER_ID,
  title: 'Obadiah, Lesson 2',
  sessionDate: '2026-08-15',
  state: 'scoring_failed',
  attempts: 3,
  reportId: null,
  reason: 'the model answer failed validation three times',
  action: 'requeue',
  updatedAt: '2026-08-16T00:00:00Z',
};

export const HELD_SESSION = {
  sourceSessionId: 'ff-held',
  coachId: LEADER_ID,
  title: 'Obadiah, Lesson 5',
  sessionDate: '2026-09-05',
  state: 'scored',
  attempts: 0,
  reportId: 'held-report',
  reason: 'held for review: injection tripwire',
  action: 'release',
  updatedAt: '2026-09-06T00:00:00Z',
};

export const PLACEHOLDER_LEADER = { id: 'dana-diaz', name: 'Dana Diaz', email: 'dana-diaz@needs-real-email.invalid' };

export const UNRESOLVED_SESSION = {
  sourceSessionId: 'ff-unresolved',
  coachId: null,
  title: 'Habakkuk study, week 3',
  sessionDate: '2026-09-29',
  state: 'observed',
  attempts: 0,
  reportId: null,
  reason: 'unattributed: no leader matched the session title',
  action: 'attribute',
  updatedAt: '2026-09-30T00:00:00Z',
};

export const SKIPPED_SESSION = {
  sourceSessionId: 'ff-skipped',
  coachId: PLACEHOLDER_LEADER.id,
  title: 'Micah, Lesson 2',
  sessionDate: '2026-09-27',
  state: 'delivered',
  attempts: 0,
  reportId: 'skipped-report',
  reason: `delivered, but not emailed to ${PLACEHOLDER_LEADER.email}: placeholder address`,
  action: null,
  updatedAt: '2026-09-28T00:00:00Z',
};

export const COVERAGE = {
  windowDays: 30,
  allCovered: false,
  leaders: [
    {
      coachId: LEADER_ID,
      name: 'Avery Hollis',
      email: 'leader@example.test',
      covered: true,
      basis: 'observed',
      observedSessions: 4,
      accountStatus: 'active',
      linkedClassName: 'Saturday Morning Study',
      classAlert: false,
      attestedAt: null,
      attestedBy: null,
    },
    {
      coachId: 'uncovered',
      name: 'Carol Chen',
      email: 'carol@example.test',
      covered: false,
      basis: 'none',
      observedSessions: 0,
      accountStatus: 'active',
      linkedClassName: null,
      classAlert: true,
      attestedAt: null,
      attestedBy: null,
    },
  ],
};

const LEADER_ADMIN_COVERAGE = [
  {
    coachId: PLACEHOLDER_LEADER.id,
    name: PLACEHOLDER_LEADER.name,
    email: PLACEHOLDER_LEADER.email,
    covered: false,
    basis: 'no-observation',
    observedSessions: 0,
    accountStatus: 'no-account',
    linkedClassName: null,
    classAlert: false,
    attestedAt: null,
    attestedBy: null,
  },
  {
    coachId: 'evan-ellis',
    name: 'Evan Ellis',
    email: 'evan@example.test',
    covered: true,
    basis: 'attested-not-teaching',
    observedSessions: 0,
    accountStatus: 'has-account',
    linkedClassName: null,
    classAlert: false,
    attestedAt: '2026-10-01T15:00:00.000Z',
    attestedBy: 'admin@example.test',
  },
];

/**
 * Sign the browser in as a leader and answer every coach call from the
 * fixtures above.
 */
export async function useCoachApi(page: Page, opts: CoachApiOptions = {}) {
  const retained = new Set(opts.retained ?? []);
  const all = [...REPORTS, ...history(opts.historyLength ?? 0)];
  const attached = opts.attached ?? {};
  const withAttached = <T extends { id: string }>(r: T) =>
    attached[r.id] ? { ...r, attachedRecordingUrl: attached[r.id], recordingUrl: attached[r.id] } : r;
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

  const stuck: Array<Record<string, unknown>> = [PARKED_SESSION, HELD_SESSION];
  const coverage = { ...COVERAGE, leaders: COVERAGE.leaders.map((l) => ({ ...l })) };
  const roster = [{ id: LEADER_ID, name: ME.profile.name }];
  if (opts.leaderAdmin) {
    stuck.push(UNRESOLVED_SESSION, SKIPPED_SESSION);
    coverage.leaders.push(...LEADER_ADMIN_COVERAGE.map((l) => ({ ...l })));
    roster.push({ id: PLACEHOLDER_LEADER.id, name: PLACEHOLDER_LEADER.name }, { id: 'evan-ellis', name: 'Evan Ellis' });
  }
  const write = async (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    const body = req.postData() ? JSON.parse(req.postData() as string) : null;
    opts.onAdminWrite?.(req.method(), url.pathname, body);
    const leaderOf = (id: string) => coverage.leaders.find((l) => l.coachId === id);
    const email = url.pathname.match(/admin\/leaders\/([^/]+)\/email$/);
    if (email) {
      const taken = coverage.leaders.find((l) => l.email === body.email && l.coachId !== email[1]);
      if (taken) return route.fulfill({ status: 409, json: { error: 'CONFLICT', message: 'Another leader already uses that address' } });
      const leader = leaderOf(decodeURIComponent(email[1]));
      if (!leader) return route.fulfill({ status: 404, json: { error: 'NOT_FOUND', message: 'Leader not found' } });
      leader.email = body.email;
      const i = stuck.findIndex((x) => x.coachId === leader.coachId && x.state === 'delivered');
      if (i >= 0) stuck.splice(i, 1);
      return route.fulfill({ json: { email: body.email } });
    }
    const notTeaching = url.pathname.match(/admin\/leaders\/([^/]+)\/not-teaching$/);
    if (notTeaching) {
      const leader = leaderOf(decodeURIComponent(notTeaching[1]));
      if (!leader) return route.fulfill({ status: 404, json: { error: 'NOT_FOUND', message: 'Leader not found' } });
      const attested = req.method() === 'POST';
      leader.attestedAt = attested ? '2026-10-08T13:00:00.000Z' : null;
      leader.attestedBy = attested ? 'admin@example.test' : null;
      leader.basis = leader.observedSessions > 0 ? 'observed' : attested ? 'attested-not-teaching' : 'no-observation';
      leader.covered = leader.observedSessions > 0 || attested;
      coverage.allCovered = coverage.leaders.every((l) => l.covered);
      return route.fulfill({ json: { attested } });
    }
    const attribute = url.pathname.match(/admin\/sessions\/([^/]+)\/attribute$/);
    if (attribute) {
      const i = stuck.findIndex((x) => x.sourceSessionId === decodeURIComponent(attribute[1]));
      if (i < 0) return route.fulfill({ status: 404, json: { error: 'NOT_FOUND', message: 'Session not found' } });
      stuck.splice(i, 1);
      return route.fulfill({ json: { coachId: body.coachId, state: 'observed' } });
    }
    if (url.pathname.endsWith('/admin/leaders') && req.method() === 'POST') {
      if (body.name?.trim().toLowerCase() === 'avery hollis') {
        return route.fulfill({
          status: 409,
          json: { error: 'CONFLICT', message: 'Another leader already uses the id "avery-hollis". Enter a different name.' },
        });
      }
      const id = String(body.name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      roster.push({ id, name: body.name });
      return route.fulfill({ json: { coach: { id, name: body.name, group: body.group ?? '', coachName: '', sessionCount: 0, latest: null } } });
    }
    return route.fallback();
  };
  await page.route(/\/coach\/admin\/(leaders|sessions)(\/|$)/, (route) =>
    opts.admin ? write(route) : route.fulfill({ status: 403, json: { error: 'FORBIDDEN', message: 'Admin access required' } }),
  );
  await page.route(/\/coach\/admin\/(pipeline-failures|coverage|reports\/[^/]+\/release)/, (route) => {
    const url = new URL(route.request().url());
    opts.onPipelineRequest?.(url.pathname);
    if (!opts.admin) return route.fulfill({ status: 403, json: { error: 'FORBIDDEN', message: 'Admin access required' } });
    if (opts.pipelineStatus) {
      return route.fulfill({ status: opts.pipelineStatus, json: { error: 'INTERNAL', message: 'database unavailable' } });
    }
    if (url.pathname.endsWith('/coverage')) return route.fulfill({ json: coverage });
    const requeue = url.pathname.match(/pipeline-failures\/([^/]+)\/requeue$/);
    if (requeue) {
      const i = stuck.findIndex((x) => x.sourceSessionId === decodeURIComponent(requeue[1]));
      if (i < 0) return route.fulfill({ status: 404, json: { error: 'NOT_FOUND', message: 'No parked session' } });
      stuck.splice(i, 1);
      return route.fulfill({ json: { requeued: true } });
    }
    const release = url.pathname.match(/reports\/([^/]+)\/release$/);
    if (release) {
      const i = stuck.findIndex((x) => x.reportId === decodeURIComponent(release[1]));
      if (i < 0) return route.fulfill({ status: 404, json: { error: 'NOT_FOUND', message: 'No report held for review' } });
      stuck.splice(i, 1);
      return route.fulfill({ json: { delivered: true } });
    }
    return route.fulfill({ json: { sessions: stuck } });
  });

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
        program: { sessions: 0, activeLeaders: 0, newcomers: 0, avgScore: opts.programAvg ?? null, clusters: [], delta: null },
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
            coaches: roster.map((r) =>
              r.id === LEADER_ID
                ? {
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
                  }
                : { id: r.id, name: r.name, group: '', coachName: '', sessionCount: 0, latest: null },
            ),
          },
        })
      : route.fulfill({ status: 403, json: { error: 'FORBIDDEN' } }),
  );

  await page.route(`${API}/coach/admin/coaches/*/trends`, (route) =>
    opts.admin
      ? route.fulfill({ json: ADMIN_TRENDS })
      : route.fulfill({ status: 403, json: { error: 'FORBIDDEN' } }),
  );

  await page.route(`${API}/coach/reports`, (route) => {
    opts.onReportsRequest?.(new URL(route.request().url()).pathname);
    return route.fulfill({ json: { reports: all.map(withAttached) } });
  });

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
    opts.onReportsRequest?.(new URL(route.request().url()).pathname);
    const found = all.find((r) => r.id === id);
    if (!found) return route.fulfill({ status: 404, json: { error: 'NOT_FOUND', message: 'Report not found' } });
    return route.fulfill({
      json: { report: { ...withAttached(found), hasRetainedRecording: retained.has(id) } },
    });
  });

  await page.route(/\/coach\/reports\/summary(\?|$)/, (route) => {
    const url = new URL(route.request().url());
    opts.onReportsRequest?.(`${url.pathname}${url.search}`);
    if (opts.admin) return route.fulfill({ status: 403, json: { error: 'FORBIDDEN', message: 'Not a coaching account' } });
    const limit = Number(url.searchParams.get('limit') ?? 25);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    return route.fulfill({
      json: { items: all.slice(offset, offset + limit).map(summaryOf), total: all.length, ...AGGREGATES },
    });
  });

  await page.route(/\/coach\/admin\/coaches\/[^/]+\/reports\/(?!summary(?:\?|$))[^/?]+$/, (route) => {
    if (!opts.admin) return route.fulfill({ status: 403, json: { error: 'FORBIDDEN', message: 'Admin access required' } });
    const id = decodeURIComponent(new URL(route.request().url()).pathname.split('/').at(-1) ?? '');
    const found = all.find((r) => r.id === id);
    if (!found) return route.fulfill({ status: 404, json: { error: 'NOT_FOUND', message: 'Session not found' } });
    return route.fulfill({ json: { report: { ...withAttached(found), hasRetainedRecording: retained.has(id) } } });
  });

  await page.route(/\/coach\/admin\/coaches\/[^/]+\/reports\/summary(\?|$)/, (route) => {
    if (!opts.admin) return route.fulfill({ status: 403, json: { error: 'FORBIDDEN', message: 'Admin access required' } });
    const url = new URL(route.request().url());
    const limit = Number(url.searchParams.get('limit') ?? 25);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    return route.fulfill({
      json: {
        items: all.slice(offset, offset + limit).map((r) => ({
          ...summaryOf(r),
          hasRetainedRecording: retained.has(r.id),
          attachedRecordingUrl: attached[r.id] ?? null,
        })),
        total: all.length,
        ...AGGREGATES,
      },
    });
  });

}

export async function capture(page: Page, testInfo: TestInfo, name: string, focus?: Locator) {
  const dir = process.env.E2E_CAPTURE_DIR;
  if (!dir) return;
  await focus?.scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(dir, `${name}-${testInfo.project.name}.png`), fullPage: true });
}
