import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { vmTokens } from '@/styles/themeStyles';
import { holdVerseInsightWhileCardOpen, suppressVerseInsightClick } from '@/lib/verseInsightGuard';
import { lookupEnglishWord, type EnglishDefinition } from '@/services/englishDictionary';

/**
 * Right-click any word in a verse for its English definition.
 *
 * Words the Greek/Hebrew lexicon matched already open their lexical card on
 * right-click (LexiconPopover, which stops the event). Every other word used
 * to fall through to the browser's own menu, so a verse like Psalm 90:5 —
 * aligned against BSB's wording, not NASB's — had no definitions at all.
 * Mobile answers those words from Easton's / Webster's; this is the same on
 * web.
 *
 * One handler on the verse text rather than a component per word: the word
 * under the pointer is found from the click position, so plain text stays
 * plain text.
 *
 * Mouse only. On touch, a hold on plain text is the verse's own long-press
 * (verse actions), which this leaves alone.
 */

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: vmTokens.gold,
  textTransform: 'uppercase',
  marginBottom: 4,
};

const SOURCE_LABEL: Record<EnglishDefinition['source'], string> = {
  easton: "Easton's Bible Dictionary",
  webster: "Webster's Dictionary (1913)",
};

const WORD_CHAR = /[\p{L}\p{M}'’-]/u;

interface WordAtPoint {
  word: string;
  rect: DOMRect;
}

/** The word under a viewport point, with its on-screen box. */
export function wordAtPoint(x: number, y: number): WordAtPoint | null {
  let node: Node | null = null;
  let offset = 0;
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
  };
  if (typeof doc.caretPositionFromPoint === 'function') {
    const pos = doc.caretPositionFromPoint(x, y);
    if (pos) {
      node = pos.offsetNode;
      offset = pos.offset;
    }
  } else if (typeof document.caretRangeFromPoint === 'function') {
    const range = document.caretRangeFromPoint(x, y);
    if (range) {
      node = range.startContainer;
      offset = range.startOffset;
    }
  }
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  const text = node.textContent ?? '';

  let start = offset;
  let end = offset;
  while (start > 0 && WORD_CHAR.test(text[start - 1])) start--;
  while (end < text.length && WORD_CHAR.test(text[end])) end++;
  // Quotes and hyphens hug words but aren't part of them ("’Return", "away—").
  while (start < end && /['’-]/.test(text[start])) start++;
  while (end > start && /['’-]/.test(text[end - 1])) end--;
  const word = text.slice(start, end);
  if (!word || !/\p{L}/u.test(word)) return null;

  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end);
  const rect = range.getBoundingClientRect();
  // The caret APIs snap to the nearest text even from the gap between lines
  // or the margin; only claim a word the pointer is actually on.
  const slop = 2;
  if (
    x < rect.left - slop ||
    x > rect.right + slop ||
    y < rect.top - slop ||
    y > rect.bottom + slop
  ) {
    return null;
  }
  return { word, rect };
}

type LookupState =
  | { status: 'loading' }
  | { status: 'done'; result: EnglishDefinition | null };

interface Props {
  /** Off for non-English translations: these dictionaries define English words. */
  enabled: boolean;
  children: React.ReactNode;
}

export default function EnglishWordDefinitions({ enabled, children }: Props) {
  const [target, setTarget] = useState<WordAtPoint | null>(null);
  const [lookup, setLookup] = useState<LookupState>({ status: 'loading' });
  const contentRef = useRef<HTMLDivElement>(null);
  const open = target !== null;

  const anchorRef = useMemo(
    () => ({ current: { getBoundingClientRect: () => target?.rect ?? new DOMRect() } }),
    [target],
  );

  // Safari on macOS selects the word under the cursor on the right-button
  // mousedown, before contextmenu fires, so every right-click would look like
  // one on selected text. Judge by whether a selection existed before it.
  const hadSelectionRef = useRef<boolean | null>(null);
  const hasSelection = () => {
    const sel = window.getSelection();
    return !!sel && !sel.isCollapsed && sel.toString().trim().length > 0;
  };
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const secondary = e.button === 2 || (e.button === 0 && e.ctrlKey);
    hadSelectionRef.current = secondary ? hasSelection() : null;
  }, []);

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;
      const hadSelection = hadSelectionRef.current ?? hasSelection();
      hadSelectionRef.current = null;
      // With text selected, the browser menu (Copy, …) is what the reader wants.
      if (hadSelection) return;
      const hit = wordAtPoint(e.clientX, e.clientY);
      if (!hit) return;
      e.preventDefault();
      e.stopPropagation();
      window.getSelection()?.removeAllRanges();
      suppressVerseInsightClick();
      setTarget(hit);
    },
    [enabled],
  );

  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    setLookup({ status: 'loading' });
    lookupEnglishWord(target.word)
      .then((result) => {
        if (!cancelled) setLookup({ status: 'done', result });
      })
      .catch(() => {
        if (!cancelled) setLookup({ status: 'done', result: null });
      });
    return () => {
      cancelled = true;
    };
  }, [target]);

  // While the card is open, a click on the scripture behind it only closes it.
  useEffect(() => {
    if (!open) return;
    return holdVerseInsightWhileCardOpen();
  }, [open]);

  // The anchor is a fixed screen box, so close rather than float off the word
  // when the page scrolls (scrolling inside the card is fine).
  useEffect(() => {
    if (!open) return;
    const onScroll = (e: Event) => {
      const el = contentRef.current;
      if (el && e.target instanceof Node && el.contains(e.target)) return;
      setTarget(null);
    };
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [open]);

  const result = lookup.status === 'done' ? lookup.result : null;

  return (
    <>
      <span onMouseDown={onMouseDown} onContextMenu={onContextMenu}>
        {children}
      </span>
      {open && (
        <Popover open onOpenChange={(o) => !o && setTarget(null)}>
          <PopoverAnchor virtualRef={anchorRef} />
          <PopoverContent
            ref={contentRef}
            align="center"
            side={target.rect.top > window.innerHeight - target.rect.bottom ? 'top' : 'bottom'}
            sideOffset={6}
            collisionPadding={6}
            avoidCollisions
            data-testid="english-word-definition"
            className="w-[360px] p-0 border-0 shadow-2xl"
            style={{
              backgroundColor: vmTokens.surfaceRaisedBg,
              color: vmTokens.textPrimary,
              border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
              fontFamily: 'Roboto, sans-serif',
              maxHeight: 'min(420px, var(--radix-popover-content-available-height))',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
            }}
            onPointerDownOutside={() => suppressVerseInsightClick()}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '11px 14px 8px',
                borderBottom: `1px solid ${vmTokens.divider}`,
                backgroundColor: vmTokens.surfaceRaisedBg,
                position: 'sticky',
                top: 0,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 600, lineHeight: '22px' }}>{target.word}</div>
              {result && (
                <div style={{ marginTop: 3, fontSize: 12, color: vmTokens.textTertiary }}>
                  {SOURCE_LABEL[result.source]}
                </div>
              )}
            </div>
            <div style={{ padding: '9px 14px 12px' }}>
              {lookup.status === 'loading' && (
                <p style={{ margin: 0, fontSize: 14, color: vmTokens.textSecondary }}>
                  Looking up definition…
                </p>
              )}
              {lookup.status === 'done' && !result && (
                <p style={{ margin: 0, fontSize: 14, color: vmTokens.textSecondary }}>
                  No definition found for “{target.word}”.
                </p>
              )}
              {result && (
                <>
                  {result.formOf && (
                    <p
                      style={{
                        margin: '0 0 6px',
                        fontSize: 12,
                        fontStyle: 'italic',
                        color: vmTokens.textTertiary,
                      }}
                    >
                      {result.formOf}
                    </p>
                  )}
                  <div style={SECTION_LABEL_STYLE}>{result.term}</div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      lineHeight: '20px',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {result.definition}
                  </p>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
