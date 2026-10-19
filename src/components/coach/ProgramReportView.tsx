import type { CSSProperties, ReactNode } from 'react';
import { vmTokens } from '@/styles/themeStyles';
import { CoachCard, SectionLabel } from '@/components/coach/CoachUi';
import type { ProgramReport } from '@/services/coachService';

const MARK_BG: Record<string, string> = {
  strong: `color-mix(in srgb, ${vmTokens.statusSuccess} 28%, transparent)`,
  middle: 'color-mix(in srgb, var(--vm-dust) 22%, transparent)',
  weak: `color-mix(in srgb, ${vmTokens.statusError} 28%, transparent)`,
};

const MARK_WORD: Record<string, string> = { strong: 'strong', middle: 'middle', weak: 'weak' };

function signed(n: number): string {
  return `${n > 0 ? '+' : ''}${n}`;
}

export default function ProgramReportView({ report, padding }: { report: ProgramReport; padding: number }) {
  const t = report.trends;
  const names = new Map([...report.leaderboard, ...report.heatMap.rows].map((l) => [l.id, l.name]));
  const named = (ids: string[]) => ids.map((id) => names.get(id) ?? id);
  const facts = [
    t.priorAvg !== null ? `Last month's average: ${t.priorAvg}` : null,
    t.allTimeAvg !== null ? `All-time average: ${t.allTimeAvg}` : null,
    t.bestImproving ? `Most improved leader: ${t.bestImproving.name} (${signed(t.bestImproving.delta)})` : null,
    t.mostImprovedDimension ? `Most improved dimension: ${t.mostImprovedDimension.name} (${signed(t.mostImprovedDimension.delta)})` : null,
    t.needsAttention ? `Needs attention: ${t.needsAttention.name} (${t.needsAttention.avg})` : null,
  ].filter((f): f is string => f !== null);

  return (
    <div data-testid="coach-program-report" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Block title="Executive summary" padding={padding} testId="coach-program-summary">
        <p style={muted}>
          {report.overview.sessions} sessions from {report.overview.leaders} leaders, {report.overview.from} to {report.overview.to}.
        </p>
        {report.executiveSummary.map((p) => (
          <p key={p} style={para}>
            {p}
          </p>
        ))}
      </Block>

      <Block title="Leaderboard" padding={padding} testId="coach-program-leaderboard">
        <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {report.leaderboard.map((l) => (
            <li key={l.id} style={{ fontSize: 14, color: vmTokens.textPrimary }}>
              {l.name} <span style={{ color: vmTokens.textSecondary }}>· {l.composite} · {l.status}</span>
            </li>
          ))}
        </ol>
        <p data-testid="coach-program-bands" style={{ ...muted, marginTop: 10 }}>
          {report.bands.map((b) => `${b.label}: ${b.count}`).join(' · ')}
        </p>
      </Block>

      <Block title="Dimension heat map" padding={0} testId="coach-program-heatmap">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 12.5, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ ...cell, textAlign: 'left' }}>Leader</th>
                {report.heatMap.dimensions.map((d) => (
                  <th key={d.n} style={cell} title={d.name}>
                    {d.n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.heatMap.rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ ...cell, textAlign: 'left', whiteSpace: 'nowrap' }}>{r.name}</td>
                  {r.cells.map((c) => (
                    <td
                      key={c.n}
                      data-mark={c.mark ?? 'none'}
                      title={c.mark ? MARK_WORD[c.mark] : 'no score'}
                      style={{ ...cell, background: c.mark ? MARK_BG[c.mark] : 'transparent' }}
                    >
                      {c.avg ?? '·'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...muted, padding: '8px 12px' }}>
          {report.heatMap.dimensions.map((d) => `${d.n}. ${d.name}`).join(' · ')}
        </p>
      </Block>

      <Block title="Program trends" padding={padding} testId="coach-program-trends">
        {facts.length > 0 && (
          <ul style={{ margin: '0 0 8px', paddingLeft: 18 }}>
            {facts.map((f) => (
              <li key={f} style={{ fontSize: 13.5, color: vmTokens.textSecondary }}>
                {f}
              </li>
            ))}
          </ul>
        )}
        {t.text.map((p) => (
          <p key={p} style={para}>
            {p}
          </p>
        ))}
      </Block>

      <Block title="Leader snapshots" padding={padding} testId="coach-program-snapshots">
        {report.snapshots.map((s) => (
          <p key={s.id} style={para}>
            {s.text}
          </p>
        ))}
      </Block>

      <Block title="Priority matrix" padding={padding} testId="coach-program-priorities">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {(
            [
              ['Lowest', named(report.priorityMatrix.lowest)],
              ['Declining', named(report.priorityMatrix.declining)],
              ['Plateau', named(report.priorityMatrix.plateau)],
            ] as const
          ).map(([label, items]) => (
            <div key={label}>
              <p style={{ ...muted, fontWeight: 600 }}>{label}</p>
              <p style={para}>{items.length ? items.join(', ') : 'None'}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Initiatives" padding={padding} testId="coach-program-initiatives">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {report.initiatives.map((i) => (
            <li key={i} style={{ ...para, margin: '0 0 6px' }}>
              {i}
            </li>
          ))}
        </ol>
      </Block>
    </div>
  );
}

function Block({ title, padding, testId, children }: { title: string; padding: number; testId: string; children: ReactNode }) {
  return (
    <div data-testid={testId}>
      <SectionLabel>{title}</SectionLabel>
      <CoachCard style={{ padding }}>{children}</CoachCard>
    </div>
  );
}

const para: CSSProperties = { margin: '0 0 10px', fontSize: 14, lineHeight: 1.6, color: vmTokens.textSecondary };
const muted: CSSProperties = { margin: 0, fontSize: 12.5, color: vmTokens.textTertiary };
const cell: CSSProperties = {
  padding: '6px 8px',
  textAlign: 'center',
  borderBottom: `1px solid ${vmTokens.divider}`,
  color: vmTokens.textPrimary,
  fontVariantNumeric: 'tabular-nums',
};
