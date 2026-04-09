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
      <div className="fixed inset-0 z-40 bg-foreground/20" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-2xl shadow-lg border-t border-border animate-slide-up max-w-lg mx-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Edit Note</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">{note.book} {note.chapter}:{note.verse}</p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, maxChars))}
            rows={5}
            className="w-full rounded-lg border border-input bg-background text-foreground px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{text.length}/{maxChars}</span>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="px-4 py-2.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-1.5">
                <Trash2 size={14} /> Delete
              </button>
              <button
                onClick={handleSave}
                disabled={text.length < 10}
                className="px-4 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium disabled:opacity-40 transition-opacity"
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
