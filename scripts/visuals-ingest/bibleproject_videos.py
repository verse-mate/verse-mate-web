"""BibleProject overview-video metadata for all 66 Bible books.

Source: cross-checked the master list at
https://andynaselli.com/short-animated-videos-that-summarize-each-book-of-the-bible
plus oEmbed verification of individual IDs.

Schema per slug:
    list[dict] where each dict has:
        - 'youtubeId': str
        - 'title': str  (e.g. "Genesis 1–11 — Overview")
        - 'chapterRange': [start, end] inclusive (1-based)

10 books have a multi-part overview split by chapter range:
  Genesis, Exodus, Isaiah, Ezekiel, Matthew, Luke, John, Acts,
  Romans, Revelation.

4 books are covered by combined videos (1-2 Kings, 1-2 Chronicles,
Ezra-Nehemiah, 1-3 John) — both slugs point at the same YouTube ID.

If `videos[]` is empty, the Visuals panel just omits the video card.
"""

# (chapter ranges follow KJV/standard chapter counts per book.)

VIDEOS: dict[str, list[dict]] = {
    # === OLD TESTAMENT ===
    "genesis": [
        {"youtubeId": "GQI72THyO5I", "title": "Genesis 1–11 — Overview",  "chapterRange": [1, 11]},
        {"youtubeId": "F4isSyennFo", "title": "Genesis 12–50 — Overview", "chapterRange": [12, 50]},
    ],
    "exodus": [
        {"youtubeId": "jH_aojNJM3E", "title": "Exodus 1–18 — Overview",  "chapterRange": [1, 18]},
        {"youtubeId": "oNpTha80yyE", "title": "Exodus 19–40 — Overview", "chapterRange": [19, 40]},
    ],
    "leviticus":       [{"youtubeId": "IJ-FekWUZzE", "title": "Leviticus — Overview",       "chapterRange": [1, 27]}],
    "numbers":         [{"youtubeId": "tp5MIrMZFqo", "title": "Numbers — Overview",         "chapterRange": [1, 36]}],
    "deuteronomy":     [{"youtubeId": "q5QEH9bH8AU", "title": "Deuteronomy — Overview",     "chapterRange": [1, 34]}],
    "joshua":          [{"youtubeId": "JqOqJlFF_eU", "title": "Joshua — Overview",          "chapterRange": [1, 24]}],
    "judges":          [{"youtubeId": "kOYy8iCfIJ4", "title": "Judges — Overview",          "chapterRange": [1, 21]}],
    "ruth":            [{"youtubeId": "0h1eoBeR4Jk", "title": "Ruth — Overview",            "chapterRange": [1, 4]}],
    "1-samuel":        [{"youtubeId": "QJOju5Dw0V0", "title": "1 Samuel — Overview",        "chapterRange": [1, 31]}],
    "2-samuel":        [{"youtubeId": "YvoWDXNDJgs", "title": "2 Samuel — Overview",        "chapterRange": [1, 24]}],
    # Kings is a single combined video for both books.
    "1-kings":         [{"youtubeId": "bVFW3wbi9pk", "title": "1–2 Kings — Overview",       "chapterRange": [1, 22]}],
    "2-kings":         [{"youtubeId": "bVFW3wbi9pk", "title": "1–2 Kings — Overview",       "chapterRange": [1, 25]}],
    # Chronicles ditto.
    "1-chronicles":    [{"youtubeId": "HR7xaHv3Ias", "title": "1–2 Chronicles — Overview",  "chapterRange": [1, 29]}],
    "2-chronicles":    [{"youtubeId": "HR7xaHv3Ias", "title": "1–2 Chronicles — Overview",  "chapterRange": [1, 36]}],
    # Ezra-Nehemiah combined.
    "ezra":            [{"youtubeId": "MkETkRv9tG8", "title": "Ezra–Nehemiah — Overview",   "chapterRange": [1, 10]}],
    "nehemiah":        [{"youtubeId": "MkETkRv9tG8", "title": "Ezra–Nehemiah — Overview",   "chapterRange": [1, 13]}],
    "esther":          [{"youtubeId": "JydNSlufRIs", "title": "Esther — Overview",          "chapterRange": [1, 10]}],
    "job":             [{"youtubeId": "xQwnH8th_fs", "title": "Job — Overview",             "chapterRange": [1, 42]}],
    "psalms":          [{"youtubeId": "j9phNEaPrv8", "title": "Psalms — Overview",          "chapterRange": [1, 150]}],
    "proverbs":        [{"youtubeId": "AzmYV8GNAIM", "title": "Proverbs — Overview",        "chapterRange": [1, 31]}],
    "ecclesiastes":    [{"youtubeId": "lrsQ1tc-2wk", "title": "Ecclesiastes — Overview",    "chapterRange": [1, 12]}],
    "song-of-solomon": [{"youtubeId": "4KC7xE4fgOw", "title": "Song of Songs — Overview",   "chapterRange": [1, 8]}],
    "isaiah": [
        {"youtubeId": "d0A6Uchb1F8", "title": "Isaiah 1–39 — Overview",  "chapterRange": [1, 39]},
        {"youtubeId": "_TzdEPuqgQg", "title": "Isaiah 40–66 — Overview", "chapterRange": [40, 66]},
    ],
    "jeremiah":     [{"youtubeId": "RSK36cHbrk0", "title": "Jeremiah — Overview",     "chapterRange": [1, 52]}],
    "lamentations": [{"youtubeId": "p8GDFPdaQZQ", "title": "Lamentations — Overview", "chapterRange": [1, 5]}],
    "ezekiel": [
        {"youtubeId": "R-CIPu1nko8", "title": "Ezekiel 1–33 — Overview",  "chapterRange": [1, 33]},
        {"youtubeId": "SDeCWW_Bnyw", "title": "Ezekiel 34–48 — Overview", "chapterRange": [34, 48]},
    ],
    "daniel":    [{"youtubeId": "9cSC9uobtPM", "title": "Daniel — Overview",    "chapterRange": [1, 12]}],
    "hosea":     [{"youtubeId": "kE6SZ1ogOVU", "title": "Hosea — Overview",     "chapterRange": [1, 14]}],
    "joel":      [{"youtubeId": "zQLazbgz90c", "title": "Joel — Overview",      "chapterRange": [1, 3]}],
    "amos":      [{"youtubeId": "mGgWaPGpGz4", "title": "Amos — Overview",      "chapterRange": [1, 9]}],
    "obadiah":   [{"youtubeId": "i4ogCrEoG5s", "title": "Obadiah — Overview",   "chapterRange": [1, 1]}],
    "jonah":     [{"youtubeId": "dLIabZc0O4c", "title": "Jonah — Overview",     "chapterRange": [1, 4]}],
    "micah":     [{"youtubeId": "MFEUEcylwLc", "title": "Micah — Overview",     "chapterRange": [1, 7]}],
    "nahum":     [{"youtubeId": "Y30DanA5EhU", "title": "Nahum — Overview",     "chapterRange": [1, 3]}],
    "habakkuk":  [{"youtubeId": "OPMaRqGJPUU", "title": "Habakkuk — Overview",  "chapterRange": [1, 3]}],
    "zephaniah": [{"youtubeId": "oFZknKPNvz8", "title": "Zephaniah — Overview", "chapterRange": [1, 3]}],
    "haggai":    [{"youtubeId": "juPvv_xcX-U", "title": "Haggai — Overview",    "chapterRange": [1, 2]}],
    "zechariah": [{"youtubeId": "_106IfO6Kc0", "title": "Zechariah — Overview", "chapterRange": [1, 14]}],
    "malachi":   [{"youtubeId": "HPGShWZ4Jvk", "title": "Malachi — Overview",   "chapterRange": [1, 4]}],

    # === NEW TESTAMENT ===
    "matthew": [
        {"youtubeId": "iriW0zX492c", "title": "Matthew 1–13 — Overview",  "chapterRange": [1, 13]},
        {"youtubeId": "VSVPCPK-Zf8", "title": "Matthew 14–28 — Overview", "chapterRange": [14, 28]},
    ],
    "mark": [{"youtubeId": "HGHqu9-DtXk", "title": "Mark — Overview", "chapterRange": [1, 16]}],
    "luke": [
        {"youtubeId": "XIb_dCIxzr0", "title": "Luke 1–9 — Overview",   "chapterRange": [1, 9]},
        {"youtubeId": "26z_KhwNdD8", "title": "Luke 10–24 — Overview", "chapterRange": [10, 24]},
    ],
    "john": [
        {"youtubeId": "G-2e9mMf7E8", "title": "John 1–12 — Overview",  "chapterRange": [1, 12]},
        {"youtubeId": "RUfh_wOsauk", "title": "John 13–21 — Overview", "chapterRange": [13, 21]},
    ],
    "acts": [
        {"youtubeId": "CGbNw855ksw", "title": "Acts 1–12 — Overview",  "chapterRange": [1, 12]},
        {"youtubeId": "Z-17KxpjL0Q", "title": "Acts 13–28 — Overview", "chapterRange": [13, 28]},
    ],
    "romans": [
        {"youtubeId": "6KrQ1ZwUlPU", "title": "Romans 1–4 — Overview",  "chapterRange": [1, 4]},
        {"youtubeId": "ZuEsGgIFdso", "title": "Romans 5–16 — Overview", "chapterRange": [5, 16]},
    ],
    "1-corinthians":   [{"youtubeId": "veU6dB3996o", "title": "1 Corinthians — Overview",   "chapterRange": [1, 16]}],
    "2-corinthians":   [{"youtubeId": "3lfPK2vfC54", "title": "2 Corinthians — Overview",   "chapterRange": [1, 13]}],
    "galatians":       [{"youtubeId": "vmx4UjRFp0M", "title": "Galatians — Overview",       "chapterRange": [1, 6]}],
    "ephesians":       [{"youtubeId": "Y71r-T98E2Q", "title": "Ephesians — Overview",       "chapterRange": [1, 6]}],
    "philippians":     [{"youtubeId": "oE9qqW1-BkU", "title": "Philippians — Overview",     "chapterRange": [1, 4]}],
    "colossians":      [{"youtubeId": "pXTXlDxQsvc", "title": "Colossians — Overview",      "chapterRange": [1, 4]}],
    "1-thessalonians": [{"youtubeId": "No7Nq6IX23c", "title": "1 Thessalonians — Overview", "chapterRange": [1, 5]}],
    "2-thessalonians": [{"youtubeId": "kbPBDKOn1cc", "title": "2 Thessalonians — Overview", "chapterRange": [1, 3]}],
    "1-timothy":       [{"youtubeId": "7RoqnGcEjcs", "title": "1 Timothy — Overview",       "chapterRange": [1, 6]}],
    "2-timothy":       [{"youtubeId": "urlvnxCaL00", "title": "2 Timothy — Overview",       "chapterRange": [1, 4]}],
    "titus":           [{"youtubeId": "qgAZH5ExwrM", "title": "Titus — Overview",           "chapterRange": [1, 3]}],
    "philemon":        [{"youtubeId": "aW9Q3Jt6Yvk", "title": "Philemon — Overview",        "chapterRange": [1, 1]}],
    "hebrews":         [{"youtubeId": "z9wqN-nwSzE", "title": "Hebrews — Overview",         "chapterRange": [1, 13]}],
    "james":           [{"youtubeId": "qn-hLHWwRYY", "title": "James — Overview",           "chapterRange": [1, 5]}],
    "1-peter":         [{"youtubeId": "WhP7AZQlzCg", "title": "1 Peter — Overview",         "chapterRange": [1, 5]}],
    "2-peter":         [{"youtubeId": "wWLv_ITyKYc", "title": "2 Peter — Overview",         "chapterRange": [1, 3]}],
    # 1-3 John combined video.
    "1-john":          [{"youtubeId": "l3QkE6nKylM", "title": "1–3 John — Overview",        "chapterRange": [1, 5]}],
    "2-john":          [{"youtubeId": "l3QkE6nKylM", "title": "1–3 John — Overview",        "chapterRange": [1, 1]}],
    "3-john":          [{"youtubeId": "l3QkE6nKylM", "title": "1–3 John — Overview",        "chapterRange": [1, 1]}],
    "jude":            [{"youtubeId": "6UoCmakZmys", "title": "Jude — Overview",            "chapterRange": [1, 1]}],
    "revelation": [
        {"youtubeId": "5nvVVcYD-0w", "title": "Revelation 1–11 — Overview",  "chapterRange": [1, 11]},
        {"youtubeId": "QpnIrbq2bKo", "title": "Revelation 12–22 — Overview", "chapterRange": [12, 22]},
    ],
}
