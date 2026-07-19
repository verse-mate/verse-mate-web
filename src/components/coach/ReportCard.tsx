/**
 * One coaching "feedback document" in the reports list. Collapsed it shows
 * date / session / status / score; expanded it reveals the 4-cluster
 * breakdown, big ideas, and a link to open the full document on Drive.
 */

import { useState } from 'react';
import { ChevronDown, ExternalLink, FileText } from 'lucide-react';
import { vmTokens } from '@/styles/themeStyles';
import { statusColor, type CoachReport } from '@/services/coachService';
import { CoachCard, StatusPill } from './CoachUi';

export default function ReportCard({ report }: { report: CoachReport }) {
  const [open, setOpen] = useState(false);
  const color = statusColor(report.status);

  return (
    <CoachCard testId={`coach-report-${report.id}`} style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
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
            width: 42,
            height: 42,
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            background: `color-mix(in srgb, ${color} 14%, transparent)`,
            color,
            flexShrink: 0,
          }}
        >
          <FileText size={20} strokeWidth={1.75} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: vmTokens.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {report.session}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: vmTokens.textTertiary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {report.dateLabel} · {report.topic}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: vmTokens.textPrimary, lineHeight: 1 }}>
            {Math.round(report.score)}
          </span>
          <StatusPill status={report.status} emoji={report.statusEmoji} size="sm" />
        </div>
        <ChevronDown
          size={18}
          style={{ color: vmTokens.textTertiary, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
        />
      </button>

      {open && (
        <div style={{ padding: '0 14px 16px', borderTop: `1px solid ${vmTokens.divider}` }}>
          <p style={metaLine}>
            {report.duration} · {report.attendees} attending · {report.newcomers} newcomer
            {report.newcomers === 1 ? '' : 's'}
          </p>

          <p style={sectionLabel}>Cluster breakdown</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {report.clusters.map((c) => {
              const pct = c.scorePct == null ? 0 : c.scorePct;
              return (
                <div key={c.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: vmTokens.textSecondary }}>{c.name}</span>
                    <span style={{ fontSize: 12, color: vmTokens.textTertiary }}>
                      {c.scorePct == null ? 'N/A' : `${c.scorePct}%`} · {c.contribution.toFixed(1)} pts
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: vmTokens.divider, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: vmTokens.gold, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {report.bigIdeas.length > 0 && (
            <>
              <p style={sectionLabel}>Big ideas</p>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {report.bigIdeas.map((b, i) => (
                  <li key={i} style={{ fontSize: 13, color: vmTokens.textSecondary, lineHeight: 1.4 }}>{b}</li>
                ))}
              </ul>
            </>
          )}

          {report.docUrl && (
            <a
              href={report.docUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 14,
                fontSize: 13,
                fontWeight: 600,
                color: vmTokens.gold,
                textDecoration: 'none',
              }}
            >
              Open full document <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}
    </CoachCard>
  );
}

const metaLine: React.CSSProperties = {
  fontSize: 12,
  color: vmTokens.textTertiary,
  margin: '12px 0 4px',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  color: vmTokens.textTertiary,
  margin: '14px 0 8px',
};
