import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
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
// VisualsPanel pulls the full VISUALS_REGISTRY (image URLs, captions,
// chapter-scope arrays — ~1 MB of data). Lazy-load so users who never
// open the Visuals tab don't pay for it on initial page load.
const VisualsPanel = lazy(() => import('@/components/VisualsPanel'));
import { BOOKS_WITH_VISUALS } from '@/data/visuals/booksWithVisuals';
import { nameToSlug } from '@/lib/bookSlugs';
import { RightPanelProvider } from '@/contexts/RightPanelContext';
import { useTopicView } from '@/contexts/TopicViewContext';
import {
  ExplanationTab as TopicExplanationTab,
  INSIGHT_TABS as TOPIC_INSIGHT_TABS,
  type InsightTab as TopicInsightTab,
} from '@/components/topic/TopicViewParts';
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

type Tab = 'summary' | 'byline' | 'study' | 'visuals';

// `BOOKS_WITH_VISUALS` is imported from the generated registry; its
// contents update automatically when build_manifests.py is re-run.

const MIN_LEFT_PCT = 35;
const MAX_LEFT_PCT = 80;
// Dragging the split divider past this (reading column ≥ this % of the content
// width) snaps the right insights panel fully closed — the mirror of the
// sidebar's drag-to-hide. A reveal strip at the right edge pulls it back.
const RIGHT_HIDE_SNAP_PCT = 90;
const SIDEBAR_COLLAPSED = 56;
const SIDEBAR_EXPANDED = 220;
const SIDEBAR_MIN = 56;
const SIDEBAR_MAX = 320;
// Dragging the sidebar edge left of this snaps it fully closed (width 0); a
// thin grab strip at the screen edge then lets the user pull it back out.
const SIDEBAR_HIDE_SNAP = 48;
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
  // Topic context — populated by TopicEventsScreen when on a topic route
  // and read here so the chrome (chapter-selector label, pill-group,
  // right-pane body) mirrors the Bible side. On non-topic routes the
  // fields are null and these reads are inert.
  const {
    topic: currentTopic,
    details: topicDetails,
    insightTab: topicInsightTab,
    setInsightTab: setTopicInsightTab,
  } = useTopicView();
  const [showBookSelector, setShowBookSelector] = useState(false);
  // Seed text for the Search modal when it's opened via "just start typing".
  const [bookSelectorQuery, setBookSelectorQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!hideSidebar);
  // Sidebar always stays at expanded width; expandedBook controls chapter grid visibility.
  // Only pre-expand the active book when the user arrived via an explicit
  // /bible/<slug>/<chapter> URL. On a first visit (root → /read → Genesis 1
  // fallback) leave the list collapsed so the sidebar doesn't open Genesis by
  // default.
  const [expandedBook, setExpandedBook] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && /^\/bible\/[^/]+\/\d+/.test(window.location.pathname)) {
      return state.book;
    }
    return null;
  });
  // Right panel can be fully minimized to the right (tablet + desktop) so the
  // reading column expands to full width — mirroring how the left sidebar can
  // be dragged fully closed. Persisted across reloads. A thin reveal strip +
  // a round toggle at the right edge bring it back.
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('versemate-right-panel-collapsed');
      // Tablet has no room for a comfortable split, so it uses a full-screen
      // swap (reading OR insight/sub-page, never both). Start on the reading
      // with the panel collapsed; tapping a pill / opening a menu page reveals
      // the panel full-width.
      if (stored === null) return hideSidebar;
      return stored === '1';
    } catch {
      return hideSidebar;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('versemate-right-panel-collapsed', rightPanelCollapsed ? '1' : '0');
    } catch { /* ignore */ }
  }, [rightPanelCollapsed]);

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
    // Opening a menu sub-page (Settings, Bookmarks, …) needs the right pane
    // visible — un-collapse it if the user had minimized it.
    setRightPanelCollapsed(false);
    setRightPanelView(view);
  };
  const closeRightPanel = () => {
    setRightPanelView('commentary');
    // On tablet a sub-page is shown full-screen (there is no reading beside
    // it), so backing out of it should return to the reading rather than to a
    // full-screen commentary tab the user never asked for.
    if (hideSidebar) setRightPanelCollapsed(true);
  };
  // Tablet: leave the full-screen insight/sub-page view and return to the
  // reading. Reset the view so the next reveal starts on commentary, not the
  // sub-page the user just backed out of.
  const tabletBackToReading = () => {
    setRightPanelView('commentary');
    setRightPanelCollapsed(true);
  };

  // Topic routes (`/topic/<cat>/<slug>`, `/topics/:topicId`,
  // `/topics/:topicId/:eventId`, `/topics/:topicId/:eventId/most-quoted`)
  // render their own full-width content in the LEFT panel via <Outlet />.
  // The chrome that's tied to a Bible passage — chapter selector, the
  // Summary/By-Line/Study commentary tabs (plus Visuals on books that
  // have them), and the entire right pane — has nothing to display in
  // a topic context, so we hide all of
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
        // 0 is a valid (fully-hidden) width; otherwise floor at SIDEBAR_MIN.
        if (!isNaN(n)) return n <= 0 ? 0 : Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, n));
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
      if (v === 'summary' || v === 'byline' || v === 'study' || v === 'visuals') return v;
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
    // mid-Summary-tab leaves Summary active even though By-Line is the
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
    if (e.target instanceof HTMLElement && e.target.isContentEditable) return;
    if (e.key === 'ArrowLeft' && state.chapter > 1) {
      dispatch({ type: 'SET_PASSAGE', book: state.book, chapter: state.chapter - 1 });
      return;
    }
    if (e.key === 'ArrowRight' && state.chapter < maxChapter) {
      dispatch({ type: 'SET_PASSAGE', book: state.book, chapter: state.chapter + 1 });
      return;
    }
    // "Just start typing" → open Search seeded with the first character so the
    // user can jump to another book without reaching for the selector. Only a
    // bare printable key (no Cmd/Ctrl/Alt) counts, and not while the Search or
    // menu overlay is already open.
    if (
      !showBookSelector &&
      !showMenu &&
      e.key.length === 1 &&
      /[a-zA-Z0-9]/.test(e.key) &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey
    ) {
      // Swallow this keystroke so the browser doesn't ALSO insert the
      // character into the search field once it auto-focuses — otherwise the
      // seeded query and the native input both land and you get "jj". Only
      // this first opening key is prevented; once the input is focused the
      // early-return guards above let normal typing through.
      e.preventDefault();
      setBookSelectorQuery(e.key);
      setShowBookSelector(true);
    }
  }, [state.book, state.chapter, maxChapter, dispatch, showBookSelector, showMenu]);

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

  // Click the left reveal strip → bring the books sidebar back to a usable
  // width (works on desktop after a drag-to-hide AND on tablet where the
  // sidebar starts closed). The user resizes further via the sidebar divider.
  const revealSidebar = useCallback(() => {
    setSidebarOpen(true);
    setSidebarWidth(w => (w <= 0 ? SIDEBAR_EXPANDED : w));
  }, []);

  // Click the right reveal strip → bring the insights panel back.
  const revealRightPanel = useCallback(() => {
    setRightPanelCollapsed(false);
  }, []);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (isDraggingSidebar.current) {
        // Sidebar starts at viewport x = 0. Dragging the edge below the snap
        // threshold closes it completely (width 0); otherwise clamp to the
        // normal [MIN, MAX] band.
        const w = Math.round(e.clientX);
        setSidebarWidth(w < SIDEBAR_HIDE_SNAP ? 0 : Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, w)));
        return;
      }
      if (!isDragging.current || !contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.round((x / rect.width) * 100);
      // Dragging the reading column past the snap threshold collapses the
      // right panel entirely; otherwise clamp to the normal band and keep it
      // open.
      if (pct >= RIGHT_HIDE_SNAP_PCT) {
        setRightPanelCollapsed(true);
      } else {
        setRightPanelCollapsed(false);
        setLeftPct(Math.max(MIN_LEFT_PCT, Math.min(MAX_LEFT_PCT, pct)));
      }
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

  // state.book is the API display name ("2 Kings", "Song of Solomon"); the
  // registry is keyed by URL slug ("2-kings", "song-of-solomon"). Normalize
  // via nameToSlug — a raw .toLowerCase() leaves spaces and silently misses.
  const hasVisuals = BOOKS_WITH_VISUALS.has(nameToSlug(state.book));
  const tabs: { id: Tab; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'byline', label: 'By Line' },
    { id: 'study', label: 'Study' },
    ...(hasVisuals ? [{ id: 'visuals' as Tab, label: 'Visuals' }] : []),
  ];

  // If the Visuals tab is sticky from sessionStorage but the current book
  // doesn't have curated visuals, fall back to By Line so the right pane
  // never routes to an empty tab.
  useEffect(() => {
    if (tab === 'visuals' && !hasVisuals) setTab('byline');
  }, [hasVisuals, tab]);

  const otBooks = books.filter(b => b.testament === 'OT');
  const ntBooks = books.filter(b => b.testament === 'NT');

  const isSidebarCompact = sidebarWidth < SIDEBAR_COMPACT_THRESHOLD;

  // Narrow split: the inline header pills scroll sideways (rather than
  // wrapping) so they always stay anchored over the right insights column.
  const isCompactSplit = useMediaQuery('(max-width: 1199px)');

  // The right insights panel can be minimized at any width now (tablet +
  // desktop), mirroring the left sidebar's drag-to-hide. The sidebar still
  // follows its layout default at wide widths.
  const effectiveRightCollapsed = rightPanelCollapsed;
  // Tablet (hideSidebar) collapses the resizable split into a full-screen swap:
  // the reading and the insight/sub-page panel each take the full width and the
  // user toggles between them (no cramped 35%-wide pane). When the panel is
  // open the reading is forced to 0% width (still mounted, so its scroll is
  // preserved behind the panel); on desktop the real drag ratio is kept.
  const isTablet = hideSidebar;
  const effectiveLeftPct = isTablet ? (effectiveRightCollapsed ? 100 : 0) : leftPct;
  const panelFullWidth = isTablet && !effectiveRightCollapsed;
  const effectiveSidebarOpen = isCompactSplit ? sidebarOpen : !hideSidebar;
  // The user can drag the sidebar edge fully closed (width 0). When hidden we
  // drop the <aside> entirely and show a thin grab strip at the screen edge so
  // it can be pulled back out.
  const sidebarHidden = sidebarWidth <= 0;

  return (
    // Prototype layout: .app-shell wraps the sidebar + main column.
    // .sidebar / .sidebar-header / .sidebar-scroll come straight from
    // src/styles/prototype.css. Inline overrides are kept to a minimum.
    <div data-testid="desktop-layout" className="app-shell">
      {/* ─── PERSISTENT SIDEBAR ─── */}
      {!(effectiveSidebarOpen && !sidebarHidden) && (
        // Reveal strip — a thin dotted handle pinned to the screen's left edge,
        // shown whenever the books sidebar isn't visible (dragged closed on
        // desktop, or closed by default on tablet). Click it to open the menu;
        // mirror of the right insights-panel reveal strip.
        <button
          type="button"
          onClick={revealSidebar}
          data-testid="desktop-sidebar-reveal"
          aria-label="Show book list"
          className="sidebar-reveal-strip"
        >
          <div className="divider-dots">
            {[0, 1, 2].map(i => <div key={i} className="divider-dot" />)}
          </div>
        </button>
      )}
      {effectiveSidebarOpen && !sidebarHidden && (
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
          {/* Header LEFT slot. On tablet the split becomes a full-screen swap,
              so while the insight/sub-page panel is open the chapter selector
              is replaced by a back chevron that returns to the reading — the
              single, discoverable way out of the full-screen view. */}
          {panelFullWidth ? (
            <button
              className="chapter-selector-btn"
              onClick={tabletBackToReading}
              aria-label="Back to reading"
              data-testid="desktop-tablet-back-to-reading"
            >
              <ArrowLeft size={20} color={vmTokens.headerFg} strokeWidth={2} />
              <span>Reading</span>
            </button>
          ) : (
            // Topic routes show the topic name in the same dropdown slot the
            // Bible side uses for "Genesis 1" — a topic behaves like a Bible
            // reference for navigation purposes.
            <button
              className="chapter-selector-btn"
              onClick={() => { setBookSelectorQuery(''); setShowBookSelector(true); }}
              data-testid="desktop-chapter-selector-button"
            >
              <span>
                {isTopicRoute
                  ? currentTopic?.name || 'Topic'
                  : `${state.book} ${state.chapter}`}
              </span>
              <ChevronDown size={18} color={vmTokens.headerFg} strokeWidth={2} />
            </button>
          )}

          {/* Logo — desktop only. On tablet the header is too narrow to fit a
              centered logo alongside the pill row without overlap/clipping, so
              the logo is dropped there (the pills own the center instead). */}
          {!isTablet && (
            <div className="logo-mark">
              <img src="/versemate-logo-white.png" alt="VerseMate" className="logo-img" />
            </div>
          )}

          {/* Commentary pill-group — absolute-positioned over the right
              insights column (split-aware: left edge tracks leftPct, right
              edge clears the hamburger). On Bible routes this is the
              Summary/By-Line/Study chooser (plus Visuals on books that have
              curated visuals); on topic routes the same slot holds the
              Summary/By-Line/Detailed chooser fed from TopicViewContext. The
              row scrolls sideways when the tabs don't fit so they stay
              anchored to the right column instead of jumping to mid-screen. */}
          {!isTopicRoute && rightPanelView === 'commentary' && (
            <div
              className="header-pill-scroll"
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                // When the insights panel is collapsed there's no right column
                // to anchor over, so right-align the pills next to the
                // hamburger. Bound the left edge past the centered logo so a
                // wide pill row (4 tabs) can never overlap the VerseMate mark —
                // the row scrolls sideways within the bounded band instead.
                left: isTablet ? 140 : (effectiveRightCollapsed ? 'calc(50% + 108px)' : `${effectiveLeftPct}%`),
                right: 64,
                justifyContent: isTablet ? 'center' : (effectiveRightCollapsed ? 'flex-end' : undefined),
                zIndex: 2,
              }}
            >
              <div className="pill-group" role="tablist" aria-label="Commentary view">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={tab === t.id}
                    tabIndex={tab === t.id ? 0 : -1}
                    className={`pill ${tab === t.id ? 'active' : ''}`}
                    onClick={() => { setTab(t.id); if (effectiveRightCollapsed) setRightPanelCollapsed(false); }}
                    data-testid={`desktop-tab-${t.id}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {isTopicRoute && (
            <div
              className="header-pill-scroll"
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: isTablet ? 140 : (effectiveRightCollapsed ? 'calc(50% + 108px)' : `${effectiveLeftPct}%`),
                right: 64,
                justifyContent: isTablet ? 'center' : (effectiveRightCollapsed ? 'flex-end' : undefined),
                zIndex: 2,
              }}
            >
              <div className="pill-group" role="tablist" aria-label="Topic insight view">
                {TOPIC_INSIGHT_TABS.map(t => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={topicInsightTab === t.id}
                    tabIndex={topicInsightTab === t.id ? 0 : -1}
                    className={`pill ${topicInsightTab === t.id ? 'active' : ''}`}
                    onClick={() => { setTopicInsightTab(t.id as TopicInsightTab); if (effectiveRightCollapsed) setRightPanelCollapsed(false); }}
                    data-testid={`desktop-topic-tab-${t.id}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sub-screen back chevron — anchored to the LEFT edge of the
              right pane so it sits flush with the right-pane box. Desktop only:
              on tablet the full-screen sub-page uses the header-left "Reading"
              chevron instead (there is no right-pane edge to anchor to). */}
          {!isTopicRoute && rightPanelView !== 'commentary' && !effectiveRightCollapsed && !isTablet && (() => {
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
                  left: `${effectiveLeftPct}%`,
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
          {!isTopicRoute && rightPanelView !== 'commentary' && !effectiveRightCollapsed && (() => {
            const entry = RIGHT_PANEL_COMPONENTS[rightPanelView];
            if (!entry) return null;
            return (
              <span
                data-testid="desktop-right-panel-title"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${(100 + effectiveLeftPct) / 2}%`,
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

          {/* Right: hamburger menu — prototype .icon-btn */}
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
            Bible routes split between passage (left) and commentary (right);
            topic routes split between topic content (left) and the active
            Summary/By-Line/Detailed insight (right). Sub-page panels (menu
            sub-pages like Settings) still take over the right pane on
            Bible routes only. */}
        <div
          ref={contentRef}
          data-testid="desktop-split-body"
          className="split-body"
          // Expose the reading-panel width so overlays rendered inside the
          // reading column (e.g. the Verse Insight sheet) can center
          // themselves over the Bible portion instead of the whole split.
          style={{ '--reading-pct': `${effectiveRightCollapsed ? 100 : effectiveLeftPct}%` } as React.CSSProperties}
        >
          <div
            data-testid="desktop-left-panel"
            className="left-panel"
            style={{ width: effectiveRightCollapsed ? '100%' : `${effectiveLeftPct}%` }}
          >
            <Outlet />
          </div>

          {/* Drag handle — prototype .divider with .divider-dots. Hidden when
              the right panel is minimized so the reading column owns the full
              width. Also hidden on tablet, which swaps full-screen views
              instead of sharing a resizable split. */}
          {!effectiveRightCollapsed && !isTablet && (
            <div
              className="divider"
              onPointerDown={handleDragStart}
              data-testid="desktop-split-divider"
            >
              <div className="divider-dots">
                {[0, 1, 2].map(i => <div key={i} className="divider-dot" />)}
              </div>
            </div>
          )}

          {/* Right panel */}
          {!effectiveRightCollapsed && (
          <div data-testid="desktop-right-panel" className="right-panel">
            {isTopicRoute ? (
              <div
                className="commentary-body"
                style={{ fontSize: `${state.settings.fontSize}px` }}
                data-testid="desktop-topic-insight-pane"
              >
                <TopicExplanationTab
                  text={
                    topicInsightTab === 'summary'
                      ? topicDetails?.explanation.summary || ''
                      : topicInsightTab === 'byline'
                        ? topicDetails?.explanation.byline || ''
                        : topicDetails?.explanation.detailed || ''
                  }
                  kind={topicInsightTab}
                  loading={topicDetails === null}
                />
              </div>
            ) : rightPanelView === 'commentary' ? (
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
          )}

          {/* Right-panel reveal strip — mirror of the sidebar reveal strip,
              pinned to the RIGHT edge. Shown when the insights panel is
              collapsed; click it to bring the panel back. Collapse the panel
              by dragging the split divider to the edge. */}
          {effectiveRightCollapsed && (
            <button
              type="button"
              onClick={revealRightPanel}
              data-testid="desktop-right-panel-reveal"
              aria-label="Show insights panel"
              className="right-panel-reveal-strip"
            >
              <div className="divider-dots">
                {[0, 1, 2].map(i => <div key={i} className="divider-dot" />)}
              </div>
            </button>
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
            onClick={() => { setShowBookSelector(false); setBookSelectorQuery(''); }}
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
              initialTab={isTopicRoute ? 'Topics' : undefined}
              initialQuery={bookSelectorQuery}
              onClose={() => { setShowBookSelector(false); setBookSelectorQuery(''); }}
              onSelect={(book, ch, bookId) => {
                dispatch({ type: 'SET_PASSAGE', book, chapter: ch, bookId });
                setShowBookSelector(false);
                setBookSelectorQuery('');
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
    // `key` forces remount on chapter change so StudyPanel's useState
    // initializers re-read the new chapter's sessionStorage. Without it,
    // the prior chapter's open/collapsed card state persists into the
    // new chapter and then gets written under the new key.
    return <StudyPanel key={`${bookId}:${chapter}`} book={book} bookId={bookId} chapter={chapter} />;
  }

  // Visuals tab is also commentary-independent — its content comes from
  // curated assets in /public/visuals/<book>/, not the API.
  if (tab === 'visuals') {
    return (
      <Suspense fallback={<p style={{ color: vmTokens.textSecondary, fontSize: 14, textAlign: 'center', paddingTop: 32 }}>Loading visuals…</p>}>
        <VisualsPanel key={`${bookId}:${chapter}`} book={book} bookId={bookId} chapter={chapter} />
      </Suspense>
    );
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
            <CommentaryBody text={summary.detail} />
          </>
        ) : (
          <p style={{ color: vmTokens.textSecondary, fontSize: 14 }}>No summary available.</p>
        )}
      </div>
    );
  }

  // byline is the only remaining case (Tab type is narrowed to 'byline'
  // here after early returns for 'study', 'visuals', 'summary').
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
