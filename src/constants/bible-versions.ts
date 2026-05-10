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

export const bibleVersions: BibleVersion[] = [
  {
    key: 'NASB1995',
    value: 'New American Standard Bible 1995 (NASB1995)',
    language: 'en',
  },
  // Additional versions can be added here when available
  // { key: "CUV23", value: "БІБЛІЯ Сучасний переклад (CUV23)", language: "uk" },
  // { key: "ELBBK", value: "Elberfelder Übersetzung (ELBBK)", language: "de" },
  // { key: "FRC97", value: "La Bible en français courant (FRC97)", language: "fr" },
  // { key: "LTT18", value: "Bíblia de Estudo LTT 2018 (LTT18)", language: "pt" },
  // { key: "NR94", value: "Nuova Riveduta 1994 (NR94)", language: "it" },
  // { key: "NRT23", value: "Новый русский перевод (НРП), 2023 (NRT23)", language: "ru" },
  // { key: "RVA15", value: "Reina Valera Actualizada, 2015 (RVA15)", language: "es" },
  // { key: "VDC2016", value: "Biblia sau Sfânta Scriptură cu Trimiteri (VDC2016)", language: "ro" },
];
