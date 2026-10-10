import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { coachKeys, useAdminCoaches } from '@/hooks/useCoach';
import { dismissDuplicate, fetchLikelyDuplicates, refusalText, scoreDuplicateInstead, type LikelyDuplicate } from '@/services/coachService';
import { dt } from './dashboardTheme';
import { actionBtn as btn, h2, note, row, table } from './adminStyles';
import { QueryState } from './PipelineHealth';

function whatItIs(d: LikelyDuplicate): string {
  if (d.against === 'host-report') return 'An upload for a date the old system already reported';
  return d.source === 'bot' ? "The recording bot's session, after an upload for the same class and date" : 'An upload for a class and date already uploaded';
}

export default function LikelyDuplicates() {
  const duplicates = useQuery({ queryKey: coachKeys.duplicates, queryFn: fetchLikelyDuplicates, retry: false });
  const roster = useAdminCoaches();
  const nameOf = (id: string | null) => (id ? roster.data?.find((l) => l.id === id)?.name ?? id : 'No leader yet');

  return (
    <div style={{ paddingTop: 22 }} data-testid="coach-duplicates">
      <h2 style={h2}>Likely duplicates</h2>
      <p style={{ fontSize: 15, color: dt.textMuted, margin: '0 0 20px' }}>
        Sessions held because another recording covers the same class and date. Dismiss one that is a different session, or
        score the recording bot's session instead of the upload while the upload's report is not delivered yet.
      </p>
      <QueryState query={duplicates} name="duplicates" label="the likely duplicates">
        {(list) =>
          list.length === 0 ? (
            <div data-testid="coach-duplicates-empty" style={note}>
              No likely duplicate is waiting.
            </div>
          ) : (
            <div style={table}>
              {list.map((d) => (
                <DuplicateRow key={d.sourceSessionId} d={d} leader={nameOf(d.coachId)} />
              ))}
            </div>
          )
        }
      </QueryState>
    </div>
  );
}

function DuplicateRow({ d, leader }: { d: LikelyDuplicate; leader: string }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const done = {
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: coachKeys.duplicates });
    },
    onError: (err: Error) => setError(refusalText(err)),
  };
  const dismiss = useMutation({ mutationFn: () => dismissDuplicate(d.sourceSessionId), ...done });
  const score = useMutation({ mutationFn: () => scoreDuplicateInstead(d.sourceSessionId), ...done });
  const busy = dismiss.isPending || score.isPending;

  return (
    <div data-testid={`coach-duplicate-${d.sourceSessionId}`} style={row}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>
          {leader} · {d.sessionDate} · {d.title}
        </div>
        <div style={{ fontSize: 13, color: dt.textMuted }}>{whatItIs(d)}</div>
        {error && (
          <div role="alert" data-testid={`coach-duplicate-error-${d.sourceSessionId}`} style={{ fontSize: 13, color: dt.rust }}>
            {error}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" data-testid={`coach-duplicate-dismiss-${d.sourceSessionId}`} onClick={() => dismiss.mutate()} disabled={busy} style={btn}>
          Not a duplicate
        </button>
        {d.canScoreInstead && (
          <button type="button" data-testid={`coach-duplicate-score-${d.sourceSessionId}`} onClick={() => score.mutate()} disabled={busy} style={btn}>
            Score this one instead
          </button>
        )}
      </div>
    </div>
  );
}
