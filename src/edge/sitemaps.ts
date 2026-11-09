import { getCategorySlug } from '../lib/topicSlugs';
import { ApiUnavailable, type ApiGet } from './api';
import { DEFAULT_LANGUAGE, LANGUAGES, SITE_ORIGIN, type Language } from './config';
import { pageUrl } from './head';
import { chapterCovered, explainedIn, hasOwnExplanation, loadCoverage } from './indexing';
import { DAY } from './common';
import { loadBooks, loadPage, loadTopicExplanation, loadTopicList } from './pageData';
import { escapeHtml } from './text';

const CONCURRENCY = 6;
const EVENT_PAGE = 200;

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

function urlset(urls: string[]) {
  const entries = urls.map((url) => `<url><loc>${escapeHtml(url)}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

export function sitemapIndex(published: Language[]) {
  const children = [...published.map((lang) => `/sitemaps/bible-${lang}.xml`), '/sitemaps/jesus.xml', '/sitemaps/topics.xml'];
  const entries = children.map((path) => `<sitemap><loc>${SITE_ORIGIN}${path}</loc></sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
}

export async function chapterUrls(api: ApiGet, lang: Language) {
  const [books, coverage] = await Promise.all([loadBooks(api), loadCoverage(api)]);
  if (!coverage) throw new ApiUnavailable('coverage unavailable');
  const urls: string[] = [];
  for (const book of books) {
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      if (chapterCovered(coverage, lang, book.bookId, chapter)) urls.push(pageUrl(`/bible/${book.slug}/${chapter}`, lang));
    }
  }
  return urls;
}

async function listEvents(api: ApiGet) {
  const events: { slug: string; title: string }[] = [];
  for (let offset = 0; ; offset += EVENT_PAGE) {
    const page = await api<{ events?: { slug: string; title: string }[]; total?: number }>(
      '/jesus/events',
      { limit: EVENT_PAGE, offset },
      { ttl: DAY },
    );
    if (!page?.events) throw new ApiUnavailable('/jesus/events: missing');
    events.push(...page.events);
    if (page.events.length === 0 || events.length >= (page.total ?? 0)) return events;
  }
}

export interface Listed {
  title: string;
  path: string;
  languages: Language[];
}

export async function listedEvents(api: ApiGet, published: Language[]): Promise<Listed[]> {
  const events = await listEvents(api);
  const pages = await mapLimited(events, (event) => loadPage(api, { kind: 'event', slug: event.slug }, DEFAULT_LANGUAGE, published));
  return pages
    .filter((page) => page !== null)
    .map((page) => ({ title: page.title, path: page.path, languages: published.filter((lang) => explainedIn(page, lang, null)) }))
    .filter((entry) => entry.languages.length > 0);
}

export async function listedTopics(api: ApiGet, published: Language[]) {
  const data = await api<{ categories?: string[] }>('/topics/categories', {}, { ttl: DAY });
  if (!data?.categories) throw new ApiUnavailable('/topics/categories: missing');
  const groups: { category: string; topics: Listed[] }[] = [];
  for (const category of data.categories) {
    const categorySlug = getCategorySlug(category);
    if (!categorySlug) continue;
    const topics = (await loadTopicList(api, category)).filter((topic) => topic.id);
    const listed = await mapLimited(topics, async (topic) => {
      const languages = [...new Set<Language>([DEFAULT_LANGUAGE, ...published])];
      const texts = await Promise.all(languages.map((lang) => loadTopicExplanation(api, topic.id as string, lang)));
      const explanations = Object.fromEntries(languages.map((lang, index) => [lang, texts[index]]));
      return {
        title: topic.name,
        path: `/topic/${categorySlug}/${topic.slug}`,
        languages: published.filter((lang) => hasOwnExplanation(explanations, lang)),
      };
    });
    groups.push({ category, topics: listed.filter((entry) => entry.languages.length > 0) });
  }
  return groups;
}

function expand(entries: Listed[]) {
  return entries.flatMap((entry) => entry.languages.map((lang) => pageUrl(entry.path, lang)));
}

export function matchSitemap(pathname: string) {
  if (pathname === '/sitemap.xml') return { kind: 'index' as const };
  if (pathname === '/sitemaps/jesus.xml') return { kind: 'jesus' as const };
  if (pathname === '/sitemaps/topics.xml') return { kind: 'topics' as const };
  const bible = pathname.match(/^\/sitemaps\/bible-([A-Za-z-]+)\.xml$/);
  const lang = bible && LANGUAGES.find((code) => code === bible[1]);
  return lang ? { kind: 'bible' as const, lang } : null;
}

export async function buildSitemap(
  match: NonNullable<ReturnType<typeof matchSitemap>>,
  api: ApiGet,
  published: Language[],
): Promise<string | null> {
  if (match.kind === 'index') return sitemapIndex(published);
  if (match.kind === 'bible') return published.includes(match.lang) ? urlset(await chapterUrls(api, match.lang)) : null;
  if (match.kind === 'jesus') return urlset(expand(await listedEvents(api, published)));
  return urlset(expand((await listedTopics(api, published)).flatMap((group) => group.topics)));
}

