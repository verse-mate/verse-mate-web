import type React from 'react';
import MarkdownBlock from '@/components/MarkdownBlock';
import { Card, RangePill } from '@/components/study/StudyPrimitives';
import { cardHeadingTitleStyle, firstLineAlignStyle, sectionIntroStyle } from '@/components/study/studyStyles';
import { vmTokens } from '@/styles/themeStyles';
import type { StudyLabels } from '@versemate/studies';
import type { StudyApplication, StudyMovement } from '@versemate/studies/types';

/**
 * The Interpretation and Application cards.
 *
 * Split out of `StudyPanel` so the Jesus event's Study tab renders the same
 * movements and application questions — narrowed to the event's verses — in
 * the same skin, rather than a near-copy that drifts.
 */

/** One interpretation movement: range pill, scripture excerpt, markdown body. */
export function MovementCard({
  movement,
  bookName,
  label,
  open,
  onToggle,
  badge,
  addendum,
}: {
  movement: StudyMovement;
  /** Book the excerpt is quoted from — "James", "Luke". */
  bookName: string;
  /** Localized word before the number, e.g. "Movement". */
  label: string;
  open: boolean;
  onToggle: () => void;
  /** Optional marker beside the movement title — see `addendum`. */
  badge?: React.ReactNode;
  /**
   * Optional block rendered after the movement's body. The Jesus event's
   * Study tab nests what the event reveals about Him inside the movement
   * whose verses the reveal cites, rather than in a card of its own.
   */
  addendum?: React.ReactNode;
}) {
  return (
    <Card
      open={open}
      onToggle={onToggle}
      heading={
        // align-items: flex-start so when the title wraps to two lines
        // the pill stays anchored to the first line, not vertically
        // centered with the multi-line block (which makes the second
        // line look mis-indented under the pill).
        <span style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ marginTop: 2 }}><RangePill range={movement.range} /></span>
          <span style={cardHeadingTitleStyle}>{label} {movement.number} — {movement.title}</span>
          {badge && <span style={{ marginTop: 3 }}>{badge}</span>}
        </span>
      }
    >
      {movement.excerpt && (
        // Prototype .int-quote — serif italic, 0.8em of parent (parent
        // is the user-controlled body font, default 20 → quote = 16),
        // line-height 1.6, gold left border. Color matches the
        // prototype's rgba(27,27,27,0.88) ≈ near-black.
        <blockquote
          style={{
            fontFamily: "'Roboto Serif', Georgia, serif",
            fontSize: '0.8em',
            lineHeight: 1.6,
            fontStyle: 'italic',
            color: vmTokens.textPrimary,
            padding: '4px 0 4px 14px',
            borderLeft: `3px solid ${vmTokens.gold}`,
            margin: '0 0 14px',
          }}
        >
          "{movement.excerpt}" — {bookName} {movement.range}
        </blockquote>
      )}
      <MarkdownBlock text={movement.body} />
      {addendum}
    </Card>
  );
}

/** The single Application card — one question per movement. */
export function ApplicationCard({
  intro,
  questions,
  labels,
  open,
  onToggle,
}: {
  intro?: string;
  questions: StudyApplication[];
  labels: StudyLabels;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Card
      open={open}
      onToggle={onToggle}
      heading={<span style={cardHeadingTitleStyle}>{labels.applyOneQuestion}</span>}
    >
      {intro && (
        <p style={{ ...sectionIntroStyle, marginBottom: 16 }}>
          {intro}
        </p>
      )}
      {/* Prototype's .study-app-list: borderless, gap-only list. Pills on
          left aligned to first line of question; question text in serif
          for parity with the byline / intro prose style. */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {questions.map(q => (
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
  );
}
