import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { ChevronLeft, Sun, Moon, Type, BookOpen, Bell } from 'lucide-react';
import { BibleVersion } from '@/services/types';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { settings } = state;

  const updateSetting = (partial: Partial<typeof settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: partial });
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <button onClick={() => navigate('/menu')} className="p-2 -ml-2 rounded-full hover:bg-secondary">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Font size */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Type size={16} /> Font Size: {settings.fontSize}px
          </label>
          <input
            type="range"
            min={14}
            max={28}
            value={settings.fontSize}
            onChange={e => updateSetting({ fontSize: Number(e.target.value) })}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Small</span><span>Large</span>
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            {settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} Theme
          </label>
          <div className="flex gap-2">
            {(['light', 'dark'] as const).map(t => (
              <button
                key={t}
                onClick={() => updateSetting({ theme: t })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  settings.theme === t
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Default version */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <BookOpen size={16} /> Default Version
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['ESV', 'NIV', 'KJV', 'NLT'] as BibleVersion[]).map(v => (
              <button
                key={v}
                onClick={() => updateSetting({ defaultVersion: v })}
                className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  settings.defaultVersion === v
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Bell size={16} /> Notifications
          </label>
          <button
            onClick={() => updateSetting({ notifications: !settings.notifications })}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              settings.notifications ? 'bg-accent' : 'bg-muted'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-card shadow transition-transform ${
              settings.notifications ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
}
