#!/usr/bin/env python3
"""
Ingest open-licensed Bible translations from eBible.org into VerseMate's
Chapter JSON shape.

For each version in the curated registry below, this:
  1. Downloads the eBible USFM zip (cached in ./data/).
  2. Refuses anything whose licence is not freely redistributable
     (public domain, CC BY, or CC BY-SA — never NC / ND / permission-only).
  3. Parses USFM into the app's `Chapter` shape
     ({ book, bookId, chapter, verses:[{number,text}], subtitles? }),
     keeping the Protestant 66-book canon and skipping deuterocanon.
  4. Writes ./output/<key>/<bookId>/<chapter>.json plus a per-version
     manifest.json (metadata + attribution line) and a top-level index.json.

The output is staging data meant to be loaded into the VerseMate backend
(the /bible/book API serves the text); it is deliberately NOT bundled into
the web app and is git-ignored.

Usage:
  ./build.py --list                 # show the registry
  ./build.py --version LSG          # ingest one version
  ./build.py --all                  # ingest every redistributable version
  ./build.py --version SCH51 --from-zip ./data/deu1951_usfm.zip
  ./build.py --self-test            # parse a synthetic sample, no network

License posture: PD versions carry no obligations. CC BY / BY-SA versions
require the attribution line (see each manifest.json) in the app's credits
screen; BY-SA additionally means the generated JSON is share-alike.
"""
from __future__ import annotations

import argparse
import io
import json
import re
import sys
import urllib.request
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE / 'data'
OUT_DIR = HERE / 'output'
EBIBLE_URL = 'https://ebible.org/Scriptures/{id}_usfm.zip'

# ─────────────────────────────────────────────────────────────────────────
# Curated registry — the "best open version" per VerseMate language.
# `key` matches src/constants/bible-versions.ts. `license` is vetted against
# eBible's catalog (translations.csv + BibleNLP licences.tsv).
# ─────────────────────────────────────────────────────────────────────────
VERSIONS: list[dict] = [
    {'key': 'KJV',    'ebible_id': 'eng-kjv2006', 'language': 'en', 'title': 'King James (Authorized) Version', 'license': 'Public Domain', 'license_url': '', 'attribution': 'King James (Authorized) Version, 1769 Blayney edition. Public domain.'},
    {'key': 'SYN',    'ebible_id': 'russyn',    'language': 'ru', 'title': 'Синодальный перевод',          'license': 'Public Domain', 'license_url': '', 'attribution': 'Russian Synodal Translation (1876). Public domain.'},
    {'key': 'RVR09',  'ebible_id': 'spaRV1909', 'language': 'es', 'title': 'Reina Valera 1909',            'license': 'Public Domain', 'license_url': '', 'attribution': 'Santa Biblia Reina-Valera 1909. Public domain.'},
    {'key': 'LSG',    'ebible_id': 'fraLSG',    'language': 'fr', 'title': 'Louis Segond 1910',            'license': 'Public Domain', 'license_url': '', 'attribution': 'La Sainte Bible, Louis Segond 1910. Public domain.'},
    {'key': 'RIV',    'ebible_id': 'ita1927',   'language': 'it', 'title': 'Riveduta 1927',                'license': 'Public Domain', 'license_url': '', 'attribution': 'La Sacra Bibbia, Riveduta (Luzzi) 1927. Public domain.'},
    {'key': 'VDC',    'ebible_id': 'ron1924',   'language': 'ro', 'title': 'Biblia Cornilescu 1924',       'license': 'Public Domain', 'license_url': '', 'attribution': 'Biblia Dumitru Cornilescu 1924. Public domain.', 'transliterate': 'mol-cyrl-to-ron-latn'},
    {'key': 'UKRKL',  'ebible_id': 'ukr1871',   'language': 'uk', 'title': 'Переклад Куліша',              'license': 'Public Domain', 'license_url': '', 'attribution': 'Святе Письмо, переклад П. Куліша. Public domain.', 'expect': 'full'},
    {'key': 'SCH51',  'ebible_id': 'deu1951',   'language': 'de', 'title': 'Schlachter-Bibel 1951',        'license': 'CC BY 4.0',     'license_url': 'https://creativecommons.org/licenses/by/4.0/',    'attribution': 'Schlachter-Bibel 1951 © Genfer Bibelgesellschaft. CC BY 4.0.'},
    {'key': 'BLIV',   'ebible_id': 'porbr2018', 'language': 'pt', 'title': 'Bíblia Livre',                 'license': 'CC BY 3.0',     'license_url': 'https://creativecommons.org/licenses/by/3.0/br/', 'attribution': 'Bíblia Livre © 2018 Diego Santos, Mario Sérgio, Marco Teles. CC BY 3.0 BR.'},
    {'key': 'TGLULB', 'ebible_id': 'tglulb',    'language': 'tl', 'title': 'Banal na Bibliya (ULB)',       'license': 'CC BY-SA 4.0',  'license_url': 'https://creativecommons.org/licenses/by-sa/4.0/', 'attribution': 'Banal na Bibliya © 2018 Door43 World Missions Community. CC BY-SA 4.0.'},
    {'key': 'HCV',    'ebible_id': 'hincv',     'language': 'hi', 'title': 'हिंदी समकालीन संस्करण',          'license': 'CC BY-SA 4.0',  'license_url': 'https://creativecommons.org/licenses/by-sa/4.0/', 'attribution': 'Hindi Contemporary Version © Biblica, Inc. CC BY-SA 4.0.'},
]

