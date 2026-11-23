import { getCategorySlug } from '../lib/topicSlugs';
import { ApiUnavailable, type ApiGet } from './api';
import { DEFAULT_LANGUAGE, LANGUAGES, SITE_ORIGIN, type Language } from './config';
import { pageUrl } from './head';
import { chapterCovered, explainedIn, hasOwnExplanation, loadCoverage } from './indexing';
import { DAY } from './common';
import { listEvents, loadBooks, loadPage, loadTopicExplanation, loadTopicList, type EventPage } from './pageData';
import { escapeHtml } from './text';

const CONCURRENCY = 6;
const DATES_TTL = 60 * 60;

export async function mapLimited<T, R>(items: T[], run: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await run(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

interface Entry {
  loc: string;
  lastmod?: string;
}

interface Dates {
  chapters: Map<string, string>;
  events: Map<string, string>;
  topics: Map<string, string>;
}

const chapterKey = (bookId: number, chapter: number) => `${bookId}:${chapter}`;
const dayOf = (iso: string) => new Date(iso).toISOString().slice(0, 10);
const newest = (dates: Iterable<string>) => [...dates].sort().at(-1);

async function loadDates(api: ApiGet, lang: Language): Promise<Dates> {
  const data = await api('/bible/explanations/last-modified', { query: { lang } }, { ttl: DATES_TTL });
  if (!data || !Array.isArray(data.chapters) || !Array.isArray(data.events) || !Array.isArray(data.topics)) {
    throw new ApiUnavailable('/bible/explanations/last-modified: missing');
  }
  return {
    chapters: new Map(data.chapters.map((row) => [chapterKey(row.bookId, row.chapter), dayOf(row.lastModified)])),
    events: new Map(data.events.map((row) => [row.slug, dayOf(row.lastModified)])),
    topics: new Map(data.topics.map((row) => [row.topicId, dayOf(row.lastModified)])),
  };
}

function urlset(entries: Entry[]) {
  const lines = entries
    .map(({ loc, lastmod }) => `<url><loc>${escapeHtml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines}\n</urlset>\n`;
}

const KINDS = ['bible', 'jesus', 'topics'] as const;

export async function sitemapIndex(api: ApiGet, published: Language[]) {
  const dated = await Promise.all(published.map((lang) => loadDates(api, lang)));
  const children = published.flatMap((lang, index) => {
    const dates = dated[index];
    const newestOf = { bible: dates.chapters, jesus: dates.events, topics: dates.topics };
    return KINDS.map((kind) => ({ loc: `${SITE_ORIGIN}/sitemaps/${kind}-${lang}.xml`, lastmod: newest(newestOf[kind].values()) }));
  });
  const lines = children
    .map(({ loc, lastmod }) => `<sitemap><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</sitemap>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines}\n</sitemapindex>\n`;
}

export async function chapterUrls(api: ApiGet, lang: Language): Promise<Entry[]> {
  const [books, coverage, dates] = await Promise.all([loadBooks(api), loadCoverage(api), loadDates(api, lang)]);
  if (!coverage) throw new ApiUnavailable('coverage unavailable');
  const entries: Entry[] = [];
  for (const book of books) {
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      if (chapterCovered(coverage, lang, book.bookId, chapter)) {
        entries.push({
          loc: pageUrl(`/bible/${book.slug}/${chapter}`, lang),
          lastmod: dates.chapters.get(chapterKey(book.bookId, chapter)),
        });
      }
    }
  }
  return entries;
}

export interface Listed {
  id: string;
  title: string;
  path: string;
  languages: Language[];
}

export async function listedEvents(api: ApiGet, published: Language[]): Promise<Listed[]> {
  const events = await listEvents(api);
  const pages = await mapLimited(events, (event) => loadPage(api, { kind: 'event', slug: event.slug }, DEFAULT_LANGUAGE, published));
  return pages
    .filter((page): page is EventPage => page?.kind === 'event')
    .map((page) => ({
      id: page.slug,
      title: page.title,
      path: page.path,
      languages: published.filter((lang) => explainedIn(page, lang, null)),
    }))
    .filter((entry) => entry.languages.length > 0);
}

export async function listedTopics(api: ApiGet, published: Language[]) {
  const data = await api('/topics/categories', {}, { ttl: DAY });
  if (!data?.categories) throw new ApiUnavailable('/topics/categories: missing');
  const groups: { category: string; topics: Listed[] }[] = [];
  for (const category of data.categories) {
    const categorySlug = getCategorySlug(category);
    if (!categorySlug) continue;
    const topics = await loadTopicList(api, category);
    const listed = await mapLimited(topics, async (topic) => {
      const languages = [...new Set<Language>([DEFAULT_LANGUAGE, ...published])];
      const texts = await Promise.all(languages.map((lang) => loadTopicExplanation(api, topic.id, lang)));
      const explanations = Object.fromEntries(languages.map((lang, index) => [lang, texts[index]]));
      return {
        id: topic.id,
        title: topic.name,
        path: `/topic/${categorySlug}/${topic.slug}`,
        languages: published.filter((lang) => hasOwnExplanation(explanations, lang)),
      };
    });
    groups.push({ category, topics: listed.filter((entry) => entry.languages.length > 0) });
  }
  return groups;
}

function dated(entries: Listed[], lang: Language, dates: Map<string, string>): Entry[] {
  return entries
    .filter((entry) => entry.languages.includes(lang))
    .map((entry) => ({ loc: pageUrl(entry.path, lang), lastmod: dates.get(entry.id) }));
}

export function matchSitemap(pathname: string) {
  if (pathname === '/sitemap.xml') return { kind: 'index' as const };
  const child = pathname.match(/^\/sitemaps\/(bible|jesus|topics)-([A-Za-z-]+)\.xml$/);
  const lang = child && LANGUAGES.find((code) => code === child[2]);
  return lang ? { kind: child[1] as (typeof KINDS)[number], lang } : null;
}

export async function buildSitemap(
  match: NonNullable<ReturnType<typeof matchSitemap>>,
  api: ApiGet,
  published: Language[],
): Promise<string | null> {
  if (match.kind === 'index') return sitemapIndex(api, published);
  if (!published.includes(match.lang)) return null;
  if (match.kind === 'bible') return urlset(await chapterUrls(api, match.lang));
  const [listed, dates] = await Promise.all([
    match.kind === 'jesus'
      ? listedEvents(api, [match.lang])
      : listedTopics(api, [match.lang]).then((groups) => groups.flatMap((group) => group.topics)),
    loadDates(api, match.lang),
  ]);
  return urlset(dated(listed, match.lang, match.kind === 'jesus' ? dates.events : dates.topics));
}
