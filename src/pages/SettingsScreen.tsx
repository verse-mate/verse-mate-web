import { useApp } from '@/contexts/AppContext';
import { BibleVersion } from '@/services/types';
import ScreenHeader from '@/components/ScreenHeader';
import { api } from '@/services/api';

/**
 * SettingsScreen — matches production surface: local font size + language
 * preference. Auto-highlight theme toggles live on the Highlights screen
 * (per the Figma mobile app section). Bible version is here for continuity.
 */
export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const { settings } = state;

  const updateSetting = (partial: Partial<typeof settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: partial });
  };

  const setLanguage = async (code: 'en' | 'es' | 'fr' | 'pt') => {
    updateSetting({ language: code });
    try {
      await api.patch('/user/preferences', { preferred_language: code });
    } catch {
      /* ignore when signed out */
    }
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

        {/* Default Bible version */}
        <section className="mt-6">
          <p className="text-[13px] text-dark-muted mb-2">Default version</p>
          <div className="grid grid-cols-4 gap-2">
            {(['ESV', 'NIV', 'KJV', 'NLT'] as BibleVersion[]).map(v => (
              <button
                key={v}
                onClick={() => updateSetting({ defaultVersion: v })}
                className={`h-11 rounded-xl text-[13px] font-medium transition-colors ${
                  settings.defaultVersion === v
                    ? 'bg-gold text-[#1A1A1A]'
                    : 'bg-dark-raised text-dark-fg border border-dark'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
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

        <section className="mt-8">
          <p className="text-[12px] text-dark-muted">VerseMate · Version 1.0.0</p>
        </section>
      </div>
    </div>
  );
}
