import { API_BASE_URL, fetchWithAuth } from './api';
import { CoachApiError, CoachAuthError } from './coachService';

export type Continue = { kind: 'lesson'; lessonId: number; moduleId: number } | { kind: 'check'; moduleId: number } | null;

export type RequestStatus = 'open' | 'approved' | 'declined' | 'already-in-program';

export interface JoinRequest {
  id: number;
  status: RequestStatus;
  reason: string | null;
  note: string;
  sentAt: string;
  answeredAt: string | null;
}

export interface PathLesson {
  id: number;
  title: string;
  state: 'locked' | 'open' | 'done';
}

export interface PathModule {
  id: number;
  title: string;
  description: string;
  passMark: number;
  state: 'locked' | 'open' | 'passed';
  bestScore: number | null;
  questionCount: number;
  lessons: PathLesson[];
}

export interface ProgramState {
  open: boolean;
  enrolledAt: string | null;
  completedAt: string | null;
  passed: number;
  total: number;
  next: Continue;
  modules: PathModule[];
  isLeader: boolean;
  addressConfirmed: boolean;
  request: JoinRequest | null;
}

export interface Passage {
  bookId: number;
  bookName: string;
  chapter: number;
  verseStart: number | null;
  verseEnd: number | null;
}

export interface Lesson {
  id: number;
  moduleId: number;
  moduleTitle: string;
  title: string;
  body: string;
  passages: Passage[];
  hasVideo: boolean;
  done: boolean;
  draft: boolean;
}

export interface Check {
  moduleId: number;
  title: string;
  passMark: number;
  version: number;
  passed: boolean;
  bestScore: number | null;
  questions: { id: number; prompt: string; options: string[] }[];
}

export interface Grade {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  passMark: number;
  wrong: number[];
  bestScore: number | null;
  modulePassed: boolean;
}

export interface AdminLesson {
  id: number;
  title: string;
  body: string;
  passages: Passage[];
  published: boolean;
  hasVideo: boolean;
  videoType: string | null;
  used: boolean;
}

export interface AdminQuestion {
  id: number;
  prompt: string;
  options: string[];
  correct: number;
}

export interface AdminModule {
  id: number;
  title: string;
  description: string;
  passMark: number;
  published: boolean;
  checkVersion: number;
  used: boolean;
  lessons: AdminLesson[];
  questions: AdminQuestion[];
}

export interface OpenRequest {
  id: number;
  name: string;
  email: string;
  note: string;
  sentAt: string;
  completedAt: string | null;
  scores: { moduleId: number; title: string; bestScore: number | null }[];
}

export interface Learner {
  name: string;
  email: string;
  enrolledAt: string;
  completedAt: string | null;
  passed: number;
  total: number;
  request: RequestStatus | null;
}

export interface LearnersPage {
  total: number;
  limit: number;
  offset: number;
  learners: Learner[];
}

export type PassageInput = { bookId: number; chapter: number; verseStart?: number | null; verseEnd?: number | null };

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetchWithAuth(`${API_BASE_URL}/coach/${path}`, {
    method,
    headers: body === undefined ? { accept: 'application/json' } : { accept: 'application/json', 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) throw new CoachAuthError('signed_out');
  const data = (await res.json().catch(() => null)) as { message?: string; details?: Record<string, unknown> } | null;
  if (!res.ok) throw new CoachApiError(path, res.status, data?.message ?? '', data?.details ?? {});
  return data as T;
}

const post = <T = { ok: boolean }>(path: string, body: unknown = {}) => request<T>(path, 'POST', body);
const put = <T = { ok: boolean }>(path: string, body: unknown) => request<T>(path, 'PUT', body);
const del = (path: string) => request<{ ok: boolean }>(path, 'DELETE');

export const learning = {
  state: () => request<ProgramState>('learning'),
  enrol: () => post('learning/enrol'),
  lesson: (id: number) => request<Lesson>(`learning/lessons/${id}`),
  markDone: (id: number) => post(`learning/lessons/${id}/done`),
  video: (id: number) => request<{ url: string; type: string }>(`learning/lessons/${id}/video`),
  check: (moduleId: number) => request<Check>(`learning/modules/${moduleId}/check`),
  submit: (moduleId: number, version: number, answers: { questionId: number; option: number }[]) =>
    post<Grade>(`learning/modules/${moduleId}/check`, { version, answers }),
  sendRequest: (note: string) => post<JoinRequest>('learning/join-request', { note }),
};

export const learningAdmin = {
  tree: () => request<{ modules: AdminModule[] }>('admin/learning'),
  createModule: (input: { title: string; description: string; passMark: number }) => post<{ id: number }>('admin/learning/modules', input),
  updateModule: (id: number, input: { title: string; description: string; passMark: number }) => put(`admin/learning/modules/${id}`, input),
  orderModules: (ids: number[]) => put('admin/learning/modules/order', { ids }),
  publishModule: (id: number, published: boolean) => post(`admin/learning/modules/${id}/${published ? 'publish' : 'unpublish'}`),
  deleteModule: (id: number) => del(`admin/learning/modules/${id}`),
  createLesson: (moduleId: number, input: { title: string; body: string; passages: PassageInput[] }) =>
    post<{ id: number }>(`admin/learning/modules/${moduleId}/lessons`, input),
  orderLessons: (moduleId: number, ids: number[]) => put(`admin/learning/modules/${moduleId}/lessons/order`, { ids }),
  lesson: (id: number) => request<Lesson>(`admin/learning/lessons/${id}`),
  updateLesson: (id: number, input: { title: string; body: string; passages: PassageInput[] }) => put(`admin/learning/lessons/${id}`, input),
  publishLesson: (id: number, published: boolean) => post(`admin/learning/lessons/${id}/${published ? 'publish' : 'unpublish'}`),
  deleteLesson: (id: number) => del(`admin/learning/lessons/${id}`),
  createQuestion: (moduleId: number, input: { prompt: string; options: string[]; correct: number }) =>
    post<{ id: number }>(`admin/learning/modules/${moduleId}/questions`, input),
  updateQuestion: (id: number, input: { prompt: string; options: string[]; correct: number }) => put(`admin/learning/questions/${id}`, input),
  deleteQuestion: (id: number) => del(`admin/learning/questions/${id}`),
  videoUploadUrl: (id: number, size: number, type: string) => post<{ uploadUrl: string }>(`admin/learning/lessons/${id}/video/upload`, { size, type }),
  attachVideo: (id: number) => post<{ type: string }>(`admin/learning/lessons/${id}/video/attach`),
  removeVideo: (id: number) => del(`admin/learning/lessons/${id}/video`),
  requests: () => request<{ requests: OpenRequest[] }>('admin/learning/requests'),
  approve: (id: number, input: { name?: string; group?: string }) =>
    post<{ status: 'approved' | 'already-in-program'; leaderId: string | null }>(`admin/learning/requests/${id}/approve`, input),
  decline: (id: number, reason: string) => post<{ status: 'declined' }>(`admin/learning/requests/${id}/decline`, { reason }),
  learners: (q: string, offset: number, limit: number) =>
    request<LearnersPage>(`admin/learning/learners?${new URLSearchParams({ q, offset: String(offset), limit: String(limit) })}`),
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

