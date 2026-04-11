import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { fetchCommentary } from '@/services/bibleService';
import { Commentary } from '@/services/types';
import {
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
} from 'lucide-react';
import ShareIcon from '@/components/ShareIcon';
import BookSelector from '@/components/BookSelector';

type Tab = 'summary' | 'byline' | 'detailed';

/**
 * DesktopLayout — split-view for ≥1024px viewports.
 *
 * Left panel (65%): current Bible reading content via <Outlet />
 * Right panel (35%): commentary for the current book/chapter
 * Shared header: spans full width
 */
export default function DesktopLayout() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Right panel commentary state
  const [tab, setTab] = useState<Tab>('summary');
  const [commentaries, setCommentaries] = useState<Commentary[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetchCommentary(state.book, state.chapter).then(setCommentaries);
    setExpanded(null);
  }, [state.book, state.chapter]);

  // On desktop, redirect commentary route back to /read since we show it inline
  useEffect(() => {
    if (location.pathname.includes('/commentary')) {
      navigate('/read', { replace: true });
    }
  }, [location.pathname, navigate]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'byline', label: 'By Line' },
    { id: 'detailed', label: 'Detailed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100dvh', overflow: 'hidden', backgroundColor: '#1B1B1B' }}>
      {/* ─── SHARED FULL-WIDTH HEADER ─── */}
      <header
        style={{
          flexShrink: 0,
          height: 56,
          backgroundColor: '#1A1A1A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '1px solid #2a2a2a',
        }}
      >
        {/* Left: Book + chapter dropdown */}
        <button
          onClick={() => setShowBookSelector(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FFFFFF', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px 0 0', minHeight: 44 }}
        >
          <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '24px', color: '#FFFFFF' }}>
            {state.book} {state.chapter}
          </span>
          <ChevronDown size={18} color="#FFFFFF" strokeWidth={2} />
        </button>

        {/* Center: dual pill labels — both active since split view shows both */}
        <div style={{ display: 'flex', backgroundColor: '#323232', borderRadius: 100, padding: '3px' }}>
          <div
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '24px',
              padding: '2px 12px',
              borderRadius: 100,
              backgroundColor: '#B09A6D',
              color: '#000000',
            }}
          >
            Bible
          </div>
          <div
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '24px',
              padding: '2px 12px',
              borderRadius: 100,
              backgroundColor: '#B09A6D',
              color: '#000000',
            }}
          >
            Insight
          </div>
        </div>

        {/* Right: hamburger menu */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Open menu"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, background: 'none', border: 'none', cursor: 'pointer', marginRight: -8 }}
        >
          <Menu size={22} color="#FFFFFF" strokeWidth={2} />
        </button>
      </header>

      {/* ─── SPLIT BODY ─── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* LEFT PANEL — 65% — Bible reading */}
        <div
          style={{
            width: '65%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRight: '1px solid #dce0e3',
          }}
        >
          <Outlet />
        </div>

        {/* RIGHT PANEL — 35% — Commentary */}
        <div
          style={{
            width: '35%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: '#1B1B1B',
          }}
        >
          {/* Right panel sub-header with Summary/By Line/Detailed tabs */}
          <div
            style={{
              flexShrink: 0,
              backgroundColor: '#1A1A1A',
              display: 'flex',
              justifyContent: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid #2a2a2a',
            }}
          >
            <div style={{ display: 'flex', backgroundColor: '#323232', borderRadius: 100, padding: '3px' }}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    borderRadius: 100,
                    padding: '4px 16px',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '24px',
                    backgroundColor: tab === t.id ? '#B09A6D' : 'transparent',
                    color: tab === t.id ? '#000000' : '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right panel body */}
          <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#000000', color: '#FFFFFF', padding: '16px 16px 32px' }}>
            <CommentaryPanel
              tab={tab}
              commentaries={commentaries}
              expanded={expanded}
              setExpanded={setExpanded}
              book={state.book}
              chapter={state.chapter}
            />
          </div>
        </div>

        {/* Menu sidebar overlay */}
        {showMenu && (
          <>
            <div
              onClick={() => setShowMenu(false)}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 40 }}
            />
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: 340,
                height: '100%',
                backgroundColor: '#1B1B1B',
                zIndex: 50,
                boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <MenuSidebar onClose={() => setShowMenu(false)} />
            </div>
          </>
        )}
      </div>

      {/* Book selector overlay */}
      {showBookSelector && (
        <BookSelector
          onClose={() => setShowBookSelector(false)}
          onSelect={(book, ch, bookId) => {
            dispatch({ type: 'SET_PASSAGE', book, chapter: ch, bookId });
            setShowBookSelector(false);
            navigate('/read');
          }}
        />
      )}
    </div>
  );
}

