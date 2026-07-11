import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  fetchChapter,
  fetchBooks,
  fetchAutoHighlights,
  trackRecentBook,
  AutoHighlightRange,
} from '@/services/bibleService';
import { getRedLetterVerses } from '@/data/redLetter';
import { Chapter, HighlightColor, BibleBook } from '@/services/types';
import { ChevronDown, Menu, Bookmark, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import BookSelector from '@/components/BookSelector';
import VerseActions from '@/components/VerseActions';
import VerseInsightSheet from '@/components/VerseInsightSheet';
import SelectionToolbar from '@/components/SelectionToolbar';
import ChapterNotesSheet, { hasPendingChapterNoteDraft } from '@/components/ChapterNotesSheet';
import TokenizedVerse from '@/components/TokenizedVerse';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getBookSlug } from '@/lib/bookSlugs';
import { OVERLAY_MODAL_WIDTH, OVERLAY_MODAL_HEIGHT } from '@/constants/overlayModal';
import { loadAlignmentFor, type ChapterAlignment } from '@versemate/lexicon';
import { vmTokens } from '@/styles/themeStyles';

// Style primitives come from @/styles/themeStyles so colors flip with the
// active theme. Hex values that are intentionally constant across themes
// (gold accent, header chrome) reference vmTokens.* instead.

/**
 * Placeholder alignment passed to TokenizedVerse when the backend supplied
 * Strong's tokens but the legacy lexicon alignment hasn't loaded yet (or
 * doesn't exist for this book — e.g. non-English chapters where backend
 * tokens are the only source). TokenizedVerse short-circuits to the
 * wireTokens path before touching this object, so the empty bookId/verses
 * are never read.
 */
const EMPTY_ALIGNMENT = {
  bookId: 0,
  book: '',
  chapter: 0,
  version: '',
  verses: {},
  lexicon: {},
} as unknown as ChapterAlignment;

