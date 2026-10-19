/**
 * Admin class schedule (/coach/admin/classes) — program admins only.
 *
 * Every leader's classes, which together are the VerseMate notetaker's
 * schedule: when each one meets and whether the notetaker can join it. An
 * admin schedules, edits and removes classes for any leader on the roster,
 * also one who has not signed up yet (the class waits under their roster id),
 * and can record a meeting straight from a leader's connected Zoom account.
 * Leaders keep their own classes on /coach/classes; both edit the same list.
 *
 * Non-admins hit the shared <CoachStateBoundary> 403 gate.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import ScreenHeader from '@/components/ScreenHeader';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { vmTokens } from '@/styles/themeStyles';
import { useAdminClasses, useAdminCoaches, useNotetakerZoom, coachKeys, coachState } from '@/hooks/useCoach';
import { CoachCard, CoachStateBoundary, SectionLabel } from '@/components/coach/CoachUi';
import { ClassForm, ClassRow } from '@/components/coach/ClassSchedule';
import { classDraft, classWhen, notetakerState, type ClassDraft } from '@/lib/coachClassSchedule';
import {
  createAdminCoachClass,
  deleteAdminCoachClass,
  refusalText,
  updateAdminCoachClass,
  type AdminCoachClass,
  type CoachClassInput,
  type NotetakerZoom,
  type NotetakerZoomMeeting,
} from '@/services/coachService';

interface LeaderGroup {
  key: string;
  name: string;
  email: string;
  classes: AdminCoachClass[];
}

/** The schedule form, open at the top ('new') or under a Zoom meeting. */
type Scheduling = { key: string; draft: ClassDraft; leader: string };

