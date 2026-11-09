// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { validateXML } from 'xmllint-wasm';

import worker from '../../worker.js';
import { getBookSlug } from '../lib/bookSlugs';
import { context, edgeEnv, fakeData, installEdgeGlobals } from './testing/fakeEdge';

afterEach(() => vi.unstubAllGlobals());

const CHAPTERS = [
  50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7,
  3, 3, 3, 2, 14, 4, 28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22,
];

const xsd = (name: string) => ({ fileName: name, contents: readFileSync(join(__dirname, 'fixtures', name), 'utf8') });

async function valid(xml: string, schema: string) {
  const result = await validateXML({ xml: [{ fileName: 'sitemap.xml', contents: xml }], schema: [xsd(schema)] });
  return result.errors.map((error) => error.message);
}

async function get(path: string, env: Record<string, unknown> = {}, host = 'app.versemate.org') {
  const ctx = context();
  const response = await worker.fetch(new Request(`https://${host}${path}`), edgeEnv(env), ctx);
  const body = await response.text();
  await ctx.settle();
  return { response, body, locs: [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&')) };
}

function withEvents() {
  return fakeData({
    events: [
      { slug: 'event-baptism', title: 'The baptism of Jesus', passages: ['Matthew 3:13-17'], overview: { 'en-US': 'Baptism.', 'es-MX': 'Bautismo.' } },
      { slug: 'the-boy-in-the-temple', title: 'The boy in the temple', passages: ['Luke 2:41-52'], overview: { 'en-US': 'The temple.' } },
      { slug: 'event-unexplained', title: 'An event without an explanation', passages: ['Mark 1:1'], overview: {} },
    ],
  });
}

describe('the sitemap index', () => {
  it('lists a child per published language plus Jesus events and topics, as XML', async () => {
    installEdgeGlobals();

    const index = await get('/sitemap.xml', { INDEXED_LANGUAGES: ['en-US', 'es-MX'] });

    expect(index.response.headers.get('content-type')).toBe('application/xml; charset=utf-8');
    expect(index.locs).toEqual([
      'https://app.versemate.org/sitemaps/bible-en-US.xml',
      'https://app.versemate.org/sitemaps/bible-es-MX.xml',
      'https://app.versemate.org/sitemaps/jesus.xml',
      'https://app.versemate.org/sitemaps/topics.xml',
    ]);
    expect(await valid(index.body, 'siteindex.xsd')).toEqual([]);
  });

  it('are not built on any host other than app.versemate.org', async () => {
    const { api } = installEdgeGlobals(withEvents());

    for (const host of ['verse-mate-web-preview.verse-mate.workers.dev', 'verse-mate-web-production.verse-mate.workers.dev']) {
      for (const path of ['/sitemap.xml', '/sitemaps/bible-en-US.xml']) {
        const { response } = await get(path, {}, host);
        expect(response.status, `${host}${path}`).toBe(404);
        expect(response.headers.get('x-robots-tag'), `${host}${path}`).toBe('noindex');
      }
    }
    expect(api.calls).toEqual([]);
  });
});

describe('the chapter sitemaps', () => {
  it('list every covered chapter at its canonical URL, 1,189 when fully covered', async () => {
    const books = CHAPTERS.map((c, index) => ({ b: index + 1, n: `Book ${index + 1}`, c }));
    const full = books.map((book) => ({ bookId: book.b, chapters: Array.from({ length: book.c }, (_, i) => i + 1) }));
    installEdgeGlobals(fakeData({ books, coverage: { 'en-US': full } }));

    const english = await get('/sitemaps/bible-en-US.xml');

    expect(english.locs).toHaveLength(1189);
    expect(english.locs[0]).toBe('https://app.versemate.org/bible/genesis/1');
    expect(english.locs).toContain('https://app.versemate.org/bible/john/3');
    expect(english.locs.at(-1)).toBe(`https://app.versemate.org/bible/${getBookSlug(66)}/22`);
    expect(await valid(english.body, 'sitemap.xsd')).toEqual([]);
  });

  it('leave out chapters without an explanation in the language', async () => {
    installEdgeGlobals();

    expect((await get('/sitemaps/bible-en-US.xml')).locs).toEqual([
      'https://app.versemate.org/bible/genesis/1',
      'https://app.versemate.org/bible/john/3',
      'https://app.versemate.org/bible/john/4',
    ]);
    expect((await get('/sitemaps/bible-es-MX.xml', { INDEXED_LANGUAGES: ['en-US', 'es-MX'] })).locs).toEqual([
      'https://app.versemate.org/bible/john/3?lang=es-MX',
    ]);
  });

  it('do not exist for an unpublished language', async () => {
    installEdgeGlobals();

    expect((await get('/sitemaps/bible-es-MX.xml')).response.status).toBe(404);
    expect((await get('/sitemap.xml')).locs.some((loc) => loc.includes('es-MX'))).toBe(false);
  });

  it('answer 503 and are not kept while coverage cannot be read', async () => {
    const data = fakeData({ coverage: 'missing' });
    const { cache } = installEdgeGlobals(data);

    const missing = await get('/sitemaps/bible-en-US.xml');

    expect(missing.response.status).toBe(503);
    expect(missing.response.headers.get('retry-after')).toBeTruthy();
    expect([...cache.entries.keys()].some((key) => key.includes('/sitemaps/'))).toBe(false);
  });
});

describe('the Jesus and topic sitemaps', () => {
  it('list the events that have an explanation, in each published language', async () => {
    installEdgeGlobals(withEvents());

    const jesus = await get('/sitemaps/jesus.xml', { INDEXED_LANGUAGES: ['en-US', 'es-MX'] });

    expect(jesus.locs).toEqual([
      'https://app.versemate.org/jesus/event/event-baptism',
      'https://app.versemate.org/jesus/event/event-baptism?lang=es-MX',
      'https://app.versemate.org/jesus/event/the-boy-in-the-temple',
    ]);
    expect(await valid(jesus.body, 'sitemap.xsd')).toEqual([]);
  });

  it('list the topics that have an explanation, and no shell-only route', async () => {
    installEdgeGlobals(withEvents());

    const topics = await get('/sitemaps/topics.xml');

    expect(topics.locs).toEqual(['https://app.versemate.org/topic/events/the-creation-of-the-world']);
    expect(await valid(topics.body, 'sitemap.xsd')).toEqual([]);

    const all = [
      ...topics.locs,
      ...(await get('/sitemaps/jesus.xml')).locs,
      ...(await get('/sitemaps/bible-en-US.xml')).locs,
    ];
    for (const loc of all) expect(loc).toMatch(/^https:\/\/app\.versemate\.org\/(bible\/[^/]+\/\d+|jesus\/event\/[^/?]+|topic\/[^/]+\/[^/?]+)(\?lang=[\w-]+)?$/);
  });
});
