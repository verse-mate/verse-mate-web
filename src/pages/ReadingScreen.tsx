import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  fetchChapter,
  fetchBooks,
  fetchAutoHighlights,
  trackRecentBook,
  AutoHighlightRange,
} from '@/services/bibleService';
import { Chapter, HighlightColor, BibleBook } from '@/services/types';
import { ChevronDown, Menu, Bookmark, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import BookSelector from '@/components/BookSelector';
import VerseActions from '@/components/VerseActions';
import VerseInsightSheet from '@/components/VerseInsightSheet';


export default function ReadingScreen() {
  const { state, dispatch, addBookmark, removeBookmark } = useApp();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [showBookSelector, setShowBookSelector] = useState(false);
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
    return state.highlights.find(h => h.book === state.book && h.chapter === state.chapter && h.verse === verseNum);
  };

  // Map verse number -> Tailwind background class from auto-highlight ranges
  const autoHighlightByVerse: Record<number, string> = {};
  if (state.settings.autoHighlights) {
    const colorMap: Record<string, string> = {
      yellow: 'bg-yellow-400/25',
      green: 'bg-green-400/25',
      blue: 'bg-blue-400/25',
      pink: 'bg-pink-400/25',
      purple: 'bg-purple-400/25',
      orange: 'bg-orange-400/25',
      red: 'bg-red-400/25',
      teal: 'bg-teal-400/25',
      brown: 'bg-amber-700/25',
    };
    for (const range of apiAutoHighlights) {
      const cls = colorMap[range.color] || 'bg-yellow-400/25';
      for (let v = range.startVerse; v <= range.endVerse; v++) {
        autoHighlightByVerse[v] = cls;
      }
    }
  }

  const highlightColorClass: Record<HighlightColor, string> = {
    yellow: 'bg-highlight-yellow',
    green: 'bg-highlight-green',
    blue: 'bg-highlight-blue',
    pink: 'bg-highlight-pink',
    orange: 'bg-highlight-orange',
  };

  // Short tap → open the Verse Insight bottom sheet (slides up as an overlay,
  // NOT a full-screen route).
  const [insightVerse, setInsightVerse] = useState<number | null>(null);
  const openVerseInsight = (verseNum: number) => {
    dispatch({ type: 'SET_VERSE', verse: verseNum });
    setInsightVerse(verseNum);
  };

  // Long press (400ms) → open the VerseActions menu (Bookmark / Note / Copy /
  // Commentary / Insight / Highlight).
  const openVerseActions = (verseNum: number) => {
    setLongPressVerse(verseNum);
    dispatch({ type: 'SET_VERSE', verse: verseNum });
  };

  const handlePressStart = (verseNum: number) => {
    const timer = setTimeout(() => {
      openVerseActions(verseNum);
      setPressTimer(null);
    }, 400);
    setPressTimer(timer);
  };
  const handlePressEnd = (verseNum: number) => {
    // If the long-press timer is still pending, this was a short tap — cancel
    // the long-press and open the insight sheet instead.
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
      openVerseInsight(verseNum);
    }
  };

  // Swipe left/right to jump chapters
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
    // Horizontal swipe: |dx| > 60, |dx| > 2 * |dy|, not just a scroll
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 2) {
      if (dx < 0) goToChapter(1); // swipe left → next
      else goToChapter(-1); // swipe right → prev
    }
    touchStartRef.current = null;
  };

  // Use subtitles directly from the API (e.g. "Parable of the Marriage Feast"
  // with start_verse/end_verse range) instead of a hardcoded map.
  const subtitles = chapter?.subtitles || [];
  const verseCount = chapter?.verses.length || 0;

  return (
    <div className="flex flex-col h-full relative bg-background">
      {/* ─── DARK HEADER (118px in Figma: status area + controls) ─── */}
      <header className="shrink-0 bg-header safe-top" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)' }}>
        <div className="flex items-center justify-between px-4" style={{ height: 56 }}>
          {/* Left: Book + chapter dropdown */}
          <button
            onClick={() => setShowBookSelector(true)}
            className="flex items-center gap-1.5 text-header-fg min-h-[44px] pr-2 -ml-1"
          >
            <span className="text-[18px] font-medium tracking-tight">{state.book} {state.chapter}</span>
            <ChevronDown size={18} className="text-header-fg/90" strokeWidth={2} />
          </button>

          {/* Right: Bible/Insight segmented pill + Menu */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full bg-[#3a3a3a] p-1 border border-[#4a4a4a]">
              <button className="px-4 h-8 rounded-full text-[13px] font-semibold bg-gold text-[#1A1A1A]">
                Bible
              </button>
              <button
                onClick={() =>
                  navigate(`/read/${encodeURIComponent(state.book)}/${state.chapter}/commentary`)
                }
                className="px-4 h-8 rounded-full text-[13px] font-semibold text-white transition-colors"
              >
                Insight
              </button>
            </div>
            <button
              onClick={() => navigate('/menu')}
              aria-label="Open menu"
              className="flex items-center justify-center w-[44px] h-[44px] -mr-2"
            >
              <Menu size={22} className="text-header-fg" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── CREAM BODY — scripture (swipe left/right for chapter nav) ─── */}
      <div
        ref={scrollRef}
        onTouchStart={handleBodyTouchStart}
        onTouchEnd={handleBodyTouchEnd}
        className="flex-1 overflow-y-auto bg-background px-5 pt-5 pb-12 relative"
      >
        {/* Chapter header block */}
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-[26px] font-bold text-foreground leading-tight">
            {state.book} {state.chapter}
          </h1>
          <div className="flex items-center gap-1 mt-1.5">
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
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark chapter'}
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
                  className="w-10 h-10 flex items-center justify-center"
                >
                  <Bookmark
                    size={18}
                    className={isBookmarked ? 'text-foreground fill-foreground' : 'text-foreground'}
                    strokeWidth={1.75}
                  />
                </button>
              );
            })()}
            <button
              aria-label="Notes for this chapter"
              onClick={() => navigate('/notes')}
              className="w-10 h-10 flex items-center justify-center"
            >
              <FileText size={18} className="text-foreground" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Verses grouped by API subtitles (e.g. "Parable of the Marriage Feast" v1-14) */}
        <div
          className="text-foreground"
          style={{
            fontSize: `${state.settings.fontSize}px`,
            lineHeight: state.settings.lineSpacing ?? 1.7,
          }}
        >
          {(() => {
            const verses = chapter?.verses || [];
            // Build groups: each group is [subtitle | null, verses[]]
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
              <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
                {group.title && (
                  <>
                    <h2 className="text-[17px] font-bold text-foreground mb-0.5">
                      {group.title}
                    </h2>
                    <p className="text-[13px] text-muted-foreground mb-3">{group.range}</p>
                  </>
                )}
                <div>
                  {group.items.map(verse => {
                    const hl = getHighlightForVerse(verse.number);
                    const isSelected = state.selectedVerse === verse.number;
                    const autoClass = !hl ? autoHighlightByVerse[verse.number] : undefined;
                    return (
                      <span
                        key={verse.number}
                        onTouchStart={() => handlePressStart(verse.number)}
                        onTouchEnd={() => handlePressEnd(verse.number)}
                        onMouseDown={() => handlePressStart(verse.number)}
                        onMouseUp={() => handlePressEnd(verse.number)}
                        onMouseLeave={() => {
                          if (pressTimer) {
                            clearTimeout(pressTimer);
                            setPressTimer(null);
                          }
                        }}
                        className={`inline cursor-pointer transition-colors ${
                          hl ? highlightColorClass[hl.color] : ''
                        } ${autoClass ? `${autoClass} rounded px-0.5` : ''} ${
                          isSelected ? 'ring-2 ring-accent ring-offset-1 rounded' : ''
                        }`}
                      >
                        {state.settings.showVerseNumbers !== false && (
                          <sup className="text-verse-number text-[0.65em] mr-0.5 select-none font-medium align-super">
                            {verse.number}
                          </sup>
                        )}
                        {verse.text}{' '}
                      </span>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* ─── FLOATING CHAPTER NAV (above progress bar) ─── */}
      {state.chapter > 1 && (
        <button
          onClick={() => goToChapter(-1)}
          aria-label="Previous chapter"
          className="absolute left-3 bottom-14 w-11 h-11 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shadow-lg z-20"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
      )}
      {state.chapter < maxChapter && (
        <button
          onClick={() => goToChapter(1)}
          aria-label="Next chapter"
          className="absolute right-3 bottom-14 w-11 h-11 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shadow-lg z-20"
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      )}

      {/* ─── GOLD PROGRESS BAR — overall position in the book ─── */}
      <div className="shrink-0 bg-background px-4 pt-3 pb-3 safe-bottom">
        {(() => {
          const bookProgress =
            maxChapter > 0 ? Math.round((state.chapter / maxChapter) * 100) : 0;
          return (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(2, bookProgress)}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground tabular-nums text-right whitespace-nowrap">
                {state.chapter} / {maxChapter}
              </span>
            </div>
          );
        })()}
      </div>

      {/* ─── Overlays ─── */}
      {showBookSelector && (
        <BookSelector
          onClose={() => setShowBookSelector(false)}
          onSelect={(book, ch, bookId) => {
            dispatch({ type: 'SET_PASSAGE', book, chapter: ch, bookId });
            setShowBookSelector(false);
          }}
        />
      )}
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
    </div>
  );
}
