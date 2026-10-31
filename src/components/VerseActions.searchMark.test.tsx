import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VerseActions from './VerseActions';
import { AppProvider } from '@/contexts/AppContext';

function renderActions(props: Partial<React.ComponentProps<typeof VerseActions>> = {}) {
  const onClose = vi.fn();
  const onClearSearchMark = vi.fn();
  render(
    <MemoryRouter>
      <AppProvider>
        <VerseActions verse={7} onClose={onClose} onClearSearchMark={onClearSearchMark} {...props} />
      </AppProvider>
    </MemoryRouter>,
  );
  return { onClose, onClearSearchMark };
}

describe('VerseActions and the search mark', () => {
  it('offers Remove on a verse marked by search, and Remove clears the mark', () => {
    const { onClose, onClearSearchMark } = renderActions({ searchMarked: true });
    fireEvent.click(screen.getByTestId('verse-action-remove-highlight'));
    expect(onClearSearchMark).toHaveBeenCalled();
    return Promise.resolve().then(() => expect(onClose).toHaveBeenCalled());
  });

  it('shows no Remove on a plain verse', () => {
    renderActions();
    expect(screen.queryByTestId('verse-action-remove-highlight')).toBeNull();
  });
});
