import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { fetchChapter } from '@/services/bibleService';
import { Chapter, HighlightColor } from '@/services/types';
import { ChevronDown, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import BookSelector from '@/components/BookSelector';
import VersionPicker from '@/components/VersionPicker';
import VerseActions from '@/components/VerseActions';
import OptionsSheet from '@/components/OptionsSheet';
import { BIBLE_BOOKS } from '@/services/bibleData';

export default function ReadingScreen() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showVersionPicker, setShowVersionPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [longPressVerse, setLongPressVerse] = useState<number | null>(null);
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchChapter(state.book, state.chapter, state.version).then(setChapter);
  }, [state.book, state.chapter, state.version]);

  const currentBook = BIBLE_BOOKS.find(b => b.name === state.book);
  const maxChapter = currentBook?.chapters || 1;

  const goToChapter = useCallback((delta: number) => {
    const next = state.chapter + delta;
    if (next >= 1 && next <= maxChapter) {
      dispatch({ type: 'SET_PASSAGE', book: state.book, chapter: next });
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

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 border-b border-border bg-card">
        <button
          onClick={() => setShowBookSelector(true)}
          className="flex items-center gap-1 font-semibold text-foreground"
        >
          <span className="text-[17px]">{state.book} {state.chapter}</span>
          <ChevronDown size={18} className="text-muted-foreground" />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowVersionPicker(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-[13px] font-medium"
          >
            {state.version}
            <ChevronDown size={14} />
          </button>
          <button
            onClick={() => setShowOptions(true)}
            className="p-2 rounded-full hover:bg-secondary"
          >
            <MoreVertical size={20} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Verses */}
      <div className="flex-1 overflow-y-auto px-4 py-5" style={{ fontSize: `${state.settings.fontSize}px` }}>
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
              className={`font-scripture inline transition-colors ${
                hl ? highlightColorClass[hl.color] : ''
              } ${isSelected ? 'ring-2 ring-accent ring-offset-1 rounded' : ''}`}
            >
              <sup className="text-muted-foreground font-sans text-[0.65em] mr-0.5 select-none font-medium">
                {verse.number}
              </sup>
              {verse.text}{' '}
            </span>
          );
        })}
      </div>

      {/* Chapter nav */}
      <div className="sticky bottom-0 flex items-center justify-between px-4 py-2 border-t border-border bg-card">
        <button
          onClick={() => goToChapter(-1)}
          disabled={state.chapter <= 1}
          className="flex items-center gap-1 text-[13px] text-muted-foreground disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="text-[13px] text-muted-foreground font-medium">
          {state.chapter} of {maxChapter}
        </span>
        <button
          onClick={() => goToChapter(1)}
          disabled={state.chapter >= maxChapter}
          className="flex items-center gap-1 text-[13px] text-muted-foreground disabled:opacity-30"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Modals & Sheets — all absolute within phone frame */}
      {showBookSelector && (
        <BookSelector
          onClose={() => setShowBookSelector(false)}
          onSelect={(book, ch) => {
            dispatch({ type: 'SET_PASSAGE', book, chapter: ch });
            setShowBookSelector(false);
          }}
        />
      )}
      {showVersionPicker && <VersionPicker onClose={() => setShowVersionPicker(false)} />}
      {showOptions && <OptionsSheet onClose={() => setShowOptions(false)} />}
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
