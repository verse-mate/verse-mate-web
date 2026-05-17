#!/usr/bin/env python3
"""
Generate a Versemate-style inductive Bible study for one chapter.

Pulls chapter text from the production Bible API + the chapter's Greek
lexicon alignment, then calls Claude with the Versemate framework
encoded in the system prompt and the hand-authored 1 John 1 study as a
gold-standard one-shot example. Output is a JSON object matching the
InductiveStudy TypeScript type, which the script wraps as a TS file and
writes into the @versemate/studies sibling package at
../../verse-mate-studies/src/.

Usage:
  export ANTHROPIC_API_KEY=...
  ./generate.py --book 1-john --chapter 2
  ./generate.py --book romans --chapter 8 --model claude-sonnet-4-6
  ./generate.py --book 1-john --chapter 2 --dry-run    # prints prompts; no API call
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

import anthropic

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent  # verse-mate-web/
# Studies live in the @versemate/studies sibling package (../verse-mate-studies),
# shared by both the web app (Vite) and the React Native app (Expo Metro).
STUDIES_DIR = ROOT.parent / 'verse-mate-studies' / 'src'
LEXICON_DIR = ROOT / 'src' / 'data' / 'lexicon' / 'generated'
GOLD_STUDY_PATH = STUDIES_DIR / '1-john-1.ts'
SECONDARY_STUDY_PATH = STUDIES_DIR / 'james-1.ts'
BIBLE_API = 'https://api.versemate.org'

DEFAULT_MODEL = 'claude-opus-4-7'  # Highest quality for the pilot; tune downward later
# Opus 4.7 supports up to 32K output tokens. Dense chapters (Psalms, long
# epistles, the Gospels) regularly produce 18-25K tokens when the model
# matches the gold-standard depth — give it headroom rather than truncate
# mid-movement. Cost is per actual tokens used, not per max_tokens.
MAX_TOKENS = 32000

# Book-slug → canonical bookId (mirrors src/lib/bookSlugs.ts)
BOOK_SLUG_TO_ID: dict[str, int] = {
    'genesis': 1, 'exodus': 2, 'leviticus': 3, 'numbers': 4, 'deuteronomy': 5,
    'joshua': 6, 'judges': 7, 'ruth': 8, '1-samuel': 9, '2-samuel': 10,
    '1-kings': 11, '2-kings': 12, '1-chronicles': 13, '2-chronicles': 14,
    'ezra': 15, 'nehemiah': 16, 'esther': 17, 'job': 18, 'psalms': 19,
    'proverbs': 20, 'ecclesiastes': 21, 'song-of-solomon': 22, 'isaiah': 23,
    'jeremiah': 24, 'lamentations': 25, 'ezekiel': 26, 'daniel': 27,
    'hosea': 28, 'joel': 29, 'amos': 30, 'obadiah': 31, 'jonah': 32,
    'micah': 33, 'nahum': 34, 'habakkuk': 35, 'zephaniah': 36, 'haggai': 37,
    'zechariah': 38, 'malachi': 39, 'matthew': 40, 'mark': 41, 'luke': 42,
    'john': 43, 'acts': 44, 'romans': 45, '1-corinthians': 46,
    '2-corinthians': 47, 'galatians': 48, 'ephesians': 49, 'philippians': 50,
    'colossians': 51, '1-thessalonians': 52, '2-thessalonians': 53,
    '1-timothy': 54, '2-timothy': 55, 'titus': 56, 'philemon': 57,
    'hebrews': 58, 'james': 59, '1-peter': 60, '2-peter': 61, '1-john': 62,
    '2-john': 63, '3-john': 64, 'jude': 65, 'revelation': 66,
}


SYSTEM_PROMPT = """You are an expert biblical scholar producing Versemate-style inductive Bible study content for one chapter. You write at PhD level, addressing serious students. The output is rendered by a React app's Study panel, not as devotional reading.

# Methodology — Howard Hendricks' OIA (Observation / Interpretation / Application)

