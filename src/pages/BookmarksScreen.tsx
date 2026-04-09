import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Trash2 } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';

export default function BookmarksScreen() {
  const { state, dispatch, removeBookmark } = useApp();
  const navigate = useNavigate();

  const handleOpen = (book: string, chapter: number, bookId?: number) => {
    dispatch({ type: 'SET_PASSAGE', book, chapter, bookId });
    navigate('/read');
  };

  const handleDelete = async (id: string) => {
    await removeBookmark(id);
  };

  return (
    <div className="flex flex-col h-full bg-dark-surface text-dark-fg">
      <ScreenHeader title="Bookmarks" />

      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-6">
        {state.bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center pb-20">
            <Bookmark size={48} className="text-dark-muted mb-3" strokeWidth={1.5} />
            <p className="text-dark-muted text-[14px]">No bookmarks yet</p>
            <p className="text-dark-muted/70 text-[12px] mt-1">
              Long-press a verse to save it here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.bookmarks.map(b => (
              <div
                key={b.id}
                className="flex items-center justify-between pl-4 pr-1 h-[56px] rounded-xl bg-dark-raised border border-dark"
              >
                <button
                  onClick={() => handleOpen(b.book, b.chapter, b.bookId)}
                  className="flex items-center gap-3 flex-1 text-left h-full"
                >
                  <Bookmark size={18} className="text-dark-fg" strokeWidth={1.5} fill="currentColor" />
                  <span className="text-[15px] text-dark-fg font-normal">
                    {b.book} {b.chapter}
                    {b.verse ? `:${b.verse}` : ''}
                  </span>
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  aria-label="Delete bookmark"
                  className="w-[44px] h-[44px] flex items-center justify-center"
                >
                  <Trash2 size={18} className="text-red-400" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
