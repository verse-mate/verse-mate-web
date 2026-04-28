/**
 * feat-explanation-audio (verse-mate-web port).
 *
 * Reader endpoint contract — br-audio-007 four-field shape:
 *   200 { audio: { url, duration_seconds, voice, language_code } }
 *   202 { job: { job_id, estimated_ready_seconds } }
 *
 * Per br-audio-017 the audio endpoints intentionally use raw fetch
 * (long-poll + AbortController) rather than the generated SDK — easier
 * timeout + cancellation control. We route through `fetchWithAuth` so
 * the access token is attached AND auto-refreshed on 401, matching the
 * rest of the app. Without that retry, an expired access token would
 * silently 401 → flip the chip to GuestScopeExceededError, and the user
 * would see "Sign in to listen" even though they ARE signed in.
 */
import { API_BASE_URL, fetchWithAuth } from '@/services/api';

const POLL_INTERVAL_MS = 2000;

/**
 * Floor / ceiling for the per-job poll timeout. The backend returns
 * `estimated_ready_seconds` on 202, which is roughly proportional to
 * explanation length (OpenAI TTS currently runs ~20s per minute of
 * audio). We multiply that estimate by `POLL_TIMEOUT_FUDGE` to absorb
 * cold-worker overhead (TLS handshake, OpenAI rate-limit retries) and
 * clamp into [MIN, MAX] so a missing/zero estimate still gets a sane
 * window and a runaway estimate doesn't make users wait forever.
 *
 * Why this matters: the previous fixed 30s timeout fired before
 * 4-minute chapters finished generating (~90s end-to-end), so users
 * saw "Audio unavailable" even though the worker eventually completed
 * the job. Reload would then play the cached MP3, which made the bug
 * feel intermittent instead of pointing at the timeout.
 */
const POLL_TIMEOUT_FUDGE = 2.5;
const POLL_TIMEOUT_MIN_MS = 30_000;
const POLL_TIMEOUT_MAX_MS = 180_000;

function pollTimeoutMs(estimatedReadySeconds: number | undefined): number {
  if (!estimatedReadySeconds || estimatedReadySeconds <= 0) {
    return POLL_TIMEOUT_MIN_MS;
  }
  const computed = Math.round(estimatedReadySeconds * 1000 * POLL_TIMEOUT_FUDGE);
  return Math.max(POLL_TIMEOUT_MIN_MS, Math.min(POLL_TIMEOUT_MAX_MS, computed));
}

export interface ReaderAudio {
  url: string;
  duration_seconds: number;
  voice: string;
  language_code: string;
}

export interface ResumeProgress {
  position_seconds: number;
  duration_seconds: number;
  updated_at: string;
}

export type SaveReason = 'pause' | 'complete' | 'background' | 'navigation';

interface AudioResponse {
  audio?: ReaderAudio;
  job?: { job_id: string; estimated_ready_seconds: number };
}

interface JobStatusResponse {
  job: {
    job_id: string;
    status: 'queued' | 'active' | 'completed' | 'failed';
    audio?: ReaderAudio;
    error_code?: string;
  };
}

/**
 * Thrown when a guest (br-audio-013) requests audio for a chapter
 * outside their allowed scope. Lets the UI render a sign-in CTA
 * instead of a generic error message.
 *
 * Surfaced only when fetchWithAuth could NOT refresh into a valid
 * session (no refresh token, refresh returned non-OK, or refresh
 * succeeded but the retry still came back 401). All three mean the
 * user is effectively a guest from the backend's perspective.
 */
export class GuestScopeExceededError extends Error {
  constructor() {
    super('Sign in to listen to this chapter');
    this.name = 'GuestScopeExceededError';
  }
}

function audioUrl(
  explanationId: number,
  voice?: string,
  language?: string,
): string {
  const params = new URLSearchParams();
  if (voice) params.set('voice', voice);
  if (language) params.set('language', language);
  const qs = params.toString();
  return `${API_BASE_URL}/bible/explanation/audio/${explanationId}${qs ? `?${qs}` : ''}`;
}

function progressUrl(explanationId: number): string {
  return `${API_BASE_URL}/bible/explanation/audio/${explanationId}/progress`;
}

export async function requestAudio(args: {
  explanationId: number;
  voice?: string;
  language?: string;
  signal?: AbortSignal;
}): Promise<{ status: number; body: AudioResponse }> {
  const res = await fetchWithAuth(
    audioUrl(args.explanationId, args.voice, args.language),
    { signal: args.signal },
  );
  const body =
    res.status === 204 ? {} : ((await res.json()) as AudioResponse);
  return { status: res.status, body };
}

async function pollJob(args: {
  jobId: string;
  signal?: AbortSignal;
}): Promise<JobStatusResponse['job']> {
  const res = await fetchWithAuth(
    `${API_BASE_URL}/bible/explanation/audio/jobs/${encodeURIComponent(args.jobId)}`,
    { signal: args.signal },
  );
  if (!res.ok) throw new Error(`Job status failed: HTTP ${res.status}`);
  const body = (await res.json()) as JobStatusResponse;
  return body.job;
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
  // br-audio-013: guests can only request Genesis 1. fetchWithAuth
  // already attempted a refresh, so a 401 here means the user is
  // genuinely outside the allowed scope.
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

export async function fetchProgress(
  explanationId: number,
): Promise<ResumeProgress | null> {
  const res = await fetchWithAuth(progressUrl(explanationId));
  if (res.status === 404 || !res.ok) return null;
  return (await res.json()) as ResumeProgress;
}

export async function saveProgress(args: {
  explanationId: number;
  positionSeconds: number;
  durationSeconds: number;
  reason: SaveReason;
}): Promise<void> {
  await fetchWithAuth(progressUrl(args.explanationId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      position_seconds: args.positionSeconds,
      duration_seconds: args.durationSeconds,
      reason: args.reason,
    }),
  }).catch(() => {
    // Best-effort save — never block playback on a failed save.
  });
}
