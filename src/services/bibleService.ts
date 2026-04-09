import {
  BibleVersion,
  Chapter,
  BibleBook,
  Bookmark,
  Note,
  Highlight,
  HighlightColor,
  Commentary,
  VerseInsight,
  Topic,
  TopicEvent,
  MostQuotedVerse,
  ExplanationType,
} from './types';
import { api, clearTokens, setAccessToken, setRefreshToken, getAccessToken, ApiError, API_BASE_URL } from './api';

// ─── Helper: book id <-> name cache ───────────────────────────────────────
let _booksCache: BibleBook[] | null = null;
let _booksPromise: Promise<BibleBook[]> | null = null;

/**
 * Fetch the 66-book list, cached. Concurrent callers share one in-flight
 * request. Books are sorted by canonical bookId (1=Genesis … 66=Revelation).
 */
export async function fetchBooks(): Promise<BibleBook[]> {
  if (_booksCache) return _booksCache;
  if (_booksPromise) return _booksPromise;
  _booksPromise = (async () => {
    try {
      const data = await api.get<{ books: any[] }>('/bible/books', undefined, { auth: false });
      const mapped: BibleBook[] = (data.books || [])
        .map(b => ({
          bookId: b.bookId,
          name: b.name,
          shortName: shortenBookName(b.name),
          testament: b.testament as 'OT' | 'NT',
          chapters: Array.isArray(b.chapters) ? b.chapters.length : 0,
        }))
        .sort((a, b) => a.bookId - b.bookId);
      _booksCache = mapped;
      return mapped;
    } catch {
      return [];
    } finally {
      _booksPromise = null;
    }
  })();
  return _booksPromise;
}

function shortenBookName(name: string): string {
  // "1 Samuel" -> "1Sa", "Song of Solomon" -> "Sng", "Genesis" -> "Gen"
  const parts = name.split(' ');
  if (/^\d/.test(parts[0])) {
    return parts[0] + (parts[1] || '').slice(0, 2);
  }
  return name.replace(/\s+/g, '').slice(0, 3);
}

export async function resolveBookId(bookName: string): Promise<number | null> {
  const books = await fetchBooks();
  const b = books.find(x => x.name.toLowerCase() === bookName.toLowerCase());
  return b ? b.bookId : null;
}

export async function resolveBookName(bookId: number): Promise<string | null> {
  const books = await fetchBooks();
  const b = books.find(x => x.bookId === bookId);
  return b ? b.name : null;
}

// ─── Chapter ──────────────────────────────────────────────────────────────
/**
 * Fetch a chapter.
 *
 * NOTE: the API currently 404s whenever a versionKey is provided (any value),
 * so we omit it. When multi-version support lands we'll re-add it here.
 */
export async function fetchChapter(
  book: string,
  chapter: number,
  _version: BibleVersion
): Promise<Chapter> {
  const bookId = await resolveBookId(book);
  if (!bookId) {
    return { book, bookId: 0, chapter, verses: [] };
  }
  try {
    const data = await api.get<any>(`/bible/book/${bookId}/${chapter}`, undefined, {
      auth: false,
    });
    const bookObj = data?.book;
    const ch = bookObj?.chapters?.[0];
    const verses = (ch?.verses || []).map((v: any) => ({
      number: v.verseNumber,
      text: v.text,
    }));
    return {
      book: bookObj?.name || book,
      bookId,
      chapter,
      verses,
      subtitles: ch?.subtitles || [],
    };
  } catch {
    return { book, bookId, chapter, verses: [] };
  }
}

