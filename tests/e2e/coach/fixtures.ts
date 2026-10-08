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

import { expect, type Locator, type Page, type Route, type TestInfo } from '@playwright/test';

import { ERROR_CODES, INVALID_REQUEST, UNMATCHED_ROUTE, contractErrors, contractRoute, refusalOf } from './contract';

export const API = process.env.VITE_API_URL ?? 'https://api.versemate.org';

function serve(page: Page, url: string | RegExp, handler: (route: Route) => unknown) {
  return page.route(url, (route) => {
    const fulfill = route.fulfill.bind(route);
    route.fulfill = (answer = {}) => {
      const req = route.request();
      const status = answer.status ?? 200;
      expect
        .soft(contractErrors(req.method(), new URL(req.url()).pathname, status, answer.json), `${req.method()} ${req.url()} answered ${status}`)
        .toEqual([]);
      return fulfill(answer);
    };
    return handler(route);
  });
}

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
      improvements: ['Recall last week\'s big idea before the new passage'],
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
  statusBands: RUBRIC.statusBands,
};

export const ADMIN_ME = {
  ...ME,
  isCoach: false,
  isAdmin: true,
  profile: null,
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
    reportId: r.id,
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
  reviews?: Record<string, ReviewKind>;
  pipelineLive?: boolean;
  noMailer?: boolean;
  revisionSend?: 'ok' | 'fail' | 'in-flight' | 'not-live' | 'unconfirmed';
  heldReports?: string[];
  deliveredBeforeFlag?: string;
  prose?: boolean;
  firstLessonHeld?: boolean;
  awaitingRelease?: boolean;
  failedSends?: boolean;
  parallelRunCopies?: boolean;
}

type ReviewKind = 'delivered' | 'undelivered' | 'in-flight' | 'partial' | 'legacy';

export const EMAIL_RULE =
  'Enter one email address: letters, digits and . _ % + - before the @, then a domain such as example.org, with no trailing dot';
const EMAIL_LOCAL = /^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+-]+(?<!\.)$/;
const EMAIL_DOMAIN = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

function isEmailAddress(value: string): boolean {
  const at = value.lastIndexOf('@');
  return value.length <= 254 && at > 0 && EMAIL_LOCAL.test(value.slice(0, at)) && EMAIL_DOMAIN.test(value.slice(at + 1));
}

function isPlaceholder(email: string): boolean {
  return email.trim().toLowerCase().replace(/\.+$/, '').endsWith('.invalid');
}

