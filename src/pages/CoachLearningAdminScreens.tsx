import { type CSSProperties, type ReactNode, useDeferredValue, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Plus, Search, Trash2, Upload } from 'lucide-react';
import { dt } from '@/components/coach/dashboardTheme';
import { useApp } from '@/contexts/AppContext';
import { learningKeys, useLearningTree } from '@/hooks/useCoachLearning';
import { BOOK_SLUGS } from '@/lib/bookSlugs';
import {
  BackLink,
  Btn,
  Dialog,
  Field,
  LEARN,
  Loading,
  Markdown,
  Notice,
  Row,
  Rows,
  Shell,
  Tag,
  day,
  formatDate,
  h1,
  h2,
  h3,
  input,
  inputError,
  lead,
  muted,
} from '@/components/coach/learning/ui';
import { CoachApiError, CoachAuthError } from '@/services/coachService';
import { type AdminLesson, type AdminModule, type AdminQuestion, type Learner, type PassageInput, learningAdmin, refusalOf, uploadVideo } from '@/services/coachLearning';
import { LessonContent } from './CoachLearningScreens';

const panel: CSSProperties = { background: dt.innerBg, border: `1px solid ${dt.cardBorder}`, borderRadius: 14, padding: 'clamp(16px, 3vw, 22px)' };

const BOOK_NAMES = 'Genesis,Exodus,Leviticus,Numbers,Deuteronomy,Joshua,Judges,Ruth,1 Samuel,2 Samuel,1 Kings,2 Kings,1 Chronicles,2 Chronicles,Ezra,Nehemiah,Esther,Job,Psalms,Proverbs,Ecclesiastes,Song of Songs,Isaiah,Jeremiah,Lamentations,Ezekiel,Daniel,Hosea,Joel,Amos,Obadiah,Jonah,Micah,Nahum,Habakkuk,Zephaniah,Haggai,Zechariah,Malachi,Matthew,Mark,Luke,John,Acts,Romans,1 Corinthians,2 Corinthians,Galatians,Ephesians,Philippians,Colossians,1 Thessalonians,2 Thessalonians,1 Timothy,2 Timothy,Titus,Philemon,Hebrews,James,1 Peter,2 Peter,1 John,2 John,3 John,Jude,Revelation'.split(',');

const BOOKS = Object.keys(BOOK_SLUGS).map((id, i) => ({ id: Number(id), name: BOOK_NAMES[i] }));

function AdminShell({ children }: { children: ReactNode }) {
  return <Shell nav="admin" active="program" wide>{children}</Shell>;
}

function Centered({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 'clamp(32px, 6vw, 64px) 0 16px', textAlign: 'center' }}>{children}</div>;
}

function AdminGate({ error, children }: { error: unknown; children: ReactNode }) {
  const { state } = useApp();
  if (!state.isSignedIn || error instanceof CoachAuthError) {
    return (
      <Shell nav={null}>
        <Centered>
          <h1 style={{ ...h2, fontSize: 28 }}>Sign in to continue</h1>
          <Btn kind="dark" to="/login">Sign in</Btn>
        </Centered>
      </Shell>
    );
  }
  if (error instanceof CoachApiError && error.status === 403) {
    return (
      <Shell nav={null}>
        <Centered>
          <h1 style={{ ...h2, fontSize: 28 }} data-testid="learning-admin-only">Only program admins can open this page</h1>
          <Btn kind="outline" to="/coach">Back to Coach</Btn>
        </Centered>
      </Shell>
    );
  }
  if (error) {
    return (
      <AdminShell>
        <Centered>
          <p style={lead}>Something went wrong loading the learning program.</p>
        </Centered>
      </AdminShell>
    );
  }
  return <>{children}</>;
}

function useTreeRefresh() {
  const qc = useQueryClient();
  return () => Promise.all([qc.invalidateQueries({ queryKey: learningKeys.admin }), qc.invalidateQueries({ queryKey: learningKeys.state })]);
}

function useAction<T>(fn: (arg: T) => Promise<unknown>, onRefused: (message: string, code?: string) => void) {
  const refresh = useTreeRefresh();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => refresh(),
    onError: (err) => {
      const f = refusalOf(err);
      onRefused(f.message, f.code);
    },
  });
}

