/**
 * Font Size Selector — web port of verse-mate-mobile/components/settings/FontSizeSelector.tsx.
 *
 * Section header + dark elevated card with a label / px-value row, a
 * minus/plus pair flanking a draggable/clickable range slider, and a
 * Small/Large range row. Reads/writes settings.fontSize via AppContext
 * (range 13–26).
 */

import { Minus, Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { vmTokens } from '@/styles/themeStyles';

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
  color: vmTokens.textPrimary,
  marginBottom: 16,
  fontFamily: 'Roboto, sans-serif',
};

const containerStyle: React.CSSProperties = {
  backgroundColor: vmTokens.surfaceRaisedBg,
  border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
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
  color: vmTokens.textPrimary,
};

const valueTextStyle: React.CSSProperties = {
  fontSize: 12,
  color: vmTokens.textTertiary,
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
  background: vmTokens.surfaceRaisedBorder,
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

const rangeLabelsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 8,
};

const rangeTextStyle: React.CSSProperties = {
  fontSize: 11,
  color: vmTokens.textMuted,
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
            <Minus size={20} color={atMin ? vmTokens.textMuted : vmTokens.textPrimary} />
          </button>

          <div style={trackContainerStyle}>
            <input
              type="range"
              min={MIN_FONT_SIZE}
              max={MAX_FONT_SIZE}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              aria-label="Font size"
              data-testid="font-size-slider"
              className="vm-font-size-slider"
              style={{
                ['--vm-progress' as string]: `${progress}%`,
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setFontSize(fontSize + 1)}
            disabled={atMax}
            aria-label="Increase font size"
            data-testid="font-size-increase"
            style={{ ...baseButtonStyle, opacity: atMax ? 0.4 : 1, cursor: atMax ? 'default' : 'pointer' }}
          >
            <Plus size={20} color={atMax ? vmTokens.textMuted : vmTokens.textPrimary} />
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
