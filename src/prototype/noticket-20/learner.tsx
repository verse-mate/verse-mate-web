import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, GraduationCap, Lock } from 'lucide-react';
import { dt } from '@/components/coach/dashboardTheme';
import ConfirmEmailGate from '@/components/coach/ConfirmEmailGate';
import { BackLink, Btn, Field, Loading, Markdown, Notice, P, Progress, Row, Rows, STEP_WORD, Shell, StepMark, type StepState, Tag, formatDate, h1, h2, h3, input, lead, muted, pct, to, useData } from './ui';

type Viewer = 'learner' | 'leader' | 'admin';

type ModuleView = {
  id: string;
  n: number;
  title: string;
  summary: string;
  passMark: number;
  state: 'passed' | 'current' | 'open' | 'locked';
  best: number | null;
  isNew?: boolean;
  lessons: { id: string; title: string; minutes: number; state: StepState; isNew?: boolean }[];
  check: { state: StepState; questions: number };
};

type ProgramView = {
  open: boolean;
  viewer: Viewer;
  enrolledOn: string | null;
  passed: number;
  total: number;
  hours: number;
  next: { kind: 'lesson' | 'check'; module: number; lesson?: number; title: string } | null;
  completedOn: string | null;
  request: RequestView | null;
  modules: ModuleView[];
};

type RequestView = { state: 'open' | 'approved' | 'declined' | 'already'; sentOn: string; answeredOn?: string; note?: string; reason?: string };

const navFor = (v: Viewer) => (v === 'learner' ? 'learner' : v === 'leader' ? 'leader' : 'admin');
const activeFor = (v: Viewer) => (v === 'admin' ? 'program' : 'learning');

const card: CSSProperties = { border: `1px solid ${dt.cardBorder}`, borderRadius: 14, padding: 'clamp(18px, 3vw, 26px)', background: dt.cardBg };
const panel: CSSProperties = { background: dt.innerBg, border: `1px solid ${dt.cardBorder}`, borderRadius: 14, padding: '20px 22px' };

function Facts({ program }: { program: ProgramView }) {
  const lessons = program.modules.reduce((n, m) => n + m.lessons.length, 0);
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '10px 22px', flexWrap: 'wrap', fontSize: 14, color: dt.body }}>
      <li style={{ display: 'flex', alignItems: 'center', gap: 7 }}><BookOpen size={16} aria-hidden color={dt.gold} /> <span className="nt20-num">{program.total} modules, {lessons} lessons</span></li>
      <li style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Clock size={16} aria-hidden color={dt.gold} /> <span className="nt20-num">About {program.hours} hours, at your own pace</span></li>
      <li style={{ display: 'flex', alignItems: 'center', gap: 7 }}><GraduationCap size={16} aria-hidden color={dt.gold} /> A short check after each module</li>
    </ul>
  );
}

function PrivacyNote() {
  return (
    <p style={{ ...muted, fontSize: 13.5 }}>
      Program admins see your name, your email address and your progress. They use them to follow the program and to answer a request to join.
    </p>
  );
}