export default function CoachAdminClassesScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const classesQuery = useAdminClasses();
  const classes = coachState(classesQuery);
  const roster = useAdminCoaches();
  const zoom = useNotetakerZoom();

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

  const leaders = useMemo(
    () => [...(roster.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ id: c.id, name: c.name })),
    [roster.data],
  );

  const cannotJoin = list.filter((c) => ['incomplete', 'not-zoom'].includes(notetakerState(c).kind)).length;

  const [scheduling, setScheduling] = useState<Scheduling | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: coachKeys.adminClasses });
    queryClient.invalidateQueries({ queryKey: coachKeys.notetakerZoom });
  };

  const createMutation = useMutation({
    mutationFn: ({ coachId, input }: { coachId: string; input: CoachClassInput }) => createAdminCoachClass(coachId, input),
    onSuccess: () => {
      refresh();
      setScheduling(null);
      toast.success('Class scheduled');
    },
    onError: (err) => setFormError(refusalText(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CoachClassInput }) => updateAdminCoachClass(id, input),
    onSuccess: () => {
      refresh();
      setEditing(null);
      toast.success('Class saved');
    },
    onError: (err) => setFormError(refusalText(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCoachClass(id),
    onSuccess: () => {
      refresh();
      toast.success('Class removed');
    },
    onError: (err) => toast.error(`Could not remove the class. ${refusalText(err)}`),
  });

  const openSchedule = (next: Scheduling) => {
    setEditing(null);
    setFormError(null);
    setScheduling(next);
  };

  const openEdit = (id: string) => {
    setScheduling(null);
    setFormError(null);
    setEditing(id);
  };

  // A meeting's host the server matched to a roster leader picks that leader;
  // otherwise the admin chooses one.
  const recordMeeting = (m: NotetakerZoomMeeting) =>
    openSchedule({
      key: `meeting:${m.meetingId}`,
      leader: m.leader?.id ?? '',
      draft: classDraft({
        name: m.topic,
        zoomLink: m.joinUrl,
        classDate: m.classDate,
        startTime: m.startTime,
        timeZone: m.timeZone,
        recurrence: m.recurrence,
        notetaker: true,
      }),
    });

  const scheduleForm = (s: Scheduling) => (
    <ClassForm
      key={s.key}
      initial={s.draft}
      leaders={leaders}
      initialLeader={s.leader}
      busy={createMutation.isPending}
      submitLabel="Schedule class"
      error={formError}
      onCancel={() => setScheduling(null)}
      onSubmit={(input, coachId) => {
        setFormError(null);
        createMutation.mutate({ coachId, input });
      }}
    />
  );

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title="Class schedule" onBack={() => navigate('/coach')} backTestId="coach-admin-classes-back-button" />

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
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary }}>Class schedule</h2>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: vmTokens.textSecondary, lineHeight: 1.5 }}>
                Every class the VerseMate notetaker records, by leader. Schedule a class for any leader on the roster,
                also one who has not signed up yet. Leaders add and edit their own on their Class Setup page.
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 12.5, color: vmTokens.textTertiary }}>
                {list.length} class{list.length === 1 ? '' : 'es'} · {groups.length} leader{groups.length === 1 ? '' : 's'}
                {cannotJoin > 0 ? (
                  <span data-testid="coach-admin-classes-cannot-join" style={{ color: vmTokens.statusError }}>
                    {' '}
                    · the notetaker can’t join {cannotJoin} yet
                  </span>
                ) : null}
              </p>
            </div>

            {scheduling?.key === 'new' ? (
              scheduleForm(scheduling)
            ) : (
              <button
                type="button"
                data-testid="coach-admin-schedule"
                onClick={() => openSchedule({ key: 'new', leader: '', draft: classDraft() })}
                style={dashedBtnStyle}
              >
                <Plus size={17} strokeWidth={2} /> Schedule a class
              </button>
            )}

            {list.length === 0 && (
              <CoachCard testId="coach-admin-classes-empty">
                <p style={{ margin: 0, fontSize: 14, color: vmTokens.textSecondary }}>
                  No classes yet. Schedule one for a leader, or a leader adds their own on their Class Setup page.
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
                  {g.classes.map((cls) =>
                    editing === cls.id ? (
                      <ClassForm
                        key={cls.id}
                        initial={classDraft(cls)}
                        busy={updateMutation.isPending}
                        submitLabel="Save"
                        error={formError}
                        onCancel={() => setEditing(null)}
                        onSubmit={(input) => {
                          setFormError(null);
                          updateMutation.mutate({ id: cls.id, input });
                        }}
                      />
                    ) : (
                      <ClassRow
                        key={cls.id}
                        cls={cls}
                        testId="coach-admin-class-row"
                        onEdit={() => openEdit(cls.id)}
                        onDelete={() => {
                          if (window.confirm(`Remove “${cls.name}” (${cls.leader.name})? The notetaker stops joining it.`)) {
                            deleteMutation.mutate(cls.id);
                          }
                        }}
                        deleting={deleteMutation.isPending && deleteMutation.variables === cls.id}
                      />
                    ),
                  )}
                </div>
              </div>
            ))}

            <ZoomAccounts
              data={zoom.data}
              loading={zoom.isLoading}
              failed={zoom.isError}
              openKey={scheduling?.key ?? null}
              onRecord={recordMeeting}
              renderForm={() => (scheduling ? scheduleForm(scheduling) : null)}
            />
          </div>
        </CoachStateBoundary>
      </div>
    </div>
  );
}

// ─── From connected Zoom accounts ────────────────────────────────────────────

