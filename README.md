# VerseMate web reader

[VerseMate](https://versemate.org) is a Bible reading app: every chapter of all 66 books with its text, a summary and a verse-by-verse explanation, on the web, iOS and Android.

- Website: https://versemate.org
- Read the Bible: https://app.versemate.org
- Example chapters: [Genesis 1](https://app.versemate.org/bible/genesis/1), [Psalm 23](https://app.versemate.org/bible/psalms/23), [John 3](https://app.versemate.org/bible/john/3), [Romans 12](https://app.versemate.org/bible/romans/12)

This repository is the web reader at [app.versemate.org](https://app.versemate.org): a React app for reading the Bible with its explanations, notes, highlights and bookmarks, the life of Jesus and Bible topics, and the Bible Coach portal for study leaders. A Cloudflare Worker serves it and renders each chapter, Jesus event and topic page on the server, with a Markdown version of each and an `llms.txt` for AI assistants.

Setup and the development loop are in [DEVELOPMENT.md](DEVELOPMENT.md).
