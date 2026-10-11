import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { startSSOSignIn } from '@/lib/ssoCallback';
import ChapterNotesSheet from './ChapterNotesSheet';

vi.mock('@/lib/ssoCallback', () => ({ startSSOSignIn: vi.fn(async () => {}) }));
vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    state: { isSignedIn: false, notes: [] },
    dispatch: vi.fn(),
    addNote: vi.fn(),
    updateNote: vi.fn(),
    removeNote: vi.fn(),
  }),
}));
vi.mock('@/services/bibleService', () => ({
  API_BASE_URL: 'https://api.example.test',
  login: vi.fn(),
}));

describe('the chapter notes sheet SSO buttons', () => {
  afterEach(() => {
    vi.mocked(startSSOSignIn).mockClear();
    sessionStorage.clear();
  });

  for (const [label, testId, provider] of [
    ['Google', 'login-google-button', 'google'],
    ['Apple', 'login-apple-button', 'apple'],
  ] as const) {
    it(`starts ${label} sign-in with a challenge and keeps the draft`, () => {
      render(<ChapterNotesSheet book="John" bookId={43} chapter={3} onClose={vi.fn()} />);
      fireEvent.change(screen.getByTestId('chapter-notes-textarea'), {
        target: { value: 'A draft note' },
      });
      fireEvent.click(screen.getByTestId('chapter-notes-add-button'));

      fireEvent.click(screen.getByTestId(testId));

      expect(startSSOSignIn).toHaveBeenCalledTimes(1);
      expect(startSSOSignIn).toHaveBeenCalledWith(
        `https://api.example.test/auth/sso/${provider}/redirect`,
      );
      expect(sessionStorage.getItem('versemate.pending-chapter-note.43.3')).toBe('A draft note');
    });
  }
});
