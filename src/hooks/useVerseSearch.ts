import { useCallback, useEffect, useRef, useState } from 'react';
import { searchVerses, type VerseSearchResponse, type VerseSearchResult } from '@/services/bibleService';
import { analytics } from '@/lib/analytics';

const DEBOUNCE_MS = 250;
/** Fewer letters than this is not worth a request ("a", "I"). */
const MIN_LETTERS = 2;

export interface VerseSearchFilters {
  testament?: 'OT' | 'NT';
  book?: number;
}

export interface VerseSearchState {
  status: 'idle' | 'loading' | 'done' | 'error';
  results: VerseSearchResult[];
  totals: VerseSearchResponse['totals'];
  books: VerseSearchResponse['books'];
  nextCursor: string | null;
  loadingMore: boolean;
}

const IDLE: VerseSearchState = {
  status: 'idle',
  results: [],
  totals: null,
  books: null,
  nextCursor: null,
  loadingMore: false,
};

export function isVerseSearchable(query: string): boolean {
  return (query.match(/[\p{L}\p{N}]/gu) ?? []).length >= MIN_LETTERS;
}

/**
 * Search-as-you-type over verse text. Waits for a 250 ms typing pause, and
 * cancels the previous request when a new one starts, so a slow answer for
 * "east and" can never overwrite the one for "east and west". The filters
 * reset whenever the text changes.
 */
export function useVerseSearch(query: string, version: string, enabled: boolean) {
  const [filters, setFilters] = useState<VerseSearchFilters>({});
  const [state, setState] = useState<VerseSearchState>(IDLE);
  const controllerRef = useRef<AbortController | null>(null);
  // Identifies the search the current state belongs to; a response for any
  // other key is stale and dropped.
  const keyRef = useRef('');

  const trimmed = query.trim();
  const active = enabled && isVerseSearchable(trimmed);

  useEffect(() => {
    setFilters({});
  }, [trimmed]);

  useEffect(() => {
    controllerRef.current?.abort();
    if (!active) {
      keyRef.current = '';
      setState(IDLE);
      return;
    }
    const key = JSON.stringify([version, query, filters]);
    keyRef.current = key;
    setState(s => ({ ...s, status: 'loading' }));
    const controller = new AbortController();
    controllerRef.current = controller;
    const timer = setTimeout(() => {
      // Send the raw text, not the trimmed one: a trailing space tells the
      // server the last word is finished (no prefix match).
      searchVerses({ q: query, version, ...filters, signal: controller.signal })
        .then(data => {
          if (keyRef.current !== key) return;
          setState({
            status: 'done',
            results: data.results,
            totals: data.totals,
            books: data.books,
            nextCursor: data.nextCursor,
            loadingMore: false,
          });
          if (!filters.testament && !filters.book) {
            const total = (data.totals?.exact ?? 0) + (data.totals?.words ?? 0);
            // Counts only, never the search text (open question 4 of the
            // search plan: raw queries stay out of analytics until decided).
            analytics.track(total === 0 ? 'bible_search_no_results' : 'bible_search', {
              version,
              word_count: trimmed.split(/\s+/).length,
              exact_count: data.totals?.exact ?? 0,
              words_count: data.totals?.words ?? 0,
            });
          }
        })
        .catch(() => {
          if (keyRef.current !== key || controller.signal.aborted) return;
          setState(s => ({ ...s, status: 'error', loadingMore: false }));
        });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // `trimmed` is derived from `query`; listing it would re-run for nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, query, version, filters]);

  const loadMore = useCallback(() => {
    const cursor = state.nextCursor;
    if (!cursor || state.loadingMore) return;
    const key = keyRef.current;
    setState(s => ({ ...s, loadingMore: true }));
    searchVerses({ q: query, version, ...filters, cursor })
      .then(data => {
        if (keyRef.current !== key) return;
        setState(s => ({
          ...s,
          results: [...s.results, ...data.results],
          nextCursor: data.nextCursor,
          loadingMore: false,
        }));
      })
      .catch(() => {
        if (keyRef.current !== key) return;
        setState(s => ({ ...s, loadingMore: false }));
      });
  }, [state.nextCursor, state.loadingMore, query, version, filters]);

  return { ...state, active, filters, setFilters, loadMore };
}