export function GateScreen({ variant }: { variant: 'offer-new' | 'offer-started' | 'confirm-address' | 'signed-out' }) {
  const program = useData<ProgramView>('/coach/program');
  if (variant === 'signed-out') {
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
  if (!program.data) return <Shell nav={null}><Loading /></Shell>;
  const p = program.data;
  const started = variant === 'offer-started';
  const offer = (
    <div style={{ ...card, display: 'grid', gap: 16, textAlign: 'left', maxWidth: 620, width: '100%', boxSizing: 'border-box' }}>
      <h2 style={h2}>{started ? 'Continue the learning program' : 'Learn to lead a Bible study'}</h2>
      {started ? (
        <>
          <Progress passed={p.passed} total={p.total} />
          {p.next && <p style={{ ...muted, color: dt.body }}>Next: Module {p.next.module}{p.next.lesson ? `, lesson ${p.next.lesson}` : ''}, <em>{p.next.title}</em>.</p>}
        </>
      ) : (
        <>
          <p style={lead}>The learning program is open to anyone with a VerseMate account. It teaches how to lead a study the way Coach looks at one: how to open, how to read Scripture together, how to ask questions that land, how to pray and how to welcome someone new.</p>
          <Facts program={p} />
          <p style={{ ...muted, color: dt.body }}>At the end you hold a completion record, and you can ask to join the coaching program.</p>
        </>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Btn kind={variant === 'confirm-address' ? 'outline' : 'primary'} to={started ? to.path : to.start}>{started ? 'Open the program' : 'Start the learning program'}</Btn>
        <Btn kind="outline" to="/read">Back to reading</Btn>
      </div>
    </div>
  );
  if (variant === 'confirm-address') {
    return (
      <Shell nav="learner">
        <Centered>
          <ConfirmEmailGate container={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }} title={{ ...h2, fontSize: 26 }} body={{ ...lead, textAlign: 'center', maxWidth: '46ch' }} button={{ ...(btnDark as CSSProperties) }} iconColor={dt.gold} />
          <div style={{ width: '100%', maxWidth: 620, borderTop: `1px solid ${dt.border2}`, margin: '18px 0 4px' }} />
          <p style={{ ...muted, maxWidth: 620, textAlign: 'left', width: '100%' }}>The learning program needs no confirmation to start.</p>
          {offer}
        </Centered>
      </Shell>
    );
  }
  return (
    <Shell nav="learner">
      <Centered>
        <p style={{ ...muted, maxWidth: 620, width: '100%', textAlign: 'left' }}>This account is not in the coaching program yet.</p>
        {offer}
      </Centered>
    </Shell>
  );
}

const btnDark = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, padding: '0 20px', borderRadius: 10, border: 'none', background: dt.darkBg, color: dt.goldChip, fontSize: 14, fontWeight: 700, cursor: 'pointer' };

function Centered({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 'clamp(32px, 6vw, 64px) 0 16px', textAlign: 'center' }}>{children}</div>;
}

