import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CoachApiError } from '@/services/coachService';
import * as coachService from '@/services/coachService';
import { type AdminModule, type OpenRequest, learning, learningAdmin, uploadVideo } from '@/services/coachLearning';
import { JoinRequests } from '@/components/coach/learning/JoinRequests';
import CoachHome from './CoachHome';
import {
  LearningAdminLearnersScreen,
  LearningAdminLessonScreen,
  LearningAdminModuleScreen,
  LearningAdminPreviewScreen,
  LearningAdminScreen,
} from './CoachLearningAdminScreens';

vi.mock('@/services/coachLearning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/coachLearning')>();
  const fns = (names: string[]) => Object.fromEntries(names.map((n) => [n, vi.fn()]));
  return {
    ...actual,
    uploadVideo: vi.fn(),
    learning: fns(['state', 'enrol', 'lesson', 'markDone', 'video', 'check', 'submit', 'sendRequest']),
    learningAdmin: fns(Object.keys(actual.learningAdmin)),
  };
});

vi.mock('@/services/coachService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/coachService')>();
  return { ...actual, fetchCoachMe: vi.fn(), fetchAdminCoaches: vi.fn(async () => []) };
});

vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({ state: { isSignedIn: true, userFirstName: 'Ada', userLastName: 'Admin', userEmail: 'ada@example.test', userAvatarUrl: '' } }),
}));

const A = vi.mocked(learningAdmin);
const refusal = (status: number, code: string, message: string, details: Record<string, unknown> = {}) => new CoachApiError('admin/learning', status, message, { refusal: code, ...details });

function at(path: string, routes: Record<string, JSX.Element>) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          {Object.entries(routes).map(([p, el]) => <Route key={p} path={p} element={el} />)}
          <Route path="*" element={<div data-testid="elsewhere" />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const admin = {
  '/coach/admin/learning': <LearningAdminScreen />,
  '/coach/admin/learning/modules/:id': <LearningAdminModuleScreen />,
  '/coach/admin/learning/lessons/:id': <LearningAdminLessonScreen />,
  '/coach/admin/learning/lessons/:id/preview': <LearningAdminPreviewScreen />,
  '/coach/admin/learning/learners': <LearningAdminLearnersScreen />,
};

function mod(over: Partial<AdminModule> = {}): AdminModule {
  return {
    id: 1,
    title: 'Opening well',
    description: 'How a study starts',
    passMark: 80,
    published: false,
    checkVersion: 1,
    used: false,
    lessons: [
      { id: 11, title: 'Welcome', body: '# Hi', passages: [], published: true, hasVideo: false, videoType: null, used: true },
      { id: 12, title: 'Prayer', body: '', passages: [], published: false, hasVideo: true, videoType: 'video/mp4', used: false },
    ],
    questions: [{ id: 101, prompt: 'First?', options: ['a', 'b'], correct: 0 }],
    ...over,
  };
}

const request: OpenRequest = {
  id: 9,
  name: 'Rui Mendes',
  email: 'rui@example.test',
  note: 'Tuesday group',
  sentAt: '2026-10-11T12:00:00Z',
  completedAt: '2026-10-10T12:00:00Z',
  scores: [{ moduleId: 1, title: 'Opening well', bestScore: 100 }],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(coachService.fetchCoachMe).mockResolvedValue({ isAdmin: true } as never);
  vi.mocked(learning.state).mockResolvedValue({ open: false } as never);
  A.tree.mockResolvedValue({ modules: [mod(), mod({ id: 2, title: 'Questions', published: true })] });
});

