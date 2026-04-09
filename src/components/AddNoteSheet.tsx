import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { X } from 'lucide-react';

interface Props {
  book: string;
  chapter: number;
  verse: number;
  onClose: () => void;
}

export default function AddNoteSheet({ book, chapter, verse, onClose }: Props) {
  const { dispatch } = useApp();
  const [text, setText] = useState('');
  const maxChars = 500;

  const handleSave = () => {
    if (text.length < 10) return;
    dispatch({
      type: 'ADD_NOTE',
      note: {
        id: crypto.randomUUID(),
        book,
        chapter,
        verse,
        text,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    onClose();
  };

  return (
    <>
      <div className="absolute inset-0 z-40 bg-foreground/20" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 z-50 bg-card rounded-t-2xl shadow-lg border-t border-border animate-slide-up">
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <h3 className="font-semibold text-foreground text-[15px]">Add Note</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-[13px] text-muted-foreground">{book} {chapter}:{verse}</p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, maxChars))}
            placeholder="Write your note here (minimum 10 characters)..."
            rows={4}
            className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2.5 text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">{text.length}/{maxChars}</span>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-[13px] font-medium">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={text.length < 10}
                className="px-4 py-2.5 rounded-lg bg-accent text-accent-foreground text-[13px] font-medium disabled:opacity-40 transition-opacity"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
