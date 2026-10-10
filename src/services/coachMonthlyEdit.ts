export interface MonthlyReportRow {
  id: number;
  kind: 'leader' | 'program';
  coachId: string | null;
  month: string;
  state: 'held' | 'pending' | 'sending' | 'sent' | 'parallel-run';
  holdReason: string | null;
  skipped: string[];
  summary: unknown;
}

export interface EditField {
  key: string;
  label: string;
  value: string;
}

type Raw = Record<string, unknown>;
const rec = (v: unknown): Raw => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Raw) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const strings = (v: unknown) => arr(v).map(str);

function leaderParts(summary: Raw) {
  return {
    strengths: arr(summary.strengths).map(rec),
    growth: arr(summary.growth).map(rec),
    trends: strings(summary.trends),
    conversationGuide: arr(summary.conversationGuide).map(rec),
    focusGoals: strings(rec(summary.focus).goals),
    clusters: arr(summary.clusters).map(rec),
  };
}

function programParts(summary: Raw) {
  return {
    executiveSummary: strings(summary.executiveSummary),
    trends: strings(rec(summary.trends).text),
    initiatives: strings(summary.initiatives),
    snapshots: arr(summary.snapshots).map(rec),
  };
}

export function editableFields(row: MonthlyReportRow): EditField[] {
  const summary = rec(row.summary);
  if (row.kind === 'leader') {
    const p = leaderParts(summary);
    return [
      ...p.strengths.map((s, i) => ({ key: `strengths.${i}`, label: `Strength (${str(s.session)})`, value: str(s.text) })),
      ...p.growth.map((s, i) => ({ key: `growth.${i}`, label: `Growth area (${str(s.session)})`, value: str(s.text) })),
      ...p.trends.map((t, i) => ({ key: `trends.${i}`, label: `Trend ${i + 1}`, value: t })),
      ...p.conversationGuide.map((q, i) => ({ key: `conversationGuide.${i}`, label: `Conversation question: ${str(q.label)}`, value: str(q.q) })),
      ...p.focusGoals.map((g, i) => ({ key: `focusGoals.${i}`, label: `Focus goal ${i + 1}`, value: g })),
      ...p.clusters.map((c) => ({ key: `insights.${str(c.name)}`, label: `Insight: ${str(c.name)}`, value: str(c.insight) })),
    ];
  }
  const p = programParts(summary);
  return [
    ...p.executiveSummary.map((t, i) => ({ key: `executiveSummary.${i}`, label: `Executive summary ${i + 1}`, value: t })),
    ...p.trends.map((t, i) => ({ key: `trends.${i}`, label: `Trend ${i + 1}`, value: t })),
    ...p.initiatives.map((t, i) => ({ key: `initiatives.${i}`, label: `Initiative ${i + 1}`, value: t })),
    ...p.snapshots.map((s) => ({ key: `snapshots.${str(s.id)}`, label: `Snapshot: ${str(s.name)}`, value: str(s.text) })),
  ];
}

export function editBody(row: MonthlyReportRow, values: Record<string, string>): Record<string, unknown> {
  const summary = rec(row.summary);
  const v = (key: string, fallback: string) => values[key] ?? fallback;
  if (row.kind === 'leader') {
    const p = leaderParts(summary);
    return {
      strengths: p.strengths.map((s, i) => ({ text: v(`strengths.${i}`, str(s.text)), session: str(s.session) })),
      growth: p.growth.map((s, i) => ({ text: v(`growth.${i}`, str(s.text)), session: str(s.session) })),
      trends: p.trends.map((t, i) => v(`trends.${i}`, t)),
      conversationGuide: p.conversationGuide.map((q, i) => ({ label: str(q.label), q: v(`conversationGuide.${i}`, str(q.q)) })),
      focusGoals: p.focusGoals.map((g, i) => v(`focusGoals.${i}`, g)),
      insights: Object.fromEntries(p.clusters.map((c) => [str(c.name), v(`insights.${str(c.name)}`, str(c.insight))])),
    };
  }
  const p = programParts(summary);
  return {
    executiveSummary: p.executiveSummary.map((t, i) => v(`executiveSummary.${i}`, t)),
    trends: p.trends.map((t, i) => v(`trends.${i}`, t)),
    initiatives: p.initiatives.map((t, i) => v(`initiatives.${i}`, t)),
    snapshots: Object.fromEntries(p.snapshots.map((s) => [str(s.id), v(`snapshots.${str(s.id)}`, str(s.text))])),
  };
}
