#!/usr/bin/env python3
"""
Bulk-generate Versemate inductive studies via Anthropic's Batch API.
50% cheaper than synchronous; results within 24 hours (usually 1-3 for
a full NT). Same prompt construction as generate.py — imports its helpers
so the system prompt and gold examples stay in one place.

Workflow:
  # 1. Submit a batch
  ANTHROPIC_API_KEY=... ./batch_generate.py --submit --all-nt
  ANTHROPIC_API_KEY=... ./batch_generate.py --submit --books 1-john,2-john,3-john
  ANTHROPIC_API_KEY=... ./batch_generate.py --submit --book romans --chapters 1-16

  # 2. Check status
  ./batch_generate.py --check msgbatch_01ABC...

  # 3. When ended, download + write all TS files
  ./batch_generate.py --collect msgbatch_01ABC...

Batch IDs are also appended to .batches.log so you can find them later.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

import anthropic

# Reuse helpers from the synchronous script — keeps prompt logic single-sourced
sys.path.insert(0, str(Path(__file__).resolve().parent))
from generate import (  # noqa: E402
    BOOK_SLUG_TO_ID, BIBLE_API, STUDIES_DIR, MAX_TOKENS,
    SYSTEM_PROMPT, DEFAULT_MODEL,
    build_examples_block, build_user_prompt, extract_json, validate,
    fetch_chapter_text, load_lexicon, load_gold_example, load_secondary_example,
    write_ts,
)

HERE = Path(__file__).resolve().parent
BATCHES_LOG = HERE / '.batches.log'
RESULTS_DIR = HERE / '.batch-results'

NT_BOOKS = [
    'matthew', 'mark', 'luke', 'john', 'acts', 'romans',
    '1-corinthians', '2-corinthians', 'galatians', 'ephesians', 'philippians',
    'colossians', '1-thessalonians', '2-thessalonians', '1-timothy',
    '2-timothy', 'titus', 'philemon', 'hebrews', 'james', '1-peter', '2-peter',
    '1-john', '2-john', '3-john', 'jude', 'revelation',
]
OT_BOOKS = [
    'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy', 'joshua',
    'judges', 'ruth', '1-samuel', '2-samuel', '1-kings', '2-kings',
    '1-chronicles', '2-chronicles', 'ezra', 'nehemiah', 'esther', 'job',
    'psalms', 'proverbs', 'ecclesiastes', 'song-of-solomon', 'isaiah',
    'jeremiah', 'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos',
    'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai',
    'zechariah', 'malachi',
]


def fetch_book_chapter_count(book_id: int) -> int:
    """Hit /bible/books once per book to learn how many chapters it has.
    Cached across the script's run via the import-time loader below."""
    return _BOOK_CHAPTERS.get(book_id, 0)


_BOOK_CHAPTERS: dict[int, int] = {}


def load_all_book_metadata() -> None:
    """Fetch the full books list once and cache chapter counts per book."""
    global _BOOK_CHAPTERS
    if _BOOK_CHAPTERS:
        return
    import urllib.request
    with urllib.request.urlopen(f'{BIBLE_API}/bible/books') as resp:
        data = json.loads(resp.read())
    for b in data.get('books', []):
        _BOOK_CHAPTERS[b['bookId']] = len(b.get('chapters', []))


def existing_studies() -> set[str]:
    """Return the set of `<slug>__<chapter>` keys that already exist on disk
    (so we don't re-pay to regenerate). Uses `__` separator to match the
    Anthropic Batch API custom_id pattern `[a-zA-Z0-9_-]{1,64}` — colons
    aren't allowed."""
    out: set[str] = set()
    for path in STUDIES_DIR.glob('*-*.ts'):
        # Skip types.ts, index.ts
        name = path.stem
        if name in ('types', 'index'):
            continue
        # Match <slug>-<chapter> where slug may contain hyphens (1-john, 2-corinthians)
        m = path.stem.rsplit('-', 1)
        if len(m) == 2 and m[1].isdigit():
            out.add(f'{m[0]}__{m[1]}')
    return out


def build_requests(targets: list[tuple[str, int]], skip_existing: bool) -> list[dict]:
    """Build one Batch API request per (book_slug, chapter).
    custom_id format: '<slug>__<chapter>' (Batch API requires
    `^[a-zA-Z0-9_-]{1,64}$` — no colons) so collect() can map back."""
    examples_block = build_examples_block(load_gold_example(), load_secondary_example())
    have = existing_studies() if skip_existing else set()
    requests: list[dict] = []
    skipped = 0
    for slug, chapter in targets:
        key = f'{slug}__{chapter}'
        if key in have:
            skipped += 1
            continue
        book_id = BOOK_SLUG_TO_ID[slug]
        try:
            book_name, verses = fetch_chapter_text(book_id, chapter)
        except SystemExit as e:
            print(f'  WARN: skipping {key}: {e}', file=sys.stderr)
            continue
        lexicon = load_lexicon(slug, chapter)
        user_prompt = build_user_prompt(book_name, slug, chapter, verses, lexicon)
        requests.append({
            'custom_id': key,
            'params': {
                'model': DEFAULT_MODEL,
                'max_tokens': MAX_TOKENS,
                'system': [
                    {'type': 'text', 'text': SYSTEM_PROMPT},
                    {
                        'type': 'text',
                        'text': examples_block,
                        'cache_control': {'type': 'ephemeral'},
                    },
                ],
                'messages': [{'role': 'user', 'content': user_prompt}],
            },
        })
    if skipped:
        print(f'  Skipped {skipped} chapter(s) that already have a TS file '
              f'(use --no-skip-existing to regenerate).', file=sys.stderr)
    return requests


