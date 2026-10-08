import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { primeRubricCache } from '@/hooks/useRubric';
import { REPLAY_BLOCK_CLASS } from '@/lib/analyticsPrivacy';
import * as coachService from '@/services/coachService';
import { CoachApiError, type CoachReport, type ReportReviewState } from '@/services/coachService';
import type { RubricContract } from '@/services/rubric';
import ReportReview from './ReportReview';

const RUBRIC: RubricContract = {
  model: 'v3',
  clusters: [{ name: 'Teaching Craft', weight: 100 }],
  dimensions: Array.from({ length: 12 }, (_, i) => ({
    n: i + 1,
    name: i === 8 ? 'Memory Reinforcement' : `Served dimension ${i + 1}`,
    cluster: 'Teaching Craft',
    clusterWeight: 100,
    what: '',
    target: '',
  })),
  statusBands: [{ min: 0, label: 'Strong', emoji: '' }],
  dimensionBands: [],
};

const REPORT = {
  id: 'rep-1',
  feedback: {
    headline: 'A steady session',
    overview: ['First paragraph'],
    strengths: ['Scripture first'],
    improvements: ['Call on quiet members'],
    recommendations: ['Ask one DOK 4 question'],
  },
} as unknown as CoachReport;

const REVIEW: ReportReviewState = {
  reportId: 'rep-1',
  delivered: true,
  base: 80,
  humanCorrected: false,
  firstLesson: false,
  firstLessonSource: null,
  passageBook: 'Jonah',
  dimensions: Array.from({ length: 12 }, (_, i) => ({
    n: i + 1,
    score: 4,
    rationale: `machine ${i + 1}`,
    provenance: 'machine',
    modelVersion: 'v3',
  })),
};

function renderReview(report: CoachReport = REPORT) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ReportReview report={report} coachId="leader" />
    </QueryClientProvider>,
  );
}

async function openEditor() {
  fireEvent.click(await screen.findByTestId('coach-amend-open'));
}

beforeEach(() => {
  primeRubricCache(RUBRIC);
  vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([]);
});

afterEach(() => {
  vi.restoreAllMocks();
  primeRubricCache(null);
});

