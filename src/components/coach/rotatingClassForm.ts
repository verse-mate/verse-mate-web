import { EMAIL_RULE, isEmailAddress, type RotatingClassBody } from '@/services/coachService';

export interface RotatingClassForm {
  name: string;
  groupEmail: string;
  keywords: string;
  leaders: string[];
}

export function rotatingClassBody(form: RotatingClassForm): { ok: true; body: RotatingClassBody } | { ok: false; problem: string } {
  const name = form.name.trim();
  if (!name) return { ok: false, problem: 'Give the class a name.' };
  const groupEmail = form.groupEmail.trim().toLowerCase();
  if (!isEmailAddress(groupEmail)) return { ok: false, problem: EMAIL_RULE };
  const titleMatch = form.keywords
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter(Boolean);
  const short = titleMatch.find((k) => k.length < 3);
  if (short) return { ok: false, problem: `Each title keyword needs at least three characters: "${short}".` };
  if (form.leaders.length === 0) return { ok: false, problem: 'Choose at least one leader who takes turns.' };
  return { ok: true, body: { name, groupEmail, titleMatch, leaders: form.leaders } };
}