# ─────────────────────────────────────────────────────────────────────────
# USFM book code → (bookId, English display name). Protestant 66 only;
# any other code (apocrypha, front/back matter) is skipped on ingest.
# ─────────────────────────────────────────────────────────────────────────
BOOKS: dict[str, tuple[int, str]] = {
    'GEN': (1, 'Genesis'), 'EXO': (2, 'Exodus'), 'LEV': (3, 'Leviticus'), 'NUM': (4, 'Numbers'),
    'DEU': (5, 'Deuteronomy'), 'JOS': (6, 'Joshua'), 'JDG': (7, 'Judges'), 'RUT': (8, 'Ruth'),
    '1SA': (9, '1 Samuel'), '2SA': (10, '2 Samuel'), '1KI': (11, '1 Kings'), '2KI': (12, '2 Kings'),
    '1CH': (13, '1 Chronicles'), '2CH': (14, '2 Chronicles'), 'EZR': (15, 'Ezra'), 'NEH': (16, 'Nehemiah'),
    'EST': (17, 'Esther'), 'JOB': (18, 'Job'), 'PSA': (19, 'Psalms'), 'PRO': (20, 'Proverbs'),
    'ECC': (21, 'Ecclesiastes'), 'SNG': (22, 'Song of Solomon'), 'ISA': (23, 'Isaiah'), 'JER': (24, 'Jeremiah'),
    'LAM': (25, 'Lamentations'), 'EZK': (26, 'Ezekiel'), 'DAN': (27, 'Daniel'), 'HOS': (28, 'Hosea'),
    'JOL': (29, 'Joel'), 'AMO': (30, 'Amos'), 'OBA': (31, 'Obadiah'), 'JON': (32, 'Jonah'),
    'MIC': (33, 'Micah'), 'NAM': (34, 'Nahum'), 'HAB': (35, 'Habakkuk'), 'ZEP': (36, 'Zephaniah'),
    'HAG': (37, 'Haggai'), 'ZEC': (38, 'Zechariah'), 'MAL': (39, 'Malachi'),
    'MAT': (40, 'Matthew'), 'MRK': (41, 'Mark'), 'LUK': (42, 'Luke'), 'JHN': (43, 'John'),
    'ACT': (44, 'Acts'), 'ROM': (45, 'Romans'), '1CO': (46, '1 Corinthians'), '2CO': (47, '2 Corinthians'),
    'GAL': (48, 'Galatians'), 'EPH': (49, 'Ephesians'), 'PHP': (50, 'Philippians'), 'COL': (51, 'Colossians'),
    '1TH': (52, '1 Thessalonians'), '2TH': (53, '2 Thessalonians'), '1TI': (54, '1 Timothy'),
    '2TI': (55, '2 Timothy'), 'TIT': (56, 'Titus'), 'PHM': (57, 'Philemon'), 'HEB': (58, 'Hebrews'),
    'JAS': (59, 'James'), '1PE': (60, '1 Peter'), '2PE': (61, '2 Peter'), '1JN': (62, '1 John'),
    '2JN': (63, '2 John'), '3JN': (64, '3 John'), 'JUD': (65, 'Jude'), 'REV': (66, 'Revelation'),
}

