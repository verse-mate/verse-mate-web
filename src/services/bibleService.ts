import {
  BibleVersion,
  Chapter,
  ChapterSubtitle,
  BibleBook,
  Bookmark,
  Note,
  Highlight,
  HighlightColor,
  Commentary,
  VerseInsight,
  Topic,
  TopicEvent,
  TopicSection,
  TopicVerse,
  TopicDetails,
  MostQuotedVerse,
  ExplanationType,
} from './types';
import { api, clearTokens, setAccessToken, setRefreshToken, getAccessToken, getRefreshToken, ApiError, API_BASE_URL } from './api';

// ─── Raw API response shapes ─────────────────────────────────────────────
// Narrow definitions of just the fields we read from each backend payload.
// Kept local to this file because they are not part of the domain model.

interface BibleBookRaw {
  bookId: number;
  name: string;
  testament: string;
  chapters?: unknown[];
}

interface VerseRaw {
  verseNumber: number;
  text: string;
}

interface ChapterRaw {
  name?: string;
  chapters?: Array<{
    verses?: VerseRaw[];
    subtitles?: ChapterSubtitle[];
  }>;
}

interface ExplanationResponse {
  explanation?: {
    explanation?: unknown;
    explanation_id?: unknown;
  };
}

interface AutoHighlightRaw {
  start_verse: number;
  end_verse?: number;
  theme_name?: string;
  theme_color?: string;
}

type AutoHighlightsResponse = AutoHighlightRaw[] | { data?: AutoHighlightRaw[] };

interface TopicSearchRaw {
  topic_id?: string;
  id?: string;
  name: string;
  description?: string;
  category?: string;
  slug?: string;
}

interface TopicReferencesResponse {
  references?: { content?: string };
}

interface TopicDetailsResponse {
  topic?: {
    topic_id?: string;
    id?: string;
    name?: string;
    description?: string;
    category?: string;
    slug?: string;
  };
  explanation?: {
    summary?: unknown;
    byline?: unknown;
    detailed?: unknown;
  };
}

interface BookmarkRaw {
  favorite_id: number;
  book_id: number;
  book_name: string;
  chapter_number: number;
  created_at?: string;
}

interface NoteRaw {
  note_id?: number | string;
  id?: number | string;
  book_id: number;
  book_name?: string;
  chapter_number: number;
  verse_number?: number;
  start_verse?: number;
  text?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
}

interface HighlightRaw {
  highlight_id: number;
  book_id: number;
  chapter_number: number;
  start_verse: number;
  end_verse?: number;
  start_char?: number | null;
  end_char?: number | null;
  color: string;
  created_at?: string;
}

