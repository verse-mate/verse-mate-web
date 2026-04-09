import { useApp } from '@/contexts/AppContext';
import { Highlight, HighlightColor } from '@/services/types';
import { X, Trash2 } from 'lucide-react';

interface Props {
  highlight: Highlight;
  onClose: () => void;
}

const HIGHLIGHT_COLORS: { color: HighlightColor; label: string; className: string }[] = [
  { color: 'yellow', label: 'Yellow', className: 'bg-highlight-yellow' },
  { color: 'green', label: 'Green', className: 'bg-highlight-green' },
  { color: 'blue', label: 'Blue', className: 'bg-highlight-blue' },
  { color: 'pink', label: 'Pink', className: 'bg-highlight-pink' },
  { color: 'orange', label: 'Orange', className: 'bg-highlight-orange' },
];

export default function HighlightOptionsSheet({ highlight, onClose }: Props) {
  const { dispatch } = useApp();

  const handleColorChange = (color: HighlightColor) => {
    dispatch({ type: 'UPDATE_HIGHLIGHT', id: highlight.id, color });
    onClose();
  };

  const handleRemove = () => {
    dispatch({ type: 'REMOVE_HIGHLIGHT', id: highlight.id });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/20" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-2xl shadow-lg border-t border-border animate-slide-up max-w-lg mx-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">{highlight.book} {highlight.chapter}:{highlight.verse}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">Change highlight color</p>
          <div className="flex items-center gap-3">
            {HIGHLIGHT_COLORS.map(c => (
              <button
                key={c.color}
                onClick={() => handleColorChange(c.color)}
                className={`w-10 h-10 rounded-full ${c.className} border-2 ${
                  highlight.color === c.color ? 'border-accent' : 'border-transparent'
                } transition-all hover:scale-110`}
                title={c.label}
              />
            ))}
          </div>
          <button
            onClick={handleRemove}
            className="flex items-center gap-2 w-full py-3.5 px-4 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
          >
            <Trash2 size={16} /> Remove Highlight
          </button>
        </div>
      </div>
    </>
  );
}
