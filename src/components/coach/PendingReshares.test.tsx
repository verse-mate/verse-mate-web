import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as coachService from '@/services/coachService';
import PendingReshares from './PendingReshares';

const ONE = [
  {
    sourceSessionId: 'ff-1',
    coachId: 'jeff-ward',
    title: 'Obadiah, Lesson 4',
    sessionDate: '2026-08-22',
    requestedAt: '2026-08-25T00:00:00Z',
    attempts: 5,
    asked: false,
  },
];

const ASKED = [{ ...ONE[0], asked: true }];

afterEach(() => vi.restoreAllMocks());

describe('the re-share queue is visible', () => {
  it('lists a session waiting on a recording, with what was tried', async () => {
    // These sessions produce NO report by design, so without the queue they
    // simply disappear and the leader wonders why a week has no feedback.
    vi.spyOn(coachService, 'fetchPendingReshares').mockResolvedValue(ONE);
    render(<PendingReshares />);

    expect(await screen.findByTestId('coach-reshare-ff-1')).toBeInTheDocument();
    expect(screen.getByText(/Obadiah, Lesson 4/)).toBeInTheDocument();
    expect(screen.getByText(/5 attempts/)).toBeInTheDocument();
  });

  it('an EMPTY queue renders nothing, the normal case is not a panel', async () => {
    vi.spyOn(coachService, 'fetchPendingReshares').mockResolvedValue([]);
    const { container } = render(<PendingReshares />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('a session already asked about cannot be asked about twice', async () => {
    // The backend refuses the second send, so an enabled button here would
    // only produce an error the admin cannot act on.
    vi.spyOn(coachService, 'fetchPendingReshares').mockResolvedValue(ASKED);
    const send = vi.spyOn(coachService, 'sendReshareRequest');
    render(<PendingReshares />);

    const button = await screen.findByTestId('coach-reshare-send-ff-1');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Asked');
    fireEvent.click(button);
    expect(send).not.toHaveBeenCalled();
    // Marking it re-shared is still available: that is the other way back in.
    expect(screen.getByTestId('coach-reshare-resolve-ff-1')).not.toBeDisabled();
  });

  it('a non-admin (403) sees nothing rather than an error', async () => {
    vi.spyOn(coachService, 'fetchPendingReshares').mockRejectedValue(
      new Error('not_a_coach'),
    );
    const { container } = render(<PendingReshares />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});

describe('the two ways back in', () => {
  it('asking the leader sends, then refreshes the queue', async () => {
    const list = vi
      .spyOn(coachService, 'fetchPendingReshares')
      .mockResolvedValueOnce(ONE)
      .mockResolvedValueOnce([]);
    const send = vi
      .spyOn(coachService, 'sendReshareRequest')
      .mockResolvedValue({ sent: true });

    render(<PendingReshares />);
    fireEvent.click(await screen.findByTestId('coach-reshare-send-ff-1'));

    await waitFor(() => expect(send).toHaveBeenCalledWith('ff-1'));
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('marking it re-shared resolves, returning the session to retrieval', async () => {
    vi.spyOn(coachService, 'fetchPendingReshares')
      .mockResolvedValueOnce(ONE)
      .mockResolvedValueOnce([]);
    const resolve = vi
      .spyOn(coachService, 'resolveReshareRequest')
      .mockResolvedValue({ resolved: true });

    render(<PendingReshares />);
    fireEvent.click(await screen.findByTestId('coach-reshare-resolve-ff-1'));
    await waitFor(() => expect(resolve).toHaveBeenCalledWith('ff-1'));
  });

  it('a FAILED send says nothing was recorded as asked', async () => {
    // The admin has to know to try again; a silent failure leaves the session
    // waiting forever on a reply nobody was invited to give.
    vi.spyOn(coachService, 'fetchPendingReshares').mockResolvedValue(ONE);
    vi.spyOn(coachService, 'sendReshareRequest').mockRejectedValue(
      new Error('send failed'),
    );

    render(<PendingReshares />);
    fireEvent.click(await screen.findByTestId('coach-reshare-send-ff-1'));
    expect(await screen.findByTestId('coach-reshare-error')).toHaveTextContent(
      /Nothing was recorded as asked/,
    );
  });

  it('the row stays listed after a failed send', async () => {
    vi.spyOn(coachService, 'fetchPendingReshares').mockResolvedValue(ONE);
    vi.spyOn(coachService, 'sendReshareRequest').mockRejectedValue(
      new Error('send failed'),
    );
    render(<PendingReshares />);
    fireEvent.click(await screen.findByTestId('coach-reshare-send-ff-1'));
    await screen.findByTestId('coach-reshare-error');
    expect(screen.getByTestId('coach-reshare-ff-1')).toBeInTheDocument();
  });
});
