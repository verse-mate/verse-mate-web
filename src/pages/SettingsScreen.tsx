import { useApp } from '@/contexts/AppContext';
import { BibleVersion } from '@/services/types';
import ScreenHeader from '@/components/ScreenHeader';
import { ReactNode } from 'react';

/**
 * SettingsScreen — full-featured dark settings page matching the breadth
 * expected by the Mobile App design. Sections: Reading, Display,
 * Notifications, Content, Account.
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

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <Section title="Reading">
          <Row
            label="Font size"
            hint={`${settings.fontSize}px`}
            control={
              <input
                type="range"
                min={13}
                max={26}
                value={settings.fontSize}
                onChange={e => updateSetting({ fontSize: Number(e.target.value) })}
                className="w-full accent-[hsl(var(--accent))]"
              />
            }
          />
          <Row
            label="Line spacing"
            hint={`${settings.lineSpacing.toFixed(1)}×`}
            control={
              <input
                type="range"
                min={1.2}
                max={2.2}
                step={0.1}
                value={settings.lineSpacing}
                onChange={e => updateSetting({ lineSpacing: Number(e.target.value) })}
                className="w-full accent-[hsl(var(--accent))]"
              />
            }
          />
          <ToggleRow
            label="Show verse numbers"
            hint="Display the verse number before each verse"
            value={settings.showVerseNumbers}
            onChange={v => updateSetting({ showVerseNumbers: v })}
          />
          <ToggleRow
            label="Auto-highlights"
            hint="Highlight famous verses automatically (e.g. John 3:16, Psalm 23)"
            value={settings.autoHighlights}
            onChange={v => updateSetting({ autoHighlights: v })}
          />
        </Section>

        <Section title="Default Version">
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
        </Section>

        <Section title="Display">
          <div>
            <p className="text-[13px] text-dark-muted mb-2">Theme</p>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => updateSetting({ theme: t })}
                  className={`flex-1 h-11 rounded-xl text-[13px] font-medium transition-colors ${
                    settings.theme === t
                      ? 'bg-gold text-[#1A1A1A]'
                      : 'bg-dark-raised text-dark-fg border border-dark'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[13px] text-dark-muted mb-2">Language</p>
            <div className="grid grid-cols-4 gap-2">
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
                  onClick={() => updateSetting({ language: l.id })}
                  className={`h-11 rounded-xl text-[12px] font-medium transition-colors ${
                    settings.language === l.id
                      ? 'bg-gold text-[#1A1A1A]'
                      : 'bg-dark-raised text-dark-fg border border-dark'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Content & Study">
          <div>
            <p className="text-[13px] text-dark-muted mb-2">Reading plan</p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'none', label: 'None' },
                  { id: 'daily', label: 'Daily verse' },
                  { id: 'chronological', label: 'Chronological' },
                  { id: 'one-year', label: 'One-year plan' },
                ] as const
              ).map(p => (
                <button
                  key={p.id}
                  onClick={() => updateSetting({ readingPlan: p.id })}
                  className={`h-11 rounded-xl text-[13px] font-medium transition-colors ${
                    settings.readingPlan === p.id
                      ? 'bg-gold text-[#1A1A1A]'
                      : 'bg-dark-raised text-dark-fg border border-dark'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <ToggleRow
            label="Download for offline"
            hint="Cache the current version for reading without a connection"
            value={settings.offlineMode}
            onChange={v => updateSetting({ offlineMode: v })}
          />
        </Section>

        <Section title="Notifications & Feedback">
          <ToggleRow
            label="Push notifications"
            hint="Daily verse, study reminders, and updates"
            value={settings.notifications}
            onChange={v => updateSetting({ notifications: v })}
          />
          <ToggleRow
            label="Haptic feedback"
            hint="Vibrate on long-press and key actions"
            value={settings.hapticFeedback}
            onChange={v => updateSetting({ hapticFeedback: v })}
          />
        </Section>

        <Section title="About">
          <p className="text-[13px] text-dark-muted">VerseMate · Version 1.0.0</p>
          <p className="text-[12px] text-dark-muted/70 mt-1">
            © 2026 VerseMate. All Scripture references © their respective publishers.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="text-[12px] uppercase tracking-wider text-dark-muted mb-3">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({
  label,
  hint,
  control,
}: {
  label: string;
  hint?: string;
  control: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[14px] text-dark-fg">{label}</span>
        {hint && <span className="text-[12px] text-dark-muted">{hint}</span>}
      </div>
      {control}
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] text-dark-fg">{label}</p>
        {hint && <p className="text-[12px] text-dark-muted mt-0.5">{hint}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
          value ? 'bg-gold' : 'bg-dark-raised border border-dark'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow transition-transform ${
            value ? 'translate-x-5 bg-[#1A1A1A]' : 'translate-x-0 bg-dark-fg'
          }`}
        />
      </button>
    </div>
  );
}
