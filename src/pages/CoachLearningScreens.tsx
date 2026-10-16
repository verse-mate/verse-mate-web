import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GraduationCap, Lock } from 'lucide-react';
import { dt } from '@/components/coach/dashboardTheme';
import { useApp } from '@/contexts/AppContext';
import { useCoachMe } from '@/hooks/useCoach';
import { learningKeys, useLearningState } from '@/hooks/useCoachLearning';
import { Facts, lessonCounts } from '@/components/coach/learning/LearningOffer';
import {
  BackLink,
  Btn,
  Field,
  LEARN,
  Loading,
  Markdown,
  type NavKey,
  Notice,
  Progress,
  Row,
  Rows,
  STEP_WORD,
  Shell,
  StepMark,
  type StepState,
  Tag,
  day,
  formatDate,
  h1,
  h2,
  h3,
  input,
  lead,
  muted,
  passageHref,
  passageRef,
  pct,
} from '@/components/coach/learning/ui';
import { CoachAuthError } from '@/services/coachService';
import { sendVerificationEmail } from '@/services/emailVerification';
import { type Check, type Continue, type Grade, type Lesson, type ProgramState, learning, refusalOf } from '@/services/coachLearning';

const card: CSSProperties = { border: `1px solid ${dt.cardBorder}`, borderRadius: 14, padding: 'clamp(18px, 3vw, 26px)', background: dt.cardBg };
const panel: CSSProperties = { background: dt.innerBg, border: `1px solid ${dt.cardBorder}`, borderRadius: 14, padding: '20px 22px' };

function useViewer(p: ProgramState | undefined): { nav: NavKey; active: string } {
  const me = useCoachMe();
  if (me.data?.isAdmin) return { nav: 'admin', active: 'program' };
  return { nav: p?.isLeader ? 'leader' : 'learner', active: 'learning' };
}

function Centered({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 'clamp(32px, 6vw, 64px) 0 16px', textAlign: 'center' }}>{children}</div>;
}

function PrivacyNote() {
  return (
    <p style={{ ...muted, fontSize: 13.5 }}>
      Program admins see your name, your email address and your progress. They use them to follow the program and to answer a request to join.
    </p>
  );
}

function SignedOut() {
  return (
    <Shell nav={null}>
      <Centered>
        <GraduationCap size={44} color={dt.gold} strokeWidth={1.5} aria-hidden />
        <h1 style={{ ...h2, fontSize: 28 }}>Sign in to continue</h1>
        <p style={{ ...lead, textAlign: 'center', maxWidth: '44ch' }}>Sign in to VerseMate to see your coaching feedback, or to start and continue the learning program.</p>
        <Btn kind="dark" to="/login">Sign in</Btn>
      </Centered>
    </Shell>
  );
}

function Failed({ onRetry }: { onRetry: () => void }) {
  return (
    <Shell nav={null}>
      <Centered>
        <p style={lead}>Something went wrong loading the learning program.</p>
        <Btn kind="outline" onClick={onRetry}>Try again</Btn>
      </Centered>
    </Shell>
  );
}

function useProgram() {
  const { state } = useApp();
  const query = useLearningState();
  const viewer = useViewer(query.data);
  const signedOut = !state.isSignedIn || query.error instanceof CoachAuthError;
  return { query, viewer, signedOut, p: query.data };
}

function Gatekeeper({ program, children }: { program: ReturnType<typeof useProgram>; children: (p: ProgramState) => ReactNode }) {
  if (program.signedOut) return <SignedOut />;
  if (program.query.error) return <Failed onRetry={() => program.query.refetch()} />;
  if (!program.p) return <Shell nav={null}><Loading /></Shell>;
  if (!program.p.open) return <NotOpen p={program.p} viewer={program.viewer} />;
  return <>{children(program.p)}</>;
}

