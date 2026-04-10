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

/* ─── Production SVG Icons (from frontend-base/src/ui/Icons) ─── */
function BibleIcon({ fill = '#fff' }: { fill?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <mask id="mask0_bible" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_bible)">
        <path fill={fill} fillRule="evenodd" clipRule="evenodd" d="M5.39525 21.6047C5.99208 22.2016 6.71292 22.5 7.55775 22.5H19.5V21C19.0705 21 18.7035 20.8477 18.399 20.5432C18.0945 20.2387 17.9423 19.8717 17.9423 19.4423C17.9423 19.0128 18.0945 18.6458 18.399 18.3413C18.7035 18.0368 19.0705 17.8845 19.5 17.8845V3.5H7.75C6.8475 3.5 6.08017 3.816 5.448 4.448C4.816 5.08017 4.5 5.8475 4.5 6.75V19.4423C4.5 20.2871 4.79842 21.0079 5.39525 21.6047ZM6.72975 16.498C6.47025 16.5737 6.227 16.6891 6 16.8443V6.75C6 6.26917 6.1715 5.85733 6.5145 5.5145C6.85733 5.1715 7.26917 5 7.75 5H8.19225V16.3848H7.55775C7.26542 16.3848 6.98942 16.4225 6.72975 16.498ZM18 16.3848H9.69225V5H18V16.3848ZM16.902 21H7.55775C7.11158 21 6.74042 20.8519 6.44425 20.5557C6.14808 20.2596 6 19.8884 6 19.4423C6 19.0128 6.14808 18.6458 6.44425 18.3413C6.74042 18.0368 7.11158 17.8845 7.55775 17.8845H16.902C16.7468 18.1115 16.6314 18.3564 16.5557 18.6193C16.4801 18.8821 16.4423 19.1564 16.4423 19.4423C16.4423 19.7449 16.4827 20.0235 16.5635 20.278C16.6442 20.5323 16.757 20.773 16.902 21ZM13 7H14.5V9H16.5V10.5H14.5V15H13V10.5H11V9H13V7Z" />
      </g>
    </svg>
  );
}

