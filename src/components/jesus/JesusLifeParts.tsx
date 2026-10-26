/**
 * The pieces of "Follow His Life".
 *
 * The timeline is laid out the way a category (Teachings, Questions…) is: an
 * intro, a wrapping row of chips that jumps to each stretch, then one section
 * per period — its name, scripture span and what is catalogued in it as plain
 * text, then its events as divided rows. That is the shape the rest of the
 * Jesus tab and the Topics list already use, and the shape the mobile app gives
 * the same screen. Nothing the earlier card map carried is dropped: every
 * period still shows its span, description, which gospels cover it, its event /
 * saying / deed counts and the themes it keeps returning to.
 *
 * Everything reads off `vmTokens`, so the Settings → Theme switch applies
 * without a per-screen pass.
 */

import type { CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import type { JesusGospel, JesusPeriodStats } from '@/lib/jesusLife';
import { pluralize } from '@/lib/jesusLife';
import type { JesusEventLifePeriod } from '@/services/types';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';

/** A period plus the numbers derived from its events. */
export interface JesusPeriodView {
  period: JesusEventLifePeriod;
  stats: JesusPeriodStats;
  /** 1-based position in the arc. */
  ordinal: number;
}

// ─── Text lines ──────────────────────────────────────────────────────────────

/** "10 events · 55 sayings · 31 deeds". */
function periodCounts(stats: JesusPeriodStats): string {
  return [
    pluralize(stats.events, 'event'),
    pluralize(stats.words, 'saying'),
    pluralize(stats.actions, 'deed'),
  ].join(' · ');
}

/** "Matthew · Mark · Luke" — the accounts that cover a stretch. */
function gospelNames(gospels: JesusGospel[]): string {
  return gospels.map((g) => g.name).join(' · ');
}

/** Theme names this stretch keeps returning to. */
function themeNames(stats: JesusPeriodStats, max: number): string {
  const names = stats.themes.slice(0, max).map((t) => t.name).join(' · ');
  return stats.themes.length > max ? `${names} +${stats.themes.length - max}` : names;
}

/** The app's meta line ("(Genesis 1:1-31)"): 13 / 20, secondary. */
const metaStyle: CSSProperties = {
  fontFamily: FONT,
  fontSize: 13,
  lineHeight: '20px',
  color: vmTokens.textSecondary,
};

/** The category intro's stats line: 12px small caps, secondary. */
const statsStyle: CSSProperties = {
  fontFamily: FONT,
  fontSize: 12,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: vmTokens.textSecondary,
};

// ─── Period heading (the timeline) ───────────────────────────────────────────

/**
 * A period's heading on the timeline, set like a category's topic heading. The
 * whole heading opens the period.
 */
export function JesusPeriodHeading({
  view,
  onOpen,
  testId,
}: {
  view: JesusPeriodView;
  onOpen: () => void;
  testId: string;
}) {
  const { period, stats } = view;

  return (
    <button
      type="button"
      onClick={onOpen}
      data-testid={testId}
      style={{
        display: 'block',
        width: '100%',
        padding: 0,
        background: 'none',
        border: 'none',
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: FONT,
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 17,
            fontWeight: 600,
            lineHeight: '24px',
            color: vmTokens.textPrimary,
          }}
        >
          {period.name}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            color: vmTokens.textSecondary,
            whiteSpace: 'nowrap',
          }}
        >
          {pluralize(stats.events, 'event')}
          <ChevronRight size={18} style={{ color: vmTokens.textSecondary }} />
        </span>
      </span>

      {period.subtitle && (
        <span style={{ display: 'block', marginTop: 2, ...metaStyle }}>
          {period.subtitle}
        </span>
      )}

      {period.description && (
        <span
          style={{
            display: 'block',
            marginTop: 6,
            fontSize: 15,
            lineHeight: '23px',
            color: vmTokens.textSecondary,
          }}
        >
          {period.description}
        </span>
      )}

      {stats.events > 0 && (
        <span style={{ display: 'block', marginTop: 6, ...metaStyle }}>
          {periodCounts(stats)}
          {stats.gospels.length > 0 && ` · ${gospelNames(stats.gospels)}`}
        </span>
      )}

      {stats.themes.length > 0 && (
        <span style={{ display: 'block', ...metaStyle }}>{themeNames(stats, 3)}</span>
      )}
    </button>
  );
}

