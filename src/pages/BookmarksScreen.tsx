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

      {/* bookmarkList: dark surface, border-top dark, padding 12px 8px */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '12px 8px',
          borderTop: '1px solid hsl(var(--dark-border))',
          backgroundColor: 'hsl(var(--dark-surface))',
          scrollbarWidth: 'thin' as const,
          scrollbarColor: 'hsl(var(--dark-border)) hsl(var(--dark-surface))',
        }}
      >
        {state.bookmarks.length === 0 ? (
          <div
            style={{ padding: 16, textAlign: 'center', color: 'hsl(var(--dark-surface-muted))', fontStyle: 'italic' }}
          >
            <Bookmark size={48} style={{ margin: '0 auto 12px', color: 'hsl(var(--dark-surface-muted))' }} strokeWidth={1.5} />
            <p style={{ fontSize: 14 }}>No bookmarks yet</p>
            <p style={{ fontSize: 12, marginTop: 4, color: 'hsl(var(--dark-surface-muted))' }}>
              Long-press a verse to save it here
            </p>
          </div>
        ) : (
          <>
            {state.bookmarks.map(b => (
              /* bookmarkItem: bg dark-raised, border dark, border-radius 8px, padding 12px */
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: 'hsl(var(--dark-surface-raised))',
                  border: '1px solid hsl(var(--dark-border))',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                <button
                  onClick={() => handleOpen(b.book, b.chapter, b.bookId)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flex: 1,
                    textAlign: 'left',
                    padding: 0,
                  }}
                >
                  <Bookmark size={18} style={{ color: '#fff' }} strokeWidth={1.5} fill="currentColor" />
                  {/* bookmarkTitle: font-weight 500, color white */}
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>
                    {b.book} {b.chapter}
                    {b.verse ? `:${b.verse}` : ''}
                  </span>
                </button>
                {/* removeButton: 36x36, circular, X icon */}
                <button
                  onClick={() => handleDelete(b.id)}
                  aria-label="Remove Bookmark"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    color: 'hsl(var(--dark-surface-muted))',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