function swap(ids: number[], i: number, j: number) {
  const out = [...ids];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

function MoveButtons({ label, first, last, onMove }: { label: string; first: boolean; last: boolean; onMove: (by: -1 | 1) => void }) {
  const s: CSSProperties = { width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${dt.inputBorder}`, borderRadius: 8, background: dt.cardBg, color: dt.textMuted, cursor: 'pointer' };
  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      <button type="button" aria-label={`Move ${label} up`} disabled={first} onClick={() => onMove(-1)} style={{ ...s, opacity: first ? 0.35 : 1 }}><ArrowUp size={16} aria-hidden /></button>
      <button type="button" aria-label={`Move ${label} down`} disabled={last} onClick={() => onMove(1)} style={{ ...s, opacity: last ? 0.35 : 1 }}><ArrowDown size={16} aria-hidden /></button>
    </span>
  );
}

function ProgramTabs({ active }: { active: 'modules' | 'learners' }) {
  const tab = (key: 'modules' | 'learners', label: string, href: string) => (
    <Link to={href} aria-current={active === key ? 'page' : undefined} style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 16px', borderRadius: 999, textDecoration: 'none', fontSize: 14, fontWeight: active === key ? 700 : 500, color: active === key ? dt.textPrimary : dt.textMuted, background: active === key ? dt.goldChip : 'transparent' }}>
      {label}
    </Link>
  );
  return (
    <nav aria-label="Learning program" style={{ display: 'flex', gap: 6, padding: 4, background: dt.fill1, borderRadius: 999, width: 'fit-content' }}>
      {tab('modules', 'Modules', LEARN.admin)}
      {tab('learners', 'Learners', LEARN.learners)}
    </nav>
  );
}

const pubTag = (published: boolean) => (published ? <Tag tone="green">Published</Tag> : <Tag tone="grey">Draft</Tag>);

export function LearningAdminScreen() {
  const tree = useLearningTree();
  const navigate = useNavigate();
  const [refusal, setRefusal] = useState<{ n: number; title: string; message: string } | null>(null);
  const modules = tree.data?.modules ?? [];
  const refresh = useTreeRefresh();
  const [orderError, setOrderError] = useState<string | null>(null);
  const order = useAction((ids: number[]) => {
    setOrderError(null);
    return learningAdmin.orderModules(ids);
  }, (message) => {
    setOrderError(message);
    refresh();
  });
  const publish = useMutation({
    mutationFn: (m: AdminModule) => learningAdmin.publishModule(m.id, !m.published),
    onSuccess: () => {
      setRefusal(null);
      refresh();
    },
    onError: (err, m) => setRefusal({ n: modules.indexOf(m) + 1, title: m.title, message: refusalOf(err).message }),
  });
  const create = useMutation({
    mutationFn: () => learningAdmin.createModule({ title: 'New module', description: '', passMark: 80 }),
    onSuccess: async ({ id }) => {
      await refresh();
      navigate(LEARN.module(id));
    },
  });
  const published = modules.filter((m) => m.published).length;
  return (
    <AdminGate error={tree.error}>
      <AdminShell>
        {!tree.data ? (
          <Loading />
        ) : (
          <div style={{ display: 'grid', gap: 22, paddingTop: 28 }} data-testid="learning-admin">
            <ProgramTabs active="modules" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <h1 style={h1}>Learning program</h1>
                <p style={lead}>
                  {modules.length ? (
                    <span className="nt20-num">
                      {modules.length} module{modules.length === 1 ? '' : 's'}, {published} published. Learners see published modules only, in this order. Edits reach every learner at once and never take away progress already earned.
                    </span>
                  ) : (
                    'Write modules and lessons here. Nothing needs a deploy.'
                  )}
                </p>
              </div>
              {modules.length > 0 && <Btn onClick={() => create.mutate()} disabled={create.isPending}><Plus size={16} aria-hidden /> New module</Btn>}
            </div>
            {orderError && <Notice tone="rust" title="Not reordered">{orderError}</Notice>}
            {refusal && (
              <Notice tone="rust" title={`Module ${refusal.n} was not changed`}>
                <em>{refusal.title}</em>: {refusal.message}. A published module needs at least one published lesson and one check question.
              </Notice>
            )}
            {modules.length === 0 ? (
              <div style={{ ...panel, display: 'grid', gap: 12, justifyItems: 'start', padding: 'clamp(24px, 5vw, 44px)' }}>
                <h2 style={h2}>No modules yet</h2>
                <p style={{ ...lead, fontSize: 15 }}>The program is invisible to everyone until you publish its first module: the coach gate and the leaders' navigation do not mention it before then.</p>
                <Btn onClick={() => create.mutate()} disabled={create.isPending}><Plus size={16} aria-hidden /> Write the first module</Btn>
              </div>
            ) : (
              <Rows>
                {modules.map((m, i) => (
                  <Row key={m.id} first={i === 0}>
                    <MoveButtons label={`module ${i + 1}`} first={i === 0} last={i === modules.length - 1} onMove={(by) => order.mutate(swap(modules.map((x) => x.id), i, i + by))} />
                    <Link to={LEARN.module(m.id)} style={{ flex: '1 1 280px', minWidth: 0, textDecoration: 'none', color: dt.textPrimary }}>
                      <span style={{ display: 'flex', gap: 8, fontWeight: 600, fontSize: 15.5, overflowWrap: 'anywhere' }}>
                        <span className="nt20-num" style={{ color: dt.goldHover, fontFamily: dt.serif, flexShrink: 0 }}>{i + 1}</span> <span>{m.title}</span>
                      </span>
                      <span className="nt20-num" style={{ display: 'block', fontSize: 13, color: dt.textMuted, marginTop: 2 }}>
                        {m.lessons.filter((l) => l.published).length} of {m.lessons.length} lessons published · {m.questions.length} questions · pass mark {m.passMark}%
                      </span>
                    </Link>
                    {pubTag(m.published)}
                    <Btn kind="outline" style={{ minWidth: 112 }} onClick={() => publish.mutate(m)} label={`${m.published ? 'Unpublish' : 'Publish'} ${m.title}`}>{m.published ? 'Unpublish' : 'Publish'}</Btn>
                  </Row>
                ))}
              </Rows>
            )}
          </div>
        )}
      </AdminShell>
    </AdminGate>
  );
}

export function LearningAdminModuleScreen() {
  const id = Number(useParams().id);
  const tree = useLearningTree();
  const navigate = useNavigate();
  const modules = tree.data?.modules ?? [];
  const index = modules.findIndex((m) => m.id === id);
  const m = modules[index];
  return (
    <AdminGate error={tree.error}>
      <AdminShell>
        {!tree.data ? <Loading /> : !m ? <Centered><p style={lead}>This module no longer exists.</p><Btn kind="outline" to={LEARN.admin}>All modules</Btn></Centered> : <ModuleEditor key={m.id} m={m} n={index + 1} onGone={() => navigate(LEARN.admin)} />}
      </AdminShell>
    </AdminGate>
  );
}

function ModuleEditor({ m, n, onGone }: { m: AdminModule; n: number; onGone: () => void }) {
  const navigate = useNavigate();
  const refresh = useTreeRefresh();
  const [title, setTitle] = useState(m.title);
  const [description, setDescription] = useState(m.description);
  const [passMark, setPassMark] = useState(String(m.passMark));
  const [notice, setNotice] = useState<{ tone: 'rust' | 'green'; title: string; body: string } | null>(null);
  const [cannotDelete, setCannotDelete] = useState<AdminLesson | 'module' | null>(null);
  const [drafts, setDrafts] = useState<number[]>([]);
  const nextDraft = useRef(0);
  const refused = (title: string) => (message: string) => setNotice({ tone: 'rust', title, body: message });
  const save = useAction(() => learningAdmin.updateModule(m.id, { title, description, passMark: Number(passMark) }), refused('Not saved'));
  const publish = useAction(() => learningAdmin.publishModule(m.id, !m.published), refused(m.published ? 'Not unpublished' : 'Not published'));
  const order = useAction((ids: number[]) => learningAdmin.orderLessons(m.id, ids), refused('Not reordered'));
  const publishLesson = useAction((l: AdminLesson) => learningAdmin.publishLesson(l.id, !l.published), refused('Not changed'));
  const deleteLesson = useMutation({
    mutationFn: (l: AdminLesson) => learningAdmin.deleteLesson(l.id),
    onSuccess: () => refresh(),
    onError: (err, l) => (l.used ? setCannotDelete(l) : refused('Not deleted')(refusalOf(err).message)),
  });
  const deleteModule = useMutation({
    mutationFn: () => learningAdmin.deleteModule(m.id),
    onSuccess: async () => {
      await refresh();
      onGone();
    },
    onError: (err) => (m.used ? setCannotDelete('module') : refused('Not deleted')(refusalOf(err).message)),
  });
  const addLesson = useMutation({
    mutationFn: () => learningAdmin.createLesson(m.id, { title: 'New lesson', body: '', passages: [] }),
    onSuccess: async ({ id }) => {
      await refresh();
      navigate(LEARN.adminLesson(id));
    },
  });
  const passMarkValid = /^\d+$/.test(passMark) && Number(passMark) >= 1 && Number(passMark) <= 100;
  const saveButton = (
    <Btn onClick={() => { setNotice(null); save.mutate(undefined); }} disabled={save.isPending || !passMarkValid}>Save changes</Btn>
  );
  return (
    <div style={{ display: 'grid', gap: 24, paddingTop: 12, maxWidth: 900 }} data-testid="learning-admin-module">
      <BackLink to={LEARN.admin}>All modules</BackLink>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={h1}>Module {n}</h1>
        {pubTag(m.published)}
        <span style={{ marginLeft: 'auto' }}>{saveButton}</span>
      </div>
      {notice && <Notice tone={notice.tone} title={notice.title}>{notice.body}</Notice>}
      <section style={{ display: 'grid', gap: 14 }} aria-label="Module details">
        <Field label="Title"><input value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} style={input} data-testid="learning-module-title" /></Field>
        <Field label="Short description" hint="One or two sentences, shown on the learner's path.">
          <textarea value={description} maxLength={2000} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ ...input, minHeight: 70, lineHeight: 1.5, resize: 'vertical' }} data-testid="learning-module-description" />
        </Field>
        <div style={{ maxWidth: 220 }}>
          <Field label="Pass mark (%)" hint="1 to 100. Changing it never takes back a pass." error={passMarkValid ? undefined : 'Use a whole number from 1 to 100.'}>
            <input type="number" min={1} max={100} value={passMark} onChange={(e) => setPassMark(e.target.value)} style={passMarkValid ? input : inputError} className="nt20-num" data-testid="learning-module-pass-mark" />
          </Field>
        </div>
      </section>
      <section style={{ display: 'grid', gap: 12 }} aria-labelledby="learning-lessons">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h2 id="learning-lessons" style={h2}>Lessons</h2>
          <Btn kind="outline" onClick={() => addLesson.mutate()} disabled={addLesson.isPending}><Plus size={16} aria-hidden /> Add a lesson</Btn>
        </div>
        {m.lessons.length === 0 ? (
          <p style={muted}>No lessons yet. A module needs at least one published lesson before it can be published.</p>
        ) : (
          <Rows>
            {m.lessons.map((l, i) => (
              <Row key={l.id} first={i === 0}>
                <MoveButtons label={`lesson ${i + 1}`} first={i === 0} last={i === m.lessons.length - 1} onMove={(by) => order.mutate(swap(m.lessons.map((x) => x.id), i, i + by))} />
                <Link to={LEARN.adminLesson(l.id)} style={{ flex: '1 1 240px', minWidth: 0, textDecoration: 'none', color: dt.textPrimary }}>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: 15 }}>{l.title}</span>
                  <span className="nt20-num" style={{ display: 'block', fontSize: 13, color: dt.textMuted, marginTop: 2 }}>
                    {l.hasVideo ? 'Video and text' : 'Text only'} · {l.used ? 'done by learners' : 'no learner has done it yet'}
                  </span>
                </Link>
                {pubTag(l.published)}
                <Btn kind="outline" style={{ minWidth: 112 }} onClick={() => { setNotice(null); publishLesson.mutate(l); }} label={`${l.published ? 'Unpublish' : 'Publish'} ${l.title}`}>{l.published ? 'Unpublish' : 'Publish'}</Btn>
                <button type="button" aria-label={`Delete ${l.title}`} onClick={() => (l.used ? setCannotDelete(l) : deleteLesson.mutate(l))} style={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', color: dt.rust, cursor: 'pointer', borderRadius: 8 }}>
                  <Trash2 size={17} aria-hidden />
                </button>
              </Row>
            ))}
          </Rows>
        )}
      </section>
      <section style={{ display: 'grid', gap: 12 }} aria-labelledby="learning-check-editor">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h2 id="learning-check-editor" style={h2}>Check</h2>
          <Btn kind="outline" onClick={() => setDrafts([...drafts, nextDraft.current++])}><Plus size={16} aria-hidden /> Add a question</Btn>
        </div>
        <p style={muted}>Two to six options per question, exactly one correct. Learners never see which one; they see which questions they got wrong. A learner who passed keeps the pass and the best score whatever you change here.</p>
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 12 }}>
          {m.questions.map((q, i) => <li key={q.id}><QuestionEditor moduleId={m.id} n={i + 1} q={q} /></li>)}
          {drafts.map((draft, i) => (
            <li key={`draft-${draft}`}><QuestionEditor moduleId={m.id} n={m.questions.length + i + 1} onSaved={() => setDrafts((d) => d.filter((x) => x !== draft))} /></li>
          ))}
        </ol>
      </section>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', borderTop: `1px solid ${dt.border2}`, paddingTop: 20 }}>
        {saveButton}
        <Btn kind="outline" onClick={() => { setNotice(null); publish.mutate(undefined); }} disabled={publish.isPending}>{m.published ? 'Unpublish module' : 'Publish module'}</Btn>
        <Btn kind="danger" style={{ marginLeft: 'auto' }} onClick={() => (m.used ? setCannotDelete('module') : deleteModule.mutate())}>Delete module</Btn>
      </div>
      {cannotDelete && (
        <Dialog title={cannotDelete === 'module' ? 'This module cannot be deleted' : 'This lesson cannot be deleted'} focusTitle onClose={() => setCannotDelete(null)}>
          <p style={{ ...muted, color: dt.body, margin: '0 0 18px' }}>
            {cannotDelete === 'module' ? 'Learners have submitted its check' : <>Learners have marked <em>{cannotDelete.title}</em> done</>}, and their progress points at it. Unpublish it instead: it leaves the path and the totals, and nobody loses what they earned.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(cannotDelete === 'module' ? m.published : cannotDelete.published) && (
              <Btn
                onClick={() => {
                  if (cannotDelete === 'module') publish.mutate(undefined);
                  else publishLesson.mutate(cannotDelete);
                  setCannotDelete(null);
                }}
              >
                Unpublish the {cannotDelete === 'module' ? 'module' : 'lesson'}
              </Btn>
            )}
            <Btn kind="outline" onClick={() => setCannotDelete(null)}>Keep it</Btn>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function QuestionEditor({ moduleId, n, q, onSaved }: { moduleId: number; n: number; q?: AdminQuestion; onSaved?: () => void }) {
  const [prompt, setPrompt] = useState(q?.prompt ?? '');
  const [options, setOptions] = useState<string[]>(q?.options ?? ['', '']);
  const [correct, setCorrect] = useState(q?.correct ?? -1);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const refresh = useTreeRefresh();
  const body = () => ({ prompt, options, correct });
  const save = useMutation({
    mutationFn: (): Promise<unknown> => (q ? learningAdmin.updateQuestion(q.id, body()) : learningAdmin.createQuestion(moduleId, body())),
    onSuccess: async () => {
      setError(null);
      setSaved(true);
      await refresh();
      onSaved?.();
    },
    onError: (err) => {
      setSaved(false);
      setError(refusalOf(err).message);
    },
  });
  const remove = useMutation({
    mutationFn: () => learningAdmin.deleteQuestion(q.id),
    onSuccess: () => refresh(),
    onError: (err) => setError(refusalOf(err).message),
  });
  const setOption = (i: number, text: string) => setOptions(options.map((o, k) => (k === i ? text : o)));
  const dropOption = (i: number) => {
    setOptions(options.filter((_, k) => k !== i));
    setCorrect(correct === i ? -1 : correct > i ? correct - 1 : correct);
  };
  return (
    <div data-testid={`learning-question-${n}`} style={{ border: `1px solid ${error ? dt.rust : dt.cardBorder}`, borderRadius: 12, padding: '14px 16px', display: 'grid', gap: 8 }}>
      <Field label={`Question ${n}`}>
        <input value={prompt} maxLength={1000} onChange={(e) => { setSaved(false); setPrompt(e.target.value); }} style={input} data-testid="learning-question-prompt" />
      </Field>
      <div role="radiogroup" aria-label={`Correct option for question ${n}`} style={{ display: 'grid', gap: 6 }}>
        {options.map((o, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label className="nt20-radio" style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, cursor: 'pointer' }}>
              <input type="radio" name={`key-${moduleId}-${n}`} checked={correct === i} onChange={() => { setSaved(false); setCorrect(i); }} aria-label={`Option ${i + 1} is correct`} />
              <span aria-hidden className="nt20-dot" style={{ marginTop: 0 }} />
            </label>
            <input value={o} maxLength={500} onChange={(e) => { setSaved(false); setOption(i, e.target.value); }} aria-label={`Option ${i + 1}`} style={{ ...input, flex: 1 }} data-testid="learning-question-option" />
            {correct === i && <Tag tone="green">Correct</Tag>}
            <button type="button" aria-label={`Remove option ${i + 1}`} disabled={options.length <= 2} onClick={() => dropOption(i)} style={{ width: 44, height: 44, border: 'none', background: 'transparent', color: dt.rust, cursor: 'pointer', opacity: options.length <= 2 ? 0.35 : 1 }}>
              <Trash2 size={16} aria-hidden />
            </button>
          </div>
        ))}
      </div>
      {error && <p role="alert" style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: dt.rust }}>Not saved: {error}</p>}
      {saved && !error && <p role="status" style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: dt.green }}>Saved.</p>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Btn kind="outline" disabled={options.length >= 6} onClick={() => setOptions([...options, ''])}><Plus size={16} aria-hidden /> Add an option</Btn>
        <Btn onClick={() => save.mutate()} disabled={save.isPending}>Save question</Btn>
        {q && <Btn kind="danger" onClick={() => remove.mutate()} disabled={remove.isPending}>Delete question</Btn>}
      </div>
    </div>
  );
}

function findLesson(modules: AdminModule[], id: number) {
  for (const [i, m] of modules.entries()) {
    const j = m.lessons.findIndex((l) => l.id === id);
    if (j >= 0) return { m, n: i + 1, l: m.lessons[j], ln: j + 1 };
  }
  return null;
}

export function LearningAdminLessonScreen() {
  const id = Number(useParams().id);
  const tree = useLearningTree();
  const found = tree.data ? findLesson(tree.data.modules, id) : null;
  return (
    <AdminGate error={tree.error}>
      <AdminShell>
        {!tree.data ? <Loading /> : !found ? <Centered><p style={lead}>This lesson no longer exists.</p><Btn kind="outline" to={LEARN.admin}>All modules</Btn></Centered> : <LessonEditor key={found.l.id} {...found} />}
      </AdminShell>
    </AdminGate>
  );
}

type PassageDraft = { bookId: number; chapter: string; from: string; to: string };

const toDraft = (p: AdminLesson['passages'][number]): PassageDraft => ({ bookId: p.bookId, chapter: String(p.chapter), from: p.verseStart ? String(p.verseStart) : '', to: p.verseEnd ? String(p.verseEnd) : '' });

const toInput = (p: PassageDraft): PassageInput => ({ bookId: p.bookId, chapter: Number(p.chapter), verseStart: p.from ? Number(p.from) : null, verseEnd: p.to ? Number(p.to) : p.from ? Number(p.from) : null });

function LessonEditor({ m, n, l, ln }: { m: AdminModule; n: number; l: AdminLesson; ln: number }) {
  const [title, setTitle] = useState(l.title);
  const [body, setBody] = useState(l.body);
  const [passages, setPassages] = useState<PassageDraft[]>(l.passages.map(toDraft));
  const [notice, setNotice] = useState<{ tone: 'rust' | 'green'; title: string; body: string } | null>(null);
  const [passageError, setPassageError] = useState<string | null>(null);
  const save = useAction(
    () => learningAdmin.updateLesson(l.id, { title, body, passages: passages.map(toInput) }),
    (message, code) => (code === 'invalid-passage' ? setPassageError(message) : setNotice({ tone: 'rust', title: 'Not saved', body: message })),
  );
  const publish = useAction(() => learningAdmin.publishLesson(l.id, !l.published), (message) => setNotice({ tone: 'rust', title: l.published ? 'Not unpublished' : 'Not published', body: message }));
  const doSave = () => {
    setNotice(null);
    setPassageError(null);
    save.mutate(undefined, { onSuccess: () => setNotice({ tone: 'green', title: 'Saved', body: 'Learners see the change the next time they open the lesson.' }) });
  };
  const setPassage = (i: number, patch: Partial<PassageDraft>) => setPassages(passages.map((p, k) => (k === i ? { ...p, ...patch } : p)));
  return (
    <div style={{ display: 'grid', gap: 24, paddingTop: 12 }} data-testid="learning-admin-lesson">
      <BackLink to={LEARN.module(m.id)}>Module {n}, {m.title}</BackLink>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={h1}>Lesson {ln}</h1>
          {pubTag(l.published)}
        </div>
        <span style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Btn kind="outline" to={LEARN.preview(l.id)}>Preview as a learner</Btn>
          <Btn onClick={doSave} disabled={save.isPending}>Save changes</Btn>
        </span>
      </div>
      {notice && <Notice tone={notice.tone} title={notice.title}>{notice.body}</Notice>}
      <Field label="Title"><input value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} style={input} data-testid="learning-lesson-title" /></Field>
      <VideoPanel l={l} />
      <section aria-labelledby="learning-passages-editor" style={{ display: 'grid', gap: 10 }}>
        <h2 id="learning-passages-editor" style={h3}>Passages</h2>
        <p style={muted}>Each opens its chapter in the reader. Verses are optional.</p>
        {passages.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '2 1 180px' }}>
              <Field label="Book">
                <select value={p.bookId} onChange={(e) => setPassage(i, { bookId: Number(e.target.value) })} style={input}>
                  {BOOKS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ flex: '1 1 90px' }}><Field label="Chapter"><input type="number" min={1} value={p.chapter} onChange={(e) => setPassage(i, { chapter: e.target.value })} style={input} className="nt20-num" /></Field></div>
            <div style={{ flex: '1 1 90px' }}><Field label="From verse"><input type="number" min={1} value={p.from} onChange={(e) => setPassage(i, { from: e.target.value })} style={input} className="nt20-num" /></Field></div>
            <div style={{ flex: '1 1 90px' }}><Field label="To verse"><input type="number" min={1} value={p.to} onChange={(e) => setPassage(i, { to: e.target.value })} style={input} className="nt20-num" /></Field></div>
            <button type="button" aria-label={`Remove passage ${i + 1}`} onClick={() => setPassages(passages.filter((_, k) => k !== i))} style={{ width: 44, height: 44, border: 'none', background: 'transparent', color: dt.rust, cursor: 'pointer' }}><Trash2 size={17} aria-hidden /></button>
          </div>
        ))}
        {passageError && <p role="alert" style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: dt.rust }}>Not saved: {passageError}</p>}
        <div><Btn kind="outline" onClick={() => setPassages([...passages, { bookId: 1, chapter: '1', from: '', to: '' }])}><Plus size={16} aria-hidden /> Add a passage</Btn></div>
      </section>
      <section aria-labelledby="learning-text" style={{ display: 'grid', gap: 10 }}>
        <h2 id="learning-text" style={h3}>Text</h2>
        <p style={muted}>Markdown: headings, lists, emphasis, quotes and links. HTML and images are not shown to learners.</p>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))' }}>
          <textarea aria-label="Lesson text in Markdown" value={body} maxLength={100000} onChange={(e) => setBody(e.target.value)} data-testid="learning-lesson-body" style={{ ...input, minHeight: 420, fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: 16, lineHeight: 1.55, resize: 'vertical' }} />
          <div aria-label="Preview" role="region" style={{ border: `1px solid ${dt.cardBorder}`, borderRadius: 9, padding: '16px 20px', background: dt.cardBg }}>
            <p style={{ margin: '0 0 10px', fontSize: 12.5, fontWeight: 700, color: dt.textMuted }}>Live preview</p>
            <Markdown source={body} size={16} />
          </div>
        </div>
      </section>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', borderTop: `1px solid ${dt.border2}`, paddingTop: 20 }}>
        <Btn onClick={doSave} disabled={save.isPending}>Save changes</Btn>
        <Btn kind="outline" onClick={() => { setNotice(null); publish.mutate(undefined); }} disabled={publish.isPending}>{l.published ? 'Unpublish lesson' : 'Publish lesson'}</Btn>
      </div>
    </div>
  );
}

type Upload = { name: string; size: number; pct: number; state: 'uploading' | 'failed' | 'refused'; reason?: string; file: File };

function sizeText(bytes: number) {
  return bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(1)} GB` : `${Math.max(1, Math.round(bytes / 1024 ** 2))} MB`;
}

function VideoPanel({ l }: { l: AdminLesson }) {
  const [up, setUp] = useState<Upload | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const pick = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  const qc = useQueryClient();
  const refresh = useTreeRefresh();
  const start = async (file: File) => {
    const base = { name: file.name, size: file.size, file };
    setUp({ ...base, pct: 0, state: 'uploading' });
    let url: string;
    try {
      url = (await learningAdmin.videoUploadUrl(l.id, file.size, file.type || 'application/octet-stream')).uploadUrl;
    } catch (err) {
      setUp({ ...base, pct: 0, state: 'refused', reason: refusalOf(err).message });
      return;
    }
    abort.current = new AbortController();
    let pct = 0;
    try {
      await uploadVideo(url, file, (p) => { pct = p; setUp({ ...base, pct: p, state: 'uploading' }); }, abort.current.signal);
    } catch (err) {
      setUp(err instanceof DOMException && err.name === 'AbortError' ? null : { ...base, pct, state: 'failed' });
      return;
    }
    try {
      await learningAdmin.attachVideo(l.id);
    } catch (err) {
      setUp({ ...base, pct: 100, state: 'refused', reason: refusalOf(err).message });
      return;
    }
    setUp(null);
    await Promise.all([refresh(), qc.invalidateQueries({ queryKey: ['coach', 'learning', 'video', l.id] })]);
  };
  const remove = useMutation({
    mutationFn: () => learningAdmin.removeVideo(l.id),
    onSuccess: () => Promise.all([refresh(), qc.invalidateQueries({ queryKey: ['coach', 'learning', 'video', l.id] })]),
    onError: (err) => setRemoveError(refusalOf(err).message),
  });
  const busy = up?.state === 'uploading';
  return (
    <section aria-labelledby="learning-video" style={{ ...panel, display: 'grid', gap: 12 }} data-testid="learning-video-panel">
      <h2 id="learning-video" style={h3}>Video</h2>
      <input
        ref={pick}
        type="file"
        accept="video/mp4,video/webm"
        hidden
        data-testid="learning-video-file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) start(file);
        }}
      />
      {l.hasVideo ? (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <span style={{ minWidth: 0, flex: '1 1 240px' }}>
            <span style={{ display: 'block', fontWeight: 600 }}>{l.videoType === 'video/webm' ? 'WebM video' : 'MP4 video'}</span>
            <span style={{ display: 'block', fontSize: 13, color: dt.textMuted }}>{busy ? 'Still playing for learners' : l.published ? 'Playing for learners' : 'Shown once the lesson is published'}</span>
          </span>
          <span style={{ display: 'flex', gap: 8 }}>
            <Btn kind="outline" disabled={busy} onClick={() => pick.current?.click()}><Upload size={16} aria-hidden /> Replace</Btn>
            <Btn kind="danger" disabled={busy || remove.isPending} onClick={() => remove.mutate()}>Remove</Btn>
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <p style={{ ...muted, flex: '1 1 240px' }}>No video. The lesson shows its text and passages only.</p>
          <Btn kind="outline" disabled={busy} onClick={() => pick.current?.click()}><Upload size={16} aria-hidden /> Upload a video</Btn>
        </div>
      )}
      {up?.state === 'uploading' && (
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13.5, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>Uploading {up.name}</span>
            <span className="nt20-num" style={{ color: dt.textMuted }}>{up.pct}% of {sizeText(up.size)}</span>
          </div>
          <div role="progressbar" aria-label={`Uploading ${up.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={up.pct} style={{ height: 7, background: dt.barTrack, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${up.pct}%`, height: '100%', background: dt.brightGold }} />
          </div>
          <p style={{ ...muted, fontSize: 13 }}>The current video stays live until this one finishes and is checked. Leave this page open.</p>
          <div><Btn kind="outline" onClick={() => abort.current?.abort()}>Cancel upload</Btn></div>
        </div>
      )}
      {up?.state === 'refused' && <Notice tone="rust" title={`${up.name} was not uploaded`}>{up.reason}. The lesson keeps {l.hasVideo ? 'its current video' : 'no video'}.</Notice>}
      {up?.state === 'failed' && (
        <Notice tone="rust" title={`The upload of ${up.name} stopped at ${up.pct}%`} action={<Btn kind="outline" onClick={() => start(up.file)}>Try again</Btn>}>
          The connection dropped before it finished. Learners still see {l.hasVideo ? 'the previous video' : 'no video'}, never a broken player.
        </Notice>
      )}
      {removeError && <Notice tone="rust" title="Not removed">{removeError}</Notice>}
    </section>
  );
}

