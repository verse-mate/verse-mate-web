import { describe, expect, it } from 'vitest';
import { editBody, editableFields, type MonthlyReportRow } from './coachMonthlyEdit';

const leaderRow: MonthlyReportRow = {
  id: 4,
  kind: 'leader',
  coachId: 'leader',
  month: '2031-02',
  state: 'held',
  holdReason: 'held: the first month after cutover',
  skipped: [],
  summary: {
    strengths: [{ text: 'Scripture first.', session: '2031-02-07' }],
    growth: [{ text: 'Invite quiet members.', session: '2031-02-14' }],
    trends: ['Steady.'],
    conversationGuide: [{ label: 'Open', q: 'What went well?' }],
    focus: { clusterName: 'Engaging People', clusterPct: 61, goals: ['Ask one open question.'] },
    clusters: [{ name: 'Teaching Craft', insight: 'Clear framing.' }],
  },
};

const programRow: MonthlyReportRow = {
  id: 5,
  kind: 'program',
  coachId: null,
  month: '2031-02',
  state: 'held',
  holdReason: null,
  skipped: [],
  summary: {
    executiveSummary: ['Nine sessions.'],
    trends: { text: ['Recall is up.'] },
    initiatives: ['Practise recall.'],
    snapshots: [{ id: 'leader', name: 'Avery Hollis', text: 'A good month.' }],
  },
};

describe('correcting a held monthly report', () => {
  it("lists every correctable text of a leader's summary, labelled", () => {
    expect(editableFields(leaderRow).map((f) => [f.key, f.label, f.value])).toEqual([
      ['strengths.0', 'Strength (2031-02-07)', 'Scripture first.'],
      ['growth.0', 'Growth area (2031-02-14)', 'Invite quiet members.'],
      ['trends.0', 'Trend 1', 'Steady.'],
      ['conversationGuide.0', 'Conversation question: Open', 'What went well?'],
      ['focusGoals.0', 'Focus goal 1', 'Ask one open question.'],
      ['insights.Teaching Craft', 'Insight: Teaching Craft', 'Clear framing.'],
    ]);
  });

  it("builds the edit body the server takes, keeping each item's session and label", () => {
    const values = Object.fromEntries(editableFields(leaderRow).map((f) => [f.key, `${f.value} (fixed)`]));
    expect(editBody(leaderRow, values)).toEqual({
      strengths: [{ text: 'Scripture first. (fixed)', session: '2031-02-07' }],
      growth: [{ text: 'Invite quiet members. (fixed)', session: '2031-02-14' }],
      trends: ['Steady. (fixed)'],
      conversationGuide: [{ label: 'Open', q: 'What went well? (fixed)' }],
      focusGoals: ['Ask one open question. (fixed)'],
      insights: { 'Teaching Craft': 'Clear framing. (fixed)' },
    });
  });

  it("a program report's executive summary, trends, initiatives and snapshots are correctable", () => {
    const fields = editableFields(programRow);
    expect(fields.map((f) => f.label)).toEqual(['Executive summary 1', 'Trend 1', 'Initiative 1', 'Snapshot: Avery Hollis']);
    const values = Object.fromEntries(fields.map((f) => [f.key, f.value.toUpperCase()]));
    expect(editBody(programRow, values)).toEqual({
      executiveSummary: ['NINE SESSIONS.'],
      trends: ['RECALL IS UP.'],
      initiatives: ['PRACTISE RECALL.'],
      snapshots: { leader: 'A GOOD MONTH.' },
    });
  });
});
