import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { LexEntry, AlignedToken } from '@versemate/lexicon';
import { vmTokens } from '@/styles/themeStyles';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { OVERLAY_MODAL_WIDTH } from '@/constants/overlayModal';
import { usePreferredLanguage } from '@/hooks/usePreferredLanguage';
import { fetchLemmaCard, apiCardToLexEntry } from '@/services/lemmaApi';
import { suppressVerseInsightClick } from '@/lib/verseInsightGuard';

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
  marginBottom: 4,
};

const SECTION_BODY_STYLE: React.CSSProperties = {
  fontSize: 14,
  lineHeight: '19px',
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
        padding: '9px 14px',
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

  // On a short (typically zoomed-in) viewport the card can't fit in the space
  // beside the tapped word, so the anchored popover becomes a scrolling sliver.
  // There we present it as a centered, near-full-height modal so the reader
  // sees as much of the card as possible at once.
  const shortViewport = useMediaQuery('(max-height: 720px)');

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
  const triggerRef = useRef<HTMLSpanElement>(null);

  // Open on whichever side of the word has more vertical room so the card gets
  // the most available height (Radix caps max-height to the chosen side). This
  // is what keeps tall cards from being cut down to a scrolling sliver when the
  // page is zoomed in and the CSS-pixel viewport is short.
  const [side, setSide] = useState<'top' | 'bottom'>('bottom');

  // Re-center on the word each time the card opens (clear any prior drag) and
  // pick the roomier side.
  useEffect(() => {
    if (!open) return;
    setDrag({ x: 0, y: 0 });
    const el = triggerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      setSide(spaceBelow >= spaceAbove ? 'bottom' : 'top');
    }
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

  // The card content is shared by both presentations (anchored popover on tall
  // viewports, centered modal on short/zoomed ones).
  const cardBody = (
    <>
        {/* ── HEADER (also the drag handle) ── */}
        <div
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          style={{
            padding: '11px 14px 8px',
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
          {/* Original word as it appears in the verse — the headword of the
              card (the exact token the reader tapped). */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: vmTokens.textPrimary,
              lineHeight: '22px',
              marginBottom: 4,
            }}
          >
            {surface}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            {/* Transliteration — the readable form, shown first + larger so
                non-readers of the original script lead with what they can
                pronounce. */}
            <span style={{ fontSize: 16, color: vmTokens.gold, fontWeight: 500 }}>
              {renderEntry.translit}
            </span>
            {/* Original-language lemma — the less-readable Greek/Hebrew script,
                now smaller and after the transliteration. */}
            <span
              dir={isHebrew(renderEntry.lemma) ? 'rtl' : 'ltr'}
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 15,
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
          <div style={{ marginTop: 3, fontSize: 12, color: vmTokens.textTertiary }}>
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
                lineHeight: '17px',
                color: vmTokens.textPrimary,
              }}
            >
              {renderEntry.semanticRange.map((s, i) => (
                <li key={i} style={{ marginBottom: 2 }}>
                  {s}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ── RELATED WORDS ── */}
        {renderEntry.related && renderEntry.related.length > 0 && (
          <Section label="Related">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {renderEntry.related.map((r, i) => (
                <div key={i} style={{ fontSize: 13, lineHeight: '16px' }}>
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
    </>
  );

  // Short viewport (usually a zoomed-in browser): a centered, near-full-height
  // modal shows far more of the card at once than the word-anchored popover,
  // which is capped to the space above/below the tapped word.
  if (shortViewport) {
    return (
      <>
        <span
          ref={triggerRef}
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onActivate?.();
            const sel = typeof window !== 'undefined' ? window.getSelection() : null;
            if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) return;
            setOpen((o) => !o);
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          className={underline ? 'lex-word' : undefined}
          data-lex-word={entry.translit}
          aria-label={`${surface} — ${renderEntry.translit}, ${renderEntry.basicGloss}`}
          style={{ cursor: 'pointer', color: 'inherit', WebkitTouchCallout: 'none' }}
        >
          {children}
        </span>
        {open &&
          createPortal(
            <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
              <div
                // This portal is a DOM child of <body>, but React events still
                // bubble through the *component* tree — up to the verse span's
                // onClick that opens Verse Insight. Stop propagation (and flag
                // the guard) so dismissing the card doesn't also open the sheet.
                onClick={(e) => {
                  e.stopPropagation();
                  suppressVerseInsightClick();
                  setOpen(false);
                }}
                style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
              />
              <div
                ref={contentRef}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${drag.x}px), calc(-50% + ${drag.y}px))`,
                  width: OVERLAY_MODAL_WIDTH,
                  maxWidth: '92vw',
                  maxHeight: 'min(94vh, 900px)',
                  overflowY: 'auto',
                  backgroundColor: vmTokens.surfaceRaisedBg,
                  color: vmTokens.textPrimary,
                  border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
                  borderRadius: 12,
                  fontFamily: 'Roboto, sans-serif',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                }}
              >
                {cardBody}
              </div>
            </div>,
            document.body,
          )}
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <span
          ref={triggerRef}
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
        side={side}
        sideOffset={6}
        // Tight collision padding gives the card as much vertical room as
        // possible so there's less internal scrolling. Drag handle lets the
        // user move it if it still runs tall.
        collisionPadding={{ top: 6, right: 6, bottom: 6, left: 6 }}
        avoidCollisions
        className="w-[360px] p-0 border-0 shadow-2xl"
        style={{
          backgroundColor: vmTokens.surfaceRaisedBg,
          color: vmTokens.textPrimary,
          border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
          fontFamily: 'Roboto, sans-serif',
          // Radix exposes the actual available height after collision detection;
          // capping to it guarantees the popover never overflows the viewport.
          maxHeight: 'var(--radix-popover-content-available-height)',
          overflowY: 'auto',
          transform: drag.x || drag.y ? `translate(${drag.x}px, ${drag.y}px)` : undefined,
        }}
        // This popover has no backing overlay, so the outside click that
        // dismisses it also reaches the scripture behind it. Flag the imminent
        // verse click so it just closes the card instead of also opening the
        // Verse Insight sheet (openVerseInsight consults the same guard).
        onPointerDownOutside={() => suppressVerseInsightClick()}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {cardBody}
      </PopoverContent>
    </Popover>
  );
}
