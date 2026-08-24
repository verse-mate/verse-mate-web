import type React from 'react';
import MarkdownBlock from '@/components/MarkdownBlock';
import {
  Card,
  NestedCard,
  RangePill,
  Table,
  Tag,
  Td,
  Th,
} from '@/components/study/StudyPrimitives';
import {
  cardHeadingTitleStyle,
  firstLineAlignStyle,
  stepNumberStyle,
} from '@/components/study/studyStyles';
import { usePreferredLanguage } from '@/hooks/usePreferredLanguage';
import { useStudyLabels } from '@/hooks/useStudyLabels';
import { vmTokens } from '@/styles/themeStyles';
import type {
  StepBullets,
  StepContrasts,
  StepKeywords,
  StepLists,
  StepProse,
  StepQA,
  StepSegments,
  StudyStep,
} from '@versemate/studies/types';

/**
 * One card per observation step, dispatching on the step's `kind`.
 *
 * Shared by the Bible side's chapter study and the Jesus event's Study tab —
 * an event study is the chapter's steps narrowed to the event's verses (see
 * `lib/jesusStudy`), so it renders through exactly this code.
 */


export function StepCard({
  step,
  isOpen,
  toggle,
  badge,
  addendum,
}: {
  step: StudyStep;
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
  /**
   * Optional marker beside the step title. The Jesus event's Study tab uses
   * it to say that a step is chapter context — its content carries no verse
   * tags, so it could not be narrowed to the event's passage.
   */
  badge?: React.ReactNode;
  /**
   * Optional block rendered after the step's own content. The Jesus event's
   * Study tab folds what the event graph observes — the setting, His words,
   * His acts, the reactions — into the step that asks for it, behind a rail
   * that keeps it visibly separate from the chapter study's own lines.
   */
  addendum?: React.ReactNode;
}) {
  const id = `step-${step.number}`;
  const open = isOpen(id);
  return (
    <Card
      open={open}
      onToggle={() => toggle(id)}
      heading={
        <span style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={stepNumberStyle}>{step.number}</span>
          <span style={cardHeadingTitleStyle}>{step.title}</span>
          {badge}
        </span>
      }
      // Always show the italic summary as a subheading (same size + position
      // whether the card is open or closed). Renders inside the heading area
      // so it doesn't shift into the body when expanding.
      subheading={step.summary}
    >
      {renderStepBody(step, isOpen, toggle)}
      {addendum}
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
  const labels = useStudyLabels(usePreferredLanguage());
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
            <span style={{ fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', marginRight: 6 }}>{labels.versesLabel}</span>
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
  // Prototype's .obs-contrast-row: each pairing is a cream-card row with
  // a solid-gold verse-ref pill + gold-outlined CONTRAST/COMPARISON tag
  // (COMPARISON uses a dashed border) + serif body text.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {step.items.map((item, i) => {
        const isComparison = String(item.type).toUpperCase() === 'COMPARISON';
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '10px 12px',
              background: vmTokens.surfaceRaisedBg,
              border: `1px solid ${vmTokens.surfaceRaisedBorder}`,
              borderRadius: 10,
              fontFamily: "'Roboto Serif', Georgia, serif",
              fontSize: 14.5,
              lineHeight: 1.5,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px 10px',
                background: vmTokens.gold,
                borderRadius: 999,
                fontFamily: 'Roboto, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                color: vmTokens.goldOnLight,
                minWidth: 52,
                flexShrink: 0,
              }}
            >
              {item.verses}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px 9px',
                background: 'transparent',
                border: `1px ${isComparison ? 'dashed' : 'solid'} ${vmTokens.gold}`,
                borderRadius: 999,
                fontFamily: 'Roboto, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: vmTokens.gold,
                flexShrink: 0,
                textTransform: 'uppercase',
              }}
            >
              {item.type}
            </span>
            <span style={{ flex: 1, color: vmTokens.textPrimary }}>{item.pairing}</span>
          </div>
        );
      })}
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
  const labels = useStudyLabels(usePreferredLanguage());
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
          {labels.chapterThemeLabel}
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
