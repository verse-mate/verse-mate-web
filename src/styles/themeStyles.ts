/**
 * Theme-aware inline-style helpers.
 *
 * Every screen / overlay in the app uses React inline styles with hardcoded
 * dark hex values (e.g. `background: '#000000'`, `color: '#E7E7E7'`). To
 * support the Settings → Theme dropdown (Auto / Light / Dark) without
 * rewriting every screen as Tailwind classes, those inline values were
 * mechanically swapped to the CSS variables exported from this module.
 *
 * The variables themselves are defined in `src/index.css` under `:root` (light)
 * and `.dark { ... }` (dark). The AppContext effect at
 * `src/contexts/AppContext.tsx` toggles the `dark` class on `<html>` based
 * on `state.settings.theme`, and `index.html` pre-applies it inline before
 * React mounts so there's no flash.
 *
 * Token semantics (light → dark):
 *
 *   --vm-page-bg               #FAF6EA → #000000   page / page container background
 *   --vm-chrome-bg             #FAF6EA → #1B1B1B   desktop centering backdrop
 *   --vm-surface-raised-bg     #FFFFFF → #323232   cards, pickers, modals
 *   --vm-surface-raised-border #EDE7D8 → #3a3a3a   borders on raised surfaces
 *   --vm-divider               #EDE7D8 → #323232   dividers / section borders
 *   --vm-text-primary          #1B1B1B → #E7E7E7   primary text
 *   --vm-text-secondary    rgba(27,27,27,0.62) → rgba(231,231,231,0.7)
 *   --vm-text-tertiary     rgba(27,27,27,0.50) → rgba(231,231,231,0.6)
 *   --vm-text-muted        rgba(27,27,27,0.42) → rgba(231,231,231,0.5)
 *   --vm-input-bg              #FFFFFF → #323232   input field background
 *   --vm-input-border          #E8E1CE → #3a3a3a   input field border
 *   --vm-row-selected-bg   rgba(27,27,27,0.05) → rgba(255,255,255,0.05)
 *   --vm-hover-bg              #F4EFE0 → rgba(255,255,255,0.05)
 *   --vm-status-error          #B91C1C → #dc2626   destructive / error text
 *   --vm-status-success        #15803D → #22c55e   saved / success text
 *
 * The brand gold (#B09A6D) is preserved across both themes — reference it
 * via `vmTokens.gold` rather than the inline hex so future tweaks stay in
 * one place.
 */

import type { CSSProperties } from 'react';

/** Raw CSS-var string accessors. Use inside `style={{...}}` props. */
export const vmTokens = {
  pageBg: 'var(--vm-page-bg)',
  chromeBg: 'var(--vm-chrome-bg)',
  surfaceRaisedBg: 'var(--vm-surface-raised-bg)',
  surfaceRaisedBorder: 'var(--vm-surface-raised-border)',
  divider: 'var(--vm-divider)',
  textPrimary: 'var(--vm-text-primary)',
  textSecondary: 'var(--vm-text-secondary)',
  textTertiary: 'var(--vm-text-tertiary)',
  textMuted: 'var(--vm-text-muted)',
  inputBg: 'var(--vm-input-bg)',
  inputBorder: 'var(--vm-input-border)',
  rowSelectedBg: 'var(--vm-row-selected-bg)',
  hoverBg: 'var(--vm-hover-bg)',
  statusError: 'var(--vm-status-error)',
  statusSuccess: 'var(--vm-status-success)',
  // Very faint horizontal/decorative divider used inside cards. Light:
  // rgba(27,27,27,0.08); Dark: rgba(255,255,255,0.1).
  faintDivider: 'var(--vm-faint-divider)',

  // Brand constants — identical in both themes per design spec
  gold: '#B09A6D',
  goldHover: 'rgba(176,154,109,0.5)', // gold-translucent hover ring/border
  goldOnLight: '#1B1B1B', // text on gold buttons
  headerBg: '#1B1B1B',
  headerFg: '#FFFFFF',
} as const;

// ─── Shared section / page layout primitives ─────────────────────────────

export const pageContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  background: vmTokens.pageBg,
  fontFamily: 'Roboto, sans-serif',
  color: vmTokens.textPrimary,
};

export const scrollContainerStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  paddingTop: 16,
  paddingBottom: 32,
};

export const sectionStyle: CSSProperties = {
  marginBottom: 24,
  paddingLeft: 16,
  paddingRight: 16,
};

export const sectionLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 400,
  color: vmTokens.textSecondary,
  marginBottom: 12,
  marginLeft: 4,
};

// ─── Select / picker controls (Bible Version, Language, Theme dropdowns) ─

export const selectButtonStyle: CSSProperties = {
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

export const selectButtonTextStyle: CSSProperties = {
  flex: 1,
  textAlign: 'left',
  fontSize: 16,
  fontWeight: 400,
  color: vmTokens.textPrimary,
};

export const pickerContainerStyle: CSSProperties = {
  marginTop: 8,
  background: vmTokens.surfaceRaisedBg,
  border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
  borderRadius: 12,
  maxHeight: 300,
  overflow: 'hidden',
};

export const pickerScrollStyle: CSSProperties = {
  maxHeight: 300,
  overflowY: 'auto',
};

export const pickerItemBaseStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderBottom: `1px solid ${vmTokens.surfaceRaisedBorder}`,
  background: 'transparent',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  fontFamily: 'Roboto, sans-serif',
};

