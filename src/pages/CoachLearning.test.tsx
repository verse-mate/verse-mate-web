import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CoachApiError, CoachAuthError } from '@/services/coachService';
import * as coachService from '@/services/coachService';
import { type Check, type Lesson, type ProgramState, learning } from '@/services/coachLearning';
import { CoachGate } from '@/components/coach/CoachDashboardShell';
import CoachDashboardShell from '@/components/coach/CoachDashboardShell';
import { Markdown } from '@/components/coach/learning/ui';
import { LearningCheckScreen, LearningCompletionScreen, LearningLessonScreen, LearningPathScreen } from './CoachLearningScreens';

vi.mock('@/services/coachLearning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/coachLearning')>();
  return {
    ...actual,
    learning: { state: vi.fn(), enrol: vi.fn(), lesson: vi.fn(), markDone: vi.fn(), video: vi.fn(), check: vi.fn(), submit: vi.fn(), sendRequest: vi.fn() },
  };
});

vi.mock('@/services/coachService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/coachService')>();
  return { ...actual, fetchCoachMe: vi.fn() };
});

vi.mock('@/services/emailVerification', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/emailVerification')>()),
  sendVerificationEmail: vi.fn(async () => ({})),
}));

window.scrollTo = vi.fn() as never;

const signedIn = { current: true };
vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({ state: { isSignedIn: signedIn.current, userFirstName: 'Ann', userLastName: 'Lee', userEmail: 'ann@example.test', userAvatarUrl: '' } }),
}));

const L = vi.mocked(learning);

function program(over: Partial<ProgramState> = {}): ProgramState {
  return {
    open: true,
    enrolledAt: '2026-10-01T10:00:00.000Z',
    completedAt: null,
    passed: 0,
    total: 2,
    next: { kind: 'lesson', lessonId: 13, moduleId: 1 },
    isLeader: false,
    addressConfirmed: true,
    request: null,
    modules: [
      {
        id: 1,
        title: 'Opening well',
        description: 'How a study starts',
        passMark: 80,
        state: 'locked',
        bestScore: null,
        questionCount: 3,
        lessons: [
          { id: 11, title: 'Welcome', state: 'done' },
          { id: 12, title: 'Prayer', state: 'done' },
          { id: 13, title: 'Reading together', state: 'open' },
        ],
      },
      { id: 2, title: 'Questions that land', description: 'Asking', passMark: 70, state: 'locked', bestScore: null, questionCount: 2, lessons: [{ id: 21, title: 'Open questions', state: 'locked' }] },
    ],
    ...over,
  };
}

function lesson(over: Partial<Lesson> = {}): Lesson {
  return { id: 13, moduleId: 1, moduleTitle: 'Opening well', title: 'Reading together', body: 'Read **slowly**.', passages: [{ bookId: 43, bookName: 'John', chapter: 3, verseStart: 16, verseEnd: 18 }], hasVideo: false, done: false, draft: false, ...over };
}

const refusal = (status: number, code: string, details: Record<string, unknown> = {}, message = '') => new CoachApiError('learning', status, message, { refusal: code, ...details });

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

const learner = {
  '/coach/learning': <LearningPathScreen />,
  '/coach/learning/lessons/:id': <LearningLessonScreen />,
  '/coach/learning/modules/:id/check': <LearningCheckScreen />,
  '/coach/learning/completion': <LearningCompletionScreen />,
};

beforeEach(() => {
  vi.clearAllMocks();
  signedIn.current = true;
  vi.mocked(coachService.fetchCoachMe).mockRejectedValue(new CoachAuthError('not_a_coach'));
  L.state.mockResolvedValue(program());
});

