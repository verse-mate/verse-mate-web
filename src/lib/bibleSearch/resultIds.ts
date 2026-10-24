import type { VerseSearchResult } from '@/services/bibleService';

/** DOM id of a verse result row, for aria-activedescendant. */
export const verseOptionId = (r: VerseSearchResult) =>
  `verse-result-${r.bookId}-${r.chapter}-${r.verse}`;

export const LOAD_MORE_OPTION_ID = 'verse-results-load-more';
