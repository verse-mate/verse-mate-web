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