// ─── Commentary / Explanation ─────────────────────────────────────────────
export async function fetchCommentary(book: string, chapter: number): Promise<Commentary[]> {
  const bookId = await resolveBookId(book);
  if (!bookId) return [];
  try {
    // Fetch all three explanation types in parallel
    const [summary, byline, detailed] = await Promise.all([
      fetchExplanation(bookId, chapter, 'summary').catch(() => null),
      fetchExplanation(bookId, chapter, 'byline').catch(() => null),
      fetchExplanation(bookId, chapter, 'detailed').catch(() => null),
    ]);

    // Assemble into the Commentary[] the UI expects. Chapter-level summary
    // is stored with verse=0; byline entries get their verse; detailed is
    // merged into the verse-0 row for now (the UI treats this as the long form).
    const result: Commentary[] = [];
    if (summary?.text) {
      result.push({
        verse: 0,
        summary: 'Chapter summary',
        detail: detailed?.text || summary.text,
        type: 'summary',
      });
    }
    if (byline?.text) {
      // byline text usually comes as a single block; we split on verse markers
      // like "Verse 1:" or "v1:" as a simple heuristic.
      const pieces = splitByVerse(byline.text);
      for (const p of pieces) {
        result.push({
          verse: p.verse,
          summary: p.heading || `Verse ${p.verse}`,
          detail: p.body,
          type: 'byline',
        });
      }
    }
    return result;
  } catch {
    return [];
  }
}

async function fetchExplanation(
  bookId: number,
  chapter: number,
  explanationType: ExplanationType
): Promise<{ text: string } | null> {
  try {
    const data = await api.get<any>(
      `/bible/book/explanation/${bookId}/${chapter}`,
      { explanationType },
      { auth: false }
    );
    const text = data?.explanation?.explanation;
    return typeof text === 'string' ? { text } : null;
  } catch {
    return null;
  }
}

function splitByVerse(text: string): { verse: number; heading?: string; body: string }[] {
  const re = /(?:^|\n)\s*(?:Verse|v\.?)\s*(\d+)[:\.\s]/gi;
  const matches: { idx: number; verse: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) matches.push({ idx: m.index, verse: parseInt(m[1], 10) });
  if (matches.length === 0) return [{ verse: 0, body: text }];
  const result: { verse: number; body: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].idx;
    const end = i + 1 < matches.length ? matches[i + 1].idx : text.length;
    result.push({ verse: matches[i].verse, body: text.slice(start, end).trim() });
  }
  return result;
}

// ─── Verse insights ──────────────────────────────────────────────────────
// The API doesn't currently expose per-verse insight — we derive a simple
// "insight" from the detailed explanation split into verse rows so the
// VerseInsightScreen still has content.
export async function fetchVerseInsights(book: string, chapter: number): Promise<VerseInsight[]> {
  const commentary = await fetchCommentary(book, chapter);
  return commentary
    .filter(c => c.verse > 0)
    .map(c => ({
      verse: c.verse,
      crossReferences: [],
      originalLanguage: '',
      historicalContext: c.detail,
    }));
}

// ─── Auto-highlights ─────────────────────────────────────────────────────
export async function fetchAutoHighlights(
  book: string,
  chapter: number
): Promise<number[]> {
  const bookId = await resolveBookId(book);
  if (!bookId) return [];
  try {
    const data = await api.get<any>(
      `/bible/auto-highlights/${bookId}/${chapter}`,
      undefined,
      { auth: false }
    );
    // API returns a list of highlight range objects; we extract start_verse numbers
    const list: any[] = Array.isArray(data) ? data : data?.highlights || data?.auto_highlights || [];
    return list
      .map(h => h?.start_verse ?? h?.startVerse ?? h?.verse)
      .filter((v): v is number => typeof v === 'number');
  } catch {
    return [];
  }
}

// ─── Topics ──────────────────────────────────────────────────────────────
export async function fetchTopics(): Promise<Topic[]> {
  try {
    // Try to get the full topic list from admin endpoint first; fall back to
    // categories if that's not allowed.
    const catResp = await api.get<{ categories: string[] }>('/topics/categories', undefined, {
      auth: false,
    });
    const categories = catResp?.categories || [];
    // /topics/search with empty query gives us topics grouped under categories
    let topics: Topic[] = [];
    for (const cat of categories) {
      try {
        const result = await api.get<{ topics?: any[] }>(
          '/topics/search',
          { category: cat, limit: 50 },
          { auth: false }
        );
        const list: any[] = result?.topics || [];
        for (const t of list) {
          topics.push({
            id: t.topic_id || t.id,
            name: t.name,
            description: t.description || '',
            category: t.category || cat,
            slug: t.slug,
          });
        }
      } catch {
        /* ignore category failure */
      }
    }
    // If search returned nothing, expose the categories themselves as pseudo-topics
    if (topics.length === 0) {
      return categories.map(c => ({
        id: c.toLowerCase(),
        name: capitalize(c),
        description: '',
        category: c,
      }));
    }
    return topics;
  } catch {
    return [];
  }
}

