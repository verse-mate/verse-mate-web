import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import ShareIcon from '@/components/ShareIcon';
import MarkdownBlock from '@/components/MarkdownBlock';
import { getStudyFor, InductiveStudy } from '@/data/studies';

interface Props {
  book: string;
  bookId: number | null;
  chapter: number;
}

// Section IDs are stable so expand-all / per-card state can address them.
type SectionId =
  | `step-${number}`
  | `mv-${number}`
  | 'interpretation-intro'
  | 'application';

/**
 * StudyPanel — renders the Precept inductive Bible study for a given chapter.
 *
 * Layout: 9 numbered observation cards → Interpretation movements →
 * Application questions. Each card is independently collapsible. The header
 * has a single Expand-All / Collapse-All toggle that operates on every card.
 */
export default function StudyPanel({ book, bookId, chapter }: Props) {
  const study: InductiveStudy | null = bookId ? getStudyFor(bookId, chapter) : null;

  // null = use per-card expanded state. Set = expand all. 'collapsed' = collapse all.
  const [bulkState, setBulkState] = useState<'expanded' | 'collapsed' | null>('expanded');
  // Per-card overrides (so individual toggles work after a bulk action).
  const [overrides, setOverrides] = useState<Record<SectionId, boolean>>({} as Record<SectionId, boolean>);

  const isOpen = (id: SectionId): boolean => {
    if (id in overrides) return overrides[id];
    return bulkState !== 'collapsed';
  };
  const toggle = (id: SectionId) => {
    setOverrides(prev => ({ ...prev, [id]: !isOpen(id) }));
  };

  if (!study) {
    return (
      <div>
        <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: '#E7E7E7', margin: 0, marginBottom: 16 }}>
          Inductive Study of {book} {chapter}
        </h2>
        <div style={{ marginTop: 24, padding: 24, borderRadius: 12, backgroundColor: '#1A1A1A', border: '1px solid #2a2a2a', textAlign: 'center' }}>
          <BookOpen size={28} color="#B09A6D" style={{ margin: '0 auto 12px' }} strokeWidth={1.5} />
          <p style={{ color: '#E7E7E7', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Inductive Study coming soon</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: '20px' }}>
            We're rolling out the 9-step Precept inductive method chapter by chapter. James 1 is the first chapter live — try it from any verse in James 1.
          </p>
        </div>
      </div>
    );
  }

  const allCardIds: SectionId[] = [
    ...study.steps.map(s => `step-${s.number}` as SectionId),
    'interpretation-intro' as SectionId,
    ...study.interpretation.movements.map(m => `mv-${m.number}` as SectionId),
    'application' as SectionId,
  ];
  const allOpen = allCardIds.every(id => isOpen(id));

  const setAll = (open: boolean) => {
    setBulkState(open ? 'expanded' : 'collapsed');
    setOverrides({} as Record<SectionId, boolean>);
  };

  return (
    <div>
      {/* Title + share */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: '#E7E7E7', margin: 0 }}>
          Inductive Study of {study.title}
        </h2>
        <button
          onClick={() => navigator.share?.({ title: `Inductive Study of ${study.title}`, text: `Inductive Study of ${study.title}` }).catch(() => {})}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexShrink: 0 }}
          aria-label="Share study"
        >
          <ShareIcon size={18} color="#E7E7E7" />
        </button>
      </div>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, marginBottom: 4 }}>
        {study.subtitle}
      </p>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#B09A6D', fontStyle: 'italic', margin: 0, marginBottom: 12 }}>
        Theme: {study.themeOneLine}
      </p>

      {/* Expand All / Collapse All */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          onClick={() => setAll(!allOpen)}
          style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#B09A6D', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {allOpen ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* OBSERVATION — 9 step cards */}
      <SectionHeading label="Observation — 9 Inductive Steps" />
      {study.steps.map(step => {
        const id: SectionId = `step-${step.number}`;
        const open = isOpen(id);
        return (
          <Card key={id} open={open} onToggle={() => toggle(id)}
            heading={
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 12, backgroundColor: '#B09A6D', color: '#000', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {step.number}
                </span>
                <span style={{ fontWeight: 500 }}>{step.title}</span>
              </span>
            }
            subheading={!open ? step.summary : undefined}
          >
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', marginBottom: 12 }}>
              {step.summary}
            </p>
            <MarkdownBlock text={step.body} />
          </Card>
        );
      })}

      {/* INTERPRETATION */}
      <SectionHeading label="Interpretation — Five Movements" />
      {study.interpretation.intro && (
        <Card
          open={isOpen('interpretation-intro')}
          onToggle={() => toggle('interpretation-intro')}
          heading={<span style={{ fontWeight: 500 }}>About the six interpretation guardrails</span>}
        >
          <MarkdownBlock text={study.interpretation.intro} />
        </Card>
      )}
      {study.interpretation.movements.map(mv => {
        const id: SectionId = `mv-${mv.number}`;
        const open = isOpen(id);
        return (
          <Card key={id} open={open} onToggle={() => toggle(id)}
            heading={
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 56, height: 22, borderRadius: 11, backgroundColor: '#1A1A1A', border: '1px solid #B09A6D', color: '#B09A6D', fontSize: 11, fontWeight: 600, padding: '0 8px', flexShrink: 0 }}>
                  {mv.range}
                </span>
                <span style={{ fontWeight: 500 }}>Movement {mv.number} — {mv.title}</span>
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
        );
      })}

      {/* APPLICATION */}
      <SectionHeading label="Application — Questions for the Group" />
      <Card
        open={isOpen('application')}
        onToggle={() => toggle('application')}
        heading={<span style={{ fontWeight: 500 }}>Apply, one question per movement</span>}
      >
        {study.application.intro && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>
            {study.application.intro}
          </p>
        )}
        <div>
          {study.application.questions.map(q => (
            <div key={q.range} style={{ display: 'flex', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #1f1f1f' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 56, height: 22, borderRadius: 11, backgroundColor: '#1A1A1A', border: '1px solid #B09A6D', color: '#B09A6D', fontSize: 11, fontWeight: 600, padding: '0 8px', flexShrink: 0, alignSelf: 'flex-start', marginTop: 2 }}>
                {q.range}
              </span>
              <p style={{ fontSize: 14, color: '#E7E7E7', lineHeight: '22px', margin: 0, flex: 1 }}>
                {q.question}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 700, color: '#B09A6D', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, marginTop: 18, marginBottom: 8 }}>
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
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', gap: 12 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, color: '#FFFFFF', fontFamily: 'Roboto, sans-serif', fontSize: 14, lineHeight: '20px', flex: 1, minWidth: 0 }}>
          <span style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{heading}</span>
          {subheading && (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 400, lineHeight: '16px' }}>{subheading}</span>
          )}
        </div>
        {open ? (
          <ChevronUp size={16} color="rgba(255,255,255,0.6)" style={{ flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} color="rgba(255,255,255,0.6)" style={{ flexShrink: 0 }} />
        )}
      </button>
      {open && (
        <div style={{ paddingBottom: 16 }}>
          {children}
        </div>
      )}
    </div>
  );
}
