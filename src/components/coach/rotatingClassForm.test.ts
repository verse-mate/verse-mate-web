import { describe, expect, it } from 'vitest';
import { rotatingClassBody } from './rotatingClassForm';

describe('the rotating class form', () => {
  it('trims the fields, splits the title keywords and keeps the chosen leaders', () => {
    expect(
      rotatingClassBody({ name: ' Harbor Rotation ', groupEmail: ' Harbor@Example.test ', keywords: 'harbor, Harbor study\nrotation', leaders: ['ana', 'ben'] }),
    ).toEqual({ ok: true, body: { name: 'Harbor Rotation', groupEmail: 'harbor@example.test', titleMatch: ['harbor', 'Harbor study', 'rotation'], leaders: ['ana', 'ben'] } });
  });

  it('refuses a missing name, a bad address, a keyword under three characters, and no leaders', () => {
    const ok = { name: 'Harbor', groupEmail: 'harbor@example.test', keywords: '', leaders: ['ana'] };
    expect(rotatingClassBody({ ...ok, name: ' ' })).toEqual({ ok: false, problem: 'Give the class a name.' });
    expect(rotatingClassBody({ ...ok, groupEmail: 'harbor@' })).toMatchObject({ ok: false, problem: expect.stringMatching(/email address/) });
    expect(rotatingClassBody({ ...ok, keywords: 'ok, harbor' })).toEqual({ ok: false, problem: 'Each title keyword needs at least three characters: "ok".' });
    expect(rotatingClassBody({ ...ok, leaders: [] })).toEqual({ ok: false, problem: 'Choose at least one leader who takes turns.' });
  });
});
