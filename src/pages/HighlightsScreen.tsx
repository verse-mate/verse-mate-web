import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Highlighter, ChevronRight } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import { api } from '@/services/api';

interface HighlightTheme {
  theme_id: number;
  name: string;
  color: string;
  description: string;
  is_active: boolean;
}

/**
 * HighlightsScreen — combined list of chapters with user highlights + the
 * Auto Highlights theme toggles section per Figma frame 5310:16583 + 5310:17026.
 *
 * Top: grouped chapters with highlight counts (rounded dark cards, chevron).
 * Bottom: "Auto Highlights" header + copy + master toggle + per-theme toggles.
 */
export default function HighlightsScreen() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [themes, setThemes] = useState<HighlightTheme[]>([]);
  const [enabledThemes, setEnabledThemes] = useState<Set<number>>(new Set());

  useEffect(() => {
    api
      .get<{ data: HighlightTheme[] }>('/bible/highlight-themes', undefined, { auth: false })
      .then(r => setThemes(r?.data || []))
      .catch(() => setThemes([]));

    api
      .get<{ data: Array<{ theme_id: number; is_enabled: boolean }> }>(
        '/bible/user/theme-preferences'
      )
      .then(r => {
        const active = new Set<number>();
        for (const p of r?.data || []) {
          if (p.is_enabled) active.add(p.theme_id);
        }
        setEnabledThemes(active);
      })
      .catch(() => undefined);
  }, []);

  // Group highlights by book+chapter for the top list
  const groupedHighlights = useMemo(() => {
    const groups = new Map<string, { book: string; bookId: number; chapter: number; count: number }>();
    for (const h of state.highlights) {
      const key = `${h.bookId}:${h.chapter}`;
      const existing = groups.get(key);
      if (existing) existing.count += 1;
      else
        groups.set(key, {
          book: h.book,
          bookId: h.bookId,
          chapter: h.chapter,
          count: 1,
        });
    }
    return Array.from(groups.values());
  }, [state.highlights]);

  const openChapter = (bookName: string, chapter: number, bookId: number) => {
    dispatch({ type: 'SET_PASSAGE', book: bookName, chapter, bookId });
    navigate('/read');
  };

  const toggleTheme = async (themeId: number) => {
    const next = new Set(enabledThemes);
    const newState = !next.has(themeId);
    if (newState) next.add(themeId);
    else next.delete(themeId);
    setEnabledThemes(next);
    try {
      await api.patch(`/bible/user/theme-preferences/${themeId}`, { is_enabled: newState });
    } catch {
      setEnabledThemes(enabledThemes);
    }
  };

  const toggleAllThemes = async (enable: boolean) => {
    const next = enable ? new Set(themes.map(t => t.theme_id)) : new Set<number>();
    setEnabledThemes(next);
    for (const t of themes) {
      api
        .patch(`/bible/user/theme-preferences/${t.theme_id}`, { is_enabled: enable })
        .catch(() => undefined);
    }
  };

  const allOn = themes.length > 0 && enabledThemes.size === themes.length;

  const colorDot: Record<string, string> = {
    yellow: 'bg-yellow-400',
    green: 'bg-green-400',
    blue: 'bg-blue-400',
    pink: 'bg-pink-400',
    purple: 'bg-purple-400',
    orange: 'bg-orange-400',
    red: 'bg-red-400',
    teal: 'bg-teal-400',
    brown: 'bg-amber-700',
  };

  // highlightList container
  const listStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '12px 8px',
    borderTop: '1px solid #323232',
    backgroundColor: '#000000',
    scrollbarWidth: 'none',
  };

  // chapterGroup: bg #323232, border #323232, border-radius 10px
  const chapterGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#323232',
    border: '1px solid #323232',
    borderRadius: 10,
    overflow: 'hidden',
    cursor: 'pointer',
    flexShrink: 0,
  };

  // Auto-highlight theme card: #323232
  const themeCardStyle: React.CSSProperties = {
    backgroundColor: '#323232',
    border: '1px solid #323232',
    borderRadius: 10,
    padding: '12px 16px',
  };

  return (
    <div className="flex flex-col h-full text-white" style={{ backgroundColor: '#1B1B1B' }}>
      <ScreenHeader title="Highlights" />

      <div style={listStyle}>
        {/* Highlighted chapters list */}
        {groupedHighlights.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', fontSize: 14 }}>
            <Highlighter size={36} style={{ margin: '0 auto 8px', color: 'rgba(255,255,255,0.6)' }} strokeWidth={1.5} />
            <p style={{ fontSize: 13 }}>No highlights yet</p>
          </div>
        ) : (
          <>
            {groupedHighlights.map(g => (
              <button
                key={`${g.bookId}:${g.chapter}`}
                onClick={() => openChapter(g.book, g.chapter, g.bookId)}
                style={{
                  ...chapterGroupStyle,
                  padding: '12px 16px',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  border: '1px solid #323232',
                  background: '#323232',
                  borderRadius: 10,
                  width: '100%',
                  textAlign: 'left',
                } as React.CSSProperties}
              >
                {/* chapterTitle: font-weight 600, white, font-size 15px */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#fff', fontSize: 15 }}>
                  <Highlighter size={18} style={{ color: '#fff' }} strokeWidth={1.75} />
                  {g.book} {g.chapter}
                  {/* countBadge: dark surface bg, muted text */}
                  <span style={{ backgroundColor: '#000000', color: 'rgba(255,255,255,0.6)', fontSize: 12, padding: '2px 8px', borderRadius: 12 }}>
                    {g.count}
                  </span>
                </div>
                <ChevronRight size={20} style={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
              </button>
            ))}
          </>
        )}

        {/* Auto Highlights section */}
        <div style={{ marginTop: 8 }}>
          <h2 style={{ textAlign: 'center', fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
            Auto Highlights
          </h2>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 16, padding: '0 8px' }}>
            Auto-generated highlights help identify key verses, promises,
            commands, and more throughout the Bible.
            <br />
            Toggle themes on or off to customize which highlights you see
          </p>

          {/* Master toggle card */}
          <div style={{ ...themeCardStyle, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, color: '#b09a6d', fontWeight: 500 }}>
                  Enable All Auto-Highlights
                </p>
                <p style={{ fontSize: 12, color: '#818990', marginTop: 2 }}>
                  Turn all Auto-generated highlights on or off
                </p>
              </div>
              <ThemeToggle value={allOn} onChange={toggleAllThemes} />
            </div>
          </div>

          {/* Per-theme toggle cards */}
          {themes.length === 0 ? (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', padding: '16px 0', textAlign: 'center' }}>
              Loading themes…
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {themes.map(t => {
                const isOn = enabledThemes.has(t.theme_id);
                return (
                  <div key={t.theme_id} style={themeCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                        {/* colorIndicator: 10px circle */}
                        <span
                          className={colorDot[t.color] || 'bg-gray-400'}
                          style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 5, border: '1px solid rgba(0,0,0,0.05)' }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{t.name}</p>
                          {t.description && (
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2, lineHeight: 1.4 }}>
                              {t.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <ThemeToggle value={isOn} onChange={() => toggleTheme(t.theme_id)} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThemeToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      className={`relative w-11 h-6 rounded-full shrink-0 mt-1 transition-colors ${
        value ? 'bg-gold' : 'bg-dark-raised border border-dark'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform ${
          value ? 'translate-x-5 bg-[#1A1A1A]' : 'translate-x-0 bg-[#1B1B1B]'
        }`}
      />
    </button>
  );
}
