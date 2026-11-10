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
import { clearTokens, setAccessToken, getAccessToken, ApiError, API_BASE_URL } from '@/api/client';
import { apiClient, publicClient, quietClient, unwrap } from '@/api/client';
import { textOrUndefined } from '@/api/values';
import type { GetBibleSearchResponse, PostBibleHighlightAddResponse } from '@/api/generated/types.gen';
import {
  deleteAuthAccount as deleteAccountRequest,
  deleteBibleBookNoteRemove,
  deleteBibleHighlightByHighlightId,
  getAuthSession,
  getBibleAutoHighlightsByBookIdByChapterNumber,
  getBibleBookBookmarksByUserId,
  getBibleBookByBookIdByChapterNumber,
  getBibleBookExplanationByBookIdByChapterNumber,
  getBibleBookNotesByUserId,
  getBibleBooks,
  getBibleHighlightsByUserId,
  getBibleHighlightThemes,
  getBibleLanguages,
  getBibleSearch,
  getBibleStudyByBookIdByChapterNumber,
  getBibleStudyLabels,
  getBibleTestaments,
  getBibleUserThemePreferences,
  getBibleVersions,
  getTopicsById,
  getTopicsByIdReferences,
  getTopicsCategories,
  getTopicsSearch,
  patchBibleUserThemePreferencesByThemeId,
  postBibleBookBookmarkAdd,
  postBibleBookBookmarkRemove,
  postBibleBookNoteAdd,
  postBibleHighlightAdd,
  postUserRecentlyViewedBooksSync,
  putBibleBookNoteUpdate,
  putBibleHighlightByHighlightId,
  getUserMe,
  patchUserPreferences,
  postAuthLogin,
  postAuthLogout,
  postAuthSignup,
  postAuthSso,
  postAuthSsoExchange,
  putAuthProfile,
} from '@/api/generated/sdk.gen';
import { bibleVersions, BibleVersionInfo, TestamentCoverage } from '@/constants/bible-versions';
import { getPreferredLanguageCode, getVisitLanguage } from '@/hooks/usePreferredLanguage';
import { getStudyFor, type InductiveStudy, type StudyLabels } from '@versemate/studies';

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
      const data = await unwrap(getBibleBooks({ client: publicClient }));
      const mapped: BibleBook[] = data.books
        .map(b => ({
          bookId: b.bookId,
          name: b.name,
          shortName: shortenBookName(b.name),
          testament: b.testament,
          chapters: b.chapters.length,
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
 * Fetch a chapter for the given Bible version.
 *
 * The version is sent as `bible_version` (the backend also accepts the
 * `versionKey` alias and defaults to NASB1995 when omitted). For an NT-only
 * version an OT book comes back with `verses: []`, which the caller renders
 * as an empty chapter rather than an error.
 */
export async function fetchChapter(
  book: string,
  chapter: number,
  version: BibleVersion
): Promise<Chapter> {
  const bookId = await resolveBookId(book);
  if (!bookId) {
    return { book, bookId: 0, chapter, verses: [] };
  }
  return fetchChapterById(bookId, book, chapter, version);
}

/**
 * In-flight + resolved chapters, keyed by book, chapter and version.
 *
 * The request is anonymous (`auth: false`) and a chapter's text never changes
 * for a given version, so a session-lifetime cache is safe. It matters because
 * several surfaces now want the same chapter at once: the reader, the Verse
 * Insight sheet it opens, and each Jesus passage block asking for the Strong's
 * tokens behind its words. Without it a reader stepping through an event's
 * parallel accounts re-downloads the same chapters.
 *
 * Empty results are evicted so an offline blip (or a version that doesn't
 * carry the book yet) isn't pinned for the rest of the session.
 */
const chapterCache = new Map<string, Promise<Chapter>>();

/**
 * Fetch a chapter when the caller already knows the book id — the Jesus graph
 * and topic references store references structurally, so they'd otherwise pay
 * for a book-list round trip just to look the id back up from the name.
 *
 * `bookName` is only the display fallback for a response that omits it.
 */
export function fetchChapterById(
  bookId: number,
  bookName: string,
  chapter: number,
  version: BibleVersion
): Promise<Chapter> {
  const key = `${bookId}:${chapter}:${version ?? ''}`;
  const cached = chapterCache.get(key);
  if (cached) return cached;
  const pending = requestChapter(bookId, bookName, chapter, version).then(ch => {
    if (ch.verses.length === 0) chapterCache.delete(key);
    return ch;
  });
  chapterCache.set(key, pending);
  return pending;
}

async function requestChapter(
  bookId: number,
  book: string,
  chapter: number,
  version: BibleVersion
): Promise<Chapter> {
  try {
    const data = await unwrap(
      getBibleBookByBookIdByChapterNumber({
        client: publicClient,
        path: { bookId, chapterNumber: chapter },
        query: { tagged: '1', ...(version ? { bible_version: version } : {}) },
      })
    );
    const bookObj = 'book' in data ? data.book : null;
    const ch = bookObj?.chapters[0];
    return {
      book: bookObj?.name || book,
      bookId,
      chapter,
      verses: (ch?.verses ?? []).map(v => ({
        number: v.verseNumber,
        text: v.text,
        ...(v.tokens ? { tokens: v.tokens } : {}),
      })),
      subtitles: ch?.subtitles ?? [],
    };
  } catch {
    return { book, bookId, chapter, verses: [] };
  }
}

// ─── Bible versions (discovery) ────────────────────────────────────────────
const _staticVersionByKey = new Map(bibleVersions.map(v => [v.key, v]));

/**
 * Fetch the available Bible versions from `GET /bible/versions`.
 *
 * Falls back to the static `bibleVersions` catalog when the endpoint is
 * unavailable (e.g. an environment whose backend hasn't run the ingest yet).
 *
 * For versions in our curated catalog, the catalog is the source of truth for
 * the display label and testament coverage — the discovery endpoint's
 * `version_name`/`testament_coverage` can be stale (e.g. UKRKL ships as
 * "(НЗ)" / "nt" but actually carries the full canon). The API still discovers
 * which versions exist and supplies license/attribution (backfilled from the
 * catalog when the API returns null, so the Credits screen always has the
 * required CC BY / BY-SA line).
 */
export async function fetchBibleVersions(): Promise<BibleVersionInfo[]> {
  try {
    const data = await unwrap(getBibleVersions({ client: publicClient }));
    const list = data.versions;
    if (list.length === 0) return bibleVersions;
    return list.map((v): BibleVersionInfo => {
      const fallback = _staticVersionByKey.get(v.version_key);
      const apiValue = v.version_name ? `${v.version_name} (${v.version_key})` : undefined;
      return {
        key: v.version_key,
        value: fallback?.value || apiValue || v.version_key,
        languageCode: v.language_code || fallback?.languageCode || 'en',
        license: v.license || fallback?.license,
        licenseUrl: v.license_url ?? fallback?.licenseUrl ?? null,
        attribution: v.attribution || fallback?.attribution || null,
        testamentCoverage: fallback?.testamentCoverage || (v.testament_coverage as TestamentCoverage),
      };
    });
  } catch {
    return bibleVersions;
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
  // Key by language so switching language refetches instead of serving the
  // previously-cached language. The backend localizes from the `lang` param
  // (falling back to the JWT claim, then the default).
  const lang = getPreferredLanguageCode();
  const key = `${bookId}:${chapter}:${lang}`;
  const existing = _explanationCache.get(key);
  if (existing) return existing;
  const promise = (async (): Promise<ExplanationCache> => {
    const [summary, byline, detailed] = await Promise.all([
      fetchExplanation(bookId, chapter, 'summary', lang),
      fetchExplanation(bookId, chapter, 'byline', lang),
      fetchExplanation(bookId, chapter, 'detailed', lang),
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

const _studyCache = new Map<string, Promise<InductiveStudy | null>>();

function isInductiveStudy(value: unknown): value is InductiveStudy {
  return typeof value === 'object' && value !== null && 'steps' in value && Array.isArray(value.steps);
}

/**
 * Fetch the inductive study for a chapter, localized to the current language
 * with English fallback. Mirrors fetchExplanation/loadExplanations: hits the
 * DB-backed study endpoint (which serves the translation for `lang` when one
 * exists, English otherwise) and, on any failure, falls back to the bundled
 * @versemate/studies content. Cached by `${bookId}:${chapter}:${lang}` so
 * switching language refetches.
 */
export async function fetchStudy(
  bookId: number,
  chapter: number,
  lang: string
): Promise<InductiveStudy | null> {
  const key = `${bookId}:${chapter}:${lang}`;
  const existing = _studyCache.get(key);
  if (existing) return existing;
  const promise = (async (): Promise<InductiveStudy | null> => {
    const fromApi = await unwrap(
      getBibleStudyByBookIdByChapterNumber({
        client: apiClient,
        path: { bookId, chapterNumber: chapter },
        query: { lang },
      })
    )
      .then(data => data.study?.content ?? null)
      .catch(() => null);
    if (isInductiveStudy(fromApi)) return fromApi;
    _studyCache.delete(key);
    return (await getStudyFor(bookId, chapter)) ?? null;
  })();
  _studyCache.set(key, promise);
  return promise;
}

/**
 * Fetch the DB-backed inductive-study UI chrome labels for a language. The
 * backend family-matches (`ro` ⇄ `ro-RO`) and returns null for English /
 * unknown languages. Returns the labels object (possibly partial) or null;
 * the caller (useStudyLabels) merges it over the bundled getStudyLabels
 * fallback so a missing key degrades to English rather than blanking.
 */
export async function fetchStudyLabels(
  lang: string
): Promise<Partial<StudyLabels> | null> {
  try {
    const data = await unwrap(getBibleStudyLabels({ client: apiClient, query: { lang } }));
    if (!data.labels) return null;
    const labels: Record<string, string> = {};
    for (const [name, value] of Object.entries(data.labels)) {
      if (typeof value === 'string') labels[name] = value;
    }
    return labels as Partial<StudyLabels>;
  } catch {
    return null;
  }
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
  explanationType: ExplanationType,
  lang: string
): Promise<ExplanationEntry> {
  try {
    const data = await unwrap(
      getBibleBookExplanationByBookIdByChapterNumber({
        client: apiClient,
        path: { bookId, chapterNumber: chapter },
        query: { explanationType, lang },
      })
    );
    const explanation = data.explanation;
    return {
      text: explanation?.explanation ?? '',
      id: explanation && explanation.explanation_id > 0 ? explanation.explanation_id : null,
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
  // Book name is `.+?` (any non-newline run), not ASCII `[\w\s]`, so localized
  // names with diacritics or non-Latin scripts (e.g. "Génesis", "創世記") parse.
  const re = /^##\s+.+?\s+\d+:(\d+)/gm;
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
/**
 * `knownBookId` lets a caller that already holds the id (the Jesus graph, the
 * topic references) skip the name lookup — and stay correct even if the book
 * name it was given doesn't match the book list verbatim.
 */
export async function fetchVerseInsights(
  book: string,
  chapter: number,
  knownBookId?: number
): Promise<VerseInsight[]> {
  const bookId = knownBookId || (await resolveBookId(book));
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
    // with the summary text so the insight screen still has content. The
    // summary is an { text, id } entry: passing the entry itself handed
    // VerseInsightSheet an object where it expects Markdown, and the crash
    // blanked the reader on any chapter without a By Line explanation.
    if (insights.length === 0 && cache.summary.text) {
      insights.push({
        verse: 1,
        crossReferences: extractCrossRefs(cache.summary.text),
        historicalContext: cache.summary.text,
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

export async function fetchAutoHighlights(
  book: string,
  chapter: number
): Promise<AutoHighlightRange[]> {
  const bookId = await resolveBookId(book);
  if (!bookId) return [];
  try {
    const resp = await unwrap(
      getBibleAutoHighlightsByBookIdByChapterNumber({
        client: publicClient,
        path: { book_id: String(bookId), chapter_number: String(chapter) },
      })
    );
    return resp.data.map(h => ({
      startVerse: h.start_verse,
      endVerse: h.end_verse,
      theme: h.theme_name,
      color: h.theme_color,
    }));
  } catch {
    return [];
  }
}

function topicLanguage(): { lang?: string } {
  const visit = getVisitLanguage();
  return visit ? { lang: visit } : {};
}

async function loadTopicIndex(): Promise<{ categories: string[]; topics: Topic[]; complete: boolean }> {
  const catResp = await unwrap(getTopicsCategories({ client: publicClient }));
  const categories = catResp.categories;
  const topics: Topic[] = [];
  let complete = true;
  for (const cat of categories) {
    const result = await unwrap(
      getTopicsSearch({ client: publicClient, query: { category: cat, ...topicLanguage() } })
    ).catch(() => null);
    if (!result) {
      complete = false;
      continue;
    }
    for (const t of result.topics) {
      topics.push({
        id: t.topic_id,
        name: t.name,
        description: t.description ?? '',
        category: cat,
      });
    }
  }
  return { categories, topics, complete };
}

export async function fetchTopicIndex(): Promise<Topic[] | null> {
  try {
    const { topics, complete } = await loadTopicIndex();
    return complete ? topics : null;
  } catch {
    return null;
  }
}

export async function fetchTopics(): Promise<Topic[]> {
  try {
    const { categories, topics } = await loadTopicIndex();
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

function referencesContentOf(references: { content: string } | null | undefined): string {
  return references?.content ?? '';
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
    const data = await unwrap(getTopicsByIdReferences({ client: publicClient, path: { id: topicId } }));
    return parseTopicReferencesMarkdown(referencesContentOf(data.references), topicId);
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
    const [data, refsRes] = await Promise.all([
      unwrap(
        getTopicsById({
          client: publicClient,
          path: { id: topicId },
          query: { ...(bibleVersion ? { bible_version: bibleVersion } : {}), ...topicLanguage() },
        })
      ).catch(() => null),
      unwrap(getTopicsByIdReferences({ client: publicClient, path: { id: topicId } })).catch(() => null),
    ]);

    const raw = data?.topic;
    const topic: Topic | null = raw
      ? {
          id: raw.topic_id,
          name: raw.name,
          description: raw.description ?? '',
          category: raw.category,
        }
      : null;
    const sections = parseTopicReferencesMarkdown(referencesContentOf(refsRes?.references), topicId);
    const explanation = {
      summary: data?.explanation.summary ?? '',
      byline: data?.explanation.byline ?? '',
      detailed: data?.explanation.detailed ?? '',
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

export class RefusedWriteError extends Error {
  constructor(public operation: string, public reason?: string) {
    super(reason ? `${operation} was refused: ${reason}` : `${operation} was refused`);
  }
}

function saved<T extends { success: boolean }>(operation: string, data: T): T {
  if (!data.success) throw new RefusedWriteError(operation);
  return data;
}

export async function fetchBookmarks(userId: string): Promise<Bookmark[] | null> {
  try {
    const data = await unwrap(getBibleBookBookmarksByUserId({ client: apiClient, path: { user_id: userId } }));
    return data.favorites.map(f => ({
      id: String(f.favorite_id),
      favoriteId: f.favorite_id,
      bookId: f.book_id,
      book: f.book_name,
      chapter: f.chapter_number,
      version: 'ESV' as BibleVersion,
    }));
  } catch {
    return null;
  }
}

interface BookmarkTarget {
  userId: string;
  bookId: number;
  chapter: number;
  insightType?: string;
}

function bookmarkBody(args: BookmarkTarget) {
  return {
    user_id: args.userId,
    book_id: args.bookId,
    chapter_number: args.chapter,
    ...(args.insightType ? { insight_type: args.insightType } : {}),
  };
}

export async function addBookmark(args: BookmarkTarget) {
  return saved('Bookmark add', await unwrap(postBibleBookBookmarkAdd({ client: apiClient, body: bookmarkBody(args) })));
}

export async function removeBookmark(args: BookmarkTarget) {
  return saved(
    'Bookmark removal',
    await unwrap(postBibleBookBookmarkRemove({ client: apiClient, body: bookmarkBody(args) }))
  );
}

export async function fetchNotes(userId: string): Promise<Note[] | null> {
  try {
    const data = await unwrap(getBibleBookNotesByUserId({ client: apiClient, path: { user_id: userId } }));
    return data.notes.map(n => ({
      id: n.note_id,
      bookId: n.book_id,
      book: n.book_name,
      chapter: n.chapter_number,
      verse: n.verse_number ?? 0,
      text: n.content,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }));
  } catch {
    return null;
  }
}

export async function addNote(args: {
  userId: string;
  bookId: number;
  chapter: number;
  verse: number;
  text: string;
}) {
  return saved(
    'Note add',
    await unwrap(
      postBibleBookNoteAdd({
        client: apiClient,
        body: {
          user_id: args.userId,
          book_id: args.bookId,
          chapter_number: args.chapter,
          ...(args.verse > 0 ? { verse_id: args.verse } : {}),
          content: args.text,
        },
      })
    )
  );
}

export async function updateNote(id: string, text: string) {
  return saved(
    'Note edit',
    await unwrap(putBibleBookNoteUpdate({ client: apiClient, body: { note_id: id, content: text } }))
  );
}

export async function removeNote(id: string) {
  return saved(
    'Note removal',
    await unwrap(deleteBibleBookNoteRemove({ client: apiClient, query: { note_id: id } }))
  );
}

export async function fetchHighlights(userId: string): Promise<Highlight[]> {
  try {
    const [data, books] = await Promise.all([
      unwrap(getBibleHighlightsByUserId({ client: apiClient, path: { user_id: userId } })),
      fetchBooks(),
    ]);
    const bookNameById = new Map(books.map(b => [b.bookId, b.name]));
    return data.highlights.map(h => {
      const selectedText = h.selected_text;
      return {
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
        ...(selectedText ? { selectedText } : {}),
        color: h.color,
        createdAt: h.created_at,
      };
    });
  } catch {
    return [];
  }
}

export interface SavedHighlight {
  highlightId: number;
  startVerse: number;
  endVerse: number;
  startChar: number | null;
  endChar: number | null;
  mergedHighlightIds: number[];
}

function savedHighlightOf(data: PostBibleHighlightAddResponse): SavedHighlight {
  if (!('highlight' in data) || !data.success) {
    throw new RefusedWriteError('Highlight add', 'error' in data ? data.error : undefined);
  }
  const h = data.highlight;
  return {
    highlightId: h.highlight_id,
    startVerse: h.start_verse,
    endVerse: h.end_verse,
    startChar: h.start_char,
    endChar: h.end_char,
    mergedHighlightIds: data.merged_highlight_ids ?? [],
  };
}

export async function addHighlight(h: {
  userId: string;
  bookId: number;
  chapter: number;
  startVerse: number;
  endVerse?: number;
  color: HighlightColor;
  startChar?: number | null;
  endChar?: number | null;
  selectedText?: string;
}): Promise<SavedHighlight> {
  const data = await unwrap(
    postBibleHighlightAdd({
      client: apiClient,
      body: {
        user_id: h.userId,
        book_id: h.bookId,
        chapter_number: h.chapter,
        start_verse: h.startVerse,
        end_verse: h.endVerse ?? h.startVerse,
        color: h.color,
        ...(typeof h.startChar === 'number' && typeof h.endChar === 'number'
          ? { start_char: h.startChar, end_char: h.endChar, selected_text: h.selectedText }
          : {}),
      },
    })
  );
  return savedHighlightOf(data);
}

export async function updateHighlight(highlightId: number, color: HighlightColor) {
  return saved(
    'Highlight recolour',
    await unwrap(
      putBibleHighlightByHighlightId({ client: apiClient, path: { highlight_id: highlightId }, body: { color } })
    )
  );
}

export async function removeHighlight(highlightId: number) {
  return saved(
    'Highlight removal',
    await unwrap(deleteBibleHighlightByHighlightId({ client: apiClient, path: { highlight_id: highlightId } }))
  );
}

export interface HighlightTheme {
  theme_id: number;
  name: string;
  color: string;
  description: string;
  is_active: boolean;
}

export async function fetchHighlightThemes(): Promise<HighlightTheme[]> {
  const body = await unwrap(getBibleHighlightThemes({ client: publicClient }));
  return body.data.map(t => ({
    theme_id: t.theme_id,
    name: t.name,
    color: t.color,
    description: t.description ?? '',
    is_active: t.is_active === true,
  }));
}

export async function fetchEnabledThemeIds(): Promise<Set<number>> {
  const body = await unwrap(getBibleUserThemePreferences({ client: apiClient }));
  return new Set(body.data.filter(p => p.is_enabled).map(p => p.theme_id));
}

export async function setThemeEnabled(themeId: number, isEnabled: boolean): Promise<void> {
  saved(
    'Highlight theme change',
    await unwrap(
      patchBibleUserThemePreferencesByThemeId({
        client: apiClient,
        path: { theme_id: String(themeId) },
        body: { is_enabled: isEnabled },
      })
    )
  );
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

async function startSession(accessToken: string, method: 'google' | 'apple' | 'email'): Promise<AuthUser> {
  setAccessToken(accessToken);
  const user = await fetchCurrentUser();
  identifyAfterAuth(accessToken, user.email, method);
  return user;
}

export async function signInWithSSO(provider: 'google' | 'apple', token: string): Promise<AuthUser> {
  const data = await unwrap(postAuthSso({ client: publicClient, body: { provider, token, platform: 'web' } }));
  return startSession(data.accessToken, provider);
}

export function exchangeSSOCode(code: string, verifier: string) {
  return unwrap(postAuthSsoExchange({ client: publicClient, body: { code, verifier } }));
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await unwrap(postAuthLogin({ client: publicClient, body: { email, password } }));
  return startSession(data.accessToken, 'email');
}

export interface SignupInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export async function signup({ email, password, firstName, lastName }: SignupInput): Promise<AuthUser> {
  const data = await unwrap(postAuthSignup({ client: publicClient, body: { email, password, firstName, lastName } }));
  return startSession(data.accessToken, 'email');
}

export async function logout(): Promise<void> {
  try {
    await unwrap(postAuthLogout({ client: quietClient, parseAs: 'text' }));
  } catch {
    clearTokens();
    return;
  }
  clearTokens();
}

export async function checkSession(): Promise<void> {
  await unwrap(getUserMe({ client: quietClient }));
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const [me, session] = await Promise.all([
    unwrap(getUserMe({ client: apiClient })),
    unwrap(getAuthSession({ client: apiClient })).catch(() => null),
  ]);
  return {
    id: me.id,
    email: me.email,
    name: me.fullName || me.firstName || undefined,
    avatarUrl: session?.imageSrc || undefined,
    firstName: me.firstName,
    lastName: me.lastName,
    hasPassword: session ? session.hasPassword : undefined,
    preferredLanguage: me.preferred_language || undefined,
  };
}

// ─── Profile / preferences / languages / delete account ───────────────────

export interface BibleLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export async function fetchBibleLanguages(): Promise<BibleLanguage[]> {
  const data = await unwrap(getBibleLanguages({ client: apiClient }));
  return data
    .map((l) => ({
      code: l.language_code,
      name: l.name,
      nativeName: l.native_name,
    }))
    .sort((a, b) => a.nativeName.localeCompare(b.nativeName));
}

/**
 * PUT /auth/profile — update first/last/email. A new email is not applied
 * until the user confirms it from the new inbox, so this resolves to the
 * address waiting for that confirmation, or null.
 */
export async function updateAuthProfile(body: {
  firstName: string;
  lastName: string;
  email: string;
}): Promise<string | null> {
  const data = await unwrap(putAuthProfile({ client: apiClient, body }));
  return data.pendingEmail || null;
}

/** GET /auth/session — the email change waiting for confirmation, or null. /user/me does not carry it. */
export async function fetchPendingEmail(): Promise<string | null> {
  const data = await unwrap(getAuthSession({ client: apiClient }));
  return data.pendingEmail || null;
}

/** PATCH /user/preferences — update preferred_language. */
export async function updateUserPreferredLanguage(languageCode: string): Promise<void> {
  await unwrap(patchUserPreferences({ client: apiClient, body: { preferred_language: languageCode } }));
}

interface DeleteAccountResult {
  ok: boolean;
  status: number;
  errorCode?: string;
  message?: string;
  retryAfterSeconds?: number;
}

function errorFields(body: unknown): Pick<DeleteAccountResult, 'errorCode' | 'message' | 'retryAfterSeconds'> {
  if (!body || typeof body !== 'object') return {};
  const { error, message, details } = body as { error?: unknown; message?: unknown; details?: unknown };
  const retryAfter =
    details && typeof details === 'object' ? (details as { retryAfter?: unknown }).retryAfter : undefined;
  return {
    errorCode: textOrUndefined(error),
    message: textOrUndefined(message),
    ...(typeof retryAfter === 'number' && retryAfter > 0 ? { retryAfterSeconds: retryAfter } : {}),
  };
}

export async function deleteAuthAccount(password?: string): Promise<DeleteAccountResult> {
  if (!getAccessToken()) return { ok: false, status: 401, errorCode: 'NOT_AUTHENTICATED' };
  try {
    const { response, error } = await deleteAccountRequest({
      client: apiClient,
      body: password ? { password } : {},
    });
    if (response.ok) return { ok: true, status: response.status };
    return { ok: false, status: response.status, ...errorFields(error) };
  } catch {
    return { ok: false, status: 0, errorCode: 'NETWORK_ERROR' };
  }
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
  /** When true, every verse containing words of Jesus is shown in red (red-letter). */
  redLetter: boolean;
  /** When false, tapping/clicking a verse does not open the Verse Insight sheet. */
  verseInsightsPopup: boolean;
  readingPlan: 'none' | 'daily' | 'chronological' | 'one-year';
  language: 'en' | 'es' | 'fr' | 'pt';
  offlineMode: boolean;
  hapticFeedback: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 20,
  lineSpacing: 1.7,
  theme: 'dark',
  // NASB1995 is the licensed English default. The backend now serves all the
  // open translations too (see GET /bible/versions); users switch via the
  // Settings picker. Fresh visits start on the English default.
  defaultVersion: 'NASB1995',
  notifications: true,
  showVerseNumbers: true,
  autoHighlights: false,
  redLetter: false,
  verseInsightsPopup: true,
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

  // 2026-05: harden auto-highlights to always default OFF. The v1 migration
  // above only pinned the value when it was `undefined`, so tablets/devices
  // that stored `autoHighlights: true` during the old default-true era kept
  // it on. There is no in-app toggle that writes this flag, so a one-time
  // unconditional reset to false is safe and matches the product decision
  // that auto-highlights are off by default everywhere.
  if (!ran['autoHighlights-force-off-v2']) {
    if (next.autoHighlights !== false) {
      next = { ...next, autoHighlights: false };
      saveJSON(STORAGE_KEYS.settings, { ...DEFAULT_SETTINGS, ...next });
    }
    ran['autoHighlights-force-off-v2'] = true;
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
    if (getAccessToken()) {
      unwrap(
        postUserRecentlyViewedBooksSync({
          client: apiClient,
          body: { books: next.map(r => ({ bookId: String(r.bookId), timestamp: r.timestamp })) },
        })
      ).catch(() => undefined);
    }
  } catch {
    /* ignore */
  }
}

// ─── Bible search ────────────────────────────────────────────────────────

export interface VerseSearchResult {
  /** "exact": the words in that order; "words": all words, any order. */
  match: 'exact' | 'words';
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  /** [start, end) ranges of `text` to show in bold. */
  highlights: [number, number][];
}

export interface VerseSearchResponse {
  results: VerseSearchResult[];
  nextCursor: string | null;
  /** First page only: totals across the whole Bible, filters ignored. */
  totals: { exact: number; words: number } | null;
  /** First page only: match count per book, filters ignored. */
  books: { bookId: number; name: string; testament: 'OT' | 'NT'; count: number }[] | null;
}

/**
 * Phrase / word search over the verses of one translation
 * (GET /bible/search). Pass `signal` to cancel a search the user has
 * already typed past.
 */
export async function searchVerses(params: {
  q: string;
  version: string;
  testament?: 'OT' | 'NT';
  book?: number;
  cursor?: string | null;
  signal?: AbortSignal;
}): Promise<VerseSearchResponse> {
  const data = await unwrap(
    getBibleSearch({
      client: publicClient,
      query: {
        q: params.q,
        bible_version: params.version,
        ...(params.testament ? { testament: params.testament } : {}),
        ...(params.book !== undefined ? { book: params.book } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
      },
      signal: params.signal,
    }),
  );
  return verseSearchOf(data);
}

function rangeOf(pair: [unknown, unknown]): [number, number] | null {
  const [start, end] = pair;
  return typeof start === 'number' && typeof end === 'number' ? [start, end] : null;
}

function verseSearchOf(data: GetBibleSearchResponse): VerseSearchResponse {
  return {
    results: data.results.map(r => ({
      match: r.match,
      bookId: r.bookId,
      bookName: r.bookName,
      chapter: r.chapter,
      verse: r.verse,
      text: r.text,
      highlights: r.highlights.map(rangeOf).filter((range): range is [number, number] => range !== null),
    })),
    nextCursor: data.nextCursor,
    totals: data.totals,
    books: data.books,
  };
}

const _bookNamesByVersion = new Map<string, Promise<Record<number, string>>>();

/**
 * The version's own book names (version_book_names, e.g. "Geneza" for VDC),
 * by book id, so the search box understands references typed in the
 * reader's language. Empty when the request fails; English names still work.
 */
export function fetchLocalizedBookNames(version: string): Promise<Record<number, string>> {
  let pending = _bookNamesByVersion.get(version);
  if (!pending) {
    pending = unwrap(getBibleTestaments({ client: publicClient, query: { bible_version: version } }))
      .then(data => Object.fromEntries(data.testaments.map(t => [t.b, t.n])))
      .catch(() => {
        _bookNamesByVersion.delete(version);
        return {};
      });
    _bookNamesByVersion.set(version, pending);
  }
  return pending;
}

// Legacy export that some screens may still use
export const AUTO_HIGHLIGHTS: Record<string, number[]> = {};

export { ApiError, API_BASE_URL };
