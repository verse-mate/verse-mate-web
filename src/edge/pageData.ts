import { getBookSlug, parseBookParam } from '../lib/bookSlugs';
import { generateTopicSlug, getCategoryFromSlug } from '../lib/topicSlugs';
import { ApiUnavailable, type ApiGet } from './api';
import { DAY } from './common';
import { DEFAULT_LANGUAGE, GUEST_VERSION, type Language } from './config';

export type PageRoute =
  | { kind: 'chapter'; bookParam: string; chapterParam: string }
  | { kind: 'event'; slug: string }
  | { kind: 'topic'; categorySlug: string; slug: string };

export interface RouteMatch {
  route: PageRoute;
  markdown: boolean;
}

export interface ChapterPage {
  kind: 'chapter';
  path: string;
  bookId: number;
  bookSlug: string;
  bookName: string;
  chapter: number;
  verses: { number: number; text: string }[];
  summary: string;
  byline: string;
}

export interface EventPage {
  kind: 'event';
  path: string;
  slug: string;
  title: string;
  passages: string[];
  explanation: string;
  explanations: Partial<Record<Language, string>>;
}

export interface TopicPage {
  kind: 'topic';
  path: string;
  topicId: string;
  category: string;
  categorySlug: string;
  slug: string;
  title: string;
  sections: { subtitle: string; references: string[] }[];
  explanation: string;
  explanations: Partial<Record<Language, string>>;
}

export type PageData = ChapterPage | EventPage | TopicPage;

export const ITEM_TTL = 60 * 60;
const EVENT_PAGE = 200;

const PATTERNS: [RegExp, (m: RegExpMatchArray) => PageRoute][] = [
  [/^\/bible\/([^/]+)\/([^/]+?)(\.md)?\/?$/, (m) => ({ kind: 'chapter', bookParam: m[1], chapterParam: m[2] })],
  [/^\/jesus\/event\/([^/]+?)(\.md)?\/?$/, (m) => ({ kind: 'event', slug: m[1] })],
  [/^\/topic\/([^/]+)\/([^/]+?)(\.md)?\/?$/, (m) => ({ kind: 'topic', categorySlug: m[1], slug: m[2] })],
];

export function matchPageRoute(pathname: string): RouteMatch | null {
  for (const [pattern, build] of PATTERNS) {
    const match = pathname.match(pattern);
    if (match) return { route: build(match), markdown: pathname.replace(/\/$/, '').endsWith('.md') };
  }
  return null;
}

interface Testament {
  b: number;
  n: string;
  c: number;
}

export async function loadBooks(api: ApiGet) {
  const data = await api<{ testaments?: Testament[] }>('/bible/testaments', { bible_version: GUEST_VERSION }, { ttl: DAY });
  const books = data?.testaments ?? [];
  if (books.length === 0) throw new ApiUnavailable('/bible/testaments: empty');
  return books
    .filter((book) => getBookSlug(book.b))
    .map((book) => ({ bookId: book.b, slug: getBookSlug(book.b) as string, name: book.n, chapters: book.c }));
}

function langQuery(lang: Language) {
  return lang === DEFAULT_LANGUAGE ? undefined : lang;
}

function languagesToRead(lang: Language, published: Language[]) {
  return [...new Set<Language>([lang, DEFAULT_LANGUAGE, ...published])];
}

async function explanationsIn<T>(languages: Language[], read: (language: Language) => Promise<T>) {
  const results = await Promise.all(languages.map(read));
  return new Map(languages.map((language, index) => [language, results[index]]));
}

async function loadChapter(api: ApiGet, route: Extract<PageRoute, { kind: 'chapter' }>, lang: Language): Promise<ChapterPage | null> {
  const bookId = /^\d+$/.test(route.bookParam) ? null : parseBookParam(route.bookParam);
  if (!bookId || !/^\d+$/.test(route.chapterParam)) return null;
  const chapter = Number.parseInt(route.chapterParam, 10);
  const book = (await loadBooks(api)).find((entry) => entry.bookId === bookId);
  if (!book || chapter < 1 || chapter > book.chapters) return null;

  type Explanation = { explanation?: { explanation?: string } | null };
  type ChapterText = { book?: { chapters?: { verses?: { verseNumber: number; text: string }[] }[] } };
  const [text, summary, byline] = await Promise.all([
    api<ChapterText>(`/bible/book/${bookId}/${chapter}`, { bible_version: GUEST_VERSION }),
    api<Explanation>(`/bible/book/explanation/${bookId}/${chapter}`, { explanationType: 'summary', lang: langQuery(lang) }),
    api<Explanation>(`/bible/book/explanation/${bookId}/${chapter}`, { explanationType: 'byline', lang: langQuery(lang) }),
  ]);
  const verses = (text?.book?.chapters?.[0]?.verses ?? []).map((verse) => ({ number: verse.verseNumber, text: verse.text }));
  if (verses.length === 0) throw new ApiUnavailable(`/bible/book/${bookId}/${chapter}: no verses`);

  return {
    kind: 'chapter',
    path: `/bible/${book.slug}/${chapter}`,
    bookId,
    bookSlug: book.slug,
    bookName: book.name,
    chapter,
    verses,
    summary: summary?.explanation?.explanation ?? '',
    byline: byline?.explanation?.explanation ?? '',
  };
}

