import type { Language } from './config';
import { pageName } from './head';
import { LABELS } from './labels';
import { markdownToHtml } from './markdown';
import type { PageData } from './pageData';
import { escapeHtml } from './text';

function section(title: string, body: string) {
  return `<section class="mt-8"><h2 class="section-subtitle">${escapeHtml(title)}</h2>${body}</section>`;
}

function list(items: string[]) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

export function renderArticle(data: PageData, lang: Language) {
  const labels = LABELS[lang];
  const parts = [`<header class="chapter-meta"><h1 class="chapter-title">${escapeHtml(pageName(data))}</h1></header>`];

  if (data.kind === 'chapter') {
    const verses = data.verses
      .map(
        (verse) =>
          `<span class="verse-span" id="v${verse.number}"><sup class="text-verse-number">${verse.number}</sup> ${escapeHtml(verse.text)}</span>`,
      )
      .join(' ');
    parts.push(`<div class="font-scripture"><p>${verses}</p></div>`);
    if (data.summary.trim()) parts.push(section(labels.summary, markdownToHtml(data.summary)));
    if (data.byline.trim()) parts.push(section(labels.verseByVerse, markdownToHtml(data.byline)));
  } else if (data.kind === 'event') {
    if (data.passages.length) parts.push(section(labels.passages, list(data.passages)));
    if (data.explanation.trim()) parts.push(section(labels.explanation, markdownToHtml(data.explanation)));
  } else {
    const passages = data.sections
      .map((entry) => `<h3 class="font-semibold mt-5 mb-2">${escapeHtml(entry.subtitle)}</h3>${list(entry.references)}`)
      .join('');
    if (data.sections.length) parts.push(section(labels.passages, passages));
    if (data.explanation.trim()) parts.push(section(labels.explanation, markdownToHtml(data.explanation)));
  }
  return `<article class="reading-inner">${parts.join('')}</article>`;
}
