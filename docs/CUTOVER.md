# Phase 7 cutover runbook — `app.versemate.org` → `verse-mate-web`

This document describes the order-of-operations to flip `app.versemate.org` from the monorepo's `apps/frontend-next` Worker to this repo's `verse-mate-web-production` Worker.

## Prerequisites

- [ ] Phases 1–5 merged into `main` of `verse-mate/verse-mate-web`
- [ ] Smoke-tested the production-env deploy on the workers.dev URL (`verse-mate-web-production.workers.dev`)
- [ ] Confirmed cookies set there are visible to the app (sign in, refresh, see persisted session)
- [ ] Walked through the test plan in PRs #24 (SEO redirects) and #25 (cookie auth)

## Why two repos can't bind the same domain

Cloudflare allows only one Worker per custom-domain route. Trying to deploy `verse-mate-web-production` with `pattern: app.versemate.org` while the monorepo's `verse-mate-production` Worker still owns the route will fail at deploy time with `domain already bound to another Worker`.

So the cutover must release the domain on the monorepo side **before** binding it here.

## Order of operations

### Step 1 — Release the domain on the monorepo side (`verse-mate/verse-mate`)

Open a PR against `verse-mate/verse-mate` with these changes to `apps/frontend-next/wrangler.jsonc`:

```diff
   "production": {
     "name": "verse-mate-production",
     "vars": {
       "API_URL": "https://api.versemate.org",
-      "APP_URL": "https://app.versemate.org",
+      "APP_URL": "https://admin.versemate.org",
       ...
     },
     "routes": [
       {
-        "pattern": "app.versemate.org",
+        "pattern": "admin.versemate.org",
         "custom_domain": true
       }
     ]
   }
```

Merging this PR + running the prod deploy releases `app.versemate.org` and binds `admin.versemate.org` to the existing Next.js app, which is exactly what we want — admin-only stays on Next.js.

(Cloudflare DNS for `admin.versemate.org` needs to exist as a CNAME or proxied record before this deploy succeeds. One-time setup in the CF dashboard.)

### Step 2 — Bind the domain here

Once Step 1 has deployed and `app.versemate.org` no longer routes to the monorepo Worker:

```bash
# From verse-mate-web root, on main, with this PR merged:
bun install
bunx vite build
bunx wrangler deploy --env production
```

This deploys `verse-mate-web-production` with the new `app.versemate.org` route binding. CF starts routing traffic to the new Worker within seconds.

### Step 3 — Disable the obsolete CI job

In `verse-mate/verse-mate/.github/workflows/build.yml`, the `lovable-cloudflare-deploy` and `lovable-cloudflare-deploy-preview` jobs still target the staging Worker that powers `staging.versemate.org`. They're fine to keep running for now (staging stays on the Lovable codebase from the monorepo for reviews).

Eventually we'll want to delete the `apps/lovable/` folder from the monorepo — that's a non-urgent follow-up, not part of cutover.

## Rollback

If anything is wrong on production after Step 2:

1. **Revert this PR** in `verse-mate-web` (drop the `routes` block again from `wrangler.jsonc`)
2. **Revert the monorepo PR** (restore `app.versemate.org` route to `frontend-next/wrangler.jsonc`)
3. Re-deploy both Workers

Total rollback time: ~5 minutes. CF cuts over near-instantly.

## What survives a rollback unchanged

- User sessions (cookies) — both Workers read the same `accessToken` / `refreshToken` cookies thanks to Phase 4
- SEO — frontend-next has the same URL shape Phase 3 added, so users land on the same routes
- Analytics — same PostHog project key on both sides
