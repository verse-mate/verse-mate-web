/**
 * Admin oversight roster (/coach for program admins). Lists every leader
 * with their latest score + status; tapping a row drills into that leader's
 * dashboard (/coach/leader/:id). Read-only — admins view feedback, they don't
 * edit a leader's meeting link.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ChevronRight, Plus, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import ScreenHeader from '@/components/ScreenHeader';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { vmTokens } from '@/styles/themeStyles';
import { useAddLeader, useAdminCoaches, coachState } from '@/hooks/useCoach';
import { CoachCard, CoachStateBoundary, SectionLabel, StatusPill } from '@/components/coach/CoachUi';
import CoachProfileAvatar from '@/components/coach/CoachProfileAvatar';
import { statusColor, type CoachSummary } from '@/services/coachService';

export default function CoachAdminScreen() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const coachesQuery = useAdminCoaches();
  const coaches = coachState(coachesQuery);
  const [addOpen, setAddOpen] = useState(false);

  const sorted = [...(coaches.data || [])].sort(byScoreDesc);
  const scored = sorted.filter((c) => c.latest);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader
        title="All leaders"
        onBack={() => navigate('/read')}
        backTestId="coach-admin-back-button"
        rightAction={<CoachProfileAvatar />}
      />

      <div
        data-testid="coach-admin"
        style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${vmTokens.divider}` }}
      >
        <CoachStateBoundary
          loading={coaches.loading}
          authError={coaches.authError}
          error={coaches.error}
          onRetry={() => coachesQuery.refetch()}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={20} style={{ color: vmTokens.gold }} strokeWidth={1.9} />
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary }}>Coaching oversight</h2>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: vmTokens.textTertiary }}>
                    {sorted.length} leader{sorted.length === 1 ? '' : 's'}
                    {scored.length ? ` · avg ${avgScore(scored)}` : ''}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/coach/monthly')}
                  data-testid="coach-admin-monthly"
                  style={secondaryBtn}
                >
                  <BarChart3 size={16} strokeWidth={2} /> Monthly summary
                </button>
                <button onClick={() => setAddOpen(true)} data-testid="coach-admin-add-leader" style={goldBtn}>
                  <Plus size={16} strokeWidth={2.2} /> Add leader
                </button>
              </div>
            </div>

            <div>
              <SectionLabel>Leaders</SectionLabel>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
                  gap: isDesktop ? 12 : 10,
                  alignItems: 'start',
                }}
              >
                {sorted.map((c) => (
                  <RosterRow key={c.id} coach={c} onOpen={() => navigate(`/coach/leader/${c.id}`)} />
                ))}
              </div>
            </div>
          </div>
        </CoachStateBoundary>
      </div>

      {addOpen && <AddLeaderModal onClose={() => setAddOpen(false)} />}
    </div>
  );
}

/** Add a leader by email (+ optional name/group). On success the backend sends
 *  an invite email and the roster refreshes. */
function AddLeaderModal({ onClose }: { onClose: () => void }) {
  const addLeader = useAddLeader();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');

  const submit = () => {
    const trimmed = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      toast.error('Enter a valid email address');
      return;
    }
    addLeader.mutate(
      { email: trimmed, name: name.trim() || undefined, group: group.trim() || undefined },
      {
        onSuccess: (coach) => {
          toast.success(`${coach.name} added — invite sent`);
          onClose();
        },
        onError: (err) => {
          const msg = /409|already/i.test(String(err?.message)) ? 'That email is already a leader' : 'Could not add the leader';
          toast.error(msg);
        },
      },
    );
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        zIndex: 60,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        data-testid="coach-add-leader-modal"
        style={{
          width: '100%',
          maxWidth: 440,
          background: vmTokens.commentaryBg,
          borderRadius: 16,
          border: `1px solid ${vmTokens.divider}`,
          padding: 22,
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: vmTokens.textPrimary }}>Add a leader</h3>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: vmTokens.textTertiary }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: 13.5, color: vmTokens.textTertiary, lineHeight: 1.5 }}>
          Enter the leader's email. They'll get an invite to the coaching portal and appear in your roster right away.
        </p>

        <Field label="Email *">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="leader@example.com"
            data-testid="coach-add-leader-email"
            style={fieldInput}
            autoFocus
          />
        </Field>
        <Field label="Name (optional)">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Derived from the email if left blank"
            data-testid="coach-add-leader-name"
            style={fieldInput}
          />
        </Field>
        <Field label="Group (optional)">
          <input
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            placeholder="e.g. Thursday Evening Study"
            data-testid="coach-add-leader-group"
            style={fieldInput}
          />
        </Field>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={secondaryBtn}>Cancel</button>
          <button
            onClick={submit}
            disabled={addLeader.isPending || !email.trim()}
            data-testid="coach-add-leader-submit"
            style={{ ...goldBtn, opacity: addLeader.isPending || !email.trim() ? 0.6 : 1 }}
          >
            {addLeader.isPending ? 'Adding…' : 'Add & invite'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: vmTokens.textSecondary, marginBottom: 5 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const fieldInput: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 9,
  border: `1px solid ${vmTokens.divider}`,
  background: vmTokens.surfaceRaisedBg,
  color: vmTokens.textPrimary,
  fontSize: 14.5,
  boxSizing: 'border-box',
};

const goldBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '9px 16px',
  borderRadius: 9,
  border: 'none',
  background: vmTokens.gold,
  color: '#1a1206',
  fontSize: 13.5,
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '9px 14px',
  borderRadius: 9,
  border: `1px solid ${vmTokens.divider}`,
  background: vmTokens.surfaceRaisedBg,
  color: vmTokens.textSecondary,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
};

function RosterRow({ coach, onOpen }: { coach: CoachSummary; onOpen: () => void }) {
  const color = coach.latest ? statusColor(coach.latest.status) : vmTokens.textTertiary;
  return (
    <CoachCard testId={`coach-roster-${coach.id}`} style={{ padding: 0 }}>
      <button
        onClick={onOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          padding: 14,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
            background: `color-mix(in srgb, ${color} 15%, transparent)`,
            color,
            fontWeight: 700,
            fontSize: 15,
            flexShrink: 0,
          }}
        >
          {initials(coach.name)}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: vmTokens.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {coach.name}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: vmTokens.textTertiary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {coach.group} · {coach.sessionCount} session{coach.sessionCount === 1 ? '' : 's'}
          </p>
        </div>
        {coach.latest ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: vmTokens.textPrimary, lineHeight: 1 }}>
              {Math.round(coach.latest.score)}
            </span>
            <StatusPill status={coach.latest.status} emoji={coach.latest.statusEmoji} size="sm" />
          </div>
        ) : (
          <span style={{ fontSize: 12, color: vmTokens.textTertiary, flexShrink: 0 }}>No sessions</span>
        )}
        <ChevronRight size={18} style={{ color: vmTokens.textTertiary, flexShrink: 0 }} />
      </button>
    </CoachCard>
  );
}

function byScoreDesc(a: CoachSummary, b: CoachSummary): number {
  const av = a.latest?.score ?? -1;
  const bv = b.latest?.score ?? -1;
  return bv - av;
}

function avgScore(scored: CoachSummary[]): string {
  const sum = scored.reduce((a, c) => a + (c.latest?.score ?? 0), 0);
  return (sum / scored.length).toFixed(1);
}

function initials(name: string): string {
  const parts = (name || '').trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}
