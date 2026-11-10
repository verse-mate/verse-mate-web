import { stripQuery } from '@/lib/analyticsPrivacy';
import { client as generatedClient } from './generated/client.gen';
import { type Client, createClient, createConfig } from './generated/client';

const DEFAULT_BASE_URL = 'https://api.versemate.org';

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || DEFAULT_BASE_URL;

const ACCESS_COOKIE = 'accessToken';
const LEGACY_REFRESH_COOKIE = 'refreshToken';
const SESSION_LIFETIME_SECONDS = 90 * 24 * 60 * 60;
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
    if (legacyAccess && !readCookie(ACCESS_COOKIE)) {
      writeCookie(ACCESS_COOKIE, legacyAccess, SESSION_LIFETIME_SECONDS);
    }
    if (legacyAccess) localStorage.removeItem(LEGACY_ACCESS_KEY);
    localStorage.removeItem(LEGACY_REFRESH_KEY);
    deleteCookie(LEGACY_REFRESH_COOKIE);
  } catch {
    return;
  }
}
migrateLegacyTokens();

export function getAccessToken(): string | null {
  return readCookie(ACCESS_COOKIE);
}

export function setAccessToken(token: string | null) {
  if (token) writeCookie(ACCESS_COOKIE, token, SESSION_LIFETIME_SECONDS);
  else deleteCookie(ACCESS_COOKIE);
}

export function clearTokens() {
  deleteCookie(ACCESS_COOKIE);
  deleteCookie(LEGACY_REFRESH_COOKIE);
}

export class ApiError extends Error {
  constructor(public status: number, public body: unknown, message: string) {
    super(message);
  }
}

const AUTH_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/reset-password-verify',
  '/auth/change-password',
  '/auth/verify-email',
  '/auth/send-email-verification',
  '/auth/sso',
  '/auth/account',
];

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return stripQuery(url);
  }
}

function fetchNamingFailures(request: Request): Promise<Response> {
  return fetch(request).catch((error: unknown) => {
    if ((error as Error)?.name === 'AbortError') throw error;
    throw new ApiError(0, null, `Network error: ${request.method} ${pathOf(request.url)} failed: ${String(error)}`);
  });
}

function attachBearer(request: Request): Request {
  const token = getAccessToken();
  if (token) request.headers.set('Authorization', `Bearer ${token}`);
  return request;
}

function signOutOnExpiredSession(response: Response, request: Request): Response {
  if (
    response.status === 401 &&
    request.headers.has('Authorization') &&
    !isAuthRoute(pathOf(request.url)) &&
    typeof window !== 'undefined' &&
    window.location.pathname !== '/logout'
  ) {
    window.location.href = '/logout';
  }
  return response;
}

function configure(target: Client, options: { bearer: boolean; signOutOn401: boolean }): Client {
  target.setConfig({ baseUrl: API_BASE_URL, fetch: fetchNamingFailures as typeof fetch });
  if (options.bearer) target.interceptors.request.use(attachBearer);
  if (options.signOutOn401) target.interceptors.response.use(signOutOnExpiredSession);
  return target;
}

export const apiClient = configure(generatedClient, { bearer: true, signOutOn401: true });
export function newQuietClient(): Client {
  return configure(createClient(createConfig()), { bearer: true, signOutOn401: false });
}

export const quietClient = newQuietClient();
export const publicClient = configure(createClient(createConfig()), { bearer: false, signOutOn401: false });

type Result<T> = { data?: T; error?: unknown; request: Request; response: Response };

export async function unwrap<T>(pending: Promise<Result<T>>): Promise<T> {
  const { data, error, request, response } = await pending;
  if (!response.ok) {
    throw new ApiError(
      response.status,
      error ?? null,
      `API ${request.method} ${pathOf(request.url)} failed: ${response.status}`,
    );
  }
  return data as T;
}
