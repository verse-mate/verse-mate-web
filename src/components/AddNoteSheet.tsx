import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { X } from 'lucide-react';

interface Props {
  book: string;
  chapter: number;
  verse: number;
  /** Words selected in the verse (the selection toolbar's Note): the note starts by quoting them. */
  quote?: string;
  /**
   * Show as a centred card (the desktop search box's size and shape) instead of a bottom sheet.
   * The number is the x to centre on (the reading column); null centres on the window.
   */
  centerX?: number | null;
  onClose: () => void;
}

export default function AddNoteSheet({ book, chapter, verse, quote, centerX, onClose }: Props) {
  const card = centerX !== undefined;
  const { state, addNote } = useApp();
  const [text, setText] = useState(() =>
    quote ? `\u201C${quote}\u201D\n\n`.slice(0, 500) : '',
  );
  const [saving, setSaving] = useState(false);
  const maxChars = 500;

  const handleSave = async () => {
    if (text.length < 10) return;
    setSaving(true);
    try {
      await addNote({
        bookId: state.bookId,
        book,
        chapter,
        verse,
        text,
      });
    } finally {
      setSaving(false);
      onClose();
    }
  };

  return (
    <>
      <div
        className={`${card ? 'fixed' : 'absolute'} inset-0 z-40 bg-black/60`}
        onClick={onClose}
      />
      <div
        data-testid="add-note-sheet"
        className={
          card
            ? 'fixed z-50 bg-background rounded-2xl border border-border'
            : 'absolute inset-x-0 bottom-0 z-50 bg-background rounded-t-[24px] border-t border-border safe-bottom animate-slide-up'
        }
        style={
          card
            ? {
                // The desktop search box: 420px wide, centred over the reading column.
                top: '50%',
                left: centerX ?? '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(420px, 92vw)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              }
            : undefined
        }
      >
        {!card && (
          <div className="flex justify-center pt-3">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/40" />
          </div>
        )}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-[16px] font-semibold text-foreground">Add Note</h3>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center">
            <X size={18} className="text-foreground" />
          </button>
        </div>
        <div className="px-4 pb-5 space-y-3">
          <p className="text-[13px] text-muted-foreground">
            {book} {chapter}:{verse}
          </p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, maxChars))}
            placeholder="Write your note here (minimum 10 characters)..."
            rows={5}
            autoFocus={card}
            className="w-full rounded-2xl bg-secondary border border-border px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {text.length}/{maxChars}
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 h-10 rounded-xl bg-secondary border border-border text-foreground text-[13px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={text.length < 10 || saving}
                className="px-4 h-10 rounded-xl bg-gold text-[#1A1A1A] text-[13px] font-medium disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
