import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { FileText, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Note } from '@/services/types';
import EditNoteSheet from '@/components/EditNoteSheet';
import NoteOptionsSheet from '@/components/NoteOptionsSheet';
import ScreenHeader from '@/components/ScreenHeader';

/**
 * NotesScreen — two modes:
 *  1) Index view (no :chapter param): list of chapters grouped by book+chapter
 *     with a count badge and chevron → tap to drill in (Figma: Notes 1).
 *  2) Chapter view (/notes/:book/:chapter): flat list of notes for that chapter
 *     with overflow menu (Figma: Notes 2).
 */
export default function NotesScreen() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { book: bookParam, chapter: chapterParam } = useParams<{
    book?: string;
    chapter?: string;
  }>();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [optionsNote, setOptionsNote] = useState<Note | null>(null);

  const isChapterView = !!(bookParam && chapterParam);
  const activeBook = bookParam ? decodeURIComponent(bookParam) : '';
  const activeChapter = chapterParam ? parseInt(chapterParam, 10) : 0;

  // Group notes by book+chapter for the index view
  const groups = useMemo(() => {
    const map = new Map<
      string,
      { book: string; bookId: number; chapter: number; count: number }
    >();
    for (const n of state.notes) {
      const key = `${n.bookId}:${n.chapter}`;
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else
        map.set(key, {
          book: n.book,
          bookId: n.bookId,
          chapter: n.chapter,
          count: 1,
        });
    }
    return Array.from(map.values()).sort((a, b) => a.bookId - b.bookId || a.chapter - b.chapter);
  }, [state.notes]);

  const notesForChapter = useMemo(
    () =>
      state.notes.filter(
        n => n.book === activeBook && n.chapter === activeChapter
      ),
    [state.notes, activeBook, activeChapter]
  );

  const openChapter = (book: string, chapter: number, bookId: number) => {
    dispatch({ type: 'SET_PASSAGE', book, chapter, bookId });
    navigate(`/notes/${encodeURIComponent(book)}/${chapter}`);
  };

  // ─── Index view ─────────────────────────────────────────────────────────
  if (!isChapterView) {
    return (
      <div className="flex flex-col h-full bg-white text-[#1B1B1B] relative">
        <ScreenHeader title="Notes" />

        <div className="flex-1 overflow-y-auto px-4 pt-2 pb-6">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pb-20">
              <FileText size={48} className="text-[#818990] mb-3" strokeWidth={1.5} />
              <p className="text-[#818990] text-[14px]">No notes yet</p>
              <p className="text-[#818990]/70 text-[12px] mt-1 max-w-[240px]">
                Long-press a verse while reading to capture your reflections
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map(g => (
                <button
                  key={`${g.bookId}:${g.chapter}`}
                  onClick={() => openChapter(g.book, g.chapter, g.bookId)}
                  className="flex items-center justify-between w-full h-[56px] px-4 rounded-xl bg-[#f8f9fa] border border-[#dce0e380]"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-[#1B1B1B]" strokeWidth={1.75} />
                    <span className="text-[15px] text-[#1B1B1B]">
                      {g.book} {g.chapter}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-[#818990] bg-white rounded px-2 py-0.5 min-w-[28px] text-center">
                      {g.count}
                    </span>
                    <ChevronRight size={18} className="text-[#818990]" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Chapter view ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white text-[#1B1B1B] relative">
      <ScreenHeader
        title={`${activeBook} ${activeChapter}`}
        onBack={() => navigate('/notes')}
      />

      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-6">
        {notesForChapter.length === 0 ? (
          <p className="text-center text-[#818990] py-8 text-[14px]">No notes here yet.</p>
        ) : (
          <div className="space-y-3">
            {notesForChapter.map(note => (
              <button
                key={note.id}
                onClick={() => setEditingNote(note)}
                className="flex items-center justify-between w-full min-h-[56px] px-4 rounded-xl bg-[#f8f9fa] border border-[#dce0e380] text-left"
              >
                <span className="text-[14px] text-[#1B1B1B] pr-3 line-clamp-2">
                  {note.text || `${note.book} ${note.chapter}:${note.verse}`}
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setOptionsNote(note);
                  }}
                  aria-label="Note options"
                  className="w-[44px] h-[44px] flex items-center justify-center shrink-0 -mr-2"
                >
                  <MoreHorizontal size={18} className="text-[#818990]" strokeWidth={1.5} />
                </button>
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