function titleWords(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function containsWords(haystack: string, needle: string): boolean {
  return needle.length > 0 && ` ${haystack} `.includes(` ${needle} `);
}

const RECALL = /\b(recall|review|recap|recite|recitation)\b/i;
const PRIOR = /\b(big ideas?|prior|previous|last (week|session|lesson)'?s?|earlier lessons?)\b/i;

function itemText(item: unknown): string {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') return Object.values(item).map(itemText).join(' ');
  return '';
}

function coldRecallIn(feedback: Record<string, unknown>): string[] {
  return [feedback.improvements, feedback.improvementsProse]
    .flatMap((list) => (Array.isArray(list) ? list.map(itemText) : []))
    .filter((text) => /\bcold[- ]recall\b/i.test(text) || (RECALL.test(text) && PRIOR.test(text)));
}

export const FIRST_LESSON_RATIONALE =
  'Not applicable: the first lesson of a new study, so there are no prior big ideas to review.';
const MEMORY_REINFORCEMENT = 9;
const REPORT_EDIT = 'PUT /coach/admin/reports/:reportId/improvements';
export const IN_FLIGHT_CORRECTION = refusalOf(REPORT_EDIT, 'in-flight').message;
export const NOT_LIVE_SEND = refusalOf('POST /coach/admin/reports/:reportId/revision/send', 'not-live').message;
export const PARALLEL_RUN_SESSION_REFUSAL = refusalOf('POST /coach/admin/reports/:reportId/release', 'parallel-run-session').message;
export const PARTIALLY_DELIVERED = refusalOf(REPORT_EDIT, 'partially-delivered').message;
export const EMPTY_EDIT = refusalOf(REPORT_EDIT, 'empty-edit').message;
const PROSE_OF: Record<string, string> = {
  strengths: 'strengthsProse',
  improvements: 'improvementsProse',
  recommendations: 'recommendationsProse',
};

const unmatched = (route: Route) => route.fulfill({ status: 404, json: UNMATCHED_ROUTE });
const invalidRequest = (route: Route) => route.fulfill({ status: 422, json: INVALID_REQUEST });
const forbidden = (route: Route) => route.fulfill({ status: 403, json: { error: 'FORBIDDEN', message: 'Admin access required' } });
const notFound = (route: Route, message = 'Report not found') => route.fulfill({ status: 404, json: { error: 'NOT_FOUND', message } });

function refuse(route: Route, code: string, words?: { message?: string; details?: Record<string, unknown> }) {
  const req = route.request();
  const served = contractRoute(req.method(), new URL(req.url()).pathname);
  if (!served) throw new Error(`${req.method()} ${req.url()} is no route in the contract`);
  const { status, message } = refusalOf(served.route, code);
  return route.fulfill({
    status,
    json: { error: ERROR_CODES[status], message: words?.message ?? message, details: { refusal: code, ...words?.details } },
  });
}

function reviewOf(reportId: string, kind: ReviewKind) {
  return {
    reportId,
    delivered: kind === 'delivered',
    base: 80,
    humanCorrected: false,
    firstLesson: false,
    firstLessonSource: null as string | null,
    passageBook: 'Obadiah' as string | null,
    parallelRun: false,
    dimensions: RUBRIC.dimensions.map((d) => ({
      n: d.n,
      score: 4 as number | null,
      rationale: `The model's reason for dimension ${d.n}`,
      provenance: 'machine',
      modelVersion: RUBRIC.model,
    })),
    inFlight: kind === 'in-flight',
    partial: kind === 'partial',
  };
}

type Review = ReturnType<typeof reviewOf>;
type StoredReport = ReturnType<typeof report> & { notes?: Array<Record<string, unknown>> };
type Amendment = {
  dimensions?: Array<{ n: number; score: number | null; rationale: string }>;
  firstLesson?: boolean;
  body?: Record<string, unknown>;
};

export const PROSE = {
  strengthsProse: [{ title: 'Scripture first', paragraphs: ['You opened with the passage and stayed in it.'] }],
  improvementsProse: [
    {
      title: 'Tie it to last week',
      paragraphs: ["Recall last week's big idea before the new passage.", 'Give the group a full minute to answer.'],
    },
  ],
};

export const FIRST_LESSON_HELD_SESSION = {
  sourceSessionId: 'ff-first-lesson',
  coachId: LEADER_ID,
  title: 'Obadiah, Lesson 3',
  sessionDate: '2026-08-22',
  state: 'scored',
  attempts: 0,
  reportId: OLDER_ID,
  reason: "held: a first lesson with a cold-recall improvement: Recall last week's big idea before the new passage",
  holdKind: 'cold-recall',
  action: 'release',
  updatedAt: '2026-08-23T00:00:00Z',
};

function reviewsFor(opts: CoachApiOptions) {
  const kinds = opts.reviews ?? { [NEWEST_ID]: 'delivered', [OLDER_ID]: 'undelivered' };
  const reviews = new Map(
    Object.entries(kinds)
      .filter(([, k]) => k !== 'legacy')
      .map(([id, k]) => [id, reviewOf(id, k)]),
  );
  const held = opts.firstLessonHeld ? reviews.get(OLDER_ID) : undefined;
  if (held) Object.assign(held, { firstLesson: true, firstLessonSource: 'detected' });
  const copy = opts.parallelRunCopies ? reviews.get(OLDER_ID) : undefined;
  if (copy) copy.parallelRun = true;
  return reviews;
}

async function revisionRoutes(
  page: Page,
  opts: CoachApiOptions,
  store: Map<string, StoredReport>,
  reviews: Map<string, Review>,
) {
  const revisions = new Map<string, Array<Record<string, unknown>>>();
  const edits = new Map<string, Array<Record<string, unknown>>>();
  const recipients = { sentTo: ['leader@example.test'], skipped: [PLACEHOLDER_LEADER.email] };
  const failedSend = [{ email: 'leader@example.test', delivered: false, error: 'mailbox unavailable' }];
  const unconfirmedSend = [
    {
      email: 'leader@example.test',
      delivered: false,
      error: 'a send was started but never confirmed, so it is not sent again until the revision is requeued',
      neverConfirmed: true,
    },
  ];
  const unconfirmed = new Set<string>();
  const requeued = new Set<string>();
  const sendLatest = (reportId: string) => {
    if (opts.noMailer) return { status: 409, refusal: 'no-mailer', pending: 'no-mailer' } as const;
    if (!opts.pipelineLive) return { status: 409, refusal: 'parallel-run', pending: 'parallel-run' } as const;
    const latest = revisions.get(reportId)?.[0];
    if (!latest) return { status: 404, refusal: 'no-revision' } as const;
    if (latest.sentAt) return { status: 409, refusal: 'already-sent' } as const;
    if (opts.revisionSend === 'in-flight') return { status: 409, refusal: 'in-flight', pending: 'in-flight' } as const;
    if (opts.revisionSend === 'not-live') return { status: 409, refusal: 'not-live', pending: 'not-live' } as const;
    if (opts.revisionSend === 'unconfirmed' && !requeued.has(reportId)) {
      unconfirmed.add(reportId);
      latest.attemptedTo = unconfirmedSend.map((x) => x.email);
      return {
        status: 200,
        json: { sent: false, refusal: 'send-failed', revision: latest.revision, sends: unconfirmedSend, skipped: recipients.skipped },
        pending: 'send-failed',
      } as const;
    }
    if (opts.revisionSend === 'fail') {
      return {
        status: 200,
        json: { sent: false, refusal: 'send-failed', revision: latest.revision, sends: failedSend, skipped: recipients.skipped },
        pending: 'send-failed',
      } as const;
    }
    Object.assign(latest, recipients, { sentAt: '2026-10-08T15:05:00.000Z', attemptedTo: [] });
    return {
      status: 200,
      json: { sent: true, revision: latest.revision, sends: [{ email: 'leader@example.test', delivered: true }], skipped: recipients.skipped },
    } as const;
  };

  const amend = (route: Route, reportId: string, review: Review, body: Amendment) => {
    const dims = body.dimensions ?? [];
    const changed = Object.entries(body.body ?? {}).filter(([, v]) => v !== undefined);
    if (dims.length === 0 && body.firstLesson === undefined && changed.length === 0) {
      return refuse(route, 'empty-amendment');
    }
    if (!review.delivered) return refuse(route, 'not-delivered');
    const latest = revisions.get(reportId)?.[0];
    if (opts.revisionSend === 'in-flight' && latest && !latest.sentAt) return refuse(route, 'revision-sending');
    const given = dims.find((d) => d.n === MEMORY_REINFORCEMENT);
    if (body.firstLesson === false && review.firstLesson && (!given || given.score === null || !given.rationale.trim())) {
      return refuse(route, 'memory-reinforcement-required');
    }
    const stored = store.get(reportId) as StoredReport;
    const before = stored.feedback as Record<string, unknown>;
    const feedback: Record<string, unknown> = { ...before, ...Object.fromEntries(changed) };
    const cleared = Object.entries(PROSE_OF)
      .filter(([list, prose]) => body.body?.[list] !== undefined && body.body?.[prose] === undefined)
      .map(([, prose]) => prose);
    for (const prose of cleared) delete feedback[prose];
    const firstLesson = body.firstLesson ?? review.firstLesson;
    const coldRecall = firstLesson ? coldRecallIn(feedback) : [];
    if (coldRecall.length) return route.fulfill({ json: { applied: false, refusal: 'cold-recall-improvement', coldRecall } });
    if (JSON.stringify(body).includes('Avery')) {
      return route.fulfill({ json: { applied: false, refusal: 'governance-blocked', violations: ['benchmark-name: in the body'] } });
    }
    const next = new Map(dims.map((d) => [d.n, { score: d.score, rationale: d.rationale.trim() }]));
    if (body.firstLesson === true) {
      next.set(MEMORY_REINFORCEMENT, { score: null, rationale: given?.rationale.trim() || FIRST_LESSON_RATIONALE });
    }
    const changes = {
      dimensions: [...next].map(([n, to]) => {
        const before = review.dimensions[n - 1];
        const from = { score: before.score, rationale: before.rationale };
        Object.assign(before, to, { provenance: 'human' });
        Object.assign(stored.dimensions[n - 1], { score: to.score, note: to.rationale });
        return { n, from, to };
      }),
      ...(body.firstLesson !== undefined ? { firstLesson: { from: review.firstLesson, to: body.firstLesson } } : {}),
      body: Object.fromEntries([
        ...changed.map(([field, to]) => [field, { from: before[field], to }]),
        ...cleared.filter((prose) => before[prose] !== undefined).map((prose) => [prose, { from: before[prose], to: null }]),
      ]),
    };
    stored.feedback = feedback as StoredReport['feedback'];
    Object.assign(stored, { base: 78, score: 82, status: 'Strong', statusEmoji: '🟢' });
    if (body.firstLesson !== undefined) Object.assign(review, { firstLesson: body.firstLesson, firstLessonSource: 'admin' });
    const kept = revisions.get(reportId) ?? [];
    const revision = kept.length + 1;
    kept.unshift({
      kind: 'revision',
      revision,
      previous: {},
      changes,
      amendedBy: 'admin@example.test',
      amendedAt: '2026-10-08T15:00:00.000Z',
      sentTo: [],
      skipped: [],
      sentAt: null,
      attemptedTo: [],
    });
    revisions.set(reportId, kept);
    const saved = { applied: true, revision, firstLesson, base: 78, score: 82, status: 'Strong' };
    if (!opts.pipelineLive) return route.fulfill({ json: { ...saved, sent: false, pending: 'parallel-run' } });
    const send = sendLatest(reportId);
    if (send.status === 200 && send.json.sent) {
      return route.fulfill({ json: { ...saved, sent: true, sends: send.json.sends, skipped: send.json.skipped } });
    }
    const failed = send.status === 200 ? { sends: send.json.sends, skipped: send.json.skipped } : {};
    return route.fulfill({ json: { ...saved, sent: false, pending: 'pending' in send ? send.pending : 'send-failed', ...failed } });
  };

  const editImprovements = (route: Route, reportId: string, review: Review | undefined, body: { improvements?: unknown; improvementsProse?: unknown }) => {
    const text = (v: unknown, max: number) => typeof v === 'string' && v.length <= max;
    const prose = body?.improvementsProse;
    const validProse =
      prose === undefined ||
      (Array.isArray(prose) &&
        prose.length <= 10 &&
        prose.every(
          (p) => text(p?.title, 500) && Array.isArray(p?.paragraphs) && p.paragraphs.length <= 10 && p.paragraphs.every((x: unknown) => text(x, 4000)),
        ));
    if (!Array.isArray(body?.improvements) || body.improvements.length > 10 || !body.improvements.every((x) => text(x, 4000)) || !validProse) {
      return invalidRequest(route);
    }
    if (body.improvements.length === 0) return refuse(route, 'empty-edit');
    if (!review) return refuse(route, 'legacy-report');
    if (opts.deliveredBeforeFlag === reportId) review.delivered = true;
    if (review.delivered) return refuse(route, 'already-delivered');
    if (review.partial) return refuse(route, 'partially-delivered');
    if (review.inFlight) return refuse(route, 'in-flight');
    const stored = store.get(reportId) as StoredReport;
    const previous = stored.feedback as Record<string, unknown>;
    const listOrNull = (v: unknown) => JSON.stringify(Array.isArray(v) && v.length > 0 ? v : null);
    if (listOrNull(previous.improvements) === listOrNull(body.improvements) && listOrNull(previous.improvementsProse) === listOrNull(prose)) {
      return refuse(route, 'empty-edit');
    }
    const { improvementsProse: _cleared, ...kept } = previous;
    const feedback = { ...kept, improvements: body.improvements, ...(prose ? { improvementsProse: prose } : {}) };
    const coldRecall = review.firstLesson ? coldRecallIn(feedback) : [];
    if (coldRecall.length) return route.fulfill({ json: { applied: false, refusal: 'cold-recall-improvement', coldRecall } });
    const made = edits.get(reportId) ?? [];
    made.unshift({
      kind: 'edit',
      edit: made.length + 1,
      changes: {
        improvements: { from: previous.improvements ?? null, to: body.improvements },
        improvementsProse: { from: previous.improvementsProse ?? null, to: prose ?? null },
      },
      editedBy: 'admin@example.test',
      editedAt: new Date(Date.UTC(2026, 9, 7, 12 + made.length)).toISOString(),
    });
    edits.set(reportId, made);
    stored.feedback = feedback as StoredReport['feedback'];
    return route.fulfill({ json: { applied: true } });
  };

  const correctDimension = (route: Route, reportId: string, review: Review | undefined, n: number, body: { score?: unknown; rationale?: unknown }) => {
    const { score, rationale } = body;
    const validScore = score === null || (Number.isInteger(score) && (score as number) >= 1 && (score as number) <= 5);
    if (!validScore || typeof rationale !== 'string' || rationale.length > 4000) return invalidRequest(route);
    if (!Number.isInteger(n) || n < 1 || n > 12) return refuse(route, 'invalid-dimension');
    if (!review) return refuse(route, 'legacy-report');
    if (opts.deliveredBeforeFlag === reportId) review.delivered = true;
    if (review.delivered) return refuse(route, 'already-delivered');
    if (review.partial) return refuse(route, 'partially-delivered');
    if (review.inFlight) return refuse(route, 'in-flight');
    const dim = review.dimensions[n - 1];
    Object.assign(dim, { score, rationale, provenance: 'human' });
    const scores = review.dimensions.map((d) => d.score).filter((v): v is number => v !== null);
    const base = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length / 5) * 10000) / 100;
    Object.assign(review, { base, humanCorrected: true });
    const stored = store.get(reportId);
    const composite = Math.round((base + (stored?.newcomerBonus ?? 0) + (stored?.sizeBonus ?? 0)) * 100) / 100;
    const status = RUBRIC.statusBands.find((b) => composite >= b.min)?.label ?? '';
    return route.fulfill({ json: { base, score: composite, status } });
  };

  await serve(page, /\/coach\/admin\/reports\/[^/]+\/dimensions\/[^/]+$/, (route) => {
    if (!opts.admin) return forbidden(route);
    const req = route.request();
    const url = new URL(req.url());
    const [, id, n] = url.pathname.match(/\/admin\/reports\/([^/]+)\/dimensions\/([^/]+)$/) ?? [];
    if (req.method() !== 'POST') return unmatched(route);
    const reportId = decodeURIComponent(id);
    const body = req.postData() ? JSON.parse(req.postData() as string) : {};
    opts.onAdminWrite?.(req.method(), url.pathname, body);
    return correctDimension(route, reportId, reviews.get(reportId), Number(n), body);
  });

  await serve(page, /\/coach\/admin\/reports\/[^/]+\/(review|amend|revisions|revision\/send|revision\/requeue|first-lesson|improvements)$/, (route) => {
    if (!opts.admin) return forbidden(route);
    const req = route.request();
    const url = new URL(req.url());
    const [, id, action] = url.pathname.match(/\/admin\/reports\/([^/]+)\/(.+)$/) ?? [];
    const method = {
      review: 'GET',
      revisions: 'GET',
      amend: 'POST',
      'revision/send': 'POST',
      'revision/requeue': 'POST',
      'first-lesson': 'PUT',
      improvements: 'PUT',
    }[action];
    if (req.method() !== method) return unmatched(route);
    const reportId = decodeURIComponent(id);
    const body = req.postData() ? JSON.parse(req.postData() as string) : null;
    if (req.method() !== 'GET') opts.onAdminWrite?.(req.method(), url.pathname, body);
    const review = reviews.get(reportId);
    if (action === 'review') {
      if (!review) return refuse(route, 'unknown-report');
      const { inFlight: _inFlight, partial: _partial, ...state } = review;
      return route.fulfill({ json: state });
    }
    if (action === 'revisions') {
      return route.fulfill({ json: { revisions: [...(revisions.get(reportId) ?? []), ...(edits.get(reportId) ?? [])] } });
    }
    if (action === 'revision/requeue') {
      const latest = revisions.get(reportId)?.[0];
      if (!latest || latest.sentAt || !unconfirmed.delete(reportId)) {
        return refuse(route, 'nothing-to-requeue');
      }
      requeued.add(reportId);
      latest.attemptedTo = [];
      return route.fulfill({ json: { requeued: true } });
    }
    if (action === 'revision/send') {
      const send = sendLatest(reportId);
      return send.status === 200 ? route.fulfill({ json: send.json }) : refuse(route, send.refusal);
    }
    if (action === 'improvements') return editImprovements(route, reportId, review, body);
    if (action === 'first-lesson') {
      if (!body.firstLesson && (body.score == null || !String(body.rationale ?? '').trim())) return refuse(route, 'memory-reinforcement-required');
      if (!review) return refuse(route, 'legacy-report');
      if (opts.deliveredBeforeFlag === reportId) review.delivered = true;
      if (review.partial) return refuse(route, 'partially-delivered');
      if (review.inFlight) return refuse(route, 'in-flight');
      if (review.delivered) {
        return amend(route, reportId, review, {
          firstLesson: body.firstLesson,
          ...(body.firstLesson ? {} : { dimensions: [{ n: MEMORY_REINFORCEMENT, score: body.score, rationale: body.rationale }] }),
        });
      }
      const rationale = String(body.rationale ?? '').trim();
      const nine = review.dimensions[MEMORY_REINFORCEMENT - 1];
      Object.assign(nine, body.firstLesson ? { score: null, rationale: rationale || FIRST_LESSON_RATIONALE } : { score: body.score, rationale });
      nine.provenance = 'human';
      Object.assign(review, { firstLesson: body.firstLesson, firstLessonSource: 'admin', humanCorrected: true });
      return route.fulfill({ json: { applied: true, firstLesson: body.firstLesson, base: 82, score: 84, status: 'Strong' } });
    }
    if (!review) return refuse(route, 'legacy-report');
    return amend(route, reportId, review, body);
  });
}

