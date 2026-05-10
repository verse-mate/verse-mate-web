/**
 * Font Size Selector — web port of verse-mate-mobile/components/settings/FontSizeSelector.tsx.
 *
 * Section header + dark elevated card with a label / px-value row, a
 * minus/plus pair flanking a fill-track, and a Small/Large range row.
 * Reads/writes settings.fontSize via AppContext (range 13–26).
 */

import { Minus, Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const MIN_FONT_SIZE = 13;
const MAX_FONT_SIZE = 26;

const sectionStyle: React.CSSProperties = {
  paddingLeft: 16,
  paddingRight: 16,
  marginBottom: 32,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  color: '#E7E7E7',
  marginBottom: 16,
  fontFamily: 'Roboto, sans-serif',
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#323232',
  border: '1px solid #3a3a3a',
  borderRadius: 8,
  padding: 20,
};

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: '#E7E7E7',
};

const valueTextStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'rgba(255,255,255,0.6)',
};

const controlRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const baseButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 18,
  background: '#3a3a3a',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
};

const trackContainerStyle: React.CSSProperties = {
  flex: 1,
  height: 36,
  display: 'flex',
  alignItems: 'center',
};

const trackStyle: React.CSSProperties = {
  width: '100%',
  height: 6,
  background: '#1B1B1B',
  borderRadius: 3,
  overflow: 'hidden',
};

const rangeLabelsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 8,
};

const rangeTextStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'rgba(231,231,231,0.5)',
};

export function FontSizeSelector() {
  const { state, dispatch } = useApp();
  const fontSize = state.settings.fontSize;

  const setFontSize = (next: number) => {
    if (next >= MIN_FONT_SIZE && next <= MAX_FONT_SIZE) {
      dispatch({ type: 'UPDATE_SETTINGS', settings: { fontSize: next } });
    }
  };

  const progress = ((fontSize - MIN_FONT_SIZE) / (MAX_FONT_SIZE - MIN_FONT_SIZE)) * 100;
  const atMin = fontSize <= MIN_FONT_SIZE;
  const atMax = fontSize >= MAX_FONT_SIZE;

  return (
    <section style={sectionStyle}>
      <h3 style={sectionTitleStyle}>Display</h3>
      <div style={containerStyle}>
        <div style={headerRowStyle}>
          <span style={labelStyle}>Font size</span>
          <span style={valueTextStyle}>{fontSize}px</span>
        </div>

        <div style={controlRowStyle}>
          <button
            type="button"
            onClick={() => setFontSize(fontSize - 1)}
            disabled={atMin}
            aria-label="Decrease font size"
            data-testid="font-size-decrease"
            style={{ ...baseButtonStyle, opacity: atMin ? 0.4 : 1, cursor: atMin ? 'default' : 'pointer' }}
          >
            <Minus size={20} color={atMin ? 'rgba(231,231,231,0.4)' : '#E7E7E7'} />
          </button>

          <div style={trackContainerStyle}>
            <div style={trackStyle}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: '#B09A6D',
                  borderRadius: 3,
                  transition: 'width 0.15s ease',
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFontSize(fontSize + 1)}
            disabled={atMax}
            aria-label="Increase font size"
            data-testid="font-size-increase"
            style={{ ...baseButtonStyle, opacity: atMax ? 0.4 : 1, cursor: atMax ? 'default' : 'pointer' }}
          >
            <Plus size={20} color={atMax ? 'rgba(231,231,231,0.4)' : '#E7E7E7'} />
          </button>
        </div>

        <div style={rangeLabelsStyle}>
          <span style={rangeTextStyle}>Small</span>
          <span style={rangeTextStyle}>Large</span>
        </div>
      </div>
    </section>
  );
}
