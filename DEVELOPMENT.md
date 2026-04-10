# VerseMate Mobile App — Claude Code Development Guide

How to develop the VerseMate Lovable prototype using Claude Code. This guide covers setup, the development loop, automation, and contributing PRs back to the production repo.

## Architecture

```
┌──────────────┐    git push     ┌───────────────────┐    2-way sync    ┌──────────┐
│  Claude Code  │ ─────────────▶ │ verse-mate/       │ ◀──────────────▶ │ Lovable  │
│  (local CLI)  │                │ versemate (GitHub) │                  │ (preview)│
└──────┬────────┘                └───────────────────┘                  └──────────┘
       │                                                                     │
       │  reads/writes source                                     live preview
       │  runs vite build                                         auto-deploys
       ▼                                                                     ▼
  Local filesystem                                                 Browser iframe
       │
       │  reads production source
       ▼
┌───────────────────┐
│ verse-mate/       │  ← production monorepo (READ-ONLY reference)
│ verse-mate        │     packages/frontend-base = component library
│ (cloned locally)  │     apps/frontend-next = Next.js web app
└───────────────────┘     apps/backend = API server
```

## Repos

| Repo | Purpose | Your access |
|---|---|---|
| `verse-mate/versemate` | Lovable prototype (this repo) | Read + Write |
| `verse-mate/verse-mate` | Production monorepo (backend + web frontend) | Read + Write |

## Quick Start

```bash
# 1. Clone the Lovable prototype
git clone https://github.com/verse-mate/versemate.git
cd versemate

# 2. Install dependencies
bun install

# 3. Start the dev server
bun run dev
# Opens at http://localhost:5173

# 4. Clone the production repo (for reference only)
cd ..
git clone --depth 1 https://github.com/verse-mate/verse-mate.git prod

# 5. Start Claude Code
cd versemate
claude
```

## Design Reference

The canonical design is the **Figma Mobile App section** (node `5162:5662`):

```
https://www.figma.com/design/GOiiI0yRby5mWqCji8e4pp/VerseMate?node-id=5162-5662
```

### Figma API access

```bash
# Set your Figma personal access token
export FIGMA_TOKEN="figd_..."

# Fetch the Mobile App section with full depth
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/GOiiI0yRby5mWqCji8e4pp/nodes?ids=5162:5662&depth=8"

# Export a specific frame as PNG
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/GOiiI0yRby5mWqCji8e4pp?ids=5147:5080&format=png&scale=2"
```

### Design tokens (from Figma JSON extraction)

```css
/* Frame backgrounds */
--frame-bg: #1B1B1B;

/* Headers */
--header-bg: #1A1A1A;

/* Content body */
--content-bg: #000000;

/* Cards, pill containers */
--card-bg: #323232;

/* Text */
--text-primary: #E7E7E7;
--text-muted: rgba(255, 255, 255, 0.6);

/* Accent */
--gold: #B09A6D;

/* Reading body (only screen with non-black content) */
--reading-bg: #F5F2EB;
```

### Typography

| Element | Font | Weight | Size | Color |
|---|---|---|---|---|
| Header book name | Roboto | 400 | 14px | #FFFFFF |
| Body title | Roboto | 500 | 24px | #E7E7E7 |
| Scripture verse text | Roboto Serif | 300 | 18px | #000 (on cream) |
| Verse numbers | Roboto | 400 | 12px | #3E464D |
| Tab pills | Roboto | 400 | 14px | #FFF / #000 |
| Progress label | Roboto | 400 | 8px | #B09A6D |
| Screen titles | Roboto | 500 | 18px | #FFFFFF |
| Commentary title | Inter | 700 | 20px | #FFFFFF |
| Commentary body | Inter | 400 | 16px | #FFFFFF |

## Backend API

Base URL: `https://api.versemate.org`

OpenAPI spec: `https://api.versemate.org/openapi/json`

### Key endpoints

