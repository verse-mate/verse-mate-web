#!/usr/bin/env python3
"""
Build lexicon alignment data from open sources.

Sources:
  * Berean Standard Bible tables (bsb_tables.xlsx) — token-level Greek↔English
    alignment with Strong's numbers. Public domain.
  * STEP Bible TBESG (Translators Brief Extended Strongs for Greek) — Strong's
    → (Greek lemma, translit, POS, English gloss, Abbott-Smith definition).
    CC BY 4.0.

Output:
  * src/data/lexicon/generated/_lemmas.json — one global lexicon, keyed by
    a stable translit slug. Contains every Greek lemma referenced by any
    NT alignment row.
  * src/data/lexicon/generated/<book-slug>-<chapter>.json — one file per
    chapter, holding the verse→token alignment in ChapterAlignment shape.

Usage:
  ./build.py --book Philippians       # build one book
  ./build.py --all-nt                 # build all 27 NT books

The script caches downloads + the slim Greek-only CSV in ./data/.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
import urllib.request
from collections import defaultdict
from pathlib import Path

import pandas as pd

# ─────────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────────

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE / 'data'
OUT_DIR = HERE.parent.parent / 'src' / 'data' / 'lexicon' / 'generated'

BSB_URL = 'https://bereanbible.com/bsb_tables.xlsx'
TBESG_URL = (
    'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Lexicons/'
    'TBESG%20-%20Translators%20Brief%20lexicon%20of%20Extended%20Strongs%20for%20Greek'
    '%20-%20STEPBible.org%20CC%20BY.txt'
)

# Canonical NT book IDs matching the app's bookId scheme (Matthew=40 … Revelation=66).
NT_BOOK_IDS: dict[str, int] = {
    'Matthew': 40, 'Mark': 41, 'Luke': 42, 'John': 43, 'Acts': 44,
    'Romans': 45, '1 Corinthians': 46, '2 Corinthians': 47, 'Galatians': 48,
    'Ephesians': 49, 'Philippians': 50, 'Colossians': 51,
    '1 Thessalonians': 52, '2 Thessalonians': 53,
    '1 Timothy': 54, '2 Timothy': 55, 'Titus': 56, 'Philemon': 57,
    'Hebrews': 58, 'James': 59,
    '1 Peter': 60, '2 Peter': 61,
    '1 John': 62, '2 John': 63, '3 John': 64,
    'Jude': 65, 'Revelation': 66,
}

# STEP TBESG POS code → human-readable. Conservative mapping; unknown codes
# fall through as the raw code so we never invent a label that isn't there.
POS_MAP: dict[str, str] = {
    'G:N': 'Noun', 'G:N-M': 'Noun (masc.)', 'G:N-F': 'Noun (fem.)', 'G:N-N': 'Noun (neut.)',
    'G:V': 'Verb',
    'G:A': 'Adjective',
    'G:Adv': 'Adverb', 'G:ADV': 'Adverb',
    'G:Prep': 'Preposition', 'G:PREP': 'Preposition',
    'G:Conj': 'Conjunction', 'G:CONJ': 'Conjunction',
    'G:Pron': 'Pronoun', 'G:PRON': 'Pronoun',
    'G:Art': 'Article', 'G:ART': 'Article', 'G:T': 'Article',
    'G:P': 'Pronoun', 'G:P-1': 'Pronoun (1st)', 'G:P-2': 'Pronoun (2nd)', 'G:P-3': 'Pronoun (3rd)',
    'G:X': 'Pronoun (indefinite)', 'G:R': 'Pronoun (relative)',
    'G:Q': 'Pronoun (interrogative)', 'G:D': 'Pronoun (demonstrative)',
    'G:F': 'Reflexive pronoun', 'G:F-1': 'Reflexive pronoun', 'G:F-2': 'Reflexive pronoun',
    'G:F-3': 'Reflexive pronoun',
    'G:INJ': 'Interjection',
    'G:Part': 'Particle', 'G:PART': 'Particle', 'G:PRT': 'Particle',
    'G:Num': 'Numeral',
    'N:N': 'Proper noun', 'N:N-M-P': 'Proper noun (person)',
    'N:N-F-P': 'Proper noun (person)', 'N:N--T': 'Proper noun (place/thing)',
}

# POS classes we DON'T mark tappable. Articles, prepositions, conjunctions,
# pronouns, particles, interjections, numerals — function words that don't
# reward a lexical popup. We keep nouns, verbs, adjectives, adverbs, and
# proper nouns (names like Paul, Christ, Jerusalem).
SKIP_POS_PREFIXES: tuple[str, ...] = (
    'G:Conj', 'G:CONJ',
    'G:Prep', 'G:PREP',
    'G:Art', 'G:ART', 'G:T',
    'G:Pron', 'G:PRON', 'G:P', 'G:X', 'G:R', 'G:Q', 'G:D', 'G:F',
    'G:Part', 'G:PART', 'G:PRT',
    'G:INJ',
    'G:Num',
)

# Content-word lemmas so common they aren't worth a per-occurrence tap.
# Mostly the auxiliary / generic verbs of being, having, doing, saying that
# carry no theological freight on their own. Add sparingly — over-filtering
# strips real lemmas from the reading experience.
SKIP_LEMMA_SLUGS: frozenset[str] = frozenset({
    # Auxiliary / generic verbs of being-having-doing-saying-perceiving
    'eimi',     # εἰμί — to be (~2,460× NT)
    'lego',     # λέγω — to say (~2,350× NT) [TBESG split: also "eipon"]
    'eipon',    # εἶπον — alternate aorist of λέγω (~963× NT)
    'echo',     # ἔχω — to have (~710× NT)
    'poieo',    # ποιέω — to do/make (~570× NT)
    'ginomai',  # γίνομαι — to become (~670× NT)
    'erchomai', # ἔρχομαι — to come (~630× NT)
    'horao',    # ὁράω — to see (~450× NT)
    'akouo',    # ἀκούω — to hear (~430× NT)
    'eido',     # εἴδω / οἶδα — to know (~320× NT)
    'didomi',   # δίδωμι — to give (~410× NT)
    'lambano',  # λαμβάνω — to take/receive (~260× NT)
    'laleo',    # λαλέω — to speak (~295× NT)
    'apokrino', # ἀποκρίνομαι — to answer (~225× NT)
    'ginosko',  # γινώσκω — to know (~220× NT) — content but extremely generic in narrative
    'thelo',    # θέλω — to will/desire (~210× NT)
    'dunamai',  # δύναμαι — to be able (~210× NT)
    'exerchomai',   # ἐξέρχομαι — to go out (~220× NT)
    'eiserchomai',  # εἰσέρχομαι — to enter (~190× NT)
    'grapho',   # γράφω — to write (~190× NT)
    'heurisko', # εὑρίσκω — to find (~175× NT)
    'histemi',  # ἵστημι — to stand (~155× NT)
    # Function words / generics that slipped through POS filtering
    'pas',      # πᾶς — all/every (~1,240× NT)
    'polus',    # πολύς — much/many (~360× NT)
    'megas',    # μέγας — great (~240× NT)
    'heis',     # εἷς — one (numeral, ~340× NT)
    'oudeis',   # οὐδείς — no one (~225× NT)
    'tis',      # τις — anyone/someone (~520× NT)
    'ei',       # εἰ — if (~525× NT)
    'ean',      # ἐάν — if/when (~330× NT)
    'houtos',   # οὕτως — thus/in this way (~210× NT)
})


def is_content_pos(pos_code: str) -> bool:
    """True if this POS class is worth a tap. False for stopword classes
    (articles, pronouns, conjunctions, prepositions, particles, interjections,
    numerals). Unknown codes default to True so we don't silently drop new
    content classes."""
    if not pos_code:
        return True
    code = pos_code.strip()
    return not any(code.startswith(p) for p in SKIP_POS_PREFIXES)


# ─────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────

def slugify_translit(translit: str) -> str:
    """Stable lemma key — strip macrons, lowercase, alnum only.
    `Παῦλος` (Paulos) → `paulos`; `δίψυχος` (dipsychos) → `dipsychos`.

    Two TBESG-specific normalizations:
      * Multiple forms are comma-separated (`ohutō, ohutōs`); take the first.
      * TBESG transliterates rough breathing AFTER the initial vowel
        (`uhios` for υἱός, `ehis` for εἷς, `ohutōs` for οὕτως). Standard
        scholarly transliteration puts h FIRST (`huios`, `heis`, `houtos`).
        Reorder so generated slugs match what hand-authored lemmas.ts uses.
    """
    # Take first form when TBESG lists alternates.
    translit = translit.split(',')[0]
    # Decompose to strip combining marks (macrons, breves, etc.)
    normalized = unicodedata.normalize('NFD', translit)
    stripped = ''.join(ch for ch in normalized if unicodedata.category(ch) != 'Mn')
    stripped = stripped.lower()
    slug = re.sub(r'[^a-z0-9]+', '', stripped)
    # Reorder TBESG's post-vowel breathing-mark "h" to the standard position.
    # Only applies at the start of the slug, where the rough breathing sits.
    slug = re.sub(r'^([aeiouy])h(?!h)', r'h\1', slug)
    return slug


def map_pos(code: str) -> str:
    if not code:
        return ''
    code = code.strip()
    if code in POS_MAP:
        return POS_MAP[code]
    # Try prefix match (e.g. 'G:N-LI' → 'Noun')
    for prefix in ('G:N', 'G:V', 'G:A', 'G:Adv', 'G:Prep', 'G:Conj', 'G:Pron', 'G:Art', 'N:N'):
        if code.startswith(prefix) and prefix in POS_MAP:
            return POS_MAP[prefix]
    return code


def clean_english_surface(s: str) -> str:
    """Trim English fragments from BSB. Skip empty / placeholder rows."""
    if not isinstance(s, str):
        return ''
    s = s.strip()
    # BSB uses '. . .' / '-' as placeholders for tokens the translation absorbs
    if s in ('-', '. . .', '. .', '.', ''):
        return ''
    # Strip leading/trailing punctuation that isn't part of the word
    s = s.strip(' .,;:!?"\'()[]{}')
    # Remove BSB italic markers like '[the]' — keep the bracketed text since it
    # often IS the displayed word (e.g. "[the] day" → tap on "day").
    s = re.sub(r'[\[\]]', '', s).strip()
    return s


# ─────────────────────────────────────────────────────────────────────────
# Downloaders
# ─────────────────────────────────────────────────────────────────────────

def ensure_bsb_csv() -> Path:
    """Download BSB tables xlsx once, extract Greek subset to a slim CSV."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    xlsx = DATA_DIR / 'bsb_tables.xlsx'
    csv = DATA_DIR / 'bsb_greek.csv'
    if csv.exists():
        return csv
    if not xlsx.exists():
        print(f'Downloading BSB tables (53 MB) → {xlsx}')
        urllib.request.urlretrieve(BSB_URL, xlsx)
    print('Extracting Greek subset to CSV…')
    df = pd.read_excel(xlsx, sheet_name='biblosinterlinear96', engine='openpyxl')
    df.columns = [c.strip() for c in df.columns]
    keep = ['VerseId', 'WLC / Nestle Base TR RP WH NE NA SBL', 'Translit',
            'Parsing', 'Parsing.1', 'Str Grk', 'BSB version']
    g = df[df['Language'] == 'Greek'][keep].copy()
    g.columns = ['ref', 'greek', 'translit', 'parsing_code', 'parsing_human', 'strongs', 'english']
    # Forward-fill ref — BSB only sets verse id on the first token of each verse
    g['ref'] = g['ref'].ffill()
    g.to_csv(csv, index=False)
    print(f'  Wrote {len(g):,} Greek token rows.')
    return csv


