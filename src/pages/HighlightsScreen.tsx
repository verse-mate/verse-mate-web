import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Highlighter } from 'lucide-react';
import { Highlight, HighlightColor } from '@/services/types';
import HighlightOptionsSheet from '@/components/HighlightOptionsSheet';
import ScreenHeader from '@/components/ScreenHeader';

const colorDotClass: Record<HighlightColor, string> = {
  yellow: 'bg-yellow-400',
  green: 'bg-green-400',
  blue: 'bg-blue-400',
  pink: 'bg-pink-400',
  orange: 'bg-orange-400',
};

/**
 * HighlightsScreen — dark full-screen list, one card per highlighted verse.
 * Figma reference: Highlights 1 (empty) + Highlights 2 (with items), Mobile App section.
 */
export default function HighlightsScreen() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handlePressStart = (hl: Highlight) => {
    const timer = setTimeout(() => setSelectedHighlight(hl), 500);
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
    setPressTimer(null);
  };

  const openVerse = (hl: Highlight) => {
    dispatch({ type: 'SET_PASSAGE', book: hl.book, chapter: hl.chapter });
    navigate('/read');
  };

  return (
    <div className="flex flex-col h-full bg-dark-surface text-dark-fg relative">
      <ScreenHeader title="Highlights" />

      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-6">
        {state.highlights.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center pb-20">
            <Highlighter size={48} className="text-dark-muted mb-3" strokeWidth={1.5} />
            <p className="text-dark-muted text-[14px]">No highlights yet</p>
            <p className="text-dark-muted/70 text-[12px] mt-1 max-w-[240px]">
              Long-press a verse and choose a color to highlight it
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.highlights.map(hl => (
              <button
                key={hl.id}
                onClick={() => openVerse(hl)}
                onTouchStart={() => handlePressStart(hl)}
                onTouchEnd={handlePressEnd}
                onMouseDown={() => handlePressStart(hl)}
                onMouseUp={handlePressEnd}
                className="flex items-center gap-3 px-4 h-[56px] w-full rounded-xl bg-dark-raised border border-dark text-left"
              >
                <span className={`inline-block w-3 h-3 rounded-full shrink-0 ${colorDotClass[hl.color]}`} />
                <span className="text-[15px] text-dark-fg">
                  {hl.book} {hl.chapter}:{hl.verse}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedHighlight && (
        <HighlightOptionsSheet
          highlight={selectedHighlight}
          onClose={() => setSelectedHighlight(null)}
        />
      )}
    </div>
  );
}