```bash
# Bible content
GET /bible/books                              # All 66 books
GET /bible/book/{bookId}/{chapterNumber}      # Chapter text + subtitles
GET /bible/book/explanation/{bookId}/{ch}?explanationType=summary|byline|detailed

# Auto-highlights
GET /bible/auto-highlights/{bookId}/{ch}

# User data (requires auth)
GET /bible/book/bookmarks/{userId}
GET /bible/book/notes/{userId}
GET /bible/highlights/{userId}

# Topics
GET /topics/categories
GET /topics/search?category=EVENT&limit=50
GET /topics/{id}/references

# Auth
POST /auth/login { email, password }
POST /auth/sso { provider: "google", token, platform: "web" }
```

### Auth flow

The app uses Bearer JWT tokens stored in localStorage:

```
localStorage: versemate-access-token, versemate-refresh-token
```

On 401, the API client (`src/services/api.ts`) automatically tries `POST /auth/refresh` before failing.

## Development Workflow

### The Loop

```
1. You describe the change
2. Claude Code edits source files
3. Claude Code runs `bunx vite build` to verify
4. Claude Code commits + pushes to GitHub
5. Lovable auto-syncs (60s) and deploys preview
6. You QA in the preview, report bugs
7. Repeat from step 1
```

### Critical rule: always build before pushing

```bash
bunx vite build
```

A broken build = blank Lovable preview = wasted iteration. Claude Code should ALWAYS verify the build passes before pushing.

### One commit per logical change

Don't bundle 10 fixes into one commit. Each fix gets its own commit so regressions are easy to identify.

## File Structure

```
src/
├── components/           # Shared UI components
│   ├── AppLayout.tsx      # Phone frame shell (390x844)
│   ├── ScreenHeader.tsx   # Dark header bar with back arrow
│   ├── MarkdownBlock.tsx  # Lightweight markdown renderer
│   ├── ShareIcon.tsx      # Production iOS share icon SVG
│   ├── VerseInsightSheet.tsx  # Bottom sheet overlay
│   ├── EditNoteSheet.tsx      # Note editing sheet
│   ├── NoteOptionsSheet.tsx   # Note actions (Copy/Share/Edit/Delete)
│   ├── HighlightOptionsSheet.tsx
│   ├── AddNoteSheet.tsx
│   ├── VerseActions.tsx       # Verse long-press popup
│   └── BookSelector.tsx       # Search modal (OT/NT/Topics)
├── contexts/
│   └── AppContext.tsx     # Global state (useReducer + API sync)
├── pages/                # Route-level screens
│   ├── ReadingScreen.tsx
│   ├── CommentaryScreen.tsx
│   ├── MenuScreen.tsx
│   ├── BookmarksScreen.tsx
│   ├── NotesScreen.tsx
│   ├── HighlightsScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── TopicsScreen.tsx
│   ├── TopicEventsScreen.tsx
│   ├── TopicEventDetailScreen.tsx
│   ├── MostQuotedScreen.tsx
│   ├── AboutScreen.tsx
│   ├── GivingScreen.tsx
│   ├── HelpScreen.tsx
│   └── SignInScreen.tsx
├── services/
│   ├── api.ts            # Typed fetch client with auth
│   ├── bibleService.ts   # All API calls
│   ├── googleAuth.ts     # Google Identity Services
│   └── types.ts          # Domain types
└── index.css             # Design tokens + utility classes
```

## Contributing PRs to Production

When a feature is proven in the Lovable prototype, port it to the production repo:

### Setup

```bash
cd prod  # verse-mate/verse-mate clone
git checkout main && git pull origin main
git checkout -b feat/your-feature
```

### Key production paths

```
packages/frontend-base/src/
├── store/                    # nanostores atoms
├── ui/Settings/Settings.tsx  # Settings screen
├── ui/MainText/              # Bible text rendering
├── ui/Explanation/           # Commentary/insight
├── ui/Menu/                  # Menu sidebar
└── styles/vars.css           # Design tokens
```

### Lint before committing

The production repo uses Biome for linting. Always run with the project's own binary:

