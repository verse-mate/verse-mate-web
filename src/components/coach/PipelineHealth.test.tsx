import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { REPLAY_BLOCK_CLASS } from '@/lib/analyticsPrivacy';

import * as coachService from '@/services/coachService';
import { CoachApiError, CoachAuthError } from '@/services/coachService';
import PipelineHealth from './PipelineHealth';

const PARKED = {
  sourceSessionId: 'ff-1',
  coachId: 'milo-kerr',
  title: 'Obadiah, Lesson 4',
  sessionDate: '2026-08-22',
  state: 'scoring_failed',
  attempts: 3,
  reportId: null,
  reason: 'the model answer failed validation',
  holdKind: null,
  parallelRun: false,
  sessionStartedAt: null,
  action: 'requeue' as const,
  updatedAt: '2026-08-23T00:00:00Z',
};

const HELD = {
  sourceSessionId: 'ff-2',
  coachId: 'amy-lee',
  title: 'Ruth, Lesson 1',
  sessionDate: '2026-08-29',
  state: 'scored',
  attempts: 0,
  reportId: 'rep-2',
  reason: 'injection tripwire',
  holdKind: 'review' as const,
  parallelRun: false,
  sessionStartedAt: null,
  action: 'release' as const,
  updatedAt: '2026-08-30T00:00:00Z',
};

const UNRESOLVED = {
  sourceSessionId: 'ff-4',
  coachId: null,
  title: 'Zephaniah study',
  sessionDate: '2026-09-29',
  state: 'observed',
  attempts: 0,
  reportId: null,
  reason: 'unattributed: no leader matched the session title',
  holdKind: null,
  parallelRun: false,
  sessionStartedAt: null,
  action: 'attribute' as const,
  updatedAt: '2026-09-30T00:00:00Z',
};

const SKIPPED = {
  sourceSessionId: 'ff-5',
  coachId: 'wyatt-wellington',
  title: 'Micah, Lesson 2',
  sessionDate: '2026-09-27',
  state: 'delivered',
  attempts: 0,
  reportId: 'rep-5',
  reason: 'delivered, but not emailed to wyatt-wellington@needs-real-email.invalid: placeholder address',
  holdKind: null,
  parallelRun: false,
  sessionStartedAt: null,
  action: null,
  updatedAt: '2026-09-28T00:00:00Z',
};

const ROSTER = [
  { id: 'milo-kerr', name: 'Milo Kerr', group: '', coachName: '', sessionCount: 4, latest: null },
  { id: 'amy-lee', name: 'Amy Lee', group: '', coachName: '', sessionCount: 1, latest: null },
  { id: 'wyatt-wellington', name: 'Wyatt Wellington', group: '', coachName: '', sessionCount: 2, latest: null },
];

const COVERAGE: coachService.CoverageReport = {
  windowDays: 30,
  allCovered: false,
  leaders: [
    {
      coachId: 'milo-kerr',
      name: 'Milo Kerr',
      email: 'milo@example.test',
      covered: true,
      basis: 'observed',
      observedSessions: 4,
      accountStatus: 'has-account',
      linkedClassName: 'Saturday Morning',
      classAlert: false,
      attestedAt: null,
      attestedBy: null,
    },
    {
      coachId: 'amy-lee',
      name: 'Amy Lee',
      email: 'amy@example.test',
      covered: false,
      basis: 'no-observation',
      observedSessions: 0,
      accountStatus: 'has-account',
      linkedClassName: 'Tuesday Evening',
      classAlert: true,
      attestedAt: null,
      attestedBy: null,
    },
  ],
};

function page(sessions: coachService.PipelineFailure[], total = sessions.length, offset = 0) {
  return { sessions, total, limit: 50, offset };
}

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <PipelineHealth />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.spyOn(coachService, 'fetchAdminCoaches').mockResolvedValue(ROSTER);
});

afterEach(() => vi.restoreAllMocks());

