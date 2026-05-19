"""Download the curated chapter-level Precept Austin charts.

Reads precept_chapter_curated.json (built by curate_precept_chapters.py
from the probe output) and downloads each shortlisted image into the
right per-book directory, deduplicating by source URL so a chart reused
across many chapters (e.g. rev_map.png on every Revelation chapter) is
only stored once.

Output layout under public/visuals/<slug>/:
  precept_<safe-stem>.<ext>      (one file per unique source URL)

The mapping from chapter → which precept_* file(s) to display lives in
the curated JSON, which build_manifests.py reads to emit chapter-range
manifest entries. Filenames don't carry chapter numbers because the
same chart often spans many chapters.

Run from repo root:
  python3 scripts/visuals-ingest/ingest_precept_chapters.py
  python3 scripts/visuals-ingest/ingest_precept_chapters.py --dry-run
  python3 scripts/visuals-ingest/ingest_precept_chapters.py 2-kings daniel
"""
from __future__ import annotations

import io
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
PUBLIC_VISUALS = ROOT / "public" / "visuals"
CURATED_IN = HERE / "precept_chapter_curated.json"

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36 VerseMate-ingest/1.0")
MAX_WIDTH = 1600


def fetch_bytes(url: str) -> bytes:
    # Some upstream filenames contain literal spaces (e.g. "Tabernacle
    # schematic2.gif") that urllib's strict URL validator rejects. Re-
    # encode the path segment so the request goes through.
    parsed = urllib.parse.urlsplit(url)
    safe_path = urllib.parse.quote(urllib.parse.unquote(parsed.path), safe="/")
    safe_url = urllib.parse.urlunsplit(parsed._replace(path=safe_path))
    req = urllib.request.Request(safe_url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def save_image(raw: bytes, target: Path, source_ext: str) -> int:
    """Save image bytes to target, downscaling if wider than MAX_WIDTH.
    Returns the saved file size in bytes."""
    img = Image.open(io.BytesIO(raw))
    if img.mode == "RGBA" and target.suffix.lower() in {".jpg", ".jpeg"}:
        img = img.convert("RGB")
    w, h = img.size
    if w > MAX_WIDTH:
        ratio = MAX_WIDTH / w
        img = img.resize((MAX_WIDTH, int(h * ratio)), Image.LANCZOS)
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.suffix.lower() in {".jpg", ".jpeg"}:
        img.save(target, "JPEG", quality=85, optimize=True)
    elif target.suffix.lower() == ".gif":
        # PIL can't optimize-save animated GIFs reliably; keep originals.
        target.write_bytes(raw)
    else:
        img.save(target, "PNG", optimize=True)
    return target.stat().st_size


def ext_from_url(url: str) -> str:
    """Local extension for the saved file. We normalize .jpeg → .jpg
    and keep everything else as-is. Saving a .webp as .png is fine —
    PIL will recode it. Saving a .gif as .png loses animation, so we
    keep .gif."""
    suffix = Path(urllib.parse.urlparse(url).path).suffix.lower()
    if suffix in {".jpg", ".jpeg"}:
        return ".jpg"
    if suffix == ".gif":
        return ".gif"
    return ".png"


def safe_stem(filename: str) -> str:
    """Sanitize a Precept filename into a portable local stem."""
    base = Path(filename).stem
    out = []
    for ch in base.lower():
        if ch.isalnum() or ch in "-_":
            out.append(ch)
        else:
            out.append("_")
    stem = "".join(out).strip("_")
    # Collapse runs of underscores.
    while "__" in stem:
        stem = stem.replace("__", "_")
    return stem or "chart"


def collect_unique_urls(data: dict) -> dict[str, str]:
    """Return source-url → relative-filename, deduplicating across both
    book-level entries and per-chapter entries within one book."""
    out: dict[str, str] = {}
    for entry in data.get("book_level", []):
        url = entry["url"]
        if url in out:
            continue
        ext = ext_from_url(url)
        out[url] = f"precept_{safe_stem(entry['filename'])}{ext}"
    for ch_entries in data.get("per_chapter", {}).values():
        for entry in ch_entries:
            url = entry["url"]
            if url in out:
                continue
            ext = ext_from_url(url)
            out[url] = f"precept_{safe_stem(entry['filename'])}{ext}"
    return out


def ingest_book(slug: str, data: dict, dry_run: bool) -> tuple[int, int]:
    """Download every unique image for one book. Returns (saved, skipped)."""
    saved = 0
    skipped = 0
    book_dir = PUBLIC_VISUALS / slug
    # Reserve the book-level filename already owned by ingest_precept.py
    # — never overwrite it.
    reserved = {"precept_chart.png", "precept_chart.jpg", "precept_chart.gif"}
    url_map = collect_unique_urls(data)
    # Resolve filename collisions (different upstream files that happen
    # to share a safe_stem) by appending _b, _c, …
    seen: dict[str, str] = {}
    for url in list(url_map):
        name = url_map[url]
        if name in reserved or name in seen.values():
            stem, ext = name.rsplit(".", 1)
            for c in "bcdefghij":
                cand = f"{stem}_{c}.{ext}"
                if cand not in reserved and cand not in seen.values():
                    name = cand
                    break
        seen[url] = name
        url_map[url] = name

    for url, name in url_map.items():
        target = book_dir / name
        if target.exists():
            skipped += 1
            print(f"  · {slug:18}  {name}  (exists, skip)")
            continue
        if dry_run:
            print(f"  + {slug:18}  {name}  ← {url}")
            saved += 1
            continue
        try:
            raw = fetch_bytes(url)
            size = save_image(raw, target, target.suffix)
            print(f"  ✓ {slug:18}  {name}  ({size // 1024} KB)")
            saved += 1
            time.sleep(0.1)
        except Exception as e:
            print(f"  ✗ {slug:18}  {name}  FAILED: {e}", file=sys.stderr)
    return saved, skipped


def main() -> None:
    if not CURATED_IN.exists():
        raise SystemExit(
            f"Missing {CURATED_IN}. Run curate_precept_chapters.py first."
        )
    curated = json.loads(CURATED_IN.read_text())
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry_run = "--dry-run" in sys.argv[1:]
    filter_slugs = set(args) if args else None

    total_saved = 0
    total_skipped = 0
    for slug in sorted(curated):
        if filter_slugs and slug not in filter_slugs:
            continue
        saved, skipped = ingest_book(slug, curated[slug], dry_run)
        total_saved += saved
        total_skipped += skipped

    print()
    if dry_run:
        print(f"DRY RUN: would have downloaded {total_saved} new images")
    else:
        print(f"✓ Downloaded {total_saved} new images, "
              f"{total_skipped} already on disk")


if __name__ == "__main__":
    main()
