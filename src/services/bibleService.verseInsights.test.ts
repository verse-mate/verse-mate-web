import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as apiModule from '@/services/api';
import { fetchVerseInsights } from '@/services/bibleService';

vi.mock('@/services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/api')>();
  return { ...actual, api: { ...actual.api, get: vi.fn() } };
});

const get = vi.mocked(apiModule.api.get);

/** Answer the explanation endpoint with the given text per type. */
function explanations(byType: Record<string, string>) {
  get.mockImplementation(async (_path: string, query?: Record<string, unknown>) => ({
    explanation: { explanation: byType[String(query?.explanationType)] ?? '', explanation_id: 7 },
  }));
}

describe('fetchVerseInsights', () => {
  beforeEach(() => get.mockReset());

  it('splits the By Line explanation into one insight per verse', async () => {
    explanations({
      byline: '## Psalms 23:1\n> The Lord is my shepherd\nCare.\n## Psalms 23:2\nRest.',
      summary: 'Summary.',
    });
    const insights = await fetchVerseInsights('Psalms', 23, 19);
    expect(insights.map(i => i.verse)).toEqual([1, 2]);
  });

  it('falls back to the summary TEXT when a chapter has no By Line explanation', async () => {
    explanations({ byline: '', summary: 'David calls God his shepherd (John 10:11).' });
    const insights = await fetchVerseInsights('Psalms', 22, 19);
    expect(insights).toHaveLength(1);
    expect(insights[0].historicalContext).toBe('David calls God his shepherd (John 10:11).');
  });

  it('returns no insight when there is neither a By Line nor a summary', async () => {
    explanations({});
    expect(await fetchVerseInsights('Psalms', 21, 19)).toEqual([]);
  });
});
