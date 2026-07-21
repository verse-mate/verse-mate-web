/**
 * Coach Settings (/coach/settings) — the coach-specific settings reached by
 * tapping the profile avatar in the portal header.
 *
 * Unlike the app-wide Settings screen (/menu/settings), this page is scoped to
 * the coaching relationship: edit your name + email, set your church
 * affiliation, and choose your Bible coach. It deliberately omits the
 * VerseMate reading preferences (Bible version, language, font size, verse
 * insights) — those live on the app Settings screen, linked at the bottom.
 *
 * Back returns to the coach dashboard (/coach), not the app menu — fixing the
 * old bug where leaving settings dropped the leader on the Menu overlay.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowUpRight, Check, GraduationCap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ScreenHeader from '@/components/ScreenHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CoachCard, CoachStateBoundary, SectionLabel } from '@/components/coach/CoachUi';
import AffiliatedChurchCard from '@/components/coach/AffiliatedChurchCard';
import { useApp } from '@/contexts/AppContext';
import { useCoachMe, coachKeys, coachState } from '@/hooks/useCoach';
import { ApiError } from '@/services/api';
import {
  BIBLE_COACHES,
  DEFAULT_BIBLE_COACH,
  saveCoachBibleCoach,
} from '@/services/coachService';
import { updateAuthProfile } from '@/services/bibleService';
import {
  fieldGroupStyle,
  inputLabelStyle,
  textInputStyle,
  vmTokens,
} from '@/styles/themeStyles';

export default function CoachSettingsScreen() {
  const navigate = useNavigate();
  const meQuery = useCoachMe();
  const me = coachState(meQuery);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader
        title="Coach Settings"
        onBack={() => navigate('/coach')}
        backTestId="coach-settings-back-button"
      />

      <div
        data-testid="coach-settings"
        style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${vmTokens.divider}` }}
      >
        <CoachStateBoundary
          loading={me.loading}
          authError={me.authError}
          error={me.error}
          onRetry={() => meQuery.refetch()}
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
            <ProfileSection />

            {/* Church affiliation + Bible coach — available to any portal
                member (coachee or admin), so program admins can set their own
                church + coach too. Past the boundary, me.data is always a
                portal member. */}
            {me.data && (
              <>
                <div>
                  <SectionLabel>Church affiliation</SectionLabel>
                  <AffiliatedChurchCard initialChurch={me.data.affiliatedChurch} />
                </div>
                <div>
                  <SectionLabel>Bible coach</SectionLabel>
                  <BibleCoachCard initialCoach={me.data.bibleCoach} />
                </div>
              </>
            )}

            {/* Bridge to the app-wide reading preferences we intentionally
                leave off this page. */}
            <button
              type="button"
              onClick={() => navigate('/menu/settings')}
              data-testid="coach-settings-app-settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '14px 16px',
                borderRadius: 12,
                border: `1px solid ${vmTokens.divider}`,
                background: vmTokens.surfaceRaisedBg,
                color: vmTokens.textPrimary,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                VerseMate app settings
                <span style={{ display: 'block', fontSize: 12, fontWeight: 400, color: vmTokens.textTertiary, marginTop: 2 }}>
                  Bible version, language, font size, theme
                </span>
              </span>
              <ArrowUpRight size={16} style={{ color: vmTokens.textTertiary }} />
            </button>
          </div>
        </CoachStateBoundary>
      </div>
    </div>
  );
}

// ─── Profile (name + email), auto-saved ──────────────────────────────────────

