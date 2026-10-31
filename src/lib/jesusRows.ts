import type { CSSProperties } from 'react';
import { vmTokens } from '@/styles/themeStyles';

/**
 * Styles the Jesus lists share with the rest of the app. They live outside the
 * component files so those only export components, which keeps fast refresh
 * working.
 */

const FONT = 'Roboto, sans-serif';

/**
 * One row of a list of places to open — the shape the Topics list and the book
 * selector use: full width, no box, ruled off from the next row by the divider.
 */
export const jesusRowStyle: CSSProperties = {
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${vmTokens.divider}`,
  borderRadius: 0,
  textAlign: 'left',
  width: '100%',
  cursor: 'pointer',
  fontFamily: FONT,
};

/**
 * A quoted saying inside a row — the By Line verse quote: serif italic behind a
 * gold rule. Fixed size, because rows are chrome, not reading text.
 */
export const jesusQuoteStyle: CSSProperties = {
  margin: '8px 0 0',
  padding: '2px 0 2px 14px',
  borderLeft: `3px solid ${vmTokens.gold}`,
  fontFamily: "'Roboto Serif', Georgia, serif",
  fontSize: 15,
  lineHeight: '23px',
  fontStyle: 'italic',
  fontWeight: 300,
  color: vmTokens.textPrimary,
};

/** Small UPPERCASE gold label above a title — the Study tab's section label. */
export const jesusEyebrowStyle: CSSProperties = {
  fontFamily: FONT,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: vmTokens.gold,
};

/**
 * Capitalise a label's first letter. Facet titles come off the corpus as
 * sentence fragments ("born of water and Spirit"); as a row's title they read
 * as a typo unless they start with a capital like every other title.
 */
export function jesusHeadline(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