describe('what is stuck in the pipeline', () => {
  it('lists each stuck session with why it is stuck', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([PARKED, HELD]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    const row = await screen.findByTestId('coach-pipeline-ff-1');
    expect(row).toHaveTextContent('Obadiah, Lesson 4');
    expect(row).toHaveTextContent('the model answer failed validation');
    expect(screen.getByTestId('coach-pipeline-ff-2')).toHaveTextContent('injection tripwire');
  });

  it('puts a parked session back in the queue', async () => {
    const list = vi
      .spyOn(coachService, 'fetchPipelineFailures')
      .mockResolvedValueOnce(page([PARKED]))
      .mockResolvedValueOnce(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    const requeue = vi.spyOn(coachService, 'requeuePipelineFailure').mockResolvedValue({ requeued: true });
    renderView();

    fireEvent.click(await screen.findByTestId('coach-pipeline-requeue-ff-1'));
    await waitFor(() => expect(requeue).toHaveBeenCalledWith('ff-1'));
    await waitFor(() => expect(screen.queryByTestId('coach-pipeline-ff-1')).toBeNull());
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('keeps the session title out of the confirmation toast, which sits outside the replay block', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([PARKED]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'requeuePipelineFailure').mockResolvedValue({ requeued: true });
    const success = vi.spyOn(toast, 'success');
    renderView();

    fireEvent.click(await screen.findByTestId('coach-pipeline-requeue-ff-1'));
    await waitFor(() => expect(success).toHaveBeenCalledWith('Back in the queue.'));
    expect(JSON.stringify(success.mock.calls)).not.toContain(PARKED.title);
  });

  it('releases a report held for review, by its report id', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([HELD]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    const release = vi.spyOn(coachService, 'releaseHeldReport').mockResolvedValue({ delivered: true });
    renderView();

    fireEvent.click(await screen.findByTestId('coach-pipeline-release-ff-2'));
    await waitFor(() => expect(release).toHaveBeenCalledWith('rep-2'));
    expect(await screen.findByTestId('coach-pipeline-outcome-ff-2')).toHaveTextContent(/delivered/i);
  });

  it('keeps a release disabled while it is in flight, whatever another row does', async () => {
    const other = { ...HELD, sourceSessionId: 'ff-3', reportId: 'rep-3', title: 'Ruth, Lesson 2' };
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([HELD, other]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    const pending: Record<string, (o: { delivered: boolean }) => void> = {};
    const release = vi
      .spyOn(coachService, 'releaseHeldReport')
      .mockImplementation((id) => new Promise((resolve) => { pending[id] = resolve; }));
    renderView();

    const first = await screen.findByTestId('coach-pipeline-release-ff-2');
    fireEvent.click(first);
    fireEvent.click(screen.getByTestId('coach-pipeline-release-ff-3'));
    await waitFor(() => expect(release).toHaveBeenCalledTimes(2));
    expect(first).toBeDisabled();

    pending['rep-3']({ delivered: false });
    await screen.findByTestId('coach-pipeline-outcome-ff-3');
    expect(first).toBeDisabled();
    fireEvent.click(first);
    expect(release).toHaveBeenCalledTimes(2);

    pending['rep-2']({ delivered: false });
    await waitFor(() => expect(first).not.toBeDisabled());
  });

  it('offers no release on a session that has no report', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([PARKED]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    await screen.findByTestId('coach-pipeline-ff-1');
    expect(screen.queryByTestId('coach-pipeline-release-ff-1')).toBeNull();
  });

  it('shows a release the server declined in words, with its reasons', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([HELD]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'releaseHeldReport').mockResolvedValue({
      delivered: false,
      refusal: 'governance-blocked',
      violations: ['benchmark-name: in the body'],
    });
    renderView();

    fireEvent.click(await screen.findByTestId('coach-pipeline-release-ff-2'));
    const outcome = await screen.findByTestId('coach-pipeline-outcome-ff-2');
    expect(outcome).toHaveTextContent('Not delivered: it breaks a governance rule (benchmark-name: in the body)');
    expect(outcome).not.toHaveTextContent('governance-blocked');
  });

  it.each(['send-failed', 'awaiting-release', 'already-delivered', 'in-flight', 'unknown-report'])(
    'shows a release declined as %s in words, never as its code',
    async (refusal) => {
      vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([HELD]));
      vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
      vi.spyOn(coachService, 'releaseHeldReport').mockResolvedValue({ delivered: false, refusal });
      renderView();

      fireEvent.click(await screen.findByTestId('coach-pipeline-release-ff-2'));
      const outcome = await screen.findByTestId('coach-pipeline-outcome-ff-2');
      expect(outcome).toHaveTextContent(`Not delivered: ${coachService.refusalWords(refusal)}`);
      expect(outcome).not.toHaveTextContent(refusal);
    },
  );

  it('shows an action the server refused as a refusal', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([PARKED]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'requeuePipelineFailure').mockRejectedValue(
      new CoachApiError('admin/pipeline-failures/ff-1/requeue', 404, 'No parked session'),
    );
    renderView();

    fireEvent.click(await screen.findByTestId('coach-pipeline-requeue-ff-1'));
    expect(await screen.findByTestId('coach-pipeline-outcome-ff-1')).toHaveTextContent('No parked session');
  });

  it('shows one page at a time with the total, and asks the server for the next and previous page', async () => {
    const list = vi
      .spyOn(coachService, 'fetchPipelineFailures')
      .mockImplementation(async (offset = 0) =>
        page([{ ...PARKED, sourceSessionId: `ff-at-${offset}`, title: `Session at ${offset}` }], 120, offset),
      );
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    expect(await screen.findByTestId('coach-pipeline-ff-at-0')).toBeInTheDocument();
    expect(screen.getByTestId('coach-pipeline-paging')).toHaveTextContent('1 to 50 of 120');
    expect(screen.getByTestId('coach-pipeline-newer')).toBeDisabled();
    fireEvent.click(screen.getByTestId('coach-pipeline-older'));
    expect(await screen.findByTestId('coach-pipeline-ff-at-50')).toBeInTheDocument();
    expect(screen.getByTestId('coach-pipeline-paging')).toHaveTextContent('51 to 100 of 120');
    fireEvent.click(screen.getByTestId('coach-pipeline-older'));
    expect(await screen.findByTestId('coach-pipeline-ff-at-100')).toBeInTheDocument();
    expect(screen.getByTestId('coach-pipeline-paging')).toHaveTextContent('101 to 120 of 120');
    expect(screen.getByTestId('coach-pipeline-older')).toBeDisabled();
    fireEvent.click(screen.getByTestId('coach-pipeline-newer'));
    expect(await screen.findByTestId('coach-pipeline-ff-at-50')).toBeInTheDocument();
    expect(list.mock.calls.map((c) => c[0])).toEqual([0, 50, 100, 50]);
  });

  it('steps back a page when acting on the last row of the last page empties it', async () => {
    let total = 51;
    const list = vi.spyOn(coachService, 'fetchPipelineFailures').mockImplementation(async (offset = 0) => {
      if (offset === 0) return page([{ ...PARKED, sourceSessionId: 'ff-first' }], total, 0);
      return page(total > 50 ? [{ ...PARKED, sourceSessionId: 'ff-last' }] : [], total, offset);
    });
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'requeuePipelineFailure').mockImplementation(async () => {
      total = 50;
      return { requeued: true };
    });
    renderView();

    fireEvent.click(await screen.findByTestId('coach-pipeline-older'));
    fireEvent.click(await screen.findByTestId('coach-pipeline-requeue-ff-last'));
    expect(await screen.findByTestId('coach-pipeline-ff-first')).toBeInTheDocument();
    expect(list.mock.calls.at(-1)?.[0]).toBe(0);
  });

  it('offers no paging when everything fits on one page', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([PARKED]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    await screen.findByTestId('coach-pipeline-ff-1');
    expect(screen.queryByTestId('coach-pipeline-paging')).toBeNull();
  });

  it('says so when nothing is stuck', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    expect(await screen.findByTestId('coach-pipeline-empty')).toBeInTheDocument();
  });

  it('shows a refusal from the server as a refusal, never as an empty queue', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockRejectedValue(new CoachAuthError('not_a_coach'));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    expect(await screen.findByTestId('coach-pipeline-refused')).toBeInTheDocument();
    expect(screen.queryByTestId('coach-pipeline-empty')).toBeNull();
  });

  it('shows a server failure as a failure, never as an empty queue', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockRejectedValue(
      new CoachApiError('admin/pipeline-failures', 500, ''),
    );
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    expect(await screen.findByTestId('coach-pipeline-failed')).toBeInTheDocument();
    expect(screen.queryByTestId('coach-pipeline-empty')).toBeNull();
  });
});

describe('recording-bot coverage', () => {
  it('shows every leader with whether the bot covers them', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    expect(await screen.findByTestId('coach-coverage-summary')).toHaveTextContent(/1 of 2/);
    expect(screen.getByTestId('coach-coverage-milo-kerr')).toHaveTextContent(/covered/i);
    expect(screen.getByTestId('coach-coverage-amy-lee')).toHaveTextContent(/not covered/i);
  });

  it('says in words whether a leader has a VerseMate account', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue({
      ...COVERAGE,
      leaders: [COVERAGE.leaders[0], { ...COVERAGE.leaders[1], accountStatus: 'no-account' }],
    });
    renderView();

    expect(await screen.findByTestId('coach-coverage-milo-kerr')).toHaveTextContent('has a VerseMate account · 4 observed sessions');
    expect(screen.getByTestId('coach-coverage-amy-lee')).toHaveTextContent('no VerseMate account · 0 observed sessions');
    expect(screen.getByTestId('coach-coverage-milo-kerr')).not.toHaveTextContent('has-account');
  });

  it('shows a coverage refusal as a refusal', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockRejectedValue(new CoachAuthError('not_a_coach'));
    renderView();

    expect(await screen.findByTestId('coach-coverage-refused')).toBeInTheDocument();
  });
});

