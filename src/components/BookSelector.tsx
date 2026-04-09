import { useState } from 'react';
import { BIBLE_BOOKS } from '@/services/bibleData';
import { ChevronLeft } from 'lucide-react';

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
    <div className="absolute inset-0 z-50 bg-dark-surface flex flex-col animate-fade-in">
      {/* Dark header */}
      <div className="shrink-0 flex items-center gap-2 px-3" style={{ height: 56 }}>
        <button
          onClick={selectedBook ? () => setSelectedBook(null) : onClose}
          className="flex items-center justify-center w-[44px] h-[44px] -ml-2"
        >
          <ChevronLeft size={22} className="text-gold" />
        </button>
        <h2 className="text-[17px] font-semibold text-dark-fg">
          {selectedBook || (tab === 'OT' ? 'Old Testament' : 'New Testament')}
        </h2>
      </div>

      {!selectedBook ? (
        <>
          {/* OT / NT tabs */}
          <div className="flex shrink-0 border-b border-dark">
            {(['OT', 'NT'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-[14px] font-medium transition-colors ${
                  tab === t
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-dark-muted'
                }`}
              >
                {t === 'OT' ? 'Old Testament' : 'New Testament'}
              </button>
            ))}
          </div>

          {/* Book grid — 3 columns */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-3 gap-2">
              {books.map(b => (
                <button
                  key={b.name}
                  onClick={() => setSelectedBook(b.name)}
                  className="py-3 px-2 rounded-lg bg-dark-raised text-dark-fg text-[13px] font-medium text-center hover:bg-gold hover:text-foreground transition-colors"
                >
                  {b.shortName}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Chapter picker grid */
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-[13px] text-dark-muted mb-3">Select chapter</p>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: book!.chapters }, (_, i) => i + 1).map(ch => (
              <button
                key={ch}
                onClick={() => onSelect(selectedBook, ch)}
                className="py-2.5 rounded-lg bg-dark-raised text-dark-fg text-[14px] font-medium hover:bg-gold hover:text-foreground transition-colors"
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
