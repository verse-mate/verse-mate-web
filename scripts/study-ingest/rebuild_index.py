#!/usr/bin/env python3
"""
Rewrite the @versemate/studies index.ts from whatever <book-slug>-<chapter>.ts
files are present in ../../../verse-mate-studies/src/.

When the NT batch (or OT batch) lands 250+ chapter files via
batch_generate.py --collect, hand-editing the imports + key map is
infeasible. This script scans the directory, derives the const name
per file (matching the convention used by generate.py's write_ts),
sorts by canonical bookId + chapter, and writes a fresh index.ts.

Idempotent — safe to run any number of times. Diff against git to see
what changed.

Usage:
  ./rebuild_index.py             # rewrite @versemate/studies/src/index.ts
  ./rebuild_index.py --dry-run   # print what WOULD be written; don't touch the file
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generate import BOOK_SLUG_TO_ID, STUDIES_DIR  # noqa: E402

INDEX_PATH = STUDIES_DIR / 'index.ts'

# Match files named <slug>-<chapter>.ts in the studies dir. Slug may itself
# start with a digit (1-john, 2-corinthians) AND contain hyphens, so the
# chapter is everything after the LAST hyphen and must be all digits.
FILE_RE = re.compile(r'^(?P<slug>[a-z0-9][a-z0-9-]*?)-(?P<chapter>\d+)$')

# Skip these stems — they are part of the studies module but not chapter files.
SKIP_STEMS = {'index', 'types'}


def discover_chapters() -> list[tuple[int, int, str, str]]:
    """Scan STUDIES_DIR for <slug>-<chapter>.ts. Return tuples sorted by
    (bookId, chapter): (bookId, chapter, slug, const_name)."""
    out: list[tuple[int, int, str, str]] = []
    for path in sorted(STUDIES_DIR.glob('*.ts')):
        stem = path.stem
        if stem in SKIP_STEMS:
            continue
        m = FILE_RE.match(stem)
        if not m:
            print(f'  WARN: skipping {path.name} — does not match <slug>-<chapter>.ts', file=sys.stderr)
            continue
        slug = m.group('slug')
        chapter = int(m.group('chapter'))
        if slug not in BOOK_SLUG_TO_ID:
            print(f'  WARN: skipping {path.name} — unknown book slug "{slug}"', file=sys.stderr)
            continue
        book_id = BOOK_SLUG_TO_ID[slug]
        const_name = ts_const_name(slug, chapter)
        out.append((book_id, chapter, slug, const_name))
    out.sort()
    return out


def ts_const_name(slug: str, chapter: int) -> str:
    """Mirror generate.py's naming: 1-john + 2 → FIRST_JOHN_2_STUDY."""
    book_part = slug.upper().replace('-', '_')
    book_part = re.sub(r'^1_', 'FIRST_', book_part)
    book_part = re.sub(r'^2_', 'SECOND_', book_part)
    book_part = re.sub(r'^3_', 'THIRD_', book_part)
    return f'{book_part}_{chapter}_STUDY'


def render_index(chapters: list[tuple[int, int, str, str]]) -> str:
    """Build the full index.ts text."""
    imports = '\n'.join(
        f"import {{ {const_name} }} from './{slug}-{chapter}';"
        for (_book_id, chapter, slug, const_name) in chapters
    )
    map_entries = '\n'.join(
        f"  '{book_id}:{chapter}': {const_name},"
        for (book_id, chapter, _slug, const_name) in chapters
    )
    return f"""import {{ InductiveStudy }} from './types';
{imports}

const STUDIES: Record<string, InductiveStudy> = {{
{map_entries}
}};

/**
 * Look up the inductive study for a given book + chapter.
 * Returns null when no authored study exists for the chapter yet.
 * Keyed by `${{bookId}}:${{chapter}}`.
 */
export function getStudyFor(bookId: number, chapter: number): InductiveStudy | null {{
  return STUDIES[`${{bookId}}:${{chapter}}`] ?? null;
}}

export type {{ InductiveStudy }} from './types';
"""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true',
                        help='Print what would be written; do not touch the file')
    args = parser.parse_args()

    chapters = discover_chapters()
    if not chapters:
        print('No chapter files found.', file=sys.stderr)
        return 1

    text = render_index(chapters)
    print(f'Discovered {len(chapters)} chapter files across '
          f'{len(set(c[2] for c in chapters))} book(s).', file=sys.stderr)
    if args.dry_run:
        print('--- WOULD WRITE TO', INDEX_PATH, '---', file=sys.stderr)
        print(text)
        return 0
    INDEX_PATH.write_text(text)
    print(f'Wrote {INDEX_PATH} ({len(text):,} bytes)', file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
