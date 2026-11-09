import { BUILD_CACHE_WRITES, BUILD_TIMEOUT_MS, createApi, type Runtime } from './api';
import { languageFromQuery, PRODUCTION_HOST, readConfig, type EdgeEnv, type Language } from './config';
import { renderArticle } from './article';
import { edgeCacheKey, FRESH, SHORT, STALE, withEdgeCache } from './cache';
import { buildHead, pageUrl, rewritePage } from './head';
import { indexingFor, loadCoverage, type Indexing } from './indexing';
import { DAY, reportFailure, type EdgeRequest, type ExecutionContextLike, type Rendered } from './common';
import { checkRoute, loadPage, matchPageRoute, type PageData, type PageRoute } from './pageData';
import { matchCard, renderCard } from './og';
import { llmsTxt, pageMarkdown } from './pageMarkdown';
import { buildSitemap, matchSitemap } from './sitemaps';

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

export function textResponse(body: string, status: number, headers: Record<string, string> = {}) {
  return new Response(body, { status, headers: { 'content-type': 'text/plain; charset=utf-8', ...headers } });
}

export function unavailable() {
  return textResponse('Temporarily unavailable', 503, { 'retry-after': '3600', 'cache-control': 'no-store' });
}

async function serveGenerated(
  edge: EdgeRequest,
  variant: string,
  contentType: string,
  build: (api: ReturnType<typeof createApi>) => Promise<string | null>,
) {
  let rendered: Rendered | null;
  try {
    rendered = await withEdgeCache(edge, edgeCacheKey(edge, variant, '-'), async () => {
      const body = await build(createApi(edge.config.apiUrl, edge.runtime, { timeoutMs: BUILD_TIMEOUT_MS, cacheWrites: BUILD_CACHE_WRITES }));
      if (body === null) return null;
      return { body, status: 200, headers: { 'content-type': contentType, 'cache-control': `public, max-age=${DAY}` }, fresh: FRESH, stale: STALE };
    });
  } catch (error) {
    reportFailure(error);
    return unavailable();
  }
  if (!rendered) return textResponse('Not found', 404);
  return new Response(rendered.body, { status: rendered.status, headers: rendered.headers });
}

async function renderMarkdownPage(edge: EdgeRequest, route: PageRoute) {
  const lang = languageFromQuery(edge.url.searchParams.get('lang'));
  let rendered: Rendered | null;
  try {
    rendered = await withEdgeCache(edge, edgeCacheKey(edge, 'md', lang), async () => {
      const page = await resolvePage(edge, route, lang);
      if (!page) return null;
      const headers: Record<string, string> = {
        'content-type': 'text/markdown; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate',
        link: `<${pageUrl(page.data.path, lang)}>; rel="canonical"`,
      };
      if (!page.indexing.indexable) headers['X-Robots-Tag'] = 'noindex';
      return { body: pageMarkdown(page.data, lang), status: 200, headers, ...lifetime(page.indexing.complete) };
    });
  } catch (error) {
    reportFailure(error);
    return unavailable();
  }
  if (!rendered) return textResponse('Not found', 404, { 'X-Robots-Tag': 'noindex' });
  return new Response(rendered.body, { status: rendered.status, headers: rendered.headers });
}

async function pngAsset(env: EdgeEnv, url: URL, path: string) {
  const response = await env.ASSETS.fetch(new Request(`${url.origin}${path}`));
  const isPng = (response.headers.get('content-type') || '').startsWith('image/png');
  return response.ok && isPng ? response : null;
}

async function renderShareCard(edge: EdgeRequest, route: PageRoute) {
  const lang = languageFromQuery(edge.url.searchParams.get('lang'));
  let rendered: Rendered | null;
  try {
    rendered = await withEdgeCache(edge, edgeCacheKey(edge, 'og', lang), async () => {
      const page = await resolvePage(edge, route, lang);
      if (!page || page.data.kind !== 'chapter') return null;
      const logo = await pngAsset(edge.env, edge.url, '/versemate-logo-white.png');
      const body = await renderCard(page.data, lang, page.indexing, logo ? await logo.arrayBuffer() : null);
      const headers = { 'content-type': 'image/png', 'cache-control': `public, max-age=${DAY}` };
      return { body, status: 200, headers, ...lifetime(page.indexing.complete) };
    });
  } catch (error) {
    reportFailure(error);
    const fallback = await pngAsset(edge.env, edge.url, '/og/default.png');
    if (!fallback) return unavailable();
    return new Response(fallback.body, { status: 200, headers: { 'content-type': 'image/png', 'cache-control': 'no-store' } });
  }
  if (!rendered) return textResponse('Not found', 404);
  return new Response(rendered.body, { status: rendered.status, headers: rendered.headers });
}

function canonicalRedirect(url: URL, prefix: string, bookParam: string, bookSlug: string) {
  const target = new URL(url.href);
  target.pathname = url.pathname.replace(`${prefix}/${bookParam}/`, `${prefix}/${bookSlug}/`);
  return Response.redirect(target.href, 301);
}

async function dispatch(edge: EdgeRequest) {
  const card = matchCard(edge.url.pathname);
  if (card) {
    const check = checkRoute(card);
    if (check.kind === 'missing') return textResponse('Not found', 404);
    if (check.kind === 'moved') return canonicalRedirect(edge.url, '/og/bible', check.bookParam, check.bookSlug);
    return renderShareCard(edge, card);
  }

  const isLlms = edge.url.pathname === '/llms.txt';
  const sitemap = matchSitemap(edge.url.pathname);
  if ((isLlms || sitemap) && edge.url.hostname !== PRODUCTION_HOST) return textResponse('Not found', 404);

  if (isLlms) return serveGenerated(edge, 'llms', 'text/markdown; charset=utf-8', llmsTxt);

  if (sitemap) {
    return serveGenerated(edge, 'sitemap', 'application/xml; charset=utf-8', (api) =>
      buildSitemap(sitemap, api, edge.config.indexedLanguages),
    );
  }

  const match = matchPageRoute(edge.url.pathname);
  if (!match) return edge.url.pathname.endsWith('.md') ? textResponse('Not found', 404, { 'X-Robots-Tag': 'noindex' }) : null;
  const check = checkRoute(match.route);
  if (check.kind === 'moved') return canonicalRedirect(edge.url, '/bible', check.bookParam, check.bookSlug);
  if (check.kind === 'missing') {
    return match.markdown
      ? textResponse('Not found', 404, { 'X-Robots-Tag': 'noindex' })
      : shellResponse(edge.env, edge.url, 404, { 'X-Robots-Tag': 'noindex' });
  }
  return match.markdown ? renderMarkdownPage(edge, match.route) : renderPage(edge, match);
}

export async function handleEdge(request: Request, env: EdgeEnv, url: URL, ctx?: ExecutionContextLike) {
  const config = readConfig(env);
  if (!config.enabled || (request.method !== 'GET' && request.method !== 'HEAD')) return null;
  const response = await dispatch({ request, env, url, config, runtime: runtimeFor(ctx) });
  if (!response) return null;
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(request.method === 'GET' ? response.body : null, { status: response.status, headers });
}
