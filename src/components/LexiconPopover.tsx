import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { LexEntry, AlignedToken } from '@/data/lexicon/types';

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

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: '#B09A6D',
  textTransform: 'uppercase',
  marginBottom: 6,
};

const SECTION_BODY_STYLE: React.CSSProperties = {
  fontSize: 14,
  lineHeight: '20px',
  color: '#E7E7E7',
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
        borderBottom: '1px solid #2E2E2E',
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
        className="w-[320px] p-0 border-0 shadow-2xl"
        style={{
          backgroundColor: '#1B1B1B',
          color: '#FFFFFF',
          border: '1px solid #2E2E2E',
          fontFamily: 'Roboto, sans-serif',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            padding: '14px 16px 10px',
            borderBottom: '1px solid #2E2E2E',
            backgroundColor: '#161616',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 22,
                fontWeight: 500,
                color: '#FFFFFF',
                letterSpacing: '0.01em',
              }}
            >
              {entry.lemma}
            </span>
            <span style={{ fontSize: 14, color: '#B09A6D', fontWeight: 500 }}>
              {entry.translit}
            </span>
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            {entry.pos} • {entry.strongs}
            {entry.pronunciation ? ` • ${entry.pronunciation}` : ''}
            {typeof entry.ntFrequency === 'number'
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
                color: 'rgba(255,255,255,0.85)',
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
                      style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontSize: 15,
                        color: '#FFFFFF',
                      }}
                    >
                      {r.lemma}
                    </span>
                    <span style={{ fontSize: 12, color: '#B09A6D' }}>
                      {r.translit}
                    </span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>
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
                color: 'rgba(255,255,255,0.85)',
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
                color: 'rgba(255,255,255,0.55)',
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
