import { DEFAULT_LANGUAGE, SITE_ORIGIN, type Language } from './config';
import { pageName } from './head';
import { LABELS } from './labels';
import { listedEvents, listedTopics } from './sitemaps';
import type { ApiGet } from './api';
import { bookPageUrl, MARKDOWN_TARGET, pageNavigation, type NavLink } from './navigation';
import { loadBooks, type PageData } from './pageData';
import { resolvePlaceholders } from './text';

function shiftHeadings(markdown: string, by: number) {
  return resolvePlaceholders(markdown)
    .trim()
    .replace(/^(#{1,6})(?=\s)/gm, (hashes) => '#'.repeat(Math.min(6, hashes.length + by)));
}

function section(title: string, body: string) {
  return `## ${title}\n\n${body}`;
}

function markdownLink(link: NavLink) {
  return `[${link.text.replace(/[[\]]/g, '')}](${link.href})`;
}

function navigation(data: PageData, lang: Language) {
  const nav = pageNavigation(data, lang, MARKDOWN_TARGET);
  const assistants = `${nav.assistantsLabel} ${nav.assistants.map(markdownLink).join(', ')}`;
  if (!nav.chapters.length) return assistants;
  return `${nav.chapters.map((link) => `- ${markdownLink(link)}`).join('\n')}\n\n${assistants}`;
}

export function pageMarkdown(data: PageData, lang: Language) {
  const labels = LABELS[lang];
  const parts = [`# ${pageName(data)}`];
  if (data.kind === 'chapter') {
    parts.push(data.verses.map((verse) => `**${verse.number}** ${verse.text}`).join('\n\n'));
    if (data.summary.trim()) parts.push(section(labels.summary, shiftHeadings(data.summary, 2)));
    if (data.byline.trim()) parts.push(section(labels.verseByVerse, shiftHeadings(data.byline, 2)));
  } else if (data.kind === 'event') {
    if (data.passages.length) parts.push(section(labels.passages, data.passages.map((p) => `- ${p}`).join('\n')));
    if (data.explanation.trim()) parts.push(section(labels.explanation, shiftHeadings(data.explanation, 2)));
  } else {
    const passages = data.sections
      .map((entry) => `### ${entry.subtitle}\n\n${entry.references.map((reference) => `- ${reference}`).join('\n')}`)
      .join('\n\n');
    if (data.sections.length) parts.push(section(labels.passages, passages));
    if (data.explanation.trim()) parts.push(section(labels.explanation, shiftHeadings(data.explanation, 2)));
  }
  parts.push(navigation(data, lang));
  return `${parts.join('\n\n')}\n`;
}

const ABOUT =
  'VerseMate is a free Bible reading companion. Every chapter comes with its text, a summary and a verse-by-verse explanation, ' +
  'and the life of Jesus and Bible topics are explained the same way.';

export async function llmsTxt(api: ApiGet) {
  const english: Language[] = [DEFAULT_LANGUAGE];
  const [books, events, topics] = await Promise.all([loadBooks(api), listedEvents(api, english), listedTopics(api, english)]);
  const link = (title: string, path: string) => `- [${title.replace(/[[\]]/g, '')}](${SITE_ORIGIN}${path}.md)`;
  const categories = LABELS[DEFAULT_LANGUAGE].categories;

  const lines = [
    '# VerseMate',
    '',
    `> ${ABOUT}`,
    '',
    'Links to app.versemate.org are the Markdown versions of VerseMate pages. The same page is at the address without `.md`.',
    'Links to versemate.org/bible/ are book pages: HTML pages that list every chapter of a book.',
    '',
    ...books.flatMap((book) => [
      `## ${book.name}`,
      '',
      `[${LABELS[DEFAULT_LANGUAGE].allChapters(book.name).replace(/[[\]]/g, '')}](${bookPageUrl(book.slug)})`,
      ...Array.from({ length: book.chapters }, (_, index) => link(`${book.name} ${index + 1}`, `/bible/${book.slug}/${index + 1}`)),
      '',
    ]),
    `## ${LABELS[DEFAULT_LANGUAGE].jesus}`,
    '',
    ...events.map((event) => link(event.title, event.path)),
    '',
    '## Topics',
  ];
  for (const group of topics) {
    if (!group.topics.length) continue;
    lines.push('', `### ${categories[group.category] ?? group.category}`, '', ...group.topics.map((topic) => link(topic.title, topic.path)));
  }
  return `${lines.join('\n')}\n`;
}
