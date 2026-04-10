import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCommentary } from '@/services/bibleService';
import { Commentary } from '@/services/types';
import { ChevronDown, ChevronUp, Menu } from 'lucide-react';
import MarkdownBlock from '@/components/MarkdownBlock';

type Tab = 'summary' | 'byline' | 'detailed';

// Production SVG icons for the header tab triggers
function BibleIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.39525 21.6047C5.99208 22.2016 6.71292 22.5 7.55775 22.5H19.5V21C19.0705 21 18.75 20.6795 18.75 20.25C18.75 19.8205 19.0705 19.5 19.5 19.5V3H7.55775C6.71292 3 5.99208 3.29842 5.39525 3.89525C4.79842 4.49208 4.5 5.21292 4.5 6.05775V18.9423C4.5 19.7871 4.79842 20.5079 5.39525 21.6047ZM9 7.5H10.5V9H12V10.5H10.5V12H9V10.5H7.5V9H9V7.5ZM13.5 9.75H16.5V11.25H13.5V9.75ZM13.5 12.75H16.5V14.25H13.5V12.75ZM7.5 12.75H11.25V14.25H7.5V12.75ZM7.5 15.75H16.5V17.25H7.5V15.75Z"
        fill={active ? '#b09a6d' : '#fff'}
      />
    </svg>
  );
}

function AutoStoriesIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 -960 960 960" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M480-160q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q58 0 113.5 15T480-740v484q51-32 107-48t113-16q36 0 70.5 6t69.5 18v-480q15 5 29.5 10.5T898-752q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59Zm80-200v-380l200-200v400L560-360Zm-160 65v-396q-41-24-87-36t-93-12q-36 0-71.5 7T80-712v396q35-12 69.5-18t70.5-6q47 0 91.5 10.5T400-295Zm0 0v-396 396Z"
        fill={active ? '#b09a6d' : '#fff'}
      />
    </svg>
  );
}

/**
 * CommentaryScreen — dark header with icon tabs (AutoStories active), tab pills right-aligned,
 * white body area. Production-exact layout.
 */