describe("a leader's address", () => {
  const PLACEHOLDER = {
    ...COVERAGE.leaders[1],
    coachId: 'wyatt-wellington',
    name: 'Wyatt Wellington',
    email: 'wyatt-wellington@needs-real-email.invalid',
  };

  it('shows a placeholder address as no real address yet, and a real one only outside session replay', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue({ ...COVERAGE, leaders: [COVERAGE.leaders[0], PLACEHOLDER] });
    renderView();

    const placeholder = await screen.findByTestId('coach-address-wyatt-wellington');
    expect(placeholder).toHaveTextContent('No real address yet');
    expect(placeholder).not.toHaveTextContent('needs-real-email');
    const real = screen.getByTestId('coach-address-milo-kerr');
    expect(real).toHaveTextContent('milo@example.test');
    expect(real.closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
  });

  it("sends a confirmation link for a leader's new address, keeps the shown address, and reads coverage again", async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    const coverage = vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue({ ...COVERAGE, leaders: [PLACEHOLDER] });
    const update = vi.spyOn(coachService, 'updateLeaderEmail').mockResolvedValue({ email: 'wyatt@example.test', status: 'pending', expiresAt: '2026-10-16T15:00:00.000Z', confirmationSent: true });
    const success = vi.spyOn(toast, 'success');
    renderView();

    fireEvent.click(await screen.findByTestId('coach-address-edit-wyatt-wellington'));
    fireEvent.change(screen.getByTestId('coach-address-input-wyatt-wellington'), {
      target: { value: 'wyatt@example.test' },
    });
    fireEvent.click(screen.getByTestId('coach-address-save-wyatt-wellington'));

    await waitFor(() => expect(update).toHaveBeenCalledWith('wyatt-wellington', 'wyatt@example.test', false));
    await waitFor(() => expect(screen.queryByTestId('coach-address-input-wyatt-wellington')).toBeNull());
    expect(success).toHaveBeenCalledWith(
      'A confirmation link went to the new address. The address changes only once it is confirmed there, by Oct 16, 2026; reports keep going to the current address until then.',
    );
    expect(screen.getByTestId('coach-address-wyatt-wellington')).toHaveTextContent('No real address yet');
    await waitFor(() => expect(coverage).toHaveBeenCalledTimes(2));
  });

  it('shows a pending, expired or refused address change beside the address, from the roster', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue({
      ...COVERAGE,
      leaders: [COVERAGE.leaders[0], COVERAGE.leaders[1], { ...COVERAGE.leaders[1], coachId: 'wyatt-wellington', name: 'Wyatt Wellington', email: 'wyatt@example.test' }],
    });
    const change = (state: coachService.AddressChange['state'], newEmail: string, reason: string | null = null) => ({
      newEmail,
      state,
      reason,
      requestedAt: '2026-10-09T14:00:00.000Z',
      expiresAt: '2026-10-16T14:00:00.000Z',
    });
    vi.spyOn(coachService, 'fetchAdminCoaches').mockResolvedValue([
      { ...ROSTER[0], addressChange: change('pending', 'milo.new@example.test') },
      { ...ROSTER[1], addressChange: change('expired', 'amy.new@example.test') },
      { ...ROSTER[2], addressChange: change('refused', 'taken@example.test', 'taken') },
    ]);
    renderView();

    const pending = await screen.findByTestId('coach-address-change-milo-kerr');
    expect(pending).toHaveTextContent('Awaiting confirmation: milo.new@example.test, requested Oct 9, 2026, link expires Oct 16, 2026');
    expect(pending.closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
    expect(screen.getByTestId('coach-address-milo-kerr')).toHaveTextContent('milo@example.test');
    expect(screen.getByTestId('coach-address-change-amy-lee')).toHaveTextContent(
      'Not confirmed: the link to amy.new@example.test, requested Oct 9, 2026, expired Oct 16, 2026. Change the address again to send a new one.',
    );
    expect(screen.getByTestId('coach-address-change-wyatt-wellington')).toHaveTextContent(
      'Not changed: taken@example.test, requested Oct 9, 2026, was refused when it confirmed, because another leader already uses it.',
    );
  });

  it('shows no address change when the roster carries none', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    await screen.findByTestId('coach-address-milo-kerr');
    expect(screen.queryByTestId('coach-address-change-milo-kerr')).toBeNull();
  });

  it('says plainly when the confirmation email could not be sent, and when the address was already the leader\'s', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'updateLeaderEmail')
      .mockResolvedValueOnce({ email: 'amy.new@example.test', status: 'pending', expiresAt: '2026-10-16T15:00:00.000Z', confirmationSent: false })
      .mockResolvedValueOnce({ email: 'amy@example.test', status: 'unchanged', expiresAt: null, confirmationSent: false });
    const success = vi.spyOn(toast, 'success');
    const warning = vi.spyOn(toast, 'warning');
    renderView();

    fireEvent.click(await screen.findByTestId('coach-address-edit-amy-lee'));
    fireEvent.change(screen.getByTestId('coach-address-input-amy-lee'), { target: { value: 'amy.new@example.test' } });
    fireEvent.click(screen.getByTestId('coach-address-save-amy-lee'));
    await waitFor(() =>
      expect(warning).toHaveBeenCalledWith(
        'The address change is waiting for confirmation, but the confirmation email was not sent. Nothing changes until it is confirmed; save the address again to send a new link.',
      ),
    );

    fireEvent.click(await screen.findByTestId('coach-address-edit-amy-lee'));
    fireEvent.change(screen.getByTestId('coach-address-input-amy-lee'), { target: { value: 'amy@example.test' } });
    fireEvent.click(screen.getByTestId('coach-address-save-amy-lee'));
    await waitFor(() => expect(success).toHaveBeenCalledWith('That is already the leader\'s address. Nothing changed.'));
  });

  it("asks the admin to confirm a change to the benchmark leader's address, then sends it confirmed", async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    const update = vi
      .spyOn(coachService, 'updateLeaderEmail')
      .mockRejectedValueOnce(
        new CoachApiError(
          'admin/leaders/milo-kerr/email',
          409,
          "This is the benchmark leader, whose address receives every leader's reports: send confirm: true to change it",
          { refusal: 'confirm-required' },
        ),
      )
      .mockResolvedValueOnce({ email: 'milo.new@example.test', status: 'pending', expiresAt: '2026-10-16T15:00:00.000Z', confirmationSent: true });
    const success = vi.spyOn(toast, 'success');
    renderView();

    fireEvent.click(await screen.findByTestId('coach-address-edit-milo-kerr'));
    fireEvent.change(screen.getByTestId('coach-address-input-milo-kerr'), { target: { value: 'milo.new@example.test' } });
    fireEvent.click(screen.getByTestId('coach-address-save-milo-kerr'));

    const ask = await screen.findByTestId('coach-address-confirm-milo-kerr');
    expect(ask).toHaveTextContent("benchmark leader, whose address receives every leader's reports");
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenLastCalledWith('milo-kerr', 'milo.new@example.test', false);
    fireEvent.click(screen.getByTestId('coach-address-confirm-save-milo-kerr'));

    await waitFor(() => expect(update).toHaveBeenLastCalledWith('milo-kerr', 'milo.new@example.test', true));
    await waitFor(() => expect(screen.queryByTestId('coach-address-input-milo-kerr')).toBeNull());
    expect(success).toHaveBeenCalledWith(
      'A confirmation link went to the new address. The address changes only once it is confirmed there, by Oct 16, 2026; reports keep going to the current address until then.',
    );
  });

  it('drops the confirmation when the admin edits the address again', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'updateLeaderEmail').mockRejectedValue(
      new CoachApiError('admin/leaders/milo-kerr/email', 409, 'This is the benchmark leader, whose address receives every leader\'s reports: send confirm: true to change it', {
        refusal: 'confirm-required',
      }),
    );
    renderView();

    fireEvent.click(await screen.findByTestId('coach-address-edit-milo-kerr'));
    fireEvent.change(screen.getByTestId('coach-address-input-milo-kerr'), { target: { value: 'milo.new@example.test' } });
    fireEvent.click(screen.getByTestId('coach-address-save-milo-kerr'));
    await screen.findByTestId('coach-address-confirm-milo-kerr');
    fireEvent.change(screen.getByTestId('coach-address-input-milo-kerr'), { target: { value: 'other@example.test' } });
    expect(screen.queryByTestId('coach-address-confirm-milo-kerr')).toBeNull();
  });

  it('holds an address that breaks the rule before it reaches the server, naming the rule', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    const update = vi.spyOn(coachService, 'updateLeaderEmail');
    renderView();

    fireEvent.click(await screen.findByTestId('coach-address-edit-milo-kerr'));
    fireEvent.change(screen.getByTestId('coach-address-input-milo-kerr'), { target: { value: 'milo,kerr@example.test' } });

    expect(screen.getByTestId('coach-address-error-milo-kerr')).toHaveTextContent(coachService.EMAIL_RULE);
    expect(screen.getByTestId('coach-address-save-milo-kerr')).toBeDisabled();
    fireEvent.click(screen.getByTestId('coach-address-save-milo-kerr'));
    expect(update).not.toHaveBeenCalled();
  });

  it("shows the server's own wording when it refuses the address", async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'updateLeaderEmail').mockRejectedValue(
      new CoachApiError('admin/leaders/milo-kerr/email', 400, coachService.EMAIL_RULE),
    );
    renderView();

    fireEvent.click(await screen.findByTestId('coach-address-edit-milo-kerr'));
    fireEvent.change(screen.getByTestId('coach-address-input-milo-kerr'), { target: { value: 'milo@example.test' } });
    fireEvent.click(screen.getByTestId('coach-address-save-milo-kerr'));

    expect(await screen.findByTestId('coach-address-error-milo-kerr')).toHaveTextContent(`Refused (400): ${coachService.EMAIL_RULE}`);
  });

  it('keeps the editor open with the refusal when the address is already taken', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue({ ...COVERAGE, leaders: [PLACEHOLDER] });
    vi.spyOn(coachService, 'updateLeaderEmail').mockRejectedValue(
      new CoachApiError('admin/leaders/wyatt-wellington/email', 409, 'Another leader already uses that address'),
    );
    renderView();

    fireEvent.click(await screen.findByTestId('coach-address-edit-wyatt-wellington'));
    fireEvent.change(screen.getByTestId('coach-address-input-wyatt-wellington'), {
      target: { value: 'milo@example.test' },
    });
    fireEvent.click(screen.getByTestId('coach-address-save-wyatt-wellington'));

    expect(await screen.findByTestId('coach-address-error-wyatt-wellington')).toHaveTextContent(
      'Another leader already uses that address',
    );
    expect(screen.getByTestId('coach-address-input-wyatt-wellington')).toHaveValue('milo@example.test');
  });
});

