import type { CSSProperties } from 'react';

import { dt } from './dashboardTheme';

export const h2: CSSProperties = {
  fontFamily: dt.serif,
  fontWeight: 500,
  fontSize: 30,
  margin: '14px 0 6px',
  letterSpacing: '-.01em',
};
export const h3: CSSProperties = { fontFamily: dt.serif, fontWeight: 500, fontSize: 21, margin: '0 0 12px' };
export const note: CSSProperties = {
  background: dt.innerBg,
  border: `1px dashed ${dt.dashed}`,
  borderRadius: 12,
  padding: 18,
  fontSize: 14,
  color: dt.textMuted,
  lineHeight: 1.6,
};
export const table: CSSProperties = { border: `1px solid ${dt.cardBorder}`, borderRadius: 12, overflow: 'hidden' };
export const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
  padding: '12px 16px',
  borderTop: `1px solid ${dt.rowDivider}`,
};