describe('the coach gate', () => {
  function gate(authError: 'not_a_coach' | 'confirm_email') {
    return at('/coach', {
      '/coach': (
        <CoachDashboardShell active="home">
          <CoachGate loading={false} authError={authError} error={false}>{null}</CoachGate>
        </CoachDashboardShell>
      ),
    });
  }

  it('offers to start the program to an account with no coaching record while a module is published', async () => {
    L.state.mockResolvedValue(program({ enrolledAt: null, next: null }));
    gate('not_a_coach');
    expect(await screen.findByRole('link', { name: 'Start the learning program' })).toHaveAttribute('href', '/coach/learning');
    expect(screen.getByText('This account is not in the coaching program yet.')).toBeTruthy();
  });

  it.each([
    [true, 1],
    [false, 0],
  ])("gives the leaders' navigation a program entry only while a module is published (%s)", async (open, entries) => {
    L.state.mockResolvedValue(program({ open, isLeader: true }));
    at('/coach', { '/coach': <CoachDashboardShell active="home"><p>dashboard</p></CoachDashboardShell> });
    await waitFor(() => expect(L.state).toHaveBeenCalled());
    await screen.findByText('dashboard');
    await waitFor(() => expect(screen.queryAllByTestId('coach-nav-learning')).toHaveLength(entries));
    expect(screen.getByTestId('coach-nav-home')).toBeTruthy();
  });

  it('offers to open it, with progress, once the account started', async () => {
    gate('not_a_coach');
    expect(await screen.findByRole('link', { name: 'Open the program' })).toBeTruthy();
    expect(screen.getByText('2 of 4 lessons done · 0 of 2 modules passed')).toBeTruthy();
  });

  it('keeps the confirm-address gate and offers the program beside it', async () => {
    gate('confirm_email');
    expect(await screen.findByTestId('learning-offer')).toBeTruthy();
    expect(screen.getByTestId('coach-confirm-email')).toBeTruthy();
    expect(screen.getByText('The learning program needs no confirmation to start.')).toBeTruthy();
  });

  it('is the gate from before, with no trace of the program, while nothing is published', async () => {
    L.state.mockResolvedValue(program({ open: false, total: 0, modules: [], next: null }));
    gate('not_a_coach');
    expect(await screen.findByTestId('coach-not-a-coach')).toBeTruthy();
    expect(screen.queryByTestId('learning-offer')).toBeNull();
    expect(screen.queryByText(/learning/i)).toBeNull();
  });
});

