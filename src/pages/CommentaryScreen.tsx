import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCommentary } from '@/services/bibleService';
import { Commentary } from '@/services/types';
import { ChevronDown, ChevronUp, Menu } from 'lucide-react';
import MarkdownBlock from '@/components/MarkdownBlock';
import ShareIcon from '@/components/ShareIcon';

type Tab = 'summary' | 'byline' | 'detailed';

/* ─── Production SVG Icons ─── */
function BibleIcon({ fill = '#fff' }: { fill?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <mask id="mask0_bible_c" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_bible_c)">
        <path fill={fill} fillRule="evenodd" clipRule="evenodd" d="M5.39525 21.6047C5.99208 22.2016 6.71292 22.5 7.55775 22.5H19.5V21C19.0705 21 18.7035 20.8477 18.399 20.5432C18.0945 20.2387 17.9423 19.8717 17.9423 19.4423C17.9423 19.0128 18.0945 18.6458 18.399 18.3413C18.7035 18.0368 19.0705 17.8845 19.5 17.8845V3.5H7.75C6.8475 3.5 6.08017 3.816 5.448 4.448C4.816 5.08017 4.5 5.8475 4.5 6.75V19.4423C4.5 20.2871 4.79842 21.0079 5.39525 21.6047ZM6.72975 16.498C6.47025 16.5737 6.227 16.6891 6 16.8443V6.75C6 6.26917 6.1715 5.85733 6.5145 5.5145C6.85733 5.1715 7.26917 5 7.75 5H8.19225V16.3848H7.55775C7.26542 16.3848 6.98942 16.4225 6.72975 16.498ZM18 16.3848H9.69225V5H18V16.3848ZM16.902 21H7.55775C7.11158 21 6.74042 20.8519 6.44425 20.5557C6.14808 20.2596 6 19.8884 6 19.4423C6 19.0128 6.14808 18.6458 6.44425 18.3413C6.74042 18.0368 7.11158 17.8845 7.55775 17.8845H16.902C16.7468 18.1115 16.6314 18.3564 16.5557 18.6193C16.4801 18.8821 16.4423 19.1564 16.4423 19.4423C16.4423 19.7449 16.4827 20.0235 16.5635 20.278C16.6442 20.5323 16.757 20.773 16.902 21ZM13 7H14.5V9H16.5V10.5H14.5V15H13V10.5H11V9H13V7Z" />
      </g>
    </svg>
  );
}