// ─── Opened period ───────────────────────────────────────────────────────────

/**
 * The opened period's introduction — the category intro's shape: the stretch's
 * place in the arc, its span and description, then its numbers.
 */
export function JesusPeriodHero({ view, total }: { view: JesusPeriodView; total: number }) {
  const { period, stats, ordinal } = view;

  return (
    <section data-testid="jesus-life-period-hero" style={{ paddingTop: 4 }}>
      <p style={statsStyle}>
        Period {ordinal} of {total}
      </p>

      {period.subtitle && (
        <p style={{ marginTop: 6, ...metaStyle }}>{period.subtitle}</p>
      )}

      {period.description && (
        <p
          style={{
            marginTop: 8,
            fontFamily: FONT,
            fontSize: 15,
            lineHeight: '23px',
            color: vmTokens.textSecondary,
          }}
        >
          {period.description}
        </p>
      )}

      <p style={{ marginTop: 10, ...statsStyle }}>
        {periodCounts(stats)}
        {stats.gospels.length > 0 && ` · ${gospelNames(stats.gospels)}`}
      </p>

      {stats.themes.length > 0 && (
        <p style={{ marginTop: 6, ...metaStyle }}>Themes: {themeNames(stats, 5)}</p>
      )}

      {(stats.harmonized > 0 || stats.unsettled > 0) && (
        <p
          data-testid="jesus-life-period-caveat"
          style={{ marginTop: 2, ...metaStyle, fontStyle: 'italic' }}
        >
          {[
            stats.harmonized > 0 &&
              `${pluralize(stats.harmonized, 'event')} told by more than one gospel`,
            stats.unsettled > 0 &&
              `${stats.unsettled} placed by reconstruction rather than by a stated sequence`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}
    </section>
  );
}

/** Walk to the period either side of the open one — plain text links, like "Expand All". */
export function JesusPeriodStep({
  previous,
  next,
  onGo,
}: {
  previous?: JesusPeriodView;
  next?: JesusPeriodView;
  onGo: (slug: string) => void;
}) {
  if (!previous && !next) return null;

  const stepStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    maxWidth: '48%',
    padding: '6px 0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: FONT,
    fontSize: 14,
    lineHeight: '20px',
    color: vmTokens.textPrimary,
  };
  const captionStyle: CSSProperties = {
    display: 'block',
    fontSize: 12,
    lineHeight: '18px',
    color: vmTokens.textSecondary,
  };

  return (
    <div
      data-testid="jesus-life-period-step"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        // The last event row above already rules the list off.
        marginTop: 14,
      }}
    >
      {previous ? (
        <button
          type="button"
          style={{ ...stepStyle, textAlign: 'left' }}
          onClick={() => onGo(previous.period.slug)}
          data-testid="jesus-life-period-previous"
        >
          <ArrowLeft size={18} style={{ color: vmTokens.gold, flexShrink: 0 }} />
          <span style={{ minWidth: 0 }}>
            <span style={captionStyle}>Before this</span>
            {previous.period.name}
          </span>
        </button>
      ) : (
        <span />
      )}
      {next && (
        <button
          type="button"
          style={{ ...stepStyle, marginLeft: 'auto', textAlign: 'right' }}
          onClick={() => onGo(next.period.slug)}
          data-testid="jesus-life-period-next"
        >
          <span style={{ minWidth: 0 }}>
            <span style={captionStyle}>What follows</span>
            {next.period.name}
          </span>
          <ArrowRight size={18} style={{ color: vmTokens.gold, flexShrink: 0 }} />
        </button>
      )}
    </div>
  );
}
