"""Probe Precept Austin's per-chapter chart images.

For each book covered by ingest_precept.py, this script tries every
plausible chapter URL pattern Precept Austin uses, collects every
preceptaustin-hosted <img> on each chapter page, and writes a per-book
JSON map.

Why so many URL patterns?
  - Matthew uses hyphens:        /matthew-5-commentary
  - Daniel uses underscores:     /daniel_5_commentary
  - Long chapters fan out:       /daniel_7_commentary1, _commentary2, _commentary3
  - Some chapters get split into verse-range pages we ignore here.

What this script DOES:
  - Fetches each candidate URL with browser-like UA.
  - Records every preceptaustin.org image src on each successful page.
  - Tags each image filename with how many chapters it appeared on, so
    book-level charts that get reused on every chapter page are easy
    to filter out from chapter-specific ones.

What this script does NOT:
  - Download any images. Discovery only.
  - Parse verse-level URLs (those are way too granular for the Visuals tab).

Usage:
  python3 scripts/visuals-ingest/probe_precept_chapters.py --all
  python3 scripts/visuals-ingest/probe_precept_chapters.py daniel matthew james
"""
from __future__ import annotations

import json
import sys
import time
import urllib.parse
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT_PATH = HERE / "probe_precept_chapters.json"

from ingest_precept import PRECEPT_CHARTS  # type: ignore

# Browser-ish UA — preceptaustin returns 403 for terse UAs.
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36 VerseMate-probe/1.0")
PRECEPT_HOST = "www.preceptaustin.org"

# Canonical Protestant chapter counts for all 66 books. We probe every
# book — even the ones without a book-level Precept chart (in
# ingest_precept.PRECEPT_CHARTS) — because a book missing a *book*-level
# chart can still have valuable *chapter*-level charts on Precept Austin.
CHAPTERS_PER_BOOK = {
    # Old Testament
    "genesis": 50, "exodus": 40, "leviticus": 27, "numbers": 36,
    "deuteronomy": 34, "joshua": 24, "judges": 21, "ruth": 4,
    "1-samuel": 31, "2-samuel": 24, "1-kings": 22, "2-kings": 25,
    "1-chronicles": 29, "2-chronicles": 36, "ezra": 10, "nehemiah": 13,
    "esther": 10, "job": 42, "psalms": 150, "proverbs": 31,
    "ecclesiastes": 12, "song-of-solomon": 8, "isaiah": 66, "jeremiah": 52,
    "lamentations": 5, "ezekiel": 48, "daniel": 12,
    "hosea": 14, "joel": 3, "amos": 9, "obadiah": 1, "jonah": 4,
    "micah": 7, "nahum": 3, "habakkuk": 3, "zephaniah": 3, "haggai": 2,
    "zechariah": 14, "malachi": 4,
    # New Testament
    "matthew": 28, "mark": 16, "luke": 24, "john": 21, "acts": 28,
    "romans": 16, "1-corinthians": 16, "2-corinthians": 13,
    "galatians": 6, "ephesians": 6, "philippians": 4, "colossians": 4,
    "1-thessalonians": 5, "2-thessalonians": 3, "1-timothy": 6,
    "2-timothy": 4, "titus": 3, "philemon": 1, "hebrews": 13, "james": 5,
    "1-peter": 5, "2-peter": 3, "1-john": 5, "2-john": 1, "3-john": 1,
    "jude": 1, "revelation": 22,
}


def candidates(slug: str, chapter: int) -> list[str]:
    """URL patterns we'll try for a given book/chapter. First hit wins.

    Kept short to bound the worst-case (every-pattern-404) chapter cost
    on books Precept Austin doesn't cover. The 4 patterns here matched
    every chapter we manually verified during initial probing; long-tail
    `_commentary1`/`_commentary2` variants link to from the index even
    when the chapter base URL works, so we don't need to try them."""
    underscored = slug.replace("-", "_")
    base = f"https://{PRECEPT_HOST}"
    return [
        f"{base}/{underscored}_{chapter}_commentary",
        f"{base}/{slug}-{chapter}-commentary",
        f"{base}/{underscored}_{chapter}",
        f"{base}/{slug}-{chapter}",
    ]


class ImgExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.srcs: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "img":
            return
        for k, v in attrs:
            if k == "src" and v:
                self.srcs.append(v)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    # 12s is enough — preceptaustin responds in well under a second on
    # the happy path and the 404 path is even faster. Tightening this
    # keeps the worst-case run time bounded on books with no coverage.
    with urllib.request.urlopen(req, timeout=12) as resp:
        raw = resp.read()
    return raw.decode("utf-8", errors="replace")


def normalize(href: str, base: str) -> str:
    return urllib.parse.urljoin(base, href).split("#", 1)[0]


