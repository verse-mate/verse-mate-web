import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import MarkdownBlock from '@/components/MarkdownBlock';
import { JesusConfidenceNote, JesusProvenanceChip } from '@/components/jesus/JesusEventParts';
import JesusStudyBody from '@/components/jesus/JesusStudyBody';
import {
  JesusTabEmpty,
  JesusTabSectionLabel,
  JesusTabToolbar,
} from '@/components/jesus/JesusTabParts';
import { useApp } from '@/contexts/AppContext';
import type { JesusTab } from '@/lib/jesusTabs';
import { buildJesusByline, stripBylineHeader } from '@/lib/jesusByline';
import { fetchCommentary } from '@/services/bibleService';
import { fetchJesusCompare } from '@/services/jesusService';
import type { Commentary, JesusCompare, JesusEventDetail } from '@/services/types';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';

/**
 * The right-pane bodies for a Jesus event — the same four tabs the Bible side
 * uses, filled from the event graph.
 *
 * Only Summary and Compare have a generated source. The other two are
 * assembled from what the Bible side already serves, narrowed to the verses
 * this event spans: By-Line from the chapter commentary (`lib/jesusByline`),
 * Study from the chapter's inductive study (`lib/jesusStudy`, rendered by
 * `JesusStudyBody`).
 */
export default function JesusTabBodies({
  tab,
  detail,
}: {
  tab: JesusTab;
  detail: JesusEventDetail;
}) {
  if (tab === 'summary') return <SummaryBody detail={detail} />;
  if (tab === 'byline') return <BylineBody detail={detail} />;
  if (tab === 'study') return <JesusStudyBody detail={detail} />;
  return <CompareBody detail={detail} />;
}

// ─── Summary ─────────────────────────────────────────────────────────────────

