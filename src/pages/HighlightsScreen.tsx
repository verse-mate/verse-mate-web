import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Paintbrush } from 'lucide-react';
import { Highlight } from '@/services/types';
import HighlightOptionsSheet from '@/components/HighlightOptionsSheet';

const colorLabels: Record<string, string> = {
  yellow: 'Yellow', green: 'Green', blue: 'Blue', pink: 'Pink', orange: 'Orange',
};

export default function HighlightsScreen() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (hl: Highlight) => {
    const timer = setTimeout(() => setSelectedHighlight(hl), 500);
    setPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
    setPressTimer(null);
  };

  const goToVerse = (hl: Highlight) => {
    dispatch({ type: 'SET_PASSAGE', book: hl.book, chapter: hl.chapter });
    navigate('/read');
  };

  return (
    <div className="flex flex-col h-full relative">
      <header className="sticky top-0 z-10 px-4 py-2.5 border-b border-border bg-card">
        <h1 className="text-[17px] font-semibold text-foreground">Highlights</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {state.highlights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Paintbrush size={28} className="text-muted-foreground" />
            </div>
            <h2 className="text-[17px] font-semibold text-foreground mb-2">No Highlights Yet</h2>
            <p className="text-[13px] text-muted-foreground max-w-[260px]">
              Long-press a verse while reading and choose a highlight color. Your highlights will appear here.
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-1.5">
            {state.highlights.map(hl => (
              <button
                key={hl.id}
                onClick={() => goToVerse(hl)}
                onTouchStart={() => handleTouchStart(hl)}
                onTouchEnd={handleTouchEnd}
                onMouseDown={() => handleTouchStart(hl)}
                onMouseUp={handleTouchEnd}
                className="flex items-center gap-3 w-full p-3.5 rounded-lg bg-card border border-border hover:bg-secondary transition-colors text-left"
              >
                <div className={`w-5 h-5 rounded-full bg-highlight-${hl.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-[14px]">{hl.book} {hl.chapter}:{hl.verse}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{colorLabels[hl.color]} · {new Date(hl.createdAt).toLocaleDateString()}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedHighlight && (
        <HighlightOptionsSheet highlight={selectedHighlight} onClose={() => setSelectedHighlight(null)} />
      )}
    </div>
  );
}
