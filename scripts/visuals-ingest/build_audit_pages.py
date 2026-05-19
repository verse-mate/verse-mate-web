"""Generate a contact-sheet audit HTML per book under
scripts/visuals-ingest/audit/.

Each book gets a single self-contained HTML file with every Precept
Austin image visible inline (loaded from the local public/visuals/
tree), labeled with filename + the chapter scope build_manifests will
emit. Mark images for removal via the checkbox; click "Copy denylist"
to copy a Python snippet you can paste back into the curate script's
PER_BOOK_FILENAME_DENYLIST.

Run from repo root:
  python3 scripts/visuals-ingest/build_audit_pages.py
  open scripts/visuals-ingest/audit/index.html
"""
from __future__ import annotations

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
PUBLIC_VISUALS = ROOT / "public" / "visuals"
AUDIT_DIR = HERE / "audit"
CURATED = HERE / "precept_chapter_curated.json"


PAGE_CSS = """
:root { color-scheme: dark; --bg: #0e1116; --card: #1a1f29; --muted: #8a93a6;
        --accent: #c5a572; --danger: #ff5d6c; --bd: #2a2f3a; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: #e8ecf1;
       font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; }
header { position: sticky; top: 0; background: rgba(14,17,22,0.95);
         backdrop-filter: blur(8px); padding: 16px 24px; z-index: 10;
         border-bottom: 1px solid var(--bd); display: flex;
         align-items: center; gap: 24px; flex-wrap: wrap; }
header h1 { margin: 0; font-size: 18px; }
header .stats { color: var(--muted); font-size: 13px; }
header nav a { color: var(--accent); text-decoration: none; margin-right: 12px; }
header nav a:hover { text-decoration: underline; }
button { background: var(--accent); color: #1a1f29; border: 0;
         padding: 10px 18px; border-radius: 6px; font-weight: 600;
         cursor: pointer; font-size: 13px; }
button:hover { opacity: 0.9; }
button.danger { background: var(--danger); color: white; }
main { padding: 24px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px; }
.card { background: var(--card); border: 1px solid var(--bd);
        border-radius: 8px; overflow: hidden; transition: opacity 0.15s; }
.card.marked { opacity: 0.4; }
.card.marked .imgwrap::after { content: "✕ MARKED FOR DELETE";
        position: absolute; inset: 0; display: grid; place-items: center;
        background: rgba(255,93,108,0.55); color: white;
        font-weight: 700; letter-spacing: 1px; font-size: 14px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
.imgwrap { position: relative; background: #000; aspect-ratio: 4 / 3;
           overflow: hidden; display: flex; align-items: center;
           justify-content: center; }
.imgwrap img { max-width: 100%; max-height: 100%; object-fit: contain; }
.meta { padding: 12px 14px; }
.meta .fn { font-family: ui-monospace, "SF Mono", Menlo, monospace;
            font-size: 12px; color: #e8ecf1; word-break: break-all; }
.meta .scope { color: var(--muted); font-size: 11px;
              margin-top: 4px; text-transform: uppercase;
              letter-spacing: 0.5px; }
label.toggle { display: flex; align-items: center; gap: 8px;
              padding: 10px 14px; border-top: 1px solid var(--bd);
              cursor: pointer; user-select: none; font-size: 13px; }
label.toggle input { width: 18px; height: 18px; accent-color: var(--danger); }
footer { position: sticky; bottom: 0; background: rgba(14,17,22,0.95);
         backdrop-filter: blur(8px); padding: 14px 24px;
         border-top: 1px solid var(--bd); display: flex;
         gap: 12px; align-items: center; }
footer .count { color: var(--muted); margin-right: auto; }
pre.export { display: none; background: var(--card); border: 1px solid var(--bd);
             padding: 16px; border-radius: 6px; margin: 16px 24px;
             white-space: pre-wrap; font-family: ui-monospace, monospace;
             font-size: 12px; user-select: all; max-height: 40vh; overflow: auto; }
.section-head { margin: 24px 0 12px; padding-bottom: 8px;
               border-bottom: 1px solid var(--bd); color: var(--accent);
               font-size: 14px; letter-spacing: 1px;
               text-transform: uppercase; }
"""

