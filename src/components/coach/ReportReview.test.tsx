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
        kind: 'revision',
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

  it('says plainly that a revision kept for a report that is no longer live for its leader was not sent', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'amendReport').mockResolvedValue({
      applied: true,
      revision: 3,
      firstLesson: false,
      base: 80,
      score: 82,
      status: 'Strong',
      sent: false,
      pending: 'not-live',
    });
    renderReview();
    await openEditor();
    fireEvent.change(screen.getByTestId('coach-amend-headline'), { target: { value: 'New' } });
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    fireEvent.click(screen.getByTestId('coach-amend-confirm'));

    expect(await screen.findByTestId('coach-amend-outcome')).toHaveTextContent(
      'Revision 3 is stored but not sent: the report is not live for the leader it was made for (it is held, not delivered, or was re-attributed). Release it, or amend it again once it is live.',
    );
  });

  it('shows an amendment refused while the report is being delivered or re-scored', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'amendReport').mockRejectedValue(
      new CoachApiError('x', 409, 'Refused: the report is being delivered or re-scored. Correct it once that finishes, or amend it after delivery.'),
    );
    renderReview();
    await openEditor();
    fireEvent.change(screen.getByTestId('coach-amend-headline'), { target: { value: 'New' } });
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    fireEvent.click(screen.getByTestId('coach-amend-confirm'));

    expect(await screen.findByTestId('coach-amend-outcome')).toHaveTextContent(
      'Refused (409): Refused: the report is being delivered or re-scored.',
    );
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
    expect(screen.getByTestId('coach-amend-headline')).toHaveValue('x');
  });

  it('a double click on confirm saves and sends one revision', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    const amend = vi.spyOn(coachService, 'amendReport').mockReturnValue(new Promise(() => {}));
    renderReview();
    await openEditor();
    fireEvent.change(screen.getByTestId('coach-amend-headline'), { target: { value: 'x' } });
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    const confirm = screen.getByTestId('coach-amend-confirm');
    fireEvent.click(confirm);
    fireEvent.click(confirm);

    await waitFor(() => expect(confirm).toBeDisabled());
    expect(amend).toHaveBeenCalledTimes(1);
  });

  it('an edit that only adds spaces or blank lines changes nothing', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    renderReview();
    await openEditor();
    fireEvent.change(screen.getByTestId('coach-amend-dim-rationale-5'), { target: { value: '  machine 5  ' } });
    fireEvent.change(screen.getByTestId('coach-amend-headline'), { target: { value: ' A steady session ' } });
    fireEvent.change(screen.getByTestId('coach-amend-overview'), { target: { value: '\n  First paragraph  \n\n' } });
    expect(screen.getByTestId('coach-amend-review')).toBeDisabled();
  });

  it.each([
    ['no-mailer', 'Revision 3 is stored but not sent: no mailer is configured. Send it from the kept versions once one is.'],
    ['send-failed', 'Revision 3 is stored, but the send failed. Send it again from the kept versions.'],
    ['in-flight', 'Revision 3 is stored, and another request is sending it right now.'],
    ['something-new', 'Revision 3 is stored but not sent (something-new).'],
  ])('says why a revision is stored but not sent (%s)', async (pending, text) => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'amendReport').mockResolvedValue({ applied: true, revision: 3, sent: false, pending });
    renderReview();
    await openEditor();
    fireEvent.change(screen.getByTestId('coach-amend-headline'), { target: { value: 'x' } });
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    fireEvent.click(screen.getByTestId('coach-amend-confirm'));
    expect(await screen.findByTestId('coach-amend-outcome')).toHaveTextContent(text);
  });

  it('names each recipient the re-send failed for, and why', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'amendReport').mockResolvedValue({
      applied: true,
      revision: 1,
      sent: true,
      sends: [
        { email: 'leader@example.test', delivered: true },
        { email: 'coach@example.test', delivered: false, error: 'mailbox full' },
        { email: 'other@example.test', delivered: false },
      ],
    });
    renderReview();
    await openEditor();
    fireEvent.change(screen.getByTestId('coach-amend-headline'), { target: { value: 'x' } });
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    fireEvent.click(screen.getByTestId('coach-amend-confirm'));
    const outcome = await screen.findByTestId('coach-amend-outcome');
    expect(outcome).toHaveTextContent('Failed: coach@example.test (mailbox full), other@example.test.');
    expect(outcome.closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
  });

  it('labels the left column delivered when the latest version went out', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([revision(1, '2026-10-07T14:00:05.000Z')]);
    renderReview();
    await screen.findByTestId('coach-revision-1');
    await openEditor();
    fireEvent.change(screen.getByTestId('coach-amend-headline'), { target: { value: 'x' } });
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    expect(within(screen.getByTestId('coach-amend-diff')).getByText('Delivered')).toBeInTheDocument();
  });

  it('does not call an unsent latest version delivered', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([revision(2, null), revision(1, '2026-10-07T14:00:05.000Z')]);
    renderReview();
    await screen.findByTestId('coach-revision-2');
    await openEditor();
    fireEvent.change(screen.getByTestId('coach-amend-headline'), { target: { value: 'x' } });
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    const diff = screen.getByTestId('coach-amend-diff');
    expect(within(diff).queryByText('Delivered')).toBeNull();
    expect(within(diff).getByText('Latest, not sent')).toBeInTheDocument();
    expect(screen.getByText(/Check the latest version, which was not sent, against the amended one/)).toBeInTheDocument();
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

const POINTS = [{ title: 'Quiet members', paragraphs: ['Call on them by name.', 'Wait for the answer.'] }];
const WITH_PROSE = {
  ...REPORT,
  feedback: {
    ...REPORT.feedback,
    strengthsProse: [{ title: 'Scripture first', paragraphs: ['Opened with the text.'] }],
    improvementsProse: POINTS,
  },
} as unknown as CoachReport;

describe('amending the written-out points the leader reads first', () => {
  async function confirmWith(edit: () => void) {
    renderReview(WITH_PROSE);
    await openEditor();
    edit();
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    fireEvent.click(screen.getByTestId('coach-amend-confirm'));
  }

  beforeEach(() => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
  });

  it('shows each point of a list that has them, and sends an edited point with its list', async () => {
    const amend = vi.spyOn(coachService, 'amendReport').mockResolvedValue({ applied: true, revision: 1, sent: true });
    renderReview(WITH_PROSE);
    await openEditor();
    expect(screen.getByTestId('coach-amend-improvements-prose-title-0')).toHaveValue('Quiet members');
    expect(screen.getByTestId('coach-amend-improvements-prose-text-0')).toHaveValue('Call on them by name.\n\nWait for the answer.');
    expect(screen.getByTestId('coach-amend-strengths-prose-title-0')).toHaveValue('Scripture first');
    expect(screen.queryByTestId('coach-amend-recommendations-prose')).toBeNull();
    for (const id of ['coach-amend-improvements-prose-title-0', 'coach-amend-improvements-prose-text-0']) {
      expect(screen.getByTestId(id).closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
    }

    fireEvent.change(screen.getByTestId('coach-amend-improvements-prose-text-0'), {
      target: { value: 'Call on them by name.\n\n  Give them time to answer.  ' },
    });
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    const diff = screen.getByTestId('coach-amend-diff');
    expect(within(diff).getByText('Improvements, written out')).toBeInTheDocument();
    expect(diff).toHaveTextContent('Wait for the answer.');
    expect(diff).toHaveTextContent('Give them time to answer.');
    expect(diff).not.toHaveTextContent('[object Object]');

    fireEvent.click(screen.getByTestId('coach-amend-confirm'));
    await waitFor(() =>
      expect(amend).toHaveBeenCalledWith('rep-1', {
        body: { improvementsProse: [{ title: 'Quiet members', paragraphs: ['Call on them by name.', 'Give them time to answer.'] }] },
      }),
    );
  });

  it('a list edited without its points keeps the points as they were', async () => {
    const amend = vi.spyOn(coachService, 'amendReport').mockResolvedValue({ applied: true, revision: 1, sent: true });
    await confirmWith(() => {
      fireEvent.change(screen.getByTestId('coach-amend-improvements'), { target: { value: 'Call on quiet members by name' } });
      expect(screen.getByTestId('coach-amend-improvements-prose-kept')).toHaveTextContent(
        'The leader still reads these points first, unchanged.',
      );
    });
    await waitFor(() =>
      expect(amend).toHaveBeenCalledWith('rep-1', {
        body: { improvements: ['Call on quiet members by name'], improvementsProse: POINTS },
      }),
    );
  });

  it('clears the points of an edited list only when the admin says so, and the check step shows it', async () => {
    const amend = vi.spyOn(coachService, 'amendReport').mockResolvedValue({ applied: true, revision: 1, sent: true });
    renderReview(WITH_PROSE);
    await openEditor();
    expect(screen.queryByTestId('coach-amend-improvements-prose-clear')).toBeNull();
    fireEvent.change(screen.getByTestId('coach-amend-improvements'), { target: { value: 'Call on quiet members by name' } });
    fireEvent.click(screen.getByTestId('coach-amend-improvements-prose-clear'));
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    expect(screen.getByTestId('coach-amend-diff')).toHaveTextContent('Cleared: the leader reads the list instead');
    fireEvent.click(screen.getByTestId('coach-amend-confirm'));
    await waitFor(() => expect(amend).toHaveBeenCalledWith('rep-1', { body: { improvements: ['Call on quiet members by name'] } }));
  });

  it('removes a point and adds one', async () => {
    const amend = vi.spyOn(coachService, 'amendReport').mockResolvedValue({ applied: true, revision: 1, sent: true });
    await confirmWith(() => {
      fireEvent.click(screen.getByTestId('coach-amend-improvements-prose-remove-0'));
      fireEvent.click(screen.getByTestId('coach-amend-improvements-prose-add'));
      fireEvent.change(screen.getByTestId('coach-amend-improvements-prose-title-0'), { target: { value: 'Newcomers' } });
      fireEvent.change(screen.getByTestId('coach-amend-improvements-prose-text-0'), { target: { value: 'Ask them first.' } });
    });
    await waitFor(() =>
      expect(amend).toHaveBeenCalledWith('rep-1', {
        body: { improvementsProse: [{ title: 'Newcomers', paragraphs: ['Ask them first.'] }] },
      }),
    );
  });

  it('a point edited only by spaces or blank lines changes nothing', async () => {
    renderReview(WITH_PROSE);
    await openEditor();
    fireEvent.change(screen.getByTestId('coach-amend-improvements-prose-title-0'), { target: { value: ' Quiet members ' } });
    fireEvent.change(screen.getByTestId('coach-amend-improvements-prose-text-0'), {
      target: { value: '\nCall on them by name.\n\n\n\nWait for the answer.\n' },
    });
    expect(screen.getByTestId('coach-amend-review')).toBeDisabled();
  });

  it('the kept versions show a change to the points in words', async () => {
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([
      {
        ...revision(1, null),
        changes: { dimensions: [], body: { improvementsProse: { from: POINTS, to: [{ title: 'Newcomers', paragraphs: ['Ask them first.'] }] } } },
      },
    ]);
    renderReview(WITH_PROSE);
    const row = await screen.findByTestId('coach-revision-1');
    expect(within(row).getByText('Improvements, written out')).toBeInTheDocument();
    expect(row).toHaveTextContent('Ask them first.');
    expect(row).not.toHaveTextContent('[object Object]');
  });

  it('the kept versions say a list whose points were cleared is read as the list instead', async () => {
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([
      {
        ...revision(1, null),
        changes: {
          dimensions: [],
          body: {
            improvements: { from: ['Call on quiet members'], to: ['Call on quiet members by name'] },
            improvementsProse: { from: POINTS, to: null },
          },
        },
      },
    ]);
    renderReview(WITH_PROSE);
    const row = await screen.findByTestId('coach-revision-1');
    expect(within(row).getByText('Improvements, written out')).toBeInTheDocument();
    expect(row).toHaveTextContent('Call on them by name.');
    expect(within(row).getByText('Cleared: the leader reads the list instead')).toBeInTheDocument();
  });
});

function revision(n: number, sentAt: string | null): coachService.ReportRevision {
  return {
    kind: 'revision',
    revision: n,
    previous: {},
    changes: { dimensions: [], body: { headline: { from: `h${n - 1}`, to: `h${n}` } } },
    amendedBy: 'admin@example.test',
    amendedAt: '2026-10-08T14:00:00.000Z',
    sentTo: sentAt ? ['leader@example.test'] : [],
    skipped: [],
    sentAt,
  };
}

function preDeliveryEdit(n: number, editedAt: string): coachService.ReportEdit {
  return {
    kind: 'edit',
    edit: n,
    changes: {
      improvements: { from: ['Recall last week'], to: ['Call on quiet members'] },
      improvementsProse: { from: POINTS, to: null },
    },
    editedBy: 'editor@example.test',
    editedAt,
  };
}

describe('pre-delivery edits in the kept versions', () => {
  beforeEach(() => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
  });

  it('shows who edited before delivery, when, and what changed, including cleared points, and never offers a send', async () => {
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([preDeliveryEdit(7, '2026-10-07T12:00:00.000Z')]);
    renderReview();
    const row = await screen.findByTestId('coach-edit-7');
    expect(row).toHaveTextContent('Edited before delivery by editor@example.test, Oct 7, 2026');
    expect(within(row).getByText('Improvements')).toBeInTheDocument();
    expect(within(row).getByText('Recall last week')).toBeInTheDocument();
    expect(within(row).getByText('Call on quiet members')).toBeInTheDocument();
    expect(within(row).getByText('Cleared: the leader reads the list instead')).toBeInTheDocument();
    expect(within(row).queryByRole('button')).toBeNull();
    expect(row).not.toHaveTextContent('Not sent');
    expect(row.closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
  });

  it('keeps the send on the latest unsent revision when an edit is newer', async () => {
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([
      preDeliveryEdit(7, '2026-10-09T12:00:00.000Z'),
      revision(1, null),
    ]);
    renderReview();
    expect(within(await screen.findByTestId('coach-revision-1')).getByTestId('coach-revision-send-1')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Send this revision' })).toHaveLength(1);
  });

  it('lists revisions and edits newest first, whatever order they arrive in', async () => {
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([
      revision(1, '2026-10-08T14:00:05.000Z'),
      preDeliveryEdit(7, '2026-10-07T12:00:00.000Z'),
      preDeliveryEdit(8, '2026-10-07T13:00:00.000Z'),
    ]);
    renderReview();
    await screen.findByTestId('coach-edit-8');
    const order = screen.getAllByTestId(/^coach-(revision|edit)-\d+$/).map((el) => el.dataset.testid);
    expect(order).toEqual(['coach-revision-1', 'coach-edit-8', 'coach-edit-7']);
  });

  it('a mixed history with edits older and newer than the revisions renders in time order, with the send only on the latest unsent revision', async () => {
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([
      preDeliveryEdit(9, '2026-10-09T12:00:00.000Z'),
      { ...revision(1, '2026-10-08T10:00:05.000Z'), amendedAt: '2026-10-08T10:00:00.000Z' },
      preDeliveryEdit(7, '2026-10-07T12:00:00.000Z'),
      { ...revision(2, null), amendedAt: '2026-10-08T14:00:00.000Z' },
    ]);
    renderReview();
    await screen.findByTestId('coach-edit-9');
    const order = screen.getAllByTestId(/^coach-(revision|edit)-\d+$/).map((el) => el.dataset.testid);
    expect(order).toEqual(['coach-edit-9', 'coach-revision-2', 'coach-revision-1', 'coach-edit-7']);
    expect(screen.getAllByRole('button', { name: 'Send this revision' })).toHaveLength(1);
    expect(within(screen.getByTestId('coach-revision-2')).getByTestId('coach-revision-send-2')).toBeInTheDocument();
  });

  it('an edit made before delivery does not make the delivered version read as unsent', async () => {
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([preDeliveryEdit(7, '2026-10-09T12:00:00.000Z')]);
    renderReview();
    await screen.findByTestId('coach-edit-7');
    await openEditor();
    fireEvent.change(screen.getByTestId('coach-amend-headline'), { target: { value: 'A sharper headline' } });
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    expect(screen.getByTestId('coach-amend-diff')).toHaveTextContent('Delivered');
    expect(screen.getByTestId('coach-amend-diff')).not.toHaveTextContent('Latest, not sent');
  });
});

describe('the kept versions', () => {
  it('offers the send only on the latest unsent version, whatever order the list arrives in', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([revision(1, null), revision(2, null)]);
    renderReview();
    expect(within(await screen.findByTestId('coach-revision-2')).getByTestId('coach-revision-send-2')).toBeInTheDocument();
    expect(screen.queryByTestId('coach-revision-send-1')).toBeNull();
  });

  it('offers no send when the latest version went out, even if an older one did not', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([revision(1, null), revision(2, '2026-10-08T14:00:05.000Z')]);
    renderReview();
    await screen.findByTestId('coach-revision-2');
    expect(screen.queryByTestId('coach-revision-send-1')).toBeNull();
    expect(screen.queryByTestId('coach-revision-send-2')).toBeNull();
  });

  it('a double click on send sends the revision once', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([revision(1, null)]);
    const send = vi.spyOn(coachService, 'sendRevision').mockReturnValue(new Promise(() => {}));
    renderReview();
    const button = await screen.findByTestId('coach-revision-send-1');
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("names the amending admin by address and keeps it out of session replay", async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([revision(1, null)]);
    renderReview();
    const by = within(await screen.findByTestId('coach-revision-1')).getByText(/admin@example\.test/);
    expect(by.closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
  });

  it('names each recipient a send failed for', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([revision(1, null)]);
    vi.spyOn(coachService, 'sendRevision').mockResolvedValue({
      sent: false,
      refusal: 'send-failed',
      sends: [{ email: 'leader@example.test', delivered: false, error: 'rejected' }],
    });
    renderReview();
    fireEvent.click(await screen.findByTestId('coach-revision-send-1'));
    expect(await screen.findByTestId('coach-revision-outcome')).toHaveTextContent(
      'Not sent: send-failed. Failed: leader@example.test (rejected).',
    );
  });

  it('lists who amended, when, what changed, and whether it was sent', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([
      {
        kind: 'revision',
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
        kind: 'revision',
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

  it('shows a send refused because the report is not live for its leader', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([
      {
        kind: 'revision',
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
      new CoachApiError(
        'x',
        409,
        'The report is not live for the leader this revision was made for: it is held, not delivered, or re-attributed',
      ),
    );
    renderReview();
    fireEvent.click(await screen.findByTestId('coach-revision-send-1'));
    expect(await screen.findByTestId('coach-revision-outcome')).toHaveTextContent(
      'Refused (409): The report is not live for the leader this revision was made for: it is held, not delivered, or re-attributed',
    );
  });

  it('shows why a send was refused', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([
      {
        kind: 'revision',
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

describe('a review that fails to load', () => {
  it('says the load failed and offers a retry, and does not call the report legacy', async () => {
    const load = vi
      .spyOn(coachService, 'fetchReportReview')
      .mockRejectedValueOnce(new CoachApiError('admin/reports/rep-1/review', 500, ''))
      .mockResolvedValueOnce(REVIEW);
    renderReview();
    expect(await screen.findByTestId('coach-review-failed')).toHaveTextContent('Could not load the review. Server error (500)');
    expect(screen.queryByTestId('coach-review-readonly')).toBeNull();
    fireEvent.click(screen.getByText('Try again'));
    expect(await screen.findByTestId('coach-amend-open')).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
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

describe('the first-lesson flag on an undelivered report', () => {
  const UNDELIVERED: ReportReviewState = { ...REVIEW, delivered: false };

  it('says whether the flag was detected or set by hand, and names the passage book', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue({ ...UNDELIVERED, firstLesson: true, firstLessonSource: 'detected' });
    renderReview();
    const state = await screen.findByTestId('coach-first-lesson-state');
    expect(state).toHaveTextContent('First lesson: yes, detected by the pipeline. Passage book: Jonah.');
    expect(screen.queryByTestId('coach-amend-open')).toBeNull();
  });

  it('says when the book is not known and the flag was set by hand', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue({
      ...UNDELIVERED,
      firstLesson: true,
      firstLessonSource: 'admin',
      passageBook: null,
    });
    renderReview();
    expect(await screen.findByTestId('coach-first-lesson-state')).toHaveTextContent(
      'First lesson: yes, set by hand. Passage book not known.',
    );
  });

  it('sets the flag', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(UNDELIVERED);
    const set = vi
      .spyOn(coachService, 'setFirstLesson')
      .mockResolvedValue({ applied: true, firstLesson: true, base: 82, score: 84, status: 'Strong' });
    renderReview();
    expect(await screen.findByTestId('coach-first-lesson-state')).toHaveTextContent('First lesson: no.');
    fireEvent.click(screen.getByTestId('coach-first-lesson-set'));
    await waitFor(() => expect(set).toHaveBeenCalledWith('rep-1', { firstLesson: true }));
    expect(await screen.findByTestId('coach-first-lesson-outcome')).toHaveTextContent(
      'Marked a first lesson. Memory Reinforcement is not applicable. Score 84 (Strong).',
    );
  });

  it('a double click sets the flag once', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(UNDELIVERED);
    const set = vi.spyOn(coachService, 'setFirstLesson').mockReturnValue(new Promise(() => {}));
    renderReview();
    const button = await screen.findByTestId('coach-first-lesson-set');
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    expect(set).toHaveBeenCalledTimes(1);
  });

  it('clearing asks for the Memory Reinforcement score and rationale', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue({ ...UNDELIVERED, firstLesson: true, firstLessonSource: 'detected' });
    const set = vi
      .spyOn(coachService, 'setFirstLesson')
      .mockResolvedValue({ applied: true, firstLesson: false, base: 79, score: 81, status: 'Strong' });
    renderReview();
    fireEvent.click(await screen.findByTestId('coach-first-lesson-clear'));
    const save = screen.getByTestId('coach-first-lesson-save');
    expect(save).toBeDisabled();
    expect(screen.getByLabelText('Memory Reinforcement score')).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('coach-first-lesson-score'), { target: { value: '3' } });
    expect(save).toBeDisabled();
    fireEvent.change(screen.getByTestId('coach-first-lesson-rationale'), { target: { value: ' Reviewed last week before the new text ' } });
    expect(screen.getByTestId('coach-first-lesson-rationale').closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
    fireEvent.click(save);
    await waitFor(() =>
      expect(set).toHaveBeenCalledWith('rep-1', {
        firstLesson: false,
        score: 3,
        rationale: 'Reviewed last week before the new text',
      }),
    );
    expect(await screen.findByTestId('coach-first-lesson-outcome')).toHaveTextContent(
      'First-lesson flag cleared. Memory Reinforcement is scored 3, recorded as corrected by hand. Score 81 (Strong).',
    );
  });

  it('shows the flag refused while the report is being delivered or re-scored, and keeps the action', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(UNDELIVERED);
    vi.spyOn(coachService, 'setFirstLesson').mockRejectedValue(
      new CoachApiError('x', 409, 'Refused: the report is being delivered or re-scored. Correct it once that finishes, or amend it after delivery.'),
    );
    renderReview();
    fireEvent.click(await screen.findByTestId('coach-first-lesson-set'));
    expect(await screen.findByTestId('coach-first-lesson-outcome')).toHaveTextContent(
      'Refused (409): Refused: the report is being delivered or re-scored. Correct it once that finishes, or amend it after delivery.',
    );
    await waitFor(() => expect(screen.getByTestId('coach-first-lesson-set')).not.toBeDisabled());
  });

  it('a flag held for cold recall on a report delivered meanwhile opens the amend editor with the flag as the starting draft', async () => {
    const load = vi
      .spyOn(coachService, 'fetchReportReview')
      .mockResolvedValueOnce(UNDELIVERED)
      .mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'setFirstLesson').mockResolvedValue({
      applied: false,
      refusal: 'cold-recall-improvement',
      coldRecall: ['Call on quiet members'],
    });
    const amend = vi.spyOn(coachService, 'amendReport').mockResolvedValue({ applied: true, revision: 1, firstLesson: true, sent: true });
    renderReview();
    fireEvent.click(await screen.findByTestId('coach-first-lesson-set'));

    const editor = await screen.findByTestId('coach-amend-editor');
    expect(load).toHaveBeenCalledTimes(2);
    expect(within(editor).getByTestId('coach-amend-first-lesson')).toBeChecked();
    expect(within(editor).getByTestId('coach-amend-held')).toHaveTextContent('Call on quiet members');
    expect(screen.getByTestId('coach-amend-outcome')).toHaveTextContent(
      'This report was delivered meanwhile, so the flag goes through an amendment. Not saved and not sent: a first lesson cannot carry an improvement that asks for recall of earlier lessons. Replace the held items under Improvements and submit again.',
    );
    expect(screen.queryByTestId('coach-first-lesson-set')).toBeNull();

    fireEvent.change(screen.getByTestId('coach-amend-improvements'), { target: { value: 'Name the big idea up front' } });
    fireEvent.click(screen.getByTestId('coach-amend-review'));
    fireEvent.click(screen.getByTestId('coach-amend-confirm'));
    await waitFor(() =>
      expect(amend).toHaveBeenCalledWith('rep-1', { firstLesson: true, body: { improvements: ['Name the big idea up front'] } }),
    );
  });

  it('a flag saved as a revision because the report was delivered meanwhile shows the amend panel and what was saved', async () => {
    vi.spyOn(coachService, 'fetchReportReview')
      .mockResolvedValueOnce(UNDELIVERED)
      .mockResolvedValue({ ...REVIEW, firstLesson: true, firstLessonSource: 'admin' });
    vi.spyOn(coachService, 'setFirstLesson').mockResolvedValue({
      applied: true,
      revision: 1,
      firstLesson: true,
      score: 84,
      status: 'Strong',
      sent: true,
      sends: [{ email: 'leader@example.test', delivered: true }],
    });
    renderReview();
    fireEvent.click(await screen.findByTestId('coach-first-lesson-set'));

    expect(await screen.findByTestId('coach-amend-outcome')).toHaveTextContent(
      'This report was delivered meanwhile, so the flag goes through an amendment. Revision 1 saved and re-sent, marked revised. Score 84 (Strong).',
    );
    expect(screen.getByTestId('coach-amend-open')).toBeInTheDocument();
    expect(screen.queryByTestId('coach-amend-editor')).toBeNull();
  });

  it('shows the flag refused on a report already emailed to some of its recipients', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(UNDELIVERED);
    vi.spyOn(coachService, 'setFirstLesson').mockRejectedValue(
      new CoachApiError(
        'x',
        409,
        'Refused: the report was already emailed to some of its recipients and its delivery is still finishing. Amend it once delivery completes.',
      ),
    );
    renderReview();
    fireEvent.click(await screen.findByTestId('coach-first-lesson-set'));
    expect(await screen.findByTestId('coach-first-lesson-outcome')).toHaveTextContent(
      'Refused (409): Refused: the report was already emailed to some of its recipients and its delivery is still finishing. Amend it once delivery completes.',
    );
    expect(screen.getByTestId('coach-first-lesson-state')).toHaveTextContent('First lesson: no.');
  });

  it('shows the refusal when the server will not change the flag', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(UNDELIVERED);
    vi.spyOn(coachService, 'setFirstLesson').mockRejectedValue(
      new CoachApiError('x', 409, 'Refused: this is a legacy report, which is read-only.'),
    );
    renderReview();
    fireEvent.click(await screen.findByTestId('coach-first-lesson-set'));
    expect(await screen.findByTestId('coach-first-lesson-outcome')).toHaveTextContent(
      'Refused (409): Refused: this is a legacy report, which is read-only.',
    );
  });
});

describe('the first-lesson flag on a delivered report', () => {
  it('shows where the flag came from beside the amend action', async () => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue({ ...REVIEW, firstLesson: true, firstLessonSource: 'admin' });
    renderReview();
    expect(await screen.findByTestId('coach-first-lesson-state')).toHaveTextContent('First lesson: yes, set by hand.');
    expect(screen.queryByTestId('coach-first-lesson-set')).toBeNull();
  });
});

describe('editing the Improvements of an undelivered report', () => {
  const UNDELIVERED: ReportReviewState = { ...REVIEW, delivered: false, firstLesson: true, firstLessonSource: 'detected' };
  const SAVED = 'Improvements saved. Nothing was sent: the leader gets them when the report is delivered, and a held report goes out once it is released from the Pipeline list.';

  async function openImprovements(report: CoachReport = REPORT) {
    renderReview(report);
    fireEvent.click(await screen.findByTestId('coach-improvements-open'));
    return screen.getByTestId('coach-improvements-editor');
  }

  beforeEach(() => {
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(UNDELIVERED);
  });

  it('replaces the improvements, one per line, and says nothing was sent', async () => {
    const edit = vi.spyOn(coachService, 'editImprovements').mockResolvedValue({ applied: true });
    const editor = await openImprovements();
    expect(editor.closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
    const text = screen.getByTestId('coach-improvements-text');
    expect(text).toHaveValue('Call on quiet members');
    expect(screen.getByTestId('coach-improvements-save')).toBeDisabled();

    fireEvent.change(text, { target: { value: 'Name the big idea up front\n\n Ask newcomers first ' } });
    fireEvent.click(screen.getByTestId('coach-improvements-save'));
    await waitFor(() =>
      expect(edit).toHaveBeenCalledWith('rep-1', { improvements: ['Name the big idea up front', 'Ask newcomers first'] }),
    );
    expect(await screen.findByTestId('coach-improvements-outcome')).toHaveTextContent(SAVED);
    expect(screen.queryByTestId('coach-improvements-editor')).toBeNull();
  });

  it('keeps the written-out points unchanged when only the list is edited, unless the admin clears them', async () => {
    const edit = vi.spyOn(coachService, 'editImprovements').mockResolvedValue({ applied: true });
    await openImprovements(WITH_PROSE);
    fireEvent.change(screen.getByTestId('coach-improvements-text'), { target: { value: 'Call on quiet members by name' } });
    expect(screen.getByTestId('coach-amend-improvements-prose-kept')).toHaveTextContent('The leader still reads these points first, unchanged.');
    fireEvent.click(screen.getByTestId('coach-improvements-save'));
    await waitFor(() =>
      expect(edit).toHaveBeenLastCalledWith('rep-1', { improvements: ['Call on quiet members by name'], improvementsProse: POINTS }),
    );

    await screen.findByTestId('coach-improvements-outcome');
    fireEvent.click(screen.getByTestId('coach-improvements-open'));
    fireEvent.change(screen.getByTestId('coach-improvements-text'), { target: { value: 'Call on quiet members by name' } });
    fireEvent.click(screen.getByTestId('coach-amend-improvements-prose-clear'));
    fireEvent.click(screen.getByTestId('coach-improvements-save'));
    await waitFor(() => expect(edit).toHaveBeenLastCalledWith('rep-1', { improvements: ['Call on quiet members by name'] }));
  });

  it('sends an edited point with the list as it stands', async () => {
    const edit = vi.spyOn(coachService, 'editImprovements').mockResolvedValue({ applied: true });
    await openImprovements(WITH_PROSE);
    fireEvent.change(screen.getByTestId('coach-amend-improvements-prose-text-0'), { target: { value: 'Ask them by name.' } });
    fireEvent.click(screen.getByTestId('coach-improvements-save'));
    await waitFor(() =>
      expect(edit).toHaveBeenCalledWith('rep-1', {
        improvements: ['Call on quiet members'],
        improvementsProse: [{ title: 'Quiet members', paragraphs: ['Ask them by name.'] }],
      }),
    );
  });

  it('a first lesson that still carries a cold-recall item is not saved, and the held items are named', async () => {
    vi.spyOn(coachService, 'editImprovements').mockResolvedValue({
      applied: false,
      refusal: 'cold-recall-improvement',
      coldRecall: ["Recall last week's big idea"],
    });
    await openImprovements();
    fireEvent.change(screen.getByTestId('coach-improvements-text'), { target: { value: "Recall last week's big idea" } });
    fireEvent.click(screen.getByTestId('coach-improvements-save'));
    expect(await screen.findByTestId('coach-improvements-outcome')).toHaveTextContent(
      'Not saved: a first lesson cannot carry an improvement that asks for recall of earlier lessons. Replace the held items and save again.',
    );
    const held = screen.getByTestId('coach-improvements-held');
    expect(held).toHaveTextContent("Recall last week's big idea");
    expect(held.closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
    expect(screen.getByTestId('coach-improvements-text')).toHaveValue("Recall last week's big idea");
  });

  it('shows a refusal in words and keeps the draft', async () => {
    vi.spyOn(coachService, 'editImprovements').mockRejectedValue(
      new CoachApiError(
        'x',
        409,
        'Refused: the report was already emailed to some of its recipients and its delivery is still finishing. Amend it once delivery completes.',
      ),
    );
    await openImprovements();
    fireEvent.change(screen.getByTestId('coach-improvements-text'), { target: { value: 'Ask newcomers first' } });
    fireEvent.click(screen.getByTestId('coach-improvements-save'));
    expect(await screen.findByTestId('coach-improvements-outcome')).toHaveTextContent(
      'already emailed to some of its recipients and its delivery is still finishing. Amend it once delivery completes.',
    );
    expect(screen.getByTestId('coach-improvements-text')).toHaveValue('Ask newcomers first');
  });

  it('shows the refusal of an edit that changes nothing in the editor and keeps the draft', async () => {
    const nothing = 'The edit changes nothing: give at least one improvement, different from the current ones';
    vi.spyOn(coachService, 'editImprovements').mockRejectedValue(new CoachApiError('x', 400, nothing));
    await openImprovements();
    fireEvent.change(screen.getByTestId('coach-improvements-text'), { target: { value: '' } });
    fireEvent.click(screen.getByTestId('coach-improvements-save'));
    expect(await screen.findByTestId('coach-improvements-outcome')).toHaveTextContent(`Refused (400): ${nothing}`);
    expect(screen.getByTestId('coach-improvements-editor')).toBeInTheDocument();
    expect(screen.getByTestId('coach-improvements-text')).toHaveValue('');
    expect(screen.getByTestId('coach-review-rep-1')).toBeInTheDocument();
    expect(screen.queryByTestId('coach-amend-open')).toBeNull();
  });

  it('keeps Save off while the bullets and the points equal the current ones', async () => {
    await openImprovements(WITH_PROSE);
    const save = screen.getByTestId('coach-improvements-save');
    const text = screen.getByTestId('coach-improvements-text');
    const point = screen.getByTestId('coach-amend-improvements-prose-text-0');
    const title = screen.getByTestId('coach-amend-improvements-prose-title-0');
    expect(save).toBeDisabled();

    fireEvent.change(text, { target: { value: 'Call on quiet members by name' } });
    expect(save).toBeEnabled();
    fireEvent.change(text, { target: { value: '  Call on quiet members \n\n' } });
    expect(save).toBeDisabled();

    fireEvent.change(point, { target: { value: 'Something else.' } });
    expect(save).toBeEnabled();
    fireEvent.change(point, { target: { value: (POINTS[0].paragraphs ?? []).join('\n\n') } });
    expect(save).toBeDisabled();

    fireEvent.change(title, { target: { value: `  ${POINTS[0].title}  ` } });
    expect(save).toBeDisabled();
  });

  it('a report delivered meanwhile is read again, so the amend action is offered with the refusal', async () => {
    const delivered = 'Refused: the report was already delivered. Amend it instead, which sends the leader a revised copy.';
    vi.spyOn(coachService, 'fetchReportReview').mockResolvedValueOnce(UNDELIVERED).mockResolvedValue(REVIEW);
    vi.spyOn(coachService, 'editImprovements').mockRejectedValue(new CoachApiError('x', 409, delivered));
    await openImprovements();
    fireEvent.change(screen.getByTestId('coach-improvements-text'), { target: { value: 'Ask newcomers first' } });
    fireEvent.click(screen.getByTestId('coach-improvements-save'));
    expect(await screen.findByTestId('coach-amend-open')).toBeInTheDocument();
    expect(screen.getByTestId('coach-amend-outcome')).toHaveTextContent(delivered);
  });

  it('a double click saves once', async () => {
    const edit = vi.spyOn(coachService, 'editImprovements').mockReturnValue(new Promise(() => {}));
    await openImprovements();
    fireEvent.change(screen.getByTestId('coach-improvements-text'), { target: { value: 'Ask newcomers first' } });
    const save = screen.getByTestId('coach-improvements-save');
    fireEvent.click(save);
    fireEvent.click(save);
    await waitFor(() => expect(save).toBeDisabled());
    expect(edit).toHaveBeenCalledTimes(1);
  });
});