describe('the program path', () => {
  it('points a learner who did two lessons at the third, with none of the modules passed', async () => {
    at('/coach/learning', learner);
    const path = await screen.findByTestId('learning-path');
    expect(within(path).getByText('Module 1, lesson 3')).toBeTruthy();
    expect(within(path).getByRole('link', { name: 'Continue' })).toHaveAttribute('href', '/coach/learning/lessons/13');
    expect(within(path).getByText('2 of 4 lessons done · 0 of 2 modules passed')).toBeTruthy();
  });

  it('tells an account the program is not open, and offers nothing to start', async () => {
    L.state.mockResolvedValue(program({ open: false, enrolledAt: null, modules: [], total: 0, next: null }));
    at('/coach/learning', learner);
    expect(await screen.findByTestId('learning-not-open')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Start the program' })).toBeNull();
  });

  it('tells a newcomer that admins see their name, address and progress, and lands them on the first lesson', async () => {
    L.state.mockResolvedValueOnce(program({ enrolledAt: null, next: null }));
    L.enrol.mockResolvedValue({ ok: true });
    L.state.mockResolvedValue(program({ next: { kind: 'lesson', lessonId: 11, moduleId: 1 } }));
    at('/coach/learning', learner);
    expect(await screen.findByText(/Program admins see your name, your email address and your progress/)).toBeTruthy();
    L.lesson.mockResolvedValue(lesson({ id: 11, title: 'Welcome' }));
    fireEvent.click(screen.getByRole('button', { name: 'Start the program' }));
    await waitFor(() => expect(L.lesson).toHaveBeenCalledWith(11));
    expect(L.enrol).toHaveBeenCalledTimes(1);
  });

  it('asks a signed-out visitor to sign in and loads nothing', async () => {
    signedIn.current = false;
    at('/coach/learning/lessons/13', learner);
    expect(await screen.findByRole('link', { name: 'Sign in' })).toBeTruthy();
    expect(L.lesson).not.toHaveBeenCalled();
  });
});

describe('a lesson', () => {
  it('shows a locked lesson as locked with the step that comes first, and none of its text', async () => {
    L.lesson.mockRejectedValue(refusal(403, 'locked', { next: { kind: 'lesson', lessonId: 13, moduleId: 1 } }));
    at('/coach/learning/lessons/21', learner);
    expect(await screen.findByTestId('learning-locked')).toBeTruthy();
    expect(screen.getByText(/Finish Module 1, lesson 3/)).toBeTruthy();
    expect(screen.queryByTestId('learning-lesson-text')).toBeNull();
  });

  it('links each passage to its chapter in the reader and shows no player without a video', async () => {
    L.lesson.mockResolvedValue(lesson());
    at('/coach/learning/lessons/13', learner);
    const passage = await screen.findByTestId('learning-passage');
    expect(passage).toHaveAttribute('href', '/bible/john/3');
    expect(passage.textContent).toContain('John 3:16–18');
    expect(screen.queryByTestId('learning-lesson-video')).toBeNull();
    expect(L.video).not.toHaveBeenCalled();
  });

  it('plays the video from the address the playback call returns', async () => {
    L.lesson.mockResolvedValue(lesson({ hasVideo: true }));
    L.video.mockResolvedValue({ url: 'https://store.test/v?sig=1', type: 'video/webm' });
    at('/coach/learning/lessons/13', learner);
    const video = await screen.findByTestId('learning-lesson-video');
    const source = video.querySelector('source');
    expect(source).toHaveAttribute('src', 'https://store.test/v?sig=1');
    expect(source).toHaveAttribute('type', 'video/webm');
  });

  it('marks a lesson done and offers the step that opened', async () => {
    L.lesson.mockResolvedValueOnce(lesson()).mockResolvedValue(lesson({ done: true }));
    L.markDone.mockResolvedValue({ ok: true });
    at('/coach/learning/lessons/13', learner);
    fireEvent.click(await screen.findByRole('button', { name: 'Mark as done' }));
    L.state.mockResolvedValue(program({ next: { kind: 'check', moduleId: 1 } }));
    expect(await screen.findByText('Lesson done')).toBeTruthy();
    expect(L.markDone).toHaveBeenCalledWith(13);
    expect((await screen.findAllByRole('link', { name: 'Take the check' }))[0]).toHaveAttribute('href', '/coach/learning/modules/1/check');
  });
});

describe('lesson text', () => {
  it('renders formatting and leaves every unsafe input inert', () => {
    const source = [
      '## Heading',
      '<script>window.hacked = 1</script>',
      '<iframe src="https://evil.test/frame"></iframe>',
      '<img src="https://evil.test/a.png" onerror="window.hacked = 2">',
      '![tracker](https://evil.test/pixel.png)',
      '[run](javascript:alert(1)) and [blob](data:text/html;base64,PHNjcmlwdD4=) and [proto](//evil.test/x)',
      '[web](https://versemate.org/give) and [mail](mailto:team@example.test) and [reader](/bible/john/3)',
      '> a quote with *emphasis*',
      '- one\n- two',
    ].join('\n\n');
    const { container } = render(<Markdown source={source} />);
    expect(container.querySelector('script, iframe, img, object, embed')).toBeNull();
    expect(container.querySelector('[onerror]')).toBeNull();
    expect(container.querySelectorAll('[src]')).toHaveLength(0);
    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['https://versemate.org/give', 'mailto:team@example.test', '/bible/john/3']);
    expect(container.textContent).toContain('<script>window.hacked = 1</script>');
    expect(container.querySelector('h2')?.textContent).toBe('Heading');
    expect(container.querySelector('blockquote em')?.textContent).toBe('emphasis');
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });
});

