import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as coachService from '@/services/coachService';
import { CoachApiError } from '@/services/coachService';
import contract from '../../tests/e2e/coach/coach-contract.snapshot.json';
import CoachConfirmAddressScreen from './CoachConfirmAddressScreen';

const CHANGE = {
  leaderName: 'Leader A',
  newEmail: 'l***@example.test',
  state: 'pending' as const,
  expiresAt: '2026-10-16T15:00:00.000Z',
};

const POST_REFUSALS = contract.refusals['POST /coach/confirm-address'];

function refused(code: keyof typeof POST_REFUSALS) {
  const { status, message } = POST_REFUSALS[code];
  return new CoachApiError('confirm-address', status, message, { refusal: code });
}

function AddressBar() {
  const location = useLocation();
  return <output data-testid="address-bar">{`${location.pathname}${location.search}${location.hash}`}</output>;
}

function renderPage(path: string | { pathname: string; state: unknown } = '/coach/confirm-address?token=tok-1') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <CoachConfirmAddressScreen />
        <AddressBar />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => vi.restoreAllMocks());

describe('the address confirmation page', () => {
  it('shows the leader and the masked new address, and changes nothing until the confirm action is taken', async () => {
    const read = vi.spyOn(coachService, 'describeAddressChange').mockResolvedValue(CHANGE);
    const confirm = vi.spyOn(coachService, 'confirmAddressChange').mockResolvedValue({ email: 'leader.new@example.test', noticeSent: false });
    renderPage();

    const pending = await screen.findByTestId('coach-confirm-address-pending');
    expect(read).toHaveBeenCalledWith('tok-1');
    expect(pending).toHaveTextContent('Leader A');
    expect(pending).toHaveTextContent('go to l***@example.test.');
    expect(pending).not.toHaveTextContent('instead of');
    expect(pending).toHaveTextContent('Nothing changes until you confirm');
    expect(pending).toHaveTextContent('Oct 16, 2026');
    expect(confirm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('coach-confirm-address-submit'));
    await waitFor(() => expect(confirm).toHaveBeenCalledWith('tok-1'));
    expect(await screen.findByTestId('coach-confirm-address-confirmed')).toHaveTextContent(
      "Confirmed. Leader A's coaching reports now go to l***@example.test.",
    );
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it('takes the token out of the address bar, and still describes and confirms with it', async () => {
    const read = vi.spyOn(coachService, 'describeAddressChange').mockResolvedValue(CHANGE);
    const confirm = vi.spyOn(coachService, 'confirmAddressChange').mockResolvedValue({ email: 'leader.new@example.test', noticeSent: false });
    renderPage('/coach/confirm-address?token=tok-1');

    await screen.findByTestId('coach-confirm-address-pending');
    expect(screen.getByTestId('address-bar')).toHaveTextContent(/^\/coach\/confirm-address$/);
    expect(read).toHaveBeenCalledWith('tok-1');
    fireEvent.click(screen.getByTestId('coach-confirm-address-submit'));
    await waitFor(() => expect(confirm).toHaveBeenCalledWith('tok-1'));
  });

  it.each([
    ['a fragment link', '/coach/confirm-address#token=tok-1'],
    ['a query link already sent', '/coach/confirm-address?token=tok-1'],
    ['a fragment link with another query kept', '/coach/confirm-address?from=mail#token=tok-1'],
  ])('opens %s, strips the token from the address bar, and confirms nothing until asked', async (_, path) => {
    const read = vi.spyOn(coachService, 'describeAddressChange').mockResolvedValue(CHANGE);
    const confirm = vi.spyOn(coachService, 'confirmAddressChange').mockResolvedValue({ email: 'leader.new@example.test', noticeSent: false });
    renderPage(path);

    await screen.findByTestId('coach-confirm-address-pending');
    expect(screen.getByTestId('address-bar').textContent).toBe(path.includes('from=mail') ? '/coach/confirm-address?from=mail' : '/coach/confirm-address');
    expect(read).toHaveBeenCalledWith('tok-1');
    expect(read.mock.calls.every(([t]) => t === 'tok-1')).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('coach-confirm-address-submit'));
    await waitFor(() => expect(confirm).toHaveBeenCalledWith('tok-1'));
  });

  it('keeps describing and confirming after a reload, when the token lives only in history state', async () => {
    const read = vi.spyOn(coachService, 'describeAddressChange').mockResolvedValue(CHANGE);
    const confirm = vi.spyOn(coachService, 'confirmAddressChange').mockResolvedValue({ email: 'leader.new@example.test', noticeSent: false });
    renderPage({ pathname: '/coach/confirm-address', state: { token: 'tok-1' } });

    await screen.findByTestId('coach-confirm-address-pending');
    expect(read).toHaveBeenCalledWith('tok-1');
    expect(confirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('coach-confirm-address-submit'));
    await waitFor(() => expect(confirm).toHaveBeenCalledWith('tok-1'));
  });

  it.each([
    ['expired', 'This link expired on Oct 16, 2026, so the address was not changed. Ask your program admin to send a new one.'],
    ['superseded', 'A newer address change replaced this one, so this link no longer works. Use the most recent confirmation email.'],
    ['confirmed', 'This change is already confirmed, so this link no longer works.'],
    ['refused', 'This change was not made: another leader already uses that address. Your program admin has been shown why.'],
  ] as const)('says in words what a %s change means, names no one, and offers no confirm', async (state, words) => {
    vi.spyOn(coachService, 'describeAddressChange').mockResolvedValue({ state, expiresAt: CHANGE.expiresAt });
    renderPage();

    const shown = await screen.findByTestId(`coach-confirm-address-${state}`);
    expect(shown).toHaveTextContent(words);
    expect(shown).not.toHaveTextContent('Leader A');
    expect(shown).not.toHaveTextContent('@');
    expect(screen.queryByTestId('coach-confirm-address-submit')).toBeNull();
  });

  it('names no one once a confirm is refused because the link died meanwhile', async () => {
    vi.spyOn(coachService, 'describeAddressChange').mockResolvedValue(CHANGE);
    vi.spyOn(coachService, 'confirmAddressChange').mockRejectedValue(refused('already-confirmed'));
    renderPage();

    fireEvent.click(await screen.findByTestId('coach-confirm-address-submit'));
    const shown = await screen.findByTestId('coach-confirm-address-confirmed');
    expect(shown).not.toHaveTextContent('Leader A');
    expect(shown).not.toHaveTextContent('@');
  });

  it('says an unknown link is not valid, and an absent token too, without asking the server', async () => {
    const read = vi
      .spyOn(coachService, 'describeAddressChange')
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
    vi.spyOn(coachService, 'describeAddressChange').mockResolvedValue(CHANGE);
    vi.spyOn(coachService, 'confirmAddressChange').mockRejectedValue(refused(code));
    renderPage();

    fireEvent.click(await screen.findByTestId('coach-confirm-address-submit'));
    expect(await screen.findByTestId(testId)).toBeInTheDocument();
    expect(screen.queryByTestId('coach-confirm-address-submit')).toBeNull();
  });

  it('keeps the confirm on offer when the request fails for another reason', async () => {
    vi.spyOn(coachService, 'describeAddressChange').mockResolvedValue(CHANGE);
    vi.spyOn(coachService, 'confirmAddressChange').mockRejectedValue(new CoachApiError('confirm-address', 500, 'database unavailable'));
    renderPage();

    fireEvent.click(await screen.findByTestId('coach-confirm-address-submit'));
    expect(await screen.findByTestId('coach-confirm-address-error')).toHaveTextContent('Server error (500): database unavailable');
    expect(screen.getByTestId('coach-confirm-address-submit')).not.toBeDisabled();
  });

  it('says the previous address was told once the change is confirmed and a notice went out', async () => {
    vi.spyOn(coachService, 'describeAddressChange').mockResolvedValue(CHANGE);
    vi.spyOn(coachService, 'confirmAddressChange').mockResolvedValue({ email: 'leader.new@example.test', noticeSent: true });
    renderPage();

    fireEvent.click(await screen.findByTestId('coach-confirm-address-submit'));
    expect(await screen.findByTestId('coach-confirm-address-confirmed')).toHaveTextContent('A notice went to the previous address.');
  });
});
