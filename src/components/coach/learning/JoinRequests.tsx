import { type CSSProperties, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dt } from '@/components/coach/dashboardTheme';
import { coachKeys } from '@/hooks/useCoach';
import { learningKeys, useJoinRequests } from '@/hooks/useCoachLearning';
import { type OpenRequest, learningAdmin, refusalOf } from '@/services/coachLearning';
import { Btn, Dialog, Field, LEARN, Notice, Row, Rows, day, formatDate, h2, input, inputError, muted, pct } from './ui';

const panel: CSSProperties = { background: dt.innerBg, border: `1px solid ${dt.cardBorder}`, borderRadius: 14, padding: 'clamp(16px, 3vw, 22px)' };

const STATE_WORDS: Record<string, string> = {
  approved: 'approved',
  declined: 'declined',
  'already-in-program': 'closed as already in the program',
};

type Outcome = { tone: 'gold' | 'green'; title: string; body: string };

export function JoinRequests() {
  const data = useJoinRequests();
  const [dialog, setDialog] = useState<{ kind: 'approve' | 'decline'; r: OpenRequest } | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  if (!data.data) return null;
  const items = data.data.requests;
  const done = (o: Outcome) => {
    setDialog(null);
    setOutcome(o);
  };
  return (
    <section aria-labelledby="learning-requests" data-testid="learning-requests" style={{ ...panel, marginTop: 28, display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <h2 id="learning-requests" style={h2}>
          Join requests <span className="nt20-num" style={{ color: dt.textMuted, fontSize: 18 }}>{items.length}</span>
        </h2>
        <Link to={LEARN.learners} style={{ fontSize: 13.5, fontWeight: 700, color: dt.goldHover, textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
          All learners →
        </Link>
      </div>
      <p style={muted}>
        {items.length
          ? 'People who completed the learning program and asked to join. Approving adds them with the invite form, which sends the usual invitation.'
          : 'No open requests. People who complete the learning program and ask to join appear here.'}
      </p>
      {outcome && <Notice tone={outcome.tone} title={outcome.title}>{outcome.body}</Notice>}
      {items.length > 0 && (
        <Rows>
          {items.map((r, i) => (
            <Row key={r.id} first={i === 0} style={{ alignItems: 'flex-start', background: dt.cardBg }}>
              <div style={{ flex: '1 1 260px', minWidth: 0, display: 'grid', gap: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{r.name || r.email}</span>
                <span style={{ fontSize: 13.5, color: dt.textMuted, overflowWrap: 'anywhere' }}>{r.email}</span>
                <span className="nt20-num" style={{ fontSize: 13, color: dt.body }}>
                  {r.completedAt ? `Completed ${formatDate(day(r.completedAt))}` : 'Not completed'} · best by module:{' '}
                  {r.scores.map((s, n) => `${n + 1}: ${s.bestScore === null ? 'not taken' : pct(s.bestScore)}`).join(', ')}
                </span>
                {r.note && <p style={{ margin: '6px 0 0', fontFamily: dt.serif, fontSize: 15.5, lineHeight: 1.55, color: dt.body, overflowWrap: 'anywhere' }}>“{r.note}”</p>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Btn label={`Approve ${r.name || r.email}`} onClick={() => setDialog({ kind: 'approve', r })}>Approve</Btn>
                <Btn kind="outline" label={`Decline ${r.name || r.email}`} onClick={() => setDialog({ kind: 'decline', r })}>Decline</Btn>
              </div>
            </Row>
          ))}
        </Rows>
      )}
      {dialog?.kind === 'approve' && <ApproveDialog r={dialog.r} onClose={() => setDialog(null)} onDone={done} />}
      {dialog?.kind === 'decline' && <DeclineDialog r={dialog.r} onClose={() => setDialog(null)} onDone={done} />}
    </section>
  );
}

function useAnswered() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: learningKeys.requests });
    qc.invalidateQueries({ queryKey: ['coach', 'admin', 'learning', 'learners'] });
    qc.invalidateQueries({ queryKey: coachKeys.adminCoaches });
  };
}

function noLongerOpen(r: OpenRequest, details: Record<string, unknown>): Outcome {
  return {
    tone: 'gold',
    title: `${r.name || r.email}'s request was already answered`,
    body: `It was ${STATE_WORDS[String(details.status)] ?? 'answered'} a moment ago. Nothing changed and no email was sent. The list below is current.`,
  };
}

function ApproveDialog({ r, onClose, onDone }: { r: OpenRequest; onClose: () => void; onDone: (o: Outcome) => void }) {
  const [name, setName] = useState(r.name);
  const [group, setGroup] = useState('');
  const [refusal, setRefusal] = useState<{ code?: string; message: string } | null>(null);
  const answered = useAnswered();
  const approve = useMutation({
    mutationFn: () => learningAdmin.approve(r.id, { email: r.email, name: name.trim() || undefined, group: group.trim() || undefined }),
    onSuccess: (res) => {
      answered();
      onDone(
        res.status === 'approved'
          ? { tone: 'green', title: `${name.trim() || r.email} added as a leader`, body: `The invitation went to ${r.email}. The request shows as approved to them.` }
          : { tone: 'gold', title: `${r.name || r.email} is already in the program`, body: 'That address already belongs to a leader, so no one new was added. The request is closed as already in the program and the learner sees that.' },
      );
    },
    onError: (err) => {
      const f = refusalOf(err);
      if (f.code === 'not-open') {
        answered();
        onDone(noLongerOpen(r, f.details));
        return;
      }
      if (f.code === 'address-changed') {
        answered();
        onDone({
          tone: 'gold',
          title: `Not added: ${r.name || r.email}'s address changed`,
          body: `The account now uses ${String(f.details.email ?? 'another address')}. No leader was added and the request stays open. Review it again in the list below.`,
        });
        return;
      }
      setRefusal(f);
    },
  });
  const unconfirmed = refusal?.code === 'address-unconfirmed';
  const nameRefused = refusal?.code === 'add-refused';
  return (
    <Dialog title="Add as a leader" onClose={onClose}>
      <p style={{ ...muted, margin: '0 0 18px' }}>The same form as inviting a leader, filled in from the request. {r.name || r.email} gets the usual invitation email.</p>
      {unconfirmed && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="rust" title="Not added: the address is not confirmed">
            This account now uses an address it has not confirmed. No leader was added and the request stays open. Try again once they confirm it, or decline.
          </Notice>
        </div>
      )}
      {refusal && !unconfirmed && !nameRefused && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="rust" title="Not added">{refusal.message}</Notice>
        </div>
      )}
      <div style={{ display: 'grid', gap: 14 }}>
        <Field label="Leader name" error={nameRefused ? `Not added: ${refusal.message}` : undefined}>
          <input value={name} onChange={(e) => setName(e.target.value)} style={nameRefused ? inputError : input} data-testid="learning-approve-name" />
        </Field>
        <Field label="Email" hint={unconfirmed ? 'Not confirmed yet. Approving works again once the learner confirms it.' : 'The address the account confirmed. It cannot be changed here.'}>
          <input value={r.email} readOnly style={{ ...input, background: dt.fill2, color: dt.textMuted }} />
        </Field>
        <Field label="Study / group (optional)">
          <input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="e.g. Men's Study" style={input} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
        {unconfirmed ? (
          <>
            <Btn onClick={onClose}>Close</Btn>
            <Btn kind="outline" disabled>Approve and send invite</Btn>
          </>
        ) : (
          <>
            <Btn onClick={() => approve.mutate()} disabled={approve.isPending}>Approve and send invite</Btn>
            <Btn kind="outline" onClick={onClose}>Cancel</Btn>
          </>
        )}
      </div>
    </Dialog>
  );
}

function DeclineDialog({ r, onClose, onDone }: { r: OpenRequest; onClose: () => void; onDone: (o: Outcome) => void }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const answered = useAnswered();
  const decline = useMutation({
    mutationFn: () => learningAdmin.decline(r.id, reason),
    onSuccess: () => {
      answered();
      onDone({ tone: 'gold', title: `${r.name || r.email}'s request was declined`, body: reason.trim() ? 'They see it as declined, with your reason.' : 'They see it as declined.' });
    },
    onError: (err) => {
      const f = refusalOf(err);
      if (f.code === 'not-open') {
        answered();
        onDone(noLongerOpen(r, f.details));
        return;
      }
      setError(f.message);
    },
  });
  return (
    <Dialog title={`Decline ${r.name || r.email}'s request`} onClose={onClose}>
      <p style={{ ...muted, margin: '0 0 18px' }}>They see the request as declined, with your reason if you give one, and can send a new request later. No email is sent.</p>
      {error && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="rust" title="Not declined">{error}</Notice>
        </div>
      )}
      <Field label="Reason (optional, shown to the learner)" count={`${reason.length} / 500`}>
        <textarea value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} rows={4} style={{ ...input, minHeight: 110, lineHeight: 1.5, resize: 'vertical' }} data-testid="learning-decline-reason" />
      </Field>
      <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
        <Btn kind="danger" onClick={() => decline.mutate()} disabled={decline.isPending}>Decline request</Btn>
        <Btn kind="outline" onClick={onClose}>Cancel</Btn>
      </div>
    </Dialog>
  );
}
