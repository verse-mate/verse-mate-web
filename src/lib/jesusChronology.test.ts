import { describe, expect, it } from 'vitest';
import { adjacentJesusEvents, flattenJesusChronology } from './jesusChronology';
import type { JesusEventCard, JesusEventLifePeriod } from '@/services/types';

function event(slug: string, title = slug): JesusEventCard {
  return {
    slug,
    title,
    summary: null,
    period_slug: null,
    period_name: null,
    sequence: null,
    chronology_confidence: 'high',
    parallel_confidence: 'high',
    gospels: [],
    passages: [],
    facet_counts: { words: 0, actions: 0, by_type: {} },
    matched_facets: [],
    themes: [],
  };
}

function period(
  slug: string,
  sortOrder: number,
  events: JesusEventCard[],
): JesusEventLifePeriod {
  return {
    slug,
    name: slug,
    subtitle: null,
    description: null,
    sort_order: sortOrder,
    event_count: events.length,
    events,
  };
}

describe('flattenJesusChronology', () => {
  it('walks periods in sort order, events in list order', () => {
    const flat = flattenJesusChronology([
      period('ministry', 2, [event('calls-the-twelve'), event('stills-the-storm')]),
      period('birth', 1, [event('nativity')]),
    ]);

    expect(flat.map((e) => e.slug)).toEqual([
      'nativity',
      'calls-the-twelve',
      'stills-the-storm',
    ]);
  });

  it('keeps only the first appearance of an event', () => {
    // A second copy later in the arc would make "next" walk backwards.
    const flat = flattenJesusChronology([
      period('birth', 1, [event('nativity')]),
      period('ministry', 2, [event('nativity'), event('stills-the-storm')]),
    ]);

    expect(flat.map((e) => e.slug)).toEqual(['nativity', 'stills-the-storm']);
  });

  it('falls back to the period name when the event carries none', () => {
    const flat = flattenJesusChronology([period('birth', 1, [event('nativity')])]);
    expect(flat[0].periodName).toBe('birth');
  });

  it('survives a period with no events', () => {
    const empty = { ...period('birth', 1, []), events: undefined } as unknown as JesusEventLifePeriod;
    expect(flattenJesusChronology([empty])).toEqual([]);
  });
});

describe('adjacentJesusEvents', () => {
  const chronology = flattenJesusChronology([
    period('arc', 1, [event('one'), event('two'), event('three')]),
  ]);

  it('finds the events either side', () => {
    const { prev, next } = adjacentJesusEvents(chronology, 'two');
    expect(prev?.slug).toBe('one');
    expect(next?.slug).toBe('three');
  });

  it('does not wrap at either end of the arc', () => {
    expect(adjacentJesusEvents(chronology, 'one').prev).toBeNull();
    expect(adjacentJesusEvents(chronology, 'three').next).toBeNull();
  });

  it('gives an off-arc or missing event no neighbours', () => {
    expect(adjacentJesusEvents(chronology, 'not-on-the-arc')).toEqual({
      prev: null,
      next: null,
    });
    expect(adjacentJesusEvents(chronology, undefined)).toEqual({ prev: null, next: null });
  });
});
