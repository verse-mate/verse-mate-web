/**
 * VerseMate API client.
 *
 * Base URL is read from VITE_API_URL env var; defaults to production.
 * Attaches Bearer access token from a cookie. On 401, tries to refresh
 * once using the refresh token, then retries the original request. On
 * unrecoverable auth failure (refresh also returns non-OK), redirects
 * the user to /logout.
 *
 * Cookie names (`accessToken`, `refreshToken`) and attributes match the
 * monorepo's frontend-next exactly. This is deliberate: when the
 * verse-mate-web Worker takes over app.versemate.org in Phase 7,
 * existing logged-in users keep their session because the cookies
 * already in their browser are still valid.
 */

const DEFAULT_BASE_URL = 'https://api.versemate.org';

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || DEFAULT_BASE_URL;

// ─── Token storage (cookies) ──────────────────────────────────────────────
//
// Names + attributes ported from verse-mate/packages/backend-api/src/eden.ts.
// Cookies aren't HttpOnly because they're set client-side; HttpOnly would
// require all token-issuing endpoints to use Set-Cookie response headers,
// which the current backend does not. The XSS surface is the same as
// localStorage (which we used previously).
const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';
const ACCESS_MAX_AGE = 15 * 60; // 15 minutes — matches backend access TTL
const REFRESH_MAX_AGE = 90 * 24 * 60 * 60; // 90 days — matches backend refresh TTL

// One-time migration from the previous Lovable localStorage keys so users
// who authenticated via the older Lovable build don't get force-logged-out
// on first visit after the cutover. Safe to remove after a few weeks.
const LEGACY_ACCESS_KEY = 'versemate-access-token';
const LEGACY_REFRESH_KEY = 'versemate-refresh-token';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]+)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') return;
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureAttr = isSecure ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secureAttr}`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function migrateLegacyTokens() {
  if (typeof window === 'undefined') return;
  try {
    const legacyAccess = localStorage.getItem(LEGACY_ACCESS_KEY);
    const legacyRefresh = localStorage.getItem(LEGACY_REFRESH_KEY);
    if (legacyAccess && !readCookie(ACCESS_COOKIE)) {
      writeCookie(ACCESS_COOKIE, legacyAccess, ACCESS_MAX_AGE);
    }
    if (legacyRefresh && !readCookie(REFRESH_COOKIE)) {
      writeCookie(REFRESH_COOKIE, legacyRefresh, REFRESH_MAX_AGE);
    }
    if (legacyAccess) localStorage.removeItem(LEGACY_ACCESS_KEY);
    if (legacyRefresh) localStorage.removeItem(LEGACY_REFRESH_KEY);
  } catch {
    /* ignore — localStorage may be disabled */
  }
}
migrateLegacyTokens();

export function getAccessToken(): string | null {
  return readCookie(ACCESS_COOKIE);
}

export function setAccessToken(token: string | null) {
  if (token) writeCookie(ACCESS_COOKIE, token, ACCESS_MAX_AGE);
  else deleteCookie(ACCESS_COOKIE);
}

export function getRefreshToken(): string | null {
  return readCookie(REFRESH_COOKIE);
}

export function setRefreshToken(token: string | null) {
  if (token) writeCookie(REFRESH_COOKIE, token, REFRESH_MAX_AGE);
  else deleteCookie(REFRESH_COOKIE);
}

export function clearTokens() {
  deleteCookie(ACCESS_COOKIE);
  deleteCookie(REFRESH_COOKIE);
}

/**
 * Auth-aware fetch wrapper. Attaches the Bearer access token, and on 401
 * tries to refresh ONCE then retries the original request. Returns the
 * raw `Response` so callers that need status / body shape control (audio
 * APIs, file uploads, etc.) keep that flexibility.
 *
 * Differs from `request()`: never parses the body, never auto-redirects
 * to /logout on refresh failure. Callers decide how to surface auth
 * errors (e.g., the audio chip shows a "Sign in" CTA in-place rather
 * than navigating away).
 */
export async function fetchWithAuth(
  url: string,
  init: RequestInit = {},
  opts: { _retrying?: boolean } = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers });

  if (
    res.status === 401 &&
    !opts._retrying &&
    !isAuthEndpoint(url)
  ) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return fetchWithAuth(url, init, { _retrying: true });
    }
  }

  return res;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean; // default true
  /** Internal — used to prevent refresh recursion */
  _retrying?: boolean;
}

export class ApiError extends Error {
  constructor(public status: number, public body: unknown, message: string) {
    super(message);
  }
}

// Coalesce parallel refresh attempts so we don't fire N concurrent /auth/refresh
// calls when N requests all 401 at once.
let _refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (_refreshInFlight) return _refreshInFlight;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  _refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        clearTokens();
        return null;
      }
      const data = await res.json();
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        if (data.refreshToken) setRefreshToken(data.refreshToken);
        return data.accessToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      _refreshInFlight = null;
    }
  })();

  return _refreshInFlight;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function isAuthEndpoint(path: string): boolean {
  return (
    path.includes('/auth/login') ||
    path.includes('/auth/signup') ||
    path.includes('/auth/refresh') ||
    path.includes('/auth/forgot-password')
  );
}

export async function request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, auth = true, _retrying } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(0, null, `Network error: ${String(err)}`);
  }

  // Try token refresh on 401 (once). Don't refresh on the auth endpoints
  // themselves — that would be a refresh→login→refresh→login loop.
  if (res.status === 401 && auth && !_retrying && !isAuthEndpoint(path)) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, { ...opts, _retrying: true });
    }
    // Refresh failed: send the user to /logout (which clears state and
    // redirects to /login). Matches frontend-next's onResponse behavior.
    if (typeof window !== 'undefined' && window.location.pathname !== '/logout') {
      window.location.href = '/logout';
    }
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new ApiError(res.status, data, `API ${method} ${path} failed: ${res.status}`);
  }

  return data as T;
}

// Convenience helpers
export const api = {
  get: <T = unknown>(
    path: string,
    query?: RequestOptions['query'],
    opts: Omit<RequestOptions, 'method' | 'query'> = {},
  ) => request<T>(path, { ...opts, method: 'GET', query }),
  post: <T = unknown>(
    path: string,
    body?: unknown,
    opts: Omit<RequestOptions, 'method' | 'body'> = {},
  ) => request<T>(path, { ...opts, method: 'POST', body }),
  put: <T = unknown>(
    path: string,
    body?: unknown,
    opts: Omit<RequestOptions, 'method' | 'body'> = {},
  ) => request<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T = unknown>(
    path: string,
    body?: unknown,
    opts: Omit<RequestOptions, 'method' | 'body'> = {},
  ) => request<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T = unknown>(path: string, opts: Omit<RequestOptions, 'method'> = {}) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
};
