/**
 * Shared building blocks for the Jesus tab.
 *
 * Every Jesus screen is a list of the same card, so the card lives here once:
 * the hub, the kind/theme/study lists, the chronological walk and the "read
 * next" rail on an entry all render `JesusEntryCard`. Styling follows the rest
 * of the app — inline styles off `vmTokens` so the Settings → Theme switch
 * applies without a per-screen dark-mode pass.
 */

import type { CSSProperties, ReactNode } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { JesusEntry, JesusReference } from '@/services/types';
import { buildJesusEntryUrl, jesusTestId } from '@/lib/jesusSlugs';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';

const jesusCardStyle: CSSProperties = {
  backgroundColor: vmTokens.surfaceRaisedBg,
  border: `1px solid ${vmTokens.divider}`,
  borderRadius: 12,
  textAlign: 'left',
  width: '100%',
  cursor: 'pointer',
  fontFamily: FONT,
};

/** Section label above a group of cards ("Explore by Topic"). */
export function JesusSectionLabel({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 12,
        margin: '24px 0 10px',
      }}
    >
      <h2
        style={{
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: vmTokens.textSecondary,
        }}
      >
        {children}
      </h2>
      {action}
    </div>
  );
}

/** Small count chip. Rendered only when there is something to count. */
export function JesusCount({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span
      style={{
        fontFamily: FONT,
        fontSize: 12,
        lineHeight: '20px',
        color: vmTokens.textTertiary,
        whiteSpace: 'nowrap',
      }}
    >
      {count}
    </span>
  );
}

/**
 * Clickable scripture references. Tapping one opens the passage in the reader,
 * which is why the parent owns the handler rather than this component
 * navigating itself — the entry screen and the card want the same pills but
 * different analytics context.
 */
export function JesusReferencePills({
  references,
  onOpenReference,
  max,
}: {
  references: JesusReference[];
  onOpenReference?: (ref: JesusReference) => void;
  /** Truncate to N pills and show a "+n" hint. Omit to show all. */
  max?: number;
}) {
  if (references.length === 0) return null;
  const shown = max ? references.slice(0, max) : references;
  const hidden = references.length - shown.length;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        // Sit above JesusEntryCard's stretched hit area so a pill tap reaches
        // the pill rather than the card underneath it.
        position: 'relative',
        zIndex: 1,
      }}
    >
      {shown.map((ref) => {
        const content = (
          <>
            <BookOpen size={11} strokeWidth={1.75} />
            {ref.display}
          </>
        );
        const style: CSSProperties = {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: FONT,
          fontSize: 12,
          lineHeight: '18px',
          padding: '3px 10px',
          borderRadius: 999,
          border: `1px solid ${vmTokens.divider}`,
          backgroundColor: vmTokens.pageBg,
          color: vmTokens.textSecondary,
        };

        return onOpenReference ? (
          <button
            key={ref.display}
            type="button"
            onClick={(e) => {
              // Pills sit inside clickable cards; stop the card's navigation
              // from firing as well.
              e.stopPropagation();
              onOpenReference(ref);
            }}
            data-testid={jesusTestId('jesus-reference', ref.display)}
            style={{ ...style, cursor: 'pointer' }}
          >
            {content}
          </button>
        ) : (
          <span key={ref.display} style={style}>
            {content}
          </span>
        );
      })}
      {hidden > 0 && (
        <span
          style={{
            fontFamily: FONT,
            fontSize: 12,
            lineHeight: '24px',
            color: vmTokens.textTertiary,
          }}
        >
          +{hidden} more
        </span>
      )}
    </div>
  );
}

/**
 * One entry, as it appears in every list in the feature.
 *
 * When the entry carries a quote (a claim, a question, a command) the quote is
 * the headline material and the summary becomes supporting text — that is the
 * whole point of storing `quote` separately from `summary` on the backend.
 *
 * The whole card is clickable, but the card itself is NOT a `<button>`: it
 * carries interactive reference pills, and a button inside a button is invalid
 * HTML that browsers resolve unpredictably. Instead the title is the real
 * control and it stretches an invisible hit area over the card, which gives one
 * tab stop for "open this entry" plus separate tab stops for the pills.
 */