export function LearningAdminPreviewScreen() {
  const id = Number(useParams().id);
  const tree = useLearningTree();
  const lesson = useQuery({ queryKey: learningKeys.preview(id), queryFn: () => learningAdmin.lesson(id), retry: false });
  const found = tree.data ? findLesson(tree.data.modules, id) : null;
  return (
    <AdminGate error={tree.error ?? lesson.error}>
      <AdminShell>
        {!lesson.data || !found ? (
          <Loading />
        ) : (
          <div style={{ display: 'grid', gap: 18, paddingTop: 12 }} data-testid="learning-admin-preview">
            <BackLink to={LEARN.adminLesson(id)}>Back to the editor</BackLink>
            <Notice tone="gold" title="Preview">
              {lesson.data.draft ? 'This is the lesson as learners will see it once it is published. Until then no learner can open it.' : 'This is the lesson as learners see it.'}
            </Notice>
            <LessonContent lesson={lesson.data} place={`Module ${found.n}, ${found.m.title} · Lesson ${found.ln} of ${found.m.lessons.length}`} admin />
          </div>
        )}
      </AdminShell>
    </AdminGate>
  );
}

const PAGE = 25;

const REQUEST_TAG: Record<string, ReactNode> = {
  open: <Tag tone="gold">Request open</Tag>,
  approved: <Tag tone="green">Approved</Tag>,
  declined: <Tag tone="rust">Declined</Tag>,
  'already-in-program': <Tag tone="blue">Already in program</Tag>,
};