describe('an unresolved session', () => {
  it('is assigned to a leader picked from the roster, and leaves the list', async () => {
    const list = vi
      .spyOn(coachService, 'fetchPipelineFailures')
      .mockResolvedValueOnce(page([UNRESOLVED]))
      .mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    const attribute = vi
      .spyOn(coachService, 'attributeSession')
      .mockResolvedValue({ coachId: 'amy-lee', state: 'observed' });
    renderView();

    const picker = await screen.findByTestId('coach-pipeline-assign-to-ff-4');
    await waitFor(() => expect(within(picker).getByRole('option', { name: 'Amy Lee' })).toBeInTheDocument());
    fireEvent.change(picker, { target: { value: 'amy-lee' } });
    fireEvent.click(screen.getByTestId('coach-pipeline-assign-ff-4'));

    await waitFor(() => expect(attribute).toHaveBeenCalledWith('ff-4', 'amy-lee', null));
    await waitFor(() => expect(screen.queryByTestId('coach-pipeline-ff-4')).toBeNull());
    expect(list).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['observed', 'It is observed now: a later pipeline run scores it for them'],
    ['retained', 'It is retained now: a later pipeline run scores it for them'],
  ])('says a session assigned while %s is scored on a later run, then held until an admin releases it', async (state, said) => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([UNRESOLVED]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'attributeSession').mockResolvedValue({ coachId: 'amy-lee', state });
    const success = vi.spyOn(toast, 'success');
    renderView();

    const picker = await screen.findByTestId('coach-pipeline-assign-to-ff-4');
    await waitFor(() => expect(within(picker).getByRole('option', { name: 'Amy Lee' })).toBeInTheDocument());
    fireEvent.change(picker, { target: { value: 'amy-lee' } });
    fireEvent.click(screen.getByTestId('coach-pipeline-assign-ff-4'));

    const text = `Assigned to Amy Lee. ${said}, and it is then held until an admin releases it from this list.`;
    expect(await screen.findByTestId('coach-pipeline-outcome-ff-4')).toHaveTextContent(text);
    expect(success).toHaveBeenCalledWith(text);
  });

  it('shows the refusal when the session moved since the list loaded, and reads the list again', async () => {
    const list = vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([UNRESOLVED]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'attributeSession').mockRejectedValue(
      new CoachApiError('x', 409, "The session's leader changed since this list was loaded; reload it and assign again"),
    );
    renderView();

    const picker = await screen.findByTestId('coach-pipeline-assign-to-ff-4');
    await waitFor(() => expect(within(picker).getByRole('option', { name: 'Amy Lee' })).toBeInTheDocument());
    fireEvent.change(picker, { target: { value: 'amy-lee' } });
    fireEvent.click(screen.getByTestId('coach-pipeline-assign-ff-4'));

    expect(await screen.findByTestId('coach-pipeline-outcome-ff-4')).toHaveTextContent(
      "Refused (409): The session's leader changed since this list was loaded; reload it and assign again",
    );
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
  });

  it('offers no assignment until a leader is picked, and no release or requeue at all', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([UNRESOLVED]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    expect(await screen.findByTestId('coach-pipeline-assign-ff-4')).toBeDisabled();
    expect(screen.queryByTestId('coach-pipeline-release-ff-4')).toBeNull();
    expect(screen.queryByTestId('coach-pipeline-requeue-ff-4')).toBeNull();
  });

  it("does not offer the session's current leader, sends it as the leader the move expects, and shows a refusal in words", async () => {
    const ATTRIBUTED = { ...UNRESOLVED, sourceSessionId: 'ff-8', coachId: 'amy-lee', reason: 'moved by hand' };
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([ATTRIBUTED]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    const attribute = vi.spyOn(coachService, 'attributeSession').mockRejectedValue(
      new CoachApiError('x', 409, 'The session is already assigned to that leader'),
    );
    renderView();

    const picker = await screen.findByTestId('coach-pipeline-assign-to-ff-8');
    await waitFor(() => expect(within(picker).getByRole('option', { name: 'Milo Kerr' })).toBeInTheDocument());
    expect(within(picker).queryByRole('option', { name: 'Amy Lee' })).toBeNull();

    fireEvent.change(picker, { target: { value: 'milo-kerr' } });
    fireEvent.click(screen.getByTestId('coach-pipeline-assign-ff-8'));
    expect(await screen.findByTestId('coach-pipeline-outcome-ff-8')).toHaveTextContent(
      'Refused (409): The session is already assigned to that leader',
    );
    expect(attribute).toHaveBeenCalledWith('ff-8', 'milo-kerr', 'amy-lee');
  });

  it('keeps the assignment disabled while it is in flight, and shows a refusal', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([UNRESOLVED]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    let refuse: (e: Error) => void = () => {};
    vi.spyOn(coachService, 'attributeSession').mockImplementation(
      () => new Promise((_, reject) => { refuse = reject; }),
    );
    renderView();

    const picker = await screen.findByTestId('coach-pipeline-assign-to-ff-4');
    await waitFor(() => expect(within(picker).getByRole('option', { name: 'Milo Kerr' })).toBeInTheDocument());
    fireEvent.change(picker, { target: { value: 'milo-kerr' } });
    const assign = screen.getByTestId('coach-pipeline-assign-ff-4');
    fireEvent.click(assign);
    await waitFor(() => expect(assign).toBeDisabled());

    refuse(new CoachApiError('admin/sessions/ff-4/attribute', 409, "The session's report is being delivered right now; try again shortly"));
    expect(await screen.findByTestId('coach-pipeline-outcome-ff-4')).toHaveTextContent('being delivered right now');
    await waitFor(() => expect(assign).not.toBeDisabled());
  });
});

