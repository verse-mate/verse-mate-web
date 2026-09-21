import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookSelector from './BookSelector';
import { AppProvider } from '@/contexts/AppContext';

vi.mock('@/services/bibleService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/bibleService')>();
  return {
    ...actual,
    fetchBooks: vi.fn().mockResolvedValue([]),
    fetchTopics: vi.fn().mockResolvedValue([]),
    getRecentBooks: vi.fn().mockReturnValue([]),
  };
});

vi.mock('@/services/jesusService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/jesusService')>();
  return {
    ...actual,
    fetchJesusOverview: vi.fn().mockResolvedValue(null),
    fetchJesusEntries: vi.fn().mockResolvedValue({ entries: [] }),
  };
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <BookSelector onClose={() => {}} onSelect={() => {}} />
      </AppProvider>
    </MemoryRouter>
  );
}

// The active pill is the gold-filled one.
function activeTab(): string | undefined {
  return (['tab-old-testament', 'tab-new-testament', 'tab-jesus', 'tab-topics'] as const).find(id =>
    screen.getByTestId(id).className.includes('bg-gold')
  );
}

describe('BookSelector default tab', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens on Jesus when the search is launched from a Jesus screen', () => {
    renderAt('/jesus/event/you-must-be-born-again');
    expect(activeTab()).toBe('tab-jesus');
  });

  it('opens on Topics from the canonical topic URL', () => {
    renderAt('/topic/events/the-exodus');
    expect(activeTab()).toBe('tab-topics');
  });

  it('opens on Topics from the legacy /topics URL shape', () => {
    renderAt('/topics/12');
    expect(activeTab()).toBe('tab-topics');
  });

  it('still falls back to the testament of the current book while reading', () => {
    renderAt('/read');
    expect(activeTab()).toBe('tab-old-testament');
  });

  it('honors an explicit initialTab over the route', () => {
    render(
      <MemoryRouter initialEntries={['/jesus']}>
        <AppProvider>
          <BookSelector onClose={() => {}} onSelect={() => {}} initialTab="NT" />
        </AppProvider>
      </MemoryRouter>
    );
    expect(activeTab()).toBe('tab-new-testament');
  });
});
