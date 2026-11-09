import { ApiUnavailable, createApi, type Runtime } from './api';
import { languageFromQuery, readConfig, type EdgeConfig, type EdgeEnv } from './config';
import { loadPage, matchPageRoute } from './pageData';

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

async function renderPage(edge: EdgeRequest, match: NonNullable<ReturnType<typeof matchPageRoute>>) {
  const { env, url, config, runtime } = edge;
  const lang = languageFromQuery(url.searchParams.get('lang'));
  const api = createApi(config.apiUrl, runtime);
  let data;
  try {
    data = await loadPage(api, match.route, lang);
  } catch (error) {
    reportFailure(error);
    return shellResponse(env, url, 200);
  }
  if (!data) return shellResponse(env, url, 404, { 'X-Robots-Tag': 'noindex' });
  return shellResponse(env, url, 200);
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
