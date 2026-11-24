import { DEFAULT_LANGUAGE, SITE_ORIGIN, type Language } from './config';
import { LABELS } from './labels';
import type { ChapterRef, PageData } from './pageData';

export const WEBSITE_ORIGIN = 'https://versemate.org';

export interface NavLink {
  text: string;
  href: string;
  rel?: 'prev' | 'next';
}

export interface PageNavigation {
  chapters: NavLink[];
  assistantsLabel: string;
  assistants: NavLink[];
}

export const LLMS_LINKS: NavLink[] = [
  { text: 'app.versemate.org/llms.txt', href: `${SITE_ORIGIN}/llms.txt` },
  { text: 'versemate.org/llms.txt', href: `${WEBSITE_ORIGIN}/llms.txt` },
];

export function bookPageUrl(slug: string) {
  return `${WEBSITE_ORIGIN}/bible/${slug}/`;
}

export function pageNavigation(data: PageData, lang: Language, target: { origin: string; suffix: string }): PageNavigation {
  const labels = LABELS[lang];
  const query = lang === DEFAULT_LANGUAGE ? '' : `?lang=${encodeURIComponent(lang)}`;
  const chapterHref = (ref: ChapterRef) => `${target.origin}/bible/${ref.slug}/${ref.chapter}${target.suffix}${query}`;
  const chapters: NavLink[] = [];
  if (data.kind === 'chapter') {
    if (data.previous) {
      chapters.push({ text: labels.previousChapter(`${data.previous.name} ${data.previous.chapter}`), href: chapterHref(data.previous), rel: 'prev' });
    }
    if (data.next) {
      chapters.push({ text: labels.nextChapter(`${data.next.name} ${data.next.chapter}`), href: chapterHref(data.next), rel: 'next' });
    }
    chapters.push({ text: labels.allChapters(data.bookName), href: bookPageUrl(data.bookSlug) });
  }
  return { chapters, assistantsLabel: labels.forAssistants, assistants: LLMS_LINKS };
}

export const HTML_TARGET = { origin: '', suffix: '' };
export const MARKDOWN_TARGET = { origin: SITE_ORIGIN, suffix: '.md' };
