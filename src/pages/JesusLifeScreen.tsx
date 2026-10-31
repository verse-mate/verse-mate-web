import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ScreenHeader from '@/components/ScreenHeader';
import { JesusEventCardView } from '@/components/jesus/JesusEventParts';
import {
  JesusPeriodHeading,
  JesusPeriodHero,
  JesusPeriodStep,
  type JesusPeriodView,
} from '@/components/jesus/JesusLifeParts';
import {
  JesusEmpty,
  JesusLoading,
  JesusPageBody,
  JesusPageTitle,
  JesusPill,
  JesusSectionLabel,
} from '@/components/jesus/JesusParts';
import { useApp } from '@/contexts/AppContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { pluralize, summarizeJesusPeriod } from '@/lib/jesusLife';
import { buildJesusLifeUrl, jesusTestId, JESUS_ROOT } from '@/lib/jesusSlugs';
import { fetchJesusEventLife } from '@/services/jesusService';
import type { JesusEventLifePeriod } from '@/services/types';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';

/**
 * JesusLifeScreen — "Follow His Life".
 *
 * Two modes off one route family:
 *   /jesus/life                 the whole arc, period by period
 *   /jesus/life/<periodSlug>    one period, expanded
 *
 * Laid out the way a category (Teachings, Questions…) is: an intro line, a
 * wrapping row of chips that jumps to each period — so the last week of Jesus'
 * life is never hidden past the right edge of a scroller — then one section
 * per period with its events as divided rows. Each section carries what
 * `GET /jesus/events/life` already knows about the stretch: its scripture
 * span, which gospels cover it, how many sayings and deeds are catalogued, and
 * the themes it keeps returning to. Opening a period lists all of it.
 *
 * Periods with no events are still rendered. The gospels are uneven — thirty
 * years pass in a sentence — and showing an empty stretch with its description
 * tells that story better than silently skipping it would.
 */
