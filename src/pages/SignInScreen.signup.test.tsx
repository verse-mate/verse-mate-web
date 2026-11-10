import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { signup } from '@/services/bibleService';
import SignInScreen from './SignInScreen';

vi.mock('@/lib/ssoCallback', () => ({ startSSOSignIn: vi.fn(async () => {}) }));
vi.mock('@/contexts/AppContext', () => ({ useApp: () => ({ dispatch: vi.fn() }) }));
vi.mock('@/services/bibleService', () => ({
  API_BASE_URL: 'https://api.example.test',
  login: vi.fn(),
  signup: vi.fn(async () => ({ id: 'u1', name: 'Ruth Moab', email: 'ruth@example.com' })),
}));

function openEmailSignup() {
  render(
    <MemoryRouter>
      <SignInScreen initialMode="signup" />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Sign up with Email' }));
  fireEvent.change(screen.getByTestId('login-email'), { target: { value: 'ruth@example.com' } });
  fireEvent.change(screen.getByTestId('login-password'), { target: { value: 'Sup3rSecret!pass' } });
}

describe('the email sign-up form', () => {
  afterEach(() => {
    vi.mocked(signup).mockClear();
  });

  it('sends the first and last name separately', async () => {
    openEmailSignup();
    fireEvent.change(screen.getByTestId('signup-first-name'), { target: { value: ' Ruth ' } });
    fireEvent.change(screen.getByTestId('signup-last-name'), { target: { value: 'Moab' } });
    fireEvent.click(screen.getByTestId('signup-submit'));

    await waitFor(() => expect(signup).toHaveBeenCalledTimes(1));
    expect(signup).toHaveBeenCalledWith({
      email: 'ruth@example.com',
      password: 'Sup3rSecret!pass',
      firstName: 'Ruth',
      lastName: 'Moab',
    });
  });

  it('asks for both names before calling the backend', () => {
    openEmailSignup();
    fireEvent.change(screen.getByTestId('signup-first-name'), { target: { value: 'Ruth' } });
    fireEvent.click(screen.getByTestId('signup-submit'));

    expect(signup).not.toHaveBeenCalled();
    expect(screen.getByTestId('login-error').textContent).toBe('Enter your first and last name');
  });
});
