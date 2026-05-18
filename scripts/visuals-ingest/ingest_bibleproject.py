"""Bulk-download BibleProject posters for all 66 Bible books.

Maps the canonical Protestant book slugs to BibleProject's CDN URLs (scraped
from https://bibleproject.com/downloads/posters/). Some books share a single
poster (e.g. 1 & 2 Kings, 1 & 2 Corinthians) — those entries point at the
same CDN URL but get copied to each book's folder.

Run from repo root:
    python3 visual_aids/scripts/ingest_bibleproject.py
"""
from __future__ import annotations

import io
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent.parent
PUBLIC_VISUALS = ROOT / "public" / "visuals"

# slug -> (bookproject poster URL, display name for alt-text/manifest)
# YouTube IDs that I've verified (only James for now — others get poster only).
POSTERS: dict[str, tuple[str, str, str | None]] = {
    # Old Testament — canonical Protestant slug order
    "genesis":         ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/01-02%20Genesis_FNL.jpg", "Genesis", None),
    "exodus":          ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/03-04_Exodus_art_FNL.jpg", "Exodus", None),
    "leviticus":       ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/05-Leviticus-FNL-1.jpg", "Leviticus", None),
    "numbers":         ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/06-Numbers-FNL-1.jpg", "Numbers", None),
    "deuteronomy":     ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/07-Deuteronomy-FNL.jpg", "Deuteronomy", None),
    "joshua":          ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/08-Joshua-FNL.jpg", "Joshua", None),
    "judges":          ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/09-Judges_FNL.jpg", "Judges", None),
    "ruth":            ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/10%20Ruth%20FNL.jpg", "Ruth", None),
    "1-samuel":        ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/11-12-Samuel-FNL.jpg", "1 Samuel", None),
    "2-samuel":        ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/11-12-Samuel-FNL.jpg", "2 Samuel", None),
    "1-kings":         ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/13-14-Kings-FNL.jpg", "1 Kings", None),
    "2-kings":         ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/13-14-Kings-FNL.jpg", "2 Kings", None),
    "1-chronicles":    ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/41-Chronicles-FNL.jpg", "1 Chronicles", None),
    "2-chronicles":    ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/41-Chronicles-FNL.jpg", "2 Chronicles", None),
    "ezra":            ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/15-Ezra-Nehemiah-FNL.jpg", "Ezra", None),
    "nehemiah":        ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/15-Ezra-Nehemiah-FNL.jpg", "Nehemiah", None),
    "esther":          ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/16-Esther-FNL.jpg", "Esther", None),
    "job":             ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/17-Job-FNL.jpg", "Job", None),
    "psalms":          ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/18-Psalms-FNL.jpg", "Psalms", None),
    "proverbs":        ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/19-Proverbs-FNL.jpg", "Proverbs", None),
    "ecclesiastes":    ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/20_Ecclesiastes.jpg", "Ecclesiastes", None),
    "song-of-solomon": ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/21-Song-of-Songs-FNL.jpg", "Song of Songs", None),
    "isaiah":          ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/22-23-Isaiah-FNL.jpg", "Isaiah", None),
    "jeremiah":        ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/24_Jeremiah_hq.jpg", "Jeremiah", None),
    "lamentations":    ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/25-Lamentations-FNL.jpg", "Lamentations", None),
    "ezekiel":         ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/26-27-Ezekiel-FNL.jpg", "Ezekiel", None),
    "daniel":          ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/28-Daniel-FNL.jpg", "Daniel", None),
    "hosea":           ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/29-Hosea_FNL.jpg", "Hosea", None),
    "joel":            ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/30-Joel-FNL.jpg", "Joel", None),
    "amos":            ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/31-Amos-FNL.jpg", "Amos", None),
    "obadiah":         ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/32-Obadiah-FNL.jpg", "Obadiah", None),
    "jonah":           ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/33-Jonah-FNL.jpg", "Jonah", None),
    "micah":           ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/34-Micah-FNL.jpg", "Micah", None),
    "nahum":           ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/35-Nahum-FNL.jpg", "Nahum", None),
    "habakkuk":        ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/36-Habakkuk-FNL.jpg", "Habakkuk", None),
    "zephaniah":       ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/37-Zephaniah-FNL.jpg", "Zephaniah", None),
    "haggai":          ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/38-Haggai-FNL.jpg", "Haggai", None),
    "zechariah":       ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/39-Zechariah-FNL.jpg", "Zechariah", None),
    "malachi":         ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/40-Malachi-FNL.jpg", "Malachi", None),

    # New Testament
    "matthew":         ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/42-Matthew-FNL-1.jpg", "Matthew", None),
    "mark":            ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/44-Mark-FNL.jpg", "Mark", None),
    "luke":            ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/47-48-Luke-FNL.jpg", "Luke", None),
    "john":            ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/45-46-john-1.jpg", "John", None),
    "acts":            ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/49-Acts-FNL.jpg", "Acts", None),
    "romans":          ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/50_Romans.jpg", "Romans", None),
    "1-corinthians":   ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/52-53-Corinthians.jpg", "1 Corinthians", None),
    "2-corinthians":   ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/53-2-Corinthians-FNL2.jpg", "2 Corinthians", None),
    "galatians":       ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/54-Galatians-FNL.jpg", "Galatians", None),
    "ephesians":       ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/55-Ephesians-FNL.jpg", "Ephesians", None),
    "philippians":     ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/56-Philippians-FNL.jpg", "Philippians", None),
    "colossians":      ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/57%20Colossians%20PRF.jpg", "Colossians", None),
    "1-thessalonians": ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/59a-1-Thessalonians-FNL.jpg", "1 Thessalonians", None),
    "2-thessalonians": ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/59b-2-Thessalonians-FNL.jpg", "2 Thessalonians", None),
    "1-timothy":       ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/60-1-Timothy-FNL.jpg", "1 Timothy", None),
    "2-timothy":       ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/61-2-Timothy-FNL.jpg", "2 Timothy", None),
    "titus":           ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/62%20Titus%20FNL.jpg", "Titus", None),
    "philemon":        ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/58-Philemon-FNL-1.jpg", "Philemon", None),
    "hebrews":         ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/63-Hebrews-FNL.jpeg", "Hebrews", None),
    # James already has a verified YouTube ID + 3 extra cards — left as-is by
    # the manifest layer; this script just refreshes the poster file.
    "james":           ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/64-James_FNL.jpg", "James", "qn-hLHWwRYY"),
    "1-peter":         ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/65-1-Peter-FNL.jpg", "1 Peter", None),
    "2-peter":         ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/66-2-Peter-FNL.jpg", "2 Peter", None),
    "1-john":          ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/67-123-John.jpg", "1 John", None),
    "2-john":          ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/67-123-John.jpg", "2 John", None),
    "3-john":          ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/67-123-John.jpg", "3 John", None),
    "jude":            ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/68-Jude-FNL.jpg", "Jude", None),
    "revelation":      ("https://d1bsmz3sdihplr.cloudfront.net/media/Posters%20Download/69-70-Revelation-FNL.jpg", "Revelation", None),
}


