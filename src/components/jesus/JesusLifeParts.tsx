/**
 * The visual furniture of "Follow His Life".
 *
 * The timeline used to navigate through a single horizontally scrolling row of
 * pills, which hid two thirds of the ministry off the right edge and said
 * nothing about any of it beyond a count. These parts replace that row with a
 * wrapping map of the arc: a proportional band across the top, then one card
 * per period carrying what the payload already knows — which gospels cover the
 * stretch, how many sayings and deeds are catalogued in it, what it keeps
 * returning to, and how much of the record it holds.
 *
 * Everything reads off `vmTokens` / prototype.css variables, so the Settings →
 * Theme switch applies without a per-screen pass.
 */

import type { CSSProperties, ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Hand, LayoutGrid, MessageSquareQuote } from 'lucide-react';
import type { JesusGospel, JesusPeriodStats } from '@/lib/jesusLife';
import { JESUS_GOSPELS, jesusPeriodWeight, pluralize } from '@/lib/jesusLife';
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

// ─── Small pieces ────────────────────────────────────────────────────────────

/** The gold circle carrying a period's position in the arc. */
export function JesusOrdinal({ n, size = 26 }: { n: number; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: 999,
        border: `1px solid ${vmTokens.gold}`,
        color: vmTokens.gold,
        fontFamily: FONT,
        fontSize: size <= 26 ? 12 : 14,
        fontWeight: 600,
        lineHeight: `${size - 2}px`,
        textAlign: 'center',
      }}
    >
      {n}
    </span>
  );
}

/**
 * Which of the four accounts cover this stretch.
 *
 * Absent gospels are drawn rather than omitted — that John records nothing of
 * the Galilean crowds is a fact about the text, and a strip that simply dropped
 * him would read as an oversight instead.
 */
export function JesusGospelStrip({
  gospels,
  label = true,
}: {
  gospels: JesusGospel[];
  label?: boolean;
}) {
  const covered = new Set(gospels.map((g) => g.bookId));
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
      aria-label={
        covered.size
          ? `Recorded in ${gospels.map((g) => g.name).join(', ')}`
          : 'No gospel passages catalogued'
      }
    >
      {label && (
        <BookOpen size={12} strokeWidth={1.75} style={{ color: vmTokens.textTertiary, marginRight: 2 }} />
      )}
      {JESUS_GOSPELS.map((g) => {
        const on = covered.has(g.bookId);
        return (
          <span
            key={g.bookId}
            title={on ? `${g.name} records events here` : `Nothing from ${g.name} in this period`}
            style={{
              minWidth: 24,
              padding: '1px 5px',
              borderRadius: 5,
              textAlign: 'center',
              fontFamily: FONT,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: '0.03em',
              color: on ? vmTokens.goldOnLight : vmTokens.textTertiary,
              backgroundColor: on ? vmTokens.gold : 'transparent',
              border: `1px solid ${on ? vmTokens.gold : vmTokens.divider}`,
            }}
          >
            {g.short}
          </span>
        );
      })}
    </div>
  );
}

/** Events / sayings / deeds, the three counts every period has. */
export function JesusStatRow({ stats, compact = false }: { stats: JesusPeriodStats; compact?: boolean }) {
  const items: { icon: ReactNode; value: number; label: string }[] = [
    { icon: <LayoutGrid size={12} strokeWidth={1.75} />, value: stats.events, label: 'event' },
    { icon: <MessageSquareQuote size={12} strokeWidth={1.75} />, value: stats.words, label: 'saying' },
    { icon: <Hand size={12} strokeWidth={1.75} />, value: stats.actions, label: 'deed' },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: compact ? 8 : 10 }}>
      {items.map((item) => (
        <span
          key={item.label}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: FONT,
            fontSize: 12,
            lineHeight: '18px',
            color: item.value ? vmTokens.textSecondary : vmTokens.textTertiary,
          }}
        >
          <span style={{ display: 'flex', color: vmTokens.gold }}>{item.icon}</span>
          {pluralize(item.value, item.label)}
        </span>
      ))}
    </div>
  );
}

/** Share-of-the-record bar. Silent when a period has nothing catalogued. */
function WeightBar({ weight }: { weight: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 3,
        borderRadius: 999,
        backgroundColor: vmTokens.divider,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          // A floor, so a period with a single event still draws something.
          width: `${Math.max(Math.round(weight * 100), 2)}%`,
          height: '100%',
          borderRadius: 999,
          backgroundColor: vmTokens.gold,
          opacity: 0.55 + weight * 0.45,
        }}
      />
    </div>
  );
}

