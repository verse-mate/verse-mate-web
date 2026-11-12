import type { PostHog } from 'posthog-js';
import { expect, vi } from 'vitest';

export const KEY = 'test-key';
export const STORE = `ph_${KEY}_posthog`;
export const LEAKS = /jane|l-77|t-secret|t-hash|\?u=/;
export const RAW_REFERRER = 'https://mail.example.com/inbox?u=jane@example.com';
export const RAW_LANDING =
  'https://app.versemate.org/coach/leader/l-77?utm_source=nt44&utm_content=jane%2540example.com&token=t-secret#access_token=t-hash';
export const SCRUBBED_LANDING = 'https://app.versemate.org/coach/leader/:id?utm_source=nt44&utm_content=%5Bredacted%5D';

export type FlagsBody = { distinct_id?: string; person_properties?: Record<string, unknown> };

export function cookieText() {
  return decodeURIComponent(decodeURIComponent(document.cookie));
}

export function clearBrowserState() {
  window.localStorage.clear();
  window.sessionStorage.clear();
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (name) document.cookie = `${name}=; path=/; max-age=0`;
  }
}

export function seedStored(stored: Record<string, unknown>) {
  const value = JSON.stringify(stored);
  window.localStorage.setItem(STORE, value);
  document.cookie = `${STORE}=${encodeURIComponent(value)}; path=/`;
}

export function captureFlagCalls() {
  const calls: FlagsBody[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: { body?: unknown }) => {
      const body = typeof init?.body === 'string' ? init.body : '';
      if (String(url).includes('/flags')) {
        calls.push(JSON.parse(body.startsWith('data=') ? atob(decodeURIComponent(body.slice(5))) : body));
      }
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    }),
  );
  return calls;
}

export async function forceFlagsCall(client: PostHog, calls: FlagsBody[]) {
  const before = calls.length;
  client.set_config({ advanced_disable_feature_flags: false });
  client.reloadFeatureFlags();
  await vi.waitFor(() => expect(calls.length).toBeGreaterThan(before));
}

export function personProperties(calls: FlagsBody[], distinctId?: string) {
  return calls
    .filter((body) => distinctId === undefined || body.distinct_id === distinctId)
    .map((body) => body.person_properties ?? {});
}
