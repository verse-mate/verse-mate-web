import { beforeEach, describe, expect, it, vi } from 'vitest';

const events = Array.from({ length: 94 }, (_, i) => ({ topic_id: `e${i}`, name: `Event ${i}`, category: 'EVENT' }));
const failing = vi.hoisted(() => ({ category: '' }));

vi.mock('./api', () => ({
  api: {
    get: async (path: string, params?: { category?: string; limit?: number }) => {
      if (path === '/topics/categories') return { categories: ['EVENT', 'THEME'] };
      if (path === '/topics/search') {
        if (params?.category === failing.category) throw new Error('search failed');
        return { topics: params?.category === 'EVENT' ? events.slice(0, params?.limit ?? 20) : [] };
      }
      throw new Error(`unexpected ${path}`);
    },
  },
}));

beforeEach(() => {
  failing.category = '';
});

describe('fetchTopics', () => {
  it('returns every topic of a category, past the first 50', async () => {
    const { fetchTopics } = await import('./bibleService');

    const topics = await fetchTopics();

    expect(topics).toHaveLength(94);
    expect(topics.at(-1)?.name).toBe('Event 93');
  });
});

describe('fetchTopicIndex', () => {
  it('returns the full list when every category loads', async () => {
    const { fetchTopicIndex } = await import('./bibleService');

    expect(await fetchTopicIndex()).toHaveLength(94);
  });

  it('returns null when one category could not be loaded', async () => {
    failing.category = 'THEME';
    const { fetchTopicIndex } = await import('./bibleService');

    expect(await fetchTopicIndex()).toBeNull();
  });
});
