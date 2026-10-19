/**
 * Read-only list of a leader's registered classes: when each one meets, the
 * link the VerseMate notetaker joins and whether it can join it. Used on the
 * admin's per-leader page. Presentational only — the caller supplies the
 * classes (from the admin export); editing happens on the leader's Sessions
 * page, or for an admin on the leader's Sessions drill-in and the class
 * schedule.
 */

import { vmTokens } from '@/styles/themeStyles';
import { CoachCard } from './CoachUi';
import { ClassRow } from './ClassSchedule';
import type { CoachClass } from '@/services/coachService';

export default function ClassLinkList({ classes }: { classes: CoachClass[] }) {
  if (classes.length === 0) {
    return (
      <CoachCard testId="coach-class-links-empty">
        <p style={{ margin: 0, fontSize: 13.5, color: vmTokens.textSecondary }}>
          No classes registered yet. When this leader adds a class, or an admin schedules one for them, the meeting
          link the notetaker joins appears here.
        </p>
      </CoachCard>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {classes.map((cls) => (
        <ClassRow key={cls.id} cls={cls} testId="coach-class-link-row" />
      ))}
    </div>
  );
}