# Decorative share-button icons embedded on every Precept page footer.
# We filter these out at probe-time so the per-book counts aren't
# polluted on books where some chapters 404 (which breaks the
# "appears on every chapter ⇒ ignore" heuristic).
NOISE_FILENAMES = frozenset({
    "facebook.jpg", "facebook.png", "twitter.jpg", "twitter.png",
    "wordpress.jpg", "wordpress2.jpg", "wordpress.png",
    "pdf.jpg", "pdf2.jpg", "pdf.png",
    "instagram.jpg", "instagram.png", "youtube.jpg", "youtube.png",
    "rss.png", "rss.jpg", "email.png", "email.jpg",
    "print.png", "print.jpg",
})


def is_precept_image(url: str) -> bool:
    parsed = urllib.parse.urlparse(url)
    if parsed.netloc and parsed.netloc != PRECEPT_HOST:
        return False
    path = parsed.path.lower()
    if "/files/images/" not in path and "/sites/default/files/images/" not in path:
        return False
    if not path.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp")):
        return False
    return Path(path).name not in NOISE_FILENAMES


def filename(url: str) -> str:
    return Path(urllib.parse.urlparse(url).path).name.lower()


def probe_chapter(slug: str, chapter: int) -> dict:
    """Try every candidate URL until one returns 200. Collect Precept-hosted
    images from that page."""
    last_error: str | None = None
    for url in candidates(slug, chapter):
        try:
            html = fetch(url)
        except Exception as e:
            last_error = f"{type(e).__name__}: {e}"
            continue
        ex = ImgExtractor()
        ex.feed(html)
        images: list[str] = []
        seen = set()
        for src in ex.srcs:
            abs_src = normalize(src, url)
            if not is_precept_image(abs_src):
                continue
            if abs_src in seen:
                continue
            seen.add(abs_src)
            images.append(abs_src)
        return {"url": url, "images": images}
    return {"url": None, "images": [], "error": last_error or "no candidate matched"}


def probe_book(slug: str) -> dict:
    n_chapters = CHAPTERS_PER_BOOK.get(slug)
    if not n_chapters:
        return {"slug": slug, "error": "unknown chapter count"}
    print(f"\n=== {slug}  ({n_chapters} chapters)")
    chapters: dict[str, dict] = {}
    fn_counter: Counter[str] = Counter()
    # Fan out chapter probes 4-wide. Precept Austin's WAF accepts modest
    # concurrency without throttling; this brings a 1000-chapter run from
    # ~15 min to ~4 min.
    with ThreadPoolExecutor(max_workers=4) as ex:
        results = list(ex.map(lambda c: (c, probe_chapter(slug, c)),
                              range(1, n_chapters + 1)))
    for c, info in results:
        chapters[str(c)] = info
        if info["images"]:
            for img in info["images"]:
                fn_counter[filename(img)] += 1
            tag = info["url"].split("/")[-1] if info["url"] else "?"
            print(f"   ch {c:>2}  ✓  {tag}  imgs={len(info['images'])}")
        else:
            print(f"   ch {c:>2}  ✗  {info.get('error','no images')}")
    # Filenames that appear on EVERY chapter page are the book-level chart;
    # those that appear on a *subset* are chapter-specific candidates.
    book_level = sorted([fn for fn, n in fn_counter.items() if n == n_chapters])
    chapter_specific = sorted([fn for fn, n in fn_counter.items() if 0 < n < n_chapters])
    print(f"   book-level imgs:        {book_level or '(none)'}")
    print(f"   chapter-specific imgs:  {chapter_specific or '(none)'}")
    return {
        "slug": slug,
        "n_chapters": n_chapters,
        "chapters": chapters,
        "book_level_filenames": book_level,
        "chapter_specific_filenames": chapter_specific,
    }


def main() -> None:
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    # --all probes every one of the 66 canonical Protestant books. The old
    # `PRECEPT_CHARTS`-only mode is kept as --covered for quick reprobes.
    if args == ["--all"]:
        slugs = list(CHAPTERS_PER_BOOK.keys())
    elif args == ["--covered"]:
        slugs = list(PRECEPT_CHARTS.keys())
    else:
        slugs = args
    out = {slug: probe_book(slug) for slug in slugs}
    OUT_PATH.write_text(json.dumps(out, indent=2, ensure_ascii=False))
    print(f"\n✓ Wrote {OUT_PATH}")
    # Concise summary at the end so it's easy to spot useful books.
    print("\n=== summary ===")
    for slug, data in out.items():
        if isinstance(data, dict) and "chapter_specific_filenames" in data:
            cs = data["chapter_specific_filenames"]
            print(f"  {slug:18}  chapter-specific charts: {len(cs):>2}  ({', '.join(cs[:6])}{'...' if len(cs) > 6 else ''})")
        else:
            print(f"  {slug:18}  --")


if __name__ == "__main__":
    main()
