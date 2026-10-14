import { useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, Plus, Search, Trash2, Upload } from 'lucide-react';
import { dt } from '@/components/coach/dashboardTheme';
import { BackLink, Btn, Dialog, Field, Loading, Markdown, Notice, P, Row, Rows, Shell, Tag, formatDate, h1, h2, h3, input, inputError, lead, muted, pct, to, useData } from './ui';
import { LessonView } from './learner';

type JoinRequest = { id: string; name: string; email: string; completedOn: string; sentOn: string; passed: number; total: number; scores: number[]; note: string };
type RequestsView = { items: JoinRequest[]; notice?: { kind: 'duplicate' | 'no-longer-open'; name: string; by?: string; state?: string } };

const panel: CSSProperties = { background: dt.innerBg, border: `1px solid ${dt.cardBorder}`, borderRadius: 14, padding: 'clamp(16px, 3vw, 22px)' };

export function JoinRequests({ dialog, refusal }: { dialog?: 'approve' | 'decline'; refusal?: 'name-taken' | 'address-changed' }) {
  const data = useData<RequestsView>('/coach/admin/program/requests');
  const navigate = useNavigate();
  if (!data.data) return <Loading />;
  const { items, notice } = data.data;
  const first = items[0];
  return (
    <section aria-labelledby="nt20-requests" style={{ ...panel, marginTop: 28, display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <h2 id="nt20-requests" style={h2}>Join requests <span className="nt20-num" style={{ color: dt.textMuted, fontSize: 18 }}>{items.length}</span></h2>
        <Link to={to.learners} style={{ fontSize: 13.5, fontWeight: 700, color: dt.gold, textDecoration: 'none' }}>All learners →</Link>
      </div>
      <p style={muted}>People who completed the learning program and asked to join. Approving adds them with the invite form, which sends the usual invitation.</p>
      {notice?.kind === 'duplicate' && (
        <Notice tone="gold" title={`${notice.name} is already in the program`}>
          That address already belongs to a leader, so no one new was added. The request is closed as already in the program and the learner sees that.
        </Notice>
      )}
      {notice?.kind === 'no-longer-open' && (
        <Notice tone="gold" title={`${notice.name}'s request was already answered`}>
          {notice.by} {notice.state} it a moment ago. Nothing changed and no email was sent. The list below is current.
        </Notice>
      )}
      <Rows>
        {items.map((r, i) => (
          <Row key={r.id} first={i === 0} style={{ alignItems: 'flex-start', background: dt.cardBg }}>
            <div style={{ flex: '1 1 260px', minWidth: 0, display: 'grid', gap: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</span>
              <span style={{ fontSize: 13.5, color: dt.textMuted, overflowWrap: 'anywhere' }}>{r.email}</span>
              <span className="nt20-num" style={{ fontSize: 13, color: dt.body }}>
                Completed {formatDate(r.completedOn)} · {r.passed} of {r.total} modules passed · best by module: {r.scores.map((s, i) => `${i + 1}: ${pct(s)}`).join(', ')}
              </span>
              {r.note && <p style={{ margin: '6px 0 0', fontFamily: dt.serif, fontSize: 15.5, lineHeight: 1.55, color: dt.body, overflowWrap: 'anywhere' }}>“{r.note}”</p>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Btn to={to.adminApprove} label={`Approve ${r.name}`}>Approve</Btn>
              <Btn kind="outline" to={to.adminDecline} label={`Decline ${r.name}`}>Decline</Btn>
            </div>
          </Row>
        ))}
      </Rows>
      {dialog === 'approve' && first && <ApproveDialog r={first} refusal={refusal} onClose={() => navigate(to.adminHome)} />}
      {dialog === 'decline' && first && <DeclineDialog r={first} onClose={() => navigate(to.adminHome)} />}
    </section>
  );
}

function ApproveDialog({ r, refusal, onClose }: { r: JoinRequest; refusal?: 'name-taken' | 'address-changed'; onClose: () => void }) {
  const [name, setName] = useState(r.name);
  const [group, setGroup] = useState(refusal ? "Tuesday Men's Study" : '');
  return (
    <Dialog title="Add as a leader" onClose={onClose}>
      <p style={{ ...muted, margin: '0 0 18px' }}>The same form as inviting a leader, filled in from the request. {r.name} gets the usual invitation email.</p>
      {refusal === 'address-changed' && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="rust" title="Not added: the address changed">
            This account now uses an address it has not confirmed. No leader was added for either address and the request stays open. Try again once they confirm it, or decline.
          </Notice>
        </div>
      )}
      <div style={{ display: 'grid', gap: 14 }}>
        <Field label="Leader name" error={refusal === 'name-taken' ? `Not added: a leader named ${r.name} is already in the program. Use a name that tells them apart, then approve again.` : undefined}>
          <input value={name} onChange={(e) => setName(e.target.value)} style={refusal === 'name-taken' ? inputError : input} />
        </Field>
        <Field label="Email" hint="The address the account confirmed. It cannot be changed here.">
          <input value={refusal === 'address-changed' ? 'r.mendes.new@example.com' : r.email} readOnly style={{ ...input, background: dt.fill2, color: dt.textMuted }} />
        </Field>
        <Field label="Study / group (optional)">
          <input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="e.g. Men's Study" style={input} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
        <Btn>Approve and send invite</Btn>
        <Btn kind="outline" onClick={onClose}>Cancel</Btn>
      </div>
    </Dialog>
  );
}

function DeclineDialog({ r, onClose }: { r: JoinRequest; onClose: () => void }) {
  const [reason, setReason] = useState('Thank you for finishing the program. Right now we are only adding leaders whose groups already meet weekly. Once yours does, please send a new request.');
  return (
    <Dialog title={`Decline ${r.name}'s request`} onClose={onClose}>
      <p style={{ ...muted, margin: '0 0 18px' }}>They see the request as declined, with your reason if you give one, and can send a new request later. No email is sent.</p>
      <Field label="Reason (optional, shown to the learner)" count={`${reason.length} / 500`}>
        <textarea value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} rows={4} style={{ ...input, minHeight: 110, lineHeight: 1.5, resize: 'vertical' }} />
      </Field>
      <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
        <Btn kind="danger">Decline request</Btn>
        <Btn kind="outline" onClick={onClose}>Cancel</Btn>
      </div>
    </Dialog>
  );
}

function ProgramTabs({ active }: { active: 'modules' | 'learners' }) {
  const tab = (key: 'modules' | 'learners', label: string, href: string) => (
    <Link to={href} aria-current={active === key ? 'page' : undefined} style={{ minHeight: 40, display: 'inline-flex', alignItems: 'center', padding: '0 16px', borderRadius: 999, textDecoration: 'none', fontSize: 14, fontWeight: active === key ? 700 : 500, color: active === key ? dt.textPrimary : dt.textMuted, background: active === key ? dt.goldChip : 'transparent' }}>
      {label}
    </Link>
  );
  return (
    <nav aria-label="Learning program" style={{ display: 'flex', gap: 6, padding: 4, background: dt.fill1, borderRadius: 999, width: 'fit-content' }}>
      {tab('modules', 'Modules', to.program)}
      {tab('learners', 'Learners', to.learners)}
    </nav>
  );
}

type AdminModuleRow = { id: string; n: number; title: string; lessons: number; publishedLessons: number; questions: number; passMark: number; published: boolean };
type ModulesView = { modules: AdminModuleRow[]; refusal?: { module: number; title: string; reason: string } };

function MoveButtons({ label, first, last }: { label: string; first: boolean; last: boolean }) {
  const s: CSSProperties = { width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${dt.inputBorder}`, borderRadius: 8, background: dt.cardBg, color: dt.textMuted, cursor: 'pointer' };
  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      <button type="button" aria-label={`Move ${label} up`} disabled={first} style={{ ...s, opacity: first ? 0.35 : 1 }}><ArrowUp size={16} aria-hidden /></button>
      <button type="button" aria-label={`Move ${label} down`} disabled={last} style={{ ...s, opacity: last ? 0.35 : 1 }}><ArrowDown size={16} aria-hidden /></button>
    </span>
  );
}

export function AdminProgramScreen() {
  const data = useData<ModulesView>('/coach/admin/program/modules');
  if (!data.data) return <Shell nav="admin" active="program" wide><Loading /></Shell>;
  const { modules, refusal } = data.data;
  const published = modules.filter((m) => m.published).length;
  return (
    <Shell nav="admin" active="program" wide>
      <div style={{ display: 'grid', gap: 22, paddingTop: 28 }}>
        <ProgramTabs active="modules" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <h1 style={h1}>Learning program</h1>
            <p style={lead}>
              {modules.length ? <span className="nt20-num">{modules.length} modules, {published} published. Learners see published modules only, in this order. Edits reach every learner at once and never take away progress already earned.</span> : 'Write modules and lessons here. Nothing needs a deploy.'}
            </p>
          </div>
          {modules.length > 0 && <Btn><Plus size={16} aria-hidden /> New module</Btn>}
        </div>
        {refusal && (
          <Notice tone="rust" title={`Module ${refusal.module} was not published`}>
            <em>{refusal.title}</em> {refusal.reason} A published module needs at least one published lesson and one check question.
          </Notice>
        )}
        {modules.length === 0 ? (
          <div style={{ ...panel, display: 'grid', gap: 12, justifyItems: 'start', padding: 'clamp(24px, 5vw, 44px)' }}>
            <h2 style={h2}>No modules yet</h2>
            <p style={{ ...lead, fontSize: 15 }}>The program is invisible to everyone until you publish its first module: the coach gate and the leaders' navigation do not mention it before then.</p>
            <Btn><Plus size={16} aria-hidden /> Write the first module</Btn>
          </div>
        ) : (
          <Rows>
            {modules.map((m, i) => (
              <Row key={m.id} first={i === 0}>
                <MoveButtons label={`module ${m.n}`} first={i === 0} last={i === modules.length - 1} />
                <Link to={to.module} style={{ flex: '1 1 280px', minWidth: 0, textDecoration: 'none', color: dt.textPrimary }}>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: 15.5, overflowWrap: 'anywhere' }}>
                    <span className="nt20-num" style={{ color: dt.gold, marginRight: 8, fontFamily: dt.serif }}>{m.n}</span>{' '}
                    <span>{m.title}</span>
                  </span>
                  <span className="nt20-num" style={{ display: 'block', fontSize: 13, color: dt.textMuted, marginTop: 2 }}>
                    {m.publishedLessons} of {m.lessons} lessons published · {m.questions} questions · pass mark {m.passMark}%
                  </span>
                </Link>
                {m.published ? <Tag tone="green">Published</Tag> : <Tag tone="grey">Draft</Tag>}
                <Btn kind="outline" style={{ minWidth: 112 }}>{m.published ? 'Unpublish' : 'Publish'}</Btn>
              </Row>
            ))}
          </Rows>
        )}
      </div>
    </Shell>
  );
}

type Question = { n: number; text: string; options: { text: string; correct: boolean }[]; error?: string };
type ModuleDetail = {
  n: number;
  title: string;
  summary: string;
  passMark: number;
  published: boolean;
  lessons: { id: string; title: string; published: boolean; doneBy: number; video: boolean }[];
  questions: Question[];
  refusal?: { kind: 'emptying'; lesson: string } | { kind: 'delete'; lesson: string; doneBy: number };
};

export function AdminModuleScreen() {
  const data = useData<ModuleDetail>('/coach/admin/program/modules/m-1');
  const navigate = useNavigate();
  if (!data.data) return <Shell nav="admin" active="program" wide><Loading /></Shell>;
  const m = data.data;
  return (
    <Shell nav="admin" active="program" wide>
      <div style={{ display: 'grid', gap: 24, paddingTop: 12, maxWidth: 900 }}>
        <BackLink to={to.program}>All modules</BackLink>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={h1}>Module {m.n}</h1>
          {m.published ? <Tag tone="green">Published</Tag> : <Tag tone="grey">Draft</Tag>}
        </div>
        {m.refusal?.kind === 'emptying' && (
          <Notice tone="rust" title="Not unpublished">
            <em>{m.refusal.lesson}</em> is the only published lesson in this module, and a published module must keep one. Unpublish the module first, or publish another lesson.
          </Notice>
        )}
        <section style={{ display: 'grid', gap: 14 }} aria-label="Module details">
          <Field label="Title"><input defaultValue={m.title} style={input} /></Field>
          <Field label="Short description" hint="One or two sentences, shown on the learner's path."><textarea defaultValue={m.summary} rows={2} style={{ ...input, minHeight: 70, lineHeight: 1.5, resize: 'vertical' }} /></Field>
          <div style={{ maxWidth: 220 }}>
            <Field label="Pass mark (%)" hint="1 to 100. Changing it never takes back a pass."><input type="number" min={1} max={100} defaultValue={m.passMark} style={input} className="nt20-num" /></Field>
          </div>
        </section>
        <section style={{ display: 'grid', gap: 12 }} aria-labelledby="nt20-lessons">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 id="nt20-lessons" style={h2}>Lessons</h2>
            <Btn kind="outline"><Plus size={16} aria-hidden /> Add a lesson</Btn>
          </div>
          <Rows>
            {m.lessons.map((l, i) => (
              <Row key={l.id} first={i === 0}>
                <MoveButtons label={`lesson ${i + 1}`} first={i === 0} last={i === m.lessons.length - 1} />
                <Link to={to.adminLesson} style={{ flex: '1 1 240px', minWidth: 0, textDecoration: 'none', color: dt.textPrimary }}>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: 15 }}>{l.title}</span>
                  <span className="nt20-num" style={{ display: 'block', fontSize: 13, color: dt.textMuted, marginTop: 2 }}>
                    {l.video ? 'Video and text' : 'Text only'} · {l.doneBy ? `done by ${l.doneBy} learners` : 'no learner has done it yet'}
                  </span>
                </Link>
                {l.published ? <Tag tone="green">Published</Tag> : <Tag tone="grey">Draft</Tag>}
                <Btn kind="outline" style={{ minWidth: 112 }}>{l.published ? 'Unpublish' : 'Publish'}</Btn>
                <button type="button" aria-label={`Delete ${l.title}`} style={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', color: dt.rust, cursor: 'pointer', borderRadius: 8 }}><Trash2 size={17} aria-hidden /></button>
              </Row>
            ))}
          </Rows>
        </section>
        <section style={{ display: 'grid', gap: 12 }} aria-labelledby="nt20-check">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 id="nt20-check" style={h2}>Check</h2>
            <Btn kind="outline"><Plus size={16} aria-hidden /> Add a question</Btn>
          </div>
          <p style={muted}>Two to six options per question, exactly one correct. Learners never see which one; they see which questions they got wrong. A learner who passed keeps the pass and the best score whatever you change here.</p>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 12 }}>
            {m.questions.map((q) => (
              <li key={q.n} style={{ border: `1px solid ${q.error ? dt.rust : dt.cardBorder}`, borderRadius: 12, padding: '14px 16px', display: 'grid', gap: 8 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 15, lineHeight: 1.45 }}><span className="nt20-num" style={{ color: dt.gold, marginRight: 8 }}>{q.n}.</span>{q.text}</p>
                <div role="radiogroup" aria-label={`Correct option for question ${q.n}`} style={{ display: 'grid', gap: 6 }}>
                  {q.options.map((o, i) => (
                    <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 40, fontSize: 14.5, color: dt.body }}>
                      <input type="radio" name={`key-${q.n}`} defaultChecked={o.correct} style={{ accentColor: dt.green, width: 16, height: 16 }} />
                      <span style={{ flex: 1 }}>{o.text}</span>
                      {o.correct && <Tag tone="green">Correct</Tag>}
                    </label>
                  ))}
                </div>
                {q.error && <p role="alert" style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: dt.rust }}>Not saved: {q.error}</p>}
              </li>
            ))}
          </ol>
        </section>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', borderTop: `1px solid ${dt.border2}`, paddingTop: 20 }}>
          <Btn>Save changes</Btn>
          <Btn kind="outline">{m.published ? 'Unpublish module' : 'Publish module'}</Btn>
        </div>
      </div>
      {m.refusal?.kind === 'delete' && (
        <Dialog title="This lesson cannot be deleted" onClose={() => navigate(to.module)}>
          <p style={{ ...muted, color: dt.body, margin: '0 0 18px' }}>
            {m.refusal.doneBy} learners have marked <em>{m.refusal.lesson}</em> done, and their progress points at it. Unpublish it instead: it leaves the path and the totals, and nobody loses what they earned.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Btn>Unpublish the lesson</Btn>
            <Btn kind="outline" onClick={() => navigate(to.module)}>Keep it</Btn>
          </div>
        </Dialog>
      )}
    </Shell>
  );
}

type Passage = { book: string; chapter: number; from?: number; to?: number; error?: string };
type LessonDetail = {
  module: { n: number; title: string };
  n: number;
  of: number;
  title: string;
  minutes: number;
  published: boolean;
  body: string;
  passages: Passage[];
  video: { name: string; size: string; duration: string } | null;
  upload?: { name: string; size: string; pct: number; state: 'uploading' | 'failed' | 'refused'; reason?: string };
};

const BOOKS = 'Genesis,Exodus,Leviticus,Numbers,Deuteronomy,Joshua,Judges,Ruth,1 Samuel,2 Samuel,1 Kings,2 Kings,1 Chronicles,2 Chronicles,Ezra,Nehemiah,Esther,Job,Psalms,Proverbs,Ecclesiastes,Song of Songs,Isaiah,Jeremiah,Lamentations,Ezekiel,Daniel,Hosea,Joel,Amos,Obadiah,Jonah,Micah,Nahum,Habakkuk,Zephaniah,Haggai,Zechariah,Malachi,Matthew,Mark,Luke,John,Acts,Romans,1 Corinthians,2 Corinthians,Galatians,Ephesians,Philippians,Colossians,1 Thessalonians,2 Thessalonians,1 Timothy,2 Timothy,Titus,Philemon,Hebrews,James,1 Peter,2 Peter,1 John,2 John,3 John,Jude,Revelation'.split(',');

export function AdminLessonScreen() {
  const data = useData<LessonDetail>('/coach/admin/program/lessons/l-1-3');
  const [body, setBody] = useState<string | null>(null);
  if (!data.data) return <Shell nav="admin" active="program" wide><Loading /></Shell>;
  const l = data.data;
  const source = body ?? l.body;
  const up = l.upload;
  return (
    <Shell nav="admin" active="program" wide>
      <div style={{ display: 'grid', gap: 24, paddingTop: 12 }}>
        <BackLink to={to.module}>Module {l.module.n}, {l.module.title}</BackLink>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={h1}>Lesson {l.n}</h1>
            {l.published ? <Tag tone="green">Published</Tag> : <Tag tone="grey">Draft</Tag>}
          </div>
          <span style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Btn kind="outline" to={`${P}/admin-lesson/draft-preview`}>Preview as a learner</Btn>
            <Btn>Save changes</Btn>
          </span>
        </div>
        <Field label="Title"><input defaultValue={l.title} style={input} /></Field>
        <section aria-labelledby="nt20-video" style={{ ...panel, display: 'grid', gap: 12 }}>
          <h2 id="nt20-video" style={h3}>Video</h2>
          {l.video ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <span style={{ minWidth: 0, flex: '1 1 240px' }}>
                <span style={{ display: 'block', fontWeight: 600, overflowWrap: 'anywhere' }}>{l.video.name}</span>
                <span className="nt20-num" style={{ display: 'block', fontSize: 13, color: dt.textMuted }}>{l.video.size} · {l.video.duration} · {up?.state === 'uploading' ? 'still playing for learners' : 'playing for learners'}</span>
              </span>
              <span style={{ display: 'flex', gap: 8 }}>
                <Btn kind="outline" disabled={up?.state === 'uploading'}><Upload size={16} aria-hidden /> Replace</Btn>
                <Btn kind="danger" disabled={up?.state === 'uploading'}>Remove</Btn>
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <p style={{ ...muted, flex: '1 1 240px' }}>No video. The lesson shows its text and passages only.</p>
              <Btn kind="outline"><Upload size={16} aria-hidden /> Upload a video</Btn>
            </div>
          )}
          {up?.state === 'uploading' && (
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13.5, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>Uploading {up.name}</span>
                <span className="nt20-num" style={{ color: dt.textMuted }}>{up.pct}% of {up.size}</span>
              </div>
              <div role="progressbar" aria-label={`Uploading ${up.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={up.pct} style={{ height: 7, background: dt.barTrack, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${up.pct}%`, height: '100%', background: dt.brightGold }} />
              </div>
              <p style={{ ...muted, fontSize: 13 }}>The current video stays live until this one finishes and is checked. Leave this page open.</p>
              <div><Btn kind="outline">Cancel upload</Btn></div>
            </div>
          )}
          {up?.state === 'refused' && (
            <Notice tone="rust" title={`${up.name} was not uploaded`}>{up.reason} The lesson keeps {l.video ? 'its current video' : 'no video'}.</Notice>
          )}
          {up?.state === 'failed' && (
            <Notice tone="rust" title={`The upload of ${up.name} stopped at ${up.pct}%`} action={<Btn kind="outline">Try again</Btn>}>
              The connection dropped before it finished. Learners still see {l.video ? 'the previous video' : 'no video'}, never a broken player.
            </Notice>
          )}
        </section>
        <section aria-labelledby="nt20-passages" style={{ display: 'grid', gap: 10 }}>
          <h2 id="nt20-passages" style={h3}>Passages</h2>
          <p style={muted}>Each opens its chapter in the reader. Verses are optional.</p>
          {l.passages.map((p, i) => (
            <div key={i} style={{ display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '2 1 180px' }}>
                  <Field label="Book">
                    <select defaultValue={p.book} style={input}>{BOOKS.map((b) => <option key={b}>{b}</option>)}</select>
                  </Field>
                </div>
                <div style={{ flex: '1 1 90px' }}><Field label="Chapter"><input type="number" defaultValue={p.chapter} style={input} className="nt20-num" /></Field></div>
                <div style={{ flex: '1 1 90px' }}><Field label="From verse"><input type="number" defaultValue={p.from} style={p.error ? inputError : input} className="nt20-num" /></Field></div>
                <div style={{ flex: '1 1 90px' }}><Field label="To verse"><input type="number" defaultValue={p.to} style={p.error ? inputError : input} className="nt20-num" /></Field></div>
                <button type="button" aria-label={`Remove ${p.book} ${p.chapter}`} style={{ width: 44, height: 44, border: 'none', background: 'transparent', color: dt.rust, cursor: 'pointer' }}><Trash2 size={17} aria-hidden /></button>
              </div>
              {p.error && <p role="alert" style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: dt.rust }}>Not saved: {p.error}</p>}
            </div>
          ))}
          <div><Btn kind="outline"><Plus size={16} aria-hidden /> Add a passage</Btn></div>
        </section>
        <section aria-labelledby="nt20-text" style={{ display: 'grid', gap: 10 }}>
          <h2 id="nt20-text" style={h3}>Text</h2>
          <p style={muted}>Markdown: headings, lists, emphasis, quotes and links. HTML and images are not shown to learners.</p>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))' }}>
            <textarea aria-label="Lesson text in Markdown" value={source} onChange={(e) => setBody(e.target.value)} style={{ ...input, minHeight: 420, fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: 16, lineHeight: 1.55, resize: 'vertical' }} />
            <div aria-label="Preview" role="region" style={{ border: `1px solid ${dt.cardBorder}`, borderRadius: 9, padding: '16px 20px', maxHeight: 520, overflowY: 'auto', background: dt.cardBg }}>
              <p style={{ margin: '0 0 10px', fontSize: 12.5, fontWeight: 700, color: dt.textMuted }}>Live preview</p>
              <Markdown source={source} size={16} />
            </div>
          </div>
        </section>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', borderTop: `1px solid ${dt.border2}`, paddingTop: 20 }}>
          <Btn>Save changes</Btn>
          <Btn kind="outline">{l.published ? 'Unpublish lesson' : 'Publish lesson'}</Btn>
        </div>
      </div>
    </Shell>
  );
}

export function AdminLessonPreview() {
  const data = useData<Parameters<typeof LessonView>[0]['l']>('/coach/admin/program/lessons/l-2-4/preview');
  if (!data.data) return <Shell nav="admin" active="program" wide><Loading /></Shell>;
  return (
    <Shell nav="admin" active="program">
      <div style={{ display: 'grid', gap: 18, paddingTop: 12 }}>
        <BackLink to={to.adminLesson}>Back to the editor</BackLink>
        <Notice tone="gold" title="Preview">This is the lesson as learners will see it once it is published. Until then no learner can open it.</Notice>
        <LessonView l={data.data} />
      </div>
    </Shell>
  );
}

type Learner = { name: string; email: string; startedOn: string; passed: number; total: number; completedOn: string | null; request: 'open' | 'approved' | 'declined' | 'already' | null };
type LearnersView = { q: string; page: number; pages: number; total: number; pageSize: number; items: Learner[] };

const REQUEST_TAG: Record<NonNullable<Learner['request']>, ReactNode> = {
  open: <Tag tone="gold">Request open</Tag>,
  approved: <Tag tone="green">Approved</Tag>,
  declined: <Tag tone="rust">Declined</Tag>,
  already: <Tag tone="blue">Already in program</Tag>,
};

export function AdminLearnersScreen() {
  const data = useData<LearnersView>('/coach/admin/program/learners');
  const [q, setQ] = useState<string | null>(null);
  if (!data.data) return <Shell nav="admin" active="program" wide><Loading /></Shell>;
  const v = data.data;
  const from = (v.page - 1) * v.pageSize + 1;
  const toN = from + v.items.length - 1;
  const th: CSSProperties = { textAlign: 'left', fontSize: 12.5, fontWeight: 700, color: dt.textMuted, padding: '10px 14px', whiteSpace: 'nowrap' };
  const td: CSSProperties = { padding: '12px 14px', borderTop: `1px solid ${dt.rowDivider}`, fontSize: 14, verticalAlign: 'top' };
  return (
    <Shell nav="admin" active="program" wide>
      <div style={{ display: 'grid', gap: 22, paddingTop: 28 }}>
        <ProgramTabs active="learners" />
        <div style={{ display: 'grid', gap: 8 }}>
          <h1 style={h1}>Learners</h1>
          <p style={lead}>Everyone who started the program. Only program admins see this list.</p>
        </div>
        <form role="search" onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ position: 'relative', flex: '1 1 280px', maxWidth: 440 }}>
            <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Search by name or email</span>
            <Search size={16} aria-hidden color={dt.textMuted} style={{ position: 'absolute', left: 13, top: 14 }} />
            <input type="search" value={q ?? v.q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" style={{ ...input, paddingLeft: 38 }} />
          </label>
          <span className="nt20-num" role="status" style={muted}>
            {v.total === 0 ? 'No learners match' : `${from}–${toN} of ${v.total.toLocaleString('en-US')}${v.q ? ` matching “${v.q}”` : ''}`}
          </span>
        </form>
        <div className="nt20-table" style={{ overflowX: 'auto', border: `1px solid ${dt.cardBorder}`, borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead style={{ background: dt.innerBg }}>
              <tr><th style={th}>Learner</th><th style={th}>Started</th><th style={th}>Modules passed</th><th style={th}>Completed</th><th style={th}>Join request</th></tr>
            </thead>
            <tbody>
              {v.items.map((l) => (
                <tr key={l.email}>
                  <td style={td}><span style={{ display: 'block', fontWeight: 600 }}>{l.name}</span><span style={{ display: 'block', color: dt.textMuted, fontSize: 13 }}>{l.email}</span></td>
                  <td style={td} className="nt20-num" data-label="Started">{formatDate(l.startedOn)}</td>
                  <td style={td} className="nt20-num" data-label="Modules passed">{l.passed} of {l.total}</td>
                  <td style={td} className="nt20-num" data-label="Completed">{l.completedOn ? formatDate(l.completedOn) : <span style={{ color: dt.textMuted }}>Not yet</span>}</td>
                  <td style={td} data-label="Join request">{l.request ? REQUEST_TAG[l.request] : <span style={{ color: dt.textMuted }}>None</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {v.pages > 1 && (
          <nav aria-label="Pages" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Btn kind="outline" disabled={v.page === 1}>Previous</Btn>
            <span className="nt20-num" style={muted}>Page {v.page} of {v.pages}</span>
            <Btn kind="outline" disabled={v.page === v.pages}>Next</Btn>
          </nav>
        )}
      </div>
    </Shell>
  );
}
