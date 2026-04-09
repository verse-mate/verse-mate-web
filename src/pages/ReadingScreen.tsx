import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { fetchChapter, fetchBooks, fetchAutoHighlights } from '@/services/bibleService';
import { Chapter, HighlightColor, BibleBook } from '@/services/types';
import { ChevronDown, Menu, Bookmark, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import BookSelector from '@/components/BookSelector';
import VerseActions from '@/components/VerseActions';

type ReadingMode = 'bible' | 'insight';

export default function ReadingScreen() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [mode, setMode] = useState<ReadingMode>('bible');
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [longPressVerse, setLongPressVerse] = useState<number | null>(null);
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [apiAutoHighlights, setApiAutoHighlights] = useState<number[]>([]);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBooks().then(setBooks);
  }, []);

  useEffect(() => {
    fetchChapter(state.book, state.chapter, state.version).then(setChapter);
  }, [state.book, state.chapter, state.version]);

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

  const autoHighlightVerses: number[] = state.settings.autoHighlights ? apiAutoHighlights : [];

  const highlightColorClass: Record<HighlightColor, string> = {
    yellow: 'bg-highlight-yellow',
    green: 'bg-highlight-green',
    blue: 'bg-highlight-blue',
    pink: 'bg-highlight-pink',
    orange: 'bg-highlight-orange',
  };

  const handlePressStart = (verseNum: number) => {
    const timer = setTimeout(() => {
      setLongPressVerse(verseNum);
      dispatch({ type: 'SET_VERSE', verse: verseNum });
    }, 500);
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
    setPressTimer(null);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const progress = scrollHeight > clientHeight
      ? Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
      : 100;
    setScrollProgress(progress);
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

  const sectionTitle =
    state.book === 'John' && state.chapter === 1 ? 'The Word Became Flesh' :
    state.book === 'Psalms' && state.chapter === 23 ? 'The Lord Is My Shepherd' :
    state.book === 'Genesis' && state.chapter === 1 ? 'The Creation of the World' :
    state.book === 'Romans' && state.chapter === 8 ? 'Life in the Spirit' :
    undefined;

  const verseCount = chapter?.verses.length || 0;
  const referenceLabel = verseCount ? `(${state.book} ${state.chapter}:1-${verseCount})` : '';

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
            <div className="flex items-center rounded-full bg-[#232323] p-0.5">
              <button
                onClick={() => setMode('bible')}
                className={`px-3.5 h-8 rounded-full text-[13px] font-medium transition-colors ${
                  mode === 'bible'
                    ? 'bg-gold text-[#1A1A1A]'
                    : 'text-header-fg/80'
                }`}
              >
                Bible
              </button>
              <button
                onClick={() =>
                  navigate(`/read/${encodeURIComponent(state.book)}/${state.chapter}/insight`)
                }
                className={`px-3.5 h-8 rounded-full text-[13px] font-medium transition-colors ${
                  mode === 'insight'
                    ? 'bg-gold text-[#1A1A1A]'
                    : 'text-header-fg/80'
                }`}
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
        onScroll={handleScroll}
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
            <button aria-label="Bookmark chapter" className="w-8 h-8 flex items-center justify-center">
              <Bookmark size={18} className="text-foreground" strokeWidth={1.75} />
            </button>
            <button aria-label="Notes" className="w-8 h-8 flex items-center justify-center">
              <FileText size={18} className="text-foreground" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {sectionTitle && (
          <>
            <h2 className="text-[17px] font-bold text-foreground mb-0.5">
              {sectionTitle}
            </h2>
            <p className="text-[13px] text-muted-foreground mb-4">
              {referenceLabel}
            </p>
          </>
        )}

        {/* Verses — Roboto body, superscript numbers */}
        <div
          className="text-foreground"
          style={{
            fontSize: `${state.settings.fontSize}px`,
            lineHeight: state.settings.lineSpacing ?? 1.7,
          }}
        >
          {chapter?.verses.map(verse => {
            const hl = getHighlightForVerse(verse.number);
            const isSelected = state.selectedVerse === verse.number;
            const isAutoHighlighted = autoHighlightVerses.includes(verse.number) && !hl;
            return (
              <span
                key={verse.number}
                onTouchStart={() => handlePressStart(verse.number)}
                onTouchEnd={handlePressEnd}
                onMouseDown={() => handlePressStart(verse.number)}
                onMouseUp={handlePressEnd}
                className={`inline transition-colors ${hl ? highlightColorClass[hl.color] : ''} ${
                  isAutoHighlighted
                    ? 'bg-[#B09A6D]/25 text-foreground rounded px-0.5'
                    : ''
                } ${isSelected ? 'ring-2 ring-accent ring-offset-1 rounded' : ''}`}
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

      {/* ─── GOLD PROGRESS BAR (bottom 32px) ─── */}
      <div className="shrink-0 bg-background px-4 pt-3 pb-3 safe-bottom">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-200"
              style={{ width: `${Math.max(2, scrollProgress)}%` }}
            />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground tabular-nums w-9 text-right">
            {scrollProgress}%
          </span>
        </div>
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
    </div>
  );
}
