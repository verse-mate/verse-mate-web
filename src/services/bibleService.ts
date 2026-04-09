import { BibleVersion, Chapter, Bookmark, Note, Highlight, Commentary, VerseInsight, Topic, TopicEvent } from './types';
import { getChapter as getMockChapter, COMMENTARIES, VERSE_INSIGHTS, TOPICS, TOPIC_EVENTS, BIBLE_BOOKS } from './bibleData';

// Service layer — swap mock implementations for real API calls later

export async function fetchChapter(book: string, chapter: number, version: BibleVersion): Promise<Chapter> {
  // Simulate network delay
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
