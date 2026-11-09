import type { Language } from './config';

export interface Labels {
  locale: string;
  chapterTitle(name: string): string;
  chapterDescription(name: string): string;
  explainedTitle(name: string): string;
  pageDescription(name: string): string;
  work(name: string): string;
  summary: string;
  verseByVerse: string;
  explanation: string;
  passages: string;
  jesus: string;
  categories: Record<string, string>;
}

export const LABELS: Record<Language, Labels> = {
  'en-US': {
    locale: 'en_US',
    chapterTitle: (n) => `${n} explained: summary and verse by verse | VerseMate`,
    chapterDescription: (n) => `Read ${n} with VerseMate's summary and verse-by-verse explanation.`,
    explainedTitle: (n) => `${n} explained | VerseMate`,
    pageDescription: (n) => `Read ${n} in the Bible with VerseMate's explanation.`,
    work: (n) => `${n} explained`,
    summary: 'Summary',
    verseByVerse: 'Verse by verse',
    explanation: 'Explanation',
    passages: 'Passages',
    jesus: 'Life of Jesus',
    categories: { EVENT: 'Events', PROPHECY: 'Prophecies', PARABLE: 'Parables', THEME: 'Themes' },
  },
  'es-MX': {
    locale: 'es_MX',
    chapterTitle: (n) => `${n} explicado: resumen y versículo por versículo | VerseMate`,
    chapterDescription: (n) => `Lee ${n} con el resumen y la explicación versículo por versículo de VerseMate.`,
    explainedTitle: (n) => `${n} explicado | VerseMate`,
    pageDescription: (n) => `Lee ${n} en la Biblia con la explicación de VerseMate.`,
    work: (n) => `${n} explicado`,
    summary: 'Resumen',
    verseByVerse: 'Versículo por versículo',
    explanation: 'Explicación',
    passages: 'Pasajes',
    jesus: 'Vida de Jesús',
    categories: { EVENT: 'Eventos', PROPHECY: 'Profecías', PARABLE: 'Parábolas', THEME: 'Temas' },
  },
  'pt-BR': {
    locale: 'pt_BR',
    chapterTitle: (n) => `${n} explicado: resumo e versículo por versículo | VerseMate`,
    chapterDescription: (n) => `Leia ${n} com o resumo e a explicação versículo por versículo do VerseMate.`,
    explainedTitle: (n) => `${n} explicado | VerseMate`,
    pageDescription: (n) => `Leia ${n} na Bíblia com a explicação do VerseMate.`,
    work: (n) => `${n} explicado`,
    summary: 'Resumo',
    verseByVerse: 'Versículo por versículo',
    explanation: 'Explicação',
    passages: 'Passagens',
    jesus: 'Vida de Jesus',
    categories: { EVENT: 'Eventos', PROPHECY: 'Profecias', PARABLE: 'Parábolas', THEME: 'Temas' },
  },
  uk: {
    locale: 'uk_UA',
    chapterTitle: (n) => `${n} з поясненням: короткий зміст і вірш за віршем | VerseMate`,
    chapterDescription: (n) => `Читайте ${n} з коротким змістом і поясненням вірш за віршем від VerseMate.`,
    explainedTitle: (n) => `${n} з поясненням | VerseMate`,
    pageDescription: (n) => `Читайте ${n} у Біблії з поясненням від VerseMate.`,
    work: (n) => `${n} з поясненням`,
    summary: 'Короткий зміст',
    verseByVerse: 'Вірш за віршем',
    explanation: 'Пояснення',
    passages: 'Уривки',
    jesus: 'Життя Ісуса',
    categories: { EVENT: 'Події', PROPHECY: 'Пророцтва', PARABLE: 'Притчі', THEME: 'Теми' },
  },
  ru: {
    locale: 'ru_RU',
    chapterTitle: (n) => `${n} с объяснением: краткое содержание и стих за стихом | VerseMate`,
    chapterDescription: (n) => `Читайте ${n} с кратким содержанием и объяснением стих за стихом от VerseMate.`,
    explainedTitle: (n) => `${n} с объяснением | VerseMate`,
    pageDescription: (n) => `Читайте ${n} в Библии с объяснением от VerseMate.`,
    work: (n) => `${n} с объяснением`,
    summary: 'Краткое содержание',
    verseByVerse: 'Стих за стихом',
    explanation: 'Объяснение',
    passages: 'Отрывки',
    jesus: 'Жизнь Иисуса',
    categories: { EVENT: 'События', PROPHECY: 'Пророчества', PARABLE: 'Притчи', THEME: 'Темы' },
  },
  'ro-RO': {
    locale: 'ro_RO',
    chapterTitle: (n) => `${n} explicat: rezumat și verset cu verset | VerseMate`,
    chapterDescription: (n) => `Citește ${n} cu rezumatul și explicația verset cu verset de la VerseMate.`,
    explainedTitle: (n) => `${n} explicat | VerseMate`,
    pageDescription: (n) => `Citește ${n} în Biblie cu explicația de la VerseMate.`,
    work: (n) => `${n} explicat`,
    summary: 'Rezumat',
    verseByVerse: 'Verset cu verset',
    explanation: 'Explicație',
    passages: 'Pasaje',
    jesus: 'Viața lui Isus',
    categories: { EVENT: 'Evenimente', PROPHECY: 'Profeții', PARABLE: 'Pilde', THEME: 'Teme' },
  },
  de: {
    locale: 'de_DE',
    chapterTitle: (n) => `${n} erklärt: Zusammenfassung und Vers für Vers | VerseMate`,
    chapterDescription: (n) => `Lies ${n} mit der Zusammenfassung und der Vers-für-Vers-Erklärung von VerseMate.`,
    explainedTitle: (n) => `${n} erklärt | VerseMate`,
    pageDescription: (n) => `Lies ${n} in der Bibel mit der Erklärung von VerseMate.`,
    work: (n) => `${n} erklärt`,
    summary: 'Zusammenfassung',
    verseByVerse: 'Vers für Vers',
    explanation: 'Erklärung',
    passages: 'Bibelstellen',
    jesus: 'Das Leben Jesu',
    categories: { EVENT: 'Ereignisse', PROPHECY: 'Prophezeiungen', PARABLE: 'Gleichnisse', THEME: 'Themen' },
  },
  fr: {
    locale: 'fr_FR',
    chapterTitle: (n) => `${n} expliqué : résumé et verset par verset | VerseMate`,
    chapterDescription: (n) => `Lisez ${n} avec le résumé et l’explication verset par verset de VerseMate.`,
    explainedTitle: (n) => `${n} expliqué | VerseMate`,
    pageDescription: (n) => `Lisez ${n} dans la Bible avec l’explication de VerseMate.`,
    work: (n) => `${n} expliqué`,
    summary: 'Résumé',
    verseByVerse: 'Verset par verset',
    explanation: 'Explication',
    passages: 'Passages',
    jesus: 'La vie de Jésus',
    categories: { EVENT: 'Événements', PROPHECY: 'Prophéties', PARABLE: 'Paraboles', THEME: 'Thèmes' },
  },
};
