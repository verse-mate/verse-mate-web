import type { CSSProperties, ReactNode } from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';
import { dt } from '@/components/coach/dashboardTheme';
import { useLearningState } from '@/hooks/useCoachLearning';
import type { ProgramState } from '@/services/coachLearning';
import { Btn, LEARN, Progress, h2, lead, muted } from './ui';

const card: CSSProperties = { border: `1px solid ${dt.cardBorder}`, borderRadius: 14, padding: 'clamp(18px, 3vw, 26px)', background: dt.cardBg };

export function nextTitle(p: ProgramState): string | null {
  const next = p.next;
  if (!next) return null;
  const m = p.modules.findIndex((x) => x.id === next.moduleId);
  if (m < 0) return null;
  if (next.kind === 'check') return `Module ${m + 1} check`;
  const l = p.modules[m].lessons.findIndex((x) => x.id === next.lessonId);
  return `Module ${m + 1}, lesson ${l + 1}, ${p.modules[m].lessons[l]?.title ?? ''}`;
}

export function Facts({ program }: { program: ProgramState }) {
  const lessons = program.modules.reduce((n, m) => n + m.lessons.length, 0);
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '10px 22px', flexWrap: 'wrap', fontSize: 14, color: dt.body }}>
      <li style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <BookOpen size={16} aria-hidden color={dt.gold} />{' '}
        <span className="nt20-num">
          {program.total} module{program.total === 1 ? '' : 's'}, {lessons} lesson{lessons === 1 ? '' : 's'}, at your own pace
        </span>
      </li>
      <li style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <GraduationCap size={16} aria-hidden color={dt.gold} /> A short check after each module
      </li>
    </ul>
  );
}

export function lessonCounts(p: ProgramState) {
  const all = p.modules.flatMap((m) => m.lessons);
  return { done: all.filter((l) => l.state === 'done').length, lessons: all.length };
}

export default function LearningOffer({ confirm, fallback }: { confirm?: boolean; fallback: ReactNode }) {
  const program = useLearningState();
  if (program.isLoading) return null;
  const p = program.data;
  if (!p?.open) return <>{fallback}</>;
  const started = p.enrolledAt !== null;
  const next = nextTitle(p);
  return (
    <div data-testid="learning-offer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 'clamp(32px, 6vw, 64px) 0 16px' }}>
      {confirm ? (
        <>
          {fallback}
          <div style={{ width: '100%', maxWidth: 620, borderTop: `1px solid ${dt.border2}`, margin: '18px 0 4px' }} />
          <p style={{ ...muted, maxWidth: 620, width: '100%' }}>The learning program needs no confirmation to start.</p>
        </>
      ) : (
        <p style={{ ...muted, maxWidth: 620, width: '100%' }}>This account is not in the coaching program yet.</p>
      )}
      <div style={{ ...card, display: 'grid', gap: 16, textAlign: 'left', maxWidth: 620, width: '100%', boxSizing: 'border-box' }}>
        <h2 style={h2}>{started ? 'Continue the learning program' : 'Learn to lead a Bible study'}</h2>
        {started ? (
          <>
            <Progress passed={p.passed} total={p.total} {...lessonCounts(p)} />
            {next && <p style={{ ...muted, color: dt.body }}>Next: {next}.</p>}
          </>
        ) : (
          <>
            <p style={lead}>
              The learning program is open to anyone with a VerseMate account. It teaches how to lead a study the way Coach looks at one: how to open, how to read Scripture together, how to ask questions that land, how to pray and how to welcome someone new.
            </p>
            <Facts program={p} />
            <p style={{ ...muted, color: dt.body }}>At the end you hold a completion record, and you can ask to join the coaching program.</p>
          </>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Btn kind={confirm ? 'outline' : 'primary'} to={LEARN.path}>
            {started ? 'Open the program' : 'Start the learning program'}
          </Btn>
          <Btn kind="outline" to="/read">Back to reading</Btn>
        </div>
      </div>
    </div>
  );
}
