/**
 * English dictionary for words the Greek/Hebrew lexicon doesn't cover.
 *
 * The lexicon only knows the words its alignment matched, and the alignment
 * was authored against a different translation (BSB) than the reader shows,
 * so a large share of a chapter's English — "flood" in Psalm 90:5, most small
 * words — has no card. The mobile app answers those from Easton's Bible
 * Dictionary first, then Webster's 1913. This is the same lookup for web, over
 * the same data files (copied from verse-mate-mobile `assets/data/`), served
 * as static files under `public/dictionary/` and fetched only when a reader
 * asks for a word: Easton's is one 3.5MB file, Webster's is split by first
 * letter so a lookup pulls one ~1MB shard.
 */

export interface EnglishDefinition {
  /** The word as the reader asked for it. */
  word: string;
  /** The dictionary headword that answered (may differ: "swept" → "Sweep"). */
  term: string;
  definition: string;
  source: 'easton' | 'webster';
  /** Easton's scripture references, when it lists them. */
  scriptureRefs?: string[];
  /** Set when the word is an inflection Webster's points elsewhere: "imp. & p. p. of Sweep." */
  formOf?: string;
}

interface DictEntry {
  term: string;
  definition: string;
  scriptureRefs?: string[];
}
type Dictionary = Record<string, DictEntry>;

const DICTIONARY_BASE = '/dictionary';

// KJV typography uses Latin ligatures ("Cæsar"); NFKD does not decompose them.
const LIGATURES: Record<string, string> = { æ: 'ae', Æ: 'AE', œ: 'oe', Œ: 'OE' };

/** Same normalization as mobile's word-mapping-service: the files are keyed by it. */
export function normalizeWord(word: string): string {
  return word
    .replace(/[æÆœŒ]/g, (c) => LIGATURES[c])
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[.,;:!?'"()‘’“”]/g, '');
}

const cache = new Map<string, Promise<Dictionary>>();

function load(file: string): Promise<Dictionary> {
  let p = cache.get(file);
  if (!p) {
    p = fetch(`${DICTIONARY_BASE}/${file}`)
      .then((r) => (r.ok ? (r.json() as Promise<Dictionary>) : {}))
      .catch(() => ({}));
    // A failed fetch (offline) shouldn't stick: let the next lookup retry.
    p.then((d) => {
      if (Object.keys(d).length === 0) cache.delete(file);
    });
    cache.set(file, p);
  }
  return p;
}

function levenshtein(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = a[i - 1] === b[j - 1] ? diag : 1 + Math.min(diag, prev[j], prev[j - 1]);
      diag = tmp;
    }
  }
  return prev[b.length];
}

/** Easton's, exact headword. */
async function lookupEaston(key: string): Promise<DictEntry | null> {
  const dict = await load('easton.json');
  return dict[key] ?? null;
}

/**
 * Mobile's fuzzy fallback for biblical name spellings ("zaccheus" →
 * "zacchaeus"): same first letter, edit distance 1, or 2 for words of six
 * letters or more. Tried only after every exact lookup has missed — run first,
 * as on mobile, it turns ordinary words into names ("anew" → Anab).
 */
async function lookupEastonFuzzy(key: string): Promise<DictEntry | null> {
  if (key.length < 4) return null;
  const dict = await load('easton.json');
  for (const k of Object.keys(dict)) {
    if (k[0] !== key[0] || Math.abs(k.length - key.length) > 2) continue;
    const d = levenshtein(key, k);
    if (d === 1 || (d === 2 && key.length >= 6)) return dict[k];
  }
  return null;
}

async function lookupWebster(key: string): Promise<DictEntry | null> {
  const letter = key[0];
  if (!letter || letter < 'a' || letter > 'z') return null;
  const dict = await load(`webster-${letter}.json`);
  return dict[key] ?? null;
}

// Webster's lists many inflections only as a pointer: "swept" is
// "imp. & p. p. of Sweep." A card that says only that isn't a definition, so
// follow it one step to the headword it names.
// Only the grammatical pointers (imp., p. p., pl., …): "The act of anatomizing."
// has the same shape but is a real definition.
const POINTER_RE =
  /^(?:(?:imp|p\.\s*p|p\.\s*pr|pl|pres|superl|compar|3d\s+pers\.\s*sing(?:\.\s*pres)?)\.?\s*(?:&|,|or)?\s*)+of\s+([A-Za-z][A-Za-z-]*)\.?\s*$/;

/** Plain English plurals / 3rd-person forms the dictionaries don't list. */
function stems(key: string): string[] {
  const out: string[] = [];
  if (key.endsWith('ies') && key.length > 4) out.push(`${key.slice(0, -3)}y`);
  if (key.endsWith('es') && key.length > 3) out.push(key.slice(0, -2));
  if (key.endsWith('s') && !key.endsWith('ss') && key.length > 3) out.push(key.slice(0, -1));
  return out;
}

function fromEaston(word: string, easton: DictEntry): EnglishDefinition {
  return {
    word,
    term: easton.term,
    definition: easton.definition,
    source: 'easton',
    scriptureRefs: easton.scriptureRefs,
  };
}

async function lookupKey(word: string, key: string): Promise<EnglishDefinition | null> {
  const easton = await lookupEaston(key);
  if (easton) return fromEaston(word, easton);
  const webster = await lookupWebster(key);
  if (!webster) return null;
  const pointer = webster.definition.match(POINTER_RE);
  if (pointer) {
    const target = await lookupWebster(normalizeWord(pointer[1]));
    if (target) {
      return {
        word,
        term: target.term,
        definition: target.definition,
        source: 'webster',
        formOf: webster.definition.trim(),
      };
    }
  }
  return { word, term: webster.term, definition: webster.definition, source: 'webster' };
}

/**
 * Look a word up as mobile does — Easton's, then Webster's — then by its
 * singular ("sprouts" → "sprout"), then Easton's spelling variants. Null when
 * no dictionary has it.
 */
export async function lookupEnglishWord(word: string): Promise<EnglishDefinition | null> {
  const key = normalizeWord(word);
  if (!key || !/\p{L}/u.test(key)) return null;
  const direct = await lookupKey(word, key);
  if (direct) return direct;
  for (const stem of stems(key)) {
    const hit = await lookupKey(word, stem);
    if (hit) return hit;
  }
  const fuzzy = await lookupEastonFuzzy(key);
  return fuzzy ? fromEaston(word, fuzzy) : null;
}