export default function CommentaryScreen() {
  const { book, chapter } = useParams<{ book: string; chapter: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('summary');
  const [commentaries, setCommentaries] = useState<Commentary[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  const decodedBook = decodeURIComponent(book || '');
  const chapterNum = parseInt(chapter || '1', 10);

  useEffect(() => {
    fetchCommentary(decodedBook, chapterNum).then(setCommentaries);
  }, [decodedBook, chapterNum]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'byline', label: 'By Line' },
    { id: 'detailed', label: 'Detailed' },
  ];

  return (
    <div className="flex flex-col h-full bg-dark-surface text-dark-fg">
      {/* Header — dark, AutoStories icon active (gold), Bible icon inactive (white) */}
      <header
        className="shrink-0 bg-dark-surface safe-top"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)' }}
      >
        <div className="flex items-center justify-between px-4" style={{ height: 56 }}>
          {/* Left: Book + chapter dropdown — tapping navigates back to /read */}
          <button
            onClick={() => navigate(`/read`)}
            className="flex items-center gap-1.5 text-dark-fg min-h-[44px] pr-2 -ml-1"
          >
            <span className="text-[18px] font-medium tracking-tight">
              {decodedBook} {chapterNum}
            </span>
            <ChevronDown size={18} className="text-dark-fg/90" strokeWidth={2} />
          </button>

          {/* Right: Bible/AutoStories icon tabs + Menu */}
          <div className="flex items-center gap-1">
            <button
              aria-label="Bible"
              onClick={() => navigate('/read')}
              style={{ background: 'transparent', border: 'none', padding: '10px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <BibleIcon active={false} />
            </button>
            <button
              aria-label="Insight"
              style={{ background: 'transparent', border: 'none', padding: '10px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <AutoStoriesIcon active={true} />
            </button>
            <button
              onClick={() => navigate('/menu')}
              aria-label="Open menu"
              className="flex items-center justify-center w-[44px] h-[44px] -mr-2"
            >
              <Menu size={22} className="text-dark-fg" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Tab pills — dark bar, RIGHT-ALIGNED, gap 16px, padding 16px */}
      <div
        className="shrink-0 bg-dark-surface"
        style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', gap: 16, padding: 16 }}
      >
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              borderRadius: 100,
              padding: '2px 8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              lineHeight: '24px',
              background: tab === t.id ? '#b09a6d' : 'rgba(255,255,255,0.2)',
              color: tab === t.id ? '#000' : '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body — dark background, light text */}
      <div className="flex-1 overflow-y-auto px-4 pb-8" style={{ background: 'hsl(var(--dark-surface))', color: '#fff' }}>
        {commentaries.length === 0 ? (
          <p className="text-[14px] text-center py-8" style={{ color: 'hsl(var(--dark-surface-muted))' }}>
            No commentary available for this chapter.
          </p>
        ) : tab === 'summary' ? (
          <div className="pt-4">
            {/* Title: Inter 700 20px/28px, white */}
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 20, lineHeight: '28px', color: '#fff', marginBottom: 16 }}>
              Summary of {decodedBook} {chapterNum}
            </h2>
            {(() => {
              const summary = commentaries.find(c => c.type === 'summary');
              return summary ? (
                <CommentaryBody text={summary.detail} />
              ) : (
                <p className="text-[14px]" style={{ color: '#818990' }}>No summary available.</p>
              );
            })()}
          </div>
        ) : tab === 'byline' ? (
          (() => {
            const byLineItems = commentaries.filter(c => c.type === 'byline');
            const allExpanded = expanded === -2;
            return (
              <div className="pt-4">
                {/* Title: Inter 500 18px/24px, white */}
                <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 18, lineHeight: '24px', color: '#fff', marginBottom: 12 }}>
                  Line-by-Line Analysis of {decodedBook} {chapterNum}
                </h2>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button
                    onClick={() => setExpanded(allExpanded ? null : -2)}
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#b09a6d', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {allExpanded ? 'Collapse All' : 'Expand All'}
                  </button>
                </div>
                <div>
                  {byLineItems.map(c => {
                    const isOpen = allExpanded || expanded === c.verse;
                    return (
                      <div key={c.verse} style={{ borderBottom: '1px solid hsl(var(--dark-border))' }}>
                        <button
                          onClick={() => setExpanded(isOpen ? null : c.verse)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#fff' }}>
                            {decodedBook} {chapterNum}:{c.verse}
                          </span>
                          {isOpen ? (
                            <ChevronUp size={18} color="hsl(var(--dark-surface-muted))" style={{ flexShrink: 0 }} />
                          ) : (
                            <ChevronDown size={18} color="hsl(var(--dark-surface-muted))" style={{ flexShrink: 0 }} />
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
                    <p className="text-[14px] py-8 text-center" style={{ color: 'hsl(var(--dark-surface-muted))' }}>
                      Line-by-line analysis not available.
                    </p>
                  )}
                </div>
              </div>
            );
          })()
        ) : (
          (() => {
            const detailed = commentaries.find(c => c.type === 'detailed');
            return detailed ? (
              <div className="pt-4">
                {/* Title: Inter 700 20px/28px, white */}
                <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 20, lineHeight: '28px', color: '#fff', marginBottom: 16 }}>
                  In-Depth Analysis of {decodedBook} {chapterNum}
                </h2>
                <CommentaryBody text={detailed.detail} />
              </div>
            ) : (
              <p className="text-[14px] py-8 text-center" style={{ color: 'hsl(var(--dark-surface-muted))' }}>
                Detailed commentary not available.
              </p>
            );
          })()
        )}
      </div>
    </div>
  );
}

/**
 * Commentary body renderer — dark theme: white text on dark surface.
 * h2 elements → Inter 500 18px/24px, white
 * p text → Inter 400 16px/24px, white
 */
function CommentaryBody({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let para: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length) {
      elements.push(
        <p key={key++} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 16, lineHeight: '24px', color: '#fff', marginBottom: 12 }}>
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
        <h2 key={key++} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 18, lineHeight: '24px', color: '#fff', marginTop: 16, marginBottom: 8 }}>
          {inlineFormat(text)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('>')) {
      flushPara();
      elements.push(
        <blockquote key={key++} style={{ borderLeft: '2px solid #b09a6d', paddingLeft: 12, fontStyle: 'italic', marginBottom: 12, fontFamily: 'Inter, sans-serif', fontSize: 16, lineHeight: '24px', color: 'rgba(255,255,255,0.8)' }}>
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
