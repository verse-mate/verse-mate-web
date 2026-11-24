// @vitest-environment node
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import worker from '../../worker.js';
import { context, edgeEnv, fakeData, installEdgeGlobals } from './testing/fakeEdge';

afterEach(() => vi.unstubAllGlobals());

async function root(path: string) {
  const response = await worker.fetch(new Request(`https://app.versemate.org${path}`), edgeEnv(), context());
  const document = new JSDOM(await response.text()).window.document;
  const element = document.getElementById('root')!;
  const headings = [...element.querySelectorAll('h1, h2')].map((heading) => heading.textContent);
  return { document, element, text: element.textContent ?? '', headings, robots: document.querySelector('meta[name="robots"]') };
}

describe('the server-rendered article', () => {
  it('carries John 3, its text with verse numbers, the summary and the verse-by-verse explanation', async () => {
    installEdgeGlobals();

    const john = await root('/bible/john/3');

    expect(john.headings).toEqual(['John 3', 'Summary', 'Verse by verse']);
    expect(john.element.querySelector('#v16')?.textContent).toBe('16 For God so loved the world, that He gave His only begotten Son.');
    expect(john.text).toContain('John 3 tells about Jesus having a nighttime talk with Nicodemus');
    expect(john.element.querySelector('strong')?.textContent).toBe('God’s kingdom');
    expect(john.text).toContain('God’s love is the source of salvation.');
    expect(john.element.querySelector('script')).toBeNull();
  });

  it('shows the summary of a chapter that has no verse-by-verse explanation, and keeps it indexable', async () => {
    installEdgeGlobals();

    const john = await root('/bible/john/4');

    expect(john.headings).toEqual(['John 4', 'Summary']);
    expect(john.text).toContain('Jesus meets a Samaritan woman at a well.');
    expect(john.robots).toBeNull();
  });

  it('shows the text of a chapter without an explanation', async () => {
    const data = fakeData();
    delete data.explanations['1:1:summary:en-US'];
    delete data.explanations['1:1:byline:en-US'];
    installEdgeGlobals(data);

    const genesis = await root('/bible/genesis/1');

    expect(genesis.headings).toEqual(['Genesis 1']);
    expect(genesis.text).toContain('In the beginning God created the heavens and the earth.');
    expect(genesis.robots?.getAttribute('content')).toBe('noindex');
  });

  it('carries a Jesus event: its title, passages and explanation', async () => {
    installEdgeGlobals();

    const event = await root('/jesus/event/event-baptism');

    expect(event.headings).toEqual(['The baptism of Jesus', 'Passages', 'Explanation']);
    expect([...event.element.querySelectorAll('li')].map((li) => li.textContent)).toEqual(['Matthew 3:13-17', 'Mark 1:9-11']);
    expect(event.text).toContain('Jesus comes from Nazareth to the Jordan');
  });

  it('shows the title and passages of a topic without an explanation, and declares noindex', async () => {
    installEdgeGlobals();

    const topic = await root('/topic/events/the-fall-of-man');

    expect(topic.headings).toEqual(['The Fall of Man', 'Passages']);
    expect(topic.text).toContain('Genesis 3:1-7');
    expect(topic.robots?.getAttribute('content')).toBe('noindex');
  });

  it('escapes markup that arrives in API text', async () => {
    const data = fakeData();
    data.explanations['43:3:summary:en-US'] = '## Overview\nA <script>alert(1)</script> <img src=x onerror=alert(1)> line.';
    installEdgeGlobals(data);

    const john = await root('/bible/john/3');

    expect(john.element.querySelector('script, img')).toBeNull();
    expect(john.text).toContain('A <script>alert(1)</script> <img src=x onerror=alert(1)> line.');
  });
});

function bible(books: { b: number; n: string; c: number }[]) {
  const data = fakeData({ books });
  for (const book of books) {
    for (let chapter = 1; chapter <= book.c; chapter++) {
      data.verses[`${book.b}:${chapter}`] ??= [{ verseNumber: 1, text: `${book.n} ${chapter}, verse 1.` }];
    }
  }
  return data;
}

const NEW_TESTAMENT_SLICE = [
  { b: 1, n: 'Genesis', c: 50 },
  { b: 44, n: 'Acts', c: 28 },
  { b: 45, n: 'Romans', c: 16 },
  { b: 46, n: '1 Corinthians', c: 16 },
  { b: 66, n: 'Revelation', c: 22 },
];

function links(element: Element) {
  return [...element.querySelectorAll('nav a')].map((a) => `${a.textContent} -> ${a.getAttribute('href')}`);
}

function chapterLinks(element: Element) {
  return [...element.querySelectorAll('nav a[rel="prev"], nav a[rel="next"]')].map((a) => a.getAttribute('href'));
}

const LLMS = ['https://app.versemate.org/llms.txt', 'https://versemate.org/llms.txt'];

