"""Generate per-book TypeScript visual manifests from public/visuals/<slug>/.

Output: src/data/visuals/registry.ts — a single file VisualsPanel imports.

For every book we have at least one external asset, generate a `cards: VisualCard[]`
entry plus a `videos: VideoEntry[]` array (each with a chapterRange). James
also keeps the hand-curated Swindoll chart, the James↔Proverbs parallels
card, and the auto-generated key-word heatmap. Every other book today is
external-only (BibleProject poster + BibleProject overview video[s]) —
custom Versemate originals will be layered in later book-by-book.

Run from repo root:
  python3 scripts/visuals-ingest/build_manifests.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
PUBLIC_VISUALS = ROOT / "public" / "visuals"
OUT_TS = ROOT / "src" / "data" / "visuals" / "registry.ts"
OUT_BOOKS_TS = ROOT / "src" / "data" / "visuals" / "booksWithVisuals.ts"

# Source-of-truth: same POSTERS table used by ingest_bibleproject.py +
# per-book video metadata with chapter ranges.
import urllib.parse

from ingest_bibleproject import POSTERS  # type: ignore
from bibleproject_videos import VIDEOS  # type: ignore
from ingest_precept import PRECEPT_CHARTS  # type: ignore

PRECEPT_CURATED_PATH = Path(__file__).resolve().parent / "precept_chapter_curated.json"


def _safe_stem(filename: str) -> str:
    """Mirror ingest_precept_chapters.safe_stem so manifest filenames
    match what was written to disk."""
    base = Path(filename).stem.lower()
    out = []
    for ch in base:
        out.append(ch if (ch.isalnum() or ch in "-_") else "_")
    stem = "".join(out).strip("_")
    while "__" in stem:
        stem = stem.replace("__", "_")
    return stem or "chart"


def _ext_from_url(url: str) -> str:
    s = Path(urllib.parse.urlparse(url).path).suffix.lower()
    if s in {".jpg", ".jpeg"}:
        return ".jpg"
    if s == ".gif":
        return ".gif"
    return ".png"


def _local_name(url: str, filename: str) -> str:
    """The exact local file the chapter ingest writes for a given source
    URL/filename pair."""
    return f"precept_{_safe_stem(filename)}{_ext_from_url(url)}"


def load_precept_chapter_data() -> dict:
    if not PRECEPT_CURATED_PATH.exists():
        return {}
    return json.loads(PRECEPT_CURATED_PATH.read_text())

# Books that ship a hand-curated VerseMate Original. James is the
# launch book; future books are added here only when their originals
# are produced and reviewed.
BOOKS_WITH_ORIGINALS: set[str] = {"james"}

# Populated in main() by load_precept_chapter_data() so book_cards() can
# read curated per-chapter Precept image data while staying side-effect
# free at import time.
PRECEPT_CHAPTERS: dict = {}


def book_videos(slug: str) -> list[dict]:
    """Return the BibleProject overview videos for a book. Each entry has a
    chapterRange the React component uses to pick the right video for the
    current chapter."""
    raw = VIDEOS.get(slug, [])
    return [{
        "youtubeId": v["youtubeId"],
        "title": v["title"],
        "embedUrl": f"https://www.youtube-nocookie.com/embed/{v['youtubeId']}?autoplay=1&rel=0&modestbranding=1",
        "page": f"https://bibleproject.com/videos/{slug}/",
        "chapterStart": v["chapterRange"][0],
        "chapterEnd": v["chapterRange"][1],
    } for v in raw]


def book_cards(slug: str, display: str) -> list[dict]:
    """List of VisualCard entries for a book, in display order. Today every
    book gets the BibleProject Read Scripture poster; James also gets its
    custom-curated cards."""
    book_dir = PUBLIC_VISUALS / slug
    if not book_dir.exists():
        return []
    cards: list[dict] = []

    # 1. BibleProject Read Scripture poster.
    poster = book_dir / "bibleproject_poster.jpg"
    if poster.exists():
        cards.append({
            "id": "bp-poster",
            "title": f"BibleProject — Read Scripture: {display}",
            "caption": (
                f"Hand-illustrated single-page overview of {display}, "
                "tracing the book's literary design and major themes."
            ),
            "thumb": f"/visuals/{slug}/bibleproject_poster.jpg",
            "full":  f"/visuals/{slug}/bibleproject_poster.jpg",
            "attribution": {
                "label": "BibleProject · CC BY-SA 4.0",
                "href":  f"https://bibleproject.com/guides/book-of-{slug}/",
            },
        })

    # 2. Chuck Swindoll's Bible chart — Insight for Living publishes a chart
    # for every book in the Protestant canon, all reachable via a predictable
    # CDN URL pattern. We render page 1 to a local PNG thumbnail; the
    # download link goes straight back to the upstream PDF.
    swindoll_png = book_dir / "swindoll_chart.png"
    if swindoll_png.exists():
        # The CDN uses TitleCase, hyphenated for multi-word slugs (matches
        # SLUG_TO_CDN in ingest_swindoll.py).
        cdn_book = "-".join(p.capitalize() for p in slug.split("-"))
        if slug == "song-of-solomon":
            cdn_book = "Song-of-Solomon"
        cards.append({
            "id": "swindoll-chart",
            "title": f"Chuck Swindoll — {display} Bible Chart",
            "caption": (
                f"Single-page structural chart of {display}, organizing the "
                "book by major sections, themes, and key verses. Free "
                "resource from Insight for Living Ministries."
            ),
            "thumb": f"/visuals/{slug}/swindoll_chart.png",
            "full":  f"/visuals/{slug}/swindoll_chart.png",
            "attribution": {
                "label": "Insight for Living Ministries",
                "href":  "https://insight.org/resources/bible",
            },
            "download": {
                "label": "Original PDF",
                "href":  f"https://cdn.iflmedia.com/pdf/bible-charts/{cdn_book}-Bible-chart.pdf",
            },
        })

    # 3. Precept Austin chart (Bruce Hurt). Only ~40 books have a
    # distinct chart upstream; the curated map in ingest_precept.py is the
    # source of truth for which ones ship.
    precept_png = book_dir / "precept_chart.png"
    if precept_png.exists() and slug in PRECEPT_CHARTS:
        source_image = (
            f"https://www.preceptaustin.org/files/images/{PRECEPT_CHARTS[slug]}"
        )
        cards.append({
            "id": "precept-chart",
            "title": f"Precept Austin — {display} Chart",
            "caption": (
                f"Bruce Hurt's inductive-study chart for {display}, mapping "
                "the book's flow, key themes, and turning points. Drawn from "
                "Precept Austin's free verse-by-verse commentary."
            ),
            "thumb": f"/visuals/{slug}/precept_chart.png",
            "full":  f"/visuals/{slug}/precept_chart.png",
            "attribution": {
                "label": "Precept Austin · Bruce Hurt",
                "href":  "https://www.preceptaustin.org/",
            },
            "download": {
                "label": "Source image",
                "href":  source_image,
            },
        })

    # 4. Precept Austin per-chapter charts (Bruce Hurt). Each unique source
    # image becomes one card; the `chapters` field below carries the list
    # of chapters that page embedded the chart on, so the React filter can
    # show only chapter-relevant cards. Book-level entries get `chapters`
    # omitted so they show on every chapter.
    if slug in PRECEPT_CHAPTERS:
        cdata = PRECEPT_CHAPTERS[slug]
        # First the book-level reused charts (one card, no chapter filter).
        seen_local: set[str] = set()
        for entry in cdata.get("book_level", []):
            local = _local_name(entry["url"], entry["filename"])
            target = book_dir / local
            if not target.exists() or local in seen_local:
                continue
            seen_local.add(local)
            cards.append({
                "id": f"precept-book-{Path(local).stem.removeprefix('precept_')}",
                "title": f"Precept Austin — {display} ({entry['filename']})",
                "caption": (
                    f"Bruce Hurt's chart embedded across multiple {display} "
                    "chapters on Precept Austin's commentary."
                ),
                "thumb": f"/visuals/{slug}/{local}",
                "full":  f"/visuals/{slug}/{local}",
                "attribution": {
                    "label": "Precept Austin · Bruce Hurt",
                    "href":  "https://www.preceptaustin.org/",
                },
                "download": {
                    "label": "Source image",
                    "href":  entry["url"],
                },
            })
        # Then the per-chapter ones — collect unique (filename, url) pairs
        # across all chapters in this book, with the union of chapters
        # they appear on.
        per_chapter_entries: dict[str, dict] = {}
        for chapter_str, entries in cdata.get("per_chapter", {}).items():
            for entry in entries:
                local = _local_name(entry["url"], entry["filename"])
                target = book_dir / local
                if not target.exists():
                    continue
                rec = per_chapter_entries.setdefault(local, {
                    "url": entry["url"],
                    "filename": entry["filename"],
                    "chapters": set(),
                })
                rec["chapters"].update(int(c) for c in entry.get("chapters", [chapter_str]))
        for local, rec in sorted(per_chapter_entries.items()):
            chapters_sorted = sorted(rec["chapters"])
            if len(chapters_sorted) == 1:
                ch_label = f"Chapter {chapters_sorted[0]}"
            elif chapters_sorted == list(range(chapters_sorted[0], chapters_sorted[-1] + 1)):
                ch_label = f"Chapters {chapters_sorted[0]}–{chapters_sorted[-1]}"
            else:
                ch_label = f"Chapters {', '.join(str(c) for c in chapters_sorted)}"
            cards.append({
                "id": f"precept-ch-{Path(local).stem.removeprefix('precept_')}",
                "title": f"Precept Austin — {display} {ch_label}",
                "caption": (
                    f"Bruce Hurt's commentary chart for {display} "
                    f"{ch_label.lower()} — {rec['filename']}."
                ),
                "thumb": f"/visuals/{slug}/{local}",
                "full":  f"/visuals/{slug}/{local}",
                "attribution": {
                    "label": "Precept Austin · Bruce Hurt",
                    "href":  "https://www.preceptaustin.org/",
                },
                "download": {
                    "label": "Source image",
                    "href":  rec["url"],
                },
                "chapters": chapters_sorted,
            })

    # 5. James-only hand-curated originals (Parallels + Heatmap). Swindoll
    # and Precept are covered above for every book that has them.
    if slug in BOOKS_WITH_ORIGINALS and slug == "james":
        parallels = book_dir / "versemate_james_proverbs_parallels.png"
        if parallels.exists():
            cards.append({
                "id": "vm-parallels",
                "title": "VerseMate Original — James & Proverbs",
                "caption": (
                    "Eight thematic parallels in NASB 1995 showing how James "
                    "drew his teaching from Solomon's wisdom well."
                ),
                "thumb": "/visuals/james/versemate_james_proverbs_parallels.png",
                "full":  "/visuals/james/versemate_james_proverbs_parallels.png",
                "attribution": {"label": "VerseMate Original", "href": "#"},
                "download": {
                    "label": "Print-ready PDF",
                    "href": "/visuals/james/versemate_james_proverbs_parallels.pdf",
                },
            })
        # James's heatmap uses the legacy filename predating the auto-generator.
        heatmap = book_dir / "versemate_james_keyword_heatmap.png"
        if heatmap.exists():
            cards.append({
                "id": "vm-heatmap",
                "title": "VerseMate Original — Architecture of James",
                "caption": (
                    "Dot-matrix heatmap of faith, works, tongue, and wisdom across all "
                    "108 verses. Chapter 2 = the faith/works debate; chapter 3 = the "
                    "tongue treatise."
                ),
                "thumb": "/visuals/james/versemate_james_keyword_heatmap.png",
                "full":  "/visuals/james/versemate_james_keyword_heatmap.png",
                "attribution": {"label": "VerseMate Original", "href": "#"},
                "download": {
                    "label": "Print-ready PDF",
                    "href": "/visuals/james/versemate_james_keyword_heatmap.pdf",
                },
            })

    return cards


def main() -> None:
    global PRECEPT_CHAPTERS
    PRECEPT_CHAPTERS = load_precept_chapter_data()
    OUT_TS.parent.mkdir(parents=True, exist_ok=True)
    entries: list[str] = []
    slugs_with_visuals: list[str] = []
    book_count = 0
    for slug, (_url, display, _yt) in POSTERS.items():
        cards = book_cards(slug, display)
        videos = book_videos(slug)
        if not cards and not videos:
            continue
        entry = {"videos": videos, "cards": cards}
        entries.append(f"  '{slug}': {json.dumps(entry, indent=2, ensure_ascii=False)},")
        slugs_with_visuals.append(slug)
        book_count += 1

    body = "\n".join(entries)
    ts = f"""/* eslint-disable */
