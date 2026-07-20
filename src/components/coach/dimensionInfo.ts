/**
 * Reference detail for the 12 coaching dimensions — what each one measures,
 * which weighted cluster it rolls up into, and the research benchmark it's
 * judged against. Shown when a leader taps a dimension on the report card.
 *
 * Sourced from the coaching model (the v3 weighted 100-point scorecard).
 */

export interface DimensionInfo {
  cluster: string;
  clusterWeight: number;
  /** What the dimension measures, in plain English. */
  what: string;
  /** The research-backed target it's scored against. */
  target: string;
}

export const DIMENSION_INFO: Record<number, DimensionInfo> = {
  1: {
    cluster: 'Teaching Craft',
    clusterWeight: 33,
    what: 'How well the session follows the 10-step blueprint — fellowship, opening prayer, newcomer welcome, Big Ideas review, context, scripture reading, teaching, application, and closing prayer.',
    target: 'All 10 steps, well-paced',
  },
  2: {
    cluster: 'Building Ministry',
    clusterWeight: 31,
    what: 'Time spent welcoming newcomers, with existing members sharing testimonies first. Not applicable when no newcomers are present (never a penalty).',
    target: '7–25 min with member testimonies',
  },
  3: {
    cluster: 'Teaching Craft',
    clusterWeight: 33,
    what: 'Depth of engagement with the text — how many cross-references are used and how much of the discussion stays grounded in scripture.',
    target: '6+ cross-references (Lifeway / REVEAL)',
  },
  4: {
    cluster: 'Engaging People',
    clusterWeight: 18,
    what: 'The balance of discussion vs. lecture — how much the room does the thinking versus the leader talking (measured discussion-only, excluding scripture reading and the newcomer welcome).',
    target: 'Leader talk ≤ 30–35% (Lifeway 30% Rule)',
  },
  5: {
    cluster: 'Teaching Craft',
    clusterWeight: 33,
    what: 'Questions that move the group from concept to life, weighted by cognitive demand (Depth of Knowledge) and whether they draw out first-person, personal responses.',
    target: '5–7 Big Ideas, majority DOK 3–4 (Webb)',
  },
  6: {
    cluster: 'Engaging People',
    clusterWeight: 18,
    what: 'The share of the room contributing substantively (interpreting/applying, not just reading aloud), called on by name.',
    target: '70–80% participate (Rowe)',
  },
  7: {
    cluster: 'Teaching Craft',
    clusterWeight: 33,
    what: 'Charts, slides, maps, or on-screen word-study tools (Blue Letter Bible, VerseMate, Logos, etc.) that reinforce the teaching multi-modally.',
    target: '≥1 visual / word-study aid (Mayer)',
  },
  8: {
    cluster: 'Being Real',
    clusterWeight: 18,
    what: 'Personal honesty with real cost, weighted by depth rather than count — the modeling that builds a room safe enough for members to open up. Scored against the leader’s rolling baseline.',
    target: 'Costly, sustained authenticity',
  },
  9: {
    cluster: 'Teaching Craft',
    clusterWeight: 33,
    what: 'Cumulative review of prior Big Ideas at the start of the session, so earlier lessons stick.',
    target: 'Opening recall drill (Ebbinghaus)',
  },
  10: {
    cluster: 'Building Ministry',
    clusterWeight: 31,
    what: 'Use of homework — Precept workbooks and “The Guarantee” — referenced and rewarded so prepared members are differentiated.',
    target: 'Referenced and rewarded',
  },
  11: {
    cluster: 'Being Real',
    clusterWeight: 18,
    what: 'Prayer woven through the session — delegated opening and closing prayer, prayer requests, and prayer-chain infrastructure.',
    target: 'Delegated open + close',
  },
  12: {
    cluster: 'Building Ministry',
    clusterWeight: 31,
    what: 'Observable, in-session development of another leader — a named apprentice, a delegated facilitation window, or public coaching (2 Timothy 2:2).',
    target: 'Visible apprentice hand-off',
  },
};

/** Plain-English read of a 1–5 dimension score. */
export function scoreBand(score: number | null): string {
  if (score == null) return 'Not applicable this session';
  if (score >= 5) return 'Exemplary';
  if (score >= 4) return 'Strong';
  if (score >= 3) return 'On target';
  if (score >= 2) return 'Developing';
  return 'Early stage';
}
