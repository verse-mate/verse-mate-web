import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Note } from '@/services/types';
import { X, Trash2 } from 'lucide-react';

interface Props {
  note: Note;
  onClose: () => void;
}

export default function EditNoteSheet({ note, onClose }: Props) {
  const { dispatch } = useApp();
  const [text, setText] = useState(note.text);
  const maxChars = 500;

  const handleSave = () => {
    if (text.length < 10) return;
    dispatch({ type: 'UPDATE_NOTE', id: note.id, text });
    onClose();
  };

  const handleDelete = () => {
    dispatch({ type: 'REMOVE_NOTE', id: note.id });
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
          <h3 className="font-semibold text-foreground text-[15px]">Edit Note</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-[13px] text-muted-foreground">{note.book} {note.chapter}:{note.verse}</p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, maxChars))}
            rows={4}
            className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2.5 text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">{text.length}/{maxChars}</span>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="px-4 py-2.5 rounded-lg bg-destructive/10 text-destructive text-[13px] font-medium flex items-center gap-1.5">
                <Trash2 size={14} /> Delete
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
