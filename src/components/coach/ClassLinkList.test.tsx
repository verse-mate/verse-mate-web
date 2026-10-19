import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ClassLinkList from './ClassLinkList';
import type { CoachClass } from '@/services/coachService';

const thursday: CoachClass = {
  id: 'c1',
  name: 'Thursday — James',
  classDate: '2026-10-22',
  recurrence: 'weekly',
  zoomLink: 'https://zoom.us/j/1?pwd=x',
  startTime: '19:00',
  timeZone: 'America/Chicago',
  notetaker: true,
};

describe('ClassLinkList', () => {
  it('says when each class meets and whether the notetaker can join it, with nothing to edit', () => {
    render(<ClassLinkList classes={[thursday, { ...thursday, id: 'c2', name: 'Saturday — Acts', notetaker: false }]} />);

    expect(screen.getAllByTestId('coach-class-link-row')).toHaveLength(2);
    expect(screen.getAllByTestId('coach-class-when')[0]).toHaveTextContent('Thursdays at 7:00 PM (America/Chicago)');
    expect(screen.getAllByTestId('coach-class-notetaker-state').map((el) => el.textContent?.trim())).toEqual([
      'Notetaker records this class',
      'Notetaker off',
    ]);
    expect(screen.getAllByText('https://zoom.us/j/1?pwd=x', { selector: 'a' })).toHaveLength(2);
    expect(screen.queryByTestId('coach-class-edit')).toBeNull();
    expect(screen.queryByTestId('coach-class-delete')).toBeNull();
  });

  it('says so when the leader has no classes yet', () => {
    render(<ClassLinkList classes={[]} />);
    expect(screen.getByTestId('coach-class-links-empty')).toBeInTheDocument();
  });
});
