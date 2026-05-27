import { useCallback, useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { LexEntry, AlignedToken } from '@versemate/lexicon';
import { vmTokens } from '@/styles/themeStyles';
import { usePreferredLanguage } from '@/hooks/usePreferredLanguage';
import { fetchLemmaCard, apiCardToLexEntry } from '@/services/lemmaApi';

// Hebrew + Aramaic block (U+0590-U+05FF) — if a lemma contains any character
// in this range, render it RTL. Greek lemmas have no Hebrew chars so the
// detection is unambiguous, and a lemma like רוּחַ + macroned-Latin translit
// in the same line still flows correctly via unicode-bidi: isolate.
const HEBREW_RE = /[֐-׿]/;
function isHebrew(text: string): boolean {
  return HEBREW_RE.test(text);
}

interface LexiconPopoverProps {
  surface: string;
  entry: LexEntry;
  token: AlignedToken;
  children: React.ReactNode;
  /**
   * When false, the word stays tappable (opens the lexical card) but renders
   * WITHOUT the dotted underline. Used to de-emphasize common / low-importance
   * words so the underlines focus attention on the distinctive ones.
   */
  underline?: boolean;
  onActivate?: () => void;
}

// Renders a tappable verse word that opens a Layer-1 lexical card.
// All six sections render in a fixed order so every card has the same
// visual rhythm: header → in-this-verse → basic → semantic range →
// related → note → loaded caveat. Sections present only when their data
// exists. Click events stop propagation so the parent verse span's
// tap handler (which opens VerseInsightSheet) doesn't fire at the same time.

// Brand-constant gold (identical across themes) + a token reference for the
// section body color so the popover follows the app's theme. The gold tint
// for the highlight wash works as-is on both light and dark surfaces.
const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: vmTokens.gold,
  textTransform: 'uppercase',
  marginBottom: 6,
};

const SECTION_BODY_STYLE: React.CSSProperties = {
  fontSize: 14,
  lineHeight: '20px',
  color: vmTokens.textPrimary,
  margin: 0,
};

