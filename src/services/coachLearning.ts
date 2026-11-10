import type {
  GetCoachAdminLearningLearnersResponse,
  GetCoachAdminLearningRequestsResponse,
  GetCoachAdminLearningResponse,
  GetCoachLearningLessonsByIdResponse,
  GetCoachLearningModulesByIdCheckResponse,
  GetCoachLearningResponse,
  PostCoachLearningJoinRequestResponse,
  PostCoachLearningModulesByIdCheckResponse,
} from '@/api/generated/types.gen';
import {
  deleteCoachAdminLearningLessonsById,
  deleteCoachAdminLearningLessonsByIdVideo,
  deleteCoachAdminLearningModulesById,
  deleteCoachAdminLearningQuestionsById,
  getCoachAdminLearning,
  getCoachAdminLearningLearners,
  getCoachAdminLearningLessonsById,
  getCoachAdminLearningRequests,
  getCoachLearning,
  getCoachLearningLessonsById,
  getCoachLearningLessonsByIdVideo,
  getCoachLearningModulesByIdCheck,
  postCoachAdminLearningLessonsByIdPublish,
  postCoachAdminLearningLessonsByIdUnpublish,
  postCoachAdminLearningLessonsByIdVideoAttach,
  postCoachAdminLearningLessonsByIdVideoUpload,
  postCoachAdminLearningModules,
  postCoachAdminLearningModulesByIdLessons,
  postCoachAdminLearningModulesByIdPublish,
  postCoachAdminLearningModulesByIdQuestions,
  postCoachAdminLearningModulesByIdUnpublish,
  postCoachAdminLearningRequestsByIdApprove,
  postCoachAdminLearningRequestsByIdDecline,
  postCoachLearningEnrol,
  postCoachLearningJoinRequest,
  postCoachLearningLessonsByIdDone,
  postCoachLearningModulesByIdCheck,
  putCoachAdminLearningLessonsById,
  putCoachAdminLearningModulesById,
  putCoachAdminLearningModulesByIdLessonsOrder,
  putCoachAdminLearningModulesOrder,
  putCoachAdminLearningQuestionsById,
} from '@/api/generated/sdk.gen';
import { CoachApiError, coachCall, newCoachClient } from './coachService';

export type Continue = { kind: 'lesson'; lessonId: number; moduleId: number } | { kind: 'check'; moduleId: number } | null;

export type RequestStatus = JoinRequest['status'];

export type JoinRequest = NonNullable<PostCoachLearningJoinRequestResponse['request']>;

export type PathLesson = PathModule['lessons'][number];

export type PathModule = ProgramState['modules'][number];

export type ProgramState = GetCoachLearningResponse;

export type Passage = Lesson['passages'][number];

export type Lesson = GetCoachLearningLessonsByIdResponse;

export type Check = GetCoachLearningModulesByIdCheckResponse;

export type Grade = PostCoachLearningModulesByIdCheckResponse;

export type AdminLesson = AdminModule['lessons'][number];

export type AdminQuestion = AdminModule['questions'][number];

export type AdminModule = GetCoachAdminLearningResponse['modules'][number];

export type OpenRequest = GetCoachAdminLearningRequestsResponse['requests'][number];

export type Learner = LearnersPage['learners'][number];

export type LearnersPage = GetCoachAdminLearningLearnersResponse;

export type PassageInput = { bookId: number; chapter: number; verseStart?: number | null; verseEnd?: number | null };

const learningClient = newCoachClient();

function call<T>(pending: Promise<{ data?: T; error?: unknown; request: Request; response: Response }>): Promise<T> {
  return coachCall(pending, 'refusal');
}

type ModuleInput = { title: string; description: string; passMark: number };
type LessonInput = { title: string; body: string; passages: PassageInput[] };
type QuestionInput = { prompt: string; options: string[]; correct: number };

export const learning = {
  state: (): Promise<ProgramState> => call(getCoachLearning({ client: learningClient })),
  enrol: (): Promise<ProgramState> => call(postCoachLearningEnrol({ client: learningClient })),
  lesson: (id: number): Promise<Lesson> => call(getCoachLearningLessonsById({ client: learningClient, path: { id } })),
  markDone: (id: number): Promise<ProgramState> => call(postCoachLearningLessonsByIdDone({ client: learningClient, path: { id } })),
  video: (id: number): Promise<{ url: string; type: string }> =>
    call(getCoachLearningLessonsByIdVideo({ client: learningClient, path: { id } })),
  check: (moduleId: number): Promise<Check> => call(getCoachLearningModulesByIdCheck({ client: learningClient, path: { id: moduleId } })),
  submit: (moduleId: number, version: number, answers: { questionId: number; option: number }[]): Promise<Grade> =>
    call(postCoachLearningModulesByIdCheck({ client: learningClient, path: { id: moduleId }, body: { version, answers } })),
  sendRequest: (note: string): Promise<{ request: JoinRequest | null }> =>
    call(postCoachLearningJoinRequest({ client: learningClient, body: { note } })),
};