def ensure_tbesg() -> Path:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = DATA_DIR / 'tbesg.txt'
    if not path.exists():
        print(f'Downloading TBESG (4.7 MB) → {path}')
        urllib.request.urlretrieve(TBESG_URL, path)
    return path


# ─────────────────────────────────────────────────────────────────────────
# Parsers
# ─────────────────────────────────────────────────────────────────────────

def parse_tbesg(path: Path) -> dict[str, dict]:
    """Returns {strongs_extended_no_suffix: {lemma, translit, pos, gloss, definition}}.

    TBESG keys are eStrong numbers like 'G0001', 'G0007G' (disambiguated). We
    key on the base 4-digit Strong's number so it joins cleanly with BSB's
    plain integer Strong's. When multiple variants exist for the same base
    (G0007G vs G0007H — Abijah son of Rehoboam vs the priest), we keep the
    first encountered entry; for theologically loaded words a hand-curated
    override in lemmas.ts replaces this anyway."""
    entries: dict[str, dict] = {}
    base_re = re.compile(r'^G(\d{4})[A-Z]?\s')
    with path.open(encoding='utf-8') as f:
        for line in f:
            if not line.startswith('G'):
                continue
            parts = line.split('\t')
            if len(parts) < 8:
                continue
            estrong = parts[0].strip()
            m = base_re.match(estrong + ' ')
            if not m:
                continue
            base_strongs = f'G{m.group(1)}'
            if base_strongs in entries:
                continue  # keep first, hand-curated overrides handle nuance
            greek_field, translit, pos_code, gloss = parts[3:7]
            # `greek_field` is like 'α, Ἀλφα' or 'Ἀβαδδών' — take the first form
            greek = greek_field.split(',')[0].strip()
            # Truncate Abbott-Smith definitions — they ship HTML tags and
            # cross-references that are too long for a card. We'll re-think
            # in Phase 3 when generated contextual glosses arrive.
            definition = parts[7].strip() if len(parts) > 7 else ''
            definition = re.sub(r'<[^>]+>', '', definition)  # strip HTML
            definition = re.sub(r'\s+', ' ', definition).strip()
            if len(definition) > 220:
                definition = definition[:217].rsplit(' ', 1)[0] + '…'
            entries[base_strongs] = {
                'lemma': greek,
                'translit': translit.strip(),
                'pos_code': pos_code.strip(),
                'pos': map_pos(pos_code),
                'gloss': gloss.strip(),
                'notes': definition,
            }
    return entries


