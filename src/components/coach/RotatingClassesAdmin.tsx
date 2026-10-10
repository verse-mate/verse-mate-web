import { useState, type CSSProperties } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { coachKeys, useAdminCoaches } from '@/hooks/useCoach';
import { fetchRotatingClasses, refusalText, saveRotatingClass, setRotatingOnly, type RotatingClass } from '@/services/coachService';
import { dt } from './dashboardTheme';
import { actionBtn as btn, h2, h3, note, row, table } from './adminStyles';
import { QueryState } from './PipelineHealth';
import { rotatingClassBody, type RotatingClassForm } from './rotatingClassForm';

const EMPTY: RotatingClassForm = { name: '', groupEmail: '', keywords: '', leaders: [] };

export default function RotatingClassesAdmin() {
  const classes = useQuery({ queryKey: coachKeys.rotatingClasses, queryFn: fetchRotatingClasses, retry: false });
  const [editing, setEditing] = useState<number | 'new' | null>(null);

  return (
    <div style={{ paddingTop: 22 }} data-testid="coach-rotating">
      <h2 style={h2}>Rotating classes</h2>
      <p style={{ fontSize: 15, color: dt.textMuted, margin: '0 0 20px' }}>
        A class whose leaders take turns, recorded under one group address. Its sessions are matched by the group address and the
        title keywords, then the recording names which of its leaders taught.
      </p>
      <QueryState query={classes} name="rotating" label="the rotating classes">
        {(list) => (
          <>
            {list.length === 0 && editing !== 'new' && <div style={note}>No class is marked as rotating.</div>}
            {list.length > 0 && (
              <div style={table}>
                {list.map((c) =>
                  editing === c.id ? (
                    <ClassForm key={c.id} initial={c} onDone={() => setEditing(null)} />
                  ) : (
                    <ClassRow key={c.id} klass={c} onEdit={() => setEditing(c.id)} />
                  ),
                )}
              </div>
            )}
            {editing === 'new' ? (
              <div style={{ ...table, marginTop: 14 }}>
                <ClassForm onDone={() => setEditing(null)} />
              </div>
            ) : (
              <button type="button" data-testid="coach-rotating-add" onClick={() => setEditing('new')} style={{ ...btn, marginTop: 14 }}>
                Mark a class as rotating
              </button>
            )}
          </>
        )}
      </QueryState>
    </div>
  );
}

function ClassRow({ klass, onEdit }: { klass: RotatingClass; onEdit: () => void }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const only = useMutation({
    mutationFn: (v: { coachId: string; rotatingOnly: boolean }) => setRotatingOnly(v.coachId, v.rotatingOnly),
    onSuccess: () => {
      setError(null);
      return queryClient.invalidateQueries({ queryKey: coachKeys.rotatingClasses });
    },
    onError: (err) => setError(refusalText(err)),
  });
  const shown = (l: RotatingClass['leaders'][number]) =>
    only.isPending && only.variables?.coachId === l.id ? only.variables.rotatingOnly : l.rotatingOnly;
  return (
    <div data-testid={`coach-rotating-${klass.id}`} style={{ ...row, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{klass.name}</div>
        <div style={{ fontSize: 13, color: dt.textMuted }}>
          {klass.groupEmail}
          {klass.titleMatch.length > 0 ? ` · keywords: ${klass.titleMatch.join(', ')}` : ''}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
          {klass.leaders.map((l) => (
            <label key={l.id} style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: 13, color: dt.body }}>
              <input
                type="checkbox"
                data-testid={`coach-rotating-only-${klass.id}-${l.id}`}
                checked={shown(l)}
                disabled={only.isPending}
                onChange={(e) => only.mutate({ coachId: l.id, rotatingOnly: e.target.checked })}
              />
              {l.name} teaches only in this class
            </label>
          ))}
        </div>
        {error && (
          <div role="alert" style={{ fontSize: 13, color: dt.rust }}>
            {error}
          </div>
        )}
      </div>
      <button type="button" data-testid={`coach-rotating-edit-${klass.id}`} onClick={onEdit} style={btn}>
        Edit
      </button>
    </div>
  );
}

function ClassForm({ initial, onDone }: { initial?: RotatingClass; onDone: () => void }) {
  const queryClient = useQueryClient();
  const roster = useAdminCoaches();
  const [form, setForm] = useState<RotatingClassForm>(
    initial
      ? { name: initial.name, groupEmail: initial.groupEmail, keywords: initial.titleMatch.join(', '), leaders: initial.leaders.map((l) => l.id) }
      : EMPTY,
  );
  const [problem, setProblem] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: (body: Parameters<typeof saveRotatingClass>[0]) => saveRotatingClass(body, initial?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachKeys.rotatingClasses });
      onDone();
    },
    onError: (err) => setProblem(refusalText(err)),
  });
  const submit = () => {
    const parsed = rotatingClassBody(form);
    if ('problem' in parsed) return setProblem(parsed.problem);
    setProblem(null);
    save.mutate(parsed.body);
  };
  const toggle = (id: string, on: boolean) =>
    setForm((f) => ({ ...f, leaders: on ? [...f.leaders, id] : f.leaders.filter((l) => l !== id) }));

  return (
    <div data-testid="coach-rotating-form" style={{ ...row, flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
      <h3 style={{ ...h3, margin: 0, fontSize: 18 }}>{initial ? `Edit ${initial.name}` : 'Mark a class as rotating'}</h3>
      <label style={field}>
        Class name
        <input data-testid="coach-rotating-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={input} />
      </label>
      <label style={field}>
        Group address the recordings arrive under
        <input
          data-testid="coach-rotating-email"
          type="email"
          value={form.groupEmail}
          onChange={(e) => setForm({ ...form, groupEmail: e.target.value })}
          style={input}
        />
      </label>
      <label style={field}>
        Title keywords (separated by commas, at least three characters each)
        <input data-testid="coach-rotating-keywords" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} style={input} />
      </label>
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ fontSize: 13, color: dt.textMuted, marginBottom: 4 }}>Leaders who take turns</legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
          {(roster.data ?? []).map((l) => (
            <label key={l.id} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 13.5, color: dt.body }}>
              <input
                type="checkbox"
                data-testid={`coach-rotating-leader-${l.id}`}
                checked={form.leaders.includes(l.id)}
                onChange={(e) => toggle(l.id, e.target.checked)}
              />
              {l.name}
            </label>
          ))}
        </div>
      </fieldset>
      {problem && (
        <div role="alert" data-testid="coach-rotating-problem" style={{ fontSize: 13, color: dt.rust }}>
          {problem}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" data-testid="coach-rotating-save" onClick={submit} disabled={save.isPending} style={btn}>
          Save
        </button>
        <button type="button" onClick={onDone} style={{ ...btn, color: dt.textMuted }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const field: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: dt.textMuted };
const input: CSSProperties = {
  fontSize: 14,
  padding: '8px 10px',
  border: `1px solid ${dt.inputBorder}`,
  borderRadius: 8,
  background: dt.cardBg,
  color: dt.textPrimary,
};
