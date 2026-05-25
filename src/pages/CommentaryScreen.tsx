import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCommentary, fetchBooks } from '@/services/bibleService';
import { Commentary } from '@/services/types';
import { parseBookParam, nameToSlug } from '@/lib/bookSlugs';
import { ChevronDown, ChevronUp, Menu, Copy, Check } from 'lucide-react';
import MarkdownBlock from '@/components/MarkdownBlock';
import ShareIcon from '@/components/ShareIcon';
import StudyPanel from '@/components/StudyPanel';
// VisualsPanel pulls the full VISUALS_REGISTRY. Lazy so users who never
// open the Visuals tab don't pay for it on initial mobile page load.
const VisualsPanel = lazy(() => import('@/components/VisualsPanel'));
import { BOOKS_WITH_VISUALS } from '@/data/visuals/booksWithVisuals';
import { useApp } from '@/contexts/AppContext';

type Tab = 'summary' | 'byline' | 'study' | 'visuals';

// Books that have curated visual aids. Add more as visuals are produced.
// `BOOKS_WITH_VISUALS` is imported from the generated registry; its
// contents update automatically when build_manifests.py is re-run.

export default function CommentaryScreen() {
  const { book: bookParam, chapter } = useParams<{ book: string; chapter: string }>();
  const navigate = useNavigate();
  // Persist the active tab across remounts so portrait↔landscape rotation
  // doesn't reset the user's place. Same key + values as DesktopLayout.
  const [tab, setTab] = useState<Tab>(() => {
    try {
      const v = sessionStorage.getItem('versemate-commentary-tab');
      if (v === 'summary' || v === 'byline' || v === 'study' || v === 'visuals') return v;
    } catch { /* ignore */ }
    return 'summary';
  });
  useEffect(() => {
    try { sessionStorage.setItem('versemate-commentary-tab', tab); } catch { /* ignore */ }
  }, [tab]);

  // Per-tab "Copied!" feedback for the new Copy buttons on each commentary
  // tab header. Keyed by tab id so the checkmark is shown on the right button.
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
  const [commentaries, setCommentaries] = useState<Commentary[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [bookName, setBookName] = useState<string>('');
  const [bookId, setBookId] = useState<number | null>(null);

  // Issue #46 — accept BOTH the lowercase slug (matches /bible/<slug>)
  // AND the legacy capitalized book name (URLs already in circulation).
  // parseBookParam returns a bookId for slug forms; if it succeeds we
  // resolve the canonical book name via fetchBooks. Otherwise we fall
  // back to the decoded raw param (capitalized name).
  const rawDecoded = decodeURIComponent(bookParam || '');
  const chapterNum = parseInt(chapter || '1', 10);

  useEffect(() => {
    if (!bookParam) {
      setBookName('');
      return;
    }
    // Slug path: resolve via bookSlugs lib.
    const parsedBookId = parseBookParam(bookParam);
    if (parsedBookId !== null) {
      setBookId(parsedBookId);
      let cancelled = false;
      fetchBooks().then((books) => {
        if (cancelled) return;
        const book = books.find((b) => b.bookId === parsedBookId);
        setBookName(book?.name || rawDecoded);
      }).catch(() => setBookName(rawDecoded));
      return () => {
        cancelled = true;
      };
    }
    // Legacy path: param was a capitalized book name. Resolve bookId via
    // a books lookup so AudioInlineEntry has the numeric id it needs.
    setBookName(rawDecoded);
    let cancelled = false;
    fetchBooks().then((books) => {
      if (cancelled) return;
      const book = books.find((b) => b.name.toLowerCase() === rawDecoded.toLowerCase());
      setBookId(book?.bookId ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [bookParam, rawDecoded]);

  const decodedBook = bookName || rawDecoded;

  useEffect(() => {
    if (!decodedBook) return;
    fetchCommentary(decodedBook, chapterNum).then(setCommentaries);
  }, [decodedBook, chapterNum]);

  // decodedBook is the API display name; the registry is slug-keyed. Use
  // nameToSlug so "2 Kings" → "2-kings" matches; a raw .toLowerCase() leaves
  // a space and silently misses for every hyphenated-slug book.
  const hasVisuals = BOOKS_WITH_VISUALS.has(nameToSlug(decodedBook));
  const tabs: { id: Tab; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'byline', label: 'By Line' },
    { id: 'study', label: 'Study' },
    ...(hasVisuals ? [{ id: 'visuals' as Tab, label: 'Visuals' }] : []),
  ];

  // If the Visuals tab is sticky from sessionStorage but the current book
  // doesn't have curated visuals, fall back to Summary so the body never
  // routes to an empty tab.
  useEffect(() => {
    if (tab === 'visuals' && !hasVisuals) setTab('summary');
  }, [hasVisuals, tab]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.chromeBg }}>
      {/* Header — #1A1A1A dark, Insight pill gold (active), Bible pill white (inactive) */}
      <header
        className="shrink-0 safe-top"
        style={{ backgroundColor: vmTokens.headerBg, paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)' }}
      >
        <div className="flex items-center justify-between px-4" style={{ height: 56 }}>
          <button
            onClick={() => navigate(`/read`)}
            data-testid="chapter-selector-button"
            className="flex items-center gap-1.5 min-h-[44px] pr-2 -ml-1"
            style={{ color: vmTokens.headerFg }}
          >
            <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '24px', color: vmTokens.headerFg }}>
              {decodedBook} {chapterNum}
            </span>
            <ChevronDown size={18} style={{ color: vmTokens.headerFg }} strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2">
            {/* Pill container */}
            <div style={{ display: 'flex', backgroundColor: vmTokens.pillBg, borderRadius: 100, padding: '3px' }}>
              {/* Bible pill — inactive */}
              <button
                aria-label="Bible"
                data-testid="bible-view-icon"
                onClick={() => navigate('/read')}
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '24px',
                  padding: '2px 12px',
                  borderRadius: 100,
                  backgroundColor: 'transparent',
                  color: vmTokens.headerFg,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Bible
              </button>
              {/* Insight pill — active (gold) */}
              <button
                aria-label="Insight"
                data-testid="commentary-view-icon"
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '24px',
                  padding: '2px 12px',
                  borderRadius: 100,
                  backgroundColor: vmTokens.gold,
                  color: vmTokens.pageBg,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Insight
              </button>
            </div>
            <button
              onClick={() => navigate('/menu')}
              aria-label="Open menu"
              data-testid="hamburger-menu-button"
              className="flex items-center justify-center w-[44px] h-[44px] -mr-2"
            >
              <Menu size={22} style={{ color: vmTokens.headerFg }} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Tab pills — dark subheader (#1A1A1A), pills in #323232 container */}
      <div
        className="shrink-0"
        style={{ backgroundColor: vmTokens.headerBg, display: 'flex', justifyContent: 'center', padding: '12px 16px' }}
      >
        <div
          role="tablist"
          aria-label="Commentary view"
          style={{ display: 'flex', backgroundColor: vmTokens.pillBg, borderRadius: 100, padding: '3px', gap: 0 }}
        >
          {tabs.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              data-testid={`tab-${t.id}`}
              style={{
                borderRadius: 100,
                padding: '4px 16px',
                fontFamily: 'Roboto, sans-serif',
                fontSize: 14,
                fontWeight: 400,
                lineHeight: '24px',
                whiteSpace: 'nowrap',
                backgroundColor: tab === t.id ? vmTokens.gold : 'transparent',
                color: tab === t.id ? vmTokens.headerBg : vmTokens.headerFg,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body — theme-aware reading surface (cream in light, black in dark)
          with primary text so content stays legible in both themes. */}
      <div className="flex-1 overflow-y-auto px-4 pb-8" style={{ backgroundColor: vmTokens.pageBg, color: vmTokens.textPrimary }}>
        {/* Study tab uses its own static data; route it before the empty
            commentaries early-return. */}
        {tab === 'study' ? (
          <div className="pt-4">
            {/* `key` forces remount on chapter change — see DesktopLayout
                for the full reasoning. Prevents Genesis open-card state
                from bleeding into Matthew. */}
            <StudyPanel
              key={`${bookId}:${chapterNum}`}
              book={decodedBook}
              bookId={bookId}
              chapter={chapterNum}
            />
          </div>
        ) : tab === 'visuals' ? (
          <div className="pt-4">
            <Suspense fallback={<p className="text-[14px] text-center py-8" style={{ color: vmTokens.textTertiary }}>Loading visuals…</p>}>
              <VisualsPanel
                key={`${bookId}:${chapterNum}`}
                book={decodedBook}
                bookId={bookId}
                chapter={chapterNum}
              />
            </Suspense>
          </div>
        ) : commentaries.length === 0 ? (
          <p className="text-[14px] text-center py-8" style={{ color: vmTokens.textTertiary }}>
            No commentary available for this chapter.
          </p>
        ) : tab === 'summary' ? (
          <div className="pt-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 20, lineHeight: '28px', color: vmTokens.textPrimary, margin: 0 }}>
                Summary of {decodedBook} {chapterNum}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <button
                  onClick={() => {
                    const summary = commentaries.find(c => c.type === 'summary');
                    const body = summary?.detail
                      ? `Summary of ${decodedBook} ${chapterNum}\n\n${stripMarkdown(summary.detail)}`
                      : `Summary of ${decodedBook} ${chapterNum}`;
                    copyToClipboard(body, 'summary');
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
                  aria-label="Copy summary"
                  data-testid="copy-summary-button"
                >
                  {copiedTab === 'summary'
                    ? <Check size={20} color={vmTokens.gold} strokeWidth={2} />
                    : <Copy size={20} color={vmTokens.textPrimary} strokeWidth={1.5} />}
                </button>
                <button
                  onClick={() => {
                    const summary = commentaries.find(c => c.type === 'summary');
                    navigator.share?.({
                      title: `Summary of ${decodedBook} ${chapterNum}`,
                      text: summary?.detail
                        ? `Summary of ${decodedBook} ${chapterNum}\n\n${stripMarkdown(summary.detail)}`
                        : `Summary of ${decodedBook} ${chapterNum}`,
                      url: window.location.href,
                    }).catch(() => {});
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
                  aria-label="Share summary"
                  data-testid="share-summary-button"
                >
                  <ShareIcon size={20} color={vmTokens.textPrimary} />
                </button>
              </div>
            </div>
            {(() => {
              const summary = commentaries.find(c => c.type === 'summary');
              if (!summary) {
                return <p className="text-[14px]" style={{ color: vmTokens.textTertiary }}>No summary available.</p>;
              }
              return (
                <>
                  <CommentaryBody text={summary.detail} />
                </>
              );
            })()}
          </div>
        ) : (
          (() => {
            const byLineItems = commentaries.filter(c => c.type === 'byline');
            const allExpanded = expanded === -2;
            return (
              <div className="pt-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 20, lineHeight: '28px', color: vmTokens.textPrimary, margin: 0 }}>
                    Line-by-Line Analysis of {decodedBook} {chapterNum}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        const body = byLineItems
                          .map(c => `${decodedBook} ${chapterNum}:${c.verse}\n${stripMarkdown(c.detail)}`)
                          .join('\n\n');
                        const text = body
                          ? `Line-by-Line Analysis of ${decodedBook} ${chapterNum}\n\n${body}`
                          : `Line-by-Line Analysis of ${decodedBook} ${chapterNum}`;
                        copyToClipboard(text, 'byline');
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
                      aria-label="Copy line-by-line analysis"
                      data-testid="copy-byline-button"
                    >
                      {copiedTab === 'byline'
                        ? <Check size={20} color={vmTokens.gold} strokeWidth={2} />
                        : <Copy size={20} color={vmTokens.textPrimary} strokeWidth={1.5} />}
                    </button>
                    <button
                      onClick={() => {
                        const body = byLineItems
                          .map(c => `${decodedBook} ${chapterNum}:${c.verse}\n${stripMarkdown(c.detail)}`)
                          .join('\n\n');
                        navigator.share?.({
                          title: `Line-by-Line Analysis of ${decodedBook} ${chapterNum}`,
                          text: body
                            ? `Line-by-Line Analysis of ${decodedBook} ${chapterNum}\n\n${body}`
                            : `Line-by-Line Analysis of ${decodedBook} ${chapterNum}`,
                          url: window.location.href,
                        }).catch(() => {});
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
                      aria-label="Share line-by-line analysis"
                      data-testid="share-byline-button"
                    >
                      <ShareIcon size={20} color={vmTokens.textPrimary} />
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button
                    onClick={() => setExpanded(allExpanded ? null : -2)}
                    data-testid="byline-expand-all-button"
                    style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: vmTokens.gold, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {allExpanded ? 'Collapse All' : 'Expand All'}
                  </button>
                </div>
                <div>
                  {byLineItems.map(c => {
                    const isOpen = allExpanded || expanded === c.verse;
                    return (
                      <div key={c.verse} data-testid={`byline-verse-${c.verse}`} style={{ borderBottom: `1px solid ${vmTokens.divider}` }}>
                        <button
                          onClick={() => setExpanded(isOpen ? null : c.verse)}
                          data-testid={`byline-verse-toggle-${c.verse}`}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: vmTokens.textPrimary }}>
                            {decodedBook} {chapterNum}:{c.verse}
                          </span>
                          {isOpen ? (
                            <ChevronUp size={18} color={vmTokens.textTertiary} style={{ flexShrink: 0 }} />
                          ) : (
                            <ChevronDown size={18} color={vmTokens.textTertiary} style={{ flexShrink: 0 }} />
                          )}
                        </button>
                        {isOpen && (
                          <div style={{ paddingBottom: 16 }}>
                            <CommentaryBody text={c.detail} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {byLineItems.length === 0 && (
                    <p className="text-[14px] py-8 text-center" style={{ color: vmTokens.textTertiary }}>
                      Line-by-line analysis not available.
                    </p>
                  )}
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}

/**
 * Commentary body renderer — dark theme: white text on black surface.
 *
 * Body text honors `state.settings.fontSize` so the user's reading-size
 * preference scales paragraphs and blockquotes the same way it does on
 * the Bible side and in StudyPanel/MarkdownBlock. Heading tags inside
 * the commentary keep their fixed size (chrome, not body).
 */
function CommentaryBody({ text }: { text: string }) {
  const { state } = useApp();
  const bodyFontSize = state.settings.fontSize;
  // Mobile body uses ~24px line-height at 16px font. Scale proportionally.
  const bodyLineHeight = Math.round(bodyFontSize * 1.5);

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
        <p key={key++} style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: bodyFontSize, lineHeight: `${bodyLineHeight}px`, color: vmTokens.textPrimary, marginBottom: 12 }}>
          {inlineFormat(para.join(' '))}
        </p>
      );
      para = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushPara();
      continue;
    }
    if (line.startsWith('###') || line.startsWith('##') || line.startsWith('#')) {
      flushPara();
      const text = line.replace(/^#+\s*/, '');
      elements.push(
        <h2 key={key++} style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600, fontSize: 17, lineHeight: '24px', color: vmTokens.textPrimary, marginTop: 22, marginBottom: 8 }}>
          {inlineFormat(text)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('>')) {
      flushPara();
      elements.push(
        <blockquote key={key++} style={{ borderLeft: `2px solid ${vmTokens.gold}`, paddingLeft: 12, fontStyle: 'italic', marginBottom: 12, fontFamily: 'Roboto, sans-serif', fontSize: bodyFontSize, lineHeight: `${bodyLineHeight}px`, color: vmTokens.textTertiary }}>
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

import React from 'react';
import { vmTokens } from '@/styles/themeStyles';

function stripMarkdown(text: string): string {
  return text
    .replace(/^#+\s*/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
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
