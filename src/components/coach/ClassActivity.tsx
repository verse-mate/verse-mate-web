/**
 * What the notetaker did for one class: its next recording, how its latest run
 * went, and the runs before that in a small "Earlier" list. In the coaching
 * dashboard's look (Sessions) or the portal's (admin class schedule). Renders
 * nothing when there is nothing to say, including while the notetaker is not
 * answering. The words come from lib/notetakerActivity.
 */

import { vmTokens } from '@/styles/themeStyles';
import { classActivityLines, type RunLine, type RunTone } from '@/lib/notetakerActivity';
import type { ClassActivity } from '@/services/coachService';
import { dt } from './dashboardTheme';

const PALETTES: Record<'dashboard' | 'portal', Record<RunTone | 'next', string>> = {
  dashboard: { next: dt.body, good: dt.green, waiting: dt.gold2, missed: dt.rust, progress: dt.textMuted },
  portal: {
    next: vmTokens.textSecondary,
    good: vmTokens.statusSuccess,
    waiting: vmTokens.gold,
    missed: vmTokens.statusError,
    progress: vmTokens.textSecondary,
  },
};

export default function ClassActivityLines({
  activity,
  timeZone,
  look,
}: {
  activity: ClassActivity | undefined;
  timeZone: string | null;
  look: 'dashboard' | 'portal';
}) {
  const { next, latest, earlier } = classActivityLines(activity, timeZone);
  if (!next && !latest) return null;
  const colors = PALETTES[look];
  const size = look === 'dashboard' ? 13 : 12.5;
  const line = (l: RunLine) => (
    <span style={{ color: colors[l.tone], fontWeight: l.tone === 'progress' ? 500 : 600 }}>
      {l.live && (
        <span aria-hidden style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: colors[l.tone], marginRight: 6, verticalAlign: 'middle' }} />
      )}
      {l.text}
    </span>
  );
  return (
    <div data-testid="coach-class-activity" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6, fontSize: size }}>
      {next && (
        <div data-testid="coach-class-next" style={{ color: colors.next }}>
          {next}
        </div>
      )}
      {latest && (
        <div data-testid="coach-class-last-run" data-tone={latest.tone}>
          {line(latest)}
        </div>
      )}
      {earlier.length > 0 && (
        <details data-testid="coach-class-earlier-runs">
          <summary style={{ cursor: 'pointer', color: colors.progress, fontSize: size - 0.5 }}>Earlier runs</summary>
          <ul style={{ margin: '4px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {earlier.map((l, i) => (
              <li key={i}>{line(l)}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
