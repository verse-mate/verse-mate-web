import { describe, expect, it } from 'vitest';
import { JESUS_RELATED_LIMIT, limitRelated } from './jesusRelated';

describe('limitRelated', () => {
  it('offers at most three', () => {
    expect(limitRelated([1, 2, 3, 4, 5, 6])).toEqual([1, 2, 3]);
    expect(JESUS_RELATED_LIMIT).toBe(3);
  });

  it('leaves a shorter list alone', () => {
    expect(limitRelated([1, 2])).toEqual([1, 2]);
    expect(limitRelated([])).toEqual([]);
  });
});