SECTION_RE = re.compile(r'^\\s[0-9]?$')
META_MARKERS = {
    '\\id', '\\ide', '\\usfm', '\\rem', '\\sts', '\\h', '\\toc1', '\\toc2', '\\toc3',
    '\\toca1', '\\toca2', '\\toca3', '\\mt', '\\mt1', '\\mt2', '\\mt3', '\\mte',
    '\\ms', '\\ms1', '\\mr', '\\mr1', '\\sr', '\\sp', '\\sd', '\\r', '\\d', '\\cl',
    '\\cp', '\\pb', '\\periph', '\\qa', '\\lit',
}


# ─────────────────────────────────────────────────────────────────────────
# Moldovan Cyrillic → Latin Romanian transliteration.
#
# eBible.org's `ron1924` (Biblia Cornilescu 1924) is published in Cyrillic
# script (the 1957 Moldovan SSR orthography). A Latin-script edition of the
# same translation is not on eBible.org, so to serve the Cornilescu text in
# the script Romanian readers actually expect we transliterate at ingest
# time. This is a deterministic letter-mapping with two positional rules
# (ы→î/â at edges, я/ю→ea/ia after consonant) plus a small override list
# for words where Cyrillic я is ambiguous between Latin "ea" and "ia".
# ─────────────────────────────────────────────────────────────────────────

_CYR_SINGLE = {
    'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v', 'Г': 'G', 'г': 'g',
    'Д': 'D', 'д': 'd', 'Е': 'E', 'е': 'e', 'Ж': 'J', 'ж': 'j', 'З': 'Z', 'з': 'z',
    'И': 'I', 'и': 'i', 'Й': 'I', 'й': 'i', 'К': 'C', 'к': 'c', 'Л': 'L', 'л': 'l',
    'М': 'M', 'м': 'm', 'Н': 'N', 'н': 'n', 'О': 'O', 'о': 'o', 'П': 'P', 'п': 'p',
    'Р': 'R', 'р': 'r', 'С': 'S', 'с': 's', 'Т': 'T', 'т': 't', 'У': 'U', 'у': 'u',
    'Ф': 'F', 'ф': 'f', 'Х': 'H', 'х': 'h', 'Ц': 'Ț', 'ц': 'ț', 'Ч': 'C', 'ч': 'c',
    'Ш': 'Ș', 'ш': 'ș', 'Щ': 'Șt', 'щ': 'șt', 'Ы': 'Î', 'ы': 'î', 'Ь': 'I', 'ь': 'i',
    'Ъ': 'Ă', 'ъ': 'ă', 'Э': 'Ă', 'э': 'ă', 'Ю': 'Iu', 'ю': 'iu', 'Я': 'Ia', 'я': 'ia',
    # Moldovan /dʒ/ — the soft g sound (Леӂя = Legea).
    'Ӂ': 'G', 'ӂ': 'g',
}

