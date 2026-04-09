import { useState } from 'react';
import { BIBLE_BOOKS } from '@/services/bibleData';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSelect: (book: string, chapter: number) => void;
}

export default function BookSelector({ onClose, onSelect }: Props) {
  const [tab, setTab] = useState<'OT' | 'NT'>('NT');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const books = BIBLE_BOOKS.filter(b => b.testament === tab);
  const book = selectedBook ? BIBLE_BOOKS.find(b => b.name === selectedBook) : null;

  return (
    <div className="absolute inset-0 z-50 bg-background animate-fade-in flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-[17px] font-semibold text-foreground">
          {selectedBook ? selectedBook : 'Select Book'}
        </h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
          <X size={20} />
        </button>
      </div>

      {!selectedBook ? (
        <>
          {/* Tabs */}
          <div className="flex border-b border-border">
            {(['OT', 'NT'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-muted-foreground'
                }`}
              >
                {t === 'OT' ? 'Old Testament' : 'New Testament'}
              </button>
            ))}
          </div>

          {/* Book grid */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-4 gap-1.5">
              {books.map(b => (
                <button
                  key={b.name}
                  onClick={() => setSelectedBook(b.name)}
                  className="py-2.5 px-1 rounded-lg bg-secondary text-secondary-foreground text-[12px] font-medium text-center hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {b.shortName}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Chapter picker */
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-[13px] text-muted-foreground mb-3">Select chapter</p>
          <div className="grid grid-cols-6 gap-1.5">
            {Array.from({ length: book!.chapters }, (_, i) => i + 1).map(ch => (
              <button
                key={ch}
                onClick={() => onSelect(selectedBook, ch)}
                className="py-2.5 rounded-lg bg-secondary text-secondary-foreground text-[13px] font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {ch}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedBook(null)}
            className="mt-4 text-[13px] text-accent font-medium"
          >
            ← Back to books
          </button>
        </div>
      )}
    </div>
  );
}
