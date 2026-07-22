/**
 * Design tokens for the Bible-Leader Coaching leader dashboard (Home /
 * Sessions / Trends).
 *
 * These screens follow a dedicated, high-fidelity handoff (see
 * design_handoff_coaching_dashboard) with a fixed warm-cream + Newsreader-serif
 * look — deliberately its own surface, distinct from the app's theme-aware
 * `vmTokens`. The palette is therefore hard-coded here (light only) so the
 * dashboard renders identically regardless of the app's Auto/Light/Dark
 * setting, exactly as the handoff specifies.
 *
 * Everything is wired to the real /coach API (see coachService); where the
 * mock in the handoff showed a /55 letter grade, we present the real /100
 * weighted composite + status label instead.
 */

/** Fixed design palette (handoff "Design Tokens"). */
export const dt = {
  // Backgrounds (shades of white)
  pageBg: '#ECECEA',
  cardBg: '#FFFFFF',
  cardBorder: '#E4E4E2',
  innerBg: '#FAFAF9',
  fill1: '#F2F2F0',
  fill2: '#F5F5F3',
  inputBg: '#FFFDF8',

  // Dark panels
  darkBg: '#211E18',
  darkText: '#F3ECDD',
  darkMuted: '#B7AD98',
  darkMuted2: '#8F856F',
  darkBorder: '#33302A',

  // Text
  textPrimary: '#211E18',
  textMuted: '#6B6455',
  textLight: '#8A8272',
  textLighter: '#9A9484',
  body: '#4C463B',
  body2: '#5A5344',

  // Borders / tracks
  border2: '#EAEAE8',
  rowDivider: '#EDEDEB',
  barTrack: '#E9E9E7',
  inputBorder: '#DADAD8',
  dashed: '#E4E4E2',

  // Accents
  gold: '#9A6E1F',
  gold2: '#8A6A22',
  goldChip: '#F4EAD4',
  goldChipBorder: '#E4D3A6',
  brightGold: '#C9A24B',
  goldHover: '#7D5915',

  green: '#3E7A54',
  greenBg: '#E8EFE6',
  rust: '#A94E2B',
  rustBg: '#F4E1D7',
  blue: '#3E6E9A',
  blueBg: '#E4ECF3',
  purple: '#8A5A9A',
  purpleBg: '#EFE4F3',

  shadow: '0 18px 48px -30px rgba(50,40,20,.4)',

  serif: "'Newsreader', Georgia, serif",
  sans: "'Public Sans', system-ui, sans-serif",
} as const;

export interface Band {
  label: string;
  c: string;
  bg: string;
}

/** Rating for a 1–5 dimension score (handoff `rating()`). */
export function ratingForScore(score: number | null): Band {
  if (score == null) return { label: 'N/A', c: dt.textLight, bg: dt.fill1 };
  if (score >= 5) return { label: 'STRONG', c: dt.green, bg: dt.greenBg };
  if (score >= 3) return { label: 'ON TARGET', c: dt.gold, bg: dt.goldChip };
  return { label: 'NEEDS WORK', c: dt.rust, bg: dt.rustBg };
}

/** Color styling for a session/month status label (Exceptional…Early Stage). */
export function statusBand(status: string): Band {
  switch (status) {
    case 'Exceptional':
      return { label: status, c: dt.green, bg: dt.greenBg };
    case 'Strong':
      return { label: status, c: dt.gold, bg: dt.goldChip };
    case 'On Target':
      return { label: status, c: dt.gold, bg: dt.goldChip };
    case 'Developing':
      return { label: status, c: dt.rust, bg: dt.rustBg };
    default:
      return { label: status || 'Early Stage', c: dt.rust, bg: dt.rustBg };
  }
}

/** Cluster short-code → display name + accent (handoff `clusterMeta`). */
export function clusterMeta(code: string): { name: string; c: string; bg: string } {
  const map: Record<string, { name: string; c: string; bg: string }> = {
    TC: { name: 'Teaching Craft', c: dt.gold, bg: dt.goldChip },
    BM: { name: 'Building Ministry', c: dt.blue, bg: dt.blueBg },
    EP: { name: 'Engaging People', c: dt.green, bg: dt.greenBg },
    BR: { name: 'Being Real', c: dt.purple, bg: dt.purpleBg },
  };
  return map[code] || { name: code, c: dt.textLight, bg: dt.fill1 };
}

/** Map a full cluster name → its short code (for the monthly per-session table). */
export function clusterCode(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('teaching')) return 'TC';
  if (n.includes('building') || n.includes('ministry')) return 'BM';
  if (n.includes('engaging')) return 'EP';
  if (n.includes('being') || n.includes('real')) return 'BR';
  return name;
}

/** First name from a full name (for the greeting). */
export function firstName(name: string): string {
  return (name || '').trim().split(/\s+/)[0] || name;
}

/** Conventional letter grade for a 0–100 composite — the design leads with a
 *  letter grade (the number stays visible alongside it). */
export function letterGrade(score: number): string {
  const s = Math.round(score);
  if (s >= 97) return 'A+';
  if (s >= 93) return 'A';
  if (s >= 90) return 'A-';
  if (s >= 87) return 'B+';
  if (s >= 83) return 'B';
  if (s >= 80) return 'B-';
  if (s >= 77) return 'C+';
  if (s >= 73) return 'C';
  if (s >= 70) return 'C-';
  if (s >= 67) return 'D+';
  if (s >= 63) return 'D';
  if (s >= 60) return 'D-';
  return 'F';
}