_CYR_BACK_VOWELS = set('аоуэыАОУЭЫ')
_CYR_CONSONANTS = set('бвгджзйклмнпрстфхцчшщӂБВГДЖЗЙКЛМНПРСТФХЦЧШЩӁ')
_CYR_VOWELS = set('аеёиоуыэюяАЕЁИОУЫЭЮЯ')
_CYR_SOFT_INSERT = {'ч': 'c', 'Ч': 'C', 'ӂ': 'g', 'Ӂ': 'G'}

# Override list — words where Cyrillic 'я' after a consonant maps to Latin
# 'ia' (not the default 'ea' the rule produces). Cornilescu 1924 spells
# these with 'ia' per Latin orthographic tradition; the Cyrillic source
# can't distinguish them since both /ia/ and /ea/ collapse onto 'я'.
_TRANSLIT_WORD_FIXES = {
    # 'a pieri' / 'a pierde' (perish/lose) family.
    'peară': 'piară', 'pearde': 'pierde', 'peardă': 'piardă',
    'pearzi': 'pierzi', 'pearzător': 'pierzător', 'pearzătoare': 'pierzătoare',
    'pearzare': 'pierzare', 'peardut': 'pierdut', 'peardută': 'pierdută',
    'peardem': 'pierdem', 'pearză': 'piardă', 'pear': 'pier', 'peari': 'pieri',
    'pearit': 'pierit',
    # 'viața' (life) and inflections.
    'veața': 'viața', 'veață': 'viață', 'veaței': 'vieții',
    'veețile': 'viețile', 'veețuiește': 'viețuiește', 'veețuiesc': 'viețuiesc',
    # 'piatră' (stone).
    'peatră': 'piatră', 'peatre': 'pietre', 'peatra': 'piatra', 'peatrei': 'pietrei',
    # 'piață' (market).
    'peață': 'piață', 'peațe': 'piețe', 'peața': 'piața',
    # 'piept' (chest), 'piele' (skin).
    'peept': 'piept', 'peeptul': 'pieptul', 'peeptului': 'pieptului',
    'peele': 'piele', 'peelea': 'pielea',
    # Capitalized variants for sentence-initial occurrences.
    'Peară': 'Piară', 'Pearde': 'Pierde', 'Peardă': 'Piardă',
    'Veața': 'Viața', 'Peatră': 'Piatră', 'Peață': 'Piață',
}

# Word-boundary fixes — Cyrillic source occasionally collapses two Latin
# words (e.g. "Кэча" = "Căci a"). Applied as multi-word substitutions
# after transliteration.
_TRANSLIT_PHRASE_FIXES = {
    # Doxology fragment: "Căci a Ta este împărăția" — typeset in Cyrillic
    # as a single chunk "Кэча Та", which transliterates to "Căcea Ta".
    'Căcea Ta': 'Căci a Ta',
}