interface EventDetail {
  event?: { slug: string; title: string; passages?: { display: string }[] };
  explanation?: { overview?: string };
}

async function loadEvent(api: ApiGet, slug: string, lang: Language, published: Language[]): Promise<EventPage | null> {
  const details = await explanationsIn(languagesToRead(lang, published), (language) =>
    api<EventDetail>(
      `/jesus/events/${encodeURIComponent(slug)}`,
      { bible_version: GUEST_VERSION, lang: langQuery(language) },
      { ttl: ITEM_TTL },
    ),
  );
  const detail = details.get(lang);
  if (!detail?.event) return null;
  const explanations: Partial<Record<Language, string>> = {};
  for (const [language, entry] of details) explanations[language] = entry?.explanation?.overview ?? '';
  return {
    kind: 'event',
    path: `/jesus/event/${detail.event.slug}`,
    slug: detail.event.slug,
    title: detail.event.title,
    passages: (detail.event.passages ?? []).map((passage) => passage.display),
    explanation: explanations[lang],
    explanations,
  };
}

export async function listEvents(api: ApiGet) {
  const events: { slug: string; title: string }[] = [];
  for (let offset = 0; ; offset += EVENT_PAGE) {
    const page = await api<{ events?: { slug: string; title: string }[]; total?: number }>(
      '/jesus/events',
      { limit: EVENT_PAGE, offset },
      { ttl: ITEM_TTL },
    );
    if (!page?.events) throw new ApiUnavailable('/jesus/events: missing');
    events.push(...page.events);
    if (page.events.length === 0 || events.length >= (page.total ?? 0)) return events;
  }
}

interface TopicSummary {
  topic_id?: string;
  id?: string;
  name: string;
  slug?: string;
}

export async function loadTopicList(api: ApiGet, category: string) {
  const data = await api<{ topics?: TopicSummary[] }>('/topics/search', { category, limit: 500 }, { ttl: DAY });
  if (!data) throw new ApiUnavailable(`/topics/search ${category}: missing`);
  return (data.topics ?? []).map((topic) => ({
    id: topic.topic_id || topic.id,
    name: topic.name,
    slug: topic.slug || generateTopicSlug(topic.name),
    generatedSlug: generateTopicSlug(topic.name),
  }));
}

export async function loadTopicExplanation(api: ApiGet, topicId: string, lang: Language) {
  const data = await api<{ explanation?: { explanation?: string } | null }>(
    `/topics/${topicId}/explanation`,
    { type: 'summary', lang: langQuery(lang) },
    { ttl: ITEM_TTL },
  );
  return data?.explanation?.explanation ?? '';
}

function parseTopicSections(content: string) {
  return content
    .split(/^##\s+/m)
    .filter((section) => section.trim())
    .map((section) => {
      const [subtitle = '', second = ''] = section.split('\n').map((line) => line.trim());
      const references = /^\(.+\)$/.test(second)
        ? second
            .slice(1, -1)
            .split(',')
            .map((reference) => reference.trim())
            .filter(Boolean)
        : [];
      return { subtitle, references };
    });
}

async function loadTopic(
  api: ApiGet,
  route: Extract<PageRoute, { kind: 'topic' }>,
  lang: Language,
  published: Language[],
): Promise<TopicPage | null> {
  const category = getCategoryFromSlug(route.categorySlug);
  if (!category) return null;
  const topic = (await loadTopicList(api, category)).find(
    (entry) => entry.slug === route.slug || entry.generatedSlug === route.slug,
  );
  if (!topic?.id) return null;

  const [texts, references] = await Promise.all([
    explanationsIn(languagesToRead(lang, published), (language) => loadTopicExplanation(api, topic.id, language)),
    api<{ references?: { content?: string } | null }>(`/topics/${topic.id}/references`),
  ]);
  const explanations = Object.fromEntries(texts) as Partial<Record<Language, string>>;
  return {
    kind: 'topic',
    path: `/topic/${route.categorySlug}/${topic.slug}`,
    topicId: topic.id,
    category,
    categorySlug: route.categorySlug,
    slug: topic.slug,
    title: topic.name,
    sections: parseTopicSections(references?.references?.content ?? ''),
    explanation: explanations[lang],
    explanations,
  };
}

export function loadPage(api: ApiGet, route: PageRoute, lang: Language, published: Language[] = []): Promise<PageData | null> {
  if (route.kind === 'chapter') return loadChapter(api, route, lang);
  if (route.kind === 'event') return loadEvent(api, route.slug, lang, published);
  return loadTopic(api, route, lang, published);
}