interface CurrentUserResponse {
  id?: string;
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  imageSrc?: string;
  hasPassword?: boolean;
  preferred_language?: string;
  preferredLanguage?: string;
}

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
      const data = await api.get<{ books: BibleBookRaw[] }>('/bible/books', undefined, { auth: false });
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
    const data = await api.get<{ book?: ChapterRaw }>(`/bible/book/${bookId}/${chapter}`, undefined, {
      auth: false,
    });
    const bookObj = data?.book;
    const ch = bookObj?.chapters?.[0];
    const verses = (ch?.verses || []).map((v: VerseRaw) => ({
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
// The API returns rich Markdown. Summary and Detailed come back as single
// chapter-level blocks. By Line uses "## Genesis 1:1" style headings per verse.

interface ExplanationEntry {
  text: string;
  /** Source explanation row id — null when the API didn't surface one. */
  id: number | null;
}

interface ExplanationCache {
  summary: ExplanationEntry;
  byline: ExplanationEntry;
  detailed: ExplanationEntry;
  perVerse: Map<number, string>; // verse number -> markdown section
}

const _explanationCache = new Map<string, Promise<ExplanationCache>>();

async function loadExplanations(bookId: number, chapter: number): Promise<ExplanationCache> {
  const key = `${bookId}:${chapter}`;
  const existing = _explanationCache.get(key);
  if (existing) return existing;
  const promise = (async (): Promise<ExplanationCache> => {
    const [summary, byline, detailed] = await Promise.all([
      fetchExplanation(bookId, chapter, 'summary'),
      fetchExplanation(bookId, chapter, 'byline'),
      fetchExplanation(bookId, chapter, 'detailed'),
    ]);
    return {
      summary,
      byline,
      detailed,
      perVerse: splitBylineByVerse(byline.text),
    };
  })();
  _explanationCache.set(key, promise);
  return promise;
}

export async function fetchCommentary(book: string, chapter: number): Promise<Commentary[]> {
  const bookId = await resolveBookId(book);
  if (!bookId) return [];
  try {
    const cache = await loadExplanations(bookId, chapter);
    const result: Commentary[] = [];
    if (cache.summary.text) {
      result.push({
        verse: 0,
        summary: 'Chapter Summary',
        detail: cache.summary.text,
        type: 'summary',
        explanationId: cache.summary.id,
      });
    }
    for (const [verse, body] of cache.perVerse.entries()) {
      result.push({
        verse,
        summary: `${book} ${chapter}:${verse}`,
        detail: body,
        type: 'byline',
        // Per-verse byline shares the parent byline explanation_id.
        explanationId: cache.byline.id,
      });
    }
    if (cache.detailed.text) {
      result.push({
        verse: -1, // sentinel: chapter-level detailed
        summary: 'Detailed Commentary',
        detail: cache.detailed.text,
        type: 'detailed',
        explanationId: cache.detailed.id,
      });
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
): Promise<ExplanationEntry> {
  try {
    const data = await api.get<ExplanationResponse>(
      `/bible/book/explanation/${bookId}/${chapter}`,
      { explanationType },
      { auth: false }
    );
    const text = data?.explanation?.explanation;
    const rawId = data?.explanation?.explanation_id;
    return {
      text: typeof text === 'string' ? text : '',
      // Treat 0 / falsy as "unknown id" — local-fallback paths use that
      // sentinel and AudioInlineEntry must not request audio for it.
      id: typeof rawId === 'number' && rawId > 0 ? rawId : null,
    };
  } catch {
    return { text: '', id: null };
  }
}

/**
 * Parse byline markdown into a map of verse -> markdown section.
 *
 * The API returns text like:
 *   ## Genesis 1:1
 *   > In the beginning...
 *   ### Summary
 *   This opening says...
 *   ## Genesis 1:2
 *   ...
 */
function splitBylineByVerse(text: string): Map<number, string> {
  const map = new Map<number, string>();
  if (!text) return map;
  // Match "## Book Name 1:2" headings
  const re = /^##\s+[\w\s]+?\s+\d+:(\d+)/gm;
  const matches: { idx: number; verse: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    matches.push({ idx: m.index, verse: parseInt(m[1], 10) });
  }
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].idx;
    const end = i + 1 < matches.length ? matches[i + 1].idx : text.length;
    const body = text.slice(start, end).trim();
    map.set(matches[i].verse, body);
  }
  return map;
}

// ─── Verse insights ──────────────────────────────────────────────────────
// For a per-verse insight we return the matching byline section. Falls back
// to the chapter summary when the specific verse isn't found.
export async function fetchVerseInsights(book: string, chapter: number): Promise<VerseInsight[]> {
  const bookId = await resolveBookId(book);
  if (!bookId) return [];
  try {
    const cache = await loadExplanations(bookId, chapter);
    const insights: VerseInsight[] = [];
    for (const [verse, body] of cache.perVerse.entries()) {
      insights.push({
        verse,
        crossReferences: extractCrossRefs(body),
        historicalContext: body,
      });
    }
    // Fallback: if no per-verse splits succeeded, emit a single verse-1 entry
    // with the summary text so the insight screen still has content.
    if (insights.length === 0 && cache.summary) {
      insights.push({
        verse: 1,
        crossReferences: [],
        historicalContext: cache.summary,
      });
    }
    return insights;
  } catch {
    return [];
  }
}

function extractCrossRefs(markdown: string): string[] {
  // Crude scan for scripture references like "John 1:1" or "Revelation 4:11"
  const re = /\b([1-3]?\s?[A-Z][a-zA-Z]+)\s+(\d+):(\d+)(?:[–-]\d+)?\b/g;
  const refs = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown))) {
    refs.add(`${m[1].trim()} ${m[2]}:${m[3]}`);
    if (refs.size >= 6) break;
  }
  return Array.from(refs);
}

