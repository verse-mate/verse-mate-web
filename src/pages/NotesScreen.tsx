import { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { FileText, MoreHorizontal } from 'lucide-react';
import { Note } from '@/services/types';
import EditNoteSheet from '@/components/EditNoteSheet';
import NoteOptionsSheet from '@/components/NoteOptionsSheet';
import ScreenHeader from '@/components/ScreenHeader';

/**
 * NotesScreen — dark full-screen list grouped by passage.
 * Figma reference frames: Notes 1 (empty) + Notes 2 (with notes), Mobile App section.
 */
export default function NotesScreen() {
  const { state } = useApp();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [optionsNote, setOptionsNote] = useState<Note | null>(null);
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handlePressStart = (note: Note) => {
    const timer = setTimeout(() => setOptionsNote(note), 500);
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
    setPressTimer(null);
  };

  // Title shown in header — default to "Notes" or the current passage
  const headerTitle = useMemo(() => {
    if (state.notes.length === 0) return 'Notes';
    return `${state.book} ${state.chapter}`;
  }, [state.notes.length, state.book, state.chapter]);

  return (
    <div className="flex flex-col h-full bg-dark-surface text-dark-fg relative">
      <ScreenHeader title={headerTitle} />

      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-6">
        {state.notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center pb-20">
            <FileText size={48} className="text-dark-muted mb-3" strokeWidth={1.5} />
            <p className="text-dark-muted text-[14px]">No notes yet</p>
            <p className="text-dark-muted/70 text-[12px] mt-1 max-w-[240px]">
              Long-press a verse while reading to capture your reflections
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.notes.map(note => (
              <button
                key={note.id}
                onTouchStart={() => handlePressStart(note)}
                onTouchEnd={handlePressEnd}
                onMouseDown={() => handlePressStart(note)}
                onMouseUp={handlePressEnd}
                onClick={() => setEditingNote(note)}
                className="flex items-center justify-between pl-4 pr-1 min-h-[56px] w-full rounded-xl bg-dark-raised border border-dark text-left"
              >
                <span className="text-[14px] text-dark-fg pr-3 line-clamp-1">
                  {note.text || `${note.book} ${note.chapter}:${note.verse}`}
                </span>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setOptionsNote(note);
                  }}
                  className="w-[44px] h-[44px] flex items-center justify-center shrink-0"
                  role="button"
                  aria-label="Note options"
                >
                  <MoreHorizontal size={18} className="text-dark-muted" strokeWidth={1.5} />
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
          onEdit={() => {
            setEditingNote(optionsNote);
            setOptionsNote(null);
          }}
        />
      )}
    </div>
  );
}