def estimate_cost(num_requests: int) -> str:
    """Rough cost estimate at Opus 4.7 Batch API pricing.
    Per call: ~$0.85 sync → ~$0.42 batch. Cache write on the first request only."""
    per_call = 0.42
    cache_write = 0.35  # one-time
    total = cache_write + per_call * num_requests
    return f'~${total:.2f}  (~${per_call:.2f}/chapter at Batch API + ${cache_write:.2f} cache write)'


def expand_targets(args) -> list[tuple[str, int]]:
    """Convert CLI args into a list of (slug, chapter) targets."""
    load_all_book_metadata()
    if args.all_nt:
        books = NT_BOOKS
    elif args.all_ot:
        books = OT_BOOKS
    elif args.books:
        books = [b.strip().lower() for b in args.books.split(',')]
    elif args.book:
        books = [args.book.lower()]
    else:
        raise SystemExit('Specify --all-nt, --all-ot, --books, or --book')

    targets: list[tuple[str, int]] = []
    for slug in books:
        if slug not in BOOK_SLUG_TO_ID:
            print(f'  WARN: unknown book slug "{slug}"', file=sys.stderr)
            continue
        book_id = BOOK_SLUG_TO_ID[slug]
        total_chapters = fetch_book_chapter_count(book_id)
        if args.chapters:
            # Format: "1-16" or "1,3,5" or "8"
            chapters = parse_chapter_range(args.chapters, total_chapters)
        else:
            chapters = list(range(1, total_chapters + 1))
        for c in chapters:
            targets.append((slug, c))
    return targets


def parse_chapter_range(spec: str, max_chapters: int) -> list[int]:
    """Parse '1-16' → [1..16], '1,3,5' → [1,3,5], '8' → [8]."""
    out: set[int] = set()
    for part in spec.split(','):
        part = part.strip()
        if '-' in part:
            lo, hi = part.split('-', 1)
            out.update(range(int(lo), int(hi) + 1))
        else:
            out.add(int(part))
    return sorted(c for c in out if 1 <= c <= max_chapters)


def cmd_submit(args) -> int:
    targets = expand_targets(args)
    print(f'[1/3] Building requests for {len(targets)} chapter(s)...', file=sys.stderr)
    requests = build_requests(targets, skip_existing=not args.no_skip_existing)
    if not requests:
        print('Nothing to submit (all targets already have TS files, or none found).', file=sys.stderr)
        return 0
    print(f'      {len(requests)} requests built. Estimated cost: {estimate_cost(len(requests))}',
          file=sys.stderr)

    if not args.yes:
        print('\nReview before submitting:', file=sys.stderr)
        for i, r in enumerate(requests[:5]):
            print(f'  - {r["custom_id"]}', file=sys.stderr)
        if len(requests) > 5:
            print(f'  ... and {len(requests) - 5} more', file=sys.stderr)
        ans = input('\nSubmit batch? [y/N] ').strip().lower()
        if ans != 'y':
            print('Aborted.', file=sys.stderr)
            return 0

    if not os.environ.get('ANTHROPIC_API_KEY'):
        print('ERROR: ANTHROPIC_API_KEY not set', file=sys.stderr)
        return 1

    print(f'[2/3] Submitting batch to Anthropic...', file=sys.stderr)
    client = anthropic.Anthropic()
    batch = client.messages.batches.create(requests=requests)
    print(f'[3/3] Batch submitted.', file=sys.stderr)
    print(f'      batch_id:           {batch.id}')
    print(f'      processing_status:  {batch.processing_status}')
    print(f'      requests submitted: {batch.request_counts.processing + batch.request_counts.succeeded + batch.request_counts.errored + batch.request_counts.canceled + batch.request_counts.expired}')

    # Log the batch for later reference
    with BATCHES_LOG.open('a') as f:
        f.write(f'{time.strftime("%Y-%m-%d %H:%M:%S")}  {batch.id}  {len(requests)} requests  '
                f'({",".join(sorted(set(t[0] for t in targets)))})\n')

    print(f'\nCheck status:   ./batch_generate.py --check {batch.id}', file=sys.stderr)
    print(f'Collect results: ./batch_generate.py --collect {batch.id}', file=sys.stderr)
    return 0


