import type { PostHog } from 'posthog-js';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  captureFlagCalls,
  clearBrowserState,
  cookieText,
  type FlagsBody,
  forceFlagsCall,
  KEY,
  LEAKS,
  personProperties,
  RAW_LANDING,
  RAW_REFERRER,
  SCRUBBED_LANDING,
  STORE,
  seedStored,
} from '@/test/posthogFlags';

let posthog: PostHog;
let calls: FlagsBody[];

describe('what /flags and the PostHog cookie carry when an earlier visit stored the raw landing', () => {
  beforeAll(async () => {
    clearBrowserState();
    seedStored({ distinct_id: 'd-returning', $initial_person_info: { r: RAW_REFERRER, u: RAW_LANDING } });
    vi.stubEnv('VITE_POSTHOG_KEY', KEY);
    vi.stubEnv('DEV', false);
    calls = captureFlagCalls();
    window.history.pushState({}, '', '/bible/exodus/2');
    posthog = (await import('posthog-js')).default;
    await import('./PostHogProvider');
  });

  afterAll(() => {
    window.history.replaceState({}, '', '/');
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    clearBrowserState();
  });

  it('rewrites the stored value through the provider before any /flags call reads it', async () => {
    expect(posthog.__loaded).toBe(true);
    expect(posthog.get_distinct_id()).toBe('d-returning');
    await forceFlagsCall(posthog, calls);

    const sent = personProperties(calls, 'd-returning');
    expect(sent.length).toBeGreaterThan(0);
    for (const props of sent) {
      expect(JSON.stringify(props)).not.toMatch(LEAKS);
      expect(props.$initial_current_url).toBe(SCRUBBED_LANDING);
      expect(props.$initial_referrer).toBe('https://mail.example.com/inbox');
    }
    expect(cookieText()).not.toMatch(LEAKS);
    expect(JSON.parse(window.localStorage.getItem(STORE) ?? '{}').$initial_person_info).toEqual({
      r: 'https://mail.example.com/inbox',
      u: SCRUBBED_LANDING,
    });
  });
});
