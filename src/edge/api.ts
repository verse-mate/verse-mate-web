import type * as Api from '../api/generated/types.gen';
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

type Read<Data extends { url: string; path?: unknown; query?: unknown }, Response> = { data: Data; response: Response };

type Reads =
  | Read<Api.GetBibleTestamentsData, Api.GetBibleTestamentsResponse>
  | Read<Api.GetBibleBookByBookIdByChapterNumberData, Api.GetBibleBookByBookIdByChapterNumberResponse>
  | Read<Api.GetBibleBookExplanationByBookIdByChapterNumberData, Api.GetBibleBookExplanationByBookIdByChapterNumberResponse>
  | Read<Api.GetBibleExplanationsCoverageData, Api.GetBibleExplanationsCoverageResponse>
  | Read<Api.GetJesusEventsData, Api.GetJesusEventsResponse>
  | Read<Api.GetJesusEventsBySlugData, Api.GetJesusEventsBySlugResponse>
  | Read<Api.GetTopicsCategoriesData, Api.GetTopicsCategoriesResponse>
  | Read<Api.GetTopicsSearchData, Api.GetTopicsSearchResponse>
  | Read<Api.GetTopicsByIdExplanationData, Api.GetTopicsByIdExplanationResponse>
  | Read<Api.GetTopicsByIdReferencesData, Api.GetTopicsByIdReferencesResponse>;

export type ApiPath = Reads['data']['url'];
type ReadOf<P extends ApiPath> = Extract<Reads, { data: { url: P } }>;
export type ApiParams<P extends ApiPath> = Pick<ReadOf<P>['data'], 'path' | 'query'>;
export type ApiResponse<P extends ApiPath> = ReadOf<P>['response'];

export type ApiGet = <P extends ApiPath>(
  path: P,
  params: ApiParams<P>,
  options?: { ttl?: number },
) => Promise<ApiResponse<P> | null>;

type Values = Record<string, string | number | boolean | undefined> | undefined;

function fill(template: string, path: Values) {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => encodeURIComponent(String(path?.[name] ?? '')));
}

export function apiCacheKey(url: string) {
  return `${SITE_ORIGIN}/__edge-cache/api/${encodeURIComponent(url)}`;
}

export const PAGE_TIMEOUT_MS = 2000;
export const BUILD_TIMEOUT_MS = 10_000;
export const BUILD_CACHE_WRITES = 20;

export interface ApiOptions {
  timeoutMs?: number;
  cacheWrites?: number;
}

export function createApi(baseUrl: string, runtime: Runtime, options: ApiOptions = {}): ApiGet {
  const timeoutMs = options.timeoutMs ?? PAGE_TIMEOUT_MS;
  let writesLeft = options.cacheWrites ?? Infinity;
  const memo = new Map<string, Promise<unknown>>();

  async function read<T>(path: string, target: string, ttl: number | undefined): Promise<T | null> {
    const cacheKey = apiCacheKey(target);
    if (ttl && runtime.cache) {
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
    if (ttl && runtime.cache && writesLeft > 0) {
      writesLeft--;
      const stored = new Response(text, {
        headers: { 'content-type': 'application/json', 'cache-control': `public, max-age=${ttl}` },
      });
      runtime.waitUntil(runtime.cache.put(cacheKey, stored));
    }
    return data;
  }

  return function get<P extends ApiPath>(template: P, params: ApiParams<P>, options: { ttl?: number } = {}) {
    type T = ApiResponse<P>;
    const { path: pathValues, query } = params as { path?: Values; query?: Values };
    const path = fill(template, pathValues);
    const url = new URL(baseUrl + path);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    }
    const target = url.toString();
    if (!options.ttl) return read<T>(path, target, undefined);
    const known = memo.get(target);
    if (known) return known as Promise<T | null>;
    const pending = read<T>(path, target, options.ttl);
    memo.set(target, pending);
    pending.catch(() => memo.delete(target));
    return pending;
  };
}
