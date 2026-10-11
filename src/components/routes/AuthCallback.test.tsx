import { render, screen } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AuthCallback from './AuthCallback';

vi.mock('@/contexts/AppContext', () => ({ useApp: () => ({ dispatch: vi.fn() }) }));
vi.mock('@/services/bibleService', () => ({
  fetchCurrentUser: vi.fn(async () => ({ id: 'u-1', name: 'Test Reader', email: 'reader@example.test' })),
}));

function visit(url: string) {
  window.history.pushState({ idx: 3, key: 'k-1', usr: null }, '', url);
  render(
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback/:provider" element={<AuthCallback />} />
        <Route path="/notes" element={<div>notes screen</div>} />
      </Routes>
    </BrowserRouter>,
  );
}

describe('the sign-in callback', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
    localStorage.clear();
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