export const learningAdmin = {
  tree: (): Promise<{ modules: AdminModule[] }> => call(getCoachAdminLearning({ client: learningClient })),
  createModule: (input: ModuleInput): Promise<{ id: number }> => call(postCoachAdminLearningModules({ client: learningClient, body: input })),
  updateModule: (id: number, input: ModuleInput) => call(putCoachAdminLearningModulesById({ client: learningClient, path: { id }, body: input })),
  orderModules: (ids: number[]) => call(putCoachAdminLearningModulesOrder({ client: learningClient, body: { ids } })),
  publishModule: (id: number, published: boolean) =>
    call(
      published
        ? postCoachAdminLearningModulesByIdPublish({ client: learningClient, path: { id } })
        : postCoachAdminLearningModulesByIdUnpublish({ client: learningClient, path: { id } }),
    ),
  deleteModule: (id: number) => call(deleteCoachAdminLearningModulesById({ client: learningClient, path: { id } })),
  createLesson: (moduleId: number, input: LessonInput): Promise<{ id: number }> =>
    call(postCoachAdminLearningModulesByIdLessons({ client: learningClient, path: { id: moduleId }, body: input })),
  orderLessons: (moduleId: number, ids: number[]) =>
    call(putCoachAdminLearningModulesByIdLessonsOrder({ client: learningClient, path: { id: moduleId }, body: { ids } })),
  lesson: (id: number): Promise<Lesson> => call(getCoachAdminLearningLessonsById({ client: learningClient, path: { id } })),
  updateLesson: (id: number, input: LessonInput) => call(putCoachAdminLearningLessonsById({ client: learningClient, path: { id }, body: input })),
  publishLesson: (id: number, published: boolean) =>
    call(
      published
        ? postCoachAdminLearningLessonsByIdPublish({ client: learningClient, path: { id } })
        : postCoachAdminLearningLessonsByIdUnpublish({ client: learningClient, path: { id } }),
    ),
  deleteLesson: (id: number) => call(deleteCoachAdminLearningLessonsById({ client: learningClient, path: { id } })),
  createQuestion: (moduleId: number, input: QuestionInput): Promise<{ id: number }> =>
    call(postCoachAdminLearningModulesByIdQuestions({ client: learningClient, path: { id: moduleId }, body: input })),
  updateQuestion: (id: number, input: QuestionInput) => call(putCoachAdminLearningQuestionsById({ client: learningClient, path: { id }, body: input })),
  deleteQuestion: (id: number) => call(deleteCoachAdminLearningQuestionsById({ client: learningClient, path: { id } })),
  videoUploadUrl: (id: number, size: number, type: string): Promise<{ uploadUrl: string }> =>
    call(postCoachAdminLearningLessonsByIdVideoUpload({ client: learningClient, path: { id }, body: { size, type } })),
  attachVideo: (id: number): Promise<{ type: string }> => call(postCoachAdminLearningLessonsByIdVideoAttach({ client: learningClient, path: { id } })),
  removeVideo: (id: number) => call(deleteCoachAdminLearningLessonsByIdVideo({ client: learningClient, path: { id } })),
  requests: (): Promise<{ requests: OpenRequest[] }> => call(getCoachAdminLearningRequests({ client: learningClient })),
  approve: (
    id: number,
    input: { email: string; name?: string; group?: string },
  ): Promise<{ status: 'approved' | 'already-in-program'; leaderId: string | null }> =>
    call(postCoachAdminLearningRequestsByIdApprove({ client: learningClient, path: { id }, body: input })),
  decline: (id: number, reason: string): Promise<{ status: 'declined' }> =>
    call(postCoachAdminLearningRequestsByIdDecline({ client: learningClient, path: { id }, body: { reason } })),
  learners: (q: string, offset: number, limit: number): Promise<LearnersPage> =>
    call(getCoachAdminLearningLearners({ client: learningClient, query: { q, offset, limit } })),
};

export function uploadVideo(url: string, file: File, onProgress: (pct: number) => void, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('content-type', file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.floor((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`upload failed: ${xhr.status}`)));
    xhr.onerror = () => reject(new Error('upload failed'));
    xhr.onabort = () => reject(new DOMException('aborted', 'AbortError'));
    signal.addEventListener('abort', () => xhr.abort());
    xhr.send(file);
  });
}

export function refusalOf(err: unknown): { code?: string; message: string; details: Record<string, unknown> } {
  if (err instanceof CoachApiError) {
    return { code: typeof err.details.refusal === 'string' ? err.details.refusal : undefined, message: err.serverMessage, details: err.details };
  }
  return { message: 'The request failed. Try again in a moment.', details: {} };
}