# ─────────────────────────────────────────────────────────────────────────
# Emit
# ─────────────────────────────────────────────────────────────────────────

def book_slug(name: str) -> str:
    """Slug used for filenames + dynamic-import keys. Matches the app's
    bookSlugs convention where possible (lowercase, hyphens for spaces)."""
    return name.lower().replace(' ', '-')


def build_book(book_name: str, bsb_df: pd.DataFrame, tbesg: dict[str, dict],
               freq_counter: dict[str, int]) -> dict:
    """Emit alignment data + the set of lemma keys this book contributes.

    Returns:
      { 'chapters': [(chapter, alignment_dict), ...], 'lemmas_used': set[str] }
    """
    book_id = NT_BOOK_IDS[book_name]
    book_df = bsb_df[bsb_df['ref'].astype(str).str.startswith(f'{book_name} ', na=False)]
    if book_df.empty:
        print(f'  WARN: no rows for {book_name}')
        return {'chapters': [], 'lemmas_used': set()}

    chapters: dict[int, dict[int, list]] = defaultdict(lambda: defaultdict(list))
    lemmas_used: set[str] = set()
    ref_re = re.compile(rf'^{re.escape(book_name)}\s+(\d+):(\d+)$')

    for _, row in book_df.iterrows():
        m = ref_re.match(str(row['ref']))
        if not m:
            continue
        chapter = int(m.group(1))
        verse = int(m.group(2))
        strongs_num = row['strongs']
        if pd.isna(strongs_num):
            continue
        strongs = f'G{int(strongs_num):04d}'
        english = clean_english_surface(row['english'])
        if not english:
            continue

        entry = tbesg.get(strongs)
        if not entry:
            # No TBESG match — skip. Common only for textual variants where
            # BSB tags a Greek token with a Strong's not in the brief lexicon.
            continue

        # Content-word filter — function words (articles, prepositions, conjunctions,
        # pronouns, particles, numerals) and a small set of high-frequency auxiliary
        # verbs (εἰμί, λέγω, ἔχω, …) are not marked tappable. They'd add visual noise
        # without reward.
        if not is_content_pos(entry.get('pos_code', '')):
            continue
        lemma_key = slugify_translit(entry['translit'])
        if not lemma_key or lemma_key in SKIP_LEMMA_SLUGS:
            continue
        lemmas_used.add(lemma_key)
        freq_counter[lemma_key] = freq_counter.get(lemma_key, 0) + 1

        chapters[chapter][verse].append({
            'surface': english,
            'lemma': lemma_key,
        })

    out_chapters = []
    for ch in sorted(chapters.keys()):
        # Within a verse: keep all token alignments. The renderer's greedy
        # longest-match scan handles ordering + word-boundary checks.
        verses_dict = {str(v): chapters[ch][v] for v in sorted(chapters[ch].keys())}
        alignment = {
            'bookId': book_id,
            'book': book_name,
            'chapter': ch,
            'version': 'BSB',
            'verses': verses_dict,
        }
        out_chapters.append((ch, alignment))
    return {'chapters': out_chapters, 'lemmas_used': lemmas_used}


