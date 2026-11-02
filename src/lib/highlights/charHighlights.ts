/**
 * Highlights of some words in a verse, not the whole verse.
 *
 * A word highlight is stored as character offsets into its verse's text (`start_char` into the
 * start verse, `end_char` into the end verse) — the same shape the mobile app saves, so a word
 * highlighted on one shows on the other.
 *
 * The reader paints them with the CSS Custom Highlight API rather than by splitting the verse into
 * more spans: the verse text is already split into lexicon words (TokenizedVerse), and a range over
 * its text nodes marks any run of characters without touching that tree. A browser without the API
 * shows a word highlight on its whole verse instead (see `supportsCharHighlights`).
 */
import type { Highlight as SavedHighlight, HighlightColor } from '@/services/types';

/** The attribute on each verse's text span (ReadingScreen): offsets count from its start. */
export const VERSE_TEXT_ATTR = 'data-verse-text';

export function supportsCharHighlights(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    'highlights' in CSS &&
    typeof (globalThis as { Highlight?: unknown }).Highlight === 'function'
  );
}

/** A highlight that marks characters, not whole verses. */
export function isCharHighlight(h: Pick<SavedHighlight, 'startChar' | 'endChar'>): boolean {
  return typeof h.startChar === 'number' && typeof h.endChar === 'number';
}

/** The number of characters of `el`'s text before (`node`, `offset`). */
export function textOffsetWithin(el: Element, node: Node, offset: number): number {
  const range = document.createRange();
  range.selectNodeContents(el);
  try {
    range.setEnd(node, offset);
  } catch {
    return 0;
  }
  return range.toString().length;
}

/** A DOM range over characters [start, end) of `el`'s text, or null when out of bounds. */
export function rangeForTextOffsets(el: Element, start: number, end: number): Range | null {
  if (end <= start) return null;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let seen = 0;
  let started = false;
  let node = walker.nextNode() as Text | null;
  while (node) {
    const len = node.data.length;
    if (!started && start < seen + len) {
      range.setStart(node, start - seen);
      started = true;
    }
    if (started && end <= seen + len) {
      range.setEnd(node, end - seen);
      return range;
    }
    seen += len;
    node = walker.nextNode() as Text | null;
  }
  return null;
}

const NAME_PREFIX = 'vm-hl-';
const COLORS: HighlightColor[] = [
  'yellow', 'green', 'blue', 'pink', 'purple', 'orange', 'red', 'teal', 'brown',
];

/**
 * Paint every word highlight of this chapter over the verse text spans in `container`, one
 * registered highlight per colour (styled by `::highlight(vm-hl-<color>)` in index.css).
 */
export function paintCharHighlights(container: Element, highlights: SavedHighlight[]): void {
  if (!supportsCharHighlights()) return;
  const byColor = new Map<HighlightColor, Range[]>();
  const spans = new Map<number, Element>();
  for (const el of container.querySelectorAll(`[${VERSE_TEXT_ATTR}]`)) {
    const v = Number(el.getAttribute(VERSE_TEXT_ATTR));
    if (!Number.isNaN(v)) spans.set(v, el);
  }
  for (const h of highlights) {
    if (!isCharHighlight(h)) continue;
    const startVerse = h.startVerse ?? h.verse;
    const endVerse = h.endVerse ?? startVerse;
    for (let v = startVerse; v <= endVerse; v++) {
      const el = spans.get(v);
      if (!el) continue;
      const len = el.textContent?.length ?? 0;
      const from = v === startVerse ? (h.startChar as number) : 0;
      const to = v === endVerse ? Math.min(h.endChar as number, len) : len;
      const range = rangeForTextOffsets(el, from, to);
      if (!range) continue;
      const list = byColor.get(h.color) ?? [];
      list.push(range);
      byColor.set(h.color, list);
    }
  }
  for (const color of COLORS) {
    const ranges = byColor.get(color);
    if (ranges && ranges.length > 0) {
      CSS.highlights.set(NAME_PREFIX + color, new Highlight(...ranges));
    } else {
      CSS.highlights.delete(NAME_PREFIX + color);
    }
  }
}

export function clearCharHighlights(): void {
  if (!supportsCharHighlights()) return;
  for (const color of COLORS) CSS.highlights.delete(NAME_PREFIX + color);
}

/** Whether two highlights' extents overlap, counting characters where either has them. */
export function highlightsOverlap(
  a: { startVerse: number; endVerse: number; startChar?: number | null; endChar?: number | null },
  b: { startVerse: number; endVerse: number; startChar?: number | null; endChar?: number | null },
): boolean {
  // Positions as (verse, char); a whole-verse extent runs from char 0 to the verse's end.
  const INF = Number.MAX_SAFE_INTEGER;
  const aStart = [a.startVerse, a.startChar ?? 0];
  const aEnd = [a.endVerse, a.endChar ?? INF];
  const bStart = [b.startVerse, b.startChar ?? 0];
  const bEnd = [b.endVerse, b.endChar ?? INF];
  const lt = (x: number[], y: number[]) => x[0] < y[0] || (x[0] === y[0] && x[1] < y[1]);
  return lt(aStart, bEnd) && lt(bStart, aEnd);
}