def download_and_resize(url: str, target: Path, max_w: int = 1600) -> None:
    if target.exists():
        return  # idempotent — assume re-runs after partial failure
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 VerseMate-ingest/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read()
    img = Image.open(io.BytesIO(raw))
    if img.mode == "RGBA":
        img = img.convert("RGB")
    w, h = img.size
    if w > max_w:
        ratio = max_w / w
        img = img.resize((max_w, int(h * ratio)), Image.LANCZOS)
    target.parent.mkdir(parents=True, exist_ok=True)
    img.save(target, "JPEG", quality=82, optimize=True)


def main() -> None:
    print(f"Ingesting {len(POSTERS)} books → {PUBLIC_VISUALS}\n")
    failed: list[str] = []
    for i, (slug, (url, name, _yt)) in enumerate(POSTERS.items(), start=1):
        book_dir = PUBLIC_VISUALS / slug
        target = book_dir / "bibleproject_poster.jpg"
        try:
            download_and_resize(url, target)
            size = target.stat().st_size if target.exists() else 0
            print(f"  [{i:2}/{len(POSTERS)}] {slug:18} → {size//1024:>4}KB")
        except Exception as e:
            print(f"  [{i:2}/{len(POSTERS)}] {slug:18} FAILED: {e}", file=sys.stderr)
            failed.append(slug)
    print(f"\n✓ {len(POSTERS) - len(failed)}/{len(POSTERS)} posters downloaded")
    if failed:
        print(f"✗ Failed: {', '.join(failed)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