function AutoStoriesIcon({ fill = '#fff' }: { fill?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" aria-hidden="true">
      <path fill={fill} d="M480-160q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q58 0 113.5 15T480-740v484q51-32 107-48t113-16q36 0 70.5 6t69.5 18v-480q15 5 29.5 10.5T898-752q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59Zm80-200v-380l200-200v400L560-360Zm-160 65v-396q-41-24-87-36t-93-12q-36 0-71.5 7T80-712v396q35-12 69.5-18t70.5-6q47 0 91.5 10.5T400-295Zm0 0v-396 396Z" />
    </svg>
  );
}

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
    <div className="flex flex-col h-full" style={{ backgroundColor: '#ffffff' }}>
      {/* Header — #000 black, Insight icon gold (active), Bible icon white (inactive) */}
      <header
        className="shrink-0 safe-top"
        style={{ backgroundColor: '#000000', paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)' }}
      >
        <div className="flex items-center justify-between px-4" style={{ height: 56 }}>
          <button
            onClick={() => navigate(`/read`)}
            className="flex items-center gap-1.5 min-h-[44px] pr-2 -ml-1"
            style={{ color: '#FFFFFF' }}
          >
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '24px', color: '#FFFFFF' }}>
              {decodedBook} {chapterNum}
            </span>
            <ChevronDown size={18} style={{ color: '#FFFFFF' }} strokeWidth={2} />
          </button>

          <div className="flex items-center gap-3">
            {/* Bible icon — inactive (white) */}
            <button
              aria-label="Bible"
              onClick={() => navigate('/read')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <BibleIcon fill="#ffffff" />
            </button>
            {/* Insight icon — active (gold) */}
            <button aria-label="Insight" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <AutoStoriesIcon fill="#b09a6d" />
            </button>
            <button
              onClick={() => navigate('/menu')}
              aria-label="Open menu"
              className="flex items-center justify-center w-[44px] h-[44px] -mr-2"
            >
              <Menu size={22} style={{ color: '#FFFFFF' }} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Tab pills — dark subheader, pills with #fff3 bg / gold selected */}
      <div
        className="shrink-0"
        style={{ backgroundColor: '#000000', display: 'flex', justifyContent: 'center', padding: '12px 16px' }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
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
                backgroundColor: tab === t.id ? '#b09a6d' : 'rgba(255,255,255,0.2)',
                color: tab === t.id ? '#000000' : '#ffffff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body — WHITE background, BLACK text */}
      <div className="flex-1 overflow-y-auto px-4 pb-8" style={{ backgroundColor: '#ffffff', color: '#1B1B1B' }}>
        {commentaries.length === 0 ? (
          <p className="text-[14px] text-center py-8" style={{ color: '#818990' }}>
            No commentary available for this chapter.
          </p>
        ) : tab === 'summary' ? (
          <div className="pt-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 20, lineHeight: '28px', color: '#1B1B1B', margin: 0 }}>
                Summary of {decodedBook} {chapterNum}
              </h2>
              <button
                onClick={() => navigator.share?.({ title: `Summary of ${decodedBook} ${chapterNum}`, text: `Summary of ${decodedBook} ${chapterNum}` }).catch(() => {})}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexShrink: 0 }}
                aria-label="Share summary"
              >
                <ShareIcon size={20} color="#1B1B1B" />
              </button>
            </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 20, lineHeight: '28px', color: '#1B1B1B', margin: 0 }}>
                    Line-by-Line Analysis of {decodedBook} {chapterNum}
                  </h2>
                  <button
                    onClick={() => navigator.share?.({ title: `Line-by-Line Analysis of ${decodedBook} ${chapterNum}`, text: `Line-by-Line Analysis of ${decodedBook} ${chapterNum}` }).catch(() => {})}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexShrink: 0 }}
                    aria-label="Share line-by-line analysis"
                  >
                    <ShareIcon size={20} color="#1B1B1B" />
                  </button>
                </div>
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
                      <div key={c.verse} style={{ borderBottom: '1px solid #dce0e380' }}>
                        <button
                          onClick={() => setExpanded(isOpen ? null : c.verse)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#1B1B1B' }}>
                            {decodedBook} {chapterNum}:{c.verse}
                          </span>
                          {isOpen ? (
                            <ChevronUp size={18} color="#818990" style={{ flexShrink: 0 }} />
                          ) : (
                            <ChevronDown size={18} color="#818990" style={{ flexShrink: 0 }} />
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
                    <p className="text-[14px] py-8 text-center" style={{ color: '#818990' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 20, lineHeight: '28px', color: '#1B1B1B', margin: 0 }}>
                    In-Depth Analysis of {decodedBook} {chapterNum}
                  </h2>
                  <button
                    onClick={() => navigator.share?.({ title: `In-Depth Analysis of ${decodedBook} ${chapterNum}`, text: `In-Depth Analysis of ${decodedBook} ${chapterNum}` }).catch(() => {})}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexShrink: 0 }}
                    aria-label="Share in-depth analysis"
                  >
                    <ShareIcon size={20} color="#1B1B1B" />
                  </button>
                </div>
                <CommentaryBody text={detailed.detail} />
              </div>
            ) : (
              <p className="text-[14px] py-8 text-center" style={{ color: '#818990' }}>
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
 * Commentary body renderer — light theme: black text on white surface.
 */
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
        <p key={key++} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 16, lineHeight: '24px', color: '#1B1B1B', marginBottom: 12 }}>
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
        <h2 key={key++} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 18, lineHeight: '24px', color: '#1B1B1B', marginTop: 16, marginBottom: 8 }}>
          {inlineFormat(text)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('>')) {
      flushPara();
      elements.push(
        <blockquote key={key++} style={{ borderLeft: '2px solid #b09a6d', paddingLeft: 12, fontStyle: 'italic', marginBottom: 12, fontFamily: 'Inter, sans-serif', fontSize: 16, lineHeight: '24px', color: '#3e464d' }}>
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
