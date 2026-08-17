import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import MarkdownBlock from '@/components/MarkdownBlock';
import ScreenHeader from '@/components/ScreenHeader';
import {
  JesusEmpty,
  JesusLoading,
  JesusPageBody,
  JesusPill,
  JesusSectionLabel,
} from '@/components/jesus/JesusParts';
import {
  JesusConfidenceNote,
  JesusEventCardView,
  JesusFacetList,
  JesusPassageBlock,
  JesusProvenanceChip,
} from '@/components/jesus/JesusEventParts';
import { useApp } from '@/contexts/AppContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useOpenReference } from '@/hooks/useOpenReference';
import { buildJesusLifeUrl, buildJesusThemeUrl, jesusTestId, JESUS_ROOT } from '@/lib/jesusSlugs';
import { fetchJesusCompare, fetchJesusEvent } from '@/services/jesusService';
import type { JesusCompare, JesusEventDetail } from '@/services/types';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';

type EventTab = 'overview' | 'words' | 'actions' | 'compare' | 'insights';

const TABS: { id: EventTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'words', label: 'Words' },
  { id: 'actions', label: 'Actions' },
  { id: 'compare', label: 'Compare' },
  { id: 'insights', label: 'Insights' },
];

function isEventTab(value: string | null): value is EventTab {
  return !!value && TABS.some((t) => t.id === value);
}

/**
 * JesusEventScreen — the centre of the feature.
 *
 * Five tabs in the order a reader wants them: what happened, what He said,
 * what He did, how the Gospels differ, and what it means. Words and Actions
 * arrive already split by the API, so the client never re-derives the grouping.
 *
 * Compare is fetched lazily — it is the only tab that costs an extra request,
 * and most sessions never open it.
 *
 * The active tab lives in the query string so a link to the Compare tab of an
 * event is shareable, which is the whole point of having a Compare tab.
 */
