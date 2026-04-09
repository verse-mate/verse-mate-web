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

export async function fetchMostQuoted(eventId: string): Promise<MostQuotedVerse[]> {
  return MOST_QUOTED[eventId] || [];
}

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
  theme: 'light' | 'dark' | 'system';
  defaultVersion: BibleVersion;
  notifications: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 18,
  theme: 'light',
  defaultVersion: 'ESV',
  notifications: true,
};

export function loadSettings(): AppSettings { return loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS); }
export function saveSettings(s: AppSettings) { saveJSON(STORAGE_KEYS.settings, s); }