export function LearningAdminLearnersScreen() {
  const [q, setQ] = useState('');
  const [offset, setOffset] = useState(0);
  const search = useDeferredValue(q.trim());
  const page = useQuery({ queryKey: learningKeys.learners(search, offset), queryFn: () => learningAdmin.learners(search, offset, PAGE), retry: false, placeholderData: (prev) => prev });
  const v = page.data;
  const th: CSSProperties = { textAlign: 'left', fontSize: 12.5, fontWeight: 700, color: dt.textMuted, padding: '10px 14px', whiteSpace: 'nowrap' };
  const td: CSSProperties = { padding: '12px 14px', borderTop: `1px solid ${dt.rowDivider}`, fontSize: 14, verticalAlign: 'top' };
  const pages = v ? Math.max(1, Math.ceil(v.total / PAGE)) : 1;
  const current = Math.floor(offset / PAGE) + 1;
  return (
    <AdminGate error={page.error}>
      <AdminShell>
        <div style={{ display: 'grid', gap: 22, paddingTop: 28 }} data-testid="learning-admin-learners">
          <ProgramTabs active="learners" />
          <div style={{ display: 'grid', gap: 8 }}>
            <h1 style={h1}>Learners</h1>
            <p style={lead}>Everyone who started the program. Only program admins see this list.</p>
          </div>
          <form role="search" onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ position: 'relative', flex: '1 1 280px', maxWidth: 440 }}>
              <Search size={16} aria-hidden color={dt.textMuted} style={{ position: 'absolute', left: 13, top: 14 }} />
              <input type="search" aria-label="Search by name or email" value={q} onChange={(e) => { setQ(e.target.value); setOffset(0); }} placeholder="Search by name or email" style={{ ...input, paddingLeft: 38 }} data-testid="learning-learners-search" />
            </label>
            {v && (
              <span className="nt20-num" role="status" style={muted}>
                {v.total === 0
                  ? search ? 'No learners match' : 'No one has started the program yet'
                  : pages === 1
                    ? `${v.total} learner${v.total === 1 ? '' : 's'}${search ? ` matching “${search}”` : ''}`
                    : `${offset + 1}–${offset + v.learners.length} of ${v.total.toLocaleString('en-US')}${search ? ` matching “${search}”` : ''}`}
              </span>
            )}
          </form>
          {!v ? (
            <Loading />
          ) : (
            v.learners.length > 0 && (
              <div className="nt20-table" style={{ overflowX: 'auto', border: `1px solid ${dt.cardBorder}`, borderRadius: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                  <thead style={{ background: dt.innerBg }}>
                    <tr><th style={th}>Learner</th><th style={th}>Started</th><th style={th}>Modules passed</th><th style={th}>Completed</th><th style={th}>Join request</th></tr>
                  </thead>
                  <tbody>
                    {v.learners.map((l: Learner) => (
                      <tr key={`${l.email}-${l.enrolledAt}`} data-testid="learning-learner-row">
                        <td style={td}><span style={{ display: 'block', fontWeight: 600 }}>{l.name || l.email}</span><span style={{ display: 'block', color: dt.textMuted, fontSize: 13 }}>{l.email}</span></td>
                        <td style={td} className="nt20-num" data-label="Started">{formatDate(day(l.enrolledAt))}</td>
                        <td style={td} className="nt20-num" data-label="Modules passed">{l.passed} of {l.total}</td>
                        <td style={td} className="nt20-num" data-label="Completed">{l.completedAt ? formatDate(day(l.completedAt)) : <span style={{ color: dt.textMuted }}>Not yet</span>}</td>
                        <td style={td} data-label="Join request">{l.request ? REQUEST_TAG[l.request] : <span style={{ color: dt.textMuted }}>None</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
          {pages > 1 && (
            <nav aria-label="Pages" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <Btn kind="outline" disabled={current === 1} onClick={() => setOffset(offset - PAGE)}>Previous</Btn>
              <span className="nt20-num" style={muted}>Page {current} of {pages}</span>
              <Btn kind="outline" disabled={current === pages} onClick={() => setOffset(offset + PAGE)}>Next</Btn>
            </nav>
          )}
        </div>
      </AdminShell>
    </AdminGate>
  );
}
