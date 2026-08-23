/**
 * Derived facts for "Follow His Life".
 *
 * `GET /jesus/events/life` already returns every period with all of its event
 * cards, so the timeline can say a great deal more about a stretch of the
 * ministry than "N events" without a second request. These helpers fold that
 * payload down to the handful of numbers the period cards render — kept pure
 * and out of the component so they can be unit tested and so two screens can
 * agree on what "harmonized" or "unsettled" means.
 */

import type { JesusEventCard, JesusThemeRef } from '@/services/types';

export interface JesusGospel {
  bookId: number;
  name: string;
  /** Two-letter form used in the coverage strip, where space is the constraint. */
  short: string;
}

/**
 * The four accounts, in canonical order. Matched on `book_id` rather than
 * `book_name` because the API returns book names in the reader's language.
 */
export const JESUS_GOSPELS: JesusGospel[] = [
  { bookId: 40, name: 'Matthew', short: 'Mt' },
  { bookId: 41, name: 'Mark', short: 'Mk' },
  { bookId: 42, name: 'Luke', short: 'Lk' },
  { bookId: 43, name: 'John', short: 'Jn' },
];

export interface JesusPeriodTheme extends JesusThemeRef {
  count: number;
}

export interface JesusPeriodStats {
  events: number;
  /** Sayings catalogued across the period's events. */
  words: number;
  /** Deeds catalogued across the period's events. */
  actions: number;
  /** Gospels carrying at least one passage here, in canonical order. */
  gospels: JesusGospel[];
  /** Events more than one gospel records — the ones Compare has work to do on. */
  harmonized: number;
  /** Events whose chronological placement the corpus does not call certain. */
  unsettled: number;
  /** What this stretch keeps returning to, most frequent first. */
  themes: JesusPeriodTheme[];
}

/** Fold a period's event cards down to the numbers its card renders. */
export function summarizeJesusPeriod(events: JesusEventCard[]): JesusPeriodStats {
  const gospelIds = new Set<number>();
  const themes = new Map<string, JesusPeriodTheme>();
  let words = 0;
  let actions = 0;
  let harmonized = 0;
  let unsettled = 0;

  for (const event of events) {
    words += event.facet_counts?.words ?? 0;
    actions += event.facet_counts?.actions ?? 0;

    const own = new Set<number>();
    for (const passage of event.passages ?? []) {
      gospelIds.add(passage.book_id);
      own.add(passage.book_id);
    }
    if (own.size > 1) harmonized += 1;
    if (event.chronology_confidence !== 'high') unsettled += 1;

    for (const theme of event.themes ?? []) {
      const seen = themes.get(theme.slug);
      if (seen) seen.count += 1;
      else themes.set(theme.slug, { ...theme, count: 1 });
    }
  }

  return {
    events: events.length,
    words,
    actions,
    gospels: JESUS_GOSPELS.filter((g) => gospelIds.has(g.bookId)),
    harmonized,
    unsettled,
    themes: [...themes.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  };
}

/**
 * How much of the record a period holds, as a 0–1 fraction of the busiest one.
 *
 * Relative to the busiest period rather than to the total, because the point of
 * the bar is comparison between stretches: the Galilean ministry dwarfs the
 * hidden years, and a share-of-total scale would flatten every other period to
 * an indistinguishable sliver.
 */
export function jesusPeriodWeight(count: number, counts: number[]): number {
  const max = Math.max(0, ...counts);
  if (max <= 0) return 0;
  return count / max;
}

/** One-line English for a count, so callers don't repeat the plural check. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