def write_lexicon(tbesg: dict[str, dict], lemmas_used: set[str],
                  freq_counter: dict[str, int]) -> None:
    """Emit the global lemmas.json — one entry per unique lemma key seen
    across any built book. Keyed by translit slug for parity with the
    hand-curated lemmas.ts."""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    # Build reverse index: translit_slug → tbesg entry (first match wins)
    slug_to_entry: dict[str, tuple[str, dict]] = {}
    for strongs, entry in tbesg.items():
        slug = slugify_translit(entry['translit'])
        if not slug or slug in slug_to_entry:
            continue
        slug_to_entry[slug] = (strongs, entry)

    out: dict[str, dict] = {}
    skipped = 0
    for slug in sorted(lemmas_used):
        if slug not in slug_to_entry:
            skipped += 1
            continue
        strongs, entry = slug_to_entry[slug]
        out[slug] = {
            'lemma': entry['lemma'],
            'translit': entry['translit'],
            'strongs': strongs,
            'pos': entry['pos'],
            'basicGloss': entry['gloss'],
            'ntFrequency': freq_counter.get(slug, 0),
            'loaded': False,
            'notes': entry['notes'],
        }
    out_path = OUT_DIR / '_lemmas.json'
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2))
    print(f'\nWrote {len(out):,} lemmas to {out_path.relative_to(OUT_DIR.parent.parent.parent.parent)}')
    if skipped:
        print(f'  ({skipped} lemmas in alignments had no TBESG match — skipped.)')


