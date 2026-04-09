import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BIBLE_BOOKS } from '@/services/bibleData';
import { ChevronRight, Search, ArrowLeft } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSelect: (book: string, chapter: number) => void;
}

type Tab = 'OT' | 'NT' | 'Topics';

const TOPIC_CATEGORIES = [
  { id: 'events', name: 'Events' },
  { id: 'prophecies', name: 'Prophecies' },
  { id: 'parables', name: 'Parables' },
  { id: 'themes', name: 'Themes' },
  { id: 'top-verses', name: 'Top Verses' },
  { id: 'promises', name: 'Promises / Commands / Warnings' },
  { id: 'covenants', name: 'Covenants & Covenant Signs' },
  { id: 'attributes', name: 'Attributes of God' },
  { id: 'christology', name: 'Chistology: Title & Offices of Jesus' },
];

/**
 * BookSelector — unified Search screen with OT / NT / Topics tabs.
 * Figma reference: frames 5172:3418 (OT), 5172:7984 (NT), and the Topics layout in frame 5895:4982.
 * Overlayed on top of Reading via a modal-full-screen pattern.
 */
export default function BookSelector({ onClose, onSelect }: Props) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('OT');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const books = useMemo(
    () => BIBLE_BOOKS.filter(b => b.testament === tab),
    [tab]
  );

  const filteredBooks = useMemo(
    () => books.filter(b => b.name.toLowerCase().includes(query.toLowerCase())),
    [books, query]
  );

  const filteredTopics = useMemo(
    () => TOPIC_CATEGORIES.filter(t => t.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const selectedBookObj = selectedBook
    ? BIBLE_BOOKS.find(b => b.name === selectedBook)
    : null;

  // Chapter picker view
  if (selectedBookObj) {
    return (
      <div className="absolute inset-0 z-50 bg-dark-surface flex flex-col animate-fade-in text-dark-fg">
        <header
          className="shrink-0 safe-top"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 48px)' }}
        >
          <div className="relative flex items-center justify-center px-3" style={{ height: 56 }}>
            <button
              onClick={() => setSelectedBook(null)}
              aria-label="Back"
              className="absolute left-2 w-[44px] h-[44px] flex items-center justify-center"
            >
              <ArrowLeft size={22} className="text-dark-fg" strokeWidth={2} />
            </button>
            <h2 className="text-[18px] font-medium tracking-tight">{selectedBook}</h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pt-2 pb-6">
          <p className="text-[13px] text-dark-muted mb-3">Select a chapter</p>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: selectedBookObj.chapters }, (_, i) => i + 1).map(ch => (
              <button
                key={ch}
                onClick={() => onSelect(selectedBook, ch)}
                className="h-12 rounded-xl bg-dark-raised border border-dark text-dark-fg text-[14px] font-medium"
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-dark-surface flex flex-col animate-fade-in text-dark-fg">
      {/* Header: Search title */}
      <header
        className="shrink-0 safe-top"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 48px)' }}
      >
        <div className="relative flex items-center justify-center px-3" style={{ height: 56 }}>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute left-2 w-[44px] h-[44px] flex items-center justify-center"
          >
            <ArrowLeft size={22} className="text-dark-fg" strokeWidth={2} />
          </button>
          <h2 className="text-[18px] font-medium tracking-tight">Search</h2>
        </div>
      </header>

      {/* Segmented tabs */}
      <div className="px-4 pt-2">
        <div className="flex items-center rounded-full bg-dark-raised p-1">
          {(['OT', 'NT', 'Topics'] as Tab[]).map(t => {
            const label = t === 'OT' ? 'Old Testament' : t === 'NT' ? 'New Testament' : 'Topics';
            return (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setQuery('');
                }}
                className={`flex-1 h-10 rounded-full text-[13px] font-medium transition-colors ${
                  tab === t ? 'bg-gold text-[#1A1A1A]' : 'text-dark-fg/80'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search input */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 h-12 px-4 rounded-full bg-dark-raised border border-dark">
          <Search size={18} className="text-dark-muted" strokeWidth={2} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent text-[15px] text-dark-fg placeholder:text-dark-muted focus:outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6">
        {tab === 'Topics' ? (
          <div>
            {filteredTopics.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  onClose();
                  navigate(`/topics/${t.id}`);
                }}
                className="flex items-center justify-between w-full h-[56px] border-b border-dark"
              >
                <span className="text-[16px] text-dark-fg text-left">{t.name}</span>
                <ChevronRight size={18} className="text-dark-muted" />
              </button>
            ))}
          </div>
        ) : (
          <div>
            {filteredBooks.map(b => (
              <button
                key={b.name}
                onClick={() => setSelectedBook(b.name)}
                className="flex items-center justify-between w-full h-[56px] border-b border-dark"
              >
                <span className="text-[16px] text-dark-fg text-left">{b.name}</span>
                <ChevronRight size={18} className="text-dark-muted" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