export const PARKED_SESSION = {
  sourceSessionId: 'ff-parked',
  coachId: LEADER_ID,
  title: 'Obadiah, Lesson 2',
  sessionDate: '2026-08-15',
  sessionStartedAt: '2026-08-16T00:30:00.000Z',
  state: 'scoring_failed',
  attempts: 3,
  reportId: null,
  reason: 'the model answer failed validation three times',
  holdKind: null,
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
  holdKind: 'review',
  action: 'release',
  updatedAt: '2026-09-06T00:00:00Z',
};

export const AWAITING_RELEASE_SESSIONS = (['delivery_pending', 'delivery_failed'] as const).map((state, i) => ({
  sourceSessionId: `ff-awaiting-${state}`,
  coachId: LEADER_ID,
  title: `Obadiah, Lesson ${6 + i}`,
  sessionDate: `2026-09-1${2 + i}`,
  state,
  attempts: state === 'delivery_failed' ? 3 : 0,
  reportId: `awaiting-${state}`,
  reason: 're-attributed: held until an admin releases it',
  holdKind: 'reattributed',
  action: 'release',
  updatedAt: `2026-09-1${3 + i}T00:00:00Z`,
}));

export const FAILED_SEND_LEADER = { id: 'uncovered', name: 'Carol Chen', email: 'carol@example.test' };
const SEND_FAILED = `send failed to ${FAILED_SEND_LEADER.email} (mailbox unavailable); already emailed to leader@example.test`;