export function StartScreen() {
  const program = useData<ProgramView>('/coach/program');
  if (!program.data) return <Shell nav="learner"><Loading /></Shell>;
  const p = program.data;
  if (!p.open) {
    return (
      <Shell nav="learner" active="learning">
        <Centered>
          <Lock size={40} color={dt.textLight} strokeWidth={1.5} aria-hidden />
          <h1 style={{ ...h2, fontSize: 28 }}>The learning program is not open right now</h1>
          <p style={{ ...lead, textAlign: 'center', maxWidth: '50ch' }}>The program team is preparing it. Nothing can be started until it opens again.</p>
          {p.completedOn && (
            <div style={{ ...panel, textAlign: 'left', maxWidth: 560, display: 'grid', gap: 6 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>Your record is kept</p>
              <p style={{ ...muted, color: dt.body }}>You completed the program on {formatDate(p.completedOn)}{p.request?.state === 'open' ? ', and your request to join the coaching program is still open: an admin can answer it while the program is closed.' : '.'} When it reopens you will find everything where you left it.</p>
            </div>
          )}
          <Btn kind="outline" to="/read">Back to reading</Btn>
        </Centered>
      </Shell>
    );
  }
  return (
    <Shell nav="learner" active="learning">
      <div style={{ display: 'grid', gap: 28, paddingTop: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 18, gridColumn: 'span 2', minWidth: 0 }} className="nt20-span">
          <h1 style={h1}>Learning to lead a Bible study</h1>
          <p style={lead}>Six modules drawn from the Leader's Guide and from the twelve things Coach looks for in a session. Each module is a few short lessons and a check of five questions. Lessons open one after another, so there is always one clear next step.</p>
          <Facts program={p} />
          <PrivacyNote />
          <div><Btn to={to.lesson}>Start the program</Btn></div>
          <ol style={{ margin: '6px 0 0', padding: 0, listStyle: 'none' }}>
            {p.modules.map((m, i) => (
              <li key={m.id} style={{ display: 'flex', gap: 14, padding: '12px 0', borderTop: i ? `1px solid ${dt.rowDivider}` : 'none', alignItems: 'baseline' }}>
                <span className="nt20-num" style={{ fontFamily: dt.serif, fontSize: 18, color: dt.gold, minWidth: 22 }}>{m.n}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: 15.5 }}>{m.title}</span>
                  <span style={{ ...muted, display: 'block' }}>{m.lessons.length} lessons and a check</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <aside style={{ ...panel, display: 'grid', gap: 14 }}>
          <h2 style={h3}>Before you start</h2>
          <p style={{ ...muted, color: dt.body }}>At the end you hold a completion record with the date and your best score in each module. You can then ask to join the coaching program; an admin reads every request.</p>
        </aside>
      </div>
      <style>{'@media (max-width: 760px){.nt20-span{grid-column:auto !important}}'}</style>
    </Shell>
  );
}

function moduleTag(m: ModuleView) {
  if (m.isNew && m.state !== 'locked') return <Tag tone="gold">New</Tag>;
  if (m.state === 'passed') return <Tag tone="green">Passed · best {pct(m.best ?? 0)}</Tag>;
  if (m.state === 'current') return <Tag tone="gold">In progress</Tag>;
  if (m.state === 'open') return <Tag tone="gold">Open</Tag>;
  return <Tag tone="grey"><Lock size={11} aria-hidden /> Locked</Tag>;
}

function ModuleBlock({ m }: { m: ModuleView }) {
  const [open, setOpen] = useState(false);
  const lessonHref = (s: StepState) => (s === 'locked' ? `${P}/lesson/locked` : s === 'done' ? to.lessonDone : to.lesson);
  const expanded = m.state === 'current' || m.state === 'open' || m.lessons.some((l) => l.isNew || (m.state === 'locked' && l.state !== 'locked'));
  const checkHref = m.check.state === 'locked' ? `${P}/check/locked` : m.check.state === 'done' ? `${P}/check/passed` : to.check;
  const steps = (
    <ol style={{ margin: 0, padding: 0, listStyle: 'none', borderTop: `1px solid ${dt.rowDivider}` }}>
      {m.lessons.map((l, i) => (
        <li key={l.id} style={{ borderBottom: `1px solid ${dt.rowDivider}` }}>
          <StepRow state={l.state} href={lessonHref(l.state)} title={l.title} meta={`Lesson ${i + 1} · ${l.minutes} min`} isNew={l.isNew} />
        </li>
      ))}
      <li>
        <StepRow state={m.check.state} href={checkHref} title="Module check" meta={`${m.check.questions} questions · pass mark ${m.passMark}%`} word={m.check.state === 'done' ? `Passed ${pct(m.best ?? 0)}` : m.check.state === 'locked' ? 'After the lessons' : undefined} />
      </li>
    </ol>
  );
  return (
    <li style={{ ...card, listStyle: 'none', display: 'grid', gap: 12, background: m.state === 'locked' ? dt.innerBg : dt.cardBg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: '1 1 260px' }}>
          <h3 style={{ ...h3, overflowWrap: 'anywhere' }}>
            <span className="nt20-num" style={{ color: dt.goldHover, marginRight: 10 }}>{m.n}</span>{' '}
            {m.title}
          </h3>
          <p style={{ ...muted, marginTop: 6 }}>{m.summary}</p>
        </div>
        {moduleTag(m)}
      </div>
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
        <p className="nt20-num" style={{ ...muted, fontSize: 13.5 }}>{m.lessons.length} lessons and a check of {m.check.questions} questions. Opens when Module {m.n - 1} is passed.</p>
      )}
    </li>
  );
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

export function PathScreen() {
  const program = useData<ProgramView>('/coach/program');
  if (!program.data) return <Shell nav="learner"><Loading /></Shell>;
  const p = program.data;
  const nextHref = p.next?.kind === 'check' ? to.check : to.lesson;
  const newModules = p.modules.filter((m) => m.isNew);
  const allLessons = p.modules.flatMap((m) => m.lessons);
  const doneLessons = allLessons.filter((l) => l.state === 'done').length;
  const newAhead = !p.completedOn && p.modules.some((m) => m.isNew || m.lessons.some((l) => l.isNew && l.state === 'next'));
  return (
    <Shell nav={navFor(p.viewer)} active={activeFor(p.viewer)}>
      <div style={{ display: 'grid', gap: 26, paddingTop: 30 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <h1 style={h1}>Learning to lead a Bible study</h1>
          <Progress passed={p.passed} total={p.total} done={doneLessons} lessons={allLessons.length} />
        </div>
        {p.completedOn ? (
          <div style={{ ...card, background: dt.darkBg, border: 'none', color: dt.darkText, display: 'flex', gap: 18, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0, flex: '1 1 300px' }}>
              <h2 style={{ ...h2, color: dt.darkText }}>You completed the program on {formatDate(p.completedOn)}</h2>
              {newModules.length > 0 && p.next && (
                <p style={{ margin: '8px 0 0', fontSize: 14.5, lineHeight: 1.55, color: dt.darkMuted }}>
                  A new module was added since: <em style={{ color: dt.darkText }}>{newModules[0].title}</em>. It is open to you and does not change your completion.
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {newModules.length > 0 && <Btn to={to.lesson}>Start the new module</Btn>}
              <Btn kind={newModules.length ? 'outline' : 'primary'} to={to.completion} style={newModules.length ? { background: 'transparent', color: dt.darkText, borderColor: dt.darkMuted2 } : undefined}>See your record</Btn>
            </div>
          </div>
        ) : (
          p.next && (
            <div style={{ ...card, background: dt.darkBg, border: 'none', color: dt.darkText, display: 'flex', gap: 18, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0, flex: '1 1 300px' }}>
                <p className="nt20-num" style={{ margin: 0, fontSize: 13.5, color: dt.darkMuted }}>
                  {p.next.kind === 'check' ? `Module ${p.next.module} check` : `Module ${p.next.module}, lesson ${p.next.lesson}`}
                </p>
                <h2 style={{ ...h2, color: dt.darkText, marginTop: 4, overflowWrap: 'anywhere' }}>{p.next.title}</h2>
                {newAhead && <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.55, color: dt.darkMuted }}>New: the program team added this step ahead of where you were. The lessons you finished stay done.</p>}
              </div>
              <Btn to={nextHref}>{p.next.kind === 'check' ? 'Take the check' : 'Continue'}</Btn>
            </div>
          )
        )}
        <div style={{ display: 'grid', gap: 24, maxWidth: 820 }}>
          <ol style={{ margin: 0, padding: 0, display: 'grid', gap: 14, minWidth: 0 }} aria-label="Modules">
            {p.modules.map((m) => <ModuleBlock key={m.id} m={m} />)}
          </ol>
          <aside style={{ ...panel, display: 'grid', gap: 12 }}>
            <h2 style={h3}>At the end</h2>
            <p style={{ ...muted, color: dt.body }}>A completion record with the date and your best score in each module. You can then ask to join the coaching program; an admin reads every request.</p>
            {p.viewer === 'leader' && <p style={{ ...muted, color: dt.body }}>You already lead a group in Coach. Taking the program changes nothing there: your dashboard, sessions and upload page stay as they are.</p>}
            <p style={muted}>Started on {p.enrolledOn ? formatDate(p.enrolledOn) : 'today'}.</p>
            <PrivacyNote />
          </aside>
        </div>
      </div>
    </Shell>
  );
}

type LessonView = {
  draft?: boolean;
  locked?: { title: string; module: number; lesson: number };
  module: { n: number; title: string };
  n: number;
  of: number;
  title: string;
  minutes: number;
  video: { src: string; poster: string; duration: string } | null;
  passages: { ref: string; href: string }[];
  body: string;
  done: boolean;
  next: { label: string; title: string; kind: 'lesson' | 'check' } | null;
};

export function LessonView({ l }: { l: LessonView }) {
  return (
    <article style={{ display: 'grid', gap: 22 }}>
      <header style={{ display: 'grid', gap: 10 }}>
        {l.draft && <span><Tag tone="rust">Draft · learners cannot open this lesson</Tag></span>}
        <h1 style={{ ...h1, overflowWrap: 'anywhere' }}>{l.title}</h1>
        <p className="nt20-num" style={muted}>
          Module {l.module.n}, {l.module.title} · Lesson {l.n} of {l.of} · {l.minutes} min
        </p>
      </header>
      <div className="nt20-lesson">
        <aside aria-labelledby="nt20-passages" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <h2 id="nt20-passages" style={{ fontSize: 14, fontWeight: 700, margin: '0 6px 0 0' }}>Passages</h2>
          {l.passages.map((ps) => (
            <a key={ps.ref} href={ps.href} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', minHeight: 44, padding: '10px 14px', border: `1px solid ${dt.cardBorder}`, borderRadius: 10, textDecoration: 'none', color: dt.textPrimary, background: dt.innerBg }}>
              <span style={{ fontFamily: dt.serif, fontSize: 17, whiteSpace: 'nowrap' }}>{ps.ref}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: dt.goldHover, whiteSpace: 'nowrap' }}>Open in the reader</span>
            </a>
          ))}
        </aside>
        <div style={{ minWidth: 0, display: 'grid', gap: 24 }}>
          {l.video && (
            <figure style={{ margin: 0 }}>
              <video controls preload="none" poster={l.video.poster} style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: 12, background: dt.darkBg, display: 'block' }} aria-label={`Lesson video, ${l.video.duration}`}>
                <source src={l.video.src} type="video/mp4" />
              </video>
              <figcaption className="nt20-num" style={{ ...muted, fontSize: 13, marginTop: 8 }}>Video · {l.video.duration}</figcaption>
            </figure>
          )}
          <Markdown source={l.body} />
        </div>
      </div>
    </article>
  );
}

