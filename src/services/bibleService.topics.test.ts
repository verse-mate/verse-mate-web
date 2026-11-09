import { describe, expect, it, vi } from 'vitest';

const events = Array.from({ length: 94 }, (_, i) => ({ topic_id: `e${i}`, name: `Event ${i}`, category: 'EVENT' }));

vi.mock('./api', () => ({
  api: {
    get: async (path: string, params?: { category?: string; limit?: number }) => {
      if (path === '/topics/categories') return { categories: ['EVENT'] };
      if (path === '/topics/search') return { topics: events.slice(0, params?.limit ?? 20) };
      throw new Error(`unexpected ${path}`);
    },
  },
}));

describe('fetchTopics', () => {
  it('returns every topic of a category, past the first 50', async () => {
    const { fetchTopics } = await import('./bibleService');

    const topics = await fetchTopics();

    expect(topics).toHaveLength(94);
    expect(topics.at(-1)?.name).toBe('Event 93');
  });
});
