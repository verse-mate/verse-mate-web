// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import robotsParser from 'robots-parser';
import { afterEach, describe, expect, it, vi } from 'vitest';

import worker from '../../worker.js';
import { context, edgeEnv, installEdgeGlobals } from './testing/fakeEdge';

const publicDir = join(__dirname, '../../public');
const typeOf = (path: string) =>
  path.endsWith('.txt') ? 'text/plain; charset=utf-8' : path.endsWith('.png') ? 'image/png' : 'application/octet-stream';

const assets = {
  fetch: async (request: Request) => {
    const { pathname } = new URL(request.url);
    const file = join(publicDir, pathname);
    if (pathname !== '/' && existsSync(file) && !file.endsWith('/'))
      return new Response(readFileSync(file), { headers: { 'content-type': typeOf(pathname) } });
    return new Response('not found', { status: 404 });
  },
};

const get = (url: string) => worker.fetch(new Request(url), { ASSETS: assets });

describe('app-link verification files', () => {
  it('serves the iOS association as JSON, for the claimed prefixes only', async () => {
    const response = await get('https://app.versemate.org/.well-known/apple-app-site-association');

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/json');
    const body = await response.json();
    expect(Object.keys(body)).toEqual(['applinks']);
    expect(body.applinks.details).toHaveLength(1);
    const [detail] = body.applinks.details;
    expect(detail.appIDs).toEqual(['U9SRD4VJPX.org.versemate.app']);
    expect(detail.components.map((c: { '/': string }) => c['/'])).toEqual([
      '/bible*',
      '/topic*',
      '/names-of-god*',
      '/jesus*',
    ]);
  });

  it('answers a missing association file with 404, never the app page', async () => {
    const response = await worker.fetch(new Request('https://app.versemate.org/.well-known/assetlinks.json'), {
      ASSETS: { fetch: async () => new Response('not found', { status: 404 }) },
    });

    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).not.toContain('text/html');
  });

  it('answers a missing association file with 404 where the assets answer every path with the app page', async () => {
    const response = await worker.fetch(new Request('https://app.versemate.org/.well-known/assetlinks.json'), {
      ASSETS: { fetch: async () => new Response('<!doctype html><div id="root"></div>', { headers: { 'content-type': 'text/html; charset=utf-8' } }) },
    });

    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).not.toContain('text/html');
    expect(await response.text()).not.toContain('<div id="root">');
  });

  it('serves the Android association as JSON when it exists', async () => {
    const response = await worker.fetch(new Request('https://app.versemate.org/.well-known/assetlinks.json'), {
      ASSETS: { fetch: async () => new Response('[]', { headers: { 'content-type': 'application/octet-stream' } }) },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/json');
  });
});

describe('robots.txt as each admitted crawler reads it', () => {
  const managed = readFileSync(join(__dirname, 'fixtures/cloudflare-managed-robots.txt'), 'utf8');
  const served = `${managed}\n${readFileSync(join(publicDir, 'robots.txt'), 'utf8')}`;
  const robots = robotsParser('https://app.versemate.org/robots.txt', served);
  const privatePaths = [
    '/notes',
    '/notes/john/3',
    '/bookmarks',
    '/highlights',
    '/menu',
    '/login',
    '/logout',
    '/create-account',
    '/auth/callback/google',
    '/email-verified',
    '/coach',
    '/coach/sessions',
  ];

  for (const agent of ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'PerplexityBot', 'Applebot']) {
    it(`keeps ${agent} out of private screens and lets it read chapters`, () => {
      for (const path of privatePaths)
        expect(robots.isDisallowed(`https://app.versemate.org${path}`, agent), `${agent} ${path}`).toBe(true);
      expect(robots.isAllowed('https://app.versemate.org/bible/john/3', agent)).toBe(true);
    });
  }

  it('still refuses training crawlers', () => {
    expect(robots.isDisallowed('https://app.versemate.org/bible/john/3', 'GPTBot')).toBe(true);
    expect(robots.isDisallowed('https://app.versemate.org/bible/john/3', 'CCBot')).toBe(true);
  });

  it('names the sitemap index', () => {
    expect(robots.getSitemaps()).toContain('https://app.versemate.org/sitemap.xml');
  });
});

describe('private screens', () => {
  it('answer with noindex, matching whole path segments only', async () => {
    const privatePaths = [
      '/notes',
      '/notes/john/3',
      '/bookmarks',
      '/highlights',
      '/menu',
      '/login',
      '/logout',
      '/create-account',
      '/auth/callback/google',
      '/email-verified',
      '/coach',
      '/coach/sessions',
    ];
    for (const path of privatePaths) {
      expect((await get(`https://app.versemate.org${path}`)).headers.get('x-robots-tag'), path).toBe('noindex');
    }
    for (const path of ['/coaching', '/menus', '/bible/john/3', '/']) {
      expect((await get(`https://app.versemate.org${path}`)).headers.get('x-robots-tag'), path).toBeNull();
    }
  });
});

describe('responses rendered at the edge', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('tell browsers not to sniff their type, for every kind of response', async () => {
    installEdgeGlobals();
    const kinds = {
      '/bible/john/3': 'text/html',
      '/bible/john/3.md': 'text/markdown',
      '/sitemap.xml': 'application/xml',
      '/bible/john/999.md': 'text/plain',
      '/og/bible/john/3.png': 'image/png',
    };

    for (const [path, type] of Object.entries(kinds)) {
      const ctx = context();
      const response = await worker.fetch(new Request(`https://app.versemate.org${path}`), edgeEnv(), ctx);
      await ctx.settle();
      expect(response.headers.get('content-type'), path).toContain(type);
      expect(response.headers.get('x-content-type-options'), path).toBe('nosniff');
    }
  }, 30_000);
});

describe('hosts other than app.versemate.org', () => {
  it('answers with noindex on preview and workers.dev hosts', async () => {
    for (const host of ['verse-mate-web-preview.verse-mate.workers.dev', 'verse-mate-web-production.verse-mate.workers.dev']) {
      const response = await get(`https://${host}/robots.txt`);
      expect(response.headers.get('x-robots-tag'), host).toBe('noindex');
    }
  });

  it('leaves app.versemate.org indexable', async () => {
    const response = await get('https://app.versemate.org/robots.txt');
    expect(response.headers.get('x-robots-tag')).toBeNull();
  });
});

describe('IndexNow key', () => {
  it('is a 32-character hex key named after itself, the same as the website key', () => {
    const [keyFile] = readdirSync(publicDir).filter((name) => /^[0-9a-f]{32}\.txt$/.test(name));
    const key = keyFile.replace(/\.txt$/, '');

    expect(readFileSync(join(publicDir, keyFile), 'utf8')).toBe(key);
    expect(key).toBe('0cef9078b0b1b3b32fb3a427739bdc64');
  });
});
