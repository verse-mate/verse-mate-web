import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ScreenHeader from '@/components/ScreenHeader';
import { JesusEventCardView } from '@/components/jesus/JesusEventParts';
import {
  JesusArcBand,
  JesusGospelStrip,
  JesusOrdinal,
  JesusPeriodCard,
  JesusPeriodChip,
  JesusPeriodHero,
  JesusPeriodStep,
  JesusStatRow,
  type JesusPeriodView,
} from '@/components/jesus/JesusLifeParts';
import {
  JesusEmpty,
  JesusLoading,
  JesusPageBody,
  JesusPageTitle,
  JesusSectionLabel,
} from '@/components/jesus/JesusParts';
import { useApp } from '@/contexts/AppContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { jesusPeriodWeight, pluralize, summarizeJesusPeriod } from '@/lib/jesusLife';
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
 * Navigation is a map, not a scroller. The arc band sizes each period by how
 * much of the record it holds, and the card grid below it wraps — so the last
 * week of Jesus' life is never hidden past the right edge of a pill row the way
 * it was when this screen navigated by horizontal scroll. Each card carries
 * what `GET /jesus/events/life` already knows about the stretch: its scripture
 * span, which gospels cover it, how many sayings and deeds are catalogued, and
 * the themes it keeps returning to.
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
  const counts = useMemo(() => views.map((v) => v.stats.events), [views]);

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
                  fontSize: 14,
                  lineHeight: '21px',
                  color: vmTokens.textSecondary,
                }}
              >
                {pluralize(views.length, 'period')} from the manger to the ascension —{' '}
                {pluralize(totals.events, 'event')}, {pluralize(totals.words, 'saying')} and{' '}
                {pluralize(totals.actions, 'deed')} catalogued across the four Gospels.
              </p>
            )}

            {/* The arc at a glance. Doubles as navigation in both modes, so the
                reader can jump stretches without going back to the map first. */}
            <JesusArcBand
              views={views}
              activeSlug={periodSlug}
              onSelect={(slug) => navigate(buildJesusLifeUrl(slug))}
            />

            {!periodSlug && (
              <div className="jl-grid" data-testid="jesus-life-period-row">
                {views.map((view) => (
                  <JesusPeriodCard
                    key={view.period.slug}
                    view={view}
                    weight={jesusPeriodWeight(view.stats.events, counts)}
                    onOpen={() => navigate(buildJesusLifeUrl(view.period.slug))}
                    testId={jesusTestId('jesus-life-period', view.period.slug)}
                  />
                ))}
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

                {/* Named jumps, below the stretch the reader came for. The arc
                    band above already covers a quick hop; this is the version
                    that says where you would be going. It wraps rather than
                    scrolls, so no period is hidden off the edge. */}
                <JesusSectionLabel>Jump to another period</JesusSectionLabel>
                <div
                  data-testid="jesus-life-period-row"
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}
                >
                  <JesusPeriodChip
                    label="All periods"
                    active={false}
                    onClick={() => navigate(buildJesusLifeUrl())}
                    testId="jesus-life-period-all"
                  />
                  {views.map((view) => (
                    <JesusPeriodChip
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

/** How many events a period shows on the map before it asks you to open it. */
const PREVIEW_COUNT = 3;

/**
 * A period's events on the timeline rail.
 *
 * On the map the header stays light — the card above already carries the
 * description — and only the first few events are shown. Opened, the period
 * leads with its hero instead and every event is listed.
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
  const { period, stats, ordinal } = view;
  const events = expanded ? period.events : period.events.slice(0, PREVIEW_COUNT);
  const remaining = period.events.length - events.length;

  return (
    <section data-testid={jesusTestId('jesus-life-section', period.slug)} style={{ marginTop: 24 }}>
      {!expanded && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <JesusOrdinal n={ordinal} />
            <h2
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: FONT,
                fontSize: 17,
                fontWeight: 600,
                lineHeight: '23px',
                color: vmTokens.textPrimary,
              }}
            >
              {period.name}
            </h2>
            <JesusGospelStrip gospels={stats.gospels} label={false} />
          </div>

          {period.subtitle && (
            <p
              style={{
                marginTop: 4,
                marginLeft: 35,
                fontFamily: FONT,
                fontSize: 12,
                letterSpacing: '0.02em',
                color: vmTokens.gold,
              }}
            >
              {period.subtitle}
            </p>
          )}

          {stats.events > 0 && (
            <div style={{ marginTop: 6, marginLeft: 35 }}>
              <JesusStatRow stats={stats} compact />
            </div>
          )}
        </>
      )}

      {events.length > 0 ? (
        <div className="jl-rail">
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
                marginTop: 2,
                padding: '6px 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: FONT,
                fontSize: 14,
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
            marginTop: 12,
            fontFamily: FONT,
            fontSize: 13,
            fontStyle: 'italic',
            color: vmTokens.textTertiary,
          }}
        >
          Nothing catalogued from this period yet.
        </p>
      )}
    </section>
  );
}
