import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchTopicIndex, fetchTopics } from './bibleService';

const events = Array.from({ length: 94 }, (_, i) => ({ topic_id: `e${i}`, name: `Event ${i}`, description: null, sort_order: i }));
let failing = '';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

beforeEach(() => {
  failing = '';
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: Request) => {
      const url = new URL(input.url);
      if (url.pathname === '/topics/categories') return json({ categories: ['EVENT', 'THEME'] });
      if (url.pathname === '/topics/search') {
        const category = url.searchParams.get('category');
        if (category === failing) return json({ error: 'INTERNAL', message: 'search failed' }, 500);
        return json({ topics: category === 'EVENT' ? events : [] });
      }
      return json({ message: 'not found' }, 404);
    }),
  );
});

afterEach(() => vi.unstubAllGlobals());

describe('fetchTopics', () => {
  it('returns every topic of a category the search answers with', async () => {
    const topics = await fetchTopics();
    expect(topics).toHaveLength(94);
    expect(topics.at(-1)?.name).toBe('Event 93');
  });
});

describe('fetchTopicIndex', () => {
  it('returns the full list when every category loads', async () => {
    expect(await fetchTopicIndex()).toHaveLength(94);
  });

  it('returns null when one category could not be loaded', async () => {
    failing = 'THEME';
    expect(await fetchTopicIndex()).toBeNull();
  });
});
