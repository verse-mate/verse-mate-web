import { BibleVersion, Chapter, Bookmark, Note, Highlight, Commentary, VerseInsight, Topic, TopicEvent, MostQuotedVerse } from './types';
import { getChapter as getMockChapter, COMMENTARIES, VERSE_INSIGHTS, TOPICS, TOPIC_EVENTS, BIBLE_BOOKS, MOST_QUOTED } from './bibleData';

export async function fetchChapter(book: string, chapter: number, version: BibleVersion): Promise<Chapter> {
  await new Promise(r => setTimeout(r, 100));
  return getMockChapter(book, chapter, version);
}

export async function fetchBooks() {
  return BIBLE_BOOKS;
}

export async function fetchCommentary(book: string, chapter: number): Promise<Commentary[]> {
  await new Promise(r => setTimeout(r, 80));
  return COMMENTARIES[`${book}-${chapter}`] || [];
}

export async function fetchVerseInsights(book: string, chapter: number): Promise<VerseInsight[]> {
  await new Promise(r => setTimeout(r, 80));
  return VERSE_INSIGHTS[`${book}-${chapter}`] || [];
}

export async function fetchTopics(): Promise<Topic[]> {
  return TOPICS;
}

export async function fetchTopicEvents(topicId: string): Promise<TopicEvent[]> {
  return TOPIC_EVENTS.filter(e => e.topicId === topicId);
}

export async function fetchTopicEvent(topicId: string, eventId: string): Promise<TopicEvent | undefined> {
  return TOPIC_EVENTS.find(e => e.topicId === topicId && e.id === eventId);
}

// Fallback "top verses" shown when a specific event doesn't have curated MOST_QUOTED data.
const TOP_VERSES_FALLBACK: MostQuotedVerse[] = [
  { reference: 'John 3:16', book: 'John', chapter: 3, verse: 16, text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.', quoteCount: 5234 },
  { reference: 'Psalm 23:1', book: 'Psalms', chapter: 23, verse: 1, text: 'The LORD is my shepherd; I shall not want.', quoteCount: 4873 },
  { reference: 'Proverbs 3:5-6', book: 'Proverbs', chapter: 3, verse: 5, text: 'Trust in the LORD with all your heart, and do not lean on your own understanding.', quoteCount: 4567 },
  { reference: 'Philippians 4:13', book: 'Philippians', chapter: 4, verse: 13, text: 'I can do all things through him who strengthens me.', quoteCount: 4321 },
  { reference: 'Romans 8:28', book: 'Romans', chapter: 8, verse: 28, text: 'And we know that for those who love God all things work together for good.', quoteCount: 4102 },
  { reference: 'Ephesians 2:8-9', book: 'Ephesians', chapter: 2, verse: 8, text: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God.', quoteCount: 3456 },
];

export async function fetchMostQuoted(eventId: string): Promise<MostQuotedVerse[]> {
  const curated = MOST_QUOTED[eventId];
  if (curated && curated.length > 0) return curated;
  return TOP_VERSES_FALLBACK;
}

// Verses the app will auto-highlight when the user enables "Auto-highlights" in settings.
// Keyed by book-chapter; values are the verse numbers to highlight (in gold/yellow).
export const AUTO_HIGHLIGHTS: Record<string, number[]> = {
  'John-1': [1, 14],
  'John-3': [16],
  'Psalms-23': [1, 4],
  'Genesis-1': [1, 27],
  'Romans-8': [28, 38, 39],
  'Matthew-22': [37, 38, 39],
};

// LocalStorage persistence helpers
const STORAGE_KEYS = {
  bookmarks: 'versemate-bookmarks',
  notes: 'versemate-notes',
  highlights: 'versemate-highlights',
  settings: 'versemate-settings',
};

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadBookmarks(): Bookmark[] { return loadJSON(STORAGE_KEYS.bookmarks, []); }
export function saveBookmarks(b: Bookmark[]) { saveJSON(STORAGE_KEYS.bookmarks, b); }

export function loadNotes(): Note[] { return loadJSON(STORAGE_KEYS.notes, []); }
export function saveNotes(n: Note[]) { saveJSON(STORAGE_KEYS.notes, n); }

export function loadHighlights(): Highlight[] { return loadJSON(STORAGE_KEYS.highlights, []); }
export function saveHighlights(h: Highlight[]) { saveJSON(STORAGE_KEYS.highlights, h); }

export interface AppSettings {
  fontSize: number;
  lineSpacing: number; // CSS line-height multiplier 1.2-2.2
  theme: 'light' | 'dark' | 'system';
  defaultVersion: BibleVersion;
  notifications: boolean;
  showVerseNumbers: boolean;
  autoHighlights: boolean;
  readingPlan: 'none' | 'daily' | 'chronological' | 'one-year';
  language: 'en' | 'es' | 'fr' | 'pt';
  offlineMode: boolean;
  hapticFeedback: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 16,
  lineSpacing: 1.7,
  theme: 'dark',
  defaultVersion: 'ESV',
  notifications: true,
  showVerseNumbers: true,
  autoHighlights: true,
  readingPlan: 'none',
  language: 'en',
  offlineMode: false,
  hapticFeedback: true,
};

export function loadSettings(): AppSettings {
  const loaded = loadJSON<Partial<AppSettings>>(STORAGE_KEYS.settings, {});
  return { ...DEFAULT_SETTINGS, ...loaded };
}
export function saveSettings(s: AppSettings) { saveJSON(STORAGE_KEYS.settings, s); }
