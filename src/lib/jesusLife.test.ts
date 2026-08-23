import { describe, expect, it } from 'vitest';
import type { JesusEventCard } from '@/services/types';
import { jesusPeriodWeight, pluralize, summarizeJesusPeriod } from './jesusLife';

function event(overrides: Partial<JesusEventCard> = {}): JesusEventCard {
  return {
    slug: 'an-event',
    title: 'An event',
    summary: null,
    period_slug: 'passion-week',
    period_name: 'Passion Week',
    sequence: 1,
    chronology_confidence: 'high',
    parallel_confidence: 'high',
    gospels: [],
    passages: [],
    facet_counts: { words: 0, actions: 0, by_type: {} },
    matched_facets: [],
    themes: [],
    ...overrides,
  };
}

function passage(bookId: number) {
  return {
    book_id: bookId,
    book_name: 'Book',
    chapter: 1,
    verse_start: null,
    verse_end: null,
    is_primary: true,
    display: 'Book 1',
  };
}

describe('summarizeJesusPeriod', () => {
  it('sums the facet counts across a period', () => {
    const stats = summarizeJesusPeriod([
      event({ facet_counts: { words: 3, actions: 1, by_type: {} } }),
      event({ slug: 'b', facet_counts: { words: 2, actions: 4, by_type: {} } }),
    ]);

    expect(stats.events).toBe(2);
    expect(stats.words).toBe(5);
    expect(stats.actions).toBe(5);
  });

  it('reports gospel coverage in canonical order, matched on book id', () => {
    const stats = summarizeJesusPeriod([
      event({ passages: [passage(43)] }),
      event({ slug: 'b', passages: [passage(40), passage(42)] }),
    ]);

    expect(stats.gospels.map((g) => g.short)).toEqual(['Mt', 'Lk', 'Jn']);
  });

  it('counts an event as harmonized only when more than one gospel records it', () => {
    const stats = summarizeJesusPeriod([
      event({ passages: [passage(40), passage(41)] }),
      // Two passages, one gospel — the same account continued, not a parallel.
      event({ slug: 'b', passages: [passage(42), passage(42)] }),
    ]);

    expect(stats.harmonized).toBe(1);
  });

  it('counts events whose chronological placement is not stated as certain', () => {
    const stats = summarizeJesusPeriod([
      event({ chronology_confidence: 'high' }),
      event({ slug: 'b', chronology_confidence: 'medium' }),
      event({ slug: 'c', chronology_confidence: 'low' }),
    ]);

    expect(stats.unsettled).toBe(2);
  });

  it('ranks themes by how often the period returns to them', () => {
    const kingdom = { slug: 'kingdom', name: 'Kingdom' };
    const faith = { slug: 'faith', name: 'Faith' };
    const stats = summarizeJesusPeriod([
      event({ themes: [kingdom, faith] }),
      event({ slug: 'b', themes: [kingdom] }),
    ]);

    expect(stats.themes).toEqual([
      { slug: 'kingdom', name: 'Kingdom', count: 2 },
      { slug: 'faith', name: 'Faith', count: 1 },
    ]);
  });

  it('handles a period with nothing catalogued', () => {
    const stats = summarizeJesusPeriod([]);

    expect(stats).toEqual({
      events: 0,
      words: 0,
      actions: 0,
      gospels: [],
      harmonized: 0,
      unsettled: 0,
      themes: [],
    });
  });
});

describe('jesusPeriodWeight', () => {
  it('scales against the busiest period, not the total', () => {
    expect(jesusPeriodWeight(50, [1, 10, 50])).toBe(1);
    expect(jesusPeriodWeight(10, [1, 10, 50])).toBe(0.2);
  });

  it('is zero when nothing is catalogued anywhere', () => {
    expect(jesusPeriodWeight(0, [0, 0])).toBe(0);
    expect(jesusPeriodWeight(0, [])).toBe(0);
  });
});

describe('pluralize', () => {
  it('picks the plural for everything but one', () => {
    expect(pluralize(1, 'event')).toBe('1 event');
    expect(pluralize(0, 'event')).toBe('0 events');
    expect(pluralize(3, 'event')).toBe('3 events');
  });
});
