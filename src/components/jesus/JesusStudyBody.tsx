import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { JesusFacetList, JesusProvenanceChip } from '@/components/jesus/JesusEventParts';
import { JesusTabEmpty, JesusTabToolbar } from '@/components/jesus/JesusTabParts';
import { Card, SectionHeading } from '@/components/study/StudyPrimitives';
import { ApplicationCard, MovementCard } from '@/components/study/StudySections';
import { StepCard } from '@/components/study/StudySteps';
import {
  cardHeadingTitleStyle,
  renderInlineItalic,
  sectionIntroStyle,
} from '@/components/study/studyStyles';
import { useApp } from '@/contexts/AppContext';
import { useOpenReference } from '@/hooks/useOpenReference';
import { usePreferredLanguage } from '@/hooks/usePreferredLanguage';
import { useStudyLabels } from '@/hooks/useStudyLabels';
import {
  eventVerseSpan,
  narrowStudyToEvent,
  type EventVerseSpan,
  type NarrowedStudy,
} from '@/lib/jesusStudy';
import { buildEventStudyCopyText, REVEAL_GROUPS } from '@/lib/jesusStudyCopy';
import { buildJesusEventUrl, jesusTestId } from '@/lib/jesusSlugs';
import { fetchStudy } from '@/services/bibleService';
import type { JesusEventDetail } from '@/services/types';
import { vmTokens } from '@/styles/themeStyles';
import type { InductiveStudy } from '@versemate/studies';

const FONT = 'Roboto, sans-serif';

/**
 * The Study tab for a Jesus event — the full Precept inductive study, scoped
 * to the pericope.
 *
 * Two sources, one page:
 *
 *  - The chapter's inductive study, narrowed to the event's verses by
 *    `lib/jesusStudy`. Every observation step, interpretation movement and
 *    application question that touches the passage renders through the same
 *    components the Bible side's `StudyPanel` uses, so the two tabs are the
 *    same study in the same skin.
 *  - The event graph itself — what He says, what He does, who was there, how
 *    people reacted, what it reveals — which the chapter study has no way to
 *    know. These are observation and interpretation in the Precept sense, so
 *    they sit inside those sections rather than in a sidebar of their own.
 *
 * Cards whose chapter content carries no verse tags (the prayer step, the
 * chapter theme) are kept and marked "chapter context" instead of dropped:
 * the nine-step spine survives, and the reader is told which cards are about
 * the whole chapter rather than this passage.
 */
