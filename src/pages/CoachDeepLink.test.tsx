import { describe, expect, it } from 'vitest';

/**
 * The deep-link resolution, extracted as the pure decision it is.
 *
 * Found by driving the real portal: `Math.max(0, list.findIndex(...))` turns
 * "not found" (-1) into index 0, so `?s=<unknown>` silently rendered the
 * LATEST session. An emailed link carrying a stale id would have shown the
 * leader a DIFFERENT session's score with nothing on the page revealing the
 * substitution — and every unit test passed, because none of them ever asked
 * for an id that was not in the list.
 */
function resolve(list: Array<{ id: string }>, selId: string | null) {
  const foundIdx = selId ? list.findIndex((r) => r.id === selId) : 0;
  const deepLinkMissing = selId != null && list.length > 0 && foundIdx === -1;
  const selectedIdx = foundIdx === -1 ? 0 : foundIdx;
  return {
    deepLinkMissing,
    selected: deepLinkMissing ? null : (list[selectedIdx] ?? null),
  };
}

const LIST = [{ id: 'newest' }, { id: 'middle' }, { id: 'oldest' }];

describe('a deep link resolves to the session it names, or to nothing', () => {
  it('no id at all opens the most recent session', () => {
    expect(resolve(LIST, null).selected?.id).toBe('newest');
    expect(resolve(LIST, null).deepLinkMissing).toBe(false);
  });

  it('a known id opens THAT session, not the newest', () => {
    expect(resolve(LIST, 'oldest').selected?.id).toBe('oldest');
  });

  it('an UNKNOWN id is a not-found, never a silent substitution', () => {
    const r = resolve(LIST, 'no-such-session');
    expect(r.deepLinkMissing).toBe(true);
    expect(r.selected).toBeNull();
    // The bug: Math.max(0, -1) === 0 would have returned the newest session.
    expect(r.selected).not.toEqual(LIST[0]);
  });

  it('an empty session list is EMPTY, not not-found', () => {
    // A leader with no sessions yet should see the empty-state, not an error
    // telling them their link is broken.
    const r = resolve([], 'anything');
    expect(r.deepLinkMissing).toBe(false);
    expect(r.selected).toBeNull();
  });

  it('an empty-string id behaves like no id', () => {
    expect(resolve(LIST, '').selected?.id).toBe('newest');
    expect(resolve(LIST, '').deepLinkMissing).toBe(false);
  });
});
