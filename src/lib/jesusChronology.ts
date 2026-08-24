/**
 * The single ordered walk through Jesus' life.
 *
 * `GET /jesus/events/life` returns the arc as periods, each holding its own
 * events in sequence — the shape "Follow His Life" renders. Paging through
 * events one at a time needs that same arc flattened into one list, so the
 * last event of a period is followed by the first of the next rather than
 * dead-ending at a period boundary.
 *
 * Kept here rather than in the screen so both the flattening and the
 * neighbour lookup are testable without a router or a network.
 */

import type { JesusEventLifePeriod } from '@/services/types';

/** The minimum a pager needs: where to go and what to call it. */
export interface JesusChronologyEntry {
  slug: string;
  title: string;
  periodName: string | null;
}

/**
 * Periods in `sort_order`, events in the order the period lists them.
 *
 * An event catalogued under two periods would otherwise appear twice and make
 * "next" walk backwards, so the first occurrence wins.
 */
export function flattenJesusChronology(
  periods: JesusEventLifePeriod[],
): JesusChronologyEntry[] {
  const ordered = [...periods].sort((a, b) => a.sort_order - b.sort_order);
  const seen = new Set<string>();
  const flat: JesusChronologyEntry[] = [];

  for (const period of ordered) {
    for (const event of period.events ?? []) {
      if (!event.slug || seen.has(event.slug)) continue;
      seen.add(event.slug);
      flat.push({
        slug: event.slug,
        title: event.title,
        periodName: event.period_name ?? period.name ?? null,
      });
    }
  }

  return flat;
}

/**
 * The events either side of `slug`.
 *
 * Both ends are `null` at the ends of the arc — the chronology doesn't wrap,
 * because a swipe past the resurrection landing on the nativity would read as
 * a bug rather than a loop.
 */
export function adjacentJesusEvents(
  chronology: JesusChronologyEntry[],
  slug: string | undefined,
): { prev: JesusChronologyEntry | null; next: JesusChronologyEntry | null } {
  if (!slug) return { prev: null, next: null };
  const i = chronology.findIndex((e) => e.slug === slug);
  // An event reached from a theme or a search may not be on the arc at all;
  // it simply has no neighbours rather than borrowing the list's first two.
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? chronology[i - 1] : null,
    next: i < chronology.length - 1 ? chronology[i + 1] : null,
  };
}
