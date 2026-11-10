import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { login, signup } from '@/services/bibleService';
import SignInScreen from './SignInScreen';

vi.mock('@/lib/ssoCallback', () => ({ startSSOSignIn: vi.fn(async () => {}) }));
vi.mock('@/contexts/AppContext', () => ({ useApp: () => ({ dispatch: vi.fn() }) }));
vi.mock('@/services/bibleService', () => ({
  API_BASE_URL: 'https://api.example.test',
  login: vi.fn(async () => ({ id: 'u1', name: 'Ruth Moab', email: 'ruth@example.com' })),
  signup: vi.fn(async () => ({ id: 'u1', name: 'Ruth Moab', email: 'ruth@example.com' })),
}));

const VALID_PASSWORD = 'Sup3rSecret1';

function openEmailForm(initialMode: 'signin' | 'signup') {
  render(
    <MemoryRouter>
      <SignInScreen initialMode={initialMode} />
    </MemoryRouter>,
  );
  fireEvent.click(
    screen.getByRole('button', { name: initialMode === 'signup' ? 'Sign up with Email' : 'Continue with Email' }),
  );
}

function fillSignup({ first = 'Ruth', last = 'Moab', email = 'ruth@example.com', password = VALID_PASSWORD } = {}) {
  openEmailForm('signup');
  fireEvent.change(screen.getByTestId('signup-first-name'), { target: { value: first } });
  fireEvent.change(screen.getByTestId('signup-last-name'), { target: { value: last } });
  fireEvent.change(screen.getByTestId('login-email'), { target: { value: email } });
  fireEvent.change(screen.getByTestId('login-password'), { target: { value: password } });
  fireEvent.click(screen.getByTestId('signup-submit'));
}

describe('the email sign-up form', () => {
  afterEach(() => {
    vi.mocked(signup).mockClear();
    vi.mocked(login).mockClear();
  });

  it('sends the trimmed first and last name', async () => {
    fillSignup({ first: ' Ruth ', last: ' Moab ' });

    await waitFor(() => expect(signup).toHaveBeenCalledTimes(1));
    expect(signup).toHaveBeenCalledWith({
      email: 'ruth@example.com',
      password: VALID_PASSWORD,
      firstName: 'Ruth',
      lastName: 'Moab',
    });
  });

  it.each([
    ['the last name is empty', { last: '' }],
    ['the first name is empty', { first: '' }],
    ['a name is only spaces', { last: '   ' }],
  ])('asks for both names before calling the backend when %s', (_case, input) => {
    fillSignup(input);

    expect(signup).not.toHaveBeenCalled();
    expect(screen.getByTestId('login-error').textContent).toBe('Enter your first and last name');
  });

  it.each([
    ['shorter than 8 characters', 'Abc1234'],
    ['longer than 20 characters', 'Abcdefghij1234567890x'],
    ['without a number', 'abcdefghij'],
    ['without a letter', '1234567890'],
  ])('explains the password rules before calling the backend when it is %s', (_case, password) => {
    fillSignup({ password });

    expect(signup).not.toHaveBeenCalled();
    expect(screen.getByTestId('login-error').textContent).toBe(
      'Use a password of 8 to 20 characters with at least one letter and one number',
    );
  });

  it('says the email is taken when the backend answers 409', async () => {
    vi.mocked(signup).mockRejectedValueOnce({ status: 409 });
    fillSignup();

    await waitFor(() =>
      expect(screen.getByTestId('login-error').textContent).toBe(
        'An account with this email already exists. Sign in instead.',
      ),
    );
  });

  it('signs in with a password the sign-up rules would refuse', async () => {
    openEmailForm('signin');
    fireEvent.change(screen.getByTestId('login-email'), { target: { value: 'ruth@example.com' } });
    fireEvent.change(screen.getByTestId('login-password'), { target: { value: 'an old long passphrase' } });
    fireEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => expect(login).toHaveBeenCalledWith('ruth@example.com', 'an old long passphrase'));
  });
});
