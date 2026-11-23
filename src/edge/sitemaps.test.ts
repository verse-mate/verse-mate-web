// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { validateXML } from 'xmllint-wasm';

import worker from '../../worker.js';
import { getBookSlug } from '../lib/bookSlugs';
import { LANGUAGES } from './config';
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
  it('lists the chapter, Jesus event and topic children of each published language, as XML', async () => {
    installEdgeGlobals();

    const index = await get('/sitemap.xml', { INDEXED_LANGUAGES: ['en-US', 'es-MX'] });

    expect(index.response.headers.get('content-type')).toBe('application/xml; charset=utf-8');
    expect(index.locs).toEqual([
      'https://app.versemate.org/sitemaps/bible-en-US.xml',
      'https://app.versemate.org/sitemaps/jesus-en-US.xml',
      'https://app.versemate.org/sitemaps/topics-en-US.xml',
      'https://app.versemate.org/sitemaps/bible-es-MX.xml',
      'https://app.versemate.org/sitemaps/jesus-es-MX.xml',
      'https://app.versemate.org/sitemaps/topics-es-MX.xml',
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

describe('the dates in the sitemaps', () => {
  const dated = () =>
    fakeData({
      lastModified: {
        'en-US': {
          chapters: [
            { bookId: 1, chapter: 1, lastModified: '2025-11-02T10:00:00.000Z' },
            { bookId: 43, chapter: 3, lastModified: '2026-11-20T23:30:00.000Z' },
            { bookId: 43, chapter: 4, lastModified: '2026-03-01T00:00:00.000Z' },
          ],
          events: [{ slug: 'event-baptism', lastModified: '2026-06-15T12:00:00.000Z' }],
          topics: [{ topicId: '5b50774c-9f98-41ab-b43c-8271dd963e01', lastModified: '2026-07-04T08:00:00.000Z' }],
        },
      },
    });
  const lastmods = (body: string) =>
    Object.fromEntries([...body.matchAll(/<loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)].map((m) => [m[1], m[2]]));

  it('give each chapter the date its own explanations last changed, never the build date', async () => {
    installEdgeGlobals(dated());

    const bible = await get('/sitemaps/bible-en-US.xml');

    expect(lastmods(bible.body)).toEqual({
      'https://app.versemate.org/bible/genesis/1': '2025-11-02',
      'https://app.versemate.org/bible/john/3': '2026-11-20',
      'https://app.versemate.org/bible/john/4': '2026-03-01',
    });
    expect(await valid(bible.body, 'sitemap.xsd')).toEqual([]);
  });

  it('date the Jesus event and topic URLs too', async () => {
    installEdgeGlobals(dated());

    expect(lastmods((await get('/sitemaps/jesus-en-US.xml')).body)).toEqual({
      'https://app.versemate.org/jesus/event/event-baptism': '2026-06-15',
    });
    expect(lastmods((await get('/sitemaps/topics-en-US.xml')).body)).toEqual({
      'https://app.versemate.org/topic/events/the-creation-of-the-world': '2026-07-04',
    });
  });

  it('date each child in the index no earlier than its newest URL', async () => {
    installEdgeGlobals(dated());

    const index = await get('/sitemap.xml');

    expect(lastmods(index.body)).toEqual({
      'https://app.versemate.org/sitemaps/bible-en-US.xml': '2026-11-20',
      'https://app.versemate.org/sitemaps/jesus-en-US.xml': '2026-06-15',
      'https://app.versemate.org/sitemaps/topics-en-US.xml': '2026-07-04',
    });
    expect(await valid(index.body, 'siteindex.xsd')).toEqual([]);
  });

  it('answer 503, kept nowhere, while the dates cannot be read', async () => {
    const { cache } = installEdgeGlobals(fakeData({ lastModified: 'down' }));

    for (const path of ['/sitemap.xml', '/sitemaps/bible-en-US.xml', '/sitemaps/jesus-en-US.xml', '/sitemaps/topics-en-US.xml']) {
      expect((await get(path)).response.status, path).toBe(503);
    }
    expect([...cache.entries.keys()].some((key) => key.includes('/sitemap'))).toBe(false);
  });

  it('are never served from a copy older than a day, and re-read the dates within an hour', async () => {
    vi.useFakeTimers({ now: new Date('2026-11-23T06:00:00Z'), toFake: ['Date'] });
    try {
      const data = fakeData();
      const { cache } = installEdgeGlobals(data);
      expect((await get('/sitemaps/bible-en-US.xml')).response.status).toBe(200);

      const datesKey = [...cache.entries.keys()].find((key) => decodeURIComponent(key).includes('/bible/explanations/last-modified'));
      const datesAge = cache.entries.get(datesKey ?? '')?.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1];
      expect(Number(datesAge)).toBeLessThanOrEqual(3600);

      data.down = true;
      vi.setSystemTime(new Date('2026-11-23T19:00:00Z'));
      expect((await get('/sitemaps/bible-en-US.xml')).response.status).toBe(200);
      vi.setSystemTime(new Date('2026-11-24T06:30:00Z'));
      expect((await get('/sitemaps/bible-en-US.xml')).response.status).toBe(503);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('the Jesus and topic sitemaps', () => {
  it('list the events that have an explanation, one child per published language', async () => {
    installEdgeGlobals(withEvents());
    const env = { INDEXED_LANGUAGES: ['en-US', 'es-MX'] };

    const english = await get('/sitemaps/jesus-en-US.xml', env);
    const spanish = await get('/sitemaps/jesus-es-MX.xml', env);

    expect(english.locs).toEqual([
      'https://app.versemate.org/jesus/event/event-baptism',
      'https://app.versemate.org/jesus/event/the-boy-in-the-temple',
    ]);
    expect(spanish.locs).toEqual(['https://app.versemate.org/jesus/event/event-baptism?lang=es-MX']);
    expect(await valid(english.body, 'sitemap.xsd')).toEqual([]);
  });

  it('list the topics that have an explanation, and no shell-only route', async () => {
    installEdgeGlobals(withEvents());

    const topics = await get('/sitemaps/topics-en-US.xml');

    expect(topics.locs).toEqual(['https://app.versemate.org/topic/events/the-creation-of-the-world']);
    expect(await valid(topics.body, 'sitemap.xsd')).toEqual([]);

    const all = [
      ...topics.locs,
      ...(await get('/sitemaps/jesus-en-US.xml')).locs,
      ...(await get('/sitemaps/bible-en-US.xml')).locs,
    ];
    for (const loc of all) expect(loc).toMatch(/^https:\/\/app\.versemate\.org\/(bible\/[^/]+\/\d+|jesus\/event\/[^/?]+|topic\/[^/]+\/[^/?]+)(\?lang=[\w-]+)?$/);
  });

  it('do not exist for an unpublished language', async () => {
    installEdgeGlobals(withEvents());

    expect((await get('/sitemaps/jesus-es-MX.xml')).response.status).toBe(404);
    expect((await get('/sitemaps/topics-es-MX.xml')).response.status).toBe(404);
  });
});

describe('the work one request may do', () => {
  const SUBREQUEST_LIMIT = 1000;
  const CACHE_API_LIMIT = 1000;
  const EVENTS = 214;
  const TOPICS = 196;
  const CATEGORIES = ['EVENT', 'PARABLE', 'PROPHECY', 'THEME'];

  function productionSize() {
    const books = CHAPTERS.map((c, index) => ({ b: index + 1, n: `Book ${index + 1}`, c }));
    const full = books.map((book) => ({ bookId: book.b, chapters: Array.from({ length: book.c }, (_, i) => i + 1) }));
    const everywhere = (text: string) => Object.fromEntries(LANGUAGES.map((lang) => [lang, `${text} (${lang})`]));
    return fakeData({
      books,
      coverage: Object.fromEntries(LANGUAGES.map((lang) => [lang, full])),
      eventPageCap: 200,
      events: Array.from({ length: EVENTS }, (_, i) => ({
        slug: `event-${i}`,
        title: `Event ${i}`,
        passages: ['Mark 1:1'],
        overview: everywhere(`Event ${i}.`),
      })),
      topics: Array.from({ length: TOPICS }, (_, i) => ({
        id: `topic-${i}`,
        name: `Topic number ${i}`,
        category: CATEGORIES[i % CATEGORIES.length],
        references: '## Part\n(Genesis 1)\n',
        summary: everywhere(`Topic ${i}.`),
      })),
    });
  }

  it('stays under the per-request subrequest limits for every sitemap and llms.txt with all languages published', async () => {
    const env = { INDEXED_LANGUAGES: [...LANGUAGES] };
    const paths = ['/sitemap.xml', '/llms.txt', ...LANGUAGES.flatMap((lang) => ['bible', 'jesus', 'topics'].map((kind) => `/sitemaps/${kind}-${lang}.xml`))];

    for (const path of paths) {
      const { api, cache } = installEdgeGlobals(productionSize());
      const { response, locs } = await get(path, env);
      const fetches = api.calls.length;
      const cacheOps = cache.ops.match + cache.ops.put;

      expect(response.status, path).toBe(200);
      if (path.includes('/jesus-')) expect(locs, path).toHaveLength(EVENTS);
      if (path.includes('/topics-')) expect(locs, path).toHaveLength(TOPICS);
      expect(cacheOps, path).toBeLessThan(CACHE_API_LIMIT);
      expect(fetches + cacheOps, path).toBeLessThan(SUBREQUEST_LIMIT);
      vi.unstubAllGlobals();
    }
  }, 60_000);
});
