import { useApp } from '@/contexts/AppContext';
import { BibleVersion } from '@/services/types';
import ScreenHeader from '@/components/ScreenHeader';

/**
 * SettingsScreen — full dark settings list.
 * Reference pattern from Mobile App section Menu + Options frames.
 */
export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const { settings } = state;

  const updateSetting = (partial: Partial<typeof settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: partial });
  };

  return (
    <div className="flex flex-col h-full bg-dark-surface text-dark-fg">
      <ScreenHeader title="Settings" />

      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-6">
        {/* Font size */}
        <section>
          <p className="text-[13px] text-dark-muted mb-2">Font size · {settings.fontSize}px</p>
          <input
            type="range"
            min={14}
            max={28}
            value={settings.fontSize}
            onChange={e => updateSetting({ fontSize: Number(e.target.value) })}
            className="w-full accent-[hsl(var(--accent))]"
          />
          <div className="flex justify-between text-[11px] text-dark-muted mt-1">
            <span>Small</span>
            <span>Large</span>
          </div>
        </section>

        {/* Theme */}
        <section>
          <p className="text-[13px] text-dark-muted mb-2">Theme</p>
          <div className="flex gap-2">
            {(['light', 'dark'] as const).map(t => (
              <button
                key={t}
                onClick={() => updateSetting({ theme: t })}
                className={`flex-1 h-12 rounded-xl text-[14px] font-medium transition-colors ${
                  settings.theme === t
                    ? 'bg-gold text-[#1A1A1A]'
                    : 'bg-dark-raised text-dark-fg border border-dark'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* Default version */}
        <section>
          <p className="text-[13px] text-dark-muted mb-2">Default version</p>
          <div className="grid grid-cols-4 gap-2">
            {(['ESV', 'NIV', 'KJV', 'NLT'] as BibleVersion[]).map(v => (
              <button
                key={v}
                onClick={() => updateSetting({ defaultVersion: v })}
                className={`h-12 rounded-xl text-[13px] font-medium transition-colors ${
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

        {/* Notifications toggle */}
        <section className="flex items-center justify-between pt-1">
          <p className="text-[14px] text-dark-fg">Notifications</p>
          <button
            onClick={() => updateSetting({ notifications: !settings.notifications })}
            role="switch"
            aria-checked={settings.notifications}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              settings.notifications ? 'bg-gold' : 'bg-dark-raised border border-dark'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-dark-fg shadow transition-transform ${
                settings.notifications ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </section>
      </div>
    </div>
  );
}
