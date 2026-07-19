/**
 * coachService maps the /coach/* backend responses onto the portal types and
 * turns 401 / 403 into the CoachAuthError reasons the UI gates on.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CoachAuthError,
  fetchAdminCoaches,
  fetchCoachReports,
  fetchCoachReportsFor,
  fetchCoachMe,
  saveCoachZoomLink,
  statusColor,
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
});
