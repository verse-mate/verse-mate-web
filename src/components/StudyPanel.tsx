import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Copy, Check } from 'lucide-react';
import ShareIcon from '@/components/ShareIcon';
import MarkdownBlock from '@/components/MarkdownBlock';
import { useApp } from '@/contexts/AppContext';
import { getStudyFor, InductiveStudy } from '@/data/studies';
import { vmTokens } from '@/styles/themeStyles';
import {
  StudyStep,
  StepProse,
  StepQA,
  StepKeywords,
  StepLists,
  StepContrasts,
  StepBullets,
  StepSegments,
} from '@/data/studies/types';

interface Props {
  book: string;
  bookId: number | null;
  chapter: number;
}

/**
 * StudyPanel — renders the Precept inductive Bible study for a given chapter.
 * Header matches the Line-by-Line tab (just title + Expand All / Collapse
 * All, no subtitle banner). Each top-level step is a collapsible card; some
 * step kinds (qa, segments) nest collapsibles for each sub-item.
 */
export default function StudyPanel({ book, bookId, chapter }: Props) {
  const { state } = useApp();
  const study: InductiveStudy | null = bookId ? getStudyFor(bookId, chapter) : null;
  // Body text matches the user's reading font size so Study reads at the same
  // weight as the Bible side and the Summary / By Line / Detailed tabs.
  // Sub-elements (pills, tags, captions, definitions) keep their own fixed
  // sizes — the user explicitly OK'd that as long as the main body matches.
  const bodyFontSize = state.settings.fontSize;
  const bodyLineHeight = Math.round(bodyFontSize * 1.55);

  // Bulk state drives the default for every section. Per-card overrides win
  // when the user toggles individually after a bulk action. Default is
  // collapsed so the user lands on a scannable outline of all 9 steps +
  // interpretation + application — and opens what they want to read.
  //
  // Both bulk + overrides are persisted to sessionStorage scoped by
  // `bookId:chapter` so rotation (portrait↔landscape crosses the AppLayout
  // breakpoint and unmounts StudyPanel) doesn't reset everything to
  // collapsed. Switching chapters resets to the default since the keys are
  // chapter-scoped.
  const storageKey = `versemate-study-state:${bookId ?? 'none'}:${chapter}`;
  const [bulkState, setBulkState] = useState<'expanded' | 'collapsed' | null>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.bulkState === 'expanded' || parsed?.bulkState === 'collapsed' || parsed?.bulkState === null) {
          return parsed.bulkState;
        }
      }
    } catch { /* ignore */ }
    return 'collapsed';
  });
  const [overrides, setOverrides] = useState<Record<string, boolean>>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.overrides && typeof parsed.overrides === 'object') {
          return parsed.overrides as Record<string, boolean>;
        }
      }
    } catch { /* ignore */ }
    return {};
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ bulkState, overrides }));
    } catch { /* ignore */ }
  }, [storageKey, bulkState, overrides]);
  const [copied, setCopied] = useState(false);

  const isOpen = (id: string): boolean => {
    if (id in overrides) return overrides[id];
    return bulkState !== 'collapsed';
  };
  const toggle = (id: string) => {
    setOverrides(prev => ({ ...prev, [id]: !isOpen(id) }));
  };

  if (!study) {
    return (
      <div>
        <h2 style={titleStyle}>Inductive Study of {book} {chapter}</h2>
        <div style={{ marginTop: 24, padding: 24, borderRadius: 12, backgroundColor: vmTokens.surfaceRaisedBg, border: `1px solid ${vmTokens.surfaceRaisedBorder}`, textAlign: 'center' }}>
          <BookOpen size={28} color={vmTokens.gold} style={{ margin: '0 auto 12px' }} strokeWidth={1.5} />
          <p style={{ color: vmTokens.textPrimary, fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Inductive Study coming soon</p>
          <p style={{ color: vmTokens.textSecondary, fontSize: 14, lineHeight: '22px' }}>
            We're rolling out the 9-step Precept inductive method chapter by chapter. James 1 is the first chapter live — try it from any verse in James 1.
          </p>
        </div>
      </div>
    );
  }

  // Build the full id list for bulk Expand-All / Collapse-All. We include
  // sub-ids only for kinds that actually have nested toggles (qa items).
  // Segments render as static cards now, so they don't need ids.
  const allIds: string[] = [];
  allIds.push('observation-intro');
  for (const s of study.steps) {
    allIds.push(`step-${s.number}`);
    if (s.kind === 'qa') s.items.forEach((_, i) => allIds.push(`step-${s.number}-qa-${i}`));
    if (s.kind === 'lists') s.lists.forEach((_, i) => allIds.push(`step-${s.number}-list-${i}`));
  }
  allIds.push('interpretation-intro');
  for (const m of study.interpretation.movements) allIds.push(`mv-${m.number}`);
  allIds.push('application');

  const allOpen = allIds.every(id => isOpen(id));

  const setAll = (open: boolean) => {
    setBulkState(open ? 'expanded' : 'collapsed');
    setOverrides({});
  };

  return (
    // Wrap the entire panel in the user's body font size so every section's
    // inherited body text matches the Bible side and the other commentary
    // tabs. Pills, tags, and small captions override locally with fixed sizes;
    // everything else (markdown bodies, prose paragraphs, list items) inherits.
    <div style={{ fontSize: bodyFontSize, lineHeight: `${bodyLineHeight}px` }}>
      {/* Title row — matches Line-by-Line: just the H2 + share. No subtitle / theme banner. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <h2 style={titleStyle}>Inductive Study of {study.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button
            onClick={async () => {
              const text = buildStudyCopyText(study);
              try {
                if (navigator.clipboard?.writeText) {
                  await navigator.clipboard.writeText(text);
                } else {
                  const ta = document.createElement('textarea');
                  ta.value = text;
                  ta.style.position = 'fixed';
                  ta.style.opacity = '0';
                  document.body.appendChild(ta);
                  ta.select();
                  document.execCommand('copy');
                  document.body.removeChild(ta);
                }
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch { /* ignore */ }
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
            aria-label="Copy study"
            title="Copy study"
          >
            {copied
              ? <Check size={18} color={vmTokens.gold} strokeWidth={2} />
              : <Copy size={18} color={vmTokens.textPrimary} strokeWidth={1.5} />}
          </button>
          <button
            onClick={() => {
              const text = buildStudyCopyText(study);
              navigator.share?.({
                title: `Inductive Study of ${study.title}`,
                text,
                url: window.location.href,
              }).catch(() => {});
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
            aria-label="Share study"
          >
            <ShareIcon size={18} color={vmTokens.textPrimary} />
          </button>
        </div>
      </div>

      {/* Expand All / Collapse All */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          onClick={() => setAll(!allOpen)}
          style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: vmTokens.gold, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {allOpen ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <SectionHeading label="Observation — 9 Inductive Steps" />
      <Card
        open={isOpen('observation-intro')}
        onToggle={() => toggle('observation-intro')}
        heading={<span style={cardHeadingTitleStyle}>About the nine observation steps</span>}
      >
        <p style={sectionIntroStyle}>
          Observation asks what the text <em>says</em> — slowing down to mark the keywords, contrasts, repetitions, and structural cues the author left for you. Each of the nine steps below builds the evidence the interpretation that follows is built on. Don't skip ahead; the meaning comes from what you observed.
        </p>
      </Card>
      {study.steps.map(step => (
        <StepCard
          key={step.number}
          step={step}
          isOpen={isOpen}
          toggle={toggle}
        />
      ))}

      <SectionHeading label="Interpretation" />
      {study.interpretation.intro && (
        <Card
          open={isOpen('interpretation-intro')}
          onToggle={() => toggle('interpretation-intro')}
          heading={<span style={cardHeadingTitleStyle}>About the interpretation movements</span>}
        >
          <p style={sectionIntroStyle}>
            {renderInlineItalic(study.interpretation.intro)}
          </p>
        </Card>
      )}
      {study.interpretation.movements.map(mv => (
        <Card
          key={mv.number}
          open={isOpen(`mv-${mv.number}`)}
          onToggle={() => toggle(`mv-${mv.number}`)}
          heading={
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <RangePill range={mv.range} />
              <span style={cardHeadingTitleStyle}>Movement {mv.number} — {mv.title}</span>
            </span>
          }
        >
          {mv.excerpt && (
            <blockquote style={{ borderLeft: `2px solid ${vmTokens.gold}`, paddingLeft: 12, color: vmTokens.textSecondary, fontStyle: 'italic', marginBottom: 12, fontSize: 14, lineHeight: '22px' }}>
              "{mv.excerpt}" — {study.bookName} {mv.range}
            </blockquote>
          )}
          <MarkdownBlock text={mv.body} />
        </Card>
      ))}

      <SectionHeading label="Application" />
      <Card
        open={isOpen('application')}
        onToggle={() => toggle('application')}
        heading={<span style={cardHeadingTitleStyle}>Apply, one question per movement</span>}
      >
        {study.application.intro && (
          <p style={{ ...sectionIntroStyle, marginBottom: 16 }}>
            {study.application.intro}
          </p>
        )}
        {/* Prototype's .study-app-list: borderless, gap-only list. Pills on
            left aligned to first line of question; question text in serif
            for parity with the byline / intro prose style. */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {study.application.questions.map(q => (
            <li
              key={q.range}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}
            >
              <span style={firstLineAlignStyle}>
                <RangePill range={q.range} />
              </span>
              <p
                style={{
                  fontFamily: "'Roboto Serif', Georgia, serif",
                  fontSize: '0.92em',
                  lineHeight: 1.6,
                  color: vmTokens.textPrimary,
                  margin: 0,
                  flex: 1,
                }}
              >
                {q.question}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// ─── Step renderers ─────────────────────────────────────────────────────

function StepCard({
  step,
  isOpen,
  toggle,
}: {
  step: StudyStep;
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
}) {
  const id = `step-${step.number}`;
  const open = isOpen(id);
  return (
    <Card
      open={open}
      onToggle={() => toggle(id)}
      heading={
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={stepNumberStyle}>{step.number}</span>
          <span style={cardHeadingTitleStyle}>{step.title}</span>
        </span>
      }
      // Always show the italic summary as a subheading (same size + position
      // whether the card is open or closed). Renders inside the heading area
      // so it doesn't shift into the body when expanding.
      subheading={step.summary}
    >
      {renderStepBody(step, isOpen, toggle)}
    </Card>
  );
}

function renderStepBody(
  step: StudyStep,
  isOpen: (id: string) => boolean,
  toggle: (id: string) => void,
): React.ReactNode {
  switch (step.kind) {
    case 'prose':
      return <ProseBody step={step} />;
    case 'qa':
      return <QABody step={step} isOpen={isOpen} toggle={toggle} />;
    case 'keywords':
      return <KeywordsBody step={step} />;
    case 'lists':
      return <ListsBody step={step} isOpen={isOpen} toggle={toggle} />;
    case 'contrasts':
      return <ContrastsBody step={step} />;
    case 'bullets':
      return <BulletsBody step={step} />;
    case 'segments':
      return <SegmentsBody step={step} />;
  }
}

function ProseBody({ step }: { step: StepProse }) {
  return <MarkdownBlock text={step.body} />;
}

function QABody({ step, isOpen, toggle }: { step: StepQA; isOpen: (id: string) => boolean; toggle: (id: string) => void }) {
  return (
    <div>
      {step.items.map((item, i) => {
        const id = `step-${step.number}-qa-${i}`;
        const open = isOpen(id);
        return (
          <NestedCard
            key={i}
            open={open}
            onToggle={() => toggle(id)}
            heading={
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {item.tag && <Tag label={item.tag} />}
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, fontWeight: 500, color: vmTokens.textPrimary }}>
                  {item.q}
                </span>
              </span>
            }
          >
            <MarkdownBlock text={item.a} />
          </NestedCard>
        );
      })}
    </div>
  );
}

function KeywordsBody({ step }: { step: StepKeywords }) {
  // Card-style row per keyword so the definition has room to breathe under
  // the metadata line. A 5-column table (Word/Greek/Count/Verses/Definition)
  // would crush the right-panel width; a stacked card scales cleanly.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {step.inventory.map((row, i) => (
        <div
          key={i}
          style={{
            padding: '12px 14px',
            borderRadius: 8,
            backgroundColor: vmTokens.surfaceRaisedBg,
            border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
          }}
        >
          {/* Top line: word — greek — count pill on the right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600, fontSize: 15, color: vmTokens.textPrimary }}>
              {row.word}
            </span>
            {row.greek && (
              <span style={{ fontStyle: 'italic', fontSize: 13, color: vmTokens.textSecondary }}>
                {row.greek}
              </span>
            )}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 32,
                height: 22,
                padding: '0 8px',
                borderRadius: 11,
                backgroundColor: vmTokens.surfaceRaisedBg,
                border: '1px solid #B09A6D',
                color: vmTokens.gold,
                fontSize: 11,
                fontWeight: 700,
                marginLeft: 'auto',
              }}
            >
              ×{row.count}
            </span>
          </div>
          {/* Verses line */}
          <div style={{ fontSize: 12, color: vmTokens.textMuted, marginBottom: row.definition ? 8 : 0 }}>
            <span style={{ fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', marginRight: 6 }}>Verses</span>
            {row.verses}
          </div>
          {/* Definition */}
          {row.definition && (
            <p style={{ color: vmTokens.textPrimary, margin: 0 }}>
              {row.definition}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ListsBody({ step, isOpen, toggle }: { step: StepLists; isOpen: (id: string) => boolean; toggle: (id: string) => void }) {
  // Each list becomes a collapsible row — the title ("What James 1 teaches
  // about God") is the heading, the verse/truth table reveals on expand.
  // Mirrors the QABody pattern for the 5 W's section.
  return (
    <div>
      {step.lists.map((list, i) => {
        const id = `step-${step.number}-list-${i}`;
        const open = isOpen(id);
        return (
          <NestedCard
            key={i}
            open={open}
            onToggle={() => toggle(id)}
            heading={
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, fontWeight: 600, color: vmTokens.textPrimary }}>
                {list.title}
              </span>
            }
          >
            <Table>
              <thead>
                <tr>
                  <Th style={{ width: 80 }}>{list.columns[0]}</Th>
                  <Th>{list.columns[1]}</Th>
                </tr>
              </thead>
              <tbody>
                {list.rows.map((r, j) => (
                  <tr key={j}>
                    <Td><RangePill range={r.ref} /></Td>
                    <Td>{r.truth}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </NestedCard>
        );
      })}
    </div>
  );
}

function ContrastsBody({ step }: { step: StepContrasts }) {
  return (
    <div>
      {step.items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            paddingTop: 12,
            paddingBottom: 12,
            borderTop: i === 0 ? '1px solid #1f1f1f' : 'none',
            borderBottom: `1px solid ${vmTokens.divider}`,
          }}
        >
          <span style={firstLineAlignStyle}>
            <RangePill range={item.verses} />
          </span>
          <span style={{ ...firstLineAlignStyle, gap: 0 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 22,
                padding: '0 6px',
                borderRadius: 11,
                backgroundColor: vmTokens.divider,
                color: vmTokens.textSecondary,
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                flexShrink: 0,
              }}
            >
              {item.type}
            </span>
          </span>
          <span style={{ flex: 1, color: vmTokens.textPrimary }}>{item.pairing}</span>
        </div>
      ))}
    </div>
  );
}

function BulletsBody({ step }: { step: StepBullets }) {
  // Tag column width adapts to whether tags are verse refs (compact) or short
  // text labels (slightly wider). Pure-text steps (no tags) skip the column.
  const hasTextTags = step.items.some(i => i.tag && !/^\d/.test(i.tag));
  return (
    <div>
      {step.intro && (
        <p style={{ marginBottom: 14, color: vmTokens.textPrimary }}>
          {step.intro}
        </p>
      )}
      {step.items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            paddingTop: 12,
            paddingBottom: 12,
            borderTop: i === 0 ? '1px solid #1f1f1f' : 'none',
            borderBottom: `1px solid ${vmTokens.divider}`,
          }}
        >
          {item.tag && (
            <span style={firstLineAlignStyle}>
              {hasTextTags ? <Tag label={item.tag} /> : <RangePill range={item.tag} />}
            </span>
          )}
          <span style={{ flex: 1, color: vmTokens.textPrimary }}>
            <MarkdownBlock text={item.text} />
          </span>
        </div>
      ))}
      {step.note && (
        <p style={{ marginTop: 14, fontSize: 14, color: vmTokens.textSecondary, lineHeight: '22px', fontStyle: 'italic' }}>
          {step.note}
        </p>
      )}
    </div>
  );
}

function SegmentsBody({ step }: { step: StepSegments }) {
  // Segments render as static styled cards (no extra collapse) — the user
  // already opened the parent step, and segments are short enough to read
  // inline. Each card stays visually distinct so they read as their own
  // "table row" / segment per the design feedback.
  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          padding: '14px 16px',
          borderRadius: 10,
          backgroundColor: vmTokens.surfaceRaisedBg,
          border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
          borderLeft: '3px solid #B09A6D',
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 700, color: vmTokens.gold, textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0, marginBottom: 6 }}>
          Chapter theme
        </p>
        <p style={{ fontSize: 17, color: vmTokens.textPrimary, fontStyle: 'italic', margin: 0, lineHeight: '26px', fontWeight: 500 }}>
          {step.themeHeadline}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {step.segments.map((seg, i) => (
          <div
            key={i}
            style={{
              padding: '14px 16px',
              borderRadius: 8,
              backgroundColor: vmTokens.surfaceRaisedBg,
              border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
            }}
          >
            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600, color: vmTokens.textPrimary, margin: 0, marginBottom: 8 }}>
              {seg.title}
            </p>
            <div style={{ color: vmTokens.textPrimary }}>
              <MarkdownBlock text={seg.body} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared UI primitives ───────────────────────────────────────────────

function SectionHeading({ label }: { label: string }) {
  return (
    <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: vmTokens.gold, textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0, marginTop: 22, marginBottom: 10 }}>
      {label}
    </h3>
  );
}

function Card({
  open,
  onToggle,
  heading,
  subheading,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  heading: React.ReactNode;
  subheading?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: `1px solid ${vmTokens.divider}` }}>
      <button
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', padding: '14px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', gap: 12 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, color: vmTokens.textPrimary, flex: 1, minWidth: 0 }}>
          <span style={{ width: '100%' }}>{heading}</span>
          {subheading && (
            // Subheading rendered identically whether the card is open or
            // closed so its size + position never shift on toggle.
            // paddingLeft 40 aligns under the step title (28px circle + 12px
            // gap). On non-step cards the alignment is naturally flush.
            <span style={{ fontSize: 14, fontStyle: 'italic', color: vmTokens.textSecondary, fontWeight: 400, lineHeight: '22px', paddingLeft: 40 }}>{subheading}</span>
          )}
        </div>
        {open ? (
          <ChevronUp size={18} color={vmTokens.textSecondary} style={{ flexShrink: 0, marginTop: 2 }} />
        ) : (
          <ChevronDown size={18} color={vmTokens.textSecondary} style={{ flexShrink: 0, marginTop: 2 }} />
        )}
      </button>
      {open && (
        <div style={{ paddingBottom: 18, paddingLeft: 0 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function NestedCard({
  open,
  onToggle,
  heading,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  heading: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderTop: `1px solid ${vmTokens.divider}` }}>
      <button
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', gap: 12 }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>{heading}</span>
        {open ? (
          <ChevronUp size={16} color={vmTokens.textSecondary} style={{ flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} color={vmTokens.textSecondary} style={{ flexShrink: 0 }} />
        )}
      </button>
      {open && (
        <div style={{ paddingBottom: 12, paddingLeft: 0 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Tag({ label }: { label: string }) {
  // Prototype's .obs-pill — solid gold pill with white text + uppercase
  // tracking. Used for POSTURE / EYES / WILL row labels inside the
  // Observation steps.
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 72,
        height: 22,
        borderRadius: 999,
        backgroundColor: vmTokens.gold,
        border: `1px solid ${vmTokens.gold}`,
        color: '#FFFFFF',
        fontFamily: 'Roboto, sans-serif',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        padding: '0 10px',
        flexShrink: 0,
        textAlign: 'center',
      }}
    >
      {label}
    </span>
  );
}

function RangePill({ range }: { range: string }) {
  // Prototype's .study-pill — solid gold pill with white text. Used for
  // verse-range labels like "4:1-3" on the left of each Interpretation
  // movement row.
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 56,
        height: 22,
        borderRadius: 999,
        backgroundColor: vmTokens.gold,
        border: `1px solid ${vmTokens.gold}`,
        color: '#FFFFFF',
        fontFamily: 'Roboto, sans-serif',
        fontSize: 11,
        fontWeight: 600,
        padding: '0 10px',
        flexShrink: 0,
        textAlign: 'center',
      }}
    >
      {range}
    </span>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8, fontSize: 14 }}>
      {children}
    </table>
  );
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th
      style={{
        textAlign: 'left',
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: vmTokens.gold,
        borderBottom: `1px solid ${vmTokens.divider}`,
        padding: '8px 10px',
        ...style,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td
      style={{
        padding: '10px',
        verticalAlign: 'top',
        borderBottom: `1px solid ${vmTokens.divider}`,
        color: vmTokens.textPrimary,
        lineHeight: '22px',
        ...style,
      }}
    >
      {children}
    </td>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────

// Minimal *italic* renderer used by the section intro `<p>` blocks. The
// intros are short, plain prose with the occasional emphasised word —
// pulling in the full MarkdownBlock would re-introduce the body color /
// size from `text-foreground` and undo `sectionIntroStyle`.
function renderInlineItalic(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<em key={key++}>{m[1]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// Strip the bare markdown we render in the study content (`#`, `>`,
// `**bold**`, `*italic*`) so the clipboard / share payload reads as plain
// prose on the recipient side.
function stripStudyMarkdown(text: string): string {
  return text
    .replace(/^#+\s*/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim();
}

/**
 * Serialise an InductiveStudy to a plain-text payload for the Copy / Share
 * buttons. Walks every step (varying by `kind`), then the interpretation
 * movements, then the application questions. Output looks like:
 *
 *   Inductive Study of James 1
 *   Testing Your Faith
 *
 *   Theme: ...
 *
 *   OBSERVATION — 9 INDUCTIVE STEPS
 *
 *   1. Begin with prayer
 *      [body]
 *
 *   ...
 */
function buildStudyCopyText(study: InductiveStudy): string {
  const lines: string[] = [];
  lines.push(`Inductive Study of ${study.title}`);
  if (study.subtitle) lines.push(study.subtitle);
  if (study.themeOneLine) {
    lines.push('');
    lines.push(`Theme: ${study.themeOneLine}`);
  }
  lines.push('');
  lines.push('OBSERVATION — 9 INDUCTIVE STEPS');
  for (const step of study.steps) {
    lines.push('');
    lines.push(`${step.number}. ${step.title}`);
    if (step.summary) lines.push(`   ${step.summary}`);
    switch (step.kind) {
      case 'prose':
        lines.push('');
        lines.push(stripStudyMarkdown(step.body));
        break;
      case 'qa':
        for (const item of step.items) {
          lines.push('');
          if (item.tag) lines.push(`   [${item.tag}] ${item.q}`);
          else lines.push(`   ${item.q}`);
          lines.push(`   ${stripStudyMarkdown(item.a)}`);
        }
        break;
      case 'keywords':
        for (const row of step.inventory) {
          lines.push('');
          const greek = row.greek ? ` (${row.greek})` : '';
          lines.push(`   ${row.word}${greek} — ×${row.count} — ${row.verses}`);
          if (row.definition) lines.push(`   ${stripStudyMarkdown(row.definition)}`);
        }
        break;
      case 'lists':
        for (const list of step.lists) {
          lines.push('');
          lines.push(`   ${list.title}`);
          for (const r of list.rows) {
            lines.push(`   • ${r.ref} — ${stripStudyMarkdown(r.truth)}`);
          }
        }
        break;
      case 'contrasts':
        for (const item of step.items) {
          lines.push(`   • ${item.verses} (${item.type}) — ${stripStudyMarkdown(item.pairing)}`);
        }
        break;
      case 'bullets':
        if (step.intro) {
          lines.push('');
          lines.push(`   ${stripStudyMarkdown(step.intro)}`);
        }
        for (const item of step.items) {
          const tag = item.tag ? `[${item.tag}] ` : '';
          lines.push(`   • ${tag}${stripStudyMarkdown(item.text)}`);
        }
        if (step.note) {
          lines.push('');
          lines.push(`   ${stripStudyMarkdown(step.note)}`);
        }
        break;
      case 'segments':
        if (step.themeHeadline) {
          lines.push('');
          lines.push(`   Chapter theme: ${step.themeHeadline}`);
        }
        for (const seg of step.segments) {
          lines.push('');
          lines.push(`   ${seg.title}`);
          lines.push(`   ${stripStudyMarkdown(seg.body)}`);
        }
        break;
    }
  }
  lines.push('');
  lines.push('INTERPRETATION');
  for (const mv of study.interpretation.movements) {
    lines.push('');
    lines.push(`Movement ${mv.number} — ${mv.title} (${mv.range})`);
    if (mv.excerpt) lines.push(`   "${mv.excerpt}"`);
    lines.push('');
    lines.push(stripStudyMarkdown(mv.body));
  }
  lines.push('');
  lines.push('APPLICATION');
  if (study.application.intro) {
    lines.push('');
    lines.push(stripStudyMarkdown(study.application.intro));
  }
  for (const q of study.application.questions) {
    lines.push('');
    lines.push(`${q.range} — ${q.question}`);
  }
  return lines.join('\n');
}

// ─── Style constants ────────────────────────────────────────────────────

const titleStyle: React.CSSProperties = {
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 700,
  fontSize: 20,
  lineHeight: '28px',
  color: vmTokens.textPrimary,
  margin: 0,
};

const cardHeadingTitleStyle: React.CSSProperties = {
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 600,
  fontSize: 17,
  lineHeight: '24px',
  color: vmTokens.textPrimary,
};

// Shared style for the Observation / Interpretation / Application section
// intros — small, muted, italics-friendly. The body font setting on the
// panel root would otherwise scale these up to the user's reading size; the
// intros are meta-text describing the section, not the section's content,
// so they stay clamped to a smaller fixed size.
const sectionIntroStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: '22px',
  color: vmTokens.textSecondary,
  margin: 0,
};

// Wrapper that vertically centers a tag/pill on the FIRST LINE of the
// adjacent text. `1lh` is the inherited line-height of the body — equal to
// the height of one text line — so a 22px pill centered in it lines up
// with the cap-center of the first line of multi-line content next to it.
// Parents using `alignItems: flex-start` align this wrapper to the top of
// the row; the inner flex centers the pill within that line.
const firstLineAlignStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  height: '1lh',
  flexShrink: 0,
};

const stepNumberStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: vmTokens.gold,
  color: vmTokens.goldOnLight,
  fontSize: 14,
  fontWeight: 700,
  flexShrink: 0,
};

const stepSummaryStyle: React.CSSProperties = {
  fontSize: 14,
  color: vmTokens.textSecondary,
  fontStyle: 'italic',
  marginBottom: 14,
  lineHeight: '22px',
};

const subTitleStyle: React.CSSProperties = {
  fontFamily: 'Roboto, sans-serif',
  fontSize: 14,
  fontWeight: 700,
  color: vmTokens.textPrimary,
  marginTop: 8,
  marginBottom: 8,
};