/** Theme names this stretch keeps returning to. */
function ThemeLine({ stats, max = 3 }: { stats: JesusPeriodStats; max?: number }) {
  if (stats.themes.length === 0) return null;
  return (
    <p
      style={{
        fontFamily: FONT,
        fontSize: 11.5,
        lineHeight: '17px',
        color: vmTokens.textTertiary,
      }}
    >
      {stats.themes.slice(0, max).map((t) => t.name).join(' · ')}
      {stats.themes.length > max && ` +${stats.themes.length - max}`}
    </p>
  );
}

// ─── The arc band ────────────────────────────────────────────────────────────

/**
 * The whole ministry in one line, each period sized by how much of the record
 * it holds. It is the orientation device the pill row never was: the reader can
 * see at a glance that thirty years pass in a sentence and that the last week
 * takes a quarter of the corpus.
 */
export function JesusArcBand({
  views,
  activeSlug,
  onSelect,
}: {
  views: JesusPeriodView[];
  activeSlug?: string;
  onSelect: (slug: string) => void;
}) {
  const counts = views.map((v) => v.stats.events);
  const first = views[0]?.period.name;
  const last = views[views.length - 1]?.period.name;

  return (
    <div style={{ margin: '14px 0 4px' }} data-testid="jesus-life-arc">
      <div style={{ display: 'flex', gap: 2 }}>
        {views.map((view) => {
          const weight = jesusPeriodWeight(view.stats.events, counts);
          const active = view.period.slug === activeSlug;
          return (
            <button
              key={view.period.slug}
              type="button"
              className="jl-arc-seg"
              onClick={() => onSelect(view.period.slug)}
              title={`${view.period.name} — ${pluralize(view.stats.events, 'event')}`}
              aria-label={`${view.period.name}, ${pluralize(view.stats.events, 'event')}`}
              style={{
                // Square-rooted so the Galilean ministry doesn't squeeze the
                // hidden years down to a hairline: the band is meant to be read
                // period by period, not measured. The floor keeps the ordinal
                // legible in a stretch with nothing catalogued.
                flex: `${Math.sqrt(Math.max(view.stats.events, 0.5))} 1 0`,
                minWidth: 26,
                height: 34,
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: FONT,
                fontSize: 11,
                fontWeight: 600,
                position: 'relative',
                overflow: 'hidden',
                color: active ? vmTokens.goldOnLight : vmTokens.textSecondary,
                backgroundColor: active ? vmTokens.gold : 'transparent',
                border: `1px solid ${active ? vmTokens.gold : vmTokens.divider}`,
              }}
            >
              {/* A tinted fill rather than a translucent background colour, so
                  the ordinal on top keeps its full contrast. */}
              {!active && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: vmTokens.gold,
                    opacity: 0.1 + weight * 0.4,
                  }}
                />
              )}
              <span style={{ position: 'relative' }}>{view.ordinal}</span>
            </button>
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 5,
          fontFamily: FONT,
          fontSize: 11,
          color: vmTokens.textTertiary,
        }}
      >
        <span>{first}</span>
        <span style={{ textAlign: 'right' }}>{last}</span>
      </div>
    </div>
  );
}

// ─── Period card ─────────────────────────────────────────────────────────────

