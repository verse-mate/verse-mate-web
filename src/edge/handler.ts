import { ApiUnavailable, createApi, type Runtime } from './api';
import { languageFromQuery, readConfig, type EdgeConfig, type EdgeEnv, type Language } from './config';
import { renderArticle } from './article';
import { edgeCacheKey, FRESH, SHORT, STALE, withEdgeCache } from './cache';
import { buildHead, rewritePage } from './head';
import { indexingFor, loadCoverage, type Indexing } from './indexing';
import { loadPage, matchPageRoute, type PageData, type PageRoute } from './pageData';

export interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void;
}

export interface EdgeRequest {
  request: Request;
  env: EdgeEnv;
  url: URL;
  config: EdgeConfig;
  runtime: Runtime;
}

function runtimeFor(ctx?: ExecutionContextLike): Runtime {
  const storage = (globalThis as { caches?: { default?: Runtime['cache'] } }).caches;
  return {
    cache: storage?.default ?? null,
    waitUntil: (promise) => (ctx ? ctx.waitUntil(promise) : void promise.catch(() => undefined)),
  };
}

export async function fetchShell(env: EdgeEnv, url: URL) {
  return env.ASSETS.fetch(new Request(`${url.origin}/`));
}

export async function shellResponse(env: EdgeEnv, url: URL, status: number, extra: Record<string, string> = {}) {
  const shell = await fetchShell(env, url);
  const headers = new Headers(shell.headers);
  headers.delete('etag');
  for (const [name, value] of Object.entries(extra)) headers.set(name, value);
  return new Response(shell.body, { status, headers });
}

export function reportFailure(error: unknown) {
  if (!(error instanceof ApiUnavailable)) console.error('edge render failed', error);
}

export interface Rendered {
  body: string;
  status: number;
  headers: Record<string, string>;
  fresh: number;
  stale: number;
}

export function lifetime(complete: boolean) {
  return complete ? { fresh: FRESH, stale: STALE } : { fresh: SHORT, stale: 0 };
}

export async function resolvePage(edge: EdgeRequest, route: PageRoute, lang: Language) {
  const api = createApi(edge.config.apiUrl, edge.runtime);
  const published = edge.config.indexedLanguages;
  const [data, coverage] = await Promise.all([
    loadPage(api, route, lang, published),
    route.kind === 'chapter' ? loadCoverage(api) : null,
  ]);
  if (!data) return null;
  return { data, indexing: indexingFor(data, lang, published, coverage) };
}

async function renderHtml(edge: EdgeRequest, data: PageData, lang: Language, indexing: Indexing): Promise<Rendered> {
  const shell = await fetchShell(edge.env, edge.url);
  const head = buildHead(data, lang, indexing);
  const body = await rewritePage(shell, head, renderArticle(data, lang)).text();
  const headers: Record<string, string> = {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': shell.headers.get('cache-control') || 'public, max-age=0, must-revalidate',
  };
  if (head.noindex) headers['X-Robots-Tag'] = 'noindex';
  return { body, status: 200, headers, ...lifetime(indexing.complete) };
}

async function renderPage(edge: EdgeRequest, match: NonNullable<ReturnType<typeof matchPageRoute>>) {
  const { env, url } = edge;
  const lang = languageFromQuery(url.searchParams.get('lang'));
  let rendered: Rendered | null;
  try {
    rendered = await withEdgeCache(edge, edgeCacheKey(edge, 'html', lang), async () => {
      const page = await resolvePage(edge, match.route, lang);
      return page ? renderHtml(edge, page.data, lang, page.indexing) : null;
    });
  } catch (error) {
    reportFailure(error);
    return shellResponse(env, url, 200);
  }
  if (!rendered) return shellResponse(env, url, 404, { 'X-Robots-Tag': 'noindex' });
  return new Response(rendered.body, { status: rendered.status, headers: rendered.headers });
}

async function dispatch(edge: EdgeRequest) {
  const match = matchPageRoute(edge.url.pathname);
  if (match && !match.markdown) return renderPage(edge, match);
  return null;
}

export async function handleEdge(request: Request, env: EdgeEnv, url: URL, ctx?: ExecutionContextLike) {
  const config = readConfig(env);
  if (!config.enabled || (request.method !== 'GET' && request.method !== 'HEAD')) return null;
  const response = await dispatch({ request, env, url, config, runtime: runtimeFor(ctx) });
  if (!response || request.method === 'GET') return response;
  return new Response(null, { status: response.status, headers: response.headers });
}
