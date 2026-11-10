import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_FETCH = global.fetch;
let urls: URL[] = [];

beforeEach(() => {
  urls = [];
  localStorage.clear();
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    urls.push(new URL(input instanceof Request ? input.url : input.toString()));
    return new Response(JSON.stringify({ event: { slug: 'x' }, topic: null, references: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof global.fetch;
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
});

async function openPage(path: string) {
  vi.resetModules();
  window.history.replaceState(null, '', path);
  return {
    jesus: await import('./jesusService'),
    bible: await import('./bibleService'),
  };
}

const langOf = (pathPart: string) =>
  urls.filter((url) => url.pathname.endsWith(pathPart)).map((url) => url.searchParams.get('lang'));

describe('the URL language reaches Jesus and topic content', () => {
  it('asks for a Jesus event in the URL language', async () => {
    const { jesus } = await openPage('/jesus/event/x?lang=es-MX');

    await jesus.fetchJesusEvent('x', 'NASB1995');

    expect(langOf('/jesus/events/x')).toEqual(['es-MX']);
  });

  it('asks for a topic in the URL language', async () => {
    const { bible } = await openPage('/topic/events/x?lang=pt-BR');

    await bible.fetchTopicDetails('7', 'NASB1995');

    expect(langOf('/topics/7')).toEqual(['pt-BR']);
  });

  it('sends no language when the URL has none, as before', async () => {
    localStorage.setItem('@versemate:preferred_language', 'es-MX');
    const { jesus, bible } = await openPage('/jesus/event/x');

    await jesus.fetchJesusEvent('x', 'NASB1995');
    await bible.fetchTopicDetails('7', 'NASB1995');

    expect([...langOf('/jesus/events/x'), ...langOf('/topics/7')].every((lang) => lang === null)).toBe(true);
  });
});
