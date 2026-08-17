import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Search } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import { JesusEventCardView } from '@/components/jesus/JesusEventParts';
import {
  JesusCount,
  JesusEmpty,
  JesusLoading,
  JesusNavCard,
  JesusPageBody,
  JesusPill,
  JesusSectionLabel,
} from '@/components/jesus/JesusParts';
import { useApp } from '@/contexts/AppContext';
import {
  buildJesusKindUrl,
  buildJesusLifeUrl,
  buildJesusStudyUrl,
  buildJesusThemeUrl,
  jesusTestId,
} from '@/lib/jesusSlugs';
import { fetchJesusEventOverview, fetchJesusEvents } from '@/services/jesusService';
import type { JesusEventCard, JesusEventOverview } from '@/services/types';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';

/**
 * JesusHubScreen — the landing screen of the Jesus tab.
 *
 * Rendered entirely from `GET /jesus/events/overview`: sections, facet types,
 * counts, periods, themes and featured studies all come off the wire. Nothing
 * about the taxonomy is hardcoded here, so adding a type or renaming a section on
 * the backend reaches this screen (and mobile) without a client change.
 *
 * Searching swaps the browse layout for a flat result list — the same
 * affordance the Bible/Topics search uses, so the interaction is already
 * familiar.
 */
export default function JesusHubScreen() {
  const navigate = useNavigate();
  const { state } = useApp();

  const [overview, setOverview] = useState<JesusEventOverview | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<JesusEventCard[] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchJesusEventOverview(state.version).then((data) => {
      if (!cancelled) setOverview(data);
    });
    return () => {
      cancelled = true;
    };
  }, [state.version]);

  // Debounced search. An empty box drops back to the browse layout rather
  // than showing "no results".
  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    let cancelled = false;
    const timer = setTimeout(() => {
      fetchJesusEvents({ q: term, limit: 50 }, state.version).then((data) => {
        if (cancelled) return;
        setResults(data.events);
        setSearching(false);
      });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, state.version]);

  const loading = overview === null;
  const lifeCount = overview?.periods.reduce((n, p) => n + p.event_count, 0) ?? 0;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader
        title="Jesus"
        onBack={() => navigate('/read')}
        backTestId="jesus-back-button"
        titleTestId="jesus-screen-title"
      />

      <JesusPageBody>
        <p
          data-testid="jesus-hub-tagline"
          style={{
            fontFamily: FONT,
            fontSize: 15,
            lineHeight: '22px',
            color: vmTokens.textSecondary,
            padding: '16px 0 4px',
          }}
        >
          Explore His life, words, and actions
          {overview && overview.total_events > 0 ? (
            <span style={{ color: vmTokens.textTertiary }}>
              {' '}
              · {overview.total_events} events
            </span>
          ) : null}
        </p>

        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 44,
            padding: '0 14px',
            marginTop: 12,
            borderRadius: 999,
            backgroundColor: vmTokens.surfaceRaisedBg,
            border: `1px solid ${vmTokens.divider}`,
          }}
        >
          <Search size={17} style={{ color: vmTokens.textTertiary }} strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search His words and actions…"
            data-testid="jesus-search-input"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: FONT,
              fontSize: 14,
              color: vmTokens.textPrimary,
            }}
          />
        </div>

        {results !== null ? (
          <SearchResults results={results} searching={searching} query={query} />
        ) : loading ? (
          <JesusLoading label="Loading…" />
        ) : (
          <>
            {/* Follow His Life — the hero entry point */}
            <div style={{ marginTop: 20 }}>
              <JesusNavCard
                title="Follow His Life"
                blurb="A chronological journey through His ministry"
                count={lifeCount}
                emphasis
                icon={<CalendarClock size={20} strokeWidth={1.75} />}
                onClick={() => navigate(buildJesusLifeUrl())}
                testId="jesus-follow-his-life"
              />
            </div>

            {/* His Words / His Actions / Parables */}
            {overview.sections.map((section) => (
              <div key={section.section}>
                <JesusSectionLabel
                  action={<JesusCount count={section.facet_count} />}
                >
                  {section.label}
                </JesusSectionLabel>
                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: 13,
                    lineHeight: '18px',
                    color: vmTokens.textTertiary,
                    marginBottom: 10,
                  }}
                >
                  {section.blurb}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {section.types.map((type) => (
                    <JesusNavCard
                      key={type.type}
                      title={type.label}
                      blurb={type.blurb}
                      count={type.facet_count}
                      onClick={() => navigate(buildJesusKindUrl(type.slug))}
                      testId={jesusTestId('jesus-kind', type.slug)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Explore by Topic */}
            {overview.themes.length > 0 && (
              <>
                <JesusSectionLabel>Explore by Topic</JesusSectionLabel>
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
                  data-testid="jesus-theme-row"
                >
                  {overview.themes.map((theme) => (
                    <JesusPill
                      key={theme.slug}
                      label={theme.name}
                      count={theme.event_count}
                      onClick={() => navigate(buildJesusThemeUrl(theme.slug))}
                      testId={jesusTestId('jesus-theme', theme.slug)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Popular Studies */}
            {overview.collections.length > 0 && (
              <>
                <JesusSectionLabel>Popular Studies</JesusSectionLabel>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                  data-testid="jesus-studies-list"
                >
                  {overview.collections.map((collection) => (
                    <JesusNavCard
                      key={collection.slug}
                      title={collection.name}
                      blurb={collection.subtitle}
                      count={collection.event_count}
                      onClick={() => navigate(buildJesusStudyUrl(collection.slug))}
                      testId={jesusTestId('jesus-study', collection.slug)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </JesusPageBody>
    </div>
  );
}

function SearchResults({
  results,
  searching,
  query,
}: {
  results: JesusEventCard[];
  searching: boolean;
  query: string;
}) {
  if (searching && results.length === 0) return <JesusLoading label="Searching…" />;
  if (results.length === 0) {
    return <JesusEmpty label={`Nothing matches “${query.trim()}”`} />;
  }

  return (
    <>
      <JesusSectionLabel action={<JesusCount count={results.length} />}>
        Results
      </JesusSectionLabel>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        data-testid="jesus-search-results"
      >
        {results.map((event) => (
          <JesusEventCardView key={event.slug} event={event} />
        ))}
      </div>
    </>
  );
}
