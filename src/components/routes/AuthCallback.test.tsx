import { render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { exchangeSSOCode } from '@/services/bibleService';
import { clearTokens, getAccessToken } from '@/services/api';
import AuthCallback from './AuthCallback';

vi.mock('@/contexts/AppContext', () => ({ useApp: () => ({ dispatch: vi.fn() }) }));
vi.mock('@/services/bibleService', () => ({
  fetchCurrentUser: vi.fn(async () => ({ id: 'u-1', name: 'Test Reader', email: 'reader@example.test' })),
  exchangeSSOCode: vi.fn(async () => ({ accessToken: 'session-token', verified: true })),
}));

function visit(url: string, { strict = false } = {}) {
  window.history.pushState({ idx: 3, key: 'k-1', usr: null }, '', url);
  const app = (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback/:provider" element={<AuthCallback />} />
        <Route path="/notes" element={<div>notes screen</div>} />
      </Routes>
    </BrowserRouter>
  );
  render(strict ? <StrictMode>{app}</StrictMode> : app);
}

describe('the sign-in callback', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
    localStorage.clear();
    clearTokens();
    vi.mocked(exchangeSSOCode).mockClear();
  });

  it('trades the one-time code for the session, clears the address bar and lands where the user was going', async () => {
    localStorage.setItem('redirectTo', '/notes');
    visit('/auth/callback/google?code=one-time-code');

    expect(window.location.href).not.toContain('one-time-code');
    expect(await screen.findByText('notes screen')).toBeTruthy();
    expect(exchangeSSOCode).toHaveBeenCalledTimes(1);
    expect(exchangeSSOCode).toHaveBeenCalledWith('one-time-code');
    expect(getAccessToken()).toBe('session-token');
  });

  it('spends the code once even when the effect runs twice', async () => {
    localStorage.setItem('redirectTo', '/notes');
    visit('/auth/callback/google?code=one-time-code', { strict: true });

    expect(await screen.findByText('notes screen')).toBeTruthy();
    expect(exchangeSSOCode).toHaveBeenCalledTimes(1);
  });

  it('shows the error when the code is refused and stores nothing', async () => {
    vi.mocked(exchangeSSOCode).mockRejectedValueOnce(new Error('Invalid or expired sign-in code'));
    visit('/auth/callback/apple?code=used-code');

    expect(await screen.findByText(/sign-in failed/i)).toBeTruthy();
    expect(window.location.href).not.toContain('used-code');
    expect(exchangeSSOCode).toHaveBeenCalledWith('used-code');
    expect(getAccessToken()).toBeNull();
  });

  it('takes the tokens out of the address bar and still lands where the user was going', async () => {
    localStorage.setItem('redirectTo', '/notes');
    visit('/auth/callback/google?accessToken=at-secret&refreshToken=rt-secret');

    expect(window.location.href).not.toContain('secret');
    expect(window.location.pathname).toBe('/auth/callback/google');
    expect(window.history.state).toMatchObject({ idx: 3, key: 'k-1' });
    expect(await screen.findByText('notes screen')).toBeTruthy();
    expect(window.location.pathname).toBe('/notes');
  });

  it('clears the address bar on a failed sign-in too and shows the error', async () => {
    visit('/auth/callback/google?error=access_denied&error_description=Nope&state=s-secret');

    expect(await screen.findByText(/sign-in failed/i)).toBeTruthy();
    expect(window.location.href).not.toContain('s-secret');
    expect(window.history.state).toMatchObject({ idx: 3, key: 'k-1' });
  });
});
