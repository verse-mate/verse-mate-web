import { escapeHtml, resolvePlaceholders } from './text';

function inline(text: string) {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

export function markdownToHtml(markdown: string, topLevel = 3) {
  const out: string[] = [];
  let paragraph: string[] = [];
  let quote: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) out.push(`<p>${inline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushQuote = () => {
    if (quote.length) out.push(`<blockquote class="border-l-2 border-[#b09a6d] pl-3 italic">${inline(quote.join(' '))}</blockquote>`);
    quote = [];
  };

  for (const raw of resolvePlaceholders(markdown).split('\n')) {
    const line = raw.trim();
    const heading = line.match(/^(#{1,3})\s*(.*)$/);
    if (!line) {
      flushParagraph();
      flushQuote();
    } else if (heading) {
      flushParagraph();
      flushQuote();
      const level = Math.min(6, topLevel + heading[1].length - 1);
      out.push(`<h${level} class="font-semibold mt-5 mb-2">${inline(heading[2])}</h${level}>`);
    } else if (line.startsWith('>')) {
      flushParagraph();
      quote.push(line.replace(/^>\s?/, ''));
    } else {
      flushQuote();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushQuote();
  return `<div class="space-y-2 text-foreground leading-relaxed">${out.join('')}</div>`;
}
