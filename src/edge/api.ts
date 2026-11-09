import { SITE_ORIGIN } from './config';

export const USER_AGENT = 'VerseMate-Edge';

export class ApiUnavailable extends Error {}

export interface EdgeCache {
  match(key: string): Promise<Response | undefined>;
  put(key: string, response: Response): Promise<void>;
}

export interface Runtime {
  cache: EdgeCache | null;
  waitUntil(promise: Promise<unknown>): void;
}

type Query = Record<string, string | number | undefined>;

export type ApiGet = <T>(path: string, query?: Query, options?: { ttl?: number }) => Promise<T | null>;

export function apiCacheKey(url: string) {
  return `${SITE_ORIGIN}/__edge-cache/api/${encodeURIComponent(url)}`;
}

export const PAGE_TIMEOUT_MS = 2000;
export const BUILD_TIMEOUT_MS = 10_000;

export function createApi(baseUrl: string, runtime: Runtime, timeoutMs = PAGE_TIMEOUT_MS): ApiGet {
  return async function get<T>(path: string, query: Query = {}, options: { ttl?: number } = {}) {
    const url = new URL(baseUrl + path);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    }
    const target = url.toString();
    const cacheKey = apiCacheKey(target);
    if (options.ttl && runtime.cache) {
      const hit = await runtime.cache.match(cacheKey);
      if (hit) return (await hit.json()) as T;
    }

    let response: Response;
    let text: string;
    try {
      response = await fetch(target, {
        headers: { 'user-agent': USER_AGENT, accept: 'application/json' },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new ApiUnavailable(`${path}: HTTP ${response.status}`);
      text = await response.text();
    } catch (error) {
      if (error instanceof ApiUnavailable) throw error;
      throw new ApiUnavailable(`${path}: ${String(error)}`);
    }
    let data: T;
    try {
      data = JSON.parse(text) as T;
    } catch {
      throw new ApiUnavailable(`${path}: not JSON`);
    }
    if (options.ttl && runtime.cache) {
      const stored = new Response(text, {
        headers: { 'content-type': 'application/json', 'cache-control': `public, max-age=${options.ttl}` },
      });
      runtime.waitUntil(runtime.cache.put(cacheKey, stored));
    }
    return data;
  };
}