describe('a module check', () => {
  const check: Check = {
    moduleId: 1,
    title: 'Opening well',
    passMark: 80,
    version: 4,
    passed: false,
    bestScore: null,
    questions: [
      { id: 101, prompt: 'First?', options: ['a', 'b'] },
      { id: 102, prompt: 'Second?', options: ['c', 'd', 'e'] },
    ],
  };

  beforeEach(() => {
    L.state.mockResolvedValue(program({ next: { kind: 'check', moduleId: 1 } }));
    L.check.mockResolvedValue(check);
  });

  it('refuses a submission with an unanswered question and sends nothing', async () => {
    at('/coach/learning/modules/1/check', learner);
    fireEvent.click((await screen.findAllByRole('radio'))[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answers' }));
    expect(await screen.findByText('Answer every question before you submit')).toBeTruthy();
    expect(screen.getByText(/Question 2 has no answer yet/)).toBeTruthy();
    expect(L.submit).not.toHaveBeenCalled();
  });

  it('shows the score and the wrongly answered questions after a failed attempt, then offers a retake', async () => {
    L.submit.mockResolvedValue({ score: 50, correct: 1, total: 2, passed: false, passMark: 80, wrong: [2], bestScore: 50, modulePassed: false });
    at('/coach/learning/modules/1/check', learner);
    const radios = await screen.findAllByRole('radio');
    fireEvent.click(radios[0]);
    fireEvent.click(radios[3]);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answers' }));
    const result = await screen.findByTestId('learning-check-result');
    expect(within(result).getByText('Not passed yet. You need 80% to pass.')).toBeTruthy();
    expect(within(result).getByText('Your score: 50%')).toBeTruthy();
    expect(within(result).getByRole('link', { name: 'Question 2' })).toBeTruthy();
    expect(L.submit).toHaveBeenCalledWith(1, 4, [{ questionId: 101, option: 0 }, { questionId: 102, option: 1 }]);
    fireEvent.click(within(result).getByRole('button', { name: 'Retake the check' }));
    await waitFor(() => expect(screen.queryByTestId('learning-check-result')).toBeNull());
  });

  it('shows the check as it now stands when it changed mid-attempt, keeping the unchanged answers', async () => {
    L.check.mockResolvedValueOnce(check).mockResolvedValue({ ...check, version: 5, questions: [check.questions[0], { id: 103, prompt: 'New?', options: ['x', 'y'] }] });
    L.submit.mockRejectedValue(refusal(409, 'check-changed'));
    at('/coach/learning/modules/1/check', learner);
    const radios = await screen.findAllByRole('radio');
    fireEvent.click(radios[1]);
    fireEvent.click(radios[2]);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answers' }));
    expect(await screen.findByText('This check changed while you were answering')).toBeTruthy();
    expect(await screen.findByText('New?')).toBeTruthy();
    expect(screen.getByText('1 of 2 answered')).toBeTruthy();
    expect(screen.queryByTestId('learning-check-result')).toBeNull();
  });
});

describe('the completion record', () => {
  const done = (over: Partial<ProgramState> = {}) =>
    program({
      completedAt: '2026-10-10T12:00:00.000Z',
      passed: 2,
      next: null,
      modules: program().modules.map((m, i) => ({ ...m, state: i === 0 ? 'passed' : 'open', bestScore: i === 0 ? 87.5 : null })),
      ...over,
    });

  it('lists each published module with its best score or as not yet taken, and sends a request with a note', async () => {
    L.state.mockResolvedValue(done());
    L.sendRequest.mockResolvedValue({ id: 1, status: 'open', reason: null, note: 'Tuesday group', sentAt: '2026-10-11T00:00:00Z', answeredAt: null });
    at('/coach/learning/completion', learner);
    expect(await screen.findByText('87.5%')).toBeTruthy();
    expect(screen.getByText('Not yet taken')).toBeTruthy();
    expect(screen.getByText(/Completed on October 10, 2026/)).toBeTruthy();
    fireEvent.change(screen.getByTestId('learning-request-note'), { target: { value: 'Tuesday group' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));
    await waitFor(() => expect(L.sendRequest).toHaveBeenCalledWith('Tuesday group'));
  });

  it('offers the confirmation email instead of a request while the address is not confirmed', async () => {
    L.state.mockResolvedValue(done({ addressConfirmed: false }));
    at('/coach/learning/completion', learner);
    expect(await screen.findByText('Confirm your email address first')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Send request' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Send the confirmation email' })).toBeTruthy();
  });

  it.each([
    ['open', 'Request open · sent October 11, 2026', null],
    ['approved', 'Approved · October 12, 2026', null],
    ['already-in-program', 'Already in the program', null],
    ['declined', 'Declined · October 12, 2026', 'Groups must meet weekly'],
  ] as const)('shows a %s request, and a new request only after a decline', async (status, tag, reason) => {
    L.state.mockResolvedValue(done({ request: { id: 1, status, reason, note: '', sentAt: '2026-10-11T00:00:00Z', answeredAt: '2026-10-12T00:00:00Z' } }));
    at('/coach/learning/completion', learner);
    expect(await screen.findByText(tag)).toBeTruthy();
    if (reason) expect(screen.getByText(reason)).toBeTruthy();
    expect(!!screen.queryByRole('button', { name: 'Send request' })).toBe(status === 'declined');
  });

  it('offers no request to an account already bound to a leader', async () => {
    L.state.mockResolvedValue(done({ isLeader: true }));
    at('/coach/learning/completion', learner);
    expect(await screen.findByText('You are already a coaching leader')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Send request' })).toBeNull();
  });
});
