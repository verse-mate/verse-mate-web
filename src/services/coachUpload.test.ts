import { describe, expect, it } from 'vitest';
import { PartFailed, UPLOAD_LIMITS, chicagoToday, sendParts, uploadProblem } from './coachUpload';

function file(name: string, type: string, size = 1000): File {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

const TODAY = '2026-10-09';

describe('upload limits are checked before anything is sent', () => {
  it('accepts a video of an accepted format dated within the window', () => {
    expect(uploadProblem({ file: file('class.mp4', 'video/mp4'), sessionDate: '2026-10-01', title: 'Week 4' }, TODAY)).toBeNull();
    expect(uploadProblem({ file: file('class.mkv', ''), sessionDate: TODAY, title: '' }, TODAY)).toBeNull();
  });

  it('refuses a file over 8 GB', () => {
    expect(uploadProblem({ file: file('class.mp4', 'video/mp4', UPLOAD_LIMITS.maxBytes + 1), sessionDate: TODAY, title: '' }, TODAY)).toMatch(/over 8 GB/);
  });

  it('refuses an audio-only file and any other format', () => {
    expect(uploadProblem({ file: file('class.m4a', 'audio/mp4'), sessionDate: TODAY, title: '' }, TODAY)).toMatch(/audio-only/);
    expect(uploadProblem({ file: file('class.mp3', 'audio/mpeg'), sessionDate: TODAY, title: '' }, TODAY)).toMatch(/audio-only/);
    expect(uploadProblem({ file: file('class.avi', 'video/x-msvideo'), sessionDate: TODAY, title: '' }, TODAY)).toMatch(/MP4, MOV, WebM or MKV/);
  });

  it('refuses a date in the future or more than 60 days back, and a missing date', () => {
    const video = file('class.mov', 'video/quicktime');
    expect(uploadProblem({ file: video, sessionDate: '2026-10-10', title: '' }, TODAY)).toMatch(/future/);
    expect(uploadProblem({ file: video, sessionDate: '2026-08-09', title: '' }, TODAY)).toMatch(/60 days/);
    expect(uploadProblem({ file: video, sessionDate: '2026-08-10', title: '' }, TODAY)).toBeNull();
    expect(uploadProblem({ file: video, sessionDate: '', title: '' }, TODAY)).toMatch(/date/);
  });

  it('refuses a title over 80 characters', () => {
    expect(uploadProblem({ file: file('a.webm', 'video/webm'), sessionDate: TODAY, title: 'x'.repeat(81) }, TODAY)).toMatch(/80/);
  });

  it("reads today's date in Chicago, where the program runs", () => {
    expect(chicagoToday(new Date('2026-10-10T03:00:00Z'))).toBe('2026-10-09');
    expect(chicagoToday(new Date('2026-10-10T06:00:00Z'))).toBe('2026-10-10');
  });
});

describe('sending the parts', () => {
  it('PUTs each slice to its address in order and reports the bytes sent', async () => {
    const puts: Array<{ url: string; bytes: number }> = [];
    const progress: number[] = [];
    const blob = new Blob(['abcdefghij']);
    await sendParts(
      blob,
      { uploadId: 'u1', partBytes: 4, parts: [1, 2, 3].map((n) => ({ partNumber: n, url: `https://store.example.test/p${n}` })), expiresAt: '' },
      (sent) => progress.push(sent),
      async (url, body, onBytes) => {
        puts.push({ url, bytes: body.size });
        onBytes(body.size);
      },
    );
    expect(puts).toEqual([
      { url: 'https://store.example.test/p1', bytes: 4 },
      { url: 'https://store.example.test/p2', bytes: 4 },
      { url: 'https://store.example.test/p3', bytes: 2 },
    ]);
    expect(progress.at(-1)).toBe(10);
  });

  it('fresh addresses are fetched when the old ones are about to expire', async () => {
    const urls: string[] = [];
    const parts = (tag: string, expiresAt: string) => ({
      uploadId: 'u1',
      partBytes: 2,
      parts: [1, 2].map((n) => ({ partNumber: n, url: `https://store.example.test/${tag}${n}` })),
      expiresAt,
    });
    let refreshed = 0;
    await sendParts(
      new Blob(['abcd']),
      parts('old', new Date(Date.now() + 1000).toISOString()),
      () => {},
      async (url) => {
        urls.push(url);
      },
      async () => {
        refreshed += 1;
        return parts('new', new Date(Date.now() + 3_600_000).toISOString());
      },
    );
    expect(refreshed).toBe(1);
    expect(urls).toEqual(['https://store.example.test/new1', 'https://store.example.test/new2']);
  });

  it('a part the storage keeps refusing is tried three times, with fresh addresses before each retry, then the send stops naming the parts done', async () => {
    const urls: string[] = [];
    const waits: number[] = [];
    let refreshed = 0;
    const addresses = (tag: string) => ({
      uploadId: 'u1',
      partBytes: 2,
      parts: [1, 2].map((n) => ({ partNumber: n, url: `https://store.example.test/${tag}${n}` })),
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    });
    const failed = await sendParts(
      new Blob(['abcd']),
      addresses('a'),
      () => {},
      async (url) => {
        urls.push(url);
        if (url.endsWith('2')) throw new Error('the connection to the storage failed');
      },
      async () => addresses(`r${++refreshed}-`),
      0,
      async (ms) => {
        waits.push(ms);
      },
    ).catch((e: unknown) => e);
    expect(failed).toBeInstanceOf(PartFailed);
    expect(failed).toMatchObject({ partsDone: 1, partCount: 2, message: 'the connection to the storage failed' });
    expect(urls).toEqual(['https://store.example.test/a1', 'https://store.example.test/a2', 'https://store.example.test/r1-2', 'https://store.example.test/r2-2']);
    expect(waits).toEqual([1_000, 3_000]);
  });

  it('a part that fails once is sent again and the upload goes on', async () => {
    let calls = 0;
    const progress: number[] = [];
    await sendParts(
      new Blob(['abcd']),
      { uploadId: 'u1', partBytes: 2, parts: [1, 2].map((n) => ({ partNumber: n, url: `https://store.example.test/p${n}` })), expiresAt: '' },
      (sent) => progress.push(sent),
      async (_url, body, onBytes) => {
        calls += 1;
        if (calls === 2) throw new Error('the connection to the storage failed');
        onBytes(body.size);
      },
      undefined,
      0,
      async () => {},
    );
    expect(calls).toBe(3);
    expect(progress.at(-1)).toBe(4);
  });

  it('a resumed upload sends only the parts after the ones already done', async () => {
    const urls: string[] = [];
    const progress: number[] = [];
    await sendParts(
      new Blob(['abcdef']),
      { uploadId: 'u1', partBytes: 2, parts: [1, 2, 3].map((n) => ({ partNumber: n, url: `https://store.example.test/p${n}` })), expiresAt: '' },
      (sent) => progress.push(sent),
      async (url) => {
        urls.push(url);
      },
      undefined,
      2,
    );
    expect(urls).toEqual(['https://store.example.test/p3']);
    expect(progress[0]).toBe(4);
    expect(progress.at(-1)).toBe(6);
  });
});
