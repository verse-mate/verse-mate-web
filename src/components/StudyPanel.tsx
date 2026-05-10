import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import ShareIcon from '@/components/ShareIcon';
import MarkdownBlock from '@/components/MarkdownBlock';
import { useApp } from '@/contexts/AppContext';
import { getStudyFor, InductiveStudy } from '@/data/studies';
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
  const [bulkState, setBulkState] = useState<'expanded' | 'collapsed' | null>('collapsed');
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

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
        <div style={{ marginTop: 24, padding: 24, borderRadius: 12, backgroundColor: '#1A1A1A', border: '1px solid #2a2a2a', textAlign: 'center' }}>
          <BookOpen size={28} color="#B09A6D" style={{ margin: '0 auto 12px' }} strokeWidth={1.5} />
          <p style={{ color: '#E7E7E7', fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Inductive Study coming soon</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: '22px' }}>
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
  for (const s of study.steps) {
    allIds.push(`step-${s.number}`);
    if (s.kind === 'qa') s.items.forEach((_, i) => allIds.push(`step-${s.number}-qa-${i}`));
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
        <button
          onClick={() => navigator.share?.({ title: `Inductive Study of ${study.title}`, text: `Inductive Study of ${study.title}` }).catch(() => {})}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexShrink: 0 }}
          aria-label="Share study"
        >
          <ShareIcon size={18} color="#E7E7E7" />
        </button>
      </div>

      {/* Expand All / Collapse All */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          onClick={() => setAll(!allOpen)}
          style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#B09A6D', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {allOpen ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <SectionHeading label="Observation — 9 Inductive Steps" />
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
          heading={<span style={cardHeadingTitleStyle}>About the six interpretation guardrails</span>}
        >
          <MarkdownBlock text={study.interpretation.intro} />
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
            <blockquote style={{ borderLeft: '2px solid #B09A6D', paddingLeft: 12, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', marginBottom: 12, fontSize: 14, lineHeight: '22px' }}>
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
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 14, lineHeight: '22px' }}>
            {study.application.intro}
          </p>
        )}
        {study.application.questions.map(q => (
          <div
            key={q.range}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              marginBottom: 12,
              paddingBottom: 12,
              borderBottom: '1px solid #1f1f1f',
            }}
          >
            <RangePill range={q.range} />
            <p style={{ color: '#E7E7E7', margin: 0, flex: 1 }}>
              {q.question}
            </p>
          </div>
        ))}
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
      return <ListsBody step={step} />;
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
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, fontWeight: 500, color: '#E7E7E7' }}>
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
            backgroundColor: '#161616',
            border: '1px solid #2a2a2a',
          }}
        >
          {/* Top line: word — greek — count pill on the right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600, fontSize: 15, color: '#E7E7E7' }}>
              {row.word}
            </span>
            {row.greek && (
              <span style={{ fontStyle: 'italic', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
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
                backgroundColor: '#1A1A1A',
                border: '1px solid #B09A6D',
                color: '#B09A6D',
                fontSize: 11,
                fontWeight: 700,
                marginLeft: 'auto',
              }}
            >
              ×{row.count}
            </span>
          </div>
          {/* Verses line */}
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: row.definition ? 8 : 0 }}>
            <span style={{ fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', marginRight: 6 }}>Verses</span>
            {row.verses}
          </div>
          {/* Definition */}
          {row.definition && (
            <p style={{ color: '#E7E7E7', margin: 0 }}>
              {row.definition}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ListsBody({ step }: { step: StepLists }) {
  return (
    <div>
      {step.lists.map((list, i) => (
        <div key={i} style={{ marginBottom: i < step.lists.length - 1 ? 22 : 0 }}>
          <h4 style={subTitleStyle}>{list.title}</h4>
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
        </div>
      ))}
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
            borderBottom: '1px solid #1f1f1f',
          }}
        >
          <RangePill range={item.verses} />
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 22,
              padding: '0 6px',
              borderRadius: 11,
              backgroundColor: '#262626',
              color: 'rgba(255,255,255,0.75)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              flexShrink: 0,
              alignSelf: 'flex-start',
            }}
          >
            {item.type}
          </span>
          <span style={{ flex: 1, color: '#E7E7E7' }}>{item.pairing}</span>
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
        <p style={{ marginBottom: 14, color: '#E7E7E7' }}>
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
            borderBottom: '1px solid #1f1f1f',
          }}
        >
          {item.tag && (hasTextTags ? <Tag label={item.tag} /> : <RangePill range={item.tag} />)}
          <span style={{ flex: 1, color: '#E7E7E7' }}>
            <MarkdownBlock text={item.text} />
          </span>
        </div>
      ))}
      {step.note && (
        <p style={{ marginTop: 14, fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: '22px', fontStyle: 'italic' }}>
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
          backgroundColor: '#1A1A1A',
          border: '1px solid #2a2a2a',
          borderLeft: '3px solid #B09A6D',
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 700, color: '#B09A6D', textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0, marginBottom: 6 }}>
          Chapter theme
        </p>
        <p style={{ fontSize: 17, color: '#E7E7E7', fontStyle: 'italic', margin: 0, lineHeight: '26px', fontWeight: 500 }}>
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
              backgroundColor: '#161616',
              border: '1px solid #2a2a2a',
            }}
          >
            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600, color: '#FFFFFF', margin: 0, marginBottom: 8 }}>
              {seg.title}
            </p>
            <div style={{ color: 'rgba(255,255,255,0.85)' }}>
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
    <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: '#B09A6D', textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0, marginTop: 22, marginBottom: 10 }}>
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
    <div style={{ borderBottom: '1px solid #323232' }}>
      <button
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', padding: '14px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', gap: 12 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, color: '#FFFFFF', flex: 1, minWidth: 0 }}>
          <span style={{ width: '100%' }}>{heading}</span>
          {subheading && (
            // Subheading rendered identically whether the card is open or
            // closed so its size + position never shift on toggle.
            // paddingLeft 40 aligns under the step title (28px circle + 12px
            // gap). On non-step cards the alignment is naturally flush.
            <span style={{ fontSize: 14, fontStyle: 'italic', color: 'rgba(255,255,255,0.65)', fontWeight: 400, lineHeight: '22px', paddingLeft: 40 }}>{subheading}</span>
          )}
        </div>
        {open ? (
          <ChevronUp size={18} color="rgba(255,255,255,0.6)" style={{ flexShrink: 0, marginTop: 2 }} />
        ) : (
          <ChevronDown size={18} color="rgba(255,255,255,0.6)" style={{ flexShrink: 0, marginTop: 2 }} />
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
    <div style={{ borderTop: '1px solid #1f1f1f' }}>
      <button
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', gap: 12 }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>{heading}</span>
        {open ? (
          <ChevronUp size={16} color="rgba(255,255,255,0.55)" style={{ flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} color="rgba(255,255,255,0.55)" style={{ flexShrink: 0 }} />
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
  // Fixed width so every text-tag pill in a column lines up cleanly.
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 88,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#1A1A1A',
        border: '1px solid #B09A6D',
        color: '#B09A6D',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.5px',
        padding: '0 6px',
        flexShrink: 0,
        alignSelf: 'flex-start',
      }}
    >
      {label}
    </span>
  );
}

function RangePill({ range }: { range: string }) {
  // Fixed width so every pill in a column aligns its right edge — fixes the
  // "1:6-8 vs 1:13-14" jagged column problem. The pill content stays
  // centered inside the 64px box.
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 64,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#1A1A1A',
        border: '1px solid #B09A6D',
        color: '#B09A6D',
        fontSize: 11,
        fontWeight: 600,
        padding: '0 6px',
        flexShrink: 0,
        alignSelf: 'flex-start',
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
        color: '#B09A6D',
        borderBottom: '1px solid #323232',
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
        borderBottom: '1px solid #1f1f1f',
        color: 'rgba(255,255,255,0.85)',
        lineHeight: '22px',
        ...style,
      }}
    >
      {children}
    </td>
  );
}

// ─── Style constants ────────────────────────────────────────────────────

const titleStyle: React.CSSProperties = {
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 700,
  fontSize: 20,
  lineHeight: '28px',
  color: '#E7E7E7',
  margin: 0,
};

const cardHeadingTitleStyle: React.CSSProperties = {
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 600,
  fontSize: 17,
  lineHeight: '24px',
  color: '#FFFFFF',
};

const stepNumberStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: '#B09A6D',
  color: '#000',
  fontSize: 14,
  fontWeight: 700,
  flexShrink: 0,
};

const stepSummaryStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'rgba(255,255,255,0.65)',
  fontStyle: 'italic',
  marginBottom: 14,
  lineHeight: '22px',
};

const subTitleStyle: React.CSSProperties = {
  fontFamily: 'Roboto, sans-serif',
  fontSize: 14,
  fontWeight: 700,
  color: '#E7E7E7',
  marginTop: 8,
  marginBottom: 8,
};