Three sections, in order:
- **Observation (~85% of effort)**: 9 inductive steps that surface what the text says
- **Interpretation (~10%)**: 4-6 movements that explain what it MEANS in author intent + canonical context
- **Application (~5%)**: questions (NEVER directives) that interpret the reader's life through Scripture

## Voice & register
- Direct, scholarly, no fluff. No clichés. No filler.
- NEVER taint Scripture with personal opinion — be true to the text.
- Cite specific verses. Chapter:verse references mandatory throughout.
- Quote NASB 1995. ESV as fallback only when NASB doesn't apply.
- Draw on Chuck Swindoll, Howard Hendricks, Charles Spurgeon, Tim Keller, Douglas Moo (Pillar NTC), Peter Davids (NIGTC), John Calvin, Jonathan Edwards, John Owen, D. A. Carson when genuinely relevant.

## Theological lens (must align)
Authority/inerrancy of Scripture; Trinity; total depravity; substitutionary atonement; salvation by grace through faith alone; imminent physical return; the local church; eternal security; bodily resurrection. Orthodox-evangelical only — never entertain heterodox/liberal readings.

When ORTHODOX commentators legitimately disagree (Reformed vs. classical Arminian on regeneration, premillennial vs. amillennial on Revelation, etc.), present both views fairly. When unorthodox readings exist (denial of resurrection, Christ-myth, etc.), ignore them.

# The 9 Observation steps (rigid order, fixed kinds)

Each step has a `number` (1-9), `kind` discriminator, `title`, and `summary`. Use the kinds shown below — do not invent new ones.

1. **Begin with prayer** (`kind: 'bullets'`) — `intro` paragraph + 3 items tagged POSTURE / EYES / WILL + `note` paragraph with chapter-level framing.

2. **Ask the 5 W's and an H** (`kind: 'qa'`) — six items in order: WHO / TO WHOM / WHEN / WHERE / WHY / HOW. Each `q` is a question, each `a` is the answer in 1-3 sentences with cited verses + cross-references.

   **For chapter 1 of any book**: use the standard book-orientation questions — the reader needs to learn the book before any chapter:
   - WHO: "Who wrote it?"
   - TO WHOM: "To whom is it written?"
   - WHEN: "When was it written?"
   - WHERE: "Where was the audience?" (or "Where was it written from?")
   - WHY: "Why was it written?"
   - HOW: "How does it teach (genre)?"

   **For chapters 2 and beyond**: do NOT repeat the book-orientation questions — the reader already has them from chapter 1. Instead, craft **chapter-specific** 5W/H questions tuned to what THIS chapter is doing: its main actor, its conflict, its argument, its place in the book's flow. The exact phrasing varies per chapter — invent questions that fit. Examples (don't copy verbatim; create ones that fit this chapter's distinctive content):
   - WHO: "Who is the chapter primarily about?" / "Whose conflict drives the chapter?" / "Who is the main actor?"
   - TO WHOM: "To whom does the author specifically address this chapter?" / "Which subgroup is in view?"
   - WHEN: "What time-marker does the chapter announce?" / "What stage of the story is this?"
   - WHERE: "Where does the action or conflict take place?" / "Where in the book's argument are we?"
   - WHY: "Why does the author write THIS chapter — its specific purpose within the book?"
   - HOW: "How does the chapter argue?" / "How does the chapter build its case?"

   The principle: chapter 1 orients the reader to the book; chapters 2+ probe each chapter's distinctive content. Repeating book-orientation questions across 5 chapters of the same book is wasteful and bores the reader.

3. **Mark key words and phrases** (`kind: 'keywords'`) — 8-12 keyword entries. For each:
   - `word`: English noun/verb
   - `greek`: English transliteration ONLY (e.g., "koinonia") — NEVER use Greek script in this field
   - `count`: EXACT integer occurrence count in this chapter. NEVER use `13+`, `~13`, ranges like `13-15`, or strings like `"13"`. Pick a single integer — if you must hedge, choose the lower bound. JSON does not accept hedged numbers and the file will fail to load.
   - `verses`: verse refs (e.g., "1:3 (×2), 6, 7")
   - `definition`: 1-2 sentence gloss — what the word means in CONTEXT, not just synonym

