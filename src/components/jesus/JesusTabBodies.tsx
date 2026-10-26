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
import { bylineChapters, buildJesusBylineSections, stripBylineHeader } from '@/lib/jesusByline';
import { jesusTestId } from '@/lib/jesusSlugs';
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
        copyText={`${event.title}\n\n${overview ?? event.summary ?? ''}`}
      />

      {where && (
        <p
          data-testid="jesus-event-where"
          style={{ fontFamily: FONT, fontSize: 13, color: vmTokens.textSecondary, margin: '0 0 14px' }}
        >
          {where}
        </p>
      )}

      {overview ? (
        <MarkdownBlock text={overview} />
      ) : event.summary ? (
        <p style={{ marginBottom: 12 }}>{event.summary}</p>
      ) : null}

      {hasReveals && (
        <>
          <JesusTabSectionLabel>What this reveals</JesusTabSectionLabel>
          <div data-testid="jesus-event-reveals">
            {revealGroups.map((g) => {
              const items = reveals[g.key] ?? [];
              if (!items.length) return null;
              return (
                <div key={g.key} style={{ marginBottom: 14 }}>
                  <p
                    style={{
                      fontFamily: FONT,
                      fontSize: 12,
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
        </>
      )}

      {reactions.length > 0 && (
        <>
          <JesusTabSectionLabel>How people reacted</JesusTabSectionLabel>
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
        </>
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

/** Sentinel for "every row open", the state the tab lands in. */
const ALL_OPEN = '*';

/**
 * Assembled from the chapter commentary the Bible side already serves, filtered
 * to the verses this event spans — so it carries real content today rather than
 * waiting on event-scoped generation.
 *
 * Every account gets a section, not just the primary one. An event that Matthew
 * and Mark both tell prints both in the left column, and a By-Line tab that
 * covered only Matthew left Mark's verses looking like they had no explanation
 * at all. Accounts whose chapter has no byline generated yet say so in place,
 * which is the honest version of the same gap.
 */
function BylineBody({ detail }: { detail: JesusEventDetail }) {
  const passages = detail.passages;
  const chapters = useMemo(() => bylineChapters(passages), [passages]);

  // Keyed by `bylineChapterKey`; null until every chapter has answered.
  const [byChapter, setByChapter] = useState<Map<string, Commentary[]> | null>(null);
  const [expanded, setExpanded] = useState<string | null>(ALL_OPEN);

  useEffect(() => {
    let cancelled = false;
    setByChapter(null);
    if (chapters.length === 0) {
      setByChapter(new Map());
      return;
    }
    Promise.all(
      chapters.map((c) =>
        fetchCommentary(c.book_name, c.chapter).then(
          (rows) => [c.key, rows] as const,
          () => [c.key, [] as Commentary[]] as const,
        ),
      ),
    ).then((entries) => {
      if (!cancelled) setByChapter(new Map(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [chapters]);

  const sections = useMemo(
    () => (byChapter ? buildJesusBylineSections(passages, byChapter) : []),
    [passages, byChapter],
  );

  const total = sections.reduce((n, s) => n + s.rows.length, 0);
  const allExpanded = expanded === ALL_OPEN;
  // One account needs no heading — the toolbar title and every row already
  // name it. Two or more, and the reader has to be told which telling is which.
  const labelled = sections.length > 1;

  return (
    <div>
      <JesusTabToolbar
        title={`Line-by-Line Analysis of ${detail.event.title}`}
        copyText={sections
          .filter((s) => s.rows.length > 0)
          .map((s) =>
            [
              labelled ? s.display : null,
              ...s.rows.map((r) => `${r.reference}\n${stripBylineHeader(r.detail)}`),
            ]
              .filter(Boolean)
              .join('\n\n'),
          )
          .join('\n\n')}
      />

      {byChapter === null ? (
        <JesusTabEmpty>Loading…</JesusTabEmpty>
      ) : total === 0 ? (
        <JesusTabEmpty testId="jesus-byline-empty">
          No line-by-line commentary is available for{' '}
          {passages.map((p) => p.display).join(', ') || 'this passage'} yet.
        </JesusTabEmpty>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              className="expand-all-btn"
              onClick={() => setExpanded(allExpanded ? null : ALL_OPEN)}
              data-testid="jesus-byline-expand-all"
            >
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          {sections.map((section) => (
            <div key={section.display} data-testid={jesusTestId('jesus-byline-account', section.display)}>
              {labelled && <JesusTabSectionLabel>{section.display}</JesusTabSectionLabel>}
              {section.rows.length === 0 ? (
                <JesusTabEmpty testId={jesusTestId('jesus-byline-account-empty', section.display)}>
                  The line-by-line reading of {section.display} hasn’t been generated yet.
                </JesusTabEmpty>
              ) : (
                <div className="byline-list" data-testid="jesus-byline-list">
                  {section.rows.map((row) => {
                    const open = allExpanded || expanded === row.key;
                    return (
                      <div key={row.key} className={`byline-row ${open ? 'open' : ''}`}>
                        <button
                          className="byline-toggle"
                          onClick={() => setExpanded(open ? null : row.key)}
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
              )}
            </div>
          ))}
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
        copyText={`${detail.event.title}\n\n${compare.note ?? ''}`}
      />
      <p style={{ fontFamily: FONT, fontSize: 14, color: vmTokens.textSecondary, margin: '0 0 14px' }}>
        {recorded} of the four Gospels record this event. Absent accounts are marked rather than
        omitted, so a gap always reads as a fact about the text.
      </p>

      {/* One hairline-separated row per gospel — the By Line tab's shape —
          rather than a grid of boxed cards. */}
      <div data-testid="jesus-compare-grid" style={{ display: 'flex', flexDirection: 'column' }}>
        {compare.accounts.map((a, i) => (
          <div
            key={a.gospel}
            style={{
              padding: '12px 0 14px',
              borderTop: `1px solid ${vmTokens.divider}`,
              borderBottom:
                i === compare.accounts.length - 1 ? `1px solid ${vmTokens.divider}` : undefined,
              minWidth: 0,
            }}
          >
            <p
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12,
                margin: 0,
              }}
            >
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: a.records_it ? vmTokens.gold : vmTokens.textSecondary,
                }}
              >
                {a.gospel}
              </span>
              {a.records_it && (
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 13,
                    color: vmTokens.textSecondary,
                    fontFeatureSettings: "'tnum'",
                    textAlign: 'right',
                  }}
                >
                  {a.passages.map((p) => p.display).join(', ')}
                </span>
              )}
            </p>
            {a.records_it ? (
              a.passages.map(
                (p) =>
                  p.unique_to_account && (
                    <p
                      key={p.display}
                      style={{
                        fontFamily: "'Roboto Serif', Georgia, serif",
                        fontSize: '0.85em',
                        lineHeight: 1.6,
                        color: vmTokens.textPrimary,
                        margin: '8px 0 0',
                      }}
                    >
                      {p.unique_to_account}
                    </p>
                  ),
              )
            ) : (
              <p
                style={{
                  fontFamily: "'Roboto Serif', Georgia, serif",
                  fontSize: '0.85em',
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  color: vmTokens.textSecondary,
                  margin: '6px 0 0',
                }}
              >
                Does not record this event.
              </p>
            )}
          </div>
        ))}
      </div>

      {compare.note && (
        <>
          <JesusTabSectionLabel>Where they differ</JesusTabSectionLabel>
          <MarkdownBlock text={compare.note} />
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
