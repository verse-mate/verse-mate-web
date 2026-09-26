import { describe, expect, it } from 'vitest';

import { statusBand } from './dashboardTheme';

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
