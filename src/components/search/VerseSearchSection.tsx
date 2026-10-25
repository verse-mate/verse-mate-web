import { Fragment } from 'react';
import type { VerseSearchResult } from '@/services/bibleService';
import type { VerseSearchFilters, VerseSearchState } from '@/hooks/useVerseSearch';
import { LOAD_MORE_OPTION_ID, verseOptionId } from '@/lib/bibleSearch/resultIds';

/** The verse text with the matched words in bold. */
function HighlightedText({ text, ranges }: { text: string; ranges: [number, number][] }) {
  if (ranges.length === 0) return <>{text}</>;
  const parts: JSX.Element[] = [];
  let at = 0;
  ranges.forEach(([start, end], i) => {
    if (start < at || end > text.length) return;
    if (start > at) parts.push(<Fragment key={`t${i}`}>{text.slice(at, start)}</Fragment>);
    parts.push(
      <strong key={`m${i}`} className="font-semibold text-foreground">
        {text.slice(start, end)}
      </strong>,
    );
    at = end;
  });
  if (at < text.length) parts.push(<Fragment key="tail">{text.slice(at)}</Fragment>);
  return <>{parts}</>;
}

interface Props {
  query: string;
  search: VerseSearchState & {
    filters: VerseSearchFilters;
    setFilters: (f: VerseSearchFilters) => void;
    loadMore: () => void;
  };
  activeId: string | null;
  compact?: boolean;
  onPick: (result: VerseSearchResult, index: number) => void;
}

/**
 * The "Verses" part of the Search screen: testament / book filter chips with
 * counts, then exact-phrase matches, then all-words matches, then Load more.
 * Rows are listbox options; the search field owns keyboard focus and points
 * at the active row through aria-activedescendant.
 */
export default function VerseSearchSection({ query, search, activeId, compact, onPick }: Props) {
  const { status, results, totals, books, nextCursor, loadingMore, filters, setFilters } = search;
  const total = totals ? totals.exact + totals.words : null;
  const otCount = books?.filter(b => b.testament === 'OT').reduce((n, b) => n + b.count, 0) ?? 0;
  const ntCount = books?.filter(b => b.testament === 'NT').reduce((n, b) => n + b.count, 0) ?? 0;
  const bookChips = (books ?? []).filter(b => !filters.testament || b.testament === filters.testament);
  const firstWordsIndex = results.findIndex(r => r.match === 'words');
  // One word has no "phrase": its exact matches need no header, and the
  // stemmer's matches ("loving" → love, loved) read as other forms of it.
  const singleWord = (query.match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).length === 1;
  const exactHeader = singleWord ? null : 'Exact phrase';
  const wordsHeader = singleWord ? 'Other forms of the word' : 'All words';
  const textSize = compact ? 'text-[14px] leading-[22px]' : 'text-[15px] leading-6';

  const chip = (label: string, count: number | null, selected: boolean, onClick: () => void, testId: string) => (
    <button
      type="button"
      key={testId}
      onClick={onClick}
      // Keep focus in the search field, so typing and the arrow keys keep
      // working after a mouse click on a filter. Keyboard users still reach
      // the chips with Tab.
      onMouseDown={e => e.preventDefault()}
      aria-pressed={selected}
      data-testid={testId}
      className={`shrink-0 h-8 px-3 rounded-full border text-[13px] whitespace-nowrap transition-colors ${
        selected ? 'bg-gold text-[#1A1A1A] border-transparent' : 'border-border text-foreground/80'
      }`}
    >
      {label}
      {count !== null && <span className={selected ? 'ml-1' : 'ml-1 text-muted-foreground'}>{count}</span>}
    </button>
  );

  return (
    <section aria-label="Verses" data-testid="verse-search-section">
      {/* Title, count and filters stay pinned while the results scroll.
          -top-3 / -mx-4 undo the list's own padding, so the bar pins flush
          against the search field and full width, with no strip of
          scrolling verses showing above or beside it. */}
      <div className="sticky -top-3 z-10 -mx-4 px-4 bg-background border-b border-border">
        <div className="flex items-baseline justify-between pt-4 pb-2">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70">Verses</p>
          {total !== null && total > 0 && (
            <p className="text-[12px] text-muted-foreground" data-testid="verse-search-total">
              {total} {total === 1 ? 'verse' : 'verses'}
            </p>
          )}
        </div>

        {total !== null && total > 0 && (
          <div className="flex gap-2 chip-scroll pb-3 -mx-1 px-1" data-testid="verse-search-filters">
            {chip('All', total, !filters.testament && !filters.book, () => setFilters({}), 'verse-filter-all')}
            {otCount > 0 &&
              chip('Old Testament', otCount, filters.testament === 'OT' && !filters.book, () => setFilters({ testament: 'OT' }), 'verse-filter-ot')}
            {ntCount > 0 &&
              chip('New Testament', ntCount, filters.testament === 'NT' && !filters.book, () => setFilters({ testament: 'NT' }), 'verse-filter-nt')}
            {bookChips.length > 1 &&
              bookChips.map(b =>
                chip(
                  b.name,
                  b.count,
                  filters.book === b.bookId,
                  () => setFilters(filters.book === b.bookId ? { testament: filters.testament } : { testament: filters.testament, book: b.bookId }),
                  `verse-filter-book-${b.bookId}`,
                ),
              )}
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <p className="text-center text-muted-foreground text-[14px] py-6" data-testid="verse-search-empty" aria-live="polite">
          {status === 'loading' || status === 'idle'
            ? 'Searching…'
            : status === 'error'
              ? 'Search is unavailable right now. Try again in a moment.'
              : `No verses match "${query.trim()}". Try fewer words or check the spelling.`}
        </p>
      ) : (
        <div role="group" aria-label="Verse results" data-testid="verse-search-results">
          {results.map((r, i) => {
            const id = verseOptionId(r);
            const header =
              i === 0 && r.match === 'exact'
                ? exactHeader
                : i === firstWordsIndex
                  ? wordsHeader
                  : null;
            return (
              <Fragment key={id}>
                {header && (
                  <p className="text-[11px] text-muted-foreground pt-3 pb-1" role="presentation">
                    {header}
                  </p>
                )}
                <button
                  type="button"
                  id={id}
                  role="option"
                  aria-selected={activeId === id}
                  tabIndex={-1}
                  onClick={() => onPick(r, i)}
                  data-testid={id}
                  data-match={r.match}
                  className={`block w-full text-left py-3 px-2 -mx-2 border-b border-border last:border-b-0 ${
                    activeId === id ? 'bg-secondary' : ''
                  }`}
                >
                  <span className="block text-[13px] font-medium text-gold mb-0.5">{`${r.bookName} ${r.chapter}:${r.verse}`}</span>
                  <span className={`block ${textSize} text-foreground/80`}>
                    <HighlightedText text={r.text} ranges={r.highlights} />
                  </span>
                </button>
              </Fragment>
            );
          })}
          {nextCursor && (
            <button
              type="button"
              id={LOAD_MORE_OPTION_ID}
              role="option"
              aria-selected={activeId === LOAD_MORE_OPTION_ID}
              tabIndex={-1}
              onClick={search.loadMore}
              disabled={loadingMore}
              data-testid="verse-search-load-more"
              className={`w-full py-4 text-[14px] text-gold ${activeId === LOAD_MORE_OPTION_ID ? 'bg-secondary' : ''}`}
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