export default function JesusEventScreen() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const openReference = useOpenReference();
  const isWide = useMediaQuery('(min-width: 768px)');

  const [detail, setDetail] = useState<JesusEventDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [compare, setCompare] = useState<JesusCompare | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const tabParam = searchParams.get('tab');
  const tab: EventTab = isEventTab(tabParam) ? tabParam : 'overview';

  const setTab = (next: EventTab) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'overview') params.delete('tab');
    else params.set('tab', next);
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    if (!eventSlug) {
      setNotFound(true);
      return;
    }
    let cancelled = false;
    setDetail(null);
    setCompare(null);
    compareRequestKey.current = null;
    setNotFound(false);

    fetchJesusEvent(eventSlug, state.version).then((data) => {
      if (cancelled) return;
      if (!data) setNotFound(true);
      else setDetail(data);
    });

    return () => {
      cancelled = true;
    };
  }, [eventSlug, state.version]);

  // Compare costs an extra round trip, so it loads only when opened.
  //
  // The in-flight request is tracked in a ref rather than in the effect's
  // dependencies. Guarding on `compareLoading` state instead would make the
  // effect re-run the moment it set that state, and the re-run's cleanup would
  // cancel the request it had just started — leaving the tab loading forever.
  const compareRequestKey = useRef<string | null>(null);
  useEffect(() => {
    if (tab !== 'compare' || !eventSlug) return;
    const key = `${eventSlug}|${state.version}`;
    if (compareRequestKey.current === key) return;
    compareRequestKey.current = key;

    let cancelled = false;
    setCompareLoading(true);
    fetchJesusCompare(eventSlug, state.version).then((data) => {
      if (cancelled) return;
      setCompare(data);
      setCompareLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [tab, eventSlug, state.version]);

  const event = detail?.event;

  const counts = useMemo(
    () => ({
      words: detail?.words.length ?? 0,
      actions: detail?.actions.length ?? 0,
    }),
    [detail],
  );

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      {/* The nav bar shows the period, not the title — the title is the h1
          immediately below it, and repeating it wastes the one line of chrome
          a phone can spare. */}
      <ScreenHeader
        title={event?.period_name ?? 'Jesus'}
        onBack={() => navigate(-1)}
        backTestId="jesus-event-back-button"
        titleTestId="jesus-event-header-title"
      />

      <JesusPageBody>
        {notFound ? (
          <div style={{ paddingTop: 32 }}>
            <JesusEmpty label="We couldn't find that event." />
            <button
              type="button"
              onClick={() => navigate(JESUS_ROOT)}
              style={{
                display: 'block',
                margin: '0 auto',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: FONT,
                fontSize: 14,
                color: vmTokens.gold,
              }}
            >
              Back to Jesus
            </button>
          </div>
        ) : !detail || !event ? (
          <JesusLoading />
        ) : (
          <>
            <h1
              data-testid="jesus-event-title"
              style={{
                fontFamily: FONT,
                fontSize: 24,
                fontWeight: 500,
                lineHeight: '30px',
                color: vmTokens.textPrimary,
                paddingTop: 16,
              }}
            >
              {event.title}
            </h1>

            <p
              data-testid="jesus-event-accounts"
              style={{
                marginTop: 6,
                fontFamily: FONT,
                fontSize: 13,
                color: vmTokens.gold,
              }}
            >
              {event.passages.map((p) => p.display).join(' · ')}
            </p>

            {event.period_name && (
              <button
                type="button"
                onClick={() =>
                  event.period_slug && navigate(buildJesusLifeUrl(event.period_slug))
                }
                data-testid="jesus-event-period"
                style={{
                  marginTop: 8,
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  cursor: event.period_slug ? 'pointer' : 'default',
                  fontFamily: FONT,
                  fontSize: 13,
                  color: vmTokens.textSecondary,
                }}
              >
                {event.period_name}
              </button>
            )}

            {/* A reconstructed sequence is never presented as though scripture
                specified it. */}
            <JesusConfidenceNote
              chronology={event.chronology_confidence}
              parallel={event.parallel_confidence}
              gospelCount={event.gospels.length}
            />

            {/* Tabs — scroll horizontally on a phone rather than wrapping. */}
            <div
              data-testid="jesus-event-tabs"
              style={{
                display: 'flex',
                gap: 2,
                marginTop: 20,
                marginBottom: 4,
                overflowX: 'auto',
                borderBottom: `1px solid ${vmTokens.divider}`,
                scrollbarWidth: 'none',
              }}
            >
              {TABS.map((t) => {
                const badge =
                  t.id === 'words' ? counts.words : t.id === 'actions' ? counts.actions : null;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    data-testid={`jesus-event-tab-${t.id}`}
                    aria-pressed={active}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '10px 14px',
                      whiteSpace: 'nowrap',
                      background: 'none',
                      border: 'none',
                      borderBottom: `2px solid ${active ? vmTokens.gold : 'transparent'}`,
                      cursor: 'pointer',
                      fontFamily: FONT,
                      fontSize: 14,
                      fontWeight: active ? 600 : 400,
                      color: active ? vmTokens.textPrimary : vmTokens.textSecondary,
                    }}
                  >
                    {t.label}
                    {badge != null && badge > 0 && (
                      <span style={{ fontSize: 11, color: vmTokens.textTertiary }}>{badge}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div data-testid={`jesus-event-panel-${tab}`} style={{ paddingTop: 8 }}>
              {tab === 'overview' && (
                <OverviewTab detail={detail} onOpenReference={openReference} />
              )}

              {tab === 'words' && (
                <JesusFacetList
                  facets={detail.words}
                  emptyLabel="No words of Jesus catalogued for this event yet."
                  onOpenReference={openReference}
                  testId="jesus-event-words"
                />
              )}

              {tab === 'actions' && (
                <JesusFacetList
                  facets={detail.actions}
                  emptyLabel="No actions catalogued for this event yet."
                  onOpenReference={openReference}
                  testId="jesus-event-actions"
                />
              )}

              {tab === 'compare' && (
                <CompareTab
                  compare={compare}
                  loading={compareLoading}
                  wide={isWide}
                  onOpenReference={openReference}
                />
              )}

              {tab === 'insights' && <InsightsTab detail={detail} />}
            </div>

            {detail.related.length > 0 && (
              <>
                <JesusSectionLabel>Read next</JesusSectionLabel>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                  data-testid="jesus-event-related"
                >
                  {detail.related.map((related) => (
                    <JesusEventCardView key={related.slug} event={related} />
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

function OverviewTab({
  detail,
  onOpenReference,
}: {
  detail: JesusEventDetail;
  onOpenReference: ReturnType<typeof useOpenReference>;
}) {
  const { event, passages, reveals, reactions, explanation } = detail;
  const narrative = explanation.overview?.trim();

  const revealGroups: { key: keyof typeof reveals; label: string; hint: string }[] = [
    { key: 'says_about_himself', label: 'He says of Himself', hint: 'His own words' },
    { key: 'demonstrates', label: 'He demonstrates', hint: 'shown by what He does' },
    { key: 'others_say', label: 'Others say', hint: 'not Jesus speaking' },
    { key: 'narrator_says', label: 'The Gospel writer says', hint: 'narration, not Jesus' },
  ];

  const hasReveals = revealGroups.some((g) => reveals[g.key]?.length);

  return (
    <>
      {event.location || event.people.length > 0 ? (
        <p
          data-testid="jesus-event-setting"
          style={{
            fontFamily: FONT,
            fontSize: 14,
            color: vmTokens.textSecondary,
            marginBottom: 12,
          }}
        >
          {event.location && (
            <>
              <strong style={{ color: vmTokens.textPrimary }}>Where</strong> {event.location}
            </>
          )}
          {event.location && event.people.length > 0 && ' · '}
          {event.people.length > 0 && (
            <>
              <strong style={{ color: vmTokens.textPrimary }}>Who</strong>{' '}
              {event.people.map((p) => p.person).join(', ')}
            </>
          )}
        </p>
      ) : null}

      {narrative ? (
        <div
          data-testid="jesus-event-narrative"
          style={{ fontFamily: FONT, fontSize: 15, lineHeight: '24px', color: vmTokens.textPrimary }}
        >
          <MarkdownBlock text={narrative} />
        </div>
      ) : event.summary ? (
        <p
          data-testid="jesus-event-narrative"
          style={{ fontFamily: FONT, fontSize: 15, lineHeight: '24px', color: vmTokens.textPrimary }}
        >
          {event.summary}
        </p>
      ) : null}

      {event.themes.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {event.themes.map((theme) => (
            <ThemePill key={theme.slug} slug={theme.slug} name={theme.name} />
          ))}
        </div>
      )}

      <JesusSectionLabel>Scripture</JesusSectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} data-testid="jesus-event-passages">
        {passages.length > 0
          ? passages.map((passage) => (
              <JesusPassageBlock
                key={passage.display}
                passage={passage}
                onOpen={() =>
                  onOpenReference({
                    book_id: passage.book_id,
                    book_name: passage.book_name,
                    chapter: passage.chapter,
                  })
                }
              />
            ))
          : event.passages.map((passage) => (
              <button
                key={passage.display}
                type="button"
                onClick={() =>
                  onOpenReference({
                    book_id: passage.book_id,
                    book_name: passage.book_name,
                    chapter: passage.chapter,
                  })
                }
                data-testid={jesusTestId('jesus-event-reference', passage.display)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 12,
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: 12,
                  backgroundColor: vmTokens.surfaceRaisedBg,
                  border: `1px solid ${vmTokens.divider}`,
                  fontFamily: FONT,
                  fontSize: 15,
                  color: vmTokens.textPrimary,
                }}
              >
                <BookOpen size={15} strokeWidth={1.75} style={{ color: vmTokens.gold }} />
                {passage.display}
              </button>
            ))}
      </div>

      {hasReveals && (
        <>
          <JesusSectionLabel>What this reveals</JesusSectionLabel>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            data-testid="jesus-event-reveals"
          >
            {revealGroups.map((group) => {
              const items = reveals[group.key] ?? [];
              if (items.length === 0) return null;
              return (
                <div key={group.key} data-testid={`jesus-reveal-${group.key}`}>
                  <p
                    style={{
                      fontFamily: FONT,
                      fontSize: 12,
                      fontWeight: 600,
                      color: vmTokens.textPrimary,
                      marginBottom: 2,
                    }}
                  >
                    {group.label}{' '}
                    <span style={{ fontWeight: 400, color: vmTokens.textTertiary }}>
                      — {group.hint}
                    </span>
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {items.map((item) => (
                      <li
                        key={item.content}
                        style={{
                          fontFamily: FONT,
                          fontSize: 14,
                          lineHeight: '21px',
                          color: vmTokens.textSecondary,
                          marginBottom: 4,
                        }}
                      >
                        {item.content}
                        {item.source_ref && (
                          <span style={{ color: vmTokens.textTertiary }}> ({item.source_ref})</span>
                        )}
                        <JesusProvenanceChip level={item.provenance} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </>
      )}

      {reactions.length > 0 && (
        <>
          <JesusSectionLabel>How people reacted</JesusSectionLabel>
          <ul style={{ margin: 0, paddingLeft: 18 }} data-testid="jesus-event-reactions">
            {reactions.map((reaction) => (
              <li
                key={`${reaction.who}-${reaction.what}`}
                style={{
                  fontFamily: FONT,
                  fontSize: 14,
                  lineHeight: '21px',
                  color: vmTokens.textSecondary,
                  marginBottom: 4,
                }}
              >
                <strong style={{ color: vmTokens.textPrimary }}>{reaction.who}</strong>{' '}
                {reaction.what}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function ThemePill({ slug, name }: { slug: string; name: string }) {
  const navigate = useNavigate();
  return (
    <JesusPill
      label={name}
      onClick={() => navigate(buildJesusThemeUrl(slug))}
      testId={jesusTestId('jesus-event-theme', slug)}
    />
  );
}

/**
 * Compare — a true four-column synopsis on desktop, stacked per-Gospel blocks
 * on a phone. A horizontally scrolling four-column table on a 390px screen is
 * unreadable, so the mobile layout restructures rather than shrinking.
 */
function CompareTab({
  compare,
  loading,
  wide,
  onOpenReference,
}: {
  compare: JesusCompare | null;
  loading: boolean;
  wide: boolean;
  onOpenReference: ReturnType<typeof useOpenReference>;
}) {
  if (loading) return <JesusLoading label="Loading the accounts…" />;
  if (!compare) return <JesusEmpty label="Comparison isn't available for this event." />;

  const recorded = compare.accounts.filter((a) => a.records_it);

  return (
    <div data-testid="jesus-compare">
      <p
        style={{
          fontFamily: FONT,
          fontSize: 14,
          color: vmTokens.textSecondary,
          marginBottom: 12,
        }}
      >
        {recorded.length === 1
          ? `Only ${recorded[0].gospel} records this event.`
          : `Recorded in ${compare.shared_by.join(', ')}.`}
      </p>

      {compare.note && (
        <div
          data-testid="jesus-compare-note"
          style={{
            fontFamily: FONT,
            fontSize: 15,
            lineHeight: '24px',
            color: vmTokens.textPrimary,
            marginBottom: 16,
          }}
        >
          <MarkdownBlock text={compare.note} />
          {compare.note_provenance != null && (
            <JesusProvenanceChip level={compare.note_provenance} />
          )}
        </div>
      )}

      <div
        style={{
          display: wide ? 'grid' : 'flex',
          flexDirection: wide ? undefined : 'column',
          gridTemplateColumns: wide
            ? `repeat(${Math.max(compare.accounts.length, 1)}, minmax(0, 1fr))`
            : undefined,
          gap: 10,
        }}
      >
        {compare.accounts.map((account) => (
          <div
            key={account.gospel}
            data-testid={jesusTestId('jesus-compare-account', account.gospel)}
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: account.records_it ? vmTokens.surfaceRaisedBg : 'transparent',
              border: `1px solid ${vmTokens.divider}`,
              // An account that doesn't record the event stays visible and
              // greyed — its absence is information.
              opacity: account.records_it ? 1 : 0.55,
            }}
          >
            <p
              style={{
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 600,
                color: account.records_it ? vmTokens.gold : vmTokens.textTertiary,
                marginBottom: 6,
              }}
            >
              {account.gospel}
            </p>

            {account.records_it ? (
              account.passages.map((passage) => (
                <div key={passage.display} style={{ marginBottom: 8 }}>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenReference({
                        book_id: passage.book_id,
                        book_name: passage.book_name,
                        chapter: passage.chapter,
                      })
                    }
                    style={{
                      padding: 0,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: FONT,
                      fontSize: 13,
                      color: vmTokens.textPrimary,
                      fontWeight: 500,
                    }}
                  >
                    {passage.display}
                  </button>
                  {passage.emphasis && (
                    <p
                      style={{
                        marginTop: 4,
                        fontFamily: FONT,
                        fontSize: 13,
                        lineHeight: '19px',
                        color: vmTokens.textSecondary,
                      }}
                    >
                      {passage.emphasis}
                    </p>
                  )}
                  {passage.unique_to_account && (
                    <p
                      style={{
                        marginTop: 4,
                        fontFamily: FONT,
                        fontSize: 12,
                        lineHeight: '18px',
                        color: vmTokens.gold,
                      }}
                    >
                      Only here: {passage.unique_to_account}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: 13,
                  fontStyle: 'italic',
                  color: vmTokens.textTertiary,
                }}
              >
                Does not record this event.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightsTab({ detail }: { detail: JesusEventDetail }) {
  const insights = detail.explanation.insights?.trim();
  const application = detail.explanation.application?.trim();

  if (!insights && !application) {
    return (
      <JesusEmpty label="Insight for this event hasn't been written yet." />
    );
  }

  return (
    <div data-testid="jesus-event-insights">
      {insights && (
        <div
          style={{
            fontFamily: FONT,
            fontSize: 15,
            lineHeight: '24px',
            color: vmTokens.textPrimary,
          }}
        >
          <MarkdownBlock text={insights} />
          <JesusProvenanceChip level={3} />
        </div>
      )}

      {application && (
        <>
          <JesusSectionLabel>Apply</JesusSectionLabel>
          <ul style={{ margin: 0, paddingLeft: 18 }} data-testid="jesus-event-application">
            {application
              .split('\n')
              .map((line) => line.replace(/^[-*\d.\s]+/, '').trim())
              .filter(Boolean)
              .map((question) => (
                <li
                  key={question}
                  style={{
                    fontFamily: FONT,
                    fontSize: 15,
                    lineHeight: '23px',
                    color: vmTokens.textPrimary,
                    marginBottom: 8,
                  }}
                >
                  {question}
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
}
