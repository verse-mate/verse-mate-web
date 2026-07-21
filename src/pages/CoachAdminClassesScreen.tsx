/**
 * Admin class-links oversight (/coach/admin/classes) — program admins only.
 *
 * Read-only view of every leader's registered classes and the Zoom / Meet /
 * Teams link the coaching Notetaker bot joins for each. This is the single
 * feed the Fireflies auto-joins are configured from, so an admin can see —
 * across the whole cohort — which meetings will be recorded and spot any class
 * with no link yet (the bot can't join those).
 *
 * Leaders set their own classes on /coach/classes; this screen does not edit
 * them. Non-admins hit the shared <CoachStateBoundary> 403 gate.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Video } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { vmTokens } from '@/styles/themeStyles';
import { useAdminClasses, coachState } from '@/hooks/useCoach';
import { CoachCard, CoachStateBoundary, SectionLabel } from '@/components/coach/CoachUi';
import type { AdminCoachClass } from '@/services/coachService';

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

interface LeaderGroup {
  key: string;
  name: string;
  email: string;
  classes: AdminCoachClass[];
}

export default function CoachAdminClassesScreen() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const classesQuery = useAdminClasses();
  const classes = coachState(classesQuery);

  const list = useMemo(() => classes.data || [], [classes.data]);

  // Group by leader, keeping leaders sorted by name and classes by date.
  const groups = useMemo<LeaderGroup[]>(() => {
    const byLeader = new Map<string, LeaderGroup>();
    for (const cls of list) {
      const key = cls.leader.id || cls.leader.email || cls.leader.name;
      let g = byLeader.get(key);
      if (!g) {
        g = { key, name: cls.leader.name, email: cls.leader.email, classes: [] };
        byLeader.set(key, g);
      }
      g.classes.push(cls);
    }
    const out = [...byLeader.values()];
    out.sort((a, b) => a.name.localeCompare(b.name));
    for (const g of out) g.classes.sort((a, b) => (a.classDate || '').localeCompare(b.classDate || ''));
    return out;
  }, [list]);

  const missingCount = list.filter((c) => !c.zoomLink.trim()).length;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title="Class links" onBack={() => navigate('/coach')} backTestId="coach-admin-classes-back-button" />

      <div
        data-testid="coach-admin-classes"
        style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${vmTokens.divider}` }}
      >
        <CoachStateBoundary
          loading={classes.loading}
          authError={classes.authError}
          error={classes.error}
          onRetry={() => classesQuery.refetch()}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              padding: isDesktop ? 24 : 16,
              maxWidth: isDesktop ? 1000 : 640,
              margin: '0 auto',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary }}>Class links</h2>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: vmTokens.textSecondary, lineHeight: 1.5 }}>
                Every class your leaders have registered and the meeting link the coaching notetaker joins for each.
                This is what the bot auto-joins. Leaders add and edit their own classes on their Class Setup page.
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 12.5, color: vmTokens.textTertiary }}>
                {list.length} class{list.length === 1 ? '' : 'es'} · {groups.length} leader{groups.length === 1 ? '' : 's'}
                {missingCount > 0 ? (
                  <span style={{ color: vmTokens.statusError }}> · {missingCount} with no link</span>
                ) : null}
              </p>
            </div>

            {list.length === 0 && (
              <CoachCard testId="coach-admin-classes-empty">
                <p style={{ margin: 0, fontSize: 14, color: vmTokens.textSecondary }}>
                  No classes registered yet. Once a leader adds a class on their Class Setup page, it appears here.
                </p>
              </CoachCard>
            )}

            {groups.map((g) => (
              <div key={g.key}>
                <SectionLabel>
                  {g.name}
                  {g.email ? ` · ${g.email}` : ''}
                </SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {g.classes.map((cls) => (
                    <ClassRow key={cls.id} cls={cls} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CoachStateBoundary>
      </div>
    </div>
  );
}

function ClassRow({ cls }: { cls: AdminCoachClass }) {
  const hasLink = cls.zoomLink.trim() !== '';
  return (
    <CoachCard testId="coach-admin-class-row">
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