describe('join requests on the admin home', () => {
  beforeEach(() => A.requests.mockResolvedValue({ requests: [request] }));

  it('lists each open request with the name, address, completion date, scores and note', async () => {
    at('/', { '/': <JoinRequests /> });
    const list = await screen.findByTestId('learning-requests');
    expect(within(list).getByText('Rui Mendes')).toBeTruthy();
    expect(within(list).getByText('rui@example.test')).toBeTruthy();
    expect(within(list).getByText(/Completed October 10, 2026 · best by module: 1: 100%/)).toBeTruthy();
    expect(within(list).getByText('“Tuesday group”')).toBeTruthy();
    expect(within(list).getByRole('link', { name: 'All learners →' })).toHaveAttribute('href', '/coach/admin/learning/learners');
  });

  it('keeps the request open and shows the reason when another leader uses the name, then approves with a new one', async () => {
    A.approve.mockRejectedValueOnce(refusal(409, 'add-refused', 'a leader named Rui Mendes is already in the program')).mockResolvedValue({ status: 'approved', leaderId: 'rui-m' });
    at('/', { '/': <JoinRequests /> });
    fireEvent.click(await screen.findByRole('button', { name: 'Approve Rui Mendes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Approve and send invite' }));
    expect(await screen.findByText(/Not added: a leader named Rui Mendes is already in the program/)).toBeTruthy();
    fireEvent.change(screen.getByTestId('learning-approve-name'), { target: { value: 'Rui Mendes Jr' } });
    fireEvent.click(screen.getByRole('button', { name: 'Approve and send invite' }));
    expect(await screen.findByText('Rui Mendes Jr added as a leader')).toBeTruthy();
    expect(A.approve).toHaveBeenLastCalledWith(9, { email: 'rui@example.test', name: 'Rui Mendes Jr', group: undefined });
  });

  it('an admin at /coach reaches the program from the roster and sees the open requests there, even with nothing published', async () => {
    at('/coach', { '/coach': <CoachHome /> });
    expect(await screen.findByTestId('oversight-nav-program', {}, { timeout: 4000 })).toBeTruthy();
    expect(await screen.findByTestId('learning-requests')).toBeTruthy();
  });

  it('keeps the dialog, with the learner name and address, out of session replay', async () => {
    at('/', { '/': <JoinRequests /> });
    fireEvent.click(await screen.findByRole('button', { name: 'Approve Rui Mendes' }));
    expect(screen.getByRole('dialog').closest('.ph-no-capture')).not.toBeNull();
  });

  it('tells the admin when the address is no longer confirmed and offers no approve', async () => {
    A.approve.mockRejectedValue(refusal(409, 'address-unconfirmed', 'not confirmed'));
    at('/', { '/': <JoinRequests /> });
    fireEvent.click(await screen.findByRole('button', { name: 'Approve Rui Mendes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Approve and send invite' }));
    expect(await screen.findByText('Not added: the address is not confirmed')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Approve and send invite' })).toBeDisabled();
  });

  it('says a request another admin answered changed nothing', async () => {
    A.decline.mockRejectedValue(refusal(409, 'not-open', 'That request was already answered', { status: 'approved' }));
    at('/', { '/': <JoinRequests /> });
    fireEvent.click(await screen.findByRole('button', { name: 'Decline Rui Mendes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Decline request' }));
    expect(await screen.findByText("Rui Mendes's request was already answered")).toBeTruthy();
    expect(screen.getByText(/It was approved a moment ago. Nothing changed and no email was sent/)).toBeTruthy();
  });

  it('declines with the reason the learner will see', async () => {
    A.decline.mockResolvedValue({ status: 'declined' });
    at('/', { '/': <JoinRequests /> });
    fireEvent.click(await screen.findByRole('button', { name: 'Decline Rui Mendes' }));
    fireEvent.change(screen.getByTestId('learning-decline-reason'), { target: { value: 'Groups must meet weekly' } });
    fireEvent.click(screen.getByRole('button', { name: 'Decline request' }));
    await waitFor(() => expect(A.decline).toHaveBeenCalledWith(9, 'Groups must meet weekly'));
  });
});

describe('authoring', () => {
  it('shows why a module was not published and keeps it a draft', async () => {
    A.publishModule.mockRejectedValue(refusal(409, 'incomplete-module', 'a published module needs a published lesson and a question'));
    at('/coach/admin/learning', admin);
    fireEvent.click(await screen.findByRole('button', { name: 'Publish Opening well' }));
    expect(await screen.findByText('Module 1 was not changed')).toBeTruthy();
    expect(screen.getByText(/a published module needs a published lesson and a question/)).toBeTruthy();
    expect(A.publishModule).toHaveBeenCalledWith(1, true);
  });

  it('reorders modules by sending the new order', async () => {
    A.orderModules.mockResolvedValue({ ok: true });
    at('/coach/admin/learning', admin);
    fireEvent.click(await screen.findByRole('button', { name: 'Move module 1 down' }));
    await waitFor(() => expect(A.orderModules).toHaveBeenCalledWith([2, 1]));
  });

  it('refuses an invalid question with the reason', async () => {
    A.updateQuestion.mockRejectedValue(refusal(400, 'invalid-question', 'Mark exactly one option as correct'));
    at('/coach/admin/learning/modules/1', admin);
    const q = await screen.findByTestId('learning-question-1');
    fireEvent.click(within(q).getByRole('button', { name: 'Save question' }));
    expect(await within(q).findByText('Not saved: Mark exactly one option as correct')).toBeTruthy();
  });

  it('saving one of two new questions keeps the other one as it was typed', async () => {
    A.createQuestion.mockResolvedValue({ id: 102 } as never);
    at('/coach/admin/learning/modules/1', admin);
    const add = await screen.findByRole('button', { name: 'Add a question' });
    fireEvent.click(add);
    fireEvent.click(add);
    const prompt = (n: number) => within(screen.getByTestId(`learning-question-${n}`)).getByTestId('learning-question-prompt') as HTMLInputElement;
    fireEvent.change(prompt(2), { target: { value: 'First draft' } });
    fireEvent.change(prompt(3), { target: { value: 'Second draft' } });
    fireEvent.click(within(screen.getByTestId('learning-question-2')).getByRole('button', { name: 'Save question' }));
    await waitFor(() => expect(screen.queryByTestId('learning-question-3')).toBeNull());
    expect(prompt(2).value).toBe('Second draft');
    expect(A.createQuestion).toHaveBeenCalledTimes(1);
  });

  it('offers to unpublish a lesson learners have done instead of deleting it', async () => {
    A.publishLesson.mockResolvedValue({ ok: true });
    at('/coach/admin/learning/modules/1', admin);
    fireEvent.click(await screen.findByRole('button', { name: 'Delete Welcome' }));
    expect(await screen.findByText('This lesson cannot be deleted')).toBeTruthy();
    expect(A.deleteLesson).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Unpublish the lesson' }));
    await waitFor(() => expect(A.publishLesson).toHaveBeenCalledWith(11, false));
  });

  it('shows the reason a video was refused and keeps the current one', async () => {
    A.videoUploadUrl.mockRejectedValue(refusal(400, 'video-refused', 'Upload an MP4 or WebM video'));
    at('/coach/admin/learning/lessons/12', admin);
    const file = new File(['x'], 'talk.mov', { type: 'video/quicktime' });
    fireEvent.change(await screen.findByTestId('learning-video-file'), { target: { files: [file] } });
    expect(await screen.findByText('talk.mov was not uploaded')).toBeTruthy();
    expect(screen.getByText(/Upload an MP4 or WebM video. The lesson keeps its current video/)).toBeTruthy();
    expect(A.attachVideo).not.toHaveBeenCalled();
  });

  it('replaces a video by uploading it, then attaching it', async () => {
    A.videoUploadUrl.mockResolvedValue({ uploadUrl: 'https://store.test/put' });
    vi.mocked(uploadVideo).mockResolvedValue();
    A.attachVideo.mockResolvedValue({ type: 'video/webm' });
    at('/coach/admin/learning/lessons/12', admin);
    const file = new File(['x'], 'talk.webm', { type: 'video/webm' });
    fireEvent.change(await screen.findByTestId('learning-video-file'), { target: { files: [file] } });
    await waitFor(() => expect(A.attachVideo).toHaveBeenCalledWith(12));
    expect(A.videoUploadUrl).toHaveBeenCalledWith(12, 1, 'video/webm');
    expect(vi.mocked(uploadVideo).mock.calls[0][0]).toBe('https://store.test/put');
  });

  it('keeps the previous video when an upload stops, and offers to try again', async () => {
    A.videoUploadUrl.mockResolvedValue({ uploadUrl: 'https://store.test/put' });
    vi.mocked(uploadVideo).mockRejectedValue(new Error('upload failed'));
    at('/coach/admin/learning/lessons/12', admin);
    fireEvent.change(await screen.findByTestId('learning-video-file'), { target: { files: [new File(['x'], 'talk.mp4', { type: 'video/mp4' })] } });
    expect(await screen.findByText(/The upload of talk.mp4 stopped/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy();
    expect(A.attachVideo).not.toHaveBeenCalled();
  });

  it('previews a draft lesson as learners would see it, marked as a draft', async () => {
    A.lesson.mockResolvedValue({ id: 12, moduleId: 1, moduleTitle: 'Opening well', title: 'Prayer', body: 'Pray **first**.', passages: [], hasVideo: false, done: false, draft: true });
    at('/coach/admin/learning/lessons/12/preview', admin);
    expect(await screen.findByText('Draft · learners cannot open this lesson')).toBeTruthy();
    expect(screen.getByText('first').tagName).toBe('STRONG');
    expect(screen.getByText(/Lesson 2 of 2/)).toBeTruthy();
  });

  it('tells a non-admin the authoring pages are for program admins', async () => {
    A.tree.mockRejectedValue(new CoachApiError('admin/learning', 403, 'Admins only', {}));
    at('/coach/admin/learning', admin);
    expect(await screen.findByTestId('learning-admin-only')).toBeTruthy();
  });
});

describe('the learners list', () => {
  const learner = (i: number) => ({ name: `Learner ${i}`, email: `l${i}@example.test`, enrolledAt: '2026-10-01T12:00:00Z', completedAt: null, passed: 1, total: 2, request: i === 1 ? ('open' as const) : null });

  it('pages through the learners and searches by part of an address', async () => {
    A.learners.mockImplementation(async (q, offset) => ({ total: q ? 1 : 60, limit: 25, offset, learners: q ? [learner(42)] : Array.from({ length: 25 }, (_, i) => learner(offset + i + 1)) }));
    at('/coach/admin/learning/learners', admin);
    expect(await screen.findByText('1–25 of 60')).toBeTruthy();
    expect(screen.getAllByTestId('learning-learner-row')).toHaveLength(25);
    expect(screen.getByText('Request open')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('26–50 of 60')).toBeTruthy();
    expect(A.learners).toHaveBeenLastCalledWith('', 25, 25);
    fireEvent.change(screen.getByTestId('learning-learners-search'), { target: { value: 'l42@' } });
    expect(await screen.findByText('1 learner matching “l42@”')).toBeTruthy();
    expect(A.learners).toHaveBeenLastCalledWith('l42@', 0, 25);
  });
});
