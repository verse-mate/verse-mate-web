import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
  updatedAt: '2026-08-30T00:00:00Z',
};

const COVERAGE = {
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
      accountStatus: 'active',
      linkedClassName: 'Saturday Morning',
      classAlert: false,
    },
    {
      coachId: 'amy-lee',
      name: 'Amy Lee',
      email: 'amy@example.test',
      covered: false,
      basis: 'none',
      observedSessions: 0,
      accountStatus: 'active',
      linkedClassName: null,
      classAlert: true,
    },
  ],
};

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <PipelineHealth />
    </QueryClientProvider>,
  );
}

afterEach(() => vi.restoreAllMocks());

describe('what is stuck in the pipeline', () => {
  it('lists each stuck session with why it is stuck', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([PARKED, HELD]);
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
      .mockResolvedValueOnce([PARKED])
      .mockResolvedValueOnce([]);
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    const requeue = vi.spyOn(coachService, 'requeuePipelineFailure').mockResolvedValue({ requeued: true });
    renderView();

    fireEvent.click(await screen.findByTestId('coach-pipeline-requeue-ff-1'));
    await waitFor(() => expect(requeue).toHaveBeenCalledWith('ff-1'));
    await waitFor(() => expect(screen.queryByTestId('coach-pipeline-ff-1')).toBeNull());
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('releases a report held for review, by its report id', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([HELD]);
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    const release = vi.spyOn(coachService, 'releaseHeldReport').mockResolvedValue({ delivered: true });
    renderView();

    fireEvent.click(await screen.findByTestId('coach-pipeline-release-ff-2'));
    await waitFor(() => expect(release).toHaveBeenCalledWith('rep-2'));
    expect(await screen.findByTestId('coach-pipeline-outcome-ff-2')).toHaveTextContent(/delivered/i);
  });

  it('keeps a release disabled while it is in flight, whatever another row does', async () => {
    const other = { ...HELD, sourceSessionId: 'ff-3', reportId: 'rep-3', title: 'Ruth, Lesson 2' };
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([HELD, other]);
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
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([PARKED]);
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    await screen.findByTestId('coach-pipeline-ff-1');
    expect(screen.queryByTestId('coach-pipeline-release-ff-1')).toBeNull();
  });

  it('shows a release the server declined, with its reasons', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([HELD]);
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'releaseHeldReport').mockResolvedValue({
      delivered: false,
      refusal: 'governance',
      violations: ['benchmark-name'],
    });
    renderView();

    fireEvent.click(await screen.findByTestId('coach-pipeline-release-ff-2'));
    const outcome = await screen.findByTestId('coach-pipeline-outcome-ff-2');
    expect(outcome).toHaveTextContent('governance');
    expect(outcome).toHaveTextContent('benchmark-name');
  });

  it('shows an action the server refused as a refusal', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([PARKED]);
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'requeuePipelineFailure').mockRejectedValue(
      new CoachApiError('admin/pipeline-failures/ff-1/requeue', 404, 'No parked session'),
    );
    renderView();

    fireEvent.click(await screen.findByTestId('coach-pipeline-requeue-ff-1'));
    expect(await screen.findByTestId('coach-pipeline-outcome-ff-1')).toHaveTextContent('No parked session');
  });

  it('says so when nothing is stuck', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([]);
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
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([]);
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    expect(await screen.findByTestId('coach-coverage-summary')).toHaveTextContent(/1 of 2/);
    expect(screen.getByTestId('coach-coverage-milo-kerr')).toHaveTextContent(/covered/i);
    expect(screen.getByTestId('coach-coverage-amy-lee')).toHaveTextContent(/not covered/i);
  });

  it('shows a coverage refusal as a refusal', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([]);
    vi.spyOn(coachService, 'fetchCoverage').mockRejectedValue(new CoachAuthError('not_a_coach'));
    renderView();

    expect(await screen.findByTestId('coach-coverage-refused')).toBeInTheDocument();
  });
});
