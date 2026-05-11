import { useMemo, useState } from 'react';
import { X, FileText } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface Props {
  book: string;
  bookId: number;
  chapter: number;
  onClose: () => void;
}

/**
 * Chapter-level notes sheet (issue #130).
 *
 * Opened from the notes (📄) icon in the Bible reading header. Lists the
 * user's existing notes for this `bookId + chapter` and exposes an
 * "Add New Note" form. Closing the sheet (X or backdrop tap) keeps the
 * user on the Bible page they were reading.
 *
 * Chapter-level notes use `verse: 0` to match the convention `BookmarksScreen`
 * uses for chapter-level bookmarks (filtered via `!b.verse`).
 */
export default function ChapterNotesSheet({ book, bookId, chapter, onClose }: Props) {
  const { state, addNote } = useApp();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  // Show every note attached to this chapter (verse-level + chapter-level)
  // so the user has full visibility into what they've already captured here.
  const chapterNotes = useMemo(
    () =>
      state.notes
        .filter(n => n.bookId === bookId && n.chapter === chapter)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [state.notes, bookId, chapter],
  );

  const handleAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await addNote({
        bookId,
        book,
        chapter,
        verse: 0,
        text: trimmed,
      });
      setText('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        data-testid="chapter-notes-sheet-backdrop"
        onClick={onClose}
        className="absolute inset-0 z-40 bg-black/60 animate-fade-in"
      />
      {/* Centered modal — same 480px desktop max-width as VerseInsightSheet
          (`.verse-insight-sheet` media query in index.css). Centered on
          both axes via flex on the absolute-positioned wrapper. */}
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          data-testid="chapter-notes-sheet"
          role="dialog"
          aria-label={`Notes for ${book} ${chapter}`}
          className="pointer-events-auto w-full max-w-[480px] bg-dark-surface rounded-2xl border border-dark shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-fade-in flex flex-col"
          style={{ maxHeight: '85vh' }}
        >
          <header className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-dark">
            <h3 className="text-[16px] font-semibold text-dark-fg">
              Notes for {book} {chapter}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close"
              data-testid="chapter-notes-sheet-close"
              className="w-9 h-9 flex items-center justify-center"
            >
              <X size={18} className="text-dark-fg" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {chapterNotes.length > 0 && (
              <ul className="space-y-2" data-testid="chapter-notes-existing-list">
                {chapterNotes.map(n => (
                  <li
                    key={n.id}
                    data-testid={`chapter-note-item-${n.id}`}
                    className="rounded-2xl bg-dark-raised border border-dark px-4 py-3"
                  >
                    {n.verse > 0 && (
                      <p className="text-[11px] uppercase tracking-wide text-dark-muted mb-1">
                        Verse {n.verse}
                      </p>
                    )}
                    <p className="text-[14px] text-dark-fg whitespace-pre-wrap">{n.text}</p>
                  </li>
                ))}
              </ul>
            )}

            <section>
              <h4 className="text-[14px] font-semibold text-dark-fg mb-2">Add New Note</h4>
              <textarea
                data-testid="chapter-notes-textarea"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Write your note here..."
                rows={4}
                className="w-full rounded-2xl bg-dark-raised border border-dark px-4 py-3 text-[14px] text-dark-fg placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] resize-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  data-testid="chapter-notes-add-button"
                  onClick={handleAdd}
                  disabled={text.trim().length === 0 || saving}
                  className="px-4 h-10 rounded-xl bg-gold text-[#1A1A1A] text-[13px] font-medium disabled:opacity-40 inline-flex items-center gap-2"
                >
                  <FileText size={14} />
                  {saving ? 'Saving…' : 'Add Note'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