function SummaryBody({ detail }: { detail: JesusEventDetail }) {
  const { event, reveals, reactions } = detail;
  const overview = detail.explanation?.overview ?? null;
  const gospelCount = new Set(detail.passages.map((p) => p.book_id)).size;

  const revealGroups: { key: keyof typeof reveals; label: string }[] = [
    { key: 'says_about_himself', label: 'What He says about Himself' },
    { key: 'demonstrates', label: 'What He demonstrates' },
    { key: 'others_say', label: 'What others say' },
    { key: 'narrator_says', label: 'What the narrator says' },
  ];
  const hasReveals = revealGroups.some((g) => reveals[g.key]?.length);

  const where = [event.location, event.people.map((p) => p.person).join(', ')]
    .filter(Boolean)
    .join(' · ');

  return (
    <div>
      <JesusTabToolbar
        title={`Summary of ${event.title}`}
        provenance={overview ? 2 : null}
        copyText={`${event.title}\n\n${overview ?? event.summary ?? ''}`}
      />

      {where && (
        <p
          data-testid="jesus-event-where"
          style={{ fontFamily: FONT, fontSize: 12.5, color: vmTokens.textTertiary, margin: '0 0 14px' }}
        >
          {where}
        </p>
      )}

      {overview ? (
        <MarkdownBlock text={overview} />
      ) : event.summary ? (
        <>
          <p style={{ marginBottom: 12 }}>{event.summary}</p>
          <JesusTabEmpty testId="jesus-summary-ungenerated">
            The long-form overview for this event hasn’t been generated yet.
          </JesusTabEmpty>
        </>
      ) : (
        <JesusTabEmpty testId="jesus-summary-ungenerated">Nothing written for this event yet.</JesusTabEmpty>
      )}

      <JesusTabSectionLabel>What this reveals</JesusTabSectionLabel>
      {hasReveals ? (
        <div data-testid="jesus-event-reveals">
          {revealGroups.map((g) => {
            const items = reveals[g.key] ?? [];
            if (!items.length) return null;
            return (
              <div key={g.key} style={{ marginBottom: 14 }}>
                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: vmTokens.gold,
                    margin: '0 0 5px',
                  }}
                >
                  {g.label}
                </p>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ marginBottom: 5 }}>
                      {item.content}
                      {item.source_ref && (
                        <span style={{ color: vmTokens.textTertiary }}> ({item.source_ref})</span>
                      )}
                      {item.provenance > 1 && (
                        <span style={{ marginLeft: 6 }}>
                          <JesusProvenanceChip level={item.provenance} />
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <JesusTabEmpty>Nothing recorded for this event yet.</JesusTabEmpty>
      )}

      <JesusTabSectionLabel>How people reacted</JesusTabSectionLabel>
      {reactions.length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: 18 }} data-testid="jesus-event-reactions">
          {reactions.map((r, i) => (
            <li key={i} style={{ marginBottom: 5 }}>
              <strong style={{ fontWeight: 600 }}>{r.who}</strong> — {r.what}
              {r.source_ref && (
                <span style={{ color: vmTokens.textTertiary }}> ({r.source_ref})</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <JesusTabEmpty>Nothing recorded for this event yet.</JesusTabEmpty>
      )}

      <JesusConfidenceNote
        chronology={event.chronology_confidence}
        parallel={event.parallel_confidence}
        gospelCount={gospelCount}
      />
    </div>
  );
}

// ─── By-Line ─────────────────────────────────────────────────────────────────

/**
 * Assembled from the chapter commentary the Bible side already serves, filtered
 * to the verses this event spans — so it carries real content today rather than
 * waiting on event-scoped generation.
 */
function BylineBody({ detail }: { detail: JesusEventDetail }) {
  const primary = useMemo(
    () => detail.passages.find((p) => p.is_primary) ?? detail.passages[0] ?? null,
    [detail.passages],
  );
  const [commentaries, setCommentaries] = useState<Commentary[] | null>(null);
  const [expanded, setExpanded] = useState<number | null>(-2); // -2 = all open

  useEffect(() => {
    if (!primary) {
      setCommentaries([]);
      return;
    }
    let cancelled = false;
    setCommentaries(null);
    fetchCommentary(primary.book_name, primary.chapter).then((rows) => {
      if (!cancelled) setCommentaries(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [primary]);

  const rows = useMemo(
    () => buildJesusByline(primary, commentaries ?? []),
    [primary, commentaries],
  );
  const allExpanded = expanded === -2;

  return (
    <div>
      <JesusTabToolbar
        title={`Line-by-Line Analysis of ${detail.event.title}`}
        copyText={rows.map((r) => `${r.reference}\n${stripBylineHeader(r.detail)}`).join('\n\n')}
      />

      {commentaries === null ? (
        <JesusTabEmpty>Loading…</JesusTabEmpty>
      ) : rows.length === 0 ? (
        <JesusTabEmpty testId="jesus-byline-empty">
          No line-by-line commentary is available for {primary?.display ?? 'this passage'} yet.
        </JesusTabEmpty>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              className="expand-all-btn"
              onClick={() => setExpanded(allExpanded ? null : -2)}
              data-testid="jesus-byline-expand-all"
            >
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
          <div className="byline-list" data-testid="jesus-byline-list">
            {rows.map((row) => {
              const open = allExpanded || expanded === row.verse;
              return (
                <div key={row.verse} className={`byline-row ${open ? 'open' : ''}`}>
                  <button
                    className="byline-toggle"
                    onClick={() => setExpanded(open ? null : row.verse)}
                  >
                    <span className="byline-ref-sm">{row.reference}</span>
                    {open ? (
                      <ChevronUp size={16} color={vmTokens.textSecondary} style={{ flexShrink: 0 }} />
                    ) : (
                      <ChevronDown size={16} color={vmTokens.textSecondary} style={{ flexShrink: 0 }} />
                    )}
                  </button>
                  {open && (
                    <div className="byline-body">
                      {row.text && <blockquote className="byline-verse-quote">{row.text}</blockquote>}
                      <div className="byline-summary-label">Summary</div>
                      <div className="byline-summary-text">
                        <MarkdownBlock text={stripBylineHeader(row.detail)} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Compare ─────────────────────────────────────────────────────────────────

function CompareBody({ detail }: { detail: JesusEventDetail }) {
  const { state } = useApp();
  const slug = detail.event.slug;
  const [compare, setCompare] = useState<JesusCompare | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCompare(null);
    setFailed(false);
    fetchJesusCompare(slug, state.version).then((data) => {
      if (cancelled) return;
      if (data) setCompare(data);
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, state.version]);

  if (failed) return <JesusTabEmpty>Couldn’t load the comparison.</JesusTabEmpty>;
  if (!compare) return <JesusTabEmpty>Loading…</JesusTabEmpty>;

  const recorded = compare.accounts.filter((a) => a.records_it).length;

  return (
    <div>
      <JesusTabToolbar
        title={`Compare the accounts of ${detail.event.title}`}
        provenance={compare.note_provenance}
        copyText={`${detail.event.title}\n\n${compare.note ?? ''}`}
      />
      <p style={{ fontFamily: FONT, fontSize: 14, color: vmTokens.textSecondary, margin: '0 0 14px' }}>
        {recorded} of the four Gospels record this event. Absent accounts are marked rather than
        omitted, so a gap always reads as a fact about the text.
      </p>

      <div
        data-testid="jesus-compare-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}
      >
        {compare.accounts.map((a) => (
          <div
            key={a.gospel}
            style={{
              background: a.records_it ? vmTokens.surfaceRaisedBg : 'transparent',
              border: `1px ${a.records_it ? 'solid' : 'dashed'} ${vmTokens.divider}`,
              borderRadius: 8,
              padding: '11px 12px',
              minWidth: 0,
            }}
          >
            <p
              style={{
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: a.records_it ? vmTokens.gold : vmTokens.textTertiary,
                margin: '0 0 3px',
              }}
            >
              {a.gospel}
            </p>
            {a.records_it ? (
              <>
                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: 11.5,
                    color: vmTokens.textTertiary,
                    margin: '0 0 8px',
                  }}
                >
                  {a.passages.map((p) => p.display).join(', ')}
                </p>
                {a.passages.map(
                  (p) =>
                    p.unique_to_account && (
                      <p
                        key={p.display}
                        style={{ fontSize: 14, lineHeight: '20px', color: vmTokens.textSecondary, margin: 0 }}
                      >
                        {p.unique_to_account}
                      </p>
                    ),
                )}
              </>
            ) : (
              <p
                style={{
                  fontSize: 14,
                  fontStyle: 'italic',
                  color: vmTokens.textTertiary,
                  margin: 0,
                }}
              >
                Does not record this event.
              </p>
            )}
          </div>
        ))}
      </div>

      {compare.note ? (
        <>
          <JesusTabSectionLabel>Where they differ</JesusTabSectionLabel>
          <MarkdownBlock text={compare.note} />
        </>
      ) : (
        <>
          <JesusTabSectionLabel>Where they differ</JesusTabSectionLabel>
          <JesusTabEmpty testId="jesus-compare-ungenerated">
            The comparison hasn’t been written for this event yet.
          </JesusTabEmpty>
        </>
      )}

      <JesusConfidenceNote
        chronology={detail.event.chronology_confidence}
        parallel={compare.parallel_confidence}
        gospelCount={recorded}
      />
    </div>
  );
}
