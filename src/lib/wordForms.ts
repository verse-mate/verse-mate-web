/**
 * The dictionary headwords an inflected English word may be listed under, most
 * likely first: "sons" → son, "commanded" → command, "hoped" → hope, "sinned"
 * → sin, "brought" → bring.
 *
 * Neither Easton's nor Webster's lists most regular plurals or past tenses, so
 * without this 4,275 distinct words of NASB1995 found no exact entry — and
 * until the near-spelling match was moved last, each was handed the nearest
 * biblical name instead ("called" → Caleb, "sons" → Songs). These rules bring
 * 3,800 of them to their base word.
 *
 * Only consulted after the word itself has missed, and every candidate must
 * still be an exact headword, so a wrong guess costs nothing but a lookup.
 */

/**
 * Irregular forms that are not headwords in either dictionary. Forms that are
 * headwords ("went": "imp. of Go.") are left to Webster's own pointer.
 */
const IRREGULAR: Record<string, string> = {
  arisen: 'arise',
  awoke: 'awake',
  began: 'begin',
  brought: 'bring',
  calves: 'calf',
  dealt: 'deal',
  does: 'do',
  eaten: 'eat',
  forgiven: 'forgive',
  forsaken: 'forsake',
  forsook: 'forsake',
  goes: 'go',
  overlaid: 'overlay',
  oxen: 'ox',
  rebuilt: 'rebuild',
  sheaves: 'sheaf',
  shelves: 'shelf',
  slain: 'slay',
  thieves: 'thief',
  yourselves: 'yourself',
};

/** Ends consonant–vowel–consonant, as a stem that dropped its "e" does: hop(e), din(e), lov(e). */
const DROPPED_E = /[^aeiou][aeiou][^aeiouwxy]$/;

/**
 * Candidate base forms of a normalized (lowercase) word, in the order to try.
 * Does not include the word itself.
 */
export function baseForms(key: string): string[] {
  const out: string[] = [];
  const add = (s: string) => {
    if (s.length >= 2 && s !== key && !out.includes(s)) out.push(s);
  };

  const irregular = IRREGULAR[key];
  if (irregular) add(irregular);

  // cities → city, carried → carry
  if ((key.endsWith('ies') || key.endsWith('ied')) && key.length > 4) add(`${key.slice(0, -3)}y`);

  // Plurals / 3rd person. "-es" comes off first only where English adds it:
  // after x, z, ch, sh, ss (boxes, searches, passes). Elsewhere the "e" is
  // the word's own (eyes → eye, not "ey"; places → place; toes → toe).
  if (key.endsWith('s') && !key.endsWith('ss') && key.length > 3) {
    const lessEs = key.endsWith('es') ? key.slice(0, -2) : null;
    if (lessEs && /(x|z|ch|sh|ss)$/.test(lessEs)) {
      add(lessEs);
      add(key.slice(0, -1));
    } else {
      add(key.slice(0, -1));
      if (lessEs && lessEs.length >= 3) add(lessEs);
    }
  }

  // Past tense and participle: called → call, hoped → hope, sinned → sin.
  for (const suffix of ['ed', 'ing']) {
    if (!key.endsWith(suffix)) continue;
    const stem = key.slice(0, -suffix.length);
    const bare = stem.length >= 3 ? [stem] : [];
    // A short consonant–vowel–consonant stem most often lost an "e" (hoped,
    // dined, loving); otherwise the bare stem comes first (called, visited).
    const withE = `${stem}e`;
    const ordered = stem.length <= 4 && DROPPED_E.test(stem) ? [withE, ...bare] : [...bare, withE];
    for (const s of ordered) add(s);
    // A doubled final consonant: sinned → sin, stopped → stop.
    if (stem.length > 3 && stem[stem.length - 1] === stem[stem.length - 2]) {
      add(stem.slice(0, -1));
    }
  }

  return out;
}
