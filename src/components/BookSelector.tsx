import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBooks, getRecentBooks, fetchTopics } from '@/services/bibleService';
import { BibleBook, Topic, TopicCategory } from '@/services/types';
import { ChevronRight, Search, ArrowLeft, Clock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { buildTopicUrl } from '@/lib/topicSlugs';

interface Props {
  onClose: () => void;
  onSelect: (book: string, chapter: number, bookId?: number) => void;
  /**
   * Forces the modal to open on a specific tab. Used when the modal is
   * launched from a topic page so the user lands on the Topics list
   * instead of OT/NT, which would otherwise depend on the previously
   * viewed Bible book.
   */
  initialTab?: 'OT' | 'NT' | 'Topics';
  /**
   * Seed the search box with this text on open and focus it immediately.
   * Used by the "just start typing" shortcut so the first character the
   * user pressed lands in the field and the results filter right away.
   */
  initialQuery?: string;
}

type Tab = 'OT' | 'NT' | 'Topics';

// Category pills inside the Topics tab. Order matches verse-mate-mobile's
// BibleNavigationModal so users see the same default landing tab (Events)
// across platforms.
const TOPIC_CATEGORIES: { key: TopicCategory; label: string }[] = [
  { key: 'EVENT', label: 'Events' },
  { key: 'PROPHECY', label: 'Prophecies' },
  { key: 'PARABLE', label: 'Parables' },
  { key: 'THEME', label: 'Themes' },
];

/**
 * BookSelector — unified Search screen with OT / NT / Topics tabs.
 * Figma reference: frames 5172:3418 (OT), 5172:7984 (NT), and the Topics layout in frame 5895:4982.
 * Overlayed on top of Reading via a modal-full-screen pattern.
 */
export default function BookSelector({ onClose, onSelect, initialTab, initialQuery }: Props) {
  const navigate = useNavigate();
  const { state } = useApp();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>(() => {
    if (initialTab) return initialTab;
    // Default to whichever testament the current book belongs to
    return ['Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'].includes(state.book) ? 'NT' : 'OT';
  });
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery ?? '');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicCategory, setTopicCategory] = useState<TopicCategory>('EVENT');
  const [allBooks, setAllBooks] = useState<BibleBook[]>([]);
  const [recents, setRecents] = useState<BibleBook[]>([]);

  useEffect(() => {
    fetchBooks().then(books => {
      setAllBooks(books);
      // Resolve recently viewed book IDs from localStorage against the full list
      const recentIds = getRecentBooks().map(r => r.bookId);
      setRecents(
        recentIds
          .map(id => books.find(b => b.bookId === id))
          .filter((b): b is BibleBook => !!b)
          .slice(0, 5)
      );
    });
    fetchTopics().then(setTopics);
  }, []);

  // When opened via the "just start typing" shortcut, focus the search field
  // and drop the caret after the seeded character so the user keeps typing
  // straight into the box. Only auto-focus in that case — opening the modal
  // by tapping the selector on touch devices shouldn't force the keyboard up.
  useEffect(() => {
    if (!initialQuery) return;
    const el = searchInputRef.current;
    if (!el) return;
    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    // While searching, match across the whole canon regardless of the active
    // OT/NT tab — otherwise looking up a NT book from the OT tab (or vice
    // versa) returns nothing. Mirrors the cross-category Topics search.
    if (q) {
      return allBooks.filter(b => b.name.toLowerCase().includes(q));
    }
    return allBooks.filter(b => b.testament === tab);
  }, [allBooks, tab, query]);

  const filteredTopics = useMemo(() => {
    // When searching, match across all categories — same behavior as
    // verse-mate-mobile's BibleNavigationModal so the search affordance
    // works the same way users expect from the mobile app.
    if (query) {
      return topics.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
    }
    return topics.filter(
      t => String(t.category || '').toUpperCase() === topicCategory
    );
  }, [topics, query, topicCategory]);

  const selectedBookObj = selectedBook
    ? allBooks.find(b => b.name === selectedBook)
    : null;

  // Chapter picker view
  if (selectedBookObj) {
    return (
      <div data-testid="bible-navigation-modal-chapters" className="absolute inset-0 z-50 bg-background flex flex-col items-center animate-fade-in text-foreground">
        <header
          className="shrink-0 safe-top w-full max-w-[680px]"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 48px)' }}
        >
          <div className="relative flex items-center justify-center px-3" style={{ height: 56 }}>
            <button
              onClick={() => setSelectedBook(null)}
              aria-label="Back"
              data-testid="chapter-picker-back-button"
              className="absolute left-2 w-[44px] h-[44px] flex items-center justify-center"
            >
              <ArrowLeft size={22} className="text-foreground" strokeWidth={2} />
            </button>
            <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: 18, lineHeight: '24px', letterSpacing: '-0.01em' }}>{selectedBook}</h2>
          </div>
        </header>

        <div className="sub-screen-body flex-1 px-4 pt-2 pb-6 w-full max-w-[680px]">
          <p className="text-[13px] text-muted-foreground mb-3">Select a chapter</p>
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
            {Array.from({ length: selectedBookObj.chapters }, (_, i) => i + 1).map(ch => (
              <button
                key={ch}
                onClick={() => onSelect(selectedBook, ch, selectedBookObj.bookId)}
                data-testid={`chapter-${ch}`}
                className="h-12 rounded-xl bg-secondary border border-border text-foreground text-[14px] font-medium"
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
    <div data-testid="bible-navigation-modal" className="absolute inset-0 z-50 bg-background flex flex-col items-center animate-fade-in text-foreground">
      {/* Header: Search title.
          Content is capped to a centered column (max-w-[680px]) so the
          full-screen overlay doesn't stretch the tabs / search bar edge-to-edge
          on wide or zoomed-in viewports — see the `items-center` on the parent. */}
      <header
        className="shrink-0 safe-top w-full max-w-[680px]"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 48px)' }}
      >
        <div className="relative flex items-center justify-center px-3" style={{ height: 56 }}>
          <button
            onClick={onClose}
            aria-label="Close"
            data-testid="bible-navigation-modal-close"
            className="absolute left-2 w-[44px] h-[44px] flex items-center justify-center"
          >
            <ArrowLeft size={22} className="text-foreground" strokeWidth={2} />
          </button>
          <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: 18, lineHeight: '24px', letterSpacing: '-0.01em' }}>Search</h2>
        </div>
      </header>

      {/* Segmented tabs */}
      <div className="px-4 pt-2 w-full max-w-[680px]">
        <div className="flex items-center rounded-full bg-secondary p-1">
          {(['OT', 'NT', 'Topics'] as Tab[]).map(t => {
            const label = t === 'OT' ? 'Old Testament' : t === 'NT' ? 'New Testament' : 'Topics';
            const testId =
              t === 'OT' ? 'tab-old-testament' : t === 'NT' ? 'tab-new-testament' : 'tab-topics';
            return (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setQuery('');
                }}
                data-testid={testId}
                className={`flex-1 h-10 rounded-full transition-colors ${
                  tab === t ? 'bg-gold text-[#1A1A1A]' : 'text-foreground/80'
                }`}
                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '24px' }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic category pills (only on Topics tab) — Events / Prophecies / Parables / Themes */}
      {tab === 'Topics' && (
        <div className="px-4 pt-2 w-full max-w-[680px]">
          <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
            {TOPIC_CATEGORIES.map(c => {
              const active = topicCategory === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => {
                    setTopicCategory(c.key);
                    setQuery('');
                  }}
                  data-testid={`topic-category-${c.key.toLowerCase()}`}
                  aria-pressed={active}
                  className={`flex-1 h-8 rounded-full transition-colors ${
                    active ? 'bg-gold text-[#1A1A1A]' : 'text-foreground/80'
                  }`}
                  style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: active ? 500 : 400,
                    fontSize: 13,
                    lineHeight: '20px',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search input */}
      <div className="px-4 pt-3 w-full max-w-[680px]">
        <div className="flex items-center gap-2 h-12 px-4 rounded-full bg-secondary border border-border">
          <Search size={18} className="text-muted-foreground" strokeWidth={2} />
          <input
            ref={searchInputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            data-testid={tab === 'Topics' ? 'topics-search-input' : 'books-search-input'}
            placeholder="Search..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, lineHeight: '24px' }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 w-full max-w-[680px]">
        {tab === 'Topics' ? (
          filteredTopics.length > 0 ? (
            <div>
              {filteredTopics.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    onClose();
                    navigate(buildTopicUrl(t));
                  }}
                  data-testid={`topic-item-${t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
                  className="flex items-center justify-between w-full h-[56px] border-b border-border"
                >
                  <span className="text-[16px] text-foreground text-left">{t.name}</span>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState query={query} loading={topics.length === 0 && !query} what="topics" />
          )
        ) : filteredBooks.length > 0 ? (
          <div>
            {/* Recents (only when no active query) */}
            {!query && recents.length > 0 && (
              <>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70 text-center py-3 border-t border-border">
                  Recents
                </p>
                {recents.map(b => {
                  const isCurrent = b.name === state.book;
                  return (
                    <button
                      key={`recent-${b.bookId}`}
                      onClick={() => setSelectedBook(b.name)}
                      data-testid={`recent-book-item-${b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
                      className="flex items-center justify-between w-full h-[52px] border-b border-border"
                    >
                      <span
                        className={`text-[16px] text-left ${
                          isCurrent ? 'text-gold font-medium' : 'text-foreground'
                        }`}
                      >
                        {b.name}
                      </span>
                      <Clock size={16} className="text-muted-foreground" strokeWidth={1.75} />
                    </button>
                  );
                })}
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70 text-center py-3 border-t border-border">
                  All Books
                </p>
              </>
            )}
            {filteredBooks.map(b => {
              const isCurrent = b.name === state.book;
              return (
                <button
                  key={b.name}
                  onClick={() => setSelectedBook(b.name)}
                  data-testid={`book-item-${b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
                  className="flex items-center justify-between w-full h-[56px] border-b border-border"
                >
                  <span
                    className={`text-[16px] text-left ${
                      isCurrent ? 'text-gold font-medium' : 'text-foreground'
                    }`}
                  >
                    {b.name}
                  </span>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState query={query} loading={allBooks.length === 0 && !query} what="books" />
        )}
      </div>
    </div>
  );
}

function EmptyState({ query, loading, what }: { query: string; loading: boolean; what: 'books' | 'topics' }) {
  if (loading) {
    return <p className="text-center text-muted-foreground text-[14px] py-8">Loading {what}…</p>;
  }
  if (query) {
    return (
      <p className="text-center text-muted-foreground text-[14px] py-8">
        No {what} match "{query}"
      </p>
    );
  }
  return <p className="text-center text-muted-foreground text-[14px] py-8">No {what} available</p>;
}
