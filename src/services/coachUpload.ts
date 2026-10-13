import type { UploadParts } from './coachService';

export const UPLOAD_LIMITS = {
  maxBytes: 8 * 1024 ** 3,
  maxDaysBack: 60,
  titleChars: 80,
  formats: { mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', mkv: 'video/x-matroska' } as Record<string, string>,
};

export const LIMITS_TEXT =
  'A video in MP4, MOV, WebM or MKV, up to 8 GB, of a session held today or in the last 60 days. Audio-only files cannot be used: a report needs video.';

export function chicagoToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

function extensionOf(name: string): string {
  return name.toLowerCase().split('.').pop() ?? '';
}

export function uploadContentType(file: File): string {
  return file.type || UPLOAD_LIMITS.formats[extensionOf(file.name)] || 'application/octet-stream';
}

export function uploadProblem(
  input: { file: File | null; sessionDate: string; title: string },
  today = chicagoToday(),
): string | null {
  if (input.title.trim().length > UPLOAD_LIMITS.titleChars) return `The title can be at most ${UPLOAD_LIMITS.titleChars} characters.`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.sessionDate)) return 'Choose the date the session was held.';
  const age = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${input.sessionDate}T00:00:00Z`)) / 86_400_000);
  if (age < 0) return 'The session date is in the future: it must be today or earlier.';
  if (age > UPLOAD_LIMITS.maxDaysBack) return `The session date is more than ${UPLOAD_LIMITS.maxDaysBack} days ago, the furthest back an upload can be.`;
  if (!input.file) return 'Choose the video file of the session.';
  if (input.file.type.startsWith('audio/')) return 'This is an audio-only file. A report needs the video of the session.';
  const type = UPLOAD_LIMITS.formats[extensionOf(input.file.name)];
  if (!type || (input.file.type && input.file.type !== type && !(type === 'video/x-matroska' && input.file.type === 'video/matroska')))
    return 'The file must be a video in MP4, MOV, WebM or MKV format.';
  if (input.file.size > UPLOAD_LIMITS.maxBytes) return 'The file is over 8 GB, the most an upload can be.';
  if (input.file.size === 0) return 'The file is empty.';
  return null;
}

export type PutPart = (url: string, body: Blob, onBytes: (bytes: number) => void) => Promise<void>;

export const xhrPut: PutPart = (url, body, onBytes) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.upload.onprogress = (e) => onBytes(e.loaded);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`the storage refused the file (${xhr.status})`)));
    xhr.onerror = () => reject(new Error('the connection to the storage failed'));
    xhr.send(body);
  });

const ADDRESS_MARGIN_MS = 5 * 60_000;
const RETRY_WAITS_MS = [1_000, 3_000];

export class PartFailed extends Error {
  constructor(
    readonly partsDone: number,
    readonly partCount: number,
    cause: unknown,
  ) {
    super(cause instanceof Error ? cause.message : String(cause));
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function sendParts(
  file: Blob,
  upload: UploadParts,
  onProgress: (sent: number) => void,
  put: PutPart = xhrPut,
  refresh?: () => Promise<UploadParts>,
  partsDone = 0,
  wait: (ms: number) => Promise<void> = sleep,
): Promise<void> {
  let addresses = upload;
  const order = upload.parts.map((p) => p.partNumber).sort((a, b) => a - b);
  let done = Math.min(file.size, partsDone * upload.partBytes);
  onProgress(done);
  for (const [index, partNumber] of order.entries()) {
    if (index < partsDone) continue;
    const start = (partNumber - 1) * upload.partBytes;
    const slice = file.slice(start, start + upload.partBytes);
    for (let attempt = 0; ; attempt++) {
      try {
        if (refresh && (attempt > 0 || Date.parse(addresses.expiresAt) - Date.now() < ADDRESS_MARGIN_MS)) addresses = await refresh();
        const part = addresses.parts.find((p) => p.partNumber === partNumber);
        if (!part) throw new Error(`the server gave no address for part ${partNumber}`);
        await put(part.url, slice, (bytes) => onProgress(done + bytes));
        break;
      } catch (err) {
        if (attempt >= RETRY_WAITS_MS.length) throw new PartFailed(index, order.length, err);
        onProgress(done);
        await wait(RETRY_WAITS_MS[attempt]);
      }
    }
    done += slice.size;
    onProgress(done);
  }
}
