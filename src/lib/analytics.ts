/**
 * Thin wrapper around posthog-js. Mirrors the API of the monorepo's
 * frontend-base/analytics module so future identify/track call sites
 * can be ported with minimal churn. All calls no-op when PostHog is
 * not initialized (i.e. when VITE_POSTHOG_KEY is not set in the build env).
 */

import posthog from 'posthog-js';
import { readFirstTouch, registerFirstTouch } from '@/lib/firstTouch';

type Registrar = { register: (properties: Record<string, unknown>) => unknown };

function safe<T>(fn: () => T): T | undefined {
  try {
    return fn();
  } catch {
    return undefined;
  }
}

export const analytics = {
  isEnabled(): boolean {
    return safe(() => posthog.__loaded === true) ?? false;
  },

  identify(distinctId: string, properties?: Record<string, unknown>) {
    safe(() => posthog.identify(distinctId, properties));
  },

  setUserProperties(properties: Record<string, unknown>) {
    safe(() => posthog.setPersonProperties(properties));
  },

  track(event: string, properties?: Record<string, unknown>) {
    safe(() => posthog.capture(event, properties));
  },

  captureException(error: Error, context?: Record<string, unknown>) {
    safe(() => posthog.captureException(error, context));
  },

  registerSurface(instance: Registrar = posthog) {
    safe(() => instance.register({ platform: 'web', surface: 'reader' }));
  },

  reset() {
    safe(() => posthog.reset());
    this.registerSurface();
    safe(() => {
      const touch = readFirstTouch(window.localStorage);
      if (touch) registerFirstTouch(posthog, touch);
    });
  },
};
