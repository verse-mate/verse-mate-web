import type { PostHog } from 'posthog-js';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { type InitialInfoStore, scrubStoredInitialInfo } from '@/lib/analyticsPrivacy';

const KEY = 'test-key';
const STORE = `ph_${KEY}_posthog`;
const RAW_INFO = {
  r: 'https://mail.example.com/inbox?u=jane@example.com',
  u: 'https://app.versemate.org/coach/leader/l-77?utm_source=nt44&utm_content=jane%2540example.com',
};

const flagCalls: Record<string, unknown>[] = [];
let posthog: PostHog;

function cookieText() {
  return decodeURIComponent(decodeURIComponent(document.cookie));
}

function clearBrowserState() {
  window.localStorage.clear();
  window.sessionStorage.clear();
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (name) document.cookie = `${name}=; path=/; max-age=0`;
  }
}

async function askForFlags(client: PostHog) {
  const before = flagCalls.length;
  client.set_config({ advanced_disable_feature_flags: false });
  client.reloadFeatureFlags();
  await vi.waitFor(() => expect(flagCalls.length).toBeGreaterThan(before));
  return flagCalls.slice(before).map((body) => body.person_properties as Record<string, unknown>);
}

let instance = 0;

async function returningVisit(path: string, stored: Record<string, unknown>) {
  clearBrowserState();
  const seeded = JSON.stringify({ distinct_id: `d-${instance}`, ...stored });
  window.localStorage.setItem(STORE, seeded);
  document.cookie = `${STORE}=${encodeURIComponent(seeded)}; path=/`;
  window.history.pushState({}, '', path);
  instance += 1;
  let loaded: PostHog | undefined;
  posthog.init(
    KEY,
    {
      persistence: 'localStorage+cookie',
      capture_pageview: false,
      loaded: (client) => {
        scrubStoredInitialInfo((client as PostHog).persistence as InitialInfoStore | undefined, window);
        loaded = client as PostHog;
        client.capture('$pageview');
      },
    },
    `returning-${instance}`,
  );
  await vi.waitFor(() => expect(loaded).toBeDefined());
  return askForFlags(loaded as PostHog);
}

describe('what /flags and the PostHog cookie carry from the landing page', () => {
  beforeAll(async () => {
    clearBrowserState();
    vi.stubEnv('VITE_POSTHOG_KEY', KEY);
    vi.stubEnv('DEV', false);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: { body?: unknown }) => {
        const body = typeof init?.body === 'string' ? init.body : '';
        if (String(url).includes('/flags')) {
          flagCalls.push(JSON.parse(body.startsWith('data=') ? atob(decodeURIComponent(body.slice(5))) : body));
        }
        return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
      }),
    );
    window.history.pushState({}, '', '/coach/leader/l-77?utm_source=nt44&utm_content=jane%2540example.com');
    posthog = (await import('posthog-js')).default;
    await import('./PostHogProvider');
  });

  afterEach(() => window.history.replaceState({}, '', '/'));

  it('keeps an email in a landing UTM out of /flags and the cookie on the first visit', async () => {
    expect(posthog.__loaded).toBe(true);
    posthog.capture('$pageview');
    const sent = await askForFlags(posthog);

    for (const props of sent) {
      expect(JSON.stringify(props)).not.toMatch(/jane|l-77/);
      expect(props.$initial_utm_source).toBe('nt44');
      expect(props.$initial_utm_content).toBe('[redacted]');
      expect(props.$initial_pathname).toBe('/coach/leader/:id');
    }
    expect(cookieText()).toContain('$initial_person_info');
    expect(cookieText()).not.toMatch(/jane|l-77/);
  });

  it('cleans a raw landing URL an earlier visit stored before /flags reads it', async () => {
    const sent = await returningVisit('/bible/exodus/2', { $initial_person_info: RAW_INFO });

    for (const props of sent) {
      expect(JSON.stringify(props)).not.toMatch(/jane|l-77|\?u=/);
      expect(props.$initial_referrer).toBe('https://mail.example.com/inbox');
      expect(props.$initial_utm_content).toBe('[redacted]');
    }
    expect(cookieText()).not.toMatch(/jane|l-77/);
  });

  it('cleans the older stored campaign and referrer records in place', async () => {
    const sent = await returningVisit('/bible/exodus/2', {
      $initial_campaign_params: { utm_source: 'nt44', utm_content: 'jane%40example.com' },
      $initial_referrer_info: { $referrer: RAW_INFO.r, $referring_domain: 'mail.example.com' },
    });

    for (const props of sent) {
      expect(JSON.stringify(props)).not.toMatch(/jane|\?u=/);
      expect(props.$initial_utm_source).toBe('nt44');
      expect(props.$initial_referrer).toBe('https://mail.example.com/inbox');
    }
  });
});
