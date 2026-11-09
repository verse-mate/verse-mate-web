import { SITE_ORIGIN } from './config';
import type { EdgeRequest, Rendered } from './handler';
import { DAY } from './pageData';

export const FRESH = DAY;
export const STALE = 7 * DAY;
export const SHORT = 10 * 60;

const RENDERED_AT = 'x-edge-rendered-at';
const FRESH_FOR = 'x-edge-fresh';
const STALE_FOR = 'x-edge-stale';
const CLIENT_CACHE_CONTROL = 'x-edge-cache-control';

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

export async function withEdgeCache(edge: EdgeRequest, key: string, render: () => Promise<Rendered | null>) {
  const { cache, waitUntil } = edge.runtime;
  const store = (rendered: Rendered | null) => {
    if (cache && rendered && rendered.fresh > 0) waitUntil(cache.put(key, toStored(rendered)));
    return rendered;
  };

  const stored = cache ? await cache.match(key) : undefined;
  if (stored) {
    const age = ageOf(stored);
    const fresh = Number(stored.headers.get(FRESH_FOR));
    const stale = Number(stored.headers.get(STALE_FOR));
    if (age < fresh) return fromStored(stored);
    if (age < fresh + stale) {
      waitUntil(render().then(store, () => null));
      return fromStored(stored);
    }
  }
  return store(await render());
}
