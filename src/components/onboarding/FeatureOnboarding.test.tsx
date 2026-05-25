import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FeatureOnboarding from './FeatureOnboarding';

const STORAGE_KEY = 'versemate-onboarding-seen';

// The seven screen titles in their intended order: an opening verse screen and
// two intro screens, then the three existing reading-feature screens, and the
// closing languages screen (which shows the finish action).
const SCREEN_TITLES = [
  'Explore any book. Any verse.',
  'Understand Scripture at every level',
  'Explore the bigger story',
  'Greek & Hebrew, one tap away',
  'The inductive method, step by step',
  'See the whole book at a glance',
  'Multiple languages. Always free. Worldwide.',
];

function renderOnboarding() {
  return render(
    <MemoryRouter initialEntries={['/read']}>
      <FeatureOnboarding />
    </MemoryRouter>,
  );
}

describe('FeatureOnboarding', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the welcome screen first on a fresh visit', () => {
    renderOnboarding();
    expect(screen.getByText(SCREEN_TITLES[0])).toBeInTheDocument();
  });

  it('advances through all seven screens in order, then finishes on the last', () => {
    renderOnboarding();

    for (let i = 0; i < SCREEN_TITLES.length; i++) {
      expect(screen.getByText(SCREEN_TITLES[i])).toBeInTheDocument();
      if (i < SCREEN_TITLES.length - 1) {
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
      }
    }

    // Final screen swaps the "Next"/"Skip" pair for the finish action.
    expect(screen.queryByRole('button', { name: 'Skip' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Start reading' }));
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1');
    expect(screen.queryByText(SCREEN_TITLES[SCREEN_TITLES.length - 1])).toBeNull();
  });

  it('persists the seen flag and hides when skipped', () => {
    renderOnboarding();
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1');
    expect(screen.queryByText(SCREEN_TITLES[0])).toBeNull();
  });

  it('does not show once the seen flag is already set', () => {
    localStorage.setItem(STORAGE_KEY, '1');
    renderOnboarding();
    expect(screen.queryByText(SCREEN_TITLES[0])).toBeNull();
  });
});