export function JesusEntryCard({
  entry,
  onOpenReference,
  showKind = true,
  index,
}: {
  entry: JesusEntry;
  onOpenReference?: (ref: JesusReference) => void;
  /** Hide the kind eyebrow on a list that is already filtered to one kind. */
  showKind?: boolean;
  /** Position marker used by the chronological walk. */
  index?: number;
}) {
  const navigate = useNavigate();

  return (
    <article
      data-testid={jesusTestId('jesus-entry-card', entry.slug)}
      style={{ ...jesusCardStyle, padding: 14, position: 'relative', cursor: 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {index !== undefined && (
          <span
            aria-hidden="true"
            style={{
              flexShrink: 0,
              width: 24,
              height: 24,
              borderRadius: 999,
              backgroundColor: vmTokens.pageBg,
              border: `1px solid ${vmTokens.divider}`,
              color: vmTokens.textTertiary,
              fontFamily: FONT,
              fontSize: 11,
              lineHeight: '22px',
              textAlign: 'center',
            }}
          >
            {index}
          </span>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {showKind && (
            <p
              style={{
                fontFamily: FONT,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: vmTokens.gold,
                marginBottom: 4,
              }}
            >
              {entry.kind_label}
            </p>
          )}

          <h3>
            <button
              type="button"
              onClick={() => navigate(buildJesusEntryUrl(entry.slug))}
              data-testid={jesusTestId('jesus-entry-link', entry.slug)}
              style={{
                padding: 0,
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: FONT,
                fontSize: 16,
                fontWeight: 500,
                lineHeight: '22px',
                color: vmTokens.textPrimary,
              }}
            >
              {/* Stretches the title's hit area over the whole card. */}
              <span
                aria-hidden="true"
                style={{ position: 'absolute', inset: 0, borderRadius: 12 }}
              />
              {entry.title}
            </button>
          </h3>

          {entry.quote && (
            <blockquote
              style={{
                margin: '8px 0 0',
                paddingLeft: 10,
                borderLeft: `2px solid ${vmTokens.gold}`,
                fontFamily: FONT,
                fontSize: 14,
                lineHeight: '21px',
                fontStyle: 'italic',
                color: vmTokens.textPrimary,
              }}
            >
              “{entry.quote}”
            </blockquote>
          )}

          {entry.summary && (
            <p
              style={{
                marginTop: 8,
                fontFamily: FONT,
                fontSize: 14,
                lineHeight: '20px',
                color: vmTokens.textSecondary,
              }}
            >
              {entry.summary}
            </p>
          )}

          <div style={{ marginTop: 10 }}>
            <JesusReferencePills
              references={entry.references}
              onOpenReference={onOpenReference}
              max={3}
            />
          </div>
        </div>

        <ChevronRight
          size={18}
          style={{ color: vmTokens.textTertiary, flexShrink: 0, marginTop: 2 }}
        />
      </div>
    </article>
  );
}

/** A navigation card: title, blurb, count, chevron. */
export function JesusNavCard({
  title,
  blurb,
  count,
  onClick,
  testId,
  emphasis = false,
  icon,
}: {
  title: string;
  blurb?: string | null;
  count?: number;
  onClick: () => void;
  testId?: string;
  /** Gold-tinted treatment for the hero card ("Follow His Life"). */
  emphasis?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      style={{
        ...jesusCardStyle,
        padding: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        ...(emphasis
          ? {
              backgroundColor: 'rgba(176,154,109,0.10)',
              border: `1px solid ${vmTokens.gold}`,
            }
          : null),
      }}
    >
      {icon && (
        <span style={{ color: vmTokens.gold, display: 'flex', flexShrink: 0 }}>
          {icon}
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 500,
            lineHeight: '22px',
            color: vmTokens.textPrimary,
          }}
        >
          {title}
        </span>
        {blurb && (
          <span
            style={{
              display: 'block',
              marginTop: 3,
              fontFamily: FONT,
              fontSize: 13,
              lineHeight: '18px',
              color: vmTokens.textSecondary,
            }}
          >
            {blurb}
          </span>
        )}
      </span>
      <JesusCount count={count ?? 0} />
      <ChevronRight size={18} style={{ color: vmTokens.textTertiary, flexShrink: 0 }} />
    </button>
  );
}

/** Rounded pill used for the theme row. */
export function JesusPill({
  label,
  count,
  onClick,
  testId,
  active = false,
}: {
  label: string;
  count?: number;
  onClick: () => void;
  testId?: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      aria-pressed={active}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 14px',
        borderRadius: 999,
        fontFamily: FONT,
        fontSize: 14,
        lineHeight: '20px',
        cursor: 'pointer',
        backgroundColor: active ? vmTokens.gold : vmTokens.surfaceRaisedBg,
        border: `1px solid ${active ? vmTokens.gold : vmTokens.divider}`,
        color: active ? vmTokens.goldOnLight : vmTokens.textPrimary,
      }}
    >
      {label}
      {count ? (
        <span
          style={{
            fontSize: 12,
            color: active ? vmTokens.goldOnLight : vmTokens.textTertiary,
          }}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function JesusLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <p
      data-testid="jesus-loading"
      style={{
        fontFamily: FONT,
        fontSize: 14,
        textAlign: 'center',
        padding: '32px 0',
        color: vmTokens.textTertiary,
      }}
    >
      {label}
    </p>
  );
}

export function JesusEmpty({ label }: { label: string }) {
  return (
    <p
      data-testid="jesus-empty"
      style={{
        fontFamily: FONT,
        fontSize: 14,
        textAlign: 'center',
        padding: '32px 0',
        color: vmTokens.textTertiary,
      }}
    >
      {label}
    </p>
  );
}

/** Shared page frame: header slot + scrollable body capped to a reading column. */
export function JesusPageBody({
  children,
  wide = false,
}: {
  children: ReactNode;
  /** Widen the measure when the body fills the split pane rather than a phone. */
  wide?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        backgroundColor: vmTokens.commentaryBg,
      }}
    >
      <div
        style={{
          maxWidth: wide ? 920 : 680,
          margin: '0 auto',
          padding: wide ? '20px 20px 72px' : '4px 16px 40px',
        }}
      >
        {children}
      </div>
    </div>
  );
}
