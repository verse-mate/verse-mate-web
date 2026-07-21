/**
 * Recording link + coaching notes for a single session. Shared by the full
 * <ReportDetail> and the compact <ReportCard> so both the admin drill-in and
 * the leader's own dashboard render the same block.
 *
 * - Admins (given `coachId`) get an inline recording-URL editor and a note
 *   composer that persists the note and emails it to the leader.
 * - Leaders see the recording link and note history read-only.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Send, Video } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';
import type { CoachNote, CoachReport } from '@/services/coachService';
import { useAddNote, useSetRecordingLink } from '@/hooks/useCoach';

const BLUE = '#2563A6';
const BODY = 'color-mix(in srgb, var(--fg-secondary) 42%, var(--fg-primary))';

export default function SessionNotes({
  report,
  admin = false,
  coachId,
  leaderName = '',
  compact = false,
}: {
  report: CoachReport;
  /** When true (admin drill-in) the recording + notes are editable. */
  admin?: boolean;
  /** The leader whose report this is — required for admin edits. */
  coachId?: string;
  leaderName?: string;
  /** Tighter type sizing for the compact card. */
  compact?: boolean;
}) {
  const editable = admin && !!coachId;
  const recording = report.recordingUrl?.trim() || '';
  const notes = report.notes ?? [];

  // Nothing to show for a leader with no recording and no notes.
  if (!editable && !recording && notes.length === 0) return null;

  return (
    <section
      data-testid={`coach-session-notes-${report.id}`}
      style={{
        marginTop: compact ? 14 : 22,
        paddingTop: compact ? 12 : 14,
        borderTop: `1px solid ${vmTokens.divider}`,
      }}
    >
      <p style={{ margin: '0 0 10px', ...labelStyle(compact) }}>Recording &amp; coaching notes</p>
      <RecordingRow report={report} editable={editable} coachId={coachId} recording={recording} />
      <NotesPanel
        report={report}
        editable={editable}
        coachId={coachId}
        notes={notes}
        leaderName={leaderName}
        compact={compact}
      />
    </section>
  );
}

function RecordingRow({
  report,
  editable,
  coachId,
  recording,
}: {
  report: CoachReport;
  editable: boolean;
  coachId?: string;
  recording: string;
}) {
  const setLink = useSetRecordingLink(coachId ?? '');
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(recording);

  const save = () => {
    const url = value.trim();
    if (url && !/^https?:\/\/\S+$/i.test(url)) {
      toast.error('Enter a valid http(s) link');
      return;
    }
    setLink.mutate(
      { reportId: report.id, recordingUrl: url },
      {
        onSuccess: () => {
          setEditing(false);
          toast.success(url ? 'Recording link saved' : 'Recording link cleared');
        },
        onError: () => toast.error('Could not save the recording link'),
      },
    );
  };

  if (!editable) {
    if (!recording) return null;
    return (
      <a href={recording} target="_blank" rel="noopener noreferrer" style={recordingLinkStyle}>
        <Video size={16} strokeWidth={2} /> Watch the recording
      </a>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {editing ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://… (Zoom / Fireflies / Drive)"
            data-testid={`coach-recording-input-${report.id}`}
            style={inputStyle}
          />
          <button
            onClick={save}
            disabled={setLink.isPending}
            style={primaryBtn}
            data-testid={`coach-recording-save-${report.id}`}
          >
            {setLink.isPending ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setValue(recording);
            }}
            style={ghostBtn}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {recording ? (
            <a href={recording} target="_blank" rel="noopener noreferrer" style={recordingLinkStyle}>
              <Video size={16} strokeWidth={2} /> Watch the recording
            </a>
          ) : (
            <span style={{ fontSize: 14, color: vmTokens.textTertiary }}>No recording link yet</span>
          )}
          <button
            onClick={() => setEditing(true)}
            style={ghostBtn}
            data-testid={`coach-recording-edit-${report.id}`}
          >
            {recording ? 'Edit link' : 'Add link'}
          </button>
        </div>
      )}
    </div>
  );
}

function NotesPanel({
  report,
  editable,
  coachId,
  notes,
  leaderName,
  compact,
}: {
  report: CoachReport;
  editable: boolean;
  coachId?: string;
  notes: CoachNote[];
  leaderName?: string;
  compact?: boolean;
}) {
  const addNote = useAddNote(coachId ?? '');
  const [body, setBody] = useState('');

  const send = () => {
    const text = body.trim();
    if (!text) return;
    addNote.mutate(
      { reportId: report.id, body: text },
      {
        onSuccess: () => {
          setBody('');
          toast.success(`Note sent to ${leaderName || 'the leader'}`);
        },
        onError: () => toast.error('Could not send the note'),
      },
    );
  };

  const fontSize = compact ? 13 : 15;

  return (
    <div>
      {notes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: editable ? 16 : 0 }}>
          {notes.map((n) => (
            <div key={n.id} style={noteCardStyle} data-testid={`coach-note-${n.id}`}>
              {n.body.split(/\n{2,}/).map((para, j) => (
                <p key={j} style={{ margin: j === 0 ? 0 : '6px 0 0', fontSize, color: BODY, lineHeight: 1.6 }}>
                  {para}
                </p>
              ))}
              <p style={{ margin: '6px 0 0', fontSize: 12, color: vmTokens.textTertiary }}>
                {formatNoteDate(n.createdAt)}
                {n.emailed ? ' · emailed to leader ✓' : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      {editable && (
        <div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`Write a note to ${leaderName || 'this leader'} — it's saved here and emailed to them.`}
            data-testid={`coach-note-input-${report.id}`}
            rows={3}
            style={textareaStyle}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              onClick={send}
              disabled={addNote.isPending || !body.trim()}
              data-testid={`coach-note-send-${report.id}`}
              style={{ ...primaryBtn, opacity: addNote.isPending || !body.trim() ? 0.6 : 1 }}
            >
              <Send size={15} strokeWidth={2} /> {addNote.isPending ? 'Sending…' : 'Send to leader'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatNoteDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function labelStyle(compact: boolean): React.CSSProperties {
  return {
    fontSize: compact ? 11 : 13,
    fontWeight: 700,
    letterSpacing: compact ? 0.4 : 0.2,
    textTransform: compact ? 'uppercase' : 'none',
    color: compact ? vmTokens.textTertiary : vmTokens.textPrimary,
  };
}

const noteCardStyle: React.CSSProperties = {
  borderLeft: `3px solid ${BLUE}`,
  padding: '12px 15px',
  borderRadius: 8,
  background: 'color-mix(in srgb, var(--vm-dust) 5%, transparent)',
};

const recordingLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  padding: '8px 14px',
  borderRadius: 9,
  border: `1px solid ${BLUE}`,
  background: `color-mix(in srgb, ${BLUE} 8%, transparent)`,
  color: BLUE,
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 220,
  padding: '9px 12px',
  borderRadius: 9,
  border: `1px solid ${vmTokens.divider}`,
  background: vmTokens.surfaceRaisedBg,
  color: vmTokens.textPrimary,
  fontSize: 14,
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: `1px solid ${vmTokens.divider}`,
  background: vmTokens.surfaceRaisedBg,
  color: vmTokens.textPrimary,
  fontSize: 14.5,
  lineHeight: 1.5,
  resize: 'vertical',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const primaryBtn: React.CSSProperties = {
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

const ghostBtn: React.CSSProperties = {
  padding: '8px 13px',
  borderRadius: 9,
  border: `1px solid ${vmTokens.divider}`,
  background: 'transparent',
  color: vmTokens.textSecondary,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};
