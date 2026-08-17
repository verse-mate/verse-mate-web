import type { Commentary, JesusEventPassage } from '@/services/types';

/**
 * Assemble the By-Line rows for a Jesus event out of the chapter commentary
 * the Bible side already has.
 *
 * There is no event-scoped byline content and there doesn't need to be: the
 * commentary API is keyed by (book, chapter, verse), and an event knows the
 * verses it spans. Filtering the chapter's rows to that span gives a real
 * line-by-line reading of the pericope today, without waiting on generation.
 *
 * A passage with a null `verse_start` covers the whole chapter, which is why
 * the range test treats null as unbounded rather than as verse 0.
 */

export interface JesusBylineRow {
  verse: number;
  /** "Mark 4:39" — what the toggle row shows. */
  reference: string;
  /** The verse text, when the passage was hydrated with scripture. */
  text: string | null;
  detail: string;
}

function covers(passage: JesusEventPassage, verse: number): boolean {
  if (passage.verse_start == null) return true;
  if (verse < passage.verse_start) return false;
  if (passage.verse_end == null) return verse === passage.verse_start;
  return verse <= passage.verse_end;
}

/**
 * @param passage  the account being read in the left column
 * @param commentaries  the whole chapter's rows, straight from `fetchCommentary`
 */
export function buildJesusByline(
  passage: JesusEventPassage | null,
  commentaries: Commentary[],
): JesusBylineRow[] {
  if (!passage) return [];

  const textByVerse = new Map<number, string>();
  for (const v of passage.verses ?? []) textByVerse.set(v.verse_number, v.text);

  return commentaries
    .filter((c) => c.type === 'byline' && c.verse > 0 && covers(passage, c.verse))
    .sort((a, b) => a.verse - b.verse)
    .map((c) => ({
      verse: c.verse,
      reference: `${passage.book_name} ${passage.chapter}:${c.verse}`,
      text: textByVerse.get(c.verse) ?? null,
      detail: c.detail,
    }));
}

/**
 * The byline API's `detail` opens with a verse-ref heading and a blockquote of
 * the verse text before the commentary proper. We render both ourselves, so
 * strip them here to stop the verse appearing twice.
 *
 * Mirrors `stripBylineHeader` in DesktopLayout — kept as its own export so the
 * Jesus path doesn't reach into that component.
 */
export function stripBylineHeader(text: string): string {
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i++;
  if (i < lines.length && /^#+\s/.test(lines[i].trim())) i++;
  while (i < lines.length && !lines[i].trim()) i++;
  while (i < lines.length && /^>/.test(lines[i].trim())) i++;
  while (i < lines.length && !lines[i].trim()) i++;
  if (i < lines.length && /^#+\s*summary\s*$/i.test(lines[i].trim())) {
    i++;
    while (i < lines.length && !lines[i].trim()) i++;
  }
  return lines.slice(i).join('\n').trim();
}