def write_chapters(book_name: str, chapters: list[tuple[int, dict]]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    slug = book_slug(book_name)
    for ch, alignment in chapters:
        path = OUT_DIR / f'{slug}-{ch}.json'
        path.write_text(json.dumps(alignment, ensure_ascii=False, indent=2))
    print(f'  {book_name}: {len(chapters)} chapter files')


# ─────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--book', help='Single book name, e.g. "Philippians"')
    parser.add_argument('--all-nt', action='store_true', help='Build all 27 NT books')
    args = parser.parse_args()

    if not args.book and not args.all_nt:
        parser.error('Pass --book <name> or --all-nt')

    books = [args.book] if args.book else list(NT_BOOK_IDS.keys())
    for b in books:
        if b not in NT_BOOK_IDS:
            parser.error(f'Unknown book: {b!r}. Try one of: {", ".join(NT_BOOK_IDS)}')

    print('=== Lexicon ingest ===')
    csv = ensure_bsb_csv()
    tbesg_path = ensure_tbesg()
    print('Loading data…')
    bsb = pd.read_csv(csv)
    tbesg = parse_tbesg(tbesg_path)
    print(f'  BSB: {len(bsb):,} Greek tokens, TBESG: {len(tbesg):,} Strong\'s entries')

    all_lemmas_used: set[str] = set()
    freq_counter: dict[str, int] = {}

    print('\nBuilding books…')
    for book in books:
        result = build_book(book, bsb, tbesg, freq_counter)
        if not result['chapters']:
            continue
        write_chapters(book, result['chapters'])
        all_lemmas_used |= result['lemmas_used']

    write_lexicon(tbesg, all_lemmas_used, freq_counter)
    print('\nDone.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
