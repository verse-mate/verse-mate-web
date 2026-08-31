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
 * An event usually spans more than one passage — the same episode as Matthew,
 * Mark and Luke each tell it — and every one of those accounts is scripture the
 * left column prints. So the tab is built per passage and every passage gets a
 * section, including the accounts whose chapter has no byline generated yet:
 * an account that is silently absent reads as "this verse has no explanation",
 * which is a different claim from "it hasn't been written".
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
  /** Stable across accounts: verse numbers repeat between chapters. */
  key: string;
}

/** One account's worth of rows, in the order the left column prints them. */
export interface JesusBylineSection {
  /** "Mark 1:14-15" — the account's own reference. */
  display: string;
  passage: JesusEventPassage;
  rows: JesusBylineRow[];
}

function covers(passage: JesusEventPassage, verse: number): boolean {
  if (passage.verse_start == null) return true;
  if (verse < passage.verse_start) return false;
  if (passage.verse_end == null) return verse === passage.verse_start;
  return verse <= passage.verse_end;
}

/**
 * The chapter a passage's commentary is fetched under. Two accounts of one
 * event can share a chapter (Mark 1:14-15 and Mark 1:16-20), so this is what
 * keeps the tab from fetching the same chapter twice.
 */
export function bylineChapterKey(passage: {
  book_id: number;
  chapter: number;
}): string {
  return `${passage.book_id}:${passage.chapter}`;
}

/** The distinct chapters an event's passages span, in passage order. */
export function bylineChapters(
  passages: JesusEventPassage[],
): { key: string; book_id: number; book_name: string; chapter: number }[] {
  const seen = new Set<string>();
  const chapters: {
    key: string;
    book_id: number;
    book_name: string;
    chapter: number;
  }[] = [];
  for (const p of passages) {
    const key = bylineChapterKey(p);
    if (seen.has(key)) continue;
    seen.add(key);
    chapters.push({
      key,
      book_id: p.book_id,
      book_name: p.book_name,
      chapter: p.chapter,
    });
  }
  return chapters;
}

/**
 * @param passage  the account being read
 * @param commentaries  the whole chapter's rows, straight from `fetchCommentary`
 * @param taken  verse keys already rendered by an earlier account, so two
 *   passages that overlap inside one chapter don't print the same verse twice
 */
export function buildJesusByline(
  passage: JesusEventPassage | null,
  commentaries: Commentary[],
  taken?: Set<string>,
): JesusBylineRow[] {
  if (!passage) return [];

  const textByVerse = new Map<number, string>();
  for (const v of passage.verses ?? []) textByVerse.set(v.verse_number, v.text);

  return commentaries
    .filter((c) => c.type === 'byline' && c.verse > 0 && covers(passage, c.verse))
    .sort((a, b) => a.verse - b.verse)
    .map((c) => ({
      verse: c.verse,
      key: `${bylineChapterKey(passage)}:${c.verse}`,
      reference: `${passage.book_name} ${passage.chapter}:${c.verse}`,
      text: textByVerse.get(c.verse) ?? null,
      detail: c.detail,
    }))
    .filter((row) => {
      if (!taken) return true;
      if (taken.has(row.key)) return false;
      taken.add(row.key);
      return true;
    });
}

/**
 * Every account of the event, each with the byline rows for its own verses.
 *
 * Sections come back for passages with no rows too — the caller says so on
 * screen rather than dropping the account, so a reader looking for Mark's
 * telling learns it is ungenerated instead of finding nothing.
 *
 * @param commentariesByChapter  keyed by `bylineChapterKey`
 */
export function buildJesusBylineSections(
  passages: JesusEventPassage[],
  commentariesByChapter: Map<string, Commentary[]>,
): JesusBylineSection[] {
  const taken = new Set<string>();
  return passages.map((passage) => ({
    display: passage.display,
    passage,
    rows: buildJesusByline(
      passage,
      commentariesByChapter.get(bylineChapterKey(passage)) ?? [],
      taken,
    ),
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
