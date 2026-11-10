import { SITE_ORIGIN } from './config';
import { DAY, reportFailure, type EdgeRequest, type Rendered } from './common';

export const FRESH = DAY;
export const STALE = 7 * DAY;
export const SHORT = 10 * 60;
export const LEASE = 60;

const RENDERED_AT = 'x-edge-rendered-at';
const FRESH_FOR = 'x-edge-fresh';
const STALE_FOR = 'x-edge-stale';
const LEASED_UNTIL = 'x-edge-leased-until';
const CLIENT_CACHE_CONTROL = 'x-edge-cache-control';

const inflight = new Map<string, Promise<Rendered | null>>();

export function edgeCacheKey(edge: EdgeRequest, variant: string, lang: string) {
  const path = edge.url.pathname.replace(/(.)\/$/, '$1');
  return `${SITE_ORIGIN}/__edge-cache/${encodeURIComponent(edge.config.buildId)}${path}?lang=${encodeURIComponent(lang)}&v=${variant}`;
}

function toStored(rendered: Rendered) {
  const headers = new Headers(rendered.headers);
  headers.set(CLIENT_CACHE_CONTROL, headers.get('cache-control') ?? '');
  headers.set('cache-control', `public, max-age=${rendered.fresh + rendered.stale}`);
  headers.set(RENDERED_AT, String(Date.now()));
  headers.set(FRESH_FOR, String(rendered.fresh));
  headers.set(STALE_FOR, String(rendered.stale));
  return new Response(rendered.body, { status: rendered.status, headers });
}

async function fromStored(stored: Response): Promise<Rendered> {
  const headers: Record<string, string> = {};
  stored.headers.forEach((value, name) => {
    if (!name.startsWith('x-edge-') && name !== 'cache-control') headers[name] = value;
  });
  const clientCacheControl = stored.headers.get(CLIENT_CACHE_CONTROL);
  if (clientCacheControl) headers['cache-control'] = clientCacheControl;
  return {
    body: await stored.arrayBuffer(),
    status: stored.status,
    headers,
    fresh: Number(stored.headers.get(FRESH_FOR)),
    stale: Number(stored.headers.get(STALE_FOR)),
  };
}

function ageOf(stored: Response) {
  return (Date.now() - Number(stored.headers.get(RENDERED_AT))) / 1000;
}

function leased(stored: Response) {
  return Number(stored.headers.get(LEASED_UNTIL) ?? 0) > Date.now();
}

function withLease(stored: Response, remaining: number) {
  const headers = new Headers(stored.headers);
  headers.set(LEASED_UNTIL, String(Date.now() + LEASE * 1000));
  headers.set('cache-control', `public, max-age=${Math.max(1, Math.ceil(remaining))}`);
  return new Response(stored.body, { status: stored.status, headers });
}

function single(key: string, run: () => Promise<Rendered | null>) {
  const running = inflight.get(key);
  if (running) return running;
  const promise = run().finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}

export async function withEdgeCache(edge: EdgeRequest, key: string, render: () => Promise<Rendered | null>) {
  const { cache, waitUntil } = edge.runtime;
  const store = (rendered: Rendered | null) => {
    if (cache && rendered && rendered.fresh > 0) waitUntil(cache.put(key, toStored(rendered)));
    return rendered;
  };

  const stored = cache ? await cache.match(key) : undefined;
  if (stored && cache) {
    const age = ageOf(stored);
    const fresh = Number(stored.headers.get(FRESH_FOR));
    const stale = Number(stored.headers.get(STALE_FOR));
    if (age < fresh) return fromStored(stored);
    if (age < fresh + stale) {
      if (!leased(stored) && !inflight.has(key)) {
        const lease = cache.put(key, withLease(stored.clone(), fresh + stale - age));
        const rerender = single(key, () => lease.then(render).then(store));
        waitUntil(rerender.catch(reportFailure));
      }
      return fromStored(stored);
    }
  }
  const rendering = single(key, () => render().then(store));
  waitUntil(rendering.catch(() => undefined));
  return rendering;
}