```bash
# Install deps (one time)
bun install

# Format + lint your changed files
./node_modules/.bin/biome check --write path/to/your/file.tsx

# Verify clean
./node_modules/.bin/biome check path/to/your/file.tsx
```

The pre-commit hook (husky + lint-staged) will run `biome check` and `tsc` automatically. If it fails, fix the issues before committing.

### Key gotchas

1. **No `@nanostores/react`** — use `useSyncExternalStore` from React instead:
   ```typescript
   import { useSyncExternalStore } from "react";
   import { myStore } from "../../store/my-store";

   const value = useSyncExternalStore(
     myStore.subscribe,
     () => myStore.get(),
   );
   ```

2. **Import order matters** — Biome enforces alphabetical import sorting. External packages first, then relative imports.

3. **Indentation** — 2 spaces (not tabs), configured in `biome.json`.

4. **JSX formatting** — Multi-attribute JSX elements must have attributes on separate lines.

### Creating the PR

```bash
git push origin feat/your-feature

gh pr create \
  --title "feat: Your feature title" \
  --base main \
  --body "## Summary
- What this does

## Changes
| File | What |
|---|---|
| path/to/file.tsx | Description |

## Test plan
- [ ] Step 1
- [ ] Step 2"
```

### Verifying CI passes

```bash
# Check PR status
gh pr checks <PR_NUMBER>

# If Build Frontend fails, get the error:
gh run view <RUN_ID> --log-failed | tail -30
```

## Environment Variables

```bash
# .env.local (create this file, not committed)
VITE_API_URL=https://api.versemate.org
VITE_GOOGLE_CLIENT_ID=94126503648-2fb9dakdfi8pmi8ep78bk5nsrv94db6o.apps.googleusercontent.com
```

## Automated Scripts

### Export Figma frames

```bash
# Export all 28 Mobile App frames as PNGs
export FIGMA_TOKEN="figd_..."
FILE_KEY="GOiiI0yRby5mWqCji8e4pp"
SECTION="5162:5662"

# Get frame IDs
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY/nodes?ids=$SECTION&depth=2" \
  | python3 -c "
import json, sys
d = json.load(sys.stdin)
section = d['nodes']['$SECTION']['document']
frames = [c for c in section['children'] if c['type']=='FRAME']
print(','.join(f['id'] for f in frames))
"
```

### Extract design tokens from Figma

```bash
# Extract exact colors, fonts, and sizes from a specific frame
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY/nodes?ids=FRAME_ID&depth=6" \
  | python3 extract_tokens.py
```

### Smoke test the API

```bash
# Verify Bible content loads
curl -s 'https://api.versemate.org/bible/book/1/1' | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(d['book']['name'], '- verses:', len(d['book']['chapters'][0]['verses']))
"

# Verify topics load
curl -s 'https://api.versemate.org/topics/categories'
```

## Troubleshooting

### Lovable preview is blank

1. Run `bunx vite build` locally — if it fails, fix the error
2. Run `bunx tsc --noEmit` — catches type errors vite misses
3. Push a trivial commit to force Lovable to rebuild:
   ```bash
   echo "/* $(date +%s) */" >> src/index.css
   git add . && git commit -m "chore: force rebuild" && git push
   ```

### API returns 404 for chapter text

The API currently doesn't support `versionKey` — omit it:
```
✗ GET /bible/book/1/1?versionKey=ESV  → 404
✓ GET /bible/book/1/1                  → 200
```

### Google SSO doesn't work in Lovable preview

The Lovable preview origin needs to be added as an **Authorized JavaScript origin** in Google Cloud Console for the OAuth client. Add:
- `https://*.lovableproject.com`
- `http://localhost:5173` (for local dev)

### Books appear in random order

The API returns books unsorted. Sort by `bookId`:
```typescript
books.sort((a, b) => a.bookId - b.bookId);
```

### Commentary body shows raw markdown

The API returns rich markdown. Use `MarkdownBlock` component or `CommentaryBody` to render headings, bold, blockquotes.

### Auto-highlights not showing

The API returns `{ success: true, data: [...] }` — the highlights are in `data`, not at the top level.
