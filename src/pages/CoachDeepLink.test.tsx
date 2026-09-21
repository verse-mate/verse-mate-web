import { describe, expect, it } from 'vitest';

import { resolveDeepLink } from './coachDeepLink';

/**
 * The deep-link resolution the dashboard actually calls.
 *
 * This file used to hold its own copy of the function, which meant it proved
 * only that the copy was right. Found by driving the real portal:
 * `Math.max(0, list.findIndex(...))` turns "not found" (-1) into index 0, so
 * `?s=<unknown>` silently rendered the LATEST session. An emailed link carrying
 * a stale id would have shown the leader a different session's score with
 * nothing on the page revealing the substitution.
 */
const LIST = [{ id: 'newest' }, { id: 'middle' }, { id: 'oldest' }];

describe('a deep link resolves to the session it names, or to nothing', () => {
  it('no id at all opens the most recent session', () => {
    expect(resolveDeepLink(LIST, null).selected?.id).toBe('newest');
    expect(resolveDeepLink(LIST, null).missing).toBe(false);
  });

  it('a known id opens THAT session, not the newest', () => {
    const r = resolveDeepLink(LIST, 'oldest');
    expect(r.selected?.id).toBe('oldest');
    // The index is what the dashboard reads to find the session BEFORE this
    // one, for the score delta.
    expect(r.index).toBe(2);
  });

  it('an UNKNOWN id is a not-found, never a silent substitution', () => {
    const r = resolveDeepLink(LIST, 'no-such-session');
    expect(r.missing).toBe(true);
    expect(r.selected).toBeNull();
    // The bug: Math.max(0, -1) === 0 would have returned the newest session.
    expect(r.selected).not.toEqual(LIST[0]);
  });

  it('an empty session list is EMPTY, not not-found', () => {
    // A leader with no sessions yet should see the empty state, not an error
    // telling them their link is broken.
    const r = resolveDeepLink([], 'anything');
    expect(r.missing).toBe(false);
    expect(r.selected).toBeNull();
  });

  it('an empty-string id behaves like no id', () => {
    expect(resolveDeepLink(LIST, '').selected?.id).toBe('newest');
    expect(resolveDeepLink(LIST, '').missing).toBe(false);
  });
});