function ZoomAccounts({
  data,
  loading,
  failed,
  openKey,
  onRecord,
  renderForm,
}: {
  data: NotetakerZoom | undefined;
  loading: boolean;
  failed: boolean;
  openKey: string | null;
  onRecord: (m: NotetakerZoomMeeting) => void;
  renderForm: () => React.ReactNode;
}) {
  if (loading) return null;

  // Each account with the meetings it hosts; a meeting whose host is not among
  // the connections (it should not happen) still gets listed, last.
  const accounts = (data?.connections ?? []).map((c) => ({
    key: c.email,
    title: c.name || c.email,
    email: c.email,
    leader: c.leader,
    matchable: true,
    meetings: (data?.meetings ?? []).filter((m) => m.hostEmail === c.email),
  }));
  const hosts = new Set(accounts.map((a) => a.email));
  const others = (data?.meetings ?? []).filter((m) => !hosts.has(m.hostEmail));
  if (others.length > 0) {
    accounts.push({ key: '', title: 'Other meetings', email: '', leader: null, matchable: false, meetings: others });
  }

  return (
    <div data-testid="coach-admin-zoom" style={{ marginTop: 8 }}>
      <SectionLabel>From connected Zoom accounts</SectionLabel>
      {failed || !data?.available ? (
        <p data-testid="coach-admin-zoom-unavailable" style={{ margin: 0, fontSize: 13, color: vmTokens.textTertiary }}>
          The notetaker is not reachable right now.
        </p>
      ) : accounts.length === 0 ? (
        <CoachCard testId="coach-admin-zoom-empty">
          <p style={{ margin: 0, fontSize: 13.5, color: vmTokens.textSecondary, lineHeight: 1.5 }}>
            No leader has connected Zoom yet. Leaders connect it from their Class Setup page.
          </p>
        </CoachCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {accounts.map((a) => (
            <CoachCard key={a.key} testId="coach-admin-zoom-account">
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: vmTokens.textPrimary }}>{a.title}</h3>
              {a.matchable && (
                <p style={{ margin: '4px 0 0', fontSize: 12.5, color: vmTokens.textSecondary }}>
                  {a.email} ·{' '}
                  {a.leader ? (
                    `Leader: ${a.leader.name}`
                  ) : (
                    <span style={{ color: vmTokens.statusError }}>not matched to a leader</span>
                  )}
                </p>
              )}
              {a.meetings.length === 0 ? (
                <p style={{ margin: '10px 0 0', fontSize: 12.5, color: vmTokens.textTertiary }}>
                  No upcoming meetings in this Zoom account.
                </p>
              ) : (
                a.meetings.map((m) => (
                  <div
                    key={m.meetingId}
                    data-testid="coach-admin-zoom-meeting"
                    style={{ borderTop: `1px solid ${vmTokens.divider}`, marginTop: 10, paddingTop: 10 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: vmTokens.textPrimary }}>
                          {m.topic || 'Untitled meeting'}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: vmTokens.textSecondary }}>{classWhen(m)}</p>
                        {m.invited && !m.classId && (
                          <p style={{ margin: '4px 0 0', fontSize: 12.5, color: vmTokens.textTertiary }}>
                            Invited in Zoom: the notetaker joins it
                          </p>
                        )}
                      </div>
                      {m.classId ? (
                        <span
                          data-testid="coach-admin-zoom-recorded"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            flexShrink: 0,
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: vmTokens.statusSuccess,
                          }}
                        >
                          <CheckCircle2 size={14} /> Recorded
                        </span>
                      ) : (
                        <button
                          type="button"
                          data-testid="coach-admin-zoom-record"
                          onClick={() => onRecord(m)}
                          style={recordBtnStyle}
                        >
                          Record this
                        </button>
                      )}
                    </div>
                    {openKey === `meeting:${m.meetingId}` && <div style={{ marginTop: 10 }}>{renderForm()}</div>}
                  </div>
                ))
              )}
            </CoachCard>
          ))}
        </div>
      )}
    </div>
  );
}

const dashedBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '12px 16px',
  borderRadius: 12,
  border: `1px dashed ${vmTokens.inputBorder}`,
  background: 'transparent',
  color: vmTokens.gold,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

const recordBtnStyle: React.CSSProperties = {
  flexShrink: 0,
  padding: '7px 12px',
  borderRadius: 9,
  border: `1px solid ${vmTokens.gold}`,
  background: 'transparent',
  color: vmTokens.gold,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};
