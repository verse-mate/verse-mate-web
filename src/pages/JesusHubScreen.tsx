import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Search } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import {
  JesusCount,
  JesusEmpty,
  JesusEntryCard,
  JesusLoading,
  JesusNavCard,
  JesusPageBody,
  JesusPill,
  JesusSectionLabel,
} from '@/components/jesus/JesusParts';
import { useApp } from '@/contexts/AppContext';
import { useOpenReference } from '@/hooks/useOpenReference';
import {
  buildJesusKindUrl,
  buildJesusLifeUrl,
  buildJesusStudyUrl,
  buildJesusThemeUrl,
  jesusTestId,
} from '@/lib/jesusSlugs';
import { fetchJesusEntries, fetchJesusOverview } from '@/services/jesusService';
import type { JesusEntry, JesusOverview } from '@/services/types';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';

/**
 * JesusHubScreen — the landing screen of the Jesus tab.
 *
 * Rendered entirely from `GET /jesus/overview`: sections, kinds, counts,
 * periods, themes and featured studies all come off the wire. Nothing about
 * the taxonomy is hardcoded here, so adding a kind or renaming a section on
 * the backend reaches this screen (and mobile) without a client change.
 *
 * Searching swaps the browse layout for a flat result list — the same
 * affordance the Bible/Topics search uses, so the interaction is already
 * familiar.
 */
export default function JesusHubScreen() {
  const navigate = useNavigate();
  const { state } = useApp();
  const openReference = useOpenReference();

  const [overview, setOverview] = useState<JesusOverview | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<JesusEntry[] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchJesusOverview(state.version).then((data) => {
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
      fetchJesusEntries({ q: term, limit: 50 }, state.version).then((data) => {
        if (cancelled) return;
        setResults(data.entries);
        setSearching(false);
      });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, state.version]);

  const loading = overview === null;
  const lifeCount = overview?.periods.reduce((n, p) => n + p.entry_count, 0) ?? 0;

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
          {overview && overview.total_entries > 0 ? (
            <span style={{ color: vmTokens.textTertiary }}>
              {' '}
              · {overview.total_entries} entries
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
          <SearchResults
            results={results}
            searching={searching}
            query={query}
            onOpenReference={openReference}
          />
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
                  action={<JesusCount count={section.entry_count} />}
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
                  {section.kinds.map((kind) => (
                    <JesusNavCard
                      key={kind.kind}
                      title={kind.label}
                      blurb={kind.blurb}
                      count={kind.entry_count}
                      onClick={() => navigate(buildJesusKindUrl(kind.slug))}
                      testId={jesusTestId('jesus-kind', kind.slug)}
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
                      count={theme.entry_count}
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
                      count={collection.entry_count}
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
  onOpenReference,
}: {
  results: JesusEntry[];
  searching: boolean;
  query: string;
  onOpenReference: ReturnType<typeof useOpenReference>;
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
        {results.map((entry) => (
          <JesusEntryCard
            key={entry.slug}
            entry={entry}
            onOpenReference={onOpenReference}
          />
        ))}
      </div>
    </>
  );
}
