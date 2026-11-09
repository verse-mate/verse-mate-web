// @vitest-environment node
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import worker from '../../worker.js';
import { context, edgeEnv, fakeData, installEdgeGlobals } from './testing/fakeEdge';

afterEach(() => vi.unstubAllGlobals());

async function page(path: string, env: Record<string, unknown> = {}) {
  const response = await worker.fetch(new Request(`https://app.versemate.org${path}`), edgeEnv(env), context());
  const document = new JSDOM(await response.text()).window.document;
  const meta = (selector: string) => document.querySelector(selector)?.getAttribute('content') ?? null;
  const graph = JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent ?? '{"@graph":[]}')['@graph'];
  return {
    response,
    document,
    title: document.title,
    lang: document.documentElement.getAttribute('lang'),
    description: meta('meta[name="description"]'),
    robots: meta('meta[name="robots"]'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    alternates: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(
      (link) => `${link.getAttribute('hreflang')} ${link.getAttribute('href')}`,
    ),
    og: (name: string) => meta(`meta[property="og:${name}"]`),
    twitter: (name: string) => meta(`meta[name="twitter:${name}"]`),
    graph,
  };
}

describe('the head of an indexable chapter', () => {
  it('names John 3, its summary, its card, its URL and its structured data', async () => {
    installEdgeGlobals();

    const john = await page('/bible/john/3');

    expect(john.title).toBe('John 3 explained: summary and verse by verse | VerseMate');
    expect(john.lang).toBe('en-US');
    expect(john.description).toBe(
      'John 3 tells about Jesus having a nighttime talk with Nicodemus, a leading Pharisee. The chapter explains the new birth.',
    );
    expect(john.canonical).toBe('https://app.versemate.org/bible/john/3');
    expect(john.robots).toBeNull();
    expect(john.response.headers.get('x-robots-tag')).toBeNull();
    expect(john.og('title')).toBe(john.title);
    expect(john.og('description')).toBe(john.description);
    expect(john.og('url')).toBe(john.canonical);
    expect(john.og('image')).toBe('https://app.versemate.org/og/bible/john/3.png');
    expect(john.twitter('image')).toBe('https://app.versemate.org/og/bible/john/3.png');
    expect(john.twitter('title')).toBe(john.title);
    expect(john.alternates).toEqual(['en-US https://app.versemate.org/bible/john/3', 'x-default https://app.versemate.org/bible/john/3']);

    const [crumbs, work] = john.graph;
    expect(crumbs.itemListElement.map((item: { name: string }) => item.name)).toEqual(['VerseMate', 'John', 'John 3']);
    expect(work).toMatchObject({ '@type': 'CreativeWork', inLanguage: 'en-US', url: john.canonical });
    expect(work.publisher['@id']).toBe('https://versemate.org/#org');
  });

  it('gives two chapters different titles and descriptions', async () => {
    installEdgeGlobals();

    const [john, genesis] = [await page('/bible/john/3'), await page('/bible/genesis/1')];

    expect(genesis.title).toBe('Genesis 1 explained: summary and verse by verse | VerseMate');
    expect(genesis.description).toContain('Genesis 1 opens with God creating');
    expect(genesis.title).not.toBe(john.title);
    expect(genesis.description).not.toBe(john.description);
  });

  it('drops tracking parameters from the canonical link', async () => {
    installEdgeGlobals();

    expect((await page('/bible/john/3?utm_source=x&fbclid=y')).canonical).toBe('https://app.versemate.org/bible/john/3');
  });
});

describe('a chapter in another language', () => {
  it('presents itself in Spanish, and stays noindex while Spanish is not published', async () => {
    installEdgeGlobals();

    const spanish = await page('/bible/john/3?lang=es-MX&utm_source=x');

    expect(spanish.title).toBe('John 3 explicado: resumen y versículo por versículo | VerseMate');
    expect(spanish.description).toBe('Juan 3 narra la conversación nocturna de Jesús con Nicodemo.');
    expect(spanish.lang).toBe('es-MX');
    expect(spanish.canonical).toBe('https://app.versemate.org/bible/john/3?lang=es-MX');
    expect(spanish.og('image')).toBe('https://app.versemate.org/og/bible/john/3.png?lang=es-MX');
    expect(spanish.og('locale')).toBe('es_MX');
    expect(spanish.robots).toBe('noindex');
    expect(spanish.response.headers.get('x-robots-tag')).toBe('noindex');
    expect(spanish.alternates).toEqual([]);
    expect(spanish.graph[1].inLanguage).toBe('es-MX');

    const english = await page('/bible/john/3');
    expect(english.alternates.some((alt) => alt.startsWith('es-MX'))).toBe(false);
  });

  it('becomes indexable and linked from every version once Spanish is published', async () => {
    installEdgeGlobals();
    const published = { INDEXED_LANGUAGES: ['en-US', 'es-MX'] };

    const spanish = await page('/bible/john/3?lang=es-MX', published);
    const english = await page('/bible/john/3', published);

    const expected = [
      'en-US https://app.versemate.org/bible/john/3',
      'es-MX https://app.versemate.org/bible/john/3?lang=es-MX',
      'x-default https://app.versemate.org/bible/john/3',
    ];
    expect(spanish.robots).toBeNull();
    expect(spanish.alternates).toEqual(expected);
    expect(english.alternates).toEqual(expected);
  });

  it('describes an unexplained translation in its own language, not with the English fallback text', async () => {
    installEdgeGlobals();

    const russian = await page('/bible/genesis/1?lang=ru', { INDEXED_LANGUAGES: ['en-US', 'ru'] });

    expect(russian.robots).toBe('noindex');
    expect(russian.description).toBe('Читайте Genesis 1 с кратким содержанием и объяснением стих за стихом от VerseMate.');
  });
});

describe('a chapter without an explanation', () => {
  it('declares noindex and keeps out of the alternates', async () => {
    const data = fakeData();
    delete data.explanations['1:1:summary:en-US'];
    installEdgeGlobals(data);

    const genesis = await page('/bible/genesis/1');

    expect(genesis.robots).toBe('noindex');
    expect(genesis.alternates).toEqual([]);
    expect(genesis.title).toBe('Genesis 1 explained: summary and verse by verse | VerseMate');
  });
});

describe('a Jesus event in a published language', () => {
  it('carries the Spanish explanation and links its English version', async () => {
    installEdgeGlobals();

    const event = await page('/jesus/event/event-baptism?lang=es-MX', { INDEXED_LANGUAGES: ['en-US', 'es-MX'] });

    expect(event.title).toBe('The baptism of Jesus explicado | VerseMate');
    expect(event.description).toBe('Jesús llega de Nazaret al Jordán, donde Juan bautiza.');
    expect(event.robots).toBeNull();
    expect(event.og('image')).toBe('https://app.versemate.org/og/default.png');
    expect(event.alternates).toContain('en-US https://app.versemate.org/jesus/event/event-baptism');
    expect(event.alternates).toContain('es-MX https://app.versemate.org/jesus/event/event-baptism?lang=es-MX');
    expect(event.graph[0].itemListElement.map((item: { name: string }) => item.name)).toEqual([
      'VerseMate',
      'Vida de Jesús',
      'The baptism of Jesus',
    ]);
  });
});