function AutoStoriesIcon({ fill = '#fff' }: { fill?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" aria-hidden="true">
      <path fill={fill} d="M480-160q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q58 0 113.5 15T480-740v484q51-32 107-48t113-16q36 0 70.5 6t69.5 18v-480q15 5 29.5 10.5T898-752q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59Zm80-200v-380l200-200v400L560-360Zm-160 65v-396q-41-24-87-36t-93-12q-36 0-71.5 7T80-712v396q35-12 69.5-18t70.5-6q47 0 91.5 10.5T400-295Zm0 0v-396 396Z" />
    </svg>
  );
}

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

  const highlightColorClass: Record<string, string> = {
    yellow: 'hl-yellow', green: 'hl-green', blue: 'hl-blue',
    pink: 'hl-pink', purple: 'hl-purple', orange: 'hl-orange',
    red: 'hl-red', teal: 'hl-teal', brown: 'hl-brown',
  };

  const [insightVerse, setInsightVerse] = useState<number | null>(null);
  const openVerseInsight = (verseNum: number) => {
    dispatch({ type: 'SET_VERSE', verse: verseNum });
    setInsightVerse(verseNum);
  };

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
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
      openVerseInsight(verseNum);
    }
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

  return (
    <div className="flex flex-col h-full relative" style={{ backgroundColor: '#f6f3ec' }}>
      {/* ─── BLACK HEADER (#000) with SVG icon tabs ─── */}
      <header className="shrink-0 safe-top" style={{ backgroundColor: '#000000', paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)' }}>
        <div className="flex items-center justify-between px-4" style={{ height: 56 }}>
          {/* Left: Book + chapter dropdown */}
          <button
            onClick={() => setShowBookSelector(true)}
            className="flex items-center gap-1.5 min-h-[44px] pr-2 -ml-1"
            style={{ color: '#FFFFFF' }}
          >
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '24px', color: '#FFFFFF' }}>{state.book} {state.chapter}</span>
            <ChevronDown size={18} style={{ color: '#FFFFFF' }} strokeWidth={2} />
          </button>

          {/* Right: SVG icon tabs (Bible/Insight) + Menu */}
          <div className="flex items-center gap-3">
            {/* Bible icon — active (gold) */}
            <button aria-label="Bible" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <BibleIcon fill="#b09a6d" />
            </button>
            {/* Insight icon — inactive (white) */}
            <button
              aria-label="Insight"
              onClick={() => navigate(`/read/${encodeURIComponent(state.book)}/${state.chapter}/commentary`)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <AutoStoriesIcon fill="#ffffff" />
            </button>
            <button
              onClick={() => navigate('/menu')}
              aria-label="Open menu"
              className="flex items-center justify-center w-[44px] h-[44px] -mr-2"
            >
              <Menu size={22} style={{ color: '#FFFFFF' }} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── CREAM BODY (#f6f3ec) — scripture ─── */}
      <div
        ref={scrollRef}
        onTouchStart={handleBodyTouchStart}
        onTouchEnd={handleBodyTouchEnd}
        className="flex-1 overflow-y-auto px-4 pt-5 pb-[48px] relative"
        style={{ backgroundColor: '#f6f3ec' }}
      >
        {/* Chapter header block */}
        <div className="flex items-start justify-between mb-3">
          <h1 style={{ fontFamily: 'Merriweather, Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 32, lineHeight: '44px', color: '#000000' }}>
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
                    style={isBookmarked ? { color: '#000000', fill: '#000000' } : { color: '#000000' }}
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
              <FileText size={18} style={{ color: '#000000' }} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Verses grouped by API subtitles */}
        <div
          className="font-scripture"
          style={{
            fontSize: `${state.settings.fontSize}px`,
            color: '#000000',
          }}
        >
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
              <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
                {group.title && (
                  <>
                    <h2 style={{ fontFamily: 'Merriweather, Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 22, lineHeight: '28px', color: '#000000', marginBottom: 4 }}>
                      {group.title}
                    </h2>
                    <p style={{ fontFamily: 'Merriweather, Georgia, serif', fontStyle: 'italic', fontWeight: 400, fontSize: 18, lineHeight: '24px', color: '#3e464d', marginBottom: 12 }}>
                      {group.range}
                    </p>
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
                          <sup className="text-verse-number text-[12px] mr-[2px] select-none align-super">
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

      {/* ─── FLOATING CHAPTER NAV — white circles, black chevrons, bottom: 45px ─── */}
      {state.chapter > 1 && (
        <button
          onClick={() => goToChapter(-1)}
          aria-label="Previous chapter"
          style={{ position: 'absolute', left: 12, bottom: 45, width: 40, height: 40, borderRadius: '50%', background: '#fff', border: '1px solid #dce0e380', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 20, cursor: 'pointer' }}
        >
          <ChevronLeft size={20} color="#000" strokeWidth={2.5} />
        </button>
      )}
      {state.chapter < maxChapter && (
        <button
          onClick={() => goToChapter(1)}
          aria-label="Next chapter"
          style={{ position: 'absolute', right: 12, bottom: 45, width: 40, height: 40, borderRadius: '50%', background: '#fff', border: '1px solid #dce0e380', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 20, cursor: 'pointer' }}
        >
          <ChevronRight size={20} color="#000" strokeWidth={2.5} />
        </button>
      )}

      {/* ─── GOLD PROGRESS BAR — cream bg, snow-rock track, gold fill ─── */}
      <div
        style={{
          height: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          backgroundColor: '#f6f3ec',
          borderTop: '1px solid #dce0e380',
          padding: '0 24px',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          flexShrink: 0,
        }}
      >
        {(() => {
          const bookProgress =
            maxChapter > 0 ? Math.round((state.chapter / maxChapter) * 100) : 0;
          return (
            <>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  backgroundColor: '#eae6de',
                  borderRadius: 10,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#b09a6d',
                    borderRadius: 10,
                    width: `${Math.max(2, bookProgress)}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '16px',
                  color: '#b09a6d',
                  whiteSpace: 'nowrap',
                } as React.CSSProperties}
              >
                {bookProgress}%
              </span>
            </>
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
