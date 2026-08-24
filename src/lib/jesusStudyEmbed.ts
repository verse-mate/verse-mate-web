import type { StudyMovement, StudyStep } from '@versemate/studies/types';
import { parseVerseRefs, refsOverlap } from '@/lib/jesusStudy';
import type { JesusEventDetail, JesusReveal } from '@/services/types';

/**
 * Where the event graph's own observations and revelations belong inside the
 * chapter study's spine.
 *
 * The Study tab used to stack the event's material — its setting, His words,
 * His acts, the crowd's reaction, what the event reveals — as standalone
 * cards above the nine steps and above the movements. That read as a second
 * study bolted onto the first. The Precept method already has a home for
 * every one of those questions:
 *
 *  - where / when / who  → step 2, "Ask the 5 W's and an H"
 *  - what He says / does / how people responded → step 4, "Make lists"
 *  - what this reveals about Him → the interpretation movement whose verses
 *    the reveal cites
 *
 * So this module decides the home and the renderer nests the block inside
 * that card. Nothing is merged: an embedded block keeps its own heading and
 * is labelled as coming from the event record, not from the chapter study.
 * Anything with no home (a study missing that step, a reveal citing verses no
 * movement covers) is handed back as `unplaced` / `leftovers` so the renderer
 * can still show it rather than silently dropping content.
 */

// ─── Observation ─────────────────────────────────────────────────────────

export type EventObservationKey = 'setting' | 'words' | 'actions' | 'reactions';

/** Every observation block the event graph can contribute, in reading order. */
export const EVENT_OBSERVATION_KEYS: EventObservationKey[] = [
  'setting',
  'words',
  'actions',
  'reactions',
];

/**
 * The step that hosts each block: by number first (the generator numbers the
 * nine steps canonically), then by kind, so a study that renumbered or
 * dropped a step still finds the right card.
 */
const OBSERVATION_HOME: Record<EventObservationKey, { step: number; kind: StudyStep['kind'] }> = {
  setting: { step: 2, kind: 'qa' },
  words: { step: 4, kind: 'lists' },
  actions: { step: 4, kind: 'lists' },
  reactions: { step: 4, kind: 'lists' },
};

export interface ObservationPlacement {
  /** Step number → the event blocks nested inside that step, in reading order. */
  byStep: Map<number, EventObservationKey[]>;
  /** Blocks whose host step this study doesn't have — rendered as own cards. */
  unplaced: EventObservationKey[];
}

export function planObservationPlacement(
  steps: StudyStep[] | null | undefined,
  present: EventObservationKey[],
): ObservationPlacement {
  const byStep = new Map<number, EventObservationKey[]>();
  const unplaced: EventObservationKey[] = [];
  const ordered = EVENT_OBSERVATION_KEYS.filter((key) => present.includes(key));
  if (!steps?.length) return { byStep, unplaced: ordered };

  for (const key of ordered) {
    const home = OBSERVATION_HOME[key];
    const step =
      steps.find((s) => s.number === home.step) ?? steps.find((s) => s.kind === home.kind);
    if (!step) {
      unplaced.push(key);
      continue;
    }
    const list = byStep.get(step.number);
    if (list) list.push(key);
    else byStep.set(step.number, [key]);
  }
  return { byStep, unplaced };
}

// ─── Interpretation ──────────────────────────────────────────────────────

/** The event graph keeps Jesus' claims apart from everyone else's. */
export const REVEAL_GROUPS: { key: keyof JesusEventDetail['reveals']; label: string }[] = [
  { key: 'says_about_himself', label: 'What He says about Himself' },
  { key: 'demonstrates', label: 'What He demonstrates' },
  { key: 'others_say', label: 'What others say' },
  { key: 'narrator_says', label: 'What the narrator says' },
];

export interface RevealGroup {
  key: keyof JesusEventDetail['reveals'];
  label: string;
  items: JesusReveal[];
}

export interface RevealPlacement {
  /** Movement key (`mv.number ?? index`) → the reveal groups nested in it. */
  byMovement: Map<string, RevealGroup[]>;
  /** Reveals citing no verse, another book, or verses no movement covers. */
  leftovers: RevealGroup[];
}

/** The id a movement card is keyed and toggled by — shared with the renderer. */
export function movementKey(movement: StudyMovement, index: number): string {
  return String(movement.number ?? index);
}

/**
 * A reveal citing "Matt 4:17" inside a Luke study is quoting the parallel
 * account, and its chapter number means nothing here — route it to the
 * leftovers rather than to whichever movement happens to cover Luke 4:17.
 *
 * The match is deliberately conservative: the cited name has to be a prefix
 * of the study's book (or the other way round), so "Luke", "Luk." and the
 * bare "2:49" all read as this book while an initialism the data never uses
 * ("Lk.") reads as another one. Getting that wrong only costs the reveal its
 * movement — it still renders under the section — while a false match would
 * file another gospel's verse under this chapter's movement.
 */
function citesAnotherBook(ref: string, bookName: string): boolean {
  const named = ref.trim().match(/^([1-3]?\s*[A-Za-z][A-Za-z.]*(?:\s+[A-Za-z]+)*)\s*\d/);
  if (!named) return false;
  const cited = named[1].replace(/\./g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  const book = bookName.toLowerCase();
  return !(book.startsWith(cited) || cited.startsWith(book));
}

export function planRevealPlacement(
  reveals: JesusEventDetail['reveals'],
  movements: StudyMovement[],
  study: { chapter: number; bookName: string },
): RevealPlacement {
  const byMovement = new Map<string, RevealGroup[]>();
  const leftovers: RevealGroup[] = [];
  const homes = movements.map((mv, i) => ({
    key: movementKey(mv, i),
    refs: parseVerseRefs(mv.range, study.chapter),
  }));

  const addTo = (key: string, group: RevealGroup) => {
    const list = byMovement.get(key);
    if (list) list.push(group);
    else byMovement.set(key, [group]);
  };

  for (const group of REVEAL_GROUPS) {
    const items = reveals[group.key] ?? [];
    if (!items.length) continue;
    const perMovement = new Map<string, JesusReveal[]>();
    const spare: JesusReveal[] = [];

    for (const item of items) {
      const ref = item.source_ref?.trim();
      const home =
        ref && !citesAnotherBook(ref, study.bookName)
          ? homes.find((candidate) =>
              parseVerseRefs(ref, study.chapter).some((cited) =>
                candidate.refs.some((range) => refsOverlap(cited, range)),
              ),
            )
          : undefined;
      if (!home) {
        spare.push(item);
        continue;
      }
      const list = perMovement.get(home.key);
      if (list) list.push(item);
      else perMovement.set(home.key, [item]);
    }

    for (const [key, list] of perMovement) addTo(key, { ...group, items: list });
    if (spare.length) leftovers.push({ ...group, items: spare });
  }

  return { byMovement, leftovers };
}
