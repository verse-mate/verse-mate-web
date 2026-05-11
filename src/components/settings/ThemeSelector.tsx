/**
 * Theme Selector — web port of verse-mate-mobile/components/settings/ThemeSelector.tsx.
 *
 * Dropdown with Auto/Light/Dark options, gold-checkmark on the selected
 * row, two-line label + description. Writes settings.theme via AppContext.
 */

import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { AppSettings } from '@/services/bibleService';
import { vmTokens } from '@/styles/themeStyles';

type ThemePreference = AppSettings['theme'];

interface ThemeOption {
  value: ThemePreference;
  label: string;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    value: 'system',
    label: 'Auto (Follow System)',
    description: 'Matches your device settings',
  },
  {
    value: 'light',
    label: 'Light',
    description: 'Always use light theme',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Always use dark theme',
  },
];

const containerStyle: React.CSSProperties = {
  marginBottom: 24,
  paddingLeft: 16,
  paddingRight: 16,
};

const sectionLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 400,
  color: vmTokens.textSecondary,
  marginBottom: 12,
  marginLeft: 4,
};

const selectButtonStyle: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: 12,
  paddingBottom: 12,
  paddingLeft: 16,
  paddingRight: 16,
  background: vmTokens.surfaceRaisedBg,
  border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
  borderRadius: 12,
  height: 48,
  cursor: 'pointer',
  color: vmTokens.textPrimary,
  fontFamily: 'Roboto, sans-serif',
};

const selectButtonTextStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 400,
  color: vmTokens.textPrimary,
};

const pickerContainerStyle: React.CSSProperties = {
  marginTop: 8,
  background: vmTokens.surfaceRaisedBg,
  border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
  borderRadius: 12,
  overflow: 'hidden',
};

const pickerItemBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderBottom: `1px solid ${vmTokens.surfaceRaisedBorder}`,
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  width: '100%',
  textAlign: 'left',
};

export function ThemeSelector() {
  const { state, dispatch } = useApp();
  const [showPicker, setShowPicker] = useState(false);
  const preference = state.settings.theme;

  const handleThemeChange = (newPreference: ThemePreference) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { theme: newPreference } });
    setShowPicker(false);
  };

  const selectedOption =
    themeOptions.find((option) => option.value === preference) || themeOptions[0];

  return (
    <section style={containerStyle}>
      <span style={sectionLabelStyle}>Theme</span>
      <button
        type="button"
        style={selectButtonStyle}
        onClick={() => setShowPicker((s) => !s)}
        aria-label="Select theme preference"
        aria-expanded={showPicker}
        data-testid="theme-selector-button"
      >
        <span style={selectButtonTextStyle}>{selectedOption.label}</span>
        {showPicker ? (
          <ChevronUp size={20} color={vmTokens.textSecondary} />
        ) : (
          <ChevronDown size={20} color={vmTokens.textSecondary} />
        )}
      </button>

      {showPicker && (
        <div style={pickerContainerStyle}>
          {themeOptions.map((option, idx) => {
            const isSelected = option.value === preference;
            const isLast = idx === themeOptions.length - 1;
            return (
              <button
                type="button"
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                role="radio"
                aria-checked={isSelected}
                aria-label={`${option.label} theme`}
                data-testid={`theme-option-${option.value}`}
                style={{
                  ...pickerItemBaseStyle,
                  borderBottom: isLast ? 'none' : `1px solid ${vmTokens.surfaceRaisedBorder}`,
                  background: isSelected ? vmTokens.rowSelectedBg : 'transparent',
                }}
              >
                <div style={{ flex: 1, marginRight: 16 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: isSelected ? 500 : 400,
                      color: isSelected ? vmTokens.gold : vmTokens.textPrimary,
                      marginBottom: 2,
                    }}
                  >
                    {option.label}
                  </div>
                  <div style={{ fontSize: 12, color: vmTokens.textTertiary }}>
                    {option.description}
                  </div>
                </div>
                {isSelected && <Check size={20} color={vmTokens.gold} />}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
