import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ScreenHeader from '@/components/ScreenHeader';
import { vmTokens } from '@/styles/themeStyles';
import { coachKeys, coachState, useAdminCoaches, useCoachMe } from '@/hooks/useCoach';
import { CoachCard, CoachStateBoundary, SectionLabel } from '@/components/coach/CoachUi';
import {
  completeUpload,
  fetchUploadClasses,
  fetchUploads,
  refreshUploadParts,
  refusalText,
  requestUpload,
  type UploadStatus,
  type UploadView,
} from '@/services/coachService';
import { LIMITS_TEXT, UPLOAD_LIMITS, chicagoToday, sendParts, uploadContentType, uploadProblem } from '@/services/coachUpload';

const STATUS_WORDS: Record<UploadStatus, string> = {
  uploading: 'Upload not finished: try again to send the file',
  processing: 'Processing: the report is being prepared, no score yet',
  held: 'Held for review before it is sent',
  'waiting-for-admin': 'Waiting for an admin to say who led this session',
  'attributed-elsewhere': 'Attributed to another leader of the class',
  ready: 'Report ready',
  failed: 'Failed',
};

const IN_PROGRESS: UploadStatus[] = ['uploading', 'processing'];

function daysBefore(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10);
}

type Sending = { phase: 'idle' } | { phase: 'sending'; sent: number; total: number } | { phase: 'finishing' };