export default function JesusStudyBody({ detail }: { detail: JesusEventDetail }) {
  const { state } = useApp();
  const navigate = useNavigate();
  const onOpenReference = useOpenReference();
  const language = usePreferredLanguage();
  const labels = useStudyLabels(language);

  const primary = useMemo(
    () => detail.passages.find((p) => p.is_primary) ?? detail.passages[0] ?? null,
    [detail.passages],
  );
  const span = useMemo(() => eventVerseSpan(primary), [primary]);

  const [study, setStudy] = useState<InductiveStudy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!span) {
      setStudy(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchStudy(span.bookId, span.chapter, language).then((found) => {
      if (cancelled) return;
      setStudy(found);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [span, language]);

  const narrowed = useMemo<NarrowedStudy | null>(
    () => (study && span ? narrowStudyToEvent(study, span) : null),
    [study, span],
  );

  // Match the Bible side: body text tracks the user's reading size, pills and
  // captions keep their own fixed sizes.
  const bodyFontSize = state.settings.fontSize;
  const bodyLineHeight = Math.round(bodyFontSize * 1.55);

  // Collapsed by default so the reader lands on a scannable outline, with the
  // choice persisted per event (the split-view layout unmounts this pane on
  // rotation, and losing every toggle to that would be maddening).
  const storageKey = `versemate-jesus-study-state:${detail.event.slug}`;
  const [bulkState, setBulkState] = useState<'expanded' | 'collapsed' | null>(() =>
    readStored(storageKey).bulkState,
  );
  const [overrides, setOverrides] = useState<Record<string, boolean>>(() =>
    readStored(storageKey).overrides,
  );
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ bulkState, overrides }));
    } catch {
      /* ignore */
    }
  }, [storageKey, bulkState, overrides]);

  const isOpen = (id: string): boolean => {
    if (id in overrides) return overrides[id];
    return bulkState !== 'collapsed';
  };
  const toggle = (id: string) => {
    setOverrides((prev) => ({ ...prev, [id]: !isOpen(id) }));
  };

  const { words, actions, reactions, reveals, event } = detail;
  const revealGroups = REVEAL_GROUPS.filter((g) => reveals[g.key]?.length);

  // Every collapsible on the page, so Expand All really means all of it.
  const allIds: string[] = ['observation-intro', 'event-setting'];
  if (words.length) allIds.push('event-words');
  if (actions.length) allIds.push('event-actions');
  if (reactions.length) allIds.push('event-reactions');
  for (const step of narrowed?.study.steps ?? []) {
    allIds.push(`step-${step.number}`);
    if (step.kind === 'qa') step.items.forEach((_, i) => allIds.push(`step-${step.number}-qa-${i}`));
    if (step.kind === 'lists')
      step.lists.forEach((_, i) => allIds.push(`step-${step.number}-list-${i}`));
  }
  if (narrowed?.study.interpretation.intro) allIds.push('interpretation-intro');
  if (revealGroups.length) allIds.push('event-reveals');
  narrowed?.study.interpretation.movements.forEach((mv, i) => allIds.push(`mv-${mv.number ?? i}`));
  if (narrowed) allIds.push('application');
  if (detail.related.length) allIds.push('event-related');

  const allOpen = allIds.every((id) => isOpen(id));
  const setAll = (open: boolean) => {
    setBulkState(open ? 'expanded' : 'collapsed');
    setOverrides({});
  };

  const title = `${labels.inductiveStudyOf} ${event.title}`;
  const copyText = buildEventStudyCopyText(detail, span, narrowed, title);

  return (
    <div style={{ fontSize: bodyFontSize, lineHeight: `${bodyLineHeight}px` }}>
      <JesusTabToolbar title={title} copyText={copyText} />

      <ScopeNote span={span} narrowed={narrowed} loading={loading} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          onClick={() => setAll(!allOpen)}
          data-testid="jesus-study-expand-all"
          style={{
            fontFamily: FONT,
            fontSize: 14,
            color: vmTokens.gold,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {allOpen ? labels.collapseAll : labels.expandAll}
        </button>
      </div>

      {/* ── Observation ─────────────────────────────────────────────── */}
      <SectionHeading label={labels.observationSection} />
      <Card
        open={isOpen('observation-intro')}
        onToggle={() => toggle('observation-intro')}
        heading={<span style={cardHeadingTitleStyle}>{labels.aboutObservationTitle}</span>}
      >
        <p style={sectionIntroStyle}>{renderInlineItalic(labels.aboutObservationBody)}</p>
      </Card>

      <Card
        open={isOpen('event-setting')}
        onToggle={() => toggle('event-setting')}
        heading={<span style={cardHeadingTitleStyle}>The event in its setting</span>}
        subheading="Where it happens, when, and who is in the room."
      >
        <EventSetting detail={detail} />
      </Card>

      {words.length > 0 && (
        <Card
          open={isOpen('event-words')}
          onToggle={() => toggle('event-words')}
          heading={
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={cardHeadingTitleStyle}>What He says</span>
              <CountPill count={words.length} />
            </span>
          }
          subheading="Every recorded word of Jesus in this event, typed by what it does."
        >
          <JesusFacetList
            facets={words}
            emptyLabel="No speech recorded for this event."
            onOpenReference={onOpenReference}
            testId="jesus-study-words"
          />
        </Card>
      )}

      {actions.length > 0 && (
        <Card
          open={isOpen('event-actions')}
          onToggle={() => toggle('event-actions')}
          heading={
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={cardHeadingTitleStyle}>What He does</span>
              <CountPill count={actions.length} />
            </span>
          }
          subheading="The acts the account records, and who performs them."
        >
          <JesusFacetList
            facets={actions}
            emptyLabel="No actions recorded for this event."
            onOpenReference={onOpenReference}
            testId="jesus-study-actions"
          />
        </Card>
      )}

      {reactions.length > 0 && (
        <Card
          open={isOpen('event-reactions')}
          onToggle={() => toggle('event-reactions')}
          heading={
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={cardHeadingTitleStyle}>How people responded</span>
              <CountPill count={reactions.length} />
            </span>
          }
          subheading="Observation, not verdict — the text's own report of the reaction."
        >
          <ul style={{ margin: 0, paddingLeft: 18 }} data-testid="jesus-study-reactions">
            {reactions.map((r, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                <strong style={{ fontWeight: 600 }}>{r.who}</strong> — {r.what}
                {r.source_ref && (
                  <span style={{ color: vmTokens.textTertiary }}> ({r.source_ref})</span>
                )}
                <JesusProvenanceChip level={r.provenance} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {loading && <JesusTabEmpty>Loading the chapter study…</JesusTabEmpty>}

      {narrowed?.study.steps.map((step) => (
        <StepCard
          key={step.number}
          step={step}
          isOpen={isOpen}
          toggle={toggle}
          badge={narrowed.chapterScopedSteps.has(step.number) ? <ChapterContextBadge /> : undefined}
        />
      ))}

      {/* ── Interpretation ──────────────────────────────────────────── */}
      <SectionHeading label={labels.interpretationSection} />
      {narrowed?.study.interpretation.intro && (
        <Card
          open={isOpen('interpretation-intro')}
          onToggle={() => toggle('interpretation-intro')}
          heading={<span style={cardHeadingTitleStyle}>{labels.aboutInterpretationTitle}</span>}
        >
          <p style={sectionIntroStyle}>
            {renderInlineItalic(narrowed.study.interpretation.intro)}
          </p>
        </Card>
      )}

      {revealGroups.length > 0 && (
        <Card
          open={isOpen('event-reveals')}
          onToggle={() => toggle('event-reveals')}
          heading={<span style={cardHeadingTitleStyle}>What this event reveals about Him</span>}
          subheading="Kept in four voices so His claims are never merged with other people's."
        >
          <div data-testid="jesus-study-reveals">
            {revealGroups.map((g) => (
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
                  {(reveals[g.key] ?? []).map((item, i) => (
                    <li key={i} style={{ marginBottom: 5 }}>
                      {item.content}
                      {item.source_ref && (
                        <span style={{ color: vmTokens.textTertiary }}> ({item.source_ref})</span>
                      )}
                      <JesusProvenanceChip level={item.provenance} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}

      {narrowed?.study.interpretation.movements.map((mv, i) => (
        <MovementCard
          key={mv.number ?? i}
          movement={mv}
          bookName={narrowed.study.bookName}
          label={labels.movement}
          open={isOpen(`mv-${mv.number ?? i}`)}
          onToggle={() => toggle(`mv-${mv.number ?? i}`)}
        />
      ))}

      {!loading && !narrowed && (
        <JesusTabEmpty testId="jesus-study-no-chapter">
          The inductive study for {span ? `${span.bookName} ${span.chapter}` : 'this chapter'} isn’t
          available, so this tab shows what the event graph records and nothing more.
        </JesusTabEmpty>
      )}

      {/* ── Application ─────────────────────────────────────────────── */}
      {narrowed && (
        <>
          <SectionHeading label={labels.applicationSection} />
          <ApplicationCard
            intro={narrowed.study.application.intro}
            questions={narrowed.study.application.questions}
            labels={labels}
            open={isOpen('application')}
            onToggle={() => toggle('application')}
          />
        </>
      )}

      {detail.related.length > 0 && (
        <>
          <SectionHeading label="Study alongside" />
          <Card
            open={isOpen('event-related')}
            onToggle={() => toggle('event-related')}
            heading={<span style={cardHeadingTitleStyle}>Events that read with this one</span>}
            subheading="Same period, people, or theme — the next passage to observe."
          >
            <div style={{ display: 'flex', flexDirection: 'column' }} data-testid="jesus-study-related">
              {detail.related.map((related) => (
                <button
                  key={related.slug}
                  type="button"
                  onClick={() => navigate(buildJesusEventUrl(related.slug))}
                  data-testid={jesusTestId('jesus-study-related', related.slug)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    width: '100%',
                    padding: '10px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: `1px solid ${vmTokens.divider}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span
                      style={{
                        display: 'block',
                        fontFamily: FONT,
                        fontSize: 15,
                        color: vmTokens.textPrimary,
                      }}
                    >
                      {related.title}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontFamily: FONT,
                        fontSize: 12,
                        color: vmTokens.textTertiary,
                      }}
                    >
                      {related.passages.map((p) => p.display).join(', ')}
                    </span>
                  </span>
                  <ChevronRight size={16} color={vmTokens.textSecondary} style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── Pieces ──────────────────────────────────────────────────────────────

function readStored(key: string): {
  bulkState: 'expanded' | 'collapsed' | null;
  overrides: Record<string, boolean>;
} {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      const bulkState =
        parsed?.bulkState === 'expanded' || parsed?.bulkState === 'collapsed'
          ? parsed.bulkState
          : parsed?.bulkState === null
            ? null
            : 'collapsed';
      const overrides =
        parsed?.overrides && typeof parsed.overrides === 'object'
          ? (parsed.overrides as Record<string, boolean>)
          : {};
      return { bulkState, overrides };
    }
  } catch {
    /* ignore */
  }
  return { bulkState: 'collapsed', overrides: {} };
}

/**
 * Says where the study came from before the reader reads a word of it — an
 * event study is the chapter's study filtered, and pretending otherwise would
 * be the one dishonest thing this tab could do.
 */
function ScopeNote({
  span,
  narrowed,
  loading,
}: {
  span: EventVerseSpan | null;
  narrowed: NarrowedStudy | null;
  loading: boolean;
}) {
  if (loading || !span || !narrowed) return null;
  const { study, kept, total } = narrowed;
  return (
    <p
      data-testid="jesus-study-scope"
      style={{
        fontFamily: FONT,
        fontSize: 12.5,
        lineHeight: '19px',
        color: vmTokens.textTertiary,
        margin: '0 0 14px',
      }}
    >
      Drawn from the {study.title} inductive study, narrowed to{' '}
      <strong style={{ color: vmTokens.textSecondary, fontWeight: 600 }}>{span.display}</strong> —{' '}
      {kept.movements} of {total.movements} movements and {kept.questions} of {total.questions}{' '}
      application questions touch this passage.
    </p>
  );
}

function ChapterContextBadge() {
  return (
    <span
      data-testid="jesus-study-chapter-badge"
      title="This step's content carries no verse references, so it is shown whole — it is about the chapter, not only this passage."
      style={{
        display: 'inline-block',
        padding: '1px 7px',
        borderRadius: 999,
        fontFamily: FONT,
        fontSize: 10,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: vmTokens.textTertiary,
        border: `1px solid ${vmTokens.divider}`,
      }}
    >
      Chapter context
    </span>
  );
}

function CountPill({ count }: { count: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 24,
        height: 20,
        padding: '0 7px',
        borderRadius: 10,
        border: `1px solid ${vmTokens.gold}`,
        color: vmTokens.gold,
        fontFamily: FONT,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {count}
    </span>
  );
}

function EventSetting({ detail }: { detail: JesusEventDetail }) {
  const { event } = detail;
  const rows: { label: string; value: string }[] = [];
  rows.push({ label: 'Passage', value: detail.passages.map((p) => p.display).join(' · ') });
  if (event.location) rows.push({ label: 'Where', value: event.location });
  const when = [event.approximate_date, event.period_name].filter(Boolean).join(' · ');
  if (when) rows.push({ label: 'When', value: when });
  if (event.people.length) {
    rows.push({
      label: 'Who',
      value: event.people
        .map((p) => (p.role ? `${p.person} (${p.role})` : p.person))
        .join(', '),
    });
  }
  if (event.gospels.length) rows.push({ label: 'Recorded by', value: event.gospels.join(', ') });
  if (event.themes.length) {
    rows.push({ label: 'Themes', value: event.themes.map((t) => t.name).join(', ') });
  }

  return (
    <dl style={{ margin: 0, display: 'grid', gap: 8 }} data-testid="jesus-study-setting">
      {rows.map((row) => (
        <div key={row.label} style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
          <dt
            style={{
              flexShrink: 0,
              width: 96,
              fontFamily: FONT,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: vmTokens.gold,
            }}
          >
            {row.label}
          </dt>
          <dd style={{ margin: 0, color: vmTokens.textPrimary, minWidth: 0 }}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