def _translit_word(word: str) -> str:
    out: list[str] = []
    chars = list(word)
    n = len(chars)
    for i, ch in enumerate(chars):
        if ch == '':
            continue
        prev_cyr = chars[i - 1] if i > 0 else ''
        next_cyr = chars[i + 1] if i + 1 < n else ''

        # ы → î at word edges, â mid-word (1993 Romanian orthography).
        if ch in ('ы', 'Ы'):
            edge = (i == 0 or i == n - 1
                    or (prev_cyr not in _CYR_CONSONANTS and prev_cyr not in _CYR_VOWELS)
                    or (next_cyr not in _CYR_CONSONANTS and next_cyr not in _CYR_VOWELS))
            out.append(('Î' if edge else 'Â') if ch == 'Ы' else ('î' if edge else 'â'))
            continue

        # я → ea after consonant, ia after vowel/word-start. Same for ю→eu/iu.
        if ch in ('я', 'Я', 'ю', 'Ю'):
            after_cons = prev_cyr in _CYR_CONSONANTS
            mapping = {
                'я': ('ea', 'ia'), 'Я': ('Ea', 'Ia'),
                'ю': ('eu', 'iu'), 'Ю': ('Eu', 'Iu'),
            }
            out.append(mapping[ch][0] if after_cons else mapping[ch][1])
            continue

        # Word-final ч → "ci" (Romanian terminal -i pattern: кэч→căci).
        # ч + ь collapses to a single "ci" (both would otherwise emit "i").
        if ch in ('ч', 'Ч') and (
            next_cyr == ''
            or next_cyr in ('ь', 'Ь')
            or (next_cyr not in _CYR_VOWELS and next_cyr not in _CYR_CONSONANTS)
        ):
            out.append('Ci' if ch == 'Ч' else 'ci')
            if next_cyr in ('ь', 'Ь'):
                chars[i + 1] = ''  # consume so we don't double the "i"
            continue

        # ч/ӂ before back vowel а/о/у → cea/cio/ciu, gea/gio/giu.
        if ch in _CYR_SOFT_INSERT and next_cyr in _CYR_BACK_VOWELS:
            base = _CYR_SOFT_INSERT[ch]
            if next_cyr in ('а', 'А'):
                out.append(base + 'e')
            elif next_cyr in ('о', 'О', 'у', 'У'):
                out.append(base + 'i')
            else:
                out.append(base)
            continue

        out.append(_CYR_SINGLE.get(ch, ch))
    return ''.join(out)


def transliterate_mol_cyr_to_ron_latn(text: str) -> str:
    """Convert Moldovan-Cyrillic Romanian to Latin-script Romanian.

    Deterministic letter-mapping + positional rules; final pass applies a
    small word-level override list for known Cornilescu spellings where
    Cyrillic's collapsed 'я' (ea≅ia) doesn't pick the right Latin form.
    """

    def fix_one(tok: str) -> str:
        # Strip leading/trailing punctuation around the alphabetic core so
        # the override lookup matches the bare word ("peară" not "peară,").
        m = re.match(r'^(\W*)(.*?)(\W*)$', tok, flags=re.S)
        if not m:
            return _translit_word(tok)
        lead, core, trail = m.group(1), m.group(2), m.group(3)
        core_latin = _translit_word(core)
        core_latin = _TRANSLIT_WORD_FIXES.get(core_latin, core_latin)
        return f'{lead}{core_latin}{trail}'

    out = re.sub(r'\S+', lambda m: fix_one(m.group(0)), text)
    for k, v in _TRANSLIT_PHRASE_FIXES.items():
        out = out.replace(k, v)
    return out


TRANSLITERATORS = {
    'mol-cyrl-to-ron-latn': transliterate_mol_cyr_to_ron_latn,
}


def license_allows_redistribution(lic: str) -> bool:
    """True only for public-domain or CC BY / BY-SA (never NC, ND, or unknown)."""
    norm = lic.strip().lower()
    if 'public domain' in norm or norm in {'cc0', 'pd'}:
        return True
    if norm.startswith('cc by'):
        return 'nc' not in norm and 'nd' not in norm
    return False


def _strip_inline(s: str) -> str:
    """Remove notes/figures and unwrap inline character markers, keeping text."""
    # Paired markers whose *content* is dropped (footnotes, cross-refs, figures,
    # published/alternate verse & chapter numbers).
    for m in ('f', 'fe', 'x', 'fig', 'rq', 'vp', 'va', 'ca', 'fv', 'jmp'):
        s = re.sub(rf'\\{m}\b.*?\\{m}\*', '', s, flags=re.S)
    # \w word|lemma="x" strong="G1"\w*  → keep just the surface word.
    s = re.sub(r'\\\+?w\b\s*(.*?)\\\+?w\*',
               lambda m: m.group(1).split('|', 1)[0].strip(), s, flags=re.S)
    return s


