import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ScreenHeader from '@/components/ScreenHeader';
import {
  JesusCount,
  JesusEmpty,
  JesusEntryCard,
  JesusLoading,
  JesusPageBody,
  JesusSectionLabel,
} from '@/components/jesus/JesusParts';
import { useApp } from '@/contexts/AppContext';
import { useOpenReference } from '@/hooks/useOpenReference';
import { JESUS_ROOT } from '@/lib/jesusSlugs';
import {
  fetchJesusCollection,
  fetchJesusEntries,
  fetchJesusOverview,
  fetchJesusThemes,
} from '@/services/jesusService';
import type { JesusEntry } from '@/services/types';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';
const PAGE_SIZE = 50;

/** Which slug segment the screen was reached through. */
export type JesusListMode = 'kind' | 'theme' | 'study';

interface Props {
  mode: JesusListMode;
}

interface ListHeader {
  title: string;
  description: string | null;
}

/**
 * JesusListScreen — one screen behind three routes.
 *
 * /jesus/browse/<kind>, /jesus/theme/<theme> and /jesus/study/<collection> are
 * the same thing to the reader: a titled list of entry cards. They differ only
 * in which filter goes to `GET /jesus/entries` and where the title comes from,
 * so they share a component rather than triplicating the list, the pagination
 * and the empty states.
 *
 * Curated studies are the one case where order is editorial rather than
 * alphabetical, so those come back whole from the collection endpoint instead
 * of being paged.
 */
export default function JesusListScreen({ mode }: Props) {
  const params = useParams<{
    kindSlug?: string;
    themeSlug?: string;
    collectionSlug?: string;
  }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const openReference = useOpenReference();

  const slug = params.kindSlug ?? params.themeSlug ?? params.collectionSlug ?? '';

  const [header, setHeader] = useState<ListHeader | null>(null);
  const [entries, setEntries] = useState<JesusEntry[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Reset when the route changes so a stale list never flashes under a new
  // title. Runs before the fetch effect below on the same commit.
  useEffect(() => {
    setHeader(null);
    setEntries(null);
    setTotal(0);
    setNotFound(false);
  }, [mode, slug]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!slug) {
        setNotFound(true);
        return;
      }

      if (mode === 'study') {
        const data = await fetchJesusCollection(slug, state.version);
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
          return;
        }
        setHeader({
          title: data.collection.name,
          description: data.collection.description ?? data.collection.subtitle,
        });
        setEntries(data.entries);
        setTotal(data.collection.entry_count || data.entries.length);
        return;
      }

      if (mode === 'kind') {
        const overview = await fetchJesusOverview(state.version);
        if (cancelled) return;
        const kind = overview.sections
          .flatMap((s) => s.kinds)
          .find((k) => k.slug === slug);
        if (!kind) {
          setNotFound(true);
          return;
        }
        setHeader({ title: kind.label, description: kind.blurb });
      } else {
        const themes = await fetchJesusThemes(state.version);
        if (cancelled) return;
        const theme = themes.find((t) => t.slug === slug);
        if (!theme) {
          setNotFound(true);
          return;
        }
        setHeader({ title: theme.name, description: theme.description });
      }

      const query = mode === 'kind' ? { kind: slug } : { theme: slug };
      const page = await fetchJesusEntries(
        { ...query, limit: PAGE_SIZE, offset: 0 },
        state.version,
      );
      if (cancelled) return;
      setEntries(page.entries);
      setTotal(page.total);
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, slug, state.version]);

  const loadMore = useCallback(async () => {
    if (!entries || mode === 'study') return;
    setLoadingMore(true);
    const query = mode === 'kind' ? { kind: slug } : { theme: slug };
    const page = await fetchJesusEntries(
      { ...query, limit: PAGE_SIZE, offset: entries.length },
      state.version,
    );
    setEntries((current) => [...(current ?? []), ...page.entries]);
    setTotal(page.total);
    setLoadingMore(false);
  }, [entries, mode, slug, state.version]);

  const loading = entries === null && !notFound;
  const hasMore = entries !== null && entries.length < total;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader
        title={header?.title ?? 'Jesus'}
        onBack={() => navigate(JESUS_ROOT)}
        backTestId="jesus-list-back-button"
        titleTestId="jesus-list-title"
      />

      <JesusPageBody>
        {notFound ? (
          <JesusEmpty label="That page doesn't exist." />
        ) : loading ? (
          <JesusLoading />
        ) : (
          <>
            {header?.description && (
              <p
                data-testid="jesus-list-description"
                style={{
                  fontFamily: FONT,
                  fontSize: 15,
                  lineHeight: '22px',
                  color: vmTokens.textSecondary,
                  padding: '16px 0 0',
                }}
              >
                {header.description}
              </p>
            )}

            <JesusSectionLabel action={<JesusCount count={total} />}>
              {total === 1 ? '1 entry' : `${total} entries`}
            </JesusSectionLabel>

            {entries.length === 0 ? (
              <JesusEmpty label="Nothing here yet." />
            ) : (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                data-testid="jesus-entry-list"
              >
                {entries.map((entry) => (
                  <JesusEntryCard
                    key={entry.slug}
                    entry={entry}
                    // A kind list is already filtered to one kind, so the
                    // eyebrow would repeat the page title on every card.
                    showKind={mode !== 'kind'}
                    onOpenReference={openReference}
                  />
                ))}
              </div>
            )}

            {hasMore && (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                data-testid="jesus-load-more"
                style={{
                  width: '100%',
                  marginTop: 12,
                  padding: '12px 0',
                  borderRadius: 12,
                  cursor: loadingMore ? 'default' : 'pointer',
                  backgroundColor: vmTokens.surfaceRaisedBg,
                  border: `1px solid ${vmTokens.divider}`,
                  fontFamily: FONT,
                  fontSize: 14,
                  color: loadingMore ? vmTokens.textTertiary : vmTokens.textPrimary,
                }}
              >
                {loadingMore ? 'Loading…' : `Show more (${total - entries.length} left)`}
              </button>
            )}
          </>
        )}
      </JesusPageBody>
    </div>
  );
}