describe('amending a delivered report', () => {
  it('shows the delivered version beside the amended one, then sends only what changed', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    const amend = vi.spyOn(coachService, 'amendReport').mockResolvedValue({
      applied: true,
      revision: 1,
      firstLesson: false,
      base: 76,
      score: 78.5,
      status: 'Strong',
      sent: true,
      sends: [{ email: 'leader@example.test', delivered: true }],
      skipped: ['dana@needs-real-email.invalid'],
    });
    renderReview();
    await openEditor();

    fireEvent.change(screen.getByTestId('coach-amend-dim-score-5'), { target: { value: '2' } });
    fireEvent.change(screen.getByTestId('coach-amend-dim-rationale-5'), { target: { value: 'fewer questions' } });
    fireEvent.change(screen.getByTestId('coach-amend-headline'), { target: { value: 'A revised headline' } });
    fireEvent.click(screen.getByTestId('coach-amend-review'));

    const diff = screen.getByTestId('coach-amend-diff');
    expect(within(diff).getByText('Served dimension 5')).toBeInTheDocument();
    expect(within(diff).getByText('4 · machine 5')).toBeInTheDocument();
    expect(within(diff).getByText('2 · fewer questions')).toBeInTheDocument();
    expect(within(diff).getByText('A steady session')).toBeInTheDocument();
    expect(within(diff).getByText('A revised headline')).toBeInTheDocument();
    expect(amend).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('coach-amend-confirm'));
    await waitFor(() =>
      expect(amend).toHaveBeenCalledWith('rep-1', {
        dimensions: [{ n: 5, score: 2, rationale: 'fewer questions' }],
        body: { headline: 'A revised headline' },
      }),
    );
    const outcome = await screen.findByTestId('coach-amend-outcome');
    expect(outcome).toHaveTextContent('Revision 1 saved and re-sent, marked revised. Score 78.5 (Strong).');
    expect(outcome).toHaveTextContent('1 placeholder address was skipped');
  });

  it('says plainly that a parallel-run revision is stored and sent after cutover, and offers the send', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'amendReport').mockResolvedValue({
      applied: true,
      revision: 2,
      firstLesson: false,
      base: 80,
      score: 82,
      status: 'Strong',
      sent: false,
      pending: 'parallel-run',
    });
    const revisions = vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([]);
    const send = vi.spyOn(coachService, 'sendRevision').mockResolvedValue({
      sent: true,
      revision: 2,
      sends: [{ email: 'leader@example.test', delivered: true }],
      skipped: [],
    });
    renderReview();
    await openEditor();
    fireEvent.change(screen.getByTestId('coach-amend-headline'), { target: { value: 'New' } });
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    revisions.mockResolvedValue([
      {
        revision: 2,
        previous: {},
        changes: { dimensions: [], body: { headline: { from: 'A steady session', to: 'New' } } },
        amendedBy: 'admin-1',
        amendedAt: '2026-10-08T14:00:00.000Z',
        sentTo: [],
        skipped: [],
        sentAt: null,
      },
    ]);
    fireEvent.click(screen.getByTestId('coach-amend-confirm'));

    expect(await screen.findByTestId('coach-amend-outcome')).toHaveTextContent(
      'Revision 2 is stored but not sent: the pipeline is in its parallel run, so nothing goes out until cutover. Send it from the kept versions once the pipeline is live.',
    );
    const row = await screen.findByTestId('coach-revision-2');
    expect(row).toHaveTextContent('Not sent');
    fireEvent.click(within(row).getByTestId('coach-revision-send-2'));
    await waitFor(() => expect(send).toHaveBeenCalledWith('rep-1'));
    expect(await screen.findByTestId('coach-revision-outcome')).toHaveTextContent('Revision 2 sent to 1 recipient.');
  });

  it('a governance block is not saved, nothing is sent, and the editor keeps the draft', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'amendReport').mockResolvedValue({
      applied: false,
      refusal: 'governance-blocked',
      violations: ['benchmark-name: in the body'],
    });
    renderReview();
    await openEditor();
    fireEvent.change(screen.getByTestId('coach-amend-headline'), { target: { value: 'Like Avery does' } });
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    fireEvent.click(screen.getByTestId('coach-amend-confirm'));

    expect(await screen.findByTestId('coach-amend-outcome')).toHaveTextContent(
      'Not saved and not sent: the amendment breaks a governance rule. The delivered version stays live.',
    );
    expect(screen.getByTestId('coach-amend-violations')).toHaveTextContent('benchmark-name: in the body');
    expect(screen.getByTestId('coach-amend-headline')).toHaveValue('Like Avery does');
  });

  it('a cold-recall hold names the held items, and the admin replaces them in the same submit', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    const amend = vi
      .spyOn(coachService, 'amendReport')
      .mockResolvedValueOnce({ applied: false, refusal: 'cold-recall-improvement', coldRecall: ['Call on quiet members'] })
      .mockResolvedValueOnce({ applied: true, revision: 1, firstLesson: true, base: 82, score: 82, status: 'Strong', sent: true, sends: [], skipped: [] });
    renderReview();
    await openEditor();
    fireEvent.click(screen.getByTestId('coach-amend-first-lesson'));
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    fireEvent.click(screen.getByTestId('coach-amend-confirm'));

    expect(await screen.findByTestId('coach-amend-held')).toHaveTextContent('Call on quiet members');
    expect(screen.getByTestId('coach-amend-outcome')).toHaveTextContent(
      'Not saved and not sent: a first lesson cannot carry an improvement that asks for recall of earlier lessons.',
    );

    fireEvent.change(screen.getByTestId('coach-amend-improvements'), { target: { value: 'Name the big idea up front' } });
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    fireEvent.click(screen.getByTestId('coach-amend-confirm'));
    await waitFor(() =>
      expect(amend).toHaveBeenLastCalledWith('rep-1', {
        firstLesson: true,
        body: { improvements: ['Name the big idea up front'] },
      }),
    );
    expect(await screen.findByTestId('coach-amend-outcome')).toHaveTextContent('Revision 1 saved and re-sent');
  });

  it('shows a refusal from the server in the editor', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'amendReport').mockRejectedValue(
      new CoachApiError('admin/reports/rep-1/amend', 400, 'Clearing the first-lesson flag needs a Memory Reinforcement score and rationale'),
    );
    renderReview();
    await openEditor();
    fireEvent.change(screen.getByTestId('coach-amend-headline'), { target: { value: 'x' } });
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    fireEvent.click(screen.getByTestId('coach-amend-confirm'));
    expect(await screen.findByTestId('coach-amend-outcome')).toHaveTextContent(
      'Refused (400): Clearing the first-lesson flag needs a Memory Reinforcement score and rationale',
    );
  });

  it('cannot review an amendment that changes nothing', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    renderReview();
    await openEditor();
    expect(screen.getByTestId('coach-amend-review')).toBeDisabled();
  });

  it('keeps the editors and the kept versions out of session replay', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    renderReview();
    await openEditor();
    for (const id of ['coach-amend-dim-rationale-1', 'coach-amend-headline', 'coach-amend-improvements']) {
      expect(screen.getByTestId(id).closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
    }
  });
});

