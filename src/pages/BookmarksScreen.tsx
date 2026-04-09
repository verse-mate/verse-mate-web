import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, StickyNote, Highlighter, Trash2 } from 'lucide-react';

export default function BookmarksScreen() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const goToVerse = (book: string, chapter: number) => {
    dispatch({ type: 'SET_PASSAGE', book, chapter });
    navigate('/read');
  };

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 py-3 border-b border-border bg-card">
        <h1 className="text-lg font-semibold text-foreground">Bookmarks & Notes</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Bookmarks */}
        <section className="p-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <BookOpen size={14} /> Bookmarks ({state.bookmarks.length})
          </h2>
          {state.bookmarks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No bookmarks yet. Long-press a verse to bookmark it.</p>
          ) : (
            <div className="space-y-2">
              {state.bookmarks.map(bm => (
                <div key={bm.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                  <button onClick={() => goToVerse(bm.book, bm.chapter)} className="text-left flex-1">
                    <p className="font-medium text-foreground">{bm.book} {bm.chapter}:{bm.verse}</p>
                    <p className="text-xs text-muted-foreground">{bm.version}</p>
                  </button>
                  <button onClick={() => dispatch({ type: 'REMOVE_BOOKMARK', id: bm.id })} className="p-2 text-muted-foreground hover:text-destructive">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Notes */}
        <section className="p-4 pt-0">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <StickyNote size={14} /> Notes ({state.notes.length})
          </h2>
          {state.notes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No notes yet. Long-press a verse to add a note.</p>
          ) : (
            <div className="space-y-2">
              {state.notes.map(note => (
                <div key={note.id} className="p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <button onClick={() => goToVerse(note.book, note.chapter)} className="font-medium text-sm text-foreground">
                      {note.book} {note.chapter}:{note.verse}
                    </button>
                    <button onClick={() => dispatch({ type: 'REMOVE_NOTE', id: note.id })} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">{note.text}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Highlights */}
        <section className="p-4 pt-0">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Highlighter size={14} /> Highlights ({state.highlights.length})
          </h2>
          {state.highlights.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No highlights yet. Long-press a verse to highlight it.</p>
          ) : (
            <div className="space-y-2">
              {state.highlights.map(hl => (
                <div key={hl.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                  <button onClick={() => goToVerse(hl.book, hl.chapter)} className="text-left flex-1">
                    <p className="font-medium text-foreground">{hl.book} {hl.chapter}:{hl.verse}</p>
                    <div className={`w-4 h-4 rounded-full bg-highlight-${hl.color} mt-1`} />
                  </button>
                  <button onClick={() => dispatch({ type: 'REMOVE_HIGHLIGHT', id: hl.id })} className="p-2 text-muted-foreground hover:text-destructive">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
