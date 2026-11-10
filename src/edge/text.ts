const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (char) => ENTITIES[char]);
}

export function resolvePlaceholders(markdown: string) {
  return markdown.replace(/\{(?:verse|chapter):([^}]+)\}/g, '$1');
}

export function plainInline(text: string) {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
}

export function firstParagraph(markdown: string) {
  const lines: string[] = [];
  for (const raw of resolvePlaceholders(markdown).split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('>')) {
      if (lines.length) break;
      continue;
    }
    lines.push(line);
  }
  return plainInline(lines.join(' ')).replace(/\s+/g, ' ').trim();
}

export function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max / 2 ? cut.slice(0, space) : cut).replace(/[\s,;:.]+$/, '')}…`;
}

export function firstSentence(text: string, max: number) {
  const match = text.match(/^.+?[.!?](?=\s|$)/);
  return truncate(match ? match[0] : text, max);
}

export function jsonForScript(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
