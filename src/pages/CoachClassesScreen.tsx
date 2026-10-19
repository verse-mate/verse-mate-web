/**
 * Class Setup (/coach/classes) — a leader lists each class they run, and the
 * list is the VerseMate notetaker's schedule.
 *
 * Every class carries a name, its first or next date, a recurrence, a start
 * time and time zone, the meeting link, and whether the notetaker records it.
 * The notetaker joins the link at that time; with the leader's Zoom account
 * connected (the card at the top) it joins as their guest, otherwise the host
 * admits it. Persisted via the /coach/classes API.
 *
 * Signed-out / not-a-coach states are handled by <CoachStateBoundary> — the
 * same gate the rest of the portal uses.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import ScreenHeader from '@/components/ScreenHeader';
import { vmTokens } from '@/styles/themeStyles';
import { useCoachMe, useCoachClasses, coachKeys, coachState } from '@/hooks/useCoach';
import {
  CoachCard,
  CoachStateBoundary,
  SectionLabel,
} from '@/components/coach/CoachUi';
import { ClassForm, ClassRow } from '@/components/coach/ClassSchedule';
import NotetakerConnectCard from '@/components/coach/NotetakerConnectCard';
import { classDraft } from '@/lib/coachClassSchedule';
import {
  CoachApiError,
  createCoachClass,
  updateCoachClass,
  deleteCoachClass,
  type CoachClassInput,
} from '@/services/coachService';

// A 400 names what the server refused ("Choose the time zone the start time is
// in"), which says more than "check the fields".
function saveProblem(err: unknown, what: string): string {
  return err instanceof CoachApiError && err.status === 400 && err.serverMessage
    ? `${what}: ${err.serverMessage}`
    : `${what} — check the fields and try again`;
}

export default function CoachClassesScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const meQuery = useCoachMe();
  const classesQuery = useCoachClasses();

  const me = coachState(meQuery);
  const classes = coachState(classesQuery);
  const loading = me.loading || classes.loading;

  // Which row is being edited (id), or 'new' for the add form, or null.
  const [editing, setEditing] = useState<string | 'new' | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: coachKeys.classes });

  const createMutation = useMutation({
    mutationFn: (input: CoachClassInput) => createCoachClass(input),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      toast.success('Class added');
    },
    onError: (err) => toast.error(saveProblem(err, 'Could not add the class')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CoachClassInput }) => updateCoachClass(id, input),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      toast.success('Class saved');
    },
    onError: (err) => toast.error(saveProblem(err, 'Could not save the class')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCoachClass(id),
    onSuccess: () => {
      invalidate();
      toast.success('Class removed');
    },
    onError: () => toast.error('Could not remove the class'),
  });

  const list = classes.data || [];
  const busy = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title="Class Setup" onBack={() => navigate('/coach')} backTestId="coach-classes-back-button" />

      <div
        data-testid="coach-classes"
        style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${vmTokens.divider}` }}
      >
        <CoachStateBoundary
          loading={loading}
          authError={me.authError || classes.authError}
          error={me.error || classes.error}
          onRetry={() => {
            meQuery.refetch();
            classesQuery.refetch();
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              padding: 16,
              maxWidth: 720,
              margin: '0 auto',
            }}
          >
            <NotetakerConnectCard />

            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary }}>
                Your classes
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: vmTokens.textSecondary, lineHeight: 1.5 }}>
                Add each study you lead. The VerseMate notetaker joins at the start time and records the class for
                your coaching, so keep the link, date and time current.
              </p>
            </div>

            {list.length === 0 && editing !== 'new' && (
              <CoachCard testId="coach-classes-empty">
                <p style={{ margin: 0, fontSize: 14, color: vmTokens.textSecondary }}>
                  No classes yet. Add your first class so your sessions get recorded and coached.
                </p>
              </CoachCard>
            )}

            {list.length > 0 && <SectionLabel>Registered classes</SectionLabel>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {list.map((cls) =>
                editing === cls.id ? (
                  <ClassForm
                    key={cls.id}
                    initial={classDraft(cls)}
                    busy={busy}
                    submitLabel="Save"
                    onCancel={() => setEditing(null)}
                    onSubmit={(input) => updateMutation.mutate({ id: cls.id, input })}
                  />
                ) : (
                  <ClassRow
                    key={cls.id}
                    cls={cls}
                    onEdit={() => setEditing(cls.id)}
                    onDelete={() => {
                      if (window.confirm(`Remove “${cls.name}”? This can’t be undone.`)) {
                        deleteMutation.mutate(cls.id);
                      }
                    }}
                    deleting={deleteMutation.isPending && deleteMutation.variables === cls.id}
                  />
                ),
              )}
            </div>

            {editing === 'new' ? (
              <ClassForm
                busy={busy}
                submitLabel="Add class"
                onCancel={() => setEditing(null)}
                onSubmit={(input) => createMutation.mutate(input)}
              />
            ) : (
              <button
                type="button"
                data-testid="coach-classes-add"
                onClick={() => setEditing('new')}
                style={{
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
                }}
              >
                <Plus size={17} strokeWidth={2} /> Add a class
              </button>
            )}
          </div>
        </CoachStateBoundary>
      </div>
    </div>
  );
}
