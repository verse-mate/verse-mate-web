import { describe, expect, it } from 'vitest';

import { dt, statusBand } from './dashboardTheme';

/**
 * The band colours on the leader's own dashboard.
 *
 * This was a switch naming all five labels with a rust default, the sixth
 * hand-maintained copy of the rubric in the portal. `coachService.statusColor`
 * had the same shape and was fixed; this one survived because nothing pointed
 * at it, and it is the copy the leader actually sees.
 */
const BANDS = ['Exceptional', 'Strong', 'On Target', 'Developing', 'Early Stage'];

describe('a status band is coloured by its POSITION in the served order', () => {
  it('gives the top band the top colour and the bottom band the bottom one', () => {
    expect(statusBand('Exceptional', BANDS).c).toBe(dt.green);
    expect(statusBand('Early Stage', BANDS).c).toBe(dt.rust);
  });

  it('a RENAMED top band keeps the top colour', () => {
    // Renaming a band in the backend used to drop it to the rust default, so
    // the leader having the best month on record was shown the worst colour.
    expect(statusBand('Outstanding', ['Outstanding', 'Strong']).c).toBe(dt.green);
  });

  it('is NEUTRAL before the served bands arrive', () => {
    // Every caller passes [] on first paint while the rubric is in flight.
    expect(statusBand('Strong', []).c).toBe(dt.textLight);
    expect(statusBand('Strong', []).c).not.toBe(dt.rust);
  });

  it('an unplaceable label is neutral, not the worst', () => {
    expect(statusBand('Nonsense', BANDS).c).toBe(dt.textLight);
    expect(statusBand('', BANDS).c).toBe(dt.textLight);
  });

  it('keeps the label it was given', () => {
    expect(statusBand('On Target', BANDS).label).toBe('On Target');
  });
});