export const FAILED_SEND_SESSIONS = [
  {
    sourceSessionId: 'ff-send-retrying',
    coachId: FAILED_SEND_LEADER.id,
    title: 'Ruth, Lesson 2',
    sessionDate: '2026-09-19',
    state: 'delivery_pending',
    attempts: 2,
    reportId: 'send-retrying',
    reason: `${SEND_FAILED}; retried automatically (attempt 2 of 5), fix the failing address if it is wrong`,
    holdKind: 'send-failed',
    action: null,
    updatedAt: '2026-09-20T00:00:00Z',
  },
  {
    sourceSessionId: 'ff-send-exhausted',
    coachId: FAILED_SEND_LEADER.id,
    title: 'Ruth, Lesson 3',
    sessionDate: '2026-09-26',
    state: 'delivery_failed',
    attempts: 5,
    reportId: 'send-exhausted',
    reason: `${SEND_FAILED}; retries exhausted: fix the failing address, then requeue it`,
    holdKind: 'send-failed',
    action: 'requeue',
    updatedAt: '2026-09-27T00:00:00Z',
  },
];

export const UNCONFIRMED_SEND_SESSION = {
  sourceSessionId: 'ff-send-unconfirmed',
  coachId: FAILED_SEND_LEADER.id,
  title: 'Ruth, Lesson 4',
  sessionDate: '2026-10-03',
  state: 'delivery_pending',
  attempts: 1,
  reportId: 'send-unconfirmed',
  reason: `a send to ${FAILED_SEND_LEADER.email} was started but never confirmed, so it is not sent again until the report is requeued; retried automatically (attempt 1 of 5), fix the failing address if it is wrong`,
  holdKind: 'send-failed',
  action: null,
  updatedAt: '2026-10-04T00:00:00Z',
};

