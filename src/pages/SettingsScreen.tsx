import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
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
 * SettingsScreen — matches the production VerseMate settings surface.
 * The real API (api.versemate.org) only exposes:
 *   - PATCH /user/preferences  { preferred_language }
 *   - GET  /bible/highlight-themes
 *   - GET  /bible/user/theme-preferences
 *   - PATCH /bible/user/theme-preferences/{theme_id}
 * We surface exactly those — language + per-theme auto-highlight toggles —
 * plus a local font size slider for reading comfort.
 */
export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const { settings } = state;

  const [themes, setThemes] = useState<HighlightTheme[]>([]);
  const [enabledThemes, setEnabledThemes] = useState<Set<number>>(new Set());

  useEffect(() => {
    api
      .get<{ data: HighlightTheme[] }>('/bible/highlight-themes', undefined, { auth: false })
      .then(r => setThemes(r?.data || []))
      .catch(() => setThemes([]));

    api
      .get<{ data: Array<{ theme_id: number; is_enabled: boolean }> }>('/bible/user/theme-preferences')
      .then(r => {
        const active = new Set<number>();
        for (const p of r?.data || []) {
          if (p.is_enabled) active.add(p.theme_id);
        }
        setEnabledThemes(active);
      })
      .catch(() => undefined);
  }, []);

  const updateSetting = (partial: Partial<typeof settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: partial });
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
      /* revert on failure */
      const reverted = new Set(enabledThemes);
      setEnabledThemes(reverted);
    }
  };

  const setLanguage = async (code: 'en' | 'es' | 'fr' | 'pt') => {
    updateSetting({ language: code });
    try {
      await api.patch('/user/preferences', { preferred_language: code });
    } catch {
      /* ignore if signed out */
    }
  };

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
    <div className="flex flex-col h-full bg-dark-surface text-dark-fg">
      <ScreenHeader title="Settings" />

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {/* Font size */}
        <section className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[14px] text-dark-fg">Font size</span>
            <span className="text-[12px] text-dark-muted">{settings.fontSize}px</span>
          </div>
          <input
            type="range"
            min={13}
            max={26}
            value={settings.fontSize}
            onChange={e => updateSetting({ fontSize: Number(e.target.value) })}
            className="w-full accent-[hsl(var(--accent))]"
          />
        </section>

        {/* Language */}
        <section className="mt-6">
          <p className="text-[13px] text-dark-muted mb-2">Language</p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'en', label: 'English' },
                { id: 'es', label: 'Español' },
                { id: 'fr', label: 'Français' },
                { id: 'pt', label: 'Português' },
              ] as const
            ).map(l => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={`h-11 rounded-xl text-[13px] font-medium transition-colors ${
                  settings.language === l.id
                    ? 'bg-gold text-[#1A1A1A]'
                    : 'bg-dark-raised text-dark-fg border border-dark'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>

        {/* Auto-highlight themes */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] text-dark-muted">Auto-highlight themes</p>
            <span className="text-[11px] text-dark-muted/70">
              {enabledThemes.size} of {themes.length}
            </span>
          </div>
          {themes.length === 0 ? (
            <p className="text-[12px] text-dark-muted/70">Loading themes…</p>
          ) : (
            <div className="space-y-1">
              {themes.map(t => {
                const isOn = enabledThemes.has(t.theme_id);
                return (
                  <button
                    key={t.theme_id}
                    onClick={() => toggleTheme(t.theme_id)}
                    className="flex items-start justify-between gap-3 w-full py-3 text-left"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span
                        className={`mt-1 w-3 h-3 rounded-full shrink-0 ${
                          colorDot[t.color] || 'bg-gray-400'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-[14px] text-dark-fg">{t.name}</p>
                        {t.description && (
                          <p className="text-[12px] text-dark-muted mt-0.5 line-clamp-2">
                            {t.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      role="switch"
                      aria-checked={isOn}
                      className={`relative w-11 h-6 rounded-full shrink-0 mt-1 transition-colors ${
                        isOn ? 'bg-gold' : 'bg-dark-raised border border-dark'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform ${
                          isOn ? 'translate-x-5 bg-[#1A1A1A]' : 'translate-x-0 bg-dark-fg'
                        }`}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* About */}
        <section className="mt-8">
          <p className="text-[12px] text-dark-muted">VerseMate · Version 1.0.0</p>
        </section>
      </div>
    </div>
  );
}
