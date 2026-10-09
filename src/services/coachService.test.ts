/**
 * coachService maps the /coach/* backend responses onto the portal types and
 * turns 401 / 403 into the CoachAuthError reasons the UI gates on.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addCoachLeader,
  amendReport,
  correctDimension,
  fetchCoverage,
  fetchLeaderAttribution,
  fetchPendingReshares,
  fetchPipelineFailures,
  EMAIL_RULE,
  isEmailAddress,
  isPlaceholderAddress,
  fetchReportReview,
  fetchReportRevisions,
  mintRecordingUrl,
  releaseHeldReport,
  requeuePipelineFailure,
  requeueRevision,
  resolveReshareRequest,
  saveLeaderAttribution,
  sendReshareRequest,
  sendRevision,
  setFirstLesson,
  editImprovements,
  addCoachNote,
  attributeSession,
  CoachAuthError,
  createCoachClass,
  deleteCoachClass,
  fetchAdminCoaches,
  fetchAdminMonthly,
  fetchAllCoachClasses,
  fetchCoachClasses,
  fetchCoachReportDetail,
  fetchCoachReportSummaries,
  fetchCoachMe,
  saveCoachZoomLink,
  saveRecordingLink,
  setNotTeaching,
  statusColor,
  updateCoachClass,
  updateLeaderEmail,
  needsBenchmarkConfirm,
  describeAddressChange,
  confirmAddressChange,
  fetchParallelRunComparison,
  refusalCode,
} from './coachService';

const ORIGINAL_FETCH = global.fetch;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

let calls: Array<{ url: string; init?: RequestInit }> = [];
function mockFetch(router: (url: string, init?: RequestInit) => Response) {
  calls = [];
  global.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    calls.push({ url, init });
    return Promise.resolve(router(url, init));
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  // A present access token so fetchWithAuth attaches Authorization; no refresh
  // token so a 401 does not trigger a refresh retry.
  document.cookie = 'accessToken=test-token; path=/';
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
});

describe('coachService', () => {
  it('fetches one page of report summaries and attaches the bearer token', async () => {
    mockFetch((url) => {
      if (url.endsWith('/coach/reports/summary?limit=50&offset=50')) {
        return jsonResponse({ items: [{ id: 'r1', session: 'James L5', score: 86 }], total: 51 });
      }
      return jsonResponse({}, 404);
    });

    const page = await fetchCoachReportSummaries(50);
    expect(page.total).toBe(51);
    expect(page.items[0].id).toBe('r1');
    expect(calls.map((c) => c.url).some((u) => u.endsWith('/coach/reports'))).toBe(false);
    const auth = new Headers(calls[0].init?.headers).get('Authorization');
    expect(auth).toBe('Bearer test-token');
  });

  it('reads an unknown report as not found, and a server failure as a failure', async () => {
    mockFetch(() => jsonResponse({ error: 'NOT_FOUND', message: 'Report not found' }, 404));
    await expect(fetchCoachReportDetail('gone')).resolves.toBeNull();
    mockFetch(() => jsonResponse({ error: 'INTERNAL', message: 'boom' }, 500));
    await expect(fetchCoachReportDetail('r1')).rejects.toThrow();
  });

  it('reads a review with no scores as legacy, and any other failure as a failure', async () => {
    mockFetch(() => jsonResponse({ error: 'NOT_FOUND', message: 'No scores for that report', details: { refusal: 'unknown-report' } }, 404));
    await expect(fetchReportReview('legacy')).resolves.toBeNull();
    mockFetch(() => jsonResponse({ error: 'NOT_FOUND', message: 'Route not found' }, 404));
    await expect(fetchReportReview('r1')).rejects.toMatchObject({ status: 404, serverMessage: 'Route not found' });
    for (const status of [500, 502, 409, 400]) {
      mockFetch(() => jsonResponse({ error: 'X', message: 'boom' }, status));
      await expect(fetchReportReview('r1')).rejects.toMatchObject({ status, serverMessage: 'boom' });
    }
  });

  it('maps 401 to a signed_out auth error', async () => {
    mockFetch(() => jsonResponse({ error: 'unauthorized' }, 401));
    await expect(fetchCoachMe()).rejects.toMatchObject(
      new CoachAuthError('signed_out'),
    );
  });

  it('maps 403 to a not_a_coach auth error', async () => {
    mockFetch(() => jsonResponse({ error: 'not_a_coach' }, 403));
    await expect(fetchCoachMe()).rejects.toBeInstanceOf(CoachAuthError);
    await expect(fetchCoachMe()).rejects.toHaveProperty('reason', 'not_a_coach');
  });

  it('PUTs the zoom link and returns the saved value', async () => {
    mockFetch((url, init) => {
      expect(url).toContain('/coach/zoom-link');
      expect(init?.method).toBe('PUT');
      const body = JSON.parse(String(init?.body));
      return jsonResponse({ zoomLink: body.zoomLink });
    });
    const saved = await saveCoachZoomLink('https://zoom.us/j/123');
    expect(saved).toBe('https://zoom.us/j/123');
  });

  // Band labels are now SERVED, so the colour follows a band's POSITION rather
  // than its name. The switch this replaced named all five labels, which made
  // it a copy of the rubric: renaming a band dropped its colour to the red
  // default, showing a leader in the TOP band the colour of the bottom one.
  const BANDS = ['Exceptional', 'Strong', 'On Target', 'Developing', 'Early Stage'];

  it('assigns distinct status colors, gold for the top band', () => {
    expect(statusColor('Exceptional', BANDS)).toBe('var(--vm-dust)');
    expect(statusColor('Exceptional', BANDS)).not.toBe(
      statusColor('Strong', BANDS),
    );
  });

  it('a RENAMED top band still gets the top colour', () => {
    expect(statusColor('Outstanding', ['Outstanding', 'Strong'])).toBe(
      'var(--vm-dust)',
    );
  });

  it('a sixth served band takes the bottom colour, not the unknown grey', () => {
    const six = [...BANDS, 'Sixth'];
    expect(statusColor('Exceptional', six)).toBe('var(--vm-dust)');
    expect(statusColor('Sixth', six)).toBe('#B91C1C');
    expect(six.map((b) => statusColor(b, six))).not.toContain('#8A8272');
  });

  it('an unknown label falls back rather than throwing', () => {
    expect(statusColor('Nonsense', BANDS)).toBe('#8A8272');
  });

  it('a status is NOT red before the bands have loaded', () => {
    // Every caller passes [] on first paint. Keyed by position with a
    // last-entry fallback, the top band rendered in the bottom band's red
    // until the fetch resolved.
    const bottom = statusColor('Early Stage', BANDS);
    expect(statusColor('Exceptional', [])).not.toBe(bottom);
    expect(statusColor('Exceptional', [])).toBe('#8A8272');
  });

  it('fetches the admin roster', async () => {
    mockFetch((url) => {
      expect(url).toContain('/coach/admin/coaches');
      return jsonResponse({ coaches: [{ id: 'milo-kerr', name: 'Milo Kerr', sessionCount: 3 }] });
    });
    const coaches = await fetchAdminCoaches();
    expect(coaches).toHaveLength(1);
    expect(coaches[0].id).toBe('milo-kerr');
  });

  it("reads one leader's summaries a page at a time and one report at a time through the admin routes", async () => {
    mockFetch((url) => {
      if (url.endsWith('/coach/admin/coaches/milo-kerr/reports/summary?limit=5&offset=10')) {
        return jsonResponse({ items: [{ id: 'r1' }], total: 11, streakWeeks: 4, quarterSessions: 6 });
      }
      if (url.endsWith('/coach/admin/coaches/milo-kerr/reports/r1')) return jsonResponse({ report: { id: 'r1' } });
      return jsonResponse({ error: 'NOT_FOUND', message: 'Session not found' }, 404);
    });
    await expect(fetchCoachReportSummaries(10, 5, 'milo-kerr')).resolves.toEqual({
      items: [{ id: 'r1' }],
      total: 11,
      streakWeeks: 4,
      quarterSessions: 6,
    });
    await expect(fetchCoachReportDetail('r1', 'milo-kerr')).resolves.toMatchObject({ id: 'r1' });
    await expect(fetchCoachReportDetail('gone', 'milo-kerr')).resolves.toBeNull();
    expect(calls.map((c) => c.url).some((u) => /\/reports$/.test(u))).toBe(false);
  });

  it('maps admin 403 (non-admin coach) to a not_a_coach error', async () => {
    mockFetch(() => jsonResponse({ error: 'not_a_coach' }, 403));
    await expect(fetchAdminCoaches()).rejects.toBeInstanceOf(CoachAuthError);
  });

  it('fetches every leader’s classes (admin export) with owner identity', async () => {
    mockFetch((url) => {
      expect(url).toContain('/coach/admin/classes');
      return jsonResponse({
        classes: [
          {
            id: 'c1',
            name: 'Thursday — James',
            classDate: '2026-07-23',
            recurrence: 'weekly',
            zoomLink: 'https://zoom.us/j/1',
            leader: { id: 'milo-kerr', name: 'Milo Kerr', email: 'milo@example.com' },
          },
        ],
      });
    });
    const classes = await fetchAllCoachClasses();
    expect(classes).toHaveLength(1);
    expect(classes[0].leader.name).toBe('Milo Kerr');
    expect(classes[0].zoomLink).toBe('https://zoom.us/j/1');
  });

  it('maps admin/classes 403 to a not_a_coach error', async () => {
    mockFetch(() => jsonResponse({ error: 'not_a_coach' }, 403));
    await expect(fetchAllCoachClasses()).rejects.toBeInstanceOf(CoachAuthError);
  });

  it('fetches the coach classes list', async () => {
    mockFetch((url) => {
      expect(url).toContain('/coach/classes');
      return jsonResponse({
        classes: [
          { id: 'c1', name: 'Thursday — James', classDate: '2026-07-23', recurrence: 'weekly', zoomLink: 'https://zoom.us/j/1' },
        ],
      });
    });
    const classes = await fetchCoachClasses();
    expect(classes).toHaveLength(1);
    expect(classes[0].id).toBe('c1');
  });

  it('POSTs a new class and returns the created record', async () => {
    mockFetch((url, init) => {
      expect(url).toContain('/coach/classes');
      expect(init?.method).toBe('POST');
      const body = JSON.parse(String(init?.body));
      return jsonResponse({ class: { id: 'new', ...body, classDate: body.classDate || null } });
    });
    const created = await createCoachClass({
      name: 'Saturday — Kings',
      classDate: '',
      recurrence: 'weekly',
      zoomLink: 'https://meet.google.com/abc',
    });
    expect(created.id).toBe('new');
    expect(created.classDate).toBeNull();
    expect(created.zoomLink).toBe('https://meet.google.com/abc');
  });

  it('PUTs an updated class to its id-scoped URL', async () => {
    mockFetch((url, init) => {
      expect(url).toContain('/coach/classes/c1');
      expect(init?.method).toBe('PUT');
      const body = JSON.parse(String(init?.body));
      return jsonResponse({ class: { id: 'c1', ...body, classDate: body.classDate || null } });
    });
    const updated = await updateCoachClass('c1', {
      name: 'Renamed',
      classDate: '2026-08-01',
      recurrence: 'biweekly',
      zoomLink: '',
    });
    expect(updated.name).toBe('Renamed');
    expect(updated.recurrence).toBe('biweekly');
  });

  it('DELETEs a class by id', async () => {
    let seen: { url: string; method?: string } | null = null;
    mockFetch((url, init) => {
      seen = { url, method: init?.method };
      return jsonResponse({ success: true });
    });
    await deleteCoachClass('c1');
    expect(seen).not.toBeNull();
    expect(seen?.url).toContain('/coach/classes/c1');
    expect(seen?.method).toBe('DELETE');
  });

  it('POSTs a new leader by email and returns the roster summary', async () => {
    mockFetch((url, init) => {
      expect(url).toContain('/coach/admin/leaders');
      expect(init?.method).toBe('POST');
      const body = JSON.parse(String(init?.body));
      expect(body.email).toBe('new@leader.com');
      return jsonResponse({
        coach: { id: 'x', name: 'New Leader', group: '', coachName: '', sessionCount: 0, latest: null },
      });
    });
    const coach = await addCoachLeader({ email: 'new@leader.com' });
    expect(coach.id).toBe('x');
    expect(coach.sessionCount).toBe(0);
  });

  it("PUTs a leader's new address to the leader's id and returns the stored one", async () => {
    mockFetch((url, init) => {
      expect(url).toContain('/coach/admin/leaders/wyatt-wellington/email');
      expect(init?.method).toBe('PUT');
      expect(JSON.parse(String(init?.body))).toEqual({ email: 'Wyatt@Example.test' });
      return jsonResponse({ email: 'wyatt@example.test', status: 'pending', expiresAt: '2026-10-16T15:00:00.000Z', confirmationSent: true });
    });
    expect(await updateLeaderEmail('wyatt-wellington', 'Wyatt@Example.test')).toEqual({
      email: 'wyatt@example.test',
      status: 'pending',
      expiresAt: '2026-10-16T15:00:00.000Z',
      confirmationSent: true,
    });
  });

  it("asks for the benchmark confirm on the server's confirm-required refusal code, never on the wording of its message", async () => {
    mockFetch(() =>
      jsonResponse({ error: 'CONFLICT', message: 'Reworded by the server', details: { refusal: 'confirm-required' } }, 409),
    );
    const coded = await updateLeaderEmail('nora-quill', 'nora@example.org').catch((e) => e);
    expect(needsBenchmarkConfirm(coded)).toBe(true);

    mockFetch(() =>
      jsonResponse({ error: 'CONFLICT', message: 'Another leader already uses that address; send confirm: true to change it' }, 409),
    );
    const worded = await updateLeaderEmail('nora-quill', 'nora@example.org').catch((e) => e);
    expect(needsBenchmarkConfirm(worded)).toBe(false);
  });

  it('POSTs the leader a session is assigned to', async () => {
    mockFetch((url, init) => {
      expect(url).toContain('/coach/admin/sessions/ff%2F4/attribute');
      expect(init?.method).toBe('POST');
      expect(JSON.parse(String(init?.body))).toEqual({ coachId: 'amy-lee', expectedCoachId: null });
      return jsonResponse({ coachId: 'amy-lee', state: 'retained' });
    });
    expect(await attributeSession('ff/4', 'amy-lee', null)).toEqual({ coachId: 'amy-lee', state: 'retained' });
  });

  it.each([
    ['a.b+c_d%e-f@example.org', true],
    ['leader@church.example.org', true],
    ['a,b@example.org', false],
    ['a;b@example.org', false],
    ['<a>@example.org', false],
    ['"a"@example.org', false],
    ['a b@example.org', false],
    ['.a@example.org', false],
    ['a.@example.org', false],
    ['a..b@example.org', false],
    ['a@example.org.', false],
    ['a@example', false],
    ['a@-example.org', false],
    ['a@b@example.org', false],
    ['@example.org', false],
    [`${'a'.repeat(250)}@x.org`, false],
  ])('holds %s to the server\'s address rule: %s', (address, ok) => {
    expect(isEmailAddress(address)).toBe(ok);
  });

  it('names the rule the server enforces, and reads a placeholder with a trailing dot as one', () => {
    expect(EMAIL_RULE).toBe(
      'Enter one email address: letters, digits and . _ % + - before the @, then a domain such as example.org, with no trailing dot',
    );
    expect(isPlaceholderAddress('dana@needs-real-email.invalid.')).toBe(true);
    expect(isPlaceholderAddress(' Dana@Needs-Real-Email.INVALID ')).toBe(true);
    expect(isPlaceholderAddress('dana@example.org')).toBe(false);
  });

  it('reads one page of stuck sessions with the total the server counted', async () => {
    const stuck = { sourceSessionId: 'ff-1', coachId: null, title: 't', sessionDate: '2026-09-01', state: 'observed', attempts: 0, reportId: null, reason: null, action: 'attribute', updatedAt: '2026-09-02T00:00:00Z' };
    mockFetch(() => jsonResponse({ sessions: [stuck], total: 120, limit: 50, offset: 50 }));
    expect(await fetchPipelineFailures(50)).toEqual({ sessions: [stuck], total: 120, limit: 50, offset: 50 });
  });

  it('POSTs a not-teaching attestation and DELETEs it to clear', async () => {
    mockFetch((url, init) => {
      expect(url).toContain('/coach/admin/leaders/amy-lee/not-teaching');
      return jsonResponse({ attested: init?.method === 'POST' });
    });
    expect(await setNotTeaching('amy-lee', true)).toEqual({ attested: true });
    expect(calls[0].init?.method).toBe('POST');
    expect(await setNotTeaching('amy-lee', false)).toEqual({ attested: false });
    expect(calls[1].init?.method).toBe('DELETE');
  });

  it('PUTs a session recording link', async () => {
    mockFetch((url, init) => {
      expect(url).toContain('/coach/admin/coaches/milo-kerr/reports/r1/recording');
      expect(init?.method).toBe('PUT');
      const body = JSON.parse(String(init?.body));
      return jsonResponse({ recordingUrl: body.recordingUrl });
    });
    const saved = await saveRecordingLink('milo-kerr', 'r1', 'https://zoom.us/rec/abc');
    expect(saved).toBe('https://zoom.us/rec/abc');
  });

  it('POSTs a coaching note and returns it', async () => {
    mockFetch((url, init) => {
      expect(url).toContain('/coach/admin/coaches/milo-kerr/reports/r1/notes');
      expect(init?.method).toBe('POST');
      return jsonResponse({
        note: { id: 'n1', body: 'Great job.', createdAt: '2026-07-21T00:00:00.000Z', emailed: true },
      });
    });
    const note = await addCoachNote('milo-kerr', 'r1', 'Great job.');
    expect(note.id).toBe('n1');
    expect(note.emailed).toBe(true);
  });

  it('fetches the monthly rollup for a given month', async () => {
    mockFetch((url) => {
      expect(url).toContain('/coach/admin/monthly?month=2026-07');
      return jsonResponse({
        month: '2026-07',
        monthLabel: 'July 2026',
        program: { sessions: 4, activeLeaders: 2, newcomers: 6, avgScore: 82, clusters: [], delta: 1.5 },
        leaders: [],
        availableMonths: ['2026-07', '2026-06', '2026-05'],
        narrative: { executiveSummary: ['In July 2026, ...'], trends: ['The program ...'] },
      });
    });
    const data = await fetchAdminMonthly('2026-07');
    expect(data.monthLabel).toBe('July 2026');
    expect(data.program.sessions).toBe(4);
    expect(data.availableMonths).toEqual(['2026-07', '2026-06', '2026-05']);
    expect(data.narrative?.executiveSummary[0]).toContain('July 2026');
  });

  it("fetches a leader's own monthly summary", async () => {
    mockFetch((url) => {
      expect(url).toContain('/coach/monthly-summary?month=2026-06');
      return jsonResponse({
        profile: { id: 'avery-hollis', name: 'Avery Hollis', group: 'James' },
        summary: { month: '2026-06', monthLabel: 'June 2026', composite: 79, clusters: [], sessions: [] },
        availableMonths: ['2026-06', '2026-05'],
      });
    });
    const { fetchMyMonthlySummary } = await import('./coachService');
    const data = await fetchMyMonthlySummary('2026-06');
    expect(data.summary?.monthLabel).toBe('June 2026');
    expect(data.availableMonths).toEqual(['2026-06', '2026-05']);
  });

  it("fetches a leader's monthly summary for admin drill-in", async () => {
    mockFetch((url) => {
      expect(url).toContain('/coach/admin/coaches/milo-kerr/monthly-summary?month=2026-05');
      return jsonResponse({
        profile: { id: 'milo-kerr', name: 'Milo Kerr', group: 'Colossians' },
        summary: null,
        availableMonths: ['2026-05'],
      });
    });
    const { fetchLeaderMonthlySummary } = await import('./coachService');
    const data = await fetchLeaderMonthlySummary('milo-kerr', '2026-05');
    expect(data.profile.id).toBe('milo-kerr');
    expect(data.summary).toBeNull();
  });

  it.each<[string, () => Promise<unknown>, string, string, unknown]>([
    ['mint a recording address', () => mintRecordingUrl('r/1'), 'GET', '/coach/reports/r%2F1/recording-url', undefined],
    ['list pending re-shares', () => fetchPendingReshares(), 'GET', '/coach/admin/reshares', undefined],
    ['ask for a re-share', () => sendReshareRequest('ff/1'), 'POST', '/coach/admin/reshares/ff%2F1/send', undefined],
    ['resolve a re-share', () => resolveReshareRequest('ff/1'), 'POST', '/coach/admin/reshares/ff%2F1/resolve', undefined],
    ['list pipeline failures', () => fetchPipelineFailures(), 'GET', '/coach/admin/pipeline-failures?limit=50&offset=0', undefined],
    ['list a later page of pipeline failures', () => fetchPipelineFailures(100, 25), 'GET', '/coach/admin/pipeline-failures?limit=25&offset=100', undefined],
    ['requeue a failure', () => requeuePipelineFailure('ff/1'), 'POST', '/coach/admin/pipeline-failures/ff%2F1/requeue', undefined],
    [
      'assign an unattributed session',
      () => attributeSession('ff/4', 'amy-lee', null),
      'POST',
      '/coach/admin/sessions/ff%2F4/attribute',
      { coachId: 'amy-lee', expectedCoachId: null },
    ],
    [
      'move a session from the leader it was attributed to',
      () => attributeSession('ff/4', 'amy-lee', 'milo-kerr'),
      'POST',
      '/coach/admin/sessions/ff%2F4/attribute',
      { coachId: 'amy-lee', expectedCoachId: 'milo-kerr' },
    ],
    ['release a held report', () => releaseHeldReport('rep/2'), 'POST', '/coach/admin/reports/rep%2F2/release', undefined],
    ['read a report review', () => fetchReportReview('rep/1'), 'GET', '/coach/admin/reports/rep%2F1/review', undefined],
    [
      'correct a dimension of an undelivered report',
      () => correctDimension('rep/1', 9, { score: 3, rationale: 'r' }),
      'POST',
      '/coach/admin/reports/rep%2F1/dimensions/9',
      { score: 3, rationale: 'r' },
    ],
    [
      'amend a report',
      () => amendReport('rep/1', { body: { headline: 'x' } }),
      'POST',
      '/coach/admin/reports/rep%2F1/amend',
      { body: { headline: 'x' } },
    ],
    [
      'set the first-lesson flag',
      () => setFirstLesson('rep/1', { firstLesson: false, score: 3, rationale: 'r' }),
      'PUT',
      '/coach/admin/reports/rep%2F1/first-lesson',
      { firstLesson: false, score: 3, rationale: 'r' },
    ],
    [
      "replace an undelivered report's improvements",
      () => editImprovements('rep/1', { improvements: ['a'], improvementsProse: [{ title: 't', paragraphs: ['p'] }] }),
      'PUT',
      '/coach/admin/reports/rep%2F1/improvements',
      { improvements: ['a'], improvementsProse: [{ title: 't', paragraphs: ['p'] }] },
    ],
    ['list kept versions', () => fetchReportRevisions('rep/1'), 'GET', '/coach/admin/reports/rep%2F1/revisions', undefined],
    ['send the latest revision', () => sendRevision('rep/1'), 'POST', '/coach/admin/reports/rep%2F1/revision/send', undefined],
    ['requeue the latest revision', () => requeueRevision('rep/1'), 'POST', '/coach/admin/reports/rep%2F1/revision/requeue', undefined],
    ['read coverage', () => fetchCoverage(14), 'GET', '/coach/admin/coverage?windowDays=14', undefined],
    ['attest not teaching', () => setNotTeaching('amy/lee', true), 'POST', '/coach/admin/leaders/amy%2Flee/not-teaching', undefined],
    ['clear the attestation', () => setNotTeaching('amy/lee', false), 'DELETE', '/coach/admin/leaders/amy%2Flee/not-teaching', undefined],
    ['change a leader address', () => updateLeaderEmail('amy/lee', 'a@example.test'), 'PUT', '/coach/admin/leaders/amy%2Flee/email', { email: 'a@example.test' }],
    [
      "confirm a change to the benchmark leader's address",
      () => updateLeaderEmail('amy/lee', 'a@example.test', true),
      'PUT',
      '/coach/admin/leaders/amy%2Flee/email',
      { email: 'a@example.test', confirm: true },
    ],
    ['read keywords and addresses', () => fetchLeaderAttribution('amy/lee'), 'GET', '/coach/admin/leaders/amy%2Flee/attribution', undefined],
    [
      'save keywords and addresses',
      () => saveLeaderAttribution('amy/lee', { titleMatch: ['ruth'], altEmails: [] }),
      'PUT',
      '/coach/admin/leaders/amy%2Flee/attribution',
      { titleMatch: ['ruth'], altEmails: [] },
    ],
  ])('%s: exactly one request, with its method, path and body', async (_name, call, method, path, body) => {
    mockFetch(() => jsonResponse({ email: 'a@example.test' }));
    await call();
    expect(calls).toHaveLength(1);
    const [{ url, init }] = calls;
    expect(init?.method ?? 'GET').toBe(method);
    expect(url.slice(-path.length)).toBe(path);
    expect(init?.body === undefined ? undefined : JSON.parse(String(init.body))).toEqual(body);
  });
});

describe('the address confirmation link', () => {
  it('describes a change with a POST carrying the token in the body, never in the address', async () => {
    mockFetch(() => jsonResponse({ leaderName: 'Leader A', newEmail: 'n***@example.test', state: 'pending', expiresAt: '2026-10-16T15:00:00.000Z' }));
    const change = await describeAddressChange('a+b/c');
    expect(calls[0].url).toMatch(/\/coach\/confirm-address\/describe$/);
    expect(calls[0].init?.method).toBe('POST');
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({ token: 'a+b/c' });
    expect(change.state).toBe('pending');
  });

  it('confirms with a POST carrying the token in the body', async () => {
    mockFetch(() => jsonResponse({ email: 'new@example.test', noticeSent: false }));
    expect(await confirmAddressChange('tok-1')).toEqual({ email: 'new@example.test', noticeSent: false });
    expect(calls[0].url).toMatch(/\/coach\/confirm-address$/);
    expect(calls[0].init?.method).toBe('POST');
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({ token: 'tok-1' });
  });

  it('carries the refusal code of a refused confirm', async () => {
    mockFetch(() => jsonResponse({ error: 'CONFLICT', message: 'Reworded', details: { refusal: 'superseded' } }, 409));
    expect(refusalCode(await confirmAddressChange('tok-1').catch((e) => e))).toBe('superseded');
  });
});

describe('the parallel-run comparison', () => {
  it('is read from the admin route as the server computes it', async () => {
    const body = {
      sessions: [],
      needsPairing: [],
      unmatched: { backend: [], host: [] },
      share: { withinOne: 0, comparable: 0, ratio: null },
      counts: { compared: 0, flagged: 0, needsPairing: 0, unmatchedBackend: 0, unmatchedHost: 0 },
    };
    mockFetch(() => jsonResponse(body));
    expect(await fetchParallelRunComparison()).toEqual(body);
    expect(calls[0].url).toMatch(/\/coach\/admin\/parallel-run\/comparison$/);
  });
});