export const PARALLEL_RUN_SESSION = {
  sourceSessionId: 'ff-parallel-run',
  coachId: LEADER_ID,
  title: 'Obadiah, Lesson 3',
  sessionDate: '2026-08-22',
  state: 'scored',
  attempts: 0,
  reportId: OLDER_ID,
  reason: 'held for review: calibration sample',
  holdKind: 'review',
  parallelRun: true,
  action: null,
  updatedAt: '2026-08-23T00:00:00Z',
};

export const PARALLEL_RUN_RESHARE = {
  sourceSessionId: 'ff-parallel-run-reshare',
  coachId: LEADER_ID,
  title: 'Obadiah, Lesson 2',
  sessionDate: '2026-08-15',
  sessionStartedAt: '2026-08-15T14:00:00.000Z',
  requestedAt: '2026-08-16T00:00:00.000Z',
  attempts: 5,
  asked: false,
  parallelRun: true,
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
  holdKind: null,
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
  holdKind: null,
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
      accountStatus: 'has-account',
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
      basis: 'no-observation',
      observedSessions: 0,
      accountStatus: 'has-account',
      linkedClassName: 'Tuesday Evening Study',
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
  const held = new Set([...(opts.heldReports ?? []), ...(opts.firstLessonHeld ? [OLDER_ID] : [])]);
  const store = new Map<string, StoredReport>(
    [...REPORTS, ...history(opts.historyLength ?? 0)].map((r) => [
      r.id,
      structuredClone(opts.prose ? { ...r, feedback: { ...r.feedback, ...PROSE } } : r),
    ]),
  );
  const reviews = reviewsFor(opts);
  const all = () => [...store.values()];
  const attached = opts.attached ?? {};
  const withAttached = <T extends { id: string }>(r: T) =>
    attached[r.id] ? { ...r, attachedRecordingUrl: attached[r.id], recordingUrl: attached[r.id] } : r;
  let minted = 0;

  await page.context().addCookies([
    { name: 'accessToken', value: 'e2e-token', domain: 'localhost', path: '/' },
  ]);

  await serve(page, `${API}/**`, unmatched);
  const notACoach = (route: Route) => route.fulfill({ status: 403, json: { error: 'FORBIDDEN', message: 'Not a coaching account' } });
  await serve(page, `${API}/coach/classes`, (route) => (opts.admin ? notACoach(route) : route.fulfill({ json: { classes: [] } })));
  await serve(page, `${API}/coach/admin/classes`, (route) => (opts.admin ? route.fulfill({ json: { classes: [] } }) : forbidden(route)));
  await serve(page, /\/coach\/monthly-summary(\?|$)/, (route) =>
    opts.admin
      ? notACoach(route)
      : route.fulfill({ json: { profile: { id: LEADER_ID, name: ME.profile.name, group: ME.profile.group }, availableMonths: [], summary: null } }),
  );

  const stuck: Array<Record<string, unknown>> = [
    { ...PARKED_SESSION },
    { ...HELD_SESSION },
    ...(opts.firstLessonHeld ? [{ ...FIRST_LESSON_HELD_SESSION }] : []),
    ...(opts.awaitingRelease ? AWAITING_RELEASE_SESSIONS.map((x) => ({ ...x })) : []),
    ...(opts.failedSends ? [...FAILED_SEND_SESSIONS, UNCONFIRMED_SEND_SESSION].map((x) => ({ ...x })) : []),
    ...(opts.parallelRunCopies ? [{ ...PARALLEL_RUN_SESSION }] : []),
  ];
  const reshares: Array<Record<string, unknown>> = opts.parallelRunCopies ? [{ ...PARALLEL_RUN_RESHARE }] : [];
  const coverage = { ...COVERAGE, leaders: COVERAGE.leaders.map((l) => ({ ...l })) };
  const roster = [{ id: LEADER_ID, name: ME.profile.name }];
  if (opts.failedSends) roster.push({ id: FAILED_SEND_LEADER.id, name: FAILED_SEND_LEADER.name });
  if (opts.leaderAdmin) {
    stuck.push({ ...UNRESOLVED_SESSION }, { ...SKIPPED_SESSION });
    coverage.leaders.push(...LEADER_ADMIN_COVERAGE.map((l) => ({ ...l })));
    roster.push({ id: PLACEHOLDER_LEADER.id, name: PLACEHOLDER_LEADER.name }, { id: 'evan-ellis', name: 'Evan Ellis' });
  }
  const attributions: Record<string, { titleMatch: string[]; altEmails: string[] }> = {
    'evan-ellis': { titleMatch: ['tuesday night'], altEmails: ['evan.personal@example.test'] },
  };
  const reattribute = (i: number, coachId: string, state: string) => {
    const session = stuck[i];
    if (!['scored', 'scoring_failed', 'delivery_pending', 'delivery_failed'].includes(state)) {
      stuck.splice(i, 1);
      return;
    }
    stuck[i] = { ...session, coachId, state, reason: 're-attributed: held until an admin releases it', holdKind: 'reattributed', action: 'release' };
  };
  const write = async (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();
    const body = req.postData() ? JSON.parse(req.postData() as string) : null;
    if (method !== 'GET') opts.onAdminWrite?.(method, url.pathname, body);
    const leaderOf = (id: string) => coverage.leaders.find((l) => l.coachId === id);
    const attribution = url.pathname.match(/admin\/leaders\/([^/]+)\/attribution$/);
    if (attribution) {
      if (method !== 'GET' && method !== 'PUT') return unmatched(route);
      const id = decodeURIComponent(attribution[1]);
      if (!leaderOf(id)) return refuse(route, 'unknown-leader');
      const lists = (attributions[id] ??= { titleMatch: [], altEmails: [] });
      if (method === 'GET') return route.fulfill({ json: lists });
      if (body.titleMatch.some((k: string) => k.trim().length < 3)) {
        return refuse(route, 'keyword-too-short');
      }
      const badAlt = body.altEmails.find((e: string) => !isEmailAddress(e.trim().toLowerCase()));
      if (badAlt !== undefined) {
        return refuse(route, 'invalid-alternate-address', { message: `Alternate address "${badAlt}": ${EMAIL_RULE}`, details: { address: badAlt } });
      }
      const normalized = (values: string[]) => [
        ...new Set(values.map((v) => v.trim().replace(/\s+/g, ' ').toLowerCase()).filter(Boolean)),
      ];
      const titleMatch = normalized(body.titleMatch);
      const conflicts = titleMatch.flatMap((keyword) =>
        roster
          .filter((other) => other.id !== id)
          .flatMap((other) => {
            const words = titleWords(keyword);
            if ((attributions[other.id]?.titleMatch ?? []).some((k) => containsWords(titleWords(k), words))) {
              return [`"${keyword}" is inside a keyword of ${other.id}`];
            }
            return containsWords(titleWords(other.name), words) ? [`"${keyword}" is inside the name of ${other.id}`] : [];
          }),
      );
      if (conflicts.length) return refuse(route, 'keyword-conflict', { message: `Keywords refused: ${conflicts.join('; ')}`, details: { conflicts } });
      lists.titleMatch = titleMatch;
      lists.altEmails = normalized(body.altEmails);
      const swept = stuck.filter(
        (session) => session.coachId === null && lists.titleMatch.some((k) => containsWords(titleWords(String(session.title)), titleWords(k))),
      );
      for (const session of swept) reattribute(stuck.indexOf(session), id, String(session.state));
      const resolved = swept.length;
      return route.fulfill({ json: { ...lists, resolved } });
    }
    const email = url.pathname.match(/admin\/leaders\/([^/]+)\/email$/);
    if (email) {
      if (method !== 'PUT') return unmatched(route);
      const address = String(body.email).trim().toLowerCase();
      if (!isEmailAddress(address)) return refuse(route, 'invalid-address');
      const leader = leaderOf(decodeURIComponent(email[1]));
      if (!leader) return refuse(route, 'unknown-leader');
      if (coverage.leaders.some((l) => l.email === address && l.coachId !== leader.coachId)) return refuse(route, 'taken');
      if (leader.coachId === LEADER_ID && body.confirm !== true) return refuse(route, 'confirm-required');
      const noticeSent = leader.email !== address && !isPlaceholder(leader.email) && !!opts.pipelineLive && !opts.noMailer;
      leader.email = address;
      const i = stuck.findIndex((x) => x.coachId === leader.coachId && x.state === 'delivered');
      if (i >= 0) stuck.splice(i, 1);
      return route.fulfill({ json: { email: address, noticeSent } });
    }
    const notTeaching = url.pathname.match(/admin\/leaders\/([^/]+)\/not-teaching$/);
    if (notTeaching) {
      if (method !== 'POST' && method !== 'DELETE') return unmatched(route);
      const leader = leaderOf(decodeURIComponent(notTeaching[1]));
      if (!leader) return refuse(route, 'unknown-leader');
      const attested = method === 'POST';
      leader.attestedAt = attested ? '2026-10-08T13:00:00.000Z' : null;
      leader.attestedBy = attested ? 'admin@example.test' : null;
      leader.basis = leader.observedSessions > 0 ? 'observed' : attested ? 'attested-not-teaching' : 'no-observation';
      leader.covered = leader.observedSessions > 0 || attested;
      leader.classAlert = leader.linkedClassName !== null && leader.observedSessions === 0 && !attested;
      coverage.allCovered = coverage.leaders.every((l) => l.covered);
      return route.fulfill({ json: { attested } });
    }
    const attribute = url.pathname.match(/admin\/sessions\/([^/]+)\/attribute$/);
    if (attribute) {
      if (method !== 'POST') return unmatched(route);
      if (typeof body?.coachId !== 'string' || !body.coachId || !('expectedCoachId' in body)) return invalidRequest(route);
      if (!roster.some((r) => r.id === body.coachId)) return refuse(route, 'unknown-leader');
      const i = stuck.findIndex((x) => x.sourceSessionId === decodeURIComponent(attribute[1]));
      if (i < 0) return refuse(route, 'unknown-session');
      if (stuck[i].coachId !== body.expectedCoachId) return refuse(route, 'attribution-changed');
      if (stuck[i].coachId === body.coachId) return refuse(route, 'already-assigned');
      const prior = String(stuck[i].state);
      const state = ['scored', 'scoring_failed', 'delivery_pending', 'delivery_failed', 'delivered'].includes(prior) ? 'retained' : prior;
      reattribute(i, body.coachId, state);
      return route.fulfill({ json: { coachId: body.coachId, state } });
    }
    if (url.pathname.endsWith('/admin/leaders')) {
      if (method !== 'POST') return unmatched(route);
      const address = String(body.email).trim().toLowerCase();
      if (!isEmailAddress(address)) return refuse(route, 'invalid-address');
      if (coverage.leaders.some((l) => l.email === address)) return refuse(route, 'email-taken');
      const id = String(body.name ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (id === 'avery-hollis' || roster.some((r) => r.id === id)) {
        return refuse(route, 'slug-taken', { message: `Another leader already uses the id "${id}". Enter a different name.`, details: { slug: id } });
      }
      const name = titleWords(String(body.name ?? ''));
      const inName = roster.flatMap((leader) =>
        (attributions[leader.id]?.titleMatch ?? [])
          .filter((keyword) => containsWords(name, titleWords(keyword)))
          .map((keyword) => `it contains "${keyword}", a keyword of ${leader.id}`),
      );
      if (inName.length) {
        return refuse(route, 'keyword-conflict', {
          message: `Name refused: ${inName.join('; ')}. Their sessions would be routed to that leader. Enter a different name or change that leader's keywords first.`,
        });
      }
      roster.push({ id, name: body.name });
      return route.fulfill({ json: { coach: { id, name: body.name, group: body.group ?? '', coachName: '', sessionCount: 0, latest: null } } });
    }
    return unmatched(route);
  };
  await serve(page, /\/coach\/admin\/(leaders|sessions)(\/|$)/, (route) => (opts.admin ? write(route) : forbidden(route)));
  await serve(page, /\/coach\/admin\/(pipeline-failures|coverage|reports\/[^/]+\/release)/, (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    opts.onPipelineRequest?.(url.pathname);
    if (!opts.admin) return forbidden(route);
    if (opts.pipelineStatus) {
      return route.fulfill({ status: opts.pipelineStatus, json: { error: ERROR_CODES[opts.pipelineStatus], message: 'database unavailable' } });
    }
    if (url.pathname.endsWith('/coverage')) return method === 'GET' ? route.fulfill({ json: coverage }) : unmatched(route);
    const requeue = url.pathname.match(/pipeline-failures\/([^/]+)\/requeue$/);
    if (requeue) {
      if (method !== 'POST') return unmatched(route);
      const i = stuck.findIndex(
        (x) => x.sourceSessionId === decodeURIComponent(requeue[1]) && ['scoring_failed', 'delivery_failed'].includes(String(x.state)),
      );
      if (i < 0) return refuse(route, 'not-parked');
      if (stuck[i].parallelRun && stuck[i].state === 'delivery_failed') return refuse(route, 'parallel-run-session');
      stuck.splice(i, 1);
      return route.fulfill({ json: { requeued: true } });
    }
    const release = url.pathname.match(/reports\/([^/]+)\/release$/);
    if (release) {
      if (method !== 'POST') return unmatched(route);
      const i = stuck.findIndex((x) => x.reportId === decodeURIComponent(release[1]) && (x.action === 'release' || x.parallelRun));
      if (i < 0) return refuse(route, 'not-held');
      if (stuck[i].parallelRun) return refuse(route, 'parallel-run-session');
      if (opts.noMailer) return refuse(route, 'no-mailer');
      if (!opts.pipelineLive) return refuse(route, 'parallel-run');
      const reportId = String(stuck[i].reportId);
      const review = reviews.get(reportId);
      const stored = store.get(reportId);
      const coldRecall = review?.firstLesson && stored ? coldRecallIn(stored.feedback as Record<string, unknown>) : [];
      if (coldRecall.length) {
        Object.assign(stuck[i], { reason: `held: a first lesson with a cold-recall improvement: ${coldRecall.join('; ')}`, holdKind: 'cold-recall' });
        return route.fulfill({ json: { delivered: false, refusal: 'cold-recall-improvement', coldRecall } });
      }
      const leader = coverage.leaders.find((l) => l.coachId === stuck[i].coachId);
      stuck.splice(i, 1);
      held.delete(reportId);
      if (review) review.delivered = true;
      return route.fulfill({
        json: { delivered: true, ...(leader && isPlaceholder(leader.email) ? { skipped: [leader.email] } : {}) },
      });
    }
    if (method !== 'GET') return unmatched(route);
    const limit = Number(url.searchParams.get('limit') ?? 50);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const sessions = stuck.slice(offset, offset + limit).map((x) => {
      const feedback = store.get(String(x.reportId))?.feedback as Record<string, unknown> | undefined;
      const row = { parallelRun: false, sessionStartedAt: null, ...x };
      return x.holdKind === 'cold-recall' ? { ...row, coldRecall: feedback ? coldRecallIn(feedback) : [] } : row;
    });
    return route.fulfill({ json: { sessions, total: stuck.length, limit, offset } });
  });

  await serve(page, /\/coach\/admin\/reshares(\/[^/]+\/(send|resolve))?$/, (route) => {
    if (!opts.admin) return forbidden(route);
    const req = route.request();
    const url = new URL(req.url());
    const [, id, action] = url.pathname.match(/\/admin\/reshares\/([^/]+)\/(send|resolve)$/) ?? [];
    if (!action) return req.method() === 'GET' ? route.fulfill({ json: { requests: reshares } }) : unmatched(route);
    if (req.method() !== 'POST') return unmatched(route);
    opts.onAdminWrite?.(req.method(), url.pathname, null);
    const i = reshares.findIndex((r) => r.sourceSessionId === decodeURIComponent(id));
    if (i < 0) return refuse(route, action === 'send' ? 'unknown-session' : 'not-pending');
    if (action === 'resolve') {
      reshares.splice(i, 1);
      return route.fulfill({ json: { resolved: true } });
    }
    if (reshares[i].parallelRun) return refuse(route, 'parallel-run-session');
    if (!opts.pipelineLive) return refuse(route, 'parallel-run');
    if (reshares[i].asked) return refuse(route, 'already-asked');
    reshares[i].asked = true;
    return route.fulfill({ json: { sent: true } });
  });

  await revisionRoutes(page, opts, store, reviews);

  await serve(page, `${API}/coach/rubric`, async (route) => {
    if (opts.rubricDelayMs) {
      await new Promise((r) => setTimeout(r, opts.rubricDelayMs));
    }
    await route.fulfill({ json: RUBRIC });
  });

  await serve(page, `${API}/coach/me`, (route) =>
    route.fulfill({ json: opts.admin ? ADMIN_ME : ME }),
  );

  await serve(page, `${API}/coach/trends`, (route) => route.fulfill({ json: TRENDS }));

  await serve(page, /\/coach\/admin\/coaches\/[^/]+\/monthly-summary/, async (route) => {
    if (!opts.admin) return forbidden(route);
    const url = new URL(route.request().url());
    const id = decodeURIComponent(url.pathname.split('/').at(-2) ?? '');
    if (!MONTHLY_LEADERS[id]) return refuse(route, 'unknown-leader');
    const delay = opts.monthlyDelayMs?.[id];
    if (delay) await new Promise((r) => setTimeout(r, delay));
    return route.fulfill({ json: monthlyFor(id, url.searchParams.get('month') ?? '') });
  });

  await serve(page, /\/coach\/admin\/monthly\?/, (route) => {
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

  await serve(page, `${API}/coach/admin/coaches`, (route) =>
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
      : forbidden(route),
  );

  await serve(page, `${API}/coach/admin/coaches/*/trends`, (route) =>
    opts.admin
      ? route.fulfill({ json: ADMIN_TRENDS })
      : forbidden(route),
  );

  await serve(page, `${API}/coach/reports`, (route) => {
    opts.onReportsRequest?.(new URL(route.request().url()).pathname);
    return route.fulfill({ json: { reports: all().filter((r) => !held.has(r.id)).map(withAttached) } });
  });

  await page.route(`${API}/fake-object-store/**`, (route) =>
    opts.breakPlayback
      ? route.fulfill({ status: 404, body: 'gone' })
      : route.fulfill({ contentType: 'video/mp4', body: TINY_MP4 }),
  );

  await serve(page, `${API}/coach/reports/*/recording-url`, async (route) => {
    const id = decodeURIComponent(
      new URL(route.request().url()).pathname.split('/').at(-2) ?? '',
    );
    opts.onMint?.(id);
    if (opts.mintDelayMs) {
      await new Promise((r) => setTimeout(r, opts.mintDelayMs));
    }
    if (!retained.has(id) || held.has(id)) return notFound(route, 'No retained recording');
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

  await serve(page, `${API}/coach/reports/*`, (route) => {
    if (opts.admin) return route.fulfill({ status: 403, json: { error: 'FORBIDDEN', message: 'Not a coaching account' } });
    const id = decodeURIComponent(
      new URL(route.request().url()).pathname.split('/').at(-1) ?? '',
    );
    opts.onReportsRequest?.(new URL(route.request().url()).pathname);
    const found = store.get(id);
    if (!found || held.has(id)) return notFound(route, 'Session not found');
    return route.fulfill({
      json: { report: { ...withAttached(found), hasRetainedRecording: retained.has(id) } },
    });
  });

  await serve(page, /\/coach\/reports\/summary(\?|$)/, (route) => {
    const url = new URL(route.request().url());
    opts.onReportsRequest?.(`${url.pathname}${url.search}`);
    if (opts.admin) return route.fulfill({ status: 403, json: { error: 'FORBIDDEN', message: 'Not a coaching account' } });
    const limit = Number(url.searchParams.get('limit') ?? 25);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const visible = all().filter((r) => !held.has(r.id));
    return route.fulfill({
      json: { items: visible.slice(offset, offset + limit).map(summaryOf), total: visible.length, ...AGGREGATES },
    });
  });

  await serve(page, /\/coach\/admin\/coaches\/[^/]+\/reports\/(?!summary(?:\?|$))[^/?]+$/, (route) => {
    if (!opts.admin) return forbidden(route);
    if (route.request().method() !== 'GET') return unmatched(route);
    const id = decodeURIComponent(new URL(route.request().url()).pathname.split('/').at(-1) ?? '');
    const found = store.get(id);
    if (!found) return refuse(route, 'unknown-report');
    return route.fulfill({ json: { report: { ...withAttached(found), hasRetainedRecording: retained.has(id) } } });
  });

  await serve(page, /\/coach\/admin\/coaches\/[^/]+\/reports\/[^/]+\/(notes|recording)$/, (route) => {
    if (!opts.admin) return forbidden(route);
    const req = route.request();
    const url = new URL(req.url());
    const [, , id, action] = url.pathname.match(/\/admin\/coaches\/([^/]+)\/reports\/([^/]+)\/(notes|recording)$/) ?? [];
    if (req.method() !== (action === 'notes' ? 'POST' : 'PUT')) return unmatched(route);
    const body = req.postData() ? JSON.parse(req.postData() as string) : null;
    opts.onAdminWrite?.(req.method(), url.pathname, body);
    const found = store.get(decodeURIComponent(id));
    if (action === 'recording') {
      const recordingUrl = String(body.recordingUrl).trim();
      if (recordingUrl && !/^https?:\/\/\S+$/i.test(recordingUrl)) return refuse(route, 'invalid-link');
      if (!found) return refuse(route, 'unknown-report');
      attached[found.id] = recordingUrl;
      return route.fulfill({ json: { recordingUrl } });
    }
    const text = String(body.body).trim();
    if (!text) return refuse(route, 'empty-note');
    if (!found) return refuse(route, 'unknown-report');
    if (held.has(found.id)) return refuse(route, 'held');
    const note = { id: `note-${(found.notes?.length ?? 0) + 1}`, body: text, createdAt: '2026-10-08T16:00:00.000Z', emailed: true };
    found.notes = [note, ...(found.notes ?? [])];
    return route.fulfill({ json: { note } });
  });

  await serve(page, /\/coach\/admin\/coaches\/[^/]+\/reports\/summary(\?|$)/, (route) => {
    if (!opts.admin) return forbidden(route);
    const url = new URL(route.request().url());
    const limit = Number(url.searchParams.get('limit') ?? 25);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    return route.fulfill({
      json: {
        items: all().slice(offset, offset + limit).map((r) => ({
          ...summaryOf(r),
          hasRetainedRecording: retained.has(r.id),
          attachedRecordingUrl: attached[r.id] ?? null,
          held: held.has(r.id),
        })),
        total: all().length,
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
