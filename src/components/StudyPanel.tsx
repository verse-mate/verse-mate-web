import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import ShareIcon from '@/components/ShareIcon';
import MarkdownBlock from '@/components/MarkdownBlock';
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
  const study: InductiveStudy | null = bookId ? getStudyFor(bookId, chapter) : null;

  // Bulk state drives the default for every section. Per-card overrides win
  // when the user toggles individually after a bulk action.
  const [bulkState, setBulkState] = useState<'expanded' | 'collapsed' | null>('expanded');
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
  // sub-ids so a single bulk click also opens / closes nested cards.
  const allIds: string[] = [];
  for (const s of study.steps) {
    allIds.push(`step-${s.number}`);
    if (s.kind === 'qa') s.items.forEach((_, i) => allIds.push(`step-${s.number}-qa-${i}`));
    if (s.kind === 'segments') s.segments.forEach((_, i) => allIds.push(`step-${s.number}-seg-${i}`));
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
    <div>
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

      <SectionHeading label="Interpretation — Five Movements" />
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

      <SectionHeading label="Application — Questions for the Group" />
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
          <div key={q.range} style={{ display: 'flex', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #1f1f1f' }}>
            <RangePill range={q.range} />
            <p style={{ fontSize: 15, color: '#E7E7E7', lineHeight: '24px', margin: 0, flex: 1 }}>
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
      subheading={!open ? step.summary : undefined}
    >
      <p style={stepSummaryStyle}>{step.summary}</p>
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
      return <SegmentsBody step={step} isOpen={isOpen} toggle={toggle} />;
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
            heading={item.q}
          >
            <MarkdownBlock text={item.a} />
          </NestedCard>
        );
      })}
    </div>
  );
}

function KeywordsBody({ step }: { step: StepKeywords }) {
  return (
    <div>
      <h4 style={subTitleStyle}>Marking legend</h4>
      <Table>
        <thead>
          <tr>
            <Th style={{ width: '28%' }}>Mark</Th>
            <Th style={{ width: '32%' }}>Applies to</Th>
            <Th>Example in James 1</Th>
          </tr>
        </thead>
        <tbody>
          {step.legend.map((row, i) => (
            <tr key={i}>
              <Td style={{ fontWeight: 600, color: '#E7E7E7' }}>{row.mark}</Td>
              <Td>{row.appliesTo}</Td>
              <Td style={{ color: 'rgba(255,255,255,0.7)' }}>{row.example}</Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h4 style={subTitleStyle}>Key word inventory</h4>
      <Table>
        <thead>
          <tr>
            <Th>Key word</Th>
            <Th>Greek</Th>
            <Th style={{ width: 64, textAlign: 'right' }}>Count</Th>
            <Th>Verses</Th>
          </tr>
        </thead>
        <tbody>
          {step.inventory.map((row, i) => (
            <tr key={i}>
              <Td style={{ fontWeight: 600, color: '#E7E7E7' }}>{row.word}</Td>
              <Td style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>{row.greek ?? '—'}</Td>
              <Td style={{ textAlign: 'right', color: '#B09A6D', fontWeight: 600 }}>{row.count}</Td>
              <Td style={{ color: 'rgba(255,255,255,0.7)' }}>{row.verses}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
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
            gap: 12,
            paddingTop: 10,
            paddingBottom: 10,
            borderTop: i === 0 ? '1px solid #1f1f1f' : 'none',
            borderBottom: '1px solid #1f1f1f',
          }}
        >
          <RangePill range={item.verses} />
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 11, backgroundColor: '#1A1A1A', color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
            {item.type}
          </span>
          <span style={{ flex: 1, fontSize: 15, color: '#E7E7E7', lineHeight: '24px' }}>{item.pairing}</span>
        </div>
      ))}
    </div>
  );
}

function BulletsBody({ step }: { step: StepBullets }) {
  return (
    <div>
      {step.items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 12,
            paddingTop: 10,
            paddingBottom: 10,
            borderTop: i === 0 ? '1px solid #1f1f1f' : 'none',
            borderBottom: '1px solid #1f1f1f',
          }}
        >
          {item.tag && <RangePill range={item.tag} />}
          <span style={{ flex: 1, fontSize: 15, color: '#E7E7E7', lineHeight: '24px' }}>
            <MarkdownBlock text={item.text} />
          </span>
        </div>
      ))}
      {step.note && (
        <p style={{ marginTop: 14, fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: '22px', fontStyle: 'italic' }}>
          {step.note}
        </p>
      )}
    </div>
  );
}

function SegmentsBody({ step, isOpen, toggle }: { step: StepSegments; isOpen: (id: string) => boolean; toggle: (id: string) => void }) {
  return (
    <div>
      <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 8, backgroundColor: '#1A1A1A', border: '1px solid #2a2a2a' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#B09A6D', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, marginBottom: 4 }}>
          Chapter theme
        </p>
        <p style={{ fontSize: 16, color: '#E7E7E7', fontStyle: 'italic', margin: 0, lineHeight: '24px' }}>
          {step.themeHeadline}
        </p>
      </div>
      {step.segments.map((seg, i) => {
        const id = `step-${step.number}-seg-${i}`;
        const open = isOpen(id);
        return (
          <NestedCard key={i} open={open} onToggle={() => toggle(id)} heading={seg.title}>
            <MarkdownBlock text={seg.body} />
          </NestedCard>
        );
      })}
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, color: '#FFFFFF', flex: 1, minWidth: 0 }}>
          <span style={{ width: '100%' }}>{heading}</span>
          {subheading && (
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 400, lineHeight: '18px', paddingLeft: 36 }}>{subheading}</span>
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
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderTop: '1px solid #1f1f1f' }}>
      <button
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', gap: 12 }}
      >
        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, fontWeight: 500, color: '#E7E7E7', flex: 1 }}>
          {heading}
        </span>
        {open ? (
          <ChevronUp size={16} color="rgba(255,255,255,0.55)" style={{ flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} color="rgba(255,255,255,0.55)" style={{ flexShrink: 0 }} />
        )}
      </button>
      {open && (
        <div style={{ paddingBottom: 12 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function RangePill({ range }: { range: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 56,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#1A1A1A',
        border: '1px solid #B09A6D',
        color: '#B09A6D',
        fontSize: 11,
        fontWeight: 600,
        padding: '0 8px',
        flexShrink: 0,
        alignSelf: 'flex-start',
        marginTop: 2,
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