function NotOpen({ p, viewer }: { p: ProgramState; viewer: { nav: NavKey; active: string } }) {
  return (
    <Shell nav={viewer.nav} active={viewer.active}>
      <Centered>
        <Lock size={40} color={dt.textLight} strokeWidth={1.5} aria-hidden />
        <h1 style={{ ...h2, fontSize: 28 }} data-testid="learning-not-open">The learning program is not open right now</h1>
        <p style={{ ...lead, textAlign: 'center', maxWidth: '50ch' }}>The program team is preparing it. Nothing can be started until it opens again.</p>
        {p.completedAt && (
          <div style={{ ...panel, textAlign: 'left', maxWidth: 560, display: 'grid', gap: 6 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>Your record is kept</p>
            <p style={{ ...muted, color: dt.body }}>
              You completed the program on {formatDate(day(p.completedAt))}
              {p.request?.status === 'open' ? ', and your request to join the coaching program is still open: an admin can answer it while the program is closed.' : '.'} When it reopens you will find everything where you left it.
            </p>
          </div>
        )}
        <Btn kind="outline" to="/read">Back to reading</Btn>
      </Centered>
    </Shell>
  );
}

type LessonView = { id: number; title: string; state: StepState; isNew: boolean };
type ModuleView = { id: number; n: number; title: string; summary: string; passMark: number; best: number | null; state: 'passed' | 'current' | 'open' | 'locked'; isNew: boolean; questions: number; lessons: LessonView[]; check: StepState };

export function pathView(p: ProgramState): ModuleView[] {
  const next = p.next;
  return p.modules.map((m, i) => {
    const lessons = m.lessons.map((l, j) => {
      const laterDone = m.lessons.slice(j + 1).some((x) => x.state === 'done');
      const state: StepState = l.state === 'done' ? 'done' : next?.kind === 'lesson' && next.lessonId === l.id ? 'next' : l.state === 'open' ? 'open' : 'locked';
      return { id: l.id, title: l.title, state, isNew: l.state !== 'done' && (m.state === 'passed' || laterDone) };
    });
    const check: StepState = m.state === 'passed' ? 'done' : next?.kind === 'check' && next.moduleId === m.id ? 'next' : m.state === 'open' ? 'open' : 'locked';
    const state = m.state === 'passed' ? 'passed' : next?.moduleId === m.id ? 'current' : m.state === 'open' || m.lessons.some((l) => l.state === 'open') ? 'open' : 'locked';
    return { id: m.id, n: i + 1, title: m.title, summary: m.description, passMark: m.passMark, best: m.bestScore, state, isNew: !!p.completedAt && m.state !== 'passed', questions: m.questionCount, lessons, check };
  });
}

function nextHref(next: Continue) {
  if (!next) return LEARN.completion;
  return next.kind === 'check' ? LEARN.check(next.moduleId) : LEARN.lesson(next.lessonId);
}

function locate(p: ProgramState, next: Continue) {
  if (!next) return null;
  const m = p.modules.findIndex((x) => x.id === next.moduleId);
  if (m < 0) return null;
  if (next.kind === 'check') return { label: `Module ${m + 1} check`, title: p.modules[m].title, module: m + 1 };
  const l = p.modules[m].lessons.findIndex((x) => x.id === next.lessonId);
  return { label: `Module ${m + 1}, lesson ${l + 1}`, title: p.modules[m].lessons[l]?.title ?? '', module: m + 1, lesson: l + 1 };
}

function moduleTag(m: ModuleView) {
  if (m.isNew && m.state !== 'locked') return <Tag tone="gold">New</Tag>;
  if (m.state === 'passed') return <Tag tone="green">Passed · best {pct(m.best ?? 0)}</Tag>;
  if (m.state === 'current') return <Tag tone="gold">In progress</Tag>;
  if (m.state === 'open') return <Tag tone="gold">Open</Tag>;
  return <Tag tone="grey"><Lock size={11} aria-hidden /> Locked</Tag>;
}

function StepRow({ state, href, title, meta, isNew, word }: { state: StepState; href: string; title: string; meta: string; isNew?: boolean; word?: string }) {
  const locked = state === 'locked';
  return (
    <Link to={href} aria-label={`${title}, ${word ?? STEP_WORD[state]}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 4px', minHeight: 44, textDecoration: 'none', color: locked ? dt.textMuted : dt.textPrimary, background: state === 'next' ? '#FBF6EA' : 'transparent', borderRadius: 8 }}>
      <StepMark state={state} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontWeight: state === 'next' ? 700 : 500, fontSize: 15, overflowWrap: 'anywhere' }}>{title}</span>
        <span className="nt20-num" style={{ display: 'block', fontSize: 12.5, color: dt.textMuted }}>{meta}</span>
      </span>
      {isNew && <Tag tone="gold">New</Tag>}
      <span style={{ fontSize: 12.5, fontWeight: 700, color: state === 'done' ? dt.green : state === 'next' ? dt.goldHover : dt.textMuted, whiteSpace: 'nowrap' }}>{word ?? STEP_WORD[state]}</span>
    </Link>
  );
}

function ModuleBlock({ m }: { m: ModuleView }) {
  const [open, setOpen] = useState(false);
  const expanded = m.state === 'current' || m.state === 'open' || m.lessons.some((l) => l.isNew || (m.state === 'locked' && l.state !== 'locked'));
  const steps = (
    <ol style={{ margin: 0, padding: 0, listStyle: 'none', borderTop: `1px solid ${dt.rowDivider}` }}>
      {m.lessons.map((l, i) => (
        <li key={l.id} style={{ borderBottom: `1px solid ${dt.rowDivider}` }}>
          <StepRow state={l.state} href={LEARN.lesson(l.id)} title={l.title} meta={`Lesson ${i + 1}`} isNew={l.isNew} />
        </li>
      ))}
      <li>
        <StepRow
          state={m.check}
          href={LEARN.check(m.id)}
          title="Module check"
          meta={`${m.questions} question${m.questions === 1 ? '' : 's'} · pass mark ${m.passMark}%`}
          word={m.check === 'done' ? `Passed ${pct(m.best ?? 0)}` : m.check === 'locked' ? 'After the lessons' : undefined}
        />
      </li>
    </ol>
  );
  return (
    <li data-testid={`learning-module-${m.n}`} style={{ ...card, listStyle: 'none', display: 'grid', gap: 12, background: m.state === 'locked' ? dt.innerBg : dt.cardBg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: '1 1 260px' }}>
          <h3 style={{ ...h3, overflowWrap: 'anywhere' }}>
            <span className="nt20-num" style={{ color: dt.goldHover, marginRight: 10 }}>{m.n}</span> {m.title}
          </h3>
          <p style={{ ...muted, marginTop: 6 }}>{m.summary}</p>
        </div>
        {moduleTag(m)}
      </div>
      {m.state === 'passed' && m.lessons.some((l) => l.isNew) && <p style={{ ...muted, fontSize: 13.5 }}>A lesson was added after you passed. It is there for you to read; your pass stands.</p>}
      {m.state === 'locked' && expanded && <p style={{ ...muted, fontSize: 13.5 }}>A module was added ahead of this one. What you finished here stays done; the rest opens when Module {m.n - 1} is passed.</p>}
      {expanded ? (
        steps
      ) : m.state === 'passed' ? (
        <div>
          <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} style={{ fontSize: 13.5, fontWeight: 700, color: dt.goldHover, cursor: 'pointer', minHeight: 44, padding: 0, background: 'none', border: 'none', fontFamily: dt.sans }}>
            {open ? 'Hide' : 'Show'} its {m.lessons.length} lessons and check
          </button>
          {open && steps}
        </div>
      ) : (
        <p className="nt20-num" style={{ ...muted, fontSize: 13.5 }}>
          {m.lessons.length} lesson{m.lessons.length === 1 ? '' : 's'} and a check of {m.questions} question{m.questions === 1 ? '' : 's'}.{m.n > 1 ? ` Opens when Module ${m.n - 1} is passed.` : ''}
        </p>
      )}
    </li>
  );
}

function StartView({ p, viewer }: { p: ProgramState; viewer: { nav: NavKey; active: string } }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const enrol = useMutation({
    mutationFn: learning.enrol,
    onSuccess: async () => {
      const fresh = await qc.fetchQuery({ queryKey: learningKeys.state, queryFn: learning.state });
      navigate(nextHref(fresh.next));
    },
    onError: (err) => setError(refusalOf(err).message),
  });
  return (
    <Shell nav={viewer.nav} active={viewer.active}>
      <div style={{ display: 'grid', gap: 18, paddingTop: 32, maxWidth: 760 }}>
        <h1 style={h1}>Learning to lead a Bible study</h1>
        <p style={lead}>Each module is a few short lessons and a check. Lessons open one after another, so there is always one clear next step.</p>
        <Facts program={p} />
        <p style={{ ...muted, color: dt.body }}>At the end you hold a completion record with the date and your best score in each module. You can then ask to join the coaching program; an admin reads every request.</p>
        <PrivacyNote />
        {error && <Notice tone="rust" title="Not started">{error}</Notice>}
        <div>
          <Btn onClick={() => enrol.mutate()} disabled={enrol.isPending}>Start the program</Btn>
        </div>
        <ol style={{ margin: '6px 0 0', padding: 0, listStyle: 'none' }}>
          {p.modules.map((m, i) => (
            <li key={m.id} style={{ display: 'flex', gap: 14, padding: '12px 0', borderTop: i ? `1px solid ${dt.rowDivider}` : 'none', alignItems: 'baseline' }}>
              <span className="nt20-num" style={{ fontFamily: dt.serif, fontSize: 18, color: dt.gold, minWidth: 22 }}>{i + 1}</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 600, fontSize: 15.5 }}>{m.title}</span>
                <span style={{ ...muted, display: 'block' }}>{m.lessons.length} lesson{m.lessons.length === 1 ? '' : 's'} and a check</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Shell>
  );
}

export function LearningPathScreen() {
  const program = useProgram();
  return (
    <Gatekeeper program={program}>
      {(p) => (p.enrolledAt ? <PathView p={p} viewer={program.viewer} /> : <StartView p={p} viewer={program.viewer} />)}
    </Gatekeeper>
  );
}

function PathView({ p, viewer }: { p: ProgramState; viewer: { nav: NavKey; active: string } }) {
  const modules = pathView(p);
  const newModules = modules.filter((m) => m.isNew);
  const at = locate(p, p.next);
  const newAhead = !p.completedAt && modules.some((m) => (m.state === 'locked' && m.lessons.some((l) => l.state === 'done')) || m.lessons.some((l) => l.isNew && l.state === 'next'));
  const darkCard: CSSProperties = { ...card, background: dt.darkBg, border: 'none', color: dt.darkText, display: 'flex', gap: 18, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' };
  return (
    <Shell nav={viewer.nav} active={viewer.active}>
      <div style={{ display: 'grid', gap: 26, paddingTop: 30 }} data-testid="learning-path">
        <div style={{ display: 'grid', gap: 12 }}>
          <h1 style={h1}>Learning to lead a Bible study</h1>
          <Progress passed={p.passed} total={p.total} {...lessonCounts(p)} />
        </div>
        {p.completedAt ? (
          <div style={darkCard}>
            <div style={{ minWidth: 0, flex: '1 1 300px' }}>
              <h2 style={{ ...h2, color: dt.darkText }}>You completed the program on {formatDate(day(p.completedAt))}</h2>
              {newModules.length > 0 && (
                <p style={{ margin: '8px 0 0', fontSize: 14.5, lineHeight: 1.55, color: dt.darkMuted }}>
                  A new module was added since: <em style={{ color: dt.darkText }}>{newModules[0].title}</em>. It is open to you and does not change your completion.
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {newModules.length > 0 && p.next && <Btn to={nextHref(p.next)}>Start the new module</Btn>}
              <Btn kind={newModules.length ? 'outline' : 'primary'} to={LEARN.completion} style={newModules.length ? { background: 'transparent', color: dt.darkText, borderColor: dt.darkMuted2 } : undefined}>
                See your record
              </Btn>
            </div>
          </div>
        ) : (
          at && (
            <div style={darkCard}>
              <div style={{ minWidth: 0, flex: '1 1 300px' }}>
                <p className="nt20-num" style={{ margin: 0, fontSize: 13.5, color: dt.darkMuted }}>{at.label}</p>
                <h2 style={{ ...h2, color: dt.darkText, marginTop: 4, overflowWrap: 'anywhere' }}>{at.title}</h2>
                {newAhead && <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.55, color: dt.darkMuted }}>New: the program team added this step ahead of where you were. The lessons you finished stay done.</p>}
              </div>
              <Btn to={nextHref(p.next)}>{p.next?.kind === 'check' ? 'Take the check' : 'Continue'}</Btn>
            </div>
          )
        )}
        <div style={{ display: 'grid', gap: 24, maxWidth: 820 }}>
          <ol style={{ margin: 0, padding: 0, display: 'grid', gap: 14, minWidth: 0 }} aria-label="Modules">
            {modules.map((m) => <ModuleBlock key={m.id} m={m} />)}
          </ol>
          <aside style={{ ...panel, display: 'grid', gap: 12 }}>
            <h2 style={h3}>At the end</h2>
            <p style={{ ...muted, color: dt.body }}>A completion record with the date and your best score in each module. You can then ask to join the coaching program; an admin reads every request.</p>
            {p.isLeader && <p style={{ ...muted, color: dt.body }}>You already lead a group in Coach. Taking the program changes nothing there: your dashboard, sessions and upload page stay as they are.</p>}
            {p.enrolledAt && <p style={muted}>Started on {formatDate(day(p.enrolledAt))}.</p>}
            <PrivacyNote />
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function LessonVideo({ id, admin }: { id: number; admin: boolean }) {
  const video = useQuery({ queryKey: learningKeys.video(id, admin), queryFn: () => learning.video(id), retry: false, staleTime: 30 * 60 * 1000 });
  if (!video.data) return null;
  return (
    <figure style={{ margin: 0 }}>
      <video controls preload="metadata" style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: 12, background: dt.darkBg, display: 'block' }} aria-label="Lesson video" data-testid="learning-lesson-video">
        <source src={video.data.url} type={video.data.type} />
      </video>
    </figure>
  );
}

export function LessonContent({ lesson, place, admin = false }: { lesson: Lesson; place: string; admin?: boolean }) {
  return (
    <article style={{ display: 'grid', gap: 22 }}>
      <header style={{ display: 'grid', gap: 10 }}>
        {lesson.draft && <span><Tag tone="rust">Draft · learners cannot open this lesson</Tag></span>}
        <h1 style={{ ...h1, overflowWrap: 'anywhere' }}>{lesson.title}</h1>
        <p className="nt20-num" style={muted}>{place}</p>
      </header>
      <div className="nt20-lesson">
        {lesson.passages.length > 0 && (
          <aside aria-labelledby="learning-passages" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <h2 id="learning-passages" style={{ fontSize: 14, fontWeight: 700, margin: '0 6px 0 0' }}>Passages</h2>
            {lesson.passages.map((ps) => (
              <a key={passageRef(ps)} href={passageHref(ps)} data-testid="learning-passage" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', minHeight: 44, padding: '10px 14px', border: `1px solid ${dt.cardBorder}`, borderRadius: 10, textDecoration: 'none', color: dt.textPrimary, background: dt.innerBg }}>
                <span style={{ fontFamily: dt.serif, fontSize: 17, whiteSpace: 'nowrap' }}>{passageRef(ps)}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: dt.goldHover, whiteSpace: 'nowrap' }}>Open in the reader</span>
              </a>
            ))}
          </aside>
        )}
        <div style={{ minWidth: 0, display: 'grid', gap: 24 }}>
          {lesson.hasVideo && <LessonVideo id={lesson.id} admin={admin} />}
          <div data-testid="learning-lesson-text">
            <Markdown source={lesson.body} />
          </div>
        </div>
      </div>
    </article>
  );
}

function lessonPlace(p: ProgramState, lesson: Lesson) {
  const m = p.modules.findIndex((x) => x.id === lesson.moduleId);
  const lessons = p.modules[m]?.lessons ?? [];
  const n = lessons.findIndex((x) => x.id === lesson.id);
  return `Module ${m + 1}, ${lesson.moduleTitle} · Lesson ${n + 1} of ${lessons.length}`;
}

function Locked({ p, next, viewer, what }: { p: ProgramState; next: Continue; viewer: { nav: NavKey; active: string }; what: 'lesson' | 'check' }) {
  const at = locate(p, next);
  return (
    <Shell nav={viewer.nav} active={viewer.active}>
      <div style={{ paddingTop: 12 }}><BackLink to={LEARN.path}>Your path</BackLink></div>
      <Centered>
        <Lock size={40} color={dt.textLight} strokeWidth={1.5} aria-hidden />
        <h1 style={{ ...h2, fontSize: 28 }} data-testid="learning-locked">{what === 'lesson' ? 'This lesson is locked' : 'The check opens after the lessons'}</h1>
        {at && (
          <p style={{ ...lead, textAlign: 'center', maxWidth: '48ch' }}>
            {what === 'lesson' ? 'Lessons open in order.' : 'Each step opens in order.'} Finish {at.label}, <em>{at.title}</em>, first.
          </p>
        )}
        <Btn to={nextHref(next)}>{at ? `Go to ${at.label.toLowerCase()}` : 'Your path'}</Btn>
      </Centered>
    </Shell>
  );
}

export function LearningLessonScreen() {
  const program = useProgram();
  const id = Number(useParams().id);
  const qc = useQueryClient();
  const lesson = useQuery({ queryKey: learningKeys.lesson(id), queryFn: () => learning.lesson(id), retry: false, enabled: !!program.p?.enrolledAt });
  const [justDone, setJustDone] = useState(false);
  const done = useMutation({
    mutationFn: () => learning.markDone(id),
    onSuccess: async () => {
      await Promise.all([qc.invalidateQueries({ queryKey: learningKeys.state }), qc.invalidateQueries({ queryKey: learningKeys.lesson(id) })]);
      setJustDone(true);
      window.scrollTo(0, 0);
    },
  });
  return (
    <Gatekeeper program={program}>
      {(p) => {
        if (!p.enrolledAt) return <Navigate to={LEARN.path} replace />;
        const refusal = lesson.error ? refusalOf(lesson.error) : null;
        if (refusal?.code === 'locked') return <Locked p={p} next={(refusal.details.next as Continue) ?? p.next} viewer={program.viewer} what="lesson" />;
        if (lesson.error) return <Failed onRetry={() => lesson.refetch()} />;
        if (!lesson.data) return <Shell nav={program.viewer.nav}><Loading /></Shell>;
        const l = lesson.data;
        const after = locate(p, p.next);
        const go = l.done && (
          <Btn to={nextHref(p.next)}>{!p.next ? 'See your record' : p.next.kind === 'check' ? 'Take the check' : 'Next lesson'}</Btn>
        );
        return (
          <Shell nav={program.viewer.nav} active={program.viewer.active}>
            <div style={{ display: 'grid', gap: 18, paddingTop: 12 }}>
              <BackLink to={LEARN.path}>Your path</BackLink>
              {l.done && justDone && (
                <DoneNotice action={go}>
                  {after ? <>Next: {after.label}, <em>{after.title}</em>.</> : 'This was the last step of the program.'}
                </DoneNotice>
              )}
              <LessonContent lesson={l} place={lessonPlace(p, l)} />
              <div style={{ borderTop: `1px solid ${dt.border2}`, paddingTop: 22 }}>
                {l.done ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{go}</div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <p style={muted}>Read it through{l.hasVideo ? ' and watch the video' : ''}, then mark it done to open the next step.</p>
                    <Btn onClick={() => done.mutate()} disabled={done.isPending}>Mark as done</Btn>
                    {done.error && <Notice tone="rust" title="Not marked done">{refusalOf(done.error).message}</Notice>}
                  </div>
                )}
              </div>
            </div>
          </Shell>
        );
      }}
    </Gatekeeper>
  );
}

function DoneNotice({ action, children }: { action: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div ref={ref} tabIndex={-1} style={{ outline: 'none' }}>
      <Notice tone="green" title="Lesson done" action={action}>{children}</Notice>
    </div>
  );
}

function QuestionLinks({ ns, label = 'Go to' }: { ns: number[]; label?: string }) {
  return (
    <span style={{ margin: '8px 0 0', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 14.5, color: dt.body }}>
      {label}
      {ns.map((n) => (
        <a key={n} href={`#learning-q${n}`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, minWidth: 44, padding: '0 12px', borderRadius: 9, border: `1px solid ${dt.inputBorder}`, background: dt.cardBg, color: dt.textPrimary, fontWeight: 700, textDecoration: 'none' }}>
          Question {n}
        </a>
      ))}
    </span>
  );
}