PAGE_JS = """
const KEY = "audit-marks-" + document.body.dataset.slug;
const marks = new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
function updateCount() {
  document.getElementById("count").textContent =
    marks.size + " marked for delete";
}
function toggle(fn, el) {
  if (marks.has(fn)) { marks.delete(fn); }
  else { marks.add(fn); }
  el.closest(".card").classList.toggle("marked", marks.has(fn));
  localStorage.setItem(KEY, JSON.stringify([...marks]));
  updateCount();
}
document.querySelectorAll(".card").forEach(c => {
  const fn = c.dataset.fn;
  if (marks.has(fn)) c.classList.add("marked");
  const cb = c.querySelector("input[type=checkbox]");
  if (cb) cb.checked = marks.has(fn);
});
document.getElementById("export").addEventListener("click", () => {
  const slug = document.body.dataset.slug;
  const items = [...marks].sort();
  if (items.length === 0) {
    alert("Nothing marked.");
    return;
  }
  const lines = [
    `    "${slug}": {`,
    ...items.map(fn => `        ${JSON.stringify(fn)},`),
    `    },`,
  ];
  const out = lines.join("\\n");
  navigator.clipboard.writeText(out).then(() => {
    const pre = document.getElementById("export-out");
    pre.textContent = out;
    pre.style.display = "block";
    alert("Copied " + items.length + " filenames to clipboard.");
  });
});
document.getElementById("clear").addEventListener("click", () => {
  if (!confirm("Clear all marks for this book?")) return;
  marks.clear();
  localStorage.setItem(KEY, "[]");
  document.querySelectorAll(".card").forEach(c => c.classList.remove("marked"));
  document.querySelectorAll("input[type=checkbox]").forEach(c => c.checked = false);
  updateCount();
});
updateCount();
"""


def render_book_page(slug: str, display: str, entries: list[dict]) -> str:
    """Render the per-book audit page. Each entry has filename, scope label,
    score, and local image path."""
    cards = []
    for e in entries:
        scope = e["scope"]
        cards.append(f"""
        <div class="card" data-fn="{e['filename']}">
          <div class="imgwrap">
            <img loading="lazy" src="{e['src']}" alt="{e['filename']}">
          </div>
          <div class="meta">
            <div class="fn">{e['filename']}</div>
            <div class="scope">{scope}</div>
          </div>
          <label class="toggle">
            <input type="checkbox" onchange="toggle('{e['filename']}', this)">
            Mark for delete
          </label>
        </div>""")

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Audit: {display}</title>
<style>{PAGE_CSS}</style>
</head>
<body data-slug="{slug}">
<header>
  <h1>Audit · {display}</h1>
  <div class="stats">{len(entries)} images · click to mark</div>
  <nav><a href="index.html">← all books</a></nav>
</header>
<main>
  <div class="grid">{''.join(cards)}</div>
  <pre id="export-out" class="export"></pre>
</main>
<footer>
  <div class="count" id="count">0 marked for delete</div>
  <button id="clear" class="danger" type="button">Clear marks</button>
  <button id="export" type="button">Copy denylist snippet</button>
</footer>
<script>{PAGE_JS}</script>
</body>
</html>"""


INDEX_CSS = """
body { margin: 0; background: #0e1116; color: #e8ecf1;
       font: 14px/1.5 -apple-system, BlinkMacSystemFont, system-ui, sans-serif; }
