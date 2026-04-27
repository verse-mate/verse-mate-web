/**
 * Shared dark-shell tokens for the audio surface. The verse-mate-web app
 * does NOT activate Tailwind's `.dark` theme, so ShadCN tokens render
 * against a light surface and clash with the #1B1B1B reader shell. Use
 * these inline-style values instead so the dock / chip / sheet stay
 * coherent with the gold-on-charcoal brand.
 */
export const COLORS = {
  bg: 'rgba(255,255,255,0.05)',
  bgHover: 'rgba(255,255,255,0.10)',
  bgActive: 'rgba(255,255,255,0.14)',
  surface: '#1B1B1B',
  surfaceElevated: '#242424',
  border: 'rgba(255,255,255,0.18)',
  borderStrong: 'rgba(255,255,255,0.28)',
  text: '#E7E7E7',
  textMuted: 'rgba(255,255,255,0.6)',
  accent: '#B09A6D',
  accentHover: '#C7AE7C',
  accentText: '#1B1B1B',
  danger: '#E5484D',
} as const;

export const FONT = "'Roboto', sans-serif";
