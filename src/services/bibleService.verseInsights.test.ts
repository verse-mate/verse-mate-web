import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchVerseInsights } from '@/services/bibleService';

const ORIGINAL_FETCH = global.fetch;

function explanations(byType: Record<string, string>) {
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    const text = byType[String(url.searchParams.get('explanationType'))] ?? '';
    return new Response(JSON.stringify({ explanation: { explanation: text, explanation_id: 7 } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof global.fetch;
}

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
});

describe('fetchVerseInsights', () => {
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
