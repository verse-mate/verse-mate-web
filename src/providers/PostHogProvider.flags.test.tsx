import type { PostHog } from 'posthog-js';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { type InitialInfoStore, scrubStoredInitialInfo } from '@/lib/analyticsPrivacy';
import {
  captureFlagCalls,
  clearBrowserState,
  cookieText,
  type FlagsBody,
  forceFlagsCall,
  KEY,
  LEAKS,
  personProperties,
  RAW_REFERRER,
  seedStored,
} from '@/test/posthogFlags';

let posthog: PostHog;
let calls: FlagsBody[];

describe('what /flags and the PostHog cookie carry on a first visit', () => {
  beforeAll(async () => {
    clearBrowserState();
    vi.stubEnv('VITE_POSTHOG_KEY', KEY);
    vi.stubEnv('DEV', false);
    calls = captureFlagCalls();
    Object.defineProperty(document, 'referrer', { value: RAW_REFERRER, configurable: true });
    window.history.pushState(
      {},
      '',
      '/coach/leader/l-77?utm_source=nt44&utm_content=jane%2540example.com&token=t-secret#access_token=t-hash',
    );
    posthog = (await import('posthog-js')).default;
    await import('./PostHogProvider');
  });

  afterAll(() => {
    Object.defineProperty(document, 'referrer', { value: '', configurable: true });
    window.history.replaceState({}, '', '/');
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    clearBrowserState();
  });

  it('keeps the landing query, hash, coach id and referrer query out of every /flags call and the cookie', async () => {
    expect(posthog.__loaded).toBe(true);
    posthog.capture('$pageview');
    await forceFlagsCall(posthog, calls);

    for (const props of personProperties(calls)) {
      expect(JSON.stringify(props)).not.toMatch(LEAKS);
      expect(props.$initial_current_url).toBe(
        `${window.location.origin}/coach/leader/:id?utm_source=nt44&utm_content=%5Bredacted%5D`,
      );
      expect(props.$initial_utm_source).toBe('nt44');
      expect(props.$initial_utm_content).toBe('[redacted]');
      expect(props.$initial_referrer).toBe('https://mail.example.com/inbox');
    }
    expect(cookieText()).toContain('$initial_person_info');
    expect(cookieText()).not.toMatch(LEAKS);
  });

  it('stores the scrubbed landing again after a logout resets PostHog', async () => {
    const { analytics } = await import('@/lib/analytics');
    analytics.reset();
    posthog.capture('$pageview');
    await forceFlagsCall(posthog, calls);

    for (const props of personProperties(calls, posthog.get_distinct_id())) {
      expect(JSON.stringify(props)).not.toMatch(LEAKS);
      expect(props.$initial_utm_content).toBe('[redacted]');
    }
    expect(cookieText()).not.toMatch(LEAKS);
  });

  it('cleans the older stored campaign and referrer records in place', async () => {
    clearBrowserState();
    seedStored({
      distinct_id: 'd-legacy',
      $initial_campaign_params: { utm_source: 'nt44', utm_content: 'jane%40example.com' },
      $initial_referrer_info: { $referrer: RAW_REFERRER, $referring_domain: 'mail.example.com' },
    });
    let client: PostHog | undefined;
    posthog.init(
      KEY,
      {
        persistence: 'localStorage+cookie',
        capture_pageview: false,
        loaded: (instance) => {
          scrubStoredInitialInfo((instance as PostHog).persistence as InitialInfoStore | undefined, window);
          client = instance as PostHog;
        },
      },
      'legacy',
    );
    await vi.waitFor(() => expect(client).toBeDefined());
    await forceFlagsCall(client as PostHog, calls);

    const sent = personProperties(calls, 'd-legacy');
    expect(sent.length).toBeGreaterThan(0);
    for (const props of sent) {
      expect(JSON.stringify(props)).not.toMatch(LEAKS);
      expect(props.$initial_utm_source).toBe('nt44');
      expect(props.$initial_utm_content).toBe('[redacted]');
      expect(props.$initial_referrer).toBe('https://mail.example.com/inbox');
    }
  });
});