/**
 * GENERATED FILE — do not edit by hand.
 *
 * Built by `scripts/visuals-ingest/build_manifests.py` from the assets in
 * public/visuals/<slug>/ plus the per-book metadata tables in the same
 * directory. To regenerate after adding new assets or videos:
 *
 *   python3 scripts/visuals-ingest/build_manifests.py
 *
 * Each book's `videos[]` entries carry an inclusive chapterRange so the
 * VisualsPanel can show the right BibleProject overview for the chapter
 * the user is currently reading (e.g. Genesis 5 → Part 1, Genesis 25 →
 * Part 2). Books with a single overview have one entry covering all
 * chapters; books without a verified YouTube ID have an empty array.
 */

export type VisualCard = {{
  id: string;
  title: string;
  caption: string;
  thumb: string;
  full: string;
  attribution: {{ label: string; href: string }};
  download?: {{ label: string; href: string }};
  /** Optional chapter-scope. When present, the card is only relevant for
   *  these chapters (used by Precept Austin per-chapter charts). Absent
   *  for book-level cards that apply to every chapter. */
  chapters?: number[];
}};

export type VideoEntry = {{
  youtubeId: string;
  title: string;
  embedUrl: string;
  page: string;
  /** Inclusive chapter range this video covers. */
  chapterStart: number;
  chapterEnd: number;
}};