function sameQuestion(a: Check['questions'][number], b: Check['questions'][number]) {
  return a.id === b.id && a.prompt === b.prompt && a.options.join('\n') === b.options.join('\n');
}

export function LearningCheckScreen() {
  const program = useProgram();
  const moduleId = Number(useParams().id);
  const qc = useQueryClient();
  const check = useQuery({ queryKey: learningKeys.check(moduleId), queryFn: () => learning.check(moduleId), retry: false, enabled: !!program.p?.enrolledAt });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [missing, setMissing] = useState<number[]>([]);
  const [changed, setChanged] = useState<number[]>([]);
  const [graded, setGraded] = useState<Grade | null>(null);
  const [error, setError] = useState<string | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const toTop = () => top.current?.scrollIntoView?.({ block: 'start' });
  const submit = useMutation({
    mutationFn: (c: Check) => learning.submit(moduleId, c.version, c.questions.map((q) => ({ questionId: q.id, option: answers[q.id] }))),
    onSuccess: (g) => {
      setGraded(g);
      qc.invalidateQueries({ queryKey: learningKeys.state });
      toTop();
    },
    onError: async (err, c) => {
      const f = refusalOf(err);
      if (f.code === 'check-changed') {
        const fresh = await qc.fetchQuery({ queryKey: learningKeys.check(moduleId), queryFn: () => learning.check(moduleId) });
        const kept = Object.fromEntries(Object.entries(answers).filter(([qid]) => {
          const before = c.questions.find((q) => q.id === Number(qid));
          const now = fresh.questions.find((q) => q.id === Number(qid));
          return before && now && sameQuestion(before, now);
        }));
        setAnswers(kept);
        setChanged(fresh.questions.map((q, i) => (c.questions.some((b) => sameQuestion(b, q)) ? 0 : i + 1)).filter(Boolean));
        return;
      }
      if (f.code === 'incomplete') {
        setMissing(c.questions.map((q, i) => (answers[q.id] === undefined ? i + 1 : 0)).filter(Boolean));
        return;
      }
      setError(f.message);
    },
  });
  return (
    <Gatekeeper program={program}>
      {(p) => {
        if (!p.enrolledAt) return <Navigate to={LEARN.path} replace />;
        const refusal = check.error ? refusalOf(check.error) : null;
        if (refusal?.code === 'locked') return <Locked p={p} next={(refusal.details.next as Continue) ?? p.next} viewer={program.viewer} what="check" />;
        if (check.error) return <Failed onRetry={() => check.refetch()} />;
        if (!check.data) return <Shell nav={program.viewer.nav}><Loading /></Shell>;
        const c = check.data;
        const mIndex = p.modules.findIndex((m) => m.id === moduleId);
        const nextModule = p.modules.slice(mIndex + 1).find((m) => m.state !== 'passed');
        const send = () => {
          setError(null);
          const unanswered = c.questions.map((q, i) => (answers[q.id] === undefined ? i + 1 : 0)).filter(Boolean);
          setMissing(unanswered);
          if (unanswered.length === 0) {
            setChanged([]);
            submit.mutate(c);
          }
        };
        const retake = () => {
          setGraded(null);
          setAnswers({});
          setMissing([]);
          check.refetch();
          toTop();
        };
        return (
          <Shell nav={program.viewer.nav} active={program.viewer.active}>
            <div ref={top} style={{ display: 'grid', gap: 22, paddingTop: 12, maxWidth: 760 }} data-testid="learning-check">
              <BackLink to={LEARN.path}>Your path</BackLink>
              <header style={{ display: 'grid', gap: 10 }}>
                <h1 style={h1}>Module {mIndex + 1} check</h1>
                <p className="nt20-num" style={muted}>
                  {c.title} · {c.questions.length} question{c.questions.length === 1 ? '' : 's'} · pass mark {c.passMark}% · retake as often as you like
                </p>
              </header>
              {graded && (
                <div data-testid="learning-check-result" style={{ ...card, background: graded.passed ? dt.greenBg : dt.innerBg, border: `1px solid ${graded.passed ? '#CFE0CC' : dt.cardBorder}`, display: 'grid', gap: 10 }} role="status">
                  <h2 style={{ ...h2, color: graded.passed ? dt.green : dt.textPrimary }}>
                    {graded.passed ? `Passed. Module ${mIndex + 1} is done.` : `Not passed yet. You need ${graded.passMark}% to pass.`}
                  </h2>
                  <p className="nt20-num" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: dt.body }}>Your score: {pct(graded.score)}</p>
                  <p className="nt20-num" style={{ ...muted, color: dt.body }}>
                    You answered {graded.correct} of {graded.total} correctly{graded.passed && graded.bestScore !== null ? `. Best score ${pct(graded.bestScore)}.` : '.'}
                  </p>
                  {!graded.passed && graded.wrong.length > 0 && <QuestionLinks ns={graded.wrong} label="Look again at" />}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                    {graded.passed ? (
                      <Btn to={nextHref(p.next)}>{p.completedAt && !p.next ? 'See your record' : nextModule ? `Start Module ${p.modules.indexOf(nextModule) + 1}` : 'Continue'}</Btn>
                    ) : (
                      <Btn onClick={retake}>Retake the check</Btn>
                    )}
                    <Btn kind="outline" to={LEARN.path}>Back to your path</Btn>
                  </div>
                  {graded.passed && nextModule && <p style={muted}>Module {p.modules.indexOf(nextModule) + 1}, <em>{nextModule.title}</em>, is now open.</p>}
                </div>
              )}
              {changed.length > 0 && (
                <Notice tone="rust" title="This check changed while you were answering">
                  The program team edited it after you opened it, so nothing was counted. Your answers to the questions that did not change are kept; answer the changed questions, then submit again.
                  <QuestionLinks ns={changed} />
                </Notice>
              )}
              {missing.length > 0 && (
                <Notice tone="rust" title="Answer every question before you submit">
                  Question {missing.join(', ')} {missing.length === 1 ? 'has' : 'have'} no answer yet. Nothing was graded and this attempt does not count.
                  <QuestionLinks ns={missing} />
                </Notice>
              )}
              {error && <Notice tone="rust" title="Not submitted">{error}</Notice>}
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 14 }}>
                {c.questions.map((q, i) => {
                  const n = i + 1;
                  const wrong = graded?.wrong.includes(n);
                  const unanswered = missing.includes(n) && answers[q.id] === undefined;
                  return (
                    <li key={q.id} id={`learning-q${n}`}>
                      <fieldset style={{ ...card, margin: 0, border: `1px solid ${unanswered || wrong ? dt.rust : dt.cardBorder}`, display: 'grid', gap: 10 }} disabled={!!graded}>
                        <legend style={{ padding: 0, float: 'left', width: '100%', display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.45, flex: '1 1 300px' }}>
                            <span className="nt20-num" style={{ color: dt.gold, marginRight: 8 }}>{n}.</span>
                            {q.prompt}
                          </span>
                          {wrong && <Tag tone="rust">Not right</Tag>}
                          {graded && !wrong && <Tag tone="green">Right</Tag>}
                          {unanswered && <Tag tone="rust">No answer</Tag>}
                          {changed.includes(n) && <Tag tone="gold">Changed</Tag>}
                        </legend>
                        <div style={{ display: 'grid', gap: 8, clear: 'both' }}>
                          {q.options.map((o, k) => {
                            const on = answers[q.id] === k;
                            return (
                              <label key={k} className="nt20-radio" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minHeight: 44, padding: '10px 12px', borderRadius: 9, border: `1px solid ${on ? dt.brightGold : dt.inputBorder}`, background: on ? '#FBF6EA' : dt.cardBg, cursor: graded ? 'default' : 'pointer', fontSize: 15, lineHeight: 1.45, boxSizing: 'border-box' }}>
                                <input type="radio" name={`q${q.id}`} checked={on} onChange={() => setAnswers({ ...answers, [q.id]: k })} />
                                <span aria-hidden className="nt20-dot" />
                                <span style={{ fontWeight: on ? 600 : 400 }}>{o}</span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    </li>
                  );
                })}
              </ol>
              {!graded && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <Btn onClick={send} disabled={submit.isPending}>Submit answers</Btn>
                  <span className="nt20-num" style={muted}>{c.questions.filter((q) => answers[q.id] !== undefined).length} of {c.questions.length} answered</span>
                </div>
              )}
            </div>
          </Shell>
        );
      }}
    </Gatekeeper>
  );
}

