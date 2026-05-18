# visuals-ingest

Pipeline that produces every asset under `public/visuals/<book>/` and the
TypeScript registry at `src/data/visuals/registry.ts` consumed by the
`VisualsPanel` component.

## Seven steps, run from the repo root

```bash
# 1. Download all 66 BibleProject overview posters
python3 scripts/visuals-ingest/ingest_bibleproject.py

# 2. Download Chuck Swindoll's Bible chart for every book (Insight for Living)
python3 scripts/visuals-ingest/ingest_swindoll.py

# 3. Download Precept Austin (Bruce Hurt) book-level charts (~40 books)
python3 scripts/visuals-ingest/ingest_precept.py

# 4. Per-chapter Precept Austin pipeline (probe → curate → ingest):
python3 scripts/visuals-ingest/probe_precept_chapters.py --all
python3 scripts/visuals-ingest/curate_precept_chapters.py
python3 scripts/visuals-ingest/ingest_precept_chapters.py

# 5. Generate the auto-keyword heatmaps from the lexicon
python3 scripts/visuals-ingest/generate_heatmaps.py

# 6. Build the TypeScript manifest registry
python3 scripts/visuals-ingest/build_manifests.py
```

After the final step, the React app picks up every new entry on the next
reload — nothing else to wire by hand. Each ingest step is idempotent and
skips files already on disk, so re-runs are cheap.

### Per-chapter Precept pipeline (step 4 in detail)

Precept Austin embeds different charts on each chapter's commentary
page. To pick them up at chapter granularity:

1. **probe_precept_chapters.py** walks every chapter URL for all 66
   books, listing each Precept-hosted `<img>` found on the page. Output:
   `probe_precept_chapters.json` (~5 MB; the raw discovery snapshot).
2. **curate_precept_chapters.py** scores each image by filename
   heuristics (strong hint = `chart`/`map`/`timeline`/`outline`/`chron`/
   `geo`/`dispens`/etc.; PNG bonus; negative hints for `_small`
   thumbnails and known share-icons) and splits results into
   *book-level* (chart reused on ≥50 % of chapters → surfaced once) vs
   *per-chapter* (chart specific to a small subset of chapters →
   chapter-scoped manifest entry). Output:
   `precept_chapter_curated.json` + `precept_chapter_curated.md`.
3. **ingest_precept_chapters.py** downloads each unique URL once into
   `public/visuals/<book>/precept_<safe-stem>.<ext>`. The same chart
   appearing on many chapters is stored once — the chapter mapping
   lives in the curated JSON, which `build_manifests.py` reads to emit
   chapter-scoped cards (`chapters: [n, …]` on each `VisualCard`).

## Requirements
- Python 3.10+
- `pillow` for image resize/save
- `matplotlib` for the heatmap renderer

Install with `pip install pillow matplotlib`.

## Adding a new book's video
Edit `POSTERS` in `ingest_bibleproject.py` — third tuple element is the
YouTube ID (or `None` for poster-only). Verify the ID with
`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json`.
Then re-run step 3.