describe('a first lesson held for a cold-recall improvement', () => {
  const HELD_ITEMS = ["Recall last week's big idea", 'Review the previous lesson'];
  const COLD = {
    ...HELD,
    sourceSessionId: 'ff-7',
    reportId: 'rep-7',
    reason: `held: a first lesson with a cold-recall improvement: ${HELD_ITEMS.join('; ')}`,
    holdKind: 'cold-recall' as const,
    coldRecall: HELD_ITEMS,
  };
  const WHY = 'a first lesson cannot carry an improvement that asks for recall of earlier lessons';
  const FIX =
    "To clear it, open the report's review (the leader, then this session), replace the held items under Improvements, and release it again from this list. If it is not a first lesson, clear the first-lesson flag there instead and release it again.";

  it('says why in words, lists each held item on its own line out of session replay, and how to clear it', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([COLD]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    const row = await screen.findByTestId('coach-pipeline-ff-7');
    expect(row).toHaveTextContent(`Why: held, because ${WHY}.`);
    expect(row).not.toHaveTextContent('held: a first lesson');
    const items = within(row).getAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual(HELD_ITEMS);
    for (const li of items) expect(li.closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
    expect(row).toHaveTextContent(FIX);
    expect(row).not.toHaveTextContent('once the report is delivered');
    expect(within(row).getByTestId('coach-pipeline-release-ff-7')).toBeInTheDocument();
  });

  it('shows a held item whole when it contains "; ", because the items come as a list, not as text to split', async () => {
    const items = ["Recall last week's idea; then open the new passage", 'Review the previous lesson'];
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(
      page([{ ...COLD, reason: `held: a first lesson with a cold-recall improvement: ${items.join('; ')}`, coldRecall: items }]),
    );
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    const row = await screen.findByTestId('coach-pipeline-ff-7');
    await within(row).findByText(items[0]);
    expect(within(row).getAllByRole('listitem').map((li) => li.textContent)).toEqual(items);
  });

  it('reads the hold from its kind, never from the words of its reason', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(
      page([{ ...HELD, reason: 'held: a first lesson with a cold-recall improvement: quoted by the model' }]),
    );
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    const row = await screen.findByTestId('coach-pipeline-ff-2');
    expect(row).toHaveTextContent('Why: held: a first lesson with a cold-recall improvement: quoted by the model');
    expect(within(row).queryAllByRole('listitem')).toHaveLength(0);
  });

  it('a release refused for it says so in words, with the held items and how to clear it', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([HELD]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'releaseHeldReport').mockResolvedValue({
      delivered: false,
      refusal: 'cold-recall-improvement',
      coldRecall: HELD_ITEMS,
    });
    renderView();

    fireEvent.click(await screen.findByTestId('coach-pipeline-release-ff-2'));
    const outcome = await screen.findByTestId('coach-pipeline-outcome-ff-2');
    expect(outcome).toHaveTextContent(`Not delivered: ${WHY}.`);
    expect(outcome).not.toHaveTextContent('cold-recall-improvement');
    for (const item of HELD_ITEMS) {
      expect(within(outcome).getByText(item).closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
    }
    expect(outcome).toHaveTextContent(FIX);
  });
});

describe('a first report held under a new scoring version', () => {
  const REASON = 'held for review: the first report to this leader under scoring version model-a / prompt 7 / settings {"temperature":0}';
  const RELEASE = "Once this report is delivered, this leader's other reports held for the same scoring version go out with the next pipeline run.";

  it('says once why it waits for a review, and what delivering it lets go, without promising a delivery the release cannot make', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(
      page([{ ...HELD, sourceSessionId: 'ff-9', reason: REASON, holdKind: 'scoring-version' as const }]),
    );
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    const row = await screen.findByTestId('coach-pipeline-ff-9');
    expect(row).toHaveTextContent(`Why: ${REASON}. ${RELEASE}`);
    expect(row.textContent?.match(/held for review/g)).toHaveLength(1);
    expect(row).not.toHaveTextContent('also delivers');
    expect(within(row).getByTestId('coach-pipeline-release-ff-9')).toBeInTheDocument();
  });

  it('says why in its own words when the hold carries no reason', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(
      page([{ ...HELD, sourceSessionId: 'ff-9', reason: null, holdKind: 'scoring-version' as const }]),
    );
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    expect(await screen.findByTestId('coach-pipeline-ff-9')).toHaveTextContent(
      `Why: held for review: the first report to this leader under a new scoring version. ${RELEASE}`,
    );
  });
});

describe('when a session started', () => {
  it('shows the start time beside the date, in the time zone the date is counted in', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(
      page([{ ...PARKED, sessionDate: '2026-09-19', sessionStartedAt: '2026-09-20T01:30:00.000Z' }, HELD]),
    );
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    expect(await screen.findByTestId('coach-pipeline-ff-1')).toHaveTextContent('2026-09-19 · started 8:30 PM CDT ·');
    expect(screen.getByTestId('coach-pipeline-ff-2')).not.toHaveTextContent('started');
  });
});