describe('the kept versions', () => {
  it('lists who amended, when, what changed, and whether it was sent', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([
      {
        revision: 2,
        previous: {},
        changes: { dimensions: [], firstLesson: { from: false, to: true }, body: {} },
        amendedBy: 'admin-2',
        amendedAt: '2026-10-08T14:00:00.000Z',
        sentTo: [],
        skipped: [],
        sentAt: null,
      },
      {
        revision: 1,
        previous: {},
        changes: {
          dimensions: [{ n: 5, from: { score: 4, rationale: 'machine 5' }, to: { score: 2, rationale: 'fewer questions' } }],
          body: {},
        },
        amendedBy: 'admin-1',
        amendedAt: '2026-10-07T14:00:00.000Z',
        sentTo: ['leader@example.test'],
        skipped: ['dana@needs-real-email.invalid'],
        sentAt: '2026-10-07T14:00:05.000Z',
      },
    ]);
    renderReview();

    const latest = await screen.findByTestId('coach-revision-2');
    expect(latest).toHaveTextContent('admin-2');
    expect(latest).toHaveTextContent('Not sent');
    expect(within(latest).getByText('First lesson')).toBeInTheDocument();
    expect(within(latest).getByTestId('coach-revision-send-2')).toBeInTheDocument();

    const first = screen.getByTestId('coach-revision-1');
    expect(first).toHaveTextContent('admin-1');
    expect(first).toHaveTextContent('Sent');
    expect(first).toHaveTextContent('leader@example.test');
    expect(first).toHaveTextContent('Skipped placeholder: dana@needs-real-email.invalid');
    expect(within(first).getByText('4 · machine 5')).toBeInTheDocument();
    expect(within(first).getByText('2 · fewer questions')).toBeInTheDocument();
    expect(within(first).queryByTestId('coach-revision-send-1')).toBeNull();
    expect(first.closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
  });

  it('shows why a send was refused', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([
      {
        revision: 1,
        previous: {},
        changes: { dimensions: [], body: { headline: { from: 'a', to: 'b' } } },
        amendedBy: null,
        amendedAt: '2026-10-08T14:00:00.000Z',
        sentTo: [],
        skipped: [],
        sentAt: null,
      },
    ]);
    vi.spyOn(coachService, 'sendRevision').mockRejectedValue(
      new CoachApiError('x', 409, 'The pipeline is in its parallel run: nothing is sent until cutover'),
    );
    renderReview();
    fireEvent.click(await screen.findByTestId('coach-revision-send-1'));
    expect(await screen.findByTestId('coach-revision-outcome')).toHaveTextContent(
      'Refused (409): The pipeline is in its parallel run: nothing is sent until cutover',
    );
  });
});

describe('a legacy report', () => {
  it('offers no amend action and says why', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(null);
    renderReview();
    expect(await screen.findByTestId('coach-review-readonly')).toHaveTextContent(
      'This is a legacy report, which is read-only. Change it at its source and it arrives through the backfill.',
    );
    expect(screen.queryByTestId('coach-amend-open')).toBeNull();
  });
});
