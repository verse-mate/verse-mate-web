import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { StickyNote, FileText } from 'lucide-react';
import { Note } from '@/services/types';
import EditNoteSheet from '@/components/EditNoteSheet';
import NoteOptionsSheet from '@/components/NoteOptionsSheet';

export default function NotesScreen() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [optionsNote, setOptionsNote] = useState<Note | null>(null);
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (note: Note) => {
    const timer = setTimeout(() => setOptionsNote(note), 500);
    setPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
    setPressTimer(null);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 py-3 border-b border-border bg-card">
        <h1 className="text-lg font-semibold text-foreground">Notes</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {state.notes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <FileText size={28} className="text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No Notes Yet</h2>
            <p className="text-sm text-muted-foreground max-w-[260px]">
              Long-press a verse while reading to add your first note. Your reflections will appear here.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {state.notes.map(note => (
              <button
                key={note.id}
                onClick={() => setEditingNote(note)}
                onTouchStart={() => handleTouchStart(note)}
                onTouchEnd={handleTouchEnd}
                onMouseDown={() => handleTouchStart(note)}
                onMouseUp={handleTouchEnd}
                className="flex items-start gap-3 w-full p-4 rounded-lg bg-card border border-border hover:bg-secondary transition-colors text-left"
              >
                <StickyNote size={18} className="text-accent mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{note.book} {note.chapter}:{note.verse}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{note.text}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{new Date(note.updatedAt).toLocaleDateString()}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {editingNote && (
        <EditNoteSheet note={editingNote} onClose={() => setEditingNote(null)} />
      )}

      {optionsNote && (
        <NoteOptionsSheet
          note={optionsNote}
          onClose={() => setOptionsNote(null)}
          onEdit={() => { setOptionsNote(null); setEditingNote(optionsNote); }}
        />
      )}
    </div>
  );
}
