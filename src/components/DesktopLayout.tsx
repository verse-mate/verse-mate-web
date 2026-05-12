import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { fetchCommentary, fetchBooks, fetchChapter } from '@/services/bibleService';
import { BibleBook } from '@/services/types';
import { Commentary } from '@/services/types';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Menu,
  User,
  Bookmark,
  FileText,
  Highlighter,
  Settings,
  Info,
  Heart,
  HelpCircle,
  LogOut,
  X,
  Copy,
  Check,
} from 'lucide-react';
import ShareIcon from '@/components/ShareIcon';
import BookSelector from '@/components/BookSelector';
import StudyPanel from '@/components/StudyPanel';
import { RightPanelProvider } from '@/contexts/RightPanelContext';
import { AudioInlineEntry } from '@/audio';
import BookmarksScreen from '@/pages/BookmarksScreen';
import NotesScreen from '@/pages/NotesScreen';
import HighlightsScreen from '@/pages/HighlightsScreen';
import SettingsScreen from '@/pages/SettingsScreen';
import AboutScreen from '@/pages/AboutScreen';
import GivingScreen from '@/pages/GivingScreen';
import HelpScreen from '@/pages/HelpScreen';
import SignInScreen from '@/pages/SignInScreen';
import { vmTokens } from '@/styles/themeStyles';

type RightPanelView = 'commentary' | 'bookmarks' | 'notes' | 'highlights' | 'settings' | 'about' | 'giving' | 'help' | 'signin';

const RIGHT_PANEL_COMPONENTS: Record<Exclude<RightPanelView, 'commentary'>, { component: React.FC; label: string }> = {
  bookmarks: { component: BookmarksScreen, label: 'Bookmarks' },
  notes: { component: NotesScreen, label: 'Notes' },
  highlights: { component: HighlightsScreen, label: 'Highlights' },
  settings: { component: SettingsScreen, label: 'Settings' },
  about: { component: AboutScreen, label: 'About' },
  giving: { component: GivingScreen, label: 'Giving' },
  help: { component: HelpScreen, label: 'Help' },
  signin: { component: SignInScreen, label: 'Sign In' },
};

type Tab = 'summary' | 'byline' | 'detailed' | 'study';

const MIN_LEFT_PCT = 35;
const MAX_LEFT_PCT = 80;
const SIDEBAR_COLLAPSED = 56;
const SIDEBAR_EXPANDED = 220;
const SIDEBAR_MIN = 56;
const SIDEBAR_MAX = 320;
// Below this width the sidebar switches to compact mode (short book codes,
// abbreviated OT/NT section labels, narrower chapter grid).
const SIDEBAR_COMPACT_THRESHOLD = 120;

/**
 * DesktopLayout — split-view for ≥1024px viewports.
 *
 * Far-left: persistent mini-sidebar with book list
 * Left panel (resizable): current Bible reading content via <Outlet />
 * Drag handle: resize between panels
 * Right panel (remainder): commentary for the current book/chapter
 * Shared header: spans full width (minus sidebar)
 */
