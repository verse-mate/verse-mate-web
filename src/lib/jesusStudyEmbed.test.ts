import { describe, expect, it } from 'vitest';
import type { StudyMovement, StudyStep } from '@versemate/studies/types';
import {
  movementKey,
  planObservationPlacement,
  planRevealPlacement,
  type EventObservationKey,
} from './jesusStudyEmbed';
import type { JesusEventDetail, JesusReveal } from '@/services/types';

const step = (number: number, kind: StudyStep['kind']): StudyStep =>
  ({ number, kind, title: `Step ${number}`, summary: '', items: [], lists: [], inventory: [], segments: [], themeHeadline: '', body: '' }) as unknown as StudyStep;

const ALL: EventObservationKey[] = ['setting', 'words', 'actions', 'reactions'];

const reveal = (content: string, source_ref: string | null): JesusReveal => ({
  content,
  source_ref,
  provenance: 1,
});

const noReveals: JesusEventDetail['reveals'] = {
  says_about_himself: [],
  demonstrates: [],
  others_say: [],
  narrator_says: [],
};

const movement = (number: number, range: string): StudyMovement => ({
  number,
  title: `Movement ${number}`,
  range,
  body: '',
});

describe('planObservationPlacement', () => {
  const nineSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) =>
    step(n, n === 2 ? 'qa' : n === 4 ? 'lists' : 'bullets'),
  );

  it('sends the setting to the five Ws and the rest to the lists step', () => {
    const { byStep, unplaced } = planObservationPlacement(nineSteps, ALL);
    expect(byStep.get(2)).toEqual(['setting']);
    expect(byStep.get(4)).toEqual(['words', 'actions', 'reactions']);
    expect(unplaced).toEqual([]);
  });

  it('keeps the reading order the tab lays out, whatever order it is asked in', () => {
    const { byStep } = planObservationPlacement(nineSteps, ['reactions', 'words', 'actions']);
    expect(byStep.get(4)).toEqual(['words', 'actions', 'reactions']);
  });

  it('falls back to the step of the right kind when the numbering differs', () => {
    const renumbered = [step(11, 'qa'), step(12, 'lists')];
    const { byStep, unplaced } = planObservationPlacement(renumbered, ALL);
    expect(byStep.get(11)).toEqual(['setting']);
    expect(byStep.get(12)).toEqual(['words', 'actions', 'reactions']);
    expect(unplaced).toEqual([]);
  });

  it('leaves a block unplaced rather than forcing it into the wrong step', () => {
    const { byStep, unplaced } = planObservationPlacement([step(1, 'bullets')], ALL);
    expect(byStep.size).toBe(0);
    expect(unplaced).toEqual(ALL);
  });

  it('has nothing to place into a study that never loaded', () => {
    expect(planObservationPlacement(null, ALL).unplaced).toEqual(ALL);
    expect(planObservationPlacement([], ALL).unplaced).toEqual(ALL);
  });

  it('only places the blocks the event actually has', () => {
    const { byStep } = planObservationPlacement(nineSteps, ['setting', 'words']);
    expect(byStep.get(4)).toEqual(['words']);
  });
});

describe('planRevealPlacement', () => {
  const study = { chapter: 2, bookName: 'Luke' };
  const movements = [movement(1, '2:1-7'), movement(4, '2:39-50')];

  it('files a reveal under the movement whose verses it cites', () => {
    const { byMovement, leftovers } = planRevealPlacement(
      {
        ...noReveals,
        says_about_himself: [reveal('My Father’s house.', 'Luke 2:49')],
        narrator_says: [reveal('He was born in Bethlehem.', '2:4')],
      },
      movements,
      study,
    );
    expect(byMovement.get('4')?.[0].items[0].content).toContain('Father');
    expect(byMovement.get('1')?.[0].items[0].content).toContain('Bethlehem');
    expect(leftovers).toEqual([]);
  });

  it('splits one voice across the movements its items cite', () => {
    const { byMovement } = planRevealPlacement(
      {
        ...noReveals,
        demonstrates: [reveal('Born under Caesar.', '2:6'), reveal('Sits among teachers.', '2:46')],
      },
      movements,
      study,
    );
    expect(byMovement.get('1')?.[0].items).toHaveLength(1);
    expect(byMovement.get('4')?.[0].items).toHaveLength(1);
  });

  it('leaves an untagged reveal for the section rather than guessing', () => {
    const { byMovement, leftovers } = planRevealPlacement(
      { ...noReveals, others_say: [reveal('They were astonished.', null)] },
      movements,
      study,
    );
    expect(byMovement.size).toBe(0);
    expect(leftovers[0].items).toHaveLength(1);
  });

  it('never routes a reveal that cites the parallel account in another book', () => {
    const { byMovement, leftovers } = planRevealPlacement(
      { ...noReveals, others_say: [reveal('Matthew records it too.', 'Matt 2:2')] },
      movements,
      study,
    );
    expect(byMovement.size).toBe(0);
    expect(leftovers[0].items).toHaveLength(1);
  });

  it('reads the study’s own book, spelled out or abbreviated to a prefix', () => {
    const { byMovement } = planRevealPlacement(
      { ...noReveals, others_say: [reveal('The boy at twelve.', 'Luk. 2:42')] },
      movements,
      study,
    );
    expect(byMovement.get('4')?.[0].items).toHaveLength(1);
  });

  it('leaves a book form it cannot confirm to the section rather than risking it', () => {
    const { byMovement, leftovers } = planRevealPlacement(
      { ...noReveals, others_say: [reveal('The boy at twelve.', 'Lk. 2:42')] },
      movements,
      study,
    );
    expect(byMovement.size).toBe(0);
    expect(leftovers[0].items).toHaveLength(1);
  });

  it('leaves a reveal citing verses no movement covers to the section', () => {
    const { byMovement, leftovers } = planRevealPlacement(
      { ...noReveals, demonstrates: [reveal('He grew in wisdom.', '2:52')] },
      movements,
      study,
    );
    expect(byMovement.size).toBe(0);
    expect(leftovers[0].items).toHaveLength(1);
  });

  it('keeps the four voices apart when they land on the same movement', () => {
    const { byMovement } = planRevealPlacement(
      {
        ...noReveals,
        says_about_himself: [reveal('My Father’s house.', '2:49')],
        others_say: [reveal('Your father and I searched.', '2:48')],
      },
      movements,
      study,
    );
    const groups = byMovement.get('4') ?? [];
    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.key)).toEqual(['says_about_himself', 'others_say']);
  });
});

describe('movementKey', () => {
  it('prefers the movement number and falls back to its position', () => {
    expect(movementKey(movement(3, '2:1-7'), 0)).toBe('3');
    expect(movementKey({ ...movement(0, '2:1-7'), number: undefined as unknown as number }, 2)).toBe('2');
  });
});
