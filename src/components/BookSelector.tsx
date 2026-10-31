import { useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  fetchBooks,
  getRecentBooks,
  fetchTopics,
  fetchLocalizedBookNames,
  type VerseSearchResult,
} from '@/services/bibleService';
import { fetchJesusEntries, fetchJesusOverview } from '@/services/jesusService';
import {
  BibleBook,
  JesusEntry,
  JesusOverview,
  Topic,
  TopicCategory,
} from '@/services/types';
import { ChevronRight, Search, ArrowLeft, Clock, CornerDownRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useKeyboardTop } from '@/hooks/useKeyboardTop';
import { buildTopicUrl } from '@/lib/topicSlugs';
import {
  buildJesusEntryUrl,
  buildJesusKindUrl,
  buildJesusLifeUrl,
  buildJesusStudyUrl,
  jesusTestId,
  JESUS_ROOT,
} from '@/lib/jesusSlugs';
import { ReferenceParser, type BibleReference } from '@versemate/bible-search';
import { buildVerseUrl } from '@/lib/bibleSearch/verseLinks';
import { useVerseSearch } from '@/hooks/useVerseSearch';
import { splitBookScope } from '@/lib/bibleSearch/bookScope';
import VerseSearchSection from '@/components/search/VerseSearchSection';
import { LOAD_MORE_OPTION_ID, verseOptionId } from '@/lib/bibleSearch/resultIds';
import { analytics } from '@/lib/analytics';

interface Props {
  onClose: () => void;
  onSelect: (book: string, chapter: number, bookId?: number) => void;
  /**
   * Forces the modal to open on a specific tab, overriding the route-derived
   * default below. Callers that already know the section they belong to (a
   * topic or Jesus screen) can pass it explicitly.
   */
  initialTab?: 'OT' | 'NT' | 'Jesus' | 'Topics';
  /**
   * Seed the search box with this text on open and focus it immediately.
   * Used by the "just start typing" shortcut so the first character the
   * user pressed lands in the field and the results filter right away.
   */
  initialQuery?: string;
  /**
   * Compact presentation for when the selector is shown inside a size-capped
   * modal card (mobile layout reached by zooming a desktop browser). Drops the
   * full-screen safe-area top padding and trims font sizes / row heights so the
   * content reads as a tidy modal rather than an oversized full-screen page.
   */
  compact?: boolean;
}

type Tab = 'OT' | 'NT' | 'Jesus' | 'Topics';

/** One keyboard-reachable row of the search results (combobox option). */
interface SearchOption {
  id: string;
  select: () => void;
}

const LISTBOX_ID = 'bible-search-results';
const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * One row in the Jesus tab's browse list. The tab is a jumping-off point into
 * the full feature rather than a second implementation of it, so each row is
 * just a label and a destination.
 */