function ProfileSection() {
  const { state, restoreSession } = useApp();
  const userFirstName = state.userFirstName;
  const userLastName = state.userLastName;
  const userEmail = state.userEmail;
  const userAvatarUrl = state.userAvatarUrl;

  const [firstName, setFirstName] = useState(userFirstName || '');
  const [lastName, setLastName] = useState(userLastName || '');
  const [email, setEmail] = useState(userEmail || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const errorClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync fields when the user record changes (e.g. after restoreSession).
  useEffect(() => {
    setFirstName(userFirstName || '');
    setLastName(userLastName || '');
    setEmail(userEmail || '');
  }, [userFirstName, userLastName, userEmail]);

  const initials = useMemo(() => {
    const f = (userFirstName || firstName || '').trim();
    const l = (userLastName || lastName || '').trim();
    const a = f ? f[0]! : '';
    const b = l ? l[0]! : '';
    return (a + b || (userEmail || '?')[0]!).toUpperCase();
  }, [userFirstName, userLastName, firstName, lastName, userEmail]);

  const hasChanges =
    firstName !== (userFirstName || '') ||
    lastName !== (userLastName || '') ||
    email !== (userEmail || '');

  const saveProfile = useCallback(async () => {
    const changed =
      firstName !== (userFirstName || '') ||
      lastName !== (userLastName || '') ||
      email !== (userEmail || '');
    if (!changed) return;

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setGlobalError('All fields are required.');
      setSaveStatus('error');
      if (errorClearTimeoutRef.current) clearTimeout(errorClearTimeoutRef.current);
      errorClearTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
        setGlobalError(null);
      }, 5000);
      return;
    }

    setGlobalError(null);
    setSaveStatus('saving');
    if (errorClearTimeoutRef.current) clearTimeout(errorClearTimeoutRef.current);

    try {
      await updateAuthProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
      await restoreSession();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: unknown) {
      let errorMessage = 'An error occurred while saving your changes.';
      const apiErr = err instanceof ApiError ? err : null;
      const body =
        apiErr && typeof apiErr.body === 'object' && apiErr.body !== null
          ? (apiErr.body as { value?: { message?: string } | string; message?: string })
          : null;
      if (body?.value && typeof body.value === 'object' && body.value.message === 'EMAIL_ALREADY_EXISTS') {
        errorMessage = 'This email address is already in use by another account.';
      } else if (body?.message === 'EMAIL_ALREADY_EXISTS') {
        errorMessage = 'This email address is already in use by another account.';
      } else if (body?.value && typeof body.value === 'string') {
        errorMessage = body.value;
      }
      setGlobalError(errorMessage);
      setSaveStatus('error');
      if (errorClearTimeoutRef.current) clearTimeout(errorClearTimeoutRef.current);
      errorClearTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
        setGlobalError(null);
      }, 5000);
    }
  }, [firstName, lastName, email, userFirstName, userLastName, userEmail, restoreSession]);

  // Auto-save 1s after the last edit.
  useEffect(() => {
    if (!hasChanges) return;
    const timer = setTimeout(() => saveProfile(), 1000);
    return () => clearTimeout(timer);
  }, [hasChanges, saveProfile]);

  if (!state.isSignedIn) return null;

  return (
    <div>
      <SectionLabel>Profile</SectionLabel>
      <CoachCard testId="coach-settings-profile">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <Avatar className="h-12 w-12">
            {userAvatarUrl ? <AvatarImage src={userAvatarUrl} alt="Profile picture" /> : null}
            <AvatarFallback className="bg-[#1B1B1B] text-white">{initials}</AvatarFallback>
          </Avatar>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: vmTokens.textPrimary }}>Profile details</span>
            {saveStatus === 'saving' && <Loader2 size={16} color={vmTokens.textSecondary} className="animate-spin" />}
            {saveStatus === 'saved' && <Check size={18} color={vmTokens.statusSuccess} />}
            {saveStatus === 'error' && <AlertCircle size={18} color={vmTokens.statusError} />}
          </div>
        </div>

        {saveStatus === 'error' && globalError && (
          <p style={{ margin: '0 0 10px', fontSize: 12.5, color: vmTokens.statusError }}>{globalError}</p>
        )}

        <div style={fieldGroupStyle}>
          <label style={inputLabelStyle} htmlFor="coach-settings-first-name">First Name</label>
          <input
            id="coach-settings-first-name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            data-testid="coach-settings-first-name-input"
            style={textInputStyle}
          />
        </div>
        <div style={fieldGroupStyle}>
          <label style={inputLabelStyle} htmlFor="coach-settings-last-name">Last Name</label>
          <input
            id="coach-settings-last-name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            data-testid="coach-settings-last-name-input"
            style={textInputStyle}
          />
        </div>
        <div style={fieldGroupStyle}>
          <label style={inputLabelStyle} htmlFor="coach-settings-email">Email</label>
          <input
            id="coach-settings-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoCapitalize="none"
            data-testid="coach-settings-email-input"
            style={textInputStyle}
          />
        </div>
      </CoachCard>
    </div>
  );
}

// ─── Bible coach selector ─────────────────────────────────────────────────────

function BibleCoachCard({ initialCoach }: { initialCoach: string }) {
  const queryClient = useQueryClient();
  const initial = initialCoach || DEFAULT_BIBLE_COACH;
  const [value, setValue] = useState(initial);

  useEffect(() => setValue(initialCoach || DEFAULT_BIBLE_COACH), [initialCoach]);

  const mutation = useMutation({
    mutationFn: (coach: string) => saveCoachBibleCoach(coach),
    onSuccess: (saved) => {
      setValue(saved || DEFAULT_BIBLE_COACH);
      queryClient.setQueryData(coachKeys.me, (prev: unknown) =>
        prev && typeof prev === 'object' ? { ...prev, bibleCoach: saved } : prev,
      );
      toast.success('Bible coach saved');
    },
    onError: () => toast.error('Could not save — try again'),
  });

  return (
    <CoachCard testId="coach-bible-coach-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <GraduationCap size={18} style={{ color: vmTokens.gold }} strokeWidth={1.75} />
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: vmTokens.textPrimary }}>Your Bible coach</h3>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 12.5, color: vmTokens.textSecondary, lineHeight: 1.45 }}>
        The coach who reviews your sessions and writes your feedback.
      </p>

      <select
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          mutation.mutate(next);
        }}
        disabled={mutation.isPending}
        data-testid="coach-bible-coach-select"
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          border: `1px solid ${vmTokens.inputBorder}`,
          background: vmTokens.inputBg,
          color: vmTokens.textPrimary,
          fontSize: 14,
          outline: 'none',
        }}
      >
        {BIBLE_COACHES.map((coach) => (
          <option key={coach} value={coach}>
            {coach}
          </option>
        ))}
      </select>
    </CoachCard>
  );
}