// ─── Profile (header card + form fields) ─────────────────────────────────

export const profileHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  background: vmTokens.surfaceRaisedBg,
  borderRadius: 12,
  border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
  padding: 16,
  marginBottom: 16,
};

export const profileInfoStyle: CSSProperties = {
  flex: 1,
  marginLeft: 16,
};

export const profileNameStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 500,
  color: vmTokens.textPrimary,
  marginBottom: 2,
};

export const profileSubtextStyle: CSSProperties = {
  fontSize: 12,
  color: vmTokens.textSecondary,
};

export const profileErrorTextStyle: CSSProperties = {
  fontSize: 12,
  color: vmTokens.statusError,
};

export const inputLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: vmTokens.textSecondary,
  marginBottom: 6,
  fontWeight: 500,
};

export const textInputStyle: CSSProperties = {
  width: '100%',
  background: vmTokens.inputBg,
  border: `1px solid ${vmTokens.inputBorder}`,
  borderRadius: 8,
  padding: '12px 14px',
  color: vmTokens.textPrimary,
  fontSize: 16,
  fontFamily: 'Roboto, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
};

export const fieldGroupStyle: CSSProperties = {
  marginBottom: 12,
};

// ─── Generic outline / destructive button helpers ────────────────────────

export const goldOutlineButtonStyle: CSSProperties = {
  width: '100%',
  background: 'transparent',
  color: vmTokens.gold,
  border: `1px solid ${vmTokens.gold}`,
  borderRadius: 8,
  padding: '14px 20px',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Roboto, sans-serif',
};

export const destructiveOutlineButtonStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  background: 'transparent',
  color: vmTokens.statusError,
  border: `1px solid ${vmTokens.statusError}`,
  borderRadius: 8,
  padding: '12px 16px',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Roboto, sans-serif',
};

export const goldFillButtonStyle: CSSProperties = {
  background: vmTokens.gold,
  color: vmTokens.goldOnLight,
  border: 'none',
  borderRadius: 8,
  padding: '12px 32px',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
};

// ─── Picker-item text helpers (used for selected vs unselected rows) ─────

export function pickerItemTextStyle(isSelected: boolean): CSSProperties {
  return {
    flex: 1,
    fontSize: 16,
    color: isSelected ? vmTokens.gold : vmTokens.textPrimary,
    fontWeight: isSelected ? 500 : 400,
  };
}

// ─── Modal / overlay helpers ──────────────────────────────────────────────

/** Full-screen scrim for all dialog overlays. */
export const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 1000,
};

/** Card that the modal content sits in. */
export const modalCardStyle: CSSProperties = {
  background: vmTokens.surfaceRaisedBg,
  borderRadius: 12,
  padding: 20,
  width: '100%',
  maxWidth: 400,
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
};

/** Title text inside a modal. */
export const modalTitleStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: vmTokens.textPrimary,
  textAlign: 'center',
};

/** Subtitle / helper text inside a modal. */
export const modalSubtitleStyle: CSSProperties = {
  fontSize: 14,
  color: vmTokens.textSecondary,
  textAlign: 'center',
  marginBottom: 20,
};

/** Inset box that lists the data that will be deleted. */
export const modalDataListStyle: CSSProperties = {
  background: vmTokens.rowSelectedBg,
  borderRadius: 8,
  padding: 16,
  marginBottom: 20,
};

/** Title row inside the data-list box. */
export const modalDataListTitleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: vmTokens.textPrimary,
  marginBottom: 12,
};

/** Individual row item inside the data-list box. */
export const modalDataItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: 8,
};

/** Text alongside each data-list icon. */
export const modalDataItemTextStyle: CSSProperties = {
  fontSize: 14,
  color: vmTokens.textSecondary,
  marginLeft: 8,
};

/** Side-by-side button row at modal footer. */
export const modalButtonRowStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
};

/** Cancel button — neutral, non-destructive. */
export const modalCancelButtonStyle: CSSProperties = {
  flex: 1,
  background: vmTokens.rowSelectedBg,
  color: vmTokens.textPrimary,
  padding: '12px 20px',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
};

/** Primary destructive confirm button (red fill). */
export const modalDestructiveButtonStyle: CSSProperties = {
  flex: 1,
  background: vmTokens.statusError,
  color: '#ffffff',
  padding: '12px 20px',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
};

/** Warning callout box (red-tinted, left-border accent). */
export const modalWarningBoxStyle: CSSProperties = {
  background: 'rgba(220,38,38,0.08)',
  borderLeft: `4px solid ${vmTokens.statusError}`,
  padding: 16,
  borderRadius: 8,
  marginBottom: 24,
};

/** Bold title inside the warning callout. */
export const modalWarningTitleStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: vmTokens.statusError,
  marginBottom: 8,
};

/** Body text inside the warning callout. */
export const modalWarningTextStyle: CSSProperties = {
  fontSize: 14,
  color: vmTokens.textSecondary,
  lineHeight: '20px',
};

/** Inline error row (icon + message). */
export const modalErrorContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  background: 'rgba(220,38,38,0.08)',
  padding: '8px 12px',
  borderRadius: 6,
  marginBottom: 12,
};

/** Text inside the inline error row. */
export const modalErrorTextStyle: CSSProperties = {
  fontSize: 14,
  color: vmTokens.statusError,
  marginLeft: 6,
  flex: 1,
};