interface JesusNavRow {
  label: string;
  count: number;
  to: string;
  testId: string;
}

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
export default function BookSelector({ onClose, onSelect, initialTab, initialQuery, compact }: Props) {
  // Header top padding: full-screen honors the notch inset (min 48px); the
  // compact modal drops it to 4px since there's no status bar to clear.
  const headerPadTop = compact ? 4 : 'max(env(safe-area-inset-top, 0px), 48px)';
  // Trimmed type scale + row heights for the compact modal.
  const titleSize = compact ? 16 : 18;
  const rowText = compact ? 'text-[14px]' : 'text-[16px]';
  const bookRowH = compact ? 'h-[48px]' : 'h-[56px]';
  const recentRowH = compact ? 'h-[44px]' : 'h-[52px]';
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useApp();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>(() => {
    if (initialTab) return initialTab;
    // Open on the tab matching whatever the user is currently looking at, so
    // reopening the search from a Jesus or Topics screen lands back on that
    // tab — the same way OT/NT follows the book being read.
    if (location.pathname.startsWith('/jesus')) return 'Jesus';
    // Covers both URL shapes: /topic/<category>/<slug> and /topics[/...].
    if (location.pathname.startsWith('/topic')) return 'Topics';
    // Otherwise default to whichever testament the current book belongs to
    return ['Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'].includes(state.book) ? 'NT' : 'OT';
  });
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery ?? '');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicCategory, setTopicCategory] = useState<TopicCategory>('EVENT');
  const [allBooks, setAllBooks] = useState<BibleBook[]>([]);
  const [recents, setRecents] = useState<BibleBook[]>([]);
  const [jesusOverview, setJesusOverview] = useState<JesusOverview | null>(null);
  const [jesusResults, setJesusResults] = useState<JesusEntry[]>([]);
  // Four tabs don't fit "Old Testament" / "New Testament" on a narrow phone,
  // so those two abbreviate below ~420px. The test ids stay constant.
  const roomForLongLabels = useMediaQuery('(min-width: 420px)');
  // The current version's own book names ("Geneza", "1. Mose"), so a
  // reference typed in the reader's language is understood too.
  const [localizedNames, setLocalizedNames] = useState<Record<number, string>>({});
  const [activeIndex, setActiveIndex] = useState(-1);
  // Phones and tablets: the on-screen keyboard and iOS's focus zoom.
  const hasCoarsePointer = useMediaQuery('(pointer: coarse)');
  const keyboardTop = useKeyboardTop();
  const listRef = useRef<HTMLDivElement>(null);
  // The compact modal is short (especially when the browser is zoomed in), so
  // the title, tabs and search field scroll away with the results instead of
  // staying fixed above them: the whole card is the scroller there.
  const rootRef = useRef<HTMLDivElement>(null);
  const scroller = useCallback(() => (compact ? rootRef.current : listRef.current), [compact]);
  // Search mode (phones and tablets): tapping the field slides the title row
  // and the tabs away so the bar sits at the top, with an arrow beside it to
  // come back. It holds while the keyboard comes and goes; only that arrow
  // (or closing Search) leaves it.
  const [searchMode, setSearchMode] = useState(false);
  const chromeRef = useRef<HTMLDivElement>(null);

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

  // The Jesus overview is small and drives the whole tab, so it's fetched once
  // on open rather than lazily when the tab is first selected — switching tabs
  // should never show a spinner.
  useEffect(() => {
    fetchJesusOverview(state.version).then(setJesusOverview);
  }, [state.version]);

  useEffect(() => {
    fetchLocalizedBookNames(state.version).then(setLocalizedNames);
  }, [state.version]);

  // Searching inside the Jesus tab hits the backend rather than filtering the
  // browse rows: the useful thing to find is an entry ("every question about
  // prayer"), not the name of a category.
  useEffect(() => {
    const term = query.trim();
    if (tab !== 'Jesus' || !term) {
      setJesusResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      fetchJesusEntries({ q: term, limit: 40 }, state.version).then(data => {
        if (!cancelled) setJesusResults(data.entries);
      });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tab, query, state.version]);

  // Follow His Life, then every kind, then the featured studies — the same
  // order as the hub screen so the two read as one feature.
  const jesusRows = useMemo<JesusNavRow[]>(() => {
    if (!jesusOverview) return [];
    const lifeCount = jesusOverview.periods.reduce((n, p) => n + p.entry_count, 0);
    return [
      {
        label: 'Follow His Life',
        count: lifeCount,
        to: buildJesusLifeUrl(),
        testId: 'jesus-tab-follow-his-life',
      },
      ...jesusOverview.sections.flatMap(section =>
        section.kinds.map(kind => ({
          label: kind.label,
          count: kind.entry_count,
          to: buildJesusKindUrl(kind.slug),
          testId: jesusTestId('jesus-tab-kind', kind.slug),
        })),
      ),
      ...jesusOverview.collections.map(collection => ({
        label: collection.name,
        count: collection.entry_count,
        to: buildJesusStudyUrl(collection.slug),
        testId: jesusTestId('jesus-tab-study', collection.slug),
      })),
    ];
  }, [jesusOverview]);

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

  // ─── Bible search (OT / NT tabs) ─────────────────────────────────────
  // Typing on the Bible tabs searches three things at once: references
  // ("John 3:16" → a "Go to" row), book names, and verse text.
  const isBibleTab = tab === 'OT' || tab === 'NT';
  const searching = isBibleTab && query.trim() !== '';

  const parser = useMemo(
    () =>
      new ReferenceParser(
        allBooks.map(b => ({ bookId: b.bookId, name: b.name, chapters: b.chapters })),
        localizedNames,
      ),
    [allBooks, localizedNames],
  );
  const references = useMemo<BibleReference[]>(
    () => (searching && allBooks.length > 0 ? parser.parse(query) : []),
    [searching, allBooks.length, parser, query],
  );
  // "John 3:16" is a place, not words to look for; "Job" or "Romans" may be
  // either, so those still search verse text too.
  const isPureReference = references.some(r => r.chapter !== undefined);
  // A book-only reference whose book is already listed under Books ("Romans")
  // would just repeat that row; keep it for "rom", "Philipians", "Geneza".
  const goToRefs = references.filter(
    r => r.chapter !== undefined || !filteredBooks.some(b => b.bookId === r.bookId),
  );
  // "Amos XYZ": a book name followed by words searches those words in that
  // book. "Search all books" turns it off for the text as typed.
  const bookScope = useMemo(
    () => (searching && !isPureReference && allBooks.length > 0 ? splitBookScope(query, parser, localizedNames) : null),
    [searching, isPureReference, allBooks.length, query, parser, localizedNames],
  );
  const [unscopedQuery, setUnscopedQuery] = useState<string | null>(null);
  const scope = bookScope && unscopedQuery !== query.trim() ? bookScope : null;
  const verseSearch = useVerseSearch(
    scope ? scope.text : query,
    state.version,
    searching && !isPureReference,
    scope?.bookId,
  );

  const goToReference = (ref: BibleReference) => {
    analytics.track('bible_search_go_to', {
      kind: ref.verseStart !== undefined ? 'verse' : ref.chapter !== undefined ? 'chapter' : 'book',
    });
    if (ref.chapter === undefined) {
      setSelectedBook(ref.bookName); // book only: open its chapter picker
      return;
    }
    const url = buildVerseUrl(
      ref.bookId,
      ref.chapter,
      ref.verseStart !== undefined
        ? {
            start: ref.verseStart,
            // A range into the next chapter only marks its first verse.
            end: ref.chapterEnd === undefined ? ref.verseEnd : undefined,
            // A typed reference goes straight to the verse and marks it in
            // the text (see ReadingScreen) — no Verse Insight popup.
          }
        : undefined,
    );
    if (!url) return;
    onClose();
    navigate(url);
  };

  const openVerseResult = (r: VerseSearchResult, index: number) => {
    analytics.track('bible_search_result_click', { match: r.match, position: index });
    const url = buildVerseUrl(r.bookId, r.chapter, { start: r.verse, insight: true });
    if (!url) return;
    onClose();
    navigate(url);
  };

  // Every row of the results in screen order, for arrow keys + Enter.
  const searchOptions = useMemo<SearchOption[]>(() => {
    if (!searching) return [];
    const options: SearchOption[] = goToRefs.map((ref, i) => ({
      id: `search-go-to-${i}`,
      select: () => goToReference(ref),
    }));
    for (const b of filteredBooks) {
      options.push({ id: `search-book-${b.bookId}`, select: () => setSelectedBook(b.name) });
    }
    verseSearch.results.forEach((r, i) => {
      options.push({ id: verseOptionId(r), select: () => openVerseResult(r, i) });
    });
    if (verseSearch.nextCursor) {
      options.push({ id: LOAD_MORE_OPTION_ID, select: verseSearch.loadMore });
    }
    return options;
    // goToReference / openVerseResult only close over stable values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searching, goToRefs, filteredBooks, verseSearch.results, verseSearch.nextCursor, verseSearch.loadMore]);
  const activeId = searchOptions[activeIndex]?.id ?? null;

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, tab]);

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const picked =
        activeIndex >= 0
          ? searchOptions[activeIndex]
          : goToRefs.length > 0 || !hasCoarsePointer
            ? searchOptions[0]
            : undefined;
      if (picked) picked.select();
      // The on-screen keyboard's Search key with nothing picked: put the
      // keyboard away so the results can be read, rather than opening the
      // first one.
      else searchInputRef.current?.blur();
      return;
    }
    if (!searching || searchOptions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, searchOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    }
  };

  const exitSearchMode = () => {
    setSearchMode(false);
    setQuery('');
    searchInputRef.current?.blur();
  };

  // The folded-away title row and tabs must not take keyboard focus.
  useEffect(() => {
    if (chromeRef.current) chromeRef.current.inert = searchMode;
  }, [searchMode]);

  // The keyboard covers the bottom of a full-screen list: pad the list by
  // that much so its last rows can still scroll above the keyboard.
  const [keyboardOverlap, setKeyboardOverlap] = useState(0);
  useLayoutEffect(() => {
    const list = scroller();
    if (!list || keyboardTop === null) {
      setKeyboardOverlap(0);
      return;
    }
    setKeyboardOverlap(Math.max(0, Math.round(list.getBoundingClientRect().bottom - keyboardTop)));
  }, [keyboardTop, searchMode, scroller]);

  // New text or a new filter is a new list: start it at the top, not at the
  // scroll position of the previous results.
  useEffect(() => {
    scroller()?.scrollTo?.({ top: 0 });
  }, [query, verseSearch.filters, scroller]);

  // Dragging the results puts the keyboard away, as native search screens do.
  const dismissKeyboard = () => {
    const input = searchInputRef.current;
    if (input && document.activeElement === input) input.blur();
  };

  const selectedBookObj = selectedBook
    ? allBooks.find(b => b.name === selectedBook)
    : null;

  // Chapter picker view
  if (selectedBookObj) {
    return (
      <div data-testid="bible-navigation-modal-chapters" className="absolute inset-0 z-50 bg-background flex flex-col items-center animate-fade-in text-foreground">
        <header
          className="shrink-0 safe-top w-full max-w-[680px]"
          style={{ paddingTop: headerPadTop }}
        >
          <div className="relative flex items-center justify-center px-3" style={{ height: compact ? 44 : 56 }}>
            <button
              onClick={() => setSelectedBook(null)}
              aria-label="Back"
              data-testid="chapter-picker-back-button"
              className="absolute left-2 w-[44px] h-[44px] flex items-center justify-center"
            >
              <ArrowLeft size={22} className="text-foreground" strokeWidth={2} />
            </button>
            <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: titleSize, lineHeight: '24px', letterSpacing: '-0.01em' }}>{selectedBook}</h2>
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
    <div
      ref={rootRef}
      onTouchMove={compact ? dismissKeyboard : undefined}
      data-testid="bible-navigation-modal"
      className={`absolute inset-0 z-50 bg-background flex flex-col items-center animate-fade-in text-foreground ${
        compact ? 'overflow-y-auto' : ''
      }`}
      style={compact && keyboardOverlap ? { paddingBottom: keyboardOverlap } : undefined}
    >
      {/* Header: Search title.
          Content is capped to a centered column (max-w-[680px]) so the
          full-screen overlay doesn't stretch the tabs / search bar edge-to-edge
          on wide or zoomed-in viewports — see the `items-center` on the parent. */}
      <div
        ref={chromeRef}
        data-testid="search-chrome"
        aria-hidden={searchMode || undefined}
        className={`search-chrome shrink-0 w-full ${searchMode ? 'is-folded' : ''}`}
      >
        <div className="flex flex-col items-center">
          <header
            className="shrink-0 safe-top w-full max-w-[680px]"
            style={{ paddingTop: headerPadTop }}
          >
            <div className="relative flex items-center justify-center px-3" style={{ height: compact ? 44 : 56 }}>
              <button
                onClick={onClose}
                aria-label="Close"
                data-testid="bible-navigation-modal-close"
                className="absolute left-2 w-[44px] h-[44px] flex items-center justify-center"
              >
                <ArrowLeft size={22} className="text-foreground" strokeWidth={2} />
              </button>
              <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: titleSize, lineHeight: '24px', letterSpacing: '-0.01em' }}>Search</h2>
            </div>
          </header>

          {/* Segmented tabs */}
          <div className="px-4 pt-2 w-full max-w-[680px]">
            <div className="flex items-center gap-0.5 rounded-full bg-secondary p-1">
              {(['OT', 'NT', 'Jesus', 'Topics'] as Tab[]).map(t => {
                const label =
                  t === 'OT'
                    ? roomForLongLabels
                      ? 'Old Testament'
                      : 'OT'
                    : t === 'NT'
                      ? roomForLongLabels
                        ? 'New Testament'
                        : 'NT'
                      : t;
                const testId =
                  t === 'OT'
                    ? 'tab-old-testament'
                    : t === 'NT'
                      ? 'tab-new-testament'
                      : t === 'Jesus'
                        ? 'tab-jesus'
                        : 'tab-topics';
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setTab(t);
                      setQuery('');
                    }}
                    data-testid={testId}
                    // `flex-auto` (not `flex-1`) so each tab starts at its own
                    // label width and only the leftover space is split evenly.
                    // Equal-width tabs crowded "Old Testament" and "New Testament"
                    // together while padding out "Jesus" / "Topics".
                    className={`flex-auto ${compact ? 'h-9 px-2' : 'h-10 px-2.5'} rounded-full transition-colors ${
                      tab === t ? 'bg-gold text-[#1A1A1A]' : 'text-foreground/80'
                    }`}
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontWeight: 400,
                      // Four tabs share the row, so the type scale drops a step
                      // from the previous three-tab layout.
                      fontSize: compact ? 12 : 13,
                      lineHeight: '24px',
                      whiteSpace: 'nowrap',
                    }}
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

        </div>
      </div>

      {/* Search input. In search mode the arrow slides in beside it. */}
      <div
        className={`shrink-0 flex items-center px-4 ${compact ? 'pt-2' : 'pt-3'} w-full max-w-[680px] transition-[padding] duration-200`}
        style={searchMode ? { paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' } : undefined}
      >
        <button
          onClick={exitSearchMode}
          aria-label="Back to browsing"
          aria-hidden={!searchMode || undefined}
          tabIndex={searchMode ? 0 : -1}
          data-testid="search-mode-back"
          className={`search-back shrink-0 h-[44px] flex items-center justify-center overflow-hidden ${
            searchMode ? 'is-shown' : ''
          }`}
        >
          <ArrowLeft size={22} className="text-foreground shrink-0" strokeWidth={2} />
        </button>
        <div className={`flex flex-1 items-center gap-2 ${compact ? 'h-10' : 'h-12'} px-4 rounded-full bg-secondary border border-border`}>
          <Search size={18} className="text-muted-foreground" strokeWidth={2} />
          <input
            ref={searchInputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
            onFocus={() => {
              if (hasCoarsePointer) setSearchMode(true);
            }}
            enterKeyHint="search"
            {...(isBibleTab
              ? {
                  role: 'combobox',
                  'aria-label': 'Search books, verses and references',
                  'aria-autocomplete': 'list' as const,
                  'aria-expanded': searching,
                  'aria-controls': LISTBOX_ID,
                  'aria-activedescendant': activeId ?? undefined,
                }
              : {})}
            data-testid={
              tab === 'Topics'
                ? 'topics-search-input'
                : tab === 'Jesus'
                  ? 'jesus-search-input'
                  : 'books-search-input'
            }
            placeholder={
              tab === 'Jesus'
                ? 'Search His words and actions...'
                : isBibleTab
                  ? 'Search verses, or go to John 3:16'
                  : 'Search...'
            }
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            // iOS Safari zooms the page in when an input under 16px gets
            // focus; keep touch screens at 16px so it doesn't.
            style={{ fontFamily: 'Roboto, sans-serif', fontSize: hasCoarsePointer ? 16 : 14, lineHeight: '24px' }}
          />
        </div>
      </div>

      {/* List */}
      <div
        ref={listRef}
        onTouchMove={compact ? undefined : dismissKeyboard}
        className={`px-4 pb-6 w-full max-w-[680px] ${compact ? 'shrink-0 pt-1' : 'flex-1 overflow-y-auto pt-3'}`}
        style={!compact && keyboardOverlap ? { paddingBottom: keyboardOverlap + 24 } : undefined}
      >
        {tab === 'Jesus' ? (
          query.trim() ? (
            jesusResults.length > 0 ? (
              <div data-testid="jesus-tab-results">
                {jesusResults.map(entry => (
                  <button
                    key={entry.slug}
                    onClick={() => {
                      onClose();
                      navigate(buildJesusEntryUrl(entry.slug));
                    }}
                    data-testid={jesusTestId('jesus-tab-entry', entry.slug)}
                    className={`flex items-center justify-between gap-3 w-full ${bookRowH} border-b border-border`}
                  >
                    <span className="flex flex-col items-start min-w-0">
                      <span className={`${rowText} text-foreground text-left truncate max-w-full`}>
                        {entry.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {entry.kind_label}
                        {entry.references[0] ? ` · ${entry.references[0].display}` : ''}
                      </span>
                    </span>
                    <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState query={query} loading={false} what="entries" />
            )
          ) : jesusRows.length > 0 ? (
            <div data-testid="jesus-tab-list">
              {jesusRows.map(row => (
                <button
                  key={row.to}
                  onClick={() => {
                    onClose();
                    navigate(row.to);
                  }}
                  data-testid={row.testId}
                  className={`flex items-center justify-between gap-3 w-full ${bookRowH} border-b border-border`}
                >
                  <span className={`${rowText} text-foreground text-left`}>{row.label}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    {row.count > 0 && (
                      <span className="text-[12px] text-muted-foreground">{row.count}</span>
                    )}
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </span>
                </button>
              ))}
              <button
                onClick={() => {
                  onClose();
                  navigate(JESUS_ROOT);
                }}
                data-testid="jesus-tab-open-hub"
                className="w-full py-4 text-[14px] text-gold"
              >
                Open the Jesus tab →
              </button>
            </div>
          ) : (
            <EmptyState query={query} loading={jesusOverview === null} what="entries" />
          )
        ) : tab === 'Topics' ? (
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
                  className={`flex items-center justify-between w-full ${bookRowH} border-b border-border`}
                >
                  <span className={`${rowText} text-foreground text-left`}>{t.name}</span>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState query={query} loading={topics.length === 0 && !query} what="topics" />
          )
        ) : searching ? (
          <div role="listbox" id={LISTBOX_ID} aria-label="Search results" data-testid="bible-search-results">
            {goToRefs.length > 0 && (
              <div data-testid="search-go-to">
                {goToRefs.map((ref, i) => {
                  const id = `search-go-to-${i}`;
                  return (
                    <button
                      key={id}
                      id={id}
                      role="option"
                      aria-selected={activeId === id}
                      tabIndex={-1}
                      onClick={() => goToReference(ref)}
                      data-testid={id}
                      className={`flex items-center gap-3 w-full ${bookRowH} px-2 -mx-2 border-b border-border ${
                        activeId === id ? 'bg-secondary' : ''
                      }`}
                    >
                      <CornerDownRight size={18} className="text-gold shrink-0" strokeWidth={2} />
                      <span className={`${rowText} text-foreground text-left`}>
                        Go to <span className="font-medium">{ref.display}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {filteredBooks.length > 0 && (
              <>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70 pt-4 pb-1">
                  Books
                </p>
                {filteredBooks.map(b => {
                  const id = `search-book-${b.bookId}`;
                  return (
                    <button
                      key={id}
                      id={id}
                      role="option"
                      aria-selected={activeId === id}
                      tabIndex={-1}
                      onClick={() => setSelectedBook(b.name)}
                      data-testid={`book-item-${slugify(b.name)}`}
                      className={`flex items-center justify-between w-full ${bookRowH} px-2 -mx-2 border-b border-border ${
                        activeId === id ? 'bg-secondary' : ''
                      }`}
                    >
                      <span className={`${rowText} text-left text-foreground`}>{b.name}</span>
                      <ChevronRight size={18} className="text-muted-foreground" />
                    </button>
                  );
                })}
              </>
            )}
            {verseSearch.active && (
              <VerseSearchSection
                query={scope ? scope.text : query}
                search={verseSearch}
                activeId={activeId}
                compact={compact}
                onPick={openVerseResult}
                scope={scope ? { bookName: scope.bookName, onSearchAll: () => setUnscopedQuery(query.trim()) } : null}
              />
            )}
            {goToRefs.length === 0 && filteredBooks.length === 0 && !verseSearch.active && (
              <EmptyState query={query} loading={allBooks.length === 0} what="books" />
            )}
          </div>
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
                      className={`flex items-center justify-between w-full ${recentRowH} border-b border-border`}
                    >
                      <span
                        className={`${rowText} text-left ${
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
                  className={`flex items-center justify-between w-full ${bookRowH} border-b border-border`}
                >
                  <span
                    className={`${rowText} text-left ${
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

function EmptyState({
  query,
  loading,
  what,
}: {
  query: string;
  loading: boolean;
  what: 'books' | 'topics' | 'entries';
}) {
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
