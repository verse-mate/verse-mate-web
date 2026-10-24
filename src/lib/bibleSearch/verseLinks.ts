import { getBookSlug } from '@/lib/bookSlugs';

/**
 * Links that open the reader at a verse: /bible/<book>/<chapter>?v=11
 * (or ?v=5-6 for a range). With `insight`, the link also opens Verse Insight
 * on the first verse (&insight=1) — search results use it so one click lands
 * on the verse with its explanation open, and a shared link does the same.
 */
export function buildVerseUrl(
  bookId: number,
  chapter: number,
  verse?: { start: number; end?: number; insight?: boolean },
): string | null {
  const slug = getBookSlug(bookId);
  if (!slug) return null;
  const path = `/bible/${slug}/${chapter}`;
  if (!verse) return path;
  const params = new URLSearchParams();
  params.set('v', verse.end && verse.end > verse.start ? `${verse.start}-${verse.end}` : `${verse.start}`);
  if (verse.insight) params.set('insight', '1');
  return `${path}?${params.toString()}`;
}

export interface VerseTarget {
  start: number;
  end: number;
  insight: boolean;
}

/** Reads `?v=` / `&insight=1` from a location.search string. */
export function parseVerseTarget(search: string): VerseTarget | null {
  const params = new URLSearchParams(search);
  const m = (params.get('v') ?? '').match(/^(\d{1,3})(?:-(\d{1,3}))?$/);
  if (!m) return null;
  const start = Number(m[1]);
  const end = m[2] ? Number(m[2]) : start;
  if (start < 1 || end < start) return null;
  return { start, end, insight: params.get('insight') === '1' };
}
