import type React from 'react';
import { vmTokens } from '@/styles/themeStyles';

/**
 * Style constants and the tiny inline-markdown helper the inductive-study
 * renderer shares. Kept out of `StudyPrimitives` so that file exports only
 * components and fast refresh keeps working for it.
 */

// Minimal *italic* renderer used by the section intro `<p>` blocks. The
// intros are short, plain prose with the occasional emphasised word —
// pulling in the full MarkdownBlock would re-introduce the body color /
// size from `text-foreground` and undo `sectionIntroStyle`.
export function renderInlineItalic(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<em key={key++}>{m[1]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ─── Style constants ────────────────────────────────────────────────────


export const titleStyle: React.CSSProperties = {
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 700,
  fontSize: 20,
  lineHeight: '28px',
  color: vmTokens.textPrimary,
  margin: 0,
};

export const cardHeadingTitleStyle: React.CSSProperties = {
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 600,
  fontSize: 17,
  lineHeight: '24px',
  color: vmTokens.textPrimary,
};

// Shared style for the Observation / Interpretation / Application section
// intros — small, muted, italics-friendly. The body font setting on the
// panel root would otherwise scale these up to the user's reading size; the
// intros are meta-text describing the section, not the section's content,
// so they stay clamped to a smaller fixed size.
export const sectionIntroStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: '22px',
  color: vmTokens.textSecondary,
  margin: 0,
};

// Wrapper that vertically centers a tag/pill on the FIRST LINE of the
// adjacent text. `1lh` is the inherited line-height of the body — equal to
// the height of one text line — so a 22px pill centered in it lines up
// with the cap-center of the first line of multi-line content next to it.
// Parents using `alignItems: flex-start` align this wrapper to the top of
// the row; the inner flex centers the pill within that line.
export const firstLineAlignStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  height: '1lh',
  flexShrink: 0,
};

export const stepNumberStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: vmTokens.gold,
  color: vmTokens.goldOnLight,
  fontSize: 14,
  fontWeight: 700,
  flexShrink: 0,
};
