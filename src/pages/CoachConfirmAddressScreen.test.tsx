import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as coachService from '@/services/coachService';
import { CoachApiError } from '@/services/coachService';
import contract from '../../tests/e2e/coach/coach-contract.snapshot.json';
import CoachConfirmAddressScreen from './CoachConfirmAddressScreen';

const CHANGE = {
  leaderName: 'Leader A',
  currentEmail: 'le*******@example.test',
  newEmail: 'le*********@example.test',
  state: 'pending',
  expiresAt: '2026-10-16T15:00:00.000Z',
};

const POST_REFUSALS = contract.refusals['POST /coach/confirm-address'];

function refused(code: keyof typeof POST_REFUSALS) {
  const { status, message } = POST_REFUSALS[code];
  return new CoachApiError('confirm-address', status, message, { refusal: code });
}

function renderPage(path = '/coach/confirm-address?token=tok-1') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <CoachConfirmAddressScreen />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => vi.restoreAllMocks());

describe('the address confirmation page', () => {
  it('shows the leader and both masked addresses, and changes nothing until the confirm action is taken', async () => {
    const read = vi.spyOn(coachService, 'fetchAddressChange').mockResolvedValue(CHANGE);
    const confirm = vi.spyOn(coachService, 'confirmAddressChange').mockResolvedValue({ email: 'leader.new@example.test', noticeSent: false });
    renderPage();

    const pending = await screen.findByTestId('coach-confirm-address-pending');
    expect(read).toHaveBeenCalledWith('tok-1');
    expect(pending).toHaveTextContent('Leader A');
    expect(pending).toHaveTextContent('le*********@example.test');
    expect(pending).toHaveTextContent('le*******@example.test');
    expect(pending).toHaveTextContent('Nothing changes until you confirm');
    expect(pending).toHaveTextContent('Oct 16, 2026');
    expect(confirm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('coach-confirm-address-submit'));
    await waitFor(() => expect(confirm).toHaveBeenCalledWith('tok-1'));
    expect(await screen.findByTestId('coach-confirm-address-confirmed')).toHaveTextContent(
      "Confirmed. Leader A's coaching reports now go to le*********@example.test.",
    );
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['expired', 'This link expired on Oct 16, 2026, so the address was not changed. Ask your program admin to send a new one.'],
    ['superseded', 'A newer address change replaced this one, so this link no longer works. Use the most recent confirmation email.'],
    ['confirmed', "This change is already confirmed. Leader A's coaching reports go to le*********@example.test."],
    ['refused', 'This change was not made: another leader already uses that address. Your program admin has been shown why.'],
  ])('says in words what a %s change means, and offers no confirm', async (state, words) => {
    vi.spyOn(coachService, 'fetchAddressChange').mockResolvedValue({ ...CHANGE, state });
    renderPage();

    expect(await screen.findByTestId(`coach-confirm-address-${state}`)).toHaveTextContent(words);
    expect(screen.queryByTestId('coach-confirm-address-submit')).toBeNull();
  });

  it('says an unknown link is not valid, and an absent token too, without asking the server', async () => {
    const read = vi
      .spyOn(coachService, 'fetchAddressChange')
      .mockRejectedValue(new CoachApiError('confirm-address', 404, 'This confirmation link is not valid', { refusal: 'invalid-link' }));
    renderPage();
    expect(await screen.findByTestId('coach-confirm-address-invalid')).toHaveTextContent('This confirmation link is not valid.');

    read.mockClear();
    renderPage('/coach/confirm-address');
    expect((await screen.findAllByTestId('coach-confirm-address-invalid')).length).toBe(2);
    expect(read).not.toHaveBeenCalled();
  });

  it.each([
    ['expired', 'coach-confirm-address-expired'],
    ['superseded', 'coach-confirm-address-superseded'],
    ['already-confirmed', 'coach-confirm-address-confirmed'],
    ['taken', 'coach-confirm-address-refused'],
    ['invalid-link', 'coach-confirm-address-invalid'],
  ] as const)('reads a confirm refused as %s from its code', async (code, testId) => {
    vi.spyOn(coachService, 'fetchAddressChange').mockResolvedValue(CHANGE);
    vi.spyOn(coachService, 'confirmAddressChange').mockRejectedValue(refused(code));
    renderPage();

    fireEvent.click(await screen.findByTestId('coach-confirm-address-submit'));
    expect(await screen.findByTestId(testId)).toBeInTheDocument();
    expect(screen.queryByTestId('coach-confirm-address-submit')).toBeNull();
  });

  it('keeps the confirm on offer when the request fails for another reason', async () => {
    vi.spyOn(coachService, 'fetchAddressChange').mockResolvedValue(CHANGE);
    vi.spyOn(coachService, 'confirmAddressChange').mockRejectedValue(new CoachApiError('confirm-address', 500, 'database unavailable'));
    renderPage();

    fireEvent.click(await screen.findByTestId('coach-confirm-address-submit'));
    expect(await screen.findByTestId('coach-confirm-address-error')).toHaveTextContent('Server error (500): database unavailable');
    expect(screen.getByTestId('coach-confirm-address-submit')).not.toBeDisabled();
  });

  it('says the previous address was told once the change is confirmed and a notice went out', async () => {
    vi.spyOn(coachService, 'fetchAddressChange').mockResolvedValue(CHANGE);
    vi.spyOn(coachService, 'confirmAddressChange').mockResolvedValue({ email: 'leader.new@example.test', noticeSent: true });
    renderPage();

    fireEvent.click(await screen.findByTestId('coach-confirm-address-submit'));
    expect(await screen.findByTestId('coach-confirm-address-confirmed')).toHaveTextContent('A notice went to the previous address.');
  });
});
