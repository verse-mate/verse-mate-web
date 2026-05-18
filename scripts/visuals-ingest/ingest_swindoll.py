"""Bulk-download Chuck Swindoll Bible charts for all 66 Bible books.

Source: https://insight.org/resources/bible (Insight for Living Ministries).
The CDN serves a PDF for every book at a predictable URL — verified by
HEAD-probing all 66 slugs in 2026-05.

This script:
  1. Downloads each book's PDF to a temp file
  2. Renders page 1 to a PNG thumbnail at 1600px width
  3. Saves the PNG to `public/visuals/<slug>/swindoll_chart.png`
  4. Does NOT keep the PDF locally — the manifest links the download
     button straight to the upstream CDN URL so updates flow through.

Run from repo root:
  python3 scripts/visuals-ingest/ingest_swindoll.py
"""
from __future__ import annotations

import io
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent.parent
PUBLIC_VISUALS = ROOT / "public" / "visuals"

# Map verse-mate-web slug (lowercase, hyphen-separated) → upstream CDN
# filename slug (CapitalCase). Most are mechanical; a few don't match.
SLUG_TO_CDN = {
    "genesis": "Genesis", "exodus": "Exodus", "leviticus": "Leviticus",
    "numbers": "Numbers", "deuteronomy": "Deuteronomy",
    "joshua": "Joshua", "judges": "Judges", "ruth": "Ruth",
    "1-samuel": "1-Samuel", "2-samuel": "2-Samuel",
    "1-kings": "1-Kings", "2-kings": "2-Kings",
    "1-chronicles": "1-Chronicles", "2-chronicles": "2-Chronicles",
    "ezra": "Ezra", "nehemiah": "Nehemiah", "esther": "Esther",
    "job": "Job", "psalms": "Psalms", "proverbs": "Proverbs",
    "ecclesiastes": "Ecclesiastes", "song-of-solomon": "Song-of-Solomon",
    "isaiah": "Isaiah", "jeremiah": "Jeremiah", "lamentations": "Lamentations",
    "ezekiel": "Ezekiel", "daniel": "Daniel",
    "hosea": "Hosea", "joel": "Joel", "amos": "Amos", "obadiah": "Obadiah",
    "jonah": "Jonah", "micah": "Micah", "nahum": "Nahum",
    "habakkuk": "Habakkuk", "zephaniah": "Zephaniah",
    "haggai": "Haggai", "zechariah": "Zechariah", "malachi": "Malachi",
    "matthew": "Matthew", "mark": "Mark", "luke": "Luke", "john": "John",
    "acts": "Acts", "romans": "Romans",
    "1-corinthians": "1-Corinthians", "2-corinthians": "2-Corinthians",
    "galatians": "Galatians", "ephesians": "Ephesians",
    "philippians": "Philippians", "colossians": "Colossians",
    "1-thessalonians": "1-Thessalonians", "2-thessalonians": "2-Thessalonians",
    "1-timothy": "1-Timothy", "2-timothy": "2-Timothy",
    "titus": "Titus", "philemon": "Philemon", "hebrews": "Hebrews",
    "james": "James", "1-peter": "1-Peter", "2-peter": "2-Peter",
    "1-john": "1-John", "2-john": "2-John", "3-john": "3-John",
    "jude": "Jude", "revelation": "Revelation",
}

CDN_BASE = "https://cdn.iflmedia.com/pdf/bible-charts"


def upstream_pdf_url(slug: str) -> str:
    cdn = SLUG_TO_CDN[slug]
    return f"{CDN_BASE}/{cdn}-Bible-chart.pdf"


def fetch_pdf(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 VerseMate-ingest/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def render_first_page(pdf_path: Path, out_png: Path, max_w: int = 1600) -> None:
    """Render page 1 of a PDF to a JPEG-quality PNG via pdftoppm (poppler).
    pdftoppm ships with macOS Preview / homebrew poppler."""
    # pdftoppm writes <prefix>-1.png for page 1
    with tempfile.TemporaryDirectory() as tmp:
        prefix = Path(tmp) / "page"
        subprocess.run(
            ["pdftoppm", "-png", "-r", "200", "-f", "1", "-l", "1",
             str(pdf_path), str(prefix)],
            check=True, capture_output=True,
        )
        rendered = Path(tmp) / "page-1.png"
        if not rendered.exists():
            # Some pdftoppm builds zero-pad; try the alt.
            alt = list(Path(tmp).glob("page-*.png"))
            if alt:
                rendered = alt[0]
        img = Image.open(rendered)
        if img.mode == "RGBA":
            img = img.convert("RGB")
        w, h = img.size
        if w > max_w:
            ratio = max_w / w
            img = img.resize((max_w, int(h * ratio)), Image.LANCZOS)
        out_png.parent.mkdir(parents=True, exist_ok=True)
        img.save(out_png, "PNG", optimize=True)


def main() -> None:
    total = len(SLUG_TO_CDN)
    print(f"Ingesting Swindoll charts for {total} books → {PUBLIC_VISUALS}\n")
    failed: list[str] = []
    for i, slug in enumerate(SLUG_TO_CDN.keys(), start=1):
        out_png = PUBLIC_VISUALS / slug / "swindoll_chart.png"
        if out_png.exists():
            size = out_png.stat().st_size // 1024
            print(f"  [{i:2}/{total}] {slug:18} → already exists ({size} KB)")
            continue
        url = upstream_pdf_url(slug)
        try:
            pdf_bytes = fetch_pdf(url)
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_pdf:
                tmp_pdf.write(pdf_bytes)
                tmp_pdf_path = Path(tmp_pdf.name)
            try:
                render_first_page(tmp_pdf_path, out_png)
                size = out_png.stat().st_size // 1024
                print(f"  [{i:2}/{total}] {slug:18} → {size} KB")
            finally:
                tmp_pdf_path.unlink(missing_ok=True)
        except Exception as e:
            print(f"  [{i:2}/{total}] {slug:18} FAILED: {e}", file=sys.stderr)
            failed.append(slug)

    print(f"\n✓ {total - len(failed)}/{total} Swindoll charts rendered")
    if failed:
        print(f"✗ Failed: {', '.join(failed)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