describe('a session observed during the parallel run', () => {
  const COPY = { ...HELD, sourceSessionId: 'ff-10', reportId: 'rep-10', parallelRun: true, action: null };
  const PARKED_COPY = { ...PARKED, sourceSessionId: 'ff-11', parallelRun: true };

  it('is labelled a parallel-run copy and offers no release, the action the server refuses for it', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([COPY, HELD]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    const row = await screen.findByTestId('coach-pipeline-ff-10');
    expect(within(row).getByTestId('coach-pipeline-parallel-run-ff-10')).toHaveTextContent('Parallel-run copy: kept for comparison, never sent.');
    expect(within(row).queryByTestId('coach-pipeline-release-ff-10')).toBeNull();
    expect(within(screen.getByTestId('coach-pipeline-ff-2')).queryByTestId('coach-pipeline-parallel-run-ff-2')).toBeNull();
  });

  it('still offers the requeue of a scoring failure, which only scores it again', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([PARKED_COPY]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    const row = await screen.findByTestId('coach-pipeline-ff-11');
    expect(row).toHaveTextContent('Parallel-run copy: kept for comparison, never sent.');
    expect(within(row).getByTestId('coach-pipeline-requeue-ff-11')).toBeInTheDocument();
  });

  it('shows the refusal of a release on a list loaded before the session was marked, in the server\'s words', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([HELD]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'releaseHeldReport').mockRejectedValue(
      new CoachApiError('x', 409, 'This session was observed during the parallel run: it is kept for admin comparison and never sent'),
    );
    renderView();

    fireEvent.click(await screen.findByTestId('coach-pipeline-release-ff-2'));
    expect(await screen.findByTestId('coach-pipeline-outcome-ff-2')).toHaveTextContent(
      'Refused (409): This session was observed during the parallel run: it is kept for admin comparison and never sent',
    );
  });
});

describe('a re-attributed session', () => {
  const REATTRIBUTED = {
    ...HELD,
    sourceSessionId: 'ff-6',
    reportId: 'rep-6',
    reason: 're-attributed: held until an admin releases it',
  };

  it('is held with its reason and offers the release that delivers it', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([REATTRIBUTED]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    const release = vi.spyOn(coachService, 'releaseHeldReport').mockResolvedValue({ delivered: true });
    renderView();

    const row = await screen.findByTestId('coach-pipeline-ff-6');
    expect(row).toHaveTextContent('Why: re-attributed: held until an admin releases it');
    fireEvent.click(within(row).getByTestId('coach-pipeline-release-ff-6'));
    await waitFor(() => expect(release).toHaveBeenCalledWith('rep-6'));
    expect(await screen.findByTestId('coach-pipeline-outcome-ff-6')).toHaveTextContent('Released and delivered to the leader.');
  });
});

