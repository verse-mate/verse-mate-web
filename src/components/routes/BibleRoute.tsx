import { useEffect, useRef, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { parseBookParam, getBookSlug } from '@/lib/bookSlugs';
import { fetchBooks } from '@/services/bibleService';
import ReadingScreen from '@/pages/ReadingScreen';

/**
 * Handles `/bible/<bookSlug>/<chapterNumber>` — the production URL shape
 * indexed in Google for app.versemate.org. Converts the slug to a book
 * name + chapter, dispatches SET_PASSAGE so AppContext is in sync, and
 * renders the same ReadingScreen Lovable's `/read` uses.
 *
 * Numeric IDs in the slug position (e.g. `/bible/1/1`) are accepted and
 * client-side redirected to the canonical slug URL (`/bible/genesis/1`)
 * so we never serve content under two URLs.
 */
export default function BibleRoute() {
  const { bookSlug, chapterNumber: chapterStr } = useParams<{
    bookSlug: string;
    chapterNumber: string;
  }>();
  const { state, dispatch } = useApp();
  const [resolved, setResolved] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Read latest state via ref to break the stale-closure cycle. The
  // URL→state sync effect below is keyed on URL params only — it must
  // NOT re-fire when state changes (e.g. via FAB tap) because that
  // closure's URL params would still be stale, leading to a state
  // revert. See issue #43.
  const stateRef = useRef(state);
  stateRef.current = state;

  const bookId = bookSlug ? parseBookParam(bookSlug) : null;
  const chapterNumber = chapterStr ? Number.parseInt(chapterStr, 10) : NaN;

  // Numeric → slug redirect: if the URL is /bible/<num>/<chapter>, send
  // the user to /bible/<slug>/<chapter>. Worker.js does this server-side
  // for direct hits, but client-side navigations land here too.
  const isNumericUrl = bookSlug ? /^\d+$/.test(bookSlug) : false;
  if (isNumericUrl && bookId) {
    const canonicalSlug = getBookSlug(bookId);
    if (canonicalSlug) {
      return <Navigate to={`/bible/${canonicalSlug}/${chapterNumber}`} replace />;
    }
  }

  useEffect(() => {
    if (!bookId || Number.isNaN(chapterNumber) || chapterNumber < 1) {
      setNotFound(true);
      return;
    }

    let cancelled = false;
    (async () => {
      const books = await fetchBooks();
      if (cancelled) return;
      const book = books.find((b) => b.bookId === bookId);
      if (!book) {
        setNotFound(true);
        return;
      }
      // Compare against the LATEST state via ref — using `state` from the
      // effect's closure can read stale values when the effect re-fires
      // due to state changes that haven't yet propagated to the URL,
      // which previously caused a state revert (issue #43).
      const latest = stateRef.current;
      if (latest.book !== book.name || latest.chapter !== chapterNumber || latest.bookId !== bookId) {
        dispatch({ type: 'SET_PASSAGE', book: book.name, chapter: chapterNumber, bookId });
      }
      setResolved(true);
    })();

    return () => {
      cancelled = true;
    };
    // Deps deliberately scoped to URL params only. This effect's role is
    // URL → state sync; including state.* in deps causes a stale-closure
    // re-fire whenever state changes via in-app navigation, reverting
    // the dispatch before the URL has caught up. See issue #43.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, chapterNumber, dispatch]);

  if (notFound) return <Navigate to="/read" replace />;
  if (!resolved) return null;
  return <ReadingScreen />;
}
