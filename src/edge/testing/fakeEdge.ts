import { vi } from 'vitest';

import { TestHTMLRewriter } from './htmlRewriter';

export const SHELL =
  '<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>VerseMate — Bible Reading Companion</title>' +
  '<meta name="description" content="A clean, reverent mobile Bible reading app.">' +
  '<meta property="og:type" content="website" /><meta property="og:title" content="VerseMate">' +
  '<meta property="og:description" content="A clean, reverent mobile Bible reading app.">' +
  '<meta property="og:image" content="https://app.versemate.org/og/default.png">' +
  '<meta property="og:image:alt" content="VerseMate">' +
  '<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="VerseMate">' +
  '<meta name="twitter:description" content="A clean, reverent mobile Bible reading app.">' +
  '<meta name="twitter:image" content="https://app.versemate.org/og/default.png">' +
  '</head><body><div id="root"></div><script type="module" src="/assets/index.js"></script></body></html>';

type Key = string;

export interface FakeData {
  books: { b: number; n: string; c: number }[];
  verses: Record<Key, { verseNumber: number; text: string }[]>;
  explanations: Record<Key, string>;
  coverage: Record<string, { bookId: number; chapters: number[] }[]> | 'missing' | 'down';
  events: { slug: string; title: string; passages: string[]; overview: Record<string, string> }[];
  topics: { id: string; name: string; category: string; references: string; summary: Record<string, string> }[];
  down: boolean;
}

export function fakeData(overrides: Partial<FakeData> = {}): FakeData {
  return {
    books: [
      { b: 1, n: 'Genesis', c: 50 },
      { b: 43, n: 'John', c: 21 },
    ],
    verses: {
      '43:3': [
        { verseNumber: 1, text: 'Now there was a man of the Pharisees, named Nicodemus, a ruler of the Jews;' },
        { verseNumber: 16, text: 'For God so loved the world, that He gave His only begotten Son.' },
      ],
      '1:1': [{ verseNumber: 1, text: 'In the beginning God created the heavens and the earth.' }],
      '43:4': [{ verseNumber: 1, text: 'Therefore when the Lord knew that the Pharisees had heard.' }],
    },
    explanations: {
      '43:3:summary:en-US':
        '# Summary of John 3\n\n## Overview\nJohn 3 tells about Jesus having a nighttime talk with Nicodemus, a leading Pharisee. The chapter explains the new birth.\n\n## The New Birth\nJesus tells Nicodemus that entering **God’s kingdom** means being born from above.',
      '43:3:byline:en-US': '# Line-by-Line Analysis of John 3\n\n## John 3:16\n> For God so loved the world\n\n### Summary\nGod’s love is the source of salvation.',
      '43:3:summary:es-MX': '# Resumen de Juan 3\n\n## Visión general\nJuan 3 narra la conversación nocturna de Jesús con Nicodemo.',
      '43:3:byline:es-MX': '# Análisis de Juan 3\n\n## Juan 3:16\nEl amor de Dios.',
      '43:3:summary:ru': '# Резюме Иоанна 3\n\n## Обзор\nИоанн 3 рассказывает о ночном разговоре.',
      '1:1:summary:en-US': '# Summary of Genesis 1\n\n## Overview\nGenesis 1 opens with God creating everything out of nothing in six days.',
      '1:1:byline:en-US': '# Line-by-Line Analysis of Genesis 1\n\n## Genesis 1:1\nIn the beginning.',
      '43:4:summary:en-US': '# Summary of John 4\n\n## Overview\nJesus meets a Samaritan woman at a well.',
    },
    coverage: {
      'en-US': [
        { bookId: 1, chapters: [1] },
        { bookId: 43, chapters: [3, 4] },
      ],
      'es-MX': [{ bookId: 43, chapters: [3] }],
    },
    events: [
      {
        slug: 'event-baptism',
        title: 'The baptism of Jesus',
        passages: ['Matthew 3:13-17', 'Mark 1:9-11'],
        overview: {
          'en-US': 'Jesus comes from Nazareth to the Jordan, where John is baptizing.',
          'es-MX': 'Jesús llega de Nazaret al Jordán, donde Juan bautiza.',
        },
      },
    ],
    topics: [
      {
        id: '5b50774c-9f98-41ab-b43c-8271dd963e01',
        name: 'The Creation of the World',
        category: 'EVENT',
        references: '## The Six Days of Creation\n(Genesis 1, Genesis 2:1-3)\n\n1\nIn the beginning God created the heavens and the earth.\n',
        summary: { 'en-US': '# Summary of The Creation of the World\n\n## Overview\nGenesis opens by declaring that God alone created all things (Genesis 1:1).' },
      },
      {
        id: 'cdb386f5-551b-4a2e-85f1-f89c99afeeb1',
        name: 'The Fall of Man',
        category: 'EVENT',
        references: '## The Temptation\n(Genesis 3:1-7)\n\n1\nNow the serpent was more crafty.\n',
        summary: {},
      },
    ],
    down: false,
    ...overrides,
  };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export function fakeApi(data: FakeData) {
  const calls: string[] = [];
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    calls.push(`${url.pathname}${url.search}`);
    if (new Headers(init?.headers).get('user-agent') !== 'VerseMate-Edge') return json({ error: 'refused' }, 403);
    if (data.down) return json({ error: 'down' }, 500);
    const q = url.searchParams;
    const lang = q.get('lang') || 'en-US';
    const path = url.pathname;
    let m: RegExpMatchArray | null;

    if (path === '/bible/testaments') return json({ testaments: data.books.map((b) => ({ ...b, t: 'OT', g: 1 })) });
    if (path === '/bible/explanations/coverage') {
      if (data.coverage === 'missing') return json({ message: 'NOT_FOUND' }, 404);
      if (data.coverage === 'down') return json({ error: 'down' }, 503);
      return json({ languages: data.coverage });
    }
    if ((m = path.match(/^\/bible\/book\/explanation\/(\d+)\/(\d+)$/))) {
      const type = q.get('explanationType');
      const text = data.explanations[`${m[1]}:${m[2]}:${type}:${lang}`] ?? data.explanations[`${m[1]}:${m[2]}:${type}:en-US`];
      return json({ explanation: text ? { book_id: Number(m[1]), chapter_number: Number(m[2]), type, explanation: text } : null });
    }
    if ((m = path.match(/^\/bible\/book\/(\d+)\/(\d+)$/))) {
      const verses = data.verses[`${m[1]}:${m[2]}`];
      if (!verses) return json({ message: 'Chapter not found' });
      const book = data.books.find((b) => b.b === Number(m[1]));
      return json({ book: { bookId: Number(m[1]), name: book?.n, chapters: [{ chapterNumber: Number(m[2]), verses }] } });
    }
    if (path === '/jesus/events') {
      return json({
        events: data.events.map((e) => ({ slug: e.slug, title: e.title, passages: e.passages.map((display) => ({ display })) })),
        total: data.events.length,
      });
    }
    if ((m = path.match(/^\/jesus\/events\/([^/]+)$/))) {
      const event = data.events.find((e) => e.slug === decodeURIComponent(m[1]));
      if (!event) return json({ error: 'Event not found' }, 404);
      return json({
        event: { slug: event.slug, title: event.title, passages: event.passages.map((display) => ({ display })) },
        explanation: { overview: event.overview[lang] ?? event.overview['en-US'] ?? '' },
      });
    }
    if (path === '/topics/categories') return json({ categories: ['EVENT', 'PARABLE', 'PROPHECY', 'THEME'] });
    if (path === '/topics/search') {
      const topics = data.topics.filter((t) => t.category === q.get('category'));
      return json({ topics: topics.map((t) => ({ topic_id: t.id, name: t.name, description: '' })) });
    }
    if ((m = path.match(/^\/topics\/([^/]+)\/explanation$/))) {
      const topic = data.topics.find((t) => t.id === m[1]);
      const text = topic?.summary[lang] ?? topic?.summary['en-US'];
      return json({ explanation: text ? { explanation: text } : null });
    }
    if ((m = path.match(/^\/topics\/([^/]+)\/references$/))) {
      const topic = data.topics.find((t) => t.id === m[1]);
      return json({ references: topic ? { content: topic.references } : null });
    }
    return json({ error: 'not stubbed' }, 404);
  });
  return { fetch, calls };
}

