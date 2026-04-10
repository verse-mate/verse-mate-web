import { useEffect, useMemo, useState } from 'react';
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

  return (
    <div className="flex flex-col h-full bg-white text-[#1B1B1B]">
      <ScreenHeader title="Highlights" />

      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-8">
        {/* Highlighted chapters list */}
        {groupedHighlights.length === 0 ? (
          <div className="flex flex-col items-center text-center py-8">
            <Highlighter size={36} className="text-[#818990] mb-2" strokeWidth={1.5} />
            <p className="text-[#818990] text-[13px]">No highlights yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupedHighlights.map(g => (
              <button
                key={`${g.bookId}:${g.chapter}`}
                onClick={() => openChapter(g.book, g.chapter, g.bookId)}
                className="flex items-center justify-between w-full h-[56px] px-4 rounded-xl bg-[#f8f9fa] border border-[#dce0e380]"
              >
                <div className="flex items-center gap-3">
                  <Highlighter size={18} className="text-[#1B1B1B]" strokeWidth={1.75} />
                  <span className="text-[15px] text-[#1B1B1B]">
                    {g.book} {g.chapter}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-[#818990] bg-white rounded px-2 py-0.5">
                    {g.count}
                  </span>
                  <ChevronRight size={18} className="text-[#818990]" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Auto Highlights section */}
        <div className="mt-8">
          <h2 className="text-center text-[15px] font-semibold text-[#1B1B1B] mb-3">
            Auto Highlights
          </h2>
          <p className="text-center text-[12px] text-[#818990]/80 leading-relaxed mb-4 px-2">
            Auto-generated highlights help identify key verses, promises,
            commands, and more throughout the Bible.
            <br />
            Toggle themes on or off to customize which highlights you see
          </p>

          {/* Master toggle card */}
          <div className="rounded-xl bg-[#f8f9fa] border border-[#dce0e380] px-4 py-3 mb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-gold font-medium">
                  Enable All Auto-Highlights
                </p>
                <p className="text-[12px] text-[#818990] mt-0.5">
                  Turn all Auto-generated highlights on or off
                </p>
              </div>
              <ThemeToggle value={allOn} onChange={toggleAllThemes} />
            </div>
          </div>

          {/* Per-theme toggle cards */}
          {themes.length === 0 ? (
            <p className="text-[12px] text-[#818990]/70 py-4 text-center">
              Loading themes…
            </p>
          ) : (
            <div className="space-y-3">
              {themes.map(t => {
                const isOn = enabledThemes.has(t.theme_id);
                return (
                  <div
                    key={t.theme_id}
                    className="rounded-xl bg-[#f8f9fa] border border-[#dce0e380] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span
                          className={`mt-1.5 w-3 h-3 rounded-full shrink-0 ${
                            colorDot[t.color] || 'bg-gray-400'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-[14px] text-[#1B1B1B] font-medium">{t.name}</p>
                          {t.description && (
                            <p className="text-[12px] text-[#818990] mt-0.5 leading-snug">
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
        value ? 'bg-gold' : 'bg-[#f8f9fa] border border-[#dce0e380]'
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
