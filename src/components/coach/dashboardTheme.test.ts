import { describe, expect, it } from 'vitest';

import { ratingForScore, statusBand } from './dashboardTheme';

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

  it('a sixth band past the styled five is neutral', () => {
    expect(statusBand('Sixth', [...BANDS, 'Sixth']).c).toBe(NEUTRAL);
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
