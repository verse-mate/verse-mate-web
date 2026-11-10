import { afterEach, describe, expect, it, vi } from 'vitest';
import { setThemeEnabled } from './bibleService';

afterEach(() => vi.unstubAllGlobals());

describe('turning a highlight theme on or off', () => {
  it('fails when the backend refuses the change', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ success: false }), { status: 200, headers: { 'Content-Type': 'application/json' } })),
    );
    await expect(setThemeEnabled(3, true)).rejects.toThrow('refused');
  });
});
