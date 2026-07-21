/**
 * Read-only list of a leader's registered classes and the Zoom / Meet / Teams
 * link the coaching Notetaker bot joins for each. Shared by the admin
 * all-leaders view and the per-leader Bible-coach page. Presentational only —
 * the caller supplies the classes (from the admin export or the leader's own
 * list); editing happens on the leader's Class Setup page.
 */

import { CalendarDays, Video } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';
import { CoachCard } from './CoachUi';
import type { CoachClass } from '@/services/coachService';

const RECURRENCE_LABEL: Record<string, string> = {
  none: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Every other week',
  monthly: 'Monthly',
};

function formatDate(iso: string | null): string {
  if (!iso) return 'No date set';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ClassLinkList({ classes }: { classes: CoachClass[] }) {
  if (classes.length === 0) {
    return (
      <CoachCard testId="coach-class-links-empty">
        <p style={{ margin: 0, fontSize: 13.5, color: vmTokens.textSecondary }}>
          No classes registered yet. When this leader adds a class on their Class Setup page, the meeting link the
          notetaker joins appears here.
        </p>
      </CoachCard>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {classes.map((cls) => (
        <ClassLinkRow key={cls.id} cls={cls} />
      ))}
    </div>
  );
}

function ClassLinkRow({ cls }: { cls: CoachClass }) {
  const hasLink = cls.zoomLink.trim() !== '';
  return (
    <CoachCard testId="coach-class-link-row">
      <div style={{ minWidth: 0 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: vmTokens.textPrimary }}>{cls.name}</h3>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 14px',
            marginTop: 6,
            fontSize: 12.5,
            color: vmTokens.textSecondary,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <CalendarDays size={14} style={{ color: vmTokens.textTertiary }} /> {formatDate(cls.classDate)}
          </span>
          <span>{RECURRENCE_LABEL[cls.recurrence] ?? cls.recurrence}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, minWidth: 0 }}>
          <Video size={14} style={{ color: hasLink ? vmTokens.gold : vmTokens.textTertiary, flexShrink: 0 }} />
          {hasLink ? (
            <a
              href={cls.zoomLink}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 12.5,
                color: vmTokens.gold,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {cls.zoomLink}
            </a>
          ) : (
            <span style={{ fontSize: 12.5, color: vmTokens.statusError }}>No meeting link — the bot can’t join</span>
          )}
        </div>
      </div>
    </CoachCard>
  );
}
