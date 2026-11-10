import type {
  GetBibleExplanationAudioByExplanationIdProgressResponse,
  GetBibleExplanationAudioByExplanationIdResponses,
  GetBibleExplanationAudioJobsByJobIdResponse,
  PostBibleExplanationAudioByExplanationIdProgressData,
} from '@/api/generated/types.gen';
import { getAccessToken, quietClient } from '@/api/client';
import {
  getBibleExplanationAudioByExplanationId,
  getBibleExplanationAudioByExplanationIdProgress,
  getBibleExplanationAudioJobsByJobId,
  postBibleExplanationAudioByExplanationIdProgress,
} from '@/api/generated/sdk.gen';

const POLL_INTERVAL_MS = 2000;

/**
 * Floor / ceiling for the per-job poll timeout. The backend returns
 * `estimated_ready_seconds` on 202, which is roughly proportional to
 * explanation length (OpenAI TTS currently runs ~20s per minute of
 * audio). We multiply that estimate by `POLL_TIMEOUT_FUDGE` to absorb
 * cold-worker overhead (TLS handshake, OpenAI rate-limit retries) and
 * clamp into [MIN, MAX].
 *
 * Why the high floor: the backend's estimate is currently optimistic
 * (returns ~8s for chapters whose end-to-end generation is closer to
 * 75–90s — observed in DO logs on 2026-04-28: Numbers 6 took 90s,
 * Numbers 7 took 75s, both reported as `~8s`). Fudge × 8s = 20s,
 * which clamps to the floor; so the floor is what actually drives
 * the timeout for typical uncached chapters today. 90s covers the
 * observed long tail with headroom.
 *
 * Why the high ceiling: long Detailed explanations (Genesis 20 ran to
 * 13:57 of audio) get split into N OpenAI TTS calls server-side
 * (verse-mate#195) and each chunk takes ~30–60s. A 14-min track
 * needed ~7 minutes end-to-end. 600s = 10 min covers that with room.
 *
 * If the backend estimate later becomes accurate, the dynamic path
 * (estimate × fudge) will start dominating again for long content
 * without code changes — which is the whole point of keeping it.
 */
const POLL_TIMEOUT_FUDGE = 2.5;
const POLL_TIMEOUT_MIN_MS = 90_000;
const POLL_TIMEOUT_MAX_MS = 600_000;

function pollTimeoutMs(estimatedReadySeconds: number | undefined): number {
  if (!estimatedReadySeconds || estimatedReadySeconds <= 0) {
    return POLL_TIMEOUT_MIN_MS;
  }
  const computed = Math.round(estimatedReadySeconds * 1000 * POLL_TIMEOUT_FUDGE);
  return Math.max(POLL_TIMEOUT_MIN_MS, Math.min(POLL_TIMEOUT_MAX_MS, computed));
}

export type ReaderAudio = GetBibleExplanationAudioByExplanationIdResponses[200]['audio'];

export type ResumeProgress = GetBibleExplanationAudioByExplanationIdProgressResponse;

export type SaveReason = PostBibleExplanationAudioByExplanationIdProgressData['body']['reason'];

type AudioResponse = Partial<
  GetBibleExplanationAudioByExplanationIdResponses[200] & GetBibleExplanationAudioByExplanationIdResponses[202]
>;

type AudioJob = GetBibleExplanationAudioJobsByJobIdResponse['job'];

export class GuestScopeExceededError extends Error {
  constructor() {
    super('Sign in to listen to this chapter');
    this.name = 'GuestScopeExceededError';
  }
}

async function parsed<T>(pending: Promise<T>, what: string): Promise<T> {
  return pending.catch((error: unknown) => {
    if (error instanceof SyntaxError) throw new Error(`${what} returned invalid JSON`);
    throw error;
  });
}

export async function requestAudio(args: {
  explanationId: number;
  voice?: string;
  language?: string;
  signal?: AbortSignal;
}): Promise<{ status: number; body: AudioResponse }> {
  const { data, response } = await parsed(
    getBibleExplanationAudioByExplanationId({
      client: quietClient,
      path: { explanationId: args.explanationId },
      query: {
        ...(args.voice ? { voice: args.voice } : {}),
        ...(args.language ? { language: args.language } : {}),
      },
      parseAs: 'json',
      signal: args.signal,
    }),
    'Audio request',
  );
  return { status: response.status, body: response.ok && data ? data : {} };
}

async function pollJob(args: { jobId: string; signal?: AbortSignal }): Promise<AudioJob> {
  const { data, response } = await parsed(
    getBibleExplanationAudioJobsByJobId({
      client: quietClient,
      path: { jobId: args.jobId },
      parseAs: 'json',
      signal: args.signal,
    }),
    'Job status',
  );
  if (response.status === 404) return { job_id: args.jobId, status: 'queued' };
  if (!response.ok || !data) throw new Error(`Job status failed: HTTP ${response.status}`);
  return data.job;
}

/**
 * Resolves to the ReaderAudio once available. Throws on failure or
 * after the per-job timeout (derived from `estimated_ready_seconds`).
 */
export async function fetchAudioWithPolling(args: {
  explanationId: number;
  voice?: string;
  language?: string;
  signal?: AbortSignal;
}): Promise<ReaderAudio> {
  const initial = await requestAudio(args);
  if (initial.status === 200 && initial.body.audio) return initial.body.audio;
  if (initial.status === 401) throw new GuestScopeExceededError();
  if (initial.status !== 202 || !initial.body.job) {
    throw new Error(`Unexpected audio response: ${initial.status}`);
  }
  const { job_id, estimated_ready_seconds } = initial.body.job;
  const timeoutMs = pollTimeoutMs(estimated_ready_seconds);
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (args.signal?.aborted) throw new Error('aborted');
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const job = await pollJob({ jobId: job_id, signal: args.signal });
    if (job.status === 'completed' && job.audio) return job.audio;
    if (job.status === 'failed') {
      throw new Error(`Generation failed: ${job.error_code ?? 'UNKNOWN'}`);
    }
  }
  throw new Error(`Audio generation timed out after ${Math.round(timeoutMs / 1000)}s`);
}

export async function fetchProgress(explanationId: number): Promise<ResumeProgress | null> {
  const { data, response } = await parsed(
    getBibleExplanationAudioByExplanationIdProgress({
      client: quietClient,
      path: { explanationId },
      parseAs: 'json',
    }),
    'Audio progress',
  );
  return response.ok && data ? data : null;
}

interface ProgressSave {
  explanationId: number;
  positionSeconds: number;
  durationSeconds: number;
  reason: SaveReason;
}

function postProgress(args: ProgressSave, keepalive: boolean) {
  return postBibleExplanationAudioByExplanationIdProgress({
    client: quietClient,
    path: { explanationId: args.explanationId },
    body: {
      position_seconds: args.positionSeconds,
      duration_seconds: args.durationSeconds,
      reason: args.reason,
    },
    keepalive,
  });
}

export async function saveProgress(args: ProgressSave): Promise<void> {
  await postProgress(args, false).catch(() => undefined);
}

export function saveProgressOnUnload(args: Omit<ProgressSave, 'reason'>): void {
  if (!getAccessToken()) return;
  postProgress({ ...args, reason: 'navigation' }, true).catch(() => undefined);
}