describe('the navigation block of the server-rendered article', () => {
  it('links Romans 12 to Romans 11 and 13, the book page and both llms.txt files, naming each target', async () => {
    installEdgeGlobals(bible(NEW_TESTAMENT_SLICE));

    const romans = await root('/bible/romans/12');

    expect(links(romans.element)).toEqual([
      'Previous chapter: Romans 11 -> /bible/romans/11',
      'Next chapter: Romans 13 -> /bible/romans/13',
      'All chapters of Romans -> https://versemate.org/bible/romans/',
      'app.versemate.org/llms.txt -> https://app.versemate.org/llms.txt',
      'versemate.org/llms.txt -> https://versemate.org/llms.txt',
    ]);
    expect(romans.element.querySelector('nav')?.textContent).toContain('For AI assistants:');
    expect(romans.element.querySelector('script')).toBeNull();
  });

  it('crosses book boundaries, and stops at the first and last chapter of the Bible', async () => {
    installEdgeGlobals(bible(NEW_TESTAMENT_SLICE));

    expect(chapterLinks((await root('/bible/romans/16')).element)).toEqual(['/bible/romans/15', '/bible/1-corinthians/1']);
    expect(chapterLinks((await root('/bible/romans/1')).element)).toEqual(['/bible/acts/28', '/bible/romans/2']);
    const genesis = (await root('/bible/genesis/1')).element;
    expect(genesis.querySelector('a[rel="prev"]')).toBeNull();
    expect(genesis.querySelector('a[rel="next"]')?.getAttribute('href')).toBe('/bible/genesis/2');
    const revelation = (await root('/bible/revelation/22')).element;
    expect(revelation.querySelector('a[rel="next"]')).toBeNull();
    expect(revelation.querySelector('a[rel="prev"]')?.getAttribute('href')).toBe('/bible/revelation/21');
  });

  it('keeps a supported language in the chapter links and in the text, and the English book page', async () => {
    installEdgeGlobals(bible(NEW_TESTAMENT_SLICE));

    const romans = await root('/bible/romans/12?lang=pt-BR');

    expect(links(romans.element).slice(0, 3)).toEqual([
      'Capítulo anterior: Romans 11 -> /bible/romans/11?lang=pt-BR',
      'Próximo capítulo: Romans 13 -> /bible/romans/13?lang=pt-BR',
      'Todos os capítulos de Romans -> https://versemate.org/bible/romans/',
    ]);
  });

  it('gives the English page links with no lang for lang=en-US and for an unknown language', async () => {
    installEdgeGlobals(bible(NEW_TESTAMENT_SLICE));

    for (const query of ['?lang=en-US', '?lang=zz', '?lang=%22%3E%3Cscript%3E']) {
      expect(chapterLinks((await root(`/bible/romans/12${query}`)).element), query).toEqual(['/bible/romans/11', '/bible/romans/13']);
    }
  });

  it('links the neighbours of a noindex page in an unpublished language', async () => {
    installEdgeGlobals(bible(NEW_TESTAMENT_SLICE));

    const russian = await root('/bible/romans/12?lang=ru');

    expect(russian.robots?.getAttribute('content')).toBe('noindex');
    expect(chapterLinks(russian.element)).toEqual(['/bible/romans/11?lang=ru', '/bible/romans/13?lang=ru']);
  });

  it('visits every chapter once when "next" is followed from Genesis 1', async () => {
    const data = fakeData();
    installEdgeGlobals(bible(data.books));
    const total = data.books.reduce((sum, book) => sum + book.c, 0);

    const visited: string[] = [];
    let path: string | null | undefined = '/bible/genesis/1';
    while (path) {
      visited.push(path);
      path = (await root(path)).element.querySelector('a[rel="next"]')?.getAttribute('href');
    }

    expect(visited).toHaveLength(total);
    expect(new Set(visited).size).toBe(total);
    expect(visited.at(-1)).toBe('/bible/john/21');
  });

  it('gives a Jesus event and a topic the two llms.txt links and no chapter links', async () => {
    installEdgeGlobals();

    for (const path of ['/jesus/event/event-baptism', '/topic/events/the-creation-of-the-world']) {
      const page = await root(path);
      expect([...page.element.querySelectorAll('nav a')].map((a) => a.getAttribute('href')), path).toEqual(LLMS);
      expect(page.element.querySelector('a[rel="prev"], a[rel="next"]'), path).toBeNull();
    }
  });

  it('is absent from the bare page served when the content cannot be read, and from the 404 of a chapter that does not exist', async () => {
    installEdgeGlobals(fakeData({ down: true }));
    const down = await root('/bible/john/3');
    expect(down.element.innerHTML).toBe('');

    installEdgeGlobals();
    const response = await worker.fetch(new Request('https://app.versemate.org/bible/john/999'), edgeEnv(), context());
    expect(response.status).toBe(404);
    expect(new JSDOM(await response.text()).window.document.querySelector('a')).toBeNull();
  });
});
