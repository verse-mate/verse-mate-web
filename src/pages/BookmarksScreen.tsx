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
    <div className="flex flex-col h-full bg-white text-[#1B1B1B]">
      <ScreenHeader title="Bookmarks" />

      {/* bookmarkList: bg fantasy, border-top geyser-opacity, padding 12px 8px, max-height 300px, overflow-y auto */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '12px 8px',
          borderTop: '1px solid rgba(220,224,227,0.5)',
          backgroundColor: '#f6f3ec',
          scrollbarWidth: 'thin' as const,
          scrollbarColor: '#dce0e3 #f6f3ec',
        }}
      >
        {state.bookmarks.length === 0 ? (
          <div
            style={{ padding: 16, textAlign: 'center', color: '#818990', fontStyle: 'italic' }}
          >
            <Bookmark size={48} style={{ margin: '0 auto 12px', color: '#818990' }} strokeWidth={1.5} />
            <p style={{ fontSize: 14 }}>No bookmarks yet</p>
            <p style={{ fontSize: 12, marginTop: 4, color: 'rgba(129,137,144,0.7)' }}>
              Long-press a verse to save it here
            </p>
          </div>
        ) : (
          <>
            {state.bookmarks.map(b => (
              /* bookmarkItem: bg white, border geyser-opacity, border-radius 8px, padding 12px, box-shadow */
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: '#fff',
                  border: '1px solid rgba(220,224,227,0.5)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
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
                  <Bookmark size={18} style={{ color: '#1B1B1B' }} strokeWidth={1.5} fill="currentColor" />
                  {/* bookmarkTitle: font-weight 500, color #1B1B1B */}
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#1B1B1B' }}>
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
                    color: '#818990',
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
