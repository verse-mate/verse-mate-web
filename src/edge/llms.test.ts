// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import worker from '../../worker.js';
import { BOOK_SLUGS } from '../lib/bookSlugs';
import { context, edgeEnv, fakeData, installEdgeGlobals, SHELL } from './testing/fakeEdge';

afterEach(() => vi.unstubAllGlobals());

async function get(url: string) {
  const ctx = context();
  const response = await worker.fetch(new Request(url.startsWith('http') ? url : `https://app.versemate.org${url}`), edgeEnv(), ctx);
  const body = await response.text();
  await ctx.settle();
  return { response, body };
}

function allBooks() {
  const books = Object.keys(BOOK_SLUGS).map((id) => ({ b: Number(id), n: `Book ${id}`, c: 3 }));
  const data = fakeData({ books });
  data.books.find((book) => book.b === 43)!.n = 'John';
  data.books.find((book) => book.b === 1)!.n = 'Genesis';
  for (const book of books) data.verses[`${book.b}:1`] ??= [{ verseNumber: 1, text: `First verse of book ${book.b}.` }];
  return data;
}

describe('Markdown versions of the pages', () => {
  it('give John 3 as Markdown, naming the HTML page as canonical', async () => {
    installEdgeGlobals();

    const { response, body } = await get('/bible/john/3.md');

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('link')).toBe('<https://app.versemate.org/bible/john/3>; rel="canonical"');
    expect(response.headers.get('x-robots-tag')).toBeNull();
    expect(body.startsWith('# John 3\n')).toBe(true);
    expect(body).toContain('**16** For God so loved the world');
    expect(body).toContain('## Summary');
    expect(body).toContain('nighttime talk with Nicodemus');
    expect(body).toContain('## Verse by verse');
    expect(body).not.toMatch(/<(div|script|html)/);
  });

  it('honour lang, and carry noindex for an unpublished language', async () => {
    installEdgeGlobals();

    const { response, body } = await get('/bible/john/3.md?lang=ru');

    expect(body).toContain('Иоанн 3 рассказывает');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('link')).toBe('<https://app.versemate.org/bible/john/3?lang=ru>; rel="canonical"');
  });

  it('give a Jesus event and a topic as Markdown', async () => {
    installEdgeGlobals();

    const event = await get('/jesus/event/event-baptism.md');
    const topic = await get('/topic/events/the-creation-of-the-world.md');

    expect(event.body).toContain('# The baptism of Jesus\n');
    expect(event.body).toContain('- Matthew 3:13-17');
    expect(event.body).toContain('Jesus comes from Nazareth');
    expect(topic.body).toContain('### The Six Days of Creation');
    expect(topic.body).toContain('- Genesis 2:1-3');
  });

  it('do not exist for a page that does not exist or is not rendered, even where the assets answer every path with the shell', async () => {
    installEdgeGlobals();
    const spaAssets = { fetch: async () => new Response(SHELL, { headers: { 'content-type': 'text/html' } }) };

    for (const path of ['/bible/john/999.md', '/jesus.md', '/read.md', '/topics.md', '/bible/john/3/commentary.md']) {
      const response = await worker.fetch(new Request(`https://app.versemate.org${path}`), edgeEnv({ ASSETS: spaAssets }), context());
      expect(response.status, path).toBe(404);
      expect(await response.text(), path).not.toContain('<div id="root">');
    }
    expect((await get('/bible/john/999.md')).response.headers.get('x-robots-tag')).toBe('noindex');
  });
});

describe('llms.txt', () => {
  it('describes VerseMate and links all 66 books, the Jesus events and the topics', async () => {
    installEdgeGlobals(allBooks());

    const { response, body } = await get('/llms.txt');

    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(body.startsWith('# VerseMate\n')).toBe(true);
    expect(body).not.toMatch(/<(div|html)/);
    const links = [...body.matchAll(/\]\((https:\/\/app\.versemate\.org[^)]+)\)/g)].map((m) => m[1]);
    const books = links.filter((link) => link.startsWith('https://app.versemate.org/bible/'));
    expect(books).toHaveLength(66);
    expect(books).toContain('https://app.versemate.org/bible/john/1.md');
    expect(body).toContain('[The baptism of Jesus](https://app.versemate.org/jesus/event/event-baptism.md)');
    expect(body).toMatch(/### Events\n+- \[The Creation of the World\]\(https:\/\/app\.versemate\.org\/topic\/events\/the-creation-of-the-world\.md\)/);
    expect(body).not.toContain('the-fall-of-man');
    expect(body).not.toMatch(/app\.versemate\.org\/(jesus|topics|read)\)/);

    for (const link of links) {
      const linked = await get(link);
      expect(linked.response.status, link).toBe(200);
      expect(linked.body.trim().length, link).toBeGreaterThan(0);
      expect(linked.body, link).not.toContain('<div id="root">');
    }
  });

  it('is not built on any host other than app.versemate.org', async () => {
    const { api } = installEdgeGlobals(allBooks());

    const { response } = await get('https://verse-mate-web-preview.verse-mate.workers.dev/llms.txt');

    expect(response.status).toBe(404);
    expect(api.calls).toEqual([]);
  });
});