export function fakeCache() {
  const entries = new Map<string, Response>();
  return {
    entries,
    async match(key: RequestInfo | URL) {
      const hit = entries.get(String(typeof key === 'object' && 'url' in key ? key.url : key));
      return hit ? hit.clone() : undefined;
    },
    async put(key: RequestInfo | URL, response: Response) {
      entries.set(String(typeof key === 'object' && 'url' in key ? key.url : key), response.clone());
    },
  };
}

export function fakeAssets(extra: Record<string, () => Response> = {}) {
  return {
    fetch: vi.fn(async (request: Request) => {
      const { pathname } = new URL(request.url);
      if (extra[pathname]) return extra[pathname]();
      if (pathname.includes('.') && pathname !== '/index.html') return new Response('not found', { status: 404 });
      return new Response(SHELL, { headers: { 'content-type': 'text/html; charset=utf-8', etag: '"shell"' } });
    }),
  };
}

export function installEdgeGlobals(data: FakeData = fakeData()) {
  const api = fakeApi(data);
  const cache = fakeCache();
  vi.stubGlobal('fetch', api.fetch);
  vi.stubGlobal('caches', { default: cache });
  vi.stubGlobal('HTMLRewriter', TestHTMLRewriter);
  return { api, cache, data };
}

export function edgeEnv(overrides: Record<string, unknown> = {}) {
  return {
    ASSETS: fakeAssets(),
    EDGE_RENDER: true,
    API_URL: 'https://api.example.test',
    INDEXED_LANGUAGES: ['en-US'],
    CF_VERSION_METADATA: { id: 'build-1' },
    ...overrides,
  };
}

export function context() {
  const pending: Promise<unknown>[] = [];
  return {
    pending,
    waitUntil(promise: Promise<unknown>) {
      pending.push(promise);
    },
    async settle() {
      while (pending.length) await pending.shift();
    },
  };
}