export default function JesusLifeScreen() {
  const { periodSlug } = useParams<{ periodSlug?: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  // At ≥768px DesktopLayout supplies the header, so a second one here
  // would stack two title bars in the split pane.
  const inSplit = useMediaQuery('(min-width: 768px)');

  const [periods, setPeriods] = useState<JesusEventLifePeriod[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchJesusEventLife(state.version).then((data) => {
      if (!cancelled) setPeriods(data);
    });
    return () => {
      cancelled = true;
    };
  }, [state.version]);

  /** Every period with the numbers its card renders, derived once per payload. */
  const views: JesusPeriodView[] = useMemo(
    () =>
      (periods ?? []).map((period, i) => ({
        period,
        stats: summarizeJesusPeriod(period.events),
        ordinal: i + 1,
      })),
    [periods],
  );

  const activeIndex = useMemo(
    () => views.findIndex((v) => v.period.slug === periodSlug),
    [views, periodSlug],
  );
  const active = activeIndex >= 0 ? views[activeIndex] : null;

  const totals = useMemo(
    () =>
      views.reduce(
        (acc, v) => ({
          events: acc.events + v.stats.events,
          words: acc.words + v.stats.words,
          actions: acc.actions + v.stats.actions,
        }),
        { events: 0, words: 0, actions: 0 },
      ),
    [views],
  );

  const loading = periods === null;
  const title = active ? active.period.name : 'Follow His Life';

  // The chips jump within the page, the way a category's topic chips do.
  const jumpToPeriod = useCallback((slug: string) => {
    document
      .getElementById(periodAnchorId(slug))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      {!inSplit && (
        <ScreenHeader
          title={title}
          onBack={() => navigate(periodSlug ? buildJesusLifeUrl() : JESUS_ROOT)}
          backTestId="jesus-life-back-button"
          titleTestId="jesus-life-title"
        />
      )}

      <JesusPageBody wide={inSplit}>
        {inSplit && <JesusPageTitle testId="jesus-life-title">{title}</JesusPageTitle>}

        {loading ? (
          <JesusLoading />
        ) : views.length === 0 ? (
          <JesusEmpty label="The timeline isn't available right now." />
        ) : (
          <>
            {!periodSlug && (
              <p
                data-testid="jesus-life-overview-line"
                style={{
                  fontFamily: FONT,
                  fontSize: 15,
                  lineHeight: '23px',
                  color: vmTokens.textSecondary,
                }}
              >
                {pluralize(views.length, 'period')} from the manger to the ascension —{' '}
                {pluralize(totals.events, 'event')}, {pluralize(totals.words, 'saying')} and{' '}
                {pluralize(totals.actions, 'deed')} catalogued across the four Gospels.
              </p>
            )}

            {/* Jump to a period. Wraps rather than scrolls, so every stretch of
                the ministry is reachable at a glance. */}
            {!periodSlug && (
              <div data-testid="jesus-life-arc" style={{ marginTop: 14 }}>
                <div
                  data-testid="jesus-life-period-row"
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
                >
                  {views.map((view) => (
                    <JesusPill
                      key={view.period.slug}
                      label={view.period.name}
                      count={view.stats.events}
                      onClick={() => jumpToPeriod(view.period.slug)}
                      testId={jesusTestId('jesus-life-jump', view.period.slug)}
                    />
                  ))}
                </div>
              </div>
            )}

            {periodSlug && !active ? (
              <JesusEmpty label="That part of the timeline doesn't exist." />
            ) : active ? (
              <>
                <JesusPeriodHero view={active} total={views.length} />
                <PeriodEvents view={active} expanded />
                <JesusPeriodStep
                  previous={views[activeIndex - 1]}
                  next={views[activeIndex + 1]}
                  onGo={(slug) => navigate(buildJesusLifeUrl(slug))}
                />

                {/* Named jumps, below the stretch the reader came for, plus the way
                    back to the whole timeline. Wraps rather than scrolls. */}
                <JesusSectionLabel>Jump to another period</JesusSectionLabel>
                <div
                  data-testid="jesus-life-period-row"
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
                >
                  <JesusPill
                    label="All periods"
                    onClick={() => navigate(buildJesusLifeUrl())}
                    testId="jesus-life-period-all"
                  />
                  {views.map((view) => (
                    <JesusPill
                      key={view.period.slug}
                      label={view.period.name}
                      count={view.stats.events}
                      active={view.period.slug === periodSlug}
                      onClick={() => navigate(buildJesusLifeUrl(view.period.slug))}
                      testId={jesusTestId('jesus-life-period', view.period.slug)}
                    />
                  ))}
                </div>
              </>
            ) : (
              views.map((view) => (
                <PeriodEvents
                  key={view.period.slug}
                  view={view}
                  expanded={false}
                  onOpenPeriod={() => navigate(buildJesusLifeUrl(view.period.slug))}
                />
              ))
            )}
          </>
        )}
      </JesusPageBody>
    </div>
  );
}

/** How many events a period shows on the timeline before it asks you to open it. */
const PREVIEW_COUNT = 3;

/** Anchor for a period's section, so the chip row can scroll to it. */
function periodAnchorId(slug: string): string {
  return `jesus-life-period-anchor-${slug}`;
}

/**
 * A period's events.
 *
 * On the timeline the section leads with the period's heading and shows only
 * the first few events. Opened, the period leads with its intro instead and
 * every event is listed.
 */
function PeriodEvents({
  view,
  expanded,
  onOpenPeriod,
}: {
  view: JesusPeriodView;
  expanded: boolean;
  onOpenPeriod?: () => void;
}) {
  const { period } = view;
  const events = expanded ? period.events : period.events.slice(0, PREVIEW_COUNT);
  const remaining = period.events.length - events.length;

  return (
    <section
      id={periodAnchorId(period.slug)}
      data-testid={jesusTestId('jesus-life-section', period.slug)}
      style={{ marginTop: expanded ? 12 : 32, scrollMarginTop: 12 }}
    >
      {!expanded && onOpenPeriod && (
        <JesusPeriodHeading
          view={view}
          onOpen={onOpenPeriod}
          testId={jesusTestId('jesus-life-period', period.slug)}
        />
      )}

      {events.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: expanded ? 0 : 6 }}>
          {events.map((event, i) => (
            <JesusEventCardView key={event.slug} event={event} index={i + 1} />
          ))}

          {remaining > 0 && onOpenPeriod && (
            <button
              type="button"
              onClick={onOpenPeriod}
              data-testid={jesusTestId('jesus-life-more', period.slug)}
              style={{
                alignSelf: 'flex-start',
                marginTop: 4,
                padding: '8px 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 500,
                color: vmTokens.gold,
              }}
            >
              Show all {period.event_count} in {period.name} →
            </button>
          )}
        </div>
      ) : (
        <p
          style={{
            marginTop: 10,
            fontFamily: FONT,
            fontSize: 14,
            lineHeight: '21px',
            fontStyle: 'italic',
            color: vmTokens.textSecondary,
          }}
        >
          Nothing catalogued from this period yet.
        </p>
      )}
    </section>
  );
}