function capitalize(s: string) {
  return s ? s.charAt(0) + s.slice(1).toLowerCase() : s;
}

export async function fetchTopicEvents(topicId: string): Promise<TopicEvent[]> {
  try {
    const data = await api.get<any>(`/topics/${topicId}/references`, undefined, { auth: false });
    const refs: any[] = data?.references || [];
    // Map references into TopicEvent-shaped items for UI reuse
    return refs.map((r, i) => ({
      id: `${topicId}-${i}`,
      topicId,
      title: r.title || r.reference || `Reference ${i + 1}`,
      description: r.description || r.context || '',
      references: Array.isArray(r.references) ? r.references : [r.reference].filter(Boolean),
    }));
  } catch {
    return [];
  }
}

export async function fetchTopicEvent(
  topicId: string,
  eventId: string
): Promise<TopicEvent | undefined> {
  const events = await fetchTopicEvents(topicId);
  return events.find(e => e.id === eventId);
}

export async function fetchMostQuoted(_eventId: string): Promise<MostQuotedVerse[]> {
  // API doesn't have a per-event most-quoted endpoint yet; return a reasonable
  // fallback curated list so the screen has content.
  return TOP_VERSES_FALLBACK;
}

const TOP_VERSES_FALLBACK: MostQuotedVerse[] = [
  { reference: 'John 3:16', book: 'John', bookId: 43, chapter: 3, verse: 16, text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.', quoteCount: 5234 },
  { reference: 'Psalm 23:1', book: 'Psalms', bookId: 19, chapter: 23, verse: 1, text: 'The LORD is my shepherd; I shall not want.', quoteCount: 4873 },
  { reference: 'Proverbs 3:5-6', book: 'Proverbs', bookId: 20, chapter: 3, verse: 5, text: 'Trust in the LORD with all your heart, and do not lean on your own understanding.', quoteCount: 4567 },
  { reference: 'Philippians 4:13', book: 'Philippians', bookId: 50, chapter: 4, verse: 13, text: 'I can do all things through him who strengthens me.', quoteCount: 4321 },
  { reference: 'Romans 8:28', book: 'Romans', bookId: 45, chapter: 8, verse: 28, text: 'And we know that for those who love God all things work together for good.', quoteCount: 4102 },
  { reference: 'Ephesians 2:8-9', book: 'Ephesians', bookId: 49, chapter: 2, verse: 8, text: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God.', quoteCount: 3456 },
];

// ─── Bookmarks ────────────────────────────────────────────────────────────
export async function fetchBookmarks(userId: string): Promise<Bookmark[]> {
  try {
    const data = await api.get<{ favorites: any[] }>(`/bible/book/bookmarks/${userId}`);
    return (data.favorites || []).map(f => ({
      id: String(f.favorite_id),
      favoriteId: f.favorite_id,
      bookId: f.book_id,
      book: f.book_name,
      chapter: f.chapter_number,
      version: 'ESV' as BibleVersion,
      createdAt: f.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function addBookmark(bookmark: { bookId: number; chapter: number; verse?: number }) {
  return api.post('/bible/book/bookmark/add', bookmark);
}

export async function removeBookmark(favoriteId: number | string) {
  return api.post('/bible/book/bookmark/remove', { favorite_id: favoriteId });
}

// ─── Notes ────────────────────────────────────────────────────────────────
export async function fetchNotes(userId: string): Promise<Note[]> {
  try {
    const data = await api.get<{ notes: any[] }>(`/bible/book/notes/${userId}`);
    return (data.notes || []).map(n => ({
      id: String(n.note_id ?? n.id),
      bookId: n.book_id,
      book: n.book_name || '',
      chapter: n.chapter_number,
      verse: n.verse_number ?? n.start_verse,
      text: n.text || n.content || '',
      createdAt: n.created_at || new Date().toISOString(),
      updatedAt: n.updated_at || n.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function addNote(note: {
  bookId: number;
  chapter: number;
  verse: number;
  text: string;
}) {
  return api.post('/bible/book/note/add', note);
}

export async function updateNote(id: string, text: string) {
  return api.put('/bible/book/note/update', { note_id: id, text });
}

export async function removeNote(id: string) {
  return api.delete(`/bible/book/note/remove?note_id=${id}`);
}

// ─── Highlights ───────────────────────────────────────────────────────────
export async function fetchHighlights(userId: string): Promise<Highlight[]> {
  try {
    const data = await api.get<{ highlights: any[] }>(`/bible/highlights/${userId}`);
    return (data.highlights || []).map(h => ({
      id: String(h.highlight_id),
      highlightId: h.highlight_id,
      bookId: h.book_id,
      book: '',
      chapter: h.chapter_number,
      verse: h.start_verse,
      startVerse: h.start_verse,
      endVerse: h.end_verse,
      startChar: h.start_char,
      endChar: h.end_char,
      color: h.color as HighlightColor,
      createdAt: h.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function addHighlight(h: {
  bookId: number;
  chapter: number;
  startVerse: number;
  endVerse?: number;
  color: HighlightColor;
}) {
  return api.post('/bible/highlight/add', {
    book_id: h.bookId,
    chapter_number: h.chapter,
    start_verse: h.startVerse,
    end_verse: h.endVerse ?? h.startVerse,
    color: h.color,
  });
}

export async function updateHighlight(id: string, color: HighlightColor) {
  return api.put(`/bible/highlight/${id}`, { color });
}

export async function removeHighlight(id: string) {
  return api.delete(`/bible/highlight/${id}`);
}

// ─── Auth ─────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await api.post<{ accessToken: string; refreshToken?: string; verified: boolean }>(
    '/auth/login',
    { email, password },
    { auth: false }
  );
  setAccessToken(data.accessToken);
  if (data.refreshToken) setRefreshToken(data.refreshToken);
  return fetchCurrentUser();
}

export async function signup(email: string, password: string, name?: string): Promise<AuthUser> {
  const data = await api.post<{ accessToken: string; refreshToken?: string }>(
    '/auth/signup',
    { email, password, name },
    { auth: false }
  );
  setAccessToken(data.accessToken);
  if (data.refreshToken) setRefreshToken(data.refreshToken);
  return fetchCurrentUser();
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    /* ignore */
  }
  clearTokens();
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const data = await api.get<any>('/auth/user');
  return {
    id: data?.id || data?.user?.id || '',
    email: data?.email || data?.user?.email || '',
    name: data?.name || data?.user?.name,
    avatarUrl: data?.avatar_url || data?.user?.avatar_url,
  };
}

export function isSignedIn(): boolean {
  return !!getAccessToken();
}

// ─── LocalStorage settings (still local only) ────────────────────────────
const STORAGE_KEYS = {
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
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export interface AppSettings {
  fontSize: number;
  lineSpacing: number;
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

export function saveSettings(s: AppSettings) {
  saveJSON(STORAGE_KEYS.settings, s);
}

// ─── Back-compat shims for components that still import these ────────────
// (These used to read/write localStorage; now they're stubs that return empty
// arrays locally. Real data is fetched via fetchBookmarks/fetchNotes/etc.)
export function loadBookmarks(): Bookmark[] {
  return loadJSON('versemate-bookmarks', []);
}
export function saveBookmarks(b: Bookmark[]) {
  saveJSON('versemate-bookmarks', b);
}
export function loadNotes(): Note[] {
  return loadJSON('versemate-notes', []);
}
export function saveNotes(n: Note[]) {
  saveJSON('versemate-notes', n);
}
export function loadHighlights(): Highlight[] {
  return loadJSON('versemate-highlights', []);
}
export function saveHighlights(h: Highlight[]) {
  saveJSON('versemate-highlights', h);
}

// Legacy export that some screens may still use
export const AUTO_HIGHLIGHTS: Record<string, number[]> = {};

export { ApiError, API_BASE_URL };