export type VisualsManifest = {{
  videos: VideoEntry[];
  cards: VisualCard[];
}};

export const VISUALS_REGISTRY: Record<string, VisualsManifest> = {{
{body}
}};

// BOOKS_WITH_VISUALS is generated as a separate light-weight module
// (booksWithVisuals.ts) so the tab-visibility gate in DesktopLayout /
// CommentaryScreen can check membership without pulling the multi-MB
// registry into the initial JS bundle. Re-export here for any callers
// that still expect both from one module.
export {{ BOOKS_WITH_VISUALS }} from './booksWithVisuals';

/** Lookup helper — slug is matched case-insensitively. */
export function getVisualsForBook(slug: string): VisualsManifest | null {{
  return VISUALS_REGISTRY[slug.toLowerCase()] ?? null;
}}

/** Pick the BibleProject overview that covers the given chapter, or null
 *  if the book has no videos / the chapter falls outside every range
 *  (shouldn't happen — chapter ranges in the manifest are exhaustive
 *  for every book that has any video). */
export function getVideoForChapter(
  manifest: VisualsManifest | null,
  chapter: number,
): VideoEntry | null {{
  if (!manifest) return null;
  for (const v of manifest.videos) {{
    if (chapter >= v.chapterStart && chapter <= v.chapterEnd) return v;
  }}
  return manifest.videos[0] ?? null;
}}

