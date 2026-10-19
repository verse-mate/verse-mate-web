import { describe, expect, it } from 'vitest';

import { bandHeat, ratingForScore, statusBand } from './dashboardTheme';

const BANDS = ['Exceptional', 'Strong', 'On Target', 'Developing', 'Early Stage'];

const GREEN = '#3E7A54';
const GREEN_BG = '#E8EFE6';
const GOLD = '#9A6E1F';
const GOLD_CHIP = '#F4EAD4';
const RUST = '#A94E2B';
const RUST_BG = '#F4E1D7';
const NEUTRAL = '#8A8272';
const NEUTRAL_BG = '#F2F2F0';

describe('a status band is coloured by its POSITION in the served order', () => {
  it('paints each of the five served bands the colour the handoff chose', () => {
    expect(BANDS.map((b) => statusBand(b, BANDS))).toEqual([
      { label: 'Exceptional', c: GREEN, bg: GREEN_BG },
      { label: 'Strong', c: GOLD, bg: GOLD_CHIP },
      { label: 'On Target', c: GOLD, bg: GOLD_CHIP },
      { label: 'Developing', c: RUST, bg: RUST_BG },
      { label: 'Early Stage', c: RUST, bg: RUST_BG },
    ]);
  });

  it('a RENAMED top band keeps the top colour', () => {
    expect(statusBand('Outstanding', ['Outstanding', 'Strong']).c).toBe(GREEN);
  });

  it('is NEUTRAL before the served bands arrive', () => {
    expect(statusBand('Strong', [])).toEqual({ label: 'Strong', c: NEUTRAL, bg: NEUTRAL_BG });
  });

  it('an unplaceable label is neutral, not the worst', () => {
    expect(statusBand('Nonsense', BANDS).c).toBe(NEUTRAL);
    expect(statusBand('', BANDS).c).toBe(NEUTRAL);
  });

  it('six served bands each get a colour, the first the best and the last the worst', () => {
    const six = [...BANDS, 'Sixth'];
    const colours = six.map((b) => statusBand(b, six).c);
    expect(colours[0]).toBe(GREEN);
    expect(colours[5]).toBe(RUST);
    expect(colours).not.toContain(NEUTRAL);
  });

  it('three served bands take the best, the middle and the worst colour', () => {
    const three = ['Top', 'Middle', 'Bottom'];
    expect(three.map((b) => statusBand(b, three).c)).toEqual([GREEN, GOLD, RUST]);
  });
});

const DIMENSION_BANDS = [
  { min: 5, label: 'Exemplary' },
  { min: 4, label: 'Strong' },
  { min: 3, label: 'On target' },
  { min: 2, label: 'Developing' },
  { min: 1, label: 'Early stage' },
];

describe('a dimension rating reads the SERVED dimension bands', () => {
  it('names and colours every one of the five served bands', () => {
    expect([5, 4, 3, 2, 1].map((s) => ratingForScore(s, DIMENSION_BANDS))).toEqual([
      { label: 'Exemplary', c: GREEN, bg: GREEN_BG },
      { label: 'Strong', c: GOLD, bg: GOLD_CHIP },
      { label: 'On target', c: GOLD, bg: GOLD_CHIP },
      { label: 'Developing', c: RUST, bg: RUST_BG },
      { label: 'Early stage', c: RUST, bg: RUST_BG },
    ]);
  });

  it('six served bands each get a colour, the best band the best and the lowest the worst', () => {
    const six = [{ min: 6, label: 'Model' }, ...DIMENSION_BANDS];
    const colours = [6, 5, 4, 3, 2, 1].map((s) => ratingForScore(s, six).c);
    expect(colours[0]).toBe(GREEN);
    expect(colours[5]).toBe(RUST);
    expect(colours).not.toContain(NEUTRAL);
  });

  it('a 4 is the band the explainer calls it, not a hardcoded ON TARGET', () => {
    expect(ratingForScore(4, DIMENSION_BANDS).label).toBe('Strong');
  });

  it('follows a renamed band', () => {
    expect(ratingForScore(5, [{ min: 5, label: 'Model' }, ...DIMENSION_BANDS.slice(1)]).label).toBe(
      'Model',
    );
  });

  it('is neutral and unlabelled before the served bands arrive', () => {
    expect(ratingForScore(4, [])).toEqual({ label: '', c: NEUTRAL, bg: NEUTRAL_BG });
  });

  it('a score below every band falls to the bottom band', () => {
    expect(ratingForScore(0, DIMENSION_BANDS).label).toBe('Early stage');
  });

  it('an unscored dimension is N/A', () => {
    expect(ratingForScore(null, DIMENSION_BANDS)).toEqual({ label: 'N/A', c: NEUTRAL, bg: NEUTRAL_BG });
  });
});

describe('a heat colour is picked by the band\'s position across however many bands are served', () => {
  const PALETTE = ['best', 'good', 'mid', 'low', 'worst'];
  const bands = (n: number) => Array.from({ length: n }, (_, i) => ({ min: n - 1 - i, label: `b${i}` }));

  it('maps five bands one to one', () => {
    expect([4, 3, 2, 1, 0].map((score) => bandHeat(score, bands(5), PALETTE))).toEqual(PALETTE);
  });

  it('gives every one of six bands a colour, the first the best and the last the worst', () => {
    const heats = [5, 4, 3, 2, 1, 0].map((score) => bandHeat(score, bands(6), PALETTE));
    expect(heats[0]).toBe('best');
    expect(heats[5]).toBe('worst');
    expect(heats.every((h) => PALETTE.includes(h as string))).toBe(true);
  });

  it('spreads three bands over the ends and the middle', () => {
    expect([2, 1, 0].map((score) => bandHeat(score, bands(3), PALETTE))).toEqual(['best', 'mid', 'worst']);
  });

  it('a single band takes the best colour, and no bands give no colour', () => {
    expect(bandHeat(1, bands(1), PALETTE)).toBe('best');
    expect(bandHeat(1, [], PALETTE)).toBeUndefined();
  });
});