header { padding: 32px 24px; border-bottom: 1px solid #2a2f3a; }
header h1 { margin: 0 0 8px; }
header p { margin: 0; color: #8a93a6; max-width: 56ch; }
ul { list-style: none; padding: 24px;
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
     gap: 12px; margin: 0; }
li a { display: flex; justify-content: space-between;
       align-items: baseline; padding: 14px 18px;
       background: #1a1f29; border: 1px solid #2a2f3a;
       border-radius: 6px; text-decoration: none; color: #e8ecf1;
       transition: border-color 0.15s; }
li a:hover { border-color: #c5a572; }
li a .count { color: #8a93a6; font-size: 12px;
              font-family: ui-monospace, monospace; }
"""


def render_index(books: list[tuple[str, str, int]]) -> str:
    rows = "".join(
        f'<li><a href="{slug}.html">{display} <span class="count">{n}</span></a></li>'
        for slug, display, n in books
    )
    total = sum(n for _, _, n in books)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Precept Visuals Audit</title>
<style>{INDEX_CSS}</style>
</head>
<body>
<header>
  <h1>Precept Visuals Audit</h1>
  <p>One contact sheet per book — {total:,} images across {len(books)} books. Click a book, scroll the grid, and check the box on anything you want removed. Use the "Copy denylist snippet" button at the bottom to grab a Python block to paste into PER_BOOK_FILENAME_DENYLIST.</p>
</header>
<ul>{rows}</ul>
</body>
</html>"""


# Display names mirrored from ingest_bibleproject.POSTERS so order matches
# the canonical Protestant table-of-contents.
from ingest_bibleproject import POSTERS  # type: ignore


def main() -> None:
    AUDIT_DIR.mkdir(exist_ok=True)
    curated = json.loads(CURATED.read_text()) if CURATED.exists() else {}
    books_summary: list[tuple[str, str, int]] = []

    for slug, (_url, display, _yt) in POSTERS.items():
        book_dir = PUBLIC_VISUALS / slug
        if not book_dir.exists():
            continue
        # Walk every precept_* file on disk (truth is the file system).
        files = sorted(book_dir.glob("precept_*"))
        if not files:
            continue
        # Build a lookup from upstream filename to its chapter scope from
        # the curated JSON, so we can label cards with where they show.
        book_data = curated.get(slug, {})
        scope_by_filename: dict[str, str] = {}
        for e in book_data.get("book_level", []):
            scope_by_filename[e["filename"].lower()] = "book-level"
        for ch_str, entries in book_data.get("per_chapter", {}).items():
            for e in entries:
                fn = e["filename"].lower()
                # Prefer the canonical chapters array if present.
                chs = e.get("chapters") or [int(ch_str)]
                chs_int = sorted(int(c) for c in chs)
                if len(chs_int) == 1:
                    label = f"chapter {chs_int[0]}"
                elif chs_int == list(range(chs_int[0], chs_int[-1] + 1)):
                    label = f"chapters {chs_int[0]}–{chs_int[-1]}"
                else:
                    label = f"chapters {', '.join(str(c) for c in chs_int)}"
                scope_by_filename[fn] = label

        entries = []
        for f in files:
            # `precept_chart.png` is the canonical book-level chart from
            # ingest_precept.PRECEPT_CHARTS; not always in the curated
            # JSON because that script writes it directly.
            upstream = f.name[len("precept_"):]
            if upstream == "chart.png":
                upstream_label = "(book-level Precept chart)"
                scope = "book-level"
            else:
                upstream_label = upstream
                scope = scope_by_filename.get(upstream.lower(), "(uncategorized)")
            entries.append({
                "filename": upstream,
                "src": f"../../../public/visuals/{slug}/{f.name}",
                "scope": scope,
                "display_name": upstream_label,
            })

        page = render_book_page(slug, display, entries)
        (AUDIT_DIR / f"{slug}.html").write_text(page)
        books_summary.append((slug, display, len(entries)))
        print(f"  {slug:18}  {len(entries):>4} images")

    (AUDIT_DIR / "index.html").write_text(render_index(books_summary))
    print(f"\n✓ Wrote audit pages for {len(books_summary)} books")
    print(f"  → open {AUDIT_DIR}/index.html")


if __name__ == "__main__":
    main()