/** Filter a book's cards to ones relevant to the given chapter. Cards
 *  with no `chapters` field apply to every chapter (book-level). Cards
 *  with `chapters` only show when the current chapter is in the list. */
export function getCardsForChapter(
  manifest: VisualsManifest | null,
  chapter: number,
): VisualCard[] {{
  if (!manifest) return [];
  return manifest.cards.filter(
    (c) => !c.chapters || c.chapters.includes(chapter),
  );
}}
"""
    OUT_TS.write_text(ts)
    print(f"✓ Wrote {OUT_TS}")
    print(f"  Books with visuals: {book_count}")

    # Emit a *tiny* companion module that holds nothing but the slug set.
    # The tab-visibility gate on the desktop + mobile commentary screens
    # imports only this module so the multi-MB VISUALS_REGISTRY can stay
    # behind a lazy() boundary inside VisualsPanel.
    slug_list = ",\n".join(f"  '{s}'" for s in slugs_with_visuals)
    light_ts = f"""/* eslint-disable */
/**
 * GENERATED FILE — do not edit by hand.
 *
 * Built by `scripts/visuals-ingest/build_manifests.py` alongside
 * registry.ts. This module exists ONLY so the tab-visibility check
 * (DesktopLayout.tsx, CommentaryScreen.tsx) can ask "does this book
 * have curated visuals?" without dragging the full VISUALS_REGISTRY
 * — and all of its image URLs, captions, chapter-scope arrays — into
 * the initial JS bundle.
 *
 *   import {{ BOOKS_WITH_VISUALS }} from '@/data/visuals/booksWithVisuals';
 *
 * VisualsPanel itself, which actually needs the registry, is lazy-loaded
 * by its consumers so the heavy module is only fetched on first open.
 */
export const BOOKS_WITH_VISUALS: ReadonlySet<string> = new Set<string>([
{slug_list},
]);
"""
    OUT_BOOKS_TS.write_text(light_ts)
    print(f"✓ Wrote {OUT_BOOKS_TS}")


if __name__ == "__main__":
    main()
