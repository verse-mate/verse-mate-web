import type React from 'react';
import { NestedCard } from '@/components/study/StudyPrimitives';
import { vmTokens } from '@/styles/themeStyles';

/**
 * The chrome that carries the event graph's own material inside a chapter
 * study card — the inset rail on the Study tab's steps and movements.
 *
 * The event's observations live inside the Precept step that asks for them
 * (see `lib/jesusStudyEmbed`), but they are not the chapter study's words.
 * Every embedded block sits behind a labelled rail so the reader can always
 * tell which lines came from the event record and which came from the study.
 */

const FONT = 'Roboto, sans-serif';

/** The labelled inset a step or movement card ends with. */
export function EventAddendum({
  label = 'From this event',
  title,
  children,
  testId,
}: {
  label?: string;
  /** Tooltip on the rail's label. */
  title?: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      style={{
        marginTop: 18,
        paddingLeft: 12,
        borderLeft: `2px solid ${vmTokens.goldHover}`,
      }}
    >
      <p
        title={title ?? 'Recorded by this event, not by the chapter study.'}
        style={{
          fontFamily: FONT,
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: vmTokens.gold,
          margin: 0,
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

/** One embedded block: same nested card the steps use for their own sub-items. */
export function EventBlockCard({
  open,
  onToggle,
  title,
  count,
  subheading,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  /** Item count, shown as the pill the standalone cards used to carry. */
  count?: number;
  subheading?: string;
  children: React.ReactNode;
}) {
  return (
    <NestedCard
      open={open}
      onToggle={onToggle}
      heading={
        <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 15,
                fontWeight: 600,
                color: vmTokens.textPrimary,
              }}
            >
              {title}
            </span>
            {count != null && <EventCountPill count={count} />}
          </span>
          {subheading && (
            <span
              style={{
                fontFamily: FONT,
                fontSize: 13,
                fontStyle: 'italic',
                lineHeight: '20px',
                color: vmTokens.textSecondary,
              }}
            >
              {subheading}
            </span>
          )}
        </span>
      }
    >
      {children}
    </NestedCard>
  );
}

export function EventCountPill({ count }: { count: number }) {
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
        flexShrink: 0,
      }}
    >
      {count}
    </span>
  );
}

/**
 * The marker a step or movement wears when the event's own record is folded
 * into it — so a collapsed card still says there is event material inside.
 */
export function EventInsideBadge({ count }: { count?: number }) {
  return (
    <span
      data-testid="jesus-study-event-badge"
      title="This card carries what the event's own record adds here."
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '1px 8px',
        borderRadius: 999,
        fontFamily: FONT,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: vmTokens.gold,
        border: `1px solid ${vmTokens.goldHover}`,
        flexShrink: 0,
      }}
    >
      Event
      {count != null && <span style={{ fontWeight: 700 }}>{count}</span>}
    </span>
  );
}
