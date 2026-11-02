import { useState, useEffect, useCallback, useRef } from 'react';
import { Copy, Check, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import ShareIcon from '@/components/ShareIcon';
import { useApp } from '@/contexts/AppContext';
import { fetchChapterById } from '@/services/bibleService';
import { Highlight, HighlightColor } from '@/services/types';
import {
  VERSE_TEXT_ATTR,
  highlightsOverlap,
  isCharHighlight,
  textOffsetWithin,
} from '@/lib/highlights/charHighlights';
import {
  HIGHLIGHT_ALL_CONFIRM_ABOVE,
  canHighlightAll,
  collectBookOccurrences,
} from '@/lib/highlights/highlightAll';

const HIGHLIGHT_COLORS: { color: HighlightColor; hex: string }[] = [
  { color: 'yellow', hex: 'var(--hl-swatch-yellow, #FFEB3B)' },
  { color: 'green', hex: '#4CAF50' },
  { color: 'blue', hex: '#2196F3' },
  { color: 'pink', hex: '#E91E63' },
  { color: 'purple', hex: '#9C27B0' },
  { color: 'orange', hex: '#FF9800' },
  { color: 'red', hex: '#F44336' },
  { color: 'teal', hex: '#009688' },
];

/**
 * What a colour highlights (the same choice as the mobile app's highlight sheet):
 * - `verse`: the whole verse(s) the selection touches — the default
 * - `selection`: just the selected words
 * - `book`: every place the selected words occur in this book ("All in John": a study method for
 *   a book's repeated words and phrases, like "I am" in John)
 */
export type HighlightScope = 'verse' | 'selection' | 'book';

/** Where the selection starts and ends, as verses and offsets into their text. */
interface SelectionExtent {
  startVerse: number;
  endVerse: number;
  /** Offset into the start verse's text, inclusive. */
  startChar: number;
  /** Offset into the end verse's text, exclusive. */
  endChar: number;
  /** The selection covers its verses whole. */
  wholeVerses: boolean;
  /** The selected words, from the verse text alone (no verse numbers). */
  words: string;
  /**
   * The words "All in <book>" looks for: the selection widened to whole words, so dragging
   * over most of "darkness" still means "darkness".
   */
  phrase: string;
}

interface Props {
  book: string;
  chapter: number;
  bookId: number;
  /** Chapters in this book, for "All in <book>". */
  chapterCount: number;
  /** Open a note on this verse, quoting the selected words. */
  onNote?: (verse: number, quote: string) => void;
  /**
   * The display-only yellow mark from a search (not a saved highlight). When
   * the selection touches it, the trash button clears it too, so every yellow
   * line on the page can be removed from this menu.
   */
  searchMark?: { start: number; end: number } | null;
  onClearSearchMark?: () => void;
}

/**
 * SelectionToolbar — floating toolbar that appears above selected text on desktop.
 * Shows highlight color dots, the highlight scope (whole verse / selection / all in book), and
 * copy, share and note actions.
 */
export default function SelectionToolbar({
  book,
  chapter,
  bookId,
  chapterCount,
  onNote,
  searchMark,
  onClearSearchMark,
}: Props) {
  const { state, dispatch, addHighlight, updateHighlight, removeHighlight } = useApp();
  // `below`: the bar sits under the selection instead of above it.
  const [position, setPosition] = useState<{ x: number; y: number; below: boolean } | null>(null);
  // How the last selection was made. A finger drag (iPad, touch laptop) also
  // raises the browser's own Copy / Look Up callout, which iOS and Chrome
  // place ABOVE the selection — right where this bar goes — so it covered the
  // highlight colors. For touch the bar goes below the selection instead.
  const lastPointerRef = useRef<string>('mouse');
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      lastPointerRef.current = e.pointerType || 'mouse';
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, []);
  const [selectedText, setSelectedText] = useState('');
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [extent, setExtent] = useState<SelectionExtent | null>(null);
  const [scope, setScope] = useState<HighlightScope>('verse');
  const [copied, setCopied] = useState(false);

  const checkSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setPosition(null);
      // Every new selection starts on the whole verse, whatever the last one chose.
      setScope('verse');
      return;
    }

    const text = sel.toString().trim();
    setSelectedText(text);

    // Find which verses are in the selection by looking at sup elements
    const range = sel.getRangeAt(0);
    const asElement = (n: Node | null) => (n instanceof Element ? n : n?.parentElement ?? null);
    const parent = asElement(range.commonAncestorContainer);
    if (!parent) {
      setPosition(null);
      return;
    }

    // Walk up to find the font-scripture container. A drag that starts in the
    // verses but ends past them (on the chapter-end link, the margin, a
    // section heading outside the column) has a common ancestor ABOVE the
    // scripture, which used to drop the bar and leave only the browser's own
    // menu. Either end of the selection being in the scripture is enough.
    const scriptureContainer =
      parent.closest('.font-scripture') ??
      asElement(range.startContainer)?.closest('.font-scripture') ??
      asElement(range.endContainer)?.closest('.font-scripture') ??
      null;
    if (!scriptureContainer) {
      setPosition(null);
      return;
    }

    // Collect every verse the selection touches. We intersect against the
    // verse-level wrapper (`span[data-verse]` — set in ReadingScreen) rather
    // than the small `<sup>` numerals at the start of each verse, because a
    // selection that begins mid-text in verse N never contains N's <sup>
    // even when the rest of N is selected. Walking [data-verse] catches the
    // first verse in the range too.
    const verses: number[] = [];
    const verseSpans = scriptureContainer.querySelectorAll<HTMLElement>('span[data-verse]');
    for (const v of verseSpans) {
      if (range.intersectsNode(v)) {
        const num = parseInt(v.getAttribute('data-verse') || '', 10);
        if (!isNaN(num)) verses.push(num);
      }
    }
    // Fallback for older render paths: walk the <sup> numerals as before.
    if (verses.length === 0) {
      const allSups = scriptureContainer.querySelectorAll('sup');
      for (const sup of allSups) {
        if (sel.containsNode(sup, true)) {
          const num = parseInt(sup.textContent || '', 10);
          if (!isNaN(num)) verses.push(num);
        }
      }
    }
    // Last-resort: single-verse selections that don't cross any markup
    // boundary — derive the verse from the start container's nearest
    // [data-verse] ancestor.
    if (verses.length === 0) {
      const verseSpan = parent.closest('span[data-verse]');
      if (verseSpan) {
        const num = parseInt(verseSpan.getAttribute('data-verse') || '', 10);
        if (!isNaN(num)) verses.push(num);
      }
    }
    setSelectedVerses(verses);
    setExtent(selectionExtent(range, scriptureContainer));

    // Position the toolbar above the selection — or below it for a touch
    // selection (see lastPointerRef), or when there's no room above (the
    // first line under the header), where it would be clipped off-screen.
    const rect = range.getBoundingClientRect();
    const TOOLBAR_ROOM = 132;
    const below = lastPointerRef.current === 'touch' || rect.top - TOOLBAR_ROOM < 8;
    const half = 150; // about half the toolbar's width: keep it on screen
    const x = Math.min(Math.max(rect.left + rect.width / 2, half + 8), window.innerWidth - half - 8);
    setPosition({ x, y: below ? rect.bottom + (lastPointerRef.current === 'touch' ? 28 : 8) : rect.top - 8, below });
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', checkSelection);
    return () => document.removeEventListener('selectionchange', checkSelection);
  }, [checkSelection]);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const toolbar = document.getElementById('selection-toolbar');
      if (toolbar && !toolbar.contains(e.target as Node)) {
        // Small delay to allow the selection to be processed
        setTimeout(() => {
          const sel = window.getSelection();
          if (!sel || sel.isCollapsed) setPosition(null);
        }, 100);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleCopy = async () => {
    const quoteText = selectedVerses.length > 0
      ? `"${selectedText}" — ${book} ${chapter}:${selectedVerses.join('-')}`
      : `"${selectedText}" — ${book} ${chapter}`;
    try {
      await navigator.clipboard.writeText(quoteText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = quoteText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleShare = async () => {
    const quoteText = selectedVerses.length > 0
      ? `"${selectedText}" — ${book} ${chapter}:${selectedVerses.join('-')}`
      : `"${selectedText}" — ${book} ${chapter}`;
    try {
      await navigator.share?.({ title: `${book} ${chapter}`, text: quoteText, url: window.location.href });
    } catch {
      handleCopy();
    }
  };

  const chapterHighlights = state.highlights.filter(
    h => h.bookId === bookId && h.chapter === chapter,
  );
  const extentOf = (h: Highlight) => ({
    startVerse: h.startVerse ?? h.verse,
    endVerse: h.endVerse ?? h.verse,
    startChar: isCharHighlight(h) ? h.startChar : null,
    endChar: isCharHighlight(h) ? h.endChar : null,
  });

  // Saved highlights the selection touches, character by character: a word highlighted
  // elsewhere in the verse is not touched. The Remove button removes these.
  const overlapping = extent
    ? chapterHighlights.filter(h => highlightsOverlap(extentOf(h), extent))
    : [];

  // The selection touches the search mark (display-only yellow).
  const marksSelection =
    !!searchMark &&
    selectedVerses.length > 0 &&
    Math.min(...selectedVerses) <= searchMark.end &&
    Math.max(...selectedVerses) >= searchMark.start;

  const offerAll = !!extent && canHighlightAll(extent.phrase, extent.startVerse, extent.endVerse);

  // What the trash on "All in <book>" removes: when the selection sits inside a word highlight
  // ("Son of" in a highlighted "Son of Man"), every highlight of those highlighted words;
  // otherwise every highlight of the selected words.
  const removalPhrase = (() => {
    if (!extent) return '';
    for (const h of overlapping) {
      if (!isCharHighlight(h)) continue;
      const verse = h.startVerse ?? h.verse;
      if ((h.endVerse ?? verse) !== verse) continue;
      const el = document.querySelector(`[${VERSE_TEXT_ATTR}="${verse}"]`);
      const words = (
        el?.textContent?.slice(h.startChar as number, h.endChar as number) ?? h.selectedText ?? ''
      ).trim();
      if (words) return words;
    }
    return extent.phrase;
  })();
  const activeScope: HighlightScope = scope === 'book' && !offerAll ? 'verse' : scope;

  const close = () => {
    setPosition(null);
    setScope('verse');
    window.getSelection()?.removeAllRanges();
  };

  /** Save a new highlight: through the API when signed in, in memory only when not. */
  const saveHighlight = async (h: Omit<Highlight, 'id' | 'createdAt'>) => {
    if (state.isSignedIn) {
      await addHighlight(h);
    } else {
      // Signed-out: ephemeral, in-memory only. Dropped on passage change
      // (see SET_PASSAGE in AppContext). Never persisted to API or
      // localStorage.
      dispatch({
        type: 'ADD_HIGHLIGHT',
        highlight: {
          ...h,
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
        },
      });
    }
  };

  const recolor = async (h: Highlight, color: HighlightColor) => {
    if (h.color === color) return;
    if (state.isSignedIn) await updateHighlight(h.id, color);
    else dispatch({ type: 'UPDATE_HIGHLIGHT', id: h.id, color });
  };

  /** Every place `phrase` occurs in this book, read chapter by chapter. */
  const findInBook = (phrase: string) =>
    collectBookOccurrences({
      phrase,
      chapterCount,
      loadChapter: async ch => {
        const data = await fetchChapterById(bookId, book, ch, state.version);
        return data.verses.length > 0
          ? data.verses.map(v => ({ verseNumber: v.number, text: v.text }))
          : null;
      },
    });

  /** "All in <book>": every place the selected words occur in this book, in one colour. */
  const highlightAllInBook = async (phrase: string, color: HighlightColor) => {
    const toastId = toast.loading(`Finding \u201C${phrase}\u201D in ${book}\u2026`);
    const { occurrences, missingChapters } = await findInBook(phrase);
    if (occurrences.length === 0) {
      toast.info(`\u201C${phrase}\u201D was not found in ${book}`, { id: toastId });
      return;
    }
    if (
      occurrences.length > HIGHLIGHT_ALL_CONFIRM_ABOVE &&
      !window.confirm(
        `Highlight ${occurrences.length} places?\n\n\u201C${phrase}\u201D appears ${occurrences.length} times in ${book}.`,
      )
    ) {
      toast.dismiss(toastId);
      return;
    }
    // Places already highlighted in this colour are left as they are.
    const fresh = occurrences.filter(
      o =>
        !state.highlights.some(
          h =>
            h.bookId === bookId &&
            h.chapter === o.chapter &&
            h.color === color &&
            highlightsOverlap(extentOf(h), {
              startVerse: o.verse,
              endVerse: o.verse,
              startChar: o.start,
              endChar: o.end,
            }),
        ),
    );
    let next = 0;
    const worker = async () => {
      while (next < fresh.length) {
        const o = fresh[next++];
        try {
          await saveHighlight({
            bookId,
            book,
            chapter: o.chapter,
            verse: o.verse,
            startVerse: o.verse,
            endVerse: o.verse,
            startChar: o.start,
            endChar: o.end,
            selectedText: o.text,
            color,
          });
        } catch {
          /* one place failed; the rest still save */
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, fresh.length) }, worker));
    const partial = missingChapters.length > 0 ? ' (some chapters could not be read)' : '';
    toast.success(
      `Highlighted ${occurrences.length} ${occurrences.length === 1 ? 'place' : 'places'} in ${book}${partial}`,
      { id: toastId },
    );
  };

  const handleHighlight = async (color: HighlightColor) => {
    if (!extent) return;
    const target = { ...extent };
    const phrase = activeScope === 'book' ? extent.phrase : extent.words;
    close();
    try {
      if (activeScope === 'book') {
        await highlightAllInBook(phrase, color);
        return;
      }
      // A selection of whole verses is a whole-verse highlight.
      const words = activeScope === 'selection' && !target.wholeVerses;
      if (words) {
        const same = chapterHighlights.find(h => {
          const e = extentOf(h);
          return (
            e.startVerse === target.startVerse &&
            e.endVerse === target.endVerse &&
            e.startChar === target.startChar &&
            e.endChar === target.endChar
          );
        });
        if (same) {
          await recolor(same, color);
          return;
        }
        await saveHighlight({
          bookId,
          book,
          chapter,
          verse: target.startVerse,
          startVerse: target.startVerse,
          endVerse: target.endVerse,
          startChar: target.startChar,
          endChar: target.endChar,
          selectedText: phrase,
          color,
        });
        return;
      }
      // Whole verse: recolor a whole-verse highlight already over these verses, else add one.
      const existing = chapterHighlights.find(
        h =>
          !isCharHighlight(h) &&
          highlightsOverlap(extentOf(h), {
            startVerse: target.startVerse,
            endVerse: target.endVerse,
          }),
      );
      if (existing) {
        await recolor(existing, color);
        return;
      }
      await saveHighlight({
        bookId,
        book,
        chapter,
        verse: target.startVerse,
        startVerse: target.startVerse,
        endVerse: target.endVerse,
        color,
      });
    } catch {
      toast.error('Could not save the highlight');
    }
  };

  /**
   * The trash button on "All in <book>": removes the word highlights on every place the selected
   * words occur in this book — what "All in <book>" highlighted, in whatever colour. No confirm:
   * the toast says how many went.
   */
  const removeAllInBook = async (phrase: string) => {
    const toastId = toast.loading(`Finding \u201C${phrase}\u201D highlights in ${book}\u2026`);
    const { occurrences, missingChapters } = await findInBook(phrase);
    const places = new Set(occurrences.map(o => `${o.chapter}:${o.verse}:${o.start}:${o.end}`));
    const targets = state.highlights.filter(h => {
      if (h.bookId !== bookId || !isCharHighlight(h)) return false;
      const startVerse = h.startVerse ?? h.verse;
      if ((h.endVerse ?? startVerse) !== startVerse) return false;
      return places.has(`${h.chapter}:${startVerse}:${h.startChar}:${h.endChar}`);
    });
    if (targets.length === 0) {
      toast.info(`No \u201C${phrase}\u201D highlights in ${book}`, { id: toastId });
      return;
    }
    let removed = 0;
    for (const h of targets) {
      try {
        if (state.isSignedIn) await removeHighlight(h.id);
        else dispatch({ type: 'REMOVE_HIGHLIGHT', id: h.id });
        removed++;
      } catch {
        /* one failed; the rest still go */
      }
    }
    const partial = missingChapters.length > 0 ? ' (some chapters could not be read)' : '';
    toast.success(
      `Removed ${removed} ${removed === 1 ? 'highlight' : 'highlights'} in ${book}${partial}`,
      { id: toastId },
    );
  };

  const handleRemove = async () => {
    if (activeScope === 'book' && extent) {
      const phrase = removalPhrase;
      close();
      await removeAllInBook(phrase);
      return;
    }
    const targets = overlapping;
    close();
    try {
      for (const h of targets) {
        if (state.isSignedIn) await removeHighlight(h.id);
        else dispatch({ type: 'REMOVE_HIGHLIGHT', id: h.id });
      }
      if (marksSelection) onClearSearchMark?.();
    } catch { /* ignore */ }
  };

  const handleNote = () => {
    if (!extent || !onNote) return;
    const { startVerse, words } = extent;
    close();
    onNote(startVerse, words);
  };

  const scopeLabel = (value: HighlightScope) => {
    if (value === 'verse') {
      return extent && extent.startVerse !== extent.endVerse ? 'Whole verses' : 'Whole verse';
    }
    if (value === 'selection') return 'Selection';
    return `All in ${book}`;
  };
  const scopes: HighlightScope[] = offerAll ? ['verse', 'selection', 'book'] : ['verse', 'selection'];

  if (!position) return null;

  return (
    <div
      id="selection-toolbar"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: position.below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
        zIndex: 60,
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 12,
        padding: '8px 10px',
        boxShadow: '0 8px 24px rgba(27,27,27,0.16)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minWidth: 200,
      }}
      // preventDefault keeps the text selection while a scope is picked: a
      // collapsed selection would close the bar.
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {/* Highlight colors row + remove (when an existing highlight overlaps the selection) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
        {HIGHLIGHT_COLORS.map(({ color, hex }) => (
          <button
            key={color}
            onClick={() => handleHighlight(color)}
            data-testid={`selection-color-${color}`}
            title={state.isSignedIn ? `Highlight ${color}` : `Highlight ${color} (sign in to save)`}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: hex,
              border: '2px solid var(--card-border)',
              cursor: 'pointer',
              opacity: 1,
              padding: 0,
            }}
          />
        ))}
        {/* Remove (un-highlight) — only shows when the current selection
            overlaps an existing highlight, so users have a clear way to
            undo without going through the long-press / right-panel flow. */}
        {(overlapping.length > 0 || marksSelection || activeScope === 'book') && (
          <button
            data-testid="selection-remove-highlight"
            onClick={handleRemove}
            title={
              activeScope === 'book' && extent
                ? `Remove every \u201C${removalPhrase}\u201D highlight in ${book}`
                : 'Remove highlight'
            }
            aria-label={
              activeScope === 'book' && extent
                ? `Remove every \u201C${removalPhrase}\u201D highlight in ${book}`
                : 'Remove highlight'
            }
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: 'transparent',
              border: '1px solid var(--card-border)',
              cursor: 'pointer',
              padding: 0,
              marginLeft: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--fg-secondary)',
            }}
          >
            <Trash2 size={11} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Highlight scope: what a colour highlights */}
      <div
        role="radiogroup"
        aria-label="Highlight"
        data-testid="selection-scope"
        style={{
          display: 'flex',
          gap: 2,
          padding: 2,
          borderRadius: 8,
          backgroundColor: 'var(--hover-bg)',
        }}
      >
        {scopes.map(value => {
          const selected = value === activeScope;
          return (
            <button
              key={value}
              role="radio"
              aria-checked={selected}
              data-testid={`selection-scope-${value}`}
              onClick={() => setScope(value)}
              title={
                value === 'book' && extent
                  ? `Highlight every \u201C${extent.phrase}\u201D in ${book}`
                  : undefined
              }
              style={{
                flex: value === 'book' ? '1.4 1 0' : '1 1 0',
                padding: '5px 8px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor: selected ? 'var(--card-bg)' : 'transparent',
                boxShadow: selected ? '0 1px 3px rgba(27,27,27,0.14)' : 'none',
                color: selected ? 'var(--fg-primary)' : 'var(--fg-secondary)',
                fontFamily: 'Roboto, sans-serif',
                fontSize: 12,
                fontWeight: selected ? 600 : 400,
              }}
            >
              {scopeLabel(value)}
            </button>
          );
        })}
      </div>

      {/* Action buttons row */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={handleCopy}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '6px 8px',
            borderRadius: 8,
            backgroundColor: 'var(--hover-bg)',
            border: 'none',
            cursor: 'pointer',
            color: copied ? 'var(--vm-dust)' : 'var(--fg-primary)',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 12,
          }}
        >
          {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.5} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={handleShare}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '6px 8px',
            borderRadius: 8,
            backgroundColor: 'var(--hover-bg)',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--fg-primary)',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 12,
          }}
        >
          <ShareIcon size={13} color="var(--fg-primary)" />
          Share
        </button>
        <button
          onClick={handleNote}
          disabled={!onNote}
          data-testid="selection-note"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '6px 8px',
            borderRadius: 8,
            backgroundColor: 'var(--hover-bg)',
            border: 'none',
            cursor: onNote ? 'pointer' : 'not-allowed',
            color: 'var(--fg-primary)',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 12,
            opacity: onNote ? 1 : 0.5,
          }}
        >
          <FileText size={13} strokeWidth={1.5} />
          Note
        </button>
      </div>

      {/* Arrow pointing at the selection */}
      <div style={{
        position: 'absolute',
        ...(position.below ? { top: -6 } : { bottom: -6 }),
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        ...(position.below ? { borderBottom: '6px solid #1e1e1e' } : { borderTop: '6px solid #1e1e1e' }),
      }} />
    </div>
  );
}

