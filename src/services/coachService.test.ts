/**
 * coachService maps the /coach/* backend responses onto the portal types and
 * turns 401 / 403 into the CoachAuthError reasons the UI gates on.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addCoachLeader,
  addCoachNote,
  CoachAuthError,
  createCoachClass,
  deleteCoachClass,
  fetchAdminCoaches,
  fetchAdminMonthly,
  fetchAllCoachClasses,
  fetchCoachClasses,
  fetchCoachReports,
  fetchCoachReportsFor,
  fetchCoachMe,
  saveCoachZoomLink,
  pdfDownloadUrl,
  saveRecordingLink,
  statusColor,
  updateCoachClass,
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
  it('fetches reports and attaches the bearer token', async () => {
    mockFetch((url) => {
      if (url.endsWith('/coach/reports')) {
        return jsonResponse({ reports: [{ id: 'r1', session: 'James L5', score: 86 }] });
      }
      return jsonResponse({}, 404);
    });

    const reports = await fetchCoachReports();
    expect(reports).toHaveLength(1);
    expect(reports[0].id).toBe('r1');
    const auth = new Headers(calls[0].init?.headers).get('Authorization');
    expect(auth).toBe('Bearer test-token');
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

  it('assigns distinct status colors, gold for Exceptional', () => {
    expect(statusColor('Exceptional')).toBe('var(--vm-dust)');
    expect(statusColor('Exceptional')).not.toBe(statusColor('Strong'));
  });

  it('fetches the admin roster', async () => {
    mockFetch((url) => {
      expect(url).toContain('/coach/admin/coaches');
      return jsonResponse({ coaches: [{ id: 'jeff-ward', name: 'Jeff Ward', sessionCount: 3 }] });
    });
    const coaches = await fetchAdminCoaches();
    expect(coaches).toHaveLength(1);
    expect(coaches[0].id).toBe('jeff-ward');
  });

  it('fetches a specific leader (admin drill-in) with profile + reports', async () => {
    mockFetch((url) => {
      expect(url).toContain('/coach/admin/coaches/jeff-ward/reports');
      return jsonResponse({ profile: { id: 'jeff-ward', name: 'Jeff Ward' }, reports: [{ id: 'r1' }] });
    });
    const data = await fetchCoachReportsFor('jeff-ward');
    expect(data.profile.id).toBe('jeff-ward');
    expect(data.reports).toHaveLength(1);
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
            leader: { id: 'jeff-ward', name: 'Jeff Ward', email: 'jeff@example.com' },
          },
        ],
      });
    });
    const classes = await fetchAllCoachClasses();
    expect(classes).toHaveLength(1);
    expect(classes[0].leader.name).toBe('Jeff Ward');
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

  it('PUTs a session recording link', async () => {
    mockFetch((url, init) => {
      expect(url).toContain('/coach/admin/coaches/jeff-ward/reports/r1/recording');
      expect(init?.method).toBe('PUT');
      const body = JSON.parse(String(init?.body));
      return jsonResponse({ recordingUrl: body.recordingUrl });
    });
    const saved = await saveRecordingLink('jeff-ward', 'r1', 'https://zoom.us/rec/abc');
    expect(saved).toBe('https://zoom.us/rec/abc');
  });

  it('POSTs a coaching note and returns it', async () => {
    mockFetch((url, init) => {
      expect(url).toContain('/coach/admin/coaches/jeff-ward/reports/r1/notes');
      expect(init?.method).toBe('POST');
      return jsonResponse({
        note: { id: 'n1', body: 'Great job.', createdAt: '2026-07-21T00:00:00.000Z', emailed: true },
      });
    });
    const note = await addCoachNote('jeff-ward', 'r1', 'Great job.');
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
});

describe('pdfDownloadUrl', () => {
  it('returns null for empty / missing values', () => {
    expect(pdfDownloadUrl(undefined)).toBeNull();
    expect(pdfDownloadUrl('')).toBeNull();
    expect(pdfDownloadUrl('   ')).toBeNull();
  });

  it('returns null for a Drive folder link (the exporter fallback)', () => {
    expect(
      pdfDownloadUrl('https://drive.google.com/drive/folders/1vvVpdPk2ARawV3wOM9LeXJ0BtpVJ2qjV'),
    ).toBeNull();
  });

  it('rewrites a Drive file /view link to a direct download', () => {
    expect(pdfDownloadUrl('https://drive.google.com/file/d/ABC123def/view?usp=drivesdk')).toBe(
      'https://drive.google.com/uc?export=download&id=ABC123def',
    );
  });

  it('rewrites an ?id= Drive link to a direct download', () => {
    expect(pdfDownloadUrl('https://drive.google.com/open?id=XYZ-789')).toBe(
      'https://drive.google.com/uc?export=download&id=XYZ-789',
    );
  });

  it('exports Google Docs links as PDF', () => {
    expect(pdfDownloadUrl('https://docs.google.com/document/d/DOC_1/edit?usp=drivesdk')).toBe(
      'https://docs.google.com/document/d/DOC_1/export?format=pdf',
    );
  });

  it('passes a plain absolute PDF URL through unchanged', () => {
    expect(pdfDownloadUrl('https://cdn.versemate.org/reports/x.pdf')).toBe(
      'https://cdn.versemate.org/reports/x.pdf',
    );
  });
});
