import React from 'react';
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

  // Production settings styles
  // settingsRoot: padding 20px, font-family Inter
  // sectionLabel: font-weight 600, font-size 20px, color oil (#1B1B1B)
  // profileContainer / bibleVersionContainer / languageContainer: bg #f8f9fa, border geyser-opacity, border-radius 8px, padding 20px
  // dropdownLabel: font-weight 500, color oil, font-size 14px

  const sectionLabelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 16,
    fontWeight: 600,
    fontSize: 20,
    color: '#1B1B1B',
    fontFamily: 'Inter, sans-serif',
  };

  const containerBoxStyle: React.CSSProperties = {
    backgroundColor: '#f8f9fa',
    border: '1px solid rgba(220,224,227,0.5)',
    borderRadius: 8,
    padding: 20,
    maxWidth: 500,
    boxSizing: 'border-box',
  };

  const dropdownLabelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 8,
    fontWeight: 500,
    color: '#1B1B1B',
    fontSize: 14,
    lineHeight: '1.4',
  };

  return (
    <div className="flex flex-col h-full bg-white text-[#1B1B1B]">
      <ScreenHeader title="Settings" />

      {/* settingsRoot: padding 20px, font Inter */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, fontFamily: 'Inter, sans-serif' }}>

        {/* Bible Version section */}
        <section style={{ marginBottom: 40 }}>
          <span style={sectionLabelStyle}>Bible Version</span>
          {/* bibleVersionContainer */}
          <div style={containerBoxStyle}>
            <span style={dropdownLabelStyle}>Default version</span>
            {/* Dropdown-style grid of version buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {(['ESV', 'NIV', 'KJV', 'NLT'] as BibleVersion[]).map(v => (
                <button
                  key={v}
                  onClick={() => updateSetting({ defaultVersion: v })}
                  style={{
                    height: 44,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: settings.defaultVersion === v ? 'none' : '1px solid rgba(220,224,227,0.5)',
                    backgroundColor: settings.defaultVersion === v ? '#b09a6d' : '#fff',
                    color: settings.defaultVersion === v ? '#1A1A1A' : '#1B1B1B',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Language section */}
        <section style={{ marginBottom: 40 }}>
          <span style={sectionLabelStyle}>Language</span>
          {/* languageContainer */}
          <div style={containerBoxStyle}>
            <span style={dropdownLabelStyle}>Display language</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
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
                  style={{
                    height: 44,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: settings.language === l.id ? 'none' : '1px solid rgba(220,224,227,0.5)',
                    backgroundColor: settings.language === l.id ? '#b09a6d' : '#fff',
                    color: settings.language === l.id ? '#1A1A1A' : '#1B1B1B',
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Font size section */}
        <section style={{ marginBottom: 40 }}>
          <span style={sectionLabelStyle}>Display</span>
          <div style={containerBoxStyle}>
            <span style={dropdownLabelStyle}>Font size</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: '#1B1B1B' }}>Size</span>
              <span style={{ fontSize: 12, color: '#818990' }}>{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min={13}
              max={26}
              value={settings.fontSize}
              onChange={e => updateSetting({ fontSize: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#b09a6d' }}
            />
          </div>
        </section>

        <section style={{ marginTop: 8 }}>
          <p style={{ fontSize: 12, color: '#818990' }}>VerseMate · Version 1.0.0</p>
        </section>
      </div>
    </div>
  );
}