export default function DesktopLayout({ hideSidebar = false }: { hideSidebar?: boolean }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!hideSidebar);
  // Sidebar always stays at expanded width; expandedBook controls chapter grid visibility
  const [expandedBook, setExpandedBook] = useState<string | null>(state.book);

  // Per-testament collapse state for the sidebar's OT / NT section headers,
  // persisted across reloads. Default both expanded.
  const [sectionOpen, setSectionOpen] = useState<{ OT: boolean; NT: boolean }>(() => {
    try {
      const raw = localStorage.getItem('versemate-sidebar-sections');
      if (raw) {
        const parsed = JSON.parse(raw);
        return { OT: parsed.OT !== false, NT: parsed.NT !== false };
      }
    } catch { /* ignore */ }
    return { OT: true, NT: true };
  });
  const toggleSection = useCallback((key: 'OT' | 'NT') => {
    setSectionOpen(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem('versemate-sidebar-sections', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Right panel: only one menu page at a time, back always returns to commentary
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>('commentary');

  const openRightPanel = (view: RightPanelView) => {
    setRightPanelView(view);
  };
  const closeRightPanel = () => {
    setRightPanelView('commentary');
  };

  // Topic routes (`/topic/<cat>/<slug>`, `/topics/:topicId`,
  // `/topics/:topicId/:eventId`, `/topics/:topicId/:eventId/most-quoted`)
  // render their own full-width content in the LEFT panel via <Outlet />.
  // The chrome that's tied to a Bible passage — chapter selector, the
  // Summary/By-Line/Detailed/Study commentary tabs, and the entire right
  // pane — has nothing to display in a topic context, so we hide all of
  // it and let the topic content take the full split-body width.
  const isTopicRoute =
    location.pathname.startsWith('/topic/') ||
    location.pathname.startsWith('/topics');

  // Resizable split state (percentage of content area, not including sidebar)
  const [leftPct, setLeftPct] = useState(65);
  const isDragging = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Resizable sidebar state — width in px, persisted across reloads.
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('versemate-sidebar-width');
      if (raw) {
        const n = parseInt(raw, 10);
        if (!isNaN(n)) return Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, n));
      }
    } catch { /* ignore */ }
    return SIDEBAR_EXPANDED;
  });
  const isDraggingSidebar = useRef(false);
  useEffect(() => {
    try { localStorage.setItem('versemate-sidebar-width', String(sidebarWidth)); } catch { /* ignore */ }
  }, [sidebarWidth]);

  // Right panel commentary state
  // Persist the active tab across remounts (e.g. portrait↔landscape rotation
  // crosses the 768/1024 breakpoints, swapping AppLayout branch and unmounting
  // this component). sessionStorage keeps the value within the browser tab so
  // the user lands back on the tab they were reading.
  const [tab, setTab] = useState<Tab>(() => {
    try {
      const v = sessionStorage.getItem('versemate-commentary-tab');
      if (v === 'summary' || v === 'byline' || v === 'detailed' || v === 'study') return v;
    } catch { /* ignore */ }
    return 'byline';
  });
  useEffect(() => {
    try { sessionStorage.setItem('versemate-commentary-tab', tab); } catch { /* ignore */ }
  }, [tab]);
  const [commentaries, setCommentaries] = useState<Commentary[]>([]);
  const [verseTexts, setVerseTexts] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<number | null>(-2); // -2 = all expanded by default
  const commentaryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCommentary(state.book, state.chapter).then(setCommentaries);
    // Also fetch the chapter so we can render verse text inside .byline-body
    // .byline-verse-quote (prototype shows the quoted verse above the
    // "Summary" block — the byline API only returns commentary, not verses).
    fetchChapter(state.book, state.chapter, state.version).then(ch => {
      const map: Record<number, string> = {};
      for (const v of ch?.verses || []) map[v.number] = v.text;
      setVerseTexts(map);
    });
    setExpanded(-2); // Reset to all-expanded on chapter change
    commentaryScrollRef.current?.scrollTo(0, 0); // Scroll commentary to top
    // Reset right panel + commentary tab whenever the user navigates to a
    // new chapter. Without this, opening Settings then jumping to a new
    // book leaves Settings pinned in the right pane, and a chapter change
    // mid-Detailed-tab leaves Detailed active even though By-Line is the
    // canonical default for a fresh chapter.
    setRightPanelView('commentary');
    setTab('byline');
  }, [state.book, state.chapter, state.version]);

  // Auto-scroll removed — users scroll the Insights panel independently

  // On desktop, redirect commentary route back to /read since we show it inline
  useEffect(() => {
    if (location.pathname.includes('/commentary')) {
      navigate('/read', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Keyboard navigation: left/right arrow keys for chapter switching
  const [books, setBooks] = useState<BibleBook[]>([]);
  useEffect(() => { fetchBooks().then(setBooks); }, []);
  const currentBook = books.find(b => b.name === state.book);
  const maxChapter = currentBook?.chapters || 1;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === 'ArrowLeft' && state.chapter > 1) {
      dispatch({ type: 'SET_PASSAGE', book: state.book, chapter: state.chapter - 1 });
    } else if (e.key === 'ArrowRight' && state.chapter < maxChapter) {
      dispatch({ type: 'SET_PASSAGE', book: state.book, chapter: state.chapter + 1 });
    }
  }, [state.book, state.chapter, maxChapter, dispatch]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ─── Drag-to-resize handlers (PointerEvent so touch + mouse both fire) ───
  const handleDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleSidebarDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingSidebar.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (isDraggingSidebar.current) {
        // Sidebar starts at viewport x = 0
        const w = Math.round(e.clientX);
        setSidebarWidth(Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, w)));
        return;
      }
      if (!isDragging.current || !contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.round((x / rect.width) * 100);
      setLeftPct(Math.max(MIN_LEFT_PCT, Math.min(MAX_LEFT_PCT, pct)));
    };
    const handleUp = () => {
      if (isDragging.current || isDraggingSidebar.current) {
        isDragging.current = false;
        isDraggingSidebar.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'byline', label: 'By Line' },
    { id: 'detailed', label: 'Detailed' },
    { id: 'study', label: 'Study' },
  ];

  const otBooks = books.filter(b => b.testament === 'OT');
  const ntBooks = books.filter(b => b.testament === 'NT');

  const isSidebarCompact = sidebarWidth < SIDEBAR_COMPACT_THRESHOLD;

  return (
    // Prototype layout: .app-shell wraps the sidebar + main column.
    // .sidebar / .sidebar-header / .sidebar-scroll come straight from
    // src/styles/prototype.css. Inline overrides are kept to a minimum.
    <div data-testid="desktop-layout" className="app-shell">
      {/* ─── PERSISTENT SIDEBAR ─── */}
      {sidebarOpen && (
        <aside
          data-testid="desktop-sidebar"
          className="sidebar"
          style={{ width: sidebarWidth }}
        >
          <div className="sidebar-header">Books</div>
          <div className="sidebar-scroll mini-sidebar-scroll">
            <SidebarSection
              label="Old Testament"
              books={otBooks}
              activeBook={state.book}
              activeChapter={state.chapter}
              expandedBook={expandedBook}
              onBookClick={(b) => setExpandedBook(expandedBook === b.name ? null : b.name)}
              onChapterClick={(b, ch) => {
                dispatch({ type: 'SET_PASSAGE', book: b.name, chapter: ch, bookId: b.bookId });
                navigate('/read');
              }}
              isExpanded={!isSidebarCompact}
              sectionOpen={sectionOpen.OT}
              onSectionToggle={() => toggleSection('OT')}
            />
            <SidebarSection
              label="New Testament"
              books={ntBooks}
              activeBook={state.book}
              activeChapter={state.chapter}
              expandedBook={expandedBook}
              onBookClick={(b) => setExpandedBook(expandedBook === b.name ? null : b.name)}
              onChapterClick={(b, ch) => {
                dispatch({ type: 'SET_PASSAGE', book: b.name, chapter: ch, bookId: b.bookId });
                navigate('/read');
              }}
              isExpanded={!isSidebarCompact}
              sectionOpen={sectionOpen.NT}
              onSectionToggle={() => toggleSection('NT')}
            />
          </div>

          {/* Sidebar drag handle — full-height vertical bar at the right edge */}
          <div
            onPointerDown={handleSidebarDragStart}
            data-testid="desktop-sidebar-divider"
            aria-label="Resize sidebar"
            role="separator"
            style={{ position: 'absolute', top: 0, right: 0, width: 6, height: '100%', cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none', zIndex: 5 }}
          >
            <div className="divider-dots">
              {[0, 1, 2].map(i => <div key={i} className="divider-dot" />)}
            </div>
          </div>
        </aside>
      )}

      {/* ─── MAIN CONTENT AREA (header + split panels) ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Prototype .app-header — chapter-selector-btn LEFT, logo CENTER,
            commentary pill-group absolutely positioned over right panel,
            hamburger icon-btn RIGHT. Padding comes from prototype.css
            (0 16px 0 64px). */}
        <header className="app-header">
          {/* Hide the chapter selector on topic routes — there's no
              "current chapter" in topic context, and showing the
              previous Bible chapter ("James 3") next to a Topics screen
              is misleading. */}
          {!isTopicRoute && (
            <button
              className="chapter-selector-btn"
              onClick={() => setShowBookSelector(true)}
              data-testid="desktop-chapter-selector-button"
            >
              <span>{state.book} {state.chapter}</span>
              <ChevronDown size={18} color={vmTokens.headerFg} strokeWidth={2} />
            </button>
          )}

          <div className="logo-mark">
            <img src="/versemate-logo-white.png" alt="VerseMate" className="logo-img" />
          </div>

          {/* Commentary pill-group — absolute-positioned at the horizontal
              center of the right panel (split-aware). Hidden on topic
              routes since the right pane is hidden too. */}
          {!isTopicRoute && rightPanelView === 'commentary' && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${(100 + leftPct) / 2}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
              }}
            >
              <div className="pill-group">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    className={`pill ${tab === t.id ? 'active' : ''}`}
                    onClick={() => setTab(t.id)}
                    data-testid={`desktop-tab-${t.id}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sub-screen back chevron — anchored to the LEFT edge of the
              right pane so it sits flush with the right-pane box. */}
          {!isTopicRoute && rightPanelView !== 'commentary' && (() => {
            const entry = RIGHT_PANEL_COMPONENTS[rightPanelView];
            if (!entry) return null;
            return (
              <button
                className="icon-btn"
                onClick={closeRightPanel}
                aria-label={`Close ${entry.label}`}
                data-testid="desktop-right-panel-close"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${leftPct}%`,
                  transform: 'translateY(-50%)',
                  marginLeft: 12,
                  zIndex: 2,
                  color: vmTokens.headerFg,
                }}
              >
                <ArrowLeft size={20} color={vmTokens.headerFg} strokeWidth={2} />
              </button>
            );
          })()}

          {/* Sub-screen title — centered horizontally over the right pane,
              independent of the back-chevron position. */}
          {!isTopicRoute && rightPanelView !== 'commentary' && (() => {
            const entry = RIGHT_PANEL_COMPONENTS[rightPanelView];
            if (!entry) return null;
            return (
              <span
                data-testid="desktop-right-panel-title"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${(100 + leftPct) / 2}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 600,
                  fontSize: 17,
                  color: vmTokens.headerFg,
                  whiteSpace: 'nowrap',
                }}
              >
                {entry.label}
              </span>
            );
          })()}

          {/* Right: hamburger menu only — prototype .icon-btn */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 3 }}>
            <button
              className="icon-btn"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Open menu"
              data-testid="desktop-hamburger-menu-button"
            >
              <Menu size={22} color={vmTokens.headerFg} strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* Prototype .split-body — left/right panels separated by .divider.
            On topic routes the right pane has nothing relevant to display
            (no Bible passage), so we let the left panel fill the full width
            and skip rendering the divider + right pane entirely. */}
        <div ref={contentRef} data-testid="desktop-split-body" className="split-body">
          <div
            data-testid="desktop-left-panel"
            className="left-panel"
            style={{ width: isTopicRoute ? '100%' : `${leftPct}%` }}
          >
            <Outlet />
          </div>

          {!isTopicRoute && (
            <>
              {/* Drag handle — prototype .divider with .divider-dots */}
              <div
                className="divider"
                onPointerDown={handleDragStart}
                data-testid="desktop-split-divider"
              >
                <div className="divider-dots">
                  {[0, 1, 2].map(i => <div key={i} className="divider-dot" />)}
                </div>
              </div>

              {/* Right panel — commentary OR sub-page */}
              <div data-testid="desktop-right-panel" className="right-panel">
                {rightPanelView === 'commentary' ? (
                  <div
                    ref={commentaryScrollRef}
                    className="commentary-body"
                    style={{ fontSize: `${state.settings.fontSize}px` }}
                  >
                    <CommentaryPanel
                      tab={tab}
                      commentaries={commentaries}
                      verseTexts={verseTexts}
                      expanded={expanded}
                      setExpanded={setExpanded}
                      book={state.book}
                      bookId={currentBook?.bookId ?? null}
                      chapter={state.chapter}
                    />
                  </div>
                ) : (
                  <RightPanelProvider value={{ goBack: closeRightPanel, isRightPanel: true }}>
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      {(() => {
                        const entry = RIGHT_PANEL_COMPONENTS[rightPanelView];
                        if (!entry) return null;
                        const PageComponent = entry.component;
                        return <PageComponent />;
                      })()}
                    </div>
                  </RightPanelProvider>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Menu sidebar overlay — fixed to viewport so it always appears correctly */}
      {showMenu && (
        <>
          <div className="scrim" onClick={() => setShowMenu(false)} />
          <div className="menu-panel">
            <MenuSidebar
              onClose={() => setShowMenu(false)}
              onOpenPage={(view: RightPanelView) => { openRightPanel(view); setShowMenu(false); }}
            />
          </div>
        </>
      )}

      {/* Book selector overlay — constrained to a centered modal on desktop */}
      {showBookSelector && (
        <>
          <div
            onClick={() => setShowBookSelector(false)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 55 }}
          />
          <div style={{
            position: 'fixed',
            top: '10vh',
            /* Center over Bible (left) panel */
            left: `${(sidebarOpen ? sidebarWidth : 0) + (contentRef.current ? contentRef.current.getBoundingClientRect().width * leftPct / 100 / 2 : 300)}px`,
            transform: 'translateX(-50%)',
            width: 420,
            height: '80vh',
            zIndex: 56,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}>
            <BookSelector
              onClose={() => setShowBookSelector(false)}
              onSelect={(book, ch, bookId) => {
                dispatch({ type: 'SET_PASSAGE', book, chapter: ch, bookId });
                setShowBookSelector(false);
                navigate('/read');
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sidebar Section (OT / NT) with expandable chapter grid ─────────────────

function SidebarSection({
  label,
  books: sectionBooks,
  activeBook,
  activeChapter,
  expandedBook,
  onBookClick,
  onChapterClick,
  isExpanded,
  sectionOpen,
  onSectionToggle,
}: {
  label: string;
  books: BibleBook[];
  activeBook: string;
  activeChapter: number;
  expandedBook: string | null;
  onBookClick: (b: BibleBook) => void;
  onChapterClick: (b: BibleBook, ch: number) => void;
  isExpanded: boolean;
  sectionOpen: boolean;
  onSectionToggle: () => void;
}) {
  return (
    <>
      <button
        type="button"
        className="section-header"
        onClick={onSectionToggle}
        aria-expanded={sectionOpen}
        data-testid={`sidebar-section-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <span>{isExpanded ? label : (label === 'Old Testament' ? 'OT' : 'NT')}</span>
        <ChevronDown
          size={14}
          color={vmTokens.gold}
          style={{ flexShrink: 0, transform: sectionOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}
        />
      </button>
      {sectionOpen && sectionBooks.map(b => {
        const isActive = activeBook === b.name;
        const isBookExpanded = expandedBook === b.name;
        return (
          <div key={b.bookId}>
            <button
              className={`book-row ${isActive ? 'active' : ''} ${isBookExpanded ? 'expanded' : ''}`}
              onClick={() => onBookClick(b)}
              title={b.name}
            >
              <span>{isExpanded ? b.name : b.shortName}</span>
              {isExpanded && (
                <ChevronDown
                  size={12}
                  color={vmTokens.textMuted}
                  style={{ flexShrink: 0, transform: isBookExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                />
              )}
            </button>
            {/* Prototype .chapter-grid / .chapter-cell — cream-gold cells in
                light, near-black in dark. Styling fully in prototype.css. */}
            {isBookExpanded && (
              <div className="chapter-grid">
                {Array.from({ length: b.chapters }, (_, i) => i + 1).map(ch => (
                  <button
                    key={ch}
                    className={`chapter-cell ${isActive && activeChapter === ch ? 'active' : ''}`}
                    onClick={() => onChapterClick(b, ch)}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ─── Commentary Panel ────────────────────────────────────────────────────────

function CommentaryPanel({
  tab,
  commentaries,
  verseTexts,
  expanded,
  setExpanded,
  book,
  bookId,
  chapter,
}: {
  tab: Tab;
  commentaries: Commentary[];
  verseTexts: Record<number, string>;
  expanded: number | null;
  setExpanded: (v: number | null) => void;
  book: string;
  bookId: number | null;
  chapter: number;
}) {
  // Per-tab "Copied!" feedback — keyed by tab id so switching tabs while
  // the toast is up doesn't leave a stale checkmark on the wrong button.
  const [copiedTab, setCopiedTab] = useState<Tab | null>(null);
  const copyToClipboard = async (text: string, fromTab: Tab) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedTab(fromTab);
      setTimeout(() => setCopiedTab(prev => (prev === fromTab ? null : prev)), 1500);
    } catch { /* ignore */ }
  };

  // Study tab has its own data source (src/data/studies/*) and is independent
  // of the API commentaries array, so route it before the no-commentaries
  // early return.
  if (tab === 'study') {
    return <StudyPanel book={book} bookId={bookId} chapter={chapter} />;
  }

  if (commentaries.length === 0) {
    return (
      <p style={{ color: vmTokens.textSecondary, fontSize: 14, textAlign: 'center', paddingTop: 32 }}>
        No commentary available for this chapter.
      </p>
    );
  }

  if (tab === 'summary') {
    const summary = commentaries.find(c => c.type === 'summary');
    return (
      <div>
        <div className="commentary-toolbar">
          <h2 className="commentary-h2">
            Summary of {book} {chapter}
          </h2>
          <div className="commentary-actions">
            <button
              onClick={() => {
                const body = summary?.detail
                  ? `Summary of ${book} ${chapter}\n\n${stripMarkdown(summary.detail)}`
                  : `Summary of ${book} ${chapter}`;
                copyToClipboard(body, 'summary');
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
              aria-label="Copy summary"
              title="Copy summary"
            >
              {copiedTab === 'summary'
                ? <Check size={18} color={vmTokens.gold} strokeWidth={2} />
                : <Copy size={18} color={vmTokens.textPrimary} strokeWidth={1.5} />}
            </button>
            <button
              onClick={() => navigator.share?.({
                title: `Summary of ${book} ${chapter}`,
                text: summary?.detail
                  ? `Summary of ${book} ${chapter}\n\n${stripMarkdown(summary.detail)}`
                  : `Summary of ${book} ${chapter}`,
                url: window.location.href,
              }).catch(() => {})}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
              aria-label="Share summary"
            >
              <ShareIcon size={18} color={vmTokens.textPrimary} />
            </button>
          </div>
        </div>
        {summary ? (
          <>
            {bookId && summary.explanationId ? (
              <div style={{ marginBottom: 12 }}>
                <AudioInlineEntry
                  explanationId={summary.explanationId}
                  explanationType="summary"
                  bookId={bookId}
                  chapterNumber={chapter}
                  sourceHref={`/read/${book}/${chapter}/commentary`}
                />
              </div>
            ) : null}
            <CommentaryBody text={summary.detail} />
          </>
        ) : (
          <p style={{ color: vmTokens.textSecondary, fontSize: 14 }}>No summary available.</p>
        )}
      </div>
    );
  }

  if (tab === 'byline') {
    const byLineItems = commentaries.filter(c => c.type === 'byline');
    const allExpanded = expanded === -2;
    return (
      <div>
        <div className="commentary-toolbar">
          <h2 className="commentary-h2">
            Line-by-Line Analysis of {book} {chapter}
          </h2>
          <div className="commentary-actions">
            <button
              onClick={() => {
                const body = byLineItems
                  .map(c => `${book} ${chapter}:${c.verse}\n${stripMarkdown(c.detail)}`)
                  .join('\n\n');
                const text = body
                  ? `Line-by-Line Analysis of ${book} ${chapter}\n\n${body}`
                  : `Line-by-Line Analysis of ${book} ${chapter}`;
                copyToClipboard(text, 'byline');
              }}
              className="icon-btn"
              aria-label="Copy line-by-line analysis"
              title="Copy line-by-line analysis"
            >
              {copiedTab === 'byline'
                ? <Check size={18} color={vmTokens.gold} strokeWidth={2} />
                : <Copy size={18} color={vmTokens.textPrimary} strokeWidth={1.5} />}
            </button>
            <button
              onClick={() => {
                const body = byLineItems
                  .map(c => `${book} ${chapter}:${c.verse}\n${stripMarkdown(c.detail)}`)
                  .join('\n\n');
                navigator.share?.({
                  title: `Line-by-Line Analysis of ${book} ${chapter}`,
                  text: body
                    ? `Line-by-Line Analysis of ${book} ${chapter}\n\n${body}`
                    : `Line-by-Line Analysis of ${book} ${chapter}`,
                  url: window.location.href,
                }).catch(() => {});
              }}
              className="icon-btn"
              aria-label="Share line-by-line analysis"
            >
              <ShareIcon size={18} color={vmTokens.textPrimary} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button
            className="expand-all-btn"
            onClick={() => setExpanded(allExpanded ? null : -2)}
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
        {(() => {
          const bylineId = byLineItems[0]?.explanationId ?? null;
          return bookId && bylineId ? (
            <div style={{ marginBottom: 12 }}>
              <AudioInlineEntry
                explanationId={bylineId}
                explanationType="byline"
                bookId={bookId}
                chapterNumber={chapter}
                sourceHref={`/read/${book}/${chapter}/commentary`}
              />
            </div>
          ) : null;
        })()}
        <div className="byline-list">
          {byLineItems.map(c => {
            const isOpen = allExpanded || expanded === c.verse;
            return (
              <div key={c.verse} data-byline-verse={c.verse} className={`byline-row ${isOpen ? 'open' : ''}`}>
                <button
                  className="byline-toggle"
                  onClick={() => setExpanded(isOpen ? null : c.verse)}
                >
                  <span className="byline-ref-sm">{book} {chapter}:{c.verse}</span>
                  {isOpen ? (
                    <ChevronUp size={16} color={vmTokens.textSecondary} style={{ flexShrink: 0 }} />
                  ) : (
                    <ChevronDown size={16} color={vmTokens.textSecondary} style={{ flexShrink: 0 }} />
                  )}
                </button>
                {isOpen && (
                  <div className="byline-body">
                    {/* Verse ref is already shown by .byline-ref-sm in the
                        toggle header above — don't duplicate it here.
                        Body starts directly with the verse blockquote. */}
                    {verseTexts[c.verse] && (
                      <blockquote className="byline-verse-quote">{verseTexts[c.verse]}</blockquote>
                    )}
                    <div className="byline-summary-label">Summary</div>
                    <div className="byline-summary-text">
                      <CommentaryBody text={stripBylineHeader(c.detail)} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {byLineItems.length === 0 && (
            <p style={{ color: vmTokens.textSecondary, fontSize: 14, textAlign: 'center', paddingTop: 32 }}>
              Line-by-line analysis not available.
            </p>
          )}
        </div>
      </div>
    );
  }

  // detailed tab
  const detailed = commentaries.find(c => c.type === 'detailed');
  return detailed ? (
    <div>
      <div className="commentary-toolbar">
        <h2 className="commentary-h2">
          In-Depth Analysis of {book} {chapter}
        </h2>
        <div className="commentary-actions">
          <button
            onClick={() => {
              const body = detailed.detail
                ? `In-Depth Analysis of ${book} ${chapter}\n\n${stripMarkdown(detailed.detail)}`
                : `In-Depth Analysis of ${book} ${chapter}`;
              copyToClipboard(body, 'detailed');
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
            aria-label="Copy in-depth analysis"
            title="Copy in-depth analysis"
          >
            {copiedTab === 'detailed'
              ? <Check size={18} color={vmTokens.gold} strokeWidth={2} />
              : <Copy size={18} color={vmTokens.textPrimary} strokeWidth={1.5} />}
          </button>
          <button
            onClick={() => navigator.share?.({
              title: `In-Depth Analysis of ${book} ${chapter}`,
              text: detailed.detail
                ? `In-Depth Analysis of ${book} ${chapter}\n\n${stripMarkdown(detailed.detail)}`
                : `In-Depth Analysis of ${book} ${chapter}`,
              url: window.location.href,
            }).catch(() => {})}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
            aria-label="Share in-depth analysis"
          >
            <ShareIcon size={18} color={vmTokens.textPrimary} />
          </button>
        </div>
      </div>
      {bookId && detailed.explanationId ? (
        <div style={{ marginBottom: 12 }}>
          <AudioInlineEntry
            explanationId={detailed.explanationId}
            explanationType="detailed"
            bookId={bookId}
            chapterNumber={chapter}
            sourceHref={`/read/${book}/${chapter}/commentary`}
          />
        </div>
      ) : null}
      <CommentaryBody text={detailed.detail} />
    </div>
  ) : (
    <p style={{ color: vmTokens.textSecondary, fontSize: 14, textAlign: 'center', paddingTop: 32 }}>
      Detailed commentary not available.
    </p>
  );
}

// ─── CommentaryBody ──────────────────────────────────────────────────────────

function CommentaryBody({ text }: { text: string }) {
  let processedText = text;
  const firstNewline = processedText.indexOf('\n');
  if (processedText.startsWith('# ') && firstNewline > 0) {
    processedText = processedText.slice(firstNewline + 1).trimStart();
  }
  const lines = processedText.split('\n');
  const elements: React.ReactNode[] = [];
  let para: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length) {
      elements.push(
        <p key={key++} style={{ fontFamily: 'inherit', fontWeight: 300, fontSize: 'inherit', lineHeight: 'inherit', color: vmTokens.textPrimary, marginBottom: 10 }}>
          {inlineFormat(para.join(' '))}
        </p>
      );
      para = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { flushPara(); continue; }
    if (line.startsWith('#')) {
      flushPara();
      const heading = line.replace(/^#+\s*/, '');
      elements.push(
        <h2 key={key++} style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600, fontSize: 17, lineHeight: '24px', color: vmTokens.textPrimary, marginTop: 22, marginBottom: 8 }}>
          {inlineFormat(heading)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('>')) {
      flushPara();
      elements.push(
        <blockquote key={key++} style={{ borderLeft: `2px solid ${vmTokens.gold}`, paddingLeft: 10, fontStyle: 'italic', marginBottom: 10, fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit', color: vmTokens.textSecondary }}>
          {inlineFormat(line.replace(/^>\s?/, ''))}
        </blockquote>
      );
      continue;
    }
    para.push(line);
  }
  flushPara();

  return <div>{elements}</div>;
}

// The byline API's `detail` markdown opens with a verse-ref heading +
// blockquote of the verse text + a "Summary" heading before the actual
// commentary. We render those three parts ourselves above CommentaryBody
// (.byline-ref-strong + .byline-verse-quote + .byline-summary-label), so
// strip them here to prevent the verse from rendering twice.
function stripBylineHeader(text: string): string {
  const lines = text.split('\n');
  let i = 0;
  // Skip leading blanks.
  while (i < lines.length && !lines[i].trim()) i++;
  // Skip a leading heading line (any # depth) — typically "# James 1:1".
  if (i < lines.length && /^#+\s/.test(lines[i].trim())) i++;
  while (i < lines.length && !lines[i].trim()) i++;
  // Skip a leading blockquote — typically the verse text.
  while (i < lines.length && /^>/.test(lines[i].trim())) i++;
  while (i < lines.length && !lines[i].trim()) i++;
  // Skip a single "Summary" heading if it's the next non-blank line.
  if (i < lines.length && /^#+\s*summary\s*$/i.test(lines[i].trim())) {
    i++;
    while (i < lines.length && !lines[i].trim()) i++;
  }
  return lines.slice(i).join('\n').trim();
}

// Strip the bare-bones markdown we render in CommentaryBody so the share
// payload reads as plain prose on the recipient side. We only see #, ##,
// ### headings, > blockquotes, and **bold** / *italic* inline emphasis in
// the API responses — handle those, leave everything else as-is.
function stripMarkdown(text: string): string {
  return text
    .replace(/^#+\s*/gm, '')           // heading markers
    .replace(/^>\s?/gm, '')            // blockquote markers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1')     // italic
    .trim();
}

function inlineFormat(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const match = m[0];
    if (match.startsWith('**')) {
      parts.push(<strong key={key++} style={{ fontWeight: 600 }}>{match.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={key++}>{match.slice(1, -1)}</em>);
    }
    last = m.index + match.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ─── Menu Sidebar (desktop overlay) ──────────────────────────────────────────

function MenuSidebar({ onClose, onOpenPage }: { onClose: () => void; onOpenPage?: (view: RightPanelView) => void }) {
  const navigate = useNavigate();
  const { state, signOut } = useApp();

  // Map menu labels → right panel view keys
  const menuItems: { label: string; icon: typeof Bookmark; view: RightPanelView }[] = [
    { label: 'Bookmarks', icon: Bookmark, view: 'bookmarks' },
    { label: 'Notes', icon: FileText, view: 'notes' },
    { label: 'Highlights', icon: Highlighter, view: 'highlights' },
    { label: 'Settings', icon: Settings, view: 'settings' },
    { label: 'About', icon: Info, view: 'about' },
    { label: 'Giving', icon: Heart, view: 'giving' },
    { label: 'Help', icon: HelpCircle, view: 'help' },
  ];

  const handleLogout = async () => {
    if (state.isSignedIn) {
      await signOut();
      navigate('/read');
    } else if (onOpenPage) {
      onOpenPage('signin');
      return;
    } else {
      navigate('/login');
    }
    onClose();
  };

  const handleShare = async () => {
    try {
      await navigator.share?.({ title: 'VerseMate', text: 'Read the Bible with VerseMate', url: window.location.origin });
    } catch {
      navigator.clipboard?.writeText(window.location.origin).catch(() => undefined);
    }
  };

  return (
    <>
      <header className="menu-header">
        <h1 className="menu-title">Menu</h1>
        <button onClick={onClose} aria-label="Close menu" className="icon-btn">
          <X size={22} color={vmTokens.headerFg} strokeWidth={2} />
        </button>
      </header>

      <div className="menu-scroll">
        {/* Profile card — prototype .menu-profile */}
        <button
          onClick={() => {
            const target = state.isSignedIn ? 'settings' : 'signin';
            if (onOpenPage) {
              onOpenPage(target);
            } else {
              navigate(state.isSignedIn ? '/menu/settings' : '/login');
              onClose();
            }
          }}
          data-testid="menu-profile-card"
          className="menu-profile"
        >
          <div className="menu-avatar">
            {state.isSignedIn && state.userAvatarUrl ? (
              <img
                src={state.userAvatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <User size={20} color={vmTokens.textSecondary} strokeWidth={1.5} />
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className="menu-profile-name">
              {state.isSignedIn ? state.userName || state.userEmail?.split('@')[0] || '' : 'Guest'}
            </p>
            <p className="menu-profile-sub">
              {state.isSignedIn ? state.userEmail || 'Loading...' : 'Click to sign in'}
            </p>
          </div>
        </button>

        {/* Nav items — prototype .menu-item */}
        {menuItems.map(item => (
          <button
            key={item.label}
            onClick={() => { if (onOpenPage) { onOpenPage(item.view); } else { navigate(`/${item.view}`); onClose(); } }}
            className="menu-item"
          >
            <item.icon size={18} color={vmTokens.textPrimary} strokeWidth={1.5} />
            <span>{item.label}</span>
          </button>
        ))}
        <button onClick={handleShare} className="menu-item">
          <ShareIcon size={18} color={vmTokens.textPrimary} />
          <span>Share VerseMate</span>
        </button>
        <button onClick={handleLogout} className="menu-item logout">
          <LogOut size={18} color={vmTokens.statusError} strokeWidth={1.5} />
          <span>{state.isSignedIn ? 'Logout' : 'Sign In'}</span>
        </button>
      </div>
    </>
  );
}
