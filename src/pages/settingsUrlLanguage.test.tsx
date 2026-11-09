import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import SettingsScreen from './SettingsScreen';
import { getPreferredLanguageCode } from '@/hooks/usePreferredLanguage';

vi.hoisted(() => {
  window.history.replaceState(null, '', '/bible/john/3?lang=pt-BR');
});

vi.mock('@/services/bibleService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/bibleService')>();
  return {
    ...actual,
    fetchPendingEmail: vi.fn(async () => null),
    fetchBibleVersions: vi.fn(async () => []),
    fetchBibleLanguages: vi.fn(async () => [{ code: 'es-MX', name: 'Spanish', nativeName: 'Español' }]),
    updateUserPreferredLanguage: vi.fn(async () => {}),
  };
});

vi.mock('@/contexts/AppContext', async () => {
  const { loadSettings } = await vi.importActual<typeof import('@/services/bibleService')>('@/services/bibleService');
  const state = {
    isSignedIn: false,
    userId: null,
    userFirstName: null,
    userLastName: null,
    userEmail: null,
    userAvatarUrl: null,
    userPreferredLanguage: null,
    settings: loadSettings(),
  };
  return {
    useApp: () => ({ state, dispatch: vi.fn(), signOut: vi.fn(), restoreSession: vi.fn(async () => {}) }),
  };
});

describe('Settings language picker during a ?lang= visit', () => {
  it('switches the reader to the language the person picks', async () => {
    expect(getPreferredLanguageCode()).toBe('pt');
    window.history.replaceState(null, '', '/menu/settings');
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={['/menu/settings']}>
          <SettingsScreen />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByTestId('settings-language-button'));
    fireEvent.click(await screen.findByTestId('language-option-es-MX'));

    expect(getPreferredLanguageCode()).toBe('es');
  });
});