export default function CoachUploadScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const meQuery = useCoachMe();
  const me = coachState(meQuery);
  const isAdmin = me.data?.isAdmin === true;
  const coaches = useAdminCoaches({ enabled: isAdmin });
  const [leader, setLeader] = useState('');
  const coachId = isAdmin ? leader || null : null;
  const ready = me.data !== undefined && (!isAdmin || coachId !== null);

  const classesQuery = useQuery({
    queryKey: coachKeys.uploadClasses(coachId),
    queryFn: () => fetchUploadClasses(coachId),
    enabled: ready,
    retry: false,
  });
  const uploadsQuery = useQuery({
    queryKey: coachKeys.uploads(isAdmin, coachId),
    queryFn: () => fetchUploads(isAdmin, coachId),
    enabled: me.data !== undefined,
    retry: false,
    refetchInterval: (q) => (q.state.data?.some((u) => IN_PROGRESS.includes(u.status)) ? 30_000 : false),
  });

  const today = chicagoToday();
  const [classKey, setClassKey] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [replace, setReplace] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [sending, setSending] = useState<Sending>({ phase: 'idle' });
  const [sentStatus, setSentStatus] = useState<UploadStatus | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const formTop = useRef<HTMLDivElement>(null);

  const classes = classesQuery.data ?? [];
  const chosenClass = classes.some((c) => c.key === classKey) ? classKey : classes.length === 1 ? classes[0].key : '';

  const retry = (u: UploadView) => {
    if (isAdmin) setLeader(u.coachId);
    setClassKey(u.classKey);
    setSessionDate(u.sessionDate);
    setTitle(u.title ?? '');
    setFile(null);
    if (fileInput.current) fileInput.current.value = '';
    setProblem(null);
    setSentStatus(null);
    formTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = async () => {
    setSentStatus(null);
    const found = !chosenClass ? 'Choose the class this session belongs to.' : uploadProblem({ file, sessionDate, title }, today);
    setProblem(found);
    if (found || !file) return;
    const trimmed = title.trim() || null;
    const body = { classKey: chosenClass, sessionDate, title: trimmed, fileName: file.name, fileBytes: file.size, contentType: uploadContentType(file) };
    try {
      setSending({ phase: 'sending', sent: 0, total: file.size });
      const parts = await requestUpload(coachId ? { ...body, coachId, replace } : body);
      await sendParts(
        file,
        parts,
        (sent) => setSending({ phase: 'sending', sent, total: file.size }),
        undefined,
        () => refreshUploadParts(parts.uploadId, isAdmin),
      );
      setSending({ phase: 'finishing' });
      const done = await completeUpload(parts.uploadId, isAdmin);
      setSentStatus(done.status);
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
      setTitle('');
      setReplace(false);
    } catch (err) {
      setProblem(err instanceof Error && !('status' in err) ? `The upload failed: ${err.message}. Try again.` : refusalText(err));
    } finally {
      setSending({ phase: 'idle' });
      queryClient.invalidateQueries({ queryKey: coachKeys.uploads(isAdmin, coachId) });
    }
  };

  const busy = sending.phase !== 'idle';
  const percent = sending.phase === 'sending' && sending.total > 0 ? Math.floor((sending.sent / sending.total) * 100) : 100;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title="Upload a session" onBack={() => navigate('/coach')} backTestId="coach-upload-back-button" />
      <div data-testid="coach-upload" style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${vmTokens.divider}` }}>
        <CoachStateBoundary
          loading={me.loading}
          authError={me.authError}
          error={me.error}
          onRetry={() => meQuery.refetch()}
        >
          <div ref={formTop} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, maxWidth: 720, margin: '0 auto' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: vmTokens.textPrimary }}>Upload a session video</h2>
              <p data-testid="coach-upload-limits" style={{ margin: '6px 0 0', fontSize: 13, color: vmTokens.textSecondary, lineHeight: 1.5 }}>
                {LIMITS_TEXT}
              </p>
            </div>

            <CoachCard testId="coach-upload-form">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {isAdmin && (
                  <Field label="Leader">
                    <select
                      data-testid="coach-upload-leader"
                      value={leader}
                      onChange={(e) => {
                        setLeader(e.target.value);
                        setClassKey('');
                      }}
                      style={inputStyle}
                      disabled={busy}
                    >
                      <option value="">Choose a leader</option>
                      {(coaches.data ?? []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                <Field label="Class">
                  <select
                    data-testid="coach-upload-class"
                    value={chosenClass}
                    onChange={(e) => setClassKey(e.target.value)}
                    style={inputStyle}
                    disabled={busy || !ready}
                  >
                    <option value="">{classesQuery.isError ? 'Could not load the classes' : 'Choose a class'}</option>
                    {classes.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.kind === 'rotating' ? `${c.name} (rotating class)` : c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Field label="Session date" style={{ flex: '1 1 180px' }}>
                    <input
                      data-testid="coach-upload-date"
                      type="date"
                      value={sessionDate}
                      min={daysBefore(today, UPLOAD_LIMITS.maxDaysBack)}
                      max={today}
                      onChange={(e) => setSessionDate(e.target.value)}
                      style={inputStyle}
                      disabled={busy}
                    />
                  </Field>
                  <Field label={`Title (optional, up to ${UPLOAD_LIMITS.titleChars} characters)`} style={{ flex: '2 1 240px' }}>
                    <input
                      data-testid="coach-upload-title"
                      value={title}
                      maxLength={UPLOAD_LIMITS.titleChars}
                      onChange={(e) => setTitle(e.target.value)}
                      style={inputStyle}
                      disabled={busy}
                    />
                  </Field>
                </div>
                <Field label="Video file">
                  <input
                    ref={fileInput}
                    data-testid="coach-upload-file"
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm,video/x-matroska,.mp4,.mov,.webm,.mkv"
                    onChange={(e) => {
                      const chosen = e.target.files?.[0] ?? null;
                      setFile(chosen);
                      setSentStatus(null);
                      setProblem(chosen ? uploadProblem({ file: chosen, sessionDate: sessionDate || today, title }, today) : null);
                    }}
                    disabled={busy}
                    style={{ fontSize: 14, color: vmTokens.textPrimary }}
                  />
                </Field>
                {isAdmin && (
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: vmTokens.textSecondary }}>
                    <input data-testid="coach-upload-replace" type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} disabled={busy} />
                    Replace the upload already made for this class and date, if its report was not delivered yet
                  </label>
                )}
                {problem && (
                  <p role="alert" data-testid="coach-upload-problem" style={{ margin: 0, fontSize: 13, color: vmTokens.statusError }}>
                    {problem}
                  </p>
                )}
                {busy && (
                  <div>
                    <div
                      data-testid="coach-upload-progress"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={percent}
                      style={{ height: 8, borderRadius: 4, background: vmTokens.divider, overflow: 'hidden' }}
                    >
                      <div style={{ width: `${percent}%`, height: '100%', background: vmTokens.gold }} />
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: vmTokens.textSecondary }}>
                      {sending.phase === 'finishing' ? 'Checking the upload…' : `Uploading: ${percent}%. Keep this page open until it finishes.`}
                    </p>
                  </div>
                )}
                {sentStatus && (
                  <p data-testid="coach-upload-sent" style={{ margin: 0, fontSize: 13, color: vmTokens.textPrimary }}>
                    Uploaded. {STATUS_WORDS[sentStatus]}.
                  </p>
                )}
                <button
                  type="button"
                  data-testid="coach-upload-submit"
                  onClick={submit}
                  disabled={busy || !ready}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: 'none',
                    background: vmTokens.gold,
                    color: vmTokens.goldOnLight,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: busy || !ready ? 'default' : 'pointer',
                    opacity: busy || !ready ? 0.6 : 1,
                  }}
                >
                  Upload
                </button>
              </div>
            </CoachCard>

            <SectionLabel>Past uploads</SectionLabel>
            <div data-testid="coach-upload-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {uploadsQuery.isError && <p style={mutedText}>Could not load past uploads.</p>}
              {uploadsQuery.data?.length === 0 && <p style={mutedText}>No uploads yet.</p>}
              {(uploadsQuery.data ?? []).map((u) => (
                <UploadRow key={u.id} upload={u} admin={isAdmin} onRetry={() => retry(u)} />
              ))}
            </div>
          </div>
        </CoachStateBoundary>
      </div>
    </div>
  );
}

function UploadRow({ upload, admin, onRetry }: { upload: UploadView; admin: boolean; onRetry: () => void }) {
  const reportPath = admin ? `/coach/leader/${encodeURIComponent(upload.coachId)}?s=${encodeURIComponent(upload.reportId ?? '')}` : `/coach?s=${encodeURIComponent(upload.reportId ?? '')}`;
  return (
    <CoachCard testId="coach-upload-row" style={{ padding: 12 }}>
      <div data-status={upload.status} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: vmTokens.textPrimary }}>
          {upload.className} · {upload.sessionDate}
          {upload.title ? ` · ${upload.title}` : ''}
        </div>
        <div data-testid="coach-upload-status" style={{ fontSize: 13, color: upload.status === 'failed' ? vmTokens.statusError : vmTokens.textSecondary }}>
          {STATUS_WORDS[upload.status]}
          {upload.status === 'failed' && upload.reason ? `: ${upload.reason}` : ''}
        </div>
        {upload.status === 'ready' && upload.reportId && (
          <Link data-testid="coach-upload-report-link" to={reportPath} style={{ fontSize: 13, color: vmTokens.gold, fontWeight: 600 }}>
            Open the report
          </Link>
        )}
        {(upload.status === 'failed' || upload.status === 'uploading') && (
          <button type="button" data-testid="coach-upload-retry" onClick={onRetry} style={retryStyle}>
            Try again
          </button>
        )}
      </div>
    </CoachCard>
  );
}

function Field({ label, children, style }: { label: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: vmTokens.textSecondary }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: `1px solid ${vmTokens.inputBorder}`,
  background: vmTokens.inputBg,
  color: vmTokens.textPrimary,
  fontSize: 14,
  outline: 'none',
};

const mutedText: CSSProperties = { margin: 0, fontSize: 13, color: vmTokens.textSecondary };

const retryStyle: CSSProperties = {
  alignSelf: 'flex-start',
  padding: '7px 12px',
  borderRadius: 10,
  border: `1px solid ${vmTokens.divider}`,
  background: 'transparent',
  color: vmTokens.textPrimary,
  fontSize: 13,
  cursor: 'pointer',
};