/**
 * Where `range` starts and ends in the verse text: the first and last verse with selected text,
 * and offsets into each (trimmed of surrounding spaces). Verse numbers and the space between
 * verses do not count. Null when no verse text is selected.
 */
function selectionExtent(range: Range, container: Element): SelectionExtent | null {
  const picked: { verse: number; start: number; end: number; text: string }[] = [];
  for (const el of container.querySelectorAll(`[${VERSE_TEXT_ATTR}]`)) {
    if (!range.intersectsNode(el)) continue;
    const verse = Number(el.getAttribute(VERSE_TEXT_ATTR));
    if (Number.isNaN(verse)) continue;
    const text = el.textContent ?? '';
    const start = el.contains(range.startContainer)
      ? textOffsetWithin(el, range.startContainer, range.startOffset)
      : 0;
    const end = el.contains(range.endContainer)
      ? textOffsetWithin(el, range.endContainer, range.endOffset)
      : text.length;
    if (end > start && text.slice(start, end).trim()) picked.push({ verse, start, end, text });
  }
  if (picked.length === 0) return null;
  const first = picked[0];
  const last = picked[picked.length - 1];
  let startChar = first.start;
  while (startChar < first.text.length && /\s/.test(first.text[startChar])) startChar++;
  let endChar = last.end;
  while (endChar > 0 && /\s/.test(last.text[endChar - 1])) endChar--;
  const words = picked
    .map((p, i) =>
      p.text.slice(i === 0 ? startChar : p.start, i === picked.length - 1 ? endChar : p.end),
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  // Widen a one-verse selection to whole words for "All in <book>".
  let phrase = words;
  if (first === last && endChar > startChar) {
    const isWord = (ch: string | undefined) => !!ch && /[\p{L}\p{N}'’]/u.test(ch);
    let from = startChar;
    let to = endChar;
    while (from > 0 && isWord(first.text[from - 1]) && isWord(first.text[from])) from--;
    while (to < first.text.length && isWord(first.text[to]) && isWord(first.text[to - 1])) to++;
    phrase = first.text.slice(from, to).replace(/\s+/g, ' ').trim();
  }
  return {
    startVerse: first.verse,
    endVerse: last.verse,
    startChar,
    endChar,
    phrase,
    wholeVerses:
      first.text.slice(0, startChar).trim() === '' && last.text.slice(endChar).trim() === '',
    words,
  };
}
