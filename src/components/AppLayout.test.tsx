import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { REPLAY_BLOCK_CLASS } from '@/lib/analyticsPrivacy';
import AppLayout from './AppLayout';

vi.mock('@/hooks/useMediaQuery', () => ({ useMediaQuery: () => false }));
vi.mock('@/components/DesktopLayout', () => ({ default: () => null }));
vi.mock('@/audio', () => ({ AudioPlayerRoot: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/contexts/JesusViewContext', () => ({ JesusViewProvider: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/contexts/TopicViewContext', () => ({ TopicViewProvider: ({ children }: { children: ReactNode }) => <>{children}</> }));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="*" element={<p>screen text</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('session replay on the coach screens', () => {
  it.each(['/coach', '/coach/trends', '/coach/monthly-summary', '/coach/leader/avery/manage', '/coach/admin/classes'])(
    'records nothing of %s',
    (path) => {
      renderAt(path);
      expect(screen.getByText('screen text').closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
    },
  );

  it.each(['/bookmarks', '/menu/settings', '/coaching-notes'])('still records %s', (path) => {
    renderAt(path);
    expect(screen.getByText('screen text').closest(`.${REPLAY_BLOCK_CLASS}`)).toBeNull();
  });
});
