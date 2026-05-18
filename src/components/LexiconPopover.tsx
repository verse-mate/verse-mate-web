import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { LexEntry, AlignedToken } from '@/data/lexicon/types';
import { vmTokens } from '@/styles/themeStyles';

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
   * True when this lemma is in the chapter's themeLemmas list. Theme words
   * carry the chapter's central argument and get a more prominent
   * underline so the spine of the chapter reads at a glance.
   */
  isTheme?: boolean;
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
  isTheme,
  onActivate,
}: LexiconPopoverProps) {
  const contextual = token.contextual;

  return (
    <Popover>
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
          className={isTheme ? 'lex-word lex-word-theme' : 'lex-word'}
          data-lex-word={entry.translit}
          aria-label={`${surface} — ${entry.translit}, ${entry.basicGloss}`}
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
        align="center"
        side="bottom"
        sideOffset={6}
        // Top padding accounts for the chapter header (~56px content +
        // safe-area-inset on devices with notches, padded to ~96 total)
        // so the popover never tucks up under "James 1" / the book selector.
        // Bottom uses the standard 16px gutter; the progress bar at the
        // very bottom is allowed to peek beneath the card if needed.
        collisionPadding={{ top: 96, right: 16, bottom: 16, left: 16 }}
        avoidCollisions
        sticky="always"
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
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span
              dir={isHebrew(entry.lemma) ? 'rtl' : 'ltr'}
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
              {entry.lemma}
            </span>
            <span style={{ fontSize: 14, color: vmTokens.gold, fontWeight: 500 }}>
              {entry.translit}
            </span>
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: vmTokens.textTertiary }}>
            {entry.pos} • {entry.strongs}
            {entry.pronunciation ? ` • ${entry.pronunciation}` : ''}
            {/* Frequency: show NT-only, OT-only, or both depending on which
                fields are populated. Hebrew lemmas keyed to TBESH always
                get otFrequency; Greek to TBESG always get ntFrequency. */}
            {typeof entry.otFrequency === 'number' && entry.otFrequency > 0
              ? ` • ${entry.otFrequency}× in OT`
              : ''}
            {typeof entry.ntFrequency === 'number' && entry.ntFrequency > 0
              ? ` • ${entry.ntFrequency}× in NT`
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
          <p style={SECTION_BODY_STYLE}>{entry.basicGloss}</p>
        </Section>

        {/* ── SEMANTIC RANGE ── */}
        {entry.semanticRange && entry.semanticRange.length > 0 && (
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
              {entry.semanticRange.map((s, i) => (
                <li key={i} style={{ marginBottom: 3 }}>
                  {s}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ── RELATED WORDS ── */}
        {entry.related && entry.related.length > 0 && (
          <Section label="Related">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entry.related.map((r, i) => (
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
        {entry.notes && (
          <Section label="Lexical note">
            <p
              style={{
                ...SECTION_BODY_STYLE,
                fontSize: 13,
                lineHeight: '19px',
                color: vmTokens.textPrimary,
              }}
            >
              {entry.notes}
            </p>
          </Section>
        )}

        {/* ── LOADED CAVEAT (no bottom border — last section) ── */}
        {entry.loaded && (
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