describe('a row awaiting release in a delivery state', () => {
  it.each(['delivery_pending', 'delivery_failed'])('a %s row awaiting release offers the release, and only that', async (state) => {
    const AWAITING = {
      ...HELD,
      sourceSessionId: 'ff-9',
      reportId: 'rep-9',
      state,
      reason: 're-attributed: held until an admin releases it',
    };
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([AWAITING]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    const release = vi.spyOn(coachService, 'releaseHeldReport').mockResolvedValue({ delivered: true });
    renderView();

    const row = await screen.findByTestId('coach-pipeline-ff-9');
    expect(row).toHaveTextContent('Why: re-attributed: held until an admin releases it');
    expect(within(row).queryByTestId('coach-pipeline-requeue-ff-9')).toBeNull();
    fireEvent.click(within(row).getByTestId('coach-pipeline-release-ff-9'));
    await waitFor(() => expect(release).toHaveBeenCalledWith('rep-9'));
  });
});

describe('a failed send', () => {
  const SENT_FAILED = 'send failed to milo@example.test (mailbox unavailable); already emailed to bench@example.test';
  const RETRYING = {
    ...PARKED,
    sourceSessionId: 'ff-7',
    reportId: 'rep-7',
    state: 'delivery_pending',
    attempts: 2,
    reason: `${SENT_FAILED}; retried automatically (attempt 2 of 5), fix the failing address if it is wrong`,
    holdKind: 'send-failed' as const,
    action: null,
  };
  const EXHAUSTED = {
    ...RETRYING,
    sourceSessionId: 'ff-8',
    state: 'delivery_failed',
    attempts: 5,
    reason: `${SENT_FAILED}; retries exhausted: fix the failing address, then requeue it`,
    action: 'requeue' as const,
  };

  it('a send still being retried shows why out of session replay, offers the address fix, and no requeue or release', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([RETRYING]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    const row = await screen.findByTestId('coach-pipeline-ff-7');
    expect(row).toHaveTextContent(`Why: ${RETRYING.reason}`);
    expect(within(row).getByText(/send failed to/).closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
    expect(await within(row).findByTestId('coach-address-edit-milo-kerr')).toBeInTheDocument();
    expect(within(row).getByTestId('coach-address-milo-kerr')).toHaveTextContent('milo@example.test');
    expect(within(row).queryByTestId('coach-pipeline-requeue-ff-7')).toBeNull();
    expect(within(row).queryByTestId('coach-pipeline-release-ff-7')).toBeNull();
  });

  it('a send whose retries ran out offers the address fix and the requeue', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([EXHAUSTED]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    const update = vi.spyOn(coachService, 'updateLeaderEmail').mockResolvedValue({ email: 'milo@church.test', status: 'pending', expiresAt: '2026-10-16T15:00:00.000Z', confirmationSent: true });
    const requeue = vi.spyOn(coachService, 'requeuePipelineFailure').mockResolvedValue({ requeued: true });
    renderView();

    const row = await screen.findByTestId('coach-pipeline-ff-8');
    expect(row).toHaveTextContent('retries exhausted: fix the failing address, then requeue it');
    fireEvent.click(await within(row).findByTestId('coach-address-edit-milo-kerr'));
    fireEvent.change(within(row).getByTestId('coach-address-input-milo-kerr'), { target: { value: 'milo@church.test' } });
    fireEvent.click(within(row).getByTestId('coach-address-save-milo-kerr'));
    await waitFor(() => expect(update).toHaveBeenCalledWith('milo-kerr', 'milo@church.test', false));

    fireEvent.click(within(row).getByTestId('coach-pipeline-requeue-ff-8'));
    await waitFor(() => expect(requeue).toHaveBeenCalledWith('ff-8'));
  });

  it('a delivery with no deliverable address at all offers the address fix', async () => {
    const NONE = {
      ...RETRYING,
      reason: 'no recipient has a deliverable address; retried automatically (attempt 1 of 5), fix the failing address if it is wrong',
    };
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([NONE]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    const row = await screen.findByTestId('coach-pipeline-ff-7');
    expect(await within(row).findByTestId('coach-address-edit-milo-kerr')).toBeInTheDocument();
  });

  it('a send that was started but never confirmed offers the address fix, from its hold kind', async () => {
    const UNCONFIRMED = {
      ...RETRYING,
      reason:
        'a send to milo@example.test was started but never confirmed, so it is not sent again until the report is requeued; retried automatically (attempt 1 of 5), fix the failing address if it is wrong',
    };
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([UNCONFIRMED]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    const row = await screen.findByTestId('coach-pipeline-ff-7');
    expect(await within(row).findByTestId('coach-address-edit-milo-kerr')).toBeInTheDocument();
  });

  it('reads a failed send from its hold kind, never from the words of its reason', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(
      page([{ ...PARKED, reason: 'send failed to milo@example.test, quoted in a model note', holdKind: null }]),
    );
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    const row = await screen.findByTestId('coach-pipeline-ff-1');
    await waitFor(() => expect(row).toHaveTextContent('Milo Kerr'));
    expect(within(row).queryByTestId('coach-address-edit-milo-kerr')).toBeNull();
  });

  it('offers no address fix on a row that is not a failed send', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(
      page([PARKED, { ...HELD, sourceSessionId: 'ff-9', state: 'delivery_pending', reason: 're-attributed: held until an admin releases it' }]),
    );
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    await screen.findByTestId('coach-pipeline-ff-9');
    expect(within(screen.getByTestId('coach-pipeline-ff-1')).queryByTestId('coach-address-edit-milo-kerr')).toBeNull();
    expect(within(screen.getByTestId('coach-pipeline-ff-9')).queryByTestId('coach-address-edit-amy-lee')).toBeNull();
  });
});

describe('a send skipped for a placeholder address', () => {
  it("names the leader, keeps the address out of replay, and offers to fix it instead of release or requeue", async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([SKIPPED]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    const row = await screen.findByTestId('coach-pipeline-ff-5');
    await waitFor(() => expect(row).toHaveTextContent('Wyatt Wellington'));
    expect(within(row).getByText(/placeholder address/).closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
    expect(within(row).getByTestId('coach-address-edit-wyatt-wellington')).toBeInTheDocument();
    expect(screen.queryByTestId('coach-pipeline-release-ff-5')).toBeNull();
    expect(screen.queryByTestId('coach-pipeline-requeue-ff-5')).toBeNull();
  });

  it('a release that skipped a placeholder says so, without the address', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([HELD]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'releaseHeldReport').mockResolvedValue({
      delivered: true,
      skipped: ['amy@needs-real-email.invalid'],
    });
    renderView();

    fireEvent.click(await screen.findByTestId('coach-pipeline-release-ff-2'));
    const outcome = await screen.findByTestId('coach-pipeline-outcome-ff-2');
    expect(outcome).toHaveTextContent(/1 placeholder address/);
    expect(outcome).not.toHaveTextContent('needs-real-email');
  });
});

describe('a leader covered through a rotating class', () => {
  it('says the coverage came from the class, not from a session of their own', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue({
      ...COVERAGE,
      leaders: [{ ...COVERAGE.leaders[1], coachId: 'rota-lee', name: 'Rota Lee', covered: true, basis: 'rotating-class', observedSessions: 0 }],
    });
    renderView();
    expect(await screen.findByTestId('coach-coverage-basis-rota-lee')).toHaveTextContent('Covered · through their rotating class');
  });
});

describe('a leader who is not teaching', () => {
  const ATTESTED: coachService.CoverageLeader = {
    ...COVERAGE.leaders[1],
    coachId: 'desmond-vane',
    name: 'Desmond Vane',
    email: 'desmond@example.test',
    covered: true,
    basis: 'attested-not-teaching',
    classAlert: false,
    attestedAt: '2026-10-01T15:00:00.000Z',
    attestedBy: 'admin@example.test',
  };

  it('is told apart from a leader the bot has not observed, with who attested and when', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue({ ...COVERAGE, leaders: [COVERAGE.leaders[1], ATTESTED] });
    renderView();

    const attested = await screen.findByTestId('coach-coverage-desmond-vane');
    expect(within(attested).getByTestId('coach-coverage-basis-desmond-vane')).toHaveTextContent('Not teaching (attested)');
    const by = within(attested).getByTestId('coach-coverage-attested-desmond-vane');
    expect(by).toHaveTextContent('admin@example.test');
    expect(by).toHaveTextContent('Oct 1, 2026');
    expect(within(by).getByText('admin@example.test').closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
    expect(screen.getByTestId('coach-coverage-basis-amy-lee')).toHaveTextContent('Not observed');
    expect(screen.queryByTestId('coach-coverage-attested-amy-lee')).toBeNull();
  });

  it('reads as not covered once the attestation lapsed, naming when it was made, and offers marking it again', async () => {
    const LAPSED: coachService.CoverageLeader = { ...ATTESTED, covered: false, basis: 'attestation-lapsed', attestedAt: '2026-08-01T15:00:00.000Z' };
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue({ ...COVERAGE, leaders: [LAPSED] });
    const set = vi.spyOn(coachService, 'setNotTeaching').mockResolvedValue({ attested: true });
    renderView();

    const badge = await screen.findByTestId('coach-coverage-basis-desmond-vane');
    expect(badge).toHaveTextContent('Not covered · Not-teaching attestation lapsed (Aug 1, 2026)');
    expect(badge).not.toHaveTextContent('attested)');
    const button = screen.getByTestId('coach-coverage-not-teaching-desmond-vane');
    expect(button).toHaveTextContent('Mark not teaching');
    fireEvent.click(button);
    await waitFor(() => expect(set).toHaveBeenCalledWith('desmond-vane', true));
  });

  it('is attested from the coverage list, and coverage is read again', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    const coverage = vi
      .spyOn(coachService, 'fetchCoverage')
      .mockResolvedValueOnce(COVERAGE)
      .mockResolvedValue({ ...COVERAGE, leaders: [COVERAGE.leaders[0], { ...ATTESTED, coachId: 'amy-lee', name: 'Amy Lee' }] });
    const set = vi.spyOn(coachService, 'setNotTeaching').mockResolvedValue({ attested: true });
    renderView();

    fireEvent.click(await screen.findByTestId('coach-coverage-not-teaching-amy-lee'));
    await waitFor(() => expect(set).toHaveBeenCalledWith('amy-lee', true));
    await waitFor(() => expect(screen.getByTestId('coach-coverage-basis-amy-lee')).toHaveTextContent('Not teaching (attested)'));
    expect(coverage).toHaveBeenCalledTimes(2);
  });

  it('has the attestation cleared, the button held while the request is in flight', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue({ ...COVERAGE, leaders: [ATTESTED] });
    let settle: (v: { attested: boolean }) => void = () => {};
    const set = vi
      .spyOn(coachService, 'setNotTeaching')
      .mockImplementation(() => new Promise((resolve) => { settle = resolve; }));
    renderView();

    const button = await screen.findByTestId('coach-coverage-not-teaching-desmond-vane');
    expect(button).toHaveTextContent('Clear not teaching');
    fireEvent.click(button);
    await waitFor(() => expect(set).toHaveBeenCalledWith('desmond-vane', false));
    expect(button).toBeDisabled();
    settle({ attested: false });
    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it('shows a refused attestation on the row', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'setNotTeaching').mockRejectedValue(
      new CoachApiError('admin/leaders/amy-lee/not-teaching', 404, 'Leader not found'),
    );
    renderView();

    fireEvent.click(await screen.findByTestId('coach-coverage-not-teaching-amy-lee'));
    expect(await screen.findByTestId('coach-coverage-error-amy-lee')).toHaveTextContent('Leader not found');
  });
});

