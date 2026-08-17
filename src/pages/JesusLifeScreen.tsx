import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ScreenHeader from '@/components/ScreenHeader';
import { JesusEventCardView } from '@/components/jesus/JesusEventParts';
import {
  JesusCount,
  JesusEmpty,
  JesusLoading,
  JesusPageBody,
  JesusPill,
} from '@/components/jesus/JesusParts';
import { useApp } from '@/contexts/AppContext';
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
 * Periods with no events are still rendered. The gospels are uneven — thirty
 * years pass in a sentence — and showing an empty stretch with its description
 * tells that story better than silently skipping it would.
 */
export default function JesusLifeScreen() {
  const { periodSlug } = useParams<{ periodSlug?: string }>();
  const navigate = useNavigate();
  const { state } = useApp();

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

  const activePeriod = useMemo(
    () => periods?.find((p) => p.slug === periodSlug) ?? null,
    [periods, periodSlug],
  );

  const loading = periods === null;
  const visible = periodSlug ? (activePeriod ? [activePeriod] : []) : (periods ?? []);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader
        title={activePeriod ? activePeriod.name : 'Follow His Life'}
        onBack={() => navigate(periodSlug ? buildJesusLifeUrl() : JESUS_ROOT)}
        backTestId="jesus-life-back-button"
        titleTestId="jesus-life-title"
      />

      <JesusPageBody>
        {loading ? (
          <JesusLoading />
        ) : periods.length === 0 ? (
          <JesusEmpty label="The timeline isn't available right now." />
        ) : (
          <>
            {/* Period jump row — always the full set, so the reader can move
                between stretches of the ministry without going back first. */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                padding: '16px 0 4px',
                scrollbarWidth: 'none',
              }}
              data-testid="jesus-life-period-row"
            >
              <JesusPill
                label="All"
                onClick={() => navigate(buildJesusLifeUrl())}
                active={!periodSlug}
                testId="jesus-life-period-all"
              />
              {periods.map((period) => (
                <JesusPill
                  key={period.slug}
                  label={period.name}
                  count={period.event_count}
                  active={period.slug === periodSlug}
                  onClick={() => navigate(buildJesusLifeUrl(period.slug))}
                  testId={jesusTestId('jesus-life-period', period.slug)}
                />
              ))}
            </div>

            {periodSlug && !activePeriod ? (
              <JesusEmpty label="That part of the timeline doesn't exist." />
            ) : (
              visible.map((period) => (
                <PeriodBlock
                  key={period.slug}
                  period={period}
                  expanded={!!periodSlug}
                  onOpenPeriod={() => navigate(buildJesusLifeUrl(period.slug))}
                />
              ))
            )}
          </>
        )}
      </JesusPageBody>
    </div>
  );
}

/** How many events a period shows before it asks you to open it. */
const PREVIEW_COUNT = 4;

function PeriodBlock({
  period,
  expanded,
  onOpenPeriod,
}: {
  period: JesusEventLifePeriod;
  expanded: boolean;
  onOpenPeriod: () => void;
}) {
  const events = expanded ? period.events : period.events.slice(0, PREVIEW_COUNT);
  const remaining = period.events.length - events.length;

  return (
    <section
      data-testid={jesusTestId('jesus-life-section', period.slug)}
      style={{ marginTop: 26 }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h2
          style={{
            flex: 1,
            fontFamily: FONT,
            fontSize: 18,
            fontWeight: 500,
            lineHeight: '24px',
            color: vmTokens.textPrimary,
          }}
        >
          {period.name}
        </h2>
        <JesusCount count={period.event_count} />
      </div>

      {period.subtitle && (
        <p
          style={{
            marginTop: 3,
            fontFamily: FONT,
            fontSize: 12,
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
            fontSize: 14,
            lineHeight: '21px',
            color: vmTokens.textSecondary,
          }}
        >
          {period.description}
        </p>
      )}

      {events.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginTop: 12,
            // The rail that makes the timeline read as a walk rather than a list.
            borderLeft: `1px solid ${vmTokens.divider}`,
            paddingLeft: 12,
          }}
        >
          {events.map((event, i) => (
            <JesusEventCardView key={event.slug} event={event} index={i + 1} />
          ))}

          {remaining > 0 && (
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
