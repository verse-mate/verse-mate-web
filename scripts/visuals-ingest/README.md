# visuals-ingest

Pipeline that produces every asset under `public/visuals/<book>/` and the
TypeScript registry at `src/data/visuals/registry.ts` consumed by the
`VisualsPanel` component.

## Three steps, run from the repo root

```bash
# 1. Download all 66 BibleProject overview posters
python3 scripts/visuals-ingest/ingest_bibleproject.py

# 2. Generate the auto-keyword heatmaps from the lexicon
python3 scripts/visuals-ingest/generate_heatmaps.py

# 3. Build the TypeScript manifest registry
python3 scripts/visuals-ingest/build_manifests.py
```

After step 3, the React app picks up every new entry on the next reload —
nothing else to wire by hand.

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
