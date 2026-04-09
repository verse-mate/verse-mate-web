import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { fetchChapter } from '@/services/bibleService';
import { Chapter, HighlightColor } from '@/services/types';
import { ChevronDown, ChevronLeft, ChevronRight, BookOpen, Bookmark, Menu } from 'lucide-react';
import BookSelector from '@/components/BookSelector';
import VerseActions from '@/components/VerseActions';
import { BIBLE_BOOKS } from '@/services/bibleData';

export default function ReadingScreen() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [longPressVerse, setLongPressVerse] = useState<number | null>(null);
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChapter(state.book, state.chapter, state.version).then(setChapter);
  }, [state.book, state.chapter, state.version]);

  const currentBook = BIBLE_BOOKS.find(b => b.name === state.book);
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

  const highlightColorClass: Record<HighlightColor, string> = {
    yellow: 'bg-highlight-yellow',
    green: 'bg-highlight-green',
    blue: 'bg-highlight-blue',
    pink: 'bg-highlight-pink',
    orange: 'bg-highlight-orange',
  };

  const handleTouchStart = (verseNum: number) => {
    const timer = setTimeout(() => {
      setLongPressVerse(verseNum);
      dispatch({ type: 'SET_VERSE', verse: verseNum });
    }, 500);
    setPressTimer(timer);
  };

  const handleTouchEnd = () => {
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

  // Section title for the first verse group (mock — real data would come from service)
  const sectionTitle = state.book === 'John' && state.chapter === 1
    ? 'The Word Became Flesh'
    : state.book === 'Psalms' && state.chapter === 23
    ? 'The Lord Is My Shepherd'
    : state.book === 'Genesis' && state.chapter === 1
    ? 'The Creation of the World'
    : state.book === 'Romans' && state.chapter === 8
    ? 'Life in the Spirit'
    : undefined;

  return (
    <div className="flex flex-col h-full relative">
      {/* ─── DARK HEADER ─── */}
      <header className="shrink-0 flex items-center justify-between px-3 bg-header" style={{ height: 56 }}>
        <button
          onClick={() => setShowBookSelector(true)}
          className="flex items-center gap-1.5 text-header-fg"
        >
          <span className="text-[17px] font-semibold font-sans">{state.book} {state.chapter}</span>
          <ChevronDown size={16} className="text-gold" />
        </button>
        <div className="flex items-center gap-0">
          <button
            onClick={() => {/* bookmark/note shortcut */}}
            className="flex items-center justify-center w-[44px] h-[44px]"
          >
            <Bookmark size={22} className="text-gold" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => navigate(`/read/${encodeURIComponent(state.book)}/${state.chapter}/commentary`)}
            className="flex items-center justify-center w-[44px] h-[44px]"
          >
            <BookOpen size={22} className="text-gold" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => navigate('/menu')}
            className="flex items-center justify-center w-[44px] h-[44px]"
          >
            <Menu size={22} className="text-gold" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ─── CREAM BODY ─── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-background px-5 pt-6 pb-24"
        style={{ fontSize: `${state.settings.fontSize}px` }}
      >
        {/* Book + chapter title */}
        <h1 className="font-scripture italic text-[28px] text-foreground mb-1 font-medium">
          {state.book} {state.chapter}
        </h1>

        {sectionTitle && (
          <>
            <h2 className="font-scripture italic text-[18px] text-foreground font-semibold mt-3 mb-0.5">
              {sectionTitle}
            </h2>
            <p className="font-scripture italic text-[14px] text-muted-foreground mb-4">
              ({state.book} {state.chapter}:1-{chapter?.verses.length || ''})
            </p>
          </>
        )}

        {/* Verses */}
        <div className="mt-2">
          {chapter?.verses.map(verse => {
            const hl = getHighlightForVerse(verse.number);
            const isSelected = state.selectedVerse === verse.number;
            return (
              <span
                key={verse.number}
                onTouchStart={() => handleTouchStart(verse.number)}
                onTouchEnd={handleTouchEnd}
                onMouseDown={() => handleTouchStart(verse.number)}
                onMouseUp={handleTouchEnd}
                className={`font-scripture inline text-foreground transition-colors ${
                  hl ? highlightColorClass[hl.color] : ''
                } ${isSelected ? 'ring-2 ring-accent ring-offset-1 rounded' : ''}`}
              >
                <sup className="text-verse-number font-sans text-[0.6em] mr-0.5 select-none font-semibold">
                  {verse.number}
                </sup>
                {verse.text}{' '}
              </span>
            );
          })}
        </div>
      </div>

      {/* ─── FLOATING CHAPTER NAV ─── */}
      {state.chapter > 1 && (
        <button
          onClick={() => goToChapter(-1)}
          className="absolute left-4 bottom-16 w-[44px] h-[44px] rounded-full bg-foreground flex items-center justify-center shadow-lg z-20"
        >
          <ChevronLeft size={20} className="text-background" />
        </button>
      )}
      {state.chapter < maxChapter && (
        <button
          onClick={() => goToChapter(1)}
          className="absolute right-4 bottom-16 w-[44px] h-[44px] rounded-full bg-foreground flex items-center justify-center shadow-lg z-20"
        >
          <ChevronRight size={20} className="text-background" />
        </button>
      )}

      {/* ─── PROGRESS BAR ─── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-background px-5 py-2.5 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full transition-all duration-200"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground tabular-nums w-8 text-right">
            {scrollProgress}%
          </span>
        </div>
      </div>

      {/* ─── Overlays ─── */}
      {showBookSelector && (
        <BookSelector
          onClose={() => setShowBookSelector(false)}
          onSelect={(book, ch) => {
            dispatch({ type: 'SET_PASSAGE', book, chapter: ch });
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