def usfm_to_chapters(text: str) -> list[dict]:
    """Parse one USFM book into a list of Chapter dicts (canon books only)."""
    text = _strip_inline(text)
    tokens = re.split(r'(\\\+?[a-z0-9]+\*?)', text, flags=re.I)

    book_code: str | None = None
    display_name: str | None = None  # localized \h / \toc2 if present
    header_fallback: str | None = None
    chapters: list[dict] = []
    cur: dict | None = None
    verse: dict | None = None
    pending_subtitle: str | None = None

    expect = None  # one of: 'chapter', 'verse', 'header', 'subtitle'
    in_verse = False

    def finish_verse() -> None:
        nonlocal verse
        if cur is not None and verse is not None:
            verse['text'] = _clean_text(verse['text'])
            if verse['text']:
                cur['verses'].append({'number': verse['number'], 'text': verse['text']})
        verse = None

    for tok in tokens:
        if tok == '' or tok is None:
            continue
        is_marker = tok.startswith('\\')

        if is_marker:
            m = tok.rstrip('*')
            if m == '\\id':
                expect = 'header_id'
            elif m == '\\c':
                finish_verse()
                in_verse = False
                expect = 'chapter'
            elif m == '\\v':
                finish_verse()
                expect = 'verse'
            elif SECTION_RE.match(m):
                finish_verse()
                in_verse = False
                expect = 'subtitle'
                pending_subtitle = ''
            elif m in ('\\h', '\\toc2', '\\toc1'):
                expect = 'header'
            elif m in META_MARKERS:
                in_verse = False
                expect = None
            else:
                # Paragraph or unwrapped char marker — keep flowing text into
                # the current verse, don't change verse/chapter state.
                expect = None
            continue

        # tok is text content.
        if expect == 'header_id':
            book_code = tok.strip().split()[0].upper() if tok.strip() else None
            expect = None
        elif expect == 'chapter':
            mnum = re.match(r'\s*(\d+)', tok)
            if mnum:
                if book_code not in BOOKS:
                    cur = None
                else:
                    bid, eng = BOOKS[book_code]
                    cur = {
                        'book': display_name or header_fallback or eng,
                        'bookId': bid,
                        'chapter': int(mnum.group(1)),
                        'verses': [],
                        'subtitles': [],
                    }
                    chapters.append(cur)
            expect = None
        elif expect == 'verse':
            mnum = re.match(r'\s*(\d+)[\w-]*\s*(.*)$', tok, flags=re.S)
            if mnum and cur is not None:
                verse = {'number': int(mnum.group(1)), 'text': mnum.group(2)}
                in_verse = True
                if pending_subtitle:
                    cur['subtitles'].append({
                        'subtitle': _clean_text(pending_subtitle),
                        'start_verse': verse['number'],
                        'end_verse': verse['number'],
                    })
                    pending_subtitle = None
            expect = None
        elif expect == 'subtitle':
            pending_subtitle = (pending_subtitle or '') + tok
            expect = None
        elif expect == 'header':
            name = tok.strip()
            if name:
                if display_name is None:
                    display_name = name
                header_fallback = name
            expect = None
        elif in_verse and verse is not None:
            verse['text'] += tok
        # else: text outside any verse (titles, refs) — discard.

    finish_verse()
    _assign_subtitle_ranges(chapters)
    return chapters


def _assign_subtitle_ranges(chapters: list[dict]) -> None:
    for ch in chapters:
        subs = ch.get('subtitles') or []
        if not subs:
            ch.pop('subtitles', None)
            continue
        last_verse = ch['verses'][-1]['number'] if ch['verses'] else subs[-1]['start_verse']
        for i, sub in enumerate(subs):
            nxt = subs[i + 1]['start_verse'] - 1 if i + 1 < len(subs) else last_verse
            sub['end_verse'] = max(sub['start_verse'], nxt)


def _clean_text(t: str) -> str:
    t = re.sub(r'\\\S+', ' ', t)            # drop any stray markers
    t = re.sub(r'\s+', ' ', t).strip()
    t = re.sub(r'\s+([,.;:!?»])', r'\1', t)  # tidy space before punctuation
    return t