export default function ReadingScreen() {
  const { state, dispatch, addBookmark, removeBookmark } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync state.bookId / state.chapter → URL (canonical /bible/<slug>/<chapter>).
  // BibleRoute (src/components/routes/BibleRoute.tsx) does the inverse on
  // direct hits — together they keep state and URL aligned in both
  // directions, so book selector / chapter arrows / verse links all
  // update the address bar to a shareable, indexable URL.
  //
  // Only push state → URL when the state passage ACTUALLY changed (book
  // or chapter). React-Router params changes that arrive before AppContext
  // catches up (e.g. /bible/genesis/1 → /bible/psalms/119 via Link or
  // browser back/forward) must NOT trigger a navigate back to the stale
  // state target; BibleRoute owns the URL→state direction in that case.
  // VER-71: intermittent /bible/psalms/119 → /bible/psalms/2 (or
  // /bible/genesis/1) was caused by this effect re-firing on a pathname
  // change with stale state and overwriting the new URL.
  const lastSyncedPassageRef = useRef<{ bookId: number; chapter: number } | null>(null);
  useEffect(() => {
    if (!state.bookId || !state.chapter) return;
    const slug = getBookSlug(state.bookId);
    if (!slug) return;
    const last = lastSyncedPassageRef.current;
    const passageChanged =
      last === null || last.bookId !== state.bookId || last.chapter !== state.chapter;
    lastSyncedPassageRef.current = { bookId: state.bookId, chapter: state.chapter };
    if (!passageChanged) return;
    const target = `/bible/${slug}/${state.chapter}`;
    if (location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [state.bookId, state.chapter, location.pathname, navigate]);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [showBookSelector, setShowBookSelector] = useState(false);
  // Seed text for the Search modal when it's opened via "just start typing".
  const [bookSelectorQuery, setBookSelectorQuery] = useState('');
  // If the user kicked off a chapter-notes save via SSO (Google/Apple), the
  // OAuth round-trip stashed their draft and `useTrackPreAuthLocation`
  // brings them back to this page. Auto-reopen the modal so they don't
  // have to remember to click the notes button again. ChapterNotesSheet
  // consumes the draft from sessionStorage on mount.
  const [showNotesSheet, setShowNotesSheet] = useState(false);
  useEffect(() => {
    if (!state.bookId || !state.chapter) return;
    if (hasPendingChapterNoteDraft(state.bookId, state.chapter)) {
      setShowNotesSheet(true);
    }
  }, [state.bookId, state.chapter]);
  const [longPressVerse, setLongPressVerse] = useState<number | null>(null);
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [apiAutoHighlights, setApiAutoHighlights] = useState<AutoHighlightRange[]>([]);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBooks().then(setBooks);
  }, []);

  useEffect(() => {
    fetchChapter(state.book, state.chapter, state.version).then(setChapter);
    if (state.bookId) trackRecentBook(state.bookId);
    scrollRef.current?.scrollTo(0, 0); // Always scroll to top on book/chapter change
  }, [state.book, state.chapter, state.version, state.bookId]);

  useEffect(() => {
    if (state.settings.autoHighlights) {
      fetchAutoHighlights(state.book, state.chapter).then(setApiAutoHighlights);
    } else {
      setApiAutoHighlights([]);
    }
  }, [state.book, state.chapter, state.settings.autoHighlights]);

  const currentBook = books.find(b => b.name === state.book);
  const maxChapter = currentBook?.chapters || 1;

  const goToChapter = useCallback((delta: number) => {
    const next = state.chapter + delta;
    if (next >= 1 && next <= maxChapter) {
      dispatch({ type: 'SET_PASSAGE', book: state.book, chapter: next });
      scrollRef.current?.scrollTo(0, 0);
    }
  }, [state.chapter, state.book, maxChapter, dispatch]);

  const getHighlightForVerse = (verseNum: number) => {
    return state.highlights.find(h => {
      // Match by bookId (always populated). The book name from
      // fetchHighlights is intentionally empty since the API only returns
      // book_id, so name-based matching silently dropped every highlight.
      if (h.bookId !== state.bookId) return false;
      if (h.chapter !== state.chapter) return false;
      const start = h.startVerse ?? h.verse;
      const end = h.endVerse ?? h.verse;
      return verseNum >= start && verseNum <= end;
    });
  };

  const autoHighlightByVerse: Record<number, string> = {};
  if (state.settings.autoHighlights) {
    const autoColorMap: Record<string, string> = {
      yellow: 'ahl-yellow', green: 'ahl-green', blue: 'ahl-blue',
      orange: 'ahl-orange', pink: 'ahl-pink', purple: 'ahl-purple',
      red: 'ahl-red', teal: 'ahl-teal', brown: 'ahl-brown',
    };
    for (const range of apiAutoHighlights) {
      const cls = autoColorMap[range.color] || 'ahl-yellow';
      for (let v = range.startVerse; v <= range.endVerse; v++) {
        autoHighlightByVerse[v] = cls;
      }
    }
  }

  // Red-letter (words of Jesus). Independent of the API-driven auto-highlight
  // themes above — it is a local, translation-agnostic dataset toggled by its
  // own setting. Colors the verse text red rather than adding a background.
  const redLetterVerses = new Set<number>(
    state.settings.redLetter && state.bookId
      ? getRedLetterVerses(state.bookId, state.chapter)
      : []
  );

  const highlightColorClass: Record<string, string> = {
    yellow: 'hl-yellow', green: 'hl-green', blue: 'hl-blue',
    pink: 'hl-pink', purple: 'hl-purple', orange: 'hl-orange',
    red: 'hl-red', teal: 'hl-teal', brown: 'hl-brown',
  };

  // Drag-to-select highlighting (real text selection + SelectionToolbar) is
  // the desktop interaction model; touch devices instead long-press a verse to
  // open the tap-menu. Drive the choice off pointer capability, not just width:
  // a mouse user who zooms in (shrinking the CSS-pixel viewport below 1024px)
  // should still be able to drag-select words and get the toolbar rather than
  // falling back to the touch menu. `(pointer: fine)` matches mouse/trackpad
  // primary input and stays false on phones/tablets.
  const isWideViewport = useMediaQuery('(min-width: 1024px)');
  const hasFinePointer = useMediaQuery('(pointer: fine)');
  const isDesktop = isWideViewport || hasFinePointer;
  // At ≥768px this ReadingScreen is embedded inside DesktopLayout's Outlet
  // (the split view), so DesktopLayout owns the chrome — chapter selector,
  // Search modal, and the "just start typing" shortcut. Only when this is the
  // standalone mobile layout (<768px) should ReadingScreen run its own Search
  // affordances, otherwise both layers open a duplicate Search modal.
  const isSplitView = useMediaQuery('(min-width: 768px)');
  const isStandaloneMobile = !isSplitView;

  // Belt-and-suspenders against iOS Safari's native long-press text
  // selection on the scripture body. Even with `user-select: none` on the
  // verse spans, iOS still fires `selectstart` when the user long-presses
  // a verse for the second time (especially over an already-highlighted
  // span — the rendered <mark>-like background seems to override the
  // -webkit-user-select rule). Block the event at the document level
  // whenever the long-press target sits inside the scripture body. On
  // desktop the SelectionToolbar relies on real text selection, so this
  // hook is a no-op there.
  useEffect(() => {
    if (isDesktop) return;
    const onSelectStart = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t && t.closest?.('.font-scripture')) {
        e.preventDefault();
      }
    };
    document.addEventListener('selectstart', onSelectStart);
    return () => document.removeEventListener('selectstart', onSelectStart);
  }, [isDesktop]);

  // "Just start typing" → open Search seeded with the first character, so a
  // keyboard user (incl. a zoomed-in desktop browser that has dropped into
  // this mobile layout) can jump to another book without reaching for the
  // selector. DesktopLayout has the same shortcut; ReadingScreen lacked it,
  // so typing did nothing at zoom levels that fall below the split-view
  // breakpoint. Gated on a fine pointer so it never fires on touch phones
  // (which have no physical keyboard and would only pop the on-screen one).
  useEffect(() => {
    if (!hasFinePointer || !isStandaloneMobile) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.target instanceof HTMLElement && e.target.isContentEditable) return;
      if (
        !showBookSelector &&
        e.key.length === 1 &&
        /[a-zA-Z0-9]/.test(e.key) &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        // Swallow this keystroke so the browser doesn't ALSO insert the
        // character once the search field auto-focuses (otherwise "jj").
        e.preventDefault();
        setBookSelectorQuery(e.key);
        setShowBookSelector(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hasFinePointer, isStandaloneMobile, showBookSelector]);

  const [insightVerse, setInsightVerse] = useState<number | null>(null);
  const openVerseInsight = (verseNum: number) => {
    // Respect the Settings toggle — when Verse Insights are disabled, a verse
    // tap/click is a no-op (text selection on desktop still works).
    if (state.settings.verseInsightsPopup === false) return;
    dispatch({ type: 'SET_VERSE', verse: verseNum });
    setInsightVerse(verseNum);
  };

  const openVerseActions = (verseNum: number) => {
    setLongPressVerse(verseNum);
    dispatch({ type: 'SET_VERSE', verse: verseNum });
  };

  // Track touch start position so we can cancel the long-press timer if the
  // finger moves vertically (= the user is scrolling, not pressing).
  const pressStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const PRESS_SCROLL_THRESHOLD_PX = 12;

  const handlePressStart = (verseNum: number, e?: React.TouchEvent | React.MouseEvent) => {
    if (e && 'touches' in e && e.touches[0]) {
      pressStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      pressStartPosRef.current = null;
    }
    const timer = setTimeout(() => {
      openVerseActions(verseNum);
      setPressTimer(null);
    }, 400);
    setPressTimer(timer);
  };
  const handlePressMove = (e: React.TouchEvent) => {
    const start = pressStartPosRef.current;
    if (!start || !pressTimer || !e.touches[0]) return;
    const dy = Math.abs(e.touches[0].clientY - start.y);
    if (dy > PRESS_SCROLL_THRESHOLD_PX) {
      clearTimeout(pressTimer);
      setPressTimer(null);
      pressStartPosRef.current = null;
    }
  };
  const handlePressEnd = (verseNum: number) => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
      openVerseInsight(verseNum);
    }
    pressStartPosRef.current = null;
  };

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleBodyTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };
  const handleBodyTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 2) {
      if (dx < 0) goToChapter(1);
      else goToChapter(-1);
    }
    touchStartRef.current = null;
  };

  const subtitles = chapter?.subtitles || [];
  const verseCount = chapter?.verses.length || 0;
  // Layer-1 lexical lookup. Hand-curated chapters resolve synchronously
  // from cache on the next tick; generated chapters lazy-load their per-
  // chapter JSON + (first time) the shared lemmas file. The render-with-
  // null then re-render pattern is fine here — the verse text still shows
  // immediately, lexical decoration appears the moment data is ready.
  const [lexAlignment, setLexAlignment] = useState<ChapterAlignment | null>(null);
  useEffect(() => {
    setLexAlignment(null);
    if (!state.bookId || !state.chapter) return;
    let cancelled = false;
    loadAlignmentFor(state.bookId, state.chapter).then((a) => {
      if (!cancelled) setLexAlignment(a);
    });
    return () => { cancelled = true; };
  }, [state.bookId, state.chapter]);

  return (
    // No `position: relative` on the outer div — prototype's .progress-bar
    // is `position: absolute; left:0; right:0` and must bubble up to
    // .split-body so it spans BOTH the reading + commentary panels (not just
    // the reading panel). Mobile header is hidden at ≥768px so no overlap
    // issue from that.
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.headerBg }}>
      {/* ─── DARK HEADER with TEXT pill tabs — hidden on desktop (DesktopLayout renders shared header) ─── */}
      {/* `.safe-top` adds only the real notch inset (env(safe-area-inset-top),
          0 on desktop / non-notched), so the bar is just its 56px row instead
          of carrying a fixed status-bar floor that reads as dead space when a
          zoomed-in desktop browser drops into this mobile layout. */}
      <header className="reading-screen-header shrink-0 safe-top" style={{ backgroundColor: vmTokens.headerBg }}>
        <div className="flex items-center justify-between px-4" style={{ height: 56 }}>
          {/* Left: Book + chapter dropdown */}
          <button
            onClick={() => setShowBookSelector(true)}
            data-testid="chapter-selector-button"
            className="flex items-center gap-1.5 min-h-[44px] pr-2 -ml-1"
            style={{ color: vmTokens.headerFg }}
          >
            <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '24px', color: vmTokens.headerFg }}>{state.book} {state.chapter}</span>
            <ChevronDown size={18} style={{ color: vmTokens.headerFg }} strokeWidth={2} />
          </button>

          {/* Right: TEXT pill tabs (Bible/Insight) + Menu */}
          <div className="flex items-center gap-2">
            {/* Pill container */}
            <div style={{ display: 'flex', backgroundColor: vmTokens.pillBg, borderRadius: 100, padding: '3px' }}>
              {/* Bible pill — active (gold) */}
              <button
                aria-label="Bible"
                data-testid="bible-view-icon"
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '24px',
                  padding: '2px 12px',
                  borderRadius: 100,
                  backgroundColor: vmTokens.gold,
                  color: vmTokens.goldOnLight,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Bible
              </button>
              {/* Insight pill — inactive */}
              <button
                aria-label="Insight"
                data-testid="commentary-view-icon"
                onClick={() => {
                  // Issue #46 — use lowercase slug for parity with /bible/<slug>.
                  // Falls back to the (capitalized) book name if no slug exists,
                  // preserving the legacy URL shape for any pre-fix in-flight nav.
                  const slug = getBookSlug(state.bookId) || encodeURIComponent(state.book);
                  navigate(`/read/${slug}/${state.chapter}/commentary`);
                }}
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '24px',
                  padding: '2px 12px',
                  borderRadius: 100,
                  backgroundColor: 'transparent',
                  color: vmTokens.headerFg,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Insight
              </button>
            </div>
            <button
              onClick={() => navigate('/menu')}
              aria-label="Open menu"
              data-testid="hamburger-menu-button"
              className="flex items-center justify-center w-[44px] h-[44px] -mr-2"
            >
              <Menu size={22} style={{ color: vmTokens.headerFg }} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Prototype .reading-body + .reading-inner wrap the scripture column.
          .chapter-meta holds the h1 + icon buttons. .font-scripture is the
          verse body. All layout / colors come from prototype.css. */}
      <div
        onTouchStart={handleBodyTouchStart}
        onTouchEnd={handleBodyTouchEnd}
        data-testid="chapter-pager-view"
        className="reading-body"
      >
        {/* Inner scroller — the verse column scrolls here while the chapter
            nav arrows (siblings below, outside this div) stay pinned to the
            non-scrolling .reading-body so they don't scroll off-screen when
            zoomed in. */}
        <div className="reading-scroll" ref={scrollRef}>
        <div className="reading-inner">
        <div className="chapter-meta">
          <h1 className="chapter-title" data-testid="chapter-header">
            {state.book} {state.chapter}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
            {(() => {
              const chapterBookmark = state.bookmarks.find(
                b =>
                  b.bookId === state.bookId &&
                  b.chapter === state.chapter &&
                  !b.verse
              );
              const isBookmarked = !!chapterBookmark;
              return (
                <button
                  className="icon-btn"
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark chapter'}
                  data-testid={`bookmark-toggle-${state.bookId}-${state.chapter}`}
                  onClick={() => {
                    if (isBookmarked) {
                      removeBookmark(chapterBookmark.id);
                    } else {
                      addBookmark({
                        bookId: state.bookId,
                        book: state.book,
                        chapter: state.chapter,
                        version: state.version,
                      });
                    }
                  }}
                >
                  <Bookmark
                    size={18}
                    style={isBookmarked ? { color: vmTokens.textPrimary, fill: vmTokens.textPrimary } : { color: vmTokens.textPrimary }}
                    strokeWidth={1.75}
                  />
                </button>
              );
            })()}
            <button
              className="icon-btn"
              aria-label="Notes for this chapter"
              data-testid={`chapter-notes-button-${state.bookId}-${state.chapter}`}
              onClick={() => setShowNotesSheet(true)}
            >
              <FileText size={18} style={{ color: vmTokens.textPrimary }} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Verses grouped by API subtitles — prototype .font-scripture */}
        <div className="font-scripture" style={{ fontSize: `${state.settings.fontSize}px` }}>
          {(() => {
            const verses = chapter?.verses || [];
            const groups: Array<{ title: string | null; range: string; items: typeof verses }> = [];
            if (subtitles.length === 0) {
              groups.push({
                title: null,
                range: verseCount ? `(${state.book} ${state.chapter}:1-${verseCount})` : '',
                items: verses,
              });
            } else {
              for (const s of subtitles) {
                const items = verses.filter(
                  v => v.number >= s.start_verse && v.number <= s.end_verse
                );
                if (items.length === 0) continue;
                groups.push({
                  title: s.subtitle,
                  range: `(${state.book} ${state.chapter}:${s.start_verse}-${s.end_verse})`,
                  items,
                });
              }
            }

            return groups.map((group, gi) => (
              <div key={gi} style={{ marginTop: gi > 0 ? 8 : 0 }}>
                {group.title && (
                  <>
                    <h2 className="section-subtitle">{group.title}</h2>
                    <p className="section-range">{group.range}</p>
                  </>
                )}
                <div>
                  {group.items.map(verse => {
                    const hl = getHighlightForVerse(verse.number);
                    const isSelected = state.selectedVerse === verse.number;
                    const autoClass = !hl ? autoHighlightByVerse[verse.number] : undefined;
                    const isRedLetter = redLetterVerses.has(verse.number);
                    return (
                      <span
                        key={verse.number}
                        data-verse={verse.number}
                        data-testid={`verse-group-${verse.number}`}
                        onTouchStart={(e) => handlePressStart(verse.number, e)}
                        onTouchMove={handlePressMove}
                        onTouchEnd={() => handlePressEnd(verse.number)}
                        {...(!isDesktop ? {
                          onMouseDown: () => handlePressStart(verse.number),
                          onMouseUp: () => handlePressEnd(verse.number),
                          onMouseLeave: () => { if (pressTimer) { clearTimeout(pressTimer); setPressTimer(null); } },
                        } : {
                          onClick: () => {
                            const sel = window.getSelection();
                            if (!sel || sel.isCollapsed || !sel.toString().trim()) {
                              openVerseInsight(verse.number);
                            }
                          },
                        })}
                        className={`verse-span ${hl ? highlightColorClass[hl.color] : ''} ${autoClass || ''} ${isRedLetter ? 'red-letter' : ''} ${isSelected ? 'selected' : ''}`}
                        style={!isDesktop ? {
                          // Suppress iOS long-press text selection callout
                          WebkitUserSelect: 'none',
                          WebkitTouchCallout: 'none',
                        } : undefined}
                      >
                        {state.settings.showVerseNumbers !== false && (
                          <sup className="text-verse-number" style={{ fontSize: '12px', marginRight: 2, userSelect: 'none', verticalAlign: 'super' }}>
                            {verse.number}
                          </sup>
                        )}
                        {lexAlignment ? (
                          <TokenizedVerse
                            text={verse.text}
                            verseNumber={verse.number}
                            alignment={lexAlignment}
                            wireTokens={verse.tokens}
                          />
                        ) : verse.tokens && verse.tokens.length > 0 ? (
                          // Tagged tokens arrived before the lexicon
                          // alignment finished loading — render them
                          // immediately. The lexicon-overlay path is
                          // unused when wireTokens is supplied, so passing
                          // an empty alignment is harmless.
                          <TokenizedVerse
                            text={verse.text}
                            verseNumber={verse.number}
                            alignment={EMPTY_ALIGNMENT}
                            wireTokens={verse.tokens}
                          />
                        ) : (
                          verse.text
                        )}{' '}
                      </span>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>
        </div>{/* end .reading-inner */}
        </div>{/* end .reading-scroll */}

        {/* Chapter nav buttons — INSIDE .reading-body (now the non-scrolling
            relative ancestor) but OUTSIDE .reading-scroll, so their absolute
            positioning resolves to .reading-body and they stay vertically
            pinned as the verse column scrolls. Anchoring here (not .split-body)
            keeps them in the reading column rather than across both panes. */}
        {state.chapter > 1 && (
          <button
            onClick={() => goToChapter(-1)}
            aria-label="Previous chapter"
            data-testid="previous-chapter-button"
            className="chapter-nav-btn chapter-nav-prev"
          >
            <ChevronLeft size={20} color={vmTokens.textPrimary} strokeWidth={2.25} />
          </button>
        )}
        {state.chapter < maxChapter && (
          <button
            onClick={() => goToChapter(1)}
            aria-label="Next chapter"
            data-testid="next-chapter-button"
            className="chapter-nav-btn chapter-nav-next"
          >
            <ChevronRight size={20} color={vmTokens.textPrimary} strokeWidth={2.25} />
          </button>
        )}

        {/* Desktop: floating toolbar on text selection */}
        {isDesktop && (
          <SelectionToolbar book={state.book} chapter={state.chapter} bookId={state.bookId} />
        )}
      </div>

      {/* Progress bar — prototype .progress-bar / .progress-track /
          .progress-fill / .progress-pct. Bottom-anchored. */}
      <div className="progress-bar" data-testid="progress-bar">
        {(() => {
          const bookProgress =
            maxChapter > 0 ? Math.round((state.chapter / maxChapter) * 100) : 0;
          return (
            <>
              <div className="progress-track">
                <div
                  data-testid="progress-bar-fill"
                  className="progress-fill"
                  style={{ width: `${Math.max(2, bookProgress)}%` }}
                />
              </div>
              <span data-testid="progress-bar-percentage" className="progress-pct">
                {bookProgress}%
              </span>
            </>
          );
        })()}
      </div>

      {/* ─── Overlays ─── */}
      {showBookSelector && (() => {
        const closeSelector = () => {
          setShowBookSelector(false);
          setBookSelectorQuery('');
        };
        const onSelect = (book: string, ch: number, bookId?: number) => {
          dispatch({ type: 'SET_PASSAGE', book, chapter: ch, bookId });
          closeSelector();
        };
        // On a genuine touch phone the full-screen search is the right pattern.
        // But when this mobile layout is reached by zooming a desktop browser
        // (fine pointer), a full-screen search reads as broken — so constrain
        // it to a centered, size-capped compact modal card instead, matching
        // the desktop split-view Search modal.
        if (!isDesktop) {
          return (
            <BookSelector
              onClose={closeSelector}
              onSelect={onSelect}
              initialQuery={bookSelectorQuery}
            />
          );
        }
        return (
          <>
            <div
              onClick={closeSelector}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 55 }}
            />
            <div
              data-testid="book-selector-modal"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: OVERLAY_MODAL_WIDTH,
                height: OVERLAY_MODAL_HEIGHT,
                zIndex: 56,
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              }}
            >
              <BookSelector
                onClose={closeSelector}
                onSelect={onSelect}
                initialQuery={bookSelectorQuery}
                compact
              />
            </div>
          </>
        );
      })()}
      {longPressVerse !== null && (
        <VerseActions
          verse={longPressVerse}
          onClose={() => {
            setLongPressVerse(null);
            dispatch({ type: 'SET_VERSE', verse: null });
          }}
        />
      )}
      {insightVerse !== null && (
        <VerseInsightSheet
          book={state.book}
          chapter={state.chapter}
          verse={insightVerse}
          version={state.version}
          onClose={() => {
            setInsightVerse(null);
            dispatch({ type: 'SET_VERSE', verse: null });
          }}
        />
      )}
      {showNotesSheet && (
        <ChapterNotesSheet
          book={state.book}
          bookId={state.bookId}
          chapter={state.chapter}
          onClose={() => setShowNotesSheet(false)}
        />
      )}
    </div>
  );
}
