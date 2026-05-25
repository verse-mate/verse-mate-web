/**
 * Bible Versions
 *
 * Available Bible translations/versions for the app.
 * Ported from verse-mate-mobile to keep the Settings picker behavior identical
 * across platforms.
 */

export interface BibleVersion {
  key: string;
  value: string;
  language: string;
}

// Open-licensed translations (public domain or CC BY / BY-SA) sourced via
// scripts/bible-ingest from eBible.org. They appear in the picker, but text
// only loads once the backend has ingested them (the /bible/book API serves
// the verse text). The earlier copyright-only picks (ELBBK, FRC97, NR94,
// NRT23, RVA15, VDC2016, …) were dropped — they are not redistributable.
export const bibleVersions: BibleVersion[] = [
  {
    key: 'NASB1995',
    value: 'New American Standard Bible 1995 (NASB1995)',
    language: 'en',
  },
  { key: 'KJV', value: 'King James Version (KJV)', language: 'en' },
  { key: 'SCH51', value: 'Schlachter-Bibel 1951 (SCH51)', language: 'de' },
  { key: 'LSG', value: 'Louis Segond 1910 (LSG)', language: 'fr' },
  { key: 'TGLULB', value: 'Banal na Bibliya (TGLULB)', language: 'tl' },
  { key: 'HCV', value: 'हिंदी समकालीन संस्करण (HCV)', language: 'hi' },
  { key: 'BLIV', value: 'Bíblia Livre (BLIV)', language: 'pt' },
  { key: 'RIV', value: 'Riveduta 1927 (RIV)', language: 'it' },
  { key: 'SYN', value: 'Синодальный перевод (SYN)', language: 'ru' },
  { key: 'RVR09', value: 'Reina-Valera 1909 (RVR09)', language: 'es' },
  { key: 'VDC', value: 'Biblia Cornilescu 1924 (VDC)', language: 'ro' },
  // Ukrainian: no complete open Bible exists yet — public-domain NT only.
  { key: 'UKRKL', value: 'Переклад Куліша — Новий Завіт (UKRKL)', language: 'uk' },
];
