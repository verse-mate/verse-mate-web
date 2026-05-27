import { useSyncExternalStore } from 'react';

// Written by SettingsScreen.handleLanguageChange for both guests and signed-in
// users (the signed-in path also reloads the page after persisting). So this
// localStorage read is the single source of truth and is current on mount.
const PREFERRED_LANGUAGE_KEY = '@versemate:preferred_language';

// Collapse a stored locale to its base ISO language code: "es-MX" → "es",
// "en-US" → "en". The /lemma endpoint keys translations on the bare code.
function toBaseIso(code: string | null | undefined): string {
  const base = (code || '').split('-')[0].trim().toLowerCase();
  return base || 'en';
}

function readPreferredLanguage(): string {
  try {
    return toBaseIso(localStorage.getItem(PREFERRED_LANGUAGE_KEY));
  } catch {
    return 'en';
  }
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  // Cross-tab changes fire `storage`. A same-tab change happens on the Settings
  // route, which unmounts the reader (and these popovers) — so a remount picks
  // up the new value without needing a same-tab event.
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

/**
 * The user's preferred UI / lemma-card language as a base ISO code (e.g. "es"),
 * defaulting to "en". Intentionally NOT the Bible-version locale — a user
 * reading Spanish scripture may still prefer Portuguese lemma cards.
 */
export function usePreferredLanguage(): string {
  return useSyncExternalStore(subscribe, readPreferredLanguage, () => 'en');
}
