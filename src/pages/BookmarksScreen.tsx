import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Trash2, ChevronLeft, Bookmark as BookmarkIcon } from 'lucide-react';

export default function BookmarksScreen() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const goToVerse = (book: string, chapter: number) => {
    dispatch({ type: 'SET_PASSAGE', book, chapter });
    navigate('/read');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Dark header */}
      <header className="shrink-0 flex items-center gap-2 px-3 bg-header" style={{ height: 56 }}>
        <button onClick={() => navigate(-1)} className="flex items-center justify-center w-[44px] h-[44px] -ml-2">
          <ChevronLeft size={22} className="text-gold" />
        </button>
        <h1 className="text-[17px] font-semibold text-header-fg">Bookmarks</h1>
      </header>

      {/* Cream body */}
      <div className="flex-1 overflow-y-auto bg-background p-4">
        {state.bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookmarkIcon size={28} className="text-muted-foreground" />
            </div>
            <h2 className="text-[17px] font-semibold text-foreground mb-2">No Bookmarks Yet</h2>
            <p className="text-[13px] text-muted-foreground max-w-[260px]">
              Long-press a verse while reading to bookmark it.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {state.bookmarks.map(bm => (
              <div key={bm.id} className="flex items-center justify-between p-3.5 rounded-lg bg-card border border-border">
                <button onClick={() => goToVerse(bm.book, bm.chapter)} className="text-left flex-1">
                  <p className="font-medium text-foreground text-[14px]">{bm.book} {bm.chapter}:{bm.verse}</p>
                  <p className="text-[12px] text-muted-foreground">{bm.version}</p>
                </button>
                <button onClick={() => dispatch({ type: 'REMOVE_BOOKMARK', id: bm.id })} className="p-2 text-muted-foreground hover:text-destructive">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