def _read_zip_files(zbytes: bytes) -> list[str]:
    out = []
    with zipfile.ZipFile(io.BytesIO(zbytes)) as zf:
        for name in zf.namelist():
            if name.lower().endswith(('.usfm', '.sfm', '.usx', '.txt')) and not name.endswith('/'):
                out.append(zf.read(name).decode('utf-8-sig', errors='replace'))
    return out


def _download(ebible_id: str) -> bytes:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    cache = DATA_DIR / f'{ebible_id}_usfm.zip'
    if cache.exists():
        return cache.read_bytes()
    url = EBIBLE_URL.format(id=ebible_id)
    print(f'  downloading {url}')
    req = urllib.request.Request(url, headers={'User-Agent': 'verse-mate-bible-ingest/1.0'})
    with urllib.request.urlopen(req, timeout=60) as resp:  # noqa: S310 (trusted host)
        data = resp.read()
    cache.write_bytes(data)
    return data


def ingest(version: dict, from_zip: str | None = None) -> dict:
    key, ebible_id, lic = version['key'], version['ebible_id'], version['license']
    if not license_allows_redistribution(lic):
        raise SystemExit(f'REFUSED {key}: licence "{lic}" is not redistributable.')

    zbytes = Path(from_zip).read_bytes() if from_zip else _download(ebible_id)
    chapters: list[dict] = []
    for usfm in _read_zip_files(zbytes):
        if '\\v' not in usfm:
            continue
        chapters.extend(usfm_to_chapters(usfm))

    # Apply per-version transliteration (e.g. VDC's Cyrillic-script source
    # is converted to Latin Romanian here). See TRANSLITERATORS above.
    translit_name = version.get('transliterate')
    if translit_name:
        if translit_name not in TRANSLITERATORS:
            raise SystemExit(f'{key}: unknown transliterate "{translit_name}"')
        fn = TRANSLITERATORS[translit_name]
        for ch in chapters:
            for v in ch['verses']:
                v['text'] = fn(v['text'])
            for sub in ch.get('subtitles') or []:
                sub['subtitle'] = fn(sub['subtitle'])
            if 'book' in ch and isinstance(ch['book'], str):
                ch['book'] = fn(ch['book'])

    vdir = OUT_DIR / key
    book_ids: set[int] = set()
    total_verses = 0
    for ch in chapters:
        book_ids.add(ch['bookId'])
        total_verses += len(ch['verses'])
        cdir = vdir / str(ch['bookId'])
        cdir.mkdir(parents=True, exist_ok=True)
        (cdir / f"{ch['chapter']}.json").write_text(
            json.dumps(ch, ensure_ascii=False, indent=2), encoding='utf-8')

    manifest = {
        'key': key, 'ebibleId': ebible_id, 'language': version['language'],
        'title': version['title'], 'license': lic, 'licenseUrl': version['license_url'],
        'attribution': version['attribution'], 'source': EBIBLE_URL.format(id=ebible_id),
        'bookCount': len(book_ids), 'chapterCount': len(chapters), 'verseCount': total_verses,
        'bookIds': sorted(book_ids),
    }
    vdir.mkdir(parents=True, exist_ok=True)
    (vdir / 'manifest.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'  {key}: {len(book_ids)} books, {len(chapters)} chapters, {total_verses} verses')
    return manifest


def write_index(manifests: list[dict]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / 'index.json').write_text(
        json.dumps({'versions': manifests}, ensure_ascii=False, indent=2), encoding='utf-8')


# ─────────────────────────────────────────────────────────────────────────
# Self-test: exercises the parser on a synthetic USFM sample (no network).
# ─────────────────────────────────────────────────────────────────────────
SAMPLE_USFM = r"""\id JON Jonah
\h Jonah
\toc2 Jonah
\mt1 The Book of Jonah
\c 1
\s1 Jonah Flees the LORD
\p
\v 1 Now the word of the \nd LORD\nd* came to \w Jonah|strong="H3124"\w* son of Amittai:\f + \fr 1:1 \ft a note that must vanish.\f*
\v 2-3 "Go to the great city of Nineveh," \add he said\add*, and Jonah ran.
\s1 Jonah's Prayer
\v 4 But the LORD sent a great wind.\x + \xo 1:4 \xt Ps 107:25\x*
\c 2
\v 1 From inside the fish Jonah prayed.
"""


def self_test() -> int:
    chapters = usfm_to_chapters(SAMPLE_USFM)
    print(json.dumps(chapters, ensure_ascii=False, indent=2))
    ok = True

    def check(cond: bool, msg: str) -> None:
        nonlocal ok
        print(('PASS' if cond else 'FAIL') + ': ' + msg)
        ok = ok and cond

    check(len(chapters) == 2, 'two chapters parsed')
    c1 = chapters[0]
    check(c1['book'] == 'Jonah', 'localized \\h header used as book name')
    check(c1['bookId'] == 32 and c1['chapter'] == 1, 'JON mapped to bookId 32, chapter 1')
    v1 = c1['verses'][0]
    check('LORD came to Jonah' in v1['text'], 'kept \\nd and \\w surface text')
    check('strong' not in v1['text'] and 'H3124' not in v1['text'], 'stripped \\w attributes')
    check('note that must vanish' not in v1['text'], 'dropped footnote content')
    check(c1['verses'][1]['number'] == 2, 'verse range 2-3 uses start number 2')
    check('he said' in c1['verses'][1]['text'], 'kept \\add inline text')
    check('Ps 107:25' not in c1['verses'][2]['text'], 'dropped cross-reference content')
    subs = c1.get('subtitles') or []
    check(len(subs) == 2, 'two section subtitles captured')
    check(subs[0] == {'subtitle': 'Jonah Flees the LORD', 'start_verse': 1, 'end_verse': 3},
          'first subtitle range spans v1–v3')
    check(subs[1]['start_verse'] == 4 and subs[1]['end_verse'] == 4,
          'second subtitle range resolves to v4')
    print('\n' + ('ALL PASSED' if ok else 'FAILURES PRESENT'))
    return 0 if ok else 1


def main() -> int:
    ap = argparse.ArgumentParser(description='Ingest open Bibles from eBible.org into VerseMate JSON.')
    ap.add_argument('--list', action='store_true', help='list the curated registry')
    ap.add_argument('--version', nargs='+', metavar='KEY', help='ingest these version key(s)')
    ap.add_argument('--all', action='store_true', help='ingest every redistributable version')
    ap.add_argument('--from-zip', metavar='PATH', help='use a local USFM zip (single --version)')
    ap.add_argument('--self-test', action='store_true', help='parse a synthetic sample and exit')
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    if args.list:
        for v in VERSIONS:
            gate = 'OK ' if license_allows_redistribution(v['license']) else 'BLK'
            print(f"  [{gate}] {v['key']:<7} {v['language']:<3} {v['ebible_id']:<10} {v['license']:<14} {v['title']}")
        return 0

    by_key = {v['key']: v for v in VERSIONS}
    if args.all:
        targets = list(VERSIONS)
    elif args.version:
        targets = []
        for k in args.version:
            if k not in by_key:
                ap.error(f'unknown version key: {k} (try --list)')
            targets.append(by_key[k])
    else:
        ap.error('specify --version KEY [KEY...], --all, --list, or --self-test')

    if args.from_zip and len(targets) != 1:
        ap.error('--from-zip requires exactly one --version')

    manifests = [ingest(v, from_zip=args.from_zip) for v in targets]
    write_index(manifests)
    print(f'\nWrote {len(manifests)} version(s) to {OUT_DIR}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