/** One period of the arc, as the map renders it. */
export function JesusPeriodCard({
  view,
  weight,
  onOpen,
  testId,
}: {
  view: JesusPeriodView;
  weight: number;
  onOpen: () => void;
  testId: string;
}) {
  const { period, stats, ordinal } = view;
  const empty = stats.events === 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      data-testid={testId}
      className={`jl-card${empty ? ' is-empty' : ''}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <JesusOrdinal n={ordinal} />
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: FONT,
            fontSize: 15,
            fontWeight: 600,
            lineHeight: '20px',
            color: vmTokens.textPrimary,
          }}
        >
          {period.name}
        </span>
      </div>

      {period.subtitle && (
        <span
          style={{
            fontFamily: FONT,
            fontSize: 11.5,
            lineHeight: '17px',
            letterSpacing: '0.02em',
            color: vmTokens.gold,
          }}
        >
          {period.subtitle}
        </span>
      )}

      {period.description && (
        <span
          className="jl-clamp"
          style={{
            fontFamily: FONT,
            fontSize: 13,
            lineHeight: '19px',
            color: vmTokens.textSecondary,
          }}
        >
          {period.description}
        </span>
      )}

      <span style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {empty ? (
          <span
            style={{
              fontFamily: FONT,
              fontSize: 12,
              fontStyle: 'italic',
              color: vmTokens.textTertiary,
            }}
          >
            Nothing catalogued yet.
          </span>
        ) : (
          <>
            <WeightBar weight={weight} />
            <JesusStatRow stats={stats} compact />
            <ThemeLine stats={stats} />
          </>
        )}
        <JesusGospelStrip gospels={stats.gospels} />
      </span>
    </button>
  );
}

/**
 * The compact form used once a period is open, where the map has already done
 * its work and the row is only a way back out. It wraps rather than scrolls,
 * so no period is ever hidden off the edge.
 */
export function JesusPeriodChip({
  label,
  count,
  active,
  onClick,
  testId,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  testId: string;
}) {
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 11px',
    borderRadius: 999,
    cursor: 'pointer',
    fontFamily: FONT,
    fontSize: 12.5,
    lineHeight: '18px',
    backgroundColor: active ? vmTokens.gold : 'transparent',
    border: `1px solid ${active ? vmTokens.gold : vmTokens.divider}`,
    color: active ? vmTokens.goldOnLight : vmTokens.textSecondary,
  };
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      aria-pressed={active}
      className="jl-chip"
      style={style}
    >
      {label}
      {count ? (
        <span style={{ fontSize: 11, opacity: active ? 0.75 : 1, color: 'inherit' }}>{count}</span>
      ) : null}
    </button>
  );
}

// ─── Period hero ─────────────────────────────────────────────────────────────

/** The opened period's masthead: everything its card said, at full size. */
export function JesusPeriodHero({ view, total }: { view: JesusPeriodView; total: number }) {
  const { period, stats, ordinal } = view;

  return (
    <section
      data-testid="jesus-life-period-hero"
      style={{
        marginTop: 14,
        padding: 16,
        borderRadius: 14,
        border: `1px solid ${vmTokens.gold}`,
        backgroundColor: 'rgba(176,154,109,0.10)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <JesusOrdinal n={ordinal} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: vmTokens.textTertiary,
            }}
          >
            Period {ordinal} of {total}
          </p>
          <h2
            style={{
              fontFamily: FONT,
              fontSize: 20,
              fontWeight: 600,
              lineHeight: '26px',
              color: vmTokens.textPrimary,
            }}
          >
            {period.name}
          </h2>
        </div>
      </div>

      {period.subtitle && (
        <p
          style={{
            marginTop: 8,
            fontFamily: FONT,
            fontSize: 13,
            letterSpacing: '0.02em',
            color: vmTokens.gold,
          }}
        >
          {period.subtitle}
        </p>
      )}

      {period.description && (
        <p
          style={{
            marginTop: 8,
            fontFamily: FONT,
            fontSize: 14.5,
            lineHeight: '22px',
            color: vmTokens.textSecondary,
          }}
        >
          {period.description}
        </p>
      )}

      <div
        style={{
          marginTop: 14,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <JesusStatRow stats={stats} />
        <JesusGospelStrip gospels={stats.gospels} />
      </div>

      {stats.themes.length > 0 && (
        <p
          style={{
            marginTop: 10,
            fontFamily: FONT,
            fontSize: 12,
            lineHeight: '18px',
            color: vmTokens.textTertiary,
          }}
        >
          Themes: {stats.themes.slice(0, 5).map((t) => t.name).join(' · ')}
        </p>
      )}

      {(stats.harmonized > 0 || stats.unsettled > 0) && (
        <p
          data-testid="jesus-life-period-caveat"
          style={{
            marginTop: 6,
            fontFamily: FONT,
            fontSize: 12,
            lineHeight: '18px',
            fontStyle: 'italic',
            color: vmTokens.textTertiary,
          }}
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

/** Walk to the period either side of the open one. */
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

  return (
    <div
      data-testid="jesus-life-period-step"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 22,
      }}
    >
      {previous ? (
        <button
          type="button"
          className="jl-step"
          onClick={() => onGo(previous.period.slug)}
          data-testid="jesus-life-period-previous"
        >
          <ArrowLeft size={15} style={{ color: vmTokens.gold, flexShrink: 0 }} />
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 10.5, color: vmTokens.textTertiary }}>
              Before this
            </span>
            {previous.period.name}
          </span>
        </button>
      ) : (
        <span />
      )}
      {next && (
        <button
          type="button"
          className="jl-step"
          style={{ marginLeft: 'auto', textAlign: 'right' }}
          onClick={() => onGo(next.period.slug)}
          data-testid="jesus-life-period-next"
        >
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 10.5, color: vmTokens.textTertiary }}>
              What follows
            </span>
            {next.period.name}
          </span>
          <ArrowRight size={15} style={{ color: vmTokens.gold, flexShrink: 0 }} />
        </button>
      )}
    </div>
  );
}
