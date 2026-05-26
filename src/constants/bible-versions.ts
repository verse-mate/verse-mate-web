/**
 * Bible Versions
 *
 * Static catalog of the Bible translations the app can request. The live
 * source of truth is the backend's `GET /bible/versions` discovery endpoint;
 * this array is the offline fallback used when that call hasn't resolved or
 * fails, and it also carries the canonical license/attribution strings (copied
 * from scripts/bible-ingest/build.py) so the Credits screen can show the right
 * obligation line even before the prod ingest populates `attribution`.
 */

export type TestamentCoverage = 'full' | 'nt' | 'ot';

export interface BibleVersionInfo {
  /** Canonical version key — identical in build.py and the backend. */
  key: string;
  /** Display label, e.g. "Louis Segond 1910 (LSG)". */
  value: string;
  /** ISO language code: en, de, fr, … */
  languageCode: string;
  license?: string;
  licenseUrl?: string | null;
  /** Required credit line for CC BY / CC BY-SA versions. */
  attribution?: string | null;
  /** "full" | "nt" | "ot" — drives the NT-only marker in the picker. */
  testamentCoverage?: TestamentCoverage;
}

// Open-licensed translations (public domain or CC BY / BY-SA) sourced via
// scripts/bible-ingest from eBible.org. They appear in the picker, but text
// only loads once the backend has ingested them (the /bible/book API serves
// the verse text). The earlier copyright-only picks (ELBBK, FRC97, NR94,
// NRT23, RVA15, VDC2016, …) were dropped — they are not redistributable.
export const bibleVersions: BibleVersionInfo[] = [
  {
    key: 'NASB1995',
    value: 'New American Standard Bible 1995 (NASB1995)',
    languageCode: 'en',
    license: 'Licensed',
    licenseUrl: null,
    attribution: null,
    testamentCoverage: 'full',
  },
  {
    key: 'KJV',
    value: 'King James Version (KJV)',
    languageCode: 'en',
    license: 'Public Domain',
    licenseUrl: null,
    attribution: null,
    testamentCoverage: 'full',
  },
  {
    key: 'SCH51',
    value: 'Schlachter-Bibel 1951 (SCH51)',
    languageCode: 'de',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    attribution: 'Schlachter-Bibel 1951 © Genfer Bibelgesellschaft. CC BY 4.0.',
    testamentCoverage: 'full',
  },
  {
    key: 'LSG',
    value: 'Louis Segond 1910 (LSG)',
    languageCode: 'fr',
    license: 'Public Domain',
    licenseUrl: null,
    attribution: null,
    testamentCoverage: 'full',
  },
  {
    key: 'TGLULB',
    value: 'Banal na Bibliya (TGLULB)',
    languageCode: 'tl',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    attribution: 'Banal na Bibliya © 2018 Door43 World Missions Community. CC BY-SA 4.0.',
    testamentCoverage: 'full',
  },
  {
    key: 'HCV',
    value: 'हिंदी समकालीन संस्करण (HCV)',
    languageCode: 'hi',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    attribution: 'Hindi Contemporary Version © Biblica, Inc. CC BY-SA 4.0.',
    testamentCoverage: 'full',
  },
  {
    key: 'BLIV',
    value: 'Bíblia Livre (BLIV)',
    languageCode: 'pt',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/br/',
    attribution: 'Bíblia Livre © 2018 Diego Santos, Mario Sérgio, Marco Teles. CC BY 3.0 BR.',
    testamentCoverage: 'full',
  },
  {
    key: 'RIV',
    value: 'Riveduta 1927 (RIV)',
    languageCode: 'it',
    license: 'Public Domain',
    licenseUrl: null,
    attribution: null,
    testamentCoverage: 'full',
  },
  {
    key: 'SYN',
    value: 'Синодальный перевод (SYN)',
    languageCode: 'ru',
    license: 'Public Domain',
    licenseUrl: null,
    attribution: null,
    testamentCoverage: 'full',
  },
  {
    key: 'RVR09',
    value: 'Reina-Valera 1909 (RVR09)',
    languageCode: 'es',
    license: 'Public Domain',
    licenseUrl: null,
    attribution: null,
    testamentCoverage: 'full',
  },
  {
    key: 'VDC',
    value: 'Biblia Cornilescu 1924 (VDC)',
    languageCode: 'ro',
    license: 'Public Domain',
    licenseUrl: null,
    attribution: null,
    testamentCoverage: 'full',
  },
  // Ukrainian: no complete open Bible exists yet — public-domain NT only.
  {
    key: 'UKRKL',
    value: 'Переклад Куліша — Новий Завіт (UKRKL)',
    languageCode: 'uk',
    license: 'Public Domain',
    licenseUrl: null,
    attribution: null,
    testamentCoverage: 'nt',
  },
];

// Native-language labels for the picker's group headers. Falls back to
// Intl.DisplayNames (then the raw code) for anything not listed here so a
// version in a new language still gets a sensible heading.
const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  tl: 'Tagalog',
  hi: 'हिन्दी',
  pt: 'Português',
  it: 'Italiano',
  ru: 'Русский',
  es: 'Español',
  ro: 'Română',
  uk: 'Українська',
};

export function languageLabel(code: string): string {
  if (LANGUAGE_LABELS[code]) return LANGUAGE_LABELS[code];
  try {
    const dn = new Intl.DisplayNames([code], { type: 'language' });
    return dn.of(code) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}
