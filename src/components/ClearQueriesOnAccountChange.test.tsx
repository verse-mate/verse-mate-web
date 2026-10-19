import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '@/lib/queryClient';
import { ClearQueriesOnAccountChange } from './ClearQueriesOnAccountChange';

const app = vi.hoisted(() => ({ userId: null as string | null }));
vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({ state: { userId: app.userId } }),
}));

const cached = () => queryClient.getQueryData(['coach', 'learning', 'program']);

function renderAs(userId: string | null) {
  app.userId = userId;
  const view = render(<ClearQueriesOnAccountChange />);
  return (next: string | null) => {
    app.userId = next;
    view.rerender(<ClearQueriesOnAccountChange />);
  };
}

describe('ClearQueriesOnAccountChange', () => {
  afterEach(() => queryClient.clear());

  it('keeps the cache when the first account signs in', () => {
    const switchTo = renderAs(null);
    queryClient.setQueryData(['coach', 'learning', 'program'], { modules: 1 });
    switchTo('user-a');
    expect(cached()).toEqual({ modules: 1 });
  });

  it("drops the app's cache when the account changes", () => {
    const switchTo = renderAs('user-a');
    queryClient.setQueryData(['coach', 'learning', 'program'], { modules: 1 });
    switchTo('user-b');
    expect(cached()).toBeUndefined();
  });

  it("drops the app's cache on sign-out", () => {
    const switchTo = renderAs('user-a');
    queryClient.setQueryData(['coach', 'learning', 'program'], { modules: 1 });
    switchTo(null);
    expect(cached()).toBeUndefined();
  });
});