describe("a leader's title keywords and alternate addresses", () => {
  beforeEach(() => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue(page([]));
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue({ ...COVERAGE, leaders: [COVERAGE.leaders[0]] });
  });

  it('loads the current lists, and saves the edited ones whole', async () => {
    const load = vi
      .spyOn(coachService, 'fetchLeaderAttribution')
      .mockResolvedValue({ titleMatch: ['saturday morning'], altEmails: ['milo.w@example.test'] });
    const save = vi
      .spyOn(coachService, 'saveLeaderAttribution')
      .mockResolvedValue({ titleMatch: ['saturday morning', 'obadiah'], altEmails: ['milo.w@example.test'], resolved: 2 });
    renderView();

    expect(load).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByTestId('coach-attribution-edit-milo-kerr'));
    const keywords = await screen.findByTestId('coach-attribution-keywords-milo-kerr');
    expect(keywords).toHaveValue('saturday morning');
    expect(screen.getByTestId('coach-attribution-emails-milo-kerr')).toHaveValue('milo.w@example.test');
    expect(keywords.closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();

    fireEvent.change(keywords, { target: { value: 'saturday morning\n Obadiah \n\n' } });
    fireEvent.click(screen.getByTestId('coach-attribution-save-milo-kerr'));

    await waitFor(() =>
      expect(save).toHaveBeenCalledWith('milo-kerr', {
        titleMatch: ['saturday morning', 'Obadiah'],
        altEmails: ['milo.w@example.test'],
      }),
    );
    expect(await screen.findByTestId('coach-attribution-saved-milo-kerr')).toHaveTextContent(
      'Saved. 2 unattributed sessions now match a leader.',
    );
  });

  it('a second save starts from what the first one saved, so the new keyword is not dropped', async () => {
    vi.spyOn(coachService, 'fetchLeaderAttribution').mockResolvedValue({ titleMatch: ['saturday morning'], altEmails: [] });
    const save = vi
      .spyOn(coachService, 'saveLeaderAttribution')
      .mockImplementation(async (_coachId, attribution) => ({ ...attribution, resolved: 0 }));
    renderView();
    fireEvent.click(await screen.findByTestId('coach-attribution-edit-milo-kerr'));
    fireEvent.change(await screen.findByTestId('coach-attribution-keywords-milo-kerr'), {
      target: { value: 'saturday morning\nobadiah' },
    });
    fireEvent.click(screen.getByTestId('coach-attribution-save-milo-kerr'));
    await screen.findByTestId('coach-attribution-saved-milo-kerr');

    expect(screen.getByTestId('coach-attribution-keywords-milo-kerr')).toHaveValue('saturday morning\nobadiah');
    fireEvent.change(screen.getByTestId('coach-attribution-emails-milo-kerr'), { target: { value: 'milo.w@example.test' } });
    fireEvent.click(screen.getByTestId('coach-attribution-save-milo-kerr'));

    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect(save).toHaveBeenLastCalledWith('milo-kerr', {
      titleMatch: ['saturday morning', 'obadiah'],
      altEmails: ['milo.w@example.test'],
    });
  });

  it('holds a keyword shorter than three characters before it reaches the server', async () => {
    vi.spyOn(coachService, 'fetchLeaderAttribution').mockResolvedValue({ titleMatch: [], altEmails: [] });
    const save = vi.spyOn(coachService, 'saveLeaderAttribution');
    renderView();
    fireEvent.click(await screen.findByTestId('coach-attribution-edit-milo-kerr'));
    fireEvent.change(await screen.findByTestId('coach-attribution-keywords-milo-kerr'), { target: { value: 'ok keyword\nab' } });

    expect(screen.getByTestId('coach-attribution-error-milo-kerr')).toHaveTextContent(
      'Each title keyword needs at least three characters: ab',
    );
    expect(screen.getByTestId('coach-attribution-save-milo-kerr')).toBeDisabled();
    expect(save).not.toHaveBeenCalled();
  });

  it('holds an alternate address that breaks the rule before it reaches the server, naming the address', async () => {
    vi.spyOn(coachService, 'fetchLeaderAttribution').mockResolvedValue({ titleMatch: [], altEmails: [] });
    const save = vi.spyOn(coachService, 'saveLeaderAttribution');
    renderView();
    fireEvent.click(await screen.findByTestId('coach-attribution-edit-milo-kerr'));
    fireEvent.change(await screen.findByTestId('coach-attribution-emails-milo-kerr'), {
      target: { value: 'milo.w@example.test\nnot-an-email' },
    });

    expect(screen.getByTestId('coach-attribution-error-milo-kerr')).toHaveTextContent(
      `Alternate address "not-an-email": ${coachService.EMAIL_RULE}`,
    );
    expect(screen.getByTestId('coach-attribution-save-milo-kerr')).toBeDisabled();
    expect(save).not.toHaveBeenCalled();
  });

  it("shows the server's refusal of a keyword inside another leader's name, and keeps the edit", async () => {
    vi.spyOn(coachService, 'fetchLeaderAttribution').mockResolvedValue({ titleMatch: [], altEmails: [] });
    vi.spyOn(coachService, 'saveLeaderAttribution').mockRejectedValue(
      new CoachApiError('x', 409, 'Keywords refused: "amy" is inside the name of amy-lee'),
    );
    renderView();
    fireEvent.click(await screen.findByTestId('coach-attribution-edit-milo-kerr'));
    fireEvent.change(await screen.findByTestId('coach-attribution-keywords-milo-kerr'), { target: { value: 'amy' } });
    fireEvent.click(screen.getByTestId('coach-attribution-save-milo-kerr'));

    expect(await screen.findByTestId('coach-attribution-error-milo-kerr')).toHaveTextContent(
      'Refused (409): Keywords refused: "amy" is inside the name of amy-lee',
    );
    expect(screen.getByTestId('coach-attribution-keywords-milo-kerr')).toHaveValue('amy');
  });

  it('says so when the lists cannot be read', async () => {
    vi.spyOn(coachService, 'fetchLeaderAttribution').mockRejectedValue(new CoachApiError('x', 404, 'Leader not found'));
    renderView();
    fireEvent.click(await screen.findByTestId('coach-attribution-edit-milo-kerr'));
    expect(await screen.findByTestId('coach-attribution-error-milo-kerr')).toHaveTextContent(
      'Could not load the keywords and addresses. Refused (404): Leader not found',
    );
    expect(screen.queryByTestId('coach-attribution-save-milo-kerr')).toBeNull();
  });
});