// ─── Commentary Panel ────────────────────────────────────────────────────────

function CommentaryPanel({
  tab,
  commentaries,
  expanded,
  setExpanded,
  book,
  chapter,
}: {
  tab: Tab;
  commentaries: Commentary[];
  expanded: number | null;
  setExpanded: (v: number | null) => void;
  book: string;
  chapter: number;
}) {
  if (commentaries.length === 0) {
    return (
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', paddingTop: 32 }}>
        No commentary available for this chapter.
      </p>
    );
  }

  if (tab === 'summary') {
    const summary = commentaries.find(c => c.type === 'summary');
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: '#E7E7E7', margin: 0 }}>
            Summary of {book} {chapter}
          </h2>
          <button
            onClick={() => navigator.share?.({ title: `Summary of ${book} ${chapter}`, text: `Summary of ${book} ${chapter}` }).catch(() => {})}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexShrink: 0 }}
            aria-label="Share summary"
          >
            <ShareIcon size={18} color="#E7E7E7" />
          </button>
        </div>
        {summary ? (
          <CommentaryBody text={summary.detail} />
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>No summary available.</p>
        )}
      </div>
    );
  }

  if (tab === 'byline') {
    const byLineItems = commentaries.filter(c => c.type === 'byline');
    const allExpanded = expanded === -2;
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: '#E7E7E7', margin: 0 }}>
            Line-by-Line Analysis of {book} {chapter}
          </h2>
          <button
            onClick={() => navigator.share?.({ title: `Line-by-Line Analysis of ${book} ${chapter}`, text: `Line-by-Line Analysis of ${book} ${chapter}` }).catch(() => {})}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexShrink: 0 }}
            aria-label="Share line-by-line analysis"
          >
            <ShareIcon size={18} color="#E7E7E7" />
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button
            onClick={() => setExpanded(allExpanded ? null : -2)}
            style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#B09A6D', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
        <div>
          {byLineItems.map(c => {
            const isOpen = allExpanded || expanded === c.verse;
            return (
              <div key={c.verse} style={{ borderBottom: '1px solid #323232' }}>
                <button
                  onClick={() => setExpanded(isOpen ? null : c.verse)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#FFFFFF' }}>
                    {book} {chapter}:{c.verse}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={16} color="rgba(255,255,255,0.6)" style={{ flexShrink: 0 }} />
                  ) : (
                    <ChevronDown size={16} color="rgba(255,255,255,0.6)" style={{ flexShrink: 0 }} />
                  )}
                </button>
                {isOpen && (
                  <div style={{ paddingBottom: 14 }}>
                    <CommentaryBody text={c.detail} />
                  </div>
                )}
              </div>
            );
          })}
          {byLineItems.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', paddingTop: 32 }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: '#E7E7E7', margin: 0 }}>
          In-Depth Analysis of {book} {chapter}
        </h2>
        <button
          onClick={() => navigator.share?.({ title: `In-Depth Analysis of ${book} ${chapter}`, text: `In-Depth Analysis of ${book} ${chapter}` }).catch(() => {})}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexShrink: 0 }}
          aria-label="Share in-depth analysis"
        >
          <ShareIcon size={18} color="#E7E7E7" />
        </button>
      </div>
      <CommentaryBody text={detailed.detail} />
    </div>
  ) : (
    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', paddingTop: 32 }}>
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
        <p key={key++} style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 15, lineHeight: '23px', color: 'rgba(255,255,255,0.87)', marginBottom: 10 }}>
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
        <h2 key={key++} style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: 16, lineHeight: '22px', color: '#E7E7E7', marginTop: 14, marginBottom: 6 }}>
          {inlineFormat(heading)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('>')) {
      flushPara();
      elements.push(
        <blockquote key={key++} style={{ borderLeft: '2px solid #B09A6D', paddingLeft: 10, fontStyle: 'italic', marginBottom: 10, fontFamily: 'Roboto, sans-serif', fontSize: 15, lineHeight: '23px', color: 'rgba(255,255,255,0.6)' }}>
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

function MenuSidebar({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { state, signOut } = useApp();

  const menuItems = [
    { label: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
    { label: 'Notes', icon: FileText, path: '/notes' },
    { label: 'Highlights', icon: Highlighter, path: '/highlights' },
    { label: 'Settings', icon: Settings, path: '/menu/settings' },
    { label: 'About', icon: Info, path: '/menu/about' },
    { label: 'Giving', icon: Heart, path: '/menu/giving' },
    { label: 'Help', icon: HelpCircle, path: '/menu/help' },
  ];

  const handleLogout = async () => {
    if (state.isSignedIn) {
      await signOut();
      navigate('/read');
    } else {
      navigate('/menu/signin');
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#1B1B1B' }}>
      <header style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 72, backgroundColor: '#1A1A1A', borderBottom: '1px solid #2a2a2a' }}>
        <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: 18, lineHeight: '24px', color: '#FFFFFF', margin: 0 }}>Menu</h1>
        <button onClick={onClose} aria-label="Close menu" style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', marginRight: -8 }}>
          <X size={22} color="#FFFFFF" strokeWidth={2} />
        </button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#000000', padding: '16px' }}>
        {/* User card */}
        <button
          onClick={() => { if (!state.isSignedIn) { navigate('/menu/signin'); onClose(); } }}
          disabled={state.isSignedIn}
          style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', height: 64, padding: '0 16px', borderRadius: 12, backgroundColor: '#323232', border: '1px solid #323232', marginBottom: 12, cursor: state.isSignedIn ? 'default' : 'pointer', textAlign: 'left' }}
        >
          <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1B1B1B', flexShrink: 0 }}>
            <User size={20} color="rgba(255,255,255,0.6)" strokeWidth={1.5} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', color: '#B09A6D', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {state.isSignedIn ? state.userName || state.userEmail?.split('@')[0] || '' : 'Guest'}
            </p>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 12, lineHeight: '18px', color: 'rgba(255,255,255,0.6)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {state.isSignedIn ? state.userEmail || 'Loading...' : 'Click to sign in'}
            </p>
          </div>
        </button>

        {/* Nav items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {menuItems.map(item => (
            <button
              key={item.label}
              onClick={() => { navigate(item.path); onClose(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', height: 56, padding: '0 16px', borderRadius: 12, backgroundColor: '#323232', border: '1px solid #323232', cursor: 'pointer', textAlign: 'left' }}
            >
              <item.icon size={18} color="#E7E7E7" strokeWidth={1.5} />
              <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 15, lineHeight: '24px', color: '#E7E7E7' }}>{item.label}</span>
            </button>
          ))}
          <button
            onClick={handleShare}
            style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', height: 56, padding: '0 16px', borderRadius: 12, backgroundColor: '#323232', border: '1px solid #323232', cursor: 'pointer', textAlign: 'left' }}
          >
            <ShareIcon size={18} color="#E7E7E7" />
            <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 15, lineHeight: '24px', color: '#E7E7E7' }}>Share VerseMate</span>
          </button>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', height: 56, padding: '0 16px', borderRadius: 12, backgroundColor: '#323232', border: '1px solid #323232', cursor: 'pointer', textAlign: 'left', marginTop: 4 }}
          >
            <LogOut size={18} color="#f87171" strokeWidth={1.5} />
            <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 15, lineHeight: '24px', color: '#f87171' }}>
              {state.isSignedIn ? 'Logout' : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