// ─── Auto-highlights ─────────────────────────────────────────────────────
export interface AutoHighlightRange {
  startVerse: number;
  endVerse: number;
  theme: string;
  color: string; // API color names: blue, green, yellow, ...
}

/**
 * Fetch auto-highlight ranges for a chapter.
 * API shape: `{ success: true, data: [{ start_verse, end_verse, theme_name, theme_color, ... }] }`
 */
export async function fetchAutoHighlights(
  book: string,
  chapter: number
): Promise<AutoHighlightRange[]> {
  const bookId = await resolveBookId(book);
  if (!bookId) return [];
  try {
    const resp = await api.get<AutoHighlightsResponse>(
      `/bible/auto-highlights/${bookId}/${chapter}`,
      undefined,
      { auth: false }
    );
    const list: AutoHighlightRaw[] = Array.isArray(resp) ? resp : resp?.data || [];
    return list.map(h => ({
      startVerse: h.start_verse,
      endVerse: h.end_verse ?? h.start_verse,
      theme: h.theme_name || '',
      color: h.theme_color || 'yellow',
    }));
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
    const topics: Topic[] = [];
    for (const cat of categories) {
      try {
        const result = await api.get<{ topics?: TopicSearchRaw[] }>(
          '/topics/search',
          { category: cat, limit: 50 },
          { auth: false }
        );
        const list: TopicSearchRaw[] = result?.topics || [];
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

/**
 * Extract "Book Ch:Verse" / "Book Ch" references from raw text.
 * Used both for the per-section reference pills and the trailing-cite
 * fallback for verses parsed without an explicit `(reference)`.
 */
function extractTopicReferences(text: string): string[] {
  const refs: string[] = [];
  const refPatterns = [
    /\(([1-3]?\s?[A-Za-z]+\s+\d+(?::\d+(?:[-–]\d+)?)?)\)/g,
    /\{(?:verse|chapter):([^}]+)\}/g,
  ];
  for (const re of refPatterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const ref = m[1].trim();
      if (ref && !refs.includes(ref)) refs.push(ref);
    }
  }
  return refs;
}

/**
 * Parse the topic references markdown into structured sections.
 * Mirrors verse-mate/packages/frontend-base/src/utils/parseTopicMarkdown.ts —
 * each `## Subtitle` block becomes a section with its reference list and
 * a verse-by-verse breakdown so the UI can render verse numbers as
 * superscripts (matching the old FE's TopicText component).
 *
 * The new FE used to slice each section's body to 220 chars for a
 * preview-card layout; that caused the mid-sentence truncation users
 * reported. We now keep the full structured content.
 */
function parseTopicReferencesMarkdown(
  content: string,
  topicId: string
): TopicSection[] {
  if (!content) return [];
  const rawSections = content.split(/^##\s+/m).filter((s) => s.trim());
  return rawSections.map((section, i) => {
    const lines = section.split('\n');
    const subtitle = (lines[0] || '').trim();
    // The line right under the subtitle is usually a parenthesised
    // reference list like "(Genesis 11:1-9, Acts 2:1-13)".
    const secondLine = (lines[1] || '').trim();
    const isRefListLine =
      /^\(.+\)$/.test(secondLine) || /^[1-3]?\s?[A-Za-z]+\s+\d+/.test(secondLine);
    const referenceList = isRefListLine ? secondLine : '';
    const verseText = lines.slice(isRefListLine ? 2 : 1).join('\n');

    const references = referenceList
      ? referenceList
          .replace(/^\(|\)$/g, '')
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean)
      : extractTopicReferences(section);

    return {
      id: `${topicId}-${i}`,
      topicId,
      subtitle: subtitle || `Section ${i + 1}`,
      referenceList,
      references,
      verses: parseTopicVerses(verseText),
    };
  });
}

/**
 * Parse verses from a topic section body. Each verse is two lines:
 *   <verse-number>
 *   <verse-text> [optional "(Book Ch:Verse)" at the end]
 *
 * Matches the old FE's parser line-for-line; kept as a separate helper
 * for readability and direct comparison with that file when debugging.
 */
function parseTopicVerses(text: string): TopicVerse[] {
  const verses: TopicVerse[] = [];
  // Split on a newline immediately followed by a line that contains only
  // digits — that next line is the next verse number.
  const parts = text.split(/\n(?=\d+\s*\n)/);
  for (const raw of parts) {
    const part = raw.trim();
    if (!part) continue;
    const withRef = part.match(/^(\d+)\s*\n([\s\S]*?)\(([^)]+)\)\s*$/);
    if (withRef) {
      verses.push({
        verseNumber: withRef[1].trim(),
        text: withRef[2].trim(),
        reference: withRef[3].trim(),
      });
      continue;
    }
    const withoutRef = part.match(/^(\d+)\s*\n([\s\S]+)$/);
    if (withoutRef) {
      verses.push({
        verseNumber: withoutRef[1].trim(),
        text: withoutRef[2].trim(),
        reference: '',
      });
    }
  }
  return verses;
}

/**
 * Rich topic sections used by TopicEventsScreen. Returns the structured
 * verse-by-verse content (subtitle, reference list, verses).
 */
export async function fetchTopicSections(topicId: string): Promise<TopicSection[]> {
  try {
    const data = await api.get<TopicReferencesResponse>(`/topics/${topicId}/references`, undefined, {
      auth: false,
    });
    const content: string = data?.references?.content || '';
    return parseTopicReferencesMarkdown(content, topicId);
  } catch {
    return [];
  }
}

/**
 * Full topic record — section content + AI explanations (summary,
 * byline, detailed).
 *
 * Two API calls in parallel:
 *   - GET /topics/:id?bible_version=…  → metadata + explanations
 *   - GET /topics/:id/references       → expanded verse content
 *
 * Why two endpoints: the `/topics/:id` route returns the references
 * markdown with unexpanded placeholder tokens like `{chapter:Genesis 1}`
 * and `{verse:Genesis 1:26-28}` (no verse text). Only the
 * `/topics/:id/references` endpoint runs the verse-injection pass that
 * produces the fully rendered "## Subtitle / (refs) / 1\n<verse text>"
 * markdown the parser expects. The old FE makes both calls separately
 * for the same reason.
 */
export async function fetchTopicDetails(
  topicId: string,
  bibleVersion?: string
): Promise<TopicDetails> {
  try {
    const [detailsRes, refsRes] = await Promise.all([
      api
        .get<TopicDetailsResponse>(
          `/topics/${topicId}`,
          bibleVersion ? { bible_version: bibleVersion } : undefined,
          { auth: false }
        )
        .catch(() => null),
      api
        .get<TopicReferencesResponse>(`/topics/${topicId}/references`, undefined, { auth: false })
        .catch(() => null),
    ]);

    const data = detailsRes;
    const topic: Topic | null = data?.topic
      ? {
          id: data.topic.topic_id || data.topic.id || topicId,
          name: data.topic.name || '',
          description: data.topic.description || '',
          category: data.topic.category,
          slug: data.topic.slug,
        }
      : null;
    const sections = parseTopicReferencesMarkdown(
      refsRes?.references?.content || '',
      topicId
    );
    const explanation = {
      summary: typeof data?.explanation?.summary === 'string' ? data.explanation.summary : '',
      byline: typeof data?.explanation?.byline === 'string' ? data.explanation.byline : '',
      detailed: typeof data?.explanation?.detailed === 'string' ? data.explanation.detailed : '',
    };
    return { topic, sections, explanation };
  } catch {
    return { topic: null, sections: [], explanation: { summary: '', byline: '', detailed: '' } };
  }
}

/**
 * Legacy: kept for TopicEventDetailScreen which still treats each
 * section as a standalone "event" with a single description blob.
 * The 220-char truncation that produced the mid-sentence cuts users
 * reported has been removed — the description is now the full
 * section body.
 */
export async function fetchTopicEvents(topicId: string): Promise<TopicEvent[]> {
  try {
    const sections = await fetchTopicSections(topicId);
    return sections.map((s) => {
      const body = s.verses
        .map((v) => (v.reference ? `${v.text} (${v.reference})` : v.text))
        .join('\n\n');
      return {
        id: s.id,
        topicId: s.topicId,
        title: s.subtitle,
        description: body,
        references: s.references.slice(0, 6),
      };
    });
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
    const data = await api.get<{ favorites: BookmarkRaw[] }>(`/bible/book/bookmarks/${userId}`);
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

export async function addBookmark(args: {
  userId: string;
  bookId: number;
  chapter: number;
  insightType?: string;
}) {
  return api.post('/bible/book/bookmark/add', {
    user_id: args.userId,
    book_id: args.bookId,
    chapter_number: args.chapter,
    ...(args.insightType ? { insight_type: args.insightType } : {}),
  });
}

export async function removeBookmark(args: {
  userId: string;
  bookId: number;
  chapter: number;
  insightType?: string;
}) {
  return api.post('/bible/book/bookmark/remove', {
    user_id: args.userId,
    book_id: args.bookId,
    chapter_number: args.chapter,
    ...(args.insightType ? { insight_type: args.insightType } : {}),
  });
}

// ─── Notes ────────────────────────────────────────────────────────────────
export async function fetchNotes(userId: string): Promise<Note[]> {
  try {
    const data = await api.get<{ notes: NoteRaw[] }>(`/bible/book/notes/${userId}`);
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

export async function addNote(args: {
  userId: string;
  bookId: number;
  chapter: number;
  /** 0 means chapter-level note — `verse_id` is omitted in that case. */
  verse: number;
  text: string;
}) {
  // Backend schema (verified against verse-mate-mobile/src/api/generated):
  //   POST /bible/book/note/add
  //   body: { user_id, book_id, chapter_number, verse_id?, content }
  // `verse_id` is OPTIONAL — omit it for chapter-level notes (where the
  // frontend uses verse=0 as a marker matching BookmarksScreen's `!b.verse`).
  // Earlier revisions sent `verse_number` + `text`, both wrong field names —
  // every POST 400'd and AppContext rolled back the optimistic note, so the
  // user never saw their note persist after sign-in. Issue #133 follow-up.
  return api.post('/bible/book/note/add', {
    user_id: args.userId,
    book_id: args.bookId,
    chapter_number: args.chapter,
    ...(args.verse > 0 ? { verse_id: args.verse } : {}),
    content: args.text,
  });
}

export async function updateNote(id: string, text: string) {
  // Backend expects `content` (not `text`) per the generated schema:
  //   PUT /bible/book/note/update body: { note_id, content }
  return api.put('/bible/book/note/update', { note_id: id, content: text });
}

export async function removeNote(id: string) {
  return api.delete(`/bible/book/note/remove?note_id=${id}`);
}

// ─── Highlights ───────────────────────────────────────────────────────────
export async function fetchHighlights(userId: string): Promise<Highlight[]> {
  try {
    // Resolve book_id → book name in parallel with the fetch so downstream
    // consumers (HighlightsScreen, etc.) can display "James 2" instead of
    // " 2". The /bible/highlights API only returns book_id.
    const [data, books] = await Promise.all([
      api.get<{ highlights: HighlightRaw[] }>(`/bible/highlights/${userId}`),
      fetchBooks(),
    ]);
    const bookNameById = new Map(books.map(b => [b.bookId, b.name]));
    return (data.highlights || []).map(h => ({
      id: String(h.highlight_id),
      highlightId: h.highlight_id,
      bookId: h.book_id,
      book: bookNameById.get(h.book_id) || '',
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
  userId: string;
  bookId: number;
  chapter: number;
  startVerse: number;
  endVerse?: number;
  color: HighlightColor;
}) {
  // Backend requires user_id in the body — POST /bible/highlight/add
  // throws ValidationError("Missing required fields") otherwise. Without
  // it, the optimistic highlight added in AppContext gets rolled back on
  // the catch path, so the highlight visually flashes and disappears.
  return api.post('/bible/highlight/add', {
    user_id: h.userId,
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
  firstName?: string;
  lastName?: string;
  /** Whether the account has a password set (false for SSO-only accounts). */
  hasPassword?: boolean;
  /** Stored language preference from /user/me (locale string like "en-US"). */
  preferredLanguage?: string;
}

/**
 * Exchange a provider ID token (from Google Identity Services or Apple
 * Sign In) for a VerseMate accessToken + refreshToken. Uses the backend's
 * POST /auth/sso endpoint which accepts { provider, token, platform }.
 */
function decodeJwtSub(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload?.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

async function identifyAfterAuth(
  accessToken: string,
  email: string,
  method: 'google' | 'apple' | 'email',
) {
  const userId = decodeJwtSub(accessToken);
  if (!userId) return;
  try {
    // Lazy import so the analytics module doesn't bloat the auth bundle
    // for users who never sign in.
    const { analytics } = await import('@/lib/analytics');
    analytics.identify(userId, { email });
    analytics.setUserProperties({ email, account_type: method, is_registered: true });
    analytics.track('login_completed', { method });
  } catch {
    /* analytics is best-effort; never block auth on it */
  }
}

export async function signInWithSSO(
  provider: 'google' | 'apple',
  token: string
): Promise<AuthUser> {
  const data = await api.post<{ accessToken: string; refreshToken?: string; verified: boolean }>(
    '/auth/sso',
    { provider, token, platform: 'web' },
    { auth: false }
  );
  setAccessToken(data.accessToken);
  if (data.refreshToken) setRefreshToken(data.refreshToken);
  const user = await fetchCurrentUser();
  identifyAfterAuth(data.accessToken, user.email, provider);
  return user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await api.post<{ accessToken: string; refreshToken?: string; verified: boolean }>(
    '/auth/login',
    { email, password },
    { auth: false }
  );
  setAccessToken(data.accessToken);
  if (data.refreshToken) setRefreshToken(data.refreshToken);
  const user = await fetchCurrentUser();
  identifyAfterAuth(data.accessToken, user.email, 'email');
  return user;
}

export async function signup(email: string, password: string, name?: string): Promise<AuthUser> {
  const data = await api.post<{ accessToken: string; refreshToken?: string }>(
    '/auth/signup',
    { email, password, name },
    { auth: false }
  );
  setAccessToken(data.accessToken);
  if (data.refreshToken) setRefreshToken(data.refreshToken);
  const user = await fetchCurrentUser();
  identifyAfterAuth(data.accessToken, user.email, 'email');
  return user;
}

export async function logout(): Promise<void> {
  // Backend /auth/logout requires the access token via Authorization
  // header (api.post adds it automatically). Body is optional — we send
  // refreshToken when we have it so the server can revoke it as well.
  // (Verified live: omitting the auth header returns 401 even with body;
  // including the auth header returns 200 with or without body.)
  const refreshToken = getRefreshToken();
  try {
    await api.post('/auth/logout', refreshToken ? { refreshToken } : undefined);
  } catch {
    /* server-side logout is best-effort */
  }
  clearTokens();
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  // /auth/user returns only {id} — minimal payload meant for token-only
  // checks. /user/me returns the full record:
  //   { id, email, firstName, lastName, fullName, emailVerified,
  //     hasPassword, preferred_language }
  // The MenuScreen + AuthCallback dispatch paths need the full record
  // for the profile UI to render past the "Loading..." state.
  const data = await api.get<CurrentUserResponse>('/user/me');
  return {
    id: data?.id || '',
    email: data?.email || '',
    name: data?.fullName || data?.firstName || undefined,
    // Backend doesn't return an avatar URL today; left here so existing
    // call sites that read user.avatarUrl don't break.
    avatarUrl: data?.imageSrc || undefined,
    firstName: data?.firstName || '',
    lastName: data?.lastName || '',
    hasPassword: typeof data?.hasPassword === 'boolean' ? data.hasPassword : true,
    preferredLanguage: data?.preferred_language || data?.preferredLanguage || undefined,
  };
}

// ─── Profile / preferences / languages / delete account ───────────────────

export interface BibleLanguage {
  code: string;
  name: string;
  nativeName: string;
}

interface BibleLanguageRaw {
  language_code: string;
  name: string;
  native_name: string;
}

/** GET /bible/languages — list of language codes the backend has content for. */
export async function fetchBibleLanguages(): Promise<BibleLanguage[]> {
  const data = await api.get<BibleLanguageRaw[]>('/bible/languages');
  return (Array.isArray(data) ? data : [])
    .map((l) => ({
      code: l.language_code,
      name: l.name,
      nativeName: l.native_name,
    }))
    .sort((a, b) => a.nativeName.localeCompare(b.nativeName));
}

/** PUT /auth/profile — update first/last/email. Returns when server has saved. */
export async function updateAuthProfile(body: {
  firstName: string;
  lastName: string;
  email: string;
}): Promise<void> {
  await api.put('/auth/profile', body);
}

/** PATCH /user/preferences — update preferred_language. */
export async function updateUserPreferredLanguage(languageCode: string): Promise<void> {
  await api.patch('/user/preferences', { preferred_language: languageCode });
}

/**
 * Refresh tokens using the current refreshToken cookie. Returns the new
 * accessToken (also written to the cookie), or null if the refresh failed.
 * Mirrors mobile's refreshTokens() — used after preference changes so the
 * next API call gets a token whose claims reflect the change.
 */
export async function refreshTokens(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const data = await api.post<{ accessToken: string; refreshToken?: string }>(
      '/auth/refresh',
      { refreshToken },
      { auth: false }
    );
    if (data.accessToken) {
      setAccessToken(data.accessToken);
      if (data.refreshToken) setRefreshToken(data.refreshToken);
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

interface DeleteAccountResult {
  ok: boolean;
  status: number;
  errorCode?: string;
}

/**
 * DELETE /auth/account — permanently delete the current user's account.
 * Returns a structured result so callers can surface the right error string.
 * Caller is responsible for clearing local session on success.
 */
export async function deleteAuthAccount(password?: string): Promise<DeleteAccountResult> {
  const accessToken = getAccessToken();
  if (!accessToken) return { ok: false, status: 401, errorCode: 'NOT_AUTHENTICATED' };

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: password ? JSON.stringify({ password }) : undefined,
    });
  } catch {
    return { ok: false, status: 0, errorCode: 'NETWORK_ERROR' };
  }

  if (res.ok) return { ok: true, status: res.status };

  let errorCode: string | undefined;
  try {
    const data = await res.json();
    errorCode = data?.error;
  } catch {
    /* no body */
  }
  return { ok: false, status: res.status, errorCode };
}

export function isSignedIn(): boolean {
  return !!getAccessToken();
}

// ─── LocalStorage settings (still local only) ────────────────────────────
const STORAGE_KEYS = {
  settings: 'versemate-settings',
  migrations: 'versemate-settings-migrations',
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
  fontSize: 20,
  lineSpacing: 1.7,
  theme: 'dark',
  // NASB1995 is the only Bible version the backend has verse text for —
  // ESV/NIV/KJV/NLT are still in the type union for legacy storage but
  // hitting any of them returns no verses, which surfaces as unsubstituted
  // `{verse:Genesis 1:1}` placeholders in topic byline insights and empty
  // chapter bodies. Defaulting to NASB1995 keeps fresh visits sane.
  defaultVersion: 'NASB1995',
  notifications: true,
  showVerseNumbers: true,
  autoHighlights: false,
  readingPlan: 'none',
  language: 'en',
  offlineMode: false,
  hapticFeedback: true,
};

export function loadSettings(): AppSettings {
  const loaded = loadJSON<Partial<AppSettings>>(STORAGE_KEYS.settings, {});
  const migrated = applySettingsMigrations(loaded);
  return { ...DEFAULT_SETTINGS, ...migrated };
}

// One-time migrations for existing devices. Each migration runs at most once
// per device (tracked via STORAGE_KEYS.migrations) and may mutate the loaded
// partial settings before defaults are applied.
function applySettingsMigrations(
  loaded: Partial<AppSettings>,
): Partial<AppSettings> {
  const ran = loadJSON<Record<string, boolean>>(STORAGE_KEYS.migrations, {});
  let next = loaded;
  let changed = false;

  // 2026-05: autoHighlights default flipped from true → false. Existing
  // devices with a stored settings blob predating the autoHighlights key
  // would otherwise inherit the new default. Pin those devices to false.
  if (!ran['autoHighlights-default-off-v1']) {
    if (next.autoHighlights === undefined) {
      next = { ...next, autoHighlights: false };
      saveJSON(STORAGE_KEYS.settings, { ...DEFAULT_SETTINGS, ...next });
    }
    ran['autoHighlights-default-off-v1'] = true;
    changed = true;
  }

  // 2026-05: backend only has verse text for NASB1995 — any other
  // version returns empty content and surfaces as unsubstituted
  // `{verse:...}` placeholders in topic byline insights and empty
  // chapter bodies. Migrate stored ESV/NIV/KJV/NLT (the old default
  // + Lovable-era picker choices) to NASB1995 so existing devices
  // get the same fix as fresh ones.
  if (!ran['default-version-nasb1995-v1']) {
    const v = next.defaultVersion;
    if (v && v !== 'NASB1995') {
      next = { ...next, defaultVersion: 'NASB1995' };
      saveJSON(STORAGE_KEYS.settings, { ...DEFAULT_SETTINGS, ...next });
    }
    ran['default-version-nasb1995-v1'] = true;
    changed = true;
  }

  if (changed) saveJSON(STORAGE_KEYS.migrations, ran);
  return next;
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

// ─── Recently viewed books (localStorage + API sync) ────────────────────
const RECENTS_KEY = 'versemate-recent-books';
const MAX_RECENTS = 8;

interface RecentBook {
  bookId: number;
  timestamp: number;
}

export function getRecentBooks(): RecentBook[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? (JSON.parse(raw) as RecentBook[]) : [];
  } catch {
    return [];
  }
}

export function trackRecentBook(bookId: number) {
  try {
    const existing = getRecentBooks().filter(r => r.bookId !== bookId);
    const next = [{ bookId, timestamp: Date.now() }, ...existing].slice(0, MAX_RECENTS);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    // Best-effort sync to server when signed in
    if (getAccessToken()) {
      api
        .post('/user/recently-viewed-books/sync', {
          books: next.map(r => ({ bookId: String(r.bookId), timestamp: r.timestamp })),
        })
        .catch(() => undefined);
    }
  } catch {
    /* ignore */
  }
}

// Legacy export that some screens may still use
export const AUTO_HIGHLIGHTS: Record<string, number[]> = {};

export { ApiError, API_BASE_URL };
