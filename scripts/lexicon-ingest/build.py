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
TBESH_URL = (
    'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Lexicons/'
    'TBESH%20-%20Translators%20Brief%20lexicon%20of%20Extended%20Strongs%20for%20Hebrew'
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

# Canonical OT book IDs (Genesis=1 … Malachi=39). The Latter Prophets follow
# the Protestant order (Daniel after Ezekiel; not the LXX order).
OT_BOOK_IDS: dict[str, int] = {
    'Genesis': 1, 'Exodus': 2, 'Leviticus': 3, 'Numbers': 4, 'Deuteronomy': 5,
    'Joshua': 6, 'Judges': 7, 'Ruth': 8,
    '1 Samuel': 9, '2 Samuel': 10, '1 Kings': 11, '2 Kings': 12,
    '1 Chronicles': 13, '2 Chronicles': 14,
    'Ezra': 15, 'Nehemiah': 16, 'Esther': 17,
    'Job': 18, 'Psalms': 19, 'Psalm': 19,  # singular alias — sometimes used
    'Proverbs': 20, 'Ecclesiastes': 21, 'Song of Solomon': 22,
    'Isaiah': 23, 'Jeremiah': 24, 'Lamentations': 25,
    'Ezekiel': 26, 'Daniel': 27,
    'Hosea': 28, 'Joel': 29, 'Amos': 30, 'Obadiah': 31, 'Jonah': 32,
    'Micah': 33, 'Nahum': 34, 'Habakkuk': 35, 'Zephaniah': 36,
    'Haggai': 37, 'Zechariah': 38, 'Malachi': 39,
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
    # Hebrew (TBESH H: prefix)
    'H:N': 'Noun', 'H:N-M': 'Noun (masc.)', 'H:N-F': 'Noun (fem.)', 'H:N-N': 'Noun (neut.)',
    'H:V': 'Verb',
    'H:A': 'Adjective',
    'H:Adv': 'Adverb', 'H:ADV': 'Adverb',
    'H:Prep': 'Preposition',
    'H:Conj': 'Conjunction',
    'H:Pron': 'Pronoun',
    'H:Art': 'Article', 'H:T': 'Article',
    'H:Part': 'Particle', 'H:PRT': 'Particle',
    'H:INJ': 'Interjection',
    'H:Num': 'Numeral',
    # Aramaic (A: prefix) — same categories as Hebrew
    'A:N': 'Noun', 'A:N-M': 'Noun (masc.)', 'A:N-F': 'Noun (fem.)',
    'A:V': 'Verb', 'A:A': 'Adjective', 'A:Adv': 'Adverb', 'A:Prep': 'Preposition',
    'A:Conj': 'Conjunction', 'A:Pron': 'Pronoun', 'A:Part': 'Particle',
}

# POS classes we DON'T mark tappable. Articles, prepositions, conjunctions,
# pronouns, particles, interjections, numerals — function words that don't
# reward a lexical popup. We keep nouns, verbs, adjectives, adverbs, and
# proper nouns (names like Paul, Christ, Jerusalem).
# Same logic applies to Hebrew (H:) and Aramaic (A:) entries.
SKIP_POS_PREFIXES: tuple[str, ...] = (
    'G:Conj', 'G:CONJ',
    'G:Prep', 'G:PREP',
    'G:Art', 'G:ART', 'G:T',
    'G:Pron', 'G:PRON', 'G:P', 'G:X', 'G:R', 'G:Q', 'G:D', 'G:F',
    'G:Part', 'G:PART', 'G:PRT',
    'G:INJ',
    'G:Num',
    # Hebrew / Aramaic equivalents — TBESH uses H: prefix, Aramaic A:
    'H:Conj', 'H:Prep', 'H:Art', 'H:Pron', 'H:Part', 'H:PRT', 'H:INJ', 'H:Num',
    'H:T', 'H:P', 'H:X', 'H:R', 'H:Q', 'H:D', 'H:F',
    'A:Conj', 'A:Prep', 'A:Art', 'A:Pron', 'A:Part', 'A:PRT', 'A:INJ', 'A:Num',
)

# Content-word lemmas so common they aren't worth a per-occurrence tap.
# Mostly the auxiliary / generic verbs of being, having, doing, saying that
# carry no theological freight on their own. Add sparingly — over-filtering
# strips real lemmas from the reading experience.
SKIP_LEMMA_SLUGS: frozenset[str] = frozenset({
    # ─── Greek / NT ───
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
    # ─── Hebrew / OT ───
    # Particles, function-word verbs, and generic high-frequency content
    # whose taps would just clutter without reward.
    'et',       # אֵת — direct object marker (~10,000× OT — pure syntactic)
    'lo',       # לֹא — not (~5,200× OT)
    'al',       # אַל — not/no (~750× OT)
    'asher',    # אֲשֶׁר — relative pronoun "which/who" (~5,500× OT)
    'ki',       # כִּי — for/because/that (~4,400× OT)
    'im',       # אִם — if (~1,070× OT)
    'gam',      # גַּם — also (~770× OT)
    'rak',      # רַק — only (~108× OT)
    'av',       # אַב — father (homophone with אָב; H1 generic noun) — keep generic? actually keep
    'amar',     # אָמַר — to say (~5,300× OT) — generic verb of speech
    'hayah',    # הָיָה — to be (~3,500× OT)
    'asah',     # עָשָׂה — to do/make (~2,627× OT)
    'natan',    # נָתַן — to give (~2,011× OT)
    'lakach',   # לָקַח — to take (~967× OT)
    'halak',    # הָלַךְ — to go/walk (~1,560× OT)
    'bo',       # בּוֹא — to come (~2,592× OT)
    'shuv',     # שׁוּב — to return/turn (~1,075× OT)
    'yatsa',    # יָצָא — to go out (~1,067× OT)
    'qara',     # קָרָא — to call (~739× OT)
    'shama',    # שָׁמַע — to hear (~1,159× OT) — borderline; keep semantic value but skip for now
    'raah',     # רָאָה — to see (~1,303× OT)
    'yashav',   # יָשַׁב — to sit/dwell (~1,088× OT)
    'kol',      # כֹּל — all/every (~5,400× OT)
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

def slugify_translit(translit: str, *, is_greek: bool = True) -> str:
    """Stable lemma key — strip macrons, lowercase, alnum only.
    `Παῦλος` (Paulos) → `paulos`; `δίψυχος` (dipsychos) → `dipsychos`.

    Two TBESG-specific normalizations:
      * Multiple forms are comma-separated (`ohutō, ohutōs`); take the first.
      * TBESG transliterates rough breathing AFTER the initial vowel
        (`uhios` for υἱός, `ehis` for εἷς, `ohutōs` for οὕτως). Standard
        scholarly transliteration puts h FIRST (`huios`, `heis`, `houtos`).
        Reorder so generated slugs match what hand-authored lemmas.ts uses.

    `is_greek=False` skips the breathing-mark reorder. Hebrew transliterations
    that start with vowel-then-h (e.g. אָהַב → `a.hav`) are genuinely
    vowel-then-consonant — the `h` represents the letter ה (heh), not a
    rough-breathing diacritic. Reordering would produce wrong slugs like
    `haav`, which is what an earlier pass was doing.
    """
    # Take first form when TBESE lists alternates.
    translit = translit.split(',')[0]
    # Decompose to strip combining marks (macrons, breves, etc.)
    normalized = unicodedata.normalize('NFD', translit)
    stripped = ''.join(ch for ch in normalized if unicodedata.category(ch) != 'Mn')
    stripped = stripped.lower()
    slug = re.sub(r'[^a-z0-9]+', '', stripped)
    # Greek-only: reorder TBESG's post-vowel breathing-mark "h" to the
    # standard position. NEVER applied to Hebrew — there `h` is part of
    # the word, not a diacritic.
    if is_greek:
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

def ensure_bsb_csv(language: str) -> Path:
    """Download BSB tables xlsx once, extract a slim per-language CSV.
    language ∈ {'Greek', 'Hebrew'}. Hebrew CSV also includes the small
    number of Aramaic rows (Daniel 2–7, Ezra 4–7, Jer 10:11, Gen 31:47);
    they share the OT bookId space and the TBESH lexicon."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    xlsx = DATA_DIR / 'bsb_tables.xlsx'
    slug = language.lower()
    csv = DATA_DIR / f'bsb_{slug}.csv'
    if csv.exists():
        return csv
    if not xlsx.exists():
        print(f'Downloading BSB tables (53 MB) → {xlsx}')
        urllib.request.urlretrieve(BSB_URL, xlsx)
    print(f'Extracting {language} subset to CSV…')
    df = pd.read_excel(xlsx, sheet_name='biblosinterlinear96', engine='openpyxl')
    df.columns = [c.strip() for c in df.columns]
    if language == 'Greek':
        mask = df['Language'] == 'Greek'
        strongs_col = 'Str Grk'
    elif language == 'Hebrew':
        # Aramaic uses the same Strong's column (Str Heb) and the same TBESH
        # lexicon; lump them together.
        mask = df['Language'].isin(['Hebrew', 'Aramaic'])
        strongs_col = 'Str Heb'
    else:
        raise ValueError(f'Unknown language: {language!r}')
    keep = ['VerseId', 'WLC / Nestle Base TR RP WH NE NA SBL', 'Translit',
            'Parsing', 'Parsing.1', strongs_col, 'BSB version']
    g = df[mask][keep].copy()
    g.columns = ['ref', 'orig', 'translit', 'parsing_code', 'parsing_human',
                 'strongs', 'english']
    # Forward-fill ref — BSB only sets verse id on the first token of each verse
    g['ref'] = g['ref'].ffill()
    g.to_csv(csv, index=False)
    print(f'  Wrote {len(g):,} {language} token rows.')
    return csv


def ensure_lexicon(language: str) -> Path:
    """Download TBESG (Greek) or TBESH (Hebrew) if not already cached."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if language == 'Greek':
        url, fname = TBESG_URL, 'tbesg.txt'
    elif language == 'Hebrew':
        url, fname = TBESH_URL, 'tbesh.txt'
    else:
        raise ValueError(f'Unknown language: {language!r}')
    path = DATA_DIR / fname
    if not path.exists():
        print(f'Downloading {fname} → {path}')
        urllib.request.urlretrieve(url, path)
    return path


# ─────────────────────────────────────────────────────────────────────────
# Parsers
# ─────────────────────────────────────────────────────────────────────────

def parse_tbe(path: Path, prefix: str) -> dict[str, dict]:
    """Returns {strongs_no_suffix: {lemma, translit, pos, gloss, definition}}.

    prefix is 'G' for TBESG (Greek), 'H' for TBESH (Hebrew/Aramaic). TBESE
    keys are extended Strong numbers like 'G0001', 'G0007G' or 'H0001G'. We
    key on the base 4-digit number so it joins cleanly with BSB's plain
    integer Strong's. When multiple variants exist for the same base, keep
    the first encountered entry — hand-curated overrides handle nuance.

    For Aramaic words (Daniel/Ezra) BSB uses Hebrew Strong's numbers; TBESH
    includes them. So a single 'H' parse covers both Hebrew + Aramaic.
    """
    entries: dict[str, dict] = {}
    # Match base Strong's (4 digits) optionally followed by a disambiguator
    # letter. TBESG uses uppercase (G0007G, G2264H); TBESH uses lowercase
    # (H1254a, H1254b for homonyms). Accept either.
    base_re = re.compile(rf'^{prefix}(\d{{4}})[A-Za-z]?\s')
    with path.open(encoding='utf-8') as f:
        for line in f:
            if not line.startswith(prefix):
                continue
            parts = line.split('\t')
            if len(parts) < 8:
                continue
            estrong = parts[0].strip()
            m = base_re.match(estrong + ' ')
            if not m:
                continue
            base_strongs = f'{prefix}{m.group(1)}'
            if base_strongs in entries:
                continue
            orig_field, translit, pos_code, gloss = parts[3:7]
            # `orig_field` is like 'α, Ἀλφα' or 'אַב' — take the first form
            orig = orig_field.split(',')[0].strip()
            definition = parts[7].strip() if len(parts) > 7 else ''
            definition = re.sub(r'<[^>]+>', '', definition)  # strip HTML
            definition = re.sub(r'\s+', ' ', definition).strip()
            # TBESH definitions use 1) 1a) 2) numbered lists more aggressively
            # than TBESG. Collapse the leading number-marker so the card text
            # reads as prose, not as an outline.
            definition = re.sub(r'^\d+[a-z]?\)\s*', '', definition)
            if len(definition) > 240:
                definition = definition[:237].rsplit(' ', 1)[0] + '…'
            entries[base_strongs] = {
                'lemma': orig,
                'translit': translit.strip(),
                'pos_code': pos_code.strip(),
                'pos': map_pos(pos_code),
                'gloss': gloss.strip(),
                'notes': definition,
            }
    return entries


# Back-compat alias — older code calls parse_tbesg.
def parse_tbesg(path: Path) -> dict[str, dict]:
    return parse_tbe(path, 'G')


# ─────────────────────────────────────────────────────────────────────────
# Emit
# ─────────────────────────────────────────────────────────────────────────

def book_slug(name: str) -> str:
    """Slug used for filenames + dynamic-import keys. Matches the app's
    bookSlugs convention where possible (lowercase, hyphens for spaces).
    A small alias table handles cases where BSB's book name differs from
    the app's slug (e.g., BSB "Psalm" vs app "psalms")."""
    aliases = {
        'Psalm': 'psalms',  # BSB uses singular, app uses plural
    }
    if name in aliases:
        return aliases[name]
    return name.lower().replace(' ', '-')


def build_book(book_name: str, bsb_df: pd.DataFrame, lexicon: dict[str, dict],
               strongs_prefix: str, book_id_table: dict[str, int],
               freq_counter: dict[str, int]) -> dict:
    """Emit alignment data + the set of lemma keys this book contributes.

    strongs_prefix is 'G' or 'H' to format the Strong's lookup key.
    book_id_table is NT_BOOK_IDS or OT_BOOK_IDS.

    Returns:
      { 'chapters': [(chapter, alignment_dict), ...], 'lemmas_used': set[str] }
    """
    book_id = book_id_table[book_name]
    book_df = bsb_df[bsb_df['ref'].astype(str).str.startswith(f'{book_name} ', na=False)]
    if book_df.empty:
        print(f'  WARN: no rows for {book_name}')
        return {'chapters': [], 'lemmas_used': set()}

    chapters: dict[int, dict[int, list]] = defaultdict(lambda: defaultdict(list))
    lemmas_used: set[str] = set()
    ref_re = re.compile(rf'^{re.escape(book_name)}\s+(\d+):(\d+)$')

    is_greek = strongs_prefix == 'G'
    for _, row in book_df.iterrows():
        m = ref_re.match(str(row['ref']))
        if not m:
            continue
        chapter = int(m.group(1))
        verse = int(m.group(2))
        strongs_num = row['strongs']
        if pd.isna(strongs_num):
            continue
        strongs = f'{strongs_prefix}{int(strongs_num):04d}'
        english = clean_english_surface(row['english'])
        if not english:
            continue

        entry = lexicon.get(strongs)
        if not entry:
            # No lexicon match — skip. Common only for textual variants where
            # BSB tags a token with a Strong's not in the brief lexicon.
            continue

        # Content-word filter (POS prefixes + lemma stoplist) — function words
        # and a small set of high-frequency auxiliary verbs are not marked
        # tappable. Same filter applies to Greek and Hebrew/Aramaic.
        if not is_content_pos(entry.get('pos_code', '')):
            continue
        lemma_key = slugify_translit(entry['translit'], is_greek=is_greek)
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


def write_lexicon(lexicons: list[dict[str, dict]], lemmas_used: set[str],
                  freq_counter: dict[str, int],
                  existing_path: Path | None = None) -> None:
    """Emit the global lemmas.json — one entry per unique lemma key seen
    across any built book, drawing data from any of the supplied lexicons
    (TBESG and/or TBESH). When merging an OT-only or NT-only run with an
    existing _lemmas.json, prior entries for the other testament are
    preserved so we never wipe NT lemmas during an OT-only rebuild.

    Each LexEntry's frequency field is named per its testament:
      - NT-only entries get `ntFrequency`
      - OT-only entries get `otFrequency`
      - A lemma seen in both books carries both fields
    """
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    # Build reverse index across all supplied lexicons: slug → (strongs, entry).
    # First match wins, with the constraint that Greek and Hebrew slugs rarely
    # collide (different transliteration conventions, different alphabets).
    # The slugify pass needs to know whether to apply the Greek breathing-mark
    # reorder; we detect from the Strong's prefix.
    slug_to_entry: dict[str, tuple[str, dict]] = {}
    for lex in lexicons:
        for strongs, entry in lex.items():
            is_greek = strongs.startswith('G')
            slug = slugify_translit(entry['translit'], is_greek=is_greek)
            if not slug or slug in slug_to_entry:
                continue
            slug_to_entry[slug] = (strongs, entry)

    # If updating in place, load the previous output so we don't drop entries
    # from the other testament during a partial rebuild.
    prior: dict[str, dict] = {}
    if existing_path and existing_path.exists():
        try:
            prior = json.loads(existing_path.read_text())
        except Exception:
            prior = {}

    # Pick the frequency field name based on which testament the entry's
    # Strong's number belongs to (G… vs H…).
    def freq_field(strongs: str) -> str:
        return 'ntFrequency' if strongs.startswith('G') else 'otFrequency'

    out: dict[str, dict] = dict(prior)
    skipped = 0
    written = 0
    for slug in sorted(lemmas_used):
        if slug not in slug_to_entry:
            skipped += 1
            continue
        strongs, entry = slug_to_entry[slug]
        existing = out.get(slug, {})
        # Preserve enriched fields when they exist (enrich.py adds rich
        # pastoral notes + pronunciation + semanticRange + related). Without
        # this guard, re-running build.py blows away an entire enrich.py
        # session — 4500 lemmas regressed silently the first time we hit it.
        # `notes` from build.py is the raw Abbott-Smith / TBESH definition;
        # only use it as a fallback when no enriched version exists.
        existing_notes = existing.get('notes', '')
        is_enriched_notes = existing_notes and len(existing_notes) > 120
        out[slug] = {
            **existing,
            'lemma': entry['lemma'],
            'translit': entry['translit'],
            'strongs': strongs,
            'pos': entry['pos'],
            'basicGloss': entry['gloss'],
            'loaded': existing.get('loaded', False),
            'notes': existing_notes if is_enriched_notes else entry['notes'],
            freq_field(strongs): freq_counter.get(slug, 0),
        }
        written += 1
    out_path = OUT_DIR / '_lemmas.json'
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2))
    rel = out_path.relative_to(OUT_DIR.parent.parent.parent.parent)
    print(f'\nWrote {len(out):,} lemmas total ({written} updated this run) to {rel}')
    if skipped:
        print(f'  ({skipped} lemmas in alignments had no lexicon match — skipped.)')


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

def _build_testament(books: list[str], language: str, book_id_table: dict[str, int],
                     strongs_prefix: str) -> tuple[set[str], dict[str, int],
                                                   dict[str, dict]]:
    """Run the ingest pipeline for one testament. Returns the set of lemma
    slugs used across all built books, the per-slug frequency counter, and
    the parsed lexicon for that testament (so write_lexicon can join them)."""
    csv = ensure_bsb_csv(language)
    lex_path = ensure_lexicon(language)
    print(f'\nLoading {language} data…')
    bsb = pd.read_csv(csv)
    lex = parse_tbe(lex_path, strongs_prefix)
    print(f'  BSB: {len(bsb):,} {language} tokens, lexicon: {len(lex):,} Strong\'s entries')

    lemmas_used: set[str] = set()
    freq_counter: dict[str, int] = {}

    print(f'\nBuilding {language} books…')
    for book in books:
        result = build_book(book, bsb, lex, strongs_prefix, book_id_table, freq_counter)
        if not result['chapters']:
            continue
        write_chapters(book, result['chapters'])
        lemmas_used |= result['lemmas_used']

    return lemmas_used, freq_counter, lex


def main() -> int:
    parser = argparse.ArgumentParser()
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument('--book', help='Single book name, e.g. "Philippians" or "Genesis"')
    g.add_argument('--all-nt', action='store_true', help='Build all 27 NT books')
    g.add_argument('--all-ot', action='store_true', help='Build all 39 OT books')
    g.add_argument('--all-bible', action='store_true',
                   help='Build both testaments (66 books total)')
    args = parser.parse_args()

    print('=== Lexicon ingest ===')

    # Decide which testaments + book list to build.
    runs: list[tuple[str, list[str], dict[str, int], str]] = []  # (language, books, ids, prefix)
    if args.book:
        if args.book in NT_BOOK_IDS:
            runs.append(('Greek', [args.book], NT_BOOK_IDS, 'G'))
        elif args.book in OT_BOOK_IDS:
            runs.append(('Hebrew', [args.book], OT_BOOK_IDS, 'H'))
        else:
            parser.error(
                f'Unknown book: {args.book!r}. Pick from NT '
                f'({", ".join(list(NT_BOOK_IDS)[:6])}, …) or OT '
                f'({", ".join(list(OT_BOOK_IDS)[:6])}, …).'
            )
    if args.all_nt or args.all_bible:
        runs.append(('Greek', list(NT_BOOK_IDS.keys()), NT_BOOK_IDS, 'G'))
    if args.all_ot or args.all_bible:
        runs.append(('Hebrew', list(OT_BOOK_IDS.keys()), OT_BOOK_IDS, 'H'))

    # Run each testament's ingest, then merge into one _lemmas.json.
    all_lemmas_used: set[str] = set()
    combined_freq: dict[str, int] = {}
    all_lexicons: list[dict[str, dict]] = []
    for language, books, ids, prefix in runs:
        lemmas_used, freq_counter, lex = _build_testament(books, language, ids, prefix)
        all_lemmas_used |= lemmas_used
        # Sum frequencies across runs (in case the same testament is built twice
        # via different flag combinations — defensive).
        for k, v in freq_counter.items():
            combined_freq[k] = combined_freq.get(k, 0) + v
        all_lexicons.append(lex)

    # Pass the existing _lemmas.json so partial rebuilds (e.g. --all-ot after
    # --all-nt has already run) preserve the other testament's entries.
    write_lexicon(all_lexicons, all_lemmas_used, combined_freq,
                  existing_path=OUT_DIR / '_lemmas.json')
    print('\nDone.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
