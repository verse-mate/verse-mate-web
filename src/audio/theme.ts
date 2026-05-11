/**
 * Audio surface tokens. Now theme-aware via the prototype's CSS variables
 * defined in src/styles/prototype.css (`:root` for light + `.dark { ... }`
 * override for dark). The chip / dock / sheet flip automatically when
 * Settings → Theme changes the `<html class="dark">` toggle.
 */
export const COLORS = {
  bg: 'var(--card-bg)',
  bgHover: 'var(--hover-bg)',
  bgActive: 'var(--hover-bg)',
  surface: 'var(--bg-menu)',
  surfaceElevated: 'var(--card-bg)',
  border: 'var(--card-border)',
  borderStrong: 'var(--divider-strong)',
  text: 'var(--fg-primary)',
  textMuted: 'var(--fg-secondary)',
  accent: 'var(--vm-dust)',
  accentHover: 'var(--vm-dust)',
  accentText: 'var(--fg-on-gold)',
  danger: 'var(--fg-destructive)',
} as const;

export const FONT = "'Roboto', sans-serif";
