/**
 * Shared building blocks for the Jesus tab.
 *
 * Every Jesus screen is a list of the same row, so the row lives here once:
 * the hub, the kind/theme/study lists, the chronological walk and the "read
 * next" list on an entry all render it. The pieces follow the web design
 * system — lists of places to open are divider rows (the Topics list and the
 * book selector), chips are the app's small pills, section labels are the
 * sidebar's — and style inline off `vmTokens` so the Settings → Theme switch
 * applies without a per-screen dark-mode pass.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { SwipeHandlers } from '@/hooks/useHorizontalSwipe';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { JesusEntry, JesusReference } from '@/services/types';
import { jesusHeadline, jesusQuoteStyle, jesusRowStyle } from '@/lib/jesusRows';
import { buildJesusEntryUrl, jesusTestId } from '@/lib/jesusSlugs';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';

/**
 * The column a Jesus screen sits in on the split layout — the reading column's
 * own measure (`.reading-inner`: `min(660px, 100% - 104px)`), so a Jesus list
 * and a chapter are the same width on screen.
 */
export const JESUS_SPLIT_MEASURE = 'min(660px, calc(100% - 104px))';

/** Small ordinal in front of a row on the chronological walk. */
export function JesusRowIndex({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        flexShrink: 0,
        minWidth: 18,
        fontFamily: FONT,
        fontSize: 13,
        lineHeight: '24px',
        color: vmTokens.textSecondary,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {n}
    </span>
  );
}

/** Section label above a group of rows ("Explore by Topic") — the sidebar's "OLD TESTAMENT". */
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
        margin: '28px 0 8px',
      }}
    >
      <h2
        style={{
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.5px',
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
        color: vmTokens.textSecondary,
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
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
          padding: '4px 12px',
          borderRadius: 999,
          border: `1px solid ${vmTokens.divider}`,
          backgroundColor: vmTokens.surfaceRaisedBg,
          color: vmTokens.textPrimary,
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
            lineHeight: '26px',
            color: vmTokens.textSecondary,
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
 * It is a divider row like the rest of the app's lists, not a boxed card. The
 * whole row is clickable, but the row itself is NOT a `<button>`: it carries
 * interactive reference pills, and a button inside a button is invalid HTML
 * that browsers resolve unpredictably. Instead the title is the real control
 * and it stretches an invisible hit area over the row, which gives one tab stop
 * for "open this entry" plus separate tab stops for the pills.
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
      style={{ ...jesusRowStyle, padding: '14px 0', position: 'relative', cursor: 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {index !== undefined && <JesusRowIndex n={index} />}

        <div style={{ flex: 1, minWidth: 0 }}>
          {showKind && (
            <p
              style={{
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: vmTokens.textSecondary,
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
                lineHeight: '24px',
                color: vmTokens.textPrimary,
              }}
            >
              {/* Stretches the title's hit area over the whole row. */}
              <span aria-hidden="true" style={{ position: 'absolute', inset: 0 }} />
              {jesusHeadline(entry.title)}
            </button>
          </h3>

          {entry.quote && (
            <blockquote style={jesusQuoteStyle}>
              “{entry.quote}”
            </blockquote>
          )}

          {entry.summary && (
            <p
              style={{
                marginTop: 6,
                fontFamily: FONT,
                fontSize: 14,
                lineHeight: '21px',
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

/**
 * A navigation row: title, blurb, count, chevron — the book selector's Jesus
 * row, with the blurb the overview ships for every kind as a second line.
 */
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
  /**
   * The lead row ("Follow His Life"). It keeps the row shape and carries its
   * gold icon; gold stays an accent, never a container.
   */
  emphasis?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      data-emphasis={emphasis || undefined}
      style={{
        ...jesusRowStyle,
        minHeight: 56,
        padding: '12px 0',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
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
            fontWeight: 400,
            lineHeight: '24px',
            color: vmTokens.textPrimary,
          }}
        >
          {title}
        </span>
        {blurb && (
          <span
            style={{
              display: 'block',
              marginTop: 2,
              fontFamily: FONT,
              fontSize: 13,
              lineHeight: '20px',
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

/**
 * A chip — the app's small pill (search filters, reference pills): radius full,
 * card surface with a hairline, gold fill when active.
 */
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
        padding: '5px 12px',
        borderRadius: 999,
        fontFamily: FONT,
        fontSize: 13,
        lineHeight: '20px',
        fontWeight: active ? 500 : 400,
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
            color: active ? vmTokens.goldOnLight : vmTokens.textSecondary,
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
        color: vmTokens.textSecondary,
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
        lineHeight: '21px',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: '32px 0',
        color: vmTokens.textSecondary,
      }}
    >
      {label}
    </p>
  );
}

/**
 * The screen's title when it sits in the split pane — set like a chapter title
 * ("Genesis 1"), since it heads the left pane the way a chapter does.
 *
 * Below 768px `ScreenHeader` carries the title; at ≥768px DesktopLayout owns
 * the header bar, so the title moves into the content. Both carry the same
 * test id and only one is ever mounted.
 */
export function JesusPageTitle({
  children,
  testId,
}: {
  children: ReactNode;
  testId?: string;
}) {
  return (
    <h1
      data-testid={testId}
      style={{
        fontFamily: FONT,
        fontSize: 28,
        fontWeight: 500,
        lineHeight: '36px',
        color: vmTokens.textPrimary,
        margin: '0 0 8px',
      }}
    >
      {children}
    </h1>
  );
}

export function JesusPageBody({
  children,
  wide = false,
  swipe,
  testId,
}: {
  children: ReactNode;
  /** Widen the measure when the body fills the split pane rather than a phone. */
  wide?: boolean;
  /**
   * Horizontal-swipe handlers from `useHorizontalSwipe`. They belong on the
   * scroller itself — a wrapper around it would have to re-create the flex
   * sizing that makes the body scroll in the first place.
   */
  swipe?: SwipeHandlers;
  /** Names the scroller for tests, the way the reader names its chapter pager. */
  testId?: string;
}) {
  return (
    <div
      {...swipe}
      data-testid={testId}
      style={{
        flex: 1,
        overflowY: 'auto',
        backgroundColor: vmTokens.commentaryBg,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: wide ? JESUS_SPLIT_MEASURE : 680,
          margin: '0 auto',
          // Split: the reading column's own padding (.reading-inner, 32 / 96).
          // Phone: the app's 16px gutter.
          padding: wide ? '32px 0 96px' : '8px 16px 40px',
        }}
      >
        {children}
      </div>
    </div>
  );
}