4. **Make lists** (`kind: 'lists'`) — 2-3 lists. Each has `title`, `columns: ['Verse', 'Truth']`, `rows: [{ref, truth}]`. Standard titles: "What [book/chapter] teaches about God", "What it teaches about [theme/Christ/the believer]".

5. **Watch for contrasts and comparisons** (`kind: 'contrasts'`) — 6-12 items. Each: `verses` (refs), `type` ('Contrast' | 'Comparison' | 'Metaphor'), `pairing` (1 sentence).

6. **Note expressions of time** (`kind: 'bullets'`) — 3-8 items with `tag` (verse ref) and `text`. Include a `note` about the chapter's temporal logic when relevant.

7. **Mark geographic locations** (`kind: 'bullets'`) — 1-5 items. If no explicit geography (common in epistles), describe the implied historical setting. Always include a `note`.

8. **Mark terms of conclusion** (`kind: 'bullets'`) — 3-6 items. Hinge words: "Therefore", "But", "For", "If", "Let", etc. that mark argument structure. Include a `note` summarizing rhetorical shape.

9. **Identify the chapter theme** (`kind: 'segments'`) — `themeHeadline` (one sentence using the text's own words) + 4-6 `segments` of `{title, body}`. Each segment is 4-7 sentences of prose explaining a thematic dimension.

# Interpretation movements (4-6, grouped by pericope)

Group the chapter into 4-6 movements that follow the argument structure (NOT verse-by-verse, but pericope-by-pericope). For each movement:
- `number`: 1-indexed
- `title`: MEANING-FIRST phrase (e.g., "Walking in the light — fellowship and the cleansing blood"). NEVER lead with Greek.
- `range`: verse range (e.g., "1:6-7")
- `excerpt`: short NASB 1995 quote that sets the movement
- `body`: 4-5 paragraphs of meaning-first exposition (markdown allowed). The LAST block MAY include a `> **Greek note.** ...` blockquote with English-transliterated Greek words IN *italics* (e.g., *koinonia*), with Greek script only when it genuinely sharpens meaning.

**Critical interpretation rules:**
- Lead with MEANING. Greek is a supplement, not the spine.
- Show argument flow: how the author moves from one point to the next.
- Cite cross-references when they confirm/expand (e.g., Romans 5:3-5 parallels James 1:2-4).
- Pull in real historical context (proto-Docetists, Jewish diaspora, Roman Caesar cult, etc.).
- Reformed/Arminian and other orthodox tensions: present both, don't pick.

# Application questions (5-9)

Each tied to a verse range. Phrase as QUESTIONS (never directives). Ask the reader to name SPECIFIC situations — relationships, choices, sins, weeks. Do NOT generalize. Use second-person ("I", "me") because the reader fills the question in.

# Output format

Return ONLY a JSON object matching this shape — no surrounding prose, no markdown code fences, no explanation. Use double-quoted JSON strings; escape internal quotes and use \\n for paragraph breaks within `body` strings.

```
{
  "bookId": <int>,
  "bookName": "<string>",
  "chapter": <int>,
  "title": "<string e.g. '1 John 2'>",
  "subtitle": "The Precept Method, Verse by Verse",
  "themeOneLine": "<one sentence theme in the text's own words>",
  "steps": [ <9 step objects in order> ],
  "interpretation": {
    "intro": "<paragraph>",
    "movements": [ <4-6 movement objects> ]
  },
  "application": {
    "intro": "<paragraph>",
    "questions": [ <5-9 {range, question} objects> ]
  }
}
```

Step kind shapes:

- prose: `{number, kind:'prose', title, summary, body}`
- qa:    `{number, kind:'qa', title, summary, items:[{tag, q, a}]}`
- keywords: `{number, kind:'keywords', title, summary, inventory:[{word, greek, count, verses, definition}]}`
- lists: `{number, kind:'lists', title, summary, lists:[{title, columns:[a,b], rows:[{ref, truth}]}]}`
- contrasts: `{number, kind:'contrasts', title, summary, items:[{verses, type, pairing}]}`
- bullets: `{number, kind:'bullets', title, summary, intro?, items:[{tag?, text}], note?}`
- segments: `{number, kind:'segments', title, summary, themeHeadline, segments:[{title, body}]}`

Match the depth, voice, structure, and theological seriousness of the gold-standard example below.
"""


# Module-level cache for the /bible/books response. The response carries
# ALL 66 books with full chapter text, so we want exactly ONE network call
# regardless of how many chapters we're generating in this process. Without
# this cache, batch_generate.py refetched per chapter (~5MB × 250 chapters
# = ~1GB downloaded for an NT batch submit).
_BIBLE_BOOKS_CACHE: list[dict] | None = None


def _get_all_books() -> list[dict]:
    global _BIBLE_BOOKS_CACHE
    if _BIBLE_BOOKS_CACHE is None:
        url = f'{BIBLE_API}/bible/books'
        with urllib.request.urlopen(url) as resp:
            data = json.loads(resp.read())
        _BIBLE_BOOKS_CACHE = data.get('books', [])
    return _BIBLE_BOOKS_CACHE


def fetch_chapter_text(book_id: int, chapter: int) -> tuple[str, list[dict]]:
    """Fetch NASB 1995 chapter text and book name from the production API.
    Returns (book_name, list of {verseId, text}). The /bible/books response
    is cached at module level, so calling this 250 times incurs ONE network
    round-trip, not 250."""
    books = _get_all_books()
    book = next((b for b in books if b.get('bookId') == book_id), None)
    if not book:
        raise SystemExit(f'Book id {book_id} not found in API response')
    chapters = book.get('chapters', [])
    ch = next((c for c in chapters if c.get('chapterId') == chapter), None)
    if not ch:
        raise SystemExit(f'Chapter {chapter} not found in {book["name"]}')
    verses = ch.get('verses', [])
    return book['name'], verses


def load_lexicon(book_slug: str, chapter: int) -> dict | None:
    """Load the pre-built lexicon alignment for this chapter, if present.
    Returns None for chapters that don't have one yet (OT mostly)."""
    path = LEXICON_DIR / f'{book_slug}-{chapter}.json'
    if not path.exists():
        return None
    return json.loads(path.read_text())


def load_gold_example() -> str:
    """Load the hand-authored 1 John 1 study as the one-shot quality target.
    Returned as TS source — the model parses it inline."""
    return GOLD_STUDY_PATH.read_text()


def load_secondary_example() -> str:
    """Load James 1 as a secondary example showing the same shape across books."""
    return SECONDARY_STUDY_PATH.read_text()


def build_examples_block(gold_example: str, secondary_example: str) -> str:
    """Gold-standard examples — constant across all runs, included in the
    cached system block."""
    return f"""# Gold-standard example #1 (hand-authored 1 John 1, by Andy)

Match this depth, voice, and structure. The file is TypeScript; the JSON
you produce reflects the same data (drop the `export const ... = ` wrapper
and the final semicolon — just the object literal converted to JSON).

```ts
{gold_example}
```

# Gold-standard example #2 (hand-authored James 1)

Same framework applied to a different book. The 9 observation steps stay
rigid while the content responds to the chapter.

```ts
{secondary_example}
```
"""


def build_user_prompt(
    book_name: str,
    book_slug: str,
    chapter: int,
    verses: list[dict],
    lexicon: dict | None,
) -> str:
    verse_lines = '\n'.join(f'{v["verseId"]}. {v["text"]}' for v in verses)
    lex_block = json.dumps(lexicon, indent=2) if lexicon else '(no pre-aligned lexicon for this chapter)'
    if chapter == 1:
        step2_note = (
            f'**Step 2 (5 W/H) note**: This IS chapter 1 of {book_name}. '
            f'Use the standard book-orientation questions per the system prompt '
            f'(Who wrote it / To whom / When / Where / Why / Genre).'
        )
    else:
        step2_note = (
            f'**Step 2 (5 W/H) note**: This is chapter {chapter} of {book_name}, NOT chapter 1. '
            f'Do NOT use the book-orientation questions (those go in chapter 1). Craft '
            f'**chapter-specific** 5 W/H questions tuned to what {book_name} {chapter} '
            f'distinctively does — its main actor, its conflict, its argument, its place '
            f'in the book\'s flow.'
        )
    return f"""# Generate the study for {book_name} {chapter}

{step2_note}

## Chapter text (NASB 1995)

{verse_lines}

## Pre-aligned Greek lexicon for this chapter

These lemmas have already been aligned to the chapter via the existing
lexicon pipeline. Use these EXACT lemma transliterations and verse
occurrence counts in your `keywords` step — do NOT invent or recount.

```json
{lex_block}
```

## Output

Return ONLY the JSON object — no prose around it, no code fences. Set:
- `bookId`: {BOOK_SLUG_TO_ID[book_slug]}
- `bookName`: "{book_name}"
- `chapter`: {chapter}
- `title`: "{book_name} {chapter}"
- `subtitle`: "The Precept Method, Verse by Verse"

Begin the JSON immediately with `{{`.
"""


def call_anthropic(client: anthropic.Anthropic, model: str,
                   examples_block: str, user_prompt: str) -> tuple[str, dict, str]:
    """Call the model with streaming (required by the SDK for max_tokens
    above 8192 since those calls may exceed the 10-min HTTP timeout).
    Caches both the methodology system prompt AND the gold examples block —
    constant across all chapters, so subsequent NT/Bible-scale runs pay
    only $1.50/M for the cached portion instead of $15/M.

    Returns (text, usage, stop_reason). stop_reason is 'end_turn' on a
    clean finish or 'max_tokens' if the model hit the output cap mid-
    generation — in which case the caller should bump MAX_TOKENS."""
    with client.messages.stream(
        model=model,
        max_tokens=MAX_TOKENS,
        system=[
            {'type': 'text', 'text': SYSTEM_PROMPT},
            {
                'type': 'text',
                'text': examples_block,
                'cache_control': {'type': 'ephemeral'},
            },
        ],
        messages=[{'role': 'user', 'content': user_prompt}],
    ) as stream:
        # Drain the stream — we don't need per-chunk handling for this
        # use case (the script writes the file in one shot at the end).
        # Show a heartbeat every ~1K output tokens so the user sees
        # progress during long generations.
        chars_seen = 0
        last_heartbeat = 0
        for text_chunk in stream.text_stream:
            chars_seen += len(text_chunk)
            if chars_seen - last_heartbeat >= 4000:
                print(f'      ...{chars_seen:,} chars streamed', file=sys.stderr)
                last_heartbeat = chars_seen
        final = stream.get_final_message()
    text = final.content[0].text
    usage = {
        'input_tokens': final.usage.input_tokens,
        'output_tokens': final.usage.output_tokens,
        'cache_read_input_tokens': getattr(final.usage, 'cache_read_input_tokens', 0),
        'cache_creation_input_tokens': getattr(final.usage, 'cache_creation_input_tokens', 0),
    }
    return text, usage, final.stop_reason


def repair_json(s: str) -> str:
    """Apply conservative regex repairs for the most common model JSON
    mistakes. Each pattern is chosen so it cannot match anything in legal
    JSON — so this is safe to run unconditionally.
      * `"count": 13+,`     → `"count": 13,`   (model's hedge for "at least N")
      * `"count": ~13,`     → `"count": 13,`   (model's approximation)
      * `[1, 2, 3,]`        → `[1, 2, 3]`      (trailing comma in array)
      * `{"k": 1,}`         → `{"k": 1}`       (trailing comma in object)
      * `chapter\\u's`      → `chapter's`     (broken \\u escape — model
                                                typo where \\u is not
                                                followed by 4 hex digits;
                                                drop the bad sequence)
    """
    # Strip `+` immediately after a number (only matches when followed by
    # non-digit, so `1e+5` exponent notation is preserved).
    s = re.sub(r'(\d)\+(?=\D)', r'\1', s)
    # Strip `~` immediately before a number in a value position (after `: `).
    s = re.sub(r'(:\s*)~(\d)', r'\1\2', s)
    # Trailing commas in arrays and objects.
    s = re.sub(r',(\s*[\]\}])', r'\1', s)
    # Broken \u escapes (\u not followed by exactly 4 hex digits) — drop
    # the \u; keep whatever followed. JSON has no other \u-prefixed escape,
    # so this regex can't damage valid input.
    s = re.sub(r'\\u(?![0-9A-Fa-f]{4})', '', s)
    return s


def extract_json(raw: str) -> dict:
    """The model is told to return JSON only, but be defensive. Strip code
    fences and surrounding prose, then try parsing with progressively more
    lenient strategies before giving up:
      1. Strict json.loads — happy path.
      2. After repair_json — fixes common model mistakes (count: 13+, etc.)
      3. strict=False — accepts control chars (real newlines) inside strings,
         which models sometimes emit in multi-paragraph `body` fields.
      4. Repair + strict=False — both fixes combined.
      5. json-repair library — recovers from unescaped `"` inside strings
         (the dominant model failure on dialogue-heavy OT chapters). Heavy
         hammer; do this last so cleaner inputs use the standard parser."""
    s = raw.strip()
    s = re.sub(r'^```(?:json)?\s*', '', s)
    s = re.sub(r'\s*```\s*$', '', s)
    if not s.startswith('{'):
        start = s.find('{')
        if start == -1:
            raise ValueError('No JSON object found in response')
        s = s[start:]
    if not s.endswith('}'):
        end = s.rfind('}')
        if end == -1:
            raise ValueError('JSON object not closed in response')
        s = s[: end + 1]
    for label, body, strict in [
        ('strict', s, True),
        ('repaired', repair_json(s), True),
        ('strict=False', s, False),
        ('repaired + strict=False', repair_json(s), False),
    ]:
        try:
            return json.loads(body, strict=strict)
        except json.JSONDecodeError as e:
            last_err = e
            last_body = body
    # Last resort: json-repair library. Handles unescaped quotes inside
    # strings (the systematic failure on dialogue/poetry chapters where
    # the model embeds Bible quotes without escaping).
    try:
        from json_repair import repair_json as jr_repair
        result = jr_repair(s, return_objects=True)
        if isinstance(result, dict):
            return result
    except Exception:
        pass
    # All strategies failed — show ~10 lines of context around the last
    # failure so we know what to fix next.
    lines = last_body.split('\n')
    ln = last_err.lineno - 1
    lo, hi = max(0, ln - 5), min(len(lines), ln + 6)
    ctx = '\n'.join(f'{i+1:4}: {lines[i]}' for i in range(lo, hi))
    raise ValueError(
        f'JSON parse failed at line {last_err.lineno} col {last_err.colno}: {last_err.msg}\n'
        f'Context (±5 lines):\n{ctx}'
    ) from last_err


def validate(study: dict, expected_book_id: int, expected_chapter: int) -> list[str]:
    """Light schema validation. Returns list of error strings (empty if OK)."""
    errs: list[str] = []
    if study.get('bookId') != expected_book_id:
        errs.append(f"bookId mismatch: got {study.get('bookId')}, expected {expected_book_id}")
    if study.get('chapter') != expected_chapter:
        errs.append(f"chapter mismatch: got {study.get('chapter')}, expected {expected_chapter}")
    steps = study.get('steps', [])
    if len(steps) != 9:
        errs.append(f"expected 9 observation steps, got {len(steps)}")
    expected_kinds_by_step = {
        1: 'bullets', 2: 'qa', 3: 'keywords', 4: 'lists',
        5: 'contrasts', 6: 'bullets', 7: 'bullets', 8: 'bullets', 9: 'segments',
    }
    for s in steps:
        n = s.get('number')
        if n in expected_kinds_by_step and s.get('kind') != expected_kinds_by_step[n]:
            errs.append(f"step {n}: expected kind '{expected_kinds_by_step[n]}', got '{s.get('kind')}'")
    interp = study.get('interpretation', {})
    if not interp.get('movements'):
        errs.append('interpretation.movements is missing or empty')
    app = study.get('application', {})
    if not app.get('questions'):
        errs.append('application.questions is missing or empty')
    return errs


def ts_const_name(book_slug: str, chapter: int) -> str:
    """js identifier: 1-john + 2 → FIRST_JOHN_2_STUDY"""
    book_part = book_slug.upper().replace('-', '_')
    book_part = re.sub(r'^1_', 'FIRST_', book_part)
    book_part = re.sub(r'^2_', 'SECOND_', book_part)
    book_part = re.sub(r'^3_', 'THIRD_', book_part)
    return f'{book_part}_{chapter}_STUDY'


def write_ts(study: dict, book_slug: str, chapter: int, out_path: Path) -> None:
    """Wrap the validated JSON object as a TS file with `export const NAME: InductiveStudy = {...}`."""
    name = ts_const_name(book_slug, chapter)
    # json.dumps gives us valid JSON, which is also valid JS object-literal
    # syntax for this content (no Date, no undefined, no functions). Pretty-
    # print with 2-space indent matching the existing TS files.
    body = json.dumps(study, indent=2, ensure_ascii=False)
    header = (
        f'import {{ InductiveStudy }} from \'./types\';\n\n'
        f'// AI-generated inductive study for {study["bookName"]} {chapter}.\n'
        f'// Generated by scripts/study-ingest/generate.py — review before relying.\n\n'
        f'export const {name}: InductiveStudy = '
    )
    out_path.write_text(header + body + ';\n')


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--book', required=True, help='Book slug, e.g. 1-john')
    parser.add_argument('--chapter', type=int, required=True, help='Chapter number')
    parser.add_argument('--model', default=DEFAULT_MODEL,
                        help=f'Anthropic model (default: {DEFAULT_MODEL})')
    parser.add_argument('--output', type=Path,
                        help='Output path (default: ../verse-mate-studies/src/<book>-<chapter>.ts)')
    parser.add_argument('--dry-run', action='store_true',
                        help='Print prompt sizes; do not call API; do not write')
    parser.add_argument('--from-saved', action='store_true',
                        help='Re-parse the last saved API response without making a new API call. '
                             'Useful when the response was good but parsing tripped — iterate the '
                             'parser without re-paying.')
    args = parser.parse_args()

    book_slug = args.book.lower()
    if book_slug not in BOOK_SLUG_TO_ID:
        print(f'ERROR: unknown book slug "{book_slug}"', file=sys.stderr)
        return 1
    book_id = BOOK_SLUG_TO_ID[book_slug]

    if not args.dry_run and not os.environ.get('ANTHROPIC_API_KEY'):
        print('ERROR: ANTHROPIC_API_KEY not set. Run as:', file=sys.stderr)
        print(f'  ANTHROPIC_API_KEY=sk-ant-... ./generate.py --book {book_slug} --chapter {args.chapter}',
              file=sys.stderr)
        return 1

    print(f'[1/5] Fetching chapter text for {book_slug} {args.chapter}...', file=sys.stderr)
    book_name, verses = fetch_chapter_text(book_id, args.chapter)
    print(f'      {book_name} {args.chapter} — {len(verses)} verses', file=sys.stderr)

    print(f'[2/5] Loading lexicon alignment...', file=sys.stderr)
    lexicon = load_lexicon(book_slug, args.chapter)
    print(f'      lexicon: {"loaded" if lexicon else "none (chapter not yet aligned)"}', file=sys.stderr)

    print(f'[3/5] Loading gold-standard examples...', file=sys.stderr)
    gold = load_gold_example()
    secondary = load_secondary_example()
    examples_block = build_examples_block(gold, secondary)

    user_prompt = build_user_prompt(book_name, book_slug, args.chapter, verses, lexicon)
    sys_chars = len(SYSTEM_PROMPT)
    ex_chars = len(examples_block)
    user_chars = len(user_prompt)
    print(f'      system instructions: {sys_chars:,} chars (~{sys_chars // 4:,} tokens, cached)', file=sys.stderr)
    print(f'      examples block:      {ex_chars:,} chars (~{ex_chars // 4:,} tokens, cached)', file=sys.stderr)
    print(f'      user prompt:         {user_chars:,} chars (~{user_chars // 4:,} tokens)', file=sys.stderr)

    if args.dry_run:
        print('[dry-run] Skipping API call. To run for real:', file=sys.stderr)
        print(f'  ANTHROPIC_API_KEY=sk-ant-... ./generate.py --book {book_slug} --chapter {args.chapter}',
              file=sys.stderr)
        return 0

    saved_path = HERE / f'.last-response-{book_slug}-{args.chapter}.txt'

    if args.from_saved:
        if not saved_path.exists():
            print(f'ERROR: --from-saved given but {saved_path.name} does not exist.', file=sys.stderr)
            return 1
        print(f'[4/5] Reading saved response from {saved_path.name}...', file=sys.stderr)
        raw = saved_path.read_text()
    else:
        print(f'[4/5] Calling {args.model} (max_tokens={MAX_TOKENS})...', file=sys.stderr)
        client = anthropic.Anthropic()
        raw, usage, stop_reason = call_anthropic(client, args.model, examples_block, user_prompt)
        print(f'      tokens: in={usage["input_tokens"]:,} out={usage["output_tokens"]:,} '
              f'cache_read={usage["cache_read_input_tokens"]:,} '
              f'cache_write={usage["cache_creation_input_tokens"]:,} '
              f'stop_reason={stop_reason}',
              file=sys.stderr)
        # Always save raw response BEFORE attempting to parse — if parsing
        # fails we want to recover the spent API call, not throw it away.
        saved_path.write_text(raw)
        print(f'      saved raw response to {saved_path.name}', file=sys.stderr)
        if stop_reason == 'max_tokens':
            print(f'ERROR: model hit max_tokens={MAX_TOKENS} mid-generation — output truncated.',
                  file=sys.stderr)
            print(f'       Bump MAX_TOKENS in generate.py or tighten the system prompt to '
                  f'cap movement body length.', file=sys.stderr)
            return 2

    try:
        study = extract_json(raw)
    except (ValueError, json.JSONDecodeError) as e:
        print(f'ERROR: failed to parse JSON from response:\n{e}', file=sys.stderr)
        print(f'Raw response saved at {saved_path}. Once the parser is fixed, '
              f're-run with --from-saved (no API charge).', file=sys.stderr)
        return 2

    errs = validate(study, book_id, args.chapter)
    if errs:
        print(f'WARNING: validation found {len(errs)} issue(s):', file=sys.stderr)
        for e in errs:
            print(f'  - {e}', file=sys.stderr)

    out_path = args.output or (STUDIES_DIR / f'{book_slug}-{args.chapter}.ts')
    write_ts(study, book_slug, args.chapter, out_path)
    print(f'[5/5] Wrote {out_path.relative_to(ROOT)} ({out_path.stat().st_size:,} bytes)', file=sys.stderr)
    if errs:
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())
