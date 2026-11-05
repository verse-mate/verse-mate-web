/**
 * English dictionary for words the Greek/Hebrew lexicon doesn't cover.
 *
 * The lexicon only knows the words its alignment matched, and the alignment
 * was authored against a different translation (BSB) than the reader shows,
 * so a large share of a chapter's English — "flood" in Psalm 90:5, most small
 * words — has no card. The mobile app answers those from Easton's Bible
 * Dictionary, then Webster's 1913. This is the same lookup for web, over the
 * same data files (copied from verse-mate-mobile `assets/data/`), served as
 * static files under `public/dictionary/` and fetched only when a reader asks
 * for a word: Easton's is one 3.5MB file, Webster's is split by first letter
 * so a lookup pulls one ~1MB shard.
 *
 * The lookup order matches mobile's `services/dictionary-service.ts`; keep
 * the two in step.
 */
import { baseForms } from '@/lib/wordForms';

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

/**
 * Same normalization as mobile's word-mapping-service — the files are keyed by
 * it — including its possessive rule: "David’s" looks up David.
 */
export function normalizeWord(word: string): string {
  return word
    .trim()
    .replace(/['’]s?(?=[.,;:!?"”)]*$)/i, '')
    .replace(/[‘’]/g, "'")
    .replace(/[æÆœŒ]/g, (c) => LIGATURES[c])
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[.,;:!?'"()“”]/g, '');
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

/**
 * Easton's headwords that are a biblical name spelled like a common English
 * word: "so" is King So of Egypt, "on" the city On, "no" No-Amon (Thebes),
 * "a" the Greek letter Alpha. ALWAYS: the English word however it is
 * capitalized (a poetry line opens with a capital: "So teach us to number our
 * days"). LOWERCASE: the English word only in lowercase; capitalized they are
 * names (Ram son of Hezron, Beer the well-station, Madmen the Moabite town).
 */
const NAME_ENTRY_ALWAYS = new Set(['a', 'on', 'so', 'no']);
const NAME_ENTRY_LOWERCASE = new Set(['ram', 'beer', 'madmen']);

function firstLetter(word: string): string | undefined {
  return word.match(/\p{L}/u)?.[0];
}
function startsLowercase(word: string): boolean {
  const c = firstLetter(word);
  return !!c && c === c.toLowerCase() && c !== c.toUpperCase();
}
function startsUppercase(word: string): boolean {
  const c = firstLetter(word);
  return !!c && c === c.toUpperCase() && c !== c.toLowerCase();
}

async function lookupEaston(word: string, key: string): Promise<DictEntry | null> {
  if (NAME_ENTRY_ALWAYS.has(key)) return null;
  if (NAME_ENTRY_LOWERCASE.has(key) && startsLowercase(word)) return null;
  const dict = await load('easton.json');
  return dict[key] ?? null;
}

/**
 * A name's spelling with the transliteration variants that differ between
 * English Bibles folded away: doubled consonants (Bezaleel/Bezalel), "ae"/"ee"
 * (Zacchaeus/Zaccheus), "ch" for "c" (Maachah/Maacah), a final "h" after a
 * vowel (Ramah/Rama), hyphens (Bath-sheba/Bathsheba). Doubled "a" stays: in a
 * Hebrew name it marks a different word (Raamah is not Ramah).
 */
function canonicalName(key: string): string {
  return key
    .replace(/-/g, '')
    .replace(/ae|ee/g, 'e')
    .replace(/ch/g, 'c')
    .replace(/([b-df-hj-np-tv-z])\1/g, '$1')
    .replace(/([aeiou])h$/, '$1');
}

let canonicalIndex: Promise<Map<string, string[]>> | null = null;

function canonicalKeys(): Promise<Map<string, string[]>> {
  canonicalIndex ??= load('easton.json').then((dict) => {
    const index = new Map<string, string[]>();
    for (const key of Object.keys(dict)) {
      const c = canonicalName(key);
      const list = index.get(c);
      if (list) list.push(key);
      else index.set(c, [key]);
    }
    return index;
  });
  return canonicalIndex;
}

/**
 * The entry another spelling of a name is filed under. Every rule is an exact
 * match on a rewritten form — an edit-distance match (as mobile had) also
 * caught near-misses that are other words or names ("anew" → Anab, "will" →
 * Wall, "Pilate" → Palace, "Herod" → Harod).
 *
 * 1. Gentilic singular: "Jebusite" → "jebusites".
 * 2. A longer headword that begins with the name, when it is the only one:
 *    "Pilate" → "pilate pontius" (but "Herod" has six — none is guessed).
 * 3. The same canonical spelling, when unambiguous.
 */
async function lookupEastonVariant(key: string): Promise<DictEntry | null> {
  if (key.length < 3) return null;
  const dict = await load('easton.json');
  if (dict[`${key}s`]) return dict[`${key}s`];
  const longer = Object.keys(dict).filter((k) => k.startsWith(`${key} `));
  if (longer.length === 1) return dict[longer[0]];
  const same = (await canonicalKeys()).get(canonicalName(key));
  if (same && same.length === 1) return dict[same[0]];
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
// follow it one step to the headword it names. Only the grammatical pointers
// (imp., p. p., pl., …): "The act of anatomizing." has the same shape but is a
// real definition.
const POINTER_RE =
  /^(?:(?:imp|p\.\s*p|p\.\s*pr|pl|pres|superl|compar|3d\s+pers\.\s*sing(?:\.\s*pres)?)\.?\s*(?:&|,|or)?\s*)+of\s+([A-Za-z][A-Za-z-]*)\.?\s*$/;

function fromEaston(word: string, easton: DictEntry): EnglishDefinition {
  return {
    word,
    term: easton.term,
    definition: easton.definition,
    source: 'easton',
    scriptureRefs: easton.scriptureRefs,
  };
}

async function fromWebster(word: string, key: string): Promise<EnglishDefinition | null> {
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

async function exact(word: string, key: string): Promise<EnglishDefinition | null> {
  const easton = await lookupEaston(word, key);
  if (easton) return fromEaston(word, easton);
  return fromWebster(word, key);
}

/**
 * Look a word up as mobile does: Easton's, then Webster's, then the same for
 * its base forms ("sons" → son, "called" → call), and only then — for a
 * capitalized word, i.e. a name — another spelling of it in Easton's. Null
 * when no dictionary has it.
 *
 * @param word - As written in the verse; its capitalization matters.
 */
export async function lookupEnglishWord(word: string): Promise<EnglishDefinition | null> {
  const key = normalizeWord(word);
  if (!key || !/\p{L}/u.test(key)) return null;
  const direct = await exact(word, key);
  if (direct) return direct;
  for (const base of baseForms(key)) {
    const hit = await exact(word, base);
    if (hit) return hit;
  }
  if (startsUppercase(word)) {
    const variant = await lookupEastonVariant(key);
    if (variant) return fromEaston(word, variant);
  }
  return null;
}
