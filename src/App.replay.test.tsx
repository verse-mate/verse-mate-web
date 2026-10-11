import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import appSource from './App.tsx?raw';

const COACH_PATHS = [
  '/coach',
  '/coach/sessions',
  '/coach/settings',
  '/coach/classes',
  '/coach/admin/classes',
  '/coach/monthly',
  '/coach/monthly-summary',
  '/coach/trends',
  '/coach/feedback',
  '/coach/leader/l-1',
  '/coach/leader/l-1/sessions',
  '/coach/leader/l-1/trends',
  '/coach/leader/l-1/manage',
  '/coach/leader/l-1/monthly',
];

describe('session replay on the coach portal', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    window.history.replaceState({}, '', '/');
  });

  it('lists every coach route the app declares', () => {
    expect(appSource.match(/path="\/coach/g)).toHaveLength(COACH_PATHS.length);
  });

  it.each(COACH_PATHS)('renders %s inside the replay block', async (path) => {
    window.history.pushState({}, '', path);
    render(<App />);
    expect((await screen.findByTestId('coach-replay-blocked')).classList.contains('ph-no-capture')).toBe(true);
  });

  it('leaves the rest of the app recorded', async () => {
    window.history.pushState({}, '', '/notes');
    render(<App />);
    expect(await screen.findByTestId('notes-back-button')).toBeTruthy();
    expect(screen.queryByTestId('coach-replay-blocked')).toBeNull();
  });
});