const NOTE_MAX = 500;

export function LearningCompletionScreen() {
  const program = useProgram();
  return (
    <Gatekeeper program={program}>
      {(p) => (p.completedAt ? <CompletionView p={p} viewer={program.viewer} /> : <Navigate to={LEARN.path} replace />)}
    </Gatekeeper>
  );
}

function CompletionView({ p, viewer }: { p: ProgramState; viewer: { nav: NavKey; active: string } }) {
  const qc = useQueryClient();
  const { state } = useApp();
  const [note, setNote] = useState('');
  const [confirmAsked, setConfirmAsked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const send = useMutation({
    mutationFn: () => learning.sendRequest(note),
    onSuccess: () => qc.invalidateQueries({ queryKey: learningKeys.state }),
    onError: (err) => {
      const f = refusalOf(err);
      if (f.code === 'confirm-email') setConfirmAsked(true);
      else if (f.code === 'request-exists' || f.code === 'already-leader') qc.invalidateQueries({ queryKey: learningKeys.state });
      else setError(f.message);
    },
  });
  const r = p.request;
  const leaderCard = p.isLeader && r?.status !== 'approved' && r?.status !== 'already-in-program';
  const canRequest = !p.isLeader && (!r || r.status === 'declined');
  const email = state.userEmail;
  return (
    <Shell nav={viewer.nav} active={viewer.active}>
      <div style={{ display: 'grid', gap: 26, paddingTop: 12 }} data-testid="learning-completion">
        <BackLink to={LEARN.path}>Your path</BackLink>
        <header style={{ display: 'grid', gap: 10 }}>
          <h1 style={h1}>You completed the program</h1>
          <p style={lead}>Completed on {formatDate(day(p.completedAt ?? ''))}. This record stays with your account.</p>
        </header>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', alignItems: 'start' }}>
          <section aria-label="Your scores">
            <Rows>
              {p.modules.map((m, i) => (
                <Row key={m.id} first={i === 0} style={{ justifyContent: 'space-between' }}>
                  <span style={{ minWidth: 0, flex: '1 1 200px', fontSize: 15 }}>
                    <span className="nt20-num" style={{ color: dt.gold, marginRight: 10, fontFamily: dt.serif, fontSize: 17 }}>{i + 1}</span> {m.title}
                  </span>
                  {m.bestScore === null ? <Tag tone="grey">Not yet taken</Tag> : <span className="nt20-num" style={{ fontWeight: 700, fontSize: 15 }}>{pct(m.bestScore)}</span>}
                </Row>
              ))}
            </Rows>
            <p style={{ ...muted, fontSize: 13, marginTop: 10 }}>Best score in each module's check. A module added later shows as not yet taken and does not change your completion.</p>
          </section>
          <section className="nt20-request-first" style={{ ...panel, display: 'grid', gap: 14 }} aria-label="Join the coaching program" data-testid="learning-join">
            <h2 style={h2}>{leaderCard ? 'You are already a coaching leader' : 'Join the coaching program'}</h2>
            {leaderCard && <p style={{ ...muted, color: dt.body }}>Your account already belongs to the coaching program, so there is nothing to request. Your dashboard is where it was.</p>}
            {!leaderCard && r?.status === 'open' && (
              <>
                <p><Tag tone="gold">Request open · sent {formatDate(day(r.sentAt))}</Tag></p>
                <p style={{ ...muted, color: dt.body }}>An admin will read it. The answer shows here; nothing else is needed from you.</p>
                {r.note && <blockquote style={{ margin: 0, padding: '2px 0 2px 14px', borderLeft: `1px solid ${dt.brightGold}`, fontFamily: dt.serif, fontSize: 16, lineHeight: 1.6, color: dt.body, overflowWrap: 'anywhere' }}>{r.note}</blockquote>}
              </>
            )}
            {!leaderCard && r?.status === 'approved' && (
              <>
                <p><Tag tone="green">Approved · {formatDate(day(r.answeredAt ?? r.sentAt))}</Tag></p>
                <p style={{ ...muted, color: dt.body }}>You are in the coaching program. An invitation went to {email}. The next time you open Coach, your leader dashboard is there.</p>
                <div><Btn kind="dark" to="/coach">Open Coach</Btn></div>
              </>
            )}
            {!leaderCard && r?.status === 'already-in-program' && (
              <>
                <p><Tag tone="blue">Already in the program</Tag></p>
                <p style={{ ...muted, color: dt.body }}>This account's address already belongs to a leader in the coaching program, so no new place was needed. Open Coach to reach your leader dashboard.</p>
                <div><Btn kind="dark" to="/coach">Open Coach</Btn></div>
              </>
            )}
            {!leaderCard && r?.status === 'declined' && (
              <div style={{ display: 'grid', gap: 8 }}>
                <p><Tag tone="rust">Declined · {formatDate(day(r.answeredAt ?? r.sentAt))}</Tag></p>
                {r.reason && <blockquote style={{ margin: 0, padding: '2px 0 2px 14px', borderLeft: `1px solid ${dt.rust}`, fontSize: 14.5, lineHeight: 1.55, color: dt.body }}>{r.reason}</blockquote>}
                <p style={muted}>You can send a new request whenever you are ready.</p>
              </div>
            )}
            {canRequest && (!p.addressConfirmed || confirmAsked) && (
              <Notice tone="gold" title="Confirm your email address first" action={<ConfirmButton />}>
                A request needs a confirmed address, because an approved request makes {email} a leader's sign-in. We send a link to that address; open it in this browser.
              </Notice>
            )}
            {canRequest && p.addressConfirmed && !confirmAsked && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send.mutate();
                }}
                style={{ display: 'grid', gap: 12 }}
              >
                <p style={{ ...muted, color: dt.body }}>An admin reads each request and, when it is a fit, adds you as a leader. The invitation goes to {email}.</p>
                {error && <Notice tone="rust" title="Not sent">{error}</Notice>}
                <Field label="A note for the admin (optional)" count={`${note.length} / ${NOTE_MAX}`}>
                  <textarea value={note} maxLength={NOTE_MAX} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Your group, your church, when you hope to start" style={{ ...input, minHeight: 110, resize: 'vertical', lineHeight: 1.5 }} data-testid="learning-request-note" />
                </Field>
                <div><Btn type="submit" disabled={send.isPending}>Send request</Btn></div>
              </form>
            )}
          </section>
        </div>
      </div>
    </Shell>
  );
}

function ConfirmButton() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  if (state === 'sent') return <span role="status" style={{ fontSize: 13.5, fontWeight: 600, color: dt.green }}>Sent. The link works for one hour.</span>;
  return (
    <span style={{ display: 'grid', gap: 6 }}>
      <Btn
        kind="dark"
        disabled={state === 'sending'}
        onClick={async () => {
          setState('sending');
          try {
            await sendVerificationEmail();
            setState('sent');
          } catch {
            setState('failed');
          }
        }}
      >
        Send the confirmation email
      </Btn>
      {state === 'failed' && <span role="alert" style={{ fontSize: 13, color: dt.rust }}>The email could not be sent. Try again in a moment.</span>}
    </span>
  );
}
