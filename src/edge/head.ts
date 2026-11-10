import { DEFAULT_LANGUAGE, ORGANIZATION_ID, SITE_ORIGIN, type Language } from './config';
import type { Indexing } from './indexing';
import { LABELS } from './labels';
import type { PageData } from './pageData';
import { escapeHtml, firstParagraph, jsonForScript, truncate } from './text';

export const DEFAULT_CARD = `${SITE_ORIGIN}/og/default.png`;
const DESCRIPTION_LENGTH = 160;

export interface Head {
  lang: Language;
  title: string;
  description: string;
  canonical: string;
  image: string;
  imageAlt: string;
  noindex: boolean;
  alternates: { hreflang: string; href: string }[];
  jsonLd: unknown;
}

export function pageUrl(path: string, lang: Language) {
  return `${SITE_ORIGIN}${path}${lang === DEFAULT_LANGUAGE ? '' : `?lang=${encodeURIComponent(lang)}`}`;
}

export function pageName(data: PageData) {
  return data.kind === 'chapter' ? `${data.bookName} ${data.chapter}` : data.title;
}

export function cardUrl(data: PageData, lang: Language) {
  if (data.kind !== 'chapter') return DEFAULT_CARD;
  return pageUrl(`/og/bible/${data.bookSlug}/${data.chapter}.png`, lang);
}

function explanationText(data: PageData) {
  return data.kind === 'chapter' ? data.summary : data.explanation;
}

function breadcrumb(data: PageData, lang: Language, canonical: string) {
  const labels = LABELS[lang];
  const section =
    data.kind === 'chapter'
      ? { name: data.bookName, item: pageUrl(`/bible/${data.bookSlug}/1`, lang) }
      : data.kind === 'event'
        ? { name: labels.jesus, item: pageUrl('/jesus', lang) }
        : { name: labels.categories[data.category] ?? data.category, item: pageUrl('/topics', lang) };
  const items = [{ name: 'VerseMate', item: 'https://versemate.org/' }, section, { name: pageName(data), item: canonical }];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, index) => ({ '@type': 'ListItem', position: index + 1, ...entry })),
  };
}

export function buildHead(data: PageData, lang: Language, indexing: Indexing): Head {
  const labels = LABELS[lang];
  const name = pageName(data);
  const canonical = pageUrl(data.path, lang);
  const fromText = indexing.explained ? truncate(firstParagraph(explanationText(data)), DESCRIPTION_LENGTH) : '';
  const fallback = data.kind === 'chapter' ? labels.chapterDescription(name) : labels.pageDescription(name);
  const description = fromText || fallback;
  const title = data.kind === 'chapter' ? labels.chapterTitle(name) : labels.explainedTitle(name);
  const image = cardUrl(data, lang);

  const alternates: Head['alternates'] = indexing.alternates.map((language) => ({ hreflang: language, href: pageUrl(data.path, language) }));
  if (indexing.alternates.includes(DEFAULT_LANGUAGE)) {
    alternates.push({ hreflang: 'x-default', href: pageUrl(data.path, DEFAULT_LANGUAGE) });
  }

  return {
    lang,
    title,
    description,
    canonical,
    image,
    imageAlt: name,
    noindex: !indexing.indexable,
    alternates,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        breadcrumb(data, lang, canonical),
        {
          '@type': 'CreativeWork',
          '@id': `${canonical}#work`,
          name: labels.work(name),
          headline: labels.work(name),
          description,
          inLanguage: lang,
          url: canonical,
          image,
          isAccessibleForFree: true,
          publisher: { '@type': 'NGO', '@id': ORGANIZATION_ID, name: 'VerseMate', url: 'https://versemate.org/' },
        },
      ],
    },
  };
}

function attribute(value: string) {
  return escapeHtml(value);
}

export function headExtras(head: Head) {
  const lines = [
    `<link rel="canonical" href="${attribute(head.canonical)}">`,
    `<meta property="og:url" content="${attribute(head.canonical)}">`,
    `<meta property="og:locale" content="${LABELS[head.lang].locale}">`,
    ...head.alternates.map((alt) => `<link rel="alternate" hreflang="${alt.hreflang}" href="${attribute(alt.href)}">`),
    head.noindex ? '<meta name="robots" content="noindex">' : '',
    `<script type="application/ld+json">${jsonForScript(head.jsonLd)}</script>`,
  ];
  return lines.filter(Boolean).join('');
}

type Rewriter = {
  on(selector: string, handlers: { element(element: RewrittenElement): void }): Rewriter;
  transform(response: Response): Response;
};
type RewrittenElement = {
  setAttribute(name: string, value: string): void;
  setInnerContent(content: string, options?: { html: boolean }): void;
  append(content: string, options?: { html: boolean }): void;
};

export function rewritePage(shell: Response, head: Head, article: string): Response {
  const Rewriter = (globalThis as unknown as { HTMLRewriter: new () => Rewriter }).HTMLRewriter;
  const content: Record<string, string> = {
    'meta[name="description"]': head.description,
    'meta[property="og:type"]': 'article',
    'meta[property="og:title"]': head.title,
    'meta[property="og:description"]': head.description,
    'meta[property="og:image"]': head.image,
    'meta[property="og:image:alt"]': head.imageAlt,
    'meta[name="twitter:title"]': head.title,
    'meta[name="twitter:description"]': head.description,
    'meta[name="twitter:image"]': head.image,
  };
  let rewriter = new Rewriter()
    .on('html', { element: (element) => element.setAttribute('lang', head.lang) })
    .on('title', { element: (element) => element.setInnerContent(head.title) })
    .on('head', { element: (element) => element.append(headExtras(head), { html: true }) })
    .on('#root', { element: (element) => element.setInnerContent(article, { html: true }) });
  for (const [selector, value] of Object.entries(content)) {
    rewriter = rewriter.on(selector, { element: (element) => element.setAttribute('content', value) });
  }
  return rewriter.transform(shell);
}
