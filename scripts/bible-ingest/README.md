# Bible Ingest

Downloads open-licensed Bible translations from [eBible.org](https://ebible.org)
and converts their USFM into VerseMate's `Chapter` JSON shape
(`{ book, bookId, chapter, verses: [{ number, text }], subtitles? }`).

The output is **staging data for the backend** — the `/bible/book/{bookId}/{chapter}`
API serves verse text, so these JSON files are meant to be loaded there. They are
**not** bundled into the web app, and `data/` + `output/` are git-ignored.

## Versions

Curated "best open version" per VerseMate language. Only public-domain or
CC BY / CC BY-SA texts are included — never NC, ND, or permission-only.

| Key | Language | eBible ID | Version | License | Books |
|-----|----------|-----------|---------|---------|-------|
| `KJV`    | en | `eng-kjv2006` | King James (Authorized) Version | Public Domain | 66 |
| `SCH51`  | de | `deu1951`     | Schlachter-Bibel 1951 | CC BY 4.0 | 66 |
| `LSG`    | fr | `fraLSG`      | Louis Segond 1910 | Public Domain | 66 |
| `TGLULB` | tl | `tglulb`      | Banal na Bibliya (Unlocked Literal Bible) | CC BY-SA 4.0 | 66 |
| `HCV`    | hi | `hincv`       | Hindi Contemporary Version (Biblica) | CC BY-SA 4.0 | 66 |
| `BLIV`   | pt | `porbr2018`   | Bíblia Livre | CC BY 3.0 | 66 |
| `RIV`    | it | `ita1927`     | Riveduta 1927 | Public Domain | 66 |
| `SYN`    | ru | `russyn`      | Синодальный перевод (Synodal) | Public Domain | 66 |
| `RVR09`  | es | `spaRV1909`   | Reina-Valera 1909 | Public Domain | 66 |
| `VDC`    | ro | `ron1924`     | Biblia Cornilescu 1924 | Public Domain | 66 |
| `UKRKL`  | uk | `ukr1871`     | Переклад Куліша | Public Domain | **NT only (27)** |

Notes:
- **NASB1995** (the current English text) is served from the licensed backend, not eBible.
- **NIV** and **ESV** are not on eBible (both copyrighted, not redistributable), so they're omitted.
- **Ukrainian** has no complete open Bible — `ukr1871` is the public-domain NT only.

## Usage

```bash
cd scripts/bible-ingest

python3 build.py --list          # show the registry + licence gate status
python3 build.py --self-test     # validate the USFM parser (no network)
python3 build.py --version LSG   # ingest one version
python3 build.py --all           # ingest every version

# Offline: parse a pre-downloaded zip
python3 build.py --version SCH51 --from-zip ./data/deu1951_usfm.zip
```

No third-party dependencies (Python 3.10+ standard library only). First run
downloads each `<id>_usfm.zip` into `./data/`; later runs reuse the cache.

> eBible.org may block some datacenter IPs (HTTP 403). If `--download` fails,
> fetch the `_usfm.zip` files manually from `https://ebible.org/Scriptures/`
> and pass them with `--from-zip`.

## Output

```
output/
  index.json                 # all ingested versions + metadata
  <KEY>/
    manifest.json            # key, license, attribution, book/chapter/verse counts
    <bookId>/<chapter>.json  # one Chapter per file
```

## License posture

Public-domain versions carry no obligations. The CC BY / BY-SA versions
(`SCH51`, `BLIV`, `TGLULB`, `HCV`) require the attribution line (recorded in
each `manifest.json`) to be shown in the app's credits screen; CC BY-SA also
means the generated JSON inherits the share-alike obligation. The licence gate
in `build.py` refuses to ingest anything that isn't freely redistributable.