def cmd_check(batch_id: str) -> int:
    if not os.environ.get('ANTHROPIC_API_KEY'):
        print('ERROR: ANTHROPIC_API_KEY not set', file=sys.stderr)
        return 1
    client = anthropic.Anthropic()
    batch = client.messages.batches.retrieve(batch_id)
    c = batch.request_counts
    total = c.processing + c.succeeded + c.errored + c.canceled + c.expired
    print(f'batch_id:           {batch.id}')
    print(f'processing_status:  {batch.processing_status}')
    print(f'created_at:         {batch.created_at}')
    print(f'expires_at:         {batch.expires_at}')
    if batch.ended_at:
        print(f'ended_at:           {batch.ended_at}')
    print(f'requests:           {total} total')
    print(f'  processing:       {c.processing}')
    print(f'  succeeded:        {c.succeeded}')
    print(f'  errored:          {c.errored}')
    print(f'  canceled:         {c.canceled}')
    print(f'  expired:          {c.expired}')
    if batch.processing_status == 'ended':
        print(f'\nDownload + write TS files: ./batch_generate.py --collect {batch_id}', file=sys.stderr)
    return 0


def cmd_collect(batch_id: str) -> int:
    if not os.environ.get('ANTHROPIC_API_KEY'):
        print('ERROR: ANTHROPIC_API_KEY not set', file=sys.stderr)
        return 1
    client = anthropic.Anthropic()
    batch = client.messages.batches.retrieve(batch_id)
    if batch.processing_status != 'ended':
        print(f'Batch is {batch.processing_status} — wait for it to end before collecting.',
              file=sys.stderr)
        return 1

    RESULTS_DIR.mkdir(exist_ok=True)
    written = 0
    failed_parse = 0
    errored = 0
    summary_lines: list[str] = []

    print(f'Streaming results for {batch_id}...', file=sys.stderr)
    for result in client.messages.batches.results(batch_id):
        custom_id = result.custom_id
        if result.result.type != 'succeeded':
            errored += 1
            err_msg = getattr(result.result, 'error', None) or 'unknown'
            summary_lines.append(f'  ERROR  {custom_id}: {err_msg}')
            continue

        message = result.result.message
        raw = message.content[0].text
        # Save raw response so any parse failure is recoverable
        slug, chapter = custom_id.split('__')
        raw_path = RESULTS_DIR / f'{slug}-{chapter}.txt'
        raw_path.write_text(raw)

        try:
            study = extract_json(raw)
        except (ValueError, json.JSONDecodeError) as e:
            failed_parse += 1
            summary_lines.append(f'  PARSE  {custom_id}: {str(e).splitlines()[0]} '
                                  f'(raw at {raw_path.relative_to(HERE)})')
            continue

        expected_book_id = BOOK_SLUG_TO_ID[slug]
        errs = validate(study, expected_book_id, int(chapter))
        if errs:
            summary_lines.append(f'  WARN   {custom_id}: {len(errs)} validation issue(s)')

        out_path = STUDIES_DIR / f'{slug}-{chapter}.ts'
        write_ts(study, slug, int(chapter), out_path)
        written += 1
        if written % 25 == 0:
            print(f'  [{written}] wrote {out_path.name}', file=sys.stderr)

    print(f'\n=== Collection summary ===')
    print(f'  succeeded + written: {written}')
    print(f'  parse failed:        {failed_parse} (raw saved in {RESULTS_DIR.relative_to(HERE)}/, re-process with generate.py --from-saved)')
    print(f'  api errored:         {errored}')
    if summary_lines:
        print('\n=== Per-request issues ===')
        for line in summary_lines:
            print(line)
    return 0 if errored == 0 and failed_parse == 0 else 2


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest='cmd', required=False)

    # Implicit subcommand-like flags so users don't have to remember subcommand syntax
    parser.add_argument('--submit', action='store_true', help='Submit a new batch')
    parser.add_argument('--check', metavar='BATCH_ID', help='Check status of a batch')
    parser.add_argument('--collect', metavar='BATCH_ID', help='Download + write TS files for an ended batch')

    g = parser.add_argument_group('submit options')
    g.add_argument('--all-nt', action='store_true', help='Submit all 260 NT chapters')
    g.add_argument('--all-ot', action='store_true', help='Submit all 929 OT chapters')
    g.add_argument('--books', help='Comma-separated book slugs (e.g. romans,1-corinthians)')
    g.add_argument('--book', help='Single book slug')
    g.add_argument('--chapters', help='Chapter spec for --book: "1-16", "1,3,5", or "8"')
    g.add_argument('--no-skip-existing', action='store_true',
                   help='Re-generate even for chapters that already have a TS file')
    g.add_argument('--yes', '-y', action='store_true',
                   help='Skip the confirmation prompt before submitting')

    args = parser.parse_args()

    if args.check:
        return cmd_check(args.check)
    if args.collect:
        return cmd_collect(args.collect)
    if args.submit:
        return cmd_submit(args)
    parser.print_help()
    return 1


if __name__ == '__main__':
    sys.exit(main())
