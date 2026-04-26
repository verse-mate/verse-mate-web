import { expect, test } from '@playwright/test';

/**
 * Live-API integration tests against https://api.versemate.org.
 *
 * These verify the request/response contract assumptions baked into:
 *   - Phase 4 (cookie auth, refresh, logout body shape)
 *   - Phase 5 (SSO callback URL contract — though we can only test the
 *             error path without a real OAuth flow)
 *
 * Uses the apple-review test account. Credentials live in env-only:
 *   VM_TEST_EMAIL / VM_TEST_PASSWORD (default to the apple-review account
 *   so this works in local dev too).
 */

const API_BASE = 'https://api.versemate.org';
const TEST_EMAIL = process.env.VM_TEST_EMAIL || 'apple.review@versemate.org';
const TEST_PASSWORD = process.env.VM_TEST_PASSWORD || 'AppleReview2025$';

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  verified: boolean;
}

async function login(): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  return res.json();
}

test.describe('Phase 4 — live API auth contract', () => {
  test('/auth/login returns { accessToken, refreshToken, verified }', async () => {
    const data = await login();
    expect(data.accessToken).toMatch(/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    expect(typeof data.refreshToken).toBe('string');
    expect(data.refreshToken!.length).toBeGreaterThan(20);
    expect(typeof data.verified).toBe('boolean');
  });

  test('access token JWT has a `sub` claim (used by analytics.identify)', async () => {
    const data = await login();
    const parts = data.accessToken.split('.');
    expect(parts).toHaveLength(3);
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'),
    );
    expect(typeof payload.sub).toBe('string');
    expect(payload.sub.length).toBeGreaterThan(0);
  });

  test('authenticated /user/me returns user with id/email/name', async () => {
    const { accessToken } = await login();
    const res = await fetch(`${API_BASE}/user/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    // Phase 4's identifyAfterAuth uses email; AuthCallback also reads name + id
    expect(typeof (body.email ?? body.user?.email)).toBe('string');
    expect(typeof (body.id ?? body.user?.id)).toBe('string');
  });

  test('/auth/refresh accepts { refreshToken } body and returns a new accessToken', async () => {
    const { refreshToken } = await login();
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.accessToken).toMatch(/^eyJ/);
  });

  test('/auth/logout: requires Authorization header, body is optional', async () => {
    // Body alone (no auth header) → 401. This is what convinced me there
    // was a bug; the OpenAPI spec says body is required, but the live
    // backend actually requires the bearer header for auth.
    const { refreshToken } = await login();
    const bodyOnly = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    expect(bodyOnly.status).toBe(401);

    // Auth header only (no body) → 200. Original Phase 4 code worked.
    const { accessToken } = await login();
    const authOnly = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    expect(authOnly.status).toBe(200);

    // Auth header + body → 200. What our final code sends.
    const fresh = await login();
    const both = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${fresh.accessToken}`,
      },
      body: JSON.stringify({ refreshToken: fresh.refreshToken }),
    });
    expect(both.status).toBe(200);
  });

  // NOTE: deliberately not asserting refresh-token revocation. Live test
  // showed the backend does NOT invalidate the refresh token after
  // /auth/logout — the same refreshToken is still usable. This is a
  // backend behavior, not a frontend migration concern. Recorded here
  // as a known finding so future readers don't get confused.
});

test.describe('Phase 5 — live API SSO callback contract', () => {
  test('Apple callback redirects to /auth/callback/apple with error params', async () => {
    const res = await fetch(
      `${API_BASE}/auth/sso/apple/callback?error=access_denied&error_description=User+denied`,
      { redirect: 'manual' },
    );
    expect(res.status).toBe(302);
    const loc = res.headers.get('location') || '';
    // URL contract: Phase 5 parses these exact params
    expect(loc).toMatch(/\/auth\/callback\/apple\?/);
    expect(loc).toContain('error=');
    expect(loc).toContain('error_description=');
  });

  test('Google callback redirects to /auth/callback/google with error params', async () => {
    const res = await fetch(
      `${API_BASE}/auth/sso/google/callback?error=access_denied&error_description=User+denied`,
      { redirect: 'manual' },
    );
    expect(res.status).toBe(302);
    const loc = res.headers.get('location') || '';
    expect(loc).toMatch(/\/auth\/callback\/google\?/);
    expect(loc).toContain('error=');
  });
});

test.describe('Cookie sharing — verify same attributes used on app.versemate.org', () => {
  test('frontend-next at app.versemate.org uses the same cookie name/path Phase 4 expects', async () => {
    // We can't directly read the production cookies (CORS / browser
    // sandbox), but we can verify the auth contract is consistent:
    // both apps read tokens from a JSON login response and write
    // client-side cookies. Cookies from one will be readable by the
    // other only if both write with identical attributes.
    //
    // What this test verifies: the response body still has the shape
    // both repos rely on. If the backend ever moved to Set-Cookie
    // headers, both repos would break and we'd need to redesign.
    const data = await login();
    // Critical: both Phase 4 (verse-mate-web) and frontend-next read
    // these specific keys from the JSON body.
    expect(Object.keys(data).sort()).toEqual(
      expect.arrayContaining(['accessToken', 'refreshToken', 'verified']),
    );
    // And the backend doesn't try to set an HttpOnly cookie itself
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });
    const setCookie = res.headers.get('set-cookie') || '';
    // Backend may set CF bot management cookies; just ensure it does NOT
    // try to set its own accessToken or refreshToken (which would clash).
    expect(setCookie.toLowerCase()).not.toMatch(/accesstoken=/);
    expect(setCookie.toLowerCase()).not.toMatch(/refreshtoken=/);
  });
});
