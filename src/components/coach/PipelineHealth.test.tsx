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
  action: null,
  updatedAt: '2026-09-28T00:00:00Z',
};

const ROSTER = [
  { id: 'milo-kerr', name: 'Milo Kerr', group: '', coachName: '', sessionCount: 4, latest: null },
  { id: 'amy-lee', name: 'Amy Lee', group: '', coachName: '', sessionCount: 1, latest: null },
  { id: 'wyatt-wellington', name: 'Wyatt Wellington', group: '', coachName: '', sessionCount: 2, latest: null },
];

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
      attestedAt: null,
      attestedBy: null,
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
      attestedAt: null,
      attestedBy: null,
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

beforeEach(() => {
  vi.spyOn(coachService, 'fetchAdminCoaches').mockResolvedValue(ROSTER);
});

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

  it('keeps the session title out of the confirmation toast, which sits outside the replay block', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([PARKED]);
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    vi.spyOn(coachService, 'requeuePipelineFailure').mockResolvedValue({ requeued: true });
    const success = vi.spyOn(toast, 'success');
    renderView();

    fireEvent.click(await screen.findByTestId('coach-pipeline-requeue-ff-1'));
    await waitFor(() => expect(success).toHaveBeenCalledWith('Back in the queue.'));
    expect(JSON.stringify(success.mock.calls)).not.toContain(PARKED.title);
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

describe("a leader's address", () => {
  const PLACEHOLDER = {
    ...COVERAGE.leaders[1],
    coachId: 'wyatt-wellington',
    name: 'Wyatt Wellington',
    email: 'wyatt-wellington@needs-real-email.invalid',
  };

  it('shows a placeholder address as no real address yet, and a real one only outside session replay', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([]);
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue({ ...COVERAGE, leaders: [COVERAGE.leaders[0], PLACEHOLDER] });
    renderView();

    const placeholder = await screen.findByTestId('coach-address-wyatt-wellington');
    expect(placeholder).toHaveTextContent('No real address yet');
    expect(placeholder).not.toHaveTextContent('needs-real-email');
    const real = screen.getByTestId('coach-address-milo-kerr');
    expect(real).toHaveTextContent('milo@example.test');
    expect(real.closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
  });

  it("replaces a leader's address and reads the roster again", async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([]);
    const coverage = vi
      .spyOn(coachService, 'fetchCoverage')
      .mockResolvedValueOnce({ ...COVERAGE, leaders: [PLACEHOLDER] })
      .mockResolvedValue({ ...COVERAGE, leaders: [{ ...PLACEHOLDER, email: 'wyatt@example.test' }] });
    const update = vi.spyOn(coachService, 'updateLeaderEmail').mockResolvedValue('wyatt@example.test');
    renderView();

    fireEvent.click(await screen.findByTestId('coach-address-edit-wyatt-wellington'));
    fireEvent.change(screen.getByTestId('coach-address-input-wyatt-wellington'), {
      target: { value: 'wyatt@example.test' },
    });
    fireEvent.click(screen.getByTestId('coach-address-save-wyatt-wellington'));

    await waitFor(() => expect(update).toHaveBeenCalledWith('wyatt-wellington', 'wyatt@example.test'));
    await waitFor(() => expect(screen.getByTestId('coach-address-wyatt-wellington')).toHaveTextContent('wyatt@example.test'));
    expect(coverage).toHaveBeenCalledTimes(2);
    expect(screen.queryByTestId('coach-address-input-wyatt-wellington')).toBeNull();
  });

  it('keeps the editor open with the refusal when the address is already taken', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([]);
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
      .mockResolvedValueOnce([UNRESOLVED])
      .mockResolvedValue([]);
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    const attribute = vi
      .spyOn(coachService, 'attributeSession')
      .mockResolvedValue({ coachId: 'amy-lee', state: 'observed' });
    renderView();

    const picker = await screen.findByTestId('coach-pipeline-assign-to-ff-4');
    await waitFor(() => expect(within(picker).getByRole('option', { name: 'Amy Lee' })).toBeInTheDocument());
    fireEvent.change(picker, { target: { value: 'amy-lee' } });
    fireEvent.click(screen.getByTestId('coach-pipeline-assign-ff-4'));

    await waitFor(() => expect(attribute).toHaveBeenCalledWith('ff-4', 'amy-lee'));
    await waitFor(() => expect(screen.queryByTestId('coach-pipeline-ff-4')).toBeNull());
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('offers no assignment until a leader is picked, and no release or requeue at all', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([UNRESOLVED]);
    vi.spyOn(coachService, 'fetchCoverage').mockResolvedValue(COVERAGE);
    renderView();

    expect(await screen.findByTestId('coach-pipeline-assign-ff-4')).toBeDisabled();
    expect(screen.queryByTestId('coach-pipeline-release-ff-4')).toBeNull();
    expect(screen.queryByTestId('coach-pipeline-requeue-ff-4')).toBeNull();
  });

  it('keeps the assignment disabled while it is in flight, and shows a refusal', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([UNRESOLVED]);
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

describe('a send skipped for a placeholder address', () => {
  it("names the leader, keeps the address out of replay, and offers to fix it instead of release or requeue", async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([SKIPPED]);
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
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([HELD]);
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

describe('a leader who is not teaching', () => {
  const ATTESTED = {
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
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([]);
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

  it('is attested from the coverage list, and coverage is read again', async () => {
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([]);
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
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([]);
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
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([]);
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
    vi.spyOn(coachService, 'fetchPipelineFailures').mockResolvedValue([]);
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

  it("shows the server's refusal and keeps the edit", async () => {
    vi.spyOn(coachService, 'fetchLeaderAttribution').mockResolvedValue({ titleMatch: [], altEmails: [] });
    vi.spyOn(coachService, 'saveLeaderAttribution').mockRejectedValue(
      new CoachApiError('x', 400, 'Each alternate address must be a valid email address'),
    );
    renderView();
    fireEvent.click(await screen.findByTestId('coach-attribution-edit-milo-kerr'));
    fireEvent.change(await screen.findByTestId('coach-attribution-emails-milo-kerr'), { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByTestId('coach-attribution-save-milo-kerr'));

    expect(await screen.findByTestId('coach-attribution-error-milo-kerr')).toHaveTextContent(
      'Refused (400): Each alternate address must be a valid email address',
    );
    expect(screen.getByTestId('coach-attribution-emails-milo-kerr')).toHaveValue('not-an-email');
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