function DoneNotice({ l }: { l: LessonView }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div ref={ref} tabIndex={-1} style={{ outline: 'none' }}>
      <Notice tone="green" title="Lesson done" action={l.next && <Btn to={l.next.kind === 'check' ? to.check : to.lesson}>{l.next.kind === 'check' ? 'Take the check' : 'Next lesson'}</Btn>}>
        {l.next ? <>Next: {l.next.label}, <em>{l.next.title}</em>.</> : 'This was the last step of the program.'}
      </Notice>
    </div>
  );
}

export function LessonScreen() {
  const lesson = useData<LessonView>('/coach/program/lessons/l-1-3');
  const navigate = useNavigate();
  if (!lesson.data) return <Shell nav="learner"><Loading /></Shell>;
  const l = lesson.data;
  if (l.locked) {
    return (
      <Shell nav="learner" active="learning">
        <div style={{ paddingTop: 12 }}><BackLink to={to.path}>Your path</BackLink></div>
        <Centered>
          <Lock size={40} color={dt.textLight} strokeWidth={1.5} aria-hidden />
          <h1 style={{ ...h2, fontSize: 28 }}>This lesson is locked</h1>
          <p style={{ ...lead, textAlign: 'center', maxWidth: '48ch' }}>
            Lessons open in order. Finish Module {l.locked.module}, lesson {l.locked.lesson}, <em>{l.locked.title}</em>, first.
          </p>
          <Btn to={to.lesson}>Go to lesson {l.locked.lesson}</Btn>
        </Centered>
      </Shell>
    );
  }
  return (
    <Shell nav="learner" active="learning">
      <div style={{ display: 'grid', gap: 18, paddingTop: 12 }}>
        <BackLink to={to.path}>Your path</BackLink>
        {l.done && <DoneNotice l={l} />}
        <LessonView l={l} />
        <div style={{ borderTop: `1px solid ${dt.border2}`, paddingTop: 22 }}>
          {l.done ? (
            l.next && <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Btn to={l.next.kind === 'check' ? to.check : to.lesson}>{l.next.kind === 'check' ? 'Take the check' : 'Next lesson'}</Btn></div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <p style={muted}>Read it through{l.video ? ' and watch the video' : ''}, then mark it done to open the next step.</p>
              <Btn onClick={() => { navigate(to.lessonDone); window.scrollTo(0, 0); }}>Mark as done</Btn>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

type CheckView = {
  module: { n: number; title: string };
  passMark: number;
  questions: { n: number; text: string; options: string[] }[];
  answers?: Record<string, number>;
  attempt?: { score: number; passed: boolean; right: number; wrong: number[]; best: number; attempt: number };
  refusal?: { kind: 'incomplete'; questions: number[] } | { kind: 'changed'; questions: number[] } | { kind: 'locked'; lessons: string[] };
  next?: { module: number; title: string } | null;
};

export function CheckScreen() {
  const check = useData<CheckView>('/coach/program/checks/m-1');
  const navigate = useNavigate();
  const [picked, setPicked] = useState<Record<string, number> | null>(null);
  if (!check.data) return <Shell nav="learner"><Loading /></Shell>;
  const c = check.data;
  const answers = picked ?? c.answers ?? {};
  const graded = c.attempt;
  const missing = c.refusal?.kind === 'incomplete' ? c.refusal.questions : [];
  const changed = c.refusal?.kind === 'changed' ? c.refusal.questions : [];
  const header = (
    <header style={{ display: 'grid', gap: 10 }}>
      <h1 style={h1}>Module {c.module.n} check</h1>
      <p className="nt20-num" style={muted}>{c.module.title} · {c.questions.length} questions · pass mark {c.passMark}% · retake as often as you like</p>
    </header>
  );
  if (c.refusal?.kind === 'locked') {
    return (
      <Shell nav="learner" active="learning">
        <div style={{ paddingTop: 12 }}><BackLink to={to.path}>Your path</BackLink></div>
        <Centered>
          <Lock size={40} color={dt.textLight} strokeWidth={1.5} aria-hidden />
          <h1 style={{ ...h2, fontSize: 28 }}>The check opens after the lessons</h1>
          <p style={{ ...lead, textAlign: 'center', maxWidth: '48ch' }}>Finish {c.refusal.lessons.length === 1 ? 'this lesson' : 'these lessons'} of Module {c.module.n} first:</p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
            {c.refusal.lessons.map((t) => <li key={t} style={{ fontFamily: dt.serif, fontSize: 18 }}>{t}</li>)}
          </ul>
          <Btn to={to.lesson}>Go to the next lesson</Btn>
        </Centered>
      </Shell>
    );
  }
  const submit = () => {
    const unanswered = c.questions.filter((q) => answers[q.n] === undefined);
    navigate(unanswered.length ? to.checkIncomplete : `${P}/check/failed`);
  };
  return (
    <Shell nav="learner" active="learning">
      <div style={{ display: 'grid', gap: 22, paddingTop: 12, maxWidth: 760 }}>
        <BackLink to={to.path}>Your path</BackLink>
        {header}
        {graded && (
          <div style={{ ...card, background: graded.passed ? dt.greenBg : dt.innerBg, border: `1px solid ${graded.passed ? '#CFE0CC' : dt.cardBorder}`, display: 'grid', gap: 10 }} role="status">
            <h2 style={{ ...h2, color: graded.passed ? dt.green : dt.textPrimary }}>{graded.passed ? `Passed. Module ${c.module.n} is done.` : `Not passed yet. You need ${c.passMark}% to pass.`}</h2>
            <p className="nt20-num" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: dt.body }}>Your score: {pct(graded.score)}</p>
            <p className="nt20-num" style={{ ...muted, color: dt.body }}>
              You answered {graded.right} of {c.questions.length} correctly{graded.passed ? `. Best score ${pct(graded.best)}, attempt ${graded.attempt}.` : '.'}
            </p>
            {!graded.passed && graded.wrong.length > 0 && (
              <p style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 14.5, color: dt.body }}>
                Look again at
                {graded.wrong.map((n) => <a key={n} href={`#nt20-q${n}`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, minWidth: 44, padding: '0 12px', borderRadius: 9, border: `1px solid ${dt.inputBorder}`, background: dt.cardBg, color: dt.textPrimary, fontWeight: 700, textDecoration: 'none' }}>Question {n}</a>)}
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              {graded.passed ? (
                c.next ? <Btn to={to.lesson}>Start Module {c.next.module}</Btn> : <Btn to={to.completion}>See your record</Btn>
              ) : (
                <Btn to={to.check}>Retake the check</Btn>
              )}
              <Btn kind="outline" to={to.path}>Back to your path</Btn>
            </div>
            {graded.passed && c.next && <p style={muted}>Module {c.next.module}, <em>{c.next.title}</em>, is now open.</p>}
          </div>
        )}
        {c.refusal?.kind === 'changed' && (
          <Notice tone="rust" title="This check changed while you were answering">
            The program team edited it after you opened it, so nothing was counted. Your answers to the questions that did not change are kept; answer question {changed.join(', ')}, then submit again.
          </Notice>
        )}
        {missing.length > 0 && (
          <Notice tone="rust" title="Answer every question before you submit">
            Question {missing.join(', ')} has no answer yet. Nothing was graded and this attempt does not count.
          </Notice>
        )}
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 14 }}>
          {c.questions.map((q) => {
            const wrong = graded?.wrong.includes(q.n);
            const unanswered = missing.includes(q.n);
            return (
              <li key={q.n} id={`nt20-q${q.n}`}>
                <fieldset style={{ ...card, margin: 0, border: `1px solid ${unanswered || wrong ? dt.rust : dt.cardBorder}`, display: 'grid', gap: 10 }} disabled={!!graded}>
                  <legend style={{ padding: 0, float: 'left', width: '100%', display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.45, flex: '1 1 300px' }}>
                      <span className="nt20-num" style={{ color: dt.gold, marginRight: 8 }}>{q.n}.</span>
                      {q.text}
                    </span>
                    {wrong && <Tag tone="rust">Not right</Tag>}
                    {graded && !wrong && <Tag tone="green">Right</Tag>}
                    {unanswered && <Tag tone="rust">No answer</Tag>}
                    {changed.includes(q.n) && <Tag tone="gold">New question</Tag>}
                  </legend>
                  <div style={{ display: 'grid', gap: 8, clear: 'both' }}>
                    {q.options.map((o, i) => {
                      const on = answers[q.n] === i;
                      return (
                        <label key={i} className="nt20-radio" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minHeight: 44, padding: '10px 12px', borderRadius: 9, border: `1px solid ${on ? dt.brightGold : dt.inputBorder}`, background: on ? '#FBF6EA' : dt.cardBg, cursor: graded ? 'default' : 'pointer', fontSize: 15, lineHeight: 1.45, boxSizing: 'border-box' }}>
                          <input type="radio" name={`q${q.n}`} checked={on} onChange={() => setPicked({ ...answers, [q.n]: i })} />
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
            <Btn onClick={submit}>Submit answers</Btn>
            <span className="nt20-num" style={muted}>{Object.keys(answers).length} of {c.questions.length} answered</span>
          </div>
        )}
      </div>
    </Shell>
  );
}

type CompletionView = {
  viewer: Viewer;
  email: string;
  addressConfirmed: boolean;
  completedOn: string;
  modules: { n: number; title: string; best: number | null }[];
  request: RequestView | null;
  draftNote?: string;
};

const NOTE_MAX = 500;

export function CompletionScreen() {
  const data = useData<CompletionView>('/coach/program/completion');
  const [note, setNote] = useState<string | null>(null);
  if (!data.data) return <Shell nav="learner"><Loading /></Shell>;
  const c = data.data;
  const text = note ?? c.draftNote ?? '';
  const r = c.request;
  const canRequest = c.viewer === 'learner' && (!r || r.state === 'declined');
  return (
    <Shell nav={navFor(c.viewer)} active={activeFor(c.viewer)}>
      <div style={{ display: 'grid', gap: 26, paddingTop: 12 }}>
        <BackLink to={to.path}>Your path</BackLink>
        <header style={{ display: 'grid', gap: 10 }}>
          <h1 style={h1}>You completed the program</h1>
          <p style={lead}>Completed on {formatDate(c.completedOn)}. This record stays with your account.</p>
        </header>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', alignItems: 'start' }}>
          <section aria-label="Your scores">
            <Rows>
              {c.modules.map((m, i) => (
                <Row key={m.n} first={i === 0} style={{ justifyContent: 'space-between' }}>
                  <span style={{ minWidth: 0, flex: '1 1 200px', fontSize: 15 }}>
                    <span className="nt20-num" style={{ color: dt.gold, marginRight: 10, fontFamily: dt.serif, fontSize: 17 }}>{m.n}</span>{' '}
                    {m.title}
                  </span>
                  {m.best === null ? <Tag tone="grey">Not yet taken</Tag> : <span className="nt20-num" style={{ fontWeight: 700, fontSize: 15 }}>{pct(m.best)}</span>}
                </Row>
              ))}
            </Rows>
            <p style={{ ...muted, fontSize: 13, marginTop: 10 }}>Best score in each module's check. A module added later shows as not yet taken and does not change your completion.</p>
          </section>
          <section style={{ ...panel, display: 'grid', gap: 14 }} aria-label="Join the coaching program">
            <h2 style={h2}>{c.viewer === 'learner' ? 'Join the coaching program' : 'You are already a coaching leader'}</h2>
            {c.viewer !== 'learner' && <p style={{ ...muted, color: dt.body }}>Your account already belongs to the coaching program, so there is nothing to request. Your dashboard is where it was.</p>}
            {r?.state === 'open' && (
              <>
                <p><Tag tone="gold">Request open · sent {formatDate(r.sentOn)}</Tag></p>
                <p style={{ ...muted, color: dt.body }}>An admin will read it. The answer shows here; nothing else is needed from you.</p>
                {r.note && <blockquote style={{ margin: 0, padding: '2px 0 2px 14px', borderLeft: `1px solid ${dt.brightGold}`, fontFamily: dt.serif, fontSize: 16, lineHeight: 1.6, color: dt.body, overflowWrap: 'anywhere' }}>{r.note}</blockquote>}
              </>
            )}
            {r?.state === 'approved' && (
              <>
                <p><Tag tone="green">Approved · {formatDate(r.answeredOn ?? r.sentOn)}</Tag></p>
                <p style={{ ...muted, color: dt.body }}>You are in the coaching program. An invitation went to {c.email}. The next time you open Coach, your leader dashboard is there.</p>
                <Btn kind="dark" to="/coach">Open Coach</Btn>
              </>
            )}
            {r?.state === 'already' && (
              <>
                <p><Tag tone="blue">Already in the program</Tag></p>
                <p style={{ ...muted, color: dt.body }}>This account's address already belongs to a leader in the coaching program, so no new place was needed. Open Coach to reach your leader dashboard.</p>
                <Btn kind="dark" to="/coach">Open Coach</Btn>
              </>
            )}
            {r?.state === 'declined' && (
              <div style={{ display: 'grid', gap: 8 }}>
                <p><Tag tone="rust">Declined · {formatDate(r.answeredOn ?? r.sentOn)}</Tag></p>
                {r.reason && <blockquote style={{ margin: 0, padding: '2px 0 2px 14px', borderLeft: `1px solid ${dt.rust}`, fontSize: 14.5, lineHeight: 1.55, color: dt.body }}>{r.reason}</blockquote>}
                <p style={muted}>You can send a new request whenever you are ready.</p>
              </div>
            )}
            {canRequest && !c.addressConfirmed && (
              <Notice tone="gold" title="Confirm your email address first" action={<ConfirmButton />}>
                A request needs a confirmed address, because an approved request makes {c.email} a leader's sign-in. We send a link to that address; open it in this browser.
              </Notice>
            )}
            {canRequest && c.addressConfirmed && (
              <form onSubmit={(e) => e.preventDefault()} style={{ display: 'grid', gap: 12 }}>
                <p style={{ ...muted, color: dt.body }}>An admin reads each request and, when it is a fit, adds you as a leader. The invitation goes to {c.email}.</p>
                <Field label="A note for the admin (optional)" count={`${text.length} / ${NOTE_MAX}`}>
                  <textarea value={text} maxLength={NOTE_MAX} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Your group, your church, when you hope to start" style={{ ...input, minHeight: 110, resize: 'vertical', lineHeight: 1.5 }} />
                </Field>
                <div><Btn type="submit">Send request</Btn></div>
              </form>
            )}
          </section>
        </div>
      </div>
    </Shell>
  );
}

function ConfirmButton() {
  const [sent, setSent] = useState(false);
  return sent ? <span role="status" style={{ fontSize: 13.5, fontWeight: 600, color: dt.green }}>Sent. The link works for one hour.</span> : <Btn kind="dark" onClick={() => setSent(true)}>Send the confirmation email</Btn>;
}