function Section({
  label,
  highlight,
  children,
}: {
  label: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${vmTokens.divider}`,
        backgroundColor: highlight ? 'rgba(176, 154, 109, 0.07)' : 'transparent',
      }}
    >
      <div style={SECTION_LABEL_STYLE}>{label}</div>
      {children}
    </div>
  );
}

export default function LexiconPopover({
  surface,
  entry,
  token,
  children,
  underline = true,
  onActivate,
}: LexiconPopoverProps) {
  const contextual = token.contextual;

  // Controlled so we can dismiss the card when the Bible scrolls behind it.
  const [open, setOpen] = useState(false);

  // Language-aware lemma card. English users render the bundled `entry`
  // verbatim and never hit the network; non-English users fetch the
  // translated card and merge it over the bundled English baseline (which
  // shows instantly, then upgrades when the translation lands).
  const lang = usePreferredLanguage();
  const [renderEntry, setRenderEntry] = useState<LexEntry>(entry);
  const [isTranslated, setIsTranslated] = useState(false);

  useEffect(() => {
    // English (or a token with no Strong's): render the bundled entry, never
    // touch the network.
    if (lang === 'en' || !entry.strongs) {
      setRenderEntry(entry);
      setIsTranslated(false);
      return;
    }
    // Non-English: only fetch once the card is actually opened. A popover is
    // mounted for every underlined word in the chapter, so fetching on mount
    // would fire one request per word; gating on `open` limits it to the word
    // the user taps (cached thereafter, so re-opening is instant).
    if (!open) return;

    // Show the bundled entry immediately so the card is never blank, then
    // overlay the translation once it resolves.
    setRenderEntry(entry);
    setIsTranslated(false);
    let cancelled = false;
    fetchLemmaCard(entry.strongs, lang).then((card) => {
      if (cancelled || !card) return;
      const merged: LexEntry = { ...entry, ...apiCardToLexEntry(card) };
      // The API drops the Greek script on related words — restore it from the
      // bundled entry by position. When the API ships no related at all, keep
      // the bundled related untouched.
      if (card.related && card.related.length > 0) {
        merged.related = card.related.map((r, i) => ({
          lemma: entry.related?.[i]?.lemma ?? '',
          translit: r.translit,
          note: r.note,
        }));
      } else {
        merged.related = entry.related;
      }
      setRenderEntry(merged);
      setIsTranslated(card.is_translated);
    });
    return () => {
      cancelled = true;
    };
  }, [open, entry, lang]);

  // Don't let a drag-to-select gesture pop the lexical card. On desktop the
  // verse text is real, selectable text and releasing a highlight drag often
  // lands on a word — that click would otherwise open this card and steal
  // focus, collapsing the selection before the highlight toolbar can act.
  // When a non-empty selection exists, refuse to open (a plain click leaves
  // the selection collapsed, so normal taps still open the card).
  const handleOpenChange = useCallback((next: boolean) => {
    if (next) {
      const sel = typeof window !== 'undefined' ? window.getSelection() : null;
      if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) return;
    }
    setOpen(next);
  }, []);
  // Free-drag offset applied on top of Radix's anchored position, so the user
  // can move the card out of the way (e.g. when zoomed in and it's tall).
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(
    null,
  );
  const contentRef = useRef<HTMLDivElement>(null);

  // Re-center on the word each time the card opens (clear any prior drag).
  useEffect(() => {
    if (open) setDrag({ x: 0, y: 0 });
  }, [open]);

  // Dismiss on background scroll. Radix's avoid-collision/reposition logic
  // otherwise makes the card slide and flip while the reading body scrolls
  // underneath it. Ignore scrolls that originate inside the card itself so
  // its own internal overflow scrolling doesn't close it.
  useEffect(() => {
    if (!open) return;
    const onScroll = (e: Event) => {
      const el = contentRef.current;
      if (el && e.target instanceof Node && el.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [open]);

  const onHandlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      // While dragging the card, lock page text selection. A mouse drag that
      // travels over the scripture behind the card otherwise spawns a text
      // selection, which surfaces the highlight toolbar *behind* the card
      // (most visible when the page is zoomed and the card is large).
      document.body.style.userSelect = 'none';
      document.body.style.setProperty('-webkit-user-select', 'none');
      window.getSelection()?.removeAllRanges();
      dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: drag.x, baseY: drag.y };
    },
    [drag.x, drag.y],
  );
  const onHandlePointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setDrag({ x: d.baseX + (e.clientX - d.startX), y: d.baseY + (e.clientY - d.startY) });
  }, []);
  const releaseSelectionLock = useCallback(() => {
    document.body.style.userSelect = '';
    document.body.style.removeProperty('-webkit-user-select');
    window.getSelection()?.removeAllRanges();
  }, []);
  const onHandlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      dragRef.current = null;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      releaseSelectionLock();
    },
    [releaseSelectionLock],
  );

  // Safety net: if the card unmounts mid-drag (e.g. dismissed by a scroll),
  // don't leave the page stuck in the no-select state.
  useEffect(() => {
    return () => {
      if (dragRef.current) {
        document.body.style.userSelect = '';
        document.body.style.removeProperty('-webkit-user-select');
      }
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onActivate?.();
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          className={underline ? 'lex-word' : undefined}
          data-lex-word={entry.translit}
          aria-label={`${surface} — ${renderEntry.translit}, ${renderEntry.basicGloss}`}
          style={{
            cursor: 'pointer',
            color: 'inherit',
            WebkitTouchCallout: 'none',
          }}
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent
        ref={contentRef}
        align="center"
        side="bottom"
        sideOffset={6}
        // Smaller top padding leaves more vertical room for the card so it
        // isn't cut down to a sliver when the page is zoomed in (the CSS-pixel
        // viewport shrinks with zoom). Drag handle lets the user move it if it
        // still runs tall. Bottom uses the standard 16px gutter.
        collisionPadding={{ top: 56, right: 16, bottom: 16, left: 16 }}
        avoidCollisions
        className="w-[320px] p-0 border-0 shadow-2xl"
        style={{
          backgroundColor: vmTokens.surfaceRaisedBg,
          color: vmTokens.textPrimary,
          border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
          fontFamily: 'Roboto, sans-serif',
          // Radix exposes the actual available height after collision detection.
          // Capping max-height to it guarantees the popover NEVER overflows the
          // viewport regardless of where the tapped word sits — top-of-screen,
          // bottom-of-screen, or middle. The internal scroll handles overflow.
          maxHeight: 'var(--radix-popover-content-available-height)',
          overflowY: 'auto',
          // User-applied drag offset, layered on top of Radix's anchored
          // position (Radix transforms a parent wrapper, not this element).
          transform: drag.x || drag.y ? `translate(${drag.x}px, ${drag.y}px)` : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* ── HEADER (also the drag handle) ── */}
        <div
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          style={{
            padding: '14px 16px 10px',
            borderBottom: `1px solid ${vmTokens.divider}`,
            // Same surface as the popover body. The bottom-border + sticky
            // shadow provide the visual separation. Earlier attempts used
            // `chromeBg` to mimic the dark-mode visual depth, but that token
            // maps to --bg-app which is intentionally #1B1B1B even in light
            // mode (it's the page-shell color, not a card surface).
            backgroundColor: vmTokens.surfaceRaisedBg,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            cursor: 'grab',
            // Stop the browser claiming the drag as a scroll/selection gesture.
            touchAction: 'none',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span
              dir={isHebrew(renderEntry.lemma) ? 'rtl' : 'ltr'}
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 22,
                fontWeight: 500,
                color: vmTokens.textPrimary,
                letterSpacing: '0.01em',
                // Isolate the Hebrew sub-run so adjacent LTR translit + metadata
                // line below it don't get reordered by the bidi algorithm.
                unicodeBidi: 'isolate',
              }}
            >
              {renderEntry.lemma}
            </span>
            <span style={{ fontSize: 14, color: vmTokens.gold, fontWeight: 500 }}>
              {renderEntry.translit}
            </span>
            {/* Transparency that the card's prose is an AI translation, not the
                original-language reference data. Only shown when the endpoint
                actually returned a translated card (is_translated). */}
            {isTranslated && (
              <span
                style={{
                  marginLeft: 'auto',
                  alignSelf: 'center',
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: vmTokens.gold,
                  border: `1px solid ${vmTokens.gold}`,
                  borderRadius: 4,
                  padding: '1px 5px',
                }}
              >
                Translated
              </span>
            )}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: vmTokens.textTertiary }}>
            {renderEntry.pos} • {renderEntry.strongs}
            {renderEntry.pronunciation ? ` • ${renderEntry.pronunciation}` : ''}
            {/* Frequency: show NT-only, OT-only, or both depending on which
                fields are populated. Hebrew lemmas keyed to TBESH always
                get otFrequency; Greek to TBESG always get ntFrequency. */}
            {typeof renderEntry.otFrequency === 'number' && renderEntry.otFrequency > 0
              ? ` • ${renderEntry.otFrequency}× in OT`
              : ''}
            {typeof renderEntry.ntFrequency === 'number' && renderEntry.ntFrequency > 0
              ? ` • ${renderEntry.ntFrequency}× in NT`
              : ''}
          </div>
        </div>

        {/* ── IN THIS VERSE (Layer 2 — contextual gloss) ── */}
        {contextual && (
          <Section label="In this verse" highlight>
            <p style={SECTION_BODY_STYLE}>{contextual}</p>
          </Section>
        )}

        {/* ── BASIC SENSE ── */}
        <Section label="Basic sense">
          <p style={SECTION_BODY_STYLE}>{renderEntry.basicGloss}</p>
        </Section>

        {/* ── SEMANTIC RANGE ── */}
        {renderEntry.semanticRange && renderEntry.semanticRange.length > 0 && (
          <Section label="Semantic range">
            <ul
              style={{
                margin: 0,
                paddingLeft: 16,
                fontSize: 13,
                lineHeight: '19px',
                color: vmTokens.textPrimary,
              }}
            >
              {renderEntry.semanticRange.map((s, i) => (
                <li key={i} style={{ marginBottom: 3 }}>
                  {s}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ── RELATED WORDS ── */}
        {renderEntry.related && renderEntry.related.length > 0 && (
          <Section label="Related">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {renderEntry.related.map((r, i) => (
                <div key={i} style={{ fontSize: 13, lineHeight: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span
                      dir={isHebrew(r.lemma) ? 'rtl' : 'ltr'}
                      style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontSize: 15,
                        color: vmTokens.textPrimary,
                        unicodeBidi: 'isolate',
                      }}
                    >
                      {r.lemma}
                    </span>
                    <span style={{ fontSize: 12, color: vmTokens.gold }}>
                      {r.translit}
                    </span>
                  </div>
                  <div style={{ color: vmTokens.textSecondary, marginTop: 1 }}>
                    {r.note}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── LEXICAL NOTE ── */}
        {renderEntry.notes && (
          <Section label="Lexical note">
            <p
              style={{
                ...SECTION_BODY_STYLE,
                fontSize: 13,
                lineHeight: '19px',
                color: vmTokens.textPrimary,
              }}
            >
              {renderEntry.notes}
            </p>
          </Section>
        )}

        {/* ── LOADED CAVEAT (no bottom border — last section) ── */}
        {renderEntry.loaded && (
          <div style={{ padding: '10px 16px 14px' }}>
            <div
              style={{
                fontSize: 11,
                fontStyle: 'italic',
                color: vmTokens.textTertiary,
                lineHeight: '15px',
              }}
            >
              Context-sensitive: this word carries multiple senses across the NT.
              Meaning is governed by usage, not a single gloss.
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
